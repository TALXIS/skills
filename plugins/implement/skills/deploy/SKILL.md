---
name: deploy
description: Ships a TALXIS / Power Platform / Dataverse app — connects environments, builds the deployable package, deploys it, pulls remote changes back, and sets up the release pipeline. Use when creating or connecting an environment, deploying, releasing, or automating CI/CD.
---

# Deploy

**Contract:** this is the one skill that touches the cloud — creating and
connecting environments, and importing packages. Deploy only when the user asked.
Everything else in this workspace stays local-first: build components locally and
deploy them; never edit a live environment as a substitute for local work.

## Ask the CLI first

```
txc config --help                # auth, connections, profiles
txc environment --help           # live-environment operations
txc docs get deployment-workflow # long-form guide
txc docs get solution-layering   # managed/unmanaged doctrine
```

## Connect an environment

Bootstrap order is fixed: **auth → connection → profile → select**
(`txc config auth login`, `txc config connection create`,
`txc config profile create`, `txc config profile select`). Verify with
`txc config profile validate` before any environment operation. Environments are
cheap and ephemeral — source control is the source of truth; never share a dev
environment between people.

## Build the artifact

`dotnet build` validates; publishing the deployment package project in
**Release** packs **managed** solutions (test/prod), **Debug** packs
**unmanaged** (dev). The package artifact is a single deployable zip composing
all referenced solutions in dependency order.

## Deploy and round-trip

1. Import dependency packages first (e.g. a packaged UI control the app
   references), then the app package: `txc environment package import`.
2. After edits made directly in a live dev environment, pull them back into
   source: `txc environment solution pull` — then commit. Data packages
   round-trip the same way (`txc data package export` / `import`).
3. On failure: check the latest deployment record, then component layers, then
   missing dependencies — never retry more than twice without diagnosing.

## Invariants

- Production contains **managed** solutions only; the unmanaged working state
  lives in dev and in source control.
- A managed package cannot overwrite an existing unmanaged solution (or vice
  versa) — uninstall first.
- Never add `--force-overwrite` (on solution import — it overwrites others'
  in-progress unmanaged work) or `--allow-production` (on environment commands —
  it drops the production guardrail) to make a failing command "just work". Use
  either only when the user explicitly asked for that outcome in the current
  conversation; otherwise diagnose the failure.
- Import success is not verification: an import can succeed with the changed
  component silently absent. Verify a shipped change by querying the live
  content (Web API or `txc environment data query`) and comparing the actual
  value — never by import-job status or the solution's presence alone.
- CI/CD uses OIDC federation — identifiers only, no stored secrets
  ([references/ci-cd.md](references/ci-cd.md)).

Details: [references/](references/) — environments, build, deployment, layering,
ci-cd (+ workflow, ruleset, and application-user templates)
