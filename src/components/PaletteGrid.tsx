import type { Palette, PaletteConfig } from '../types/palette';
import { PaletteSwatch } from './PaletteSwatch';

type PaletteGridProps = {
  palette: Palette;
  config: PaletteConfig;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
};

export const PaletteGrid = ({ palette, config, copied, onCopy }: PaletteGridProps) => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
    <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider">Palette Map</h3>

    <div className="mb-2 text-xs text-neutral-500">Normal (ANSI 0-7)</div>
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
      {Object.values(palette.normal).map((color, idx) => (
        <PaletteSwatch key={`${color.name}-${idx}`} color={color} onCopy={onCopy} copied={copied} />
      ))}
    </div>

    <div className="flex items-center justify-between mb-2">
      <div className="text-xs text-neutral-500">Bright (ANSI 8-15)</div>
      <div className="text-[10px] opacity-70 uppercase tracking-widest text-[var(--ui-accent)] transition-colors duration-300">{config.brightStrategy} Mode</div>
    </div>
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
      {Object.values(palette.bright).map((color, idx) => (
        <PaletteSwatch key={`${color.name}-${idx}`} color={color} onCopy={onCopy} copied={copied} />
      ))}
    </div>

    <div className="flex items-center justify-between mb-2">
      <div className="text-xs text-neutral-500">Dim (Optional)</div>
      <div className="text-[10px] text-neutral-400 opacity-70 uppercase tracking-widest">{config.dimStrategy} Mode</div>
    </div>
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {Object.values(palette.dim).map((color, idx) => (
        <PaletteSwatch key={`${color.name}-${idx}`} color={color} onCopy={onCopy} copied={copied} />
      ))}
    </div>

    <div className="mt-6 grid grid-cols-2 gap-4">
      <div
        className="p-3 rounded-lg border border-neutral-700 flex justify-between items-center group cursor-pointer hover:border-neutral-500 transition-colors"
        style={{ backgroundColor: palette.background.css }}
        onClick={() => onCopy(palette.background.hex, palette.background.name)}
      >
        <span className="text-xs font-mono text-neutral-500">BG</span>
        <span className="font-mono text-xs text-neutral-400 group-hover:text-white">{palette.background.hex}</span>
      </div>
      <div
        className="p-3 rounded-lg border border-neutral-700 flex justify-between items-center group cursor-pointer hover:border-neutral-500 transition-colors"
        style={{ backgroundColor: palette.foreground.css }}
        onClick={() => onCopy(palette.foreground.hex, palette.foreground.name)}
      >
        <span className="text-xs font-mono text-neutral-500 mix-blend-difference">FG</span>
        <span className="font-mono text-xs text-neutral-600 mix-blend-difference group-hover:text-black">{palette.foreground.hex}</span>
      </div>
    </div>
  </div>
);
