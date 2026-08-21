import { GrindOption, PackageWeight, RoastLevel } from './coffee';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface CartItem {
  id: string; // Unique composite line-item ID
  productId: string;
  slug: string;
  name: string;
  origin: string;
  roastLevel: RoastLevel;
  imageUrl: string;
  
  // Custom Variant selections
  weight: PackageWeight;
  weightGrams: number; // 200, 250, 500, 1000
  grind: GrindOption;
  
  // Pricing
  basePrice250g: number;
  unitPrice: number;
  quantity: number;
  
  // Subscription configuration
  isSubscription: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
  subscriptionDiscountPercent: number; // e.g. 10 for 10%
}

export interface AppliedDiscount {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // 10 (for 10%), 20 (for $20 off), or 0 for free shipping
  description: string;
  minOrderValue?: number;
}

export interface OrderPricingSummary {
  itemsCount: number;
  totalGrams: number;
  grossSubtotal: number;       // Base price * qty before any discounts
  subscriptionSavings: number; // Total saved via recurring subscription
  netSubtotal: number;         // Subtotal after subscription discounts
  couponDiscount: number;      // Amount discounted via promo code
  shippingFee: number;         // $5.00 standard or $0.00 if >= $50 or FREESHIP
  tax: number;                 // Standard tax rate
  grandTotal: number;          // Final amount payable
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

export type CartSummary = OrderPricingSummary;

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedDiscount: AppliedDiscount | null;
  summary: CartSummary;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'unitPrice' | 'subscriptionDiscountPercent'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateVariant: (itemId: string, updates: { weight?: PackageWeight; grind?: GrindOption }) => void;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  removeDiscountCode: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
}
