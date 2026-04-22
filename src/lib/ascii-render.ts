import { AsciiOutput, AsciiSettings } from "@/types";

export interface RenderDimensions {
  charWidth: number;
  rowHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  fontSize: number;
  fontFamily: string;
}

/**
 * Computes rendering dimensions using the SAME font-family as the preview,
 * read from the DOM to guarantee the export matches what the user sees.
 */
export function computeDimensions(
  output: AsciiOutput,
  settings: AsciiSettings,
  scale: number = 1
): RenderDimensions {
  const fontSize = settings.fontSize * scale;
  const padding = 24 * scale;

  // Read the ACTUAL computed font-family from the preview element
  // This avoids CSS-variable resolution issues (the root cause of overlap)
  const previewEl =
    typeof document !== "undefined"
      ? document.getElementById("ascii-output")
      : null;
  const fontFamily = previewEl
    ? window.getComputedStyle(previewEl).fontFamily
    : `"Geist Mono", Menlo, Consolas, "Courier New", monospace`;

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  const charWidth = measureCtx.measureText("M").width;
  const rowHeight = fontSize * settings.lineHeight;

  const canvasWidth = Math.ceil(charWidth * output.columns + padding * 2);
  const canvasHeight = Math.ceil(rowHeight * output.rows + padding * 2);

  return {
    charWidth,
    rowHeight,
    canvasWidth,
    canvasHeight,
    padding,
    fontSize,
    fontFamily,
  };
}

/**
 * Renders an ASCII output to a canvas. Pixel-perfect matches the DOM preview
 * because it uses the same font-family and char metrics.
 */
export function renderToCanvas(
  output: AsciiOutput,
  settings: AsciiSettings,
  dims: RenderDimensions
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = dims.canvasWidth;
  canvas.height = dims.canvasHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, dims.canvasWidth, dims.canvasHeight);

  ctx.font = `${dims.fontSize}px ${dims.fontFamily}`;
  ctx.textBaseline = "top";

  const useColored =
    settings.colorMode === "colored" || settings.renderMode === "pixel";

  for (let row = 0; row < output.grid.length; row++) {
    for (let col = 0; col < output.grid[row].length; col++) {
      const c = output.grid[row][col];
      if (useColored) {
        ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      } else {
        ctx.fillStyle = settings.fgColor;
      }
      ctx.fillText(
        c.char,
        dims.padding + col * dims.charWidth,
        dims.padding + row * dims.rowHeight
      );
    }
  }

  return canvas;
}

/**
 * Renders an ASCII output to an SVG string. Every character is explicitly
 * positioned via tspan x coordinates so layout is correct regardless of
 * whether the target browser has Geist Mono loaded.
 */
export function renderToSvg(
  output: AsciiOutput,
  settings: AsciiSettings,
  dims: RenderDimensions
): string {
  const useColored =
    settings.colorMode === "colored" || settings.renderMode === "pixel";

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.canvasWidth}" height="${dims.canvasHeight}" viewBox="0 0 ${dims.canvasWidth} ${dims.canvasHeight}">`
  );
  parts.push(
    `<rect width="${dims.canvasWidth}" height="${dims.canvasHeight}" fill="${escapeXml(settings.bgColor)}"/>`
  );
  parts.push(
    `<g font-family="${escapeXml(dims.fontFamily)}" font-size="${dims.fontSize}" xml:space="preserve">`
  );

  for (let row = 0; row < output.grid.length; row++) {
    const y = dims.padding + row * dims.rowHeight;

    if (useColored) {
      // Each character is a tspan with its own color and explicit x
      let rowSvg = `<text y="${y}" dominant-baseline="text-before-edge">`;
      for (let col = 0; col < output.grid[row].length; col++) {
        const c = output.grid[row][col];
        const color = `rgb(${c.r},${c.g},${c.b})`;
        const x = dims.padding + col * dims.charWidth;
        rowSvg += `<tspan x="${x}" fill="${color}">${escapeXml(c.char)}</tspan>`;
      }
      rowSvg += `</text>`;
      parts.push(rowSvg);
    } else {
      // Monochrome: one text element per row with a single fill.
      // Use textLength + lengthAdjust to force the monospace spacing even if
      // the target font metrics differ slightly.
      const chars = output.grid[row].map((c) => c.char).join("");
      const totalLength = output.grid[row].length * dims.charWidth;
      parts.push(
        `<text x="${dims.padding}" y="${y}" fill="${escapeXml(settings.fgColor)}" dominant-baseline="text-before-edge" textLength="${totalLength}" lengthAdjust="spacingAndGlyphs">${escapeXml(chars)}</text>`
      );
    }
  }

  parts.push(`</g>`);
  parts.push(`</svg>`);
  return parts.join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
