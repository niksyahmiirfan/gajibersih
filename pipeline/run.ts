// Orchestrator used by the content workflow: brief → draft → verify for up to --limit approved keywords.
// Marks entries "drafted" so the next run picks new ones. A human merges the PR to publish.
import fs from 'node:fs';
import { makeBrief } from './brief';
import { makeDraft } from './draft';
import { listContentFiles, toMarkdown, verifyFile, llmClaimCheck, type FileReport } from './verify';
import { argValue, contentPath, loadKeywords, saveKeywords } from './common';

const limit = Number(argValue('limit') ?? 3);
const reportPath = argValue('report') ?? 'pipeline-report.md';

const keywords = loadKeywords();
const todo = keywords.filter((k) => k.status === 'approved' && !fs.existsSync(contentPath(k))).slice(0, limit);
if (!todo.length) { console.log('No approved keywords left to draft.'); process.exit(0); }

const reports: FileReport[] = [];
for (const k of todo) {
  try {
    await makeBrief(k);
    const file = await makeDraft(k);
    const r = verifyFile(file, listContentFiles());
    try { r.findings.push(...(await llmClaimCheck(file))); } catch { /* optional */ }
    reports.push(r);
    k.status = 'drafted';
    console.log(`✓ ${k.id}`);
  } catch (e) {
    console.error(`✗ ${k.id}: ${e}`);
    reports.push({ file: k.id, words: 0, findings: [{ level: 'error', check: 'pipeline', message: String(e).slice(0, 300) }] });
  }
}
saveKeywords(keywords);
fs.writeFileSync(reportPath, toMarkdown(reports));
console.log(`Report written to ${reportPath}`);
// Never fail the job here: the PR (with the report as its body) is how a human sees problems. CI re-verifies and blocks merging.
