---
name: machine-setup
description: Gets a machine ready for TALXIS / Power Platform / Dataverse development — which tools the work needs (.NET SDK, TALXIS CLI, Power Platform CLI, Azure CLI, Node.js and others), a ready-made dev container or Codespace that has them all, checking a local machine for what's missing or outdated, and bringing tools up to date. Use when a tool or command is missing or not found, when setting up a development environment or dev container, when joining an existing project on a new machine, or when tools may be out of date.
---

# Machine setup

**Contract:** when this skill ends the machine has every tool this work needs, or
the person knows exactly what's missing and the command that gets it. Never
install or update tools on a person's own machine yourself.

## Ask the CLI first

[AgentBox](https://github.com/TALXIS/tools-agentbox) owns the tool list, the
checks and the updates:

```
agentbox prerequisite list       # every tool this work uses
agentbox prerequisite validate   # what's present, missing or too old
agentbox prerequisite update     # dev container only: bring tools up to date in place
```

In an AgentBox dev container `agentbox` is on PATH. Anywhere else it runs from
NuGet with the .NET 10 SDK: `dotnet dnx TALXIS.DevKit.AgentBox.CLI --yes -- <command>`.

## Choose the environment

- **Dev container (recommended).** A `.devcontainer/devcontainer.json` holding only
  `{"image": "ghcr.io/talxis/tools-agentbox/image:latest"}` has every tool, sets up
  the coding agents with this plugin, and keeps the tools current on every start.
  Open it in GitHub Codespaces or as a local dev container. Commit the file so
  everyone who joins the project gets the same environment.
- **Own machine.** `prerequisite install` there changes nothing: it prints the
  command for each missing tool. Show those commands; the person runs them.

Recommend the dev container when the .NET 10 SDK or several tools are missing.

## Keeping tools current

A dev container updates its tools on every start. For a fix released
mid-session, run `agentbox prerequisite update` or restart the container.
