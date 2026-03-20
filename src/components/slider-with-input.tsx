"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderWithInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : (v as number);
}

export function SliderWithInput({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: SliderWithInputProps) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleInputBlur = () => {
    const parsed = Number(inputValue);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    } else {
      setInputValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-12 text-xs text-right bg-muted rounded px-1.5 py-0.5 font-mono border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {suffix && (
            <span className="text-xs text-muted-foreground">{suffix}</span>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(sliderVal(v))}
      />
    </div>
  );
}
