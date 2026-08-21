export interface InventoryItem {
  id: string;
  productId: string;
  beanName: string;
  name?: string; // Compatibility alias
  origin: string;
  varietal: string;
  process: string;
  
  // Stock levels in Kilograms
  greenStockKg: number;      // Unroasted raw bean stock in storage
  roastedStockKg: number;    // Packaged roasted bean ready for dispatch
  reservedStockKg: number;   // Allocated to pending orders
  allocatedKg?: number;      // Compatibility alias
  safetyThresholdKg: number; // Low stock alert trigger (e.g. 5kg or 25kg)
  reorderThresholdKg?: number; // Compatibility alias
  
  // Roast scheduling
  roastScheduleDays: ('Monday' | 'Thursday')[];
  lastRoastedDate?: string;
  lastUpdated?: string;
  
  // Status flags
  isLowStock: boolean;
  isActive: boolean;
}

export interface InventoryAdjustmentPayload {
  productId: string;
  adjustmentKg: number;
  type: 'restock_green' | 'restock_roasted' | 'roast_loss' | 'qc_sample' | 'manual_correction';
  lotNumber?: string;
  reason?: string;
}

