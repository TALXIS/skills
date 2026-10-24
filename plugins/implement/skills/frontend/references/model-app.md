> **Needed because:** the app/sitemap composition sequence is not surfaced by txc help.
> **Remove when:** txc surfaces sequences in help/docs (T12).

# Implement a model-driven app

**Contract:** when this skill ends, `<ui solution>` contains the app, its entity
components, and sitemap navigation, is referenced by `<package project>`, and
`dotnet build` passes at the repository root. Local only — no cloud environment is
touched.

The UI solution does not own tables: it references them (`Behavior=Existing`) from
`<data-model solution>` and only layers UI on top. A reference carries just enough
metadata to attach UI components without duplicating schema, keeping the data-model
solution the single owner of every table definition. Tables must already exist (see
the `data-model` skill). Project roles and their defaults (`<ui solution>`, ...):
[workspace-layout](../../init/references/workspace-layout.md); an existing repository's
naming wins.

## Step 1 — Gather inputs (once)

`<PublisherName>`, `<PublisherPrefix>` from the workspace (an existing solution
project's csproj has them). App logical name (lowercase, no prefix). Which entities the app shows, and
the navigation layout: areas → groups → subareas (one subarea per entity).

## Step 2 — Create the solution (first time only)

Skip if the workspace already has a UI solution. Create it like any solution project
(default `<ui solution>`) — `pp-solution`, a `ProjectReference` from
`<package project>`, `dotnet sln add` (the data-model reference shows the commands).

## Step 3 — Reference the entities, create the app, add the entities to it

In this order (`txc workspace component parameter list <type>` for each):

1. `pp-entity` with `Behavior=Existing`, once per entity the app uses — a reference,
   not a table.
2. `pp-app-model` — the app. Its full name is `<PublisherPrefix>_<app>`, and every
   later command takes it as `AppName`.
3. `pp-app-model-component`, once per entity, to add it to the app.

## Step 4 — Build the sitemap

Area first, then its groups, then subareas — `pp-sitemap-area`, `pp-sitemap-group`,
`pp-sitemap-subarea`. Each child references its parent **by title**, and every command
takes `AppName`; repeat `pp-sitemap-subarea` per entity in the group:

```
txc workspace component create pp-sitemap-subarea --output "<ui solution>" --param "Title=<Subarea Title>" --param "EntityLogicalName=<PublisherPrefix>_<entity>" --param "GroupTitle=<Group>" --param "AreaTitle=<Area>" --param "AppName=<PublisherPrefix>_<app>"
```

## Step 5 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 6 — Summary

Report the app name, referenced entities, and the sitemap tree, that `<package project>`
references the solution, that `dotnet build` passed, and that nothing was deployed.
Suggest the next steps, one line each: forms and views for each entity (`forms` and
`views-subgrids` references), then deploy the package (`deploy` skill).
