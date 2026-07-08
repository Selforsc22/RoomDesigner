import React, { useEffect, useState } from 'react';
import type { RoomSection } from '../../../types';
import { Z } from '../../../constants/layers';

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface SectionsLayerProps {
  roomSections?: RoomSection[];
  roomDimensions: { width: number; height: number };
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onUpdateRoomSection?: (sectionId: string, updates: Partial<RoomSection>) => void;
}

const SNAP_THRESHOLD = 0.5; // feet

// Multi-section backgrounds with move/resize handles, adjacency indicators,
// and snap guides. Owns all section-editing interaction state.
const SectionsLayer: React.FC<SectionsLayerProps> = ({
  roomSections,
  roomDimensions,
  scale,
  canvasWidth,
  canvasHeight,
  canvasRef,
  onUpdateRoomSection,
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge | null>(null);
  const [sectionDragStart, setSectionDragStart] = useState<{ x: number; y: number } | null>(null);
  const [snapGuides, setSnapGuides] = useState<
    { type: 'vertical' | 'horizontal'; position: number }[]
  >([]);

  const handleSectionMouseDown = (e: React.MouseEvent, sectionId: string, edge?: ResizeEdge) => {
    if (!onUpdateRoomSection || !roomSections) return;

    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const section = roomSections.find((s) => s.id === sectionId);
    if (!section) return;

    if (edge) {
      setResizingSectionId(sectionId);
      setResizeEdge(edge);
      setSectionDragStart({ x: mouseX, y: mouseY });
    } else {
      setDraggingSectionId(sectionId);
      setSectionDragStart({ x: mouseX - section.x, y: mouseY - section.y });
    }
  };

  useEffect(() => {
    if (!draggingSectionId && !resizingSectionId) return;

    const handleSectionMouseMove = (e: MouseEvent) => {
      if (!onUpdateRoomSection || !roomSections) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;

      // Moving
      if (draggingSectionId && sectionDragStart) {
        const section = roomSections.find((s) => s.id === draggingSectionId);
        if (!section) return;

        let newX = mouseX - sectionDragStart.x;
        let newY = mouseY - sectionDragStart.y;

        newX = Math.round(newX * 2) / 2; // 0.5 ft grid
        newY = Math.round(newY * 2) / 2;

        const guides: { type: 'vertical' | 'horizontal'; position: number }[] = [];

        for (const other of roomSections) {
          if (other.id === draggingSectionId) continue;

          if (Math.abs(newX - (other.x + other.width)) < SNAP_THRESHOLD) {
            newX = other.x + other.width;
            guides.push({ type: 'vertical', position: newX });
          }
          if (Math.abs(newX + section.width - other.x) < SNAP_THRESHOLD) {
            newX = other.x - section.width;
            guides.push({ type: 'vertical', position: other.x });
          }
          if (Math.abs(newY - (other.y + other.height)) < SNAP_THRESHOLD) {
            newY = other.y + other.height;
            guides.push({ type: 'horizontal', position: newY });
          }
          if (Math.abs(newY + section.height - other.y) < SNAP_THRESHOLD) {
            newY = other.y - section.height;
            guides.push({ type: 'horizontal', position: other.y });
          }
        }

        setSnapGuides(guides);

        newX = Math.max(0, Math.min(roomDimensions.width - section.width, newX));
        newY = Math.max(0, Math.min(roomDimensions.height - section.height, newY));

        onUpdateRoomSection(draggingSectionId, { x: newX, y: newY });
      }

      // Resizing
      if (resizingSectionId && resizeEdge && sectionDragStart) {
        const section = roomSections.find((s) => s.id === resizingSectionId);
        if (!section) return;

        const deltaX = mouseX - sectionDragStart.x;
        const deltaY = mouseY - sectionDragStart.y;

        let newX = section.x;
        let newY = section.y;
        let newWidth = section.width;
        let newHeight = section.height;

        if (resizeEdge.includes('e')) {
          newWidth = Math.max(4, section.width + deltaX);
        }
        if (resizeEdge.includes('w')) {
          const constrainedDelta = Math.min(deltaX, section.width - 4);
          newX = section.x + constrainedDelta;
          newWidth = section.width - constrainedDelta;
        }
        if (resizeEdge.includes('s')) {
          newHeight = Math.max(4, section.height + deltaY);
        }
        if (resizeEdge.includes('n')) {
          const constrainedDelta = Math.min(deltaY, section.height - 4);
          newY = section.y + constrainedDelta;
          newHeight = section.height - constrainedDelta;
        }

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

    window.addEventListener('mousemove', handleSectionMouseMove);
    window.addEventListener('mouseup', handleSectionMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleSectionMouseMove);
      window.removeEventListener('mouseup', handleSectionMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingSectionId, resizingSectionId, sectionDragStart, resizeEdge, roomSections, scale]);

  if (!roomSections || roomSections.length === 0) {
    // Single room: plain sheet background
    return <div className="absolute inset-0 bg-white" style={{ zIndex: Z.FLOOR }} />;
  }

  const bgColors = ['bg-blue-50/30', 'bg-green-50/30', 'bg-purple-50/30', 'bg-amber-50/30', 'bg-rose-50/30'];

  return (
    <>
      {roomSections.map((section, index) => {
        const isHovered = hoveredSectionId === section.id;
        const isDragging = draggingSectionId === section.id;
        const isResizing = resizingSectionId === section.id;
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
              left: section.x * scale,
              top: section.y * scale,
              width: section.width * scale,
              height: section.height * scale,
            }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {/* Label / drag handle */}
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

            {/* Resize handles */}
            {onUpdateRoomSection && (isHovered || isResizing) && !isDragging && (
              <>
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'nw')} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'ne')} />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'sw')} />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'se')} />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary rounded-full cursor-n-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'n')} />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary rounded-full cursor-s-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 's')} />
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-8 bg-primary rounded-full cursor-w-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'w')} />
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-8 bg-primary rounded-full cursor-e-resize border-2 border-white shadow-md" onMouseDown={(e) => handleSectionMouseDown(e, section.id, 'e')} />
              </>
            )}

            {/* Dimension chip on hover */}
            {isHovered && !isDragging && !isResizing && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-500 select-none pointer-events-none border border-gray-200">
                {section.width}' × {section.height}'
              </div>
            )}
          </div>
        );
      })}

      {/* Adjacency indicators */}
      {roomSections.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasWidth}
          height={canvasHeight}
          style={{ zIndex: Z.CONNECTIONS }}
        >
          {roomSections.map((section1, idx1) =>
            roomSections.slice(idx1 + 1).map((section2) => {
              const isHorizontallyAdjacent =
                (section1.x + section1.width === section2.x || section2.x + section2.width === section1.x) &&
                !(section1.y + section1.height <= section2.y || section2.y + section2.height <= section1.y);

              const isVerticallyAdjacent =
                (section1.y + section1.height === section2.y || section2.y + section2.height === section1.y) &&
                !(section1.x + section1.width <= section2.x || section2.x + section2.width <= section1.x);

              if (!isHorizontallyAdjacent && !isVerticallyAdjacent) return null;

              let x1, y1, x2, y2;
              if (isHorizontallyAdjacent) {
                const sharedX = section1.x + section1.width === section2.x ? section1.x + section1.width : section2.x + section2.width;
                const overlapTop = Math.max(section1.y, section2.y);
                const overlapBottom = Math.min(section1.y + section1.height, section2.y + section2.height);
                const midY = (overlapTop + overlapBottom) / 2;

                x1 = sharedX * scale;
                y1 = midY * scale - 20;
                x2 = sharedX * scale;
                y2 = midY * scale + 20;
              } else {
                const sharedY = section1.y + section1.height === section2.y ? section1.y + section1.height : section2.y + section2.height;
                const overlapLeft = Math.max(section1.x, section2.x);
                const overlapRight = Math.min(section1.x + section1.width, section2.x + section2.width);
                const midX = (overlapLeft + overlapRight) / 2;

                x1 = midX * scale - 20;
                y1 = sharedY * scale;
                x2 = midX * scale + 20;
                y2 = sharedY * scale;
              }

              return (
                <g key={`connection-${section1.id}-${section2.id}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                  <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="4" fill="#10B981" opacity="0.8" />
                </g>
              );
            })
          )}
        </svg>
      )}

      {/* Snap guides while dragging */}
      {snapGuides.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasWidth}
          height={canvasHeight}
          style={{ zIndex: Z.GUIDES }}
        >
          {snapGuides.map((guide, index) =>
            guide.type === 'vertical' ? (
              <line
                key={`guide-${index}`}
                x1={guide.position * scale}
                y1={0}
                x2={guide.position * scale}
                y2={canvasHeight}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            ) : (
              <line
                key={`guide-${index}`}
                x1={0}
                y1={guide.position * scale}
                x2={canvasWidth}
                y2={guide.position * scale}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            )
          )}
        </svg>
      )}
    </>
  );
};

export default SectionsLayer;
