import React, { useState } from 'react';
import type { ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, Design, User, FurnitureType, WallObjectType } from '../../types';
import { FURNITURE_TYPES, WALL_OBJECT_TYPES } from '../../config/furnitureConfig';
import * as LucideIcons from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper function to get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg overflow-y-auto flex flex-col transition-all duration-300`}>
      {/* Header with Toggle */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-white to-gray-50">
        {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">Room Planner</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 border-b border-gray-100">
        {isCollapsed ? (
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onViewModeChange('room')}
              className={`py-2 px-2 rounded-lg font-semibold text-xs transition-all ${
                viewMode === 'room'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Room View"
            >
              R
            </button>
            <button
              onClick={() => onViewModeChange('wall')}
              className={`py-2 px-2 rounded-lg font-semibold text-xs transition-all ${
                viewMode === 'wall'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Wall View"
            >
              W
            </button>
          </div>
        ) : (
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('room')}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                viewMode === 'room'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Room
            </button>
            <button
              onClick={() => onViewModeChange('wall')}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                viewMode === 'wall'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Wall
            </button>
          </div>
        )}
      </div>

      {/* Content based on view mode */}
      {!isCollapsed && <div className="flex-1 overflow-y-auto">
        {viewMode === 'room' ? (
          <>
            {/* Furniture Library */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Add Furniture</h2>
              <div className="space-y-1">
                {FURNITURE_TYPES.map((furnitureType) => (
                  <button
                    key={furnitureType.type}
                    onClick={() => handleAddFurniture(furnitureType)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 group"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {getIcon(furnitureType.icon)}
                    </span>
                    <span className="font-medium">{furnitureType.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Door and Window */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Add Elements</h2>
              <div className="space-y-1">
                <button
                  onClick={handleAddDoor}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {getIcon('DoorOpen')}
                  </span>
                  <span className="font-medium">Door</span>
                </button>
                <button
                  onClick={handleAddWindow}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {getIcon('RectangleHorizontal')}
                  </span>
                  <span className="font-medium">Window</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Wall Selector */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Select Wall</h2>
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
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Add Wall Objects</h2>
              <div className="space-y-1">
                {WALL_OBJECT_TYPES.map((wallObjectType) => (
                  <button
                    key={wallObjectType.type}
                    onClick={() => handleAddWallObject(wallObjectType)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 group"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {getIcon(wallObjectType.icon)}
                    </span>
                    <span className="font-medium">{wallObjectType.name}</span>
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
      </div>}

      {/* User Profile */}
      {!isCollapsed && <div className="p-4 border-t border-gray-200">
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
      </div>}
    </div>
  );
};

export default LeftSidebar;
