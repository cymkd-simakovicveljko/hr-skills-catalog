# hr-skills-catalog

Skill content served by [hr-skills](https://github.com/cymkd-simakovicveljko/hr-skills). This repository owns the `SKILL.md` files and supporting resources; the server repository owns authentication, authorization, publishing, and MCP delivery.

## Catalog layout

The catalog contains **all 25 Addy Osmani skills plus five supplements**. Skills live under `engineering/<area>/<name>/SKILL.md`; each directory owns its bundled resources.

| Area | Osmani skills |
| --- | --- |
| `workflow` | `using-agent-skills` |
| `define` | `interview-me`, `idea-refine`, `spec-driven-development`, `constraint-driven-development` |
| `plan` | `planning-and-task-breakdown` |
| `build` | `incremental-implementation`, `context-engineering`, `source-driven-development`, `doubt-driven-development`, `frontend-ui-engineering` |
| `architecture` | `api-and-interface-design` |
| `verify` | `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery` |
| `review` | `code-review-and-quality`, `code-simplification`, `performance-optimization`, `security-and-hardening` |
| `ship` | `git-workflow-and-versioning`, `ci-cd-and-automation`, `documentation-and-adrs`, `deprecation-and-migration`, `shipping-and-launch` |
| `operate` | `observability-and-instrumentation` |

The imports adapt [`agent-skills` at `1be8e34187e34647bb83adc3a1323b26ae6f6abe`](https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe). Every skill includes the upstream MIT license, source revision and adaptation notes. The workflow preserves its lifecycle procedures while replacing local-plugin assumptions with MCP loading, qualifying project-specific thresholds, and retaining human approval boundaries.

Five existing skills remain available: `architecture/ousterhout-principle-structure`, `review/blast-radius`, `verify/benchmark-checklist`, `plan/grill-me`, and `verify/tdd`. The first three are risk-specific supplements. **`grill-me` and `tdd` are explicit-use alternatives**, not competing automatic routes: default interviewing and test-first work use Osmani's `interview-me` and `test-driven-development`. Matt Pocock's and Lauren Tan's imports retain their own pinned provenance, adaptation notes and MIT licenses; this does not install pstack's full `poteto-mode`.

Ousterhout is required when the router's [conditional structural design rule](engineering/workflow/using-agent-skills/SKILL.md#conditional-structural-design) applies. Its assessment stays in the existing design artifact and approval flow; it is not a separate architecture phase.

### Complete lifecycle modes and resources

The router bundles nine modes under `references/commands/`: **spec, plan, build, test, review, code-simplify, constraints, ship, webperf**. Ask naturally: “run the plan workflow,” “run build auto,” “check constraints,” or “run a deep webperf audit.”

- `build` handles one approved task by default; `auto`/`all` executes the approved full plan with verification and stop conditions. Neither grants implicit commit or deployment permission.
- `constraints` retains definition, check, guard and ratchet modes. Thresholds and policy changes need the responsible owner's approval.
- `ship` combines code, security and test review, then produces readiness and recovery decisions. Independent parallel review uses actual supported host workers; missing independence is disclosed and required gates stay blocked.
- `webperf` distinguishes source-only potential impact from measured lab, field and trace evidence.

The router also bundles all seven shared references (definition of done, testing, accessibility, performance, security, observability, orchestration) and four reviewer perspectives (code reviewer, security auditor, test engineer, web performance auditor). Leaf-specific idea-refinement, floor-guard, optimization and hardening resources remain with their skills.

These are **MCP resources, not installed native slash commands or agent types**. The catalog does not install upstream plugins, hooks, caches, browser servers or global configuration. Supporting shell snippets are reference material: loading them does not execute them. Retrieve files through resource URIs returned by `load_skill`, not assumed local paths.

## Agent entry experience

The shared path is **client bootstrap → `list_skills` → `using-agent-skills` → the relevant procedure**. The [server onboarding guide](https://github.com/cymkd-simakovicveljko/hr-skills#bootstrap-the-company-workflow) contains the bootstrap to add to each client's always-loaded instructions. Connecting MCP alone does not install or apply it.

All 25 Osmani skills and three risk-specific supplements allow model invocation; the two alternatives require explicit selection. Loading a skill is not permission to expand scope, send private data to another model provider, change production, commit, push, publish or deploy. The router retains one catalog revision per task and loads procedures and resources only when relevant. Verification results and approvals still come from actual tools, CI and people—not from loading instructions.

Keep routing policy in the router, project commands and constraints in the repository, and only discovery/loading in the client bootstrap. Do not copy the whole workflow into client configuration. A missing router or unavailable MCP service must be reported; agents may continue independent work under existing instructions, but must not claim the shared workflow ran or bypass a dependent safety gate.

## Catalog checks

Run `node tests/floor-guard.test.mjs` with Node.js and Git installed. It exercises the embedded floor guard in a temporary repository: secret-safe diagnostics, policy-change detection, and numeric tightening/loosening. The check cleans up its fixture and lives outside the published skill bundles.

## Publishing changes

Push reviewed changes to `main`. The Lightsail server checks this branch approximately every 15 minutes, with an initial check one minute after boot, and runs `hr-skills publish` for each new commit it observes. No manual copy, server rebuild, restart, or client token change is required.

The publisher uses a repository-only, read-only GitHub deploy key. Failed fetches or invalid catalogs leave the last successfully published catalog available; the timer retries on its next run. Only the latest observed commit is published, so intermediate commits between checks may be skipped.

Publishing makes new content available through MCP. Agents still need to call `list_skills` and load the new revision; an already-loaded skill in a conversation does not update itself. Old revision-pinned URIs remain readable.

For an immediate update or troubleshooting, run on Lightsail:

```bash
sudo systemctl start hr-skills-publish.service
sudo systemctl status hr-skills-publish.timer
sudo journalctl -u hr-skills-publish.service -n 30 --no-pager
sudo cat /var/lib/hr-skills-catalog/published-commit
```

The final command prints the last successfully published Git commit. The [server repository](https://github.com/cymkd-simakovicveljko/hr-skills#readme) owns the publisher script, systemd units, and operational instructions.

Only include content intended for distribution. The publisher includes every file beneath a skill directory, including hidden files except `.git`; keep credentials and private working files outside those directories.
