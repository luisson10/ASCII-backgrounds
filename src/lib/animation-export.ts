import { AsciiOutput, AsciiSettings } from "@/types";

/**
 * Pre-renders a single ASCII frame to an offscreen canvas.
 * This is the expensive operation (fillText per character).
 */
function renderFrameToCanvas(
  frame: AsciiOutput,
  settings: AsciiSettings,
  charWidth: number,
  rowHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  scale: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  const fontSize = settings.fontSize * scale;
  const padding = 24 * scale;

  // Background
  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Text rendering
  ctx.font = `${fontSize}px "Geist Mono", monospace`;
  ctx.textBaseline = "top";

  for (let row = 0; row < frame.grid.length; row++) {
    for (let col = 0; col < frame.grid[row].length; col++) {
      const c = frame.grid[row][col];
      if (settings.colorMode === "colored" || settings.renderMode === "pixel") {
        ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      } else {
        ctx.fillStyle = settings.fgColor;
      }
      ctx.fillText(c.char, padding + col * charWidth, padding + row * rowHeight);
    }
  }

  return canvas;
}

/**
 * Yields control back to the browser to prevent UI freezes.
 */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export interface ExportOptions {
  scale: number;
  lossless: boolean;
}

export async function exportAnimationAsVideo(
  asciiFrames: AsciiOutput[],
  settings: AsciiSettings,
  fps: number,
  options: ExportOptions = { scale: 1, lossless: false },
  onProgress?: (pct: number) => void
): Promise<Blob> {
  if (asciiFrames.length === 0) {
    throw new Error("No frames to export");
  }

  const { scale, lossless } = options;
  const firstFrame = asciiFrames[0];
  const fontSize = settings.fontSize * scale;

  // Measure character dimensions
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = `${fontSize}px "Geist Mono", monospace`;
  const charWidth = measureCtx.measureText("M").width;
  const rowHeight = fontSize * (settings.lineHeight || 1.0);

  // Canvas dimensions with padding
  const padding = 24 * scale;
  const canvasWidth = Math.ceil(charWidth * firstFrame.columns + padding * 2);
  const canvasHeight = Math.ceil(rowHeight * firstFrame.rows + padding * 2);

  // Phase 1: Pre-render all frames (expensive, but we yield between frames)
  const preRendered: HTMLCanvasElement[] = [];

  for (let i = 0; i < asciiFrames.length; i++) {
    preRendered.push(
      renderFrameToCanvas(
        asciiFrames[i],
        settings,
        charWidth,
        rowHeight,
        canvasWidth,
        canvasHeight,
        scale
      )
    );

    // Yield every 4 frames to keep UI responsive
    if (i % 4 === 0) {
      await yieldToMain();
      onProgress?.(Math.round(((i + 1) / asciiFrames.length) * 50));
    }
  }

  onProgress?.(50);

  // Phase 2: Play back pre-rendered frames into MediaRecorder
  const recordCanvas = document.createElement("canvas");
  recordCanvas.width = canvasWidth;
  recordCanvas.height = canvasHeight;
  const recordCtx = recordCanvas.getContext("2d")!;

  // Pick best codec — prefer VP9 lossless for sharp text content
  const { mimeType, recorderOptions } = getRecorderConfig(scale, lossless);

  const stream = recordCanvas.captureStream(0);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    ...recorderOptions,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("MediaRecorder error"));

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.start();

    const frameInterval = 1000 / fps;
    let frameIndex = 0;

    const drawNext = () => {
      if (frameIndex >= preRendered.length) {
        recorder.stop();
        return;
      }

      // drawImage from pre-rendered canvas is very fast (no fillText)
      recordCtx.drawImage(preRendered[frameIndex], 0, 0);

      // Push frame to stream
      const track = stream.getVideoTracks()[0];
      if (track && "requestFrame" in track) {
        (track as unknown as { requestFrame: () => void }).requestFrame();
      }

      frameIndex++;
      onProgress?.(50 + Math.round((frameIndex / preRendered.length) * 50));

      setTimeout(drawNext, frameInterval);
    };

    drawNext();
  });
}

/**
 * Determines the best MediaRecorder config for the given quality settings.
 * For lossless: uses max bitrate to approximate lossless VP9 encoding.
 * VP9 in browsers doesn't expose a true lossless flag, but a very high
 * bitrate with VP9 on flat-color ASCII content is effectively lossless.
 */
function getRecorderConfig(
  scale: number,
  lossless: boolean
): { mimeType: string; recorderOptions: MediaRecorderOptions } {
  const hasVP9 = MediaRecorder.isTypeSupported("video/webm;codecs=vp9");
  const mimeType = hasVP9 ? "video/webm;codecs=vp9" : "video/webm";

  if (lossless) {
    // Max out bitrate — for ASCII content (flat colors, hard edges, high
    // inter-frame similarity) this produces near-lossless output. The
    // encoder will use far less than the budget on most frames.
    return {
      mimeType,
      recorderOptions: { videoBitsPerSecond: 100_000_000 },
    };
  }

  // Lossy tiers — higher scale needs more bitrate to stay sharp
  const bitrate =
    scale >= 4 ? 30_000_000 : scale >= 3 ? 20_000_000 : scale >= 2 ? 12_000_000 : 8_000_000;

  return {
    mimeType,
    recorderOptions: { videoBitsPerSecond: bitrate },
  };
}
