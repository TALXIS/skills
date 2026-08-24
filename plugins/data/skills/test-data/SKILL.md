---
name: test-data
description: Provisions repeatable test and reference data for a TALXIS / Power Platform / Dataverse project — data lives as source in the project's existing deployable data package (a CMT schema plus records with stable GUIDs) and round-trips through the CLI so every fresh environment seeds identically. Use when adding sample records or test fixtures, seeding an environment with data, adding a table to the test-data package, or capturing live records back into source.
---

# Test data

**Contract:** test/reference data lives as source — a CMT data package inside the
project's existing Package Deployer project — never hand-created ad hoc when a
package exists. Done when the changed entities are merged into the package, every
other entity is untouched, and `txc data package import` into a fresh environment
succeeds: the data round-trips. Needs an authenticated profile pinned to the
target environment (`txc config profile --help`).

## Ask the CLI first

```
txc data --help                # data command groups
txc data package --help        # CMT package export / import round-trip
txc environment data --help    # live records: create, bulk operations, queries
txc docs list                  # long-form guides (txc docs get <id>)
```

Never guess parameters — `--help` on every command is the authority.

## Volume → route

| Records needed | Route |
|---|---|
| one throwaway record | create it directly in the environment (`txc environment data --help`) |
| a handful, this session only | bulk-create the same way — still throwaway |
| anything a future environment must also have | the package loop below |

## Sequence — one table per iteration

1. **Locate the existing package.** Search for the Package Deployer data project
   (a `.csproj` with `ProjectType=PDPackage`, often named `Packages.TestingData`
   or similar); inside it find the CMT schema (`data_schema.xml`), the records
   (`data.xml`), and `ImportConfig.xml`. If none exists, stop and confirm that
   creating one is in scope before scaffolding anything.
2. **Describe the table live** — `txc environment entity describe <logicalname>` —
   then curate a lean `<entity>` block into `data_schema.xml`
   ([references/package-merge.md](references/package-merge.md) carries the
   field-selection checklist); never dump every attribute the describe returns.
3. **Stage sample records live** via record create; ask the user for realistic
   values — don't invent them.
4. **Export the round-trip** — `txc data package export` against the package's
   schema file, into a scratch directory. It emits a correctly formatted
   `data.xml`/`data_schema.xml` pair with GUIDs and lookup annotations resolved —
   never hand-write record XML.
5. **Merge** only the `<entity>` node(s) touched this iteration into the package's
   pair; preserve everything else byte-for-byte
   ([references/package-merge.md](references/package-merge.md)).
6. **Prove the import** — `txc data package import` against the package's data
   folder, ideally into a freshly provisioned environment; optionally verify with
   a count query. Fix and re-run locally rather than discovering failures in CI.

## Invariants

- **Extend, never fork:** one test-data package per project — grow the existing
  one; a parallel package splits the seed data and breaks the deploy pipeline.
- **Stable GUIDs:** the schema's primary-key field with update-compare makes
  re-import idempotent — records update in place instead of duplicating.
- **`disableplugins`** in the import configuration wherever seeding must not
  trigger server-side logic.
- `--override-safety-checks` on import skips the CLI's duplicate checking —
  every record is created as new. Freshly reset or empty environments only,
  never against one that already holds this data.
- The package's full build-and-deploy stays in CI; this loop ends at a clean
  local `data package import`.
