> **Needed because:** privilege depth semantics and the role/privilege sequence are not surfaced by txc help.
> **Remove when:** txc surfaces sequences and privilege semantics in help/docs (T12).

# Implement security roles

**Contract:** when this skill ends, `<security solution>` contains the requested
roles and privileges, is referenced by `<package project>`, and `dotnet build` passes at
the repository root. Local only — no cloud environment is touched.

Doctrine: model roles for **personas** (e.g. "Sales rep", "Sales
manager"), never for individual people. Least-privilege by design — grant each
persona only what its workflow needs, and give automated test users a
least-privileged role too, never an admin account. Security config lives in its own
security solution (one solution per concern), so access changes never
hide inside schema or UI diffs.

## Step 1 — Gather inputs (once)

`<PublisherName>`, `<PublisherPrefix>` from the workspace (an existing solution
project's csproj has them). For each role: a persona name. For each role × entity: the privilege matrix
(types + depth). The entities must already exist in the workspace (see the
`data-model` skill).

## Step 2 — Create the solution (first time only)

Skip if the workspace already has a security solution. Create it like any solution
project (default `src/Solutions.Security`) — `pp-solution`, a `ProjectReference` from
`<package project>`, `dotnet sln add` (the `data-model` reference shows the commands).

## Step 3 — Create roles

One `pp-security-role` per persona (`RoleName`).

## Step 4 — Grant privileges

One command per role × entity. `PrivilegeTypeAndLevel` is a single-line array of
`{ PrivilegeType: <type>, Level: <depth> }` pairs — copy the syntax exactly:

```
txc workspace component create pp-security-role-privilege --output "<security solution>" --param "RoleName=<Persona name>" --param "PrivilegeTypeAndLevel=[{ PrivilegeType: Read, Level: Global }, { PrivilegeType: Write, Level: Basic }, { PrivilegeType: Create, Level: Basic }]" --param "EntityLogicalName=<PublisherPrefix>_<entity>"
```

- `PrivilegeType`: `Read`, `Write`, `Create`, `Delete`, `Append`, `AppendTo`.
- `Level` (depth — how far the privilege reaches): `Basic` = own records, `Local` =
  own business unit, `Deep` = BU plus child BUs, `Global` = whole organization.
- Grant `Append`/`AppendTo` wherever the persona sets lookups between the tables.
- When a table is added later, extend the existing roles with it — a new table has no
  privileges in any role until you grant them, so personas silently can't use it.
- A deliberate matrix beats uniform grants: e.g. a worker reads everything (`Read`
  Global) but edits only records they own (`Write` Basic).

## Step 5 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 6 — Summary

Report the roles and the privilege matrix per entity, that `<package project>` references
the solution, that `dotnet build` passed, and that nothing was deployed. Suggest the
next step in one line: build the app and navigation (`model-app` skill), or deploy
the package (`deploy` skill).
