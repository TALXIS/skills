# Tooling backlog

The design principle of this repo: **move engineering out of markdown and into the
tools.** Every workaround a skill has to describe is a defect here. Each item below
should become a [tools-cli](https://github.com/TALXIS/tools-cli)
issue; when it ships, the corresponding skill prose gets deleted.

| # | Improvement | Replaces | Status |
|---|---|---|---|
| T1 | `txc doctor` — machine-checkable prereq/auth/profile check with fix hints | Per-skill toolchain-check prose (CP01) | proposed |
| T2 | `txc workspace init` — one command: `.slnx` + NuGet.config + Packages.Main (+ optional segmented solutions) | Most of the `workspace` skill body (CP02 + 03a) | proposed |
| T3 | `pp-entity-view` accepts a columns parameter and emits complete `layoutxml` + `fetchxml` | alm-lab's `Add-ViewColumns` post-patch (05d) | proposed |
| T4 | Component-create commands print created artifacts (incl. GUIDs) as JSON; accept `--param FormId` consistently | PowerShell GUID pre-generation choreography (05c/05d) | proposed |
| T5 | Fix `pp-plugin-test` template Cleanup post-action | `.template.temp` pre-create workaround (14) | proposed |
| T6 | `dotnet publish` emits `.pdpkg.zip` into `--output` | Hand-copy step in CI build workflows | proposed |
| T7 | `txc workspace validate` — composition/ordering/reference checks as build errors | Component-composition-chain prose (MCP internal skills) | **partially shipped** — the command exists (structure + XSD); composition/ordering checks still missing |
| T8 | `txc env logs --type plugin-trace\|flow-runs\|audit\|async --since --status --entity` | opskit Python log scripts + column-list prose | proposed |
| T9 | `txc` emits a machine-readable command schema; CI lints every `txc` invocation in skills against it | Silent command-drift between CLI releases and skills | proposed |
| T10 | Declarative bulk scaffold (`txc workspace apply <manifest>`) | Imperative scaffold sequences (forms alone are ~800 lines of calls in alm-lab) | proposed |
| T11 | Intent-oriented descriptions/tags in `txc component type list` (an agent searching "table", "form", "page" finds the type) | The intent→component-type mapping tables in skills | proposed |
| T12 | Multi-step sequences and worked examples surfaced by the CLI itself (help epilog or docs cross-links from group help) | The sequence sections and most `references/` recipes | proposed |
| T13 | Destructive/read-only/idempotent annotations visible in `--help` (they exist in code but reach only MCP) | Destructive-vs-safe prose in skills | proposed |
| T14 | `txc workspace explain` / `project explain` inspect the actual workspace instead of printing a hardcoded string; the static prose moves into the `workspace` skill | Static const-string knowledge living in CLI code | proposed |
| T15 | Fix tools-cli README discovery-command paths (`txc workspace component type list` does not exist; real: `txc component type list`, `txc workspace component parameter list`) | Agents copying broken commands from the README | proposed |
| T16 | `txc docs list` exposes the `tags` field already present in its index | Untagged, unfilterable docs listing | proposed |
| T17 | `txc component type list` includes create-only templates and exposes `templateShortName`, with `--search` matching it | The intent→template tables in every skill. **Today it reaches 8 of 51 templates** — it lists 49 Dataverse *metadata* types, while `workspace component create` accepts 51 template short names. Forms, views, sitemap, roles, plugin projects, tests, PCF, script libraries, code apps, generative pages and the deployment package are all invisible to it, in every `--format`. The only enumeration is the `create --help` argument list. Sharpens T11, which assumes the set is complete and only the tags are missing | proposed |
| T18 | Suppress or gate the `ConfigurationResolver` Information line every invocation writes to stderr (a `--quiet` flag, or drop it for read-only commands) | Per-command noise agents must learn to filter | proposed |
| T20 | `workspace component create` reports an unknown `--param` the way it reports a missing required one — today a missing param returns a `{status:"failed"}` envelope on stdout (exit 1) while an *unknown* param writes only a stderr Error log and exits 2, so an agent reading stdout sees silence and can read it as success | The exit-code caveat in every scaffolding skill | proposed |
| T23 | `pp-security-role-privilege` parameter metadata is placeholder junk — `RoleName` defaults to `eqweqweqwe`, `PrivilegeTypeAndLevel` to `jsonarraystringwhithPrivilegeTypeandandLevel`, and its description shows `[{ PrivilegeType: ReadAccount, Level: Global }]` while `txc docs get security-roles` documents `[{ "type": "Read", "level": "Global" }]`. An agent told to trust `parameter list` as the authority gets the wrong shape | The "follow the doc, not the parameter description" caveat in the `security` skill | proposed |
| T21 | `txc ws test binding list [--format json]` — the `TALXIS.TestKit.Bindings` step catalog as a CLI surface, with each parameter named and typed rather than every slot rendered `{value}`. Today ([tools-cli#123](https://github.com/TALXIS/tools-cli/pull/123)) it exists only as the `guide_testing` MCP tool, so `design` must declare the whole MCP server to read one catalog | The `design` plugin's `mcp.json`, and the placeholder-disambiguation prose in `design:features` | proposed |
| T22 | The binding catalog reflects the **workspace's** resolved `TALXIS.TestKit.Bindings`, not the MCP server's pinned copy — or at minimum reports the version it read, so a consumer can warn on drift | Silent mismatch between advertised bindings and what the test project can actually bind | proposed |
| T19 | `config profile validate` honors the default its own help promises — `<name>` is documented as "Defaults to the global active profile" but marked `[required]`, and a bare call fails with "Required argument missing" | The explicit-name caveat in the `deploy` skill | proposed |
