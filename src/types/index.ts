export type ColorMode = "monochrome" | "colored";
export type CharsetKey = "simple" | "detailed" | "block" | "custom";
export type ExportQuality = "low" | "medium" | "high" | "extraHigh";
export type MediaType = "image" | "animation";
export type RenderMode = "ascii" | "pixel";

export interface AsciiSettings {
  columns: number;
  colorMode: ColorMode;
  fgColor: string;
  bgColor: string;
  charsetKey: CharsetKey;
  customCharset: string;
  fontSize: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  charAspectRatio: number;
  gamma: number;
  saturation: number;
  edgeEnhance: boolean;
  lineHeight: number;
  renderMode: RenderMode;
}

export interface AsciiChar {
  char: string;
  r: number;
  g: number;
  b: number;
}

export interface AsciiOutput {
  grid: AsciiChar[][];
  rows: number;
  columns: number;
}

export interface Preset {
  id: string;
  name: string;
  settings: AsciiSettings;
  builtIn: boolean;
  createdAt: number;
}

export interface ExtractedFrames {
  frames: HTMLCanvasElement[];
  fps: number;
  width: number;
  height: number;
}
