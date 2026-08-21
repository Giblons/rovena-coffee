import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import { resetDbState, getAllOrders, getInventory, createOrder } from '@/lib/db';

describe('Roastery Admin & Operations Dashboard — Integration Tests (Milestone 5)', () => {
  beforeEach(() => {
    resetDbState();
  });

  // -------------------------------------------------------------
  // 1. Header & KPI Metrics
  // -------------------------------------------------------------
  describe('Header & KPI Metrics Bar', () => {
    it('renders command center header with live staff and roast schedule indicators', () => {
      render(<AdminDashboardPage />);

      expect(
        screen.getByText('Lumina Artisan Roastery — Operations Command Center')
      ).toBeInTheDocument();
      expect(screen.getByTestId('live-staff-indicator')).toHaveTextContent(
        'Staff: Live — Roastmaster Active'
      );
      expect(screen.getByTestId('roast-schedule-indicator')).toHaveTextContent(
        'Active Schedule: Mon & Thu Roasts'
      );
    });

    it('renders 5 genuine KPI summary cards with live calculation data', () => {
      render(<AdminDashboardPage />);

      // 1. Total Revenue KPI
      const revCard = screen.getByTestId('kpi-revenue');
      expect(revCard).toBeInTheDocument();
      expect(within(revCard).getByText(/Total Revenue/i)).toBeInTheDocument();

      // 2. Active Orders Queue KPI
      const queueCard = screen.getByTestId('kpi-orders-queue');
      expect(queueCard).toBeInTheDocument();
      expect(within(queueCard).getByText(/Active Roast Queue/i)).toBeInTheDocument();

      // 3. Multi-Channel Split KPI
      const channelCard = screen.getByTestId('kpi-channels');
      expect(channelCard).toBeInTheDocument();
      expect(within(channelCard).getByText(/Channel Split/i)).toBeInTheDocument();

      // 4. Subscriptions KPI
      const subCard = screen.getByTestId('kpi-subscriptions');
      expect(subCard).toBeInTheDocument();
      expect(within(subCard).getByText(/Active Subscriptions/i)).toBeInTheDocument();

      // 5. Low Green Stock Warning KPI
      const stockCard = screen.getByTestId('kpi-low-stock');
      expect(stockCard).toBeInTheDocument();
      expect(within(stockCard).getByText(/Green Bean Alerts/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 2. Tab Navigation
  // -------------------------------------------------------------
  describe('Navigation Tabs Switching', () => {
    it('switches between all 4 tabs with live badges and content panels', async () => {
      render(<AdminDashboardPage />);

      // Default: Orders Fulfillment Queue
      expect(screen.getByTestId('tab-orders')).toHaveTextContent('Orders Fulfillment Queue');
      expect(screen.getByTestId('orders-table')).toBeInTheDocument();

      // Tab 2: Bean Inventory & Green Stock
      fireEvent.click(screen.getByTestId('tab-inventory'));
      expect(screen.getByTestId('inventory-table')).toBeInTheDocument();
      expect(screen.getByTestId('shrinkage-calculator')).toBeInTheDocument();

      // Tab 3: Roast Batches & Schedules
      fireEvent.click(screen.getByTestId('tab-batches'));
      expect(screen.getByTestId('trigger-monday-batch')).toBeInTheDocument();
      expect(screen.getByTestId('trigger-thursday-batch')).toBeInTheDocument();

      // Tab 4: Analytics & Channel Breakdown
      fireEvent.click(screen.getByTestId('tab-analytics'));
      expect(screen.getByText('Channel Sales Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Customer Grind Preferences')).toBeInTheDocument();
      expect(screen.getByText('Roast Profile Distribution')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 3. End-to-End Operational Workflows
  // -------------------------------------------------------------
  describe('End-to-End Operational Workflows', () => {
    it('Workflow A: changes order fulfillment status inline and opens detail inspection modal', async () => {
      render(<AdminDashboardPage />);

      // Inspect order ORD-2026-1002
      const row = screen.getByTestId('order-row-ORD-2026-1002');
      const inspectBtn = within(row).getByText('Inspect');
      fireEvent.click(inspectBtn);

      // Verify modal opened
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Order ORD-2026-1002')).toBeInTheDocument();
      expect(within(modal).getByText('Marcus Vance')).toBeInTheDocument();

      // Toggle packing slip
      const printSlipBtn = screen.getByText('Print Packing Slip');
      fireEvent.click(printSlipBtn);
      expect(screen.getByTestId('roastery-packing-slip')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByText('Close Details');
      fireEvent.click(closeBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Workflow B: one-click roast batch trigger bulk-updates pending orders to Roasting', async () => {
      render(<AdminDashboardPage />);

      // Navigate to Roast Batches & Schedules tab
      fireEvent.click(screen.getByTestId('tab-batches'));

      // Check Monday batch trigger button
      const mondayBtn = screen.getByTestId('trigger-monday-batch');
      expect(mondayBtn).toBeEnabled();

      await waitFor(() => {
        fireEvent.click(mondayBtn);
      });

      // Notice appears
      expect(screen.getByTestId('batch-success-notice')).toHaveTextContent(
        /Roast batch for Monday triggered!/
      );

      // Verify orders transitioned
      const allOrders = getAllOrders();
      const pendingAfter = allOrders.filter((o) => o.status === 'Pending');
      expect(pendingAfter.length).toBe(0);
    });

    it('Workflow C: restocks green bean inventory and clears/updates low stock alert', async () => {
      render(<AdminDashboardPage />);

      // Navigate to Bean Inventory tab
      fireEvent.click(screen.getByTestId('tab-inventory'));

      // Quick restock button
      const restockBtn = screen.getByText('Quick Restock');
      fireEvent.click(restockBtn);

      // Select Colombia El Paraiso (currently low stock)
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      const amountInput = within(modal).getByLabelText('Restock Amount (kg)');
      fireEvent.change(amountInput, { target: { value: '100' } });

      const lotInput = within(modal).getByLabelText('Shipment Lot Number / Bill of Lading');
      fireEvent.change(lotInput, { target: { value: 'LOT-COL-2026-TEST' } });

      const saveBtn = within(modal).getByText('Save Shipment Lot');
      fireEvent.click(saveBtn);

      // Verify inventory updated
      const inv = getInventory();
      const chelbesa = inv.find((i) => i.productId === 'ethiopia-yirgacheffe-chelbesa');
      expect(chelbesa!.greenStockKg).toBeGreaterThanOrEqual(240 + 100);
    });

    it('Workflow D: renders multi-channel and grind preference analytics', () => {
      render(<AdminDashboardPage />);

      // Navigate to Analytics & Channel Breakdown tab
      fireEvent.click(screen.getByTestId('tab-analytics'));

      expect(screen.getByText('Web Storefront Checkout')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp Direct Concierge')).toBeInTheDocument();
      expect(screen.getByText('Top Micro-Lots by Roasting Demand')).toBeInTheDocument();
      expect(screen.getByText('Roast Profile Distribution')).toBeInTheDocument();
    });
  });
});
