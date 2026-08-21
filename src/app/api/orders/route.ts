import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/lib/db';
import { CreateOrderPayload, OrderChannel, OrderStatus } from '@/types/order';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') as OrderChannel | null;
    const status = searchParams.get('status') as OrderStatus | null;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    let allMatching = await getAllOrders();

    if (channel) {
      allMatching = allMatching.filter((o) => o.channel === channel);
    }
    if (status) {
      allMatching = allMatching.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      allMatching = allMatching.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q)
      );
    }

    const total = allMatching.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = allMatching.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        success: true,
        total,
        page,
        limit,
        orders: paginatedOrders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderPayload;

    if (!body || !body.channel || !body.customer || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required order fields (channel, customer, items)',
        },
        { status: 400 }
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot create an empty order. Cart has 0 items.',
        },
        { status: 400 }
      );
    }

    const order = await createOrder(body);

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to process order creation',
      },
      { status: 500 }
    );
  }
}
