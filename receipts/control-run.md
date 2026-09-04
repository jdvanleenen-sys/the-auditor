---
test: "Test 2 — Control run (receipts/TEST_METHOD.md)"
run_date: 2026-09-03
runner: "Fresh general-purpose agent, no memory of this build, no access to C:\\GitHub\\the-auditor at all — handed only the plain listing text and asked to flag Fair Housing problems from its own knowledge."
---

# Control run — what the model does with no folder at all

Per Test 2, there's no pass/fail bar here. The point is comparison against `cold-walk-01.md`.

## What it caught, without any folder

Genuinely well. It independently reached the same five FAIL lines the folder-backed cold walk found (L5, L6, L7, L8, L9) and correctly cleared L1, L2, L3, L11, L12. It also correctly flagged L10 (Section 8) as not a federal violation but a real state/local risk — matching the auditor's own Test 5 discipline on out-of-scope findings, again with no folder telling it to draw that line.

It even raised something the folder-backed walk didn't: on L4 ("small pets considered with landlord approval"), it flagged that a discretionary pet-approval policy can't lawfully be applied to a disability-related assistance animal under 24 CFR 100.204 / HUD's 2020 Assistance Animal Notice, and recommended an explicit carve-out. That's a real, well-cited Fair Housing point this auditor's own scope doesn't reach — see "What this exposes" below.

## Where it differs from the folder-backed walk

1. **No verbatim citation, anywhere.** It names real provisions correctly (§ 3604(c), § 3604(f), § 3604(a), § 3607(a), § 3607(b), 24 CFR 100.204) and describes them accurately in its own words, but never quotes exact statutory or regulatory text. There is nothing in this transcript a reader could hold up against a primary source and check word for word — which is exactly the gap `reference/` and `verify/check.mjs`'s verbatim-check exist to close. The cold walk's citations are independently checkable by a stranger in under a minute; this run's citations require the reader to trust the model's paraphrase or go look the statute up themselves.
2. **L6 severity: Violation, not Cautionary.** Called "bachelor pad" a flat violation ("It reinforces the familial-status problem from L5 as well") with no acknowledgment that the phrase is contested (a 1995 HUD memo reportedly treated it as non-violative on its own; a later Ohio case litigated a compound phrase, not the bare term, and the property ultimately prevailed). `reference/phrase-guidance.md` carries that nuance specifically so the auditor doesn't over-claim on a genuinely contested phrase. The control run, with no access to that sourcing, flattened the nuance into a confident violation call.
3. **No severity scale at all.** Findings are "issue" / "no issue" / "caution," not the four-tier Violation / High-risk / Cautionary / Out-of-scope scale `rules.md` defines. Two different real violations (L7's textbook religious preference and L8's High-risk-by-judgment-call disability line) get flattened to the same "clear violation" bucket.
4. **No structured located-quote format**, no `verdict` field, nothing that would parse as JSON, nothing `verify/check.mjs` could ever validate — because there's nothing here shaped like a finding, just prose.

## What this exposes about the auditor's own scope

L4's assistance-animal point is real and outside what this build checks, by design: `identity.md` says plainly this auditor checks advertising copy, not leasing policy, and "small pets considered with landlord approval" is a policy term, not language that itself indicates a preference against disability. The control run's catch here isn't a bug in the auditor — it's a correct illustration of the boundary `identity.md` already draws, and worth keeping as an honest scope note rather than either quietly ignoring it or scope-creeping the auditor to cover leasing policy on the strength of one comparison run.

## Bottom line

The gap this build closes isn't catching more violations — a strong general-purpose model with real Fair Housing knowledge catches nearly the same ones cold, sometimes more. The gap is **checkability**. The folder-backed walk's citations can be verified by a stranger against `reference/` in under a minute, byte for byte, mechanically, by `verify/check.mjs` or by a human doing exactly what `README.md` asks them to do. The control run's citations, accurate as they read, can't be checked that way at all — the reader has to trust the model, or go do the primary-source research themselves, which is the exact manual work this auditor exists to remove.

## Full transcript, verbatim

Federal Fair Housing Act analysis — no files or tools needed for this, it's a straight read against 42 U.S.C. §§ 3601–3619 (Title VIII of the Civil Rights Act of 1968, as amended by the Fair Housing Amendments Act of 1988) and its implementing regs at 24 C.F.R. Part 100.

**Quick primer for context:** The federal Act protects seven classes — race, color, national origin, religion, sex, familial status, and disability (handicap). § 3604(a) bars refusing to rent based on those classes; § 3604(c) separately bars making, printing, or publishing any notice, statement, or advertisement that indicates *any preference, limitation, or discrimination* based on those classes — intent doesn't matter, the statement itself is the violation. § 3604(f) covers disability specifically, including the duty to allow reasonable accommodations. Age and source of income (e.g., Section 8) are **not** protected classes under the federal Act, though many states/cities add them.

Line-by-line:

**L1.** No issue. "Quiet cul-de-sac" describes the street, not the tenants.

**L2.** No issue. "Master bedroom" is a terminology debate in the industry, not an FHA problem.

**L3.** No issue. Naming nearby schools/parks as amenities is factual and permitted — it's not the same as expressing a preference for or against families with children.

**L4.** Caution, not a clear violation as written. "Small pets considered with landlord approval" is fine for ordinary pets. The risk is if this blanket discretionary policy gets applied to assistance animals (service or emotional-support animals) for a person with a disability. Under § 3604(f)(3)(B), assistance animals are a reasonable accommodation, not "pets" — they can't be subject to a no-pets policy, a size/breed limit, "landlord approval" discretion, or pet fees/deposits. HUD's 2020 Assistance Animal Notice spells this out. I'd rewrite this line to carve out assistance animals explicitly.

**L5. "No children please — this home is best suited for a quiet, mature couple."** — Clear violation. This is textbook familial-status discrimination, barred by both § 3604(a) (refusal to rent) and § 3604(c) (discriminatory statement). Unless the property genuinely qualifies as HOPA-exempt senior housing (55+/62+ under § 3607(b), as amended by the Housing for Older Persons Act of 1995) — and nothing here suggests it does — this line alone is enough to trigger fair housing liability.

**L6. "Perfect bachelor pad for a young professional starting out."** — Violation. "Bachelor pad" signals a sex-based preference (implicitly male, implicitly single/no family), which is a § 3604(c) discriminatory statement. It reinforces the familial-status problem from L5 as well.

**L7. "Ideal for a Christian family looking to be close to their church community."** — Clear violation. This is a facial religious preference, squarely barred by § 3604(c). There's no religious-organization exemption available here (that exemption under § 3607(a) is narrow — it covers religious organizations giving preference to their own members in housing they operate, not a general rental listing).

**L8. "Must be able-bodied to comfortably manage the exterior stairs to the front door."** — Clear violation. This is disability discrimination under § 3604(f) — it's a stated qualification that excludes people with mobility disabilities, which is exactly what § 3604(c) prohibits as a discriminatory statement, and it forecloses the reasonable-accommodation/modification analysis a landlord is supposed to go through under § 3604(f)(3). The fix is to state the physical fact neutrally ("unit is accessed via exterior stairs; no elevator") and let a prospective tenant self-select, rather than stating who "must" be able to use them.

**L9. "English-speaking tenants only, please — makes communication easier for everyone."** — Violation. Courts and HUD treat English-only tenancy requirements as a proxy for national-origin discrimination, since language ability correlates tightly with national origin. This is a § 3604(c) discriminatory statement (and would support a § 3604(a) claim if actually enforced to deny a rental).

**L10. "Section 8 vouchers not accepted."** — Not a federal FHA violation. Source of income isn't one of the seven protected classes under the federal Act. However, this is illegal in a growing number of states and cities that have added source-of-income (including housing vouchers) as a locally protected class — e.g., many states/municipalities now require landlords to accept vouchers. Since the listing doesn't specify jurisdiction, I'd flag this as "confirm local/state law before publishing," since it may well be illegal there even though it's clean under the federal statute alone.

**L11.** No issue. Neutral proximity/amenity statement.

**L12.** No issue. Disclosing rent and deposit terms is fine, and the "Equal Housing Opportunity" tag is the standard HUD-encouraged disclosure — good practice, not a problem. (One practical note, not a text-level violation: whatever deposit/first-and-last policy is stated needs to actually be applied the same way to every applicant, or a uniform written policy on paper can still produce a disparate-treatment claim in practice.)

**Bottom line:** L5, L6, L7, L8, and L9 are the real problems — five separate § 3604(c) discriminatory-statement violations, touching familial status, sex, religion, disability, and national origin respectively, with L5 and L8 also implicating the substantive refusal-to-rent/reasonable-accommodation provisions (§ 3604(a) and § 3604(f)). L4 and L10 are secondary cautions worth fixing before publication even though they aren't clean federal-FHA violations as written.
