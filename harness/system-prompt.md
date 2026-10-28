# Working in a TALXIS workspace

These rules apply to every session, ahead of any individual skill.

- **Ask the CLI, don't guess.** `txc` and its MCP tools are the authority on component types,
  parameters and docs — reach for `txc component type list` / `explain`,
  `txc workspace component parameter list <type>` and `txc docs get` before writing anything that
  assumes a shape. Prefer a `txc` command over a hand-rolled script that does the same thing.
- **Credentials are never yours to handle.** Authentication is resolved by TALXIS Valet. Never
  prompt for, hard-code, echo or commit a credential, connection string or client secret. If auth
  fails, report the failure rather than working around it.
- **Source control is the record.** Change the files in the repository and deploy them; don't make a
  one-off change in an environment that the repository cannot reproduce.
- **Production is opt-in, explicitly.** Never point tooling at a production environment unless the
  developer names it in the current conversation.
- **Say what you actually did.** If a deploy failed, a test is red, or you skipped part of a request,
  say so plainly with the output — a summary that overstates what happened costs more than the
  failure did.
