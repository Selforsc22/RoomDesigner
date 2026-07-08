import React from 'react';
import type { RoomSection } from '../../../types';
import { Z } from '../../../constants/layers';

interface GridLayerProps {
  show: boolean;
  roomDimensions: { width: number; height: number };
  roomSections?: RoomSection[];
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

// 1-foot grid, drawn per-section in multi-section mode, full-canvas otherwise.
const GridLayer: React.FC<GridLayerProps> = React.memo(
  ({ show, roomDimensions, roomSections, scale, canvasWidth, canvasHeight }) => {
    if (!show) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasWidth}
        height={canvasHeight}
        style={{ zIndex: Z.GRID }}
      >
        {roomSections && roomSections.length > 0 ? (
          roomSections.map((section) => (
            <g key={`grid-${section.id}`}>
              {Array.from({ length: section.width + 1 }).map((_, i) => (
                <line
                  key={`v-${section.id}-${i}`}
                  x1={(section.x + i) * scale}
                  y1={section.y * scale}
                  x2={(section.x + i) * scale}
                  y2={(section.y + section.height) * scale}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: section.height + 1 }).map((_, i) => (
                <line
                  key={`h-${section.id}-${i}`}
                  x1={section.x * scale}
                  y1={(section.y + i) * scale}
                  x2={(section.x + section.width) * scale}
                  y2={(section.y + i) * scale}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
              ))}
            </g>
          ))
        ) : (
          <>
            {Array.from({ length: roomDimensions.width + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * scale}
                y1={0}
                x2={i * scale}
                y2={canvasHeight}
                stroke="#F3F4F6"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: roomDimensions.height + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * scale}
                x2={canvasWidth}
                y2={i * scale}
                stroke="#F3F4F6"
                strokeWidth="1"
              />
            ))}
          </>
        )}
      </svg>
    );
  }
);

GridLayer.displayName = 'GridLayer';

export default GridLayer;
