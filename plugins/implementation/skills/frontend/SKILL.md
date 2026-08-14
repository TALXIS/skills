---
name: frontend
description: Builds the user interface of a TALXIS / Power Platform / Dataverse app — screens, pages, forms, lists, navigation, custom UI components, client-side scripts. Use when creating or changing anything the user sees or clicks.
---

# Frontend

**Contract:** UI components are scaffolded locally and `dotnet build` passes.
Local only — nothing deploys; custom apps preview locally with `npm run dev`.

## Ask the CLI first

```
txc component type list --search <term>            # find the component type
txc workspace component parameter list <type>      # every parameter, typed
txc docs get form-xml-reference                    # form structure guide
```

## Intent → component type

| You want | Component type / command |
|---|---|
| an application shell users open | app (model-driven) — `--search app` |
| navigation (menu areas, groups, links) | sitemap types — `--search sitemap` |
| a detail/edit screen for a table | form — `--search form` |
| a list of records | view — `--search view` |
| a fully custom page (React) | generative page — `--search page` |
| a fully custom SPA app (React + Vite) | code app — `--search code` |
| a packaged reusable UI component on a form | `txc workspace control attach` |
| client-side logic on forms | script library + event handler types — `--search script` |
| a toolbar / command-bar button | ribbon types — `--search ribbon` |

## Sequence

1. UI lives in its own solution project (conventionally `src/Solutions.UI`);
   reference tables from other solutions with `Behavior=Existing` — never
   duplicate schema.
2. The table and all columns a form or view shows must already exist
   (`data-model` skill) before the form or view is created.
3. Compose top-down and register as you go: app → navigation → forms/views →
   scripts/controls. `dotnet build` after each addition.

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
