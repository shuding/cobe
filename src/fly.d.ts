import type { Globe } from './index'

/** Latitude, longitude - both in degrees. */
export type Location = [number, number]

/**
 * The phi/theta that bring a location to the front-centre of the globe.
 * Useful if you want to set the camera yourself instead of animating to it.
 */
export declare function centerOn(location: Location): {
  phi: number
  theta: number
}

export interface FlyToOptions {
  /** Milliseconds. Default 900. */
  duration?: number
  /** Target `scale`. Omit to leave the current scale untouched. */
  zoom?: number
  /** Progress 0..1 in, eased 0..1 out. Default is an ease-in-out cubic. */
  easing?: (t: number) => number
  /** Called on arrival. Not called if the flight is cancelled. */
  onDone?: () => void
}

/**
 * Animate the globe until `location` sits front-and-centre.
 * Returns a cancel function. Starting a new flight cancels the previous one.
 */
export declare function flyTo(
  globe: Globe,
  location: Location,
  options?: FlyToOptions,
): () => void

/** Stop the flight currently running on this globe, if any. */
export declare function cancelFly(globe: Globe): void

