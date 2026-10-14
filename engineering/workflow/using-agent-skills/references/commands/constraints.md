# Constraints workflow

Load `constraint-driven-development`. Use its bundled `references/floor-guard.md` only through the returned MCP resource URI; the script example is not an installed command.

## Define and enforce

1. Inspect existing project tools and gates first. Reuse the actual linter, test runner, scanners, bundle budgets and CI rather than building a parallel policy system.
2. Ask only unresolved owner decisions, at most four focused questions and one at a time: dimensions; block versus warn; baseline/thresholds; acceptable feedback latency. Repository policy answers do not need another interview.
3. Write or update the approved `CONSTRAINTS.md` location without overwriting unrelated work. Record the floor, enforced versus merely measured dimensions, exact commands, justified thresholds and exceptions with owner and expiry.
4. Distinguish an adopted hard gate from an aspirational target. Missing tools, a missing URL or an inaccessible baseline mean unverified evidence, not a silently dropped dimension or a green result.
5. Put cheap deterministic checks at edit/task boundaries and expensive checks in the appropriate task/CI stage. Confirm exit semantics and expected artifacts. Alter repository instructions, hooks or CI only when that configuration work is authorized; don't install scanners or global hooks automatically.
6. Present the actual policy and enforcement evidence. Do not claim enforcement because a document or shell snippet exists.

## Check mode

Run each applicable approved command and report pass/fail/unavailable, raw supporting evidence, exceptions and owner decisions. Preserve failures; do not weaken thresholds to get green.

## Guard mode

Inspect the proposed delta against the adopted floor and explicitly approved comparison base. Reject unapproved removals or weakening of enforcement. The bundled guard example distinguishes satisfied floor, violation, and execution/configuration error; an error must not masquerade as a pass. Review and explicitly install/adapt it only if requested.

## Ratchet mode

After demonstrated sustained improvement, propose a stricter baseline with measurements, cost and exception implications. Get owner approval before adopting it. Tighten incrementally; never turn one unusually good run into an unexplained permanent gate.

## MCP invocation and source

Request this mode in natural language, for example “run the constraints workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/constraints.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/constraints.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
