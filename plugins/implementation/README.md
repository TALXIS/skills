# implementation

Build TALXIS / Power Platform apps in a local-first monorepo. Skills route to
deterministic [TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli) commands;
`dotnet build` is the validation loop. Installing this plugin also registers the
`txc` MCP server (`dnx TALXIS.CLI.MCP --yes`).

## What's included

| Skill | Purpose |
|---|---|
| `init-repo` | Initialize a TALXIS monorepo (new or existing) and end on a passing local build |

## Roadmap

Extracted from [TALXIS/alm-lab](https://github.com/TALXIS/alm-lab), landing next:
`environment-setup`, `data-model`, `security-roles`, `plugin-development`,
`plugin-registration`, `model-app`, `forms`, `views-subgrids`, `form-scripts`,
`ribbon`, `pcf-controls`, `code-apps`, `generative-pages`, `build-and-validate`,
`deploy`, `solution-layering`, `ci-cd`, `testing-ui`, `testing-unit`.

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install implementation@talxis
```

Works identically in Claude Code and GitHub Copilot CLI. See the
[repository README](../../README.md) for other agents.
