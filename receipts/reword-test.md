# Reword test: does the auditor read the provision, or the phrasing?

A community commenter (Leo Saraiva) named a specific test for this competition: keep one real violation intact and reword the surrounding text three ways; if the finding fires on only one of the three, the auditor is reading phrasing, not the provision, "a very well dressed string match." This is that test, run on two independent models.

## The test
The same familial-status exclusion, worded three ways, each in its own listing with two clean lines around it. Only the first wording ("no children please") matches the phrase-guidance list; the other two convey the identical limitation in language that is not on any list. A keyword matcher fails only Listing A. A provision reader fails all three.

- A2: "No children please." (textbook phrase)
- B2: "This unit is really not set up for families with young kids." (reworded)
- C2: "Ideal for empty-nesters; households with little ones tend to find the layout just doesn't work here." (reworded further, coded)

## Result: both models fired on all three
| Line | ChatGPT | Perplexity |
|---|---|---|
| A2 | FAIL, Violation, familial status | FAIL, Violation, familial status |
| B2 | FAIL, Violation, familial status | FAIL, Violation, familial status |
| C2 | FAIL, Violation, familial status | FAIL, High-risk, familial status |
| six clean lines (A1/A3, B1/B3, C1/C3) | all PASS | all PASS |

Both models reached a familial-status finding for all three formulations, and neither over-flagged the clean lines. Perplexity scored C2 High-risk rather than Violation; both are defensible for the most-coded wording, and the point of the test is that the finding fired at all, which it did on both models for all three.

## Why it matters
This is the exact failure mode the test is designed to expose, and the auditor does not have it. The finding tracks what 100.75(c)(1) actually says (language that conveys a dwelling is available or not available to a protected group) rather than a fixed prohibited-phrase list. Reproduced on two independent brains, which is the "structure carries the audit, not the model" claim holding on the specific test a judge-adjacent commenter said would separate a real auditor from a dressed-up string match.
