---
name: build-and-validate
description: Runs the local dotnet build validation loop for a TALXIS workspace and produces the deployable .pdpkg.zip via dotnet publish. Use when validating changes, fixing TALXISXSD001 or TALXISGUID001 build errors, packaging for deployment, or deciding whether work belongs in the local workspace or a live environment.
---

# Build and validate locally

**Contract:** local only — no cloud environment is touched. When this skill ends,
`dotnet build` passes at the repository root, and if a package was requested, the
`.pdpkg.zip` path is reported.

## Local-first routing

Creating or changing components (tables, columns, forms, plugins, roles) is
**always** local: scaffold in the workspace, validate with `dotnet build`. Never
edit the live environment for development — those changes are not in source
control, and local is instant while environment operations take 30s–5min. The
only exception: the user explicitly says "on the live environment" (or a
troubleshooting quick fix in dev). Deploying and data operations are inherently
live — see the `deploy` skill.

## The validation loop

```
dotnet build
```

This is the universal check after every change. It compiles the workspace and
runs TALXIS validation (XSD schema conformance, GUID uniqueness). Known errors:

| Code | Meaning | Fix |
|---|---|---|
| `TALXISXSD001` | Schema validation failed | Fix the reported XML file at the reported line |
| `TALXISGUID001` | Duplicate GUID | Regenerate the reported id so it is unique |

Never deploy a broken build — import-time errors are the slow way to find what
`dotnet build` reports in seconds.

## Debug vs Release

- **Debug** packs solutions **unmanaged** — for Dev environments (editable,
  iterative working state).
- **Release** packs solutions **managed** — for Test/UAT/production (sealed,
  layered, cleanly uninstallable).

Never import a Release (managed) package over an existing unmanaged solution or
vice versa — Dataverse rejects it; uninstall first or rebuild with the matching
configuration.

## Producing the deployable package

```
dotnet publish src/Packages.Main/Packages.Main.csproj -c Release
```

Do not pass `-o`: an explicit output dir sets a global `PublishDir` that leaks
into nested plugin project builds and breaks their auto-publish step
(tools-devkit-build#109).

Current quirk (tooling-backlog T6): the `.pdpkg.zip` lands next to the project,
not in the publish output — find it at:

```
src/Packages.Main/bin/Release/Packages.Main.pdpkg.zip
```

(In CI the same applies — publish, then copy from `src/Packages.Main/bin/Release/`
into the artifact drop.)

## Summary

Report: build result, any error codes fixed, and — if packaged — the absolute
`.pdpkg.zip` path and whether it is managed (Release) or unmanaged (Debug).
