---
name: machine-setup
description: Prepares a machine for TALXIS / Power Platform / Dataverse development — required tools, dev container, agent sandbox or local install, tool updates. Use when a tool or command is missing, setting up a dev environment, joining a project on a new machine, or updating tools.
---

# Machine setup

[AgentBox](https://github.com/TALXIS/tools-agentbox) owns the tools:
`agentbox prerequisite validate|update`. Without `agentbox` on PATH:
`dotnet dnx TALXIS.DevKit.AgentBox.CLI --yes -- <args>`.

- **Short-lived agent sandbox** (cloud agent, CI): no nested containers;
  `curl -fsSL https://talxis.com/agentbox-setup | bash` installs everything.
- **Dev container or Codespace:** tools update on each start; mid-session,
  `agentbox prerequisite update`.
- **A person's own computer:** advise running agents and tools in a container:
  commit `.devcontainer/devcontainer.json` with
  `{"image": "ghcr.io/talxis/tools-agentbox/image:latest"}`. To stay local,
  `agentbox prerequisite install` prints the install commands; show them, never
  run them.
