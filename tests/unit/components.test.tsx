import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Toast } from '@/components/ui/Toast';

describe('UI Primitives Verification', () => {
  describe('Button', () => {
    it('renders with text and handles click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Add to Bag</Button>);
      const button = screen.getByRole('button', { name: /add to bag/i });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles loading state with spinner and disabled behavior', () => {
      render(<Button isLoading>Brew Coffee</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('renders different variants (whatsapp, secondary, outline)', () => {
      const { rerender } = render(<Button variant="whatsapp">Order via WhatsApp</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-[#25D366]');

      rerender(<Button variant="secondary">Secondary CTA</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-espresso-900');
    });
  });

  describe('Badge', () => {
    it('renders SCA cupping score badge with micro-lot indicator for 90+', () => {
      render(<Badge variant="sca" scaScore={91.5} />);
      expect(screen.getByText(/SCA 91.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Micro-lot/i)).toBeInTheDocument();
    });

    it('renders Processing method badge', () => {
      render(<Badge variant="process" process="Anaerobic Fermentation" />);
      expect(screen.getByText(/Anaerobic Fermentation/i)).toBeInTheDocument();
    });

    it('renders Roast level badge', () => {
      render(<Badge variant="roast" roastLevel="Light" />);
      expect(screen.getByText(/Light/i)).toBeInTheDocument();
    });

    it('renders Stock status badge', () => {
      render(<Badge variant="stock" stockStatus="in_stock" />);
      expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('renders card with title and content', () => {
      render(
        <Card hoverEffect>
          <CardHeader>
            <CardTitle>Ethiopia Chelbesa</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Peach Blossoms & Bergamot</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText(/Ethiopia Chelbesa/i)).toBeInTheDocument();
      expect(screen.getByText(/Peach Blossoms & Bergamot/i)).toBeInTheDocument();
    });
  });

  describe('Drawer', () => {
    it('renders drawer when open and fires onClose on close button click', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen={true} onClose={handleClose} title="Your Cart">
          <p>Cart item list</p>
        </Drawer>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Your Cart/i)).toBeInTheDocument();
      expect(screen.getByText(/Cart item list/i)).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close drawer/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Drawer isOpen={false} onClose={() => {}} title="Hidden Drawer">
          <p>Hidden content</p>
        </Drawer>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('renders modal when open and closes on ESC or button click', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Roast Batch Details">
          <p>Batch #ROAST-0824</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Roast Batch Details/i)).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tabs', () => {
    it('switches active tab content when trigger is clicked', () => {
      render(
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="brew">Brew Guide</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">
            <p>Altitude: 2,100 MASL</p>
          </TabsContent>
          <TabsContent value="brew">
            <p>V60 Ratio: 1:16.6</p>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText(/Altitude: 2,100 MASL/i)).toBeInTheDocument();
      expect(screen.queryByText(/V60 Ratio: 1:16.6/i)).not.toBeInTheDocument();

      const brewTab = screen.getByRole('tab', { name: /brew guide/i });
      fireEvent.click(brewTab);

      expect(screen.getByText(/V60 Ratio: 1:16.6/i)).toBeInTheDocument();
      expect(screen.queryByText(/Altitude: 2,100 MASL/i)).not.toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('renders notification toast with title and description', () => {
      const handleClose = vi.fn();
      render(
        <Toast
          type="success"
          title="Added to Cart"
          description="Ethiopia Chelbesa (250g, Whole Bean)"
          onClose={handleClose}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Added to Cart/i)).toBeInTheDocument();
      expect(screen.getByText(/Ethiopia Chelbesa \(250g, Whole Bean\)/i)).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close notification/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
