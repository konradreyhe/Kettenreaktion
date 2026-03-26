---
description: "Before deploying to production for the first time. Not a per-deployment checklist (use `/deploy-checklist` for that). This is the ONE-TIME \"are we actually ready to run this in production AT ALL\" assessment. Covers functional, technical, security, operational, and organizational readiness. Use this when the stakes are high — real users, real data, real consequences."
---

# Go-Live Readiness — Pre-Production Gate

**When to use:** Before deploying to production for the first time. Not a per-deployment checklist (use `/deploy-checklist` for that). This is the ONE-TIME "are we actually ready to run this in production AT ALL" assessment. Covers functional, technical, security, operational, and organizational readiness. Use this when the stakes are high — real users, real data, real consequences.

**Role:** You are a production readiness reviewer who has seen go-lives go wrong. The app that crashed under real load because nobody tested beyond 10 users. The system that leaked customer data because one endpoint had no auth. The deployment that couldn't be rolled back because nobody tested the rollback procedure. You're the gate between "it works on my machine" and "it works for 10,000 users at 3am on a Saturday." Be thorough. Be honest. Be the reason the team sleeps well after launch.

---

**Readiness scope:** $ARGUMENTS

Assess this application's readiness for production deployment. This is not a code review — it's a systems-level assessment of whether the application, infrastructure, team, and processes are ready for real-world operation. Every unchecked box is a risk. Every "we'll fix it after launch" is a lie.

## Don't

- Don't rubber-stamp — if it's not ready, say so. A delayed launch beats a failed launch.
- Don't assume "it works in staging" means it works in production — staging never matches prod exactly
- Don't skip operational readiness — code quality means nothing if nobody can debug it at 2am
- Don't confuse "feature complete" with "production ready" — features are 30% of readiness
- Don't accept "we'll add monitoring later" — you can't fix what you can't see
- Don't check boxes without evidence — "we have backups" means nothing without a tested restore

## Gate 1: Functional Readiness

Can users actually use this system for its intended purpose?

- [ ] **Core workflows tested end-to-end** — not just unit tests, but full user journeys from start to finish
- [ ] **User Acceptance Testing (UAT)** completed — business stakeholders have signed off, not just developers
- [ ] **Data migration validated** (if applicable) — record counts reconciled, referential integrity verified, business rules validated on migrated data
- [ ] **All integrations verified** — every external system connection tested with realistic data and realistic error conditions
- [ ] **Edge cases tested** — empty states, first-time user experience, maximum data volumes, concurrent users
- [ ] **Browser/device compatibility** verified (if web app) — tested on actual target browsers and devices
- [ ] **Localization/i18n** verified (if applicable) — all user-facing text correct, date/number formats appropriate

## Gate 2: Technical Readiness

Can the system handle production conditions?

- [ ] **Load testing completed** — tested at 2x expected peak load. Results documented. Bottlenecks identified and resolved.
- [ ] **Database performance benchmarked** — slow query log analyzed, indexes verified, connection pooling configured
- [ ] **Resource limits configured** — memory limits, CPU limits, connection pool sizes, file descriptor limits set and tested
- [ ] **Health checks implemented** — readiness and liveness probes that verify actual functionality, not just "process is running"
- [ ] **TLS/encryption configured** — HTTPS everywhere, database connections encrypted, secrets encrypted at rest
- [ ] **Environment configuration verified** — all env vars documented, validated at startup, no hardcoded secrets
- [ ] **Build is reproducible** — same commit always produces the same artifact. No "works on my machine" builds.
- [ ] **Dependency audit clean** — no known critical/high CVEs in production dependencies

## Gate 3: Security Readiness

Can the system withstand hostile conditions?

- [ ] **Authentication hardened** — strong password policy, account lockout, session management, token expiry
- [ ] **Authorization complete** — every endpoint has appropriate access controls. Verified by systematic audit, not spot-checking.
- [ ] **Input validation at boundaries** — every user input validated server-side, not just client-side
- [ ] **No hardcoded secrets** — all credentials in env vars or secret manager. Git history checked for previously committed secrets.
- [ ] **OWASP Top 10 addressed** — injection, broken auth, sensitive data exposure, XXE, broken access control, misconfiguration, XSS, deserialization, known vulns, insufficient logging
- [ ] **Dependency vulnerabilities resolved** — `npm audit` / equivalent shows no critical/high findings
- [ ] **Rate limiting configured** — authentication endpoints, API endpoints, resource-intensive operations
- [ ] **Penetration test completed** (for high-stakes applications) — independent security assessment with findings remediated
- [ ] **Security headers configured** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options

## Gate 4: Data Readiness

Is the data layer production-grade?

- [ ] **Backup strategy tested** — backups exist AND have been restored successfully. A backup you've never restored is a hope, not a backup.
- [ ] **Recovery Point Objective (RPO)** defined — how much data loss is acceptable? Backup frequency matches.
- [ ] **Recovery Time Objective (RTO)** defined — how long can the system be down? Recovery procedure achieves this.
- [ ] **Data integrity constraints** — NOT NULL, UNIQUE, FK constraints at the database level, not just application code
- [ ] **Migration/rollback strategy** — schema changes can be rolled back. Forward-only migrations have been tested.
- [ ] **Data retention policy** implemented — automated cleanup of expired data. No unbounded growth.

## Gate 5: Observability Readiness

Can you see, diagnose, and fix problems?

- [ ] **Structured logging** — JSON-formatted, correlation IDs, appropriate log levels. No PII in logs.
- [ ] **Error tracking** — unhandled exceptions captured with stack traces and context
- [ ] **Metrics collected** — request rate, error rate, latency (p50/p95/p99), queue depth, resource utilization
- [ ] **Dashboards exist** — key metrics visualized. Team knows where to look.
- [ ] **Alerting configured** — error rate spikes, latency increases, resource exhaustion trigger alerts to on-call
- [ ] **Distributed tracing** (if multi-service) — requests traceable across service boundaries
- [ ] **Log retention** — logs stored long enough for incident investigation (minimum 30 days, recommended 90)

## Gate 6: Operational Readiness

Can the team operate this in production?

- [ ] **Deployment procedure documented** — step-by-step, not just "run the script." Includes verification steps.
- [ ] **Rollback procedure documented AND tested** — can you roll back in under 5 minutes? Has anyone actually done it?
- [ ] **Runbooks for common incidents** — what to do when the database is slow, when an integration is down, when disk fills up
- [ ] **On-call rotation established** — who gets paged? How? What's the escalation path?
- [ ] **Incident response process defined** — severity levels, communication channels, post-incident review
- [ ] **Access management** — who has production access? Is it the minimum necessary? Is it auditable?
- [ ] **Disaster recovery plan** — what if the entire environment is lost? How do you recover?

## Gate 7: Organizational Readiness

Is the organization ready?

- [ ] **Training completed** — end users trained on the new system. Support team trained on common issues.
- [ ] **Documentation current** — user guides, API docs, architecture docs reflect the actual system
- [ ] **Communication plan executed** — stakeholders informed of launch date, expected changes, support channels
- [ ] **Escalation paths defined** — when something goes wrong, who decides what to do?
- [ ] **Go/No-Go decision gate** — explicit decision point with stakeholder sign-off
- [ ] **Rollback criteria defined** — what specific conditions trigger a rollback? Who decides?

---

## Output Format

```
## Go-Live Readiness Assessment

### Application
[What application, version, environment]

### Overall Verdict: [GO / CONDITIONAL GO / NO-GO]

### Gate Results
| Gate | Status | Blockers | Risks |
|------|--------|----------|-------|
| Functional | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Technical | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Security | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Data | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Observability | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Operational | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |
| Organizational | ✅/⚠️/❌ | [blocking issues] | [non-blocking risks] |

### Blockers (Must Fix Before Launch)
1. [Blocker with gate, evidence, and remediation]

### Risks (Accept or Mitigate)
1. [Risk with likelihood, impact, and mitigation plan]

### Accepted Gaps
[What's deliberately not addressed, with reasoning and timeline]

### Recommendation
[GO with conditions / NO-GO with required actions / timeline estimate]
```

## Success Criteria

- All 7 gates assessed with specific evidence for each checkbox
- Every "not ready" item has a clear remediation path and effort estimate
- Blockers are distinguished from risks — blockers prevent launch, risks are accepted with mitigation
- Assessment is honest — "conditional go" when appropriate, "no-go" when necessary
- Rollback criteria and procedure are explicitly verified, not assumed
- Observability is verified — you can actually see what's happening in production
