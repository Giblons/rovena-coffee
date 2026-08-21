import { describe, it, expect } from 'vitest';
import {
  calculateItemUnitPrice,
  calculateOrderSummary,
  WEIGHT_OPTIONS,
  SUBSCRIPTION_DISCOUNT_PERCENT,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  EXPRESS_SHIPPING_FEE,
  TAX_RATE,
  validatePromoCode,
} from '@/lib/pricing';
import { CartItem, AppliedDiscount } from '@/types/cart';

describe('Pricing Engine — Unit Tests (Tier 1 & Tier 2)', () => {
  describe('Tier 1: Weight Tiers and Base Price Multipliers', () => {
    it('should define all 4 required weight tiers (200g, 250g, 500g, 1kg)', () => {
      const weights = WEIGHT_OPTIONS.map((w) => w.weightGrams);
      expect(weights).toContain(200);
      expect(weights).toContain(250);
      expect(weights).toContain(500);
      expect(weights).toContain(1000);
      expect(WEIGHT_OPTIONS.length).toBe(4);
    });

    it('should correctly calculate base price for 250g (multiplier 1.0)', () => {
      const basePrice = 20.0;
      const price250g = calculateItemUnitPrice(basePrice, 250, false);
      expect(price250g).toBe(20.0);
    });

    it('should correctly calculate 200g sample price (multiplier 0.85)', () => {
      const basePrice = 20.0;
      const price200g = calculateItemUnitPrice(basePrice, 200, false);
      expect(price200g).toBe(17.0); // 20 * 0.85 = 17.00
    });

    it('should correctly calculate 500g price with volume discount multiplier', () => {
      const basePrice = 20.0;
      const price500g = calculateItemUnitPrice(basePrice, 500, false);
      const expectedOption = WEIGHT_OPTIONS.find((w) => w.weightGrams === 500);
      expect(expectedOption).toBeDefined();
      const expectedPrice = Math.round(basePrice * expectedOption!.multiplier * 100) / 100;
      expect(price500g).toBe(expectedPrice);
      // Volume savings check: 500g should cost less than 2x 250g bags ($40)
      expect(price500g).toBeLessThan(basePrice * 2);
    });

    it('should correctly calculate 1kg (1000g) price with volume discount multiplier', () => {
      const basePrice = 20.0;
      const price1kg = calculateItemUnitPrice(basePrice, 1000, false);
      const expectedOption = WEIGHT_OPTIONS.find((w) => w.weightGrams === 1000);
      expect(expectedOption).toBeDefined();
      const expectedPrice = Math.round(basePrice * expectedOption!.multiplier * 100) / 100;
      expect(price1kg).toBe(expectedPrice);
      // Volume savings check: 1kg should cost less than 4x 250g bags ($80)
      expect(price1kg).toBeLessThan(basePrice * 4);
    });

    it('should accept PackageWeight string representations ("200g", "250g", "500g", "1kg")', () => {
      const basePrice = 24.0;
      expect(calculateItemUnitPrice(basePrice, '200g', false)).toBe(calculateItemUnitPrice(basePrice, 200, false));
      expect(calculateItemUnitPrice(basePrice, '250g', false)).toBe(calculateItemUnitPrice(basePrice, 250, false));
      expect(calculateItemUnitPrice(basePrice, '500g', false)).toBe(calculateItemUnitPrice(basePrice, 500, false));
      expect(calculateItemUnitPrice(basePrice, '1kg', false)).toBe(calculateItemUnitPrice(basePrice, 1000, false));
    });
  });

  describe('Tier 1: Subscription Discount Calculations (10% Off)', () => {
    it('should have subscription discount constant set to 10%', () => {
      expect(SUBSCRIPTION_DISCOUNT_PERCENT).toBe(10);
    });

    it('should apply 10% discount on individual recurring items', () => {
      const basePrice = 20.0;
      const oneTimePrice = calculateItemUnitPrice(basePrice, 250, false);
      const subscriptionPrice = calculateItemUnitPrice(basePrice, 250, true);

      expect(oneTimePrice).toBe(20.0);
      expect(subscriptionPrice).toBe(18.0); // 20 - 10% = 18.00
    });

    it('should apply 10% discount across all weight variants when subscribed', () => {
      const basePrice = 22.5; // e.g. Ethiopia Chelbesa
      const sub200g = calculateItemUnitPrice(basePrice, 200, true);
      const sub250g = calculateItemUnitPrice(basePrice, 250, true);
      const sub500g = calculateItemUnitPrice(basePrice, 500, true);
      const sub1kg = calculateItemUnitPrice(basePrice, 1000, true);

      const raw200g = calculateItemUnitPrice(basePrice, 200, false);
      const raw250g = calculateItemUnitPrice(basePrice, 250, false);
      const raw500g = calculateItemUnitPrice(basePrice, 500, false);
      const raw1kg = calculateItemUnitPrice(basePrice, 1000, false);

      expect(sub200g).toBe(Math.round(raw200g * 0.9 * 100) / 100);
      expect(sub250g).toBe(Math.round(raw250g * 0.9 * 100) / 100);
      expect(sub500g).toBe(Math.round(raw500g * 0.9 * 100) / 100);
      expect(sub1kg).toBe(Math.round(raw1kg * 0.9 * 100) / 100);
    });

    it('should calculate subscription savings in order summary for mixed baskets', () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          productId: 'ethiopia-chelbesa',
          slug: 'ethiopia-chelbesa',
          name: 'Ethiopia Chelbesa',
          origin: 'Ethiopia',
          roastLevel: 'Light',
          imageUrl: '/images/coffee/ethiopia.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'whole_bean',
          basePrice250g: 20.0,
          unitPrice: 20.0,
          quantity: 2,
          isSubscription: true,
          subscriptionFrequency: 'biweekly',
          subscriptionDiscountPercent: 10,
        },
        {
          id: 'item-2',
          productId: 'colombia-el-paraiso',
          slug: 'colombia-el-paraiso',
          name: 'Colombia El Paraiso',
          origin: 'Colombia',
          roastLevel: 'Light',
          imageUrl: '/images/coffee/colombia.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'v60_drip',
          basePrice250g: 26.0,
          unitPrice: 26.0,
          quantity: 1,
          isSubscription: false,
          subscriptionDiscountPercent: 0,
        },
      ];

      const summary = calculateOrderSummary(items, null);

      // Gross subtotal = 2 * 20.00 + 1 * 26.00 = 66.00
      expect(summary.grossSubtotal).toBe(66.0);
      // Subscription savings on item 1 = 2 * (20.00 * 0.10) = 4.00
      expect(summary.subscriptionSavings).toBe(4.0);
      // Net subtotal = 2 * 18.00 + 1 * 26.00 = 62.00
      expect(summary.netSubtotal).toBe(62.0);
      // Net subtotal >= 50, so qualifies for free shipping
      expect(summary.shippingFee).toBe(0);
    });
  });

  describe('Tier 1: Promo Code Discounts', () => {
    const mockItems: CartItem[] = [
      {
        id: 'item-1',
        productId: 'kenya-aa',
        slug: 'kenya-aa',
        name: 'Kenya Nyeri AA',
        origin: 'Kenya',
        roastLevel: 'Light',
        imageUrl: '/img.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'whole_bean',
        basePrice250g: 20.0,
        unitPrice: 20.0,
        quantity: 2,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
      },
    ]; // Net subtotal = $40.00

    it('should validate and apply ROASTMASTER10 (10% percentage discount)', () => {
      const promoResult = validatePromoCode('ROASTMASTER10', 40.0);
      expect(promoResult.valid).toBe(true);
      expect(promoResult.discount?.type).toBe('percentage');
      expect(promoResult.discount?.value).toBe(10);

      const summary = calculateOrderSummary(mockItems, promoResult.discount);
      expect(summary.couponDiscount).toBe(4.0); // 10% of $40.00 = $4.00
      // Subtotal after coupon = 40.00 - 4.00 = 36.00 (< 50 => shipping applies)
      expect(summary.shippingFee).toBe(STANDARD_SHIPPING_FEE);
    });

    it('should validate FIRSTSIP (15% off with min subtotal $30.00)', () => {
      // Subtotal $40 >= $30 -> valid
      const validPromo = validatePromoCode('FIRSTSIP', 40.0);
      expect(validPromo.valid).toBe(true);
      expect(validPromo.discount?.type).toBe('percentage');
      expect(validPromo.discount?.value).toBe(15);

      const summary = calculateOrderSummary(mockItems, validPromo.discount);
      expect(summary.couponDiscount).toBe(6.0); // 15% of $40.00 = $6.00

      // Subtotal $20 < $30 -> invalid
      const invalidPromo = validatePromoCode('FIRSTSIP', 20.0);
      expect(invalidPromo.valid).toBe(false);
      expect(invalidPromo.message).toContain('30');
    });

    it('should validate BARISTA20 ($20 fixed discount with min subtotal $75.00)', () => {
      // Subtotal $80 >= $75 -> valid
      const validPromo = validatePromoCode('BARISTA20', 80.0);
      expect(validPromo.valid).toBe(true);
      expect(validPromo.discount?.type).toBe('fixed');
      expect(validPromo.discount?.value).toBe(20);

      const largeOrder: CartItem[] = [
        { ...mockItems[0], quantity: 4 }, // $80.00
      ];
      const summary = calculateOrderSummary(largeOrder, validPromo.discount);
      expect(summary.couponDiscount).toBe(20.0);
      // Net after coupon = 80 - 20 = 60 (>= 50 -> free shipping)
      expect(summary.shippingFee).toBe(0.0);

      // Subtotal $40 < $75 -> invalid
      const invalidPromo = validatePromoCode('BARISTA20', 40.0);
      expect(invalidPromo.valid).toBe(false);
      expect(invalidPromo.message).toContain('75');
    });

    it('should validate FREESHIP (Free Shipping coupon)', () => {
      const promoResult = validatePromoCode('FREESHIP', 20.0);
      expect(promoResult.valid).toBe(true);
      expect(promoResult.discount?.type).toBe('free_shipping');

      const smallOrder: CartItem[] = [
        { ...mockItems[0], quantity: 1 }, // $20.00 (< $50)
      ];
      const summary = calculateOrderSummary(smallOrder, promoResult.discount);
      expect(summary.shippingFee).toBe(0.0); // Free shipping applied
    });

    it('should reject invalid or unrecognized coupon codes', () => {
      const result = validatePromoCode('FAKEDISCOUNT99', 100.0);
      expect(result.valid).toBe(false);
      expect(result.discount).toBeUndefined();
    });

    it('should handle case-insensitive coupon code inputs', () => {
      expect(validatePromoCode('roastmaster10', 50.0).valid).toBe(true);
      expect(validatePromoCode('  FirstSip  ', 50.0).valid).toBe(true);
      expect(validatePromoCode('freeship', 20.0).valid).toBe(true);
    });
  });

  describe('Tier 2: Boundary Conditions & Financial Precision', () => {
    it('should handle empty cart (0 items, 0 subtotal)', () => {
      const summary = calculateOrderSummary([], null);
      expect(summary.itemsCount).toBe(0);
      expect(summary.totalGrams).toBe(0);
      expect(summary.grossSubtotal).toBe(0.0);
      expect(summary.netSubtotal).toBe(0.0);
      expect(summary.couponDiscount).toBe(0.0);
      expect(summary.shippingFee).toBe(0.0);
      expect(summary.tax).toBe(0.0);
      expect(summary.grandTotal).toBe(0.0);
      expect(summary.amountNeededForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD);
    });

    it('should correctly evaluate the exact $50.00 Free Shipping boundary', () => {
      // Exactly $49.99 (just below threshold)
      const belowItems: CartItem[] = [
        {
          id: 'item-1',
          productId: 'test',
          slug: 'test',
          name: 'Test Coffee',
          origin: 'Origin',
          roastLevel: 'Medium',
          imageUrl: '/img.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'whole_bean',
          basePrice250g: 49.99,
          unitPrice: 49.99,
          quantity: 1,
          isSubscription: false,
          subscriptionDiscountPercent: 0,
        },
      ];
      const summaryBelow = calculateOrderSummary(belowItems, null);
      expect(summaryBelow.shippingFee).toBe(STANDARD_SHIPPING_FEE);
      expect(summaryBelow.amountNeededForFreeShipping).toBe(0.01);

      // Exactly $50.00 (at threshold)
      const exactItems: CartItem[] = [
        { ...belowItems[0], basePrice250g: 50.0, unitPrice: 50.0 },
      ];
      const summaryExact = calculateOrderSummary(exactItems, null);
      expect(summaryExact.shippingFee).toBe(0.0);
      expect(summaryExact.amountNeededForFreeShipping).toBe(0.0);

      // $50.01 (just above threshold)
      const aboveItems: CartItem[] = [
        { ...belowItems[0], basePrice250g: 50.01, unitPrice: 50.01 },
      ];
      const summaryAbove = calculateOrderSummary(aboveItems, null);
      expect(summaryAbove.shippingFee).toBe(0.0);
      expect(summaryAbove.amountNeededForFreeShipping).toBe(0.0);
    });

    it('should cap fixed discounts at netSubtotal to prevent negative totals', () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          productId: 'test',
          slug: 'test',
          name: 'Test Coffee',
          origin: 'Origin',
          roastLevel: 'Medium',
          imageUrl: '/img.jpg',
          weight: '200g',
          weightGrams: 200,
          grind: 'whole_bean',
          basePrice250g: 10.0,
          unitPrice: 10.0,
          quantity: 1,
          isSubscription: false,
          subscriptionDiscountPercent: 0,
        },
      ];
      const discount: AppliedDiscount = {
        code: 'HUGE50',
        type: 'fixed',
        value: 50.0, // $50 off on a $10 order
        description: '$50 off',
      };

      const summary = calculateOrderSummary(items, discount);
      expect(summary.couponDiscount).toBe(10.0); // Capped at $10.00
      expect(summary.netSubtotal - summary.couponDiscount).toBe(0.0);
      expect(summary.grandTotal).toBeGreaterThanOrEqual(0.0);
    });

    it('should support express shipping calculation ($12.00)', () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          productId: 'test',
          slug: 'test',
          name: 'Test Coffee',
          origin: 'Origin',
          roastLevel: 'Medium',
          imageUrl: '/img.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'whole_bean',
          basePrice250g: 60.0,
          unitPrice: 60.0,
          quantity: 1,
          isSubscription: false,
          subscriptionDiscountPercent: 0,
        },
      ];

      const summary = calculateOrderSummary(items, null, 'express');
      expect(summary.shippingFee).toBe(EXPRESS_SHIPPING_FEE);
      expect(EXPRESS_SHIPPING_FEE).toBe(12.0);
    });

    it('should guarantee exact 2-decimal rounding precision across all calculations', () => {
      const items: CartItem[] = [
        {
          id: 'item-1',
          productId: 'test-1',
          slug: 'test-1',
          name: 'Odd Price 1',
          origin: 'Origin',
          roastLevel: 'Light',
          imageUrl: '/img.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'whole_bean',
          basePrice250g: 17.33,
          unitPrice: 17.33,
          quantity: 3,
          isSubscription: true,
          subscriptionDiscountPercent: 10,
        },
      ];

      const discount: AppliedDiscount = {
        code: 'TEST15',
        type: 'percentage',
        value: 15,
        description: '15% off',
      };

      const summary = calculateOrderSummary(items, discount);

      const decimalCount = (num: number) => {
        const str = num.toString();
        if (!str.includes('.')) return 0;
        return str.split('.')[1].length;
      };

      expect(decimalCount(summary.grossSubtotal)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.subscriptionSavings)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.netSubtotal)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.couponDiscount)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.shippingFee)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.tax)).toBeLessThanOrEqual(2);
      expect(decimalCount(summary.grandTotal)).toBeLessThanOrEqual(2);
    });
  });
});
