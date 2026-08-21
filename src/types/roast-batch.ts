import { GrindOption } from './coffee';

export type BatchStatus = 'Scheduled' | 'Roasting' | 'Cooling_QC' | 'Completed' | 'Cancelled';

export interface BatchBeanBreakdown {
  productId: string;
  beanName: string;
  totalGramsRequired: number;
  totalBags250g: number;
  totalBags500g: number;
  totalBags1kg: number;
  grindBreakdown: Record<GrindOption, number>;
}

export interface RoastBatch {
  id: string;               // e.g. "BATCH-2026-W34-MON"
  batchNumber: string;      // "ROAST-0824"
  scheduledDate: string;    // ISO Date for the roast session
  roastDay: 'Monday' | 'Thursday';
  status: BatchStatus;
  
  assignedOrderIds: string[];
  beans: BatchBeanBreakdown[];
  totalGreenWeightKg: number;
  
  roasterNotes?: string;
  completedAt?: string;
  createdAt: string;
}
