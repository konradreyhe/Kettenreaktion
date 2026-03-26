---
description: "When you want AI to choose the right analysis for your project. Instead of picking from 20+ analysis templates yourself, let the AI read all context — codebase, git history, docs, current state — and decide which analysis template fits best right now."
---

# Auto-Analyze

**When to use:** When you want AI to choose the right analysis for your project. Instead of picking from 20+ analysis templates yourself, let the AI read all context — codebase, git history, docs, current state — and decide which analysis template fits best right now.

**Role:** You are a senior engineering consultant arriving at a new engagement. Your job is to assess the project's current situation, identify the most pressing concern, and run the RIGHT analysis — not a generic one. You're the doctor who diagnoses BEFORE prescribing.

---

**Focus area (optional):** $ARGUMENTS

You do NOT know what this project needs yet. Do not assume. Read everything, assess the situation, then pick the single most valuable analysis to run right now. If the user provided a focus area above, weight your decision toward that domain — but still verify it's the right call.

## Don't

- Don't skip the assessment and jump straight to an analysis
- Don't pick an analysis because it sounds impressive — pick the one that HELPS MOST
- Don't run multiple analyses — pick ONE, the highest-impact one
- Don't recommend an analysis you can't actually execute right now
- Don't ignore obvious red flags just because the user hinted at something else

## Step 1: Rapid Project Assessment

Read and absorb everything — fast but thorough:

- `CLAUDE.md`, `README.md`, `HANDOVER.md`, any docs
- `package.json` / `pyproject.toml` / equivalent — dependencies, scripts, versions
- Git log (last 20-30 commits) — what's the recent trajectory? Any patterns?
- Git status — anything uncommitted, in-progress, or messy?
- Project structure — size, complexity, tech stack
- Test suite — does it exist? Does it pass? Any obvious gaps?
- CI/CD — is it configured? Passing?
- Open TODOs, FIXMEs, HACK comments — where does the team KNOW there are problems?

Spend real effort here. The quality of your analysis choice depends entirely on how well you understand the project's current state.

## Step 2: Identify the Top Concern

Based on your assessment, identify what matters MOST right now. Consider:

| Signal | Suggests |
|--------|----------|
| Pre-launch or new deploy pipeline | `/deploy-checklist` or `/go-live-readiness` |
| Lots of recent changes, no review | `/code-review` or `/change-review` |
| Complex state machines or workflows | `/state-machine-audit` |
| Auth/permissions recently added or changed | `/permission-audit` or `/security-audit` |
| Performance complaints or heavy data processing | `/performance-hunt` or `/database-audit` |
| Frequent bugs in same area | `/code-forensics` or `/bug-hunt` |
| Growing dependency list, outdated packages | `/dependency-audit` |
| Error handling is inconsistent or missing | `/error-handling-audit` |
| Async code, workers, or shared state | `/concurrency-audit` |
| External API integrations | `/integration-audit` or `/api-audit` |
| Sensitive data (PII, payments, health) | `/data-flow-audit` |
| Complex config, multiple environments | `/config-audit` |
| Business logic duplicated or inconsistent | `/business-rule-audit` |
| Monitoring gaps, "flying blind" in production | `/observability-audit` |
| System needs to handle failures gracefully | `/resilience-audit` |
| Large codebase, no recent review | `/deep-scan` or `/tech-debt-analysis` |
| UI/accessibility concerns | `/accessibility-audit` |
| Planning a major migration or upgrade | `/migration-assessment` |
| Best practices unknown or drifting | `/best-practices` |
| Game project | `/game-tester`, `/game-design-audit`, or `/asset-quality-audit` |

This table is a guide, not a rulebook. Use your judgment. The project's actual state overrides any heuristic.

## Step 3: Justify Your Choice

Before executing, present your decision to the user:

**State clearly:**
1. **Project snapshot** — 2-3 sentence summary of what you found
2. **Top concern** — the single biggest issue or opportunity you identified
3. **Chosen analysis** — which template you're going to run and WHY
4. **Runner-up** — what you'd recommend running AFTER this one

**Example output:**
> **Project snapshot:** Node.js API with 45 endpoints, recent auth refactor (last 8 commits), no test changes accompanying the auth changes.
> **Top concern:** Auth code changed significantly with zero test coverage updates — high risk of permission gaps.
> **Chosen analysis:** `/permission-audit` — systematically verify every endpoint's authorization after the refactor.
> **Runner-up:** `/test-audit` — verify existing tests still test what they claim to.

Wait for user confirmation before proceeding. If they disagree, adjust.

## Step 4: Execute the Analysis

Once confirmed, run the chosen analysis with full intensity. Follow that template's methodology completely — don't half-do it because this is a "meta" prompt. The analysis should be indistinguishable from running the template directly.

Use the slash command to invoke it: run `/<chosen-template>` with any relevant focus arguments.

## Success Criteria

- [ ] Full project assessment completed — docs, git history, structure, tests all read
- [ ] Top concern identified with clear reasoning
- [ ] Analysis template chosen and justified (not guessed)
- [ ] User confirmed the choice before execution
- [ ] Chosen analysis executed with full depth — not a shallow pass
- [ ] Actionable next steps and follow-up analysis recommended

## Step 5: What's Next

After the analysis completes, recommend:
1. **Immediate actions** — what to fix NOW based on findings
2. **Next analysis** — which template to run next for continued improvement
3. **Cadence suggestion** — how often to re-run `/auto-analyze` for this project (weekly? before each release? after major changes?)
