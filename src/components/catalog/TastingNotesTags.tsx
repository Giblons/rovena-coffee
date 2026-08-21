import React from 'react';
import { cn } from '@/lib/utils';

export interface TastingNotesTagsProps {
  notes: string[];
  primaryCategory?: string;
  limit?: number;
  size?: 'sm' | 'md';
  className?: string;
  onTagClick?: (note: string) => void;
}

// Intelligent tone classification for sensory coffee notes
export function getNoteStyle(note: string, fallbackCategory?: string): string {
  const n = note.toLowerCase();

  // Floral (Lavender / Violet)
  if (
    n.includes('blossom') ||
    n.includes('jasmine') ||
    n.includes('earl grey') ||
    n.includes('chamomile') ||
    n.includes('rose') ||
    n.includes('floral') ||
    n.includes('hibiscus')
  ) {
    return 'bg-purple-100/90 text-purple-900 border-purple-200 hover:bg-purple-200/90';
  }

  // Fruity (Berry / Rosé / Tropical)
  if (
    n.includes('lychee') ||
    n.includes('dragonfruit') ||
    n.includes('strawberry') ||
    n.includes('raspberry') ||
    n.includes('blackcurrant') ||
    n.includes('plum') ||
    n.includes('fig') ||
    n.includes('cherry') ||
    n.includes('peach') ||
    n.includes('berry') ||
    n.includes('cassis') ||
    n.includes('bubblegum')
  ) {
    return 'bg-pink-100/90 text-pink-900 border-pink-200 hover:bg-pink-200/90';
  }

  // Citrus & Bright Fruit (Amber / Honey / Tangerine)
  if (
    n.includes('bergamot') ||
    n.includes('grapefruit') ||
    n.includes('orange') ||
    n.includes('lemon') ||
    n.includes('lime') ||
    n.includes('citrus') ||
    n.includes('apple') ||
    n.includes('tangerine')
  ) {
    return 'bg-amber-100/90 text-amber-900 border-amber-200 hover:bg-amber-200/90';
  }

  // Sweet & Chocolate (Cocoa / Caramel / Honey)
  if (
    n.includes('chocolate') ||
    n.includes('cocoa') ||
    n.includes('cacao') ||
    n.includes('caramel') ||
    n.includes('toffee') ||
    n.includes('molasses') ||
    n.includes('honey') ||
    n.includes('sugar') ||
    n.includes('fudge') ||
    n.includes('vanilla')
  ) {
    return 'bg-espresso-100 text-espresso-900 border-espresso-200 hover:bg-espresso-200';
  }

  // Nutty / Earthy / Spiced (Olive / Forest / Botanical)
  if (
    n.includes('almond') ||
    n.includes('hazelnut') ||
    n.includes('praline') ||
    n.includes('cedar') ||
    n.includes('nutmeg') ||
    n.includes('tobacco') ||
    n.includes('oak') ||
    n.includes('spice') ||
    n.includes('earth')
  ) {
    return 'bg-olive-100 text-olive-800 border-olive-200 hover:bg-olive-200';
  }

  // Fallback by primary category
  if (fallbackCategory) {
    const cat = fallbackCategory.toLowerCase();
    if (cat.includes('floral')) return 'bg-purple-100/90 text-purple-900 border-purple-200';
    if (cat.includes('fruit')) return 'bg-pink-100/90 text-pink-900 border-pink-200';
    if (cat.includes('citrus')) return 'bg-amber-100/90 text-amber-900 border-amber-200';
    if (cat.includes('sweet') || cat.includes('choc')) return 'bg-espresso-100 text-espresso-900 border-espresso-200';
    if (cat.includes('nut') || cat.includes('earth')) return 'bg-olive-100 text-olive-800 border-olive-200';
  }

  return 'bg-cream-700 text-espresso-900 border-cream-800 hover:bg-cream-800';
}

export const TastingNotesTags: React.FC<TastingNotesTagsProps> = ({
  notes,
  primaryCategory,
  limit,
  size = 'sm',
  className,
  onTagClick,
}) => {
  const displayedNotes = limit ? notes.slice(0, limit) : notes;
  const remainingCount = limit && notes.length > limit ? notes.length - limit : 0;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displayedNotes.map((note) => {
        const styleClass = getNoteStyle(note, primaryCategory);
        if (onTagClick) {
          return (
            <button
              key={note}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(note);
              }}
              className={cn(
                'inline-flex items-center rounded-full border transition-all cursor-pointer font-sans shadow-subtle',
                sizeClasses[size],
                styleClass
              )}
            >
              {note}
            </button>
          );
        }

        return (
          <span
            key={note}
            className={cn(
              'inline-flex items-center rounded-full border transition-colors font-sans shadow-subtle',
              sizeClasses[size],
              styleClass
            )}
          >
            {note}
          </span>
        );
      })}

      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-cream-700/80 text-espresso-700 border border-cream-800/40 text-xs px-1.5 py-0.5 font-medium'
          )}
          title={notes.slice(limit).join(', ')}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};
