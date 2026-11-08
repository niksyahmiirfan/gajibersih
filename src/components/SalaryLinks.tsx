import Link from 'next/link';
import { calculateTakeHome } from '@/engine/my/takeHome';
import { formatRM } from '@/engine/my/money';
import type { MyRules } from '@/engine/my/types';
import { CLUSTER_SALARIES, salarySlug } from '@/lib/site';

export function SalaryLinks({ rules, exclude, asOf }: { rules: MyRules; exclude?: number; asOf: string }) {
  return (
    <ul className="cards">
      {CLUSTER_SALARIES.filter((s) => s !== exclude).map((s) => (
        <li key={s}>
          <Link href={`/salary/${salarySlug(s)}/`}>
            RM{s.toLocaleString()} salary
            <span>≈ {formatRM(calculateTakeHome({ monthlySalary: s, asOf }, rules).net)} take-home</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
