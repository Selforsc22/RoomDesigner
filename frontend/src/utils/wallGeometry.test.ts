import { describe, it, expect } from 'vitest';
import {
  calculateWallLength,
  calculateWallAngle,
  getWallCorners,
  calculateWallSegments,
  isPointInFloorPlan,
  calculateFloorPlanBounds,
  convertRectangleToWalls,
  convertLegacyDoorToWallMode,
  projectPointOntoWall,
  findNearestWallForOpening,
  findOpeningConflict,
  openingRangeOnWall,
  snapToWallEndpoint,
} from './wallGeometry';
import type { Wall, FloorPlan } from '../types';

const wall = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  id = 'w1'
): Wall => ({ id, startX, startY, endX, endY, thickness: 0.5, type: 'exterior' });

// L-shaped plan: (2,2)-(14,2)-(14,8)-(8,8)-(8,12)-(2,12)-close
const L_WALLS: Wall[] = [
  wall(2, 2, 14, 2, 'top'),
  wall(14, 2, 14, 8, 'right'),
  wall(14, 8, 8, 8, 'mid-h'),
  wall(8, 8, 8, 12, 'mid-v'),
  wall(8, 12, 2, 12, 'bottom'),
  wall(2, 12, 2, 2, 'left'),
];
const L_PLAN: FloorPlan = {
  id: 'fp',
  walls: L_WALLS,
  bounds: calculateFloorPlanBounds(L_WALLS),
};

describe('wall basics', () => {
  it('computes length and angle', () => {
    expect(calculateWallLength(wall(0, 0, 3, 4))).toBeCloseTo(5);
    expect(calculateWallAngle(wall(0, 0, 10, 0))).toBeCloseTo(0);
    expect(calculateWallAngle(wall(0, 0, 0, 10))).toBeCloseTo(90);
  });

  it('corners span the thickness perpendicular to the wall', () => {
    const c = getWallCorners(wall(0, 0, 10, 0));
    // horizontal wall, thickness 0.5 -> corners at y = ±0.25
    const ys = [c.topLeft.y, c.topRight.y, c.bottomLeft.y, c.bottomRight.y].sort();
    expect(ys[0]).toBeCloseTo(-0.25);
    expect(ys[3]).toBeCloseTo(0.25);
  });
});

describe('calculateWallSegments (openings gap walls)', () => {
  it('one opening splits a wall into two segments', () => {
    const segs = calculateWallSegments([
      { id: 'd', type: 'door', startPos: 0.4, endPos: 0.6 },
    ]);
    expect(segs).toEqual([
      { start: 0, end: 0.4 },
      { start: 0.6, end: 1 },
    ]);
  });

  it('handles multiple unsorted openings', () => {
    const segs = calculateWallSegments([
      { id: 'b', type: 'window', startPos: 0.7, endPos: 0.8 },
      { id: 'a', type: 'door', startPos: 0.1, endPos: 0.2 },
    ]);
    expect(segs).toEqual([
      { start: 0, end: 0.1 },
      { start: 0.2, end: 0.7 },
      { start: 0.8, end: 1 },
    ]);
  });

  it('no openings -> one full segment', () => {
    expect(calculateWallSegments([])).toEqual([{ start: 0, end: 1 }]);
  });
});

describe('isPointInFloorPlan', () => {
  it('accepts points inside the L and rejects the notch', () => {
    expect(isPointInFloorPlan({ x: 5, y: 5 }, L_PLAN)).toBe(true); // main body
    expect(isPointInFloorPlan({ x: 5, y: 10 }, L_PLAN)).toBe(true); // leg
    expect(isPointInFloorPlan({ x: 12, y: 10 }, L_PLAN)).toBe(false); // notch
    expect(isPointInFloorPlan({ x: 18, y: 5 }, L_PLAN)).toBe(false); // outside
  });
});

describe('rectangle conversion', () => {
  it('creates a closed 4-wall loop with matching bounds', () => {
    const plan = convertRectangleToWalls({ width: 20, height: 15 });
    expect(plan.walls).toHaveLength(4);
    expect(plan.bounds).toEqual({ minX: 0, minY: 0, maxX: 20, maxY: 15 });
    // each wall's end meets the next wall's start
    for (let i = 0; i < 4; i++) {
      const a = plan.walls[i];
      const b = plan.walls[(i + 1) % 4];
      expect(a.endX).toBeCloseTo(b.startX);
      expect(a.endY).toBeCloseTo(b.startY);
    }
  });

  it('migrates a legacy door onto the generated wall', () => {
    const door = convertLegacyDoorToWallMode(
      { id: 'd1', wall: 'north', x: 5, width: 3 },
      { width: 20, height: 15 }
    );
    expect(door.wallId).toBe('wall-north');
    expect(door.position).toBeCloseTo(5 / 20);
  });
});

describe('opening placement math', () => {
  const w = wall(0, 0, 10, 0);

  it('projects a point onto the wall with clamping', () => {
    expect(projectPointOntoWall({ x: 5, y: 1 }, w)).toEqual({ t: 0.5, distance: 1 });
    expect(projectPointOntoWall({ x: -3, y: 0 }, w).t).toBe(0); // clamped
  });

  it('finds the nearest wall and keeps the opening fully on it', () => {
    const hit = findNearestWallForOpening({ x: 0.5, y: 0.4 }, [w], 3);
    expect(hit?.wall.id).toBe('w1');
    // clamped so a 3ft opening fits: min position = 1.5/10
    expect(hit?.position).toBeCloseTo(0.15);
  });

  it('ignores walls beyond the distance threshold or too short to fit', () => {
    expect(findNearestWallForOpening({ x: 5, y: 5 }, [w], 3, 1.5)).toBeNull();
    const shortWall = wall(0, 0, 2, 0);
    expect(findNearestWallForOpening({ x: 1, y: 0 }, [shortWall], 3)).toBeNull();
  });

  it('detects overlapping openings and allows adjacent ones', () => {
    const existing = [{ id: 'door1', position: 0.5, width: 3 }]; // occupies 0.35-0.65
    expect(findOpeningConflict(w, 0.55, 3, existing)).toBe('door1');
    expect(findOpeningConflict(w, 0.15, 3, existing)).toBeNull();
  });

  it('computes the normalized range an opening occupies', () => {
    expect(openingRangeOnWall(w, 0.5, 3)).toEqual({ startPos: 0.35, endPos: 0.65 });
  });
});

describe('snapping', () => {
  it('snaps to a nearby wall endpoint within threshold', () => {
    const snapped = snapToWallEndpoint({ x: 14.3, y: 2.2 }, L_WALLS, 0.5);
    expect(snapped).toEqual({ x: 14, y: 2 });
  });

  it('leaves far points untouched', () => {
    expect(snapToWallEndpoint({ x: 6, y: 6 }, L_WALLS, 0.5)).toEqual({ x: 6, y: 6 });
  });
});
