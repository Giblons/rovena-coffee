import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentSimulator } from '@/components/checkout/PaymentSimulator';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartItem } from '@/types/cart';

describe('Checkout & Cart UI Components — Unit Tests (Milestone 4)', () => {
  const mockItem: CartItem = {
    id: 'ethiopia-chelbesa__250g__whole_bean__onetime',
    productId: 'ethiopia-yirgacheffe-chelbesa',
    slug: 'ethiopia-yirgacheffe-chelbesa',
    name: 'Ethiopia Yirgacheffe Chelbesa',
    origin: 'Ethiopia',
    roastLevel: 'Light',
    imageUrl: '/images/coffees/ethiopia-chelbesa.jpg',
    weight: '250g',
    weightGrams: 250,
    grind: 'whole_bean',
    basePrice250g: 22.5,
    unitPrice: 22.5,
    quantity: 2,
    isSubscription: false,
    subscriptionDiscountPercent: 0,
  };

  describe('PaymentSimulator', () => {
    it('renders interactive card graphic with default mock card details', () => {
      render(<PaymentSimulator />);
      expect(screen.getByText('LUMINA PAY')).toBeInTheDocument();
      expect(screen.getByText('4242 4242 4242 4242')).toBeInTheDocument();
      expect(screen.getByText('ALEX MORGAN')).toBeInTheDocument();
      expect(screen.getByText('12/28')).toBeInTheDocument();
    });

    it('switches to decline mode when 0002 test card chip is clicked', () => {
      const handleValidChange = vi.fn();
      render(<PaymentSimulator onPaymentValidChange={handleValidChange} />);

      const declineButton = screen.getByRole('button', { name: /0002 Decline/i });
      fireEvent.click(declineButton);

      expect(handleValidChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          cardNumber: '4000 0000 0000 0002',
          status: 'declined',
        })
      );
      expect(screen.getByText(/Simulated Card Decline Mode/i)).toBeInTheDocument();
    });

    it('switches to success mode when 4242 test card chip is clicked', () => {
      const handleValidChange = vi.fn();
      render(<PaymentSimulator onPaymentValidChange={handleValidChange} />);

      const successButton = screen.getByRole('button', { name: /4242 Success/i });
      fireEvent.click(successButton);

      expect(handleValidChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          cardNumber: '4242 4242 4242 4242',
          status: 'valid',
        })
      );
    });
  });

  describe('PromoCodeInput', () => {
    it('applies promo code on form submission', () => {
      const handleApply = vi.fn().mockReturnValue({ success: true, message: 'Applied!' });
      const handleRemove = vi.fn();

      render(
        <PromoCodeInput
          appliedDiscount={null}
          onApply={handleApply}
          onRemove={handleRemove}
        />
      );

      const input = screen.getByPlaceholderText(/Promo code/i);
      fireEvent.change(input, { target: { value: 'WELCOME10' } });

      const applyBtn = screen.getByRole('button', { name: /Apply/i });
      fireEvent.click(applyBtn);

      expect(handleApply).toHaveBeenCalledWith('WELCOME10');
    });

    it('renders applied discount badge with remove button', () => {
      const handleApply = vi.fn();
      const handleRemove = vi.fn();

      render(
        <PromoCodeInput
          appliedDiscount={{
            code: 'ROASTMASTER10',
            type: 'percentage',
            value: 10,
            description: '10% Roastery Discount',
          }}
          onApply={handleApply}
          onRemove={handleRemove}
        />
      );

      expect(screen.getByText('ROASTMASTER10')).toBeInTheDocument();
      expect(screen.getByText('(10% Roastery Discount)')).toBeInTheDocument();

      const removeBtn = screen.getByRole('button', { name: /Remove coupon/i });
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('CartItemRow', () => {
    it('renders item row with correct attributes, price calculation, and quantity controls', () => {
      const handleUpdateQuantity = vi.fn();
      const handleRemove = vi.fn();

      render(
        <CartItemRow
          item={mockItem}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
        />
      );

      expect(screen.getByText('Ethiopia Yirgacheffe Chelbesa')).toBeInTheDocument();
      expect(screen.getByText('250g')).toBeInTheDocument();
      expect(screen.getByText('whole bean')).toBeInTheDocument();
      expect(screen.getByText('$45.00')).toBeInTheDocument(); // 2 x 22.50
      expect(screen.getByText('2')).toBeInTheDocument(); // quantity

      // Increase quantity
      const plusBtn = screen.getByRole('button', { name: /Increase quantity/i });
      fireEvent.click(plusBtn);
      expect(handleUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 3);

      // Decrease quantity
      const minusBtn = screen.getByRole('button', { name: /Decrease quantity/i });
      fireEvent.click(minusBtn);
      expect(handleUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 1);

      // Remove item
      const removeBtn = screen.getByRole('button', { name: /Remove Ethiopia/i });
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledWith(mockItem.id);
    });

    it('renders subscription badge when item is recurring', () => {
      const subItem: CartItem = {
        ...mockItem,
        isSubscription: true,
        subscriptionFrequency: 'biweekly',
        unitPrice: 20.25, // 10% off
      };

      render(
        <CartItemRow
          item={subItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText(/biweekly \(10% off\)/i)).toBeInTheDocument();
    });
  });
});
