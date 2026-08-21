import { describe, it, expect } from 'vitest';
import {
  generateWhatsAppOrderUrl,
  formatWhatsAppOrderMessage,
  WhatsAppOrderDetails,
} from '@/lib/whatsapp';

describe('WhatsApp Direct Order Builder — Unit Tests (Tier 1 & Tier 2)', () => {
  const baseOrderDetails: WhatsAppOrderDetails = {
    orderId: 'ORD-2026-1042',
    customerName: 'Elena Rostova',
    roasteryPhone: '15558392633',
    items: [
      {
        productTitle: 'Ethiopia Yirgacheffe Chelbesa',
        weightGrams: 250,
        grindOption: 'V60 / Drip',
        quantity: 2,
        unitPrice: 20.0,
        isSubscription: false,
      },
    ],
    subtotal: 40.0,
    shipping: 0.0,
    total: 43.2, // 40 + tax
    specialInstructions: 'Please grind medium-fine for Hario V60 02.',
  };

  describe('Tier 1: WhatsApp Message Structure & URL Formatting', () => {
    it('should generate a valid wa.me URL targeting the roastery phone number', () => {
      const url = generateWhatsAppOrderUrl(baseOrderDetails);
      expect(url.startsWith('https://wa.me/15558392633?text=')).toBe(true);
    });

    it('should format message containing Order Reference ID', () => {
      const message = formatWhatsAppOrderMessage(baseOrderDetails);
      expect(message).toContain('#ORD-2026-1042');
    });

    it('should format message containing Customer Name when provided', () => {
      const message = formatWhatsAppOrderMessage(baseOrderDetails);
      expect(message).toContain('Elena Rostova');
    });

    it('should properly encode the URL query string with percent-encoding', () => {
      const url = generateWhatsAppOrderUrl(baseOrderDetails);
      const queryString = url.split('?text=')[1];
      expect(queryString).toBeDefined();
      // Should not contain raw spaces or raw unencoded newlines
      expect(queryString).not.toContain('\n');
      expect(queryString).not.toContain(' ');
      // Decoded text must match formatted message
      const decodedMessage = decodeURIComponent(queryString);
      expect(decodedMessage).toContain('#ORD-2026-1042');
      expect(decodedMessage).toContain('Ethiopia Yirgacheffe Chelbesa');
    });

    it('should include clear itemized line items with quantities, weights, grinds, and prices', () => {
      const message = formatWhatsAppOrderMessage(baseOrderDetails);
      expect(message).toContain('Ethiopia Yirgacheffe Chelbesa');
      expect(message).toContain('250g');
      expect(message).toContain('V60 / Drip');
      expect(message).toContain('$40.00'); // 2 * $20.00
    });

    it('should include financial breakdown (Subtotal, Shipping, Total)', () => {
      const message = formatWhatsAppOrderMessage(baseOrderDetails);
      expect(message).toContain('Subtotal: $40.00');
      expect(message).toContain('Shipping: FREE');
      expect(message).toContain('$43.20');
    });
  });

  describe('Tier 2: Special Characters, Multiple Items & Subscriptions', () => {
    it('should correctly format recurring subscription tags with frequency', () => {
      const subscriptionOrder: WhatsAppOrderDetails = {
        ...baseOrderDetails,
        items: [
          {
            productTitle: 'Costa Rica Canet Mozart',
            weightGrams: 500,
            grindOption: 'Whole Bean',
            quantity: 1,
            unitPrice: 38.0,
            isSubscription: true,
            frequency: 'Bi-Weekly',
          },
        ],
      };

      const message = formatWhatsAppOrderMessage(subscriptionOrder);
      expect(message).toContain('Subscription');
      expect(message).toContain('Bi-Weekly');
      expect(message).toContain('🔄');
    });

    it('should handle multi-item orders correctly with sequential numbering', () => {
      const multiItemOrder: WhatsAppOrderDetails = {
        ...baseOrderDetails,
        items: [
          {
            productTitle: 'Ethiopia Chelbesa',
            weightGrams: 250,
            grindOption: 'Whole Bean',
            quantity: 1,
            unitPrice: 22.5,
            isSubscription: false,
          },
          {
            productTitle: 'Colombia Thermal Shock',
            weightGrams: 500,
            grindOption: 'Aeropress',
            quantity: 2,
            unitPrice: 48.0,
            isSubscription: false,
          },
        ],
      };

      const message = formatWhatsAppOrderMessage(multiItemOrder);
      expect(message).toContain('1. *Ethiopia Chelbesa*');
      expect(message).toContain('2. *Colombia Thermal Shock*');
    });

    it('should safely escape / encode special characters, emojis, and quotes', () => {
      const specialOrder: WhatsAppOrderDetails = {
        ...baseOrderDetails,
        customerName: 'François & Renée O’Connor #1',
        specialInstructions: 'Ring bell (apt #4B) — handle with care & "fragile" coffee bag ☕!',
      };

      const url = generateWhatsAppOrderUrl(specialOrder);
      expect(() => new URL(url)).not.toThrow();

      const decoded = decodeURIComponent(url.split('?text=')[1]);
      expect(decoded).toContain('François & Renée O’Connor #1');
      expect(decoded).toContain('Ring bell (apt #4B) — handle with care & "fragile" coffee bag ☕!');
    });

    it('should sanitize phone numbers by stripping non-digit characters', () => {
      const orderWithFormattedPhone: WhatsAppOrderDetails = {
        ...baseOrderDetails,
        roasteryPhone: '+1 (555) 839-2633',
      };

      const url = generateWhatsAppOrderUrl(orderWithFormattedPhone);
      expect(url.startsWith('https://wa.me/15558392633?text=')).toBe(true);
    });

    it('should display paid shipping fee when shipping is not free', () => {
      const orderWithShipping: WhatsAppOrderDetails = {
        ...baseOrderDetails,
        shipping: 5.0,
      };

      const message = formatWhatsAppOrderMessage(orderWithShipping);
      expect(message).toContain('Shipping: $5.00');
    });
  });
});
