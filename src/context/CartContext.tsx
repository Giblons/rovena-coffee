'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  CartItem,
  CartState,
  CartSummary,
  AppliedDiscount,
  SubscriptionFrequency,
} from '@/types/cart';
import { PackageWeight, GrindOption, getWeightMultiplier } from '@/types/coffee';

const CART_STORAGE_KEY = 'lumina_cart_items_v1';
const DISCOUNT_STORAGE_KEY = 'lumina_cart_discount_v1';

export type CartContextValue = CartState;

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const generateLineItemId = (item: {
  productId?: string;
  slug?: string;
  weight: string;
  grind: string;
  isSubscription?: boolean;
  subscriptionFrequency?: string;
}): string => {
  const slugOrId = item.slug || item.productId || 'coffee';
  const parts = [
    slugOrId,
    item.weight,
    item.grind,
    item.isSubscription ? `sub_${item.subscriptionFrequency || 'monthly'}` : 'onetime',
  ];
  return parts.join('__');
};

const calculateUnitPrice = (
  basePrice250g: number,
  weight: PackageWeight,
  isSubscription: boolean
): { unitPrice: number; subscriptionDiscountPercent: number } => {
  const multiplier = getWeightMultiplier(weight);
  const regularPrice = basePrice250g * multiplier;
  const subscriptionDiscountPercent = isSubscription ? 10 : 0;
  const unitPrice = isSubscription ? Number((regularPrice * 0.9).toFixed(2)) : Number(regularPrice.toFixed(2));
  return { unitPrice, subscriptionDiscountPercent };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      const storedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
      if (storedDiscount) {
        setAppliedDiscount(JSON.parse(storedDiscount));
      }
    } catch {
      // localStorage may be unavailable or disabled
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedDiscount) {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(appliedDiscount));
      } else {
        localStorage.removeItem(DISCOUNT_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedDiscount, isInitialized]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'id' | 'unitPrice' | 'subscriptionDiscountPercent'>) => {
      setItems((prevItems) => {
        const lineId = generateLineItemId(newItem);
        const { unitPrice, subscriptionDiscountPercent } = calculateUnitPrice(
          newItem.basePrice250g,
          newItem.weight,
          newItem.isSubscription
        );

        const existingIndex = prevItems.findIndex((i) => i.id === lineId);
        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
          };
          return updated;
        }

        const cartItem: CartItem = {
          ...newItem,
          id: lineId,
          unitPrice,
          subscriptionDiscountPercent,
        };
        return [...prevItems, cartItem];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }
      return prev.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    });
  }, []);

  const updateVariant = useCallback(
    (itemId: string, updates: { weight?: PackageWeight; grind?: GrindOption }) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === itemId);
        if (!item) return prev;

        const nextWeight = updates.weight || item.weight;
        const nextGrind = updates.grind || item.grind;
        const weightGramsMap: Record<PackageWeight, number> = {
          '200g': 200,
          '250g': 250,
          '500g': 500,
          '1kg': 1000,
        };
        const nextWeightGrams = weightGramsMap[nextWeight] || 250;

        const { unitPrice, subscriptionDiscountPercent } = calculateUnitPrice(
          item.basePrice250g,
          nextWeight,
          item.isSubscription
        );

        const nextId = generateLineItemId({
          productId: item.productId,
          slug: item.slug,
          weight: nextWeight,
          grind: nextGrind,
          isSubscription: item.isSubscription,
          subscriptionFrequency: item.subscriptionFrequency,
        });

        // Filter out old item
        const others = prev.filter((i) => i.id !== itemId);
        const existingNext = others.find((i) => i.id === nextId);

        if (existingNext) {
          return others.map((i) =>
            i.id === nextId ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }

        return [
          ...others,
          {
            ...item,
            id: nextId,
            weight: nextWeight,
            weightGrams: nextWeightGrams,
            grind: nextGrind,
            unitPrice,
            subscriptionDiscountPercent,
          },
        ];
      });
    },
    []
  );

  const applyDiscountCode = useCallback((code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'ROASTMASTER10' || cleanCode === 'WELCOME10') {
      setAppliedDiscount({
        code: cleanCode,
        type: 'percentage',
        value: 10,
        description: '10% Roastery Discount',
      });
      return { success: true, message: '10% discount applied!' };
    }
    if (cleanCode === 'FREESHIP') {
      setAppliedDiscount({
        code: 'FREESHIP',
        type: 'free_shipping',
        value: 0,
        description: 'Free Roastery Shipping',
      });
      return { success: true, message: 'Free shipping coupon applied!' };
    }
    if (cleanCode === 'ROASTER20') {
      setAppliedDiscount({
        code: 'ROASTER20',
        type: 'percentage',
        value: 20,
        description: '20% Roaster VIP Discount',
        minOrderValue: 40,
      });
      return { success: true, message: '20% VIP discount applied!' };
    }
    return { success: false, message: 'Invalid promo code' };
  }, []);

  const removeDiscountCode = useCallback(() => {
    setAppliedDiscount(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedDiscount(null);
  }, []);

  // Summary Recalculation
  const summary: CartSummary = useMemo(() => {
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalGrams = items.reduce((sum, item) => sum + item.weightGrams * item.quantity, 0);

    const grossSubtotal = items.reduce((sum, item) => {
      const regularPrice = item.basePrice250g * getWeightMultiplier(item.weight);
      return sum + regularPrice * item.quantity;
    }, 0);

    const netSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const subscriptionSavings = Math.max(0, grossSubtotal - netSubtotal);

    let couponDiscount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        couponDiscount = (netSubtotal * appliedDiscount.value) / 100;
      } else if (appliedDiscount.type === 'fixed') {
        couponDiscount = Math.min(netSubtotal, appliedDiscount.value);
      }
    }

    const freeShippingThreshold = 50.0;
    const isFreeShippingByCoupon = appliedDiscount?.type === 'free_shipping';
    const isFreeShippingByThreshold = netSubtotal >= freeShippingThreshold;
    const shippingFee = items.length === 0 || isFreeShippingByCoupon || isFreeShippingByThreshold ? 0.0 : 5.0;

    const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);
    const taxableAmount = Math.max(0, netSubtotal - couponDiscount);
    const tax = Number((taxableAmount * 0.08).toFixed(2));
    const grandTotal = Number((taxableAmount + shippingFee + tax).toFixed(2));

    return {
      itemsCount,
      totalGrams,
      grossSubtotal: Number(grossSubtotal.toFixed(2)),
      subscriptionSavings: Number(subscriptionSavings.toFixed(2)),
      netSubtotal: Number(netSubtotal.toFixed(2)),
      couponDiscount: Number(couponDiscount.toFixed(2)),
      shippingFee,
      tax,
      grandTotal,
      freeShippingThreshold,
      amountNeededForFreeShipping: Number(amountNeededForFreeShipping.toFixed(2)),
    };
  }, [items, appliedDiscount]);

  const value: CartContextValue = {
    items,
    isOpen,
    appliedDiscount,
    summary,
    addItem,
    removeItem,
    updateQuantity,
    updateVariant,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
    openCart,
    closeCart,
    setIsOpen,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
