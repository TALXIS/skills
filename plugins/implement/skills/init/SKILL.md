---
name: init
description: Orients you in a TALXIS / Power Platform / Dataverse repository — an existing project's layout and build, or scaffolding a new one. Use when starting work in a repository, new or existing, or when asked what it contains.
---

# Init

Local only — nothing deploys. Tool missing? Use `machine-setup`.

## Ask the CLI first

```
txc workspace explain           # layout rules and the init sequence
txc workspace project explain   # project types and how they compose
txc docs list                   # guides (txc docs get <id>)
```

Piped txc output is JSON; every command answers `--help`.

## Existing repository

The root holds `*.slnx` (or `*.sln`) and `src/` with the projects. Run
`dotnet build` before changing anything; report the projects, the solutions and
anything broken.

## New repository

Ask once: project name, publisher name, publisher prefix.

1. `git init -b main`, `dotnet new gitignore`
2. `dotnet new sln --name <Name>`, `dotnet sln <Name>.sln migrate`, delete the `.sln`
3. Root keeps only the solution, `README.md`, `.gitignore`, `NuGet.config`
   (nuget.org), and `.devcontainer/devcontainer.json` with
   `{"image": "ghcr.io/talxis/tools-agentbox/image:latest"}`; projects go in `src/`
4. Deployment package project: find its type with
   `txc component type list --search package`, its inputs with
   `txc workspace component parameter list <type>`, create it with
   `txc workspace component create <type> --output src/<name>`, `dotnet sln add` it
5. `dotnet build` passes

Other projects come later, from `data-model`, `backend` and `frontend`: one
solution per concern keeps schema changes out of UI diffs.

`dotnet build` at the root validates every change.
