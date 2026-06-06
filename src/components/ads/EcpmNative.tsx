'use client';

import Script from 'next/script';
import { AD_KEYS, ADS_ENABLED } from '@/lib/ads';

export function EcpmNative({
  className = '',
  label
}: {
  className?: string;
  label?: React.ReactNode;
}) {
  if (!ADS_ENABLED) return null;
  const { ecpmNativeKey, ecpmNativeScript } = AD_KEYS;
  if (!ecpmNativeKey || !ecpmNativeScript) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center my-6 p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] ${className}`}
      data-ad-slot="ecpm-native"
    >
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-muted mb-2">{label}</span>
      )}
      <div id={`container-${ecpmNativeKey}`} className="w-full max-w-2xl min-h-[100px]" />
      <Script
        id={`ecpm-native-${ecpmNativeKey}`}
        strategy="lazyOnload"
        async
        data-cfasync="false"
        src={ecpmNativeScript}
      />
    </div>
  );
}
