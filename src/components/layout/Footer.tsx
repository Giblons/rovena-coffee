'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Button } from '@/components/ui/Button';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';
import { Flame, ShieldCheck, HeartHandshake, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';

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
    <footer className="bg-espresso-950 text-cream-400 mt-auto border-t border-espresso-800">
      <div className="border-b border-espresso-800/60 bg-espresso-900/50 py-8">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-terracotta-500/10 text-terracotta-400 flex items-center justify-center shrink-0 border border-terracotta-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  {t('footer.freshnessTitle')}
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  {t('footer.freshnessBody')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-olive-500/10 text-olive-400 flex items-center justify-center shrink-0 border border-olive-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  {t('footer.tradeTitle')}
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  {t('footer.tradeBody')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-honey-500/10 text-honey-400 flex items-center justify-center shrink-0 border border-honey-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  {t('footer.scaTitle')}
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  {t('footer.scaBody')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="py-12 sm:py-16">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-horizontal-light.svg"
                  alt={SITE.name}
                  width={220}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-xs text-charcoal-300 font-sans leading-relaxed max-w-sm">
                {t('footer.tagline')}
              </p>
              <div className="flex items-start gap-2 text-xs text-charcoal-400 pt-2 font-sans">
                <MapPin className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span>
                  {t('footer.addressLabel')}: {SITE.address}
                </span>
              </div>
              <a
                href={`https://wa.me/${SITE.phoneE164}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-xs text-cream-400 hover:text-terracotta-300 transition-colors font-sans"
              >
                WhatsApp: {SITE.phoneDisplay}
              </a>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                {t('footer.specialty')}
              </h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/catalog" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.singleOrigin')}
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=signature-blend" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.blends')}
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?process=Anaerobic+Fermentation" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.anaerobics')}
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?score=90" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.presidential')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                {t('footer.craft')}
              </h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/guide" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.brewGuide')}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.transparency')}
                  </Link>
                </li>
                <li>
                  <Link href="/about#roast-schedule" className="hover:text-terracotta-300 transition-colors">
                    {t('footer.schedule')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-terracotta-300 transition-colors flex items-center gap-1">
                    <span>{t('footer.admin')}</span>
                    <Sparkles className="w-3 h-3 text-honey-400" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                {t('footer.dispatch')}
              </h4>
              <p className="text-xs text-charcoal-300 font-sans leading-relaxed">
                {t('footer.dispatchBody')}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-olive-500/20 text-olive-300 rounded-md text-xs font-sans border border-olive-500/30">
                  <CheckCircle2 className="w-4 h-4 text-olive-400 shrink-0" />
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
                      className="bg-espresso-900 border border-espresso-800 text-cream-300 placeholder-charcoal-400 text-xs px-3 py-2 rounded-md w-full focus-ring"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="shrink-0 px-3 bg-terracotta-500 hover:bg-terracotta-600"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-espresso-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-charcoal-400 font-sans">
            <p>
              © {new Date().getFullYear()} {SITE.name}. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-6">
              <span>{t('footer.freshRoast')}</span>
              <span>•</span>
              <span>{t('footer.directTrade')}</span>
              <span>•</span>
              <span>{t('footer.scaMember')}</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
