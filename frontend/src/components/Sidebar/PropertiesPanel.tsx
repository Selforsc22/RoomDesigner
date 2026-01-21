import React, { useState } from 'react';

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

  if (!selectedItem) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>Select an item to edit</p>
        </div>
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
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>

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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded font-medium"
              >
                Rotate 90° (Current: {item.rotation || 0}°)
              </button>
            </div>
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
                  <div className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded font-medium text-center cursor-pointer">
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="w-full py-2 px-4 bg-red-500 text-white rounded font-medium hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
