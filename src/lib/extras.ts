// Build-time loaders for personas and fun facts.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { latestYear } from './rules';
import type { Residency } from '../engine/my/types';

export interface Persona {
  id: string;
  name: string;
  age: number;
  residency: Residency;
  salary: number;
  spouseRelief?: boolean;
  children?: number;
  taxResident?: boolean;
  avatar: { skin: string; style: 'tudung' | 'bun' | 'short' | 'songkok' | 'cap'; accent: string };
  tagline: { en: string; ms: string };
}

export interface FunFact { kind: 'fact' | 'tip' | 'proverb' | 'quote'; en: string; ms: string }

const read = <T>(...p: string[]) => yaml.load(fs.readFileSync(path.join(process.cwd(), 'data', ...p), 'utf8')) as T;

export const loadPersonas = () => read<Persona[]>('personas.yaml');
export const loadFunFacts = () => read<FunFact[]>('my', String(latestYear('my')), 'fun-facts.yaml');
