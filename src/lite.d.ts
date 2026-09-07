import type { COBEOptions, Globe, Marker } from './index'

export type { Globe, Marker }

/**
 * The lite renderer's options: the full option set minus everything to do
 * with arcs, which this build does not include.
 */
export type LiteOptions = Omit<
  COBEOptions,
  'arcs' | 'arcColor' | 'arcWidth' | 'arcHeight'
>

/**
 * Globe and markers only - no arcs, no DOM anchors, WebGL2 only.
 * Same API as the full renderer otherwise.
 */
export default function createGlobe(
  canvas: HTMLCanvasElement,
  opts: LiteOptions,
): Globe
