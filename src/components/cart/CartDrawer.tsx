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

  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 50.0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - summary.netSubtotal);
  const progressPercent = Math.min(100, Math.round((summary.netSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const totalCalculated = (
    summary.netSubtotal -
    summary.couponDiscount +
    summary.shippingFee +
    summary.tax
  ).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-espresso-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl flex flex-col justify-between border-l border-border-subtle animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-cream-500 text-espresso-900">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-espresso-950">
                Your Fresh Coffee Cart
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                {summary.itemsCount} {summary.itemsCount === 1 ? 'item' : 'items'} • {summary.totalGrams}g total
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-lg text-charcoal-400 hover:text-espresso-950 hover:bg-cream-500/80 transition-colors focus-ring"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-cream-500/60 border-b border-border-subtle/80 text-xs">
          <div className="flex items-center justify-between text-espresso-900 font-medium mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-terracotta-500" />
              {remainingForFreeShipping > 0 ? (
                <>Add <strong className="text-terracotta-600 font-mono">${remainingForFreeShipping.toFixed(2)}</strong> for Free Shipping</>
              ) : (
                <span className="text-olive-700 font-bold">🎉 You unlocked FREE Roastery Shipping!</span>
              )}
            </span>
            <span className="font-mono text-charcoal-500">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-cream-600/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items Scroll Container */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-border-subtle">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-cream-500 flex items-center justify-center text-charcoal-400 mx-auto">
                <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="font-serif font-bold text-base text-espresso-950">
                Your cart is empty
              </h3>
              <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
                Explore our ethically sourced micro-lots and specialty roasts to fill your bag.
              </p>
              <div className="pt-2">
                <Link href="/catalog" onClick={closeCart}>
                  <Button variant="primary" size="sm">
                    Browse Fresh Coffees
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

        {/* Footer with Totals and Actions */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border-subtle bg-canvas/60 space-y-3.5">
            {/* Promo Code Input */}
            <PromoCodeInput
              appliedDiscount={appliedDiscount}
              onApply={applyDiscountCode}
              onRemove={removeDiscountCode}
            />

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-mono text-espresso-900">${summary.grossSubtotal.toFixed(2)}</span>
              </div>

              {summary.subscriptionSavings > 0 && (
                <div className="flex justify-between text-terracotta-600 font-medium">
                  <span>Subscription Savings (10%)</span>
                  <span className="font-mono">-${summary.subscriptionSavings.toFixed(2)}</span>
                </div>
              )}

              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-olive-600 font-medium">
                  <span>Discount ({appliedDiscount?.code})</span>
                  <span className="font-mono">-${summary.couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Shipping</span>
                <span className="font-mono text-espresso-900">
                  {summary.shippingFee === 0 ? (
                    <strong className="text-olive-600 font-semibold">FREE</strong>
                  ) : (
                    `$${summary.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-mono text-espresso-900">${summary.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-espresso-950 pt-2 border-t border-border-subtle">
                <span>Estimated Total</span>
                <span className="font-mono text-terracotta-600 text-base">
                  ${totalCalculated}
                </span>
              </div>
            </div>

            {/* Roasting Batch Notification */}
            <div className="flex items-center gap-1.5 text-[11px] text-charcoal-600 bg-cream-500/90 px-3 py-1.5 rounded-md border border-border-subtle font-sans">
              <Flame className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
              <span>Next batch roasts Monday/Thursday • Ships next business day</span>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold shadow-elevated py-3"
                >
                  <span>Proceed to Checkout</span>
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
                <span>WhatsApp Direct Checkout</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
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
