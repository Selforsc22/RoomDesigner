import { describe, it, expect } from 'vitest';
import {
  kelvinToRGB,
  getBeamGeometry,
  getFalloffStops,
  getAmbientTint,
  getActiveLights,
  LIGHT_DEFAULTS,
} from './lighting';
import type { FurnitureItem } from '../types';

const hexChannel = (hex: string, i: number) =>
  parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);

const makeLight = (overrides: Partial<FurnitureItem> = {}): FurnitureItem => ({
  id: 'l1',
  type: 'softbox',
  name: 'Key',
  x: 3,
  y: 3,
  width: 2,
  height: 2,
  rotation: 0,
  color: '#FFD700',
  isLight: true,
  lightIntensity: 80,
  colorTemperature: 5600,
  beamAngle: 60,
  lightDirection: 0,
  ...overrides,
});

const ROOM = { width: 20, height: 15 };

describe('kelvinToRGB', () => {
  it('returns a valid hex color', () => {
    expect(kelvinToRGB(5600)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('is warm (red > blue) at tungsten 3200K', () => {
    const hex = kelvinToRGB(3200);
    expect(hexChannel(hex, 0)).toBeGreaterThan(hexChannel(hex, 2));
  });

  it('is cool (blue near/at max) at 6500K+', () => {
    // Tanner Helland's blue channel saturates at 6600K; ~250 at 6500K
    expect(hexChannel(kelvinToRGB(6500), 2)).toBeGreaterThanOrEqual(245);
    expect(hexChannel(kelvinToRGB(9000), 2)).toBe(255);
  });

  it('blue channel increases monotonically from warm to cool (no banding)', () => {
    let prev = -1;
    for (let k = 3200; k <= 6500; k += 100) {
      const blue = hexChannel(kelvinToRGB(k), 2);
      expect(blue).toBeGreaterThanOrEqual(prev);
      prev = blue;
    }
  });

  it('produces distinct colors across the slider range (continuous, not bucketed)', () => {
    const colors = new Set<string>();
    for (let k = 3200; k <= 6500; k += 100) colors.add(kelvinToRGB(k));
    expect(colors.size).toBeGreaterThan(10); // the old implementation had 4
  });

  it('clamps out-of-range inputs instead of exploding', () => {
    expect(kelvinToRGB(0)).toBe(kelvinToRGB(1000));
    expect(kelvinToRGB(50000)).toBe(kelvinToRGB(12000));
  });
});

describe('getBeamGeometry', () => {
  it('originates at the fixture EDGE, offset along the direction', () => {
    // 2x2 fixture at (3,3): center (4,4), edge offset 1ft, direction 0 (+x)
    const geom = getBeamGeometry(makeLight(), ROOM);
    expect(geom.origin.x).toBeCloseTo(5);
    expect(geom.origin.y).toBeCloseTo(4);
  });

  it('offsets the origin correctly for a downward (90°) beam', () => {
    const geom = getBeamGeometry(makeLight({ lightDirection: 90 }), ROOM);
    expect(geom.origin.x).toBeCloseTo(4);
    expect(geom.origin.y).toBeCloseTo(5);
  });

  it('length grows with intensity', () => {
    const dim = getBeamGeometry(makeLight({ lightIntensity: 10 }), ROOM);
    const bright = getBeamGeometry(makeLight({ lightIntensity: 100 }), ROOM);
    expect(bright.length).toBeGreaterThan(dim.length);
  });

  it('length is clamped to 1.25x the room diagonal', () => {
    const tinyRoom = { width: 4, height: 3 }; // diagonal 5
    const geom = getBeamGeometry(makeLight({ lightIntensity: 100 }), tinyRoom);
    expect(geom.length).toBeLessThanOrEqual(5 * 1.25 + 1e-9);
  });

  it('cone width follows beamAngle', () => {
    const spot = getBeamGeometry(makeLight({ beamAngle: 15 }), ROOM);
    const flood = getBeamGeometry(makeLight({ beamAngle: 120 }), ROOM);
    const width = (g: typeof spot) =>
      Math.hypot(g.leftEdge.x - g.rightEdge.x, g.leftEdge.y - g.rightEdge.y);
    expect(width(flood)).toBeGreaterThan(width(spot));
  });

  it('uses documented defaults for missing light properties', () => {
    const bare = makeLight({
      lightIntensity: undefined,
      colorTemperature: undefined,
      beamAngle: undefined,
      lightDirection: undefined,
    });
    const geom = getBeamGeometry(bare, ROOM);
    expect(geom.direction).toBe(LIGHT_DEFAULTS.direction);
    expect(geom.length).toBeCloseTo(8 + (LIGHT_DEFAULTS.intensity / 100) * 10);
  });
});

describe('getFalloffStops', () => {
  it('fades from bright at the source to zero at the tip', () => {
    const stops = getFalloffStops(100);
    expect(stops[0].opacity).toBeCloseTo(1);
    expect(stops[stops.length - 1].opacity).toBe(0);
  });

  it('clamps intensity to 0-100', () => {
    expect(getFalloffStops(500)[0].opacity).toBeCloseTo(1);
    expect(getFalloffStops(-5)[0].opacity).toBe(0);
  });
});

describe('getActiveLights / getAmbientTint', () => {
  it('ignores non-lights and zero-intensity lights', () => {
    const items = [
      makeLight(),
      makeLight({ id: 'off', lightIntensity: 0 }),
      makeLight({ id: 'sofa', isLight: false }),
    ];
    expect(getActiveLights(items).map((l) => l.id)).toEqual(['l1']);
  });

  it('returns null with no active lights', () => {
    expect(getAmbientTint([])).toBeNull();
    expect(getAmbientTint([makeLight({ lightIntensity: 0 })])).toBeNull();
  });

  it('tints from the intensity-weighted average temperature', () => {
    // Two equal-intensity lights at 3200K and 6000K -> avg 4600K (warm-ish)
    const tint = getAmbientTint([
      makeLight({ colorTemperature: 3200 }),
      makeLight({ id: 'l2', colorTemperature: 6000 }),
    ]);
    expect(tint).not.toBeNull();
    expect(tint!.color).toBe(kelvinToRGB(4600));
  });

  it('is stronger the further the set is from neutral daylight', () => {
    const warm = getAmbientTint([makeLight({ colorTemperature: 3200 })])!;
    const neutral = getAmbientTint([makeLight({ colorTemperature: 5600 })])!;
    expect(warm.opacity).toBeGreaterThan(neutral.opacity);
  });
});
