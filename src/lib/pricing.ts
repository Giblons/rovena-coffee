import { AppliedDiscount, CartItem, OrderPricingSummary } from '@/types/cart';
import { PackageWeight } from '@/types/coffee';

export interface WeightOption {
  weightGrams: number;
  weight: PackageWeight;
  label: string;
  multiplier: number;
  savingsPercentage: number;
}

export const WEIGHT_OPTIONS: WeightOption[] = [
  { weightGrams: 200, weight: '200g', label: '200g Sample', multiplier: 0.85, savingsPercentage: 0 },
  { weightGrams: 250, weight: '250g', label: '250g Standard', multiplier: 1.0, savingsPercentage: 0 },
  { weightGrams: 500, weight: '500g', label: '500g Value', multiplier: 1.88, savingsPercentage: 6 },
  { weightGrams: 1000, weight: '1kg', label: '1kg Roaster Bag', multiplier: 3.45, savingsPercentage: 14 },
];

export const SUBSCRIPTION_DISCOUNT_PERCENT = 10;
export const FREE_SHIPPING_THRESHOLD = 50.0;
export const STANDARD_SHIPPING_FEE = 5.0;
export const EXPRESS_SHIPPING_FEE = 12.0;
export const TAX_RATE = 0.08;

/**
 * Calculates item unit price based on package weight multiplier and optional subscription discount.
 */
export function calculateItemUnitPrice(
  basePrice250g: number,
  weight: PackageWeight | number,
  isSubscription: boolean = false
): number {
  const weightGrams =
    typeof weight === 'number'
      ? weight
      : weight === '200g'
      ? 200
      : weight === '250g'
      ? 250
      : weight === '500g'
      ? 500
      : 1000;

  const option = WEIGHT_OPTIONS.find((w) => w.weightGrams === weightGrams) || WEIGHT_OPTIONS[1];
  const rawPrice = Math.round(basePrice250g * option.multiplier * 100) / 100;

  if (isSubscription) {
    return Math.round(rawPrice * (1 - SUBSCRIPTION_DISCOUNT_PERCENT / 100) * 100) / 100;
  }

  return rawPrice;
}

export interface PromoValidationResult {
  valid: boolean;
  message?: string;
  discount?: AppliedDiscount;
}

const PROMO_CODES: Record<
  string,
  {
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    description: string;
    minOrderValue?: number;
  }
> = {
  ROASTMASTER10: {
    type: 'percentage',
    value: 10,
    description: '10% off entire order',
  },
  ROASTMASTER15: {
    type: 'percentage',
    value: 15,
    description: '15% off entire order',
  },
  WELCOME10: {
    type: 'percentage',
    value: 10,
    description: '10% welcome discount',
  },
  FIRSTSIP: {
    type: 'percentage',
    value: 15,
    description: '15% off orders over $30.00',
    minOrderValue: 30.0,
  },
  BARISTA20: {
    type: 'fixed',
    value: 20.0,
    description: '$20.00 off orders over $75.00',
    minOrderValue: 75.0,
  },
  FREESHIP: {
    type: 'free_shipping',
    value: 0,
    description: 'Free standard shipping',
  },
};

/**
 * Validates a promotional coupon code against the current cart subtotal.
 */
export function validatePromoCode(code: string, currentNetSubtotal: number): PromoValidationResult {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  const cleanCode = code.trim().toUpperCase();
  const promo = PROMO_CODES[cleanCode];

  if (!promo) {
    return { valid: false, message: 'Invalid or unrecognized promotional code.' };
  }

  if (promo.minOrderValue && currentNetSubtotal < promo.minOrderValue) {
    return {
      valid: false,
      message: `Coupon ${cleanCode} requires a minimum order value of $${promo.minOrderValue.toFixed(2)}.`,
    };
  }

  return {
    valid: true,
    message: `Promo code ${cleanCode} applied successfully!`,
    discount: {
      code: cleanCode,
      type: promo.type,
      value: promo.value,
      description: promo.description,
      minOrderValue: promo.minOrderValue,
    },
  };
}

/**
 * Calculates complete order pricing summary with financial precision (2 decimal rounding).
 */
export function calculateOrderSummary(
  items: CartItem[],
  discount: AppliedDiscount | null = null,
  shippingMethod: 'standard' | 'express' = 'standard'
): OrderPricingSummary {
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalGrams = items.reduce((acc, item) => acc + item.weightGrams * item.quantity, 0);

  let grossSubtotal = 0;
  let subscriptionSavings = 0;

  items.forEach((item) => {
    const basePrice = item.basePrice250g || item.unitPrice;
    const regularUnitPrice = calculateItemUnitPrice(basePrice, item.weightGrams || item.weight, false);

    if (item.isSubscription) {
      const subUnitPrice = calculateItemUnitPrice(basePrice, item.weightGrams || item.weight, true);
      grossSubtotal += regularUnitPrice * item.quantity;
      subscriptionSavings += (regularUnitPrice - subUnitPrice) * item.quantity;
    } else {
      grossSubtotal += (item.unitPrice || regularUnitPrice) * item.quantity;
    }
  });

  const roundedGross = Math.round(grossSubtotal * 100) / 100;
  const roundedSubSavings = Math.round(subscriptionSavings * 100) / 100;
  const netSubtotal = Math.round((roundedGross - roundedSubSavings) * 100) / 100;

  let couponDiscount = 0;
  if (discount && netSubtotal > 0) {
    if (discount.type === 'percentage') {
      couponDiscount = Math.round(netSubtotal * (discount.value / 100) * 100) / 100;
    } else if (discount.type === 'fixed') {
      couponDiscount = Math.min(netSubtotal, Math.round(discount.value * 100) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, Math.round((netSubtotal - couponDiscount) * 100) / 100);

  let shippingFee = 0;
  let amountNeededForFreeShipping = 0;

  if (items.length === 0) {
    shippingFee = 0.0;
    amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD;
  } else if (shippingMethod === 'express') {
    shippingFee = EXPRESS_SHIPPING_FEE;
    amountNeededForFreeShipping = 0.0;
  } else if (discount?.type === 'free_shipping') {
    shippingFee = 0.0;
    amountNeededForFreeShipping = 0.0;
  } else if (discountedSubtotal >= FREE_SHIPPING_THRESHOLD) {
    shippingFee = 0.0;
    amountNeededForFreeShipping = 0.0;
  } else {
    shippingFee = STANDARD_SHIPPING_FEE;
    amountNeededForFreeShipping = Math.round((FREE_SHIPPING_THRESHOLD - discountedSubtotal) * 100) / 100;
  }

  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((discountedSubtotal + shippingFee + tax) * 100) / 100;

  return {
    itemsCount,
    totalGrams,
    grossSubtotal: roundedGross,
    subscriptionSavings: roundedSubSavings,
    netSubtotal,
    couponDiscount,
    shippingFee,
    tax,
    grandTotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping,
  };
}

/**
 * Calculates cart totals helper.
 */
export function calculateCartTotals(
  items: Array<{ unitPrice: number; quantity: number; isSubscription?: boolean }>,
  discountCode?: string
) {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  let discountAmount = 0;
  if (discountCode) {
    const promo = validatePromoCode(discountCode, subtotal);
    if (promo.valid && promo.discount) {
      if (promo.discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (promo.discount.value / 100) * 100) / 100;
      } else if (promo.discount.type === 'fixed') {
        discountAmount = Math.min(subtotal, promo.discount.value);
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const qualifiesForFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = qualifiesForFreeShipping || items.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const amountNeededForFreeShipping = qualifiesForFreeShipping
    ? 0
    : Math.max(0, Math.round((FREE_SHIPPING_THRESHOLD - discountedSubtotal) * 100) / 100);

  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + shipping + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    shipping,
    tax,
    total,
    qualifiesForFreeShipping,
    amountNeededForFreeShipping,
  };
}
