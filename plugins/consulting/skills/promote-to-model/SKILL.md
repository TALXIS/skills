---
name: promote-to-model
description: In a UBML business-modeling workspace, promotes reviewer-validated insights into the canonical operational model - actors, entities, processes, metrics - business entities in the model, not Dataverse tables (the implement plugin's data-model skill owns those). Third step of the extract-insights → validate-insights → promote-to-model → validate-model pipeline. Use when insights have been validated and the UBML business model should be created or extended, or when asked to add actors, entities, or processes to a UBML workspace.
---

# Promote to model

**Contract:** the model changes only here, and only from insights a reviewer has
confirmed. Every promoted element traces to at least one cited insight; every
field written is evidenced. No placeholders, no padding "for completeness", no
guessing.

**The model is not the point of the workspace.** The insights are the record -
what was said, by whom, when and why. The model is a reading aid over them, built
last, and expected to be smaller than the evidence. An insight the model never
cites has lost nothing; it is still the reason a decision was taken.

## Ask the CLI first

Pin the major version - `sources` and `insights` are 1.4 document types and
older validators pass an invalid workspace in silence.

```
npx ubml@1.4 --help      # the command surface - the authority
ubml show                # read the current model before changing it
ubml schema <type>       # element shapes per document type
ubml nextid <prefix>     # allocate every new ID (AC, EN, PR, ST, …)
```

`show` lists what exists; `ids` does not - it prints a static cheat sheet. `add`
scaffolds a NEW document only; extending one is a manual edit.

## Sequence

1. **Only `validated` insights.** Corroboration is not confirmation: two sources
   agreeing raises `confidence`, only a reviewer moves `status`. Wait for the
   walk to finish - a model over a half-walked workspace reads as a statement
   about the business when it is a statement about how far the review got, and
   the gaps look like decisions. If you must build early, name the unwalked
   areas in the workspace description.
2. **Element type from the evidence.** People, roles, teams and systems become
   actors; records and documents entities; activities processes with steps;
   measurements metrics. On an ambiguous name the source's verb decides
   ("maintains the checklist" → entity, "runs the checklist" → process); still
   ambiguous → ask, don't guess.
3. **Write into the document for the type**, never a new file named after the
   capability. A `PR#####` states what it is for in its own description.
4. **Allocate every ID with `ubml nextid`.** Two passes running at once each see
   a workspace without the other's uncommitted work and allocate the same id, so
   sequence a split promotion: actors and entities commit before anything
   referencing them. A process pointing at an actor id that exists but means
   something else passes every check there is.
5. **Refine before creating.** An insight about an existing element updates it
   rather than duplicating it under a new name; two names for one actor become
   one element with the alias in its description.
6. **Wire by typed ID, never by name string.** If no insight states the ordering
   between two steps, omit the link rather than inventing a flow.
7. **Record provenance with `derivedFrom`.** It is a schema field the validator
   checks; a prose note is neither walkable nor validatable.
8. **Read back the validated insights the model does not cite.** Not to justify
   them - most are reasoning, which is what this workspace exists to hold.
   Deriving each element type separately is what makes the work honest and the
   same thing that leaves a cross-type claim unowned, so read the list rather
   than trusting the passes you just came out of.
9. **Finish with `validate-model`.** Promotion is not done until it validates.

## The three lenses that are not the operational model

- **`glossary` is not a dictionary of the model.** An entity already says what it
  is. A term is for a word the sources use to mean several things - "order"
  meaning three documents running in two directions - or a name in a transcript
  that is not the name of the thing. Say which element each reading maps to.
- **`hypotheses` holds the bet, not the open questions.** SCQH wants a proposed
  answer that could turn out wrong. A decision nobody has taken is an insight
  with kind `assumption` and stays one; a tree of pending decisions looks like
  analysis and is a to-do list.
- **`strategy` sits above the process and still cites.** A value stream is the
  customer's journey, capabilities are what the business must be able to do for
  it. Both carry `derivedFrom`, so an uncited strategy claim is an opinion and
  the validator says so.

## Do not model a capability the sources only mention

A source about one capability mentions its neighbours - what it extends,
coexists with, copies. Those are evidence about the capability being discussed,
not about the neighbour. Extract them anyway, but put the exclusion and its
reason in the workspace description or the gap reads as a decision. A model built
from whichever fragments came up looks authoritative and is wrong. If the
neighbour is worth modelling it needs its own sources.

## How many processes

**One process per outcome, not per path to it.** Two ways of starting that finish
the same way are one process with two entry points; two ways of finishing are two
processes. `startsWith` is an array, which is the schema saying multiple entry
points are expected rather than a compromise.

The pull toward splitting is that the branches are what you can see and the
shared tail is further down. Count first: if the shared tail is longer than the
branches, splitting makes the common case harder to read to tidy the rare one,
and every later change to the tail has to be made in every copy.

Split on a second real ending, a subprocess that genuinely runs for unrelated
callers, or a file grown past reading. An abort is an exit in `endsWith`, not a
separate outcome.

## Invariants

- No stored aggregations ("total duration", "average cost") - derive at read
  time. No version or audit fields - git is the version control.
- One parent per element; no dual hierarchies.
