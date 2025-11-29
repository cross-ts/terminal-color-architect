import { describe, expect, it } from 'vitest';
import { BASE_HUES, DEFAULT_CONFIG, buildPalette, computeHexInput, findClosestBaseHue } from './palette';

describe('palette utils', () => {
  it('computeHexInput matches the generated normal color for the same config', () => {
    const hex = computeHexInput(DEFAULT_CONFIG, BASE_HUES.blue);
    const palette = buildPalette(DEFAULT_CONFIG);
    expect(hex).toBe(palette.normal.blue.hex);
  });

  it('bright pastel strategy lightens and desaturates compared to normal', () => {
    const pastelPalette = buildPalette({ ...DEFAULT_CONFIG, brightStrategy: 'pastel' });
    const normalRed = pastelPalette.normal.red;
    const brightRed = pastelPalette.bright.red;

    expect(brightRed.l).toBeGreaterThan(normalRed.l);
    expect(brightRed.c).toBeLessThan(normalRed.c);
  });

  it('dim deep strategy darkens but retains chroma compared to normal', () => {
    const deepPalette = buildPalette({ ...DEFAULT_CONFIG, dimStrategy: 'deep' });
    const normalBlue = deepPalette.normal.blue;
    const dimBlue = deepPalette.dim.blue;

    expect(dimBlue.l).toBeLessThan(normalBlue.l);
    expect(dimBlue.c).toBeGreaterThan(normalBlue.c * 0.5);
  });

  it('findClosestBaseHue snaps to the nearest defined hue', () => {
    expect(findClosestBaseHue(270)).toBe(BASE_HUES.blue);
    expect(findClosestBaseHue(20)).toBe(BASE_HUES.red);
  });
});
