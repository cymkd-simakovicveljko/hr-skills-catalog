---
name: deprecation-and-migration
description: "Use when replacing or retiring APIs, dependencies, services, features, or database shapes: plan and verify consumer migration, cutover, recovery, and removal."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/deprecation-and-migration/SKILL.md
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/deprecation-and-migration/SKILL.md
  adaptation: "Condensed the migration workflow; made compatibility conditional on real consumers; replaced blanket safe-DDL and reversible-migration claims with engine-specific checks and explicit recovery; added concurrency-safe backfill criteria; removed companion-skill dependencies; enabled model invocation for migration work."
---

# Deprecation and migration

Use when the task replaces or retires an API, library, service, feature, or database shape. A plan is not permission to execute a production cutover or delete data.

## 1. Establish scope and ownership

Identify the behavior being replaced or retired, why it no longer earns its maintenance cost, its owner, and the consumers affected. Include jobs, scripts, integrations, deployed versions, persisted data, and observable behavior outside the documented API.

Use code references and usage evidence together. An empty search is not proof that no external consumer exists. State the search scope, observation window, unknown consumers, and who must resolve them.

**Done:** an owner, affected behavior, consumer inventory, and acceptance criteria exist. If the behavior is being retired without replacement, confirm that loss is explicitly approved.

## 2. Choose the smallest safe transition

- **Controlled consumers, coordinated deployment:** migrate callers and remove the old path in one complete change when the deployment model permits it.
- **Independent consumers or mixed deployed versions:** use a bounded compatibility window with an owner, migration guide, usage evidence, and removal condition.
- **High-risk traffic cutover:** use an existing routing or feature-flag mechanism to compare old and new behavior on a controlled cohort before expansion.

An adapter or parallel implementation is temporary migration machinery, not an indefinite second system. Add one only where a real compatibility requirement needs it. Set the exit condition before adding the bridge.

**Done:** the transition matches actual deployment constraints; compatibility costs and the removal condition are explicit.

## 3. Prove the replacement and recovery

Cover the old system's required behavior with representative consumer checks, including error semantics and persistent data. Use staging or isolated environments before any authorized production rollout. Record intentional behavior changes and required consumer action.

Define what makes the migration advance, pause, or recover. Identify the known-good application version, data compatibility limits, responsible operator, and approved recovery mechanism.

Code rollback does not necessarily reverse a data migration. Test recovery on representative data. If rollback would lose data, require an approved restore or roll-forward procedure and identify the irreversible step; do not claim a `down` script makes it safe.

**Done:** required behavior is demonstrated and the recovery procedure has evidence, or its untested limits block the risky step.

## 4. Migrate and verify each consumer

For each consumer, enumerate touchpoints, change them, verify behavior against its acceptance criteria, and remove obsolete references. Use repository-supported refactoring or migration tools when they preserve semantics reliably.

For external consumers, publish the concrete migration steps through the project's established process. The migration owner supplies tooling or assistance rather than assuming an announcement completes the work.

**Done:** every in-scope consumer has a recorded verification result; remaining consumers and blockers are named.

## Database branch: expand, migrate, contract

Use separate deployable phases when old and new application versions must coexist. First inspect the database engine/version, table size, DDL locking and rewrite behavior, replication constraints, and all writers. Even an additive schema change can block writes or rewrite a table.

1. **Expand:** introduce the new shape without invalidating the old application. Check DDL behavior on representative data and choose the engine's appropriate online or concurrent mechanism where supported.
2. **Support both shapes:** establish compatible writes or another verified synchronization strategy. Include background jobs and older application versions; drain incompatible writers before relying on dual-write behavior.
3. **Backfill:** use bounded, resumable batches with progress and failure reporting. Prevent stale backfill values from overwriting concurrent updates using an engine-appropriate conditional or transactional strategy. Verify retries and interruption safety.
4. **Validate and switch reads:** check counts, values, constraints, and application behavior. Retain the writes needed by the documented rollback window. Observe using agreed rollout criteria.
5. **Contract:** after all old readers and writers are gone and the rollback window is closed, remove obsolete writes, then remove the old schema in a later controlled change. Reconfirm approval for destructive operations.

**Done:** mixed-version compatibility, backfill correctness, interruption recovery, and cutover behavior have evidence; destructive phases remain blocked until their prerequisites hold.

## 5. Remove the old system

Confirm that all consumers have migrated or their retirement is approved. Check active usage over an appropriate period, including infrequent jobs; reconcile it with the consumer inventory.

Remove obsolete implementation, tests that exist only for it, adapters, flags, configuration, and deprecation notices. Update documentation and retain historical rationale where the repository keeps it. Preserve records subject to retention requirements.

**Done:** no active consumer requires the retired behavior, migration machinery is removed, and the remaining system passes its relevant checks.

## Report

- **Scope:** owner, affected consumers, compatibility obligations, and unknowns.
- **Plan or execution:** distinguish proposed phases from actions actually performed.
- **Evidence:** verification per consumer, data checks, and recovery proof.
- **Remaining gates:** blockers, irreversible operations, approval requirements, and removal conditions.
