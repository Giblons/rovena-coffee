import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  resetDbState,
  getInventory,
} from '@/lib/db';
import { CreateOrderPayload } from '@/types/order';

describe('Order Creation & Persistence API — Integration Tests (Tier 3)', () => {
  beforeEach(() => {
    resetDbState();
  });

  const baseWebOrderPayload: CreateOrderPayload = {
    channel: 'web',
    customer: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@example.com',
      phone: '+1 555 492 8812',
    },
    shippingAddress: {
      street: '100 Artisan Way',
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
        weight: '250g',
        weightGrams: 250,
        grind: 'v60_drip',
        basePrice250g: 22.5,
        quantity: 2,
        isSubscription: false,
      },
    ],
    appliedDiscountCode: 'ROASTMASTER10',
    notes: 'Please roast on Monday batch.',
  };

  describe('Tier 3: Order Creation & Channel Specifics', () => {
    it('should create a Web order with paymentStatus "paid" and status "Pending"', () => {
      const order = createOrder(baseWebOrderPayload);

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.channel).toBe('web');
      expect(order.paymentStatus).toBe('paid');
      expect(order.status).toBe('Pending');
      expect(order.items.length).toBe(1);
      expect(order.items[0].quantity).toBe(2);
      expect(order.customer.email).toBe('elena@example.com');
    });

    it('should create a WhatsApp order with paymentStatus "pending_manual" and source "WhatsApp Direct"', () => {
      const whatsappPayload: CreateOrderPayload = {
        ...baseWebOrderPayload,
        channel: 'whatsapp',
        source: 'WhatsApp Direct Order',
      };

      const order = createOrder(whatsappPayload);

      expect(order).toBeDefined();
      expect(order.channel).toBe('whatsapp');
      expect(order.paymentStatus).toBe('pending_manual');
      expect(order.status).toBe('Pending');
    });

    it('should format unique human-readable Order IDs matching ORD-YYYY-XXXX format', () => {
      const order1 = createOrder(baseWebOrderPayload);
      const order2 = createOrder(baseWebOrderPayload);

      expect(order1.id).toMatch(/^ORD-\d{4}-\d+/);
      expect(order2.id).toMatch(/^ORD-\d{4}-\d+/);
      expect(order1.id).not.toBe(order2.id);
    });

    it('should recalculate pricing server-side to guarantee integrity', () => {
      const order = createOrder(baseWebOrderPayload);

      // 2 * 22.50 = 45.00
      // 10% coupon = 4.50
      // Net subtotal = 40.50 (< 50 => shipping $5.00)
      // Tax 8% of 40.50 = 3.24
      // Grand total = 40.50 + 5.00 + 3.24 = 48.74
      expect(order.pricing.grossSubtotal).toBe(45.0);
      expect(order.pricing.couponDiscount).toBe(4.5);
      expect(order.pricing.netSubtotal).toBe(40.5);
      expect(order.pricing.shippingFee).toBe(5.0);
      expect(order.pricing.tax).toBe(3.24);
      expect(order.pricing.grandTotal).toBe(48.74);
    });
  });

  describe('Tier 3: Inventory Stock Reservation & Decrement', () => {
    it('should decrement/reserve inventory stock when an order is created', () => {
      const initialInventory = getInventory();
      const chelbesaStock = initialInventory.find(
        (i) => i.productId === 'ethiopia-yirgacheffe-chelbesa'
      );
      expect(chelbesaStock).toBeDefined();
      const initialReserved = chelbesaStock!.reservedStockKg || 0;

      // Create order with 2x 250g (0.5 kg total)
      createOrder(baseWebOrderPayload);

      const updatedInventory = getInventory();
      const updatedStock = updatedInventory.find(
        (i) => i.productId === 'ethiopia-yirgacheffe-chelbesa'
      );
      expect(updatedStock!.reservedStockKg).toBeCloseTo(initialReserved + 0.5, 2);
    });
  });

  describe('Tier 3: Order Retrieval, Filtering & Status Updates', () => {
    it('should fetch order by ID', () => {
      const created = createOrder(baseWebOrderPayload);
      const fetched = getOrderById(created.id);

      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.customer.firstName).toBe('Elena');
    });

    it('should return undefined when fetching non-existent order ID', () => {
      const fetched = getOrderById('ORD-NON-EXISTENT-9999');
      expect(fetched).toBeUndefined();
    });

    it('should filter orders by channel (web vs whatsapp)', () => {
      createOrder(baseWebOrderPayload); // web
      createOrder({ ...baseWebOrderPayload, channel: 'whatsapp' }); // whatsapp

      const allOrders = getAllOrders();
      const webOrders = getAllOrders({ channel: 'web' });
      const whatsappOrders = getAllOrders({ channel: 'whatsapp' });

      expect(allOrders.length).toBeGreaterThanOrEqual(2);
      expect(webOrders.length).toBeGreaterThanOrEqual(1);
      expect(whatsappOrders.length).toBeGreaterThanOrEqual(1);
      webOrders.forEach((o) => expect(o.channel).toBe('web'));
      whatsappOrders.forEach((o) => expect(o.channel).toBe('whatsapp'));
    });

    it('should update order status through fulfillment lifecycle (Pending -> Roasting -> Dispatched -> Delivered)', () => {
      const order = createOrder(baseWebOrderPayload);
      expect(order.status).toBe('Pending');

      const roastingOrder = updateOrderStatus(order.id, 'Roasting', 'BATCH-2026-W34-MON');
      expect(roastingOrder?.status).toBe('Roasting');
      expect(roastingOrder?.roastBatchId).toBe('BATCH-2026-W34-MON');

      const dispatchedOrder = updateOrderStatus(order.id, 'Dispatched', undefined, 'TRACK-USPS-88219');
      expect(dispatchedOrder?.status).toBe('Dispatched');
      expect(dispatchedOrder?.trackingNumber).toBe('TRACK-USPS-88219');

      const deliveredOrder = updateOrderStatus(order.id, 'Delivered');
      expect(deliveredOrder?.status).toBe('Delivered');
    });
  });
});
