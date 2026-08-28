# Agent behaviour configuration

How an agent harness should behave in a TALXIS workspace — the instructions loaded into every
session, and the briefing injected at session start. This is the process/know-how half of the setup;
the environment half (which tools are installed, and installing or updating them) belongs to
[TALXIS/tools-agentbox](https://github.com/TALXIS/tools-agentbox).

`instructions.json` names the payload files, so this directory owns its own layout. It is fetched over
HTTPS by the AgentBox provisioner, which applies each file to whichever harness a box runs — the
instructions become managed memory or user-level custom instructions, and the briefing becomes a
session-start hook. Nothing here is a plugin component: `/plugin install` does not deliver it, and
`scripts/validate.mjs` checks it separately from `plugins/`.

Two things to keep in mind when editing:

- **It applies to every harness, on every box.** Keep it host-agnostic — no `~/.claude`-style paths,
  no assumptions about which CLI is running.
- **Keep toolchain prose out**, for the same reason [CONTRIBUTING.md](../CONTRIBUTING.md) keeps it out
  of skills: version checks, installs and updates are `txc doctor`'s job, and what a given box has
  installed is agentbox's business, not something to assert in a prompt.

Edits take effect on the next box that provisions, since the provisioner fetches from `master`.
