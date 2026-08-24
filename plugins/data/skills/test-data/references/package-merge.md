> **Needed because:** `txc data package export` emits a complete package for every entity in the schema, so growing an existing curated package means hand-merging single `<entity>` nodes — and the CMT XML carries encoding conventions the CLI neither documents nor validates on merge.
> **Remove when:** `txc data package export` can export selected entities and merge them into an existing package in place (tools-cli change; candidate TOOLING-BACKLOG entry).

# Merging exported CMT data into an existing package

## Curating the `<entity>` block in `data_schema.xml`

Model new blocks on the entities already in the file — the existing schema shows the
conventions in use. Keep:

- the primary id field: `<field ... name="<entity>id" type="guid" primaryKey="true"
  updateCompare="true" />` — this is what makes re-import idempotent (stable GUIDs);
- the primary name/title field;
- every custom-prefix field, marked `customfield="true"` — check the entities already
  in the schema for which prefixes count as custom in this project;
- `statecode`/`statuscode` only when a record's active/inactive state matters to a
  test scenario;
- lookup fields (`type="entityreference" lookupType="<target entity>"`) only when the
  target entity is also seeded by this package.

Skip other out-of-the-box system fields (owner, createdon, …) unless a specific
scenario needs them. An unreviewed dump of everything `entity describe` returns
defeats the curation.

## Merge conventions in `data.xml`

Diff the exported pair against the package's copies and merge in only the `<entity>`
node(s) being touched this iteration. Watch for:

- multi-line text is CRLF-encoded as `&#xD;&#xA;` — keep the encoding, don't
  unescape it;
- booleans are the literal strings `"True"` / `"False"`, capitalized;
- lookups carry both `lookupentity` (target logical name, required) and
  `lookupentityname` (a display hint, not required for import correctness).

When a hand-merge goes wrong, re-export and diff again rather than patching the XML
from memory.

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Import fails with duplicate-detection errors | duplicate-detection override used against a non-empty environment, or the wrong target | re-check the pinned profile; only override duplicate detection on a freshly reset or empty environment |
| Import fails after a hand-merged edit | CRLF encoding unescaped, or booleans written lowercase | re-export via `txc data package export` and diff against its output |
| CI silently skips the package | the package's import-extension data-folder name no longer matches the pipeline's target folder | re-check the import extension class against the pipeline after any package restructuring |
