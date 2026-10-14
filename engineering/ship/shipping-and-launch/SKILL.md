---
name: shipping-and-launch
description: "Use when preparing or assessing a production release or launch: establish evidence, accountable approvals, staged rollout, monitoring, and a safe recovery path."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/shipping-and-launch
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/shipping-and-launch/SKILL.md
  adaptation: "Restored the complete six-area preflight, feature-flag lifecycle, staged rollout sequence and decision branches, monitored signals and error-reporting examples, postlaunch checks, error-budget gate, recovery template, rationalizations, red flags, verification, and release record. Retained project-policy thresholds, UI-only applicability, explicit approvals, verified observations, MCP resource boundaries, and code rollback distinct from data restore or roll-forward; examples are illustrative and do not install tools or authorize operations."
---

# Shipping and launch

Prepare a release that can be observed, stopped, and recovered without guessing. The goal is not merely to deploy: it is to deploy safely, with evidence, monitoring, an accountable decision owner, a clear success condition, and a recovery path appropriate to the code and data.

Use this skill for a first production launch, a material change, a data or infrastructure migration, a beta or early-access program, or any change whose failure could affect users, data, security, or service reliability. For a small low-risk change, keep the same decision points and scale the evidence and ceremony to the change. Do not create infrastructure merely to satisfy this playbook.

Examples, percentages, dates, thresholds, commands, provider names, and code snippets in this document are illustrative unless the project's approved policy or repository evidence supplies them. They do not prove that a tool, flag control plane, dashboard, deployment integration, or recovery command exists.

## Operating boundary and shared resources

Separate planning from execution:

- **Ready plan:** release scope, evidence, owner, approvers, rollout, monitoring, recovery, data-safety decisions, and postlaunch checks are written and accepted.
- **Executed release:** an authorized operator performs production actions and records timestamps, observations, decisions, deviations, and final state. A plan, diff, successful staging run, or proposed command is not evidence that production changed.

Production actions require the project's normal authorization. This skill does not deploy, publish, mutate data, push commits, run an automatic revert, or perform destructive rollback. A recovery step must name the approved operator, exact artifact or parameter, command or runbook, confirmation point, and safety check before it is used.

When a shared checklist or lifecycle mode is needed, discover `using-agent-skills` in the same authorized catalog and revision, load it by the exact returned MCP URI, and read the matching resource URI returned by that load. Relevant resources include `definition-of-done`, `security-checklist`, `performance-checklist`, `accessibility-checklist`, `observability-checklist`, and `orchestration-patterns`. Use the `ship` mode resource for independent review orchestration and reconciliation; do not duplicate its host-specific worker mechanics here. These are MCP resources, not assumed relative paths in the developer's workspace.

## When to use

- Deploying a feature to production for the first time.
- Releasing a significant change to users.
- Migrating data or infrastructure.
- Opening a beta or early-access program.
- Preparing any deployment that carries material risk.
- Assessing whether an already planned release has enough evidence to proceed.

## 1. Bound the release

Write down:

- the change, affected services and users, environments, dependencies, and intended outcome;
- the exact revision, artifact, configuration, schema, or data operation under consideration;
- the release owner and the operator who may execute it;
- approvers required by the service's release, security, privacy, data, incident, or change policy;
- the planned window, communication channel, escalation path, and support coverage;
- the smallest safe unit to release and what is explicitly out of scope;
- whether the change is code-only, configuration, infrastructure, schema, data, or a combination;
- the previous known-good artifact and any state that may remain after recovery.

If a required gate is not defined by an existing service policy, SLO, error-budget policy, or release process, stop and obtain explicit agreement from the relevant owner. Do not invent a threshold, duration, approval, or recovery guarantee to fill the gap.

**Complete when:** scope, artifact, owner, operator, approvers, policy, intended outcome, out-of-scope work, and release boundary are recorded.

## 2. Build an evidence-backed preflight

Record evidence for every applicable gate. Link the exact build, artifact, change set, test or check result, dashboard, runbook, and policy; record when it was observed and who reviewed it. Mark a gate **not applicable** with a reason rather than silently skipping it. Missing evidence is not a pass.

Use the shared resources returned by `using-agent-skills` for the project's definition of done and specialized security, performance, accessibility, and observability checklists. Those resources provide shared checklists; this skill adds release-specific ownership, rollout, recovery, and observation gates.

### 2.1 Code quality and correctness

- [ ] Required unit, integration, end-to-end, migration, contract, and regression checks pass for changed paths.
- [ ] The build and packaging path used for release succeeds under the production-like configuration.
- [ ] Required linting, type checking, static analysis, and artifact checks pass; any exception is explicit, scoped, owned, and policy-approved.
- [ ] Code review is complete; unresolved known failure modes have an owner and an explicit decision.
- [ ] No unresolved TODO or debug work remains that should block release.
- [ ] Development-only configuration, temporary access, debug output, and accidental `console.log` statements are absent from the release artifact.
- [ ] Expected errors are handled and surfaced through the service's normal reporting path without exposing internals.
- [ ] Critical flows and failure paths were exercised in an environment appropriate to the risk, with observed results recorded.

### 2.2 Security and privacy

- [ ] Secrets are supplied through the approved mechanism and are absent from source, logs, artifacts, and release records.
- [ ] Applicable dependency, image, static, threat-model, privacy, and authorization checks meet the project's policy.
- [ ] User-controlled input, identity, permissions, rate limits, and cross-origin behavior are covered where the change touches them.
- [ ] Security and privacy reviews or approvals are recorded when policy requires them.
- [ ] Security headers and transport settings are verified when the affected interface requires them.
- [ ] Error responses, telemetry, migration data, and support output are redacted and scoped to the minimum necessary information.

### 2.3 Performance and capacity

- [ ] Relevant resource, query, queue, dependency, and throughput behavior has evidence from the appropriate environment or a justified lower-risk check.
- [ ] Critical paths have no known N+1 queries or avoidable unbounded work; indexes, caching, bundle size, and image behavior are checked when applicable.
- [ ] Capacity and limits are understood for the affected service; no universal latency, traffic, utilization, or bundle number is assumed.
- [ ] Performance gates use the service's existing SLO, budget, capacity plan, or release policy. If none exists, obtain an owner-approved gate before release.
- [ ] For a UI change, relevant Core Web Vitals or equivalent user-perceived performance signals are checked against the project's supported targets. For a backend-only change, mark UI-only checks not applicable with a reason.

### 2.4 Accessibility and user experience

Apply this area when the release changes a user interface, user interaction, content semantics, or an accessibility-sensitive workflow. Do not require UI checks for a backend-only, infrastructure-only, or non-user-facing change; record why they are not applicable.

- [ ] Keyboard operation works for all affected interactive elements.
- [ ] Focus management is correct for modals, navigation, and dynamic content.
- [ ] Names, roles, labels, headings, structure, and screen-reader output convey the affected page or flow.
- [ ] Contrast and non-color cues meet the project's supported accessibility policy.
- [ ] Error messages are descriptive and associated with their controls.
- [ ] The supported accessibility checks (for example, an approved axe or browser check) have observed results; an example tool is not presumed installed.
- [ ] A realistic critical user flow was exercised with the project's supported browser or assistive-technology evidence where required.

### 2.5 Infrastructure and operations

- [ ] Required environment configuration, permissions, certificates, routing, DNS, storage, queues, and dependencies are present or have an authorized execution step.
- [ ] Database migrations, schema compatibility, data safeguards, and lock/load impact are understood when applicable.
- [ ] Logging, metrics, traces, alerts, dashboards, health checks, readiness signals, and on-call runbooks needed for this release exist and are readable by the on-call owner.
- [ ] The release can identify its artifact, current version, previous known-good state, exposure, and operator.
- [ ] Deployment and recovery controls are tested or otherwise evidenced in an authorized environment; a proposed provider command is not proof.

### 2.6 Documentation and communication

- [ ] Setup or environment documentation is current when requirements changed.
- [ ] API, migration, release, and user-facing documentation is current when applicable.
- [ ] Architectural decisions worth preserving are recorded through the project's established ADR or decision process.
- [ ] Changelog and release notes are updated when the project uses them.
- [ ] Incident, support, stakeholder, and customer communication is prepared for material behavior or risk changes.
- [ ] Owners know where the release record, dashboards, runbooks, and recovery instructions live.

**Preflight completion:** every applicable gate has evidence and an accountable reviewer; every non-applicable gate has an explicit reason; every missing gate has an owner-approved decision; required approvals are recorded; and the release owner signs the resulting plan.

## 3. Feature flag strategy

Use a feature flag to decouple deployment from release only when the service has a supported control plane, an owner, a safe default, useful telemetry, and a cleanup path. A flag is conditional, not a requirement for every change. If no approved flag mechanism exists, do not imply that one was created.

```typescript
// Illustrative only: use the repository's approved flag mechanism if one exists.
const flags = await getFeatureFlags(userId);

if (flags.taskSharing) {
  // New feature: task sharing
  return <TaskSharingPanel task={task} />;
}

// Existing behavior remains the default until exposure is approved.
return null;
```

### Feature-flag lifecycle

```text
1. DEPLOY with flag OFF
   Code is in the approved artifact but inactive.
2. ENABLE for an approved team or beta cohort
   Internal production use is observed without broad exposure.
3. GRADUAL ROLLOUT
   Use policy-defined cohorts or rings; values such as 5% → 25% → 50% → 100%
   are illustrative, not universal.
4. MONITOR at each stage
   Compare errors, performance, user behavior, data outcomes, and feedback with a
   relevant baseline.
5. CLEAN UP
   Remove the flag and dead path after full rollout, owner confirmation, and the
   project-defined cleanup condition.
```

Flag rules:

- Every flag has an owner, purpose, default state, exposure rule, telemetry, and removal condition.
- Use a project-approved cleanup date or policy; do not promise a universal deadline. The upstream two-week example is a useful prompt, not a catalog requirement.
- Avoid nested flags unless the service owner accepts the test matrix, operational risk, and cleanup cost.
- Test and observe both flag states where policy and risk require it.
- Disable a flag for recovery only after confirming the control plane and previous path are healthy.
- Remove the flag and dead code when exposure is complete; a flag left indefinitely is a second implementation path.

A flag trades redeploy speed for control-plane dependence, extra combinations, and cleanup debt. Record those tradeoffs in the release plan.

## 4. Define the staged rollout and observation plan

Choose the least risky rollout that still gives useful evidence. A flag, shadow path, canary, ring, or staged deployment is conditional—not a requirement for every change. For each stage, record:

1. **Audience and scope:** environment, service version, users, traffic, or data partition included.
2. **Entry gate:** evidence and approval required to start the stage.
3. **Observation basis:** policy-defined duration, event boundary, sample, or cohort; do not insert a universal time window.
4. **Baseline:** comparable pre-release period, cohort, version, or control path, including known confounders.
5. **Signals:** service-level indicators, errors by type and endpoint, latency distributions, saturation, dependency health, client signals, business outcomes, and data invariants as relevant.
6. **Decision owner:** named person who may advance, hold, narrow, stop, roll back, or roll forward.
7. **Exit rule:** service-specific SLO, alert, budget, business, data-integrity, or user-impact criteria for advance, hold, recovery, or exception.

Compare like with like: canary versus baseline on the same service, endpoint, cohort, traffic shape, and time basis where possible. A green aggregate can hide a failing cohort or endpoint. Record the comparison, uncertainty, observed evidence, and decision; do not convert an illustrative difference into a universal percentage or latency threshold.

### Rollout sequence

The following sequence restores the upstream planning pattern. Stage names, cohorts, windows, and thresholds must be replaced by the service's approved policy:

```text
1. DEPLOY to the approved pre-production environment
   └── Run required checks in a production-like configuration.
   └── Exercise critical flows and record observed results.

2. DEPLOY to production with exposure OFF (when a supported flag or equivalent exists)
   └── Verify the authorized deployment succeeded and health/readiness is normal.
   └── Check error monitoring, telemetry, configuration, and ownership.

3. ENABLE for an approved team or beta cohort
   └── Internal users exercise the feature in production.
   └── Observe the policy-defined window or event boundary.

4. CANARY on the smallest approved production cohort
   └── Monitor errors, latency, saturation, dependencies, user behavior, and data.
   └── Compare canary with baseline, not just aggregate health.

5. GRADUALLY INCREASE exposure
   └── Use policy-defined rings or cohorts; 25% → 50% → 100% is illustrative.
   └── Repeat the same evidence and decision process at every stage.

6. FULL ROLLOUT
   └── Obtain final approval, then observe the policy-defined post-rollout period.
   └── Remove flags and dead paths only after the owner confirms the cleanup gate.
```

At every stage:

- **Advance** only when required evidence is complete, signals satisfy approved policy, and the named owner and required approvers accept the record.
- **Hold and investigate** when evidence is incomplete, a signal is ambiguous, an approved gate is yellow, or impact is unexplained. Do not advance to make the schedule work.
- **Narrow or stop** exposure when a cohort or dependency is failing, data integrity is uncertain, monitoring is unavailable, or a policy gate is breached.
- **Recover** using the approved containment, rollback, restore, or roll-forward path when the trigger is met. Choose code rollback only when the artifact and data remain compatible; otherwise use the approved forward fix or data recovery procedure.
- **Repeat** the decision for every stage. The sequence is a planning pattern, not proof that any stage was executed.

### Illustrative rollout decision thresholds

The upstream table is useful as an example of explicit branches, but its values are not universal. Substitute the service's approved SLO, release, business, and data policy. If no policy exists, obtain an owner-approved temporary gate before release.

| Metric | Advance (green) | Hold and investigate (yellow) | Recover (red) |
|---|---|---|---|
| Error rate | Within the approved tolerance of baseline; upstream illustration: within 10% | Above approved tolerance but not a confirmed stop; upstream illustration: 10–100% above baseline | Approved hard gate breached; upstream illustration: more than 2× baseline |
| P95 latency | Within the approved service target; upstream illustration: within 20% of baseline | Above target but impact is uncertain; upstream illustration: 20–50% above baseline | Hard service gate breached; upstream illustration: more than 50% above baseline |
| Client errors | No new error types, or the approved client-error gate passes | New type or limited cohort impact under investigation | Approved client-error or user-impact gate breached |
| Business/data outcomes | Neutral or positive against the approved baseline | Decline or integrity difference that may be noise but needs investigation | Approved business, data-integrity, or user-impact gate breached |

A high burn rate during a canary is a **hold** signal relative to the approved baseline even if one error metric looks acceptable. Do not treat a green aggregate as permission to ignore a failing cohort.

### When to recover

Start the approved recovery decision when any of the following is observed and matches policy:

- the service error or latency gate is breached;
- user-reported issues or support impact spike beyond the approved criterion;
- a data-integrity invariant, queue, retry, or side-effect check fails;
- a security or privacy issue is discovered;
- the control plane, telemetry, dependency, or operator cannot provide reliable evidence;
- an unexplained cohort or endpoint regression persists through the hold decision.

The trigger starts a controlled decision; it does not authorize an unconditional command.

## 5. Monitor and report errors

### What to monitor

Choose signals that answer the on-call questions for this release. The following inventory is illustrative:

```text
Application signals:
├── Error rate (total and by endpoint, operation, and error type)
├── Response-time distributions (p50, p95, p99 where useful)
├── Request volume and traffic shape
├── Active users or affected cohort
└── Approved business, user, and data outcomes

Infrastructure signals:
├── CPU and memory utilization
├── Database connection-pool or lock usage
├── Disk and storage capacity
├── Network and dependency latency
└── Queue depth, age, retries, and worker failures where applicable

Client/UI signals (only for user-interface releases):
├── Core Web Vitals or supported page-performance signals
├── JavaScript and rendering errors
├── Client-observed API error rates
└── Page load or interaction time
```

Use the project's approved sampling, privacy, retention, label-cardinality, alert, and escalation policy. Logs, metrics, traces, and dashboards must be readable by the on-call owner. Never put secrets, tokens, passwords, or unnecessary personal data into a release record or telemetry.

### Illustrative error reporting

The following examples show the shape of error reporting, not an installed framework or provider. Adapt them to the repository's actual boundaries, redaction rules, and reporting path.

```typescript
// Illustrative UI boundary for a UI release; not a required React dependency.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, {
      componentStack: info.componentStack,
      userId: getCurrentUser()?.id, // Include only if policy permits and redact as required.
      page: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

```typescript
// Illustrative server boundary; use the service's actual framework and reporting path.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  reportError(err, {
    method: req.method,
    route: req.route?.path,
    requestId: req.id,
    // Do not send auth headers, raw bodies, secrets, or unnecessary personal data.
  });

  // Do not expose internals to users.
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
```

Verify telemetry rather than assuming it works: send approved test traffic, induce an authorized non-destructive failure where possible, find it by correlation ID, check expected metric labels and values, follow a request across relevant services, and confirm the alert/runbook path. Record what was observed and where evidence lives.

## 6. Apply the service's error-budget release gate

Use the affected service's SLO and error-budget policy as the release gate. Record current budget state, recent burn or incident context, and what that policy permits:

- normal release and ordinary rollout;
- reduced scope, slower rollout, or additional observation;
- reliability work before release;
- an exception approved by the policy's authority;
- freeze until the budget or incident condition recovers.

The service policy—not this skill—defines budget values, time basis, burn-rate interpretation, freeze rules, and exception authority. The upstream 20% examples below illustrate explicit decisions only:

```text
Budget remaining above an approved normal-release floor
  → Ship normally; monitor closely.
Budget near the approved low-budget floor (upstream illustration: 0–20%)
  → Slow or narrow rollout; avoid high-risk changes unless policy permits.
Budget exhausted
  → Freeze feature work and focus on reliability, unless an authorized exception says otherwise.
Budget reset or recovered
  → Resume the policy-approved pace and bake in the fix that recovered it.
```

If no SLO or release policy exists, the release is not self-approving. Have the service owner and reliability authority agree on a temporary gate, observation basis, and action before proceeding, or defer the release. During a canary, elevated burn relative to the approved baseline is a hold signal even when a single error metric looks acceptable.

## 7. Make recovery executable but controlled

Before production execution, document a recovery decision for each credible failure mode:

- **Trigger:** observed service-specific condition, incident signal, data-integrity finding, security issue, or user impact that causes hold or recovery.
- **Decision owner:** person who may stop exposure, roll back code, roll forward, restore data, or call the incident process.
- **First safe action:** disable exposure, route traffic, pause a stage, stop a writer, or use another approved containment step when available.
- **Recovery path:** tested previous artifact, forward fix, configuration change, restore, or approved runbook. Name the exact version or parameter and operator authorization; do not write an unconditional `git revert`, `git push`, deploy, or data-deletion command.
- **Verification:** health, error, latency, dependency, business, and data checks that prove recovery took effect.
- **Communication:** release or incident channel, customer/support notice, escalation path, and decision timestamp.
- **Residual state:** flags, queues, partial writes, caches, schema versions, temporary access, or other state left behind and its safe owner and cleanup condition.

Prefer a tested roll-forward when rollback would be unsafe or incompatible. For a flag or routing change, verify the control plane itself is healthy and that the previous path still works. “Reversible” is a claim that needs evidence; migrations, external side effects, queues, persisted writes, and schema changes may not be reversible by redeploying code.

### Illustrative recovery plan template

```markdown
## Recovery Plan for [Feature/Release]

### Trigger conditions
- [Observed service-policy condition]
- [Specific user, security, dependency, or data-integrity signal]
- [Evidence link and observation time]

### Decision owner and approval
- Decision owner: [named role/person]
- Authorized operator: [named role/person]
- Required incident/release/data/security approval: [policy reference]

### First safe containment
1. [Disable approved exposure, pause stage, or route traffic]
2. [Verify control plane and previous path before relying on either]

### Code recovery path
- Artifact/configuration: [exact approved version or parameter]
- Command or runbook: [project-owned, authorized reference]
- Preconditions and confirmation point: [checks]
- Verification: [health, errors, latency, dependencies, critical flow]

### Data recovery or roll-forward path
- Data/schema operation affected: [description]
- Code rollback compatibility: [compatible / not compatible / unknown]
- Restore, forward repair, or roll-forward runbook: [approved reference]
- Validation invariants: [loss, duplication, corruption, queue, and side-effect checks]
- Irreversible step and authorization: [details]

### Communication and residual state
- Release/incident channel: [channel]
- Customer/support message: [approved text or owner]
- Remaining flags, queues, writes, caches, schema, or access: [owner and cleanup condition]

### Recovery evidence
- Observation timestamps:
- Evidence links:
- Final decision: [recovered / held / rolled forward / other]
```

Code rollback, data restore, and data roll-forward are distinct decisions. A previous application artifact may read data written by the new version incorrectly; a restore may lose later valid writes; a roll-forward may be the only safe correction. Name the actual compatibility and evidence instead of promising a universal rollback time.

## 8. Treat schema and data as a separate risk

For schema or data changes, include:

- compatibility with old and new application versions during the rollout;
- a backup, restore point, or recovery mechanism appropriate to the data and policy;
- migration ordering, lock/load impact, duration basis, and abort condition;
- validation queries or invariants that detect loss, duplication, corruption, stale writes, or partial completion;
- treatment of writes made by the new version and of queued, retried, or replayed work;
- an approved forward repair or restore procedure, with authorization and a dry run or prior evidence where feasible;
- the point after which code rollback is no longer sufficient.

Do not promise a data rollback unless the specific operation, backup, restore, and consistency checks have been proven. A destructive repair or mutation is a separate authorized change, not an implicit release step.

## 9. Verify after launch

After each production stage and at final exposure, record observations rather than checking boxes from memory:

- deployed artifact, configuration, exposure, and owner match the approved plan;
- health/readiness and dependency signals are normal for the service policy;
- errors, latency, saturation, traffic, and relevant client or business signals are compared with the baseline;
- the critical user or operator flow works for an appropriate cohort;
- logs, metrics, traces, alerts, and dashboards contain usable, redacted events;
- schema/data invariants, queues, retries, and side effects are accounted for when relevant;
- no rollback path, flag, temporary access, or staged configuration is left without an owner and removal condition;
- support, incident, customer, and stakeholder communications are complete;
- the decision owner records advance, hold, recovery, deviation, and final state.

### First-hour checks

In the first hour after launch, when the service's policy uses this observation basis:

```text
1. Check the approved health or readiness signal.
2. Check error monitoring for new error types and policy-relevant changes.
3. Check latency and saturation dashboards for regression.
4. Exercise the critical user or operator flow manually for an approved cohort.
5. Verify logs and traces are flowing, readable, and appropriately redacted.
6. Confirm the approved recovery mechanism is ready; perform a dry run only when
   authorized and safe.
```

A different service policy may use an event boundary, longer window, or a different check set. The postlaunch record names the time range, baseline, evidence links, decision owner, deviations, residual state, and final state. “No known issue” is not a substitute for observed signals.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| “It works in staging, so it will work in production.” | Production has different data, traffic, dependencies, permissions, and edge cases. Observe after deployment. |
| “We do not need a feature flag for this.” | A flag is not universal, but if a supported control can safely contain a high-risk exposure, record why it is or is not appropriate. |
| “Monitoring is overhead.” | Without usable signals, operators discover failures from user complaints and cannot localize them reliably. |
| “We will add monitoring later.” | Add and verify the needed signals before launch; you cannot diagnose an unseen failure well. |
| “Rolling back is admitting failure.” | Controlled recovery is responsible engineering; shipping known-broken behavior is the failure. |
| “The error rate looks fine, so keep shipping.” | Check burn rate, cohorts, endpoints, data outcomes, and dependencies, not one aggregate metric. |
| “The rollback command is obvious.” | Artifact/data compatibility, authorization, residual state, and verification determine whether rollback is safe. |

## Red flags

- Deploying without an approved recovery plan and named decision owner.
- No monitoring, error reporting, or usable on-call runbook for the affected path.
- Big-bang release when the service policy supports a smaller evidence-gathering stage.
- Feature flags with no owner, default, exposure rule, telemetry, or cleanup condition.
- No one assigned to observe the release during its policy-defined window.
- Production configuration is performed from memory rather than an approved record.
- Security, privacy, data, or accessibility evidence is silently skipped.
- UI checks are demanded for backend-only work, or UI coverage is claimed without UI evidence.
- Error budget is exhausted while feature work continues without an authorized exception.
- A code rollback is presented as a data rollback.
- A recovery command would push, deploy, delete data, or mutate production without an explicit authorization gate.
- A release is marked executed from a plan, staging result, or expected dashboard state rather than observed production evidence.

## Verification

### Before production execution

- [ ] Scope, artifact, owners, operators, approvers, policy, and out-of-scope work are recorded.
- [ ] All six preflight areas are complete, explicitly not applicable, or covered by an owner-approved decision:
  - [ ] Code quality and correctness
  - [ ] Security and privacy
  - [ ] Performance and capacity
  - [ ] Accessibility and user experience (when relevant)
  - [ ] Infrastructure and operations
  - [ ] Documentation and communication
- [ ] Feature flag, routing, or staged exposure is configured only when a supported mechanism exists; owner and cleanup condition are recorded.
- [ ] Rollout stages, baselines, signals, policy-defined observation basis, decision owner, and advance/hold/recovery branches are recorded.
- [ ] Error-budget state and policy action are recorded.
- [ ] Recovery plan separates code rollback from data restore and roll-forward, with verification and residual-state handling.
- [ ] Required approvals and communication paths are recorded.

### After production execution

- [ ] Authorized operator recorded actual artifact, configuration, exposure, timestamps, observations, and decisions.
- [ ] Health/readiness, error, latency, saturation, dependency, and relevant client/business/data signals were observed against a baseline.
- [ ] Critical flow and telemetry were verified for the appropriate cohort.
- [ ] Recovery mechanism was tested, dry-run, or otherwise evidenced according to policy.
- [ ] Flags, temporary access, queues, caches, partial writes, schema state, and staged configuration have owners and cleanup conditions.
- [ ] Support, incident, customer, and stakeholder communication is complete.
- [ ] Postlaunch evidence supports the final state; remaining risks and deviations are recorded.

## Release record

Use this compact record for the plan and fill it with evidence during execution. A record is **ready** only when evidence, owners, approvals, service-specific gates, and controlled recovery are present. Mark it **executed** only after an authorized operator records what actually happened and postlaunch verification is complete.

```text
Release:
Change set / artifact / revision:
Affected services and users:
Risk and scope:
Intended outcome:
Release owner:
Authorized operator:
Required approvers:
Existing SLO / release / security / privacy / data policy:
Missing gates and explicit owner agreements:
Previous known-good state:

Preflight evidence:
- Code quality/correctness:
- Security/privacy:
- Performance/capacity:
- Accessibility/user experience (if relevant, or N/A reason):
- Infrastructure/operations:
- Documentation/communication:

Feature flag or exposure control (if applicable):
- Owner/default/exposure rule:
- Telemetry and baseline:
- Cleanup condition:

Rollout stages:
- Stage / audience / scope:
- Entry approval:
- Baseline and signals:
- Observation basis:
- Advance / hold / narrow / recovery rule:
- Decision owner:

Error-budget state and policy action:
Recovery triggers and first safe containment:
Code rollback path and verification:
Data restore/roll-forward path and verification:
Schema/data safety and irreversible steps:
Postlaunch checks and evidence:
Execution log and evidence links:
Residual state and cleanup owners:
Deviations and accepted risks:
Final state: PLANNED | EXECUTED | HELD | RECOVERED | ROLLED FORWARD
```
