import mongoose, { Document, Schema } from 'mongoose';

interface IFurnitureItem {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  zHeight?: number;
  // Studio lighting properties
  isLight?: boolean;
  lightIntensity?: number;
  colorTemperature?: number;
  beamAngle?: number;
  lightDirection?: number;
}

interface IWallObject {
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

interface IDoor {
  id: string;
  // Legacy wall-edge mode
  wall?: 'north' | 'south' | 'east' | 'west';
  x?: number;
  // Free-form wall mode
  wallId?: string;
  position?: number; // 0-1 along the wall
  width: number;
}

interface IWindow {
  id: string;
  // Legacy wall-edge mode
  wall?: 'north' | 'south' | 'east' | 'west';
  x?: number;
  y?: number;
  // Free-form wall mode
  wallId?: string;
  position?: number; // 0-1 along the wall
  heightFromFloor?: number;
  width: number;
  height: number;
}

interface IRoomSection {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connectedTo?: string[];
}

interface IWall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  type: 'exterior' | 'interior';
  connectedWalls?: string[];
}

interface IFloorPlan {
  id: string;
  walls: IWall[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface IDesign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  thumbnail?: string;
  roomDimensions?: {
    width: number;
    height: number;
  };
  roomSections?: IRoomSection[];
  floorPlan?: IFloorPlan;
  northAngle?: number;
  furniture: IFurnitureItem[];
  wallObjects: IWallObject[];
  doors: IDoor[];
  windows: IWindow[];
  sharedWith: mongoose.Types.ObjectId[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
  lastModified: Date;
}

const furnitureItemSchema = new Schema<IFurnitureItem>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    rotation: { type: Number, required: true, default: 0 },
    color: { type: String, required: true, default: '#8B7355' },
    zHeight: { type: Number },
    isLight: { type: Boolean },
    lightIntensity: { type: Number, min: 0, max: 100 },
    colorTemperature: { type: Number, min: 1000, max: 12000 },
    beamAngle: { type: Number, min: 5, max: 180 },
    lightDirection: { type: Number, min: 0, max: 360 },
  },
  { _id: false }
);

const wallObjectSchema = new Schema<IWallObject>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    wall: { type: String, required: true, enum: ['north', 'south', 'east', 'west'] },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const doorSchema = new Schema<IDoor>(
  {
    id: { type: String, required: true },
    // Legacy wall-edge mode (optional: wall-mode doors use wallId/position)
    wall: { type: String, enum: ['north', 'south', 'east', 'west'] },
    x: { type: Number },
    // Free-form wall mode
    wallId: { type: String },
    position: { type: Number, min: 0, max: 1 },
    width: { type: Number, required: true, default: 3 },
  },
  { _id: false }
);

const windowSchema = new Schema<IWindow>(
  {
    id: { type: String, required: true },
    // Legacy wall-edge mode (optional: wall-mode windows use wallId/position)
    wall: { type: String, enum: ['north', 'south', 'east', 'west'] },
    x: { type: Number },
    y: { type: Number },
    // Free-form wall mode
    wallId: { type: String },
    position: { type: Number, min: 0, max: 1 },
    heightFromFloor: { type: Number },
    width: { type: Number, required: true, default: 4 },
    height: { type: Number, required: true, default: 3 },
  },
  { _id: false }
);

const roomSectionSchema = new Schema<IRoomSection>(
  {
    id: { type: String, required: true },
    name: { type: String },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    connectedTo: [{ type: String }],
  },
  { _id: false }
);

const wallSchema = new Schema<IWall>(
  {
    id: { type: String, required: true },
    startX: { type: Number, required: true },
    startY: { type: Number, required: true },
    endX: { type: Number, required: true },
    endY: { type: Number, required: true },
    thickness: { type: Number, required: true, default: 0.5 },
    type: { type: String, required: true, enum: ['exterior', 'interior'], default: 'exterior' },
    connectedWalls: [{ type: String }],
  },
  { _id: false }
);

const floorPlanSchema = new Schema<IFloorPlan>(
  {
    id: { type: String, required: true },
    walls: [wallSchema],
    bounds: {
      minX: { type: Number, required: true },
      minY: { type: Number, required: true },
      maxX: { type: Number, required: true },
      maxY: { type: Number, required: true },
    },
  },
  { _id: false }
);

const designSchema = new Schema<IDesign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Untitled Design',
    },
    thumbnail: {
      type: String,
    },
    roomDimensions: {
      type: {
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
      default: { width: 15, height: 12 },
    },
    roomSections: { type: [roomSectionSchema], default: undefined },
    floorPlan: { type: floorPlanSchema, default: undefined },
    northAngle: { type: Number, min: 0, max: 360, default: 0 },
    furniture: [furnitureItemSchema],
    wallObjects: [wallObjectSchema],
    doors: [doorSchema],
    windows: [windowSchema],
    sharedWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDesign>('Design', designSchema);
