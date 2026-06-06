'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Github, Shield } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SmartLinkButton } from '@/components/ads/SmartLinkButton';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold">FreeConvertX</div>
                <div className="text-xs text-muted">{t('tagline')}</div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted max-w-xs">{t('madeWith')}</p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-3">{t('product')}</div>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/converter">{tNav('converter')}</Link></li>
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/tools/resize">{tNav('resize')}</Link></li>
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/tools/crop">{tNav('crop')}</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-3">{t('tools')}</div>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/tools/pdf">{tNav('toPdf')}</Link></li>
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/tools/gif">{tNav('gif')}</Link></li>
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/converter">{tNav('url')}</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold mb-3">{t('company')}</div>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/#privacy">{t('privacy')}</Link></li>
              <li><Link className="hover:text-primary-600 dark:hover:text-primary-400" href="/#faq">{tNav('faq')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
          <p className="text-xs text-muted">{t('copyright', { year })}</p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <SmartLinkButton />
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              100% client-side
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
