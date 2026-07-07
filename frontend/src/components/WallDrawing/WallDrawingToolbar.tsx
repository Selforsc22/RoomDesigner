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
  const modeButton = (m: WallDrawingMode, label: string, title: string, danger = false) => (
    <button
      onClick={() => onModeChange(m)}
      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
        mode === m
          ? danger
            ? 'bg-danger text-ink'
            : 'bg-accent text-ink'
          : 'bg-surface-overlay text-ink-secondary hover:bg-surface-hover hover:text-ink'
      }`}
      title={title}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface-raised border-b border-line-subtle px-4 py-2 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Mode Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-secondary">Wall Tools:</span>
          <div className="flex rounded-md overflow-hidden border border-line-medium divide-x divide-line-medium">
            {modeButton('select', 'Select', 'Select and move walls')}
            {modeButton('draw', 'Draw Wall', 'Draw new walls')}
            {modeButton('edit', 'Edit', 'Edit wall endpoints')}
            {modeButton('delete', 'Delete', 'Delete walls', true)}
          </div>
        </div>

        {/* Wall Thickness Slider */}
        <div className="flex items-center gap-2">
          <label htmlFor="wall-thickness" className="text-sm font-medium text-ink-secondary">
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
            className="slider-matte w-24"
          />
          <span className="text-sm text-ink-muted min-w-[3rem]">
            {wallThickness.toFixed(2)} ft
          </span>
        </div>

        {/* Snap to Grid Toggle */}
        <label htmlFor="snap-to-grid" className="flex items-center gap-2 cursor-pointer">
          <input
            id="snap-to-grid"
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => onSnapToGridChange(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm font-medium text-ink-secondary">Snap to Grid</span>
        </label>

        {/* Finish Drawing Button (only show when drawing) */}
        {isDrawing && onFinishDrawing && (
          <button
            onClick={onFinishDrawing}
            className="btn-glossy btn-glossy-success px-4 py-1.5 text-sm"
          >
            Finish Wall
          </button>
        )}

        {/* Instructions */}
        <div className="ml-auto text-sm text-ink-muted italic">
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
