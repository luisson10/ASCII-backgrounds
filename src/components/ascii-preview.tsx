"use client";

import React, { useMemo } from "react";
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

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-4">
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
  );
});
