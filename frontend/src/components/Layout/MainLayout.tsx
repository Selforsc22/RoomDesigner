import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Design, ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType } from '../../types';
import { designAPI } from '../../services/api';
import LeftSidebar from '../Sidebar/LeftSidebar';
import PropertiesPanel from '../Sidebar/PropertiesPanel';
import RoomCanvas from '../Canvas/RoomCanvas';
import WallCanvas from '../Canvas/WallCanvas';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('room');
  const [selectedWall, setSelectedWall] = useState<WallType>('north');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Load designs on mount
  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      console.log('MainLayout: Loading designs...');
      const token = localStorage.getItem('token');
      console.log('MainLayout: Token check', { hasToken: !!token });

      const data = await designAPI.getAll();
      console.log('MainLayout: Designs loaded', { count: data.length });
      setDesigns(data);
      if (data.length === 0) {
        // Create a new design if none exist
        createNewDesign();
      } else {
        setCurrentDesign(data[0]);
      }
    } catch (error: any) {
      console.error('Failed to load designs:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        hasToken: !!localStorage.getItem('token'),
      });
      // If 401, token might be missing or invalid
      if (error.response?.status === 401) {
        console.error('Authentication failed - no valid token');
      }
    }
  };

  const createNewDesign = async () => {
    try {
      const newDesign = await designAPI.create({
        name: 'Untitled Design',
        roomDimensions: { width: 15, height: 12 },
        furniture: [],
        wallObjects: [],
        doors: [],
        windows: [],
      });
      setDesigns([newDesign, ...designs]);
      setCurrentDesign(newDesign);
    } catch (error) {
      console.error('Failed to create design:', error);
    }
  };

  const saveDesign = async () => {
    if (!currentDesign) return;

    try {
      setSaveStatus('saving');
      await designAPI.update(currentDesign._id, currentDesign);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save design:', error);
      setSaveStatus('error');
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!currentDesign) return;

    const timer = setTimeout(() => {
      saveDesign();
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentDesign]);

  const updateRoomDimensions = (width: number, height: number) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      roomDimensions: { width, height },
    });
  };

  const addFurniture = (furniture: FurnitureItem) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      furniture: [...currentDesign.furniture, furniture],
    });
    setSelectedItemId(furniture.id);
  };

  const updateFurniture = (id: string, updates: Partial<FurnitureItem>) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      furniture: currentDesign.furniture.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteFurniture = (id: string) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      furniture: currentDesign.furniture.filter((item) => item.id !== id),
    });
    setSelectedItemId(null);
  };

  const addDoor = (door: Door) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      doors: [...currentDesign.doors, door],
    });
    setSelectedItemId(door.id);
  };

  const addWindow = (window: WindowType) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      windows: [...currentDesign.windows, window],
    });
    setSelectedItemId(window.id);
  };

  const addWallObject = (wallObject: WallObject) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      wallObjects: [...currentDesign.wallObjects, wallObject],
    });
    setSelectedItemId(wallObject.id);
  };

  const updateWallObject = (id: string, updates: Partial<WallObject>) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      wallObjects: currentDesign.wallObjects.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteWallObject = (id: string) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      wallObjects: currentDesign.wallObjects.filter((item) => item.id !== id),
    });
    setSelectedItemId(null);
  };

  const getSelectedItem = () => {
    if (!currentDesign || !selectedItemId) return null;

    const furniture = currentDesign.furniture.find((item) => item.id === selectedItemId);
    if (furniture) return { type: 'furniture', item: furniture };

    const wallObject = currentDesign.wallObjects.find((item) => item.id === selectedItemId);
    if (wallObject) return { type: 'wallObject', item: wallObject };

    const door = currentDesign.doors.find((item) => item.id === selectedItemId);
    if (door) return { type: 'door', item: door };

    const window = currentDesign.windows.find((item) => item.id === selectedItemId);
    if (window) return { type: 'window', item: window };

    return null;
  };

  if (!currentDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedWall={selectedWall}
        onWallChange={setSelectedWall}
        onAddFurniture={addFurniture}
        onAddDoor={addDoor}
        onAddWindow={addWindow}
        onAddWallObject={addWallObject}
        designs={designs}
        currentDesignId={currentDesign._id}
        onDesignSelect={(id) => {
          const design = designs.find((d) => d._id === id);
          if (design) setCurrentDesign(design);
        }}
        onNewDesign={createNewDesign}
        user={user}
        onLogout={logout}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={currentDesign.name}
              onChange={(e) =>
                setCurrentDesign({ ...currentDesign, name: e.target.value })
              }
              className="text-lg font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {viewMode === 'room' && (
              <>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Width:</label>
                  <input
                    type="number"
                    min="8"
                    max="100"
                    step="0.5"
                    value={currentDesign.roomDimensions.width}
                    onChange={(e) =>
                      updateRoomDimensions(
                        parseFloat(e.target.value),
                        currentDesign.roomDimensions.height
                      )
                    }
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-600">ft</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Height:</label>
                  <input
                    type="number"
                    min="8"
                    max="100"
                    step="0.5"
                    value={currentDesign.roomDimensions.height}
                    onChange={(e) =>
                      updateRoomDimensions(
                        currentDesign.roomDimensions.width,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-gray-600">ft</span>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Show Grid</span>
                </label>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && 'Error saving'}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {viewMode === 'room' ? (
            <RoomCanvas
              roomDimensions={currentDesign.roomDimensions}
              furniture={currentDesign.furniture}
              doors={currentDesign.doors}
              windows={currentDesign.windows}
              showGrid={showGrid}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onUpdateFurniture={updateFurniture}
            />
          ) : (
            <WallCanvas
              wall={selectedWall}
              roomDimensions={currentDesign.roomDimensions}
              wallObjects={currentDesign.wallObjects.filter(
                (obj) => obj.wall === selectedWall
              )}
              doors={currentDesign.doors.filter((door) => door.wall === selectedWall)}
              windows={currentDesign.windows.filter(
                (window) => window.wall === selectedWall
              )}
              showGrid={showGrid}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onUpdateWallObject={updateWallObject}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <PropertiesPanel
        selectedItem={getSelectedItem()}
        onUpdate={(updates) => {
          const selected = getSelectedItem();
          if (!selected) return;

          if (selected.type === 'furniture') {
            updateFurniture(selected.item.id, updates);
          } else if (selected.type === 'wallObject') {
            updateWallObject(selected.item.id, updates);
          }
        }}
        onDelete={() => {
          const selected = getSelectedItem();
          if (!selected) return;

          if (selected.type === 'furniture') {
            deleteFurniture(selected.item.id);
          } else if (selected.type === 'wallObject') {
            deleteWallObject(selected.item.id);
          }
        }}
      />
    </div>
  );
};

export default MainLayout;
