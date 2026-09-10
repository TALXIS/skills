---
name: builder
description: Drives a whole TALXIS / Power Platform / Dataverse delivery from a one-line intent — asks who uses it and what they need to get done, then scaffolds every concern at once: tables, screens, permissions and tests, until the local build passes. Records what was agreed in solution-design.md. Use when someone says "build me an app for X" or wants a change spanning data, screens and permissions together — not when they want a single screen or table, which are the frontend and data-model skills.
user-invocable: true
argument-hint: "<what the app should do>"
---

# Builder

**Contract:** a one-line intent becomes a scaffolded app that passes
`txc workspace validate` and `dotnet build`, plus a `solution-design.md`
recording what was agreed. Local only — **nothing deploys**. This skill owns the conversation;
`workspace`, `data-model`, `frontend`, `security` and `test` do the scaffolding.

## Two rules for this flow

- **Run it here, never in a subagent.** A subagent is headless — its only output
  is a final message, so `AskUserQuestion` and plan mode silently do nothing from
  inside one. Ask, propose, and narrate in the main conversation.
- **The user reads your reply, not your tool output.** Tool panels are collapsed
  by default, so anything they must review or approve goes in your message as a
  table. A `txc` result they never expand is not a proposal.

## Phase 0 — Orient and detect

**If `solution-design.md` is already here, read it** — `design:spec` wrote it, or
you did on an earlier run. Confirm it still matches what the user wants, then go
straight to Phase 2's approval. Do not re-ask what the document already answers.

Run the `workspace` skill, then branch on what it found:

**Empty folder** — scaffold the monorepo first (solution file, `src/`, the
deployment package project), then design and build onto it. Ask for the publisher
name and prefix once; there is nothing to infer them from.

**Existing workspace** — `txc workspace validate` and `dotnet build` must pass
before you change anything. Then find what is there, so you extend it and infer
instead of asking:

- **Tables** — directory names under `src/*/Entities/` (e.g. `con_servicevisit`).
  Match the **exact** logical name, never a substring.
- **Publisher prefix** — `<PublisherPrefix>` in a solution `.csproj`, or
  `CustomizationPrefix` in its `Other/Solution.xml`. Reuse it; never ask.

Report what you found before proposing anything — **never re-scaffold over an
existing workspace.**

## Phase 1 — Intent

Ask **who uses this and what each of them needs to get done**. Two
`AskUserQuestion` rounds at most; infer the rest and say what you inferred.

Jobs first, tables second: a table exists because a job needs its data, a screen
because a job needs to act on it. Deriving the data model first reliably invents
tables nobody needs and misses screens somebody does. **Keep the jobs** — Phase 2
has to account for every one.

## Phase 2 — Propose, record, approve

Render in your reply, and write the same content to `solution-design.md` beside
the solution file — creating it, or bringing an existing one up to date: tables with their columns, one role per persona, and **every job
from Phase 1 against the surface that satisfies it**. A job with no surface is a
design gap — show the row with an empty cell and resolve it, never drop it.

Then `EnterPlanMode` / `ExitPlanMode` for one approval covering the whole build.
`solution-design.md` is the user's to keep and to hand-edit before you build;
rewrite it whenever the plan changes. For a fuller design — existing-component
analysis, where each behaviour runs, user flows — `/design:spec` writes the same
file with every section filled.

## Phase 3 — Build

Fixed order — each concern's skill owns the *how*:

1. `data-model` — tables, then columns, then lookups
2. `frontend` — app shell and navigation, then forms and views
3. `security` — one role per persona, then its privileges, then app access
4. `test` — a BDD feature per job worth protecting

`txc workspace validate` and `dotnet build` after each concern, not once at the
end. Narrate what you created as you go.

## Phase 4 — Report

State what now exists and what you assumed. Bring `solution-design.md` back in
line if the build diverged from it. Offer the `deploy` skill — do not invoke it.

## Invariants

- Every Phase 1 job appears in the plan against the surface that satisfies it.
- Tables and all their columns exist before any form or view references them.
- One solution project per concern (data model / UI / logic / security).
- **Never deploy, and never touch a live environment, unless asked.**
