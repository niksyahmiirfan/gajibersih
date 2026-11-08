import { describe, expect, it } from 'vitest';
import { loadFixtures, loadMyRules } from '../src/lib/rules';
import {
  calculateTakeHome, epfBandWage, epfContribution, perkesoContributions, taxOnChargeable, estimateAnnualTax,
} from '../src/engine/my';

const rules = loadMyRules(2026);
const fx = loadFixtures(2026);
const AFTER_SKBBK = '2026-11-01';

describe('EPF Third Schedule', () => {
  it.each(fx.epf)('matches official row for RM$wage', ({ wage, employee, employer }) => {
    const r = epfContribution(wage, 30, 'citizen', rules.epf);
    expect(r.employee).toBe(employee);
    expect(r.employer).toBe(employer);
  });

  it('uses band upper limits', () => {
    expect(epfBandWage(4990, rules.epf)).toBe(5000);
    expect(epfBandWage(5000.01, rules.epf)).toBe(5100);
    expect(epfBandWage(3001, rules.epf)).toBe(3020);
    expect(epfBandWage(25000, rules.epf)).toBeNull();
  });

  it('switches employer rate above RM5,000 and rounds up to ringgit', () => {
    expect(epfContribution(3000, 30, 'citizen', rules.epf)).toMatchObject({ employee: 330, employer: 390 });
    expect(epfContribution(5050, 30, 'citizen', rules.epf)).toMatchObject({ employee: 561, employer: 612 });
    // > RM20,000: straight percentage on actual wage, cents rounded up
    expect(epfContribution(25000.5, 30, 'citizen', rules.epf)).toMatchObject({ employee: 2751, employer: 3001 });
  });

  it('applies age 60+ and foreign worker categories', () => {
    expect(epfContribution(4000, 61, 'citizen', rules.epf)).toMatchObject({ employee: 0, employer: 160 });
    expect(epfContribution(4000, 30, 'foreign', rules.epf)).toMatchObject({ employee: 80, employer: 80 });
    expect(epfContribution(10, 30, 'citizen', rules.epf)).toMatchObject({ employee: 0, employer: 0 });
  });
});

describe('PERKESO (SOCSO, EIS, SKBBK)', () => {
  it.each(fx.perkeso)('matches official row for RM$wage', (row) => {
    const r = perkesoContributions(row.wage, { age: 30, residency: 'citizen', skbbk: true, asOf: AFTER_SKBBK }, rules.perkeso);
    expect(r.socsoEmployee).toBe(row.socso_employee);
    expect(r.socsoEmployer).toBe(row.socso_employer);
    expect(r.eisEmployee).toBe(row.eis);
    expect(r.eisEmployer).toBe(row.eis);
    expect(r.skbbk).toBe(row.skbbk);
  });

  it('SKBBK only applies from 1 June 2026 and can be opted out (locals)', () => {
    const base = { age: 30, residency: 'citizen' as const };
    expect(perkesoContributions(3000, { ...base, skbbk: true, asOf: '2026-05-31' }, rules.perkeso).skbbk).toBe(0);
    expect(perkesoContributions(3000, { ...base, skbbk: false, asOf: AFTER_SKBBK }, rules.perkeso).skbbk).toBe(0);
    // foreign workers: mandatory even if toggled off
    expect(perkesoContributions(3000, { age: 30, residency: 'foreign', skbbk: false, asOf: AFTER_SKBBK }, rules.perkeso).skbbk).toBe(22.15);
  });

  it('excludes EIS for 60+ and foreign workers; SOCSO second category at 60+', () => {
    const old = perkesoContributions(3000, { age: 60, residency: 'citizen', skbbk: false, asOf: AFTER_SKBBK }, rules.perkeso);
    expect(old).toMatchObject({ eisEmployee: 0, socsoEmployee: 0, socsoEmployer: 36.9 }); // 1.25% x 2,950 = 36.875 → 36.90
    const fw = perkesoContributions(3000, { age: 30, residency: 'foreign', skbbk: false, asOf: AFTER_SKBBK }, rules.perkeso);
    expect(fw.eisEmployee).toBe(0);
  });
});

describe('Income tax estimate', () => {
  it.each(fx.tax)('tax on chargeable RM$chargeable', ({ chargeable, tax }) => {
    expect(taxOnChargeable(chargeable, rules.tax).tax).toBe(tax);
  });

  it('applies the RM400 rebate at or below RM35,000 chargeable income', () => {
    const t = estimateAnnualTax(
      { annualGross: 48350, annualEpfEmployee: 4000, annualSocsoEis: 350, taxResident: true, spouseRelief: false, children: 0, otherReliefsAnnual: 0 },
      rules.tax,
    );
    expect(t.chargeableIncome).toBe(35000);
    expect(t.taxBeforeRebate).toBe(600);
    expect(t.annualTax).toBe(200);
  });

  it('non-residents pay a flat 30% with no reliefs', () => {
    const t = estimateAnnualTax(
      { annualGross: 60000, annualEpfEmployee: 0, annualSocsoEis: 0, taxResident: false, spouseRelief: false, children: 0, otherReliefsAnnual: 0 },
      rules.tax,
    );
    expect(t.annualTax).toBe(18000);
  });
});

describe('Take-home pay', () => {
  it('RM5,000 citizen, single, Nov 2026', () => {
    const r = calculateTakeHome({ monthlySalary: 5000, asOf: AFTER_SKBBK }, rules);
    expect(r.employee).toMatchObject({ epf: 550, socso: 24.75, eis: 9.9, skbbk: 37.15 });
    // annual 60,000 − reliefs (9,000 + 4,000 + 350) = 46,650 chargeable → 600 + 6% × 11,650 = 1,299
    expect(r.tax.chargeableIncome).toBe(46650);
    expect(r.tax.annualTax).toBe(1299);
    expect(r.employee.tax).toBe(108.25);
    expect(r.net).toBe(round(5000 - 550 - 24.75 - 9.9 - 37.15 - 108.25));
    expect(r.employer).toMatchObject({ epf: 650, socso: 86.65, eis: 9.9 });
  });

  it('net never exceeds gross and handles zero', () => {
    for (const s of [0, 1700, 2500, 4000, 7500, 15000, 30000]) {
      const r = calculateTakeHome({ monthlySalary: s, asOf: AFTER_SKBBK }, rules);
      expect(r.net).toBeLessThanOrEqual(s);
      expect(r.net).toBeGreaterThanOrEqual(0);
    }
  });
});

function round(n: number) { return Math.round(n * 100) / 100; }
