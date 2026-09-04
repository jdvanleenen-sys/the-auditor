---
id: phrase-guidance
title: "Sourced discriminatory-phrase guidance (not binding law)"
status: guidance
retrieved: 2026-09-03
---

# Sourced discriminatory-phrase guidance

**This file is guidance, not law.** Nothing here is a binding provision. It exists because a specific phrase in an ad is easier to catch against a worked example than against the abstract text of [[3604c]] or [[100.75]] alone. Every finding that leans on this file must ALSO cite [[3604c]] or [[100.75]] (usually 100.75(c)(1), "words, phrases, photographs, illustrations, symbols or forms") — a phrase-guidance citation on its own is not a valid finding. See `rules.md`.

**This table is a bounded heuristic, not an exhaustive list, and can't be made exhaustive.** No finite phrase table can enumerate every way a line could indicate a preference — `verify/check.mjs`'s phrase-sanity check only catches a false PASS on a phrase that's actually written down here. A line that indicates a preference in language this table doesn't happen to cover is still a real FAIL under rules.md rule 4 ("connect it to the statute's own language"); the auditor's judgment, not this table, is the actual first line of defense. Treat every entry below as "at least this," never "only this."

Each entry below is sourced to where it was actually found. HUD's old word-list regulation, 24 CFR Part 109, was withdrawn from the CFR effective May 1, 1996 (directive FR-4029-F-01) and is not current law — see the accuracy note in `24-cfr-100.75.md`. Everything below comes from HUD's successor guidance, the National Fair Housing Alliance, or real-estate-industry fair-housing training material, not from Part 109 itself.

## Familial status

| Phrase | Why it's flagged | Source |
|---|---|---|
| "no children" / "no kids" | States a preference against households with children, a protected class under familial status. | National Fair Housing Alliance, "Responsible Advertising: Understanding the Impact of the Fair Housing Act on Advertising" (nationalfairhousing.org/responsibleadvertising, published 2018-03-13, retrieved 2026-09-03) |
| "adults only" / "adult community" / "adult building" | Describes the occupants by age/family composition rather than the unit; excludes families with children unless the property qualifies for the Housing for Older Persons Act exemption. | MetroTex Association of REALTORS®, "Advertising and Fair Housing — What you can say and what to avoid" (mymetrotex.com, retrieved 2026-09-03) |
| "mature couples only" | States an age/family-composition preference. | Fair Housing Institute, "Fair Housing Advertising Guidelines to Compliance" (fairhousinginstitute.com, retrieved 2026-09-03) |
| *(pattern, not a literal phrase — see note below the table)* a conduct, noise, or quiet-hours rule that singles out children by name instead of applying to all residents equally | Singling out children by name in an otherwise-neutral behavior rule is a well-documented familial-status pattern. A rule against skateboarding, or quiet hours that don't mention children, applies to everyone and is fine; a rule that calls out children specifically (loud play, running, noise "by children") treats their ordinary presence as the problem, not the noise itself. | Fair Housing Institute, "Fair Housing and Children – Keeping Your Rules Compliant" (fairhousinginstitute.com/fair-housing-and-children-keeping-your-rules-compliant, author Leslie Tucker, retrieved 2026-09-04) |

**Note on the row above:** unlike every other row in this file, that entry isn't a literal string to match — it's a structural pattern (does the rule name children specifically, or does it apply evenly to everyone). `verify/check.mjs`'s phrase-sanity check can't test for it mechanically the way it tests for "no children" as a substring; recognizing it is the auditor's judgment call under rule 4/rule 6, same as any unlisted phrase. It's documented here anyway so the pattern isn't invisible to the next reader, the way it was to the auditor that first hit this exact line and called the reference material's silence on it a real gap.

## Religion

| Phrase | Why it's flagged | Source |
|---|---|---|
| "Christian roommate" / "Christian housing" | States a religious preference for occupants. | Fair Housing Institute (fairhousinginstitute.com, retrieved 2026-09-03); National Fair Housing Alliance (nationalfairhousing.org/responsibleadvertising, retrieved 2026-09-03) |
| "Jewish home" | Describes the dwelling by the religion of its likely or intended occupants. | DoorLoop, "HUD Advertising Guidelines: What Can You + Can You Not Say?" (doorloop.com/blog/hud-advertising-guidelines, retrieved 2026-09-03) |

**Note on naming a specific church, parish, synagogue, or other religious institution as a proximity landmark:** naming it alone ("walking distance to St. Mary's Parish") is the same pattern as any other neighborhood landmark ("walk to schools," "near the library") and is not flagged on its own — the subject of the sentence is still the property's location, not a stated preference for occupants of that faith. It becomes a finding the same way any "walk to X" phrase does per rules.md rule 6: only when a second clause changes the subject from the property to the occupant (for example "ideal for a Catholic family, walking distance to St. Mary's Parish" — the "ideal for a Catholic family" clause is what does the work, not the parish reference by itself).

## Disability

| Phrase | Why it's flagged | Source |
|---|---|---|
| "no wheelchairs" | Directly excludes people with mobility disabilities. | Fair Housing Institute (fairhousinginstitute.com, retrieved 2026-09-03) |
| "must be able-bodied" | States a physical-capability requirement tied to disability status. | Synthesized from real-estate fair-housing training guidance surfaced via web search 2026-09-03 (multiple concurring trade-association sources; no single primary document text was extractable — treat with the caution given to any single-search-summary entry in this table). |

**Note on "walking distance" / "walk to..." phrases:** multiple sources reviewed for this file (Fair Housing Institute; MetroTex) agree these are generally **acceptable** neighborhood descriptions, not violations, because they describe the property's location rather than a requirement of the occupant. This auditor does not flag "walk to X" phrasing. Do not confuse this with "must be able-bodied," which is a stated requirement of the person, not a description of the place.

## National origin

| Phrase | Why it's flagged | Source |
|---|---|---|
| "English speakers only" / "English-speaking only" | States a national-origin/language-linked preference. | National Fair Housing Alliance (nationalfairhousing.org/responsibleadvertising, retrieved 2026-09-03) |

## Race / color

| Phrase | Why it's flagged | Source |
|---|---|---|
| "white housing" / "white private home" | Describes the dwelling by the race of its likely or intended occupants. | DoorLoop (doorloop.com/blog/hud-advertising-guidelines, retrieved 2026-09-03); MetroTex (mymetrotex.com, retrieved 2026-09-03) |
| "colored home" | Same as above; a dated but still-cited textbook example of race-coded description. | MetroTex (mymetrotex.com, retrieved 2026-09-03) |
| "Hispanic residence" | Same pattern applied to national-origin/ethnicity-coded description. | MetroTex (mymetrotex.com, retrieved 2026-09-03) |

## Sex

| Phrase | Why it's flagged | Source |
|---|---|---|
| "men's housing only" | States a sex preference for occupants. | DoorLoop (doorloop.com/blog/hud-advertising-guidelines, retrieved 2026-09-03) |
| "bachelor pad" | Gender- and marital-status-coded language. Contested: a 1995 HUD memorandum reportedly treated the bare phrase as non-violative, but a later Ohio case litigated a "bachelor pad ... for any single man looking to hook up" ad as sex and familial-status discrimination (the property ultimately prevailed after extended litigation). This auditor treats the phrase as **cautionary, not an automatic violation** — the surrounding language decides it. | Multiple concurring web sources surfaced 2026-09-03 discussing the term's contested status and the Ohio litigation; no single primary court document was retrieved for this build. Flag any finding built on this phrase as needing the fuller-context check in `rules.md`. |

## General exclusionary words (any protected class)

| Phrase | Why it's flagged | Source |
|---|---|---|
| "restricted" / "exclusive" / "limited" | Classic "buzz words" associated with discriminatory intent regardless of which class they're aimed at; flag and require the auditor to look at context (a gated-community amenity claim reads differently than "exclusive clientele"). | Fair Housing Institute (fairhousinginstitute.com, retrieved 2026-09-03) |

## Explicitly acceptable (do not flag)

Multiple sources agree these describe the property, not the occupant, and are not violations on their own: "master bedroom" / "master suite," "family room," "walk-in closets," "walk to schools" / "walk to bus stop," "kosher meals served on premises" (describes a service, not a requirement), "Merry Christmas" / "Happy Easter" (holiday greeting, not an occupancy condition), "non-smoking," "accessible housing," "senior housing" (when the property qualifies for the Housing for Older Persons Act exemption). Source: Fair Housing Institute, MetroTex (both retrieved 2026-09-03).

**Note on the word "family" itself:** it isn't the trigger either way. "Family room" (above) is a room label describing the property — never flagged. "Christian family" or "family-oriented" codes a class (religion, or a familial-status/marital-status proxy depending on context) — potentially flagged, same as any other coded phrase in this file. The word "family" appearing is not itself evidence of anything; what it's paired with, and whether that pairing describes the property or the occupant, is what rules.md rule 6 asks you to read for.
