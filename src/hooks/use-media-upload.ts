"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MediaType } from "@/types";
import {
  extractVideoFrames,
  extractGifFrames,
} from "@/lib/frame-extractor";

const MAX_IMAGE_DIMENSION = 2000;

function isGif(file: File): boolean {
  return file.type === "image/gif";
}

function isVideo(file: File): boolean {
  return file.type.startsWith("video/");
}

function downscaleImage(img: HTMLImageElement): HTMLImageElement {
  const { naturalWidth: w, naturalHeight: h } = img;
  if (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION) return img;

  const scale = Math.min(MAX_IMAGE_DIMENSION / w, MAX_IMAGE_DIMENSION / h);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const scaled = new Image();
  scaled.src = canvas.toDataURL();
  scaled.width = canvas.width;
  scaled.height = canvas.height;
  return scaled;
}

export function useMediaUpload() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [frames, setFrames] = useState<HTMLCanvasElement[] | null>(null);
  const [fps, setFps] = useState(12);
  const [targetFps, setTargetFps] = useState(12);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [fileName, setFileName] = useState("");
  const [extractionProgress, setExtractionProgress] = useState<number | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  const loadStaticImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(downscaleImage(img));
        setFrames(null);
        setMediaType("image");
        setFileName(file.name);
        originalFileRef.current = null;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const loadAnimation = useCallback(async (file: File, fpsOverride?: number) => {
    setExtractionProgress(0);
    setFileName(file.name);
    originalFileRef.current = file;

    const effectiveFps = fpsOverride ?? targetFps;

    try {
      let result: { frames: HTMLCanvasElement[]; fps: number };
      if (isGif(file)) {
        result = await extractGifFrames(file, setExtractionProgress);
      } else {
        result = await extractVideoFrames(file, setExtractionProgress, effectiveFps);
      }

      if (result.frames.length <= 1 && isGif(file)) {
        // Single frame GIF — treat as static image
        const canvas = result.frames[0];
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setFrames(null);
          setMediaType("image");
          originalFileRef.current = null;
        };
        img.src = canvas.toDataURL();
        return;
      }

      setFrames(result.frames);
      setFps(isGif(file) ? result.fps : effectiveFps);
      setImage(null);
      setMediaType("animation");
    } catch (err) {
      console.error("Failed to extract frames:", err);
    } finally {
      setExtractionProgress(null);
    }
  }, [targetFps]);

  // Re-extract when targetFps changes and we have a video file
  useEffect(() => {
    const file = originalFileRef.current;
    if (!file || !isVideo(file)) return;
    loadAnimation(file, targetFps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFps]);

  const loadFile = useCallback(
    (file: File) => {
      if (isVideo(file) || isGif(file)) {
        loadAnimation(file);
      } else if (file.type.startsWith("image/")) {
        loadStaticImage(file);
      }
    },
    [loadStaticImage, loadAnimation]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setFrames(null);
    setMediaType("image");
    setFileName("");
    setExtractionProgress(null);
    setTargetFps(12);
    originalFileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return {
    image,
    frames,
    fps,
    targetFps,
    setTargetFps,
    mediaType,
    fileName,
    extractionProgress,
    inputRef,
    handleFileChange,
    handleDrop,
    handleDragOver,
    openFilePicker,
    reset,
  };
}
