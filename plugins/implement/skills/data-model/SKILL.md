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

1. Find the Dataverse solution that holds tables in the workspace (role resolution
   and terms: `init` skill, `workspace-layout` reference). Only if the repository has
   none, create one (`--search solution`), add it to the solution file, and reference
   it from the package project; a new repository's default is `src/Solutions.DataModel`.
   In a single-solution repository this is the one solution.
2. Create the table, then its columns — **always table before columns, and both
   before any form or view exists for them** (UI XML references break otherwise).
3. Relationships require both tables to exist first.
4. `dotnet build`.

## Invariants

- Define a table in one solution project only. To use a table that lives in
  another solution project (or a standard table) without duplicating its schema, create
  an entity reference with `Behavior=Existing`; for a table in the same project, create
  it normally (a reference duplicates the root component and fails the build).
- Put table and column changes in the solution that holds tables in this repository
  (the default split keeps them in the data-model solution, apart from UI and logic;
  see the `deploy` skill's layering reference).

Details and worked examples: [references/scaffolding.md](references/scaffolding.md)
