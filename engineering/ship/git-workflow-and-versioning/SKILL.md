---
name: git-workflow-and-versioning
description: "Structures safe Git workflow and versioning. Use when making, organizing, reviewing, committing, branching, merging, or releasing changes; protect unrelated work, keep commits atomic, and require explicit authorization before mutating history or remotes."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/git-workflow-and-versioning
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/git-workflow-and-versioning/SKILL.md
  adaptation: "Preserved trunk-based workflow, atomic commits, branch/worktree patterns, change summaries, generated-file hygiene, debugging, semantic versioning, tags, changelog guidance, rationalizations, red flags, and checklists; added explicit task-authorization and unrelated-work boundaries, made size and branch-lifetime figures illustrative, and replaced unsafe reset/remote examples with controlled equivalents."
---

# Git Workflow and Versioning

## Overview

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation. With AI agents generating code at high speed, disciplined version control is the mechanism that keeps changes manageable, reviewable, and reversible.
## Operating boundary

This skill plans and explains Git actions; it does not authorize them. A user request explicitly covering the action is required before creating commits, branches, worktrees, tags, merges, pushes, history rewrites, or release publication. Approval of a plan alone is not authorization unless the approval explicitly includes the named Git action.

Preserve unrelated user changes. Inspect status and diffs before staging, stage only the intended paths, and report anything intentionally left untouched. Never force-push, rewrite shared history, reset hard, clean, delete branches, remove worktrees, or push tags by default. If an authorized action could affect unrelated work or a shared remote, stop for explicit scope and confirmation.

## When to Use

Always. Every code change flows through git.

## Core Principles
Keep the default branch deployable when the repository's policy supports it. Work in short-lived feature branches when they reduce collision and review risk; a 1–3 day lifetime is an upstream example, not a universal requirement. Long-lived development branches can diverge, create merge conflicts, and delay integration, but teams using Gitflow or another model can adapt the same atomic-commit discipline.

```
main ──●──●──●──●──●──●──●──●──●──  (intended to stay deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (example)
```

This is a recommended default, not a mandate. Teams using another branching model can adapt the principles (atomic commits, small changes, descriptive messages) to their policy — the commit discipline matters more than the specific strategy.

- **Development branches have carrying cost.** As a branch lives, it can accumulate merge risk.
- **Release branches can be appropriate.** Use them when policy requires stabilizing a release while the default branch moves forward.
- **Feature flags can beat long branches.** Use them only when the flag owner, exposure, cleanup, and recovery policy are clear.

### 1. Commit Early, Commit Often

Each successful increment gets its own commit. Don't accumulate large uncommitted changes.

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

Commits are save points. If the next change breaks something, you can revert to the last known-good state instantly.

### 2. Atomic Commits

Each commit does one logical thing:

```
# Good: Each commit is self-contained
git log --oneline
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
git log --oneline
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. Descriptive Messages

Commit messages explain the *why*, not just the *what*:

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses Zod schema validation at the route handler level,
consistent with existing validation patterns in auth.ts.

# Bad: Describes what's obvious from the diff
update auth.ts
```

**Format:**
```
<type>: <short description>

<optional body explaining why, not what>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `test` — Adding or updating tests
- `docs` — Documentation only
- `chore` — Tooling, dependencies, config

### 4. Keep Concerns Separate

Don't combine formatting changes with behavior changes. Don't combine refactors with features. Each type of change should be a separate commit — and ideally a separate PR:

```
# Good: Separate concerns
git commit -m "refactor: extract validation logic to shared utility"
git commit -m "feat: add phone number validation to registration"

# Bad: Mixed concerns
git commit -m "refactor validation and add phone number field"
```

**Separate refactoring from feature work.** A refactoring change and a feature change are two different changes — submit them separately. This makes each change easier to review, revert, and understand in history. Small cleanups (renaming a variable) can be included in a feature commit at reviewer discretion.

### 5. Size Your Changes

Use the repository's review capacity, risk, affected surfaces, and generated-file conventions to choose a commit/PR size. The figures below are illustrative signals, not universal limits; use `code-review-and-quality` for splitting strategies.

```
~100 lines  → Often easy to review and revert
~300 lines  → May be acceptable for one logical change
~1000 lines → Usually a reason to split or explain mechanical generation
```

## Branching Strategy

### Feature Branches

```
main (always deployable)
  │
  ├── feature/task-creation    ← One feature per branch
  ├── feature/user-settings    ← Parallel work
  └── fix/duplicate-tasks      ← Bug fixes
```

- Branch from `main` (or the team's default branch).
- Keep branches short-lived when that matches team policy; merge within 1–3 days is an upstream example, not a universal deadline.
- Delete branches after merge only when the branch owner and repository policy authorize it.
- Prefer feature flags over long-lived branches for incomplete features only when the flag has an owner, exposure policy, cleanup condition, and recovery path.


### Branch Naming

```
feature/<short-description>   → feature/task-creation
fix/<short-description>       → fix/duplicate-tasks
chore/<short-description>     → chore/update-deps
refactor/<short-description>  → refactor/auth-module
```
## Working with Worktrees

For parallel agent work, use git worktrees to run multiple branches simultaneously when the repository and task authorize creating them. Each worktree is a separate directory with its own branch; inspect existing paths first and preserve unrelated work.

```bash
# Planning examples — execute only with explicit authorization:
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings

# Each worktree is isolated until an authorized merge.
# Use the host's directory inspection, not an assumed `ls` output.

# When done, remove only an explicitly authorized worktree:
git worktree remove ../project-feature-a
```

Benefits:
- Multiple agents can work on different features simultaneously.
- No branch switching is needed (each worktree has its own branch).
- If one experiment fails, an authorized cleanup of its worktree can isolate the loss.
- Changes are isolated until explicitly merged.
## The Save Point Pattern

```
Agent starts work
    │
    ├── Makes a change
    │   ├── Focused checks pass? → Record or commit if authorized → Continue
    │   └── Checks fail? → Preserve evidence → restore only that increment → Investigate
    │
    ├── Makes another change
    │   ├── Focused checks pass? → Record or commit if authorized → Continue
    │   └── Checks fail? → Preserve evidence → restore only that increment → Investigate
    │
    └── Feature complete → Authorized commits form a clean history
```

Save points limit loss, but restore operations must not discard unrelated user work. Prefer a disposable worktree or targeted restoration. Do not use `git reset --hard`, `git clean`, or history rewriting by default; each needs explicit task authorization and a scope check.

## Change Summaries

After any modification, provide a structured summary. This makes review easier, documents scope discipline, and surfaces unintended changes:

```
CHANGES MADE:
- src/routes/tasks.ts: Added validation middleware to POST endpoint
- src/lib/validation.ts: Added TaskCreateSchema using Zod

THINGS I DIDN'T TOUCH (intentionally):
- src/routes/auth.ts: Has similar validation gap but out of scope
- src/middleware/error.ts: Error format could be improved (separate task)

POTENTIAL CONCERNS:
- The Zod schema is strict — rejects extra fields. Confirm this is desired.
- Added zod as a dependency (72KB gzipped) — already in package.json
```

This pattern catches wrong assumptions early and gives reviewers a clear map of the change. The "DIDN'T TOUCH" section is especially important — it shows you exercised scope discipline and didn't go on an unsolicited renovation.

## Pre-Commit Hygiene

Before every authorized commit:

```bash
# 1. Check what you're about to stage and commit
git status
git diff
git diff --staged

# 2. Inspect staged content for secrets using the repository's supported scanner
# 3. Run the repository's required focused checks
# 4. Confirm unrelated user changes are not staged
```

Use the repository's actual test, lint, type, and build commands rather than assuming the `npm` examples below. A plan, a clean diff, or a green local check does not authorize committing or pushing.

Optional hook tooling can automate checks:

```json
// Illustrative package.json shape; use only if the repository already adopts it
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

Do not install or configure hooks, formatters, caches, or scanners merely because this example mentions them. If the repository has no such integration, report that scope and run the supported equivalent manually.

## Handling Generated Files

- **Commit generated files** only if the project expects them (e.g., `package-lock.json`, Prisma migrations)
- **Don't commit** build output (`dist/`, `.next/`), environment files (`.env`), or IDE config (`.vscode/settings.json` unless shared)
- **Have a `.gitignore`** that covers: `node_modules/`, `dist/`, `.env`, `.env.local`, `*.pem`

## Using Git for Debugging
For debugging history, prefer a disposable worktree or checkout so bisect and checkouts cannot disturb unrelated user changes. Record the starting revision and restore state only with authorization.

```bash
# Find which commit introduced a bug
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# Git checkouts midpoints; run your test at each to narrow down

# View what changed recently
git log --oneline -20
git diff HEAD~5..HEAD -- src/

# Find who last changed a specific line
git blame src/services/task.ts

# Search commit messages for a keyword
git log --grep="validation" --oneline
```

## Release & Versioning

Commits are how *you* track change; a **version** is how your *consumers* track it. The moment anything else depends on your code — another team, a published package, a deployed client — "latest on main" stops being a sufficient answer to "what am I running, and is it safe to upgrade?" A version number and a changelog are the contract that answers it.

### Semantic Versioning

For anything with consumers, version `MAJOR.MINOR.PATCH` and let the number carry meaning:

```
  MAJOR  breaking change — consumers must change their code to upgrade
  MINOR  new functionality, backward-compatible — safe to upgrade
  PATCH  bug fix, backward-compatible — safe to upgrade
```

The number is a promise, so make the code match it. A "patch" that changes behavior consumers relied on is a major change wearing a disguise (Hyrum's Law — see the `api-and-interface-design` skill). When unsure whether a change is breaking, assume it is; a surprise major is far cheaper than a broken consumer.

### Tag the release, and let the tag be the source of truth

A release is an immutable point in history, not a moving branch. When the repository's release policy calls for a tag, create and publish it only after the user explicitly authorizes those actions:

```bash
# Planning examples — do not run without explicit release authorization:
git tag -a v1.4.0 -m "Release 1.4.0"
git push origin v1.4.0
```

Derive the version from the tag rather than hand-editing it in scattered files, so the artifact, tag, and changelog can agree. If release execution is requested, load `shipping-and-launch` by skill name through catalog MCP; this section does not deploy or publish.

### Keep a changelog written for humans

A changelog is not `git log`. It's the curated, consumer-facing answer to "what changed and do I care?" — grouped by `Added / Changed / Fixed / Deprecated / Removed / Security`, newest on top, every entry phrased around user impact, not internal mechanics.

```markdown
## [1.4.0] - 2025-06-12
### Added
- Bulk task import via CSV
### Fixed
- Timezone drift in recurring task due dates
### Deprecated
- `GET /v1/tasks/all` — use the paginated `GET /v1/tasks` (removal in 2.0)
```

Write the entry in the same change that makes the change, while the impact is fresh — not reconstructed from commit archaeology at release time. Breaking changes get a migration note and a deprecation window (follow the `deprecation-and-migration` skill); shipping the actual release is the `shipping-and-launch` skill's job — this section is the versioning contract that feeds it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll commit when the feature is done" | One giant commit is impossible to review, debug, or revert. Commit each slice. |
| "The message doesn't matter" | Messages are documentation. Future you (and future agents) will need to understand what changed and why. |
| "I'll squash it all later" | Squashing destroys the development narrative. Prefer clean incremental commits from the start. |
| "Branches add overhead" | Short-lived branches are free and prevent conflicting work from colliding. Long-lived branches are the problem — merge within 1-3 days. |
| "I'll split this change later" | Large changes are harder to review, riskier to deploy, and harder to revert. Split before submitting, not after. |
| "I don't need a .gitignore" | Until `.env` with production secrets gets committed. Set it up immediately. |
| "It's just a small fix, bump the patch" | Check what consumers can observe. A behavior change they relied on is a major, whatever the diff size. |
| "The changelog is just the commit log" | Commits are for you; the changelog is for consumers, curated by impact. Generating one from raw commits buries what matters. |
| "We'll write the changelog at release time" | By then the impact is reconstructed from memory and half of it is missing. Write the entry with the change. |

## Red Flags

- Large uncommitted changes accumulating
- Commit messages like "fix", "update", "misc"
- Formatting changes mixed with behavior changes
- No `.gitignore` in the project
- Committing `node_modules/`, `.env`, or build artifacts
- Long-lived branches that diverge significantly from main
- Force-pushing to shared branches
- A breaking change shipped under a minor or patch version bump
- A release with no tag, or a version number hand-edited out of sync with the tag
- A user-facing release with no changelog entry, or a changelog that's just dumped commit messages

## Verification

For every commit:

- [ ] Commit does one logical thing
- [ ] Message explains the why, follows type conventions
- [ ] Tests pass before committing
- [ ] No secrets in the diff
- [ ] No formatting-only changes mixed with behavior changes
- [ ] `.gitignore` covers standard exclusions

For every release (anything with consumers):

- [ ] The version bump matches the change: breaking → major, additive → minor, fix → patch
- [ ] The release is tagged, and the version is derived from the tag, not hand-edited out of sync
- [ ] The changelog has a curated, human-readable entry grouped by impact for this version
