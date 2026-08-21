import { describe, it, expect, beforeEach } from 'vitest';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import { filterAndSortCoffees, DEFAULT_FILTER_STATE } from '@/lib/catalog-filter';
import { calculateBrewYield, calculateBloomWater, getBrewMethodConfig } from '@/lib/brew-calculator';
import { calculateItemUnitPrice, calculateOrderSummary, validatePromoCode } from '@/lib/pricing';
import { generateWhatsAppOrderUrl, formatWhatsAppOrderMessage } from '@/lib/whatsapp';
import { createOrder, getOrderById, getAllOrders, resetDbState } from '@/lib/db';
import { CartItem } from '@/types/cart';
import { CreateOrderPayload } from '@/types/order';

describe('End-to-End User Journeys — Simulation Tests (Tier 4)', () => {
  beforeEach(() => {
    resetDbState();
  });

  describe('Scenario 1: Complete Web Checkout Journey', () => {
    it('executes full journey: Filter -> Product Selection -> Brew Calculator -> Cart -> Promo -> Web Checkout -> Confirmation & Roast Schedule', () => {
      // 1. Customer browses catalog and applies multi-facet filter:
      // Filter for: Light Roast, Washed process, Origin Ethiopia
      const catalogFilter = {
        ...DEFAULT_FILTER_STATE,
        roastLevels: ['Light'] as const,
        processingMethods: ['Washed'] as const,
        origins: ['Ethiopia'],
      };
      const filteredCoffees = filterAndSortCoffees(SPECIALTY_COFFEE_PRODUCTS, catalogFilter);

      expect(filteredCoffees.length).toBe(1);
      const selectedCoffee = filteredCoffees[0];
      expect(selectedCoffee.name).toBe('Ethiopia Yirgacheffe Chelbesa');
      expect(selectedCoffee.roastLevel).toBe('Light');
      expect(selectedCoffee.process).toBe('Washed');
      expect(selectedCoffee.origin.country).toBe('Ethiopia');
      expect(selectedCoffee.scaScore).toBe(90.5);

      // 2. Customer selects variant: 500g package, V60 grind
      const selectedWeight = '500g';
      const selectedGrind = 'v60_drip';
      const unitPrice500g = calculateItemUnitPrice(selectedCoffee.basePrice250g, selectedWeight, false);
      expect(unitPrice500g).toBeGreaterThan(selectedCoffee.basePrice250g); // 500g costs more than 250g base

      // 3. Customer checks interactive Brew Guide for V60
      const v60Config = getBrewMethodConfig('v60');
      const brewDose = 20; // 20g dose
      const brewYield = calculateBrewYield(brewDose, v60Config.defaultRatio);
      const bloomWater = calculateBloomWater(brewDose);

      expect(brewYield.waterGrams).toBe(Math.round(20 * v60Config.defaultRatio));
      expect(bloomWater).toBe(60); // 20 * 3 = 60g bloom

      // 4. Customer adds item to cart
      const cartItem: CartItem = {
        id: `${selectedCoffee.id}-500g-v60_drip-onetime`,
        productId: selectedCoffee.id,
        slug: selectedCoffee.id,
        name: selectedCoffee.name,
        origin: selectedCoffee.origin.country,
        roastLevel: selectedCoffee.roastLevel,
        imageUrl: selectedCoffee.image,
        weight: '500g',
        weightGrams: 500,
        grind: selectedGrind,
        basePrice250g: selectedCoffee.basePrice250g,
        unitPrice: unitPrice500g,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
      };

      // 5. Customer applies promo code ROASTMASTER10
      const promoValidation = validatePromoCode('ROASTMASTER10', cartItem.unitPrice);
      expect(promoValidation.valid).toBe(true);

      const pricingSummary = calculateOrderSummary([cartItem], promoValidation.discount);
      expect(pricingSummary.couponDiscount).toBeGreaterThan(0);

      // 6. Customer proceeds to Simulated Web Checkout
      const checkoutPayload: CreateOrderPayload = {
        channel: 'web',
        customer: {
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'marcus.vance@example.com',
          phone: '+1 555 839 2011',
        },
        shippingAddress: {
          street: '450 Pike Street',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: [
          {
            productId: cartItem.productId,
            name: cartItem.name,
            slug: cartItem.slug,
            origin: cartItem.origin,
            roastLevel: cartItem.roastLevel,
            weight: cartItem.weight,
            weightGrams: cartItem.weightGrams,
            grind: cartItem.grind,
            basePrice250g: cartItem.basePrice250g,
            quantity: cartItem.quantity,
            isSubscription: cartItem.isSubscription,
          },
        ],
        appliedDiscountCode: 'ROASTMASTER10',
        notes: 'Simulated Card: 4242 4242 4242 4242',
      };

      const completedOrder = createOrder(checkoutPayload);

      // 7. Verification: Order Confirmation receipt
      expect(completedOrder).toBeDefined();
      expect(completedOrder.id).toMatch(/^ORD-\d{4}-\d+/);
      expect(completedOrder.channel).toBe('web');
      expect(completedOrder.paymentStatus).toBe('paid');
      expect(completedOrder.status).toBe('Pending');
      expect(completedOrder.customer.firstName).toBe('Marcus');
      expect(completedOrder.items[0].name).toBe('Ethiopia Yirgacheffe Chelbesa');
      expect(completedOrder.items[0].weight).toBe('500g');
      expect(completedOrder.items[0].grind).toBe('v60_drip');
      expect(completedOrder.pricing.grandTotal).toBeGreaterThan(0);

      // Verify order is retrievable from database
      const persistedOrder = getOrderById(completedOrder.id);
      expect(persistedOrder).toBeDefined();
      expect(persistedOrder?.id).toBe(completedOrder.id);
    });
  });

  describe('Scenario 2: Complete WhatsApp Subscription Journey & Admin Queue', () => {
    it('executes full journey: Recurring Subscription -> WhatsApp Direct Ordering -> Database Persistence -> wa.me Link -> Admin Queue Verification', () => {
      // 1. Customer browses catalog for Costa Rica Tarrazú Mozart (Honey)
      const costaRica = SPECIALTY_COFFEE_PRODUCTS.find(
        (c) => c.id === 'costa-rica-tarrazu-mozart-honey'
      );
      expect(costaRica).toBeDefined();

      // 2. Customer configures recurring bi-weekly subscription for 250g Whole Bean
      const basePrice = costaRica!.basePrice250g; // $23.00
      const subPrice = calculateItemUnitPrice(basePrice, '250g', true); // 10% subscriber discount
      expect(subPrice).toBe(20.7); // 23.00 * 0.90 = 20.70

      const subCartItem: CartItem = {
        id: `${costaRica!.id}-250g-whole_bean-biweekly`,
        productId: costaRica!.id,
        slug: costaRica!.id,
        name: costaRica!.name,
        origin: costaRica!.origin.country,
        roastLevel: costaRica!.roastLevel,
        imageUrl: costaRica!.image,
        weight: '250g',
        weightGrams: 250,
        grind: 'whole_bean',
        basePrice250g: basePrice,
        unitPrice: subPrice,
        quantity: 2, // 2 bags bi-weekly
        isSubscription: true,
        subscriptionFrequency: 'biweekly',
        subscriptionDiscountPercent: 10,
      };

      const orderSummary = calculateOrderSummary([subCartItem], null);
      expect(orderSummary.subscriptionSavings).toBeCloseTo(4.6, 2); // 2 * $2.30 = $4.60 savings
      expect(orderSummary.netSubtotal).toBeCloseTo(41.4, 2); // 2 * $20.70 = $41.40

      // 3. Customer chooses WhatsApp Direct Ordering
      const whatsappPayload: CreateOrderPayload = {
        channel: 'whatsapp',
        source: 'WhatsApp Direct Order',
        paymentMethod: 'whatsapp_manual',
        customer: {
          firstName: 'Sophia',
          lastName: 'Chen',
          email: 'sophia.c@example.com',
          phone: '+1 555 771 9022',
        },
        shippingAddress: {
          street: '88 Pine Street',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: [
          {
            productId: subCartItem.productId,
            name: subCartItem.name,
            slug: subCartItem.slug,
            origin: subCartItem.origin,
            roastLevel: subCartItem.roastLevel,
            weight: subCartItem.weight,
            weightGrams: subCartItem.weightGrams,
            grind: subCartItem.grind,
            basePrice250g: subCartItem.basePrice250g,
            quantity: subCartItem.quantity,
            isSubscription: true,
            subscriptionFrequency: 'biweekly',
          },
        ],
        notes: 'Please confirm bi-weekly schedule.',
      };

      // 4. Backend creates and synchronizes order
      const persistedWhatsAppOrder = createOrder(whatsappPayload);
      expect(persistedWhatsAppOrder).toBeDefined();
      expect(persistedWhatsAppOrder.channel).toBe('whatsapp');
      expect(persistedWhatsAppOrder.paymentStatus).toBe('pending_manual');
      expect(persistedWhatsAppOrder.status).toBe('Pending');

      // 5. WhatsApp URL generator builds valid wa.me link with order metadata
      const whatsappDetails = {
        orderId: persistedWhatsAppOrder.id,
        customerName: `${persistedWhatsAppOrder.customer.firstName} ${persistedWhatsAppOrder.customer.lastName}`,
        items: [
          {
            productTitle: persistedWhatsAppOrder.items[0].name,
            weightGrams: persistedWhatsAppOrder.items[0].weightGrams,
            grindOption: 'Whole Bean',
            quantity: persistedWhatsAppOrder.items[0].quantity,
            unitPrice: persistedWhatsAppOrder.items[0].unitPrice,
            isSubscription: true,
            frequency: 'Bi-Weekly',
          },
        ],
        subtotal: persistedWhatsAppOrder.pricing.netSubtotal,
        shipping: persistedWhatsAppOrder.pricing.shippingFee,
        total: persistedWhatsAppOrder.pricing.grandTotal,
        specialInstructions: persistedWhatsAppOrder.notes,
      };

      const waUrl = generateWhatsAppOrderUrl(whatsappDetails);
      const waMessage = formatWhatsAppOrderMessage(whatsappDetails);

      expect(waUrl).toContain('https://wa.me/');
      expect(waMessage).toContain(persistedWhatsAppOrder.id);
      expect(waMessage).toContain('Sophia Chen');
      expect(waMessage).toContain('Costa Rica Tarrazú Canet Mozart');
      expect(waMessage).toContain('Bi-Weekly');
      expect(waMessage).toContain('🔄');

      // 6. Admin Roastery Operations Dashboard verifies order queue
      const pendingOrders = getAllOrders({ status: 'Pending' });
      const adminWhatsAppOrders = getAllOrders({ channel: 'whatsapp' });

      expect(pendingOrders.some((o) => o.id === persistedWhatsAppOrder.id)).toBe(true);
      expect(adminWhatsAppOrders.some((o) => o.id === persistedWhatsAppOrder.id)).toBe(true);
    });
  });
});
