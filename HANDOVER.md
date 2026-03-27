# Handover

## Summary
Session 3 was a massive feature + polish pass. 15 commits pushed (total 45 in repo). Key highlights: professional visual overhaul with Orbitron font + Style system, colorblind mode, challenge URLs, chain reaction juice (hit stop, atmosphere shift, placement pop), legal compliance (Impressum + Datenschutz), og:image, score counter animation, streak grace period, ghost placement, and level repeat prevention. All 27 tests pass, typecheck clean.

## Completed
- [x] Visual playtest of all screens: Menu, Game, Result, HowTo, Practice, Stats (desktop + mobile)
- [x] Fix "1 Tage" → "1 Tag" German singular in 3 scenes + ShareManager
- [x] Fix negative puzzle number display (Math.abs for pre-launch)
- [x] Fix HowTo layout overlap (step spacing + repositioned scoring/shortcuts/button)
- [x] Practice mode HUD shows "Uebung: [Level Name]" instead of puzzle number
- [x] Add favicon + apple-touch-icon links (icon-192.png already existed)
- [x] Fix ResultScene efficiency display (show saved attempts, not total)
- [x] Add Impressum overlay to menu (German legal requirement § 5 TMG)
- [x] Enhanced chain escalation: scaling counter text + boosted screen shake
- [x] Colorblind mode: AccessibilityManager with eye toggle, blue/orange palette
- [x] Colorblind-aware colors in placement zone, result status, near-miss, HowTo, intro overlay
- [x] Ghost placement marker shows previous attempt position (fades after 5s)
- [x] Challenge-a-friend URL: ?challenge=N starts level directly, "Freund herausfordern" button
- [x] Hit stop on chain milestones (physics pause at chains 6, 9, 12...)
- [x] Reduced motion support: OS prefers-reduced-motion disables shake + hit stop
- [x] Research docs committed (6 files in docs/research/)
- [x] og:image for social sharing (1200x630 menu screenshot + meta tags)
- [x] Placement pop animation (0→1 scale with Back.easeOut)
- [x] Background atmosphere shift during chain reactions (warmer colors)
- [x] Score counter animation (ticks up from 0, Cubic.easeOut)
- [x] "Neuer Rekord!" badge when beating personal best score
- [x] Datenschutzerklaerung (privacy policy) overlay
- [x] Level repeat prevention (no same level two days in a row)
- [x] Keyboard 1/2 keys to switch object type
- [x] Streak 1-day grace period (missing one day doesn't break streak)
- [x] HUD shows total target count (Sterne: 0/3)
- [x] Professional visual overhaul: Orbitron Google Font across all scenes
- [x] Centralized Style.ts with brand colors, font constants, text effects
- [x] Text stroke + shadow on all important text (titles, scores, chain counter)
- [x] Updated og-image.jpg with new font/style

## In Progress
- [ ] GIF/MP4 replay export — research says #1 viral feature, not started
- [ ] Kenney CC0 asset integration — not started, procedural textures work fine
- [ ] og:image for social sharing — needs a game screenshot

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| Math.abs() for puzzle number | Simple fix, works pre/post launch, no storage conflicts | Change LAUNCH_DATE to past date | Would break level selection for dev |
| In-game Impressum overlay | No separate page needed, accessible in 1 click from menu | Separate HTML page | Requires routing, more complexity |
| AccessibilityManager as separate module | Clean SRP, manages both colorblind + reduced motion | Flags in StorageManager | Different concerns, different storage |
| Hit stop only at chain 6, 9, 12... | Dramatic but not annoying, every 3rd milestone | Every chain increase | Too frequent, disrupts flow |
| Challenge URL uses level index | Simple, doesn't expose internal IDs | Level ID in URL | Longer URLs, leaks naming |

## Known Issues
- **Impressum placeholder**: Uses "Konrad Reyhe" name/email — verify this is correct or update
- **No og:image**: Social sharing previews still have no image
- **Phaser chunk 1.5MB**: Expected (339KB gzipped), no action needed
- **Stats shows old puzzle #-126**: Stale localStorage from before Math.abs fix, will clear naturally
- **Boot screen slow on mobile viewport resize**: Phaser reinitializes on viewport change in dev, fine in production

## Next Steps (Priority Order)
1. **GIF/MP4 replay export** — use `canvas-record` (npm) for WebCodecs MP4. Biggest viral lever.
2. **Beta testing** — post on r/webgames, Discord game-dev servers
3. **Custom domain** — buy domain, set VITE_BASE_PATH=/, configure DNS
4. **og:image** — generate a gameplay screenshot for social media
5. **Cloudflare Pages migration** — needed before any monetization (Vercel Hobby restricts commercial use)
6. **Supabase leaderboard** — Phase 3 feature
7. **More levels** — generate templates 091+ for additional months

## Rollback Info
- Last known good state: commit `810883b` (HEAD) — everything works, 27 tests pass
- Session 2 last good state: `f4e1b91` (handover commit)
- Session 1 last good state: `01eeee4`
- All 6 session commits are incremental — can safely `git revert` any single commit

## Files Modified This Session
### New Files
- `src/systems/AccessibilityManager.ts` — colorblind mode + reduced motion detection
- `docs/research/*.md` — 7 research documents (competitor analysis, game juice, virality, tech, creative, monetization, summary)

### Modified Files
- `index.html` — favicon + apple-touch-icon links
- `src/scenes/GameScene.ts` — practice HUD label, colorblind zone, ghost placement, hit stop, chain escalation, near-miss colors, reduced motion, placement pop, background atmosphere
- `src/scenes/MenuScene.ts` — Impressum overlay, colorblind toggle, challenge URL handler, singular fix
- `src/scenes/ResultScene.ts` — efficiency display fix, colorblind status colors, challenge button, singular fix, score counter animation, new best indicator
- `src/scenes/HowToScene.ts` — layout fix, colorblind zone text/icon
- `src/scenes/StatsScene.ts` — singular fix
- `src/scenes/BootScene.ts` — AccessibilityManager init
- `src/scenes/ReplayScene.ts` — colorblind status colors
- `src/systems/DailySystem.ts` — Math.abs for puzzle number
- `src/systems/ShareManager.ts` — streak singular fix
- `src/ui/HUD.ts` — updateLabel() method

---
**Last Updated:** 2026-03-27
