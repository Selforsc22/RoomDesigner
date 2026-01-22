import React, { useRef, useEffect, useState } from 'react';
import type { FurnitureItem, Door, Window as WindowType } from '../../types';

interface RoomCanvasProps {
  roomDimensions: { width: number; height: number };
  furniture: FurnitureItem[];
  doors: Door[];
  windows: WindowType[];
  showGrid: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  zoom?: number;
}

const BASE_SCALE = 20; // pixels per foot

const RoomCanvas: React.FC<RoomCanvasProps> = ({
  roomDimensions,
  furniture,
  doors,
  windows,
  showGrid,
  selectedItemId,
  onSelectItem,
  onUpdateFurniture,
  zoom = 1,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const SCALE = BASE_SCALE * zoom;
  const canvasWidth = roomDimensions.width * SCALE;
  const canvasHeight = roomDimensions.height * SCALE;

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = furniture.find((f) => f.id === itemId);
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

    const item = furniture.find((f) => f.id === draggingItem);
    if (!item) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newX = (mouseX - dragOffset.x) / SCALE;
    let newY = (mouseY - dragOffset.y) / SCALE;

    // Get rotated dimensions
    const isRotated = item.rotation === 90 || item.rotation === 270;
    const effectiveWidth = isRotated ? item.height : item.width;
    const effectiveHeight = isRotated ? item.width : item.height;

    // Constrain to room boundaries
    newX = Math.max(0, Math.min(roomDimensions.width - effectiveWidth, newX));
    newY = Math.max(0, Math.min(roomDimensions.height - effectiveHeight, newY));

    onUpdateFurniture(draggingItem, { x: newX, y: newY });
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
    <div className="flex items-center justify-center p-8 min-h-full">
      <div
        ref={canvasRef}
        className="relative bg-white rounded-lg shadow-2xl ring-1 ring-gray-200"
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
            {Array.from({ length: roomDimensions.width + 1 }).map((_, i) => (
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
            {Array.from({ length: roomDimensions.height + 1 }).map((_, i) => (
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
        {doors.map((door) => {
          const x = door.wall === 'west' ? 0 : door.wall === 'east' ? roomDimensions.width * SCALE - 2 : door.x * SCALE;
          const y = door.wall === 'north' ? 0 : door.wall === 'south' ? roomDimensions.height * SCALE - 2 : door.x * SCALE;
          const width = door.wall === 'north' || door.wall === 'south' ? door.width * SCALE : 2;
          const height = door.wall === 'east' || door.wall === 'west' ? door.width * SCALE : 2;

          return (
            <div
              key={door.id}
              className="absolute bg-amber-700 shadow-sm"
              style={{
                left: x,
                top: y,
                width,
                height,
              }}
            />
          );
        })}

        {/* Windows */}
        {windows.map((window) => {
          const x = window.wall === 'west' ? 0 : window.wall === 'east' ? roomDimensions.width * SCALE - 2 : window.x * SCALE;
          const y = window.wall === 'north' ? 0 : window.wall === 'south' ? roomDimensions.height * SCALE - 2 : window.y * SCALE;
          const width = window.wall === 'north' || window.wall === 'south' ? window.width * SCALE : 2;
          const height = window.wall === 'east' || window.wall === 'west' ? window.height * SCALE : 2;

          return (
            <div
              key={window.id}
              className="absolute bg-blue-300 border-2 border-blue-500 shadow-sm"
              style={{
                left: x,
                top: y,
                width,
                height,
              }}
            />
          );
        })}

        {/* Furniture */}
        {furniture.map((item) => {
          const isRotated = item.rotation === 90 || item.rotation === 270;
          const displayWidth = isRotated ? item.height * SCALE : item.width * SCALE;
          const displayHeight = isRotated ? item.width * SCALE : item.height * SCALE;

          return (
            <div
              key={item.id}
              className={`absolute cursor-move flex items-center justify-center text-xs font-semibold rounded-md transition-all duration-150 ${
                selectedItemId === item.id
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'shadow-md hover:shadow-lg hover:scale-105'
              }`}
              style={{
                left: item.x * SCALE,
                top: item.y * SCALE,
                width: displayWidth,
                height: displayHeight,
                backgroundColor: item.color,
                opacity: draggingItem === item.id ? 0.7 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
            >
              <span className="text-white text-center px-1 select-none pointer-events-none drop-shadow-sm">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomCanvas;
