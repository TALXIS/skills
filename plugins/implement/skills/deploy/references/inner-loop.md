> **Needed because:** the push → verify → pull loop, its traps and the per-component checks are not
> surfaced by txc help; success exit codes do not prove a change landed.
> **Remove when:** `env pkg import` reports what it installed or skipped (TALXIS/tools-cli#213) and
> the build outputs sit in the standard locations (TALXIS/tools-devkit-build#129).

# Inner loop — change, push to Dev, verify, pull back

**Contract:** run this only against the user's own Dev environment and only when the user asked to
deploy or sync (profile first: [environments](environments.md)). A loop ends when the change is
**seen in the environment** — never on an exit code alone.

## 1. Change and build

Change the source with the component skills, then `dotnet build` at the repository root (and
`dotnet test` if the repository has tests). Fix errors before pushing.

## 2. Push

First see what is installed: `txc env solution get <name> --profile <profile>` per Dataverse solution (`env solution list`
returns every solution of the environment, 500+ in a shared one) — a Dataverse
solution of the repository that is already there means "iterating"; earlier deployment runs in
`env deployment list` do not mean it is still installed.

| Situation | Command |
|---|---|
| First install, or several Dataverse solutions changed | `dotnet publish <package project> -c Debug`, then `txc env pkg import <package project>/bin/Debug/<project file name>.pdpkg.zip --profile <profile>` |
| Iterating on a solution that is already installed (the usual case) | `dotnet build <solution project> -c Debug`, then `txc env solution import <zip> --wait --profile <profile>` |

The zip is `<project file name>.zip` in the project's output folder, `<solution project>/bin/Debug/<target framework>/`
(`dotnet msbuild <solution project> -p:Configuration=Debug -getProperty:OutDir` prints the folder; `TargetPath` names a
`.dll` that does not exist). Why the second row: Package Deployer skips every solution whose version is already
installed, and local builds always have the same version, so a changed package imports "successfully" and changes
nothing; `env pkg import` prints nothing on stdout (the log on stderr only says it completed). Debug packs
unmanaged — right for Dev.

**Publish after a solution zip import.** The import stores forms, views, ribbon and app changes but does not make them
live (tested: the form XML in the environment kept the old label until published). Publish just what you changed —
`txc env solution publish --entities <table>[,<table>] --profile <profile>` for forms, views, ribbon and columns of those
tables; plain `txc env solution publish` publishes **all** pending customizations of the environment, other people's
included, and is for apps, sitemaps and web resources that belong to no table. `env pkg import` already publishes
(`env solution import --publish` is in review: tools-cli PR #139).

## 3. Verify it landed

| Changed | Check |
|---|---|
| a column | `txc env entity describe <entity>` lists it with the type (right after an import, once re-check after a few seconds) |
| a table | `txc env entity list --search <prefix>_` |
| a form | `txc env data query odata systemforms --filter "formid eq <form guid>" --select formxml` and look for the field (the `systemform` table through `sql` fails with BadRequest, and `systemforms(<guid>)` returns nothing); if the field is missing, publish (above) |
| model-driven app, role, plugin assembly, plugin step, web resource | `txc env data query sql "SELECT name FROM <appmodule\|role\|pluginassembly\|sdkmessageprocessingstep\|webresource> WHERE name LIKE '<name>%'"` (a step's name ends with `Create of <table>` etc.; filtering `sdkmessagefilter` by table fails with BadRequest) |
| plugin code | the assembly keeps its version, so a name check proves nothing. Test the behaviour: `txc env data record create --entity <table> --data '{…}' --apply` with a value the new code accepts and one it rejects (the rejection message appears in the result), then delete the test record with `env data record delete`. A zip import replaces the DLL at an unchanged version and needs no publish |
| that the import ran at all | `txc env deployment list --since 1h` (package runs are named after the package's last solution), `txc env deployment get --solution-run-id <id>` for findings |

A check that finds nothing means the change did not land: go to the failure table in
[deployment](deployment.md) — do not push again unchanged.

## 4. Pull what was changed in the environment

Push or commit your own changes first: `txc env solution pull <solution project folder> --profile <profile>`
overwrites source with the environment's state, so an unpushed source change is deleted. Then `git diff`: after one
environment-side edit expect exactly that edit; review, then commit.

## 5. Remove or rename a component

Delete it in source (its files and its root-component entry in `Other/Solution.xml`), rebuild, **and** delete it in the
environment — importing a solution never deletes components, and a changed column type or schema name is rejected
until the old column is gone: `txc env entity attribute delete <entity> --name <attr> --apply --yes`,
`txc env entity delete --entity <entity> --apply --yes`, `txc env data record delete <id> --entity <table> --apply --yes`
(roles, apps, plugin assemblies and steps, web resources). Check dependencies first
(`txc env component dependency list|required`, `txc env solution uninstall-check <name>`).

## 6. Reset your Dev objects

`txc env pkg uninstall <package> --yes` (or `env solution delete <name> --yes`) removes only the solution containers of
unmanaged solutions — tables, roles, apps, plugin registrations and web resources stay until deleted as in step 5.
Delete only what you created; never touch solutions you do not own.
