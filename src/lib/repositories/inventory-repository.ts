import { InventoryItem } from '@/types/inventory';

export type { InventoryItem };

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-ETH-001',
    productId: 'ethiopia-yirgacheffe-chelbesa',
    beanName: 'Ethiopia Yirgacheffe Chelbesa',
    name: 'Ethiopia Yirgacheffe Chelbesa',
    origin: 'Ethiopia',
    varietal: 'Heirloom 74110 / 74112',
    process: 'Washed',
    greenStockKg: 240,
    roastedStockKg: 45,
    allocatedKg: 12,
    reservedStockKg: 0,
    safetyThresholdKg: 30,
    reorderThresholdKg: 30,
    roastScheduleDays: ['Monday', 'Thursday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-COL-002',
    productId: 'colombia-el-paraiso-thermal-shock',
    beanName: 'Colombia El Paraiso Thermal Shock',
    name: 'Colombia El Paraiso Thermal Shock',
    origin: 'Colombia',
    varietal: 'Castillo / Colombia',
    process: 'Thermal Shock',
    greenStockKg: 12, // Low stock: below safety threshold of 25kg
    roastedStockKg: 8,
    allocatedKg: 4,
    reservedStockKg: 0,
    safetyThresholdKg: 25,
    reorderThresholdKg: 25,
    roastScheduleDays: ['Monday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: true,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-KEN-003',
    productId: 'kenya-nyeri-gakuyu-ini-aa',
    beanName: 'Kenya Nyeri Gakuyu-ini AA',
    name: 'Kenya Nyeri Gakuyu-ini AA',
    origin: 'Kenya',
    varietal: 'SL28 / SL34',
    process: 'Washed',
    greenStockKg: 120,
    roastedStockKg: 18,
    allocatedKg: 5,
    reservedStockKg: 0,
    safetyThresholdKg: 20,
    reorderThresholdKg: 20,
    roastScheduleDays: ['Monday', 'Thursday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-CR-004',
    productId: 'costa-rica-tarrazu-mozart-honey',
    beanName: 'Costa Rica Tarrazú Canet Mozart',
    name: 'Costa Rica Tarrazú Canet Mozart',
    origin: 'Costa Rica',
    varietal: 'F1 Centroamericano',
    process: 'Honey / Pulped Natural',
    greenStockKg: 85,
    roastedStockKg: 22,
    allocatedKg: 6,
    reservedStockKg: 0,
    safetyThresholdKg: 20,
    reorderThresholdKg: 20,
    roastScheduleDays: ['Monday', 'Thursday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-GUA-005',
    productId: 'guatemala-huehuetenango-bella-carmona',
    beanName: 'Guatemala Huehuetenango Bella Carmona',
    name: 'Guatemala Huehuetenango Bella Carmona',
    origin: 'Guatemala',
    varietal: 'Bourbon / Caturra',
    process: 'Washed',
    greenStockKg: 300,
    roastedStockKg: 60,
    allocatedKg: 15,
    reservedStockKg: 0,
    safetyThresholdKg: 35,
    reorderThresholdKg: 35,
    roastScheduleDays: ['Monday', 'Thursday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-SUM-006',
    productId: 'sumatra-kerinci-tiger-wet-hulled',
    beanName: 'Sumatra Mount Kerinci Tiger',
    name: 'Sumatra Mount Kerinci Tiger',
    origin: 'Indonesia',
    varietal: 'Andung Sari / Sigarar Utang',
    process: 'Wet Hulled (Giling Basah)',
    greenStockKg: 18, // Low stock: below safety threshold of 20kg
    roastedStockKg: 10,
    allocatedKg: 3,
    reservedStockKg: 0,
    safetyThresholdKg: 20,
    reorderThresholdKg: 20,
    roastScheduleDays: ['Thursday'],
    lastRoastedDate: '2026-08-14',
    isLowStock: true,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-APEX-007',
    productId: 'lumina-apex-house-espresso-blend',
    beanName: 'Apex House Espresso Blend',
    name: 'Apex House Espresso Blend',
    origin: 'Multi-Origin Blend',
    varietal: 'Castillo / Heirloom / Mundo Novo',
    process: 'Washed',
    greenStockKg: 450,
    roastedStockKg: 120,
    allocatedKg: 25,
    reservedStockKg: 0,
    safetyThresholdKg: 50,
    reorderThresholdKg: 50,
    roastScheduleDays: ['Monday', 'Thursday'],
    lastRoastedDate: '2026-08-18',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'INV-DARK-008',
    productId: 'lumina-velvet-midnight-dark-roast',
    beanName: 'Velvet Midnight Dark Roast',
    name: 'Velvet Midnight Dark Roast',
    origin: 'Multi-Origin Blend',
    varietal: 'Bourbon / Typica / Tim Tim',
    process: 'Washed',
    greenStockKg: 280,
    roastedStockKg: 75,
    allocatedKg: 18,
    reservedStockKg: 0,
    safetyThresholdKg: 40,
    reorderThresholdKg: 40,
    roastScheduleDays: ['Thursday'],
    lastRoastedDate: '2026-08-14',
    isLowStock: false,
    isActive: true,
    lastUpdated: new Date().toISOString(),
  },
];

let inMemoryInventory: InventoryItem[] = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));

export class InventoryRepository {
  public findAll(): InventoryItem[] {
    return inMemoryInventory.map((item) => ({
      ...item,
      isLowStock: item.greenStockKg < item.safetyThresholdKg,
    }));
  }

  public findByProductId(productId: string): InventoryItem | undefined {
    const item = inMemoryInventory.find((i) => i.productId === productId);
    if (!item) return undefined;
    return {
      ...item,
      isLowStock: item.greenStockKg < item.safetyThresholdKg,
    };
  }

  public reserveStock(productId: string, amountKg: number): InventoryItem | undefined {
    const item = inMemoryInventory.find((i) => i.productId === productId);
    if (!item) return undefined;

    item.reservedStockKg = Number(((item.reservedStockKg || 0) + amountKg).toFixed(2));
    item.allocatedKg = Number(((item.allocatedKg || 0) + amountKg).toFixed(2));
    item.lastUpdated = new Date().toISOString();
    item.isLowStock = item.greenStockKg < item.safetyThresholdKg;
    return item;
  }

  public adjustStock(
    productId: string,
    deltaRoastedKg: number,
    _reason?: string,
    _referenceId?: string
  ): InventoryItem | undefined {
    const item = inMemoryInventory.find((i) => i.productId === productId);
    if (!item) return undefined;

    item.roastedStockKg = Math.max(0, Number((item.roastedStockKg + deltaRoastedKg).toFixed(2)));
    item.lastUpdated = new Date().toISOString();
    item.isLowStock = item.greenStockKg < item.safetyThresholdKg;
    return item;
  }

  public restockGreen(
    productId: string,
    addedGreenKg: number,
    _lotNumber?: string,
    _notes?: string
  ): InventoryItem | undefined {
    const item = inMemoryInventory.find((i) => i.productId === productId);
    if (!item) return undefined;

    item.greenStockKg = Math.max(0, Number((item.greenStockKg + addedGreenKg).toFixed(2)));
    item.lastUpdated = new Date().toISOString();
    item.isLowStock = item.greenStockKg < item.safetyThresholdKg;
    return item;
  }

  public deductGreenStock(
    productId: string,
    greenKg: number
  ): InventoryItem | undefined {
    const item = inMemoryInventory.find((i) => i.productId === productId);
    if (!item) return undefined;

    item.greenStockKg = Math.max(0, Number((item.greenStockKg - greenKg).toFixed(2)));
    item.lastUpdated = new Date().toISOString();
    item.isLowStock = item.greenStockKg < item.safetyThresholdKg;
    return item;
  }
}

export const inventoryRepository = new InventoryRepository();

export function getInventory(): InventoryItem[] {
  return inventoryRepository.findAll();
}

export function adjustInventory(
  productId: string,
  deltaRoastedKg: number,
  reason?: string,
  referenceId?: string
): InventoryItem | undefined {
  return inventoryRepository.adjustStock(productId, deltaRoastedKg, reason, referenceId);
}

export function restockGreenInventory(
  productId: string,
  addedGreenKg: number,
  lotNumber?: string,
  notes?: string
): InventoryItem | undefined {
  return inventoryRepository.restockGreen(productId, addedGreenKg, lotNumber, notes);
}

export function resetInventoryStore(): void {
  inMemoryInventory = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
}
