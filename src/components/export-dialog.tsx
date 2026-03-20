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
import { ExportQuality } from "@/types";
import { EXPORT_PRESETS } from "@/lib/constants";
import { exportAsPng } from "@/lib/export-utils";

interface ExportDialogProps {
  bgColor: string;
}

export function ExportDialog({ bgColor }: ExportDialogProps) {
  const [selected, setSelected] = useState<ExportQuality>("medium");
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAsPng(selected, bgColor);
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
            Download PNG
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export as PNG</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {(Object.keys(EXPORT_PRESETS) as ExportQuality[]).map((key) => {
            const preset = EXPORT_PRESETS[key];
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected === key
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
                    selected === key
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                />
              </button>
            );
          })}
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
