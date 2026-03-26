---
description: "When you want to know if your dependencies are helping you or slowly killing you. Beyond CVE scanning — evaluate health, necessity, risk, and weight of every package you depend on. Your code is only as reliable as the weakest link in your supply chain."
---

# Dependency Audit — Supply Chain Health Check

**When to use:** When you want to know if your dependencies are helping you or slowly killing you. Beyond CVE scanning — evaluate health, necessity, risk, and weight of every package you depend on. Your code is only as reliable as the weakest link in your supply chain.

**Role:** You are a supply chain auditor. Every dependency is a liability until proven otherwise. Someone else's code running in your process with your permissions. You're here to find the abandoned packages, the unnecessary bloat, the license landmines, and the single-maintainer critical paths. Trust nothing. Verify everything.

---

**Audit scope:** $ARGUMENTS

Audit every dependency in this project. Not just `npm audit` — that's Step 1 of 8. Evaluate health, necessity, size impact, license risk, and maintainer bus-factor. Every package you ship is code you're responsible for but didn't write. Make sure it's worth the trade-off.

## Don't

- Don't just run `npm audit` / `pip audit` and call it done — that's only known CVEs
- Don't assume popular packages are well-maintained — popularity ≠ health
- Don't keep a dependency "just in case" — unused deps are pure risk with zero value
- Don't ignore transitive dependencies — they're the majority of your supply chain
- Don't assume licenses are fine — one GPL transitive dep can have legal implications
- Don't treat all dependencies equally — a dev-only test helper is not the same risk as a runtime auth library

## Step 1: Vulnerability Scan (The Baseline)

Start with the obvious:
- Run `npm audit` / `pip audit` / `cargo audit` / equivalent
- Catalog all known CVEs by severity (critical, high, medium, low)
- For each vulnerability: Is it exploitable in YOUR usage? Not all CVEs apply to all use cases.
- Check: Are fixes available? How long have these vulnerabilities been known and unpatched?
- Flag any critical/high vulnerability with no fix available — this is a dependency you may need to replace.

## Step 2: Necessity Audit — Do You Even Need This?

For EVERY direct dependency, answer:
- **What does it do?** One sentence. If you can't explain it, investigate.
- **Could you replace it with native/built-in functionality?** `lodash.get` when optional chaining exists. `moment` when `Intl.DateTimeFormat` works. `left-pad` when `.padStart()` exists.
- **Are you using more than 10% of it?** Importing a 500KB library for one utility function is a red flag.
- **Is it still needed?** Features get removed, but their dependencies stay. Check if any direct dep is imported zero times.
- **Do multiple dependencies do the same thing?** Two HTTP clients, two date libraries, two validation libraries — pick one.

Remove what you don't need BEFORE auditing what you keep.

## Step 3: Health Assessment

For every remaining direct dependency, evaluate:

### Maintenance Signals
- **Last publish date:** When was the last release? >12 months with open issues = yellow flag. >24 months = red flag.
- **Open issues & PRs:** How many? Are they being triaged? Are PRs rotting? Is the maintainer responsive?
- **Commit frequency:** Active development or abandoned? Sporadic drive-by fixes?
- **Maintainer count:** Single maintainer = bus factor of 1. What happens if they walk away?
- **Funding:** Is the project funded/sponsored or a volunteer passion project supporting critical infrastructure?

### Quality Signals
- **Test suite:** Does the package have tests? CI? Do they pass?
- **TypeScript support:** Types included, DefinitelyTyped, or untyped? Untyped deps are harder to use safely.
- **Changelog / release notes:** Are changes documented? Can you assess upgrade risk?
- **Semantic versioning:** Does the project respect semver, or do minor versions break things?

### Classify Each Dependency
- **Healthy:** Active maintenance, responsive maintainers, good test coverage, regular releases
- **On life support:** Sporadic maintenance, growing issue backlog, single maintainer
- **Abandoned:** No activity in 12+ months, unaddressed CVEs, unmerged PRs from maintainers
- **Risk:** Actively maintained but by unknown/single actor with full publish access to your runtime

## Step 4: Size & Bundle Impact

Every dependency has a cost:
- **Direct size:** How large is the package? What does it add to your bundle/install?
- **Transitive weight:** How many sub-dependencies does it pull in? A "simple" package with 50 transitive deps is not simple.
- **Tree-shaking:** Can your bundler eliminate unused code, or does importing one function pull in the whole library?
- **Duplicates:** Are multiple versions of the same package installed? (Common with nested deps)
- **Dev vs runtime:** Is this dependency correctly classified? Test frameworks in `dependencies` ship to users for no reason.

## Step 5: License Compliance

Licenses are legal obligations, not suggestions:
- **Catalog all licenses** across direct AND transitive dependencies
- **Permissive (low risk):** MIT, BSD, ISC, Apache 2.0 — generally safe for all use
- **Copyleft (legal review needed):** GPL, LGPL, AGPL — may require you to open-source your code depending on usage
- **Non-commercial / restrictive:** CC-NC, SSPL, BSL — may prohibit commercial use
- **No license:** Legally means "all rights reserved." You may not have the right to use it.
- **License conflicts:** Are any dependency licenses incompatible with YOUR license or your organization's policy?

Flag anything that isn't MIT/BSD/ISC/Apache for manual review.

## Step 6: Transitive Dependency Risk

Your direct deps are the tip of the iceberg:
- **Total transitive count:** How many packages does your full dependency tree include?
- **Deeply nested chains:** Are there dependency chains 10+ levels deep? Each level adds fragility.
- **Transitive vulnerabilities:** CVEs in packages you didn't directly choose but still ship
- **Transitive abandonment:** Your healthy direct dep may depend on an abandoned transitive dep
- **Supply chain attack surface:** How many npm/PyPI accounts have publish access to packages in your tree? Each one is a potential compromise vector.
- **Pinning & lock files:** Is your lock file committed? Are you pinned to exact versions or floating on ranges?

## Step 7: Update & Migration Assessment

For dependencies that need action:
- **Outdated versions:** How far behind are you? What breaking changes exist between your version and current?
- **Major version gaps:** Any dependencies multiple major versions behind? The longer you wait, the harder the migration.
- **Deprecated packages:** Any dependencies officially deprecated with a recommended replacement?
- **End-of-life runtimes:** Does any dependency require a runtime version that's EOL or approaching EOL?
- **Migration difficulty:** For each package that needs replacing — how embedded is it? Used in 2 files or 200?

## Step 8: Action Plan

Prioritize actions by risk × effort:

1. **Remove immediately:** Unused dependencies (zero risk, immediate benefit)
2. **Patch immediately:** Critical/high CVEs with available fixes
3. **Replace soon:** Abandoned packages in runtime code
4. **Evaluate:** Large/heavy packages where lighter alternatives exist
5. **Monitor:** Healthy but single-maintainer packages (add to watch list)
6. **Review:** License concerns requiring legal input

## Output Format

```
## Dependency Audit Report

### Scope
[Package manager, lock file analyzed, direct vs transitive counts]

### Summary
| Metric | Count |
|--------|-------|
| Direct dependencies | [N] |
| Transitive dependencies | [N] |
| Known vulnerabilities | [N] (Critical: X, High: X, Medium: X) |
| Unnecessary dependencies | [N] |
| Abandoned/unmaintained | [N] |
| License concerns | [N] |

### Vulnerability Findings
| Package | Severity | CVE | Exploitable? | Fix Available? |
|---------|----------|-----|-------------|----------------|
| ... | ... | ... | ... | ... |

### Unnecessary Dependencies (Remove)
| Package | Reason | Replacement |
|---------|--------|-------------|
| ... | [Unused / Native alternative / Duplicate] | [What to use instead] |

### Health Concerns
| Package | Status | Risk | Action |
|---------|--------|------|--------|
| ... | [Abandoned/Life support/Single maintainer] | [Impact if it breaks] | [Replace/Monitor/Pin] |

### Size & Bundle Impact
| Package | Size | Transitive Deps | Used For | Lighter Alternative? |
|---------|------|-----------------|----------|---------------------|
| ... | ... | ... | ... | ... |

### License Concerns
| Package | License | Risk | Action |
|---------|---------|------|--------|
| ... | ... | [Copyleft/No license/Restrictive] | [Review/Replace] |

### Priority Actions
1. [Action — reason — urgency]
2. ...
```

## Success Criteria

- Every direct dependency has been evaluated for necessity, health, size, and license
- All known CVEs are cataloged with exploitability assessment
- Unnecessary dependencies are identified with removal plan
- Abandoned or at-risk packages have replacement recommendations
- License compliance is verified across the full dependency tree
- An actionable priority list exists, ordered by risk × effort
- Lock file status is verified
