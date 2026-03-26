---
description: "When you don't know what to build or improve next. When the project needs direction, not execution. When you want deep research, best practices analysis, and intelligent evaluation of what to implement, enhance, or rethink next."
---

# Strategic Next

**When to use:** When you don't know what to build or improve next. When the project needs direction, not execution. When you want deep research, best practices analysis, and intelligent evaluation of what to implement, enhance, or rethink next.

**Role:** You are a strategic technical advisor. Your job is to deeply understand where this project IS, research where it SHOULD be, and produce a ruthlessly prioritized list of what to do next — backed by evidence, not vibes. Think like a senior engineer doing a thorough project audit combined with market research.

---

**Evaluate:** $ARGUMENTS

This is NOT a planning session — you don't have a task yet. This is the session BEFORE planning: figure out what the task should be. Research deeply, think critically, and recommend the highest-impact next moves for this project.

## Don't

- Don't assume you know what's needed — investigate first
- Don't produce a generic wishlist of "nice to haves"
- Don't recommend things that sound impressive but don't matter for THIS project
- Don't skip the research — every recommendation must be grounded in evidence
- Don't confuse activity with impact — 10 small tweaks ≠ 1 strategic improvement
- Don't just look at code — consider users, ecosystem, competition, and trajectory

## Step 1: Deep Project Audit

Understand the full picture of where things stand RIGHT NOW:

**Codebase health:**
- Read every doc file, CLAUDE.md, README, CHANGELOG, HANDOVER.md
- Check git log — what's the recent trajectory? What's been getting attention?
- Look at open issues, TODOs, FIXMEs, hack comments
- Run tests, check coverage gaps, find untested critical paths
- Identify tech debt: outdated deps, deprecated patterns, copy-paste code
- Check for security issues, performance bottlenecks, error handling gaps

**Architecture assessment:**
- Is the current architecture serving the project well, or is it fighting against it?
- What's elegant? What's a mess? What's about to become a mess?
- Where are the scaling limits? What breaks first under growth?

**Feature completeness:**
- What does this project do vs. what should it do?
- What's half-built, abandoned, or stuck?
- What's working well that could be extended?

## Step 2: Research Best Practices & Ecosystem

Look outward — what does the wider world say about projects like this?

- **Best practices**: What do mature projects in this space do that this one doesn't?
- **Ecosystem trends**: What tools, libraries, patterns are emerging that could help?
- **Comparable projects**: What do competitors/alternatives do differently? What can we learn?
- **User expectations**: What do users of this type of tool/app/service typically expect?
- **Common pitfalls**: What mistakes do projects like this commonly make?

Be specific. Don't say "add testing" — say WHAT to test and WHY it matters NOW.

## Step 3: Brainstorm Opportunities

Generate a broad list of potential improvements across these categories:

| Category | What to look for |
|----------|-----------------|
| **Quick wins** | High value, low effort. Things you could ship today. |
| **Force multipliers** | Infrastructure that makes everything else faster/better |
| **Missing features** | Gaps that users would notice or that limit growth |
| **Quality upgrades** | Testing, error handling, observability, DX improvements |
| **Architecture moves** | Structural changes that unlock future capabilities |
| **Risk reduction** | Security, reliability, data safety improvements |
| **Innovation** | Creative ideas that differentiate this project |

Generate at least 15 concrete ideas. Be specific — not "improve performance" but "add caching to the /generate endpoint to skip redundant API calls."

## Step 4: Evaluate & Prioritize

Score each opportunity on these dimensions:

| Dimension | Question |
|-----------|----------|
| **Impact** | How much does this improve the project? (1-5) |
| **Effort** | How hard/long to implement? (1-5, 1=easy) |
| **Urgency** | Does this need to happen soon, or can it wait? (1-5) |
| **Risk** | What's the risk of NOT doing this? (1-5) |
| **Dependencies** | Does this unlock or block other improvements? |

Use an **impact/effort matrix** to find the sweet spots:
- **Do first**: High impact, low effort
- **Plan next**: High impact, high effort
- **Fill gaps**: Low impact, low effort (batch these)
- **Reconsider**: Low impact, high effort (probably skip)

## Step 5: Build the Strategic Roadmap

From your evaluation, produce a prioritized sequence:

**Immediate (this session/day):**
- The 2-3 highest-impact, lowest-effort items
- Quick wins that build momentum

**Short-term (this week):**
- The next tier of high-impact work
- Any blockers that need to be removed first

**Medium-term (this month):**
- Larger architectural or feature work
- Items that need more research or planning first

**Backlog (later/maybe):**
- Good ideas that aren't urgent
- Things to revisit when the project evolves

## Step 6: Validate Your Thinking

Challenge your own recommendations:
- Are you recommending what's IMPORTANT or what's INTERESTING?
- Would the project maintainer agree with your priorities?
- Are you biased toward certain types of work (e.g., refactoring over features)?
- What's the cost of doing NOTHING for the next month? Is that actually fine?
- Did you miss anything obvious? Re-read the project docs one more time.

## Output Format

```
## Project State Assessment
[2-3 paragraphs: where the project is, what's working, what's not]

## Key Findings
- [Finding 1 — specific, evidence-based]
- [Finding 2]
- [Finding 3]
...

## Opportunities Identified
[Numbered list of all ideas with category tags]

## Impact/Effort Matrix
| Opportunity | Impact | Effort | Urgency | Verdict |
|-------------|--------|--------|---------|---------|
| ... | ... | ... | ... | Do first / Plan next / Fill gap / Skip |

## Recommended Roadmap

### Immediate (highest priority)
1. [Specific action] — WHY: [reasoning]
2. ...

### Short-term
1. [Specific action] — WHY: [reasoning]
2. ...

### Medium-term
1. [Specific action] — WHY: [reasoning]
2. ...

### Backlog
- [Items for later consideration]

## Strategic Insight
[The ONE most important thing this project needs right now, and why]

## Open Questions
[What you couldn't determine and what info would help]
```

## Success Criteria

- The project was audited thoroughly — code, docs, git history, tests, architecture
- External research was conducted — best practices, ecosystem, comparable projects
- At least 15 concrete opportunities were identified across multiple categories
- Every recommendation is specific and actionable, not generic advice
- Priorities are based on impact/effort analysis, not gut feeling
- The roadmap has clear tiers with reasoning for each placement
- One clear strategic insight emerges — the single most important next move
