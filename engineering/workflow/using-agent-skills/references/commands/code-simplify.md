# Code simplification workflow

Load `code-simplification`. Preserve observable behavior, contracts and edge cases; fewer lines alone are not proof of a better design.

1. Read repository guidance. Scope to the selected artifact, or recent changes when that is the agreed task; do not use a small simplification request to rewrite the codebase.
2. Understand purpose, callers, error paths, invariants and tests before editing. Establish relevant runtime/test evidence for the current behavior.
3. Look for unnecessary nesting, unclear names, duplicated policy, dead code and needless indirection. Prefer deletion or an existing facility; extract only when it removes real repeated knowledge or clarifies a boundary.
4. Make one small authorized change at a time, maintaining semantics and scope. Do not combine a feature change with the simplification or remove safety checks to shorten code.
5. Run the relevant checks after each meaningful change and compare the behavior. If a change fails, repair it or undo only that attempted edit while preserving other work; never use a destructive reset as cleanup.
6. Review the resulting scope and report what became simpler, the evidence of preserved behavior, and remaining uncertainty.

If the user requested a simplification review rather than edits, return recommendations without modifying files. Formatting follows the project's existing tooling; no new dependency or abstraction is required by this mode.

## MCP invocation and source

Request this mode in natural language, for example “run the code-simplify workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/code-simplify.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/code-simplify.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
