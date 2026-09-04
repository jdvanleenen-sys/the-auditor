#!/usr/bin/env node
// Verify Auditor findings against the real standard in reference/. Fails loud, exits non-zero.
// Usage:
//   node verify/check.mjs                 - validate every real audit in verify/audits/, run coverage, then
//                                            confirm every verify/fixtures/fail_*.json fails as required
//   node verify/check.mjs --file <path>   - validate one audit file only, print its errors, exit 1 if any
//
// Four checks, every finding gets all four:
//   1. anchor      - every citation.provision exists in reference/ (or is the general "100.75" id)
//   2. verbatim    - every citation.text matches the reference/ span for that provision, byte for byte
//                    (after stripping markdown decoration and blockquote/bold markers - see normalize())
//   3. shape       - every finding has an id, a quote, a verdict, and the fields that verdict requires
//   4. phrase sanity - a PASS finding can't quote a phrase reference/phrase-guidance.md flags as discriminatory
//
// Plus two coverage checks, run across every real audit together (not fixtures):
//   5. class coverage    - all seven protected classes in reference/protected-classes.md appear in some finding
//   6. artifact coverage - every numbered line in sample-listing.md has a matching finding (rule 3: every line
//                          gets walked, pass or fail, not just the bad ones)
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// ---------- reference/ parsing ----------

function normalize(span) {
  let t = span.trim();
  t = t.replace(/^>\s?/, ''); // strip a leading blockquote marker
  t = t.replace(/^\*\*\([a-z0-9]+\)\*\*\s?/i, ''); // strip a leading **(a)** / **(1)** label
  t = t.trim();
  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1); // strip wrapping quote marks
  return t.replace(/\s+/g, ' ').trim();
}

function loadAnchors() {
  const files = ['42-usc-3604c.md', '24-cfr-100.75.md'].map((f) => join(root, 'reference', f));
  const anchors = new Map();
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    const re = /<!--\s*verbatim:(\S+)\s*-->([\s\S]*?)<!--\s*\/verbatim\s*-->/g;
    let m;
    while ((m = re.exec(text))) anchors.set(m[1], normalize(m[2]));
  }
  return anchors;
}

// A citation may also use the bare "100.75" id to mean "this regulation generally."
// It's a valid anchor (passes the anchor-check) but has no single span, so it's exempt from verbatim-check.
const GENERAL_ONLY_IDS = new Set(['100.75']);

function loadFlaggedPhrases() {
  const text = readFileSync(join(root, 'reference', 'phrase-guidance.md'), 'utf8');
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

const PROTECTED_CLASSES = ['race', 'color', 'religion', 'sex', 'disability', 'familial status', 'national origin'];

// ---------- audit JSON validation ----------

function shapeCheck(f, errs) {
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
    if (!f.protectedClass) errs.push(`${where}: FAIL finding must name a protectedClass`);
  } else if (f.verdict === 'OUT_OF_SCOPE') {
    if (f.severity !== null && f.severity !== undefined) errs.push(`${where}: OUT_OF_SCOPE finding must have severity null`);
    if (Array.isArray(f.citations) && f.citations.length > 0) {
      errs.push(`${where}: OUT_OF_SCOPE finding must not cite 3604c/100.75 - they don't reach it (rules.md rule 5)`);
    }
    if (!f.note) errs.push(`${where}: OUT_OF_SCOPE finding must explain why in a note`);
  }
}

function anchorAndVerbatimCheck(f, anchors, errs) {
  const where = f.id || '(missing id)';
  for (const c of f.citations || []) {
    if (!c.provision || !anchors.has(c.provision) && !GENERAL_ONLY_IDS.has(c.provision)) {
      errs.push(`${where}: citation provision "${c.provision}" is not in reference/`);
      continue;
    }
    if (GENERAL_ONLY_IDS.has(c.provision)) continue; // no single span to verbatim-check
    const truth = anchors.get(c.provision);
    const claimed = normalize(c.text || '');
    if (claimed !== truth) {
      errs.push(`${where}: citation "${c.provision}" does not match reference/ verbatim\n    claimed: ${claimed}\n    actual:  ${truth}`);
    }
  }
}

function phraseSanityCheck(f, flaggedPhrases, errs) {
  if (f.verdict !== 'PASS') return;
  const q = (f.quote || '').toLowerCase();
  const hit = flaggedPhrases.find((p) => q.includes(p));
  if (hit) errs.push(`${f.id}: verdict is PASS but quote contains a flagged phrase ("${hit}") from phrase-guidance.md`);
}

function validateAudit(audit, anchors, flaggedPhrases) {
  const errs = [];
  if (!Array.isArray(audit.findings) || audit.findings.length === 0) {
    errs.push('audit has no findings array, or it is empty');
    return errs;
  }
  for (const f of audit.findings) {
    shapeCheck(f, errs);
    anchorAndVerbatimCheck(f, anchors, errs);
    phraseSanityCheck(f, flaggedPhrases, errs);
  }
  return errs;
}

// ---------- coverage checks (run across every real audit together) ----------

function classCoverage(audits) {
  const seen = new Set();
  for (const a of audits) {
    for (const f of a.findings) {
      if (!f.protectedClass) continue;
      const pc = f.protectedClass.toLowerCase();
      for (const cls of PROTECTED_CLASSES) if (pc.includes(cls)) seen.add(cls);
    }
  }
  return PROTECTED_CLASSES.filter((c) => !seen.has(c));
}

function provisionCoverage(audits) {
  const seen = new Set();
  for (const a of audits) for (const f of a.findings) for (const c of f.citations || []) seen.add(c.provision);
  const missing = [];
  if (!seen.has('3604c')) missing.push('3604c');
  if (!['100.75c1', '100.75c2', '100.75c3', '100.75c4'].some((id) => seen.has(id))) {
    missing.push('at least one of 100.75c1-c4');
  }
  return missing;
}

function artifactLineCoverage() {
  const listingPath = join(root, 'sample-listing.md');
  const listing = readFileSync(listingPath, 'utf8');
  const lineIds = [...listing.matchAll(/\*\*(L\d+)\.\*\*/g)].map((m) => m[1]);
  const auditPath = join(root, 'verify', 'audits', 'sample-listing.findings.json');
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
  const foundIds = new Set(audit.findings.map((f) => f.id));
  return lineIds.filter((id) => !foundIds.has(id));
}

// ---------- runner ----------

function loadRealAudits() {
  const dir = join(root, 'verify', 'audits');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.findings.json'))
    .map((f) => ({ file: f, ...JSON.parse(readFileSync(join(dir, f), 'utf8')) }));
}

function main() {
  const anchors = loadAnchors();
  const flaggedPhrases = loadFlaggedPhrases();
  const fileArgIdx = process.argv.indexOf('--file');

  if (fileArgIdx !== -1) {
    const path = process.argv[fileArgIdx + 1];
    const audit = JSON.parse(readFileSync(path, 'utf8'));
    const errs = validateAudit(audit, anchors, flaggedPhrases);
    if (errs.length) {
      console.error(`FAIL: ${path}`);
      for (const e of errs) console.error(`  - ${e}`);
      process.exit(1);
    }
    console.log(`ok: ${path}`);
    return;
  }

  let failed = false;
  const audits = loadRealAudits();
  for (const a of audits) {
    const errs = validateAudit(a, anchors, flaggedPhrases);
    if (errs.length) {
      failed = true;
      console.error(`FAIL: verify/audits/${a.file}`);
      for (const e of errs) console.error(`  - ${e}`);
    } else {
      console.log(`ok: verify/audits/${a.file} (${a.findings.length} findings)`);
    }
  }

  const missingClasses = classCoverage(audits);
  if (missingClasses.length) {
    failed = true;
    console.error(`FAIL: class coverage - never exercised: ${missingClasses.join(', ')}`);
  } else {
    console.log('ok: all seven protected classes exercised across examples.md + sample-listing.md');
  }

  const missingProvisions = provisionCoverage(audits);
  if (missingProvisions.length) {
    failed = true;
    console.error(`FAIL: provision coverage - never cited: ${missingProvisions.join(', ')}`);
  } else {
    console.log('ok: 3604c and at least one 100.75(c) example both cited');
  }

  const missingLines = artifactLineCoverage();
  if (missingLines.length) {
    failed = true;
    console.error(`FAIL: sample-listing.md lines never audited: ${missingLines.join(', ')}`);
  } else {
    console.log('ok: every line of sample-listing.md has a finding (rule 3: pass and fail both reported)');
  }

  const fixturesDir = join(root, 'verify', 'fixtures');
  for (const f of readdirSync(fixturesDir).filter((f) => f.startsWith('fail_'))) {
    const path = join(fixturesDir, f);
    const audit = JSON.parse(readFileSync(path, 'utf8'));
    const errs = validateAudit(audit, anchors, flaggedPhrases);
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
