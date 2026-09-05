#!/usr/bin/env node
// freshness.mjs — is any loaded standard going stale?
//
//   node freshness.mjs            offline: report each standard's source, capture date, and age
//   node freshness.mjs --check    also fetch each source and flag provisions no longer found there
//
// This is deliberately SEPARATE from verify/check.mjs. The verifier is offline and
// deterministic on purpose, so it never depends on the network. Freshness is the opposite
// job (has the world changed since we captured the standard?), so it lives on its own and
// is never wired into CI. A clean verifier proves the folder is internally honest; freshness
// proves the folder still matches the world.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOTS = ['reference', 'framework-proof'];
const STALE_DAYS = 30; // capture older than this gets a re-verify flag

function cartridges() {
  const out = [];
  for (const root of ROOTS) {
    const base = join(here, root);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const man = join(base, name, 'cartridge.json');
      if (existsSync(man)) {
        try { out.push({ ...JSON.parse(readFileSync(man, 'utf8')), dir: join(base, name) }); } catch {}
      }
    }
  }
  return out;
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return fm;
}

function ageDays(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const then = new Date(dateStr + 'T00:00:00Z').getTime();
  const now = Date.now();
  return Math.floor((now - then) / 86400000);
}

function anchors(text) {
  const re = /<!--\s*verbatim:(\S+)\s*-->([\s\S]*?)<!--\s*\/verbatim\s*-->/g;
  const out = []; let m;
  while ((m = re.exec(text))) out.push({ id: m[1], text: m[2] });
  return out;
}
const norm = (s) => s.replace(/<[^>]+>/g, ' ').replace(/[*_>`#]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

async function liveCheck(url, provisions) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return { reachable: false, note: 'HTTP ' + res.status };
    const page = norm(await res.text());
    const missing = provisions.filter((p) => {
      const probe = norm(p.text).slice(0, 120);
      return probe.length > 20 && !page.includes(probe);
    }).map((p) => p.id);
    return { reachable: true, checked: provisions.length, missing };
  } catch (e) {
    return { reachable: false, note: String(e.message || e).slice(0, 60) };
  }
}

const doCheck = process.argv.includes('--check');

console.log('Freshness report' + (doCheck ? ' (with live source check)' : ' (offline)') + '\n');
for (const cart of cartridges()) {
  console.log('# ' + cart.id + ' — ' + cart.name);
  for (const f of cart.standardFiles || []) {
    const text = readFileSync(join(cart.dir, f), 'utf8');
    const fm = frontmatter(text);
    const age = ageDays(fm.retrieved);
    const staleFlag = age == null ? '(no capture date)' : age > STALE_DAYS ? `STALE: ${age} days old, re-verify` : `${age} days old`;
    console.log(`  ${f}`);
    console.log(`    status:   ${fm.status || '-'}`);
    console.log(`    captured: ${fm.retrieved || '-'}  (${staleFlag})`);
    console.log(`    source:   ${fm.source_url || fm.source_name || '(internal, no public URL — verify manually)'}`);
    if (doCheck) {
      if (!fm.source_url) { console.log('    live:     skipped (no public source_url)'); continue; }
      const provs = anchors(text);
      const r = await liveCheck(fm.source_url, provs);
      if (!r.reachable) console.log(`    live:     source unreachable (${r.note}) — verify manually`);
      else if (r.missing.length === 0) console.log(`    live:     all ${r.checked} provisions still found at source`);
      else console.log(`    live:     ${r.missing.length}/${r.checked} provisions NOT found at source: ${r.missing.join(', ')} (may have changed, or the page format differs — verify manually)`);
    }
  }
  console.log('');
}
console.log('How to use this: for anything past its re-verify age, a human opens the source above, reads the shipped provision next to the live one, and confirms they still match. That is a currency check, and it needs no legal training, the same open-two-things-and-compare skill as verifying a finding. This tool surfaces what to check and when; a person confirms it. "not found" under --check is only a rough flag (third-party pages reformat text), never proof the law changed. The verifier (verify/check.mjs) stays offline and is the source of internal truth.');
