# The Auditor

Point it at a real-estate listing or ad. It tells you which lines pass the Fair Housing Act's advertising rules and which fail, with the exact provision each finding cites and the exact phrase that triggered it.

**Before.** A property manager reads the ad, gets a gut feeling something's off, maybe googles "fair housing words to avoid," and hopes they caught everything.
**After.** Every line gets a verdict: PASS, FAIL, or Out of scope. Every FAIL names the law it fails and quotes it. You open the finding, open `reference/`, and check the two match yourself.

```mermaid
flowchart LR
    A["your ad or listing"]
    R["reference/<br/>the actual law, verbatim"]
    F["one finding per line<br/>quote + verdict + severity + citation"]
    S(["you check one finding<br/>against reference/, by eye"])
    A --> F
    R -.cited by.-> F
    F --> S
    style S stroke:#27ae60
```

## Use it

1. Drop `identity.md`, `rules.md`, `examples.md`, `reference/`, and this README into a Claude project (or point Claude Code at this folder).
2. Give it a listing description, print ad, flyer, or MLS remarks field. Advertising copy only, not a lease, not a screening policy.
3. Read `identity.md` and `rules.md` first so you know the report shape it's going to produce. Then hand over the artifact.
4. You get back one finding per line: a located quote, a verdict (`PASS`, `FAIL`, or `Out of scope`), a severity for PASS/FAIL (`Pass` / `Violation` / `High-risk` / `Cautionary`; an `Out of scope` finding carries no severity, just a note explaining why), and a provision id with a short reason. It doesn't paste the full statute into every finding (that's copying, not citing, and on a listing with several violations it's enough text to blow a model's output limit and truncate the report mid-run). You open `reference/` to read the law itself; the report points, it doesn't reprint.

**Two forms exist, and they're not the same file.** What you get back live is the compact report above. `verify/audits/` holds a second, verbose form (the full verbatim text behind every citation, unabridged, checked byte for byte by `verify/check.mjs`). That file is static and committed, so it never truncates; it's what actually proves the report's citations are honest, not just plausible. Cite once by id, keep the law in `reference/` once. That's the cite-not-copy discipline this whole tool is built on. See `examples.md` for both forms shown side by side.

See `examples.md` for five worked examples before you run your first real audit. `reference/fair-housing/sample-listing.md` is the synthetic listing this build's own tests run against. Audit it yourself and compare your findings to `verify/audits/fair-housing/sample-listing.findings.json` if you want to sanity-check the auditor before trusting it on something real.

## Built on a reusable framework

This is a Fair Housing ad-compliance auditor. It is also, underneath, a reusable auditing framework: the checker, the report shape, and the discipline rules aren't written for Fair Housing specifically. The standard is a cartridge, a folder with the standard text, a manifest, a sample artifact, and an audit. Swap the cartridge and the same framework checks any written standard.

`reference/` ships exactly one standard. Fair Housing, quoted above. That's the whole product.

The same engine runs four standards across four unrelated domains, each a cartridge, each added with no code change: Fair Housing law (`reference/fair-housing/`, shipped), WCAG 2.1 accessibility (`framework-proof/wcag/`), Apple App Store review policy (`framework-proof/app-store/`), and the AI the vL Way brand and voice guide (`framework-proof/brand-vlway/`).

**Load any of them.** `node load.mjs --list` shows what's loadable; `node load.mjs app-store` prints a ready-to-run auditor for that standard, engine core plus standard plus a worked example, in one block you can paste into any AI. See `LOAD.md` for the full instructions.

The standard is a cartridge. The engine is the product. Swapping the subject changes zero lines of the engine or the checker.

Every company checks its work against a pile of standards (accessibility, privacy, contracts, brand, industry rules), pays people to do it by hand, and watches the standards keep changing anyway. This is one engine that checks any of them and proves each finding against the real rule. That's why the framework, not the subject, is the point.

**How to add a standard:**
1. Create `reference/<name>/` with the standard text, quoted verbatim, each provision wrapped in a `<!-- verbatim:ID -->` anchor.
2. Add `reference/<name>/cartridge.json`: `id`, `name`, `standardFiles`, `requiredProvisions`, `artifact`, `artifactAudit`. `phraseFile`, `classes`, and `generalOnlyIds` are optional; only add them if the standard actually needs them.
3. Write a sample artifact and an audit under `verify/audits/<name>/`.
4. Run `node verify/check.mjs`. No code change.

**Proof the framework travels.** `framework-proof/` holds three working cartridges beyond Fair Housing (WCAG, App Store, brand-vlway), kept outside `reference/` so they stay clearly separate from what ships. Same checker, a different root: `node verify/check.mjs --root framework-proof`. Adding any of them changed zero lines of the audit logic. See `framework-proof/README.md`.

## The one rule

**Every finding cites a provision, and the citation is checkable.** `reference/` holds the actual text of 42 U.S.C. § 3604(c) and 24 CFR § 100.75, quoted word for word from the U.S. Code and the Code of Federal Regulations, not a summary and not a link. Open any FAIL finding, open the provision it names in `reference/`, and read them side by side. If the finding's quoted law doesn't match what's actually in `reference/`, the finding is wrong, full stop. `verify/check.mjs` exists specifically to catch that before you ever see it.

`reference/fair-housing/phrase-guidance.md` is different: it's sourced guidance (HUD's informal guidance, the National Fair Housing Alliance, real-estate trade associations), not binding law, and every finding that leans on it also has to name the binding provision underneath. See `rules.md` for exactly how that works, including the one place the law itself has a trap: HUD's old advertising word-list regulation was pulled from the books in 1996. It gets treated as guidance here, never cited as current law.

## What it won't do

It doesn't give legal advice, doesn't predict how a court would rule, and doesn't rewrite your ad for you. It checks the seven classes the federal Fair Housing Act actually names (race, color, religion, sex, disability, familial status, national origin), and it says plainly when something looks like a problem outside that list (source of income, for instance), because that might still be illegal under your state or city's rules, just not under the two provisions this folder enforces.

## What this can miss

Said plainly, not buried in a footnote: this catches phrases that match or resemble `reference/fair-housing/phrase-guidance.md`'s examples, plus what the property-vs-occupant context test in `rules.md` rule 6 can extend that to. A coded phrase unlike anything in that guidance or the worked examples can pass with no finding. Nothing told the auditor to look for it. Read a clean report as "no flagged patterns found," not "guaranteed compliant." Every FAIL is a flag for a human to review, not a legal ruling.

## How this build proves itself

- `verify/check.mjs` re-derives every citation from `reference/` and fails loud if a finding's quote doesn't match byte for byte, cites a provision that doesn't exist, or is missing a severity. Run it: `node verify/check.mjs`.
- The checker runs every cartridge it finds under whatever root you point it at. `node verify/check.mjs` validates the shipped standard; `node verify/check.mjs --root framework-proof` validates all three proof cartridges (WCAG, App Store, and brand-vlway), same unchanged checker.
- Every check has a negative fixture in `verify/fixtures/` that's supposed to fail. `fail_*.json` are bad findings (a bad provision id, a misquote, a fabricated or empty general-id citation, missing citation/severity/protected-class, a citation smuggled into an out-of-scope finding, a false PASS). `broken-cartridge/` and `broken-cartridge-shape/` are bad manifests (missing files vs. missing/wrong-typed fields). `phrase-parsing/` is a parser regression guard, not a finding fixture. The file names are the authoritative list, not this sentence. Read the folder if you want the current count. If a fixture ever passes, the gate it tests is dead, and CI treats that as a failure in itself.
- `receipts/` (outside this folder, so it can't leak answers into a walk) holds the frozen test method, a cold walk by a fresh AI session given only this folder, a control run of the same listing with no folder at all, and a human walk where a real person checks one finding against `reference/` by hand. It also holds the cross-brain audit results (the same folder scored against a hard artifact on several independent models), the pressure tests (a correct finding held under direct user pressure), and the law-accuracy check (the shipped text checked against the primary source). Read `receipts/TEST_METHOD.md` for what was tested and the bar each test had to clear.

## What's synthetic here

`reference/fair-housing/sample-listing.md` is a listing I wrote for this repo. No real property, agent, or brokerage. It exists to give the auditor (and its own tests) a realistic artifact with a real spread of clean lines, violations, and one contested phrase to check against.
