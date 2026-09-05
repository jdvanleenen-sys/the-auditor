# Load a cartridge

This repo is a compliance auditing engine with swappable standards. The engine (`engine-core.md`) is the console and never changes. Each standard is a cartridge (a folder with a manifest, the standard text, a sample artifact, and an audit). Loading swaps the subject without touching the engine. Fair Housing ships pre-loaded.

## Load it, portable (works in any AI)
Run these from the repo root:

    node load.mjs --list                    see what you can load
    node load.mjs app-store                 print a ready-to-run auditor for that standard
    node load.mjs app-store > auditor.md    save it, then paste it into any AI

`load.mjs` prints the engine core, the chosen standard, and a worked example, all in one block. Paste it into Claude, ChatGPT, or anything else, then hand it the artifact you want audited. It cites only provisions from the standard you loaded.

## Load it, conversational (in a Claude project or an agent runtime)
Drop this repo into a project and say: `load <id>` (for example `load wcag`).
On load, the agent should: read `<root>/<id>/cartridge.json`, take its `standardFiles` (and `phraseFile` if present) as the standard to enforce, read `engine-core.md` as the discipline, confirm "`<name>` loaded," then wait for the artifact. It cites only provisions from the loaded cartridge.

## The cartridges
| id | standard | lives in |
|---|---|---|
| fair-housing | Fair Housing Act advertising rules | reference/ (the shipped default) |
| wcag | WCAG 2.1 Level AA | framework-proof/ |
| app-store | Apple App Store Review Guidelines | framework-proof/ |
| brand-vlway | AI the vL Way brand and voice standard | framework-proof/ |

## Why this exists
The verifier already proves the engine is standard-agnostic on the build side (`check.mjs --root` validates any cartridge). The load function does the same thing on the use side: it hands a person a working auditor for whichever standard they pick. The framework is the product. The standard is a cartridge you slot in.
