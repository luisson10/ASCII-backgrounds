import { AsciiOutput, AsciiSettings, ExportQuality } from "@/types";
import { EXPORT_PRESETS } from "./constants";
import { computeDimensions, renderToCanvas, renderToSvg } from "./ascii-render";

export async function exportAsPng(
  output: AsciiOutput,
  settings: AsciiSettings,
  quality: ExportQuality
): Promise<void> {
  // Wait for fonts to be loaded so char width measurements are accurate
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const scale = EXPORT_PRESETS[quality].scale;
  const dims = computeDimensions(output, settings, scale);
  const canvas = renderToCanvas(output, settings, dims);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      "image/png"
    );
  });

  downloadBlob(blob, `ascii-art-${quality}.png`);
}

export async function exportAsSvg(
  output: AsciiOutput,
  settings: AsciiSettings
): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const dims = computeDimensions(output, settings, 1);
  const svg = renderToSvg(output, settings, dims);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadBlob(blob, `ascii-art.svg`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
