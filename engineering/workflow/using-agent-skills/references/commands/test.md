# Test workflow

Load `test-driven-development`. Discover the actual repository test commands, runner and relevant test conventions before adding anything.

- **New behavior under approved implementation:** take one vertical slice through red → green → refactor. Observe the intended behavior failure before implementation; keep assertions on public outcomes and boundaries rather than mocks echoing inputs.
- **Bug repair:** use `debugging-and-error-recovery` to identify the causal path and a prove-it regression. Demonstrate the defect, implement the authorized repair, observe the check pass and run the relevant regression suite.
- **Existing test run or coverage review:** execute/analyze the requested scope and report exact failures or gaps. A read-only verification request does not authorize changing production code or weakening tests until green.
- **Browser-visible behavior:** additionally load `browser-testing-with-devtools` and use available host browser tooling for real interaction, accessibility and visual/runtime evidence. Unit tests alone do not prove the rendered UI.

Read the router resource `references/testing-patterns.md` for applicable examples. Use the repository's installed stack; do not install a new runner as a side effect. Report commands, observed outcomes and unverified paths. Keep required gates blocked when tooling is unavailable rather than claiming a static inspection passed them.

## MCP invocation and source

Request this mode in natural language, for example “run the test workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/test.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/test.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
