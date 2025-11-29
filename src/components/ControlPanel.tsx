import { ArrowRight, Palette as PaletteIcon, RefreshCw, Sliders } from 'lucide-react';
import { BRIGHT_STRATEGIES, DIM_STRATEGIES } from '../utils/palette';
import type { PaletteConfig } from '../types/palette';

type ControlPanelProps = {
  config: PaletteConfig;
  hexInput: string;
  hexError: string;
  onHexInputChange: (value: string) => void;
  onApplyHex: () => void;
  onConfigChange: (next: PaletteConfig | ((prev: PaletteConfig) => PaletteConfig)) => void;
  onReset: () => void;
};

export const ControlPanel = ({
  config,
  hexInput,
  hexError,
  onHexInputChange,
  onApplyHex,
  onConfigChange,
  onReset,
}: ControlPanelProps) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
      <Sliders size={18} /> Global Parameters
    </h2>

    <div className="space-y-6">
      <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
        <label className="text-sm text-neutral-300 font-medium mb-2 block flex items-center gap-2">
          <PaletteIcon size={14} className="text-[var(--ui-accent)] transition-colors duration-300" />
          Oshi Color
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="#3b82f6"
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm font-mono focus:border-[var(--ui-accent)] focus:outline-none transition-colors duration-300"
            value={hexInput}
            onChange={(e) => onHexInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApplyHex()}
          />
          <button
            onClick={onApplyHex}
            className="px-3 py-2 bg-[var(--ui-accent)] hover:brightness-110 rounded text-white transition-all duration-300"
          >
            <ArrowRight size={16} />
          </button>
        </div>
        {hexError && <p className="text-red-400 text-xs mt-2">{hexError}</p>}
      </div>

      <div className="border-t border-neutral-800 my-2"></div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Bright Color Strategy</label>
        <div className="grid grid-cols-3 gap-2">
          {BRIGHT_STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => onConfigChange({ ...config, brightStrategy: strategy.id })}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                config.brightStrategy === strategy.id
                  ? 'bg-[var(--ui-accent)] border-[var(--ui-accent)] text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <strategy.icon size={16} className="mb-1" />
              <span className="text-[10px] font-medium">{strategy.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2 min-h-[1.5em]">
          {BRIGHT_STRATEGIES.find((s) => s.id === config.brightStrategy)?.desc}
        </p>
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Dim Color Strategy</label>
        <div className="grid grid-cols-3 gap-2">
          {DIM_STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => onConfigChange({ ...config, dimStrategy: strategy.id })}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                config.dimStrategy === strategy.id
                  ? 'bg-neutral-700 border-neutral-500 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <strategy.icon size={16} className="mb-1" />
              <span className="text-[10px] font-medium">{strategy.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2 min-h-[1.5em]">
          {DIM_STRATEGIES.find((s) => s.id === config.dimStrategy)?.desc}
        </p>
      </div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <label className="text-neutral-400">Vibrancy (Chroma)</label>
          <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.chromaScale.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.3"
          step="0.005"
          value={config.chromaScale}
          onChange={(e) => onConfigChange({ ...config, chromaScale: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <label className="text-neutral-400">Brightness (Lightness)</label>
          <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.lightnessScale.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="0.9"
          step="0.01"
          value={config.lightnessScale}
          onChange={(e) => onConfigChange({ ...config, lightnessScale: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <label className="text-neutral-400">Hue Shift (Rotation)</label>
          <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.hueShift > 0 ? `+${config.hueShift}` : config.hueShift}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="5"
          value={config.hueShift}
          onChange={(e) => onConfigChange({ ...config, hueShift: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
        />
      </div>

      <div className="border-t border-neutral-800 my-4 pt-4"></div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <label className="text-neutral-400">Background Depth</label>
          <span className="font-mono text-neutral-400">{config.bgLightness.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.3"
          step="0.01"
          value={config.bgLightness}
          onChange={(e) => onConfigChange({ ...config, bgLightness: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <label className="text-neutral-400">Foreground Brightness</label>
          <span className="font-mono text-neutral-400">{config.fgLightness.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.7"
          max="0.99"
          step="0.01"
          value={config.fgLightness}
          onChange={(e) => onConfigChange({ ...config, fgLightness: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
        />
      </div>
    </div>

    <button
      onClick={onReset}
      className="mt-6 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
    >
      <RefreshCw size={12} /> Reset to Default
    </button>
  </div>
);
