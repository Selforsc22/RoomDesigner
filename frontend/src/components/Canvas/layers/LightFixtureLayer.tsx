import React, { useEffect, useRef, useState } from 'react';
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
  onRotate: (itemId: string, direction: number) => void;
}

// All light fixtures + the drag-to-aim rotation handle for the selected one.
// Static rendering only — no animation (REVAMP.md A5). Color comes
// exclusively from utils/lighting's kelvinToRGB.
const LightFixtureLayer: React.FC<LightFixtureLayerProps> = React.memo(
  ({
    furniture,
    scale,
    selectedItemId,
    draggingItemId,
    onMouseDown,
    onHoverChange,
    onRotate,
  }) => {
    const [rotatingId, setRotatingId] = useState<string | null>(null);
    // Fixture center in client coordinates, captured when the handle drag
    // starts so the pivot stays fixed while the dot follows the pointer.
    const rotateCenterRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      if (!rotatingId) return;

      const handleMove = (e: MouseEvent) => {
        const center = rotateCenterRef.current;
        if (!center) return;

        let deg =
          (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) /
            Math.PI;
        deg = (deg + 360) % 360;
        if (e.shiftKey) deg = (Math.round(deg / 15) * 15) % 360;

        onRotate(rotatingId, Math.round(deg));
      };

      const handleUp = () => {
        setRotatingId(null);
        rotateCenterRef.current = null;
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
    }, [rotatingId, onRotate]);

    const startRotate = (
      e: React.MouseEvent<SVGCircleElement>,
      itemId: string
    ) => {
      // Don't let the fixture's move-drag start
      e.stopPropagation();
      e.preventDefault();

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      rotateCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setRotatingId(itemId);
    };

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
          const isRotating = rotatingId === item.id;

          const isRotated = item.rotation === 90 || item.rotation === 270;
          const displayWidth = (isRotated ? item.height : item.width) * scale;
          const displayHeight = (isRotated ? item.width : item.height) * scale;

          // Rotation handle ring: comfortably outside the fixture
          const ringRadius = Math.max(displayWidth, displayHeight) * 0.75 + 14;
          const handleSize = ringRadius * 2 + 24;
          const dirRad = (direction * Math.PI) / 180;
          const dotX = handleSize / 2 + Math.cos(dirRad) * ringRadius;
          const dotY = handleSize / 2 + Math.sin(dirRad) * ringRadius;

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

              {/* Drag-to-aim rotation handle (selected light only) */}
              {isSelected && (
                <svg
                  width={handleSize}
                  height={handleSize}
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: Z.HANDLES,
                    overflow: 'visible',
                  }}
                >
                  <circle
                    cx={handleSize / 2}
                    cy={handleSize / 2}
                    r={ringRadius}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    opacity="0.7"
                  />
                  {/* Aim line from center to the grab dot */}
                  <line
                    x1={handleSize / 2}
                    y1={handleSize / 2}
                    x2={dotX}
                    y2={dotY}
                    stroke="#6366F1"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="7"
                    fill="#6366F1"
                    stroke="white"
                    strokeWidth="2.5"
                    style={{
                      pointerEvents: 'auto',
                      cursor: isRotating ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={(e) => startRotate(e, item.id)}
                  />
                </svg>
              )}

              {/* Degree readout while aiming */}
              {isRotating && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-indigo-600 px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap"
                  style={{ top: -ringRadius - 14, zIndex: Z.HANDLES }}
                >
                  {direction}°{' '}
                  <span className="font-normal opacity-75">(Shift: snap 15°)</span>
                </div>
              )}

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
