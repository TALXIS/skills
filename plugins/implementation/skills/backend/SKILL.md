---
name: backend
description: Implements server-side logic in a TALXIS / Power Platform / Dataverse workspace — validation, automation, event handlers, business rules that run in the backend when records change. Use when adding or changing server-side behavior, plugins, or APIs behind the data.
---

# Backend logic

**Contract:** code and its registration are scaffolded locally and
`dotnet build` passes. Local only — nothing deploys.

## Ask the CLI first

```
txc component type list --search plugin            # code project + registration types
txc workspace component parameter list <type>      # every parameter, typed
txc docs get plugin-development                    # long-form guide
```

## Intent → component type

| You want | Component type |
|---|---|
| a C# project for server-side logic | search: `--search plugin` (project type) |
| register the compiled logic in the platform | plugin assembly type |
| run it on a specific event (create/update/…) | plugin step type |

## Sequence

1. Create the plugin project under `src/`, add it to the solution file, write the
   C# classes, `dotnet build`.
2. Registration lives in a logic solution project (conventionally
   `src/Solutions.Logic`), which takes a `ProjectReference` to the plugin project.
3. Register the assembly first, then its steps — **assembly before steps, always**.
4. `dotnet build`.

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
