'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Truck,
  Flame,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { usePreferences, useFormatCurrency } from '@/context/PreferencesContext';
import { CartItemRow } from './CartItemRow';
import { PromoCodeInput } from './PromoCodeInput';
import { WhatsAppCheckoutModal } from './WhatsAppCheckoutModal';
import { Button } from '@/components/ui/Button';

export const CartDrawer: React.FC = () => {
  const {
    items,
    summary,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
  } = useCart();
  const { t } = usePreferences();
  const formatPrice = useFormatCurrency();

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 50.0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - summary.netSubtotal);
  const progressPercent = Math.min(100, Math.round((summary.netSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const totalCalculated =
    summary.netSubtotal -
    summary.couponDiscount +
    summary.shippingFee +
    summary.tax;

  return (
    <>
      <div
        className="fixed inset-0 bg-espresso-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl flex flex-col justify-between border-l border-border-subtle animate-in slide-in-from-right duration-300"
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-cream-500 dark:bg-espresso-800 text-espresso-900 dark:text-cream-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-espresso-950 dark:text-cream-300">
                {t('cart.title')}
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                {summary.itemsCount}{' '}
                {summary.itemsCount === 1 ? t('cart.item') : t('cart.items')} •{' '}
                {summary.totalGrams}g total
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-lg text-charcoal-400 hover:text-espresso-950 dark:hover:text-cream-300 hover:bg-cream-500/80 dark:hover:bg-espresso-800 transition-colors focus-ring"
            aria-label={t('cart.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-cream-500/60 dark:bg-espresso-900/60 border-b border-border-subtle/80 text-xs">
          <div className="flex items-center justify-between text-espresso-900 dark:text-cream-400 font-medium mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-terracotta-500" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  {t('cart.addForShipping', {
                    amount: formatPrice(remainingForFreeShipping),
                  })}
                </span>
              ) : (
                <span className="text-olive-700 dark:text-olive-300 font-bold">
                  {t('cart.freeShipping')}
                </span>
              )}
            </span>
            <span className="font-mono text-charcoal-500">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-cream-600/70 dark:bg-espresso-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-border-subtle">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-cream-500 dark:bg-espresso-800 flex items-center justify-center text-charcoal-400 mx-auto">
                <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-bold text-base text-espresso-950 dark:text-cream-300">
                {t('cart.empty')}
              </h3>
              <div className="pt-2">
                <Link href="/catalog" onClick={closeCart}>
                  <Button variant="primary" size="sm">
                    {t('cart.browse')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-border-subtle bg-canvas/60 space-y-3.5">
            <PromoCodeInput
              appliedDiscount={appliedDiscount}
              onApply={applyDiscountCode}
              onRemove={removeDiscountCode}
            />

            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-300">
                <span>{t('cart.subtotal')}</span>
                <span className="font-mono text-espresso-900 dark:text-cream-400">
                  {formatPrice(summary.grossSubtotal)}
                </span>
              </div>

              {summary.subscriptionSavings > 0 && (
                <div className="flex justify-between text-terracotta-600 font-medium">
                  <span>Subscription Savings (10%)</span>
                  <span className="font-mono">
                    -{formatPrice(summary.subscriptionSavings)}
                  </span>
                </div>
              )}

              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-olive-600 font-medium">
                  <span>Discount ({appliedDiscount?.code})</span>
                  <span className="font-mono">
                    -{formatPrice(summary.couponDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-300">
                <span>{t('cart.shipping')}</span>
                <span className="font-mono text-espresso-900 dark:text-cream-400">
                  {summary.shippingFee === 0 ? (
                    <strong className="text-olive-600 font-semibold">FREE</strong>
                  ) : (
                    formatPrice(summary.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600 dark:text-charcoal-300">
                <span>{t('cart.tax')}</span>
                <span className="font-mono text-espresso-900 dark:text-cream-400">
                  {formatPrice(summary.tax)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-espresso-950 dark:text-cream-300 pt-2 border-t border-border-subtle">
                <span>{t('cart.total')}</span>
                <span className="font-mono text-terracotta-600 text-base">
                  {formatPrice(totalCalculated)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-charcoal-600 dark:text-charcoal-300 bg-cream-500/90 dark:bg-espresso-800 px-3 py-1.5 rounded-md border border-border-subtle font-sans">
              <Flame className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
              <span>Next batch roasts Monday/Thursday • Ships next business day</span>
            </div>

            <div className="space-y-2 pt-1">
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-elevated py-3"
                >
                  <span>{t('cart.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setWhatsAppModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1e7e34] border-[#25D366]/40 hover:bg-[#25D366]/10"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>{t('cart.whatsapp')}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <WhatsAppCheckoutModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        items={items}
        summary={summary}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={() => {
          clearCart();
          closeCart();
        }}
      />
    </>
  );
};
