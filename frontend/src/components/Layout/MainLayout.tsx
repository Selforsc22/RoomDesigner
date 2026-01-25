import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Design, ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, RoomSection } from '../../types';
import { designAPI } from '../../services/api';
import LeftSidebar from '../Sidebar/LeftSidebar';
import PropertiesPanel from '../Sidebar/PropertiesPanel';
import RoomCanvas from '../Canvas/RoomCanvas';
import WallCanvas from '../Canvas/WallCanvas';
import { ZoomIn, ZoomOut, Undo, Redo, ChevronDown, HelpCircle } from 'lucide-react';
import { ROOM_TEMPLATES, instantiateTemplate, calculateBounds } from '../../config/roomTemplates';
import KeyboardShortcuts from '../Help/KeyboardShortcuts';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('room');
  const [selectedWall, setSelectedWall] = useState<WallType>('north');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<Design[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('simple');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

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

  const applyRoomTemplate = (templateId: string) => {
    if (!currentDesign) return;

    const template = ROOM_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setShowTemplateDropdown(false);

    if (templateId === 'simple') {
      // Simple room - use single roomDimensions, clear roomSections
      setCurrentDesign({
        ...currentDesign,
        roomSections: undefined,
        roomDimensions: { width: 20, height: 15 },
      });
    } else {
      // Multi-section room - instantiate template
      const sections = instantiateTemplate(template);
      const bounds = calculateBounds(sections);

      setCurrentDesign({
        ...currentDesign,
        roomSections: sections,
        roomDimensions: bounds, // Keep for backward compatibility
      });
    }
  };

  const updateRoomSection = (sectionId: string, updates: Partial<RoomSection>) => {
    if (!currentDesign || !currentDesign.roomSections) return;

    const updatedSections = currentDesign.roomSections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    const bounds = calculateBounds(updatedSections);

    setCurrentDesign({
      ...currentDesign,
      roomSections: updatedSections,
      roomDimensions: bounds,
    });
  };

  const addRoomSection = () => {
    if (!currentDesign) return;

    const newSection: RoomSection = {
      id: `section-${Date.now()}`,
      name: `Section ${(currentDesign.roomSections?.length || 0) + 1}`,
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    };

    const updatedSections = [...(currentDesign.roomSections || []), newSection];
    const bounds = calculateBounds(updatedSections);

    setCurrentDesign({
      ...currentDesign,
      roomSections: updatedSections,
      roomDimensions: bounds,
    });
  };

  const deleteRoomSection = (sectionId: string) => {
    if (!currentDesign || !currentDesign.roomSections) return;

    const updatedSections = currentDesign.roomSections.filter(s => s.id !== sectionId);

    if (updatedSections.length === 0) {
      // If all sections deleted, revert to simple room
      setCurrentDesign({
        ...currentDesign,
        roomSections: undefined,
        roomDimensions: { width: 20, height: 15 },
      });
      setSelectedTemplateId('simple');
    } else {
      const bounds = calculateBounds(updatedSections);
      setCurrentDesign({
        ...currentDesign,
        roomSections: updatedSections,
        roomDimensions: bounds,
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const saveToHistory = (design: Design) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(design)));
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && currentDesign) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentDesign(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && currentDesign) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentDesign(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  // Save to history when design changes (debounced)
  useEffect(() => {
    if (!currentDesign) return;
    const timer = setTimeout(() => {
      saveToHistory(currentDesign);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentDesign?.furniture, currentDesign?.wallObjects, currentDesign?.doors, currentDesign?.windows, currentDesign?.roomDimensions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }

      // Delete or Backspace: Delete selected item
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        e.preventDefault();
        const selected = getSelectedItem();
        if (!selected) return;
        if (selected.type === 'furniture') {
          deleteFurniture(selected.item.id);
        } else if (selected.type === 'wallObject') {
          deleteWallObject(selected.item.id);
        }
      }

      // Ctrl/Cmd + D: Duplicate selected item
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedItemId) {
        e.preventDefault();
        duplicateSelectedItem();
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedItemId(null);
      }

      // G: Toggle grid
      if (e.key === 'g' && viewMode === 'room') {
        e.preventDefault();
        setShowGrid(!showGrid);
      }

      // +/-: Zoom in/out
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      }

      // 0: Reset zoom
      if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }

      // ?: Show keyboard shortcuts
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, currentDesign, historyIndex, history, showGrid, viewMode]);

  const duplicateSelectedItem = () => {
    if (!currentDesign || !selectedItemId) return;

    const selected = getSelectedItem();
    if (!selected) return;

    if (selected.type === 'furniture') {
      const original = selected.item as FurnitureItem;
      const duplicate: FurnitureItem = {
        ...original,
        id: `${original.type}-${Date.now()}`,
        x: original.x + 1, // Offset slightly
        y: original.y + 1,
        name: `${original.name} (Copy)`,
      };
      addFurniture(duplicate);
    } else if (selected.type === 'wallObject') {
      const original = selected.item as WallObject;
      const duplicate: WallObject = {
        ...original,
        id: `${original.type}-${Date.now()}`,
        x: original.x + 1,
      };
      addWallObject(duplicate);
    }
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
        roomSections={currentDesign.roomSections}
        onUpdateRoomSection={updateRoomSection}
        onAddRoomSection={addRoomSection}
        onDeleteRoomSection={deleteRoomSection}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <input
              type="text"
              value={currentDesign.name}
              onChange={(e) =>
                setCurrentDesign({ ...currentDesign, name: e.target.value })
              }
              className="text-lg font-bold border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-primary px-2 py-1 focus:outline-none transition-all bg-transparent"
            />
            {viewMode === 'room' && (
              <>
                {/* Room Template Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {ROOM_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || 'Room Type'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showTemplateDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowTemplateDropdown(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                        {ROOM_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => applyRoomTemplate(template.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              selectedTemplateId === template.id ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{template.name}</span>
                              <span className="text-xs text-gray-500 mt-0.5">{template.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Width/Height controls - only show for simple room */}
                {!currentDesign.roomSections && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Width:</label>
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
                    className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    title="Set room width (8-100 feet)"
                  />
                  <span className="text-sm text-gray-500">ft</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-700">Height:</label>
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
                    className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    title="Set room height (8-100 feet)"
                  />
                  <span className="text-sm text-gray-500">ft</span>
                </div>
                  </>
                )}

                <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" title="Toggle grid overlay for precise positioning (G)">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Grid</span>
                </label>
                <div className="flex items-center gap-1 ml-4 border-l pl-4">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <Undo className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center gap-1 border-l pl-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors min-w-[3rem]"
                    title="Reset Zoom"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            {/* Room Measurements */}
            {viewMode === 'room' && (
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Total Area</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(currentDesign.roomDimensions.width * currentDesign.roomDimensions.height).toFixed(0)} sq ft
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-300" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Items</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentDesign.furniture.length + currentDesign.doors.length + currentDesign.windows.length}
                  </span>
                </div>
                {currentDesign.roomSections && currentDesign.roomSections.length > 0 && (
                  <>
                    <div className="h-8 w-px bg-gray-300" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Sections</span>
                      <span className="text-sm font-medium text-gray-900">
                        {currentDesign.roomSections.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Help Button */}
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>

            {/* Save Status */}
            <span className="text-sm text-gray-600">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '⚠ Error saving'}
            </span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {viewMode === 'room' ? (
            <RoomCanvas
              roomDimensions={currentDesign.roomDimensions}
              roomSections={currentDesign.roomSections}
              furniture={currentDesign.furniture}
              doors={currentDesign.doors}
              windows={currentDesign.windows}
              showGrid={showGrid}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onUpdateFurniture={updateFurniture}
              onUpdateRoomSection={updateRoomSection}
              zoom={zoom}
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

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};

export default MainLayout;
