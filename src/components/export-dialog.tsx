"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AsciiOutput, AsciiSettings, ExportQuality } from "@/types";
import { EXPORT_PRESETS } from "@/lib/constants";
import { exportAsPng, exportAsSvg } from "@/lib/export-utils";

type ExportFormat = "png" | "svg";

interface ExportDialogProps {
  output: AsciiOutput;
  settings: AsciiSettings;
}

export function ExportDialog({ output, settings }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState<ExportQuality>("medium");
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "png") {
        await exportAsPng(output, settings, quality);
      } else {
        await exportAsSvg(output, settings);
      }
      setOpen(false);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format selector */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Format
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["png", "svg"] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    format === f
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="font-medium uppercase">{f}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {f === "png" ? "Raster image" : "Vector, scales perfectly"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality selector — PNG only */}
          {format === "png" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quality
              </p>
              <div className="space-y-2">
                {(Object.keys(EXPORT_PRESETS) as ExportQuality[]).map((key) => {
                  const preset = EXPORT_PRESETS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setQuality(key)}
                      className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors ${
                        quality === key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          quality === key
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
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
