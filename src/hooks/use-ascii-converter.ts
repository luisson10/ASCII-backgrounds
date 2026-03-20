"use client";

import { useState, useEffect, useRef } from "react";
import { AsciiOutput, AsciiSettings } from "@/types";
import { convertToAscii } from "@/lib/ascii-converter";

export function useAsciiConverter(
  image: HTMLImageElement | null,
  settings: AsciiSettings
) {
  const [output, setOutput] = useState<AsciiOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!image) {
      setOutput(null);
      return;
    }

    setIsProcessing(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const result = convertToAscii(image, settings);
        setOutput(result);
        setIsProcessing(false);
      });
    }, 50);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [image, settings]);

  return { output, isProcessing };
}
