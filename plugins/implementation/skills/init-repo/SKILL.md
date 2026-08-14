---
name: init-repo
description: Initializes a TALXIS / Power Platform monorepo — checks the toolchain, scaffolds the solution file and Package Deployer project, and ends on a passing local dotnet build. Use when starting a new TALXIS project, opening an existing one for the first time, or when asked to init, set up, or scaffold a TALXIS repository.
---

# Initialize a TALXIS repository

**Contract:** when this skill ends, `dotnet build` passes at the repository root.
Nothing is deployed and no cloud environment is touched — local only.

A TALXIS project is one monorepo: solutions, plugins, scripts, PCF controls, and the
deployment package live under a single git repository with one `.slnx` solution file.
`dotnet build` orchestrates and validates everything. Do not create one repository per
component.

## Step 1 — Toolchain check

Run each command; all must succeed:

```
dotnet --version
git --version
txc --version
node --version
```

- Node must be >= 22.12.
- If `txc` is missing: `dotnet tool install --global TALXIS.CLI`
- Then always refresh both, even when present (a stale template pack fails confusingly
  later, e.g. "Unknown parameter" on a valid parameter):

```
dotnet tool update --global TALXIS.CLI
dotnet new install TALXIS.DevKit.Templates.Dataverse
```

`txc workspace component create` reads its scaffolding from the
`TALXIS.DevKit.Templates.Dataverse` template pack, not from the CLI binary — the two
must stay in lockstep.

## Step 2 — New or existing repository?

Check for an existing workspace: a `*.slnx` (or `*.sln`) file at the root, or a `src/`
directory containing `.csproj` projects.

- **Existing** → do not scaffold. Run `txc workspace explain` to orient yourself,
  then `dotnet build` to confirm the workspace is healthy, and report what the
  repository contains. Done.
- **New (empty or non-TALXIS folder)** → continue to Step 3.

## Step 3 — Gather inputs (once)

Ask the user for all three together, then do not re-prompt:

1. **Solution name** — PascalCase, e.g. `WarehouseManagement`
2. **Publisher name** — e.g. `Contoso`
3. **Publisher prefix** — 2–8 lowercase letters, e.g. `ctso`

## Step 4 — Scaffold

From the repository root:

```
git init
dotnet new sln --name <SolutionName>
dotnet sln <SolutionName>.sln migrate
rm <SolutionName>.sln
mkdir -p src
txc workspace component create pp-package --output src/Packages.Main
dotnet sln add src/Packages.Main/Packages.Main.csproj
```

The `.slnx` migration matters: it is the XML solution format — human-readable and
merge-friendly. Also create `NuGet.config` at the root (TALXIS DevKit build SDK and
templates come from nuget.org):

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
  </packageSources>
</configuration>
```

`Packages.Main` is the Package Deployer project: it bundles every referenced solution
into a single `.pdpkg.zip`, and its import order is derived from `ProjectReference`s so
dependencies install first.

Do not create solution projects yet. Solutions are added per concern when the first
component of that concern is created (`Solutions.DataModel`, `Solutions.Logic`,
`Solutions.Security`, `Solutions.UI`) — one solution per concern keeps schema changes
out of UI diffs.

## Step 5 — Validate

```
dotnet build
```

The build runs TALXIS workspace validation (XSD schema, duplicate GUIDs). It must pass
before you finish. Known error codes: `TALXISXSD001` (schema validation failed — fix
the reported XML), `TALXISGUID001` (duplicate GUID — regenerate the reported id).

## Step 6 — Summary

Report exactly: the created layout (`<SolutionName>.slnx`, `NuGet.config`,
`src/Packages.Main`), that `dotnet build` passed, and that nothing was deployed.
Suggest the next step in one line: create the data model (tables and columns) —
components land in `src/Solutions.DataModel` when that work starts.
