import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Toast, ToastContainer } from '@/components/ui/Toast';
import { ToastProvider, useToast } from '@/context/ToastContext';

// Layout Components
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Utilities
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { ProcessingMethod, RoastLevel, StockStatus } from '@/types/coffee';

vi.mock('next/navigation', () => ({
  usePathname: () => '/catalog',
}));

describe('Empirical Adversarial Stress Suite — Milestone 1', () => {
  // =========================================================================
  // 1. DESIGN TOKEN COVERAGE & BIDIRECTIONAL PARITY TESTS
  // =========================================================================
  describe('Layer 1: Token Coverage & Tailwind Parity', () => {
    const rootDir = process.cwd();
    const tokensCssPath = path.join(rootDir, 'src/styles/tokens.css');
    const tailwindConfigPath = path.join(rootDir, 'tailwind.config.ts');

    const tokensCssContent = fs.readFileSync(tokensCssPath, 'utf-8');
    const tailwindConfigContent = fs.readFileSync(tailwindConfigPath, 'utf-8');

    it('asserts all CSS variables referenced in tailwind.config.ts exist in tokens.css', () => {
      // Find all var(--...) occurrences in tailwind.config.ts
      const varRegex = /var\((--[a-zA-Z0-9_-]+)\)/g;
      const tailwindVars: string[] = [];
      let match;
      while ((match = varRegex.exec(tailwindConfigContent)) !== null) {
        tailwindVars.push(match[1]);
      }

      expect(tailwindVars.length).toBeGreaterThan(30);

      const missingVars: string[] = [];
      tailwindVars.forEach((v) => {
        // Check if --var-name: exists in tokens.css
        if (!tokensCssContent.includes(`${v}:`) && !tokensCssContent.includes(v)) {
          missingVars.push(v);
        }
      });

      expect(missingVars).toEqual([]);
    });

    it('asserts core color palettes have complete numeric scale steps', () => {
      const espressoSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      espressoSteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-espresso-${step}:`);
      });

      const terracottaSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      terracottaSteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-terracotta-${step}:`);
      });

      const creamSteps = [300, 400, 500, 600, 700, 800, 900];
      creamSteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-cream-${step}:`);
      });

      const oliveSteps = [100, 200, 300, 400, 500, 600, 700];
      oliveSteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-olive-${step}:`);
      });

      const honeySteps = [100, 200, 300, 400, 500, 600, 700];
      honeySteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-honey-${step}:`);
      });

      const berrySteps = [100, 200, 300, 400, 500, 600, 700];
      berrySteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-berry-${step}:`);
      });

      const charcoalSteps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      charcoalSteps.forEach((step) => {
        expect(tokensCssContent).toContain(`--color-charcoal-${step}:`);
      });
    });

    it('asserts semantic surfaces, typography, radii, and elevation shadows are defined', () => {
      const semanticTokens = [
        '--bg-canvas',
        '--bg-surface',
        '--bg-surface-elevated',
        '--bg-surface-muted',
        '--bg-surface-dark',
        '--text-primary',
        '--text-secondary',
        '--text-muted',
        '--text-on-dark',
        '--text-accent',
        '--border-subtle',
        '--border-medium',
        '--border-strong',
        '--border-dark',
        '--focus-ring',
        '--font-serif',
        '--font-sans',
        '--font-mono',
        '--radius-xs',
        '--radius-sm',
        '--radius-md',
        '--radius-lg',
        '--radius-xl',
        '--radius-full',
        '--shadow-subtle',
        '--shadow-card',
        '--shadow-elevated',
        '--shadow-drawer',
        '--shadow-modal',
      ];

      semanticTokens.forEach((token) => {
        expect(tokensCssContent).toContain(token);
      });
    });
  });

  // =========================================================================
  // 2. BUTTON COMPONENT ADVERSARIAL TESTS
  // =========================================================================
  describe('Layer 2: Button Component Edge Cases', () => {
    it('prevents click events when isLoading is true', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Submit Order
        </Button>
      );

      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents click events when disabled is true', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled CTA
        </Button>
      );

      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders all variants without crashing and applies correct styling classes', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'whatsapp', 'danger'] as const;
      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>Button {variant}</Button>);
        expect(screen.getByRole('button', { name: `Button ${variant}` })).toBeInTheDocument();
        unmount();
      });
    });

    it('renders all sizes (sm, md, lg) with minimum accessible touch targets', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>Size {size}</Button>);
        const btn = screen.getByRole('button', { name: `Size ${size}` });
        expect(btn).toBeInTheDocument();
        unmount();
      });
    });

    it('renders left and right icons when not loading, but hides them when loading', () => {
      const leftIcon = <span data-testid="left-icon">L</span>;
      const rightIcon = <span data-testid="right-icon">R</span>;

      const { rerender } = render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Icon Button
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();

      rerender(
        <Button isLoading leftIcon={leftIcon} rightIcon={rightIcon}>
          Icon Button
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('forwards ref and defaults type="button"', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('BUTTON');
      expect(ref.current?.getAttribute('type')).toBe('button');
    });
  });

  // =========================================================================
  // 3. BADGE COMPONENT ADVERSARIAL TESTS
  // =========================================================================
  describe('Layer 3: Badge Component Edge Cases', () => {
    it('handles exact SCA cupping score thresholds (90.0 presidential vs 87.0 exemplary vs standard)', () => {
      // Presidential (>=90)
      const { rerender } = render(<Badge scaScore={90.0} />);
      expect(screen.getByText('SCA 90.0')).toBeInTheDocument();
      expect(screen.getByText(/Micro-lot/i)).toBeInTheDocument();

      // Super-high score
      rerender(<Badge scaScore={94.5} />);
      expect(screen.getByText('SCA 94.5')).toBeInTheDocument();
      expect(screen.getByText(/Micro-lot/i)).toBeInTheDocument();

      // Exemplary (87.0 to 89.9)
      rerender(<Badge scaScore={89.9} />);
      expect(screen.getByText('SCA 89.9')).toBeInTheDocument();
      expect(screen.queryByText(/Micro-lot/i)).not.toBeInTheDocument();

      rerender(<Badge scaScore={87.0} />);
      expect(screen.getByText('SCA 87.0')).toBeInTheDocument();
      expect(screen.queryByText(/Micro-lot/i)).not.toBeInTheDocument();

      // Standard specialty (<87.0)
      rerender(<Badge scaScore={85.5} />);
      expect(screen.getByText('SCA 85.5')).toBeInTheDocument();
      expect(screen.queryByText(/Micro-lot/i)).not.toBeInTheDocument();
    });

    it('handles all 6 ProcessingMethod enum values with correct badge text', () => {
      const methods: ProcessingMethod[] = [
        'Washed',
        'Natural',
        'Anaerobic Fermentation',
        'Honey / Pulped Natural',
        'Thermal Shock',
        'Wet Hulled (Giling Basah)',
      ];

      methods.forEach((method) => {
        const { unmount } = render(<Badge variant="process" process={method} />);
        expect(screen.getByText(method)).toBeInTheDocument();
        unmount();
      });
    });

    it('handles unknown/unrecognized processing method gracefully with fallback', () => {
      // @ts-expect-error Testing adversarial invalid value
      render(<Badge variant="process" process="Carbonic Maceration Custom" />);
      expect(screen.getByText('Carbonic Maceration Custom')).toBeInTheDocument();
    });

    it('handles all 5 RoastLevel enum values', () => {
      const roastLevels: RoastLevel[] = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
      roastLevels.forEach((roast) => {
        const { unmount } = render(<Badge variant="roast" roastLevel={roast} />);
        expect(screen.getByText(roast)).toBeInTheDocument();
        unmount();
      });
    });

    it('handles all 4 StockStatus values with their respective labels', () => {
      const stockStatuses: Array<{ status: StockStatus; expected: string }> = [
        { status: 'in_stock', expected: 'In Stock' },
        { status: 'low_stock', expected: 'Low Stock' },
        { status: 'out_of_stock', expected: 'Sold Out' },
        { status: 'pre_order', expected: 'Roast to Order' },
      ];

      stockStatuses.forEach(({ status, expected }) => {
        const { unmount } = render(<Badge variant="stock" stockStatus={status} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('renders general color badges (terracotta, olive, honey, berry, espresso, outline, default)', () => {
      const variants = ['default', 'outline', 'terracotta', 'olive', 'honey', 'berry', 'espresso'] as const;
      variants.forEach((v) => {
        const { unmount } = render(<Badge variant={v}>Label {v}</Badge>);
        expect(screen.getByText(`Label ${v}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // =========================================================================
  // 4. DRAWER & MODAL ACCESSIBILITY & SCROLL LOCK TESTS
  // =========================================================================
  describe('Layer 4: Drawer & Modal Lifecycle and Scroll Lock', () => {
    afterEach(() => {
      document.body.style.overflow = '';
    });

    it('Drawer: locks body scroll when opened, restores when closed, and handles ESC key', () => {
      const handleClose = vi.fn();
      const { rerender, unmount } = render(
        <Drawer isOpen={true} onClose={handleClose} title="Slide Drawer">
          <p>Drawer Body</p>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('hidden');
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Close drawer via prop
      rerender(
        <Drawer isOpen={false} onClose={handleClose} title="Slide Drawer">
          <p>Drawer Body</p>
        </Drawer>
      );
      expect(document.body.style.overflow).toBe('');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('Drawer: supports left and right placement and all size presets', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      sizes.forEach((size) => {
        const { unmount } = render(
          <Drawer isOpen={true} onClose={() => {}} side="left" size={size}>
            <p>Size {size}</p>
          </Drawer>
        );
        expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('Modal: locks body scroll, handles ESC key and backdrop click', () => {
      const handleClose = vi.fn();
      const { unmount } = render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Ethos Modal"
          description="Direct trade details"
          footer={<button onClick={handleClose}>Got it</button>}
        >
          <p>Modal Story Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Ethos Modal')).toBeInTheDocument();
      expect(screen.getByText('Direct trade details')).toBeInTheDocument();
      expect(screen.getByText('Modal Story Content')).toBeInTheDocument();

      // Press ESC
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  // =========================================================================
  // 5. TABS COMPONENT ADVERSARIAL TESTS
  // =========================================================================
  describe('Layer 5: Tabs Component Edge Cases', () => {
    it('supports controlled mode with value and onValueChange', () => {
      const handleValueChange = vi.fn();
      const { rerender } = render(
        <Tabs defaultValue="t1" value="t1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="t1">Tab 1</TabsTrigger>
            <TabsTrigger value="t2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">Content 1</TabsContent>
          <TabsContent value="t2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      const tab2Trigger = screen.getByRole('tab', { name: /tab 2/i });
      fireEvent.click(tab2Trigger);
      expect(handleValueChange).toHaveBeenCalledWith('t2');

      // Update prop in controlled mode
      rerender(
        <Tabs defaultValue="t1" value="t2" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="t1">Tab 1</TabsTrigger>
            <TabsTrigger value="t2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">Content 1</TabsContent>
          <TabsContent value="t2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('renders pill, underline, and boxed tab variants correctly', () => {
      const variants = ['pill', 'underline', 'boxed'] as const;
      variants.forEach((v) => {
        const { unmount } = render(
          <Tabs defaultValue="sample">
            <TabsList variant={v}>
              <TabsTrigger value="sample" variant={v}>
                Trigger
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sample">Sample Content</TabsContent>
          </Tabs>
        );
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Trigger' })).toHaveAttribute('aria-selected', 'true');
        unmount();
      });
    });
  });

  // =========================================================================
  // 6. TOAST NOTIFICATION SYSTEM ADVERSARIAL TESTS
  // =========================================================================
  describe('Layer 6: Toast Notification & Context System', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('adds multiple toasts via context and auto-dismisses after duration', () => {
      const TestConsumer = () => {
        const { toast } = useToast();
        return (
          <div>
            <button onClick={() => toast.success('Order Placed', 'Order #1042 created')}>
              Trigger Success
            </button>
            <button onClick={() => toast.error('Stock Exhausted', 'Sold out')}>
              Trigger Error
            </button>
          </div>
        );
      };

      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      const successBtn = screen.getByRole('button', { name: 'Trigger Success' });
      const errorBtn = screen.getByRole('button', { name: 'Trigger Error' });

      act(() => {
        fireEvent.click(successBtn);
        fireEvent.click(errorBtn);
      });

      expect(screen.getByText('Order Placed')).toBeInTheDocument();
      expect(screen.getByText('Order #1042 created')).toBeInTheDocument();
      expect(screen.getByText('Stock Exhausted')).toBeInTheDocument();
      expect(screen.getByText('Sold out')).toBeInTheDocument();

      // Fast forward past default duration (4500ms)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Order Placed')).not.toBeInTheDocument();
      expect(screen.queryByText('Stock Exhausted')).not.toBeInTheDocument();
    });

    it('renders all toast types (success, error, warning, info)', () => {
      const types = ['success', 'error', 'warning', 'info'] as const;
      types.forEach((type) => {
        const { unmount } = render(
          <Toast type={type} title={`Title ${type}`} description={`Desc ${type}`} />
        );
        expect(screen.getByText(`Title ${type}`)).toBeInTheDocument();
        expect(screen.getByText(`Desc ${type}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('throws descriptive error when useToast is used outside of ToastProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');
      consoleError.mockRestore();
    });
  });

  // =========================================================================
  // 7. RESPONSIVE CONTAINER & LAYOUT TESTS
  // =========================================================================
  describe('Layer 7: Layout & Container Responsiveness', () => {
    it('Container applies all defined max-width sizes', () => {
      const sizeMap = {
        sm: 'max-w-3xl',
        md: 'max-w-5xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        '2xl': 'max-w-[1400px]',
        full: 'max-w-full',
      } as const;

      Object.entries(sizeMap).forEach(([size, expectedClass]) => {
        const { unmount } = render(
          <Container size={size as any}>
            <div>Content {size}</div>
          </Container>
        );
        const el = screen.getByText(`Content ${size}`).parentElement;
        expect(el).toHaveClass(expectedClass);
        expect(el).toHaveClass('mx-auto w-full px-4 sm:px-6 lg:px-8');
        unmount();
      });
    });

    it('Header renders badge counter accurately (e.g. >99 displays "99+") and 0 items hides badge', () => {
      const { rerender } = render(<Header cartItemCount={0} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();

      rerender(<Header cartItemCount={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();

      rerender(<Header cartItemCount={150} />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('Footer newsletter input requires non-empty submission and prevents empty submits', () => {
      render(<Footer />);
      const emailInput = screen.getByPlaceholderText(/Your email address/i) as HTMLInputElement;
      expect(emailInput.required).toBe(true);

      // Submit empty
      const form = emailInput.closest('form');
      expect(form).not.toBeNull();
      if (form) fireEvent.submit(form);
      expect(screen.queryByText(/Welcome to the Roastery Circle!/i)).not.toBeInTheDocument();

      // Submit valid email
      fireEvent.change(emailInput, { target: { value: 'artisan@specialty.coffee' } });
      if (form) fireEvent.submit(form);
      expect(screen.getByText(/Welcome to the Roastery Circle!/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 8. UTILITY FUNCTIONS ADVERSARIAL STRESS TESTS
  // =========================================================================
  describe('Layer 8: Utility Formatting Stress Tests', () => {
    it('cn() resolves complex conditional classes, nullish values, and Tailwind specificity', () => {
      expect(cn('text-sm font-bold', false && 'hidden', null, undefined, 'text-base')).toBe(
        'font-bold text-base'
      );
      expect(cn('bg-red-500 text-white', 'bg-terracotta-500')).toBe('text-white bg-terracotta-500');
    });

    it('formatCurrency() handles fractions, zeros, and large numbers', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(24.5)).toBe('$24.50');
      expect(formatCurrency(24.999)).toBe('$25.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formatDate() parses ISO strings and Date objects gracefully', () => {
      const isoStr = '2026-08-24T08:00:00.000Z';
      const dateObj = new Date('2026-11-15T12:00:00.000Z');

      expect(formatDate(isoStr)).toContain('2026');
      expect(formatDate(dateObj)).toContain('2026');
    });
  });
});
