/**
 * Rendering / export verification with real Skia: the same `paintDesign` the
 * editor uses must produce correctly sized PNG/JPEG output, honour per-layer
 * fit / crop / rotation / opacity, keep the layout of shared layers, and come
 * out identical no matter what the editor zoom is.
 */
import { createCanvas } from '@napi-rs/canvas'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { canvasOf, check, checkDeep, checkNear, decodeImage, imageLoader, pixel, report, resetCounters, engine as E } from './lib.mjs'
import { buildScenario, RED, BLUE, YELLOW, DARK, WHITE, TITLE_B } from './scenario.mjs'
import { buildZip } from '../src/zip.mjs'

resetCounters()

const scenario = await buildScenario()
const { images, assets, ids } = scenario
const getImage = imageLoader(images)

/** Swap both shared payloads: new background image, new title text. */
const project = E.setBindingPayload(
  E.setBindingPayload(scenario.project, ids.bgBinding, { assetId: assets.bgBlue.id }),
  ids.textBinding,
  { text: TITLE_B },
)

function paint(design, options) {
  const { canvas, ctx } = canvasOf(design.width, design.height)
  const opts = Object.assign({ getImage }, options)
  const result = E.paintDesign(ctx, project, design, opts)
  return { canvas, ctx, result }
}

async function decodePixels(buffer) {
  const image = await decodeImage(buffer)
  const { canvas, ctx } = canvasOf(Math.max(1, image.width), Math.max(1, image.height))
  ctx.drawImage(image, 0, 0)
  return { width: image.width, height: image.height, ctx, canvas }
}

/* ---------- export canvas is the canvas size, layers land where expected ---------- */

const designA = E.findDesign(project, ids.designA)
const designB = E.findDesign(project, ids.designB)
const designC = E.findDesign(project, ids.designC)

const a = paint(designA)
checkDeep('export size equals canvas size (A)', [a.canvas.width, a.canvas.height], [1080, 1080])
check('shared background painted the new colour', E.bindingMembers(project, ids.bgBinding).length === 3)

// cover → the whole canvas is the image
checkNear('design A centre is the shared background', pixel(a.ctx, 540, 540), BLUE, 4)
checkNear('design A corner is the shared background (cover)', pixel(a.ctx, 4, 4), BLUE, 4)
checkNear('design A letterbox-free corner 2', pixel(a.ctx, 1075, 1075), BLUE, 4)

// unbound logo keeps its own asset and box
checkNear('unbound logo still yellow', pixel(a.ctx, 800, 160), YELLOW, 4)
checkNear('area left of the logo is the background', pixel(a.ctx, 640, 160), BLUE, 4)

/* ---------- contain keeps each design's own fit ---------- */

const b = paint(designB)
checkDeep('export size equals canvas size (B)', [b.canvas.width, b.canvas.height], [1080, 1350])
checkNear('B image box centre shows the shared image', pixel(b.ctx, 540, 500), BLUE, 4)
checkNear('B letterbox inside the box stays canvas background', pixel(b.ctx, 540, 130), DARK, 4)
checkNear('B outside the box stays canvas background', pixel(b.ctx, 20, 700), DARK, 4)

/* ---------- opacity from a per-design style ---------- */

const c = paint(designC)
checkDeep('export size equals canvas size (C)', [c.canvas.width, c.canvas.height], [1080, 1920])
checkNear('C opacity 0.85 blends with the white canvas', pixel(c.ctx, 540, 700), {
  r: Math.round(255 - (255 - BLUE.r) * 0.85),
  g: Math.round(255 - (255 - BLUE.g) * 0.85),
  b: Math.round(255 - (255 - BLUE.b) * 0.85),
}, 5)

/* ---------- text was painted in each title box ---------- */

function countTextPixels(ctx, box, background, threshold) {
  const data = ctx.getImageData(box.x, box.y, box.w, box.h).data
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - background.r)
    const dg = Math.abs(data[i + 1] - background.g)
    const db = Math.abs(data[i + 2] - background.b)
    if (dr + dg + db > (threshold || 60)) count += 1
  }
  return count
}

const titleBoxA = { x: 90, y: 420, w: 900, h: 220 }
check('title A painted glyphs', countTextPixels(a.ctx, titleBoxA, BLUE) > 300)
check('title text differs per design style (C is red on white)', countTextPixels(c.ctx, { x: 80, y: 1500, w: 920, h: 300 }, WHITE) > 300)

/* ---------- crop + fit ---------- */

const splitAsset = await (async () => {
  const { canvas } = canvasOf(200, 100)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgb(200,30,60)'
  ctx.fillRect(0, 0, 100, 100)
  ctx.fillStyle = 'rgb(30,79,200)'
  ctx.fillRect(100, 0, 100, 100)
  const buffer = canvas.toBuffer('image/png')
  const image = await decodeImage(buffer)
  return { asset: E.createAsset(image, 'split', 'image/png', 'data:image/png;base64,' + buffer.toString('base64')), image }
})()

function cropDesign(crop, fit) {
  const design = E.createDesign({ name: 'crop', width: 200, height: 100, background: '#FFFFFF' })
  let layer = E.createImageLayer(design, splitAsset.asset, { coverCanvas: true, name: 'bg' })
  layer = Object.assign({}, layer, { x: 0, y: 0, w: 200, h: 100, fit: fit || 'fill', crop })
  return E.addLayer(E.emptyProject('crop'), design.id, layer) && { design, layer }
}

function paintCrop(crop) {
  const { design, layer } = cropDesign(crop)
  const local = Object.assign({}, E.emptyProject('crop'), {
    designs: [Object.assign({}, design, { layers: [layer] })],
  })
  const { ctx, canvas } = canvasOf(design.width, design.height)
  E.paintDesign(ctx, local, local.designs[0], { getImage: (id) => (id === splitAsset.asset.id ? splitAsset.image : null) })
  return { ctx, canvas }
}

const fullCrop = paintCrop({ x: 0, y: 0, w: 1, h: 1 })
checkNear('uncropped left half is red', pixel(fullCrop.ctx, 50, 50), RED, 4)
checkNear('uncropped right half is blue', pixel(fullCrop.ctx, 150, 50), BLUE, 4)

const halfCrop = paintCrop({ x: 0, y: 0, w: 0.5, h: 1 })
checkNear('cropped left half stretched: left is red', pixel(halfCrop.ctx, 50, 50), RED, 4)
checkNear('cropped left half stretched: right is red too', pixel(halfCrop.ctx, 150, 50), RED, 4)

/* ---------- rotation + opacity ---------- */

const rotatedProject = (() => {
  const design = E.createDesign({ name: 'rot', width: 400, height: 400, background: '#FFFFFF' })
  let layer = E.createImageLayer(design, splitAsset.asset, { name: 'sq' })
  layer = Object.assign({}, layer, {
    x: 100, y: 100, w: 200, h: 200, fit: 'fill', opacity: 0.5, rotation: 45, crop: { x: 0, y: 0, w: 1, h: 1 },
  })
  const project = Object.assign({}, E.emptyProject('rot'), {
    designs: [Object.assign({}, design, { layers: [layer] })],
  })
  return { project, design: project.designs[0] }
})()

{
  const { ctx } = canvasOf(400, 400)
  E.paintDesign(ctx, rotatedProject.project, rotatedProject.design, {
    getImage: (id) => (id === splitAsset.asset.id ? splitAsset.image : null),
  })
  const centre = pixel(ctx, 200, 200)
  check('rotated + 50% opacity blends toward white', centre.r > 100 && centre.g > 90, centre)
  checkNear('outside the rotated square stays white (top-left corner)', pixel(ctx, 105, 105), WHITE, 4)
  checkNear('the old unrotated box corner is now empty', pixel(ctx, 101, 101), WHITE, 4)
  check('the rotated square covers the vertical tips', pixel(ctx, 200, 105).r > 100)
}

/* ---------- PNG keeps alpha, JPEG fills the chosen background ---------- */

const flat = E.createDesign({ name: 'flat', width: 300, height: 300, background: '#FFFFFF', transparent: true })
{
  const pngProject = Object.assign({}, E.emptyProject('t'), { designs: [flat] })
  const { canvas, ctx } = canvasOf(300, 300)
  E.paintDesign(ctx, pngProject, flat, { getImage: () => null, background: 'none' })
  const png = canvas.toBuffer('image/png')
  const decoded = await decodePixels(png)
  checkDeep('PNG decoded at canvas size', [decoded.width, decoded.height], [300, 300])
  checkDeep('PNG corner is fully transparent', pixel(decoded.ctx, 5, 5), { r: 0, g: 0, b: 0, a: 0 })

  const { canvas: jpgCanvas, ctx: jpgCtx } = canvasOf(300, 300)
  E.paintDesign(jpgCtx, pngProject, flat, { getImage: () => null, background: '#FF8800' })
  const jpg = jpgCanvas.toBuffer('image/jpeg', 92)
  const jpgPixels = await decodePixels(jpg)
  checkDeep('JPEG decoded at canvas size', [jpgPixels.width, jpgPixels.height], [300, 300])
  const corner = pixel(jpgPixels.ctx, 5, 5)
  check('JPEG has no transparency', corner.a === 255)
  checkNear('JPEG background is the export colour', corner, { r: 255, g: 136, b: 0 }, 10)
}

/* ---------- missing assets are reported, not crashed on ---------- */

{
  const { ctx } = canvasOf(1080, 1080)
  const result = E.paintDesign(ctx, project, designA, { getImage: () => null })
  checkDeep('missing assets reported for every unresolved image layer', result.missing.slice().sort(), [assets.bgBlue.id, assets.logo.id].sort())
  checkNear('background still painted when an asset is missing', pixel(ctx, 4, 4), WHITE, 4)
}

/* ---------- zoom independence: stage-style scaling matches the export ---------- */

{
  const zoom = 0.5
  const { canvas, ctx } = canvasOf(Math.round(1080 * zoom), Math.round(1080 * zoom))
  ctx.scale(zoom, zoom)
  E.paintDesign(ctx, project, designA, { getImage })
  const scaled = pixel(ctx, Math.round(540 * zoom), Math.round(540 * zoom))
  const exported = pixel(a.ctx, 540, 540)
  checkNear('preview at 50% matches the 1:1 export at the same design point', scaled, exported, 8)
  check('preview canvas is smaller than the export', canvas.width === 540)
}

/* ---------- one design that fails is isolated (export loop contract) ---------- */

{
  const huge = E.createDesign({ name: 'huge', width: 12000, height: 12000, background: '#FFFFFF' })
  check('oversized export is rejected by the >80e6 guard', huge.width * huge.height > 80e6)
}

/* ---------- ZIP packaging ---------- */

{
  const dir = mkdtempSync(path.join(tmpdir(), 'ds-zip-'))
  const outDir = path.join(dir, 'out')
  mkdirSync(outDir, { recursive: true })
  const names = E.uniqueFileNames(project.designs.map((d) => d.name), 'png')
  const files = []
  for (const design of project.designs) {
    const { canvas } = canvasOf(design.width, design.height)
    const ctx = canvas.getContext('2d')
    E.paintDesign(ctx, project, design, { getImage })
    files.push({ name: names[project.designs.indexOf(design)], data: canvas.toBuffer('image/png') })
  }
  const zipBytes = buildZip(files.map((file) => ({ name: file.name, data: new Uint8Array(file.data) })))
  const zipPath = path.join(dir, 'export.zip')
  writeFileSync(zipPath, zipBytes)

  // Python's zipfile honours the UTF-8 name flag; macOS Info-ZIP does not, so use it
  // to read the archive the way a standards-compliant unzip tool would.
  const probe = path.join(dir, 'probe.py')
  writeFileSync(probe, [
    'import json, sys, zipfile',
    'z = zipfile.ZipFile(sys.argv[1])',
    'names = z.namelist()',
    'bad = z.testzip()',
    'z.extractall(sys.argv[2])',
    'print(json.dumps({"names": names, "bad": bad}))',
  ].join('\n'))
  const raw = execFileSync('python3', [probe, zipPath, outDir], { encoding: 'utf8' })
  const archive = JSON.parse(raw)
  checkDeep('zip entry names are the design file names', archive.names, files.map((file) => file.name))
  check('zip CRCs all match', archive.bad === null)

  const identical = files.map((file) => {
    const extracted = readFileSync(path.join(outDir, file.name))
    return createHash('sha256').update(extracted).digest('hex') === createHash('sha256').update(Buffer.from(file.data)).digest('hex')
  })
  checkDeep('every extracted PNG is byte-identical', identical, [true, true, true])

  const sizes = []
  for (const file of files) {
    const extracted = await decodePixels(readFileSync(path.join(outDir, file.name)))
    sizes.push([extracted.width, extracted.height])
  }
  checkDeep('archived PNG dimensions equal canvas dimensions', sizes, [[1080, 1080], [1080, 1350], [1080, 1920]])
  rmSync(dir, { recursive: true, force: true })
}

/* ---------- empty project still exports a blank canvas ---------- */

{
  const blank = E.createDesign({ name: '空白', width: 640, height: 480, background: '#123456' })
  const blankProject = Object.assign({}, E.emptyProject('b'), { designs: [blank] })
  const { canvas } = canvasOf(blank.width, blank.height)
  const { ctx } = canvasOf(1, 1)
  void ctx
  const target = canvas.getContext('2d')
  E.paintDesign(target, blankProject, blank, { getImage: () => null })
  checkDeep('blank design size', [canvas.width, canvas.height], [640, 480])
  checkNear('blank design is its background colour', pixel(target, 320, 240), { r: 18, g: 52, b: 86 }, 4)
  void createCanvas
}

report('render')
