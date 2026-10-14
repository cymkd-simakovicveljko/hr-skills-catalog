# Build workflow

Load `incremental-implementation` and `test-driven-development` from the same catalog revision. Read the plan, acceptance criteria and router's `references/definition-of-done.md`.

## Default: one task

Select the next pending task whose dependencies are complete. Implement one approved vertical slice with red → green → refactor and the applicable regression/build checks. Record evidence and task status, then stop at that task boundary. Do not silently consume the rest of the plan. Commit only when authorized; a working-tree change can be complete without a commit.

## Auto / all: the approved whole plan

An explicit request for `build auto` or `build all` selects this mode. The mode itself is not approval of an unseen plan.

1. Find an approved spec in the project's accepted spec location, such as `SPEC.md`, `spec.md`, `tasks/spec.md` or `docs/specs/`. An arbitrary README is not a substitute. If the spec is absent, offer the spec workflow and stop implementation.
2. Establish the baseline and identify unrelated local changes. Do not absorb, discard or commit the user's unrelated work. If a clean isolated baseline is required, use an authorized worktree or have the owner resolve it.
3. Locate the plan. If missing, invoke `planning-and-task-breakdown` and present the complete plan for explicit approval. If it exists, verify that its scope and whole-plan execution are approved; changes to scope require renewed approval.
4. Establish the project commands and pre-existing failures. Do not claim a failing baseline is green. Record any authorized exception without weakening required checks.
5. For each ready task: read its acceptance criteria; write a behavior-level failing test for new/changed executable behavior; observe the intended failure; implement the smallest correct slice; run the focused check, full regression suite and required build; refactor only while green; evaluate the definition of done. Prose-only tasks use applicable document checks rather than invented executable tests.
6. Commit each completed slice only if that commit policy was explicitly authorized. Plan approval alone is not git permission. Stage only that slice's scoped files. If commits are not authorized, keep a precise task/evidence log in the approved tracker; do not invent commit IDs.
7. Mark the task done only after acceptance and checks pass. Continue to the next dependency-ready task without requesting redundant approval inside the already approved scope.
8. Stop on a failed required check, ambiguous acceptance, new scope, conflicting user work, or a decision affecting authentication, payments, secrets, data loss, destructive migration or deployment. Do not improvise through a high-risk boundary.
9. Describe the exact blocker and completed evidence. Resume only after the user resolves the decision and explicitly resumes; recheck the changed assumptions before continuing with the next pending task.
10. At the end, report completed tasks, evidence, remaining risks and actual working-tree/commit state. Offer review/ship readiness; do not push, publish or deploy from build approval.

A code revert does not necessarily reverse a migration, data mutation or external side effect. Use a verified recovery procedure rather than promising every slice is safely revertible.

## MCP invocation and source

Request this mode in natural language, for example “run the build workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/build.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/build.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
