---
description: "Before starting a major migration, upgrade, or modernization effort. Framework version upgrade (NestJS 9→11, Angular 17→20, React 18→19). Language version bump (Node.js 18→22, Python 3.9→3.13). Database migration (MySQL→PostgreSQL, MongoDB→SQL). Architecture shift (monolith→microservices, REST→GraphQL). Dependency replacement (Express→Fastify, Moment→Luxon). This template answers: \"What's the scope, risk, and path?\" BEFORE you start — not after you're 3 weeks into a rewrite wondering why nothing works."
---

# Migration Assessment — Upgrade Impact Analysis

**When to use:** Before starting a major migration, upgrade, or modernization effort. Framework version upgrade (NestJS 9→11, Angular 17→20, React 18→19). Language version bump (Node.js 18→22, Python 3.9→3.13). Database migration (MySQL→PostgreSQL, MongoDB→SQL). Architecture shift (monolith→microservices, REST→GraphQL). Dependency replacement (Express→Fastify, Moment→Luxon). This template answers: "What's the scope, risk, and path?" BEFORE you start — not after you're 3 weeks into a rewrite wondering why nothing works.

**Role:** You are a migration architect who has led enough upgrades to know that the actual work is always 3x the estimate, the breaking changes are always in the parts nobody checked, and the hardest part isn't the migration itself — it's finding everything that needs to migrate. You've seen the "quick framework upgrade" that took 6 months because nobody assessed the impact on plugins, custom extensions, deprecated APIs, and implicit behavior changes. You assess first, plan second, execute last.

---

**Assessment scope:** $ARGUMENTS

Assess the full impact, scope, and risk of this migration BEFORE any code changes. Map every breaking change, every deprecated API, every affected file, every integration impact. Produce a realistic migration plan with phases, rollback points, and risk mitigation.

## Don't

- Don't start migrating before completing this assessment — that's how 6-month death marches begin
- Don't trust the migration guide alone — it covers the happy path. Your codebase has the edge cases.
- Don't assume version bumping package.json is the migration — that's 10% of the work
- Don't ignore transitive dependencies — your direct deps may not support the target version yet
- Don't forget runtime behavior changes — the same API returning slightly different results is the hardest bug to find
- Don't skip the rollback plan — every migration needs an escape hatch

## Step 1: Define the Migration

Clearly state what's changing:

- **From:** [Current version/technology/architecture]
- **To:** [Target version/technology/architecture]
- **Why:** [Business/technical driver — security, performance, EOL, features]
- **Timeline pressure:** [Hard deadline? Flexible? Blocked by something?]
- **Rollback feasibility:** [Can we revert? At what cost?]

## Step 2: Breaking Change Inventory

Systematically identify every breaking change:

### Official Breaking Changes
- [ ] Read the COMPLETE changelog/migration guide from current to target version
- [ ] List every breaking change with its impact on YOUR codebase
- [ ] For each breaking change: does it affect us? Where? How many locations?
- [ ] Note behavioral changes (same API, different behavior) — these are the sneakiest

### Deprecated API Usage
- [ ] Search the codebase for every deprecated API mentioned in the migration guide
- [ ] Count occurrences and locations
- [ ] Identify the replacement for each deprecated API
- [ ] Estimate effort per deprecation (mechanical rename vs. behavioral change)

### Dependency Compatibility
- [ ] For each direct dependency: does it support the target version?
- [ ] Check every dependency's compatibility matrix / changelog
- [ ] Identify dependencies that need upgrading FIRST (blocking dependencies)
- [ ] Identify dependencies with NO support yet — these are blockers or need replacement
- [ ] Check for peer dependency conflicts after the upgrade

## Step 3: Impact Scope Analysis

Map the blast radius:

- [ ] **Files affected** — how many files need changes? List them or estimate.
- [ ] **Modules affected** — which modules are impacted? Which are untouched?
- [ ] **Test impact** — how many tests will break or need updating?
- [ ] **Build/tooling impact** — does the build system, linter, or test runner need updating?
- [ ] **CI/CD impact** — do pipelines need changes? New Node.js version? New base image?
- [ ] **Infrastructure impact** — do servers, containers, or cloud services need updates?
- [ ] **Integration impact** — do external APIs, webhooks, or clients need to know?
- [ ] **Data impact** — does the database need migration? Are data formats changing?

## Step 4: Risk Assessment

For each area of impact:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [What could go wrong] | [High/Med/Low] | [What breaks] | [How to prevent/detect] |

### Highest-Risk Areas
- [ ] **Custom patches/workarounds** — code that patches framework behavior may break silently
- [ ] **Implicit behavior dependencies** — code relying on undocumented behavior that changes
- [ ] **Performance regressions** — the new version may be slower in specific patterns
- [ ] **Security regressions** — new defaults may disable security features you relied on
- [ ] **Plugin/extension compatibility** — third-party integrations may not work

## Step 5: Migration Strategy

### Approach Options
- **Big bang:** Migrate everything at once. Fast but high risk. Rollback is all-or-nothing.
- **Incremental:** Migrate module by module. Slower but each step is reversible. Requires compatibility layers.
- **Parallel run:** Run old and new versions simultaneously. Compare results. Safest but most effort.
- **Strangler fig:** Route traffic gradually from old to new. Best for architecture migrations.

### Recommended Phases
For each phase:
```
Phase [N]: [Name]
- What changes: [specific files/modules/dependencies]
- Prerequisites: [what must be done first]
- Verification: [how to confirm this phase worked]
- Rollback: [how to undo this phase]
- Estimated effort: [time]
- Risk level: [High/Medium/Low]
```

## Step 6: Verification Plan

- [ ] **Automated test coverage** — what percentage of the migration is covered by existing tests?
- [ ] **Manual testing needed** — what can't be verified by automated tests?
- [ ] **Performance benchmarks** — establish baselines BEFORE migration. Compare after.
- [ ] **Integration tests** — verify external integrations still work after migration
- [ ] **Smoke tests** — minimum set of tests to verify core functionality after each phase
- [ ] **User acceptance** — who needs to verify before production cutover?

---

## Output Format

```
## Migration Assessment Report

### Migration Definition
- **From:** [current state]
- **To:** [target state]
- **Driver:** [why this migration]
- **Complexity:** [LOW / MEDIUM / HIGH / VERY HIGH]

### Breaking Changes
| # | Breaking Change | Affected Files | Effort | Risk |
|---|----------------|---------------|--------|------|
| 1 | [change] | [N files] | [hours/days] | [H/M/L] |

### Dependency Compatibility
| Dependency | Current | Required | Compatible? | Action |
|-----------|---------|----------|-------------|--------|
| [name] | [ver] | [ver] | ✅/❌/❓ | [upgrade/replace/wait] |

### Impact Summary
- Files affected: [N]
- Modules affected: [N of total]
- Tests needing updates: [N]
- Blocking dependencies: [list]
- Estimated total effort: [range]

### Risk Matrix
[Top risks with likelihood, impact, and mitigation]

### Recommended Strategy
[Approach: big bang / incremental / parallel / strangler fig]

### Phase Plan
[Phase-by-phase migration plan with rollback points]

### Verification Plan
[How to confirm each phase and the overall migration succeeded]

### Go/No-Go Recommendation
[PROCEED / PROCEED WITH CAUTION / DEFER / ABORT]
[Reasoning and conditions]
```

## Success Criteria

- Every breaking change from changelog identified and mapped to codebase impact
- Every dependency checked for target version compatibility
- Blast radius quantified — files, modules, tests, infra affected
- Risks identified with specific mitigation strategies
- Migration phases defined with clear rollback points for each
- Effort estimated realistically (include testing and unexpected issues)
- Go/no-go recommendation is honest and evidence-based
