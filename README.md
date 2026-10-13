# hr-skills-catalog

Skill content served by [hr-skills](https://github.com/cymkd-simakovicveljko/hr-skills). This repository owns the `SKILL.md` files and supporting resources; the server repository owns authentication, authorization, publishing, and MCP delivery.

## Catalog layout

- `engineering/` — engineering skills.
- `engineering/workflow/using-agent-skills/SKILL.md` — Addy Osmani's SDLC entry point, adapted to discover and load this catalog's procedures through MCP.
- `engineering/architecture/ousterhout-principle-structure/SKILL.md` — module structure and information-hiding guidance.
- `engineering/plan/grill-me/SKILL.md` — Matt Pocock's planning interview, with the underlying `grilling` instructions inlined for MCP use. Upstream revision and adaptation are recorded in its frontmatter; the MIT license is included alongside it.
- `engineering/review/blast-radius/SKILL.md` — pstack change-safety review with executable proof and host-supported independent reviewers.
- `engineering/verify/tdd/SKILL.md` — pstack's focused failing-before, passing-after bug-fix workflow.
- `engineering/verify/benchmark-checklist/SKILL.md` — pstack performance-claim verification, with its rationale bundled as an MCP-readable reference.
- `engineering/verify/debugging-and-error-recovery/SKILL.md` — reproduce failures, isolate root causes, and verify focused fixes.
- `engineering/review/security-and-hardening/SKILL.md` — evidence-based security review, with scoped hardening patterns bundled for MCP delivery.
- `engineering/ship/deprecation-and-migration/SKILL.md` — consumer migration, safe database cutover, recovery, and removal of obsolete paths.
- `engineering/ship/shipping-and-launch/SKILL.md` — release readiness, controlled rollout, monitoring, and authorized recovery.

The pstack imports preserve Lauren Tan's MIT license and pin the upstream revision in each skill's frontmatter. Adaptations are recorded there too. They support model invocation for their stated task triggers; the catalog does not install Cursor plugins, model routing, or the full `poteto-mode` workflow.

The five Addy Osmani imports are adaptations of [`agent-skills` at `1be8e34187e34647bb83adc3a1323b26ae6f6abe`](https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe). Each includes the upstream MIT license, source revision, and adaptation notes. The entry point routes to this catalog's nine procedures rather than assuming the full upstream pack is installed. The imports are self-contained for MCP delivery; they do not install the upstream plugin or authorize production actions. Repository-specific policies replace upstream blanket thresholds, and migration guidance distinguishes code rollback from data recovery.

## Agent entry experience

The shared path is **client bootstrap → `list_skills` → `using-agent-skills` → the relevant procedure**. The [server onboarding guide](https://github.com/cymkd-simakovicveljko/hr-skills#bootstrap-the-company-workflow) contains the bootstrap to add to each client's always-loaded instructions. Connecting MCP alone does not install or apply it.

The router and its nine procedures allow model invocation. Loading them is not permission to expand scope, change production, push, publish, or deploy. The router respects any future explicit-use restriction and retains revision-pinned skill URIs for each task. It loads procedures and supporting resources only when relevant; verification results and approvals still come from the real tools, CI, and people.

Keep routing policy in the router, project commands and constraints in the repository, and only discovery/loading in the client bootstrap. Do not copy the whole workflow into client configuration. A missing router or unavailable MCP service must be reported; agents may continue independent work under existing instructions, but must not claim the shared workflow ran or bypass a dependent safety gate.

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
