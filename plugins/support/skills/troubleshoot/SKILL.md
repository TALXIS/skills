---
name: troubleshoot
description: Investigates incidents in a deployed app by evidence, not guesswork — extracts identifiers from the ticket, runs targeted read-only queries against records and platform logs through the TALXIS CLI (txc), and writes findings.md, with rca.md and action-plan.md gated behind confirmed evidence. Use when investigating a support ticket, bug report, failed automation, or unexplained data change in a Power Platform / Dataverse environment.
---

# Troubleshoot

**Contract:** read-only investigation. Nothing in the environment is modified —
no records, no settings, no retries of failed jobs. Every statement in the
output files cites evidence actually retrieved (a query result, a log row, a
record); anything not yet observed is labeled an inference or an open question.
Fixes are out of scope — they start from an approved `action-plan.md`.

## Ask the CLI first

```
txc config profile validate     # the profile must target the affected environment
txc env data query --help       # sql | fetchxml | odata — all read-only
txc env entity describe <name>  # column names before constructing any query
txc docs list                   # long-form guides (txc docs get <id>)
```

Piped txc output is JSON by default; every command answers `--help`.

## Sequence

1. **Read the ticket; extract identifiers.** Record ids or URLs, table names,
   the user affected, exact timestamps (note the timezone — Dataverse stores
   UTC), environment, error text verbatim. A missing identifier is a question
   for the reporter — never fill the gap by guessing.
2. **Confirm the target.** `txc config profile validate` — evidence pulled
   from the wrong environment is worse than none.
3. **Look at the named records first.** `txc env data record get` for each id
   from the ticket; `txc env entity describe` before touching any column.
4. **Query the platform logs around the timestamp.** The log sources are
   ordinary Dataverse tables — `flowrun`, `plugintracelog`, `audit`,
   `asyncoperation`. Tables, key columns, and retention traps:
   [references/log-sources.md](references/log-sources.md).
5. **Write `findings.md` as you go.** One entry per probe: the query actually
   run, what came back (rows or their absence), and what that observes —
   nothing more.
6. **Gate: `rca.md`** only once findings contain evidence that confirms a
   cause — a failing log row, a contradicting record state. A plausible story
   that fits the symptoms is not a root cause.
7. **Gate: `action-plan.md`** only after `rca.md` — proposed steps, each
   traceable to a finding, each marked read-only or mutating. Executing the
   plan is a separate, explicitly approved task.

## Invariants

- Read-only means read-only: `data query`, `data record get`,
  `entity describe/list`, `setting list`, `component layer list` are in scope;
  create, update, delete, import, and "harmless" test records are not.
- Observed vs inferred stay visibly distinct: `findings.md` quotes queries and
  rows; interpretation is labeled and lives in `rca.md`.
- An empty result is a finding too ("no flowrun rows in the window") — record
  it, and check retention before treating absence as proof (log-sources.md).
- Timebox: after roughly five queries with no new signal, stop widening the
  search — escalate `findings.md` with its open questions instead of guessing.
- The output files quote real record ids, user names, and environment URLs —
  treat all three as confidential to the customer environment.

## References

- [references/log-sources.md](references/log-sources.md) — the four log
  tables, key columns, filters, and retention traps.

The evidence-before-conclusions gating echoes Matt Pocock's `triage` skill
([github.com/mattpocock/skills](https://github.com/mattpocock/skills)).
