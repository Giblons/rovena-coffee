'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface ProductBreadcrumbsProps {
  coffeeName: string;
  category?: string;
  className?: string;
}

export const ProductBreadcrumbs: React.FC<ProductBreadcrumbsProps> = ({
  coffeeName,
  category,
  className = '',
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-muted ${className}`}
      data-testid="product-breadcrumbs"
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-muted/60 shrink-0" />

      <Link
        href="/catalog"
        className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded"
      >
        Coffee Catalog
      </Link>

      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted/60 shrink-0" />
          <Link
            href={`/catalog?category=${category}`}
            className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded capitalize"
          >
            {category.replace('-', ' ')}
          </Link>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 text-muted/60 shrink-0" />

      <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-none" aria-current="page">
        {coffeeName}
      </span>
    </nav>
  );
};
