import type { EpfCategoryKey, EpfRules, Residency } from './types';
import { pctCeilRinggitFromSen, round2, toSen } from './money';

export function epfCategory(age: number, residency: Residency): EpfCategoryKey {
  if (residency === 'foreign') return 'foreign_worker';
  if (age >= 60) return residency === 'pr' ? 'pr_60_plus' : 'citizen_60_plus';
  return 'citizen_under_60'; // citizens and PRs under 60 share a category
}

/** Wage the schedule applies the rate to (band upper limit), or null above the last band. */
export function epfBandWage(wage: number, rules: EpfRules): number | null {
  let lower = 0;
  for (const band of rules.banding.bands) {
    if (wage <= band.up_to) {
      return lower + Math.ceil((wage - lower) / band.width) * band.width;
    }
    lower = band.up_to;
  }
  return null;
}

export function epfContribution(wage: number, age: number, residency: Residency, rules: EpfRules) {
  const key = epfCategory(age, residency);
  const cat = rules.categories[key];
  if (wage <= rules.banding.min_wage_for_contribution) return { category: key, employee: 0, employer: 0 };

  const employerRate = cat.employer.find((s) => s.wage_up_to === null || wage <= s.wage_up_to)!.rate;

  if (cat.banded === false) {
    // calculated directly on actual wages
    return {
      category: key,
      employee: round2((wage * cat.employee) / 100),
      employer: round2((wage * employerRate) / 100),
    };
  }

  const band = epfBandWage(wage, rules);
  const baseSen = band === null ? toSen(wage) : band * 100;
  return {
    category: key,
    employee: pctCeilRinggitFromSen(baseSen, cat.employee),
    employer: pctCeilRinggitFromSen(baseSen, employerRate),
  };
}
