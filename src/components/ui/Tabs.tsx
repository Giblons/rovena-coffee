'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pill' | 'underline' | 'boxed';
}

export const TabsList: React.FC<TabsListProps> = ({
  className,
  variant = 'pill',
  children,
  ...props
}) => {
  const variantStyles = {
    pill: 'bg-cream-600 p-1.5 rounded-lg inline-flex gap-1 border border-border-subtle',
    underline: 'border-b border-border-medium flex gap-6 pb-0',
    boxed: 'bg-cream-500 p-1 rounded-md inline-flex border border-border-subtle',
  }[variant];

  return (
    <div
      role="tablist"
      className={cn('flex flex-wrap items-center', variantStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: 'pill' | 'underline' | 'boxed';
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  variant = 'pill',
  className,
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  const triggerStyles = {
    pill: cn(
      'px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-150',
      isActive
        ? 'bg-surface text-espresso-950 shadow-subtle font-semibold'
        : 'text-charcoal-600 hover:text-espresso-900 hover:bg-cream-500/60'
    ),
    underline: cn(
      'pb-3 pt-1 text-sm font-medium transition-all duration-150 relative border-b-2 -mb-px',
      isActive
        ? 'border-terracotta-500 text-espresso-950 font-semibold'
        : 'border-transparent text-charcoal-500 hover:text-espresso-900 hover:border-charcoal-300'
    ),
    boxed: cn(
      'px-4 py-2 text-xs font-medium rounded transition-all duration-150',
      isActive
        ? 'bg-espresso-900 text-cream-400 font-semibold'
        : 'text-espresso-800 hover:bg-cream-600'
    ),
  }[variant];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={cn('focus-ring', triggerStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-4 focus:outline-none animate-in fade-in-50 duration-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};
