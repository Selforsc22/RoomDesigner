import type { Design, RoomSection } from '../types';

export const DEFAULT_ROOM_DIMENSIONS = { width: 20, height: 15 };

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
export function getRoomDimensions(
  design: Pick<Design, 'roomDimensions' | 'roomSections'>
): { width: number; height: number } {
  return (
    design.roomDimensions ??
    boundsFromSections(design.roomSections) ??
    DEFAULT_ROOM_DIMENSIONS
  );
}
