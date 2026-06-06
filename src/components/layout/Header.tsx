'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import {
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Languages,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useNextRouter();
  const pathname = useNextPathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (next: string) => {
    if (!pathname) return;
    const parts = pathname.split('/');
    parts[1] = next;
    router.push(parts.join('/') || `/${next}`);
    setLangOpen(false);
  };

  const nextTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark');
  };

  const links = [
    { href: '/', label: t('home') },
    { href: '/converter', label: t('converter') },
    { href: '/tools/resize', label: t('resize') },
    { href: '/tools/crop', label: t('crop') },
    { href: '/tools/pdf', label: t('toPdf') },
    { href: '/tools/gif', label: t('gif') }
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'glass-strong shadow-soft dark:shadow-soft-dark' : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-white">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="leading-none">
              <div className="text-base font-bold tracking-tight">FreeConvertX</div>
              <div className="text-[10px] text-muted">All formats, free forever</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-label={t('changeLanguage')}
                className="btn-ghost"
              >
                <Languages className="h-4 w-4" />
                <span className="text-sm font-medium uppercase">{locale}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {langOpen && (
                <>
                  <button
                    aria-hidden
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute end-0 z-50 mt-2 w-36 rounded-xl glass-strong shadow-soft dark:shadow-soft-dark py-1">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'ar', label: 'العربية' }
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => switchLocale(l.code)}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5',
                          locale === l.code && 'text-primary-600 dark:text-primary-400 font-semibold'
                        )}
                      >
                        <span>{l.label}</span>
                        <span className="text-xs uppercase opacity-60">{l.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={nextTheme}
              aria-label={t('toggleTheme')}
              className="btn-ghost"
              suppressHydrationWarning
            >
              {!mounted ? (
                <Monitor className="h-4 w-4" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t('closeMenu') : t('openMenu')}
              className="btn-ghost lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-strong border-t border-slate-200 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-3 grid gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
