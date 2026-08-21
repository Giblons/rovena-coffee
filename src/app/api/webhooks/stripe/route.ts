import { NextRequest, NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories/order-repository';
import { inventoryRepository } from '@/lib/repositories/inventory-repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type || 'checkout.session.completed';

    if (eventType === 'checkout.session.completed') {
      const session = body.data?.object || body;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (orderId) {
        await orderRepository.updateStatus(orderId, {
          paymentStatus: 'paid',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        });

        const order = await orderRepository.findById(orderId);
        if (order && order.items) {
          for (const item of order.items) {
            await inventoryRepository.adjustStock(
              item.productId,
              -(item.quantity),
              'Stripe Webhook Fulfillment',
              orderId
            );
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Webhook error' }, { status: 400 });
  }
}
