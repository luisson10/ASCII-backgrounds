"use client";

import { AsciiSettings, CharsetKey, ColorMode, RenderMode } from "@/types";
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
import { SliderWithInput } from "./slider-with-input";
import { PresetSelector } from "./preset-selector";

interface ControlsPanelProps {
  settings: AsciiSettings;
  onChange: (partial: Partial<AsciiSettings>) => void;
}

export function ControlsPanel({ settings, onChange }: ControlsPanelProps) {
  return (
    <aside className="w-80 shrink-0 h-full overflow-y-auto bg-card border-r border-border p-5 flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-1 tracking-wide uppercase">
          Controls
        </h2>
      </div>

      <PresetSelector
        currentSettings={settings}
        onLoadPreset={(presetSettings) => onChange(presetSettings)}
      />

      <Separator />

      <SliderWithInput
        label="Resolution"
        value={settings.columns}
        min={40}
        max={300}
        suffix="cols"
        onChange={(columns) => onChange({ columns })}
      />

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
      {settings.renderMode !== "pixel" && (
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
      )}

      <Separator />

      <SliderWithInput
        label="Font Size"
        value={settings.fontSize}
        min={4}
        max={20}
        suffix="px"
        onChange={(fontSize) => onChange({ fontSize })}
      />

      <Separator />

      <SliderWithInput
        label="Brightness"
        value={settings.brightness}
        min={-100}
        max={100}
        onChange={(brightness) => onChange({ brightness })}
      />

      <SliderWithInput
        label="Contrast"
        value={settings.contrast}
        min={-100}
        max={100}
        onChange={(contrast) => onChange({ contrast })}
      />

      <Separator />

      {/* Invert */}
      <div className="flex items-center justify-between">
        <Label className="text-sm">Invert</Label>
        <Switch
          checked={settings.invert}
          onCheckedChange={(invert) => onChange({ invert })}
        />
      </div>

      <Separator />

      {/* Render Mode */}
      <div className="space-y-3">
        <Label className="text-sm">Render Mode</Label>
        <Select
          value={settings.renderMode}
          onValueChange={(v) => onChange({ renderMode: v as RenderMode })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ascii">ASCII</SelectItem>
            <SelectItem value="pixel">Pixel Art</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SliderWithInput
        label="Char Ratio"
        value={settings.charAspectRatio}
        min={1.0}
        max={3.0}
        step={0.05}
        suffix="×"
        onChange={(charAspectRatio) => onChange({ charAspectRatio })}
      />

      <SliderWithInput
        label="Line Height"
        value={settings.lineHeight}
        min={0.5}
        max={2.0}
        step={0.05}
        suffix="×"
        onChange={(lineHeight) => onChange({ lineHeight })}
      />

      <Separator />

      <SliderWithInput
        label="Gamma"
        value={settings.gamma}
        min={0.1}
        max={3.0}
        step={0.1}
        onChange={(gamma) => onChange({ gamma })}
      />

      <SliderWithInput
        label="Saturation"
        value={settings.saturation}
        min={0.0}
        max={3.0}
        step={0.1}
        onChange={(saturation) => onChange({ saturation })}
      />

      {/* Edge Enhance */}
      <div className="flex items-center justify-between">
        <Label className="text-sm">Edge Enhance</Label>
        <Switch
          checked={settings.edgeEnhance}
          onCheckedChange={(edgeEnhance) => onChange({ edgeEnhance })}
        />
      </div>
    </aside>
  );
}
