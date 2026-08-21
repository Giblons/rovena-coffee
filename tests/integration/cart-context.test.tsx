import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, generateLineItemId } from '@/context/CartContext';
import { CartItem } from '@/types/cart';

describe('Cart Context & State Engine — Integration Tests (Tier 3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  const mockItem1 = {
    productId: 'ethiopia-yirgacheffe-chelbesa',
    slug: 'ethiopia-yirgacheffe-chelbesa',
    name: 'Ethiopia Yirgacheffe Chelbesa',
    origin: 'Ethiopia',
    roastLevel: 'Light' as const,
    imageUrl: '/images/coffee/ethiopia.jpg',
    weight: '250g' as const,
    weightGrams: 250,
    grind: 'whole_bean' as const,
    basePrice250g: 22.5,
    quantity: 1,
    isSubscription: false,
  };

  describe('Tier 3: Composite Line-Item Keying', () => {
    it('should generate unique deterministic composite keys based on slug, weight, grind, and frequency', () => {
      const oneTimeKey = generateLineItemId({
        slug: 'ethiopia-chelbesa',
        weight: '250g',
        grind: 'whole_bean',
        isSubscription: false,
      });

      const weeklySubKey = generateLineItemId({
        slug: 'ethiopia-chelbesa',
        weight: '250g',
        grind: 'whole_bean',
        isSubscription: true,
        subscriptionFrequency: 'weekly',
      });

      const grindDiffKey = generateLineItemId({
        slug: 'ethiopia-chelbesa',
        weight: '250g',
        grind: 'v60_drip',
        isSubscription: false,
      });

      const weightDiffKey = generateLineItemId({
        slug: 'ethiopia-chelbesa',
        weight: '500g',
        grind: 'whole_bean',
        isSubscription: false,
      });

      expect(oneTimeKey).not.toBe(weeklySubKey);
      expect(oneTimeKey).not.toBe(grindDiffKey);
      expect(oneTimeKey).not.toBe(weightDiffKey);
      expect(oneTimeKey).toContain('ethiopia-chelbesa');
      expect(oneTimeKey).toContain('250g');
    });

    it('should merge quantities when adding identical variant configurations', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].quantity).toBe(1);

      // Add identical item again
      act(() => {
        result.current.addItem({ ...mockItem1, quantity: 2 });
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it('should create separate line items when adding same coffee with different grind options', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
        result.current.addItem({
          ...mockItem1,
          grind: 'v60_drip',
        });
      });

      expect(result.current.items.length).toBe(2);
      expect(result.current.items[0].grind).toBe('whole_bean');
      expect(result.current.items[1].grind).toBe('v60_drip');
    });

    it('should create separate line items when adding same coffee with different weights', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
        result.current.addItem({
          ...mockItem1,
          weight: '500g',
          weightGrams: 500,
        });
      });

      expect(result.current.items.length).toBe(2);
      expect(result.current.items[0].weight).toBe('250g');
      expect(result.current.items[1].weight).toBe('500g');
    });
  });

  describe('Tier 3: Cart Actions & State Mutations', () => {
    it('should add item and calculate correct unit price and subtotal', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].unitPrice).toBe(22.5);
      expect(result.current.summary.grossSubtotal).toBe(22.5);
      expect(result.current.summary.itemsCount).toBe(1);
    });

    it('should increment and decrement item quantities', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
      });

      const itemId = result.current.items[0].id;

      act(() => {
        result.current.updateQuantity(itemId, 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.summary.grossSubtotal).toBe(67.5);

      act(() => {
        result.current.updateQuantity(itemId, 2);
      });

      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.summary.grossSubtotal).toBe(45.0);
    });

    it('should auto-remove item when quantity is decremented to 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
      });

      const itemId = result.current.items[0].id;

      act(() => {
        result.current.updateQuantity(itemId, 0);
      });

      expect(result.current.items.length).toBe(0);
      expect(result.current.summary.itemsCount).toBe(0);
    });

    it('should remove item explicitly via removeItem', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
      });

      const itemId = result.current.items[0].id;

      act(() => {
        result.current.removeItem(itemId);
      });

      expect(result.current.items.length).toBe(0);
    });

    it('should apply valid promo discount code and update totals', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem({ ...mockItem1, quantity: 2 }); // $45.00
      });

      let promoResult: { success: boolean; message: string };
      act(() => {
        promoResult = result.current.applyDiscountCode('ROASTMASTER10');
      });

      expect(promoResult!.success).toBe(true);
      expect(result.current.appliedDiscount?.code).toBe('ROASTMASTER10');
      expect(result.current.summary.couponDiscount).toBe(4.5); // 10% of 45 = 4.50
    });

    it('should remove applied promo discount code', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
        result.current.applyDiscountCode('ROASTMASTER10');
      });

      expect(result.current.appliedDiscount).not.toBeNull();

      act(() => {
        result.current.removeDiscountCode();
      });

      expect(result.current.appliedDiscount).toBeNull();
      expect(result.current.summary.couponDiscount).toBe(0);
    });

    it('should clear all items and reset discount on clearCart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem1);
        result.current.applyDiscountCode('ROASTMASTER10');
      });

      expect(result.current.items.length).toBe(1);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items.length).toBe(0);
      expect(result.current.appliedDiscount).toBeNull();
      expect(result.current.summary.itemsCount).toBe(0);
    });

    it('should toggle and set cart drawer open/close state', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setIsOpen(false);
      });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
