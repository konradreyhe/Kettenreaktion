import type { Level, ObjectType } from '../types/Level';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/Game';

/** Size lookup matching PhysicsManager.getSizeForType */
function getSizeForType(type: ObjectType): { width: number; height: number } {
  switch (type) {
    case 'ball': return { width: 28, height: 28 };
    case 'domino': return { width: 16, height: 48 };
    case 'crate': return { width: 40, height: 40 };
    case 'weight': return { width: 34, height: 34 };
    case 'bomb': return { width: 30, height: 30 };
    default: return { width: 40, height: 20 };
  }
}

/** Validation issue with severity. */
export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
}

/** Full validation result for a level. */
export interface LevelValidationResult {
  levelId: string;
  levelName: string;
  difficulty: number;
  valid: boolean;
  issues: ValidationIssue[];
}

/** Validate a single level for structural correctness and design issues. */
export function validateLevel(level: Level): LevelValidationResult {
  const issues: ValidationIssue[] = [];
  const w = level.world.width;
  const h = level.world.height;

  // --- World dimensions ---
  if (w !== GAME_WIDTH || h !== GAME_HEIGHT) {
    issues.push({ severity: 'error', message: `World size ${w}x${h} != expected ${GAME_WIDTH}x${GAME_HEIGHT}` });
  }

  // --- Placement zone ---
  const pz = level.placementZone;
  if (pz.width < 20 || pz.height < 20) {
    issues.push({ severity: 'error', message: `Placement zone too small: ${pz.width}x${pz.height}` });
  }
  if (pz.x < 0 || pz.y < 0 || pz.x + pz.width > w || pz.y + pz.height > h) {
    issues.push({ severity: 'error', message: 'Placement zone exceeds world bounds' });
  }
  if (pz.allowedObjects.length === 0) {
    issues.push({ severity: 'error', message: 'Placement zone has no allowed objects' });
  }

  // --- Targets ---
  if (level.targets.length === 0) {
    issues.push({ severity: 'error', message: 'Level has no targets' });
  }
  const targetIds = new Set<string>();
  for (const target of level.targets) {
    if (targetIds.has(target.id)) {
      issues.push({ severity: 'error', message: `Duplicate target ID: ${target.id}` });
    }
    targetIds.add(target.id);
    if (target.points <= 0) {
      issues.push({ severity: 'error', message: `Target ${target.id} has invalid points: ${target.points}` });
    }
    if (target.x < 0 || target.x > w || target.y < 0 || target.y > h) {
      issues.push({ severity: 'error', message: `Target ${target.id} outside world bounds` });
    }
    if (target.type !== 'star' && target.type !== 'bell') {
      issues.push({ severity: 'error', message: `Target ${target.id} has invalid type: ${target.type}` });
    }
  }

  // --- Dynamic objects ---
  const dynamicIds = new Set<string>();
  for (const obj of level.dynamicObjects) {
    if (dynamicIds.has(obj.id)) {
      issues.push({ severity: 'error', message: `Duplicate dynamic object ID: ${obj.id}` });
    }
    dynamicIds.add(obj.id);
    if (obj.x < 0 || obj.x > w || obj.y < 0 || obj.y > h) {
      issues.push({ severity: 'error', message: `Dynamic object ${obj.id} outside world bounds` });
    }
    const size = getSizeForType(obj.type);
    if (obj.y + size.height / 2 > h) {
      issues.push({ severity: 'warning', message: `Dynamic object ${obj.id} may clip through floor (y=${obj.y}, h=${size.height})` });
    }
  }

  // --- Static objects ---
  for (let i = 0; i < level.staticObjects.length; i++) {
    const obj = level.staticObjects[i];
    if (obj.type === 'magnet') {
      if (obj.x < 0 || obj.x > w || obj.y < 0 || obj.y > h) {
        issues.push({ severity: 'error', message: `Magnet [${i}] outside world bounds` });
      }
      const strength = obj.strength ?? 0.0005;
      const radius = obj.radius ?? 120;
      if (strength <= 0 || strength > 0.01) {
        issues.push({ severity: 'warning', message: `Magnet [${i}] unusual strength: ${strength}` });
      }
      if (radius < 20 || radius > 400) {
        issues.push({ severity: 'warning', message: `Magnet [${i}] unusual radius: ${radius}` });
      }
    } else {
      if (obj.x < 0 || obj.y < 0) {
        issues.push({ severity: 'error', message: `Static object [${i}] has negative position` });
      }
      if (obj.width <= 0) {
        issues.push({ severity: 'error', message: `Static object [${i}] has invalid width: ${obj.width}` });
      }
      const height = obj.height ?? 20;
      if (height <= 0) {
        issues.push({ severity: 'error', message: `Static object [${i}] has invalid height: ${height}` });
      }
      // Check if the static object extends well beyond world bounds
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + height / 2;
      if (cx > w + 100 || cy > h + 100) {
        issues.push({ severity: 'warning', message: `Static object [${i}] center far outside world` });
      }
      if (obj.type === 'ramp' && obj.angle !== undefined) {
        if (Math.abs(obj.angle) > 80) {
          issues.push({ severity: 'warning', message: `Ramp [${i}] extreme angle: ${obj.angle}°` });
        }
      }
    }
  }

  // --- Constraints ---
  if (level.constraints) {
    for (let i = 0; i < level.constraints.length; i++) {
      const c = level.constraints[i];
      if (c.type === 'seesaw') {
        if (c.staticIndex === undefined) {
          issues.push({ severity: 'error', message: `Constraint [${i}] seesaw missing staticIndex` });
        } else if (c.staticIndex < 0 || c.staticIndex >= level.staticObjects.length) {
          issues.push({ severity: 'error', message: `Constraint [${i}] seesaw staticIndex ${c.staticIndex} out of range` });
        }
      }
      if (c.type === 'spring' || c.type === 'rope') {
        if (c.bodyA && !dynamicIds.has(c.bodyA)) {
          issues.push({ severity: 'error', message: `Constraint [${i}] references missing bodyA: ${c.bodyA}` });
        }
        if (c.bodyB && !dynamicIds.has(c.bodyB)) {
          issues.push({ severity: 'error', message: `Constraint [${i}] references missing bodyB: ${c.bodyB}` });
        }
        if (!c.bodyA && !c.anchorA) {
          issues.push({ severity: 'warning', message: `Constraint [${i}] has no bodyA or anchorA` });
        }
        if (!c.bodyB && !c.anchorB) {
          issues.push({ severity: 'warning', message: `Constraint [${i}] has no bodyB or anchorB` });
        }
      }
      if (c.type === 'spring' && c.stiffness !== undefined) {
        if (c.stiffness <= 0 || c.stiffness > 1) {
          issues.push({ severity: 'warning', message: `Constraint [${i}] spring stiffness out of range: ${c.stiffness}` });
        }
      }
      if (c.type === 'rope' && c.segments !== undefined) {
        if (c.segments < 2 || c.segments > 30) {
          issues.push({ severity: 'warning', message: `Constraint [${i}] rope segments unusual: ${c.segments}` });
        }
      }
    }
  }

  // --- Portals ---
  if (level.portals) {
    for (let i = 0; i < level.portals.length; i++) {
      const p = level.portals[i];
      if (p.a.x < 0 || p.a.x > w || p.a.y < 0 || p.a.y > h) {
        issues.push({ severity: 'error', message: `Portal [${i}] side A outside world bounds` });
      }
      if (p.b.x < 0 || p.b.x > w || p.b.y < 0 || p.b.y > h) {
        issues.push({ severity: 'error', message: `Portal [${i}] side B outside world bounds` });
      }
      const dx = p.a.x - p.b.x;
      const dy = p.a.y - p.b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 40) {
        issues.push({ severity: 'warning', message: `Portal [${i}] sides too close (${dist.toFixed(0)}px)` });
      }
    }
  }

  // --- Design checks (warnings) ---

  // Check if placement zone overlaps with static objects (player can't place on top of platforms)
  for (let i = 0; i < level.staticObjects.length; i++) {
    const obj = level.staticObjects[i];
    if (obj.type === 'magnet') continue;
    const oh = obj.height ?? 20;
    // Simple AABB overlap check (ignoring rotation for simplicity)
    if (pz.x < obj.x + obj.width && pz.x + pz.width > obj.x &&
        pz.y < obj.y + oh && pz.y + pz.height > obj.y) {
      issues.push({ severity: 'warning', message: `Placement zone overlaps static object [${i}]` });
    }
  }

  // Check all targets are below the floor line (unreachable if embedded in floor)
  const floorY = h - 20; // Floor occupies bottom 20px
  for (const target of level.targets) {
    if (target.y >= floorY) {
      issues.push({ severity: 'warning', message: `Target ${target.id} at y=${target.y} is inside/below floor (y=${floorY})` });
    }
  }

  // Check if any target is inside a static object
  for (const target of level.targets) {
    for (let i = 0; i < level.staticObjects.length; i++) {
      const obj = level.staticObjects[i];
      if (obj.type === 'magnet') continue;
      const oh = obj.height ?? 20;
      if (target.x >= obj.x && target.x <= obj.x + obj.width &&
          target.y >= obj.y && target.y <= obj.y + oh) {
        issues.push({ severity: 'warning', message: `Target ${target.id} may be inside static object [${i}]` });
      }
    }
  }

  // Check difficulty range
  if (level.difficulty < 1 || level.difficulty > 5) {
    issues.push({ severity: 'error', message: `Invalid difficulty: ${level.difficulty}` });
  }

  // Check theme
  if (!['wood', 'stone', 'metal'].includes(level.theme)) {
    issues.push({ severity: 'error', message: `Invalid theme: ${level.theme}` });
  }

  // Check seed variations reference valid keys
  if (level.seed_variations) {
    for (const key of Object.keys(level.seed_variations)) {
      if (!key.includes('_x_offset') && !key.includes('_angle_offset')) {
        issues.push({ severity: 'warning', message: `Unknown seed variation key: ${key}` });
      }
    }
  }

  const hasErrors = issues.some(i => i.severity === 'error');

  return {
    levelId: level.id,
    levelName: level.name,
    difficulty: level.difficulty,
    valid: !hasErrors,
    issues,
  };
}

/** Validate all levels and return results. */
export function validateAllLevels(levels: Level[]): LevelValidationResult[] {
  return levels.map(level => validateLevel(level));
}
