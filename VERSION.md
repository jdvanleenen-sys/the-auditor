# Version and provenance

What this auditor ships, which provisions, and when each source was captured, in one place a judge can check at a glance. `node freshness.mjs` reports the same capture dates and flags anything past a 30-day re-verify window.

## Shipped standard: Fair Housing (reference/fair-housing/)

| Provision | What it is | Official source | Verbatim text verified |
|---|---|---|---|
| 42 U.S.C. 3604(c) | Fair Housing Act advertising provision | Office of the Law Revision Counsel (uscode.house.gov) | Against the Cornell LII mirror, 2026-09-05 |
| 24 CFR 100.75 (a, b, c, c1-c4) | HUD advertising regulation | eCFR (ecfr.gov) | Against the Cornell LII mirror, 2026-09-05 |

- **Protected classes:** the seven federal classes named in the two provisions above (race, color, religion, sex, handicap, familial status, national origin). See `reference/fair-housing/protected-classes.md`.
- **phrase-guidance.md:** sourced recognition aids (HUD informal guidance, the National Fair Housing Alliance, real-estate training material), each entry dated and attributed, treated as guidance and never as binding law. Every finding that leans on it also cites a binding provision.
- **The one legal trap, handled:** 24 CFR Part 109 (HUD's old advertising word list) was withdrawn in 1996. It is flagged as not-current-law in `reference/fair-housing/24-cfr-100.75.md` and never cited as binding.

## Guidance sources last checked
2026-09-05.

## Proof cartridges (framework-proof/, not the shipped standard)

| Cartridge | Standard | Source | Retrieved |
|---|---|---|---|
| wcag | WCAG 2.1 Level AA | w3.org | 2026-09-04 |
| app-store | Apple App Store Review Guidelines (selected) | developer.apple.com | 2026-09-05 |
| brand-vlway | AI the vL Way brand and voice standard | canonical brand docs (March/Feb 2026) | 2026-09-05 |

## How to re-verify currency yourself
Run `node freshness.mjs`. For any standard past its re-verify window, open its source and read the shipped provision next to the live one. That is the same open-two-things-and-compare check a person does on any finding, no legal training needed. The verifier (`node verify/check.mjs`) stays offline and proves the folder is internally honest; freshness is the separate check that the folder still matches the world.
