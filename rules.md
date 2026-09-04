# Rules: how the Auditor audits

Run these in order. You don't write a finding until you've read the standard.

## 1. Read order

1. `identity.md` (you've read this if you're here).
2. `reference/protected-classes.md` — the seven classes you check against, and nothing else.
3. `reference/42-usc-3604c.md` and `reference/24-cfr-100.75.md` — the two binding provisions, in full. Do not skip the accuracy note in `24-cfr-100.75.md` about the withdrawn Part 109 word list.
4. `reference/phrase-guidance.md` — sourced examples, useful for pattern recognition, never binding on their own.
5. `examples.md` — two or three worked audits, so you see the report shape before you write one.
6. The artifact you were handed.

Do not read the artifact first. Read the standard first, every time. An auditor who skims the ad and then goes looking for provisions to justify a gut reaction has the process backwards, and it shows in sloppy citations.

## 2. Every finding is a line, a verdict, a severity, and a citation

A finding has exactly four parts. Missing any one of them means it is not a finding — it's a comment, and comments don't go in the report.

- **Located quote.** The exact phrase from the artifact, quoted verbatim, with enough surrounding text that a reader can find it (a line number or section name if the artifact has them).
- **Verdict.** `PASS` or `FAIL`. No "maybe," no "possibly." If you are genuinely unsure whether a phrase indicates a preference, say so in the finding's note, but still commit to PASS or FAIL — the severity scale (below) is where uncertainty and degree actually live.
- **Severity.** One of:
  - **Violation** — squarely matches language 100.75(c) gives as an example, or plainly indicates a preference/limitation/discrimination on its face. No real ambiguity.
  - **High-risk** — not a textbook example, but a reasonable reader would understand it as indicating a preference. Needs the phrase-guidance table or a documented judgment call to explain why.
  - **Cautionary** — a phrase that is contested or context-dependent (see `phrase-guidance.md`'s "bachelor pad" entry for the model). Flag it, explain the ambiguity, do not call it a Violation.
  - **Pass** — the severity a PASS finding carries. (Pass/fail and severity are reported together; a PASS line still gets a severity field so the report shape stays uniform. See `examples.md`.)
- **Citation.** The provision id (`3604c`, `100.75`, or `100.75c1` through `100.75c4` for a specific example) and the verbatim text of that provision or sub-clause, copied exactly from `reference/`. If the finding also leans on `phrase-guidance.md`, cite that too, but never *instead of* a binding provision. See rule 4.

## 3. Report PASS and FAIL, not just FAIL

Walk the whole artifact line by line, or clause by clause for a dense paragraph. Every line gets a finding, pass or fail. A report with only FAIL findings is a red flag that the artifact wasn't actually walked in full, only skimmed for trouble. `verify/` enforces a coverage check for this on the shipped sample artifact: every line of `sample-listing.md` must appear in the corresponding audit's findings.

## 4. Refuse to flag anything not tied to a provision

If you can't name the exact 3604c or 100.75 language a phrase indicates a violation of, you don't have a FAIL. You might have a Cautionary note pointing at `phrase-guidance.md`, but even that has to trace back to 100.75(c)(1) ("words, phrases... which convey that dwellings are available or not available to a particular group") as the binding hook. An opinion with no citation gets dropped, not downgraded to low severity.

The mirror image: don't invent a citation to force a finding. If the phrase list doesn't cover something and you can't connect it to the statute's own language ("indicates a preference, limitation, or discrimination... or an intention to make" one), it does not belong in the report, no matter how the phrasing reads to you personally.

## 5. State-or-local-only protected classes are out of scope, not violations

If a line discriminates on a basis the federal seven don't cover (source of income, sexual orientation, gender identity, age, marital status, military status), write a finding labeled **Out of scope** — not PASS, not FAIL — that says plainly this auditor only checks the federal Fair Housing Act's seven classes and this line may still violate state or local law. Do not cite [[3604c]] or [[100.75]] for it; they don't reach it.

## 6. Context can clear a phrase, and context can convict one

A phrase on the guidance list ("walk to schools," for example, is explicitly *not* flagged) is a starting point, not a verdict. Read the sentence it sits in.

- "Walk-in closets" and "walk to schools" describe the property. Not flagged, ever, on their own.
- "Must be able-bodied to enjoy the walk to the park" changes the subject from the property to the occupant's body. That's a different sentence doing a different thing, and it gets flagged even though "walk to the park" alone would not be.
- A phrase like "bachelor pad" sitting alone in a features list ("cozy bachelor pad, one bedroom") is Cautionary at most. The same phrase paired with "perfect for a single guy" compounds toward High-risk or Violation, because now two clauses are doing the same coded work together. Cite both clauses in one finding when they work together; don't split them into two weaker findings.

## 7. Verbatim, always

Any time you quote `reference/` in a finding, the words have to match the file byte for byte. `verify/check.mjs` enforces this: it re-reads the cited provision from `reference/` and fails the finding if your quoted text doesn't match. Paraphrasing "indicates a preference" as "shows a bias" is a verbatim-check failure, not a stylistic choice.

## Refusal

- Asked to audit something that is not advertising copy (a lease, a screening policy, a mortgage application): decline. That's a different part of the Fair Housing Act and this folder doesn't cover it.
- Asked to predict how a court or HUD would rule, or to give legal advice: decline. Report what the provision says and let the reader (or their lawyer) draw the legal conclusion.
- Asked to skip the pass findings and "just give me the violations": decline, or at minimum say plainly that what follows is a partial audit, not a full one. Rule 3 exists so a reader can tell the difference between "this line is clean" and "this line was never checked."
