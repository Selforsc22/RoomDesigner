import React, { useState } from 'react';
import type { ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, Design, User, FurnitureType, WallObjectType, RoomSection } from '../../types';
import { FURNITURE_TYPES, WALL_OBJECT_TYPES } from '../../config/furnitureConfig';
import type { LightingPreset } from '../../config/lightingPresets';
import SectionManager from '../RoomSections/SectionManager';
import LightingPresets from '../Lighting/LightingPresets';
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
  onApplyLightingPreset: (preset: LightingPreset) => void;
  designs: Design[];
  currentDesignId: string;
  onDesignSelect: (id: string) => void;
  onNewDesign: () => void;
  onDeleteDesign: (id: string) => void;
  user: User | null;
  onLogout: () => void;
  roomSections?: RoomSection[];
  onUpdateRoomSection?: (sectionId: string, updates: Partial<RoomSection>) => void;
  onAddRoomSection?: () => void;
  onDeleteRoomSection?: (sectionId: string) => void;
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
  onApplyLightingPreset,
  designs,
  currentDesignId,
  onDesignSelect,
  onNewDesign,
  onDeleteDesign,
  user,
  onLogout,
  roomSections,
  onUpdateRoomSection,
  onAddRoomSection,
  onDeleteRoomSection,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['furniture']));
  const [searchQuery, setSearchQuery] = useState('');
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter furniture by search query
  const filteredFurniture = FURNITURE_TYPES.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  // Group furniture by category
  const furnitureByCategory = filteredFurniture.reduce((acc, item) => {
    const category = item.category || 'furniture';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, FurnitureType[]>);

  const categoryLabels: Record<string, { name: string; icon: string }> = {
    furniture: { name: 'Furniture', icon: 'Armchair' },
    lighting: { name: 'Studio Lighting', icon: 'Lightbulb' },
    camera: { name: 'Camera Equipment', icon: 'Camera' },
    backdrop: { name: 'Backdrops', icon: 'Image' },
  };

  // Helper function to get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const handleAddFurniture = (furnitureType: FurnitureType) => {
    // Add random offset to prevent exact overlap
    const randomOffset = () => Math.random() * 2;

    // Calculate spawn position - use first section center if available
    let spawnX = 3 + randomOffset();
    let spawnY = 3 + randomOffset();

    if (roomSections && roomSections.length > 0) {
      const firstSection = roomSections[0];
      // Spawn in center of first section with offset
      spawnX = firstSection.x + firstSection.width / 2 - furnitureType.width / 2 + randomOffset();
      spawnY = firstSection.y + firstSection.height / 2 - furnitureType.height / 2 + randomOffset();

      // Ensure within section bounds
      spawnX = Math.max(firstSection.x, Math.min(firstSection.x + firstSection.width - furnitureType.width, spawnX));
      spawnY = Math.max(firstSection.y, Math.min(firstSection.y + firstSection.height - furnitureType.height, spawnY));
    }

    const furniture: FurnitureItem = {
      id: generateId(),
      type: furnitureType.type,
      name: furnitureType.name,
      x: spawnX,
      y: spawnY,
      width: furnitureType.width,
      height: furnitureType.height,
      rotation: 0,
      color: furnitureType.color,
      // Copy lighting properties if this is a light
      ...(furnitureType.isLight && {
        isLight: true,
        lightIntensity: furnitureType.defaultIntensity,
        colorTemperature: furnitureType.defaultColorTemp,
        beamAngle: furnitureType.defaultBeamAngle,
        lightDirection: 0,
        zHeight: furnitureType.defaultZHeight,
      }),
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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-surface-raised border-r border-line-subtle text-ink scrollbar-matte overflow-y-auto flex flex-col transition-all duration-300`}>
      {/* Header with Toggle */}
      <div className="p-4 border-b border-line-subtle flex items-center justify-between bg-gradient-to-b from-surface-raised to-surface-base">
        {!isCollapsed && <h1 className="text-xl font-bold text-ink">Room Planner</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="icon-btn-glossy"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5"
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
      <div className="p-4 border-b border-line-subtle">
        {isCollapsed ? (
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onViewModeChange('room')}
              className={viewMode === 'room' ? 'btn-glossy btn-glossy-primary py-2 px-2 text-xs' : 'icon-btn-glossy py-2 px-2 text-xs'}
              title="Room View"
            >
              R
            </button>
            <button
              onClick={() => onViewModeChange('wall')}
              className={viewMode === 'wall' ? 'btn-glossy btn-glossy-primary py-2 px-2 text-xs' : 'icon-btn-glossy py-2 px-2 text-xs'}
              title="Wall View"
            >
              W
            </button>
          </div>
        ) : (
          <div className="flex gap-2 p-1 rounded-lg bg-surface-overlay">
            <button
              onClick={() => onViewModeChange('room')}
              className={`flex-1 py-2.5 px-4 font-semibold text-sm ${
                viewMode === 'room'
                  ? 'btn-glossy btn-glossy-primary'
                  : 'icon-btn-glossy'
              }`}
            >
              Room
            </button>
            <button
              onClick={() => onViewModeChange('wall')}
              className={`flex-1 py-2.5 px-4 font-semibold text-sm ${
                viewMode === 'wall'
                  ? 'btn-glossy btn-glossy-primary'
                  : 'icon-btn-glossy'
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
            {/* Lighting Presets */}
            <LightingPresets onApplyPreset={onApplyLightingPreset} />

            {/* Search Bar */}
            <div className="p-4 border-b border-line-subtle">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface-overlay border border-line-medium rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                  {getIcon('Search')}
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    {getIcon('X')}
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-xs text-ink-muted">
                  Found {filteredFurniture.length} item{filteredFurniture.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Furniture Library - Organized by Category */}
            <div className="border-b border-line-subtle">
              {Object.entries(furnitureByCategory).map(([category, items]) => {
                const categoryInfo = categoryLabels[category] || { name: category, icon: 'Box' };
                const isExpanded = expandedCategories.has(category);

                return (
                  <div key={category} className="border-b border-line-subtle last:border-b-0">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full p-4 flex items-center justify-between text-ink hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getIcon(categoryInfo.icon)}
                        <h2 className="font-bold text-xs uppercase tracking-wider text-ink">
                          {categoryInfo.name}
                        </h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-hover border border-line-medium text-ink-secondary">{items.length}</span>
                      </div>
                      {getIcon(isExpanded ? 'ChevronDown' : 'ChevronRight')}
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2">
                        {items.map((furnitureType) => (
                          <button
                            key={furnitureType.type}
                            onClick={() => handleAddFurniture(furnitureType)}
                            className="w-full flex items-center gap-3 text-sm p-2.5 bg-surface-overlay border border-line-subtle rounded-lg hover:bg-surface-hover hover:border-line-medium hover:shadow-md transition-all"
                            title={`Add ${furnitureType.name} (${furnitureType.width}' × ${furnitureType.height}'${furnitureType.isLight ? ' - Light source' : ''})`}
                          >
                            <span className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover text-ink-secondary shrink-0">
                              {getIcon(furnitureType.icon)}
                            </span>
                            <div className="flex-1 text-left min-w-0">
                              <span className="font-medium block text-ink truncate">{furnitureType.name}</span>
                              {furnitureType.isLight && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-ink mt-1 inline-block">Light</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Door and Window */}
            <div className="p-4 border-b border-line-subtle">
              <h2 className="font-bold mb-3 text-xs uppercase tracking-wider text-ink">Add Elements</h2>
              <div className="space-y-2">
                <button
                  onClick={handleAddDoor}
                  className="w-full flex items-center gap-3 text-sm p-2.5 bg-surface-overlay border border-line-subtle rounded-lg hover:bg-surface-hover hover:border-line-medium hover:shadow-md transition-all"
                  title="Add Door (3' wide)"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover text-ink-secondary shrink-0">
                    {getIcon('DoorOpen')}
                  </span>
                  <span className="font-medium text-ink">Door</span>
                </button>
                <button
                  onClick={handleAddWindow}
                  className="w-full flex items-center gap-3 text-sm p-2.5 bg-surface-overlay border border-line-subtle rounded-lg hover:bg-surface-hover hover:border-line-medium hover:shadow-md transition-all"
                  title="Add Window (4' × 3')"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover text-ink-secondary shrink-0">
                    {getIcon('RectangleHorizontal')}
                  </span>
                  <span className="font-medium text-ink">Window</span>
                </button>
              </div>
            </div>

            {/* Room Sections Manager */}
            {roomSections && roomSections.length > 0 && onUpdateRoomSection && onAddRoomSection && onDeleteRoomSection && (
              <div className="p-4 border-b border-line-subtle">
                <SectionManager
                  sections={roomSections}
                  onUpdateSection={onUpdateRoomSection}
                  onAddSection={onAddRoomSection}
                  onDeleteSection={onDeleteRoomSection}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Wall Selector */}
            <div className="p-4 border-b border-line-subtle">
              <h2 className="font-bold text-ink mb-3 text-xs uppercase tracking-wider">Select Wall</h2>
              <div className="grid grid-cols-2 gap-2">
                {(['north', 'south', 'east', 'west'] as WallType[]).map((wall) => (
                  <button
                    key={wall}
                    onClick={() => onWallChange(wall)}
                    className={`py-2 px-4 font-medium capitalize ${
                      selectedWall === wall
                        ? 'btn-glossy btn-glossy-primary'
                        : 'icon-btn-glossy'
                    }`}
                  >
                    {wall}
                  </button>
                ))}
              </div>
            </div>

            {/* Wall Objects Library */}
            <div className="p-4 border-b border-line-subtle">
              <h2 className="font-bold text-ink mb-3 text-xs uppercase tracking-wider">Add Wall Objects</h2>
              <div className="space-y-2">
                {WALL_OBJECT_TYPES.map((wallObjectType) => (
                  <button
                    key={wallObjectType.type}
                    onClick={() => handleAddWallObject(wallObjectType)}
                    className="w-full flex items-center gap-3 text-sm p-2.5 bg-surface-overlay border border-line-subtle rounded-lg hover:bg-surface-hover hover:border-line-medium hover:shadow-md transition-all"
                    title={`Add ${wallObjectType.name} (${wallObjectType.width}' × ${wallObjectType.height}')`}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover text-ink-secondary shrink-0">
                      {getIcon(wallObjectType.icon)}
                    </span>
                    <span className="font-medium text-ink">{wallObjectType.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* My Designs */}
        <div className="p-4 border-b border-line-subtle">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink">My Designs</h2>
            <button
              onClick={onNewDesign}
              className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
            >
              + New
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-matte">
            {designs.map((design) => (
              <div
                key={design._id}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md group transition-colors ${
                  currentDesignId === design._id
                    ? 'bg-accent text-ink'
                    : 'text-ink-secondary hover:bg-surface-hover hover:text-ink'
                }`}
              >
                <button
                  onClick={() => onDesignSelect(design._id)}
                  className="flex-1 text-left truncate"
                >
                  {design.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${design.name}"?`)) {
                      onDeleteDesign(design._id);
                    }
                  }}
                  className={`p-1 rounded transition-colors ${
                    currentDesignId === design._id
                      ? 'text-ink hover:text-red-200 hover:bg-red-500/40'
                      : 'text-ink-muted hover:text-danger hover:bg-danger/15'
                  }`}
                  title="Delete design"
                >
                  <LucideIcons.Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* User Profile */}
      {!isCollapsed && <div className="p-4 border-t border-line-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-ink font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-ink">{user?.username}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Logout
          </button>
        </div>
      </div>}
    </div>
  );
};

export default LeftSidebar;
