import { NextRequest, NextResponse } from 'next/server';
import { roastBatchRepository } from '@/lib/repositories/batch-repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const coffeeId = searchParams.get('coffeeId');

    let batches = await roastBatchRepository.findAll();

    if (status) {
      batches = batches.filter((b) => b.status === status);
    }

    if (coffeeId) {
      batches = batches.filter((b) => b.coffeeId === coffeeId);
    }

    return NextResponse.json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch roast batches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      coffeeId,
      coffeeName,
      origin,
      roastProfile,
      targetRoastedKg,
      scheduledDate,
      orderIds,
      grindBreakdown,
      notes,
    } = body;

    if (!coffeeId || !coffeeName || !targetRoastedKg || !scheduledDate) {
      return NextResponse.json(
        { error: 'coffeeId, coffeeName, targetRoastedKg, and scheduledDate are required' },
        { status: 400 }
      );
    }

    const batch = await roastBatchRepository.create({
      coffeeId,
      coffeeName,
      origin: origin || 'Unknown',
      roastProfile: roastProfile || 'medium',
      targetRoastedKg,
      scheduledDate,
      orderIds: orderIds || [],
      grindBreakdown: grindBreakdown || {
        whole_bean: targetRoastedKg,
      },
      notes,
    });

    return NextResponse.json({
      success: true,
      batch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create roast batch' }, { status: 500 });
  }
}
