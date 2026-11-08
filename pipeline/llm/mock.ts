// Offline provider: produces structurally valid output from the request context so the
// whole pipeline (and CI) can run without API keys. Not for publishing.
import type { LLMRequest } from './index';
import type { Facts } from '../facts';

export function mockComplete(req: LLMRequest): string {
  const ctx = (req.context ?? {}) as { keyword?: string; facts?: Facts; brief?: { title: string; outline: string[]; faqs: string[] } };
  if (req.task === 'brief') {
    return JSON.stringify({
      title: `${ctx.keyword} (${ctx.facts?.year})`,
      description: `Breakdown of ${ctx.keyword} using official ${ctx.facts?.year} rates.`,
      search_intent: 'informational',
      outline: ['The short answer', 'Where the money goes', 'How the tax estimate works', 'What changes your figure'],
      faqs: ['How much EPF do I pay?', 'How much tax do I pay a month?'],
      internal_links: ['/take-home-pay-calculator/', '/methodology/'],
    });
  }
  if (req.task === 'claims') return JSON.stringify({ issues: [] });
  const f = ctx.facts!;
  const r = f.scenarios[0].result;
  const b = ctx.brief!;
  return `---
title: "${b.title}"
description: "${b.title} — full breakdown."
faqs:
  - q: "${b.faqs[0]}"
    a: "You pay RM${r.employee.epf.toFixed(2)} a month into EPF."
  - q: "${b.faqs[1]}"
    a: "About RM${r.employee.tax.toFixed(2)} a month, based on the annual estimate."
sources:
  - ${f.sources.epf_third_schedule}
  - ${f.sources.perkeso}
  - ${f.sources.lhdn_rates}
---

## ${b.outline[0]}

On RM${r.gross.toFixed(2)} a month you take home about RM${r.net.toFixed(2)}.

## ${b.outline[1]}

EPF takes RM${r.employee.epf.toFixed(2)} (${f.rates.epf_employee_pct}%). SOCSO is RM${r.employee.socso.toFixed(2)}, EIS RM${r.employee.eis.toFixed(2)} and SKBBK RM${r.employee.skbbk.toFixed(2)}.

## ${b.outline[2]}

Chargeable income comes to RM${r.tax.chargeableIncome.toFixed(2)}, giving annual tax of RM${r.tax.annualTax.toFixed(2)}.

## ${b.outline[3]}

Reliefs for a spouse or children lower the tax. Use the [calculator](/take-home-pay-calculator/) for your own numbers.

*Estimates based on official ${f.year} rates. Not financial or tax advice.*
`;
}
