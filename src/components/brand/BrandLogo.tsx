'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site';

export type BrandLogoVariant = 'light' | 'dark' | 'cream' | 'compact';

const LOGO_SRC: Record<BrandLogoVariant, string> = {
  light: '/brand/logo-circular-white.png',
  dark: '/brand/logo-bronze-on-black.png',
  cream: '/brand/logo-on-cream.png',
  compact: '/brand/logo-circular-white.png',
};

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Pass null to render without a link */
  href?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14 sm:h-16 sm:w-16',
  lg: 'h-20 w-20 sm:h-24 sm:w-24',
  hero: 'h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  href = '/',
  className,
  size = 'md',
  interactive = false,
}) => {
  const linkHref = href === null ? null : href ?? '/';
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC[variant]}
      alt={SITE.name}
      width={variant === 'compact' ? 160 : 200}
      height={variant === 'compact' ? 160 : 260}
      className={cn(
        sizeClasses[size],
        'object-contain select-none',
        interactive && 'transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98]',
        className
      )}
    />
  );

  if (linkHref === null) return img;

  return (
    <Link href={linkHref} className="focus-ring rounded-full inline-flex" aria-label={`${SITE.name} — home`}>
      {img}
    </Link>
  );
};
