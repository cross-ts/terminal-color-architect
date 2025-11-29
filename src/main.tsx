import { StrictMode, useMemo, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import type { LucideIcon } from 'lucide-react';
import { RefreshCw, Terminal, Sliders, Moon, Check, Hash, Palette, ArrowRight, Zap, Cloud, Shield, EyeOff, Ghost, Slack, Code } from 'lucide-react';
import './index.css';

type BrightStrategy = 'vibrant' | 'pastel' | 'traditional';
type DimStrategy = 'subtle' | 'muted' | 'deep';

type PaletteConfig = {
  bgLightness: number;
  fgLightness: number;
  chromaScale: number;
  lightnessScale: number;
  hueShift: number;
  brightStrategy: BrightStrategy;
  dimStrategy: DimStrategy;
};

type PaletteColor = {
  name: string;
  l: number;
  c: number;
  h: number;
  css: string;
  hex: string;
};

type Palette = {
  normal: Record<string, PaletteColor>;
  bright: Record<string, PaletteColor>;
  dim: Record<string, PaletteColor>;
  background: PaletteColor;
  foreground: PaletteColor;
  badgeBlack: PaletteColor;
};

type Strategy<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  desc: string;
};

type OklchValues = {
  l: number;
  c: number;
  h: number;
};

type PaletteSwatchProps = {
  color: PaletteColor;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
};

// --- Color Utility Functions ---

// Helper to constrain values
const clamp = (val: number, min: number, max: number): number => Math.min(Math.max(val, min), max);

// OKLCH to Hex converter (Approximation for standard sRGB)
const oklchToHex = (l: number, c: number, h: number): string => {
  const a_ = c * Math.cos((h * Math.PI) / 180);
  const b_ = c * Math.sin((h * Math.PI) / 180);

  // OKLCH to Linear sRGB (via OKLab)
  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147010 * s_3;

  // Gamma correction
  const processChannel = (value: number): number => {
    const adjusted = value > 0.0031308 ? 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055 : 12.92 * value;
    return Math.round(clamp(adjusted, 0, 1) * 255);
  };

  const rHex = processChannel(r).toString(16).padStart(2, '0');
  const gHex = processChannel(g).toString(16).padStart(2, '0');
  const bHex = processChannel(b).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
};

// Hex to OKLCH converter
const hexToOklch = (hex: string): OklchValues => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse Hex to RGB [0-255]
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // sRGB to Linear RGB
  const toLinear = (c: number) => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  r = toLinear(r);
  g = toLinear(g);
  b = toLinear(b);

  // Linear RGB to LMS
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // LMS to OKLab
  const l_3 = Math.cbrt(l_);
  const m_3 = Math.cbrt(m_);
  const s_3 = Math.cbrt(s_);

  const L = 0.2104542553 * l_3 + 0.7936177850 * m_3 - 0.0040720468 * s_3;
  const a = 1.9779984951 * l_3 - 2.4285922050 * m_3 + 0.4505937099 * s_3;
  const bb = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.8086757660 * s_3;

  // OKLab to OKLCH
  const C = Math.sqrt(a * a + bb * bb);
  let h = Math.atan2(bb, a) * 180 / Math.PI;
  if (h < 0) h += 360;

  return { l: L, c: C, h: h };
};

// --- Types & Constants ---

const BASE_HUES = {
  red: 25,
  yellow: 95,
  green: 142,
  cyan: 195,
  blue: 264,
  magenta: 320,
} as const;

type BaseHueKey = keyof typeof BASE_HUES;

const DEFAULT_CONFIG: PaletteConfig = {
  bgLightness: 0.18, // Very dark gray
  fgLightness: 0.90, // Off-white (Boosted for better contrast against colors)
  chromaScale: 0.12, // Standard vibrancy
  lightnessScale: 0.55, // Lowered significantly to ensure Normal colors act well as backgrounds for White text
  hueShift: 0, // Global hue rotation
  brightStrategy: 'vibrant', // 'vibrant' | 'pastel' | 'traditional'
  dimStrategy: 'subtle', // 'subtle' | 'muted' | 'deep'
};

const BRIGHT_STRATEGIES: Strategy<BrightStrategy>[] = [
  { id: 'vibrant', label: 'Vibrant', icon: Zap, desc: 'Rich & Deep Pop (No Washout)' },
  { id: 'pastel', label: 'Pastel', icon: Cloud, desc: 'High Lightness, Low Chroma' },
  { id: 'traditional', label: 'Classic', icon: Shield, desc: 'Simple Lightness Boost' },
];

const DIM_STRATEGIES: Strategy<DimStrategy>[] = [
  { id: 'subtle', label: 'Subtle', icon: EyeOff, desc: 'Slightly Darker & Desaturated' },
  { id: 'muted', label: 'Muted', icon: Cloud, desc: 'Low Chroma (Grayish)' },
  { id: 'deep', label: 'Deep', icon: Moon, desc: 'Significantly Darker' },
];

// --- Components ---

export default function TerminalPaletteGenerator() {
  const computeHexInput = (state: PaletteConfig, baseHue: number) => {
    let h = (baseHue + state.hueShift) % 360;
    if (h < 0) h += 360;

    return oklchToHex(state.lightnessScale, state.chromaScale, h);
  };

  const [activeBaseHue, setActiveBaseHue] = useState<number>(BASE_HUES.blue);
  const [config, setConfig] = useState<PaletteConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState<string>(() => computeHexInput(DEFAULT_CONFIG, BASE_HUES.blue));
  const [hexError, setHexError] = useState<string>('');
  // Track which base hue corresponds to the current hex input/calculation
  // Default to Blue to match the initial placeholder example

  const updateConfig = (next: PaletteConfig | ((prev: PaletteConfig) => PaletteConfig), baseHue = activeBaseHue) => {
    setConfig((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      setHexInput(computeHexInput(resolved, baseHue));
      return resolved;
    });
  };

  // Generate the palette based on config
  const palette = useMemo<Palette>(() => {
    const { bgLightness, fgLightness, chromaScale, lightnessScale, hueShift, brightStrategy, dimStrategy } = config;

    // Helper to build color object
    const makeColor = (name: string, baseHue: number, l: number, c: number, isGrayscale = false): PaletteColor => {
      const h = (baseHue + hueShift) % 360;
      const finalC = isGrayscale ? 0.01 : c;
      // Safety clamp for L to prevent going out of range
      const safeL = clamp(l, 0.01, 0.99); // Ensure not completely black/white
      const css = `oklch(${safeL} ${finalC} ${h})`;
      const hex = oklchToHex(safeL, finalC, h);
      return { name, l: safeL, c: finalC, h, css, hex };
    };

    // ANSI Colors (Normal)
    // Adjusted: Normal colors are now slightly darker to support White text when used as background
    const normal = {
      black: makeColor('Black', 0, bgLightness + 0.1, 0.02, true),
      red: makeColor('Red', BASE_HUES.red, lightnessScale, chromaScale),
      green: makeColor('Green', BASE_HUES.green, lightnessScale, chromaScale),
      yellow: makeColor('Yellow', BASE_HUES.yellow, lightnessScale, chromaScale),
      blue: makeColor('Blue', BASE_HUES.blue, lightnessScale, chromaScale),
      magenta: makeColor('Magenta', BASE_HUES.magenta, lightnessScale, chromaScale),
      cyan: makeColor('Cyan', BASE_HUES.cyan, lightnessScale, chromaScale),
      white: makeColor('White', 0, fgLightness - 0.1, 0.02, true),
    };

    // ANSI Colors (Bright) Strategy Logic
    let brightL, brightC;

    switch (brightStrategy) {
      case 'pastel':
        // Pastel: Significantly lighter, but reduced chroma for softness/readability
        brightL = Math.min(lightnessScale + 0.25, 0.98);
        brightC = chromaScale * 0.75;
        break;

      case 'traditional':
        // Traditional: Slight lightness boost, same chroma. Conservative.
        brightL = Math.min(lightnessScale + 0.1, 0.98);
        brightC = chromaScale;
        break;

      case 'vibrant':
      default:
        // Vibrant: High Visibility (Modified for "Pop" without washout)
        // Lightness: Minimal boost (+0.04) to prevent it from becoming "white"
        // Chroma: Significant boost (* 1.6) to provide intensity and "glow"
        // Cap Lightness at 0.90 to ensure it retains color info
        brightL = Math.min(lightnessScale + 0.04, 0.90);
        brightC = Math.min(chromaScale * 1.6, 0.45);
        break;
    }

    const bright = {
      black: makeColor('BrBlack', 0, bgLightness + 0.25, 0.02, true), // Gray
      red: makeColor('BrRed', BASE_HUES.red, brightL, brightC),
      green: makeColor('BrGreen', BASE_HUES.green, brightL, brightC),
      yellow: makeColor('BrYellow', BASE_HUES.yellow, brightL, brightC),
      blue: makeColor('BrBlue', BASE_HUES.blue, brightL, brightC),
      magenta: makeColor('BrMagenta', BASE_HUES.magenta, brightL, brightC),
      cyan: makeColor('BrCyan', BASE_HUES.cyan, brightL, brightC),
      white: makeColor('BrWhite', 0, fgLightness, 0.01, true), // Bright White is now the full Foreground brightness
    };

    // ANSI Colors (Dim) Strategy Logic
    let dimL, dimC;

    switch (dimStrategy) {
      case 'muted':
        // Muted: Slightly darker, significant chroma reduction (Grayish)
        dimL = Math.max(lightnessScale - 0.05, bgLightness + 0.05);
        dimC = chromaScale * 0.5;
        break;

      case 'deep':
        // Deep: Significantly darker, keep some chroma
        dimL = Math.max(lightnessScale - 0.20, bgLightness + 0.02);
        dimC = chromaScale * 0.9;
        break;

      case 'subtle':
      default:
        // Subtle: Moderate darkening and desaturation
        dimL = Math.max(lightnessScale - 0.15, bgLightness + 0.05);
        dimC = chromaScale * 0.8;
        break;
    }

    const dim = {
      black: makeColor('DimBlack', 0, bgLightness + 0.05, 0.01, true), // Very dark gray
      red: makeColor('DimRed', BASE_HUES.red, dimL, dimC),
      green: makeColor('DimGreen', BASE_HUES.green, dimL, dimC),
      yellow: makeColor('DimYellow', BASE_HUES.yellow, dimL, dimC),
      blue: makeColor('DimBlue', BASE_HUES.blue, dimL, dimC),
      magenta: makeColor('DimMagenta', BASE_HUES.magenta, dimL, dimC),
      cyan: makeColor('DimCyan', BASE_HUES.cyan, dimL, dimC),
      white: makeColor('DimWhite', 0, fgLightness - 0.3, 0.01, true),
    };

    const background = makeColor('Background', 0, bgLightness, 0.01, true);
    // Foreground should be very bright to contrast against Normal colors
    const foreground = makeColor('Foreground', 0, fgLightness, 0.01, true);

    // Extra utility colors for badges
    const badgeBlack = makeColor('BadgeBlack', 0, 0.2, 0.01, true); // Hard black for yellow backgrounds

    return { normal, bright, dim, background, foreground, badgeBlack };
  }, [config]);

  // Calculate Accent Color for UI
  const accentColor = useMemo<string>(() => {
    // Find the key in BASE_HUES that matches activeBaseHue
    const hueEntry = (Object.entries(BASE_HUES) as Array<[BaseHueKey, number]>).find(([, val]) => val === activeBaseHue);
    const key: BaseHueKey = hueEntry ? hueEntry[0] : 'blue';

    // Use the Bright variant for the UI accent to ensure visibility on dark backgrounds
    // Fallback to blue if something goes wrong
    return palette.bright[key]?.hex || palette.bright.blue.hex;
  }, [palette, activeBaseHue]);

  const handleCopy = (text: string, key: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      if (document.execCommand('copy')) {
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      }
    } catch (err) {
      console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const copyAllJSON = () => {
    const output = {
      background: palette.background.hex,
      foreground: palette.foreground.hex,
      colors: {
        normal: Object.fromEntries(Object.values(palette.normal).map(c => [c.name.toLowerCase(), c.hex])),
        bright: Object.fromEntries(Object.values(palette.bright).map(c => [c.name.toLowerCase(), c.hex])),
        dim: Object.fromEntries(Object.values(palette.dim).map(c => [c.name.toLowerCase(), c.hex])),
      }
    };
    handleCopy(JSON.stringify(output, null, 2), 'json');
  };

  const copyAllAlacritty = () => {
    const output = `[colors.primary]
background = "${palette.background.hex}"
foreground = "${palette.foreground.hex}"
dim_foreground = "${palette.dim.white.hex}"

[colors.normal]
black = "${palette.normal.black.hex}"
red = "${palette.normal.red.hex}"
green = "${palette.normal.green.hex}"
yellow = "${palette.normal.yellow.hex}"
blue = "${palette.normal.blue.hex}"
magenta = "${palette.normal.magenta.hex}"
cyan = "${palette.normal.cyan.hex}"
white = "${palette.normal.white.hex}"

[colors.bright]
black = "${palette.bright.black.hex}"
red = "${palette.bright.red.hex}"
green = "${palette.bright.green.hex}"
yellow = "${palette.bright.yellow.hex}"
blue = "${palette.bright.blue.hex}"
magenta = "${palette.bright.magenta.hex}"
cyan = "${palette.bright.cyan.hex}"
white = "${palette.bright.white.hex}"

[colors.dim]
black = "${palette.dim.black.hex}"
red = "${palette.dim.red.hex}"
green = "${palette.dim.green.hex}"
yellow = "${palette.dim.yellow.hex}"
blue = "${palette.dim.blue.hex}"
magenta = "${palette.dim.magenta.hex}"
cyan = "${palette.dim.cyan.hex}"
white = "${palette.dim.white.hex}"`;

    handleCopy(output, 'alacritty');
  };

  const copyAllGhostty = () => {
    let output = `background = ${palette.background.hex}\nforeground = ${palette.foreground.hex}\n`;

    // Map colors to ghostty palette indices (0-15)
    // 0-7: Normal
    // 8-15: Bright
    const colors = [
      palette.normal.black, palette.normal.red, palette.normal.green, palette.normal.yellow,
      palette.normal.blue, palette.normal.magenta, palette.normal.cyan, palette.normal.white,
      palette.bright.black, palette.bright.red, palette.bright.green, palette.bright.yellow,
      palette.bright.blue, palette.bright.magenta, palette.bright.cyan, palette.bright.white
    ];

    colors.forEach((c, i) => {
      output += `palette = ${i}=${c.hex}\n`;
    });

    handleCopy(output, 'ghostty');
  };

  const copyAllSlack = () => {
    // Slack Theme: Column BG, Menu BG Hover, Active Item, Active Item Text, Hover Item, Text Color, Active Presence, Mention Badge
    const output = [
      palette.background.hex,     // Column BG
      palette.dim.black.hex,      // Menu BG Hover
      palette.normal.blue.hex,    // Active Item
      '#FFFFFF',                  // Active Item Text (Fixed white for best contrast on accent blue)
      palette.normal.black.hex,   // Hover Item
      palette.foreground.hex,     // Text Color
      palette.normal.green.hex,   // Active Presence
      palette.normal.red.hex      // Mention Badge
    ].join(',');

    handleCopy(output, 'slack');
  };

  const applyHexColor = () => {
    if (!hexInput.match(/^#?([0-9A-F]{3}){1,2}$/i)) {
      setHexError('Invalid Hex Code');
      return;
    }
    setHexError('');

    const { l, c, h } = hexToOklch(hexInput);

    // Find closest base hue
    let minDiff = 360;
    let closestBase = 0;

    Object.values(BASE_HUES).forEach(baseH => {
      let diff = Math.abs(h - baseH);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closestBase = baseH;
      }
    });

    // Update active base hue so subsequent slider changes track correctly
    let newShift = h - closestBase;
    while (newShift > 180) newShift -= 360;
    while (newShift < -180) newShift += 360;

    updateConfig(prev => ({
      ...prev,
      hueShift: Math.round(newShift),
      lightnessScale: clamp(l, 0.3, 0.95),
      chromaScale: clamp(c, 0.01, 0.3),
    }), closestBase);

    setActiveBaseHue(closestBase);
  };

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-neutral-700 p-4 md:p-8"
      style={{ '--ui-accent': accentColor } as CSSProperties}
    >
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
            <span className="p-2 rounded-lg bg-[var(--ui-accent)] text-white transition-colors duration-300">
              <Terminal size={24} />
            </span>
            Oshi Color Terminal Architect
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">
            OKLCH色空間を使用した知覚的に均一なターミナル配色の作成ツール
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={copyAllJSON}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'json' ? <Check size={16} className="text-green-400"/> : <Code size={16} />}
            JSON
          </button>
          <button
            onClick={copyAllGhostty}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'ghostty' ? <Check size={16} className="text-green-400"/> : <Ghost size={16} />}
            Ghostty
          </button>
          <button
            onClick={copyAllAlacritty}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'alacritty' ? <Check size={16} className="text-green-400"/> : <Terminal size={16} />}
            Alacritty
          </button>
          <button
            onClick={copyAllSlack}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'slack' ? <Check size={16} className="text-green-400"/> : <Slack size={16} />}
            Slack
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sliders size={18} /> Global Parameters
            </h2>

            <div className="space-y-6">

              {/* Hex Input */}
              <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-800">
                <label className="text-sm text-neutral-300 font-medium mb-2 block flex items-center gap-2">
                  <Palette size={14} className="text-[var(--ui-accent)] transition-colors duration-300"/>
                  Oshi Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="#3b82f6"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm font-mono focus:border-[var(--ui-accent)] focus:outline-none transition-colors duration-300"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyHexColor()}
                  />
                  <button
                    onClick={applyHexColor}
                    className="px-3 py-2 bg-[var(--ui-accent)] hover:brightness-110 rounded text-white transition-all duration-300"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                {hexError && <p className="text-red-400 text-xs mt-2">{hexError}</p>}
              </div>

              <div className="border-t border-neutral-800 my-2"></div>

              {/* Bright Strategy */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Bright Color Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                  {BRIGHT_STRATEGIES.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => updateConfig({...config, brightStrategy: strategy.id})}
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
                  {BRIGHT_STRATEGIES.find(s => s.id === config.brightStrategy)?.desc}
                </p>
              </div>

              {/* Dim Strategy */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Dim Color Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIM_STRATEGIES.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => updateConfig({...config, dimStrategy: strategy.id})}
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
                  {DIM_STRATEGIES.find(s => s.id === config.dimStrategy)?.desc}
                </p>
              </div>

              {/* Chroma Control */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <label className="text-neutral-400">Vibrancy (Chroma)</label>
                  <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.chromaScale.toFixed(3)}</span>
                </div>
                <input
                  type="range" min="0.01" max="0.3" step="0.005"
                  value={config.chromaScale}
                  onChange={(e) => updateConfig({...config, chromaScale: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
                />
              </div>

              {/* Lightness Control */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <label className="text-neutral-400">Brightness (Lightness)</label>
                  <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.lightnessScale.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.3" max="0.9" step="0.01"
                  value={config.lightnessScale}
                  onChange={(e) => updateConfig({...config, lightnessScale: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
                />
              </div>

              {/* Hue Shift */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <label className="text-neutral-400">Hue Shift (Rotation)</label>
                  <span className="font-mono text-[var(--ui-accent)] transition-colors duration-300">{config.hueShift > 0 ? `+${config.hueShift}` : config.hueShift}°</span>
                </div>
                <input
                  type="range" min="-180" max="180" step="5"
                  value={config.hueShift}
                  onChange={(e) => updateConfig({...config, hueShift: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--ui-accent)]"
                />
              </div>

              <div className="border-t border-neutral-800 my-4 pt-4"></div>

              {/* Background Lightness */}
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <label className="text-neutral-400">Background Depth</label>
                  <span className="font-mono text-neutral-400">{config.bgLightness.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.10" max="0.30" step="0.01"
                  value={config.bgLightness}
                  onChange={(e) => updateConfig({...config, bgLightness: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
                />
              </div>

               {/* Foreground Lightness */}
               <div>
                <div className="flex justify-between mb-2 text-sm">
                  <label className="text-neutral-400">Foreground Brightness</label>
                  <span className="font-mono text-neutral-400">{config.fgLightness.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.70" max="0.99" step="0.01"
                  value={config.fgLightness}
                  onChange={(e) => updateConfig({...config, fgLightness: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
                />
              </div>

            </div>

            <button
              onClick={() => {
                updateConfig(DEFAULT_CONFIG, BASE_HUES.blue);
                setActiveBaseHue(BASE_HUES.blue);
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              <RefreshCw size={12} /> Reset to Default
            </button>
          </div>
        </div>

        {/* Right Column: Preview & Palette */}
        <div className="lg:col-span-8 space-y-8">

          {/* Terminal Preview */}
          <div
            className="rounded-xl overflow-hidden shadow-2xl border border-neutral-800 font-mono text-sm md:text-base relative"
            style={{ backgroundColor: palette.background.css, color: palette.foreground.css }}
          >
            {/* Title Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="ml-4 text-xs opacity-50 flex-1 text-center">user@oklch-term:~</div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 space-y-6 overflow-x-auto">

              {/* Section 0: Status Badges & Background Context (NEW) */}
              <div className="space-y-1">
                 <div className="text-xs opacity-50 mb-2 uppercase tracking-wider">Status Badges & Backgrounds</div>
                 <div className="flex flex-wrap gap-4 items-center">
                    {/* Error Badge: Red BG, White FG */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.red.css, color: palette.bright.white.css }}> ERROR </span>
                      <span className="text-xs">Connection failed</span>
                    </div>

                     {/* Warning Badge: Yellow BG, Black FG (Usually) */}
                     <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.yellow.css, color: palette.badgeBlack.css }}> WARN </span>
                      <span className="text-xs">Disk usage high</span>
                    </div>

                     {/* Info Badge: Blue BG, White FG */}
                     <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.blue.css, color: palette.bright.white.css }}> INFO </span>
                      <span className="text-xs">Update available</span>
                    </div>

                    {/* Success Badge: Green BG, White/Black FG */}
                     <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: palette.normal.green.css, color: palette.badgeBlack.css }}> PASS </span>
                      <span className="text-xs">All tests passed</span>
                    </div>
                 </div>
                 {/* Diff View Simulation */}
                 <div className="mt-3 font-mono text-xs border border-white/5 rounded p-2">
                    <div className="flex">
                      <span style={{ color: palette.dim.white.css, width: '20px' }}>1</span>
                      <span> function calculateTotal(a, b) {`{`}</span>
                    </div>
                    <div className="flex" style={{ backgroundColor: `color-mix(in srgb, ${palette.normal.red.css} 20%, transparent)` }}>
                      <span style={{ color: palette.dim.white.css, width: '20px' }}>2</span>
                      <span style={{ color: palette.bright.red.css }}>-   return a + b;</span>
                    </div>
                    <div className="flex" style={{ backgroundColor: `color-mix(in srgb, ${palette.normal.green.css} 20%, transparent)` }}>
                      <span style={{ color: palette.dim.white.css, width: '20px' }}>2</span>
                      <span style={{ color: palette.bright.green.css }}>+   return (a + b) * 100;</span>
                    </div>
                    <div className="flex">
                      <span style={{ color: palette.dim.white.css, width: '20px' }}>3</span>
                      <span> {`}`}</span>
                    </div>
                 </div>
              </div>

              {/* Section 1: Command Prompt & LS */}
              <div className="space-y-1 border-t border-white/5 pt-4">
                <div className="flex flex-wrap gap-2">
                  <span style={{ color: palette.normal.blue.css }}>➜</span>
                  <span style={{ color: palette.normal.cyan.css }}>~/projects/color-scheme</span>
                  <span style={{ color: palette.normal.yellow.css }}>git:(</span>
                  <span style={{ color: palette.normal.red.css }}>main</span>
                  <span style={{ color: palette.normal.yellow.css }}>)</span>
                  <span>ls -la --color=auto</span>
                </div>
                <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-1 opacity-90 text-sm">
                  <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.normal.blue.css }}>.</span>
                  <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.normal.blue.css }}>..</span>
                  <span style={{ color: palette.normal.white.css }}>-rw-r--r--</span> <span style={{ color: palette.bright.black.css }}>1.2K</span> <span>LICENSE</span>
                  <span style={{ color: palette.normal.green.css }}>-rwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>755</span> <span style={{ color: palette.normal.green.css }}>install.sh</span>
                  <span style={{ color: palette.normal.blue.css }}>drwxr-xr-x</span> <span style={{ color: palette.bright.black.css }}>4.0K</span> <span style={{ color: palette.bright.blue.css }}>src/</span>
                  <span style={{ color: palette.normal.magenta.css }}>lrwxrwxrwx</span> <span style={{ color: palette.bright.black.css }}>  24</span> <span style={{ color: palette.bright.cyan.css }}>config -&gt; /etc/app/config</span>
                </div>
              </div>

              {/* Section 2: Git Log (Graph visualization) */}
              <div className="space-y-1 border-t border-white/5 pt-4">
                 <div className="flex gap-2">
                  <span style={{ color: palette.normal.blue.css }}>➜</span>
                  <span>git log --graph --oneline --decorate</span>
                </div>
                <div className="text-sm font-mono leading-relaxed">
                  <div>
                    <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.bright.yellow.css }}>a1b2c3d</span> <span style={{ color: palette.bright.cyan.css }}>(HEAD -&gt; main, origin/main)</span> <span>Feat: Add hex input support</span>
                  </div>
                  <div>
                    <span style={{ color: palette.dim.red.css }}>*</span> <span style={{ color: palette.dim.yellow.css }}>e5f6g7h</span> <span style={{ color: palette.dim.white.css }}>Fix: Improve contrast ratio for accessibility</span>
                  </div>
                  <div>
                    <span style={{ color: palette.dim.red.css }}>|</span> <span style={{ color: palette.dim.red.css }}>\</span>
                  </div>
                  <div>
                    <span style={{ color: palette.dim.red.css }}>|</span> <span style={{ color: palette.dim.red.css }}> *</span> <span style={{ color: palette.dim.yellow.css }}>i8j9k0l</span> <span style={{ color: palette.dim.green.css }}>(tag: v1.0.0)</span> <span style={{ color: palette.dim.white.css }}>Release: Initial stable version</span>
                  </div>
                  <div>
                    <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.normal.red.css }}> |</span> <span style={{ color: palette.bright.yellow.css }}>m1n2o3p</span> <span>Docs: Update README.md</span>
                  </div>
                  <div>
                    <span style={{ color: palette.normal.red.css }}>|</span><span style={{ color: palette.normal.red.css }}>/</span>
                  </div>
                  <div>
                    <span style={{ color: palette.normal.red.css }}>*</span> <span style={{ color: palette.bright.yellow.css }}>q4r5s6t</span> <span>Init: Project setup</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Build/Log Output (Simulating npm run or compiler output) */}
              <div className="space-y-1 border-t border-white/5 pt-4">
                <div className="flex gap-2">
                  <span style={{ color: palette.normal.blue.css }}>➜</span>
                  <span>npm run build</span>
                </div>
                <div className="text-sm">
                  <div style={{ color: palette.bright.black.css }}>&gt; terminal-app@0.1.0 build</div>
                  <div style={{ color: palette.bright.black.css }}>&gt; react-scripts build</div>
                  <div className="mt-2">Creating an optimized production build...</div>
                  <div className="mt-1">
                    <span style={{ color: palette.bright.green.css }}>[SUCCESS]</span> Compiled successfully in 2.4s.
                  </div>
                  <div className="mt-1">
                     <span style={{ color: palette.bright.yellow.css }}>[WARN]</span> <span style={{ textDecoration: 'underline' }}>src/App.js</span>: Unused variable 'setCount'
                  </div>
                  <div className="mt-1" style={{ color: palette.dim.white.css }}>
                     File sizes after gzip:
                  </div>
                  <div className="ml-4" style={{ color: palette.dim.white.css }}>
                    <span style={{ color: palette.dim.cyan.css }}>45.2 KB</span>  build/static/js/main.js
                  </div>
                  <div className="ml-4" style={{ color: palette.dim.white.css }}>
                    <span style={{ color: palette.dim.magenta.css }}>12.8 KB</span>  build/static/css/main.css
                  </div>
                </div>
              </div>

               {/* Cursor */}
               <div className="mt-4 flex gap-2 items-center border-t border-white/5 pt-4">
                 <span style={{ color: palette.normal.blue.css }}>➜</span>
                 <span className="animate-pulse w-2.5 h-5 bg-white/50 block"></span>
               </div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
             <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider">Palette Map</h3>

             {/* Normal Colors */}
             <div className="mb-2 text-xs text-neutral-500">Normal (ANSI 0-7)</div>
             <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
                {Object.values(palette.normal).map((color, idx) => (
                  <PaletteSwatch key={idx} color={color} onCopy={handleCopy} copied={copied} />
                ))}
             </div>

             {/* Bright Colors */}
             <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-neutral-500">Bright (ANSI 8-15)</div>
                <div className="text-[10px] opacity-70 uppercase tracking-widest text-[var(--ui-accent)] transition-colors duration-300">{config.brightStrategy} Mode</div>
             </div>
             <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
                {Object.values(palette.bright).map((color, idx) => (
                  <PaletteSwatch key={idx} color={color} onCopy={handleCopy} copied={copied} />
                ))}
             </div>

             {/* Dim Colors */}
             <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-neutral-500">Dim (Optional)</div>
                <div className="text-[10px] text-neutral-400 opacity-70 uppercase tracking-widest">{config.dimStrategy} Mode</div>
             </div>
             <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Object.values(palette.dim).map((color, idx) => (
                  <PaletteSwatch key={idx} color={color} onCopy={handleCopy} copied={copied} />
                ))}
             </div>

             {/* Base UI */}
             <div className="mt-6 grid grid-cols-2 gap-4">
               <div
                 className="p-3 rounded-lg border border-neutral-700 flex justify-between items-center group cursor-pointer hover:border-neutral-500 transition-colors"
                 style={{ backgroundColor: palette.background.css }}
                 onClick={() => handleCopy(palette.background.hex, palette.background.name)}
               >
                  <span className="text-xs font-mono text-neutral-500">BG</span>
                  <span className="font-mono text-xs text-neutral-400 group-hover:text-white">{palette.background.hex}</span>
               </div>
               <div
                 className="p-3 rounded-lg border border-neutral-700 flex justify-between items-center group cursor-pointer hover:border-neutral-500 transition-colors"
                 style={{ backgroundColor: palette.foreground.css }}
                 onClick={() => handleCopy(palette.foreground.hex, palette.foreground.name)}
               >
                  <span className="text-xs font-mono text-neutral-500 mix-blend-difference">FG</span>
                  <span className="font-mono text-xs text-neutral-600 mix-blend-difference group-hover:text-black">{palette.foreground.hex}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual color blocks
function PaletteSwatch({ color, onCopy, copied }: PaletteSwatchProps) {
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
}

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <TerminalPaletteGenerator />
    </StrictMode>,
  );
}
