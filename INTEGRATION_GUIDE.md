# Integration Guide: Wall Drawing, Doors/Windows in Walls, and Compass

This guide explains how to integrate the new Sweet Home 3D features into the RoomDesigner application.

## Files Created

1. **Types** (`frontend/src/types/index.ts`) - Added Wall, FloorPlan interfaces and updated Door/Window
2. **Wall Geometry** (`frontend/src/utils/wallGeometry.ts`) - Core algorithms for wall calculations
3. **Wall Drawing Toolbar** (`frontend/src/components/WallDrawing/WallDrawingToolbar.tsx`) - UI controls
4. **Wall Renderer** (`frontend/src/components/WallDrawing/WallRenderer.tsx`) - Renders walls with openings
5. **Compass** (`frontend/src/components/Canvas/Compass.tsx`) - North direction indicator

## Integration Steps

### Step 1: Add Mode Selection to MainLayout

In `MainLayout.tsx`, add room mode state:

```typescript
type RoomMode = 'simple' | 'multi-section' | 'free-form-walls';
const [roomMode, setRoomMode] = useState<RoomMode>('simple');
const [wallDrawingMode, setWallDrawingMode] = useState<WallDrawingMode>('select');
const [wallThickness, setWallThickness] = useState(0.5);
const [snapToGrid, setSnapToGrid] = useState(true);
const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
```

### Step 2: Add Mode Detection Logic

```typescript
const detectRoomMode = (): RoomMode => {
  if (!currentDesign) return 'simple';
  if (currentDesign.floorPlan?.walls.length > 0) return 'free-form-walls';
  if (currentDesign.roomSections?.length > 0) return 'multi-section';
  return 'simple';
};

useEffect(() => {
  setRoomMode(detectRoomMode());
}, [currentDesign]);
```

### Step 3: Add Mode Switcher UI

In the top toolbar, add:

```tsx
<div className="flex items-center gap-2">
  <label className="text-sm font-medium">Room Mode:</label>
  <select
    value={roomMode}
    onChange={(e) => handleModeChange(e.target.value as RoomMode)}
    className="border rounded px-3 py-1"
  >
    <option value="simple">Simple Rectangle</option>
    <option value="multi-section">Multi-Section (L/T/U)</option>
    <option value="free-form-walls">Free-Form Walls</option>
  </select>
</div>
```

### Step 4: Add Wall Toolbar (for free-form mode)

```tsx
{roomMode === 'free-form-walls' && (
  <WallDrawingToolbar
    mode={wallDrawingMode}
    onModeChange={setWallDrawingMode}
    wallThickness={wallThickness}
    onWallThicknessChange={setWallThickness}
    snapToGrid={snapToGrid}
    onSnapToGridChange={setSnapToGrid}
    isDrawing={!!drawingWallStart}
  />
)}
```

### Step 5: Integrate WallRenderer in RoomCanvas

In `RoomCanvas.tsx`, add:

```tsx
import WallRenderer from '../WallDrawing/WallRenderer';

// In the render method:
{design.floorPlan && (
  <WallRenderer
    floorPlan={design.floorPlan}
    doors={doors}
    windows={windows}
    scale={SCALE}
    mode={wallDrawingMode}
    wallThickness={wallThickness}
    snapToGridEnabled={snapToGrid}
    selectedWallId={selectedWallId}
    onSelectWall={setSelectedWallId}
    onUpdateWall={handleUpdateWall}
    onDeleteWall={handleDeleteWall}
    onAddWall={handleAddWall}
  />
)}
```

### Step 6: Add Wall Management Functions

In `MainLayout.tsx`:

```typescript
const handleAddWall = (wall: Omit<Wall, 'id'>) => {
  if (!currentDesign) return;

  const newWall: Wall = {
    ...wall,
    id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  const updatedWalls = [...(currentDesign.floorPlan?.walls || []), newWall];
  const bounds = calculateFloorPlanBounds(updatedWalls);

  setCurrentDesign({
    ...currentDesign,
    floorPlan: {
      id: currentDesign.floorPlan?.id || `floorplan-${Date.now()}`,
      walls: updatedWalls,
      bounds,
    },
  });
};

const handleUpdateWall = (id: string, updates: Partial<Wall>) => {
  if (!currentDesign?.floorPlan) return;

  const updatedWalls = currentDesign.floorPlan.walls.map(wall =>
    wall.id === id ? { ...wall, ...updates } : wall
  );
  const bounds = calculateFloorPlanBounds(updatedWalls);

  setCurrentDesign({
    ...currentDesign,
    floorPlan: {
      ...currentDesign.floorPlan,
      walls: updatedWalls,
      bounds,
    },
  });
};

const handleDeleteWall = (id: string) => {
  if (!currentDesign?.floorPlan) return;

  const updatedWalls = currentDesign.floorPlan.walls.filter(wall => wall.id !== id);
  const bounds = calculateFloorPlanBounds(updatedWalls);

  setCurrentDesign({
    ...currentDesign,
    floorPlan: {
      ...currentDesign.floorPlan,
      walls: updatedWalls,
      bounds,
    },
  });
};
```

### Step 7: Add Compass to Canvas

In `RoomCanvas.tsx`, add at the end of the render method:

```tsx
import Compass from './Compass';

// In the component:
<Compass
  northAngle={design.northAngle || 0}
  onAngleChange={(angle) => onUpdateDesign({ northAngle: angle })}
  editable={true}
  size={80}
/>
```

### Step 8: Update PropertiesPanel for Wall-Mode Doors/Windows

When a door or window is selected and `roomMode === 'free-form-walls'`:

```tsx
{selectedItem.type === 'door' && design.floorPlan && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Wall
      </label>
      <select
        value={selectedItem.item.wallId || ''}
        onChange={(e) => onUpdate({ wallId: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">Select a wall</option>
        {design.floorPlan.walls.map(wall => (
          <option key={wall.id} value={wall.id}>
            Wall {wall.id.slice(0, 6)}... ({calculateWallLength(wall).toFixed(1)} ft)
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Position Along Wall
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={selectedItem.item.position || 0.5}
        onChange={(e) => onUpdate({ position: parseFloat(e.target.value) })}
        className="w-full"
      />
      <span className="text-xs text-gray-500">
        {((selectedItem.item.position || 0.5) * 100).toFixed(0)}%
      </span>
    </div>
  </>
)}
```

### Step 9: Add Mode Conversion

```typescript
const handleModeChange = (newMode: RoomMode) => {
  if (!currentDesign) return;

  if (newMode === 'free-form-walls' && currentDesign.roomDimensions) {
    // Convert simple rectangle to walls
    const floorPlan = convertRectangleToWalls(currentDesign.roomDimensions);

    // Convert legacy doors and windows
    const updatedDoors = currentDesign.doors.map(door =>
      convertLegacyDoorToWallMode(door, currentDesign.roomDimensions)
    );
    const updatedWindows = currentDesign.windows.map(window =>
      convertLegacyWindowToWallMode(window, currentDesign.roomDimensions)
    );

    setCurrentDesign({
      ...currentDesign,
      floorPlan,
      doors: updatedDoors,
      windows: updatedWindows,
    });
  }

  setRoomMode(newMode);
};
```

### Step 10: Update Backend Schema (Optional)

Update the Design model in the backend to include the new fields:

```typescript
// backend/src/models/Design.ts

floorPlan: {
  id: String,
  walls: [{
    id: String,
    startX: Number,
    startY: Number,
    endX: Number,
    endY: Number,
    thickness: Number,
    type: { type: String, enum: ['exterior', 'interior'] },
    connectedWalls: [String],
  }],
  bounds: {
    minX: Number,
    minY: Number,
    maxX: Number,
    maxY: Number,
  },
},
northAngle: { type: Number, default: 0 },
```

Update Door and Window schemas:

```typescript
// Make wall and x/y optional
wall: { type: String, enum: ['north', 'south', 'east', 'west'], required: false },
x: { type: Number, required: false },

// Add new fields
wallId: { type: String, required: false },
position: { type: Number, required: false }, // 0-1
```

## Testing Checklist

- [ ] Can switch between room modes
- [ ] Can draw walls in free-form mode
- [ ] Can edit wall endpoints
- [ ] Can delete walls
- [ ] Walls render with correct thickness
- [ ] Doors create openings in walls
- [ ] Windows create openings in walls
- [ ] Can position doors/windows along walls
- [ ] Compass displays and rotates
- [ ] North angle persists
- [ ] Mode conversion works (simple → free-form)
- [ ] Legacy designs load correctly
- [ ] Designs save and load properly

## Known Limitations

1. **No automatic door/window attachment**: When adding doors/windows in free-form mode, they need to be manually assigned to walls via the properties panel
2. **No wall corner merging**: Walls that meet at corners are rendered separately; consider adding corner miter rendering for better visuals
3. **Furniture constraints**: Furniture constraint checking for free-form floor plans uses ray-casting; performance may degrade with very complex floor plans (50+ walls)
4. **No undo/redo for wall drawing**: Wall operations aren't integrated with the history system yet

## Future Enhancements

1. **Smart door/window placement**: Click on a wall to place a door/window directly
2. **Wall dimensions display**: Show wall length while drawing
3. **Automatic room detection**: Detect enclosed rooms from walls
4. **3D view integration**: Use wall data for 3D rendering
5. **Floor textures**: Add different floor finishes to sections
6. **Furniture snapping**: Snap furniture to walls at specific distances
