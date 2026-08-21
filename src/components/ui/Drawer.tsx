'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-espresso-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full',
          side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
        )}
      >
        <div
          ref={drawerRef}
          className={cn(
            'w-screen bg-canvas shadow-drawer flex flex-col transform transition-transform duration-300 ease-out border-border-subtle',
            side === 'right'
              ? 'border-l animate-in slide-in-from-right duration-300'
              : 'border-r animate-in slide-in-from-left duration-300',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border-subtle flex items-start justify-between bg-surface">
            <div>
              {title && (
                <h2 id="drawer-title" className="font-serif text-xl font-bold text-espresso-950">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-xs text-charcoal-500 font-sans">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 -mr-1 text-charcoal-500 hover:text-espresso-950 hover:bg-cream-600 rounded-md transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-5 sm:p-6 border-t border-border-subtle bg-surface/80 backdrop-blur-xs">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
