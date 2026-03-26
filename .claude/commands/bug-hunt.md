---
description: "When you want to proactively find bugs hiding in the codebase. No known bug required — you're hunting. Systematically analyze logic, data flow, state management, and edge cases to find defects before users do."
---

# Bug Hunt — Proactive Codebase Logic Audit

**When to use:** When you want to proactively find bugs hiding in the codebase. No known bug required — you're hunting. Systematically analyze logic, data flow, state management, and edge cases to find defects before users do.

**Role:** You are a bug hunter. Not a reviewer checking style. Not a security auditor checking OWASP. You are hunting for LOGIC BUGS — the kind that pass tests, survive code review, and explode in production at 3am. Think like the code is lying to you. Trace every path. Question every assumption. Find what's broken before it breaks.

---

**Hunt scope:** $ARGUMENTS

Systematically analyze this codebase for hidden bugs. Not style issues. Not "could be better." BUGS — incorrect behavior, data corruption, silent failures, impossible states, race conditions, and logic errors. Read everything. Trust nothing. Prove correctness or find the defect.

## Don't

- Don't report style issues, naming preferences, or "I would have done it differently" — find BUGS
- Don't skim — read every line in the hunt scope, or you'll miss the subtle ones
- Don't assume tests prove correctness — many bugs exist in tested code
- Don't assume happy-path correctness means the code works — bugs live in edges and intersections
- Don't stop at the first bug — the codebase doesn't have just one. Keep hunting.
- Don't report theoretical issues that can't actually trigger — prove a path exists or move on

## Step 1: Map the Kill Zone

Before hunting, understand the terrain:
- What are the core data structures and how do they flow through the system?
- What are the critical code paths? (Business logic, data mutations, state transitions)
- Where does data enter the system? Where does it exit?
- What external dependencies does the code interact with? (DBs, APIs, file system, network)
- What are the implicit invariants? (Things the code assumes are ALWAYS true but never checks)

Draw the map. The bugs are at the boundaries and intersections.

## Step 2: Data Flow Analysis

Trace data from entry to exit. At every step, ask:
- Can this value be null/undefined/empty when the code assumes it won't be?
- Can this value be the wrong type? (String where number expected, object where array expected)
- Can this value be outside the expected range? (Negative, zero, MAX_INT, NaN, Infinity)
- Is this data ever mutated by reference when a copy was intended? (Shared state corruption)
- Can this data be stale? (Cached value that should have been refreshed, closed-over variable)
- Are transformations reversible when they need to be? (Encoding/decoding, serialize/deserialize)
- Does data survive round-trips intact? (DB write → read, API send → receive, JSON stringify → parse)

## Step 3: Logic & Control Flow Audit

For every conditional, loop, and branch:
- **Conditionals:** Are all cases covered? Is the else/default correct, not just the if? Are compound conditions (AND/OR) correct — draw the truth table if needed
- **Loops:** Can the loop execute zero times when at least one iteration is assumed? Can it infinite-loop? Is the termination condition correct? Off-by-one?
- **Switch/match:** Is every case handled? Is fallthrough intentional or a bug? Does default make sense?
- **Short-circuit evaluation:** Does `a && b.foo` protect against null `b`, or does `a || getDefault()` have side effects?
- **Operator precedence:** Are complex expressions parenthesized correctly? Is `a + b * c` doing what was intended?
- **Comparison bugs:** `==` vs `===`, floating-point comparison, string vs number sorting, locale-dependent comparisons

## Step 4: State & Lifecycle Bugs

State bugs are the hardest to find and the most destructive:
- **Invalid state combinations:** Can the system reach a state that should be impossible? (e.g., `isLoading=true` AND `data=populated` AND `error=set`)
- **State transition gaps:** Are there states with no exit? Transitions that skip required intermediate states?
- **Initialization order:** Does code depend on something being initialized first without guaranteeing it?
- **Cleanup failures:** Are resources always released? (File handles, DB connections, event listeners, timers, subscriptions)
- **Re-entrancy:** Can a function be called while it's already executing? Does it handle that?
- **Stale closures:** Do callbacks or event handlers capture variables that change before the callback fires?

## Step 5: Error Handling Audit

Errors are where bugs breed:
- **Swallowed errors:** Empty catch blocks, `.catch(() => {})`, ignored Promise rejections, try/catch around too much code
- **Wrong error handling:** Catching a broad exception when only a specific one was intended. Retrying when the error is permanent. Falling through to success path after an error.
- **Error propagation:** Does an error in step 3 of 5 leave steps 1-2 in a dirty state? Is rollback needed?
- **Partial failure:** In batch operations, what happens when item 50 of 100 fails? Do the first 49 commit? Should they?
- **Error messages that lie:** Does the error message describe what actually happened, or a generic fallback?
- **Async error handling:** Are Promise rejections caught? Do async functions in non-async contexts lose their errors?

## Step 6: Boundary & Integration Bugs

Where systems meet, bugs feast:
- **API contracts:** Does the code handle every possible response, not just the expected ones? What about 429, 500, timeout, malformed JSON, empty body?
- **Database:** Can queries return unexpected results? (NULL joins, empty result sets, duplicate rows, type coercion)
- **File system:** What if the file doesn't exist, is locked, has wrong permissions, or is a symlink?
- **Concurrency at boundaries:** Can two requests modify the same resource simultaneously? Is there a TOCTOU (time-of-check-to-time-of-use) gap?
- **Encoding boundaries:** UTF-8 assumptions, URL encoding/decoding, HTML entity handling, line ending differences (CRLF vs LF)

## Step 7: Arithmetic & Computation Bugs

The quiet killers:
- **Integer overflow/underflow** in languages that allow it
- **Floating-point precision:** `0.1 + 0.2 !== 0.3` — is money stored as floats? Are comparisons exact?
- **Division by zero:** Is the denominator guaranteed to be non-zero?
- **Date/time bugs:** Timezone assumptions, DST transitions, midnight edge cases, month-end calculations, leap years
- **String manipulation:** Counting bytes vs characters, multi-byte character splitting, regex on untrusted input (ReDoS)

## Step 8: Verify & Prove

For every bug found:
1. **Trace the exact execution path** that triggers it — file, function, line, input
2. **Construct a concrete scenario** — not "this could theoretically happen" but "given input X, step 1 does A, step 2 does B, and at step 3 it breaks because..."
3. **Classify severity:**
   - **Critical:** Data corruption, data loss, security bypass, crash in production
   - **High:** Incorrect behavior visible to users, silent wrong results, resource leak under load
   - **Medium:** Edge case failure, degraded behavior, error handling gap that masks real issues
   - **Low:** Unlikely trigger conditions but real bug, cosmetic incorrect behavior
4. **Propose a minimal fix** — the smallest change that eliminates the bug

## Output Format

```
## Bug Hunt Report

### Scope
[What was analyzed — files, modules, subsystems]

### Summary
- Bugs found: [N]
- Critical: [N] | High: [N] | Medium: [N] | Low: [N]

### Bugs Found

#### [BUG-1] [Short description]
- **Severity:** Critical/High/Medium/Low
- **Location:** [file:line]
- **Category:** [Data flow / Logic / State / Error handling / Boundary / Arithmetic]
- **Trigger:** [Exact scenario that triggers this bug]
- **Impact:** [What goes wrong when triggered]
- **Root cause:** [Why it's wrong]
- **Fix:** [Minimal code change to fix]

#### [BUG-2] ...

### Patterns Observed
[Recurring bug patterns — e.g., "error handling is consistently missing for async operations in module X"]

### Areas of Concern
[Code sections that aren't provably buggy but are fragile, complex, or hard to reason about]

### Clean Areas
[Code sections that are well-structured and robust — acknowledge good work]
```

## Success Criteria

- Every file in the hunt scope was read line by line
- Every bug has a concrete trigger scenario, not just a theoretical concern
- Bugs are classified by severity with clear reasoning
- Each bug has a proposed minimal fix
- No style issues, refactoring suggestions, or "nice to haves" — ONLY bugs
- If zero bugs are found, the report explains what was checked and why confidence is high
