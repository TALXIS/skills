# support

Operations and troubleshooting skills for TALXIS / Power Platform projects.
Supersedes [TALXIS/tools-opskit-cli](https://github.com/TALXIS/tools-opskit-cli),
reimplemented on the [TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli)
instead of bundled Python. Installing this plugin also registers the `txc` MCP
server.

| Skill | Use when… |
|---|---|
| `troubleshoot` | investigating a support ticket, incident, or unexplained behavior — evidence-first and read-only: ticket → identifiers → targeted queries → `findings.md`, with gated `rca.md` / `action-plan.md` |

Planned:

- **environment-logs** — Dataverse log sources (`flowrun`, `plugintracelog`, `audit`,
  `asyncoperation`) as canned `txc env data query` recipes.
- **troubleshooting-patterns** — symptom → first diagnostic tool routing.

Each skill's `references/` holds detailed recipes that exist only because of a
current `txc` gap — every file names the fix that deletes it
(see [TOOLING-BACKLOG.md](../../TOOLING-BACKLOG.md)).

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install support@talxis
```
