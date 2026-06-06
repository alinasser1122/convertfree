'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Crop, FileImage, Film, ImageDown, Link as LinkIcon, Maximize2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

const TOOLS = [
  { href: '/tools/resize', icon: Maximize2, key: 'resize', color: 'from-violet-500 to-indigo-500' },
  { href: '/tools/crop', icon: Crop, key: 'crop', color: 'from-cyan-500 to-blue-500' },
  { href: '/tools/pdf', icon: FileImage, key: 'toPdf', color: 'from-rose-500 to-red-500' },
  { href: '/tools/gif', icon: Film, key: 'gif', color: 'from-amber-500 to-orange-500' },
  { href: '/converter', icon: ImageDown, key: 'converter', color: 'from-emerald-500 to-teal-500' },
  { href: '/converter', icon: LinkIcon, key: 'url', color: 'from-sky-500 to-cyan-500' }
];

export function ToolsGrid() {
  const t = useTranslations('tools');
  const tNav = useTranslations('nav');

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t('title')}</h2>
          <p className="mt-3 text-muted">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={`${tool.href}-${tool.key}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={tool.href}
                className="group flex flex-col items-center gap-2 card hover:-translate-y-1 hover:shadow-glow transition-all !p-4"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-center">{tNav(tool.key as never)}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
