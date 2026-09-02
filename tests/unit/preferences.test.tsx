import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PreferencesProvider, usePreferences } from '@/context/PreferencesContext';
import { formatCurrency } from '@/lib/utils';

function Probe() {
  const { theme, locale, currency, toggleTheme, setLocale, setCurrency, t, formatPrice } =
    usePreferences();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="locale">{locale}</span>
      <span data-testid="currency">{currency}</span>
      <span data-testid="nav">{t('nav.catalog')}</span>
      <span data-testid="price">{formatPrice(1)}</span>
      <button type="button" onClick={toggleTheme}>
        toggle-theme
      </button>
      <button type="button" onClick={() => setLocale('en')}>
        set-en
      </button>
      <button type="button" onClick={() => setCurrency('USD')}>
        set-usd
      </button>
    </div>
  );
}

describe('PreferencesProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.lang = 'id';
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light Indonesian IDR for Bogor customers', async () => {
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
    expect(screen.getByTestId('locale')).toHaveTextContent('id');
    expect(screen.getByTestId('currency')).toHaveTextContent('IDR');
    expect(screen.getByTestId('nav')).toHaveTextContent('Katalog Kopi');
    expect(screen.getByTestId('price').textContent).toMatch(/16/);
  });

  it('toggles dark mode, English locale, and USD currency', async () => {
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>
    );

    fireEvent.click(screen.getByText('toggle-theme'));
    fireEvent.click(screen.getByText('set-en'));
    fireEvent.click(screen.getByText('set-usd'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('nav')).toHaveTextContent('Coffee Catalog');
    expect(screen.getByTestId('price')).toHaveTextContent(formatCurrency(1, 'USD'));
  });
});
