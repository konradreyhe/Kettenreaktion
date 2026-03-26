import type { Level } from '../types/Level';

/** Inline level templates for MVP. Replace with JSON file loading later. */
export const LEVEL_TEMPLATES: Level[] = [
  {
    id: 'template_001',
    name: 'Der erste Dominostein',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50,
      y: 200,
      width: 150,
      height: 200,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 200, y: 400, width: 200, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 420, y: 555 },
      { id: 'd2', type: 'domino', x: 450, y: 555 },
      { id: 'd3', type: 'domino', x: 480, y: 555 },
      { id: 'd4', type: 'domino', x: 510, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 600, y: 550, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -10, max: 10 },
    },
  },
  {
    id: 'template_002',
    name: 'Kugelbahn',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 30,
      y: 50,
      width: 120,
      height: 150,
      allowedObjects: ['ball', 'weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 100, y: 200, width: 250, angle: -15 },
      { type: 'ramp', x: 450, y: 350, width: 250, angle: 15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'crate', x: 650, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 700, y: 530, points: 100 },
    ],
    seed_variations: {
      ramp_angle_offset: { min: -3, max: 3 },
    },
  },
  {
    id: 'template_003',
    name: 'Schwere Last',
    difficulty: 2,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50,
      y: 100,
      width: 100,
      height: 100,
      allowedObjects: ['weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 150, y: 300, width: 200, height: 15 },
      { type: 'ramp', x: 350, y: 450, width: 200, angle: -30 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 200, y: 280 },
      { id: 'd2', type: 'domino', x: 550, y: 555 },
      { id: 'd3', type: 'domino', x: 580, y: 555 },
      { id: 'd4', type: 'domino', x: 610, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 680, y: 550, points: 100 },
      { id: 't2', type: 'star', x: 250, y: 550, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -15, max: 15 },
    },
  },
];
