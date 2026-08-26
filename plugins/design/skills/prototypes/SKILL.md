---
name: prototypes
description: Models a screen or a custom UI component as a composition of controls that already exist in the TALXIS base-controls library, so the prototype converts into a shipped control by wiring rather than rebuilding. Use when prototyping or mocking up a screen, form, dataset view, or field; when designing a new custom UI component or PCF control; or when deciding whether a requested piece of UI needs bespoke code at all. Produces a composition spec plus a named gap list — scaffolding and building the control itself is the implement plugin's frontend skill.
---

# Prototypes

**Contract:** a prototype is a composition of controls that already exist, not a
drawing of controls that might. Bespoke UI is the exception, and an exception is
only valid when it is *named*: which existing control was closest, what it could
not do, and what would have to change for it to. A prototype nobody can trace
back to the palette is a redesign request, not a design.

## Ask the palette first

The palette is a live, independently released library — read it, never recall
it. [references/base-controls-palette.md](references/base-controls-palette.md)
names its three authorities and the order to read them in. Inside a workspace,
`txc component type list --search <term>` still answers which *platform*
component type hosts the result.

## Descend the ladder — stop at the first rung that works

Each rung costs more to build and more to keep working. Never skip past one
because a lower rung is more familiar.

| Rung | Model the UI as… | You still write |
|---|---|---|
| 1 | a **form context** — tabs, sections, fields, ribbon, notifications rendered from a declarative description | nothing |
| 2 | a form context with **one renderer replaced** (tabs, ribbon, notifications, or a single control's presentation) | one renderer |
| 3 | a form that **mixes runtime fields with custom content cells**, or renders cells through a custom section component | the custom cells |
| 4 | the same composition **re-laid-out** — breakpoints, section grids, label behavior, rowspan/colspan | layout config only |
| 5 | **one existing control** bound to a column or dataset (every Dataverse column type and the dataset/grid surfaces are already covered) | the binding |
| 6 | **bespoke** — nothing above fits | the whole control, forever |

Rung 4 is the one teams skip: most "we need a custom component" requests are
layout requests wearing a costume.

## Sequence

1. **Read the palette**, then list what it covers *today* — it grows between
   releases, so a gap found last month may have closed.
2. **Decompose the requested UI** into elements, and give each element the data
   it binds to (column type, dataset, or none).
3. **Place each element on the ladder** at the highest rung that holds it.
   Record the rung — it is the estimate.
4. **Name every gap.** For each element that lands on rung 6, write the closest
   existing control, the specific capability missing, and whether the honest fix
   is a bespoke control or a change request against the library. Prefer the
   second: a capability added upstream serves every project.
5. **Deliver a composition spec** — element → rung → control → binding → gap —
   as a draft for human review. This skill never implements what it specifies.

## Invariants

- **Visual consistency is inherited, not applied.** Controls taken from the
  palette theme themselves and behave alike; anything hand-built drifts the
  first time the design system moves, and drifts silently.
- **Reusability is decided at prototype time,** not refactor time. A shape
  chosen off the palette is already shared; a shape drawn free-hand is a
  one-customer asset from the moment it renders.
- **Stability is the library's job.** Platform and framework changes are
  absorbed upstream for anything on rungs 1–5; on rung 6 they become the
  project's bugs.
- Never invent a control name, prop, or capability to make a mockup work —
  an unbacked element is a fictional prototype. Verify against the palette or
  mark it rung 6.
- Never re-implement a column type. If the element binds to a Dataverse column,
  a control for it already exists.
- Placeholder names invented before the app exists (entities, columns, roles)
  are enumerated explicitly in the deliverable, never assumed real.
- Scaffolding the control project, wiring the manifest, and building belong to
  the implement plugin's `frontend` skill; this skill produces the spec it works
  from.
