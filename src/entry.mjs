/* Design Studio — module entry: locale dictionaries, sidebar entry, main panel.
 * Appended last by build.mjs, so every helper above is already in scope.
 */

const DS_PANEL_ID = 'design-studio'

/**
 * The sidebar glyph: two offset frames, i.e. several designs that share content.
 * `props.size` and `props.active` are supplied by the sidebar slot.
 */
function DsSidebarIcon(props) {
  const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 18
  const active = !!(props && props.active)
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 20 20',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.35,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
      style: { display: 'block', opacity: active ? 1 : 0.82 },
    },
    h('rect', { x: 2.6, y: 2.6, width: 9, height: 9, rx: 1.6, opacity: 0.5 }),
    h('rect', { x: 7.2, y: 7.2, width: 10.2, height: 10.2, rx: 1.8 }),
    h('path', { d: 'M9.4 11.2 h5.8' }),
    h('path', { d: 'M9.4 13.8 h3.6' }),
  )
}

return {
  inject: ['slots', 'locale'],
  apply(ctx) {
    ctx.effect(() => {
      const disposers = []
      for (const locale of Object.keys(DS_DICT)) {
        try {
          disposers.push(ctx.locale.register(DS_NS, locale, DS_DICT[locale]))
        } catch (error) {
          console.warn('[design-studio] locale registration skipped for ' + locale, error)
        }
      }
      return () => {
        for (const dispose of disposers) dispose()
      }
    }, 'design-studio: dictionaries')

    const translate = (key) => {
      try {
        return ctx.locale.bind(DS_NS)(key)
      } catch (error) {
        return key
      }
    }

    /** Re-renders the panel when the shell language changes. */
    function useTranslate() {
      const [, bump] = React.useState(0)
      React.useEffect(() => {
        if (typeof ctx.locale.subscribe !== 'function') return undefined
        let dispose
        try {
          dispose = ctx.locale.subscribe(() => bump((value) => value + 1))
        } catch (error) {
          dispose = undefined
        }
        return () => {
          if (typeof dispose === 'function') dispose()
        }
      }, [])
      return ctx.locale.bind(DS_NS)
    }

    function DesignStudioPanel() {
      const t = useTranslate()
      const closePanel = React.useCallback(() => {
        const layout = ctx.get('layout')
        if (layout && typeof layout.selectPanel === 'function') {
          try {
            layout.selectPanel(null)
          } catch (error) {
            /* the shell may already be on another panel */
          }
        }
      }, [])
      return h(DsWorkbench, { t, closePanel })
    }

    ctx.effect(() => {
      const disposeMain = ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: DS_PANEL_ID }, DesignStudioPanel),
      )
      const disposeButton = ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: DS_PANEL_ID,
            order: 6,
            label: () => translate('meta.title'),
          },
          DsSidebarIcon,
        ),
      )
      return () => {
        disposeButton()
        disposeMain()
      }
    }, 'design-studio: sidebar entry and main panel')
  },
}
