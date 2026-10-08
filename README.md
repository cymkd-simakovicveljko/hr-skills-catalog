# hr-skills-catalog

Skill content served by [hr-skills](https://github.com/cymkd-simakovicveljko/hr-skills). This repository owns the `SKILL.md` files and supporting resources; the server repository owns authentication, authorization, publishing, and MCP delivery.

## Catalog layout

- `engineering/` — engineering skills.
- `engineering/architecture/ousterhout-principle-structure/SKILL.md` — module structure and information-hiding guidance.

## Publishing changes

Deploy a reviewed checkout and run `hr-skills publish` with a server configuration that maps the `engineering` catalog to this repository's `engineering/` directory. Publishing updates the versioned catalog without rebuilding or restarting the server.

Pushing to this repository does not automatically update the hosted MCP service; no deployment pipeline is configured yet. See the [server README](https://github.com/cymkd-simakovicveljko/hr-skills#readme) for publishing and client setup instructions.

Only include content intended for distribution. The publisher includes every file beneath a skill directory, including hidden files except `.git`; keep credentials and private working files outside those directories.
