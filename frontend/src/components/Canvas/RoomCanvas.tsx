import React, { useRef } from 'react';
import type { FurnitureItem, Door, Window as WindowType, RoomSection, FloorPlan, Wall } from '../../types';
import { useItemDrag } from './hooks/useItemDrag';
import SectionsLayer from './layers/SectionsLayer';
import GridLayer from './layers/GridLayer';
import LegacyOpeningsLayer from './layers/LegacyOpeningsLayer';
import FurnitureLayer from './layers/FurnitureLayer';
import LightBeamLayer from './layers/LightBeamLayer';
import LightFixtureLayer from './layers/LightFixtureLayer';
import AmbientLightLayer from './layers/AmbientLightLayer';
import WallRenderer from '../WallDrawing/WallRenderer';
import type { WallDrawingMode } from '../WallDrawing/WallDrawingToolbar';

interface RoomCanvasProps {
  roomDimensions: { width: number; height: number };
  roomSections?: RoomSection[];
  furniture: FurnitureItem[];
  doors: Door[];
  windows: WindowType[];
  showGrid: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  onUpdateRoomSection?: (sectionId: string, updates: Partial<RoomSection>) => void;
  zoom?: number;
  // Custom-walls mode
  floorPlan?: FloorPlan | null;
  wallDrawingMode?: WallDrawingMode;
  wallThickness?: number;
  wallSnapToGrid?: boolean;
  selectedWallId?: string | null;
  onSelectWall?: (id: string | null) => void;
  onAddWall?: (wall: Omit<Wall, 'id'>) => void;
  onUpdateWall?: (id: string, updates: Partial<Wall>) => void;
  onDeleteWall?: (id: string) => void;
  openingPlacement?: 'door' | 'window' | null;
  onPlaceOpening?: (type: 'door' | 'window', wallId: string, position: number) => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  finishRequestId?: number;
}

const BASE_SCALE = 20; // pixels per foot

// Orchestrator only: sizes the sheet, owns the drag hook, composes layers.
// All rendering lives in ./layers/*; all math in utils/ (REVAMP A1/A4).
const RoomCanvas: React.FC<RoomCanvasProps> = ({
  roomDimensions,
  roomSections,
  furniture,
  doors,
  windows,
  showGrid,
  selectedItemId,
  onSelectItem,
  onUpdateFurniture,
  onUpdateRoomSection,
  zoom = 1,
  floorPlan = null,
  wallDrawingMode = 'select',
  wallThickness = 0.5,
  wallSnapToGrid = true,
  selectedWallId = null,
  onSelectWall,
  onAddWall,
  onUpdateWall,
  onDeleteWall,
  openingPlacement = null,
  onPlaceOpening,
  onDrawingStateChange,
  finishRequestId,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const SCALE = BASE_SCALE * zoom;
  const canvasWidth = roomDimensions.width * SCALE;
  const canvasHeight = roomDimensions.height * SCALE;

  const { draggingItem, hoveredItemId, setHoveredItemId, handleMouseDown } = useItemDrag({
    furniture,
    scale: SCALE,
    roomDimensions,
    roomSections,
    floorPlan,
    canvasRef,
    onUpdateFurniture,
    onSelectItem,
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectItem(null);
    }
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      {/* The floor plan is a light "sheet" sitting on the dark workspace
          (light beams read best against a paper-like floor) */}
      <div
        ref={canvasRef}
        className="relative bg-gray-50 rounded-lg shadow-2xl ring-1 ring-black/40"
        style={{ width: canvasWidth, height: canvasHeight }}
        onClick={handleCanvasClick}
      >
        <SectionsLayer
          roomSections={roomSections}
          roomDimensions={roomDimensions}
          scale={SCALE}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          canvasRef={canvasRef}
          onUpdateRoomSection={onUpdateRoomSection}
        />

        <GridLayer
          show={showGrid}
          roomDimensions={roomDimensions}
          roomSections={roomSections}
          scale={SCALE}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />

        <LegacyOpeningsLayer
          doors={doors}
          windows={windows}
          roomDimensions={roomDimensions}
          scale={SCALE}
        />

        <FurnitureLayer
          furniture={furniture}
          scale={SCALE}
          selectedItemId={selectedItemId}
          draggingItemId={draggingItem}
          hoveredItemId={hoveredItemId}
          onMouseDown={handleMouseDown}
          onHoverChange={setHoveredItemId}
        />

        {/* Custom walls with door/window openings */}
        {floorPlan && onSelectWall && onAddWall && onUpdateWall && onDeleteWall && onPlaceOpening && (
          <WallRenderer
            floorPlan={floorPlan}
            doors={doors}
            windows={windows}
            scale={SCALE}
            mode={wallDrawingMode}
            wallThickness={wallThickness}
            snapToGridEnabled={wallSnapToGrid}
            selectedWallId={selectedWallId}
            onSelectWall={onSelectWall}
            onUpdateWall={onUpdateWall}
            onDeleteWall={onDeleteWall}
            onAddWall={onAddWall}
            openingPlacement={openingPlacement}
            onPlaceOpening={onPlaceOpening}
            selectedItemId={selectedItemId}
            onSelectOpening={(id) => onSelectItem(id)}
            onDrawingStateChange={onDrawingStateChange}
            finishRequestId={finishRequestId}
          />
        )}

        {/* Light beams — geometry and falloff from utils/lighting */}
        <LightBeamLayer
          furniture={furniture}
          scale={SCALE}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          roomDims={roomDimensions}
        />

        {/* Light fixtures + drag-to-aim ring */}
        <LightFixtureLayer
          furniture={furniture}
          scale={SCALE}
          selectedItemId={selectedItemId}
          draggingItemId={draggingItem}
          onMouseDown={handleMouseDown}
          onHoverChange={setHoveredItemId}
          onRotate={(id, direction) => onUpdateFurniture(id, { lightDirection: direction })}
        />

        {/* Ambient color cast from active lights */}
        <AmbientLightLayer furniture={furniture} />
      </div>
    </div>
  );
};

export default RoomCanvas;
