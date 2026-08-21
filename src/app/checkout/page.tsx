'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  Flame,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { PaymentSimulator } from '@/components/checkout/PaymentSimulator';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { CreateOrderPayload } from '@/types/order';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    summary,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
  } = useCart();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    unit: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    notes: '',
  });

  const [paymentDetails, setPaymentDetails] = useState<any>({
    status: 'valid',
    cardNumber: '4242 4242 4242 4242',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add coffee before checking out.');
      return;
    }

    if (!formData.firstName || !formData.email || !formData.street || !formData.city || !formData.postalCode) {
      setErrorMessage('Please fill in all required contact and shipping address fields.');
      return;
    }

    if (paymentDetails.status === 'declined' || paymentDetails.cardNumber?.replace(/\s+/g, '') === '4000000000000002') {
      setErrorMessage('Simulated Card Declined (Error 4000-DECLINED). Please switch to the valid 4242 test card.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderPayload: CreateOrderPayload = {
        channel: 'web',
        source: 'Web Checkout',
        paymentMethod: 'simulated_card',
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || '+1 (555) 019-8422',
        },
        shippingAddress: {
          street: formData.street.trim(),
          unit: formData.unit.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim() || 'WA',
          postalCode: formData.postalCode.trim(),
          country: formData.country,
        },
        shippingMethod,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          origin: i.origin,
          roastLevel: i.roastLevel,
          imageUrl: i.imageUrl,
          weight: i.weight,
          weightGrams: i.weightGrams,
          grind: i.grind,
          basePrice250g: i.basePrice250g,
          quantity: i.quantity,
          isSubscription: i.isSubscription,
          subscriptionFrequency: i.subscriptionFrequency,
        })),
        appliedDiscountCode: appliedDiscount?.code,
        notes: formData.notes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      router.push('/order-confirmation/' + data.order.id);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Checkout failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container size="md" className="py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-espresso-950">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-charcoal-600 font-sans">
          You don&apos;t have any coffee in your cart to checkout.
        </p>
        <div className="pt-4">
          <Link href="/catalog">
            <Button variant="primary" size="md">
              Return to Coffee Catalog
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="py-10 bg-canvas min-h-screen">
      <Container size="xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-800 hover:text-terracotta-600 transition-colors focus-ring"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form Column */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleCheckoutSubmit} className="space-y-8">
              {/* 1. Contact Info */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-serif font-bold text-base text-espresso-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-espresso-950 text-cream-400 text-xs flex items-center justify-center font-mono">
                      1
                    </span>
                    <span>Customer &amp; Contact Details</span>
                  </h3>
                  <span className="text-xs text-charcoal-500 font-sans">*Required fields</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Alex"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Morgan"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alex.morgan@example.com"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 382-9912"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-serif font-bold text-base text-espresso-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-espresso-950 text-cream-400 text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    <span>Shipping Destination</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso-950 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="742 Evergreen Terrace"
                    className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Apt / Suite
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Seattle"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="WA"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="98101"
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-950 mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Shipping Method */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-serif font-bold text-base text-espresso-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-espresso-950 text-cream-400 text-xs flex items-center justify-center font-mono">
                      3
                    </span>
                    <span>Roastery Delivery Method</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={
                      'flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ' +
                      (shippingMethod === 'standard'
                        ? 'border-terracotta-500 bg-terracotta-50/50 shadow-xs'
                        : 'border-border-medium hover:bg-cream-600/50')
                    }
                  >
                    <input
                      type="radio"
                      name="shippingMethodRadio"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-0.5 text-terracotta-500 focus-ring"
                    />
                    <div className="text-xs font-sans space-y-1">
                      <div className="font-bold text-espresso-950 flex items-center justify-between">
                        <span>Standard Fresh Roast</span>
                        <span className="font-mono text-terracotta-600">
                          {summary.shippingFee === 0 ? 'FREE' : '$5.00'}
                        </span>
                      </div>
                      <p className="text-charcoal-600 text-[11px]">
                        3–5 business days • Free on orders over $50
                      </p>
                    </div>
                  </label>

                  <label
                    className={
                      'flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ' +
                      (shippingMethod === 'express'
                        ? 'border-terracotta-500 bg-terracotta-50/50 shadow-xs'
                        : 'border-border-medium hover:bg-cream-600/50')
                    }
                  >
                    <input
                      type="radio"
                      name="shippingMethodRadio"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-0.5 text-terracotta-500 focus-ring"
                    />
                    <div className="text-xs font-sans space-y-1">
                      <div className="font-bold text-espresso-950 flex items-center justify-between">
                        <span>Roastmaster Express</span>
                        <span className="font-mono text-terracotta-600">$12.00</span>
                      </div>
                      <p className="text-charcoal-600 text-[11px]">
                        1–2 business days • Priority drum dispatch
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso-950 mb-1">
                    Special Roaster Notes / Delivery Instructions
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Leave package by side porch, please roast profile light-medium..."
                    className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring resize-none"
                  />
                </div>
              </div>

              {/* 4. Payment Simulation */}
              <div className="p-6 rounded-xl bg-surface border border-border-subtle shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="font-serif font-bold text-base text-espresso-950 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-espresso-950 text-cream-400 text-xs flex items-center justify-center font-mono">
                      4
                    </span>
                    <span>Payment Simulation &amp; Verification</span>
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-olive-600 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sandbox Encrypted</span>
                  </div>
                </div>

                <PaymentSimulator
                  onPaymentValidChange={(isValid, details) => {
                    setPaymentDetails(details);
                  }}
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Complete Order Button */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-base font-semibold shadow-elevated py-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Securing Order &amp; Reserving Beans...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Authorize &amp; Place Order • $
                        {(
                          summary.netSubtotal -
                          summary.couponDiscount +
                          (shippingMethod === 'express' ? 12.0 : summary.shippingFee) +
                          summary.tax
                        ).toFixed(2)}
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-charcoal-500 font-sans pt-2">
                  By confirming, your fresh roast reservation is logged and synced with our roastery schedule.
                </p>
              </div>
            </form>
          </div>

          {/* Sidebar Order Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-surface border border-border-subtle shadow-card space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <h3 className="font-serif font-bold text-base text-espresso-950">
                  Order Summary ({summary.itemsCount} bag{summary.itemsCount === 1 ? '' : 's'})
                </h3>
                <span className="font-mono text-xs text-charcoal-500">
                  {summary.totalGrams}g total
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-border-subtle/50 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-espresso-900 flex-shrink-0 border border-subtle">
                      <Image
                        src={item.imageUrl || '/images/coffees/ethiopia-chelbesa.jpg'}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-xs text-espresso-950 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 font-sans">
                        <span>{item.weight}</span>
                        <span>•</span>
                        <span className="capitalize">{item.grind.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.isSubscription && (
                        <span className="inline-flex text-[10px] text-terracotta-600 font-medium font-sans">
                          🔄 {item.subscriptionFrequency || 'Monthly'} Subscription (10% Off)
                        </span>
                      )}
                    </div>
                    <div className="text-right font-serif font-bold text-xs text-espresso-950">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-subtle">
                <PromoCodeInput
                  appliedDiscount={appliedDiscount}
                  onApply={applyDiscountCode}
                  onRemove={removeDiscountCode}
                />
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 pt-3 border-t border-subtle text-xs font-sans">
                <div className="flex justify-between text-charcoal-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono text-espresso-900">${summary.grossSubtotal.toFixed(2)}</span>
                </div>

                {summary.subscriptionSavings > 0 && (
                  <div className="flex justify-between text-terracotta-600 font-medium">
                    <span>Subscriber Savings (10% off)</span>
                    <span className="font-mono">-${summary.subscriptionSavings.toFixed(2)}</span>
                  </div>
                )}

                {summary.couponDiscount > 0 && (
                  <div className="flex justify-between text-olive-600 font-medium">
                    <span>Promo Discount ({appliedDiscount?.code})</span>
                    <span className="font-mono">-${summary.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping ({shippingMethod === 'express' ? 'Roastmaster Express' : 'Standard Roast'})</span>
                  <span className="font-mono text-espresso-900">
                    {shippingMethod === 'express'
                      ? '$12.00'
                      : summary.shippingFee === 0
                      ? <strong className="text-olive-600">FREE</strong>
                      : '$5.00'}
                  </span>
                </div>

                <div className="flex justify-between text-charcoal-600">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="font-mono text-espresso-900">${summary.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-serif font-bold text-espresso-950 pt-3 border-t border-subtle">
                  <span>Grand Total</span>
                  <span className="font-mono text-terracotta-600 font-sans font-bold">
                    ${(
                      summary.netSubtotal -
                      summary.couponDiscount +
                      (shippingMethod === 'express' ? 12.0 : summary.shippingFee) +
                      summary.tax
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Roasting Batch Promise */}
              <div className="p-3 bg-cream-500 rounded-lg border border-subtle space-y-1 text-xs font-sans">
                <div className="flex items-center gap-1.5 text-terracotta-600 font-semibold">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>Roast-to-Order Freshness Guarantee</span>
                </div>
                <p className="text-[11px] text-charcoal-600">
                  Your beans will be roasted on our upcoming Monday/Thursday batch session and shipped within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
