import React, { useRef, useEffect, useState } from 'react';
import type { WallObject, Door, Window as WindowType, WallType } from '../../types';

interface WallCanvasProps {
  wall: WallType;
  roomDimensions: { width: number; height: number };
  wallObjects: WallObject[];
  doors: Door[];
  windows: WindowType[];
  showGrid: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateWallObject: (id: string, updates: Partial<WallObject>) => void;
}

const SCALE = 20; // pixels per foot
const WALL_HEIGHT = 8; // feet

const WallCanvas: React.FC<WallCanvasProps> = ({
  wall,
  roomDimensions,
  wallObjects,
  doors,
  windows,
  showGrid,
  selectedItemId,
  onSelectItem,
  onUpdateWallObject,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate wall width based on wall orientation
  const wallWidth =
    wall === 'north' || wall === 'south'
      ? roomDimensions.width
      : roomDimensions.height;

  const canvasWidth = wallWidth * SCALE;
  const canvasHeight = WALL_HEIGHT * SCALE;

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = wallObjects.find((obj) => obj.id === itemId);
    if (!item) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const itemX = item.x * SCALE;
    const itemY = item.y * SCALE;

    setDragOffset({
      x: clickX - itemX,
      y: clickY - itemY,
    });

    setDraggingItem(itemId);
    onSelectItem(itemId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingItem) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const item = wallObjects.find((obj) => obj.id === draggingItem);
    if (!item) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newX = (mouseX - dragOffset.x) / SCALE;
    let newY = (mouseY - dragOffset.y) / SCALE;

    // Constrain to wall boundaries
    newX = Math.max(0, Math.min(wallWidth - item.width, newX));
    newY = Math.max(0, Math.min(WALL_HEIGHT - item.height, newY));

    onUpdateWallObject(draggingItem, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  useEffect(() => {
    if (draggingItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingItem, dragOffset]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectItem(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-full">
      <h2 className="text-xl font-semibold mb-4 capitalize">{wall} Wall</h2>
      <div className="text-sm text-gray-600 mb-2">
        {wallWidth} ft × {WALL_HEIGHT} ft
      </div>
      <div
        ref={canvasRef}
        className="relative bg-gray-50 border-2 border-gray-300 shadow-lg"
        style={{
          width: canvasWidth,
          height: canvasHeight,
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {/* Vertical lines */}
            {Array.from({ length: wallWidth + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * SCALE}
                y1={0}
                x2={i * SCALE}
                y2={canvasHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: WALL_HEIGHT + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * SCALE}
                x2={canvasWidth}
                y2={i * SCALE}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
          </svg>
        )}

        {/* Doors */}
        {doors.map((door) => (
          <div
            key={door.id}
            className="absolute bg-amber-700 flex items-center justify-center text-white text-xs font-medium"
            style={{
              left: door.x * SCALE,
              bottom: 0,
              width: door.width * SCALE,
              height: WALL_HEIGHT * SCALE,
            }}
          >
            Door
          </div>
        ))}

        {/* Windows */}
        {windows.map((window) => (
          <div
            key={window.id}
            className="absolute bg-blue-200 border-2 border-blue-400 flex items-center justify-center text-blue-800 text-xs font-medium"
            style={{
              left: window.x * SCALE,
              bottom: window.y * SCALE,
              width: window.width * SCALE,
              height: window.height * SCALE,
            }}
          >
            Window
          </div>
        ))}

        {/* Wall Objects */}
        {wallObjects.map((item) => (
          <div
            key={item.id}
            className={`absolute cursor-move flex items-center justify-center overflow-hidden ${
              selectedItemId === item.id ? 'ring-2 ring-primary' : 'border border-gray-400'
            }`}
            style={{
              left: item.x * SCALE,
              bottom: item.y * SCALE,
              width: item.width * SCALE,
              height: item.height * SCALE,
              backgroundColor: item.image ? 'transparent' : '#D1D5DB',
              opacity: draggingItem === item.id ? 0.7 : 1,
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <span className="text-gray-700 text-xs font-medium text-center px-1 select-none pointer-events-none">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WallCanvas;
