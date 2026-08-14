> **Needed because:** import ordering and failure recovery are not surfaced by txc help.
> **Remove when:** txc surfaces the deploy sequence in help/docs (T12).

# Deploy to an environment

**Contract:** this skill touches the cloud — run it only when the user asked to
deploy or sync. It requires a valid txc profile; it never creates environments
(that is the `environment-setup` skill).

## Step 0 — Verify the profile

```
txc config profile list --format json
```

The target profile must exist on this machine — a cached name from another
machine or session is not enough. If missing, route to `environment-setup`
before anything else. Never guess a target; deploy to Dev unless the user named
another environment. Never deploy directly to production — always Dev/Test first.

## Step 1 — Import dependency packages first

Any external package the app references (e.g. a PCF control) must already exist
in the target environment — importing the app package first fails Dataverse's
missing-dependency check. Example (package pulled from nuget.org by name, latest
version):

```
txc env pkg import TALXIS.Controls.Grid.Package --profile <profile>
```

## Step 2 — Build the deployment package

```
dotnet publish src/Packages.Main/Packages.Main.csproj -c Release
```

Deliberately no `-o` — an explicit output dir leaks a global `PublishDir` into
nested plugin builds and breaks them (tools-devkit-build#109). The `.pdpkg.zip`
lands at `src/Packages.Main/bin/Release/Packages.Main.pdpkg.zip` (tooling-backlog
T6). Release packs managed (Test/prod); Debug packs unmanaged (Dev). The build
must be clean — never deploy a broken build.

## Step 3 — Import the package

```
txc env pkg import <path-to-.pdpkg.zip> --profile <profile>
```

Import order of the solutions inside the package is derived from
`ProjectReference`s, so dependencies install first.

## Step 4 — Pull environment edits back to source

After manual portal edits in Dev (security roles, forms, …), pull the unmanaged
layer back into the source tree — this is the bidirectional inner loop, and the
only sanctioned way portal changes reach source control:

```
txc env solution pull --folder <solution path> --profile <profile>
```

`<solution path>` is the solution's folder in the repo (e.g.
`src/Solutions.Security`). Then `git status -- src/` to show what changed. Pull
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
| Version conflict | Increment the solution version, rebuild, retry |
| Managed/unmanaged mismatch | Dataverse rejects importing managed over unmanaged (or vice versa) — uninstall first or rebuild with the matching configuration |
| Timeout / generic | Retry once, check environment health |

## Summary

Report: target profile and URL, packages imported (dependencies + app), whether
managed or unmanaged, any solutions pulled back, and the resulting `git status`.
