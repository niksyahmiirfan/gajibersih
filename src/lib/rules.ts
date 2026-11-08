// Server/build-time loader for data/<country>/<year>/*.yaml. Not imported by client components.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { MyRules } from '../engine/my/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function readYaml<T>(...parts: string[]): T {
  return yaml.load(fs.readFileSync(path.join(DATA_DIR, ...parts), 'utf8')) as T;
}

export function latestYear(country = 'my'): number {
  const years = fs.readdirSync(path.join(DATA_DIR, country)).filter((d) => /^\d{4}$/.test(d)).map(Number);
  return Math.max(...years);
}

export function loadMyRules(year = latestYear('my')): MyRules {
  const y = String(year);
  return {
    meta: readYaml('my', y, 'meta.yaml'),
    epf: readYaml('my', y, 'epf.yaml'),
    perkeso: readYaml('my', y, 'perkeso.yaml'),
    tax: readYaml('my', y, 'tax.yaml'),
  };
}

/** Raw fixtures from the YAML files — used by tests and the verifier. */
export function loadFixtures(year = latestYear('my')) {
  const y = String(year);
  return {
    epf: readYaml<{ fixtures: { wage: number; employee: number; employer: number }[] }>('my', y, 'epf.yaml').fixtures,
    perkeso: readYaml<{ fixtures: { wage: number; socso_employee: number; socso_employer: number; eis: number; skbbk: number }[] }>('my', y, 'perkeso.yaml').fixtures,
    tax: readYaml<{ fixtures: { chargeable: number; tax: number }[] }>('my', y, 'tax.yaml').fixtures,
  };
}
