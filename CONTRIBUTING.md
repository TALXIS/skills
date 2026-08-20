# Contributing

## The two rules

1. **Skills are organized by universal developer intent** (tables, backend logic,
   screens, tests, deployment) — never by platform vocabulary. The consuming agent
   knows nothing about Power Platform and shouldn't need to.
2. **The CLI answers "how"; markdown never duplicates it.** Steer the agent to
   `txc component type list/explain`, `txc workspace component parameter list <type>`,
   and `txc docs get <id>`. If you're about to write prose working around a tool
   limitation, add the gap to [TOOLING-BACKLOG.md](TOOLING-BACKLOG.md) instead and
   keep the workaround in a reference file that names it.

## Skill standard (enforced by `scripts/validate.mjs` on every PR)

- Body skeleton: contract line → "ask the CLI first" → intent→type mapping →
  sequence → invariants → references. Target ≤ ~70 lines.
- No `--param` enumerations in SKILL.md — `parameter list` is the authority. A
  specific parameter may appear only when it encodes an invariant.
- Zero toolchain prose: no version checks, installs, or updates (that's `txc doctor`,
  T1). Machine-checked.
- Frontmatter: single-line `name:` (= directory name) and `description:` (≤ 1024
  chars, contains "Use when …", platform-agnostic vocabulary with Dataverse/Power
  Platform as trigger keywords only).
- Host-agnostic: no `~/.claude`-style paths, no tokens beyond
  `${PLUGIN_ROOT}` / `${PLUGIN_DATA}`.
- Body ≤ 5000 tokens; > 4000 requires `references/`.

## References standard (machine-checked)

Every `skills/*/references/*.md` starts with:

```
> **Needed because:** <the txc gap>
> **Remove when:** <TOOLING-BACKLOG item / tools-cli change>
```

When the named fix ships, delete the file and shrink the skill.

## Manifests

`plugin.json` (Agent Plugins 1.0) and `mcp.json` are the source of truth;
`.claude-plugin/plugin.json` and `.mcp.json` are generated — never edit them:

```
node scripts/generate-manifests.mjs && node scripts/validate.mjs
```

`version` lives only in `plugin.json`: skill removed/renamed → major, skill added →
minor, fixes → patch. Placeholder plugins (README-only) are not installable and not
listed in the marketplace.

## Local testing

- Claude Code: `claude --plugin-dir ./plugins/implement`
- Copilot CLI: `copilot plugin install <abs-path>/plugins/implement`
  (Copilot copies at install time — reinstall to pick up edits)
