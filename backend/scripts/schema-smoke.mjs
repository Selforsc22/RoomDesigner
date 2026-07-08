// Schema smoke test: the Design model must not strip any design field
// (Mongoose strict mode silently drops unknown keys at document
// construction, which once ate every lighting property on save).
// Run after `npm run build` — it loads the compiled model from dist/.
import mongoose from 'mongoose';
import Design from '../dist/models/Design.js';

const DesignModel = Design.default ?? Design;

const payload = {
  userId: new mongoose.Types.ObjectId(),
  name: 'Smoke Test',
  roomDimensions: { width: 20, height: 15 },
  northAngle: 135,
  roomSections: [{ id: 's1', name: 'Main', x: 0, y: 0, width: 12, height: 10 }],
  floorPlan: {
    id: 'fp1',
    walls: [
      { id: 'w1', startX: 0, startY: 0, endX: 20, endY: 0, thickness: 0.5, type: 'exterior' },
    ],
    bounds: { minX: 0, minY: 0, maxX: 20, maxY: 15 },
  },
  furniture: [
    {
      id: 'f1', type: 'softbox-medium', name: 'Key Light',
      x: 3, y: 2, width: 2.5, height: 2.5, rotation: 0, color: '#FFD700',
      zHeight: 7, isLight: true, lightIntensity: 85,
      colorTemperature: 5600, beamAngle: 70, lightDirection: 135,
    },
  ],
  doors: [
    { id: 'd-legacy', wall: 'north', x: 5, width: 3 },
    { id: 'd-wallmode', wallId: 'w1', position: 0.4, width: 3 },
  ],
  windows: [
    { id: 'win-wallmode', wallId: 'w1', position: 0.7, heightFromFloor: 3, width: 4, height: 3 },
  ],
  wallObjects: [],
};

const doc = new DesignModel(payload);
const validationError = doc.validateSync();
const obj = doc.toObject();

const checks = [
  ['validation passes (wall-mode door has no legacy coords)', !validationError],
  ['northAngle', obj.northAngle === 135],
  ['roomSections[0].name', obj.roomSections?.[0]?.name === 'Main'],
  ['floorPlan.walls[0].thickness', obj.floorPlan?.walls?.[0]?.thickness === 0.5],
  ['floorPlan.bounds.maxX', obj.floorPlan?.bounds?.maxX === 20],
  ['furniture[0].isLight', obj.furniture?.[0]?.isLight === true],
  ['furniture[0].lightIntensity', obj.furniture?.[0]?.lightIntensity === 85],
  ['furniture[0].colorTemperature', obj.furniture?.[0]?.colorTemperature === 5600],
  ['furniture[0].beamAngle', obj.furniture?.[0]?.beamAngle === 70],
  ['furniture[0].lightDirection', obj.furniture?.[0]?.lightDirection === 135],
  ['furniture[0].zHeight', obj.furniture?.[0]?.zHeight === 7],
  ['doors[0] legacy wall', obj.doors?.[0]?.wall === 'north'],
  ['doors[1].wallId', obj.doors?.[1]?.wallId === 'w1'],
  ['doors[1].position', obj.doors?.[1]?.position === 0.4],
  ['windows[0].wallId', obj.windows?.[0]?.wallId === 'w1'],
  ['windows[0].heightFromFloor', obj.windows?.[0]?.heightFromFloor === 3],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
}
console.log(failed === 0 ? 'ALL SCHEMA CHECKS PASSED' : `${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
