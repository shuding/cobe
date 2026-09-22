// Camera animation.
//
// An opt-in layer, separate from `pick` so that a UI which flies to a place
// from a list or a button never carries the hit-testing code.

const { PI, cos, sin } = Math

const TAU = PI * 2
const DEG = 180 / PI

/**
 * The phi/theta that bring a location to the front-centre of the globe.
 *
 * Derived from the renderer's rotation: centring means the rotated point
 * must land on +z, i.e. p == transpose(M) * [0,0,1], which gives
 * sin(theta) = y and phi = atan2(-x, z).
 *
 * @param {[number, number]} location - [latitude, longitude] in degrees
 * @returns {{ phi: number, theta: number }}
 */
export function centerOn([lat, lon]) {
  return { phi: (3 * PI) / 2 - lon / DEG, theta: lat / DEG }
}

// One in-flight animation per globe, so a second flyTo() supersedes the first
// instead of both fighting over phi/theta.
const flights = new WeakMap()

/** Stop the animation currently running on this globe, if any. */
export function cancelFly(globe) {
  const stop = flights.get(globe)
  if (stop) stop()
}

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

/**
 * Animate the globe until `location` sits front-and-centre.
 *
 * @param {object} globe
 * @param {[number, number]} location - [latitude, longitude] in degrees
 * @param {object} [options]
 * @param {number} [options.duration=900] - milliseconds
 * @param {number} [options.zoom] - target scale; omit to leave scale alone
 * @param {(t: number) => number} [options.easing]
 * @param {() => void} [options.onDone] - not called if the flight is cancelled
 * @returns {() => void} cancel
 */
export function flyTo(globe, location, options = {}) {
  cancelFly(globe)

  const { duration = 900, zoom, easing = easeInOutCubic, onDone } = options
  const [phi0, theta0, scale0] = globe.state()
  const { phi: phiTarget, theta: theta1 } = centerOn(location)

  // Rotate the short way round: wrap the delta into [-PI, PI] so a globe at
  // 350 degrees turns 20 degrees forward rather than 340 degrees back.
  const dPhi = ((phiTarget - phi0 + PI) % TAU + TAU) % TAU - PI
  const dTheta = theta1 - theta0
  const dScale = zoom === undefined ? 0 : zoom - scale0

  let raf = 0
  let start = 0
  let live = true

  const stop = () => {
    live = false
    cancelAnimationFrame(raf)
    flights.delete(globe)
  }
  flights.set(globe, stop)

  // Nothing to animate - snap and leave. Avoids a frame of no-op work when
  // the target is already centred.
  if (!dPhi && !dTheta && !dScale) {
    stop()
    if (onDone) onDone()
    return stop
  }

  const step = (now) => {
    if (!live) return
    if (!start) start = now
    const t = duration > 0 ? Math.min((now - start) / duration, 1) : 1
    const e = easing(t)

    const state = { phi: phi0 + dPhi * e, theta: theta0 + dTheta * e }
    if (dScale) state.scale = scale0 + dScale * e
    globe.update(state)

    if (t < 1) {
      raf = requestAnimationFrame(step)
    } else {
      stop()
      if (onDone) onDone()
    }
  }

  raf = requestAnimationFrame(step)
  return stop
}

