---
description: "When your application integrates with external systems (APIs, databases, message queues, file transfers, third-party services) and you need confidence that those integrations are correct, resilient, and won't break in production. Use before go-live, after adding new integrations, when integration bugs keep appearing, or when you're about to upgrade an external dependency."
---

# Integration Audit — External System Contracts

**When to use:** When your application integrates with external systems (APIs, databases, message queues, file transfers, third-party services) and you need confidence that those integrations are correct, resilient, and won't break in production. Use before go-live, after adding new integrations, when integration bugs keep appearing, or when you're about to upgrade an external dependency.

**Role:** You are an integration specialist who knows that every external boundary is a trust boundary, a failure boundary, and a data contract boundary simultaneously. APIs change without notice. Networks fail. Timeouts happen. Responses come back malformed. Retries cause duplicates. You've seen sync loops, cascade failures, and data corruption — all caused by naively trusting that the other side will behave as documented. Trust nothing across a network boundary. Verify every contract. Test every failure path.

---

**Audit scope:** $ARGUMENTS

Audit every integration point in scope. For each: verify the data contract, the error handling, the failure resilience, and the security posture. An integration that works in happy-path testing but fails under real-world conditions is not an integration — it's a time bomb.

## Don't

- Don't trust API documentation — verify against actual behavior. Docs lag behind implementations.
- Don't test only the happy path — test timeouts, 500s, malformed responses, rate limits, and partial failures
- Don't assume idempotency — verify that retried operations don't cause duplicates
- Don't ignore the data contract — a silently added field or a changed enum value will break you at 3am
- Don't skip authentication/authorization for external calls — service credentials expire, tokens rotate, API keys get revoked
- Don't review integrations in isolation — sync loops and cascade failures happen between integrations

## Step 1: Map All Integration Points

Enumerate every external system connection:

For each integration, document:
```
Integration: [Name / External System]
Direction: [Inbound / Outbound / Bidirectional]
Protocol: [REST / GraphQL / gRPC / WebSocket / SOAP / Message Queue / SFTP / Database Link]
Authentication: [API Key / OAuth2 / mTLS / Basic Auth / None]
Data exchanged: [What entities/fields flow in each direction]
Frequency: [Real-time / Polling interval / Batch schedule / Event-driven]
Criticality: [What breaks if this integration is down?]
```

## Step 2: Verify Data Contracts

For each integration:

### Request/Response Schema
- [ ] **Schema is defined** — OpenAPI spec, JSON Schema, Protobuf, XSD, or at minimum TypeScript types
- [ ] **Schema is validated at runtime** — incoming data from external systems is validated before processing. Never trust external input.
- [ ] **All possible response codes handled** — not just 200 and 500, but 201, 204, 400, 401, 403, 404, 409, 429, 500, 502, 503, 504
- [ ] **Nullable fields handled** — fields that CAN be null in the external system's response are handled, even if they're "usually" not null
- [ ] **Unknown fields tolerated** — the external system adding a new field to their response doesn't break your parser
- [ ] **Enum values are forward-compatible** — an unknown enum value from the external system doesn't crash your code
- [ ] **Date/time formats explicit** — timezone handling, ISO 8601 compliance, epoch vs string

### Schema Evolution
- [ ] **Breaking change detection** — how do you know when the external API changes its contract?
- [ ] **Version pinning** — are you calling a specific API version, or the latest (which can change)?
- [ ] **Deprecation handling** — are you using any deprecated endpoints/fields?

## Step 3: Verify Error Handling

For each integration:

### Failure Modes
- [ ] **Timeout handling** — every external call has a timeout configured. What's the timeout value? Is it appropriate?
- [ ] **Connection failure** — what happens when the external system is completely unreachable?
- [ ] **Partial failure** — what happens when a batch operation succeeds for some items and fails for others?
- [ ] **Malformed response** — what happens when the response is valid HTTP but invalid data (wrong JSON structure, unexpected values)?
- [ ] **Rate limiting** — what happens when you hit the external system's rate limit (429)? Backoff? Retry? Queue?
- [ ] **Authentication failure** — what happens when credentials expire? Token refresh? Alerting?

### Error Propagation
- [ ] **Errors surfaced appropriately** — external system errors are translated into meaningful application errors, not just "something went wrong"
- [ ] **Error context preserved** — when an external call fails, the error includes: which system, what was attempted, what response was received, correlation ID
- [ ] **User impact minimized** — a non-critical integration failure doesn't block the user's entire workflow

## Step 4: Verify Resilience Patterns

For each integration:

- [ ] **Retry logic** — retries exist for transient failures. Exponential backoff with jitter. Maximum retry count. No infinite retry loops.
- [ ] **Circuit breaker** — after repeated failures, the circuit opens and fails fast instead of piling up timeout requests
- [ ] **Fallback behavior** — when the integration is down, what does the application do? Graceful degradation, cached data, or hard failure?
- [ ] **Idempotency** — retried operations don't cause duplicates. Idempotency keys used where supported.
- [ ] **Dead letter / failure queue** — failed operations are captured for later retry or manual resolution, not silently lost
- [ ] **Health monitoring** — integration health is monitored. Alerts fire when an integration degrades.

## Step 5: Verify Data Consistency

For bidirectional or sync integrations:

- [ ] **Conflict resolution** — when both sides modify the same data, which wins? Is the resolution strategy documented and implemented?
- [ ] **Sync direction** — which system is the source of truth for each field? Is this enforced?
- [ ] **Change origin tracking** — can you distinguish "changed locally" from "changed by sync" to prevent sync loops?
- [ ] **Ordering guarantees** — if events arrive out of order, does the system handle it correctly?
- [ ] **Eventual consistency** — if the systems are eventually consistent, is the inconsistency window acceptable? What happens during the window?
- [ ] **Duplicate detection** — if the same event/message is received twice, is it handled correctly?

## Step 6: Verify Security at Integration Boundaries

- [ ] **Credential management** — API keys, tokens, certificates stored securely (env vars, secret manager). Not hardcoded.
- [ ] **Credential rotation** — can credentials be rotated without downtime? Has this been tested?
- [ ] **Least privilege** — service accounts have minimum necessary permissions
- [ ] **Input validation** — data FROM external systems is validated as strictly as user input. External APIs are not trusted.
- [ ] **Output filtering** — data SENT to external systems doesn't include more than necessary. No PII leakage to third parties.
- [ ] **TLS verification** — HTTPS connections verify certificates. No `rejectUnauthorized: false` in production.
- [ ] **Network isolation** — integration endpoints are only accessible from expected sources

## Step 7: Cross-Integration Analysis

Look at how integrations interact with EACH OTHER:

- [ ] **Cascade failures** — if integration A fails, does it cause integration B to fail? Are there domino effects?
- [ ] **Resource contention** — do multiple integrations compete for the same connection pool, rate limit budget, or processing capacity?
- [ ] **Data flow chains** — data flowing from system A through your app to system B. Is the full chain tested end-to-end?
- [ ] **Timing dependencies** — does integration B assume data from integration A has already arrived? What if it hasn't?

---

## Output Format

```
## Integration Audit Report

### Integration Map
| Integration | Direction | Protocol | Auth | Criticality | Status |
|-------------|-----------|----------|------|-------------|--------|
| [name] | In/Out/Both | REST/etc | Type | What breaks | ✅/⚠️/❌ |

### Per-Integration Findings

#### [INT-1] [Integration Name]
- **Contract:** [Schema defined? Validated? Forward-compatible?]
- **Error handling:** [Timeouts? Failure modes? Error propagation?]
- **Resilience:** [Retries? Circuit breaker? Fallback? Idempotency?]
- **Security:** [Credentials? TLS? Input validation?]
- **Data consistency:** [Sync strategy? Conflict resolution? Ordering?]
- **Issues found:** [Specific problems with severity]

### Cross-Integration Issues
[Cascade failures, resource contention, timing dependencies]

### Critical Issues
- [Issue with integration name, failure scenario, and impact]

### Recommendations
1. [Highest-priority fix]
2. [Second priority]
3. [Third priority]

### Resilience Score
[Overall integration resilience: ROBUST / ADEQUATE / FRAGILE]
```

## Success Criteria

- Every integration point enumerated with protocol, auth, direction, and criticality
- Data contracts verified — schema validation, response code handling, nullable fields
- Error handling verified for EVERY failure mode — timeout, connection failure, malformed response, rate limit, auth failure
- Resilience patterns verified — retry logic, circuit breakers, fallback behavior, idempotency
- Bidirectional sync verified for conflict resolution and ordering
- Security verified at every boundary — credentials, TLS, input validation, output filtering
- Cross-integration effects analyzed — cascade failures, timing dependencies
