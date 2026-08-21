'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Coffee,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';

export interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const GRIND_SETTING_GUIDE: Record<string, { setting: string; eq: string; notes: string }> = {
  whole_bean: {
    setting: 'No Grind (Whole Bean)',
    eq: 'Unopened Degas Valve Bag',
    notes: 'Inspect seal integrity and nitrogen flush if applied.',
  },
  'Whole Bean': {
    setting: 'No Grind (Whole Bean)',
    eq: 'Unopened Degas Valve Bag',
    notes: 'Inspect seal integrity and nitrogen flush if applied.',
  },
  espresso: {
    setting: 'Fine 1.8 – 2.2 (200µm)',
    eq: 'Mahlkönig EK43 / Mazzer Robur',
    notes: 'Calibrated for 9-bar 1:2 extraction in 28-30s.',
  },
  Espresso: {
    setting: 'Fine 1.8 – 2.2 (200µm)',
    eq: 'Mahlkönig EK43 / Mazzer Robur',
    notes: 'Calibrated for 9-bar 1:2 extraction in 28-30s.',
  },
  v60_drip: {
    setting: 'Medium-Fine 12.5 (550µm)',
    eq: 'Mahlkönig EK43 / Fellow Ode Gen 2 #4',
    notes: 'Table salt consistency for 3:00m cone drawdown.',
  },
  'V60 / Drip': {
    setting: 'Medium-Fine 12.5 (550µm)',
    eq: 'Mahlkönig EK43 / Fellow Ode Gen 2 #4',
    notes: 'Table salt consistency for 3:00m cone drawdown.',
  },
  aeropress: {
    setting: 'Medium 9.0 (650µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Finer than pour over for inverted rapid immersion.',
  },
  Aeropress: {
    setting: 'Medium 9.0 (650µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Finer than pour over for inverted rapid immersion.',
  },
  french_press: {
    setting: 'Coarse 18.0 (900µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Sea salt texture to avoid sediment in metal mesh.',
  },
  'French Press': {
    setting: 'Coarse 18.0 (900µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Sea salt texture to avoid sediment in metal mesh.',
  },
  cold_brew: {
    setting: 'Extra Coarse 21.0 (1200µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Large particles for 18-hour cold immersion extraction.',
  },
  'Cold Brew': {
    setting: 'Extra Coarse 21.0 (1200µm)',
    eq: 'Mahlkönig EK43',
    notes: 'Large particles for 18-hour cold immersion extraction.',
  },
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [showPackingSlip, setShowPackingSlip] = useState(false);

  if (!isOpen || !order) return null;

  const isWhatsApp = order.channel === 'whatsapp' || order.source.toLowerCase().includes('whatsapp');

  const handlePrint = () => {
    window.print();
  };

  const handleReopenWhatsApp = () => {
    const formattedUrl = generateWhatsAppOrderUrl({
      orderId: order.id,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      items: order.items.map((item) => ({
        productTitle: item.name,
        weightGrams: item.weightGrams,
        grindOption: item.grind,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        isSubscription: item.isSubscription,
        frequency: item.subscriptionFrequency,
      })),
      subtotal: order.pricing.grossSubtotal,
      shipping: order.pricing.shippingFee,
      total: order.pricing.grandTotal,
      specialInstructions: order.notes,
    });
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-espresso-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Container */}
      <div
        className={cn(
          'relative w-full max-w-4xl bg-surface rounded-xl shadow-modal border border-border-subtle overflow-hidden z-10',
          'max-h-[92vh] flex flex-col animate-in zoom-in-95 fade-in duration-200'
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-canvas/80 flex items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-terracotta-500" />
              <h2 id="order-detail-title" className="font-serif text-xl font-bold text-espresso-950">
                Order {order.id}
              </h2>
            </div>
            <OrderStatusBadge status={order.status} size="sm" />
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-xs border',
                isWhatsApp
                  ? 'bg-[#25D366]/10 text-emerald-800 border-[#25D366]/30'
                  : 'bg-cream-600 text-espresso-800 border-border-subtle'
              )}
            >
              {isWhatsApp ? '💬 WhatsApp Direct' : '🌐 Web Storefront'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4 text-espresso-700" />}
              onClick={() => setShowPackingSlip(!showPackingSlip)}
              className="text-xs"
            >
              {showPackingSlip ? 'Close Packing Slip' : 'Print Packing Slip'}
            </Button>
            <button
              onClick={onClose}
              aria-label="Close order details modal"
              className="p-1.5 text-charcoal-500 hover:text-espresso-950 hover:bg-cream-600 rounded-md transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Printable Roastery Packing Slip View */}
          {showPackingSlip && (
            <div
              data-testid="roastery-packing-slip"
              className="p-6 bg-white border-2 border-dashed border-espresso-900/40 rounded-lg shadow-sm print:m-0 print:border-none print:shadow-none space-y-6"
            >
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-espresso-950 uppercase tracking-wide">
                    ☕ Rovena Coffee Roastery — Packing Bench Slip
                  </h3>
                  <p className="text-xs text-charcoal-600 font-sans mt-0.5">
                    Order Ref: <span className="font-mono font-bold text-espresso-900">{order.id}</span> •
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-espresso-950 text-cream-400 font-mono text-xs font-bold rounded">
                    ROAST DAY TICKET
                  </span>
                  <p className="text-[11px] text-charcoal-500 font-sans mt-1">
                    Ship Method: {order.shippingMethod.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Destination Tag */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans p-3 bg-cream-500 rounded border border-border-subtle">
                <div>
                  <p className="font-bold text-espresso-900 uppercase tracking-wider text-[10px]">
                    Recipient / Destination:
                  </p>
                  <p className="font-semibold text-espresso-950 mt-0.5">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-charcoal-600">{order.shippingAddress.street}</p>
                  {order.shippingAddress.unit && (
                    <p className="text-charcoal-600">{order.shippingAddress.unit}</p>
                  )}
                  <p className="text-charcoal-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-charcoal-500 font-mono">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="font-bold text-espresso-900 uppercase tracking-wider text-[10px]">
                    Roaster Notes & Special Instructions:
                  </p>
                  <p className="text-charcoal-700 italic mt-0.5 bg-white p-2 rounded border border-border-subtle min-h-[50px]">
                    {order.notes || 'Standard roast & packaging protocol.'}
                  </p>
                </div>
              </div>

              {/* Bench Itemization & Grind Tag */}
              <div className="space-y-3">
                <p className="font-bold text-espresso-900 uppercase tracking-wider text-xs">
                  Packer Line Items & Grind Calibration Tags:
                </p>
                <div className="divide-y border rounded-md overflow-hidden">
                  {order.items.map((item, idx) => {
                    const grindGuide =
                      GRIND_SETTING_GUIDE[item.grind] || GRIND_SETTING_GUIDE['whole_bean'];

                    return (
                      <div key={item.id || idx} className="p-3 bg-white flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-espresso-100 text-espresso-900 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-sm text-espresso-950">
                              {item.name}
                            </span>
                            <span className="text-xs font-bold text-terracotta-600">
                              [{item.weight}]
                            </span>
                            <span className="text-xs font-mono font-bold text-espresso-900 bg-amber-100 px-2 py-0.5 rounded">
                              QTY: {item.quantity}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-charcoal-600">
                            <span>Origin: {item.origin}</span>
                            <span>•</span>
                            <span>Roast: {item.roastLevel}</span>
                          </div>

                          {/* Grind Tag */}
                          <div className="mt-1 p-2 bg-cream-600/70 rounded text-xs border border-border-subtle">
                            <div className="flex items-center gap-2 font-bold text-espresso-900">
                              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                              <span>Grind Tag: {item.grind}</span>
                              <span className="text-[11px] font-normal text-charcoal-600 font-mono">
                                ({grindGuide.setting})
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-600 mt-0.5">
                              Equipment: {grindGuide.eq} — {grindGuide.notes}
                            </p>
                          </div>
                        </div>

                        {/* QC Checkbox */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex flex-col items-center gap-1 p-2 bg-cream-500 rounded border border-border-subtle">
                            <span className="text-[10px] font-bold uppercase text-charcoal-600">
                              Bench QC
                            </span>
                            <div className="w-5 h-5 border-2 border-espresso-900 rounded bg-white" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QC Signoff Footer */}
              <div className="pt-4 border-t flex items-center justify-between text-xs font-sans text-charcoal-600">
                <div className="flex items-center gap-4">
                  <span>[ ] Moisture Verified (&lt;11.5%)</span>
                  <span>[ ] Degas Valve Checked</span>
                  <span>[ ] Net Weight Weighed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Roastmaster Sign-off: _________________</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={handlePrint}
                  >
                    Print Tag
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Shipping Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details Card */}
            <div className="p-4 bg-canvas rounded-lg border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-espresso-950 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-terracotta-500" /> Customer Information
                </h3>
                {isWhatsApp && (
                  <Button
                    variant="whatsapp"
                    size="sm"
                    leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                    onClick={handleReopenWhatsApp}
                    className="text-xs h-7 px-2.5"
                  >
                    Reopen WhatsApp Chat
                  </Button>
                )}
              </div>

              <div className="text-xs font-sans space-y-1.5 text-espresso-900">
                <p className="font-semibold text-sm">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <div className="flex items-center gap-2 text-charcoal-600">
                  <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="hover:text-terracotta-600 transition-colors"
                  >
                    {order.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-charcoal-600">
                  <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="hover:text-terracotta-600 transition-colors font-mono"
                  >
                    {order.customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-charcoal-600 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>Placed: {new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Delivery Card */}
            <div className="p-4 bg-canvas rounded-lg border border-border-subtle space-y-3">
              <h3 className="font-serif text-sm font-bold text-espresso-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta-500" /> Shipping & Delivery
              </h3>

              <div className="text-xs font-sans space-y-1 text-espresso-900">
                <p className="font-medium">{order.shippingAddress.street}</p>
                {order.shippingAddress.unit && (
                  <p className="text-charcoal-600">{order.shippingAddress.unit}</p>
                )}
                <p className="text-charcoal-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-charcoal-600">{order.shippingAddress.country}</p>

                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 bg-cream-600 rounded text-espresso-900 border border-border-subtle">
                    {order.shippingMethod === 'express' ? '⚡ Express Courier' : '🚚 Standard Roast Ground'}
                  </span>
                  {order.trackingNumber && (
                    <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      Tracking: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-espresso-950 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-terracotta-500" /> Order Items & Variant Specifications
            </h3>

            <div className="border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle bg-surface">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-espresso-950">{item.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-cream-600 text-espresso-900 rounded">
                        {item.weight}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                        {item.grind}
                      </span>
                      {item.isSubscription && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-terracotta-50 text-terracotta-700 border border-terracotta-200 rounded flex items-center gap-1">
                          🔄 {item.subscriptionFrequency || 'Recurring'} (10% Off)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 font-sans">
                      Origin: {item.origin} • Roast Profile: {item.roastLevel}
                    </p>
                  </div>

                  <div className="text-right font-sans shrink-0">
                    <p className="font-semibold text-sm text-espresso-950">
                      ${item.itemTotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {item.quantity}x @ ${item.unitPrice.toFixed(2)} ea
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Customer Notes */}
            <div className="p-4 bg-cream-500/60 rounded-lg border border-border-subtle space-y-2">
              <h4 className="font-serif text-xs font-bold text-espresso-900 uppercase tracking-wider">
                Special Roaster & Delivery Notes
              </h4>
              <p className="text-xs text-charcoal-700 italic font-sans">
                {order.notes ? `"${order.notes}"` : 'No customer special notes provided.'}
              </p>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-surface rounded-lg border border-border-subtle space-y-2 font-sans text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Gross Subtotal ({order.pricing.itemsCount} bags, {order.pricing.totalGrams}g):</span>
                <span>${order.pricing.grossSubtotal.toFixed(2)}</span>
              </div>
              {order.pricing.subscriptionSavings > 0 && (
                <div className="flex justify-between text-terracotta-600 font-medium">
                  <span>Subscription Savings (10% off):</span>
                  <span>-${order.pricing.subscriptionSavings.toFixed(2)}</span>
                </div>
              )}
              {order.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>
                    Coupon Discount ({order.appliedDiscount?.code || 'PROMO'}):
                  </span>
                  <span>-${order.pricing.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Shipping ({order.shippingMethod.toUpperCase()}):</span>
                <span>
                  {order.pricing.shippingFee === 0
                    ? 'FREE'
                    : `$${order.pricing.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Tax (8%):</span>
                <span>${order.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-espresso-950 pt-2 border-t border-border-subtle">
                <span>Grand Total:</span>
                <span className="text-terracotta-600">${order.pricing.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Status Transition Selector */}
        <div className="px-6 py-4 border-t border-border-subtle bg-canvas/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-espresso-900 font-sans">
              Update Order Status:
            </span>
            <OrderStatusBadge
              status={order.status}
              interactive={true}
              onStatusChange={(newStatus) => {
                onStatusChange?.(order.id, newStatus);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {isWhatsApp && (
              <Button
                variant="whatsapp"
                size="sm"
                leftIcon={<MessageCircle className="w-4 h-4" />}
                onClick={handleReopenWhatsApp}
              >
                Chat on WhatsApp
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
