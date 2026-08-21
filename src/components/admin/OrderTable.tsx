'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  MessageCircle,
  Globe,
  Repeat,
  Package,
  Calendar,
  X,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type ChannelTab = 'all' | 'web' | 'whatsapp' | 'subscriptions';
export type SortField = 'date' | 'id' | 'customer' | 'total' | 'items';
export type SortOrder = 'asc' | 'desc';

export interface OrderTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onSelectOrder: (order: Order) => void;
  className?: string;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onStatusChange,
  onSelectOrder,
  className,
}) => {
  const [activeChannel, setActiveChannel] = useState<ChannelTab>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Channel counts
  const channelCounts = useMemo(() => {
    return {
      all: orders.length,
      web: orders.filter((o) => o.channel === 'web' && !o.items.some((i) => i.isSubscription))
        .length,
      whatsapp: orders.filter((o) => o.channel === 'whatsapp').length,
      subscriptions: orders.filter((o) => o.items.some((i) => i.isSubscription)).length,
    };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Channel tab filter
    if (activeChannel === 'web') {
      result = result.filter((o) => o.channel === 'web' && !o.items.some((i) => i.isSubscription));
    } else if (activeChannel === 'whatsapp') {
      result = result.filter(
        (o) => o.channel === 'whatsapp' || o.source.toLowerCase().includes('whatsapp')
      );
    } else if (activeChannel === 'subscriptions') {
      result = result.filter((o) => o.items.some((i) => i.isSubscription));
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search query filter (Order ID, Customer Name, Email, Bean Name, Phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.customer.phone && o.customer.phone.toLowerCase().includes(q)) ||
          o.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.origin.toLowerCase().includes(q) ||
              i.productId.toLowerCase().includes(q)
          )
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'customer') {
        const nameA = `${a.customer.firstName} ${a.customer.lastName}`;
        const nameB = `${b.customer.firstName} ${b.customer.lastName}`;
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'total') {
        comparison = a.pricing.grandTotal - b.pricing.grandTotal;
      } else if (sortField === 'items') {
        comparison = a.pricing.itemsCount - b.pricing.itemsCount;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [orders, activeChannel, statusFilter, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setActiveChannel('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className={cn('space-y-4 font-sans', className)}>
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border-subtle shadow-card">
        {/* Channel Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-cream-600 rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveChannel('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
              activeChannel === 'all'
                ? 'bg-surface text-espresso-950 shadow-xs'
                : 'text-charcoal-600 hover:text-espresso-900 hover:bg-cream-500/60'
            )}
          >
            <span>All Orders</span>
            <span className="px-1.5 py-0.2 bg-espresso-100 text-espresso-900 rounded-full text-[10px]">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('web')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
              activeChannel === 'web'
                ? 'bg-surface text-espresso-950 shadow-xs'
                : 'text-charcoal-600 hover:text-espresso-900 hover:bg-cream-500/60'
            )}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Web Orders</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
              {channelCounts.web}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('whatsapp')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
              activeChannel === 'whatsapp'
                ? 'bg-surface text-espresso-950 shadow-xs'
                : 'text-charcoal-600 hover:text-espresso-900 hover:bg-cream-500/60'
            )}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
              {channelCounts.whatsapp}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('subscriptions')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
              activeChannel === 'subscriptions'
                ? 'bg-surface text-espresso-950 shadow-xs'
                : 'text-charcoal-600 hover:text-espresso-900 hover:bg-cream-500/60'
            )}
          >
            <Repeat className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Subscriptions</span>
            <span className="px-1.5 py-0.2 bg-terracotta-100 text-terracotta-800 rounded-full text-[10px]">
              {channelCounts.subscriptions}
            </span>
          </button>
        </div>

        {/* Search Bar & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search Order ID, customer, bean..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search orders"
              className={cn(
                'w-full pl-9 pr-8 py-1.5 text-xs font-sans rounded-md border border-border-subtle bg-canvas text-espresso-950',
                'focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-espresso-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-charcoal-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter orders by status"
              className="text-xs font-medium border border-border-subtle rounded-md px-2.5 py-1.5 bg-canvas text-espresso-950 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Roast</option>
              <option value="Roasting">Roasting</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" data-testid="orders-table">
            <thead>
              <tr className="bg-canvas border-b border-border-subtle text-charcoal-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('id')}
                    className="flex items-center gap-1 hover:text-espresso-950"
                  >
                    Order Ref <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 hover:text-espresso-950"
                  >
                    Date & Time <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('customer')}
                    className="flex items-center gap-1 hover:text-espresso-950"
                  >
                    Customer <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Items & Variant Specs</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort('total')}
                    className="flex items-center gap-1 hover:text-espresso-950"
                  >
                    Total ($) <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-500 font-sans">
                    <Package className="w-8 h-8 text-charcoal-400 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-sm text-espresso-900">No orders found</p>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      No customer orders match the selected filters or search query.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-3 text-xs"
                    >
                      Clear Filters
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isWa =
                    order.channel === 'whatsapp' || order.source.toLowerCase().includes('whatsapp');
                  const hasSub = order.items.some((i) => i.isSubscription);

                  return (
                    <tr
                      key={order.id}
                      data-testid={`order-row-${order.id}`}
                      className="hover:bg-cream-500/40 transition-colors"
                    >
                      {/* Order Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-espresso-950 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="hover:text-terracotta-600 transition-colors focus-ring rounded"
                        >
                          #{order.id}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-charcoal-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-charcoal-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-espresso-950">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-[11px] text-charcoal-500">{order.customer.email}</div>
                        <div className="text-[10px] text-charcoal-400">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </td>

                      {/* Items & Specs */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-medium text-espresso-900">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-cream-600 rounded text-espresso-800">
                                {item.weight}
                              </span>
                              <span className="text-[10px] font-medium px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                {item.grind}
                              </span>
                              {item.isSubscription && (
                                <span className="text-[10px] font-semibold text-terracotta-600">
                                  🔄 Sub
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isWa ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#25D366]/10 text-emerald-800 border border-[#25D366]/30 font-medium text-[11px]">
                            <MessageCircle className="w-3 h-3 text-[#25D366]" /> WhatsApp
                          </span>
                        ) : hasSub ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-terracotta-50 text-terracotta-700 border border-terracotta-200 font-medium text-[11px]">
                            <Repeat className="w-3 h-3 text-terracotta-500" /> Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px]">
                            <Globe className="w-3 h-3 text-blue-500" /> Web
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-espresso-950">
                          ${order.pricing.grandTotal.toFixed(2)}
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-medium uppercase',
                            order.paymentStatus === 'paid'
                              ? 'text-emerald-600'
                              : 'text-amber-600 font-semibold'
                          )}
                        >
                          {order.paymentStatus === 'paid' ? '● Paid' : '⏳ Pending Pay'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <OrderStatusBadge
                          status={order.status}
                          size="sm"
                          interactive={true}
                          onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-espresso-700" />}
                          onClick={() => onSelectOrder(order)}
                          className="text-xs h-7 px-2.5"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Table Counts */}
        <div className="p-3 bg-canvas border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-charcoal-600">
          <span>
            Showing <strong className="text-espresso-950">{filteredOrders.length}</strong> of{' '}
            <strong className="text-espresso-950">{orders.length}</strong> total orders
          </span>
          <span className="text-[11px] text-charcoal-500">
            Click &quot;Inspect&quot; to print packing tags or view detailed specifications.
          </span>
        </div>
      </div>
    </div>
  );
};
