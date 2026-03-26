---
description: "Context window is ~5-15% remaining. You still have room to do this properly. Do NOT wait for emergency — act now while you can still think clearly."
---

# Low-Context Handover

**When to use:** Context window is ~5-15% remaining. You still have room to do this properly. Do NOT wait for emergency — act now while you can still think clearly.

**Role:** You are now a documentarian. Your only job is to capture the complete state so the next session can pick up seamlessly.

---

**Session context:** $ARGUMENTS

LOW CONTEXT. STOP all tasks. STOP all implementation. STOP all debugging. Nothing else matters except documenting the current state RIGHT NOW.

## Don't

- Don't try to "just finish this one thing" — you will run out of context
- Don't write incomplete handovers — the next session depends on this
- Don't leave uncommitted changes without documenting them
- Don't skip the rollback info — the next session needs to know how to undo
- Don't skip the decisions table — rejected approaches are as valuable as chosen ones

## Step 1: 30-Second Summary (Write This First)

Before anything else, write one paragraph:
- What was the focus of this session?
- What's done? What's not done?
- What's the single most important thing the next session needs to know?

## Step 2: Handle Partial Work

Secure any in-progress work:
- **Uncommitted changes?** → `git stash` or commit with `WIP:` prefix
- **Partial implementation?** → Document exactly what's done, what's missing
- **Broken state?** → Document what's broken and how to fix it
- **Tests failing?** → Document which tests and why

## Step 3: Create/Update HANDOVER.md

Create `HANDOVER.md` in the project root with this structure:

```markdown
# Handover

## Summary
[One paragraph: what happened, what's the state, what's next]

## Completed
- [x] [Thing that's done and working]
- [x] [Another completed item]

## In Progress
- [ ] [Partial work] — Status: [what's done, what's left]
- [ ] [Another item] — Blocked by: [reason]

## Decisions Made
| Decision | Why | Alternatives Rejected | Why Rejected |
|----------|-----|-----------------------|--------------|
| [Choice] | [Reasoning] | [Alt 1] | [Why it was worse] |
| [Choice] | [Reasoning] | [Alt 2] | [Why it was worse] |

## Known Issues
- [Issue]: [Impact and workaround if any]

## Next Steps (Priority Order)
1. [Most important — do this first]
2. [Second priority]
3. [Third priority]

## Rollback Info
- Last known good state: [commit hash or description]
- If the current approach doesn't work: [what to undo and how]

## Files Modified This Session
- `path/to/file` — [what changed and why]
```

**IMPORTANT: The Decisions table MUST include rejected alternatives and WHY they were rejected.** This prevents the next session from re-exploring dead ends. Documenting what you DIDN'T do is as valuable as documenting what you did.

## Step 4: Final Checklist

- [ ] 30-second summary written
- [ ] All partial work stashed or committed
- [ ] HANDOVER.md is complete with all sections filled
- [ ] Every modified file is listed with what changed
- [ ] Next steps are clear, prioritized, and actionable
- [ ] Rollback info is documented
- [ ] Decisions table includes rejected alternatives with reasons
- [ ] Git status is clean (committed or documented why not)

## Success Criteria

- A brand new session with zero context can read HANDOVER.md and continue work without asking a single clarifying question
- No dead-end approaches will be re-explored thanks to the decisions table
