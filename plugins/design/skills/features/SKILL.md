---
name: features
description: Writes Gherkin .feature files for a TALXIS / Power Platform / Dataverse solution from its agreed user flows — one feature per job, in business language, mapped onto the step bindings TALXIS.TestKit.Bindings already ships so only the genuine gaps need implementing. Use when someone wants acceptance criteria, BDD scenarios, or .feature files written for a design, or asks what "done" looks like for a flow.
user-invocable: true
argument-hint: "<flow or job to cover>"
---

# Features

**Contract:** writes `features/*.feature` plus the **Step bindings** section of
`implementation-guide.md`. Gherkin only — no test project, no step definitions, no
compilation. `implement:test` makes these run; this skill decides what "done" means
and which steps still need a binding written.

## Ask the bindings catalog first

`guide_testing` — an **MCP tool** on the `txc` server, not a shell command; your host
prefixes it. Call it **with no `query`** to get the whole catalog of
`TALXIS.TestKit.Bindings` steps, grouped by category.

The `query` form instead generates a scenario by sampling, under its own rules, having
read neither `personas.md` nor the agreed flows — don't use it. Take the catalog and
write the Gherkin here. If the tool is unavailable or reports no bindings, author
normally, **say so in your reply**, and list every step as unverified rather than
claiming coverage you did not check.

## Source

Read `solution-design.md` → **User flows**, and write **one feature file per job**:
the flow's steps are the scenario, the job is the feature. **Actors are personas** —
where `personas.md` exists, `Given I am a dispatcher` uses its names verbatim, so all
three documents talk about the same cast. With no design document, elicit the flow in
one `AskUserQuestion` round and call the feature unanchored in your reply, so nobody
assumes a reviewed design behind it.

## Map each step to a binding

1. **Reuse a catalog pattern verbatim** where one fits, filling its slots. Every slot
   renders as the same `{value}`, so the words around it say what it takes —
   `to the '{value}' app as '{value}'` is app, then user.
2. A line whose keyword is `Step` or `*` binds to Given, When and Then alike — pick
   the one that fits. **Never write `Step` into a feature file**; it is not a Gherkin
   keyword and the file will not parse. Unconverted regex in a pattern (`^`, `(a|b)`,
   `[^']+`) is a rendering artifact: phrase the step plainly and treat it as matched.
3. Only when nothing fits, write a new step — same business language, same shape.
   Prefer the catalog's own conventions, so the next step is likelier to match.

## Unify before you flag

Across every feature file, **one action gets one phrasing**. Three scenarios that each
invent their own wording for reassigning a visit are three bindings for
`implement:test` to write and three ways for it to break. Collapse them to one
phrasing, then flag it once.

## Flag the gaps

An unmatched step is marked in two places, both of which travel with it:

- `@custom-binding` on the scenario, and a `# needs-binding` comment on **its own
  line directly above the step** — Gherkin has no trailing comments, so a `#` after
  step text becomes part of the step and the binding never matches.
- the **Step bindings** section of `implementation-guide.md` — matched steps under
  *Covered*, the rest in the *Needs a binding* table with the features using it and
  what it was unified from.

That section is this skill's to own. Leave every other section of that file, and all
of `solution-design.md`, alone.

## Scenario shape

- **Given** sets context · **When** is *one* action · **Then** is an observable
  outcome. 3–5 steps.
- **Business language only.** No selectors, waits, page objects or field logical
  names. A step that cannot be read aloud to the person who asked for the feature
  belongs in a step definition instead.
- One scenario per rule worth protecting — not one per screen, and not a transcript
  of every click.
- Cover the unhappy path where the design has a rule: a `Logic` entry that rejects
  something deserves a scenario proving it is rejected.

## Traceability and hand off

Every file names the job it covers, so a flow with no feature is visible rather than
silently missing. Close by listing which jobs got features, which did not and why, and
how many steps reused a binding versus need one written. Then point at
`/implement:test` — it scaffolds `pp-test-ui`, places these files as they are, and
writes `pp-test-ui-step` bindings for exactly the flagged steps. **Do not create the
test project here.**
