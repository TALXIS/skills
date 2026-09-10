---
name: features
description: Writes Gherkin .feature files for a TALXIS / Power Platform / Dataverse solution from its agreed user flows — one feature per job, in business language, with no selectors or waits. Use when someone wants acceptance criteria, BDD scenarios, or .feature files written for a design, or asks what "done" looks like for a flow.
user-invocable: true
argument-hint: "<flow or job to cover>"
---

# Features

**Contract:** writes `features/*.feature` — Gherkin only. No test project, no
step bindings, no compilation. `implement:test` turns these into something that
runs; this skill decides what "done" means.

## Source

Read `solution-design.md` → **User flows**, and write **one feature file per
job**. The flow's steps are the scenario; the job is the feature.

**Actors are personas.** Where `personas.md` exists, `Given I am a dispatcher`
uses its names verbatim — the three documents must talk about the same cast.

With no design document present, elicit the flow directly — one
`AskUserQuestion` round — and say in your reply that the feature is unanchored,
so nobody assumes a reviewed design behind it.

## Scenario shape

- **Given** sets context · **When** is *one* action · **Then** is an observable
  outcome. 3–5 steps.
- **Business language only.** No selectors, no waits, no page objects, no field
  logical names. If a step cannot be read aloud to the person who asked for the
  feature, it belongs in a step definition instead.
- One scenario per rule worth protecting — not one per screen, and not a
  transcript of every click in the flow.
- Cover the unhappy path where the design has a rule: a `Logic` entry that
  rejects something deserves a scenario proving it is rejected.

## Traceability

Every file names the job it covers, so a flow with no feature is visible rather
than silently missing. List at the end which jobs got features and which did
not, and why.

## Hand off

Point at `/implement:test` — it scaffolds `pp-test-ui`, places these files, and
writes step bindings with `pp-test-ui-step` for whatever
`TALXIS.TestKit.Bindings` does not already cover. **Do not create the test
project here.**
