---
description: "When you want to iteratively improve UI/UX by seeing the actual result, analyzing it, planning enhancements, implementing them, and repeating. The visual feedback loop. Not a one-shot verification (use `/visual-verify`) — this is a continuous refinement cycle."
---

# Iterate & Enhance Visually

**When to use:** When you want to iteratively improve UI/UX by seeing the actual result, analyzing it, planning enhancements, implementing them, and repeating. The visual feedback loop. Not a one-shot verification (use `/visual-verify`) — this is a continuous refinement cycle.

**Role:** You are a product designer and engineer in one. You see the current state, analyze what could be better, research best practices, make a plan, enhance, and repeat until it's genuinely good. You don't stop at "works" — you push to "great."

---

**Iterate on:** $ARGUMENTS

See it. Analyze it. Think about what's missing. Research if needed. Plan the enhancement. Implement it. Screenshot again. Repeat until it's right. Every cycle must produce visible, measurable improvement.

**CONTEXT LIMIT RULE (CRITICAL):** ALWAYS use `type: "jpeg"` for screenshots — JPEG is ~80% smaller than PNG. After 15 screenshots, use `/low-context-handover` to continue in a new session. The API has a 20MB request limit — PNG screenshots WILL crash the session.

## Don't

- Don't make changes without looking at the current state first — always screenshot before touching code
- Don't skip the analysis step — "it looks fine" is not analysis
- Don't implement multiple unrelated changes in one cycle — one enhancement per iteration
- Don't iterate forever — set a clear goal and stop when you reach it
- Don't guess what looks good — reference real patterns, real designs, real best practices
- Don't declare "done" without a final before/after comparison

## Setup: Playwright MCP

Ensure Playwright MCP is available:
- Setup: `claude mcp add playwright npx '@playwright/mcp@latest'`
- Confirm it's connected and can navigate to the target URL
- Start the dev server if not already running

## The Iteration Loop

Repeat this cycle until the goal is met:

### 1. CAPTURE — Screenshot the Current State

- Navigate to the target page/component
- Take a full-page screenshot at desktop viewport (1440x900)
- If relevant, also capture mobile (375x667) and tablet (768x1024)
- Check the browser console for errors
- This is your baseline for this iteration

### 2. ANALYZE — What Needs Improvement?

Study the screenshot critically:
- **Layout:** Is spacing consistent? Is alignment correct? Is the visual hierarchy clear?
- **Typography:** Are font sizes, weights, and line heights appropriate? Is text readable?
- **Color:** Is contrast sufficient? Is the color palette cohesive? Do interactive elements stand out?
- **Interaction cues:** Are buttons clearly clickable? Are links distinguishable? Are states (hover, active, disabled) visible?
- **Content:** Is information well-organized? Is the most important thing prominent?
- **Polish:** Are there rough edges, inconsistencies, or things that feel "off"?

Pick the SINGLE most impactful improvement. Not three things — one.

### 3. RESEARCH — What's the Best Approach?

Before implementing:
- Look at how the existing codebase handles similar patterns
- Consider established design patterns and conventions in the project
- If unsure about the right approach, check relevant documentation or examples
- Think about accessibility implications
- Consider how the change affects other viewports and states

### 4. PLAN — Define the Enhancement

Be specific:
- **What:** Exact change to make (e.g., "increase card padding from 12px to 16px and add subtle box-shadow")
- **Why:** What problem this solves (e.g., "cards feel cramped and don't separate from background")
- **Where:** Exact file(s) and location(s) to modify
- **Risk:** Could this break anything? Any side effects?

### 5. IMPLEMENT — Make the Change

- Make the single planned change
- Keep it minimal and focused
- Don't get distracted by other things you notice — log them for future iterations

### 6. VERIFY — Screenshot the Result

- Take a new screenshot at the same viewport(s)
- Compare visually with the previous screenshot
- Check: Did the change achieve the intended improvement?
- Check: Did anything else break or shift unexpectedly?
- Check the console for new errors

### 7. DECIDE — Continue or Stop?

- **Continue** if there are more impactful improvements to make and you haven't hit the goal
- **Stop** if the goal is met, or if further changes would be diminishing returns
- **Revert** if the change made things worse — undo and try a different approach

---

## Output Format

```
## Visual Iteration Report

### Goal
[What we're trying to achieve]

### Iteration 1
- **Before:** [Description of initial state]
- **Analysis:** [What needed improvement and why]
- **Change:** [What was changed, in which file(s)]
- **Result:** [Did it improve? What does it look like now?]
- **Verdict:** IMPROVED / NO CHANGE / REVERTED

### Iteration 2
...

### Iteration N (Final)
- **Before:** [State entering this iteration]
- **Change:** [Final enhancement]
- **Result:** [Final state]
- **Verdict:** DONE

### Summary
- Iterations completed: [N]
- Key improvements: [List of what changed]
- Before vs After: [High-level comparison]
- Remaining ideas (not implemented): [Logged for future]
```

## Success Criteria

- Every iteration starts with a screenshot (no blind changes)
- Each change is a single, focused improvement
- Before/after comparison is done for every iteration
- The final state is demonstrably better than the initial state
- No regressions were introduced
- Remaining improvement ideas are logged, not lost
