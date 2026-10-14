---
name: deprecation-and-migration
description: "Use when replacing or retiring APIs, dependencies, services, features, or database shapes: decide whether to deprecate, plan and verify consumer migration, cutover, recovery, and removal."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/deprecation-and-migration/SKILL.md
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/deprecation-and-migration/SKILL.md
  adaptation: "Restored the complete deprecation rubric, advisory/compulsory distinction, replacement and notice workflow, consumer migration steps, migration-pattern tradeoffs, database expand/migrate/contract branch, rationalizations, red flags and verification. Retained catalog MCP boundaries, conditional compatibility for controlled callers, engine-specific DDL and backfill safety, explicit approvals, verified observations, and the distinction between code rollback and data restore or roll-forward; examples are illustrative."
---

# Deprecation and migration

Use this skill when replacing an old system, API, library, service, feature, dependency, or database shape; consolidating duplicate implementations; removing code with no clear owner; or planning a component's eventual retirement. A plan is not permission to execute a production cutover, delete data, or disclose private consumer information.

## Operating boundary and shared resources

Separate a migration plan from an executed migration. Repository evidence, a migration guide, a proposed command, a successful staging run, or a loaded skill does not prove that production changed. Production actions, destructive schema changes, external announcements, and data recovery require the project's normal authorization and a named operator.

If a shared checklist or lifecycle mode is needed, first discover `using-agent-skills` in the same authorized catalog and revision, load it by the exact returned MCP URI, and read the matching resource URI returned by that load. Relevant resources may include `definition-of-done`, `testing-patterns`, `security-checklist`, `orchestration-patterns`, or the `ship` command resource. These are MCP resources, not assumed filesystem paths; do not invent relative links or installed tools. Use the ship mode for its independent review orchestration rather than reproducing host-specific worker mechanics here.

## Overview

Code is a liability, not an asset. Every line has ongoing maintenance cost: bugs to fix, dependencies to update, security patches to apply, and mental overhead for people and agents working nearby. The value is the behavior it provides, not the code itself. When the same behavior can be provided with less complexity or a better boundary, the old path should go—but only after consumer, data, and recovery risks are understood.

Hyrum's Law makes removal hard: with enough users, every observable behavior becomes depended on, including bugs, timing quirks, error messages, and undocumented side effects. A deprecation therefore requires active migration, not just an announcement. Users cannot necessarily “just switch” when they depend on behavior the replacement does not replicate.

Deprecation planning starts at design time. Systems with clean interfaces, bounded surface area, explicit ownership, feature controls where justified, and documented data contracts are easier to remove later.

## When to use

- Replacing an old system, API, or library with a new one.
- Sunsetting a feature that no longer earns its maintenance cost.
- Consolidating duplicate implementations.
- Removing dead or zombie code that nobody owns but consumers still depend on.
- Planning the lifecycle of a new system, including how it could be removed later.
- Deciding whether to maintain a legacy system or invest in migration.
- Migrating a database schema in production, such as adding a replacement column without downtime.

## 1. Establish scope, ownership, and evidence

Identify the behavior being replaced or retired, why it no longer earns its maintenance cost, its owner, and the consumers affected. Include:

- application callers, public APIs, SDKs, jobs, scripts, tests, and infrastructure;
- external integrations, deployed versions, and independently released clients;
- persisted data, queues, files, wire formats, error semantics, timing, and other observable behavior;
- the replacement, if one exists, and the behavior it deliberately changes;
- acceptance criteria, data-retention obligations, support obligations, and the authorized removal condition.

Use code references and usage evidence together. Search scope, observation window, telemetry sources, dependency analysis, and unknown consumers must be recorded. An empty repository search is not proof that an external consumer does not exist. Name the person or team who must resolve each unknown.

**Complete when:** an owner, affected behavior, consumer inventory, unknowns, acceptance criteria, and evidence plan exist. If the behavior is being retired without replacement, the loss is explicitly approved by the relevant owner.

## 2. Make the deprecation decision

Before deprecating anything, answer this rubric:

```text
1. Does the system still provide unique value?
   → If yes, maintain it or document the investment decision. If no, continue.

2. How many users or consumers depend on it?
   → Quantify the migration scope, including unknown external consumers.

3. Does a replacement exist?
   → If no, build and prove one first unless retirement without replacement is explicitly approved.

4. What is the migration cost for each consumer?
   → Automate trivial work; weigh manual, high-effort work against ongoing cost and risk.

5. What is the ongoing cost of not deprecating?
   → Include security risk, reliability risk, engineer time, support burden, and opportunity cost.

6. What data, compatibility, and recovery constraints could make removal unsafe?
   → Name irreversible steps and the evidence or approval required before each one.
```

### Advisory versus compulsory deprecation

| Type | When to use | Mechanism |
|---|---|---|
| **Advisory** | Migration is optional and the old system is stable and supported. | Warnings, documentation, migration guide, tooling, and nudges; consumers migrate on their own timeline. |
| **Compulsory** | Security risk, blocked progress, unsupported dependencies, unsustainable maintenance cost, or an approved hard end date justifies forcing migration. | Owner-approved deadline, concrete tooling, documentation, support, usage tracking, and a removal gate. |

Default to advisory. Use compulsory deprecation only when the risk or cost justifies forcing migration. A compulsory deadline is not a substitute for a replacement, tooling, documentation, or support. Do not invent a date, grace period, usage threshold, or compatibility promise when the project has no approved policy; obtain explicit owner agreement first.

**Complete when:** the decision, type, owner, replacement or approved retirement, consumer obligations, deadline policy, and removal condition are recorded.

## 3. Build and prove the replacement

Do not deprecate a system merely because a replacement is theoretically better. The replacement must:

- cover the old system's critical use cases and documented error behavior;
- preserve required data, security, authorization, and operational properties;
- have documentation, examples, migration tooling or assistance, and support ownership;
- be verified with representative consumers and persistent data in staging or another isolated environment;
- be proven in an authorized production context when the project's policy requires it, rather than only demonstrated in a local or theoretical setup.

Record intentional behavior changes and every required consumer action. If no replacement is needed, record why retiring the behavior is acceptable and who approved the loss.

**Complete when:** required behavior and intentional differences are demonstrated against acceptance criteria, and the replacement or approved retirement has an owner and recovery boundary.

## 4. Announce and document

Publish through the project's established process. A notice is an instruction to migrate, not evidence that migration happened and not authorization to remove the old path.

The following is an illustrative template. Replace dates, names, examples, and verification steps with approved project details; `npx migrate-check` is not an assumed installed tool.

```markdown
## Deprecation Notice: OldService

**Status:** Deprecated as of [approved date]
**Replacement:** NewService (see migration guide below)
**Removal date:** Advisory — no hard deadline yet
**Reason:** OldService requires manual scaling and lacks observability;
NewService handles both automatically.
**Owner:** [team or person]
**Support channel:** [established channel]
**Compatibility window:** [policy-defined window or "not applicable"]

### Migration Guide
1. Replace `import { client } from 'old-service'` with
   `import { client } from 'new-service'`.
2. Update configuration as described in the project-specific examples.
3. Run the approved migration verification check: `[project command or runbook]`.
4. Compare the required behavior and error semantics for this consumer.
5. Remove the old reference after the verification result is recorded.

### Removal condition
[Usage evidence, consumer sign-off, deadline, approval, and recovery gate]
```

For a compulsory deprecation, include the approved deadline, consequences of missing it, migration tooling, contact path, support period, and how exceptions are authorized. For an advisory deprecation, still record usage evidence and a review or removal condition; “advisory” does not mean indefinite second-system support.

**Complete when:** the concrete notice and guide are published through the approved channel, with owner, support, compatibility, and removal information.

## 5. Choose the smallest safe transition

Choose based on real deployment and consumer constraints:

- **Controlled callers and coordinated deployment:** migrate callers and remove the old path in one complete change when every relevant caller, deployed version, and data writer is controlled. Do not impose an adapter or compatibility window merely because it is a familiar pattern.
- **Independent consumers or mixed deployed versions:** use a bounded compatibility window with an owner, guide, usage evidence, and a removal condition.
- **High-risk traffic cutover:** use an existing routing or feature-flag mechanism to compare old and new behavior on a controlled cohort before expansion.
- **No replacement:** retire only when the loss and support impact are explicitly approved.

An adapter, parallel implementation, dual-write path, or flag is temporary migration machinery, not an indefinite second system. Set its exit condition before adding it. Record its operational cost, consistency risks, observability, and cleanup owner.

**Complete when:** the transition matches actual deployment constraints; compatibility obligations, recovery limits, cost, owner, and removal condition are explicit.

## 6. Migrate consumers incrementally

Migrate consumers one at a time or in bounded cohorts when independent verification reduces risk. For each consumer:

```text
1. Identify every touchpoint with the deprecated system.
2. Confirm the replacement supports the consumer's required behavior and permissions.
3. Update the consumer to use the replacement.
4. Verify behavior, error semantics, data effects, and critical flows.
5. Record the evidence, owner, version, and any intentional difference.
6. Remove obsolete references, compatibility code, and configuration for that consumer.
7. Confirm no regression and update the inventory before moving to the next consumer.
```

For external consumers, publish concrete migration steps through the established process and offer tooling or assistance. The migration owner is responsible for helping users migrate; an announcement alone is not completion. For controlled callers, a clean cutover is preferable when it is safe and coordinated.

**The Churn Rule:** if you own the infrastructure being deprecated, you are responsible for migrating your users or providing a backward-compatible update that requires no migration. Do not announce deprecation and leave known consumers to discover the solution alone.

**Complete when:** every in-scope consumer has a recorded verification result; remaining consumers, unknowns, blockers, and exceptions are named.

## Migration patterns and tradeoffs

### Strangler pattern

Run old and new systems in parallel and route traffic incrementally from old to new. When the old system handles no traffic and no hidden consumer remains, remove it.

```text
Phase 1: New system 0%, old system 100%
Phase 2: New system on a small approved canary cohort
Phase 3: New system on a larger approved cohort
Phase 4: New system 100%, old system idle
Phase 5: Verify zero active usage and remove the old system
```

The cohorts and observation windows are illustrative; use the service's policy. The pattern buys containment and comparison but costs duplicate operation, data-consistency work, and longer cleanup. Define routing ownership, parity signals, stop criteria, and the removal condition before starting.

### Adapter pattern

Create an adapter that translates the old interface to the new implementation when independent consumers cannot change together or a bounded compatibility window is required. It keeps callers stable while the backend moves, but translation can hide behavior differences, preserve a legacy interface longer than intended, and create another path to test and operate. Do not add it for controlled callers that can clean-cut over.

```typescript
// Illustrative only: no adapter or service is installed by this example.
class LegacyTaskService implements OldTaskAPI {
  constructor(private readonly newService: NewTaskService) {}

  // Keep the old signature while the consumer migration window is open.
  getTask(id: number): OldTask {
    const task = this.newService.findById(String(id));
    return this.toOldFormat(task);
  }

  private toOldFormat(task: NewTask): OldTask {
    return { id: Number(task.id), title: task.name };
  }
}
```

Give the adapter an owner, telemetry that distinguishes old callers, and a removal trigger. Remove it after all required consumers migrate and the approved compatibility window closes; do not silently make it permanent.

### Feature-flag migration

Use a supported flag control plane to switch consumers from old to new one at a time when a reversible exposure decision is valuable. Record flag owner, default state, targeting rule, telemetry, privacy treatment, approval, and cleanup condition. Test both states where policy requires it, and verify that the control plane and old path remain healthy before relying on the flag as recovery.

```typescript
// Illustrative only: use the repository's approved flag mechanism if one exists.
function getTaskService(userId: string): TaskService {
  if (featureFlags.isEnabled('new-task-service', { userId })) {
    return new NewTaskService();
  }
  return new LegacyTaskService();
}
```

A flag trades redeploy speed for control-plane dependence, two paths, and cleanup debt. Percentages, cohort sizes, and dates are examples until the service policy approves them. Remove the flag and dead path after the owner confirms full migration and the removal gate is satisfied.

## Database branch: expand, migrate, contract

A schema migration is a separate data-risk branch. Reverting application code does not necessarily reverse a data migration. A failed or irreversible data operation may require an approved restore or roll-forward, not a `down` script or code rollback.

For a mixed-version production rollout, use additive phases so old and new applications are valid at every deploy boundary. A single clean cutover may be acceptable only when the deployment policy guarantees that old readers and writers cannot coexist and the relevant owner explicitly approves it; do not impose compatibility machinery on a controlled deployment without that need.

```text
EXPAND ─────────────→ MIGRATE ─────────────→ CONTRACT
Add the new shape     Backfill and support    Stop old writes and,
without invalidating  old and new shapes      after the gate closes,
the old application   during coexistence      remove the old shape
```

Before changing a production schema, inspect the database engine and version, table size, DDL lock and rewrite behavior, replication constraints, all readers and writers, queued work, backup/recovery point, and observability. Even an additive change can block writes or rewrite a table. Choose the engine's supported online or concurrent mechanism; “safe DDL” is not universal.

### Worked example: rename `name` to `full_name`

The following is an illustrative sequence, not a command or a claim that a particular engine supports every step:

1. **Expand.** Add nullable `full_name`. Old code ignores it.
2. **Migrate writes.** Deploy code that writes both `name` and `full_name` for inserts and updates, including jobs and older writers where applicable.
3. **Backfill.** Copy `name` to `full_name` in bounded, resumable batches away from the hot path. Make the write idempotent and prevent a stale backfill from overwriting a concurrent update with an engine-appropriate conditional or transaction.
4. **Validate and switch reads.** Compare counts, nulls, values, constraints, and application behavior. Switch reads to `full_name` only after the evidence and approval gate passes; keep required old writes during the rollback window.
5. **Contract.** After all old readers and writers are gone and the rollback window is closed, stop writing `name` in one controlled change. In a later controlled change, remove the old column after destructive-operation approval and a verified recovery path.

### Expand/migrate/contract rules and verification

- **Additive first, destructive last and alone.** New nullable columns, tables, or indexes come before drops and renames. Destructive work gets a separately reviewed change after no code references the old shape.
- **Engine-specific DDL.** Check lock duration, table rewrite behavior, replication, index build mode, and workload impact on representative data. Do not claim an operation is online without engine evidence.
- **Compatibility.** Confirm old and new application versions, background jobs, scripts, external clients, retries, and queued messages can read and write the shape during every coexistence phase.
- **Backfill safety.** Use bounded batches, checkpoints, progress and failure reporting, throttling, retry and interruption tests, and a resumable/idempotent strategy. Protect concurrent updates from stale values.
- **Dual-write safety.** Define source-of-truth and conflict behavior. Verify every writer, including infrequent jobs, observes the same rule before relying on dual writes.
- **Validation.** Check row counts, key/value parity, nullability, constraints, indexes, checksums or representative samples, replication/queue state, and application behavior. Record observed results and uncertainty.
- **Cutover gate.** Do not switch reads until backfill and invariants pass, compatible writers are accounted for, telemetry is readable, the responsible owner accepts the evidence, and the approved rollback or roll-forward decision is ready.
- **Rollback boundary.** A code rollback may restore an old reader but cannot undo writes already made to the new shape. Identify the irreversible step and test the approved restore or forward-repair procedure on representative data.
- **Contract gate.** Remove old writes only after zero active old readers/writers, external consumers and infrequent jobs are accounted for, the policy-defined observation/rollback window closes, and destructive approval is recorded. Drop the old shape later, not in the same change by default.

**Complete when:** mixed-version compatibility, DDL behavior, backfill correctness, interruption recovery, validation, cutover, and removal all have evidence; destructive phases remain blocked until their prerequisites and approvals hold.

## 7. Remove the old system

Only remove the old path after all consumers have migrated or retirement is explicitly approved:

```text
1. Verify zero active usage with metrics, logs, dependency analysis, and the consumer inventory.
2. Include infrequent jobs, dormant integrations, old deployed versions, and external clients.
3. Confirm the policy-defined compatibility and recovery window is closed.
4. Remove obsolete implementation, tests that exist only for it, adapters, flags, and configuration.
5. Remove deprecation notices after their purpose is complete; retain historical rationale where the repository keeps it.
6. Update current documentation and preserve records subject to retention requirements.
7. Run the relevant checks and record the final state.
```

Do not delete data merely because code is gone. Apply retention policy and an explicitly approved data-removal or restore procedure. If usage evidence is incomplete, stop removal and name the missing observation or owner.

**Complete when:** no active consumer requires the retired behavior, migration machinery is removed, retained data is accounted for, and the remaining system passes its applicable checks.

## Zombie code

Zombie code has no clear owner, is not actively maintained, but still has consumers. Warning signs include:

- no commits for a long period while active consumers remain;
- no assigned maintainer or team;
- failing tests nobody fixes;
- dependencies with known vulnerabilities nobody updates;
- documentation that references systems that no longer exist.

Assign an owner and maintain it properly, or deprecate it with a concrete migration plan. Zombie code cannot remain in limbo when it carries active security, reliability, or compatibility risk.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| “It still works, why remove it?” | Unowned working code accumulates security debt and complexity silently. |
| “Someone might need it later.” | If it is needed later, it can be rebuilt; retaining unused paths has a continuing cost. |
| “The migration is too expensive.” | Compare migration cost with maintenance, support, security, and opportunity cost over the expected horizon. |
| “We’ll deprecate it after the new system is finished.” | Deprecation planning starts at design time; otherwise the old path becomes permanent by inertia. |
| “Users will migrate on their own.” | They often will not. Provide tooling and support or migrate known users yourself. |
| “We can maintain both systems indefinitely.” | Two systems multiply maintenance, testing, documentation, and onboarding cost. |
| “Just rename the column; it’s one line.” | Mixed versions can query a column that no longer exists. Use the appropriate expand/migrate/contract path. |
| “I’ll add and drop the column in one migration.” | That couples a safe add to a destructive drop and removes a recovery boundary. |
| “We’ll write the rollback if we need it.” | A down path does not prove data reversibility; test the actual recovery procedure and name its limits. |

## Red flags

- A deprecated system has no replacement and no approved retirement decision.
- A deprecation notice has no owner, migration guide, support path, tooling, or removal condition.
- A soft deprecation has remained advisory without usage evidence or progress.
- Compulsory migration has a deadline but no practical help or authorized exception path.
- Zombie code has active consumers and no maintainer.
- New features are still being added to the deprecated system instead of the replacement.
- Deprecation was chosen without measuring current usage or unknown external consumers.
- Code was removed without verifying zero active consumers.
- A schema change and the code that depends on it ship as one incompatible deploy.
- A column is renamed or dropped in place while old readers or writers may exist.
- A backfill can lock the table, overwrite concurrent updates, or cannot resume safely.
- A migration has no tested recovery evidence, or code rollback is being presented as data rollback.

## Verification

### After completing a deprecation

- [ ] The decision rubric and advisory/compulsory classification are recorded.
- [ ] The replacement is proven for critical use cases, or approved retirement without replacement is recorded.
- [ ] A migration notice and concrete guide exist through the established process.
- [ ] Owners, support, compatibility window, and removal condition are named.
- [ ] All active consumers are migrated, retired, or covered by an approved exception.
- [ ] Usage is verified with metrics/logs/dependency evidence, including infrequent consumers.
- [ ] Old implementation, tests, docs, configuration, adapters, flags, and notices are removed or intentionally retained with an owner.
- [ ] No unaccounted references to the deprecated system remain in the scoped inventory.
- [ ] Remaining behavior passes applicable checks and retained data satisfies policy.

### After a database schema migration

- [ ] The chosen engine/version, DDL locks/rewrite behavior, replication impact, and writers were inspected.
- [ ] The change uses additive expand/migrate/contract phases when old and new versions can coexist.
- [ ] Old and new applications are valid against the schema at every deploy step.
- [ ] Dual writes or synchronization cover all writers, including jobs and queues, with conflict behavior defined.
- [ ] Backfill is bounded, throttled, resumable, idempotent, interruption-safe, and protected against stale concurrent updates.
- [ ] Counts, values, constraints, queues, replication, and application behavior were validated with recorded observations.
- [ ] The read cutover has owner approval, telemetry, a recovery decision, and a policy-defined observation window.
- [ ] Code rollback is documented separately from data restore or roll-forward.
- [ ] Old writes/readers are removed only after zero usage and the recovery window closes.
- [ ] Destructive drops/renames are separately approved and have verified recovery evidence.

## Report

Report enough for another authorized operator or owner to understand the state without inferring execution:

- **Decision:** value, consumer scope, advisory/compulsory status, replacement or approved retirement, and owner.
- **Plan or execution:** distinguish proposed phases from actions actually performed.
- **Compatibility:** controlled clean cutover versus bounded adapter, flag, or strangler window, with exit condition.
- **Evidence:** consumer verification, usage observations, data checks, and recovery proof.
- **Remaining gates:** unknown consumers, blockers, irreversible operations, approvals, and removal conditions.
