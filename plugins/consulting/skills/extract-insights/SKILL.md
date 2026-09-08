---
name: extract-insights
description: Registers a discovery source in a UBML business-modeling workspace and mines it for insights - pains, opportunities, process facts, decisions, risks, constraints - each traceable to the source it came from and each marked unreviewed until a human confirms it. First step of the extract-insights → validate-insights → promote-to-model → validate-model pipeline. Use when a transcript, interview, document or meeting recording arrives and the workspace should learn from it.
---

# Extract insights

**Contract:** one source in, claims and suggestions out. Register the source,
walk it once, turn every distinct claim into an insight citing it, and where the
claim obviously belongs on a model element, propose that element beside it.
Nothing is interpreted before it is registered, nothing is claimed without a
source, and everything - insight and proposal alike - lands unreviewed.

## Ask the CLI first

```
npx ubml@1.4 init <name>    # scaffold a workspace, never write one by hand
ubml show                   # what the workspace already holds
ubml schema sources         # the document shapes
ubml schema insights
ubml add sources            # scaffold a document that does not exist yet
ubml nextid SR              # allocate every id
```

Never write a UBML file from memory of the schema. If the validator rejects an
edit, the edit is wrong. `add` scaffolds a new document; extending one is a
manual edit.

## Sequence

1. **Frame the workspace.** One workspace document per directory; if two exist,
   ask which is canonical. Name files for the document type, never the subject:
   `insights.ubml.yaml`, not `billing.insights.ubml.yaml`. Elements already
   carry a name and description, so a subject prefix only guarantees a second
   place to look.

2. **Register the source before reading it for meaning.** `SR#####` with name,
   type, date, participants and a `file` pointer to where the artefact lives.
   The workspace records the source, it does not store it. Snapshot anything
   mutable, or the evidence changes under the model.

3. **Walk it once, end to end.** One insight per distinct claim: the claim in
   the speaker's vocabulary, a `kind`, `status: proposed`, the `SR#####`,
   honest `confidence`, `attribution` and `date`, and verbatim source text in
   `context`.

   - `decision` records that a choice was taken; `constraint` records a limit
     the model must respect. Something agreed whose operative content is a
     boundary is a constraint, and how it was reached goes in `notes`.
   - Quote warts included. Widen a quote that does not parse alone rather than
     tidying it; mark a join across non-adjacent passages.

4. **Propose the element the claim would become**, where there obviously is
   one. Write it into the document for its type with `reviewStatus: proposed`
   and `derivedFrom` naming the insight. The reviewer approves the insight and
   the element together, so the interpretation gets reviewed while the source is
   still on screen rather than weeks later in a promotion pass nobody reads.

   Propose only what the claim itself decides. "Customer Service handles the
   call" proposes an actor; it does not decide whether Customer Service and the
   area manager are one role - that is a cross-insight judgement and belongs to
   `promote-to-model`.

   **Most insights propose nothing, and that is the normal case.** Reasoning,
   rationale, a risk nobody took up - none of it has a model element and none of
   it is worth less for that. An insight is never judged by whether it produced
   a proposal.

   Where the claim would land on an element but you cannot tell which - the
   source says "the order" and three different orders exist - that ambiguity is
   the proposal's job to surface. Say so in the proposal's description and let
   the reviewer settle it. Guessing here is how the wrong reading gets promoted.

5. **Link, don't merge.** A second source repeating a claim becomes a second
   insight `related` to the first - silent de-duplication destroys the
   corroboration. Contradictions are related and both stay `proposed`. A later
   source settling an earlier question uses `supersedes`, which takes exactly
   one id; chain them rather than pointing the newest at everything.

6. **A derived source is not a second witness.** Ask where the second source got
   the claim before treating agreement as convergence. A proposal written from a
   client's outline repeats one testimony. Record the restatement, mark it
   derivative in `notes`, and do **not** raise the original's `confidence`:
   otherwise four documents in one paper trail turn a single unverified
   statement into the best-evidenced fact in the workspace.

7. **Close the loop.** Every claim ends up an insight or an explicit "ignored,
   not actionable" note. Say which and how many. Judge that against the source,
   never against a model - capture who is involved, what they do, in what order,
   what they need, and above all why anyone decided any of it.

8. **Re-sweep when the target changes.** Extraction is shaped by what you have
   somewhere to put: a workspace holding only insights leaves structural claims
   behind, because "an order line carries a quantity" reads as mechanics and has
   no file to belong to. When the workspace gains document types, go back over
   the sources already walked - not to re-validate, but for what the earlier pass
   had no reason to see. The tell is a field appearing in a design argument that
   no insight states.

9. **Hand off.** `validate-insights` confirms, `promote-to-model` models,
   nothing commits without `validate-model`.

## Invariants

- Sources before insights, validated insights before model elements.
- Every insight cites a resolvable, pre-registered `SR#####`.
- Everything lands `proposed`. `confidence` is yours, `status` is the
  reviewer's; direct observation high, hearsay low, unattributed flagged.
- A claim that sounds like a model statement still lands as an insight.
- A risk raised and not taken up is still an insight - worth most precisely
  when nobody acted on it.
- Structural statements count. "An order line carries a quantity" reads as
  mechanics and gets dropped, then a design argument runs without it.
- Model the business twin only. Delivery-side content - the consultancy's own
  sprints, contracts, pricing, staffing - stays out.
- Transcripts substitute unfamiliar names for familiar ones. Check proper nouns
  against another source and record the substitution on the source entry.
- Exports are lossy: never commit them, never round-trip edits through them.
