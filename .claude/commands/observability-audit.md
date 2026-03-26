---
description: "When you want to know if you can actually see, diagnose, and fix problems in production — not theoretical monitoring, but practical observability. Use before going to production, after an incident exposed blind spots, when on-call engineers complain about debugging difficulty, or when the monitoring setup hasn't been reviewed in 6+ months."
---

# Observability Audit — Can You Actually Operate This System?

**When to use:** When you want to know if you can actually see, diagnose, and fix problems in production — not theoretical monitoring, but practical observability. Use before going to production, after an incident exposed blind spots, when on-call engineers complain about debugging difficulty, or when the monitoring setup hasn't been reviewed in 6+ months.

**Role:** You are a senior SRE who has been on-call for systems with great observability and systems with none. You know the difference between "monitoring exists" and "we can actually diagnose problems." You've seen log searches that take 30 minutes during an incident, dashboards that nobody looks at, and alerts that fire so often everyone ignores them. The question isn't "do we have monitoring?" — it's "can we find and fix problems before users notice?"

---

**Audit scope:** $ARGUMENTS

Audit whether you can actually operate this system in production. Monitoring that nobody looks at is not monitoring. Alerts that nobody acts on are noise. Logs without correlation IDs are unsearchable. The difference between a 5-minute diagnosis and a 5-hour investigation is the quality of your observability.

## Don't

- Don't confuse "we have a dashboard" with "we can diagnose problems" — most dashboards are set up once and never maintained
- Don't skip the log quality check — bad logs are worse than no logs because they create false confidence
- Don't accept "we monitor CPU and memory" as sufficient — you need business signals, not just infrastructure signals
- Don't audit only production — if staging has no observability, you'll discover issues in production first
- Don't ignore the human side — the best telemetry is useless if engineers can't access or query it quickly
- Don't skip sensitive data in logs — it's the most common compliance time bomb

## Step 1: Logging Quality

The foundation. If logs are bad, everything built on them is bad.

### Structure & Content
- [ ] All logs are structured (JSON or key-value) — not free-text `printf`-style messages
- [ ] Every log entry contains: timestamp (ISO 8601/UTC), log level, service name, correlation ID, message
- [ ] Additional context where relevant: environment, service version, host/instance, user ID (anonymized)
- [ ] Logs are parseable by the aggregator without custom regex or grok patterns

### Log Levels
- [ ] Levels are used consistently — ERROR = something broke, WARN = degraded but functioning, INFO = meaningful state transitions
- [ ] ERROR is not overloaded — expected 404s, validation failures are NOT errors
- [ ] INFO is not per-request noise — request logging is separate from application logging
- [ ] DEBUG/TRACE disabled in production by default — can be enabled dynamically without redeploy

### Correlation
- [ ] Every inbound request gets a unique correlation/request ID (generated at edge or propagated from upstream)
- [ ] Correlation ID propagated to ALL downstream calls — HTTP headers, message queue metadata, gRPC metadata
- [ ] Correlation ID appears in every log line for that request across all services
- [ ] You can search one correlation ID and see the full request path across all services

### Volume & Retention
- [ ] Log volume per service is monitored (GB/day)
- [ ] Retention policy defined: hot tier (searchable), cold/archive tier (compliance)
- [ ] Log rotation automated — no service can fill a disk with its own logs
- [ ] High-volume, low-value streams are sampled or rate-limited (e.g., health check access logs)

## Step 2: Sensitive Data in Logs

The most common compliance time bomb. Log systems are often less secured than production databases.

- [ ] **No PII in logs** — grep recent production logs for email patterns, phone numbers, credit card patterns, JWTs, session tokens
- [ ] **Sensitive fields redacted at the point of logging** — not downstream. Allowlist approach preferred over denylist
- [ ] **Request/response body logging disabled by default** — only enabled with explicit sanitization
- [ ] **Stack traces and error messages reviewed** — they often contain user input, query parameters, connection strings
- [ ] **No raw SQL with user data in logs** — parameterized query logs only
- [ ] **Log access is RBAC-controlled** — who can read production logs? Is access itself audited?
- [ ] **GDPR/DSGVO right-to-erasure covers logs** — can you delete a specific user's log data?

## Step 3: Metrics

You need both technical metrics (is the system healthy?) and business metrics (are users succeeding?).

### RED Metrics (every request-serving service)
- [ ] **Rate** — requests per second tracked per service and per endpoint
- [ ] **Errors** — error rate tracked (HTTP status failures AND application-level logical errors)
- [ ] **Duration** — latency as a histogram (not just averages) with p50, p95, p99 available
- [ ] RED metrics broken down by: endpoint, method, status code, consumer/caller

### USE Metrics (every resource)
- [ ] **Utilization** — CPU, memory, disk, network per host/container
- [ ] **Saturation** — queue depths, thread pool usage, connection pool usage, disk I/O wait
- [ ] **Errors** — hardware errors, OOM kills, disk errors

### Business Metrics
- [ ] At least 3-5 critical business metrics instrumented (orders/min, signups, payment success rate)
- [ ] Business metrics on dashboards alongside technical metrics — a drop in orders correlates with error spikes

### Cardinality
- [ ] No unbounded label values (user ID, request ID, email as metric labels = cardinality bomb)
- [ ] Total active time series count is monitored
- [ ] Guidelines exist for what can and cannot be a metric label

## Step 4: Distributed Tracing

Can you follow a single request across all services it touches?

- [ ] **Trace context propagated** — W3C Trace Context (`traceparent`/`tracestate`) or equivalent across all sync calls
- [ ] **Async boundaries covered** — trace context propagated across message queues, event buses, batch jobs
- [ ] **Complete traces** — pick 5 random traces, verify they show the complete call chain with no broken/orphaned spans
- [ ] **Span naming** — descriptive: `HTTP GET /api/v1/orders/{id}` not `HTTP request`. No high-cardinality IDs in span names
- [ ] **Span attributes** — HTTP method, status code, DB query type, queue name, error details attached
- [ ] **Sampling strategy defined** — not "100% of everything" or "we don't know". Tail-based sampling retains errors and slow traces

## Step 5: Health Checks

The difference between routing traffic to a healthy instance and routing to a broken one.

- [ ] **Liveness check** — `/healthz` or `/livez` — is the process alive? Shallow, no dependency checks. Failure → restart
- [ ] **Readiness check** — `/readyz` — can the service handle traffic? DB pool initialized, caches warmed. Failure → remove from LB, NOT restart
- [ ] **Liveness doesn't check dependencies** — a DB outage should not cause every service to restart in a loop
- [ ] **Deep health endpoint** — `/health/detailed` checks all dependencies with per-dependency status. Used for dashboards, NOT for Kubernetes probes
- [ ] **Health checks are lightweight** — no heavy queries or connection pool consumption

## Step 6: Alerting Quality

Monitoring without alerting means someone watches dashboards 24/7. Alerting without quality means everyone ignores alerts.

- [ ] **>80% of alerts are actionable** — audit last 30 days. If most alerts require no action, prune aggressively
- [ ] **Every alert has a runbook** — what is wrong, what to do, link to relevant dashboard
- [ ] **Alert messages include context** — service, current value vs threshold, link to dashboard and runbook
- [ ] **No "wait and see" alerts** — if the correct response is "wait," downgrade to warning or remove
- [ ] **Escalation paths defined** — who gets paged first, what happens if unacknowledged after N minutes
- [ ] **Alert definitions in version control** — not hand-crafted in a UI
- [ ] **Regular alert review cadence** — monthly or quarterly, noisy alerts tuned or retired
- [ ] **No permanently-firing alerts** — any alert firing >1 week without action is broken

## Step 7: Dashboards

- [ ] **Golden signals dashboard exists** — latency, traffic, errors, saturation for each critical service. First thing on-call looks at
- [ ] **Deployment markers on metric graphs** — correlate "deploy at 14:03" with "errors spiked at 14:05"
- [ ] **Drill-down path** — top-level overview → service-level → component-level
- [ ] **Dashboards load in <5 seconds** — slow dashboards are useless during incidents
- [ ] **No dashboard sprawl** — stale dashboards (not viewed in 90+ days) archived. Template variables used, not duplicated per instance
- [ ] **Business dashboards visible to engineering** — revenue, conversion, signups alongside technical metrics

## Step 8: Error Tracking

- [ ] **Error tracking tool in place** — Sentry, Bugsnag, Rollbar, or equivalent receiving errors from all services
- [ ] **Errors grouped by root cause** — 1,000 identical errors = one issue with count=1,000
- [ ] **New errors trigger higher-priority notifications** — first-seen errors are more important than recurring known errors
- [ ] **Release-based regression detection** — "this deploy introduced 3 new error types"
- [ ] **Error context includes** — stack trace (with source maps), breadcrumbs, user context (anonymized), request context

## Step 9: SLOs & Debugging Support

### SLOs
- [ ] **SLIs defined** for every user-facing service — at minimum availability and latency, measured from user's perspective
- [ ] **SLO targets set** — explicit (e.g., 99.9% availability, p99 < 500ms over 30-day window)
- [ ] **Error budget tracked** — current consumption visible on dashboard
- [ ] **Burn rate alerts** — fast-burn (exhausts budget in <2h) and slow-burn (exhausts before window end)
- [ ] **Policy when budget exhausted** — feature freeze? Mandatory reliability work?

### Debugging Support
- [ ] **Given a production error**, can an engineer determine: what the user did, what the request looked like, what failed — without direct production DB access?
- [ ] **Log levels adjustable per service/tenant/user** without redeployment
- [ ] **Engineers have self-service access** to logs, traces, metrics — no tickets required. Queries return in <30s
- [ ] **Investigation playbook exists** for common issues (high latency, elevated errors, memory leak)

## Output Format

```
## Observability Audit Summary
- **Scope:** [Services, environments audited]
- **Verdict:** [OBSERVABLE / PARTIALLY OBSERVABLE / FLYING BLIND]

## Scoring
| Area | Score (0-4) | Notes |
|------|-------------|-------|
| Logging | [0-4] | ... |
| Sensitive Data | [0-4] | ... |
| Metrics | [0-4] | ... |
| Tracing | [0-4] | ... |
| Health Checks | [0-4] | ... |
| Alerting | [0-4] | ... |
| Dashboards | [0-4] | ... |
| Error Tracking | [0-4] | ... |
| SLOs | [0-4] | ... |
(0=Missing, 1=Ad-hoc, 2=Defined, 3=Measured, 4=Optimized)

## Logging
- [Structure, levels, correlation, volume findings]

## Sensitive Data
- [PII in logs, compliance gaps]
- **Risk Level:** [Critical / High / Medium / Low]

## Metrics & Tracing
- [RED/USE coverage, cardinality, trace completeness]

## Alerting & Dashboards
- [Signal-to-noise, missing runbooks, dashboard quality]

## SLOs & Error Tracking
- [SLI/SLO coverage, error grouping, regression detection]

## Critical Issues (Must Fix)
- [Issue with location and impact]

## Top 5 Actions
1. [Highest-priority action]
2. ...
3. ...
4. ...
5. ...
```

## Success Criteria

- Logging quality verified: structured, leveled correctly, correlation IDs propagated across all services
- Sensitive data audit complete — no PII in logs, redaction at point of logging
- RED metrics (rate, errors, duration) exist for every request-serving service
- Distributed traces are complete across all services — no broken spans at async boundaries
- Health checks correctly distinguish liveness from readiness
- >80% of alerts in the last 30 days were actionable — noise is identified and flagged for pruning
- SLIs and SLOs are defined, measured, and visible for user-facing services
- Engineers can diagnose a production error end-to-end using only observability tools — no direct DB access required
