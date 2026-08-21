const fs = require('fs');
const path = require('path');

function write(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('WROTE ' + filePath);
}
write('src/context/CartContext.tsx', `'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CartItem,
  CartState,
  AppliedDiscount,
  OrderPricingSummary,
  SubscriptionFrequency,
} from '@/types/cart';
import { PackageWeight, GrindOption } from '@/types/coffee';
import { calculateItemUnitPrice, calculateOrderSummary, validatePromoCode } from '@/lib/pricing';

export interface GenerateLineItemIdParams {
  slug: string;
  weight: PackageWeight;
  grind: GrindOption;
  isSubscription: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
}

export function generateLineItemId(params: GenerateLineItemIdParams): string {
  const freq = params.isSubscription ? params.subscriptionFrequency || 'monthly' : 'onetime';
  return params.slug + '-' + params.weight + '-' + params.grind + '-' + freq;
}

export interface AddItemInput {
  productId: string;
  slug: string;
  name: string;
  origin: string;
  roastLevel: CartItem['roastLevel'];
  imageUrl: string;
  weight: PackageWeight;
  weightGrams?: number;
  grind: GrindOption;
  basePrice250g: number;
  quantity?: number;
  isSubscription?: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
}

export interface CartContextValue extends CartState {
  summary: OrderPricingSummary;
  addItem: (item: AddItemInput) => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'lumina_cart_items_v1';
const DISCOUNT_STORAGE_KEY = 'lumina_cart_discount_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedItems = localStorage.getItem(CART_STORAGE_KEY);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
        const storedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
        if (storedDiscount) {
          setAppliedDiscount(JSON.parse(storedDiscount));
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        if (appliedDiscount) {
          localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(appliedDiscount));
        } else {
          localStorage.removeItem(DISCOUNT_STORAGE_KEY);
        }
      }
    } catch {
      // Ignore
    }
  }, [items, appliedDiscount, isInitialized]);

  const summary = useMemo(() => {
    return calculateOrderSummary(items, appliedDiscount);
  }, [items, appliedDiscount]);

  const addItem = (input: AddItemInput) => {
    const isSub = Boolean(input.isSubscription);
    const weightGrams =
      input.weightGrams ||
      (input.weight === '200g'
        ? 200
        : input.weight === '250g'
        ? 250
        : input.weight === '500g'
        ? 500
        : 1000);

    const unitPrice = calculateItemUnitPrice(input.basePrice250g, input.weight, isSub);
    const lineItemId = generateLineItemId({
      slug: input.slug,
      weight: input.weight,
      grind: input.grind,
      isSubscription: isSub,
      subscriptionFrequency: input.subscriptionFrequency,
    });

    const addQty = input.quantity && input.quantity > 0 ? input.quantity : 1;

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.id === lineItemId);
      if (existingIdx >= 0) {
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + addQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: lineItemId,
        productId: input.productId,
        slug: input.slug,
        name: input.name,
        origin: input.origin,
        roastLevel: input.roastLevel,
        imageUrl: input.imageUrl,
        weight: input.weight,
        weightGrams,
        grind: input.grind,
        basePrice250g: input.basePrice250g,
        unitPrice,
        quantity: addQty,
        isSubscription: isSub,
        subscriptionFrequency: input.subscriptionFrequency,
        subscriptionDiscountPercent: isSub ? 10 : 0,
      };

      return [...prevItems, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const updateVariant = (
    itemId: string,
    updates: { weight?: PackageWeight; grind?: GrindOption }
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newWeight = updates.weight || item.weight;
        const newGrind = updates.grind || item.grind;
        const newWeightGrams =
          newWeight === '200g'
            ? 200
            : newWeight === '250g'
            ? 250
            : newWeight === '500g'
            ? 500
            : 1000;
        const newUnitPrice = calculateItemUnitPrice(
          item.basePrice250g,
          newWeight,
          item.isSubscription
        );
        const newId = generateLineItemId({
          slug: item.slug,
          weight: newWeight,
          grind: newGrind,
          isSubscription: item.isSubscription,
          subscriptionFrequency: item.subscriptionFrequency,
        });

        return {
          ...item,
          id: newId,
          weight: newWeight,
          weightGrams: newWeightGrams,
          grind: newGrind,
          unitPrice: newUnitPrice,
        };
      })
    );
  };

  const applyDiscountCode = (code: string) => {
    const res = validatePromoCode(code, summary.grossSubtotal);
    if (res.valid && res.discount) {
      setAppliedDiscount(res.discount);
      return { success: true, message: res.message || 'Discount applied!' };
    }
    return { success: false, message: res.message || 'Invalid coupon code.' };
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscount(null);
  };

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const value = {
    items,
    isOpen,
    appliedDiscount,
    summary,
    addItem: addItem as any,
    removeItem,
    updateQuantity,
    updateVariant,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
    setIsOpen,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
`);
write('src/components/layout/Header.tsx', `'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, Flame, Compass, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from './Container';
import { Drawer } from '@/components/ui/Drawer';
import { CartContext } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onOpenCartwrite('src/components/cart/CartItemRow.tsx', `'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, RefreshCw } from 'lucide-react';
import { CartItem } from '@/types/cart';
import { Badge } from '@/components/ui/Badge';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-3.5 py-4 border-b border-border-subtle/80 last:border-b-0">
      {/* Thumbnail */}
      <Link
        href={'/coffee/' + item.slug}
        className="relative w-16 h-20 rounded-lg overflow-hidden bg-espresso-900 flex-shrink-0 border border-subtle group"
      >
        <Image
          src={item.imageUrl || '/images/coffees/ethiopia-chelbesa.jpg'}
          alt={item.name}
          fill
          sizes="64px"
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </Link>

      {/* Details & Meta */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={'/coffee/' + item.slug}
              className="font-serif font-bold text-sm text-espresso-950 hover:text-terracotta-600 transition-colors line-clamp-1"
            >
              {item.name}
            </Link>
            <span className="font-mono font-semibold text-sm text-espresso-950 flex-shrink-0">
              ${lineTotal.toFixed(2)}
            </span>
          </div>

          {/* Specifications */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <Badge variant="neutral" size="sm" className="text-[10px] py-0">
              {item.weight}
            </Badge>
            <Badge variant="neutral" size="sm" className="text-[10px] py-0 capitalize">
              {item.grind.replace(/_/g, ' ')}
            </Badge>
            {item.isSubscription && (
              <Badge variant="accent" size="sm" className="text-[10px] py-0 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{item.subscriptionFrequency || 'Monthly'} (10% off)</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center border border-border-medium rounded-md bg-surface">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id , item.quantity - 1)}
              aria-label="Decrease quantity"
              className="p-1 text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600 transition-colors rounded-l-md focus-ring"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 text-xs font-mono font-semibold text-espresso-950">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="p-1 text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600 transition-colors rounded-r-md focus-ring"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={'Remove ' + item.name + ' from cart'}
            className="text-charcoal-400 hover:text-terracotta-600 transition-colors p-1 rounded focus-ring"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
`);

write('src/components/cart/PromoCodeInput.tsx', `'use client';

import React, { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { AppliedDiscount } from '@/types/cart';
import { Button } from '@/components/ui/Button';

export interface PromoCodeInputProps {
  appliedDiscount: AppliedDiscount | null;
  onApply: (code: string) => { success: boolean; message: string };
  onRemove: () => void;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  appliedDiscount,
  onApply,
  onRemove,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!code.trim()) return;

    const result = onApply(code.trim());
    if (result.success ) {
      setSuccessMsg(result.message);
      setCode('');
    } else {
      setError(result.message);
    }
  };

  if (appliedDiscount) {
    return (
      <div className="p-3 rounded-lg bg-olive-50 border border-olive-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-olive-700" />
          <div>
            <p className="text-xs font-mono font-bold text-olive-800">
              {appliedDiscount.code}
            </p>
            <p className="text-[11px] text-olive-700">
              {appliedDiscount.description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove promo code"
          className="p-1 text-olive-600 hover:text-terracotta-600 transition-colors rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Promo code (e.g. ROASTMASTER10)"
          className="flex-1 text-xs font-mono px-3 py-2 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
        />
        <Button type="submit" variant="secondary" size="sm">
          Apply
        </Button>
      </div>
      {error && <p className="text-[11px] text-terracotta-600">{error}</p>}
      {successMsg && <p className="text-[11px] text-olire-700">{successMsg}</p>}
    </form>
  );
};
`);
write('src/components/cart/WhatsAppCheckoutModal.tsx', `'use client';

import React, { useState } from 'react';
import { MessageCircle, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CartItem, AppliedDiscount, OrderPricingSummary } from '@/types/cart';
import { CreateOrderPayload } from '@/types/order';

export interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  summary: OrderPricingSummary;
  appliedDiscount: AppliedDiscount | null;
  onOrderSuccess?: (orderId: string) => void;
}

const WHATSAPP_PHONE_NUMBER = '15550198422';

export const WhatsAppCheckoutModal: React.FC<WhatsAppCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  summary,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.targe.name]: e.targe.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.email || !formData.street || !formData.city) {
      setError('Please fill in all required contact and delivery fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload: CreateOrderPayload = {
        channel: 'whatsapp',
        source: 'WhatsApp Direct',
        paymentMethod: 'whatsapp_manual',
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim() || '',
          email: formData.email.trim(),
          phone: formData.phone.trim() || '+1 (555) 019-8422',
        },
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim() || 'WA',
          postalCode: formData.postalCode.trim() || '98101',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          origin: i.origin,
          roastLevel: i.roastLevel,
          weight: i.weight,
          weightGrams: i.weightGrams,
          grind: i.grind,
          basePrice250g: i.basePrice250g,
          quantity: i.quantity,
          isSubscription: i.isSubscription,
          subscriptionFrequency: i.subscriptionFrequency,
        })),
        appliedDiscountCode: appliedDiscount?.code,
        notes: formData.notes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create WhatsApp order');
      }

      const createdOrder = data.order;

      // Construct WhatsApp message
      const itemsText = items
        .map(
          (i) =>
            `• *${i.quantity}x ${i.name}* (${i.weight}, ${i.grind.replace(/_/g, ' ')}) - $${(i.unitPrice * i.quantity).toFixed(2)}${write('src/components/cart/CartDrawer.tsx', `'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Sparkles, Truck, MessageCircle, Trash2, Lock } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { CartItemRow } from './CartItemRow';
import { PromoCodeInput } from './PromoCodeInput';
import { WhatsAppCheckoutModal } from './WhatsAppCheckoutModal';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    items,
    isOpen,
    setIsOpen,
    summary,
    appliedDiscount,
    updateQuantity,
    removeItem,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
  } = useCart();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const freeShippingThreshold = 50;
  const amountForFreeShipping = Math.max(
    0,
    freeShippingThreshold - summary.grossSubtotal
  );
  const progressPercent = Math.min(
    100,
    (summary.grossSubtotal / freeShippingThreshold) * 100
  );

  const handleCheckoutClick = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        side="right"
        size="md"
        title={'Your Roastery Cart (' + summary.itemsCount + ')'}
        description="Fresh micro-batch coffees scheduled for roast"
      >
        {/* Free Shipping Threshold Progress */}
        <div className="p-3.5 bg-cream-500 rounded-lg border border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="flex items-center gap-1.5 font-medium text-espresso-950">
              <Truck className="w-4 h-4 text-terracotta-600" />
              {amountForFreeShipping <= 0 ? (
                <span className="text-olive-700 font-semibold">
                  You qualify for FREE Standard Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-terracotta-600">${amountForFreeShipping.toFixed(2)}</strong> more for FREE shipping
                </span>
              )}
            </span>
            <span className="font-mono text-charcoal-500">
              ${summary.grossSubtotal.toFixed(0)} / $50
            </span>
          </div>
          <div className="w-full h-1.5 bg-cream-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto pr-1 my-2">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-cream-500 text-charcoal-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-lg text-espresso-950">
                Your cart is empty
              </h4>
              <p className="text-xs text-charcoal-500 font-sans max-w-xs mx-auto">
                Explore our single-origin lots and artisan blends to begin your order.
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/catalog');
                  }}
                >
                  Browse Coffee Catalog
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle/50">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        {items.length > 0 && (
          <div className="border-t border-border-subtle pt-4 space-y-4">
            {/* Promo Code Input */}
            <PromoCodeInput
              appliedDiscount={appliedDiscount}
              onApply={applyDiscountCode}
              onRemove={removeDiscountCode}
            />

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-charcoal-600">
                <span>Gross Subtotal</span>
                <span className="font-mono text-espresso-900">
                  ${summary.grossSubtotal.toFixed(2)}
                </span>
              </div>

              {summary.subscriptionSavings > 0 && (
                <div className="flex justify-between text-terracotta-600 font-medium">
                  <span>Subscription Savings (10%)</span>
                  <span className="font-mono">
                    -${summary.subscriptionSavings.toFixed(2)}
                  </span>
                </div>
              )}

              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-olive-600 font-medium">
                  <span>Promo Discount ({appliedDiscount?.code})</span>
                  <span className="font-mono">
                    -${summary.couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Shipping</span>
                <span className="font-mono text-espresso-900">
                  {summary.shippingFee === 0 ? (
                    <span className="text-olive-700 font-bold">FREE</span>
                  ) : (
                    `$${summary.shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-mono text-espresso-900">
                  ${summary.tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-base font-serif font-bold text-espresso-950 pt-2 border-t border-subtle">
                <span>Grand Total</span>
                <span className="font-mono text-terracotta-600 font-sans font-bold">
                  ${summary.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dual Checkout Actions */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckoutClick}
                className="flex items-center justify-center gap-2 shadow-elevated"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="success"
                size="md"
                fullWidth
                onClick={() => setIsWhatsAppOpen(true)}
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Direct</span>
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-charcoal-400 hover:text-terracotta-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Entire Cart</span>
                </button>
                <span className="text-[10px] text-charcoal-400">
                  ⚒ Safe & Secure Checkout
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* WhatsApp Checkout Modal */}
      <WhatsAppCheckoutModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        items={items}
        summary={summary}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={(orderId) => {
          clearCart();
          setIsOpen(false);
          router.push('/order-confirmation/' + orderId);
        }}
      />
    </>
  );
};
`);

write('src/components/cart/index.ts', `export * from './CartItemRow';
export * from './PromoCodeInput';
export * from './WhatsAppCheckoutModal';
export * from './CartDrawer';
`);
write('src/components/checkout/PaymentSimulator.tsx', `'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaymentSimulatorProps {
  onPaymentValidChange?: (isValid: boolean, details: { cardNumber: string; cardHolder: string; expiry: string; status: 'valid' | 'declined' }) => void;
}

export const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({
  onPaymentValidChange