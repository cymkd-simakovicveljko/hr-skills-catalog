# Review workflow

Load `code-review-and-quality` and, for the full reviewer perspective, this router's `references/agents/code-reviewer.md`. Review the user-selected diff or artifact without modifying it.

1. Establish the exact scope, task/spec, revision and repository conventions. Read relevant tests and caller context, not only changed lines.
2. Evaluate correctness, readability, architecture, security and performance. Ground findings in reachable behavior and the actual contract.
3. Load `security-and-hardening` or `performance-optimization` when their risks are present. A reviewer may recommend an independent specialist pass; it does not silently spawn a chain of personas.
4. Use the primary skill's severity vocabulary: Critical, Required, Optional and Nit. Each substantive finding includes file:line, evidence, impact and a concrete recommendation. Do not turn preferences into blockers.
5. Return the verdict, findings, genuine positive observations where supported, and a verification story distinguishing inspection from commands actually run. Missing evidence is not a pass.

This is review, not remediation, commit, merge or release authorization. The optional `blast-radius` supplement can deepen change-impact analysis without replacing the five-dimension review.

## MCP invocation and source

Request this mode in natural language, for example “run the review workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/review.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/review.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
