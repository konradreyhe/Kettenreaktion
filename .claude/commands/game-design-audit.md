---
description: "When you want to evaluate the DESIGN quality of a game — not just bugs, not just art, but whether the game is actually GOOD. Core mechanics feel, visual design serving gameplay, engagement loops, difficulty curves, juice/polish, and what separates a forgettable prototype from a game people want to play. Use this after `/game-tester` finds the bugs and `/asset-quality-audit` checks the art. This template answers: \"Is this actually a good game? What makes it stand or fall?\""
---

# Game Design Audit

**When to use:** When you want to evaluate the DESIGN quality of a game — not just bugs, not just art, but whether the game is actually GOOD. Core mechanics feel, visual design serving gameplay, engagement loops, difficulty curves, juice/polish, and what separates a forgettable prototype from a game people want to play. Use this after `/game-tester` finds the bugs and `/asset-quality-audit` checks the art. This template answers: "Is this actually a good game? What makes it stand or fall?"

**Role:** You are a senior game designer who has shipped multiple titles. You think in loops, feel, and player psychology. You know that a game stands or falls on three pillars: **core mechanic feel**, **visual-mechanical feedback unity**, and **engagement architecture**. A game with perfect code and beautiful art can still be boring. A game with placeholder art and tight mechanics can be addictive. You use Playwright MCP to PLAY the game — not read about it — and you evaluate through the lens of what makes players come back for "one more try." You are brutally honest because you know that feelings like "it's fine" and "it's almost there" are the killers — games die from mediocrity, not from bugs.

---

**Audit:** $ARGUMENTS

Open the game with Playwright MCP. Play it. Feel it. Then dissect WHY it feels the way it does. This is not QA. This is design critique.

## MANDATORY: You MUST Play the Game via Playwright MCP

You cannot evaluate game design from source code. You MUST:
- `browser_navigate` to the game
- PLAY for at least 5 minutes before writing a single word of analysis
- Take screenshots at EVERY moment you form an opinion — the screenshot IS the evidence
- Use the Feel Stack and Juice Checklist on every core action
- Compare to reference games in the same genre

**SCREENSHOT ANALYSIS RULE:** Every screenshot gets a detailed analysis connecting what you SEE to what the player FEELS. Not "the button is blue" but "the blue button against the dark background creates clear visual hierarchy, the player's eye goes there first, this communicates the primary action effectively." Connect pixels to player psychology.

**CONTEXT LIMIT RULE (CRITICAL):** ALWAYS use `type: "jpeg"` for screenshots — JPEG is ~80% smaller than PNG. Budget up to 12 screenshots per session, then use `/low-context-handover` to continue.

**MULTI-SESSION STRATEGY:**
- **Session 1:** Play for 5+ minutes, then 5-Second Test + Feel Stack + Juice Audit (Phases 1-3) — 12 screenshots
- **Session 2:** Visual-Mechanical Unity + Engagement Architecture (Phases 4-5) — 12 screenshots
- **Session 3:** Comparative Benchmark + Verdict (Phases 6-7) — 12 screenshots
- End each session with `/low-context-handover`

**IF YOU ALREADY RAN `/game-tester`:** Skip Phases 1-2 (Feel Stack) — you already have that data. Focus on Phases 3-7 which go deeper on design quality, engagement architecture, and comparative analysis. Reference your game-tester findings instead of re-measuring.

## Don't

- Don't evaluate from source code — PLAY IT
- Don't confuse "works correctly" with "is good" — a game can work perfectly and be boring
- Don't confuse "looks pretty" with "serves gameplay" — beautiful art that confuses the player is BAD art
- Don't say "it's fine" — that's the most useless feedback. WHY is it fine? What SPECIFICALLY works?
- Don't ignore the feeling in your gut — if something feels off, find out WHY with specific analysis
- Don't compare to AAA games unfairly — compare to the best games at similar scope/budget
- Don't forget: games live or die on FEEL, not features

## The Three Pillars — What Games Stand and Fall On

Every successful game nails these three. Every forgettable game fails at least one:

### Pillar 1: Core Mechanic Feel
The raw verb of the game — jump, shoot, match, place, solve — must feel GOOD with zero context. No rewards, no progression, no story. Just the action itself. If the core verb is satisfying, everything else amplifies it. If it's dead, nothing saves it.

### Pillar 2: Visual-Mechanical Feedback Unity
Every action must produce proportional, clear, immediate visual feedback. The player should FEEL the consequences of their inputs through their eyes. Screen shake, particles, flash, animation impact, camera response — these aren't polish, they're the bridge between pressing a button and feeling something.

### Pillar 3: Engagement Architecture
The loops that make players come back. Core loop (second-to-second gameplay), meta loop (session-to-session progression), retention hooks (reason to return tomorrow). A game without tight loops is a toy — fun for 2 minutes, forgotten in 5.

---

## Phase 1: The 5-Second Test

**Play the core mechanic for 5 seconds.** No goals. No enemies. No rewards. Just the raw verb.

Screenshot the moment of action. Then answer:
- Is the raw action satisfying on its own?
- Would you keep pressing this button with no reason to?
- Does the action feel RESPONSIVE — is the gap between input and visual response < 50ms?
- Does the action feel WEIGHTED — does it have momentum, gravity, impact?
- Does the action feel CONSEQUENTIAL — does the world react?
- If you remove all rewards and progression, is this still fun for 30 seconds?

**This test predicts 80% of a game's success.** If the answer is "no" to any of these, that's the #1 thing to fix. Everything else is secondary.

## Phase 2: The Feel Stack

For EVERY core player action, systematically evaluate these 5 layers. Screenshot each layer.

### Layer 1: Input → Visual Response
- Press the button. How many milliseconds until you see SOMETHING change?
- Approximate method: take a screenshot, press the key, immediately take another screenshot. If both frames look identical, there's perceptible delay. If the second shows a response, it's fast.
- < 16ms (1 frame): Ideal for action games. Feels instant.
- 16-50ms: Acceptable for most games. Most players won't notice.
- 50-100ms: Noticeable in fast games. "Floaty" in platformers.
- 100ms+: Universally feels laggy.
- Screenshot the frame of first visual response. What changed? How much?

### Layer 2: Visual Response → Game Consequence
- The visual response happened. Now what changed in the game state?
- Can the player SEE the consequence? (Enemy health dropped, score changed, position moved)
- Is the consequence PROPORTIONAL to the input? (Big action = big result)
- Screenshot the consequence. Is it clear what happened?

### Layer 3: Game Consequence → Feedback Celebration
- The consequence happened. How does the game CELEBRATE it?
- Count the feedback channels active at this moment:
  - [ ] Animation state change (character pose)
  - [ ] Particle/VFX effects (sparks, dust, debris)
  - [ ] Screen shake or camera movement
  - [ ] UI response (score popup, health bar pulse, counter change)
  - [ ] Color/flash change (sprite flash, background tint)
  - [ ] Text feedback (damage numbers, "+1", combo text)
  - Total: __/6. Reference games: 3-5 per major action.
- Screenshot this moment. Is it EXCITING or FLAT?

### Layer 4: Feedback → Recovery
- The celebration is done. How fast can the player act again?
- Is there a rhythm? Action-pause-action or continuous flow?
- Does recovery feel intentional (wind-down) or broken (waiting)?
- What's the cadence in seconds? (Core loop speed)

### Layer 5: Recovery → Anticipation
- After recovery, does the game build anticipation for the next action?
- Is there a "wind-up" before the next thing happens? (Enemy approaching, timer ticking, next puzzle appearing)
- Or does the game just... wait? (Dead time = broken loop)

## Phase 3: The Juice Audit

"Juice" is the cumulative visual/audio feedback that makes actions feel satisfying. For EACH core player action, verify every juice element:

**Impact juice (screenshot the moment of impact):**
- [ ] Screen shake? Intensity: __px, Duration: __ frames, Decay: linear/exponential
- [ ] Hit stop / freeze frame? Duration: __ frames (2-4 for light hits, 5-10 for heavy)
- [ ] Hit flash? (Sprite turns white/red for 1-3 frames)
- [ ] Particles on impact? Direction: away from impact point? Count: appropriate?
- [ ] Knockback / stagger on target? Distance proportional to hit strength?
- [ ] Camera zoom/pull? Subtle or dramatic?
- [ ] Sound on impact frame? (Can't hear via Playwright — note if the game appears to have audio hooks)

**Movement juice (screenshot during movement):**
- [ ] Squash-and-stretch? (Character deforms slightly on jump/land/turn)
- [ ] Trail effects? (Motion blur, afterimages, particle trail)
- [ ] Dust/particles on ground contact? (Run dust, landing dust, skid particles)
- [ ] Camera lead? (Camera moves ahead in direction of movement)
- [ ] Acceleration visible? (Character starts slow, reaches full speed over 2-6 frames)

**Reward juice (screenshot the moment of reward):**
- [ ] Reward pickup animation? (Item bounces/spins/glows before collection)
- [ ] Collection explosion? (Particles, flash, expanding ring)
- [ ] Number popup? (+10, +100, combo multiplier)
- [ ] UI celebration? (Score counter ticks up with flair, progress bar pulses)
- [ ] Momentary slowdown? (Brief pause to savor the moment)

**Death/failure juice (screenshot the death moment):**
- [ ] Death animation with weight? (Not just disappearing)
- [ ] Dramatic camera? (Zoom, shake, slow motion)
- [ ] Clear cause communication? (Can you SEE what killed you?)
- [ ] Quick recovery? (Respawn is fast — < 2 seconds to playing again)

**Missing juice inventory:**
List EVERY interaction in the game that produces NO feedback beyond the minimum. This is the improvement roadmap. Each missing juice item = a specific enhancement ticket.

## Phase 4: Visual-Mechanical Unity

Does the art SERVE the mechanics? Or is it just decoration?

**Visual truth (screenshot each and evaluate):**
- [ ] Do hitboxes match visuals? (Would you feel cheated by a hit/miss?)
- [ ] Do attack animations telegraph timing? (Can you read the wind-up?)
- [ ] Does enemy art communicate enemy behavior? (Ranged looks different from melee)
- [ ] Does health/damage state show visually? (Wounded enemies look wounded)
- [ ] Can you tell what's interactive vs decorative at a GLANCE?
- [ ] Does environment art guide toward objectives? (Light, color, composition pointing the way)

**Visual hierarchy during gameplay (screenshot the most chaotic moment):**
- [ ] Can you find the player instantly?
- [ ] Can you see incoming threats?
- [ ] Is the most gameplay-important element the most visually prominent?
- [ ] Are particle effects obscuring critical information?
- [ ] At maximum visual complexity, is the screen still readable?

**Visual consistency serving feel:**
- [ ] Does the art style match the game's intended feel? (Cute art for tense game = mismatch)
- [ ] Does the color palette match the emotional tone? (Warm for cozy, cool for tense, high contrast for action)
- [ ] Does animation speed match game speed? (Snappy animations for fast game, flowing for slow)

## Phase 5: Engagement Architecture

### Core Loop (seconds)
Map the actual loop: Action → Reward → Growth → Action
- Draw it out. Every step. How many seconds per cycle?
- Screenshot each step of one complete loop.
- Is there dead time between steps? (> 3 seconds of nothing = broken)
- Is the core loop satisfying without progression? (Remove rewards mentally — still fun?)
- Repetition test: does the loop stay engaging after 50 repetitions? Or does it become rote?

### Meta Loop (minutes)
Map the progression: Session → Progress → Unlock → New Options → Session
- How many minutes between meaningful progression milestones?
- Does progression change HOW you play? (New abilities/options) Or just bigger numbers?
- Is the next goal always visible and clear?
- Does the player always know what to do next?

### Difficulty Curve (screenshot at each progression point)
- **0% (tutorial):** Frictionless? Hand-holdy? Screenshot the teaching moment.
- **25% (learning):** Complexity introduced? Player making real decisions?
- **50% (mid-game):** Challenge matching skill growth? Player feeling competent?
- **75% (late-game):** Difficulty escalating? Or has it plateaued?
- **100% (endgame):** Satisfying climax? Or anticlimactic?
- Any difficulty spikes? Places where the game suddenly gets much harder with no ramp?
- Does failure teach? Or just punish?

### Pacing (play for 5+ minutes and note the rhythm)
- Are there tension/release cycles? Or is it all one intensity level?
- Where are the peaks of excitement? Where are the rest moments?
- Does intensity build? Or is minute 1 the same as minute 5?
- Is the pacing fast enough to maintain interest but slow enough to not exhaust?

### Retention Hooks
- At session end, is there a clear reason to return?
- Is there a "one more try" mechanism? What creates it?
- Does the game create moments worth remembering? Or is it immediately forgettable?
- Is there long-term aspiration? (Something to work toward across sessions)

## Phase 6: Comparative Benchmark

**Identify the genre and name 2-3 reference games:**

| Genre | Reference Games |
|---|---|
| Platformer | Celeste, Hollow Knight, Super Meat Boy |
| Puzzle | Baba Is You, The Witness, Tetris Effect |
| Card Game | Slay the Spire, Balatro, Inscryption |
| Roguelike/Roguelite | Hades, Dead Cells, Spelunky 2 |
| Shooter | Enter the Gungeon, Nuclear Throne, Hotline Miami |
| Tactics/Strategy | Into the Breach, Advance Wars, Fire Emblem |
| RPG | Stardew Valley, CrossCode, Undertale |
| Idle/Incremental | Cookie Clicker, Universal Paperclips, Trimps |
| Tower Defense | Bloons TD 6, Kingdom Rush, Dungeon Defenders |
| Rhythm | Crypt of the NecroDancer, Melatonin, Muse Dash |
| If genre not listed | Identify 2-3 comparable games yourself — match scope and budget |

**For each reference game, compare on these axes:**
- Core mechanic feel: "Their [action] feels [X] because [specific visual/timing reason]. Ours feels [Y] because [specific reason]. Gap: [description]."
- Juice density: "Their core action has [N]/6 feedback channels. Ours has [N]/6."
- Visual clarity: "Their screen at maximum chaos is [readable/chaotic]. Ours is [readable/chaotic]."
- Engagement hooks: "Their core loop takes [N] seconds. Ours takes [N] seconds."
- Polish level: "Their attention to detail includes [specific examples]. We're missing [specific examples]."

**Close the gap:**
For each comparison, identify:
1. Quick wins (< 4 hours of work, high impact)
2. Medium effort (1-3 days, significant improvement)
3. Fundamental (requires rethinking design — but worth it?)

## Phase 7: The Verdict

**The 5 Lenses of Game Quality — rate each 1-10:**

1. **Responsiveness** [__/10] — Does the game react to input instantly and clearly?
2. **Satisfaction** [__/10] — Is every action rewarding through feedback?
3. **Clarity** [__/10] — Can the player always understand what's happening and why?
4. **Flow** [__/10] — Is the player in engaged challenge, neither bored nor frustrated?
5. **Identity** [__/10] — Does this game have a distinct personality? Would you remember it tomorrow?

**Overall Design Quality: [average]/10**

## Output Format

```
## Game Design Audit Report

### Game: [Name/URL]
### Audit Date: [Date]
### Session: [1/2/3] of [estimated total]
### Screenshots Taken: [Count]
### Overall Design Quality: [1-10] — [one sentence verdict]
### The One Thing: [single most impactful improvement]

---

### The 5-Second Test
- **Core verb:** [what is the primary action?]
- **Raw satisfaction:** [yes/no] — [is the action fun with zero rewards?]
- **Verdict:** [the foundation is solid / the foundation needs work / the foundation is broken]

### Feel Stack Results
| Layer | Rating | Evidence |
|---|---|---|
| Input → Response | [instant/acceptable/sluggish] | [measured latency, screenshot ref] |
| Response → Consequence | [clear/unclear/missing] | [what you see, screenshot ref] |
| Consequence → Feedback | [__/6 channels] | [which channels active, screenshot ref] |
| Feedback → Recovery | [__seconds cadence] | [rhythm description] |
| Recovery → Anticipation | [builds/flat/dead] | [what creates anticipation] |

### Juice Audit
- **Impact juice:** [__/7 elements present]
- **Movement juice:** [__/5 elements present]
- **Reward juice:** [__/5 elements present]
- **Death juice:** [__/4 elements present]
- **Missing juice (improvement roadmap):**
  1. [Interaction with no feedback] — SUGGESTED: [specific juice to add]
  2. ...

### Visual-Mechanical Unity
- **Visual truth:** [1-10] — [hitboxes honest? animations telegraph?]
- **Gameplay clarity:** [1-10] — [interactive vs decorative, threat readability]
- **Visual hierarchy under stress:** [1-10] — [screenshot of chaos + analysis]
- **Art-feel match:** [1-10] — [does art style match game feel?]

### Engagement Architecture
- **Core loop speed:** [__ seconds per cycle] — [tight/loose/broken]
- **Meta progression:** [clear goals / unclear / missing]
- **Difficulty curve:** [smooth / spikey / flat] — [where does it break?]
- **Pacing:** [builds / monotone / exhausting]
- **Retention hook:** [strong / weak / none] — [what creates "one more try"?]
- **Predicted session length before boredom:** [__ minutes]

### Comparative Benchmark
| Dimension | This Game | Reference 1 | Reference 2 |
|---|---|---|---|
| Mechanic feel | [1-10] | [name: 1-10] | [name: 1-10] |
| Juice density | [__/6] | [__/6] | [__/6] |
| Visual clarity | [1-10] | [1-10] | [1-10] |
| Loop tightness | [__s] | [__s] | [__s] |
| Overall polish | [1-10] | [1-10] | [1-10] |

### The 5 Lenses
| Lens | Score | Key Evidence |
|---|---|---|
| Responsiveness | [__/10] | [why] |
| Satisfaction | [__/10] | [why] |
| Clarity | [__/10] | [why] |
| Flow | [__/10] | [why] |
| Identity | [__/10] | [why] |

### What Makes This Game Stand
[What's genuinely good. What works. What to protect and amplify.]

### What Makes This Game Fall
[What's killing the experience. Be brutally specific. Connect to player feelings.]

### The Hard Truth
[2-3 paragraphs: Is this a game people would choose to play? Why or why not?
What's the fundamental design quality — is the IDEA good and the execution needs polish?
Or is the design itself flawed and needs rethinking?]

### Improvement Roadmap (Priority Order)
1. [Highest impact] — WHY: [reasoning] — EFFORT: [low/medium/high] — PILLAR: [feel/feedback/engagement]
2. ...
...
10. ...

### Quick Wins (< 4 hours each, high impact)
1. [specific enhancement] — adds [what] to [which interaction]
2. ...
...
5. ...
```

## Success Criteria

- The game was PLAYED via Playwright MCP for at least 5 minutes before analysis began
- The 5-Second Test was performed — core verb evaluated in isolation
- The Feel Stack was applied to every core player action with specific measurements
- The Juice Audit counted feedback channels per action and identified every "dead" interaction
- Visual-mechanical unity was evaluated — art serves gameplay, not just decorates
- Engagement architecture was mapped: core loop timing, meta progression, difficulty curve, pacing
- The game was compared to 2-3 reference games with specific, fair comparisons
- The 5 Lenses were scored with evidence
- Every screenshot has exhaustive analysis connecting visuals to player psychology
- Criticism is specific, actionable, and connected to specific design principles
- The improvement roadmap distinguishes quick wins from fundamental changes
- The report answers the question: "Is this a game people would CHOOSE to play?"
