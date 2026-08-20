---
name: test
description: Adds and runs tests in a TALXIS / Power Platform / Dataverse workspace — unit tests for server-side logic and client scripts, and BDD end-to-end UI tests. Use when writing tests, running tests, or asked whether the app still works.
---

# Test

**Contract:** tests run locally via `dotnet test`. UI tests may target a live
environment — say so before running them against one.

## Ask the CLI first

```
txc component type list --search test              # test project types
txc workspace component parameter list <type>      # every parameter, typed
```

## Intent → component type

| You want | Component type |
|---|---|
| unit tests for server-side logic (in-memory platform) | plugin test project |
| unit tests for client scripts (mocked runtime) | script test project |
| BDD end-to-end UI tests (Gherkin + browser) | UI test project + feature type |

## Sequence

1. Scaffold the test project under `src/`, add it to the solution file.
2. Write or generate the tests, then `dotnet build` and `dotnet test` at the
   project path — that is the whole loop.

## Invariants

- UI tests ship frozen step bindings for standard model-driven screens; fully
  custom apps need hand-written step definitions.
- BDD scenarios: Given sets context, When is one action, Then is an observable
  outcome — 3–5 steps. Selectors and waits live in step definitions, never in
  feature files; prefer test-id selectors; never hard-sleep.
- Unit test projects target modern .NET while the tested assembly stays net462 —
  the resulting NU1702 warning is expected.

Details: [references/unit.md](references/unit.md) ·
[references/ui.md](references/ui.md)
