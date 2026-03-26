---
description: "When you're deliberately ending a session and want a thorough, complete handover. You have plenty of context — use it. This is the \"proper goodbye\" template. Not rushed, not panicked — methodical and comprehensive."
---

# Session Handover

**When to use:** When you're deliberately ending a session and want a thorough, complete handover. You have plenty of context — use it. This is the "proper goodbye" template. Not rushed, not panicked — methodical and comprehensive.

**Role:** You are a senior engineer wrapping up a shift. Document everything so completely that your replacement can work without a single question.

---

**Session context:** $ARGUMENTS

You're ending this session by choice, not by force. You have the context to do this RIGHT. A thorough handover now saves the next session 30+ minutes of archaeology.

## Don't

- Don't rush — you have context, use it
- Don't skip the reflection — what worked and what didn't matters
- Don't leave vague next steps — "continue working on X" is not actionable
- Don't forget the mental model — the WHY behind decisions is more valuable than the WHAT
- Don't assume the next session will have ANY context from this one — write for a stranger

## Step 1: Reflect on the Session

Before documenting, think through the full session:

- What was the original goal?
- How did the actual work differ from the plan?
- What surprised you? What was harder or easier than expected?
- What approaches worked well? What didn't?
- What would you do differently if starting over?

This reflection makes the handover USEFUL, not just a status dump.

## Step 2: Secure All Work

Make sure nothing is lost:

- **Uncommitted changes?** → Commit with clear messages, or `git stash` with a descriptive name
- **Partial implementations?** → Commit with `WIP:` prefix and explain what's missing in the commit message
- **Temporary workarounds?** → Document them explicitly — these are landmines for the next session
- **Config changes?** → Verify they're committed or documented
- **Run `git status`** → Nothing should be untracked and undocumented

## Step 3: Create/Update HANDOVER.md

Create `HANDOVER.md` in the project root with this structure:

```markdown
# Session Handover

**Date:** [today's date]
**Duration:** [approximate session length]
**Goal:** [what this session set out to accomplish]

## Summary

[2-3 paragraph narrative of what happened this session. Not a bullet list — tell the story. Include what was attempted, what worked, what didn't, and where things stand now. The reader should understand the full arc of the session.]

## What Got Done

- [x] [Completed item] — [brief description of what was built/fixed/changed]
- [x] [Completed item] — [brief description]

## What's In Progress

- [ ] [Item] — **State:** [exactly where it stands] | **Remaining:** [specific work left]
- [ ] [Item] — **State:** [description] | **Blocked by:** [what's preventing progress]

## What Didn't Get Done (and Why)

- [Planned item] — [why it wasn't reached: ran out of time / deprioritized / blocked by X]
- [Planned item] — [reason]

## Architecture & Design Decisions

| Decision | Chosen Approach | Why | Alternatives Considered | Why Rejected |
|----------|----------------|-----|------------------------|--------------|
| [Topic] | [What was chosen] | [Reasoning] | [Alt 1, Alt 2] | [Specific reasons each was worse] |

## Mental Model

[This is the most valuable section. Explain the conceptual understanding you built during the session. How does this part of the system work? What are the key relationships? What's the "trick" to understanding the code? Write the explanation you WISH you'd had when you started.]

## Known Issues & Risks

- **[Issue]** — Impact: [what breaks or degrades] | Workaround: [if any] | Fix: [what needs to happen]
- **[Risk]** — Likelihood: [low/medium/high] | Impact: [description] | Mitigation: [suggestion]

## What Worked Well

- [Approach/technique that was effective — reuse this]
- [Tool/pattern that saved time]

## What Didn't Work (Traps to Avoid)

- [Approach that failed] — [why it failed, so the next session doesn't retry it]
- [Dead end] — [what made it a dead end]

## Next Steps (Priority Order)

1. **[Highest priority]** — [specific, actionable description of what to do. Not "work on X" but "implement Y in file Z by doing A, B, C"]
2. **[Second priority]** — [actionable description]
3. **[Third priority]** — [actionable description]

## Rollback Plan

- **Last known good state:** [commit hash + description]
- **If current approach fails:** [what to revert and how]
- **Safe reset command:** `git reset --hard [hash]` (or equivalent)

## Files Changed This Session

- `path/to/file` — [what changed and why]
- `path/to/file` — [what changed and why]

## Open Questions

- [Question that came up but wasn't resolved]
- [Uncertainty that the next session should investigate]
```

## Step 4: Update Persistent Memory

Check if anything learned this session should be saved to memory:

- New understanding about the user's preferences → save as user/feedback memory
- Project context that won't be in the handover forever → save as project memory
- External resource locations discovered → save as reference memory

Don't duplicate what's in HANDOVER.md — memory is for things that outlive a single handover cycle.

## Step 5: Final Verification

Before you're done:

- [ ] `git status` is clean — everything committed, stashed, or documented
- [ ] HANDOVER.md is complete — every section filled or explicitly marked N/A
- [ ] The Mental Model section actually explains something useful
- [ ] Next steps are specific enough to act on without re-reading any code
- [ ] Architecture decisions include rejected alternatives with reasons
- [ ] "What Didn't Work" section prevents the next session from repeating mistakes
- [ ] Open questions are captured so they aren't lost
- [ ] Any memory-worthy learnings are saved

## Step 6: Verify the Handover Works

Read your own HANDOVER.md as if you had zero context. Ask yourself:

- Can I understand what happened without reading any code?
- Can I start working on "Next Step 1" without asking any questions?
- Do I know what NOT to try?
- Do I know how to undo things if they go wrong?

If any answer is "no" — fix the handover before ending.

## Success Criteria

- A brand new session with zero context can read HANDOVER.md and start working immediately
- No time is wasted re-exploring dead ends (documented in decisions + "what didn't work")
- The mental model section genuinely teaches something
- Next steps are actionable, not vague
- All work is secured in git
- Persistent learnings are saved to memory
