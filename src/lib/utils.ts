import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SITE, type CurrencyCode, type LocaleCode } from '@/lib/site';

/**
 * Combines class names safely with Tailwind CSS specificity merging.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a USD-canonical amount for display in USD or IDR.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  locale: LocaleCode = 'en'
): string {
  if (currency === 'IDR') {
    const idr = Math.round(amount * SITE.usdToIdr);
    return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(idr);
  }

  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date in standard readable artisan format (e.g. "Mon, Aug 24, 2026").
 */
export function formatDate(date: string | Date, locale: LocaleCode = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
