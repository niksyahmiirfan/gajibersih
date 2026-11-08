import type { TaxBreakdown, TaxRules } from './types';
import { round2 } from './money';

export function taxOnChargeable(chargeable: number, rules: TaxRules): { tax: number; marginalRate: number } {
  let tax = 0;
  let lower = 0;
  let marginalRate = 0;
  for (const b of rules.resident_brackets) {
    const upper = b.up_to ?? Infinity;
    if (chargeable > lower) {
      tax += ((Math.min(chargeable, upper) - lower) * b.rate) / 100;
      marginalRate = b.rate;
    }
    if (chargeable <= upper) break;
    lower = upper;
  }
  return { tax: round2(tax), marginalRate };
}

export interface TaxInput {
  annualGross: number;
  annualEpfEmployee: number;
  annualSocsoEis: number;
  taxResident: boolean;
  spouseRelief: boolean;
  children: number;
  otherReliefsAnnual: number;
}

export function estimateAnnualTax(i: TaxInput, rules: TaxRules): TaxBreakdown {
  if (!i.taxResident) {
    const annualTax = round2((i.annualGross * rules.non_resident_rate) / 100);
    return {
      annualGross: i.annualGross, reliefs: [], totalReliefs: 0, chargeableIncome: i.annualGross,
      taxBeforeRebate: annualTax, rebate: 0, annualTax, monthlyEstimate: round2(annualTax / 12),
      marginalRate: rules.non_resident_rate, effectiveRate: i.annualGross ? rules.non_resident_rate : 0,
    };
  }
  const r = rules.reliefs;
  const reliefs = [
    { label: 'Individual', amount: r.self },
    { label: 'EPF contributions', amount: Math.min(i.annualEpfEmployee, r.epf_max) },
    { label: 'SOCSO & EIS', amount: Math.min(i.annualSocsoEis, r.socso_eis_max) },
  ];
  if (i.spouseRelief) reliefs.push({ label: 'Spouse (no income)', amount: r.spouse_no_income });
  if (i.children > 0) reliefs.push({ label: `Children under 18 (${i.children})`, amount: i.children * r.child_under_18 });
  if (i.otherReliefsAnnual > 0) reliefs.push({ label: 'Other reliefs', amount: i.otherReliefsAnnual });

  const totalReliefs = round2(reliefs.reduce((s, x) => s + x.amount, 0));
  const chargeableIncome = Math.max(0, round2(i.annualGross - totalReliefs));
  const { tax: taxBeforeRebate, marginalRate } = taxOnChargeable(chargeableIncome, rules);

  let rebate = 0;
  if (chargeableIncome <= rules.rebates.chargeable_income_threshold) {
    rebate = rules.rebates.self + (i.spouseRelief ? rules.rebates.spouse : 0);
  }
  const annualTax = Math.max(0, round2(taxBeforeRebate - rebate));
  let monthlyEstimate = round2(annualTax / 12);
  if (monthlyEstimate < rules.pcb.minimum_deduction) monthlyEstimate = 0;

  return {
    annualGross: i.annualGross, reliefs, totalReliefs, chargeableIncome, taxBeforeRebate,
    rebate: Math.min(rebate, taxBeforeRebate), annualTax, monthlyEstimate, marginalRate,
    effectiveRate: i.annualGross ? round2((annualTax / i.annualGross) * 100) : 0,
  };
}
