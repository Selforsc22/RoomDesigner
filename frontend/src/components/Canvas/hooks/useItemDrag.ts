import { useEffect, useState } from 'react';
import type React from 'react';
import type { FurnitureItem, RoomSection, FloorPlan } from '../../../types';
import { isPointInFloorPlan } from '../../../utils/wallGeometry';

interface UseItemDragArgs {
  furniture: FurnitureItem[];
  scale: number;
  roomDimensions: { width: number; height: number };
  roomSections?: RoomSection[];
  floorPlan?: FloorPlan | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onUpdateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  onSelectItem: (id: string | null) => void;
}

// Furniture drag interaction shared by FurnitureLayer and LightFixtureLayer.
// Owns drag/hover state and enforces room / section / floor-plan bounds.
export function useItemDrag({
  furniture,
  scale,
  roomDimensions,
  roomSections,
  floorPlan,
  canvasRef,
  onUpdateFurniture,
  onSelectItem,
}: UseItemDragArgs) {
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const constrainToValidArea = (
    x: number,
    y: number,
    width: number,
    height: number
  ): { x: number; y: number } => {
    // Custom-walls mode: bound to the canvas; the caller separately rejects
    // moves whose center leaves the floor plan polygon.
    if (floorPlan && floorPlan.walls.length >= 3) {
      return {
        x: Math.max(0, Math.min(roomDimensions.width - width, x)),
        y: Math.max(0, Math.min(roomDimensions.height - height, y)),
      };
    }

    if (!roomSections || roomSections.length === 0) {
      return {
        x: Math.max(0, Math.min(roomDimensions.width - width, x)),
        y: Math.max(0, Math.min(roomDimensions.height - height, y)),
      };
    }

    // Multi-section: constrain to the section containing the item's center
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    for (const section of roomSections) {
      if (
        centerX >= section.x &&
        centerX <= section.x + section.width &&
        centerY >= section.y &&
        centerY <= section.y + section.height
      ) {
        return {
          x: Math.max(section.x, Math.min(section.x + section.width - width, x)),
          y: Math.max(section.y, Math.min(section.y + section.height - height, y)),
        };
      }
    }

    return {
      x: Math.max(0, Math.min(roomDimensions.width - width, x)),
      y: Math.max(0, Math.min(roomDimensions.height - height, y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = furniture.find((f) => f.id === itemId);
    if (!item) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - item.x * scale,
      y: e.clientY - rect.top - item.y * scale,
    });
    setDraggingItem(itemId);
    onSelectItem(itemId);
  };

  useEffect(() => {
    if (!draggingItem) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const item = furniture.find((f) => f.id === draggingItem);
      if (!item) return;

      const newX = (e.clientX - rect.left - dragOffset.x) / scale;
      const newY = (e.clientY - rect.top - dragOffset.y) / scale;

      const isRotated = item.rotation === 90 || item.rotation === 270;
      const effectiveWidth = isRotated ? item.height : item.width;
      const effectiveHeight = isRotated ? item.width : item.height;

      const constrained = constrainToValidArea(newX, newY, effectiveWidth, effectiveHeight);

      // Custom-walls mode: reject moves whose center leaves the floor plan
      if (floorPlan && floorPlan.walls.length >= 3) {
        const center = {
          x: constrained.x + effectiveWidth / 2,
          y: constrained.y + effectiveHeight / 2,
        };
        if (!isPointInFloorPlan(center, floorPlan)) return;
      }

      onUpdateFurniture(draggingItem, { x: constrained.x, y: constrained.y });
    };

    const handleMouseUp = () => setDraggingItem(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingItem, dragOffset, furniture, scale, floorPlan]);

  return { draggingItem, hoveredItemId, setHoveredItemId, handleMouseDown };
}
