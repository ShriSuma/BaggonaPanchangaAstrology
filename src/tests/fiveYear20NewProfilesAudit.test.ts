import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { compute5YearMasterPrediction, getEnglishOrdinal } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";

export interface HistoricalTestProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  category2021: "child" | "youth" | "adult" | "senior";
  restrictionType: string;
  documented5YearReality: string;
}

export const NEW_20_PROFILES: HistoricalTestProfile[] = [
  // 1. Darshan Thoogudeepa (Kannada Actor - Legal Incarceration / Bandhana)
  {
    id: "darshan",
    name: "Darshan Thoogudeepa",
    birthDate: "1977-02-16",
    birthTime: "23:40",
    lat: 12.1464,
    lng: 75.9329,
    category2021: "adult",
    restrictionType: "Legal Arrest / Prison Incarceration",
    documented5YearReality: "2021 Roberrt superhit; 2023 Kaatera historic ₹100cr blockbuster; June 2024 arrested in murder case, lodged in judicial custody / prison."
  },
  // 2. Donald Trump (Ex-US President - Criminal Indictments & Election Triumph)
  {
    id: "trump",
    name: "Donald Trump",
    birthDate: "1946-06-14",
    birthTime: "10:54",
    lat: 40.7282,
    lng: -73.7949,
    category2021: "senior",
    restrictionType: "Multiple Indictments, Trial Restraints & Assassination Attempt",
    documented5YearReality: "2021 Jan 6 fallout & social media bans; 2023-2024 four criminal indictments & trial; survived July 2024 assassination attempt; won Nov 2024 election."
  },
  // 3. Rishabh Pant (Indian Cricketer - Near-Fatal Accident & Bedridden Restriction)
  {
    id: "pant",
    name: "Rishabh Pant",
    birthDate: "1997-10-04",
    birthTime: "12:10",
    lat: 29.8543,
    lng: 77.8880,
    category2021: "adult",
    restrictionType: "Severe Vehicular Accident & Bedridden Hospital Confinement",
    documented5YearReality: "Jan 2021 Gabba match-winner; Dec 30, 2022 near-fatal car crash; 2023 bedridden and multiple ligament surgeries; June 2024 T20 World Cup champion."
  },
  // 4. Novak Djokovic (World Tennis Champion - Visa Cancellation & Deportation Detention)
  {
    id: "djokovic",
    name: "Novak Djokovic",
    birthDate: "1987-05-22",
    birthTime: "23:25",
    lat: 44.7866,
    lng: 20.4489,
    category2021: "adult",
    restrictionType: "Government Detention, Visa Revocation & Deportation Restriction",
    documented5YearReality: "2021 three Grand Slams; Jan 2022 detained in Melbourne hotel and deported from Australia; 2023 three Grand Slams; 2024 Olympic Gold."
  },
  // 5. King Charles III (British Monarch - Monarchical Ascension & Cancer Diagnosis)
  {
    id: "charles",
    name: "King Charles III",
    birthDate: "1948-11-14",
    birthTime: "21:14",
    lat: 51.5014,
    lng: -0.1419,
    category2021: "senior",
    restrictionType: "Oncological Health Crisis & Surgery Restrictions",
    documented5YearReality: "Sept 2022 ascended British throne; May 2023 Coronation; early 2024 diagnosed with cancer and underwent surgery with restricted public duties."
  },
  // 6. Shafali Verma (Indian Women's Cricket Prodigy - U-19 World Cup Glory)
  {
    id: "shafali",
    name: "Shafali Verma",
    birthDate: "2004-01-28",
    birthTime: "05:45",
    lat: 28.8955,
    lng: 76.6066,
    category2021: "youth",
    restrictionType: "Strict Youth Sports Training & Form Slump Testing",
    documented5YearReality: "2021 historic Test half-centuries on debut; Jan 2023 led India to inaugural U-19 T20 World Cup title; 2024 WPL explosive batting."
  },
  // 7. Carlos Alcaraz (Tennis Prodigy - Youngest World No. 1)
  {
    id: "alcaraz",
    name: "Carlos Alcaraz",
    birthDate: "2003-05-05",
    birthTime: "09:15",
    lat: 37.9547,
    lng: -1.1578,
    category2021: "youth",
    restrictionType: "Abdominal Muscle Injury Withdrawals",
    documented5YearReality: "2021 Next Gen champion; Sept 2022 US Open title and youngest ATP No. 1; 2023 Wimbledon champion; 2024 French Open & Wimbledon double."
  },
  // 8. Imran Khan (Ex-Pakistan PM - Ouster, Assassination Injury & Adiala Jail Prison)
  {
    id: "imran",
    name: "Imran Khan",
    birthDate: "1952-10-05",
    birthTime: "11:50",
    lat: 31.5204,
    lng: 74.3587,
    category2021: "senior",
    restrictionType: "Violent Gunshot Injury & Protracted Prison Incarceration",
    documented5YearReality: "April 2022 ousted via no-confidence; Nov 2022 shot in leg; Aug 2023 arrested, convicted and locked in Adiala jail through 2024."
  },
  // 9. Britney Spears (Pop Icon - Liberation from 13-Year Conservatorship)
  {
    id: "britney",
    name: "Britney Spears",
    birthDate: "1981-12-02",
    birthTime: "01:30",
    lat: 31.2438,
    lng: -90.4531,
    category2021: "adult",
    restrictionType: "Court Conservatorship Restraint to Full Freedom",
    documented5YearReality: "Nov 2021 13-year legal conservatorship officially terminated; 2022 married; 2023 bestselling memoir 'The Woman in Me'."
  },
  // 10. Erling Haaland (Football Megastar - Treble Triumph & Scoring Records)
  {
    id: "haaland",
    name: "Erling Haaland",
    birthDate: "2000-07-21",
    birthTime: "06:45",
    lat: 53.8008,
    lng: -1.5491,
    category2021: "youth",
    restrictionType: "Recurrent Muscular Strains & Intense Pitch Vigilance",
    documented5YearReality: "2021 Champions League top scorer; 2022-2023 historic treble with Man City, 36 Premier League goals record."
  },
  // 11. Rhea Chakraborty (Indian Actress - Bail Restrictions & Career Rehabilitation)
  {
    id: "rhea",
    name: "Rhea Chakraborty",
    birthDate: "1992-07-01",
    birthTime: "11:45",
    lat: 12.9716,
    lng: 77.5946,
    category2021: "adult",
    restrictionType: "Strict Bail Conditions, Travel Restraint & Media Trial",
    documented5YearReality: "2021-2022 facing intense CBI/NCB investigations and passport restrictions; 2023 returned to mainstream TV with MTV Roadies; 2024 Chapter 2 podcast."
  },
  // 12. Prince Harry (British Royal - Royal Split & Memoir Fallout)
  {
    id: "harry",
    name: "Prince Harry",
    birthDate: "1984-09-15",
    birthTime: "16:20",
    lat: 51.5074,
    lng: -0.1278,
    category2021: "adult",
    restrictionType: "Loss of Royal Patronage & Security Restraints",
    documented5YearReality: "March 2021 Oprah interview; 2022 Netflix docuseries; Jan 2023 'Spare' memoir publication with deep familial fracture."
  },
  // 13. Shah Rukh Khan (Bollywood Megastar - Aryan Khan Crisis to ₹2000cr Peak)
  {
    id: "srk",
    name: "Shah Rukh Khan",
    birthDate: "1965-11-02",
    birthTime: "02:30",
    lat: 28.6139,
    lng: 77.2090,
    category2021: "senior",
    restrictionType: "Family Crisis & Temporary Public Seclusion",
    documented5YearReality: "Oct 2021 son Aryan Khan detained in NCB cruise case causing extreme distress; 2023 historic comeback with Pathaan and Jawan grossing ₹2000cr+."
  },
  // 14. Sam Altman (OpenAI CEO - Board Ouster & 5-Day Reinstatement)
  {
    id: "altman",
    name: "Sam Altman",
    birthDate: "1985-04-22",
    birthTime: "09:14",
    lat: 41.8781,
    lng: -87.6298,
    category2021: "adult",
    restrictionType: "Abrupt Board Firing & Corporate Exile",
    documented5YearReality: "Nov 2022 launched ChatGPT sparking global AI boom; Nov 17, 2023 abruptly fired by OpenAI board; reinstated on Nov 21 with total board overhaul."
  },
  // 15. Boris Johnson (Ex-UK Prime Minister - Partygate Scandal & Forced Resignation)
  {
    id: "boris",
    name: "Boris Johnson",
    birthDate: "1964-06-19",
    birthTime: "14:00",
    lat: 40.7128,
    lng: -74.0060,
    category2021: "senior",
    restrictionType: "Parliamentary Inquest, Police Fines & Forced Resignation",
    documented5YearReality: "2021 successful vaccine rollout; late 2021-2022 Partygate scandal, police fine, mass ministerial resignations forced him out of 10 Downing Street in July 2022."
  },
  // 16. Kavya Maran (SRH / Sun Group - Rebuilding to SA20 & IPL Finals)
  {
    id: "kavya",
    name: "Kavya Maran",
    birthDate: "1992-08-06",
    birthTime: "08:30",
    lat: 13.0827,
    lng: 80.2707,
    category2021: "adult",
    restrictionType: "Franchise Wooden Spoon & Team Reconstruction Trials",
    documented5YearReality: "2021-2022 painful bottom-table IPL finishes; 2023 & 2024 Sunrisers Eastern Cape back-to-back SA20 champions; May 2024 SRH reaches IPL final with 287 world record."
  },
  // 17. Aryna Sabalenka (World Tennis No. 1 - Nationality Ban to 3 Grand Slams)
  {
    id: "sabalenka",
    name: "Aryna Sabalenka",
    birthDate: "1998-05-05",
    birthTime: "10:15",
    lat: 53.9006,
    lng: 27.5590,
    category2021: "adult",
    restrictionType: "Wimbledon Nationality Ban & Double-Fault Serving Crisis",
    documented5YearReality: "2022 banned from Wimbledon, severe serving yips; Jan 2023 Australian Open champion; 2024 Australian & US Open champion, ends year as World No. 1."
  },
  // 18. Kamala Harris (US Vice President - Historical Office to 2024 Election Loss)
  {
    id: "kamala",
    name: "Kamala Harris",
    birthDate: "1964-10-20",
    birthTime: "21:28",
    lat: 37.8044,
    lng: -122.2712,
    category2021: "senior",
    restrictionType: "Executive Approval Squeeze & Whirlwind Campaign Pressure",
    documented5YearReality: "Jan 2021 sworn in as first female US Vice President; July 2024 elevated to presidential nominee after Biden withdrawal; Nov 2024 election loss."
  },
  // 19. Aniruddhacharya Ji Maharaj (Vedic Katha Vachak - Viral National Celebrity)
  {
    id: "aniruddhacharya",
    name: "Aniruddhacharya Ji",
    birthDate: "1989-09-27",
    birthTime: "06:15",
    lat: 23.8323,
    lng: 79.4387,
    category2021: "adult",
    restrictionType: "Public Scrutiny & Intensive Social Media Memes",
    documented5YearReality: "2021-2022 regional Bhagavata Kathas; 2023-2024 became India's most viral spiritual personality (Pookie Baba), guest on Bigg Boss 18."
  },
  // 20. Pawan Kalyan (Jana Sena Chief & Deputy CM - Political Struggle to Power)
  {
    id: "pawan",
    name: "Pawan Kalyan",
    birthDate: "1971-09-02",
    birthTime: "05:45",
    lat: 15.9042,
    lng: 80.4673,
    category2021: "senior",
    restrictionType: "Political Defamation, Police Roadblocks & Fierce Rallies",
    documented5YearReality: "2021-2023 facing government police obstruction and vehicle bans in AP; June 2024 100% election strike rate (21/21 assembly seats), sworn in as Deputy CM."
  }
];

describe("20 New Profiles 2021-2026 Prediction Accuracy Audit", () => {
  it("verifies English ordinal helper utility", () => {
    expect(getEnglishOrdinal(1)).toBe("1st");
    expect(getEnglishOrdinal(2)).toBe("2nd");
    expect(getEnglishOrdinal(3)).toBe("3rd");
    expect(getEnglishOrdinal(4)).toBe("4th");
    expect(getEnglishOrdinal(10)).toBe("10th");
    expect(getEnglishOrdinal(11)).toBe("11th");
    expect(getEnglishOrdinal(12)).toBe("12th");
    expect(getEnglishOrdinal(21)).toBe("21st");
    expect(getEnglishOrdinal(22)).toBe("22nd");
    expect(getEnglishOrdinal(23)).toBe("23rd");
  });

  it("verifies Darshan Thoogudeepa (Profile 1) 2021-2026 cycle against June 2024 incarceration", () => {
    const p = NEW_20_PROFILES[0];
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const predEn = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    expect(predEn.macroSummary.cautionPeriodYear).toBe("2024 - 2025");

    const y2024En = predEn.years.find(y => y.gregorianRange.startsWith("2024"));
    expect(y2024En).toBeDefined();
    expect(y2024En!.munthaHouse).toBe(12);
    expect(y2024En!.isBandhanaRisk).toBe(true);
    expect(y2024En!.vitalityScore).toBeLessThanOrEqual(40);
    expect(y2024En!.vitalityCategory).toBe("caution");
    expect(y2024En!.headline).toContain("Judicial Scrutiny, Confinement Peril & Paramount Restraint Year");
    expect(y2024En!.cautionAndGuidance).toContain("Sever ties with controversial associations");

    // Check Kannada Localization
    const predKn = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "kn", p.name, 2021);
    const y2024Kn = predKn.years.find(y => y.gregorianRange.startsWith("2024"));
    expect(y2024Kn!.headline).toContain("ಕಾನೂನು ಪರಿಶೀಲನೆ, ಬಂಧನ ಭೀತಿ");
    expect(y2024Kn!.cautionAndGuidance).toContain("ವಿವಾದಿತ ಸಹವಾಸಗಳನ್ನು ತಕ್ಷಣ ತ್ಯಜಿಸಿ");
  });

  it("verifies Rishabh Pant (Profile 3) 2022-2023 Arishta Risk against Dec 30, 2022 crash", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "pant")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    expect(pred.macroSummary.cautionPeriodYear).toBe("2022 - 2023");

    const y2022 = pred.years.find(y => y.gregorianRange.startsWith("2022"));
    expect(y2022).toBeDefined();
    expect(y2022!.munthaHouse).toBe(2);
    expect(y2022!.isArishtaRisk).toBe(true);
    expect(y2022!.vitalityScore).toBeLessThanOrEqual(45);
    expect(y2022!.vitalityCategory).toBe("caution");
    expect(y2022!.headline).toContain("Health Crisis, Physical Vulnerability & Surgical Convalescence Year");
  });

  it("verifies Novak Djokovic (Profile 4) 2021 Apex Grand Slam and 2022 Detention/Deportation", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "djokovic")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    const y2021 = pred.years.find(y => y.gregorianRange.startsWith("2021"))!;
    expect(y2021.munthaHouse).toBe(11);
    expect(y2021.vitalityScore).toBeGreaterThanOrEqual(90);
    expect(y2021.vitalityCategory).toBe("exceptional");

    const y2022 = pred.years.find(y => y.gregorianRange.startsWith("2022"))!;
    expect(y2022.munthaHouse).toBe(12);
    expect(y2022.isBandhanaRisk).toBe(true);
    expect(y2022.vitalityScore).toBeLessThan(60);
  });

  it("verifies Imran Khan (Profile 8) 2023-2024 Adiala Jail Incarceration", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "imran")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    expect(pred.macroSummary.cautionPeriodYear).toBe("2023 - 2024");

    const y2023 = pred.years.find(y => y.gregorianRange.startsWith("2023"))!;
    expect(y2023.munthaHouse).toBe(12);
    expect(y2023.isBandhanaRisk).toBe(true);
    expect(y2023.vitalityCategory).toBe("caution");
    expect(y2023.headline).toContain("Judicial Scrutiny, Confinement Peril");
  });

  it("verifies Carlos Alcaraz (Profile 7) 2023-2024 Sovereign Breakthrough", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "alcaraz")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    const y2023 = pred.years.find(y => y.gregorianRange.startsWith("2023"))!;
    expect(y2023.vitalityScore).toBeGreaterThanOrEqual(95);
    expect(y2023.vitalityCategory).toBe("exceptional");
  });

  it("verifies Aniruddhacharya Ji (Profile 19) 2023-2024 Muntha 11 Apex Acclaim", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "aniruddhacharya")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    const y2023 = pred.years.find(y => y.gregorianRange.startsWith("2023"))!;
    expect(y2023.munthaHouse).toBe(11);
    expect(y2023.isRajaYogaPeak).toBe(true);
    expect(y2023.vitalityScore).toBeGreaterThanOrEqual(95);
    expect(y2023.vitalityCategory).toBe("exceptional");
    expect(y2023.headline).toContain("Sovereign Raja Yoga, Apex Authority");
  });

  it("verifies Donald Trump (Profile 2) 2023-2024 Court Trial vs 2024 Electoral Breakthrough", () => {
    const p = NEW_20_PROFILES.find(x => x.id === "trump")!;
    const k = calculateKundli({
      name: p.name,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.lat,
      longitude: p.lng,
      gender: "Male"
    });

    const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, "en", p.name, 2021);
    const y2023 = pred.years.find(y => y.gregorianRange.startsWith("2023"))!;
    expect(y2023.munthaHouse).toBe(6);
    expect(y2023.vitalityScore).toBeLessThanOrEqual(50);
    expect(y2023.headline).toContain("Competitive Warfare, Rivalry Resolution");
  });

  it("executes all 20 historical profiles across all 6 supported languages without error or missing keys", () => {
    const supportedLangs: SixLang[] = ["kn", "mr", "hi", "te", "ta", "en"];

    for (const p of NEW_20_PROFILES) {
      const k = calculateKundli({
        name: p.name,
        birthDate: p.birthDate,
        birthTime: p.birthTime,
        latitude: p.lat,
        longitude: p.lng,
        gender: "Male"
      });

      for (const lang of supportedLangs) {
        const pred = compute5YearMasterPrediction(k, p.birthDate, p.birthTime, lang, p.name, 2021);
        expect(pred.years).toHaveLength(5);
        expect(pred.macroSummary.peakGoldenYear).toBeTruthy();
        expect(pred.macroSummary.cautionPeriodYear).toBeTruthy();

        for (const y of pred.years) {
          expect(y.vitalityScore).toBeGreaterThanOrEqual(30);
          expect(y.vitalityScore).toBeLessThanOrEqual(98);
          expect(y.headline.length).toBeGreaterThan(10);
          expect(y.whatToExpect.length).toBe(3);
          expect(y.turningPointSeason.length).toBeGreaterThan(5);
          expect(y.goldenOpportunityWindow.length).toBeGreaterThan(5);
          expect(y.cautionAndGuidance.length).toBeGreaterThan(5);
          expect(y.paragraphs).toBeDefined();
          expect(y.paragraphs!.length).toBe(3);
        }
      }
    }
  });
});
