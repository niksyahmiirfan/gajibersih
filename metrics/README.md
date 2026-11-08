# Metrics collector & dashboard

```bash
npm run metrics:sample     # fake data, to try the dashboard
npm run metrics:collect    # real data (needs the env vars below); add -- --days 480 to backfill
npm run dashboard          # http://localhost:4321 — local only, never deployed
```

## What is tracked

| File | Contents | Use it for |
|---|---|---|
| `daily.json` / `daily.csv` | One row per day: GSC clicks, impressions, CTR, position · GA4 sessions, users, pageviews, engagement, Malaysia sessions, `calculate` events · AdSense earnings, page views, RPM, impressions, clicks | Trends, growth, revenue per visitor. Load the CSV into Sheets/pandas for deeper analysis |
| `queries.json` | Top 500 queries (28 days) with an `opportunity` flag (position 8–20, ≥20 impressions) | What to write or rewrite next — feed into `pipeline/keywords.yaml` |
| `pages.json` | Top pages (28 days): GSC + GA4 sessions | Which pages earn traffic; which to refresh |
| `countries.json` | Sessions by country (28 days) | Progress toward the global-traffic goal |
| `content.json` | Pages, articles, keyword queue, data freshness, watcher status | Making sure rates never go stale |

Each source is optional: missing credentials are reported in the dashboard banner rather than failing the run.

## One-time setup (≈20 min)

1. **Google Cloud project** → enable *Search Console API*, *Google Analytics Data API*, *AdSense Management API*.
2. **Service account** → create a JSON key. Add the service account email:
   - as a *Restricted* user in Search Console (Settings → Users and permissions),
   - as a *Viewer* in GA4 (Admin → Property access management).
   Set `GOOGLE_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL` (e.g. `sc-domain:example.com`) and `GA4_PROPERTY_ID`.
3. **AdSense** does not accept service accounts. Create an OAuth client (Desktop app), get a refresh token for the
   `https://www.googleapis.com/auth/adsense.readonly` scope (e.g. via the OAuth Playground with your own client), then set
   `ADSENSE_CLIENT_ID`, `ADSENSE_CLIENT_SECRET`, `ADSENSE_REFRESH_TOKEN`, `ADSENSE_ACCOUNT` (`accounts/pub-…`).
4. **GA4 calculator events**: the site fires a `calculate` event (debounced) with `tool`, `salary_band`, `locale`. Mark it as a key event in GA4 if you want it in reports.

## Keeping it private

The site repo is public (free unlimited Actions minutes) but AdSense report data is confidential under the AdSense terms. The
`metrics.yml` workflow therefore writes to a separate **private** repo: create e.g. `gajibersih-metrics`, set repo variable
`METRICS_REPO=you/gajibersih-metrics` and secret `METRICS_REPO_TOKEN` (fine-grained PAT, contents: read & write on that repo only).
Locally, clone it and run `METRICS_OUT_DIR=../gajibersih-metrics/data npm run dashboard`.
