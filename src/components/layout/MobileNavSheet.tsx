'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, MessageCircle, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PreferenceControls } from '@/components/layout/PreferenceControls';
import { Button } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/i18n';

export interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const MobileNavSheet: React.FC<MobileNavSheetProps> = ({
  isOpen,
  onClose,
  navLinks,
  t,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-espresso-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />

      <div
        className={cn(
          'absolute inset-y-0 right-0 w-full max-w-sm bg-cream-500 shadow-drawer flex flex-col',
          'animate-in slide-in-from-right duration-300 grain-overlay'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-subtle">
          <BrandLogo variant="light" size="sm" href="/" interactive />
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full text-espresso-900 hover:bg-cream-600 transition-colors focus-ring"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-subtle">
          <PreferenceControls compact />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-3">
            {t('nav.menu')}
          </p>
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block px-4 py-3.5 rounded-xl text-base font-medium text-espresso-900 hover:bg-cream-600 active:bg-cream-700 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-5 border-t border-subtle bg-surface space-y-4">
          <div className="space-y-2 text-sm text-charcoal-600">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-bronze-500 shrink-0 mt-0.5" />
              <span>{SITE.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-bronze-500 shrink-0" />
              <span>{SITE.phoneDisplay}</span>
            </p>
          </div>
          <a
            href={`https://wa.me/${SITE.phoneE164}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="whatsapp" size="lg" className="w-full" leftIcon={<MessageCircle className="w-5 h-5" />}>
              {t('cta.whatsappOrder')}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
