/* Design Studio — UI primitives, asset cache, canvas stage.
 *
 * Concatenated after engine.mjs by build.mjs, so it uses the engine symbols
 * directly and must not contain `import` statements.
 */

const DS_NS = 'designStudio'
const DS_STORAGE_KEY = 'dsh.design-studio.project.v1'
const DS_ENDPOINT = 'design-studio/state'

function dsText(t, key, vars) {
  let value
  try {
    value = t(key)
  } catch (error) {
    value = undefined
  }
  if (typeof value !== 'string' || value === key) return key
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}

function round(value, digits) {
  const d = digits == null ? 0 : digits
  const f = Math.pow(10, d)
  return Math.round(num(value, 0) * f) / f
}

/* ------------------------------------------------------------------- style */

const DS_CSS = `
.ds-root {
  --ds-hover: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
  --ds-active: color-mix(in srgb, var(--dsw-alias-label-primary) 13%, transparent);
  --ds-track: color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);
  --ds-checker: color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent);
  --ds-shadow: 0 10px 30px color-mix(in srgb, #000 18%, transparent);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 1.45;
  font-family: inherit;
}
.ds-root *, .ds-root *::before, .ds-root *::after { box-sizing: border-box; }
.ds-root button, .ds-root input, .ds-root select, .ds-root textarea { font: inherit; color: inherit; }
.ds-root ::-webkit-scrollbar { width: 8px; height: 8px; }
.ds-root ::-webkit-scrollbar-thumb { background: var(--ds-track); border-radius: 4px; }
.ds-root ::-webkit-scrollbar-track { background: transparent; }

.ds-toolbar {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 10px; flex: none;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.ds-toolbar-group { display: flex; align-items: center; gap: 5px; }
.ds-toolbar-spacer { flex: 1 1 auto; min-width: 8px; }
.ds-toolbar-sep { width: 1px; height: 18px; background: var(--dsw-alias-border-l1); margin: 0 4px; }
.ds-title-input {
  border: 1px solid transparent; border-radius: 6px; background: transparent;
  padding: 3px 7px; font-weight: 600; font-size: 13px; min-width: 90px; max-width: 240px;
}
.ds-title-input:hover { border-color: var(--dsw-alias-border-l1); }
.ds-title-input:focus { outline: none; border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); }

.ds-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  height: 26px; padding: 0 9px; border-radius: 6px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  white-space: nowrap; user-select: none;
}
.ds-btn:hover:not(:disabled) { background: var(--ds-hover); }
.ds-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.ds-btn:disabled { opacity: .45; cursor: default; }
.ds-btn.is-primary {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: #fff;
}
.ds-btn.is-primary:hover:not(:disabled) { filter: brightness(1.06); }
.ds-btn.is-danger { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, var(--dsw-alias-border-l1)); }
.ds-btn.is-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }
.ds-btn.is-ghost { border-color: transparent; background: transparent; }
.ds-btn.is-ghost:hover:not(:disabled) { background: var(--ds-hover); }
.ds-btn.is-small { height: 22px; padding: 0 7px; font-size: 11px; }
.ds-btn.is-active { background: var(--ds-active); }
.ds-btn svg { display: block; flex: none; }

.ds-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: 0; border-radius: 6px; padding: 0;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
  font-size: 14px; line-height: 1;
}
.ds-icon-btn:hover:not(:disabled) { background: var(--ds-hover); color: var(--dsw-alias-label-primary); }
.ds-icon-btn:disabled { opacity: .4; cursor: default; }
.ds-icon-btn.is-on { color: var(--dsw-alias-brand-primary); }
.ds-icon-btn.is-off { opacity: .45; }

.ds-body { display: flex; flex: 1 1 auto; min-height: 0; }
.ds-rail {
  display: flex; flex-direction: column; min-height: 0; flex: none;
  background: var(--dsw-alias-bg-layer-1);
}
.ds-rail.is-left { width: 214px; border-right: 1px solid var(--dsw-alias-border-l1); }
.ds-rail.is-right { width: 290px; border-left: 1px solid var(--dsw-alias-border-l1); }
.ds-rail-section { display: flex; flex-direction: column; min-height: 0; }
.ds-rail-head {
  display: flex; align-items: center; gap: 6px; flex: none;
  padding: 8px 9px 6px; font-size: 11px; font-weight: 600;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary);
}
.ds-rail-head .ds-rail-count { font-weight: 400; letter-spacing: 0; text-transform: none; }
.ds-rail-head-actions { margin-left: auto; display: flex; gap: 2px; }
.ds-scroll { overflow: auto; min-height: 0; flex: 1 1 auto; }

.ds-empty {
  padding: 14px 10px; color: var(--dsw-alias-label-secondary);
  font-size: 11px; line-height: 1.6;
}

.ds-design-card {
  display: flex; gap: 8px; width: calc(100% - 12px); margin: 3px 6px;
  padding: 5px; border-radius: 8px; border: 1px solid transparent;
  background: transparent; cursor: pointer; text-align: left;
}
.ds-design-card:hover { background: var(--ds-hover); }
.ds-design-card.is-active {
  background: var(--dsw-alias-bg-base);
  border-color: var(--dsw-alias-border-l2);
}
.ds-design-thumb {
  flex: none; width: 40px; height: 40px; border-radius: 5px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
}
.ds-design-thumb canvas { display: block; }
.ds-design-meta { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; justify-content: center; gap: 1px; }
.ds-design-name {
  font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ds-design-sub { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.ds-design-card-actions { display: flex; align-items: center; gap: 0; opacity: 0; }
.ds-design-card:hover .ds-design-card-actions { opacity: 1; }

.ds-asset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 4px 8px 10px; }
.ds-asset {
  position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1);
  background-color: var(--dsw-alias-bg-layer-2);
  background-size: cover; background-position: center; cursor: pointer;
}
.ds-asset:hover { border-color: var(--dsw-alias-border-l2); }
.ds-asset.is-active { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary); }
.ds-asset-badge {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 2px 4px;
  font-size: 9.5px; color: #fff; background: color-mix(in srgb, #000 55%, transparent);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ds-upload-zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  margin: 4px 8px 8px; padding: 12px 8px; border-radius: 8px; cursor: pointer;
  border: 1px dashed var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary); font-size: 11px; text-align: center;
}
.ds-upload-zone:hover { background: var(--ds-hover); color: var(--dsw-alias-label-primary); }

.ds-stage-wrap { position: relative; flex: 1 1 auto; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.ds-viewport {
  position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  background: var(--dsw-alias-bg-base);
  background-image:
    linear-gradient(color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent) 1px, transparent 1px);
  background-size: 16px 16px;
  touch-action: none;
}
.ds-viewport.is-panning { cursor: grabbing; }
.ds-stage { position: absolute; left: 0; top: 0; will-change: transform; }
.ds-stage.is-checker {
  background-color: var(--dsw-alias-bg-layer-1);
  background-image:
    linear-gradient(45deg, var(--ds-checker) 25%, transparent 25%),
    linear-gradient(-45deg, var(--ds-checker) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--ds-checker) 75%),
    linear-gradient(-45deg, transparent 75%, var(--ds-checker) 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}
.ds-canvas { display: block; position: absolute; left: 0; top: 0; }
.ds-canvas.is-chrome { cursor: default; }
.ds-canvas.is-content { pointer-events: none; }
.ds-stage-shadow { box-shadow: 0 2px 14px color-mix(in srgb, #000 22%, transparent); }
.ds-canvas-overlay-hint {
  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%);
  padding: 5px 10px; border-radius: 999px; pointer-events: none;
  background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary); font-size: 11px; box-shadow: var(--ds-shadow);
  white-space: nowrap;
}
.ds-zoom-bar {
  display: flex; align-items: center; gap: 2px; flex: none;
  padding: 4px 8px; border-top: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.ds-zoom-value {
  min-width: 46px; text-align: center; font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary); font-size: 11px;
}

.ds-tabs { display: flex; gap: 2px; padding: 4px 6px; flex: none; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.ds-tab {
  flex: 1 1 0; height: 24px; border: 0; border-radius: 6px; cursor: pointer;
  background: transparent; color: var(--dsw-alias-label-secondary); font-size: 11.5px;
}
.ds-tab:hover { background: var(--ds-hover); color: var(--dsw-alias-label-primary); }
.ds-tab.is-active { background: var(--ds-active); color: var(--dsw-alias-label-primary); font-weight: 600; }

.ds-layer-row {
  display: flex; align-items: center; gap: 4px; padding: 3px 6px 3px 4px;
  border-radius: 6px; margin: 1px 5px; cursor: pointer;
  border: 1px solid transparent;
}
.ds-layer-row:hover { background: var(--ds-hover); }
.ds-layer-row.is-active { background: var(--ds-active); border-color: var(--dsw-alias-border-l2); }
.ds-layer-row.is-dragover { border-top-color: var(--dsw-alias-brand-primary); }
.ds-layer-row.is-hidden .ds-layer-name { opacity: .45; }
.ds-layer-name {
  flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 11.5px;
}
.ds-layer-kind { flex: none; color: var(--dsw-alias-label-secondary); display: flex; }
.ds-badge {
  flex: none; display: inline-flex; align-items: center; gap: 2px; height: 15px; padding: 0 4px;
  border-radius: 4px; font-size: 9.5px; font-weight: 600;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);
  color: var(--dsw-alias-brand-primary);
}
.ds-badge.is-text { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent); color: var(--dsw-alias-state-success-primary); }

.ds-props { padding: 8px 10px 16px; display: flex; flex-direction: column; gap: 7px; }
.ds-section-title {
  font-size: 10.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
  color: var(--dsw-alias-label-secondary); margin: 6px 0 1px;
}
.ds-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.ds-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.ds-field { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ds-field-label { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.ds-input, .ds-select, .ds-textarea {
  width: 100%; min-width: 0; height: 26px; padding: 2px 6px; border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary);
}
.ds-input:focus, .ds-select:focus, .ds-textarea:focus {
  outline: none; border-color: var(--dsw-alias-brand-primary);
}
.ds-textarea { height: auto; min-height: 68px; padding: 5px 6px; resize: vertical; line-height: 1.5; }
.ds-input[type="number"] { font-variant-numeric: tabular-nums; }
.ds-row { display: flex; align-items: center; gap: 6px; }
.ds-row-label { flex: none; width: 42px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.ds-row-value {
  flex: none; width: 40px; text-align: right; font-variant-numeric: tabular-nums;
  font-size: 10.5px; color: var(--dsw-alias-label-secondary);
}
.ds-range { flex: 1 1 auto; min-width: 0; height: 18px; accent-color: var(--dsw-alias-brand-primary); }
.ds-check { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 11.5px; }
.ds-check input { accent-color: var(--dsw-alias-brand-primary); margin: 0; }
.ds-color-row { display: flex; gap: 6px; align-items: center; }
.ds-color { width: 30px; height: 26px; padding: 1px; border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); }
.ds-swatch-row { display: flex; gap: 4px; flex-wrap: wrap; }
.ds-swatch { width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--dsw-alias-border-l1); cursor: pointer; padding: 0; }
.ds-hint { font-size: 10.5px; color: var(--dsw-alias-label-secondary); line-height: 1.5; }
.ds-hint.is-warn { color: var(--dsw-alias-state-warn-primary); }
.ds-hint.is-error { color: var(--dsw-alias-state-error-primary); }
.ds-callout {
  display: flex; flex-direction: column; gap: 4px; padding: 7px 8px; border-radius: 7px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 28%, transparent);
  font-size: 11px;
}
.ds-callout.is-warn {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, transparent);
}
.ds-callout-title { font-weight: 600; }
.ds-divider { height: 1px; background: var(--dsw-alias-border-l1); margin: 3px 0; }

.ds-binding-row {
  display: flex; flex-direction: column; gap: 3px; padding: 6px 7px; margin: 2px 5px;
  border-radius: 7px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base);
}
.ds-binding-head { display: flex; align-items: center; gap: 5px; }
.ds-binding-name { flex: 1 1 auto; min-width: 0; font-weight: 600; font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-member-row { display: flex; align-items: center; gap: 4px; padding-left: 4px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.ds-member-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ds-statusbar {
  display: flex; align-items: center; gap: 8px; flex: none;
  padding: 4px 10px; border-top: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  font-size: 11px; color: var(--dsw-alias-label-secondary); min-height: 26px;
}
.ds-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: none; }
.ds-status-dot.is-ok { background: var(--dsw-alias-state-success-primary); }
.ds-status-dot.is-busy { background: var(--dsw-alias-state-warn-primary); }
.ds-status-dot.is-error { background: var(--dsw-alias-state-error-primary); }
.ds-status-text { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-status-text.is-error { color: var(--dsw-alias-state-error-primary); }
.ds-status-text.is-ok { color: var(--dsw-alias-state-success-primary); }
.ds-status-meta { flex: none; font-variant-numeric: tabular-nums; }

.ds-modal-backdrop {
  position: absolute; inset: 0; z-index: 40;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: color-mix(in srgb, #000 34%, transparent);
}
.ds-modal {
  width: 460px; max-width: 100%; max-height: 100%; display: flex; flex-direction: column;
  border-radius: 12px; overflow: hidden; box-shadow: var(--ds-shadow);
  background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2);
}
.ds-modal.is-wide { width: 560px; }
.ds-modal-head {
  display: flex; align-items: center; gap: 8px; padding: 11px 10px 10px 14px;
  border-bottom: 1px solid var(--dsw-alias-border-l1); flex: none;
}
.ds-modal-head h2 { margin: 0; font-size: 13.5px; font-weight: 600; flex: 1 1 auto; }
.ds-modal-body { padding: 12px 14px; overflow: auto; min-height: 0; display: flex; flex-direction: column; gap: 10px; }
.ds-modal-foot {
  display: flex; align-items: center; justify-content: flex-end; gap: 6px;
  padding: 9px 12px; border-top: 1px solid var(--dsw-alias-border-l1); flex: none;
}
.ds-modal-foot .ds-foot-left { margin-right: auto; }
.ds-radio-row { display: flex; flex-direction: column; gap: 6px; }
.ds-radio {
  display: flex; gap: 7px; align-items: flex-start; padding: 7px 9px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1); cursor: pointer; background: var(--dsw-alias-bg-base);
}
.ds-radio.is-active { border-color: var(--dsw-alias-brand-primary); background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent); }
.ds-radio input { margin: 1px 0 0; accent-color: var(--dsw-alias-brand-primary); }
.ds-radio-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ds-radio-title { font-size: 11.5px; font-weight: 500; }
.ds-radio-sub { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.ds-design-pick {
  display: flex; align-items: center; gap: 7px; padding: 5px 7px; border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); cursor: pointer;
}
.ds-design-pick.is-active { border-color: var(--dsw-alias-brand-primary); }
.ds-design-pick input { accent-color: var(--dsw-alias-brand-primary); margin: 0; }
.ds-pick-sub { font-size: 10.5px; color: var(--dsw-alias-label-secondary); margin-left: auto; }
.ds-progress { height: 6px; border-radius: 3px; background: var(--ds-track); overflow: hidden; }
.ds-progress-bar { height: 100%; background: var(--dsw-alias-brand-primary); transition: width .15s linear; }
.ds-result-list { display: flex; flex-direction: column; gap: 3px; max-height: 240px; overflow: auto; }
.ds-result-row {
  display: flex; align-items: center; gap: 6px; padding: 4px 7px; border-radius: 6px;
  background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l1); font-size: 11px;
}
.ds-result-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-result-meta { flex: none; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.ds-result-row.is-error { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1)); }
.ds-spin { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid var(--ds-track); border-top-color: var(--dsw-alias-brand-primary); animation: ds-spin .7s linear infinite; }
@keyframes ds-spin { to { transform: rotate(360deg); } }
.ds-progress-fill { height: 100%; border-radius: 3px; background: var(--dsw-alias-brand-primary); transition: width .15s linear; }
.ds-check-list { display: flex; flex-direction: column; gap: 3px; max-height: 210px; overflow: auto; padding-right: 2px; }
.ds-check-row {
  display: flex; align-items: center; gap: 6px; padding: 5px 7px; border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); cursor: pointer;
}
.ds-check-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 4%, var(--dsw-alias-bg-base)); }
.ds-check-row input { margin: 0; accent-color: var(--dsw-alias-brand-primary); }
.ds-check-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ds-check-title { font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-export-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px; align-items: start; }
.ds-export-progress { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
.ds-export-results { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
.ds-hidden-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; left: -9999px; }
`

/* -------------------------------------------------------------- primitives */

function DsBtn(props) {
  const cls = ['ds-btn']
  if (props.kind) cls.push('is-' + props.kind)
  if (props.small) cls.push('is-small')
  if (props.active) cls.push('is-active')
  return h(
    'button',
    {
      type: 'button',
      className: cls.join(' '),
      onClick: props.onClick,
      disabled: props.disabled,
      title: props.title,
      'aria-pressed': props.active ? 'true' : undefined,
      'aria-label': props.ariaLabel,
      onMouseDown: props.onMouseDown,
    },
    props.children,
  )
}

function DsIconBtn(props) {
  const cls = ['ds-icon-btn']
  if (props.active === true) cls.push('is-on')
  if (props.active === false) cls.push('is-off')
  return h(
    'button',
    {
      type: 'button',
      className: cls.join(' '),
      onClick: props.onClick,
      disabled: props.disabled,
      title: props.title,
      'aria-label': props.ariaLabel || props.title,
      'aria-pressed': typeof props.active === 'boolean' ? (props.active ? 'true' : 'false') : undefined,
    },
    props.children,
  )
}

function DsField(props) {
  return h(
    'label',
    { className: 'ds-field', title: props.title },
    props.label ? h('span', { className: 'ds-field-label' }, props.label) : null,
    props.children,
  )
}

function DsNum(props) {
  const [text, setText] = React.useState(() => String(round(props.value, props.digits)))
  const [editing, setEditing] = React.useState(false)
  React.useEffect(() => {
    if (!editing) setText(String(round(props.value, props.digits)))
  }, [props.value, props.digits, editing])
  const commit = (raw) => {
    const parsed = parseFloat(raw)
    if (Number.isFinite(parsed)) {
      const min = props.min == null ? -1e6 : props.min
      const max = props.max == null ? 1e6 : props.max
      props.onChange(clamp(parsed, min, max))
    }
    setEditing(false)
    setText(String(round(props.value, props.digits)))
  }
  return h('input', {
    className: 'ds-input',
    type: 'number',
    inputMode: 'decimal',
    value: text,
    step: props.step == null ? 1 : props.step,
    min: props.min,
    max: props.max,
    disabled: props.disabled,
    onChange: (event) => {
      setEditing(true)
      setText(event.target.value)
    },
    onBlur: (event) => commit(event.target.value),
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        commit(event.currentTarget.value)
        event.currentTarget.blur()
      } else if (event.key === 'Escape') {
        setEditing(false)
        setText(String(round(props.value, props.digits)))
        event.currentTarget.blur()
      }
    },
  })
}

function DsRange(props) {
  return h(
    'div',
    { className: 'ds-row' },
    h('span', { className: 'ds-row-label' }, props.label),
    h('input', {
      className: 'ds-range',
      type: 'range',
      min: props.min,
      max: props.max,
      step: props.step,
      value: props.value,
      disabled: props.disabled,
      onChange: (event) => props.onChange(parseFloat(event.target.value)),
      'aria-label': props.label,
    }),
    h('span', { className: 'ds-row-value' }, props.format ? props.format(props.value) : String(props.value)),
  )
}

function DsSelect(props) {
  return h(
    'select',
    {
      className: 'ds-select',
      value: props.value,
      disabled: props.disabled,
      onChange: (event) => props.onChange(event.target.value),
      'aria-label': props.label,
    },
    props.options.map((option) =>
      h('option', { key: option.value, value: option.value }, option.label),
    ),
  )
}

function DsColor(props) {
  return h(
    'div',
    { className: 'ds-color-row' },
    h('input', {
      className: 'ds-color',
      type: 'color',
      value: /^#[0-9a-fA-F]{6}$/.test(props.value) ? props.value : '#000000',
      onChange: (event) => props.onChange(event.target.value),
      'aria-label': props.label,
    }),
    h('input', {
      className: 'ds-input',
      type: 'text',
      value: props.value,
      spellCheck: false,
      onChange: (event) => props.onChange(event.target.value),
      'aria-label': props.label,
    }),
  )
}

function DsCheck(props) {
  return h(
    'label',
    { className: 'ds-check' },
    h('input', {
      type: 'checkbox',
      checked: !!props.checked,
      disabled: props.disabled,
      onChange: (event) => props.onChange(event.target.checked),
    }),
    h('span', null, props.label),
  )
}

function DsModal(props) {
  React.useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !props.busy) {
        event.stopPropagation()
        props.onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [props.onClose, props.busy])
  return h(
    'div',
    {
      className: 'ds-modal-backdrop',
      onMouseDown: (event) => {
        if (event.target === event.currentTarget && !props.busy) props.onClose()
      },
    },
    h(
      'div',
      {
        className: 'ds-modal' + (props.wide ? ' is-wide' : ''),
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': props.title,
      },
      h(
        'div',
        { className: 'ds-modal-head' },
        h('h2', null, props.title),
        h(DsIconBtn, { onClick: props.onClose, title: props.closeLabel, disabled: props.busy }, '×'),
      ),
      h('div', { className: 'ds-modal-body' }, props.children),
      props.footer ? h('div', { className: 'ds-modal-foot' }, props.footer) : null,
    ),
  )
}

/* --------------------------------------------------------------- asset cache */

/**
 * Decoded image cache keyed by asset id. `ensure` starts loads for every asset
 * in the project and calls back once when the set settles, so export can wait
 * for real pixels instead of drawing placeholders.
 */
function createAssetCache(onChange) {
  const entries = new Map()
  let version = 0
  const bump = () => {
    version += 1
    if (onChange) onChange(version)
  }
  const load = (asset) => {
    if (!asset || !asset.dataUrl) return
    const existing = entries.get(asset.id)
    if (existing && existing.dataUrl === asset.dataUrl) return
    const entry = { status: 'loading', image: null, dataUrl: asset.dataUrl, error: null }
    entries.set(asset.id, entry)
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      entry.status = 'ready'
      entry.image = image
      bump()
    }
    image.onerror = () => {
      entry.status = 'error'
      entry.error = 'decode-failed'
      bump()
    }
    try {
      image.src = asset.dataUrl
    } catch (error) {
      entry.status = 'error'
      entry.error = String((error && error.message) || error)
      bump()
    }
  }
  return {
    peek(assetId) {
      const entry = entries.get(assetId)
      return entry && entry.status === 'ready' ? entry.image : null
    },
    statusOf(assetId) {
      const entry = entries.get(assetId)
      return entry ? entry.status : 'idle'
    },
    ensure(project) {
      if (!project) return
      const assets = project.assets || {}
      for (const asset of Object.values(assets)) load(asset)
    },
    /** Resolves when every currently requested image has settled. */
    settle(timeoutMs) {
      const limit = num(timeoutMs, 15000)
      return new Promise((resolve) => {
        const started = Date.now()
        const check = () => {
          let pending = 0
          let failed = []
          for (const [id, entry] of entries) {
            if (entry.status === 'loading') pending += 1
            else if (entry.status === 'error') failed.push(id)
          }
          if (!pending || Date.now() - started > limit) resolve({ failed, timedOut: pending > 0 })
          else setTimeout(check, 40)
        }
        check()
      })
    },
  }
}

/* --------------------------------------------------------------- thumbnails */

function DsThumb(props) {
  const ref = React.useRef(null)
  const { project, design, cache, cacheVersion, maxW, maxH } = props
  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas || !design) return
    const box = thumbnailBox(design, maxW, maxH)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const width = Math.max(1, Math.round(box.w * dpr))
    const height = Math.max(1, Math.round(box.h * dpr))
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    canvas.style.width = Math.round(box.w) + 'px'
    canvas.style.height = Math.round(box.h) + 'px'
    const ctx = canvas.getContext('2d')
    const scale = Math.min(width / design.width, height / design.height)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.clearRect(0, 0, design.width, design.height)
    paintDesign(ctx, project, design, {
      getImage: (id) => (cache ? cache.peek(id) : null),
      background: design.transparent ? 'none' : design.background,
    })
  }, [project, design, cache, cacheVersion, maxW, maxH])
  return h('canvas', { ref })
}

/* ------------------------------------------------------------------ handles */

const HANDLE_DEFS = [
  { id: 'nw', sx: -1, sy: -1, mode: 'corner' },
  { id: 'n', sx: 0, sy: -1, mode: 'edge' },
  { id: 'ne', sx: 1, sy: -1, mode: 'corner' },
  { id: 'e', sx: 1, sy: 0, mode: 'edge' },
  { id: 'se', sx: 1, sy: 1, mode: 'corner' },
  { id: 's', sx: 0, sy: 1, mode: 'edge' },
  { id: 'sw', sx: -1, sy: 1, mode: 'corner' },
  { id: 'w', sx: -1, sy: 0, mode: 'edge' },
]

function handlePoints(layer) {
  const center = layerCenter(layer)
  const rotation = num(layer.rotation, 0)
  return HANDLE_DEFS.map((def) => {
    const lx = layer.x + layer.w / 2 + (def.sx * layer.w) / 2
    const ly = layer.y + layer.h / 2 + (def.sy * layer.h) / 2
    const p = rotatePoint(lx, ly, center.x, center.y, rotation)
    return Object.assign({}, def, { x: p.x, y: p.y })
  })
}

function rotationHandlePoint(layer, distance) {
  const center = layerCenter(layer)
  const up = rotatePoint(layer.x + layer.w / 2, layer.y - distance, center.x, center.y, num(layer.rotation, 0))
  return up
}

/* -------------------------------------------------------------- canvas stage */

function DsStage(props) {
  const {
    project,
    design,
    selectedLayer,
    cache,
    cacheVersion,
    onSelect,
    onLiveChange,
    onGestureBegin,
    onGestureEnd,
    onCropModeChange,
    t,
  } = props
  const viewportRef = React.useRef(null)
  const stageRef = React.useRef(null)
  const contentRef = React.useRef(null)
  const chromeRef = React.useRef(null)
  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [panning, setPanning] = React.useState(false)
  const [cropMode, setCropMode] = React.useState(false)
  const [cursor, setCursor] = React.useState('default')
  const gestureRef = React.useRef(null)
  const paintFrameRef = React.useRef(0)
  const zoomRef = React.useRef(1)
  const panRef = React.useRef(pan)

  zoomRef.current = zoom
  panRef.current = pan

  const tt = (key, vars) => dsText(t, key, vars)

  const fitToView = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !design) return
    const pad = 48
    const availW = Math.max(60, viewport.clientWidth - pad)
    const availH = Math.max(60, viewport.clientHeight - pad)
    const next = Math.min(availW / design.width, availH / design.height, 4)
    const z = Math.max(0.02, round(next, 4))
    setZoom(z)
    setPan({
      x: Math.round((viewport.clientWidth - design.width * z) / 2),
      y: Math.round((viewport.clientHeight - design.height * z) / 2),
    })
  }, [design])

  // Re-fit when the design changes size or identity.
  React.useEffect(() => {
    fitToView()
  }, [design && design.id, design && design.width, design && design.height, fitToView])

  // Keep the artwork visible when the panel is resized.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return
    let previousWidth = viewport.clientWidth
    let previousHeight = viewport.clientHeight
    const observer = new ResizeObserver(() => {
      const w = viewport.clientWidth
      const h = viewport.clientHeight
      if (w === previousWidth && h === previousHeight) return
      const deltaX = w - previousWidth
      const deltaY = h - previousHeight
      previousWidth = w
      previousHeight = h
      setPan((current) => ({
        x: current.x + Math.round(deltaX / 2),
        y: current.y + Math.round(deltaY / 2),
      }))
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    setCropMode(false)
  }, [design && design.id, selectedLayer && selectedLayer.id])

  React.useEffect(() => {
    if (onCropModeChange) onCropModeChange(cropMode)
  }, [cropMode, onCropModeChange])

  /* ---- painting ------------------------------------------------------- */

  const schedulePaint = React.useCallback(() => {
    if (paintFrameRef.current) return
    paintFrameRef.current = window.requestAnimationFrame(() => {
      paintFrameRef.current = 0
      const content = contentRef.current
      const chrome = chromeRef.current
      if (!content || !chrome || !design) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      let scale = zoomRef.current * dpr
      const maxPixels = 24e6
      const wanted = design.width * design.height * scale * scale
      if (wanted > maxPixels) scale = Math.sqrt(maxPixels / Math.max(1, design.width * design.height))
      const pixelWidth = Math.max(1, Math.round(design.width * scale))
      const pixelHeight = Math.max(1, Math.round(design.height * scale))
      for (const canvas of [content, chrome]) {
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight
        canvas.style.width = round(design.width * zoomRef.current, 2) + 'px'
        canvas.style.height = round(design.height * zoomRef.current, 2) + 'px'
      }
      const ctx = content.getContext('2d')
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, design.width, design.height)
      paintDesign(ctx, project, design, {
        getImage: (id) => cache.peek(id),
        background: design.transparent ? 'none' : design.background,
      })

      const overlay = chrome.getContext('2d')
      overlay.setTransform(scale, 0, 0, scale, 0, 0)
      overlay.clearRect(0, 0, design.width, design.height)
      const z = zoomRef.current
      const hair = 1 / z

      const drawFrame = (layer, color, dashed) => {
        const corners = layerCorners(layer)
        overlay.save()
        overlay.strokeStyle = color
        overlay.lineWidth = Math.max(hair, 0.75 / z) * 1.4
        if (dashed && overlay.setLineDash) overlay.setLineDash([4 / z, 3 / z])
        overlay.beginPath()
        overlay.moveTo(corners[0].x, corners[0].y)
        for (let i = 1; i < corners.length; i += 1) overlay.lineTo(corners[i].x, corners[i].y)
        overlay.closePath()
        overlay.stroke()
        overlay.restore()
      }

      if (cropMode && selectedLayer && selectedLayer.type === 'image') {
        const assetId = resolveImageAssetId(project, selectedLayer)
        const asset = getAsset(project, assetId)
        const image = assetId ? cache.peek(assetId) : null
        if (asset) {
          const boxRect = fitRectInto(asset.width, asset.height, selectedLayer.w, selectedLayer.h)
          const bx = selectedLayer.x + (selectedLayer.w - boxRect.w) / 2
          const by = selectedLayer.y + (selectedLayer.h - boxRect.h) / 2
          if (image) {
            overlay.save()
            overlay.globalAlpha = 0.28
            overlay.drawImage(image, bx, by, boxRect.w, boxRect.h)
            overlay.restore()
          }
          const crop = clampCrop(selectedLayer.crop)
          const cx = bx + crop.x * boxRect.w
          const cy = by + crop.y * boxRect.h
          const cw = crop.w * boxRect.w
          const ch = crop.h * boxRect.h
          overlay.save()
          overlay.fillStyle = 'rgba(0,0,0,0.42)'
          overlay.beginPath()
          overlay.rect(bx, by, boxRect.w, boxRect.h)
          overlay.rect(cx, cy, cw, ch)
          overlay.fill('evenodd')
          overlay.restore()
          overlay.save()
          overlay.strokeStyle = '#ffffff'
          overlay.lineWidth = Math.max(1 / z, 0.8)
          overlay.strokeRect(cx, cy, cw, ch)
          overlay.strokeStyle = 'rgba(0,0,0,0.55)'
          overlay.lineWidth = 1 / z
          overlay.strokeRect(cx, cy, cw, ch)
          overlay.restore()
          const size = 9 / z
          const cropHandles = [
            { id: 'nw', x: cx, y: cy },
            { id: 'ne', x: cx + cw, y: cy },
            { id: 'se', x: cx + cw, y: cy + ch },
            { id: 'sw', x: cx, y: cy + ch },
          ]
          for (const point of cropHandles) {
            overlay.fillStyle = '#ffffff'
            overlay.fillRect(point.x - size / 2, point.y - size / 2, size, size)
            overlay.strokeStyle = 'rgba(0,0,0,0.5)'
            overlay.lineWidth = 1 / z
            overlay.strokeRect(point.x - size / 2, point.y - size / 2, size, size)
          }
        }
      } else if (selectedLayer && selectedLayer.visible !== false) {
        const accent = '#3B82F6'
        drawFrame(selectedLayer, accent, false)
        const points = handlePoints(selectedLayer)
        const size = 8 / z
        for (const point of points) {
          overlay.fillStyle = '#ffffff'
          overlay.fillRect(point.x - size / 2, point.y - size / 2, size, size)
          overlay.strokeStyle = accent
          overlay.lineWidth = Math.max(1 / z, 0.7)
          overlay.strokeRect(point.x - size / 2, point.y - size / 2, size, size)
        }
        const rot = rotationHandlePoint(selectedLayer, 26 / z)
        const top = rotatePoint(
          selectedLayer.x + selectedLayer.w / 2,
          selectedLayer.y,
          selectedLayer.x + selectedLayer.w / 2,
          selectedLayer.y + selectedLayer.h / 2,
          num(selectedLayer.rotation, 0),
        )
        overlay.strokeStyle = accent
        overlay.lineWidth = Math.max(1 / z, 0.7)
        overlay.beginPath()
        overlay.moveTo(top.x, top.y)
        overlay.lineTo(rot.x, rot.y)
        overlay.stroke()
        overlay.beginPath()
        overlay.arc(rot.x, rot.y, 5 / z, 0, Math.PI * 2)
        overlay.fillStyle = '#ffffff'
        overlay.fill()
        overlay.stroke()
      }
    })
  }, [project, design, selectedLayer, cache, cropMode])

  React.useEffect(() => {
    schedulePaint()
  }, [schedulePaint, cacheVersion, zoom])

  React.useEffect(() => () => {
    if (paintFrameRef.current) window.cancelAnimationFrame(paintFrameRef.current)
  }, [])

  /* ---- coordinates ---------------------------------------------------- */

  const toDesign = (event) => {
    const canvas = chromeRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const z = zoomRef.current
    return { x: (event.clientX - rect.left) / z, y: (event.clientY - rect.top) / z }
  }

  const hitHandle = (point) => {
    if (!selectedLayer || cropMode) return null
    const z = zoomRef.current
    const radius = 11 / z
    const rot = rotationHandlePoint(selectedLayer, 26 / z)
    if (Math.hypot(point.x - rot.x, point.y - rot.y) <= radius) return { kind: 'rotate' }
    const points = handlePoints(selectedLayer)
    for (const handle of points) {
      if (Math.hypot(point.x - handle.x, point.y - handle.y) <= radius) {
        return { kind: 'resize', id: handle.id, sx: handle.sx, sy: handle.sy }
      }
    }
    return null
  }

  const hitCropHandle = (point) => {
    if (!cropMode || !selectedLayer) return null
    const assetId = resolveImageAssetId(project, selectedLayer)
    const asset = getAsset(project, assetId)
    if (!asset) return null
    const boxRect = fitRectInto(asset.width, asset.height, selectedLayer.w, selectedLayer.h)
    const bx = selectedLayer.x + (selectedLayer.w - boxRect.w) / 2
    const by = selectedLayer.y + (selectedLayer.h - boxRect.h) / 2
    const crop = clampCrop(selectedLayer.crop)
    const corners = [
      { id: 'nw', x: crop.x, y: crop.y },
      { id: 'ne', x: crop.x + crop.w, y: crop.y },
      { id: 'se', x: crop.x + crop.w, y: crop.y + crop.h },
      { id: 'sw', x: crop.x, y: crop.y + crop.h },
    ]
    const radius = 11 / zoomRef.current
    for (const corner of corners) {
      const px = bx + corner.x * boxRect.w
      const py = by + corner.y * boxRect.h
      if (Math.hypot(point.x - px, point.y - py) <= radius) {
        return { kind: 'crop', id: corner.id, box: { x: bx, y: by, w: boxRect.w, h: boxRect.h } }
      }
    }
    return null
  }

  /* ---- gestures ------------------------------------------------------- */

  const beginGesture = (label) => {
    if (onGestureBegin) onGestureBegin(label)
  }

  const onPointerDown = (event) => {
    if (!design) return
    if (event.button === 1) {
      event.preventDefault()
      gestureRef.current = { mode: 'pan', startX: event.clientX, startY: event.clientY, pan: panRef.current }
      setPanning(true)
      setCursor('grabbing')
      return
    }
    if (event.button !== 0) return
    const point = toDesign(event)

    if (cropMode && selectedLayer) {
      const cropHit = hitCropHandle(point)
      if (cropHit) {
        event.currentTarget.setPointerCapture(event.pointerId)
        gestureRef.current = {
          mode: 'crop',
          handle: cropHit.id,
          box: cropHit.box,
          crop: clampCrop(selectedLayer.crop),
          layerId: selectedLayer.id,
          designId: design.id,
        }
        beginGesture(tt('history.crop'))
        return
      }
    }

    const handle = hitHandle(point)
    if (handle && selectedLayer) {
      event.currentTarget.setPointerCapture(event.pointerId)
      if (handle.kind === 'rotate') {
        const center = layerCenter(selectedLayer)
        gestureRef.current = {
          mode: 'rotate',
          designId: design.id,
          layerId: selectedLayer.id,
          center,
          startAngle: Math.atan2(point.y - center.y, point.x - center.x),
          rotation0: num(selectedLayer.rotation, 0),
        }
        beginGesture(tt('history.rotate'))
      } else {
        const center = layerCenter(selectedLayer)
        const rotation = num(selectedLayer.rotation, 0)
        const anchorSx = handle.sx === 0 ? 0 : -handle.sx
        const anchorSy = handle.sy === 0 ? 0 : -handle.sy
        const anchorLocal = {
          x: center.x + (anchorSx * selectedLayer.w) / 2,
          y: center.y + (anchorSy * selectedLayer.h) / 2,
        }
        gestureRef.current = {
          mode: 'resize',
          designId: design.id,
          layerId: selectedLayer.id,
          handle: handle.id,
          sx: handle.sx,
          sy: handle.sy,
          center,
          rotation,
          anchor: rotatePoint(anchorLocal.x, anchorLocal.y, center.x, center.y, rotation),
          anchorLocal,
          box0: { x: selectedLayer.x, y: selectedLayer.y, w: selectedLayer.w, h: selectedLayer.h },
          lockAspect: selectedLayer.type === 'image' ? selectedLayer.lockAspect !== false : false,
        }
        beginGesture(tt('history.resize'))
      }
      return
    }

    const hit = hitTest(design, point.x, point.y)
    if (hit) {
      onSelect(design.id, hit.id)
      event.currentTarget.setPointerCapture(event.pointerId)
      gestureRef.current = {
        mode: 'move',
        designId: design.id,
        layerId: hit.id,
        start: point,
        box: { x: hit.x, y: hit.y },
        boxW: hit.w,
        boxH: hit.h,
        moved: false,
      }
      beginGesture(tt('history.move'))
      setCursor('move')
      return
    }

    onSelect(design.id, null)
    gestureRef.current = { mode: 'pan', startX: event.clientX, startY: event.clientY, pan: panRef.current }
    setPanning(true)
    setCursor('grabbing')
  }

  const onPointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture) {
      // Hover feedback only: keep it cheap.
      if (!design) return
      const point = toDesign(event)
      if (cropMode) {
        setCursor(hitCropHandle(point) ? 'crosshair' : 'default')
        return
      }
      if (hitHandle(point)) {
        setCursor('pointer')
      } else if (hitTest(design, point.x, point.y)) {
        setCursor('move')
      } else {
        setCursor('default')
      }
      return
    }
    if (gesture.mode === 'pan') {
      setPan({
        x: gesture.pan.x + (event.clientX - gesture.startX),
        y: gesture.pan.y + (event.clientY - gesture.startY),
      })
      return
    }
    const point = toDesign(event)
    if (gesture.mode === 'move') {
      const dx = point.x - gesture.start.x
      const dy = point.y - gesture.start.y
      if (!gesture.moved && Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
      gesture.moved = true
      let nx = gesture.box.x + dx
      let ny = gesture.box.y + dy
      if (event.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) ny = gesture.box.y
        else nx = gesture.box.x
      }
      onLiveChange(gesture.designId, gesture.layerId, { x: Math.round(nx), y: Math.round(ny) })
      return
    }
    if (gesture.mode === 'rotate') {
      let angle = (Math.atan2(point.y - gesture.center.y, point.x - gesture.center.x) * 180) / Math.PI
      angle = gesture.rotation0 + (angle - (gesture.startAngle * 180) / Math.PI)
      if (event.shiftKey) angle = Math.round(angle / 15) * 15
      onLiveChange(gesture.designId, gesture.layerId, { rotation: round(normalizeAngle(angle), 1) })
      return
    }
    if (gesture.mode === 'resize') {
      const patch = computeResize(gesture, point, event.shiftKey)
      if (patch) onLiveChange(gesture.designId, gesture.layerId, patch)
      return
    }
    if (gesture.mode === 'crop') {
      const crop = computeCrop(gesture, point)
      if (crop) onLiveChange(gesture.designId, gesture.layerId, { crop })
    }
  }

  const endGesture = () => {
    const gesture = gestureRef.current
    gestureRef.current = null
    setPanning(false)
    setCursor('default')
    if (!gesture) return
    if (gesture.mode !== 'pan' && onGestureEnd) {
      // A plain click (no movement) drops the empty history entry.
      onGestureEnd(gesture.mode === 'move' && !gesture.moved)
    }
  }

  /* ---- zoom ----------------------------------------------------------- */

  const zoomAtPoint = (nextZoom, anchorX, anchorY) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const z = clamp(nextZoom, 0.02, 16)
    const rect = viewport.getBoundingClientRect()
    const ax = anchorX == null ? rect.width / 2 : anchorX
    const ay = anchorY == null ? rect.height / 2 : anchorY
    const p = panRef.current
    const designX = (ax - p.x) / zoomRef.current
    const designY = (ay - p.y) / zoomRef.current
    setZoom(z)
    setPan({ x: Math.round(ax - designX * z), y: Math.round(ay - designY * z) })
  }

  const onWheel = (event) => {
    if (!design) return
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const factor = Math.exp(-event.deltaY * 0.0022)
      zoomAtPoint(zoomRef.current * factor, event.clientX - rect.left, event.clientY - rect.top)
      return
    }
    if (event.shiftKey) {
      event.preventDefault()
      setPan((current) => ({ x: current.x - event.deltaY, y: current.y }))
      return
    }
    // Free pan on two-axis wheels; a plain vertical wheel keeps scrolling the page
    // narrow enough that it never traps the panel.
    if (Math.abs(event.deltaX) > 0 || Math.abs(event.deltaY) > 0) {
      event.preventDefault()
      setPan((current) => ({ x: current.x - event.deltaX, y: current.y - event.deltaY }))
    }
  }

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const handler = (event) => onWheel(event)
    viewport.addEventListener('wheel', handler, { passive: false })
    return () => viewport.removeEventListener('wheel', handler)
  })

  const stageWidth = design ? round(design.width * zoom, 2) : 0
  const stageHeight = design ? round(design.height * zoom, 2) : 0

  return h(
    'div',
    { className: 'ds-stage-wrap' },
    h(
      'div',
      {
        className: 'ds-viewport' + (panning ? ' is-panning' : ''),
        ref: viewportRef,
        style: { cursor },
      },
      h(
        'div',
        {
          className: 'ds-stage' + (design && design.transparent ? ' is-checker' : ''),
          ref: stageRef,
          style: {
            width: stageWidth + 'px',
            height: stageHeight + 'px',
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          },
        },
        h('canvas', { className: 'ds-canvas is-content ds-stage-shadow', ref: contentRef }),
        h('canvas', {
          className: 'ds-canvas is-chrome',
          ref: chromeRef,
          onPointerDown,
          onPointerMove,
          onPointerUp: endGesture,
          onPointerCancel: endGesture,
          onDoubleClick: (event) => {
            if (!design) return
            const point = toDesign(event)
            const hit = hitTest(design, point.x, point.y)
            if (hit) onSelect(design.id, hit.id)
          },
        }),
      ),
      props.hint ? h('div', { className: 'ds-canvas-overlay-hint' }, props.hint) : null,
    ),
    h(
      'div',
      { className: 'ds-zoom-bar' },
      h(DsIconBtn, { title: tt('zoom.out'), onClick: () => zoomAtPoint(zoom / 1.25), disabled: zoom <= 0.03 }, '−'),
      h('span', { className: 'ds-zoom-value' }, Math.round(zoom * 100) + '%'),
      h(DsIconBtn, { title: tt('zoom.in'), onClick: () => zoomAtPoint(zoom * 1.25) }, '+'),
      h(DsBtn, { small: true, kind: 'ghost', onClick: () => fitToView(), title: tt('zoom.fit') }, tt('zoom.fit')),
      h(DsBtn, { small: true, kind: 'ghost', onClick: () => zoomAtPoint(1), title: tt('zoom.actual') }, '100%'),
      h('div', { className: 'ds-toolbar-spacer' }),
      selectedLayer && selectedLayer.type === 'image'
        ? h(
            DsBtn,
            {
              small: true,
              active: cropMode,
              onClick: () => setCropMode(!cropMode),
              title: tt('crop.toggle'),
            },
            cropMode ? tt('crop.exit') : tt('crop.enter'),
          )
        : null,
      design ? h('span', { className: 'ds-status-meta' }, design.width + ' × ' + design.height) : null,
    ),
  )
}

function normalizeAngle(deg) {
  let angle = deg % 360
  if (angle > 180) angle -= 360
  if (angle < -180) angle += 360
  return angle
}

function computeResize(gesture, point, shiftKey) {
  const { sx, sy, anchor, anchorLocal } = gesture
  const local = rotatePoint(point.x, point.y, gesture.center.x, gesture.center.y, -gesture.rotation)
  const min = 4
  let width = gesture.box0.w
  let height = gesture.box0.h

  if (sx !== 0) {
    width = Math.max(min, Math.abs(local.x - anchorLocal.x))
  }
  if (sy !== 0) {
    height = Math.max(min, Math.abs(local.y - anchorLocal.y))
  }
  if (gesture.lockAspect || (shiftKey && sx !== 0 && sy !== 0)) {
    const ratio = gesture.box0.w / Math.max(1, gesture.box0.h)
    if (sx !== 0 && sy !== 0) {
      const scale = Math.max(width / gesture.box0.w, height / gesture.box0.h)
      width = gesture.box0.w * scale
      height = gesture.box0.h * scale
    } else if (sx !== 0) {
      height = width / ratio
    } else {
      width = height * ratio
    }
  }
  width = Math.max(min, width)
  height = Math.max(min, height)

  // offset of the anchor from the new centre, in the layer's local frame
  const offsetX = (sx === 0 ? 0 : -sx * width) / 2
  const offsetY = (sy === 0 ? 0 : -sy * height) / 2
  const rotated = rotatePoint(offsetX, offsetY, 0, 0, gesture.rotation)
  const centerX = anchor.x - rotated.x
  const centerY = anchor.y - rotated.y
  return {
    x: round(centerX - width / 2, 2),
    y: round(centerY - height / 2, 2),
    w: round(width, 2),
    h: round(height, 2),
  }
}

function computeCrop(gesture, point) {
  const box = gesture.box
  const px = clamp((point.x - box.x) / Math.max(1, box.w), 0, 1)
  const py = clamp((point.y - box.y) / Math.max(1, box.h), 0, 1)
  const crop = gesture.crop
  const left = crop.x
  const top = crop.y
  const right = crop.x + crop.w
  const bottom = crop.y + crop.h
  const minSize = 0.02
  let next
  switch (gesture.handle) {
    case 'nw':
      next = { x: Math.min(px, right - minSize), y: Math.min(py, bottom - minSize), w: right - Math.min(px, right - minSize), h: bottom - Math.min(py, bottom - minSize) }
      break
    case 'ne':
      next = { x: left, y: Math.min(py, bottom - minSize), w: Math.max(minSize, px - left), h: bottom - Math.min(py, bottom - minSize) }
      break
    case 'se':
      next = { x: left, y: top, w: Math.max(minSize, px - left), h: Math.max(minSize, py - top) }
      break
    case 'sw':
      next = { x: Math.min(px, right - minSize), y: top, w: right - Math.min(px, right - minSize), h: Math.max(minSize, py - top) }
      break
    default:
      return null
  }
  return clampCrop({
    x: next.x,
    y: next.y,
    w: Math.min(1 - next.x, next.w),
    h: Math.min(1 - next.y, next.h),
  })
}
