import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { AboutIntro } from '@/components/about/AboutIntro';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { OrganicCurves } from '@/components/brand/OrganicCurves';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SITE } from '@/lib/site';
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-canvas py-14 sm:py-20 overflow-hidden grain-overlay">
        <OrganicCurves position="right" className="right-0 top-0 h-full w-1/3 opacity-30" />
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal className="space-y-6">
              <p className="brand-tagline text-bronze-600">Taman Yasmin, Bogor</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso-950 leading-tight">
                A Bogor roastery built on craft, not scale.
              </h1>
              <AboutIntro />
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/catalog">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Browse Coffees
                  </Button>
                </Link>
                <a href={`https://wa.me/${SITE.phoneE164}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="whatsapp" size="lg" leftIcon={<MessageCircle className="w-4 h-4" />}>
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100} className="flex justify-center">
              <BrandLogo variant="cream" size="hero" href={null} />
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Location & visit */}
      <section className="bg-surface border-y border-subtle py-14 sm:py-18">
        <Container size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ScrollReveal>
              <h2 className="font-serif text-2xl font-bold text-espresso-950 mb-4">Visit the roastery</h2>
              <div className="flex items-start gap-3 text-sm text-charcoal-600 mb-4">
                <MapPin className="w-5 h-5 text-bronze-500 shrink-0 mt-0.5" />
                <div>
                  {SITE.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                ROVENA roasts in small batches at our space in Taman Yasmin Sektor 7. Message us on WhatsApp
                before visiting — we&apos;re a working roastery, not a cafe with fixed hours.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={80} id="roast-schedule">
              <h2 className="font-serif text-2xl font-bold text-espresso-950 mb-4">Roast schedule</h2>
              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-xl bg-canvas border border-subtle">
                  <div className="flex justify-between font-semibold text-espresso-950 mb-1">
                    <span>Monday batch</span>
                    <span className="text-bronze-600 text-xs">Cutoff Sun 23:59</span>
                  </div>
                  <p className="text-xs text-charcoal-600">Single origins roasted, cupped, shipped Tuesday.</p>
                </div>
                <div className="p-4 rounded-xl bg-canvas border border-subtle">
                  <div className="flex justify-between font-semibold text-espresso-950 mb-1">
                    <span>Thursday batch</span>
                    <span className="text-bronze-600 text-xs">Cutoff Wed 23:59</span>
                  </div>
                  <p className="text-xs text-charcoal-600">Espresso blends and darker profiles, shipped Friday.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Sourcing philosophy — dark */}
      <section className="bg-espresso-950 text-cream-400 py-14 sm:py-18 grain-overlay">
        <Container size="xl">
          <ScrollReveal className="max-w-2xl space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream-300">
              Indonesian origins first, international lots with purpose
            </h2>
            <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed">
              We work with farmers and cooperatives we can name — Gayo, Toraja, Flores, and beyond. When we
              bring in Ethiopia, Colombia, or Kenya, it&apos;s because the cup earns its place, not to fill a
              generic catalog grid.
            </p>
            <ul className="space-y-2 text-sm text-cream-500">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-bronze-400 shrink-0 mt-0.5" />
                Traceable lots with harvest date and process
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-bronze-400 shrink-0 mt-0.5" />
                Roast profiles tuned per origin density
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-bronze-400 shrink-0 mt-0.5" />
                Cupped before every batch ships
              </li>
            </ul>
          </ScrollReveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-14 bg-canvas">
        <Container size="xl">
          <ScrollReveal className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-surface border border-subtle">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-bronze-500" />
              <p className="text-sm text-charcoal-600">Ready to order? WhatsApp is the fastest way in Bogor.</p>
            </div>
            <a href={`https://wa.me/${SITE.phoneE164}`} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="md" leftIcon={<MessageCircle className="w-4 h-4" />}>
                {SITE.phoneDisplay}
              </Button>
            </a>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
