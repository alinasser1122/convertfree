'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles, Zap } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary-400 opacity-20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium mb-6">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t('badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleAccent')}</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/converter" className="btn-primary text-base">
              {t('ctaPrimary')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href="#formats" className="btn-secondary text-base">
              {t('ctaSecondary')}
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Stat value="11+" label={t('stat1')} />
            <Stat value="50+" label={t('stat2')} />
            <Stat value="0" label={t('stat3')} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card !p-4 text-center">
      <div className="text-2xl sm:text-3xl font-extrabold gradient-text">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
