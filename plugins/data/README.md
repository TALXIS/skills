# data

Data lifecycle skills for TALXIS / Power Platform projects — thin skills that steer
the agent to the [TALXIS CLI (`txc`)](https://github.com/TALXIS/tools-cli) for the
*how* and carry only what the CLI can't answer yet. Installing this plugin also
registers the `txc` MCP server.

| Skill | Use when… |
|---|---|
| `test-data` | provisioning repeatable test/reference data: grow the project's existing deployable data package (CMT, stable GUIDs), stage records live, round-trip via `txc data package export`, prove the import in a fresh environment |

Each skill's `references/` holds detailed recipes that exist only because of a
current `txc` gap — every file names the fix that deletes it
(see [TOOLING-BACKLOG.md](../../TOOLING-BACKLOG.md)).

Planned next:

- **data-querying** — routing between SQL / OData / FetchXML live queries.
- **reports** and **integration** — later.

## Install

```
/plugin marketplace add TALXIS/skills
/plugin install data@talxis
```
