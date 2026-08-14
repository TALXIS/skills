> **Needed because:** txc does not print created GUIDs, forcing manual GUID choreography across the form chain.
> **Remove when:** component creates print artifacts/GUIDs as JSON (T4) and declarative bulk scaffold lands (T10).

# Forms

**Contract:** when this skill ends, the form XML exists under `src/Solutions.UI` and
`dotnet build` passes at the repository root. Local only — nothing is deployed.

Prerequisite: the entity and every attribute the form will show already exist in
`src/Solutions.DataModel` (never create forms before attributes). Placeholders:
`<prefix>` = publisher prefix, `<entity>` = entity name, so the schema name is
`<prefix>_<entity>`.

## Generate the form GUID first

`txc` does not print created GUIDs (tooling backlog T4), so generate
one GUID per form up front and reuse it in every later command — subgrids, event
handlers, and app components must all reference it:

```
FORM_GUID=$(uuidgen)
```

Record it (e.g. in your task notes) before scaffolding. Losing it means grepping
`src/Solutions.UI/Entities/<prefix>_<entity>/FormXml/main/` for the filename later.

## The chain — strict order, no skipped levels

Every command targets `--output src/Solutions.UI`. Run them in exactly this order.

**1. Form**

```
txc workspace component create pp-entity-form --output src/Solutions.UI \
  --param "FormType=main" \
  --param "EntitySchemaName=<prefix>_<entity>" \
  --param "FormId=$FORM_GUID"
```

**2. Register the form in the model-driven app** (skip only if the workspace has no app):

```
txc workspace component create pp-app-model-component --output src/Solutions.UI \
  --param "EntityType=Form" \
  --param "ComponentId=$FORM_GUID" \
  --param "AppName=<prefix>_<app>"
```

**3. Tab** — the first tab replaces the empty default tab via `RemoveDefaultTab=True`
(omit that param on subsequent tabs):

```
txc workspace component create pp-form-tab --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>" \
  --param "DisplayName=General" \
  --param "RemoveDefaultTab=True"
```

**4. Column**, **5. Section**, **6. Row** — identical parameter shape; run
`pp-form-row` once per field the section will hold:

```
txc workspace component create pp-form-column --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>"

txc workspace component create pp-form-section --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>"

txc workspace component create pp-form-row --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>"
```

**7. Cell** — one per row; `RowIndex` is 1-based and `DisplayName` is the field label:

```
txc workspace component create pp-form-cell --output src/Solutions.UI \
  --param "RowIndex=1" \
  --param "FormType=main" \
  --param "DisplayName=Name" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>"
```

**8. Control** — one per cell, same `RowIndex` as the cell it fills.
`ControlType` matches the attribute's type: `Text`, `MultilineText`, `WholeNumber`,
`Decimal`, `Currency`, `DateTime`, `OptionSet` (also for booleans), `Lookup`:

```
txc workspace component create pp-form-control --output src/Solutions.UI \
  --param "ControlType=Text" \
  --param "RowIndex=1" \
  --param "AttributeLogicalName=<prefix>_name" \
  --param "FormType=main" \
  --param "FormId=$FORM_GUID" \
  --param "EntitySchemaName=<prefix>_<entity>"
```

Repeat 7–8 per field. For more tabs/sections, repeat from step 3 (or 5) — never jump
levels: a control needs a cell, a cell needs a row, a row needs a section, a section
needs a column, a column needs a tab.

## Modifying an existing form

Do not re-scaffold. Instead:

1. Locate the form XML: `txc workspace explain`, then read
   `src/Solutions.UI/Entities/<prefix>_<entity>/FormXml/main/{<form-guid>}.xml`.
2. Find the insertion point at the right hierarchy level (tab → column → section →
   row → cell → control).
3. Adding a **field**: prefer the `pp-form-row` / `pp-form-cell` / `pp-form-control`
   commands above with the existing form's GUID; they append into the form XML.
   Adding a **section** or **tab**: use `pp-form-section` / `pp-form-tab` the same way.
   Only edit the XML by hand when the commands cannot target the right spot (e.g. a
   non-last section) — then copy an existing sibling element as the template.
4. Validate before finishing: no skipped hierarchy levels, every `datafieldname`
   exists as an attribute of the entity in `src/Solutions.DataModel`, and all GUIDs in
   the file are unique.

## Validate

```
dotnet build
```

Must pass at the repository root. `TALXISXSD001` = malformed form XML (usually a
skipped hierarchy level); `TALXISGUID001` = duplicate GUID — regenerate the reported id.
