import { describe, it, expect } from 'vitest';
import {
  getRoomDimensions,
  boundsFromSections,
  DEFAULT_ROOM_DIMENSIONS,
} from './design';

describe('boundsFromSections', () => {
  it('returns the union bounding box of all sections', () => {
    expect(
      boundsFromSections([
        { id: 'a', x: 0, y: 0, width: 10, height: 8 },
        { id: 'b', x: 10, y: 0, width: 6, height: 12 },
      ])
    ).toEqual({ width: 16, height: 12 });
  });

  it('returns null for missing or empty sections', () => {
    expect(boundsFromSections(undefined)).toBeNull();
    expect(boundsFromSections([])).toBeNull();
  });
});

describe('getRoomDimensions', () => {
  it('prefers explicit roomDimensions', () => {
    expect(getRoomDimensions({ roomDimensions: { width: 12, height: 9 } })).toEqual({
      width: 12,
      height: 9,
    });
  });

  it('falls back to section bounds, then the default', () => {
    expect(
      getRoomDimensions({
        roomSections: [{ id: 'a', x: 0, y: 0, width: 11, height: 7 }],
      })
    ).toEqual({ width: 11, height: 7 });
    expect(getRoomDimensions({})).toEqual(DEFAULT_ROOM_DIMENSIONS);
  });

  it('sizes to floor-plan bounds plus drawing margin in custom-walls mode', () => {
    const dims = getRoomDimensions({
      roomDimensions: { width: 20, height: 15 },
      floorPlan: {
        id: 'fp',
        walls: [
          { id: 'w', startX: 0, startY: 0, endX: 30, endY: 0, thickness: 0.5, type: 'exterior' },
        ],
        bounds: { minX: 0, minY: -0.25, maxX: 30, maxY: 0.25 },
      },
    });
    expect(dims.width).toBe(35); // 30 + 5ft margin
    expect(dims.height).toBe(15); // never below the base rectangle
  });

  it('ignores an EMPTY floor plan so the canvas does not resize on first wall', () => {
    const dims = getRoomDimensions({
      roomDimensions: { width: 20, height: 15 },
      floorPlan: { id: 'fp', walls: [], bounds: { minX: 0, minY: 0, maxX: 20, maxY: 15 } },
    });
    expect(dims).toEqual({ width: 20, height: 15 });
  });
});
