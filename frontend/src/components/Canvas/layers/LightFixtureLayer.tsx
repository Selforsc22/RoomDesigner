import React from 'react';
import type { FurnitureItem } from '../../../types';
import { getActiveLights, kelvinToRGB, LIGHT_DEFAULTS } from '../../../utils/lighting';
import { Z } from '../../../constants/layers';

interface LightFixtureLayerProps {
  furniture: FurnitureItem[];
  scale: number;
  selectedItemId: string | null;
  draggingItemId: string | null;
  onMouseDown: (e: React.MouseEvent, itemId: string) => void;
  onHoverChange: (itemId: string | null) => void;
}

// All light fixtures. Static rendering only — no animation (REVAMP.md A5).
// Color comes exclusively from utils/lighting's kelvinToRGB.
const LightFixtureLayer: React.FC<LightFixtureLayerProps> = React.memo(
  ({
    furniture,
    scale,
    selectedItemId,
    draggingItemId,
    onMouseDown,
    onHoverChange,
  }) => {
    // Render every light, including intensity-0 ones (they're still fixtures
    // on the floor plan; they just cast no beam).
    const lights = furniture.filter((item) => item.isLight);
    if (lights.length === 0) return null;

    const activeIds = new Set(getActiveLights(furniture).map((l) => l.id));

    return (
      <>
        {lights.map((item) => {
          const direction = item.lightDirection ?? LIGHT_DEFAULTS.direction;
          const intensity = item.lightIntensity ?? LIGHT_DEFAULTS.intensity;
          const colorTemp =
            item.colorTemperature ?? LIGHT_DEFAULTS.colorTemperature;
          const lightColor = kelvinToRGB(colorTemp);
          const isSelected = selectedItemId === item.id;
          const isActive = activeIds.has(item.id);

          const isRotated = item.rotation === 90 || item.rotation === 270;
          const displayWidth = (isRotated ? item.height : item.width) * scale;
          const displayHeight = (isRotated ? item.width : item.height) * scale;

          return (
            <div
              key={item.id}
              className={`absolute transition-shadow duration-150 ${
                draggingItemId === item.id ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                left: item.x * scale,
                top: item.y * scale,
                width: displayWidth,
                height: displayHeight,
                opacity: draggingItemId === item.id ? 0.7 : 1,
                zIndex: isSelected ? Z.SELECTED : Z.LIGHT_FIXTURES,
              }}
              onMouseDown={(e) => onMouseDown(e, item.id)}
              onMouseEnter={() => onHoverChange(item.id)}
              onMouseLeave={() => onHoverChange(null)}
              title={`${item.name} — ${intensity}% @ ${colorTemp}K, ${direction}°`}
            >
              <svg
                width={displayWidth}
                height={displayHeight}
                viewBox="0 0 100 100"
                className="pointer-events-none"
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 ${
                        (isSelected ? intensity / 5 : intensity / 10) || 1
                      }px ${lightColor})`
                    : undefined,
                }}
              >
                <g transform={`rotate(${direction - 90} 50 50)`}>
                  {/* Light body — kelvin-colored so a tungsten fixture reads warm */}
                  <rect
                    x="35"
                    y="30"
                    width="30"
                    height="20"
                    rx="3"
                    fill={lightColor}
                    stroke="#475569"
                    strokeWidth="2.5"
                  />

                  {/* Direction arrow: dark casing under kelvin color for
                      contrast against the light canvas floor */}
                  <path
                    d="M 50 52 L 50 78 M 44 71 L 50 78 L 56 71"
                    stroke="#334155"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M 50 52 L 50 78 M 44 71 L 50 78 L 56 71"
                    stroke={lightColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* Lens indicator — static, dimmed when the light is off */}
                  <circle
                    cx="50"
                    cy="40"
                    r="4.5"
                    fill={lightColor}
                    stroke="#334155"
                    strokeWidth="1.5"
                    opacity={isActive ? 1 : 0.35}
                  />
                </g>

                {isSelected && (
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="3"
                    opacity="0.9"
                  />
                )}
              </svg>

              {/* Label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded shadow-sm pointer-events-none">
                {item.name}
              </div>
            </div>
          );
        })}
      </>
    );
  }
);

LightFixtureLayer.displayName = 'LightFixtureLayer';

export default LightFixtureLayer;
