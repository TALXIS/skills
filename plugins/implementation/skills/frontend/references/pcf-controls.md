> **Needed because:** the attach + client-library wiring sequence is not surfaced by txc help.
> **Remove when:** txc surfaces sequences in help/docs (T12).

# Attach a packaged PCF control

**Contract:** when this skill ends, the control overlay is written into the form's
FormXml under `src/Solutions.UI` and `dotnet build` passes. Nothing is deployed —
local only. Cloud only enters at deploy time (see the deployment-order rule at the end).

`txc workspace control attach` is manifest-driven: the CLI pulls the control's Package
Deployer package from nuget.org (latest version, nothing downloaded by hand), reads the
parameter schema straight from the control's own `ControlManifest.xml`, validates the
values you pass, and writes a `controlDescriptions` overlay into the form — one
`customControl` block per form factor. Unspecified parameters keep the manifest defaults.
No per-control template is needed.

## Step 1 — Gather inputs (once)

1. **Entity logical name** — e.g. `<prefix>_<entity>`
2. **Form** — recover the form GUID from the FormXml file name (form GUIDs are not
   persisted elsewhere): the file at
   `src/Solutions.UI/Entities/<prefix>_<entity>/FormXml/main/{<guid>}.xml`,
   base name with braces trimmed.
3. **Target control** — the control id on the form to overlay, e.g. `subgrid`
   (a subgrid created by `pp-form-subgrid` keeps its binding — view and
   `RelationshipName` are copied into the attached control, nothing patched by hand).
4. **Package** — the control's NuGet package id, e.g. `TALXIS.Controls.Grid.Package`.
5. **Parameters** — from the control's manifest. For the TALXIS Grid the common ones
   are `Columns` (JSON), `EnableGrouping`, `EnableAggregation`, `EnableOptionSetColors`,
   and the Client API pair (Step 2).

## Step 2 — Client API bridge (only if runtime customization is needed)

To customize the control from your own script (interceptors, cell styling, column
renames), the PCF calls a function in a web resource once its dataset exists. Two
pieces make that work.

**Typings in the scripts project** — typings only (`import type`); the runtime objects
come from the PCF at call time, so nothing from these packages ends up in the bundle:

```
cd src/Scripts.UI
npm pkg set "devDependencies.@talxis/client-libraries=^1.2606.5" "devDependencies.@types/powerapps-component-framework=^1.3.15" "devDependencies.@microsoft/microsoft-graph-types=^2.40.0"
npm install --no-audit --no-fund
```

**onLoad handler on the form** — the template's post-scripts add the library to
`<formLibraries>`, which is required: the form must load the web resource before the
PCF can call into it:

```
txc workspace component create pp-form-event-handler --output "src/Solutions.UI" --param "FormType=main" --param "FormId=<form-guid>" --param "EntityLogicalName=<prefix>_<entity>" --param "LibraryName=<prefix>_main" --param "FunctionName=<Namespace>.<Form>.onLoad" --param "EventType=onload"
```

Export the Client API entry point (e.g. `GridApi.onDatasetControlInitialized`) from the
scripts project's `src/index.ts` so it lands in the bundled web resource.

## Step 3 — Attach

Example: TALXIS Grid on a subgrid, grouped by one column, summing another, with a
hidden column feeding a script rule:

```
txc workspace control attach --output "src/Solutions.UI" --entity "<prefix>_<entity>" --form-id <form-guid> --target-control "subgrid" --package TALXIS.Controls.Grid.Package --param "Columns=<columns-json>" --param "EnableGrouping=true" --param "EnableAggregation=true" --param "EnableOptionSetColors=true" --param "ClientApiWebresourceName=<prefix>_main.js" --param "ClientApiFunctionName=<Namespace>.GridApi.onDatasetControlInitialized" --force
```

`<columns-json>` shape (pass as one line, quoted for your shell):

```json
[
  { "name": "<prefix>_groupcolumn", "grouping": { "isGrouped": true } },
  { "name": "<prefix>_numbercolumn", "aggregation": { "aggregationFunction": "sum" } },
  { "name": "<prefix>_hiddencolumn", "isHidden": true }
]
```

Every column named in `Columns` (and any column a script rule reads) must exist in the
subgrid's view — add missing `<cell>`/`<attribute>` entries to the SavedQuery XML first.
Omit the two `ClientApi*` params when Step 2 was skipped.

## Step 4 — Validate

```
dotnet build
```

## Step 5 — Deployment order (do not skip in the summary)

The patched form now references the control, so at deploy time the control's package
(e.g. `TALXIS.Controls.Grid.Package`) must be imported into the environment **before**
the app's own package — importing by name, no version pinned. Record this dependency
now; the `deploy` skill honors it when the time comes. Nothing was deployed here.
