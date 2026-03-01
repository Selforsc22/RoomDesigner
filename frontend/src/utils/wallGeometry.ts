import type { Wall, FloorPlan, Door, Window } from '../types';

export interface WallOpening {
  id: string; // door or window ID
  type: 'door' | 'window';
  startPos: number; // 0-1 position along wall
  endPos: number; // 0-1 position along wall
  heightFromFloor?: number; // for windows
  height?: number; // opening height
}

// Calculate wall angle (in degrees, 0 = horizontal right)
export function calculateWallAngle(wall: Wall): number {
  const dx = wall.endX - wall.startX;
  const dy = wall.endY - wall.startY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

// Calculate wall length
export function calculateWallLength(wall: Wall): number {
  const dx = wall.endX - wall.startX;
  const dy = wall.endY - wall.startY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get wall perpendicular offset for thickness rendering
// Returns 4 corner points for a thick wall
export function getWallCorners(wall: Wall): {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
} {
  const angle = calculateWallAngle(wall);
  const perpAngle = (angle + 90) * (Math.PI / 180);
  const halfThickness = wall.thickness / 2;

  const offsetX = Math.cos(perpAngle) * halfThickness;
  const offsetY = Math.sin(perpAngle) * halfThickness;

  return {
    topLeft: { x: wall.startX + offsetX, y: wall.startY + offsetY },
    topRight: { x: wall.endX + offsetX, y: wall.endY + offsetY },
    bottomRight: { x: wall.endX - offsetX, y: wall.endY - offsetY },
    bottomLeft: { x: wall.startX - offsetX, y: wall.startY - offsetY },
  };
}

// Check if two walls intersect at endpoints (for connection detection)
export function wallsConnect(wall1: Wall, wall2: Wall, tolerance: number = 0.1): boolean {
  const connections = [
    { p1: { x: wall1.startX, y: wall1.startY }, p2: { x: wall2.startX, y: wall2.startY } },
    { p1: { x: wall1.startX, y: wall1.startY }, p2: { x: wall2.endX, y: wall2.endY } },
    { p1: { x: wall1.endX, y: wall1.endY }, p2: { x: wall2.startX, y: wall2.startY } },
    { p1: { x: wall1.endX, y: wall1.endY }, p2: { x: wall2.endX, y: wall2.endY } },
  ];

  return connections.some(({ p1, p2 }) => {
    const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    return dist < tolerance;
  });
}

// Find intersection point of two wall edges (for mitered corners)
export function findWallIntersection(
  wall1: Wall,
  wall2: Wall
): { x: number; y: number } | null {
  // Line intersection using parametric equations
  const x1 = wall1.startX, y1 = wall1.startY;
  const x2 = wall1.endX, y2 = wall1.endY;
  const x3 = wall2.startX, y3 = wall2.startY;
  const x4 = wall2.endX, y4 = wall2.endY;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return null; // Parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

// Helper: Line segment intersection
function lineSegmentsIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const ccw = (A: { x: number; y: number }, B: { x: number; y: number }, C: { x: number; y: number }) =>
    (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Check if a point is inside the floor plan (for furniture constraint)
export function isPointInFloorPlan(
  point: { x: number; y: number },
  floorPlan: FloorPlan
): boolean {
  // Ray casting algorithm - count intersections with walls
  let inside = false;
  const rayEnd = { x: floorPlan.bounds.maxX + 10, y: point.y };

  for (const wall of floorPlan.walls) {
    if (wall.type !== 'exterior') continue;

    if (lineSegmentsIntersect(
      point, rayEnd,
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY }
    )) {
      inside = !inside;
    }
  }

  return inside;
}

// Calculate bounds from walls
export function calculateFloorPlanBounds(walls: Wall[]): FloorPlan['bounds'] {
  if (walls.length === 0) {
    return { minX: 0, minY: 0, maxX: 20, maxY: 15 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  walls.forEach(wall => {
    const corners = getWallCorners(wall);
    [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft].forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
  });

  return { minX, minY, maxX, maxY };
}

// Calculate wall segments with openings
export function calculateWallSegments(
  wall: Wall,
  openings: WallOpening[]
): Array<{ start: number; end: number }> {
  // Sort openings by position
  const sorted = [...openings].sort((a, b) => a.startPos - b.startPos);

  const segments: Array<{ start: number; end: number }> = [];
  let currentPos = 0;

  for (const opening of sorted) {
    // Add segment before opening (if any)
    if (opening.startPos > currentPos) {
      segments.push({ start: currentPos, end: opening.startPos });
    }
    currentPos = opening.endPos;
  }

  // Add final segment after last opening
  if (currentPos < 1) {
    segments.push({ start: currentPos, end: 1 });
  }

  return segments;
}

// Get door/window position on wall (in feet coordinates)
export function getOpeningPosition(
  wall: Wall,
  position: number, // 0-1 normalized
  width: number
): {
  centerX: number;
  centerY: number;
  angle: number; // wall angle
} {
  const angle = calculateWallAngle(wall);

  const t = position; // 0-1 parameter
  const centerX = wall.startX + t * (wall.endX - wall.startX);
  const centerY = wall.startY + t * (wall.endY - wall.startY);

  return { centerX, centerY, angle };
}

// Convert simple rectangle to wall mode
export function convertRectangleToWalls(
  dimensions: { width: number; height: number },
  wallThickness: number = 0.5
): FloorPlan {
  const walls: Wall[] = [
    // North wall
    {
      id: 'wall-north',
      startX: 0,
      startY: 0,
      endX: dimensions.width,
      endY: 0,
      thickness: wallThickness,
      type: 'exterior'
    },
    // East wall
    {
      id: 'wall-east',
      startX: dimensions.width,
      startY: 0,
      endX: dimensions.width,
      endY: dimensions.height,
      thickness: wallThickness,
      type: 'exterior'
    },
    // South wall
    {
      id: 'wall-south',
      startX: dimensions.width,
      startY: dimensions.height,
      endX: 0,
      endY: dimensions.height,
      thickness: wallThickness,
      type: 'exterior'
    },
    // West wall
    {
      id: 'wall-west',
      startX: 0,
      startY: dimensions.height,
      endX: 0,
      endY: 0,
      thickness: wallThickness,
      type: 'exterior'
    },
  ];

  return {
    id: `floorplan-${Date.now()}`,
    walls: walls,
    bounds: { minX: 0, minY: 0, maxX: dimensions.width, maxY: dimensions.height },
  };
}

// Convert doors from legacy mode to wall mode
export function convertLegacyDoorToWallMode(
  door: Door,
  dimensions?: { width: number; height: number }
): Door {
  if (!door.wall || !dimensions) return door;

  const wallMap: Record<string, string> = {
    'north': 'wall-north',
    'south': 'wall-south',
    'east': 'wall-east',
    'west': 'wall-west',
  };

  const wallLength = door.wall === 'north' || door.wall === 'south'
    ? dimensions.width
    : dimensions.height;

  return {
    ...door,
    wallId: wallMap[door.wall],
    position: (door.x || 0) / wallLength,
  };
}

// Convert windows from legacy mode to wall mode
export function convertLegacyWindowToWallMode(
  window: Window,
  dimensions?: { width: number; height: number }
): Window {
  if (!window.wall || !dimensions) return window;

  const wallMap: Record<string, string> = {
    'north': 'wall-north',
    'south': 'wall-south',
    'east': 'wall-east',
    'west': 'wall-west',
  };

  const wallLength = window.wall === 'north' || window.wall === 'south'
    ? dimensions.width
    : dimensions.height;

  return {
    ...window,
    wallId: wallMap[window.wall],
    position: (window.x || 0) / wallLength,
    heightFromFloor: window.y,
  };
}

// Snap point to grid
export function snapToGrid(value: number, gridSize: number = 1): number {
  return Math.round(value / gridSize) * gridSize;
}

// Snap point to nearest wall endpoint
export function snapToWallEndpoint(
  point: { x: number; y: number },
  walls: Wall[],
  threshold: number = 0.5
): { x: number; y: number } {
  let snappedPoint = { ...point };
  let minDistance = threshold;

  walls.forEach(wall => {
    const endpoints = [
      { x: wall.startX, y: wall.startY },
      { x: wall.endX, y: wall.endY },
    ];

    endpoints.forEach(endpoint => {
      const dist = Math.sqrt(
        (point.x - endpoint.x) ** 2 + (point.y - endpoint.y) ** 2
      );

      if (dist < minDistance) {
        minDistance = dist;
        snappedPoint = endpoint;
      }
    });
  });

  return snappedPoint;
}

// Linear interpolation helper
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
