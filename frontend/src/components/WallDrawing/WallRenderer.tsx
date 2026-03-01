import React, { useState, useRef, useEffect } from 'react';
import type { Wall, FloorPlan, Door, Window } from '../../types';
import {
  getWallCorners,
  calculateWallLength,
  calculateWallAngle,
  calculateWallSegments,
  getOpeningPosition,
  snapToGrid,
  snapToWallEndpoint,
  lerp,
  type WallOpening,
} from '../../utils/wallGeometry';
import type { WallDrawingMode } from './WallDrawingToolbar';

interface WallRendererProps {
  floorPlan: FloorPlan | null;
  doors: Door[];
  windows: Window[];
  scale: number; // pixels per foot
  mode: WallDrawingMode;
  wallThickness: number;
  snapToGridEnabled: boolean;
  selectedWallId: string | null;
  onSelectWall: (id: string | null) => void;
  onUpdateWall: (id: string, updates: Partial<Wall>) => void;
  onDeleteWall: (id: string) => void;
  onAddWall: (wall: Omit<Wall, 'id'>) => void;
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
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawingWallStart, setDrawingWallStart] = useState<{ x: number; y: number } | null>(null);
  const [tempWallEnd, setTempWallEnd] = useState<{ x: number; y: number } | null>(null);
  const [draggingEndpoint, setDraggingEndpoint] = useState<{
    wallId: string;
    endpoint: 'start' | 'end';
  } | null>(null);

  if (!floorPlan || !floorPlan.walls.length) return null;

  const walls = floorPlan.walls;

  // Helper: Get mouse position in floor plan coordinates (feet)
  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    let x = (e.clientX - rect.left) / scale;
    let y = (e.clientY - rect.top) / scale;

    // Apply snapping if enabled
    if (snapToGridEnabled) {
      x = snapToGrid(x, 1); // Snap to 1-foot grid
      y = snapToGrid(y, 1);
    }

    // Snap to wall endpoints
    const snapped = snapToWallEndpoint({ x, y }, walls, 0.5);
    return snapped;
  };

  // Handle click on SVG canvas
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'draw') {
      const pos = getMousePosition(e);

      if (!drawingWallStart) {
        // Start drawing a wall
        setDrawingWallStart(pos);
        setTempWallEnd(pos);
      } else {
        // Finish drawing the wall
        if (
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
        }
        setDrawingWallStart(null);
        setTempWallEnd(null);
      }
    }
  };

  // Handle mouse move for preview
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'draw' && drawingWallStart) {
      const pos = getMousePosition(e);
      setTempWallEnd(pos);
    }
  };

  // Handle wall click
  const handleWallClick = (e: React.MouseEvent, wallId: string) => {
    e.stopPropagation();

    if (mode === 'select' || mode === 'edit') {
      onSelectWall(wallId);
    } else if (mode === 'delete') {
      onDeleteWall(wallId);
    }
  };

  // Handle endpoint drag
  const handleEndpointMouseDown = (
    e: React.MouseEvent,
    wallId: string,
    endpoint: 'start' | 'end'
  ) => {
    e.stopPropagation();
    if (mode !== 'edit') return;

    setDraggingEndpoint({ wallId, endpoint });
  };

  // Mouse move handler for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingEndpoint || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      let x = (e.clientX - rect.left) / scale;
      let y = (e.clientY - rect.top) / scale;

      // Apply snapping
      if (snapToGridEnabled) {
        x = snapToGrid(x, 1);
        y = snapToGrid(y, 1);
      }

      const snapped = snapToWallEndpoint({ x, y }, walls, 0.5);

      if (draggingEndpoint.endpoint === 'start') {
        onUpdateWall(draggingEndpoint.wallId, {
          startX: snapped.x,
          startY: snapped.y,
        });
      } else {
        onUpdateWall(draggingEndpoint.wallId, {
          endX: snapped.x,
          endY: snapped.y,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingEndpoint(null);
    };

    if (draggingEndpoint) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingEndpoint, scale, snapToGridEnabled, walls]);

  // Helper: Get openings for a wall
  const getWallOpenings = (wall: Wall): WallOpening[] => {
    const wallLength = calculateWallLength(wall);
    const openings: WallOpening[] = [];

    // Add doors
    doors
      .filter((d) => d.wallId === wall.id)
      .forEach((door) => {
        const position = door.position || 0.5;
        const halfWidth = door.width / 2 / wallLength;
        openings.push({
          id: door.id,
          type: 'door',
          startPos: Math.max(0, position - halfWidth),
          endPos: Math.min(1, position + halfWidth),
        });
      });

    // Add windows
    windows
      .filter((w) => w.wallId === wall.id)
      .forEach((window) => {
        const position = window.position || 0.5;
        const halfWidth = window.width / 2 / wallLength;
        openings.push({
          id: window.id,
          type: 'window',
          startPos: Math.max(0, position - halfWidth),
          endPos: Math.min(1, position + halfWidth),
          heightFromFloor: window.heightFromFloor,
          height: window.height,
        });
      });

    return openings;
  };

  // Render a wall with openings
  const renderWallWithOpenings = (wall: Wall) => {
    const openings = getWallOpenings(wall);
    const segments = calculateWallSegments(wall, openings);
    const corners = getWallCorners(wall);
    const isSelected = selectedWallId === wall.id;

    return (
      <g key={wall.id}>
        {/* Render each solid segment */}
        {segments.map((segment, idx) => {
          const t1 = segment.start;
          const t2 = segment.end;

          const segmentPath = `
            M ${lerp(corners.topLeft.x, corners.topRight.x, t1) * scale}
              ${lerp(corners.topLeft.y, corners.topRight.y, t1) * scale}
            L ${lerp(corners.topLeft.x, corners.topRight.x, t2) * scale}
              ${lerp(corners.topLeft.y, corners.topRight.y, t2) * scale}
            L ${lerp(corners.bottomLeft.x, corners.bottomRight.x, t2) * scale}
              ${lerp(corners.bottomLeft.y, corners.bottomRight.y, t2) * scale}
            L ${lerp(corners.bottomLeft.x, corners.bottomRight.x, t1) * scale}
              ${lerp(corners.bottomLeft.y, corners.bottomRight.y, t1) * scale}
            Z
          `;

          return (
            <path
              key={`segment-${idx}`}
              d={segmentPath}
              fill="url(#wall-fill)"
              stroke={isSelected ? '#3B82F6' : '#9CA3AF'}
              strokeWidth={isSelected ? 2 : 1}
              onClick={(e) => handleWallClick(e, wall.id)}
              className="cursor-pointer"
            />
          );
        })}

        {/* Render door openings */}
        {openings
          .filter((o) => o.type === 'door')
          .map((opening) => {
            const door = doors.find((d) => d.id === opening.id);
            if (!door || !door.position) return null;

            const pos = getOpeningPosition(wall, door.position, door.width);
            const angle = pos.angle;

            return (
              <g key={opening.id}>
                {/* Door frame */}
                <rect
                  x={(pos.centerX - door.width / 2) * scale}
                  y={(pos.centerY - wall.thickness / 2) * scale}
                  width={door.width * scale}
                  height={wall.thickness * scale}
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="1"
                  transform={`rotate(${angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
                />
                {/* Door swing arc */}
                <path
                  d={`
                    M ${pos.centerX * scale} ${pos.centerY * scale}
                    L ${(pos.centerX + door.width * Math.cos((angle - 90) * Math.PI / 180)) * scale}
                      ${(pos.centerY + door.width * Math.sin((angle - 90) * Math.PI / 180)) * scale}
                  `}
                  stroke="#8B4513"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d={`
                    M ${pos.centerX * scale} ${pos.centerY * scale}
                    A ${door.width * scale} ${door.width * scale} 0 0 1
                    ${(pos.centerX + door.width * Math.cos((angle - 90) * Math.PI / 180)) * scale}
                    ${(pos.centerY + door.width * Math.sin((angle - 90) * Math.PI / 180)) * scale}
                  `}
                  stroke="#8B4513"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              </g>
            );
          })}

        {/* Render window openings */}
        {openings
          .filter((o) => o.type === 'window')
          .map((opening) => {
            const window = windows.find((w) => w.id === opening.id);
            if (!window || !window.position) return null;

            const pos = getOpeningPosition(wall, window.position, window.width);
            const angle = pos.angle;

            return (
              <g key={opening.id}>
                {/* Window frame */}
                <rect
                  x={(pos.centerX - window.width / 2) * scale}
                  y={(pos.centerY - wall.thickness / 2) * scale}
                  width={window.width * scale}
                  height={wall.thickness * scale}
                  fill="#87CEEB"
                  stroke="#4682B4"
                  strokeWidth="2"
                  transform={`rotate(${angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
                  opacity="0.6"
                />
                {/* Window panes */}
                <line
                  x1={pos.centerX * scale}
                  y1={(pos.centerY - wall.thickness / 2) * scale}
                  x2={pos.centerX * scale}
                  y2={(pos.centerY + wall.thickness / 2) * scale}
                  stroke="#4682B4"
                  strokeWidth="1"
                  transform={`rotate(${angle}, ${pos.centerX * scale}, ${pos.centerY * scale})`}
                />
              </g>
            );
          })}

        {/* Wall endpoints (edit handles) */}
        {mode === 'edit' && isSelected && (
          <>
            <circle
              cx={wall.startX * scale}
              cy={wall.startY * scale}
              r="6"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
              className="cursor-move"
              onMouseDown={(e) => handleEndpointMouseDown(e, wall.id, 'start')}
            />
            <circle
              cx={wall.endX * scale}
              cy={wall.endY * scale}
              r="6"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
              className="cursor-move"
              onMouseDown={(e) => handleEndpointMouseDown(e, wall.id, 'end')}
            />
          </>
        )}
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0"
      style={{ zIndex: 5, pointerEvents: mode === 'draw' || mode === 'select' || mode === 'edit' || mode === 'delete' ? 'auto' : 'none' }}
      onClick={handleSvgClick}
      onMouseMove={handleSvgMouseMove}
    >
      <defs>
        <pattern id="wall-fill" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#E5E7EB" />
          <rect width="2" height="2" fill="#D1D5DB" />
        </pattern>
      </defs>

      {/* Render all walls */}
      {walls.map((wall) => renderWallWithOpenings(wall))}

      {/* Preview wall while drawing */}
      {mode === 'draw' && drawingWallStart && tempWallEnd && (
        <>
          <line
            x1={drawingWallStart.x * scale}
            y1={drawingWallStart.y * scale}
            x2={tempWallEnd.x * scale}
            y2={tempWallEnd.y * scale}
            stroke="#3B82F6"
            strokeWidth={wallThickness * scale}
            strokeDasharray="5,5"
            opacity="0.6"
            pointerEvents="none"
          />
          <circle
            cx={drawingWallStart.x * scale}
            cy={drawingWallStart.y * scale}
            r="4"
            fill="#3B82F6"
            pointerEvents="none"
          />
          <circle
            cx={tempWallEnd.x * scale}
            cy={tempWallEnd.y * scale}
            r="4"
            fill="#3B82F6"
            pointerEvents="none"
          />
        </>
      )}
    </svg>
  );
};

export default WallRenderer;
