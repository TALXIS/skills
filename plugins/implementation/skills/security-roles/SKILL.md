---
name: security-roles
description: Creates the Solutions.Security solution with security roles (pp-security-role) and per-entity privileges (pp-security-role-privilege) via txc, then validates with dotnet build. Use when adding security roles, granting or scoping table privileges (Read/Write/Create/Delete/Append/AppendTo at Basic/Local/Deep/Global depth), or modeling personas like worker and manager in a TALXIS project.
---

# Implement security roles

**Contract:** when this skill ends, `src/Solutions.Security` contains the requested
roles and privileges, is referenced by `Packages.Main`, and `dotnet build` passes at
the repository root. Local only — no cloud environment is touched.

Doctrine: model roles for **personas** (e.g. "Warehouse worker", "Warehouse
manager"), never for individual people. Least-privilege by design — grant each
persona only what its workflow needs, and give automated test users a
least-privileged role too, never an admin account. Security config lives in its own
`Solutions.Security` solution (one solution per concern), so access changes never
hide inside schema or UI diffs.

## Step 1 — Gather inputs (once)

`<PublisherName>`, `<PublisherPrefix>` from the workspace (`txc workspace explain` if
unsure). For each role: a persona name. For each role × entity: the privilege matrix
(types + depth). The entities must already exist in the workspace (see the
`data-model` skill).

## Step 2 — Create the solution (first time only)

Skip if `src/Solutions.Security/Solutions.Security.csproj` exists. From the root:

```
txc workspace component create pp-solution --output "src/Solutions.Security" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "src/Packages.Main/Packages.Main.csproj" reference "src/Solutions.Security/Solutions.Security.csproj"
dotnet sln add src/Solutions.Security/Solutions.Security.csproj
```

## Step 3 — Create roles

One command per persona:

```
txc workspace component create pp-security-role --output "src/Solutions.Security" --param "RoleName=<Persona name>"
```

## Step 4 — Grant privileges

One command per role × entity. `PrivilegeTypeAndLevel` is a single-line array of
`{ PrivilegeType: <type>, Level: <depth> }` pairs — copy the syntax exactly:

```
txc workspace component create pp-security-role-privilege --output "src/Solutions.Security" --param "RoleName=<Persona name>" --param "PrivilegeTypeAndLevel=[{ PrivilegeType: Read, Level: Global }, { PrivilegeType: Write, Level: Basic }, { PrivilegeType: Create, Level: Basic }]" --param "EntityLogicalName=<PublisherPrefix>_<entity>"
```

- `PrivilegeType`: `Read`, `Write`, `Create`, `Delete`, `Append`, `AppendTo`.
- `Level` (depth — how far the privilege reaches): `Basic` = own records, `Local` =
  own business unit, `Deep` = BU plus child BUs, `Global` = whole organization.
- Full CRUD for a manager-style persona:
  `[{ PrivilegeType: Read, Level: Global }, { PrivilegeType: Write, Level: Global }, { PrivilegeType: Create, Level: Global }, { PrivilegeType: Delete, Level: Global }, { PrivilegeType: Append, Level: Global }, { PrivilegeType: AppendTo, Level: Global }]`
- Grant `Append`/`AppendTo` wherever the persona sets lookups between the tables.
- A deliberate matrix beats uniform grants: e.g. a worker reads everything (`Read`
  Global) but edits only records they own (`Write` Basic).

## Step 5 — Validate

```
dotnet build
```

Must pass. `TALXISXSD001` = schema validation failed (fix the reported XML);
`TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 6 — Summary

Report the roles and the privilege matrix per entity, that `Packages.Main` references
the solution, that `dotnet build` passed, and that nothing was deployed. Suggest the
next step in one line: build the app and navigation (`model-app` skill), or deploy
the package (`deploy` skill).
