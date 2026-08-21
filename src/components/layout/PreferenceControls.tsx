'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import type { CurrencyCode, LocaleCode } from '@/lib/site';

export const PreferenceControls: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const {
    theme,
    locale,
    currency,
    toggleTheme,
    setLocale,
    setCurrency,
    t,
  } = usePreferences();

  const selectClass = compact
    ? 'text-[11px] font-mono font-semibold uppercase tracking-wide bg-transparent border border-border-medium rounded-md px-2 py-1.5 text-espresso-900 dark:text-cream-400 focus-ring'
    : 'text-xs font-mono font-semibold uppercase tracking-wide bg-transparent border border-border-medium rounded-md px-2.5 py-1.5 text-espresso-900 dark:text-cream-400 focus-ring';

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-2.5'}`}>
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-full text-espresso-900 dark:text-cream-400 hover:bg-cream-500/80 dark:hover:bg-espresso-800 transition-colors focus-ring"
        aria-label={theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight')}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 stroke-[1.8]" />
        ) : (
          <Moon className="w-5 h-5 stroke-[1.8]" />
        )}
      </button>

      <label className="sr-only" htmlFor="locale-select">
        {t('nav.language')}
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className={selectClass}
        aria-label={t('nav.language')}
      >
        <option value="en">EN</option>
        <option value="id">ID</option>
      </select>

      <label className="sr-only" htmlFor="currency-select">
        {t('nav.currency')}
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className={selectClass}
        aria-label={t('nav.currency')}
      >
        <option value="USD">USD</option>
        <option value="IDR">IDR</option>
      </select>
    </div>
  );
};
