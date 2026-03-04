import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Design, ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, RoomSection } from '../../types';
import { designAPI } from '../../services/api';
import type { LightingPreset } from '../../config/lightingPresets';
import LeftSidebar from '../Sidebar/LeftSidebar';
import PropertiesPanel from '../Sidebar/PropertiesPanel';
import RoomCanvas from '../Canvas/RoomCanvas';
import WallCanvas from '../Canvas/WallCanvas';
import { ZoomIn, ZoomOut, Undo, Redo, ChevronDown, HelpCircle, Download, Trash2 } from 'lucide-react';
import { ROOM_TEMPLATES, instantiateTemplate, calculateBounds } from '../../config/roomTemplates';
import KeyboardShortcuts from '../Help/KeyboardShortcuts';
import ExportDialog from '../Export/ExportDialog';

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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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

  const deleteDesign = async (id: string) => {
    try {
      await designAPI.delete(id);
      const updatedDesigns = designs.filter(d => d._id !== id);
      setDesigns(updatedDesigns);

      // If we deleted the current design, switch to another one
      if (currentDesign?._id === id) {
        if (updatedDesigns.length > 0) {
          setCurrentDesign(updatedDesigns[0]);
        } else {
          // Create a new design if we deleted the last one
          createNewDesign();
        }
      }
    } catch (error) {
      console.error('Failed to delete design:', error);
      alert('Failed to delete design. Please try again.');
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

  const handleApplyLightingPreset = (preset: LightingPreset) => {
    if (!currentDesign) return;

    // Remove all existing lights from the design
    const nonLightFurniture = currentDesign.furniture.filter(item => !item.isLight);

    // Add preset lights with unique IDs
    const presetLights: FurnitureItem[] = preset.lights.map((light, index) => ({
      ...light,
      id: `${light.type}-${Date.now()}-${index}`,
    }));

    // Update design with non-light furniture plus preset lights
    setCurrentDesign({
      ...currentDesign,
      furniture: [...nonLightFurniture, ...presetLights],
    });

    // Select the first light from the preset
    if (presetLights.length > 0) {
      setSelectedItemId(presetLights[0].id);
    }
  };

  const handleExport = async (format: 'png' | 'jpeg', quality: number) => {
    if (!canvasContainerRef.current || !currentDesign) return;

    try {
      // Dynamically import html-to-image
      const htmlToImage = await import('html-to-image');

      const dataUrl = format === 'png'
        ? await htmlToImage.toPng(canvasContainerRef.current, { quality: 1.0, pixelRatio: 2 })
        : await htmlToImage.toJpeg(canvasContainerRef.current, { quality, pixelRatio: 2 });

      // Create download link
      const link = document.createElement('a');
      link.download = `${currentDesign.name || 'room-design'}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleDeleteCurrentDesign = async () => {
    if (!currentDesign) return;
    await deleteDesign(currentDesign._id);
    setShowDeleteDialog(false);
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
        onApplyLightingPreset={handleApplyLightingPreset}
        designs={designs}
        currentDesignId={currentDesign._id}
        onDesignSelect={(id) => {
          const design = designs.find((d) => d._id === id);
          if (design) setCurrentDesign(design);
        }}
        onNewDesign={createNewDesign}
        onDeleteDesign={deleteDesign}
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
        <div className="toolbar-matte px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <input
              type="text"
              value={currentDesign.name}
              onChange={(e) =>
                setCurrentDesign({ ...currentDesign, name: e.target.value })
              }
              className="text-lg font-bold border-0 border-b-2 border-transparent px-2 py-1 focus:outline-none transition-all bg-transparent"
              style={{ color: 'var(--text-primary)', borderBottomColor: 'transparent' }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
            />
            {viewMode === 'room' && (
              <>
                {/* Room Template Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="icon-btn-glossy flex items-center gap-2 px-4 py-2"
                  >
                    <span className="text-sm font-medium">
                      {ROOM_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || 'Room Type'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
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
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                      <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Width:</label>
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
                    className="input-matte w-16 px-2 py-1 text-sm font-medium"
                    title="Set room width (8-100 feet)"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>ft</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Height:</label>
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
                    className="input-matte w-16 px-2 py-1 text-sm font-medium"
                    title="Set room height (8-100 feet)"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>ft</span>
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
                <div className="flex items-center gap-1 ml-4 pl-4" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="icon-btn-glossy p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="icon-btn-glossy p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 pl-4" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={handleZoomOut}
                    className="icon-btn-glossy p-1.5"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="icon-btn-glossy px-2 py-1 text-xs font-medium min-w-[3rem]"
                    title="Reset Zoom"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="icon-btn-glossy p-1.5"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            {/* Room Measurements */}
            {viewMode === 'room' && (
              <div className="flex items-center gap-4 px-4 py-2 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
                <div className="flex flex-col">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total Area</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {(currentDesign.roomDimensions.width * currentDesign.roomDimensions.height).toFixed(0)} sq ft
                  </span>
                </div>
                <div className="h-8 w-px" style={{ background: 'var(--border-medium)' }} />
                <div className="flex flex-col">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Items</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
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

            {/* Export Button */}
            <button
              onClick={() => setShowExportDialog(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Design"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Current Design"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>

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
        <div ref={canvasContainerRef} className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
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

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        designName={currentDesign?.name || 'room-design'}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Design</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold">"{currentDesign?.name || 'this design'}"</span>? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCurrentDesign}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Design
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;
