> **Needed because:** whole-project scaffolds (Package, Plugin, PCF, Script Library,
> Code App, Generative Page, test projects, …) are `dotnet new` templates shipped by
> `TALXIS.DevKit.Templates.Dataverse`, not Dataverse component-type enum entries —
> `txc component type list --search <term>` structurally cannot see them.
> **Remove when:** `txc` exposes its own template package's project-level templates
> through a discovery command (T17).

# Find a project-scaffold template

`txc workspace component create <type>` accepts two unrelated kinds of `<type>`,
only one of which `txc` can help you discover:

- **Dataverse component types** (`Entity`, `Form`, `SavedQuery`, `PluginAssembly`, …)
  — discoverable with `txc component type list --search <term>`.
- **Whole-project scaffolds** (`pp-package`, `pp-plugin`, `pp-pcf`,
  `pp-script-library`, `pp-app-code`, `pp-page-generative`, `pp-plugin-test`,
  `pp-test-script`, `pp-test-ui`, …) — `dotnet new` template short names.
  `txc component type list --search <term>` always returns `[]` for these, even
  though the template exists — it is not a bug, it just doesn't index that
  namespace.

Find a project scaffold's short name with `dotnet new list`, filtered on the
vendor's display-name prefix (template `tags` are inconsistent — several project
scaffolds, including `pp-plugin` itself, carry none):

```
dotnet new list | grep -i "power platform"
```

Then feed the short name into the *same* create command used for component types —
`txc workspace component create` handles both namespaces identically once you have
the name:

```
txc workspace component create <shortname> --output <path>
```
