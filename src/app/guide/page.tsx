import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  BookOpen,
  Mountain,
  Droplets,
  Flame,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Thermometer,
} from 'lucide-react';

export default function GuidePage() {
  const processingMethods = [
    {
      name: 'Washed / Wet Process',
      subtitle: 'Pure Terroir & Sparkling Cup Clarity',
      tag: 'Washed',
      description:
        'The outer skin and fruit pulp are removed immediately after harvest using mechanical depulpers. The beans ferment in water tanks to dissolve remaining mucilage before being washed in mountain spring water and dried on raised beds.',
      cupProfile: 'Bright, sparkling acidity, floral aromas, crisp citrus notes, and unmatched cup cleanliness.',
      highlight: 'Ethiopia Chelbesa & Kenya Gakuyu-ini AA',
    },
    {
      name: 'Natural / Dry Process',
      subtitle: 'Intense Fruit Sweetness & Heavy Body',
      tag: 'Natural',
      description:
        'Whole coffee cherries are dried directly in the sun on raised African beds with the skin and fruit intact for 15 to 25 days. The bean absorbs sugars and fruit esters directly from the drying pulp.',
      cupProfile: 'Syrupy mouthfeel, jammy berry sweetness (blueberry, strawberry), winey notes, and low acidity.',
      highlight: 'Traditional Ethiopian & Central American Naturals',
    },
    {
      name: 'Honey / Pulped Natural',
      subtitle: 'Velvety Sweetness & Golden Preserves',
      tag: 'Honey',
      description:
        'The cherry skin is removed, but varying amounts of sugary mucilage (honey) are intentionally left coating the parchment during drying. Classified as Yellow, Red, Black, or Raisin Honey.',
      cupProfile: 'Candied stone fruit, floral chamomile, golden honey, and rounded velvety body.',
      highlight: 'Costa Rica Tarrazú Canet Mozart',
    },
    {
      name: 'Thermal Shock Fermentation',
      subtitle: 'Cutting-Edge Controlled Bioreactor Science',
      tag: 'Thermal Shock',
      description:
        'Cherries ferment in sealed anaerobic bioreactors with specific yeast inoculations. Post-fermentation, the beans receive a 40°C warm water rinse followed by an immediate 12°C cold water thermal shock to seal volatile aromatic esters.',
      cupProfile: 'Explosive aromatics: lychee compote, rose water, strawberry yogurt, and bubblegum.',
      highlight: 'Colombia El Paraiso (Diego Bermúdez)',
    },
    {
      name: 'Wet Hulled (Giling Basah)',
      subtitle: 'Sumatran Heritage & Syrupy Density',
      tag: 'Wet Hulled',
      description:
        'Unique to Indonesia, the outer parchment is mechanically removed when bean moisture is still high (~35%), rather than the standard 11%. Beans dry rapidly on sheltered beds, resulting in a distinctive deep jade hue.',
      cupProfile: 'Dark cacao, cedarwood, pipe tobacco, dried fig, warm nutmeg spice, and massive syrupy body.',
      highlight: 'Sumatra Mount Kerinci Tiger',
    },
    {
      name: 'Anaerobic Sealed Fermentation',
      subtitle: 'Oxygen-Free Micro-Environment',
      tag: 'Anaerobic',
      description:
        'Depulped or whole cherries are sealed inside airtight stainless steel tanks with one-way valves. As CO2 builds, anaerobic microbes produce unique lactic, malic, and succinic acids.',
      cupProfile: 'Complex winey fruitiness, tropical papaya, spiced rum, and creamy lactic acidity.',
      highlight: 'Experimental Micro-lots',
    },
  ];

  const elevationTiers = [
    {
      altitude: '2,000 – 2,200+ MASL',
      tier: 'Extreme Alpine Elevation (SHB / Strictly Hard Bean)',
      characteristics: 'Slowest cherry maturation due to freezing highland nights. Extremely dense bean structure.',
      flavors: 'Bergamot, Jasmine, White Peach, Sparkling Phosphoric Acidity',
      origins: 'Ethiopia Gedeo / Yirgacheffe, Colombia Cauca Highlands',
    },
    {
      altitude: '1,650 – 1,950 MASL',
      tier: 'Highland Volcanic Slopes',
      characteristics: 'Rich volcanic minerals and abundant rainfall produce balanced sugar-to-acid ratios.',
      flavors: 'Blackcurrant, Green Apple, Candied Strawberry, Citrus Zest',
      origins: 'Kenya Nyeri, Costa Rica Tarrazú, Guatemala Huehuetenango',
    },
    {
      altitude: '1,200 – 1,600 MASL',
      tier: 'Mid-Altitude Highlands',
      characteristics: 'Warmer temperatures favor rich body, heavy crema development, and chocolate sweetness.',
      flavors: 'Salted Caramel, Molasses, Roasted Hazelnut, Dark Chocolate',
      origins: 'Brazil Cerrado Mineiro, Sumatra Kerinci Slopes',
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-8 sm:py-16">
      {/* 1. Guide Hero Header */}
      <section>
        <Container size="xl">
          <div className="max-w-3xl space-y-6">
            <Badge variant="terracotta" size="md">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Specialty Coffee Knowledge Hub
            </Badge>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-espresso-950 leading-tight">
              The Science of Processing, Terroir, and Extraction.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-600 font-sans leading-relaxed">
              Explore how agricultural altitude, cherry fermentation methods, and proper resting curves shape the sensory tasting notes in your cup.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Processing Methods Deep Dive */}
      <section>
        <Container size="xl">
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-2 text-terracotta-600 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-4 h-4" />
              <span>Fermentation Science</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-espresso-950">
              Coffee Processing Methods Demystified
            </h2>
            <p className="text-sm text-charcoal-600 max-w-2xl">
              How the coffee cherry is harvested and stripped of its fruit dictates over 50% of the coffee&apos;s perceived acidity, body, and aromatic compounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processingMethods.map((method) => (
              <Card key={method.name} className="p-6 space-y-4 bg-surface border-subtle flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="olive" size="sm">
                      {method.tag}
                    </Badge>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-espresso-950">
                    {method.name}
                  </h3>
                  <p className="text-xs text-terracotta-600 font-semibold italic">
                    {method.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-subtle space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-espresso-950">Cup Profile: </span>
                    <span className="text-charcoal-600">{method.cupProfile}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-espresso-950">Our Example: </span>
                    <span className="text-terracotta-600 font-medium">{method.highlight}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. MASL Altitude Impact Chart */}
      <section className="bg-surface py-16 sm:py-20 border-y border-subtle">
        <Container size="xl">
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-2 text-olive-700 text-xs font-bold uppercase tracking-wider">
              <Mountain className="w-4 h-4" />
              <span>Elevation & Terroir Dynamics</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-espresso-950">
              Why Altitude (MASL) Dictates Cup Complexity
            </h2>
            <p className="text-sm text-charcoal-600 max-w-2xl">
              Meters Above Sea Level (MASL) determines the temperature gradient during cherry ripening. High elevation delays ripening, promoting dense sucrose accumulation and complex organic acids.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {elevationTiers.map((tier) => (
              <div
                key={tier.altitude}
                className="p-6 rounded-2xl bg-canvas border border-subtle space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-terracotta-600">
                    {tier.altitude}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-espresso-950">
                    {tier.tier}
                  </h3>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {tier.characteristics}
                  </p>
                </div>

                <div className="pt-3 border-t border-subtle space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-espresso-950">Sensory Markers: </span>
                    <span className="text-charcoal-600">{tier.flavors}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-espresso-950">Regions: </span>
                    <span className="text-charcoal-500">{tier.origins}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Degassing & Resting Guide */}
      <section>
        <Container size="xl">
          <div className="rounded-3xl bg-espresso-950 text-cream-300 p-8 sm:p-12 lg:p-16 border border-espresso-800 space-y-8">
            <div className="max-w-2xl space-y-4">
              <Badge variant="terracotta" size="md">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Degassing Matrix
              </Badge>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-cream-300">
                Freshness vs. Degassing: When to Brew Your Coffee
              </h2>
              <p className="text-sm text-charcoal-300 leading-relaxed">
                Coffee beans produce immense carbon dioxide ($CO_2$) during the roast. Brewing too early can cause bubbly channel disruption in espresso or sour, hollow extractions in pour-over.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-espresso-900 border border-espresso-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-cream-300">
                    Filter / Pour-Over (V60, Chemex)
                  </h3>
                  <span className="text-sm font-mono font-bold text-terracotta-400">
                    5 – 8 Days Rest
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
                  Allows enough $CO_2$ to release so that blooming water can fully penetrate cell walls without violent bubbling, revealing delicate jasmine and peach aromatics.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-espresso-900 border border-espresso-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-cream-300">
                    Espresso Machine (9-Bar Extraction)
                  </h3>
                  <span className="text-sm font-mono font-bold text-honey-400">
                    10 – 14 Days Rest
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
                  Under 9 bars of pressure, excess gas creates foamy, unstable crema and harsh carbonic bitterness. Resting 10-14 days yields thick, syrupy tiger-stripe crema and velvety caramel.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-espresso-800">
              <p className="text-xs text-charcoal-400">
                All Rovena coffee bags feature one-way degassing valves and roast dates stamped on the back seam.
              </p>
              <Link href="/catalog">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Our Current Roasts
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
