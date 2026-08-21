'use client';

import React from 'react';
import { useFormatCurrency } from '@/context/PreferencesContext';

interface PriceProps {
  amount: number;
  className?: string;
}

/** Displays a USD-canonical amount in the visitor's selected currency. */
export const Price: React.FC<PriceProps> = ({ amount, className }) => {
  const formatPrice = useFormatCurrency();
  return <span className={className}>{formatPrice(amount)}</span>;
};
