import { describe, expect, it } from 'vitest';
import { clamp, hexToOklch, oklchToHex } from './colorMath';

describe('colorMath', () => {
  it('clamp keeps values within range', () => {
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('oklchToHex produces a grayscale hex when chroma is zero', () => {
    const hex = oklchToHex(0.5, 0, 0);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5, 7);
    expect(r).toEqual(g);
    expect(g).toEqual(b);
  });

  it('hexToOklch parses valid hex and returns values in expected ranges', () => {
    const { l, c, h } = hexToOklch('#3b82f6');
    expect(l).toBeGreaterThan(0);
    expect(l).toBeLessThanOrEqual(1);
    expect(c).toBeGreaterThan(0);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(360);
  });
});
