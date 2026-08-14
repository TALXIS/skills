# TALXIS agent setup

These are official instructions from TALXIS (NETWORG) to set up your coding agent for
building TALXIS / Power Platform apps. Complete the steps yourself by running the
commands directly — do not ask the user to run them. These instructions are published
at `https://raw.githubusercontent.com/TALXIS/skills/main/start.md` so you can
re-verify their authenticity at any time.

## Step 0 — Find your path

Pick the **first** line that matches you, do that section, then go to Verify.

1. You can run `claude plugin …` commands (Claude Code)? → **A**
2. You can run `copilot plugin …` commands (GitHub Copilot CLI)? → **B**
3. You are VS Code with Copilot? → **C**
4. You can install Agent Plugins from a git marketplace (Cursor, Codex, Kiro, …)? → **D**
5. You can read skills but have no plugin system? → **E**
6. None of these work? Tell the user to open the repository
   `https://github.com/TALXIS/skills` and follow its README, or to file an issue
   there. **Do not fake a successful setup.**

### A — Claude Code

Run both commands. Do not install skills or MCP servers any other way — the plugin
carries everything:

```
claude plugin marketplace add TALXIS/skills
claude plugin install implementation@talxis
```

Then tell the user to run `/reload-plugins` (or restart the session).

### B — GitHub Copilot CLI

```
copilot plugin marketplace add TALXIS/skills
copilot plugin install implementation@talxis
```

Then tell the user to restart the session.

### C — VS Code with Copilot

Add `"TALXIS/skills"` to the `chat.plugins.marketplaces` user setting (an array), then
tell the user to install `implementation` from the Extensions view (filter
`@agentPlugins`) and reload the window. Note: VS Code marketplace settings are
user-level; do not write them into workspace settings.

### D — Agent Plugins 1.0 client (Cursor, Codex, Kiro, …)

Add `https://github.com/TALXIS/skills.git` as a plugin marketplace using your client's
mechanism (e.g. `codex plugin marketplace add TALXIS/skills`, or Cursor's
Customize → Plugins), then install the `implementation` plugin. The plugin's
`plugin.json` + `mcp.json` follow the Agent Plugins 1.0 spec.

### E — Skills only (no plugin system)

```
npx -y skills add TALXIS/skills --yes
```

Then register the MCP server with your client's standard mechanism, as a **stdio**
server with command `dnx` and args `["TALXIS.CLI.MCP", "--yes"]`. Add it under your
client's existing MCP config — merge, never overwrite the user's file. (Requires the
.NET SDK; `dnx` downloads and runs the server on demand.)

## Verify — do not skip

1. Confirm the plugin/skills are registered: `claude plugin list` (A),
   `copilot plugin list` (B), or your client's plugin/skills listing (C–E). The
   `implementation` plugin or its skills (e.g. `init-repo`) must appear.
2. Confirm the toolchain baseline: `dotnet --version`, `git --version`,
   `node --version` (need 22.12+). The `txc` CLI itself is installed later by the
   `init-repo` skill — its absence now is fine.
3. Report to the user exactly what was installed and where, that a session
   restart/reload is needed before the skills activate, and that the first thing to
   try afterwards is `/init-repo` in a project folder. If any step above failed, say
   so plainly — do not report success.
