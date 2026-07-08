import React, { useState, useRef, useEffect } from 'react';
import type { Wall, FloorPlan, Door, Window } from '../../types';
import {
  getWallCorners,
  calculateWallLength,
  calculateWallSegments,
  getOpeningPosition,
  findNearestWallForOpening,
  findOpeningConflict,
  snapToGrid,
  snapToWallEndpoint,
  lerp,
  type WallOpening,
} from '../../utils/wallGeometry';
import { Z } from '../../constants/layers';
import type { WallDrawingMode } from './WallDrawingToolbar';

export const DEFAULT_DOOR_WIDTH = 3;
export const DEFAULT_WINDOW_WIDTH = 4;

interface WallRendererProps {
  floorPlan: FloorPlan | null;
  doors: Door[];
  windows: Window[];
  scale: number; // pixels per foot (zoom-adjusted)
  mode: WallDrawingMode;
  wallThickness: number;
  snapToGridEnabled: boolean;
  selectedWallId: string | null;
  onSelectWall: (id: string | null) => void;
  onUpdateWall: (id: string, updates: Partial<Wall>) => void;
  onDeleteWall: (id: string) => void;
  onAddWall: (wall: Omit<Wall, 'id'>) => void;
  // Click-to-place doors/windows
  openingPlacement: 'door' | 'window' | null;
  onPlaceOpening: (type: 'door' | 'window', wallId: string, position: number) => void;
  // Opening selection (fine-tuning via properties panel)
  selectedItemId: string | null;
  onSelectOpening: (id: string) => void;
  // Chained drawing coordination with the toolbar
  onDrawingStateChange?: (isDrawing: boolean) => void;
  finishRequestId?: number;
}

const WallRenderer: React.FC<WallRendererProps> = ({
  floorPlan,
  doors,
  windows,
  scale,
  mode,
  wallThickness,
  snapToGridEnabled,
  selectedWallId,
  onSelectWall,
  onUpdateWall,
  onDeleteWall,
  onAddWall,
  openingPlacement,
  onPlaceOpening,
  selectedItemId,
  onSelectOpening,
  onDrawingStateChange,
  finishRequestId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawingWallStart, setDrawingWallStart] = useState<{ x: number; y: number } | null>(null);
  const [tempWallEnd, setTempWallEnd] = useState<{ x: number; y: number } | null>(null);
  const [draggingEndpoint, setDraggingEndpoint] = useState<{
    wallId: string;
    endpoint: 'start' | 'end';
  } | null>(null);
  const [ghost, setGhost] = useState<{ wallId: string; position: number } | null>(null);
  const [conflictId, setConflictId] = useState<string | null>(null);

  const walls = floorPlan?.walls ?? [];

  // Report drawing state so the toolbar can show its Finish button
  useEffect(() => {
    onDrawingStateChange?.(drawingWallStart !== null);
  }, [drawingWallStart, onDrawingStateChange]);

  // Toolbar "Finish Wall" ends the current chain
  useEffect(() => {
    setDrawingWallStart(null);
    setTempWallEnd(null);
  }, [finishRequestId]);

  // Escape ends the drawing chain
  useEffect(() => {
    if (!drawingWallStart) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawingWallStart(null);
        setTempWallEnd(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawingWallStart]);

  // Leave draw mode -> drop any in-progress chain
  useEffect(() => {
    if (mode !== 'draw') {
      setDrawingWallStart(null);
      setTempWallEnd(null);
    }
  }, [mode]);

  if (!floorPlan) return null;

  // Mouse position in floor-plan feet, with snapping
  const getMousePosition = (e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    let x = (e.clientX - rect.left) / scale;
    let y = (e.clientY - rect.top) / scale;

    if (snapToGridEnabled) {
      x = snapToGrid(x, 0.5);
      y = snapToGrid(y, 0.5);
    }

    return snapToWallEndpoint({ x, y }, walls, 0.5);
  };

  const rawMousePosition = (e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const openingsOnWall = (wallId: string) =>
    [
      ...doors
        .filter((d) => d.wallId === wallId && d.position !== undefined)
        .map((d) => ({ id: d.id, position: d.position as number, width: d.width })),
      ...windows
        .filter((w) => w.wallId === wallId && w.position !== undefined)
        .map((w) => ({ id: w.id, position: w.position as number, width: w.width })),
    ];

  const handleSvgClick = (e: React.MouseEvent) => {
    // Placement mode wins over drawing
    if (openingPlacement && ghost) {
      const wall = walls.find((w) => w.id === ghost.wallId);
      if (!wall) return;
      const width = openingPlacement === 'door' ? DEFAULT_DOOR_WIDTH : DEFAULT_WINDOW_WIDTH;
      const conflict = findOpeningConflict(wall, ghost.position, width, openingsOnWall(wall.id));
      if (conflict) {
        // Flash the conflicting opening red (user-triggered, one-shot)
        setConflictId(conflict);
        window.setTimeout(() => setConflictId(null), 600);
        return;
      }
      onPlaceOpening(openingPlacement, ghost.wallId, ghost.position);
      setGhost(null);
      return;
    }

    if (mode === 'draw') {
      const pos = getMousePosition(e);

      if (!drawingWallStart) {
        setDrawingWallStart(pos);
        setTempWallEnd(pos);
      } else if (
        Math.abs(pos.x - drawingWallStart.x) > 0.1 ||
        Math.abs(pos.y - drawingWallStart.y) > 0.1
      ) {
        onAddWall({
          startX: drawingWallStart.x,
          startY: drawingWallStart.y,
          endX: pos.x,
          endY: pos.y,
          thickness: wallThickness,
          type: 'exterior',
        });
        // Chain: the end of this wall starts the next one
        setDrawingWallStart(pos);
        setTempWallEnd(pos);
      }
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (openingPlacement) {
      const width = openingPlacement === 'door' ? DEFAULT_DOOR_WIDTH : DEFAULT_WINDOW_WIDTH;
      const hit = findNearestWallForOpening(rawMousePosition(e), walls, width);
      setGhost(hit ? { wallId: hit.wall.id, position: hit.position } : null);
      return;
    }
    if (mode === 'draw' && drawingWallStart) {
      setTempWallEnd(getMousePosition(e));
    }
  };

  const handleWallClick = (e: React.MouseEvent, wallId: string) => {
    if (openingPlacement) return; // svg-level click handles placement
    e.stopPropagation();
    if (mode === 'select' || mode === 'edit') {
      onSelectWall(wallId);
    } else if (mode === 'delete') {
      onDeleteWall(wallId);
    }
  };

  const handleEndpointMouseDown = (
    e: React.MouseEvent,
    wallId: string,
    endpoint: 'start' | 'end'
  ) => {
    e.stopPropagation();
    if (mode !== 'edit') return;
    setDraggingEndpoint({ wallId, endpoint });
  };

  // Endpoint dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingEndpoint || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      let x = (e.clientX - rect.left) / scale;
      let y = (e.clientY - rect.top) / scale;

      if (snapToGridEnabled) {
        x = snapToGrid(x, 0.5);
        y = snapToGrid(y, 0.5);
      }
      const otherWalls = walls.filter((w) => w.id !== draggingEndpoint.wallId);
      const snapped = snapToWallEndpoint({ x, y }, otherWalls, 0.5);

      if (draggingEndpoint.endpoint === 'start') {
        onUpdateWall(draggingEndpoint.wallId, { startX: snapped.x, startY: snapped.y });
      } else {
        onUpdateWall(draggingEndpoint.wallId, { endX: snapped.x, endY: snapped.y });
      }
    };

    const handleMouseUp = () => setDraggingEndpoint(null);

    if (draggingEndpoint) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingEndpoint, scale, snapToGridEnabled, walls, onUpdateWall]);

  // The svg root only swallows pointer events when a whole-canvas
  // interaction is active (drawing / placing); otherwise individual wall
  // elements opt in so furniture beneath stays interactive.
  const svgCatchesPointer = mode === 'draw' || openingPlacement !== null;

  const getWallOpenings = (wall: Wall): WallOpening[] => {
    const wallLength = calculateWallLength(wall);
    const openings: WallOpening[] = [];

    doors
      .filter((d) => d.wallId === wall.id && d.position !== undefined)
      .forEach((door) => {
        const half = door.width / 2 / wallLength;
        openings.push({
          id: door.id,
          type: 'door',
          startPos: Math.max(0, (door.position as number) - half),
          endPos: Math.min(1, (door.position as number) + half),
        });
      });

    windows
      .filter((w) => w.wallId === wall.id && w.position !== undefined)
      .forEach((win) => {
        const half = win.width / 2 / wallLength;
        openings.push({
          id: win.id,
          type: 'window',
          startPos: Math.max(0, (win.position as number) - half),
          endPos: Math.min(1, (win.position as number) + half),
        });
      });

    return openings;
  };

  const renderOpening = (
    wall: Wall,
    kind: 'door' | 'window',
    id: string,
    position: number,
    width: number,
    isGhost = false
  ) => {
    const pos = getOpeningPosition(wall, position);
    const isSelected = selectedItemId === id;
    const isConflict = conflictId === id;
    const strokeColor = isConflict ? '#EF4444' : isSelected ? '#6366F1' : kind === 'door' ? '#654321' : '#4682B4';

    if (kind === 'door') {
      return (
        <g key={isGhost ? 'ghost' : id} opacity={isGhost ? 0.5 : 1}>
          <rect
            x={(pos.centerX - width / 2) * scale}
            y={(pos.centerY - wall.thickness / 2) * scale}
            width={width * scale}
            height={wall.thickness * scale}
            fill={isConflict ? '#FCA5A5' : '#8B4513'}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2.5 : 1}
            transform={`rotate(${pos.angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
            style={isGhost ? undefined : { pointerEvents: 'auto', cursor: 'pointer' }}
            onClick={
              isGhost
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    onSelectOpening(id);
                  }
            }
          />
          {/* Door swing arc */}
          <path
            d={`
              M ${(pos.centerX + (width / 2) * Math.cos((pos.angle * Math.PI) / 180)) * scale}
                ${(pos.centerY + (width / 2) * Math.sin((pos.angle * Math.PI) / 180)) * scale}
              A ${width * scale} ${width * scale} 0 0 1
                ${(pos.centerX - (width / 2) * Math.cos((pos.angle * Math.PI) / 180) + width * Math.cos(((pos.angle + 90) * Math.PI) / 180)) * scale}
                ${(pos.centerY - (width / 2) * Math.sin((pos.angle * Math.PI) / 180) + width * Math.sin(((pos.angle + 90) * Math.PI) / 180)) * scale}
            `}
            stroke="#8B4513"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 3"
            opacity="0.6"
          />
        </g>
      );
    }

    return (
      <g key={isGhost ? 'ghost' : id} opacity={isGhost ? 0.5 : 1}>
        <rect
          x={(pos.centerX - width / 2) * scale}
          y={(pos.centerY - wall.thickness / 2) * scale}
          width={width * scale}
          height={wall.thickness * scale}
          fill={isConflict ? '#FCA5A5' : '#87CEEB'}
          stroke={strokeColor}
          strokeWidth={isSelected ? 2.5 : 2}
          transform={`rotate(${pos.angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
          opacity={isGhost ? 0.6 : 0.75}
          style={isGhost ? undefined : { pointerEvents: 'auto', cursor: 'pointer' }}
          onClick={
            isGhost
              ? undefined
              : (e) => {
                  e.stopPropagation();
                  onSelectOpening(id);
                }
          }
        />
        <line
          x1={pos.centerX * scale}
          y1={(pos.centerY - wall.thickness / 2) * scale}
          x2={pos.centerX * scale}
          y2={(pos.centerY + wall.thickness / 2) * scale}
          stroke="#4682B4"
          strokeWidth="1"
          transform={`rotate(${pos.angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
        />
      </g>
    );
  };

  const renderWallWithOpenings = (wall: Wall) => {
    const openings = getWallOpenings(wall);
    const segments = calculateWallSegments(openings);
    const corners = getWallCorners(wall);
    const isSelected = selectedWallId === wall.id;

    return (
      <g key={wall.id}>
        {segments.map((segment, idx) => {
          const t1 = segment.start;
          const t2 = segment.end;

          const segmentPath = [
            `M ${lerp(corners.topLeft.x, corners.topRight.x, t1) * scale} ${lerp(corners.topLeft.y, corners.topRight.y, t1) * scale}`,
            `L ${lerp(corners.topLeft.x, corners.topRight.x, t2) * scale} ${lerp(corners.topLeft.y, corners.topRight.y, t2) * scale}`,
            `L ${lerp(corners.bottomLeft.x, corners.bottomRight.x, t2) * scale} ${lerp(corners.bottomLeft.y, corners.bottomRight.y, t2) * scale}`,
            `L ${lerp(corners.bottomLeft.x, corners.bottomRight.x, t1) * scale} ${lerp(corners.bottomLeft.y, corners.bottomRight.y, t1) * scale}`,
            'Z',
          ].join(' ');

          return (
            <path
              key={`segment-${idx}`}
              d={segmentPath}
              fill="url(#wall-fill)"
              stroke={isSelected ? '#6366F1' : '#64748B'}
              strokeWidth={isSelected ? 2.5 : 1}
              style={{
                pointerEvents: svgCatchesPointer ? 'none' : 'auto',
                cursor: mode === 'delete' ? 'not-allowed' : 'pointer',
              }}
              onClick={(e) => handleWallClick(e, wall.id)}
            />
          );
        })}

        {/* Doors on this wall */}
        {doors
          .filter((d) => d.wallId === wall.id && d.position !== undefined)
          .map((d) => renderOpening(wall, 'door', d.id, d.position as number, d.width))}

        {/* Windows on this wall */}
        {windows
          .filter((w) => w.wallId === wall.id && w.position !== undefined)
          .map((w) => renderOpening(wall, 'window', w.id, w.position as number, w.width))}

        {/* Endpoint handles (edit mode) */}
        {mode === 'edit' && isSelected && (
          <>
            {(['start', 'end'] as const).map((end) => (
              <circle
                key={end}
                cx={(end === 'start' ? wall.startX : wall.endX) * scale}
                cy={(end === 'start' ? wall.startY : wall.endY) * scale}
                r="7"
                fill="#6366F1"
                stroke="white"
                strokeWidth="2.5"
                style={{ pointerEvents: 'auto', cursor: 'move' }}
                onMouseDown={(e) => handleEndpointMouseDown(e, wall.id, end)}
              />
            ))}
          </>
        )}
      </g>
    );
  };

  const ghostWall = ghost ? walls.find((w) => w.id === ghost.wallId) : null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0"
      width="100%"
      height="100%"
      style={{
        zIndex: Z.WALLS,
        pointerEvents: svgCatchesPointer ? 'auto' : 'none',
        cursor: openingPlacement ? (ghost ? 'copy' : 'crosshair') : mode === 'draw' ? 'crosshair' : undefined,
      }}
      onClick={handleSvgClick}
      onMouseMove={handleSvgMouseMove}
      onMouseLeave={() => setGhost(null)}
    >
      <defs>
        <pattern id="wall-fill" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#CBD5E1" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94A3B8" strokeWidth="2" />
        </pattern>
      </defs>

      {walls.map((wall) => renderWallWithOpenings(wall))}

      {/* Ghost opening while placing */}
      {openingPlacement &&
        ghost &&
        ghostWall &&
        renderOpening(
          ghostWall,
          openingPlacement,
          '__ghost__',
          ghost.position,
          openingPlacement === 'door' ? DEFAULT_DOOR_WIDTH : DEFAULT_WINDOW_WIDTH,
          true
        )}

      {/* Preview line while drawing */}
      {mode === 'draw' && drawingWallStart && tempWallEnd && (
        <>
          <line
            x1={drawingWallStart.x * scale}
            y1={drawingWallStart.y * scale}
            x2={tempWallEnd.x * scale}
            y2={tempWallEnd.y * scale}
            stroke="#6366F1"
            strokeWidth={Math.max(2, wallThickness * scale)}
            strokeDasharray="6 5"
            opacity="0.6"
            pointerEvents="none"
          />
          <circle cx={drawingWallStart.x * scale} cy={drawingWallStart.y * scale} r="4.5" fill="#6366F1" pointerEvents="none" />
          <circle cx={tempWallEnd.x * scale} cy={tempWallEnd.y * scale} r="4.5" fill="#6366F1" pointerEvents="none" />
          {/* Live length readout */}
          <text
            x={((drawingWallStart.x + tempWallEnd.x) / 2) * scale + 8}
            y={((drawingWallStart.y + tempWallEnd.y) / 2) * scale - 8}
            fontSize="12"
            fontWeight="600"
            fill="#4338CA"
            pointerEvents="none"
          >
            {Math.sqrt(
              (tempWallEnd.x - drawingWallStart.x) ** 2 + (tempWallEnd.y - drawingWallStart.y) ** 2
            ).toFixed(1)}
            ft
          </text>
        </>
      )}
    </svg>
  );
};

export default WallRenderer;
