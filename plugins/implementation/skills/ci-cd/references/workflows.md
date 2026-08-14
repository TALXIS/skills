# GitHub Actions workflows

Copy each block into the named file under `.github/workflows/`. Replace
`<SolutionName>` with the repository's `.slnx` solution name. Everything else stays
exact — do not rename the workflows, the jobs, or the `drop` artifact: the branch
ruleset's required status check matches the `build` job name, and `deploy.yml`
downloads the artifact by name from the triggering build run.

## build.yml

```yaml
name: build
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.x'
      # Code app projects build with Vite, which needs Node 20.19+ / 22.12+
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Restore
        run: dotnet restore <SolutionName>.slnx
      - name: Build (validates Dataverse solutions)
        run: dotnet build <SolutionName>.slnx --configuration Release --no-restore
      - name: Publish package
        run: |
          dotnet publish src/Packages.Main/Packages.Main.csproj --configuration Release --no-build -o ./drop
          # The .pdpkg.zip is created alongside the project, not in --output; collect it for deploy
          cp src/Packages.Main/bin/Release/Packages.Main.pdpkg.zip ./drop/
      - uses: actions/upload-artifact@v4
        with:
          name: drop
          path: ./drop/Packages.Main.pdpkg.zip
```

Notes:

- The `.pdpkg.zip` quirk is real: `dotnet publish --output` does not receive the
  package — it lands in `src/Packages.Main/bin/Release/`, hence the explicit `cp`.
- `dotnet build` runs TALXIS workspace validation (XSD schema, duplicate GUIDs), so
  a green `build` check means the Dataverse solutions are structurally valid.

## deploy.yml

```yaml
name: deploy
on:
  workflow_run:
    workflows: [build]
    types: [completed]
    branches: [main]
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: drop
          path: ./drop
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Install txc
        run: dotnet tool install --global TALXIS.CLI

      - name: Configure txc WIF auth
        env:
          AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          DATAVERSE_TEST_URL: ${{ secrets.DATAVERSE_TEST_URL }}
        run: |
          txc config auth add-federated --name ci --tenant $AZURE_TENANT_ID --application-id $AZURE_CLIENT_ID
          txc config connection create test --provider Dataverse --url $DATAVERSE_TEST_URL
          txc config profile create --name ci --auth ci --connection test

      - name: Import TALXIS Grid control package
        run: txc env pkg import TALXIS.Controls.Grid.Package --profile ci

      - name: Deploy package to Test environment
        run: txc env pkg import ./drop/Packages.Main.pdpkg.zip --profile ci
```

Notes:

- `permissions: id-token: write` is what lets the job request an OIDC token from
  GitHub; without it `txc config auth add-federated` has nothing to exchange.
- The txc chain is auth → connection → profile: the `ci` profile binds the federated
  auth to the `test` connection, and every `txc env pkg import` runs `--profile ci`.
- The `TALXIS.Controls.Grid.Package` import is only needed when the workspace uses
  the TALXIS Grid control — drop that step otherwise. Keep any dependency package
  imports before the main package import.
