import type Phenomenon from "phenomenon";

export interface Marker {
  location: [number, number];
  size: number;
  color?: [number, number, number];
}

export interface COBEOptions {
  width: number;
  height: number;
  onRender: (state: Record<string, any>) => void;
  phi: number;
  theta: number;
  mapSamples: number;
  mapBrightness: number;
  mapBaseBrightness?: number;
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
  markers: Marker[];
  diffuse: number;
  devicePixelRatio: number;
  dark: number;
  opacity?: number;
  offset?: [number, number];
  scale?: number;
  context?: WebGLContextAttributes;
  dragX?: boolean;
  dragY?: boolean;
  dragSensitivityX?: number;
  dragSensitivityY?: number;
  returnXToDefault?: boolean;
  returnYToDefault?: boolean;
  returnSpeed?: number;
  autoRotateSpeed?: number;
}

export default function createGlobe(
  canvas: HTMLCanvasElement,
  opts: COBEOptions,
): Phenomenon;
