> **Needed because:** the offline data-source generation sequence is not surfaced by
> txc help, and the `pp-app-code` project template is invisible to `txc component
> type list` (it's a `dotnet new` template, not a component-type enum entry).
> **Remove when:** txc surfaces sequences in help/docs (T12), and exposes its own
> project-level templates through a discovery command (T17).

# Create a code app

**Contract:** when this skill ends, the code app project exists under `src/`, its
data sources are generated from local metadata, and `dotnet build` passes at the
repository root. Nothing is deployed and no cloud environment is touched — local only.

A code app is a fully custom SPA hosted by Power Apps — Vite, React, TypeScript —
instead of a metadata-driven UI. Reach for it for narrow, fast, task-focused screens;
keep general-purpose CRUD in the model-driven app.

## Step 1 — Gather inputs (once)

1. **Project name** — PascalCase folder, e.g. `Apps.<Name>`
2. **DisplayName** — human-readable, e.g. `<Display Name>`
3. **AppName** — lowercase schema name, e.g. `<appname>`. Pin it explicitly so the
   CanvasApp schema name (`<prefix>_<appname>`) doesn't depend on the folder name.
4. **Tables** — logical names of every table the app reads or writes, e.g.
   `<prefix>_<entity>`. Each must already exist in `src/Solutions.DataModel`.

## Step 2 — Scaffold and wire into the build

`pp-app-code` is a `dotnet new` project scaffold — `txc component type list
--search code` returns nothing; `dotnet new list | grep -i "power platform: code
app"` finds it. From the repository root:

```
txc workspace component create pp-app-code --output "src/Apps.<Name>" --param "DisplayName=<Display Name>" --param "AppName=<appname>"
dotnet sln add src/Apps.<Name>
dotnet add "src/Solutions.UI/Solutions.UI.csproj" reference "src/Apps.<Name>/Apps.<Name>.csproj"
```

A plain `ProjectReference` is all the wiring: the TALXIS build discovers any
`ProjectType=CodeApp` reference regardless of which solution carries it — no dedicated
solution project. During the solution build it runs `npm install` / `npm run build`,
registers the app as a CanvasApp root component, and packs `dist/` into the solution.

The template scaffolds a working starter: router, layout, a demo home page, providers.
Replace the demo pages with the real screens once data sources exist.

## Step 3 — Data sources from local metadata (the differentiator)

A code app talks to Dataverse through declared data sources, and `txc` generates them
**offline** from the table metadata already sitting in `src/Solutions.DataModel` — no
live environment, no auth, no cloud connection. One invocation per table:

```
txc workspace component create pp-app-code-data --output "src/Apps.<Name>" --param "EntityLogicalName=<prefix>_<entity>" --param "ModelSolutionPath=../Solutions.DataModel"
```

`ModelSolutionPath` is resolved relative to `--output` (the template runs its
post-actions there). Each run produces:

- typed models and services under `src/Apps.<Name>/src/generated`
- schema files under `src/Apps.<Name>/.power`
- the data source registration in `power.config.json`, which the solution build packs
  with the app

Generated identifiers title-case the first character of the publisher prefix
(e.g. `<Prefix>_<entity>sService`) — match that casing in imports.

## Step 4 — Local dev loop

```
cd src/Apps.<Name>
npm run dev
```

Vite serves the app locally for iterating on pages against the typed services.

## Step 5 — Validate

```
dotnet build
```

The solution build must pass — it exercises the npm install/build and the CanvasApp
packing end to end.

## Step 6 — Summary

Report: the project path, the CanvasApp schema name `<prefix>_<appname>`, the tables
with generated data sources, that `dotnet build` passed, and that nothing was deployed.
