import { AsciiChar, AsciiOutput, AsciiSettings } from "@/types";
import { CHARSETS } from "./constants";

export function convertCanvasToAscii(
  sourceCanvas: HTMLCanvasElement,
  settings: AsciiSettings
): AsciiOutput {
  const ctx = sourceCanvas.getContext("2d")!;
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  return processPixels(imageData.data, w, h, settings);
}

export function convertToAscii(
  image: HTMLImageElement,
  settings: AsciiSettings
): AsciiOutput {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const w = image.naturalWidth || image.width;
  const h = image.naturalHeight || image.height;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(image, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  return processPixels(imageData.data, w, h, settings);
}

function processPixels(
  pixels: Uint8ClampedArray,
  w: number,
  h: number,
  settings: AsciiSettings
): AsciiOutput {

  // Apply brightness and contrast
  if (settings.brightness !== 0 || settings.contrast !== 0) {
    const b = settings.brightness;
    const c = settings.contrast;
    const factor = (259 * (c + 255)) / (255 * (259 - c));

    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = clamp(factor * (pixels[i] - 128) + 128 + b);
      pixels[i + 1] = clamp(factor * (pixels[i + 1] - 128) + 128 + b);
      pixels[i + 2] = clamp(factor * (pixels[i + 2] - 128) + 128 + b);
    }
  }

  const columns = settings.columns;
  const cellWidth = w / columns;
  const cellHeight = cellWidth * 2; // monospace chars are ~2x tall as wide
  const rows = Math.floor(h / cellHeight);

  const charset =
    settings.charsetKey === "custom"
      ? settings.customCharset
      : CHARSETS[settings.charsetKey];

  if (!charset || charset.length === 0) {
    return { grid: [], rows: 0, columns: 0 };
  }

  const grid: AsciiChar[][] = [];

  for (let row = 0; row < rows; row++) {
    const line: AsciiChar[] = [];
    for (let col = 0; col < columns; col++) {
      const x0 = Math.floor(col * cellWidth);
      const y0 = Math.floor(row * cellHeight);
      const x1 = Math.min(Math.floor((col + 1) * cellWidth), w);
      const y1 = Math.min(Math.floor((row + 1) * cellHeight), h);

      let totalR = 0,
        totalG = 0,
        totalB = 0,
        count = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * w + x) * 4;
          totalR += pixels[idx];
          totalG += pixels[idx + 1];
          totalB += pixels[idx + 2];
          count++;
        }
      }

      if (count === 0) {
        line.push({ char: " ", r: 0, g: 0, b: 0 });
        continue;
      }

      const avgR = Math.round(totalR / count);
      const avgG = Math.round(totalG / count);
      const avgB = Math.round(totalB / count);

      // Luminance
      let luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
      if (settings.invert) luminance = 1 - luminance;

      const charIndex = Math.min(
        Math.floor(luminance * charset.length),
        charset.length - 1
      );

      line.push({
        char: charset[charIndex],
        r: avgR,
        g: avgG,
        b: avgB,
      });
    }
    grid.push(line);
  }

  return { grid, rows, columns };
}

function clamp(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}
