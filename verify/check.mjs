#!/usr/bin/env node
// Verify Auditor findings against the active cartridge(s)' standard(s) in reference/<id>/. Fails loud, exits non-zero.
//
// A cartridge is any reference/<id>/ folder that has a cartridge.json manifest. Fair Housing is
// the one cartridge shipped today; a second standard is added by adding a folder, not by editing
// this file. See reference/fair-housing/cartridge.json for the manifest shape.
//
// Usage:
//   node verify/check.mjs                 - validate every real audit for every cartridge found under
//                                            reference/, run each cartridge's coverage checks, then
//                                            confirm every verify/fixtures/fail_*.json fails as required
//   node verify/check.mjs --root <dir>    - scan <dir> instead of reference/ for cartridges. Same
//                                            checks, same fixtures. Used to validate framework-proof/
//                                            (a cartridge folder that isn't a shipped standard) with
//                                            the exact same checker, no code branching on which root.
//   node verify/check.mjs --file <path>   - validate one audit file only (cartridge inferred from its
//                                            parent folder under verify/audits/<id>/), exit 1 if any error
//
// Four checks, every finding gets all four, same as before the refactor - only where each check reads
// its cartridge-specific data (anchors, flagged phrases, classes, required provisions) changed:
//   1. anchor      - every citation.provision exists in the cartridge's reference/ (or is one of its
//                    generalOnlyIds)
//   2. verbatim    - every citation.text matches the cartridge's reference/ span for that provision,
//                    byte for byte (after normalize() strips markdown decoration)
//   3. shape       - every finding has an id, a quote, a verdict, and the fields that verdict requires
//                    (engine-generic - not cartridge-specific, unchanged from before the refactor)
//   4. phrase sanity - a PASS finding can't quote a phrase the cartridge's phrase file flags
//
// Plus two coverage checks per cartridge, run across that cartridge's real audits together:
//   5. class coverage      - every class in the cartridge's manifest appears in some finding
//   6. provision coverage  - every requiredProvisions group has at least one id actually cited
//   7. artifact coverage   - every numbered line in the cartridge's artifact has a matching finding
//   8. quote-in-artifact   - (opt-in per cartridge) each finding's quote actually appears in the
//                            artifact line it cites, so a fabricated or trimmed quote is caught
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// ---------- engine-generic helpers ----------

function normalize(span) {
  let t = span.trim();
  t = t.replace(/^>\s?/, ''); // strip a leading blockquote marker
  t = t.replace(/^\*\*\([a-z0-9]+\)\*\*\s?/i, ''); // strip a leading **(a)** / **(1)** label
  t = t.trim();
  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1); // strip wrapping quote marks
  return t.replace(/\s+/g, ' ').trim();
}

// Looser normalization for the quote-to-artifact check: strip markdown code ticks, fold em/en
// dashes to a hyphen and smart quotes to straight, collapse whitespace, lowercase. This lets a
// finding that quotes the ad in plain text still match an artifact line that wraps code in
// backticks or uses a typographic dash, without letting a fabricated quote slip through.
function normalizeLoose(s) {
  return (s || '')
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- cartridge loading ----------

function loadAnchorsForCartridge(cartridgeDir, standardFiles) {
  const anchors = new Map();
  for (const fname of standardFiles) {
    const text = readFileSync(join(cartridgeDir, fname), 'utf8');
    const re = /<!--\s*verbatim:(\S+)\s*-->([\s\S]*?)<!--\s*\/verbatim\s*-->/g;
    let m;
    while ((m = re.exec(text))) anchors.set(m[1], normalize(m[2]));
  }
  return anchors;
}

function loadFlaggedPhrasesForCartridge(cartridgeDir, phraseFile) {
  const text = readFileSync(join(cartridgeDir, phraseFile), 'utf8');
  const cutoff = text.indexOf('## Explicitly acceptable');
  const scoped = cutoff === -1 ? text : text.slice(0, cutoff);
  const phrases = [];
  for (const line of scoped.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*Phrase\s*\|/i.test(line) || /^\|\s*-+\s*\|/.test(line)) continue; // header/separator rows
    // Only the first cell (the Phrase column) is the flagged-phrase list. Quoted strings anywhere
    // else in the row (a source's article title, a quote inside a "why it's flagged" note) are NOT
    // flagged phrases - extracting from the whole line was pulling those in too (found during the
    // repair-loop pass; see verify/fixtures/fail_source-title-not-a-phrase.json).
    const firstCell = line.split('|')[1] || '';
    for (const m of firstCell.matchAll(/"([^"]+)"/g)) phrases.push(m[1].toLowerCase());
  }
  return phrases;
}

// Cartridge integrity: confirm the manifest parses, every file it names actually exists, and its
// audits folder exists, before trusting any of it. A broken cartridge fails loud with its own id
// instead of a bare Node stack trace, and doesn't get built into a half-working cartridge object.
function checkCartridgeIntegrity(dir, manifest) {
  const errs = [];
  // Presence AND shape, for every field loadCartridges uses unconditionally downstream (as a
  // folder name, a path segment, or something .filter()/.some()/a for-of loop is called on).
  // Found systematically during the repair loop's third pass: pass 1 and 2 each found one of
  // these fields missing checks one at a time (id, artifactAudit); a full sweep here found three
  // more of the exact same shape (standardFiles, artifact, classes) rather than waiting to trip
  // over each individually. Required: id, name, standardFiles (array), artifact, artifactAudit.
  // Optional but must be the right shape if present: classes, generalOnlyIds, requiredProvisions.
  if (!manifest.id) errs.push('manifest is missing "id"');
  if (!manifest.name) errs.push('manifest is missing "name"');
  if (!Array.isArray(manifest.standardFiles)) errs.push('manifest is missing "standardFiles" (must be an array, even an empty one)');
  if (!manifest.artifact) errs.push('manifest is missing "artifact"');
  if (!manifest.artifactAudit) errs.push('manifest is missing "artifactAudit"');
  if (manifest.classes !== undefined && !Array.isArray(manifest.classes)) errs.push('manifest "classes" must be an array if present');
  if (manifest.generalOnlyIds !== undefined && !Array.isArray(manifest.generalOnlyIds)) errs.push('manifest "generalOnlyIds" must be an array if present');
  if (manifest.requiredProvisions !== undefined) {
    if (!Array.isArray(manifest.requiredProvisions)) {
      errs.push('manifest "requiredProvisions" must be an array if present');
    } else {
      manifest.requiredProvisions.forEach((group, i) => {
        if (!Array.isArray(group)) errs.push(`manifest "requiredProvisions[${i}]" must itself be an array of provision ids (a group), got ${JSON.stringify(group)}`);
      });
    }
  }

  for (const fname of Array.isArray(manifest.standardFiles) ? manifest.standardFiles : []) {
    if (!existsSync(join(dir, fname))) errs.push(`standardFiles entry "${fname}" does not exist in ${dir}`);
  }
  if (manifest.phraseFile && !existsSync(join(dir, manifest.phraseFile))) {
    errs.push(`phraseFile "${manifest.phraseFile}" does not exist in ${dir}`);
  }
  if (manifest.artifact && !existsSync(join(dir, manifest.artifact))) {
    errs.push(`artifact "${manifest.artifact}" does not exist in ${dir}`);
  }
  const auditsDir = join(root, 'verify', 'audits', manifest.id || '');
  if (!existsSync(auditsDir)) errs.push(`verify/audits/${manifest.id}/ does not exist`);
  return errs;
}

function loadCartridges(cartridgeRootDir) {
  const cartridges = [];
  const integrityErrors = []; // [{ id, errors }] - broken cartridges, reported but not built
  for (const entry of readdirSync(cartridgeRootDir)) {
    const dir = join(cartridgeRootDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const manifestPath = join(dir, 'cartridge.json');
    if (!existsSync(manifestPath)) continue;

    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      integrityErrors.push({ id: entry, errors: [`cartridge.json failed to parse: ${e.message}`] });
      continue;
    }

    const structuralErrs = checkCartridgeIntegrity(dir, manifest);
    if (structuralErrs.length) {
      integrityErrors.push({ id: manifest.id || entry, errors: structuralErrs });
      continue; // don't try to build anchors etc. from a cartridge that's already known-broken
    }

    const auditsDir = join(root, 'verify', 'audits', manifest.id);
    const audits = readdirSync(auditsDir)
      .filter((f) => f.endsWith('.findings.json'))
      .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(auditsDir, f), 'utf8')) }));
    cartridges.push({
      id: manifest.id,
      name: manifest.name,
      dir,
      anchors: loadAnchorsForCartridge(dir, manifest.standardFiles),
      // phraseFile and classes are optional in the manifest - a cartridge with no informal-phrase
      // layer or no protected-class-style dimension (WCAG, for instance) just skips those checks.
      flaggedPhrases: manifest.phraseFile ? loadFlaggedPhrasesForCartridge(dir, manifest.phraseFile) : [],
      classes: manifest.classes || [],
      generalOnlyIds: new Set(manifest.generalOnlyIds || []),
      requiredProvisions: manifest.requiredProvisions || [],
      artifactPath: join(dir, manifest.artifact),
      artifact: manifest.artifact,
      quoteInArtifact: manifest.quoteInArtifact || false,
      artifactAuditPath: join(auditsDir, manifest.artifactAudit),
      auditsDir,
      audits,
    });
  }
  return { cartridges, integrityErrors };
}

// ---------- audit JSON validation ----------

function shapeCheck(f, cartridge, errs) {
  const where = f.id || '(missing id)';
  if (!f.id) errs.push(`${where}: missing id`);
  if (!f.quote || typeof f.quote !== 'string') errs.push(`${where}: missing or empty quote`);
  if (!['PASS', 'FAIL', 'OUT_OF_SCOPE'].includes(f.verdict)) {
    errs.push(`${where}: verdict must be PASS, FAIL, or OUT_OF_SCOPE, got ${JSON.stringify(f.verdict)}`);
    return; // can't shape-check verdict-dependent fields without a valid verdict
  }
  if (f.verdict === 'PASS') {
    if (f.severity !== 'Pass') errs.push(`${where}: PASS finding must have severity "Pass"`);
  } else if (f.verdict === 'FAIL') {
    if (!['Violation', 'High-risk', 'Cautionary'].includes(f.severity)) {
      errs.push(`${where}: FAIL finding needs severity Violation, High-risk, or Cautionary, got ${JSON.stringify(f.severity)}`);
    }
    if (!Array.isArray(f.citations) || f.citations.length === 0) {
      errs.push(`${where}: FAIL finding has no citation - that's an opinion, not a finding (rules.md rule 4)`);
    }
    // protectedClass is only required when the cartridge actually declares a class/dimension
    // layer (Fair Housing does; WCAG doesn't - a criterion isn't "about" a protected class).
    if (cartridge.classes.length > 0 && !f.protectedClass) {
      errs.push(`${where}: FAIL finding must name a protectedClass (this cartridge declares classes)`);
    }
  } else if (f.verdict === 'OUT_OF_SCOPE') {
    if (f.severity !== null && f.severity !== undefined) errs.push(`${where}: OUT_OF_SCOPE finding must have severity null`);
    if (Array.isArray(f.citations) && f.citations.length > 0) {
      errs.push(`${where}: OUT_OF_SCOPE finding must not cite a binding provision - it doesn't reach it (rules.md rule 5)`);
    }
    if (!f.note) errs.push(`${where}: OUT_OF_SCOPE finding must explain why in a note`);
  }
}

// Display-only path for error messages - the real check logic never uses this, only humans reading
// the output do. Uses the cartridge's actual resolved folder, not an assumed "reference/" prefix,
// so an error under --root framework-proof (or any other root) points at the real location.
function displayDir(dir) {
  return relative(root, dir).replace(/\\/g, '/') + '/';
}

function anchorAndVerbatimCheck(f, cartridge, errs) {
  const where = f.id || '(missing id)';
  for (const c of f.citations || []) {
    if (!c.provision || (!cartridge.anchors.has(c.provision) && !cartridge.generalOnlyIds.has(c.provision))) {
      errs.push(`${where}: citation provision "${c.provision}" is not in ${displayDir(cartridge.dir)}`);
      continue;
    }
    if (cartridge.generalOnlyIds.has(c.provision)) {
      // A general id (e.g. "100.75" meaning "this regulation generally") has no single span to
      // verbatim-check against. That doesn't mean its claimed text gets a free pass, though - it
      // still has to actually be present and actually appear in the cartridge's real reference
      // text, or it's an empty/fabricated citation (found during the repair-loop pass: an empty
      // or omitted text field on a general-id citation was passing silently).
      const claimed = normalize(c.text || '');
      if (!claimed) {
        errs.push(`${where}: citation "${c.provision}" (a general id) has no text - a citation with nothing quoted isn't a citation`);
        continue;
      }
      const matchesSomething = [...cartridge.anchors.values()].some(
        (truth) => truth.includes(claimed) || claimed.includes(truth)
      );
      if (!matchesSomething) {
        errs.push(`${where}: citation "${c.provision}" (a general id) has text that doesn't match anything in ${displayDir(cartridge.dir)} - looks fabricated\n    claimed: ${claimed}`);
      }
      continue;
    }
    const truth = cartridge.anchors.get(c.provision);
    const claimed = normalize(c.text || '');
    if (claimed !== truth) {
      errs.push(`${where}: citation "${c.provision}" does not match ${displayDir(cartridge.dir)} verbatim\n    claimed: ${claimed}\n    actual:  ${truth}`);
    }
  }
}

function phraseSanityCheck(f, cartridge, errs) {
  if (f.verdict !== 'PASS') return;
  const q = (f.quote || '').toLowerCase();
  const hit = cartridge.flaggedPhrases.find((p) => q.includes(p));
  if (hit) errs.push(`${f.id}: verdict is PASS but quote contains a flagged phrase ("${hit}") from ${cartridge.id}'s phrase guidance`);
}

function validateAudit(audit, cartridge) {
  const errs = [];
  if (!Array.isArray(audit.findings) || audit.findings.length === 0) {
    errs.push('audit has no findings array, or it is empty');
    return errs;
  }
  for (const f of audit.findings) {
    shapeCheck(f, cartridge, errs);
    anchorAndVerbatimCheck(f, cartridge, errs);
    phraseSanityCheck(f, cartridge, errs);
  }
  quoteInArtifactCheck(audit, cartridge, errs);
  return errs;
}

// Quote-to-artifact check (opt-in per cartridge via manifest "quoteInArtifact": true). For a
// text-based standard like Fair Housing, a finding's quote must actually appear in the artifact
// line it cites, so a fabricated or trimmed quote is caught, not just a bad law citation. It runs
// only on the cartridge's designated artifact (audit.artifact === cartridge.artifact), so an
// illustrative audit written against other snippets (examples.findings.json) is not checked against
// the wrong source. Cartridges whose findings describe measured properties instead of literal text
// (WCAG contrast ratios, say) leave the flag off and skip this entirely.
function quoteInArtifactCheck(audit, cartridge, errs) {
  if (!cartridge.quoteInArtifact) return;
  if (audit.artifact !== cartridge.artifact) return;
  if (!existsSync(cartridge.artifactPath)) return;
  const artifactText = readFileSync(cartridge.artifactPath, 'utf8');
  const lineText = {};
  for (const m of artifactText.matchAll(/\*\*(L\d+)\.\*\*\s*(.*)/g)) lineText[m[1]] = m[2];
  for (const f of audit.findings) {
    const lt = lineText[f.id];
    if (lt === undefined || !f.quote) continue;
    if (!normalizeLoose(lt).includes(normalizeLoose(f.quote))) {
      errs.push(`${f.id}: quote is not found in the artifact line it cites - a finding must quote the artifact verbatim, not paraphrase or fabricate it`);
    }
  }
}

// ---------- coverage checks (per cartridge, across that cartridge's own real audits) ----------

function classCoverage(cartridge) {
  const seen = new Set();
  for (const a of cartridge.audits) {
    for (const f of a.findings) {
      if (!f.protectedClass) continue;
      const pc = f.protectedClass.toLowerCase();
      for (const cls of cartridge.classes) if (pc.includes(cls)) seen.add(cls);
    }
  }
  return cartridge.classes.filter((c) => !seen.has(c));
}

function provisionCoverage(cartridge) {
  const seen = new Set();
  for (const a of cartridge.audits) for (const f of a.findings) for (const c of f.citations || []) seen.add(c.provision);
  const missingGroups = [];
  for (const group of cartridge.requiredProvisions) {
    if (!group.some((id) => seen.has(id))) missingGroups.push(group.join(' or '));
  }
  return missingGroups;
}

function artifactLineCoverage(cartridge) {
  if (!existsSync(cartridge.artifactPath) || !existsSync(cartridge.artifactAuditPath)) {
    return [`artifact or artifact-audit file missing for cartridge ${cartridge.id}`];
  }
  const artifactText = readFileSync(cartridge.artifactPath, 'utf8');
  const lineIds = [...artifactText.matchAll(/\*\*(L\d+)\.\*\*/g)].map((m) => m[1]);
  const audit = JSON.parse(readFileSync(cartridge.artifactAuditPath, 'utf8'));
  const foundIds = new Set(audit.findings.map((f) => f.id));
  return lineIds.filter((id) => !foundIds.has(id));
}

// ---------- runner ----------

function findCartridgeForFile(cartridges, filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const idx = parts.lastIndexOf('audits');
  if (idx !== -1 && parts[idx + 1]) {
    const found = cartridges.find((c) => c.id === parts[idx + 1]);
    if (found) return found;
  }
  return null;
}

function main() {
  const rootFlagIdx = process.argv.indexOf('--root');
  const cartridgeRootDir = rootFlagIdx !== -1 ? join(root, process.argv[rootFlagIdx + 1]) : join(root, 'reference');
  const { cartridges, integrityErrors } = loadCartridges(cartridgeRootDir);
  const fileArgIdx = process.argv.indexOf('--file');

  if (fileArgIdx !== -1) {
    const path = process.argv[fileArgIdx + 1];
    // Fixtures live in verify/fixtures/, not under a cartridge folder - they're engine-shape tests,
    // written against the fair-housing cartridge's anchors and phrases. Any other path infers its
    // cartridge from verify/audits/<id>/.
    const cartridge = findCartridgeForFile(cartridges, path) || cartridges.find((c) => c.id === 'fair-housing') || cartridges[0];
    const audit = JSON.parse(readFileSync(path, 'utf8'));
    const errs = validateAudit(audit, cartridge);
    if (errs.length) {
      console.error(`FAIL: ${path} (cartridge: ${cartridge.id})`);
      for (const e of errs) console.error(`  - ${e}`);
      process.exit(1);
    }
    console.log(`ok: ${path} (cartridge: ${cartridge.id})`);
    return;
  }

  let failed = false;

  for (const ie of integrityErrors) {
    failed = true;
    console.error(`FAIL [${ie.id}]: cartridge integrity`);
    for (const e of ie.errors) console.error(`  - ${e}`);
  }

  for (const cartridge of cartridges) {
    console.log(`--- cartridge: ${cartridge.id} (${cartridge.name}) ---`);
    for (const a of cartridge.audits) {
      const errs = validateAudit(a, cartridge);
      if (errs.length) {
        failed = true;
        console.error(`FAIL: verify/audits/${cartridge.id}/${a.file}`);
        for (const e of errs) console.error(`  - ${e}`);
      } else {
        console.log(`ok: verify/audits/${cartridge.id}/${a.file} (${a.findings.length} findings)`);
      }
    }

    if (cartridge.classes.length === 0) {
      console.log(`skip [${cartridge.id}]: no classes/dimension declared for this cartridge`);
    } else {
      const missingClasses = classCoverage(cartridge);
      if (missingClasses.length) {
        failed = true;
        console.error(`FAIL [${cartridge.id}]: class coverage - never exercised: ${missingClasses.join(', ')}`);
      } else {
        console.log(`ok [${cartridge.id}]: all classes exercised across its audits`);
      }
    }

    if (cartridge.requiredProvisions.length === 0) {
      console.log(`skip [${cartridge.id}]: manifest declares no requiredProvisions - nothing to check coverage against`);
    } else {
      const missingProvisions = provisionCoverage(cartridge);
      if (missingProvisions.length) {
        failed = true;
        console.error(`FAIL [${cartridge.id}]: provision coverage - never cited: ${missingProvisions.join('; ')}`);
      } else {
        console.log(`ok [${cartridge.id}]: every required provision group is cited`);
      }
    }

    const artifactLineIds = existsSync(cartridge.artifactPath)
      ? [...readFileSync(cartridge.artifactPath, 'utf8').matchAll(/\*\*(L\d+)\.\*\*/g)].map((m) => m[1])
      : [];
    if (artifactLineIds.length === 0) {
      failed = true;
      console.error(`FAIL [${cartridge.id}]: artifact has zero "**Lx.**" numbered lines - either it's missing or doesn't follow the numbering convention this checker relies on (see README.md's "how to add a standard"), so line coverage can't be verified at all`);
    } else {
      const missingLines = artifactLineCoverage(cartridge);
      if (missingLines.length) {
        failed = true;
        console.error(`FAIL [${cartridge.id}]: artifact lines never audited: ${missingLines.join(', ')}`);
      } else {
        console.log(`ok [${cartridge.id}]: every artifact line has a finding`);
      }
    }
  }

  // The fail_*.json fixtures are written against the fair-housing cartridge's anchors and phrases
  // (they need real reference text to be a misquote OF). They only apply when that cartridge is
  // actually in the scanned root - under --root framework-proof there's no fair-housing cartridge
  // to check them against, so they're skipped there, not failed.
  const fhCartridge = cartridges.find((c) => c.id === 'fair-housing');
  const fixturesDir = join(root, 'verify', 'fixtures');
  if (!fhCartridge) {
    console.log('skip: fail_*.json fixtures need the fair-housing cartridge, not present under this --root');
  } else {
    for (const f of readdirSync(fixturesDir).filter((f) => f.startsWith('fail_'))) {
      const path = join(fixturesDir, f);
      const audit = JSON.parse(readFileSync(path, 'utf8'));
      const errs = validateAudit(audit, fhCartridge);
      if (errs.length === 0) {
        failed = true;
        console.error(`FAIL: fixture ${f} was supposed to fail validation but passed - the gate it tests is dead`);
      } else {
        console.log(`ok (failed as required): verify/fixtures/${f}`);
      }
    }
  }

  // Cartridge-integrity fixture: a manifest pointing at files that don't exist, checked in isolation
  // (not under reference/, so it never touches the real cartridge scan above).
  const brokenDir = join(root, 'verify', 'fixtures', 'broken-cartridge');
  const brokenManifest = JSON.parse(readFileSync(join(brokenDir, 'cartridge.json'), 'utf8'));
  const brokenErrs = checkCartridgeIntegrity(brokenDir, brokenManifest);
  if (brokenErrs.length === 0) {
    failed = true;
    console.error('FAIL: verify/fixtures/broken-cartridge was supposed to fail cartridge-integrity but passed - the gate is dead');
  } else {
    console.log('ok (failed as required): verify/fixtures/broken-cartridge (cartridge integrity)');
  }

  // Same pattern, different failure shape (repair-loop pass 3): a manifest missing required
  // fields entirely, or with a field present but the wrong type, not just pointing at missing files.
  const brokenShapeDir = join(root, 'verify', 'fixtures', 'broken-cartridge-shape');
  const brokenShapeManifest = JSON.parse(readFileSync(join(brokenShapeDir, 'cartridge.json'), 'utf8'));
  const brokenShapeErrs = checkCartridgeIntegrity(brokenShapeDir, brokenShapeManifest);
  if (brokenShapeErrs.length === 0) {
    failed = true;
    console.error('FAIL: verify/fixtures/broken-cartridge-shape was supposed to fail cartridge-integrity but passed - the gate is dead');
  } else {
    console.log(`ok (failed as required): verify/fixtures/broken-cartridge-shape (${brokenShapeErrs.length} shape errors caught)`);
  }

  // Regression guard (repair-loop pass 1): loadFlaggedPhrasesForCartridge must read quoted text
  // from the Phrase column only. It used to scan the whole table row, which silently pulled in
  // article titles and note-asides from the Source/Why columns as if they were flagged phrases.
  const phraseFixtureDir = join(root, 'verify', 'fixtures', 'phrase-parsing');
  const extractedPhrases = loadFlaggedPhrasesForCartridge(phraseFixtureDir, 'guidance.md');
  const leaked = extractedPhrases.includes('this title should not be flagged') || extractedPhrases.includes('not a real phrase either');
  const gotReal = extractedPhrases.includes('flagged term');
  if (leaked || !gotReal) {
    failed = true;
    console.error(`FAIL: phrase-guidance column-scoping regression - extracted ${JSON.stringify(extractedPhrases)}, expected exactly ["flagged term"]`);
  } else {
    console.log('ok (regression guard): phrase-guidance parser reads the Phrase column only');
  }

  if (failed) process.exit(1);
}

main();
