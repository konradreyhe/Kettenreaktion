---
description: "When you want to know if your project follows current best practices for its tech stack, use case, and security posture. When you're starting a new project and want to get it right from day one. When you suspect your approach is outdated or suboptimal but don't know what \"good\" looks like."
---

# Best Practices Deep Research

**When to use:** When you want to know if your project follows current best practices for its tech stack, use case, and security posture. When you're starting a new project and want to get it right from day one. When you suspect your approach is outdated or suboptimal but don't know what "good" looks like.

**Role:** You are a senior technical consultant who specializes in tech stack evaluation, use case optimization, and security hardening. Your job is to deeply research what the best-in-class approach looks like for THIS specific project — not generic advice, but targeted, evidence-based recommendations grounded in what the ecosystem actually recommends today.

---

**Research best practices for:** $ARGUMENTS

You are here to answer three questions with depth and precision:
1. **Tech Stack** — Are we using the right tools, and are we using them correctly?
2. **Use Case** — Does our approach match proven patterns for what we're building?
3. **Security** — Are we exposed, and what should we harden?

## Don't

- Don't give generic advice — everything must be specific to THIS project's stack and context
- Don't recommend trendy tools without justification — proven > popular
- Don't skip reading the actual codebase — your recommendations must be grounded in what exists
- Don't just list problems — provide concrete solutions with code-level guidance
- Don't conflate "different" with "better" — only recommend changes that genuinely improve things
- Don't ignore the project's scale — enterprise patterns for a small CLI tool is malpractice

## Step 1: Understand What We Have

Before researching what's "best," understand what's HERE:

- Read project docs, README, CLAUDE.md, package.json / requirements / Cargo.toml / etc.
- Identify the full tech stack: language, framework, runtime, dependencies, build tools, CI/CD
- Map the architecture: how components connect, data flows, entry points
- Check dependency versions — are we on current? Are there known issues?
- Understand the use case: what does this project DO, for WHOM, at what SCALE?
- Read the actual code — at least the core files. Understand the patterns in use.

## Step 2: Research Tech Stack Best Practices

For EACH major technology in the stack, research:

**Language & Runtime:**
- Current recommended version and why
- Language-specific idioms we're missing or misusing
- Performance patterns specific to this runtime
- Recommended project structure and conventions

**Framework & Libraries:**
- Are we using the framework as intended, or fighting it?
- Deprecated patterns we're still using
- Built-in features we're reimplementing manually
- Recommended middleware, plugins, or extensions we're missing
- Configuration best practices (defaults we should change)

**Dependencies:**
- Outdated deps with security or performance implications
- Dependencies that have better alternatives now
- Missing dependencies that would prevent reinventing wheels
- Dependency health: maintained? active? security track record?

**Build & Dev Tooling:**
- Linting, formatting, type checking — are we using the right tools?
- Build optimization opportunities
- Dev experience improvements (hot reload, debugging, etc.)

## Step 3: Research Use Case Best Practices

What do mature, well-built projects like ours do?

**Architecture Patterns:**
- What architecture patterns are recommended for this type of project?
- Are we following them? Where do we deviate, and is that intentional?
- What patterns would make the codebase more maintainable?

**API & Interface Design:**
- Are our interfaces (CLI, API, UI) following conventions users expect?
- Error handling patterns — are we doing it the way the ecosystem recommends?
- Input validation approach — is it robust enough for our use case?

**Data & State Management:**
- How should data flow through a project like this?
- Are we storing/caching things appropriately?
- File formats, serialization, configuration — are we using the right approaches?

**Testing Strategy:**
- What testing approach does the ecosystem recommend for this type of project?
- What should we be testing that we aren't?
- Are our test patterns idiomatic for the stack?

**Documentation & DX:**
- What do well-maintained projects in this space document?
- Are we missing standard docs (CONTRIBUTING, CHANGELOG, API docs)?

## Step 4: Research Security Best Practices

Systematically assess security posture against current recommendations:

**Input & Data:**
- Input validation — are all entry points sanitized?
- Injection risks (SQL, command, path traversal, template injection)
- Data serialization/deserialization safety
- File handling security (temp files, permissions, symlink attacks)

**Authentication & Authorization:**
- Are secrets handled correctly? (env vars, not hardcoded, not logged)
- API key management best practices for this stack
- Auth patterns if applicable — are they current?

**Dependencies & Supply Chain:**
- Known vulnerabilities in current deps (run audit tools)
- Lock file present and committed?
- Are we pulling from trusted sources?
- Pinned versions vs floating — what's appropriate here?

**Runtime Security:**
- Are we following the principle of least privilege?
- Error messages — do they leak internal details?
- Logging — are we accidentally logging sensitive data?
- HTTPS/TLS configuration if applicable

**Stack-Specific Security:**
- What are the OWASP-equivalent risks for THIS specific stack?
- What security headers, configs, or flags should be set?
- What are the common security mistakes for this framework?

## Step 5: Gap Analysis

Compare current state vs. best practices:

| Area | Current State | Best Practice | Gap | Priority |
|------|--------------|---------------|-----|----------|
| ... | ... | ... | ... | Critical/High/Medium/Low |

Categorize each gap:
- **Critical** — Security risk or major anti-pattern. Fix now.
- **High** — Significant deviation from best practices. Fix soon.
- **Medium** — Room for improvement. Plan for it.
- **Low** — Nice to have. Backlog it.

## Step 6: Actionable Recommendations

For each finding, provide:
- **What** — the specific change
- **Why** — evidence-based reasoning (link to docs, advisories, benchmarks)
- **How** — concrete implementation guidance (not "add caching" but WHERE and WHAT to cache)
- **Effort** — realistic estimate (trivial / small / medium / large)
- **Risk of NOT doing it** — what happens if we skip this?

## Output Format

```
## Project Profile
[Stack summary, use case, scale, current maturity level]

## Tech Stack Assessment
### What's Good
[Practices already aligned with best practices — acknowledge these]
### Gaps Found
[Specific deviations with evidence]
### Recommendations
[Ordered by priority]

## Use Case Assessment
### What's Good
[Patterns already well-implemented]
### Gaps Found
[Where approach differs from proven patterns]
### Recommendations
[Ordered by priority]

## Security Assessment
### Current Posture
[Overall security health]
### Vulnerabilities & Risks
[Specific findings, rated by severity]
### Recommendations
[Ordered by priority]

## Priority Matrix
| # | Recommendation | Area | Priority | Effort | Impact |
|---|---------------|------|----------|--------|--------|
| 1 | ... | Tech/UseCase/Security | ... | ... | ... |

## Top 5 Actions
[The five most impactful changes, with concrete next steps]

## Sources
[Docs, advisories, benchmarks, and references consulted]
```

## Success Criteria

- The full tech stack was identified and each component researched against current best practices
- Use case patterns were compared against proven approaches in the ecosystem
- Security was assessed systematically, not just "looks fine"
- Every recommendation is specific, actionable, and grounded in evidence
- Gaps are prioritized by real impact, not theoretical purity
- The output gives a clear picture of where the project stands and what to do next
