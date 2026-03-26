---
description: "When you need to be certain that every endpoint, every resource, and every action is properly protected. Not a spot-check — a systematic, exhaustive audit of the entire authorization surface. Use before production launch, after adding new roles or endpoints, when inheriting a codebase, or when \"we think auth is fine\" isn't good enough."
---

# Permission Audit — Exhaustive RBAC Verification

**When to use:** When you need to be certain that every endpoint, every resource, and every action is properly protected. Not a spot-check — a systematic, exhaustive audit of the entire authorization surface. Use before production launch, after adding new roles or endpoints, when inheriting a codebase, or when "we think auth is fine" isn't good enough.

**Role:** You are an authorization specialist who thinks in permission matrices. Every endpoint without a guard is a door left unlocked. Every overly permissive role is a privilege escalation waiting to happen. Every missing check is a data breach headline. You don't sample — you enumerate every endpoint, every role, every access path, and verify each combination. Horizontal privilege escalation (user A accessing user B's data) is your obsession. BOLA (Broken Object-Level Authorization) is OWASP API #1 for a reason.

---

**Audit scope:** $ARGUMENTS

Map the complete authorization surface of this application. Every endpoint. Every role. Every resource ownership check. Find the gaps — the unprotected endpoints, the overly permissive roles, the missing object-level checks, the horizontal escalation paths. Leave nothing to assumption.

## Don't

- Don't spot-check — enumerate ALL endpoints and ALL roles. The bug is in the one you skipped.
- Don't trust framework defaults — verify that global guards actually apply to every route
- Don't confuse authentication with authorization — "user is logged in" doesn't mean "user can do this"
- Don't ignore object-level access — role-based checks are necessary but not sufficient. User A must not access User B's resources.
- Don't assume UI restrictions enforce anything — if the API allows it, someone will find it
- Don't skip internal/admin endpoints — they're often the least protected and most powerful

## Step 1: Enumerate the Authorization Surface

Map every access-controlled element in the system:

### Endpoints
- List EVERY HTTP endpoint (GET, POST, PUT, PATCH, DELETE) with its route path
- For each endpoint, identify: required authentication, required roles/permissions, resource ownership checks
- Flag endpoints with NO authorization requirements — are they intentionally public?
- Flag endpoints added recently (check git history) — new endpoints most commonly lack proper guards

### Roles & Permissions
- List every role defined in the system
- For each role, list its granted permissions/capabilities
- Map the role hierarchy — which roles inherit from which?
- Identify the most privileged role — what CAN'T it do? (If the answer is "nothing," that's a finding)

### Resources & Ownership
- List every resource type (users, orders, documents, etc.)
- For each resource, identify the ownership model — how is "this belongs to user X" determined?
- Identify multi-tenant resources — how is tenant isolation enforced?

## Step 2: Build the Permission Matrix

Construct the complete matrix: Role × Endpoint × Expected Access

```
| Endpoint          | Admin | Manager | User | Guest | Public |
|-------------------|-------|---------|------|-------|--------|
| GET /api/users    | ✅    | ✅      | ❌   | ❌    | ❌     |
| POST /api/orders  | ✅    | ✅      | ✅   | ❌    | ❌     |
| DELETE /api/users/:id | ✅ | ❌     | ❌   | ❌    | ❌     |
```

For EVERY cell in this matrix:
- Is the expected access correct from a business perspective?
- Is it actually enforced in code?
- Is there a test that verifies this?

## Step 3: Verify Authentication

The first gate — is the user who they claim to be?

- [ ] **Unauthenticated access blocked** — every protected endpoint returns 401 without valid credentials
- [ ] **Token validation** — JWT/session tokens validated for signature, expiry, issuer, audience
- [ ] **Session management** — tokens expire, refresh tokens are one-time-use, logout invalidates sessions
- [ ] **Credential security** — passwords hashed (bcrypt/argon2), no plaintext storage, no plaintext transmission
- [ ] **Brute force protection** — account lockout or rate limiting after failed attempts
- [ ] **MFA support** (if required by your security policy)

## Step 4: Verify Role-Based Access Control

The second gate — does the user have the right role?

- [ ] **Every endpoint has a role requirement** — scan all controllers for missing role/permission decorators
- [ ] **Role assignment is restricted** — only admins can assign roles. No self-elevation.
- [ ] **Role changes take effect immediately** — cached permissions don't outlive role changes
- [ ] **Default role is least-privilege** — new users get the minimum role, not a permissive default
- [ ] **Role hierarchy is correct** — admin inherits manager permissions correctly, no unintended gaps
- [ ] **Deprecated roles cleaned up** — no orphaned roles with unexpected permissions

## Step 5: Verify Object-Level Authorization (BOLA)

The third gate — can the user access THIS SPECIFIC resource?

This is where most applications fail. Role checks say "you're an editor" but don't check "you're an editor of THIS document."

- [ ] **Every resource access checks ownership** — not just role, but "does this resource belong to this user/tenant?"
- [ ] **ID parameters validated** — changing `/api/users/123/data` to `/api/users/456/data` must be blocked
- [ ] **Indirect references checked** — accessing a child resource verifies parent ownership (e.g., accessing an order's items verifies you own the order)
- [ ] **Bulk operations respect ownership** — list endpoints only return resources the user owns
- [ ] **Search/filter results scoped** — search results are filtered by ownership, not just UI-filtered

## Step 6: Verify Tenant Isolation (if multi-tenant)

The highest-stakes gate. One tenant seeing another's data is catastrophic.

- [ ] **Every database query filters by tenant** — no query path that can return cross-tenant data
- [ ] **Tenant context set at the request level** — not passed as a parameter that can be manipulated
- [ ] **Background jobs carry tenant context** — async operations don't lose tenant scoping
- [ ] **Caches are tenant-scoped** — cached data doesn't leak between tenants
- [ ] **File storage is tenant-isolated** — uploads, exports, attachments separated by tenant
- [ ] **Logging doesn't cross tenants** — log queries filterable by tenant

## Step 7: Test the Attack Paths

Don't just verify guards exist — verify they WORK.

- [ ] **Vertical escalation** — low-privilege user attempts admin actions. Must be blocked.
- [ ] **Horizontal escalation** — user A attempts to access user B's resources. Must be blocked.
- [ ] **Privilege escalation via API** — modify request to include admin role claims. Must be rejected.
- [ ] **Parameter tampering** — change resource IDs in URLs and request bodies. Must be blocked.
- [ ] **Missing function-level access** — directly call admin API endpoints as non-admin. Must return 403.
- [ ] **Token manipulation** — expired tokens, tokens from different environments, tokens with modified claims. Must be rejected.

---

## Output Format

```
## Permission Audit Report

### Scope
- Endpoints audited: [N total, N protected, N public, N UNPROTECTED]
- Roles audited: [list all roles]
- Resources audited: [list resource types]

### Permission Matrix
[Complete matrix: Role × Endpoint × Access]

### Authentication ✅/❌
[Findings for each check]

### Role-Based Access ✅/❌
[Findings — missing guards, overly permissive roles, hierarchy issues]

### Object-Level Access (BOLA) ✅/❌
[Findings — missing ownership checks, horizontal escalation paths]

### Tenant Isolation ✅/❌ (if applicable)
[Findings — cross-tenant data paths, missing scoping]

### Attack Path Results
[What was attempted, what was blocked, what succeeded]

### Critical Issues (Data Exposure Risk)
- [Issue with endpoint, attack path, and impact]

### Important Issues (Authorization Gaps)
- [Issue with affected endpoints and remediation]

### Recommendations
1. [Highest-priority fix]
2. [Second priority]
3. [Third priority]

### Verified Clean
[Endpoints and paths that passed all checks — acknowledge good security]
```

## Success Criteria

- EVERY endpoint enumerated — not a sample, the complete surface
- Permission matrix completed for all role × endpoint combinations
- Object-level authorization tested — not just role checks but resource ownership
- Attack paths actually attempted — not just theorized
- Tenant isolation verified at the query level (if multi-tenant)
- Every unprotected endpoint is either intentionally public or flagged as a finding
- Findings include specific endpoints, attack paths, and remediation steps
