import { Cloud, EyeOff, Moon, Shield, Zap } from 'lucide-react';
import { clamp, oklchToHex } from './colorMath';
import type { BaseHueKey, BrightStrategy, DimStrategy, Palette, PaletteColor, PaletteConfig, Strategy } from '../types/palette';

export const BASE_HUES = {
  red: 25,
  yellow: 95,
  green: 142,
  cyan: 195,
  blue: 264,
  magenta: 320,
} as const;

export const DEFAULT_CONFIG: PaletteConfig = {
  bgLightness: 0.18,
  fgLightness: 0.9,
  chromaScale: 0.12,
  lightnessScale: 0.55,
  hueShift: 0,
  brightStrategy: 'vibrant',
  dimStrategy: 'subtle',
};

export const BRIGHT_STRATEGIES: Strategy<BrightStrategy>[] = [
  { id: 'vibrant', label: 'Vibrant', icon: Zap, desc: 'Rich & Deep Pop (No Washout)' },
  { id: 'pastel', label: 'Pastel', icon: Cloud, desc: 'High Lightness, Low Chroma' },
  { id: 'traditional', label: 'Classic', icon: Shield, desc: 'Simple Lightness Boost' },
];

export const DIM_STRATEGIES: Strategy<DimStrategy>[] = [
  { id: 'subtle', label: 'Subtle', icon: EyeOff, desc: 'Slightly Darker & Desaturated' },
  { id: 'muted', label: 'Muted', icon: Cloud, desc: 'Low Chroma (Grayish)' },
  { id: 'deep', label: 'Deep', icon: Moon, desc: 'Significantly Darker' },
];

export const computeHexInput = (state: PaletteConfig, baseHue: number): string => {
  let h = (baseHue + state.hueShift) % 360;
  if (h < 0) h += 360;

  return oklchToHex(state.lightnessScale, state.chromaScale, h);
};

const makeColor = (
  name: string,
  baseHue: number,
  l: number,
  c: number,
  hueShift: number,
  isGrayscale = false,
): PaletteColor => {
  const h = (baseHue + hueShift) % 360;
  const finalC = isGrayscale ? 0.01 : c;
  const safeL = clamp(l, 0.01, 0.99);
  const css = `oklch(${safeL} ${finalC} ${h})`;
  const hex = oklchToHex(safeL, finalC, h);
  return { name, l: safeL, c: finalC, h, css, hex };
};

export const buildPalette = (config: PaletteConfig): Palette => {
  const { bgLightness, fgLightness, chromaScale, lightnessScale, hueShift, brightStrategy, dimStrategy } = config;

  const normal = {
    black: makeColor('Black', 0, bgLightness + 0.1, 0.02, hueShift, true),
    red: makeColor('Red', BASE_HUES.red, lightnessScale, chromaScale, hueShift),
    green: makeColor('Green', BASE_HUES.green, lightnessScale, chromaScale, hueShift),
    yellow: makeColor('Yellow', BASE_HUES.yellow, lightnessScale, chromaScale, hueShift),
    blue: makeColor('Blue', BASE_HUES.blue, lightnessScale, chromaScale, hueShift),
    magenta: makeColor('Magenta', BASE_HUES.magenta, lightnessScale, chromaScale, hueShift),
    cyan: makeColor('Cyan', BASE_HUES.cyan, lightnessScale, chromaScale, hueShift),
    white: makeColor('White', 0, fgLightness - 0.1, 0.02, hueShift, true),
  };

  let brightL;
  let brightC;

  switch (brightStrategy) {
    case 'pastel':
      brightL = Math.min(lightnessScale + 0.25, 0.98);
      brightC = chromaScale * 0.75;
      break;
    case 'traditional':
      brightL = Math.min(lightnessScale + 0.1, 0.98);
      brightC = chromaScale;
      break;
    case 'vibrant':
    default:
      brightL = Math.min(lightnessScale + 0.04, 0.9);
      brightC = Math.min(chromaScale * 1.6, 0.45);
      break;
  }

  const bright = {
    black: makeColor('BrBlack', 0, bgLightness + 0.25, 0.02, hueShift, true),
    red: makeColor('BrRed', BASE_HUES.red, brightL, brightC, hueShift),
    green: makeColor('BrGreen', BASE_HUES.green, brightL, brightC, hueShift),
    yellow: makeColor('BrYellow', BASE_HUES.yellow, brightL, brightC, hueShift),
    blue: makeColor('BrBlue', BASE_HUES.blue, brightL, brightC, hueShift),
    magenta: makeColor('BrMagenta', BASE_HUES.magenta, brightL, brightC, hueShift),
    cyan: makeColor('BrCyan', BASE_HUES.cyan, brightL, brightC, hueShift),
    white: makeColor('BrWhite', 0, fgLightness, 0.01, hueShift, true),
  };

  let dimL;
  let dimC;

  switch (dimStrategy) {
    case 'muted':
      dimL = Math.max(lightnessScale - 0.05, bgLightness + 0.05);
      dimC = chromaScale * 0.5;
      break;
    case 'deep':
      dimL = Math.max(lightnessScale - 0.2, bgLightness + 0.02);
      dimC = chromaScale * 0.9;
      break;
    case 'subtle':
    default:
      dimL = Math.max(lightnessScale - 0.15, bgLightness + 0.05);
      dimC = chromaScale * 0.8;
      break;
  }

  const dim = {
    black: makeColor('DimBlack', 0, bgLightness + 0.05, 0.01, hueShift, true),
    red: makeColor('DimRed', BASE_HUES.red, dimL, dimC, hueShift),
    green: makeColor('DimGreen', BASE_HUES.green, dimL, dimC, hueShift),
    yellow: makeColor('DimYellow', BASE_HUES.yellow, dimL, dimC, hueShift),
    blue: makeColor('DimBlue', BASE_HUES.blue, dimL, dimC, hueShift),
    magenta: makeColor('DimMagenta', BASE_HUES.magenta, dimL, dimC, hueShift),
    cyan: makeColor('DimCyan', BASE_HUES.cyan, dimL, dimC, hueShift),
    white: makeColor('DimWhite', 0, fgLightness - 0.3, 0.01, hueShift, true),
  };

  const background = makeColor('Background', 0, bgLightness, 0.01, hueShift, true);
  const foreground = makeColor('Foreground', 0, fgLightness, 0.01, hueShift, true);
  const badgeBlack = makeColor('BadgeBlack', 0, 0.2, 0.01, hueShift, true);

  return { normal, bright, dim, background, foreground, badgeBlack };
};

export const findClosestBaseHue = (targetHue: number): number => {
  let minDiff = 360;
  let closestBase = 0;

  Object.values(BASE_HUES).forEach((baseHue) => {
    let diff = Math.abs(targetHue - baseHue);
    if (diff > 180) diff = 360 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closestBase = baseHue;
    }
  });

  return closestBase;
};

export const resolveBaseHueKey = (value: number): BaseHueKey => {
  const entry = (Object.entries(BASE_HUES) as Array<[BaseHueKey, number]>).find(([, v]) => v === value);
  return entry ? entry[0] : 'blue';
};
