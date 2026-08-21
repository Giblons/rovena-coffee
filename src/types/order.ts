import { GrindOption, PackageWeight } from './coffee';
import { AppliedDiscount, OrderPricingSummary, SubscriptionFrequency } from './cart';

export type { OrderPricingSummary, AppliedDiscount, SubscriptionFrequency };

export type OrderStatus = 'Pending' | 'Roasting' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'paid' | 'pending_manual' | 'refunded' | 'failed';
export type OrderChannel = 'web' | 'whatsapp' | 'stripe';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  unit?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  origin: string;
  roastLevel: string;
  imageUrl?: string;
  weight: PackageWeight;
  weightGrams: number;
  grind: GrindOption;
  unitPrice: number;
  quantity: number;
  isSubscription: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
  subscriptionDiscountPercent: number;
  itemTotal: number;
}

export interface Order {
  id: string;              // e.g. "ORD-2026-1042"
  orderNumber: number;     // 1042
  channel: OrderChannel;   // 'web' | 'whatsapp' | 'stripe'
  source: string;          // "Web Checkout" | "WhatsApp Direct" | "Stripe Checkout"
  status: OrderStatus;     // 'Pending' | 'Roasting' | 'Dispatched' | 'Delivered'
  paymentStatus: PaymentStatus;
  paymentMethod: string;   // 'simulated_card' | 'whatsapp_manual' | 'stripe'
  
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express';
  
  items: OrderLineItem[];
  pricing: OrderPricingSummary;
  appliedDiscount?: AppliedDiscount | null;
  
  roastBatchId?: string | null;  // ID of the assigned roast batch
  trackingNumber?: string | null;
  notes?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  createdAt: string;       // ISO 8601 string
  updatedAt: string;
}

export interface CreateOrderPayload {
  channel: OrderChannel;
  source?: string;
  paymentMethod?: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express';
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    origin: string;
    roastLevel: string;
    imageUrl?: string;
    weight: PackageWeight;
    weightGrams: number;
    grind: GrindOption;
    basePrice250g: number;
    quantity: number;
    isSubscription: boolean;
    subscriptionFrequency?: SubscriptionFrequency;
  }>;
  appliedDiscountCode?: string;
  notes?: string;
}

export type UpdateOrderPayload = Partial<Omit<Order, 'id' | 'orderNumber' | 'createdAt'>>;
