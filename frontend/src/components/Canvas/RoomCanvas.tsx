import React, { useRef, useEffect, useState } from 'react';
import type { FurnitureItem, Door, Window as WindowType, RoomSection } from '../../types';

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
}

const BASE_SCALE = 20; // pixels per foot

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
  // onUpdateRoomSection, // Reserved for future interactive section editing
  zoom = 1,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const SCALE = BASE_SCALE * zoom;

  // Calculate canvas size - use roomSections if available, otherwise roomDimensions
  const canvasWidth = roomDimensions.width * SCALE;
  const canvasHeight = roomDimensions.height * SCALE;

  // Helper: Check if furniture fits within any section (or room if no sections)
  const constrainToValidArea = (x: number, y: number, width: number, height: number): { x: number; y: number } => {
    if (!roomSections || roomSections.length === 0) {
      // Single room - constrain to room boundaries
      const constrainedX = Math.max(0, Math.min(roomDimensions.width - width, x));
      const constrainedY = Math.max(0, Math.min(roomDimensions.height - height, y));
      return { x: constrainedX, y: constrainedY };
    }

    // Multi-section - find which section contains the center point
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    for (const section of roomSections) {
      if (
        centerX >= section.x &&
        centerX <= section.x + section.width &&
        centerY >= section.y &&
        centerY <= section.y + section.height
      ) {
        // Constrain to this section's boundaries
        const constrainedX = Math.max(section.x, Math.min(section.x + section.width - width, x));
        const constrainedY = Math.max(section.y, Math.min(section.y + section.height - height, y));
        return { x: constrainedX, y: constrainedY };
      }
    }

    // If not in any section, constrain to overall bounds
    const constrainedX = Math.max(0, Math.min(roomDimensions.width - width, x));
    const constrainedY = Math.max(0, Math.min(roomDimensions.height - height, y));
    return { x: constrainedX, y: constrainedY };
  };

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

    // Constrain to valid area (room or section boundaries)
    const constrained = constrainToValidArea(newX, newY, effectiveWidth, effectiveHeight);

    onUpdateFurniture(draggingItem, { x: constrained.x, y: constrained.y });
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
        className="relative bg-gray-50 rounded-lg shadow-2xl ring-1 ring-gray-200"
        style={{
          width: canvasWidth,
          height: canvasHeight,
        }}
        onClick={handleCanvasClick}
      >
        {/* Room Sections or Single Room Background */}
        {roomSections && roomSections.length > 0 ? (
          // Multi-section rendering
          roomSections.map((section, index) => (
            <div
              key={section.id}
              className="absolute bg-white border border-gray-300"
              style={{
                left: section.x * SCALE,
                top: section.y * SCALE,
                width: section.width * SCALE,
                height: section.height * SCALE,
              }}
            >
              {/* Section label */}
              <div className="absolute top-2 left-2 text-xs font-medium text-gray-400 select-none pointer-events-none">
                {section.name || `Section ${index + 1}`}
              </div>
            </div>
          ))
        ) : (
          // Single room background
          <div className="absolute inset-0 bg-white" />
        )}

        {/* Grid */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
          >
            {roomSections && roomSections.length > 0 ? (
              // Grid for each section
              roomSections.map((section) => (
                <g key={`grid-${section.id}`}>
                  {/* Vertical lines for this section */}
                  {Array.from({ length: section.width + 1 }).map((_, i) => (
                    <line
                      key={`v-${section.id}-${i}`}
                      x1={(section.x + i) * SCALE}
                      y1={section.y * SCALE}
                      x2={(section.x + i) * SCALE}
                      y2={(section.y + section.height) * SCALE}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Horizontal lines for this section */}
                  {Array.from({ length: section.height + 1 }).map((_, i) => (
                    <line
                      key={`h-${section.id}-${i}`}
                      x1={section.x * SCALE}
                      y1={(section.y + i) * SCALE}
                      x2={(section.x + section.width) * SCALE}
                      y2={(section.y + i) * SCALE}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              ))
            ) : (
              // Grid for single room
              <>
                {/* Vertical lines */}
                {Array.from({ length: roomDimensions.width + 1 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * SCALE}
                    y1={0}
                    x2={i * SCALE}
                    y2={canvasHeight}
                    stroke="#F3F4F6"
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
                    stroke="#F3F4F6"
                    strokeWidth="1"
                  />
                ))}
              </>
            )}
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
          const isHovered = hoveredItemId === item.id;

          return (
            <div
              key={item.id}
              className={`absolute cursor-move flex flex-col items-center justify-center text-xs font-semibold rounded-md transition-all duration-150 ${
                selectedItemId === item.id
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'shadow-md hover:shadow-lg hover:scale-105'
              } ${draggingItem === item.id ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                left: item.x * SCALE,
                top: item.y * SCALE,
                width: displayWidth,
                height: displayHeight,
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                opacity: draggingItem === item.id ? 0.6 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              title={`${item.width}' × ${item.height}'`}
            >
              <span className="text-white text-center px-1 select-none pointer-events-none drop-shadow-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                {item.name}
              </span>
              {isHovered && (
                <span className="text-white text-[10px] select-none pointer-events-none drop-shadow-sm mt-0.5">
                  {item.width}' × {item.height}'
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomCanvas;
