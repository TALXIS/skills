---
name: plugin-registration
description: Registers a built plugin assembly (pp-plugin-assembly) and its SDK message processing steps (pp-plugin-assembly-step) in Solutions.Logic, and validates with dotnet build. Use when wiring a Dataverse plugin to an entity and message, registering plugin steps, choosing Pre-validation vs Post-operation stages, or creating the Logic solution.
---

# Register plugin assemblies and steps

**Contract:** when this skill ends, `src/Solutions.Logic` contains the assembly
registration and one step per plugin, and `dotnet build` passes at the repository
root. Local only — nothing is deployed and no cloud environment is touched.

The split is deliberate: the plugin project holds the code, `Solutions.Logic` holds
the registration. The assembly is a build artifact; when and where it runs is
Dataverse configuration — each belongs to its own project. The plugin project must
already exist and build (see the `plugin-development` skill).

## Ordering invariant

Assembly before steps — steps reference the assembly, so `pp-plugin-assembly` must
run before any `pp-plugin-assembly-step`. And the plugin project must be built before
the assembly is registered.

## Step 1 — Gather inputs (once)

From the existing workspace (`txc workspace explain` if unsure): `<PublisherName>`,
`<PublisherPrefix>`, the plugin project name `Plugins.<Name>`. For each step: the
plugin class name, the target entity's prefixed logical name, the SDK message
(Create/Update/Delete), and the stage (Pre-validation / Post-operation).

## Step 2 — Create Solutions.Logic (first time only)

Skip if `src/Solutions.Logic/Solutions.Logic.csproj` exists. From the root:

```
txc workspace component create pp-solution --output "src/Solutions.Logic" --param "PublisherName=<PublisherName>" --param "PublisherPrefix=<PublisherPrefix>"
dotnet add "src/Packages.Main/Packages.Main.csproj" reference "src/Solutions.Logic/Solutions.Logic.csproj"
dotnet sln add src/Solutions.Logic
```

## Step 3 — Reference the plugin project and build

The solution packages the assembly it registers, so it needs a `ProjectReference`
to the plugin project, and the assembly must be built before registration:

```
dotnet add "src/Solutions.Logic/Solutions.Logic.csproj" reference "src/Plugins.<Name>/Plugins.<Name>.csproj"
dotnet build src/Solutions.Logic
```

## Step 4 — Register the assembly (once per plugin project)

Generate a fresh GUID for `AssemblyId` (`uuidgen`, lowercase).
`PluginProjectRootPath` is relative to the solution project:

```
txc workspace component create pp-plugin-assembly --output "src/Solutions.Logic" --param "AssemblyId=<new-guid>" --param "PluginProjectRootPath=../Plugins.<Name>"
```

## Step 5 — Register the steps

One command per plugin class. `PluginName` is the plugin class name; `Stage` is
`Pre-validation` or `Post-operation`; `SdkMessage` is `Create`, `Update`, or `Delete`:

```
txc workspace component create pp-plugin-assembly-step --output "src/Solutions.Logic" --param "PrimaryEntity=<PublisherPrefix>_<entity>" --param "PluginProjectName=Plugins.<Name>" --param "PluginName=<PluginClassName>" --param "Stage=Pre-validation" --param "SdkMessage=Create"
```

Stage choice: **Pre-validation** runs before the database transaction starts — the
cheapest place to reject bad input with `InvalidPluginExecutionException`.
**Post-operation** runs after the record is written but still inside the transaction,
so the plugin's related writes commit or roll back together with the triggering
record. Match the stage each class was written for.

## Step 6 — Validate

```
dotnet build
```

Must pass at the repository root. `TALXISXSD001` = schema validation failed (fix the
reported XML); `TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 7 — Summary

Report the assembly and steps registered (entity, message, stage per step), that
`Packages.Main` references `Solutions.Logic`, that `dotnet build` passed, and that
nothing was deployed. Next step in one line: cover the plugin logic with local unit
tests (`testing-unit` skill).
