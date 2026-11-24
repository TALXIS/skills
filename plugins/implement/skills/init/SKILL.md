---
name: init
description: Orients you in a TALXIS / Power Platform / Dataverse repository — the machine's tools (dev container, agent sandbox or local install, updates), an existing repository's layout and build, or scaffolding a new one. Use when starting work in a repository, new or existing, when a tool or command is missing, when setting up or updating the development tools on a machine, or when asked what a repository contains.
---

# Init

Local only — nothing deploys.

## Machine

[AgentBox](https://github.com/TALXIS/tools-agentbox) owns the tools:
`agentbox prerequisite validate|update`. Without `agentbox` on PATH:
`dotnet dnx TALXIS.DevKit.AgentBox.CLI --yes -- <args>`.

- **Short-lived agent sandbox** (cloud agent, CI): no nested containers;
  `curl -fsSL https://talxis.com/agentbox-setup | bash` installs everything.
- **Dev container or Codespace:** tools update on each start; mid-session,
  `agentbox prerequisite update`.
- **A person's own computer:** advise running agents and tools in a container,
  the dev container from step 3 below. To stay local, `agentbox prerequisite
  install` prints the install commands; show them, never run them.

## Working with the user

Build the app in a dialogue, not in one autonomous pass. At each **decision point**
(every skill marks its own), propose 2–3 options with their trade-offs, recommend one,
then stop and wait for the user's answer, even in an autonomous or auto-approve mode.
Between decision points, work without asking. Anything unforeseen is a decision point
too: when a template, the build or the CLI can't do what was agreed, or a fix would
change an agreed decision or turn off a check, stop, name the gap and ask instead of
working around it. For a new app, first interview the user: what the business does, who
the users are and what each of them does. Then cover the areas one at a time (data
model, business rules in `backend`, access in `security`, UI in `frontend`): agree one
area, build it, then move to the next area's decision point; never bundle all areas into
one approval. Skip an area only when the user says so. Work test-first: business rules get failing
unit tests before their code, agreed user flows get UI test scenarios before their
screens (`test` skill). Record each agreed decision in
`docs/design/<area>.md` before building it, and commit once the area is built and
`dotnet build` passes.

## Ask the CLI first

```
txc workspace explain           # layout rules and the init sequence
txc workspace project explain   # project types and how they compose
txc docs list                   # guides (txc docs get <id>)
```

Piped txc output is JSON; every command answers `--help`. Notes on usage errors, the
`Resolved target environment` log line and undoing a scaffold:
[workspace-layout](references/workspace-layout.md#working-with-txc-in-a-repository).

## Existing repository

Find the solution file (`*.slnx` or `*.sln`: the file listing the projects, not a
Dataverse solution) and resolve the projects by slot, not by folder name
([references/workspace-layout.md](references/workspace-layout.md), which also defines
the terms). Run `dotnet build` before changing anything; report the projects, the
Dataverse solutions and what each contains, and anything broken.

## Naming and layout precedence

The repository's existing convention wins (including how it splits components across
Dataverse solutions); otherwise an explicit instruction from the user (for example one
solution for everything); otherwise the default layout in
[references/workspace-layout.md](references/workspace-layout.md), which the other
skills refer to through slot placeholders (`<data-model solution>`,
`<plugin project>`, ...). Several slots may be the same project.

## New repository

**Decision point:** name (the repository and the solution file), publisher name,
publisher prefix. Propose values that fit the interview.

1. `git init -b main`, `dotnet new gitignore`
2. `dotnet new sln --name <Name>` — it writes `<Name>.slnx` on current SDKs; only if
   it wrote a `<Name>.sln` instead, `dotnet sln <Name>.sln migrate` and delete the `.sln`
3. Root keeps only the solution file, `README.md`, `.gitignore`, `NuGet.config`
   (nuget.org), `docs/design/`, and `.devcontainer/devcontainer.json` with
   `{"image": "ghcr.io/talxis/tools-agentbox/image:latest"}`; projects go in `src/`
   (the default layout)
4. Package project (builds the Package Deployer package): find its template in
   `txc workspace component create --help`, its inputs with
   `txc workspace component parameter list <template>`, create it with
   `txc workspace component create <template> --output <package project>`, `dotnet sln add` it
5. `dotnet build` passes

Other projects come later, from `data-model`, `backend` and `frontend`. The default
is one Dataverse solution per concern (data model, logic, UI, security), which keeps
schema changes out of UI diffs; if the user wants a different split, create those
instead.

`dotnet build` at the root validates every change.
