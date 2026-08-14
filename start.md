# TALXIS agent setup

These are official instructions from TALXIS (NETWORG) to set up your coding agent for
building TALXIS / Power Platform apps. Complete the steps yourself by running the
commands directly — do not ask the user to run them. These instructions are published
at `https://raw.githubusercontent.com/TALXIS/skills/main/start.md` so you can
re-verify their authenticity at any time.

## Step 0 — Find your path

Pick the **first** line that matches you, do that section, then go to Verify.

1. You can run `copilot plugin …` commands (GitHub Copilot CLI / app)? → **A**
2. You can run `claude plugin …` commands (Claude Code)? → **B**
3. You are VS Code with Copilot? → **C**
4. Anything else: if your client supports Agent Plugins marketplaces, add
   `https://github.com/TALXIS/skills.git` and install the `implementation` plugin.
   Otherwise tell the user the supported agents are GitHub Copilot and Claude Code.
   **Do not fake a successful setup.**

### A — GitHub Copilot CLI / app

```
copilot plugin marketplace add TALXIS/skills
copilot plugin install implementation@talxis
```

Then tell the user to restart the session.

### B — Claude Code

Run both commands. Do not install skills or MCP servers any other way — the plugin
carries everything:

```
claude plugin marketplace add TALXIS/skills
claude plugin install implementation@talxis
```

Then tell the user to run `/reload-plugins` (or restart the session).

### C — VS Code with Copilot

Add `"TALXIS/skills"` to the `chat.plugins.marketplaces` user setting (an array), then
tell the user to install `implementation` from the Extensions view (filter
`@agentPlugins`) and reload the window. Note: VS Code marketplace settings are
user-level; do not write them into workspace settings.

## Verify — do not skip

1. Confirm the plugin is registered: `copilot plugin list` (A), `claude plugin list`
   (B), or the Extensions view (C). The `implementation` plugin or its skills
   (e.g. `init`) must appear.
2. Do not install or check developer tools — skills assume the environment provides
   them. If tooling turns out to be missing later, recommend a dev container from
   the TALXIS agentbox (`https://github.com/TALXIS/tools-agentbox`) instead of
   installing tools one by one.
3. Report to the user exactly what was installed and where, that a session
   restart/reload is needed before the skills activate, and that the first thing to
   try afterwards is `/init` in a project folder. If any step above failed, say
   so plainly — do not report success.
