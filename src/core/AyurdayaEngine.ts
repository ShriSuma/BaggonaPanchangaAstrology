
export type PlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

export interface PlanetData {
  name: PlanetName;
  longitude: number; // 0-360
  houseIndex: number; // 1-12, where 1 is the Lagna (Ascendant) house
  signIndex: number; // 1-12, 1=Aries, 2=Taurus...
  isRetrograde: boolean;
  isCombust: boolean;
  isWaningMoon?: boolean; // Required for Moon to determine if it's malefic
}

export interface AyurdayaOutput {
  years: number;
  months: number;
  days: number;
  totalFloat: number;
  formattedText: string;
}

export class AyurdayaEngine {
  // Phase 1: Base Constants
  private static readonly MAX_YEARS: Record<PlanetName, number> = {
    Sun: 19,
    Moon: 25,
    Mars: 15,
    Mercury: 12,
    Jupiter: 15,
    Venus: 21,
    Saturn: 20
  };

  private static readonly DEBILITATION_LONGITUDE: Record<PlanetName, number> = {
    Sun: 190,
    Moon: 213,
    Mars: 118,
    Mercury: 345,
    Jupiter: 275,
    Venus: 177,
    Saturn: 20
  };

  // Sign Rulers (1 = Aries ... 12 = Pisces)
  private static readonly SIGN_RULERS: Record<number, PlanetName> = {
    1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
    5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
    9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
  };

  // Enemy matrix based on the user's provided JSON
  private static readonly ENEMIES: Record<PlanetName, PlanetName[]> = {
    Sun: ['Venus', 'Saturn'],
    Moon: [],
    Mars: ['Mercury'],
    Mercury: ['Moon'],
    Jupiter: ['Mercury', 'Venus'],
    Venus: ['Sun', 'Moon'],
    Saturn: ['Sun', 'Moon', 'Mars']
  };

  /**
   * Utility to map KundliOutput planets to PlanetData expected by this engine.
   */
  public static mapPlanets(rawPlanets: any[], sunLongitude: number): PlanetData[] {
    const ayurdayaPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const mapped: PlanetData[] = [];

    for (const rp of rawPlanets) {
      if (!ayurdayaPlanets.includes(rp.name)) continue;

      // Simple combustion logic: within 8 degrees of Sun
      let distToSun = Math.abs(rp.degree - sunLongitude);
      if (distToSun > 180) distToSun = 360 - distToSun;
      const isCombust = rp.name !== 'Sun' && distToSun <= 8;

      // Waning moon check: Moon is waning if distance from Sun is > 180 (moving towards Sun)
      let isWaningMoon = false;
      if (rp.name === 'Moon') {
        let moonDist = rp.degree - sunLongitude;
        if (moonDist < 0) moonDist += 360;
        isWaningMoon = moonDist > 180;
      }

      mapped.push({
        name: rp.name as PlanetName,
        longitude: rp.degree,
        houseIndex: rp.house,
        signIndex: rp.rashi.index + 1, // 1 to 12
        isRetrograde: Boolean(rp.isRetrograde),
        isCombust,
        isWaningMoon
      });
    }
    return mapped;
  }

  public static calculateAyurdaya(
    planets: PlanetData[], 
    lagnaLongitude: number
  ): AyurdayaOutput {
    let totalLifespanFloat = 0;
    let maleficInLagna = false;

    for (const planet of planets) {
      // Phase 2: Calculating Gross Years (Bharana)
      const M = this.MAX_YEARS[planet.name];
      const N = this.DEBILITATION_LONGITUDE[planet.name];
      
      let D = planet.longitude - N;
      if (D < 0) D += 360;
      if (D > 180) D = 360 - D;
      
      let years = M * (D / 180);

      // Phase 3: Applying Mathematical Reductions (Haranas)

      // 1. Chakrardha Harana (Hemisphere Reduction)
      // Invisible half: Houses 7 through 12
      let houseDeductionRatio = 0;
      switch (planet.houseIndex) {
        case 12: houseDeductionRatio = 1.0; break;
        case 11: houseDeductionRatio = 0.5; break;
        case 10: houseDeductionRatio = 0.333; break;
        case 9: houseDeductionRatio = 0.25; break;
        case 8: houseDeductionRatio = 0.20; break;
        case 7: houseDeductionRatio = 0.166; break;
      }
      
      const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet.name);
      if (isBenefic && houseDeductionRatio > 0) {
        houseDeductionRatio /= 2;
      }
      
      years -= years * houseDeductionRatio;

      // 2. Shatrukshetra Harana (Enemy Sign Reduction)
      if (!planet.isRetrograde) {
        const signRuler = this.SIGN_RULERS[planet.signIndex];
        const isEnemySign = this.ENEMIES[planet.name].includes(signRuler);
        if (isEnemySign) {
          years -= years * (1 / 3);
        }
      }

      // 3. Astangata Harana (Combustion Reduction)
      if (planet.isCombust && planet.name !== 'Venus' && planet.name !== 'Saturn') {
        years -= years * 0.5;
      }

      // Track if malefic is in Lagna (House 1) for step 4
      const isMalefic = ['Sun', 'Mars', 'Saturn'].includes(planet.name) || 
                        (planet.name === 'Moon' && planet.isWaningMoon);
      
      if (isMalefic && planet.houseIndex === 1) {
        maleficInLagna = true;
      }

      totalLifespanFloat += years;
    }

    // Phase 4: Lagna Ayush (Ascendant Contribution)
    // 1 Navamsa = 3°20' = 3.333333 degrees. Count Navamsas passed in the current sign.
    const navamsasPassedFloat = (lagnaLongitude % 30) / (10 / 3);
    totalLifespanFloat += navamsasPassedFloat;

    // 4. Krurodaya Harana (Malefic Ascendant Reduction)
    // Flat 5% reduction of the total if malefics are in Lagna
    if (maleficInLagna) {
      totalLifespanFloat -= totalLifespanFloat * 0.05;
    }

    // Phase 5: The Final Conversion (Years, Months, Days)
    const finalYears = Math.floor(totalLifespanFloat);
    const monthsRemainder = (totalLifespanFloat - finalYears) * 12;
    const finalMonths = Math.floor(monthsRemainder);
    const daysRemainder = (monthsRemainder - finalMonths) * 30;
    const finalDays = Math.floor(daysRemainder);

    return {
      years: finalYears,
      months: finalMonths,
      days: finalDays,
      totalFloat: totalLifespanFloat,
      formattedText: `Calculated Mathematical Ayurdaya: ${finalYears} Years, ${finalMonths} Months, ${finalDays} Days.`
    };
  }
}
