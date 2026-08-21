import { BrewMethod } from './coffee';

export interface BrewGuideStep {
  stepNumber: number;
  title: string;
  timeStartSeconds: number;
  timeEndSeconds: number;
  targetWaterGrams: number;
  actionDescription: string;
  techniqueTip?: string;
}

export interface BrewGuideTemplate {
  brewMethod: BrewMethod;
  name: string;
  iconName: string;
  defaultRatio: number;      // e.g. 16.6 (water per 1g coffee)
  recommendedRatioRange: { min: number; max: number };
  defaultDoseGrams: number;  // e.g. 15g
  grindSizeLabel: string;    // 'Medium-Fine'
  grindMicrons: string;      // '450 - 600 µm'
  waterTempCelsius: number;  // 93 - 96
  waterTempFahrenheit: number;
  totalTimeSeconds: number;  // 180s (3:00)
  steps: BrewGuideStep[];
  overview: string;
  equipmentNeeded: string[];
}

export interface BrewYieldCalculation {
  waterGrams: number;
  estimatedYieldMl: number;
  coffeeDoseGrams: number;
  ratio: number;
}
