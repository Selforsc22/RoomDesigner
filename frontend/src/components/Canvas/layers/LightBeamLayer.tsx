import React from 'react';
import type { FurnitureItem } from '../../../types';
import {
  getActiveLights,
  getBeamGeometry,
  getFalloffStops,
  kelvinToRGB,
  LIGHT_DEFAULTS,
} from '../../../utils/lighting';
import { Z } from '../../../constants/layers';

interface LightBeamLayerProps {
  furniture: FurnitureItem[];
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  roomDims: { width: number; height: number };
}

// All light beams in one static SVG. Geometry comes from utils/lighting —
// this component only converts feet to pixels and draws.
const LightBeamLayer: React.FC<LightBeamLayerProps> = React.memo(
  ({ furniture, scale, canvasWidth, canvasHeight, roomDims }) => {
    const lights = getActiveLights(furniture);
    if (lights.length === 0) return null;

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasWidth}
        height={canvasHeight}
        style={{ zIndex: Z.LIGHT_BEAMS }}
      >
        <defs>
          {lights.map((light) => {
            const geom = getBeamGeometry(light, roomDims);
            const color = kelvinToRGB(
              light.colorTemperature ?? LIGHT_DEFAULTS.colorTemperature
            );
            const stops = getFalloffStops(
              light.lightIntensity ?? LIGHT_DEFAULTS.intensity
            );
            const farMidX = (geom.leftEdge.x + geom.rightEdge.x) / 2;
            const farMidY = (geom.leftEdge.y + geom.rightEdge.y) / 2;

            return (
              <linearGradient
                key={light.id}
                id={`beam-${light.id}`}
                gradientUnits="userSpaceOnUse"
                x1={geom.origin.x * scale}
                y1={geom.origin.y * scale}
                x2={farMidX * scale}
                y2={farMidY * scale}
              >
                {stops.map((stop, i) => (
                  <stop
                    key={i}
                    offset={stop.offset}
                    stopColor={color}
                    stopOpacity={stop.opacity}
                  />
                ))}
              </linearGradient>
            );
          })}
        </defs>

        {lights.map((light) => {
          const geom = getBeamGeometry(light, roomDims);
          const d = [
            `M ${geom.origin.x * scale} ${geom.origin.y * scale}`,
            `L ${geom.leftEdge.x * scale} ${geom.leftEdge.y * scale}`,
            `L ${geom.rightEdge.x * scale} ${geom.rightEdge.y * scale}`,
            'Z',
          ].join(' ');

          return <path key={light.id} d={d} fill={`url(#beam-${light.id})`} />;
        })}
      </svg>
    );
  }
);

LightBeamLayer.displayName = 'LightBeamLayer';

export default LightBeamLayer;
