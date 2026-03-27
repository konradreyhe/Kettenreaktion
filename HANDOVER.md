# Handover

## Summary
Session 3 was the biggest session yet — 37 commits, transforming the game from a functional prototype to a polished, professional, feature-rich daily physics puzzle. Started with visual playtesting via Playwright MCP, fixed 8 bugs, then did a complete visual overhaul (Orbitron font, Style system, upgraded textures), implemented 12 creative brainstorm features (Sonic Chain audio, Gravity Flip Friday, Photon Trail Art, Progressive Zoom Camera, Phantom Replay, Energy Seismograph, etc.), added accessibility (colorblind mode, reduced motion), legal compliance (Impressum, Datenschutz), and retention mechanics (Joker streak insurance, Kettenmeister titles). All 27 tests pass, typecheck clean, build clean, git clean. **The game is ready for beta testing.** Next session should focus on GIF/MP4 replay export (the #1 viral feature still missing) or begin beta testing.

## Completed
- [x] Visual playtest of all screens (desktop 1366x768 + mobile 375x667)
- [x] Fix German grammar "1 Tage" -> "1 Tag" in MenuScene, ResultScene, StatsScene, ShareManager
- [x] Fix negative puzzle number (Math.abs in DailySystem)
- [x] Fix HowTo layout overlap (compressed spacing)
- [x] Fix ResultScene efficiency display (show saved attempts)
- [x] Fix favicon + apple-touch-icon links
- [x] Practice mode HUD shows level name ("Uebung: ...")
- [x] Level repeat prevention (no same level two consecutive days)
- [x] Orbitron Google Font across ALL scenes + Button + HUD (12 files)
- [x] Centralized Style.ts (FONT_TITLE, FONT_UI, COLOR, TEXT_SHADOW, TEXT_STROKE)
- [x] Text stroke + shadow on all important text elements
- [x] Upgraded ball texture (gradient sphere, specular, rim light)
- [x] Upgraded star texture (brighter gold, inner core, white hotspot)
- [x] Upgraded weight texture (multi-layer iron, dual rings)
- [x] New floor_tile texture (warm grey-green stripes)
- [x] Upgraded platform_tile texture (steel-grey with bevel)
- [x] Modern dot grid background (radial fade from center)
- [x] Ghost preview with stroke outline + pulsing glow ring
- [x] Star sparkle shimmer (orbiting white dot, 2s cycle)
- [x] Enhanced confetti (dual shapes, 6 colors, sparkle dots)
- [x] Sprite-based replays with rotation (ReplayScene)
- [x] Colorblind mode (AccessibilityManager, blue/orange palette, eye toggle)
- [x] Colorblind-aware colors in ALL scenes (zone, status, near-miss, HowTo text)
- [x] Reduced motion support (OS prefers-reduced-motion)
- [x] Ghost placement marker (previous attempt position)
- [x] Challenge-a-friend URL (?challenge=N, copy button)
- [x] Hit stop on chain milestones (80ms physics pause at chains 6,9,12...)
- [x] Background atmosphere shift (warmer colors with chain length)
- [x] Placement pop animation (Back.easeOut 0->1 scale)
- [x] Score counter tick-up animation (Cubic.easeOut)
- [x] "Neuer Rekord!" badge on new best score
- [x] og:image (1200x630) + meta tags
- [x] Impressum overlay (German legal § 5 TMG)
- [x] Datenschutzerklaerung overlay (privacy policy)
- [x] Streak 1-day grace period
- [x] HUD shows target count (Sterne: 0/3)
- [x] Keyboard 1/2 to switch object type
- [x] Sonic Chain audio (collision crunch + pentatonic melody with harmonics)
- [x] Gravity Flip Friday (inverted gravity on Fridays UTC)
- [x] Kettenmeister title system (6 German ranks: Neuling->Kettenlegende)
- [x] Photon Trail Art (velocity-colored trajectories as generative art)
- [x] Progressive Zoom Camera (action-following with velocity-weighted centroid)
- [x] Phantom Replay Overlay (ghost dots of previous attempt during simulation)
- [x] Energy Seismograph (real-time kinetic energy line graph)
- [x] Daily Hint (H key, directional arrow toward target)
- [x] Joker streak insurance (earn 1 per 7-day streak, max 3, auto-saves streaks)
- [x] Player title display on menu (trophy + rank)
- [x] WhatsApp share deep-link button (DACH market)
- [x] Score flash preview before result transition
- [x] Difficulty stars on menu
- [x] Day-of-week mode labels (Montag: Leicht, Flip Friday!, Sonntagschallenge)
- [x] Research docs committed (6 files in docs/research/)

## In Progress
- [ ] GIF/MP4 replay export — research says #1 viral feature. ReplayFrame data exists. Consider `canvas-record` npm package or the simpler Photon Trail Art static image export as alternative.
- [ ] Kenney CC0 asset integration — not started, procedural textures work well now
- [ ] Supabase leaderboard — Phase 3 feature, not MVP

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Orbitron font (Google Fonts CDN) | Professional game look, free, fast CDN | Press Start 2P | Too retro/pixel for this game's aesthetic |
| Centralized Style.ts | Single source for colors/fonts, prevents drift | Inline styles per scene | Inconsistent, hard to maintain |
| Math.abs() for puzzle number | Works pre-launch and post-launch | Change LAUNCH_DATE to past | Would break level selection |
| Photon Trail Art instead of GIF export | Zero dependencies, unique visual, trivial to implement | canvas-record MP4 | Complex dependency, encoding issues, mobile compat |
| Pentatonic scale for chain audio | Musical, always sounds pleasant | Chromatic scale | Can sound dissonant |
| Hit stop at chain 6,9,12... | Dramatic but not annoying | Every chain link | Too frequent |
| Joker auto-use on >2 day gap | Seamless UX, no UI needed | Manual "use Joker" button | Extra UI complexity, confusing |
| WhatsApp button only when no Web Share API | Avoids redundancy on mobile | Always show both | Cluttered UI |
| Progressive zoom lerp 0.04 | Smooth enough to not cause nausea | Higher lerp (0.1+) | Too jerky, motion sickness risk |
| Procedural textures (no Kenney assets) | Zero dependencies, instant load, consistent style | Download Kenney pack | Build complexity, potential style mismatch |

## Known Issues
- **Playwright clicks unreliable**: Canvas-based Phaser games are hard to automate via Playwright. Menu button clicks often miss. Not a user-facing issue.
- **Boot screen slow with Google Font**: First load downloads Orbitron font (~20KB). Subsequent loads are cached. Could inline the font for faster boot.
- **No og:image update flow**: og-image.jpg is a static screenshot. Should be regenerated when visual changes are made.
- **Stats shows old puzzle #-126**: Stale localStorage from before Math.abs fix. Clears naturally over time.
- **Gravity Flip levels not validated**: Not all 90 levels may work well with inverted gravity. Should flag compatible levels.
- **Energy seismograph + camera zoom run simultaneously**: Could be visually busy on small screens. Consider disabling one on mobile.
- **Impressum placeholder name**: Uses "Konrad Reyhe" — verify this is correct.

## Next Steps (Priority Order)
1. **Beta testing** — both GitHub Pages and Vercel deployments are live and ready. Post on r/webgames, Discord game-dev servers. The game has enough features and polish for public feedback.
2. **GIF/MP4 replay export** — use `canvas-record` or consider the Photon Trail Art image as the shareable artifact instead. Research doc has details.
3. **Custom domain** — buy domain, configure DNS, set VITE_BASE_PATH=/
4. **Cloudflare Pages migration** — needed before monetization (Vercel Hobby restricts commercial use)
5. **Performance audit on mobile** — many simultaneous effects now (zoom camera, trails, seismograph, atmosphere). Need FPS testing on real mobile devices.
6. **Level validation** — visual playtest more levels via Playwright or manual testing. Especially validate Gravity Flip Friday compatibility.
7. **More levels** — generate templates 091+ for additional months
8. **Advent Calendar** — December special event (25 themed puzzles). Plan months ahead.

## Rollback Info
- Last known good state: commit `0400d55` (HEAD) — everything works, 27 tests pass, build clean
- Session 2 last good state: `f4e1b91`
- Session 1 last good state: `01eeee4`
- All 37 session commits are incremental — can safely `git revert` any single commit
- If Orbitron font causes issues: remove Google Fonts link from index.html, change FONT_TITLE/FONT_UI to 'monospace' in Style.ts
- If camera zoom causes nausea: remove `followAction()` call in GameScene.ts update()
- If audio is annoying: AudioManager.setEnabled(false) toggle already exists on menu

## Files Modified This Session
### New Files
- `src/constants/Style.ts` — brand colors, font constants, text effect configs
- `src/systems/AccessibilityManager.ts` — colorblind mode + reduced motion detection
- `docs/research/*.md` — 7 research documents (competitor analysis, game juice, virality, tech, creative, monetization, summary)
- `public/og-image.jpg` — social media preview image (1200x630)

### Modified Files (26 files)
- `index.html` — Orbitron font link, favicon, apple-touch-icon, og:image meta tags
- `src/main.ts` — no changes (entry point stable)
- `src/constants/Game.ts` — no changes (constants stable)
- `src/types/GameState.ts` — added `jokers?` field to GameStorage
- `src/scenes/BootScene.ts` — Orbitron font, improved ball/star/weight/platform/floor textures, new floor_tile texture
- `src/scenes/MenuScene.ts` — Orbitron font, Impressum, Datenschutz, colorblind toggle, challenge URL handler, day-of-week labels, difficulty stars, player title, Joker display
- `src/scenes/GameScene.ts` — Orbitron font, colorblind zone, ghost glow, hit stop, atmosphere shift, placement pop, progressive zoom camera, phantom replay, energy seismograph, daily hint, score flash, Gravity Flip Friday, star sparkle
- `src/scenes/ResultScene.ts` — Orbitron font, colorblind status, efficiency display, challenge button, WhatsApp share, score counter animation, new best indicator, enhanced confetti
- `src/scenes/HowToScene.ts` — Orbitron font, layout fix, colorblind text
- `src/scenes/StatsScene.ts` — Orbitron font, Joker display
- `src/scenes/PracticeScene.ts` — Orbitron font
- `src/scenes/ReplayScene.ts` — Orbitron font, sprite-based replay, rotation
- `src/ui/Button.ts` — Orbitron font, text stroke
- `src/ui/HUD.ts` — Orbitron font, blue glow edge, target count
- `src/game/CameraFX.ts` — followAction() progressive zoom, resetCamera()
- `src/game/TrailRenderer.ts` — Photon Trail Art (artSegments, renderArt(), velocity-color)
- `src/game/LevelLoader.ts` — level repeat prevention
- `src/game/ChainDetector.ts` — no changes
- `src/systems/DailySystem.ts` — Math.abs puzzle number
- `src/systems/StorageManager.ts` — streak grace, Joker system, getTitle(), getJokers()
- `src/systems/ShareManager.ts` — title in share text, WhatsApp deep-link, streak grammar
- `src/systems/AudioManager.ts` — collision crunch with noise, pentatonic chain-up
- `src/systems/AccessibilityManager.ts` — new file (see above)

---
**Last Updated:** 2026-03-27 (Session 3 end)
