---
name: ribbon
description: Adds a custom ribbon (command bar) button to an entity form or grid with txc, backed by a script library function, and passes the form context via a CrmPrimaryControl command parameter. Use when adding a ribbon button, command bar action, or custom command to a table in a TALXIS workspace.
---

# Ribbon buttons

**Contract:** when this skill ends, the ribbon customization exists under
`src/Solutions.UI` and `dotnet build` passes at the repository root. Local only —
nothing is deployed.

Prerequisite: the script library exists and **builds** — the button invokes a function
in the deployed bundle, so create the function (see the `form-scripts` skill) and run
`dotnet build src/Scripts.UI` successfully before scaffolding the button.

## Create the button

```
txc workspace component create pp-ribbon-button --output src/Solutions.UI \
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
txc workspace component create pp-ribbon-command-parameter --output src/Solutions.UI \
  --param "EntityLogicalName=<prefix>_<entity>" \
  --param "PublisherPrefix=<prefix>" \
  --param "ParameterType=CrmPrimaryControl" \
  --param "FunctionName=MyScripts.RibbonActions.<functionName>" \
  --param "ButtonLogicalName=<buttonlabel>"
```

`ButtonLogicalName` is the button's label lowercased with spaces removed (e.g.
"Check Stock Levels" → `checkstocklevels`); `FunctionName` must match the button's
`FunctionName` exactly so the parameter attaches to the right command.

## Validate

```
dotnet build
```

Must pass at the repository root — it schema-validates the RibbonDiff XML and
rebuilds the script bundle the button depends on.
