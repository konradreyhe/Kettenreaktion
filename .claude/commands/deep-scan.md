---
description: "When you want to leverage AI's unique pattern recognition strengths on a large codebase. Not a standard code review — this exploits what AI does better than humans: holding hundreds of patterns in parallel, detecting cross-file inconsistencies, finding convention drift, spotting the subtle anomalies that 10 developers walked past for 3 years. Designed for 100k-500k+ line codebases. The \"fresh eyes at machine scale\" template."
---

# Deep Scan — AI Pattern Recognition Audit

**When to use:** When you want to leverage AI's unique pattern recognition strengths on a large codebase. Not a standard code review — this exploits what AI does better than humans: holding hundreds of patterns in parallel, detecting cross-file inconsistencies, finding convention drift, spotting the subtle anomalies that 10 developers walked past for 3 years. Designed for 100k-500k+ line codebases. The "fresh eyes at machine scale" template.

**Role:** You are a pattern recognition engine. You have seen millions of codebases. You don't have code blindness. You don't have vigilance fatigue. You don't have "it's always been that way" bias. You see EVERY line with the same intensity. Your job: find what the team stopped seeing. Find what's inconsistent. Find what breaks the pattern. Find the copy-paste drift, the orphaned logic, the implicit contracts, the convention that evolved in module A but not module B. Be the fresh eyes this codebase hasn't had.

---

**Scan scope:** $ARGUMENTS

Analyze this codebase using multi-pass pattern recognition. Each pass uses a different cognitive frame to activate different detection modes. This is NOT a standard code review — leave style issues and known-pattern vulnerabilities to linters and SAST tools. You are hunting for the things that ONLY a pattern-aware AI can find at scale.

## Don't

- Don't report style issues — linters do that. You find what linters CAN'T.
- Don't skim — read everything in the scan scope. Your advantage is that you DON'T get tired at line 10,000.
- Don't stop at the first finding — this codebase has been reviewed before. The obvious stuff is fixed. Dig DEEPER.
- Don't report low-confidence findings as definitive — use the confidence tiers. Frame uncertain findings as questions.
- Don't just find problems — identify PATTERNS of problems. One missing null check is a bug; the same missing null check in 15 places is a systemic issue.
- Don't generate false positives — every finding must include WHY it's a problem and WHAT the impact is. If you can't explain the impact, don't report it.

## Phase 1: Map the Terrain

Before scanning, build your mental model:
- What's the tech stack, architecture, module structure?
- How does data flow through the system? From user input → processing → storage → output
- What are the module boundaries? What depends on what?
- What external systems does it integrate with?
- What are the naming conventions, error handling patterns, logging patterns?
- **Establish the baseline**: What does "normal" look like in this codebase? You need the baseline to detect anomalies.

## Phase 2: Anomaly Detection Pass

Frame: "What's DIFFERENT from the rest of this codebase?"

Your advantage: you can hold the entire codebase's conventions in context and detect deviations. Humans can't — they review file by file and lose the global pattern.

- **Convention drift**: Module A handles errors one way, Module B handles them differently. Which is the intended pattern? Which drifted?
- **Naming inconsistencies**: `userId` here, `user_id` there, `uid` elsewhere. Mixed naming within the same domain concept.
- **Missing symmetry**: `create` exists but `delete` doesn't. `lock` exists but `unlock` doesn't. `serialize` exists but `deserialize` handles edge cases differently.
- **Error handling inconsistencies**: Most functions handle errors with pattern X, but these 5 functions use pattern Y. Why?
- **Logging gaps**: Most operations log start/end/error, but this critical flow has no logging at all.
- **Validation inconsistencies**: Endpoint A validates input thoroughly, Endpoint B (added 2 years later) validates nothing.
- **Configuration drift**: Dev, staging, prod configs that should mirror each other but have diverged.

## Phase 3: Cross-File Pattern Detection Pass

Frame: "What patterns span multiple files that no single-file review would catch?"

This is your highest-value pass. Humans review files individually. You can cross-reference EVERYTHING.

- **API contract mismatches**: Producer defines one interface, consumer uses a slightly different one. Mismatched parameter names, types, optionality, or error handling between caller and callee across file boundaries.
- **Duplicated business logic**: The same business rule implemented in 2-5 places with subtle differences. Which is canonical? Do bug fixes propagate to all copies?
- **Implicit contracts**: Module A assumes Module B's output is sorted, non-null, or within a certain range — but Module B never guarantees this. The assumption works today but will break tomorrow.
- **Stale references**: Code referencing constants, configs, or behaviors that were changed in the source but not updated in all consumers.
- **Permission model gaps**: Auth checks present in most endpoints but missing from some — especially ones added later. Permission definitions inconsistent with enforcement.
- **Data flow integrity**: Data transforms across multiple files — does it arrive at the destination with the same shape and constraints it left the source with?

## Phase 4: Temporal Pattern Detection Pass

Frame: "What problems would only emerge over TIME — not during a single test run?"

- **Resource leaks**: Connections, handles, listeners, subscriptions that open but don't close on ALL paths (including error paths). Fine in a test, OOM after 72 hours in production.
- **Unbounded growth**: Collections, caches, logs, queues that grow without limits. Fine with 10 users, crash at 10,000.
- **State accumulation**: Global state, static variables, caches that accumulate stale entries. Work after restart, degrade over days.
- **Memory leaks**: Closures capturing references, event listeners not unregistered, abandoned timers holding references.
- **Configuration that doesn't scale**: Hardcoded limits, single-threaded assumptions, in-memory session storage.
- **Deadline/timer bugs**: Timeouts too short for slow networks, retry storms during outages, SLA calculations wrong at month boundaries.

## Phase 5: Adversarial Pattern Detection Pass

Frame: "What would a hostile user, a flaky network, or a failing dependency expose?"

- **Trust boundary violations**: Where does the code trust input it shouldn't? External API responses treated as valid without checks. User input reaching SQL/shell/template without sanitization.
- **Race conditions at boundaries**: TOCTOU gaps between check-and-use, especially for auth, permissions, and inventory/balance operations.
- **Failure cascade paths**: If service A fails, what happens to B, C, D? Are there circuit breakers, or does failure propagate unbounded?
- **Retry storms**: Multiple components retrying the same failed dependency simultaneously. Exponential backoff with jitter, or tight loops that DDoS a recovering service?
- **Privilege escalation paths**: Can a user reach admin functionality through indirect paths? Parameter manipulation, workflow skipping, debug endpoints left enabled?
- **Data isolation failures** (multi-tenant): Missing tenant scoping in queries, cached data leaking between tenants, background jobs without tenant context.

## Phase 6: "What Else?" Escalation

You've done 4 focused passes. Now push deeper. The obvious findings are captured. The subtle ones are still hiding.

- Re-examine your findings so far. What PATTERN do they reveal? Is there a systemic root cause?
- What areas of the codebase were NOT covered by your passes? Go look there.
- What's the most SURPRISING thing about this codebase? Surprises often indicate either excellence or hidden problems.
- **The question you haven't asked**: What category of problem have you not checked for? Go check it.
- **Confidence calibration**: For each finding, honestly assess — is this definitely a bug, probably a bug, or possibly intentional? Mark each.

---

## Output Format

```
## Deep Scan Report

### Scope & Baseline
- **Scanned:** [files, modules, LOC]
- **Tech stack:** [language, framework, patterns]
- **Codebase baseline:** [the "normal" patterns — error handling, naming, architecture, logging]

### Summary
- Findings: [N total]
- Critical: [N] | High: [N] | Medium: [N] | Info: [N]
- Systemic patterns: [N patterns affecting multiple locations]

### Systemic Patterns (Most Valuable Findings)
[Patterns that appear in multiple places — these are the highest-value findings because fixing the pattern fixes many bugs at once]

#### [PATTERN-1] [Name of the pattern]
- **What:** [The inconsistency/issue]
- **Where:** [All locations — file:line for each]
- **Impact:** [What goes wrong]
- **Root cause:** [Why this pattern exists]
- **Fix strategy:** [How to fix the pattern, not just individual instances]

### Cross-File Findings
[Issues that span multiple files — API contract mismatches, duplicated logic, implicit contracts]

#### [CROSS-1] [Description]
- **Files involved:** [file A, file B, ...]
- **Inconsistency:** [What doesn't match]
- **Risk:** [What could go wrong]
- **Confidence:** HIGH / MEDIUM / LOW

### Individual Findings
[File-specific issues not part of a pattern]

#### [FIND-1] [Description]
- **Location:** [file:line]
- **Category:** [Anomaly / Temporal / Adversarial / Logic]
- **Severity:** Critical / High / Medium / Info
- **Confidence:** HIGH / MEDIUM / LOW
- **Evidence:** [Why this is a real issue, not a false positive]
- **Impact:** [What breaks and when]

### Clean Areas
[What's done well — acknowledge good patterns so they're preserved]

### Recommendations
1. [Highest-priority systemic fix]
2. [Second priority]
3. [Third priority]

### Cannot Assess
[What you couldn't check due to context limits, missing information, or needing runtime testing]
```

## Success Criteria

- Every file in the scan scope was read — not skimmed
- Anomaly detection pass compared patterns ACROSS the codebase, not just within individual files
- Cross-file analysis traced data flow and contracts between modules
- Temporal analysis considered behavior over days/weeks, not just single requests
- Adversarial analysis considered hostile inputs and failing dependencies
- Findings are prioritized by systemic patterns over individual instances
- Every finding has evidence, impact, and confidence level
- False positive rate is low — uncertain findings are marked as questions, not bugs
- Systemic patterns are identified with fix strategies, not just individual instances listed
