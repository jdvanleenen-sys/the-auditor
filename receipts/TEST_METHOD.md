---
frozen: 2026-09-03
rule: "This file is frozen as of the date above, before any of the runs below happened. Results get logged as they come in, in their own files, stumbles and all, kept verbatim. This file does not get edited to match what the runs produced. If a test bar turns out to be wrong or unfair, that gets fixed in a NEW dated note below the freeze line, never by silently rewriting the bar."
---

# Test method — frozen before any run

Named here, in order, with the bar each has to clear. `verify/check.mjs` already ran repeatedly *during the build* (that's normal engineering, checking the gate itself while writing it — see the build commit). Nothing below counts as run yet. Everything from here down is receipts, logged as it happens, in its own file, never edited after the fact except to append a dated correction.

## Test 1 — Recorded cold walk

A fresh AI session, no memory of building this folder, handed only `C:\GitHub\the-auditor` (identity.md, rules.md, examples.md, reference/, README.md — not `receipts/`, not `verify/audits/`) and one task: audit `sample-listing.md` line by line.

**Pass bar**, checked mechanically against the transcript:
1. Produces a verdict (PASS / FAIL / Out of scope) for every one of L1 through L12. Missing a line is an automatic miss on this bar.
2. Flags L5 ("no children please... mature couple"), L7 ("Ideal for a Christian family..."), and L9 ("English-speaking tenants only...") as FAIL. These are the three textbook violations; missing any one is a real miss, not a judgment call.
3. Does NOT flag L1, L2, L3, L4, L11, or L12 as FAIL. A false positive on a clean line is a real miss.
4. L10 ("Section 8 vouchers not accepted") gets flagged as Out of scope, or at minimum is NOT cited to 3604c or 100.75 (source of income isn't a federal class — rules.md rule 5). Citing federal law for L10 is a real miss.
5. Every citation the walk writes down, run through `node verify/check.mjs --file <its findings, converted to the audit JSON shape>`, comes back with zero anchor or verbatim errors. A citation that doesn't check out is a real miss regardless of whether the underlying verdict was right.
6. L6 ("bachelor pad") and L8 ("must be able-bodied") are judgment calls on severity (Cautionary vs High-risk vs Violation) — any FAIL with a passing citation clears the bar here; a silent PASS on either does not.

Any miss against 1-5 gets written down in the walk's own receipt file, not smoothed over, and turned into a kept-red fixture in `verify/fixtures/` per Test 5 below.

## Test 2 — Control run

The same `sample-listing.md`, handed to a fresh AI session with NO folder at all — just "does this real-estate listing have any Fair Housing Act problems?" No `identity.md`, no `rules.md`, no `reference/`.

**Pass bar:** there isn't a pass/fail line here. The point is comparison, not a gate. The receipt logs whether the control run (a) catches fewer of the same lines than the cold walk, (b) cites law at all, and if it does, (c) whether that citation is accurate and verbatim-checkable the way the folder-backed walk's citations are. If the control run does just as well with no folder, that's a real finding about this build, not something to bury.

## Test 3 — Human walk

One real person, not the builder, handed exactly one FAIL finding from the cold walk (Test 1) plus `rules.md`'s citation format, and asked: does the quoted provision in this finding match what's actually written in `reference/`? Verbatim task and 4-part answer bar are frozen in `receipts/human-walk/TASK.md`, written before the walk happens, same rule as this file.

**Pass bar:** the person reaches a correct yes/no on the match, in their own words, without being told the answer, in a time noted in the receipt. Coaching, confusion, and wrong turns get kept in the transcript, not edited out.

## Test 4 — Structural + coverage gate

`node verify/check.mjs` exits 0: every real audit in `verify/audits/` is clean, all seven protected classes and both provisions are exercised, every `sample-listing.md` line has a finding, and every fixture in `verify/fixtures/fail_*.json` fails as required. This one already ran clean during the build (see the build commit); it also re-runs on every push via `.github/workflows/verify.yml`, and stays a pass bar for every commit from here forward, including the ones this test method produces.

## Test 5 — Kept-red fixture from a real miss

If Test 1 or Test 2 produces a real, reproducible mistake, it gets reconstructed as a new `verify/fixtures/fail_*.json` (or a new case inside an existing one) that the checker must catch, committed with a message naming which test it came from. Not a synthetic edge case invented after the fact — the actual mistake, kept red on purpose.
