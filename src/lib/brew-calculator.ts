import { BrewMethod } from '@/types/coffee';
import { BrewGuideTemplate, BrewYieldCalculation } from '@/types/brew';

export const BREW_METHODS: Record<BrewMethod, BrewGuideTemplate> = {
  v60: {
    brewMethod: 'v60',
    name: 'Hario V60 Pour Over',
    iconName: 'v60-cone',
    defaultRatio: 16.0,
    recommendedRatioRange: { min: 14.5, max: 17.5 },
    defaultDoseGrams: 15,
    grindSizeLabel: 'Medium-Fine',
    grindMicrons: '450 – 600 µm',
    waterTempCelsius: 94,
    waterTempFahrenheit: 201,
    totalTimeSeconds: 180,
    equipmentNeeded: ['Hario V60 Dripper', 'Paper Filter (Rinsed)', 'Gooseneck Kettle', 'Digital Scale with Timer'],
    overview: 'Produces exceptional cup clarity and highlights nuanced floral and fruity aromatics through gentle continuous extraction.',
    steps: [
      {
        stepNumber: 1,
        title: 'Bloom & Degas',
        timeStartSeconds: 0,
        timeEndSeconds: 45,
        targetWaterGrams: 45,
        actionDescription: 'Pour 45g of water in spirals starting from the center outward. Swirl gently for 5 seconds to ensure 100% saturation.',
        techniqueTip: 'Releases trapped CO2 gas to prevent channeling during main pours.',
      },
      {
        stepNumber: 2,
        title: 'First Pour (Body & Sweetness)',
        timeStartSeconds: 45,
        timeEndSeconds: 75,
        targetWaterGrams: 150,
        actionDescription: 'Pour in steady concentric circles up to 150g total. Keep flow rate gentle and steady (~4g/sec).',
        techniqueTip: 'Maintains slurry temperature for optimal sugar dissolution.',
      },
      {
        stepNumber: 3,
        title: 'Second Pour (Clarity & Balance)',
        timeStartSeconds: 75,
        timeEndSeconds: 110,
        targetWaterGrams: 240,
        actionDescription: 'Pour up to your final target of 240g. Give one gentle swirl with a spoon or carafe.',
        techniqueTip: 'Levels the bed to promote uniform drawdown across the conical filter.',
      },
      {
        stepNumber: 4,
        title: 'Drawdown & Serve',
        timeStartSeconds: 110,
        timeEndSeconds: 180,
        targetWaterGrams: 240,
        actionDescription: 'Allow water to completely drain through the coffee bed. The finished bed should be flat and muddy.',
        techniqueTip: 'Swirl carafe to oxygenate before serving in pre-warmed ceramic cups.',
      },
    ],
  },

  aeropress: {
    brewMethod: 'aeropress',
    name: 'AeroPress (Inverted Method)',
    iconName: 'aeropress-plunger',
    defaultRatio: 13.0,
    recommendedRatioRange: { min: 11.0, max: 15.0 },
    defaultDoseGrams: 18,
    grindSizeLabel: 'Medium',
    grindMicrons: '350 – 500 µm',
    waterTempCelsius: 88,
    waterTempFahrenheit: 190,
    totalTimeSeconds: 120,
    equipmentNeeded: ['AeroPress', 'Paper Filter', 'Kettle', 'Stirrer', 'Mug'],
    overview: 'Full immersion brewing combined with light pressure creates intense sweetness and a juicy, clean mouthfeel.',
    steps: [
      {
        stepNumber: 1,
        title: 'Invert & Add Grounds',
        timeStartSeconds: 0,
        timeEndSeconds: 10,
        targetWaterGrams: 0,
        actionDescription: 'Set AeroPress in inverted position with plunger pushed to the #4 mark. Add coffee grounds.',
      },
      {
        stepNumber: 2,
        title: 'Infuse & Stir',
        timeStartSeconds: 10,
        timeEndSeconds: 40,
        targetWaterGrams: 234,
        actionDescription: 'Pour all water in 15 seconds. Stir vigorously back and forth 5 times.',
        techniqueTip: 'Quick turbulence breaks surface tension for even immersion.',
      },
      {
        stepNumber: 3,
        title: 'Cap & Steep',
        timeStartSeconds: 40,
        timeEndSeconds: 90,
        targetWaterGrams: 234,
        actionDescription: 'Rinse paper filter in cap, screw tightly onto cylinder, and allow to steep until 1:30.',
      },
      {
        stepNumber: 4,
        title: 'Flip & Gentle Press',
        timeStartSeconds: 90,
        timeEndSeconds: 120,
        targetWaterGrams: 234,
        actionDescription: 'Carefully invert onto your mug and plunge gently with steady downward pressure for 30 seconds until hissing starts.',
        techniqueTip: 'Stop pressing as soon as the air hisses to avoid bitter astringency.',
      },
    ],
  },

  french_press: {
    brewMethod: 'french_press',
    name: 'French Press (Immersion)',
    iconName: 'french-press',
    defaultRatio: 15.0,
    recommendedRatioRange: { min: 13.0, max: 16.0 },
    defaultDoseGrams: 30,
    grindSizeLabel: 'Coarse',
    grindMicrons: '850 – 1000 µm',
    waterTempCelsius: 95,
    waterTempFahrenheit: 203,
    totalTimeSeconds: 360,
    equipmentNeeded: ['French Press (8-cup)', 'Two Spoons', 'Digital Scale', 'Kettle'],
    overview: 'Unfiltered stainless mesh immersion retaining natural coffee diterpene oils for maximum body and depth.',
    steps: [
      {
        stepNumber: 1,
        title: 'Pour & Initial Steep',
        timeStartSeconds: 0,
        timeEndSeconds: 240,
        targetWaterGrams: 450,
        actionDescription: 'Pour all hot water over coarse grounds. Do not stir yet. Let sit uncovered for 4 minutes.',
      },
      {
        stepNumber: 2,
        title: 'Break Crust & Scoop Foam',
        timeStartSeconds: 240,
        timeEndSeconds: 300,
        targetWaterGrams: 450,
        actionDescription: 'Gently stir surface crust with a spoon so grounds sink. Scoop off floating white foam and chaff.',
        techniqueTip: 'Removes bitter oils and prevents grounds from getting stirred up.',
      },
      {
        stepNumber: 3,
        title: 'Settle & Decant',
        timeStartSeconds: 300,
        timeEndSeconds: 360,
        targetWaterGrams: 450,
        actionDescription: 'Insert plunger just beneath liquid surface (do not push to bottom). Gently decant clear brew into cup.',
      },
    ],
  },

  espresso: {
    brewMethod: 'espresso',
    name: 'Espresso (9-Bar Extraction)',
    iconName: 'espresso-portafilter',
    defaultRatio: 2.0,
    recommendedRatioRange: { min: 1.8, max: 2.5 },
    defaultDoseGrams: 18,
    grindSizeLabel: 'Fine',
    grindMicrons: '200 – 300 µm',
    waterTempCelsius: 93,
    waterTempFahrenheit: 200,
    totalTimeSeconds: 30,
    equipmentNeeded: ['Espresso Machine', 'Precision Basket', 'WDT Tool', 'Tamper', 'Scale'],
    overview: 'High-pressure 9-bar extraction producing dense crema, intense aromatics, and rich syrupy body.',
    steps: [
      {
        stepNumber: 1,
        title: 'Prep & Distribute',
        timeStartSeconds: 0,
        timeEndSeconds: 5,
        targetWaterGrams: 0,
        actionDescription: 'Dose 18g into dry portafilter. Use WDT needles to declump grounds, tamp level with 15kg pressure.',
      },
      {
        stepNumber: 2,
        title: 'Pre-infusion & Extraction',
        timeStartSeconds: 5,
        timeEndSeconds: 30,
        targetWaterGrams: 36,
        actionDescription: 'Lock portafilter, start pump. First drops appear at 6-8s. Stop extraction once liquid output hits target yield.',
        techniqueTip: 'Target 26-30s total extraction time. Adjust grind finer if fast, coarser if choking.',
      },
    ],
  },

  cold_brew: {
    brewMethod: 'cold_brew',
    name: 'Cold Brew (16h Immersion)',
    iconName: 'cold-brew-bottle',
    defaultRatio: 8.0,
    recommendedRatioRange: { min: 6.0, max: 10.0 },
    defaultDoseGrams: 50,
    grindSizeLabel: 'Extra Coarse',
    grindMicrons: '1100 – 1300 µm',
    waterTempCelsius: 20,
    waterTempFahrenheit: 68,
    totalTimeSeconds: 57600,
    equipmentNeeded: ['Cold Brew Pitcher / Mason Jar', 'Cotton Filter Bag / Metal Strainer', 'Chilled Filtered Water'],
    overview: 'Low-temperature slow extraction eliminating up to 66% of volatile acids while highlighting rich chocolate and fruit syrup tones.',
    steps: [
      {
        stepNumber: 1,
        title: 'Combine & Saturate',
        timeStartSeconds: 0,
        timeEndSeconds: 300,
        targetWaterGrams: 400,
        actionDescription: 'Add extra coarse grounds to filter pouch. Slowly pour room-temperature or cold water. Ensure complete saturation.',
      },
      {
        stepNumber: 2,
        title: 'Refrigerate & Steep',
        timeStartSeconds: 300,
        timeEndSeconds: 57600,
        targetWaterGrams: 400,
        actionDescription: 'Seal tightly and place in refrigerator for 16 to 18 hours.',
      },
      {
        stepNumber: 3,
        title: 'Strain & Dilute to Taste',
        timeStartSeconds: 57600,
        timeEndSeconds: 57700,
        targetWaterGrams: 400,
        actionDescription: 'Remove filter pouch. Serve 1:1 with ice, cold milk, or sparkling tonic water.',
      },
    ],
  },

  chemex: {
    brewMethod: 'chemex',
    name: 'Chemex Classic',
    iconName: 'chemex-flask',
    defaultRatio: 16.0,
    recommendedRatioRange: { min: 14.5, max: 17.0 },
    defaultDoseGrams: 30,
    grindSizeLabel: 'Medium-Coarse',
    grindMicrons: '650 – 800 µm',
    waterTempCelsius: 95,
    waterTempFahrenheit: 203,
    totalTimeSeconds: 240,
    equipmentNeeded: ['Chemex 6-Cup', 'Bonded Thick Chemex Filter', 'Gooseneck Kettle', 'Digital Scale'],
    overview: 'Thick triple-bonded cellulose filters eliminate virtually all oils and sediments, delivering a crystal-clean, tea-like cup.',
    steps: [
      {
        stepNumber: 1,
        title: 'Bloom (3x Dose)',
        timeStartSeconds: 0,
        timeEndSeconds: 45,
        targetWaterGrams: 90,
        actionDescription: 'Pour 90g water gently. Let CO2 bubbles release for 45s.',
      },
      {
        stepNumber: 2,
        title: 'Continuous Gentle Pours',
        timeStartSeconds: 45,
        timeEndSeconds: 180,
        targetWaterGrams: 480,
        actionDescription: 'Pour in steady spirals keeping water level 1 inch below rim until reaching 480g.',
      },
      {
        stepNumber: 3,
        title: 'Drawdown',
        timeStartSeconds: 180,
        timeEndSeconds: 240,
        targetWaterGrams: 480,
        actionDescription: 'Allow gravity to finish drawdown. Lift filter and discard.',
      },
    ],
  },

  moka_pot: {
    brewMethod: 'moka_pot',
    name: 'Bialetti Moka Pot (Stovetop)',
    iconName: 'moka-pot',
    defaultRatio: 7.0,
    recommendedRatioRange: { min: 6.0, max: 8.0 },
    defaultDoseGrams: 20,
    grindSizeLabel: 'Fine-Medium',
    grindMicrons: '300 – 400 µm',
    waterTempCelsius: 90,
    waterTempFahrenheit: 194,
    totalTimeSeconds: 180,
    equipmentNeeded: ['Moka Pot', 'Pre-boiled Kettle', 'Stovetop', 'Damp Towel'],
    overview: 'Steam-driven extraction providing a thick, syrupy beverage similar to espresso without complex machinery.',
    steps: [
      {
        stepNumber: 1,
        title: 'Fill Base with Pre-Boiled Water',
        timeStartSeconds: 0,
        timeEndSeconds: 30,
        targetWaterGrams: 140,
        actionDescription: 'Fill lower chamber with freshly boiled water right below safety valve. Fill funnel with coffee, level without tamping.',
      },
      {
        stepNumber: 2,
        title: 'Low Heat Extraction',
        timeStartSeconds: 30,
        timeEndSeconds: 150,
        targetWaterGrams: 140,
        actionDescription: 'Place on low heat with lid open. Coffee will start streaming smoothly into top column.',
      },
      {
        stepNumber: 3,
        title: 'Quench & Serve',
        timeStartSeconds: 150,
        timeEndSeconds: 180,
        targetWaterGrams: 140,
        actionDescription: 'Once the stream turns honey-colored and begins sputtering, remove from heat and cool base under cold water tap.',
      },
    ],
  },
};

/**
 * Returns configuration template for a given brew method.
 */
export function getBrewMethodConfig(method: BrewMethod): BrewGuideTemplate {
  return BREW_METHODS[method] || BREW_METHODS.v60;
}

/**
 * Computes water required and estimated yield based on dose and water:coffee ratio.
 * Coffee grounds absorb approximately 2x their dry weight in water.
 */
export function calculateBrewYield(doseGrams: number, ratio: number): BrewYieldCalculation {
  if (doseGrams <= 0) {
    return {
      waterGrams: 0,
      estimatedYieldMl: 0,
      coffeeDoseGrams: 0,
      ratio,
    };
  }

  const cleanDose = Math.max(0, doseGrams);
  const waterGrams = Math.round(cleanDose * ratio);
  const estimatedYieldMl = Math.max(0, Math.round(waterGrams - cleanDose * 2));

  return {
    waterGrams,
    estimatedYieldMl,
    coffeeDoseGrams: cleanDose,
    ratio,
  };
}

/**
 * Computes bloom water volume (standard 3x the dry coffee dose).
 */
export function calculateBloomWater(doseGrams: number): number {
  if (doseGrams <= 0) return 0;
  return Math.round(Math.max(0, doseGrams) * 3);
}

export interface ScaledBrewStep {
  stepNumber: number;
  title: string;
  timeStartSeconds: number;
  timeEndSeconds: number;
  timeLabel: string;
  targetWaterGrams: number;
  waterToPourGrams: number;
  actionDescription: string;
  techniqueTip?: string;
}

export interface CalculatedBrewMetrics {
  doseGrams: number;
  ratio: number;
  totalWaterGrams: number;
  bloomWaterGrams: number;
  estimatedYieldMl: number;
  steps: ScaledBrewStep[];
}

/**
 * Computes scaled dynamic step instructions based on user selected dose and ratio.
 */
export function computeBrewMetrics(
  template: BrewGuideTemplate,
  userDose: number,
  customRatio?: number
): CalculatedBrewMetrics {
  const activeRatio = customRatio ?? template.defaultRatio;
  const { waterGrams, estimatedYieldMl } = calculateBrewYield(userDose, activeRatio);
  const bloomWaterGrams = calculateBloomWater(userDose);

  const formatMinSec = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const steps: ScaledBrewStep[] = template.steps.map((step, idx) => {
    let targetWater = 0;
    if (template.steps.length === 1) {
      targetWater = waterGrams;
    } else if (idx === 0) {
      targetWater = Math.min(waterGrams, bloomWaterGrams > 0 ? bloomWaterGrams : waterGrams);
    } else if (idx === template.steps.length - 1) {
      targetWater = waterGrams;
    } else {
      // Proportional intermediate pour
      const fraction = (idx + 1) / template.steps.length;
      targetWater = Math.round(waterGrams * fraction);
    }

    return {
      stepNumber: step.stepNumber,
      title: step.title,
      timeStartSeconds: step.timeStartSeconds,
      timeEndSeconds: step.timeEndSeconds,
      timeLabel: `${formatMinSec(step.timeStartSeconds)} – ${formatMinSec(step.timeEndSeconds)}`,
      targetWaterGrams: targetWater,
      waterToPourGrams: targetWater,
      actionDescription: step.actionDescription,
      techniqueTip: step.techniqueTip,
    };
  });

  return {
    doseGrams: userDose,
    ratio: activeRatio,
    totalWaterGrams: waterGrams,
    bloomWaterGrams,
    estimatedYieldMl,
    steps,
  };
}
