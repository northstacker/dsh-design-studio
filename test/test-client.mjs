/**
 * Client-bundle verification without a browser: load the shipped `client.js`,
 * run its factory against a stub React, then call `apply(ctx)` with a stub
 * client runtime and inspect what it registered.
 *
 * This catches the class of bugs that would otherwise only show up as a missing
 * sidebar button in the running shell (wrong slot key, wrong registration shape,
 * a locale table that failed to register, an apply that throws).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { check, checkDeep, report, resetCounters } from './lib.mjs'

resetCounters()

const here = path.dirname(fileURLToPath(import.meta.url))
const bundlePath = path.join(here, '..', 'client.js')
const dictionaryPath = path.join(here, '..', 'locale', 'zh.json')
const zh = JSON.parse(readFileSync(dictionaryPath, 'utf8'))

function makeReact() {
  const React = {
    Fragment: Symbol.for('react.fragment'),
    createElement(type, props, ...children) {
      return { type, props: Object.assign({}, props, children.length ? { children: children.length === 1 ? children[0] : children } : null) }
    },
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, () => {}]
    },
    useEffect() {},
    useLayoutEffect() {},
    useReducer(reducer, initial) {
      const value = typeof initial === 'function' ? initial(reducer) : initial
      return [value && value.project !== undefined ? value : initial, () => {}]
    },
    useId() {
      return 'id-1'
    },
    useSyncExternalStore(_subscribe, getSnapshot) {
      return getSnapshot()
    },
    useTransition() {
      return [false, (fn) => fn()]
    },
    useRef(value) {
      return { current: value }
    },
    useMemo(factory) {
      return factory()
    },
    useCallback(fn) {
      return fn
    },
  }
  return React
}

let entry = null
const sandbox = {
  window: { __ModuleLoader__: { load: (value) => { entry = value } } },
  console: { warn() {}, error() {}, log() {} },
  TextEncoder,
  TextDecoder,
}
vm.runInNewContext(readFileSync(bundlePath, 'utf8'), sandbox, { filename: 'client.js' })

check('bundle registered itself', !!entry)
checkDeep('bundle id', entry.id, '@local/design-studio')

const api = entry.factory((name) => {
  if (name === 'react') return makeReact()
  throw new Error('unexpected require: ' + name)
})

checkDeep('client declares its services', api.inject, ['slots', 'locale'])
check('client exposes apply', typeof api.apply === 'function')

/* ---------- apply against a stub runtime ---------- */

const slots = []
const locales = []
const effects = []
const disposed = []
const listeners = []

const ctx = {
  slots: {
    inject(owner, factory) {
      const dispose = factory()
      return () => {
        disposed.push(owner)
        if (typeof dispose === 'function') dispose()
      }
    },
    register(spec, component) {
      slots.push({ spec, component })
      return () => {}
    },
  },
  locale: {
    register(namespace, locale, dict) {
      locales.push({ namespace, locale, dict })
      return () => {}
    },
    bind() {
      return (key, vars) => {
        let text = typeof zh[key] === 'string' ? zh[key] : key
        if (vars) {
          for (const [name, value] of Object.entries(vars)) text = text.split('{' + name + '}').join(String(value))
        }
        return text
      }
    },
    subscribe(listener) {
      listeners.push(listener)
      return () => {}
    },
    getLocale() {
      return 'zh'
    },
  },
  effect(fn) {
    const dispose = fn()
    const cancel = () => {
      if (typeof dispose === 'function') dispose()
    }
    effects.push(cancel)
    return cancel
  },
  get() {
    return undefined
  },
}

let thrown = null
let cleanup = null
try {
  cleanup = api.apply(ctx)
} catch (error) {
  thrown = error
}
check('apply does not throw', thrown === null, thrown && String(thrown && thrown.stack))
check('apply defers teardown to ctx.effect (the client runtime owns disposal)', effects.length >= 1)
void cleanup

/* ---------- registrations ---------- */

const main = slots.find((slot) => slot.spec.name === 'main')
const sidebar = slots.find((slot) => slot.spec.name === 'sidebar.panellist')

check('registers a main panel', !!main)
checkDeep('main panel key matches the sidebar id', main && main.spec.key, 'design-studio')
check('registers a sidebar button', !!sidebar)
checkDeep('sidebar id', sidebar && sidebar.spec.id, 'design-studio')
checkDeep('sidebar order sits in the icon row', sidebar && sidebar.spec.order, 6)
check('sidebar label is a function (so it follows the locale)', typeof (sidebar && sidebar.spec.label) === 'function')
checkDeep('sidebar label resolves to the translated title', sidebar && sidebar.spec.label(), '设计工作台')

checkDeep('registers both locales', locales.map((item) => item.locale).sort(), ['en', 'zh'])
check('locale namespace is stable', locales.every((item) => item.namespace === 'designStudio'))
check('locale tables carry the title', locales.every((item) => typeof item.dict['meta.title'] === 'string'))
check('locale tables carry every key the UI asks for', ['rail.designs', 'toolbar.export', 'binding.title', 'export.title'].every((key) =>
  locales.every((item) => typeof item.dict[key] === 'string'),
))
check('en and zh have the same keys', (() => {
  const en = locales.find((item) => item.locale === 'en').dict
  const zhs = locales.find((item) => item.locale === 'zh').dict
  const a = Object.keys(en).sort().join(',')
  const b = Object.keys(zhs).sort().join(',')
  return a === b
})())

/* ---------- sidebar icon renders without a DOM ---------- */

const icon = sidebar.component({ size: 20, active: true })
check('icon is a single element', icon && typeof icon === 'object')
checkDeep('icon renders an svg', icon && icon.type, 'svg')
checkDeep('icon honours the requested size', [icon.props.width, icon.props.height], [20, 20])
check('icon is decorative', icon.props['aria-hidden'] === true || icon.props['aria-hidden'] === 'true')
check('icon uses the current text colour', icon.props.stroke === 'currentColor' || JSON.stringify(icon).includes('currentColor'))

const iconIdle = sidebar.component({ size: 20, active: false })
check('inactive icon is dimmed', iconIdle.props.style.opacity < icon.props.style.opacity)

/* ---------- panel component is a function that tolerates the host props ---------- */

check('panel component is registered', typeof main.component === 'function')
let panelError = null
try {
  const element = main.component({ usePanelInfo: () => ({}), useWorkspaces: () => ({}) })
  check('panel renders a workbench element', element && typeof element.type === 'function')
  const tree = element.type(element.props)
  check('workbench renders a tree', tree && typeof tree === 'object')
  check('workbench tree includes the root class', JSON.stringify(tree).includes('ds-root'))
  check('workbench renders the left rail with the design list', JSON.stringify(tree).includes('ds-rail'))
} catch (error) {
  panelError = error
}
check('panel renders without optional host props', panelError === null, panelError && String(panelError.stack))

/* ---------- cleanup ---------- */

let cleanupError = null
try {
  for (const cancel of effects) cancel()
} catch (error) {
  cleanupError = error
}
check('teardown does not throw', cleanupError === null)
checkDeep('teardown disposes both slot injections', disposed.sort(), ['main', 'sidebar.panellist'])

report('client')
