// Plausible fake data (a new site growing over ~4 months) so the dashboard can be tried before real data exists.
import type { DailyRow } from './collect';

function rng(seed: number) { return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296); }

export function sampleData() {
  const rand = rng(42);
  const daily: DailyRow[] = [];
  const N = 120;
  for (let i = N; i >= 1; i--) {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - i);
    const t = (N - i) / N;
    const weekday = [0.7, 1.05, 1.1, 1.1, 1.05, 1, 0.75][d.getUTCDay()];
    const payday = d.getUTCDate() >= 25 ? 1.25 : 1;
    const growth = 5 + 420 * Math.pow(t, 2.2);
    const impressions = Math.round(growth * 22 * weekday * (0.85 + rand() * 0.3));
    const ctr = 0.025 + 0.02 * t + rand() * 0.006;
    const clicks = Math.round(impressions * ctr * payday);
    const sessions = Math.round(clicks * 1.18 + 3 + rand() * 4);
    const pageviews = Math.round(sessions * (1.5 + rand() * 0.3));
    const rpm = 1.1 + t * 0.9 + rand() * 0.6;
    const adPv = Math.round(pageviews * 0.92);
    daily.push({
      date: d.toISOString().slice(0, 10),
      gsc_clicks: clicks, gsc_impressions: impressions, gsc_ctr: Math.round(ctr * 10000) / 10000,
      gsc_position: Math.round((38 - 24 * t + rand() * 3) * 100) / 100,
      ga_sessions: sessions, ga_users: Math.round(sessions * 0.86), ga_pageviews: pageviews,
      ga_engagement_rate: Math.round((0.58 + rand() * 0.1) * 10000) / 10000,
      ga_home_country_sessions: Math.round(sessions * (0.9 - 0.12 * t)),
      calculations: Math.round(sessions * (1.3 + rand() * 0.4)),
      ...(i <= 75 ? { ad_earnings: Math.round((adPv / 1000) * rpm * 100) / 100, ad_pageviews: adPv, ad_rpm: Math.round(rpm * 100) / 100,
        ad_impressions: Math.round(adPv * 2.1), ad_clicks: Math.round(adPv * 0.006) } : {}),
    });
  }
  const queries = [
    ['gaji bersih calculator', 1840, 9200, 6.4], ['rm5000 salary after epf', 610, 7100, 9.8], ['take home pay malaysia', 420, 12800, 14.2],
    ['epf socso eis calculator', 380, 5200, 8.9], ['rm3000 salary after deduction', 350, 3100, 7.1], ['kalkulator gaji bersih', 290, 4300, 11.5],
    ['pcb calculator 2026', 120, 15400, 18.7], ['skbbk deduction', 210, 2600, 5.2], ['rm8000 salary take home', 95, 2100, 12.9],
    ['net salary malaysia', 60, 6900, 24.1], ['income tax malaysia 2026 calculator', 40, 11200, 27.3], ['socso contribution table 2026', 75, 3900, 16.4],
  ].map(([query, clicks, impressions, position]) => ({ query: query as string, clicks: clicks as number, impressions: impressions as number,
    ctr: Math.round(((clicks as number) / (impressions as number)) * 10000) / 10000, position: position as number }));
  const pages = [
    ['/', 2100, 21000, 7.9, 2300], ['/take-home-pay-calculator/', 1500, 18800, 9.1, 1700], ['/salary/rm-5000-salary-after-epf-and-tax/', 640, 7300, 9.4, 690],
    ['/salary/rm-3000-salary-after-epf-and-tax/', 360, 3300, 7.3, 380], ['/ms/kalkulator-gaji-bersih/', 300, 4400, 11.2, 330],
    ['/salary/rm-8000-salary-after-epf-and-tax/', 98, 2200, 12.6, 110], ['/methodology/', 20, 900, 19.5, 40],
  ].map(([page, clicks, impressions, position, sessions]) => ({ page: page as string, clicks: clicks as number, impressions: impressions as number,
    ctr: Math.round(((clicks as number) / (impressions as number)) * 10000) / 10000, position: position as number, sessions: sessions as number }));
  const countries = [['Malaysia', 4210], ['Singapore', 260], ['Indonesia', 140], ['United States', 90], ['United Kingdom', 70], ['Australia', 55], ['India', 48], ['Philippines', 30]]
    .map(([country, sessions]) => ({ country: country as string, sessions: sessions as number }));
  return { daily, queries, pages, countries };
}
