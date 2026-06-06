'use client';

import Script from 'next/script';
import { AD_KEYS, hasAd } from '@/lib/ads';

type BannerSize = '300x250' | '728x90' | '160x300' | '160x600' | '320x50' | '468x60';

const SIZE_MAP: Record<BannerSize, { w: number; h: number; key: keyof typeof AD_KEYS }> = {
  '300x250': { w: 300, h: 250, key: 'banner300x250' },
  '728x90': { w: 728, h: 90, key: 'banner728x90' },
  '160x300': { w: 160, h: 300, key: 'banner160x300' },
  '160x600': { w: 160, h: 600, key: 'banner160x300' },
  '320x50': { w: 320, h: 50, key: 'banner300x250' },
  '468x60': { w: 468, h: 60, key: 'banner300x250' }
};

export function BannerAd({
  size = '300x250',
  className = '',
  label
}: {
  size?: BannerSize;
  className?: string;
  label?: React.ReactNode;
}) {
  const { w, h, key } = SIZE_MAP[size];
  const adKey = AD_KEYS[key];
  if (!hasAd(key)) return null;

  const containerId = `adsterra-banner-${size}-${adKey}`;
  return (
    <div
      className={`flex flex-col items-center justify-center my-4 ${className}`}
      data-ad-slot={size}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-muted mb-1">{label}</span>
      )}
      <div
        id={containerId}
        style={{ width: w, height: h, maxWidth: '100%' }}
        className="overflow-hidden"
      >
        <Script
          id={`adsterra-banner-${size}-config`}
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `var atOptions = { 'key' : '${adKey}', 'format' : 'iframe', 'height' : ${h}, 'width' : ${w}, 'params' : {} };`
          }}
        />
        <Script
          id={`adsterra-banner-${size}-invoke`}
          strategy="lazyOnload"
          src={`//www.profitabledisplaynetwork.com/${adKey}/invoke.js`}
        />
      </div>
    </div>
  );
}
