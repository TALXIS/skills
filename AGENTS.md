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
3. Follow the skill authoring standard in [CONTRIBUTING.md](CONTRIBUTING.md):
   skills are named by universal developer intent (not platform jargon), steer the
   agent to `txc` discovery commands instead of duplicating parameters, contain zero
   toolchain prose, and push detail into `references/` files that carry a mandatory
   "Needed because / Remove when" header naming the txc fix in
   [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) that makes them deletable.
4. Directory name == plugin name == marketplace entry name, always.
5. `version` is bumped only in `plugin.json` (major: skill removed/renamed; minor:
   skill added; patch: fixes).
6. `agent/` is harness-behaviour config (session instructions + the session-start briefing),
   fetched by the AgentBox provisioner rather than installed as a plugin — it lives outside
   `plugins/`, is declared in `agent/instructions.json`, and follows the same host-agnostic,
   zero-toolchain-prose rules as skills. This repo says *how* an agent should work; which tools a
   box has, and installing or updating them, belongs to
   [TALXIS/tools-agentbox](https://github.com/TALXIS/tools-agentbox).
7. Source knowledge lives in [TALXIS/alm-lab](https://github.com/TALXIS/alm-lab)
   (`.lab-scripts/` checkpoints and scaffold scripts) — extract exact `txc` commands
   from there, never invent parameters.
