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

Then branch on whether a workspace exists — a solution file (`*.slnx`/`*.sln`).

**Existing workspace — gather the paths, never guess them.** Project arrangement
under `src/` is explicitly not enforced, and a solution project may keep its
Dataverse files in a subfolder, so a fixed `src/*/…` glob silently finds nothing
and the design then *adds* what it should have *extended*. Derive instead:

1. `dotnet sln list` — every project path, at whatever depth it sits
2. from each `.csproj`: `<ProjectType>` (`Solution`, `PDPackage`, `CodeApp`,
   `GenPage`), `<SolutionRootPath>` (default `.`) and `<PublisherPrefix>`
3. a solution project's components live under
   `<project dir>/<SolutionRootPath>/<directory>/`, where `<directory>` is the
   `directory` field `txc component type list` reports for that type — `Entities`,
   `Roles`, `OptionSets`, `Other`, `AppModules`, `AppModuleSiteMaps` and the rest

Then read what is there: tables and columns from `Entities/<logical>/Entity.xml`,
relationships from `Other/Relationships.xml`, roles from `Roles/`, global choices
from `OptionSets/`, apps and navigation from `AppModuleSiteMaps/`, and the
publisher prefix from `Other/Solution.xml` if the `.csproj` did not carry it.

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

Then write two sections of `implementation-guide.md`:

**Components** — one row per component, naming the template it is built from, the
solution project it belongs in, and the job or requirement it satisfies. Phase 0
already listed what is buildable — use it, and raise an **Open question** for anything
the design needs that has no template (a many-to-many has none; it costs hand-authored
XML).

**Security** — one role per persona, then a row per table it touches, granting each
privilege at the shallowest level that still lets the persona do their job. This is
the only place both inputs exist: personas' **Decision authority** and the data model.
Grant per action, never one level for the whole role, and give a table the persona
must not reach no row at all rather than a generous one. Anything the personas do not
answer is an **Open question**, not a guess — over-granting is invisible until audit.

`solution-design.md` is the design; the guide is the build instruction that saves
`implement:builder` from re-deriving it. **Own only that one section** —
`design:features` owns *Step bindings* and nothing else touches it.

Render the summary in your reply, then point at `/design:features` for the Gherkin
and `/implement:builder` to build it. **No plan mode** — nothing is executed here,
and the document is what gets approved.
