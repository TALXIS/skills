> **Needed because:** the scaffold sequence and cross-solution referencing are not surfaced by txc help.
> **Remove when:** txc surfaces sequences in its own help/docs (TOOLING-BACKLOG T12), and
> deletes every component type from an environment (tools-cli#72) so the schema-change note can point at it.

# Implement the data model

**Contract:** when this task ends, `<data-model solution>` contains the requested
tables and columns, is referenced by `<package project>`, and `dotnet build` passes at
the repository root. Local only — no cloud environment is touched.

By default schema lives in its own Dataverse solution, apart from UI and logic, so
schema changes stay out of UI diffs. In a repository split differently, or when the
user wants another split (one solution for everything, split by domain, tables and UI
together), `<data-model solution>` is whichever project holds the tables there, and may
be the same project as the UI or logic slot. The repository must already be initialized
(see the `init` skill). Terms, project slots, their defaults (`src/Solutions.DataModel`,
...) and how to resolve them: [workspace-layout](../../init/references/workspace-layout.md).
The repository's own naming and layout win; the defaults apply only when it has none.

## Ordering invariant

Entity → attributes → forms/views. A column requires its entity to exist; a form or
view requires the entity and its columns to exist — scaffolding out of order produces
broken XML references. Never scaffold a lookup before its target entity exists.

Changing a schema name or attribute type of a component that is already deployed
means deleting it in the environment first — Dataverse does not apply such a change
on import (tested: importing int → decimal fails with "Attribute … is a Integer, but a
Decimal type was specified"; after `txc env entity attribute delete` and a re-import the
column has the new type). Editing the source alone does not fix a deployed environment.
Deleting a column also deletes its data. `txc env entity attribute delete` and
`entity delete` cover columns and tables; other component types have no delete command
yet (tools-cli#72).

## Step 1 — Gather inputs (once)

From the existing workspace (an existing solution project's csproj has
`PublisherName` and `PublisherPrefix`; `txc workspace explain` if unsure): `<PublisherName>`, `<PublisherPrefix>`. For each table: logical name (lowercase, no prefix — the CLI adds
it), plural logical name, display names. For each column: attribute type, required
level, display name.

## Step 2 — Create the Dataverse solution (first time only)

Skip if the workspace already has a Dataverse solution for tables (in a single-solution
repository, its one solution). This is the pattern every solution project follows —
create it with `pp-solution` (in a new repository at the default `src/Solutions.DataModel`)
and add a `ProjectReference` to it from the package project:

```
txc workspace component create pp-solution --output "<data-model solution>" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "<package project>" reference "<data-model solution>"
```

**Expected outcome — check it, template post-actions can fail without an error
(TALXIS/tools-devkit-templates#177):** the new project is in the solution file
(`dotnet sln list` shows it; `pp-solution` registers it itself when run from the folder
with the solution file, otherwise run `dotnet sln add`), and it ships in the Package Deployer package —
the `ProjectReference` puts it into the `.pdpkg.zip` and drives import order, and the
package project's generated `ImportConfig.g.xml` (under `obj/`) lists it.

## Step 3 — Create entities and columns

One `pp-entity` per table, then one `pp-entity-attribute` per column
(`txc workspace component parameter list <type>` has the parameters, defaults and
choices — including the `AttributeType` values and the extra parameters each takes).
A table needs `Behavior` and an explicit `PublisherPrefix` (it defaults to a
placeholder):

```
txc workspace component create pp-entity --output "<data-model solution>" --param "EntityType=Standard" --param "Behavior=New" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<entity>" --param "LogicalNamePlural=<entities>" --param "DisplayName=<Display Name>" --param "DisplayNamePlural=<Display Names>"
```

On a column, `EntitySchemaName` is the prefixed table name `<PublisherPrefix>_<entity>`
and a lookup's `LookupTarget` is the prefixed name of a table that already exists.

Expected outcome of the scaffold. Check it after the command, and repair by hand only
what is missing:

- Every new table has a required primary name column `<PublisherPrefix>_name`; satisfy
  a "name" column with it instead of adding another.
- A Lookup column creates its relationship: a file `Other/Relationships/<target>.xml` and an
  entry in `Other/Relationships.xml`. If it is missing, create the relationship component
  (`EntityRelationship`) yourself.
- Default forms, views and a ribbon file exist under `Entities/<prefix>_<entity>/`.
- A choice is a column: `OptionSet(Local)` keeps its options inline in `OptionSetOptions`
  (comma-separated labels — without it a placeholder option is written);
  `OptionSet(Global)` uses a list shared across tables (`OptionSetType` New or Existing,
  `OptionSetName`); `LocalMulti` / `GlobalMulti` are the multi-select variants. The
  `OptionSet` component is that shared list on its own.
- Date and time needs `DateTimeFormat=datetime`; the default is date-only.

To reference a table owned by another solution project (or a standard Dataverse table)
without duplicating its schema, create it with `Behavior=Existing` — that makes an
entity reference (a reference folder), not a table definition. Not for a table defined in the same project:
tested, the build then fails (TXM004, two Entity root components with the same name).

## Step 4 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 5 — Summary

Report the tables and columns created, that `<package project>` references the Dataverse solution,
that `dotnet build` passed, and that nothing was deployed. Natural next steps, one
line each: security roles for the new tables (`security` skill), an app and
navigation (`frontend` skill).
