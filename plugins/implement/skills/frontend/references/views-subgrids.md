> **Needed because:** pp-entity-view generates only a minimal lookup view, so columns must be patched by hand.
> **Remove when:** pp-entity-view emits complete layoutxml and fetchxml (T3).

# Views and subgrids

**Contract:** when this skill ends, the view (and any subgrid) XML exists under
`src/Solutions.UI` and `dotnet build` passes at the repository root. Local only —
nothing is deployed.

Prerequisites: the entity and its attributes exist in `src/Solutions.DataModel`; for a
subgrid, the parent form exists and you have its GUID (see the `forms` skill).

## Create a view

```
txc workspace component create pp-entity-view --output src/Solutions.UI \
  --param "EntitySchemaName=<prefix>_<entity>" \
  --param "DisplayName=Active <Entities>" \
  --param "PublisherPrefix=<prefix>"
```

The view file lands at
`src/Solutions.UI/Entities/<prefix>_<entity>/SavedQueries/{<view-guid>}.xml` —
the filename (braces stripped) **is** the view GUID; record it for subgrids.

## Add columns (required post-patch — tooling backlog T3)

`pp-entity-view` generates only a minimal lookup view (`querytype` 64 with the
primary-name column), so every extra column must be patched into **both** the
`layoutxml` and the `fetchxml` inside the generated file. For each column
`<prefix>_<column>`:

- in `layoutxml`, append to the existing `<row>`:

  ```xml
  <cell name="<prefix>_<column>" width="125" />
  ```

- in `fetchxml`, append to the existing `<entity>`:

  ```xml
  <attribute name="<prefix>_<column>" />
  ```

A column present in only one of the two renders empty or is dropped. Every `name`
must exist as an attribute of the entity in `src/Solutions.DataModel`.

## Add a subgrid to a parent form

A subgrid needs three identifiers gathered up front:

- the **parent form's GUID** (`FormId`) — generated when the form was scaffolded,
- the **view GUID** (`ViewId`) — the SavedQueries filename above, for the target entity,
- the **relationship name** — without it the subgrid shows ALL records of the target
  entity, not just the parent's related rows. Read it from
  `src/Solutions.DataModel/Other/Relationships/<prefix>_<parententity>.xml`: the
  `Name` of the `EntityRelationship` whose `ReferencingAttributeName` is the lookup
  column on the target entity.

```
txc workspace component create pp-form-subgrid --output src/Solutions.UI \
  --param "SubgridLabel=<Related Records>" \
  --param "FormType=main" \
  --param "FormId=<parent-form-guid>" \
  --param "TargetEntityLogicalName=<prefix>_<childentity>" \
  --param "EntityLogicalName=<prefix>_<parententity>" \
  --param "ViewId=<view-guid>" \
  --param "RelationshipName=<prefix>_<relationship>"
```

`EntityLogicalName` is the entity whose form hosts the subgrid;
`TargetEntityLogicalName` is the entity whose records it lists.

## Validate

```
dotnet build
```

Must pass at the repository root. `TALXISXSD001` = malformed view/form XML (check the
patched `layoutxml`/`fetchxml` is well-formed); `TALXISGUID001` = duplicate GUID.
