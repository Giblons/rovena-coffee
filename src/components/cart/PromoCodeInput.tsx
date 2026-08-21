'use client';

import React, { useState } from 'react';
import { Tag, X, ArrowRight } from 'lucide-react';
import { AppliedDiscount } from '@/types/cart';
import { cn } from '@/lib/utils';

export interface PromoCodeInputProps {
  appliedDiscount: AppliedDiscount | null;
  onApply: (code: string) => { success: boolean; message: string } | boolean;
  onRemove: () => void;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  appliedDiscount,
  onApply,
  onRemove,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return;

    const res = onApply(code);
    const success = typeof res === 'boolean' ? res : res?.success;

    if (success) {
      setCode('');
    } else {
      const errMsg =
        typeof res === 'object' && res?.message
          ? res.message
          : 'Invalid coupon code. Try WELCOME10 or FREESHIP';
      setError(errMsg);
    }
  };

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-olive-50 border border-olive-200 text-xs text-olive-800 animate-in fade-in">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-olive-600 shrink-0" />
          <div>
            <span className="font-mono font-bold tracking-wider">{appliedDiscount.code}</span>
            <span className="text-olive-700 ml-1.5">({appliedDiscount.description})</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-olive-600 hover:text-olive-900 rounded hover:bg-olive-100 transition-colors"
          aria-label="Remove coupon"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Promo code (e.g. WELCOME10)"
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-md border bg-surface text-espresso-950 uppercase',
              'focus:outline-hidden focus:ring-1 focus:ring-terracotta-500',
              error ? 'border-terracotta-400' : 'border-border-medium'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim()}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-espresso-900 text-cream-200 hover:bg-terracotta-600 disabled:opacity-40 disabled:hover:bg-espresso-900 transition-colors shrink-0 flex items-center gap-1"
        >
          <span>Apply</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>
      {error && (
        <p className="text-[11px] text-terracotta-600 font-sans pl-1">{error}</p>
      )}
    </div>
  );
};
