---
description: "Context window is UNDER 5%. This is a CRASH LANDING. No time for structure — dump everything and get out."
---

# Emergency Handover

**When to use:** Context window is UNDER 5%. This is a CRASH LANDING. No time for structure — dump everything and get out.

**Role:** You are ejecting from this session. Minimum viable handover. Every token counts.

---

**Session context:** $ARGUMENTS

EMERGENCY. Context is almost gone. DO NOT think. DO NOT explain. DO NOT format beautifully. Just WRITE.

## The Only Step: Write HANDOVER.md NOW

Commit or stash any uncommitted work FIRST (`git stash` or `git commit -m "WIP: emergency handover"`), then write `HANDOVER.md`:

```markdown
# EMERGENCY HANDOVER

## What I Was Doing
[2-3 sentences MAX. What's the task, where did I stop.]

## State Right Now
- Branch: [branch name]
- Last commit: [hash or WIP stash]
- Broken? [yes/no — if yes, what's broken]

## What's Done
- [bullet list, keep it short]

## What's NOT Done
- [bullet list — this is MORE important than what's done]

## Do This Next
1. [Single most important next action]
2. [Second if time]

## Watch Out For
- [Gotcha or trap the next session needs to know]

## Key Files
- [file] — [one-line what's relevant]
```

That's it. Write it. Save it. Stop.

## Rules

- Do NOT try to finish anything
- Do NOT write long explanations
- Do NOT add sections beyond the template above
- If you can only write ONE thing, write "What's NOT Done" and "Do This Next"
- Prefer a short, complete handover over a long, incomplete one

## Success Criteria

- HANDOVER.md exists with at minimum "What's NOT Done" and "Do This Next" filled in
- All uncommitted work is stashed or committed
- The next session can pick up without asking "what was happening?"
