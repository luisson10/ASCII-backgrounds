"use client";

import { useState, useCallback, useRef } from "react";
import { ImageIcon, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { AsciiPreview } from "@/components/ascii-preview";
import { ControlsPanel } from "@/components/controls-panel";
import { ExportDialog } from "@/components/export-dialog";
import { AnimationExportDialog } from "@/components/animation-export-dialog";
import { PlaybackControls } from "@/components/playback-controls";
import { useMediaUpload } from "@/hooks/use-media-upload";
import { useAsciiConverter } from "@/hooks/use-ascii-converter";
import { useAnimationConverter } from "@/hooks/use-animation-converter";
import { AsciiSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function Home() {
  const {
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
  } = useMediaUpload();

  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);
  const previewRef = useRef<HTMLPreElement>(null);

  const { output: staticOutput, isProcessing: isStaticProcessing } =
    useAsciiConverter(mediaType === "image" ? image : null, settings);

  const {
    asciiFrames,
    currentOutput: animOutput,
    currentFrame,
    totalFrames,
    isPlaying,
    isConverting: isAnimConverting,
    playbackSpeed,
    setPlaybackSpeed,
    togglePlay,
    seekTo,
  } = useAnimationConverter(
    mediaType === "animation" ? frames : null,
    fps,
    settings
  );

  const output = mediaType === "animation" ? animOutput : staticOutput;
  const isProcessing =
    mediaType === "animation" ? isAnimConverting : isStaticProcessing;

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

  const hasMedia = image || frames;

  // Idle state — show upload zone
  if (!hasMedia && extractionProgress === null) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            ASCII Art Converter
          </h1>
          <p className="text-muted-foreground text-sm">
            Transform any image, GIF, or video into ASCII art
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

  // Extracting frames state
  if (extractionProgress !== null) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Extracting frames... {extractionProgress}%
        </p>
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200 rounded-full"
            style={{ width: `${extractionProgress}%` }}
          />
        </div>
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
          {mediaType === "animation" && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              Animation
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Processing...
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={openFilePicker}
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Replace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          {mediaType === "image" ? (
            <ExportDialog bgColor={settings.bgColor} />
          ) : mediaType === "animation" && asciiFrames.length > 0 ? (
            <AnimationExportDialog
              asciiFrames={asciiFrames}
              settings={settings}
              fps={targetFps}
            />
          ) : null}
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

      {/* Playback controls for animations */}
      {mediaType === "animation" && totalFrames > 0 && (
        <PlaybackControls
          currentFrame={currentFrame}
          totalFrames={totalFrames}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentFps={targetFps}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
          onSpeedChange={setPlaybackSpeed}
          onFpsChange={setTargetFps}
        />
      )}

      {/* Hidden file input for replace */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
