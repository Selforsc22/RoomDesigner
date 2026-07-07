// Canvas stacking contract (REVAMP.md decision A2).
// Every zIndex in canvas code must reference these — no magic numbers.
export const Z = {
  FLOOR: 0,          // room/section backgrounds
  GRID: 1,
  WALLS: 2,          // free-form walls + openings
  CONNECTIONS: 3,    // section connection indicators
  LIGHT_BEAMS: 4,    // beams render ABOVE floor, BELOW items
  DOORS_WINDOWS: 5,  // legacy-mode doors/windows
  FURNITURE: 10,
  LIGHT_FIXTURES: 12,
  AMBIENT: 14,       // ambient tint (pointer-events: none)
  SELECTED: 20,
  HANDLES: 25,       // rotation/resize handles
  GUIDES: 30,        // snap guides
  OVERLAY_UI: 40,    // compass, in-canvas chrome
  MODAL: 100,        // dialogs (backdrop 100, panel 110)
  MODAL_PANEL: 110,
} as const;
