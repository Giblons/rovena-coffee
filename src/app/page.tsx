'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { OrganicCurves } from '@/components/brand/OrganicCurves';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getFeaturedCoffees } from '@/lib/data/coffees';
import { usePreferences } from '@/context/PreferencesContext';
import { SITE } from '@/lib/site';
import {
  ArrowRight,
  Clock,
  MessageCircle,
  BookOpen,
  MapPin,
  Quote,
} from 'lucide-react';

export default function HomePage() {
  const { t } = usePreferences();
  const featuredCoffees = getFeaturedCoffees();

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Roast batch strip */}
      <div className="bg-espresso-900 text-cream-500 border-b border-espresso-800">
        <Container size="xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bronze-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-bronze-500" />
              </span>
              <span>{t('home.batch.title')}</span>
            </div>
            <p className="flex items-center gap-1.5 text-charcoal-300">
              <Clock className="h-3.5 w-3.5 text-bronze-400" />
              {t('home.batch.body')}
            </p>
          </div>
        </Container>
      </div>

      {/* Dark hero — espresso section with bronze logo */}
      <section className="relative bg-espresso-950 text-cream-400 overflow-hidden grain-overlay">
        <OrganicCurves position="right" className="right-0 top-0 bottom-0 w-2/5 opacity-15" />

        <Container size="xl">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-14 sm:py-20 lg:py-24 items-center">
            <ScrollReveal className="lg:col-span-7 space-y-6 sm:space-y-8">
              <p className="brand-tagline text-bronze-400">{t('home.hero.eyebrow')}</p>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] text-cream-300 text-balance">
                {t('home.hero.title')}
              </h1>

              <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed max-w-xl font-sans">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/catalog">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {t('home.hero.ctaCatalog')}
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cream-700/40 text-cream-300 hover:bg-white/5"
                    leftIcon={<BookOpen className="w-4 h-4" />}
                  >
                    {t('home.hero.ctaGuide')}
                  </Button>
                </Link>
              </div>

              <a
                href={`https://wa.me/${SITE.phoneE164}?text=${encodeURIComponent(t('whatsapp.prefill'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-bronze-300 hover:text-bronze-200 transition-colors pt-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                {SITE.phoneDisplay}
              </a>
            </ScrollReveal>

            <ScrollReveal delay={120} className="lg:col-span-5 flex justify-center lg:justify-end">
              <BrandLogo variant="dark" size="hero" href="/" interactive />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Featured coffees — light editorial */}
      <section className="py-14 sm:py-20 bg-canvas">
        <Container size="xl">
          <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-lg">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
                {t('home.featured.title')}
              </h2>
              <p className="text-sm text-charcoal-600">{t('home.featured.subtitle')}</p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t('nav.catalog')}
              </Button>
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-7">
            {featuredCoffees.map((coffee, i) => (
              <ScrollReveal key={coffee.id} delay={i * 60}>
                <CoffeeCard coffee={coffee} />
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Story section — asymmetric business-card rhythm */}
      <section className="relative bg-surface border-y border-subtle overflow-hidden">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
            <div className="relative bg-tan-300/40 py-12 px-8 sm:px-12 grain-overlay order-2 lg:order-1">
              <OrganicCurves position="left" className="inset-0 w-full opacity-50" />
              <ScrollReveal className="relative space-y-4 max-w-md">
                <div className="flex items-start gap-2 text-sm text-espresso-800">
                  <MapPin className="w-4 h-4 text-bronze-600 shrink-0 mt-0.5" />
                  <div className="text-right ml-auto">
                    {SITE.addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/business-card.png"
                  alt="Rovena business card reference"
                  className="rounded-lg shadow-card opacity-90 max-w-[280px] ml-auto hidden sm:block"
                  width={280}
                  height={158}
                />
              </ScrollReveal>
            </div>

            <ScrollReveal delay={80} className="py-12 px-8 sm:px-12 flex flex-col justify-center order-1 lg:order-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950 mb-4">
                {t('home.story.title')}
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed mb-6">
                {t('home.story.body')}
              </p>
              <Link href="/about">
                <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t('home.story.cta')}
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Brew guide teaser — dark section */}
      <section className="bg-espresso-900 text-cream-400 py-14 sm:py-18 grain-overlay">
        <Container size="xl">
          <ScrollReveal className="max-w-2xl space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream-300">
              {t('home.guide.title')}
            </h2>
            <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed">
              {t('home.guide.body')}
            </p>
            <Link href="/guide">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t('home.hero.ctaGuide')}
              </Button>
            </Link>
          </ScrollReveal>
        </Container>
      </section>

      {/* Testimonials — light, restrained */}
      <section className="py-14 sm:py-18 bg-canvas">
        <Container size="xl">
          <ScrollReveal className="mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-espresso-950">
              {t('home.testimonial.title')}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote:
                  'Kopinya segar banget — baru disangrai, aromanya langsung keluar pas dibuka. Pesan via WhatsApp juga gampang.',
                name: 'Dian P.',
                place: 'Bogor',
              },
              {
                quote:
                  'V60-nya jelas, manis alami. Langganan Gayo dan Toraja dari Rovena sudah setahun.',
                name: 'Rizal M.',
                place: 'Jakarta Selatan',
              },
              {
                quote:
                  'Finally a Bogor roastery that feels premium without being pretentious. The brew guide actually helped me dial in.',
                name: 'Sarah K.',
                place: 'Depok',
              },
            ].map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 80}>
                <blockquote className="p-6 bg-surface border border-subtle rounded-2xl space-y-4 h-full">
                  <Quote className="w-6 h-6 text-bronze-400/60" />
                  <p className="text-sm text-espresso-800 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                  <footer className="text-xs text-charcoal-500 pt-2 border-t border-subtle">
                    <span className="font-semibold text-espresso-900">{item.name}</span>
                    <span className="mx-1">·</span>
                    {item.place}
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
