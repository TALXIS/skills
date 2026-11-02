> **Needed because:** the button/command-parameter sequence is not surfaced by txc help; there is no template for
> the app header (global) ribbon, and the build silently drops it without a placeholder.
> **Remove when:** txc surfaces sequences in help/docs (T12), a global ribbon template ships
> (TALXIS/tools-devkit-templates#91) and the build packs `RibbonCustomization.xml` without a placeholder
> (TALXIS/tools-devkit-build#141).

# Ribbon buttons

**Contract:** when this task ends, the ribbon customization exists under
`<ui solution>` and `dotnet build` passes at the repository root. Local only —
nothing is deployed.

Prerequisite: the script library (`<scripts project>`) exists and **builds** — the button
invokes a function in the deployed bundle, so create the function (see the `form-scripts`
reference) and run
`dotnet build "<scripts project>"` successfully before scaffolding the button.

## Create the button

```
txc workspace component create pp-ribbon-button --output "<ui solution>" \
  --param "Location=Form" \
  --param "EntityLogicalName=<prefix>_<entity>" \
  --param "ButtonLabel=<Button Label>" \
  --param "PublisherPrefix=<prefix>" \
  --param "LibraryLogicalName=<prefix>_main.js" \
  --param "FunctionName=MyScripts.RibbonActions.<functionName>" \
  --param "Sequence=31" \
  --param "TemplateAlias=o1"
```

- `Location=Form` puts the button on the record form's command bar.
- `LibraryLogicalName` is the web resource name **with** the `.js` extension
  (unlike `LibraryName` on event handlers).
- `FunctionName` is the fully qualified path from the script bundle's UMD global.
- `Sequence` orders the button among existing ones (out-of-box buttons use
  multiples of 10; 31 lands after the third slot).
- `TemplateAlias=o1` renders it as a standard overflow-capable button.

## Pass the form context

Without a command parameter the function is called with no arguments. Add
`CrmPrimaryControl` so it receives the form context as its first parameter:

```
txc workspace component create pp-ribbon-command-parameter --output "<ui solution>" \
  --param "EntityLogicalName=<prefix>_<entity>" \
  --param "PublisherPrefix=<prefix>" \
  --param "ParameterType=CrmPrimaryControl" \
  --param "FunctionName=MyScripts.RibbonActions.<functionName>" \
  --param "ButtonLogicalName=<buttonlabel>"
```

`ButtonLogicalName` is the button's label lowercased with spaces removed (e.g.
"Open Summary" → `opensummary`); `FunctionName` must match the button's
`FunctionName` exactly so the parameter attaches to the right command.

## Validate

```
dotnet build
```

Must pass at the repository root — it schema-validates the RibbonDiff XML and
rebuilds the script bundle the button depends on.

## App header buttons (global ribbon)

The buttons in the app's top bar (search, new record, advanced find, ...) belong to no table, and no template
covers them yet. **A change here applies to every model-driven app in the environment**, not only yours — tell
the user before you hide anything.

**1. Find the real button ids** (needs a profile; read-only):

```
txc env data query odata ribbondiffs --filter "contains(tabid,'GlobalTab')" --select "tabid,diffid,difftype,rdx" --profile <profile>
```

The row with `diffid` "Global Tab" holds the whole built-in app header in `rdx`, with every button id
(e.g. `Mscrm.GlobalTab.Tools.AdvancedFind`). Do not guess ids — a wrong one hides nothing and raises no error.

**2. Write `<ui solution>/Other/RibbonCustomization.xml`** — example hiding one button:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RibbonDiffXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CustomActions>
    <HideCustomAction HideActionId="<prefix>.GlobalTab.Tools.AdvancedFind.Hide" Location="Mscrm.GlobalTab.Tools.AdvancedFind" />
  </CustomActions>
  <Templates>
    <RibbonTemplates Id="Mscrm.Templates"></RibbonTemplates>
  </Templates>
  <CommandDefinitions />
  <RuleDefinitions>
    <TabDisplayRules />
    <DisplayRules />
    <EnableRules />
  </RuleDefinitions>
  <LocLabels />
</RibbonDiffXml>
```

**3. Register it — both are needed:**

- `Other/Solution.xml`, inside `<RootComponents>`: `<RootComponent type="50" schemaName=":RibbonDiffXml" behavior="0" />`
- `Other/Customizations.xml`: an empty `<RibbonDiffXml />` element at the top level (e.g. after `<AppModules />`).

Without the placeholder the build passes but leaves the ribbon out of the solution zip
(TALXIS/tools-devkit-build#141). Without the root component the build fails ("RootComponent validation failed").

**4. Check the zip**, not only the build:

```
dotnet build "<ui solution>"
unzip -p "<ui solution>"/bin/Debug/net462/*.zip customizations.xml | grep HideCustomAction
```

No match means the ribbon was dropped — check step 3.
