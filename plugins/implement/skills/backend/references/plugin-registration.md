> **Needed because:** the build-registers-the-assembly sequence is not surfaced by txc help.
> **Remove when:** txc surfaces sequences in help/docs (T12), and the `pp-solution`
> template describes its `GeneratePluginAssembly` parameter (tools-devkit-templates#106).

# Register plugin assemblies and steps

**Contract:** when this skill ends, `src/Solutions.Logic` contains the assembly
registration and one step per plugin, and `dotnet build` passes at the repository
root. Local only — nothing is deployed and no cloud environment is touched.

The split is deliberate: the plugin project holds the code, `Solutions.Logic` holds
the registration. The assembly is a build artifact; when and where it runs is
Dataverse configuration — each belongs to its own project. The plugin project must
already exist and build (see the `plugin-development` skill).

## How registration works

An assembly registration is two files in `Solutions.Logic` that must agree on one id:
`PluginAssemblies/<AssemblyName>.dll.data.xml` (the `PluginAssemblyId` and the list of
plugin classes) and a type-91 `RootComponent` with that same id in `Other/Solution.xml`.
A root without its data file, or two roots for one assembly, fails the build with
"root components are not defined in customizations".

Two ways to produce them, chosen by the MSBuild property `GeneratePluginAssembly` in
`Solutions.Logic.csproj` (the `pp-solution` template sets it; its default is `true`):

| Mode | Who writes the registration | Use when |
|---|---|---|
| **Generated** (`true`, default) | Every build of `Solutions.Logic`, for each referenced plugin project | New work, and any solution that does not need a fixed id |
| **Manual** (`false`) | You, with `pp-plugin-assembly`, after building the plugin project (it needs the built DLL) and with a fresh lowercase GUID as `AssemblyId`; the solution build leaves both files alone | You must control the id or the file contents by hand |

How the generated build behaves:

- It looks for `PluginAssemblies/**/<AssemblyName>.dll.data.xml` (`AssemblyName` from the
  plugin csproj, else the project file name). Found: it **reuses that file's id** and
  adds an entry for each new plugin class — it never removes entries, so delete a
  removed class's `PluginType` by hand. Not found: it creates the file with a new GUID
  and adds the root.
- The root is matched by id alone, so the data file and the root can drift apart.
- It fails with "Plugins not found" if the assembly has no public, non-abstract `IPlugin`
  class, and needs a strong-name-signed assembly (the template's `.snk`).

**Order:** build before steps. Steps reference the assembly, so scaffold
`pp-plugin-assembly-step` only after the registration exists — after the first build
in generated mode, after `pp-plugin-assembly` in manual mode.

## Avoiding duplicate registrations

Each of these leaves two roots, or a root with no data file:

- running `pp-plugin-assembly` in a **generated** solution (it writes a new GUID next to
  the one the build made) — pick one mode and stay in it;
- editing the id in only one of the two files;
- renaming the assembly — a new name is a new data file and a new GUID, so remove the
  old file and root, or keep `AssemblyName` stable;
- a data file not named `<AssemblyName>.dll.data.xml`, which the build cannot find and
  so registers again.

Before and after any change to registration, check the two agree:

```
grep -o 'RootComponent type="91" id="[^"]*"' src/Solutions.Logic/Other/Solution.xml
grep -o 'PluginAssemblyId="[^"]*"' src/Solutions.Logic/PluginAssemblies/*.data.xml
```

## Adding registration to an existing solution

- **The solution already holds the registration** (from `solution pull` or an earlier
  manual setup): leave generation on. The build finds the data file by name, reuses its
  id and adds new classes — no second root. Switching a manual solution to generated
  is just removing `GeneratePluginAssembly=false`. Run the two checks above first.
- **The assembly already lives in an environment under an id the source doesn't have:**
  Dataverse matches components by id, so set that id in both files before the first
  build (or create the manual registration with that `AssemblyId`). Do not let the build
  mint a new one.
- **Nothing registered yet:** the generated mode above — reference the plugin project and
  build; don't scaffold the assembly by hand.

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
to the plugin project. The build then generates the registration (see "How
registration works"); for manual mode, create `Solutions.Logic` with
`GeneratePluginAssembly=false` instead and follow the manual row:

```
dotnet add "src/Solutions.Logic/Solutions.Logic.csproj" reference "src/Plugins.<Name>/Plugins.<Name>.csproj"
dotnet build src/Solutions.Logic
```

## Step 4 — Register the steps

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

## Step 5 — Validate

```
dotnet build
```

Must pass at the repository root. `TALXISXSD001` = schema validation failed (fix the
reported XML); `TALXISGUID001` = duplicate GUID (regenerate the reported id).

## Step 6 — Summary

Report the assembly and steps registered (entity, message, stage per step), that
`Packages.Main` references `Solutions.Logic`, that `dotnet build` passed, and that
nothing was deployed. Next step in one line: cover the plugin logic with local unit
tests (`testing-unit` skill).
