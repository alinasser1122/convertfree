import { useTranslations } from 'next-intl';

export function AdLabel({ className = '' }: { className?: string }) {
  const t = useTranslations('ad');
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ${className}`}
    >
      {t('sponsored')}
    </span>
  );
}
