import type { FurnitureType, WallObjectType } from '../types';
import {
  STUDIO_LIGHTING_TYPES,
  CAMERA_EQUIPMENT_TYPES,
  BACKDROP_TYPES,
  STUDIO_ACCESSORIES,
} from './studioLightingConfig';

/**
 * Furniture Configuration
 *
 * All dimensions are in FEET.
 * - width: horizontal dimension (left to right)
 * - height: vertical dimension (top to bottom)
 * - color: hex color code for the furniture
 * - icon: Lucide React icon name
 *
 * Feel free to modify these dimensions to match your needs!
 */

export const FURNITURE_TYPES: FurnitureType[] = [
  // ===== BEDS =====
  { type: 'twin-bed', name: 'Twin Bed', width: 3.2, height: 6.2, color: '#8B7355', icon: 'Bed', category: 'furniture' },
  { type: 'full-bed', name: 'Full Bed', width: 4.5, height: 6.2, color: '#8B7355', icon: 'Bed' },
  { type: 'queen-bed', name: 'Queen Bed', width: 5, height: 6.7, color: '#8B7355', icon: 'BedDouble' },
  { type: 'king-bed', name: 'King Bed', width: 6.3, height: 6.7, color: '#8B7355', icon: 'BedDouble' },

  // ===== SEATING =====
  { type: 'sofa', name: 'Sofa', width: 7, height: 3, color: '#4A5568', icon: 'Sofa' },
  { type: 'loveseat', name: 'Loveseat', width: 5, height: 3, color: '#4A5568', icon: 'Sofa' },
  { type: 'chair', name: 'Chair', width: 2, height: 2, color: '#4A5568', icon: 'Armchair' },

  // ===== TABLES =====
  { type: 'coffee-table', name: 'Coffee Table', width: 4, height: 2, color: '#6B4423', icon: 'Table' },
  { type: 'side-table', name: 'Side Table', width: 2, height: 2, color: '#6B4423', icon: 'Table2' },
  { type: 'desk', name: 'Desk', width: 5, height: 2, color: '#6B4423', icon: 'Laptop' },

  // ===== STORAGE =====
  { type: 'dresser', name: 'Dresser', width: 4, height: 1.5, color: '#5C4033', icon: 'Container' },
  { type: 'tv-stand', name: 'TV Stand', width: 5, height: 1.5, color: '#5C4033', icon: 'MonitorSpeaker' },
  { type: 'bookshelf', name: 'Bookshelf', width: 3, height: 1, color: '#5C4033', icon: 'BookMarked' },
  { type: 'rolling-cart', name: 'Rolling Cart', width: 4, height: 1.5, color: '#71797E', icon: 'ShoppingCart' },

  // ===== DECOR =====
  { type: 'lamp', name: 'Lamp', width: 1, height: 1, color: '#F59E0B', icon: 'Lamp' },
  { type: 'plant', name: 'Plant', width: 1.5, height: 1.5, color: '#10B981', icon: 'Trees' },
  { type: 'rug', name: 'Rug', width: 8, height: 6, color: '#9CA3AF', icon: 'Square' },

  // ===== STUDIO LIGHTING =====
  ...STUDIO_LIGHTING_TYPES,

  // ===== CAMERA EQUIPMENT =====
  ...CAMERA_EQUIPMENT_TYPES,

  // ===== BACKDROPS =====
  ...BACKDROP_TYPES,

  // ===== STUDIO ACCESSORIES =====
  ...STUDIO_ACCESSORIES,
];

/**
 * Wall Object Configuration
 *
 * All dimensions are in FEET.
 * - width: horizontal dimension when hanging on wall
 * - height: vertical dimension when hanging on wall
 * - icon: Lucide React icon name
 */

export const WALL_OBJECT_TYPES: WallObjectType[] = [
  { type: 'small-frame', name: 'Small Frame', width: 2, height: 2, icon: 'SquareDashedBottom' },
  { type: 'medium-frame', name: 'Medium Frame', width: 3, height: 4, icon: 'Frame' },
  { type: 'large-frame', name: 'Large Frame', width: 5, height: 4, icon: 'Frame' },
  { type: 'mirror', name: 'Mirror', width: 3, height: 5, icon: 'Mirror' },
  { type: 'shelf', name: 'Shelf', width: 4, height: 0.5, icon: 'Minus' },
  { type: 'clock', name: 'Clock', width: 2, height: 2, icon: 'Clock' },
  { type: 'tv', name: 'TV', width: 5, height: 3, icon: 'Tv' },
];
