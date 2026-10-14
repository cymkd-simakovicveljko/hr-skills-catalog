# Plan workflow

Load `planning-and-task-breakdown`. Inspect the approved spec and actual repository read-only before proposing implementation steps.

1. Confirm the spec's scope and acceptance criteria. If there is no approved spec for substantial or ambiguous work, run the spec workflow first rather than invent requirements.
2. Identify the affected modules, existing patterns, dependencies, risks and known tool commands. Do not edit production code during planning.
3. Break implementation into vertical, independently verifiable slices. Give each task its scope, prerequisites, acceptance criteria, exact verification strategy and any human decision or safety checkpoint.
4. Order tasks by dependency and expose genuine parallelism with non-overlapping ownership and a shared contract. A plan should reduce uncertainty, not invent layers or pad tasks.
5. Use the project's existing plan/tracker. `tasks/plan.md` and `tasks/todo.md` are upstream defaults only if appropriate. Stop before replacing an unfinished unrelated plan; ask which scope to preserve.
6. Present the whole plan for approval. Record approved scope and any explicitly authorized commit policy. Do not start build merely because the plan was written.

## MCP invocation and source

Request this mode in natural language, for example “run the plan workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/plan.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/plan.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
