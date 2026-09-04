# Fixture: phrase-guidance column scoping

Not a real phrase-guidance file. Exists only so `verify/check.mjs` can prove `loadFlaggedPhrasesForCartridge` reads quoted text from the Phrase column (first cell) only, and never from the Source column or the "why it's flagged" note — both of which legitimately contain quoted text (article titles, illustrative quotes) that isn't a flagged phrase.

| Phrase | Why it's flagged | Source |
|---|---|---|
| "flagged term" | contains "not a real phrase either" as an aside | Some Author, "This Title Should Not Be Flagged" (example.com, retrieved 2026-09-04) |

## Explicitly acceptable

Nothing here - this cutoff heading just mirrors the real file's structure so the same parsing logic runs against it identically.
