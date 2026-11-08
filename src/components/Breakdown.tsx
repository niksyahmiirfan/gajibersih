import type { TakeHomeResult } from '@/engine/my/types';
import { formatRM } from '@/engine/my/money';
import type { Dict } from '@/i18n/dict';

export function Breakdown({ r, t }: { r: TakeHomeResult; t: Dict }) {
  const rows: [string, number][] = [
    [t.epf, r.employee.epf],
    [t.socso, r.employee.socso],
    [t.eis, r.employee.eis],
    [t.skbbkShort, r.employee.skbbk],
    [t.tax, r.employee.tax],
  ];
  return (
    <div className="breakdown">
      <div className="hero">
        <div className="hero-label">{t.takeHome}</div>
        <div className="hero-value" data-testid="net">{formatRM(r.net)}</div>
        <div className="hero-sub">{t.perMonth} · {formatRM(r.annualNet)} {t.perYear}</div>
      </div>

      <h3>{t.deductions}</h3>
      <table>
        <tbody>
          {rows.map(([label, v]) => (
            <tr key={label}><td>{label}</td><td className="num">−{formatRM(v)}</td></tr>
          ))}
          <tr className="total"><td>{t.total}</td><td className="num">−{formatRM(r.employee.total)}</td></tr>
        </tbody>
      </table>

      <h3>{t.employerCost}</h3>
      <table>
        <tbody>
          <tr><td>{t.epf}</td><td className="num">{formatRM(r.employer.epf)}</td></tr>
          <tr><td>{t.socso}</td><td className="num">{formatRM(r.employer.socso)}</td></tr>
          <tr><td>{t.eis}</td><td className="num">{formatRM(r.employer.eis)}</td></tr>
          <tr className="total"><td>{t.totalCost}</td><td className="num">{formatRM(r.totalEmploymentCost)}</td></tr>
        </tbody>
      </table>

      <details>
        <summary>{t.taxDetails}</summary>
        <table>
          <tbody>
            <tr><td>{t.annualGross}</td><td className="num">{formatRM(r.tax.annualGross)}</td></tr>
            {r.tax.reliefs.map((x) => (
              <tr key={x.label}><td>{t.reliefs}: {x.label}</td><td className="num">−{formatRM(x.amount)}</td></tr>
            ))}
            <tr><td>{t.chargeable}</td><td className="num">{formatRM(r.tax.chargeableIncome)}</td></tr>
            <tr><td>{t.taxBefore}</td><td className="num">{formatRM(r.tax.taxBeforeRebate)}</td></tr>
            <tr><td>{t.rebate}</td><td className="num">−{formatRM(r.tax.rebate)}</td></tr>
            <tr className="total"><td>{t.annualTax}</td><td className="num">{formatRM(r.tax.annualTax)}</td></tr>
            <tr><td>{t.marginal} / {t.effective}</td><td className="num">{r.tax.marginalRate}% / {r.tax.effectiveRate}%</td></tr>
          </tbody>
        </table>
      </details>

      <ul className="notes">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
    </div>
  );
}
