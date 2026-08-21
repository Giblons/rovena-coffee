'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2, RefreshCw } from 'lucide-react';
import { CartItem } from '@/types/cart';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/context/PreferencesContext';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const formatPrice = useFormatCurrency();
  const formatGrind = (g: string) => g.replace(/_/g, ' ');
  const itemTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-border-subtle group">
      {/* Product Thumbnail */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-espresso-900/10 flex-shrink-0 border border-border-subtle">
        <Image
          src={item.imageUrl || '/images/coffees/ethiopia-chelbesa.jpg'}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.isSubscription && (
          <div className="absolute top-1 left-1 bg-terracotta-500 text-cream-100 p-0.5 rounded shadow-xs" title="Subscription item">
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-serif font-bold text-sm text-espresso-950 truncate">
              {item.name}
            </h4>
            <span className="font-serif font-bold text-sm text-espresso-950 shrink-0">
              {formatPrice(itemTotal)}
            </span>
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-charcoal-600 font-sans">
            <span className="px-1.5 py-0.5 bg-cream-500/80 rounded border border-border-subtle font-mono">
              {item.weight}
            </span>
            <span className="px-1.5 py-0.5 bg-cream-500/80 rounded border border-border-subtle capitalize">
              {formatGrind(item.grind)}
            </span>
            {item.isSubscription && (
              <span className="px-1.5 py-0.5 bg-terracotta-50 text-terracotta-700 rounded border border-terracotta-200 font-medium">
                🔄 {item.subscriptionFrequency || 'Monthly'} (10% off)
              </span>
            )}
          </div>
        </div>

        {/* Quantity Stepper & Remove */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center border border-border-medium rounded-md bg-surface shadow-xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                'p-1.5 text-espresso-900 hover:bg-cream-500/80 disabled:opacity-40 disabled:hover:bg-transparent transition-colors rounded-l-md',
                'focus:outline-hidden focus:ring-1 focus:ring-terracotta-500'
              )}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold text-espresso-950 select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className={cn(
                'p-1.5 text-espresso-900 hover:bg-cream-500/80 transition-colors rounded-r-md',
                'focus:outline-hidden focus:ring-1 focus:ring-terracotta-500'
              )}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-charcoal-400 hover:text-terracotta-600 transition-colors rounded hover:bg-terracotta-50 focus:outline-hidden focus:ring-1 focus:ring-terracotta-500"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
