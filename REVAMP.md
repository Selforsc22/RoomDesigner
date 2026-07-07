# RoomDesigner Revamp: MVP → Production

**Mission:** Take RoomDesigner from a demo-quality MVP to a polished, reliable studio-planning app. The lighting system is the product's identity — it must feel professional and predictable. Everything else (walls, theme, persistence) must simply *work* without surprises.

This document is the execution spec. Work through phases **in order** — each phase leaves the app in a shippable state. Do not start a phase until the previous phase's acceptance criteria all pass.

---

## Current State Audit (verified 2026-07-07)

Read this before touching anything. These are facts, not guesses:

### 🔴 P0 — The app does not compile
`npm run build` fails with **18 TypeScript errors**. The Sweet Home 3D type changes made `Design.roomDimensions`, `Door.wall/x`, and `Window.wall/x/y` optional, but the consumers were never updated:

- `RoomCanvas.tsx:601-623` — `door.x` / `window.x` / `window.y` possibly undefined
- `WallCanvas.tsx:163-180` — same
- `MainLayout.tsx:627-800` — `currentDesign.roomDimensions` possibly undefined (7 sites), plus two type mismatches passing `roomDimensions` to canvas props
- `WallRenderer.tsx:6`, `wallGeometry.ts:145,174` — unused declarations

### 🔴 P0 — Backend silently drops new data
`backend/src/models/Design.ts` has **zero** schema fields for `floorPlan`, `northAngle`, `wallId`, or `position`. Mongoose strict mode strips unknown fields on save — any wall drawing or compass work will appear to work, then vanish on reload.

### 🟠 P1 — The dark matte theme is half-applied
`styles/modern-ui.css` defines a dark design system, but it was only applied to the *shells* of LeftSidebar, PropertiesPanel, and the top toolbar. **13 components still use light-mode Tailwind classes** (`bg-white`, `bg-gray-50`, `text-gray-700`), including sections *inside* the "converted" components: Login, Register, ExportDialog, KeyboardShortcuts, LightingPresets, SectionManager, WallCanvas, Compass, WallDrawingToolbar, the delete dialog, template dropdown, design list, and user profile. The result is dark chrome wrapping white panels — this is the "clunky" feel.

### 🟠 P1 — Wall drawing features are orphaned
`WallRenderer.tsx`, `WallDrawingToolbar.tsx`, and `Compass.tsx` are imported by **zero** files. They were built and committed but never integrated. `INTEGRATION_GUIDE.md` describes the wiring that was never done.

### 🟡 P2 — Lighting tech debt (the recurring pain point)
The lighting works but is fragile — this is why it has broken four times:
- `getLightColor()` is **copy-pasted 4 times** across RoomCanvas (fixture icon, gradient defs, beam renderer, ambient overlay). Every fix has to be applied 4 times or the layers disagree.
- Color temperature maps to only **4 hard buckets** (`#FFB84D` / `#FFF4E6` / `#FFFFFF` / `#E6F3FF`) — moving the Kelvin slider produces visible banding instead of a smooth warm→cool sweep.
- Beam length is an arbitrary formula `(120 - beamAngle) * 2 + 200` **in pixels**, so it ignores zoom and room scale.
- The beam originates at the fixture **center**, not its emitting edge.
- Rotating a light requires a slider in the properties panel — no direct manipulation on canvas.
- Z-index values are magic numbers scattered across the file (`0, 5, 10, 15, 20, 25, 30, 35` all appear).
- `RoomCanvas.tsx` is a **943-line monolith** rendering 9 layers inline.

### 🟡 P2 — Miscellaneous
- Bundle is 911 KB (no code splitting; `lucide-react` imported as `* as LucideIcons`).
- No tests of any kind.
- Auto-save fires on every keystroke of the design-name input (2s debounce on the whole design object).

---

## Architecture Decisions

These decisions govern all phases. Deviating from them requires a written reason in the commit message.

### A1. One lighting module, one source of truth
All lighting math lives in `frontend/src/utils/lighting.ts`. No component computes light color, beam geometry, or falloff itself. The four duplicated `getLightColor` implementations are deleted and replaced by imports.

### A2. A layer contract for the canvas
Create `frontend/src/constants/layers.ts`:

```ts
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
} as const;
```
Every `zIndex`/`z-*` in canvas code references this file. No magic numbers.

### A3. Design tokens through Tailwind, not inline styles
The current approach (`style={{ color: 'var(--text-primary)' }}` sprinkled inline) is unmaintainable. Move the palette from `modern-ui.css` into `tailwind.config.js` (`theme.extend.colors`: `surface.{base,raised,overlay}`, `ink.{primary,secondary,muted}`, `accent.{primary,hover,danger,success}`) so components use `bg-surface-raised text-ink-primary` like normal Tailwind. Keep `modern-ui.css` only for the glossy button effects and scrollbar styling that genuinely need custom CSS.

### A4. Canvas decomposition
`RoomCanvas.tsx` becomes an orchestrator (< 250 lines) composing layer components in `frontend/src/components/Canvas/layers/`:
`FloorLayer`, `GridLayer`, `WallLayer` (wraps the existing WallRenderer), `LightBeamLayer`, `OpeningsLayer` (legacy doors/windows), `FurnitureLayer`, `AmbientLayer`, `GuidesLayer`. Each layer is `React.memo`-wrapped and receives only the props it renders.

### A5. No decorative animation on canvas
Nothing on the canvas animates without user input. No `<animate>`, no pulsing, no shimmer. Transitions are allowed only on user-driven state changes (selection, hover, drag), capped at 200ms. The wavering-light bug class is permanently closed by this rule.

---

## Phase 0 — Restore the Build (blocking everything)

**Goal:** `npm run build` passes in `frontend/` and `backend/`; the app runs end-to-end with existing designs.

1. **Fix the 18 TS errors** — but do it properly, not with `!` assertions:
   - Add a helper `getRoomDimensions(design): { width; height }` in a new `frontend/src/utils/design.ts` that returns `design.roomDimensions ?? boundsFromSections(design.roomSections) ?? { width: 20, height: 15 }`. Use it everywhere MainLayout/canvases need dimensions.
   - In legacy door/window render paths, guard: skip rendering any door/window that has neither legacy (`wall` + `x`) nor wall-mode (`wallId` + `position`) coordinates.
   - Delete the unused imports/params flagged in `WallRenderer.tsx` and `wallGeometry.ts`.
2. **Update the backend schema** (`backend/src/models/Design.ts`): add `floorPlan` (walls array + bounds), `northAngle: Number`, and the optional `wallId`/`position`/`heightFromFloor` fields on doors/windows. Make `roomDimensions` non-required with a default. Run the backend's build/typecheck.
3. **Smoke-test persistence:** create a design, set `northAngle`, save, reload — the value must survive the round trip.

**Acceptance:** both builds green; existing designs load; save/reload preserves all fields including `northAngle`.

---

## Phase 1 — Lighting Engine v2 (the centerpiece)

**Goal:** lighting that looks like a professional lighting diagram, behaves deterministically, and can never drift out of sync between layers again.

### 1.1 Create `frontend/src/utils/lighting.ts`
- `kelvinToRGB(kelvin: number): string` — implement the Tanner Helland approximation for a **continuous** color sweep 3200K–6500K. Delete all four `getLightColor` copies and import this instead. (Clamp inputs; return hex.)
- `getBeamGeometry(light, roomDims): { origin, leftEdge, rightEdge, length }` — all in **feet**, converted to pixels only at render time:
  - `origin` sits on the fixture's emitting edge: fixture center offset by `max(width, height)/2` along `lightDirection` — the beam starts where the light physically ends, never inside the icon.
  - `length` in feet: `base 8ft + (intensity/100) * 10ft`, clamped so the beam never exceeds 1.25× the room diagonal. Zoom-independent by construction.
  - Width from `beamAngle` exactly as now (half-angle trig).
- `getFalloffStops(intensity): GradientStop[]` — one canonical gradient definition (e.g. 0% → `intensity/100` opacity, 45% → `intensity/180`, 100% → 0). Both the beam layer and any future preview use this.
- `getAmbientTint(lights): { color, opacity }` — move the ambient-overlay math here, using `kelvinToRGB` of the weighted-average temperature instead of the 6-bucket table.

### 1.2 Extract `LightBeamLayer.tsx` and `LightFixtureLayer.tsx`
Per architecture A4. One SVG each, `React.memo`, gradients keyed by light id + the properties that affect them. **Zero `<animate>` elements** (A5). Beams use `Z.LIGHT_BEAMS`; fixtures use `Z.LIGHT_FIXTURES`.

### 1.3 On-canvas rotation handle (kills the clunkiest interaction)
When a light is selected, render at `Z.HANDLES`:
- A dashed circle around the fixture with a grab-dot on its circumference at the current `lightDirection`.
- Dragging the dot rotates the light live (`atan2` from fixture center); **Shift snaps to 15° increments**. The fixture icon and beam rotate together (they already share the direction value — now via one geometry function they can't disagree).
- Show a small degree readout near the handle while dragging (e.g. `135°`).

### 1.4 Fixture visual pass
- Fixture icon fill uses `kelvinToRGB` so a 3200K fresnel *looks* tungsten-warm on the canvas.
- Selected light: static glow via `drop-shadow` (no animation), ring at `Z.SELECTED`.
- Tooltip/title unchanged.

**Acceptance:**
- Kelvin slider produces a smooth continuous color change in beam + fixture + ambient simultaneously (they share one function — verify by grep: exactly one definition of kelvin→color in the codebase).
- Beam originates at the fixture edge and its on-screen length scales correctly at 50% and 200% zoom.
- Nothing on the canvas moves when the user isn't interacting (record 5 seconds of idle canvas — pixel-identical frames).
- A light can be aimed by dragging the handle; Shift snaps to 15°.
- `RoomCanvas.tsx` no longer contains any lighting math.

---

## Phase 2 — Finish the Theme (make it *one* app)

**Goal:** every surface, dialog, and control uses the matte-dark design system. No white panels inside dark chrome.

1. Implement architecture **A3** (tokens into Tailwind config). Refactor the three partially-converted components (LeftSidebar, PropertiesPanel, MainLayout toolbar) to Tailwind token classes, removing the inline `style={{...var(...)}}` usage.
2. Convert the remaining light-mode components — work through this exact list, checking each off:
   `Login`, `Register`, `ExportDialog`, `KeyboardShortcuts` dialog, `LightingPresets`, `SectionManager`, `WallCanvas`, `WallDrawingToolbar`, `Compass`, the delete-confirmation dialog, the template dropdown, the "My Designs" list, the user-profile footer, canvas empty states.
3. The canvas floor itself stays **light** (white/warm paper look) — it's a document, and light beams read better against it. Give it a subtle border/shadow so it reads as a "sheet" sitting on the dark workspace (like Figma/Photoshop).
4. Sliders (intensity, Kelvin, beam angle): style the tracks with meaningful gradients — the Kelvin track should sweep orange→white→blue using `kelvinToRGB`, intensity dark→bright. This makes the lighting panel feel purpose-built.
5. Dialogs standardize on `Z.MODAL`; backdrop `bg-black/60 backdrop-blur-sm`; consistent enter transition (150ms fade+scale, CSS only).

**Acceptance:** `grep -rn "bg-white\|bg-gray-50\|text-gray-700" frontend/src/components` returns **zero** hits outside the canvas floor sheet; every dialog opaque and legible; visual walkthrough of all views (room, wall, dialogs, auth) shows one coherent theme.

---

## Phase 3 — Integrate Wall Drawing, Openings & Compass (finish what was started)

**Goal:** the orphaned components become real features, following `INTEGRATION_GUIDE.md` but with the corrections below.

1. **Room mode switcher** in the toolbar: `Simple / Sections / Custom Walls`. Switching to Custom Walls converts the current rectangle via `convertRectangleToWalls()` and migrates legacy doors/windows with the existing conversion helpers. Warn before converting; conversion is one-way (offer it as a copy: "Convert a copy" is safer — implement that).
2. Mount `WallDrawingToolbar` under the top bar (only in Custom Walls mode) and `WallRenderer` at `Z.WALLS` inside RoomCanvas. Wire `onAddWall/onUpdateWall/onDeleteWall` into MainLayout state + history (undo/redo must cover wall edits).
3. **Doors/windows on walls:** in Custom Walls mode, "Add Door/Window" enters a placement mode — hovering a wall shows a ghost opening snapped under the cursor; click places it (`wallId` + `position` computed from the projection of the cursor onto the wall). This replaces the dropdown+slider flow from the guide as the primary interaction; keep the PropertiesPanel wall-select + position slider as the fine-tuning fallback. Reject placements that would overlap an existing opening on the same wall (flash the conflicting opening red).
4. **Furniture constraint** in Custom Walls mode: use `isPointInFloorPlan` on the item's center; if a drag would exit, clamp like the rectangle mode does today.
5. **Compass:** mount at top-right of the canvas viewport (`Z.OVERLAY_UI`), drag-to-rotate updates `design.northAngle` (persists — schema was fixed in Phase 0). It indicates orientation only; it does **not** rotate the floor plan (skip the guide's optional rotation transform — it would break every mouse-coordinate calculation).
6. Include walls + compass in PNG/JPEG export (they're DOM/SVG, so html-to-image should capture them — verify).

**Acceptance:** draw an L-shaped room from scratch; place 2 doors + 1 window by clicking walls; openings visibly gap the walls with swing arcs; furniture can't escape the plan; save/reload restores everything; undo works for wall operations; export contains walls and compass.

---

## Phase 4 — Hardening & Performance

**Goal:** the app stays working.

1. **Kill the 911 KB bundle:** replace all `import * as LucideIcons` with named imports (this is the bulk of it); `React.lazy` the ExportDialog and KeyboardShortcuts; add `manualChunks` for react/react-dom if still over 500 KB.
2. **Tests** (vitest): `utils/lighting.ts` (kelvin endpoints + monotonic warmth, beam origin offset, length clamp), `utils/wallGeometry.ts` (segments around openings, point-in-plan, corner math), `utils/design.ts` (dimension fallbacks). These are pure functions — no DOM needed. Add `npm test` to both packages and a root `verify` script: `frontend build + backend build + tests`.
3. **Auto-save hygiene:** debounce keeps 2s but skip saving when only `name` changed since last keystroke <2s ago (it already debounces — just verify no save-per-keystroke); show the existing saved/saving indicator states accurately.
4. **RoomCanvas decomposition** (A4) if not already completed during Phases 1–3; RoomCanvas under 250 lines.
5. Run a final pass with the app open: drag furniture in a 30-light preset scene — interaction must stay smooth (memoized layers should ensure this).

**Acceptance:** main JS chunk < 500 KB; `npm run verify` green from a clean checkout; all tests pass; RoomCanvas < 250 lines.

---

## Working Rules (for the executing agent)

1. **Build before every commit.** The current broken state exists because this rule was skipped. `cd frontend && npm run build` (and backend when touched) — no exceptions.
2. **One commit per numbered step, one push per phase.** Branch: `claude/room-wall-planning-app-oZFG8`.
3. **Verify visually, not just by compilation.** After canvas/lighting changes, run the dev server and exercise the feature (Playwright/Chromium is available in this environment for screenshots if needed).
4. **Never duplicate a function that exists in `utils/`.** If you need light color, beam geometry, or wall math anywhere, import it.
5. **No new animations on the canvas** (rule A5).
6. **When a phase's acceptance criteria pass, state so explicitly** in the commit message body, then move on. If a criterion can't pass, stop and report rather than redefining the criterion.

---

## Definition of Done (whole revamp)

- A photographer can: pick a lighting preset → drag lights into position → aim each light by dragging its rotation handle → watch smooth color-temperature changes → draw a custom-shaped studio with real wall openings → export a clean diagram — without encountering a white-on-dark panel, a wobbling light, or a lost save.
