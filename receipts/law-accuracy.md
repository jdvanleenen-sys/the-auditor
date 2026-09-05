# Law accuracy: the shipped text matches the primary source

The one way to lose this kind of audit is a standard that has drifted from the real law. This check confirms the shipped provisions match the primary source exactly.

## Method
The live text of 24 CFR 100.75 and 42 U.S.C. 3604 was fetched from the source, normalized the same way verify/check.mjs normalizes, and compared to the verbatim anchored spans in reference/fair-housing/.

## Result
All seven provisions match byte for byte after normalization: 100.75(a), 100.75(c) intro, 100.75(c)(1) through (c)(4), and 3604(c). No paraphrase, no drift.

## The one legal trap, handled
HUD's old advertising word-list regulation, 24 CFR Part 109, was withdrawn from the Code of Federal Regulations in 1996. It is not current law. This auditor treats any word list descended from it as sourced guidance and never cites Part 109 as binding. See reference/fair-housing/24-cfr-100.75.md and phrase-guidance.md.

## Currency
The verbatim text is checked on every commit by verify/check.mjs (offline, deterministic). Whether the source itself has changed since capture is a separate question, surfaced by freshness.mjs, which reports each standard's source and capture date so a human can re-verify against the live source.
