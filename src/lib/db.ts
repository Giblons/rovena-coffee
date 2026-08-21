import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  resetOrdersStore,
  orderRepository,
} from './repositories/order-repository';

import {
  getInventory,
  adjustInventory,
  restockGreenInventory,
  resetInventoryStore,
  inventoryRepository,
  InventoryItem,
} from './repositories/inventory-repository';

import {
  getRoastBatches,
  getRoastBatchesSync,
  createRoastBatch,
  updateRoastBatchStatus,
  resetBatchesStore,
  roastBatchRepository,
  RoastBatch,
} from './repositories/batch-repository';

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  getInventory,
  adjustInventory,
  restockGreenInventory,
  getRoastBatches,
  getRoastBatchesSync,
  createRoastBatch,
  updateRoastBatchStatus,
  orderRepository,
  inventoryRepository,
  roastBatchRepository,
};

export type { InventoryItem, RoastBatch };

export const db = {
  getOrders: () => orderRepository.findAll(),
  saveOrders: async (_orders: any[]) => {},
  getNextOrderId: () => `ORD-2026-${Date.now().toString().slice(-4)}`,
  getInventory: () => inventoryRepository.findAll(),
  saveInventory: async (_items: any[]) => {},
  getRoastBatches: () => roastBatchRepository.findAll(),
  saveRoastBatches: async (_batches: any[]) => {},
};

/**
 * Resets all in-memory and local repository state for isolated testing and fresh workflows.
 */
export function resetDbState() {
  resetOrdersStore();
  resetInventoryStore();
  resetBatchesStore();
}

// Initial boot
resetDbState();
