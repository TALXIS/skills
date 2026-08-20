# TALXIS skills

Build TALXIS / Power Platform apps with your coding agent — scaffolded, built, and
validated **locally in a monorepo**, deployed only when you ask.

This is the TALXIS plugin marketplace for coding agents, built for **GitHub Copilot**
(CLI, app, VS Code chat) and **Claude Code**. Plugins follow the
[Agent Plugins](https://agent-plugins.org/) open standard, so other compliant clients
work too.

## Prerequisites

Develop in a dev container from the
**[TALXIS agentbox](https://github.com/TALXIS/tools-agentbox)** — the single source
of truth for the toolchain. For a complete example setup and hands-on demo, see
**[TALXIS ALM lab](https://github.com/TALXIS/alm-lab)**.

## Install

Identical in **Claude Code** and **GitHub Copilot CLI**:

```
/plugin marketplace add TALXIS/skills
/plugin install implement@talxis
```

In **VS Code** (Copilot chat): add `"TALXIS/skills"` to the
`chat.plugins.marketplaces` setting and install `implement` from the Extensions
view (`@agentPlugins`). One install registers the skills **and** the `txc` MCP server,
available in every project folder.

## Try it

Open your agent in an empty folder (or an existing TALXIS repository) and run:

```
/init
```

It scaffolds the monorepo and ends on a passing local build.
**Nothing deploys to the cloud.**

## Plugins

| Plugin | Status | Scope |
|---|---|---|
| [`implement`](plugins/implement/) | **available** | Scaffold, build, validate, deploy — extracted from [TALXIS ALM lab](https://github.com/TALXIS/alm-lab) |
| [`data`](plugins/data/) | planned | Data migration, querying, reports, integration |
| [`support`](plugins/support/) | planned | Troubleshooting, RCA, environment logs (supersedes tools-opskit-cli) |
| [`design`](plugins/design/) | planned | Prototypes, BDD authoring, backlog, specs |

## Why this exists

Coding agents should decide as little as possible: the engineering lives in the
[TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli), skills are thin
deterministic routers, and every change is validated locally by `dotnet build` before
anything reaches an environment. See [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) and
[CONTRIBUTING.md](CONTRIBUTING.md).
