# KETTENREAKTION - Claude Code Context

## Project Identity
Daily physics puzzle browser game. One new puzzle per day. Player places ONE object, chain reaction starts. All players worldwide solve the same puzzle. Share results as emoji text + GIF replay.

**Status:** Beta-ready (180 levels, feature-complete, deployed)
**Maintainer:** Crelvo
**Launch Target:** August 2026

---

## Tech Stack
- **TypeScript 5.5** - strict mode, no `any` types
- **Vite 5.4** - build tool, HMR
- **Phaser 3.90.0** - HTML5 game engine
- **Matter.js 0.19.0** - physics (integrated via Phaser)
- **Supabase Free Tier** - global leaderboard (Phase 2, not MVP)
- **Vercel Free** - hosting + CDN
- **Cloudflare Free** - asset CDN

## Project Structure
```
src/
  scenes/          Phaser Scenes (Boot, Menu, Game, Result, HowTo)
  game/            Core logic (LevelLoader, PhysicsManager, ChainDetector, ScoreCalculator)
  systems/         Infrastructure (DailySystem, StorageManager, ShareManager)
  ui/              HUD, Modal, Streak display
  types/           TypeScript interfaces (Level, GameObject, GameState)
  constants/       Physics constants, game constants
  main.ts          Entry point
assets/
  kenney/          CC0 sprites from kenney.nl
  audio/           Sound effects
  fonts/           Local Google Fonts
  levels/
    templates/     Level JSON files
    manifest.json  Level index
```

## Key Commands
```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint check
npm run typecheck  # TypeScript strict check
npm run test       # Vitest unit tests
```

## Coding Rules (from PRINCIPLES.md)

### Must Follow
- **KISS:** Simplest solution that works. No clever code.
- **DRY:** Extract shared logic. Constants for magic numbers. Shared types.
- **YAGNI:** Only build what's needed NOW. No speculative features.
- **SRP:** One function = one job. No god objects.
- **Composition > Inheritance:** Inject dependencies, no deep hierarchies.
- **Fail Fast:** Validate at boundaries, throw early, no swallowed errors.
- **Explicit > Implicit:** Full type annotations. Clear function signatures.

### Phaser 3 Specific
- Use `create()`, `update()`, `init()` lifecycle — never work in constructor
- Create Matter.js bodies ONLY via `PhysicsManager` wrapper
- NEVER `import Matter from 'matter-js'` directly — use `this.matter.add.*`
- Always destroy bodies in `shutdown()`/`destroy()`: `this.matter.world.remove(body)`
- Fixed timestep for determinism: `matter.world.setFPS(60)`

### TypeScript Specific
- `strict: true` always — no exceptions
- No `any` types — all Phaser types from `@types/phaser`
- Path aliases: `@/*` maps to `src/*`
- Interfaces for all public contracts

### Asset Rules
- ALWAYS read `assets/levels/manifest.json` before referencing asset keys
- All assets from Kenney (CC0 license) — no attribution needed but appreciated
- Sprites: PNG format. Audio: OGG format.
- No invented filenames — check manifest first

## Architecture (Clean/Hexagonal)
```
Dependencies flow inward:
  Scenes (presentation) -> Services (application) -> Types/Interfaces (domain)

Never:
  - Domain depends on infrastructure
  - Scenes access database directly
  - Game logic in UI components
```

## Level JSON Schema
Levels live in `assets/levels/templates/`. Schema defined in `src/types/Level.ts`.
Key fields: `id`, `difficulty` (1-5), `placementZone`, `staticObjects`, `dynamicObjects`, `targets`, `seed_variations`.

## Anti-Patterns to Avoid
- Magic numbers anywhere (use `constants/Physics.ts` and `constants/Game.ts`)
- `console.log` in production code (use structured logger)
- Circular dependencies between modules
- Deep method chaining (Law of Demeter)
- Business logic in scene files
- Hardcoded secrets or API keys
- Silent error swallowing (`catch(e) {}`)

## Current Focus
Phase 1 MVP: Core gameplay loop — place object, simulate physics, score result.

## Reference Docs
- `PRINCIPLES.md` — Engineering principles (source of truth for HOW we build)
- `docs/GAMEPLAN.md` — Game design (source of truth for WHAT we build)
- `docs/ROADMAP.md` — Development phases and milestones
- `docs/ARCHITECTURE.md` — System architecture and module boundaries
- `docs/COMPONENTS.md` — UI and game component patterns
- `docs/guides/SECURITY.md` — Security architecture
- `docs/guides/GAMEPLAY.md` — Game mechanics deep-dive
- `docs/plans/DEPLOYMENT.md` — Deployment and infrastructure

---
**Last Updated:** 2026-03-26
