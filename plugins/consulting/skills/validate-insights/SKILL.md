---
name: validate-insights
description: Walks a stakeholder through extracted insights one at a time so each is confirmed, corrected or rejected before anything is promoted into the model. Second step of the extract-insights → validate-insights → promote-to-model → validate-model pipeline. Use when insights are extracted and need signing off, when a workspace is being prepared as the base for a project, or when asked to walk through findings with someone.
---

# Validate insights

Pin the CLI: `npx ubml@1.4 <command>`. `status` is an enum, and older validators
accepted an invented value in silence - a workspace that looks reviewed and is
not.

**Contract:** one bundle at a time, in the order the material was produced: the
source text, the claim drawn from it, and any model element that claim would
create. The reviewer's answer moves a status; it never becomes a new claim. A
session that ends with unwalked bundles says so rather than implying coverage.

The element is reviewed here or nowhere. `derivedFrom` proves a claim was
confirmed; it says nothing about whether anyone agreed the claim should become
this actor, under this name, merged with that one. Promotion is too late to ask -
by then it is dozens of decisions at once and the source is cold.

## Let the CLI drive the bookkeeping

```
ubml walk next             # the next proposed insight, source text beside the claim
ubml walk set <id> <status>  # record the answer
```

`walk next` orders by when the material was produced, not by ID - a stakeholder
reads their own project as a story, and later sources arrive as answers to what
earlier ones left open. It carries the position ("source 1 of 4, insight 2 of
5"), which tells the reviewer how far through they are where an ID tells them
nothing, and opens each source with how many insights it holds and how many
restate something already walked, so they can spend attention on the ones that
are new.

Show what it emits: source block first, extraction second, both labelled, ID
last. Unlabelled, the reviewer guesses which is evidence and which is your claim.
Claim-first invites them to skim the quote for confirmation of what they have
already accepted.

Two things it cannot get right on its own. It sorts on the source's `date`, so
that field must hold when the material was **produced**, not when it was shared -
a meeting note circulated weeks later still comes first if the document quoting
it came second. And where a whole source turns out to restate an earlier one,
say so before starting and offer to fold it into its parent rather than walking
it twice.

Show one bundle per turn and then stop. `walk next` gives you one; showing two
is how a reviewer ends up approving in bulk.

Everything below is the part `walk` cannot do.

## Walk the claim and the element it would create together

`walk next` shows both: the claim, and any element it would create. Show what it
emits - an insight carrying a proposal is one decision to the reviewer and two
records in the workspace.

Record each with `walk set <id>`; the id says which is meant, so an insight takes
`validated` or `disputed` and an element takes `accepted` or `rejected`.

Three answers, not two. They may take the claim and reject the element - the
extraction is right and the modelling is wrong. That is the most useful answer
the format makes possible, and it is invisible if you only ask about the insight.

| The answer | insight | element |
| --- | --- | --- |
| both right | `validated` | `reviewStatus: accepted` |
| claim right, element wrong | `validated` | `reviewStatus: rejected`, and say why in its description |
| claim wrong | `disputed` | `rejected` - an element from a disputed claim has nothing under it |
| element right, different shape | `validated` | edit it, then `accepted` |

A rejected element stays in the workspace. The record that a modelling decision
was considered and turned down is what stops it being proposed again next
quarter, and it costs one line.

**Most insights carry no proposal.** Reasoning, rationale, a risk nobody took up.
Those walk exactly as before, and an insight is never worth less for producing no
element.

**Ambiguity is the reviewer's to settle, not yours.** Where extraction could not
tell which element a claim lands on - the source says "the order" and three
different orders exist - it says so in the proposal. Put the question to them
rather than picking the reading that makes the bundle tidy.

## Only an answer to the insight on screen advances the walk

Not a tangent, not a side note, not agreement with something two turns ago, not
"ok" arriving while the reviewer is thinking about something else. All of that is
welcome and none of it is a decision on the claim in front of them: park it, act
on it, then return to the same insight and ask again.

Read three tangents as three approvals and the reviewer has bulk-approved a
source without reading a line of it, while the transcript shows them apparently
agreeing. If an answer is ambiguous, treat it as not given: asking twice costs a
turn, a false `validated` costs the model its only claim to being checked.

## `validated` is the reviewer's word, never yours

Do not pre-mark insights from your own reading. None of these is validation: the
claim was agreed **inside** the source (that makes it a decision, which still
needs extracting correctly); two sources say the same thing (corroboration raises
`confidence`); or the claim is obviously true.

Everything starts at `proposed`. `confidence` is what you think of the evidence,
`status` is what the reviewer thinks of your extraction, and conflating them
produces a workspace that looks reviewed and is not. If a walk begins on a
workspace already carrying `validated` statuses no reviewer gave, reset them and
say so.

## What the reviewer's answer may do

| The answer | The effect |
| --- | --- |
| confirms the claim | status becomes `validated` |
| rejects it | status becomes `disputed`, and the claim stays in the workspace |
| corrects the wording | the text changes, the source text does not, and you show the corrected claim back before moving on |
| explains what a term meant | goes in `context`, and may resolve an apparent contradiction |
| introduces something new | nothing, until it has a source of its own |

The enum is `proposed`, `validated`, `disputed`, `retired` and nothing else - a
rejected claim is `disputed`, not `invalidated`. Ask the CLI rather than
inventing a word that reads right.

Show a correction back before moving on. Not as a question - they have answered -
but as one line they can catch. A correction is where the author is most likely
to introduce a new error: just told they misread something, rewriting under that
pressure, reviewer already moving on.

The last row is the one that gets bent. A reviewer supplying a fact is supplying
a claim, and a claim needs evidence: ask where it came from and register that
first, even if it is a corridor conversation with a named person on a date. An
unsourced claim sitting among sourced ones reads as sourced.

## Commit and push after every source

Not at the end of the walk. A source is the natural unit: finish it, record the
statuses, commit with what the reviewer said, and push. Reviewers get pulled away
mid-session, and work that exists only locally then gets redone or summarised.

The commit message carries what the reviewer actually said, not just the count -
their wording is often the only record of why a claim was accepted in that form.

Run `ubml validate .` first, every time. A status flip is an edit and a reworded
claim is an edit; the zero-errors rule has no exception for small ones. Recording
a correction is exactly when a schema violation gets introduced, because you are
editing YAML while thinking about something else.

## Invariants

- One insight per turn. A batch is faster for the author and useless to the
  reviewer, who then approves in bulk without reading.
- Everything starts `proposed`. The author sets `confidence`, the reviewer sets
  `status`, and neither writes the other's field.
- Never renumber IDs to make the walk tidy - anything citing an ID would
  silently point elsewhere. Gaps and out-of-order IDs are correct.
- Record the outcome as you go. A walk interrupted halfway must leave the
  workspace consistent with how far it got.
- Finish with what is still `proposed`, named, not counted.
