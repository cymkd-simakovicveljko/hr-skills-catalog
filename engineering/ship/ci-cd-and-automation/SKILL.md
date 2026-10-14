---
name: ci-cd-and-automation
description: "Designs and reviews CI/CD automation. Use when setting up or modifying build, test, security, preview, or deployment pipelines; establish repository-specific quality gates, safe feedback loops, and authorized release automation without claiming unavailable hooks, caches, runners, or deploy integrations."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/ci-cd-and-automation
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/ci-cd-and-automation/SKILL.md
  adaptation: "Preserved quality gates, GitHub Actions, integration/E2E examples, agent feedback loop, preview/flags/staged rollout/rollback patterns, environment separation, dependency automation, build ownership, PR checks, optimization, rationalizations, red flags, and checklist; qualified examples against repository policy and authorization, removed universal time/threshold claims, and documented hook/cache/runner/deploy capability limits instead of implying integrations are installed."
---

# CI/CD and Automation

## Overview

Automate the repository's required quality gates so changes cannot reach a protected merge or release stage without the evidence its policy requires. Common gates include tests, lint, type checking, builds, integration/E2E checks, security review, and artifact checks, but the repository's actual contract decides which apply. CI/CD catches what humans and agents miss; it does not replace review, authorization, or production evidence.

**Shift Left:** Catch problems as early in the pipeline as the repository can support. A bug caught in static analysis is usually cheaper than one found after release. Move checks upstream — static analysis before tests, tests before staging, staging before production when those stages exist.

**Faster is Safer:** Smaller batches and frequent releases can reduce risk when the service's release process supports them. A deployment with a few changes is often easier to debug than a large batch; this is a planning heuristic, not a universal release rule.

## Operating boundary

This skill designs or reviews automation. It does not install dependencies, configure repository settings, add hooks, create credentials, deploy, publish, roll back, push commits, or mutate production without explicit task authorization. Preview, deployment, rollback, feature-flag, cache, runner, and hook examples are plans until the host reports that the integration exists and an authorized operator executes it.

## When to Use

- Setting up a new project's CI pipeline
- Adding or modifying automated checks
- Configuring deployment pipelines
- When a change should trigger automated verification
- Debugging CI failures and feeding safe failure evidence back into the implementation loop

## The Quality Gate Pipeline

For a repository that requires these checks, a typical quality-gate shape is:

Use the repository's required gates in its configured order; mark a gate not applicable only with an explicit policy reason:

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

Required gates should fail closed: fix the underlying issue or obtain an explicit, recorded policy exception with an owner and expiry. Do not silently disable checks or claim a gate passed when the repository has no runner, dependency, cache, credential, or integration to execute it.

## GitHub Actions Configuration

### Basic CI Pipeline
The workflow below is an illustrative GitHub Actions example. First inspect the repository's package manager, supported runtimes, required scripts, lockfile, runner policy, and branch protection; do not copy commands or claim they run until those facts are present.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### With Database Integration Tests

```yaml
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: ci_user
          POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **Note:** Even for CI-only test databases, use GitHub Secrets for credentials rather than hardcoding values. This builds good habits and prevents accidental reuse of test credentials in other contexts.

### E2E Tests

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build
        run: npm run build
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Feeding CI Failures Back to Agents

The useful CI loop preserves the exact failure and feeds it back as untrusted diagnostic evidence. Do not expose credentials or unnecessary personal data from logs.

```
CI fails
    │
    ▼
Record the job, revision, command, relevant output, and environment
    │
    ▼
Give the smallest redacted failure to the agent:
"The CI pipeline failed with this error:
[paste specific error]
Diagnose the cause and verify the repair locally before requesting another run."
    │
    ▼
Agent proposes/fixes → authorized commit or push → CI runs again
```

The agent must not push, rerun privileged jobs, alter branch protection, or change CI secrets without explicit authorization. A host may not expose CI APIs; in that case report the missing capability and use the repository's supported local equivalent.

**Key patterns:**

```
Lint failure → inspect the repository's lint command; auto-fix only when authorized and supported
Type error  → read the error location and repair the type boundary
Test failure → load `debugging-and-error-recovery` by skill name when diagnosis is needed
Build error → check configuration, dependency lockfiles, and supported runtime
```

## Deployment Strategies

### Preview Deployments

Offer a preview deployment only when the repository has an approved preview environment and the host exposes the required provider integration. A preview is evidence for manual testing, not proof of production readiness:

```yaml
# Illustrative only — provider, action, permissions, and secret policy are repository-specific
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy preview
      run: <authorized-provider-command>
```

### Feature Flags

Feature flags decouple deployment from release when the service has a supported flag control plane and an owner. Deploy incomplete or risky features behind flags only when the exposure, telemetry, cleanup, and recovery policy are explicit:

- **Ship code without enabling it.** Merge to the default branch early only when the repository's review policy permits it.
- **Contain without redeploying.** Disable the flag only if the control plane and previous path are healthy.
- **Stage exposure.** Use cohorts or rings defined by the service policy; percentages such as 1%, 10%, and 100% are examples, not universal rollout rules.
- **Run A/B tests.** Compare behavior with an approved experiment design and privacy treatment.

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**Flag lifecycle:** Create → enable for testing → stage exposure under policy → remove the flag and dead code when the owner confirms it is no longer needed. Set a cleanup condition and owner at creation; do not promise a date the repository has not approved.

### Staged Rollouts

Use staging and production stages only when the repository's release process supports them and an authorized operator owns the transition:

```
PR merged to the protected branch
    │
    ▼
  Approved staging deployment
    │ Evidence and manual verification
    ▼
  Authorized production deployment
    │
    ▼
  Observe the service-policy window and signals
    │
    ├── Policy-defined failure → hold or controlled recovery
    └── Evidence accepted → advance or finish
```

The observation duration, advance rule, and recovery action come from the service's SLO/release policy. A fixed duration such as 15 minutes is an example, not a universal gate.

### Rollback Plan

Every deployment needs a recovery path appropriate to its service and data model. A rollback is not inherently safe: migrations, external side effects, queues, and incompatible artifacts may require containment or roll-forward.

```yaml
# Illustrative manual recovery workflow; provider, permissions, artifact, and approvals are repository-specific
name: Recovery
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Previously approved artifact or configuration'
        required: true

jobs:
  recovery:
    steps:
      - name: Verify authorization and target
        run: <operator-approved-preflight>
      - name: Apply approved recovery path
        run: <provider-specific-recovery-command>
      - name: Verify service and data invariants
        run: <repository-specific-verification>
```

Do not add an unconditional `rollback`, `git revert`, deploy, or data mutation command. Record the decision owner, trigger, artifact or parameter, first safe containment, verification, residual state, and communication path before execution.

## Environment Management

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI should never have production secrets. Use separate secrets for CI testing.

## Automation Beyond CI

### Dependabot / Renovate

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Build Cop Role

Designate someone responsible for keeping CI green. When the build breaks, the Build Cop's job is to fix or revert — not the person whose change caused the break. This prevents broken builds from accumulating while everyone assumes someone else will fix it.

### PR Checks

- **Required reviews:** At least 1 approval before merge
- **Required status checks:** CI must pass before merge
- **Branch protection:** No force-pushes to main
- **Auto-merge:** If all checks pass and approved, merge automatically

## CI Optimization

When the pipeline exceeds 10 minutes, apply these strategies in order of impact:

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use actions/cache or setup-node cache option for node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Use path filters to skip unrelated jobs (e.g., skip e2e for docs-only PRs)
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimize the test suite
│   └── Remove slow tests from the critical path, run them on a schedule instead
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**Example: caching and parallelism**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "CI is too slow" | Optimize the pipeline (see CI Optimization below), don't skip it. A 5-minute pipeline prevents hours of debugging. |
| "This change is trivial, skip CI" | Trivial changes break builds. CI is fast for trivial changes anyway. |
| "The test is flaky, just re-run" | Flaky tests mask real bugs and waste everyone's time. Fix the flakiness. |
| "We'll add CI later" | Projects without CI accumulate broken states. Set it up on day one. |
| "Manual testing is enough" | Manual testing doesn't scale and isn't repeatable. Automate what you can. |

## Red Flags

- No CI pipeline in the project
- CI failures ignored or silenced
- Tests disabled in CI to make the pipeline pass
- Production deploys without staging verification
- No rollback mechanism
- Secrets stored in code or CI config files (not secrets manager)
- Long CI times with no optimization effort

## Verification

After setting up or modifying CI:

- [ ] All quality gates are present (lint, types, tests, build, audit)
- [ ] Pipeline runs on every PR and push to main
- [ ] Failures block merge (branch protection configured)
- [ ] CI results feed back into the development loop
- [ ] Secrets are stored in the secrets manager, not in code
- [ ] Deployment has a rollback mechanism
- [ ] Pipeline runs in under 10 minutes for the test suite
