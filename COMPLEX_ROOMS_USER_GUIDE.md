# Complex Room Shapes - User Guide

## Overview
The Room & Wall Planner now supports complex, multi-section room layouts including L-shaped, T-shaped, and U-shaped rooms. This guide will help you create and customize these advanced room configurations.

---

## Getting Started

### Accessing Room Templates

1. **Open your design** in the Room & Wall Planner
2. **Look at the top toolbar** - you'll see a dropdown button showing the current room type (default: "Simple Room")
3. **Click the dropdown** to see all available room templates

### Available Templates

#### Simple Room
- Single rectangular room
- Traditional layout
- Shows width/height controls for direct dimension editing

#### L-Shaped Rooms
- **Small L-Shape**: Compact (10'×10' + 8'×6')
- **Medium L-Shape**: Standard (15'×12' + 10'×8')
- **Large L-Shape**: Spacious (20'×15' + 12'×10')
- Perfect for: Studio apartments, open-plan living/dining areas

#### T-Shaped Rooms
- **Small T-Shape**: Compact with entry wing
- **Medium T-Shape**: Standard with hallway
- **Large T-Shape**: Spacious with bedroom wing
- Perfect for: Apartments with hallways, homes with room extensions

#### U-Shaped Rooms
- **Small U-Shape**: Compact with side wings
- **Medium U-Shape**: Standard with side bedrooms
- **Large U-Shape**: Spacious with office wings
- Perfect for: Homes with multiple rooms, office layouts

#### Custom Layout
- Start from scratch with one section
- Add, remove, and configure sections manually
- Full control over layout

---

## Using Room Templates

### Applying a Template

1. **Click the room type dropdown** in the top toolbar
2. **Select your desired template** (e.g., "Medium L-Shape")
3. The canvas will instantly update to show the new layout
4. Each section will be labeled (e.g., "Living Area", "Dining Area")

### What Happens When You Apply a Template?

- The canvas reconfigures to show multiple connected room sections
- Each section appears as a white rectangle with a label
- Sections are pre-positioned to form the chosen shape
- Furniture remains on the canvas (may need repositioning)

---

## Managing Room Sections

### Viewing Room Sections

When using a multi-section template, the left sidebar shows a "Room Sections" panel with:
- List of all sections in your room
- Each section showing:
  - Name (e.g., "Living Room")
  - Dimensions (e.g., "15' × 20'")
  - Position coordinates (e.g., "(0, 0)")
- Section count at the bottom

### Adding a New Section

1. **Scroll to "Room Sections"** in the left sidebar
2. **Click the "+" (Plus) button** next to "Room Sections" header
3. A new section will be added with default dimensions (10' × 10')
4. You can then edit or move this section (see below)

### Editing a Section

1. **Find the section** in the "Room Sections" list
2. **Click the pencil icon** (Edit) next to the section
3. An edit form appears with fields for:
   - **Name**: Give the section a descriptive name
   - **Width**: Set width in feet (minimum 4')
   - **Height**: Set height in feet (minimum 4')
   - **X Position**: Horizontal position from canvas origin
   - **Y Position**: Vertical position from canvas origin
4. **Click "Save"** to apply changes, or **"Cancel"** to discard

### Deleting a Section

1. **Find the section** in the "Room Sections" list
2. **Click the trash icon** (Delete) next to the section
3. **Confirm deletion** in the dialog
4. The section will be removed from the canvas

**Note**: If you delete all sections, the room will revert to "Simple Room" mode.

---

## Interactive Canvas Editing

### Moving a Section

Move entire sections by dragging them on the canvas:

1. **Hover over a section** - it highlights with a blue border
2. **Click and hold the section label** (e.g., "Living Room")
3. **Drag to desired position** - the section moves in real-time
4. **Release mouse** to place the section

**Visual Feedback**:
- Section becomes slightly transparent while dragging
- Cursor changes to "move" cursor
- Blue dashed lines appear when snapping to other sections

### Resizing a Section

Resize sections using interactive handles:

1. **Hover over a section** - resize handles appear
2. **8 handles available**:
   - **4 corners** (circular blue dots): Resize both dimensions
   - **4 edges** (oval blue bars): Resize one dimension
3. **Click and drag a handle** to resize
4. **Release mouse** to finalize size

**Handle Types**:
- **Top edge (N)**: Adjust height from top
- **Bottom edge (S)**: Adjust height from bottom
- **Left edge (W)**: Adjust width from left
- **Right edge (E)**: Adjust width from right
- **Corners (NE, NW, SE, SW)**: Adjust both dimensions

**Constraints**:
- Minimum section size: 4' × 4'
- Sections stay within canvas bounds

### Smart Snapping

Sections automatically snap for perfect alignment:

**Grid Snapping**:
- All positions snap to 0.5 ft increments
- Creates clean, precise measurements

**Edge Snapping**:
- When dragging/resizing near another section (within 0.5'), edges snap together
- Blue dashed guide lines show where snapping occurs
- Snaps on all 4 edges (top, bottom, left, right)
- Prevents gaps between connected sections

**What Snaps**:
- Left edge → Right edge of adjacent section
- Right edge → Left edge of adjacent section
- Top edge → Bottom edge of adjacent section
- Bottom edge → Top edge of adjacent section

---

## Working with Furniture

### Adding Furniture to Multi-Section Rooms

When you add furniture from the sidebar:
- Furniture spawns in the **center of the first section**
- Random offset applied to prevent overlap
- Furniture stays within section boundaries when dragged

### Moving Furniture Between Sections

1. **Click and drag furniture** as normal
2. Furniture is **constrained to the section** it's in
3. **Cannot drag across section boundaries**
4. To move to another section:
   - Delete and re-add, OR
   - Use properties panel to manually adjust x/y coordinates

### Furniture Constraints

- Furniture cannot overlap section boundaries
- When dragging, furniture stops at section edges
- Furniture center point determines which section it belongs to

---

## Tips & Best Practices

### Creating Clean Layouts

1. **Start with a template** close to your desired shape
2. **Adjust section sizes** using resize handles for perfect fit
3. **Use snap guides** to ensure sections are perfectly aligned
4. **Name your sections** descriptively for easy reference

### Avoiding Common Issues

**Problem**: Furniture disappears after changing template
- **Solution**: Check furniture x/y coordinates in properties panel
- Furniture may be outside new section bounds
- Manually adjust position or delete and re-add

**Problem**: Can't drag furniture to desired location
- **Solution**: Check if location is in different section
- Section boundaries constrain movement
- Adjust section size or furniture coordinates

**Problem**: Sections have gaps between them
- **Solution**: Use drag handles to move sections together
- Watch for blue snap guide lines
- Sections should snap when within 0.5' of each other

### Keyboard & Mouse Tips

- **Hover**: Shows resize handles and dimensions
- **Click section label**: Drag entire section
- **Click resize handle**: Resize section
- **Click furniture**: Select furniture (properties panel updates)
- **Click canvas background**: Deselect all

---

## Example Workflows

### Workflow 1: Creating an L-Shaped Studio Apartment

1. Click room type dropdown → Select "Medium L-Shape"
2. Canvas shows Living Area (15'×12') + Dining Area (10'×8')
3. In left sidebar, edit "Dining Area" section:
   - Rename to "Kitchen"
   - Adjust size to 10'×10'
4. Drag "Kitchen" section to align with living area
5. Add furniture to each section
6. Save design

### Workflow 2: Customizing a T-Shaped Layout

1. Click room type dropdown → Select "Large T-Shape"
2. Canvas shows Living Space + Bedroom Wing
3. Add new section (click + in Room Sections)
4. Edit new section:
   - Name: "Bathroom"
   - Size: 8'×6'
5. Drag bathroom section to connect with bedroom wing
6. Use snap guides to align perfectly
7. Add furniture and fixtures
8. Save design

### Workflow 3: Converting Simple Room to Custom Multi-Section

1. Start with "Simple Room" (default)
2. Add some furniture to remember positions
3. Click room type dropdown → Select "Custom Layout"
4. Click + in Room Sections to add sections as needed
5. Edit each section's name, size, and position
6. Arrange sections on canvas using drag
7. Reposition furniture into appropriate sections
8. Save design

---

## Troubleshooting

### Template dropdown not showing
- Ensure you're in "Room" view (not "Wall" view)
- Check top toolbar near design name

### Resize handles not appearing
- Hover directly over a section border
- Handles only show when hovering
- Ensure you're in Room view with multi-section template active

### Sections not snapping
- Drag sections closer (within 0.5 ft)
- Look for blue dashed guide lines
- Snap threshold is small for precision

### Cannot edit section dimensions manually
- Width/height inputs in top toolbar only work for Simple Room
- For multi-section rooms, use resize handles OR edit in left sidebar

### Furniture not constrained to sections
- Only works when roomSections exist (multi-section templates)
- In Simple Room mode, furniture can go anywhere in room
- Switch to multi-section template to enable section constraints

---

## Advanced Features (Coming Soon)

The following features are planned for future updates:

- **Drag-to-create sections**: Click and drag on canvas to draw new sections
- **Curved walls**: Rounded corners and arc-based walls
- **Angled walls**: Non-rectangular sections at custom angles
- **Multi-story**: Add floors and stairways
- **Interior walls**: Walls within sections (not just perimeter)
- **Doorway furniture**: Items that span between sections
- **Copy furniture to sections**: Duplicate items across multiple sections
- **Section templates**: Save and reuse custom section configurations

See `COMPLEX_ROOMS_ROADMAP.md` for detailed implementation plans.

---

## Keyboard Shortcuts

Currently, all section operations use mouse/click interactions. Keyboard shortcuts are planned for a future update.

**Mouse Actions**:
- **Left-click**: Select items, click buttons
- **Click + Drag**: Move sections, resize sections, move furniture
- **Hover**: Show resize handles, show dimensions

---

## FAQ

**Q: Can I have more than 10 sections?**
A: Current limit is 10 sections for optimal performance. This covers most use cases.

**Q: Can sections overlap?**
A: Yes, sections can overlap, but it's not recommended. Use snap guides for clean alignment.

**Q: Can I rotate sections?**
A: Not currently. All sections are rectangular and axis-aligned. Angled sections are planned.

**Q: Do old designs work with this feature?**
A: Yes! Old designs use "Simple Room" mode automatically. They work exactly as before.

**Q: Can I export multi-section designs?**
A: Yes, multi-section designs save normally. All section data is preserved.

**Q: Can furniture span multiple sections?**
A: Not currently. Furniture is constrained to one section. Cross-section furniture is planned.

**Q: How do I add doors between sections?**
A: Interior doors between sections are planned. Currently, doors only go on exterior walls.

---

## Need Help?

- **Report issues**: https://github.com/anthropics/claude-code/issues
- **View roadmap**: See `COMPLEX_ROOMS_ROADMAP.md` in project root
- **Check technical docs**: See `COMPLEX_ROOMS_ROADMAP.md` for implementation details

---

**Last Updated**: 2026-01-23
**Feature Version**: Phase 1 & 2 Complete

Enjoy designing complex room layouts! 🎨🏠
