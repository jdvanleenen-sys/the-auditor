# Worked examples

Five short Fair Housing audits, the standard this auditor ships, plus one from `framework-proof/` (WCAG) showing the same report shape holds on a completely different standard. Each shows the shape from `rules.md`: located quote, verdict, severity, citation. The Fair Housing snippets are illustrative only, written separately from `reference/fair-housing/sample-listing.md` (the artifact this build's tests audit) so reading this file doesn't hand you the answer to that audit.

## Example 1 — a familial-status FAIL next to a clean PASS

**Artifact snippet:** *"Bright 1-bedroom condo, in-suite laundry, no children please, close to transit."*

**Finding 1**
- Located quote: "in-suite laundry"
- Verdict: PASS
- Severity: Pass
- Citation: none needed — describes a unit feature, not an occupant requirement. See `reference/fair-housing/phrase-guidance.md`, "Explicitly acceptable."

**Finding 2**
- Located quote: "no children please"
- Verdict: FAIL
- Severity: Violation
- Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin." Also `3604c` — "any notice, statement, or advertisement... that indicates any preference, limitation, or discrimination based on... familial status." Phrase pattern matches `reference/fair-housing/phrase-guidance.md`, familial status, "no children" / "no kids."

## Example 2 — a Cautionary phrase and an Out-of-scope line

**Artifact snippet:** *"Great starter unit, cozy bachelor pad feel. Sorry, no housing vouchers accepted."*

**Finding 1**
- Located quote: "cozy bachelor pad feel"
- Verdict: FAIL
- Severity: Cautionary
- Citation: `100.75c1`, same clause as above. Phrase is contested, not a textbook violation on its own — see `reference/fair-housing/phrase-guidance.md`, sex, "bachelor pad." Flagged because it's sex- and marital-status-coded language conveying who the unit suits, not because the word alone is banned. Per `rules.md` rule 6, this stays Cautionary because nothing else in the sentence compounds it (contrast Example 3, Finding 2, where a second clause pushes a similar phrase to High-risk).

**Finding 2**
- Located quote: "no housing vouchers accepted"
- Verdict: Out of scope
- Severity: n/a (out-of-scope findings don't carry a federal severity)
- Citation: none. Source of income is not one of the seven classes in `reference/fair-housing/protected-classes.md`, so neither `3604c` nor `100.75` reaches it. Per `rules.md` rule 5: note plainly that this may violate a state or local source-of-income protection, which this auditor does not check.

## Example 3 — context turns a clean phrase into a finding

**Artifact snippet:** *"Second-floor unit, walk to the LRT station. Must be able-bodied to manage the exterior stairs comfortably."*

**Finding 1**
- Located quote: "walk to the LRT station"
- Verdict: PASS
- Severity: Pass
- Citation: none needed. "Walk to X" describes the property's location. See `reference/fair-housing/phrase-guidance.md`, disability section note on "walking distance" phrasing.

**Finding 2**
- Located quote: "Must be able-bodied to manage the exterior stairs comfortably"
- Verdict: FAIL
- Severity: High-risk
- Citation: `100.75c1` and `3604c`. This is not a property description — the subject of the sentence is the occupant's body, not the stairs. Matches `reference/fair-housing/phrase-guidance.md`, disability, "must be able-bodied." Per `rules.md` rule 6, this is the case where a "walk to X" pattern (Finding 1, clean) sits one sentence away from a phrase that changes the subject to the person and becomes a finding.

## Example 4 — race and color, coded description

**Artifact snippet:** *"Spacious white private home in a family-oriented pocket of town, close to shopping."*

**Finding 1**
- Located quote: "white private home"
- Verdict: FAIL
- Severity: Violation
- Citation: `100.75c1` — "Using words, phrases... which convey that dwellings are available or not available to a particular group of persons because of race, color..." Also `3604c`. Matches `reference/fair-housing/phrase-guidance.md`, race/color, "white housing" / "white private home." The dwelling is described by the race of its intended occupant, which is exactly the pattern 100.75(c)(1) names.

**Finding 2**
- Located quote: "close to shopping"
- Verdict: PASS
- Severity: Pass
- Citation: none needed — describes the property's location.

This example exists so `verify/check.mjs` can confirm every one of the seven protected classes in `reference/fair-housing/protected-classes.md` is exercised somewhere across `examples.md` and `reference/fair-housing/sample-listing.md`'s audit — `reference/fair-housing/sample-listing.md` itself never needed a race/color line to stay a realistic single listing, so the class gets its worked example here instead.

## Example 5 — applying the Violation vs. High-risk tier test to a new phrase

**Artifact snippet:** *"Quiet building, traditional household preferred — great for anyone who values a settled community."*

**Finding**
- Located quote: "traditional household preferred"
- Verdict: FAIL
- Severity: High-risk
- Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin." Also `3604c`.
- Note: This isn't one of the three phrases `rules.md` rule 2's tier test names ("no children," "must be able-bodied," "bachelor pad") — it's a fourth, to show the test applied cold. Run the test: is the preference on its face, zero inference? No — "traditional household" doesn't name a class or an occupant trait the way "no children" does; a reader has to take one inferential step, recognizing "traditional household" as familiar euphemistic shorthand (widely documented in fair-housing training material as a stand-in for "no unmarried couples" or "no families with children") rather than a literal description of decor or lifestyle. That one inferential step is exactly rule 2's line between Violation and High-risk: on-its-face gets Violation, one inference gets High-risk. It's not Cautionary either — this isn't a case where reasonable readers disagree it's a preference at all (contrast "bachelor pad," which has a real contested history); the disagreement here, if any, is only about which class it targets, not whether it targets one. Familial status is the class named in the citation because "traditional household" is most commonly documented as a marital-status/family-composition proxy, not because the phrase couldn't also read as age-coded — the auditor names the class the sourced pattern actually points to, not every class a suspicious reader might guess at.

## Example 6 — proof the framework travels, not a second standard

This auditor ships one standard: Fair Housing, in `reference/`. `framework-proof/wcag/` is not a second thing it checks day to day — it's a working cartridge kept outside `reference/` to prove the checker isn't written for Fair Housing specifically. Same `cartridge.json` shape, same anchor format, same `verify/check.mjs`, run against a different root: `node verify/check.mjs --root framework-proof`. See `framework-proof/README.md`.

**Artifact snippet (from `framework-proof/wcag/sample-page.md`):** *`<a href="/brochure.pdf">Click here</a>` to download more information about the property.*

**Finding**
- Located quote: `<a href="/brochure.pdf">Click here</a> to download more information about the property.`
- Verdict: FAIL
- Severity: Violation
- Citation: `wcag-2.4.4` — "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context, except where the purpose of the link would be ambiguous to users in general." "Click here" states no purpose on its own, and nothing programmatically ties the following sentence to the link as its context.

Same four parts as every Fair Housing finding above — located quote, verdict, severity, a provision id plus its verbatim text — just pointed at `framework-proof/wcag/wcag21-aa.md` instead of `reference/fair-housing/`. See `framework-proof/wcag/sample-page.md` and `verify/audits/wcag/sample-page.findings.json` for the full eight-line audit.
