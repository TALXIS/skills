# design

Decide what to build, before building it. Three skills that read a TALXIS workspace
and write documents — **nothing is scaffolded, built, or deployed here**. The
[`implement`](../implement/) plugin does that, and reads what this one writes.

| Skill | Use when… |
|---|---|
| `personas` | working out who the system is for — roles, their jobs, and the authority they hold |
| `spec` | a change needs designing: the data model, where each behaviour runs, the user flows |
| `features` | you want the acceptance criteria — Gherkin `.feature` files, one per job |

Each skill owns one file, so run only the ones you need. They work in either
situation — **an empty folder**, designing a new system from a problem statement,
or **an existing repository**, where the skills read what is already there and
design around it.

## The chain

```
personas.md  →  solution-design.md  →  features/*.feature
```

Each step reads the one before it, and each stands alone if you skip it.

`spec` writes **`solution-design.md`** with a fixed set of sections:

```
Context · Existing · Jobs to be done · Data model · Logic · User flows ·
Out of scope · Open questions
```

It stands alone as a reviewable document, and `implement:builder` reads it instead of
re-asking. `features` turns its **User flows** into `features/*.feature`, which
`implement:test` scaffolds into a running test project.

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install design@talxis
```

Then, against an existing repository:

```
/design:spec "let dispatchers reassign a visit and notify the technician"
```

Or in an empty folder, starting something new:

```
/design:personas "a field service company scheduling engineer visits"
```

## Planned

- **`ui`** — a description of the interface, rendered as a **Fluent UI prototype in
  a Claude Artifact** so a design team can react to something real rather than prose.
- **backlog decomposition** — splitting an agreed design into work items.

These land here as further skills.

Design knowledge lives inline in the skills rather than in `references/` — a
`references/` file must name the `txc` gap that deletes it (see
[CONTRIBUTING.md](../../CONTRIBUTING.md)), and design guidance is never deletable.
