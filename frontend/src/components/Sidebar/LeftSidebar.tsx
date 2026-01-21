import React from 'react';
import type { ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, Design, User, FurnitureType, WallObjectType } from '../../types';

interface LeftSidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedWall: WallType;
  onWallChange: (wall: WallType) => void;
  onAddFurniture: (furniture: FurnitureItem) => void;
  onAddDoor: (door: Door) => void;
  onAddWindow: (window: WindowType) => void;
  onAddWallObject: (wallObject: WallObject) => void;
  designs: Design[];
  currentDesignId: string;
  onDesignSelect: (id: string) => void;
  onNewDesign: () => void;
  user: User | null;
  onLogout: () => void;
}

const FURNITURE_TYPES: FurnitureType[] = [
  // Beds
  { type: 'twin-bed', name: 'Twin Bed', width: 3.2, height: 6.2, color: '#8B7355' },
  { type: 'full-bed', name: 'Full Bed', width: 4.5, height: 6.2, color: '#8B7355' },
  { type: 'queen-bed', name: 'Queen Bed', width: 5, height: 6.7, color: '#8B7355' },
  { type: 'king-bed', name: 'King Bed', width: 6.3, height: 6.7, color: '#8B7355' },
  // Seating
  { type: 'sofa', name: 'Sofa', width: 7, height: 3, color: '#4A5568' },
  { type: 'loveseat', name: 'Loveseat', width: 5, height: 3, color: '#4A5568' },
  { type: 'chair', name: 'Chair', width: 2, height: 2, color: '#4A5568' },
  // Tables
  { type: 'coffee-table', name: 'Coffee Table', width: 4, height: 2, color: '#6B4423' },
  { type: 'side-table', name: 'Side Table', width: 2, height: 2, color: '#6B4423' },
  { type: 'desk', name: 'Desk', width: 5, height: 2.5, color: '#6B4423' },
  // Storage
  { type: 'dresser', name: 'Dresser', width: 4, height: 1.5, color: '#5C4033' },
  { type: 'tv-stand', name: 'TV Stand', width: 5, height: 1.5, color: '#5C4033' },
  { type: 'bookshelf', name: 'Bookshelf', width: 3, height: 1, color: '#5C4033' },
  // Decor
  { type: 'lamp', name: 'Lamp', width: 1, height: 1, color: '#F59E0B' },
  { type: 'plant', name: 'Plant', width: 1.5, height: 1.5, color: '#10B981' },
  { type: 'rug', name: 'Rug', width: 8, height: 6, color: '#9CA3AF' },
];

const WALL_OBJECT_TYPES: WallObjectType[] = [
  { type: 'small-frame', name: 'Small Frame', width: 2, height: 2 },
  { type: 'medium-frame', name: 'Medium Frame', width: 3, height: 4 },
  { type: 'large-frame', name: 'Large Frame', width: 5, height: 4 },
  { type: 'mirror', name: 'Mirror', width: 3, height: 5 },
  { type: 'shelf', name: 'Shelf', width: 4, height: 0.5 },
  { type: 'clock', name: 'Clock', width: 2, height: 2 },
  { type: 'tv', name: 'TV', width: 5, height: 3 },
];

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  viewMode,
  onViewModeChange,
  selectedWall,
  onWallChange,
  onAddFurniture,
  onAddDoor,
  onAddWindow,
  onAddWallObject,
  designs,
  currentDesignId,
  onDesignSelect,
  onNewDesign,
  user,
  onLogout,
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddFurniture = (furnitureType: FurnitureType) => {
    const furniture: FurnitureItem = {
      id: generateId(),
      type: furnitureType.type,
      name: furnitureType.name,
      x: 5,
      y: 5,
      width: furnitureType.width,
      height: furnitureType.height,
      rotation: 0,
      color: furnitureType.color,
    };
    onAddFurniture(furniture);
  };

  const handleAddDoor = () => {
    const door: Door = {
      id: generateId(),
      wall: 'north',
      x: 5,
      width: 3,
    };
    onAddDoor(door);
  };

  const handleAddWindow = () => {
    const window: WindowType = {
      id: generateId(),
      wall: 'north',
      x: 5,
      y: 4,
      width: 4,
      height: 3,
    };
    onAddWindow(window);
  };

  const handleAddWallObject = (wallObjectType: WallObjectType) => {
    const wallObject: WallObject = {
      id: generateId(),
      type: wallObjectType.type,
      name: wallObjectType.name,
      wall: selectedWall,
      x: 5,
      y: 4,
      width: wallObjectType.width,
      height: wallObjectType.height,
    };
    onAddWallObject(wallObject);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Room & Wall Planner</h1>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewModeChange('room')}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              viewMode === 'room'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Room
          </button>
          <button
            onClick={() => onViewModeChange('wall')}
            className={`flex-1 py-2 px-4 rounded font-medium ${
              viewMode === 'wall'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wall
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'room' ? (
          <>
            {/* Furniture Library */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Add Furniture</h2>
              <div className="space-y-1">
                {FURNITURE_TYPES.map((furnitureType) => (
                  <button
                    key={furnitureType.type}
                    onClick={() => handleAddFurniture(furnitureType)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    {furnitureType.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Door and Window */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Add Elements</h2>
              <div className="space-y-1">
                <button
                  onClick={handleAddDoor}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Door
                </button>
                <button
                  onClick={handleAddWindow}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Window
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Wall Selector */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Select Wall</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['north', 'south', 'east', 'west'] as WallType[]).map((wall) => (
                  <button
                    key={wall}
                    onClick={() => onWallChange(wall)}
                    className={`py-2 px-4 rounded font-medium capitalize ${
                      selectedWall === wall
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {wall}
                  </button>
                ))}
              </div>
            </div>

            {/* Wall Objects Library */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Add Wall Objects</h2>
              <div className="space-y-1">
                {WALL_OBJECT_TYPES.map((wallObjectType) => (
                  <button
                    key={wallObjectType.type}
                    onClick={() => handleAddWallObject(wallObjectType)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    {wallObjectType.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* My Designs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">My Designs</h2>
            <button
              onClick={onNewDesign}
              className="text-sm text-primary hover:text-blue-600 font-medium"
            >
              + New
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {designs.map((design) => (
              <button
                key={design._id}
                onClick={() => onDesignSelect(design._id)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${
                  currentDesignId === design._id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {design.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900">{user?.username}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
