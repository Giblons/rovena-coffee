'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Coffee } from 'lucide-react';
import { Container } from './Container';
import { useCart } from '@/context/CartContext';

export interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
  onCartClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount: propItemCount,
  onOpenCart: propOnOpenCart,
  onCartClick: propOnCartClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let contextItemCount = 0;
  let contextOpenCart: (() => void) | undefined = undefined;

  try {
    const cart = useCart();
    if (cart) {
      contextItemCount = cart.summary.itemsCount;
      contextOpenCart = cart.openCart;
    }
  } catch {
    // Gracefully handle rendering outside CartProvider
  }

  const itemCount = propItemCount !== undefined ? propItemCount : contextItemCount;
  const handleCartClick = propOnOpenCart || propOnCartClick || contextOpenCart;
  const displayCount = itemCount > 99 ? '99+' : itemCount;

  const navLinks = [
    { href: '/catalog', label: 'Coffee Catalog' },
    { href: '/subscriptions', label: 'Coffee Subscriptions' },
    { href: '/batches', label: 'Roasting Schedule' },
    { href: '/brew-guides', label: 'Brew Guides' },
    { href: '/impact', label: 'Direct Trade Impact' },
    { href: '/admin', label: 'Roastery Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-subtle transition-colors">
      <Container size="xl">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-ring rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-full bg-espresso-900 flex items-center justify-center text-cream-400 group-hover:bg-terracotta-500 transition-colors">
              <Coffee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-espresso-950 group-hover:text-terracotta-600 transition-colors">
                LUMINA Coffee
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-terracotta-500 font-semibold">
                Artisan Coffee Roasters
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-sans font-medium text-espresso-900 hover:text-terracotta-500 transition-colors focus-ring rounded px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {/* Bag Button */}
            <button
              type="button"
              onClick={handleCartClick}
              className="relative p-2.5 rounded-full text-espresso-900 hover:bg-cream-500/80 transition-colors focus-ring"
              aria-label={`Open Shopping Cart (${itemCount} items)`}
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-terracotta-500 text-cream-200 text-xs font-mono font-bold flex items-center justify-center animate-in zoom-in">
                  {displayCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-espresso-900 hover:bg-cream-500/80 transition-colors focus-ring"
              aria-label="Open mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border-subtle bg-surface animate-in fade-in slide-in-from-top-2">
            <h3 className="px-4 text-xs font-mono uppercase tracking-wider text-charcoal-400 font-semibold mb-2">
              Roastery Menu
            </h3>
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-espresso-900 hover:bg-cream-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};
