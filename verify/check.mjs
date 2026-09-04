#!/usr/bin/env node
// Verify Auditor findings against the active cartridge(s)' standard(s) in reference/<id>/. Fails loud, exits non-zero.
//
// A cartridge is any reference/<id>/ folder that has a cartridge.json manifest. Fair Housing is
// the one cartridge shipped today; a second standard is added by adding a folder, not by editing
// this file. See reference/fair-housing/cartridge.json for the manifest shape.
//
// Usage:
//   node verify/check.mjs                 - validate every real audit for every discovered cartridge,
//                                            run each cartridge's coverage checks, then confirm every
//                                            verify/fixtures/fail_*.json fails as required
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
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
    for (const m of line.matchAll(/"([^"]+)"/g)) phrases.push(m[1].toLowerCase());
  }
  return phrases;
}

function loadCartridges() {
  const referenceDir = join(root, 'reference');
  const cartridges = [];
  for (const entry of readdirSync(referenceDir)) {
    const dir = join(referenceDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const manifestPath = join(dir, 'cartridge.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const auditsDir = join(root, 'verify', 'audits', manifest.id);
    const audits = existsSync(auditsDir)
      ? readdirSync(auditsDir)
          .filter((f) => f.endsWith('.findings.json'))
          .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(auditsDir, f), 'utf8')) }))
      : [];
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
      artifactAuditPath: join(auditsDir, manifest.artifactAudit),
      auditsDir,
      audits,
    });
  }
  return cartridges;
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

function anchorAndVerbatimCheck(f, cartridge, errs) {
  const where = f.id || '(missing id)';
  for (const c of f.citations || []) {
    if (!c.provision || (!cartridge.anchors.has(c.provision) && !cartridge.generalOnlyIds.has(c.provision))) {
      errs.push(`${where}: citation provision "${c.provision}" is not in reference/${cartridge.id}/`);
      continue;
    }
    if (cartridge.generalOnlyIds.has(c.provision)) continue; // no single span to verbatim-check
    const truth = cartridge.anchors.get(c.provision);
    const claimed = normalize(c.text || '');
    if (claimed !== truth) {
      errs.push(`${where}: citation "${c.provision}" does not match reference/${cartridge.id}/ verbatim\n    claimed: ${claimed}\n    actual:  ${truth}`);
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
  return errs;
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
  const cartridges = loadCartridges();
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

    const missingProvisions = provisionCoverage(cartridge);
    if (missingProvisions.length) {
      failed = true;
      console.error(`FAIL [${cartridge.id}]: provision coverage - never cited: ${missingProvisions.join('; ')}`);
    } else {
      console.log(`ok [${cartridge.id}]: every required provision group is cited`);
    }

    const missingLines = artifactLineCoverage(cartridge);
    if (missingLines.length) {
      failed = true;
      console.error(`FAIL [${cartridge.id}]: artifact lines never audited: ${missingLines.join(', ')}`);
    } else {
      console.log(`ok [${cartridge.id}]: every artifact line has a finding`);
    }
  }

  const fhCartridge = cartridges.find((c) => c.id === 'fair-housing');
  const fixturesDir = join(root, 'verify', 'fixtures');
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

  if (failed) process.exit(1);
}

main();
