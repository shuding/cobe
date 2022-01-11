import Phenomenon from "phenomenon";

declare namespace OptionKey {
  const OPT_PHI = "phi";
  const OPT_THETA = "theta";
  const OPT_DOTS = "mapSamples";
  const OPT_MAP_BRIGHTNESS = "mapBrightness";
  const OPT_BASE_COLOR = "baseColor";
  const OPT_MARKER_COLOR = "markerColor";
  const OPT_GLOW_COLOR = "glowColor";
  const OPT_MARKERS = "markers";
  const OPT_DIFFUSE = "diffuse";
  const OPT_DPR = "devicePixelRatio";
  const OPT_DARK = "dark";
}

export interface Marker {
  location: [number, number];
  size: number;
}

export interface COBEOptions {
  width: number;
  height: number;
  onRender: (state: Record<string, any>) => void;
  [OptionKey.OPT_PHI]: number;
  [OptionKey.OPT_THETA]: number;
  [OptionKey.OPT_DOTS]: number;
  [OptionKey.OPT_MAP_BRIGHTNESS]: number;
  [OptionKey.OPT_BASE_COLOR]: [number, number, number];
  [OptionKey.OPT_MARKER_COLOR]: [number, number, number];
  [OptionKey.OPT_GLOW_COLOR]: [number, number, number];
  [OptionKey.OPT_MARKERS]: Marker[];
  [OptionKey.OPT_DIFFUSE]: number;
  [OptionKey.OPT_DPR]: number;
  [OptionKey.OPT_DARK]: number;
}

export default function createGlobe(
  canvas: HTMLCanvasElement,
  opts: COBEOptions
): Phenomenon;
