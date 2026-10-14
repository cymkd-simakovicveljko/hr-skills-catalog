# Ship readiness workflow

Load `shipping-and-launch` and the router resources `references/definition-of-done.md` and `references/orchestration-patterns.md`. A readiness request ends with a decision and recovery plan, not a deployment.

## Establish the review input

Identify the exact change/revision, approved spec, acceptance evidence, target environment, relevant service policy and known risks. Discover the actual host's subagent capabilities. Read the bundled persona resources:

- `references/agents/code-reviewer.md` — five-dimension code quality.
- `references/agents/security-auditor.md` — trust boundaries and exploitable security risk.
- `references/agents/test-engineer.md` — test strategy, behavioral coverage and missing evidence.

These resources do not install named agents. Supply the appropriate perspective, actual artifact and required skill instructions to supported workers. All release reviewers are read-only: the test reviewer identifies gaps rather than racing to modify tests.

## Fan out, then reconcile

1. Start the three independent review slices in one supported concurrent batch with the same snapshot and report contract. Keep shared runtime mutation out of concurrent reviewers; coordinate any required checks separately.
2. If independent parallel review is unavailable, state that limitation. Same-agent or sequential passes can contribute but must not be described as parallel independent review. A required independent-review gate remains blocked until satisfied or resolved by its authorized exception process.
3. For a genuinely trivial, low-risk change, use the project's documented review scope. Upstream's roughly two files/fifty lines is a triage example, not permission to waive review of auth, money, data or production configuration. Record why any specialist perspective is inapplicable; preserve mandatory policy gates.
4. Collect full reports. Deduplicate findings, reconcile conflicts against source/execution evidence, and map them to release blockers, recommendations or explicitly accepted risks. Reviewer confidence and majority votes do not replace evidence.
5. The main agent covers applicable accessibility, infrastructure, rollout, observability and documentation checks directly. Performance checks depend on actual risk; the web-only auditor is not a mandatory fourth reviewer for every library or CLI. Use `webperf` separately where warranted.

## Readiness report

Return:

- **GO / NO-GO for the stated release scope**, with the evidence and missing gates.
- Blocking findings, owner/actions and exact verification needed to clear them.
- Non-blocking recommendations and accepted risks with the authorized decision owner.
- Recovery trigger, owner, concrete rollback/restore/roll-forward steps and target recovery time. Separate code rollback from potentially irreversible data effects.
- Rollout and monitoring plan, including stop criteria and validation of the recovery route.
- The full specialist reports, not merely a compressed verdict that hides dissent or missing proof.

Do not waive a blocker yourself. GO means the reviewed conditions support release; it is not permission to commit, push, merge, publish, change production or deploy. Execute a rollout only with the user's explicit authorization, then verify actual behavior and monitoring under `shipping-and-launch`.

## MCP invocation and source

Request this mode in natural language, for example “run the ship workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/ship.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/ship.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
