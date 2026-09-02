'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';

export const WhatsAppBar: React.FC = () => {
  const { t } = usePreferences();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden pointer-events-none">
      <div className="pointer-events-auto mx-3 mb-3 safe-area-pb">
        <a
          href={`https://wa.me/${SITE.phoneE164}?text=${encodeURIComponent(t('whatsapp.prefill'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm shadow-elevated active:scale-[0.98] transition-transform"
          aria-label={t('cta.whatsappOrder')}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('cta.whatsappOrder')}</span>
        </a>
      </div>
    </div>
  );
};
