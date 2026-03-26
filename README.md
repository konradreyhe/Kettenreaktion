# Kettenreaktion

**Daily physics puzzle in the browser.**

One new puzzle every day. Place a single object. Watch the chain reaction unfold. All players worldwide solve the same puzzle. Share your result.

## Concept

- A physics sandbox with pre-placed objects (ramps, dominoes, platforms)
- One highlighted **placement zone** where you drop your object
- Physics simulation runs for 3-8 seconds
- Chain reaction hits (or misses) the targets
- Score based on targets hit, chain length, efficiency, and speed
- 3 attempts per day, UTC reset at midnight
- Share emoji results + GIF replay

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Language | TypeScript 5.5 (strict) | Type safety, AI-friendly, refactor-proof |
| Build | Vite 5.4 | Fastest HMR, simple config |
| Game Engine | Phaser 3.90.0 | Most popular HTML5 engine, best docs |
| Physics | Matter.js 0.19.0 | Native Phaser integration, sufficient for 20-60 bodies |
| Backend | Supabase Free Tier | Leaderboard + streak sync (Phase 2) |
| Hosting | Vercel Free + Cloudflare | Global CDN, auto-deploy, zero cost |
| Assets | Kenney Asset Packs (CC0) | Free, high quality, public domain |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Project Structure

```
src/
  scenes/       Game scenes (Boot, Menu, Game, Result, HowTo)
  game/         Core gameplay logic
  systems/      Daily system, storage, sharing
  ui/           HUD and UI components
  types/        TypeScript interfaces
  constants/    Physics and game constants
assets/
  kenney/       CC0 sprites and sounds
  levels/       Level JSON templates
docs/           Architecture, guides, plans
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI assistant context |
| [PRINCIPLES.md](PRINCIPLES.md) | Engineering principles |
| [Game Plan](docs/GAMEPLAN.md) | Game design document |
| [Roadmap](docs/ROADMAP.md) | Development phases |
| [Architecture](docs/ARCHITECTURE.md) | System design |
| [Components](docs/COMPONENTS.md) | UI/Game components |
| [Security](docs/guides/SECURITY.md) | Security guide |
| [Gameplay](docs/guides/GAMEPLAY.md) | Mechanics deep-dive |
| [Deployment](docs/plans/DEPLOYMENT.md) | Infrastructure plan |

## Development Philosophy

> "Optimize for clarity and adaptability, not perfection."

See [PRINCIPLES.md](PRINCIPLES.md) for the full engineering principles.

**Core rules:** KISS, DRY, YAGNI, SRP, Composition over Inheritance, Fail Fast.

## License

TBD

---
**Solo Developer:** Crelvo | **Target Launch:** August 2026
