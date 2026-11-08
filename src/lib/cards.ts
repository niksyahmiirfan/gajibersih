import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type CardTag = 'petrol' | 'groceries' | 'online' | 'dining' | 'ehailing' | 'travel' | 'bills' | 'everyday';
export interface CreditCard {
  id: string; name: string; issuer: string; url: string; min_income: number;
  fee: 'none' | 'waivable' | 'check'; islamic: boolean; tags: CardTag[]; colors: [string, string];
  perks: { en: string[]; ms: string[] };
}
export interface CardData { last_checked: string; checked_from: string[]; cards: CreditCard[] }

export const loadCards = () =>
  yaml.load(fs.readFileSync(path.join(process.cwd(), 'data', 'credit-cards.yaml'), 'utf8')) as CardData;
