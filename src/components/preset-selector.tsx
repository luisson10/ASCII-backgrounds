"use client";

import { useState, useEffect } from "react";
import { Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsciiSettings, Preset } from "@/types";
import { loadPresets, savePreset, deletePreset } from "@/lib/presets";

interface PresetSelectorProps {
  currentSettings: AsciiSettings;
  onLoadPreset: (settings: AsciiSettings) => void;
}

export function PresetSelector({
  currentSettings,
  onLoadPreset,
}: PresetSelectorProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const handleSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;

    savePreset(trimmed, currentSettings);
    setPresets(loadPresets());
    setPresetName("");
    setIsSaving(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePreset(id);
    setPresets(loadPresets());
  };

  const handleSelect = (preset: Preset) => {
    onLoadPreset(preset.settings);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setIsSaving(false);
      setPresetName("");
    }
  };

  const builtIn = presets.filter((p) => p.builtIn);
  const custom = presets.filter((p) => !p.builtIn);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Presets
        </span>
        {!isSaving && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={() => setIsSaving(true)}
          >
            <Save className="w-3 h-3" />
            Save
          </Button>
        )}
      </div>

      {/* Save input */}
      {isSaving && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preset name..."
            autoFocus
            className="flex-1 text-xs bg-muted rounded-md px-2.5 py-1.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleSave}
            disabled={!presetName.trim()}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              setIsSaving(false);
              setPresetName("");
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Preset dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-xs hover:bg-accent transition-colors"
        >
          <span className="text-muted-foreground">Select a preset...</span>
          <svg
            className="w-3.5 h-3.5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-64 overflow-y-auto">
              {/* Built-in presets */}
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Built-in
                </span>
              </div>
              {builtIn.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent transition-colors text-left"
                >
                  <span>{preset.name}</span>
                </button>
              ))}

              {/* Custom presets */}
              {custom.length > 0 && (
                <>
                  <div className="border-t border-border my-1" />
                  <div className="px-2 py-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Custom
                    </span>
                  </div>
                  {custom.map((preset) => (
                    <div
                      key={preset.id}
                      className="group flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
                    >
                      <button
                        onClick={() => handleSelect(preset)}
                        className="flex-1 text-xs text-left"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={(e) => handleDelete(preset.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
