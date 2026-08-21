import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Flame,
  ShieldCheck,
  Globe,
  Mountain,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  TrendingUp,
  Scale,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-8 sm:py-16">
      {/* 1. Hero / Heritage Header */}
      <section>
        <Container size="xl">
          <div className="max-w-3xl space-y-6">
            <Badge variant="terracotta" size="md">
              <Flame className="w-3.5 h-3.5 mr-1" />
              Our Roastery Ethos & Provenance
            </Badge>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-espresso-950 leading-tight">
              Honoring the Soil, the Producer, and the Flame.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-600 font-sans leading-relaxed">
              Lumina Artisan Coffee Roasters was founded on an uncompromising conviction: specialty coffee is not an industrial commodity. It is a seasonal agricultural art shaped by volcanic soil, high-altitude microclimates, multi-generational farming expertise, and precision roasting.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Direct-Trade Economics: The +145% Benchmark */}
      <section className="bg-surface py-16 sm:py-20 border-y border-subtle">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="olive" size="md">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Economic Transparency
              </Badge>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-espresso-950">
                Direct-Trade Economics: Why We Pay Above Fair Trade
              </h2>

              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                The global coffee C-market fluctuates wildly based on financial speculation, often forcing farmers to sell beans below their actual production cost. We bypass multinational commodity exchanges completely.
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-espresso-900">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas border border-subtle">
                  <TrendingUp className="w-5 h-5 text-terracotta-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-espresso-950">
                      +145% Average Premium Above C-Market Base
                    </span>
                    <span className="text-charcoal-600">
                      We pay direct farm-gate and FOB export prices that allow partner estates to invest in clean water infrastructure, organic compost fertilization, and living wages for seasonal pickers.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas border border-subtle">
                  <Globe className="w-5 h-5 text-olive-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-espresso-950">
                      Multi-Year Partnership Commitments
                    </span>
                    <span className="text-charcoal-600">
                      We commit to buying upcoming harvest yields years in advance, providing financial predictability so farmers can experiment with high-risk anaerobic and thermal-shock fermentations.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Trade Sourcing Stats Graphic */}
            <div className="p-8 rounded-3xl bg-espresso-950 text-cream-300 border border-espresso-800 space-y-6 shadow-elevated">
              <h3 className="font-serif text-2xl font-bold text-cream-300">
                2026 Direct Trade Transparency Ledger
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-espresso-900 border border-espresso-800">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-terracotta-400">
                    $4.85 / lb
                  </span>
                  <p className="text-xs text-charcoal-300 mt-1">Average FOB Price Paid</p>
                </div>

                <div className="p-4 rounded-xl bg-espresso-900 border border-espresso-800">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-honey-400">
                    89.1 SCA
                  </span>
                  <p className="text-xs text-charcoal-300 mt-1">Average Catalog Cupping Score</p>
                </div>

                <div className="p-4 rounded-xl bg-espresso-900 border border-espresso-800">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-olive-400">
                    100%
                  </span>
                  <p className="text-xs text-charcoal-300 mt-1">Single-Origin Traceability</p>
                </div>

                <div className="p-4 rounded-xl bg-espresso-900 border border-espresso-800">
                  <span className="text-2xl sm:text-3xl font-bold font-serif text-cream-300">
                    48 Hours
                  </span>
                  <p className="text-xs text-charcoal-300 mt-1">Roast-to-Dispatch Window</p>
                </div>
              </div>

              <p className="text-xs text-charcoal-400 font-mono italic">
                *Audited annually. Full FOB contract disclosures available on request for coffee educators and wholesale partners.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Producer Partnerships Spotlight */}
      <section>
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="terracotta" size="sm">
              <Users className="w-3.5 h-3.5 mr-1" />
              The Growers Behind the Cup
            </Badge>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-espresso-950">
              Our Long-Term Producer Partners
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600">
              We work with visionary agronomists, family-run micro-mills, and democratic cooperatives across the coffee belt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 space-y-3 bg-surface border-subtle">
              <span className="text-2xl">🇨🇴</span>
              <h3 className="font-serif text-lg font-bold text-espresso-950">
                Diego Bermúdez
              </h3>
              <p className="text-xs text-terracotta-600 font-mono">Finca El Paraiso, Colombia</p>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Pioneering bioreactor fermentation and thermal-shock washing to synthesize explosive lychee and floral ester aromatics.
              </p>
              <Badge variant="sca" scaScore={91.5} size="sm" />
            </Card>

            <Card className="p-6 space-y-3 bg-surface border-subtle">
              <span className="text-2xl">🇪🇹</span>
              <h3 className="font-serif text-lg font-bold text-espresso-950">
                Danbi Uddo Station
              </h3>
              <p className="text-xs text-terracotta-600 font-mono">Chelbesa Village, Ethiopia</p>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Over 400 smallholder families cultivating indigenous heirloom landraces in dense shade at 2,100 meters elevation.
              </p>
              <Badge variant="sca" scaScore={90.5} size="sm" />
            </Card>

            <Card className="p-6 space-y-3 bg-surface border-subtle">
              <span className="text-2xl">🇰🇪</span>
              <h3 className="font-serif text-lg font-bold text-espresso-950">
                Thirikwa Cooperative
              </h3>
              <p className="text-xs text-terracotta-600 font-mono">Gakuyu-ini, Nyeri, Kenya</p>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Double-washed SL28 and SL34 varietals grown in deep phosphorus-rich volcanic soil on the foot of Mount Kenya.
              </p>
              <Badge variant="sca" scaScore={89.5} size="sm" />
            </Card>

            <Card className="p-6 space-y-3 bg-surface border-subtle">
              <span className="text-2xl">🇨🇷</span>
              <h3 className="font-serif text-lg font-bold text-espresso-950">
                Fidel Chinchilla
              </h3>
              <p className="text-xs text-terracotta-600 font-mono">Canet Micro-Mill, Costa Rica</p>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Creators of the Musician Series raisin honey process, leaving 100% mucilage intact for candied strawberry sweetness.
              </p>
              <Badge variant="sca" scaScore={89.0} size="sm" />
            </Card>
          </div>
        </Container>
      </section>

      {/* 4. Terroir & Roasting Philosophy */}
      <section className="bg-surface py-16 sm:py-20 border-t border-subtle">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="honey" size="md">
                <Mountain className="w-3.5 h-3.5 mr-1" />
                Terroir & Roastery Craft
              </Badge>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-950 leading-tight">
                Cast-Iron Drum Roasting & Spectrophotometer Calibration
              </h2>

              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                Our roasting philosophy revolves around transparency to terroir. Rather than masking the bean with smoky dark roast notes, our convection-conduction roast curves are tailored to each lot&apos;s specific density and moisture content.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-espresso-900">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Agtron Color Consistency:</strong> Every batch is color-analyzed to ensure uniform development without scorched bean tips.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rate of Rise (RoR) Precision:</strong> Continuously declining RoR prevents baking or internal starch scorching.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Roast Schedule:</strong> Roasted only on Mondays and Thursdays, ensuring that your package arrives right at the peak degassing window.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/catalog">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Taste Our Fresh Harvests
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-cream-500 border border-subtle space-y-6">
              <h3 className="font-serif text-2xl font-bold text-espresso-950">
                Weekly Roastery Schedule
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-espresso-900">
                <div className="p-4 rounded-xl bg-surface border border-subtle">
                  <div className="flex items-center justify-between font-bold text-espresso-950 pb-1">
                    <span>Monday Batch Roast</span>
                    <span className="text-terracotta-600">Cutoff: Sunday 23:59</span>
                  </div>
                  <p className="text-charcoal-600 text-xs">
                    Single-origin micro-lots (Ethiopia, Colombia, Kenya) roasted, quality-cupped, and dispatched Tuesday morning.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-subtle">
                  <div className="flex items-center justify-between font-bold text-espresso-950 pb-1">
                    <span>Thursday Batch Roast</span>
                    <span className="text-terracotta-600">Cutoff: Wednesday 23:59</span>
                  </div>
                  <p className="text-charcoal-600 text-xs">
                    Espresso blends and dark roasts (Apex House, Velvet Midnight) roasted, rested, and dispatched Friday morning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
