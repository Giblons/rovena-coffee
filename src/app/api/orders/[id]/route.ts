import { NextRequest, NextResponse } from 'next/server';
import { orderRepository } from '@/lib/repositories/order-repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await orderRepository.findById(id);

    if (!order) {
      return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await orderRepository.updateStatus(id, body);

    if (!updated) {
      return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update order' }, { status: 500 });
  }
}
