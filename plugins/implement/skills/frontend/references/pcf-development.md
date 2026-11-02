> **Needed because:** the build never raises the control's own version, a solution import reports `Succeeded`
> when it skips the control (TALXIS/tools-cli#250), and the steps after `pp-pcf` are not surfaced by txc help.
> **Remove when:** the build stamps the control version (T29), import reports a skipped control
> (TALXIS/tools-cli#250), and txc surfaces sequences in help/docs (T12).

# Build your own PCF control

**Contract:** when this task ends, the control project exists, `<ui solution>` references it, `dotnet build`
passes, and the control works in the local harness. Nothing is deployed — section 5 runs only when the user
asks for it.

To put a control someone else ships (e.g. the TALXIS Grid) on a form, use [pcf-controls](pcf-controls.md).

## 1. Scaffold

```
txc docs get pcf-controls                         # field vs dataset control, lifecycle, what not to do
txc workspace component parameter list pp-pcf
txc workspace component create pp-pcf --output "src/Controls.<Name>" --param "Name=<Name>" --param "Namespace=<Namespace>"
dotnet add "<ui solution>" reference "src/Controls.<Name>/<Name>.csproj"
```

- The parent folder of `--output` must exist, or txc stops with "Parent directory does not exist".
- Check: `<Name>.csproj` has `<ProjectType>Pcf</ProjectType>`, and `<Name>/ControlManifest.Input.xml` exists.
  A `.template.scripts/` folder left behind means the cleanup step did not run — delete it.
- The control lands in the solution at build time through the `ProjectReference`; `Solution.xml` needs no edit.

## 2. Build the UI from TALXIS base controls

Before writing any UI piece by hand, check whether `@talxis/base-controls` already has it. It has a control for
each field type (text, number, date, choice, lookup, ...) plus grids, forms, a ribbon and notifications, all
styled like the rest of the app. The full list, with live examples, is at
[talxis.github.io/base-controls](https://talxis.github.io/base-controls).

Tips for the common cases:

| You need | Use |
|---|---|
| a grid over a query or a view | the dataset base control with the `FetchXml` data provider |
| a grid over rows you build in code | the same control with `DataProvider: { raw: 'Memory' }` — `EntityMetadata` must carry `PrimaryIdAttribute` |
| fields that read and save like a form | `XrmForm` |

Keep `@talxis/client-libraries` at the same exact version as the one `@talxis/base-controls` uses. Two copies
fail the build with "separate declarations of a private property".

## 3. Work in the local harness first

Run the harness (`npm start` in the control folder) for layout, styling, breakpoints and behaviour. It reloads in
seconds; one deploy to an environment costs about 5 minutes (section 5). Give the control mock data
(`mock/` in the control folder) so data-shaped work can be done here too. Go to an environment only for what needs
live Dataverse, and batch those checks into one deploy.

- The harness sets the control's width (Component Container Width). Use it to test phone widths — not
  browser device emulation.
- If the harness serves once and then dies, read its output: `ENOSPC: System limit for number of file watchers`
  means other processes hold the watches. Either build once and serve `out/` without watching, or ask the user to
  raise `fs.inotify.max_user_watches`.
- Do not run `npm run build` while the harness is running — both write to `out/`.
- `pcf-scripts` runs ESLint as part of the build: a lint error fails the build, and so does a disable
  comment for a rule the config does not load.

## 4. Build

`dotnet build` at the repository root builds the control with the solution. `-c Release` makes a minified
bundle. Delete the control's `out/` folder before a build you will deploy — the solution can pick up an old
bundle from there (a leftover development bundle was rejected on import as "Webresource content size is too big").

## 5. Deploy and check it (only when the user asked)

Follow [deploy → inner-loop](../../deploy/references/inner-loop.md). A control needs these extra steps:

1. **Raise the control version** in `ControlManifest.Input.xml` (`<control version>`) above the one in the
   environment, and the `<resx version>` of any changed strings file. The build does not do it. If the version
   is not higher, the import reports `Succeeded` but keeps the old control (TALXIS/tools-cli#250). Check the
   installed control first:
   `txc env data query odata "customcontrols?$select=name,version,modifiedon&$filter=contains(name,'<Name>')" --profile <profile>`
   If CI stamps versions, revert these bumps after the deploy; do not commit them.
2. **Import with `--force-overwrite --wait`.** Without it, SmartDiff can skip the new bundle.
   If the solution is already installed as managed, import managed too — Dataverse refuses to mix modes
   ("Import can only update solutions when the modes match").
3. **Publish**: `txc env solution publish --profile <profile>`. Without it the old bundle can still be served.
4. **Check it landed**: run the query from step 1 again — `modifiedon` must move to now. The `version` column
   there is assigned by Dataverse and proves nothing.
5. **If the browser still shows the old control**, it is the browser's cache, not the deploy. Fetch the bundle URL
   with a random query string (`?cb=1`): new code there means a stale browser. To clear it, run this from a page on
   the environment's origin, then reload:

   ```js
   for (const k of await caches.keys()) if (/WebResources|CDN_Resources|mainaspx|clientsdk|uci-state/.test(k)) await caches.delete(k);
   for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
   ```

   Strings showing as raw keys, or in the previous UI language, have the same cause and the same fix. A raised
   `<resx version>` also clears them.
