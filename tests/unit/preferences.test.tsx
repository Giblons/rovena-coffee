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
      <button type="button" onClick={() => setLocale('id')}>
        set-id
      </button>
      <button type="button" onClick={() => setCurrency('IDR')}>
        set-idr
      </button>
    </div>
  );
}

describe('PreferencesProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light English USD and formats prices', async () => {
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('nav')).toHaveTextContent('Coffee Catalog');
    expect(screen.getByTestId('price')).toHaveTextContent(formatCurrency(1, 'USD'));
  });

  it('toggles dark mode, Indonesian locale, and IDR currency', async () => {
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>
    );

    fireEvent.click(screen.getByText('toggle-theme'));
    fireEvent.click(screen.getByText('set-id'));
    fireEvent.click(screen.getByText('set-idr'));

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('locale')).toHaveTextContent('id');
    expect(screen.getByTestId('currency')).toHaveTextContent('IDR');
    expect(screen.getByTestId('nav')).toHaveTextContent('Katalog Kopi');
    expect(screen.getByTestId('price').textContent).toMatch(/16/);
  });
});
