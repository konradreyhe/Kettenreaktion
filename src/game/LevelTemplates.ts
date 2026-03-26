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

  // ===== DIFFICULTY 1 — More Easy Levels =====
  {
    id: 'template_011',
    name: 'Sanfter Fall',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 200, y: 50, width: 200, height: 100,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 250, y: 250, width: 180, angle: -10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 450, y: 555 },
      { id: 'd2', type: 'domino', x: 485, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 540, y: 555, points: 100 },
    ],
  },
  {
    id: 'template_012',
    name: 'Direkter Weg',
    difficulty: 1,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50, y: 350, width: 120, height: 120,
      allowedObjects: ['ball', 'weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 250, y: 555 },
      { id: 'd2', type: 'domino', x: 285, y: 555 },
      { id: 'd3', type: 'domino', x: 320, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 380, y: 555, points: 100 },
    ],
  },

  // ===== DIFFICULTY 2 — More Medium Levels =====
  {
    id: 'template_013',
    name: 'Zickzack',
    difficulty: 2,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 30, width: 100, height: 80,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 160, width: 250, angle: -18 },
      { type: 'ramp', x: 350, y: 280, width: 250, angle: 18 },
      { type: 'ramp', x: 150, y: 400, width: 250, angle: -18 },
    ],
    dynamicObjects: [],
    targets: [
      { id: 't1', type: 'star', x: 420, y: 555, points: 100 },
    ],
    seed_variations: {
      ramp_angle_offset: { min: -3, max: 3 },
    },
  },
  {
    id: 'template_014',
    name: 'Brückenschlag',
    difficulty: 2,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 350, y: 30, width: 100, height: 80,
      allowedObjects: ['weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 300, y: 200, width: 200, height: 12 },
      { type: 'platform', x: 200, y: 400, width: 120, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 380, y: 180 },
      { id: 'd2', type: 'domino', x: 230, y: 375 },
      { id: 'd3', type: 'domino', x: 265, y: 375 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 310, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -8, max: 8 },
    },
  },
  {
    id: 'template_015',
    name: 'Doppelpack',
    difficulty: 2,
    theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 370, y: 50, width: 60, height: 80,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 300, y: 200, width: 150, angle: 20 },
      { type: 'ramp', x: 400, y: 200, width: 150, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 200, y: 555 },
      { id: 'd2', type: 'domino', x: 600, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 150, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 650, y: 555, points: 100 },
    ],
    seed_variations: {
      ramp_angle_offset: { min: -4, max: 4 },
    },
  },

  // ===== DIFFICULTY 3 — More Hard Levels =====
  {
    id: 'template_016',
    name: 'Kettenexplosion',
    difficulty: 3,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 200, width: 60, height: 80,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 60, y: 330, width: 150, angle: -25 },
      { type: 'platform', x: 250, y: 450, width: 80, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 220, y: 555 },
      { id: 'd2', type: 'domino', x: 250, y: 555 },
      { id: 'd3', type: 'domino', x: 280, y: 555 },
      { id: 'd4', type: 'crate', x: 270, y: 425 },
      { id: 'd5', type: 'domino', x: 350, y: 555 },
      { id: 'd6', type: 'domino', x: 380, y: 555 },
      { id: 'd7', type: 'domino', x: 410, y: 555 },
      { id: 'd8', type: 'domino', x: 440, y: 555 },
      { id: 'd9', type: 'domino', x: 470, y: 555 },
      { id: 'd10', type: 'domino', x: 500, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 560, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -6, max: 6 },
    },
  },
  {
    id: 'template_017',
    name: 'Hoch und Runter',
    difficulty: 3,
    theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 20, y: 20, width: 80, height: 80,
      allowedObjects: ['weight'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 80, y: 180, width: 120, height: 12 },
      { type: 'ramp', x: 200, y: 280, width: 150, angle: -30 },
      { type: 'platform', x: 400, y: 350, width: 100, height: 12 },
      { type: 'ramp', x: 500, y: 450, width: 180, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 120, y: 160 },
      { id: 'd2', type: 'domino', x: 430, y: 325 },
      { id: 'd3', type: 'domino', x: 460, y: 325 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 700, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 350, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -8, max: 8 },
      ramp_angle_offset: { min: -3, max: 3 },
    },
  },
  {
    id: 'template_018',
    name: 'Engpass',
    difficulty: 3,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 50, y: 30, width: 100, height: 60,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 80, y: 150, width: 200, angle: -12 },
      { type: 'platform', x: 280, y: 240, width: 20, height: 180 },
      { type: 'platform', x: 310, y: 240, width: 20, height: 180 },
      { type: 'ramp', x: 320, y: 420, width: 200, angle: -15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 540, y: 555 },
      { id: 'd2', type: 'domino', x: 570, y: 555 },
      { id: 'd3', type: 'domino', x: 600, y: 555 },
      { id: 'd4', type: 'domino', x: 630, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 700, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -5, max: 5 },
    },
  },

  // ===== DIFFICULTY 4 — Expert =====
  {
    id: 'template_019',
    name: 'Unmoeglich?',
    difficulty: 4,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 380, y: 30, width: 40, height: 40,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 350, y: 150, width: 100, height: 10 },
      { type: 'ramp', x: 200, y: 250, width: 150, angle: 25 },
      { type: 'ramp', x: 450, y: 250, width: 150, angle: -25 },
      { type: 'platform', x: 350, y: 380, width: 60, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 380, y: 130 },
      { id: 'd2', type: 'domino', x: 100, y: 555 },
      { id: 'd3', type: 'domino', x: 700, y: 555 },
      { id: 'd4', type: 'crate', x: 370, y: 355 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 50, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 750, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -5, max: 5 },
    },
  },
  {
    id: 'template_020',
    name: 'Meisterstück',
    difficulty: 4,
    theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: {
      x: 10, y: 50, width: 60, height: 50,
      allowedObjects: ['ball'],
    },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 30, y: 150, width: 180, angle: -22 },
      { type: 'platform', x: 210, y: 260, width: 40, height: 10 },
      { type: 'ramp', x: 250, y: 260, width: 120, angle: -35 },
      { type: 'platform', x: 400, y: 200, width: 80, height: 10 },
      { type: 'ramp', x: 480, y: 200, width: 100, angle: 15 },
      { type: 'platform', x: 580, y: 320, width: 60, height: 10 },
      { type: 'ramp', x: 640, y: 420, width: 140, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 225, y: 240 },
      { id: 'd2', type: 'ball', x: 420, y: 180 },
      { id: 'd3', type: 'domino', x: 600, y: 295 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 750, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -4, max: 4 },
      ramp_angle_offset: { min: -2, max: 2 },
    },
  },

  // ===== TEMPLATES 021-040 — Batch 2 =====

  // -- Difficulty 1 (Easy) --
  { id: 'template_021', name: 'Erste Schritte', difficulty: 1, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 100, y: 100, width: 200, height: 200, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 150, y: 350, width: 250, angle: -12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 420, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 470, y: 555, points: 100 }],
  },
  { id: 'template_022', name: 'Leichtes Spiel', difficulty: 1, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 350, y: 100, width: 100, height: 150, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 370, y: 555 },
      { id: 'd2', type: 'domino', x: 400, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 440, y: 555, points: 100 }],
  },
  { id: 'template_023', name: 'Rutschpartie', difficulty: 1, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 30, width: 150, height: 100, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 200, width: 350, angle: -8 },
    ],
    dynamicObjects: [],
    targets: [{ id: 't1', type: 'star', x: 500, y: 555, points: 100 }],
  },
  { id: 'template_024', name: 'Zwei Stufen', difficulty: 1, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 50, y: 50, width: 120, height: 100, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 100, y: 250, width: 200, height: 12 },
      { type: 'platform', x: 350, y: 400, width: 200, height: 12 },
    ],
    dynamicObjects: [],
    targets: [{ id: 't1', type: 'star', x: 500, y: 555, points: 100 }],
  },

  // -- Difficulty 2 (Medium) --
  { id: 'template_025', name: 'Umweg', difficulty: 2, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 650, y: 50, width: 100, height: 100, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 600, y: 200, width: 180, angle: 20 },
      { type: 'ramp', x: 250, y: 350, width: 250, angle: -15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 150, y: 555 },
      { id: 'd2', type: 'domino', x: 180, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 100, y: 555, points: 100 }],
    seed_variations: { ramp_angle_offset: { min: -3, max: 3 } },
  },
  { id: 'template_026', name: 'Sprungbrett', difficulty: 2, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 30, y: 300, width: 80, height: 100, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 80, y: 440, width: 150, angle: -30 },
      { type: 'platform', x: 300, y: 350, width: 100, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'crate', x: 330, y: 325 },
      { id: 'd2', type: 'domino', x: 450, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 500, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -10, max: 10 } },
  },
  { id: 'template_027', name: 'Symmetrie', difficulty: 2, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 250, y: 250, width: 150, angle: 20 },
      { type: 'ramp', x: 450, y: 250, width: 150, angle: -20 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 200, y: 555 },
      { id: 'd2', type: 'ball', x: 600, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 100, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 700, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -4, max: 4 } },
  },
  { id: 'template_028', name: 'Kettenbrücke', difficulty: 2, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 30, width: 100, height: 80, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 170, width: 200, angle: -10 },
      { type: 'platform', x: 280, y: 250, width: 150, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 310, y: 225 },
      { id: 'd2', type: 'domino', x: 340, y: 225 },
      { id: 'd3', type: 'domino', x: 370, y: 225 },
      { id: 'd4', type: 'domino', x: 500, y: 555 },
      { id: 'd5', type: 'domino', x: 530, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 600, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -6, max: 6 } },
  },
  { id: 'template_029', name: 'Aufprall', difficulty: 2, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 30, y: 30, width: 80, height: 80, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 60, y: 200, width: 100, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 90, y: 180 },
      { id: 'd2', type: 'ball', x: 120, y: 180 },
      { id: 'd3', type: 'domino', x: 300, y: 555 },
      { id: 'd4', type: 'domino', x: 330, y: 555 },
      { id: 'd5', type: 'domino', x: 360, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 420, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -8, max: 8 } },
  },
  { id: 'template_030', name: 'Staffellauf', difficulty: 2, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 50, width: 100, height: 80, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 200, width: 180, angle: -15 },
      { type: 'platform', x: 250, y: 320, width: 120, height: 10 },
      { type: 'ramp', x: 370, y: 400, width: 180, angle: -15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'crate', x: 290, y: 295 },
      { id: 'd2', type: 'domino', x: 560, y: 555 },
      { id: 'd3', type: 'domino', x: 590, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 650, y: 555, points: 100 }],
    seed_variations: { ramp_angle_offset: { min: -3, max: 3 } },
  },

  // -- Difficulty 3 (Hard) --
  { id: 'template_031', name: 'Nadel\u00F6hr', difficulty: 3, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 20, width: 60, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 40, y: 130, width: 180, angle: -20 },
      { type: 'platform', x: 220, y: 200, width: 15, height: 250 },
      { type: 'platform', x: 245, y: 200, width: 15, height: 250 },
      { type: 'platform', x: 260, y: 450, width: 200, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 300, y: 425 },
      { id: 'd2', type: 'domino', x: 330, y: 425 },
      { id: 'd3', type: 'domino', x: 360, y: 425 },
      { id: 'd4', type: 'domino', x: 390, y: 425 },
    ],
    targets: [{ id: 't1', type: 'star', x: 450, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -4, max: 4 } },
  },
  { id: 'template_032', name: 'Doppelschlag', difficulty: 3, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 20, width: 60, height: 60, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 350, y: 150, width: 100, height: 10 },
      { type: 'ramp', x: 100, y: 300, width: 200, angle: 15 },
      { type: 'ramp', x: 500, y: 300, width: 200, angle: -15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 380, y: 130 },
      { id: 'd2', type: 'ball', x: 420, y: 130 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 50, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 750, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -3, max: 3 } },
  },
  { id: 'template_033', name: 'Treppenlauf', difficulty: 3, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 20, width: 80, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 60, y: 150, width: 150, height: 10 },
      { type: 'platform', x: 250, y: 250, width: 150, height: 10 },
      { type: 'platform', x: 440, y: 350, width: 150, height: 10 },
      { type: 'platform', x: 620, y: 450, width: 150, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 160, y: 125 },
      { id: 'd2', type: 'domino', x: 350, y: 225 },
      { id: 'd3', type: 'domino', x: 540, y: 325 },
      { id: 'd4', type: 'domino', x: 720, y: 425 },
    ],
    targets: [{ id: 't1', type: 'star', x: 750, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -8, max: 8 } },
  },
  { id: 'template_034', name: 'Irrweg', difficulty: 3, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 680, y: 20, width: 80, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 620, y: 140, width: 160, angle: 25 },
      { type: 'ramp', x: 300, y: 280, width: 200, angle: -15 },
      { type: 'platform', x: 100, y: 400, width: 200, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 150, y: 375 },
      { id: 'd2', type: 'domino', x: 180, y: 375 },
      { id: 'd3', type: 'domino', x: 210, y: 375 },
      { id: 'd4', type: 'crate', x: 250, y: 375 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 80, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 300, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -3, max: 3 } },
  },
  { id: 'template_035', name: 'Wippeneffekt', difficulty: 3, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 20, width: 70, height: 70, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 80, y: 200, width: 200, height: 10 },
      { type: 'ramp', x: 280, y: 300, width: 100, angle: -40 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 140, y: 180 },
      { id: 'd2', type: 'ball', x: 200, y: 180 },
      { id: 'd3', type: 'domino', x: 400, y: 555 },
      { id: 'd4', type: 'domino', x: 430, y: 555 },
      { id: 'd5', type: 'domino', x: 460, y: 555 },
      { id: 'd6', type: 'domino', x: 490, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 550, y: 555, points: 100 }],
    seed_variations: { domino_x_offset: { min: -5, max: 5 } },
  },

  // -- Difficulty 4 (Expert) --
  { id: 'template_036', name: 'Perfekter Winkel', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 250, width: 50, height: 50, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 50, y: 340, width: 120, angle: -35 },
      { type: 'platform', x: 200, y: 250, width: 60, height: 10 },
      { type: 'ramp', x: 260, y: 250, width: 100, angle: -25 },
      { type: 'platform', x: 400, y: 180, width: 60, height: 10 },
      { type: 'ramp', x: 460, y: 280, width: 150, angle: -15 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 220, y: 225 },
      { id: 'd2', type: 'domino', x: 420, y: 155 },
      { id: 'd3', type: 'domino', x: 620, y: 555 },
      { id: 'd4', type: 'domino', x: 650, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 720, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -2, max: 2 } },
  },
  { id: 'template_037', name: 'Drei Wege', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 20, width: 60, height: 50, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 340, y: 150, width: 120, height: 10 },
      { type: 'ramp', x: 100, y: 250, width: 200, angle: 20 },
      { type: 'ramp', x: 500, y: 250, width: 200, angle: -20 },
      { type: 'platform', x: 350, y: 350, width: 100, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 370, y: 130 },
      { id: 'd2', type: 'ball', x: 430, y: 130 },
      { id: 'd3', type: 'crate', x: 380, y: 325 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 50, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 750, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -3, max: 3 } },
  },
  { id: 'template_038', name: 'Labyrinth', difficulty: 4, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 20, y: 20, width: 50, height: 50, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 30, y: 120, width: 200, angle: -10 },
      { type: 'platform', x: 230, y: 180, width: 15, height: 150 },
      { type: 'ramp', x: 245, y: 330, width: 200, angle: 10 },
      { type: 'platform', x: 445, y: 300, width: 15, height: 150 },
      { type: 'ramp', x: 460, y: 300, width: 200, angle: -12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 670, y: 555 },
      { id: 'd2', type: 'domino', x: 700, y: 555 },
    ],
    targets: [{ id: 't1', type: 'star', x: 750, y: 555, points: 100 }],
    seed_variations: { ramp_angle_offset: { min: -2, max: 2 } },
  },
  { id: 'template_039', name: 'Gegenverkehr', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 250, width: 60, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 200, y: 350, width: 180, angle: 15 },
      { type: 'ramp', x: 450, y: 350, width: 180, angle: -15 },
      { type: 'platform', x: 100, y: 450, width: 80, height: 10 },
      { type: 'platform', x: 620, y: 450, width: 80, height: 10 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'crate', x: 120, y: 425 },
      { id: 'd2', type: 'crate', x: 640, y: 425 },
      { id: 'd3', type: 'domino', x: 50, y: 555 },
      { id: 'd4', type: 'domino', x: 750, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 20, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 780, y: 555, points: 100 },
    ],
    seed_variations: { ramp_angle_offset: { min: -4, max: 4 } },
  },
  { id: 'template_040', name: 'Finale', difficulty: 5, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 10, y: 10, width: 40, height: 40, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 20, y: 100, width: 150, angle: -25 },
      { type: 'platform', x: 170, y: 180, width: 40, height: 10 },
      { type: 'ramp', x: 210, y: 180, width: 100, angle: -30 },
      { type: 'platform', x: 350, y: 120, width: 100, height: 10 },
      { type: 'ramp', x: 450, y: 200, width: 120, angle: 20 },
      { type: 'ramp', x: 300, y: 350, width: 200, angle: -10 },
      { type: 'platform', x: 550, y: 400, width: 80, height: 10 },
      { type: 'ramp', x: 630, y: 480, width: 140, angle: -18 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'domino', x: 190, y: 155 },
      { id: 'd2', type: 'ball', x: 380, y: 100 },
      { id: 'd3', type: 'domino', x: 570, y: 375 },
      { id: 'd4', type: 'domino', x: 730, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 600, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 770, y: 555, points: 100 },
    ],
    seed_variations: {
      domino_x_offset: { min: -3, max: 3 },
      ramp_angle_offset: { min: -2, max: 2 },
    },
  },
];
