'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { CurrencyCode, LocaleCode, ThemeMode } from '@/lib/site';
import { translate, type TranslationKey } from '@/i18n';
import { formatCurrency as formatCurrencyBase } from '@/lib/utils';

const STORAGE_KEY = 'rovena-preferences';

export interface PreferencesState {
  theme: ThemeMode;
  locale: LocaleCode;
  currency: CurrencyCode;
}

interface PreferencesContextValue extends PreferencesState {
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  formatPrice: (amountUsd: number) => string;
}

const defaults: PreferencesState = {
  theme: 'light',
  locale: 'en',
  currency: 'USD',
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readStored(): PreferencesState {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PreferencesState>;
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      locale: parsed.locale === 'id' ? 'id' : 'en',
      currency: parsed.currency === 'IDR' ? 'IDR' : 'USD',
    };
  } catch {
    return defaults;
  }
}

function applyDom(prefs: PreferencesState) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', prefs.theme === 'dark');
  root.lang = prefs.locale;
  root.style.colorScheme = prefs.theme;
}

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [prefs, setPrefs] = useState<PreferencesState>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStored();
    setPrefs(stored);
    applyDom(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyDom(prefs);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const setLocale = useCallback((locale: LocaleCode) => {
    setPrefs((p) => ({ ...p, locale }));
  }, []);

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setPrefs((p) => ({ ...p, currency }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(prefs.locale, key, vars),
    [prefs.locale]
  );

  const formatPrice = useCallback(
    (amountUsd: number) => formatCurrencyBase(amountUsd, prefs.currency, prefs.locale),
    [prefs.currency, prefs.locale]
  );

  const value: PreferencesContextValue = {
    ...prefs,
    setTheme,
    setLocale,
    setCurrency,
    toggleTheme,
    t,
    formatPrice,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    // Graceful fallback for tests / SSR edge cases
    return {
      ...defaults,
      setTheme: () => undefined,
      setLocale: () => undefined,
      setCurrency: () => undefined,
      toggleTheme: () => undefined,
      t: (key, vars) => translate('en', key, vars),
      formatPrice: (amount) => formatCurrencyBase(amount, 'USD', 'en'),
    };
  }
  return ctx;
}

export function useFormatCurrency() {
  const { formatPrice } = usePreferences();
  return formatPrice;
}
