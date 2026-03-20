"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Popover>
        <PopoverTrigger
          className="w-8 h-8 rounded-lg border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          style={{ backgroundColor: color }}
        />
        <PopoverContent className="w-auto p-3" side="right" align="center">
          <div className="flex flex-col gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-32 h-32 cursor-pointer border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
              }}
              className="w-full text-xs bg-muted rounded px-2 py-1 text-center font-mono"
              maxLength={7}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
