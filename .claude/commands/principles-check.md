---
description: "When you need a full, systematic audit of whether the codebase follows its own engineering principles. A thorough compliance check — not a quick glance, but a real inspection of every principle against actual code."
---

# Principles Check

**When to use:** When you need a full, systematic audit of whether the codebase follows its own engineering principles. A thorough compliance check — not a quick glance, but a real inspection of every principle against actual code.

**Role:** You are a strict engineering auditor. Your job is to systematically check every principle defined in PRINCIPLES.md against the actual codebase and report violations with evidence. No hand-waving. No "looks fine." Every principle gets checked, every violation gets cited with file and line.

---

**Scope:** $ARGUMENTS

This is a systematic compliance audit. Go through EVERY principle in PRINCIPLES.md and check the actual code against it. Don't just read — grep, trace, verify. Find violations, not confirmations.

## Don't

- Don't skim and say "looks good" — check every principle methodically
- Don't report violations without citing the exact file and line
- Don't skip a principle because it "probably" isn't relevant
- Don't conflate "not ideal" with "violation" — only flag actual principle breaches
- Don't fix anything — this is audit only, report findings

## Step 1: Read the Principles

Read PRINCIPLES.md in full. Extract every checkable rule into a checklist. Group them:

1. **Core principles**: KISS, DRY, YAGNI, SRP, Explicit over Implicit, Cohesion/Coupling, Composition over Inheritance, Law of Demeter
2. **Architecture principles**: Clean/Hexagonal layers, dependency direction
3. **Security principles**: Input validation, error handling, no secrets in code/logs, logging rules
4. **Testing principles**: Test pyramid, test quality, coverage
5. **Documentation principles**: Docs with code, JSDoc, ADRs, no redundant docs
6. **Performance principles**: No premature optimization, algorithmic focus, no N+1
7. **Process rules**: Consistency, self-review, leave code better

## Step 2: KISS Audit

Check every source file for:
- Overly clever code that sacrifices readability (complex reduce chains, nested ternaries, obscure bit operations)
- Functions longer than ~50 lines that should be broken up
- Unnecessarily complex logic where a simpler approach exists
- Over-engineering: abstractions that serve no current purpose

For each violation: cite file:line and explain what's wrong and how to simplify.

## Step 3: DRY Audit

Search for:
- Duplicated logic across functions or files (grep for similar patterns)
- Hardcoded values that should be constants (magic numbers, repeated strings)
- Copy-pasted code blocks with minor variations
- Configuration that's scattered instead of centralized

For each violation: cite both locations and what should be extracted.

## Step 4: YAGNI Audit

Search for:
- Unused functions, classes, variables, imports (dead code)
- Commented-out code blocks
- Features or abstractions that exist "just in case"
- Speculative code that handles scenarios that don't exist yet

For each violation: cite what's unused and recommend removal.

## Step 5: SRP Audit

Check every function and class:
- Does it do exactly one thing?
- Does it have more than one reason to change?
- Are there "god functions" that handle too many concerns?
- Is business logic mixed with I/O, formatting, or infrastructure?

For each violation: cite the function/class and describe the mixed responsibilities.

## Step 6: Explicit over Implicit Audit

Check for:
- Functions with unclear signatures (any types, untyped parameters, ambiguous returns)
- Silent failures (empty catch blocks, swallowed errors, functions that return null instead of throwing)
- Magic behavior (side effects not obvious from the function name)
- Missing type annotations in critical paths

For each violation: cite file:line and what's implicit that should be explicit.

## Step 7: Coupling & Cohesion Audit

Check for:
- Circular dependencies between modules
- Unrelated functionality grouped in the same module/file
- Tight coupling between modules that should be independent
- Law of Demeter violations (long method chains through objects)

For each violation: cite the coupling and what should change.

## Step 8: Security Audit

Check for:
- Unvalidated user input at system boundaries
- Hardcoded secrets, API keys, tokens
- Secrets that could appear in logs
- Missing input sanitization
- Insufficient error context (generic "Failed" errors)
- Swallowed exceptions hiding real problems

For each violation: cite file:line and the security risk.

## Step 9: Testing Audit

Check for:
- Test coverage gaps in critical paths
- Flaky or non-deterministic tests
- Tests with shared mutable state
- Missing edge case coverage
- Tests that don't follow arrange/act/assert
- Slow tests that should be unit tests

For each finding: cite what's missing and why it matters.

## Step 10: Documentation & Process Audit

Check for:
- Public APIs without JSDoc/documentation
- Outdated or misleading docs
- Redundant documentation files
- Missing README for key modules
- Debug code left in (console.log, TODO without context)
- Code that doesn't follow the project's existing style/conventions

For each violation: cite location and what's wrong.

## Step 11: Performance Audit

Check for:
- O(n^2) or worse algorithms where O(n) is possible
- N+1 query patterns
- Missing pagination on large datasets
- Missing timeouts on external calls
- Premature optimizations that hurt readability

For each finding: cite location and the performance concern.

## Output Format

```
## Principles Compliance Report

### Summary
- Total principles checked: [N]
- Violations found: [N]
- Severity breakdown: [Critical: N, Major: N, Minor: N]
- Overall compliance: [percentage or rating]

### Critical Violations
[Must fix — these violate core principles in impactful ways]

1. **[Principle violated]** — `file:line`
   - What: [description of violation]
   - Evidence: [the actual code or pattern]
   - Fix: [concrete recommendation]

### Major Violations
[Should fix — clear principle breaches]

1. **[Principle violated]** — `file:line`
   - What: [description]
   - Fix: [recommendation]

### Minor Violations
[Nice to fix — small deviations]

1. **[Principle violated]** — `file:line`
   - What: [description]
   - Fix: [recommendation]

### Clean Areas
[Principles that are well-followed — brief acknowledgment]

### Recommended Fix Order
1. [Most impactful fix first]
2. [Next priority]
3. ...
```

## Success Criteria

- Every principle from PRINCIPLES.md was explicitly checked against actual code
- Every violation is cited with exact file and line number
- No violation is reported without evidence from the actual codebase
- Findings are severity-ranked (critical/major/minor)
- Each violation includes a concrete fix recommendation
- The report clearly separates facts (violations found) from opinions (recommendations)
- A prioritized fix order is provided
