import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Design, ViewMode, WallType, FurnitureItem, WallObject, Door, Window as WindowType, RoomSection, Wall } from '../../types';
import { designAPI } from '../../services/api';
import type { LightingPreset } from '../../config/lightingPresets';
import LeftSidebar from '../Sidebar/LeftSidebar';
import PropertiesPanel from '../Sidebar/PropertiesPanel';
import RoomCanvas from '../Canvas/RoomCanvas';
import WallCanvas from '../Canvas/WallCanvas';
import { ZoomIn, ZoomOut, Undo, Redo, ChevronDown, HelpCircle, Download, Trash2 } from 'lucide-react';
import { ROOM_TEMPLATES, instantiateTemplate, calculateBounds } from '../../config/roomTemplates';
import { getRoomDimensions } from '../../utils/design';
import { Z } from '../../constants/layers';

// Dialogs load on first open, not in the main bundle
const KeyboardShortcuts = React.lazy(() => import('../Help/KeyboardShortcuts'));
const ExportDialog = React.lazy(() => import('../Export/ExportDialog'));
import WallDrawingToolbar, { type WallDrawingMode } from '../WallDrawing/WallDrawingToolbar';
import { DEFAULT_DOOR_WIDTH, DEFAULT_WINDOW_WIDTH } from '../WallDrawing/WallRenderer';
import Compass from '../Canvas/Compass';
import {
  convertRectangleToWalls,
  convertLegacyDoorToWallMode,
  convertLegacyWindowToWallMode,
  calculateFloorPlanBounds,
} from '../../utils/wallGeometry';

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
  // Custom-walls mode state
  const [wallDrawingMode, setWallDrawingMode] = useState<WallDrawingMode>('select');
  const [wallThickness, setWallThickness] = useState(0.5);
  const [wallSnapToGrid, setWallSnapToGrid] = useState(true);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [openingPlacement, setOpeningPlacement] = useState<'door' | 'window' | null>(null);
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [finishRequestId, setFinishRequestId] = useState(0);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
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
      isTimeTravelRef.current = true;
      setHistoryIndex(newIndex);
      setCurrentDesign(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && currentDesign) {
      const newIndex = historyIndex + 1;
      isTimeTravelRef.current = true;
      setHistoryIndex(newIndex);
      setCurrentDesign(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  // Save to history when design changes (debounced). Undo/redo set this flag
  // so restoring an old state doesn't re-record it and truncate the redo tail.
  const isTimeTravelRef = useRef(false);
  useEffect(() => {
    if (!currentDesign) return;
    if (isTimeTravelRef.current) {
      isTimeTravelRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveToHistory(currentDesign);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentDesign?.furniture,
    currentDesign?.wallObjects,
    currentDesign?.doors,
    currentDesign?.windows,
    currentDesign?.roomDimensions,
    currentDesign?.roomSections,
    currentDesign?.floorPlan,
    currentDesign?.northAngle,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Z: Undo (e.key is 'Z' when Shift is held, so normalize)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')
      ) {
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
        } else if (selected.type === 'door') {
          deleteDoor(selected.item.id);
        } else if (selected.type === 'window') {
          deleteWindow(selected.item.id);
        }
      }

      // Ctrl/Cmd + D: Duplicate selected item
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedItemId) {
        e.preventDefault();
        duplicateSelectedItem();
      }

      // Escape: cancel opening placement first, otherwise deselect
      if (e.key === 'Escape') {
        if (openingPlacement) {
          setOpeningPlacement(null);
        } else {
          setSelectedItemId(null);
        }
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
  }, [selectedItemId, currentDesign, historyIndex, history, showGrid, viewMode, openingPlacement]);

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
    // In custom-walls mode, adding a door enters click-to-place mode instead
    if (currentDesign.floorPlan) {
      setOpeningPlacement('door');
      return;
    }
    setCurrentDesign({
      ...currentDesign,
      doors: [...currentDesign.doors, door],
    });
    setSelectedItemId(door.id);
  };

  const addWindow = (window: WindowType) => {
    if (!currentDesign) return;
    if (currentDesign.floorPlan) {
      setOpeningPlacement('window');
      return;
    }
    setCurrentDesign({
      ...currentDesign,
      windows: [...currentDesign.windows, window],
    });
    setSelectedItemId(window.id);
  };

  const placeOpening = (type: 'door' | 'window', wallId: string, position: number) => {
    if (!currentDesign) return;
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (type === 'door') {
      setCurrentDesign({
        ...currentDesign,
        doors: [...currentDesign.doors, { id, wallId, position, width: DEFAULT_DOOR_WIDTH }],
      });
    } else {
      setCurrentDesign({
        ...currentDesign,
        windows: [
          ...currentDesign.windows,
          { id, wallId, position, width: DEFAULT_WINDOW_WIDTH, height: 3, heightFromFloor: 3 },
        ],
      });
    }
    setOpeningPlacement(null);
    setSelectedItemId(id);
  };

  const updateDoor = (id: string, updates: Partial<Door>) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      doors: currentDesign.doors.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    });
  };

  const updateWindow = (id: string, updates: Partial<WindowType>) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      windows: currentDesign.windows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    });
  };

  const deleteDoor = (id: string) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      doors: currentDesign.doors.filter((d) => d.id !== id),
    });
    setSelectedItemId(null);
  };

  const deleteWindow = (id: string) => {
    if (!currentDesign) return;
    setCurrentDesign({
      ...currentDesign,
      windows: currentDesign.windows.filter((w) => w.id !== id),
    });
    setSelectedItemId(null);
  };

  // --- Custom walls -------------------------------------------------------

  const addWall = (wall: Omit<Wall, 'id'>) => {
    if (!currentDesign?.floorPlan) return;
    const newWall: Wall = {
      ...wall,
      id: `wall-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    const walls = [...currentDesign.floorPlan.walls, newWall];
    setCurrentDesign({
      ...currentDesign,
      floorPlan: {
        ...currentDesign.floorPlan,
        walls,
        bounds: calculateFloorPlanBounds(walls),
      },
    });
  };

  const updateWall = (id: string, updates: Partial<Wall>) => {
    if (!currentDesign?.floorPlan) return;
    const walls = currentDesign.floorPlan.walls.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    setCurrentDesign({
      ...currentDesign,
      floorPlan: {
        ...currentDesign.floorPlan,
        walls,
        bounds: calculateFloorPlanBounds(walls),
      },
    });
  };

  const deleteWall = (id: string) => {
    if (!currentDesign?.floorPlan) return;
    const walls = currentDesign.floorPlan.walls.filter((w) => w.id !== id);
    setCurrentDesign({
      ...currentDesign,
      floorPlan: {
        ...currentDesign.floorPlan,
        walls,
        bounds: calculateFloorPlanBounds(walls),
      },
      // Openings on a deleted wall go with it
      doors: currentDesign.doors.filter((d) => d.wallId !== id),
      windows: currentDesign.windows.filter((w) => w.wallId !== id),
    });
    if (selectedWallId === id) setSelectedWallId(null);
  };

  const enterCustomWalls = async (asCopy: boolean) => {
    if (!currentDesign) return;
    const dims = getRoomDimensions(currentDesign);
    const floorPlan = convertRectangleToWalls(dims, wallThickness);
    const doors = currentDesign.doors.map((d) => convertLegacyDoorToWallMode(d, dims));
    const windows = currentDesign.windows.map((w) => convertLegacyWindowToWallMode(w, dims));
    const patch = {
      floorPlan,
      doors,
      windows,
      roomDimensions: dims,
      roomSections: undefined,
    };

    setShowConvertDialog(false);
    setWallDrawingMode('select');

    if (asCopy) {
      try {
        const copy = await designAPI.create({
          name: `${currentDesign.name} (walls)`,
          furniture: currentDesign.furniture,
          wallObjects: currentDesign.wallObjects,
          ...patch,
        });
        setDesigns((prev) => [copy, ...prev]);
        setCurrentDesign(copy);
      } catch (error) {
        console.error('Failed to create walls copy:', error);
        alert('Could not create a copy. Please try again.');
      }
    } else {
      setCurrentDesign({ ...currentDesign, ...patch });
    }
  };

  const exitCustomWalls = () => {
    if (!currentDesign?.floorPlan) return;
    const bounds = currentDesign.floorPlan.bounds;
    const confirmed = window.confirm(
      'Leave Custom Walls mode? Walls and wall-placed doors/windows will be removed.'
    );
    if (!confirmed) return;
    setCurrentDesign({
      ...currentDesign,
      floorPlan: undefined,
      roomDimensions: {
        width: Math.max(8, Math.ceil(bounds.maxX)),
        height: Math.max(8, Math.ceil(bounds.maxY)),
      },
      doors: currentDesign.doors.filter((d) => d.wall !== undefined && d.x !== undefined),
      windows: currentDesign.windows.filter((w) => w.wall !== undefined && w.x !== undefined),
    });
    setSelectedWallId(null);
    setOpeningPlacement(null);
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
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-xl text-ink-secondary">Loading...</div>
      </div>
    );
  }

  const roomDims = getRoomDimensions(currentDesign);
  const isCustomWalls = !!currentDesign.floorPlan;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
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
      {/* min-w-0 lets this column shrink below its content width; without it
          the toolbar forces the column under the properties panel */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-surface-raised border-b border-line-subtle shadow-sm px-6 py-4 flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-6 flex-wrap gap-y-2">
            <input
              type="text"
              value={currentDesign.name}
              onChange={(e) =>
                setCurrentDesign({ ...currentDesign, name: e.target.value })
              }
              className="text-lg font-bold text-ink bg-transparent border-0 border-b-2 border-transparent focus:border-accent px-2 py-1 focus:outline-none transition-colors"
            />
            {viewMode === 'room' && (
              <>
                {/* Room mode switcher: Simple / Sections / Custom Walls */}
                <div className="flex rounded-md overflow-hidden border border-line-medium divide-x divide-line-medium" title="Room mode">
                  <button
                    onClick={() => {
                      if (isCustomWalls) exitCustomWalls();
                      else if (currentDesign.roomSections) applyRoomTemplate('simple');
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      !isCustomWalls && !currentDesign.roomSections
                        ? 'bg-accent text-ink'
                        : 'bg-surface-overlay text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => {
                      if (isCustomWalls) {
                        exitCustomWalls();
                      }
                      setShowTemplateDropdown(true);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      !isCustomWalls && currentDesign.roomSections
                        ? 'bg-accent text-ink'
                        : 'bg-surface-overlay text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    Sections
                  </button>
                  <button
                    onClick={() => {
                      if (!isCustomWalls) setShowConvertDialog(true);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      isCustomWalls
                        ? 'bg-accent text-ink'
                        : 'bg-surface-overlay text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    Custom Walls
                  </button>
                </div>

                {/* Room Template Selector (rectangle modes only) */}
                {!isCustomWalls && (
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
                      <div className="absolute top-full left-0 mt-1 w-64 bg-surface-overlay rounded-lg shadow-xl border border-line-medium z-20 max-h-96 overflow-y-auto scrollbar-matte">
                        {ROOM_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => applyRoomTemplate(template.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-line-subtle last:border-b-0 ${
                              selectedTemplateId === template.id ? 'bg-accent/15' : ''
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-ink">{template.name}</span>
                              <span className="text-xs text-ink-muted mt-0.5">{template.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                )}

                {/* Width/Height controls - only show for simple room */}
                {!isCustomWalls && !currentDesign.roomSections && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-overlay">
                      <label className="text-sm font-medium text-ink-secondary">Width:</label>
                  <input
                    type="number"
                    min="8"
                    max="100"
                    step="0.5"
                    value={roomDims.width}
                    onChange={(e) =>
                      updateRoomDimensions(
                        parseFloat(e.target.value),
                        roomDims.height
                      )
                    }
                    className="w-16 px-2 py-1 text-sm font-medium bg-surface-hover border border-line-medium rounded-md text-ink focus:outline-none focus:border-accent transition-colors"
                    title="Set room width (8-100 feet)"
                  />
                  <span className="text-sm text-ink-muted">ft</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-overlay">
                  <label className="text-sm font-medium text-ink-secondary">Height:</label>
                  <input
                    type="number"
                    min="8"
                    max="100"
                    step="0.5"
                    value={roomDims.height}
                    onChange={(e) =>
                      updateRoomDimensions(
                        roomDims.width,
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-16 px-2 py-1 text-sm font-medium bg-surface-hover border border-line-medium rounded-md text-ink focus:outline-none focus:border-accent transition-colors"
                    title="Set room height (8-100 feet)"
                  />
                  <span className="text-sm text-ink-muted">ft</span>
                </div>
                  </>
                )}

                <label className="flex items-center gap-2 px-4 py-2 bg-surface-overlay rounded-lg cursor-pointer hover:bg-surface-hover transition-colors" title="Toggle grid overlay for precise positioning (G)">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm font-medium text-ink-secondary">Show Grid</span>
                </label>
                <div className="flex items-center gap-1 ml-4 pl-4 border-l border-line-subtle">
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
                <div className="flex items-center gap-1 pl-4 border-l border-line-subtle">
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
              <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-surface-overlay border border-line-medium">
                <div className="flex flex-col">
                  <span className="text-xs text-ink-muted">Total Area</span>
                  <span className="text-sm font-medium text-ink">
                    {(roomDims.width * roomDims.height).toFixed(0)} sq ft
                  </span>
                </div>
                <div className="h-8 w-px bg-line-medium" />
                <div className="flex flex-col">
                  <span className="text-xs text-ink-muted">Items</span>
                  <span className="text-sm font-medium text-ink">
                    {currentDesign.furniture.length + currentDesign.doors.length + currentDesign.windows.length}
                  </span>
                </div>
                {currentDesign.roomSections && currentDesign.roomSections.length > 0 && (
                  <>
                    <div className="h-8 w-px bg-line-medium" />
                    <div className="flex flex-col">
                      <span className="text-xs text-ink-muted">Sections</span>
                      <span className="text-sm font-medium text-ink">
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
              className="icon-btn-glossy"
              title="Export Design"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="icon-btn-glossy hover:!border-danger"
              title="Delete Current Design"
            >
              <Trash2 className="w-5 h-5 text-danger" />
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="icon-btn-glossy"
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Save Status */}
            <span className={`text-sm ${saveStatus === 'error' ? 'text-danger' : 'text-ink-muted'}`}>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '⚠ Error saving'}
            </span>
          </div>
        </div>

        {/* Wall drawing toolbar (custom-walls mode only) */}
        {viewMode === 'room' && isCustomWalls && (
          <WallDrawingToolbar
            mode={wallDrawingMode}
            onModeChange={(m) => {
              setWallDrawingMode(m);
              setOpeningPlacement(null);
            }}
            wallThickness={wallThickness}
            onWallThicknessChange={setWallThickness}
            snapToGrid={wallSnapToGrid}
            onSnapToGridChange={setWallSnapToGrid}
            isDrawing={isDrawingWall}
            onFinishDrawing={() => setFinishRequestId((n) => n + 1)}
          />
        )}

        {/* Canvas workspace: dark surround, the canvas itself is a light sheet.
            The ref wraps compass + canvas so exports include both. */}
        <div ref={canvasContainerRef} className="relative flex-1 min-h-0">
          <div className="h-full overflow-auto scrollbar-matte bg-gradient-to-br from-surface-base to-[#191b21]">
          {viewMode === 'room' ? (
            <RoomCanvas
              roomDimensions={roomDims}
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
              floorPlan={currentDesign.floorPlan ?? null}
              wallDrawingMode={wallDrawingMode}
              wallThickness={wallThickness}
              wallSnapToGrid={wallSnapToGrid}
              selectedWallId={selectedWallId}
              onSelectWall={setSelectedWallId}
              onAddWall={addWall}
              onUpdateWall={updateWall}
              onDeleteWall={deleteWall}
              openingPlacement={openingPlacement}
              onPlaceOpening={placeOpening}
              onDrawingStateChange={setIsDrawingWall}
              finishRequestId={finishRequestId}
            />
          ) : (
            <WallCanvas
              wall={selectedWall}
              roomDimensions={roomDims}
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

          {/* Compass (exported with the canvas) */}
          {viewMode === 'room' && (
            <div className="absolute top-4 right-4" style={{ zIndex: Z.OVERLAY_UI }}>
              <Compass
                northAngle={currentDesign.northAngle || 0}
                onAngleChange={(angle) =>
                  setCurrentDesign({ ...currentDesign, northAngle: angle })
                }
                editable
                size={80}
              />
            </div>
          )}

          {/* Opening placement hint */}
          {openingPlacement && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-surface-raised border border-accent text-sm text-ink shadow-xl"
              style={{ zIndex: Z.OVERLAY_UI }}
            >
              Click a wall to place the {openingPlacement}
              <span className="text-ink-muted"> — Esc to cancel</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <PropertiesPanel
        selectedItem={getSelectedItem()}
        walls={currentDesign.floorPlan?.walls}
        onUpdate={(updates) => {
          const selected = getSelectedItem();
          if (!selected) return;

          if (selected.type === 'furniture') {
            updateFurniture(selected.item.id, updates);
          } else if (selected.type === 'wallObject') {
            updateWallObject(selected.item.id, updates);
          } else if (selected.type === 'door') {
            updateDoor(selected.item.id, updates);
          } else if (selected.type === 'window') {
            updateWindow(selected.item.id, updates);
          }
        }}
        onDelete={() => {
          const selected = getSelectedItem();
          if (!selected) return;

          if (selected.type === 'furniture') {
            deleteFurniture(selected.item.id);
          } else if (selected.type === 'wallObject') {
            deleteWallObject(selected.item.id);
          } else if (selected.type === 'door') {
            deleteDoor(selected.item.id);
          } else if (selected.type === 'window') {
            deleteWindow(selected.item.id);
          }
        }}
      />

      {/* Keyboard Shortcuts Dialog (lazy) */}
      {showKeyboardShortcuts && (
        <React.Suspense fallback={null}>
          <KeyboardShortcuts
            isOpen={showKeyboardShortcuts}
            onClose={() => setShowKeyboardShortcuts(false)}
          />
        </React.Suspense>
      )}

      {/* Export Dialog (lazy) */}
      {showExportDialog && (
        <React.Suspense fallback={null}>
          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            onExport={handleExport}
            designName={currentDesign?.name || 'room-design'}
          />
        </React.Suspense>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          <div
            className="dialog-backdrop-enter fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: Z.MODAL }}
            onClick={() => setShowDeleteDialog(false)}
          />
          <div
            className="dialog-panel-enter fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-raised border border-line-medium rounded-xl shadow-2xl w-full max-w-md p-6"
            style={{ zIndex: Z.MODAL_PANEL }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-danger" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink mb-2">Delete Design</h3>
                <p className="text-sm text-ink-secondary mb-6">
                  Are you sure you want to delete <span className="font-semibold text-ink">"{currentDesign?.name || 'this design'}"</span>? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCurrentDesign}
                    className="btn-glossy btn-glossy-danger px-4 py-2 text-sm flex items-center gap-2"
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

      {/* Convert to Custom Walls Dialog */}
      {showConvertDialog && (
        <>
          <div
            className="dialog-backdrop-enter fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: Z.MODAL }}
            onClick={() => setShowConvertDialog(false)}
          />
          <div
            className="dialog-panel-enter fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-raised border border-line-medium rounded-xl shadow-2xl w-full max-w-md p-6"
            style={{ zIndex: Z.MODAL_PANEL }}
          >
            <h3 className="text-lg font-semibold text-ink mb-2">Convert to Custom Walls</h3>
            <p className="text-sm text-ink-secondary mb-2">
              Your {currentDesign.roomSections ? 'sections layout (as its bounding rectangle)' : 'room'} becomes
              four editable walls, and existing doors/windows move onto them. You can then draw
              walls at any angle.
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Conversion is one-way — converting a copy keeps this design untouched.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => enterCustomWalls(true)}
                className="btn-glossy btn-glossy-primary px-4 py-2.5 text-sm"
              >
                Convert a copy (recommended)
              </button>
              <button
                onClick={() => enterCustomWalls(false)}
                className="btn-glossy btn-glossy-neutral px-4 py-2.5 text-sm"
              >
                Convert this design
              </button>
              <button
                onClick={() => setShowConvertDialog(false)}
                className="px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-hover rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;
