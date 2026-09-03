> **Needed because:** the test kit's step contracts disagree with each other and nothing surfaces which kind a step takes; the parameter names are wrong on several steps, so even reading them misleads.
> **Remove when:** the kit's field steps accept a display label as a fallback and the parameter names match what they take (tools-testkit-ui; TOOLING-BACKLOG T18).

# Four identifier kinds, and the gate that cannot see three of them

Every quoted string in a scenario is one of four things, and **which one depends on
the step**. A blanket rewrite in either direction breaks the other half.

| Kind | Example steps |
|---|---|
| display **label** | `I enter '<v>' into the '<f>' field on the form` · `I should be able to see a value of '<v>' in the '<f>' field` · `the '<f>' field should be (mandatory\|optional)` · table forms |
| attribute **logical name** | `I should (not) be able to see the '<f>' field` · `I should (not) be able to edit the '<f>' field` · the lookup column in `… a record with a reference to '<a>' in the '<f>' lookup field` |
| fixture **@alias** | `I have opened '<a>'` · `the '<s>' subgrid should contain '<a>'` · `I select '<a>' from the '<s>' subgrid` · `the grid should contain '<a>'` · `I should not be able to see '<a>' in the '<s>' subgrid` · the `following records` table |
| literal **value** | `the '<s>' subgrid should contain a record with '<v>' in the '<f>' <type> field` · `I select a record with '<v>' in the '<f>' field in the '<s>' subgrid` · `I select '<v>' in the lookup dialog` |

Check the binding's own parameter before phrasing a step. Be warned that the
parameter *name* is wrong on some of them — `fieldLabel` appears on steps that
take a logical name.

## The alias kind is the dangerous one

It looks like a name and behaves like a key. The kit resolves the alias to the
created record's GUID and matches grid rows on `getEntity().getId()`, so **a
display name binds cleanly and matches nothing** — a green phrase gate over a
scenario that cannot pass.

Consequence worth stating on its own: **a record created through the UI inside the
scenario has no alias at all.** Assert it with the value-and-field form.

## Two gates, because neither catches what the other does

1. **Phrase resolution.** Match each step against every binding's regex, the way
   the runner does. Fixed-string comparison against the assembly is not enough: it
   cannot see alternations, and it cannot see that a step constraining its argument
   (`'(true|false)'`, `'(\d+)'`) rejects an arbitrary word.
2. **Argument kind and data.** Every alias resolves to a declared `@alias`; every
   asserted record exists in the fixture data its scenario creates or was typed
   earlier in it; every `I have created` resolves to a fixture file.

Both must expand `Scenario Outline` per `Examples:` row, or every placeholder reads
as an unknown record.

**Prove the gate fails.** Seed a typo and watch it go red. A gate that passes while
checking nothing is worse than no gate — it has happened.

## Language-bound reference classes

Four of six resolve by **localized** caption; two do not.

| Class | Language-bound |
|---|---|
| fields, subgrids | no |
| tabs, apps, sitemap groups and sub-areas, option-set values | **yes** |

Test accounts run `uilanguageid = 1033`, set **per user** — never on the
environment, because the customer is testing in their own language in the same
org. Cover the gap that opens with one deliberate scenario in the customer's
language.
