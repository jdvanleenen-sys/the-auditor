# Cross-brain audits: the same folder, the same audit, different models

The point of this folder is that the standard does the work, not the model. These runs test that: an independent AI is given only this auditor and a hard artifact built to fool a keyword matcher, and its findings are scored against a frozen answer key. Different models, same result, is the evidence.

## Fair Housing, hard listing (13 lines)
A listing seeded with subtle traps: a positive accessibility feature that must PASS ("wheelchair accessible"), multi-faith landmarks that must PASS, a 55-and-over clause that is familial status not out-of-scope age (verify HOPA), and coded steering ("the right kind of people") that names no class but conveys one. Scored 13/13 on three distinct models: Claude Desktop, ChatGPT, and Perplexity. All three caught the three hardest lines (compounding to a Violation, the HOPA familial-status trap, the coded steering) and none over-flagged the benign traps.

## App Store, hard listing (14 lines)
Built with six over-flag traps (a 32-character app name you must count, "free" which is not a price, a Mac and web mention that is allowed, a privacy line that is actually compliant) and subtle catches (external-purchase steering, a reworded misleading-antivirus claim, and "delete your data" which does not satisfy the account-deletion rule). Perplexity caught every critical line and held all six traps as PASS.

## Brand and voice, hard copy (14 lines)
Six pass/fail pairs where only context decides: a hyphen versus an em dash, "honestly" mid-sentence versus front-loaded, a buzzword quoted and mocked versus used sincerely, an emoji in a bio versus in post copy, the word "tool" for a hammer versus AI framed as a tool, Canadian versus American spelling. Scored 14/14 on two models (ChatGPT and Perplexity). Both held all six pairs, including the hardest line: buzzwords quoted ironically, which a keyword matcher fails and a rule reader passes.

## Why it matters
A keyword matcher would over-flag the traps and miss the reworded catches. Every model here read the provision and the context instead. That is the difference between an auditor and a very well dressed string match, and it reproduces across models because it lives in the folder.
