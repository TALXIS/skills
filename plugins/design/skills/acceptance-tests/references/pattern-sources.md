> **Needed because:** no txc verb surfaces the feature-file conventions or the test kit's bound step-phrase catalog — they live in two public repos an agent must read directly.
> **Remove when:** the binding catalog and feature-file conventions are queryable through the CLI/docs (TOOLING-BACKLOG T18).

# Pattern sources

Read the specific artifacts, not the repos at large:

- [TALXIS/docs-patterns-practices](https://github.com/TALXIS/docs-patterns-practices)
  — the tests-repo scaffold, feature-file conventions, and fixture format live
  here; locate the testing/BDD section and follow its current layout.
- [TALXIS/tools-testkit-ui](https://github.com/TALXIS/tools-testkit-ui) — the
  test kit (`TALXIS.TestKit.Bindings`) is the **authoritative catalog of bound
  step phrases**: the binding classes' `[Given/When/Then]` attributes define
  every phrase a scenario may use. Search the bindings source for the exact
  attribute strings before using a phrase.

Inside a TALXIS workspace, `txc docs list` may also carry long-form testing
guides — check before assuming absence.
