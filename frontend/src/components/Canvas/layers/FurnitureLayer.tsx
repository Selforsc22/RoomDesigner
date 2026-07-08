import React from 'react';
import type { FurnitureItem } from '../../../types';
import { Z } from '../../../constants/layers';

interface FurnitureLayerProps {
  furniture: FurnitureItem[];
  scale: number;
  selectedItemId: string | null;
  draggingItemId: string | null;
  hoveredItemId: string | null;
  onMouseDown: (e: React.MouseEvent, itemId: string) => void;
  onHoverChange: (itemId: string | null) => void;
}

// Non-light furniture. Lights render in LightFixtureLayer (all lighting
// visuals live in dedicated layers backed by utils/lighting).
const FurnitureLayer: React.FC<FurnitureLayerProps> = React.memo(
  ({
    furniture,
    scale,
    selectedItemId,
    draggingItemId,
    hoveredItemId,
    onMouseDown,
    onHoverChange,
  }) => (
    <>
      {furniture.map((item) => {
        if (item.isLight) return null;

        const isRotated = item.rotation === 90 || item.rotation === 270;
        const displayWidth = (isRotated ? item.height : item.width) * scale;
        const displayHeight = (isRotated ? item.width : item.height) * scale;
        const isHovered = hoveredItemId === item.id;

        return (
          <div
            key={item.id}
            className={`absolute cursor-move flex flex-col items-center justify-center text-xs font-semibold rounded-md transition-all duration-200 ease-out ${
              selectedItemId === item.id
                ? 'ring-4 ring-primary ring-opacity-50 shadow-2xl scale-110'
                : 'shadow-md hover:shadow-xl hover:scale-105'
            } ${draggingItemId === item.id ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
            style={{
              left: item.x * scale,
              top: item.y * scale,
              width: displayWidth,
              height: displayHeight,
              background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
              opacity: draggingItemId === item.id ? 0.7 : 1,
              transform: draggingItemId === item.id ? 'rotate(2deg)' : 'rotate(0deg)',
              zIndex: selectedItemId === item.id ? Z.SELECTED : Z.FURNITURE,
            }}
            onMouseDown={(e) => onMouseDown(e, item.id)}
            onMouseEnter={() => onHoverChange(item.id)}
            onMouseLeave={() => onHoverChange(null)}
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
    </>
  )
);

FurnitureLayer.displayName = 'FurnitureLayer';

export default FurnitureLayer;
