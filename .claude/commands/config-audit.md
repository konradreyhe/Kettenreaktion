---
description: "When you need confidence that your configuration, infrastructure code, and deployment setup are correct, secure, and consistent across environments. Dockerfiles, CI/CD pipelines, environment variables, feature flags, Kubernetes manifests, Terraform, GitHub Actions. Application code gets reviewed religiously — infrastructure code barely gets glanced at. Yet 67% of production incidents trace to configuration drift. Use before production launch, after infrastructure changes, when \"it works locally but not in staging,\" or when configuration has grown organically without review."
---

# Configuration Audit — Infrastructure & Environment Review

**When to use:** When you need confidence that your configuration, infrastructure code, and deployment setup are correct, secure, and consistent across environments. Dockerfiles, CI/CD pipelines, environment variables, feature flags, Kubernetes manifests, Terraform, GitHub Actions. Application code gets reviewed religiously — infrastructure code barely gets glanced at. Yet 67% of production incidents trace to configuration drift. Use before production launch, after infrastructure changes, when "it works locally but not in staging," or when configuration has grown organically without review.

**Role:** You are a DevOps security engineer and infrastructure reviewer. You know that a misconfigured Dockerfile ships vulnerabilities to every environment. A CI/CD pipeline with exposed secrets is a supply chain attack vector. Environment variable drift between dev/staging/prod causes the bugs that are hardest to diagnose because the CODE is correct — the CONFIGURATION is wrong. You've seen production go down because someone hardcoded a dev URL, because a feature flag was on in staging but off in prod, because the health check was checking the wrong endpoint.

---

**Audit scope:** $ARGUMENTS

Audit all configuration, infrastructure code, and environment management in scope. Every env var, every Dockerfile, every CI/CD pipeline, every deployment config. Find the drift, the secrets, the inconsistencies, and the fragile defaults.

## Don't

- Don't assume infra code doesn't need review — it runs in every environment and affects every user
- Don't skip CI/CD pipelines — they have access to secrets, deployment credentials, and production systems
- Don't trust "it's the same in all environments" — verify it. Config drift is silent.
- Don't ignore feature flags — stale flags are tech debt that creates hidden code paths
- Don't assume Docker images are secure — base images have CVEs, layers leak secrets
- Don't skip .env files and their examples — missing env vars cause startup crashes in production

## Step 1: Environment Variable Audit

- [ ] **Complete inventory** — list every env var the application reads. Is each one documented?
- [ ] **Startup validation** — does the app validate ALL required env vars at startup and fail fast with clear errors if missing?
- [ ] **Default values** — are defaults safe? A default database URL pointing to localhost is fine for dev, dangerous if it silently falls through in prod.
- [ ] **Type safety** — env vars are strings. Are they parsed and validated (port is a number, URL is valid, boolean is true/false not "yes")?
- [ ] **Environment parity** — compare dev, staging, and prod configs. What differs? Is every difference intentional and documented?
- [ ] **Secret management** — secrets in env vars only, never in code, never in git history. Using a secret manager (Vault, AWS Secrets Manager) for production?
- [ ] **.env.example** — does it exist? Does it list every required var? Does it have safe placeholder values (not real secrets)?
- [ ] **No secrets in logs** — env vars containing secrets are not logged at startup or in error messages

## Step 2: Docker & Container Audit

- [ ] **Base image** — using a specific tag (not `latest`), from a trusted source, regularly updated. Alpine/distroless preferred for smaller attack surface.
- [ ] **Multi-stage build** — build dependencies not in the production image. `devDependencies` not installed in prod.
- [ ] **Non-root user** — container runs as non-root. No `USER root` in the final stage.
- [ ] **No secrets in image** — no `.env` files, credentials, or API keys baked into the image. Check every `COPY` and `ADD`.
- [ ] **Layer optimization** — instructions ordered for cache efficiency. Dependency install before code copy.
- [ ] **Health check** — `HEALTHCHECK` instruction defined. Points to actual health endpoint.
- [ ] **Resource limits** — memory and CPU limits defined in orchestration (compose, k8s). No unbounded resource usage.
- [ ] **Signal handling** — app handles SIGTERM for graceful shutdown. Not running as PID 1 without init system (or using `tini`/`dumb-init`).
- [ ] **.dockerignore** — node_modules, .git, .env, test files excluded from build context

## Step 3: CI/CD Pipeline Audit

- [ ] **Secret exposure** — no secrets printed to logs, no secrets in environment that forks can access, no secrets available to PRs from forks
- [ ] **Pinned actions/dependencies** — GitHub Actions pinned to SHA (not `@main`), CI dependencies use lock files
- [ ] **Permissions** — pipeline runs with minimum necessary permissions. No `permissions: write-all` without justification.
- [ ] **Branch protection** — main/prod branches require PR review, passing CI, no force push
- [ ] **Test execution** — tests actually run in CI and block merge on failure. Not skippable.
- [ ] **Security scanning** — dependency audit, SAST, container scanning in the pipeline
- [ ] **Build reproducibility** — same commit always produces the same artifact. No external fetches during build.
- [ ] **Deployment gates** — production deployment requires approval, not just a passing build
- [ ] **Rollback capability** — can you deploy the previous version quickly if something goes wrong?

## Step 4: Feature Flag Audit

- [ ] **Flag inventory** — list every feature flag. When was each created? Who owns it?
- [ ] **Stale flags** — flags older than 90 days that are permanently on or permanently off. These are dead code branches.
- [ ] **Flag cleanup plan** — is there a process for removing flags after feature is fully rolled out?
- [ ] **Flag consistency** — flags have the same value across environments where they should match
- [ ] **Flag-dependent code paths** — complex flag combinations creating untested code paths. N flags = 2^N possible states.
- [ ] **Default values** — what happens when the flag service is unreachable? Safe defaults?

## Step 5: Infrastructure-as-Code Audit (if applicable)

- [ ] **State management** — Terraform state stored remotely and locked. No local state files.
- [ ] **Least privilege** — IAM roles, security groups, network policies follow least privilege
- [ ] **Encryption** — data at rest encrypted. TLS for all transit. Certificates not expired.
- [ ] **Network segmentation** — database not publicly accessible. Internal services not exposed.
- [ ] **Backup configuration** — automated backups configured with tested restore procedures
- [ ] **Resource tagging** — resources tagged for cost allocation and ownership
- [ ] **No hardcoded values** — IPs, ARNs, account IDs parameterized, not hardcoded

## Step 6: Configuration Drift Detection

Compare configurations across environments:

- [ ] **Env var diff** — systematically compare dev/staging/prod env vars. Flag differences that aren't documented.
- [ ] **Infrastructure diff** — staging infra matches prod topology (or differences are documented and justified)
- [ ] **Version drift** — runtime versions (Node.js, database, Redis) match across environments
- [ ] **Config file drift** — nginx.conf, database.conf, redis.conf consistent across environments
- [ ] **Recently changed config** — config changes in the last 30 days reviewed for correctness and consistency

---

## Output Format

```
## Configuration Audit Report

### Scope
[What was audited — environments, infrastructure, pipelines]

### Environment Variables
- Total vars: [N]
- Documented: [N/N]
- Validated at startup: [YES/NO]
- Drift between environments: [N differences found]

### Docker/Container ✅/❌
[Findings — base image, secrets, user, health check]

### CI/CD Pipeline ✅/❌
[Findings — secret exposure, permissions, pinning, gates]

### Feature Flags
- Total flags: [N]
- Stale (>90 days, permanent state): [N]
- Cleanup plan exists: [YES/NO]

### Infrastructure-as-Code ✅/❌ (if applicable)
[Findings — state, least privilege, encryption, network]

### Configuration Drift
| Config Item | Dev | Staging | Prod | Intentional? |
|-------------|-----|---------|------|--------------|
| [item] | [value] | [value] | [value] | [yes/no] |

### Issues Found

#### [CFG-1] [Description]
- **Category:** [Env Var / Docker / CI/CD / Flag / IaC / Drift]
- **Severity:** Critical / High / Medium / Low
- **Location:** [file or environment]
- **Impact:** [What goes wrong]
- **Fix:** [Specific remediation]

### Recommendations
1. [Highest-priority fix]
2. [Second priority]
3. [Third priority]
```

## Success Criteria

- All environment variables inventoried and validated for startup checks
- Docker configuration reviewed for security (non-root, no secrets, pinned base)
- CI/CD pipelines audited for secret exposure and minimum permissions
- Feature flags inventoried with age and staleness assessment
- Configuration drift between environments systematically detected
- Every finding has a specific location, impact, and fix
