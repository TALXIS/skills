---
name: model-app
description: Creates the Solutions.UI solution with a model-driven app (pp-app-model), adds tables to it (pp-app-model-component), and builds sitemap navigation (pp-sitemap-area, pp-sitemap-group, pp-sitemap-subarea) via txc, validating with dotnet build. Use when creating a model-driven app, adding entities to an app, or editing app navigation, sitemap, areas, groups, or subareas in a TALXIS project.
---

# Implement a model-driven app

**Contract:** when this skill ends, `src/Solutions.UI` contains the app, its entity
components, and sitemap navigation, is referenced by `Packages.Main`, and
`dotnet build` passes at the repository root. Local only — no cloud environment is
touched.

`Solutions.UI` does not own tables: it references them (`Behavior=Existing`) from
`Solutions.DataModel` and only layers UI on top. A reference carries just enough
metadata to attach UI components without duplicating schema, keeping DataModel the
single owner of every table definition. Tables must already exist (see the
`data-model` skill).

## Step 1 — Gather inputs (once)

`<PublisherName>`, `<PublisherPrefix>` from the workspace (`txc workspace explain` if
unsure). App logical name (lowercase, no prefix). Which entities the app shows, and
the navigation layout: areas → groups → subareas (one subarea per entity).

## Step 2 — Create the solution (first time only)

Skip if `src/Solutions.UI/Solutions.UI.csproj` exists. From the root:

```
txc workspace component create pp-solution --output "src/Solutions.UI" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "src/Packages.Main/Packages.Main.csproj" reference "src/Solutions.UI/Solutions.UI.csproj"
dotnet sln add src/Solutions.UI/Solutions.UI.csproj
```

## Step 3 — Reference the entities

One command per entity the app uses — a reference, not a table:

```
txc workspace component create pp-entity --output "src/Solutions.UI" --param "Behavior=Existing" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<entity>" --param "DisplayName=<Display Name>"
```

## Step 4 — Create the app

```
txc workspace component create pp-app-model --output "src/Solutions.UI" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<app>"
```

The app's full name is `<PublisherPrefix>_<app>` — every later command uses it as
`AppName`.

## Step 5 — Add entities to the app

One command per entity:

```
txc workspace component create pp-app-model-component --output "src/Solutions.UI" --param "EntityLogicalName=<PublisherPrefix>_<entity>" --param "AppName=<PublisherPrefix>_<app>"
```

## Step 6 — Build the sitemap

Area first, then its groups, then subareas — each references its parent by title:

```
txc workspace component create pp-sitemap-area --output "src/Solutions.UI" --param "AreaTitle=<Area>" --param "AppName=<PublisherPrefix>_<app>"
txc workspace component create pp-sitemap-group --output "src/Solutions.UI" --param "GroupTitle=<Group>" --param "GroupDisplayName=<Group>" --param "AreaTitle=<Area>" --param "AppName=<PublisherPrefix>_<app>"
txc workspace component create pp-sitemap-subarea --output "src/Solutions.UI" --param "Title=<Subarea Title>" --param "EntityLogicalName=<PublisherPrefix>_<entity>" --param "GroupTitle=<Group>" --param "AreaTitle=<Area>" --param "AppName=<PublisherPrefix>_<app>"
```

Repeat `pp-sitemap-subarea` per entity in the group.

## Step 7 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 8 — Summary

Report the app name, referenced entities, and the sitemap tree, that `Packages.Main`
references the solution, that `dotnet build` passed, and that nothing was deployed.
Suggest the next steps, one line each: forms and views for each entity (`forms`
skill), then deploy the package (`deploy` skill).
