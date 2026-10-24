> **Needed because:** import ordering and failure recovery are not surfaced by txc help.
> **Remove when:** txc surfaces the deploy sequence in help/docs (T12).

# Deploy to an environment

**Contract:** this reference touches the cloud — run it only when the user asked to
deploy or sync. It requires a valid txc profile; it never creates environments
(that is the `environments` reference).

## Step 0 — Verify the profile

```
txc config profile list --format json
txc config profile validate <name>
```

The target profile must exist on this machine — a cached name from another
machine or session is not enough. If missing, route to the `environments` reference
before anything else. Never guess a target; deploy to Dev unless the user named
another environment. Never deploy directly to production — always Dev/Test first.

## Step 1 — Import dependency packages first

Any dependency package — one this repository does not build, e.g. a PCF control's NuGet
package — must already exist in the target environment; importing the repository's own
package first fails Dataverse's missing-dependency check. Example (pulled from nuget.org
by NuGet package name, latest version):

```
txc env pkg import TALXIS.Controls.Grid.Package --profile <profile>
```

## Step 2 — Build the Package Deployer package

```
dotnet publish <package project> -c Release
```

Deliberately no `-o` — an explicit output dir leaks a global `PublishDir` into
nested plugin builds and breaks them (tools-devkit-build#109). The `.pdpkg.zip`
lands at `<package project>/bin/<Configuration>/<project name>.pdpkg.zip` (tooling-backlog
T6; `<package project>` per the `init` skill's `workspace-layout` reference file).
Release packs managed (Test/prod); Debug packs unmanaged (Dev) — use `-c Debug` for
a Dev environment (the command above is Release). The build must be clean — never
deploy a broken build.

## Step 3 — Import the package

```
txc env pkg import <path-to-.pdpkg.zip> --profile <profile>
```

Import order of the Dataverse solutions inside the package is derived from
`ProjectReference`s, so dependencies install first.

**Check that it landed — exit 0 and an empty result prove nothing.** Package Deployer
skips a solution whose version is already installed, and builds outside CI always
stamp the same version (`0.0.20000.0`), so after the first import a changed local
build is skipped without any message (tested: a new column never arrived). Verify the
change itself, e.g. `txc env entity describe <entity>` for a column (right after an
import it can still show the old metadata — once, re-check after a few seconds), and look at the
import record (`txc env deployment list`, then `deployment get` with the run id from
the list; `--latest` can return a child step such as PublishAll).

To push a local change to a Dev environment, import the built solution zip instead —
the zip is written under the Dataverse solution project's `bin/<Configuration>/` (find
it, the target-framework folder name varies):

```
txc env solution import <path-to-solution .zip> --wait --profile <profile>
```

It updates the installed solution in place (`path: update`). Importing the project
folder (`txc env solution import <solution project>`) currently fails looking in a
`net462` output folder (tools-cli#178; fix in PR #179).

## Step 4 — Pull environment edits back to source

After manual portal edits in Dev (security roles, forms, …), pull the unmanaged
layer back into the source tree — this is the bidirectional inner loop, and the
only sanctioned way portal changes reach source control:

```
txc env solution pull <solution project> --profile <profile>
```

`<solution project>` is the **folder** of the solution project (not the `.csproj` file:
"Directory not found") that owns the edited components (resolve it by what it contains, e.g. the solution that holds the roles),
passed as the positional argument; `--output` overrides
the solution root folder it syncs into. It overwrites the files in source with the
environment's state, so a source change that was never pushed is deleted — push or
commit first. A bare solution unique name needs `--output`. `txc env solution clone <name> -o <dir>` (a
new project from an environment's solution) must be run where a solution file is found
(a `.sln`/`.slnx` in or above the working directory), otherwise it fails and leaves a
half-written project (tools-cli#216). Then `git status` to show
what changed: after one environment-side edit, expect exactly that edit (the first pull
after a fresh scaffold also normalises XML formatting, tools-cli#54). Pull
only from Dev — the place where humans edit; pipelines only ship built packages
forward.

## Failure recovery

Diagnose before retrying; never retry more than twice without finding the root
cause.

| Symptom | Action |
|---|---|
| Import failed, unclear why | Check the latest deployment's findings first |
| Component error | Inspect the component's solution layers, resolve the conflict (see `solution-layering`) |
| Missing dependency | Import the dependency package first (Step 1) |
| Version conflict, or import succeeded but nothing changed | Same version installed → skipped (see Step 3): import the solution zip, or raise the version in CI builds |
| Managed/unmanaged mismatch | Dataverse rejects importing managed over unmanaged ("already installed … as an unmanaged solution … attempting to install it in managed mode") — uninstall first or rebuild with the matching configuration |
| Changed a deployed column's type or schema name | Rejected ("Attribute … is a Integer, but a Decimal type was specified") — delete the column in the environment first (`data-model` skill) |
| `Sql Number: 10936` / "request limit for the elastic pool" | Platform throttling; the operation may have applied anyway — check the state, then retry once |
| Timeout / generic | Retry once, check environment health |

## Summary

Report: target profile and URL, packages imported (dependency packages + the repository's own), whether
managed or unmanaged, any solutions pulled back, and the resulting `git status`.
