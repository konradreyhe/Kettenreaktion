---
description: "Before deploying to production. Every time. No exceptions."
---

# Deploy Checklist

**When to use:** Before deploying to production. Every time. No exceptions.

**Role:** You are a deployment engineer. Your job is to make sure this deploy goes smoothly, nothing breaks, and if anything goes wrong, you can roll back instantly.

---

**Deploying:** $ARGUMENTS

Deploy is the moment of truth. One mistake here can break production for real users. Be methodical. Check everything. Know your rollback plan BEFORE you push.

## Don't

- Don't deploy without testing locally first
- Don't skip the checklist because "it's a small change"
- Don't deploy with failing tests or lint errors
- Don't deploy without a documented rollback plan
- Don't deploy when you can't monitor the result for at least 2 hours after

## Step 1: Rollback Plan (Before Anything Else)

Know how to undo this BEFORE you deploy:
- What is the rollback command? (Write it down now)
- How long does rollback take?
- Will rollback affect the database? (Migrations may need reverting)
- Who needs to be notified if rollback happens?
- What's the last known good state? (Commit hash, version number)

If you can't answer these, you're not ready to deploy.

## Step 2: Pre-Deploy Verification

Before touching production:
- [ ] All tests pass locally
- [ ] Lint passes clean
- [ ] Build succeeds
- [ ] The feature/fix works as expected in dev/staging
- [ ] No debug statements, console.logs, or test data left in code
- [ ] No hardcoded dev URLs or API keys
- [ ] Environment variables are set for production
- [ ] `.env.example` is up to date with any new variables

## Step 3: Database & Data (if applicable)

Skip if no database changes in this deploy:
- [ ] Database migrations are ready and tested
- [ ] Migrations are backwards-compatible (can roll back without data loss)
- [ ] No destructive migrations without explicit backup
- [ ] Seed data is not included in production migrations

## Step 4: Dependencies & Config

- [ ] No new dependencies with known vulnerabilities
- [ ] Lock file is committed and up to date
- [ ] Build config is correct for production
- [ ] API endpoints point to production services
- [ ] Third-party integrations configured for production (live keys, not test keys)

## Step 5: Deploy

- [ ] Note the current production state (commit hash, version)
- [ ] Run the deployment (CI/CD pipeline, manual deploy, whatever your process is)
- [ ] Watch deployment logs for errors — don't walk away
- [ ] Wait for deployment to complete fully before testing

## Step 6: Post-Deploy Verification

Immediately after deploy:
- [ ] App loads without errors
- [ ] Core user flow works end-to-end
- [ ] Auth works (login, signup, logout)
- [ ] Key API endpoints respond correctly
- [ ] No new errors in error tracking (Sentry, logs, etc.)
- [ ] Performance is not significantly degraded
- [ ] Monitor for 15-30 minutes — watch error rates and response times

If ANYTHING is wrong: execute the rollback plan from Step 1. Don't debug in production.

## Output

```
## Deploy Report

### Deployed
- Version/commit: [hash]
- Environment: [production]
- Changes: [brief description]
- Deploy time: [timestamp]

### Rollback Plan
- Previous version: [hash]
- Rollback command: [command]
- Rollback tested: YES/NO

### Post-Deploy Verification
- [ ] App loads: PASS/FAIL
- [ ] Core flow: PASS/FAIL
- [ ] Auth: PASS/FAIL
- [ ] Error rates: NORMAL/ELEVATED
- [ ] Monitoring period: [duration]

### Issues
[Any problems found and how they were resolved]
```

## Success Criteria

- Rollback plan was documented BEFORE deploying
- All pre-deploy checks passed
- App is live and working for real users
- No new errors in monitoring after 15+ minutes
- Team is notified of the deploy
