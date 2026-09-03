> **Needed because:** no txc verb surfaces the BDD method, the feature-file conventions, or the test kit's bound step-phrase catalog — they live in public repos an agent must read directly.
> **Remove when:** the method, the binding catalog and the conventions are queryable through the CLI/docs (TOOLING-BACKLOG T18).

# Pattern sources

Read the specific artifacts, not the repos at large.

- **Method of record:** `TALXIS/docs-patterns-practices` → `bdd-agent-v2`
  (`.github/agents/bdd-planner.agent.md`, `.github/copilot-instructions.md`).
  Adopt it. It already covers journeys over field-by-field coverage, one action
  per scenario, the missing-bindings hand-off schema, inline custom-binding
  comments, and tier detection. **This skill adds only the three gaps it leaves:**
  work-item traceability with a generated coverage index, test-data uniqueness and
  cleanup semantics, and localisation.
- Same repo: the tests-repo scaffold, feature-file conventions, and fixture format.
  Locate the testing/BDD section and follow its current layout.
- [TALXIS/tools-testkit-ui](https://github.com/TALXIS/tools-testkit-ui) — the kit
  (`TALXIS.TestKit.Bindings`) is the **authoritative catalog of bound step
  phrases**: the binding classes' `[Given/When/Then]` attributes define every
  phrase a scenario may use, and their parameters define what each argument is.
  Search the source for the exact attribute strings before using a phrase.

Inside a TALXIS workspace, `txc docs list` may also carry long-form testing
guides — check before assuming absence.

## The superseded method

`bdd-agent-v2` replaces a per-AC-bullet method that a retired wiki page taught.
That method still has a worked example in git history, kept as a **labelled
record with its measured outcome attached** — a scenario count several times the
journey equivalent, over half the assertions about the platform, none executed —
not as a peer option. If a project's existing suite looks like that,
[journeys.md](journeys.md) is the re-decomposition rule.
