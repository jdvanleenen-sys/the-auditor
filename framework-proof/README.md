# Framework proof

This is not a second standard the Auditor ships. The Auditor ships one: Fair Housing, in `reference/`.

This folder exists to prove one thing: the audit logic isn't written for Fair Housing specifically. It's written for a cartridge, a folder with a manifest, a standard, a sample artifact, and an audit. Fair Housing is one cartridge. `wcag/` is another one, sitting here instead of in `reference/` so it stays clearly separate from what actually ships.

The same checker validates both, with no change to the audit logic:

```
node verify/check.mjs                     # the shipped standard, reference/fair-housing/
node verify/check.mjs --root framework-proof   # this proof, framework-proof/wcag/
```

`--root` only tells the checker which folder to scan for cartridges. It's a where-to-look flag, not a per-standard code path. Precisely: the commit that added WCAG's actual content (`framework-proof/wcag/`, its cartridge.json, its audit) changed zero lines of `verify/check.mjs`. Two commits *before* that one made the engine's handling of optional manifest fields (`phraseFile`, `classes`) genuinely generic instead of only working by accident for Fair Housing. Those were real fixes, found by trying to load a cartridge with neither field set, and they're prerequisites for any second cartridge, not a WCAG special case. See the commit history on `verify/check.mjs` if you want to check both claims yourself.

Adding a standard, shipped or proof, is the same four steps either way:

1. Create `<root>/<name>/` with the standard text, quoted verbatim, each provision wrapped in a `<!-- verbatim:ID -->` anchor.
2. Add `<root>/<name>/cartridge.json`: `id`, `name`, `standardFiles`, `requiredProvisions`, `artifact`, `artifactAudit`, and the optional `phraseFile`, `classes`, `generalOnlyIds` if the standard needs them.
3. Write a sample artifact and an audit under `verify/audits/<name>/`.
4. Run the checker against the right root. No code change.

`wcag/` inside this folder is a real, working cartridge, not a stub. It checks six WCAG 2.1 Level A/AA success criteria against a synthetic web page and passes the same anchor, verbatim, shape, and coverage checks Fair Housing does. See `wcag/wcag21-aa.md`, `wcag/sample-page.md`, and `verify/audits/wcag/sample-page.findings.json`.
