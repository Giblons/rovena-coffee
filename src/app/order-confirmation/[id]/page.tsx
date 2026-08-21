'use client';

import React, { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';
import { useFormatCurrency } from '@/context/PreferencesContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  MessageSquare,
  Truck,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types/order';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const formatCurrency = useFormatCurrency();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fire confetti on first mount
    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#c97a52', '#3d261e', '#a3a088', '#f2d5b6'],
      });
    } catch {
      // Confetti is decorative, silent fail
    }

    // Fetch order details from backend
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrder(data.order);
          } else {
            setError(data.error || 'Order not found');
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <Container size="md" className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif text-lg text-espresso-900">
          Retrieving your roast reservation...
        </p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container size="md" className="py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-espresso-950">
          Order Not Found
        </h2>
        <p className="text-sm text-charcoal-600 font-sans">
          {error || `We could not locate an order matching ID ${orderId}.`}
        </p>
        <div className="pt-4">
          <Link href="/catalog">
            <Button variant="primary" size="md">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </Container>
    );
  }


  return (
    <div className="py-12 bg-canvas min-h-screen">
      <Container size="lg" className="space-y-8">
        {/* Top Success Banner */}
        <div className="p-8 rounded-2xl bg-surface border border-border-subtle shadow-card text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-espresso-950">
            Roast Reservation Confirmed!
          </h1>
          <p className="text-sm text-charcoal-600 font-sans max-w-lg mx-auto">
            Thank you, <strong className="text-espresso-950 font-semibold">{order.customer.firstName}</strong>. Your order has been registered in our micro-batch roasting queue.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-500 border border-border-subtle text-xs font-mono font-medium text-espresso-900">
            <span>Order ID:</span>
            <strong className="text-terracotta-600 font-bold">{order.id}</strong>
          </div>
        </div>

        {/* 4-Stage Roast Tracking Timeline */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-espresso-950">
                Fresh Roast Lifecycle
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Scheduled for Next Roasting Drum Session: <strong className="text-espresso-950 font-mono">Upcoming Roasting Day</strong>
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-olive-600 bg-olive-50 px-2.5 py-1 rounded-md border border-olive-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct-Trade Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-olive-50 border border-olive-300 space-y-2">
              <div className="flex items-center gap-2 text-olive-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Order Logged</span>
              </div>
              <p className="text-[11px] text-olive-900 leading-snug">
                Green bean inventory allocated and reserved from hermetic storage.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-cream-500/80 border border-terracotta-300 space-y-2">
              <div className="flex items-center gap-2 text-terracotta-700 font-bold text-xs">
                <Flame className="w-4 h-4 animate-pulse" />
                <span>2. Scheduled Roast</span>
              </div>
              <p className="text-[11px] text-charcoal-700 leading-snug">
                {order.roastBatchId ? `Assigned to Batch ${order.roastBatchId}` : 'Assigned to Drum Session'}.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2 opacity-75">
              <div className="flex items-center gap-2 text-charcoal-500 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>3. Degas &amp; Pack</span>
              </div>
              <p className="text-[11px] text-charcoal-500 leading-snug">
                48hr natural degassing window and nitrogen-flushed valve sealing.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2 opacity-75">
              <div className="flex items-center gap-2 text-charcoal-500 font-bold text-xs">
                <Truck className="w-4 h-4" />
                <span>4. Shipped Fresh</span>
              </div>
              <p className="text-[11px] text-charcoal-500 leading-snug">
                Dispatched via {order.shippingMethod === 'express' ? 'Roastmaster Express' : 'Standard Delivery'} with live tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Itemized Receipt Table */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <h2 className="font-serif font-bold text-lg text-espresso-950">
                Itemized Order Receipt
              </h2>
              <span className="text-xs font-mono text-charcoal-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="divide-y divide-border-subtle">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-espresso-900 flex-shrink-0 border border-subtle">
                    <Image
                      src={item.imageUrl || '/images/coffees/ethiopia-chelbesa.jpg'}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-sm text-espresso-950 truncate">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-500 font-sans mt-0.5">
                      <span>{item.weight} ({item.weightGrams}g)</span>
                      <span>•</span>
                      <span className="capitalize">{item.grind.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    {item.isSubscription && (
                      <span className="inline-flex text-[11px] text-terracotta-600 font-medium font-sans mt-1">
                        🔄 {item.subscriptionFrequency || 'Monthly'} Subscription (10% Off)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-sm text-espresso-950">
                      {formatCurrency(item.itemTotal || item.unitPrice * item.quantity)}
                    </p>
                    <p className="text-[11px] text-charcoal-400 font-mono">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-border-subtle space-y-2 text-xs font-sans">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-mono text-espresso-900">{formatCurrency(order.pricing.grossSubtotal)}</span>
              </div>

              {order.pricing.subscriptionSavings > 0 && (
                <div className="flex justify-between text-terracotta-600 font-medium">
                  <span>Subscription Savings</span>
                  <span className="font-mono">-{formatCurrency(order.pricing.subscriptionSavings)}</span>
                </div>
              )}

              {order.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-olive-600 font-medium">
                  <span>Discount Applied ({order.appliedDiscount?.code || 'Promo'})</span>
                  <span className="font-mono">-{formatCurrency(order.pricing.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Shipping ({order.shippingMethod === 'express' ? 'Express Dispatch' : 'Standard Roast'})</span>
                <span className="font-mono text-espresso-900">
                  {order.pricing.shippingFee === 0 ? <strong className="text-olive-600">FREE</strong> : formatCurrency(order.pricing.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Tax</span>
                <span className="font-mono text-espresso-900">{formatCurrency(order.pricing.tax)}</span>
              </div>

              <div className="flex justify-between text-base font-serif font-bold text-espresso-950 pt-3 border-t border-border-subtle">
                <span>Total Paid</span>
                <span className="font-mono text-terracotta-600 text-lg">{formatCurrency(order.pricing.grandTotal)}</span>
              </div>
            </div>

            {/* Special Instructions if present */}
            {order.notes && (
              <div className="p-3 bg-cream-500/60 rounded-lg border border-border-subtle text-xs text-charcoal-700 space-y-1 font-sans">
                <span className="font-semibold text-espresso-900">Roastery Notes:</span>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Customer & Shipping Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Customer Details Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-card space-y-4 text-xs font-sans">
              <h3 className="font-serif font-bold text-sm text-espresso-950 border-b border-border-subtle pb-2">
                Shipping Destination
              </h3>
              <div className="space-y-1 text-charcoal-700">
                <p className="font-semibold text-espresso-950">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p>{order.shippingAddress.street} {order.shippingAddress.unit}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>

              <div className="pt-2 border-t border-border-subtle space-y-1">
                <p className="text-charcoal-500">Contact Email:</p>
                <p className="font-mono text-espresso-900">{order.customer.email}</p>
                {order.customer.phone && (
                  <>
                    <p className="text-charcoal-500 pt-1">Phone Number:</p>
                    <p className="font-mono text-espresso-900">{order.customer.phone}</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border-subtle shadow-card space-y-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Packing Receipt</span>
              </Button>

              <a
                href={`https://wa.me/${SITE.phoneE164}?text=${encodeURIComponent(
                  `Hello Rovena Coffee Roastery! Inquiring about my order ${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-olive-700 border-olive-400 hover:bg-olive-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Roast Concierge (WhatsApp)</span>
                </Button>
              </a>

              <Link href="/catalog" className="block pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <span>Explore More Micro-Lots</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
