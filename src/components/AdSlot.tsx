'use client';
import { useEffect } from 'react';
import { SITE } from '@/lib/site';

/** Renders an AdSense unit when NEXT_PUBLIC_ADSENSE_CLIENT is set; otherwise nothing. */
export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  useEffect(() => {
    if (!SITE.adsenseClient) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* ad blockers */ }
  }, []);
  if (!SITE.adsenseClient) return null;
  return (
    <ins className="adsbygoogle ad" style={{ display: 'block' }}
      data-ad-client={SITE.adsenseClient} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
  );
}
