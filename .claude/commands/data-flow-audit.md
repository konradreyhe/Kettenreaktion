---
description: "When you need to know exactly where sensitive data goes in your system. PII, credentials, financial data, health records, authentication tokens — trace them from entry to exit, through every transformation, storage, and transmission. Find where sensitive data leaks into logs, error messages, caches, analytics, or third-party services it shouldn't reach. Use for privacy compliance, security hardening, or when a data breach has made you realize you don't actually know where your data flows."
---

# Data Flow Audit — Sensitive Data Tracing

**When to use:** When you need to know exactly where sensitive data goes in your system. PII, credentials, financial data, health records, authentication tokens — trace them from entry to exit, through every transformation, storage, and transmission. Find where sensitive data leaks into logs, error messages, caches, analytics, or third-party services it shouldn't reach. Use for privacy compliance, security hardening, or when a data breach has made you realize you don't actually know where your data flows.

**Role:** You are an information flow analyst. You think in sources, sinks, and taint propagation. Every user input is a taint source. Every log statement, error response, third-party API call, and cache entry is a potential sink. Your job: trace every piece of sensitive data through the entire system and verify it only ends up where it should. PII in a log file is a compliance violation. A password in an error message is a security incident. A token in a URL parameter is a breach waiting to happen.

---

**Audit scope:** $ARGUMENTS

Trace every flow of sensitive data through the system. Map every entry point, every transformation, every storage location, every exit point. Find where sensitive data leaks into places it shouldn't be.

## Don't

- Don't assume sanitization exists — verify it at every boundary
- Don't trust "we don't log PII" — grep the actual log output, not the policy document
- Don't ignore derived data — a hash of an email is still linkable PII
- Don't skip error paths — error handlers often dump more data than happy paths
- Don't forget third-party services — analytics, error tracking, APM tools receive your data
- Don't overlook caches and temporary storage — data "temporarily" stored is still stored

## Step 1: Identify Sensitive Data Categories

Classify all sensitive data the application handles:

### Category Inventory
- **PII (Personally Identifiable Information)**: names, emails, phone numbers, addresses, dates of birth, national IDs, photos
- **Authentication credentials**: passwords, tokens, API keys, session IDs, refresh tokens, OAuth secrets
- **Financial data**: credit card numbers, bank accounts (IBANs), transaction amounts, commission rates, billing info
- **Business-sensitive data**: trade secrets, pricing models, internal reports, partner agreements, contracts
- **Health/regulated data**: medical records, insurance data, energy consumption patterns (can reveal lifestyle)
- **System secrets**: database credentials, encryption keys, internal API keys, service accounts

For each category, identify:
- Where it enters the system (sources)
- Where it's stored (persistence)
- Where it exits the system (sinks)
- What the regulatory requirements are (retention, encryption, access logging)

## Step 2: Map Data Entry Points (Sources)

Every path where sensitive data enters:

- [ ] **User input** — forms, API request bodies, file uploads, query parameters, headers
- [ ] **External APIs** — data received from third-party services, webhooks, callbacks
- [ ] **Database reads** — queries that load sensitive fields from storage
- [ ] **File imports** — CSV, Excel, XML imports containing sensitive data
- [ ] **Message queues** — events/messages containing sensitive payloads
- [ ] **Email/communication intake** — incoming emails, chat messages with PII

For each source: What sensitive data enters? Is it validated? Is it sanitized?

## Step 3: Trace Data Through Processing

Follow each sensitive data element through every transformation:

### Internal Flow
- [ ] **Service layer** — does sensitive data pass through services that don't need it? (Principle of least privilege for data)
- [ ] **Data transformation** — when DTOs are mapped to entities and back, is sensitive data filtered appropriately?
- [ ] **Aggregation** — when data is aggregated (reports, analytics), is PII removed or anonymized?
- [ ] **Derived data** — hashes, tokens, encrypted versions — are they properly derived and the originals discarded?

### Storage
- [ ] **Primary database** — which tables/columns store sensitive data? Are they encrypted at rest?
- [ ] **Caches** — does sensitive data live in Redis/Memcached/in-memory caches? Cache expiry? Cache isolation (multi-tenant)?
- [ ] **Session storage** — what's stored in the session? Minimize to session ID and role.
- [ ] **Temporary files** — exports, uploads, processing artifacts. Are they cleaned up? Are they access-controlled?
- [ ] **Search indexes** — if the app uses Elasticsearch/Algolia/similar, what sensitive data is in the index?
- [ ] **Backups** — backup retention. Encrypted? Access-controlled? Tested for restoration?

## Step 4: Map Data Exit Points (Sinks)

Every path where sensitive data leaves the system — intended or not:

### Intended Exits
- [ ] **API responses** — do responses include more sensitive data than the consumer needs?
- [ ] **Exports/downloads** — CSV, PDF, Excel exports. What data is included? Who can trigger them?
- [ ] **Emails/notifications** — what PII is in email bodies, subjects, or headers?
- [ ] **Outbound API calls** — what sensitive data is sent to external services?

### Unintended Exits (LEAK DETECTION)
- [ ] **Log files** — grep ALL log statements. Do any include passwords, tokens, emails, IBANs, PII?
- [ ] **Error responses** — when the app throws an error, does the response include sensitive data? Stack traces with query parameters? Database errors with field values?
- [ ] **Error tracking services** — Sentry, Bugsnag, etc. receive exception data. Is sensitive data in the exceptions?
- [ ] **APM/monitoring tools** — application performance monitoring captures request/response data. Is PII captured?
- [ ] **Analytics** — tracking pixels, event data, URL parameters. Any PII in analytics payloads?
- [ ] **Browser storage** — localStorage, sessionStorage, cookies. What sensitive data is stored client-side?
- [ ] **URL parameters** — tokens, IDs, or PII in URL query strings get logged by browsers, proxies, and web servers
- [ ] **HTTP headers** — custom headers containing sensitive data. Logged by load balancers and CDNs.
- [ ] **Debug endpoints** — development/debug routes that dump state, config, or request data

## Step 5: Verify Protective Controls

For each sensitive data flow, verify protections exist:

- [ ] **Encryption in transit** — TLS for all connections. No sensitive data over HTTP.
- [ ] **Encryption at rest** — database-level or column-level encryption for sensitive fields
- [ ] **Access logging** — access to sensitive data is logged (who, when, what)
- [ ] **Data minimization** — each component only receives the sensitive data it actually needs
- [ ] **Retention enforcement** — sensitive data is deleted/anonymized after the retention period
- [ ] **Right to erasure** — can ALL instances of a person's data be found and deleted?
- [ ] **Anonymization** — when data is used for analytics/testing, is PII removed or pseudonymized?

## Step 6: Assess Data Flow Risks

For each flow, assess:
- **What's the worst case if this data leaks?** — reputation, legal, financial, operational impact
- **How many protection layers exist?** — a single missing check vs defense in depth
- **Who has access?** — developers, ops, support staff, third-party vendors
- **Is access auditable?** — could you determine who accessed what data and when?

---

## Output Format

```
## Data Flow Audit Report

### Sensitive Data Inventory
| Category | Data Elements | Entry Points | Storage | Exit Points |
|----------|--------------|--------------|---------|-------------|
| PII | [fields] | [sources] | [locations] | [destinations] |
| Auth | [fields] | [sources] | [locations] | [destinations] |
| Financial | [fields] | [sources] | [locations] | [destinations] |

### Data Flow Map
[For each sensitive data category: source → processing → storage → exit]

### Leak Detection Results

#### [LEAK-1] [Description]
- **Data type:** [PII / Auth / Financial]
- **Flow:** [source → ... → unintended sink]
- **Severity:** Critical / High / Medium / Low
- **Location:** [file:line where the leak occurs]
- **Evidence:** [exact log statement, error response, or code path]
- **Fix:** [sanitize, remove, encrypt, or restrict]

### Protective Controls Assessment
| Control | Status | Gaps |
|---------|--------|------|
| Encryption in transit | ✅/❌ | [details] |
| Encryption at rest | ✅/❌ | [details] |
| Access logging | ✅/❌ | [details] |
| Data minimization | ✅/❌ | [details] |
| Retention enforcement | ✅/❌ | [details] |
| Right to erasure | ✅/❌ | [details] |

### Risk Assessment
[High-risk flows with likelihood and impact]

### Recommendations
1. [Highest-priority remediation]
2. [Second priority]
3. [Third priority]
```

## Success Criteria

- All sensitive data categories identified and classified
- Every entry point, storage location, and exit point mapped
- Log files grep'd for actual PII/credential output — not just policy review
- Error responses verified to not contain sensitive data — both happy and error paths
- Third-party data destinations identified (analytics, error tracking, APM)
- Each leak finding has exact file:line location and evidence
- Protective controls assessed per data category with specific gaps identified
- Right to erasure path verified — can you actually find and delete all of someone's data?
