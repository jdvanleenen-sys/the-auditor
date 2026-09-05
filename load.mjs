#!/usr/bin/env node
// load.mjs — insert a cartridge into the engine and print a ready-to-run auditor.
//
//   node load.mjs <cartridge-id>            print the loaded auditor to the screen
//   node load.mjs <cartridge-id> > out.md   save it, then paste it into any AI
//   node load.mjs --list                    list the cartridges you can load
//
// The engine (engine-core.md) never changes. This swaps the standard behind it.
// Same idea as the verifier's --root flag, pointed at the person running the auditor
// instead of at the checker.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOTS = ['reference', 'framework-proof']; // where cartridges live

function findCartridges() {
  const found = [];
  for (const root of ROOTS) {
    const base = join(here, root);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const manifest = join(base, name, 'cartridge.json');
      if (existsSync(manifest)) {
        try {
          const c = JSON.parse(readFileSync(manifest, 'utf8'));
          found.push({ ...c, dir: join(base, name), root });
        } catch {
          /* skip a malformed manifest, the verifier is what reports those */
        }
      }
    }
  }
  return found;
}

function renderWorkedExample(cart) {
  const auditPath = join(here, 'verify', 'audits', cart.id, cart.artifactAudit || '');
  if (!cart.artifactAudit || !existsSync(auditPath)) return '';
  let audit;
  try { audit = JSON.parse(readFileSync(auditPath, 'utf8')); } catch { return ''; }
  const rows = (audit.findings || []).map((f) => {
    const prov = (f.citations && f.citations[0] && f.citations[0].provision) || '-';
    const sev = f.severity == null ? '-' : f.severity;
    const note = (f.note || '').split('. ')[0];
    return `${f.id}: ${f.verdict} [${sev}] ${f.verdict === 'FAIL' ? prov : '-'}${note ? ' — ' + note : ''}`;
  });
  const artPath = join(cart.dir, cart.artifact || '');
  const artifact = existsSync(artPath) ? readFileSync(artPath, 'utf8').trim() : '(sample artifact not found)';
  return `\n=================== WORKED EXAMPLE (this cartridge, already audited) ===================\n` +
    `Sample artifact:\n\n${artifact}\n\nThe audit of that artifact:\n${rows.join('\n')}\n`;
}

function load(id) {
  const carts = findCartridges();
  const cart = carts.find((c) => c.id === id);
  if (!cart) {
    console.error(`No cartridge "${id}". Loadable cartridges: ${carts.map((c) => c.id).join(', ')}`);
    process.exit(1);
  }
  const engine = readFileSync(join(here, 'engine-core.md'), 'utf8').trim();
  const standard = (cart.standardFiles || [])
    .map((f) => readFileSync(join(cart.dir, f), 'utf8').trim())
    .join('\n\n');
  const phrase = cart.phraseFile && existsSync(join(cart.dir, cart.phraseFile))
    ? '\n\n' + readFileSync(join(cart.dir, cart.phraseFile), 'utf8').trim()
    : '';
  const example = renderWorkedExample(cart);

  const out =
    `${engine}\n\n` +
    `=================== STANDARD LOADED: ${cart.name} (cartridge: ${cart.id}) ===================\n\n` +
    `${standard}${phrase}\n` +
    `${example}\n` +
    `=================== NOW AUDIT ===================\n` +
    `Paste the artifact to audit below this line, then produce the report exactly as the engine core describes. ` +
    `Cite only provisions from the standard loaded above.\n`;
  process.stdout.write(out);
}

const arg = process.argv[2];
if (!arg || arg === '--list') {
  const carts = findCartridges();
  console.log('Loadable cartridges (node load.mjs <id>):');
  for (const c of carts) console.log(`  ${c.id.padEnd(14)} ${c.name}  [${c.root}/]`);
} else {
  load(arg);
}
