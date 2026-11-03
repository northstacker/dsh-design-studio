/**
 * Shared harness for the design-studio verification suite.
 *
 * Renders with the same Skia build the plugin uses in the browser (Canvas 2D),
 * so paint calls, text metrics and PNG/JPEG encoding are exercised for real
 * instead of being mocked.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas'

import * as E from '../src/engine.mjs'

export const engine = E

export function canvasOf(width, height) {
  const canvas = createCanvas(width, height)
  return { canvas, ctx: canvas.getContext('2d') }
}

/** Build a real PNG asset: `paint(ctx, w, h)` fills the pixels. */
export async function makeAsset(width, height, paint, name) {
  const { canvas, ctx } = canvasOf(width, height)
  paint(ctx, width, height)
  const buffer = canvas.toBuffer('image/png')
  const dataUrl = 'data:image/png;base64,' + buffer.toString('base64')
  const image = await decodeImage(buffer)
  if (!image.width) throw new Error('decoded test image has no width')
  const asset = E.createAsset(image, name || 'asset', 'image/png', dataUrl)
  return { asset, image, canvas, buffer, dataUrl }
}

/** Decode PNG/JPEG bytes into a drawable image (Skia needs the async loader). */
export function decodeImage(buffer) {
  return loadImage(buffer)
}

/** A loader for `paintDesign({ getImage })` backed by a { id: Image } map. */
export function imageLoader(images) {
  return (assetId) => images[assetId] || null
}

export function pixel(ctx, x, y) {
  const data = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data
  return { r: data[0], g: data[1], b: data[2], a: data[3] }
}

export function rgbNear(actual, expected, tolerance) {
  const t = tolerance == null ? 6 : tolerance
  return (
    Math.abs(actual.r - expected.r) <= t &&
    Math.abs(actual.g - expected.g) <= t &&
    Math.abs(actual.b - expected.b) <= t
  )
}

const failures = []
let checks = 0

export function check(label, condition, detail) {
  checks += 1
  if (!condition) failures.push({ label, detail })
  return !!condition
}

export function checkDeep(label, actual, expected) {
  return check(label, JSON.stringify(actual) === JSON.stringify(expected), {
    actual,
    expected,
  })
}

export function checkNear(label, actual, expected, tolerance) {
  const t = tolerance == null ? 6 : tolerance
  return check(label, rgbNear(actual, expected, t), { actual, expected })
}

export function report(name) {
  if (failures.length) {
    console.error(`\n✗ ${name}: ${failures.length}/${checks} checks failed`)
    for (const failure of failures) {
      console.error('  · ' + failure.label)
      if (failure.detail !== undefined) {
        console.error('    ' + JSON.stringify(failure.detail))
      }
    }
    process.exitCode = 1
    return false
  }
  console.log(`✓ ${name}: ${checks} checks`)
  return true
}

export function resetCounters() {
  failures.length = 0
  checks = 0
}

export function failureCount() {
  return failures.length
}
