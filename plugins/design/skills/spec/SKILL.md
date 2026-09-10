---
name: spec
description: Designs a Power Platform / Dataverse system before any code is written — works from a problem statement in an empty folder, or weighs a requirement against what a repository already contains, then settles the data model, where each behaviour runs, and the user flows. Writes solution-design.md. Use when someone describes what they need built or changed and you want the design agreed and written down before scaffolding.
user-invocable: true
argument-hint: "<what needs building or changing>"
---

# Spec

**Contract:** produces `solution-design.md` — a design a person can review and an
agent can build from. **Read-only apart from that one file**: never scaffolds,
never builds, never touches an environment. Deciding is the job; `implement` does.

## Two rules for this flow

- **Run it here, never in a subagent** — a subagent is headless, so
  `AskUserQuestion` silently does nothing from inside one.
- **Render the design in your reply, as tables.** Tool panels are collapsed by
  default; a file they have not opened is not an agreement.

## Phase 0 — Establish the ground

Run these either way, so nothing you propose is unbuildable:

```
txc workspace project explain            # the project types that can exist
txc workspace component create --help    # what is actually buildable
```

Then branch on whether a workspace exists — a solution file (`*.slnx`/`*.sln`)
beside a `src/` directory.

**Existing workspace** — inventory it:

| Looking for | Where |
|---|---|
| what each project is | `<ProjectType>` in its `.csproj` — e.g. `Solution`, `PDPackage`, `CodeApp`, `GenPage` |
| tables and columns | `src/*/Entities/<logical>/Entity.xml` |
| relationships | `src/*/Other/Relationships.xml` |
| roles and global choices | `src/*/Roles/`, `src/*/OptionSets/` |
| apps and navigation | `src/*/AppModuleSiteMaps/*/` |
| publisher prefix | `src/*/Other/Solution.xml`, or `<PublisherPrefix>` in the `.csproj` |

Match table names **exactly**, never as a substring — a fuzzy match reporting a
table that isn't there is how a design ends up extending nothing.

**Empty folder** — nothing to reconcile against. Say so and design from the
problem statement. `implement:workspace` scaffolds the monorepo when the time
comes; **design never does**.

## Phase 1 — Frame the work

**Existing workspace:** classify every requirement **Reuse** (already there),
**Extend** (a column or screen on something existing), or **Add** (genuinely
new) — and say why, before designing anything. Inventing a parallel table beside
a perfectly good one is the failure this phase prevents.

**From scratch:** nothing to classify, so frame instead — what is in scope, what
is explicitly out, what constrains the design. Greenfield without a stated
boundary is how a first release grows to eighteen months.

Two `AskUserQuestion` rounds at most. Infer the rest and state what you inferred.

## Phase 2 — Data model

Tables and columns, each traceable to a job that needs its data. Reuse an
existing table over inventing a neighbour. A lookup needs its target to exist.

**Personas and their jobs come from `personas.md` when it exists** — read it,
never re-elicit. Without one, work them out here and offer `/design:personas`.

## Phase 3 — Where each behaviour runs

For every behaviour, pick one and record the reason:

- **Configuration, not code** — required fields, choices, view filters. **Check
  this first.** Writing a plugin for what a required-field flag already does is
  the most common over-build.
- **Backend** (`pp-plugin` + step) — the rule must hold no matter who writes the
  data: an integration, the Web API, an import, another app. Reject bad input in
  **pre-validation**; make related writes atomic in **post-operation**.
- **Frontend** (`pp-script-library` + `pp-form-event-handler`) — it serves the
  person filling the form: show/hide, default, warn early. **Never the only
  enforcement of a rule.**
- **Both** — needs enforcement *and* early feedback. Say so; don't quietly pick one.

## Phase 4 — User flows

Per job: entry point → steps → the screen at each step. Every job gets a flow, or
an **Open question** saying why it doesn't.

## Phase 5 — Write and hand off

Write `solution-design.md` with these sections, in this order — `implement:builder`
and `design:features` read them by name:

`Context` · `Existing` · `Jobs to be done` · `Data model` · `Logic` ·
`User flows` · `Out of scope` · `Open questions`

**Every section appears in both scenarios** — they are read by name, so on a
greenfield design `Existing` says nothing exists yet rather than being dropped.

Render the summary in your reply, then point at `/design:features` for the Gherkin
and `/implement:builder` to build it. **No plan mode** — nothing is executed here,
and the document is what gets approved.
