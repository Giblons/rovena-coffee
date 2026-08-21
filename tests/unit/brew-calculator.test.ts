import { describe, it, expect } from 'vitest';
import {
  calculateBrewYield,
  calculateBloomWater,
  BREW_METHODS,
  getBrewMethodConfig,
} from '@/lib/brew-calculator';
import { BrewMethod } from '@/types/coffee';

describe('Interactive Brew Calculator — Unit Tests (Tier 1 & Tier 2)', () => {
  describe('Tier 1: Brew Method Ratio Configurations & Yields', () => {
    it('should support all standard specialty brew methods (V60, Aeropress, French Press, Espresso, Cold Brew)', () => {
      const methods: BrewMethod[] = ['v60', 'aeropress', 'french_press', 'espresso', 'cold_brew'];
      methods.forEach((method) => {
        const config = getBrewMethodConfig(method);
        expect(config).toBeDefined();
        expect(config.defaultRatio).toBeGreaterThan(0);
      });
    });

    it('should calculate V60 Pour Over yield with 1:16 ratio (15g coffee -> 240g water)', () => {
      const v60Config = getBrewMethodConfig('v60');
      expect(v60Config.defaultRatio).toBeCloseTo(16.0, 1);

      const dose = 15; // 15g
      const result = calculateBrewYield(dose, 16);
      expect(result.waterGrams).toBe(240); // 15 * 16 = 240g water
      // Bean absorption is 2x dose (30g) -> yield is ~210ml
      expect(result.estimatedYieldMl).toBe(210);
      expect(result.coffeeDoseGrams).toBe(15);
    });

    it('should calculate AeroPress yield with 1:13 ratio (18g coffee -> 234g water)', () => {
      const aeroConfig = getBrewMethodConfig('aeropress');
      expect(aeroConfig.defaultRatio).toBe(13);

      const dose = 18;
      const result = calculateBrewYield(dose, 13);
      expect(result.waterGrams).toBe(234); // 18 * 13 = 234g
      expect(result.estimatedYieldMl).toBe(198); // 234 - 36 = 198ml
    });

    it('should calculate French Press yield with 1:15 ratio (30g coffee -> 450g water)', () => {
      const fpConfig = getBrewMethodConfig('french_press');
      expect(fpConfig.defaultRatio).toBe(15);

      const dose = 30;
      const result = calculateBrewYield(dose, 15);
      expect(result.waterGrams).toBe(450); // 30 * 15 = 450g
      expect(result.estimatedYieldMl).toBe(390); // 450 - 60 = 390ml
    });

    it('should calculate Espresso yield with 1:2 ratio (18g coffee -> 36g espresso yield)', () => {
      const espressoConfig = getBrewMethodConfig('espresso');
      expect(espressoConfig.defaultRatio).toBe(2);

      const dose = 18;
      const result = calculateBrewYield(dose, 2);
      expect(result.waterGrams).toBe(36); // 18 * 2 = 36g
      expect(result.estimatedYieldMl).toBeGreaterThanOrEqual(0);
    });

    it('should calculate Cold Brew yield with 1:8 ratio (50g coffee -> 400g water)', () => {
      const coldConfig = getBrewMethodConfig('cold_brew');
      expect(coldConfig.defaultRatio).toBe(8);

      const dose = 50;
      const result = calculateBrewYield(dose, 8);
      expect(result.waterGrams).toBe(400); // 50 * 8 = 400g
      expect(result.estimatedYieldMl).toBe(300); // 400 - 100 = 300ml
    });
  });

  describe('Tier 1: Bloom Water Calculation & Step Sequences', () => {
    it('should calculate Bloom volume as exactly 3x the coffee dose', () => {
      expect(calculateBloomWater(15)).toBe(45); // 15g * 3 = 45g
      expect(calculateBloomWater(20)).toBe(60); // 20g * 3 = 60g
      expect(calculateBloomWater(30)).toBe(90); // 30g * 3 = 90g
    });

    it('should provide structured step sequences for V60 pour over', () => {
      const v60 = getBrewMethodConfig('v60');
      expect(v60.steps.length).toBeGreaterThanOrEqual(3);
      expect(v60.totalTimeSeconds).toBe(180); // 3 minutes

      // Step 1: Bloom
      const bloomStep = v60.steps[0];
      expect(bloomStep.title.toLowerCase()).toContain('bloom');
      expect(bloomStep.timeStartSeconds).toBe(0);
      expect(bloomStep.timeEndSeconds).toBe(45);
    });

    it('should specify appropriate water temperatures across brew methods', () => {
      const v60 = getBrewMethodConfig('v60');
      const aero = getBrewMethodConfig('aeropress');
      const cold = getBrewMethodConfig('cold_brew');

      expect(v60.waterTempCelsius).toBeGreaterThanOrEqual(92);
      expect(aero.waterTempCelsius).toBeLessThan(v60.waterTempCelsius); // AeroPress uses lower temp ~88°C
      expect(cold.waterTempCelsius).toBeLessThanOrEqual(25); // Cold brew uses room temp / cold water
    });
  });

  describe('Tier 2: Boundary Cases & Ratio Limitations', () => {
    it('should handle zero dose gracefully without crashing or NaN', () => {
      const result = calculateBrewYield(0, 16);
      expect(result.waterGrams).toBe(0);
      expect(result.estimatedYieldMl).toBe(0);
      expect(result.coffeeDoseGrams).toBe(0);
      expect(calculateBloomWater(0)).toBe(0);
    });

    it('should handle high dose (e.g. 100g bulk brew batch)', () => {
      const result = calculateBrewYield(100, 16);
      expect(result.waterGrams).toBe(1600); // 100 * 16 = 1600g
      expect(result.estimatedYieldMl).toBe(1400); // 1600 - 200 = 1400ml
      expect(calculateBloomWater(100)).toBe(300);
    });

    it('should enforce recommended ratio boundaries per brew method', () => {
      const v60 = getBrewMethodConfig('v60');
      expect(v60.recommendedRatioRange.min).toBeLessThanOrEqual(v60.defaultRatio);
      expect(v60.recommendedRatioRange.max).toBeGreaterThanOrEqual(v60.defaultRatio);
    });

    it('should guard against negative dose inputs by clamping to 0', () => {
      const result = calculateBrewYield(-15, 16);
      expect(result.waterGrams).toBe(0);
      expect(result.estimatedYieldMl).toBe(0);
      expect(calculateBloomWater(-15)).toBe(0);
    });
  });
});
