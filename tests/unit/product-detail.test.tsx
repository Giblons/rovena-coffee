import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import { VariantSelector } from '@/components/product/VariantSelector';
import { StockStatusIndicator } from '@/components/product/StockStatusIndicator';
import { BrewGuideCalculator } from '@/components/product/BrewGuideCalculator';
import { BrewTimer } from '@/components/product/BrewTimer';
import { AgronomySpecsCard } from '@/components/product/AgronomySpecsCard';
import { FlavorRadarChart } from '@/components/product/FlavorRadarChart';
import { ProductBreadcrumbs } from '@/components/product/ProductBreadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { CrossSellCarousel } from '@/components/product/CrossSellCarousel';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { BREW_METHODS } from '@/lib/brew-calculator';

const mockCoffee = SPECIALTY_COFFEE_PRODUCTS[0]; // Ethiopia Chelbesa

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ToastProvider>
      <CartProvider>{ui}</CartProvider>
    </ToastProvider>
  );
};

describe('Milestone 3: Product Detail & Brew Guide Components Verification', () => {
  describe('VariantSelector Component', () => {
    it('renders all 4 package weight tiers (200g, 250g, 500g, 1kg) and dynamic prices', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      expect(screen.getByText('200g')).toBeInTheDocument();
      expect(screen.getByText('250g')).toBeInTheDocument();
      expect(screen.getByText('500g')).toBeInTheDocument();
      expect(screen.getByText('1kg')).toBeInTheDocument();

      // Base 250g price $22.50
      expect(screen.getAllByText(/\$22\.50/i).length).toBeGreaterThan(0);
    });

    it('switches package weight and updates price per gram and selected total', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      const btn500g = screen.getByText('500g').closest('button')!;
      fireEvent.click(btn500g);

      expect(btn500g).toHaveAttribute('aria-checked', 'true');
      // 500g price = $22.50 * 1.88 = $42.30
      expect(screen.getAllByText(/\$42\.30/i).length).toBeGreaterThan(0);
    });

    it('renders all 6 grind options with particle size labels', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      expect(screen.getByText('Whole Bean')).toBeInTheDocument();
      expect(screen.getByText('Espresso')).toBeInTheDocument();
      expect(screen.getByText('Pour Over / V60')).toBeInTheDocument();
      expect(screen.getByText('AeroPress')).toBeInTheDocument();
      expect(screen.getByText('French Press')).toBeInTheDocument();
      expect(screen.getByText('Cold Brew')).toBeInTheDocument();
    });

    it('toggles subscription mode and applies 10% discount badge and frequency choices', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      const subscribeBtn = screen.getByText(/Subscribe & Save/i).closest('button')!;
      fireEvent.click(subscribeBtn);

      // Subscription badge & 10% discount
      expect(screen.getByText(/10% Off Subscribed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Weekly$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Bi-Weekly$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Monthly$/i })).toBeInTheDocument();

      // Discounted 250g price = $22.50 * 0.90 = $20.25
      expect(screen.getAllByText(/\$20\.25/i).length).toBeGreaterThan(0);
    });

    it('increments and decrements quantity stepper', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      const plusBtn = screen.getByRole('button', { name: /increase quantity/i });
      const minusBtn = screen.getByRole('button', { name: /decrease quantity/i });

      expect(minusBtn).toBeDisabled(); // Qty 1 cannot decrease

      fireEvent.click(plusBtn);
      expect(screen.getByText('2')).toBeInTheDocument();

      // Price for 2x $22.50 = $45.00
      expect(screen.getByRole('button', { name: /add to bag • \$45\.00/i })).toBeInTheDocument();

      fireEvent.click(minusBtn);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles Add to Cart click and triggers toast', () => {
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      const addBtn = screen.getByRole('button', { name: /add to bag/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Added to Cart/i)).toBeInTheDocument();
    });

    it('opens WhatsApp direct order URL when Order via WhatsApp is clicked', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderWithProviders(<VariantSelector coffee={mockCoffee} />);

      const waBtn = screen.getByRole('button', { name: /order via whatsapp/i });
      fireEvent.click(waBtn);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://wa.me/');
      expect(calledUrl).toContain('Ethiopia%20Yirgacheffe%20Chelbesa');
      windowOpenSpy.mockRestore();
    });
  });

  describe('StockStatusIndicator Component', () => {
    it('renders stock status and remaining kilograms', () => {
      render(
        <StockStatusIndicator
          stockStatus="in_stock"
          stockQuantityKg={45}
          roastScheduleDays={['Monday', 'Thursday']}
        />
      );

      expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
      expect(screen.getByText(/45 kg green stock/i)).toBeInTheDocument();
      expect(screen.getByText(/Roasting/i)).toBeInTheDocument();
    });

    it('renders low stock warning when inventory is low', () => {
      render(
        <StockStatusIndicator
          stockStatus="low_stock"
          stockQuantityKg={8}
          roastScheduleDays={['Monday']}
        />
      );

      expect(screen.getByText(/Low Stock/i)).toBeInTheDocument();
      expect(screen.getByText(/8 kg green stock/i)).toBeInTheDocument();
    });
  });

  describe('BrewGuideCalculator Component', () => {
    it('renders default brew method (V60) and computes initial water and bloom targets', () => {
      render(<BrewGuideCalculator coffee={mockCoffee} />);

      expect(screen.getAllByText(/Hario V60 Pour Over/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Total Water/i)).toBeInTheDocument();
      expect(screen.getAllByText(/240g/i).length).toBeGreaterThan(0); // 15g * 16 = 240g
      expect(screen.getByText(/Bloom Dose/i)).toBeInTheDocument();
      expect(screen.getAllByText(/45g/i).length).toBeGreaterThan(0); // 15g * 3 = 45g
    });

    it('switches brew method to AeroPress and updates ratio and extraction stats', () => {
      render(<BrewGuideCalculator coffee={mockCoffee} />);

      const aeroTab = screen.getByRole('tab', { name: /AeroPress/i });
      fireEvent.click(aeroTab);

      expect(screen.getAllByText(/AeroPress \(Inverted Method\)/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/88°C/i)).toBeInTheDocument(); // AeroPress uses 88°C
    });

    it('adjusts dose slider and recalculates water requirement dynamically', () => {
      render(<BrewGuideCalculator coffee={mockCoffee} />);

      const doseSlider = screen.getByLabelText(/Coffee Dose in grams/i);
      fireEvent.change(doseSlider, { target: { value: '20' } });

      // 20g dose on 1:16 ratio -> 320g water, 60g bloom
      expect(screen.getAllByText(/320g/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/60g/i).length).toBeGreaterThan(0);
    });
  });

  describe('BrewTimer Component', () => {
    it('renders countdown clock, progress circle, and step list', () => {
      render(
        <BrewTimer
          template={BREW_METHODS.v60}
          totalWaterGrams={240}
          coffeeDoseGrams={15}
        />
      );

      expect(screen.getByText(/Interactive Extraction Timer/i)).toBeInTheDocument();
      expect(screen.getAllByText(/0:00/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/of 3:00/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Brew/i })).toBeInTheDocument();
    });

    it('toggles audio sound button state', () => {
      render(
        <BrewTimer
          template={BREW_METHODS.v60}
          totalWaterGrams={240}
          coffeeDoseGrams={15}
        />
      );

      const muteBtn = screen.getByRole('button', { name: /mute audio timer/i });
      expect(muteBtn).toBeInTheDocument();
      fireEvent.click(muteBtn);

      expect(screen.getByRole('button', { name: /enable audio timer/i })).toBeInTheDocument();
    });
  });

  describe('AgronomySpecsCard Component', () => {
    it('displays terroir, altitude gauge, varietals, and direct-trade economics', () => {
      render(<AgronomySpecsCard coffee={mockCoffee} />);

      expect(screen.getByText(/Gedeo Zone, Gedeb Woreda, Ethiopia/i)).toBeInTheDocument();
      expect(screen.getByText(/2,000 – 2,200/i)).toBeInTheDocument();
      expect(screen.getAllByText(/MASL/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Heirloom 74110/i)).toBeInTheDocument();
      expect(screen.getByText(/Direct-Trade Economics & Transparency/i)).toBeInTheDocument();
    });
  });

  describe('FlavorRadarChart Component', () => {
    it('renders SVG radar chart with all 6 sensory attributes', () => {
      render(<FlavorRadarChart profile={mockCoffee.flavorRadar} />);

      expect(screen.getByTestId('flavor-radar-chart')).toBeInTheDocument();
      expect(screen.getByText(/Acidity \(4.8\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Sweetness \(4.5\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Aroma \(5\)/i)).toBeInTheDocument();
    });
  });

  describe('ProductBreadcrumbs & CrossSellCarousel', () => {
    it('ProductBreadcrumbs renders navigation links', () => {
      render(<ProductBreadcrumbs coffeeName={mockCoffee.name} category={mockCoffee.category} />);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /coffee catalog/i })).toBeInTheDocument();
      expect(screen.getByText(mockCoffee.name)).toBeInTheDocument();
    });

    it('CrossSellCarousel renders complementary coffees', () => {
      render(
        <CrossSellCarousel
          currentCoffeeId={mockCoffee.id}
          allCoffees={SPECIALTY_COFFEE_PRODUCTS}
        />
      );

      expect(screen.getByText(/You May Also Like/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Colombia El Paraiso Thermal Shock/i).length).toBeGreaterThan(0);
    });
  });
});
