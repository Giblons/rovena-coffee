import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

describe('Utility & Design Token Integration', () => {
  it('cn() merges classnames with tailwind overrides correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('bg-canvas text-primary', false && 'hidden', 'font-serif')).toBe(
      'bg-canvas text-primary font-serif'
    );
  });

  it('formatCurrency() formats USD currency accurately', () => {
    expect(formatCurrency(22.5)).toBe('$22.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1249.99)).toBe('$1,249.99');
  });

  it('formatDate() formats standard date strings', () => {
    const formatted = formatDate('2026-08-24T08:00:00Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Aug');
  });
});
