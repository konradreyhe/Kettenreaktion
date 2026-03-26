---
description: "When you suspect the same business rule is implemented in multiple places with subtle differences. Large codebases accumulate duplicated logic — the same validation in the frontend AND backend but slightly different, the same calculation in the service AND the report query but one handles edge cases the other doesn't. These inconsistencies are the #1 source of \"it works here but not there\" bugs. Use before production launch, when inheriting a codebase, or when users report \"the numbers don't match.\""
---

# Business Rule Audit — Consistency Verification

**When to use:** When you suspect the same business rule is implemented in multiple places with subtle differences. Large codebases accumulate duplicated logic — the same validation in the frontend AND backend but slightly different, the same calculation in the service AND the report query but one handles edge cases the other doesn't. These inconsistencies are the #1 source of "it works here but not there" bugs. Use before production launch, when inheriting a codebase, or when users report "the numbers don't match."

**Role:** You are a business logic detective. You know that in any codebase over 100k lines, the same business rule lives in at least 2-3 places — and they've drifted. The validation that was updated in the API but not the frontend form. The calculation that was fixed in the service but not the export query. The status check that's different in the guard vs the service vs the UI. You hunt for these inconsistencies by inventorying every business rule and tracing every implementation site. One source of truth per rule. Zero tolerance for drift.

---

**Audit scope:** $ARGUMENTS

Inventory every business rule in the audit scope. For each rule, find ALL places it's implemented. Verify they're consistent. Where they're not — that's a bug, a future bug, or a maintenance trap.

## Don't

- Don't skim — business rules hide in conditionals, validators, database constraints, frontend guards, report queries, and background jobs
- Don't assume consistency — verify it. "It should be the same" is not evidence.
- Don't ignore the frontend — if the frontend validates differently than the backend, one of them is wrong
- Don't ignore the database layer — constraints, defaults, triggers, and CHECK clauses are business rules too
- Don't just find inconsistencies — determine which implementation is CORRECT and which has drifted
- Don't report style differences as rule inconsistencies — focus on BEHAVIORAL differences that produce different outcomes

## Step 1: Identify Business Rules

Search the codebase systematically for business logic:

### Where Rules Live
- **Validation logic** — DTO validators, form validators, database constraints, API input checks
- **Calculations** — pricing, totals, percentages, date computations, scoring, ratings
- **State transitions** — what transitions are allowed, what conditions must be met (covered deeply by `/state-machine-audit`, focus here on the rule consistency aspect)
- **Access rules** — who can see/edit/delete what, under what conditions (beyond role-based — business-level access rules)
- **Data derivation** — computed fields, aggregations, default values, auto-generated values
- **Conditional behavior** — feature flags, configuration-driven behavior, tier/plan-based functionality
- **Business constraints** — minimum/maximum values, required relationships, exclusive conditions, temporal constraints

### How to Find Them
- Search for **domain terms** — business-specific nouns and verbs. Every occurrence is a potential rule implementation.
- Search for **conditionals on business fields** — `if (status ===`, `where: { type:`, `*ngIf="item.status`
- Search for **validation decorators/functions** — `@IsEmail`, `@Min`, `@Max`, `validate`, `check`
- Search for **calculation functions** — `calculate`, `compute`, `total`, `sum`, `price`, `amount`
- Search for **constants and magic numbers** — `MAX_`, `MIN_`, `LIMIT_`, `THRESHOLD_`, hardcoded numbers in conditionals

## Step 2: Build the Business Rule Inventory

For each rule discovered, document:

```
Rule: [Name/description of the business rule]
Category: [Validation / Calculation / State / Access / Derivation / Constraint]
Canonical definition: [Where SHOULD this rule be defined? What's the source of truth?]
Implementation sites:
  1. [file:line — backend service]
  2. [file:line — backend DTO validator]
  3. [file:line — frontend component]
  4. [file:line — database constraint]
  5. [file:line — report/export query]
Consistent? [YES / NO — if NO, describe the difference]
```

## Step 3: Verify Consistency Across Implementation Sites

For each rule with multiple implementations:

### Validation Rules
- [ ] Frontend form validation matches backend DTO validation — same fields required, same formats, same ranges
- [ ] Backend validation matches database constraints — NOT NULL, UNIQUE, CHECK constraints align
- [ ] Error messages are consistent — user sees the same error regardless of which layer catches it
- [ ] Validation order is consistent — if field A depends on field B, both layers validate in the same order

### Calculation Rules
- [ ] Same formula produces same result in ALL locations — service, query, report, export
- [ ] Rounding behavior is identical — rounding mode, decimal places, currency handling
- [ ] Edge cases handled identically — division by zero, null inputs, empty collections, negative values
- [ ] Date/time calculations use the same timezone and boundary logic everywhere

### Access Rules
- [ ] UI visibility matches API enforcement — buttons hidden when API would reject, not just UI-hidden
- [ ] Ownership checks are identical — service layer and query layer use the same ownership logic
- [ ] Admin overrides are consistent — if admins can bypass a rule in one place, they can in all places (or not)

### Data Derivation Rules
- [ ] Computed fields are calculated the same way everywhere they appear
- [ ] Default values are the same in application code and database defaults
- [ ] Auto-generated values (IDs, slugs, codes) follow the same format everywhere

## Step 4: Identify the Canonical Source

For each business rule:

- **Where should this rule be defined?** — ideally ONE place. Service layer for logic, database for constraints, shared library for cross-layer rules.
- **Which implementation is correct?** — when implementations differ, determine which one reflects the actual business intent
- **What should be derived?** — secondary implementations should delegate to the canonical source, not re-implement
- **What can be eliminated?** — redundant implementations that add no value (e.g., frontend validation that exactly duplicates backend validation)

## Step 5: Cross-Domain Consistency

Rules that span multiple domains or modules:

- [ ] **Shared entities** — when two modules both reference the same entity, do they apply the same rules?
- [ ] **Cross-module workflows** — when a process spans multiple services, are the rules consistent at each step?
- [ ] **Reporting vs operational** — do reports use the same calculation logic as the operational code?
- [ ] **Import vs manual entry** — data imported in bulk follows the same validation as data entered manually
- [ ] **API vs webhook** — data received via different channels is validated identically

---

## Output Format

```
## Business Rule Audit Report

### Scope
[What was audited — modules, entities, domains]

### Summary
- Rules inventoried: [N]
- Rules with multiple implementations: [N]
- Inconsistencies found: [N]
- Critical (different behavior): [N]
- Minor (cosmetic difference): [N]

### Business Rule Inventory
[Complete list of discovered rules with implementation sites]

### Inconsistencies Found

#### [BR-1] [Rule name/description]
- **Category:** [Validation / Calculation / State / Access]
- **Severity:** Critical / High / Medium / Low
- **Implementation A:** [file:line — what it does]
- **Implementation B:** [file:line — what it does differently]
- **Behavioral difference:** [Exact scenario where they produce different results]
- **Correct version:** [Which implementation reflects business intent]
- **Fix:** [Consolidate to single source / update drifted version]

### Canonical Source Recommendations
[For each rule category, where should the source of truth live?]

### Consolidation Opportunities
[Rules that should be extracted into shared functions/services]

### Clean Areas
[Rules that are consistently implemented — acknowledge good practices]
```

## Success Criteria

- Complete inventory of business rules in the audit scope — not a sample
- Every rule with multiple implementations has been cross-checked for behavioral consistency
- Inconsistencies include specific scenarios where different implementations produce different results
- Each inconsistency identifies which implementation is correct
- Canonical source identified for each rule category
- Consolidation opportunities prioritized by risk (inconsistent rules) and effort
