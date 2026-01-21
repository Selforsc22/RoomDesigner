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
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  width: number;
}

interface IWindow {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IDesign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  thumbnail?: string;
  roomDimensions: {
    width: number;
    height: number;
  };
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
    wall: { type: String, required: true, enum: ['north', 'south', 'east', 'west'] },
    x: { type: Number, required: true },
    width: { type: Number, required: true, default: 3 },
  },
  { _id: false }
);

const windowSchema = new Schema<IWindow>(
  {
    id: { type: String, required: true },
    wall: { type: String, required: true, enum: ['north', 'south', 'east', 'west'] },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true, default: 4 },
    height: { type: Number, required: true, default: 3 },
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
      width: { type: Number, required: true, default: 15 },
      height: { type: Number, required: true, default: 12 },
    },
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
