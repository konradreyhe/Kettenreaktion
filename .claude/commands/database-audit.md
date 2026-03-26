---
description: "When you want a deep analysis of your data layer — not just \"check for N+1\" but a comprehensive audit of schema design, index strategy, query patterns, connection management, transaction safety, migration risk, and data integrity. Use before a major release, when performance degrades, when inheriting a database, or when the data layer hasn't been reviewed in 6+ months."
---

# Database Audit — Schema, Query & Data Layer Deep Dive

**When to use:** When you want a deep analysis of your data layer — not just "check for N+1" but a comprehensive audit of schema design, index strategy, query patterns, connection management, transaction safety, migration risk, and data integrity. Use before a major release, when performance degrades, when inheriting a database, or when the data layer hasn't been reviewed in 6+ months.

**Role:** You are a senior database engineer who reads EXPLAIN ANALYZE for breakfast. You've seen missing FK indexes cause 10-minute queries, long-running transactions block autovacuum for days, and OFFSET pagination bring down production. You audit the full data layer — from schema design to query patterns to operational health. Every nullable column is questioned. Every missing index is a ticking time bomb.

---

**Audit scope:** $ARGUMENTS

Audit this data layer end-to-end. The database is the last line of defense for data integrity. Application code lies. Constraints don't. Every missing index works fine with 1,000 rows and brings down production with 1,000,000.

## Don't

- Don't just look for N+1 — that's the tip of the iceberg. Schema design, indexes, transactions, and migrations matter more
- Don't trust the ORM — ORMs generate queries you didn't write. Read the actual SQL
- Don't assume small tables stay small — design for the data volume you'll have in 2 years, not today
- Don't skip the operational health — dead tuples, vacuum strategy, and connection management are where production dies
- Don't audit queries without running EXPLAIN ANALYZE — reading code tells you what the query does, EXPLAIN tells you HOW
- Don't ignore nullable columns — every NULL is a three-valued logic trap waiting to surprise you

## Step 1: Schema Design

The schema is the contract. If it's wrong, everything built on it fights against it.

### Normalization & Structure
- [ ] Transactional tables are at least 3NF — every non-key column depends on the key, the whole key, and nothing but the key
- [ ] Any intentional denormalization is documented with a read-performance justification
- [ ] No "god tables" — single tables with 30+ columns mixing concerns (profile + billing + preferences + audit)
- [ ] No Entity-Attribute-Value (EAV) tables for relational data — impossible to query efficiently, constrain, or type-check

### Naming
- [ ] Consistent casing throughout — `snake_case` or `camelCase`, not both
- [ ] Table names consistently singular or plural — not mixed
- [ ] Foreign key columns follow `<referenced_table>_id` pattern
- [ ] No reserved words as column names (`user`, `order`, `group`, `type`, `status`)
- [ ] Boolean columns read as predicates: `is_active`, `has_verified_email`

### Data Types
- [ ] `bigint` for primary keys on any table that could exceed 2.1B rows or is a high-volume FK target
- [ ] `timestamptz` (with timezone) always — never bare `timestamp`
- [ ] `numeric(precision, scale)` or integer cents for money — never `float`/`double`
- [ ] `varchar(n)` only when length limit is a genuine business constraint — otherwise `text`
- [ ] Enum types assessed for modification pain — check constraints or reference tables are often better
- [ ] UUID PKs use `gen_random_uuid()` — not v1 UUIDs that leak MAC addresses

### Nullable Columns
- [ ] Every nullable column is intentionally nullable — NULL is a meaningful business state, not laziness
- [ ] `created_at`, `email`, `order_total` and similar are NOT NULL
- [ ] No nullable booleans — a three-state boolean indicates a missing domain concept
- [ ] Nullable foreign keys indicate intentionally optional relationships

## Step 2: Index Strategy

Missing indexes are the #1 most common database audit finding. They work fine in dev and bring down production.

### Missing Indexes
- [ ] Every foreign key column has an index — the database does NOT auto-create them. Missing FK indexes cause full table scans on JOINs and cascade deletes
- [ ] Every column in WHERE, JOIN, ORDER BY, GROUP BY has appropriate index coverage
- [ ] Composite indexes exist for common multi-column filter combinations
- [ ] Composite index column order: equality columns first, then range columns (`tenant_id, created_at` not `created_at, tenant_id`)

### Redundant & Unused Indexes
- [ ] No indexes that are strict prefixes of other indexes (redundant)
- [ ] Indexes with zero scans since last stats reset are candidates for removal (wait at least one full business cycle)
- [ ] Primary key indexes are never flagged as unused

### Advanced Indexes
- [ ] Partial indexes for common filters: `WHERE is_active = true`, `WHERE deleted_at IS NULL`
- [ ] Covering indexes (`INCLUDE` clause) for queries that only read indexed columns
- [ ] Trigram/GIN indexes for `LIKE '%term%'` searches instead of full table scans
- [ ] Functional indexes for expressions in WHERE: `CREATE INDEX ON users (LOWER(email))`

## Step 3: Query Patterns

Read the actual queries the ORM generates, not just the code that calls it.

- [ ] **N+1 queries** — queries inside loops, ORM lazy-loading triggering individual queries per related object. Check for missing `eager_load` / `select_related` / `relations` / `leftJoinAndSelect`
- [ ] **No SELECT *** — every production query names its columns. `SELECT *` breaks on schema changes and prevents covering indexes
- [ ] **All lists are bounded** — every query returning a list has a LIMIT. Admin panels are the #1 source of unbounded queries
- [ ] **No COUNT(*) without WHERE** on large tables — full table scan in PostgreSQL
- [ ] **No leading wildcards** — `WHERE name LIKE '%smith'` cannot use B-tree indexes
- [ ] **No function calls on indexed columns** — `WHERE LOWER(email) = 'foo'` bypasses the index. Use functional indexes
- [ ] **No implicit type casting** — `WHERE varchar_column = 123` forces a cast, may bypass index
- [ ] **Cursor pagination, not OFFSET** — `OFFSET 100000` scans and discards 100K rows. Use `WHERE id > :last_seen_id ORDER BY id LIMIT 20`

## Step 4: Connection Management

Connection leaks and pool starvation are where production dies under load.

- [ ] **Connection pooling exists** — not opening a new TCP connection per request (~50-100ms overhead each)
- [ ] **Pool size is appropriate** — formula: `(CPU_cores × 2) + 1` for the DB server's effective connections, shared across ALL app instances. Use PgBouncer if needed
- [ ] **Connections returned in all code paths** — including error paths. No checkout without release in finally/ensure/defer
- [ ] **statement_timeout configured** — kills runaway queries. Not left at 0 (infinite)
- [ ] **idle_in_transaction_session_timeout configured** — kills connections that opened a transaction and stalled. ≤60s recommended
- [ ] **lock_timeout configured** — prevents queries waiting indefinitely for locks during migrations. 5-10s for application queries

## Step 5: Transaction Design

Long-running transactions are the single biggest operational threat in PostgreSQL.

- [ ] **Atomic operations wrapped in transactions** — multi-step operations that must succeed or fail together
- [ ] **Transactions kept short** — no external I/O (HTTP calls, file writes, message publishing) inside a transaction. Ever
- [ ] **No locks held during external calls** — a transaction that calls an API while holding a row lock blocks all other writes to that row
- [ ] **Consistent lock ordering** — all code acquires locks in the same order to prevent deadlocks
- [ ] **Appropriate isolation level** — READ COMMITTED for most workloads. SERIALIZABLE is rarely needed and requires retry handling
- [ ] **Savepoints used judiciously** — useful for partial rollback in batch processing, but each has overhead

## Step 6: Migration Safety

One bad migration can lock a table for hours and take down production.

- [ ] **Never rename a column in one step** — add new, dual-write, backfill, switch reads, remove old (expand/contract)
- [ ] **Never add NOT NULL without a default on existing data** — rewrites the entire table in PG < 11
- [ ] **Never change a column type in-place** on large tables — use add/migrate/drop
- [ ] **Always CREATE INDEX CONCURRENTLY** — non-concurrent locks the table for writes during the entire build
- [ ] **SET lock_timeout before DDL** — fail fast rather than blocking all queries while waiting for AccessExclusive lock
- [ ] **Data backfills outside migration transactions** — use separate scripts with batched updates
- [ ] **Migrations are reversible** — can run forward and backward
- [ ] **No destructive migrations** (dropping columns) without deprecation period and verification that nothing reads the column

## Step 7: Data Integrity

The database is the last line of defense. Application-level constraints are bypassed by direct DB access, scripts, and race conditions.

- [ ] **NOT NULL, UNIQUE, FK, CHECK constraints at the database level** — not just application code
- [ ] **No "implicit" foreign keys** — columns named `*_id` without an actual FK constraint
- [ ] **ON DELETE behavior is intentional** — CASCADE, SET NULL, or RESTRICT matches business intent. CASCADE on the wrong table deletes thousands of rows
- [ ] **Check constraints on bounded values** — prices ≥ 0, status IN ('pending', 'active', 'cancelled'), end_date ≥ start_date
- [ ] **Unique constraints for logical uniqueness** — `(tenant_id, email)`, `(user_id, role)`, `(order_id, product_id)`. Partial unique indexes for soft deletes
- [ ] **No orphaned records** — children referencing non-existent parents, soft-deleted parents with active children
- [ ] **App-level uniqueness checks have matching DB unique indexes** — without the index, race conditions create duplicates

## Step 8: Operational Health

Run diagnostic queries to assess the current state of the database.

- [ ] **Dead tuple ratio** — tables with >10% dead tuples means autovacuum is falling behind
- [ ] **Autovacuum running** — verify enabled, check `last_autovacuum` for all tables. High-churn tables may need custom settings
- [ ] **Sequential scans on large tables** — tables with high `seq_scan` and low `idx_scan` are missing indexes
- [ ] **Long-running transactions** — transactions open >5 minutes block vacuum. Common source: background jobs doing HTTP calls inside transactions
- [ ] **Connection count by state** — growing idle connections indicate leaks
- [ ] **Replication lag** — if using replicas, lag is within RPO window. No inactive replication slots blocking WAL cleanup
- [ ] **Statistics freshness** — `last_autoanalyze` is recent for all tables. Stale statistics = bad query plans
- [ ] **Backup tested** — backup exists AND has been restored to a test server. Untested backups are not backups

## Output Format

```
## Database Audit Summary
- **Scope:** [Tables, schemas, query patterns audited]
- **Database:** [Engine, version, size, table count]
- **Verdict:** [HEALTHY / NEEDS ATTENTION / CRITICAL ISSUES]

## Schema Design
- [Normalization, naming, data type, nullable column findings]

## Index Strategy
- [Missing indexes, redundant indexes, composite index order]
- **Impact:** [Estimated query improvement]

## Query Patterns
- [N+1, unbounded queries, full table scans, pagination issues]

## Connection & Transaction
- [Pool sizing, leaks, timeout config, long-running transactions]
- **Risk Level:** [Critical / High / Medium / Low]

## Migration Safety
- [Unsafe patterns, missing CONCURRENTLY, lock risks]

## Data Integrity
- [Missing constraints, orphaned records, implicit FKs]

## Operational Health
- [Dead tuples, vacuum status, replication, backup status]

## Critical Issues (Must Fix)
- [Issue with table/query location and fix]

## Important Issues (Should Fix)
- [Issue with reasoning]

## Diagnostic Queries Run
- [Key findings from EXPLAIN ANALYZE, pg_stat_*, etc.]

## Top 5 Actions
1. [Highest-priority action]
2. ...
3. ...
4. ...
5. ...
```

## Success Criteria

- Schema design has been audited for normalization, naming, data types, and nullable columns
- Every foreign key column has been checked for index existence
- Query patterns have been analyzed for N+1, unbounded queries, and pagination issues
- Connection pooling and timeout configuration have been verified
- Transaction patterns have been checked for long-running transactions and lock contention
- Migration safety has been assessed against zero-downtime deployment requirements
- Data integrity constraints have been verified at the database level — not just application code
- Operational health diagnostics have been run and interpreted
