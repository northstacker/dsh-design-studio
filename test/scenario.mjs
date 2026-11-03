/**
 * The acceptance project from the request, built once and shared by the Node
 * rendering tests and the live-GUI fixture: three different canvas sizes, each
 * with a background image layer and a title text layer, the backgrounds bound
 * into one image group and the titles into one text group, and deliberately
 * different layout/style per design.
 */
import { makeAsset, engine as E } from './lib.mjs'

export const RED = { r: 200, g: 30, b: 60 }
export const BLUE = { r: 30, g: 79, b: 200 }
export const YELLOW = { r: 245, g: 197, b: 24 }
export const DARK = { r: 16, g: 16, b: 16 }
export const WHITE = { r: 255, g: 255, b: 255 }

export const TITLE_A = '夏季新品'
export const TITLE_B = '秋季新品'

export async function buildScenario() {
  const bgRed = await makeAsset(800, 1000, (ctx, w, h) => {
    ctx.fillStyle = 'rgb(200,30,60)'
    ctx.fillRect(0, 0, w, h)
  }, '活动背景-红')

  const bgBlue = await makeAsset(1200, 900, (ctx, w, h) => {
    ctx.fillStyle = 'rgb(30,79,200)'
    ctx.fillRect(0, 0, w, h)
  }, '活动背景-蓝')

  const logo = await makeAsset(200, 200, (ctx, w, h) => {
    ctx.fillStyle = 'rgb(245,197,24)'
    ctx.fillRect(0, 0, w, h)
  }, 'logo')

  const images = {
    [bgRed.asset.id]: bgRed.image,
    [bgBlue.asset.id]: bgBlue.image,
    [logo.asset.id]: logo.image,
  }

  let project = E.emptyProject('验收示例')
  project = E.addAsset(project, bgRed.asset)
  project = E.addAsset(project, bgBlue.asset)
  project = E.addAsset(project, logo.asset)

  const designA = E.createDesign({ name: '海报-方形', width: 1080, height: 1080, background: '#FFFFFF' })
  const designB = E.createDesign({ name: '海报-竖版', width: 1080, height: 1350, background: '#101010' })
  const designC = E.createDesign({ name: '海报-长竖', width: 1080, height: 1920, background: '#FFFFFF' })
  project = E.addDesign(project, designA)
  project = E.addDesign(project, designB)
  project = E.addDesign(project, designC)

  // Background layers: same shared asset, three different fits/boxes.
  let layerA = E.createImageLayer(designA, bgRed.asset, { coverCanvas: true, name: '背景' })
  layerA = Object.assign({}, layerA, { x: 0, y: 0, w: 1080, h: 1080, fit: 'cover' })
  project = E.addLayer(project, designA.id, layerA)

  const designB2 = E.findDesign(project, designB.id)
  let layerB = E.createImageLayer(designB2, bgRed.asset, { name: '背景' })
  layerB = Object.assign({}, layerB, { x: 90, y: 120, w: 900, h: 760, fit: 'contain', rotation: 0 })
  project = E.addLayer(project, designB.id, layerB)

  const designC2 = E.findDesign(project, designC.id)
  let layerC = E.createImageLayer(designC2, bgRed.asset, { coverCanvas: true, name: '背景' })
  layerC = Object.assign({}, layerC, { x: 0, y: 0, w: 1080, h: 1920, fit: 'cover', opacity: 0.85 })
  project = E.addLayer(project, designC.id, layerC)

  // Title layers: same shared text, three different styles and positions.
  const designA2 = E.findDesign(project, designA.id)
  let titleA = E.createTextLayer(designA2, { text: TITLE_A, name: '标题', fontFamily: 'pingfang' })
  titleA = Object.assign({}, titleA, {
    x: 90, y: 420, w: 900, h: 220, fontSize: 84, fontWeight: 800, color: '#FFFFFF', align: 'center', lineHeight: 1.2,
  })
  project = E.addLayer(project, designA.id, titleA)

  const designB3 = E.findDesign(project, designB.id)
  let titleB = E.createTextLayer(designB3, { text: TITLE_A, name: '标题', fontFamily: 'pingfang' })
  titleB = Object.assign({}, titleB, {
    x: 90, y: 940, w: 900, h: 180, fontSize: 56, fontWeight: 500, color: '#FFFFFF', align: 'left', lineHeight: 1.6,
  })
  project = E.addLayer(project, designB.id, titleB)

  const designC3 = E.findDesign(project, designC.id)
  let titleC = E.createTextLayer(designC3, { text: TITLE_A, name: '标题', fontFamily: 'pingfang' })
  titleC = Object.assign({}, titleC, {
    x: 80, y: 1500, w: 920, h: 300, fontSize: 104, fontWeight: 800, color: '#FF3B30', align: 'right', italic: true,
  })
  project = E.addLayer(project, designC.id, titleC)

  // An unbound extra image layer, to prove unrelated layers never move.
  const designA3 = E.findDesign(project, designA.id)
  let logoLayer = E.createImageLayer(designA3, logo.asset, { name: '角标' })
  logoLayer = Object.assign({}, logoLayer, { x: 700, y: 60, w: 200, h: 200, fit: 'fill' })
  project = E.addLayer(project, designA.id, logoLayer)

  // Explicit binding groups: image backgrounds, text titles.
  const bgBinding = E.makeBinding('image', { assetId: bgRed.asset.id }, '活动背景')
  project = E.addBinding(project, bgBinding)
  const textBinding = E.makeBinding('text', { text: TITLE_A }, '活动标题')
  project = E.addBinding(project, textBinding)

  const titles = { a: titleA, b: titleB, c: titleC }
  for (const [designId, layer] of [[designA.id, layerA], [designB.id, layerB], [designC.id, layerC]]) {
    project = E.attachBinding(project, designId, layer.id, bgBinding.id)
  }
  for (const [designId, layer] of [[designA.id, titles.a], [designB.id, titles.b], [designC.id, titles.c]]) {
    project = E.attachBinding(project, designId, layer.id, textBinding.id)
  }

  return {
    project,
    images,
    assets: { bgRed: bgRed.asset, bgBlue: bgBlue.asset, logo: logo.asset },
    ids: {
      designA: designA.id,
      designB: designB.id,
      designC: designC.id,
      layerA: layerA.id,
      layerB: layerB.id,
      layerC: layerC.id,
      titleA: titleA.id,
      titleB: titleB.id,
      titleC: titleC.id,
      logo: logoLayer.id,
      bgBinding: bgBinding.id,
      textBinding: textBinding.id,
    },
  }
}

/** The properties that must survive a shared-content change. */
export function layoutOf(layer) {
  return {
    x: layer.x,
    y: layer.y,
    w: layer.w,
    h: layer.h,
    rotation: layer.rotation,
    opacity: layer.opacity,
    fit: layer.fit,
    crop: layer.crop,
    fontSize: layer.fontSize,
    fontWeight: layer.fontWeight,
    fontFamily: layer.fontFamily,
    color: layer.color,
    align: layer.align,
    lineHeight: layer.lineHeight,
    italic: layer.italic,
  }
}
