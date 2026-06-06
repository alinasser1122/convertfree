'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

const ITEMS = [
  { key: 'heicJpg', from: 'HEIC', to: 'JPG', color: 'from-violet-500 to-indigo-500' },
  { key: 'pngWebp', from: 'PNG', to: 'WEBP', color: 'from-cyan-500 to-blue-500' },
  { key: 'jpgPng', from: 'JPG', to: 'PNG', color: 'from-emerald-500 to-teal-500' },
  { key: 'webpJpg', from: 'WEBP', to: 'JPG', color: 'from-amber-500 to-orange-500' },
  { key: 'pngPdf', from: 'PNG', to: 'PDF', color: 'from-rose-500 to-red-500' },
  { key: 'jpgPdf', from: 'JPG', to: 'PDF', color: 'from-fuchsia-500 to-pink-500' },
  { key: 'pngAvif', from: 'PNG', to: 'AVIF', color: 'from-sky-500 to-cyan-500' },
  { key: 'gifPng', from: 'GIF', to: 'PNG', color: 'from-lime-500 to-emerald-500' }
];

export function PopularFormats() {
  const t = useTranslations('formats');

  return (
    <section id="formats" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t('title')}</h2>
          <p className="mt-3 text-muted">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link
                href="/converter"
                className="group block card hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${it.color} mb-3`} />
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{it.from}</span>
                  <ArrowRight className="h-4 w-4 text-muted rtl:rotate-180" />
                  <span className="text-xl font-bold gradient-text">{it.to}</span>
                </div>
                <div className="mt-2 text-xs text-muted">
                  {t(`items.${it.key}` as never)}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
