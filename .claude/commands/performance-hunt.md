---
description: "When you want to proactively find performance problems hiding in the codebase. No slowness complaint required — you're hunting. Systematically analyze algorithmic complexity, memory usage, resource management, and bottlenecks before they page someone at 3am."
---

# Performance Hunt — Proactive Performance Bug Hunting

**When to use:** When you want to proactively find performance problems hiding in the codebase. No slowness complaint required — you're hunting. Systematically analyze algorithmic complexity, memory usage, resource management, and bottlenecks before they page someone at 3am.

**Role:** You are a performance hunter. Not a premature optimizer. Not someone who benchmarks hello-world. You hunt for REAL performance bugs — the O(n²) hiding in a loop, the memory leak that takes 3 days to crash, the N+1 query that works fine with 10 rows and kills the database with 10,000. Find the things that will hurt at scale.

---

**Hunt scope:** $ARGUMENTS

Systematically analyze this codebase for hidden performance problems. Not micro-optimizations. Not "use const instead of let." REAL performance issues — algorithms that don't scale, memory that never gets freed, resources that get wasted, and operations that block when they shouldn't. Measure or prove it, don't guess.

## Don't

- Don't report micro-optimizations — `for` vs `forEach` doesn't matter. Find what DOES matter.
- Don't optimize without understanding the hot path — profile first, opinions second
- Don't assume something is slow — prove it with complexity analysis or concrete numbers
- Don't suggest caching everything — caching is a trade-off, not a free lunch
- Don't ignore the constants — O(n) with a massive constant can be worse than O(n log n)
- Don't focus on cold paths — a function called once at startup is not your target

## Step 1: Identify the Hot Paths

Before hunting, find where performance MATTERS:
- What are the most frequently executed code paths? (Request handlers, event loops, render cycles)
- What operations touch the most data? (Queries, batch processing, file I/O)
- What has user-facing latency? (API responses, page loads, UI interactions)
- What runs under resource pressure? (Concurrent users, large datasets, limited memory)
- What scales with input size? (List processing, search, aggregation, sorting)

Rank by impact. Hunt the hot paths first.

## Step 2: Algorithmic Complexity Audit

For every loop, recursion, and data operation on a hot path:
- **What's the actual Big-O?** Not what it looks like — what it IS. Nested loops hiding behind abstractions? `.filter().map().find()` chains that traverse the array 3 times?
- **Hidden quadratics:** Array `.includes()` inside a loop = O(n²). String concatenation in a loop. Repeated DOM queries. Sorting inside a loop. Building a result by repeated array spread.
- **Data structure mismatch:** Using an array where a Set/Map would be O(1) lookup. Linear search where binary search applies. Linked list where random access is needed.
- **Recursive blowups:** Unbounded recursion depth. Exponential branching without memoization. Stack overflow potential.
- **Sorting abuse:** Sorting when you only need min/max. Sorting already-sorted data. Unstable sorts where stability matters.

## Step 3: Memory & Resource Leak Hunting

Memory leaks are performance bugs that kill slowly:
- **Event listeners:** Added but never removed. Accumulating on every mount/navigate/interaction.
- **Timers & intervals:** `setInterval` without `clearInterval`. `setTimeout` in unmounted components.
- **Closures holding references:** Callbacks that capture large objects and prevent garbage collection.
- **Growing collections:** Maps/arrays/caches that grow without bounds or eviction.
- **DOM detachment:** Detached DOM nodes still referenced in JavaScript.
- **Stream/connection leaks:** File handles, database connections, HTTP connections opened but not closed on all paths (especially error paths).
- **Subscription leaks:** Observables, WebSocket listeners, pub/sub subscriptions not unsubscribed on cleanup.

## Step 4: Database & Query Performance

Every database interaction is a potential bottleneck:
- **N+1 queries:** Loading a list then querying individually for each item's details. The classic.
- **Missing indexes:** Queries that filter/sort on unindexed columns. Check `WHERE`, `ORDER BY`, `JOIN ON` clauses.
- **Over-fetching:** `SELECT *` when you need 2 columns. Loading full objects when you need a count. Fetching 10,000 rows to display 20.
- **Under-batching:** 100 individual INSERTs where a batch INSERT works. Individual API calls where bulk endpoints exist.
- **Connection management:** Opening new connections per request instead of pooling. Holding connections during long operations.
- **Missing pagination:** Unbounded queries that return everything. Result sets that grow with data volume.

## Step 5: I/O & Network Bottlenecks

I/O is almost always the bottleneck:
- **Synchronous I/O on hot paths:** `fs.readFileSync` in request handlers. Blocking the event loop.
- **Sequential when parallel is possible:** `await a(); await b(); await c();` when all three are independent. Should be `Promise.all`.
- **Missing timeouts:** HTTP requests, database queries, or external calls with no timeout. One slow dependency freezes everything.
- **Redundant network calls:** Fetching the same data multiple times in one request cycle. No request deduplication.
- **Large payloads:** Sending entire objects when a subset suffices. No compression. No streaming for large responses.
- **No backpressure:** Producing data faster than it can be consumed. Unbounded queues. Write flooding.

## Step 6: Rendering & UI Performance (if applicable)

Frontend performance has its own class of bugs:
- **Unnecessary re-renders:** Components re-rendering when their props haven't changed. Missing memoization on expensive components. Context providers causing full-tree re-renders.
- **Layout thrashing:** Reading layout properties (offsetHeight) then writing styles in a loop, forcing repeated reflow.
- **Large bundle size:** Importing entire libraries for one function. No code splitting. No tree shaking. Dynamic imports that should be lazy.
- **Unoptimized images/assets:** Massive images served at display size. No lazy loading. No format optimization (WebP/AVIF).
- **Main thread blocking:** Heavy computation on the main thread. Long tasks that exceed 50ms. Should use Web Workers or chunking.
- **Animation jank:** JavaScript-driven animations instead of CSS transitions. Animations triggering layout instead of composite-only properties.

## Step 7: Concurrency & Contention

Performance under load is different from performance in isolation:
- **Lock contention:** Multiple processes/threads competing for the same lock. Serialized access to shared resources.
- **Connection pool exhaustion:** More concurrent requests than pool size. Requests queueing for a connection.
- **Thundering herd:** Cache expiry causing all requests to hit the backend simultaneously.
- **Unbounded concurrency:** Spawning unlimited parallel operations that exhaust memory/CPU/connections.
- **Hot keys/partitions:** All traffic hitting the same cache key, database row, or partition.

## Step 8: Verify & Quantify

For every performance issue found:
1. **Identify the exact location** — file, function, line
2. **Prove the complexity** — show the actual Big-O with reasoning, or trace the resource leak path
3. **Estimate the impact** — at current scale AND at 10x scale. Is this a problem now or a ticking bomb?
4. **Classify severity:**
   - **Critical:** System crashes, OOM, timeouts under normal load, database locks
   - **High:** Noticeable user-facing latency, resource exhaustion under moderate load, scaling wall
   - **Medium:** Suboptimal but functional, will become high at 5-10x growth
   - **Low:** Measurable inefficiency but minimal user impact at foreseeable scale
5. **Propose a fix** — with the expected improvement (e.g., "O(n²) → O(n) by using a Map for lookups")

## Output Format

```
## Performance Hunt Report

### Scope
[What was analyzed — files, modules, hot paths identified]

### Summary
- Issues found: [N]
- Critical: [N] | High: [N] | Medium: [N] | Low: [N]

### Hot Paths Identified
[The critical performance paths that were analyzed, ranked by importance]

### Issues Found

#### [PERF-1] [Short description]
- **Severity:** Critical/High/Medium/Low
- **Location:** [file:line]
- **Category:** [Algorithm / Memory leak / N+1 / I/O / Rendering / Concurrency]
- **Current complexity/cost:** [What it does now]
- **At scale:** [What happens at 10x/100x]
- **Evidence:** [How you proved this is a real issue]
- **Fix:** [Proposed change with expected improvement]

#### [PERF-2] ...

### Scaling Risks
[Issues that aren't problems today but will be at predictable growth]

### Patterns Observed
[Recurring performance anti-patterns in the codebase]

### Well-Optimized Areas
[Code that handles performance well — acknowledge good work]
```

## Success Criteria

- Hot paths are identified and prioritized before hunting begins
- Every issue has proven complexity or measured impact, not just intuition
- No micro-optimization noise — every finding matters at realistic scale
- Each issue includes a concrete fix with expected improvement
- Scaling risks are identified even if current performance is acceptable
- If zero issues found, the report explains what was checked and why confidence is high
