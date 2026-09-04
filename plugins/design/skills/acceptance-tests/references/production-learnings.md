> **Needed because:** each rule was learned from a real defect or a withdrawn finding across two production runs on the same sprint backlog — one decomposed per AC bullet, one re-decomposed by journey. None is derivable from the contract alone.
> **Remove when:** each is enforced by tooling — a two-part gate in the UI test project's CI, and an AC-fetch path that parses HTML properly (pattern repo / TOOLING-BACKLOG).

# Production learnings

Apply as rules. Each cost a defect.

## The gate

1. **The compiler catches nothing.** Bindings resolve at **runtime**, and the
   default `missingOrPendingStepsOutcome` is `Inconclusive` — so a typo'd step
   reports as *skipped* and the run is green. Four documents in one repo claimed CI
   proved otherwise. Set the outcome to `Error` and ship the gate.
2. **"Resolves" is not "works".** A whole binding layer can be
   `PendingStepException` stubs: 49 phrases, 56 throws, zero implementations. Flag
   bindings that only throw, or a full run reports success having executed almost
   nothing.
3. **A duplicate binding for one phrase is a runtime-only ambiguity error** —
   invisible to the build and to `--list-tests`.
4. **The phrase gate is half the job.** It cannot see that the *argument* is the
   wrong kind. See [identifier-kinds.md](identifier-kinds.md); one pass found ten
   such steps that bound cleanly and could match nothing.
5. **Fixture integrity is invisible to both gates**, because a fixture is valid
   JSON either way. Found in one pass: a dependency record seeded with a type and
   no endpoints, a "two assigned tasks" fixture assigning nobody, and one `@alias`
   declared in two files. Check that every asserted record exists in the data its
   scenario creates.

## Data

6. **Test users cannot be fixtures.** Record creation cannot deep-insert system
   users. Pre-provision named accounts per environment and exempt those names in
   the integrity check *with a pointer to the tracking item*, so the exemption dies
   when provisioning does.
7. **No per-run unique value means no parallelism.** Faker offers number and date
   only — no string or uuid — so 19 of 30 fixtures ended up creating a project
   called the same thing, asserted 57 times. Survives serial runs; breaks the
   moment scenarios are distributed across users.
8. **Never encode a fake mechanism in a fixture.** A text column standing in for
   derived behaviour makes the test pass against a wrong implementation. Leave it
   pending with the blocker named.
9. **Do not write fixtures for an entity that does not exist yet.** Declare the
   setup as a data step instead, so the column names get chosen once, by whoever
   writes the binding, after the schema exists.

## Dates and personas

10. **No time-travel dates.** Anything compared against *today* must be relative —
    a membership that ended yesterday, one starting tomorrow. A pinned date is a
    test with an expiry.
11. **State the calendar anchor.** Working-day arithmetic holds only for specific
    weekdays. Say which weekday the chosen date is, in the file.
12. **Pick the persona that can fail.** An omission scenario run as a persona with
    global read rights can never pass. Choose the scoped persona and grant its
    access explicitly.

## Reading the story

13. **Parse acceptance-criteria HTML with a real parser.** Splitting on tags drops
    any bullet whose text sits inside an inline element, which manufactures
    "the AC lacks X" findings. One run withdrew six findings and one wrong decision
    taken this way.
14. **Definition Ready does not mean it is.** In one sprint all 18 stories carried
    that state and three named no entity at all. Writing the test is the fastest
    demonstration — file the story as blocked, tag the file, and keep it.
15. **When a story offers a weak and a strong version, write both.** "Minimum: an
    error. Optional but ideal: they never see the option." A file asserting only
    the minimum accepts the weaker build permanently and nobody sees which shipped.
16. **Name the one value each AC bullet would assert.** Anything unnameable is a
    defect. Four of ten backlog defects in one audit surfaced only at that depth —
    a type, a total, a column name, a folder path.

## Writing

17. **Assert a notification by its parts, not its text.** Localized strings
    containing formatted dates fail on the date, and test users run a different
    language from the string.
18. **Enter durations as explicit text** — `10` in a duration field means ten
    minutes; type `10 days`.
19. **Tags cannot contain whitespace.** `@app:Project Management` is a hard build
    error. Slug the tag; keep the display name in step text.
20. **State deliberate exclusions.** A suite with no negative scenarios reads as an
    oversight unless the coverage report says it was a decision.
