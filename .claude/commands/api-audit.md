---
description: "When you want a deep analysis of your API's design quality — consistency, error contracts, versioning, pagination, rate limiting, idempotency, and documentation. Use before opening an API to external consumers, when API-related bugs keep appearing, when onboarding new API consumers takes too long, or when the API has grown organically without a style guide."
---

# API Audit — Contract, Consistency & Consumer Experience

**When to use:** When you want a deep analysis of your API's design quality — consistency, error contracts, versioning, pagination, rate limiting, idempotency, and documentation. Use before opening an API to external consumers, when API-related bugs keep appearing, when onboarding new API consumers takes too long, or when the API has grown organically without a style guide.

**Role:** You are a senior API architect who has built APIs consumed by hundreds of developers. You know that inconsistent error formats cause support tickets, missing pagination causes outages, and undocumented breaking changes cause trust erosion. You audit from the consumer's perspective — not "does the code work?" but "would I want to integrate with this API?"

---

**Audit scope:** $ARGUMENTS

Audit this API from a consumer's perspective. Every inconsistency is a support ticket. Every missing error code is a debugging session. Every undocumented breaking change is a lost customer. Review like you're the developer who has to integrate with this API using only the docs and the responses.

## Don't

- Don't audit implementation internals — focus on what consumers see: request/response contracts, error formats, headers
- Don't accept "it works" as sufficient — it must be consistent, predictable, and self-documenting
- Don't skip error responses — consumers spend more time debugging errors than coding happy paths
- Don't assume internal APIs don't need quality — internal consumers are still consumers with deadlines
- Don't review one endpoint in isolation — inconsistencies across endpoints are the #1 API quality problem
- Don't ignore headers — auth, rate limiting, caching, and pagination metadata often live in headers

## Step 1: Contract Consistency

Inconsistent APIs multiply cognitive load for every consumer.

### Naming & Conventions
- [ ] Consistent casing across all endpoints — `camelCase` or `snake_case`, not mixed
- [ ] Resource naming follows REST conventions — plural nouns (`/users`, `/orders`), not verbs (`/getUsers`)
- [ ] URL structure is hierarchical and predictable — `/users/{id}/orders` not `/getUserOrders`
- [ ] Query parameter naming is consistent — `page_size` or `pageSize`, not both

### Response Structure
- [ ] Response envelope is identical across all endpoints — same wrapper structure everywhere
- [ ] Null vs. absent fields are handled consistently — is a missing field null or omitted?
- [ ] Date/time format is consistent — ISO 8601 everywhere, timezone always included
- [ ] Empty collections return `[]`, not null or omitted
- [ ] Boolean fields use consistent naming — `is_active` everywhere, not `active` in one place and `is_active` in another

### HTTP Methods
- [ ] GET for reads (no side effects), POST for creates, PUT/PATCH for updates, DELETE for deletes
- [ ] GET requests are safe and idempotent — no state changes on GET
- [ ] PUT is full replacement, PATCH is partial update — not used interchangeably
- [ ] DELETE returns appropriate status (200 with body, 204 no content, or 202 accepted)

### Status Codes
- [ ] Status codes are accurate — 200 for success, 201 for created, 204 for no content, 400 for bad request, 401 for unauthenticated, 403 for unauthorized, 404 for not found, 409 for conflict, 422 for validation, 429 for rate limited, 500 for server error
- [ ] No generic 200 for everything — errors return appropriate 4xx/5xx codes
- [ ] No 500 for client errors — a malformed request should never return 500

## Step 2: Error Response Design

Consumers spend more time debugging errors than coding happy paths. Good errors are self-service documentation.

- [ ] **Structured error format** — machine-readable error code, human message, detail/context. Ideally RFC 9457 (Problem Details)
- [ ] **Consistent across all endpoints** — same error envelope everywhere, not different formats per module
- [ ] **Machine-readable error codes** — `VALIDATION_ERROR`, `RESOURCE_NOT_FOUND`, not just HTTP status codes. Consumers need to branch on error types
- [ ] **Human-readable messages** — clear enough that a developer can understand without reading docs
- [ ] **Field-level validation errors** — for 400/422, which specific fields failed and why. Not just "validation failed"
- [ ] **No stack traces in production** — internal details, file paths, SQL queries never leaked to consumers
- [ ] **Correlation ID in every error response** — consumers can reference it when contacting support
- [ ] **No sensitive data in errors** — no user PII, no internal IPs, no database details in error messages

## Step 3: Versioning & Backward Compatibility

Without versioning, every change is a forced upgrade for all consumers simultaneously.

- [ ] **Versioning scheme exists and is consistent** — URL prefix (`/v1/`), header, or query parameter — same approach everywhere
- [ ] **No silent breaking changes** — no removed fields, changed types, or altered behavior without a version bump
- [ ] **Additive changes are non-breaking** — new fields, new endpoints, new enum values don't break consumers
- [ ] **Deprecated versions documented** — sunset dates, migration guides, `Deprecation` and `Sunset` headers
- [ ] **Breaking change detection** — automated check in CI that flags removed/changed fields (tools: oasdiff, Optic)

## Step 4: Pagination

Every list endpoint is a potential DoS vulnerability without pagination.

- [ ] **All list endpoints are paginated** — no endpoint can return millions of records
- [ ] **Default page size exists** — not unlimited by default
- [ ] **Maximum page size enforced server-side** — consumers cannot request `page_size=1000000`
- [ ] **Cursor-based for data that changes** — offset pagination skips/duplicates rows when data changes between pages. Cursor pagination is correct
- [ ] **Deterministic sort order** — with a tiebreaker field (usually ID) to prevent duplicate/missing items
- [ ] **Pagination metadata in response** — total count (if cheap), next/previous cursors, has_more indicator
- [ ] **Total count is optional or lazy** — `COUNT(*)` on large tables is expensive. Don't compute it if the consumer doesn't need it

## Step 5: Authentication & Authorization

- [ ] **Consistent auth mechanism** — same auth approach (Bearer token, API key, cookie) across all endpoints
- [ ] **Short-lived tokens** — access tokens 15-60 min, not hours or days
- [ ] **Scope enforcement per endpoint** — not just "authenticated" but "has permission for this specific operation"
- [ ] **IDOR protection** — changing a resource ID in the URL does NOT grant access to another user's data
- [ ] **No wildcard CORS on authenticated endpoints** — `Access-Control-Allow-Origin: *` with credentials is a security hole
- [ ] **Auth errors are clear** — 401 (not authenticated) vs. 403 (not authorized) used correctly

## Step 6: Rate Limiting

Without rate limiting, one misbehaving client degrades service for all clients.

- [ ] **Rate limits exist** — on auth endpoints, mutation endpoints, and resource-intensive operations at minimum
- [ ] **Rate limit headers on ALL responses** — `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Not just on 429 responses
- [ ] **Multi-tier limits** — per-user AND per-tenant AND global. Not just one tier
- [ ] **429 responses include Retry-After** — tells consumers exactly when to retry
- [ ] **Rate limits are documented** — consumers know the limits before hitting them
- [ ] **Burst allowance** — token bucket or sliding window, not fixed window that resets at boundaries

## Step 7: Input Validation

Validation at the API boundary, not just the UI. Direct API calls must not bypass checks.

- [ ] **Server-side validation on all inputs** — request body, query parameters, path parameters, headers
- [ ] **Allowlist approach** — reject unknown fields rather than silently ignoring them
- [ ] **Request size limits** — maximum body size enforced (413 Payload Too Large)
- [ ] **Content-Type enforcement** — reject requests with unexpected Content-Type
- [ ] **File upload validation** — MIME type, file size, filename sanitization
- [ ] **Nesting depth limits** — deeply nested JSON can be used for DoS
- [ ] **Validation errors are specific** — which field, what constraint, what was the actual value (if safe to echo)

## Step 8: Idempotency

Network failures cause retries. Without idempotency, retries cause duplicate side effects.

- [ ] **GET, PUT, DELETE are naturally idempotent** — multiple identical requests produce the same result
- [ ] **POST mutations support idempotency keys** — `Idempotency-Key` header with client-generated UUID
- [ ] **Idempotency key storage** — server stores key → response mapping with TTL (24h recommended)
- [ ] **Duplicate key with different payload** — returns 409 Conflict, not silently processing the new payload
- [ ] **Financial/critical endpoints require idempotency keys** — payments, order creation, transfers

## Step 9: Documentation & Performance

- [ ] **OpenAPI/Swagger spec exists and is accurate** — actual API behavior matches the spec. Drift detection in CI
- [ ] **Example requests and responses** — for every endpoint, including error cases
- [ ] **Changelog exists** — what changed, when, breaking vs. non-breaking
- [ ] **Batch endpoints for bulk operations** — reduce API call volume with per-item status in responses
- [ ] **Compression enabled** — gzip/Brotli for responses above threshold
- [ ] **Caching headers** — `ETag`, `Cache-Control`, `Last-Modified` on cacheable resources. 304 support
- [ ] **Sparse fieldsets** — `?fields=id,name,email` to reduce response size when consumers don't need everything

## Output Format

```
## API Audit Summary
- **Scope:** [Endpoints, versions, auth mechanisms audited]
- **API Type:** [REST / GraphQL / gRPC]
- **Verdict:** [CONSISTENT / NEEDS WORK / INCONSISTENT / REDESIGN NEEDED]

## Contract Consistency
- [Naming, response structure, status code findings]

## Error Responses
- [Format consistency, missing codes, information leakage]

## Versioning & Compatibility
- [Strategy, breaking changes, deprecation process]

## Pagination
- [Missing pagination, cursor vs offset, max page size]

## Auth & Rate Limiting
- [Coverage gaps, IDOR risks, missing rate limit headers]

## Input Validation
- [Bypass risks, missing validation, size limits]

## Idempotency
- [Mutation safety, missing idempotency keys]

## Documentation
- [Spec accuracy, example coverage, changelog]

## Critical Issues (Must Fix)
- [Issue with endpoint and suggested fix]

## Important Issues (Should Fix)
- [Issue with reasoning]

## Consistency Matrix
| Aspect | Consistent? | Notes |
|--------|-------------|-------|
| Naming | Yes/No | ... |
| Response envelope | Yes/No | ... |
| Error format | Yes/No | ... |
| Auth mechanism | Yes/No | ... |
| Pagination | Yes/No | ... |
| Rate limit headers | Yes/No | ... |
```

## Success Criteria

- Response structure has been verified for consistency across all endpoints in scope
- Error format is consistent and includes machine-readable codes, human messages, and correlation IDs
- Every list endpoint has pagination with enforced max page size
- Auth and rate limiting are verified on all endpoints — no unprotected mutations
- Input validation exists at the API boundary — not just the UI
- No silent breaking changes in the current version
- IDOR protection verified — changing resource IDs does not grant unauthorized access
- Documentation accuracy verified against actual API behavior
