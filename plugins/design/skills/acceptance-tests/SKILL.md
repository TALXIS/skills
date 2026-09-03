---
name: acceptance-tests
description: Turns a sprint's acceptance criteria into executable Gherkin .feature files under the project's tests directory, decomposed by user journey and bound to the TALXIS UI test kit's step vocabulary. Use when authoring BDD scenarios from acceptance criteria, generating feature files for a story or a sprint, or checking that every functional story has executable test coverage before implementation. Authors scenario content only — scaffolding or running test projects in the app workspace is the implement plugin's test skill.
---

# Acceptance tests

**Contract:** a scenario is one **journey** — a single business action a story
could describe — written from the backlog alone, before implementation. Acceptance
criteria are the only source; if a scenario needs something the AC does not say,
fix the story first. Files ship as a draft: this skill never merges its own
output.

**Where they live is the project's call, not this skill's.** A companion tests
repo and a `tests/` directory in the app repo are both in use at NETWORG; the
method of record, `bdd-agent-v2`, is itself a monorepo. Follow whatever the
project already does, and ask if there is nothing to follow.

**Never one scenario per AC bullet.** Measured on a full sprint: over half the
assertions end up about the platform, not the product.
[references/journeys.md](references/journeys.md) — decomposition rules, what to
drop, and the evidence.

## Ask the pattern sources first

The method of record and the bound step-phrase catalog live outside this skill —
read [references/pattern-sources.md](references/pattern-sources.md) before
drafting. Verify what exists, invent nothing.

## Sequence

1. **Locate the test project.** Missing, scaffold it from the pattern repo's
   template, where the project already puts tests. Read the feature-file
   hierarchy, project-local step definitions and data fixtures first.
2. **Group the sprint into journeys**, not stories: one journey usually spans
   several stories, and one story usually feeds several journeys. Name each after
   what the user is doing.
3. **Extract AC atoms** per journey: roles, positive and negative capabilities,
   entities, labels, concrete example values.
4. **Draft each file** — journey tags with every `@WI:` it covers, a `Background:`
   of login and fixtures, then one `Scenario:` per business action at 3–5 steps.
   `Scenario Outline` for matrices. Mark every identifier `[AC]`, `[AC-gap]` or
   `[reconciled]`.
5. **Check the parameter contract of every step before phrasing it** —
   [references/identifier-kinds.md](references/identifier-kinds.md). Four kinds
   look alike and only one is right per step.
6. **Gate it.** A binding-resolution check is mandatory, not optional — bindings
   resolve at runtime, so an unbound step reports as *skipped*. Prove the gate
   fails on a seeded typo, and make it refuse to pass when it finds nothing.
7. **Deliver four outputs**, each with a different audience: the tests · the
   tooling gaps · the backlog defects · the conventions.

## Invariants

- **Backlog only.** A test derived from code can only confirm what was built, and
  cannot exist before implementation — which is when tests are supposed to exist.
- **Future-oriented.** Where no shipped step can express the requirement, that is a
  tooling row and a `@needs-binding` tag, never a weaker assertion.
- **Reuse before authoring.** New steps are a cost, not a style. Extend the
  existing vocabulary, fixtures and files rather than adding a parallel version —
  the same discipline the `prototypes` skill applies to controls.
- Never invent a step phrase. Unbound is a broken test, not a scenario.
- **Do not assert** field, tab or section existence, option-set enumerations,
  autonumber generation, requirement levels, or that a list renders. A metadata
  query answers all of them faster, and none can fail because the product
  misbehaved.
- Save-and-read-back is weak: one per journey as smoke, never per entity.
- **Dates:** relative when compared against today; absolute when the expected value
  depends on the weekday, and say which weekday in the file.
- Scenarios never precede or amend their AC — the story changes first. Story
  comments are not AC; promote them into the story.
- Names invented before the app exists are placeholders — enumerate them in the
  deliverable, never silently.
- The coverage index is **generated** from the `@WI:` tags. Hand-maintained
  ledgers drift into contradicting each other.
- [references/production-learnings.md](references/production-learnings.md) — each
  rule there cost a defect to learn.
