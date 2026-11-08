// Loan and credit-card maths. Pure functions, used by the calculators and tests.

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Monthly instalment for a reducing-balance (amortised) loan. */
export function monthlyInstalment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return r2(principal / months);
  return r2((principal * r) / (1 - Math.pow(1 + r, -months)));
}

export interface LoanSummary {
  principal: number;
  months: number;
  monthly: number;
  totalPaid: number;
  totalInterest: number;
  /** Interest as a "flat rate" (interest ÷ principal ÷ years), how car loans used to be quoted before June 2026. */
  flatEquivalentPct: number;
  /** Yearly balance at the end of each year, for charts. */
  yearlyBalance: number[];
  /** Interest vs principal paid in each year. */
  yearly: { year: number; interest: number; principal: number }[];
}

export function loanSummary(principal: number, annualRatePct: number, months: number): LoanSummary {
  const monthly = monthlyInstalment(principal, annualRatePct, months);
  const r = annualRatePct / 100 / 12;
  let bal = principal, totalInterest = 0;
  const yearlyBalance: number[] = [];
  const yearly: LoanSummary['yearly'] = [];
  let yi = 0, yp = 0;
  for (let m = 1; m <= months; m++) {
    const interest = bal * r;
    const pay = m === months ? bal + interest : monthly;
    const princ = pay - interest;
    bal = Math.max(0, bal - princ);
    totalInterest += interest; yi += interest; yp += princ;
    if (m % 12 === 0 || m === months) {
      yearlyBalance.push(r2(bal));
      yearly.push({ year: Math.ceil(m / 12), interest: r2(yi), principal: r2(yp) });
      yi = 0; yp = 0;
    }
  }
  const years = months / 12;
  return {
    principal, months, monthly,
    totalPaid: r2(principal + totalInterest),
    totalInterest: r2(totalInterest),
    flatEquivalentPct: principal > 0 && years > 0 ? Math.round((totalInterest / principal / years) * 10000) / 100 : 0,
    yearlyBalance, yearly,
  };
}

/** Convert an old-style flat rate into the equivalent effective (reducing-balance) rate. */
export function flatToEir(flatPct: number, years: number): number {
  const principal = 100_000, months = Math.round(years * 12);
  const targetMonthly = (principal + principal * (flatPct / 100) * years) / months;
  let lo = 0, hi = 60;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (monthlyInstalment(principal, mid, months) < targetMonthly) lo = mid; else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 100) / 100;
}

/** Memorandum of Transfer stamp duty (Stamp Act 1949, First Schedule, item 32(a)) — tiered on price/market value. */
export function motStampDuty(price: number): number {
  const tiers: [number, number][] = [[100_000, 1], [500_000, 2], [1_000_000, 3], [Infinity, 4]];
  let duty = 0, lower = 0;
  for (const [upper, rate] of tiers) {
    if (price > lower) duty += ((Math.min(price, upper) - lower) * rate) / 100;
    lower = upper;
  }
  return r2(duty);
}

export const loanStampDuty = (loan: number) => r2(loan * 0.005);

export interface HomeCosts { downPayment: number; loan: number; motDuty: number; loanDuty: number; exempt: boolean; upfront: number }

/** First-time buyers: full exemption on both duties for homes up to the threshold (Budget 2026: RM500,000, SPA by 31 Dec 2027). */
export function homeUpfrontCosts(price: number, downPct: number, firstHome: boolean, exemptionCap = 500_000): HomeCosts {
  const downPayment = r2((price * downPct) / 100);
  const loan = r2(price - downPayment);
  const exempt = firstHome && price <= exemptionCap;
  const motDuty = exempt ? 0 : motStampDuty(price);
  const loanDuty = exempt ? 0 : loanStampDuty(loan);
  return { downPayment, loan, motDuty, loanDuty, exempt, upfront: r2(downPayment + motDuty + loanDuty) };
}

export interface PayoffResult { months: number; totalInterest: number; totalPaid: number; neverEnds: boolean }

/**
 * Credit card balance paid down with either the minimum payment (max(5% of balance, RM50)) or a fixed amount.
 * Interest is approximated monthly at APR/12 (banks charge daily; the difference is small). No new spending.
 */
export function cardPayoff(balance: number, aprPct: number, plan: { kind: 'minimum' } | { kind: 'fixed'; amount: number },
  minPct = 5, minFloor = 50): PayoffResult {
  const r = aprPct / 100 / 12;
  let bal = balance, months = 0, interestSum = 0, paid = 0;
  while (bal > 0.005 && months < 600) {
    const interest = bal * r;
    bal += interest; interestSum += interest;
    let pay = plan.kind === 'minimum' ? Math.max((bal * minPct) / 100, minFloor) : plan.amount;
    if (pay <= interest + 0.0001 && plan.kind === 'fixed') return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, neverEnds: true };
    pay = Math.min(pay, bal);
    bal -= pay; paid += pay; months++;
  }
  return { months, totalInterest: r2(interestSum), totalPaid: r2(paid), neverEnds: false };
}

/** BNM rule: income ≤ RM36,000/yr → max 2 issuers, limit ≤ 2× monthly income per issuer; below RM24,000/yr → not eligible. */
export function cardEligibility(monthlyIncome: number) {
  const annual = monthlyIncome * 12;
  if (annual < 24_000) return { eligible: false as const, capped: false, maxIssuers: 0, maxLimitPerIssuer: 0 };
  if (annual <= 36_000) return { eligible: true as const, capped: true, maxIssuers: 2, maxLimitPerIssuer: monthlyIncome * 2 };
  return { eligible: true as const, capped: false, maxIssuers: null, maxLimitPerIssuer: null };
}
