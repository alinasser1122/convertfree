'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink, Zap } from 'lucide-react';
import { AD_KEYS, hasAd } from '@/lib/ads';

export function SmartLinkButton({
  className = '',
  variant = 'inline',
  children
}: {
  className?: string;
  variant?: 'inline' | 'button';
  children?: React.ReactNode;
}) {
  const t = useTranslations('ad');
  if (!hasAd('smartlink')) return null;
  const url = AD_KEYS.smartlink;

  if (variant === 'button') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        data-ad="smartlink"
        className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition ${className}`}
      >
        <Zap className="h-4 w-4" />
        {children ?? t('smartOffer')}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      data-ad="smartlink"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline ${className}`}
    >
      <Zap className="h-3.5 w-3.5" />
      {children ?? t('smartOffer')}
    </a>
  );
}
