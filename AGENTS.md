# Working on this repository

This is the TALXIS plugin marketplace for coding agents: `.claude-plugin/marketplace.json`
at the root, one plugin per directory under `plugins/`, each plugin holding
`skills/<name>/SKILL.md` skills plus dual manifests (Agent Plugins 1.0 + Claude Code).

Rules:

1. `plugin.json` and `mcp.json` are the source of truth. `.claude-plugin/plugin.json`
   and `.mcp.json` are **generated** — run `node scripts/generate-manifests.mjs` after
   editing a source manifest and commit the output.
2. Before committing, both must pass:
   `node scripts/generate-manifests.mjs --check && node scripts/validate.mjs`
3. Follow the skill authoring standard in [CONTRIBUTING.md](CONTRIBUTING.md) — thin,
   deterministic, host-agnostic skills routing to `txc` commands. When a skill needs
   prose to work around a tool gap, add the gap to [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md)
   instead of writing the prose.
4. Directory name == plugin name == marketplace entry name, always.
5. `version` is bumped only in `plugin.json` (major: skill removed/renamed; minor:
   skill added; patch: fixes).
6. Source knowledge lives in [TALXIS/alm-lab](https://github.com/TALXIS/alm-lab)
   (`.lab-scripts/` checkpoints and scaffold scripts) — extract exact `txc` commands
   from there, never invent parameters.
