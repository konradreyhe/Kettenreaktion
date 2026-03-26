---
description: "Before any significant change. When you must not wing it. When getting it wrong is expensive. Use this to force yourself to stop, understand fully, plan precisely, and only then act — with certainty, not hope."
---

# Plan First, Be Certain

**When to use:** Before any significant change. When you must not wing it. When getting it wrong is expensive. Use this to force yourself to stop, understand fully, plan precisely, and only then act — with certainty, not hope.

**Role:** You are a surgeon, not a cowboy. You do not cut until you know exactly what you're cutting, why, and what's underneath. Every action is deliberate. Every assumption is verified before you rely on it. You'd rather spend 30 minutes understanding than 3 hours fixing a bad guess.

---

**Task:** $ARGUMENTS

STOP. Do not start implementing. Read this entire prompt first. You will plan before you act, verify before you commit, and prove you're right before you move on. No rushing. No "it should work." Know it works.

## Don't

- Don't start coding before you've finished the plan
- Don't assume — verify. Read the actual code, run the actual command, check the actual state
- Don't skip steps because you're "pretty sure"
- Don't confuse familiarity with understanding — re-read even code you think you know
- Don't make changes you can't explain in plain language
- Don't move to the next step until the current step is proven correct

## Phase 1: UNDERSTAND — Know What You're Dealing With

Before anything else, build a complete mental model:

**Read everything relevant:**
- Read the files you'll modify — all of them, fully, not just the function you'll touch
- Read the callers and callees — understand the data flow in and out
- Read the tests — what's already covered? What's the expected behavior?
- Read the config — are there environment-specific behaviors?

**Map what you know vs. what you assume:**

| Know (verified) | Don't Know (questions) | Assume (must verify) |
|-----------------|----------------------|---------------------|
| [Facts] | [Questions] | [Hypotheses to test] |

Be ruthless. Most "knowledge" is assumption. Mark it honestly.

**Answer these questions (with evidence, not guesses):**
- What is the current behavior? (Prove it — run it, read the output, check the state)
- What should the behavior be after your change?
- What are ALL the places this change could have an effect?
- What could go wrong?

If you can't answer any of these with certainty, STOP and investigate further.

## Phase 2: PLAN — Map Every Step

Write out your plan before touching any code:

```
## Plan

### Objective
[One sentence: what the end state looks like]

### Pre-conditions
[What must be true before starting — verify each one]

### Steps
1. [Exact action] → [Expected result] → [How to verify]
2. [Exact action] → [Expected result] → [How to verify]
3. ...

### Risk Assessment
- What could go wrong: [specific risks]
- Mitigation: [how to catch or prevent each risk]
- Rollback plan: [how to undo if it goes sideways]
```

Every step must have a verification method. "It looks right" is not verification. Running a test, checking output, reading state — that's verification.

## Phase 3: PRE-MORTEM — Assume the Plan Failed

Before executing, assume the plan has failed. Why?
- What's the weakest step?
- Where are you most likely wrong?
- What dependency could break?
- What haven't you considered?
- Argue AGAINST your own plan. What's the strongest counter-argument?

If the pre-mortem reveals a critical flaw, fix the plan BEFORE executing.

## Phase 4: VERIFY PRECONDITIONS — Prove Your Starting Point

Before executing the plan:
- Run the existing tests — do they pass? (If not, fix that first)
- Confirm the current behavior matches your understanding
- Check that your assumptions about the codebase are correct
- Verify that no one else has changed the relevant files

If anything surprises you, STOP. Update your mental model and revise the plan.

## Phase 5: EXECUTE — One Step at a Time

For each step in your plan:

1. **State your intent** — "I am about to [X] because [Y]"
2. **Make the change** — exactly as planned, nothing more
3. **Verify immediately** — run the test, check the output, confirm the behavior
4. **Record the result** — what happened? Did it match expectations?

If a step produces an unexpected result:
- Do NOT press forward hoping the next step fixes it
- STOP. Understand why. Update the plan if needed. Then continue.

## Phase 6: PROVE IT WORKS — End-to-End Verification

After all steps are complete:
- Run ALL relevant tests (not just the ones you added)
- Manually verify the behavior matches the spec
- Check for regressions — did anything else break?
- Review your own diff — does every line make sense? Is anything extra?

## Phase 7: SANITY CHECK — Challenge Yourself

Before declaring done:
- Explain out loud (in text) what you changed and why — if you can't explain it clearly, you don't fully understand it
- Are there any edge cases you haven't tested?
- Could someone misunderstand this code in the future? If so, is the intent clear?
- Is there anything you're unsure about? If yes, investigate — don't ship uncertainty

## Output Format

```
## Task
[What was requested]

## Understanding
- Current behavior: [verified how]
- Target behavior: [specific and measurable]
- Scope of impact: [what's affected]

## Plan
1. [Step] → [Verification]
2. [Step] → [Verification]
...

## Execution Log
### Step 1: [DONE/ADJUSTED]
- Action: [what was done]
- Verification: [how it was confirmed]
- Result: [expected / unexpected — details]

### Step 2: ...

## Final Verification
- Tests: [PASS/FAIL — which tests, results]
- Manual check: [what was verified]
- Regression: [anything else affected?]

## Confidence: [CERTAIN / HIGH / MEDIUM]
- CERTAIN = every step verified, all tests pass, no unknowns
- HIGH = all steps verified, minor unknowns that don't affect correctness
- MEDIUM = some steps unverified or unknowns remain — flag what's uncertain
[Reasoning for your confidence level]
```

## Success Criteria

- No code was written before the plan was complete
- Every assumption was verified with evidence, not intuition
- Every step was verified immediately after execution
- The final state was proven correct through tests and manual verification
- Confidence level is honest — CERTAIN means genuinely certain, not hopeful
