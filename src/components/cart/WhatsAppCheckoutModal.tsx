'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CartItem, CartSummary, AppliedDiscount } from '@/types/cart';
import { CreateOrderPayload } from '@/types/order';

export interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  summary: CartSummary;
  appliedDiscount: AppliedDiscount | null;
  onOrderSuccess: (orderId: string) => void;
}

export const WhatsAppCheckoutModal: React.FC<WhatsAppCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  summary,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatGrind = (g: string) => g.replace(/_/g, ' ');

  const generateWhatsAppMessage = (orderId: string) => {
    let msg = `*NEW ROASTERY ORDER - ${orderId}*\n`;
    msg += `----------------------------------------\n`;
    msg += `*Customer:* ${customerName.trim()}\n`;
    msg += `*Phone:* ${customerPhone.trim()}\n`;
    msg += `*Shipping Address:* ${shippingAddress.trim()}\n`;
    if (customerNotes.trim()) {
      msg += `*Roaster Notes:* ${customerNotes.trim()}\n`;
    }
    msg += `\n*ITEMS RESERVED:*\n`;

    items.forEach((item, index) => {
      const subTag = item.isSubscription ? ` [Sub: ${item.subscriptionFrequency || 'Monthly'}]` : '';
      msg += `${index + 1}. *${item.name}* (${item.weight}, ${formatGrind(item.grind)})${subTag}\n`;
      msg += `   Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${(item.unitPrice * item.quantity).toFixed(2)}\n`;
    });

    msg += `\n*ORDER TOTALS:*\n`;
    msg += `• Net Subtotal: $${summary.netSubtotal.toFixed(2)}\n`;
    if (summary.couponDiscount > 0) {
      msg += `• Promo Discount (${appliedDiscount?.code}): -$${summary.couponDiscount.toFixed(2)}\n`;
    }
    msg += `• Shipping: ${summary.shippingFee === 0 ? 'FREE' : `$${summary.shippingFee.toFixed(2)}`}\n`;
    msg += `• Est. Tax (8%): $${summary.tax.toFixed(2)}\n`;
    msg += `*• GRAND TOTAL: $${(summary.netSubtotal - summary.couponDiscount + summary.shippingFee + summary.tax).toFixed(2)}*\n`;
    msg += `----------------------------------------\n`;
    msg += `_Please confirm roast availability and payment instructions via WhatsApp._`;

    return encodeURIComponent(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create order in backend database
      const orderPayload: CreateOrderPayload = {
        channel: 'whatsapp',
        source: 'WhatsApp Direct Checkout',
        paymentMethod: 'whatsapp_manual',
        customer: {
          firstName: customerName.trim().split(' ')[0] || customerName.trim(),
          lastName: customerName.trim().split(' ').slice(1).join(' ') || 'Customer',
          email: `${customerPhone.trim().replace(/\D/g, '')}@whatsapp.lumina.coffee`,
          phone: customerPhone.trim(),
        },
        shippingAddress: {
          street: shippingAddress.trim(),
          city: 'Direct Roastery Dispatch',
          state: 'WA',
          postalCode: '98101',
          country: 'United States',
        },
        shippingMethod: summary.shippingFee === 0 ? 'standard' : 'standard',
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
        notes: customerNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize WhatsApp order');
      }

      const orderId = data.order.id;

      // 2. Open WhatsApp Web / App with prefilled payload
      const waUrl = `https://wa.me/15551234567?text=${generateWhatsAppMessage(orderId)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 3. Clear cart and route to confirmation
      onOrderSuccess(orderId);
      onClose();
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process WhatsApp checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WhatsApp Direct Roast Checkout" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="p-3.5 rounded-lg bg-olive-50 border border-olive-200 text-xs text-olive-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <MessageSquare className="w-4 h-4 text-olive-600" />
            <span>Chat Directly with our Head Roaster</span>
          </div>
          <p className="text-olive-700 text-[11px] leading-relaxed">
            Your items ({summary.itemsCount} bags, {summary.totalGrams}g) will be formatted into a structured WhatsApp message. Our roastery team will review your batch reservation instantly.
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-espresso-950 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 text-xs rounded-md border border-border-medium bg-surface text-espresso-950 focus:outline-hidden focus:ring-1 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-espresso-950 mb-1">
              WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. +1 (555) 234-5678"
              className="w-full px-3 py-2 text-xs rounded-md border border-border-medium bg-surface text-espresso-950 focus:outline-hidden focus:ring-1 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-espresso-950 mb-1">
              Delivery Address (Street, City, Zip) *
            </label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="e.g. 1204 Pine Street, Apt 3A, Seattle, WA 98101"
              className="w-full px-3 py-2 text-xs rounded-md border border-border-medium bg-surface text-espresso-950 focus:outline-hidden focus:ring-1 focus:ring-terracotta-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-espresso-950 mb-1">
              Special Roast Instructions / Notes (Optional)
            </label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Preferred roast day, gate code..."
              className="w-full px-3 py-2 text-xs rounded-md border border-border-medium bg-surface text-espresso-950 focus:outline-hidden focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
        </div>

        {/* Order Cost Preview */}
        <div className="p-3 rounded-lg bg-cream-500 border border-border-subtle flex justify-between items-center text-xs">
          <span className="font-medium text-espresso-900">Total to Confirm:</span>
          <span className="font-serif font-bold text-sm text-terracotta-600">
            ${(summary.netSubtotal - summary.couponDiscount + summary.shippingFee + summary.tax).toFixed(2)}
          </span>
        </div>

        {errorMessage && (
          <p className="text-xs text-terracotta-600 font-medium">{errorMessage}</p>
        )}

        {/* Submit Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-transparent"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Reserving...' : 'Send WhatsApp Order'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
