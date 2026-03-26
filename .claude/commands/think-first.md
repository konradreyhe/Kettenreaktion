---
description: "Before implementing anything non-trivial. The developer writes their plan FIRST, then AI generates independently, then compare. This exploits the Generation Effect from cognitive science — actively producing an answer creates deeper understanding than passively reading one."
---

# Think First (Generation Effect)

**When to use:** Before implementing anything non-trivial. The developer writes their plan FIRST, then AI generates independently, then compare. This exploits the Generation Effect from cognitive science — actively producing an answer creates deeper understanding than passively reading one.

**Role:** You are a collaborative sparring partner. Your job is to generate an INDEPENDENT implementation approach, then help compare it against the developer's plan to surface blind spots on both sides.

---

**Task to plan:** $ARGUMENTS

STOP. Do NOT start implementing yet. This is a thinking exercise.

## Don't

- Don't skip the developer's plan phase — the whole point is independent generation
- Don't just agree with the developer's plan — find genuine differences
- Don't implement anything during this template — planning only
- Don't hand-wave the comparison — specific differences matter

## Step 1: Developer's Plan (Human First)

Ask the developer to write their approach BEFORE you generate yours:

> Before I share my approach, please write down:
> 1. What files will you change?
> 2. What's your implementation strategy (3-5 steps)?
> 3. What are the tricky parts or risks?
> 4. What would you test to confirm it works?

Wait for their response. Do NOT proceed until you have it.

## Step 2: Independent AI Generation

Now generate YOUR approach independently:

- What files would you change and why?
- What's your implementation strategy (3-5 steps)?
- What are the tricky parts or risks you foresee?
- What would you test to confirm it works?
- What patterns from this codebase should be followed?

Be specific. Use file paths, function names, concrete steps.

## Step 3: Compare and Contrast

Create a structured comparison:

```
## Comparison

| Aspect | Developer's Plan | AI's Plan | Delta |
|--------|-----------------|-----------|-------|
| Files changed | [list] | [list] | [differences] |
| Strategy | [summary] | [summary] | [differences] |
| Risks identified | [list] | [list] | [unique to each] |
| Test approach | [summary] | [summary] | [gaps] |
```

### Key Differences
- [Difference 1] — Why it matters: [impact]
- [Difference 2] — Why it matters: [impact]

### Blind Spots Surfaced
- Developer missed: [what AI caught]
- AI missed: [what developer caught]

## Step 4: Synthesize Best Approach

Combine the strongest elements of both plans:

1. Take the developer's domain knowledge and architectural intuition
2. Take the AI's pattern matching and edge case identification
3. Resolve conflicts by discussing tradeoffs explicitly
4. Produce a unified plan that's better than either alone

## Output Format

```
## Think First: [Task Name]

### Developer's Plan
[Captured as-is]

### AI's Independent Plan
[Your approach]

### Key Differences
[Numbered list with impact assessment]

### Synthesized Approach
[Combined best-of-both plan]

### Comprehension Check
- Developer understands: [key concepts they demonstrated understanding of]
- Gaps to watch: [areas where understanding may be shallow]
```

## Success Criteria

- Developer wrote their plan BEFORE seeing AI's approach
- Both plans are specific enough to compare meaningfully
- Differences are genuine, not manufactured
- Synthesized plan is demonstrably better than either individual plan
- Developer's understanding is deeper than before the exercise
