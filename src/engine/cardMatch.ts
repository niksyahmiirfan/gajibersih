import type { CardTag, CreditCard } from '@/lib/cards';

export interface CardPrefs {
  monthlyIncome: number;
  spend: CardTag[];          // up to 3 categories
  noFee: boolean;
  islamic: boolean;
  paysInFull: boolean;
}

export interface CardMatch { card: CreditCard; score: number; reasons: string[] }

/** Transparent scoring: spend-category matches dominate, then fee preference. Returns eligible cards, best first. */
export function matchCards(cards: CreditCard[], p: CardPrefs): CardMatch[] {
  const annual = p.monthlyIncome * 12;
  return cards
    .filter((c) => c.min_income <= annual && (!p.islamic || c.islamic))
    .map((c) => {
      let score = 0;
      const reasons: string[] = [];
      for (const t of p.spend) if (c.tags.includes(t)) { score += 3; reasons.push(t); }
      if (p.spend.length && c.tags.includes('everyday')) score += 1;
      const feeWeight = p.noFee || !p.paysInFull ? 1 : 0.4;
      if (c.fee === 'none') { score += 3 * feeWeight; reasons.push('nofee'); }
      else if (c.fee === 'waivable') { score += 1.5 * feeWeight; reasons.push('waivable'); }
      if (p.islamic && c.islamic) reasons.push('islamic');
      // People who carry a balance should favour simple, no-fee cards over reward chasing
      if (!p.paysInFull && c.tags.length <= 2 && c.fee === 'none') score += 1;
      return { card: c, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.card.min_income - b.card.min_income);
}
