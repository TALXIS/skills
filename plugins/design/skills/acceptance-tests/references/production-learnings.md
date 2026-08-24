> **Needed because:** these rules were each learned from a real defect or a false finding in the skill's first production run (a full sprint backlog, ~160 scenarios); none of them is derivable from the contract alone.
> **Remove when:** each rule is enforced by tooling — a fixture-integrity checker in the tests-repo scaffold's CI, and an AC-fetch path that parses HTML properly (candidates for the pattern repo / TOOLING-BACKLOG).

# Production learnings

Apply as rules, not suggestions. Each cost a defect to learn.

1. **Fixture integrity is the failure mode, not step bindings.** The compiler
   catches unbound phrases; nothing catches an assertion naming a record no
   fixture seeds — a dependency the cascade scenarios assert but the group
   fixture never contains, a record a `Background:` never creates. Extend
   self-validation with: *every asserted record name exists in the fixture data
   the scenario creates, or was typed earlier in it* — and commit that check to
   the tests repo's CI so it cannot regress.
2. **Parse acceptance-criteria HTML with a real parser.** Work-item fields store
   HTML; splitting it on tags drops any bullet whose text sits inside an inline
   element, which manufactures "empty bullet" / "the AC lacks X" findings.
   Re-verify every missing-content claim against the raw HTML before reporting
   it — one run had six findings withdrawn and one wrong decision taken this way.
3. **No time-travel dates.** Asserting access or state "on <fixed date>" needs a
   mocked clock. Express windows relative to today: a membership that ended
   yesterday, one starting tomorrow.
4. **State the calendar anchor.** Working-day arithmetic holds only for specific
   weekdays; say in the feature file which weekday the chosen date is, or the
   assertion reads as arbitrary and breaks silently when dates are edited.
5. **Pick the persona that can fail.** An omission scenario ("the list hides
   what you cannot access") run as a persona with global read rights can never
   pass. Choose the scoped persona and grant its access explicitly in Givens.
6. **Never encode a fake mechanism in a fixture.** A text column standing in for
   derived behaviour (e.g. an owner's name) makes the test pass against a wrong
   implementation. Leave the scenario pending instead, with the blocker named.
7. **Logical names come from the agreed schema, labels from the AC.** When
   engineering has an entity model, it beats the AC on logical names; step text
   keeps the customer's vocabulary. Keep the split deliberate and stated.
8. **Test users cannot be fixtures.** Record creation cannot deep-insert system
   users. Pre-provision named test accounts per environment; exempt those names
   in the integrity check *with a pointer to the tracking item*, so the
   exemption dies when provisioning is solved.
9. **State deliberate exclusions.** A suite with no negative scenarios reads as
   an oversight unless the coverage report says it was a decision.
10. **Enter durations as explicit text** — typing `10` into a duration field
    means ten minutes; type `10 days`.
11. **Tags cannot contain whitespace** — `@app:Project Management` is a hard
    build error; slug the tag and keep the display name in step text.
12. **Triage assertion strength.** Enter-and-read-back scenarios are legitimate
    field-inventory pins while the app does not exist, but they must be a
    declared minority — report the behaviour/presence/echo split so reviewers
    can judge it.
