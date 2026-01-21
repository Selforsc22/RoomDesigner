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

export interface Design {
  _id: string;
  userId: string;
  name: string;
  thumbnail?: string;
  roomDimensions: {
    width: number;
    height: number;
  };
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
}

export interface WallObjectType {
  type: string;
  name: string;
  width: number;
  height: number;
}
