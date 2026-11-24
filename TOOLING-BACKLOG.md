# Tooling backlog

The design principle of this repo: **move engineering out of markdown and into the
tools.** Every workaround a skill has to describe is a defect here. Each item below
should become a [tools-cli](https://github.com/TALXIS/tools-cli)
issue; when it ships, the corresponding skill prose gets deleted.

| # | Improvement | Replaces | Status |
|---|---|---|---|
| T2 | `txc workspace init` — one command: `.slnx` + NuGet.config + Packages.Main (+ optional segmented solutions) | Most of the `init-repo` skill body (CP02 + 03a) | proposed |
| T3 | `pp-entity-view` accepts a columns parameter and emits complete `layoutxml` + `fetchxml` | alm-lab's `Add-ViewColumns` post-patch (05d) | proposed |
| T4 | Component-create commands print created artifacts (incl. GUIDs) as JSON; accept `--param FormId` consistently | PowerShell GUID pre-generation choreography (05c/05d) | proposed |
| T5 | Fix `pp-plugin-test` template Cleanup post-action | `.template.temp` pre-create workaround (14) | proposed |
| T6 | `dotnet publish` emits `.pdpkg.zip` into `--output` | Hand-copy step in CI build workflows | proposed |
| T7 | `txc workspace validate` — composition/ordering/reference checks as build errors | Component-composition-chain prose (MCP internal skills) | proposed |
| T8 | `txc env logs --type plugin-trace\|flow-runs\|audit\|async --since --status --entity` | opskit Python log scripts + column-list prose | proposed |
| T9 | `txc` emits a machine-readable command schema; CI lints every `txc` invocation in skills against it | Silent command-drift between CLI releases and skills | proposed |
| T10 | Declarative bulk scaffold (`txc workspace apply <manifest>`) | Imperative scaffold sequences (forms alone are ~800 lines of calls in alm-lab) | proposed |
| T11 | Intent-oriented descriptions/tags in `txc component type list` (an agent searching "table", "form", "page" finds the type) | The intent→component-type mapping tables in skills | proposed |
| T12 | Multi-step sequences and worked examples surfaced by the CLI itself (help epilog or docs cross-links from group help) | The sequence sections and most `references/` recipes | proposed |
| T13 | Destructive/read-only/idempotent annotations visible in `--help` (they exist in code but reach only MCP) | Destructive-vs-safe prose in skills | proposed |
| T14 | `txc workspace explain` / `project explain` inspect the actual workspace instead of printing a hardcoded string; the static prose moves into the `init` skill | Static const-string knowledge living in CLI code | proposed |
| T15 | Fix tools-cli README discovery-command paths (`txc workspace component type list` does not exist; real: `txc component type list`, `txc workspace component parameter list`) | Agents copying broken commands from the README | proposed |
| T16 | `txc docs list` exposes the `tags` field already present in its index | Untagged, unfilterable docs listing | proposed |
| T24 | `txc docs get plugin-step-attributes`: the `[PluginStep]` / `[PluginStepImage]` surface (messages with built-in ids, settings, adopting an existing step), today only in the build package README | The attribute rules in `plugin-registration` | proposed |
| T25 | The solution build validates custom connector metadata without TXVAL002 / "root components are not defined in customizations: Type='ECConnector'" warnings | The harmless-warnings note in `custom-connectors` | proposed |
| T26 | A template that scaffolds a CMT data package from the tables in source (schema, records with generated GUIDs, `[Content_Types].xml`), found by `txc component type list --search seed`; `txc docs get data-migration` describes the file format | The `seed-data` reference | proposed |
| T27 | `dotnet build` of the package project refreshes the `.pdpkg.zip` (today only `dotnet publish` does, while the build log says "Zipping Cmt packages") | The publish-only note in `seed-data` | proposed |
| T28 | `pp-app-code` sets `environmentId` (from the selected profile) and a `localAppUrl` matching Vite; txc binds a deployed custom connector to a code app, resolving its environment-specific API name | The Local Play and `pa` binding sections of `code-apps` | proposed |
| T29 | `pp-entity` parameter for the primary name column's required level (tables whose name is filled by logic) | Hand-editing `RequiredLevel` and `RequiredForForm` in `Entity.xml` (one-prompt run) | proposed |
| T30 | `pp-entity-attribute` default value for Boolean and choice columns | Hand-editing `AppDefaultValue` / `DefaultValue` in `Entity.xml` and the option set (one-prompt run) | proposed |
| T31 | `pp-entity-attribute` Lookup takes cascade behaviour (delete, assign, ...) | Hand-editing `<CascadeDelete>` in `Other/Relationships/*.xml` (one-prompt run) | proposed |
| T32 | Generated main form lists the table's columns (or `pp-entity-attribute` can add the column to the main form) | Forms that show only the primary column until hand-patched (one-prompt run) | proposed |
| T33 | `pp-app-code-data` registers Dataverse data sources under the entity set name (`<prefix>_<plural>`) the generated services look up | Renaming data source keys in the code app config by hand (one-prompt run) | proposed |
| T34 | `txc environment create --wait` returns only when the environment accepts imports (async operations enabled), and `--region` defaults to the tenant's home region instead of `unitedstates` | Retry loops on the first `package import`; environments created in the wrong geo (one-prompt run) | proposed |
| T35 | `txc workspace component create` detects a build server holding `obj/` and says so (or shuts it down) instead of failing every scaffold | Agent diagnosing the lock and running `dotnet build-server shutdown` (one-prompt run) | proposed |
| T36 | `pp-security-role-privilege` scaffold doesn't time out and roll back on the first grant of a role | Agent retrying the rolled-back privilege grant (one-prompt runs, twice) | proposed |
| T37 | The solution build schema (TXVAL001) accepts FetchXML column comparison (`valueof`), which Dataverse supports | Setting `SkipSolutionValidation` on the whole UI solution to ship one view (one-prompt run) | proposed |
