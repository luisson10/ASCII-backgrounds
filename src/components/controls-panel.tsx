"use client";

import { AsciiSettings, CharsetKey, ColorMode } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "./color-picker";

interface ControlsPanelProps {
  settings: AsciiSettings;
  onChange: (partial: Partial<AsciiSettings>) => void;
}

function sliderVal(v: number | readonly number[]): number {
  return Array.isArray(v) ? v[0] : (v as number);
}

export function ControlsPanel({ settings, onChange }: ControlsPanelProps) {
  return (
    <aside className="w-80 shrink-0 h-full overflow-y-auto bg-card border-r border-border p-5 flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-1 tracking-wide uppercase">
          Controls
        </h2>
      </div>

      <Separator />

      {/* Resolution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Resolution</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {settings.columns} cols
          </span>
        </div>
        <Slider
          min={40}
          max={300}
          step={1}
          value={[settings.columns]}
          onValueChange={(v) => onChange({ columns: sliderVal(v) })}
        />
      </div>

      <Separator />

      {/* Color Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Color Mode</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {settings.colorMode === "colored" ? "Colored" : "Mono"}
            </span>
            <Switch
              checked={settings.colorMode === "colored"}
              onCheckedChange={(checked) =>
                onChange({
                  colorMode: (checked ? "colored" : "monochrome") as ColorMode,
                })
              }
            />
          </div>
        </div>

        {settings.colorMode === "monochrome" && (
          <ColorPicker
            label="Foreground"
            color={settings.fgColor}
            onChange={(fgColor) => onChange({ fgColor })}
          />
        )}

        <ColorPicker
          label="Background"
          color={settings.bgColor}
          onChange={(bgColor) => onChange({ bgColor })}
        />
      </div>

      <Separator />

      {/* Character Set */}
      <div className="space-y-3">
        <Label className="text-sm">Character Set</Label>
        <Select
          value={settings.charsetKey}
          onValueChange={(v) => onChange({ charsetKey: v as CharsetKey })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="block">Block</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {settings.charsetKey === "custom" && (
          <input
            type="text"
            value={settings.customCharset}
            onChange={(e) => onChange({ customCharset: e.target.value })}
            placeholder="Enter characters (dark to light)"
            className="w-full text-xs bg-muted rounded-md px-3 py-2 font-mono border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
      </div>

      <Separator />

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Font Size</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {settings.fontSize}px
          </span>
        </div>
        <Slider
          min={4}
          max={20}
          step={1}
          value={[settings.fontSize]}
          onValueChange={(v) => onChange({ fontSize: sliderVal(v) })}
        />
      </div>

      <Separator />

      {/* Brightness */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Brightness</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {settings.brightness}
          </span>
        </div>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[settings.brightness]}
          onValueChange={(v) => onChange({ brightness: sliderVal(v) })}
        />
      </div>

      {/* Contrast */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Contrast</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {settings.contrast}
          </span>
        </div>
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[settings.contrast]}
          onValueChange={(v) => onChange({ contrast: sliderVal(v) })}
        />
      </div>

      <Separator />

      {/* Invert */}
      <div className="flex items-center justify-between">
        <Label className="text-sm">Invert</Label>
        <Switch
          checked={settings.invert}
          onCheckedChange={(invert) => onChange({ invert })}
        />
      </div>
    </aside>
  );
}
