---
description: "When you need to go beyond \"we have tech debt\" to a systematic map of what the debt IS, where it hurts most, and what to pay down first. Not finding problems (code-review does that) — this is about measuring, prioritizing, and building an actionable paydown roadmap. Use quarterly, before planning cycles, or when velocity has noticeably slowed."
---

# Tech Debt Analysis — Map, Measure & Prioritize

**When to use:** When you need to go beyond "we have tech debt" to a systematic map of what the debt IS, where it hurts most, and what to pay down first. Not finding problems (code-review does that) — this is about measuring, prioritizing, and building an actionable paydown roadmap. Use quarterly, before planning cycles, or when velocity has noticeably slowed.

**Role:** You are a senior engineer who treats tech debt like financial debt — it has principal (effort to fix), interest (ongoing cost of not fixing), and risk (probability of causing an incident). You don't just find debt, you quantify it, prioritize it by business impact, and build a roadmap that engineering and product can align on. You know that "rewrite everything" is almost never the answer, and that strategic, incremental paydown beats heroic rewrites.

---

**Analysis scope:** $ARGUMENTS

Map, measure, and prioritize the technical debt in this codebase. Every hour spent fighting the codebase is interest on unpaid debt. Every incident caused by fragile code is a risk that materialized. Don't just list problems — quantify impact, rank by pain, and deliver a roadmap.

## Don't

- Don't just list problems — everything is a problem if you squint. Prioritize by actual business impact
- Don't propose a rewrite — rewrites fail. Propose incremental strangler fig migrations for large debt
- Don't measure only code quality — test debt, documentation debt, dependency debt, and infrastructure debt count
- Don't optimize for coverage numbers — a codebase with 90% test coverage and zero tests on the auth system has critical test debt
- Don't ignore developer experience — "what slows you down?" is the most powerful debt signal
- Don't confuse "old" with "debt" — old, stable code that works is not debt. Frequently-changed, complex code that causes bugs IS debt

## Step 1: Hotspot Analysis

The files that change most often AND are most complex are where debt hurts most. This is the highest-signal analysis.

- [ ] **Generate churn report** — top 50 most-changed files in the last 6-12 months (`git log --format=format: --name-only --since=12.month | sort | uniq -c | sort -nr`)
- [ ] **Measure complexity** — cyclomatic complexity for top-churn files. Functions >10, files >50
- [ ] **Plot churn vs. complexity** — files in the top-right quadrant (high churn + high complexity) are priority targets
- [ ] **Filter false positives** — auto-generated files, config files, changelogs, lock files
- [ ] **Identify temporal coupling** — files that always change together but shouldn't (hidden dependency)
- [ ] **Identify God files** — files with >300 lines that appear in >10% of commits

## Step 2: Dependency Debt

Every outdated dependency is interest accruing. Every EOL framework is a ticking time bomb.

- [ ] **Inventory all direct dependencies** — current version vs. latest version
- [ ] **Flag anything >2 major versions behind** — frameworks and security libraries especially
- [ ] **Identify EOL runtimes and frameworks** — check against endoflife.date
- [ ] **Check for deprecated API usage** — compiler warnings, linter rules flagging deprecated calls
- [ ] **Map transitive dependency tree** — identify diamond dependency conflicts
- [ ] **Assess upgrade difficulty** — for each flagged dependency: is there a clear upgrade path, or is it a rewrite?
- [ ] **Run vulnerability scans** — `npm audit`, `pip audit`, `cargo audit`, Snyk. Count critical/high CVEs

## Step 3: Architecture Debt

The most painful and most expensive debt. Cross-cutting, requires multiple stakeholders, slows everything.

- [ ] **Generate module dependency graph** — identify circular dependency clusters
- [ ] **Document intended layering** — controller → service → repository → DB. Scan for violations
- [ ] **Identify God modules** — modules with too many dependencies, too many dependents, too many lines
- [ ] **Check for distributed monolith** — services that share databases, must deploy together, or have synchronous call chains
- [ ] **Find missing abstractions** — business logic duplicated across modules instead of extracted
- [ ] **Find leaky abstractions** — modules reaching into another module's internals

## Step 4: Test Debt

Missing tests create a vicious cycle: no tests → fear of changes → no refactoring → more debt.

- [ ] **Coverage overlaid with hotspot data** — low coverage on high-churn files is the worst combination
- [ ] **Critical business paths have integration tests** — auth, payments, data validation, core workflows
- [ ] **Identify fake tests** — empty test bodies, trivial assertions (`toBeTruthy()`), no assertions at all
- [ ] **Identify flaky tests** — track pass/fail rates over last 100 CI runs. <99% pass rate = flaky
- [ ] **Measure suite execution time** — flag suites >10 minutes. Slow suites = developers stop running them
- [ ] **Test-production parity** — test databases, queues, caches configured like production?

## Step 5: Documentation & Infrastructure Debt

### Documentation Debt
- [ ] **README accuracy** — does it match current state? Can a new dev go from zero to running in <1 day using only docs?
- [ ] **Architecture Decision Records** — do significant past decisions have documented rationale? Or is it tribal knowledge?
- [ ] **Bus factor = 1 knowledge** — systems only one person understands
- [ ] **Runbooks exist** for top 5 incident categories — and are current
- [ ] **API docs match reality** — OpenAPI/Swagger vs. actual endpoints

### Infrastructure Debt
- [ ] **Manual deployment steps** — anything that requires SSH or manual commands
- [ ] **Missing CI stages** — no linting? No security scanning? No integration tests?
- [ ] **No staging environment** — changes go from dev to production
- [ ] **Configuration drift** — actual infrastructure state diverges from what's defined in code
- [ ] **Secrets in code or shared env files** — not in a vault

## Step 6: Measure & Quantify

Turn vague "we have debt" into numbers that product and engineering can align on.

### Per-Item Quantification
For each significant debt item, estimate:
- [ ] **Principal** — effort to fix (engineer-days)
- [ ] **Interest** — ongoing cost of NOT fixing (hours/sprint spent working around it, incident frequency)
- [ ] **Risk** — probability × severity of causing an incident or blocking a business initiative (1-5 × 1-5 = risk score)

### Codebase-Level Metrics
- [ ] **Tech Debt Ratio** — (remediation cost / development cost) × 100. Under 5% = healthy, over 20% = critical
- [ ] **Lead time for changes** — increasing lead time often signals growing debt
- [ ] **Deployment frequency** — decreasing frequency signals infrastructure or test debt
- [ ] **MTTR** — high mean time to recovery signals documentation and infrastructure debt
- [ ] **Developer experience** — "On a scale of 1-5, how much does the codebase slow you down?"

## Step 7: Prioritize

Not all debt is equal. Prioritize by business impact, not engineering aesthetics.

### Impact/Effort Matrix
- [ ] **Quick wins** (high impact, low effort) — do first. Auto-format, add missing indexes, delete dead code
- [ ] **Strategic investments** (high impact, high effort) — plan and schedule. Architecture refactors, framework upgrades
- [ ] **Fill-in work** (low impact, low effort) — do when convenient. Minor cleanups, comment improvements
- [ ] **Avoid** (low impact, high effort) — reconsider if needed at all

### Prioritization Factors
- [ ] **Blast radius** — how many teams/features are affected?
- [ ] **Interest rate** — how much time is lost per sprint to this debt?
- [ ] **Risk** — what's the probability and severity of an incident?
- [ ] **Business alignment** — does paying this down unblock a planned feature?
- [ ] **Cost of delay** — what happens if we don't fix this for another 6 months?

## Step 8: Build the Roadmap

### Allocation Strategy
- [ ] **Baseline: 15-20% of sprint capacity** for debt work (Shopify uses 25%: 5% daily + 10% weekly + 5% monthly + 5% yearly)
- [ ] **High-debt state: 30-40%** temporarily to course-correct
- [ ] **Boy Scout Rule always on** — every PR leaves the code slightly better
- [ ] **Strangler Fig for large debt** — gradually build new around old, route incrementally, remove old when zero consumers
- [ ] **No big bang rewrites** — they almost always fail or take 3x longer than estimated

### Tracking
- [ ] **Debt items on the board** — visible alongside feature work, not hidden in a backlog
- [ ] **Monthly snapshots** of key metrics — are hotspots shrinking? Is debt ratio improving?
- [ ] **Celebrate paydown** — track and communicate debt reduction progress

## Output Format

```
## Tech Debt Analysis Summary
- **Scope:** [Codebase areas analyzed]
- **Overall Health:** [HEALTHY / MANAGEABLE / CONCERNING / CRITICAL]
- **Tech Debt Ratio:** [N% — remediation cost / development cost]

## Hotspot Map
| File | Churn (commits) | Complexity | Risk | Action |
|------|----------------|------------|------|--------|
| ... | ... | ... | ... | ... |

## Debt Inventory

### Critical Debt (Pay Now)
- [Item, principal, interest, risk score, recommended action]

### Strategic Debt (Plan & Schedule)
- [Item, principal, interest, risk score, recommended action]

### Low-Priority Debt (When Convenient)
- [Item, principal, interest, risk score]

## Debt by Category
| Category | Item Count | Total Principal | Avg Risk |
|----------|-----------|----------------|----------|
| Architecture | ... | ... | ... |
| Dependency | ... | ... | ... |
| Test | ... | ... | ... |
| Documentation | ... | ... | ... |
| Infrastructure | ... | ... | ... |

## Paydown Roadmap
### Month 1 (Quick Wins)
- [Action items with estimated effort]

### Month 2-3 (Strategic)
- [Action items with estimated effort]

### Month 4-6 (Long-term)
- [Action items with estimated effort]

## Recommended Allocation
- Sprint capacity for debt: [N%]
- Review cadence: [Monthly/Quarterly]
```

## Success Criteria

- Hotspot analysis complete — top-churn × high-complexity files identified and ranked
- Dependency debt inventoried — EOL frameworks, outdated libraries, known CVEs counted
- Architecture debt mapped — circular dependencies, layering violations, God modules identified
- Test debt assessed — coverage gaps on critical paths, fake tests, flaky tests quantified
- Every significant debt item has principal (effort), interest (ongoing cost), and risk (incident probability) estimates
- Debt is prioritized by business impact, not engineering aesthetics
- A concrete paydown roadmap exists with monthly milestones and % allocation recommendation
- Metrics baseline established for tracking improvement over time
