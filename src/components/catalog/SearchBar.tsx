import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by bean name, origin, varietal, flavor notes (e.g. Peach, SL28)...',
  className,
  resultCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-charcoal-400 flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-24 py-2.5 sm:py-3 text-sm rounded-xl',
            'bg-surface text-espresso-950 placeholder:text-charcoal-400',
            'border border-subtle hover:border-medium',
            'focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500',
            'shadow-subtle transition-all'
          )}
          aria-label="Search coffee catalog"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {typeof resultCount === 'number' && value.trim().length > 0 && (
            <span className="text-xs font-medium text-charcoal-500 bg-cream-600 px-2 py-0.5 rounded-md">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}

          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-charcoal-400 hover:text-espresso-950 rounded-full hover:bg-cream-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
