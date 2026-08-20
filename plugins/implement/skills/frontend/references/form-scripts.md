> **Needed because:** the library/handler wiring sequence is not surfaced by txc help.
> **Remove when:** txc surfaces sequences in help/docs (T12).

# Form scripts

**Contract:** when this skill ends, `src/Scripts.UI` builds a JS bundle, the event
handlers are registered in the form XML, and `dotnet build` passes at the repository
root. Local only — nothing is deployed.

Prerequisite: the target form exists and you have its GUID (see the `forms` skill).

## Create the script library (once per workspace)

```
txc workspace component create pp-script-library \
  --param "LibraryName=main" \
  --param "PublisherPrefix=<prefix>" \
  --output "src/Scripts.UI"

dotnet sln add src/Scripts.UI
```

This scaffolds a TypeScript project compiled by `dotnet build` (rollup under the
hood). The bundle output is `src/Scripts.UI/build/<prefix>_main.js`, deployed as the
web resource `<prefix>_main.js`.

Reference it from the UI solution so the web resource ships with it:

```
dotnet add src/Solutions.UI reference src/Scripts.UI/Scripts.UI.csproj
```

(Both paths relative to the repository root; `dotnet` stores the correct relative
`ProjectReference` in the csproj.)

## Write the handlers

The rollup entry point is `src/Scripts.UI/src/index.ts`. Export the handlers through
a namespace object, e.g. `MyScripts.EntityForm.onLoad(executionContext)`. The UMD
global `name` in `src/Scripts.UI/rollup.config.mjs` defaults to `<prefix>_main` —
it must equal the first segment of every `FunctionName` you register below, so either
set it to your namespace (e.g. `MyScripts`) or name your functions
`<prefix>_main.<...>`.

Build the library — this is also the validation loop for the TypeScript:

```
dotnet build src/Scripts.UI
```

## Register event handlers

**onLoad** (form-level):

```
txc workspace component create pp-form-event-handler --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=<form-guid>" \
  --param "EntityLogicalName=<prefix>_<entity>" \
  --param "LibraryName=<prefix>_main" \
  --param "FunctionName=MyScripts.EntityForm.onLoad" \
  --param "EventType=onload"
```

**onChange** (field-level — adds `AttributeName`):

```
txc workspace component create pp-form-event-handler --output src/Solutions.UI \
  --param "FormType=main" \
  --param "FormId=<form-guid>" \
  --param "EntityLogicalName=<prefix>_<entity>" \
  --param "LibraryName=<prefix>_main" \
  --param "FunctionName=MyScripts.EntityForm.onFieldChange" \
  --param "EventType=onchange" \
  --param "AttributeName=<prefix>_<attribute>"
```

`FunctionName` is the fully qualified path from the UMD global
(`<Namespace>.<Object>.<function>`); `LibraryName` is the web resource name without
the `.js` extension.

## Validate

```
dotnet build
```

Must pass at the repository root: compiles the TypeScript, bundles the web resource,
and schema-validates the form XML with the new handlers.
