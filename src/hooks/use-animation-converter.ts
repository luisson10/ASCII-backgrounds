"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AsciiOutput, AsciiSettings } from "@/types";
import { convertCanvasToAscii } from "@/lib/ascii-converter";

export function useAnimationConverter(
  frames: HTMLCanvasElement[] | null,
  fps: number,
  settings: AsciiSettings
) {
  const [asciiFrames, setAsciiFrames] = useState<AsciiOutput[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isConvertingState, setIsConvertingState] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const convertTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const convertingRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Convert all frames when frames or settings change
  useEffect(() => {
    if (!frames || frames.length === 0) {
      return;
    }

    if (convertTimeoutRef.current) {
      clearTimeout(convertTimeoutRef.current);
    }

    if (convertingRef.current) {
      clearTimeout(convertingRef.current);
    }

    convertingRef.current = setTimeout(() => {
      setIsConvertingState(true);
    }, 0);

    convertTimeoutRef.current = setTimeout(() => {
      const converted = frames.map((frameCanvas) =>
        convertCanvasToAscii(frameCanvas, settings)
      );
      setAsciiFrames(converted);
      setIsConvertingState(false);
      setCurrentFrame(0);
    }, 80);

    return () => {
      if (convertTimeoutRef.current) clearTimeout(convertTimeoutRef.current);
      if (convertingRef.current) clearTimeout(convertingRef.current);
    };
  }, [frames, settings]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying || asciiFrames.length <= 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const interval = 1000 / (fps * playbackSpeed);
    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % asciiFrames.length);
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, asciiFrames.length, fps, playbackSpeed]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const seekTo = useCallback(
    (frame: number) => {
      setCurrentFrame(Math.max(0, Math.min(frame, asciiFrames.length - 1)));
    },
    [asciiFrames.length]
  );

  const resolvedAsciiFrames = frames?.length ? asciiFrames : [];
  const resolvedCurrentFrame =
    resolvedAsciiFrames.length > 0
      ? Math.min(currentFrame, resolvedAsciiFrames.length - 1)
      : 0;

  return {
    asciiFrames: resolvedAsciiFrames,
    currentFrame: resolvedCurrentFrame,
    currentOutput: resolvedAsciiFrames[resolvedCurrentFrame] ?? null,
    isPlaying,
    isConverting: frames?.length ? isConvertingState : false,
    totalFrames: resolvedAsciiFrames.length,
    playbackSpeed,
    setPlaybackSpeed,
    togglePlay,
    seekTo,
  };
}
