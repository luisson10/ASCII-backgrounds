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
  // Clone pixels to avoid mutating the source
  const px = new Uint8ClampedArray(pixels);

  // Apply brightness and contrast
  if (settings.brightness !== 0 || settings.contrast !== 0) {
    const b = settings.brightness;
    const c = settings.contrast;
    const factor = (259 * (c + 255)) / (255 * (259 - c));

    for (let i = 0; i < px.length; i += 4) {
      px[i] = clamp(factor * (px[i] - 128) + 128 + b);
      px[i + 1] = clamp(factor * (px[i + 1] - 128) + 128 + b);
      px[i + 2] = clamp(factor * (px[i + 2] - 128) + 128 + b);
    }
  }

  // Apply gamma correction
  if (settings.gamma !== 1.0) {
    const invGamma = 1 / settings.gamma;
    for (let i = 0; i < px.length; i += 4) {
      px[i] = clamp(255 * Math.pow(px[i] / 255, invGamma));
      px[i + 1] = clamp(255 * Math.pow(px[i + 1] / 255, invGamma));
      px[i + 2] = clamp(255 * Math.pow(px[i + 2] / 255, invGamma));
    }
  }

  // Apply saturation adjustment
  if (settings.saturation !== 1.0) {
    const sat = settings.saturation;
    for (let i = 0; i < px.length; i += 4) {
      const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      px[i] = clamp(gray + sat * (px[i] - gray));
      px[i + 1] = clamp(gray + sat * (px[i + 1] - gray));
      px[i + 2] = clamp(gray + sat * (px[i + 2] - gray));
    }
  }

  // Apply edge enhancement (unsharp mask via Laplacian sharpening)
  if (settings.edgeEnhance) {
    const alpha = 0.6;
    const sharpened = new Uint8ClampedArray(px);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const top = ((y - 1) * w + x) * 4;
        const bot = ((y + 1) * w + x) * 4;
        const left = (y * w + (x - 1)) * 4;
        const right = (y * w + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const neighborAvg =
            (px[top + c] + px[bot + c] + px[left + c] + px[right + c]) / 4;
          sharpened[idx + c] = clamp(
            px[idx + c] + alpha * (px[idx + c] - neighborAvg)
          );
        }
      }
    }

    // Copy sharpened data back
    for (let i = 0; i < px.length; i++) {
      px[i] = sharpened[i];
    }
  }

  const columns = settings.columns;
  const cellWidth = w / columns;
  const cellHeight = cellWidth * settings.charAspectRatio;
  const rows = Math.floor(h / cellHeight);

  const charset =
    settings.charsetKey === "custom"
      ? settings.customCharset
      : CHARSETS[settings.charsetKey];

  if (!charset || charset.length === 0) {
    return { grid: [], rows: 0, columns: 0 };
  }

  const isPixelMode = settings.renderMode === "pixel";
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
          totalR += px[idx];
          totalG += px[idx + 1];
          totalB += px[idx + 2];
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

      if (isPixelMode) {
        // Pixel mode: use block character, color is average cell color
        if (settings.colorMode === "monochrome") {
          const gray = Math.round(luminance * 255);
          line.push({ char: "█", r: gray, g: gray, b: gray });
        } else {
          line.push({ char: "█", r: avgR, g: avgG, b: avgB });
        }
      } else {
        // ASCII mode: map luminance to character
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
    }
    grid.push(line);
  }

  return { grid, rows, columns };
}

function clamp(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}
