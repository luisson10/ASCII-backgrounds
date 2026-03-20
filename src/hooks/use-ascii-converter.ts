"use client";

import { useState, useEffect, useRef } from "react";
import { AsciiOutput, AsciiSettings } from "@/types";
import { convertToAscii } from "@/lib/ascii-converter";

export function useAsciiConverter(
  image: HTMLImageElement | null,
  settings: AsciiSettings
) {
  const [output, setOutput] = useState<AsciiOutput | null>(null);
  const [isProcessingState, setIsProcessingState] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const processingRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!image) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (processingRef.current) {
      clearTimeout(processingRef.current);
    }

    processingRef.current = setTimeout(() => {
      setIsProcessingState(true);
    }, 0);

    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        const result = convertToAscii(image, settings);
        setOutput(result);
        setIsProcessingState(false);
      });
    }, 50);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (processingRef.current) clearTimeout(processingRef.current);
    };
  }, [image, settings]);

  return {
    output: image ? output : null,
    isProcessing: image ? isProcessingState : false,
  };
}
