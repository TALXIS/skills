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

Open your agent in an empty folder (or an existing TALXIS repository) and describe
what you want:

```
/implement:builder "track service visits and their technicians"
```

It asks who uses the app and what they need to do, proposes the tables, screens and
roles for your approval, then scaffolds the lot — ending on a passing local build.
**Nothing deploys to the cloud.**

To just orient in a repository or scaffold an empty one, run
`/implement:workspace`.

To settle the design first, run `/design:spec "<what needs building>"` — the data
model, where each behaviour runs, the user flows — or start from
`/design:personas "<the problem>"` when the system is new. Both work in an empty
folder or against an existing repository, write one file each and touch nothing
else; `/implement:builder` then builds from them instead of re-asking.

## Plugins

| Plugin | Status | Scope |
|---|---|---|
| [`implement`](plugins/implement/) | **available** | Scaffold, build, validate, deploy — extracted from [TALXIS ALM lab](https://github.com/TALXIS/alm-lab) |
| [`design`](plugins/design/) | **available** | Decide before building: personas, solution design, Gherkin features — read-only |
| [`data`](plugins/data/) | planned | Data migration, querying, reports, integration |
| [`support`](plugins/support/) | planned | Troubleshooting, RCA, environment logs (supersedes tools-opskit-cli) |

## Why this exists

Coding agents should decide as little as possible: the engineering lives in the
[TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli), skills are thin
deterministic routers, and every change is validated locally by `dotnet build` before
anything reaches an environment. See [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) and
[CONTRIBUTING.md](CONTRIBUTING.md).
