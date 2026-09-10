---
name: personas
description: Works out who a TALXIS / Power Platform / Dataverse system is for — the roles that use it, what each needs to get done, what makes that hard today, and how much authority they hold. Writes personas.md, which the rest of the design builds on. Use when starting a new system from a problem statement, or when the people a system serves have never been written down.
user-invocable: true
argument-hint: "<who the system is for, or the problem it solves>"
---

# Personas

**Contract:** produces `personas.md` — who the system is for and what each of
them needs to get done. **Read-only apart from that one file.** Everything
downstream leans on this: a table exists because a job needs its data, a screen
because a job needs to act on it, a security role because a persona holds
authority.

## Two rules for this flow

- **Run it here, never in a subagent.** A subagent is headless — `AskUserQuestion`
  silently does nothing from inside one.
- **The user reads your reply, not your tool output.** Render the personas as a
  table in your message. A file they have not opened is not an agreement.

## Where the personas come from

**If the workspace already has components**, they are largely encoded — start
there and confirm, rather than inventing a parallel cast beside roles that exist:

| Signal | Where |
|---|---|
| roles already modelled | `src/*/Roles/` — the convention is one role per persona |
| what each is expected to do | `src/*/AppModuleSiteMaps/*/`, `src/*/AppModules/` |
| what they work on | `src/*/Entities/<logical>/` |

**From scratch** — an empty folder, or a problem statement with no code yet —
elicit them. Two `AskUserQuestion` rounds at most, then infer the rest and say
plainly what you inferred.

## What each persona records

| Field | Why it earns its place |
|---|---|
| Role | a persona is a role, never a named person |
| Context of use | desk, field, shared device — decides mobile vs desktop surfaces |
| Jobs to be done | drives every table and screen downstream |
| What makes it hard today | the thing the system actually has to fix |
| Decision authority | becomes the security role's depth: own records (Basic) → business unit (Local) → unit and children (Deep) → organization (Global) |

## Rules

- **2–5 personas.** More than that and they are usually variations of one; merge
  them until each has a distinct job.
- **Every persona needs at least one job**, or it is not a persona for this
  system — an audience who only reads a report is a job, so say so.
- **Never invent a persona to justify a feature** you already wanted to build.
  The traffic runs the other way.
- Where two personas differ only in authority, say that — it is one persona with
  two privilege depths, not two.

## Hand off

`/design:spec` reads this file for its **Jobs to be done** and builds the data
model, behaviour placement and user flows on it. `/design:features` uses these
same names as its scenario actors.
