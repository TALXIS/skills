> **Needed because:** txc has no command that lists a workspace's projects by role, and `txc workspace explain` / `project explain` print a fixed string instead of inspecting the repository.
> **Remove when:** those commands inspect the workspace and carry this default (TOOLING-BACKLOG T14; TALXIS/tools-cli#204, #210).

# Layout, naming and project roles

## Terms

- **Solution file** — the `.slnx` (or `.sln`) at the repository root that lists the
  projects for `dotnet build`. It is not deployed.
- **Dataverse solution** (also "solution project") — a project with `ProjectType=Solution`,
  created by `pp-solution`. It owns the components in its folders and is packed into a
  solution zip imported into Dataverse; by default it is named `Solutions.*`.
- Elsewhere in these skills a bare "solution" and every `<... solution>` placeholder mean a
  Dataverse solution (a project path, never the solution file); the `.slnx` is always
  the "solution file". `txc` command names (`txc env solution pull`, `pp-solution`) are fixed.

Every skill speaks in **roles** (`<data-model solution>`, `<plugin project>`, ...).
Resolve each role to a real project folder before running a command that names one.
**Several roles may resolve to the same project** (one Dataverse solution holding
tables, UI and logic); then there is nothing to create, reference or cross-link between
those roles. A repository with no package project keeps none unless asked; skip the
steps that reference one.

## Precedence

1. The repository's existing convention — folders, project names, how components are
   split across Dataverse solutions. Route new work into the existing structure; never
   rename, move, split or merge projects to match the default below.
2. Otherwise, an explicit instruction from the user (a single Dataverse solution, a
   split by domain or feature, tables and UI together, ...).
3. Otherwise, the default below — meant for a repository with no convention yet.

## Default layout

Everything under `src/`, one Dataverse solution per concern. This is a recommendation,
not a platform rule: schema, logic, UI and access changes stay out of each other's
diffs, and each can be deployed and owned independently. Platform and tooling facts that
hold with any split: a component belongs to the solution that contains it; a form or
view needs its table's definition in the same solution, or a `Behavior=Existing` entity
reference to a table in another solution project; the package project references the
solutions, and that order drives import order. Solution projects are the hub: they
`ProjectReference` the plugin, script, code app and page projects they ship (the build
SDK recognises the referenced type).

| Role (placeholder) | Default folder | Recognise it by |
|---|---|---|
| `<package project>` | `src/Packages.Main` | `ProjectType` PDPackage; references the solutions |
| `<data-model solution>` | `src/Solutions.DataModel` | Solution; tables, columns, relationships, option sets |
| `<logic solution>` | `src/Solutions.Logic` | Solution; `PluginAssemblies/`, `SdkMessageProcessingSteps/` |
| `<ui solution>` | `src/Solutions.UI` | Solution; `AppModules/`, forms and views under `Entities/` |
| `<security solution>` | `src/Solutions.Security` | Solution; `Roles/` |
| `<plugin project>` | `src/Plugins.<Name>` | Plugin |
| `<scripts project>` | `src/Scripts.UI` | ScriptLibrary |
| `<code app project>` | `src/Apps.<Name>` | CodeApp |
| `<page project>` | `src/GenPages.<Name>` | GenPage |
| `<plugin test project>`, `<script test project>`, `<ui test project>` | `src/Tests.Plugins`, `src/Tests.Scripts`, `src/Tests.UI` | no `ProjectType`; test packages (FakeXrmEasy, Jest, Reqnroll + Playwright) |

A solution project keeps its component folders (`Other/`, `Entities/`, ...) in its
`SolutionRootPath` (default: the project folder). Paths like `<ui solution>/Entities/...`
are relative to that root. A repository may split a concern across several solutions or
combine concerns in one; route a component to the solution that holds that concern in
that repository, by what the solutions contain ([layering](../../deploy/references/layering.md)).
Create a new solution project only when asked or when the repository has no home for
the component.

## Resolve the roles in an existing repository

Read the workspace; a name such as `Solutions.UI` is a hint, not proof.

```
dotnet sln list                                                   # all projects (.slnx or .sln)
dotnet sln list | tail -n +3 | xargs grep -iH '<ProjectType>'     # role by project type
dotnet list <package project> reference                           # solutions the package ships
```

Test projects have no `ProjectType`; tell them apart by their package references and
folder contents. Run these from the solution file's folder. Record the resolved folders
once and reuse them.

## Naming defaults

Defaults for a new repository; an existing repository's convention or an explicit
instruction wins (a publisher prefix already in use is never changed).

- Logical names lowercase with the publisher prefix; display names Proper Case.
- Publisher prefix: lowercase alphanumeric, 5 characters or fewer (the template's guidance).
- Trunk-based topic branches `users/<name>/<topic>` (`deploy` skill, CI/CD reference).
- CI definitions live where the host requires them (GitHub Actions: `.github/workflows/`).
