export interface WhatsAppOrderItem {
  productTitle: string;
  weightGrams: number;
  grindOption: string;
  quantity: number;
  unitPrice: number;
  isSubscription: boolean;
  frequency?: string;
}

export interface WhatsAppOrderDetails {
  orderId: string;
  customerName?: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  specialInstructions?: string;
  roasteryPhone?: string; // Default: "+1 (555) 839-2633"
}

export const DEFAULT_ROASTERY_PHONE = '15558392633';

/**
 * Formats structured plain-text message for WhatsApp direct order link.
 */
export function formatWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  const lines: string[] = [
    `☕ *ARTISAN SPECIALTY ROASTERY — DIRECT ORDER* ☕`,
    `📋 *Order Reference*: \`#${details.orderId}\``,
  ];

  if (details.customerName && details.customerName.trim()) {
    lines.push(`👤 *Customer*: ${details.customerName.trim()}`);
  }

  lines.push(`--------------------------------`);
  lines.push(`*ITEMS ORDERED:*`);

  details.items.forEach((item, idx) => {
    const subTag = item.isSubscription
      ? ` 🔄 (${item.frequency || 'Monthly'} Subscription)`
      : '';
    const itemTotal = (item.unitPrice * item.quantity).toFixed(2);
    lines.push(
      `${idx + 1}. *${item.productTitle}* (x${item.quantity})\n` +
      `   • Weight: ${item.weightGrams}g | Grind: ${item.grindOption}${subTag}\n` +
      `   • Price: $${itemTotal}`
    );
  });

  lines.push(`--------------------------------`);
  lines.push(`💰 Subtotal: $${details.subtotal.toFixed(2)}`);
  lines.push(`🚚 Shipping: ${details.shipping === 0 ? 'FREE' : `$${details.shipping.toFixed(2)}`}`);
  lines.push(`💳 Total: *$${details.total.toFixed(2)}*`);
  lines.push(`--------------------------------`);

  if (details.specialInstructions && details.specialInstructions.trim()) {
    lines.push(`📝 *Special Note*: ${details.specialInstructions.trim()}`);
  }

  lines.push(`Please confirm roast schedule and dispatch timeline! 🙏☕`);

  return lines.join('\n');
}

/**
 * Generates an encoded https://wa.me/ URL with pre-filled message text.
 */
export function generateWhatsAppOrderUrl(details: WhatsAppOrderDetails): string {
  const phone = (details.roasteryPhone || DEFAULT_ROASTERY_PHONE).replace(/[^0-9]/g, '');
  const message = formatWhatsAppOrderMessage(details);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
