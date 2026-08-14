# Contributing

## The one rule

**A skill is a router to deterministic `txc` commands, not a tutorial.** If you are
about to write prose telling the agent how to work around a tool limitation, stop:
file the limitation in [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) (and ideally as a
[tools-cli](https://github.com/TALXIS/tools-cli) issue), document the workaround in
one sentence, and link the backlog item so the prose can be deleted when the tool
catches up.

## Skill authoring standard

Enforced by `scripts/validate.mjs` on every PR (no path filter):

- `skills/<name>/SKILL.md` — exact filename; frontmatter `name` equals the directory
  name; `description` ≤ 1024 chars and contains a **"Use when …"** routing hint.
- Frontmatter: simple single-line `key: value` scalars only, ~200 tokens max.
- Body ≤ 5000 tokens; over 4000 requires a `references/` directory (progressive
  disclosure — thin SKILL.md, fat references, one level deep).
- Host-agnostic: no `~/.claude`-style paths, no `${…}` tokens beyond
  `${PLUGIN_ROOT}` / `${PLUGIN_DATA}`.

Not machine-checked (yet) but required in review:

- Every invariant states the command that verifies it; `dotnet build` is the
  universal validation loop.
- Local-first: no cloud calls unless the user asked or the skill's contract says so
  in its first lines.
- No step numbers referenced across files or skills — they drift.
- No portal click-paths as the happy path.
- Variants of one operation = one canonical skill + ≤20-line delegation wrappers,
  never near-duplicate skills.
- One approval per skill run: gather all inputs up front, don't re-prompt.

## Manifests

`plugin.json` (Agent Plugins 1.0) and `mcp.json` are the **source of truth**.
`.claude-plugin/plugin.json` and `.mcp.json` are generated — never edit them:

```
node scripts/generate-manifests.mjs
node scripts/validate.mjs
```

`version` lives only in `plugin.json`. Bump it in the PR that changes the plugin:
skill removed/renamed → major, skill added → minor, fixes → patch.

## Placeholder plugins

A plugin directory with only a README is a placeholder: not installable, not listed
in the marketplace. Add `plugin.json` + the first skill in the same PR that lists it.

## Local testing

- Claude Code: `claude --plugin-dir ./plugins/implementation`, then drive a skill.
- Copilot CLI: `copilot plugin install <abs-path>/plugins/implementation` (Copilot
  copies at install time — uninstall/reinstall to pick up edits; Claude Code re-reads
  on launch).
