import { describe, expect, it } from 'vitest';
import { cardEligibility, cardPayoff, flatToEir, homeUpfrontCosts, loanSummary, monthlyInstalment, motStampDuty } from '../src/engine/finance';

describe('loans', () => {
  it('matches BNM consumer-guide example: RM100k, 9 years, 3% flat ≈ 5.5% EIR, RM27,000 interest', () => {
    expect(flatToEir(3, 9)).toBeCloseTo(5.5, 0);
    const s = loanSummary(100_000, flatToEir(3, 9), 108);
    expect(Math.abs(s.totalInterest - 27_000)).toBeLessThan(150);
    expect(s.flatEquivalentPct).toBeCloseTo(3, 1);
  });

  it('standard amortisation', () => {
    // RM405,000 at 4% over 35 years
    expect(monthlyInstalment(405_000, 4, 420)).toBeCloseTo(1793.21, 1);
    expect(monthlyInstalment(12_000, 0, 12)).toBe(1000);
    const s = loanSummary(54_000, 5.5, 84);
    expect(s.yearlyBalance.at(-1)).toBe(0);
    expect(s.yearly.length).toBe(7);
    expect(s.yearly[0].interest).toBeGreaterThan(s.yearly[6].interest);
  });

  it('MOT stamp duty tiers', () => {
    expect(motStampDuty(300_000)).toBe(5_000);
    expect(motStampDuty(500_000)).toBe(9_000);
    expect(motStampDuty(750_000)).toBe(16_500);
    expect(motStampDuty(1_000_000)).toBe(24_000);
  });

  it('first-home exemption up to RM500,000 only', () => {
    expect(homeUpfrontCosts(450_000, 10, true)).toMatchObject({ exempt: true, motDuty: 0, loanDuty: 0, upfront: 45_000 });
    const c = homeUpfrontCosts(450_000, 10, false);
    expect(c.motDuty).toBe(8_000);
    expect(c.loanDuty).toBe(2_025);
    expect(homeUpfrontCosts(600_000, 10, true).exempt).toBe(false);
  });
});

describe('credit cards', () => {
  it('minimum payments take far longer and cost more than a fixed payment', () => {
    const min = cardPayoff(3000, 18, { kind: 'minimum' });
    const fixed = cardPayoff(3000, 18, { kind: 'fixed', amount: 300 });
    expect(min.months).toBeGreaterThan(fixed.months * 3);
    expect(min.totalInterest).toBeGreaterThan(fixed.totalInterest * 3);
    expect(fixed.months).toBe(11);
  });
  it('flags payments that never clear the balance', () => {
    expect(cardPayoff(10_000, 18, { kind: 'fixed', amount: 100 }).neverEnds).toBe(true);
  });
  it('BNM eligibility tiers', () => {
    expect(cardEligibility(1900).eligible).toBe(false);
    expect(cardEligibility(2800)).toMatchObject({ eligible: true, capped: true, maxIssuers: 2, maxLimitPerIssuer: 5600 });
    expect(cardEligibility(3000).capped).toBe(true);   // RM36,000 exactly
    expect(cardEligibility(3001).capped).toBe(false);
  });
});

import { matchCards } from '../src/engine/cardMatch';
import { loadCards } from '../src/lib/cards';

describe('card finder', () => {
  const { cards } = loadCards();
  it('only shows cards you are eligible for, best match first', () => {
    const r = matchCards(cards, { monthlyIncome: 2200, spend: ['petrol'], noFee: true, islamic: false, paysInFull: true });
    expect(r.every((m) => m.card.min_income <= 2200 * 12)).toBe(true);
    expect(r.some((m) => m.card.id === 'maybank-2-gold')).toBe(false); // needs RM30,000
    expect(r[0].card.tags).toContain('petrol');
  });
  it('islamic filter returns only card-i', () => {
    const r = matchCards(cards, { monthlyIncome: 5000, spend: [], noFee: false, islamic: true, paysInFull: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => m.card.islamic)).toBe(true);
  });
  it('every card has EN and BM perks and a https link', () => {
    for (const c of cards) { expect(c.perks.en.length).toBe(c.perks.ms.length); expect(c.url.startsWith('https://')).toBe(true); }
  });
});
