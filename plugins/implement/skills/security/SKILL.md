---
name: security
description: Defines who can do what in a TALXIS / Power Platform / Dataverse app — security roles, permissions, record access levels. Use when granting or restricting access to tables, records, or features.
---

# Security

**Contract:** roles and privileges are scaffolded locally and `dotnet build`
passes. Local only — nothing deploys; assigning roles to real users happens in a
live environment via the `deploy` skill's profile.

## Ask the CLI first

```
txc workspace component create --help              # every scaffoldable template, by short name
txc component type explain <template>              # what it is, when to use it, and its CHAIN
txc workspace component parameter list <template>  # every parameter, typed, with defaults
txc docs get security-roles                        # long-form guide
```
`txc` prints JSON to stdout and logs to stderr. **Trust the exit code** — an
unknown `--param` fails with *empty stdout* and exit 2 (T20).

## Intent → template

| You want | Template |
|---|---|
| a named set of permissions | `pp-security-role` |
| what a role may do on a table | `pp-security-role-privilege` |
| let a persona open the app | `pp-app-security-role` |

## Sequence

1. Roles live in their own solution project (conventionally
   `src/Solutions.Security`).
2. Create the role (**one role file per persona**), then one
   `pp-security-role-privilege` entry per table it touches.
3. Grant the app to each role with `pp-app-security-role` — without it the app
   opens only for system administrators.
4. `txc workspace validate` and `dotnet build`.

## Invariants

- Privilege **depth**: Basic = own records · Local = business unit · Deep = unit
  + children · Global = whole organization. Grant the shallowest depth that works.
- Model roles for **personas, not people**; test users get least-privilege roles,
  never admin.

Details: [references/roles.md](references/roles.md)
