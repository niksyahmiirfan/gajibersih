import type { Persona } from '@/lib/extras';

/** Simple original illustrated faces. Purely decorative (aria-hidden); the name is shown as text beside it. */
export function Avatar({ a, size = 56 }: { a: Persona['avatar']; size?: number }) {
  const hair = '#2b2420';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="avatar">
      <circle cx="32" cy="32" r="32" fill={a.accent} opacity="0.22" />
      {a.style === 'tudung' && <path d="M14 40 C12 18 52 18 50 40 L52 60 L12 60 Z" fill={a.accent} />}
      {a.style === 'bun' && <circle cx="32" cy="12" r="7" fill={hair} />}
      {/* neck + shoulders */}
      <path d="M16 62 C18 50 46 50 48 62 Z" fill={a.style === 'tudung' ? a.accent : a.accent} opacity={a.style === 'tudung' ? 1 : 0.85} />
      <circle cx="32" cy="32" r="13" fill={a.skin} />
      {a.style === 'tudung' && <path d="M17 34 C16 16 48 16 47 34 C45 22 19 22 17 34 Z" fill={a.accent} />}
      {a.style === 'bun' && <path d="M19 31 C18 17 46 17 45 31 C42 23 22 23 19 31 Z" fill={hair} />}
      {a.style === 'short' && <path d="M19 30 C19 17 45 17 45 30 C42 22 22 22 19 30 Z" fill={hair} />}
      {a.style === 'songkok' && <>
        <rect x="20" y="15" width="24" height="9" rx="2" fill="#1d1d1d" />
        <path d="M26 39 Q32 37 38 39" stroke="#d9d4cc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="27" cy="31" r="3.2" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
        <circle cx="37" cy="31" r="3.2" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
        <path d="M30.2 31 H33.8" stroke="#3a3a3a" strokeWidth="1.2" />
      </>}
      {a.style === 'cap' && <>
        <path d="M19 27 C19 15 45 15 45 27 Z" fill={a.accent} />
        <path d="M40 26 H52 Q50 29 44 29 H40 Z" fill={a.accent} />
      </>}
      {/* face */}
      <circle cx="27" cy="31" r="1.5" fill="#2b2420" />
      <circle cx="37" cy="31" r="1.5" fill="#2b2420" />
      <path d={a.style === 'songkok' ? 'M28 42 Q32 44 36 42' : 'M27 37 Q32 41 37 37'} stroke="#2b2420" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="23.5" cy="35.5" r="2" fill="#e8738a" opacity="0.35" />
      <circle cx="40.5" cy="35.5" r="2" fill="#e8738a" opacity="0.35" />
    </svg>
  );
}
