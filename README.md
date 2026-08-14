# TALXIS skills

Build TALXIS / Power Platform apps with your coding agent — scaffolded, built, and
validated **locally in a monorepo**, deployed only when you ask.

This repository is the TALXIS plugin marketplace for coding agents. Plugins follow the
[Agent Plugins](https://agent-plugins.org/) open standard (skills + MCP servers) and
additionally ship Claude Code manifests, so one install works across
Claude Code, GitHub Copilot (CLI, VS Code, cloud agent), Cursor, Codex, and any client
that reads `SKILL.md` skills.

> One-link setup: paste this to your agent —
> `Fetch and follow https://raw.githubusercontent.com/TALXIS/skills/main/start.md to set me up for building TALXIS apps.`

## Prerequisites

Develop in a dev container from the
**[TALXIS agentbox](https://github.com/TALXIS/tools-agentbox)** — start from its
[power-platform template](https://github.com/TALXIS/tools-agentbox/tree/master/src/templates/power-platform),
or compose a slimmer one from the dev container features published there. The
agentbox repository is the single source of truth for the toolchain.

Working without a dev container is fine too — `/init-repo` checks your toolchain
and tells you exactly what's missing.

For a complete example setup and a hands-on demo of the whole workflow — dev
container, monorepo, data model, UI, tests, CI/CD — see
**[TALXIS/alm-lab](https://github.com/TALXIS/alm-lab)**.

## Install

Works identically in **Claude Code** and **GitHub Copilot CLI**:

```
/plugin marketplace add TALXIS/skills
/plugin install implementation@talxis
```

Installing the plugin registers the skills **and** the `txc` MCP server in one step.
You only install once; the plugin is then available in every project folder.

<details>
<summary>Other agents (VS Code, Cursor, Codex, …)</summary>

- **VS Code**: add `"TALXIS/skills"` to the `chat.plugins.marketplaces` setting, then
  install `implementation` from the Extensions view (`@agentPlugins`).
- **Cursor / Codex / Kiro**: point your client's plugin marketplace at
  `https://github.com/TALXIS/skills.git` — plugins carry a standard Agent Plugins 1.0
  manifest.
- **Anything that supports skills**: `npx -y skills add TALXIS/skills`, then register
  the MCP server per [start.md](start.md).

</details>

## Try it

Open your agent in an empty folder (or an existing TALXIS repository) and run:

```
/init-repo
```

The skill checks your toolchain, scaffolds the monorepo (`.slnx` solution, NuGet feed,
Package Deployer project), and ends on a passing `dotnet build`.
**Nothing deploys to the cloud.**

## Verify the install

Ask your agent: *"Initialize a TALXIS repository here."* You should see it check
`txc --version` and finish with a green `dotnet build`. In Claude Code,
`claude plugin list` shows `implementation@talxis` and `claude mcp list` shows the
`txc` server.

## Plugins

| Plugin | Status | Scope |
|---|---|---|
| [`implementation`](plugins/implementation/) | **available** | Scaffold, build, validate, deploy — extracted from [TALXIS/alm-lab](https://github.com/TALXIS/alm-lab) |
| [`data`](plugins/data/) | planned | Data migration, querying, reports, integration |
| [`support`](plugins/support/) | planned | Troubleshooting, RCA, environment logs (supersedes tools-opskit-cli) |
| [`design`](plugins/design/) | planned | Prototypes, BDD authoring, backlog, specs |

## Why this exists

Coding agents building TALXIS apps should decide as little as possible: the
engineering lives in the [TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli) and
DevKit templates, skills are thin deterministic routers, and every change is validated
locally by `dotnet build` before anything reaches an environment. See
[TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) for the workarounds we are actively moving
out of markdown and into the tools, and [CONTRIBUTING.md](CONTRIBUTING.md) for the
authoring standard (enforced by CI on every PR).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Plugin installed but skills don't trigger | Restart the agent session (`/reload-plugins` in Claude Code) |
| Toolchain problems (missing or stale CLIs) | Run `/init-repo` — it checks and repairs the toolchain, or use an [agentbox](https://github.com/TALXIS/tools-agentbox) dev container |

## Uninstall

```
/plugin uninstall implementation@talxis
```
