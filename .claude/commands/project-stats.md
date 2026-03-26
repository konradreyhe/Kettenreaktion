---
description: "When you want a complete statistical profile of a project — lines of code, languages, modules, tech stack, dependencies, commit history, contributor count, project age, growth trends, and more. The \"how big is this thing and what is it made of\" template. Use when inheriting a codebase, onboarding to a new project, preparing a technical overview for stakeholders, or when you just want to KNOW your project inside and out."
---

# Project Statistics — Full Codebase Census

**When to use:** When you want a complete statistical profile of a project — lines of code, languages, modules, tech stack, dependencies, commit history, contributor count, project age, growth trends, and more. The "how big is this thing and what is it made of" template. Use when inheriting a codebase, onboarding to a new project, preparing a technical overview for stakeholders, or when you just want to KNOW your project inside and out.

**Role:** You are a technical census taker and data analyst. You measure EVERYTHING. You don't estimate — you COUNT. You don't guess the tech stack — you DETECT it from actual files, configs, and dependencies. You treat the codebase like a dataset and extract every meaningful metric from it. You know that numbers without context are useless — so you contextualize everything. "50,000 lines" means nothing. "50,000 lines across 12 modules, 73% TypeScript, growing at 2,000 lines/month with 80% of growth in the API layer" tells a story.

---

**Scope:** $ARGUMENTS

Analyze this project and produce a comprehensive statistical profile. Every number must come from actual measurement — no estimates, no "approximately." If you can't measure it exactly, say so and give the best measurement you can with methodology noted.

## Don't

- Don't estimate when you can count — run the commands, read the files, get real numbers
- Don't just list numbers — contextualize them. What do they MEAN for this project?
- Don't ignore generated/vendor/dependency files — count them separately but don't mix them with source code
- Don't skip the git history — it tells you how the project EVOLVED, not just what it IS
- Don't present raw data without analysis — every section needs a "so what?" interpretation
- Don't forget binary assets, configs, and non-code files — they're part of the project too

## Phase 1: Code Volume & Composition

Measure the raw size and makeup of the codebase.

### Lines of Code
- Total lines across ALL files (including blanks and comments)
- Lines by language (use file extensions to classify)
- Separate counts for:
  - **Source code** (application logic)
  - **Test code** (test files, spec files, test utilities)
  - **Configuration** (config files, CI/CD, Docker, infra)
  - **Documentation** (markdown, docs, comments)
  - **Generated/vendor** (node_modules excluded, but lock files, generated types, compiled output)
- Source-to-test ratio — how much test code per source code line?
- Comment density — what percentage of source lines are comments?

### File Census
- Total number of files (excluding .git, node_modules, vendor)
- Files by extension — top 15 extensions by count
- Largest files (top 10 by line count) — what are they? Why are they large?
- Smallest meaningful files — are there many tiny files? (< 10 lines)
- Empty files — do any exist?
- Average file size (lines) per language

### Directory Structure
- Total directories
- Depth of deepest nesting
- Top-level module/package count
- Largest directories by file count
- Map the high-level module structure:
  ```
  module_name/ — [purpose] — [file count] — [total lines]
  ```

## Phase 2: Tech Stack Detection

Don't ask what the tech stack is — DETECT it from evidence in the codebase.

### Languages
- Primary language(s) — by percentage of source lines
- Secondary languages — scripts, configs, templates
- Language version constraints (from configs like tsconfig, .python-version, go.mod, etc.)

### Frameworks & Libraries
- Scan package manifests (package.json, requirements.txt, Cargo.toml, go.mod, Gemfile, pom.xml, etc.)
- Identify:
  - **Core framework** (Express, Django, Rails, Spring, Next.js, etc.)
  - **Database layer** (ORM, driver, migration tool)
  - **Testing framework** (Jest, pytest, Go test, etc.)
  - **Build tooling** (webpack, vite, esbuild, Make, etc.)
  - **Linting/formatting** (ESLint, Prettier, Black, etc.)
  - **CI/CD** (GitHub Actions, GitLab CI, Jenkins, etc.)
  - **Containerization** (Docker, docker-compose, k8s manifests)
  - **Key dependencies** — the top 10 most important non-trivial dependencies and their purpose

### Infrastructure Footprint
- Docker presence? How many Dockerfiles/compose files?
- CI/CD pipeline files — what do they do?
- Infrastructure-as-code? (Terraform, CloudFormation, Pulumi)
- Environment configurations — how many environments defined?
- Deployment targets detected (cloud provider configs, Vercel, Netlify, Heroku, etc.)

### Dependency Health
- Total dependency count (direct + transitive if measurable)
- Direct dependencies count
- Dev dependencies count
- Lock file present? Up to date?
- Any obviously outdated major versions visible?

## Phase 3: Git History Analysis

The git log is a goldmine. Extract every useful metric.

### Project Timeline
- First commit date — when did this project start?
- Latest commit date — when was it last touched?
- **Total project age** (in months/years)
- Is the project actively maintained? (commits in last 30/90 days)

### Commit Statistics
- Total number of commits
- Commits per month (last 12 months) — is activity growing, stable, or declining?
- Average commits per week
- Most active day of the week
- Most active time of day (if detectable)
- Busiest month ever — what was happening?
- Longest gap between commits — any dormant periods?

### Growth Trends
- Lines added/removed per month (last 6-12 months)
- Net growth trend — is the codebase growing, stable, or shrinking?
- File count over time — are new files being added or is it stabilizing?
- Identify major milestones — large commits, merges, or version tags

### Tags & Releases
- Total tags/releases
- Release cadence — how often are releases cut?
- Latest release — when? What version?
- Versioning scheme (semver, calver, other?)

### Branch Strategy
- Current branches (active, not merged)
- Default branch name
- Evidence of branching strategy (gitflow, trunk-based, feature branches?)

## Phase 4: Contributor Overview

Who built this? How many people? (For deep contributor analysis, use `/contributor-analysis`)

- Total unique contributors (by git author)
- Currently active contributors (committed in last 90 days)
- Top 5 contributors by commit count
- Top 5 contributors by lines changed
- Bus factor — how many people contribute 80%+ of commits?
- Contribution distribution — is it concentrated or spread out?

## Phase 5: Code Organization & Architecture

What patterns emerge from the structure?

### Module Analysis
- Identify logical modules/packages/domains
- For each module:
  - File count
  - Line count
  - Primary language
  - Apparent purpose (inferred from names, directory structure, key files)
- Module size distribution — are modules balanced or is one module 60% of the code?

### Entry Points
- Main entry point(s) — where does execution start?
- API endpoints count (if web app)
- CLI commands (if CLI tool)
- Exported modules/packages

### Test Coverage Indicators
- Test file count vs source file count
- Test frameworks detected
- Test-to-source ratio
- Are tests colocated with source or in separate directories?
- Any coverage configuration found? What thresholds?

### Configuration Complexity
- Number of config files at project root
- Config file formats used (JSON, YAML, TOML, env, etc.)
- Environment variable references found
- Feature flags or toggles detected?

## Phase 6: Synthesis & Interpretation

Don't just dump numbers. Tell the STORY of this project:

### Project Profile Summary
One paragraph: what this project IS, how big it is, what it's built with, how mature it is, and how active it is. The elevator pitch backed by data.

### Key Metrics Dashboard
```
Project Age:          [X years, Y months]
Total Lines:          [N] (source: [N], test: [N], config: [N])
Languages:            [primary] ([X]%), [secondary] ([Y]%), ...
Files:                [N] across [N] directories
Modules:              [N] logical modules
Dependencies:         [N] direct, [N] dev
Total Commits:        [N] by [N] contributors
Active Contributors:  [N] (last 90 days)
Commit Frequency:     [N] commits/week (last 3 months)
Growth Trend:         [growing/stable/shrinking] at ~[N] lines/month
Latest Activity:      [date of last commit]
Release Count:        [N] releases, latest: [version] ([date])
Test-to-Source Ratio: [N:1]
Bus Factor:           [N]
```

### Health Indicators
Based on the statistics, flag:
- **Green flags** — signs of a healthy project (good test ratio, active contributors, regular releases, etc.)
- **Yellow flags** — areas of concern (growing complexity, declining activity, low bus factor, etc.)
- **Red flags** — serious concerns (no tests, single contributor, no releases, stale dependencies, etc.)

### Comparative Context
If possible, contextualize the numbers:
- For the tech stack and project type, are these numbers typical?
- Is the codebase unusually large or small for what it does?
- Is the contributor count appropriate for the project size?

---

## Output Format

```
## Project Statistics Report

### Project: [Name]
### Analysis Date: [Date]
### Scope: [what was analyzed]

---

### Quick Profile
[One paragraph summary — what, how big, what stack, how mature, how active]

### Key Metrics Dashboard
[The dashboard from Phase 6]

### Code Volume & Composition
[Phase 1 results — with tables for lines by language, top files, module map]

### Tech Stack
[Phase 2 results — detected stack with evidence]

### Git History
[Phase 3 results — timeline, commit stats, growth trends, releases]

### Contributors
[Phase 4 results — contributor overview, bus factor]

### Architecture & Organization
[Phase 5 results — modules, entry points, test indicators]

### Health Assessment
[Green/yellow/red flags with specific evidence]

### Comparative Context
[How this project compares to typical projects of its type]
```

## Success Criteria

- Every number is MEASURED, not estimated — commands were run, files were counted
- Generated/vendor code is separated from source code in all metrics
- Tech stack is DETECTED from actual files, not assumed
- Git history is analyzed over the full project lifetime
- Growth trends show whether the project is growing, stable, or shrinking
- Contributors are identified with real commit data
- Module structure is mapped with purpose, size, and language
- The synthesis tells a coherent STORY, not just a data dump
- Health indicators are specific and evidence-based
- Someone reading this report understands the full shape and health of the project in 5 minutes
