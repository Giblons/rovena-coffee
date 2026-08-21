'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Button } from '@/components/ui/Button';
import { Flame, ShieldCheck, HeartHandshake, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-espresso-950 text-cream-400 mt-auto border-t border-espresso-800">
      {/* Roast Ethos & Schedule Strip */}
      <div className="border-b border-espresso-800/60 bg-espresso-900/50 py-8">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-terracotta-500/10 text-terracotta-400 flex items-center justify-center shrink-0 border border-terracotta-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  Roast-to-Order Freshness
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  We batch roast every Monday & Thursday morning. Orders dispatch within 24 hours of cooling and QC testing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-olive-500/10 text-olive-400 flex items-center justify-center shrink-0 border border-olive-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  100% Direct-Trade Verified
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  We pay up to 145% above Fair Trade minimums directly to micro-lot producers and farming cooperatives.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-honey-500/10 text-honey-400 flex items-center justify-center shrink-0 border border-honey-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cream-300">
                  SCA Certified 80+ Scores
                </h4>
                <p className="text-xs text-charcoal-300 font-sans mt-1 leading-relaxed">
                  Every single-origin lot is cupped, scored, and profiled under Specialty Coffee Association standards.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 sm:py-16">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☕</span>
                <span className="font-serif text-xl font-bold tracking-tight text-cream-300">
                  LUMINA ARTISAN ROASTERS
                </span>
              </div>
              <p className="text-xs text-charcoal-300 font-sans leading-relaxed max-w-sm">
                Dedicated to the relentless pursuit of sweetness, terroir clarity, and sustainable farmer partnerships across high-altitude coffee origins.
              </p>
              <div className="flex items-center gap-2 text-xs text-charcoal-400 pt-2 font-sans">
                <MapPin className="w-4 h-4 text-terracotta-400 shrink-0" />
                <span>Micro-Roastery & Lab: 742 Artisan Way, Seattle, WA</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                Specialty Coffee
              </h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/catalog" className="hover:text-terracotta-300 transition-colors">
                    Single-Origin Micro-lots
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=signature-blend" className="hover:text-terracotta-300 transition-colors">
                    Signature Espresso Blends
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?process=Anaerobic+Fermentation" className="hover:text-terracotta-300 transition-colors">
                    Experimental Anaerobics
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?score=90" className="hover:text-terracotta-300 transition-colors">
                    Presidential Lots (SCA 90+)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Educational & Ethos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                Craft & Knowledge
              </h4>
              <ul className="space-y-2 text-xs font-sans text-charcoal-300">
                <li>
                  <Link href="/guide" className="hover:text-terracotta-300 transition-colors">
                    Interactive Brew Guide
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-terracotta-300 transition-colors">
                    Direct-Trade Transparency
                  </Link>
                </li>
                <li>
                  <Link href="/about#roast-schedule" className="hover:text-terracotta-300 transition-colors">
                    Roasting Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-terracotta-300 transition-colors flex items-center gap-1">
                    <span>Operations Admin</span>
                    <Sparkles className="w-3 h-3 text-honey-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Roaster Dispatch Newsletter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cream-300 font-sans">
                The Roaster&apos;s Dispatch
              </h4>
              <p className="text-xs text-charcoal-300 font-sans leading-relaxed">
                Receive cupping notes on new crop arrivals and exclusive micro-lot pre-releases.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-olive-500/20 text-olive-300 rounded-md text-xs font-sans border border-olive-500/30">
                  <CheckCircle2 className="w-4 h-4 text-olive-400 shrink-0" />
                  <span>Welcome to the Roastery Circle!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
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

          {/* Bottom Copyright Strip */}
          <div className="mt-12 pt-8 border-t border-espresso-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-charcoal-400 font-sans">
            <p>© {new Date().getFullYear()} Lumina Artisan Coffee Roasters. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Fresh Roast Certified</span>
              <span>•</span>
              <span>Direct Trade</span>
              <span>•</span>
              <span>Specialty Coffee Association Member</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};
