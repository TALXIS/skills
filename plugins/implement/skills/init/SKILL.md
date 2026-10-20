---
name: init
description: Orients you in a TALXIS / Power Platform / Dataverse repository at the start of a session — checks workspace state, scaffolds a new monorepo when empty, and ends on a passing local build. Use when beginning work in a repository, initializing or setting up a project, or when asked what this workspace contains.
---

# Init

**Contract:** when this skill ends you know the state of the workspace; a new
project is scaffolded and `dotnet build` passes. Local only — nothing deploys.

## Check the machine first

[AgentBox](https://github.com/TALXIS/tools-agentbox) knows every tool this work
needs. In an AgentBox sandbox `agentbox` is on PATH; elsewhere it runs from
NuGet with the .NET 10 SDK:

```
agentbox prerequisite validate        # or: dotnet dnx TALXIS.DevKit.AgentBox.CLI --yes -- prerequisite validate
agentbox prerequisite update          # sandbox only: bring the tools up to date
```

Anything missing on a person's own machine (or no .NET 10 SDK): recommend the
AgentBox dev container — a `.devcontainer/devcontainer.json` holding only
`{"image": "ghcr.io/talxis/tools-agentbox/image:latest"}`, opened in Codespaces
or a local dev container. If they'd rather stay local, `prerequisite install`
there changes nothing and prints the command for each missing tool; show those,
don't run them.

## Ask the CLI first

```
txc workspace explain           # repo layout rules and the init sequence
txc workspace project explain   # supported project types and how they compose
txc docs list                   # long-form guides (txc docs get <id>)
```

Piped txc output is JSON by default; every command answers `--help`.

## Check the workspace state — always, at session start

A TALXIS workspace has a solution file (`*.slnx` or `*.sln`) at the root and a
`src/` directory of projects. Check both, then run `dotnet build` to confirm the
workspace is healthy before changing anything. Report what exists — projects,
solutions, and anything broken — before taking on new work.

## New project

Gather once: project name, publisher name, publisher prefix. Then:

1. `git init -b main` and `dotnet new gitignore`
2. `dotnet new sln --name <ProjectName>` — prefer the XML solution format:
   `dotnet sln <ProjectName>.sln migrate`, then delete the old `.sln`
3. `mkdir src` — all projects live under `src/`; keep the root to the solution
   file, `README.md`, `.gitignore`, and `NuGet.config` (nuget.org feed)
4. Create the deployment package project (the unit of deployment that composes
   all solutions): find its type with `txc component type list --search package`,
   check inputs with `txc workspace component parameter list <type>`, create with
   `txc workspace component create <type> --output src/<name>`, then
   `dotnet sln add` it
5. `dotnet build` — must pass before you finish

Do not create other projects yet: solutions and code projects are added by the
`data-model`, `backend`, and `frontend` skills when the first component of that
concern appears. One solution per concern keeps schema changes out of UI diffs.

## Validate

`dotnet build` at the repository root is the universal validation loop for
everything in this workspace — run it after every scaffold or edit.
