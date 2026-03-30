import { AsciiSettings, ExportQuality, RenderMode } from "@/types";

export const CHARSETS: Record<string, string> = {
  simple: " .:-=+*#%@",
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  block: " ░▒▓█",
};

export const DEFAULT_SETTINGS: AsciiSettings = {
  columns: 100,
  colorMode: "monochrome",
  fgColor: "#ffffff",
  bgColor: "#1a1a1a",
  charsetKey: "simple",
  customCharset: " .:-=+*#%@",
  fontSize: 8,
  brightness: 0,
  contrast: 0,
  invert: false,
  charAspectRatio: 1.75,
  gamma: 1.0,
  saturation: 1.0,
  edgeEnhance: false,
  lineHeight: 1.0,
  renderMode: "ascii" as RenderMode,
};

export const EXPORT_PRESETS: Record<
  ExportQuality,
  { scale: number; label: string; description: string }
> = {
  low: { scale: 1, label: "Low", description: "1x — Fast, small file" },
  medium: { scale: 2, label: "Medium", description: "2x — Balanced" },
  high: { scale: 4, label: "High", description: "4x — Sharp, larger file" },
  extraHigh: {
    scale: 6,
    label: "Extra High",
    description: "6x — Maximum quality",
  },
};
