import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { getFeaturedCoffees } from '@/lib/data/coffees';
import {
  Flame,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Coffee,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Quote,
} from 'lucide-react';

export default function HomePage() {
  const featuredCoffees = getFeaturedCoffees();

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-6 sm:py-10">
      {/* 1. Roast-to-Order Announcement Banner */}
      <section>
        <Container size="xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-espresso-900 text-cream-300 border border-espresso-800 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terracotta-500"></span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 font-medium">
                <span className="font-semibold text-white">Roast-to-Order Batch:</span>
                <span>Next batch roasting this Monday & Thursday.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-charcoal-300">
              <Clock className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Orders placed before 23:59 dispatch freshly degassed</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Hero Section */}
      <section className="relative">
        <Container size="xl">
          <div className="relative rounded-3xl bg-espresso-950 text-cream-400 p-8 sm:p-12 lg:p-20 overflow-hidden border border-espresso-800 shadow-elevated">
            {/* Ambient Background Radial Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta-500/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-honey-500/10 rounded-full blur-3xl pointer-events-none -mb-32" />

            <div className="relative z-10 max-w-3xl space-y-6 sm:space-y-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="terracotta" size="md">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Artisan Small-Batch Roastery</span>
                </Badge>
                <Badge variant="sca" scaScore={91.5} size="md" />
                <span className="text-xs font-mono text-terracotta-300 uppercase tracking-widest hidden sm:inline">
                  Direct Trade Sourced
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cream-300 leading-[1.12]">
                Sourced with Integrity. <br className="hidden sm:inline" />
                Roasted for Pure Cup Clarity.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-200 font-sans leading-relaxed max-w-2xl">
                We bridge the gap between world-class coffee producers and your morning ritual. Every micro-lot is roasted to order on vintage cast-iron drum roasters with published cupping scores, harvest elevation, and direct-trade transparency.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/catalog">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore 8 Micro-lots & Blends
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button variant="outline" size="lg" className="border-cream-600 text-cream-300 hover:bg-white/10">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Educational Coffee Guide
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-espresso-800/80 text-xs sm:text-sm text-charcoal-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SCA 85 - 91.5 Scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Warehousing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom Grind Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Farm Gate Rates</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Featured Micro-lots & Signature Blends */}
      <section>
        <Container size="xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-terracotta-600 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Curated Roastery Highlights</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-espresso-950">
                Featured Seasonal Harvests
              </h2>
              <p className="text-sm text-charcoal-600 max-w-xl">
                Small-batch lots celebrated for exceptional sweetness, complex acidity, and transparent producer provenance.
              </p>
            </div>

            <Link href="/catalog">
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Coffees
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCoffees.map((coffee) => (
              <CoffeeCard key={coffee.id} coffee={coffee} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Direct-Trade Ethos & Economic Transparency */}
      <section className="bg-surface py-16 sm:py-20 border-y border-subtle">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="olive" size="md">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Ethical Sourcing Benchmark
              </Badge>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-950 leading-tight">
                Direct-Trade Economics: Paying Above Fair Trade Standard
              </h2>

              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                We believe that sublime coffee begins with equitable compensation. By contracting directly with individual estate owners and washing station cooperatives in Ethiopia, Colombia, Costa Rica, and Kenya, we eliminate parasitic middlemen and reward meticulous agricultural practices.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-xl bg-cream-500 border border-subtle">
                  <div className="flex items-center gap-1.5 text-terracotta-600 font-bold text-2xl sm:text-3xl font-serif">
                    <TrendingUp className="w-6 h-6" />
                    <span>+145%</span>
                  </div>
                  <p className="text-xs text-charcoal-600 font-medium mt-1">
                    Average Premium Paid Above Fair Trade C-Market Minimum
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cream-500 border border-subtle">
                  <div className="text-olive-700 font-bold text-2xl sm:text-3xl font-serif">
                    100%
                  </div>
                  <p className="text-xs text-charcoal-600 font-medium mt-1">
                    Traceable Down to Farm Elevation & Harvest Season
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/about">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Read Our Full Sourcing Ethos
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ethos Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 space-y-3 bg-canvas border-subtle">
                <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="font-serif text-lg font-bold text-espresso-950">
                  Micro-Climate Terroir
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  We seek high-altitude farms (1,450 to 2,200 MASL) where steep diurnal temperature swings slow cherry maturation and concentrate dense sugars.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-canvas border-subtle">
                <div className="w-10 h-10 rounded-xl bg-olive-100 text-olive-700 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="font-serif text-lg font-bold text-espresso-950">
                  Agtron Color Calibration
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Every production batch is scanned with near-infrared spectrophotometers to ensure precise inner-to-outer bean roast consistency.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-canvas border-subtle">
                <div className="w-10 h-10 rounded-xl bg-honey-100 text-honey-700 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="font-serif text-lg font-bold text-espresso-950">
                  Daily Cupping Table QC
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Every roast is sampled blind 24 hours post-roast following rigorous SCA cupping protocols before packaging.
                </p>
              </Card>

              <Card className="p-6 space-y-3 bg-canvas border-subtle">
                <div className="w-10 h-10 rounded-xl bg-espresso-100 text-espresso-900 flex items-center justify-center font-bold">
                  04
                </div>
                <h3 className="font-serif text-lg font-bold text-espresso-950">
                  Eco-Valved Packaging
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  100% recyclable, high-barrier valve pouches that allow carbon dioxide degassing while preventing oxygen ingress.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Educational Brew Teaser */}
      <section>
        <Container size="xl">
          <div className="rounded-3xl bg-espresso-900 text-cream-300 p-8 sm:p-12 lg:p-16 border border-espresso-800 relative overflow-hidden">
            <div className="max-w-2xl space-y-6 relative z-10">
              <Badge variant="terracotta" size="md">
                <Coffee className="w-3.5 h-3.5 mr-1" />
                Knowledge Hub & Extraction Calculator
              </Badge>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-300">
                Master the Extraction: Dynamic Ratios & Brew Timers
              </h2>

              <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed">
                Whether you brew on a Hario V60, AeroPress, Chemex, or French Press, our interactive guides calculate exact water grams, grind micron distributions, and bloom phases calibrated specifically for each coffee's roast density.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/guide">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Knowledge Hub
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="outline" size="lg" className="border-espresso-700 text-cream-300 hover:bg-white/5">
                    Browse Coffees
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Customer & Sommelier Testimonials */}
      <section className="pb-8">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <Badge variant="honey" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Tasted & Calibrated
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
              What Specialty Enthusiasts Say
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600">
              From competitive baristas to morning ritual purists, here is how Lumina coffees perform in the cup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 bg-surface border-subtle">
              <Quote className="w-8 h-8 text-terracotta-400 opacity-60" />
              <p className="text-xs sm:text-sm text-espresso-900 italic leading-relaxed">
                "The Colombia El Paraiso Thermal Shock is mind-bending. The lychee compote and rose water notes burst through on a V60 like nothing I've tasted in 10 years of cupping."
              </p>
              <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-espresso-950">Julian Vance</p>
                  <p className="text-charcoal-500">Q-Grader & Roaster, Portland</p>
                </div>
                <Badge variant="sca" scaScore={91.5} size="sm" />
              </div>
            </Card>

            <Card className="p-6 space-y-4 bg-surface border-subtle">
              <Quote className="w-8 h-8 text-honey-500 opacity-60" />
              <p className="text-xs sm:text-sm text-espresso-900 italic leading-relaxed">
                "Receiving beans roasted literally 48 hours prior with degassing recommendations for espresso vs filter changed our cafe's calibration entirely. Truly unrivaled freshness."
              </p>
              <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-espresso-950">Elena Rostova</p>
                  <p className="text-charcoal-500">Head Barista, Atelier Coffee</p>
                </div>
                <Badge variant="terracotta" size="sm">
                  Verified Subscriber
                </Badge>
              </div>
            </Card>

            <Card className="p-6 space-y-4 bg-surface border-subtle">
              <Quote className="w-8 h-8 text-olive-600 opacity-60" />
              <p className="text-xs sm:text-sm text-espresso-900 italic leading-relaxed">
                "Apex House Espresso is the most balanced medium roast in our espresso machine. Golden crema, deep molasses, and zero harsh bitterness. Our household staple."
              </p>
              <div className="pt-2 border-t border-subtle flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-espresso-950">Marcus Chen</p>
                  <p className="text-charcoal-500">Home Barista, Seattle</p>
                </div>
                <Badge variant="sca" scaScore={88.0} size="sm" />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
