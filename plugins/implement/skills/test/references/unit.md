> **Needed because:** the test scaffold requires a manual workaround, the wiring is
> not surfaced by txc help, and both `pp-plugin-test` and `pp-test-script` are
> invisible to `txc component type list` (they're `dotnet new` templates, not
> component-type enum entries).
> **Remove when:** pp-plugin-test template Cleanup is fixed (T5), sequences land in
> help/docs (T12), and txc exposes its own project-level templates through a
> discovery command (T17).

# Unit tests for plugins and scripts

**Contract:** when this skill ends, the requested test projects exist and
`dotnet test` passes on each. Everything runs in-process on the local machine —
FakeXrmEasy fakes the Dataverse pipeline in memory and Jest mocks `Xrm`; no
environment is contacted and nothing is deployed.

Two independent layers — scaffold only the ones the repository needs:

- **Tests.Plugins** — plugin logic tested as plain C# against FakeXrmEasy 3.x.
  Requires an existing plugin project (`plugin-development` skill).
- **Tests.Scripts** — form/ribbon scripts tested as plain JavaScript; Jest loads the
  built web-resource bundle, and `dotnet test` drives Jest via the csproj's `RunJest`
  target. Requires an existing `Scripts.UI` project.

## Plugin tests — Step 1: scaffold (first time only)

`pp-plugin-test` is a `dotnet new` project scaffold — `txc component type list
--search test` returns nothing; `dotnet new list | grep -i "power platform: plugin
test"` finds it.

Skip if `src/Tests.Plugins/Tests.Plugins.csproj` exists. From the repository root,
pre-create `.template.temp` first — the `pp-plugin-test` template's Cleanup
post-action fails and rolls the whole scaffold back when it is missing
(TOOLING-BACKLOG T5):

```
mkdir -p src/Tests.Plugins/.template.temp
txc workspace component create pp-plugin-test --output "src/Tests.Plugins"
dotnet sln add src/Tests.Plugins
```

## Plugin tests — Step 2: reference the plugin project

The test project targets modern .NET while the plugin assembly stays `net462` (the
Dataverse sandbox is .NET Framework — never retarget either side). `dotnet add
reference` refuses to link across that gap, so add the `ProjectReference` to
`src/Tests.Plugins/Tests.Plugins.csproj` by editing the XML directly:

```xml
<ItemGroup>
  <ProjectReference Include="../Plugins.<Name>/Plugins.<Name>.csproj" />
</ItemGroup>
```

The build itself resolves this fine via asset target fallback and prints **NU1702**
("resolved using .NETFramework... instead of...") — that warning is expected and
benign; do not "fix" it.

## Plugin tests — Step 3: write tests

One `<PluginClassName>Tests.cs` per plugin class in `src/Tests.Plugins/`. Pattern:
build an `IXrmFakedContext`, seed records with `Initialize`, execute the plugin with
`ExecutePluginWithTarget`, assert on the faked data or on the thrown
`InvalidPluginExecutionException`. Attribute logical names carry the
`<PublisherPrefix>_` prefix.

## Plugin tests — Step 4: run

```
dotnet test src/Tests.Plugins/Tests.Plugins.csproj --nologo
```

Must pass. This is the edit-run loop: change plugin or test, re-run.

## Script tests — Step 1: scaffold (first time only)

`pp-test-script` is also a `dotnet new` project scaffold, not a component type —
`dotnet new list | grep -i "power platform: script test"` finds it.

Skip if `src/Tests.Scripts` exists. `ScriptLibraryPath` points at the bundle
`Scripts.UI` builds — the same file that ships as the web resource is the file under
test:

```
txc workspace component create pp-test-script --output "src/Tests.Scripts" --param "ScriptTestProjectName=Tests.Scripts" --param "ScriptLibraryPath=../Scripts.UI/build/<PublisherPrefix>_main.js"
dotnet sln add src/Tests.Scripts
```

## Script tests — Step 2: write tests

Test files go in `src/Tests.Scripts/tests/*.test.js`. Assign the `Xrm` functions a
test relies on as `jest.fn()` explicitly in `beforeEach` — Jest 30 does not expose
`global.jest` to the template's `setupXrm`.

## Script tests — Step 3: run

The bundle must exist before the tests can load it:

```
dotnet build src/Scripts.UI/Scripts.UI.csproj --nologo
dotnet test src/Tests.Scripts/Tests.Scripts.csproj --nologo
```

Must pass — `dotnet test` invokes Jest through the `RunJest` target, so one command
covers both C# and JS suites in CI and locally.

## Summary

Report the test projects and test files created, that each `dotnet test` passed
(including the expected NU1702 warning if plugin tests were scaffolded), and that
everything ran locally with no environment touched.
