import React from 'react';
import type { FurnitureItem } from '../../../types';
import { getAmbientTint } from '../../../utils/lighting';
import { Z } from '../../../constants/layers';

interface AmbientLightLayerProps {
  furniture: FurnitureItem[];
}

// Room-wide color cast from the active lights' weighted-average temperature.
const AmbientLightLayer: React.FC<AmbientLightLayerProps> = React.memo(
  ({ furniture }) => {
    const tint = getAmbientTint(furniture);
    if (!tint) return null;

    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: tint.color,
          opacity: tint.opacity,
          mixBlendMode: 'multiply',
          zIndex: Z.AMBIENT,
        }}
      />
    );
  }
);

AmbientLightLayer.displayName = 'AmbientLightLayer';

export default AmbientLightLayer;
