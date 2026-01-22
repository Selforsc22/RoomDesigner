import type { FurnitureType } from '../types';

/**
 * Studio Lighting Equipment Configuration
 *
 * This file will contain photography/videography lighting equipment.
 * All dimensions are in FEET.
 *
 * Lighting Properties:
 * - defaultIntensity: Light output (0-100)
 * - defaultColorTemp: Color temperature in Kelvin (3200K = warm, 5600K = daylight, 6500K = cool)
 * - defaultBeamAngle: Light spread angle in degrees (15° = spot, 60° = medium, 120° = flood)
 * - defaultZHeight: Default height off ground in feet (typically 5-8 feet for studio lights)
 *
 * Common Studio Lighting:
 * - Key Light: Main light source (typically 45° from subject)
 * - Fill Light: Softens shadows (opposite side of key, lower intensity)
 * - Back/Hair Light: Separates subject from background
 * - Background Light: Illuminates backdrop
 *
 * TODO: Implement these lighting types in future update:
 * - Softboxes (various sizes)
 * - Umbrella lights (shoot-through, reflective)
 * - Ring lights (makeup, portrait)
 * - Strobes/Speedlights
 * - Continuous LED panels
 * - Beauty dishes
 * - Barn doors/flags
 * - Reflectors
 */

export const STUDIO_LIGHTING_TYPES: FurnitureType[] = [
  // PLACEHOLDER - Will be populated in future update
  // Example structure:
  // {
  //   type: 'softbox-medium',
  //   name: 'Medium Softbox',
  //   width: 2,
  //   height: 2,
  //   color: '#FFE6B3',
  //   icon: 'Lightbulb',
  //   category: 'lighting',
  //   isLight: true,
  //   defaultIntensity: 80,
  //   defaultColorTemp: 5600,
  //   defaultBeamAngle: 60,
  //   defaultZHeight: 6,
  // },
];

/**
 * Camera Equipment Configuration
 *
 * TODO: Add camera positions, tripods, and shooting positions
 */
export const CAMERA_EQUIPMENT_TYPES: FurnitureType[] = [
  // PLACEHOLDER - Will be populated in future update
];

/**
 * Backdrop & Background Configuration
 *
 * TODO: Add backdrop stands, seamless paper rolls, and background options
 */
export const BACKDROP_TYPES: FurnitureType[] = [
  // PLACEHOLDER - Will be populated in future update
];

/**
 * Studio Modifiers & Accessories
 *
 * TODO: Add reflectors, diffusers, flags, c-stands, etc.
 */
export const STUDIO_ACCESSORIES: FurnitureType[] = [
  // PLACEHOLDER - Will be populated in future update
];

/**
 * Common Studio Setup Templates
 *
 * Pre-configured lighting setups for common scenarios
 */
export const STUDIO_TEMPLATES = {
  // PLACEHOLDER - Will be populated in future update
  // Examples:
  // '3-point-lighting': { name: '3-Point Lighting', description: 'Classic portrait setup' },
  // 'clamshell': { name: 'Clamshell Lighting', description: 'Beauty/fashion setup' },
  // 'rembrandt': { name: 'Rembrandt Lighting', description: 'Dramatic portrait' },
};
