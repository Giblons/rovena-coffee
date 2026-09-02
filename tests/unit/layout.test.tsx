import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { PreferencesProvider } from '@/context/PreferencesContext';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

function renderWithPrefs(ui: React.ReactElement) {
  return render(<PreferencesProvider>{ui}</PreferencesProvider>);
}

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
      renderWithPrefs(<Header cartItemCount={3} onOpenCart={handleOpenCart} />);

      expect(screen.getByAltText(/Rovena Coffee Roastery/i)).toBeInTheDocument();
      expect(screen.getByText(/Coffee Catalog/i)).toBeInTheDocument();
      expect(screen.getByText(/Brew Guides/i)).toBeInTheDocument();
      expect(screen.getByText(/Roastery Admin/i)).toBeInTheDocument();
      expect(screen.getByText(/3/i)).toBeInTheDocument();

      const cartBtn = screen.getByRole('button', { name: /open shopping cart/i });
      fireEvent.click(cartBtn);
      expect(handleOpenCart).toHaveBeenCalledTimes(1);
    });

    it('opens mobile drawer menu when hamburger toggle is clicked', () => {
      renderWithPrefs(<Header cartItemCount={0} />);
      const hamburger = screen.getByRole('button', { name: /open mobile menu/i });
      fireEvent.click(hamburger);
      expect(screen.getByText(/Roastery Menu/i)).toBeInTheDocument();
    });

    it('exposes theme, language, and currency controls', () => {
      renderWithPrefs(<Header cartItemCount={0} />);
      expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders roastery info, address, and brand logo', () => {
      renderWithPrefs(<Footer />);
      expect(screen.getByAltText(/Rovena Coffee Roastery/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Taman Yasmin Sektor 7, Jln\. Bambu Apus VI no\. 9, Bogor/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Bogor, West Java, Indonesia/i)).toBeInTheDocument();
    });

    it('handles newsletter subscription submission', () => {
      renderWithPrefs(<Footer />);
      const input = screen.getByPlaceholderText(/Your email address/i);
      fireEvent.change(input, { target: { value: 'barista@rovena.coffee' } });

      const form = input.closest('form');
      expect(form).not.toBeNull();
      if (form) fireEvent.submit(form);

      expect(screen.getByText(/Welcome to the Roastery Circle!/i)).toBeInTheDocument();
    });
  });
});
