import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface PropertiesPanelProps {
  selectedItem: { type: string; item: any } | null;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  onUpdate,
  onDelete,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!selectedItem) {
    return (
      <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {!isCollapsed && <LucideIcons.Settings className="w-5 h-5 text-gray-400" />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-gray-400">
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
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white shadow-lg overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <LucideIcons.Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Properties</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
      {!isCollapsed && <div className="p-6">

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (ft)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.width || 0}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (ft)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={item.height || 0}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X Position
              </label>
              <input
                type="number"
                step="0.1"
                value={item.x?.toFixed(1) || 0}
                onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y Position
              </label>
              <input
                type="number"
                step="0.1"
                value={item.y?.toFixed(1) || 0}
                onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Color (for furniture) */}
          {type === 'furniture' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={item.color || '#8B7355'}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="h-10 w-full rounded border border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Rotation (for furniture) */}
          {type === 'furniture' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rotation
              </label>
              <button
                onClick={handleRotate}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Light Intensity
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.lightIntensity || 80}
                    onChange={(e) => onUpdate({ lightIntensity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-medium text-gray-700">{item.lightIntensity || 80}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Color Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-orange-600">Warm</span>
                    <span className="font-medium text-gray-700">{item.colorTemperature || 5600}K</span>
                    <span className="text-blue-600">Cool</span>
                  </div>
                </div>
              </div>

              {/* Beam Angle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Spot</span>
                    <span className="font-medium text-gray-700">{item.beamAngle || 60}°</span>
                    <span className="text-gray-500">Flood</span>
                  </div>
                </div>
              </div>

              {/* Height off Ground */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (ft)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  value={item.zHeight || 6}
                  onChange={(e) => onUpdate({ zHeight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Height above floor</p>
              </div>

              {/* Light Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0°</span>
                    <span className="font-medium text-gray-700">{item.lightDirection || 0}°</span>
                    <span>360°</span>
                  </div>
                </div>
              </div>

              {/* Visual Indicator */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-900">Light Source</span>
                </div>
                <p className="text-xs text-yellow-700">
                  This item emits light with {item.lightIntensity || 80}% intensity at {item.colorTemperature || 5600}K
                </p>
              </div>
            </>
          )}

          {/* Image Upload (for wall objects) */}
          {type === 'wallObject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="space-y-2">
                {item.image && (
                  <div className="relative">
                    <img
                      src={item.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border border-gray-300"
                    />
                    <button
                      onClick={() => onUpdate({ image: undefined })}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
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
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-center cursor-pointer transition-colors">
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
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
