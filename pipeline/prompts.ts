import type { Facts } from './facts';
import type { Brief, KeywordEntry } from './types';

export const SYSTEM_BRIEF = `You are an SEO editor for a Malaysian personal-finance calculator site.
You plan articles that answer the searcher's question fast, then explain. You never invent statistics.
Respond with a single JSON object only.`;

export function briefPrompt(k: KeywordEntry, facts: Facts, internalLinks: string[]) {
  return `Target keyword: "${k.keyword}"
Page type: ${k.type}${k.salary ? ` (monthly salary RM${k.salary})` : ''}
Tax year: ${facts.year}

Official sources available (cite only these): ${Object.values(facts.sources).join(', ')}
Internal pages you may link to: ${internalLinks.join(', ')}

Return JSON with keys:
- title (max 65 chars, include the keyword naturally and the year)
- description (120-155 chars meta description)
- search_intent ("informational" | "transactional")
- outline (4-7 H2 headings, first one answers the query directly)
- faqs (3-5 real questions people ask about this topic)
- internal_links (2-4 paths from the list above)`;
}

export const SYSTEM_WRITER = `You write clear, friendly, accurate explanations for people working in Malaysia.
HARD RULES:
1. Every number (RM amounts, percentages, thresholds) MUST come from the FACTS JSON. Never compute new numbers,
   never round differently than "about RMx" to the nearest ringgit, never use numbers from memory.
2. If a fact you want is not in FACTS, describe it qualitatively instead.
3. No first-person experience claims, no fake testimonials, no author persona.
4. Write in plain British/Malaysian English. Short paragraphs. Use the outline headings as H2 (##). No H1.
5. Include a one-line disclaimer that figures are estimates and not financial or tax advice.
Output ONLY a markdown document with YAML frontmatter (title, description, faqs: [{q, a}], sources: [urls]).`;

export function draftPrompt(brief: Brief, facts: Facts) {
  return `BRIEF:
${JSON.stringify(brief, null, 2)}

FACTS (the only numbers you may use; scenario results are computed by our tested calculator):
${JSON.stringify(facts, null, 2)}

Write the article (600-1000 words). Explain each deduction, show the worked example from the first scenario,
then show how the other scenarios change the result. Link internal pages with markdown links.
Answer each FAQ in 1-3 sentences inside the frontmatter faqs list.`;
}

export const SYSTEM_CLAIMS = `You are a strict fact-checker. Compare an article against FACTS JSON.
List every claim (numeric or rule-based) that is NOT supported by FACTS or contradicts it.
Respond with JSON: {"issues": [{"claim": "...", "reason": "..."}]}. Empty list if all claims are supported.`;

export function claimsPrompt(article: string, facts: Facts) {
  return `FACTS:\n${JSON.stringify(facts)}\n\nARTICLE:\n${article}`;
}
