import {
  Order,
  CreateOrderPayload,
  UpdateOrderPayload,
  OrderLineItem,
  OrderPricingSummary,
  OrderStatus,
} from '@/types/order';
import { getWeightMultiplier, PackageWeight } from '@/types/coffee';
import { inventoryRepository } from './inventory-repository';

const DEFAULT_ORDERS: Order[] = [
  // 1. Existing order for test compatibility
  {
    id: 'ORD-2026-1001',
    orderNumber: 1001,
    channel: 'web',
    source: 'Web Checkout',
    status: 'Roasting',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 234-5678',
    },
    shippingAddress: {
      street: '1420 5th Ave',
      unit: 'Suite 800',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    },
    shippingMethod: 'standard',
    items: [
      {
        id: 'ORD-2026-1001-item-1',
        productId: 'ethiopia-yirgacheffe-chelbesa',
        name: 'Ethiopia Yirgacheffe Chelbesa',
        slug: 'ethiopia-yirgacheffe-chelbesa',
        origin: 'Ethiopia',
        roastLevel: 'Light',
        imageUrl: '/images/coffees/ethiopia-chelbesa.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'v60_drip',
        unitPrice: 22.5,
        quantity: 2,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 45.0,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 500,
      grossSubtotal: 45.0,
      subscriptionSavings: 0,
      netSubtotal: 45.0,
      couponDiscount: 0,
      shippingFee: 5.0,
      tax: 3.6,
      grandTotal: 53.6,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 5.0,
    },
    roastBatchId: 'BATCH-20260421-001',
    notes: 'Please roast on Monday batch.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  // 2. WhatsApp Direct Order — Pending
  {
    id: 'ORD-2026-1002',
    orderNumber: 1002,
    channel: 'whatsapp',
    source: 'WhatsApp Direct',
    status: 'Pending',
    paymentStatus: 'pending_manual',
    paymentMethod: 'whatsapp_manual',
    customer: {
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (555) 382-9912',
    },
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
    },
    shippingMethod: 'express',
    items: [
      {
        id: 'ORD-2026-1002-item-1',
        productId: 'colombia-el-paraiso-thermal-shock',
        name: 'Colombia El Paraiso Thermal Shock',
        slug: 'colombia-el-paraiso-thermal-shock',
        origin: 'Colombia',
        roastLevel: 'Light',
        imageUrl: '/images/coffees/colombia-el-paraiso.jpg',
        weight: '500g',
        weightGrams: 500,
        grind: 'espresso',
        unitPrice: 48.88,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 48.88,
      },
      {
        id: 'ORD-2026-1002-item-2',
        productId: 'kenya-nyeri-gakuyu-ini-aa',
        name: 'Kenya Nyeri Gakuyu-ini AA',
        slug: 'kenya-nyeri-gakuyu-ini-aa',
        origin: 'Kenya',
        roastLevel: 'Light',
        imageUrl: '/images/coffees/kenya-gakuyuini.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'v60_drip',
        unitPrice: 21.0,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 21.0,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 750,
      grossSubtotal: 69.88,
      subscriptionSavings: 0,
      netSubtotal: 69.88,
      couponDiscount: 0,
      shippingFee: 12.0,
      tax: 5.59,
      grandTotal: 87.47,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 0,
    },
    notes: 'Prefers bank transfer verification via WhatsApp chat.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  // 3. Web Subscription Order — Pending
  {
    id: 'ORD-2026-1003',
    orderNumber: 1003,
    channel: 'web',
    source: 'Web Checkout (Subscription)',
    status: 'Pending',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Chloe',
      lastName: 'Dupont',
      email: 'chloe.dupont@example.com',
      phone: '+1 (555) 834-1190',
    },
    shippingAddress: {
      street: '2200 Westlake Ave',
      unit: 'Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98121',
      country: 'United States',
    },
    shippingMethod: 'standard',
    items: [
      {
        id: 'ORD-2026-1003-item-1',
        productId: 'lumina-apex-house-espresso-blend',
        name: 'Apex House Espresso Blend',
        slug: 'lumina-apex-house-espresso-blend',
        origin: 'Multi-Origin Blend',
        roastLevel: 'Medium',
        imageUrl: '/images/coffees/lumina-apex-blend.jpg',
        weight: '1kg',
        weightGrams: 1000,
        grind: 'whole_bean',
        unitPrice: 54.34, // 17.5 * 3.45 * 0.9 = ~54.34
        quantity: 1,
        isSubscription: true,
        subscriptionFrequency: 'biweekly',
        subscriptionDiscountPercent: 10,
        itemTotal: 54.34,
      },
    ],
    pricing: {
      itemsCount: 1,
      totalGrams: 1000,
      grossSubtotal: 60.38,
      subscriptionSavings: 6.04,
      netSubtotal: 54.34,
      couponDiscount: 0,
      shippingFee: 0.0,
      tax: 4.35,
      grandTotal: 58.69,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 0,
    },
    notes: 'Leave package at concierge desk.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  // 4. WhatsApp Direct Order — Dispatched
  {
    id: 'ORD-2026-1004',
    orderNumber: 1004,
    channel: 'whatsapp',
    source: 'WhatsApp Direct',
    status: 'Dispatched',
    paymentStatus: 'paid',
    paymentMethod: 'whatsapp_manual',
    customer: {
      firstName: 'Mateo',
      lastName: 'Silva',
      email: 'mateo.silva@example.com',
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
        id: 'ORD-2026-1004-item-1',
        productId: 'costa-rica-tarrazu-mozart-honey',
        name: 'Costa Rica Tarrazú Canet Mozart',
        slug: 'costa-rica-tarrazu-mozart-honey',
        origin: 'Costa Rica',
        roastLevel: 'Medium-Light',
        imageUrl: '/images/coffees/costa-rica-mozart.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'aeropress',
        unitPrice: 23.0,
        quantity: 2,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 46.0,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 500,
      grossSubtotal: 46.0,
      subscriptionSavings: 0,
      netSubtotal: 46.0,
      couponDiscount: 0,
      shippingFee: 5.0,
      tax: 3.68,
      grandTotal: 54.68,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 4.0,
    },
    trackingNumber: 'USPS-940011189922319028',
    notes: 'Paid via Venmo link confirmed on WhatsApp.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  // 5. Web Order — Delivered
  {
    id: 'ORD-2026-1005',
    orderNumber: 1005,
    channel: 'web',
    source: 'Web Checkout',
    status: 'Delivered',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 771-4098',
    },
    shippingAddress: {
      street: '880 Broadway',
      unit: 'Penthouse B',
      city: 'New York',
      state: 'NY',
      postalCode: '10003',
      country: 'United States',
    },
    shippingMethod: 'express',
    items: [
      {
        id: 'ORD-2026-1005-item-1',
        productId: 'guatemala-huehuetenango-bella-carmona',
        name: 'Guatemala Huehuetenango Bella Carmona',
        slug: 'guatemala-huehuetenango-bella-carmona',
        origin: 'Guatemala',
        roastLevel: 'Medium',
        imageUrl: '/images/coffees/guatemala-carmona.jpg',
        weight: '500g',
        weightGrams: 500,
        grind: 'french_press',
        unitPrice: 35.72,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 35.72,
      },
      {
        id: 'ORD-2026-1005-item-2',
        productId: 'sumatra-kerinci-tiger-wet-hulled',
        name: 'Sumatra Mount Kerinci Tiger',
        slug: 'sumatra-kerinci-tiger-wet-hulled',
        origin: 'Indonesia',
        roastLevel: 'Medium-Dark',
        imageUrl: '/images/coffees/sumatra-kerinci.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'cold_brew',
        unitPrice: 18.5,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 18.5,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 750,
      grossSubtotal: 54.22,
      subscriptionSavings: 0,
      netSubtotal: 54.22,
      couponDiscount: 0,
      shippingFee: 12.0,
      tax: 4.34,
      grandTotal: 70.56,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 0,
    },
    trackingNumber: 'FEDEX-781920038812',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  // 6. Web Subscription Order — Pending
  {
    id: 'ORD-2026-1006',
    orderNumber: 1006,
    channel: 'web',
    source: 'Web Checkout (Subscription)',
    status: 'Pending',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Liam',
      lastName: 'Kowalski',
      email: 'liam.k@example.com',
      phone: '+1 (555) 441-2099',
    },
    shippingAddress: {
      street: '1201 Pine St',
      city: 'Boulder',
      state: 'CO',
      postalCode: '80302',
      country: 'United States',
    },
    shippingMethod: 'standard',
    items: [
      {
        id: 'ORD-2026-1006-item-1',
        productId: 'ethiopia-yirgacheffe-chelbesa',
        name: 'Ethiopia Yirgacheffe Chelbesa',
        slug: 'ethiopia-yirgacheffe-chelbesa',
        origin: 'Ethiopia',
        roastLevel: 'Light',
        imageUrl: '/images/coffees/ethiopia-chelbesa.jpg',
        weight: '250g',
        weightGrams: 250,
        grind: 'v60_drip',
        unitPrice: 20.25, // 22.50 * 0.9 = 20.25
        quantity: 2,
        isSubscription: true,
        subscriptionFrequency: 'weekly',
        subscriptionDiscountPercent: 10,
        itemTotal: 40.5,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 500,
      grossSubtotal: 45.0,
      subscriptionSavings: 4.5,
      netSubtotal: 40.5,
      couponDiscount: 0,
      shippingFee: 5.0,
      tax: 3.24,
      grandTotal: 48.74,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 9.5,
    },
    notes: 'Please ensure whole bean grind setting is calibrated for light roast filter.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

let inMemoryOrders: Order[] = JSON.parse(JSON.stringify(DEFAULT_ORDERS));
let orderCounter = 1006;

export class OrderRepository {
  private calculateOrderPricing(
    items: Array<{
      basePrice250g: number;
      weight: PackageWeight;
      quantity: number;
      isSubscription: boolean;
    }>,
    shippingMethod: 'standard' | 'express' = 'standard',
    appliedDiscountCode?: string
  ): { pricing: OrderPricingSummary; discountAmount: number; appliedDiscount: any } {
    const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const weightMap: Record<PackageWeight, number> = {
      '200g': 200,
      '250g': 250,
      '500g': 500,
      '1kg': 1000,
    };
    const totalGrams = items.reduce((sum, i) => sum + (weightMap[i.weight] || 250) * i.quantity, 0);

    const grossSubtotal = items.reduce((sum, i) => {
      const reg = i.basePrice250g * getWeightMultiplier(i.weight);
      return sum + reg * i.quantity;
    }, 0);

    const subAfterSubscription = items.reduce((sum, i) => {
      const reg = i.basePrice250g * getWeightMultiplier(i.weight);
      const price = i.isSubscription ? Number((reg * 0.9).toFixed(2)) : Number(reg.toFixed(2));
      return sum + price * i.quantity;
    }, 0);

    const subscriptionSavings = Math.max(0, grossSubtotal - subAfterSubscription);

    let couponDiscount = 0;
    let appliedDiscount: any = null;

    if (appliedDiscountCode) {
      const clean = appliedDiscountCode.toUpperCase().trim();
      if (clean === 'ROASTMASTER10' || clean === 'WELCOME10') {
        couponDiscount = (subAfterSubscription * 10) / 100;
        appliedDiscount = { code: clean, type: 'percentage', value: 10, description: '10% discount' };
      } else if (clean === 'ROASTER20') {
        couponDiscount = (subAfterSubscription * 20) / 100;
        appliedDiscount = { code: 'ROASTER20', type: 'percentage', value: 20, description: '20% Roaster VIP discount' };
      } else if (clean === 'FREESHIP') {
        appliedDiscount = { code: 'FREESHIP', type: 'free_shipping', value: 0, description: 'Free shipping' };
      }
    }

    const netSubtotal = Number((subAfterSubscription - couponDiscount).toFixed(2));

    const freeShippingThreshold = 50.0;
    const isFreeShipping =
      appliedDiscountCode?.toUpperCase() === 'FREESHIP' || (netSubtotal >= freeShippingThreshold && shippingMethod !== 'express');
    const shippingFee = shippingMethod === 'express' ? 12.0 : isFreeShipping || items.length === 0 ? 0.0 : 5.0;

    const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);
    const taxableAmount = netSubtotal;
    const tax = Number((taxableAmount * 0.08).toFixed(2));
    const grandTotal = Number((netSubtotal + shippingFee + tax).toFixed(2));

    return {
      pricing: {
        itemsCount,
        totalGrams,
        grossSubtotal: Number(grossSubtotal.toFixed(2)),
        subscriptionSavings: Number(subscriptionSavings.toFixed(2)),
        netSubtotal,
        couponDiscount: Number(couponDiscount.toFixed(2)),
        shippingFee,
        tax,
        grandTotal,
        freeShippingThreshold,
        amountNeededForFreeShipping: Number(amountNeededForFreeShipping.toFixed(2)),
      },
      discountAmount: Number(couponDiscount.toFixed(2)),
      appliedDiscount,
    };
  }

  public findAll(filter?: { channel?: string; status?: string; search?: string }): Order[] {
    let result = inMemoryOrders;
    if (filter?.channel && filter.channel !== 'all') {
      const chan = filter.channel.toLowerCase();
      if (chan === 'subscription' || chan === 'subscriptions') {
        result = result.filter((o) => o.items.some((i) => i.isSubscription));
      } else {
        result = result.filter((o) => o.channel.toLowerCase() === chan);
      }
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((o) => o.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          (o.customer.phone && o.customer.phone.toLowerCase().includes(q)) ||
          o.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.origin.toLowerCase().includes(q) ||
              i.productId.toLowerCase().includes(q)
          )
      );
    }
    return result;
  }

  public findById(id: string): Order | undefined {
    return inMemoryOrders.find((o) => o.id === id);
  }

  public findByCustomerEmail(email: string): Order[] {
    return inMemoryOrders.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase());
  }

  public create(payload: CreateOrderPayload): Order {
    orderCounter += 1;
    const year = new Date().getFullYear();
    const orderId = `ORD-${year}-${orderCounter}`;

    const { pricing, appliedDiscount } = this.calculateOrderPricing(
      payload.items,
      payload.shippingMethod,
      payload.appliedDiscountCode
    );

    const weightMap: Record<PackageWeight, number> = {
      '200g': 200,
      '250g': 250,
      '500g': 500,
      '1kg': 1000,
    };

    const lineItems: OrderLineItem[] = payload.items.map((item, idx) => {
      const regularPrice = item.basePrice250g * getWeightMultiplier(item.weight);
      const unitPrice = item.isSubscription ? Number((regularPrice * 0.9).toFixed(2)) : Number(regularPrice.toFixed(2));
      const itemTotal = Number((unitPrice * item.quantity).toFixed(2));
      const itemWeightGrams = item.weightGrams || weightMap[item.weight] || 250;

      // Reserve stock in inventory
      const weightKg = (itemWeightGrams * item.quantity) / 1000;
      inventoryRepository.reserveStock(item.productId, weightKg);

      return {
        id: `${orderId}-item-${idx + 1}`,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        origin: item.origin,
        roastLevel: item.roastLevel,
        imageUrl: item.imageUrl,
        weight: item.weight,
        weightGrams: itemWeightGrams,
        grind: item.grind,
        unitPrice,
        quantity: item.quantity,
        isSubscription: item.isSubscription,
        subscriptionFrequency: item.subscriptionFrequency,
        subscriptionDiscountPercent: item.isSubscription ? 10 : 0,
        itemTotal,
      };
    });

    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderCounter,
      channel: payload.channel,
      source: payload.source || (payload.channel === 'whatsapp' ? 'WhatsApp Direct' : 'Web Checkout'),
      status: 'Pending',
      paymentStatus: payload.paymentMethod === 'whatsapp_manual' || payload.channel === 'whatsapp' ? 'pending_manual' : 'paid',
      paymentMethod: payload.paymentMethod || (payload.channel === 'whatsapp' ? 'whatsapp_manual' : 'simulated_card'),
      customer: payload.customer,
      shippingAddress: payload.shippingAddress,
      shippingMethod: payload.shippingMethod,
      items: lineItems,
      pricing,
      appliedDiscount,
      roastBatchId: null,
      trackingNumber: null,
      notes: payload.notes,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryOrders.unshift(newOrder);
    return newOrder;
  }

  public updateStatus(
    id: string,
    statusOrUpdates: OrderStatus | UpdateOrderPayload,
    roastBatchId?: string,
    trackingNumber?: string
  ): Order | undefined {
    const index = inMemoryOrders.findIndex((o) => o.id === id);
    if (index === -1) return undefined;

    const existing = inMemoryOrders[index];
    let updates: UpdateOrderPayload = {};

    if (typeof statusOrUpdates === 'string') {
      updates.status = statusOrUpdates;
      if (roastBatchId) updates.roastBatchId = roastBatchId;
      if (trackingNumber) updates.trackingNumber = trackingNumber;
    } else {
      updates = statusOrUpdates;
    }

    const updated: Order = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders[index] = updated;
    return updated;
  }
}

export const orderRepository = new OrderRepository();

export function createOrder(payload: CreateOrderPayload): Order {
  return orderRepository.create(payload);
}

export function getOrderById(id: string): Order | undefined {
  return orderRepository.findById(id);
}

export function getAllOrders(filter?: { channel?: string; status?: string; search?: string }): Order[] {
  return orderRepository.findAll(filter);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  roastBatchId?: string,
  trackingNumber?: string
): Order | undefined {
  return orderRepository.updateStatus(id, status, roastBatchId, trackingNumber);
}

export function updateOrder(id: string, updates: UpdateOrderPayload): Order | undefined {
  return orderRepository.updateStatus(id, updates);
}

export function resetOrdersStore(): void {
  inMemoryOrders = JSON.parse(JSON.stringify(DEFAULT_ORDERS));
  orderCounter = 1006;
}
