# Spec workflow

Load `spec-driven-development` from this catalog and revision. Define the problem before implementation.

1. Read the repository's relevant guidance and existing specs. Resolve ambiguity from code and documentation first; use `interview-me` for real product decisions and `idea-refine` when the idea itself needs alternatives and a rubric.
2. Cover six areas: objective and acceptance criteria, executable commands, project structure, code style/conventions, testing strategy, and boundaries/non-goals. Separate facts from assumptions and explicit decisions.
3. For several independent capabilities, first propose a capability/module map, interfaces, dependencies and build order. Get that map approved before writing separate module specs; keep them traceable to the shared objective.
4. Use the project's existing spec location. `SPEC.md`, `docs/specs/` or `tasks/spec.md` are examples, not mandatory new structures. Never overwrite an approved or unrelated spec silently.
5. Present the spec and unresolved choices for human confirmation. A spec request does not authorize implementation. Proceed to the plan only within the requested scope and retain its separate approval gate.

## MCP invocation and source

Request this mode in natural language, for example “run the spec workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/spec.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/spec.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
