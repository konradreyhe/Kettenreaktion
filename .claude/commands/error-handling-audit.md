---
description: "When you need to know if your application handles errors correctly, consistently, and completely. Not \"does it catch errors\" — does it catch the RIGHT errors, propagate them correctly, recover gracefully, and give users/operators actionable information? Use when errors are being swallowed silently, when debugging takes hours because error context is missing, when users see generic \"something went wrong\" messages, or when you suspect the error handling strategy has drifted across modules."
---

# Error Handling Audit — Exception Architecture Review

**When to use:** When you need to know if your application handles errors correctly, consistently, and completely. Not "does it catch errors" — does it catch the RIGHT errors, propagate them correctly, recover gracefully, and give users/operators actionable information? Use when errors are being swallowed silently, when debugging takes hours because error context is missing, when users see generic "something went wrong" messages, or when you suspect the error handling strategy has drifted across modules.

**Role:** You are an error handling specialist. You know that every swallowed exception is a future mystery incident. Every generic catch-all is a debugging dead end. Every inconsistent error format is a frontend developer's nightmare. You've been paged at 3am for an outage caused by an empty catch block that silently ate a database connection failure for 6 hours. You audit error handling like someone who has to debug the system at its worst moment — in production, under load, at night, with no context.

---

**Audit scope:** $ARGUMENTS

Map the complete error handling architecture. Every catch block. Every error boundary. Every error response format. Every logging gap. Find the swallowed exceptions, the inconsistent formats, the missing context, and the broken propagation chains.

## Don't

- Don't just check if catch blocks exist — check if they do the RIGHT thing
- Don't assume logged errors are handled errors — logging without recovery is still a failure
- Don't skip the error PROPAGATION path — an error caught in layer 3 must be correctly surfaced to layer 1
- Don't ignore async error handling — unhandled promise rejections and missing await are the #1 source of silent failures
- Don't accept "catch (e) { throw e }" as error handling — what context was added? What was logged?
- Don't forget the user — what does the USER see when this error happens?

## Step 1: Map Error Sources

Categorize every place errors originate:

- [ ] **External service failures** — HTTP errors, timeouts, connection refused, malformed responses
- [ ] **Database errors** — connection failures, constraint violations, query timeouts, deadlocks
- [ ] **Validation errors** — invalid input, type mismatches, business rule violations
- [ ] **Authentication/authorization errors** — expired tokens, invalid credentials, insufficient permissions
- [ ] **Resource errors** — disk full, memory exhaustion, file not found, permission denied
- [ ] **Application logic errors** — null references, out-of-bounds, division by zero, impossible states
- [ ] **Async/event errors** — unhandled rejections, event handler exceptions, background job failures

## Step 2: Audit Catch Blocks

For EVERY catch/try-catch/error handler in the codebase:

### The Seven Deadly Sins of Error Handling
- [ ] **Swallowed errors** — empty catch blocks, `catch (e) {}`, `catch { }`, `.catch(() => {})`. These are silent failure points. Count them ALL.
- [ ] **Catch-all without specificity** — catching `Exception` or `Error` base class when only specific errors should be caught. Masks unexpected errors.
- [ ] **Log-and-rethrow without context** — `catch(e) { log(e); throw e; }` adds nothing. What context was added?
- [ ] **Catch-and-return-null** — converting errors to null/undefined. Callers now have no idea something failed.
- [ ] **Error type changing** — wrapping errors loses the original stack trace and error type. Original error should be preserved as `cause`.
- [ ] **Overly broad try blocks** — try block wrapping 50 lines when only 3 lines can throw. Masks which operation actually failed.
- [ ] **Missing finally/cleanup** — resources opened in try block not cleaned up in finally. Connections leak on error paths.

## Step 3: Audit Error Propagation

Trace error flow from origin to final handler:

- [ ] **Consistent propagation direction** — errors flow upward through the stack consistently. No random swallowing at intermediate layers.
- [ ] **Context enrichment** — each layer adds relevant context. A database error should accumulate: what query, what service, what user action, what request ID.
- [ ] **Error type hierarchy** — is there a consistent error class hierarchy? (e.g., `AppError > NotFoundError > UserNotFoundError`) Or is it a mix of strings, Error objects, custom classes, and plain objects?
- [ ] **Boundary translation** — infrastructure errors (database timeout) are translated to domain errors (service unavailable) at layer boundaries. Internal details don't leak to external consumers.
- [ ] **Async propagation** — errors in async operations (promises, callbacks, event handlers) are properly caught and propagated. No fire-and-forget async calls.

## Step 4: Audit Error Responses

What does the consumer (user, API client, upstream service) actually see?

- [ ] **Consistent format** — ALL error responses follow the same structure (status code, error code, message, details). No endpoint returning `{ error: "..." }` while another returns `{ message: "...", code: 123 }`.
- [ ] **Appropriate status codes** — 400 for client errors, 500 for server errors. Not 200 with an error body. Not 500 for validation failures.
- [ ] **Actionable messages** — does the error message tell the user what to DO? "Email is already in use — try logging in" vs "Error occurred"
- [ ] **No internal leakage** — stack traces, file paths, database queries, server names never appear in production error responses
- [ ] **Documented error codes** — are error codes documented? Can API consumers handle errors programmatically?
- [ ] **Localization** — are user-facing error messages localizable? Or hardcoded in one language?

## Step 5: Audit Error Logging

When errors happen, can you debug them?

- [ ] **Every error is logged** — no catch block that doesn't log. Even "expected" errors should be logged at appropriate levels.
- [ ] **Structured logging** — errors logged as structured data (JSON) with consistent fields, not string concatenation
- [ ] **Context in logs** — every logged error includes: correlation/request ID, user ID (if authenticated), operation being performed, input parameters (sanitized of PII), stack trace
- [ ] **Log levels correct** — validation errors at WARN, internal errors at ERROR, catastrophic failures at FATAL. Not everything at ERROR.
- [ ] **No PII in error logs** — passwords, tokens, personal data not in error context. Check actual log output, not just code.
- [ ] **Error aggregation** — do errors aggregate correctly in your monitoring tool? Or do similar errors produce different log signatures?

## Step 6: Audit Recovery Strategies

What happens AFTER an error is caught?

- [ ] **Retry with backoff** — transient failures (network, rate limit) are retried with exponential backoff and jitter. Max retries defined.
- [ ] **Circuit breaker** — repeated failures trigger circuit breaker. No hammering a dead service.
- [ ] **Graceful degradation** — when a non-critical feature fails, the rest of the application continues. Not everything fails because the notification service is down.
- [ ] **Transaction rollback** — multi-step operations roll back on failure. No partial state corruption.
- [ ] **User notification** — the user is informed when something fails. Not a spinner that spins forever.
- [ ] **Fallback values** — where appropriate, fallback values or cached data used when primary source fails. Clearly indicated as stale.

## Step 7: Audit Global Error Handling

The last line of defense:

- [ ] **Global exception handler exists** — unhandled exceptions don't crash the process silently
- [ ] **Unhandled promise rejection handler** — async errors that escape all catch blocks are caught
- [ ] **Process crash handling** — if the process crashes, it logs why, cleans up, and restarts
- [ ] **Frontend error boundary** — UI components don't white-screen on error. Error boundaries show fallback UI.
- [ ] **404/500 pages** — custom error pages exist and are helpful, not framework defaults

---

## Output Format

```
## Error Handling Audit Report

### Scope
[What was audited — modules, services, layers]

### Summary
- Catch blocks audited: [N]
- Swallowed errors found: [N]
- Inconsistent error formats: [N]
- Missing error context: [N]
- Unhandled async paths: [N]

### Error Architecture Map
[How errors flow: source → catch → propagation → response → logging]

### Deadly Sins Found

#### [ERR-1] [Description]
- **Sin:** [Swallowed / Catch-all / No context / Return null / Type change / Broad try / Missing cleanup]
- **Location:** [file:line]
- **Impact:** [What goes wrong when this error path is hit]
- **Fix:** [Specific remediation]

### Error Format Inconsistencies
[Different error response formats across endpoints]

### Logging Gaps
[Errors caught but not logged, or logged without context]

### Recovery Gaps
[Missing retry logic, circuit breakers, or graceful degradation]

### Recommendations
1. [Highest-priority fix — usually swallowed errors]
2. [Second priority — usually inconsistent formats]
3. [Third priority — usually missing context]

### What's Done Well
[Good error handling patterns to preserve and replicate]
```

## Success Criteria

- Every catch block in the audit scope has been examined — not sampled
- Swallowed errors (empty catches) are counted and located
- Error propagation traced from source to final handler for critical paths
- Error response format consistency verified across all endpoints
- Error logging verified for context, structure, and PII safety
- Recovery strategies assessed for transient vs permanent failure handling
- Global error handlers verified as the last line of defense
