export interface User {
  id: string;
  email: string;
  username: string;
}

export interface FurnitureItem {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  // Optional properties for future features
  zHeight?: number; // Height off ground in feet (for 3D positioning)
  // Lighting properties (for studio equipment)
  isLight?: boolean;
  lightIntensity?: number; // 0-100
  colorTemperature?: number; // Kelvin (3200-6500)
  beamAngle?: number; // Degrees (15-120)
  lightDirection?: number; // Angle in degrees (0-360)
}

export interface WallObject {
  id: string;
  type: string;
  name: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
}

export interface Door {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  width: number;
}

export interface Window {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomSection {
  id: string;
  name?: string; // Optional name like "Living Area", "Kitchen Nook", etc.
  x: number; // Position relative to overall floor plan origin
  y: number; // Position relative to overall floor plan origin
  width: number; // Width of this section in feet
  height: number; // Height of this section in feet
  // Future: Add connection metadata for rendering logic
  connectedTo?: string[]; // IDs of adjacent sections for rendering walls
}

export interface Design {
  _id: string;
  userId: string;
  name: string;
  thumbnail?: string;
  roomDimensions: {
    width: number;
    height: number;
  };
  // Optional: Support for complex room shapes (L, T, U, etc.)
  roomSections?: RoomSection[]; // When present, overrides single roomDimensions
  furniture: FurnitureItem[];
  wallObjects: WallObject[];
  doors: Door[];
  windows: Window[];
  createdAt: string;
  updatedAt: string;
  lastModified: string;
}

export type ViewMode = 'room' | 'wall';
export type WallType = 'north' | 'south' | 'east' | 'west';

export interface FurnitureType {
  type: string;
  name: string;
  width: number;
  height: number;
  color: string;
  icon?: string;
  category?: 'furniture' | 'lighting' | 'camera' | 'backdrop';
  // Default lighting properties (for studio equipment)
  isLight?: boolean;
  defaultIntensity?: number;
  defaultColorTemp?: number;
  defaultBeamAngle?: number;
  defaultZHeight?: number;
}

export interface WallObjectType {
  type: string;
  name: string;
  width: number;
  height: number;
  icon?: string;
}
