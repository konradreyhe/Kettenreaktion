---
description: "Periodic maintenance. Make sure everything is well documented, organized, consolidated. No mess. No chaos. Professional."
---

# Housekeeping & Cleanup

**When to use:** Periodic maintenance. Make sure everything is well documented, organized, consolidated. No mess. No chaos. Professional.

**Role:** You are the project's janitor and librarian. Your job is to leave this codebase cleaner, more organized, and better documented than you found it.

---

**Focus areas:** $ARGUMENTS

Perform a full housekeeping audit. Make sure all is well documented and organized. Docs consolidated. Docs updated. No variety of weird files in root. No dead code. No orphaned configs. Everything has a place and a purpose.

## Don't

- Don't delete files without understanding what they do first
- Don't consolidate docs that serve different audiences
- Don't remove "unused" code without verifying it's actually unused
- Don't make this a refactoring session – focus on cleanup only
- Don't skip the before/after metrics – that's how you prove value

## Step 0: Take Inventory (Before Metrics)

Before changing anything, record the current state:
- Total `.md` files: [count]
- Files in root directory: [list]
- `npm audit` results: [summary]
- Unused dependencies: [list]
- Known documentation gaps: [list]
- Local git branches: [count]
- Stale remote-tracking branches: [count]
- Deployed artifacts / VM state: [summary if applicable]

This is your "before" snapshot to measure progress.

## Step 1: Documentation Audit

Read EVERY markdown file in the project. For each one, ask:
- Is this still accurate? Does it reflect the actual current state?
- Does this duplicate content from another doc?
- Does anyone need this? Does it have a clear purpose and audience?
- When was this last relevant?

**Actions:**
- **Outdated** → Update to reflect reality or delete if no longer relevant
- **Duplicate** → Merge into the single source of truth, delete the copy
- **Orphaned** → If no one needs it, remove it
- **Missing** → If there's a gap (feature without docs), flag it

**Key docs to verify:**
- `CLAUDE.md` – Does it accurately describe the project?
- `README.md` – Would a new developer understand the project from this?
- Any guides in `docs/` – Still correct? Still needed?

## Step 2: Root Directory Cleanup

The root directory should be CLEAN. Only these belong there:
- Config files that MUST be in root (package.json, tsconfig, .eslintrc, etc.)
- Entry points (README.md, CLAUDE.md)
- Standard files (.gitignore, .env.example, LICENSE)

Everything else goes in appropriate subdirectories. Ask for each root file:
- Does this HAVE to be here, or can it live in `src/`, `docs/`, `config/`?
- Is this a leftover from debugging, testing, or experimentation?
- Is this actually used by anything?

## Step 3: Dead Code & File Cleanup

Search for and eliminate:
- Unused imports and exports
- Commented-out code blocks (either restore with reason or delete)
- Empty files or placeholder files
- Unused components, functions, or modules
- `console.log` / debug statements left in production code
- TODO comments without context (add context or create an issue)

## Step 4: Dependency Audit

- Run `npm audit` (or equivalent) – fix or document vulnerabilities
- Identify unused dependencies (`depcheck` or manual review)
- Remove anything not actually imported/used
- Verify lock file is committed and current
- Check for outdated major versions that might need attention

## Step 5: Configuration Review

- `.env.example` – Does it list ALL required env vars? Are descriptions clear?
- TypeScript/ESLint/Prettier configs – Appropriate? Consistent?
- Build scripts – Do they all work? Any dead scripts?
- Are there hardcoded values that should be configurable?

## Step 6: Git Hygiene

Clean up the version control layer:

**Branches:**
- List all local branches — delete any that are merged or abandoned
- Check for stale remote-tracking branches (`git remote prune origin`)
- Is the default branch naming consistent?
- Are there branches that diverged long ago and will never merge?

**History & Tags:**
- Are there tags that should exist but don't (releases, milestones)?
- Are there orphaned tags pointing to nothing useful?
- Any large files accidentally committed that should be in `.gitignore`?

**Git Config:**
- `.gitignore` — complete? Missing any generated files, IDE configs, OS artifacts?
- `.gitattributes` — appropriate for the project?
- Any sensitive data in git history that shouldn't be there?

## Step 7: VM / Server / Deployment Cleanup

If the project runs on remote infrastructure, audit that too:

**Deployed Artifacts:**
- Old deployments, containers, or images still running or stored?
- Stale builds or artifacts taking up disk space?
- Orphaned resources (databases, storage buckets, DNS entries) from old features?

**Logs & Temp Files:**
- Log rotation configured? Are logs growing unbounded?
- Temp files, crash dumps, or debug artifacts accumulating?
- Old backups that should be archived or deleted?

**Environment & Config:**
- Environment variables still accurate? Any stale keys or endpoints?
- Are staging/dev environments in sync with what the code expects?
- SSL certs, API keys, tokens — any expiring soon?

**Monitoring & Alerts:**
- Are health checks and monitoring still pointing at the right things?
- Any alerts that fire constantly and get ignored? Fix or remove them.

*Note: Skip this step if the project is local-only / not deployed.*

## Step 8: Consolidation

This is the most important step. Consolidate aggressively:
- Multiple docs covering the same topic → merge into one
- Scattered config files → centralize where possible
- Redundant helper functions → single utility
- Multiple similar patterns → standardize on one

**Before removing anything, document:**
- What was removed and why
- What it was replaced with (if applicable)
- Risk of removal (none/low/medium)

## Step 9: After Metrics & Report

Record the new state and produce a summary:

```
## Housekeeping Report – [Date]

### Before → After
- .md files: [X] → [Y] ([consolidated/removed])
- Root files: [X] → [Y]
- Unused dependencies: [X] → [Y]
- Vulnerabilities: [X] → [Y]
- Git branches (local): [X] → [Y]
- Stale remote branches: [X] → [Y]
- Deployed artifacts cleaned: [list if applicable]

### Changes Made
- [What was cleaned up]
- [What was consolidated]
- [What was removed and why]

### Issues Found (Need Separate Attention)
- [Things that need more than housekeeping to fix]

### Recommendations
- [What should be done next time]
- [Recurring mess patterns to address at the source]
```

## Success Criteria

- Root directory is clean – every file has a clear reason to be there
- No duplicate documentation – each topic has exactly one source of truth
- No dead code, unused deps, or orphaned files
- All remaining docs are accurate and up-to-date
- Git is clean – no stale branches, proper .gitignore, no accidental large files
- VM/deployment is clean – no orphaned artifacts, logs rotated, configs current (if applicable)
- The "after" metrics are measurably better than "before"
