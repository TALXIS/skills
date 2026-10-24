> **Needed because:** txc has no command that lists a workspace's projects by role, and `txc workspace explain` / `project explain` print a fixed string instead of inspecting the repository.
> **Remove when:** those commands inspect the workspace and carry this default (TOOLING-BACKLOG T14, T17).

# Layout, naming and project roles

Every skill speaks in **roles** (`<data-model solution>`, `<plugin project>`, ...).
Resolve each role to a real project folder before running a command that names one.

## Precedence

1. The repository's existing convention — folders, project names, naming. Route new
   work into the existing structure; never rename, move or duplicate projects to
   match the default below.
2. Otherwise, an explicit instruction from the user.
3. Otherwise, the default below — meant for a repository with no convention yet.

## Default layout

Everything under `src/`, one solution project per concern (each is one Dataverse
solution), so schema, logic, UI and access changes stay out of each other's diffs.
Solution projects are the hub: they `ProjectReference` the plugin, script, code app
and page projects they ship (the build SDK recognises the referenced type); the
package project references the solutions, and that order drives import order.

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
combine concerns in one; route by what a solution contains, as in
[layering](../../deploy/references/layering.md).

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

- Logical names lowercase with the publisher prefix; display names Proper Case.
- Publisher prefix: lowercase alphanumeric, 5 characters or fewer.
- Trunk-based topic branches `users/<name>/<topic>` (`deploy` skill, CI/CD reference).
- CI definitions live where the host requires them (GitHub Actions: `.github/workflows/`).
