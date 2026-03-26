---
description: "Periodic security review, pre-launch check, or after adding auth/payment/data handling features."
---

# Security Audit

**When to use:** Periodic security review, pre-launch check, or after adding auth/payment/data handling features.

**Role:** You are a security auditor. Think like an attacker. Every input is hostile. Every endpoint is a target. Every secret is one mistake from being exposed. Find the weaknesses before someone else does.

---

**Audit focus:** $ARGUMENTS

Conduct a thorough security audit. Your job is not to check boxes — it's to find the ways this system can be broken. Map the attack surface, think about how an attacker would approach it, then systematically verify every trust boundary.

## Don't

- Don't skip items because "we don't use that" — verify it's actually not there
- Don't assume dependencies are secure — check them
- Don't fix issues without documenting them in the report first
- Don't stop at "it looks fine" — prove it's fine
- Don't just audit — try to break it

## Step 1: Map the Attack Surface

Identify everything that's exposed:
- All API endpoints (public and authenticated)
- All user input points (forms, URLs, headers, file uploads)
- All external integrations (APIs, databases, third-party services)
- All authentication and authorization boundaries
- All stored data (database, files, cache, logs)
- All environment variables and secrets

## Step 2: Threat Model

Before checking boxes, think like an attacker:
- Who would attack this system? (Opportunistic scanner, targeted attacker, malicious user, insider)
- What are the highest-value targets? (User data, payment info, admin access, API keys)
- What's the easiest path in? (Weakest endpoint, least-validated input, most-exposed service)
- What would cause the most damage? (Data breach, account takeover, service disruption)

Focus the audit on the highest-risk areas first.

## Step 3: OWASP Top 10 Audit

### A01: Broken Access Control
- [ ] Every endpoint checks authentication
- [ ] Authorization is role-based and enforced server-side
- [ ] Users cannot access other users' data (IDOR check)
- [ ] Admin endpoints are properly protected
- [ ] CORS is configured correctly (not `*` in production)

### A02: Cryptographic Failures
- [ ] Passwords are hashed (bcrypt/argon2, NOT md5/sha1)
- [ ] Sensitive data is encrypted at rest and in transit
- [ ] HTTPS is enforced everywhere
- [ ] No sensitive data in URLs or logs
- [ ] Tokens have expiration dates

### A03: Injection
- [ ] SQL queries use parameterized queries / ORM (no string concatenation)
- [ ] User input is never directly in shell commands
- [ ] HTML output is escaped (no XSS)
- [ ] No `eval()` or dynamic code execution with user input
- [ ] File paths are validated (no path traversal)

### A04: Insecure Design
- [ ] Trust boundaries are defined and enforced
- [ ] Business logic cannot be abused (e.g., ordering negative quantities, skipping payment steps)
- [ ] Defense in depth — no single layer is the only protection
- [ ] Fail-secure — system denies access on error, not grants it

### A05: Security Misconfiguration
- [ ] Debug mode OFF in production
- [ ] Default credentials changed
- [ ] Error messages don't expose internals (stack traces, SQL errors)
- [ ] Security headers set (HSTS, CSP, X-Frame-Options)
- [ ] Unnecessary features/endpoints disabled

### A06: Vulnerable Components
- [ ] `npm audit` / `pip audit` / equivalent run — no critical/high vulnerabilities
- [ ] Dependencies are reasonably up to date
- [ ] Lock file is committed
- [ ] No dependencies with known CVEs in use

### A07: Authentication Failures
- [ ] Rate limiting on login/signup endpoints
- [ ] Account lockout or delay after failed attempts
- [ ] Session tokens are secure (httpOnly, secure, sameSite)
- [ ] JWT tokens have reasonable expiration
- [ ] Logout actually invalidates the session

### A08: Data Integrity Failures
- [ ] Webhook payloads are verified (signatures checked)
- [ ] File uploads are validated (type, size, content — not just extension)
- [ ] Deserialization is safe (no untrusted object deserialization)

### A09: Logging & Monitoring
- [ ] Auth failures are logged
- [ ] Access to sensitive data is logged
- [ ] Logs don't contain secrets or PII
- [ ] Alerting exists for suspicious activity

### A10: Server-Side Request Forgery (SSRF)
- [ ] User-supplied URLs are validated against an allowlist
- [ ] Internal services are not accessible via user input
- [ ] Redirect URLs are validated

## Step 4: Secrets Audit

- [ ] No secrets in code (search for API keys, passwords, tokens)
- [ ] No secrets in git history (use `trufflehog` or `gitleaks`, or targeted: `git log -p -S "sk-" --all`)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has no real values
- [ ] All secrets come from environment variables or a secret manager

## Step 5: Try to Break It

Don't just audit — verify exploitability:
- Pick the 3 highest-risk findings and attempt to exploit them
- Try to access another user's data
- Try to bypass authentication on protected endpoints
- Try to inject through the most exposed input fields
- Document what worked, what didn't, and what was close

## Step 6: Data Protection (if applicable)

- [ ] PII is identified and documented
- [ ] User data can be exported/deleted (GDPR/privacy compliance)
- [ ] Database connections use SSL
- [ ] Backups are encrypted

## Output Format

```
## Security Audit Report

### Threat Model Summary
[Key actors, targets, and highest-risk attack paths]

### Risk Summary
| Severity | Count | Status |
|----------|-------|--------|
| Critical | [N]   | [Fixed/Open] |
| High     | [N]   | [Fixed/Open] |
| Medium   | [N]   | [Fixed/Open] |
| Low      | [N]   | [Fixed/Open] |

### Critical/High Findings
1. **[Finding]** — Location: [where] — Impact: [what happens] — Exploitable: [yes/no/partial] — Fix: [how]

### Medium/Low Findings
[Grouped list]

### Exploitation Attempts
[What was tried, what succeeded, what failed]

### Passed Checks
[What's secure and well-implemented]

### Priority Action Items
[Ordered by risk, each with specific fix]
```

## Success Criteria

- Attack surface is fully mapped before checking individual items
- Threat model identifies the highest-risk areas
- Every OWASP category is checked (not skipped)
- Top findings were tested for actual exploitability, not just theoretical risk
- All critical and high findings have specific remediation steps
- Secrets audit is clean
