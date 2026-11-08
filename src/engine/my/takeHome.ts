import type { MyRules, TakeHomeInput, TakeHomeResult } from './types';
import { epfContribution } from './epf';
import { perkesoContributions } from './perkeso';
import { estimateAnnualTax } from './tax';
import { round2 } from './money';

export function calculateTakeHome(raw: TakeHomeInput, rules: MyRules): TakeHomeResult {
  const input = {
    monthlySalary: Math.max(0, raw.monthlySalary || 0),
    age: raw.age ?? 30,
    residency: raw.residency ?? 'citizen',
    taxResident: raw.taxResident ?? true,
    skbbk: raw.skbbk ?? true,
    asOf: raw.asOf ?? new Date().toISOString().slice(0, 10),
    spouseRelief: raw.spouseRelief ?? false,
    children: Math.max(0, Math.floor(raw.children ?? 0)),
    otherReliefsAnnual: Math.max(0, raw.otherReliefsAnnual ?? 0),
  } as const;
  const gross = input.monthlySalary;
  const notes: string[] = [];

  const epf = epfContribution(gross, input.age, input.residency, rules.epf);
  const pk = perkesoContributions(gross, input, rules.perkeso);

  const tax = estimateAnnualTax(
    {
      annualGross: gross * 12,
      annualEpfEmployee: epf.employee * 12,
      annualSocsoEis: (pk.socsoEmployee + pk.eisEmployee) * 12,
      taxResident: input.taxResident,
      spouseRelief: input.spouseRelief,
      children: input.children,
      otherReliefsAnnual: input.otherReliefsAnnual,
    },
    rules.tax,
  );

  const employeeTotal = round2(epf.employee + pk.socsoEmployee + pk.eisEmployee + pk.skbbk + tax.monthlyEstimate);
  const employerTotal = round2(epf.employer + pk.socsoEmployer + pk.eisEmployer);
  const net = round2(gross - employeeTotal);

  if (gross > 0 && gross < 1000) notes.push('PERKESO amounts below RM1,000 are approximate.');
  if (gross > rules.perkeso.wage_ceiling) notes.push(`SOCSO, EIS and SKBBK are capped at the RM${rules.perkeso.wage_ceiling.toLocaleString()} wage ceiling.`);
  notes.push('Income tax is an annual estimate divided by 12, not the official PCB/MTD computation.');

  return {
    input,
    gross,
    employee: { epf: epf.employee, socso: pk.socsoEmployee, eis: pk.eisEmployee, skbbk: pk.skbbk, tax: tax.monthlyEstimate, total: employeeTotal },
    employer: { epf: epf.employer, socso: pk.socsoEmployer, eis: pk.eisEmployer, total: employerTotal },
    net,
    annualNet: round2(net * 12),
    totalEmploymentCost: round2(gross + employerTotal),
    tax,
    notes,
  };
}
