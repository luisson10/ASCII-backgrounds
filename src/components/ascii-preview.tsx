"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsciiOutput, AsciiSettings } from "@/types";

interface AsciiPreviewProps {
  output: AsciiOutput;
  settings: AsciiSettings;
  previewRef: React.RefObject<HTMLPreElement | null>;
}

export const AsciiPreview = React.memo(function AsciiPreview({
  output,
  settings,
  previewRef,
}: AsciiPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomState, setZoomState] = useState<{
    value: number | null;
    columns: number;
    rows: number;
  }>({
    value: null,
    columns: output.columns,
    rows: output.rows,
  });

  // Compute the scale needed to fit the ascii art in the container
  const fitScale = useComputeFitScale(containerRef, previewRef, output, settings);

  const zoom =
    zoomState.columns === output.columns && zoomState.rows === output.rows
      ? zoomState.value
      : null;
  const activeZoom = zoom ?? fitScale;

  const content = useMemo(() => {
    if (settings.colorMode === "monochrome") {
      return (
        <span style={{ color: settings.fgColor }}>
          {output.grid.map((row, i) => (
            <React.Fragment key={i}>
              {row.map((c) => c.char).join("")}
              {"\n"}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Colored mode
    return output.grid.map((row, i) => (
      <React.Fragment key={i}>
        {row.map((c, j) => (
          <span key={j} style={{ color: `rgb(${c.r},${c.g},${c.b})` }}>
            {c.char}
          </span>
        ))}
        {"\n"}
      </React.Fragment>
    ));
  }, [output, settings.colorMode, settings.fgColor]);

  const handleZoomIn = useCallback(() => {
    setZoomState({
      value: Math.min((zoom ?? fitScale) * 1.25, 5),
      columns: output.columns,
      rows: output.rows,
    });
  }, [fitScale, output.columns, output.rows, zoom]);

  const handleZoomOut = useCallback(() => {
    setZoomState({
      value: Math.max((zoom ?? fitScale) * 0.8, 0.05),
      columns: output.columns,
      rows: output.rows,
    });
  }, [fitScale, output.columns, output.rows, zoom]);

  const handleFitToView = useCallback(() => {
    setZoomState({
      value: null,
      columns: output.columns,
      rows: output.rows,
    });
  }, [output.columns, output.rows]);

  // Handle scroll wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const current = zoom ?? fitScale;
        setZoomState({
          value: Math.max(0.05, Math.min(5, current * delta)),
          columns: output.columns,
          rows: output.rows,
        });
      }
    },
    [fitScale, output.columns, output.rows, zoom]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Zoom toolbar */}
      <div className="flex items-center justify-end gap-1 px-4 py-1.5 border-b border-border/50 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomOut}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground font-mono min-w-[3.5rem] text-center">
          {Math.round(activeZoom * 100)}%
        </span>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomIn}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleFitToView}>
          <Maximize className="w-3 h-3" />
          Fit
        </Button>
      </div>

      {/* Preview area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4"
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `scale(${activeZoom})`,
            transformOrigin: "top center",
          }}
        >
          <pre
            ref={previewRef}
            id="ascii-output"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: 1,
              letterSpacing: "0px",
              backgroundColor: settings.bgColor,
              fontFamily: "var(--font-geist-mono), monospace",
            }}
            className="p-6 rounded-xl select-text whitespace-pre"
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
});

/** Computes a scale factor so the <pre> fits within the container. */
function useComputeFitScale(
  containerRef: React.RefObject<HTMLDivElement | null>,
  preRef: React.RefObject<HTMLPreElement | null>,
  output: AsciiOutput,
  settings: AsciiSettings
): number {
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    // Measure at scale(1) to get natural size
    const measure = () => {
      const cw = container.clientWidth - 32; // minus padding
      const ch = container.clientHeight - 32;
      const pw = pre.scrollWidth;
      const ph = pre.scrollHeight;

      if (pw === 0 || ph === 0) return;

      const scale = Math.min(cw / pw, ch / ph, 1); // never upscale beyond 1
      setFitScale(Math.max(0.05, scale));
    };

    // Use rAF to wait for render
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [containerRef, preRef, output, settings.fontSize]);

  return fitScale;
}
