'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Cpu } from 'lucide-react';

export function PrivacySection() {
  const t = useTranslations('privacy');

  const points = [
    { icon: Lock, key: 'noUpload' },
    { icon: Eye, key: 'noTracking' },
    { icon: Cpu, key: 'noAccount' },
    { icon: Shield, key: 'openSource' }
  ];

  return (
    <section id="privacy" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-20 -left-10 h-80 w-80 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-secondary-500 opacity-15 blur-3xl" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-semibold mb-4">
                <Shield className="h-3.5 w-3.5" />
                {t('badge')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                {t('title')}
              </h2>
              <p className="mt-4 text-muted text-base">
                {t('description')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {points.map((p, i) => (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium pt-1.5">
                    {t(`points.${p.key}` as never)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
