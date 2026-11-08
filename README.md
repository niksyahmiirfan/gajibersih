# GajiBersih — Malaysia take-home pay calculator

A static Next.js site (EPF, SOCSO, EIS, SKBBK and an income tax estimate) with a semi-automated, human-approved content pipeline and a private metrics dashboard. It is the first site in the utility-sites plan and the template for the multi-country engine.

> Rename `GajiBersih` in `src/lib/site.ts` and `package.json` once you pick a domain.

## Quick start

```bash
npm install
npm test            # engine unit tests against official table rows
npm run dev         # http://localhost:3000
npm run build       # static export → ./out
```

## How it fits together

```
data/my/2026/*.yaml      Official rates (single source of truth, with sources + test fixtures)
        │
src/engine/my/*          Pure TypeScript calculator (runs in browser + build + pipeline)
        │
        ├── app/…        Pages: tool (EN + BM), 17 salary cluster pages, methodology, privacy
        ├── pipeline/…   brief → draft → verify → PR   (numbers come from the engine, prose from the LLM)
        └── metrics/…    Search Console + GA4 + AdSense → daily JSON/CSV → local dashboard
```

| Path | What it is |
|---|---|
| `data/my/2026/` | `epf.yaml`, `perkeso.yaml`, `tax.yaml`, `meta.yaml`. Every value cites an official source. `fixtures:` rows are published table values used in tests |
| `src/engine/my/` | `epf.ts` (Third Schedule bands), `perkeso.ts` (SOCSO/EIS/SKBBK bands), `tax.ts`, `takeHome.ts`. Integer-sen maths, no float drift |
| `tests/engine.test.ts` | Matches official rows: EPF RM5,000 → 550/650; SOCSO RM3,000 → 14.75/51.65; EIS 5.90; SKBBK 22.15; ceiling rows; tax brackets |
| `app/salary/[slug]` | Programmatic cluster pages (`/salary/rm-5000-salary-after-epf-and-tax/`) with FAQ schema; prose is added from `content/en/salary/<amount>.md` once drafted |
| `pipeline/` | Content agents + provider adapter (see below) |
| `scripts/refresh-check.ts` | Rate-page watcher (fingerprints official pages listed in `data/watch.yaml`) |
| `metrics/`, `dashboard/` | Metrics collector and dashboard — see `metrics/README.md` |

## Sharings (blog)

Posts live in `content/en/sharings/<slug>.md` and appear at `/sharings/` automatically (newest first, filterable by category).

```yaml
---
title: "Post title"
description: "One-line summary for the card and Google"
date: 2026-11-08
category: FAQ            # FAQ | Saving tips | Updates  (src/lib/content.ts)
data_year: 2026          # flags the post as stale when rates move to a new year
sources: [https://www.kwsp.gov.my/...]   # official sources; may be empty for general tips
allowed_numbers: [50, 30, 20]            # extra figures you checked by hand; everything else must match the calculator
draft: true              # optional: hide until ready
---
```

The verifier checks posts like any other content (numbers, structure, disclaimer, links). Automating them later only needs a new keyword `type` in the pipeline that writes to this folder.

## Personas, fun facts, theme

- **Personas** (`data/personas.yaml`): inputs only; every figure in the section is computed live by the engine. Colours for the bar are a colour-blind-checked palette.
- **Fun facts** (`data/my/<year>/fun-facts.yaml`): EN + BM, rotates daily in the browser (Malaysia date). Review yearly so facts match the rate files.
- **Theme**: light/dark toggle stored in the browser; defaults to the visitor's system setting.

## Credit card & loan guides

- **Pages:** `/credit-cards/` ↔ `/ms/kad-kredit/`, `/loans/` ↔ `/ms/pinjaman/` (car and home tabs, `#home` deep link). Text lives in `src/components/cards/CreditCardsGuide.tsx` and `src/components/loans/LoansGuide.tsx` (EN + BM side by side). Every figure in the stories is computed by `src/engine/finance.ts`.
- **Card data:** `data/credit-cards.yaml` is *starter data*. Re-check each card on the bank's site before launch, then monthly; bump `last_checked` (shown on the page). A future "card watcher" can reuse `scripts/refresh-check.ts` with the banks' card pages.
- **Rules encoded:** Bank Negara card eligibility (RM24,000 minimum; ≤RM36,000 → 2 issuers, 2× monthly income), tiered card interest 15/17/18%, minimum payment 5% or RM50, Hire-Purchase (Amendment) Act 2026 (EIR + reducing balance from 1 June 2026), MOT stamp duty tiers, and the first-home exemption up to RM500,000 until 31 Dec 2027. Tests: `tests/finance.test.ts` (includes Bank Negara's RM100k / 9-year / 3%-flat ≈ 5.5% EIR example).

## Languages & mobile

- EN/BM switch in the header maps each page to its pair (`src/lib/routes.ts`). Pages without a BM version go to the BM calculator (salary pages carry `?salary=`).
- Mobile: bottom tab bar under 860px, sticky header and take-home pill, 16px inputs (no iOS zoom), safe-area padding. Checked at 390px with no horizontal overflow.

## Content pipeline

1. Add keywords to `pipeline/keywords.yaml` as `proposed`; flip the good ones to `approved` (your keyword review).
2. `Content pipeline` workflow (weekly or manual) runs `pipeline/run.ts`: **brief agent** → **writer agent** (gets the `FACTS` JSON produced by running the calculator, plus official source URLs) → **verifier**.
3. Verifier (`pipeline/verify.ts`) — deterministic checks that block CI:
   - every `RM` amount and `%` in the article must exist in the calculator facts
   - official-domain sources only, ≥3 H2s, no H1, word count, disclaimer, FAQ count
   - broken internal links, near-duplicate detection (5-word shingles vs other articles)
   - data-year staleness
   - optional LLM claim check with a stronger model (`LLM_VERIFY_PROVIDER`) reported as warnings
4. A PR opens with the verification report as its body. You skim it (about 5 min) and merge. Nothing merges automatically.

Try it offline: `LLM_PROVIDER=mock VERIFY_MIN_WORDS=50 npm run content:run -- --limit 1`

### LLM providers (`pipeline/llm/index.ts`)

| `LLM_PROVIDER` | Secret | Default model (override with `LLM_MODEL`) |
|---|---|---|
| `gemini` | `GEMINI_API_KEY` | `gemini-2.5-flash` |
| `groq` | `GROQ_API_KEY` | `llama-3.3-70b-versatile` |
| `github` | built-in `GITHUB_TOKEN` (`models: read`) | `openai/gpt-4.1-mini` |
| `cloudflare` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `mock` | — | offline, for CI |

Free-tier limits and model names change: check the current ones and set `LLM_MODEL` accordingly. Retries with backoff on 429/5xx are built in.

## GitHub setup

**Variables:** `SITE_URL`, `GA_ID`, `ADSENSE_CLIENT`, `LLM_PROVIDER`, (`BASE_PATH` for GitHub Pages project URLs), metrics variables per `metrics/README.md`.
**Secrets:** your LLM key, metrics credentials.

| Workflow | When | Does |
|---|---|---|
| `ci.yml` | PRs, main | typecheck, tests, verify content, build, pipeline smoke test |
| `content.yml` | weekly / manual | drafts approved keywords → PR |
| `refresh.yml` | daily | official rate pages changed → GitHub issue |
| `metrics.yml` | daily | metrics snapshot → private metrics repo |
| Cloudflare Workers Builds | main + PRs | Hosting via `wrangler.jsonc` (static assets from `out/`). Build `npm run build`, deploy `npx wrangler deploy`; preview URL on every PR |

## Yearly update checklist

1. Copy `data/my/2026` → `data/my/2027`, apply gazetted changes (Budget 2027 proposes new YA2027 tax brackets and a higher individual relief).
2. Add new official table rows as `fixtures`, run `npm test`.
3. Bump `last_verified`, rebuild. The verifier will flag articles whose `data_year` is out of date.

## Known limitations (shown to users as estimates)

- Tax is annual estimate ÷ 12, not LHDN's PCB computerised method (bonuses, mid-year changes, and the RM10 minimum are simplified).
- PERKESO amounts below RM1,000 are approximate (irregular low bands; minimum wage is RM1,700).
- SKBBK defaults to enrolled. Locals who opted out by 31 Aug 2026 can untick it.
