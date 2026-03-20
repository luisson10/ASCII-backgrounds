"use client";

import { useState, useCallback, useRef } from "react";

const MAX_DIMENSION = 2000;

function downscaleImage(img: HTMLImageElement): HTMLImageElement {
  const { naturalWidth: w, naturalHeight: h } = img;
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return img;

  const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
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

export function useImageUpload() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(downscaleImage(img));
        setFileName(file.name);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadImage(file);
    },
    [loadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) loadImage(file);
    },
    [loadImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return {
    image,
    fileName,
    inputRef,
    handleFileChange,
    handleDrop,
    handleDragOver,
    openFilePicker,
    reset,
  };
}
