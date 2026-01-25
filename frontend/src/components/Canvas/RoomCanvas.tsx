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
  onUpdateRoomSection,
  zoom = 1,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Section editing state
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null);
  const [sectionDragStart, setSectionDragStart] = useState<{ x: number; y: number } | null>(null);
  const [snapGuides, setSnapGuides] = useState<{ type: 'vertical' | 'horizontal'; position: number }[]>([]);

  const SCALE = BASE_SCALE * zoom;
  const SNAP_THRESHOLD = 0.5; // feet - snap when within this distance

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

  // Section interaction handlers
  const handleSectionMouseDown = (e: React.MouseEvent, sectionId: string, edge?: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    if (!onUpdateRoomSection || !roomSections) return;

    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / SCALE;
    const mouseY = (e.clientY - rect.top) / SCALE;

    const section = roomSections.find(s => s.id === sectionId);
    if (!section) return;

    if (edge) {
      // Resizing
      setResizingSectionId(sectionId);
      setResizeEdge(edge);
      setSectionDragStart({ x: mouseX, y: mouseY });
    } else {
      // Moving
      setDraggingSectionId(sectionId);
      setSectionDragStart({
        x: mouseX - section.x,
        y: mouseY - section.y,
      });
    }
  };

  const handleSectionMouseMove = (e: MouseEvent) => {
    if (!onUpdateRoomSection || !roomSections) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / SCALE;
    const mouseY = (e.clientY - rect.top) / SCALE;

    // Handle section dragging (move)
    if (draggingSectionId && sectionDragStart) {
      const section = roomSections.find(s => s.id === draggingSectionId);
      if (!section) return;

      let newX = mouseX - sectionDragStart.x;
      let newY = mouseY - sectionDragStart.y;

      // Snap to grid
      newX = Math.round(newX * 2) / 2; // Snap to 0.5 ft grid
      newY = Math.round(newY * 2) / 2;

      // Snap to other sections and collect guides
      const guides: { type: 'vertical' | 'horizontal'; position: number }[] = [];

      for (const otherSection of roomSections) {
        if (otherSection.id === draggingSectionId) continue;

        // Snap left edge to right edge
        if (Math.abs(newX - (otherSection.x + otherSection.width)) < SNAP_THRESHOLD) {
          newX = otherSection.x + otherSection.width;
          guides.push({ type: 'vertical', position: newX });
        }
        // Snap right edge to left edge
        if (Math.abs((newX + section.width) - otherSection.x) < SNAP_THRESHOLD) {
          newX = otherSection.x - section.width;
          guides.push({ type: 'vertical', position: otherSection.x });
        }
        // Snap top edge to bottom edge
        if (Math.abs(newY - (otherSection.y + otherSection.height)) < SNAP_THRESHOLD) {
          newY = otherSection.y + otherSection.height;
          guides.push({ type: 'horizontal', position: newY });
        }
        // Snap bottom edge to top edge
        if (Math.abs((newY + section.height) - otherSection.y) < SNAP_THRESHOLD) {
          newY = otherSection.y - section.height;
          guides.push({ type: 'horizontal', position: otherSection.y });
        }
      }

      setSnapGuides(guides);

      // Constrain to canvas bounds
      newX = Math.max(0, Math.min(roomDimensions.width - section.width, newX));
      newY = Math.max(0, Math.min(roomDimensions.height - section.height, newY));

      onUpdateRoomSection(draggingSectionId, { x: newX, y: newY });
    }

    // Handle section resizing
    if (resizingSectionId && resizeEdge && sectionDragStart) {
      const section = roomSections.find(s => s.id === resizingSectionId);
      if (!section) return;

      const deltaX = mouseX - sectionDragStart.x;
      const deltaY = mouseY - sectionDragStart.y;

      let newX = section.x;
      let newY = section.y;
      let newWidth = section.width;
      let newHeight = section.height;

      // Apply resize based on edge
      if (resizeEdge.includes('e')) {
        newWidth = Math.max(4, section.width + deltaX); // Min 4ft
      }
      if (resizeEdge.includes('w')) {
        const maxDelta = section.width - 4;
        const constrainedDelta = Math.min(deltaX, maxDelta);
        newX = section.x + constrainedDelta;
        newWidth = section.width - constrainedDelta;
      }
      if (resizeEdge.includes('s')) {
        newHeight = Math.max(4, section.height + deltaY); // Min 4ft
      }
      if (resizeEdge.includes('n')) {
        const maxDelta = section.height - 4;
        const constrainedDelta = Math.min(deltaY, maxDelta);
        newY = section.y + constrainedDelta;
        newHeight = section.height - constrainedDelta;
      }

      // Snap dimensions to 0.5ft grid
      newWidth = Math.round(newWidth * 2) / 2;
      newHeight = Math.round(newHeight * 2) / 2;
      newX = Math.round(newX * 2) / 2;
      newY = Math.round(newY * 2) / 2;

      onUpdateRoomSection(resizingSectionId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });

      setSectionDragStart({ x: mouseX, y: mouseY });
    }
  };

  const handleSectionMouseUp = () => {
    setDraggingSectionId(null);
    setResizingSectionId(null);
    setResizeEdge(null);
    setSectionDragStart(null);
    setSnapGuides([]);
  };

  // Add section mouse event listeners
  useEffect(() => {
    if (draggingSectionId || resizingSectionId) {
      window.addEventListener('mousemove', handleSectionMouseMove);
      window.addEventListener('mouseup', handleSectionMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSectionMouseMove);
        window.removeEventListener('mouseup', handleSectionMouseUp);
      };
    }
  }, [draggingSectionId, resizingSectionId, sectionDragStart, resizeEdge, roomSections]);

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
          roomSections.map((section, index) => {
            const isHovered = hoveredSectionId === section.id;
            const isDragging = draggingSectionId === section.id;
            const isResizing = resizingSectionId === section.id;

            // Cycle through subtle background colors for visual distinction
            const bgColors = ['bg-blue-50/30', 'bg-green-50/30', 'bg-purple-50/30', 'bg-amber-50/30', 'bg-rose-50/30'];
            const bgColor = bgColors[index % bgColors.length];

            return (
              <div
                key={section.id}
                className={`absolute ${bgColor} border-2 transition-all ${
                  isHovered || isDragging || isResizing
                    ? 'border-primary shadow-lg z-10'
                    : 'border-gray-300'
                } ${isDragging ? 'cursor-move opacity-70' : isResizing ? 'opacity-70' : ''}`}
                style={{
                  left: section.x * SCALE,
                  top: section.y * SCALE,
                  width: section.width * SCALE,
                  height: section.height * SCALE,
                }}
                onMouseEnter={() => setHoveredSectionId(section.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
              >
                {/* Section label and drag handle */}
                <div
                  className="absolute top-2 left-2 select-none"
                  onMouseDown={(e) => handleSectionMouseDown(e, section.id)}
                >
                  <div className="px-3 py-1.5 bg-gradient-to-br from-primary/90 to-primary rounded-lg cursor-move border-2 border-white shadow-lg hover:shadow-xl transition-all">
                    <div className="text-sm font-bold text-white">
                      {section.name || `Section ${index + 1}`}
                    </div>
                    <div className="text-[10px] text-white/90 mt-0.5">
                      {section.width}' × {section.height}' ({(section.width * section.height).toFixed(0)} sq ft)
                    </div>
                  </div>
                </div>

                {/* Resize handles - only show when hovered and not dragging */}
                {onUpdateRoomSection && (isHovered || isResizing) && !isDragging && (
                  <>
                    {/* Corner handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'nw')}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'ne')}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'sw')}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'se')}
                    />

                    {/* Edge handles */}
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary rounded-full cursor-n-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'n')}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary rounded-full cursor-s-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 's')}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-8 bg-primary rounded-full cursor-w-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'w')}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-8 bg-primary rounded-full cursor-e-resize border-2 border-white shadow-md"
                      onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'e')}
                    />
                  </>
                )}

                {/* Dimension display when hovering */}
                {isHovered && !isDragging && !isResizing && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-500 select-none pointer-events-none border border-gray-200">
                    {section.width}' × {section.height}'
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Single room background
          <div className="absolute inset-0 bg-white" />
        )}

        {/* Section Connection Indicators */}
        {roomSections && roomSections.length > 1 && (
          <svg
            className="absolute inset-0 pointer-events-none z-5"
            width={canvasWidth}
            height={canvasHeight}
          >
            {roomSections.map((section1, idx1) =>
              roomSections.slice(idx1 + 1).map((section2) => {
                // Check if sections are adjacent (share an edge)
                const isHorizontallyAdjacent =
                  (section1.x + section1.width === section2.x || section2.x + section2.width === section1.x) &&
                  !(section1.y + section1.height <= section2.y || section2.y + section2.height <= section1.y);

                const isVerticallyAdjacent =
                  (section1.y + section1.height === section2.y || section2.y + section2.height === section1.y) &&
                  !(section1.x + section1.width <= section2.x || section2.x + section2.width <= section1.x);

                if (!isHorizontallyAdjacent && !isVerticallyAdjacent) return null;

                // Calculate connection point
                let x1, y1, x2, y2;
                if (isHorizontallyAdjacent) {
                  // Vertical connection line
                  const sharedX = section1.x + section1.width === section2.x ? section1.x + section1.width : section2.x + section2.width;
                  const overlapTop = Math.max(section1.y, section2.y);
                  const overlapBottom = Math.min(section1.y + section1.height, section2.y + section2.height);
                  const midY = (overlapTop + overlapBottom) / 2;

                  x1 = sharedX * SCALE;
                  y1 = midY * SCALE - 20;
                  x2 = sharedX * SCALE;
                  y2 = midY * SCALE + 20;
                } else {
                  // Horizontal connection line
                  const sharedY = section1.y + section1.height === section2.y ? section1.y + section1.height : section2.y + section2.height;
                  const overlapLeft = Math.max(section1.x, section2.x);
                  const overlapRight = Math.min(section1.x + section1.width, section2.x + section2.width);
                  const midX = (overlapLeft + overlapRight) / 2;

                  x1 = midX * SCALE - 20;
                  y1 = sharedY * SCALE;
                  x2 = midX * SCALE + 20;
                  y2 = sharedY * SCALE;
                }

                return (
                  <g key={`connection-${section1.id}-${section2.id}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="4" fill="#10B981" opacity="0.8" />
                  </g>
                );
              })
            )}
          </svg>
        )}

        {/* Snap Alignment Guides */}
        {snapGuides.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none z-20"
            width={canvasWidth}
            height={canvasHeight}
          >
            {snapGuides.map((guide, index) => {
              if (guide.type === 'vertical') {
                return (
                  <line
                    key={`guide-${index}`}
                    x1={guide.position * SCALE}
                    y1={0}
                    x2={guide.position * SCALE}
                    y2={canvasHeight}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                );
              } else {
                return (
                  <line
                    key={`guide-${index}`}
                    x1={0}
                    y1={guide.position * SCALE}
                    x2={canvasWidth}
                    y2={guide.position * SCALE}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                );
              }
            })}
          </svg>
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

          // Special rendering for lights
          if (item.isLight) {
            const direction = item.lightDirection || 0;
            const intensity = item.lightIntensity || 80;
            const colorTemp = item.colorTemperature || 5600;

            // Calculate color based on temperature
            const getLightColor = (temp: number) => {
              if (temp < 4000) return '#FFB84D'; // Warm orange
              if (temp < 5000) return '#FFF4E6'; // Warm white
              if (temp < 6000) return '#FFFFFF'; // Neutral white
              return '#E6F3FF'; // Cool blue-white
            };

            const lightColor = getLightColor(colorTemp);

            return (
              <div
                key={item.id}
                className={`absolute cursor-move transition-all duration-200 ease-out ${
                  selectedItemId === item.id
                    ? 'z-30'
                    : ''
                } ${draggingItem === item.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: item.x * SCALE,
                  top: item.y * SCALE,
                  width: displayWidth,
                  height: displayHeight,
                  opacity: draggingItem === item.id ? 0.7 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                title={`${item.name} - ${item.lightIntensity}% @ ${item.colorTemperature}K`}
              >
                <svg
                  width={displayWidth}
                  height={displayHeight}
                  viewBox="0 0 100 100"
                  className="pointer-events-none"
                  style={{
                    filter: selectedItemId === item.id
                      ? `drop-shadow(0 0 ${intensity / 5}px ${lightColor})`
                      : `drop-shadow(0 0 ${intensity / 10}px ${lightColor})`
                  }}
                >
                  {/* Radial gradient glow */}
                  <defs>
                    <radialGradient id={`glow-${item.id}`} cx="50%" cy="50%">
                      <stop offset="0%" stopColor={lightColor} stopOpacity={intensity / 100} />
                      <stop offset="50%" stopColor={lightColor} stopOpacity={intensity / 200} />
                      <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Glow circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill={`url(#glow-${item.id})`}
                    opacity="0.6"
                  />

                  {/* Light fixture icon - rotates based on direction */}
                  <g transform={`rotate(${direction} 50 50)`}>
                    {/* Light body */}
                    <rect
                      x="35"
                      y="30"
                      width="30"
                      height="20"
                      rx="3"
                      fill={item.color}
                      stroke={lightColor}
                      strokeWidth="2"
                    />

                    {/* Direction arrow */}
                    <path
                      d="M 50 50 L 50 75 M 45 70 L 50 75 L 55 70"
                      stroke={lightColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* Light indicator on fixture */}
                    <circle
                      cx="50"
                      cy="40"
                      r="4"
                      fill={lightColor}
                      opacity="0.9"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.5;1;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>

                  {/* Selection ring */}
                  {selectedItemId === item.id && (
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  )}
                </svg>

                {/* Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded shadow-sm pointer-events-none">
                  {item.name}
                </div>
              </div>
            );
          }

          // Regular furniture rendering
          return (
            <div
              key={item.id}
              className={`absolute cursor-move flex flex-col items-center justify-center text-xs font-semibold rounded-md transition-all duration-200 ease-out ${
                selectedItemId === item.id
                  ? 'ring-4 ring-primary ring-opacity-50 shadow-2xl scale-110 z-30'
                  : 'shadow-md hover:shadow-xl hover:scale-105'
              } ${draggingItem === item.id ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
              style={{
                left: item.x * SCALE,
                top: item.y * SCALE,
                width: displayWidth,
                height: displayHeight,
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                opacity: draggingItem === item.id ? 0.7 : 1,
                transform: draggingItem === item.id ? 'rotate(2deg)' : 'rotate(0deg)',
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

        {/* Light Beam Visualization */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasWidth}
          height={canvasHeight}
          style={{ zIndex: 5 }}
        >
          {furniture
            .filter((item) => item.isLight && item.lightIntensity && item.lightIntensity > 0)
            .map((light) => {
              // Calculate light center position
              const centerX = (light.x + light.width / 2) * SCALE;
              const centerY = (light.y + light.height / 2) * SCALE;

              // Light direction (0 = right, 90 = down, 180 = left, 270 = up)
              const direction = light.lightDirection || 0;
              const beamAngle = light.beamAngle || 60;
              const intensity = light.lightIntensity || 80;
              const colorTemp = light.colorTemperature || 5600;

              // Calculate color based on temperature
              // 3200K = warm (orange), 5600K = daylight (white), 6500K = cool (blue)
              const getLightColor = (temp: number) => {
                if (temp < 4000) return '#FFB84D'; // Warm orange
                if (temp < 5000) return '#FFF4E6'; // Warm white
                if (temp < 6000) return '#FFFFFF'; // Neutral white
                return '#E6F3FF'; // Cool blue-white
              };

              const lightColor = getLightColor(colorTemp);

              // Calculate beam length based on beam angle (wider = shorter visible range)
              const beamLength = (120 - beamAngle) * 2 + 200;

              // Calculate beam end points based on direction
              const directionRad = (direction * Math.PI) / 180;
              const halfBeamAngleRad = ((beamAngle / 2) * Math.PI) / 180;

              // Calculate the three points of the beam triangle
              const leftEdgeX = centerX + Math.cos(directionRad - halfBeamAngleRad) * beamLength;
              const leftEdgeY = centerY + Math.sin(directionRad - halfBeamAngleRad) * beamLength;

              const rightEdgeX = centerX + Math.cos(directionRad + halfBeamAngleRad) * beamLength;
              const rightEdgeY = centerY + Math.sin(directionRad + halfBeamAngleRad) * beamLength;

              const pathData = `M ${centerX} ${centerY} L ${leftEdgeX} ${leftEdgeY} L ${rightEdgeX} ${rightEdgeY} Z`;

              return (
                <g key={`light-${light.id}`}>
                  {/* Light beam cone */}
                  <path
                    d={pathData}
                    fill={lightColor}
                    opacity={intensity / 400} // Scale opacity based on intensity
                    stroke={lightColor}
                    strokeWidth="1"
                    strokeOpacity={intensity / 300}
                    style={{
                      animation: 'pulse 3s ease-in-out infinite',
                    }}
                  >
                    <animate
                      attributeName="opacity"
                      values={`${intensity / 400};${intensity / 350};${intensity / 400}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Light source indicator (small circle) */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={4}
                    fill={lightColor}
                    opacity={intensity / 100}
                    stroke="#FFD700"
                    strokeWidth="2"
                  />

                  {/* Direction indicator line */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + Math.cos(directionRad) * 30}
                    y2={centerY + Math.sin(directionRad) * 30}
                    stroke={lightColor}
                    strokeWidth="2"
                    opacity={intensity / 150}
                    strokeDasharray="4 2"
                  />
                </g>
              );
            })}
        </svg>

        {/* Ambient Light Color Overlay */}
        {(() => {
          const activeLights = furniture.filter(
            (item) => item.isLight && item.lightIntensity && item.lightIntensity > 0
          );

          if (activeLights.length === 0) return null;

          // Calculate average color temperature weighted by intensity
          let totalWeightedTemp = 0;
          let totalWeight = 0;

          activeLights.forEach((light) => {
            const intensity = light.lightIntensity || 80;
            const colorTemp = light.colorTemperature || 5600;
            totalWeightedTemp += colorTemp * intensity;
            totalWeight += intensity;
          });

          const avgTemp = totalWeightedTemp / totalWeight;

          // Determine overlay color based on average temperature
          let overlayColor = '';
          let overlayOpacity = 0;

          if (avgTemp < 3800) {
            overlayColor = '#FF8C00'; // Deep orange for very warm
            overlayOpacity = 0.08;
          } else if (avgTemp < 4500) {
            overlayColor = '#FFB84D'; // Orange for warm
            overlayOpacity = 0.06;
          } else if (avgTemp < 5200) {
            overlayColor = '#FFF4E6'; // Warm white
            overlayOpacity = 0.04;
          } else if (avgTemp < 6000) {
            overlayColor = '#FFFFFF'; // Neutral
            overlayOpacity = 0.02;
          } else if (avgTemp < 6500) {
            overlayColor = '#E6F3FF'; // Cool white
            overlayOpacity = 0.04;
          } else {
            overlayColor = '#B3D9FF'; // Blue for very cool
            overlayOpacity = 0.06;
          }

          return (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
                mixBlendMode: 'multiply',
                zIndex: 10,
              }}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default RoomCanvas;
