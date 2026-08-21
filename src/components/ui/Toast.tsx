'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

const toastTypeStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-cream-300',
    border: 'border-olive-400',
    text: 'text-olive-700',
    icon: <CheckCircle2 className="w-5 h-5 text-olive-600 shrink-0" />,
  },
  error: {
    bg: 'bg-cream-300',
    border: 'border-terracotta-400',
    text: 'text-terracotta-800',
    icon: <AlertCircle className="w-5 h-5 text-terracotta-600 shrink-0" />,
  },
  warning: {
    bg: 'bg-cream-300',
    border: 'border-honey-400',
    text: 'text-honey-700',
    icon: <AlertTriangle className="w-5 h-5 text-honey-600 shrink-0" />,
  },
  info: {
    bg: 'bg-cream-300',
    border: 'border-charcoal-300',
    text: 'text-espresso-800',
    icon: <Info className="w-5 h-5 text-espresso-600 shrink-0" />,
  },
};

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  description,
  duration = 4500,
  onClose,
}) => {
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = toastTypeStyles[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-elevated border transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 sm:slide-in-from-top-3 max-w-md w-full',
        style.bg,
        style.border
      )}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-semibold leading-tight font-sans', style.text)}>
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-xs text-charcoal-600 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="text-charcoal-400 hover:text-espresso-900 transition-colors p-1 rounded hover:bg-cream-500 focus-ring"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={() => onDismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
};
