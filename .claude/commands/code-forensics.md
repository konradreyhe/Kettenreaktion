---
description: "When you have a large codebase and need to know WHERE to focus your review effort. Not every file needs equal attention — some files are ticking time bombs (changed frequently AND complex), some have hidden coupling (always change together but shouldn't), and some are knowledge risks (only one person understands them). This template uses git history as a crime scene to find the hotspots, the hidden dependencies, and the risk clusters. Use before a major refactor, when inheriting a codebase, when planning review strategy for a large project, or when something keeps breaking and you don't know why."
---

# Code Forensics — Git History Risk Analysis

**When to use:** When you have a large codebase and need to know WHERE to focus your review effort. Not every file needs equal attention — some files are ticking time bombs (changed frequently AND complex), some have hidden coupling (always change together but shouldn't), and some are knowledge risks (only one person understands them). This template uses git history as a crime scene to find the hotspots, the hidden dependencies, and the risk clusters. Use before a major refactor, when inheriting a codebase, when planning review strategy for a large project, or when something keeps breaking and you don't know why.

**Role:** You are a code forensics investigator. Your tools are git log, git blame, and statistical analysis. You know that the files with the most bugs are the files that change the most AND have the highest complexity — not the ones that "look messy." You know that files committed together reveal hidden coupling that architecture diagrams don't show. You know that code owned by a single developer who left is a knowledge risk. You read the git history like a crime scene — every commit tells a story about what went wrong, what was patched urgently, and where the bodies are buried.

---

**Forensics scope:** $ARGUMENTS

Analyze the git history of this codebase to identify risk hotspots, hidden coupling, knowledge risks, and change patterns. Guide where to invest review effort for maximum bug-prevention ROI. The goal is not to find bugs directly — it's to find WHERE bugs are most likely to hide.

## Don't

- Don't just look at current code — the HISTORY tells you what's unstable, what's risky, and what's coupled
- Don't treat all files equally — 80% of bugs come from 20% of files. Find that 20%.
- Don't confuse "old code" with "stable code" — old code that nobody understands is the RISKIEST code
- Don't ignore merge commits and reverts — they indicate integration pain points
- Don't skip the human element — who wrote what matters for knowledge risk assessment
- Don't over-index on LOC — a 50-line file that changes every week is riskier than a 500-line file that hasn't changed in a year

## Step 1: Hotspot Analysis (Churn × Complexity)

The most powerful single technique. Files that are BOTH frequently changed AND complex are your highest-risk targets.

### Measure Change Frequency (Churn)
- Count revisions per file over the last 6-12 months
- Rank files by number of commits that modified them
- Identify the top 20 most-changed files — these are your primary investigation targets

### Measure Complexity
For each high-churn file:
- Lines of code (rough proxy)
- Number of functions/methods
- Cyclomatic complexity (if measurable)
- Nesting depth

### Calculate Risk Score
```
Risk = Churn × Complexity
```
Files in the top-right quadrant (high churn + high complexity) are your #1 priority. These files:
- Change frequently → high probability of introducing bugs
- Are complex → high probability that changes introduce SUBTLE bugs
- Account for a disproportionate share of production incidents

## Step 2: Temporal Coupling Analysis

Files that always change together have hidden coupling — even if they're in different modules.

### Detect Co-Change Patterns
- Analyze commits: which files are modified in the same commit?
- Identify pairs/clusters of files that co-change frequently (>3 times in the analysis period)
- Flag co-changes that cross module/package boundaries — these indicate coupling your architecture doesn't acknowledge

### Interpret Results
- **Expected coupling**: a service file and its test file always change together → normal
- **Unexpected coupling**: `auth.service` and `billing.service` always change together → hidden dependency
- **Shotgun surgery**: a single logical change requires modifications to 5+ files across different modules → poor encapsulation

## Step 3: Knowledge Risk Analysis

Code is a knowledge asset. When knowledge is concentrated in one person, it's at risk.

### Author Analysis
- For each high-risk file (from Step 1), who are the authors?
- Calculate "bus factor" per module — how many people understand this code?
- Identify modules where >80% of changes come from a single author
- Flag modules where the primary author is no longer on the team

### Knowledge Distribution Map
```
Module: [name]
Primary author: [name] ([X]% of commits)
Secondary authors: [names]
Bus factor: [N] — [LOW / MEDIUM / HIGH risk]
Last change by primary author: [date]
```

## Step 4: Change Pattern Analysis

What does the commit history reveal about code health?

### Bug Fix Frequency
- Identify commits that are bug fixes (look for: "fix", "bug", "patch", "hotfix", "revert" in commit messages)
- Map bug fixes to files — which files have the most bug-fix commits?
- Files with frequent bug fixes AND high complexity are actively problematic, not just risky

### Revert Analysis
- Find all reverted commits — these indicate changes that broke something
- Which files are most frequently involved in reverts?
- What patterns do reverted changes share?

### Change Size Patterns
- Identify unusually large commits (many files changed at once) — these are higher risk for introduced bugs
- Identify "ripple" patterns — a small change in file A that requires changes in files B, C, D, E
- Flag recent large refactors — newly refactored code hasn't been battle-tested yet

## Step 5: Code Age Analysis

How old is each part of the codebase?

- **Ancient code** (12+ months untouched): Either very stable OR very risky (nobody dares change it)
- **Active code** (changed in last 3 months): Recently tested by changes, lower risk of stale bugs
- **Recently created code** (new in last 1-2 months): Hasn't been battle-tested yet

The most dangerous combination: **ancient code with high complexity that suddenly needs to change.**

## Step 6: Synthesize Risk Map

Combine all factors into a prioritized risk map:

```
Priority 1 (Immediate attention):
  - High churn + high complexity + low bus factor + frequent bug fixes

Priority 2 (Near-term review):
  - High churn + moderate complexity
  - Or: low churn but low bus factor and high complexity (knowledge risk)

Priority 3 (Monitor):
  - Moderate churn + moderate complexity + good bus factor

Priority 4 (Low concern):
  - Low churn + low complexity + multiple authors
```

---

## Output Format

```
## Code Forensics Report

### Analysis Period
[Date range, total commits analyzed, total files analyzed]

### Top 20 Hotspots (Churn × Complexity)
| Rank | File | Commits | LOC | Risk Score | Top Author | Bug Fixes |
|------|------|---------|-----|------------|------------|-----------|
| 1 | ... | ... | ... | ... | ... | ... |

### Temporal Coupling Clusters
| Files | Co-Changes | Expected? | Implication |
|-------|-----------|-----------|-------------|
| [A, B, C] | [N times] | [yes/no] | [hidden dependency / shotgun surgery / normal] |

### Knowledge Risk Map
| Module | Bus Factor | Primary Author | Still Active? | Risk |
|--------|-----------|----------------|---------------|------|
| ... | ... | ... | ... | ... |

### Bug-Prone Files
[Files with most bug-fix commits, mapped against complexity]

### Change Patterns
- Reverted commits: [N, with affected files]
- Large commits: [commits touching 10+ files]
- Ripple patterns: [small changes causing widespread modifications]

### Risk Synthesis

#### Priority 1: Immediate Attention
[Files/modules requiring urgent review — high risk on multiple dimensions]

#### Priority 2: Near-Term Review
[Files/modules to review within the next sprint]

#### Priority 3: Monitor
[Files to watch but not urgently review]

### Strategic Recommendations
1. [Where to invest refactoring effort for maximum risk reduction]
2. [Knowledge transfer priorities]
3. [Architectural improvements to reduce coupling]
4. [Testing priorities — what to test first]
```

## Success Criteria

- Git history analyzed over a meaningful period (6-12 months minimum)
- Top 20 hotspots identified with both churn and complexity metrics
- Temporal coupling analysis reveals hidden dependencies between files/modules
- Knowledge risk assessed per module with bus factor calculation
- Bug-fix patterns mapped to specific files
- Risk synthesis combines all dimensions into actionable priorities
- Recommendations are specific and actionable — not generic "add more tests"
