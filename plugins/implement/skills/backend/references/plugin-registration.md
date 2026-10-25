> **Needed because:** the build-registers-the-assembly sequence is not surfaced by txc help,
> and `txc docs get plugin-development` still lists `pp-plugin-assembly` as a registration
> step — which is why the backend skill does not point at it.
> **Remove when:** txc surfaces sequences in help/docs (T12), the `plugin-development` doc
> describes build-generated registration (tools-cli#205), and the `pp-solution`
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

A registration is two files in `<logic solution>` that share one id:
`PluginAssemblies/<AssemblyName>.dll.data.xml` and a type-91 `RootComponent` in
`Other/Solution.xml`. The `GeneratePluginAssembly` property in that solution project's csproj
(template default `true`) decides who writes them:

- **Generated** (`true`): every build writes them for each referenced plugin project.
  It finds an existing `<AssemblyName>.dll.data.xml` by name and reuses its id (it adds
  new classes, never removes any); otherwise it mints a new id. It needs a signed
  assembly with at least one public, non-abstract `IPlugin` class.
- **Manual** (`false`): you scaffold `pp-plugin-assembly` (fresh lowercase GUID as
  `AssemblyId`) after building the plugin project; that solution project's build leaves both files
  alone. Use it only when you need a fixed id. With generation left on, running it
  before the first build of the solution project (plugin project already built) also works: the build
  reuses that id. Never after a generated build has registered the assembly.

**Registering in the wrong order can create duplicates.** Running `pp-plugin-assembly`
after a generated build, renaming the assembly, or editing the id in only one of the two
files leaves two roots, and the next build fails with "root components are not defined
in customizations". Nothing guards against this yet, so after every build that touches
registration, check there is exactly one registration and the ids match (`<logic solution>`
is the Dataverse solution project that holds the registrations: `src/Solutions.Logic` in the
default split, otherwise whichever project holds them):

```
grep -o 'RootComponent type="91" id="[^"]*"' <logic solution>/Other/Solution.xml
grep -o 'PluginAssemblyId="[^"]*"' <logic solution>/PluginAssemblies/*.data.xml
```

**Order:** plugin steps reference the assembly, so scaffold `pp-plugin-assembly-step` only
after the registration exists (after the first build in generated mode).

**Retrofitting an existing Dataverse solution:** if it already holds the registration, leave
generation on — the build reuses the existing id by file name. If the assembly already
lives in an environment under another id, set that id in both files before the first
build. Run the checks above before and after.

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

The solution project packages the assembly it registers, so it needs a `ProjectReference`
to the plugin project. The build then generates the registration (see "How
registration works"):

```
dotnet add "src/Solutions.Logic/Solutions.Logic.csproj" reference "src/Plugins.<Name>/Plugins.<Name>.csproj"
dotnet build src/Solutions.Logic
```

## Step 4 — Register the plugin steps

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
