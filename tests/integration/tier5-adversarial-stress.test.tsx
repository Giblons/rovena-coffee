import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, generateLineItemId } from '@/context/CartContext';
import {
  calculateItemUnitPrice,
  calculateOrderSummary,
  validatePromoCode,
  calculateCartTotals,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  EXPRESS_SHIPPING_FEE,
  TAX_RATE,
} from '@/lib/pricing';
import {
  calculateBrewYield,
  calculateBloomWater,
  computeBrewMetrics,
  getBrewMethodConfig,
  BREW_METHODS,
} from '@/lib/brew-calculator';
import {
  generateWhatsAppOrderUrl,
  formatWhatsAppOrderMessage,
  DEFAULT_ROASTERY_PHONE,
  WhatsAppOrderDetails,
} from '@/lib/whatsapp';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getInventory,
  adjustInventory,
  restockGreenInventory,
  resetDbState,
  inventoryRepository,
} from '@/lib/db';
import { filterAndSortCoffees, DEFAULT_FILTER_STATE } from '@/lib/catalog-filter';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import { CreateOrderPayload } from '@/types/order';
import { PackageWeight, GrindOption, getWeightMultiplier } from '@/types/coffee';

describe('Tier 5 White-Box Adversarial Stress Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDbState();
  });

  const cartWrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  // =========================================================================
  // 1. EXTREME INPUTS & BOUNDARY STRESS
  // =========================================================================
  describe('Dimension 1: Extreme Inputs & Boundary Stress', () => {
    it('handles extreme quantities (large numbers, zero, single item) in pricing calculation', () => {
      // 10,000 units of 1kg bag ($20 base * 3.45 multiplier = $69.00 unit price)
      const summaryLarge = calculateOrderSummary([
        {
          id: 'apex-1kg-large',
          productId: 'lumina-apex-house-espresso-blend',
          slug: 'lumina-apex-house-espresso-blend',
          name: 'Apex Blend',
          origin: 'Blend',
          roastLevel: 'Medium',
          imageUrl: '/test.jpg',
          weight: '1kg',
          weightGrams: 1000,
          grind: 'whole_bean',
          basePrice250g: 20.0,
          unitPrice: 69.0,
          quantity: 10000,
          isSubscription: false,
          subscriptionDiscountPercent: 0,
        },
      ]);

      expect(summaryLarge.itemsCount).toBe(10000);
      expect(summaryLarge.totalGrams).toBe(10000000);
      expect(summaryLarge.grossSubtotal).toBe(690000.0);
      expect(summaryLarge.netSubtotal).toBe(690000.0);
      expect(summaryLarge.shippingFee).toBe(0.0); // Over $50
      expect(summaryLarge.tax).toBe(55200.0); // 8% of 690,000
      expect(summaryLarge.grandTotal).toBe(745200.0);
    });

    it('handles empty items array gracefully in pricing calculation', () => {
      const summaryEmpty = calculateOrderSummary([]);
      expect(summaryEmpty.itemsCount).toBe(0);
      expect(summaryEmpty.totalGrams).toBe(0);
      expect(summaryEmpty.grossSubtotal).toBe(0);
      expect(summaryEmpty.netSubtotal).toBe(0);
      expect(summaryEmpty.couponDiscount).toBe(0);
      expect(summaryEmpty.shippingFee).toBe(0);
      expect(summaryEmpty.tax).toBe(0);
      expect(summaryEmpty.grandTotal).toBe(0);
      expect(summaryEmpty.amountNeededForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD);
    });

    it('handles extreme brew calculator doses (0g, negative doses, massive 10kg dose)', () => {
      // 0g dose
      const yieldZero = calculateBrewYield(0, 16.0);
      expect(yieldZero.waterGrams).toBe(0);
      expect(yieldZero.estimatedYieldMl).toBe(0);
      expect(yieldZero.coffeeDoseGrams).toBe(0);

      // Negative dose
      const yieldNeg = calculateBrewYield(-20, 16.0);
      expect(yieldNeg.waterGrams).toBe(0);
      expect(yieldNeg.estimatedYieldMl).toBe(0);
      expect(yieldNeg.coffeeDoseGrams).toBe(0);

      // Bloom on 0g or negative dose
      expect(calculateBloomWater(0)).toBe(0);
      expect(calculateBloomWater(-15)).toBe(0);

      // 10,000g (10kg) batch brew
      const yieldMassive = calculateBrewYield(10000, 16.0);
      expect(yieldMassive.waterGrams).toBe(160000); // 160 liters
      expect(yieldMassive.estimatedYieldMl).toBe(140000); // 160,000 - 20,000 = 140,000 ml
      expect(calculateBloomWater(10000)).toBe(30000); // 30L bloom

      // Scaled step instructions for extreme dose
      const v60Config = getBrewMethodConfig('v60');
      const metrics = computeBrewMetrics(v60Config, 10000);
      expect(metrics.totalWaterGrams).toBe(160000);
      expect(metrics.bloomWaterGrams).toBe(30000);
      expect(metrics.steps[0].targetWaterGrams).toBe(30000);
      expect(metrics.steps[metrics.steps.length - 1].targetWaterGrams).toBe(160000);
    });

    it('handles unusual search queries in catalog filtering without crashing', () => {
      // Special regex characters, brackets, quotes, unicode, long strings
      const weirdQueries = [
        '.*',
        '+++',
        '[[[',
        '\\',
        '"" OR 1=1',
        '<script>alert(1)</script>',
        '☕🌱',
        '   ',
        'A'.repeat(500),
      ];

      weirdQueries.forEach((q) => {
        const results = filterAndSortCoffees(SPECIALTY_COFFEE_PRODUCTS, {
          ...DEFAULT_FILTER_STATE,
          searchQuery: q,
        });
        expect(Array.isArray(results)).toBe(true);
        if (q.trim() === '') {
          expect(results.length).toBe(SPECIALTY_COFFEE_PRODUCTS.length);
        }
      });
    });
  });

  // =========================================================================
  // 2. RAPID VARIANT SWITCHING & CART INVARIANTS
  // =========================================================================
  describe('Dimension 2: Rapid Variant Switching & Cart Invariants', () => {
    it('maintains deterministic state and coalesces items during rapid weight and grind swaps', () => {
      const { result } = renderHook(() => useCart(), { wrapper: cartWrapper });

      // Add base item: Ethiopia 250g whole_bean
      act(() => {
        result.current.addItem({
          productId: 'ethiopia-yirgacheffe-chelbesa',
          slug: 'ethiopia-yirgacheffe-chelbesa',
          name: 'Ethiopia Yirgacheffe Chelbesa',
          origin: 'Ethiopia',
          roastLevel: 'Light',
          imageUrl: '/test.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'whole_bean',
          basePrice250g: 22.5,
          quantity: 2,
          isSubscription: false,
        });
      });

      expect(result.current.items.length).toBe(1);
      const initialId = result.current.items[0].id;
      expect(initialId).toBe('ethiopia-yirgacheffe-chelbesa__250g__whole_bean__onetime');
      expect(result.current.items[0].unitPrice).toBe(22.5);
      expect(result.current.summary.netSubtotal).toBe(45.0);

      // Swap grind to v60_drip
      act(() => {
        result.current.updateVariant(initialId, { grind: 'v60_drip' });
      });

      expect(result.current.items.length).toBe(1);
      const v60Id = result.current.items[0].id;
      expect(v60Id).toBe('ethiopia-yirgacheffe-chelbesa__250g__v60_drip__onetime');
      expect(result.current.items[0].grind).toBe('v60_drip');
      expect(result.current.items[0].quantity).toBe(2);

      // Swap weight to 500g (multiplier 1.85 => unitPrice 41.63)
      act(() => {
        result.current.updateVariant(v60Id, { weight: '500g' });
      });

      expect(result.current.items.length).toBe(1);
      const weight500Id = result.current.items[0].id;
      expect(weight500Id).toBe('ethiopia-yirgacheffe-chelbesa__500g__v60_drip__onetime');
      expect(result.current.items[0].weight).toBe('500g');
      expect(result.current.items[0].weightGrams).toBe(500);
      expect(result.current.items[0].unitPrice).toBe(41.63); // 22.5 * 1.85
      expect(result.current.summary.netSubtotal).toBe(83.26); // 41.63 * 2

      // Add a separate 250g v60_drip item
      act(() => {
        result.current.addItem({
          productId: 'ethiopia-yirgacheffe-chelbesa',
          slug: 'ethiopia-yirgacheffe-chelbesa',
          name: 'Ethiopia Yirgacheffe Chelbesa',
          origin: 'Ethiopia',
          roastLevel: 'Light',
          imageUrl: '/test.jpg',
          weight: '250g',
          weightGrams: 250,
          grind: 'v60_drip',
          basePrice250g: 22.5,
          quantity: 1,
          isSubscription: false,
        });
      });

      expect(result.current.items.length).toBe(2);

      // Now switch the 500g v60_drip back to 250g v60_drip — it should COALESCE with the existing item!
      act(() => {
        result.current.updateVariant(weight500Id, { weight: '250g' });
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].id).toBe('ethiopia-yirgacheffe-chelbesa__250g__v60_drip__onetime');
      expect(result.current.items[0].quantity).toBe(3); // 2 + 1 = 3
      expect(result.current.items[0].unitPrice).toBe(22.5);
      expect(result.current.summary.netSubtotal).toBe(67.5);
    });

    it('cycles through all weight options and preserves pricing multipliers accurately', () => {
      const weights: Array<{ weight: PackageWeight; multiplier: number; grams: number }> = [
        { weight: '200g', multiplier: 0.85, grams: 200 },
        { weight: '250g', multiplier: 1.0, grams: 250 },
        { weight: '500g', multiplier: 1.88, grams: 500 },
        { weight: '1kg', multiplier: 3.45, grams: 1000 },
      ];

      const basePrice = 20.0;

      weights.forEach(({ weight, multiplier }) => {
        const expectedPrice = Math.round(basePrice * multiplier * 100) / 100;
        const calculated = calculateItemUnitPrice(basePrice, weight, false);
        expect(calculated).toBe(expectedPrice);

        // Subscription discount (10% off)
        const expectedSubPrice = Math.round(expectedPrice * 0.9 * 100) / 100;
        const calculatedSub = calculateItemUnitPrice(basePrice, weight, true);
        expect(calculatedSub).toBe(expectedSubPrice);
      });
    });
  });

  // =========================================================================
  // 3. SUBSCRIPTION DISCOUNT STACKING & PROMO CODES
  // =========================================================================
  describe('Dimension 3: Subscription Discount Stacking & Mixed Baskets', () => {
    it('accurately calculates mixed cart with subscription items, one-time items, and percentage promo code', () => {
      // Item 1: Ethiopia 250g subscription (10% off: $22.50 -> $20.25) x 2 = $40.50
      // Item 2: Apex 500g one-time ($17.50 * 1.88 = $32.90) x 1 = $32.90
      // Gross subtotal: ($22.50 * 2) + ($32.90 * 1) = $45.00 + $32.90 = $77.90
      // Subscription savings: $45.00 - $40.50 = $4.50
      // Net subtotal: $73.40
      // Promo code ROASTMASTER10 (10% of net subtotal $73.40 = $7.34)
      // Discounted subtotal: $73.40 - $7.34 = $66.06
      // Free shipping applies (> $50.00) -> $0.00
      // Tax (8% of $66.06 = $5.28)
      // Grand Total: $66.06 + $0.00 + $5.28 = $71.34

      const summary = calculateOrderSummary(
        [
          {
            id: 'ethiopia-sub',
            productId: 'ethiopia-yirgacheffe-chelbesa',
            slug: 'ethiopia-yirgacheffe-chelbesa',
            name: 'Ethiopia Chelbesa',
            origin: 'Ethiopia',
            roastLevel: 'Light',
            imageUrl: '/test.jpg',
            weight: '250g',
            weightGrams: 250,
            grind: 'v60_drip',
            basePrice250g: 22.5,
            unitPrice: 20.25,
            quantity: 2,
            isSubscription: true,
            subscriptionFrequency: 'biweekly',
            subscriptionDiscountPercent: 10,
          },
          {
            id: 'apex-onetime',
            productId: 'lumina-apex-house-espresso-blend',
            slug: 'lumina-apex-house-espresso-blend',
            name: 'Apex Blend',
            origin: 'Blend',
            roastLevel: 'Medium',
            imageUrl: '/test.jpg',
            weight: '500g',
            weightGrams: 500,
            grind: 'espresso',
            basePrice250g: 17.5,
            unitPrice: 32.9,
            quantity: 1,
            isSubscription: false,
            subscriptionDiscountPercent: 0,
          },
        ],
        {
          code: 'ROASTMASTER10',
          type: 'percentage',
          value: 10,
          description: '10% off',
        }
      );

      expect(summary.itemsCount).toBe(3);
      expect(summary.totalGrams).toBe(1000);
      expect(summary.grossSubtotal).toBe(77.9);
      expect(summary.subscriptionSavings).toBe(4.5);
      expect(summary.netSubtotal).toBe(73.4);
      expect(summary.couponDiscount).toBe(7.34);
      expect(summary.shippingFee).toBe(0.0);
      expect(summary.tax).toBe(5.28);
      expect(summary.grandTotal).toBe(71.34);
    });

    it('correctly checks minimum order value on net subtotal AFTER subscription discount', () => {
      // Coffee with $32.00 price
      // If 10% subscription is applied, net subtotal is $28.80
      // Promo code FIRSTSIP requires minimum $30.00
      const validationBeforeSub = validatePromoCode('FIRSTSIP', 32.0);
      expect(validationBeforeSub.valid).toBe(true);

      const validationAfterSub = validatePromoCode('FIRSTSIP', 28.8);
      expect(validationAfterSub.valid).toBe(false);
      expect(validationAfterSub.message).toContain('minimum order value of $30.00');
    });

    it('handles fixed dollar coupon exceeding net subtotal without creating negative total', () => {
      // Cart value $15.00 with $20.00 fixed coupon
      const summary = calculateOrderSummary(
        [
          {
            id: 'small-item',
            productId: 'ethiopia-yirgacheffe-chelbesa',
            slug: 'ethiopia-yirgacheffe-chelbesa',
            name: 'Sample',
            origin: 'Ethiopia',
            roastLevel: 'Light',
            imageUrl: '/test.jpg',
            weight: '200g',
            weightGrams: 200,
            grind: 'v60_drip',
            basePrice250g: 17.65,
            unitPrice: 15.0,
            quantity: 1,
            isSubscription: false,
            subscriptionDiscountPercent: 0,
          },
        ],
        {
          code: 'BARISTA20',
          type: 'fixed',
          value: 20.0,
          description: '$20 off',
        }
      );

      expect(summary.netSubtotal).toBe(15.0);
      expect(summary.couponDiscount).toBe(15.0); // Clamped to net subtotal
      expect(summary.tax).toBe(0.0);
      expect(summary.shippingFee).toBe(5.0); // Under $50
      expect(summary.grandTotal).toBe(5.0); // Only shipping fee remains
    });
  });

  // =========================================================================
  // 4. PROMO CODE EDGE CASES
  // =========================================================================
  describe('Dimension 4: Promo Code Edge Cases', () => {
    it('handles case-insensitivity, leading/trailing whitespace, and empty codes', () => {
      expect(validatePromoCode('roastmaster10', 50).valid).toBe(true);
      expect(validatePromoCode('  ROASTMASTER10  ', 50).valid).toBe(true);
      expect(validatePromoCode('RoAsTmAsTeR10', 50).valid).toBe(true);
      expect(validatePromoCode('freeship', 10).valid).toBe(true);
      expect(validatePromoCode('', 50).valid).toBe(false);
      expect(validatePromoCode('   ', 50).valid).toBe(false);
      expect(validatePromoCode('INVALID_CODE_999', 50).valid).toBe(false);
    });

    it('tests exact boundary thresholds for conditional coupons', () => {
      // FIRSTSIP ($30.00 min)
      expect(validatePromoCode('FIRSTSIP', 29.99).valid).toBe(false);
      expect(validatePromoCode('FIRSTSIP', 30.0).valid).toBe(true);
      expect(validatePromoCode('FIRSTSIP', 30.01).valid).toBe(true);

      // BARISTA20 ($75.00 min)
      expect(validatePromoCode('BARISTA20', 74.99).valid).toBe(false);
      expect(validatePromoCode('BARISTA20', 75.0).valid).toBe(true);
      expect(validatePromoCode('BARISTA20', 75.01).valid).toBe(true);
    });

    it('applies FREESHIP coupon and zeroes out standard shipping fee', () => {
      const summary = calculateOrderSummary(
        [
          {
            id: 'small-item',
            productId: 'test',
            slug: 'test',
            name: 'Test Coffee',
            origin: 'Test',
            roastLevel: 'Light',
            imageUrl: '/test.jpg',
            weight: '250g',
            weightGrams: 250,
            grind: 'whole_bean',
            basePrice250g: 20.0,
            unitPrice: 20.0,
            quantity: 1,
            isSubscription: false,
            subscriptionDiscountPercent: 0,
          },
        ],
        {
          code: 'FREESHIP',
          type: 'free_shipping',
          value: 0,
          description: 'Free Shipping',
        }
      );

      expect(summary.shippingFee).toBe(0.0);
      expect(summary.couponDiscount).toBe(0.0);
      expect(summary.grandTotal).toBe(21.6); // $20.00 + $0 shipping + $1.60 tax
    });
  });

  // =========================================================================
  // 5. WHATSAPP URL PERCENT-ENCODING & PHONE SANITIZATION
  // =========================================================================
  describe('Dimension 5: WhatsApp URL Percent-Encoding & Complex Payloads', () => {
    it('sanitizes international phone numbers and strips non-numeric characters', () => {
      const testCases = [
        { phone: '+1 (555) 839-2633', expected: '15558392633' },
        { phone: '+44 20 7946 0958', expected: '442079460958' },
        { phone: '1-800-COFFEE', expected: '1800' },
        { phone: '  +1-555-839-2633  ', expected: '15558392633' },
      ];

      testCases.forEach(({ phone, expected }) => {
        const url = generateWhatsAppOrderUrl({
          orderId: 'ORD-2026-1001',
          items: [
            {
              productTitle: 'Coffee',
              weightGrams: 250,
              grindOption: 'Whole Bean',
              quantity: 1,
              unitPrice: 20,
              isSubscription: false,
            },
          ],
          subtotal: 20,
          shipping: 0,
          total: 21.6,
          roasteryPhone: phone,
        });

        expect(url.startsWith(`https://wa.me/${expected}?text=`)).toBe(true);
      });
    });

    it('safely percent-encodes special characters, accents, emojis, quotes, and newlines', () => {
      const orderDetails: WhatsAppOrderDetails = {
        orderId: 'ORD-2026-9999',
        customerName: 'Renée & François O’Connor #1 ☕🌱',
        items: [
          {
            productTitle: 'Special Lot: "El Paraíso" (Thermal Shock & Honey!)',
            weightGrams: 500,
            grindOption: 'V60 / Drip (Medium-Fine)',
            quantity: 2,
            unitPrice: 48.88,
            isSubscription: true,
            frequency: 'Bi-Weekly',
          },
        ],
        subtotal: 97.76,
        shipping: 0,
        total: 105.58,
        specialInstructions: 'Please grind ultra-fine & leave by back door (code: 100% #456)!',
      };

      const url = generateWhatsAppOrderUrl(orderDetails);
      expect(url).toContain('https://wa.me/');

      // Decode and verify roundtrip fidelity
      const urlObj = new URL(url);
      const textParam = urlObj.searchParams.get('text');
      expect(textParam).not.toBeNull();

      expect(textParam).toContain('Renée & François O’Connor #1 ☕🌱');
      expect(textParam).toContain('Special Lot: "El Paraíso" (Thermal Shock & Honey!)');
      expect(textParam).toContain('🔄 (Bi-Weekly Subscription)');
      expect(textParam).toContain('code: 100% #456');
      expect(textParam).toContain('ORD-2026-9999');
      expect(textParam).toContain('FREE');
    });
  });

  // =========================================================================
  // 6. INVENTORY CONCURRENCY & STOCK RESERVATION INTEGRITY
  // =========================================================================
  describe('Dimension 6: Inventory Stock Reservation & Concurrency Integrity', () => {
    it('accurately tracks cumulative stock reservations under sequential and parallel order requests', async () => {
      const initialInventory = getInventory();
      const chelbesa = initialInventory.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      expect(chelbesa).toBeDefined();
      const initialReserved = chelbesa!.reservedStockKg || 0;
      const initialAllocated = chelbesa!.allocatedKg || 0;

      const orderPayload: CreateOrderPayload = {
        channel: 'web',
        customer: {
          firstName: 'Concurrent',
          lastName: 'Tester',
          email: 'concurrent@example.com',
        },
        shippingAddress: {
          street: '123 Test St',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: [
          {
            productId: 'ethiopia-yirgacheffe-chelbesa',
            name: 'Ethiopia Yirgacheffe Chelbesa',
            slug: 'ethiopia-yirgacheffe-chelbesa',
            origin: 'Ethiopia',
            roastLevel: 'Light',
            weight: '500g', // 0.5 kg per item
            weightGrams: 500,
            grind: 'v60_drip',
            basePrice250g: 22.5,
            quantity: 2, // 2 * 0.5kg = 1.0 kg per order
            isSubscription: false,
          },
        ],
      };

      // Execute 20 concurrent order creations
      const numOrders = 20;
      const promises = Array.from({ length: numOrders }).map(async () => {
        return createOrder(orderPayload);
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(numOrders);

      // Verify each created order has unique sequential order ID
      const orderIds = results.map((o) => o.id);
      const uniqueOrderIds = new Set(orderIds);
      expect(uniqueOrderIds.size).toBe(numOrders);

      // Verify inventory reservation
      const updatedInventory = getInventory();
      const updatedChelbesa = updatedInventory.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      expect(updatedChelbesa).toBeDefined();

      // Total weight reserved should be exactly 20 * 1.0kg = 20.0kg
      const expectedReserved = Number((initialReserved + numOrders * 1.0).toFixed(2));
      const expectedAllocated = Number((initialAllocated + numOrders * 1.0).toFixed(2));

      expect(updatedChelbesa!.reservedStockKg).toBe(expectedReserved);
      expect(updatedChelbesa!.allocatedKg).toBe(expectedAllocated);
    });

    it('dynamically triggers isLowStock flag when green stock falls below safety threshold', () => {
      // Restock/adjust green stock to test threshold trigger
      const item = inventoryRepository.findByProductId('guatemala-huehuetenango-bella-carmona');
      expect(item).toBeDefined();
      expect(item!.isLowStock).toBe(false); // Green stock 300kg > threshold 35kg

      // Deduct green stock down to 20kg (below safety threshold 35kg)
      inventoryRepository.deductGreenStock('guatemala-huehuetenango-bella-carmona', 285);

      const itemAfterDeduct = inventoryRepository.findByProductId('guatemala-huehuetenango-bella-carmona');
      expect(itemAfterDeduct!.greenStockKg).toBe(15);
      expect(itemAfterDeduct!.isLowStock).toBe(true);

      // Restock green stock back up by 50kg -> 65kg > 35kg
      inventoryRepository.restockGreen('guatemala-huehuetenango-bella-carmona', 50);

      const itemAfterRestock = inventoryRepository.findByProductId('guatemala-huehuetenango-bella-carmona');
      expect(itemAfterRestock!.greenStockKg).toBe(65);
      expect(itemAfterRestock!.isLowStock).toBe(false);
    });

    it('adjusts roasted stock levels and clamps negative stock to zero', () => {
      const item = inventoryRepository.findByProductId('sumatra-kerinci-tiger-wet-hulled');
      expect(item).toBeDefined();
      const initialRoasted = item!.roastedStockKg;

      // Add 15kg roasted
      inventoryRepository.adjustStock('sumatra-kerinci-tiger-wet-hulled', 15);
      let updated = inventoryRepository.findByProductId('sumatra-kerinci-tiger-wet-hulled');
      expect(updated!.roastedStockKg).toBe(initialRoasted + 15);

      // Deduct more than available -> should clamp to 0
      inventoryRepository.adjustStock('sumatra-kerinci-tiger-wet-hulled', -500);
      updated = inventoryRepository.findByProductId('sumatra-kerinci-tiger-wet-hulled');
      expect(updated!.roastedStockKg).toBe(0);
    });
  });
});
