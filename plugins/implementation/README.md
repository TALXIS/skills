# implementation

Build TALXIS / Power Platform apps in a local-first monorepo. Skills route to
deterministic [TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli) commands;
`dotnet build` is the validation loop. Installing this plugin also registers the
`txc` MCP server (`dnx TALXIS.CLI.MCP --yes`).

Everything is scaffolded, built, and validated locally. Only two skills touch the
cloud: `environment-setup` (creates/connects environments) and `deploy` (imports the
built package on request). `ci-cd` configures GitHub and Entra ID when asked.

## What's included

| Skill | Purpose |
|---|---|
| **Scaffold** | |
| `init-repo` | Initialize a TALXIS monorepo (new or existing) and end on a passing local build |
| `environment-setup` | Create/connect Dataverse environments; auth, connection, and profile config |
| **Model** | |
| `data-model` | Solutions, entities, columns, relationships — with the strict scaffolding order |
| `security-roles` | Security roles and privileges (Basic/Local/Deep/Global depth) |
| **Backend** | |
| `plugin-development` | C# plugin projects and classes; pipeline stage doctrine; net462 constraint |
| `plugin-registration` | Plugin assemblies and SDK message steps in Solutions.Logic |
| **UI** | |
| `model-app` | Model-driven app, app components, sitemap navigation |
| `forms` | Form XML chain (tab → column → section → row → cell → control), safe form edits |
| `views-subgrids` | Views (with the column post-patch), subgrids on forms |
| `form-scripts` | TypeScript web resources and form event handlers |
| `ribbon` | Command bar buttons and command parameters |
| `pcf-controls` | Attach packaged PCF controls with manifest-driven parameters |
| `code-apps` | Power Apps code apps with offline typed data sources from local metadata |
| `generative-pages` | Generative pages (React + Fluent UI) wired into the sitemap |
| **Ship** | |
| `build-and-validate` | The local validation loop, error codes, producing the `.pdpkg.zip` |
| `deploy` | Ordered package import, solution pull-back, failure recovery |
| `solution-layering` | Managed/unmanaged doctrine, component→solution routing, layer triage |
| `ci-cd` | GitHub Actions build + OIDC-federated deploy, branch rulesets |
| **Test** | |
| `testing-unit` | Plugin unit tests (FakeXrmEasy) and script tests (Jest) via `dotnet test` |
| `testing-ui` | BDD UI tests (Reqnroll + Playwright) with frozen step bindings |

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install implementation@talxis
```

Works identically in Claude Code and GitHub Copilot CLI. See the
[repository README](../../README.md) for other agents.
