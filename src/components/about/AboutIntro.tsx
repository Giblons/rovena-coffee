'use client';

import React from 'react';
import { usePreferences } from '@/context/PreferencesContext';

export const AboutIntro: React.FC = () => {
  const { t } = usePreferences();
  return (
    <p className="text-base sm:text-lg text-charcoal-600 dark:text-charcoal-300 font-sans leading-relaxed">
      {t('about.intro')}
    </p>
  );
};
