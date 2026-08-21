'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 shadow-sm border border-transparent',
  secondary:
    'bg-espresso-900 text-cream-500 hover:bg-espresso-950 active:bg-black shadow-sm border border-transparent',
  outline:
    'bg-transparent text-espresso-900 border border-espresso-900/30 hover:bg-espresso-900/5 active:bg-espresso-900/10',
  ghost:
    'bg-transparent text-espresso-800 hover:bg-cream-600 active:bg-cream-700 border border-transparent',
  whatsapp:
    'bg-[#25D366] text-white hover:bg-[#1EBE5B] active:bg-[#169C4A] shadow-sm font-semibold border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm font-medium rounded-md min-h-[44px]',
  lg: 'px-6 py-3.5 text-base font-semibold rounded-lg min-h-[48px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 select-none cursor-pointer',
          'focus-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
