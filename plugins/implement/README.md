# implement

Build TALXIS / Power Platform apps in a local-first monorepo. Seven skills, one per
developer intent — each steers the agent to the
[TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli) for the *how* and carries
only what the CLI can't answer yet. Installing this plugin also registers the `txc`
MCP server.

| Skill | Use when… |
|---|---|
| `init` | beginning a session: check workspace state, scaffold a new project, orient in an existing one |
| `data-model` | creating database tables, columns, relationships, enumerations |
| `backend` | server-side validation, automation, business rules |
| `frontend` | screens, pages, forms, lists, navigation, UI components |
| `security` | roles, permissions, who-can-do-what |
| `test` | unit tests and end-to-end UI tests |
| `deploy` | environments, deploying, release pipeline |

Each skill's `references/` holds detailed recipes that exist only because of a
current `txc` gap — every file names the fix that deletes it
(see [TOOLING-BACKLOG.md](../../TOOLING-BACKLOG.md)).

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install implement@talxis
```
