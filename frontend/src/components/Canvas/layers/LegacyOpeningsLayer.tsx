import React from 'react';
import type { Door, Window as WindowType } from '../../../types';
import { Z } from '../../../constants/layers';

interface LegacyOpeningsLayerProps {
  doors: Door[];
  windows: WindowType[];
  roomDimensions: { width: number; height: number };
  scale: number;
}

// Legacy wall-edge doors/windows (rectangle/sections modes).
// Wall-mode openings render inside WallRenderer instead.
const LegacyOpeningsLayer: React.FC<LegacyOpeningsLayerProps> = React.memo(
  ({ doors, windows, roomDimensions, scale }) => (
    <>
      {doors.map((door) => {
        if (!door.wall || door.x === undefined) return null;
        const x = door.wall === 'west' ? 0 : door.wall === 'east' ? roomDimensions.width * scale - 2 : door.x * scale;
        const y = door.wall === 'north' ? 0 : door.wall === 'south' ? roomDimensions.height * scale - 2 : door.x * scale;
        const width = door.wall === 'north' || door.wall === 'south' ? door.width * scale : 2;
        const height = door.wall === 'east' || door.wall === 'west' ? door.width * scale : 2;

        return (
          <div
            key={door.id}
            className="absolute bg-amber-700 shadow-sm"
            style={{ left: x, top: y, width, height, zIndex: Z.DOORS_WINDOWS }}
          />
        );
      })}

      {windows.map((window) => {
        if (!window.wall || window.x === undefined || window.y === undefined) return null;
        const x = window.wall === 'west' ? 0 : window.wall === 'east' ? roomDimensions.width * scale - 2 : window.x * scale;
        const y = window.wall === 'north' ? 0 : window.wall === 'south' ? roomDimensions.height * scale - 2 : window.y * scale;
        const width = window.wall === 'north' || window.wall === 'south' ? window.width * scale : 2;
        const height = window.wall === 'east' || window.wall === 'west' ? window.height * scale : 2;

        return (
          <div
            key={window.id}
            className="absolute bg-blue-300 border-2 border-blue-500 shadow-sm"
            style={{ left: x, top: y, width, height, zIndex: Z.DOORS_WINDOWS }}
          />
        );
      })}
    </>
  )
);

LegacyOpeningsLayer.displayName = 'LegacyOpeningsLayer';

export default LegacyOpeningsLayer;
