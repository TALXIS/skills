# consulting

Business analysis and process modeling with [UBML](https://github.com/TALXIS/ubml),
TALXIS's open YAML-based business-modeling language. Four skills forming one
evidence-first pipeline: a discovery source is registered and mined into insights,
every insight is walked with a stakeholder until they confirm or reject it, the
confirmed ones are promoted into the operational model, and nothing commits
without validation.

The chain the plugin exists to protect is **source, then insight, then model**.
Any field in the resulting model walks back to the sentence someone said, and to
the moment a human agreed it should be modelled that way.

| Skill | Use when… |
|---|---|
| `extract-insights` | a transcript, interview or document arrives and the workspace should learn from it |
| `validate-insights` | extracted claims and the elements they propose need signing off, one bundle at a time |
| `promote-to-model` | the joins no single insight could decide - merges, ordering, entry and exit points |
| `validate-model` | schema and cross-reference checking a workspace; gating every commit on zero errors |

Each skill steers the agent to the [`ubml` CLI](https://github.com/TALXIS/ubml)
for the *how*. `sources` and `insights` are 1.4 document types, so pin the major
version: `npx ubml@1.4 <command>`.

Worth pinning rather than trusting whatever is installed. In 1.3, `validate` on
a directory ran only the id cross-reference pass: it accepted illegal enum
values, invented properties and missing required fields without a word, so a
clean bill of health meant only that the YAML parsed.

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install consulting@talxis
```

## Try it

Point the agent at a directory of discovery material and say "model this business
in UBML". `extract-insights` registers the source and mines it; the pipeline takes
it from there through review, promotion and validation.
