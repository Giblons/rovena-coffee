import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getOrdersHandler, POST as postOrdersHandler } from '@/app/api/orders/route';
import { GET as getOrderByIdHandler, PATCH as patchOrderHandler } from '@/app/api/orders/[id]/route';
import { GET as getInventoryHandler, POST as postInventoryHandler } from '@/app/api/inventory/route';
import { GET as getBatchesHandler, POST as postBatchesHandler } from '@/app/api/roast-batches/route';
import { POST as postStripeCheckoutHandler } from '@/app/api/checkout/stripe/route';
import { POST as postStripeWebhookHandler } from '@/app/api/webhooks/stripe/route';
import { resetDbState } from '@/lib/db';

describe('Storefront & Roastery API Routes — Unit Tests (Milestone 4)', () => {
  beforeEach(() => {
    resetDbState();
  });

  describe('POST & GET /api/orders', () => {
    it('creates an order and returns 201 with created order details', async () => {
      const payload = {
        channel: 'web',
        customer: {
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'marcus@example.com',
          phone: '+1 555 100 2000',
        },
        shippingAddress: {
          street: '500 Pike St',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'United States',
        },
        shippingMethod: 'standard',
        items: [
          {
            productId: 'colombia-el-paraiso-lychee',
            name: 'Colombia El Paraiso Lychee',
            slug: 'colombia-el-paraiso-lychee',
            origin: 'Colombia',
            roastLevel: 'Medium-Light',
            weight: '250g',
            weightGrams: 250,
            grind: 'aeropress',
            basePrice250g: 24.0,
            quantity: 1,
            isSubscription: false,
          },
        ],
      };

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await postOrdersHandler(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.order.id).toMatch(/^ORD-\d{4}-\d+/);
      expect(data.order.customer.firstName).toBe('Marcus');
    });

    it('rejects order with 400 when items list is empty', async () => {
      const payload = {
        channel: 'web',
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '123' },
        items: [],
      };

      const req = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await postOrdersHandler(req);
      expect(res.status).toBe(400);
    });

    it('fetches list of orders via GET with pagination metadata', async () => {
      const req = new NextRequest('http://localhost:3000/api/orders?page=1&limit=10');
      const res = await getOrdersHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.orders)).toBe(true);
    });
  });

  describe('GET & PATCH /api/orders/[id]', () => {
    it('fetches existing order by ID and returns 404 for missing ID', async () => {
      const getReq = new NextRequest('http://localhost:3000/api/orders/ORD-2026-1001');
      const res = await getOrderByIdHandler(getReq, {
        params: Promise.resolve({ id: 'ORD-2026-1001' }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.order.id).toBe('ORD-2026-1001');

      const notFoundReq = new NextRequest('http://localhost:3000/api/orders/ORD-UNKNOWN-999');
      const notFoundRes = await getOrderByIdHandler(notFoundReq, {
        params: Promise.resolve({ id: 'ORD-UNKNOWN-999' }),
      });
      expect(notFoundRes.status).toBe(404);
    });

    it('updates order status via PATCH', async () => {
      const patchReq = new NextRequest('http://localhost:3000/api/orders/ORD-2026-1001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' }),
      });

      const res = await patchOrderHandler(patchReq, {
        params: Promise.resolve({ id: 'ORD-2026-1001' }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.order.status).toBe('Delivered');
    });
  });

  describe('GET & POST /api/inventory', () => {
    it('fetches inventory records', async () => {
      const req = new NextRequest('http://localhost:3000/api/inventory');
      const res = await getInventoryHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.inventory.length).toBeGreaterThan(0);
    });

    it('adjusts stock level via POST /api/inventory', async () => {
      const req = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'ethiopia-yirgacheffe-chelbesa',
          amountKg: 10.0,
          reason: 'Restocked roasted batch',
        }),
      });

      const res = await postInventoryHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inventory.productId).toBe('ethiopia-yirgacheffe-chelbesa');
    });
  });

  describe('GET & POST /api/roast-batches', () => {
    it('fetches and creates roasting batch schedules', async () => {
      const getReq = new NextRequest('http://localhost:3000/api/roast-batches');
      const getRes = await getBatchesHandler(getReq);
      const getData = await getRes.json();

      expect(getRes.status).toBe(200);
      expect(getData.batches.length).toBeGreaterThan(0);

      const postReq = new NextRequest('http://localhost:3000/api/roast-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coffeeId: 'kenya-nyeri-hill-peaberry',
          coffeeName: 'Kenya Nyeri Hill Peaberry',
          origin: 'Kenya',
          roastProfile: 'Medium-Light',
          targetRoastedKg: 15.0,
          scheduledDate: '2026-04-28',
        }),
      });

      const postRes = await postBatchesHandler(postReq);
      const postData = await postRes.json();

      expect(postRes.status).toBe(200);
      expect(postData.batch.id).toMatch(/^BATCH-\d+/);
      expect(postData.batch.requiredGreenKg).toBeGreaterThan(15.0); // 15 / 0.85 = ~17.65
    });
  });

  describe('POST /api/checkout/stripe & Webhook', () => {
    it('initializes stripe checkout session in sandbox mode and returns session url', async () => {
      const req = new NextRequest('http://localhost:3000/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
              unitPrice: 22.5,
              quantity: 1,
              isSubscription: false,
            },
          ],
          customer: {
            firstName: 'Sarah',
            lastName: 'Connor',
            email: 'sarah.connor@example.com',
            phone: '+1 555 999 8888',
          },
        }),
      });

      const res = await postStripeCheckoutHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.sessionId).toBeDefined();
      expect(data.url).toContain(data.orderId);
    });

    it('processes webhook event checkout.session.completed', async () => {
      const webhookReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_webhook_123',
              client_reference_id: 'ORD-2026-1001',
              payment_intent: 'pi_test_123',
            },
          },
        }),
      });

      const res = await postStripeWebhookHandler(webhookReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});
