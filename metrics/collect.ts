// Daily metrics collector → metrics/data/*.json + daily.csv
// Sources (each optional — skipped when its credentials are missing):
//   • Google Search Console  (service account)  clicks, impressions, CTR, position, queries, pages, countries
//   • Google Analytics 4     (service account)  sessions, users, pageviews, engagement, `calculate` events, countries
//   • Google AdSense         (OAuth refresh token) earnings, page views, page RPM, impressions, clicks
//   • Repo content inventory (local)            published pages, drafts, data freshness
// Usage: tsx metrics/collect.ts [--days 10] [--sample]
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { GoogleAuth } from 'google-auth-library';
import { CLUSTER_SALARIES } from '../src/lib/site';

const ROOT = process.cwd();
const OUT = process.env.METRICS_OUT_DIR || path.join(ROOT, 'metrics', 'data');
const args = process.argv.slice(2);
const DAYS = Number(args[args.indexOf('--days') + 1]) || 10;
const SAMPLE = args.includes('--sample');
const HOME_COUNTRY = process.env.HOME_COUNTRY || 'Malaysia';

export interface DailyRow {
  date: string;
  gsc_clicks?: number; gsc_impressions?: number; gsc_ctr?: number; gsc_position?: number;
  ga_sessions?: number; ga_users?: number; ga_pageviews?: number; ga_engagement_rate?: number; ga_home_country_sessions?: number;
  calculations?: number;
  ad_earnings?: number; ad_pageviews?: number; ad_rpm?: number; ad_impressions?: number; ad_clicks?: number;
}
const COLUMNS: (keyof DailyRow)[] = ['date', 'gsc_clicks', 'gsc_impressions', 'gsc_ctr', 'gsc_position', 'ga_sessions', 'ga_users',
  'ga_pageviews', 'ga_engagement_rate', 'ga_home_country_sessions', 'calculations', 'ad_earnings', 'ad_pageviews', 'ad_rpm', 'ad_impressions', 'ad_clicks'];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return iso(d); };
const r2 = (n: number) => Math.round(n * 100) / 100;
const r4 = (n: number) => Math.round(n * 10000) / 10000;

// ---------- auth ----------
async function serviceAccountToken(scopes: string[]) {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  const auth = new GoogleAuth({ credentials: JSON.parse(json), scopes });
  const client = await auth.getClient();
  return (await client.getAccessToken()).token ?? null;
}

async function adsenseToken() {
  const { ADSENSE_CLIENT_ID: id, ADSENSE_CLIENT_SECRET: secret, ADSENSE_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return null;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error(`AdSense token: HTTP ${res.status} ${await res.text()}`);
  return (await res.json()).access_token as string;
}

async function api(url: string, token: string, body?: unknown) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${url.split('?')[0]} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

// ---------- Search Console ----------
async function collectGsc(start: string, end: string) {
  const site = process.env.GSC_SITE_URL;
  const token = site && (await serviceAccountToken(['https://www.googleapis.com/auth/webmasters.readonly']));
  if (!site || !token) return null;
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  type GRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
  const q = async (dimensions: string[], s: string, e: string, rowLimit = 1000) =>
    ((await api(url, token, { startDate: s, endDate: e, dimensions, rowLimit, dataState: 'all' })).rows ?? []) as GRow[];

  const daily = (await q(['date'], start, end)).map((r) => ({
    date: r.keys[0], gsc_clicks: r.clicks, gsc_impressions: r.impressions, gsc_ctr: r4(r.ctr), gsc_position: r2(r.position),
  }));
  const s28 = daysAgo(30), e28 = daysAgo(2); // GSC data lags ~2 days
  const map = (rows: GRow[], key: string) => rows.map((r) => ({ [key]: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r4(r.ctr), position: r2(r.position) }));
  return {
    daily,
    queries: map(await q(['query'], s28, e28, 500), 'query'),
    pages: map(await q(['page'], s28, e28, 200), 'page'),
    countries: map(await q(['country'], s28, e28, 50), 'country'),
  };
}

// ---------- GA4 ----------
async function collectGa(start: string, end: string) {
  const prop = process.env.GA4_PROPERTY_ID;
  const token = prop && (await serviceAccountToken(['https://www.googleapis.com/auth/analytics.readonly']));
  if (!prop || !token) return null;
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`;
  type GaRow = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };
  const run = async (body: object) => ((await api(url, token, body)).rows ?? []) as GaRow[];
  const gaDate = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;

  const base = await run({
    dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'engagementRate' }],
  });
  const calc = await run({
    dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: 'date' }], metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'calculate' } } },
  });
  const home = await run({
    dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }],
    dimensionFilter: { filter: { fieldName: 'country', stringFilter: { value: HOME_COUNTRY } } },
  });
  const countries = await run({
    dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'country' }],
    metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 50,
  });
  const pages = await run({
    dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'sessions' }, { name: 'eventCount' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 200,
  });

  const byDate = new Map<string, DailyRow>();
  const row = (d: string) => byDate.get(d) ?? (byDate.set(d, { date: d }), byDate.get(d)!);
  for (const r of base) Object.assign(row(gaDate(r.dimensionValues[0].value)), {
    ga_sessions: +r.metricValues[0].value, ga_users: +r.metricValues[1].value, ga_pageviews: +r.metricValues[2].value, ga_engagement_rate: r4(+r.metricValues[3].value),
  });
  for (const r of calc) row(gaDate(r.dimensionValues[0].value)).calculations = +r.metricValues[0].value;
  for (const r of home) row(gaDate(r.dimensionValues[0].value)).ga_home_country_sessions = +r.metricValues[0].value;
  return {
    daily: [...byDate.values()],
    countries: countries.map((r) => ({ country: r.dimensionValues[0].value, sessions: +r.metricValues[0].value })),
    pages: pages.map((r) => ({ page: r.dimensionValues[0].value, sessions: +r.metricValues[0].value })),
  };
}

// ---------- AdSense ----------
async function collectAdsense(start: string, end: string) {
  const account = process.env.ADSENSE_ACCOUNT;
  const token = account && (await adsenseToken());
  if (!account || !token) return null;
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const qs = new URLSearchParams({
    dateRange: 'CUSTOM', 'startDate.year': String(sy), 'startDate.month': String(sm), 'startDate.day': String(sd),
    'endDate.year': String(ey), 'endDate.month': String(em), 'endDate.day': String(ed), dimensions: 'DATE', currencyCode: 'USD',
  });
  for (const m of ['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'PAGE_VIEWS_RPM', 'IMPRESSIONS', 'CLICKS']) qs.append('metrics', m);
  const data = await api(`https://adsense.googleapis.com/v2/${account}/reports:generate?${qs}`, token);
  type Cell = { value: string };
  return ((data.rows ?? []) as { cells: Cell[] }[]).map(({ cells }) => ({
    date: cells[0].value, ad_earnings: r2(+cells[1].value), ad_pageviews: +cells[2].value, ad_rpm: r2(+cells[3].value),
    ad_impressions: +cells[4].value, ad_clicks: +cells[5].value,
  }));
}

// ---------- Content inventory (from the repo itself) ----------
function collectContent() {
  const count = (dir: string): number => !fs.existsSync(dir) ? 0 : fs.readdirSync(dir).reduce((n, f) => {
    const p = path.join(dir, f);
    return n + (fs.statSync(p).isDirectory() ? (f === 'briefs' ? 0 : count(p)) : f.endsWith('.md') ? 1 : 0);
  }, 0);
  const metaFiles = fs.existsSync(path.join(ROOT, 'data/my')) ? fs.readdirSync(path.join(ROOT, 'data/my')).filter((d) => /^\d{4}$/.test(d)).sort() : [];
  const latest = metaFiles.at(-1);
  const meta = latest ? (yaml.load(fs.readFileSync(path.join(ROOT, 'data/my', latest, 'meta.yaml'), 'utf8')) as { last_verified: string }) : null;
  const kwFile = path.join(ROOT, 'pipeline/keywords.yaml');
  const keywords = fs.existsSync(kwFile) ? (yaml.load(fs.readFileSync(kwFile, 'utf8')) as { status: string }[]) : [];
  const byStatus = keywords.reduce<Record<string, number>>((m, k) => ((m[k.status] = (m[k.status] ?? 0) + 1), m), {});
  const watchState = path.join(ROOT, 'data/watch-state.json');
  return {
    generated: iso(new Date()),
    data_year: latest ? Number(latest) : null,
    data_last_verified: meta?.last_verified ?? null,
    data_age_days: meta ? Math.floor((Date.now() - Date.parse(meta.last_verified)) / 86_400_000) : null,
    tool_pages: 2,
    cluster_pages: CLUSTER_SALARIES.length,
    articles: count(path.join(ROOT, 'content')),
    keywords: byStatus,
    watch_last_checked: fs.existsSync(watchState) ? Object.values(JSON.parse(fs.readFileSync(watchState, 'utf8')) as Record<string, { checked: string }>)[0]?.checked ?? null : null,
  };
}

// ---------- merge + write ----------
function readJson<T>(name: string, fallback: T): T {
  const p = path.join(OUT, name);
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf8')) as T) : fallback;
}
function writeJson(name: string, data: unknown) { fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1) + '\n'); }

function mergeDaily(existing: DailyRow[], ...updates: (Partial<DailyRow> & { date: string })[][]) {
  const map = new Map(existing.map((r) => [r.date, { ...r }]));
  for (const list of updates) for (const u of list) {
    const cur = map.get(u.date) ?? { date: u.date };
    for (const [k, v] of Object.entries(u)) if (v !== undefined && v !== null) (cur as Record<string, unknown>)[k] = v;
    map.set(u.date, cur);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function toCsv(rows: DailyRow[]) {
  return [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => r[c] ?? '').join(','))].join('\n') + '\n';
}

function withOpportunity<T extends { position: number; impressions: number }>(rows: T[]) {
  // Queries ranking 8–20 with real impressions are the best rewrite / internal-link targets.
  return rows.map((r) => ({ ...r, opportunity: r.position >= 8 && r.position <= 20 && r.impressions >= 20 }));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (SAMPLE) {
    const { sampleData } = await import('./sample');
    const s = sampleData();
    writeJson('daily.json', { updated: new Date().toISOString(), sample: true, rows: s.daily });
    fs.writeFileSync(path.join(OUT, 'daily.csv'), toCsv(s.daily));
    writeJson('queries.json', withOpportunity(s.queries));
    writeJson('pages.json', s.pages);
    writeJson('countries.json', s.countries);
    writeJson('content.json', collectContent());
    console.log(`Sample data written to ${path.relative(ROOT, OUT)}/`);
    return;
  }

  const start = daysAgo(DAYS), end = daysAgo(1);
  const status: Record<string, string> = {};
  const safe = async <T>(name: string, fn: () => Promise<T | null>) => {
    try { const v = await fn(); status[name] = v ? 'ok' : 'skipped (no credentials)'; return v; }
    catch (e) { status[name] = `error: ${String(e).slice(0, 200)}`; return null; }
  };
  const [gsc, ga, ads] = await Promise.all([safe('search_console', () => collectGsc(start, end)), safe('ga4', () => collectGa(start, end)), safe('adsense', () => collectAdsense(start, end))]);

  const prev = readJson<{ rows: DailyRow[]; sample?: boolean }>('daily.json', { rows: [] });
  // never mix sample rows into real data
  const rows = mergeDaily(prev.sample ? [] : prev.rows, gsc?.daily ?? [], ga?.daily ?? [], ads ?? []);
  writeJson('daily.json', { updated: new Date().toISOString(), sources: status, rows });
  fs.writeFileSync(path.join(OUT, 'daily.csv'), toCsv(rows));

  if (gsc) {
    writeJson('queries.json', withOpportunity(gsc.queries));
    // join GA sessions onto GSC pages by path
    const gaPages = new Map((ga?.pages ?? []).map((p) => [p.page, p.sessions]));
    writeJson('pages.json', gsc.pages.map((p) => ({ ...p, sessions: gaPages.get(new URL(String(p.page)).pathname) ?? null })));
  }
  if (gsc || ga) {
    const gaC = new Map((ga?.countries ?? []).map((c) => [c.country, c.sessions]));
    const list = ga?.countries?.length
      ? ga.countries.map((c) => ({ country: c.country, sessions: c.sessions }))
      : (gsc?.countries ?? []).map((c) => ({ country: String(c.country).toUpperCase(), sessions: c.clicks }));
    writeJson('countries.json', list.map((c) => ({ ...c, sessions: gaC.get(c.country) ?? c.sessions })));
  }
  writeJson('content.json', collectContent());
  console.log('Sources:', status);
  console.log(`${rows.length} daily rows in ${path.relative(ROOT, OUT)}/daily.json`);
  if (Object.values(status).some((s) => s.startsWith('error'))) process.exitCode = 1;
}

await main();
