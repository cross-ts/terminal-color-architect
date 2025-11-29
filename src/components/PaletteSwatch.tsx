import { Check, Hash } from 'lucide-react';
import type { PaletteColor } from '../types/palette';

type PaletteSwatchProps = {
  color: PaletteColor;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
};

export const PaletteSwatch = ({ color, onCopy, copied }: PaletteSwatchProps) => {
  const isDark = color.l < 0.5;
  const isCopied = copied === color.name || copied === color.hex;

  return (
    <div className="flex flex-col gap-1 group">
      <button
        onClick={() => onCopy(color.hex, color.hex)}
        className="relative w-full aspect-square rounded-lg shadow-sm border border-white/5 transition-transform hover:scale-105 hover:shadow-lg hover:z-10 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: color.css }}
        title={`${color.name}\n${color.hex}\n${color.css}`}
      >
        <span
          className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}
        >
          {isCopied ? <Check size={16} /> : <Hash size={16} />}
        </span>
      </button>
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] text-neutral-500 font-medium truncate">{color.name}</span>
      </div>
    </div>
  );
};
