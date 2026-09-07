// Screen-space picking.
//
// An opt-in layer. The maths here is the exact inverse of the renderer's own
// transform in index.js: the projection is orthographic and the rotation
// matrix is orthonormal, so the inverse is its transpose - no matrix solve.

import { cancelFly } from './fly.js'

// Re-exported so `pkg/pick` is a single, self-contained import for the common
// case of clicking a marker and flying to it. Import `pkg/fly` on its own if
// you only need the camera animation.
export { centerOn, flyTo, cancelFly } from './fly.js'

const { PI, sin, cos, asin, atan2, sqrt } = Math

const GLOBE_R = 0.8
const DEG = 180 / PI

// Default click/hover tolerance around a marker, in CSS pixels.
const HIT_RADIUS = 16
// Pointer travel beyond this (CSS px) counts as a drag, not a click.
const DRAG_SLOP = 6

/**
 * Turn a pointer position into a [lat, lon] on the globe.
 *
 * @param {object} globe - the instance returned by createGlobe
 * @param {HTMLCanvasElement} canvas
 * @param {number} clientX - e.g. PointerEvent.clientX
 * @param {number} clientY
 * @param {number} [radius] - sphere to intersect; defaults to the map surface
 * @returns {[number, number] | null} [lat, lon], or null if the pointer
 *   missed the globe entirely
 */
export function unproject(globe, canvas, clientX, clientY, radius) {
  const [phi, theta, scale, offset, dpr] = globe.state()
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return null

  const R = radius || GLOBE_R
  const aspect = canvas.width / canvas.height

  // Undo the viewport mapping done at the end of applyRotation().
  const u = (clientX - rect.left) / rect.width
  const v = (clientY - rect.top) / rect.height
  const rx = ((2 * u - 1) - (offset[0] * scale * dpr) / canvas.width) * aspect / scale
  const ry = -((2 * v - 1) - (offset[1] * scale * dpr) / canvas.height) / scale

  // Ray-sphere intersection. Orthographic, so the ray is along -z and the
  // near hit is simply the positive root.
  const d = R * R - rx * rx - ry * ry
  if (d < 0) return null
  const rz = sqrt(d)

  // p = transpose(M) * r, with M as built in applyRotation().
  const cx = cos(theta)
  const cy = cos(phi)
  const sx = sin(theta)
  const sy = sin(phi)
  const px = cy * rx + sy * sx * ry - sy * cx * rz
  const py = cx * ry + sx * rz
  const pz = sy * rx - cy * sx * ry + cy * cx * rz

  // Invert latLonTo3D().
  const len = sqrt(px * px + py * py + pz * pz)
  const y = py / len
  const cosLat = sqrt(1 - y * y)
  const lon = (atan2(pz / len / cosLat, -px / len / cosLat) + PI) * DEG

  return [asin(y) * DEG, lon > 180 ? lon - 360 : lon]
}

/**
 * The marker nearest the pointer, or null if none is within `radius`.
 * Only markers the renderer actually draws are considered, so a marker on
 * the far side of the globe can't be clicked through it.
 *
 * @param {object} globe
 * @param {HTMLCanvasElement} canvas
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} [radius] - tolerance in CSS pixels
 * @returns {object | null} the marker object you passed in, untouched
 */
export function hitTest(globe, canvas, clientX, clientY, radius) {
  const markers = globe.state()[6]
  const rect = canvas.getBoundingClientRect()
  const r = radius || HIT_RADIUS
  const x = clientX - rect.left
  const y = clientY - rect.top

  let best = null
  // Compare squared distances - avoids a sqrt per marker per frame.
  let bestDist = r * r

  for (const marker of markers) {
    const p = globe.project(marker.location)
    if (!p.visible) continue
    const dx = p.x * rect.width - x
    const dy = p.y * rect.height - y
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = marker
    }
  }

  return best
}

/**
 * Wire pointer events on the canvas to marker/globe hit-testing.
 *
 * Distinguishes a click from a drag, and cancels any in-flight animation the
 * moment the user takes hold of the globe - otherwise flyTo() and the user's
 * own drag handler would both be writing phi every frame.
 *
 * @param {object} globe
 * @param {HTMLCanvasElement} canvas
 * @param {object} [handlers]
 * @param {(marker: object, event: PointerEvent) => void} [handlers.onMarkerClick]
 * @param {(marker: object | null, event: PointerEvent) => void} [handlers.onMarkerHover]
 * @param {(location: [number, number], event: PointerEvent) => void} [handlers.onGlobeClick]
 * @param {number} [handlers.radius=16] - hit tolerance in CSS pixels
 * @param {boolean} [handlers.cursor=true] - show a pointer cursor over markers
 * @returns {() => void} detach
 */
export function pick(globe, canvas, handlers = {}) {
  const {
    onMarkerClick,
    onMarkerHover,
    onGlobeClick,
    radius,
    cursor = true,
  } = handlers

  let downAt = null
  let hovered = null
  let hoverRaf = 0

  const onDown = (e) => {
    downAt = [e.clientX, e.clientY]
    cancelFly(globe)
  }

  const onUp = (e) => {
    const from = downAt
    downAt = null
    if (!from) return
    const dx = e.clientX - from[0]
    const dy = e.clientY - from[1]
    // A drag was a gesture, not a click on a place.
    if (dx * dx + dy * dy > DRAG_SLOP * DRAG_SLOP) {
      return
    }

    const marker = onMarkerClick
      ? hitTest(globe, canvas, e.clientX, e.clientY, radius)
      : null

    if (marker) {
      onMarkerClick(marker, e)
    } else if (onGlobeClick) {
      const location = unproject(globe, canvas, e.clientX, e.clientY)
      if (location) onGlobeClick(location, e)
    }
  }

  // Hover runs on every pointermove, so coalesce to one hit-test per frame.
  const onMove = (e) => {
    if (hoverRaf) return
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0
      const marker = hitTest(globe, canvas, e.clientX, e.clientY, radius)
      if (marker === hovered) return
      hovered = marker
      if (cursor) canvas.style.cursor = marker ? 'pointer' : ''
      if (onMarkerHover) onMarkerHover(marker, e)
    })
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  if (onMarkerHover || cursor) {
    canvas.addEventListener('pointermove', onMove, { passive: true })
  }

  return () => {
    cancelAnimationFrame(hoverRaf)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointermove', onMove)
    if (cursor) canvas.style.cursor = ''
  }
}
