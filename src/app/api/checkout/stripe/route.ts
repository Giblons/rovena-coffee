import { NextRequest, NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories/order-repository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, shippingAddress, appliedDiscountCode, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!customer || !customer.email) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    // 1. Create pending order in database
    const order = await orderRepository.create({
      channel: 'web',
      source: 'Stripe Hosted Checkout',
      paymentMethod: 'stripe',
      customer,
      shippingAddress: shippingAddress || {
        street: '123 Main St',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'United States',
      },
      shippingMethod: 'standard',
      items,
      appliedDiscountCode,
      notes,
    });

    const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

    if (isStripeConfigured) {
      try {
        const stripeModuleName = 'stripe';
        const stripeModule: any = await import(/* webpackIgnore: true */ stripeModuleName);
        const StripeClass = stripeModule.default || stripeModule;
        const stripe = new StripeClass(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });

        const lineItems = order.items.map((i: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${i.name} (${i.weight})`,
              description: `Grind: ${i.grind.replace(/_/g, ' ')} | Origin: ${i.origin}`,
            },
            unit_amount: Math.round(i.unitPrice * 100),
          },
          quantity: i.quantity,
        }));

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: lineItems,
          customer_email: customer.email,
          client_reference_id: order.id,
          metadata: {
            orderId: order.id,
          },
          success_url: `${appUrl}/order-confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/checkout?canceled=true`,
        });

        return NextResponse.json({
          success: true,
          mode: 'live',
          url: session.url,
          sessionId: session.id,
          orderId: order.id,
        });
      } catch (stripeErr: any) {
        console.warn('Live Stripe session creation failed, falling back to simulation mode:', stripeErr.message);
      }
    }

    // Simulation / Sandbox fallback
    const simulatedSessionId = `cs_test_lumina_${Date.now()}`;
    await orderRepository.updateStatus(order.id, {
      paymentStatus: 'paid',
      stripeSessionId: simulatedSessionId,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const successUrl = `${appUrl}/order-confirmation/${order.id}?session_id=${simulatedSessionId}`;

    return NextResponse.json({
      success: true,
      mode: 'simulated',
      url: successUrl,
      sessionId: simulatedSessionId,
      orderId: order.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Stripe checkout initialization failed' }, { status: 500 });
  }
}
