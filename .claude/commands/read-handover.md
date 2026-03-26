---
description: "Start of a new session when a previous session left a HANDOVER.md. The companion to `/low-context-handover` — that one writes it, this one reads it and picks up where the last session stopped."
---

# Read Handover

**When to use:** Start of a new session when a previous session left a HANDOVER.md. The companion to `/low-context-handover` — that one writes it, this one reads it and picks up where the last session stopped.

**Role:** You are a session successor. Your job is to absorb everything the previous session documented, verify the current state matches what was described, and present a clear picture to the user so they can decide what to focus on.

---

**Continue from:** $ARGUMENTS

A previous session ended and left you a handover. Your job is to pick up where it stopped — read everything, verify the state, present your findings, then ask the user what they want to prioritize.

## Don't

- Don't skip reading HANDOVER.md — it's the single most important document right now
- Don't re-explore approaches the previous session already rejected (check the Decisions table)
- Don't assume the handover is wrong — verify first, then trust or challenge with evidence
- Don't ignore the rollback info — you may need it
- Don't redo work that's already marked as completed without checking it first
- Don't just passively summarize — actively verify and assess

## Step 1: Read the Handover — NOW

Read HANDOVER.md completely. No questions first. No waiting. Just read it. Extract and internalize:

1. **Summary** — What happened? What's the current state?
2. **Completed items** — What's done? Don't redo these.
3. **In-progress items** — What's partially done? This is likely the starting point.
4. **Decisions made** — What was chosen and WHY? What was rejected and WHY?
5. **Known issues** — What's broken or fragile?
6. **Next steps** — What was the priority order?
7. **Rollback info** — What's the escape plan if things go wrong?
8. **Files modified** — What changed recently?

## Step 2: Read Supporting Context

After the handover, read in this order:
- `CLAUDE.md` — project rules and conventions (always authoritative)
- `PRINCIPLES.md` — engineering principles (if exists)
- Recent git log — verify the commits match what the handover describes
- Any files listed in "Files Modified This Session"

## Step 3: Verify Current State

Trust but verify. Actively check if reality matches the handover:

- **Git status**: Is it clean? Are there uncommitted changes or WIP commits?
- **Completed items**: Spot-check 1-2 completed items — do they actually work?
- **In-progress items**: Look at the actual code — does it match the described state?
- **Tests**: Run the test suite — do they pass? Do any new failures exist?
- **Build**: Does the project build/start without errors?

Document any discrepancies you find.

## Step 4: Absorb Decisions

This is critical. The previous session made decisions for reasons:

- Review every row in the Decisions table
- Understand WHY each alternative was rejected
- Note any decisions you think might need revisiting (but don't override without evidence)

## Step 5: Present Status & Ask

Do ALL of the above proactively — no waiting for permission. Then present a clear, actionable status report:

```
## Handover Status

**Previous session:** [one-sentence summary of what happened]

**State verification:**
- Build: [pass/fail]
- Tests: [pass/fail, any new failures]
- Git: [clean/dirty, any discrepancies from handover]

**Completed (verified):**
- [item] — [confirmed working / issue found]

**In-progress (where we left off):**
- [item] — [current actual state]

**Next steps from handover (in priority order):**
1. [step] — [your assessment: ready to go / needs more info / blocked by X]
2. [step]
3. [step]

**Decisions inherited:**
- [key decision] — [still valid / might need revisiting because...]

**Issues or surprises:**
- [anything that doesn't match the handover, or new problems found]
```

Then ask the user:

> **What would you like to focus on?** The handover suggests [top priority]. I can start there, or we can reprioritize based on what matters most to you right now.

## Step 6: Execute Based on User Direction

Once the user tells you what to focus on:

- Start coding immediately — no more discussion needed
- Honor inherited decisions unless the user explicitly overrides them
- If context gets low (~40%), start thinking about your own handover
- If context hits ~15%, stop and run `/low-context-handover`

## Success Criteria

- HANDOVER.md was read completely — no sections skipped
- Current state was ACTIVELY verified (build, tests, git, spot-checks)
- Discrepancies between handover and reality were documented
- A clear status report was presented with actionable information
- The user was asked what they want to prioritize
- No rejected approaches were re-explored without new evidence
- Execution started promptly after user gave direction
