import type { FurnitureType, WallObjectType } from '../types';

/**
 * Furniture Configuration
 *
 * All dimensions are in FEET.
 * - width: horizontal dimension (left to right)
 * - height: vertical dimension (top to bottom)
 * - color: hex color code for the furniture
 *
 * Feel free to modify these dimensions to match your needs!
 */

export const FURNITURE_TYPES: FurnitureType[] = [
  // ===== BEDS =====
  { type: 'twin-bed', name: 'Twin Bed', width: 3.2, height: 6.2, color: '#8B7355' },
  { type: 'full-bed', name: 'Full Bed', width: 4.5, height: 6.2, color: '#8B7355' },
  { type: 'queen-bed', name: 'Queen Bed', width: 5, height: 6.7, color: '#8B7355' },
  { type: 'king-bed', name: 'King Bed', width: 6.3, height: 6.7, color: '#8B7355' },

  // ===== SEATING =====
  { type: 'sofa', name: 'Sofa', width: 7, height: 3, color: '#4A5568' },
  { type: 'loveseat', name: 'Loveseat', width: 5, height: 3, color: '#4A5568' },
  { type: 'chair', name: 'Chair', width: 2, height: 2, color: '#4A5568' },

  // ===== TABLES =====
  { type: 'coffee-table', name: 'Coffee Table', width: 4, height: 2, color: '#6B4423' },
  { type: 'side-table', name: 'Side Table', width: 2, height: 2, color: '#6B4423' },
  { type: 'desk', name: 'Desk', width: 5, height: 2, color: '#6B4423' },

  // ===== STORAGE =====
  { type: 'dresser', name: 'Dresser', width: 4, height: 1.5, color: '#5C4033' },
  { type: 'tv-stand', name: 'TV Stand', width: 5, height: 1.5, color: '#5C4033' },
  { type: 'bookshelf', name: 'Bookshelf', width: 3, height: 1, color: '#5C4033' },
  { type: 'rolling-cart', name: 'Rolling Cart', width: 4, height: 1.5, color: '#71797E' },

  // ===== DECOR =====
  { type: 'lamp', name: 'Lamp', width: 1, height: 1, color: '#F59E0B' },
  { type: 'plant', name: 'Plant', width: 1.5, height: 1.5, color: '#10B981' },
  { type: 'rug', name: 'Rug', width: 8, height: 6, color: '#9CA3AF' },
];

/**
 * Wall Object Configuration
 *
 * All dimensions are in FEET.
 * - width: horizontal dimension when hanging on wall
 * - height: vertical dimension when hanging on wall
 */

export const WALL_OBJECT_TYPES: WallObjectType[] = [
  { type: 'small-frame', name: 'Small Frame', width: 2, height: 2 },
  { type: 'medium-frame', name: 'Medium Frame', width: 3, height: 4 },
  { type: 'large-frame', name: 'Large Frame', width: 5, height: 4 },
  { type: 'mirror', name: 'Mirror', width: 3, height: 5 },
  { type: 'shelf', name: 'Shelf', width: 4, height: 0.5 },
  { type: 'clock', name: 'Clock', width: 2, height: 2 },
  { type: 'tv', name: 'TV', width: 5, height: 3 },
];
