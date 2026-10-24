> **Needed because:** the scaffold sequence and cross-solution referencing are not surfaced by txc help.
> **Remove when:** txc surfaces sequences in its own help/docs (TOOLING-BACKLOG T12), and
> deletes components from an environment (tools-cli#72) so the schema-change note can point at it.

# Implement the data model

**Contract:** when this skill ends, `<data-model solution>` contains the requested
tables and columns, is referenced by `<package project>`, and `dotnet build` passes at
the repository root. Local only — no cloud environment is touched.

One solution per concern: schema lives in the data-model solution, never in UI or
logic solutions. The repository must already be initialized (see the `init` skill).
Project roles, their defaults (`src/Solutions.DataModel`, ...) and how to resolve them
in an existing repository: [workspace-layout](../../init/references/workspace-layout.md).
The repository's own naming wins; the defaults apply only when it has none.

## Ordering invariant

Entity → attributes → forms/views. A column requires its entity to exist; a form or
view requires the entity and its columns to exist — scaffolding out of order produces
broken XML references. Never scaffold a lookup before its target entity exists.

Changing a schema name or attribute type of a component that is already deployed
means deleting it in the environment first — Dataverse does not apply such a change
on import. Editing the source alone does not fix a deployed environment.

## Step 1 — Gather inputs (once)

From the existing workspace (an existing solution project's csproj has
`PublisherName` and `PublisherPrefix`; `txc workspace explain` if unsure): `<PublisherName>`, `<PublisherPrefix>`. For each table: logical name (lowercase, no prefix — the CLI adds
it), plural logical name, display names. For each column: attribute type, required
level, display name.

## Step 2 — Create the solution (first time only)

Skip if the workspace already has a data-model solution. This is the pattern every
solution project follows — create it with `pp-solution` (in a new repository at the
default `src/Solutions.DataModel`) and reference it from the package project:

```
txc workspace component create pp-solution --output "<data-model solution>" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "<package project>" reference "<data-model solution>"
```

**Expected outcome — check it, template post-actions can fail without an error
(TALXIS/tools-devkit-templates#177):** the new project is in the solution file
(`dotnet sln list` shows it; `pp-solution` registers it itself when run from the folder
with the solution file, otherwise run `dotnet sln add`), and it ships in the package —
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
- A Lookup column creates its relationship: `Other/Relationships/<target>.xml` lists it.
  If it is missing, create the relationship component yourself.
- Default forms, views and a ribbon file exist under `Entities/<prefix>_<entity>/`.
- A local choice is the `OptionSet(Local)` column type with its options inline in
  `OptionSetOptions` (comma-separated labels — without it a placeholder option is
  written); a separate option-set component is only for a shared (global) list.
- Date and time needs `DateTimeFormat=datetime`; the default is date-only.

To reference a table owned by another solution (or a standard Dataverse table) without
duplicating its schema, create it with `Behavior=Existing` — that makes a reference
folder, not a table definition.

## Step 4 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 5 — Summary

Report the tables and columns created, that `<package project>` references the solution,
that `dotnet build` passed, and that nothing was deployed. Natural next steps, one
line each: security roles for the new tables (`security` skill), an app and
navigation (`frontend` skill).
