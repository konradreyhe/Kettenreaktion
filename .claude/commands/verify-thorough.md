---
description: "When you need to be 100% sure. No assumptions. No \"it should work.\" Prove it — or prove it WRONG. Use this to verify any claim, behavior, plan, assumption, or implementation. Works for code, architecture decisions, AI reasoning, debugging hypotheses — anything that needs to be TRUE."
---

# Verify — 7-Layer Falsification Stack

**When to use:** When you need to be 100% sure. No assumptions. No "it should work." Prove it — or prove it WRONG. Use this to verify any claim, behavior, plan, assumption, or implementation. Works for code, architecture decisions, AI reasoning, debugging hypotheses — anything that needs to be TRUE.

**Role:** You are a verification engine combining the rigor of NASA IV&V, the adversarial mindset of a CIA red team analyst, and the falsification discipline of a scientist. Your job is NOT to confirm something works. Your job is to TRY TO BREAK IT and report what survived. Trust nothing. Verify everything. If you can't break it, THEN it's verified.

---

**Verify:** $ARGUMENTS

Verify this with absolute thoroughness using all 7 independent verification layers. Each layer catches different categories of defects. Skipping any layer leaves a blind spot. Every layer starts from the falsification mindset: try to DISPROVE before confirming.

## Don't

- Don't trust docs over code — code is the source of truth
- Don't declare "verified" without actually running it
- Don't skip edge cases because the happy path works
- Don't inflate your confidence level — be honest about unknowns
- Don't verify only what you expect to pass — actively look for failures
- Don't collapse layers — each one must be done independently
- Don't trust your own earlier reasoning — each layer is a fresh perspective
- Don't confirm when you should falsify — try to BREAK IT first

## The 7-Layer Falsification Stack

Each layer is independent. Complete ALL seven. Document findings per layer. Start each layer by trying to DISPROVE the claim, not confirm it.

---

### Layer 0: Assumptions & Invariants (THE FOUNDATION)

Before checking ANYTHING, surface what's being assumed. This is the layer most verification misses entirely. Hidden assumptions are the #1 source of verification failures.

- **List every assumption** this code/plan/decision makes — implicit and explicit. What does it assume about inputs, environment, state, timing, dependencies, user behavior?
- **Identify invariants** — what MUST always be true for this to be correct? State them explicitly. ("User ID is never null at this point." "This list is always sorted." "The database connection is always available.")
- **Challenge each assumption**: What if this assumption is WRONG? What breaks? How likely is that?
- **Pre-mortem**: Imagine this has already FAILED in production. It's 3am. Something went catastrophically wrong. Work backward — what went wrong? What assumption was violated? What scenario did nobody consider?
- **Validate vs Verify**: Are we building the RIGHT thing (validation), not just building it right (verification)? Does this actually solve the problem it's supposed to solve?

### Layer 1: Logical Verification

Does this make logical sense in isolation? Apply falsification: try to construct a logical counterexample.

- Read the code/plan line by line. Does each step follow from the previous?
- Are there logical contradictions, dead branches, or impossible states?
- Do the data types, ranges, and transformations make mathematical sense?
- Are conditionals exhaustive? Draw the truth table for complex conditions. Are there missing cases?
- **State the invariant this code must maintain.** Does every path preserve it?
- **Construct a counterexample** — what input or state would make the logic fail? If you can't construct one, explain why it's impossible, not just unlikely.

### Layer 2: Contextual Verification

Does this fit correctly within the larger system? Fresh eyes — pretend you've never seen this codebase.

- Does it follow the project's established patterns and conventions?
- Does it integrate correctly with adjacent code (callers, callees, data flow)?
- Are imports, dependencies, and configurations correct for this environment?
- Does it respect architectural boundaries (layers, modules, domains)?
- **Cross-reference**: Does the implementation match the docs? The tests? The requirements? Contradictions between these are findings.
- **Anomaly detection**: What looks DIFFERENT from the rest of the codebase? Inconsistencies are either bugs or intentional deviations — determine which.

### Layer 3: Completeness Verification

Does this handle everything it needs to? Enumerate paths exhaustively.

- **Happy path** — does the normal case work correctly?
- **Error paths** — what happens when things fail? Graceful or crash?
- **Edge cases** — empty inputs, null values, boundary conditions, off-by-one, MAX_INT, NaN, negative values, Unicode, extremely long strings
- **State transitions** — does it handle unexpected states? States with no exit?
- **Concurrency** — race conditions, TOCTOU, deadlocks, ordering dependencies (if applicable)
- **Auth/permissions** — unauthorized access, privilege escalation (if applicable)
- **What's NOT there?** — What case is conspicuously missing? What would a new team member ask about?

### Layer 4: Empirical Verification (TEST IT)

Don't just read — RUN IT. Reading is hypothetical; running is proof.

- Run existing tests. Do they pass?
- **Test with realistic data**, not toy examples. Production-like inputs, production-like volume.
- Test negative cases explicitly — what should FAIL does fail, what should REJECT does reject
- Test AFTER your change, not just the change itself — regression
- **Produce verification artifacts**: pass/fail test results, actual output vs expected output, screenshots, logs. Artifacts don't lie; judgment does.
- Cross-reference: implementation ↔ docs, tests ↔ requirements, config ↔ environment

### Layer 5: Adversarial Verification (BREAK IT)

Switch mindset completely. You are now an attacker, a chaos engineer, a hostile user. Your ONLY goal is to make this fail.

- **Red Team**: How would you exploit this? What's the most creative abuse scenario?
- **Devil's Advocate**: Make the STRONGEST possible argument that this is wrong. Steel-man the counterargument.
- **Chaos scenarios**: What happens when dependencies fail? Network drops? Database is slow? Disk is full? Memory is exhausted?
- **Hostile inputs**: What's the most malicious input you can construct? SQL injection, XSS, oversized payloads, null bytes, path traversal
- **Abuse cases**: How would a malicious user misuse this feature? Not just "does it work?" but "can it be weaponized?"
- **Timing attacks**: What happens under load? With concurrent requests? With slow clients?

### Layer 6: Meta-Verification (VERIFY THE VERIFICATION)

The hardest layer. Question your own verification process.

- **Blind spots**: What could your verification have missed? What types of bugs would slip through your other 6 layers?
- **Mutation test (thought experiment)**: If someone deliberately introduced a subtle bug, would your layers catch it? What kind of bug would they miss?
- **AI self-verification check**: If YOU (the AI) generated the thing being verified, your biases carry over. Flag this explicitly. What would a DIFFERENT approach look like? Would a different model disagree?
- **Consider the opposite**: What if the conclusion of your verification is WRONG? What evidence would you expect to see?
- **What would change your mind?** If your current conclusion is "verified" — what single finding would flip it to "failed"? Go look for that specific thing.
- **External grounding**: Is this verification grounded in artifacts (test results, actual output) or just reasoning? If just reasoning, downgrade confidence.

---

## Output Format

```
## Verification Target
[What was verified, why, and what the claim/expectation is]

## Layer 0: Assumptions & Invariants
- Assumptions surfaced: [list every assumption found]
- Invariants identified: [list every invariant]
- Pre-mortem findings: [what could go wrong]
- Validation check: [is this the right thing to build?]

## Layer 1: Logical ✅/❌
[Findings — specific evidence, counterexamples attempted]

## Layer 2: Contextual ✅/❌
[Findings — system fit, pattern compliance, anomalies detected]

## Layer 3: Completeness ✅/❌
[Findings — paths tested, edge cases checked, what's missing]

## Layer 4: Empirical ✅/❌
[Findings — what was run, actual output, verification artifacts]

## Layer 5: Adversarial ✅/❌
[Findings — attack scenarios tried, abuse cases, chaos results]

## Layer 6: Meta-Verification ✅/❌
[Findings — blind spots identified, mutation test results, AI bias check]

## Issues Found
[What failed verification — exact problem, where, impact, and severity]

## Cannot Verify
[What you couldn't confirm and what's needed to verify it]

## Confidence: [HIGH / MEDIUM / LOW]
- Layers passed: [X/7]
- HIGH = all 7 layers pass, evidence-backed, grounded in artifacts, no unknowns
- MEDIUM = 5-6 layers pass, or minor unknowns remain
- LOW = 4 or fewer layers pass, multiple unknowns, or based on reasoning alone without artifacts
[Your honest assessment with reasoning — if in doubt, round DOWN]
```

## Success Criteria

- All 7 layers completed independently with specific evidence
- Layer 0 surfaced assumptions and invariants BEFORE any checking began
- Every claim backed by evidence (code read, test run, output observed)
- Falsification attempted at every layer — not just confirmation
- Adversarial scenarios actually tried, not just imagined
- Meta-verification questioned the verification itself
- Confidence level is honest and grounded in artifacts, not optimistic reasoning
- Issues found include exact location, reproduction steps, and severity
