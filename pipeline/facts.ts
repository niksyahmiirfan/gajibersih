// FACTS = the only numbers a draft may use. Built by running the calculator, never by the LLM.
import { loadMyRules } from '../src/lib/rules';
import { calculateTakeHome } from '../src/engine/my/takeHome';
import type { TakeHomeResult } from '../src/engine/my/types';

export interface Facts {
  year: number;
  last_verified: string;
  asOf: string;
  sources: Record<string, string>;
  rates: Record<string, number>;
  scenarios: { label: string; input: Record<string, unknown>; result: Omit<TakeHomeResult, 'input' | 'notes'> }[];
}

const strip = ({ input: _i, notes: _n, ...rest }: TakeHomeResult) => rest;

export function buildFacts(target: { type: 'salary'; salary: number } | { type: 'guide' }, asOf = new Date().toISOString().slice(0, 10)): Facts {
  const rules = loadMyRules();
  const u60 = rules.epf.categories.citizen_under_60;
  const rates = {
    epf_employee_pct: u60.employee,
    epf_employer_pct_low: u60.employer[0].rate,
    epf_employer_pct_high: u60.employer[1].rate,
    epf_employer_threshold: u60.employer[0].wage_up_to ?? 0,
    socso_employee_pct: rules.perkeso.socso.first_category.employee,
    socso_employer_pct: rules.perkeso.socso.first_category.employer,
    eis_pct: rules.perkeso.eis.employee,
    skbbk_pct: rules.perkeso.skbbk.employee,
    perkeso_wage_ceiling: rules.perkeso.wage_ceiling,
    relief_self: rules.tax.reliefs.self,
    relief_epf_max: rules.tax.reliefs.epf_max,
    relief_socso_eis_max: rules.tax.reliefs.socso_eis_max,
    relief_spouse: rules.tax.reliefs.spouse_no_income,
    relief_child: rules.tax.reliefs.child_under_18,
    rebate: rules.tax.rebates.self,
    rebate_threshold: rules.tax.rebates.chargeable_income_threshold,
    ...Object.fromEntries(rules.tax.resident_brackets.map((b, i) => [`bracket_${i}_upto`, b.up_to ?? 0])),
    ...Object.fromEntries(rules.tax.resident_brackets.map((b, i) => [`bracket_${i}_rate`, b.rate])),
  };

  const salaries = target.type === 'salary' ? [target.salary] : [3000, 5000, 8000];
  const scenarios: Facts['scenarios'] = [];
  for (const s of salaries) {
    const variants: [string, Record<string, unknown>][] = [
      [`RM${s} single citizen`, { monthlySalary: s }],
      [`RM${s} married, spouse not working, 2 children`, { monthlySalary: s, spouseRelief: true, children: 2 }],
      [`RM${s} opted out of SKBBK`, { monthlySalary: s, skbbk: false }],
    ];
    for (const [label, input] of variants) scenarios.push({ label, input, result: strip(calculateTakeHome({ ...input, asOf } as never, rules)) });
  }
  return { year: rules.meta.year, last_verified: rules.meta.last_verified, asOf, sources: rules.meta.sources, rates, scenarios };
}

/** Every number present in the facts (for the verifier). */
export function allowedNumbers(f: Facts): Set<number> {
  const out = new Set<number>();
  const walk = (v: unknown) => {
    if (typeof v === 'number') out.add(Math.round(v * 100) / 100);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(f.rates);
  walk(f.scenarios);
  // Derived values a writer may legitimately state
  for (const sc of f.scenarios) {
    const r = sc.result;
    out.add(Math.round((r.gross - r.net) * 100) / 100);                     // total deductions
    out.add(Math.round((r.net / (r.gross || 1)) * 1000) / 10);              // % kept
    out.add(Math.round(r.employee.epf + r.employer.epf));                    // total EPF
    out.add(Math.round((r.employee.epf + r.employer.epf) * 12));            // yearly EPF
    out.add(Math.round(r.gross * 12));
  }
  out.add(f.year); out.add(f.year - 1); out.add(f.year + 1);
  out.add(rateSum(f.rates.epf_employee_pct, f.rates.epf_employer_pct_low));
  out.add(rateSum(f.rates.epf_employee_pct, f.rates.epf_employer_pct_high));
  return out;
}
const rateSum = (a: number, b: number) => Math.round((a + b) * 100) / 100;
