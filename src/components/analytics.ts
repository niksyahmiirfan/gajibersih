// Thin wrapper around gtag so components never break when GA isn't configured.
declare global {
  interface Window { gtag?: (...args: unknown[]) => void; adsbygoogle?: unknown[] }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', event, params);
}
