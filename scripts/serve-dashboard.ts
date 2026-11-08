// Local-only dashboard server: http://localhost:4321  (metrics stay off the public site)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA = process.env.METRICS_OUT_DIR || path.join(ROOT, 'metrics', 'data');
const PORT = Number(process.env.PORT || 4321);
const routes: Record<string, string> = {
  '/': path.join(ROOT, 'dashboard', 'index.html'),
  '/vendor/chart.js': path.join(ROOT, 'node_modules', 'chart.js', 'dist', 'chart.umd.min.js'),
};
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.csv': 'text/csv' };

http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x').pathname;
  let file = routes[url];
  if (!file && url.startsWith('/data/')) {
    const name = path.basename(url);
    if (/^[\w-]+\.(json|csv)$/.test(name)) file = path.join(DATA, name);
  }
  if (!file || !fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`Dashboard → http://localhost:${PORT}  (data: ${path.relative(ROOT, DATA)})`));
