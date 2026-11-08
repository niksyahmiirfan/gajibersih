import type { PerkesoRules, Residency } from './types';
import { pctCeilToSen } from './money';

/** Midpoint of the PERKESO band the wage falls into (capped at the ceiling band), in sen. */
export function perkesoBandMidpointSen(wage: number, rules: PerkesoRules): number {
  const w = Math.min(wage, rules.wage_ceiling);
  const edges = rules.low_band_edges;
  const lowTop = edges[edges.length - 1];
  if (w <= lowTop) {
    let lower = 0;
    for (const upper of edges) {
      if (w <= upper) return ((lower + upper) / 2) * 100;
      lower = upper;
    }
  }
  const upper = Math.ceil(w / rules.band_width) * rules.band_width;
  return (upper - rules.band_width / 2) * 100;
}

export function skbbkRate(rules: PerkesoRules, asOf: string): number {
  if (asOf < rules.skbbk.effective_from) return 0;
  let rate = rules.skbbk.employee;
  for (const step of rules.skbbk.future_rates) if (asOf >= step.from) rate = step.employee;
  return rate;
}

export function perkesoContributions(
  wage: number,
  opts: { age: number; residency: Residency; skbbk: boolean; asOf: string },
  rules: PerkesoRules,
) {
  if (wage <= 0) return { socsoEmployee: 0, socsoEmployer: 0, eisEmployee: 0, eisEmployer: 0, skbbk: 0 };
  const mid = perkesoBandMidpointSen(wage, rules);
  const step = rules.round_to_sen;
  const socsoCat = opts.age >= 60 ? rules.socso.second_category : rules.socso.first_category;

  const eisCovered =
    opts.age >= rules.eis.min_age &&
    opts.age < rules.eis.max_age &&
    !(rules.eis.excludes_foreign_workers && opts.residency === 'foreign');

  const skRate = opts.skbbk || opts.residency === 'foreign' ? skbbkRate(rules, opts.asOf) : 0;

  return {
    socsoEmployee: pctCeilToSen(mid, socsoCat.employee, step),
    socsoEmployer: pctCeilToSen(mid, socsoCat.employer, step),
    eisEmployee: eisCovered ? pctCeilToSen(mid, rules.eis.employee, step) : 0,
    eisEmployer: eisCovered ? pctCeilToSen(mid, rules.eis.employer, step) : 0,
    skbbk: skRate ? pctCeilToSen(mid, skRate, step) : 0,
  };
}
