"use client";

import { Upload } from "lucide-react";

interface UploadZoneProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
}

export function UploadZone({
  inputRef,
  onFileChange,
  onDrop,
  onDragOver,
  onClick,
}: UploadZoneProps) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-lg mx-auto cursor-pointer"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-200">
        <Upload className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="text-base font-medium text-foreground mb-1">
          Drop a file here
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Images, GIFs, or Videos
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP, GIF, MP4, WEBM
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
