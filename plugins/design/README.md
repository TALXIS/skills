# design

Decide what to build, before building it. Three skills that read a TALXIS workspace
and write documents — **nothing is scaffolded, built, or deployed here**. The
[`implement`](../implement/) plugin does that, and reads what this one writes.

| Skill | Use when… |
|---|---|
| `personas` | working out who the system is for — roles, their jobs, and the authority they hold |
| `spec` | a change needs designing: the data model, where each behaviour runs, the user flows |
| `features` | you want the acceptance criteria — Gherkin `.feature` files, one per job |

Each skill owns one artifact, so run only the ones you need. They work in either
situation — **an empty folder**, designing a new system from a problem statement,
or **an existing repository**, where the skills read what is already there and
design around it.

## The chain

```
personas.md  →  solution-design.md  →  features/*.feature
                         ↘                      ↙
                         implementation-guide.md
```

Each step reads the one before it, and each stands alone if you skip it.

`spec` writes **`solution-design.md`** with a fixed set of sections:

```
Context · Existing · Jobs to be done · Data model · Logic · User flows ·
Out of scope · Open questions
```

It stands alone as a reviewable document, and `implement:builder` reads it instead of
re-asking. `features` turns its **User flows** into `features/*.feature`, which
`implement:test` places into a running test project.

## The implementation guide

`solution-design.md` is the design of the app — what it does and why, for a person to
review. **`implementation-guide.md`** is the build instruction beside it: what
`implement` should create, so it never has to re-derive that from prose.

**One section, one owner. A skill rewrites its own section and leaves the rest.**

| Section | Owner | Holds |
|---|---|---|
| `Components` | `design:spec` | one row per component — the `pp-*` template it is built from, its solution project, and the job or requirement it satisfies. `implement:builder` builds straight from this. |
| `Security` | `design:spec` | one role per persona, and per table it touches the privileges and the level each is granted at. `implement:security` scaffolds it verbatim. |
| `Step bindings` | `design:features` | which authored Gherkin steps already map to `TALXIS.TestKit.Bindings`, and which still need a `pp-test-ui-step` binding written — unified so one action is one binding. `implement:test` writes exactly the gaps. |

### Security rows use the platform's own vocabulary

Write the values `pp-security-role-privilege` accepts, not the labels the Dataverse UI
shows — a design that says "Local" does not scaffold.

| Privilege types | `Create` `Read` `Write` `Delete` `Append` `AppendTo` `Assign` `Share` |
|---|---|
| **Levels** | `None` · `User` (the UI's *Basic*) · `BusinessUnit` (*Local*) · `ParentChild` (*Deep*) · `Global` |

A type left out defaults to `None`. Privileges attach to a role **by name**, so the
role name in this section must match the persona's role exactly.

`features` discovers the available bindings through the `guide_testing` MCP tool and
maps each step onto an existing one where it can, so the flagged list is the real
gap rather than everything. When that tool is unavailable it says so and marks every
step unverified — it never claims coverage it did not check.

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

Installing this plugin registers the `txc` MCP server, which is where the step-binding
catalog lives. If you also have `implement` installed you get a second instance of it —
harmless, but the real fix is a `txc` CLI surface for the catalog
([TOOLING-BACKLOG](../../TOOLING-BACKLOG.md) T21), after which this plugin drops the
MCP dependency entirely.

## Planned

- **`ui`** — a description of the interface, rendered as a **Fluent UI prototype in
  a Claude Artifact** so a design team can react to something real rather than prose.
- **backlog decomposition** — splitting an agreed design into work items.

These land here as further skills.

Design knowledge lives inline in the skills rather than in `references/` — a
`references/` file must name the `txc` gap that deletes it (see
[CONTRIBUTING.md](../../CONTRIBUTING.md)), and design guidance is never deletable.
