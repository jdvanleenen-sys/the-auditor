---
frozen: 2026-09-03
rule: "Written before the walk happens, same as receipts/TEST_METHOD.md. Not edited afterward to match what the tester does. Coaching, confusion, and wrong turns get kept in the transcript."
---

# Human walk — the verbatim task

## Who this is for

One real person. Not the builder, not someone who has read this repo before. Non-technical is the point — someone who has never opened `reference/`, never read `rules.md`, and doesn't need to know what "verbatim check" or "Fair Housing Act" means going in.

## What they're handed

Exactly two things, nothing else:
1. **One finding**, printed or shown on screen, taken as-is from `receipts/cold-walk-01.md`:

   > **Finding — L5**
   > - Located quote: "No children please — this home is best suited for a quiet, mature couple." (L5)
   > - Verdict: FAIL
   > - Severity: Violation
   > - Citation: `100.75c1` — "Using words, phrases, photographs, illustrations, symbols or forms which convey that dwellings are available or not available to a particular group of persons because of race, color, religion, sex, handicap, familial status, or national origin."

2. **The file** `reference/24-cfr-100.75.md`, open, unmarked — they find subsection (1) themselves.

## The verbatim instruction (read to them exactly, don't paraphrase)

> "This is a finding from an AI system that checks real-estate ads against a real law. I'm going to show you one finding it made. It cites a specific rule, quotes that rule, and points at a real file where the rule is supposed to actually be written down. I want you to open that file, find the rule it's pointing at, and tell me: does what the finding quotes actually match what's really in the file? Just tell me what you see and think out loud. There's no trick — I want your honest reaction, including if you get confused or can't find it."

## The 4-part answer bar

Scored on tape (or in a transcript if video isn't available for a given run), in this order:

1. **Can they find the provision?** Given only the citation id (`100.75c1`) and the file, do they locate the right passage in `reference/24-cfr-100.75.md` without being told where to look? (Pass/fail, plus how long it took and what they searched for.)
2. **Can they compare it themselves?** Do they read the finding's quoted text and the file's text side by side, on their own, without being walked through it? (Pass/fail.)
3. **Do they reach the right verdict?** Does the text match? (It does — this is a genuine, unaltered finding.) Do they correctly say "yes, it matches"? (Pass/fail — a false "no" is as important a miss as a false "yes" would be.)
4. **Can they say why it matters, in their own words?** After confirming the match, ask: "So what does that tell you about whether you can trust this AI's other findings?" Their own words get quoted verbatim, not summarized.

## What happens with the result

Logged in `receipts/human-walk/run-01.md` (or `.md` per run if more than one person does this), dated, unedited after the fact except a dated correction note if something in this TASK.md itself turns out to be unfair or unclear — same rule as `TEST_METHOD.md`. If the front door fails them (they can't find the provision, can't compare it, or get the verdict wrong), that gets committed as its own commit, heading states the loss plainly, ruled a folder failure and not a tester failure, before anything about the folder gets changed in response.
