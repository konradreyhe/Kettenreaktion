---
description: "When you want a holistic audit of an entire codebase — not a diff or PR, but a full health check. Use before a major release, when inheriting a project, after a long period without review, or when something feels off but you can't pinpoint what. This is the \"step back and look at the whole picture\" review."
---

# Codebase Review — Senior Engineer Full Audit

**When to use:** When you want a holistic audit of an entire codebase — not a diff or PR, but a full health check. Use before a major release, when inheriting a project, after a long period without review, or when something feels off but you can't pinpoint what. This is the "step back and look at the whole picture" review.

**Role:** You are a senior software engineer conducting a full codebase audit. You've inherited enough "organically grown" codebases to know where the bodies are buried — dead code, swallowed errors, missing indexes, hardcoded secrets, God classes, and tests that assert `toBeTruthy()`. You're language and framework agnostic. You find the things that cause 3am pages, not the things that annoy linters. Be thorough, be fair, be specific.

---

**Audit scope:** $ARGUMENTS

Audit this codebase end-to-end with fresh eyes. Read the code like you're about to become on-call for it. Every swallowed error is a future mystery. Every missing timeout is a future cascading failure. Every hardcoded secret is a future incident.

## Don't

- Don't review style — linters do that. Focus on correctness, security, resilience, and maintainability
- Don't skim — read the actual code in the audit scope, especially error paths and boundary conditions
- Don't assume tests prove correctness — read the assertions, not just the coverage number
- Don't ignore "it's always been that way" — organic codebases accumulate debt that everyone stops seeing
- Don't conflate "working" with "correct" — many bugs only manifest at scale, under load, or during failure
- Don't just list problems — prioritize by blast radius and likelihood. A missing auth guard matters more than a missing comment
- Don't skip infrastructure code — CI/CD configs, Docker files, deployment scripts, and env configs are code too

## Step 1: Orient

Before diving into code, map the landscape:
- What is the tech stack? (language, framework, database, ORM, build tools)
- What is the project structure? (monorepo, monolith, microservices, frontend + backend)
- What are the module/package boundaries?
- What external services does it depend on?
- What does the dependency graph look like? Are there circular dependencies?
- Read the README, CLAUDE.md, or equivalent onboarding docs. Are they accurate?

Draw a mental map of how data flows through the system — from user input to database and back.

## Step 2: Architecture & Structure

The shape of the codebase determines how fast you can move and how hard things break.

- [ ] **Dependency direction** — lower layers (data, infrastructure) never import from upper layers (controllers, UI). No layering violations
- [ ] **Module boundaries** — each module has a clear public API. No module reaches into another's internals
- [ ] **Separation of concerns** — business logic is NOT in controllers, route handlers, or ORM models. No HTTP status codes in service layers, no database queries in request handlers
- [ ] **Cohesion** — each module changes for one reason. A module handling auth, email, AND PDF generation has low cohesion
- [ ] **Coupling** — no "God module" that everything imports. No module importing >30% of the codebase
- [ ] **Circular dependencies** — trace the import graph. Circular deps make testing, deployment, and refactoring impossible
- [ ] **Service boundaries** — if multi-service: no shared databases (distributed monolith). If monolith: clear internal boundaries exist

## Step 3: Code Health & Maintainability

Organic codebases accumulate debt that everyone stops noticing. Find it.

- [ ] **Dead code** — unused exports, unreachable branches, commented-out blocks, stale feature flags. Dead code misleads and inflates build times
- [ ] **Duplication** — copy-pasted blocks in error handling, validation, data transformation. Duplicated logic means bugs fixed in one place but not the other
- [ ] **Complexity hotspots** — functions with cyclomatic complexity >10, files with complexity >50. High-complexity functions are where bugs hide and nobody dares touch
- [ ] **God classes/functions** — classes over ~300 lines, functions over ~50 lines with multiple responsibilities. These become bottlenecks for the entire team
- [ ] **Naming consistency** — is it `userId` in one file and `user_id` in another? Do function names describe behavior or are they `handleData`, `processStuff`?
- [ ] **Readability** — read 5-10 random functions. Can you understand them without reading every line? Magic numbers, deep nesting, single-letter variables?
- [ ] **Tech debt indicators** — search for TODO, FIXME, HACK, WORKAROUND, XXX. Count them. Check if any are years old

## Step 4: Error Handling & Resilience

This is where most codebases fall apart. Errors are not edge cases — they are the normal operating condition of distributed systems.

- [ ] **Swallowed errors** — grep for empty catch blocks, `catch (e) {}`, `except: pass`, `_ = err`. These are silent failure points — the #1 cause of "it just stopped working and nobody knows why"
- [ ] **Error propagation** — are errors consistently propagated up the stack? Or converted to null/undefined/false at random layers? Is there a consistent error type/structure?
- [ ] **Timeout handling** — EVERY external call (HTTP, database, file I/O, queue) MUST have a timeout. Missing timeouts cause connection pool exhaustion — one slow dependency takes down everything
- [ ] **Retry logic** — if retries exist, do they have exponential backoff, jitter, and max limits? Tight retry loops DDoS a recovering service
- [ ] **Circuit breakers** — for service-to-service calls, is there graceful degradation when a dependency is down? Or does failure cascade?
- [ ] **Partial failure handling** — in batch operations, what happens when item 50 of 100 fails? Rollback? Skip and continue? Is the user informed?
- [ ] **Error logging quality** — when errors are caught, is enough context logged? Request ID, user context, input parameters, stack trace? "Error occurred" with no context means hours of investigation

## Step 5: Security Posture

Think like an attacker. Every input is hostile. Every endpoint is a target.

- [ ] **Hardcoded secrets** — grep for API keys, passwords, tokens, connection strings in source. Check git history for previously committed secrets. This is the #1 critical finding in audits
- [ ] **Authentication coverage** — is auth middleware applied consistently to ALL protected routes? Look for routes added later that bypass auth. Late-added endpoints are most commonly unprotected
- [ ] **Authorization (access control)** — does the system check that the authenticated user can access the SPECIFIC resource? Look for IDOR — `/api/users/123/data` where changing 123 gives access to another user's data. Broken access control is OWASP #1
- [ ] **Input validation boundaries** — validation at the API boundary, not just the UI. Both syntactic (format) and semantic (business rules). Direct API calls must not bypass checks
- [ ] **Injection vulnerabilities** — string concatenation/interpolation in SQL, OS commands, LDAP, HTML output. Any raw query construction with user input is a finding
- [ ] **Dependency vulnerabilities** — run `npm audit`, `pip audit`, `cargo audit`, or equivalent. Count and severity of known CVEs
- [ ] **CORS / CSP** — CORS allowing `*` origin in production? Content-Security-Policy headers set and restrictive?
- [ ] **Rate limiting** — auth endpoints, API endpoints, resource-intensive operations rate limited? Brute force protection?
- [ ] **Output sanitization** — user-provided data properly escaped for the output context (HTML, JS, CSS, URL)?

## Step 6: Data Layer

The database is the last line of defense for data integrity. Application code lies. Constraints don't.

- [ ] **N+1 queries** — database queries inside loops, ORM lazy-loading triggering individual queries per related object. The single most common performance problem
- [ ] **Index coverage** — every column in WHERE, JOIN, ORDER BY, GROUP BY has an index. Missing composite indexes for multi-column filters. Ticking time bomb that explodes with growth
- [ ] **Migration strategy** — schema changes via versioned migrations? Can migrations run forward and backward? Any destructive migrations without deprecation?
- [ ] **Connection management** — pooling configured? Min/max sizes? Connections returned to pool in all code paths (including errors)?
- [ ] **Transaction boundaries** — atomic operations wrapped in transactions? Transactions kept short? No locks held during external calls?
- [ ] **Data integrity constraints** — NOT NULL, UNIQUE, FK, CHECK at the DATABASE level, not just application code. App-level constraints are bypassed by direct DB access, scripts, and race conditions
- [ ] **SELECT * usage** — especially on high-traffic paths. Fetches unnecessary data, breaks on schema changes
- [ ] **Backup & recovery** — backup strategy exists AND has been tested with a restore?

## Step 7: Testing Strategy

Tests exist to catch regressions. If they can't do that, they're overhead.

- [ ] **Pyramid balance** — ratio of unit : integration : e2e tests. Healthy is roughly 70/20/10. An inverted pyramid (mostly E2E) = slow, flaky, expensive
- [ ] **Critical path coverage** — auth, authorization, payments, data validation, error handling have tests? 80% overall coverage means nothing if the uncovered 20% is your auth system
- [ ] **Test quality** — read 10 tests. Do they test behavior ("when X, then Y") or implementation ("function A calls B 3 times")? Do assertions check meaningful outcomes, or just `toBeTruthy()`?
- [ ] **Test isolation** — tests depend on execution order? Share mutable state? Running one test alone gives different results than the full suite?
- [ ] **Flaky tests** — check CI history. Tests that sometimes pass and sometimes fail. Worse than no tests — they train developers to ignore failures
- [ ] **Test data management** — using production data? Hardcoded IDs? Shared test databases? Each test should set up and clean up its own data

## Step 8: Dependencies & Supply Chain

Every dependency is an attack surface, a maintenance burden, and a bet on someone else's continued diligence.

- [ ] **Outdated dependencies** — anything 2+ major versions behind. Frameworks and security libraries especially. Outdated deps accumulate vulnerabilities and make future upgrades exponentially harder
- [ ] **Abandoned dependencies** — last commit 12+ months ago with open, unaddressed security issues. An abandoned dep with a known CVE will never get a fix
- [ ] **License compliance** — GPL/AGPL deps in proprietary software? "Unknown" license declarations?
- [ ] **Transitive vulnerabilities** — deep scan including transitive deps. Your direct deps can be clean while transitive chains expose you
- [ ] **Lock file hygiene** — lock file committed? In sync with manifest? Unexplained changes in diffs?
- [ ] **Dependency bloat** — multiple libraries doing the same thing? Total dep count appropriate for the project size?

## Step 9: Observability & Operations

If you can't see it, you can't fix it. If you can't fix it fast, you're waking people up at 3am.

- [ ] **Logging quality** — structured (JSON) or unstructured (plain text)? Log levels used correctly? Correlation/request ID threaded through entries?
- [ ] **No PII in logs** — search for passwords, tokens, credit cards, personal data in log output. Log systems are often less secured than production databases
- [ ] **Metrics** — business metrics (orders/min) and technical metrics (latency, error rate, queue depth) collected?
- [ ] **Health checks** — endpoint that verifies the app can reach its dependencies (DB, cache, external services)?
- [ ] **Alerting** — alerts on error rate spikes, latency increases, resource exhaustion? Or does someone have to watch dashboards 24/7?
- [ ] **Config validation at startup** — app validates all required config on boot and fails fast? Or starts fine and fails at 2am when a rarely-used code path hits a missing value?

## Step 10: Performance & Scalability

Performance is a feature. Scalability is survival.

- [ ] **Unbounded collections** — in-memory lists, maps, caches that grow without limits. Event listeners registered but never unregistered. Work fine in tests, OOM in production after days
- [ ] **Queries in loops** — any DB call, HTTP call, or file I/O inside a loop should be batched. 1,000 iterations × 5ms = 5s that could be 5ms
- [ ] **Resource cleanup** — DB connections, file handles, streams closed in ALL code paths including errors? Resource leaks cause gradual degradation
- [ ] **Caching strategy** — what's cached? Eviction policies? Invalidation strategy? "No caching strategy" is always wrong at scale
- [ ] **Pagination** — all list endpoints paginated? Max page size enforced server-side? Unpaginated endpoints are a DoS vulnerability
- [ ] **Blocking calls in async code** — synchronous I/O or CPU-heavy ops in async/event-driven paths that starve the event loop?
- [ ] **Stateless design** — session state in memory? In-process caches inconsistent across instances? Can you run 2 instances behind a load balancer right now?
- [ ] **Idempotency** — can critical operations (payments, orders, mutations) be safely retried? Network failures cause retries — without idempotency, you charge customers twice

## Step 11: API Design & DevOps

- [ ] **API consistency** — naming, response envelopes, error formats, auth mechanism consistent across all endpoints?
- [ ] **API versioning** — versioning scheme exists? Deprecated versions documented with sunset dates? No silent breaking changes?
- [ ] **CI/CD pipeline** — runs lint, type check, tests, security scans? Under 10 minutes? Slow CI means developers stop waiting
- [ ] **Deployment safety** — automated? Staging mirrors prod? Canary or blue-green? "It works when Bob deploys it" is not a strategy
- [ ] **Rollback capability** — can you roll back in under 5 minutes? Has anyone actually tested it?
- [ ] **Branch protection** — main branch protected? PRs required? CI must pass before merge?

## Output Format

```
## Codebase Audit Summary
- **Scope:** [What was audited — modules, services, layers]
- **Tech Stack:** [Language, framework, database, key dependencies]
- **Verdict:** [HEALTHY / NEEDS ATTENTION / CRITICAL ISSUES / STOP AND FIX]

## Architecture
- [Structural findings — layering, boundaries, coupling, circular deps]

## Code Health
- [Dead code, duplication, complexity hotspots, God classes]

## Error Handling & Resilience
- [Swallowed errors, missing timeouts, retry/circuit breaker gaps]
- **Risk Level:** [Critical / High / Medium / Low]

## Security
- [Secrets, auth gaps, injection, dependency CVEs, CORS/CSP]
- **Risk Level:** [Critical / High / Medium / Low]

## Data Layer
- [N+1 queries, missing indexes, transaction gaps, constraint issues]

## Testing
- [Pyramid balance, coverage gaps, test quality, flaky tests]

## Dependencies
- [Outdated, abandoned, vulnerable, license issues]

## Observability
- [Logging, metrics, health checks, alerting gaps]

## Performance & Scalability
- [Leaks, unbounded collections, blocking calls, caching, pagination]

## Critical Issues (Must Fix)
- [Issue with file:line location, blast radius, and suggested fix]

## Important Issues (Should Fix)
- [Issue with reasoning and impact]

## Minor Issues (Nice to Fix)
- [Suggestion]

## What's Good
- [Positive observations — what's done well, what to preserve]

## Top 5 Actions
1. [Highest-priority action with reasoning]
2. ...
3. ...
4. ...
5. ...
```

## Success Criteria

- The full audit scope has been read and understood — not skimmed
- Architecture has been assessed for layering violations, circular dependencies, and coupling
- Error handling has been audited — no silent swallowed errors in the review scope
- Security checklist is fully completed — secrets, auth, authz, injection, deps
- Data layer has been checked for N+1 queries, missing indexes, and constraint gaps
- Test quality has been evaluated — not just coverage numbers, but actual assertion quality
- Dependencies have been scanned for vulnerabilities, abandonment, and license issues
- Observability has been assessed — logging, metrics, health checks, alerting
- Every finding is prioritized by blast radius and likelihood — not just listed
- Top 5 actions give the team a clear, actionable starting point
