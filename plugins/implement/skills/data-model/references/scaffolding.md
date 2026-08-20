> **Needed because:** the scaffold sequence and cross-solution referencing are not surfaced by txc help.
> **Remove when:** txc surfaces sequences in its own help/docs (TOOLING-BACKLOG T12).

# Implement the data model

**Contract:** when this skill ends, `src/Solutions.DataModel` contains the requested
tables and columns, is referenced by `Packages.Main`, and `dotnet build` passes at the
repository root. Local only — no cloud environment is touched.

One solution per concern: schema lives in `Solutions.DataModel`, never in UI or logic
solutions. The repository must already be initialized (see the `init-repo` skill).

## Ordering invariant

Entity → attributes → forms/views. A column requires its entity to exist; a form or
view requires the entity and its columns to exist — scaffolding out of order produces
broken XML references. Never scaffold a lookup before its target entity exists.

## Step 1 — Gather inputs (once)

From the existing workspace (`txc workspace explain` if unsure): `<PublisherName>`,
`<PublisherPrefix>`. For each table: logical name (lowercase, no prefix — the CLI adds
it), plural logical name, display names. For each column: attribute type, required
level, display name.

## Step 2 — Create the solution (first time only)

Skip if `src/Solutions.DataModel/Solutions.DataModel.csproj` exists. From the root:

```
txc workspace component create pp-solution --output "src/Solutions.DataModel" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "src/Packages.Main/Packages.Main.csproj" reference "src/Solutions.DataModel/Solutions.DataModel.csproj"
dotnet sln add src/Solutions.DataModel/Solutions.DataModel.csproj
```

The `ProjectReference` puts the solution into the `.pdpkg.zip` and drives import
order; `dotnet sln add` puts it under the root `dotnet build`.

## Step 3 — Create entities

One command per new table:

```
txc workspace component create pp-entity --output "src/Solutions.DataModel" --param "EntityType=Standard" --param "Behavior=New" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<entity>" --param "LogicalNamePlural=<entities>" --param "DisplayName=<Display Name>" --param "DisplayNamePlural=<Display Names>"
```

To reference a table owned by another solution (or a standard Dataverse table)
without duplicating its schema, use `Behavior=Existing` — it creates a reference
folder, not a table definition:

```
txc workspace component create pp-entity --output "src/Solutions.DataModel" --param "Behavior=Existing" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<entity>" --param "DisplayName=<Display Name>"
```

## Step 4 — Create columns

One command per column. `EntitySchemaName` is the prefixed name
(`<PublisherPrefix>_<entity>`); `RequiredLevel` is `required` or `none`. Base shape:

```
txc workspace component create pp-entity-attribute --output "src/Solutions.DataModel" --param "EntitySchemaName=<PublisherPrefix>_<entity>" --param "AttributeType=Text" --param "RequiredLevel=required" --param "PublisherPrefix=<PublisherPrefix>" --param "LogicalName=<column>" --param "DisplayName=<Display Name>"
```

`AttributeType` values and their extra params (add to the base shape):

| AttributeType | Extra params |
|---|---|
| `Text` | — |
| `MultilineText` | — |
| `WholeNumber` | — |
| `Decimal` | `--param "DecimalPrecision=3"` |
| `Money` | `--param "DecimalPrecision=2"` |
| `Boolean` | `--param "BooleanTrueLabel=Yes" --param "BooleanFalseLabel=No"` |
| `DateTime` | `--param "DateTimeFormat=date"` for date-only; omit for date+time |
| `OptionSet(Local)` | `--param "OptionSetOptions=<Label1>,<Label2>,<Label3>"` |
| `Lookup` | `--param "LookupTarget=<PublisherPrefix>_<targetentity>"` |

## Step 5 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 6 — Summary

Report the tables and columns created, that `Packages.Main` references the solution,
that `dotnet build` passed, and that nothing was deployed. Natural next steps, one
line each: security roles for the new tables (`security-roles` skill), an app and
navigation (`model-app` skill).
