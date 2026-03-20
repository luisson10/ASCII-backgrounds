"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface PlaybackControlsProps {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeek: (frame: number) => void;
  onSpeedChange: (speed: number) => void;
}

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : (v as number);
}

export function PlaybackControls({
  currentFrame,
  totalFrames,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onSeek,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-t border-border bg-card shrink-0">
      {/* Play/Pause */}
      <Button variant="ghost" size="sm" onClick={onTogglePlay} className="h-8 w-8 p-0">
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      {/* Skip back */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSeek(0)}
      >
        <SkipBack className="w-3.5 h-3.5" />
      </Button>

      {/* Frame scrubber */}
      <div className="flex-1">
        <Slider
          min={0}
          max={Math.max(0, totalFrames - 1)}
          step={1}
          value={[currentFrame]}
          onValueChange={(v) => onSeek(sliderVal(v))}
        />
      </div>

      {/* Skip forward */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSeek(totalFrames - 1)}
      >
        <SkipForward className="w-3.5 h-3.5" />
      </Button>

      {/* Frame counter */}
      <span className="text-xs text-muted-foreground font-mono min-w-[5rem] text-center">
        {currentFrame + 1} / {totalFrames}
      </span>

      {/* Speed control */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Speed</span>
        {[0.5, 1, 2].map((speed) => (
          <Button
            key={speed}
            variant={playbackSpeed === speed ? "default" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onSpeedChange(speed)}
          >
            {speed}x
          </Button>
        ))}
      </div>
    </div>
  );
}
