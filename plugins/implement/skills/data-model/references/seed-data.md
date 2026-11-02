> **Needed because:** no template scaffolds a CMT data package (`txc component type list --search` finds nothing for
> cmt, configuration, migration or seed), and `txc docs get data-migration` covers export and import, not the files;
> `txc data pkg import` skips many-to-many rows in two cases (TALXIS/tools-cli#244, TALXIS/tools-cli#246).
> **Remove when:** txc scaffolds a CMT data package from the tables in source (T26), `dotnet build` of the package
> project refreshes the `.pdpkg.zip` (T27), and those two import issues are fixed.

# Reference and seed data as source

**Contract:** when this task ends, `<package project>/Data/` holds a CMT data package with the requested records and
`dotnet build` passes. Local only — importing it is the `deploy` skill (deployment reference).

Records the app needs in every environment (locations, categories, configuration rows) live in source as a
Configuration Migration (CMT) data package: written by hand, reviewed in pull requests, imported the same way
everywhere. Its tables and columns must exist in `<data-model solution>` first.

## The files

A folder with three files:

- `data_schema.xml` — which tables and columns the package carries: `<entities>` holding, per table,
  `<entity name="<prefix>_<entity>" displayname="…" primaryidfield="<prefix>_<entity>id" primarynamefield="<prefix>_name" disableplugins="true">`
  with `<fields>`, one `<field displayname="…" name="<column>" type="<type>" />` per column (`customfield="true"` on
  custom columns). The primary key is `type="guid" primaryKey="true"`; a lookup is
  `type="entityreference" lookupType="<target table>"`. Types used so far: `guid`, `string`, `number` (whole number),
  `bool`, `optionsetvalue`, `money`, `datetime`, `entityreference`.
- `data.xml` — the records: `<entities>` holding, per table, `<entity name="…" displayname="…"><records>` with one
  `<record id="<guid>">` per record, one `<field name="<column>" value="…" />` per value, then `</records><m2mrelationships /></entity>`.
- `[Content_Types].xml` — fixed content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/octet-stream" />
</Types>
```

`data_schema.xml` for one table with a lookup:

```xml
<?xml version="1.0" encoding="utf-8"?>
<entities>
  <entity name="<prefix>_<entity>" displayname="…" primaryidfield="<prefix>_<entity>id" primarynamefield="<prefix>_name" disableplugins="true">
    <fields>
      <field displayname="…" name="<prefix>_<entity>id" type="guid" primaryKey="true" />
      <field displayname="…" name="<prefix>_name" type="string" customfield="true" />
      <field displayname="…" name="<lookup column>" type="entityreference" lookupType="<target table>" customfield="true" />
    </fields>
  </entity>
</entities>
```

`data.xml` with one record of that table:

```xml
<?xml version="1.0" encoding="utf-8"?>
<entities>
  <entity name="<prefix>_<entity>" displayname="…">
    <records>
      <record id="<guid>">
        <field name="<prefix>_<entity>id" value="<guid>" />
        <field name="<prefix>_name" value="…" />
        <field name="<lookup column>" value="<target guid>" lookupentity="<target table>" lookupentityname="<target's name>" />
      </record>
    </records>
    <m2mrelationships />
  </entity>
</entities>
```

Rules:

- Tables in the same order in both files, parents before children (a lookup's target table first).
- `disableplugins="true"` on every `<entity>` of the schema, so the import does not run the app's plugins on the rows.
- Every record gets a fixed GUID: the record's `id`, and the primary-key field carries the same value. Fixed GUIDs make a
  re-import update the records instead of duplicating them — generate them once, never change them.
- Values: a lookup is the target record's GUID plus `lookupentity="<target table>" lookupentityname="<target's name>"`;
  a choice is its integer option value (e.g. `100000000`, from the column's options in `Entity.xml`); a boolean is
  `True` / `False`; money is a plain number (`19.99`); a date and time is ISO 8601 UTC (`2026-01-15T00:00:00Z`).
- A lookup that can point to several tables (customer, regarding) lists them all in the schema,
  `lookupType="account|contact"`; each value says which one it points to with `lookupentity`.

### Matching existing records

The import matches records on the fields marked `updateCompare="true"`. A table without them is matched on its
primary name column, so two rows with the same name overwrite each other. No match creates a new row.

Mark `updateCompare` in every table of the package — on the primary key, or on a business key when the rows may
already exist with other GUIDs:

```xml
<field displayname="…" name="<prefix>_<entity>id" type="guid" primaryKey="true" updateCompare="true" />
```

After an import, compare the row count per table with `data.xml` — more rows means duplicates.

### Many-to-many relationships

In `data_schema.xml`, inside the `<entity>` of the table that declares the relationship, after `</fields>`:

```xml
<relationships>
  <relationship name="<intersect table>" manyToMany="true" isreflexive="false" relatedEntityName="<intersect table>" m2mTargetEntity="<other table>" m2mTargetEntityPrimaryKey="<other table>id" />
</relationships>
```

In `data.xml`, the same table's `<m2mrelationships />` becomes one element per source record:

```xml
<m2mrelationships>
  <m2mrelationship sourceid="<source guid>" targetentityname="<other table>" targetentitynameidfield="<other table>id" m2mrelationshipname="<intersect table>">
    <targetids>
      <targetid><target guid></targetid>
    </targetids>
  </m2mrelationship>
</m2mrelationships>
```

- `<intersect table>` is `IntersectEntityName` in the relationship's XML under `Other/Relationships/`, not the
  relationship's schema name. When the two differ, the schema name fails the export ("Missing Fields on …") and the
  import ("Could not find M2M relationship …").
- Put `<other table>` before this table in both files.
- `txc data pkg import --batch-mode` skips these rows without an error (TALXIS/tools-cli#246) — import without it.
- A relationship of a table to itself (`isreflexive="true"`) imports nothing with `txc data pkg import`: each row logs
  "Entity role must be specified for reflexive relationship" and the import still succeeds (TALXIS/tools-cli#244).
  Tell the user; until it is fixed those rows need Package Deployer on Windows or the Web API
  (`POST <entity set>(<id>)/<navigation property>/$ref`).

Instead of writing `data.xml` by hand, records created in a Dev environment can be exported into it
(`txc data pkg export`, deployment reference).

## Where it goes and how it ships

Put the folder at `<package project>/Data/`. The package project's build finds it by itself through its
`[Content_Types].xml` (log: "Detected Cmt packages: …"; tested with TALXIS.DevKit.Build.Sdk 1.11.1; without that file
the folder is skipped silently) and fails with "data.xml not found for Cmt package" when a data file is missing. `dotnet publish` packs it into the `.pdpkg.zip` as
`PkgAssets/MainCmtPackage.zip`, named by `crmmigdataimportfile` in its `ImportConfig.xml`, so the package imports the
records. Only `dotnet publish` refreshes the `.pdpkg.zip`: `dotnet build` logs "Zipping Cmt packages" but leaves the old
one in place (T27). Check: `unzip -l <package project>/bin/<Configuration>/<project name>.pdpkg.zip` lists
`PkgAssets/MainCmtPackage.zip`.

## Summary

Report the tables and record counts in the package, that `dotnet build` passed, and that nothing was imported.
