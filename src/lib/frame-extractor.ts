const MAX_DIMENSION = 800;
const MAX_FRAMES = 120;

function downscaleCanvas(
  source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  sw: number,
  sh: number
): HTMLCanvasElement {
  let tw = sw;
  let th = sh;

  if (tw > MAX_DIMENSION || th > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / tw, MAX_DIMENSION / th);
    tw = Math.round(tw * scale);
    th = Math.round(th * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, tw, th);
  return canvas;
}

export async function extractVideoFrames(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ frames: HTMLCanvasElement[]; fps: number }> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video"));
  });

  const duration = video.duration;
  const targetFps = 12;
  const totalFrames = Math.min(
    Math.floor(duration * targetFps),
    MAX_FRAMES
  );
  const interval = duration / totalFrames;
  const frames: HTMLCanvasElement[] = [];

  for (let i = 0; i < totalFrames; i++) {
    video.currentTime = i * interval;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    frames.push(
      downscaleCanvas(video, video.videoWidth, video.videoHeight)
    );
    onProgress?.(Math.round(((i + 1) / totalFrames) * 100));
  }

  URL.revokeObjectURL(url);
  return { frames, fps: targetFps };
}

export async function extractGifFrames(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ frames: HTMLCanvasElement[]; fps: number }> {
  // Use the browser to play the GIF and capture frames via an img + canvas approach
  const url = URL.createObjectURL(file);
  const img = document.createElement("img");
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load GIF"));
  });

  // For GIFs, we use a video element approach via createImageBitmap if available,
  // but the simplest cross-browser method is to re-encode as a short video via canvas.
  // Instead, we'll use the GIF as a static image and extract via offscreen rendering.
  // For true GIF frame extraction without external libs, we'll use the ImageDecoder API
  // where available, with a canvas fallback for single-frame treatment.

  if ("ImageDecoder" in window) {
    const response = await fetch(url);
    const decoder = new (window as unknown as {
      ImageDecoder: new (opts: {
        data: ReadableStream;
        type: string;
      }) => ImageDecoderInstance;
    }).ImageDecoder({
      data: response.body!,
      type: "image/gif",
    });

    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack!;
    const frameCount = Math.min(track.frameCount, MAX_FRAMES);
    const frames: HTMLCanvasElement[] = [];

    let totalDuration = 0;
    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      const bitmap = result.image;

      const canvas = downscaleCanvas(
        await createCanvasFromBitmap(bitmap),
        bitmap.displayWidth,
        bitmap.displayHeight
      );
      frames.push(canvas);
      totalDuration += result.image.duration ?? 100000; // microseconds
      bitmap.close();
      onProgress?.(Math.round(((i + 1) / frameCount) * 100));
    }

    const avgDurationMs = totalDuration / frameCount / 1000;
    const fps = Math.round(1000 / avgDurationMs);

    decoder.close();
    URL.revokeObjectURL(url);
    return { frames, fps: Math.max(1, Math.min(30, fps)) };
  }

  // Fallback: treat GIF as single frame
  URL.revokeObjectURL(url);
  const canvas = downscaleCanvas(img, img.naturalWidth, img.naturalHeight);
  onProgress?.(100);
  return { frames: [canvas], fps: 10 };
}

async function createCanvasFromBitmap(
  bitmap: VideoFrame
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.displayWidth;
  canvas.height = bitmap.displayHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0);
  return canvas;
}

interface ImageDecoderInstance {
  tracks: {
    ready: Promise<void>;
    selectedTrack: { frameCount: number } | null;
  };
  decode(opts: {
    frameIndex: number;
  }): Promise<{ image: VideoFrame & { duration?: number } }>;
  close(): void;
}

interface VideoFrame {
  displayWidth: number;
  displayHeight: number;
  duration: number;
  close(): void;
}
