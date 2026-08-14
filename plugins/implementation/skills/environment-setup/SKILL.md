---
name: environment-setup
description: Creates or connects Dataverse environments and wires txc auth, connection, and profile so deploys have a target. Use when provisioning a Dev or Test environment, connecting to an existing environment, signing in to Power Platform, or when a deploy fails because no txc profile exists.
---

# Set up runtime environments

**Contract:** this is the one implementation skill that touches the cloud — it
creates or connects environments and binds txc profiles to them. Every other
implementation skill is local; deployment itself is the `deploy` skill.

Source control is the single source of truth, so environments are cheap and
ephemeral: recreate rather than repair. Dev is a personal build-and-break space;
Test is the stable target the CD pipeline deploys to. **Never share a Dev
environment between developers** — parallel unmanaged edits overwrite each other
and ownership of changes gets lost.

## Step 1 — Check what already exists

```
txc config auth list --format json
txc config connection list --format json
txc config profile list --format json
```

- A profile whose connection points at the desired environment URL → nothing to
  create; `txc config profile select <profile>` and report. Done.
- Auth exists but no connection/profile → skip to Step 4.
- No auth → Step 2.

## Step 2 — Sign in (only if no auth exists)

```
txc config auth login --device-code
```

Device-code flow: a code is shown, the user opens https://aka.ms/devicelogin and
pastes it. Note the auth id from `txc config auth list --format json` — Step 4
binds it to the connection.

## Step 3 — Create the environment (only if none exists)

Ask once for: environment type (`Sandbox` for Dev/Test), display name, and a
domain unique in the tenant (e.g. suffix with initials or a random id).

```
txc env create --type Sandbox --name "<DisplayName>" --domain <domain> --region <region> --currency <currency> --language <lcid> --wait
```

The environment URL is `https://<domain>.crm4.dynamics.com` (region-dependent
suffix). Creation takes minutes — `--wait` blocks until ready.

## Step 4 — Bind connection and profile (no extra sign-in)

```
txc config connection create <name> --provider Dataverse --url <environment-url>
txc config profile create --name <name> --auth <auth-id> --connection <name>
```

Use the same short name for connection and profile (`dev`, `test`) — one profile
per environment. Verify with `txc config profile list --format json`.

## Step 5 — Select the default profile

```
txc config profile select dev
```

Pin the Dev profile as the default local deploy target. The Test profile exists
for the CD pipeline; local work should never deploy there by hand unless asked.

## Summary

Report: which environments/profiles were created vs already present, their URLs,
and which profile is now selected. Next step in one line: deploy the package with
the `deploy` skill (`txc env pkg import`).
