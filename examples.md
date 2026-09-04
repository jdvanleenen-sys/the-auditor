# Worked examples

Three short audits. Each shows the report shape from `rules.md`: located quote, verdict, severity, citation. These snippets are illustrative only, written separately from `reference/fair-housing/sample-listing.md` (the artifact this build's tests audit) so reading this file doesn't hand you the answer to that audit.

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
