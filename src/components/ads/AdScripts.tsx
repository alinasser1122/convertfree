'use client';

import Script from 'next/script';
import { AD_KEYS, ADS_ENABLED } from '@/lib/ads';

export function AdScripts() {
  if (!ADS_ENABLED) return null;

  const { popunder, socialBar, inPagePush, interstitial, ecpmAd1, ecpmAd2 } = AD_KEYS;

  return (
    <>
      {popunder && (
        <>
          <Script
            id="adsterra-popunder-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var atOptions = { 'key' : '${popunder}', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };`
            }}
          />
          <Script
            id="adsterra-popunder-invoke"
            strategy="afterInteractive"
            src={`//www.profitabledisplaynetwork.com/${popunder}/invoke.js`}
          />
        </>
      )}

      {socialBar && (
        <>
          <Script
            id="adsterra-socialbar-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var atOptions = { 'key' : '${socialBar}', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };`
            }}
          />
          <Script
            id="adsterra-socialbar-invoke"
            strategy="afterInteractive"
            src={`//www.profitabledisplaynetwork.com/${socialBar}/invoke.js`}
          />
        </>
      )}

      {inPagePush && (
        <>
          <Script
            id="adsterra-inpagepush-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var atOptions = { 'key' : '${inPagePush}', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {} };`
            }}
          />
          <Script
            id="adsterra-inpagepush-invoke"
            strategy="afterInteractive"
            src={`//www.profitabledisplaynetwork.com/${inPagePush}/invoke.js`}
          />
        </>
      )}

      {interstitial && (
        <>
          <Script
            id="adsterra-interstitial-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var atOptions = { 'key' : '${interstitial}', 'format' : 'iframe', 'height' : 600, 'width' : 160, 'params' : {} };`
            }}
          />
          <Script
            id="adsterra-interstitial-invoke"
            strategy="afterInteractive"
            src={`//www.profitabledisplaynetwork.com/${interstitial}/invoke.js`}
          />
        </>
      )}

      {ecpmAd1 && (
        <Script
          id="ecpm-ad-1"
          strategy="afterInteractive"
          src={ecpmAd1}
        />
      )}

      {ecpmAd2 && (
        <Script
          id="ecpm-ad-2"
          strategy="afterInteractive"
          src={ecpmAd2}
        />
      )}
    </>
  );
}
