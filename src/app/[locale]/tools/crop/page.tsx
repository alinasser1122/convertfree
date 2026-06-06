import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CropTool } from '@/components/tools/CropTool';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools.crop' });
  return { title: t('title') };
}

export default async function CropPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'tools.crop' });

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{t('title')}</h1>
          <p className="mt-2 text-muted">{t('subtitle')}</p>
        </header>
        <CropTool />
      </div>
    </section>
  );
}
