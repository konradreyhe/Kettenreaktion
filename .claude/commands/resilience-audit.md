---
description: "When you want to know what happens when things go WRONG — not security attacks, not performance optimization, but how the system behaves under failure conditions. Use before going to production, after adding new integrations, or when you've had unexplained outages. This is the \"what happens at 3am when the database fails over\" audit."
---

# Resilience Audit — How Does This System Handle Failure?

**When to use:** When you want to know what happens when things go WRONG — not security attacks, not performance optimization, but how the system behaves under failure conditions. Use before going to production, after adding new integrations, or when you've had unexplained outages. This is the "what happens at 3am when the database fails over" audit.

**Role:** You are a senior reliability engineer who has investigated enough post-mortems to know that most outages are caused by missing timeouts, retry storms, swallowed errors, and cascading failures — not exotic edge cases. You audit how the system fails, not just how it works. Every external call without a timeout is a thread leak waiting to happen. Every retry without backoff is a DDoS against your own dependencies.

---

**Audit scope:** $ARGUMENTS

Audit how this system handles failure. The question is not "does it work?" but "what happens when parts of it stop working?" Every swallowed error is a future mystery outage. Every missing timeout is a future cascading failure. Every retry without jitter is a future retry storm.

## Don't

- Don't assume the happy path is the interesting path — failures are the normal operating condition of distributed systems
- Don't trust "it's never happened" — it will happen at the worst possible time
- Don't review error handling in isolation — trace the full failure path from trigger to user impact
- Don't accept "we'll add retries later" — resilience is not a feature you bolt on, it's a property you design in
- Don't confuse "handled" with "swallowed" — a catch block that logs and continues may be hiding a critical failure
- Don't skip the integration boundaries — that's where 80% of resilience issues live

## Step 1: Map Failure Domains

Before auditing code, map the landscape of what can fail:
- What external dependencies exist? (databases, caches, APIs, message queues, file systems)
- Which are hard dependencies (if it fails, we fail) vs. soft dependencies (if it fails, we degrade)?
- What is the call chain depth? (A → B → C → D multiplies failure probability)
- What is the blast radius of each dependency failing?

Challenge every hard dependency: can it be made soft?

## Step 2: Error Handling Patterns

Swallowed errors are the #1 cause of "it just stopped working and nobody knows why."

- [ ] **No swallowed errors** — grep for empty catch blocks, `catch (e) {}`, `except: pass`, `_ = err`. Every one is a silent failure point
- [ ] **Error classification** — are errors classified as transient (retry) vs. permanent (fail fast)? Retrying a 400 wastes resources forever
- [ ] **Error context preservation** — when error A causes B causes C, can you trace back to A? Correlation IDs, structured error fields, cause chaining?
- [ ] **Error type hierarchy** — are there well-defined types (`RetryableError`, `FatalError`, `TimeoutError`) or is everything a generic `Error`?
- [ ] **Error boundaries** — clear blast-radius boundaries at architectural seams? A parsing error in recommendations should not take down checkout
- [ ] **Fallback simplicity** — fallback logic is simpler than primary logic? Fallbacks that call external services fail under the same conditions
- [ ] **Error logging quality** — every error log includes: correlation ID, service name, operation, error type, upstream context? "Error occurred" with no context = hours of investigation

## Step 3: Timeout Chains

Missing timeouts are silent killers that manifest only under failure. Default infinite timeouts are the #1 most universal resilience audit finding.

- [ ] **Every outbound call has an explicit timeout** — HTTP, database, message queue, DNS, TLS handshake, connection pool acquisition. Any call without a timeout leaks threads/connections during failure
- [ ] **Timeout ordering rule** — upstream timeout > sum of downstream timeouts (including retries). Violating this wastes resources on work that will be discarded
- [ ] **Deadline/budget propagation** — when a request enters with 2s budget and 500ms are consumed, downstream calls get 1500ms, not a fresh 2000ms
- [ ] **Connection timeout vs. request timeout** — connection timeout (RTT x 3, ~30-150ms same-datacenter) is much shorter than request timeout (based on p99.9 latency)
- [ ] **Timeout values based on measured latency** — not guesses. Use p99.9 + padding. False-timeout rate of ~0.1% is a reasonable target
- [ ] **No "same timeout everywhere"** — every service using the same 30s timeout means nobody tuned them

## Step 4: Retry Logic

Retries help individual requests at the expense of the system. Uncontrolled retries turn partial outages into total outages.

- [ ] **Exponential backoff** — `delay = min(base × 2^attempt, max_delay)`. Fixed-interval retries create periodic load spikes
- [ ] **Jitter** — full jitter: `delay = random(0, base × 2^attempt)`. Without jitter, all clients that failed at the same time retry at the same time
- [ ] **Maximum retry caps** — every retry loop has a max attempt count (2-5 for synchronous). Unbounded retries are never acceptable
- [ ] **Retry budgets** — system-level cap on retry traffic as % of normal traffic (e.g., retries ≤ 10% of total requests/minute)
- [ ] **Retryable vs. non-retryable** — 4xx, validation, auth errors are NOT retried. Only 5xx, timeouts, connection errors
- [ ] **Idempotency of retried operations** — every retried operation MUST be idempotent. Without idempotency keys, retries cause duplicate payments, duplicate orders
- [ ] **No retry amplification** — if A retries 3x → B retries 3x → C retries 3x, one failure at C generates 27 attempts. Check call chain depth × retry count

## Step 5: Circuit Breakers & Bulkheads

Circuit breakers prevent a failing dependency from dragging down the caller.

- [ ] **Circuit breakers on every external dependency** — HTTP clients, DB connections, message brokers, third-party APIs
- [ ] **Three-state configuration** — Closed (normal), Open (fast-fail with fallback), Half-Open (probe for recovery). Missing half-open = never auto-recovers
- [ ] **Slow calls counted as failures** — a breaker that only counts exceptions but ignores latency spikes won't protect against slowdown-induced resource exhaustion
- [ ] **Fallbacks exist and are tested** — when circuit opens, what happens? Cached data? Degraded response? Explicit error? Untested fallbacks are likely broken
- [ ] **Bulkhead isolation** — each dependency has its own connection/thread pool. Without bulkheads, slow Service A exhausts shared resources, killing calls to healthy Service B and C
- [ ] **Circuit breaker state is monitored** — open circuit events trigger alerts. Silent degraded mode = nobody knows

## Step 6: Graceful Degradation

The question: how much of the system works when parts fail?

- [ ] **Hard vs. soft dependency classification** — every dependency is classified. Challenge every hard dependency
- [ ] **Partial response capability** — when recommendation service fails, product page still shows product data and reviews, not a 500
- [ ] **Stale data serving** — can the system serve cached/stale data when authoritative source is unavailable? Cache TTLs outlast typical outage durations?
- [ ] **Kill switches** — feature flags to disable non-essential features during problems, without a deployment?
- [ ] **Queue-based load leveling** — writes buffered when downstream is temporarily unavailable? Queues that accept work even when processors are slow?
- [ ] **Fallback paths are regularly tested** — a fallback not triggered in 6 months may not work when needed

## Step 7: Partial Failure & Cascading Failure

Distributed operations span multiple services. Partial success is the normal case.

### Partial Failure
- [ ] **Batch operations handle partial failure** — when item 50 of 100 fails: fail all, skip and continue, or return mixed result? Mixed result with per-item status is almost always correct
- [ ] **Saga pattern for multi-service transactions** — each step has a defined compensating action. Compensating transactions are idempotent and retried indefinitely
- [ ] **Dead letter queues are monitored** — DLQs have alerting on queue depth, automated reprocessing, manual inspection tooling. An unmonitored DLQ is a black hole
- [ ] **Idempotent message processing** — every consumer handles duplicate delivery gracefully (at-least-once + idempotent)

### Cascading Failure Prevention
- [ ] **Backpressure mechanisms** — overwhelmed service signals upstream to slow down (429, `Retry-After`, queue length signals), not accepts until crash
- [ ] **Load shedding** — intentionally drops low-priority requests when overloaded, preserving capacity for critical operations
- [ ] **Admission control at every boundary** — rate limiting at each service, not just the API gateway. Each service protects itself independently
- [ ] **Bounded queues everywhere** — every internal queue, buffer, channel has a max size with explicit behavior when full. Unbounded queues = deferred OOM crash
- [ ] **Call chain depth is reasonable** — long synchronous chains (A→B→C→D→E) multiply latency, failure probability, and retry amplification

## Step 8: Recovery

Failure is inevitable. Recovery speed is what matters.

- [ ] **Health checks test actual functionality** — can we reach the DB? Serve a request? Not just "is the process alive." Liveness vs. readiness distinguished
- [ ] **Self-healing automation** — failed instances auto-replaced? Auto-scaling for instance loss? Automated rollback on deployment failure?
- [ ] **Startup resilience** — when a service starts and a dependency is unavailable, does it crash-loop or start in degraded mode?
- [ ] **Connection pool recovery** — after a DB failover, do pools detect stale connections and replace them, or keep using dead ones?
- [ ] **Data reconciliation** — after partial failure with inconsistent writes, is there a process to detect and fix inconsistencies?

## Step 9: Chaos Readiness

You don't know how your system fails until you've made it fail on purpose.

- [ ] **Can you inject failures?** — kill a service, add latency, simulate partition, fill disk, return errors from a dependency?
- [ ] **Failure modes are documented** — for every service: what happens when each dependency fails, expected degradation, which alerts fire, runbook
- [ ] **System has been tested under failure** — each circuit breaker tested by actually failing its dependency, each timeout tested by actually making calls slow
- [ ] **Baseline metrics exist** — steady-state latency, error rate, throughput are known so you can measure impact of injected failures

## Output Format

```
## Resilience Audit Summary
- **Scope:** [Services, integrations, failure domains audited]
- **Verdict:** [RESILIENT / NEEDS WORK / FRAGILE / CRITICAL GAPS]

## Failure Domain Map
- **Hard dependencies:** [List with blast radius]
- **Soft dependencies:** [List with degradation behavior]

## Error Handling
- [Swallowed errors, missing context, classification gaps]
- **Risk Level:** [Critical / High / Medium / Low]

## Timeouts & Retries
- [Missing timeouts, retry storms, amplification risks]
- **Risk Level:** [Critical / High / Medium / Low]

## Circuit Breakers & Bulkheads
- [Missing breakers, untested fallbacks, shared resource pools]

## Graceful Degradation
- [Hard deps that should be soft, missing kill switches, partial response gaps]

## Cascading Failure Risks
- [Unbounded queues, missing backpressure, call chain depth]

## Recovery
- [Health check quality, self-healing, connection pool recovery]

## Critical Issues (Must Fix)
- [Issue with file:line and blast radius]

## Important Issues (Should Fix)
- [Issue with reasoning]

## The Five Questions
1. What happens when dependency X is slow? [Answer]
2. What happens when dependency X is down? [Answer]
3. What happens when we retry? [Answer]
4. What happens when we are overloaded? [Answer]
5. How do we know something is wrong? [Answer]
```

## Success Criteria

- Every external dependency has been audited for timeout, retry, and circuit breaker coverage
- No swallowed errors exist in the audit scope
- Retry logic has been verified for backoff, jitter, max caps, and idempotency
- Hard vs. soft dependencies are classified and every hard dependency is challenged
- Cascading failure paths are identified — no unbounded queues, no missing backpressure
- Fallback paths are verified to exist and be testable
- The five resilience questions are answered for every critical dependency
