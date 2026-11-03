/**
 * Host half of the Design Studio bundle.
 *
 * The workbench itself is a Client module (client.js). It needs one thing only the
 * Host can give it: a durable place to keep a project, because a design project holds
 * real image bytes — imported photos live inside the project as data URLs. A browser
 * `localStorage` budget cannot hold that, and a blob URL dies with the page.
 *
 * So this half owns exactly one exact route:
 *
 *   POST /design-studio/state   { action: 'save', project } | { action: 'load' }
 *
 * The project is a single JSON document under `<DSH_HOME>/design-studio/project.json`,
 * written atomically (temporary file + rename) with the previous revision kept as
 * `project.prev.json`, so a crash mid-write can never leave a truncated project.
 * The Client keeps its own `localStorage` fallback for profiles where this route is
 * unreachable; it says so in the status bar when that happens.
 */

import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

const STATE_ROUTE = '/design-studio/state'
const MAX_BODY_BYTES = 256 * 1024 * 1024
const PROJECT_FILE = 'project.json'
const PREVIOUS_FILE = 'project.prev.json'

export const inject = ['webServer']

/* -------------------------------------------------------------------- paths -- */

function homeDirectory() {
  return homedir()
}

/** The Host's own data directory: `$DSH_HOME`, else the default `~/.dsh`. */
function dshHome() {
  const configured = process.env.DSH_HOME
  if (typeof configured === 'string' && configured.trim()) return configured.trim()
  return path.join(homeDirectory(), '.dsh')
}

function projectDirectory() {
  return path.join(dshHome(), 'design-studio')
}

function projectPath() {
  return path.join(projectDirectory(), PROJECT_FILE)
}

function previousPath() {
  return path.join(projectDirectory(), PREVIOUS_FILE)
}

/* ------------------------------------------------------------------ helpers -- */

function fail(message, status) {
  const error = new Error(message)
  error.status = status || 400
  return error
}

function sendJson(res, status, body, method) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  res.end(method === 'HEAD' ? undefined : payload)
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(fail('request body is too large', 413))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (error) => reject(error))
    req.on('aborted', () => reject(fail('request aborted', 400)))
  })
}

async function readJson(req) {
  const body = await readBody(req, MAX_BODY_BYTES)
  if (body.length === 0) return {}
  let value
  try {
    value = JSON.parse(body.toString('utf8'))
  } catch {
    throw fail('request body is not valid JSON', 400)
  }
  return value && typeof value === 'object' ? value : {}
}

function blockRejection(rejection) {
  return rejection === 403
}

/* -------------------------------------------------------------------- state -- */

function describeProject(project) {
  const designs = Array.isArray(project && project.designs) ? project.designs.length : 0
  const layers = Array.isArray(project && project.designs)
    ? project.designs.reduce((sum, design) => sum + (Array.isArray(design.layers) ? design.layers.length : 0), 0)
    : 0
  const bindings = project && project.bindings && typeof project.bindings === 'object' ? Object.keys(project.bindings).length : 0
  const assets = project && project.assets && typeof project.assets === 'object' ? Object.keys(project.assets).length : 0
  return { designs, layers, bindings, assets }
}

async function loadProject() {
  const file = projectPath()
  let info
  try {
    info = await stat(file)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { project: null, path: file, savedAt: null, bytes: 0, exists: false }
    }
    throw fail('cannot read the saved project: ' + String((error && error.message) || error), 500)
  }
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch (error) {
    throw fail('cannot read the saved project: ' + String((error && error.message) || error), 500)
  }
  let project = null
  try {
    project = JSON.parse(text)
  } catch {
    throw fail('the saved project file is not valid JSON', 422)
  }
  return { project, path: file, savedAt: info.mtime.toISOString(), bytes: info.size, exists: true }
}

async function saveProject(project) {
  if (!project || typeof project !== 'object' || !Array.isArray(project.designs)) {
    throw fail('invalid project payload: expected an object with a designs array', 400)
  }
  let payload
  try {
    payload = JSON.stringify(project)
  } catch (error) {
    throw fail('the project cannot be serialized: ' + String((error && error.message) || error), 400)
  }
  const directory = projectDirectory()
  await mkdir(directory, { recursive: true })
  const file = projectPath()
  const temporary = path.join(directory, `.${PROJECT_FILE}.${process.pid}.${Date.now()}.tmp`)
  await writeFile(temporary, payload, 'utf8')
  try {
    await unlink(previousPath())
  } catch (error) {
    if (!error || error.code !== 'ENOENT') {
      // A locked previous revision must not block this save.
      if (error && error.code !== 'EPERM') throw error
    }
  }
  try {
    await rename(file, previousPath())
  } catch (error) {
    if (!error || error.code !== 'ENOENT') {
      await unlink(temporary).catch(() => {})
      throw error
    }
  }
  await rename(temporary, file)
  const info = await stat(file)
  return { path: file, savedAt: info.mtime.toISOString(), bytes: info.size, summary: describeProject(project) }
}

/* -------------------------------------------------------------------- apply -- */

export function apply(ctx) {
  const guard = (req, res, method) => {
    const connection = ctx.get('connection')
    if (!connection || typeof connection.requestRejection !== 'function') return false
    let rejection
    try {
      rejection = connection.requestRejection({ headers: req.headers })
    } catch {
      rejection = undefined
    }
    if (!blockRejection(rejection)) return false
    sendJson(res, rejection, { ok: false, error: 'unauthorized' }, method)
    return true
  }

  const route = (pathname, handler) => {
    const listener = async (req, res) => {
      const method = (req.method || 'GET').toUpperCase()
      if (method !== 'POST' && method !== 'HEAD') {
        res.writeHead(405, { allow: 'POST', 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'method-not-allowed' }))
        return
      }
      if (guard(req, res, method)) return
      try {
        const payload = await handler(req, method)
        if (!res.writableEnded) sendJson(res, 200, payload, method)
      } catch (error) {
        const message = String((error && error.message) || error)
        const status = error && typeof error.status === 'number' ? error.status : 500
        if (!res.writableEnded) sendJson(res, status, { ok: false, error: message }, method)
      }
    }
    return ctx.effect(
      () => ctx.webServer.register({ kind: 'exact', path: pathname, handler: listener }),
      'design-studio: ' + pathname,
    )
  }

  route(STATE_ROUTE, async (req) => {
    const body = await readJson(req)
    const action = typeof body.action === 'string' ? body.action : 'load'
    if (action === 'save') {
      const saved = await saveProject(body.project)
      return { ok: true, action: 'save', ...saved }
    }
    if (action === 'load') {
      const loaded = await loadProject()
      return { ok: true, action: 'load', ...loaded, summary: describeProject(loaded.project) }
    }
    throw fail('unknown action: ' + action, 400)
  })
}
