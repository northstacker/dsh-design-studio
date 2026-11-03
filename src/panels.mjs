/* Design Studio — workbench shell, rails, property editors, dialogs.
 * Concatenated after ui.mjs by build.mjs; no imports.
 */

const DS_PRESETS = [
  { key: 'square', w: 1080, h: 1080 },
  { key: 'portrait', w: 1080, h: 1350 },
  { key: 'story', w: 1080, h: 1920 },
  { key: 'landscape', w: 1920, h: 1080 },
  { key: 'banner', w: 1200, h: 628 },
]

const DS_BG_PRESETS = ['#FFFFFF', '#F5F5F2', '#1F2328', '#F8E71C', '#FF6B5B', '#3B82F6', '#10B981']

const DS_ACCEPT = 'image/png,image/jpeg,image/webp'

function dsIcon(name, size) {
  const s = size || 14
  const common = {
    width: s,
    height: s,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
  }
  if (name === 'image') {
    return h('svg', common, h('rect', { x: 2, y: 3, width: 12, height: 10, rx: 1.6 }), h('circle', { cx: 5.8, cy: 6.5, r: 1.1 }), h('path', { d: 'M3 11.4 l3.2-3.1 2.6 2.5 1.9-1.8 2.3 2.2' }))
  }
  if (name === 'text') {
    return h('svg', common, h('path', { d: 'M3 4 h10' }), h('path', { d: 'M8 4 v8.4' }), h('path', { d: 'M6.2 12.4 h3.6' }))
  }
  if (name === 'link') {
    return h('svg', common, h('path', { d: 'M6.6 9.4 a2.6 2.6 0 0 1 0-3.7 l1.6-1.6 a2.6 2.6 0 0 1 3.7 3.7 l-.9.9' }), h('path', { d: 'M9.4 6.6 a2.6 2.6 0 0 1 0 3.7 l-1.6 1.6 a2.6 2.6 0 0 1-3.7-3.7 l.9-.9' }))
  }
  if (name === 'eye') {
    return h('svg', common, h('path', { d: 'M1.6 8 S4 4.2 8 4.2 14.4 8 14.4 8 12 11.8 8 11.8 1.6 8 1.6 8 Z' }), h('circle', { cx: 8, cy: 8, r: 1.7 }))
  }
  if (name === 'eye-off') {
    return h('svg', common, h('path', { d: 'M2.4 2.4 l11.2 11.2' }), h('path', { d: 'M6.3 4.5 A6.9 6.9 0 0 1 8 4.2 c4 0 6.4 3.8 6.4 3.8 a12 12 0 0 1-2.2 2.5' }), h('path', { d: 'M9.9 11.4 A7 7 0 0 1 8 11.8 c-4 0-6.4-3.8-6.4-3.8 a12 12 0 0 1 2.6-2.8' }))
  }
  if (name === 'lock') {
    return h('svg', common, h('rect', { x: 3.6, y: 7, width: 8.8, height: 6.4, rx: 1.4 }), h('path', { d: 'M5.8 7 V5.4 a2.2 2.2 0 0 1 4.4 0 V7' }))
  }
  if (name === 'unlock') {
    return h('svg', common, h('rect', { x: 3.6, y: 7, width: 8.8, height: 6.4, rx: 1.4 }), h('path', { d: 'M5.8 7 V5.4 a2.2 2.2 0 0 1 4.2-.8' }))
  }
  if (name === 'plus') {
    return h('svg', common, h('path', { d: 'M8 3.4 v9.2' }), h('path', { d: 'M3.4 8 h9.2' }))
  }
  if (name === 'upload') {
    return h('svg', common, h('path', { d: 'M8 10.6 V2.8' }), h('path', { d: 'M4.8 6 L8 2.8 11.2 6' }), h('path', { d: 'M2.6 11.2 v1.6 a.6.6 0 0 0 .6.6 h9.6 a.6.6 0 0 0 .6-.6 v-1.6' }))
  }
  if (name === 'trash') {
    return h('svg', common, h('path', { d: 'M2.6 4.4 h10.8' }), h('path', { d: 'M6.4 2.6 h3.2' }), h('path', { d: 'M4.2 4.4 l.7 8.2 a.8.8 0 0 0 .8.7 h4.6 a.8.8 0 0 0 .8-.7 l.7-8.2' }))
  }
  if (name === 'copy') {
    return h('svg', common, h('rect', { x: 5.4, y: 2.6, width: 8, height: 9, rx: 1.2 }), h('path', { d: 'M10.2 13.4 H3.8 a1.2 1.2 0 0 1-1.2-1.2 V6' }))
  }
  if (name === 'undo') {
    return h('svg', common, h('path', { d: 'M4.4 7.2 L2 5 l2.4-2.2' }), h('path', { d: 'M2.4 5 H9.2 a3.8 3.8 0 0 1 0 7.6 H6.4' }))
  }
  if (name === 'redo') {
    return h('svg', common, h('path', { d: 'M11.6 7.2 L14 5 l-2.4-2.2' }), h('path', { d: 'M13.6 5 H6.8 a3.8 3.8 0 0 0 0 7.6 h2.8' }))
  }
  if (name === 'download') {
    return h('svg', common, h('path', { d: 'M8 2.8 V10.4' }), h('path', { d: 'M4.8 7.2 L8 10.4 11.2 7.2' }), h('path', { d: 'M2.6 11.4 v1.4 a.6.6 0 0 0 .6.6 h9.6 a.6.6 0 0 0 .6-.6 v-1.4' }))
  }
  if (name === 'save') {
    return h('svg', common, h('path', { d: 'M3.4 2.6 h7.2 l2.4 2.4 v8 a.6.6 0 0 1-.6.6 H3.4 a.6.6 0 0 1-.6-.6 V3.2 a.6.6 0 0 1 .6-.6 Z' }), h('path', { d: 'M5.4 2.6 v3.2 h4.2 V2.6' }), h('rect', { x: 5.2, y: 9, width: 5.6, height: 4.4, rx: .5 }))
  }
  if (name === 'artboard') {
    return h('svg', common, h('rect', { x: 2.6, y: 3.2, width: 10.8, height: 9.6, rx: 1.2 }), h('path', { d: 'M5.6 3.2 v9.6' }))
  }
  if (name === 'layers') {
    return h('svg', common, h('path', { d: 'M8 2.4 14 5.4 8 8.4 2 5.4 Z' }), h('path', { d: 'M2 8.6 8 11.6 14 8.6' }), h('path', { d: 'M2 11.2 8 14.2 14 11.2' }))
  }
  return h('svg', common, h('circle', { cx: 8, cy: 8, r: 5 }))
}

/* -------------------------------------------------------------------- store */

const DS_INITIAL = {
  project: null,
  history: createHistory(),
  label: '',
  pending: null,
  loading: true,
  dirty: false,
  saveState: 'idle',
  savingProject: null,
  savedAt: null,
  persistNote: null,
  source: null,
  notice: null,
}

function dsReducer(state, action) {
  switch (action.type) {
    case 'load':
      return Object.assign({}, DS_INITIAL, {
        project: action.project,
        loading: false,
        source: action.source || null,
        savedAt: action.savedAt || null,
        notice: action.notice || null,
        saveState: action.source === 'disk' ? 'saved' : 'idle',
      })
    case 'apply': {
      if (!state.project || !action.project) return state
      const history = action.coalesceKey
        ? pushCoalesced(state.history, state.project, action.label, action.coalesceKey, Date.now())
        : pushEntry(state.history, state.project, action.label)
      return Object.assign({}, state, {
        project: action.project,
        history,
        label: action.label,
        dirty: true,
        pending: null,
      })
    }
    case 'begin':
      return Object.assign({}, state, { pending: { project: state.project, label: action.label } })
    case 'update':
      return Object.assign({}, state, { project: action.project, dirty: true })
    case 'end': {
      if (!state.pending) return state
      if (action.dropped || state.project === state.pending.project) {
        return Object.assign({}, state, { pending: null })
      }
      return Object.assign({}, state, {
        pending: null,
        history: pushEntry(state.history, state.pending.project, state.pending.label),
        label: state.pending.label,
        dirty: true,
      })
    }
    case 'undo': {
      const result = undoStep(state.history, state.project, state.label)
      if (!result) return state
      return Object.assign({}, state, {
        project: result.project,
        history: result.history,
        label: result.undoneLabel || '',
        dirty: true,
        pending: null,
      })
    }
    case 'redo': {
      const result = redoStep(state.history, state.project, state.label)
      if (!result) return state
      return Object.assign({}, state, {
        project: result.project,
        history: result.history,
        label: result.redoneLabel || '',
        dirty: true,
        pending: null,
      })
    }
    case 'save-start':
      return Object.assign({}, state, { saveState: 'saving', savingProject: state.project })
    case 'saved': {
      const stillSame = state.savingProject ? state.project === state.savingProject : true
      return Object.assign({}, state, {
        saveState: 'saved',
        savingProject: null,
        savedAt: action.at,
        persistNote: action.note || null,
        dirty: stillSame ? false : state.dirty,
      })
    }
    case 'save-failed':
      return Object.assign({}, state, {
        saveState: 'failed',
        savingProject: null,
        persistNote: action.note || null,
      })
    case 'notice':
      return Object.assign({}, state, { notice: action.notice })
    case 'project-name':
      return Object.assign({}, state, {
        project: Object.assign({}, state.project, { name: action.name }),
        dirty: true,
      })
    default:
      return state
  }
}

function dsStarterProject() {
  const project = emptyProject('未命名项目')
  const design = createDesign({ name: '海报 1', width: 1080, height: 1080 })
  return addDesign(project, design)
}

async function dsCallHost(body) {
  const urls = []
  try {
    urls.push(new URL(DS_ENDPOINT, document.baseURI).href)
  } catch (error) {
    /* fall through to the origin-rooted form */
  }
  const rooted = location.origin + '/' + DS_ENDPOINT
  if (!urls.includes(rooted)) urls.push(rooted)
  let lastError = null
  for (const url of urls) {
    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (error) {
      lastError = error
      continue
    }
    if (response.status === 404) {
      lastError = new Error('HTTP 404')
      continue
    }
    let payload = null
    try {
      payload = await response.json()
    } catch (error) {
      payload = null
    }
    if (!response.ok) {
      throw new Error(payload && payload.error ? String(payload.error) : 'HTTP ' + response.status)
    }
    if (!payload || payload.ok !== true) throw new Error('unexpected host reply')
    return payload
  }
  throw lastError || new Error('host unavailable')
}

function dsReadFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })
}

function dsDecodeImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('decode-failed'))
    image.src = dataUrl
  })
}

async function dsAssetFromFile(file) {
  const dataUrl = await dsReadFileAsDataUrl(file)
  const image = await dsDecodeImage(dataUrl)
  const name = String(file.name || 'image').replace(/\.[^.]+$/, '')
  return { asset: createAsset(image, name, file.type, dataUrl), image }
}

function dsFormatBytes(bytes) {
  const n = num(bytes, 0)
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

function dsFormatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value) => String(value).padStart(2, '0')
  return pad(date.getHours()) + ':' + pad(date.getMinutes())
}

/* ------------------------------------------------------------- small pieces */

function DsImpactList(props) {
  const { impact, t } = props
  if (!impact || !impact.designs.length) return null
  return h(
    'div',
    { className: 'ds-callout' },
    h('div', { className: 'ds-callout-title' }, dsText(t, 'binding.impactCount', { designs: impact.designs.length, layers: impact.count })),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
      impact.designs.map((design) =>
        h(
          'div',
          { key: design.id, style: { fontSize: '10.5px', color: 'var(--dsw-alias-label-secondary)' } },
          '· ' + design.name + ' — ' + design.layers.map((layer) => layer.name).join('、'),
        ),
      ),
    ),
  )
}

function DsLayerRow(props) {
  const { layer, active, designId, project, t, onSelect, onToggleVisible, onToggleLock, onRename, onReorder, index } = props
  const binding = layer.bindingId ? project.bindings[layer.bindingId] : null
  const [dragOver, setDragOver] = React.useState(false)
  const rowRef = React.useRef(null)
  return h(
    'div',
    {
      ref: rowRef,
      className:
        'ds-layer-row' + (active ? ' is-active' : '') + (layer.visible === false ? ' is-hidden' : '') + (dragOver ? ' is-dragover' : ''),
      onClick: () => onSelect(designId, layer.id),
      draggable: true,
      onDragStart: (event) => {
        event.dataTransfer.effectAllowed = 'move'
        try {
          event.dataTransfer.setData('text/plain', layer.id)
        } catch (error) {
          /* ignore */
        }
        if (props.onDragStart) props.onDragStart(layer.id)
      },
      onDragOver: (event) => {
        event.preventDefault()
        setDragOver(true)
      },
      onDragLeave: () => setDragOver(false),
      onDrop: (event) => {
        event.preventDefault()
        setDragOver(false)
        if (props.onDrop) props.onDrop(index)
      },
      onDoubleClick: () => onRename(designId, layer),
      role: 'button',
      tabIndex: 0,
      onKeyDown: (event) => {
        if (event.key === 'Enter') onSelect(designId, layer.id)
        if (event.key === 'Delete' || event.key === 'Backspace') props.onDelete(designId, layer)
      },
      title: layer.name,
    },
    h(DsIconBtn, {
      title: dsText(t, layer.visible === false ? 'layer.show' : 'layer.hide'),
      active: layer.visible !== false,
      onClick: (event) => {
        event.stopPropagation()
        onToggleVisible(designId, layer)
      },
    }, dsIcon(layer.visible === false ? 'eye-off' : 'eye', 13)),
    h('span', { className: 'ds-layer-kind' }, dsIcon(layer.type === 'text' ? 'text' : 'image', 13)),
    h('span', { className: 'ds-layer-name' }, layer.name),
    binding
      ? h('span', { className: 'ds-badge' + (binding.kind === 'text' ? ' is-text' : ''), title: binding.name },
          dsIcon('link', 9),
          dsText(t, 'binding.badge', { count: bindingMembers(project, binding.id).length }),
        )
      : null,
    h(DsIconBtn, {
      title: dsText(t, layer.locked ? 'layer.unlock' : 'layer.lock'),
      active: !layer.locked,
      onClick: (event) => {
        event.stopPropagation()
        onToggleLock(designId, layer)
      },
    }, dsIcon(layer.locked ? 'lock' : 'unlock', 13)),
    h(DsIconBtn, {
      title: dsText(t, 'layer.delete'),
      onClick: (event) => {
        event.stopPropagation()
        props.onDelete(designId, layer)
      },
    }, dsIcon('trash', 13)),
  )
}

/* ---------------------------------------------------------------- workbench */

function DsWorkbench(props) {
  const { t, closePanel } = props
  const [state, dispatch] = React.useReducer(dsReducer, DS_INITIAL)
  const [selection, setSelection] = React.useState({ designId: null, layerId: null })
  const [tab, setTab] = React.useState('props')
  const [modal, setModal] = React.useState(null)
  const [activeAssetId, setActiveAssetId] = React.useState(null)
  const [uploadMode, setUploadMode] = React.useState('design')
  const [busy, setBusy] = React.useState(false)
  const [cacheVersion, setCacheVersion] = React.useState(0)
  const [bindingsOpen, setBindingsOpen] = React.useState({})
  const [dragLayerId, setDragLayerId] = React.useState(null)
  const fileInputRef = React.useRef(null)
  const replaceInputRef = React.useRef(null)
  const downloadRef = React.useRef(null)
  const uploadTargetRef = React.useRef({ mode: 'design' })

  const onCacheChange = React.useCallback((version) => setCacheVersion(version), [])
  const cacheRef = React.useRef(null)
  if (!cacheRef.current) cacheRef.current = createAssetCache(onCacheChange)
  const cache = cacheRef.current

  const tt = (key, vars) => dsText(t, key, vars)

  const project = state.project
  const activeDesign = project ? findDesign(project, selection.designId) || project.designs[0] || null : null
  const selectedLayer = activeDesign && selection.layerId ? findLayer(activeDesign, selection.layerId) : null
  const canUndo = state.history.past.length > 0
  const canRedo = state.history.future.length > 0

  /* ---- persistence ---------------------------------------------------- */

  const saveProject = React.useCallback(
    async (nextProject, options) => {
      const opts = options || {}
      if (!nextProject) return
      dispatch({ type: 'save-start' })
      try {
        const reply = await dsCallHost({ action: 'save', project: nextProject })
        dispatch({ type: 'saved', at: Date.now(), note: reply.path || null })
        try {
          window.localStorage.removeItem(DS_STORAGE_KEY)
        } catch (error) {
          /* ignore quota errors on cleanup */
        }
        if (opts.announce) {
          dispatch({ type: 'notice', notice: { text: tt('status.savedTo', { path: reply.path || '' }), tone: 'ok' } })
        }
      } catch (error) {
        let note = String((error && error.message) || error)
        let ok = false
        try {
          window.localStorage.setItem(DS_STORAGE_KEY, JSON.stringify(nextProject))
          ok = true
        } catch (storageError) {
          note = note + ' / ' + String((storageError && storageError.message) || storageError)
        }
        dispatch({ type: 'save-failed', note })
        dispatch({
          type: 'notice',
          notice: {
            text: ok ? tt('status.savedLocalOnly') : tt('status.saveFailed', { message: note }),
            tone: 'warn',
          },
        })
      }
    },
    [t],
  )

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      let loaded = null
      let source = null
      let notice = null
      try {
        const reply = await dsCallHost({ action: 'load' })
        if (reply.project) {
          loaded = normalizeProject(reply.project)
          source = loaded ? 'disk' : null
        }
      } catch (error) {
        notice = { text: tt('status.hostUnavailable'), tone: 'warn' }
      }
      if (!loaded) {
        try {
          const raw = window.localStorage.getItem(DS_STORAGE_KEY)
          if (raw) {
            loaded = normalizeProject(JSON.parse(raw))
            source = loaded ? 'local' : null
            if (loaded) notice = { text: tt('status.restoredLocal'), tone: 'warn' }
          }
        } catch (error) {
          loaded = null
        }
      }
      if (cancelled) return
      if (!loaded) loaded = dsStarterProject()
      dispatch({ type: 'load', project: loaded, source, notice })
      cache.ensure(loaded)
      const first = loaded.designs[0]
      if (first) setSelection({ designId: first.id, layerId: null })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!project || state.loading) return
    const snapshot = project
    const timer = window.setTimeout(() => {
      saveProject(snapshot, {})
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [project, state.loading, saveProject])

  React.useEffect(() => {
    if (!state.notice) return
    const tone = state.notice.tone
    const timer = window.setTimeout(() => dispatch({ type: 'notice', notice: null }), tone === 'warn' || tone === 'error' ? 9000 : 4200)
    return () => window.clearTimeout(timer)
  }, [state.notice])

  React.useEffect(() => {
    if (project) cache.ensure(project)
  }, [project, cache])

  /* ---- helpers -------------------------------------------------------- */

  const apply = (next, label, options) => {
    if (!next || next === project) return
    dispatch({ type: 'apply', project: next, label: label || '', coalesceKey: options && options.coalesceKey })
  }

  const notice = (text, tone) => dispatch({ type: 'notice', notice: { text, tone: tone || 'info' } })

  const selectDesign = (designId, layerId) => {
    setSelection({ designId, layerId: layerId === undefined ? null : layerId })
  }

  const onSelect = (designId, layerId) => {
    setSelection({ designId, layerId })
  }

  const onLiveChange = (designId, layerId, patch) => {
    if (!project) return
    dispatch({ type: 'update', project: updateLayer(project, designId, layerId, patch) })
  }

  const onGestureBegin = (label) => dispatch({ type: 'begin', label })
  const onGestureEnd = (dropped) => dispatch({ type: 'end', dropped: dropped === true })

  /* ---- design actions -------------------------------------------------- */

  const addTextLayer = () => {
    if (!activeDesign) return
    const layer = createTextLayer(activeDesign)
    const next = addLayer(project, activeDesign.id, layer)
    apply(next, tt('history.addLayer'))
    setSelection({ designId: activeDesign.id, layerId: layer.id })
    setTab('props')
  }

  const addDesignFromPreset = (preset) => {
    const name = uniqueDesignName(project, tt('design.defaultName', { index: project.designs.length + 1 }))
    const design = createDesign({ name, width: preset.w, height: preset.h })
    apply(addDesign(project, design), tt('history.addDesign'))
    setSelection({ designId: design.id, layerId: null })
  }

  const duplicateDesignAction = (designId) => {
    const design = findDesign(project, designId)
    if (!design) return
    const next = duplicateDesign(project, designId)
    if (!next || next === project) return
    apply(next, tt('history.duplicateDesign'))
    const created = next.designs.find((item) => !project.designs.some((before) => before.id === item.id))
    if (created) setSelection({ designId: created.id, layerId: null })
  }

  const deleteDesignAction = (designId) => {
    if (project.designs.length <= 1) {
      notice(tt('design.cannotDeleteLast'), 'warn')
      return
    }
    const design = findDesign(project, designId)
    const impacted = Object.keys(project.bindings).filter((bindingId) =>
      bindingMembers(project, bindingId).some((member) => member.designId === designId),
    )
    setModal({
      kind: 'confirm',
      title: tt('design.deleteTitle'),
      message: tt('design.deleteMessage', { name: design.name }),
      extra:
        impacted.length > 0
          ? tt('design.deleteBindingNote', { count: impacted.length })
          : tt('design.deleteKeepNote'),
      tone: 'danger',
      confirmLabel: tt('common.delete'),
      onConfirm: () => {
        apply(removeDesign(project, designId), tt('history.deleteDesign'))
        setSelection({ designId: project.designs.find((item) => item.id !== designId).id, layerId: null })
        setModal(null)
      },
    })
  }

  const renameDesignAction = (designId, name) => {
    apply(renameDesign(project, designId, name), tt('history.renameDesign'))
  }

  /* ---- layer actions --------------------------------------------------- */

  const deleteLayerAction = (designId, layer) => {
    apply(removeLayer(project, designId, layer.id), tt('history.deleteLayer'))
    if (selection.layerId === layer.id) setSelection({ designId, layerId: null })
  }

  const duplicateLayerAction = (designId, layerId) => {
    const next = duplicateLayer(project, designId, layerId)
    apply(next, tt('history.duplicateLayer'))
    const design = findDesign(next, designId)
    const index = design.layers.findIndex((item) => item.id === layerId)
    const copy = design.layers[index]
    if (copy) setSelection({ designId, layerId: copy.id })
  }

  const moveLayerAction = (designId, layerId, toIndex) => {
    apply(moveLayer(project, designId, layerId, toIndex), tt('history.reorderLayer'))
  }

  const toggleVisibleAction = (designId, layer) => {
    apply(updateLayer(project, designId, layer.id, { visible: layer.visible === false }), tt('history.toggleVisible'))
  }

  const toggleLockAction = (designId, layer) => {
    apply(updateLayer(project, designId, layer.id, { locked: !layer.locked }), tt('history.toggleLock'))
  }

  /* ---- text content (shared when bound) -------------------------------- */

  const setLayerText = (designId, layer, value) => {
    if (layer.bindingId) {
      const binding = getBinding(project, layer.bindingId)
      if (!binding) return
      apply(setBindingPayload(project, binding.id, { text: value }), tt('history.editText'), {
        coalesceKey: 'text:' + binding.id,
      })
      return
    }
    apply(updateLayer(project, designId, layer.id, { text: value }), tt('history.editText'), {
      coalesceKey: 'text:' + layer.id,
    })
  }

  const updateLayerField = (designId, layer, patch, key) => {
    apply(updateLayer(project, designId, layer.id, patch), tt('history.updateLayer'), {
      coalesceKey: key ? 'field:' + layer.id + ':' + key : undefined,
    })
  }

  /* ---- images ---------------------------------------------------------- */

  const addImageAssetToDesign = (asset, designId) => {
    const design = findDesign(project, designId)
    if (!design) return
    const layer = createImageLayer(design, asset)
    apply(addLayer(project, design.id, layer), tt('history.addImage'))
    setSelection({ designId: design.id, layerId: layer.id })
  }

  const replaceImageAction = (designId, layer, assetId, baseProject) => {
    const source = baseProject || project
    const design = findDesign(source, designId)
    const live = design ? findLayer(design, layer.id) : null
    if (!live) return
    if (live.bindingId) {
      const binding = getBinding(source, live.bindingId)
      if (!binding) return
      const impact = bindingImpact(source, binding.id)
      setModal({
        kind: 'confirm',
        title: tt('image.replaceSharedTitle'),
        message: tt('image.replaceSharedMessage', { name: binding.name }),
        impact,
        confirmLabel: tt('common.replace'),
        onConfirm: () => {
          apply(setBindingPayload(source, binding.id, { assetId }), tt('history.replaceSharedImage'))
          setModal(null)
        },
      })
      return
    }
    apply(updateLayer(source, designId, live.id, { assetId }), tt('history.replaceImage'))
  }

  const handleFiles = async (fileList, mode) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setBusy(true)
    try {
      const skipped = []
      const imported = []
      for (const file of files) {
        if (!isSupportedImageMime(file.type)) {
          skipped.push(file.name)
          continue
        }
        try {
          imported.push(await dsAssetFromFile(file))
        } catch (error) {
          skipped.push(file.name)
        }
      }
      if (!imported.length) {
        notice(tt('upload.noneAccepted'), 'error')
        return
      }
      let next = project
      let lastDesignId = activeDesign ? activeDesign.id : null
      let lastLayerId = null
      if (mode === 'layer' && activeDesign) {
        for (const item of imported) {
          next = addAsset(next, item.asset)
          const design = findDesign(next, activeDesign.id)
          const layer = createImageLayer(design, item.asset)
          next = addLayer(next, design.id, layer)
          lastDesignId = design.id
          lastLayerId = layer.id
        }
      } else {
        const base = next.designs.length
        imported.forEach((item, index) => {
          next = addAsset(next, item.asset)
          const design = createDesign({
            name: uniqueDesignName(next, item.asset.name || tt('design.defaultName', { index: base + index + 1 })),
            width: item.asset.width,
            height: item.asset.height,
            background: '#FFFFFF',
          })
          next = addDesign(next, design)
          const layer = createImageLayer(design, item.asset, { coverCanvas: true, name: item.asset.name })
          next = addLayer(next, design.id, layer)
          lastDesignId = design.id
          lastLayerId = layer.id
        })
      }
      apply(next, tt('history.importImages'))
      cache.ensure(next)
      if (lastDesignId) setSelection({ designId: lastDesignId, layerId: lastLayerId })
      if (skipped.length) notice(tt('upload.partial', { count: skipped.length }), 'warn')
      else notice(tt('upload.done', { count: imported.length }), 'ok')
      setModal(null)
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /* ---- bindings -------------------------------------------------------- */

  const createBindingAction = (layer, name) => {
    if (!activeDesign) return
    const kind = layer.type
    const payload = kind === 'image' ? { assetId: layer.assetId } : { text: layer.text }
    const binding = makeBinding(kind, payload, name || tt('binding.defaultName', { kind: kind === 'image' ? tt('binding.kindImage') : tt('binding.kindText') }))
    let next = addBinding(project, binding)
    next = attachBinding(next, activeDesign.id, layer.id, binding.id)
    apply(next, tt('history.createBinding'))
    setBindingsOpen(Object.assign({}, bindingsOpen, { [binding.id]: true }))
    setModal(null)
    notice(tt('binding.created', { name: binding.name }), 'ok')
  }

  const joinBindingAction = (layer, bindingId) => {
    if (!activeDesign) return
    apply(attachBinding(project, activeDesign.id, layer.id, bindingId), tt('history.joinBinding'))
    setModal(null)
  }

  const detachAction = (designId, layerId) => {
    apply(detachBinding(project, designId, layerId), tt('history.detachBinding'))
  }

  const removeBindingAction = (bindingId) => {
    const binding = getBinding(project, bindingId)
    if (!binding) return
    const impact = bindingImpact(project, bindingId)
    setModal({
      kind: 'confirm',
      title: tt('binding.deleteTitle'),
      message: tt('binding.deleteMessage', { name: binding.name }),
      impact,
      extra: tt('binding.deleteNote'),
      tone: 'danger',
      confirmLabel: tt('common.delete'),
      onConfirm: () => {
        apply(removeBinding(project, bindingId), tt('history.deleteBinding'))
        setModal(null)
      },
    })
  }

  const renameBindingAction = (bindingId, name) => {
    apply(renameBinding(project, bindingId, name), tt('history.renameBinding'))
  }

  /* ---- export ---------------------------------------------------------- */

  const downloadBlob = (blob, name) => {
    const anchor = downloadRef.current
    if (!anchor) return
    const url = URL.createObjectURL(blob)
    anchor.href = url
    anchor.download = name
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 20000)
  }

  /* ---- render: toolbar -------------------------------------------------- */

  const toolbar = h(
    'div',
    { className: 'ds-toolbar' },
    h(
      'div',
      { className: 'ds-toolbar-group' },
      h('input', {
        className: 'ds-title-input',
        value: project ? project.name : '',
        spellCheck: false,
        title: tt('project.name'),
        'aria-label': tt('project.name'),
        onChange: (event) => dispatch({ type: 'project-name', name: event.target.value }),
      }),
    ),
    h('span', { className: 'ds-toolbar-sep' }),
    h(
      'div',
      { className: 'ds-toolbar-group' },
      h(
        DsBtn,
        {
          onClick: () => {
            uploadTargetRef.current = { mode: 'design' }
            setModal({ kind: 'upload' })
          },
          title: tt('toolbar.upload'),
          disabled: !project,
        },
        dsIcon('upload'),
        tt('toolbar.upload'),
      ),
      h(
        DsBtn,
        { onClick: () => setModal({ kind: 'newDesign' }), title: tt('toolbar.newDesign'), disabled: !project },
        dsIcon('plus'),
        tt('toolbar.newDesign'),
      ),
    ),
    h('span', { className: 'ds-toolbar-sep' }),
    h(
      'div',
      { className: 'ds-toolbar-group' },
      h(
        DsIconBtn,
        {
          title: canUndo ? tt('toolbar.undoHint', { label: state.label ? tt(state.label) : '' }) : tt('toolbar.undo'),
          onClick: () => dispatch({ type: 'undo' }),
          disabled: !canUndo,
        },
        dsIcon('undo'),
      ),
      h(
        DsIconBtn,
        {
          title: canRedo ? tt('toolbar.redoHint') : tt('toolbar.redo'),
          onClick: () => dispatch({ type: 'redo' }),
          disabled: !canRedo,
        },
        dsIcon('redo'),
      ),
    ),
    h('div', { className: 'ds-toolbar-spacer' }),
    h(
      'div',
      { className: 'ds-toolbar-group' },
      h(
        DsBtn,
        {
          onClick: () => saveProject(project, { announce: true }),
          disabled: !project || state.saveState === 'saving',
          title: tt('toolbar.save'),
        },
        dsIcon('save'),
        state.saveState === 'saving' ? tt('toolbar.saving') : tt('toolbar.save'),
      ),
      h(
        DsBtn,
        {
          kind: 'primary',
          onClick: () => setModal({ kind: 'export' }),
          disabled: !project || !project.designs.length,
          title: tt('toolbar.export'),
        },
        dsIcon('download'),
        tt('toolbar.export'),
      ),
    ),
  )

  /* ---- render: left rail ------------------------------------------------ */

  const designs = project ? project.designs : []
  const assets = project ? Object.values(project.assets) : []

  const leftRail = h(
    'div',
    { className: 'ds-rail is-left' },
    h(
      'div',
      { className: 'ds-rail-head' },
      tt('rail.designs'),
      h('span', { className: 'ds-rail-count' }, '(' + designs.length + ')'),
      h(
        'div',
        { className: 'ds-rail-head-actions' },
        h(DsIconBtn, { title: tt('toolbar.newDesign'), onClick: () => setModal({ kind: 'newDesign' }) }, dsIcon('plus', 13)),
      ),
    ),
    h(
      'div',
      { className: 'ds-scroll', style: { flex: '1 1 46%', minHeight: '90px' } },
      designs.length === 0
        ? h('div', { className: 'ds-empty' }, tt('design.empty'))
        : designs.map((design) =>
            h(
              'div',
              {
                key: design.id,
                className: 'ds-design-card' + (activeDesign && activeDesign.id === design.id ? ' is-active' : ''),
                onClick: () => selectDesign(design.id, null),
                role: 'button',
                tabIndex: 0,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') selectDesign(design.id, null)
                },
                title: design.name + ' · ' + design.width + '×' + design.height,
              },
              h('div', { className: 'ds-design-thumb' }, h(DsThumb, { project, design, cache, cacheVersion, maxW: 38, maxH: 38 })),
              h(
                'div',
                { className: 'ds-design-meta' },
                h('span', { className: 'ds-design-name' }, design.name),
                h('span', { className: 'ds-design-sub' }, design.width + '×' + design.height + ' · ' + design.layers.length + ' ' + tt('design.layersUnit')),
              ),
              h(
                'div',
                { className: 'ds-design-card-actions' },
                h(DsIconBtn, {
                  title: tt('design.duplicate'),
                  onClick: (event) => {
                    event.stopPropagation()
                    duplicateDesignAction(design.id)
                  },
                }, dsIcon('copy', 12)),
                h(DsIconBtn, {
                  title: tt('design.rename'),
                  onClick: (event) => {
                    event.stopPropagation()
                    setModal({
                      kind: 'rename',
                      title: tt('design.rename'),
                      value: design.name,
                      onConfirm: (value) => {
                        renameDesignAction(design.id, value)
                        setModal(null)
                      },
                    })
                  },
                }, h('span', { style: { fontSize: '11px' } }, 'T')),
                h(DsIconBtn, {
                  title: tt('design.delete'),
                  onClick: (event) => {
                    event.stopPropagation()
                    deleteDesignAction(design.id)
                  },
                }, dsIcon('trash', 12)),
              ),
            ),
          ),
    ),
    h(
      'div',
      { className: 'ds-rail-head' },
      tt('rail.assets'),
      h('span', { className: 'ds-rail-count' }, '(' + assets.length + ')'),
    ),
    h(
      'div',
      { className: 'ds-scroll', style: { flex: '1 1 54%', minHeight: '80px' } },
      h(
        'div',
        {
          className: 'ds-upload-zone',
          onClick: () => {
            uploadTargetRef.current = { mode: 'design' }
            setModal({ kind: 'upload' })
          },
          role: 'button',
          tabIndex: 0,
        },
        dsIcon('upload', 15),
        h('span', null, tt('rail.upload')),
      ),
      assets.length === 0
        ? h('div', { className: 'ds-empty' }, tt('asset.empty'))
        : h(
            'div',
            { className: 'ds-asset-grid' },
            assets.map((asset) =>
              h(
                'div',
                {
                  key: asset.id,
                  className: 'ds-asset' + (activeAssetId === asset.id ? ' is-active' : ''),
                  style: { backgroundImage: 'url("' + asset.dataUrl + '")' },
                  title: asset.name + ' · ' + asset.width + '×' + asset.height,
                  onClick: () => {
                    setActiveAssetId(asset.id)
                    if (!activeDesign) return
                    if (selectedLayer && selectedLayer.type === 'image') {
                      replaceImageAction(activeDesign.id, selectedLayer, asset.id)
                    } else {
                      addImageAssetToDesign(asset, activeDesign.id)
                    }
                  },
                },
                h('span', { className: 'ds-asset-badge' }, asset.name),
              ),
            ),
          ),
    ),
  )

  /* ---- render: right rail ----------------------------------------------- */

  const boundLayer = selectedLayer && selectedLayer.bindingId ? getBinding(project, selectedLayer.bindingId) : null
  const boundImpact = boundLayer ? bindingImpact(project, boundLayer.id) : null

  const renderCommonProps = () => {
    if (!selectedLayer) return null
    const designId = activeDesign.id
    return h(
      React.Fragment,
      null,
      h('div', { className: 'ds-section-title' }, tt('props.transform')),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('props.x') }, h(DsNum, { value: round(selectedLayer.x, 1), onChange: (value) => updateLayerField(designId, selectedLayer, { x: value }) })),
        h(DsField, { label: tt('props.y') }, h(DsNum, { value: round(selectedLayer.y, 1), onChange: (value) => updateLayerField(designId, selectedLayer, { y: value }) })),
      ),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('props.w') }, h(DsNum, { value: round(selectedLayer.w, 1), min: 1, onChange: (value) => updateLayerField(designId, selectedLayer, { w: Math.max(1, value) }) })),
        h(DsField, { label: tt('props.h') }, h(DsNum, { value: round(selectedLayer.h, 1), min: 1, onChange: (value) => updateLayerField(designId, selectedLayer, { h: Math.max(1, value) }) })),
      ),
      h(DsRange, {
        label: tt('props.rotation'),
        min: -180,
        max: 180,
        step: 1,
        value: round(selectedLayer.rotation, 0),
        format: (value) => value + '°',
        onChange: (value) => updateLayerField(designId, selectedLayer, { rotation: value }),
      }),
      h(DsRange, {
        label: tt('props.opacity'),
        min: 0,
        max: 100,
        step: 1,
        value: Math.round(clamp(num(selectedLayer.opacity, 1), 0, 1) * 100),
        format: (value) => value + '%',
        onChange: (value) => updateLayerField(designId, selectedLayer, { opacity: value / 100 }),
      }),
      h(
        'div',
        { className: 'ds-row', style: { gap: '10px' } },
        h(DsCheck, {
          label: tt('props.visible'),
          checked: selectedLayer.visible !== false,
          onChange: (value) => updateLayerField(designId, selectedLayer, { visible: value }),
        }),
        h(DsCheck, {
          label: tt('props.locked'),
          checked: !!selectedLayer.locked,
          onChange: (value) => updateLayerField(designId, selectedLayer, { locked: value }),
        }),
      ),
    )
  }

  const renderImageProps = () => {
    if (!selectedLayer || selectedLayer.type !== 'image') return null
    const designId = activeDesign.id
    const assetId = resolveImageAssetId(project, selectedLayer)
    const asset = getAsset(project, assetId)
    const fitOptions = [
      { value: 'contain', label: tt('image.fitContain') },
      { value: 'cover', label: tt('image.fitCover') },
      { value: 'fill', label: tt('image.fitFill') },
      { value: 'none', label: tt('image.fitNone') },
    ]
    return h(
      React.Fragment,
      null,
      h('div', { className: 'ds-section-title' }, tt('props.image')),
      h('div', { className: 'ds-hint' }, asset ? asset.name + ' · ' + asset.width + '×' + asset.height : tt('image.noAsset')),
      h(DsField, { label: tt('image.fit') }, h(DsSelect, { value: selectedLayer.fit || 'contain', options: fitOptions, onChange: (value) => updateLayerField(designId, selectedLayer, { fit: value }) })),
      h(DsCheck, {
        label: tt('image.lockAspect'),
        checked: selectedLayer.lockAspect !== false,
        onChange: (value) => updateLayerField(designId, selectedLayer, { lockAspect: value }),
      }),
      h(
        'div',
        { className: 'ds-row', style: { gap: '6px' } },
        h(
          DsBtn,
          {
            small: true,
            onClick: () => {
              replaceInputRef.current.dataset.design = designId
              replaceInputRef.current.dataset.layer = selectedLayer.id
              replaceInputRef.current.click()
            },
          },
          dsIcon('upload', 12),
          tt('image.replace'),
        ),
        h(
          DsBtn,
          {
            small: true,
            onClick: () => {
              const crop = clampCrop(selectedLayer.crop)
              if (crop.w === 1 && crop.h === 1 && crop.x === 0 && crop.y === 0) {
                updateLayerField(designId, selectedLayer, { crop: { x: 0.15, y: 0.15, w: 0.7, h: 0.7 } })
              } else {
                updateLayerField(designId, selectedLayer, { crop: { x: 0, y: 0, w: 1, h: 1 } })
              }
            },
          },
          dsIcon('artboard', 12),
          tt('image.resetCrop'),
        ),
      ),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('image.cropW') }, h(DsNum, {
          value: Math.round(clampCrop(selectedLayer.crop).w * 100),
          min: 2,
          max: 100,
          onChange: (value) => {
            const crop = clampCrop(selectedLayer.crop)
            updateLayerField(designId, selectedLayer, { crop: clampCrop({ x: crop.x, y: crop.y, w: clamp(value / 100, 0.02, 1 - crop.x), h: crop.h }) })
          },
        })),
        h(DsField, { label: tt('image.cropH') }, h(DsNum, {
          value: Math.round(clampCrop(selectedLayer.crop).h * 100),
          min: 2,
          max: 100,
          onChange: (value) => {
            const crop = clampCrop(selectedLayer.crop)
            updateLayerField(designId, selectedLayer, { crop: clampCrop({ x: crop.x, y: crop.y, w: crop.w, h: clamp(value / 100, 0.02, 1 - crop.y) }) })
          },
        })),
      ),
      h('div', { className: 'ds-hint' }, tt('image.cropHint')),
    )
  }

  const renderTextProps = () => {
    if (!selectedLayer || selectedLayer.type !== 'text') return null
    const designId = activeDesign.id
    const fontOptions = FONT_OPTIONS.map((value) => ({ value, label: tt('font.' + value) }))
    const weightOptions = FONT_WEIGHTS.map((value) => ({ value: String(value), label: String(value) }))
    const alignOptions = [
      { value: 'left', label: tt('text.alignLeft') },
      { value: 'center', label: tt('text.alignCenter') },
      { value: 'right', label: tt('text.alignRight') },
    ]
    return h(
      React.Fragment,
      null,
      h('div', { className: 'ds-section-title' }, tt('props.text')),
      boundImpact
        ? h(DsImpactList, { impact: boundImpact, t })
        : null,
      h(DsField, { label: tt('text.content') }, h('textarea', {
        className: 'ds-textarea',
        value: resolveText(project, selectedLayer),
        spellCheck: false,
        onChange: (event) => setLayerText(designId, selectedLayer, event.target.value),
        onKeyDown: (event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) event.currentTarget.blur()
        },
      })),
      h('div', { className: 'ds-hint' }, tt('text.multilineHint')),
      h(DsField, { label: tt('text.font') }, h(DsSelect, { value: selectedLayer.fontFamily || 'system', options: fontOptions, onChange: (value) => updateLayerField(designId, selectedLayer, { fontFamily: value }) })),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('text.size') }, h(DsNum, {
          value: selectedLayer.fontSize,
          min: 4,
          max: 800,
          onChange: (value) => updateLayerField(designId, selectedLayer, { fontSize: Math.round(value) }),
        })),
        h(DsField, { label: tt('text.weight') }, h(DsSelect, {
          value: String(selectedLayer.fontWeight || 400),
          options: weightOptions,
          onChange: (value) => updateLayerField(designId, selectedLayer, { fontWeight: parseInt(value, 10) }),
        })),
      ),
      h(DsField, { label: tt('text.color') }, h(DsColor, { value: selectedLayer.color || '#1F2328', onChange: (value) => updateLayerField(designId, selectedLayer, { color: value }, 'color') })),
      h(
        'div',
        { className: 'ds-swatch-row' },
        DS_BG_PRESETS.map((color) =>
          h('button', {
            key: color,
            type: 'button',
            className: 'ds-swatch',
            style: { background: color },
            title: color,
            'aria-label': color,
            onClick: () => updateLayerField(designId, selectedLayer, { color }),
          }),
        ),
      ),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('text.align') }, h(DsSelect, {
          value: selectedLayer.align || 'left',
          options: alignOptions,
          onChange: (value) => updateLayerField(designId, selectedLayer, { align: value }),
        })),
        h(DsField, { label: tt('text.lineHeight') }, h(DsNum, {
          value: round(selectedLayer.lineHeight, 2),
          min: 0.6,
          max: 4,
          step: 0.05,
          onChange: (value) => updateLayerField(designId, selectedLayer, { lineHeight: clamp(value, 0.6, 4) }),
        })),
      ),
      h(DsCheck, {
        label: tt('text.italic'),
        checked: !!selectedLayer.italic,
        onChange: (value) => updateLayerField(designId, selectedLayer, { italic: value }),
      }),
    )
  }

  const renderCanvasProps = () => {
    if (!activeDesign) return null
    const designId = activeDesign.id
    return h(
      React.Fragment,
      null,
      h('div', { className: 'ds-section-title' }, tt('props.canvas')),
      h(DsField, { label: tt('props.name') }, h('input', {
        className: 'ds-input',
        value: activeDesign.name,
        onChange: (event) => renameDesignAction(designId, event.target.value),
      })),
      h(
        'div',
        { className: 'ds-grid2' },
        h(DsField, { label: tt('props.width') }, h(DsNum, {
          value: activeDesign.width,
          min: 1,
          max: 20000,
          onChange: (value) => apply(updateDesign(project, designId, { width: clampInt(value, 1, 20000) }), tt('history.canvasSize')),
        })),
        h(DsField, { label: tt('props.height') }, h(DsNum, {
          value: activeDesign.height,
          min: 1,
          max: 20000,
          onChange: (value) => apply(updateDesign(project, designId, { height: clampInt(value, 1, 20000) }), tt('history.canvasSize')),
        })),
      ),
      h(DsField, { label: tt('props.background') }, h(DsColor, {
        value: activeDesign.background,
        onChange: (value) => apply(updateDesign(project, designId, { background: value }), tt('history.canvasBackground'), { coalesceKey: 'bg:' + designId }),
      })),
      h(DsCheck, {
        label: tt('props.transparent'),
        checked: !!activeDesign.transparent,
        onChange: (value) => apply(updateDesign(project, designId, { transparent: value }), tt('history.canvasTransparent')),
      }),
      h('div', { className: 'ds-hint' }, tt('props.canvasHint')),
      h('div', { className: 'ds-divider' }),
      h('div', { className: 'ds-hint' }, tt('props.emptySelectionHint')),
    )
  }

  const renderBindingProps = () => {
    if (!selectedLayer) {
      return h('div', { className: 'ds-empty' }, tt('binding.selectLayerFirst'))
    }
    const designId = activeDesign.id
    if (boundLayer) {
      return h(
        React.Fragment,
        null,
        h('div', { className: 'ds-section-title' }, tt('binding.title')),
        h(
          'div',
          { className: 'ds-callout' },
          h('div', { className: 'ds-callout-title' }, tt('binding.boundTo', { name: boundLayer.name })),
          h('div', { className: 'ds-hint' }, boundLayer.kind === 'image' ? tt('binding.sharedImage') : tt('binding.sharedText')),
        ),
        h(DsImpactList, { impact: boundImpact, t }),
        h('div', { className: 'ds-divider' }),
        h(
          'div',
          { className: 'ds-row', style: { gap: '6px', flexWrap: 'wrap' } },
          h(
            DsBtn,
            {
              small: true,
              onClick: () =>
                setModal({
                  kind: 'rename',
                  title: tt('binding.rename'),
                  value: boundLayer.name,
                  onConfirm: (value) => {
                    renameBindingAction(boundLayer.id, value)
                    setModal(null)
                  },
                }),
            },
            tt('binding.rename'),
          ),
          h(DsBtn, { small: true, kind: 'danger', onClick: () => detachAction(designId, selectedLayer.id) }, tt('binding.detach')),
          h(DsBtn, { small: true, kind: 'danger', onClick: () => removeBindingAction(boundLayer.id) }, tt('binding.deleteGroup')),
        ),
        h('div', { className: 'ds-hint' }, tt('binding.detachHint')),
        h('div', { className: 'ds-section-title' }, tt('binding.members')),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
          bindingMembers(project, boundLayer.id).map((member) =>
            h(
              'div',
              { key: member.designId + member.layerId, className: 'ds-member-row' },
              h('span', { className: 'ds-member-name' }, member.designName + ' · ' + member.layerName),
              h(
                DsIconBtn,
                {
                  title: tt('binding.locate'),
                  onClick: () => setSelection({ designId: member.designId, layerId: member.layerId }),
                },
                dsIcon('artboard', 12),
              ),
            ),
          ),
        ),
      )
    }
    const candidates = bindingsOfKind(project, selectedLayer.type)
    return h(
      React.Fragment,
      null,
      h('div', { className: 'ds-section-title' }, tt('binding.title')),
      h('div', { className: 'ds-hint' }, tt('binding.unboundHint')),
      h(
        DsBtn,
        {
          kind: 'primary',
          onClick: () =>
            setModal({
              kind: 'rename',
              title: tt('binding.create'),
              value: tt('binding.defaultName', { kind: selectedLayer.type === 'image' ? tt('binding.kindImage') : tt('binding.kindText') }),
              confirmLabel: tt('binding.create'),
              onConfirm: (value) => createBindingAction(selectedLayer, value),
            }),
        },
        dsIcon('link', 12),
        tt('binding.create'),
      ),
      candidates.length > 0
        ? h(
            React.Fragment,
            null,
            h('div', { className: 'ds-section-title' }, tt('binding.joinExisting')),
            candidates.map((binding) => {
              const impact = bindingImpact(project, binding.id)
              return h(
                'div',
                { key: binding.id, className: 'ds-binding-row' },
                h(
                  'div',
                  { className: 'ds-binding-head' },
                  h('span', { className: 'ds-binding-name' }, binding.name),
                  h('span', { className: 'ds-hint' }, dsText(t, 'binding.membersCount', { count: impact.count })),
                ),
                impact.count
                  ? h('div', { className: 'ds-hint' }, impact.designs.map((design) => design.name).join('、'))
                  : null,
                h(
                  'div',
                  null,
                  h(DsBtn, { small: true, onClick: () => joinBindingAction(selectedLayer, binding.id) }, tt('binding.join')),
                ),
              )
            }),
          )
        : h('div', { className: 'ds-hint' }, tt('binding.noCandidates')),
    )
  }

  const allBindings = project ? Object.values(project.bindings) : []

  const rightRail = h(
    'div',
    { className: 'ds-rail is-right' },
    h(
      'div',
      { className: 'ds-rail-head' },
      tt('rail.layers'),
      h('span', { className: 'ds-rail-count' }, activeDesign ? '(' + activeDesign.layers.length + ')' : ''),
      h(
        'div',
        { className: 'ds-rail-head-actions' },
        h(DsIconBtn, { title: tt('layer.addText'), onClick: addTextLayer, disabled: !activeDesign }, dsIcon('text', 13)),
        h(DsIconBtn, {
          title: tt('layer.addImage'),
          onClick: () => {
            uploadTargetRef.current = { mode: 'layer' }
            setModal({ kind: 'upload' })
          },
          disabled: !activeDesign,
        }, dsIcon('image', 13)),
      ),
    ),
    h(
      'div',
      { className: 'ds-scroll', style: { flex: '1 1 40%', minHeight: '110px' } },
      !activeDesign
        ? h('div', { className: 'ds-empty' }, tt('layer.emptyDesign'))
        : activeDesign.layers.length === 0
          ? h('div', { className: 'ds-empty' }, tt('layer.empty'))
          : activeDesign.layers.map((layer, index) =>
              h(DsLayerRow, {
                key: layer.id,
                layer,
                index,
                designId: activeDesign.id,
                project,
                t,
                active: selection.layerId === layer.id,
                onSelect,
                onToggleVisible: toggleVisibleAction,
                onToggleLock: toggleLockAction,
                onDelete: deleteLayerAction,
                onRename: (designId, target) =>
                  setModal({
                    kind: 'rename',
                    title: tt('layer.rename'),
                    value: target.name,
                    onConfirm: (value) => {
                      apply(updateLayer(project, designId, target.id, { name: value }), tt('history.renameLayer'))
                      setModal(null)
                    },
                  }),
                onDragStart: (layerId) => setDragLayerId(layerId),
                onDrop: (toIndex) => {
                  if (dragLayerId && dragLayerId !== layer.id) moveLayerAction(activeDesign.id, dragLayerId, toIndex)
                  setDragLayerId(null)
                },
              }),
            ),
    ),
    h(
      'div',
      { className: 'ds-tabs', role: 'tablist' },
      h('button', {
        type: 'button',
        role: 'tab',
        className: 'ds-tab' + (tab === 'props' ? ' is-active' : ''),
        onClick: () => setTab('props'),
        'aria-selected': tab === 'props',
      }, tt('tab.props')),
      h('button', {
        type: 'button',
        role: 'tab',
        className: 'ds-tab' + (tab === 'binding' ? ' is-active' : ''),
        onClick: () => setTab('binding'),
        'aria-selected': tab === 'binding',
      }, tt('tab.bindings') + (allBindings.length ? ' (' + allBindings.length + ')' : '')),
    ),
    h(
      'div',
      { className: 'ds-scroll' },
      tab === 'props'
        ? h(
            'div',
            { className: 'ds-props' },
            selectedLayer
              ? h(
                  React.Fragment,
                  null,
                  h(DsField, { label: tt('props.layerName') }, h('input', {
                    className: 'ds-input',
                    value: selectedLayer.name,
                    onChange: (event) => apply(updateLayer(project, activeDesign.id, selectedLayer.id, { name: event.target.value }), tt('history.renameLayer'), { coalesceKey: 'name:' + selectedLayer.id }),
                  })),
                  h(
                    'div',
                    { className: 'ds-row', style: { gap: '6px' } },
                    h(DsBtn, { small: true, onClick: () => duplicateLayerAction(activeDesign.id, selectedLayer.id) }, dsIcon('copy', 12), tt('layer.duplicate')),
                    h(DsBtn, { small: true, kind: 'danger', onClick: () => deleteLayerAction(activeDesign.id, selectedLayer) }, dsIcon('trash', 12), tt('layer.delete')),
                  ),
                  h('div', { className: 'ds-divider' }),
                  renderCommonProps(),
                  renderImageProps(),
                  renderTextProps(),
                )
              : renderCanvasProps(),
          )
        : h('div', { className: 'ds-props' }, renderBindingProps()),
    ),
  )

  /* ---- render: status -------------------------------------------------- */

  const stats = project ? projectStats(project) : null
  const statusTone = state.notice ? state.notice.tone : state.saveState === 'failed' ? 'error' : state.saveState === 'saving' ? 'busy' : 'idle'
  const statusText = state.notice
    ? state.notice.text
    : state.saveState === 'saving'
      ? tt('status.saving')
      : state.saveState === 'failed'
        ? tt('status.saveFailedShort')
        : state.savedAt
          ? tt('status.savedAt', { time: dsFormatTime(state.savedAt) }) + (state.persistNote ? ' · ' + state.persistNote : '')
          : tt('status.ready')

  const statusBar = h(
    'div',
    { className: 'ds-statusbar' },
    h('span', { className: 'ds-status-dot' + (statusTone === 'ok' ? ' is-ok' : statusTone === 'warn' || statusTone === 'busy' ? ' is-busy' : statusTone === 'error' ? ' is-error' : '') }),
    h(
      'span',
      { className: 'ds-status-text' + (statusTone === 'error' ? ' is-error' : statusTone === 'ok' ? ' is-ok' : '') },
      statusText,
    ),
    stats
      ? h('span', { className: 'ds-status-meta' }, tt('status.stats', { designs: stats.designs, layers: stats.layers, bindings: stats.bindings }))
      : null,
  )

  /* ---- render: modals -------------------------------------------------- */

  const modalNode = (() => {
    if (!modal) return null
    if (modal.kind === 'confirm') {
      return h(
        DsModal,
        {
          title: modal.title,
          onClose: () => setModal(null),
          closeLabel: tt('common.close'),
          footer: [
            h(DsBtn, { key: 'cancel', onClick: () => setModal(null) }, tt('common.cancel')),
            h(
              DsBtn,
              { key: 'ok', kind: modal.tone === 'danger' ? 'danger' : 'primary', onClick: modal.onConfirm },
              modal.confirmLabel || tt('common.confirm'),
            ),
          ],
        },
        h('div', { className: 'ds-hint' }, modal.message),
        modal.impact ? h(DsImpactList, { impact: modal.impact, t }) : null,
        modal.extra ? h('div', { className: 'ds-hint' }, modal.extra) : null,
      )
    }
    if (modal.kind === 'rename') {
      const RenameDialog = function RenameDialog() {
        const [value, setValue] = React.useState(modal.value || '')
        return h(
          DsModal,
          {
            title: modal.title,
            onClose: () => setModal(null),
            closeLabel: tt('common.close'),
            footer: [
              h(DsBtn, { key: 'cancel', onClick: () => setModal(null) }, tt('common.cancel')),
              h(DsBtn, {
                key: 'ok',
                kind: 'primary',
                onClick: () => {
                  if (String(value).trim()) modal.onConfirm(String(value).trim())
                  else setModal(null)
                },
              }, modal.confirmLabel || tt('common.confirm')),
            ],
          },
          h('input', {
            className: 'ds-input',
            value,
            autoFocus: true,
            onChange: (event) => setValue(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && String(value).trim()) modal.onConfirm(String(value).trim())
            },
          }),
        )
      }
      return h(RenameDialog)
    }
    if (modal.kind === 'newDesign') {
      const NewDesignDialog = function NewDesignDialog() {
        const [preset, setPreset] = React.useState('square')
        const [custom, setCustom] = React.useState({ w: 1080, h: 1080 })
        const [name, setName] = React.useState('')
        const active = DS_PRESETS.find((item) => item.key === preset)
        const width = preset === 'custom' ? custom.w : active.w
        const height = preset === 'custom' ? custom.h : active.h
        return h(
          DsModal,
          {
            title: tt('design.newTitle'),
            onClose: () => setModal(null),
            closeLabel: tt('common.close'),
            footer: [
              h(DsBtn, { key: 'cancel', onClick: () => setModal(null) }, tt('common.cancel')),
              h(DsBtn, {
                key: 'ok',
                kind: 'primary',
                onClick: () => {
                  const designName = String(name).trim() || uniqueDesignName(project, tt('design.defaultName', { index: project.designs.length + 1 }))
                  const design = createDesign({ name: designName, width, height })
                  apply(addDesign(project, design), tt('history.addDesign'))
                  setSelection({ designId: design.id, layerId: null })
                  setModal(null)
                },
              }, tt('common.create')),
            ],
          },
          h(DsField, { label: tt('design.name') }, h('input', {
            className: 'ds-input',
            value: name,
            placeholder: tt('design.namePlaceholder'),
            onChange: (event) => setName(event.target.value),
          })),
          h(
            'div',
            { className: 'ds-radio-row' },
            DS_PRESETS.map((item) =>
              h(
                'label',
                { key: item.key, className: 'ds-radio' + (preset === item.key ? ' is-active' : '') },
                h('input', { type: 'radio', name: 'ds-preset', checked: preset === item.key, onChange: () => setPreset(item.key) }),
                h(
                  'span',
                  { className: 'ds-radio-text' },
                  h('span', { className: 'ds-radio-title' }, tt('preset.' + item.key)),
                  h('span', { className: 'ds-radio-sub' }, item.w + ' × ' + item.h + ' px'),
                ),
              ),
            ),
            h(
              'label',
              { className: 'ds-radio' + (preset === 'custom' ? ' is-active' : '') },
              h('input', { type: 'radio', name: 'ds-preset', checked: preset === 'custom', onChange: () => setPreset('custom') }),
              h(
                'span',
                { className: 'ds-radio-text' },
                h('span', { className: 'ds-radio-title' }, tt('preset.custom')),
                preset === 'custom'
                  ? h(
                      'div',
                      { className: 'ds-grid2', style: { marginTop: '4px' } },
                      h(DsField, { label: tt('props.width') }, h(DsNum, {
                        value: custom.w,
                        min: 1,
                        max: 20000,
                        onChange: (value) => setCustom({ w: clampInt(value, 1, 20000), h: custom.h }),
                      })),
                      h(DsField, { label: tt('props.height') }, h(DsNum, {
                        value: custom.h,
                        min: 1,
                        max: 20000,
                        onChange: (value) => setCustom({ w: custom.w, h: clampInt(value, 1, 20000) }),
                      })),
                    )
                  : h('span', { className: 'ds-radio-sub' }, tt('preset.customHint')),
              ),
            ),
          ),
        )
      }
      return h(NewDesignDialog)
    }
    if (modal.kind === 'upload') {
      const UploadDialog = function UploadDialog() {
        const [mode, setMode] = React.useState(activeDesign && selectedLayer && selectedLayer.type === 'image' ? 'replace' : 'design')
        const [files, setFiles] = React.useState([])
        return h(
          DsModal,
          {
            title: tt('upload.title'),
            onClose: () => {
              if (!busy) setModal(null)
            },
            busy,
            closeLabel: tt('common.close'),
            footer: [
              h(DsBtn, { key: 'cancel', onClick: () => setModal(null), disabled: busy }, tt('common.cancel')),
              h(
                DsBtn,
                {
                  key: 'ok',
                  kind: 'primary',
                  disabled: busy || !files.length,
                  onClick: async () => {
                    if (mode === 'replace' && selectedLayer && activeDesign) {
                      setBusy(true)
                      try {
                        const item = await dsAssetFromFile(files[0])
                        const next = addAsset(project, item.asset)
                        apply(next, tt('history.importImages'))
                        cache.ensure(next)
                        replaceImageAction(activeDesign.id, selectedLayer, item.asset.id, next)
                        setModal(null)
                      } catch (error) {
                        notice(tt('upload.failed', { message: String((error && error.message) || error) }), 'error')
                      } finally {
                        setBusy(false)
                      }
                      return
                    }
                    await handleFiles(files, mode)
                  },
                },
                busy ? tt('common.working') : tt('upload.confirm'),
              ),
            ],
          },
          h(
            'div',
            { className: 'ds-upload-zone', style: { margin: 0, padding: '20px 12px' } },
            h('input', {
              className: 'ds-hidden-input',
              type: 'file',
              accept: DS_ACCEPT,
              multiple: mode !== 'replace',
              onChange: (event) => setFiles(Array.from(event.target.files || [])),
              id: 'ds-upload-input',
            }),
            h(DsBtn, { onClick: () => document.getElementById('ds-upload-input').click(), disabled: busy }, dsIcon('upload', 12), tt('upload.choose')),
            h('span', { className: 'ds-hint' }, tt('upload.formats')),
            files.length ? h('span', { className: 'ds-hint' }, tt('upload.chosen', { count: files.length, name: files[0] ? files[0].name : '' })) : null,
          ),
          h(
            'div',
            { className: 'ds-radio-row' },
            [
              { key: 'design', title: tt('upload.modeDesign'), sub: tt('upload.modeDesignSub') },
              { key: 'layer', title: tt('upload.modeLayer'), sub: tt('upload.modeLayerSub') },
              activeDesign && selectedLayer && selectedLayer.type === 'image'
                ? { key: 'replace', title: tt('upload.modeReplace'), sub: tt('upload.modeReplaceSub') }
                : null,
            ]
              .filter(Boolean)
              .map((option) =>
                h(
                  'label',
                  { key: option.key, className: 'ds-radio' + (mode === option.key ? ' is-active' : '') },
                  h('input', {
                    type: 'radio',
                    name: 'ds-upload-mode',
                    checked: mode === option.key,
                    onChange: () => setMode(option.key),
                  }),
                  h(
                    'span',
                    { className: 'ds-radio-text' },
                    h('span', { className: 'ds-radio-title' }, option.title),
                    h('span', { className: 'ds-radio-sub' }, option.sub),
                  ),
                ),
              ),
          ),
        )
      }
      return h(UploadDialog)
    }
    if (modal.kind === 'export') {
      return h(DsExportDialog, {
        project,
        activeDesign,
        cache,
        t,
        onClose: () => setModal(null),
        onDownload: downloadBlob,
      })
    }
    return null
  })()

  /* ---- render: whole panel -------------------------------------------- */

  const hintText = !project
    ? ''
    : activeDesign && activeDesign.layers.length === 0
      ? tt('canvas.emptyHint')
      : selectedLayer
        ? tt('canvas.selectedHint', { name: selectedLayer.name })
        : tt('canvas.idleHint')

  return h(
    'div',
    { className: 'ds-root', 'data-ds-root': '' },
    h('style', null, DS_CSS),
    h('a', { ref: downloadRef, style: { display: 'none' }, 'aria-hidden': true, tabIndex: -1 }),
    h(
      'input',
      {
        ref: fileInputRef,
        type: 'file',
        className: 'ds-hidden-input',
        accept: DS_ACCEPT,
        multiple: true,
        onChange: (event) => handleFiles(event.target.files, uploadTargetRef.current.mode),
      },
    ),
    h('input', {
      ref: replaceInputRef,
      type: 'file',
      className: 'ds-hidden-input',
      accept: DS_ACCEPT,
      onChange: async (event) => {
        const file = (event.target.files || [])[0]
        const designId = event.target.dataset.design
        const layerId = event.target.dataset.layer
        event.target.value = ''
        if (!file || !designId || !layerId) return
        const design = findDesign(project, designId)
        const layer = design ? findLayer(design, layerId) : null
        if (!layer) return
        setBusy(true)
        try {
          const item = await dsAssetFromFile(file)
          const next = addAsset(project, item.asset)
          apply(next, tt('history.importImages'))
          cache.ensure(next)
          replaceImageAction(designId, layer, item.asset.id, next)
        } catch (error) {
          notice(tt('upload.failed', { message: String((error && error.message) || error) }), 'error')
        } finally {
          setBusy(false)
        }
      },
    }),
    toolbar,
    h(
      'div',
      { className: 'ds-body' },
      leftRail,
      state.loading || !project
        ? h(
            'div',
            { className: 'ds-stage-wrap' },
            h('div', { className: 'ds-empty', style: { margin: 'auto' } }, tt('status.loading')),
          )
        : h(DsStage, {
            project,
            design: activeDesign,
            selectedLayer,
            cache,
            cacheVersion,
            onSelect,
            onLiveChange,
            onGestureBegin,
            onGestureEnd,
            t,
            hint: hintText,
          }),
      rightRail,
    ),
    statusBar,
    modalNode,
  )
}

/* ------------------------------------------------------------ export dialog */

function DsExportDialog(props) {
  const { project, activeDesign, cache, t, onClose, onDownload } = props
  const tt = (key, vars) => dsText(t, key, vars)
  const designs = project ? project.designs : []
  const [format, setFormat] = React.useState('png')
  const [quality, setQuality] = React.useState(0.92)
  const [bgColor, setBgColor] = React.useState('#FFFFFF')
  const [transparent, setTransparent] = React.useState(false)
  const [selected, setSelected] = React.useState(() => {
    const map = {}
    const seed = activeDesign || designs[0]
    if (seed) map[seed.id] = true
    return map
  })
  const [running, setRunning] = React.useState(false)
  const [progress, setProgress] = React.useState({ index: 0, total: 0, name: '' })
  const [results, setResults] = React.useState([])
  const [done, setDone] = React.useState(null)
  const [downloaded, setDownloaded] = React.useState(false)

  const chosen = designs.filter((design) => selected[design.id])
  const ext = format === 'jpeg' ? 'jpg' : 'png'

  const toggle = (designId) => setSelected((prev) => Object.assign({}, prev, { [designId]: !prev[designId] }))
  const selectOnly = (designId) => setSelected({ [designId]: true })
  const selectAll = () => {
    const map = {}
    designs.forEach((design) => {
      map[design.id] = true
    })
    setSelected(map)
  }
  const selectNone = () => setSelected({})

  const run = async () => {
    if (!chosen.length) return
    setRunning(true)
    setDone(null)
    setResults([])
    setDownloaded(false)
    setProgress({ index: 0, total: chosen.length, name: '' })
    cache.ensure(project)
    const settle = await cache.settle(20000)
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready
    } catch (error) {
      /* font loading is best effort */
    }
    const names = uniqueFileNames(
      chosen.map((design) => design.name),
      ext,
    )
    const out = []
    for (let index = 0; index < chosen.length; index += 1) {
      const design = chosen[index]
      setProgress({ index, total: chosen.length, name: design.name })
      await new Promise((resolve) => window.setTimeout(resolve, 16))
      const row = {
        id: design.id,
        name: names[index],
        width: design.width,
        height: design.height,
        ok: false,
        bytes: 0,
        error: '',
        missing: 0,
      }
      try {
        const area = design.width * design.height
        if (area > 80e6) throw new Error('too-large')
        const canvas = document.createElement('canvas')
        canvas.width = design.width
        canvas.height = design.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no-context')
        const background =
          format === 'jpeg'
            ? bgColor || '#FFFFFF'
            : transparent || design.transparent
              ? 'none'
              : design.background
        const painted = paintDesign(ctx, project, design, {
          getImage: (assetId) => cache.peek(assetId),
          background,
        })
        row.missing = painted && painted.missing ? painted.missing.length : 0
        const blob = await new Promise((resolve, reject) => {
          try {
            canvas.toBlob(
              (result) => (result ? resolve(result) : reject(new Error('encode-failed'))),
              format,
              format === 'jpeg' ? quality : undefined,
            )
          } catch (error) {
            reject(error)
          }
        })
        row.blob = blob
        row.bytes = blob.size
        row.ok = true
      } catch (error) {
        row.error = String((error && error.message) || error)
      }
      out.push(row)
      setResults(out.slice())
    }
    setProgress({ index: chosen.length, total: chosen.length, name: '' })
    setRunning(false)
    setDone({
      total: out.length,
      ok: out.filter((row) => row.ok).length,
      failed: out.filter((row) => !row.ok).length,
      missing: out.reduce((sum, row) => sum + (row.missing || 0), 0),
      timedOut: !!(settle && settle.timedOut),
      failedAssets: settle && settle.failed ? settle.failed.length : 0,
    })
  }

  const download = async () => {
    const rows = results.filter((row) => row.ok)
    if (!rows.length) return
    if (rows.length === 1) {
      onDownload(rows[0].blob, rows[0].name)
      setDownloaded(true)
      return
    }
    const entries = []
    for (const row of rows) {
      const buffer = await row.blob.arrayBuffer()
      entries.push({ name: row.name, data: new Uint8Array(buffer) })
    }
    const bytes = buildZip(entries)
    onDownload(new Blob([bytes], { type: 'application/zip' }), 'designs-' + timestampSlug(new Date()) + '.zip')
    setDownloaded(true)
  }

  const percent = progress.total ? Math.round((progress.index / progress.total) * 100) : 0

  const footer = []
  footer.push(h(DsBtn, { key: 'close', onClick: onClose, disabled: running }, tt('common.close')))
  if (done) {
    footer.push(
      h(
        DsBtn,
        { key: 'download', kind: 'primary', onClick: download, disabled: !results.some((row) => row.ok) },
        dsIcon('download', 12),
        downloaded ? tt('export.downloadAgain') : tt('export.download'),
      ),
    )
  } else {
    footer.push(
      h(
        DsBtn,
        { key: 'run', kind: 'primary', onClick: run, disabled: running || !chosen.length },
        dsIcon('download', 12),
        running ? tt('export.working') : tt('export.start'),
      ),
    )
  }

  return h(
    DsModal,
    { title: tt('export.title'), onClose, busy: running, wide: true, closeLabel: tt('common.close'), footer },
    h(
      'div',
      { className: 'ds-export-grid' },
      h(
        'div',
        null,
        h('div', { className: 'ds-section-title' }, tt('export.range')),
        h(
          'div',
          { className: 'ds-row', style: { gap: '4px', marginBottom: '6px', flexWrap: 'wrap' } },
          h(DsBtn, { small: true, onClick: selectAll }, tt('export.rangeAll')),
          activeDesign
            ? h(DsBtn, { small: true, onClick: () => selectOnly(activeDesign.id) }, tt('export.rangeCurrent'))
            : null,
          h(DsBtn, { small: true, onClick: selectNone }, tt('export.rangeNone')),
        ),
        h(
          'div',
          { className: 'ds-check-list' },
          designs.map((design) =>
            h(
              'label',
              { key: design.id, className: 'ds-check ds-check-row' },
              h('input', {
                type: 'checkbox',
                checked: !!selected[design.id],
                onChange: () => toggle(design.id),
              }),
              h(
                'span',
                { className: 'ds-check-text' },
                h('span', { className: 'ds-check-title' }, design.name),
                h(
                  'span',
                  { className: 'ds-hint' },
                  design.width + ' × ' + design.height + ' px · ' + design.layers.length + ' ' + tt('design.layersUnit'),
                ),
              ),
            ),
          ),
        ),
      ),
      h(
        'div',
        null,
        h('div', { className: 'ds-section-title' }, tt('export.format')),
        h(
          'div',
          { className: 'ds-radio-row' },
          h(
            'label',
            { className: 'ds-radio' + (format === 'png' ? ' is-active' : '') },
            h('input', { type: 'radio', name: 'ds-format', checked: format === 'png', onChange: () => setFormat('png') }),
            h(
              'span',
              { className: 'ds-radio-text' },
              h('span', { className: 'ds-radio-title' }, 'PNG'),
              h('span', { className: 'ds-radio-sub' }, tt('export.pngSub')),
            ),
          ),
          h(
            'label',
            { className: 'ds-radio' + (format === 'jpeg' ? ' is-active' : '') },
            h('input', { type: 'radio', name: 'ds-format', checked: format === 'jpeg', onChange: () => setFormat('jpeg') }),
            h(
              'span',
              { className: 'ds-radio-text' },
              h('span', { className: 'ds-radio-title' }, 'JPG'),
              h('span', { className: 'ds-radio-sub' }, tt('export.jpgSub')),
            ),
          ),
        ),
        format === 'png'
          ? h(DsCheck, {
              label: tt('export.transparent'),
              checked: transparent,
              onChange: setTransparent,
            })
          : h(
              React.Fragment,
              null,
              h(DsField, { label: tt('export.background') }, h(DsColor, { value: bgColor, onChange: setBgColor })),
              h(DsRange, {
                label: tt('export.quality'),
                min: 0.5,
                max: 1,
                step: 0.01,
                value: quality,
                format: (value) => Math.round(value * 100) + '%',
                onChange: setQuality,
              }),
            ),
        h('div', { className: 'ds-hint' }, tt('export.scaleHint')),
      ),
    ),
    done
      ? h(
          'div',
          { className: 'ds-export-results' },
          h(
            'div',
            { className: 'ds-callout' },
            h(
              'div',
              { className: 'ds-callout-title' },
              done.failed
                ? dsText(t, 'export.summaryMixed', { ok: done.ok, failed: done.failed })
                : dsText(t, 'export.summaryOk', { ok: done.ok }),
            ),
            done.timedOut ? h('div', { className: 'ds-hint is-warn' }, tt('export.assetTimeout')) : null,
            done.missing > 0
              ? h('div', { className: 'ds-hint is-warn' }, dsText(t, 'export.missingAssets', { count: done.missing }))
              : null,
          ),
          results.map((row) =>
            h(
              'div',
              { key: row.id, className: 'ds-result-row' },
              h('span', { className: 'ds-result-name' }, row.name),
              h('span', { className: 'ds-result-meta' }, row.width + '×' + row.height),
              h(
                'span',
                { className: 'ds-result-meta' + (row.ok ? '' : ' is-error') },
                row.ok ? dsFormatBytes(row.bytes) : dsText(t, 'export.rowFailed', { message: row.error }),
              ),
            ),
          ),
        )
      : running
        ? h(
            'div',
            { className: 'ds-export-progress' },
            h(
              'div',
              { className: 'ds-progress' },
              h('div', { className: 'ds-progress-fill', style: { width: percent + '%' } }),
            ),
            h('div', { className: 'ds-hint' }, dsText(t, 'export.progress', { index: Math.min(progress.index + 1, progress.total), total: progress.total, name: progress.name })),
          )
        : h('div', { className: 'ds-hint' }, dsText(t, 'export.ready', { count: chosen.length })),
  )
}
