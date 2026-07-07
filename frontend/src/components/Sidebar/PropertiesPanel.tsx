import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { kelvinToRGB } from '../../utils/lighting';

interface PropertiesPanelProps {
  selectedItem: { type: string; item: any } | null;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

const inputClass =
  'w-full bg-surface-overlay border border-line-medium rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors';

const labelClass = 'block text-sm font-medium text-ink-secondary mb-1';

// Kelvin slider track: real warm->cool sweep from the lighting engine
const KELVIN_TRACK = `linear-gradient(to right, ${kelvinToRGB(3200)}, ${kelvinToRGB(4400)}, ${kelvinToRGB(5600)}, ${kelvinToRGB(6500)})`;
const INTENSITY_TRACK = 'linear-gradient(to right, #23252e, #f9fafb)';

const CollapseChevron: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {collapsed ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    )}
  </svg>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  onUpdate,
  onDelete,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!selectedItem) {
    return (
      <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-surface-raised border-l border-line-subtle text-ink scrollbar-matte transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-line-subtle flex items-center justify-between">
          {!isCollapsed && <LucideIcons.Settings className="w-5 h-5 text-ink-muted" />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="icon-btn-glossy ml-auto"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <CollapseChevron collapsed={isCollapsed} />
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-ink-muted">
              <LucideIcons.MousePointer2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Select an item to edit its properties</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const { type, item } = selectedItem;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ image: base64String });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setUploadingImage(false);
    }
  };

  const handleRotate = () => {
    const currentRotation = item.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;
    onUpdate({ rotation: newRotation });
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-surface-raised border-l border-line-subtle text-ink scrollbar-matte overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-line-subtle flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <LucideIcons.Settings className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">Properties</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="icon-btn-glossy ml-auto"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <CollapseChevron collapsed={isCollapsed} />
        </button>
      </div>
      {!isCollapsed && <div className="p-6">

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} title="Width of the item in feet">
                Width (ft)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.width || 0}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} title="Height of the item in feet">
                Height (ft)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.height || 0}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} title="Horizontal position from left edge of room">
                X Position
              </label>
              <input
                type="number"
                step="0.1"
                value={item.x?.toFixed(1) || 0}
                onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} title="Vertical position from top edge of room">
                Y Position
              </label>
              <input
                type="number"
                step="0.1"
                value={item.y?.toFixed(1) || 0}
                onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Color (for furniture) */}
          {type === 'furniture' && (
            <div>
              <label className={labelClass} title="Click to choose a color for this item">
                Color
              </label>
              <input
                type="color"
                value={item.color || '#8B7355'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="h-10 w-full rounded-md border border-line-medium bg-surface-overlay cursor-pointer"
                title={`Current color: ${item.color || '#8B7355'}`}
              />
            </div>
          )}

          {/* Rotation (for furniture) */}
          {type === 'furniture' && (
            <div>
              <label className={labelClass}>Rotation</label>
              <button
                onClick={handleRotate}
                className="btn-glossy btn-glossy-neutral w-full flex items-center justify-center gap-2 py-2.5 px-4 font-medium"
                title="Rotate item by 90 degrees clockwise"
              >
                <LucideIcons.RotateCw className="w-4 h-4" />
                Rotate 90° (Current: {item.rotation || 0}°)
              </button>
            </div>
          )}

          {/* Lighting Controls (for lights) */}
          {type === 'furniture' && item.isLight && (
            <>
              {/* Light Intensity */}
              <div>
                <label className={labelClass} title="Adjust brightness of the light (0% = off, 100% = maximum)">
                  Light Intensity
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.lightIntensity || 80}
                    onChange={(e) => onUpdate({ lightIntensity: parseInt(e.target.value) })}
                    className="slider-matte"
                    style={{ background: INTENSITY_TRACK }}
                    title={`Set light brightness to ${item.lightIntensity || 80}%`}
                  />
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>0%</span>
                    <span className="font-medium text-ink">{item.lightIntensity || 80}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Color Temperature */}
              <div>
                <label className={labelClass} title="Adjust the warmth/coolness of the light (3200K = warm tungsten, 5600K = daylight, 6500K = cool blue)">
                  Color Temperature
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="3200"
                    max="6500"
                    step="100"
                    value={item.colorTemperature || 5600}
                    onChange={(e) => onUpdate({ colorTemperature: parseInt(e.target.value) })}
                    className="slider-matte"
                    style={{ background: KELVIN_TRACK }}
                    title={`Set color temperature to ${item.colorTemperature || 5600}K`}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-warning">Warm</span>
                    <span className="font-medium text-ink">{item.colorTemperature || 5600}K</span>
                    <span className="text-blue-300">Cool</span>
                  </div>
                </div>
              </div>

              {/* Beam Angle */}
              <div>
                <label className={labelClass} title="Adjust the spread of the light (15° = narrow spot, 120° = wide flood)">
                  Beam Angle
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={item.beamAngle || 60}
                    onChange={(e) => onUpdate({ beamAngle: parseInt(e.target.value) })}
                    className="slider-matte"
                    title={`Set beam angle to ${item.beamAngle || 60}°`}
                  />
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>Spot</span>
                    <span className="font-medium text-ink">{item.beamAngle || 60}°</span>
                    <span>Flood</span>
                  </div>
                </div>
              </div>

              {/* Height off Ground */}
              <div>
                <label className={labelClass} title="Set the vertical position of the light above the floor">
                  Height (ft)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  value={item.zHeight || 6}
                  onChange={(e) => onUpdate({ zHeight: parseFloat(e.target.value) })}
                  className={inputClass}
                  title={`Light is positioned ${item.zHeight || 6} feet above the floor`}
                />
                <p className="mt-1 text-xs text-ink-muted">Height above floor</p>
              </div>

              {/* Light Direction */}
              <div>
                <label className={labelClass} title="Adjust which direction the light is pointing (0° = right, 90° = down, 180° = left, 270° = up)">
                  Light Direction
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={item.lightDirection || 0}
                    onChange={(e) => onUpdate({ lightDirection: parseInt(e.target.value) })}
                    className="slider-matte"
                    title={`Light pointing at ${item.lightDirection || 0}° angle`}
                  />
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>0°</span>
                    <span className="font-medium text-ink">{item.lightDirection || 0}°</span>
                    <span>360°</span>
                  </div>
                  <p className="text-xs text-ink-faint">
                    Tip: drag the ring around the light on the canvas to aim it
                  </p>
                </div>
              </div>

              {/* Light summary card */}
              <div className="p-3 bg-surface-overlay border border-line-medium rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-warning" />
                  <span className="text-xs font-semibold text-ink">Light Source</span>
                </div>
                <p className="text-xs text-ink-secondary">
                  Emits at {item.lightIntensity || 80}% intensity, {item.colorTemperature || 5600}K
                </p>
              </div>
            </>
          )}

          {/* Image Upload (for wall objects) */}
          {type === 'wallObject' && (
            <div>
              <label className={labelClass}>Image</label>
              <div className="space-y-2">
                {item.image && (
                  <div className="relative">
                    <img
                      src={item.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md border border-line-medium"
                    />
                    <button
                      onClick={() => onUpdate({ image: undefined })}
                      className="absolute top-2 right-2 bg-danger text-ink px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="btn-glossy btn-glossy-neutral w-full flex items-center justify-center gap-2 py-2.5 px-4 font-medium text-center cursor-pointer">
                    <LucideIcons.Upload className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="btn-glossy btn-glossy-danger w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold"
          >
            <LucideIcons.Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>}
    </div>
  );
};

export default PropertiesPanel;
