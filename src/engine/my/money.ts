// Integer-safe money helpers. Rates are percents with up to 2 decimals → basis points.

export const toBp = (ratePercent: number) => Math.round(ratePercent * 100);
export const toSen = (rm: number) => Math.round(rm * 100);
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** rate% of a whole-ringgit amount, rounded UP to the next ringgit (EPF schedule rule). */
export function pctCeilRinggitFromSen(amountSen: number, ratePercent: number): number {
  const num = amountSen * toBp(ratePercent); // sen * bp ; ringgit = num / 1_000_000
  return Math.ceil(num / 1_000_000);
}

/** rate% of an amount, rounded UP to the nearest `stepSen` sen. Returns RM. */
export function pctCeilToSen(amountSen: number, ratePercent: number, stepSen: number): number {
  const num = amountSen * toBp(ratePercent); // sen value = num / 10_000
  return (Math.ceil(num / (10_000 * stepSen)) * stepSen) / 100;
}

export const formatRM = (n: number) =>
  'RM' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
