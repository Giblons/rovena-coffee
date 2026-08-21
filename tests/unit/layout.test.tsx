import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Layout Components Verification', () => {
  describe('Container', () => {
    it('renders children within container with appropriate responsive constraints', () => {
      render(
        <Container size="lg">
          <div data-testid="container-child">Content</div>
        </Container>
      );
      const child = screen.getByTestId('container-child');
      expect(child).toBeInTheDocument();
      expect(child.parentElement).toHaveClass('max-w-6xl');
    });
  });

  describe('Header', () => {
    it('renders logo, navigation links, roast session banner, and cart button', () => {
      const handleOpenCart = vi.fn();
      render(<Header cartItemCount={3} onOpenCart={handleOpenCart} />);

      expect(screen.getByText(/LUMINA/i)).toBeInTheDocument();
      expect(screen.getByText(/Artisan Coffee Roasters/i)).toBeInTheDocument();
      expect(screen.getByText(/Coffee Catalog/i)).toBeInTheDocument();
      expect(screen.getByText(/Brew Guides/i)).toBeInTheDocument();
      expect(screen.getByText(/Roastery Admin/i)).toBeInTheDocument();
      expect(screen.getByText(/3/i)).toBeInTheDocument();

      const cartBtn = screen.getByRole('button', { name: /open shopping cart/i });
      fireEvent.click(cartBtn);
      expect(handleOpenCart).toHaveBeenCalledTimes(1);
    });

    it('opens mobile drawer menu when hamburger toggle is clicked', () => {
      render(<Header cartItemCount={0} />);
      const hamburger = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(hamburger);
      expect(screen.getByText(/Roastery Menu/i)).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders direct trade, SCA score, and roast-to-order ethos sections', () => {
      render(<Footer />);
      expect(screen.getByText(/Roast-to-Order Freshness/i)).toBeInTheDocument();
      expect(screen.getByText(/100% Direct-Trade Verified/i)).toBeInTheDocument();
      expect(screen.getByText(/SCA Certified 80\+ Scores/i)).toBeInTheDocument();
      expect(screen.getByText(/LUMINA ARTISAN ROASTERS/i)).toBeInTheDocument();
    });

    it('handles newsletter subscription submission', () => {
      render(<Footer />);
      const input = screen.getByPlaceholderText(/Your email address/i);
      fireEvent.change(input, { target: { value: 'barista@lumina.coffee' } });

      const form = input.closest('form');
      expect(form).not.toBeNull();
      if (form) fireEvent.submit(form);

      expect(screen.getByText(/Welcome to the Roastery Circle!/i)).toBeInTheDocument();
    });
  });
});
