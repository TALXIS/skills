---
name: init
description: Orients you in a TALXIS / Power Platform / Dataverse repository at the start of a session — checks workspace state, scaffolds a new monorepo when empty, and ends on a passing local build. Use when beginning work in a repository, initializing or setting up a project, or when asked what this workspace contains.
---

# Init

**Contract:** when this skill ends you know the state of the workspace; a new
project is scaffolded and `dotnet build` passes. Local only — nothing deploys.
If `txc` is unavailable, recommend an
[agentbox](https://github.com/TALXIS/tools-agentbox) dev container instead of
installing tools.

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
   all solutions): it's a project scaffold, not a component type, so find it with
   `dotnet new list | grep -i "power platform"` instead of `component type list`
   (see [references/project-scaffolds.md](references/project-scaffolds.md)); check
   inputs with `txc workspace component parameter list <type>`, create with
   `txc workspace component create <type> --output src/<name>`, then
   `dotnet sln add` it
5. `dotnet build` — must pass before you finish

Do not create other projects yet: solutions and code projects are added by the
`data-model`, `backend`, and `frontend` skills when the first component of that
concern appears. One solution per concern keeps schema changes out of UI diffs.

## Validate

`dotnet build` at the repository root is the universal validation loop for
everything in this workspace — run it after every scaffold or edit.
