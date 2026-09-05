# Worked examples

Nine short Fair Housing audits, the standard this auditor ships, plus one from `framework-proof/` (WCAG) showing the same report shape holds on a completely different standard. Examples 6-9 lock judgment rules a fixture can't fully grade (an age restriction's real class, coded steering language, compounding's effect on severity, the addiction-history/current-use disability boundary). Each is enforced by rule text or sourced guidance plus the worked example itself, not by `verify/check.mjs` alone. The Fair Housing snippets are illustrative only, written separately from `reference/fair-housing/sample-listing.md` (the artifact this build's tests audit) so reading this file doesn't hand you the answer to that audit.

**Every example below renders in the one pinned report shape** from `rules.md` rule 8: a short header block, one markdown table, a closing scope-caveat line. Not a table sometimes and JSON sometimes and a paragraph write-up some other time. This is the only shape a live report ever takes, on any artifact, however simple or complex. Explanatory notes below a table are teaching material for this file, not part of what a live report outputs. A real report stops at the caveat line.

**Two forms, not one.** The table below is the **compact report form** a human or a live model run actually produces. Example 1 also shows the **checkable findings JSON**, the verbose form that lives in `verify/audits/`, carries the full verbatim provision text, and is what `verify/check.mjs` actually reads to prove a citation is real. That file is static and committed, so it never truncates. Same discipline, two jobs: the report points, the findings file proves the pointer is honest.

## Example 1: a familial-status FAIL next to a clean PASS

**Artifact snippet:** *"Bright 1-bedroom condo, in-suite laundry, no children please, close to transit."*

Subject: the snippet above
Standard: Fair Housing Act advertising rules (42 U.S.C. 3604(c), 24 CFR 100.75)
2 lines walked, 1 pass, 1 fail, 0 out of scope

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | in-suite laundry | PASS | Pass | - | - | Describes a unit feature, not an occupant requirement. |
| 2 | no children please | FAIL | Violation | familial status | 100.75c1, 3604c | States a preference against households with children; matches `phrase-guidance.md`'s "no children" / "no kids." |

A novel phrase unlike anything in `phrase-guidance.md` or the worked examples may pass with no finding at all. Every FAIL above is a flag for a human to review, not a legal ruling.

**The checkable form of Line 2.** This is what `verify/check.mjs` actually reads: the matching entry in `verify/audits/fair-housing/examples.findings.json`, verbatim text and all, unabridged.

```json
{
  "id": "ex1-f2",
  "quote": "no children please",
  "verdict": "FAIL",
  "severity": "Violation",
  "protectedClass": "familial status",
  "citations": [
    {
      "provision": "100.75c1",
      "text": "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin."
    },
    {
      "provision": "3604c",
      "text": "To make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement, with respect to the sale or rental of a dwelling that indicates any preference, limitation, or discrimination based on race, color, religion, sex, handicap, familial status, or national origin, or an intention to make any such preference, limitation, or discrimination."
    }
  ]
}
```

The table above is what you'd actually see in a live run. This JSON is what proves it's honest. The verbatim `text` fields get re-derived from `reference/` and byte-for-byte compared every time `node verify/check.mjs` runs. Every other example below shows only the table form; assume each one has a matching entry in `verify/audits/fair-housing/examples.findings.json` carrying the same full text, the same way. The header block and closing caveat line are also shown only here in full. Every real report includes both every time; they're just not re-typed for every example below, to keep this file readable.

## Example 2: a Cautionary phrase and an Out-of-scope line

**Artifact snippet:** *"Great starter unit, cozy bachelor pad feel. Sorry, no housing vouchers accepted."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | cozy bachelor pad feel | FAIL | Cautionary | sex | 100.75c1 | Contested, sex- and marital-status-coded language about who the unit suits; see `phrase-guidance.md`, sex, "bachelor pad." Nothing else in the sentence compounds it (contrast Example 8). |
| 2 | no housing vouchers accepted | Out of scope | - | source of income (not federal) | - | Source of income isn't one of the seven federal classes; may violate state or local law, which this auditor doesn't check (rule 5). |

Note Line 2's `Severity` is `-`, never `Pass`. Out-of-scope findings don't carry a severity tier at all, per rule 8.

## Example 3: context turns a clean phrase into a finding

**Artifact snippet:** *"Second-floor unit, walk to the LRT station. Must be able-bodied to manage the exterior stairs comfortably."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | walk to the LRT station | PASS | Pass | - | - | "Walk to X" describes the property's location (`phrase-guidance.md`, disability section note). |
| 2 | Must be able-bodied to manage the exterior stairs comfortably | FAIL | High-risk | disability | 100.75c1, 3604c | Not a property description. The subject is the occupant's body, not the stairs. Matches `phrase-guidance.md`, disability, "must be able-bodied." A "walk to X" pattern (Line 1, clean) sitting one sentence from a phrase that changes the subject to the person is exactly rule 6's contrast. |

## Example 4: race and color, coded description

**Artifact snippet:** *"Spacious white private home in a family-oriented pocket of town, close to shopping."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | white private home | FAIL | Violation | race/color | 100.75c1, 3604c | The dwelling is described by the race of its intended occupant, matching `phrase-guidance.md`, race/color, "white housing" / "white private home." Exactly the pattern 100.75(c)(1) names. |
| 2 | close to shopping | PASS | Pass | - | - | Describes the property's location. |

This example exists so `verify/check.mjs` can confirm every one of the seven protected classes in `reference/fair-housing/protected-classes.md` is exercised somewhere across `examples.md` and `reference/fair-housing/sample-listing.md`'s audit. `sample-listing.md` itself never needed a race/color line to stay a realistic single listing, so the class gets its worked example here instead.

## Example 5: applying the Violation vs. High-risk tier test to a new phrase

**Artifact snippet:** *"Quiet building, traditional household preferred, great for anyone who values a settled community."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | traditional household preferred | FAIL | High-risk | familial status | 100.75c1, 3604c | Matches no phrase-guidance entry directly; connects to 100.75c1's own language via one documented inferential step (see note). |

This isn't one of the three phrases `rules.md` rule 2's tier test names ("no children," "must be able-bodied," "bachelor pad"). It's a fourth, to show the test applied cold. Run the test: is the preference on its face, zero inference? No. "Traditional household" doesn't name a class or an occupant trait the way "no children" does; a reader has to take one inferential step, recognizing "traditional household" as familiar euphemistic shorthand (widely documented in fair-housing training material as a stand-in for "no unmarried couples" or "no families with children") rather than a literal description of decor or lifestyle. That one inferential step is exactly rule 2's line between Violation and High-risk. It's not Cautionary either. This isn't a case where reasonable readers disagree it's a preference at all (contrast "bachelor pad," which has a real contested history); the disagreement here, if any, is only about which class it targets, not whether it targets one. Familial status is named because "traditional household" is most commonly documented as a marital-status/family-composition proxy, not because the phrase couldn't also read as age-coded. The auditor names the class the sourced pattern actually points to, not every class a suspicious reader might guess at.

## Example 6: an age restriction is familial status, not out-of-scope age

**Artifact snippet:** *"Quiet 55-and-over community, no residents under 55 permitted, close to shopping and transit."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | 55-and-over community, no residents under 55 permitted | FAIL | High-risk | familial status | 100.75c1, 3604c | An occupancy age floor necessarily excludes households with children (familial status), not the state/local "age" bucket rule 5 names for age discrimination against a person in the abstract. See rule 5b. |

Lawful only if the property qualifies for the Housing for Older Persons Act exemption (42 U.S.C. § 3607(b), cited by name, not one of the two provisions shipped verbatim in `reference/`). The ad's text alone doesn't prove HOPA qualification (generally: 80%+ of units with one resident 55+, published policies and procedures). Flag it and tell the reader to verify the exemption before treating this as compliant. This is explicitly NOT Out-of-scope age. See `rules.md` rule 5's carve-out and rule 5b for the full reasoning.

## Example 7: coded group-preference language with no class named

**Artifact snippet:** *"Great neighbours, full of the right kind of people, in a safe and traditional part of town."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | full of the right kind of people | FAIL | High-risk | (see note) | 100.75c1 | Conveys a group preference under 100.75c1's own "available or not available to a particular group" language, even with no class named outright. See rule 6d. |

No single class is stated, and the artifact gives no further basis to pin down which one. A careful auditor names the ambiguity itself in the `Reason` rather than guessing a class. (A real audit with more context, a specific neighborhood description, or a pattern of similar phrasing might narrow this to race or national origin, per how this coded pattern is documented in steering cases; this snippet alone doesn't supply that context, so the finding says so rather than inventing it.)

## Example 8: compounding escalates the severity

**Artifact snippet:** *"Cozy bachelor pad, ideal for a single guy who wants a low-key place to crash."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | Cozy bachelor pad, ideal for a single guy who wants a low-key place to crash | FAIL | Violation | sex | 100.75c1, 3604c | "Ideal for a single guy" states a sex/marital-status preference close to on its face; "bachelor pad" reinforces the same class rather than diluting it. Compounding takes the higher severity the more direct clause supports. See rule 6e. |

Contrast `sample-listing.md` L6, "Perfect bachelor pad for a young professional starting out": same opening phrase, but the second clause is neutral, doesn't compound at all per rule 6, and L6 correctly stays Cautionary. Same first clause, opposite second clause, opposite outcome. That contrast is the whole rule.

## Example 9: a history of addiction is a protected disability; current use is not

**Artifact snippet:** *"Sober living community; no history of substance abuse, please."*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | no history of substance abuse, please | FAIL | High-risk | disability | 100.75c1, 3604c | A past history of addiction, including being in recovery, is itself a protected disability under the FHA. Excluding applicants for that history is a handicap-based limitation. See `phrase-guidance.md`, disability, "no history of substance abuse." |

**The boundary, stated because it's the one part of this that's easy to get backwards:** a past addiction is protected; ongoing, current illegal drug use is not. "No history of substance abuse" excludes people *for their past*, which is exactly what's protected. That's the FAIL above. A line reading "no current illegal drug use" or "must not be actively using illegal drugs" is a different claim entirely, about present conduct, and current illegal drug use is explicitly carved out of FHA disability protection (National Housing Law Project, "Fair Housing and Reentry," nhlp.org, retrieved 2026-09-05: "current use of illegal substances cannot constitute a disability under the FHA"). Don't let "sober living community" in the same sentence read as evidence either way on its own. A property can legitimately be a sober-living or recovery-focused community; what's flagged here is excluding people *for having a history*, not the property's focus.

## Example 10: proof the framework travels, not a second standard

This auditor ships one standard: Fair Housing, in `reference/`. `framework-proof/wcag/` is not a second thing it checks day to day. It's a working cartridge kept outside `reference/` to prove the checker isn't written for Fair Housing specifically. Same `cartridge.json` shape, same anchor format, same `verify/check.mjs`, run against a different root: `node verify/check.mjs --root framework-proof`. See `framework-proof/README.md`.

**Artifact snippet (from `framework-proof/wcag/sample-page.md`):** *`<a href="/brochure.pdf">Click here</a>` to download more information about the property.*

| Line | Quoted phrase | Verdict | Severity | Class | Provision | Reason |
|---|---|---|---|---|---|---|
| 1 | `<a href="/brochure.pdf">Click here</a> to download more information about the property.` | FAIL | Violation | - | wcag-2.4.4 | "Click here" states no purpose on its own, and nothing programmatically ties the following sentence to the link as its context. |

Same report shape as every Fair Housing example above. WCAG has no protected-class dimension (`Class` is `-`, not because the checker skipped a step, but because that's what a dimensionless cartridge's rows actually look like), just pointed at `framework-proof/wcag/wcag21-aa.md` instead of `reference/fair-housing/`. The full verbatim text lives in `verify/audits/wcag/sample-page.findings.json`, same two-form split as Example 1. See `framework-proof/wcag/sample-page.md` for the full eight-line audit.
