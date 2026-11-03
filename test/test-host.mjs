/**
 * Host-half verification: the exact route the Client calls, the atomic on-disk
 * project, the previous-revision backup, and every error path.
 *
 * The route handler is invoked directly with fake req/res objects, which is the
 * same listener `ctx.webServer.register` would receive.
 */
import { Readable } from 'node:stream'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { check, checkDeep, report, resetCounters, engine as E } from './lib.mjs'
import { buildScenario } from './scenario.mjs'
import { apply, inject } from '../index.js'

resetCounters()

const home = mkdtempSync(path.join(tmpdir(), 'ds-home-'))
process.env.DSH_HOME = home

const routes = []
const effects = []
const ctx = {
  get() {
    return undefined
  },
  webServer: {
    register(spec) {
      routes.push(spec)
      return () => {}
    },
  },
  effect(fn, label) {
    effects.push(label)
    const dispose = fn()
    return () => {
      if (typeof dispose === 'function') dispose()
    }
  },
}

checkDeep('host declares webServer injection', inject, ['webServer'])
apply(ctx)

check('registers exactly one route', routes.length === 1)
checkDeep('route is exact', routes[0].kind, 'exact')
checkDeep('route path', routes[0].path, '/design-studio/state')
check('route handler is a function', typeof routes[0].handler === 'function')
check('route registration is scoped by an effect', effects.length === 1 && effects[0].includes('/design-studio/state'))

const handler = routes[0].handler

function makeRes() {
  return {
    status: 0,
    headers: null,
    body: '',
    writableEnded: false,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
    },
    end(body) {
      this.body = body === undefined || body === null ? '' : String(body)
      this.writableEnded = true
    },
  }
}

async function call(method, body) {
  const payload = body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body)
  const req = Readable.from(payload == null ? [] : [Buffer.from(payload, 'utf8')])
  req.method = method
  req.headers = { 'content-type': 'application/json' }
  const res = makeRes()
  await handler(req, res)
  let json = null
  try {
    json = res.body ? JSON.parse(res.body) : null
  } catch {
    json = null
  }
  return { status: res.status, headers: res.headers, body: res.body, json }
}

const scenario = await buildScenario()
const project = scenario.project

/* ---------- method gate ---------- */

const get = await call('GET')
checkDeep('GET is refused', get.status, 405)
check('405 allows POST', String(get.headers.allow) === 'POST')
checkDeep('405 body', get.json, { ok: false, error: 'method-not-allowed' })

/* ---------- first load on a fresh profile ---------- */

const empty = await call('POST', { action: 'load' })
checkDeep('empty load status', empty.status, 200)
checkDeep('empty load body', empty.json.project, null)
checkDeep('empty load exists flag', empty.json.exists, false)
checkDeep('empty load summary', empty.json.summary, { designs: 0, layers: 0, bindings: 0, assets: 0 })
check('empty load reports the project path', empty.json.path === path.join(home, 'design-studio', 'project.json'))

/* ---------- save ---------- */

const saved = await call('POST', { action: 'save', project })
checkDeep('save status', saved.status, 200)
checkDeep('save echoes the action', saved.json.action, 'save')
checkDeep('save summary', saved.json.summary, { designs: 3, layers: 7, bindings: 2, assets: 3 })
check('save reports a byte size', saved.json.bytes > 1000)

const onDisk = JSON.parse(readFileSync(saved.json.path, 'utf8'))
checkDeep('file keeps every design', onDisk.designs.length, 3)
checkDeep('file keeps the binding groups', Object.keys(onDisk.bindings).length, 2)
checkDeep('file keeps the assets', Object.keys(onDisk.assets).length, 3)
check('asset bytes are inlined, not referenced', onDisk.assets[Object.keys(onDisk.assets)[0]].dataUrl.startsWith('data:image/png;base64,'))

/* ---------- reload ---------- */

const loaded = await call('POST', { action: 'load' })
checkDeep('load status', loaded.status, 200)
checkDeep('load finds the project', loaded.json.exists, true)
checkDeep('load design sizes', loaded.json.project.designs.map((d) => [d.width, d.height]), [[1080, 1080], [1080, 1350], [1080, 1920]])
check('load keeps layer order', loaded.json.project.designs[0].layers.length === 3)

// The Client normalises whatever it gets back; bindings must survive that step.
const rehydrated = E.normalizeProject(loaded.json.project, 'fallback')
checkDeep('rehydrated designs', rehydrated.designs.length, 3)
checkDeep('rehydrated bindings', Object.keys(rehydrated.bindings).length, 2)
checkDeep('rehydrated members', E.bindingMembers(rehydrated, scenario.ids.bgBinding).length, 3)
check('rehydrated shared asset still resolves', E.bindingMembers(rehydrated, scenario.ids.bgBinding).every((m) => {
  const layer = E.findLayer(E.findDesign(rehydrated, m.designId), m.layerId)
  return E.resolveImageAssetId(rehydrated, layer) === scenario.assets.bgRed.id
}))

/* ---------- previous revision is kept ---------- */

const renamed = Object.assign({}, project, { name: '第二版' })
const second = await call('POST', { action: 'save', project: renamed })
checkDeep('second save status', second.status, 200)
const prevPath = path.join(home, 'design-studio', 'project.prev.json')
const previous = JSON.parse(readFileSync(prevPath, 'utf8'))
checkDeep('previous revision kept the old name', previous.name, '验收示例')
const latest = JSON.parse(readFileSync(second.json.path, 'utf8'))
checkDeep('latest revision has the new name', latest.name, '第二版')

/* ---------- error paths ---------- */

const badPayload = await call('POST', { action: 'save', project: { name: 'x' } })
checkDeep('project without designs rejected', badPayload.status, 400)
check('error names the expected payload', /expected an object with a designs array/.test(badPayload.json.error))

const brokenJson = await call('POST', '{not json')
checkDeep('malformed JSON is a bad request', brokenJson.status, 400)

const unknown = await call('POST', { action: 'nope' })
checkDeep('unknown action rejected', unknown.status, 400)
check('unknown action is named', /unknown action: nope/.test(unknown.json.error))

writeFileSync(second.json.path, '{ this is not json')
const corrupt = await call('POST', { action: 'load' })
checkDeep('corrupt project file reported', corrupt.status, 422)
check('corrupt message is explicit', /not valid JSON/.test(corrupt.json.error))

/* ---------- HEAD behaves like load without a body ---------- */

writeFileSync(second.json.path, JSON.stringify(renamed))
const head = await call('HEAD')
checkDeep('HEAD status', head.status, 200)
checkDeep('HEAD has no body', head.body, '')
check('HEAD sets content-length', Number(head.headers['content-length']) > 0)

/* ---------- no-store caching ---------- */

check('responses are not cached', String(saved.headers['cache-control']) === 'no-store')
check('responses are not sniffed', String(saved.headers['x-content-type-options']) === 'nosniff')

rmSync(home, { recursive: true, force: true })
report('host')
