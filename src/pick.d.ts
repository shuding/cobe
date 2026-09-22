import type { Globe, Marker } from './index'
import type { Location } from './fly'

export type { Location }
export type { FlyToOptions } from './fly'
export { centerOn, flyTo, cancelFly } from './fly'

/**
 * Turn a pointer position into a location on the globe.
 * Returns null when the pointer missed the globe.
 */
export declare function unproject(
  globe: Globe,
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  radius?: number,
): Location | null

/** The nearest visible marker within `radius` CSS pixels, or null. */
export declare function hitTest(
  globe: Globe,
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  radius?: number,
): Marker | null

export interface PickHandlers {
  onMarkerClick?: (marker: Marker, event: PointerEvent) => void
  onMarkerHover?: (marker: Marker | null, event: PointerEvent) => void
  onGlobeClick?: (location: Location, event: PointerEvent) => void
  /** Hit tolerance in CSS pixels. Default 16. */
  radius?: number
  /** Show a pointer cursor while over a marker. Default true. */
  cursor?: boolean
}

/**
 * Wire pointer events on the canvas to marker and globe hit-testing.
 * Returns a detach function - call it on unmount.
 */
export declare function pick(
  globe: Globe,
  canvas: HTMLCanvasElement,
  handlers?: PickHandlers,
): () => void
