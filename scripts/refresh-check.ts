// Fetch each watched page, reduce it to normalised visible text, hash it, compare with data/watch-state.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';

interface Watch { id: string; url: string; affects: string; selector_hint?: string }
interface State { [id: string]: { hash: string; checked: string; excerpt: string } }

const root = process.cwd();
const watches = yaml.load(fs.readFileSync(path.join(root, 'data/watch.yaml'), 'utf8')) as Watch[];
const statePath = path.join(root, 'data/watch-state.json');
const state: State = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
const outIdx = process.argv.indexOf('--out');
const outFile = outIdx > 0 ? process.argv[outIdx + 1] : null;

function visibleText(html: string) {
  return html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\b(csrf|nonce|token|timestamp)[^\s]*/gi, '') // volatile bits
    .replace(/\s+/g, ' ')
    .trim();
}

const changes: string[] = [];
const today = new Date().toISOString().slice(0, 10);
for (const w of watches) {
  try {
    const res = await fetch(w.url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; rate-watcher/1.0)' } });
    if (!res.ok) { changes.push(`- ⚠️ **${w.id}** returned HTTP ${res.status} — ${w.url}`); continue; }
    const text = visibleText(await res.text());
    if (w.selector_hint && !text.toLowerCase().includes(w.selector_hint.toLowerCase())) {
      changes.push(`- ⚠️ **${w.id}** no longer mentions "${w.selector_hint}" — page may have moved: ${w.url}`);
    }
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const prev = state[w.id];
    if (prev && prev.hash !== hash) {
      changes.push(`- 🔄 **${w.id}** changed since ${prev.checked}. Review ${w.url} and update \`${w.affects}\` (then re-run tests).`);
    }
    state[w.id] = { hash, checked: today, excerpt: text.slice(0, 200) };
    console.log(`${prev ? (prev.hash === hash ? 'same   ' : 'CHANGED') : 'new    '} ${w.id}`);
  } catch (e) {
    changes.push(`- ⚠️ **${w.id}** fetch failed: ${String(e).slice(0, 150)}`);
  }
}

fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
const body = `Automated check on ${today}.\n\n${changes.join('\n')}\n\nAfter updating data files: bump \`last_verified\` in meta.yaml, add any new official table rows as fixtures, and run \`npm test\`.`;
if (outFile) fs.writeFileSync(outFile, body);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changes.length > 0}\n`);
console.log(changes.length ? body : 'No changes.');
