> **Needed because:** txc has no dedicated log command — platform logs are plain Dataverse tables you must know by name, column, and retention behavior.
> **Remove when:** `txc env logs --type plugin-trace|flow-runs|audit|async` ships (TOOLING-BACKLOG T8).

# Dataverse log sources

All four are ordinary tables: query them with `txc env data query sql`
(ad-hoc time-window filters), `fetchxml` (joins, e.g. run → flow name), or
`odata` (single record + expand) — input flags via `--help`. Column names below
are the common ones; **always confirm with `txc env entity describe <table>`
first** — logical names differ from display names.

## flowrun — cloud flow runs

Run history of **solution-aware** cloud flows. Key columns: `name` (run id),
`status`, `starttime`, `endtime`, `errorcode`, `errormessage`, `workflow`
(lookup to the flow definition). Flow definitions live in the `workflow` table
(`category` = 5 for modern flows) — resolve a flow's id by name there first.

Traps: flows outside a solution do not write here — their runs exist only in
the Power Automate portal. Run rows are retained roughly a month.

## plugintracelog — plug-in traces

Trace and exception output of plug-ins and custom workflow activities. Key
columns: `createdon`, `typename`, `messagename`, `primaryentity`, `mode`,
`depth`, `correlationid`, `messageblock` (trace text), `exceptiondetails`,
`performanceexecutionstarttime`, `performanceexecutionduration`.

Traps: rows are written **only** while the organization's plug-in trace
setting is Exception or All — verify via `txc env setting list` before
interpreting an empty result. Rows are purged by a system cleanup job within
about a day: copy relevant `messageblock`/`exceptiondetails` into
`findings.md` immediately. `correlationid` ties together every step of one
originating operation across depths.

## audit — change history

Who changed what, when. Key columns: `createdon`, `operation`
(create/update/delete/access), `action`, `objectid`, `objecttypecode`,
`userid`, `attributemask`.

Traps: rows exist only if auditing was enabled — at the environment level
(`txc env setting list`), on the table, and on the column — *at the time of
the change*; absence of audit rows proves nothing about the change. The
queryable columns carry metadata only (`attributemask` = which columns
changed); old/new **values** require the audit-details API or the record's
audit history UI — note that in findings rather than inferring values.

## asyncoperation — system jobs

Async plug-ins, classic workflows, bulk deletes, solution imports. Key
columns: `name`, `operationtype`, `statecode`/`statuscode` (30 succeeded,
31 failed, 32 canceled), `message` and `friendlymessage` (error text),
`startedon`, `completedon`, `regardingobjectid`, `primaryentitytype`.

Traps: completed jobs are auto-deleted on a system schedule, so old failures
may be gone. `message` holds the raw exception — often the only place the real
error survives after the UI shows a generic one.

## Querying pattern

Filter on the ticket's timestamp ± a few minutes **in UTC**, order descending,
cap the row count; widen the window only when the narrow one is empty. Example
shape (SQL):

```sql
SELECT TOP 50 createdon, typename, messagename, primaryentity, exceptiondetails
FROM plugintracelog
WHERE createdon > '<window-start-utc>' AND createdon < '<window-end-utc>'
ORDER BY createdon DESC
```
