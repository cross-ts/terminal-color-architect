import type { LucideIcon } from 'lucide-react';

export type BrightStrategy = 'vibrant' | 'pastel' | 'traditional';
export type DimStrategy = 'subtle' | 'muted' | 'deep';
export type BaseHueKey = 'red' | 'yellow' | 'green' | 'cyan' | 'blue' | 'magenta';

export type PaletteConfig = {
  bgLightness: number;
  fgLightness: number;
  chromaScale: number;
  lightnessScale: number;
  hueShift: number;
  brightStrategy: BrightStrategy;
  dimStrategy: DimStrategy;
};

export type PaletteColor = {
  name: string;
  l: number;
  c: number;
  h: number;
  css: string;
  hex: string;
};

export type Palette = {
  normal: Record<string, PaletteColor>;
  bright: Record<string, PaletteColor>;
  dim: Record<string, PaletteColor>;
  background: PaletteColor;
  foreground: PaletteColor;
  badgeBlack: PaletteColor;
};

export type Strategy<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
  desc: string;
};

export type OklchValues = {
  l: number;
  c: number;
  h: number;
};
