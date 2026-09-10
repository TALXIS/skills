---
name: test
description: Adds and runs tests in a TALXIS / Power Platform / Dataverse workspace — unit tests for server-side logic and client scripts, and BDD end-to-end UI tests. Use when writing tests, running tests, or asked whether the app still works.
---

# Test

**Contract:** tests run locally via `dotnet test`. UI tests may target a live
environment — say so before running them against one.

## Ask the CLI first

```
txc workspace component create --help              # every scaffoldable template, by short name
txc component type explain <template>              # what it is, when to use it, and its CHAIN
txc workspace component parameter list <template>  # every parameter, typed, with defaults
```
`txc` prints JSON to stdout and logs to stderr. **Trust the exit code** — an
unknown `--param` fails with *empty stdout* and exit 2 (T20).

## Intent → template

| You want | Template |
|---|---|
| unit tests for server-side logic (in-memory platform) | `pp-plugin-test` — adds a FakeXrmEasy base class to a test project |
| unit tests for client scripts (mocked runtime) | `pp-test-script` — a Jest project with full `Xrm` mocks |
| BDD end-to-end UI tests (Gherkin + browser) | `pp-test-ui` (Reqnroll + Playwright) |
| a business scenario to test | an authored `features/*.feature`, else `pp-test-ui-feature` |
| a step the built-in bindings don't cover | `pp-test-ui-step` |

## Sequence

1. Scaffold the test project under `src/`, add it to the solution file.
2. **If `features/*.feature` exists, those are the scenarios** — `design:features`
   authored them against the agreed flows. Place them in the project as they are;
   don't regenerate them from scratch or replace them with `pp-test-ui-feature`
   stubs. Write only the step bindings they need.
3. Otherwise write the scenarios here, then the bindings.
4. `dotnet build` and `dotnet test` at the project path — that is the whole loop.

## Invariants

- UI tests ship frozen step bindings for standard model-driven screens
  (`TALXIS.TestKit.Bindings`) — write `pp-test-ui-step` bindings only for
  app-specific actions; fully custom apps need hand-written step definitions.
- BDD scenarios: Given sets context, When is one action, Then is an observable
  outcome — 3–5 steps. Selectors and waits live in step definitions, never in
  feature files; prefer `data-testid` selectors; never hard-sleep.
- Unit test projects target modern .NET while the tested assembly stays net462 —
  the resulting NU1702 warning is expected.

Details: [references/unit.md](references/unit.md) ·
[references/ui.md](references/ui.md)
