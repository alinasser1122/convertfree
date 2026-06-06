import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { PopularFormats } from '@/components/sections/PopularFormats';
import { ToolsGrid } from '@/components/sections/ToolsGrid';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { FAQ } from '@/components/sections/FAQ';
import { Converter } from '@/components/converter/Converter';
import { BannerAd } from '@/components/ads/BannerAd';
import { NativeBanner } from '@/components/ads/NativeBanner';
import { EcpmNative } from '@/components/ads/EcpmNative';
import { AdLabel } from '@/components/ads/AdLabel';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'converter' });

  return (
    <>
      <Hero />

      <section id="converter" className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold">{t('title')}</h2>
            <p className="mt-2 text-muted">{t('subtitle')}</p>
          </div>
          <Converter />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <BannerAd size="728x90" label={<AdLabel />} className="hidden sm:flex" />
        <BannerAd size="300x250" label={<AdLabel />} className="flex sm:hidden" />
      </div>

      <PopularFormats />
      <ToolsGrid />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <NativeBanner label={<AdLabel />} />
        <EcpmNative label={<AdLabel />} />
        <BannerAd size="300x250" label={<AdLabel />} />
      </div>

      <PrivacySection />
      <FAQ />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
        <BannerAd size="728x90" label={<AdLabel />} className="hidden sm:flex" />
        <BannerAd size="300x250" label={<AdLabel />} className="flex sm:hidden" />
      </div>
    </>
  );
}
