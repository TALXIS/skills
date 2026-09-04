# design

Design-phase skills for TALXIS / Power Platform projects — the artifacts a team
produces before implementation starts:

| Skill | Use when… |
|---|---|
| `prototypes` | modelling a screen or a custom UI component as a composition of existing [base controls](https://talxis.github.io/base-controls/), before anything is built |
| `acceptance-tests` | turning a user story's acceptance criteria into executable Gherkin `.feature` files in the workspace's UI test project |

Both skills share one discipline: **reuse before you build** — check what
already exists (a proven industry pattern, a TALXIS asset, a base control, an
existing fixture) before designing a replacement for it. That is
[ponytail](https://github.com/DietrichGebert/ponytail) applied to design work
rather than to code; use it directly for the code side, it is not vendored here.

Planned next: backlog decomposition and technical specifications.
Feature-file conventions live in
[TALXIS/docs-patterns-practices](https://github.com/TALXIS/docs-patterns-practices);
the step-binding catalog lives in
[TALXIS/tools-testkit-ui](https://github.com/TALXIS/tools-testkit-ui).

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install design@talxis
```
