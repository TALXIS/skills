---
name: plugin-development
description: Scaffolds a Dataverse plugin project (pp-plugin) with signing key, writes IPlugin classes, and validates with dotnet build and dotnet publish. Use when adding server-side C# logic to a TALXIS project, writing a Dataverse plugin, validating input on create/update, or implementing transactional business logic.
---

# Develop Dataverse plugins

**Contract:** when this skill ends, `src/Plugins.<Name>` contains the plugin classes,
and `dotnet build` + `dotnet publish` pass in that project. Local only — nothing is
deployed and no cloud environment is touched.

This skill covers the code side only. Registering the assembly and its SDK message
processing steps happens in `Solutions.Logic` — see the `plugin-registration` skill.
The assembly is a build artifact; when and where it runs is Dataverse configuration.

## Hard constraint — net462

The plugin project targets `net462` because the Dataverse plugin sandbox still runs
.NET Framework. Never "upgrade" or retarget it to modern .NET — the assembly would be
rejected at import. Test projects reference it across that gap without moving it (see
the `testing-unit` skill).

## Step 1 — Gather inputs (once)

From the existing workspace (`txc workspace explain` if unsure): `<PublisherName>`,
`<PublisherPrefix>`. For the project: `<Name>` — the domain the plugins serve,
PascalCase (e.g. `Plugins.Inventory`). For each plugin class: the class name, the
target entity, the SDK message (Create/Update/Delete), and the intended stage.

## Step 2 — Create the plugin project (first time only)

Skip if `src/Plugins.<Name>/Plugins.<Name>.csproj` exists. From the repository root:

```
txc workspace component create pp-plugin --output "src/Plugins.<Name>" --param "PublisherName=<PublisherName>" --param "Company=<PublisherName>"
dotnet sln add src/Plugins.<Name>
```

The template creates the `net462` project with a strong-name signing key — Dataverse
requires signed plugin assemblies, so keep the key file in the project.

## Step 3 — Write the plugin classes

One `.cs` file per plugin class in `src/Plugins.<Name>/`, each implementing
`Microsoft.Xrm.Sdk.IPlugin`. Skeleton:

```csharp
using System;
using Microsoft.Xrm.Sdk;

public class <PluginClassName> : IPlugin
{
    public void Execute(IServiceProvider serviceProvider)
    {
        var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
        var factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
        var service = factory.CreateOrganizationService(context.UserId);
        var target = (Entity)context.InputParameters["Target"];
        // logic here — attribute logical names carry the <PublisherPrefix>_ prefix
    }
}
```

## Stage doctrine — decide it while writing the code

The stage is set at registration time, but the code must be written for it:

- **Pre-validation** — runs *before* the database transaction starts. The cheapest
  place to reject bad input: throw `InvalidPluginExecutionException` with a
  user-facing message and nothing has to be rolled back.
- **Post-operation** — runs after the record is written, *still inside* the
  transaction. Put related writes here (e.g. updating a balance when a transaction
  record is created) so they commit or roll back together with the triggering record.

Validation logic never belongs in Post-operation, and dependent writes never belong
in Pre-validation.

## Step 4 — Validate

From `src/Plugins.<Name>`:

```
dotnet build
dotnet publish
```

Both must pass. `dotnet publish` produces the assembly layout that registration
(`pp-plugin-assembly`) consumes.

## Step 5 — Summary

Report the plugin classes created, their intended entity/message/stage, that build
and publish passed, and that nothing was deployed. Next step in one line: register
the assembly and steps in `Solutions.Logic` (`plugin-registration` skill).
