---
name: prototypes
description: Applies reuse-first design — proven industry patterns, existing TALXIS assets, then the base-controls library — so a prototype converts into a shipped control by wiring rather than rebuilding. Use when prototyping or mocking up a screen, form, dataset view, or field; when designing a new custom UI component or PCF control; or when deciding whether a requested piece of UI needs to be built at all. Produces a composition spec plus a named gap list — scaffolding and building the control itself is the implement plugin's frontend skill.
---

# Prototypes

**Contract:** a prototype is a composition of things that already exist, not a
drawing of things that might. Bespoke UI is the exception, and an exception is
only valid when it is *named*: what existed closest, what it could not do, and
what would have to change for it to. A prototype nobody can trace back to an
existing asset is a redesign request, not a design.

## Two ladders, in order

Design answers two questions and they are not the same question. **Should this
exist?** comes first, and most requests die on it. **How is it composed?** only
runs on what survives. Both ladders are climbed the same way — stop at the first
rung that holds — the discipline
[ponytail](https://github.com/DietrichGebert/ponytail) applies to code, applied
here to design.

## Ladder A — should this exist?

1. **Is it needed at all?** The cheapest screen is the one not drawn. A request
   phrased as a component is often a request for a field on a form that exists.
2. **Does the customer's industry already do this?** A workflow their people
   already recognise beats a better one they have to learn. Novelty is a cost
   charged to the user; spend it only where the differentiation is.
3. **Has it been built already?** A packaged control is themed, tested and
   owned by someone else — search the published packages (`TALXIS.Controls.*`)
   and whatever this workspace already references. Then ask whether your own
   organisation has solved this before; where no index exists, ask the people
   who would know rather than treating absence of a catalog as absence of
   prior art.
4. **Does the base-controls palette cover it?** → Ladder B.
5. **Only then, bespoke** — and named (Sequence step 4).

## Ask the palette first

The palette is a live, independently released library — read it, never recall
it. [references/base-controls-palette.md](references/base-controls-palette.md)
names its three authorities and the order to read them in. Inside a workspace,
`txc component type list --search <term>` still answers which *platform*
component type hosts the result.

## Ladder B — how is it composed?

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

1. **Run Ladder A on the request as a whole** before decomposing it. Report what
   it killed — a request that shrank is the most valuable output this skill has.
2. **Read the palette**, then list what it covers *today* — it grows between
   releases, so a gap found last month may have closed.
3. **Decompose what survived** into elements, and give each element the data it
   binds to (column type, dataset, or none). Place each on Ladder B at the
   highest rung that holds it — the rung is the estimate.
4. **Name every gap.** For each element that lands on rung 6, write the closest
   existing control, the specific capability missing, and whether the honest fix
   is a bespoke control or a change request against the library. Prefer the
   second: a capability added upstream serves every project.
5. **Deliver a composition spec** — element → rung → control → binding → gap —
   as a draft for human review. This skill never implements what it specifies.

## Invariants

- **Reuse is checked, not assumed.** "Nothing exists for this" is a claim that
  needs a search behind it — the palette, TALXIS products and delivered
  projects, and how the customer's industry already solves it. An unsearched
  gap is the most expensive thing this skill can produce.
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
