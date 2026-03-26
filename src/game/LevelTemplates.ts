import type { Level } from '../types/Level';

/** Inline level templates for MVP. Replace with JSON file loading later. */
export const LEVEL_TEMPLATES: Level[] = [
  // ===== DIFFICULTY 1 — Easy =====
  {
    id: 'template_001',
    name: 'Der erste Dominostein',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50, y: 200, width: 150, height: 200,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 200, y: 400, width: 200, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 420, y: 555 },
      { id: 'd2', type: 'domino', x: 455, y: 555 },
      { id: 'd3', type: 'domino', x: 490, y: 555 },
      { id: 'd4', type: 'domino', x: 525, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 600, y: 550, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -8, max: 8 },
    },
  },
  {
    id: 'template_002',
    name: 'Kugelbahn',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 30, y: 50, width: 120, height: 150,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 80, y: 220, width: 280, angle: -15 },
      { type: 'platform', x: 360, y: 320, width: 120, height: 15 },
      { type: 'ramp', x: 420, y: 380, width: 250, angle: 18 },
    ],
    dynamicObjects: [],
    targets: [
      { id: 't1', type: 'star', x: 350, y: 555, points: 100 },
    ],
    seed_variations: {
      ramp_angle_offset: { min: -2, max: 2 },
    },
  },
  {
    id: 'template_003',
    name: 'Einfacher Treffer',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 300, y: 50, width: 200, height: 100,
      allowedObjects: ['ball', 'weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 400, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 430, y: 550, points: 100 },
    ],
  },

  // ===== DIFFICULTY 2 — Medium =====
  {
    id: 'template_004',
    name: 'Schwere Last',
    difficulty: 2,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50, y: 80, width: 100, height: 100,
      allowedObjects: ['weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 130, y: 280, width: 160, height: 12 },
      { type: 'ramp', x: 340, y: 430, width: 200, angle: -25 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 180, y: 260 },
      { id: 'd2', type: 'domino', x: 560, y: 555 },
      { id: 'd3', type: 'domino', x: 595, y: 555 },
      { id: 'd4', type: 'domino', x: 630, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 700, y: 550, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -10, max: 10 },
    },
  },
  {
    id: 'template_005',
    name: 'Doppelrampe',
    difficulty: 2,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 30, width: 100, height: 100,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 60, y: 180, width: 300, angle: -12 },
      { type: 'ramp', x: 500, y: 340, width: 250, angle: 12 },
      { type: 'platform', x: 320, y: 280, width: 80, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'crate', x: 340, y: 255 },
      { id: 'd2', type: 'domino', x: 300, y: 555 },
      { id: 'd3', type: 'domino', x: 335, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 260, y: 550, points: 100 },
      { id: 't2', type: 'star', x: 700, y: 550, points: 100 },
    ],
    seed_variations: {
      ramp_angle_offset: { min: -3, max: 3 },
    },
  },
  {
    id: 'template_006',
    name: 'Plattform-Kaskade',
    difficulty: 2,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 30, y: 30, width: 140, height: 80,
      allowedObjects: ['ball', 'weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 50, y: 200, width: 200, height: 12 },
      { type: 'platform', x: 350, y: 300, width: 180, height: 12 },
      { type: 'platform', x: 550, y: 420, width: 200, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 200, y: 180 },
      { id: 'd2', type: 'ball', x: 480, y: 280 },
      { id: 'd3', type: 'domino', x: 700, y: 395 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 750, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -12, max: 12 },
    },
  },

  // ===== DIFFICULTY 3 — Hard =====
  {
    id: 'template_007',
    name: 'Praezisionsschuss',
    difficulty: 3,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 50, width: 80, height: 80,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 60, y: 200, width: 200, angle: -30 },
      { type: 'platform', x: 250, y: 350, width: 60, height: 10 },
      { type: 'ramp', x: 310, y: 350, width: 180, angle: -20 },
      { type: 'platform', x: 550, y: 250, width: 80, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 570, y: 225 },
      { id: 'd2', type: 'domino', x: 600, y: 225 },
      { id: 'd3', type: 'crate', x: 640, y: 225 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 680, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 560, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -5, max: 5 },
      ramp_angle_offset: { min: -2, max: 2 },
    },
  },
  {
    id: 'template_008',
    name: 'Kettenmeister',
    difficulty: 3,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 250, width: 80, height: 120,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 80, y: 400, width: 180, angle: -15 },
      { type: 'platform', x: 400, y: 480, width: 100, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 280, y: 555 },
      { id: 'd2', type: 'domino', x: 310, y: 555 },
      { id: 'd3', type: 'domino', x: 340, y: 555 },
      { id: 'd4', type: 'domino', x: 370, y: 555 },
      { id: 'd5', type: 'crate', x: 420, y: 455 },
      { id: 'd6', type: 'domino', x: 520, y: 555 },
      { id: 'd7', type: 'domino', x: 550, y: 555 },
      { id: 'd8', type: 'domino', x: 580, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 650, y: 550, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -6, max: 6 },
    },
  },
  {
    id: 'template_009',
    name: 'Dreifach-Ziel',
    difficulty: 3,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 350, y: 30, width: 100, height: 80,
      allowedObjects: ['weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 300, y: 200, width: 200, height: 12 },
      { type: 'ramp', x: 150, y: 350, width: 200, angle: 20 },
      { type: 'ramp', x: 480, y: 350, width: 200, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 350, y: 180 },
      { id: 'd2', type: 'ball', x: 450, y: 180 },
      { id: 'd3', type: 'domino', x: 200, y: 555 },
      { id: 'd4', type: 'domino', x: 600, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 100, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 700, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -8, max: 8 },
    },
  },
  {
    id: 'template_010',
    name: 'Tunnelblick',
    difficulty: 3,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 30, width: 100, height: 60,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 140, width: 250, angle: -10 },
      { type: 'platform', x: 300, y: 230, width: 30, height: 200 },
      { type: 'platform', x: 350, y: 330, width: 250, height: 12 },
      { type: 'ramp', x: 580, y: 420, width: 160, angle: -25 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 400, y: 305 },
      { id: 'd2', type: 'domino', x: 440, y: 305 },
      { id: 'd3', type: 'domino', x: 480, y: 305 },
      { id: 'd4', type: 'domino', x: 520, y: 305 },
      { id: 'd5', type: 'domino', x: 560, y: 305 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 720, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -5, max: 5 },
      ramp_angle_offset: { min: -2, max: 2 },
    },
  },
];
