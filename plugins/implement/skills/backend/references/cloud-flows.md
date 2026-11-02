> **Needed because:** `pp-flow` writes files the build cannot find (TALXIS/tools-devkit-templates#104 is back in
> templates 1.23.3), scaffolds the flow as activated (TALXIS/tools-devkit-templates#190), txc has no connection
> reference template yet, and the designer → pull loop and the steps after an import are not surfaced by txc.
> **Remove when:** those two template issues are fixed, `pp-connection-reference` (TALXIS/tools-devkit-templates#176)
> ships with txc, a solution import binds connection references and turns flows on (T30), and txc surfaces
> sequences in help/docs (T12).

# Cloud flows in source

**Contract:** when this task ends, the flow's `.json` and `.json.data.xml` are in `<logic solution>/Workflows`, the
flow is a root component in `Solution.xml`, and `dotnet build` passes. The flow's logic is built in the designer of
the user's Dev environment (section 3), so ask before touching an environment.

## 1. Create the flow in source

Either scaffold an empty flow here, or create it in the designer inside the solution and skip to section 3's pull.

```
txc workspace component parameter list pp-flow
txc workspace component create pp-flow --output "<logic solution>" --param "PublisherPrefix=<prefix>" --param "LogicalName=<name>"
```

Check:

- The two files in `Workflows/` start with `<prefix>_<name>-<guid>`. If they start with `__publisher-prefix___`,
  rename them to `<prefix>_` — the build looks for the name in `<JsonFileName>` of the `.data.xml` and fails with
  "Cannot find required file".
- `Other/Solution.xml` has `<RootComponent type="29" id="{<guid>}" …/>`.
- The flow is scaffolded **on** (`<StateCode>1</StateCode>`). A flow that should not run right after import gets
  `0` / `1` (draft).

## 2. Connect it to Dataverse or other connectors

A flow reaches a connector through a **connection reference** in the solution, never through a connection id.
Reuse one the repository already has (search `Customizations.xml` for `connectionreference`). txc cannot scaffold
a new one yet: create it in the solution in the environment and pull it with the flow (section 3).

## 3. Build the logic in the designer, then pull

Do not write the flow definition by hand — the designer validates it as you build, `dotnet build` does not.

1. Push the solution to the user's Dev environment ([deploy → inner-loop](../../deploy/references/inner-loop.md)).
2. Open the flow from the solution in the environment, build and test it in the designer, save.
3. Pull it back: inner-loop step 4 (`txc env solution pull`). Review `git diff` — expect changes only under
   `Workflows/` (and `Customizations.xml` for a new connection reference) — then `dotnet build`.

If a small fix in the `.json` cannot wait for the designer (a typo in a name, a note that is too long), keep it
small and keep these rules:

- Action notes and descriptions stay under 256 characters, or the import fails.
- Every `runAfter`, `@outputs('<Action>')` and `@body('<Action>')` names an action that exists, spelled exactly.
- Keep the graph drawable: the designers hide steps they cannot lay out, without a warning. Fork from one step,
  join all branches of that fork at once, and never run a step after the middle of a branch that joins later.

## 4. Deploy and check it (only when the user asked)

Follow [deploy → inner-loop](../../deploy/references/inner-loop.md). Flows add these points:

1. **Layers decide which copy runs.** An unmanaged copy of the flow in the environment (built there, or imported
   unmanaged) sits above a managed import and keeps running instead of it. Whether to deploy managed or unmanaged,
   and whether to remove an unmanaged copy, is the user's call — say what is in the environment and ask.
2. **A `Solution.xml` copied from an export** can keep `<MissingDependency>` entries for the connection reference.
   Delete them once the reference is defined in your own `Customizations.xml`, or the import fails with
   "Some dependencies are missing".
3. **After the first import, bind the connection.** The connection reference can arrive with no connection
   (`connectionid` is empty) while the flow already shows as on. Set the connection on the connection reference,
   then turn each flow off and on again — child flows first, then the flows that call them.
4. **Check it ran** by looking at the data the flow should have changed, not only at the flow's state.
