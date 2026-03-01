import React from 'react';

export type WallDrawingMode = 'select' | 'draw' | 'edit' | 'delete';

interface WallDrawingToolbarProps {
  mode: WallDrawingMode;
  onModeChange: (mode: WallDrawingMode) => void;
  wallThickness: number;
  onWallThicknessChange: (thickness: number) => void;
  snapToGrid: boolean;
  onSnapToGridChange: (snap: boolean) => void;
  onFinishDrawing?: () => void;
  isDrawing?: boolean;
}

const WallDrawingToolbar: React.FC<WallDrawingToolbarProps> = ({
  mode,
  onModeChange,
  wallThickness,
  onWallThicknessChange,
  snapToGrid,
  onSnapToGridChange,
  onFinishDrawing,
  isDrawing = false,
}) => {
  return (
    <div className="bg-white border-b border-gray-300 px-4 py-2 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Mode Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Wall Tools:</span>
          <div className="flex gap-1 border border-gray-300 rounded">
            <button
              onClick={() => onModeChange('select')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'select'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Select and move walls"
            >
              Select
            </button>
            <button
              onClick={() => onModeChange('draw')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                mode === 'draw'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Draw new walls"
            >
              Draw Wall
            </button>
            <button
              onClick={() => onModeChange('edit')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                mode === 'edit'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Edit wall endpoints"
            >
              Edit
            </button>
            <button
              onClick={() => onModeChange('delete')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                mode === 'delete'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Delete walls"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Wall Thickness Slider */}
        <div className="flex items-center gap-2">
          <label htmlFor="wall-thickness" className="text-sm font-medium text-gray-700">
            Thickness:
          </label>
          <input
            id="wall-thickness"
            type="range"
            min="0.25"
            max="1.0"
            step="0.25"
            value={wallThickness}
            onChange={(e) => onWallThicknessChange(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 min-w-[3rem]">
            {wallThickness.toFixed(2)} ft
          </span>
        </div>

        {/* Snap to Grid Toggle */}
        <div className="flex items-center gap-2">
          <label htmlFor="snap-to-grid" className="flex items-center gap-2 cursor-pointer">
            <input
              id="snap-to-grid"
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => onSnapToGridChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Snap to Grid
            </span>
          </label>
        </div>

        {/* Finish Drawing Button (only show when drawing) */}
        {isDrawing && onFinishDrawing && (
          <button
            onClick={onFinishDrawing}
            className="px-4 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
          >
            Finish Wall
          </button>
        )}

        {/* Instructions */}
        <div className="ml-auto text-sm text-gray-500 italic">
          {mode === 'select' && 'Click to select walls'}
          {mode === 'draw' && 'Click to place wall endpoints'}
          {mode === 'edit' && 'Select a wall, then drag its endpoints'}
          {mode === 'delete' && 'Click on walls to delete them'}
        </div>
      </div>
    </div>
  );
};

export default WallDrawingToolbar;
