> **Needed because:** managed/unmanaged doctrine and destructive-vs-safe semantics are invisible in txc help.
> **Remove when:** destructive/read-only annotations reach --help (T13) and doctrine lands in help/docs (T12).

# Solution layering and routing

**Contract:** a decision skill — routing and triage rules only. Local inspection
is free; layer inspection needs a live environment and a valid profile.

## Managed vs unmanaged doctrine

- **Unmanaged** = the open, editable working state of a Dev environment. Debug
  builds pack unmanaged.
- **Managed** = sealed, layered artifacts for every downstream environment: they
  merge as diff layers, can be cleanly uninstalled, and managed properties can
  restrict edits. Release builds pack managed.
- **Production never contains unmanaged components.** Humans edit only in Dev
  (and those edits are pulled back to source with `txc env solution pull`);
  pipelines only ever ship built packages forward.
- Never move unmanaged solutions between environments — managed is the transport
  format.

| Target | Import |
|---|---|
| Dev | unmanaged (Debug build) |
| Test/UAT | managed (Release build) |
| Production | managed only — never unmanaged |
| Unsure | ask the user; default to managed for safety |

## Component-to-solution routing

One solution per concern — never one mega-solution (slow deploys, merge
conflicts, unclear ownership) and never schema changes in UI diffs.

| Component | Solution |
|---|---|
| Table, column, relationship, option set | `Solutions.DataModel` |
| Plugin, workflow, business rule | `Solutions.Logic` |
| Form, view, model-driven app, sitemap | `Solutions.UI` |
| Security role, field-level security | `Solutions.Security` |
| Unsure | `txc workspace explain` — inspect the workspace and follow the repo's own convention |

If the repository already uses different solution names, its convention wins —
route by concern into the existing structure, do not invent new solutions.

## Layer conflict triage

When a deployed component behaves unexpectedly, list its solution layers in the
environment and read them top-down:

- **Multiple managed layers** → the topmost managed layer wins; fix by updating
  the solution that owns that layer, not the one underneath.
- **Unmanaged active layer on top** → it blocks managed updates from showing;
  remove the active customization, then re-verify.
- **Single layer but still wrong** → the import likely succeeded without a
  publish — publish customizations and re-check before touching layers.

Layer inspection is live-environment only — the local workspace has no layer
concept.

## Uninstall safety

Before uninstalling any solution, check its dependencies first; resolve them
before removing. If a data-loss warning appears, get explicit user confirmation.
Never uninstall in production without checking.
