> **Needed because:** the page + sitemap wiring sequence is not surfaced by txc
> help, and the `pp-page-generative` project template is invisible to `txc
> component type list` (it's a `dotnet new` template, not a component-type enum
> entry).
> **Remove when:** txc surfaces sequences in help/docs (T12), and exposes its own
> project-level templates through a discovery command (T17).

# Create a generative page

**Contract:** when this skill ends, the generative page project exists under `src/`,
it is referenced from `Solutions.UI`, a sitemap subarea points at it, and
`dotnet build` passes at the repository root. Nothing is deployed — local only.

A generative page is a single-file React page rendered inside a model-driven app.
It is **React 17 + Fluent UI v9** — do not import React 18 APIs or Fluent UI v8.
All Dataverse access goes through `props.dataApi` (query tables, then render —
summary cards, tables, whatever the page needs); there is no direct WebApi client.

## Step 1 — Gather inputs (once)

1. **Project folder** — e.g. `src/GenPages.<Name>`
2. **Name** — lowercase page name, e.g. `<pagename>` (becomes the csproj name)
3. **DisplayName** — human-readable, e.g. `<Display Name>`
4. **Sitemap placement** — Title, GroupTitle, AreaTitle, the model-driven app's name
   (`<prefix>_<appname>`), and an anchor entity (`<prefix>_<entity>`).

## Step 2 — Scaffold

`pp-page-generative` is a `dotnet new` project scaffold — `txc component type list
--search page` returns nothing; `dotnet new list | grep -i "power platform:
generative page"` finds it. From the repository root:

```
txc workspace component create pp-page-generative --output "src/GenPages.<Name>" --param "Name=<pagename>" --param "DisplayName=<Display Name>"
```

The template names the `.csproj` after the `Name` param, not the folder — locate it
with a glob rather than assuming (`src/GenPages.<Name>/*.csproj`), and read the
generated **GenPageId** from its `<PropertyGroup>`; Step 5 needs both.

## Step 3 — Implement the page

Edit `src/GenPages.<Name>/page.tsx`. Query data via `props.dataApi`, render with
Fluent UI v9 components. Keep it a single self-contained page file.

## Step 4 — Reference from Solutions.UI

```
dotnet add "src/Solutions.UI/Solutions.UI.csproj" reference "src/GenPages.<Name>/<pagename>.csproj"
```

Use the actual csproj file name found in Step 2. The ProjectReference is what makes
the solution build compile and pack the page.

## Step 5 — Sitemap subarea

```
txc workspace component create pp-sitemap-subarea --output "src/Solutions.UI" --param "PageType=genpage" --param "Title=<Title>" --param "EntityLogicalName=<prefix>_<entity>" --param "GenPageId=<genpage-id>" --param "GroupTitle=<GroupTitle>" --param "AreaTitle=<AreaTitle>" --param "AppName=<prefix>_<appname>"
```

`GenPageId` is the GUID read from the csproj in Step 2; `AppName` is the model-driven
app whose sitemap gains the subarea.

## Step 6 — Validate

```
dotnet build
```

Must pass before you finish — it builds the page bundle and validates the sitemap XML.

## Step 7 — Summary

Report: the project path and csproj name, the GenPageId, where the subarea landed
(Area → Group → Title), that `dotnet build` passed, and that nothing was deployed.
