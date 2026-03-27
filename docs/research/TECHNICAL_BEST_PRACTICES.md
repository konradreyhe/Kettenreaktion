# Technical Best Practices Research

**Project:** Kettenreaktion (Daily Physics Puzzle Browser Game)
**Stack:** TypeScript 5.5 + Vite 5.4 + Phaser 3.90 + Matter.js 0.19
**Deployment:** Vercel + GitHub Pages
**Research Date:** 2026-03-26

---

## Table of Contents

1. [PWA Best Practices](#1-pwa-best-practices)
2. [Phaser 3 Performance Optimization](#2-phaser-3-performance-optimization)
3. [Matter.js Determinism](#3-matterjs-determinism)
4. [View Transitions API](#4-view-transitions-api)
5. [Web Animations API](#5-web-animations-api)
6. [Modern CSS for Game UIs](#6-modern-css-for-game-uis)
7. [Vercel Edge Config / KV vs Supabase](#7-vercel-edge-config--kv-vs-supabase)
8. [WebCodecs API for Replay Export](#8-webcodecs-api-for-replay-export)
9. [Storage APIs](#9-storage-apis)
10. [Phaser 3 to Phaser 4 Migration](#10-phaser-3-to-phaser-4-migration)
11. [Bundle Size Optimization](#11-bundle-size-optimization)
12. [Testing Browser Games](#12-testing-browser-games)
13. [Priority Summary](#13-priority-summary)

---

## 1. PWA Best Practices

### Current State (2025-2026)

Every major browser now fully supports core PWA APIs: service workers, Web App Manifest, and Web Push. Firefox added Windows PWA support from version 143. Chrome and Edge no longer require a service worker to show the install prompt -- only the manifest is needed (though a service worker is still needed for offline functionality).

### Recommended Strategy for Kettenreaktion

**Service Worker Caching:**

- **Cache-First** for static game assets (sprites, audio, fonts, level JSON files). These rarely change and should load instantly.
- **Stale-While-Revalidate** for the daily puzzle manifest/metadata. Show yesterday's cached version instantly, update silently in background.
- **Network-First** for leaderboard data and any API calls. Fresh data matters here; fall back to cache when offline.

**Tooling: `vite-plugin-pwa`**

This is the recommended integration for Vite projects. From v0.17, it requires Vite 5 (which we already use). Configuration example:

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW', // auto-generates service worker
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,ogg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/levels\/templates\/.+\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'daily-levels' }
          }
        ]
      },
      manifest: {
        name: 'Kettenreaktion',
        short_name: 'Kette',
        theme_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait'
      }
    })
  ]
});
```

**Offline-First Design:**

For a daily puzzle game, offline-first is highly valuable. Players should be able to:
- Launch the app offline and play yesterday's puzzle (cached).
- See their streak and history (stored locally).
- Queue their result submission for when connectivity returns (background sync).

### Recommendations

| Action | Priority |
|--------|----------|
| Add `vite-plugin-pwa` with `generateSW` strategy | **Must-do** |
| Cache-first for all game assets | **Must-do** |
| Add web app manifest (name, icons, theme, display: standalone) | **Must-do** |
| Stale-while-revalidate for daily puzzle data | **Should-do** |
| Background sync for score submission | **Nice-to-have** |
| Install prompt UI with custom banner | **Nice-to-have** |

### Sources

- [Offline-First PWAs: Service Worker Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)
- [Progressive Web Apps 2026: PWA Performance Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide)
- [PWA | 2025 | The Web Almanac](https://almanac.httparchive.org/en/2025/pwa)
- [vite-plugin-pwa GitHub](https://github.com/vite-pwa/vite-plugin-pwa)
- [Workbox Configuration for Vite PWA](https://vite-pwa-org.netlify.app/workbox/)

---

## 2. Phaser 3 Performance Optimization

### Key Techniques

**Object Pooling (Must-do)**

Phaser 3 Groups act as object pools. Instead of creating/destroying GameObjects each frame, reuse them:

```typescript
// Create pool once
const debrisPool = this.add.group({
  classType: Phaser.Physics.Matter.Sprite,
  maxSize: 50,
  runChildUpdate: false  // manual update for performance
});

// Get from pool instead of creating
const debris = debrisPool.get(x, y, 'debris');
if (debris) {
  debris.setActive(true).setVisible(true);
}

// Return to pool instead of destroying
debris.setActive(false).setVisible(false);
```

For Kettenreaktion, pool particle effects, debris, and any objects spawned during chain reactions.

**Texture Atlases (Must-do)**

Combine sprites into texture atlases. Benefits:
- Fewer draw calls (objects sharing an atlas are batched together).
- Since Phaser 3.50, multi-texture batching allows up to 16 unique textures in a single draw call.
- Use TexturePacker or free alternatives to generate atlas JSON + spritesheet.

**Mobile Rendering (Should-do)**

- Phaser 3.60 improved mobile GPU performance with a hybrid batch system.
- On older mobile devices, Canvas renderer can be 30% faster than WebGL (counterintuitively). Consider auto-detection:

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL with Canvas fallback
  // For explicit mobile optimization:
  // type: isMobileLowEnd() ? Phaser.CANVAS : Phaser.WEBGL
};
```

**General Performance Tips:**

- Use `setActive(false)` + `setVisible(false)` instead of `destroy()` for temporary objects.
- Limit `update()` processing: skip frames for non-critical systems.
- Compress assets aggressively (use TinyPNG for sprites, OGG for audio).
- Keep canvas size reasonable: 800x600 or 960x640 is plenty for a puzzle game.
- Avoid creating objects in `update()` -- pre-create in `create()`.

### Recommendations

| Action | Priority |
|--------|----------|
| Use texture atlases for all game sprites | **Must-do** |
| Object pooling for chain reaction particles/debris | **Must-do** |
| `Phaser.AUTO` renderer with Canvas fallback | **Must-do** |
| Compress all PNG sprites (TinyPNG or similar) | **Should-do** |
| Profile with Chrome DevTools Performance tab | **Should-do** |
| Lazy-load non-critical scenes | **Nice-to-have** |

### Sources

- [How I Optimized My Phaser 3 Action Game in 2025](https://phaser.io/news/2025/03/how-i-optimized-my-phaser-3-action-game-in-2025)
- [Game Optimization with Object Pools in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/)
- [Phaser 3.60 Mobile Performance Improvements](https://github.com/phaserjs/phaser/blob/v3.60.0/changelog/3.60/MobilePerformance.md)
- [Tips on Speeding Up Phaser Games](https://gist.github.com/MarcL/748f29faecc6e3aa679a385bffbdf6fe)

---

## 3. Matter.js Determinism

### The Challenge

Kettenreaktion requires that all players see the same puzzle and that replays are reproducible. This requires deterministic physics simulation. Matter.js has known challenges here:

**Cross-Browser Floating-Point Differences:**

IEEE 754 floating-point arithmetic is deterministic per-platform but NOT reproducible across different browsers, operating systems, or CPU architectures. Users have documented different collision results between Safari and Chrome for the same Matter.js simulation.

**What Works:**

- Fixed timestep of `1000/60` ms (16.667ms per step) -- never use variable delta.
- Identical initial conditions (positions, velocities, body properties).
- Same Matter.js version across all environments.
- Same execution order of physics operations.

**What Does NOT Guarantee Determinism:**

- Running the same code on different browsers (Safari vs Chrome).
- Different OS/CPU combinations (x86 vs ARM).
- Using `Math.random()` anywhere in physics code.

### Recommended Strategy for Kettenreaktion

Since this is a single-player daily puzzle (not multiplayer lockstep), **perfect cross-device determinism is NOT required.** What IS required:

1. **Same puzzle for everyone:** Use a seeded PRNG (e.g., `mulberry32`) with the day's date as seed to generate puzzle parameters. Do NOT use `Math.random()`.
2. **Replay on same device:** Record player input (placement position + timing), then replay by re-running the simulation with the same input. This works because same device = same floating-point behavior.
3. **Score consistency:** Use tolerance-based scoring rather than exact position checks. A target is "hit" if distance < threshold, not if position === exact value.
4. **GIF replay as share format:** Since replays may differ across devices, export as GIF/video rather than re-simulating on the viewer's device.

```typescript
// Seeded PRNG for daily puzzle generation
function mulberry32(seed: number): () => number {
  return function(): number {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Usage: same seed = same puzzle layout every time
const dailySeed = getDaySeed(); // e.g., 20260326
const rng = mulberry32(dailySeed);
```

### Recommendations

| Action | Priority |
|--------|----------|
| Fixed timestep `matter.world.setFPS(60)` | **Must-do** |
| Seeded PRNG for puzzle generation (no `Math.random`) | **Must-do** |
| Tolerance-based collision/scoring (not exact positions) | **Must-do** |
| Record input for replay, not physics state | **Should-do** |
| Export replay as GIF rather than re-simulation | **Should-do** |
| Test on Chrome, Safari, Firefox to verify acceptable similarity | **Should-do** |

### Sources

- [Matter.js Determinism Issue #1190](https://github.com/liabru/matter-js/issues/1190)
- [Computing Precision Between Browsers Issue #499](https://github.com/liabru/matter-js/issues/499)
- [Floating Point Determinism - Gaffer On Games](https://gafferongames.com/post/floating_point_determinism/)
- [Matter.js Engine API Docs](https://brm.io/matter-js/docs/classes/Engine.html)

---

## 4. View Transitions API

### Current State

The View Transitions API is now production-ready and widely supported:

- **Same-document transitions (SPAs):** Chrome 111+, Edge 111+, Firefox 133+, Safari 18+. Baseline Newly Available since October 2025. Over 85% browser coverage.
- **Cross-document transitions (MPAs):** Chrome 126+, Edge 126+, Safari 18.2+. Firefox not yet supported.

### Relevance to Kettenreaktion

Kettenreaktion uses Phaser scenes (Boot, Menu, Game, Result, HowTo), which are internal to the canvas. The View Transitions API operates on DOM elements, so it is most useful for:

- Transitioning between HTML overlay menus and the game canvas.
- Animating modal dialogs (HowTo, Results, Settings).
- Scene transitions where the menu is HTML-based and game is canvas-based.

**Usage pattern:**

```typescript
// Transition from menu overlay to game canvas
document.startViewTransition(() => {
  menuOverlay.classList.add('hidden');
  gameCanvas.classList.remove('hidden');
});
```

The API degrades gracefully: if unsupported, the DOM update happens instantly without animation.

### Recommendations

| Action | Priority |
|--------|----------|
| Use for HTML menu/overlay transitions | **Nice-to-have** |
| Do NOT use for in-canvas Phaser scene transitions | N/A |
| Progressive enhancement only (check support first) | **Nice-to-have** |

### Sources

- [View Transitions API - Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions)
- [View Transition API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [What's New in View Transitions (2025 Update)](https://developer.chrome.com/blog/view-transitions-in-2025)

---

## 5. Web Animations API

### Current State

The Web Animations API (WAAPI) is supported in all modern browsers and provides JavaScript access to the browser's animation engine. It supports CSS timing functions natively.

### Relevance to Kettenreaktion

WAAPI is useful for animating DOM elements outside the Phaser canvas:

- Score counters, streak displays, timer UI.
- Button hover/press feedback.
- Modal entry/exit animations.
- Share button celebrations.

**Performance Tiers (from Motion.dev):**

- **Best performance:** `transform` and `opacity` animations (GPU-composited, off main thread).
- **Good performance:** `filter`, `clip-path`.
- **Avoid:** `width`, `height`, `top`, `left`, `margin`, `padding` (trigger layout reflow).

```typescript
// Animate score counter
scoreElement.animate([
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.3)', opacity: 0.8 },
  { transform: 'scale(1)', opacity: 1 }
], {
  duration: 400,
  easing: 'ease-out'
});
```

**Enhanced library consideration:** Motion (motion.dev) extends WAAPI with spring animations, custom easings, and hardware acceleration. At ~18KB gzipped, it may be worth it for complex UI animations, but for a simple puzzle game, native WAAPI is sufficient.

### Recommendations

| Action | Priority |
|--------|----------|
| Use native WAAPI for HUD/overlay animations | **Should-do** |
| Stick to `transform` and `opacity` only | **Must-do** (if animating) |
| Skip Motion library -- native WAAPI is enough | **Should-do** |

### Sources

- [Web Animations API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Web Animation Performance Tier List - Motion.dev](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Animation Performance and Frame Rate - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)

---

## 6. Modern CSS for Game UIs

### Features Now Production-Ready (2025-2026)

The CSS landscape has changed dramatically. All of these are now supported in all major browsers:

**Container Queries (Must-use for responsive game UI)**

Style components based on their container size, not the viewport. Perfect for game UI panels that need to adapt to different canvas sizes:

```css
.score-panel {
  container-type: inline-size;
  container-name: score;
}

@container score (max-width: 300px) {
  .score-panel .label { display: none; }
  .score-panel .value { font-size: 1.2rem; }
}
```

**CSS Nesting (Replaces Sass nesting)**

Native CSS nesting eliminates the need for a Sass preprocessor:

```css
.game-overlay {
  background: rgba(0, 0, 0, 0.8);

  & .modal {
    background: white;
    border-radius: 12px;

    & h2 { margin: 0; }
    &.is-visible { display: flex; }
  }
}
```

**:has() Selector (Parent selector)**

Style parents based on child state. Useful for game UI state management:

```css
/* Style the game container differently when result modal is visible */
.game-container:has(.result-modal.visible) {
  filter: blur(4px);
}

/* Highlight placement zone when player has selected an object */
.placement-zone:has(+ .object-selected) {
  border-color: gold;
}
```

**animation-timeline (Scroll-linked animations)**

Less relevant for a game, but useful if you have scrollable content (leaderboards, how-to guides):

```css
.leaderboard-progress {
  animation: fill-bar linear;
  animation-timeline: scroll(nearest block);
}
```

### Recommendations

| Action | Priority |
|--------|----------|
| Use CSS nesting (drop Sass dependency if any) | **Must-do** |
| Container queries for responsive overlay UI | **Should-do** |
| `:has()` for state-based UI styling | **Should-do** |
| `animation-timeline` for scrollable content | **Nice-to-have** |

### Sources

- [The State of CSS in 2026](https://www.codercops.com/blog/state-of-css-2026)
- [Modern CSS 2026: Container Queries, Cascade Layers & Beyond](https://blog.weskill.org/2026/03/modern-css-2026-container-queries_01245639116.html)
- [10 CSS Features Changing the Game in 2026](https://www.cssdorks.com/2026/01/10-css-features-changing-game-in-2026.html)
- [2026 CSS Features You Must Know](https://blog.riadkilani.com/2026-css-features-you-must-know/)

---

## 7. Vercel Edge Config / KV vs Supabase

### Options Comparison

| Feature | Supabase Free | Vercel KV Free | Vercel Edge Config |
|---------|--------------|----------------|-------------------|
| **Type** | PostgreSQL + Auth + Storage | Redis (Upstash) | Key-value store |
| **Free Limits** | 500MB DB, 50K MAU, 1GB storage | 256MB, 500K commands/mo | 8KB data, read-only |
| **Latency** | ~50-200ms (regional) | ~5-15ms (global) | <1ms (edge) |
| **Best For** | Complex queries, auth, relational data | Leaderboards, counters, sessions | Feature flags, config |
| **Paid Tier** | $25/mo (Pro) | Pay-as-you-go | Included with Pro |

### Recommendation for Kettenreaktion

**Keep Supabase for the leaderboard (Phase 2).** Here is why:

1. **Leaderboard needs relational queries:** "Top 100 today," "My rank," "Friend scores" -- these are SQL queries, not simple key lookups.
2. **Supabase free tier is generous enough:** 500MB database and 50K MAU covers a daily puzzle game for a long time.
3. **Auth integration:** If you ever add user accounts, Supabase Auth is built in.

**Consider Vercel KV for supplementary features:**

- Rate limiting API calls (built-in Upstash rate limiter).
- Caching daily puzzle metadata at the edge for sub-10ms reads.
- Session-based feature flags.

**Edge Config is too limited:** 8KB maximum data size makes it unsuitable for anything beyond feature flags.

### Recommendations

| Action | Priority |
|--------|----------|
| Use Supabase for leaderboard (Phase 2, as planned) | **Must-do** |
| Skip Vercel KV for MVP -- unnecessary complexity | **Should-do** |
| Consider Vercel KV for rate limiting if needed later | **Nice-to-have** |
| Skip Edge Config entirely -- too limited | **Should-do** |

### Sources

- [Vercel Storage Overview](https://vercel.com/docs/storage)
- [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Vercel vs Supabase (2026) Comparison](https://uibakery.io/blog/vercel-vs-supabase)

---

## 8. WebCodecs API for Replay Export

### Current State

The WebCodecs API provides low-level access to video/audio encoding and decoding. Browser support:

- **Chromium (Chrome, Edge):** Full support.
- **Safari:** Partial support (growing).
- **Firefox:** Not yet supported.

### Recommended Library: `canvas-record`

The [`canvas-record`](https://github.com/dmnsgn/canvas-record) npm package supports recording from 2D/WebGL/WebGPU canvas as MP4, WebM, MKV, MOV, GIF, or PNG/JPG sequences. It uses WebCodecs when available and falls back to Wasm-based encoding.

**Performance:** WebCodecs is 5-10x faster than H264MP4Encoder (Wasm) and 20x faster than FFmpeg (Wasm).

**Fallback chain:** GIF encoder > WebCodecs > H264MP4 (Wasm).

### Strategy for Kettenreaktion Replay Export

**Option A: GIF Export (Recommended for MVP)**

- Universally shareable (works on every platform).
- `canvas-record` supports GIF natively.
- File size: ~2-5MB for a 5-10 second replay at low resolution.
- Works on all browsers without WebCodecs.

**Option B: WebM/MP4 via WebCodecs (Phase 2)**

- Smaller file size, better quality.
- Requires WebCodecs (Chromium only for now).
- Could offer as "HD replay" option alongside GIF.

**Alternative approach: Re-render from input log**

Instead of recording the canvas in real time, replay the simulation from the recorded input (placement position) and capture frames:

```typescript
// 1. Record: save only the player's placement
const replayData = { x: 120, y: 340, objectType: 'ball', seed: 20260326 };

// 2. Replay: re-simulate at controlled speed, capture each frame
for (let frame = 0; frame < totalFrames; frame++) {
  Matter.Engine.update(engine, 1000 / 60);
  scene.renderer.snapshot(image => recorder.addFrame(image));
}

// 3. Export as GIF
const blob = await recorder.export();
```

### Recommendations

| Action | Priority |
|--------|----------|
| Implement GIF export using `canvas-record` | **Should-do** |
| Record player input (position only) for replays | **Must-do** |
| Use re-render approach (not real-time recording) | **Should-do** |
| Add WebM/MP4 option when WebCodecs support widens | **Nice-to-have** |

### Sources

- [canvas-record GitHub](https://github.com/dmnsgn/canvas-record)
- [WebCodecs API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [Video Processing with WebCodecs - Chrome](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs)

---

## 9. Storage APIs

### Comparison for Game Data

| Feature | localStorage | IndexedDB | OPFS |
|---------|-------------|-----------|------|
| **Capacity** | ~5MB | Up to 80% of disk | Up to 80% of disk |
| **Data Types** | Strings only | Structured (objects, blobs) | Raw files |
| **API Complexity** | Very simple | Verbose (callback-based) | File system API |
| **Performance** | Fast for small reads | Slower but handles large data | 4x faster than IndexedDB |
| **Browser Support** | Universal | Universal | Chrome, Edge (Firefox partial, Safari limited) |
| **Private Browsing** | Available (cleared on close) | Available (cleared on close) | Chrome ~100MB, Firefox/Safari disabled |

### Recommendation for Kettenreaktion

**Use localStorage for MVP.** Here is why:

- Game data is small: daily result, streak count, settings, last played date. Total: <10KB.
- The 5MB limit is more than sufficient.
- API is trivial to use and universally supported.
- Aligns with KISS and YAGNI principles.

**When to upgrade to IndexedDB:**

- If storing replay data (input logs for many days).
- If storing cached level data for offline play.
- If data exceeds ~1MB total.

**Skip OPFS for now:** Browser support is incomplete (Safari/Firefox issues in private browsing), and the complexity is not justified for small key-value data.

```typescript
// StorageManager - start simple, migrate later if needed
interface GameState {
  lastPlayedDate: string;
  streak: number;
  results: DailyResult[];
  settings: UserSettings;
}

class StorageManager {
  private readonly KEY = 'kettenreaktion_state';

  load(): GameState | null {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) as GameState : null;
  }

  save(state: GameState): void {
    localStorage.setItem(this.KEY, JSON.stringify(state));
  }
}
```

### Recommendations

| Action | Priority |
|--------|----------|
| Use localStorage for game state (MVP) | **Must-do** |
| Wrap in StorageManager for future migration | **Must-do** |
| Migrate to IndexedDB if data grows beyond 1MB | **Nice-to-have** |
| Skip OPFS until browser support matures | **Should-do** |

### Sources

- [LocalStorage vs IndexedDB vs Cookies vs OPFS vs WASM-SQLite](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)
- [Browser Storage Comparison](https://recca0120.github.io/en/2026/03/06/browser-storage-comparison/)
- [SQLite in the Browser: OPFS Makes LocalStorage Obsolete](https://chyshkala.com/blog/sqlite-in-the-browser-just-got-real-opfs-makes-localstorage-obsolete)

---

## 10. Phaser 3 to Phaser 4 Migration

### Current Status

- **Phaser 4.0.0** was released in November 2024.
- **Release Candidate 4** was published in December 2025 with enhanced texture controls and stability fixes.
- **Phaser 3.90.0** is very likely the last version of Phaser 3. All new features will land exclusively in Phaser 4.

### Migration Path

The migration is designed to be straightforward:

- **API is largely the same.** Phaser Beam (the new renderer) uses an almost identical client API to Phaser 3. Most existing code works without changes.
- **Key breaking changes:**
  1. **Pipeline -> RenderNode:** The Pipeline component is removed. Use `gameObject.setLighting(true)` instead of `gameObject.setPipeline('Light2D')`.
  2. **FX/BitmapMask -> Filters:** Post FX pipeline replaced with a two-class Filters system.
  3. **DynamicTexture requires `render()` call:** Drawing commands are batched; you must call `DynamicTexture.render()` to flush the buffer.
  4. **GL coordinate orientation:** Phaser 4 uses GL orientation instead of top-left. Largely invisible but may affect custom shader code.

### What to Prepare Now

Since Kettenreaktion is pre-implementation, we have the advantage of building with migration in mind:

1. **Avoid custom pipelines/shaders** in MVP -- these are the biggest migration pain point.
2. **Do not use deprecated APIs** -- check Phaser 3.90 docs for deprecation warnings.
3. **Stick to standard GameObjects** (Sprite, Image, Text, Graphics) -- these transfer cleanly.
4. **Use Matter.js via Phaser's wrapper** (already in our coding rules) -- this is compatible across versions.

### Recommendation: Stay on Phaser 3.90 for MVP

- Phaser 3.90 is stable and well-documented.
- Phaser 4 is very new and may have edge cases.
- Migration later will be low-effort given the compatibility.
- No features in Phaser 4 are required for a 2D puzzle game MVP.

### Recommendations

| Action | Priority |
|--------|----------|
| Stay on Phaser 3.90 for MVP | **Must-do** |
| Avoid custom shaders/pipelines (migration pain point) | **Must-do** |
| Do not use deprecated Phaser 3 APIs | **Should-do** |
| Plan migration to Phaser 4 post-launch (late 2026) | **Nice-to-have** |
| Monitor Phaser 4 stability reports | **Should-do** |

### Sources

- [Phaser v4 Release Candidate 4](https://phaser.io/news/2025/05/phaser-v4-release-candidate-4)
- [Phaser v3.87 and v4.0.0 Released](https://phaser.io/news/2024/11/phaser-v387-and-v400-released)
- [Migrating Phaser 3 Shaders to Phaser 4](https://phaser.io/news/2025/11/migrating-phaser-3-shaders-to-phaser-4)
- [Phaser 4 Rendering Concepts](https://phaser.io/tutorials/phaser-4-rendering-concepts)
- [Phaser Mega Update](https://phaser.io/news/2025/05/phaser-mega-update)

---

## 11. Bundle Size Optimization

### The Problem

Phaser 3 adds approximately **980KB minified** (~300KB gzipped) to your bundle. For a daily puzzle game that should load in under 3 seconds, this matters.

### Strategies

**1. Custom Phaser Build (Should-do)**

Phaser's official [custom-build](https://github.com/phaserjs/custom-build) tool lets you exclude unused modules. For Kettenreaktion, we can exclude:

- `Sound` module if using Web Audio API directly (~140KB savings).
- `Arcade Physics` (we use Matter.js only).
- `Tilemap` (not needed for puzzle game).
- `Camera3D` (not needed).
- `Facebook Instant Games` plugin.

Caveat: Custom builds require webpack (not Vite). This means maintaining a separate webpack config just for building Phaser, then importing the custom build in the Vite project.

**2. Dynamic Imports / Code Splitting (Must-do)**

Split non-critical code into separate chunks loaded on demand:

```typescript
// Lazy-load the HowTo scene only when needed
const HowToScene = await import('./scenes/HowToScene');

// Lazy-load the share/replay system
const ShareManager = await import('./systems/ShareManager');
```

Vite handles code splitting automatically for dynamic `import()` calls.

**3. Asset Optimization (Must-do)**

- **Sprites:** Use WebP format (30-50% smaller than PNG). Phaser 3 supports WebP. Use PNG as fallback.
- **Audio:** OGG Vorbis (~60% smaller than MP3). Already planned.
- **Fonts:** Subset Google Fonts to only needed characters. A full font file is ~100KB+; subset can be <20KB.
- **Level JSON:** Minify and potentially gzip. Vite handles this in production.

**4. Tree Shaking (Automatic with Vite)**

Vite uses Rollup for production builds, which tree-shakes unused exports. However, Phaser 3's module structure limits tree-shaking effectiveness. The custom build approach (strategy 1) is more reliable for Phaser specifically.

**5. Compression (Must-do)**

Vercel automatically serves Brotli-compressed assets. Ensure your build output is optimized:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true }  // remove console.log in production
    },
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // separate Phaser into its own chunk (cacheable)
        }
      }
    }
  }
});
```

### Bundle Size Budget

| Chunk | Target | Notes |
|-------|--------|-------|
| Phaser (vendor) | <350KB gzipped | Cached separately, loaded once |
| Game code | <50KB gzipped | All TypeScript game logic |
| Assets (sprites) | <200KB | Texture atlas, compressed |
| Assets (audio) | <100KB | OGG, minimal sounds |
| **Total initial** | **<700KB** | 3G loads in ~2-3 seconds |

### Recommendations

| Action | Priority |
|--------|----------|
| Separate Phaser into its own cacheable chunk | **Must-do** |
| Dynamic imports for non-critical scenes/modules | **Must-do** |
| Asset compression (WebP sprites, OGG audio, font subsetting) | **Must-do** |
| Drop `console.log` in production via Terser | **Must-do** |
| Custom Phaser build to exclude unused modules | **Should-do** |
| Analyze bundle with `npx vite-bundle-visualizer` | **Should-do** |

### Sources

- [Phaser Custom Build GitHub](https://github.com/phaserjs/custom-build)
- [Reducing Phaser's Filesize: Custom Builds](https://medium.com/@louigi.verona/reducing-phasers-filesize-custom-phaser-builds-4a0314819a38)
- [Phaser Tree Shaking Issue #3351](https://github.com/photonstorm/phaser/issues/3351)

---

## 12. Testing Browser Games

### Testing Strategy for Kettenreaktion

**Unit Tests (Vitest) -- Must-do**

Test game logic in isolation, without Phaser:

- `ScoreCalculator`: given targets hit and time, returns correct score.
- `ChainDetector`: given collision events, detects chain reactions correctly.
- `DailySystem`: given a date, generates the correct seed and level ID.
- `LevelLoader`: validates level JSON against schema.

```typescript
// Example: ScoreCalculator.test.ts
describe('ScoreCalculator', () => {
  it('awards bonus for hitting all targets', () => {
    const result = calculateScore({ targetsHit: 5, totalTargets: 5, timeMs: 3000 });
    expect(result.bonus).toBeGreaterThan(0);
  });
});
```

**Visual Regression Tests (Playwright) -- Should-do**

Playwright supports canvas screenshot comparison. Key requirements for stability:

1. **Deterministic rendering:** Fixed seed, fixed timestep, no `Math.random()`.
2. **Clock control:** Use Playwright's Clock API to control time progression.
3. **Consistent environment:** Fixed viewport (800x600), locale, timezone.
4. **Threshold tolerance:** Allow small pixel differences (~0.1%) for anti-aliasing variations.

```typescript
// Example: game-visual.spec.ts
import { test, expect } from '@playwright/test';

test('game scene renders correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas');
  // Wait for specific game state
  await page.evaluate(() => window.__gameReady);
  await expect(page).toHaveScreenshot('game-initial.png', {
    maxDiffPixelRatio: 0.01
  });
});
```

**Integration Tests -- Should-do**

Test scene transitions and user flows without visual comparison:

- Boot -> Menu -> Game flow.
- Placing an object triggers physics simulation.
- Completing a puzzle shows results screen.
- Share button generates shareable text.

**Physics Simulation Tests -- Nice-to-have**

Test that specific level configurations produce expected outcomes:

- "Ball placed at (100, 200) should hit at least 3 targets."
- Run headless in Node.js with Matter.js directly (no Phaser needed).

### Recommended Test Matrix

| Test Type | Tool | What to Test | Priority |
|-----------|------|-------------|----------|
| Unit | Vitest | Score, chain detection, daily system, level loading | **Must-do** |
| Visual regression | Playwright | Canvas screenshots at key game states | **Should-do** |
| Integration | Playwright | User flows, scene transitions | **Should-do** |
| Physics simulation | Vitest + Matter.js | Level solvability, scoring bounds | **Nice-to-have** |
| Performance | Lighthouse CI | Load time, FCP, TTI | **Should-do** |

### Sources

- [Visual Comparisons - Playwright Docs](https://playwright.dev/docs/test-snapshots)
- [playwright-canvas: Canvas Testing Proof of Concept](https://github.com/satelllte/playwright-canvas)
- [Canvas Visual Bugs Testbed (PixiJS)](https://github.com/asgaardlab/canvas-visual-bugs-testbed)
- [Playwright Snapshot Testing in 2026](https://www.browserstack.com/guide/playwright-snapshot-testing)

---

## 13. Priority Summary

### Must-Do (Before/During MVP)

1. **Fixed timestep physics** -- `matter.world.setFPS(60)`, never variable delta.
2. **Seeded PRNG** -- `mulberry32` with date seed for puzzle generation.
3. **Tolerance-based scoring** -- no exact floating-point comparisons.
4. **Texture atlases** -- combine sprites, reduce draw calls.
5. **Object pooling** -- reuse GameObjects in chain reactions.
6. **localStorage with StorageManager wrapper** -- simple, sufficient, migratable.
7. **Separate Phaser chunk** -- cacheable vendor bundle.
8. **Dynamic imports** -- lazy-load non-critical scenes.
9. **Asset compression** -- WebP, OGG, font subsetting.
10. **Drop console.log in production** -- Terser config.
11. **Unit tests** -- Vitest for all game logic.
12. **Web app manifest** -- basic PWA installability.
13. **`Phaser.AUTO` renderer** -- WebGL with Canvas fallback.
14. **Stay on Phaser 3.90** -- stable, well-documented, migrate later.

### Should-Do (During MVP or Shortly After)

1. **`vite-plugin-pwa`** -- full service worker with caching strategies.
2. **GIF replay export** -- `canvas-record` library.
3. **Playwright visual regression tests** -- canvas screenshots.
4. **CSS nesting + container queries** -- modern, clean overlay UI.
5. **WAAPI for HUD animations** -- native, performant.
6. **Custom Phaser build** -- exclude unused modules.
7. **Monitor Phaser 4** -- track stability, plan migration.
8. **Bundle analysis** -- `vite-bundle-visualizer`.
9. **Lighthouse CI** -- automated performance checks.
10. **Cross-browser physics testing** -- verify acceptable similarity.

### Nice-to-Have (Post-Launch)

1. **View Transitions API** -- smooth HTML overlay transitions.
2. **WebM/MP4 replay via WebCodecs** -- higher quality than GIF.
3. **Vercel KV for rate limiting** -- if API abuse becomes an issue.
4. **IndexedDB migration** -- if data grows beyond localStorage limits.
5. **Phaser 4 migration** -- when stable and beneficial.
6. **Physics simulation tests** -- automated level solvability checks.
7. **`animation-timeline`** -- scroll-linked animations for leaderboards.
8. **Background Sync API** -- queue score submissions offline.

---

*This document should be revisited quarterly as browser APIs and library versions evolve.*
