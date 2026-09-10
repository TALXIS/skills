---
name: data-model
description: Creates and evolves the data model of a TALXIS / Power Platform / Dataverse workspace — database tables, columns and fields, relationships and lookups, enumerations. Use when adding or changing tables, entities, columns, option sets, or relationships between records.
---

# Data model

**Contract:** components are scaffolded locally and `dotnet build` passes.
Local only — nothing deploys, no live environment is touched.

## Ask the CLI first

```
txc workspace component create --help              # every scaffoldable template, by short name
txc component type explain <template>              # what it is, when to use it, and its CHAIN
txc workspace component parameter list <template>  # every parameter, typed, with defaults
```

Never guess parameters — `parameter list` is the authority. `explain` often names
the exact ordered chain a component needs; follow it rather than inventing one.

`txc` prints JSON to stdout and logs to stderr. **Trust the exit code** — an
unknown `--param` fails with *empty stdout* and exit 2 (T20).

## Intent → template

| You want | Template |
|---|---|
| a solution project to hold the schema | `pp-solution` |
| a database table | `pp-entity` |
| a column / field on a table | `pp-entity-attribute` |
| an enumeration (fixed value list) | `pp-optionset-global` |
| a relationship / lookup between tables | `pp-entity-attribute` with `AttributeType=Lookup` and `LookupTarget` (this *is* the 1:N relationship) |
| a business process flow over a table | `pp-bpf` → `pp-bpf-stage` → `pp-bpf-stage-step` |

## Sequence

1. Ensure a solution project for the data model exists (conventionally
   `src/Solutions.DataModel`); if not, create one with `pp-solution`, add it to
   the solution file, and reference it from the deployment package project.
2. Create the table, then its columns — **always table before columns, and both
   before any form or view exists for them** (UI XML references break otherwise).
3. A lookup column requires its target table to exist first. There is no N:N
   template — author `EntityRelationship` XML by hand when a many-to-many is
   genuinely needed.
4. `txc workspace validate` and `dotnet build`.

## Invariants

- To use a table owned by another solution project without duplicating its schema,
  create the entity reference with `Behavior=Existing`.
- Table and column changes belong in the data-model solution, never in UI or
  logic solutions (see the `deploy` skill for layering).

Details and worked examples: [references/scaffolding.md](references/scaffolding.md)
