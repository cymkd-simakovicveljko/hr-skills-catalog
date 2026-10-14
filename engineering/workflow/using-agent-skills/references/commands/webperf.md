# Web performance audit workflow

Use for a web application, route, component or live page—not a backend-only utility or CLI. Load `performance-optimization` and the router resources `references/agents/web-performance-auditor.md` and `references/performance-checklist.md`.

## Quick mode

Inspect the scoped source and actual framework. Identify plausible loading, rendering, interaction and network anti-patterns. Every source-only finding is **potential impact**. Leave metric values **not measured**; source review cannot produce LCP, INP, CLS or Lighthouse scores.

## Deep mode

Use supplied Lighthouse, PageSpeed Insights, CrUX or DevTools artifacts, or capture real evidence with already available, authorized host tooling. Load `browser-testing-with-devtools` for runtime capture. Discover tool names rather than assuming a Chrome-specific server exists.

Record the URL/artifact, environment, timestamp, device/network settings and observation population where available. Label every value as lab, field or trace; CrUX p75 over its stated period is not equivalent to a single local run. Parse only supported trace details and mark the rest unparsed. Missing measurement capability means a reported gap or explicitly scoped quick pass, not invented metrics.

Do not install a CLI/server, launch against a sensitive production session, or send private URLs/artifacts to an external provider without authorization. `npx` can fetch and execute packages; it is not a no-install safety boundary.

## Report

Apply the bundled auditor perspective inline or through an actual supported worker. Pass the exact scope, artifacts, framework, mode and same-revision references. Return the complete sourced scorecard, ranked findings, concrete recommendations and positive observations where supported. Identify unmeasured fields and limitations. Proposed budgets follow approved project policy; never remove security/privacy controls to improve a score.

Audit is read-only unless remediation was requested. Performance changes subsequently follow measure → identify → fix one cause → verify improvement and correctness → guard the observed regression.

## MCP invocation and source

Request this mode in natural language, for example “run the webperf workflow.” Load the named skills from the current authorized catalog snapshot and read supporting files using resource URIs returned by `load_skill`; do not synthesize filesystem or MCP paths. This file does not register a native slash command. Missing required resources block their dependent actions.

Adapted from `.claude/commands/webperf.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/.claude/commands/webperf.md). MIT license is bundled with the router. The adaptation retains the lifecycle mode while making host tooling, evidence, data access and human approval boundaries explicit.
