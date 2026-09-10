---
name: backend
description: Implements server-side logic in a TALXIS / Power Platform / Dataverse workspace — validation, automation, event handlers, business rules that run in the backend when records change. Use when adding or changing server-side behavior, plugins, or APIs behind the data.
---

# Backend logic

**Contract:** code and its registration are scaffolded locally and
`dotnet build` passes. Local only — nothing deploys.

## Ask the CLI first

```
txc workspace component create --help              # every scaffoldable template, by short name
txc component type explain <template>              # what it is, when to use it, and its CHAIN
txc workspace component parameter list <template>  # every parameter, typed, with defaults
txc docs get plugin-development                    # long-form guide
```

`explain` names the exact ordered chain for the plugin templates — follow it
rather than inventing one.

`txc` prints JSON to stdout and logs to stderr. **Trust the exit code** — an
unknown `--param` fails with *empty stdout* and exit 2 (T20).

## Intent → template

| You want | Template |
|---|---|
| a C# project for server-side logic | `pp-plugin` |
| register the compiled logic in the platform | `pp-plugin-assembly` |
| run it on a specific event (create/update/…) | `pp-plugin-assembly-step` |
| a callable action/function on the Web API | `pp-api-endpoint` |
| a custom workflow activity | `pp-workflow-activity` |

## Sequence

1. Create the plugin project (`pp-plugin`) under `src/`, add it to the solution
   file, write the C# classes extending the generated `PluginBase`, `dotnet build`.
2. Registration lives in a logic solution project (conventionally
   `src/Solutions.Logic`), which takes a `ProjectReference` to the plugin project.
   That solution needs `pp-solution --param GeneratePluginAssembly=true`.
3. Register the assembly (`pp-plugin-assembly`) first, then its steps
   (`pp-plugin-assembly-step`) — **assembly before steps, always**, and one step
   per plugin class per message.
4. `txc workspace validate` and `dotnet build`.

## Invariants

- The plugin assembly targets **net462** (the platform sandbox is .NET
  Framework) — never "upgrade" the target framework.
- Reject invalid input in a **Pre-validation** step (cheapest, runs before the
  database transaction); make related writes atomic in a **Post-operation** step
  (inside the transaction).
- Code lives in the plugin project; *when and where it runs* is platform
  configuration and lives in the logic solution.

Details: [references/plugin-development.md](references/plugin-development.md) ·
[references/plugin-registration.md](references/plugin-registration.md)
