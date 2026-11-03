/* Design Studio — shared engine.
 *
 * Pure data model + operations + geometry + text layout + canvas painting.
 * No DOM access, no React: this same file is bundled into client.js and is
 * imported directly by the Node verification tests, so the tests exercise the
 * exact code that ships.
 *
 * Model invariants
 *  - Project, Design, Layer, Binding and Asset are plain JSON.
 *  - Every user operation returns a NEW project (structural sharing), so a
 *    history entry is just a previous project reference.
 *  - Binding membership is derived (`layer.bindingId`), never stored twice.
 *  - A bound layer keeps a materialised copy of the shared payload, so
 *    unbinding / deleting a group never changes how a layer looks.
 *  - `design.layers[0]` is the TOP layer (matches the layer panel); painting
 *    walks the array backwards.
 */

export const PROJECT_VERSION = 1

/* ------------------------------------------------------------------ utils */

export function num(value, fallback) {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value
}

export function clampInt(value, min, max) {
  return Math.round(clamp(num(value, min), min, max))
}

let uidCounter = 0

export function uid(prefix = 'id') {
  uidCounter += 1
  return `${prefix}_${Date.now().toString(36)}${uidCounter.toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

function nowISO() {
  return new Date().toISOString()
}

/* ------------------------------------------------------------------ fonts */

export const FONT_STACKS = {
  system: 'system-ui, -apple-system, "PingFang SC", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  pingfang: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif',
  heiti: '"Heiti SC", "STHeiti", "Microsoft YaHei", sans-serif',
  songti: '"Songti SC", "STSong", "SimSun", serif',
  kaiti: '"Kaiti SC", "STKaiti", "KaiTi", serif',
  arial: 'Arial, Helvetica, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
  impact: 'Impact, "Arial Black", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}

export const FONT_OPTIONS = Object.keys(FONT_STACKS)

export const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800]

export function fontStack(family) {
  return FONT_STACKS[family] || FONT_STACKS.system
}

export function cssFont(layer) {
  const size = Math.max(1, num(layer && layer.fontSize, 32))
  const style = layer && layer.italic ? 'italic ' : ''
  const weight = num(layer && layer.fontWeight, 400)
  return `${style}${weight} ${size}px ${fontStack(layer && layer.fontFamily)}`
}

/** Apply the layer's type settings to a 2D context. */
export function applyFont(ctx, layer) {
  ctx.font = cssFont(layer)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
}

/* -------------------------------------------------------------- factories */

export function emptyProject(name) {
  return {
    version: PROJECT_VERSION,
    id: uid('proj'),
    name: name || '未命名项目',
    designs: [],
    bindings: {},
    assets: {},
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
}

export function createDesign(options) {
  const opts = options || {}
  return {
    id: uid('dsg'),
    name: opts.name || '新建设计',
    width: clampInt(opts.width, 1, 20000) || 1080,
    height: clampInt(opts.height, 1, 20000) || 1080,
    background: opts.background || '#FFFFFF',
    transparent: !!opts.transparent,
    layers: [],
  }
}

export function baseLayer(type) {
  return {
    id: uid('lyr'),
    type: type === 'text' ? 'text' : 'image',
    name: type === 'text' ? '文字' : '图片',
    x: 0,
    y: 0,
    w: 400,
    h: 300,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    bindingId: null,
  }
}

export function createAsset(image, name, mime, dataUrl) {
  return {
    id: uid('ast'),
    name: name || '素材',
    mime: mime || 'image/png',
    width: Math.max(1, Math.round(num(image && image.width, 1))),
    height: Math.max(1, Math.round(num(image && image.height, 1))),
    dataUrl: dataUrl || '',
    size: dataUrl ? dataUrl.length : 0,
    createdAt: nowISO(),
  }
}

/** Largest w/h with the asset's aspect ratio that fits into maxW x maxH. */
export function fitRectInto(w, h, maxW, maxH) {
  const iw = Math.max(1, num(w, 1))
  const ih = Math.max(1, num(h, 1))
  const scale = Math.min(maxW / iw, maxH / ih)
  const s = scale > 0 ? scale : 1
  return { w: Math.max(1, iw * s), h: Math.max(1, ih * s) }
}

export function createImageLayer(design, asset, options) {
  const opts = options || {}
  const width = Math.max(1, design.width)
  const height = Math.max(1, design.height)
  const full = opts.coverCanvas === true
  const box = full
    ? { w: width, h: height }
    : fitRectInto(asset.width, asset.height, width * 0.8, height * 0.8)
  const w = Math.max(1, Math.round(box.w))
  const h = Math.max(1, Math.round(box.h))
  return Object.assign(baseLayer('image'), {
    name: opts.name || asset.name || '图片',
    assetId: asset.id,
    fit: full ? 'fill' : 'contain',
    crop: { x: 0, y: 0, w: 1, h: 1 },
    lockAspect: true,
    x: Math.round((width - w) / 2),
    y: Math.round((height - h) / 2),
    w,
    h,
  })
}

export function createTextLayer(design, options) {
  const opts = options || {}
  const fontSize = clampInt(opts.fontSize, 4, 2000) || 64
  const lineHeight = num(opts.lineHeight, 1.35) || 1.35
  const text = typeof opts.text === 'string' ? opts.text : '双击编辑文字'
  const lines = text.split('\n').length
  const width = clampInt(opts.width, 8, design.width) || Math.round(Math.max(120, design.width * 0.7))
  const height = Math.round(Math.max(fontSize, lines * fontSize * lineHeight))
  return Object.assign(baseLayer('text'), {
    name: opts.name || '标题',
    text,
    fontFamily: opts.fontFamily || 'system',
    fontSize,
    fontWeight: num(opts.fontWeight, 700) || 700,
    color: opts.color || '#1F2328',
    align: opts.align || 'center',
    lineHeight,
    italic: !!opts.italic,
    x: Math.round((design.width - width) / 2),
    y: Math.max(0, Math.round(design.height * 0.12)),
    w: width,
    h: height,
  })
}

/* ----------------------------------------------------------------- lookup */

export function findDesign(project, designId) {
  if (!project || !Array.isArray(project.designs)) return null
  for (const design of project.designs) if (design.id === designId) return design
  return null
}

export function findLayer(design, layerId) {
  if (!design || !Array.isArray(design.layers)) return null
  for (const layer of design.layers) if (layer.id === layerId) return layer
  return null
}

export function findLayerDesign(project, layerId) {
  for (const design of project.designs) {
    if (findLayer(design, layerId)) return design
  }
  return null
}

export function getBinding(project, bindingId) {
  if (!bindingId || !project || !project.bindings) return null
  return project.bindings[bindingId] || null
}

export function getAsset(project, assetId) {
  if (!assetId || !project || !project.assets) return null
  return project.assets[assetId] || null
}

export function collectAssetIds(project) {
  const ids = new Set()
  if (!project) return []
  for (const asset of Object.values(project.assets || {})) ids.add(asset.id)
  return [...ids]
}

/* --------------------------------------------------------------- geometry */

export function clampCrop(crop) {
  const c = crop || {}
  const w = clamp(num(c.w, 1), 0.01, 1)
  const h = clamp(num(c.h, 1), 0.01, 1)
  return {
    x: clamp(num(c.x, 0), 0, 1 - w),
    y: clamp(num(c.y, 0), 0, 1 - h),
    w,
    h,
  }
}

export function layerCenter(layer) {
  return { x: layer.x + layer.w / 2, y: layer.y + layer.h / 2 }
}

export function rotatePoint(px, py, cx, cy, degrees) {
  const deg = num(degrees, 0)
  if (!deg) return { x: px, y: py }
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = px - cx
  const dy = py - cy
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos }
}

/** Design-space point expressed in the layer's unrotated box coordinates. */
export function toLayerPoint(layer, px, py) {
  const c = layerCenter(layer)
  return rotatePoint(px, py, c.x, c.y, -num(layer.rotation, 0))
}

export function layerContains(layer, px, py) {
  const p = toLayerPoint(layer, px, py)
  return p.x >= layer.x && p.x <= layer.x + layer.w && p.y >= layer.y && p.y <= layer.y + layer.h
}

/** Topmost unlocked, visible layer under a design-space point. */
export function hitTest(design, px, py) {
  if (!design || !Array.isArray(design.layers)) return null
  for (const layer of design.layers) {
    if (layer.visible === false || layer.locked) continue
    if (layerContains(layer, px, py)) return layer
  }
  return null
}

export function layerCorners(layer) {
  const c = layerCenter(layer)
  const pts = [
    { x: layer.x, y: layer.y },
    { x: layer.x + layer.w, y: layer.y },
    { x: layer.x + layer.w, y: layer.y + layer.h },
    { x: layer.x, y: layer.y + layer.h },
  ]
  return pts.map((p) => rotatePoint(p.x, p.y, c.x, c.y, num(layer.rotation, 0)))
}

export function layerBounds(layer) {
  const pts = layerCorners(layer)
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const x = Math.min.apply(null, xs)
  const y = Math.min.apply(null, ys)
  return { x, y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y }
}

/**
 * Source and destination rectangles for drawing an image layer.
 * fit: 'contain' | 'fill' | 'cover' | 'none'
 * crop: normalised source window {x,y,w,h} from the original image.
 */
export function imageRects(layer, imageWidth, imageHeight) {
  const iw = Math.max(1, num(imageWidth, 1))
  const ih = Math.max(1, num(imageHeight, 1))
  const crop = clampCrop(layer.crop)
  const sx = crop.x * iw
  const sy = crop.y * ih
  const sw = Math.max(1, crop.w * iw)
  const sh = Math.max(1, crop.h * ih)
  const box = { x: layer.x, y: layer.y, w: Math.max(1, layer.w), h: Math.max(1, layer.h) }
  const fit = layer.fit || 'contain'
  if (fit === 'fill') {
    return { sx, sy, sw, sh, dx: box.x, dy: box.y, dw: box.w, dh: box.h, clip: false }
  }
  if (fit === 'none') {
    return {
      sx, sy, sw, sh,
      dx: box.x + (box.w - sw) / 2,
      dy: box.y + (box.h - sh) / 2,
      dw: sw,
      dh: sh,
      clip: false,
    }
  }
  const scale = fit === 'cover' ? Math.max(box.w / sw, box.h / sh) : Math.min(box.w / sw, box.h / sh)
  const dw = sw * scale
  const dh = sh * scale
  return {
    sx, sy, sw, sh,
    dx: box.x + (box.w - dw) / 2,
    dy: box.y + (box.h - dh) / 2,
    dw,
    dh,
    clip: fit === 'cover',
  }
}

export function thumbnailBox(design, maxW, maxH) {
  return fitRectInto(design.width, design.height, maxW, maxH)
}

/* ------------------------------------------------------------ text layout */

const CJK_RE = /[\u1100-\u11FF\u2E80-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/

/** Split a paragraph into wrap tokens: CJK per character, latin per word. */
export function tokenize(str) {
  const out = []
  let buf = ''
  const flush = () => {
    if (buf) {
      out.push({ text: buf })
      buf = ''
    }
  }
  for (const ch of String(str)) {
    if (ch === ' ' || ch === '\t') {
      // A space always ends the current word token and becomes its own token,
      // so wrapping can drop it at the start of a new line.
      flush()
      out.push({ text: ch })
      continue
    }
    if (CJK_RE.test(ch)) {
      flush()
      out.push({ text: ch })
    } else {
      buf += ch
    }
  }
  flush()
  return out
}

/**
 * Lay out a text layer inside its box.
 * Returns { lines: [{text,width}], lineHeight, width, height, fontSize } in
 * design units. Preview and export both use this, so wrapping matches.
 */
export function layoutText(ctx, layer, text) {
  const value = text == null ? '' : String(text)
  const fontSize = Math.max(1, num(layer.fontSize, 32))
  const lineHeight = Math.max(0.5, num(layer.lineHeight, 1.35)) * fontSize
  const maxWidth = Math.max(1, num(layer.w, 1))
  const lines = []
  const cache = new Map()
  const measure = (s) => {
    if (!s) return 0
    let w = cache.get(s)
    if (w === undefined) {
      w = ctx.measureText(s).width
      cache.set(s, w)
    }
    return w
  }
  applyFont(ctx, layer)
  const paragraphs = value.split('\n')
  for (const para of paragraphs) {
    if (para === '') {
      lines.push({ text: '', width: 0 })
      continue
    }
    const tokens = tokenize(para)
    let cur = ''
    let curWidth = 0
    for (const token of tokens) {
      const tokenWidth = measure(token.text)
      if (cur === '' && token.text.trim() === '') continue
      if (curWidth + tokenWidth <= maxWidth || cur === '') {
        if (cur === '' && tokenWidth > maxWidth) {
          // A single word wider than the box: hard-break it by characters.
          let chunk = ''
          for (const ch of token.text) {
            const next = chunk + ch
            if (chunk && measure(next) > maxWidth) {
              lines.push({ text: chunk, width: measure(chunk) })
              chunk = ch
            } else {
              chunk = next
            }
          }
          cur = chunk
          curWidth = measure(chunk)
        } else {
          cur += token.text
          curWidth += tokenWidth
        }
      } else {
        lines.push({ text: cur, width: curWidth })
        if (token.text.trim() === '') {
          cur = ''
          curWidth = 0
        } else {
          cur = token.text
          curWidth = tokenWidth
        }
      }
    }
    lines.push({ text: cur, width: curWidth })
  }
  const widths = lines.map((line) => line.width)
  const width = widths.length ? Math.max.apply(null, widths) : 0
  return {
    lines,
    lineHeight,
    width,
    height: lines.length * lineHeight,
    fontSize,
  }
}

export function paintText(ctx, layer, layout) {
  applyFont(ctx, layer)
  ctx.fillStyle = layer.color || '#111111'
  const boxWidth = Math.max(1, num(layer.w, 1))
  for (let i = 0; i < layout.lines.length; i += 1) {
    const line = layout.lines[i]
    if (!line.text) continue
    let x = layer.x
    if (layer.align === 'center') x = layer.x + (boxWidth - line.width) / 2
    else if (layer.align === 'right') x = layer.x + boxWidth - line.width
    ctx.fillText(line.text, x, layer.y + i * layout.lineHeight)
  }
}

/* ------------------------------------------------------------------ paint */

export function resolveImageAssetId(project, layer) {
  const binding = getBinding(project, layer.bindingId)
  if (binding && binding.kind === 'image' && binding.payload && binding.payload.assetId) {
    return binding.payload.assetId
  }
  return layer.assetId || null
}

export function resolveText(project, layer) {
  const binding = getBinding(project, layer.bindingId)
  if (binding && binding.kind === 'text' && binding.payload && typeof binding.payload.text === 'string') {
    return binding.payload.text
  }
  return typeof layer.text === 'string' ? layer.text : ''
}

/**
 * Paint a design at its natural coordinates (1 design unit == 1 canvas unit).
 * The caller sets up scale/translate for preview zoom, so preview and export
 * share identical geometry.
 *
 * options: { getImage(assetId) -> image|null, background: color|'none', onError }
 * returns { missing: [assetIds] }
 */
export function paintDesign(ctx, project, design, options) {
  const opts = options || {}
  const getImage = opts.getImage || (() => null)
  const background = opts.background
  const missing = []
  ctx.save()
  if (background !== 'none') {
    ctx.fillStyle = background || design.background || '#FFFFFF'
    ctx.fillRect(0, 0, design.width, design.height)
  }
  const layers = design.layers || []
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i]
    if (layer.visible === false) continue
    ctx.save()
    ctx.globalAlpha = clamp(num(layer.opacity, 1), 0, 1)
    const center = layerCenter(layer)
    const rotation = num(layer.rotation, 0)
    if (rotation) {
      ctx.translate(center.x, center.y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-center.x, -center.y)
    }
    if (layer.type === 'image') {
      const assetId = resolveImageAssetId(project, layer)
      const image = assetId ? getImage(assetId) : null
      if (!image) {
        if (assetId) missing.push(assetId)
      } else {
        const iw = image.naturalWidth || image.width || 1
        const ih = image.naturalHeight || image.height || 1
        const rect = imageRects(layer, iw, ih)
        if (rect.clip) {
          ctx.beginPath()
          ctx.rect(layer.x, layer.y, Math.max(1, layer.w), Math.max(1, layer.h))
          ctx.clip()
        }
        ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, rect.dx, rect.dy, rect.dw, rect.dh)
      }
    } else {
      const text = resolveText(project, layer)
      const layout = layoutText(ctx, layer, text)
      paintText(ctx, layer, layout)
    }
    ctx.restore()
  }
  ctx.restore()
  return { missing }
}

/* ---------------------------------------------------------------- bindings */

export function bindingMembers(project, bindingId) {
  const members = []
  if (!project) return members
  for (const design of project.designs || []) {
    for (const layer of design.layers || []) {
      if (layer.bindingId === bindingId) {
        members.push({
          designId: design.id,
          designName: design.name,
          layerId: layer.id,
          layerName: layer.name,
          type: layer.type,
        })
      }
    }
  }
  return members
}

/** Which designs / layers a shared-content edit will touch. */
export function bindingImpact(project, bindingId) {
  const members = bindingMembers(project, bindingId)
  const byDesign = new Map()
  for (const member of members) {
    let entry = byDesign.get(member.designId)
    if (!entry) {
      entry = { id: member.designId, name: member.designName, layers: [] }
      byDesign.set(member.designId, entry)
    }
    entry.layers.push({ id: member.layerId, name: member.layerName })
  }
  return { members, designs: [...byDesign.values()], count: members.length }
}

export function bindingsOfKind(project, kind) {
  return Object.values((project && project.bindings) || {})
    .filter((b) => b.kind === kind)
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh-Hans-CN'))
}

function applyPayloadToLayer(layer, binding) {
  if (!binding) return layer
  if (binding.kind === 'image') {
    if (layer.assetId === binding.payload.assetId) return layer
    return Object.assign({}, layer, { assetId: binding.payload.assetId })
  }
  if (binding.kind === 'text') {
    if (layer.text === binding.payload.text) return layer
    return Object.assign({}, layer, { text: binding.payload.text })
  }
  return layer
}

/** Copy the group payload into every member layer (keeps layout untouched). */
export function syncBinding(project, bindingId) {
  const binding = getBinding(project, bindingId)
  if (!binding) return project
  return Object.assign({}, project, {
    designs: project.designs.map((design) => {
      if (!design.layers.some((l) => l.bindingId === bindingId)) return design
      return Object.assign({}, design, {
        layers: design.layers.map((l) => (l.bindingId === bindingId ? applyPayloadToLayer(l, binding) : l)),
      })
    }),
  })
}

export function makeBinding(kind, payload, name) {
  return {
    id: uid('bnd'),
    kind: kind === 'text' ? 'text' : 'image',
    name: name || (kind === 'text' ? '文字绑定组' : '图片绑定组'),
    payload: kind === 'text' ? { text: String((payload && payload.text) || '') } : { assetId: (payload && payload.assetId) || null },
    createdAt: nowISO(),
  }
}

/* --------------------------------------------------------------- mutations */

export function touch(project) {
  return Object.assign({}, project, { updatedAt: nowISO() })
}

export function updateDesign(project, designId, patch) {
  return touch(
    Object.assign({}, project, {
      designs: project.designs.map((design) => (design.id === designId ? Object.assign({}, design, patch) : design)),
    }),
  )
}

export function renameDesign(project, designId, name) {
  const trimmed = String(name == null ? '' : name).trim()
  if (!trimmed) return project
  return updateDesign(project, designId, { name: trimmed })
}

export function addDesign(project, design, index) {
  const designs = project.designs.slice()
  const at = index == null ? designs.length : clampInt(index, 0, designs.length)
  designs.splice(at, 0, design)
  return touch(Object.assign({}, project, { designs }))
}

export function removeDesign(project, designId) {
  if (project.designs.length <= 1) return project
  return touch(
    Object.assign({}, project, { designs: project.designs.filter((design) => design.id !== designId) }),
  )
}

export function duplicateDesign(project, designId) {
  const design = findDesign(project, designId)
  if (!design) return project
  const copy = Object.assign({}, design, {
    id: uid('dsg'),
    name: uniqueDesignName(project, `${design.name} 副本`),
    layers: design.layers.map((layer) =>
      Object.assign({}, layer, {
        id: uid('lyr'),
        crop: layer.crop ? Object.assign({}, layer.crop) : layer.crop,
      }),
    ),
  })
  const index = project.designs.findIndex((d) => d.id === designId)
  return addDesign(project, copy, index + 1)
}

/** Rename to `wanted`, appending a counter only when the name already exists. */
export function uniqueDesignName(project, wanted) {
  const names = new Set(project.designs.map((design) => design.name))
  if (!names.has(wanted)) return wanted
  let i = 2
  while (names.has(`${wanted} ${i}`)) i += 1
  return `${wanted} ${i}`
}

function mapDesign(project, designId, fn) {
  return Object.assign({}, project, {
    designs: project.designs.map((design) => (design.id === designId ? fn(design) : design)),
  })
}

function mapLayer(project, designId, layerId, fn) {
  return mapDesign(project, designId, (design) =>
    Object.assign({}, design, {
      layers: design.layers.map((layer) => (layer.id === layerId ? fn(layer) : layer)),
    }),
  )
}

export function updateLayer(project, designId, layerId, patch) {
  return touch(mapLayer(project, designId, layerId, (layer) => Object.assign({}, layer, patch)))
}

export function addLayer(project, designId, layer, index) {
  return touch(
    mapDesign(project, designId, (design) => {
      const layers = design.layers.slice()
      const at = index == null ? 0 : clampInt(index, 0, layers.length)
      layers.splice(at, 0, layer)
      return Object.assign({}, design, { layers })
    }),
  )
}

export function removeLayer(project, designId, layerId) {
  return touch(
    mapDesign(project, designId, (design) =>
      Object.assign({}, design, { layers: design.layers.filter((layer) => layer.id !== layerId) }),
    ),
  )
}

export function duplicateLayer(project, designId, layerId) {
  const design = findDesign(project, designId)
  const layer = design ? findLayer(design, layerId) : null
  if (!layer) return project
  const copy = Object.assign({}, layer, {
    id: uid('lyr'),
    name: `${layer.name} 副本`,
    crop: layer.crop ? Object.assign({}, layer.crop) : layer.crop,
    x: layer.x + 24,
    y: layer.y + 24,
  })
  const index = design.layers.findIndex((l) => l.id === layerId)
  return addLayer(project, designId, copy, index)
}

/** Move a layer to a new index; index 0 is the top of the stack. */
export function moveLayer(project, designId, layerId, toIndex) {
  return touch(
    mapDesign(project, designId, (design) => {
      const from = design.layers.findIndex((layer) => layer.id === layerId)
      if (from < 0) return design
      const layers = design.layers.slice()
      const moved = layers.splice(from, 1)[0]
      const at = clampInt(toIndex, 0, layers.length)
      layers.splice(at, 0, moved)
      return Object.assign({}, design, { layers })
    }),
  )
}

export function addAsset(project, asset) {
  const assets = Object.assign({}, project.assets)
  assets[asset.id] = asset
  return touch(Object.assign({}, project, { assets }))
}

/* ------------------------------------------------------- binding mutations */

export function addBinding(project, binding) {
  const bindings = Object.assign({}, project.bindings)
  bindings[binding.id] = binding
  return touch(Object.assign({}, project, { bindings }))
}

export function renameBinding(project, bindingId, name) {
  const binding = getBinding(project, bindingId)
  const trimmed = String(name == null ? '' : name).trim()
  if (!binding || !trimmed) return project
  const bindings = Object.assign({}, project.bindings)
  bindings[bindingId] = Object.assign({}, binding, { name: trimmed })
  return touch(Object.assign({}, project, { bindings }))
}

/** Join a layer to a group (must be the same kind). Returns project unchanged on mismatch. */
export function attachBinding(project, designId, layerId, bindingId) {
  const binding = getBinding(project, bindingId)
  const design = findDesign(project, designId)
  const layer = design ? findLayer(design, layerId) : null
  if (!binding || !layer || binding.kind !== layer.type) return project
  const next = mapLayer(project, designId, layerId, (l) =>
    applyPayloadToLayer(Object.assign({}, l, { bindingId }), binding),
  )
  return touch(next)
}

/** Leave the group, keeping the current shared content on this layer. */
export function detachBinding(project, designId, layerId) {
  const design = findDesign(project, designId)
  const layer = design ? findLayer(design, layerId) : null
  if (!layer || !layer.bindingId) return project
  const binding = getBinding(project, layer.bindingId)
  const next = mapLayer(project, designId, layerId, (l) =>
    Object.assign({}, applyPayloadToLayer(l, binding), { bindingId: null }),
  )
  return touch(next)
}

/** Delete a group: members keep the shared content and become unbound. */
export function removeBinding(project, bindingId) {
  const binding = getBinding(project, bindingId)
  if (!binding) return project
  const bindings = Object.assign({}, project.bindings)
  delete bindings[bindingId]
  const designs = project.designs.map((design) => {
    if (!design.layers.some((l) => l.bindingId === bindingId)) return design
    return Object.assign({}, design, {
      layers: design.layers.map((l) =>
        l.bindingId === bindingId
          ? Object.assign({}, applyPayloadToLayer(l, binding), { bindingId: null })
          : l,
      ),
    })
  })
  return touch(Object.assign({}, project, { bindings, designs }))
}

/**
 * Change the shared content of a group. Members keep their own position,
 * size, rotation, opacity and text styling; only material is replaced.
 */
export function setBindingPayload(project, bindingId, patch) {
  const binding = getBinding(project, bindingId)
  if (!binding) return project
  const payload = Object.assign({}, binding.payload, patch)
  const bindings = Object.assign({}, project.bindings)
  bindings[bindingId] = Object.assign({}, binding, { payload })
  return touch(syncBinding(Object.assign({}, project, { bindings }), bindingId))
}

/** Every project that uses an asset (for delete/replace warnings). */
export function assetUsage(project, assetId) {
  const usages = []
  for (const design of project.designs) {
    for (const layer of design.layers) {
      if (resolveImageAssetId(project, layer) === assetId) {
        usages.push({ designId: design.id, designName: design.name, layerId: layer.id, layerName: layer.name })
      }
    }
  }
  return usages
}

/* ---------------------------------------------------------------- history */

export const HISTORY_LIMIT = 60

export function createHistory() {
  return { past: [], future: [] }
}

/**
 * Record the state before an action. `label` describes the action, so the UI
 * can say 撤销：移动图层. `coalesceKey` merges rapid repeats (typing) into one
 * entry that still restores the pre-typing state.
 */
export function pushEntry(history, project, label, meta) {
  const extra = meta || {}
  const entry = { project, label: label || '', coalesceKey: extra.coalesceKey || null, at: extra.at || 0 }
  const past = history.past.concat([entry])
  while (past.length > HISTORY_LIMIT) past.shift()
  return { past, future: [] }
}

export function pushCoalesced(history, project, label, coalesceKey, at, windowMs) {
  const stamp = num(at, 0)
  const window = num(windowMs, 900)
  const last = history.past[history.past.length - 1]
  if (last && coalesceKey && last.coalesceKey === coalesceKey && stamp - num(last.at, 0) < window) {
    const past = history.past.slice(0, -1).concat([
      { project: last.project, label, coalesceKey, at: stamp },
    ])
    return { past, future: [] }
  }
  return pushEntry(history, project, label, { coalesceKey, at: stamp })
}

export function undoStep(history, currentProject, currentLabel) {
  if (!history.past.length) return null
  const entry = history.past[history.past.length - 1]
  return {
    project: entry.project,
    undoneLabel: entry.label,
    history: {
      past: history.past.slice(0, -1),
      future: history.future.concat([{ project: currentProject, label: currentLabel || '' }]),
    },
  }
}

export function redoStep(history, currentProject, currentLabel) {
  if (!history.future.length) return null
  const entry = history.future[history.future.length - 1]
  return {
    project: entry.project,
    redoneLabel: entry.label,
    history: {
      past: history.past.concat([{ project: currentProject, label: currentLabel || '' }]),
      future: history.future.slice(0, -1),
    },
  }
}

/* ------------------------------------------------------------------ files */

const ILLEGAL_FILE_CHARS = /[\\/:*?"<>|\u0000-\u001F]/g

export function sanitizeFileName(name, fallback) {
  let s = String(name == null ? '' : name)
    .replace(ILLEGAL_FILE_CHARS, '-')
    .replace(/\s+/g, ' ')
    .trim()
  s = s.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '')
  if (!s) s = fallback || 'design'
  if (s.length > 120) s = s.slice(0, 120).trim() || (fallback || 'design')
  return s
}

/** Unique, filesystem-safe names with the given extension, in input order. */
export function uniqueFileNames(names, ext) {
  const used = new Set()
  const out = []
  for (const raw of names) {
    const base = sanitizeFileName(raw)
    let candidate = base
    let i = 2
    while (used.has(`${candidate}.${ext}`.toLowerCase())) {
      candidate = `${base} (${i})`
      i += 1
    }
    used.add(`${candidate}.${ext}`.toLowerCase())
    out.push(`${candidate}.${ext}`)
  }
  return out
}

export function timestampSlug(date) {
  const d = date instanceof Date ? date : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

/* -------------------------------------------------------------- normalise */

const IMAGE_MIME = { 'image/png': true, 'image/jpeg': true, 'image/webp': true }

export function isSupportedImageMime(mime) {
  return !!IMAGE_MIME[String(mime || '').toLowerCase()]
}

function asString(value, fallback) {
  return typeof value === 'string' ? value : fallback || ''
}

/**
 * Defensive load: rebuild a project from untrusted JSON, dropping nothing
 * silently that matters — unknown layers fall back to sane defaults, missing
 * assets are kept as references so the UI can report them.
 */
export function normalizeProject(raw, fallbackName) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const project = {
    version: PROJECT_VERSION,
    id: asString(raw.id) || uid('proj'),
    name: asString(raw.name) || fallbackName || '未命名项目',
    designs: [],
    bindings: {},
    assets: {},
    createdAt: asString(raw.createdAt) || nowISO(),
    updatedAt: asString(raw.updatedAt) || nowISO(),
  }

  const rawAssets = raw.assets && typeof raw.assets === 'object' ? raw.assets : {}
  for (const asset of Object.values(rawAssets)) {
    if (!asset || typeof asset.dataUrl !== 'string' || !asset.dataUrl) continue
    const id = asString(asset.id) || uid('ast')
    project.assets[id] = {
      id,
      name: asString(asset.name) || '素材',
      mime: asString(asset.mime) || 'image/png',
      width: Math.max(1, Math.round(num(asset.width, 1))),
      height: Math.max(1, Math.round(num(asset.height, 1))),
      dataUrl: asset.dataUrl,
      size: Math.max(0, num(asset.size, asset.dataUrl.length)),
      createdAt: asString(asset.createdAt) || nowISO(),
    }
  }

  const rawBindings = raw.bindings && typeof raw.bindings === 'object' ? raw.bindings : {}
  for (const binding of Object.values(rawBindings)) {
    if (!binding || (binding.kind !== 'image' && binding.kind !== 'text')) continue
    const id = asString(binding.id) || uid('bnd')
    const payload = binding.payload && typeof binding.payload === 'object' ? binding.payload : {}
    project.bindings[id] = {
      id,
      kind: binding.kind,
      name: asString(binding.name) || (binding.kind === 'text' ? '文字绑定组' : '图片绑定组'),
      payload:
        binding.kind === 'text'
          ? { text: asString(payload.text) }
          : { assetId: project.assets[payload.assetId] ? payload.assetId : null },
      createdAt: asString(binding.createdAt) || nowISO(),
    }
  }

  const rawDesigns = Array.isArray(raw.designs) ? raw.designs : []
  for (const design of rawDesigns) {
    if (!design || typeof design !== 'object') continue
    const next = createDesign({
      name: asString(design.name) || '设计',
      width: num(design.width, 1080),
      height: num(design.height, 1080),
      background: asString(design.background) || '#FFFFFF',
      transparent: !!design.transparent,
    })
    next.id = asString(design.id) || next.id
    const rawLayers = Array.isArray(design.layers) ? design.layers : []
    next.layers = rawLayers
      .filter((layer) => layer && typeof layer === 'object')
      .map((layer) => {
        const type = layer.type === 'text' ? 'text' : 'image'
        const base = baseLayer(type)
        const binding = project.bindings[layer.bindingId]
        const sameKind = binding && binding.kind === type ? binding.id : null
        const out = Object.assign(base, {
          id: asString(layer.id) || base.id,
          name: asString(layer.name) || (type === 'text' ? '文字' : '图片'),
          x: num(layer.x, 0),
          y: num(layer.y, 0),
          w: Math.max(1, num(layer.w, 100)),
          h: Math.max(1, num(layer.h, 100)),
          rotation: num(layer.rotation, 0),
          opacity: clamp(num(layer.opacity, 1), 0, 1),
          visible: layer.visible !== false,
          locked: !!layer.locked,
          bindingId: sameKind,
        })
        if (type === 'image') {
          out.assetId = asString(layer.assetId) || null
          const fit = layer.fit
          out.fit = fit === 'fill' || fit === 'cover' || fit === 'none' ? fit : 'contain'
          out.crop = clampCrop(layer.crop)
          out.lockAspect = layer.lockAspect !== false
        } else {
          out.text = asString(layer.text)
          out.fontFamily = FONT_STACKS[layer.fontFamily] ? layer.fontFamily : 'system'
          out.fontSize = clampInt(layer.fontSize, 4, 2000) || 32
          out.fontWeight = clampInt(layer.fontWeight, 100, 900) || 400
          out.color = asString(layer.color) || '#1F2328'
          out.align = layer.align === 'center' || layer.align === 'right' ? layer.align : 'left'
          out.lineHeight = clamp(num(layer.lineHeight, 1.35), 0.5, 4)
          out.italic = !!layer.italic
        }
        return out
      })
    project.designs.push(next)
  }

  // Materialise shared payloads so every member matches its group on open.
  let merged = project
  for (const id of Object.keys(project.bindings)) merged = syncBinding(merged, id)
  return merged
}

export function projectStats(project) {
  const designs = project.designs.length
  let layers = 0
  for (const design of project.designs) layers += design.layers.length
  const bindings = Object.keys(project.bindings).length
  const assets = Object.keys(project.assets).length
  return { designs, layers, bindings, assets }
}
