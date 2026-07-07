import type { FurnitureItem } from '../types';

// ---------------------------------------------------------------------------
// The ONLY lighting math in the app (REVAMP.md decision A1).
// Components never compute light color, beam geometry, or falloff themselves.
// All geometry is in FEET; callers convert to pixels at render time.
// ---------------------------------------------------------------------------

export const LIGHT_DEFAULTS = {
  intensity: 80,      // %
  colorTemperature: 5600, // K (daylight)
  beamAngle: 60,      // degrees
  direction: 0,       // degrees, 0 = +x (right), 90 = +y (down)
} as const;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// Continuous Kelvin -> hex color (Tanner Helland approximation).
// Replaces the old 4-bucket mapping that produced visible banding.
export function kelvinToRGB(kelvin: number): string {
  const temp = clamp(kelvin, 1000, 12000) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (temp <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    b =
      temp <= 19
        ? 0
        : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    b = 255;
  }

  const toHex = (v: number) =>
    Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface BeamGeometry {
  origin: { x: number; y: number };    // feet — on the fixture's emitting edge
  leftEdge: { x: number; y: number };  // feet — far corner of the cone
  rightEdge: { x: number; y: number }; // feet — far corner of the cone
  length: number;                      // feet
  direction: number;                   // degrees (resolved default)
}

// Beam cone for a light, in room coordinates (feet). Zoom-independent by
// construction: multiply by SCALE only when drawing.
export function getBeamGeometry(
  light: FurnitureItem,
  roomDims: { width: number; height: number }
): BeamGeometry {
  const direction = light.lightDirection ?? LIGHT_DEFAULTS.direction;
  const intensity = light.lightIntensity ?? LIGHT_DEFAULTS.intensity;
  const beamAngle = light.beamAngle ?? LIGHT_DEFAULTS.beamAngle;

  const centerX = light.x + light.width / 2;
  const centerY = light.y + light.height / 2;
  const dirRad = (direction * Math.PI) / 180;

  // Beam starts where the fixture physically ends, never inside the icon.
  const edgeOffset = Math.max(light.width, light.height) / 2;
  const origin = {
    x: centerX + Math.cos(dirRad) * edgeOffset,
    y: centerY + Math.sin(dirRad) * edgeOffset,
  };

  // 8ft base + up to 10ft with intensity, capped relative to the room so a
  // beam never dwarfs a small set or vanishes in a large one.
  const diagonal = Math.sqrt(roomDims.width ** 2 + roomDims.height ** 2);
  const length = Math.min(8 + (intensity / 100) * 10, diagonal * 1.25);

  const halfRad = ((beamAngle / 2) * Math.PI) / 180;
  const leftEdge = {
    x: origin.x + Math.cos(dirRad - halfRad) * length,
    y: origin.y + Math.sin(dirRad - halfRad) * length,
  };
  const rightEdge = {
    x: origin.x + Math.cos(dirRad + halfRad) * length,
    y: origin.y + Math.sin(dirRad + halfRad) * length,
  };

  return { origin, leftEdge, rightEdge, length, direction };
}

export interface GradientStop {
  offset: string;   // e.g. '45%'
  opacity: number;  // 0-1
}

// Canonical beam falloff. Any renderer drawing a beam uses exactly this.
export function getFalloffStops(intensity: number): GradientStop[] {
  const i = clamp(intensity, 0, 100);
  return [
    { offset: '0%', opacity: i / 100 },
    { offset: '45%', opacity: i / 180 },
    { offset: '100%', opacity: 0 },
  ];
}

export function getActiveLights(furniture: FurnitureItem[]): FurnitureItem[] {
  return furniture.filter(
    (item) => item.isLight && (item.lightIntensity ?? 0) > 0
  );
}

// Room-wide color cast from the intensity-weighted average temperature.
// Opacity grows with distance from neutral daylight — a neutral set gets
// almost no tint, a heavily tungsten or cool set gets a visible cast.
export function getAmbientTint(
  furniture: FurnitureItem[]
): { color: string; opacity: number } | null {
  const lights = getActiveLights(furniture);
  if (lights.length === 0) return null;

  let weightedTemp = 0;
  let totalWeight = 0;
  for (const light of lights) {
    const intensity = light.lightIntensity ?? LIGHT_DEFAULTS.intensity;
    const temp = light.colorTemperature ?? LIGHT_DEFAULTS.colorTemperature;
    weightedTemp += temp * intensity;
    totalWeight += intensity;
  }
  const avgTemp = weightedTemp / totalWeight;

  const NEUTRAL_K = 5600;
  const deviation = clamp(Math.abs(avgTemp - NEUTRAL_K) / 2400, 0, 1);
  return {
    color: kelvinToRGB(avgTemp),
    opacity: 0.02 + 0.06 * deviation,
  };
}
