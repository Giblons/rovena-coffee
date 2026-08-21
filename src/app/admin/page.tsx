'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Coffee,
  Package,
  Leaf,
  Calendar,
  BarChart3,
  DollarSign,
  Repeat,
  MessageCircle,
  Globe,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  PieChart,
  Layers,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { InventoryItem } from '@/types/inventory';
import { RoastBatch } from '@/types/roast-batch';
import {
  getAllOrders,
  updateOrderStatus,
  getInventory,
  restockGreenInventory,
  adjustInventory,
  getRoastBatches,
  getRoastBatchesSync,
  createRoastBatch,
  updateRoastBatchStatus,
  resetDbState,
} from '@/lib/db';
import {
  OrderTable,
  OrderDetailModal,
  InventoryManager,
  RoastBatchQueue,
} from '@/components/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export type AdminTab = 'orders' | 'inventory' | 'batches' | 'analytics';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<Order[]>(() => getAllOrders());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInventory());
  const [batches, setBatches] = useState<any[]>(() => getRoastBatchesSync());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Load initial data
  const loadData = () => {
    const loadedOrders = getAllOrders();
    const loadedInventory = getInventory();
    const loadedBatches = getRoastBatchesSync();
    setOrders([...loadedOrders]);
    setInventory([...loadedInventory]);
    setBatches([...loadedBatches]);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle order status transition
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(getAllOrders());
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  // Handle green bean restock
  const handleRestockGreen = (
    productId: string,
    amountKg: number,
    lotNumber: string,
    notes: string
  ) => {
    restockGreenInventory(productId, amountKg, lotNumber, notes);
    setInventory(getInventory());
  };

  // Handle roasted stock adjustment
  const handleAdjustRoastedStock = (productId: string, amountKg: number, reason: string) => {
    adjustInventory(productId, amountKg, reason);
    setInventory(getInventory());
  };

  // Handle starting a roast batch (bulk updates assigned pending orders to 'Roasting')
  const handleStartRoastBatch = async (
    day: 'Monday' | 'Thursday',
    assignedOrderIds: string[]
  ) => {
    // 1. Bulk update pending orders to Roasting
    for (const id of assignedOrderIds) {
      updateOrderStatus(id, 'Roasting');
    }

    // 2. Create new batch record
    const targetRoastedKg = orders
      .filter((o) => assignedOrderIds.includes(o.id))
      .reduce((sum, o) => sum + (o.pricing?.totalGrams || 500) / 1000, 0);

    const firstCoffee = orders
      .filter((o) => assignedOrderIds.includes(o.id))
      .flatMap((o) => o.items)[0];

    await createRoastBatch({
      coffeeId: firstCoffee?.productId || 'multi-origin-batch',
      coffeeName: firstCoffee ? `${firstCoffee.name} (+ Batch Roster)` : `${day} Roastery Roster`,
      origin: firstCoffee?.origin || 'Multi-Origin',
      roastProfile: firstCoffee?.roastLevel || 'Medium',
      targetRoastedKg: Number(targetRoastedKg.toFixed(2)) || 15.0,
      scheduledDate: new Date().toISOString().slice(0, 10),
      orderIds: assignedOrderIds,
      notes: `${day} artisan batch roasting session.`,
    });

    // Refresh state
    loadData();
  };

  // Handle batch status advance
  const handleUpdateBatchStatus = async (batchId: string, status: any) => {
    await updateRoastBatchStatus(batchId, status);
    const updatedBatches = await getRoastBatches();
    setBatches([...updatedBatches]);
  };

  // Reset demo data
  const handleResetData = () => {
    resetDbState();
    loadData();
  };

  // -------------------------------------------------------------
  // KPI Calculations
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    // 1. Total Gross Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + o.pricing.grandTotal, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // 2. Active Orders & Bags Breakdown
    const activeOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Roasting');
    let bags250g = 0;
    let bags500g = 0;
    let bags1kg = 0;
    let totalGramsInQueue = 0;

    for (const o of activeOrders) {
      for (const item of o.items) {
        if (item.weight === '250g' || item.weightGrams === 250) {
          bags250g += item.quantity;
        } else if (item.weight === '500g' || item.weightGrams === 500) {
          bags500g += item.quantity;
        } else if (item.weight === '1kg' || item.weightGrams === 1000) {
          bags1kg += item.quantity;
        } else {
          bags250g += item.quantity;
        }
        totalGramsInQueue += (item.weightGrams || 250) * item.quantity;
      }
    }

    // 3. Multi-channel Breakdown (Web vs WhatsApp)
    const webOrders = orders.filter(
      (o) => o.channel === 'web' || o.source.toLowerCase().includes('web')
    );
    const whatsappOrders = orders.filter(
      (o) => o.channel === 'whatsapp' || o.source.toLowerCase().includes('whatsapp')
    );
    const webPercent =
      orders.length > 0 ? Math.round((webOrders.length / orders.length) * 100) : 0;
    const whatsappPercent =
      orders.length > 0 ? Math.round((whatsappOrders.length / orders.length) * 100) : 0;

    // 4. Recurring Subscriptions
    const subscriptionOrders = orders.filter((o) =>
      o.items.some((item) => item.isSubscription)
    );
    const subscriptionMRR = subscriptionOrders.reduce(
      (sum, o) => sum + o.pricing.grandTotal * 2, // Estimate 2 shipments/mo
      0
    );

    // 5. Low Green Stock Warnings
    const lowStockBeans = inventory.filter(
      (i) => i.greenStockKg < i.safetyThresholdKg || i.isLowStock
    );

    return {
      totalRevenue,
      avgOrderValue,
      activeOrdersCount: activeOrders.length,
      bags250g,
      bags500g,
      bags1kg,
      totalKgInQueue: Number((totalGramsInQueue / 1000).toFixed(2)),
      webOrdersCount: webOrders.length,
      webPercent,
      whatsappOrdersCount: whatsappOrders.length,
      whatsappPercent,
      subscriptionOrdersCount: subscriptionOrders.length,
      subscriptionMRR,
      lowStockBeans,
    };
  }, [orders, inventory]);

  // -------------------------------------------------------------
  // Analytics Breakdown Aggregations
  // -------------------------------------------------------------
  const analytics = useMemo(() => {
    const grindMap: Record<string, number> = {};
    const roastLevelMap: Record<string, number> = {};
    const coffeeVolumeMap: Record<string, { name: string; grams: number; revenue: number }> = {};

    for (const o of orders) {
      for (const item of o.items) {
        // Grind breakdown
        const g = item.grind || 'Whole Bean';
        grindMap[g] = (grindMap[g] || 0) + item.quantity;

        // Roast level breakdown
        const r = item.roastLevel || 'Medium';
        roastLevelMap[r] = (roastLevelMap[r] || 0) + item.quantity;

        // Coffee popularity
        const cKey = item.productId || item.name;
        if (!coffeeVolumeMap[cKey]) {
          coffeeVolumeMap[cKey] = { name: item.name, grams: 0, revenue: 0 };
        }
        coffeeVolumeMap[cKey].grams += (item.weightGrams || 250) * item.quantity;
        coffeeVolumeMap[cKey].revenue += item.itemTotal;
      }
    }

    return {
      grinds: Object.entries(grindMap).sort((a, b) => b[1] - a[1]),
      roastLevels: Object.entries(roastLevelMap).sort((a, b) => b[1] - a[1]),
      topCoffees: Object.values(coffeeVolumeMap).sort((a, b) => b.grams - a.grams),
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-canvas text-espresso-950 pb-16 font-sans">
      {/* 1. Command Center Header */}
      <header className="border-b border-border-subtle bg-surface-dark text-cream-400 py-6 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2 bg-terracotta-500 text-white rounded-lg shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Rovena Coffee Roastery — Operations Command Center
              </h1>
            </div>
            <p className="text-xs text-cream-500 font-sans mt-1">
              Live order fulfillment, roast queue management, green bean inventory &amp; multi-channel
              analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Staff Indicator */}
            <div
              data-testid="live-staff-indicator"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>Staff: Live — Roastmaster Active</span>
            </div>

            {/* Current Roast Schedule Day */}
            <div
              data-testid="roast-schedule-indicator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-espresso-900 border border-espresso-700 text-cream-300 text-xs font-medium"
            >
              <Calendar className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Active Schedule: Mon &amp; Thu Roasts</span>
            </div>

            {/* Refresh / Reset button */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset test data"
              aria-label="Refresh and reset demo data"
              className="p-2 rounded-lg bg-espresso-900 hover:bg-espresso-800 text-cream-400 transition-colors focus-ring"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* 2. KPI Summary Cards Grid */}
        <section
          aria-label="Roastery KPI Summary Metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* KPI 1: Gross Revenue */}
          <Card data-testid="kpi-revenue" className="bg-surface border-border-subtle p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold uppercase tracking-wider">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="my-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
                ${kpis.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="text-[11px] text-charcoal-500 flex items-center justify-between pt-1 border-t border-border-subtle">
              <span>Avg Order Value:</span>
              <strong className="text-espresso-950">${kpis.avgOrderValue.toFixed(2)}</strong>
            </div>
          </Card>

          {/* KPI 2: Active Orders & Bags Breakdown */}
          <Card data-testid="kpi-orders-queue" className="bg-surface border-border-subtle p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold uppercase tracking-wider">
              <span>Active Roast Queue</span>
              <Package className="w-4 h-4 text-terracotta-500" />
            </div>
            <div className="my-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
                {kpis.activeOrdersCount}
              </span>
              <span className="text-xs text-charcoal-500 ml-1.5 font-sans">
                ({kpis.totalKgInQueue} kg)
              </span>
            </div>
            <div className="text-[10px] font-mono text-charcoal-600 pt-1 border-t border-border-subtle truncate">
              {kpis.bags250g}x 250g • {kpis.bags500g}x 500g • {kpis.bags1kg}x 1kg
            </div>
          </Card>

          {/* KPI 3: Multi-Channel Breakdown */}
          <Card data-testid="kpi-channels" className="bg-surface border-border-subtle p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold uppercase tracking-wider">
              <span>Channel Split</span>
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div className="my-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-700 flex items-center gap-1">
                  🌐 Web: {kpis.webPercent}%
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  💬 WA: {kpis.whatsappPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-cream-600 rounded-full overflow-hidden mt-1.5 flex">
                <div className="bg-blue-500 h-full" style={{ width: `${kpis.webPercent}%` }} />
                <div className="bg-[#25D366] h-full" style={{ width: `${kpis.whatsappPercent}%` }} />
              </div>
            </div>
            <div className="text-[11px] text-charcoal-500 pt-1 border-t border-border-subtle flex justify-between">
              <span>{kpis.webOrdersCount} Web</span>
              <span>{kpis.whatsappOrdersCount} WhatsApp</span>
            </div>
          </Card>

          {/* KPI 4: Active Subscriptions */}
          <Card data-testid="kpi-subscriptions" className="bg-surface border-border-subtle p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-charcoal-600 font-semibold uppercase tracking-wider">
              <span>Active Subscriptions</span>
              <Repeat className="w-4 h-4 text-terracotta-500" />
            </div>
            <div className="my-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
                {kpis.subscriptionOrdersCount}
              </span>
              <span className="text-xs font-medium text-emerald-700 ml-2">10% Saved</span>
            </div>
            <div className="text-[11px] text-charcoal-500 pt-1 border-t border-border-subtle flex justify-between">
              <span>Est. Recurring MRR:</span>
              <strong className="text-espresso-950">${kpis.subscriptionMRR.toFixed(0)}/mo</strong>
            </div>
          </Card>

          {/* KPI 5: Low Green Stock Warning */}
          <Card
            data-testid="kpi-low-stock"
            className={cn(
              'border p-5 flex flex-col justify-between transition-colors',
              kpis.lowStockBeans.length > 0
                ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/20'
                : 'bg-surface border-border-subtle'
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-600">
              <span>Green Bean Alerts</span>
              <AlertTriangle
                className={cn(
                  'w-4 h-4',
                  kpis.lowStockBeans.length > 0 ? 'text-amber-600 animate-pulse' : 'text-charcoal-400'
                )}
              />
            </div>
            <div className="my-2">
              <span
                className={cn(
                  'font-serif text-2xl sm:text-3xl font-bold',
                  kpis.lowStockBeans.length > 0 ? 'text-amber-800' : 'text-emerald-700'
                )}
              >
                {kpis.lowStockBeans.length > 0
                  ? `${kpis.lowStockBeans.length} Low`
                  : 'Optimal'}
              </span>
            </div>
            <div className="text-[11px] text-charcoal-500 pt-1 border-t border-border-subtle truncate">
              {kpis.lowStockBeans.length > 0
                ? kpis.lowStockBeans.map((b) => b.beanName || b.name).join(', ')
                : 'All micro-lots above safety threshold.'}
            </div>
          </Card>
        </section>

        {/* 3. Navigation Tabs */}
        <section aria-label="Operations Navigation Tabs" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-border-medium pb-2">
            {/* Tab 1: Orders Fulfillment Queue */}
            <button
              type="button"
              data-testid="tab-orders"
              onClick={() => setActiveTab('orders')}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 focus-ring',
                activeTab === 'orders'
                  ? 'bg-espresso-950 text-cream-400 shadow-sm'
                  : 'text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600'
              )}
            >
              <Package className="w-4 h-4" />
              <span>Orders Fulfillment Queue</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold font-mono',
                  activeTab === 'orders'
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-cream-700 text-espresso-950'
                )}
              >
                {orders.length}
              </span>
            </button>

            {/* Tab 2: Bean Inventory & Green Stock */}
            <button
              type="button"
              data-testid="tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 focus-ring',
                activeTab === 'inventory'
                  ? 'bg-espresso-950 text-cream-400 shadow-sm'
                  : 'text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600'
              )}
            >
              <Leaf className="w-4 h-4" />
              <span>Bean Inventory &amp; Green Stock</span>
              {kpis.lowStockBeans.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white font-mono flex items-center gap-1">
                  ⚠️ {kpis.lowStockBeans.length} Low
                </span>
              )}
            </button>

            {/* Tab 3: Roast Batches & Schedules */}
            <button
              type="button"
              data-testid="tab-batches"
              onClick={() => setActiveTab('batches')}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 focus-ring',
                activeTab === 'batches'
                  ? 'bg-espresso-950 text-cream-400 shadow-sm'
                  : 'text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600'
              )}
            >
              <Flame className="w-4 h-4" />
              <span>Roast Batches &amp; Schedules</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold font-mono',
                  activeTab === 'batches'
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-cream-700 text-espresso-950'
                )}
              >
                {batches.length}
              </span>
            </button>

            {/* Tab 4: Analytics & Channel Breakdown */}
            <button
              type="button"
              data-testid="tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 focus-ring',
                activeTab === 'analytics'
                  ? 'bg-espresso-950 text-cream-400 shadow-sm'
                  : 'text-charcoal-600 hover:text-espresso-950 hover:bg-cream-600'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics &amp; Channel Breakdown</span>
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TAB 1 CONTENT: Orders Fulfillment Queue */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <OrderTable
                orders={orders}
                onStatusChange={handleStatusChange}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2 CONTENT: Bean Inventory & Green Stock */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <InventoryManager
                inventory={inventory}
                onRestockGreen={handleRestockGreen}
                onAdjustRoastedStock={handleAdjustRoastedStock}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3 CONTENT: Roast Batches & Schedules */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'batches' && (
            <div className="space-y-4">
              <RoastBatchQueue
                orders={orders}
                batches={batches}
                onStartRoastBatch={handleStartRoastBatch}
                onUpdateBatchStatus={handleUpdateBatchStatus}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4 CONTENT: Analytics & Channel Breakdown */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Channel Distribution & Roast Volume Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Split Card */}
                <Card className="bg-surface border-border-subtle p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                    <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-terracotta-500" /> Channel Sales Breakdown
                    </h3>
                    <span className="text-xs text-charcoal-500 font-mono">
                      {orders.length} Total Orders
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <div className="flex justify-between font-semibold text-espresso-950 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-blue-500" /> Web Storefront Checkout
                        </span>
                        <span>
                          {kpis.webOrdersCount} orders ({kpis.webPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-cream-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${kpis.webPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-espresso-950 mb-1">
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Direct Concierge
                        </span>
                        <span>
                          {kpis.whatsappOrdersCount} orders ({kpis.whatsappPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-cream-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#25D366] rounded-full"
                          style={{ width: `${kpis.whatsappPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-espresso-950 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Repeat className="w-4 h-4 text-terracotta-500" /> Recurring Subscriptions
                        </span>
                        <span>
                          {kpis.subscriptionOrdersCount} subscribers
                        </span>
                      </div>
                      <div className="w-full h-3 bg-cream-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terracotta-500 rounded-full"
                          style={{
                            width: `${Math.round(
                              (kpis.subscriptionOrdersCount / Math.max(1, orders.length)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Popular Micro-Lots by Volume */}
                <Card className="bg-surface border-border-subtle p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                    <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" /> Top Micro-Lots by Roasting Demand
                    </h3>
                    <span className="text-xs text-charcoal-500 font-mono">By Net Grams</span>
                  </div>

                  <div className="divide-y divide-border-subtle text-xs font-sans">
                    {analytics.topCoffees.slice(0, 5).map((c, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-charcoal-400">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-espresso-950">{c.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-espresso-900">
                            {(c.grams / 1000).toFixed(1)} kg
                          </span>
                          <span className="text-[11px] text-charcoal-500 ml-2">
                            (${c.revenue.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Grind Preference & Roast Profile Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grind Option Preferences */}
                <Card className="bg-surface border-border-subtle p-6 shadow-card space-y-4">
                  <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2 border-b border-border-subtle pb-3">
                    <Coffee className="w-5 h-5 text-terracotta-500" /> Customer Grind Preferences
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analytics.grinds.map(([grind, count]) => (
                      <div
                        key={grind}
                        className="p-3 bg-canvas rounded-lg border border-border-subtle text-center"
                      >
                        <span className="font-mono font-bold text-xl text-espresso-950">
                          {count}
                        </span>
                        <p className="text-[11px] text-charcoal-600 font-medium mt-0.5 truncate">
                          {grind}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Roast Level Distribution */}
                <Card className="bg-surface border-border-subtle p-6 shadow-card space-y-4">
                  <h3 className="font-serif text-lg font-bold text-espresso-950 flex items-center gap-2 border-b border-border-subtle pb-3">
                    <Flame className="w-5 h-5 text-terracotta-500" /> Roast Profile Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analytics.roastLevels.map(([level, count]) => (
                      <div
                        key={level}
                        className="p-3 bg-canvas rounded-lg border border-border-subtle text-center"
                      >
                        <span className="font-mono font-bold text-xl text-terracotta-600">
                          {count}
                        </span>
                        <p className="text-[11px] text-espresso-900 font-medium mt-0.5 truncate">
                          {level} Roast
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Slide-over / Modal Order Detail Viewer */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
