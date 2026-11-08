// Shapes mirror data/my/<year>/*.yaml. The engine is pure (no fs) so it runs in the browser.

export interface RateStep { wage_up_to: number | null; rate: number }

export interface EpfCategory {
  employee: number;
  employer: RateStep[];
  banded?: boolean;
}

export interface EpfRules {
  source: string;
  banding: {
    min_wage_for_contribution: number;
    bands: { up_to: number; width: number }[];
    above_last_band: 'percentage';
  };
  categories: Record<EpfCategoryKey, EpfCategory>;
}

export type EpfCategoryKey = 'citizen_under_60' | 'citizen_60_plus' | 'pr_60_plus' | 'foreign_worker';

export interface PerkesoRules {
  source: string;
  wage_ceiling: number;
  band_width: number;
  low_band_edges: number[];
  round_to_sen: number;
  socso: {
    first_category: { employee: number; employer: number };
    second_category: { employee: number; employer: number };
  };
  eis: { employee: number; employer: number; min_age: number; max_age: number; excludes_foreign_workers: boolean };
  skbbk: { effective_from: string; employee: number; employer: number; future_rates: { from: string; employee: number }[] };
}

export interface TaxRules {
  source: string;
  resident_brackets: { up_to: number | null; rate: number }[];
  non_resident_rate: number;
  reliefs: { self: number; epf_max: number; socso_eis_max: number; spouse_no_income: number; child_under_18: number };
  rebates: { chargeable_income_threshold: number; self: number; spouse: number };
  pcb: { minimum_deduction: number };
}

export interface MetaRules {
  country: string;
  year: number;
  currency: string;
  last_verified: string;
  sources: Record<string, string>;
}

export interface MyRules {
  meta: MetaRules;
  epf: EpfRules;
  perkeso: PerkesoRules;
  tax: TaxRules;
}

export type Residency = 'citizen' | 'pr' | 'foreign';

export interface TakeHomeInput {
  monthlySalary: number;
  age?: number;                 // default 30
  residency?: Residency;        // default citizen
  taxResident?: boolean;        // default true
  skbbk?: boolean;              // default true (auto-enrolled)
  asOf?: string;                // ISO date, for date-dependent rules (SKBBK). Default: today
  spouseRelief?: boolean;       // spouse with no income
  children?: number;            // children under 18
  otherReliefsAnnual?: number;  // any other reliefs the user claims (RM / year)
}

export interface TaxBreakdown {
  annualGross: number;
  reliefs: { label: string; amount: number }[];
  totalReliefs: number;
  chargeableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  annualTax: number;
  monthlyEstimate: number;
  marginalRate: number;
  effectiveRate: number;
}

export interface TakeHomeResult {
  input: Required<Omit<TakeHomeInput, 'asOf'>> & { asOf: string };
  gross: number;
  employee: { epf: number; socso: number; eis: number; skbbk: number; tax: number; total: number };
  employer: { epf: number; socso: number; eis: number; total: number };
  net: number;
  annualNet: number;
  totalEmploymentCost: number;
  tax: TaxBreakdown;
  notes: string[];
}
