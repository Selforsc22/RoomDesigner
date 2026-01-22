# Photography Studio Features - Implementation Roadmap

## Overview
This document outlines the plan for adding professional photography/videography studio planning features to the Room & Wall Planner application.

## Current Status
**Foundation Complete** ✅
- Type system extended to support lighting properties
- Configuration file structure created
- Data models support 3D positioning (height)
- Ready for implementation

---

## Phase 1: Studio Equipment Library (2-3 hours)

### 1.1 Lighting Equipment
Add to `studioLightingConfig.ts`:

**Softboxes**
- Small Softbox (2x2 ft)
- Medium Softbox (3x3 ft)
- Large Softbox (4x6 ft)
- Strip Softbox (1x4 ft)

**Umbrella Lights**
- Shoot-through Umbrella (3 ft)
- Reflective Silver Umbrella (4 ft)
- Reflective White Umbrella (4 ft)

**Continuous Lights**
- LED Panel Small (1x1 ft)
- LED Panel Large (2x2 ft)
- Ring Light 18" (1.5 ft diameter)
- Ring Light 24" (2 ft diameter)

**Strobes**
- Speedlight (0.5x0.5 ft)
- Studio Strobe (1x1 ft)

**Modifiers**
- Beauty Dish (1.5 ft)
- Octabox (4 ft)
- Parabolic Reflector (4 ft)

### 1.2 Visual Representation
- Light color based on color temperature (warm orange, cool blue)
- Semi-transparent cone showing light spread
- Direction arrow
- Intensity indicator (brightness of color)

### 1.3 Properties Panel Updates
Add fields for selected lights:
- Intensity slider (0-100%)
- Color Temperature slider (3200-6500K)
- Beam Angle slider (15-120°)
- Height input (0-12 ft)
- Direction dial (0-360°)

---

## Phase 2: Camera & Subject Positioning (1-2 hours)

### 2.1 Camera Equipment
- Camera Position marker
- Field of view cone
- Tripod representation
- Shooting height indicator

### 2.2 Subject/Model Position
- Subject placeholder (person icon)
- Posing guide overlays
- Distance markers from camera

### 2.3 Backdrop System
- Backdrop stand (6-10 ft wide)
- Seamless paper roll options
- Muslin backdrop
- Green screen

---

## Phase 3: Enhanced Visualization (2-3 hours)

### 3.1 Light Visualization
- Directional light cones (SVG overlays)
- Color-coded by temperature
- Opacity based on intensity
- Beam angle visualization
- Shadow indication (simple)

### 3.2 Measurement Tools
- Distance measurement tool (click-to-measure)
- Angle measurement for light positioning
- Height guide lines
- Grid snapping for precise placement

### 3.3 Canvas Enhancements
- Toggle light visualizations on/off
- Toggle measurement guides
- 3D height indicators (side view)

---

## Phase 4: Studio Templates & Presets (1-2 hours)

### 4.1 Common Lighting Setups
**Portrait Templates:**
- 3-Point Lighting (key, fill, back)
- Rembrandt Lighting
- Butterfly/Paramount Lighting
- Loop Lighting
- Split Lighting

**Fashion/Beauty:**
- Clamshell Lighting
- Beauty Dish Setup
- High-Key Setup

**Product Photography:**
- Table-Top Setup
- Light Tent Configuration

### 4.2 Template System
- Save current setup as template
- Load template into room
- Template library in sidebar
- Quick-apply templates

---

## Phase 5: Advanced Features (Future)

### 5.1 Light Intensity Calculation
- Inverse square law simulation
- Subject illumination preview
- Shadow softness indicator
- Ratios between lights (key:fill ratio)

### 5.2 Mobile/Tablet Optimization
- Touch-friendly controls
- Responsive layout for tablets
- Pinch-to-zoom on canvas
- Simplified mobile UI

### 5.3 Collaboration Features
- Share studio setups via link
- Export setup as PDF/image
- Shopping list generator (equipment needed)
- Notes and annotations

---

## LiDAR Integration Options

### Option A: Import from Scanning Apps (Recommended First)
**Supported Apps:**
- Polycam (iOS)
- Canvas (iOS/Android)
- RoomScan (iOS)
- Matterport (Professional)

**Implementation:**
1. File upload component (JSON/CSV/OBJ)
2. Parser for each app's export format
3. Auto-generate room dimensions
4. Extract wall positions
5. Map to 2D floor plan

**File Format Examples:**
```json
{
  "roomDimensions": { "width": 20, "length": 15, "height": 10 },
  "walls": [
    { "start": [0, 0], "end": [20, 0], "type": "north" },
    { "start": [20, 0], "end": [20, 15], "type": "east" }
  ],
  "doors": [...],
  "windows": [...]
}
```

### Option B: Direct Device Integration (Advanced)
**Requirements:**
- HTTPS required
- iOS/iPadOS Safari only (LiDAR sensor)
- WebXR Device API
- Real-time point cloud processing

**Considerations:**
- Limited browser support
- Requires native app wrapper for best experience
- Complex implementation

**Recommendation:** Start with Option A, evaluate Option B for v2.0

---

## Database Schema Updates

### Design Model Extensions (Already Supported)
```typescript
{
  furniture: [{
    // Existing fields...
    zHeight?: number,
    isLight?: boolean,
    lightIntensity?: number,
    colorTemperature?: number,
    beamAngle?: number,
    lightDirection?: number
  }]
}
```

No backend changes needed - existing schema already supports optional properties!

---

## UI/UX Considerations

### Sidebar Organization
```
📁 Room View
├── 🪑 Furniture (existing)
├── 🚪 Elements (doors/windows)
└── 💡 Studio Lighting (NEW)
    ├── Softboxes
    ├── Umbrellas
    ├── LED Panels
    ├── Strobes
    └── Modifiers

📁 Wall View
├── 🖼️ Wall Objects (existing)
└── 🎬 Backdrop & Mounts (NEW)
```

### Properties Panel Additions
When lighting equipment is selected:
```
⚙️ Properties
├── Name
├── Position (X, Y, Height)
├── 💡 Light Settings
│   ├── Intensity (0-100%)
│   ├── Color Temp (3200-6500K)
│   ├── Beam Angle (15-120°)
│   └── Direction (0-360°)
└── Rotation
```

### Toolbar Additions
```
[Undo] [Redo] | [Grid] [Zoom] | [💡 Show Lights] [📏 Measure] [📸 Camera View]
```

---

## Testing Checklist (When Implementing)

### Phase 1 Tests
- [ ] Add softbox to canvas
- [ ] Adjust light intensity
- [ ] Change color temperature
- [ ] Modify beam angle
- [ ] Set light height
- [ ] Rotate light direction
- [ ] Light visualization renders correctly
- [ ] Save design with lighting
- [ ] Load design preserves lighting settings

### Phase 2 Tests
- [ ] Add camera position
- [ ] Field of view displays
- [ ] Add backdrop stand
- [ ] Measure distance between items
- [ ] Measure angles

### Phase 3 Tests
- [ ] Toggle light cones on/off
- [ ] Multiple lights render without overlap issues
- [ ] Light colors match temperature
- [ ] Performance with 10+ lights

---

## Performance Considerations

- Use CSS transforms for light cones (GPU accelerated)
- Limit light visualizations to 20 lights max
- Debounce property changes (already implemented)
- Use React.memo for light components
- Canvas rendering optimization for overlays

---

## Mobile App Considerations (Future)

### React Native Migration Path
1. **Code Reuse:** ~80% of business logic can be reused
2. **UI Components:** Need native versions (React Native Paper or Native Base)
3. **Canvas:** Use react-native-svg or Skia
4. **File System:** Need native file pickers
5. **LiDAR:** Native iOS ARKit integration

### Progressive Web App (PWA) Alternative
- Add service worker for offline support
- Add app manifest
- Install prompt
- Camera access for scanning (limited)
- Touch optimization (already good foundation)

**Recommendation:** PWA first, then React Native if needed

---

## Next Steps (When Ready to Implement)

1. **Start with Phase 1:**
   - Populate `studioLightingConfig.ts` with 10-15 lights
   - Add category filter to sidebar
   - Extend properties panel for light controls

2. **Quick Wins:**
   - Height property UI (already in data model)
   - Simple light cone visualization
   - Color temperature color coding

3. **User Testing:**
   - Get feedback from photographers
   - Identify most-used equipment
   - Refine workflows

---

## Questions to Answer Before Full Implementation

1. **Primary Use Case:**
   - Solo photographer planning shoots?
   - Studio manager designing layouts?
   - Clients previewing setups?

2. **Lighting Detail Level:**
   - Simple placement and direction?
   - Intensity and shadows?
   - Full light simulation?

3. **Equipment Priority:**
   - Start with common gear?
   - Industry-specific (fashion vs product)?
   - User-definable equipment?

4. **Output:**
   - Just save in app?
   - Export as diagram?
   - Generate shopping list?
   - Print-friendly layout?

---

## Resources & References

**Lighting Guides:**
- Strobist Lighting 101
- Digital Photography School
- Fstoppers Lighting Tutorials

**Equipment References:**
- B&H Photo Equipment Dimensions
- Adorama Product Specs
- Profoto Lighting Guides

**Similar Tools (for inspiration):**
- Set.a.light 3D
- Sylights
- Shotview

---

**Last Updated:** 2026-01-22
**Status:** Foundation Ready - Awaiting Phase 1 Implementation
