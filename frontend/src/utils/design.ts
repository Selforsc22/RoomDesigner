import type { Design, RoomSection } from '../types';

export const DEFAULT_ROOM_DIMENSIONS = { width: 20, height: 15 };

// Extra room around a custom floor plan so there's space to draw new walls
const FLOORPLAN_CANVAS_MARGIN = 5;

// Bounding box of all sections, for designs that only have a multi-section layout
export function boundsFromSections(
  sections?: RoomSection[]
): { width: number; height: number } | null {
  if (!sections || sections.length === 0) return null;

  let maxX = 0;
  let maxY = 0;
  for (const section of sections) {
    maxX = Math.max(maxX, section.x + section.width);
    maxY = Math.max(maxY, section.y + section.height);
  }
  return { width: maxX, height: maxY };
}

// Single source of truth for a design's canvas dimensions.
// roomDimensions is optional on Design (free-form wall mode may omit it),
// so every consumer must resolve dimensions through this helper.
// In custom-walls mode the canvas sizes to the plan's bounds plus margin
// (headroom for drawing new walls outward).
export function getRoomDimensions(
  design: Pick<Design, 'roomDimensions' | 'roomSections' | 'floorPlan'>
): { width: number; height: number } {
  if (design.floorPlan) {
    const base =
      design.roomDimensions ??
      boundsFromSections(design.roomSections) ??
      DEFAULT_ROOM_DIMENSIONS;
    const { maxX, maxY } = design.floorPlan.bounds;
    return {
      width: Math.max(base.width, Math.ceil(maxX) + FLOORPLAN_CANVAS_MARGIN),
      height: Math.max(base.height, Math.ceil(maxY) + FLOORPLAN_CANVAS_MARGIN),
    };
  }

  return (
    design.roomDimensions ??
    boundsFromSections(design.roomSections) ??
    DEFAULT_ROOM_DIMENSIONS
  );
}
