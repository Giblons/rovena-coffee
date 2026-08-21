export interface RoastBatch {
  id: string;
  batchNumber: number;
  coffeeId: string;
  coffeeName: string;
  origin: string;
  roastProfile: string;
  status: 'Scheduled' | 'Roasting' | 'Completed' | 'Cancelled';
  targetRoastedKg: number;
  requiredGreenKg: number;
  actualYieldKg?: number;
  scheduledDate: string;
  completedAt?: string;
  orderIds: string[];
  grindBreakdown: Record<string, number>;
  notes?: string;
  createdAt: string;
}

const DEFAULT_BATCHES: RoastBatch[] = [
  {
    id: 'BATCH-20260421-001',
    batchNumber: 101,
    coffeeId: 'ethiopia-yirgacheffe-chelbesa',
    coffeeName: 'Ethiopia Yirgacheffe Chelbesa',
    origin: 'Ethiopia',
    roastProfile: 'Light',
    status: 'Scheduled',
    targetRoastedKg: 25.0,
    requiredGreenKg: 29.41,
    scheduledDate: '2026-04-21',
    orderIds: ['ORD-2026-1001', 'ORD-2026-1002'],
    grindBreakdown: {
      whole_bean: 15.0,
      v60_drip: 6.0,
      espresso: 4.0,
    },
    notes: 'Micro-lot drum 1 priority roast',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BATCH-20260423-002',
    batchNumber: 102,
    coffeeId: 'colombia-el-paraiso-lychee',
    coffeeName: 'Colombia El Paraiso Lychee',
    origin: 'Colombia',
    roastProfile: 'Medium-Light',
    status: 'Scheduled',
    targetRoastedKg: 20.0,
    requiredGreenKg: 23.53,
    scheduledDate: '2026-04-23',
    orderIds: ['ORD-2026-1003'],
    grindBreakdown: {
      whole_bean: 12.0,
      aeropress: 8.0,
    },
    createdAt: new Date().toISOString(),
  },
];

let inMemoryBatches: RoastBatch[] = JSON.parse(JSON.stringify(DEFAULT_BATCHES));

export class RoastBatchRepository {
  public async findAll(): Promise<RoastBatch[]> {
    return inMemoryBatches;
  }

  public findAllSync(): RoastBatch[] {
    return inMemoryBatches;
  }

  public async findById(id: string): Promise<RoastBatch | null> {
    return inMemoryBatches.find((b) => b.id === id) || null;
  }

  public async create(payload: {
    coffeeId: string;
    coffeeName: string;
    origin: string;
    roastProfile: string;
    targetRoastedKg: number;
    scheduledDate: string;
    orderIds?: string[];
    grindBreakdown?: Record<string, number>;
    notes?: string;
  }): Promise<RoastBatch> {
    const batchId = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(inMemoryBatches.length + 1).padStart(3, '0')}`;
    const requiredGreenKg = Number((payload.targetRoastedKg / 0.85).toFixed(2));

    const newBatch: RoastBatch = {
      id: batchId,
      batchNumber: inMemoryBatches.length + 101,
      coffeeId: payload.coffeeId,
      coffeeName: payload.coffeeName,
      origin: payload.origin,
      roastProfile: payload.roastProfile,
      status: 'Scheduled',
      targetRoastedKg: payload.targetRoastedKg,
      requiredGreenKg,
      scheduledDate: payload.scheduledDate,
      orderIds: payload.orderIds || [],
      grindBreakdown: payload.grindBreakdown || {
        whole_bean: payload.targetRoastedKg,
      },
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    inMemoryBatches.unshift(newBatch);
    return newBatch;
  }

  public async updateStatus(
    id: string,
    status: RoastBatch['status'],
    actualYieldKg?: number
  ): Promise<RoastBatch | null> {
    const existing = inMemoryBatches.find((b) => b.id === id);
    if (!existing) return null;

    existing.status = status;
    if (actualYieldKg !== undefined) {
      existing.actualYieldKg = actualYieldKg;
    }
    if (status === 'Completed') {
      existing.completedAt = new Date().toISOString();
    }
    return existing;
  }
}

export const roastBatchRepository = new RoastBatchRepository();

export async function getRoastBatches(): Promise<RoastBatch[]> {
  return roastBatchRepository.findAll();
}

export function getRoastBatchesSync(): RoastBatch[] {
  return roastBatchRepository.findAllSync();
}

export async function createRoastBatch(payload: any): Promise<RoastBatch> {
  return roastBatchRepository.create(payload);
}

export async function updateRoastBatchStatus(
  id: string,
  status: RoastBatch['status'],
  actualYieldKg?: number
): Promise<RoastBatch | null> {
  return roastBatchRepository.updateStatus(id, status, actualYieldKg);
}

export function resetBatchesStore(): void {
  inMemoryBatches = JSON.parse(JSON.stringify(DEFAULT_BATCHES));
}
