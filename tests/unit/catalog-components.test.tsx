import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  CuppingScoreBadge,
  RoastLevelMeter,
  TastingNotesTags,
  FlavorRadarChart,
  SearchBar,
  CoffeeCard,
  CatalogFilters,
} from '@/components/catalog';
import { SPECIALTY_COFFEE_PRODUCTS } from '@/lib/data/coffees';
import { DEFAULT_FILTER_STATE } from '@/lib/catalog-filter';

describe('Catalog Domain Components — Unit Tests', () => {
  const sampleCoffee = SPECIALTY_COFFEE_PRODUCTS[0]; // Ethiopia Chelbesa

  describe('CuppingScoreBadge', () => {
    it('renders 90+ score with presidential micro-lot style', () => {
      render(<CuppingScoreBadge score={90.5} />);
      expect(screen.getByText(/SCA 90.5/i)).toBeInTheDocument();
      expect(screen.getByText(/90\+ Micro-lot/i)).toBeInTheDocument();
    });

    it('renders 87-89.9 score with exemplary style', () => {
      render(<CuppingScoreBadge score={88.5} />);
      expect(screen.getByText(/SCA 88.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Exemplary 87\+/i)).toBeInTheDocument();
    });

    it('renders standard specialty style for < 87.0', () => {
      render(<CuppingScoreBadge score={85.5} />);
      expect(screen.getByText(/SCA 85.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Specialty 85\+/i)).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<CuppingScoreBadge score={91.5} showLabel={false} />);
      expect(screen.getByText(/SCA 91.5/i)).toBeInTheDocument();
      expect(screen.queryByText(/90\+ Micro-lot/i)).not.toBeInTheDocument();
    });
  });

  describe('RoastLevelMeter', () => {
    it('renders 5-step roast meter with correct active indicators', () => {
      render(<RoastLevelMeter level="Light" />);
      expect(screen.getByText(/Light/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Roast Level: Light/i)).toBeInTheDocument();
    });

    it('renders Medium and Dark levels', () => {
      const { rerender } = render(<RoastLevelMeter level="Medium" />);
      expect(screen.getByText(/Medium/i)).toBeInTheDocument();

      rerender(<RoastLevelMeter level="Dark" />);
      expect(screen.getByText(/Dark/i)).toBeInTheDocument();
    });
  });

  describe('TastingNotesTags', () => {
    it('renders flavor tags and calls onTagClick when clicked', () => {
      const handleTagClick = vi.fn();
      render(
        <TastingNotesTags
          notes={['Peach Blossom', 'Bergamot', 'Wild Honey']}
          primaryCategory="Floral"
          onTagClick={handleTagClick}
        />
      );

      expect(screen.getByText(/Peach Blossom/i)).toBeInTheDocument();
      expect(screen.getByText(/Bergamot/i)).toBeInTheDocument();
      expect(screen.getByText(/Wild Honey/i)).toBeInTheDocument();

      fireEvent.click(screen.getByText(/Peach Blossom/i));
      expect(handleTagClick).toHaveBeenCalledWith('Peach Blossom');
    });

    it('truncates tags when limit is set and displays remaining count', () => {
      render(
        <TastingNotesTags
          notes={['Peach', 'Bergamot', 'Jasmine', 'Honey', 'Earl Grey']}
          limit={2}
        />
      );

      expect(screen.getByText('Peach')).toBeInTheDocument();
      expect(screen.getByText('Bergamot')).toBeInTheDocument();
      expect(screen.getByText('+3 more')).toBeInTheDocument();
    });
  });

  describe('FlavorRadarChart', () => {
    it('renders SVG radar chart with all 6 sensory attributes', () => {
      render(<FlavorRadarChart profile={sampleCoffee.flavorRadar} size={200} />);
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
      expect(screen.getByText(/Acidity/i)).toBeInTheDocument();
      expect(screen.getByText(/Sweetness/i)).toBeInTheDocument();
      expect(screen.getByText(/Body/i)).toBeInTheDocument();
      expect(screen.getByText(/Bitterness/i)).toBeInTheDocument();
      expect(screen.getByText(/Aroma/i)).toBeInTheDocument();
      expect(screen.getByText(/Finish/i)).toBeInTheDocument();
    });
  });

  describe('SearchBar', () => {
    it('renders search input and handles typing', () => {
      const handleChange = vi.fn();
      render(<SearchBar value="Chelbesa" onChange={handleChange} resultCount={1} />);

      const input = screen.getByRole('textbox', { name: /search coffee catalog/i });
      expect(input).toHaveValue('Chelbesa');
      expect(screen.getByText(/1 result/i)).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);
      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('clears input on Escape key press', () => {
      const handleChange = vi.fn();
      render(<SearchBar value="Colombia" onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('CoffeeCard', () => {
    it('renders coffee product details, price, country and view link', () => {
      render(<CoffeeCard coffee={sampleCoffee} />);
      expect(screen.getByText(sampleCoffee.name)).toBeInTheDocument();
      expect(screen.getByText(sampleCoffee.origin.country)).toBeInTheDocument();
      expect(screen.getByText(/SCA 90.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Washed/i)).toBeInTheDocument();
      expect(screen.getByText('$22.50')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^view$/i })).toHaveAttribute(
        'href',
        `/coffee/${sampleCoffee.id}`
      );
    });
  });

  describe('CatalogFilters', () => {
    it('handles filter category and roast selections and reset action', () => {
      const handleFilterChange = vi.fn();
      const handleReset = vi.fn();

      render(
        <CatalogFilters
          filters={{ ...DEFAULT_FILTER_STATE, categories: ['micro-lot'] }}
          onFilterChange={handleFilterChange}
          onResetFilters={handleReset}
          availableOrigins={['Ethiopia', 'Colombia', 'Kenya']}
          availableProcesses={['Washed', 'Natural']}
          availableRoastLevels={['Light', 'Medium', 'Dark']}
          availableCategories={['micro-lot', 'single-origin', 'signature-blend']}
          activeFilterCount={1}
        />
      );

      expect(screen.getByText(/Faceted Filters/i)).toBeInTheDocument();
      const resetBtn = screen.getByRole('button', { name: /reset all/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalledTimes(1);

      // Checkbox click for Roast Level (Light)
      const lightCheckbox = screen.getByLabelText(/Light/i);
      fireEvent.click(lightCheckbox);
      expect(handleFilterChange).toHaveBeenCalled();
    });
  });
});
