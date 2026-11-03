/**
 * Data-model verification: bindings, layout retention, undo/redo, geometry,
 * text layout, naming and load normalisation. No pixels involved.
 */
import { engine as E } from './lib.mjs'
import { buildScenario, layoutOf, TITLE_A, TITLE_B } from './scenario.mjs'
import { check, checkDeep, report, resetCounters } from './lib.mjs'

resetCounters()

const scenario = await buildScenario()
const { project: base, ids, assets } = scenario

/* ---------- project / design structure ---------- */

check('three designs', base.designs.length === 3)
checkDeep('design sizes', base.designs.map((d) => [d.width, d.height]), [[1080, 1080], [1080, 1350], [1080, 1920]])
checkDeep('stats', E.projectStats(base), { designs: 3, layers: 7, bindings: 2, assets: 3 })

/* ---------- binding membership is derived from layers ---------- */

const bgMembers = E.bindingMembers(base, ids.bgBinding)
check('image group has 3 members', bgMembers.length === 3)
check('members span 3 designs', new Set(bgMembers.map((m) => m.designId)).size === 3)

const impact = E.bindingImpact(base, ids.textBinding)
check('text impact counts 3 layers', impact.count === 3)
check('text impact lists design names', impact.designs.map((d) => d.name).join('|') === '海报-方形|海报-竖版|海报-长竖')

/* ---------- shared image replace keeps each layout ---------- */

const before = {}
for (const design of base.designs) {
  for (const layer of design.layers) if (layer.bindingId === ids.bgBinding) before[layer.id] = layoutOf(layer)
}

const replaced = E.setBindingPayload(base, ids.bgBinding, { assetId: assets.bgBlue.id })
for (const design of replaced.designs) {
  for (const layer of design.layers) {
    if (layer.bindingId !== ids.bgBinding) continue
    check('background layer resolved to new asset', E.resolveImageAssetId(replaced, layer) === assets.bgBlue.id)
    checkDeep('layout retained for ' + design.name, layoutOf(layer), before[layer.id])
  }
}
const logoLayerA = E.findLayer(E.findDesign(replaced, ids.designA), ids.logo)
check('unbound logo layer kept its asset', E.resolveImageAssetId(replaced, logoLayerA) === assets.logo.id)
check('unbound logo layer kept its box', logoLayerA.x === 700 && logoLayerA.y === 60 && logoLayerA.w === 200)

/* ---------- shared text replace keeps every style ---------- */

const titleStyles = {}
for (const design of base.designs) {
  for (const layer of design.layers) if (layer.bindingId === ids.textBinding) titleStyles[layer.id] = layoutOf(layer)
}
const retitled = E.setBindingPayload(base, ids.textBinding, { text: TITLE_B })
for (const layer of retitled.designs.flatMap((d) => d.layers)) {
  if (layer.bindingId !== ids.textBinding) continue
  check('title resolved to shared text', E.resolveText(retitled, layer) === TITLE_B)
  checkDeep('title style retained', layoutOf(layer), titleStyles[layer.id])
}
check('original text untouched by replacement', E.resolveText(base, E.findLayer(E.findDesign(base, ids.designA), ids.titleA)) === TITLE_A)

/* ---------- type safety of attach ---------- */

const wrongType = E.attachBinding(base, ids.designA, ids.logo, ids.textBinding)
check('text group refuses image layer', wrongType === base)

/* ---------- unbind keeps content, others keep syncing ---------- */

const unbound = E.detachBinding(replaced, ids.designB, ids.layerB)
const layerBUnbound = E.findLayer(E.findDesign(unbound, ids.designB), ids.layerB)
check('unbound layer has no binding', layerBUnbound.bindingId === null)
check('unbound layer keeps current asset', E.resolveImageAssetId(unbound, layerBUnbound) === assets.bgBlue.id)
checkDeep('unbound layer keeps its layout', layoutOf(layerBUnbound), before[ids.layerB])
check('remaining members still 2', E.bindingMembers(unbound, ids.bgBinding).length === 2)

const afterUnbind = E.setBindingPayload(unbound, ids.bgBinding, { assetId: assets.bgRed.id })
const layerBAfter = E.findLayer(E.findDesign(afterUnbind, ids.designB), ids.layerB)
check('unbound design keeps its own asset', E.resolveImageAssetId(afterUnbind, layerBAfter) === assets.bgBlue.id)
const layerAAfter = E.findLayer(E.findDesign(afterUnbind, ids.designA), ids.layerA)
check('bound design follows the group', E.resolveImageAssetId(afterUnbind, layerAAfter) === assets.bgRed.id)

/* ---------- deleting a design keeps the others intact ---------- */

const removedDesign = E.removeDesign(replaced, ids.designB)
check('two designs remain', removedDesign.designs.length === 2)
check('group lost only that design', E.bindingMembers(removedDesign, ids.bgBinding).length === 2)
check('group itself still exists', !!E.getBinding(removedDesign, ids.bgBinding))
const survivingTitle = E.findLayer(E.findDesign(removedDesign, ids.designC), ids.titleC)
check('surviving design layer untouched', survivingTitle.bindingId === ids.textBinding)

/* ---------- deleting a group keeps content on every layer ---------- */

const removedGroup = E.removeBinding(replaced, ids.bgBinding)
check('group deleted', !E.getBinding(removedGroup, ids.bgBinding))
for (const design of removedGroup.designs) {
  for (const layer of design.layers) {
    check('layer kept content after group delete', layer.bindingId !== ids.bgBinding)
    if (layer.type === 'image' && layer.name === '背景') {
      check('kept the replaced asset', E.resolveImageAssetId(removedGroup, layer) === assets.bgBlue.id)
    }
  }
}

/* ---------- one undo restores a whole batch ---------- */

let history = E.createHistory()
let current = base
history = E.pushEntry(history, current, 'history.replaceSharedImage', { at: 1000 })
current = E.setBindingPayload(current, ids.bgBinding, { assetId: assets.bgBlue.id })
check('batch applied everywhere', E.bindingMembers(current, ids.bgBinding).every((m) => {
  const layer = E.findLayer(E.findDesign(current, m.designId), m.layerId)
  return E.resolveImageAssetId(current, layer) === assets.bgBlue.id
}))

const undone = E.undoStep(history, current, 'history.replaceSharedImage')
check('undo returned a snapshot', !!undone)
check('undo restored the old asset on every member', E.bindingMembers(undone.project, ids.bgBinding).every((m) => {
  const layer = E.findLayer(E.findDesign(undone.project, m.designId), m.layerId)
  return E.resolveImageAssetId(undone.project, layer) === assets.bgRed.id
}))
check('undo reports its label', undone.undoneLabel === 'history.replaceSharedImage')

const redone = E.redoStep(undone.history, undone.project, 'history.replaceSharedImage')
check('redo reapplies the batch', E.bindingMembers(redone.project, ids.bgBinding).every((m) => {
  const layer = E.findLayer(E.findDesign(redone.project, m.designId), m.layerId)
  return E.resolveImageAssetId(redone.project, layer) === assets.bgBlue.id
}))
check('redo restores the layout too', Object.keys(before).every((layerId) => {
  const layer = redone.project.designs.flatMap((d) => d.layers).find((l) => l.id === layerId)
  return JSON.stringify(layoutOf(layer)) === JSON.stringify(before[layerId])
}))

/* ---------- coalesced typing is one undo step ---------- */

let typingHistory = E.createHistory()
typingHistory = E.pushCoalesced(typingHistory, base, 'history.editText', 'text:' + ids.textBinding, 5000)
typingHistory = E.pushCoalesced(typingHistory, base, 'history.editText', 'text:' + ids.textBinding, 5300)
typingHistory = E.pushCoalesced(typingHistory, base, 'history.editText', 'text:' + ids.textBinding, 6000)
check('typing within the window is one entry', typingHistory.past.length === 1)
typingHistory = E.pushCoalesced(typingHistory, base, 'history.editText', 'text:' + ids.textBinding, 8000)
check('a later pause starts a new entry', typingHistory.past.length === 2)
typingHistory = E.pushCoalesced(typingHistory, base, 'history.renameDesign', 'rename:1', 8100)
check('a different key does not coalesce', typingHistory.past.length === 3)

/* ---------- history limit ---------- */

let longHistory = E.createHistory()
for (let i = 0; i < E.HISTORY_LIMIT + 12; i += 1) longHistory = E.pushEntry(longHistory, base, 'x' + i, { at: i * 10000 })
check('history capped', longHistory.past.length === E.HISTORY_LIMIT)
check('oldest entries dropped', longHistory.past[0].label === 'x12')

/* ---------- geometry ---------- */

const box = { x: 100, y: 100, w: 200, h: 100, rotation: 0 }
check('hit test inside', E.hitTest({ layers: [Object.assign({ id: 'l', type: 'image', visible: true, locked: false }, box)] }, 150, 150) !== null)
check('hit test outside', E.hitTest({ layers: [Object.assign({ id: 'l', type: 'image', visible: true, locked: false }, box)] }, 20, 20) === null)
check('hidden layer is not hit', E.hitTest({ layers: [Object.assign({ id: 'l', type: 'image', visible: false, locked: false }, box)] }, 150, 150) === null)
check('locked layer is not hit', E.hitTest({ layers: [Object.assign({ id: 'l', type: 'image', visible: true, locked: true }, box)] }, 150, 150) === null)

const rotated = { x: 100, y: 100, w: 200, h: 100, rotation: 90 }
const rotDesign = { layers: [Object.assign({ id: 'r', type: 'image', visible: true, locked: false }, rotated)] }
// Rotating the 200x100 box by 90° about its centre (200,150) puts the long axis vertical.
check('rotated hit test follows the layer', E.hitTest(rotDesign, 200, 240) !== null)
check('rotated hit test excludes the old long edge', E.hitTest(rotDesign, 290, 150) === null)

checkDeep('topmost layer wins', E.hitTest({
  layers: [
    { id: 'top', type: 'image', visible: true, locked: false, x: 0, y: 0, w: 100, h: 100, rotation: 0 },
    { id: 'bottom', type: 'image', visible: true, locked: false, x: 0, y: 0, w: 100, h: 100, rotation: 0 },
  ],
}, 50, 50).id, 'top')

/* ---------- fit maths ---------- */

const contain = E.imageRects({ x: 0, y: 0, w: 900, h: 760, fit: 'contain', crop: { x: 0, y: 0, w: 1, h: 1 } }, 1200, 900)
checkDeep('contain scales to fit width', [Math.round(contain.dw), Math.round(contain.dh)], [900, 675])
check('contain is not clipped', contain.clip === false)
check('contain is centred', Math.abs(contain.dy - (760 - 675) / 2) < 0.01)

const cover = E.imageRects({ x: 0, y: 0, w: 1080, h: 1080, fit: 'cover', crop: { x: 0, y: 0, w: 1, h: 1 } }, 800, 1000)
check('cover clips', cover.clip === true)
check('cover overflows the box', cover.dw >= 1080 - 0.01 && cover.dh >= 1080 - 0.01)

const fill = E.imageRects({ x: 5, y: 6, w: 100, h: 50, fit: 'fill', crop: { x: 0, y: 0, w: 1, h: 1 } }, 800, 1000)
checkDeep('fill maps the whole crop onto the box', [fill.dx, fill.dy, fill.dw, fill.dh], [5, 6, 100, 50])

const natural = E.imageRects({ x: 0, y: 0, w: 400, h: 400, fit: 'none', crop: { x: 0, y: 0, w: 1, h: 1 } }, 200, 100)
checkDeep('none keeps source pixels', [natural.dw, natural.dh], [200, 100])
checkDeep('none is centred', [natural.dx, natural.dy], [100, 150])

const cropped = E.imageRects({ x: 0, y: 0, w: 100, h: 100, fit: 'fill', crop: { x: 0.5, y: 0, w: 0.5, h: 1 } }, 200, 100)
checkDeep('crop selects the source rect', [cropped.sx, cropped.sw, cropped.sh], [100, 100, 100])

checkDeep('crop is normalised', E.clampCrop({ x: -0.5, y: 0.2, w: 2, h: 0.4 }), { x: 0, y: 0.2, w: 1, h: 0.4 })

/* ---------- text layout (real metrics) ---------- */

import { canvasOf } from './lib.mjs'
const { ctx: measureCtx } = canvasOf(10, 10)
const textLayer = {
  type: 'text', x: 0, y: 0, w: 200, h: 400, fontSize: 20, lineHeight: 1.5,
  fontFamily: 'arial', fontWeight: 400, align: 'left', italic: false, color: '#000000',
}
const wrapped = E.layoutText(measureCtx, textLayer, '这是一个很长的中文标题需要换行显示')
check('wrapped into multiple lines', wrapped.lines.length > 1)
check('every line fits the box', wrapped.lines.every((line) => line.width <= 200.5))
check('line height follows the style', Math.abs(wrapped.lineHeight - 30) < 0.01)

const multi = E.layoutText(measureCtx, textLayer, '第一行\n第二行\n第三行')
check('explicit newlines preserved', multi.lines.length === 3)
checkDeep('line texts', multi.lines.map((l) => l.text), ['第一行', '第二行', '第三行'])

const hardBreak = E.layoutText(measureCtx, textLayer, 'Supercalifragilisticexpialidocious')
check('over-long word is hard-broken', hardBreak.lines.length > 1)

const latin = E.layoutText(measureCtx, textLayer, 'summer sale poster title')
check('latin words wrap on spaces', latin.lines.length > 1)

/* ---------- export file names ---------- */

checkDeep('duplicate names deduped', E.uniqueFileNames(['海报', '海报', '海报 (2)'], 'png'), [
  '海报.png', '海报 (2).png', '海报 (2) (2).png',
])
checkDeep('illegal characters replaced', E.uniqueFileNames(['a/b:c*?"<>|'], 'png'), ['a-b-c------.png'])
checkDeep('empty name falls back', E.uniqueFileNames(['', '   '], 'jpg'), ['design.jpg', 'design (2).jpg'])
checkDeep('dedupe is case-insensitive per extension', E.uniqueFileNames(['A', 'a'], 'PNG'), ['A.PNG', 'a (2).PNG'])

/* ---------- load normalisation ---------- */

const roundTrip = E.normalizeProject(JSON.parse(JSON.stringify(replaced)), 'fallback')
check('normalised project keeps designs', roundTrip.designs.length === 3)
checkDeep('normalised sizes', roundTrip.designs.map((d) => [d.width, d.height]), [[1080, 1080], [1080, 1350], [1080, 1920]])
check('normalised bindings survive', Object.keys(roundTrip.bindings).length === 2)
check('normalised assets survive', Object.keys(roundTrip.assets).length === 3)
check('bindings resynced on load', E.bindingMembers(roundTrip, ids.bgBinding).every((m) => {
  const layer = E.findLayer(E.findDesign(roundTrip, m.designId), m.layerId)
  return E.resolveImageAssetId(roundTrip, layer) === assets.bgBlue.id
}))
check('layer order preserved', E.findDesign(roundTrip, ids.designA).layers.length === 3)

check('garbage rejected', E.normalizeProject('nope') === null)
check('array rejected', E.normalizeProject([1, 2]) === null)

const patched = E.normalizeProject({
  designs: [{ name: 'only', width: '900', layers: [{ type: 'text', text: 'hi' }, { type: 'image' }, null] }],
  bindings: { b: { kind: 'image', payload: { assetId: 'missing' } } },
  assets: { bad: { id: 'bad' } },
}, 'fallback')
check('missing fields filled', patched && patched.designs[0].width === 900)
check('broken layers dropped', patched.designs[0].layers.length === 2)
check('asset without dataUrl dropped', Object.keys(patched.assets).length === 0)
check('dangling binding asset nulled', Object.values(patched.bindings)[0].payload.assetId === null)

report('model')
