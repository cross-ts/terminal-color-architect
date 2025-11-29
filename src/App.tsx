import { useMemo, useState, type CSSProperties } from 'react';
import { Check, Code, Ghost, Slack, Terminal } from 'lucide-react';
import { ControlPanel } from './components/ControlPanel';
import { PaletteGrid } from './components/PaletteGrid';
import { TerminalPreview } from './components/TerminalPreview';
import { copyText } from './utils/copy';
import { clamp, hexToOklch } from './utils/colorMath';
import {
  BASE_HUES,
  DEFAULT_CONFIG,
  buildPalette,
  computeHexInput,
  findClosestBaseHue,
  resolveBaseHueKey,
} from './utils/palette';
import type { Palette, PaletteConfig } from './types/palette';

const App = () => {
  const [activeBaseHue, setActiveBaseHue] = useState<number>(BASE_HUES.blue);
  const [config, setConfig] = useState<PaletteConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState<string>(() => computeHexInput(DEFAULT_CONFIG, BASE_HUES.blue));
  const [hexError, setHexError] = useState<string>('');

  const updateConfig = (next: PaletteConfig | ((prev: PaletteConfig) => PaletteConfig), baseHue = activeBaseHue) => {
    setConfig((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      setHexInput(computeHexInput(resolved, baseHue));
      return resolved;
    });
  };

  const palette = useMemo<Palette>(() => buildPalette(config), [config]);

  const accentColor = useMemo<string>(() => {
    const key = resolveBaseHueKey(activeBaseHue);
    return palette.bright[key]?.hex || palette.bright.blue.hex;
  }, [palette, activeBaseHue]);

  const handleCopy = async (text: string, key: string) => {
    const didCopy = await copyText(text);
    if (!didCopy) return;
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllJSON = async () => {
    const output = {
      background: palette.background.hex,
      foreground: palette.foreground.hex,
      colors: {
        normal: Object.fromEntries(Object.values(palette.normal).map((c) => [c.name.toLowerCase(), c.hex])),
        bright: Object.fromEntries(Object.values(palette.bright).map((c) => [c.name.toLowerCase(), c.hex])),
        dim: Object.fromEntries(Object.values(palette.dim).map((c) => [c.name.toLowerCase(), c.hex])),
      },
    };
    await handleCopy(JSON.stringify(output, null, 2), 'json');
  };

  const copyAllAlacritty = async () => {
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

    await handleCopy(output, 'alacritty');
  };

  const copyAllGhostty = async () => {
    const colors = [
      palette.normal.black,
      palette.normal.red,
      palette.normal.green,
      palette.normal.yellow,
      palette.normal.blue,
      palette.normal.magenta,
      palette.normal.cyan,
      palette.normal.white,
      palette.bright.black,
      palette.bright.red,
      palette.bright.green,
      palette.bright.yellow,
      palette.bright.blue,
      palette.bright.magenta,
      palette.bright.cyan,
      palette.bright.white,
    ];

    const output = colors
      .map((c, i) => `palette = ${i}=${c.hex}`)
      .reduce(
        (acc, line) => `${acc}${line}\n`,
        `background = ${palette.background.hex}\nforeground = ${palette.foreground.hex}\n`,
      );

    await handleCopy(output, 'ghostty');
  };

  const copyAllSlack = async () => {
    const output = [
      palette.background.hex,
      palette.dim.black.hex,
      palette.normal.blue.hex,
      '#FFFFFF',
      palette.normal.black.hex,
      palette.foreground.hex,
      palette.normal.green.hex,
      palette.normal.red.hex,
    ].join(',');

    await handleCopy(output, 'slack');
  };

  const applyHexColor = () => {
    if (!hexInput.match(/^#?([0-9A-F]{3}){1,2}$/i)) {
      setHexError('Invalid Hex Code');
      return;
    }
    setHexError('');

    const { l, c, h } = hexToOklch(hexInput);
    const closestBase = findClosestBaseHue(h);

    let newShift = h - closestBase;
    while (newShift > 180) newShift -= 360;
    while (newShift < -180) newShift += 360;

    updateConfig(
      (prev) => ({
        ...prev,
        hueShift: Math.round(newShift),
        lightnessScale: clamp(l, 0.3, 0.95),
        chromaScale: clamp(c, 0.01, 0.3),
      }),
      closestBase,
    );

    setActiveBaseHue(closestBase);
  };

  const handleReset = () => {
    updateConfig(DEFAULT_CONFIG, BASE_HUES.blue);
    setActiveBaseHue(BASE_HUES.blue);
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
          <p className="text-neutral-400 mt-2 text-sm">OKLCH色空間を使用した知覚的に均一なターミナル配色の作成ツール</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => copyAllJSON()}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'json' ? <Check size={16} className="text-green-400" /> : <Code size={16} />}
            JSON
          </button>
          <button
            onClick={() => copyAllGhostty()}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'ghostty' ? <Check size={16} className="text-green-400" /> : <Ghost size={16} />}
            Ghostty
          </button>
          <button
            onClick={() => copyAllAlacritty()}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'alacritty' ? <Check size={16} className="text-green-400" /> : <Terminal size={16} />}
            Alacritty
          </button>
          <button
            onClick={() => copyAllSlack()}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors text-sm font-medium border border-neutral-700"
          >
            {copied === 'slack' ? <Check size={16} className="text-green-400" /> : <Slack size={16} />}
            Slack
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <ControlPanel
            config={config}
            hexInput={hexInput}
            hexError={hexError}
            onHexInputChange={setHexInput}
            onApplyHex={applyHexColor}
            onConfigChange={updateConfig}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-8 space-y-8">
          <TerminalPreview palette={palette} />
          <PaletteGrid palette={palette} config={config} onCopy={handleCopy} copied={copied} />
        </div>
      </div>
    </div>
  );
};

export default App;
