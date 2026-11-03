/* Minimal ZIP writer (store method, no compression).
 *
 * Design exports are already-compressed PNG/JPG bytes, so storing them keeps
 * the archive small enough and avoids pulling a deflate implementation into
 * the bundle. Produces a standard archive readable by Finder, Windows Explorer
 * and `unzip`.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

export function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date) {
  const d = date instanceof Date ? date : new Date()
  const year = Math.max(1980, d.getFullYear())
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | (Math.floor(d.getSeconds() / 2) & 0x1f)
  const day = (((year - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f)
  return { time, day }
}

const encoder = new TextEncoder()

function utf8(str) {
  return encoder.encode(String(str))
}

/**
 * Build a ZIP archive.
 * entries: [{ name: string, data: Uint8Array, date?: Date }]
 * returns Uint8Array
 */
export function buildZip(entries, options) {
  const opts = options || {}
  const stamp = dosDateTime(opts.date)
  const chunks = []
  const central = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = utf8(entry.name)
    const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data || [])
    const crc = crc32(data)
    const when = dosDateTime(entry.date || opts.date)

    const local = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true) // local file header signature
    lv.setUint16(4, 20, true) // version needed
    lv.setUint16(6, 0x0800, true) // UTF-8 file name flag
    lv.setUint16(8, 0, true) // method: store
    lv.setUint16(10, when.time, true)
    lv.setUint16(12, when.day, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true) // extra length
    local.set(nameBytes, 30)

    chunks.push(local, data)

    const cd = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cd.buffer)
    cv.setUint32(0, 0x02014b50, true) // central directory signature
    cv.setUint16(4, 20, true) // version made by
    cv.setUint16(6, 20, true) // version needed
    cv.setUint16(8, 0x0800, true) // UTF-8 flag
    cv.setUint16(10, 0, true) // method: store
    cv.setUint16(12, when.time, true)
    cv.setUint16(14, when.day, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint16(30, 0, true) // extra
    cv.setUint16(32, 0, true) // comment
    cv.setUint16(34, 0, true) // disk number start
    cv.setUint16(36, 0, true) // internal attributes
    cv.setUint32(38, 0, true) // external attributes
    cv.setUint32(42, offset, true) // local header offset
    cd.set(nameBytes, 46)

    central.push(cd)
    offset += local.length + data.length
  }

  let centralSize = 0
  for (const cd of central) centralSize += cd.length

  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(4, 0, true) // this disk
  ev.setUint16(6, 0, true) // disk with central directory
  ev.setUint16(8, entries.length, true)
  ev.setUint16(10, entries.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)
  ev.setUint16(20, 0, true)

  const all = chunks.concat(central, [end])
  let total = 0
  for (const part of all) total += part.length
  const out = new Uint8Array(total)
  let at = 0
  for (const part of all) {
    out.set(part, at)
    at += part.length
  }
  return out
}
