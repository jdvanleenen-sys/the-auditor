---
test: "Test 1 — Recorded cold walk (receipts/TEST_METHOD.md)"
run_date: 2026-09-03
runner: "Fresh general-purpose agent, no memory of this build, given only identity.md, rules.md, examples.md, reference/, README.md, then sample-listing.md. Did not read receipts/ or verify/."
---

# Cold walk — scored against the frozen pass bar

## Score against `receipts/TEST_METHOD.md`, Test 1

| Bar item | Result |
|---|---|
| 1. Verdict for every line L1-L12 | **Clear.** All 12 lines walked, none skipped. |
| 2. Flags L5, L7, L9 as FAIL | **Clear.** All three FAIL, all Violation severity. |
| 3. Does not false-positive L1-L4, L11, L12 | **Clear.** All six PASS. |
| 4. L10 correctly Out of scope, not cited to 3604c/100.75 | **Clear.** Out of scope, no federal citation, correct source-of-income note. |
| 5. Every citation verbatim-checks | **Clear.** See mechanical check below. |
| 6. L6/L8 are judgment calls, any FAIL-with-passing-citation clears | **Clear.** L6 = FAIL/Cautionary, L8 = FAIL/High-risk, both cited correctly. |

**No real miss.** Per Test 5 in `TEST_METHOD.md`, a kept-red fixture only gets built from an actual reproduced mistake — there wasn't one here, so none was fabricated. The five negative fixtures already in `verify/fixtures/` (written during the build, before this walk) stand as the structural-gate coverage.

## Mechanical verbatim check

The walk's 9 FAIL/cited findings (L5-L9) were converted to the audit JSON shape and run through `node verify/check.mjs --file receipts/cold-walk-01.findings.json`: zero anchor or verbatim errors. Every citation the fresh session wrote down matched `reference/` byte for byte with no help from the answer key it wasn't shown.

## Real stumbles, kept in (not misses against the bar, but worth acting on)

The agent's own self-report flagged two genuine ambiguities in `rules.md`, unprompted:

1. **Violation vs. High-risk isn't crisply bounded.** The rule text ("no real ambiguity" vs. "needs a documented judgment call") left room for a careful reader to land one notch differently on a line like L9. The agent's own reasoning shows it resolved this by analogy to the worked examples rather than the rule text alone.
2. **Rule 6's "compounding" language only demonstrates same-class compounding** (the bachelor-pad/single-guy example is sex+sex). The agent had to infer, without the rule saying so, that L6's "young professional" (age-flavored, not one of the seven classes) should NOT compound with "bachelor pad" the way a same-class second clause would.

Acted on: `rules.md` rule 6 gets a one-line clarification in the next commit, addressing point 2 specifically (point 1 is judgment-by-design and stays that way — a bright line here would just move the ambiguity into the bright line's own edge cases).

## Full transcript, verbatim

# Fair Housing Advertising Audit — 3 Maple Ridge Court — Charming 2BR Bungalow

Read order followed: `identity.md` → `rules.md` → `reference/protected-classes.md` → `reference/42-usc-3604c.md` → `reference/24-cfr-100.75.md` → `reference/phrase-guidance.md` → `examples.md` → `README.md` → `sample-listing.md`. Per rule 1, the artifact was read last. `receipts/` and `verify/` were not opened.

This audit checks only the seven federal protected classes named in `reference/protected-classes.md` (race, color, religion, sex, handicap/disability, familial status, national origin) against the two binding provisions in `reference/`: 42 U.S.C. § 3604(c) and 24 CFR § 100.75. It is not legal advice and does not predict how a court or HUD would rule.

---

**Finding — L1**
- Located quote: "Cozy 2-bedroom, 1-bath bungalow on a quiet cul-de-sac, freshly painted, move-in ready." (L1)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. Describes the unit and its condition — bedroom/bathroom count, location type, condition, move-in status. No protected-class language of any kind.
- Note: No judgment call here; nothing in this line refers to occupants, only the property.

---

**Finding — L2**
- Located quote: "Master bedroom features a walk-in closet and large east-facing window." (L2)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. `reference/phrase-guidance.md`, "Explicitly acceptable" list, names both "master bedroom" / "master suite" and "walk-in closets" as descriptions of the property, not the occupant, not violations on their own.
- Note: "Master" is sometimes flagged in lay discussion for unrelated (non-housing) reasons, but the guidance file here treats "master bedroom" as explicitly acceptable, and it does not implicate any of the seven classes, so PASS stands.

---

**Finding — L3**
- Located quote: "Updated kitchen with granite counters, walk to schools and the neighbourhood park in under 10 minutes." (L3)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. `reference/phrase-guidance.md` disability-section note and "Explicitly acceptable" list both specifically clear "walk to schools" as a location/property description, not a requirement of the occupant's body. Rule 6's own example confirms "walk to schools" is never flagged on its own.
- Note: This is the same phrase pattern rule 6 and Example 3 use as the clean half of a contrast pair — here there is no second clause that redirects the subject to the occupant's body, so it stays clean.

---

**Finding — L4**
- Located quote: "Non-smoking unit. Small pets considered with landlord approval." (L4)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. `reference/phrase-guidance.md`, "Explicitly acceptable" list, names "non-smoking" directly. A pet policy conditioned on landlord approval is a lease-term/property-management detail, not a reference to any of the seven protected classes.
- Note: Smoking status and pet ownership are not protected classes under 3604c/100.75 or under the state/local classes rule 5 covers, so this isn't even an out-of-scope candidate — it's simply outside what any fair-housing advertising provision reaches.

---

**Finding — L5**
- Located quote: "No children please — this home is best suited for a quiet, mature couple." (L5)
- Verdict: FAIL
- Severity: Violation
- Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin." Also `3604c` — "To make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement, with respect to the sale or rental of a dwelling that indicates any preference, limitation, or discrimination based on race, color, religion, sex, handicap, familial status, or national origin, or an intention to make any such preference, limitation, or discrimination." `reference/phrase-guidance.md`, familial status: "no children" / "no kids" is listed directly, and "mature couples only" is listed as a related familial-status/age-composition preference.
- Note: This is the same textbook phrase as Example 1 in `examples.md` ("no children please"), which was called Violation on its own. Here it's paired with "best suited for a quiet, mature couple," which describes the dwelling as suited to a childless couple — reinforcing, not diluting, the familial-status exclusion. Per rule 6, both clauses are cited in one finding because they're doing the same coded work together. I judged the whole sentence as familial status (excluding households with children), not age — "mature" flavors the phrase but the operative, federally-covered exclusion is "no children," and phrase-guidance itself files "mature couples only" under familial status, not a separate age category.

---

**Finding — L6**
- Located quote: "Perfect bachelor pad for a young professional starting out." (L6)
- Verdict: FAIL
- Severity: Cautionary
- Citation: `100.75c1`, same clause as above. `reference/phrase-guidance.md`, sex: "bachelor pad" is listed as contested, gender- and marital-status-coded language, explicitly flagged as cautionary rather than an automatic violation.
- Note: This is a genuine judgment call. Per rule 6 and Example 2's worked case, "bachelor pad" sitting alone is Cautionary at most, and only escalates when a second clause compounds the same sex/marital-status coding (the rule's own example is "bachelor pad" + "perfect for a single guy"). "For a young professional starting out" doesn't add sex- or marital-status coding — it reads as age/career-stage marketing language, which is not one of the seven federal classes. I considered treating "young professional" as its own out-of-scope finding for age, but decided against it: phrase-guidance doesn't list "young professional" anywhere, it's extremely common neutral rental marketing language, and rule 4 warns against inventing a finding not tied to a citation or the guidance pattern. So this stays a single Cautionary finding on "bachelor pad" alone, with "young professional" noted but not separately flagged.

---

**Finding — L7**
- Located quote: "Ideal for a Christian family looking to be close to their church community." (L7)
- Verdict: FAIL
- Severity: Violation
- Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin." Also `3604c`, same text as above. `reference/phrase-guidance.md`, religion: "Christian roommate" / "Christian housing" is the direct analog — describing the dwelling/occupant fit by religion.
- Note: The sentence describes the property as ideal specifically for a household of one religion, which is squarely the pattern 100.75(c)(1) names — no real ambiguity, hence Violation rather than High-risk or Cautionary. I considered whether "family" also implicates familial status, but favoring "family" wording doesn't exclude households with children (the protected group under familial status), so I did not raise a second protected-class finding on that word.

---

**Finding — L8**
- Located quote: "Must be able-bodied to comfortably manage the exterior stairs to the front door." (L8)
- Verdict: FAIL
- Severity: High-risk
- Citation: `100.75c1` and `3604c`, same texts as above. `reference/phrase-guidance.md`, disability: "must be able-bodied" — "States a physical-capability requirement tied to disability status," flagged with a note that this entry is a synthesized, multi-source (not single-primary-document) entry, to be treated with caution.
- Note: This is nearly identical in structure to Example 3, Finding 2, in `examples.md`, which is exactly why I matched its severity: the sentence's subject is the occupant's body ("must be able-bodied"), not the property, which is what distinguishes it from the clean "walk to..." pattern in rule 6. It's High-risk rather than Violation because it isn't a literal 100.75(c)(1)-(c)(4) textbook example and the underlying phrase-guidance entry itself is flagged as lower-confidence sourcing — a reasonable reader would understand it as a disability-linked requirement, but it needed the phrase-guidance table plus this documented judgment call to get there, which is the definition of High-risk.

---

**Finding — L9**
- Located quote: "English-speaking tenants only, please — makes communication easier for everyone." (L9)
- Verdict: FAIL
- Severity: Violation
- Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin." Also `3604c`, same text as above. `reference/phrase-guidance.md`, national origin: "English speakers only" / "English-speaking only" is listed directly.
- Note: I classified this as Violation rather than High-risk because the phrase states an explicit, unambiguous "only" requirement on its face — the same directness that made "no children please" and "white private home" Violation-level in the worked examples, even though none of those are verbatim 100.75(c) examples either. The justification offered ("makes communication easier for everyone") doesn't change the verdict; the provision doesn't carve out a business-rationale exception, and 3604c/100.75 look at what the statement indicates, not the advertiser's stated intent behind it.

---

**Finding — L10**
- Located quote: "Section 8 vouchers not accepted." (L10)
- Verdict: Out of scope
- Severity: n/a (out-of-scope findings don't carry a federal severity, per rule 5 and Example 2, Finding 2)
- Citation: none. Source of income is not one of the seven classes in `reference/protected-classes.md`, so neither `3604c` nor `100.75` reaches it.
- Note: This is functionally identical to Example 2, Finding 2 in `examples.md` ("no housing vouchers accepted"). Per rule 5, this line may still violate a state or local source-of-income protection (several states and cities do protect voucher-holders), but that's outside what this auditor's two binding federal provisions cover, so it is not scored PASS or FAIL.

---

**Finding — L11**
- Located quote: "Steps from downtown, five minutes to the LRT station, great walk score." (L11)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. Describes the property's location and walkability. `reference/phrase-guidance.md`'s disability-section note treats "walking distance" / "walk to..." phrasing as generally acceptable because it describes the property's location, not a requirement of the occupant's body.
- Note: No occupant characteristic is referenced anywhere in this line — clean on its face.

---

**Finding — L12**
- Located quote: "Rent is $1,850/month plus utilities. First and last month's rent required at signing. Equal Housing Opportunity." (L12)
- Verdict: PASS
- Severity: Pass
- Citation: none needed. Rent amount, utilities, and move-in payment terms are financial/lease terms, not references to any protected class. "Equal Housing Opportunity" is a fair-housing compliance statement, not a violation.
- Note: Nothing here implicates race, color, religion, sex, disability, familial status, or national origin.

---

## Summary

| Line | Verdict | Severity | Class |
|---|---|---|---|
| L1 | PASS | Pass | — |
| L2 | PASS | Pass | — |
| L3 | PASS | Pass | — |
| L4 | PASS | Pass | — |
| L5 | FAIL | Violation | Familial status |
| L6 | FAIL | Cautionary | Sex |
| L7 | FAIL | Violation | Religion |
| L8 | FAIL | High-risk | Disability |
| L9 | FAIL | Violation | National origin |
| L10 | Out of scope | n/a | Source of income (not federal) |
| L11 | PASS | Pass | — |
| L12 | PASS | Pass | — |

All 12 lines were walked and every citation above was copied verbatim from the provision text as read in `reference/42-usc-3604c.md` and `reference/24-cfr-100.75.md`, side by side with the located quote, so a reader can check each finding against `reference/` directly per `identity.md`'s standing instruction.

---

**Self-report:** This took roughly the reasoning equivalent of a single sustained pass — about 8 reads plus one structured pass building 12 findings, no backtracking needed, call it a medium-effort single-turn task in token/turn terms. Nothing in `identity.md` or `rules.md` was confusing. Two things in `reference/` and `rules.md` needed a genuine judgment call rather than being underspecified: (1) how to score explicit-but-non-textbook phrases like "English-speaking tenants only" and "no children please" — Violation vs. High-risk isn't crisply bounded by the rules text beyond "no real ambiguity" vs. "needs a documented judgment call," so two different careful readers could plausibly land one notch apart on L9; (2) rule 6's "compounding" guidance is demonstrated only with same-class compounding (sex+sex in the bachelor-pad/single-guy example), so deciding that a different-class modifier (L6's "young professional," age-flavored) should NOT compound a sex-coded phrase required inferring a boundary the rules never state outright.
