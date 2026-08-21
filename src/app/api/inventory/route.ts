import { NextRequest, NextResponse } from 'next/server';
import { inventoryRepository } from '@/lib/repositories/inventory-repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const lowStock = searchParams.get('lowStock');

    let records = await inventoryRepository.findAll();

    if (origin) {
      records = records.filter((r) => r.origin.toLowerCase() === origin.toLowerCase());
    }

    if (lowStock === 'true') {
      records = records.filter((r) => r.roastedStockKg < 10 || r.greenStockKg < 50);
    }

    return NextResponse.json({
      success: true,
      count: records.length,
      inventory: records,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, amountKg, reason, referenceId } = body;

    if (!productId || typeof amountKg !== 'number') {
      return NextResponse.json({ error: 'productId and numeric amountKg are required' }, { status: 400 });
    }

    const updated = await inventoryRepository.adjustStock(
      productId,
      amountKg,
      reason || 'Manual Adjustment',
      referenceId
    );

    if (!updated) {
      return NextResponse.json({ error: 'Product inventory record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inventory: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to adjust inventory' }, { status: 500 });
  }
}
