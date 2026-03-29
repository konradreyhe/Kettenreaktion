import type { Level } from '../types/Level';

/** Level templates 199-210. Mixed-constraint levels combining seesaw+spring+rope. */
export const LEVEL_TEMPLATES_8: Level[] = [
  // ===== SEESAW + SPRING (4 levels) =====
  { id: 't199', name: 'Federschaukel', difficulty: 2, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 50, y: 30, width: 100, height: 120, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 200, y: 380, width: 250, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 360, y: 358 },
      { id: 'd2', type: 'ball', x: 600, y: 300 },
    ],
    targets: [{ id: 't1', type: 'star', x: 650, y: 555, points: 100 }],
    constraints: [
      { type: 'seesaw', staticIndex: 1 },
      { type: 'spring', bodyA: 'd1', bodyB: 'd2', stiffness: 0.04 },
    ],
  },
  { id: 't200', name: 'Wippenstart', difficulty: 3, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 30, y: 30, width: 80, height: 80, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 120, y: 350, width: 220, height: 12 },
      { type: 'platform', x: 500, y: 300, width: 180, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 280, y: 328 },
      { id: 'd2', type: 'crate', x: 550, y: 278 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 350, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 700, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'seesaw', staticIndex: 1 },
      { type: 'spring', bodyA: 'd2', anchorB: { x: 560, y: 150 }, stiffness: 0.03 },
    ],
  },
  { id: 't201', name: 'Hebelsprung', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 150, y: 300, width: 200, height: 12 },
      { type: 'platform', x: 500, y: 400, width: 200, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 200, y: 278 },
      { id: 'd2', type: 'ball', x: 300, y: 278 },
      { id: 'd3', type: 'crate', x: 560, y: 378 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 100, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 700, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'seesaw', staticIndex: 1 },
      { type: 'spring', bodyA: 'd1', bodyB: 'd3', stiffness: 0.03 },
      { type: 'spring', bodyA: 'd2', bodyB: 'd3', stiffness: 0.03 },
    ],
  },
  { id: 't202', name: 'Federwippenmeister', difficulty: 5, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 100, y: 250, width: 180, height: 12 },
      { type: 'platform', x: 350, y: 380, width: 200, height: 12 },
      { type: 'platform', x: 600, y: 250, width: 150, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'ball', x: 150, y: 228 },
      { id: 'd2', type: 'crate', x: 400, y: 358 },
      { id: 'd3', type: 'ball', x: 500, y: 358 },
      { id: 'd4', type: 'ball', x: 650, y: 228 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 80, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 720, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'seesaw', staticIndex: 1 },
      { type: 'seesaw', staticIndex: 2 },
      { type: 'spring', bodyA: 'd1', bodyB: 'd2', stiffness: 0.04 },
      { type: 'spring', bodyA: 'd3', bodyB: 'd4', stiffness: 0.04 },
    ],
  },

  // ===== ROPE + SEESAW (4 levels) =====
  { id: 't203', name: 'Seilwippe', difficulty: 2, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 50, y: 30, width: 100, height: 120, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 400, y: 420, width: 250, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 300, y: 250 },
      { id: 'd2', type: 'ball', x: 560, y: 398 },
    ],
    targets: [{ id: 't1', type: 'star', x: 650, y: 555, points: 100 }],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 300, y: 80 }, segments: 6, stiffness: 0.9 },
      { type: 'seesaw', staticIndex: 1 },
    ],
  },
  { id: 't204', name: 'Pendelwippe', difficulty: 3, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 350, y: 30, width: 100, height: 80, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 100, y: 380, width: 220, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 500, y: 250 },
      { id: 'd2', type: 'ball', x: 250, y: 358 },
      { id: 'd3', type: 'domino', x: 600, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 150, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 700, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 500, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'seesaw', staticIndex: 1 },
    ],
  },
  { id: 't205', name: 'Doppelpendel', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 300, y: 420, width: 200, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 200, y: 250 },
      { id: 'd2', type: 'weight', x: 600, y: 250 },
      { id: 'd3', type: 'ball', x: 350, y: 398 },
      { id: 'd4', type: 'ball', x: 450, y: 398 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 100, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 700, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 200, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'rope', bodyA: 'd2', anchorB: { x: 600, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'seesaw', staticIndex: 1 },
    ],
  },
  { id: 't206', name: 'Seilkonstrukt', difficulty: 5, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 80, y: 350, width: 200, height: 12 },
      { type: 'platform', x: 520, y: 350, width: 200, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 400, y: 200 },
      { id: 'd2', type: 'ball', x: 130, y: 328 },
      { id: 'd3', type: 'ball', x: 230, y: 328 },
      { id: 'd4', type: 'ball', x: 570, y: 328 },
      { id: 'd5', type: 'ball', x: 670, y: 328 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 80, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 720, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 400, y: 60 }, segments: 6, stiffness: 0.9 },
      { type: 'seesaw', staticIndex: 1 },
      { type: 'seesaw', staticIndex: 2 },
    ],
  },

  // ===== SPRING + ROPE (4 levels) =====
  { id: 't207', name: 'Elastikseil', difficulty: 3, theme: 'wood',
    world: { width: 800, height: 600 },
    placementZone: { x: 350, y: 30, width: 100, height: 80, allowedObjects: ['ball', 'weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 500, y: 350, width: 180, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 200, y: 250 },
      { id: 'd2', type: 'ball', x: 560, y: 328 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 150, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 650, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 200, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'spring', bodyA: 'd2', anchorB: { x: 570, y: 200 }, stiffness: 0.04 },
    ],
  },
  { id: 't208', name: 'Federhaengung', difficulty: 3, theme: 'stone',
    world: { width: 800, height: 600 },
    placementZone: { x: 30, y: 30, width: 80, height: 80, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'ramp', x: 100, y: 220, width: 180, angle: -12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 450, y: 250 },
      { id: 'd2', type: 'ball', x: 600, y: 350 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 300, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 700, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 450, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'spring', bodyA: 'd1', bodyB: 'd2', stiffness: 0.03 },
    ],
    seed_variations: { ramp_angle_offset: { min: -2, max: 2 } },
  },
  { id: 't209', name: 'Kettenreaktor', difficulty: 4, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['weight'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 250, y: 350, width: 150, height: 12 },
      { type: 'platform', x: 500, y: 280, width: 150, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 150, y: 250 },
      { id: 'd2', type: 'ball', x: 300, y: 328 },
      { id: 'd3', type: 'ball', x: 550, y: 258 },
      { id: 'd4', type: 'domino', x: 650, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 100, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 720, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 150, y: 80 }, segments: 7, stiffness: 0.85 },
      { type: 'spring', bodyA: 'd2', bodyB: 'd3', stiffness: 0.04 },
    ],
  },
  { id: 't210', name: 'Physikgenie', difficulty: 5, theme: 'metal',
    world: { width: 800, height: 600 },
    placementZone: { x: 370, y: 30, width: 60, height: 60, allowedObjects: ['ball'] },
    staticObjects: [
      { type: 'platform', x: 0, y: 580, width: 800, height: 20 },
      { type: 'platform', x: 50, y: 280, width: 150, height: 12 },
      { type: 'platform', x: 300, y: 400, width: 200, height: 12 },
      { type: 'platform', x: 600, y: 280, width: 150, height: 12 },
    ],
    dynamicObjects: [
      { id: 'd1', type: 'weight', x: 100, y: 180 },
      { id: 'd2', type: 'ball', x: 350, y: 378 },
      { id: 'd3', type: 'crate', x: 450, y: 378 },
      { id: 'd4', type: 'weight', x: 650, y: 180 },
      { id: 'd5', type: 'domino', x: 250, y: 555 },
    ],
    targets: [
      { id: 't1', type: 'star', x: 80, y: 555, points: 100 },
      { id: 't2', type: 'star', x: 400, y: 555, points: 100 },
      { id: 't3', type: 'star', x: 720, y: 555, points: 100 },
    ],
    constraints: [
      { type: 'rope', bodyA: 'd1', anchorB: { x: 100, y: 60 }, segments: 5, stiffness: 0.9 },
      { type: 'rope', bodyA: 'd4', anchorB: { x: 650, y: 60 }, segments: 5, stiffness: 0.9 },
      { type: 'spring', bodyA: 'd2', bodyB: 'd3', stiffness: 0.05 },
    ],
  },
];
