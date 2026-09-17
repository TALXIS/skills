---
name: frontend
description: Builds the user interface inside a TALXIS / Power Platform / Dataverse app — the app shell and navigation, screens, pages, forms, lists, custom UI components, client-side scripts. Use when creating or changing something the user sees or clicks. For a whole delivery that also needs tables, permissions and tests, use the builder skill instead.
---

# Frontend

**Contract:** UI components are scaffolded locally and `dotnet build` passes.
Local only — nothing deploys; custom apps preview locally with `npm run dev`.

## Ask the CLI first

```
txc workspace component create --help              # every scaffoldable template, by short name
txc component type explain <template>              # what it is, when to use it, and its CHAIN
txc workspace component parameter list <template>  # every parameter, typed, with defaults
txc docs get form-xml-reference                    # form structure guide
```

The form and page templates carry an explicit CHAIN in their `explain` output —
follow it rather than inventing one.

`txc` prints JSON to stdout and logs to stderr. **Trust the exit code** — an
unknown `--param` fails with *empty stdout* and exit 2 (T20).

## Intent → template

| You want | Template |
|---|---|
| an application shell users open | `pp-app-model` |
| navigation (menu areas, groups, links) | `pp-sitemap-area` → `pp-sitemap-group` → `pp-sitemap-subarea` |
| add an existing table/view/form to the app | `pp-app-model-component` |
| a detail/edit screen for a table | `pp-entity-form` |
| structure inside a form | `pp-form-tab` → `pp-form-column` → `pp-form-section` → `pp-form-row` → `pp-form-cell` → `pp-form-control` |
| related records shown on a form | `pp-form-subgrid` |
| a list of records | `pp-entity-view` |
| a fully custom page (React 17 + Fluent UI v9) | `pp-page-generative` |
| a fully custom SPA app (code app) | `pp-app-code` (+ `pp-app-code-data` for its data layer) |
| a packaged reusable UI component on a form | `pp-pcf`, then `txc workspace control attach` |
| client-side logic on forms | `pp-script-library` + `pp-webresource`, wired with `pp-form-event-handler` |
| a toolbar / command-bar button | `pp-ribbon-button` (hide a stock one with `pp-ribbon-button-hide`) |

## Sequence

1. UI lives in its own solution project (conventionally `src/Solutions.UI`);
   reference tables from other solutions with `Behavior=Existing` — never
   duplicate schema.
2. The table and all columns a form or view shows must already exist
   (`data-model` skill) before the form or view is created.
3. Compose top-down and register as you go: app → navigation → forms/views →
   scripts/controls. `txc workspace validate` and `dotnet build` after each addition.

## Invariants

- Forms are an XML hierarchy — never skip a level, every field must exist as a
  column, every GUID unique. Generate a form's GUID up front and reuse it for
  subgrids, event handlers, and app registration (T4).
- Generated views contain only the primary column — columns must be patched into
  the view XML (T3).
- Custom code apps generate typed data access **offline from local metadata** —
  no live environment needed.

Details: [references/](references/) — forms, views-subgrids, model-app,
form-scripts, ribbon, pcf-controls, code-apps, generative-pages
