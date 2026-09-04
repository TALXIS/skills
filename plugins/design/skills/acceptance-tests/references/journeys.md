> **Needed because:** no txc verb and no public doc states the decomposition rule; it was measured on a delivery project and the losing method is what the retired wiki page taught.
> **Remove when:** the journey rule and its evidence live in the pattern repo's BDD section alongside `bdd-agent-v2` (TOOLING-BACKLOG T18).

# Decomposing by journey

## The rule

A scenario is **one business action a story could describe**, 3–5 steps.
A journey is a file: several scenarios that a person performs in one sitting.
A journey spans several stories, and a story feeds several journeys. Tag every
`@WI:` the file covers.

Not one scenario per AC bullet. That is the method being replaced.

## The evidence, so nobody re-litigates it

One sprint decomposed per AC bullet produced **several times more scenarios than
the same sprint decomposed by journey, over half their assertions about the
platform rather than the product, and not one of them ever executed.** The method
reliably yields scenarios named `<Entity> Status option set exposes the expected
values` and `The <Entity> form exposes the expected tabs`.

Re-decomposed by journey, the same acceptance criteria collapsed to a fraction of
the files. Nothing was dropped that could fail because the product misbehaved.

## Two tests, both must pass

- **Would the story say it?** Rejects mechanism. Stories never name dialogs,
  buttons, tabs-as-navigation, or saving.
- **Could a binding author implement it without asking a question?** Rejects
  abstraction. "The order qualifies for priority handling" fails, because it
  hides which field.

The AC decides which side a detail falls on. "Drag a task onto another to
re-parent it" *is* the requirement, so the gesture belongs in the scenario. "Tasks
are generated from the template" is an outcome, so the command, the lookup dialog
and the Continue button belong in the binding.

## What leaves the UI suite

Roughly a third of a per-bullet suite. Each one becomes a line in the hand-off
saying what should assert it instead — a metadata query, in almost every case.

- option-set enumerations
- "the form exposes the expected tabs" / "the tab exposes the … fields"
- requirement levels ("X is optional on Y")
- autonumber generation
- control presence ("exposes a Color picker")
- "open the list of X" with no assertion about behaviour

## Collapsing

`Scenario Outline` for matrices — role × access, membership windows, audit per
entity, calculated totals. One readable table beats seven near-identical
scenarios, and a reviewer can see which cells are covered.

**Every `<placeholder>` goes inside quotes.** Unquoted, it changes the step
*phrase* per row, so it binds for some rows and not others — and a gate reading
raw feature text cannot see it. A rule whose variants sit in the phrase
(`(expanded|collapsed)`) is separate scenarios, not an outline.

## A dependent field is four assertions, not one

When the controlling value is present the dependent field is *shown*, *unlocked*
and *required*. When it goes away it is *hidden* (or **locked**, where hiding is
impossible — inside a table), *optional*, and **its value is cleared**.

The clearing matters most and is the one usually missed: without it a record keeps
a value for an option it no longer holds, nothing on screen says so, and every
report downstream is wrong.
