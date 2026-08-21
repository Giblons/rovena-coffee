import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  OrderStatusBadge,
  OrderDetailModal,
  OrderTable,
  InventoryManager,
  RoastBatchQueue,
} from '@/components/admin';
import { Order } from '@/types/order';
import { InventoryItem } from '@/types/inventory';

const mockOrders: Order[] = [
  {
    id: 'ORD-2026-1001',
    orderNumber: 1001,
    channel: 'web',
    source: 'Web Checkout',
    status: 'Pending',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena@example.com',
      phone: '+1 555 123 4567',
    },
    shippingAddress: {
      street: '1420 5th Ave',
      unit: 'Suite 800',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    },
    shippingMethod: 'standard',
    items: [
      {
        id: 'ORD-2026-1001-item-1',
        productId: 'ethiopia-yirgacheffe-chelbesa',
        name: 'Ethiopia Yirgacheffe Chelbesa',
        slug: 'ethiopia-yirgacheffe-chelbesa',
        origin: 'Ethiopia',
        roastLevel: 'Light',
        weight: '250g',
        weightGrams: 250,
        grind: 'v60_drip',
        unitPrice: 22.5,
        quantity: 2,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 45.0,
      },
    ],
    pricing: {
      itemsCount: 2,
      totalGrams: 500,
      grossSubtotal: 45.0,
      subscriptionSavings: 0,
      netSubtotal: 45.0,
      couponDiscount: 0,
      shippingFee: 5.0,
      tax: 3.6,
      grandTotal: 53.6,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 5.0,
    },
    notes: 'Please roast light and preserve floral notes.',
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'ORD-2026-1002',
    orderNumber: 1002,
    channel: 'whatsapp',
    source: 'WhatsApp Direct',
    status: 'Roasting',
    paymentStatus: 'pending_manual',
    paymentMethod: 'whatsapp_manual',
    customer: {
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus@example.com',
      phone: '+1 555 987 6543',
    },
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
    },
    shippingMethod: 'express',
    items: [
      {
        id: 'ORD-2026-1002-item-1',
        productId: 'colombia-el-paraiso-thermal-shock',
        name: 'Colombia El Paraiso Thermal Shock',
        slug: 'colombia-el-paraiso-thermal-shock',
        origin: 'Colombia',
        roastLevel: 'Light',
        weight: '500g',
        weightGrams: 500,
        grind: 'espresso',
        unitPrice: 48.88,
        quantity: 1,
        isSubscription: false,
        subscriptionDiscountPercent: 0,
        itemTotal: 48.88,
      },
    ],
    pricing: {
      itemsCount: 1,
      totalGrams: 500,
      grossSubtotal: 48.88,
      subscriptionSavings: 0,
      netSubtotal: 48.88,
      couponDiscount: 0,
      shippingFee: 12.0,
      tax: 3.91,
      grandTotal: 64.79,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 1.12,
    },
    notes: 'Contact on WhatsApp for courier pickup time.',
    createdAt: '2026-08-20T14:30:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z',
  },
  {
    id: 'ORD-2026-1003',
    orderNumber: 1003,
    channel: 'web',
    source: 'Web Checkout (Subscription)',
    status: 'Dispatched',
    paymentStatus: 'paid',
    paymentMethod: 'simulated_card',
    customer: {
      firstName: 'Chloe',
      lastName: 'Dupont',
      email: 'chloe@example.com',
      phone: '+1 555 444 8888',
    },
    shippingAddress: {
      street: '2200 Westlake Ave',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98121',
      country: 'United States',
    },
    shippingMethod: 'standard',
    items: [
      {
        id: 'ORD-2026-1003-item-1',
        productId: 'lumina-apex-house-espresso-blend',
        name: 'Apex House Espresso Blend',
        slug: 'lumina-apex-house-espresso-blend',
        origin: 'Multi-Origin Blend',
        roastLevel: 'Medium',
        weight: '1kg',
        weightGrams: 1000,
        grind: 'whole_bean',
        unitPrice: 54.34,
        quantity: 1,
        isSubscription: true,
        subscriptionFrequency: 'biweekly',
        subscriptionDiscountPercent: 10,
        itemTotal: 54.34,
      },
    ],
    pricing: {
      itemsCount: 1,
      totalGrams: 1000,
      grossSubtotal: 60.38,
      subscriptionSavings: 6.04,
      netSubtotal: 54.34,
      couponDiscount: 0,
      shippingFee: 0.0,
      tax: 4.35,
      grandTotal: 58.69,
      freeShippingThreshold: 50.0,
      amountNeededForFreeShipping: 0,
    },
    trackingNumber: 'TRACK-USPS-994102',
    createdAt: '2026-08-19T09:00:00.000Z',
    updatedAt: '2026-08-19T09:00:00.000Z',
  },
];

const mockInventory: InventoryItem[] = [
  {
    id: 'INV-1',
    productId: 'ethiopia-yirgacheffe-chelbesa',
    beanName: 'Ethiopia Yirgacheffe Chelbesa',
    name: 'Ethiopia Yirgacheffe Chelbesa',
    origin: 'Ethiopia',
    varietal: 'Heirloom',
    process: 'Washed',
    greenStockKg: 240,
    roastedStockKg: 45,
    allocatedKg: 12,
    reservedStockKg: 0,
    safetyThresholdKg: 30,
    roastScheduleDays: ['Monday', 'Thursday'],
    isLowStock: false,
    isActive: true,
  },
  {
    id: 'INV-2',
    productId: 'colombia-el-paraiso-thermal-shock',
    beanName: 'Colombia El Paraiso Thermal Shock',
    name: 'Colombia El Paraiso Thermal Shock',
    origin: 'Colombia',
    varietal: 'Castillo',
    process: 'Thermal Shock',
    greenStockKg: 12, // Below 25kg safety threshold
    roastedStockKg: 6,
    allocatedKg: 4,
    reservedStockKg: 0,
    safetyThresholdKg: 25,
    roastScheduleDays: ['Monday'],
    isLowStock: true,
    isActive: true,
  },
];

describe('Admin UI Components — Unit Tests', () => {
  // -------------------------------------------------------------
  // 1. OrderStatusBadge
  // -------------------------------------------------------------
  describe('OrderStatusBadge', () => {
    it('renders static badge with correct label and color classes for Pending', () => {
      render(<OrderStatusBadge status="Pending" />);
      const badge = screen.getByTestId('order-status-badge');
      expect(badge).toHaveTextContent('Pending Roast');
      expect(badge.className).toContain('text-amber-800');
    });

    it('renders static badge for Roasting, Dispatched, Delivered, and Cancelled', () => {
      const { rerender } = render(<OrderStatusBadge status="Roasting" />);
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Roasting');

      rerender(<OrderStatusBadge status="Dispatched" />);
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Dispatched');

      rerender(<OrderStatusBadge status="Delivered" />);
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Delivered');

      rerender(<OrderStatusBadge status="Cancelled" />);
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent('Cancelled');
    });

    it('renders interactive dropdown select and fires onStatusChange', async () => {
      const onStatusChange = vi.fn();
      render(
        <OrderStatusBadge
          status="Pending"
          interactive={true}
          onStatusChange={onStatusChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('Pending');

      fireEvent.change(select, { target: { value: 'Roasting' } });
      expect(onStatusChange).toHaveBeenCalledWith('Roasting');
    });
  });

  // -------------------------------------------------------------
  // 2. OrderDetailModal
  // -------------------------------------------------------------
  describe('OrderDetailModal', () => {
    it('renders complete shipping info, line items, and pricing breakdown', () => {
      render(
        <OrderDetailModal
          order={mockOrders[0]}
          isOpen={true}
          onClose={vi.fn()}
          onStatusChange={vi.fn()}
        />
      );

      expect(screen.getByText('Order ORD-2026-1001')).toBeInTheDocument();
      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
      expect(screen.getByText('1420 5th Ave')).toBeInTheDocument();
      expect(screen.getByText('Seattle, WA 98101')).toBeInTheDocument();
      expect(screen.getByText('elena@example.com')).toBeInTheDocument();
      expect(screen.getByText('Ethiopia Yirgacheffe Chelbesa')).toBeInTheDocument();
      expect(screen.getByText('$53.60')).toBeInTheDocument();
      expect(screen.getByText('"Please roast light and preserve floral notes."')).toBeInTheDocument();
    });

    it('renders WhatsApp direct action button and triggers wa.me for WhatsApp orders', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(
        <OrderDetailModal
          order={mockOrders[1]} // WhatsApp order
          isOpen={true}
          onClose={vi.fn()}
          onStatusChange={vi.fn()}
        />
      );

      const waBtn = screen.getByText('Reopen WhatsApp Chat');
      expect(waBtn).toBeInTheDocument();

      fireEvent.click(waBtn);
      expect(openSpy).toHaveBeenCalled();
      expect(openSpy.mock.calls[0][0]).toContain('https://wa.me/');
      expect(openSpy.mock.calls[0][0]).toContain('ORD-2026-1002');

      openSpy.mockRestore();
    });

    it('toggles printable Roastery Packing Slip & Grind Setting Tag', () => {
      render(
        <OrderDetailModal
          order={mockOrders[0]}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.queryByTestId('roastery-packing-slip')).not.toBeInTheDocument();

      const printBtn = screen.getByText('Print Packing Slip');
      fireEvent.click(printBtn);

      const packingSlip = screen.getByTestId('roastery-packing-slip');
      expect(packingSlip).toBeInTheDocument();
      expect(packingSlip).toHaveTextContent('Packing Bench Slip');
      expect(packingSlip).toHaveTextContent('Grind Tag: v60_drip');
      expect(packingSlip).toHaveTextContent('Bench QC');
    });

    it('allows changing order status inside modal', () => {
      const onStatusChange = vi.fn();
      render(
        <OrderDetailModal
          order={mockOrders[0]}
          isOpen={true}
          onClose={vi.fn()}
          onStatusChange={onStatusChange}
        />
      );

      const select = screen.getByLabelText('Change order status from Pending');
      fireEvent.change(select, { target: { value: 'Delivered' } });
      expect(onStatusChange).toHaveBeenCalledWith('ORD-2026-1001', 'Delivered');
    });
  });

  // -------------------------------------------------------------
  // 3. OrderTable
  // -------------------------------------------------------------
  describe('OrderTable', () => {
    it('renders table rows for all orders and channel badges', () => {
      render(
        <OrderTable
          orders={mockOrders}
          onStatusChange={vi.fn()}
          onSelectOrder={vi.fn()}
        />
      );

      expect(screen.getByTestId('order-row-ORD-2026-1001')).toBeInTheDocument();
      expect(screen.getByTestId('order-row-ORD-2026-1002')).toBeInTheDocument();
      expect(screen.getByTestId('order-row-ORD-2026-1003')).toBeInTheDocument();
      expect(screen.getByText('#ORD-2026-1001')).toBeInTheDocument();
      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    });

    it('filters orders by channel tabs (Web, WhatsApp, Subscriptions)', () => {
      render(
        <OrderTable
          orders={mockOrders}
          onStatusChange={vi.fn()}
          onSelectOrder={vi.fn()}
        />
      );

      // WhatsApp tab
      const waTab = screen.getByRole('button', { name: /WhatsApp/i });
      fireEvent.click(waTab);

      expect(screen.getByTestId('order-row-ORD-2026-1002')).toBeInTheDocument();
      expect(screen.queryByTestId('order-row-ORD-2026-1001')).not.toBeInTheDocument();

      // Subscriptions tab
      const subTab = screen.getByRole('button', { name: /Subscriptions/i });
      fireEvent.click(subTab);

      expect(screen.getByTestId('order-row-ORD-2026-1003')).toBeInTheDocument();
      expect(screen.queryByTestId('order-row-ORD-2026-1002')).not.toBeInTheDocument();
    });

    it('filters orders by search query across customer name, email, or bean name', () => {
      render(
        <OrderTable
          orders={mockOrders}
          onStatusChange={vi.fn()}
          onSelectOrder={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search Order ID, customer, bean...');
      fireEvent.change(searchInput, { target: { value: 'Chelbesa' } });

      expect(screen.getByTestId('order-row-ORD-2026-1001')).toBeInTheDocument();
      expect(screen.queryByTestId('order-row-ORD-2026-1002')).not.toBeInTheDocument();
      expect(screen.queryByTestId('order-row-ORD-2026-1003')).not.toBeInTheDocument();
    });

    it('filters orders by status dropdown', () => {
      render(
        <OrderTable
          orders={mockOrders}
          onStatusChange={vi.fn()}
          onSelectOrder={vi.fn()}
        />
      );

      const statusSelect = screen.getByLabelText('Filter orders by status');
      fireEvent.change(statusSelect, { target: { value: 'Roasting' } });

      expect(screen.getByTestId('order-row-ORD-2026-1002')).toBeInTheDocument();
      expect(screen.queryByTestId('order-row-ORD-2026-1001')).not.toBeInTheDocument();
    });

    it('triggers onSelectOrder when clicking Inspect button', () => {
      const onSelectOrder = vi.fn();
      render(
        <OrderTable
          orders={mockOrders}
          onStatusChange={vi.fn()}
          onSelectOrder={onSelectOrder}
        />
      );

      const row = screen.getByTestId('order-row-ORD-2026-1001');
      const inspectBtn = within(row).getByText('Inspect');
      fireEvent.click(inspectBtn);

      expect(onSelectOrder).toHaveBeenCalledWith(mockOrders[0]);
    });
  });

  // -------------------------------------------------------------
  // 4. InventoryManager
  // -------------------------------------------------------------
  describe('InventoryManager', () => {
    it('renders stock table and displays low stock warning alert card', () => {
      render(<InventoryManager inventory={mockInventory} />);

      const banner = screen.getByTestId('low-stock-alert-banner');
      expect(banner).toBeInTheDocument();
      expect(within(banner).getByText(/Green Bean Safety Stock Warning/)).toBeInTheDocument();
      expect(within(banner).getByText(/Colombia El Paraiso Thermal Shock/)).toBeInTheDocument();
      expect(screen.getByTestId('inventory-row-ethiopia-yirgacheffe-chelbesa')).toBeInTheDocument();
    });

    it('calculates green bean requirements and moisture shrinkage dynamically', () => {
      render(<InventoryManager inventory={mockInventory} />);

      const calc = screen.getByTestId('shrinkage-calculator');
      expect(calc).toBeInTheDocument();

      const greenReq = screen.getByTestId('calc-green-required');
      // Default: 20kg roasted @ 15% shrinkage => 20 / 0.85 = 23.53 kg
      expect(greenReq).toHaveTextContent('23.53');

      // Change target roasted kg to 40kg
      const input = screen.getByLabelText('Target Roasted Output (kg)');
      fireEvent.change(input, { target: { value: '40' } });

      // 40 / 0.85 = 47.06 kg
      expect(screen.getByTestId('calc-green-required')).toHaveTextContent('47.06');
    });

    it('opens restock modal and logs shipment lot', () => {
      const onRestockGreen = vi.fn();
      render(
        <InventoryManager
          inventory={mockInventory}
          onRestockGreen={onRestockGreen}
        />
      );

      const restockBtn = screen.getByText('Quick Restock');
      fireEvent.click(restockBtn);

      expect(screen.getByText('Record Inventory Shipment & Restock')).toBeInTheDocument();

      const amountInput = screen.getByLabelText('Restock Amount (kg)');
      fireEvent.change(amountInput, { target: { value: '60' } });

      const lotInput = screen.getByLabelText('Shipment Lot Number / Bill of Lading');
      fireEvent.change(lotInput, { target: { value: 'LOT-TEST-99' } });

      const submitBtn = screen.getByText('Save Shipment Lot');
      fireEvent.click(submitBtn);

      expect(onRestockGreen).toHaveBeenCalledWith(
        'ethiopia-yirgacheffe-chelbesa',
        60,
        'LOT-TEST-99',
        expect.any(String)
      );
    });
  });

  // -------------------------------------------------------------
  // 5. RoastBatchQueue
  // -------------------------------------------------------------
  describe('RoastBatchQueue', () => {
    it('aggregates roasting demand across pending orders', () => {
      render(
        <RoastBatchQueue
          orders={mockOrders} // ORD-1001 is Pending (2x 250g = 500g of Chelbesa)
          batches={[]}
        />
      );

      expect(
        screen.getByTestId('batch-req-ethiopia-yirgacheffe-chelbesa')
      ).toBeInTheDocument();
      expect(screen.getByText('0.5 kg')).toBeInTheDocument(); // 500g roasted
      expect(screen.getByText('0.59 kg')).toBeInTheDocument(); // 0.5 / 0.85 = 0.59 kg green
      expect(screen.getByText('2x 250g')).toBeInTheDocument();
    });

    it('triggers one-click Monday roast batch creation', () => {
      const onStartRoastBatch = vi.fn();
      render(
        <RoastBatchQueue
          orders={mockOrders}
          batches={[]}
          onStartRoastBatch={onStartRoastBatch}
        />
      );

      const mondayBtn = screen.getByTestId('trigger-monday-batch');
      fireEvent.click(mondayBtn);

      expect(onStartRoastBatch).toHaveBeenCalledWith('Monday', ['ORD-2026-1001']);
      expect(screen.getByTestId('batch-success-notice')).toBeInTheDocument();
    });

    it('displays active batches and allows advancing batch status', () => {
      const onUpdateBatchStatus = vi.fn();
      const mockBatches = [
        {
          id: 'BATCH-20260821-001',
          coffeeName: 'Ethiopia Yirgacheffe Chelbesa',
          origin: 'Ethiopia',
          status: 'Scheduled',
          targetRoastedKg: 25.0,
          requiredGreenKg: 29.41,
          scheduledDate: '2026-08-21',
        },
      ];

      render(
        <RoastBatchQueue
          orders={mockOrders}
          batches={mockBatches}
          onUpdateBatchStatus={onUpdateBatchStatus}
        />
      );

      expect(screen.getByTestId('batch-item-BATCH-20260821-001')).toBeInTheDocument();
      const roastBtn = screen.getByText('Mark Roasting');
      fireEvent.click(roastBtn);

      expect(onUpdateBatchStatus).toHaveBeenCalledWith(
        'BATCH-20260821-001',
        'Roasting'
      );
    });
  });
});
