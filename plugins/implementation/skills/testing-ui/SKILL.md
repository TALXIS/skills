---
name: testing-ui
description: Adds a Playwright + Reqnroll BDD UI test project to a TALXIS repository — scaffolds src/Tests.UI with frozen step bindings for model-driven app surfaces, adds feature files, installs browsers, and runs the suite headless locally or in CI. Use when asked to add UI tests, browser tests, end-to-end tests, BDD or Gherkin scenarios, Playwright automation, or automated regression testing for a TALXIS / Power Platform app.
---

# UI testing with Playwright + Reqnroll

**Contract:** when this skill ends, `src/Tests.UI` exists with at least one feature
file, `dotnet build src/Tests.UI/Tests.UI.csproj` passes, and Playwright browsers
are installed. Scaffolding and building are local; `dotnet test` runs against the
live environment configured in `appsettings.json`.

**What the template covers.** `pp-test-ui` ships frozen step bindings (under
`Support/Bindings/`) for model-driven app surfaces: forms, views, the command bar,
and navigation. They navigate via the model-driven URL shape
(`main.aspx?appname=...`), so they only work for model-driven apps. Custom apps
(code apps — standalone SPAs) need hand-authored step definitions; put those in
`StepDefinitions/` to signal "ours, not template-shipped".

## Step 1 — Scaffold the test project

From the repository root:

```
txc workspace component create pp-test-ui --output "src/Tests.UI"
dotnet sln add src/Tests.UI/Tests.UI.csproj
```

Remove the Calculator sample the template ships:

```
rm -f src/Tests.UI/Features/Calculator.feature src/Tests.UI/Features/Calculator.feature.cs
```

## Step 2 — Add a feature file

One per feature under test, PascalCase name:

```
txc workspace component create pp-test-ui-feature --param "name=<FeatureName>" --output "src/Tests.UI"
```

This scaffolds an empty `Feature: <FeatureName>` stub in `src/Tests.UI/Features/` —
write the real scenarios into it. Reqnroll generates the `.feature.cs` designer
file from it at build time; nothing else to create.

## Step 3 — Write scenarios (BDD discipline)

Scenarios speak business language so domain experts can read and challenge them:

- **Given** sets context, **When** is one action, **Then** is an observable outcome.
- 3–5 steps per scenario, total.
- Selectors and waits live in step definitions, never in feature files.
- Prefer `data-*` / test-id selectors over display text — display text breaks with
  localization.
- Never hard-sleep — wait for a specific element instead.

For model-driven surfaces, phrase steps to match the frozen bindings (open app,
open view, open record, fill field, press command, assert value). For code apps,
write the steps you need as C# classes in `src/Tests.UI/StepDefinitions/` following
the same rules.

## Step 4 — Configure

`src/Tests.UI/appsettings.json` holds the environment URL, app name, and Playwright
options. Every setting can be overridden per run via environment variables:
`TXC_ENVIRONMENT_URL`, `TXC_APP_NAME`, `TXC_HEADLESS`, `TXC_SLOWMO`, `TXC_TIMEOUT`,
`TXC_STORAGE_STATE_PATH`, `TXC_SCREENSHOT_ON_FAILURE`, `TXC_TRACING_ENABLED`.

`StorageStatePath` must be an **absolute** path — relative paths resolve from the
test binary output directory (`bin/Debug/<tfm>/`) and are silently ignored by
Playwright. Set `TXC_STORAGE_STATE_PATH` at run time for a portable override.

Headless runs need a captured auth state (on a machine with a display):

```
playwright-cli open --browser=msedge --headed <env-url>
playwright-cli state-save src/Tests.UI/auth-state.json
playwright-cli close
```

Never commit `auth-state.json` — it holds live session cookies; gitignore it.

## Step 5 — Build and install browsers

```
dotnet build src/Tests.UI/Tests.UI.csproj
pwsh src/Tests.UI/bin/Debug/<tfm>/playwright.ps1 install chromium
```

The build emits `playwright.ps1`; `<tfm>` is the target framework directory the
build created under `bin/Debug/` (e.g. `net8.0`). The build must pass before you
finish.

## Step 6 — Run

```
dotnet test src/Tests.UI/Tests.UI.csproj --configuration Release
```

Headless (CI, Codespaces): set `TXC_HEADLESS=true` in the environment.

## Step 7 — CI workflow (optional)

Live runs need the captured auth state, so keep the workflow manual
(`workflow_dispatch`) until state handling in CI is decided. `.github/workflows/test.yml`:

```yaml
name: test
on:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.x'
      - run: dotnet test src/Tests.UI/Tests.UI.csproj --configuration Release
        env:
          TXC_HEADLESS: 'true'
```

## Pyramid note

UI tests are the top of the test pyramid, not the whole pyramid: keep fast unit
layers underneath (FakeXrmEasy plugin tests, Jest script tests) as required PR
checks, and keep the UI suite thin — key user journeys, not field-by-field coverage.
