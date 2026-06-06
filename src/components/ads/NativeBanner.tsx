'use client';

import Script from 'next/script';
import { AD_KEYS, hasAd } from '@/lib/ads';

export function NativeBanner({ className = '', label }: { className?: string; label?: React.ReactNode }) {
  if (!hasAd('native')) return null;
  const key = AD_KEYS.native;
  const containerId = `container-${key}`;

  return (
    <div
      className={`flex flex-col items-center justify-center my-6 p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] ${className}`}
      data-ad-slot="native"
    >
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-muted mb-2">{label}</span>
      )}
      <div id={containerId} className="w-full max-w-2xl" />
      <Script
        id="adsterra-native"
        strategy="lazyOnload"
        async
        data-cfasync="false"
        src={`//www.profitabledisplaynetwork.com/${key}.js`}
      />
    </div>
  );
}
