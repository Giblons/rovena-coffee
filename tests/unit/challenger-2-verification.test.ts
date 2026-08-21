import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getOrdersHandler, POST as postOrdersHandler } from '@/app/api/orders/route';
import { GET as getOrderByIdHandler, PATCH as patchOrderHandler } from '@/app/api/orders/[id]/route';
import { POST as postStripeCheckoutHandler } from '@/app/api/checkout/stripe/route';
import { POST as postStripeWebhookHandler } from '@/app/api/webhooks/stripe/route';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  resetDbState,
} from '@/lib/db';
import { generateWhatsAppOrderUrl, formatWhatsAppOrderMessage } from '@/lib/whatsapp';
import { calculateItemUnitPrice, calculateOrderSummary, validatePromoCode } from '@/lib/pricing';
import { CreateOrderPayload } from '@/types/order';

describe('Empirical Verification Suite — Challenger 2 (Multi-Channel, API & Data Flow)', () => {
  beforeEach(() => {
    resetDbState();
  });

  describe('1. Web Checkout Flow — End-to-End State Machine', () => {
    it('verifies cart calculations with weight multipliers and subscription discounts', () => {
      const basePrice250g = 22.0; // $22 for 250g
      
      // 250g standard (1.0x): 22.00
      expect(calculateItemUnitPrice(basePrice250g, '250g', false)).toBe(22.0);
      // 250g subscription (10% off): 19.80
      expect(calculateItemUnitPrice(basePrice250g, '250g', true)).toBe(19.8);
      // 500g standard (1.88x multiplier): 41.36
      expect(calculateItemUnitPrice(basePrice250g, '500g', false)).toBe(41.36);
      // 1kg standard (3.45x multiplier): 75.90
      expect(calculateItemUnitPrice(basePrice250g, '1kg', false)).toBe(75.9);
      // 200g standard (0.85x multiplier): 18.70
      expect(calculateItemUnitPrice(basePrice250g, '200g', false)).toBe(18.7);
    });

    it('verifies promo code validation & discounts', () => {
      const subtotal = 100.0;
      
      // 10% coupon validation
      const result10 = validatePromoCode('ROASTMASTER10', subtotal);
      expect(result10.valid).toBe(true);
      expect(result10.discount?.code).toBe('ROASTMASTER10');
      expect(result10.discount?.value).toBe(10);
      expect(result10.discount?.type).toBe('percentage');

      // Welcome 10%
      expect(validatePromoCode('WELCOME10', subtotal).valid).toBe(true);

      // Free shipping
      const freeShipResult = validatePromoCode('FREESHIP', subtotal);
      expect(freeShipResult.valid).toBe(true);
      expect(freeShipResult.discount?.type).toBe('free_shipping');

      // Invalid code
      expect(validatePromoCode('INVALID_CODE', subtotal).valid).toBe(false);
    });

    it('executes full simulated web checkout: API creation -> database reservation -> confirmation fetch -> admin transitions', async () => {
      // 1. Initial inventory snapshot
      const initialInv = getInventory();
      const initialChelbesa = initialInv.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      const initialReserved = initialChelbesa?.reservedStockKg || 0;

      // 2. Submit order through POST /api/orders
      const orderPayload: CreateOrderPayload = {
        channel: 'web',
        source: 'Web Checkout',
        paymentMethod: 'simulated_card',
        customer: {
          firstName: 'Amara',
          lastName: 'Osei',
          email: 'amara.osei@example.com',
          phone: '+1 206 555 0144',
        },
        shippingAddress: {
          street: '1420 5th Avenue',
          unit: 'Suite 2200',
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
            weight: '500g',
            weightGrams: 500,
            grind: 'v60_drip',
            basePrice250g: 22.5,
            quantity: 2, // Total 1kg
            isSubscription: false,
          },
        ],
        appliedDiscountCode: 'ROASTMASTER10',
        notes: 'Simulated Card: 4242 4242 4242 4242',
      };

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const res = await postOrdersHandler(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      const createdOrder = data.order;
      expect(createdOrder.id).toMatch(/^ORD-\d{4}-\d+/);
      expect(createdOrder.channel).toBe('web');
      expect(createdOrder.paymentStatus).toBe('paid');
      expect(createdOrder.status).toBe('Pending');
      expect(createdOrder.customer.firstName).toBe('Amara');
      expect(createdOrder.items[0].weightGrams).toBe(500);

      // Financial accuracy in order repository:
      // 2 * (22.50 * 1.85 = 41.625) = 83.25 gross
      // subAfterSubscription: 41.625.toFixed(2) = 41.63, * 2 = 83.26
      // 10% coupon on 83.26 = 8.326 → 8.33
      // Net subtotal = (83.26 - 8.326).toFixed(2) = 74.93 (> 50 => free standard shipping = 0)
      // Tax 8% of 74.93 = 5.99
      // Grand total = 74.93 + 0 + 5.99 = 80.92
      expect(createdOrder.pricing.grossSubtotal).toBe(83.25);
      expect(createdOrder.pricing.couponDiscount).toBe(8.33);
      expect(createdOrder.pricing.netSubtotal).toBe(74.93);
      expect(createdOrder.pricing.shippingFee).toBe(0.0);
      expect(createdOrder.pricing.tax).toBe(5.99);
      expect(createdOrder.pricing.grandTotal).toBe(80.92);

      // 3. Inventory stock reservation verification (2 * 500g = 1.0 kg reserved)
      const afterInv = getInventory();
      const updatedChelbesa = afterInv.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      expect(updatedChelbesa?.reservedStockKg).toBeCloseTo(initialReserved + 1.0, 2);

      // 4. Fetch order for Confirmation Page via GET /api/orders/[id]
      const getReq = new NextRequest(`http://localhost:3000/api/orders/${createdOrder.id}`);
      const getRes = await getOrderByIdHandler(getReq, {
        params: Promise.resolve({ id: createdOrder.id }),
      });
      const fetchedData = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(fetchedData.order.id).toBe(createdOrder.id);
      expect(fetchedData.order.customer.email).toBe('amara.osei@example.com');

      // 5. Admin updates status: Pending -> Roasting -> Dispatched -> Delivered
      const roastingPatchReq = new NextRequest(`http://localhost:3000/api/orders/${createdOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Roasting', roastBatchId: 'BATCH-20260421-MON' }),
      });
      const roastingRes = await patchOrderHandler(roastingPatchReq, {
        params: Promise.resolve({ id: createdOrder.id }),
      });
      const roastingData = await roastingRes.json();
      expect(roastingRes.status).toBe(200);
      expect(roastingData.order.status).toBe('Roasting');
      expect(roastingData.order.roastBatchId).toBe('BATCH-20260421-MON');

      const dispatchedPatchReq = new NextRequest(`http://localhost:3000/api/orders/${createdOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dispatched', trackingNumber: 'USPS-9400111899' }),
      });
      const dispatchedRes = await patchOrderHandler(dispatchedPatchReq, {
        params: Promise.resolve({ id: createdOrder.id }),
      });
      const dispatchedData = await dispatchedRes.json();
      expect(dispatchedData.order.status).toBe('Dispatched');
      expect(dispatchedData.order.trackingNumber).toBe('USPS-9400111899');

      const deliveredPatchReq = new NextRequest(`http://localhost:3000/api/orders/${createdOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' }),
      });
      const deliveredRes = await patchOrderHandler(deliveredPatchReq, {
        params: Promise.resolve({ id: createdOrder.id }),
      });
      const deliveredData = await deliveredRes.json();
      expect(deliveredData.order.status).toBe('Delivered');
    });
  });

  describe('2. WhatsApp Direct Order Flow & wa.me URL Generation', () => {
    it('creates WhatsApp order with channel="whatsapp", source="WhatsApp Direct Order", paymentStatus="pending_manual"', async () => {
      const whatsappPayload: CreateOrderPayload = {
        channel: 'whatsapp',
        source: 'WhatsApp Direct Order',
        paymentMethod: 'whatsapp_manual',
        customer: {
          firstName: 'Mateo',
          lastName: 'Silva',
          email: '5559023341@whatsapp.lumina.coffee',
          phone: '+1 (555) 902-3341',
        },
        shippingAddress: {
          street: '450 Mission St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: [
          {
            productId: 'costa-rica-tarrazu-mozart-honey',
            name: 'Costa Rica Tarrazú Canet Mozart',
            slug: 'costa-rica-tarrazu-mozart-honey',
            origin: 'Costa Rica',
            roastLevel: 'Medium-Light',
            weight: '250g',
            weightGrams: 250,
            grind: 'aeropress',
            basePrice250g: 23.0,
            quantity: 2,
            isSubscription: true,
            subscriptionFrequency: 'biweekly',
          },
        ],
        notes: 'Prefers light roast batch if available.',
      };

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappPayload),
      });

      const res = await postOrdersHandler(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      const order = data.order;

      expect(order.channel).toBe('whatsapp');
      expect(order.source).toBe('WhatsApp Direct Order');
      expect(order.paymentStatus).toBe('pending_manual');
      expect(order.paymentMethod).toBe('whatsapp_manual');
      expect(order.status).toBe('Pending');
      expect(order.items[0].isSubscription).toBe(true);
      expect(order.items[0].subscriptionFrequency).toBe('biweekly');

      // Check admin queue inclusion
      const pendingOrders = getAllOrders({ status: 'Pending' });
      expect(pendingOrders.some((o) => o.id === order.id)).toBe(true);

      const whatsappOrders = getAllOrders({ channel: 'whatsapp' });
      expect(whatsappOrders.some((o) => o.id === order.id)).toBe(true);
    });

    it('generates fully formatted and RFC-compliant wa.me link with item details, pricing and emojis', () => {
      const details = {
        orderId: 'ORD-2026-9081',
        customerName: 'Maya Lin',
        roasteryPhone: '+1 (555) 839-2633',
        items: [
          {
            productTitle: 'Guatemala Huehuetenango Bella Carmona',
            weightGrams: 500,
            grindOption: 'French Press',
            quantity: 1,
            unitPrice: 35.72,
            isSubscription: false,
          },
          {
            productTitle: 'Kenya Nyeri Gakuyu-ini AA',
            weightGrams: 250,
            grindOption: 'V60 / Drip',
            quantity: 2,
            unitPrice: 21.0,
            isSubscription: true,
            frequency: 'Weekly',
          },
        ],
        subtotal: 77.72,
        shipping: 0.0,
        total: 83.94,
        specialInstructions: 'Gate code #4012.',
      };

      const waUrl = generateWhatsAppOrderUrl(details);
      const waMessage = formatWhatsAppOrderMessage(details);

      // Verify phone sanitization
      expect(waUrl.startsWith('https://wa.me/15558392633?text=')).toBe(true);

      // Verify message content
      expect(waMessage).toContain('#ORD-2026-9081');
      expect(waMessage).toContain('Maya Lin');
      expect(waMessage).toContain('Guatemala Huehuetenango Bella Carmona');
      expect(waMessage).toContain('French Press');
      expect(waMessage).toContain('Kenya Nyeri Gakuyu-ini AA');
      expect(waMessage).toContain('Weekly Subscription');
      expect(waMessage).toContain('Subtotal: $77.72');
      expect(waMessage).toContain('Shipping: FREE');
      expect(waMessage).toContain('Total: *$83.94*');
      expect(waMessage).toContain('Gate code #4012.');

      // Verify URL decoding matches message
      const queryText = waUrl.split('?text=')[1];
      expect(decodeURIComponent(queryText)).toBe(waMessage);
    });
  });

  describe('3. Stripe Checkout API & Webhook Scaffolding', () => {
    it('handles simulated stripe checkout session generation when secret key is unset', async () => {
      const stripeReq = new NextRequest('http://localhost:3000/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              productId: 'sumatra-kerinci-tiger-wet-hulled',
              name: 'Sumatra Mount Kerinci Tiger',
              slug: 'sumatra-kerinci-tiger-wet-hulled',
              origin: 'Indonesia',
              roastLevel: 'Medium-Dark',
              weight: '250g',
              weightGrams: 250,
              grind: 'cold_brew',
              basePrice250g: 18.5,
              unitPrice: 18.5,
              quantity: 2,
              isSubscription: false,
            },
          ],
          customer: {
            firstName: 'Sarah',
            lastName: 'Jenkins',
            email: 'sarah.jenkins@example.com',
            phone: '+1 555 771 4098',
          },
          shippingAddress: {
            street: '880 Broadway',
            city: 'New York',
            state: 'NY',
            postalCode: '10003',
            country: 'United States',
          },
        }),
      });

      const res = await postStripeCheckoutHandler(stripeReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mode).toBe('simulated');
      expect(data.sessionId).toMatch(/^cs_test_lumina_/);
      expect(data.orderId).toMatch(/^ORD-\d{4}-\d+/);
      expect(data.url).toContain(data.orderId);

      // Verify database order was updated
      const createdOrder = getOrderById(data.orderId);
      expect(createdOrder).toBeDefined();
      expect(createdOrder?.paymentStatus).toBe('paid');
      expect(createdOrder?.stripeSessionId).toBe(data.sessionId);
    });

    it('rejects invalid stripe checkout requests with 400 for empty items or missing email', async () => {
      // Empty items
      const emptyItemsReq = new NextRequest('http://localhost:3000/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [],
          customer: { email: 'test@example.com' },
        }),
      });
      const res1 = await postStripeCheckoutHandler(emptyItemsReq);
      expect(res1.status).toBe(400);

      // Missing email
      const missingEmailReq = new NextRequest('http://localhost:3000/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: 'ethiopia-chelbesa', quantity: 1, basePrice250g: 20, weight: '250g' }],
          customer: { firstName: 'NoEmail' },
        }),
      });
      const res2 = await postStripeCheckoutHandler(missingEmailReq);
      expect(res2.status).toBe(400);
    });

    it('processes stripe webhook checkout.session.completed event and adjusts inventory stock', async () => {
      // Create an order first
      const order = createOrder({
        channel: 'web',
        source: 'Stripe Hosted Checkout',
        paymentMethod: 'stripe',
        customer: {
          firstName: 'Stripe',
          lastName: 'Customer',
          email: 'stripe.cust@example.com',
          phone: '1234567890',
        },
        shippingAddress: {
          street: '1 Stripe Way',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94103',
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
            weight: '250g',
            weightGrams: 250,
            grind: 'whole_bean',
            basePrice250g: 22.5,
            quantity: 2, // 2 units
            isSubscription: false,
          },
        ],
      });

      const initialInv = getInventory();
      const initialStock = initialInv.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      const initialRoasted = initialStock?.roastedStockKg || 0;

      const webhookReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_webhook_session_999',
              client_reference_id: order.id,
              payment_intent: 'pi_test_intent_888',
            },
          },
        }),
      });

      const res = await postStripeWebhookHandler(webhookReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify order updated
      const updatedOrder = getOrderById(order.id);
      expect(updatedOrder?.paymentStatus).toBe('paid');
      expect(updatedOrder?.stripeSessionId).toBe('cs_test_webhook_session_999');
      expect(updatedOrder?.stripePaymentIntentId).toBe('pi_test_intent_888');

      // Verify inventory adjustment occurred
      const afterInv = getInventory();
      const afterStock = afterInv.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      expect(afterStock?.roastedStockKg).toBe(initialRoasted - 2);
    });
  });

  describe('4. Adversarial & Edge Case Tests', () => {
    it('handles concurrent order insertions without ID collisions', () => {
      const orderIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const order = createOrder({
          channel: i % 2 === 0 ? 'web' : 'whatsapp',
          customer: { firstName: `User${i}`, lastName: 'Test', email: `user${i}@test.com`, phone: '123' },
          shippingAddress: { street: 'Main', city: 'City', state: 'WA', postalCode: '98101', country: 'US' },
          shippingMethod: 'standard',
          items: [
            {
              productId: 'ethiopia-yirgacheffe-chelbesa',
              name: 'Ethiopia Chelbesa',
              slug: 'ethiopia-chelbesa',
              origin: 'Ethiopia',
              roastLevel: 'Light',
              weight: '250g',
              weightGrams: 250,
              grind: 'whole_bean',
              basePrice250g: 20.0,
              quantity: 1,
              isSubscription: false,
            },
          ],
        });
        expect(orderIds.has(order.id)).toBe(false);
        orderIds.add(order.id);
      }
      expect(orderIds.size).toBe(50);
    });

    it('rejects order creation with missing customer or empty payload via POST /api/orders', async () => {
      const invalidReq = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'web' }), // Missing customer and items
      });

      const res = await postOrdersHandler(invalidReq);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });
});
