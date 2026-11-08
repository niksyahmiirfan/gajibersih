import { describe, expect, it } from 'vitest';
import { loadMyRules } from '../src/lib/rules';
import { loadFunFacts, loadPersonas } from '../src/lib/extras';
import { listSharings } from '../src/lib/content';
import { calculateTakeHome } from '../src/engine/my';

const rules = loadMyRules(2026);

describe('personas', () => {
  it('covers every residency status and computes sensibly', () => {
    const ps = loadPersonas();
    expect(new Set(ps.map((p) => p.residency))).toEqual(new Set(['citizen', 'pr', 'foreign']));
    for (const p of ps) {
      const r = calculateTakeHome({ monthlySalary: p.salary, age: p.age, residency: p.residency, spouseRelief: p.spouseRelief, children: p.children, asOf: '2026-11-08' }, rules);
      expect(r.net).toBeGreaterThan(0);
      expect(r.net).toBeLessThan(p.salary);
      expect(p.tagline.en && p.tagline.ms).toBeTruthy();
    }
  });
  it('foreign worker pays 2% EPF and no EIS; 60+ citizen pays no EPF', () => {
    const ps = loadPersonas();
    const budi = ps.find((p) => p.residency === 'foreign')!;
    const rb = calculateTakeHome({ monthlySalary: budi.salary, age: budi.age, residency: 'foreign', asOf: '2026-11-08' }, rules);
    expect(rb.employee.epf).toBe(Math.round(budi.salary * 0.02 * 100) / 100);
    expect(rb.employee.eis).toBe(0);
    const old = ps.find((p) => p.age >= 60)!;
    expect(calculateTakeHome({ monthlySalary: old.salary, age: old.age, residency: old.residency, asOf: '2026-11-08' }, rules).employee.epf).toBe(0);
  });
});

describe('fun facts and sharings', () => {
  it('every fun fact has EN and BM text', () => {
    for (const f of loadFunFacts()) { expect(f.en.length).toBeGreaterThan(10); expect(f.ms.length).toBeGreaterThan(10); }
  });
  it('lists sharings newest first with required fields', () => {
    const posts = listSharings('en');
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) { expect(p.title && p.date && p.category).toBeTruthy(); }
    expect([...posts].sort((a, b) => b.date.localeCompare(a.date))).toEqual(posts);
  });
});
