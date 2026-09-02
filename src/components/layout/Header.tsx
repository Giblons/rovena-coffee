'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, MessageCircle } from 'lucide-react';
import { Container } from './Container';
import { PreferenceControls } from './PreferenceControls';
import { MobileNavSheet } from './MobileNavSheet';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useCart } from '@/context/CartContext';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const itemCount = propItemCount !== undefined ? propItemCount : contextItemCount;
  const handleCartClick = propOnOpenCart || propOnCartClick || contextOpenCart;
  const displayCount = itemCount > 99 ? '99+' : itemCount;

  const navLinks = [
    { href: '/catalog', label: t('nav.catalog') },
    { href: '/guide', label: t('nav.brewGuides') },
    { href: '/about', label: t('nav.about') },
    { href: '/admin', label: t('nav.admin') },
  ];

  const logoVariant = theme === 'dark' ? 'dark' : 'light';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-surface/95 backdrop-blur-md border-b border-subtle shadow-subtle'
            : 'bg-canvas/80 backdrop-blur-sm border-b border-transparent'
        )}
      >
        <Container size="xl">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              scrolled ? 'header-dense' : 'header-default'
            )}
          >
            <BrandLogo variant={logoVariant} size={scrolled ? 'sm' : 'md'} interactive />

            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-sans font-medium text-espresso-800 dark:text-cream-400 hover:text-bronze-600 px-3 py-2 rounded-lg transition-colors focus-ring"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href={`https://wa.me/${SITE.phoneE164}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full bg-bronze-500/10 text-bronze-700 hover:bg-bronze-500/20 transition-colors focus-ring"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden lg:inline">{t('cta.whatsappShort')}</span>
              </a>

              <div className="hidden sm:block">
                <PreferenceControls />
              </div>

              <button
                type="button"
                onClick={handleCartClick}
                className="relative p-2.5 rounded-full text-espresso-900 dark:text-cream-400 hover:bg-cream-600 dark:hover:bg-espresso-800 transition-colors focus-ring"
                aria-label={t('nav.openCart', { count: itemCount })}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-bronze-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {displayCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden p-2.5 rounded-lg text-espresso-900 dark:text-cream-400 hover:bg-cream-600 transition-colors focus-ring"
                aria-label={t('nav.openMenu')}
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileNavSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
        t={t}
      />
    </>
  );
};
