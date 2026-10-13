---
name: shipping-and-launch
description: "Use when preparing or assessing a production release or launch: establish evidence, accountable approvals, staged rollout, monitoring, and a safe recovery path."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/shipping-and-launch
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/shipping-and-launch/SKILL.md
  adaptation: Reworked the checklist into a standalone, evidence-led release playbook; replaced universal thresholds and automatic rollback commands with service policy, named approval, and authorization gates; enabled model invocation for release preparation.
---

# Shipping and launch

Prepare a release that can be observed, stopped, and recovered without guessing. This skill produces a **ready plan**; it does not authorize or claim that a production release happened.

Use it for a first production launch, a material change, a data or infrastructure migration, a beta, or any change whose failure could affect users, data, security, or service reliability. For a small low-risk change, keep the same decision points but scale the evidence and ceremony to the change. Do not create new infrastructure merely to satisfy this playbook.

## Operating boundary

Separate planning from execution:

- **Ready plan:** the release scope, evidence, owner, approvers, rollout, monitoring, recovery, data-safety decisions, and postlaunch checks are written and accepted.
- **Executed release:** an authorized operator performs the production actions and records timestamps, observations, decisions, and final state. A plan, diff, successful staging run, or proposed command is not evidence that production changed.

Production actions require the project's normal authorization. This skill does not deploy, publish, mutate data, push commits, run an automatic revert, or perform a destructive rollback. A recovery step must name the approved operator, command or runbook, confirmation point, and safety check before it is used.

## 1. Bound the release

Write down:

- the change, affected services and users, environments, dependencies, and intended outcome;
- the release owner and the operator who may execute it;
- approvers required by the service's release, security, privacy, data, or incident policy;
- the planned window, communication channel, and escalation path;
- the smallest safe unit to release, and what is explicitly out of scope;
- whether the change is code-only, configuration, infrastructure, schema, or data.

If a required gate is not defined by an existing service policy, SLO, or release process, stop and obtain explicit agreement from the relevant owner. Do not invent a threshold, duration, approval, or recovery guarantee to fill the gap.

## 2. Build an evidence-backed preflight

Record evidence for each applicable gate. Link the exact build, artifact, change set, test or check result, dashboard, runbook, and policy; record when it was observed and who reviewed it. Mark a gate **not applicable** with a reason rather than silently skipping it.

### Correctness and change quality

- Required unit, integration, end-to-end, migration, or contract checks pass for the changed paths.
- The build and packaging path used for release succeeds under the production-like configuration.
- Code review is complete, and unresolved known failure modes have an owner and decision.
- Expected errors are handled and surfaced through the service's normal reporting path.
- Debug output, temporary access, and development-only configuration are absent from the release artifact.

### Security and privacy

- Secrets are supplied through the approved mechanism and are absent from source and artifacts.
- Applicable dependency, image, static, threat-model, privacy, and authorization checks meet the project's policy.
- User-controlled input, identity, permissions, rate limits, and cross-origin behavior are covered where the change touches them.
- Security or privacy approval is recorded when policy requires it.

### Performance and capacity

- The change's relevant resource, query, queue, and dependency behavior has evidence from the appropriate environment or a justified lower-risk check.
- Capacity and limits are understood for the affected service; no universal latency, traffic, or utilization number is assumed.
- Performance gates use the service's existing SLO, budget, capacity plan, or release policy. If none exists, get an owner-approved gate before release.

### Accessibility and user experience

Apply these checks when the release changes a user interface, user interaction, content semantics, or an accessibility-sensitive workflow. Cover keyboard operation, focus, names and structure, contrast, and associated errors with the project's supported checks and a realistic critical flow. Do not require UI checks for a backend-only change, and do not claim accessibility coverage without evidence.

### Operations and documentation

- Required environment configuration, permissions, certificates, routing, and dependencies are present or have an authorized execution step.
- Logs, metrics, traces, alerts, dashboards, and health or readiness signals needed for this release exist and are readable by the on-call owner.
- The change record, API or user documentation, migration notes, and incident or support communication are updated when applicable.
- The owner can identify the release artifact, current version, and previous known-good state.

**Preflight completion:** every applicable gate has evidence and an accountable reviewer; every missing gate has an explicit owner-approved decision; the release owner signs the resulting plan.

## 3. Define the rollout and observation plan

Choose the least risky rollout that still gives useful evidence. A flag, shadow path, canary, ring, or staged deployment is conditional—not a requirement for every change. If a flag is used, record its owner, default state, exposure rule, monitoring plan, and the condition and owner for removal. Avoid nested flags unless the service owner accepts the test matrix and cleanup cost.

For each stage, record:

1. **Audience and scope:** environment, service version, users, traffic, or data partition included.
2. **Entry gate:** the evidence and approval required to start the stage.
3. **Observation window:** the duration or event boundary from the existing service or release policy. State what must be observed; do not insert a universal time window.
4. **Baseline:** the comparable pre-release period, cohort, version, or control path, including known confounders.
5. **Signals:** service-level indicators, errors by type and endpoint, latency distributions, saturation, dependency health, client signals, and relevant business or data outcomes.
6. **Decision owner:** the named person who may advance, hold, narrow, or stop the stage.
7. **Exit rule:** service-specific SLO, alert, budget, business, data-integrity, or user-impact criteria for advance, hold, rollback, or roll-forward. Include the required approval when a rule is ambiguous.

Compare like with like: canary versus baseline on the same service, endpoint, cohort, traffic shape, and time basis where possible. A green aggregate can hide a failing cohort or endpoint. Record the comparison, uncertainty, and decision; do not convert a difference into a universal percentage or latency threshold.

A typical shape is:

1. Validate the artifact in the approved pre-production environment and exercise critical flows.
2. Deploy or otherwise activate the smallest production scope under production authorization.
3. Confirm health, telemetry, configuration, and ownership before exposing users.
4. Expose the approved cohort or stage, then observe the policy-defined window and signals.
5. Advance only after the named owner and required approvers accept the evidence.
6. Hold or stop when evidence is incomplete, a service gate is breached, or impact is unexplained.
7. Repeat for each stage, then complete full exposure only after the final approval.

The sequence is a planning pattern, not proof that any stage was executed.

## 4. Apply the service's error-budget policy

Use the affected service's SLO and error-budget policy as the release gate. Record the current budget state, recent burn or incident context, and what that policy permits: normal release, reduced scope or slower rollout, reliability work first, or an exception approval. The service's policy—not this skill—defines the values, time basis, burn-rate interpretation, freeze rules, and exception authority.

If no SLO or release policy exists, the release is not self-approving. Have the service owner and reliability authority agree on a temporary gate, observation basis, and action before proceeding, or defer the release. During a canary, elevated burn relative to the approved baseline is a hold signal even if a single error metric looks acceptable.

## 5. Make recovery executable but controlled

Before production execution, document a recovery decision for each failure mode:

- **Trigger:** the observed service-specific condition, incident signal, data-integrity finding, security issue, or user impact that causes a hold or recovery decision.
- **Decision owner:** who may stop exposure, roll back, roll forward, or call the incident process.
- **First safe action:** disable the exposure, route traffic, pause the stage, or use another approved containment step when available.
- **Recovery path:** a tested previous artifact, forward fix, configuration change, or approved runbook. Name the exact version or parameter and the operator authorization; do not write an unconditional `git revert`, `git push`, deploy, or data deletion command.
- **Verification:** the health, error, latency, dependency, business, and data checks that prove the recovery took effect.
- **Communication:** incident or release channel, customer/support notice, and escalation path.
- **Residual state:** flags, queues, partial writes, caches, schema versions, or other state left behind and how it will be handled safely.

Prefer a tested roll-forward when rollback would be unsafe or incompatible. For a flag or routing change, verify that the control plane itself is healthy and that the previous path still works. “Reversible” is a claim that needs evidence; do not assume every migration, external side effect, or persisted write can be undone.

## 6. Treat schema and data as a separate risk

For schema or data changes, include:

- compatibility with old and new application versions during the rollout;
- a backup, restore, or recovery point appropriate to the data and policy;
- migration ordering, lock or load impact, duration basis, and an abort condition;
- validation queries or invariants that detect loss, duplication, corruption, or partial completion;
- treatment of writes made by the new version and of queued or retried work;
- an approved forward repair or restore procedure, with authorization and a dry run or prior evidence where feasible.

Do not promise a data rollback unless the specific operation, backup, restore, and consistency checks have been proven. A destructive repair or mutation is a separate authorized change, not an implicit release step.

## 7. Verify after launch

After each production stage and at final exposure, record observations rather than checking boxes from memory:

- the deployed artifact, configuration, exposure, and owner match the approved plan;
- health/readiness and dependency signals are normal for the service policy;
- errors, latency, saturation, traffic, and relevant client or business signals are compared with the baseline;
- the critical user or operator flow works for an appropriate cohort;
- logs, metrics, traces, alerts, and dashboards contain usable events;
- schema/data invariants, queues, retries, and side effects are accounted for when relevant;
- no rollback, flag, temporary access, or staged configuration is left without an owner and removal condition;
- support, incident, and stakeholder communications are complete.

The postlaunch record names the time range, evidence links, decision owner, deviations, and final state. “No known issue” is not a substitute for observed signals.

## Release record

Use this compact record for the plan and fill it with evidence during execution:

```text
Release:
Change set / artifact:
Affected services and users:
Risk and scope:
Release owner:
Authorized operator:
Required approvers:
Existing SLO / release / security / data policy:
Missing gates and explicit agreements:

Preflight evidence:
- Correctness:
- Security/privacy:
- Performance/capacity:
- Accessibility (if relevant):
- Operations/configuration:

Rollout stages:
- Stage / audience:
- Entry approval:
- Baseline and signals:
- Observation basis:
- Advance / hold / recovery rule:
- Decision owner:

Error-budget state and policy action:
Recovery paths and verification:
Schema/data safety:
Postlaunch checks:
Execution log and evidence links:
Final state: PLANNED | EXECUTED | HELD | RECOVERED
```

A record is **ready** only when the plan has evidence, owners, approvals, service-specific gates, and a controlled recovery path. Mark it **executed** only after an authorized operator records what actually happened and postlaunch verification is complete.
