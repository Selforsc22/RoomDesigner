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
  // ===== SOFTBOXES =====
  {
    type: 'softbox-small',
    name: 'Small Softbox',
    width: 1.5,
    height: 1.5,
    color: '#FFE6B3',
    icon: 'Square',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 70,
    defaultColorTemp: 5600,
    defaultBeamAngle: 80,
    defaultZHeight: 6,
  },
  {
    type: 'softbox-medium',
    name: 'Medium Softbox',
    width: 2.5,
    height: 2.5,
    color: '#FFD700',
    icon: 'Square',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 80,
    defaultColorTemp: 5600,
    defaultBeamAngle: 70,
    defaultZHeight: 6.5,
  },
  {
    type: 'softbox-large',
    name: 'Large Softbox',
    width: 3.5,
    height: 3.5,
    color: '#FFC700',
    icon: 'Square',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 90,
    defaultColorTemp: 5600,
    defaultBeamAngle: 60,
    defaultZHeight: 7,
  },
  {
    type: 'softbox-strip',
    name: 'Strip Softbox',
    width: 1,
    height: 4,
    color: '#FFE6B3',
    icon: 'RectangleVertical',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 75,
    defaultColorTemp: 5600,
    defaultBeamAngle: 90,
    defaultZHeight: 6,
  },

  // ===== UMBRELLA LIGHTS =====
  {
    type: 'umbrella-white',
    name: 'White Umbrella',
    width: 3,
    height: 3,
    color: '#F0F0F0',
    icon: 'Umbrella',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 75,
    defaultColorTemp: 5600,
    defaultBeamAngle: 100,
    defaultZHeight: 6,
  },
  {
    type: 'umbrella-silver',
    name: 'Silver Umbrella',
    width: 3,
    height: 3,
    color: '#C0C0C0',
    icon: 'Umbrella',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 85,
    defaultColorTemp: 5800,
    defaultBeamAngle: 90,
    defaultZHeight: 6,
  },

  // ===== RING LIGHTS =====
  {
    type: 'ring-light-small',
    name: 'Small Ring Light',
    width: 1.5,
    height: 1.5,
    color: '#FFE4B5',
    icon: 'Circle',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 65,
    defaultColorTemp: 5500,
    defaultBeamAngle: 100,
    defaultZHeight: 5,
  },
  {
    type: 'ring-light-large',
    name: 'Large Ring Light',
    width: 2,
    height: 2,
    color: '#FFD700',
    icon: 'Circle',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 75,
    defaultColorTemp: 5500,
    defaultBeamAngle: 110,
    defaultZHeight: 5.5,
  },

  // ===== LED PANELS =====
  {
    type: 'led-panel-small',
    name: 'Small LED Panel',
    width: 1,
    height: 0.7,
    color: '#FFE6D5',
    icon: 'RectangleHorizontal',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 60,
    defaultColorTemp: 5600,
    defaultBeamAngle: 110,
    defaultZHeight: 6,
  },
  {
    type: 'led-panel-medium',
    name: 'Medium LED Panel',
    width: 1.5,
    height: 1,
    color: '#FFDAB9',
    icon: 'RectangleHorizontal',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 70,
    defaultColorTemp: 5600,
    defaultBeamAngle: 100,
    defaultZHeight: 6,
  },

  // ===== STROBES & MONOLIGHTS =====
  {
    type: 'strobe-monolight',
    name: 'Studio Strobe',
    width: 1,
    height: 1,
    color: '#FF6347',
    icon: 'Zap',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 100,
    defaultColorTemp: 5500,
    defaultBeamAngle: 50,
    defaultZHeight: 6.5,
  },
  {
    type: 'speedlight',
    name: 'Speedlight Flash',
    width: 0.5,
    height: 0.5,
    color: '#FF4500',
    icon: 'Zap',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 80,
    defaultColorTemp: 5500,
    defaultBeamAngle: 35,
    defaultZHeight: 6,
  },

  // ===== SPECIALTY LIGHTS =====
  {
    type: 'beauty-dish',
    name: 'Beauty Dish',
    width: 2,
    height: 2,
    color: '#FFE4E1',
    icon: 'Circle',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 85,
    defaultColorTemp: 5600,
    defaultBeamAngle: 50,
    defaultZHeight: 6.5,
  },
  {
    type: 'spotlight',
    name: 'Spotlight',
    width: 1.2,
    height: 1.2,
    color: '#FFFF00',
    icon: 'Flashlight',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 95,
    defaultColorTemp: 3200,
    defaultBeamAngle: 25,
    defaultZHeight: 7,
  },
  {
    type: 'background-light',
    name: 'Background Light',
    width: 1,
    height: 1,
    color: '#E6E6FA',
    icon: 'Sun',
    category: 'lighting',
    isLight: true,
    defaultIntensity: 60,
    defaultColorTemp: 5600,
    defaultBeamAngle: 120,
    defaultZHeight: 4,
  },
];

/**
 * Camera Equipment Configuration
 *
 * Camera positions, tripods, and shooting positions
 */
export const CAMERA_EQUIPMENT_TYPES: FurnitureType[] = [
  {
    type: 'camera-tripod',
    name: 'Camera on Tripod',
    width: 1.5,
    height: 1.5,
    color: '#2C3E50',
    icon: 'Camera',
    category: 'camera',
    defaultZHeight: 5,
  },
  {
    type: 'camera-monopod',
    name: 'Camera on Monopod',
    width: 1,
    height: 1,
    color: '#34495E',
    icon: 'Camera',
    category: 'camera',
    defaultZHeight: 5,
  },
  {
    type: 'camera-handheld',
    name: 'Handheld Camera Position',
    width: 1.5,
    height: 1.5,
    color: '#455A64',
    icon: 'Camera',
    category: 'camera',
    defaultZHeight: 4.5,
  },
  {
    type: 'video-camera',
    name: 'Video Camera',
    width: 1.8,
    height: 1.8,
    color: '#37474F',
    icon: 'Video',
    category: 'camera',
    defaultZHeight: 5,
  },
];

/**
 * Backdrop & Background Configuration
 *
 * Backdrop stands, seamless paper rolls, and background options
 */
export const BACKDROP_TYPES: FurnitureType[] = [
  {
    type: 'backdrop-stand',
    name: 'Backdrop Stand',
    width: 10,
    height: 1.5,
    color: '#8B7355',
    icon: 'Maximize2',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'seamless-paper-white',
    name: 'White Seamless Paper',
    width: 9,
    height: 1,
    color: '#FFFFFF',
    icon: 'FileText',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'seamless-paper-black',
    name: 'Black Seamless Paper',
    width: 9,
    height: 1,
    color: '#000000',
    icon: 'FileText',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'seamless-paper-gray',
    name: 'Gray Seamless Paper',
    width: 9,
    height: 1,
    color: '#808080',
    icon: 'FileText',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'green-screen',
    name: 'Green Screen',
    width: 10,
    height: 1.5,
    color: '#00FF00',
    icon: 'Tv',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'blue-screen',
    name: 'Blue Screen',
    width: 10,
    height: 1.5,
    color: '#0000FF',
    icon: 'Tv',
    category: 'backdrop',
    defaultZHeight: 8,
  },
  {
    type: 'muslin-backdrop',
    name: 'Muslin Backdrop',
    width: 10,
    height: 1.5,
    color: '#DEB887',
    icon: 'Image',
    category: 'backdrop',
    defaultZHeight: 8,
  },
];

/**
 * Studio Modifiers & Accessories
 *
 * Reflectors, diffusers, flags, c-stands, etc.
 */
export const STUDIO_ACCESSORIES: FurnitureType[] = [
  {
    type: 'reflector-silver',
    name: 'Silver Reflector',
    width: 3,
    height: 2,
    color: '#C0C0C0',
    icon: 'Disc',
    category: 'lighting',
  },
  {
    type: 'reflector-gold',
    name: 'Gold Reflector',
    width: 3,
    height: 2,
    color: '#FFD700',
    icon: 'Disc',
    category: 'lighting',
  },
  {
    type: 'reflector-white',
    name: 'White Reflector',
    width: 3,
    height: 2,
    color: '#FFFFFF',
    icon: 'Disc',
    category: 'lighting',
  },
  {
    type: 'c-stand',
    name: 'C-Stand',
    width: 1.5,
    height: 1.5,
    color: '#2C3E50',
    icon: 'Anchor',
    category: 'lighting',
    defaultZHeight: 8,
  },
  {
    type: 'light-stand',
    name: 'Light Stand',
    width: 1.2,
    height: 1.2,
    color: '#34495E',
    icon: 'Move',
    category: 'lighting',
    defaultZHeight: 7,
  },
  {
    type: 'boom-arm',
    name: 'Boom Arm',
    width: 2,
    height: 1,
    color: '#455A64',
    icon: 'GitBranch',
    category: 'lighting',
    defaultZHeight: 8,
  },
  {
    type: 'flag-black',
    name: 'Black Flag',
    width: 2,
    height: 1.5,
    color: '#000000',
    icon: 'Flag',
    category: 'lighting',
    defaultZHeight: 6,
  },
  {
    type: 'diffusion-panel',
    name: 'Diffusion Panel',
    width: 4,
    height: 4,
    color: '#F5F5F5',
    icon: 'Grid',
    category: 'lighting',
    defaultZHeight: 7,
  },
  {
    type: 'subject-marker',
    name: 'Subject Position',
    width: 2,
    height: 2,
    color: '#FF69B4',
    icon: 'User',
    category: 'camera',
  },
  {
    type: 'prop-table',
    name: 'Prop Table',
    width: 4,
    height: 2,
    color: '#8B4513',
    icon: 'Square',
    category: 'furniture',
  },
  {
    type: 'makeup-station',
    name: 'Makeup Station',
    width: 4,
    height: 2,
    color: '#D2691E',
    icon: 'Palette',
    category: 'furniture',
  },
  {
    type: 'clothing-rack',
    name: 'Clothing Rack',
    width: 4,
    height: 1.5,
    color: '#A0522D',
    icon: 'Hanger',
    category: 'furniture',
  },
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
