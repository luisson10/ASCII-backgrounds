"use client";

import { useState, useCallback, useRef } from "react";
import { ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { AsciiPreview } from "@/components/ascii-preview";
import { ControlsPanel } from "@/components/controls-panel";
import { ExportDialog } from "@/components/export-dialog";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useAsciiConverter } from "@/hooks/use-ascii-converter";
import { AsciiSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function Home() {
  const {
    image,
    fileName,
    inputRef,
    handleFileChange,
    handleDrop,
    handleDragOver,
    openFilePicker,
    reset,
  } = useImageUpload();

  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);
  const previewRef = useRef<HTMLPreElement>(null);

  const { output, isProcessing } = useAsciiConverter(image, settings);

  const handleSettingsChange = useCallback(
    (partial: Partial<AsciiSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const handleReset = useCallback(() => {
    reset();
    setSettings(DEFAULT_SETTINGS);
  }, [reset]);

  // Idle state — show upload zone
  if (!image) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            ASCII Art Converter
          </h1>
          <p className="text-muted-foreground text-sm">
            Transform any image into stunning ASCII art
          </p>
        </div>
        <UploadZone
          inputRef={inputRef}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFilePicker}
        />
      </div>
    );
  }

  // Editing state — show controls + preview
  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold tracking-tight">
            ASCII Art Converter
          </h1>
          {fileName && (
            <span className="text-xs text-muted-foreground truncate max-w-48">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Processing...
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={openFilePicker} className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <ExportDialog bgColor={settings.bgColor} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <ControlsPanel settings={settings} onChange={handleSettingsChange} />
        {output ? (
          <AsciiPreview
            output={output}
            settings={settings}
            previewRef={previewRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm animate-pulse">
              Generating ASCII art...
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input for replace */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
