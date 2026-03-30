import { AsciiSettings, Preset } from "@/types";

const STORAGE_KEY = "ascii-app-presets";

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "classic-terminal",
    name: "Classic Terminal",
    builtIn: true,
    createdAt: 0,
    settings: {
      columns: 100,
      colorMode: "monochrome",
      fgColor: "#00ff41",
      bgColor: "#0d0d0d",
      charsetKey: "simple",
      customCharset: " .:-=+*#%@",
      fontSize: 8,
      brightness: 0,
      contrast: 10,
      invert: false,
      charAspectRatio: 1.75,
      gamma: 1.0,
      saturation: 1.0,
      edgeEnhance: false,
      lineHeight: 1.0,
      renderMode: "ascii",
    },
  },
  {
    id: "high-detail-color",
    name: "High Detail Color",
    builtIn: true,
    createdAt: 0,
    settings: {
      columns: 200,
      colorMode: "colored",
      fgColor: "#ffffff",
      bgColor: "#1a1a1a",
      charsetKey: "detailed",
      customCharset: " .:-=+*#%@",
      fontSize: 6,
      brightness: 0,
      contrast: 15,
      invert: false,
      charAspectRatio: 1.75,
      gamma: 1.1,
      saturation: 1.2,
      edgeEnhance: true,
      lineHeight: 1.0,
      renderMode: "ascii",
    },
  },
  {
    id: "pixel-retro",
    name: "Pixel Art Retro",
    builtIn: true,
    createdAt: 0,
    settings: {
      columns: 80,
      colorMode: "colored",
      fgColor: "#ffffff",
      bgColor: "#1a1a1a",
      charsetKey: "simple",
      customCharset: " .:-=+*#%@",
      fontSize: 8,
      brightness: 5,
      contrast: 20,
      invert: false,
      charAspectRatio: 1.75,
      gamma: 0.9,
      saturation: 1.4,
      edgeEnhance: false,
      lineHeight: 1.0,
      renderMode: "pixel",
    },
  },
  {
    id: "minimal-blocks",
    name: "Minimal Blocks",
    builtIn: true,
    createdAt: 0,
    settings: {
      columns: 120,
      colorMode: "monochrome",
      fgColor: "#e0e0e0",
      bgColor: "#121212",
      charsetKey: "block",
      customCharset: " .:-=+*#%@",
      fontSize: 7,
      brightness: 0,
      contrast: 5,
      invert: false,
      charAspectRatio: 1.75,
      gamma: 1.0,
      saturation: 1.0,
      edgeEnhance: false,
      lineHeight: 0.95,
      renderMode: "ascii",
    },
  },
];

export function loadPresets(): Preset[] {
  if (typeof window === "undefined") return BUILT_IN_PRESETS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const custom: Preset[] = stored ? JSON.parse(stored) : [];
    return [...BUILT_IN_PRESETS, ...custom];
  } catch {
    return BUILT_IN_PRESETS;
  }
}

export function savePreset(name: string, settings: AsciiSettings): Preset {
  const preset: Preset = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    settings: { ...settings },
    builtIn: false,
    createdAt: Date.now(),
  };

  const custom = getCustomPresets();
  custom.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  return preset;
}

export function deletePreset(id: string): void {
  const custom = getCustomPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

function getCustomPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
