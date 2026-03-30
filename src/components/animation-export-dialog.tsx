"use client";

import { useState } from "react";
import { Download, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AsciiOutput, AsciiSettings } from "@/types";
import { exportAnimationAsVideo, ExportOptions } from "@/lib/animation-export";

interface AnimationExportDialogProps {
  asciiFrames: AsciiOutput[];
  settings: AsciiSettings;
  fps: number;
}

type QualityOption = "standard" | "high" | "ultra" | "lossless";

const QUALITY_OPTIONS: Record<
  QualityOption,
  { options: ExportOptions; label: string; description: string }
> = {
  standard: {
    options: { scale: 1, lossless: false },
    label: "Standard",
    description: "1x · 8 Mbps — Fast export",
  },
  high: {
    options: { scale: 2, lossless: false },
    label: "High",
    description: "2x · 12 Mbps — Sharp and detailed",
  },
  ultra: {
    options: { scale: 4, lossless: false },
    label: "Ultra",
    description: "4x · 30 Mbps — Very sharp",
  },
  lossless: {
    options: { scale: 4, lossless: true },
    label: "Lossless",
    description: "4x · VP9 max bitrate — Pixel-perfect for web",
  },
};

export function AnimationExportDialog({
  asciiFrames,
  settings,
  fps,
}: AnimationExportDialogProps) {
  const [selected, setSelected] = useState<QualityOption>("standard");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    try {
      const opts = QUALITY_OPTIONS[selected].options;
      const blob = await exportAnimationAsVideo(
        asciiFrames,
        settings,
        fps,
        opts,
        setProgress
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ascii-animation-${selected}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error("Animation export failed:", err);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2">
            <Film className="w-4 h-4" />
            Download Video
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            {asciiFrames.length} frames at {fps} fps — exports as WebM video
          </p>
          {(Object.keys(QUALITY_OPTIONS) as QualityOption[]).map((key) => {
            const option = QUALITY_OPTIONS[key];
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                disabled={isExporting}
                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected === key
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                } ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selected === key
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                />
              </button>
            );
          })}

          {/* Progress bar */}
          {isExporting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Rendering frames...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || asciiFrames.length === 0}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
