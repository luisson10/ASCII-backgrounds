import html2canvas from "html2canvas-pro";
import { ExportQuality } from "@/types";
import { EXPORT_PRESETS } from "./constants";

export async function exportAsPng(
  quality: ExportQuality,
  bgColor: string
): Promise<void> {
  const element = document.getElementById("ascii-output");
  if (!element) throw new Error("ASCII output element not found");

  const preset = EXPORT_PRESETS[quality];

  const canvas = await html2canvas(element, {
    backgroundColor: bgColor,
    scale: preset.scale,
    useCORS: true,
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      "image/png"
    );
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ascii-art-${quality}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
