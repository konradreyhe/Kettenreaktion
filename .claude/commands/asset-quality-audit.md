---
description: "When you need to evaluate the quality, consistency, and polish of game assets — especially AI-generated ones. Sprites, textures, UI elements, animations, backgrounds, icons, effects. Screenshot every asset IN-GAME via Playwright MCP, compare them side by side, and catch the problems that make a game look amateur: style drift, palette inconsistency, resolution mismatch, anatomical errors, animation jank. This template covers both STATIC asset quality AND assets in motion during gameplay."
---

# Asset Quality Audit

**When to use:** When you need to evaluate the quality, consistency, and polish of game assets — especially AI-generated ones. Sprites, textures, UI elements, animations, backgrounds, icons, effects. Screenshot every asset IN-GAME via Playwright MCP, compare them side by side, and catch the problems that make a game look amateur: style drift, palette inconsistency, resolution mismatch, anatomical errors, animation jank. This template covers both STATIC asset quality AND assets in motion during gameplay.

**Role:** You are an art director with a pixel-perfect eye and zero tolerance for inconsistency. You've seen thousands of game assets — you know instantly when something is off. You evaluate every asset against the game's visual identity and against every OTHER asset. Your job is to find the cracks: the sprite that doesn't match the rest, the texture that's a different resolution, the animation frame that flickers, the color that's slightly wrong. You use Playwright MCP to view every asset in-game context and take screenshots for evidence. You don't just check if assets look good in isolation — you verify they serve GAMEPLAY. AI-generated art has specific failure modes you know by heart.

---

**Audit:** $ARGUMENTS

Open the game with Playwright MCP, systematically capture and evaluate EVERY visual asset. This is art quality control — you're looking at pixels, consistency, and whether the art actually serves the game. You MUST use Playwright MCP to see assets in their real context.

## MANDATORY: You MUST Use Playwright MCP

Do NOT evaluate assets from source files, asset folders, or code inspection alone. You MUST:
- `browser_navigate` to the game URL
- `browser_take_screenshot` of every asset IN-GAME at actual render size
- Play the game enough to trigger every visual state (idle, action, hit, death, transition)
- Screenshot assets in context — surrounded by other assets, backgrounds, UI
- Screenshot assets in motion — during actual gameplay, not just static poses

**SCREENSHOT RULE:** Screenshot every asset, every asset comparison, every issue. Take close-ups (use `element` parameter when possible). Take wide shots showing assets in context. Take side-by-side comparisons of similar assets. Each screenshot gets a detailed visual analysis — NEVER "looks fine." Describe: exact colors, line quality, shading direction, detail level, edge treatment, proportions, and how it fits with surrounding assets.

**CONTEXT LIMIT RULE (CRITICAL):** ALWAYS use `type: "jpeg"` for screenshots — JPEG is ~80% smaller than PNG. After 12 screenshots, use `/low-context-handover` to continue in a new session. The API has a 20MB request limit — PNG screenshots WILL crash the session. For audits needing 40+ screenshots, split across multiple sessions.

**MULTI-SESSION STRATEGY:**
- **Session 1:** Asset inventory + style consistency + color/palette (Phases 1-3)
- **Session 2:** Resolution/technical + animation + UI assets (Phases 4-6)
- **Session 3:** Assets in motion + art serves gameplay + final context evaluation (Phases 7-9)
- End each session with `/low-context-handover`

## Don't

- Don't evaluate assets from source files alone — see them IN-GAME where lighting, scaling, and context matter
- Don't say "looks fine" — describe SPECIFICALLY what you see: colors, proportions, shading, edges, resolution
- Don't ignore subtle inconsistencies — if two sprites have slightly different art styles, that's a real problem
- Don't skip animations — step through frame by frame when possible
- Don't forget context — an asset that looks great alone might clash with everything around it
- Don't be gentle — a game with inconsistent art looks amateur, period
- Don't evaluate only static art — assets in motion during gameplay are what players actually see
- Don't separate art quality from gameplay quality — art that doesn't serve gameplay is bad art

## Phase 1: Asset Inventory

Before evaluating anything, catalog what exists. Use Playwright MCP to navigate through the entire game and identify every visual element.

**Identify ALL visual assets in the game:**
- Characters/sprites (player, NPCs, enemies, items)
- UI elements (buttons, panels, icons, HUD, menus, dialogs)
- Backgrounds/environments (scenes, parallax layers, tilesets)
- Effects (particles, explosions, transitions, highlights)
- Animations (character animations, UI transitions, environmental)
- Typography (fonts, text styles, sizes used)
- Icons and symbols (status icons, inventory, achievements)

**Create a checklist. Every asset gets evaluated. No exceptions.**

## Phase 2: Style Consistency Audit

The #1 killer of AI-generated game art. Different prompts produce different styles. Catch it ALL:

**Global style check (screenshot comparisons):**
- [ ] Do ALL assets look like they belong in the same game?
- [ ] Is the art direction consistent? (Realistic vs stylized vs pixel art vs painterly)
- [ ] Line weight — is it consistent across all sprites/elements?
- [ ] Shading direction — does light come from the same direction everywhere?
- [ ] Detail density — are some assets hyper-detailed while others are simple?
- [ ] Perspective — are all assets drawn from consistent viewpoints?
- [ ] Edge treatment — hard edges vs soft edges consistent across assets?

**AI art telltales to catch:**
- [ ] Style drift between assets generated in different sessions
- [ ] "AI look" — that generic, over-smoothed, derivative quality
- [ ] Inconsistent proportions between characters (head-to-body ratios)
- [ ] Different art "temperatures" — some assets warm, some cool, for no reason
- [ ] Assets that look like they came from different games entirely
- [ ] Over-detailed vs under-detailed elements sitting next to each other

**For each inconsistency found:**
Screenshot both assets side by side. Describe exactly what's different (line weight, color temperature, detail level, style). Rate severity: Critical / Major / Minor / Cosmetic.

## Phase 3: Color & Palette Analysis

**Palette coherence (screenshot each issue):**
- [ ] Does the game have a clear color palette? What is it?
- [ ] Do ALL assets use this palette consistently?
- [ ] Any assets with colors that feel "off" compared to the rest?
- [ ] Color temperature consistency — no random warm asset in a cool scene
- [ ] Saturation levels consistent across all assets?
- [ ] Do contrast levels work? Can the player distinguish foreground from background?
- [ ] Are interactive elements visually distinct from decorative ones?
- [ ] Dark areas — can the player see what they need to see?

**AI-specific color issues:**
- [ ] Palette drift — assets generated with different prompts have subtly different palettes
- [ ] Over-saturation or under-saturation on individual assets
- [ ] Clashing color temperatures between adjacent assets
- [ ] Background colors bleeding into foreground element perception

## Phase 4: Resolution & Technical Quality

**Resolution consistency (screenshot + zoom in):**
- [ ] Do all assets have appropriate resolution for their display size?
- [ ] Any blurry assets next to sharp ones? (Resolution mismatch)
- [ ] Pixel density consistent? No mixed pixel-art-size assets
- [ ] Are assets crisp at the game's native resolution?
- [ ] Any visible compression artifacts (JPEG smear, PNG banding)?
- [ ] Do assets scale properly when the window is resized?

**Technical quality per asset:**
- [ ] Clean edges — no jagged outlines, no white/dark halos from bad transparency
- [ ] Alpha channel correct — transparent areas actually transparent, no boxes around sprites
- [ ] No visible seams in tiled textures or backgrounds
- [ ] No clipping — assets don't cut into each other unnaturally
- [ ] Z-ordering correct — foreground in front of background, always

**AI generation artifacts:**
- [ ] Extra/missing fingers, limbs, or features on characters
- [ ] Asymmetry that should be symmetric (faces, UI elements, vehicles)
- [ ] Warped or melted details (common in AI art)
- [ ] Text in assets — AI-generated text is almost always gibberish. Flag ALL of it
- [ ] Uncanny valley — faces/characters that feel "off" even if technically correct
- [ ] Clothing that looks painted on instead of having folds/physics
- [ ] Repeated patterns that are too uniform (AI tiling artifacts)

**Asset performance impact:**
- [ ] Any assets that seem oversized for their display size? (4096px texture displayed at 64px)
- [ ] Sprite sheet efficiency — reasonable frame count per animation?
- [ ] Particle effect density — do effects tank performance?
- [ ] Background complexity appropriate for what's rendered in front of it?

## Phase 5: Animation Quality

**Frame-by-frame analysis (screenshot key frames):**
- [ ] Are animations smooth or jerky? Count the frames — enough for smooth motion?
- [ ] Frame-to-frame consistency — does the character's appearance stay stable?
- [ ] AI animation drift — do features change between frames? (Hair moves, accessories appear/disappear, proportions shift)
- [ ] Timing — does the animation feel natural? Too fast? Too slow?
- [ ] Loops — do looping animations loop seamlessly? Any visible pop/jump?
- [ ] Easing — do movements have natural acceleration/deceleration or robotic linear motion?

**Animation types to check:**
- Idle animations — smooth, subtle, natural
- Walk/run cycles — consistent speed, no sliding feet
- Attack/action animations — impactful, well-timed
- Hit/damage feedback — visible, clear, satisfying
- UI transitions — smooth, purposeful, not distracting
- Environmental animations — wind, water, particles — natural-looking

**For each animation issue:**
Screenshot the bad frame(s). Describe what changes between frames that shouldn't. Rate: Critical / Major / Minor / Cosmetic.

## Phase 6: UI Asset Quality

**UI element audit (screenshot each):**
- [ ] Button states: normal, hover, pressed, disabled — all exist? All consistent?
- [ ] Panel/container styles consistent across all menus?
- [ ] Icons clear and readable at their display size?
- [ ] Icon style consistent? (Outline vs filled, flat vs skeuomorphic, etc.)
- [ ] Text readable against all backgrounds it appears on?
- [ ] HUD elements clear and non-intrusive during gameplay?
- [ ] Progress bars, health bars, score displays — polished or placeholder-looking?

**UI polish checks:**
- [ ] Padding and margins consistent across all UI elements?
- [ ] Border styles consistent (rounded vs sharp, thickness, color)?
- [ ] Drop shadows, glows, effects — consistent style or mixed?
- [ ] Responsive — UI assets scale properly at different resolutions?

## Phase 7: Assets in Motion — The Critical Gap

**This is what separates good art from good GAME art.** Static assets can look perfect and still fail during gameplay. You MUST play the game and evaluate assets while the game is running.

**For non-action games** (puzzle, card, strategy, narrative): adapt this phase — evaluate visual feedback on player decisions, clarity of state changes, and readability of game-critical information instead of combat-specific checks.

**Readability at gameplay speed (screenshot during active gameplay):**
- [ ] Can you distinguish the player character from the background at all times?
- [ ] Can you distinguish different enemy types from each other during combat/action?
- [ ] Can you read UI text while gameplay is happening around it?
- [ ] At maximum visual complexity (many entities on screen), can you still parse what's happening?
- [ ] Do fast-moving sprites become unreadable blurs? Or do they maintain silhouette clarity?

**Animation serving mechanics (screenshot the moment of action):**
- [ ] Attack animations — does the wind-up clearly telegraph what's coming? How many frames of "tell"?
- [ ] Hit animations — does the hit frame have visible impact? (Flash, shake, particles)
- [ ] Does animation timing match hitbox timing? (Visual truth — can you trust what you see?)
- [ ] State transitions — idle→walk→run→attack→recovery: smooth or jarring between states?
- [ ] Enemy attack tells — can the player read enemy intentions from the animation?
- [ ] Recovery frames — do they communicate "you can act again now" clearly?

**Visual feedback during mechanics (screenshot each feedback moment):**
- [ ] When the player hits something: count visible feedback layers
  - [ ] Sprite flash/color change
  - [ ] Particles on impact
  - [ ] Screen shake
  - [ ] Knockback/stagger animation on target
  - [ ] Damage numbers or visual indicators
  - Total: __/5. Less than 2 = the hit feels dead.
- [ ] When the player gets hit: is the damage feedback distinct from dealing damage?
- [ ] When collecting items: is there visual celebration? Or does the item just vanish?
- [ ] Death/failure: does the death animation have weight and drama? Or does the sprite just disappear?

**Visual hierarchy under gameplay stress (screenshot the most chaotic moment):**
- [ ] With maximum entities on screen, what does the player's eye go to first?
- [ ] Can you always find the player character?
- [ ] Can you always see incoming threats?
- [ ] Are particle effects obscuring gameplay-critical information?
- [ ] Does the background compete with the foreground for attention?

**Asset state transitions (screenshot before/during/after):**
- [ ] Idle → moving: is the transition instant (snappy feel) or blended (heavy feel)? Is this intentional?
- [ ] Alive → dead: how many frames? Does it feel dramatic enough for the moment?
- [ ] Normal → powered-up: is the power-up visually clear and exciting?
- [ ] Full health → low health: does the player character visually communicate danger?

## Phase 8: Art Serves Gameplay

**Art is not decoration — it's communication.** Every asset should help the player play better.

**Interactive vs decorative distinction (screenshot and analyze):**
- [ ] Can the player instantly tell what's interactive and what's background?
- [ ] Are collectible items visually distinct from decorative elements?
- [ ] Are platforms/surfaces the player can stand on clearly different from background geometry?
- [ ] Are destructible objects visually different from indestructible ones?
- If any of these are unclear, it's not a cosmetic issue — it's a GAMEPLAY issue.

**Enemy readability (screenshot each enemy type):**
- [ ] Can you tell enemy types apart at a glance?
- [ ] Do enemy designs communicate their behavior? (Ranged enemy looks different from melee)
- [ ] Can you tell an enemy's health state visually?
- [ ] Do stronger enemies look more threatening?
- [ ] Can you distinguish enemy projectiles from friendly ones?

**Environmental communication (screenshot each environment):**
- [ ] Do environments guide the player toward objectives? (Lighting, color, composition)
- [ ] Are hazards visually obvious? (Spikes look like spikes, pits look like pits)
- [ ] Are safe areas visually calming? Combat areas visually tense?
- [ ] Does the environment tell a story? Or is it just random tiles?

**Hitbox visual honesty:**
- [ ] If you could see hitboxes, would they match the sprites?
- [ ] Are character hitboxes smaller than sprites? (Forgiving = good feel)
- [ ] Are projectile hitboxes visually honest? Or do "near misses" still hit?
- [ ] Does the visual "gap" between objects match the actual collision gap?

## Phase 9: Assets in Context — Final Evaluation

**In-game context evaluation (screenshot each scene):**
- [ ] Do characters fit their environments? Scale, style, color harmony
- [ ] Do UI elements complement or clash with the game's visual style?
- [ ] Visual hierarchy — can the player instantly tell what's important?
- [ ] Readability under all conditions — different backgrounds, different game states
- [ ] Do effects (particles, explosions) match the game's art style?
- [ ] Scene composition — does each screen look intentionally designed or randomly assembled?

**The "squint test":**
Squint at each screenshot. What stands out? What disappears? The things that stand out should be the important gameplay elements. If decorative elements dominate, the visual hierarchy is wrong.

**The "silhouette test":**
Imagine each character/sprite as a solid black shape. Can you still tell what it is? Can you tell different characters apart? If silhouettes are too similar, the designs lack distinctiveness.

## Per-Screenshot Analysis Template

For EVERY screenshot, write at minimum:
"I see [list every asset visible in this frame]. Style consistency: [do all assets match? specific mismatches]. Color: [palette adherence, temperature, saturation for each asset]. Technical: [resolution, edges, transparency, artifacts for each asset]. In context: [does each asset serve its gameplay purpose? what helps the player? what confuses?]. The weakest asset in this frame is [X] because [specific reason]. The strongest is [Y] because [specific reason]."

## Output Format

```
## Asset Quality Audit Report

### Game: [Name/URL]
### Audit Date: [Date]
### Session: [1/2/3] of [estimated total]
### Screenshots Taken: [Count — minimum 12 per session, 40-60+ total]
### Total Assets Evaluated: [Count]
### Overall Art Quality: [1-10] — [one sentence verdict]
### Consistency Score: [1-10] — [one sentence verdict]
### Art-Serves-Gameplay Score: [1-10] — [one sentence verdict]

---

### Asset Inventory
[Complete list of all assets by category with count]

### Style Consistency
- **Overall consistency:** [1-10] — [specific assessment]
- **Worst offenders:** [assets that break style consistency most]
- [Screenshots: side-by-side comparisons of inconsistent assets]

### Color & Palette
- **Palette coherence:** [1-10] — [specific assessment]
- **Palette definition:** [describe the apparent palette]
- **Drift issues:** [specific assets with color problems]

### Resolution & Technical
- **Resolution consistency:** [1-10]
- **Technical quality:** [1-10]
- **AI artifacts found:** [count and list]
- **Performance concerns:** [oversized assets, expensive effects]

### Animation Quality
- **Smoothness:** [1-10]
- **Frame consistency:** [1-10]
- **Animation drift issues:** [list with frame references]

### UI Assets
- **Completeness:** [all states exist? 1-10]
- **Consistency:** [1-10]
- **Polish:** [1-10]

### Assets in Motion (NEW)
- **Readability at speed:** [1-10] — [can you parse gameplay during action?]
- **Animation serving mechanics:** [1-10] — [do animations communicate game state?]
- **Feedback layer count per core action:** [__/5]
- **Visual hierarchy under stress:** [1-10] — [most chaotic moment still readable?]
- **State transition quality:** [1-10] — [smooth, intentional, communicative?]

### Art Serves Gameplay (NEW)
- **Interactive vs decorative clarity:** [1-10]
- **Enemy readability:** [1-10]
- **Environmental communication:** [1-10]
- **Hitbox visual honesty:** [1-10]
- **Worst gameplay-art disconnect:** [specific asset/situation that hurts gameplay]

### Issues Found
| # | Category | Asset | Issue | Severity | Fix Suggestion | Screenshot |
|---|----------|-------|-------|----------|----------------|------------|
| 1 | Style/Color/Resolution/Animation/UI/Motion/Gameplay | [which asset] | [specific problem] | Blocker/Critical/Major/Minor/Cosmetic | [how to fix] | [ref] |

### AI-Generated Art Specific Issues
| # | Issue Type | Asset | Description | Screenshot |
|---|-----------|-------|-------------|------------|
| 1 | Style drift/Anatomical/Uncanny/Artifact/Text/Consistency | [asset] | [detail] | [ref] |

### The Verdict
[2-3 paragraphs: Does this game's art hold together as a cohesive whole?
Does the art SERVE the gameplay or just decorate it?
What's the weakest link? What would a player notice first?
What needs to be regenerated/reworked vs what's shippable?]

### Priority Fixes
1. [Most impactful art fix] — WHY: [reasoning] — EFFORT: [low/medium/high]
2. ...
...
10. ...

### Handover Notes (for next session)
- **Phases completed:** [list]
- **Phases remaining:** [list]
- **Critical issues so far:** [count + worst]
- **Focus for next session:** [what to evaluate next]
```

## Success Criteria

- EVERY visual asset in the game was identified and evaluated via Playwright MCP screenshots
- The game was actually OPENED and PLAYED — not just source files inspected
- Screenshots captured every asset in its in-game context at actual render size
- Style consistency was evaluated with side-by-side screenshot comparisons
- Color palette was analyzed for coherence and drift
- Resolution and technical quality checked for every asset
- Animations were evaluated frame-by-frame for consistency
- AI-generated art specific defects were actively hunted
- UI elements checked for completeness and polish
- Assets were evaluated IN MOTION during actual gameplay — not just static
- Visual feedback during mechanics was counted and assessed (feedback layers per action)
- Visual hierarchy was tested under maximum gameplay stress (most chaotic moment)
- Art was evaluated as gameplay communication — not just decoration
- Interactive vs decorative distinction was tested
- Enemy readability, environmental communication, and hitbox honesty were checked
- Every issue has a severity rating, specific description, and fix suggestion
- Every screenshot has exhaustive analysis — never "looks fine"
- The report gives a clear picture of whether the game's art is shippable and whether it serves gameplay
