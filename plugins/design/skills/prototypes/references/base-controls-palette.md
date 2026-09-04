> **Needed because:** no txc verb enumerates the base-controls palette or answers which existing control covers a given binding — the library ships on its own release train, so an agent must read its own sources to know what exists today.
> **Remove when:** the palette (control inventory + composition levels) is queryable through the CLI/docs (TOOLING-BACKLOG T19).

# The base-controls palette

Three authorities, read in this order. Never answer from memory — the library
releases continuously and the inventory below goes stale by design.

1. **The storybook — <https://talxis.github.io/base-controls/>.** The rendered
   palette and the primary source. Its own sections *are* the ladder in
   `SKILL.md`:

   | Storybook section | Rung |
   |---|---|
   | `Form/Xrm` (Builder, Overview) and `Form/Xrm/Form Context` — Overview plus whole-form Samples | 1 |
   | `Form/Xrm/Custom Components` — replace control presentation, tabs, ribbon, or notifications renderer | 2 |
   | `Form/React compose/Custom Components` — compose custom field content, mix runtime fields with custom content cells, render cells through a custom section component | 3 |
   | `Form/React compose/Layout` — tab breakpoints, section grids, label behavior, cell rowspan/colspan | 4 |
   | the individual control and `Map` stories | 5 |

   Read a rung's stories before claiming it cannot hold an element.

2. **The repository — <https://github.com/TALXIS/base-controls>.**
   `src/components/` is the authoritative inventory; a control with no
   storybook page still exists and is still preferable to bespoke code.

3. **The package — `@talxis/base-controls` (npm).** What a control project
   installs, and what pins the palette version a prototype was drawn against.
   Record that version in the composition spec: a gap is only a gap relative to
   a version.

## Inventory snapshot — verify, never cite

At the time of writing, `src/components/` carried field controls for every
Dataverse column type (`TextField`, `Decimal`, `DateTime`, `Duration`,
`OptionSet`, `MultiSelectOptionSet`, `TwoOptions`, `Lookup`), dataset and grid
surfaces (`DatasetControl`, `Grid`, `TaskGrid`, `GridCellRenderer`,
`GridColumnHeader`, `GridInlineRibbon`), form infrastructure (`Form`, `Ribbon`,
`Notifications`, `NestedControlRenderer`), and `Map`. `Providers/PcfContextProvider`
supplies the PCF context these expect.

This snapshot exists to show the *breadth* of the palette — that a column-type
control never needs writing. It is not a lookup table. Confirm against source 1
or 2 before placing anything on a rung.
