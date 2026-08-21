'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Container } from './Container';
import { PreferenceControls } from './PreferenceControls';
import { useCart } from '@/context/CartContext';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';

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
  const { t, theme } = usePreferences();

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
    { href: '/catalog', label: t('nav.catalog') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
    { href: '/batches', label: t('nav.batches') },
    { href: '/brew-guides', label: t('nav.brewGuides') },
    { href: '/impact', label: t('nav.impact') },
    { href: '/admin', label: t('nav.admin') },
  ];

  const logoSrc =
    theme === 'dark'
      ? '/brand/logo-horizontal-light.svg'
      : '/brand/logo-horizontal.svg';

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-subtle transition-colors">
      <Container size="xl">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-ring rounded-lg p-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={SITE.name}
              width={200}
              height={46}
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden xl:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-sans font-medium text-espresso-900 dark:text-cream-400 hover:text-terracotta-500 transition-colors focus-ring rounded px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <PreferenceControls />
            </div>

            <button
              type="button"
              onClick={handleCartClick}
              className="relative p-2.5 rounded-full text-espresso-900 dark:text-cream-400 hover:bg-cream-500/80 dark:hover:bg-espresso-800 transition-colors focus-ring"
              aria-label={t('nav.openCart', { count: itemCount })}
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-terracotta-500 text-cream-200 text-xs font-mono font-bold flex items-center justify-center animate-in zoom-in">
                  {displayCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-lg text-espresso-900 dark:text-cream-400 hover:bg-cream-500/80 dark:hover:bg-espresso-800 transition-colors focus-ring"
              aria-label={t('nav.openMenu')}
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

        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border-subtle bg-surface animate-in fade-in slide-in-from-top-2">
            <div className="px-4 mb-4 sm:hidden">
              <PreferenceControls compact />
            </div>
            <h3 className="px-4 text-xs font-mono uppercase tracking-wider text-charcoal-400 font-semibold mb-2">
              {t('nav.menu')}
            </h3>
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-espresso-900 dark:text-cream-400 hover:bg-cream-500 dark:hover:bg-espresso-800 transition-colors"
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
