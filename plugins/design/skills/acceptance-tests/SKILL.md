---
name: acceptance-tests
description: Turns a user story's acceptance criteria into executable Gherkin .feature files in the project's companion tests repo, bound to the TALXIS UI test kit's step vocabulary. Use when authoring BDD scenarios from acceptance criteria, generating feature files for a story, or checking that every functional story has executable test coverage before implementation. Authors scenario content only — scaffolding or running test projects in the app workspace is the implement plugin’s test skill.
---

# Acceptance tests

**Contract:** acceptance criteria are the single source of truth — scenarios are
generated from a story's AC, never hand-drafted ahead of them. If a scenario
needs something the AC does not say, fix the story first, then regenerate. Every
functional story ends with scenario coverage. Feature files live in the
project's companion tests repo, never the app repo, and ship as a draft for
human review — this skill never merges its own output.

## Ask the pattern sources first

Conventions and the bound step-phrase catalog live outside this skill — read
[references/pattern-sources.md](references/pattern-sources.md) for the exact
artifacts to consult before drafting; verify what exists, invent nothing.

## Sequence

1. **Locate the companion tests repo.** If it is missing, scaffold it from the
   pattern repo's template — creating it is part of this skill, not something to
   defer. Read the existing feature-file hierarchy, project-local step
   definitions, and data fixtures before writing anything.
2. **Extract AC atoms** from the story: roles, positive and negative
   capabilities, entities and fields, concrete examples.
3. **Decompose into files:** one `.feature` per UI state, dialog, or wizard
   step — a single story often yields several files. Exception: CRUD-shaped
   stories on one entity file by capability instead.
4. **Draft each file:** tag it with the source story's work-item id (coverage
   is proven by that link), open with a `Background:` of login → fixtures →
   navigation, then multiple `Scenario:` blocks. Every step phrase must already
   exist in the test kit's catalog or the repo's own step definitions.
5. **Reference fixtures by alias** — no inline sample data where a fixture
   exists; add missing fixtures in the same change.
6. **Self-validate:** every step phrase matches a binding, every fixture
   reference resolves, every asserted record exists in the fixture data its
   scenario creates, every AC bullet is covered by at least one scenario, and
   every scenario has at least one `Then`. Re-draft until all five hold —
   [references/production-learnings.md](references/production-learnings.md)
   carries the field-tested rules behind them.
7. **Deliver as a draft** for human review, reporting the AC → scenario
   coverage mapping.

## Invariants

- Never invent a step phrase — an unbound phrase is a broken test, not a
  scenario. If no binding matches, report the missing phrase to the user and
  leave the scenario tagged as blocked — writing bindings is test-project work
  (the implement plugin's `test` skill), not scenario authoring.
- Scenarios never precede or amend their AC — the story changes first. Story
  comments are not AC: a requirement found in a comment thread gets promoted
  into the story, never quietly encoded in a scenario.
- Coverage is a gate, not a suggestion: a functional story without a tagged
  feature file is not ready for implementation.
- Prefer multiple `Scenario:` blocks over `Scenario Outline` when setups differ
  even slightly.
- Names invented before the app exists (apps, entities, fields, roles) are
  placeholders — enumerate them explicitly in the deliverable, never silently.
- Scaffolding UI test *projects* inside the app workspace belongs to the
  implement plugin's `test` skill; this skill authors scenario content.
