export interface Marker {
  location: [number, number]
  size: number
  color?: [number, number, number]
  id?: string
}

export interface Arc {
  from: [number, number]
  to: [number, number]
  color?: [number, number, number]
  id?: string
}

export interface COBEOptions {
  width: number
  height: number
  phi: number
  theta: number
  mapSamples: number
  mapBrightness: number
  mapBaseBrightness?: number
  baseColor: [number, number, number]
  markerColor: [number, number, number]
  glowColor: [number, number, number]
  markers?: Marker[]
  diffuse: number
  devicePixelRatio: number
  dark: number
  opacity?: number
  offset?: [number, number]
  scale?: number
  context?: WebGLContextAttributes

  // New in v2
  arcs?: Arc[]
  arcColor?: [number, number, number]
  arcWidth?: number
  arcHeight?: number
  markerElevation?: number
}

export interface Globe {
  update: (state: Partial<COBEOptions>) => void
  destroy: () => void
  /**
   * Project a location to normalized canvas coordinates. `x` and `y` are
   * fractions of the canvas (0..1); `visible` is false when the point is
   * hidden behind the globe.
   */
  project: (location: [number, number]) => {
    x: number
    y: number
    visible: boolean
  }
  /**
   * Current camera and marker state, as
   * `[phi, theta, scale, offset, devicePixelRatio, markerElevation, markers]`.
   */
  state: () => [
    number,
    number,
    number,
    [number, number],
    number,
    number,
    Marker[],
  ]
}

export default function createGlobe(
  canvas: HTMLCanvasElement,
  opts: COBEOptions,
): Globe
