import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { PopularFormats } from '@/components/sections/PopularFormats';
import { ToolsGrid } from '@/components/sections/ToolsGrid';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { FAQ } from '@/components/sections/FAQ';
import { Converter } from '@/components/converter/Converter';
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

      <PopularFormats />
      <ToolsGrid />
      <PrivacySection />
      <FAQ />
    </>
  );
}
