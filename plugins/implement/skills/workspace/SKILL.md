---
name: workspace
description: Orients you in a TALXIS / Power Platform / Dataverse repository — checks workspace state, scaffolds a new monorepo when empty, and ends on a passing local build. Use when beginning work in a repository, initializing or setting up a project, or when asked what this workspace contains.
---

# Workspace

**Contract:** when this skill ends you know the state of the workspace; a new
project is scaffolded and `dotnet build` passes. Local only — nothing deploys.
If `txc` is unavailable, recommend an
[agentbox](https://github.com/TALXIS/tools-agentbox) dev container instead of
installing tools.

## Ask the CLI first

```
txc workspace explain                          # repo layout rules and the init sequence
txc workspace project explain                  # supported project types and how they compose
txc workspace component create --help          # the authoritative list of every scaffoldable template
txc docs list                                  # long-form guides (txc docs get <id>)
```

`txc` writes its JSON payload to **stdout** and log lines to **stderr** — read
stdout, or pass `2>/dev/null` when parsing. **Trust the exit code** — an unknown
`--param` fails with *empty stdout* and exit 2 (T20).

## Check the workspace state — always, at session start

A TALXIS workspace has a solution file (`*.slnx` or `*.sln`) at the root and a
`src/` directory of projects. Check both, then run `txc workspace validate` and
`dotnet build` to confirm the workspace is healthy before changing anything.
Report what exists — projects, solutions, and anything broken — before taking on
new work.

## New project

Gather once: project name, publisher name, publisher prefix. Then:

1. `git init -b main` and `dotnet new gitignore`
2. `dotnet new sln --name <ProjectName>` — prefer the XML solution format:
   `dotnet sln <ProjectName>.sln migrate`, then delete the old `.sln`
3. `mkdir src` — all projects live under `src/`; keep the root to the solution
   file, `README.md`, `.gitignore`, and `NuGet.config` (nuget.org feed)
4. Create the deployment package project (the unit of deployment that composes
   all solutions): `txc component type explain pp-package` for what it is,
   `txc workspace component parameter list pp-package` for its inputs, then
   `txc workspace component create pp-package --output src/<name>`, then
   `dotnet sln add` it
5. `dotnet build` — must pass before you finish

Do not create other projects yet: solution projects (`pp-solution`) and code
projects are added by the `data-model`, `backend`, and `frontend` skills when the
first component of that concern appears. One solution per concern keeps schema
changes out of UI diffs.

## Validate

`txc workspace validate` (structure and XSD) followed by `dotnet build` at the
repository root is the universal validation loop for everything in this
workspace — run both after every scaffold or edit.

To go from a one-line intent to a whole working app, use the `builder` skill,
which drives this one and the concern skills in order.
