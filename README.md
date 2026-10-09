# hr-skills-catalog

Skill content served by [hr-skills](https://github.com/cymkd-simakovicveljko/hr-skills). This repository owns the `SKILL.md` files and supporting resources; the server repository owns authentication, authorization, publishing, and MCP delivery.

## Catalog layout

- `engineering/` — engineering skills.
- `engineering/architecture/ousterhout-principle-structure/SKILL.md` — module structure and information-hiding guidance.
- `engineering/plan/grill-me/SKILL.md` — Matt Pocock's planning interview, with the underlying `grilling` instructions inlined for MCP use. Upstream revision and adaptation are recorded in its frontmatter; the MIT license is included alongside it.

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
