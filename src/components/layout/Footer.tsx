'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Button } from '@/components/ui/Button';
import { OrganicCurves } from '@/components/brand/OrganicCurves';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';
import { MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = usePreferences();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative mt-auto bg-espresso-950 text-cream-400 overflow-hidden">
      <OrganicCurves position="left" className="left-0 top-0 bottom-0 w-1/3 opacity-20" />

      {/* Business-card inspired contact strip */}
      <div className="relative border-b border-espresso-800/60">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="hidden lg:block relative bg-tan-500/20 py-10 px-8 grain-overlay">
              <OrganicCurves position="left" className="inset-0 w-full opacity-40" />
            </div>

            <div className="py-10 px-6 sm:px-8 lg:py-12 lg:pl-12 text-right space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-bronze-on-black.png"
                alt={SITE.name}
                width={140}
                height={180}
                className="h-16 w-auto ml-auto object-contain"
              />
              <div className="space-y-1 text-sm text-cream-600">
                {SITE.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <a
                href={`https://wa.me/${SITE.phoneE164}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cream-300 hover:text-bronze-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <div className="relative py-12 sm:py-14">
        <Container size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <p className="text-xs text-charcoal-400 font-sans leading-relaxed max-w-xs">
                {t('footer.tagline')}
              </p>
              <div className="flex items-start gap-2 text-xs text-charcoal-400">
                <MapPin className="w-4 h-4 text-bronze-400 shrink-0 mt-0.5" />
                <span>{SITE.address}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="brand-tagline text-cream-500">{t('footer.specialty')}</h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/catalog" className="hover:text-bronze-300 transition-colors">
                    {t('footer.singleOrigin')}
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=signature-blend" className="hover:text-bronze-300 transition-colors">
                    {t('footer.blends')}
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="hover:text-bronze-300 transition-colors">
                    {t('footer.brewGuide')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="brand-tagline text-cream-500">{t('footer.craft')}</h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/about" className="hover:text-bronze-300 transition-colors">
                    {t('footer.transparency')}
                  </Link>
                </li>
                <li>
                  <Link href="/about#roast-schedule" className="hover:text-bronze-300 transition-colors">
                    {t('footer.schedule')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-bronze-300 transition-colors">
                    {t('footer.admin')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="brand-tagline text-cream-500">{t('footer.dispatch')}</h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">{t('footer.dispatchBody')}</p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-bronze-500/10 text-bronze-200 rounded-lg text-xs border border-bronze-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('footer.welcome')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('footer.emailPlaceholder')}
                      className="bg-espresso-900 border border-espresso-800 text-cream-300 placeholder-charcoal-500 text-xs px-3 py-2 rounded-lg w-full focus-ring"
                    />
                    <Button type="submit" variant="primary" size="sm" className="shrink-0 px-3">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-espresso-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-charcoal-500">
            <p>© {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}</p>
            <p>{t('footer.location')}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
};
