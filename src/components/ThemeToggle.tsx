'use client';

/** Light/dark switch. The initial theme is applied by an inline script in <head> (no flash);
 *  icons swap via CSS so server and client markup are identical. */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
  };
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={toggle} aria-label="Toggle light or dark mode" title="Light / dark">
      <span className="icon-moon" aria-hidden="true">🌙</span>
      <span className="icon-sun" aria-hidden="true">☀️</span>
    </button>
  );
}

export const themeInitScript =
  "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})();";
