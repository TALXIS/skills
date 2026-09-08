# Tooling backlog

The design principle of this repo: **move engineering out of markdown and into the
tools.** Every workaround a skill has to describe is a defect here. Each item below
should become a [tools-cli](https://github.com/TALXIS/tools-cli)
issue; when it ships, the corresponding skill prose gets deleted.

| # | Improvement | Replaces | Status |
|---|---|---|---|
| T1 | `txc doctor` — machine-checkable prereq/auth/profile check with fix hints | Per-skill toolchain-check prose (CP01) | proposed |
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

## ubml

Same principle, different CLI: these are [ubml](https://github.com/TALXIS/ubml)
issues rather than tools-cli ones. The `consulting` plugin is the consumer.

| # | Improvement | Replaces | Status |
|---|---|---|---|
| U1 | `ubml add <type>` scaffolds a document `ubml validate` accepts (it did not, for all 13 types) | "validate straight after scaffolding, do not trust the template" prose in `extract-insights` - **deleted** | [ubml#46](https://github.com/TALXIS/ubml/pull/46) open |
| U2 | `ubml nextid` reads the workspace instead of a cache that survives a branch switch, and stops reporting `Highest:` from the same stale cache | "check what nextid hands you, grep the document for the last id" prose in `extract-insights` and `promote-to-model` - **deleted** | [ubml#46](https://github.com/TALXIS/ubml/pull/46) open |
| U3 | `derivedFrom` on `VS#####` and `CP#####`, so a strategy document carries machine-checked provenance like every other document type | "citations in strategy are prose the validator never checks" prose in `promote-to-model` - **deleted** | [ubml#46](https://github.com/TALXIS/ubml/pull/46) open |
| U4 | `supersedes` accepts a list, so one decision can formally close several open questions | "chain it, or make the second a `related` with a note" prose in `extract-insights` | proposed |
| U5 | `ubml walk` - which insight is next in source-date order, with its source text and position, and recording the answer | The ordering, presentation-format and per-source map sections of `validate-insights` - **deleted**, and asserted in the CLI's own tests instead | [ubml#46](https://github.com/TALXIS/ubml/pull/46) open |
| U6 | `ubml walk` sets an element's `reviewStatus`, not only an insight's `status`, and `walk next` shows the elements a claim proposes | The prose in `validate-insights` describing what to show and what to record for the element half of a bundle - **deleted** | [ubml#47](https://github.com/TALXIS/ubml/pull/47) open |
