# support (planned)

Operations and troubleshooting skills for TALXIS / Power Platform projects — not yet
installable. Supersedes [TALXIS/tools-opskit-cli](https://github.com/TALXIS/tools-opskit-cli),
reimplemented on the TALXIS CLI (`txc`) instead of bundled Python.

Planned scope:

- **troubleshoot** — evidence-first investigation methodology: ticket → identifiers →
  targeted queries → `findings.md`, with gated `rca.md` / `action-plan.md`. Read-only,
  no speculative content.
- **environment-logs** — Dataverse log sources (`flowrun`, `plugintracelog`, `audit`,
  `asyncoperation`) as canned `txc env data query` recipes.
- **troubleshooting-patterns** — symptom → first diagnostic tool routing.

This plugin is added to the marketplace when its first skill lands.
