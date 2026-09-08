---
name: validate-model
description: Validates a UBML business-modeling workspace - schema and cross-reference checks through the ubml CLI - and gates every commit on zero errors. Final step of the extract-insights → validate-insights → promote-to-model → validate-model pipeline. Use when checking a UBML business-modeling workspace before commit, after any edit to UBML files, or when ubml validation errors need diagnosing.
---

# Validate model

**Contract:** a workspace that does not validate is never committed. Zero errors
is the only pass; warnings are budgeted, not ignored. Validation never fixes by
inventing data - a failure routes back to the step that owns it:
`extract-insights` for evidence gaps and unsourced claims, `validate-insights`
for anything promoted without a reviewer, `promote-to-model` for dangling
references.

Two things the CLI cannot see for you: whether a cited insight was actually
validated by a reviewer, and whether a claim should have had a source at all.
Those are step 4, and they are yours.

## Ask the CLI first

Pin the major version - `sources` and `insights` are 1.4 document types and
older validators pass an invalid workspace in silence.

```
npx ubml@1.4 --help    # the command surface - the authority
ubml validate --help   # what the validator checks, how to read output
ubml validate .        # validate the whole workspace root
```

A citation of an `SR#####` that does not exist fails like any dangling
reference. Whether the source's `file` pointer still resolves is not checked;
verify that by hand when a source is added.

`--suppress-unused` is for the routine gate - insight and term ids are
legitimately unreferenced until the model is promoted from them. Never make it
the only way you run the validator: those warnings are the audit in step 4.

## Sequence

1. **Baseline before editing.** Record the warning count; judgement afterwards
   is relative to it, not to zero.
2. **Validate after every edit.** Errors are fixed by correcting the YAML, never
   by weakening the check. If the validator rejects an edit, the edit is wrong.
3. **Budget the warnings.** Roughly one transient unreferenced-ID warning per
   new ID is expected. Growth beyond that, or a new warning kind, is a
   regression to fix before moving on.
4. **Read the unreviewed count.** `validate` reports how many elements carry
   `reviewStatus: proposed`. Non-zero before a commit that claims the model is
   finished means modelling decisions nobody approved are in it. Mid-review that
   is expected; at handover it is the defect this pipeline exists to prevent.
5. **Check the one thing the CLI still cannot.**

   Read the `status` of every insight a promoted element's `derivedFrom` names.
   A `proposed` one resolves perfectly and is still an element built on an
   unconfirmed claim; a `retired` one was withdrawn and something still rests on
   it. `reviewStatus` says a human approved the modelling, not that the evidence
   under it survived.

   Then run **without** `--suppress-unused` and read the unreferenced insights.
   Most are reasoning the model had no use for, which is normal. You are
   scanning for the one claim about how the business behaves that no element
   type claimed.
6. **Re-read the prose.** Nothing validates the workspace description or README,
   so they go stale in the direction that misleads. Check the counts and the
   tense: "insights not walked yet carry `proposed`" and "these were walked and
   deliberately left open" are the same insights and opposite claims.
7. **Commit only on zero errors.** Stage the UBML documents, nothing else, never
   derived exports. The message says what was added and which source it came
   from.

## Invariants

- Zero errors before commit - no exceptions, no "fix it in the next commit".
- A resolvable reference is not an approved one, and an approved element is not
  a sound one. `reviewStatus: accepted` says a human agreed with the modelling;
  `derivedFrom` pointing at a `proposed` insight says the claim underneath was
  never confirmed. Both have to hold.
- Files are named for the document type, not the subject - splitting by subject
  fragments the workspace by the accident of which subject arrived first. Where
  a type requires a prefix segment (`*.glossary.ubml.yaml` and others - ask the
  CLI rather than guessing), use a word describing the document:
  `business-terms.glossary.ubml.yaml`, not `order-and-collect.glossary.ubml.yaml`.
- No silent fixes: never delete an element or reference to make validation pass;
  surface the conflict instead.
- Unreferenced-element warnings alone do not block, but each must be
  intentional.
- The validator is the CLI's. Never re-implement its checks in ad-hoc scripts or
  reason about schema conformance from memory.
