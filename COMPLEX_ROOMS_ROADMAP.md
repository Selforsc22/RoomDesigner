# Complex Room Shapes - Implementation Roadmap

## Overview
This document outlines the plan for adding support for non-rectangular room layouts (L-shaped, T-shaped, U-shaped, etc.) to the Room & Wall Planner application.

## Current Status
**Foundation Complete** ✅
- Type system extended with `RoomSection` interface
- Design model supports optional `roomSections` array
- Backward compatibility maintained with existing `roomDimensions`
- Ready for implementation

---

## Phase 1: Data Model & Basic UI (2-3 hours)

### 1.1 Room Section Management
Add UI controls to create and manage room sections:

**Room Section Editor Panel**
- "Add Section" button to create new rectangular sections
- Visual list of all sections with:
  - Section name (editable)
  - Dimensions (width × height)
  - Position (x, y)
  - Delete button

**Section Properties**
- Name input (optional): "Living Room", "Kitchen", "Hallway"
- Width input (feet)
- Height input (feet)
- X position (feet from origin)
- Y position (feet from origin)

### 1.2 Canvas Rendering Updates
Modify `RoomCanvas.tsx` to support multiple sections:

**Rendering Logic**
```typescript
// If roomSections exists, render multiple rectangles
if (design.roomSections && design.roomSections.length > 0) {
  design.roomSections.forEach(section => {
    // Render each section as a separate rectangle
    // Draw walls, grid, and label
  });
} else {
  // Fallback to single roomDimensions (backward compatible)
  // Existing rendering logic
}
```

**Visual Enhancements**
- Different background colors for each section (subtle variations)
- Section name labels in corner of each section
- Connection lines/highlights where sections meet
- Dotted outlines for individual sections

### 1.3 Template Shapes
Pre-configured common layouts:

**L-Shape Templates**
- Small L (10×10 + 8×6)
- Medium L (15×12 + 10×8)
- Large L (20×15 + 12×10)

**T-Shape Templates**
- Small T (central 10×12 with 6×8 wings)
- Medium T (central 15×15 with 8×10 wings)

**U-Shape Templates**
- Small U (10×8 base with 6×12 sides)
- Medium U (15×10 base with 8×15 sides)

**Custom**
- Start from scratch with add/remove sections

---

## Phase 2: Visual Section Editor (2-3 hours)

### 2.1 Interactive Section Placement
Visual drag-and-drop section builder:

**Add Section Mode**
- Click "Add Section" activates drawing mode
- Click and drag on canvas to define new rectangle
- Shows dimension preview while dragging
- Snaps to grid for alignment

**Move Section Mode**
- Click section header/border to select
- Drag to reposition entire section
- Shows alignment guides when near other sections
- Snap-to-edge for perfect alignment

**Resize Section Mode**
- Drag edges/corners to resize sections
- Maintains minimum size (e.g., 4×4 ft)
- Shows current dimensions while resizing

### 2.2 Smart Alignment & Snapping
Auto-alignment features for clean layouts:

**Edge Snapping**
- When dragging section, snap to edges of other sections
- Visual indicators (dashed lines) show alignment
- Snap tolerance: 0.5 feet

**Connection Detection**
- Automatically detect when sections share walls
- Merge shared walls (don't render double lines)
- Update `connectedTo` array in RoomSection

**Gap Prevention**
- Warn if sections have gaps between them
- Highlight problematic areas
- Suggest fixes ("Move Section A 2ft left")

### 2.3 Wall Management Across Sections
Update wall system for multi-section rooms:

**Wall Type Extensions**
- Interior walls (between sections)
- Exterior walls (perimeter)
- Shared walls (merged between sections)

**Door/Window Placement**
- Support doors on interior walls
- Support doors/windows on exterior walls
- Validate placement (can't span section boundaries)

---

## Phase 3: Furniture Placement Logic (1-2 hours)

### 3.1 Section-Aware Furniture
Update furniture placement for multi-section rooms:

**Section Assignment**
- Each furniture item gets optional `sectionId?: string`
- Automatically assign section when furniture placed
- Prevent furniture from spanning multiple sections

**Validation Rules**
- Furniture must fit entirely within one section
- Warn if furniture overlaps section boundaries
- Auto-snap to section boundary when dragging

### 3.2 Cross-Section Features
Advanced furniture placement:

**Doorway Furniture**
- Special furniture types that span doorways
- Example: Archway, Room divider
- Can span between two connected sections

**Furniture Copying**
- "Duplicate to all sections" option
- Example: Place lamp in each room section
- Maintains relative position within section

---

## Phase 4: Advanced Features (Future)

### 4.1 Curved Walls & Angles
Beyond rectangles:

**Angled Walls**
- Support diagonal walls (45°, custom angles)
- Trapezoid and parallelogram sections
- Angle input in section properties

**Curved Walls**
- Arc-based wall segments
- Circular/oval sections
- Radius controls

### 4.2 Multi-Story Support
Vertical room planning:

**Floor Levels**
- First floor, second floor, basement
- Stairway placement between floors
- Floor selector in UI

**3D Preview**
- Basic 3D visualization
- Show height differences
- Camera angle controls

---

## Technical Implementation Details

### Data Structure

**Current Design Interface (Extended)**
```typescript
interface Design {
  // ... existing fields
  roomDimensions: { width: number; height: number }; // Kept for backward compatibility
  roomSections?: RoomSection[]; // NEW: Multi-section support
}

interface RoomSection {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connectedTo?: string[];
}

interface FurnitureItem {
  // ... existing fields
  sectionId?: string; // NEW: Which section this furniture belongs to
}
```

**Backward Compatibility Strategy**
```typescript
// Helper function to handle both old and new designs
function getRoomBounds(design: Design): { width: number; height: number } {
  if (design.roomSections && design.roomSections.length > 0) {
    // Calculate bounding box of all sections
    const maxX = Math.max(...design.roomSections.map(s => s.x + s.width));
    const maxY = Math.max(...design.roomSections.map(s => s.y + s.height));
    return { width: maxX, height: maxY };
  } else {
    // Use legacy single room dimensions
    return design.roomDimensions;
  }
}

// Migration helper (converts old designs to new format)
function migrateToMultiSection(design: Design): Design {
  if (!design.roomSections) {
    return {
      ...design,
      roomSections: [{
        id: 'main',
        name: 'Main Room',
        x: 0,
        y: 0,
        width: design.roomDimensions.width,
        height: design.roomDimensions.height,
      }],
    };
  }
  return design;
}
```

---

## UI/UX Considerations

### Toolbar Updates
```
[Room Mode ▾] | [Add Section +] [Edit Sections] | [Undo] [Redo] | [Grid] [Zoom]
```

**Room Mode Dropdown:**
- Simple Room (default, current behavior)
- L-Shaped Room (template)
- T-Shaped Room (template)
- U-Shaped Room (template)
- Custom Multi-Section (advanced editor)

### Left Sidebar Organization
```
📐 Room Configuration
├── 📏 Room Type: [Simple ▾]
├── Section 1: Living Room
│   ├── 15' × 20'
│   ├── Position: (0, 0)
│   └── [Edit] [Delete]
├── Section 2: Kitchen Nook
│   ├── 10' × 12'
│   ├── Position: (15, 0)
│   └── [Edit] [Delete]
└── [+ Add Section]

🪑 Furniture (existing)
🚪 Elements (existing)
```

### Section Editor Modal (Advanced)
When clicking "Edit Sections":

```
┌─────────────────────────────────────────┐
│ Room Section Editor              [X]    │
├─────────────────────────────────────────┤
│                                         │
│  Canvas Preview (Interactive)           │
│  ┌─────────────┬─────────┐              │
│  │   Section 1 │ Section │              │
│  │   Living    │    2    │              │
│  │             │ Kitchen │              │
│  │             │         │              │
│  └─────────────┴─────────┘              │
│                                         │
│  Selected: Section 1                    │
│  Name: [Living Room          ]          │
│  Width:  [15] ft  Height: [20] ft       │
│  X: [0] ft  Y: [0] ft                   │
│                                         │
│  [Delete Section] [Duplicate Section]   │
│                                         │
│  [Cancel]              [Apply Changes]  │
└─────────────────────────────────────────┘
```

---

## Canvas Rendering Strategy

### Layered Rendering Approach
```typescript
function renderComplexRoom() {
  // Layer 1: Background for entire canvas
  renderCanvasBackground();

  // Layer 2: Individual section backgrounds
  sections.forEach(section => {
    renderSectionBackground(section);
    renderGrid(section); // Grid only within section
  });

  // Layer 3: Walls (merged where sections connect)
  renderWalls(sections);

  // Layer 4: Furniture and objects
  furniture.forEach(item => {
    renderFurniture(item);
  });

  // Layer 5: Section labels and borders
  sections.forEach(section => {
    renderSectionLabel(section);
    renderSectionBorder(section); // Dotted outline
  });
}
```

### Wall Merging Algorithm
```typescript
function mergeSharedWalls(sections: RoomSection[]): Wall[] {
  const walls: Wall[] = [];

  sections.forEach(section => {
    // For each edge of section
    const edges = getEdges(section);

    edges.forEach(edge => {
      // Check if this edge is shared with another section
      const adjacentSection = findAdjacentSection(edge, sections);

      if (adjacentSection) {
        // This is an interior wall (shared)
        if (!isWallAlreadyAdded(edge, walls)) {
          walls.push({ type: 'interior', ...edge });
        }
      } else {
        // This is an exterior wall (perimeter)
        walls.push({ type: 'exterior', ...edge });
      }
    });
  });

  return walls;
}
```

---

## Challenges & Solutions

### Challenge 1: Furniture Spanning Sections
**Problem**: User drags furniture across section boundary.

**Solutions**:
1. **Soft Constraint** (Recommended): Allow but show warning indicator
2. **Hard Constraint**: Block drag, snap back to original section
3. **Auto-Split**: Split furniture into two pieces (complex)

**Recommendation**: Start with #2 (hard constraint), add #1 (warning) in Phase 3.

### Challenge 2: Wall Object Placement
**Problem**: Where do wall objects go when walls can be interior or exterior?

**Solutions**:
1. Extend `WallObject` interface with `sectionId` and `wallType` (interior/exterior)
2. Wall view shows all sections expanded (like unfolding a box)
3. User selects which section's wall to decorate

### Challenge 3: Door/Window Positioning
**Problem**: Doors between sections vs. exterior doors.

**Solutions**:
1. Add `doorType: 'interior' | 'exterior'` to Door interface
2. Interior doors reference two section IDs
3. Validation: ensure interior doors are at section boundaries

### Challenge 4: Backward Compatibility
**Problem**: Existing designs have single `roomDimensions`.

**Solution** (Already Implemented):
- Keep `roomDimensions` in schema (required for old designs)
- Add optional `roomSections` array (for new designs)
- Canvas rendering checks which to use:
  ```typescript
  if (design.roomSections?.length > 0) {
    renderMultiSection(design.roomSections);
  } else {
    renderSingleRoom(design.roomDimensions); // legacy
  }
  ```

---

## Testing Checklist (When Implementing)

### Phase 1 Tests
- [ ] Create L-shaped room from template
- [ ] Add custom section manually
- [ ] Edit section dimensions
- [ ] Delete section
- [ ] Rename section
- [ ] Save design with multiple sections
- [ ] Load design preserves all sections
- [ ] Legacy single-room designs still load correctly

### Phase 2 Tests
- [ ] Drag new section onto canvas
- [ ] Resize section by dragging edge
- [ ] Move section to new position
- [ ] Sections snap to each other when aligned
- [ ] Shared walls render without double lines
- [ ] Place door on interior wall
- [ ] Place window on exterior wall

### Phase 3 Tests
- [ ] Place furniture in specific section
- [ ] Drag furniture within same section
- [ ] Prevent furniture from crossing section boundary
- [ ] Furniture displays correct section assignment
- [ ] Section deletion removes furniture or prompts user

---

## Database Considerations

**Schema Changes**
```typescript
// No backend changes needed! Mongoose schema already supports optional fields
// The existing Design model will accept the new roomSections field
{
  roomDimensions: { type: Object, required: true },  // Keep for compatibility
  roomSections: { type: Array, required: false },     // NEW - optional
  furniture: [{
    // ... existing fields
    sectionId: { type: String, required: false },     // NEW - optional
  }],
}
```

**Migration Strategy**
- No data migration needed
- Old designs continue working (use `roomDimensions`)
- New designs can use `roomSections`
- Frontend handles both formats transparently

---

## Performance Considerations

**Rendering Optimization**
- Limit to 10 sections max (reasonable for most use cases)
- Use CSS transforms for section movement (GPU accelerated)
- Memoize wall calculation (React.useMemo)
- Debounce section resize events
- Virtual rendering for large furniture lists

**Canvas Complexity**
```typescript
// Example complexity limits
const MAX_SECTIONS = 10;
const MAX_FURNITURE_PER_SECTION = 50;
const MAX_TOTAL_FURNITURE = 200;

if (sections.length > MAX_SECTIONS) {
  showWarning('Too many sections. Consider simplifying layout.');
}
```

---

## Common Room Shape Examples

### L-Shaped Room
```
┌─────────────┬─────────┐
│   Section 1 │         │
│   Living    │ Section │
│   15×20     │    2    │
│             │ Kitchen │
│             │  10×12  │
└─────────────┴─────────┘

Sections:
1. Living Room: 15'×20' at (0, 0)
2. Kitchen: 10'×12' at (15, 0)
```

### T-Shaped Room
```
    ┌─────────┐
    │ Section │
    │    3    │
    │ Bedroom │
┌───┴─────────┴───┐
│    Section 1    │
│   Living Room   │
│      20×15      │
└─────────────────┘

Sections:
1. Living Room: 20'×15' at (0, 8)
2. Bedroom: 10'×8' at (5, 0)
```

### U-Shaped Room
```
┌───────┬───────────┬───────┐
│ Sec 2 │  Section  │ Sec 3 │
│Bedroom│  1 Living │Office │
│  8×12 │   15×15   │ 8×12  │
└───────┴───────────┴───────┘

Sections:
1. Living Room: 15'×15' at (8, 0)
2. Bedroom: 8'×12' at (0, 0)
3. Office: 8'×12' at (23, 0)
```

---

## User Workflows

### Workflow 1: Create L-Shaped Room from Template
1. Click "Room Mode" dropdown → Select "L-Shaped Room"
2. Choose template size (Small/Medium/Large)
3. Template loads with 2 pre-configured sections
4. Adjust dimensions in properties panel
5. Add furniture to each section
6. Save design

### Workflow 2: Build Custom Multi-Section Room
1. Click "Add Section" button
2. Draw rectangle on canvas for first section
3. Name it (e.g., "Living Room")
4. Click "Add Section" again
5. Draw second rectangle adjacent to first
6. Sections auto-snap when edges align
7. Shared wall merges automatically
8. Continue adding sections as needed

### Workflow 3: Convert Existing Design to Multi-Section
1. Open existing single-room design
2. Click "Convert to Multi-Section"
3. Current room becomes "Section 1"
4. Add additional sections around it
5. Rearrange furniture into appropriate sections

---

## Mobile/Touch Considerations

**Touch Gestures**
- Tap section to select
- Double-tap to edit section properties
- Pinch on section edge to resize
- Drag with two fingers to move section
- Long-press to show context menu

**Responsive UI**
- Section editor in modal on mobile (not sidebar)
- Larger touch targets for section borders
- Simplified section properties (fewer inputs visible)

---

## Future Enhancements (Phase 5+)

### Auto-Layout Suggestions
- AI-powered room arrangement
- Suggest optimal furniture placement per section
- Balance across sections

### Room Templates Library
- Community-shared multi-section designs
- Office layouts (cubicles, conference rooms)
- Apartment floor plans
- Studio apartment configurations

### Export Enhancements
- Export each section separately
- Multi-page PDF (one page per section)
- 3D walkthrough mode

### Collaboration Features
- Assign sections to different designers
- Comments per section
- Version history per section

---

## Questions to Answer Before Implementation

1. **Section Limits**:
   - Maximum number of sections? (Recommend: 10)
   - Minimum section size? (Recommend: 4×4 ft)
   - Allow overlapping sections? (Recommend: No)

2. **Wall Decoration**:
   - How to handle wall objects on interior walls?
   - Should interior walls be decoratable?
   - Different UI for interior vs exterior walls?

3. **Furniture Behavior**:
   - Allow furniture to span sections? (Recommend: No initially)
   - Auto-assign section or manual? (Recommend: Auto)
   - Move furniture between sections? (Recommend: Yes, via drag)

4. **User Experience**:
   - Default to simple mode, hide complexity?
   - Advanced mode for multi-section?
   - Progressive disclosure of features?

5. **Templates**:
   - How many pre-built templates?
   - Allow users to save custom templates?
   - Share templates with others?

---

## Implementation Priority Recommendation

**Phase 1**: Essential foundation (High Priority)
- Data model ✅ (already done)
- Basic UI for add/edit/delete sections
- Simple L-shape template
- Canvas rendering for multiple sections

**Phase 2**: Visual tools (Medium Priority)
- Interactive section placement
- Smart snapping and alignment
- Wall merging

**Phase 3**: Polish (Low Priority)
- Section-aware furniture
- Advanced templates (T, U shapes)
- Validation and warnings

**Phase 4+**: Future enhancements (Deferred)
- Curved walls, angles, multi-story
- Wait for user feedback before implementing

---

## Resources & Inspiration

**Similar Tools**:
- Floorplanner.com (multi-room support)
- RoomSketcher (L-shaped room templates)
- Planner 5D (complex floor plans)

**UI Patterns**:
- Google Slides (multi-object selection and alignment)
- Figma (frames and auto-layout)
- SketchUp (3D room builder)

**Technical References**:
- SVG path merging algorithms
- Polygon collision detection
- Computational geometry for wall intersections

---

**Last Updated:** 2026-01-22
**Status:** Foundation Ready - Type System Extended, Awaiting Phase 1 Implementation

---

## Quick Start Guide (For Future Implementation)

When ready to implement, start here:

1. **Read the type changes** in `frontend/src/types/index.ts`
   - Understand `RoomSection` interface
   - See how `Design.roomSections` is optional

2. **Create basic UI** in new component `RoomSectionEditor.tsx`
   - Add section button
   - List of sections
   - Edit section properties

3. **Update canvas rendering** in `RoomCanvas.tsx`
   - Check if `roomSections` exists
   - Render multiple rectangles if present
   - Fall back to single `roomDimensions` for old designs

4. **Test backward compatibility**
   - Open old designs (should work unchanged)
   - Create new multi-section design
   - Save and reload both types

5. **Iterate based on user feedback**
   - Get early feedback on UX
   - Adjust complexity based on usage patterns
   - Add features incrementally
