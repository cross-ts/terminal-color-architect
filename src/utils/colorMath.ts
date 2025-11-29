import type { OklchValues } from '../types/palette';

export const clamp = (val: number, min: number, max: number): number => Math.min(Math.max(val, min), max);

// OKLCH to Hex converter (Approximation for standard sRGB)
export const oklchToHex = (l: number, c: number, h: number): string => {
  const a_ = c * Math.cos((h * Math.PI) / 180);
  const b_ = c * Math.sin((h * Math.PI) / 180);

  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.291485548 * b_;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.707614701 * s_3;

  const processChannel = (value: number): number => {
    const adjusted = value > 0.0031308 ? 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055 : 12.92 * value;
    return Math.round(clamp(adjusted, 0, 1) * 255);
  };

  const rHex = processChannel(r).toString(16).padStart(2, '0');
  const gHex = processChannel(g).toString(16).padStart(2, '0');
  const bHex = processChannel(b).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
};

export const hexToOklch = (hex: string): OklchValues => {
  let sanitized = hex.replace(/^#/, '');

  let r = parseInt(sanitized.substring(0, 2), 16) / 255;
  let g = parseInt(sanitized.substring(2, 4), 16) / 255;
  let b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
  r = toLinear(r);
  g = toLinear(g);
  b = toLinear(b);

  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_3 = Math.cbrt(l_);
  const m_3 = Math.cbrt(m_);
  const s_3 = Math.cbrt(s_);

  const L = 0.2104542553 * l_3 + 0.793617785 * m_3 - 0.0040720468 * s_3;
  const a = 1.9779984951 * l_3 - 2.428592205 * m_3 + 0.4505937099 * s_3;
  const bb = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.808675766 * s_3;

  const C = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l: L, c: C, h };
};
