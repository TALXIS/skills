---
name: data-model
description: Creates and evolves the data model of a TALXIS / Power Platform / Dataverse workspace — database tables, columns and fields, relationships and lookups, enumerations. Use when adding or changing tables, entities, columns, option sets, or relationships between records.
---

# Data model

**Contract:** components are scaffolded locally and `dotnet build` passes.
Local only — nothing deploys, no live environment is touched.

## Ask the CLI first

```
txc component type list --search <term>            # find the component type (aliases included)
txc component type explain <type>                  # what it is
txc workspace component parameter list <type>      # every parameter, typed, with defaults
```

Never guess parameters — `parameter list` is the authority.

## Intent → component type

| You want | Component type |
|---|---|
| a database table | `Entity` (alias `Table`) |
| a column / field on a table | `EntityAttribute` |
| a relationship / lookup between tables | search: `txc component type list --search relationship` |
| an enumeration (fixed value list) | search: `txc component type list --search optionset` |

## Sequence

1. Ensure a solution project for the data model exists (conventionally
   `src/Solutions.DataModel`); if not, create one (`--search solution`), add it to
   the solution file, and reference it from the deployment package project.
2. Create the table, then its columns — **always table before columns, and both
   before any form or view exists for them** (UI XML references break otherwise).
3. Relationships require both tables to exist first.
4. `dotnet build`.

## Invariants

- To use a table owned by another solution project without duplicating its schema,
  create the entity reference with `Behavior=Existing`.
- Table and column changes belong in the data-model solution, never in UI or
  logic solutions (see the `deploy` skill for layering).

Details and worked examples: [references/scaffolding.md](references/scaffolding.md)
