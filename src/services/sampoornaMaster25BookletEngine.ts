/**
 * ============================================================================
 * BAGGONA PANCHANGA — SAMPOORNA 25-CHAPTER BOOKLET & EXTENDED PRECISION ENGINE
 * ============================================================================
 * Additive precision gates & rich narrative synthesis layered cleanly on top of
 * sampoornaMaster25Service.ts:
 *  - Royal Booklet Cover personalization & emotional assurance copy (6 languages)
 *  - Functional Lagna Nature, Exaltation/Own/Vargottama, Combustion (Asta),
 *    Retrograde (Vakri) Chesta Bala, Gandanta / Rashi Sandhi, Badhaka Sthana,
 *    Domain Sarvashtakavarga (SAV), and Live Today's Tarabala / Chandrashtama
 *  - Dedicated per-chapter astronomical verification pills & 5-6 line deep
 *    mathematical + life guidance answers (strictly age & script safe).
 * ============================================================================
 */

import type { KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import { signLord } from "../core/KundliInsightsEngine";
import { resolveDevoteeDisplayName, transliterateName } from "../utils/transliterator";
import { type SixLang, pick6, RASHI_6L, GRAHA_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import {
  type RashiIndex,
  type Planet,
  type PlanetPosition,
  type FunctionalNature,
  getDegreeVulnerability,
  calculateLiveTodayTarabalaAndChandrashtama,
  TARA_NAMES_7L,
  type LiveTodayTarabalaOutput
} from "../engine/jyotishPrecisionGates";

export interface HouseLordPlacementInfo {
  lordGraha: PlanetName;
  lordName: string;
  placedHouse: number;
  placedRashi: string;
}

export interface ExtendedPrecisionMetrics {
  badhakaHouse: number;
  badhakaInfo: HouseLordPlacementInfo;
  house1Info: HouseLordPlacementInfo;
  house4Info: HouseLordPlacementInfo;
  house8Info: HouseLordPlacementInfo;
  house9Info: HouseLordPlacementInfo;
  house12Info: HouseLordPlacementInfo;
  savByHouse: Record<1 | 2 | 5 | 7 | 10 | 11, number>;
  mahaFunctionalNature: FunctionalNature;
  bhuktiFunctionalNature: FunctionalNature;
  mahaNatureLabel: string;
  bhuktiNatureLabel: string;
  combustPlanetsLocalized: string[];
  retroPlanetsLocalized: string[];
  exaltedPlanetsLocalized: string[];
  ownSignPlanetsLocalized: string[];
  vargottamaPlanetsLocalized: string[];
  gandantaPointsLocalized: string[];
  sandhiPointsLocalized: string[];
  liveTarabala: LiveTodayTarabalaOutput;
  taraLabelLocalized: string;
  taraGuidanceLocalized: string;
  rahuDispositorName: string;
  rahuDispositorHouse: number;
  ketuDispositorName: string;
  ketuDispositorHouse: number;
  precisionProfileSummary: {
    liveTarabalaHeadline: string;
    liveTarabalaBadge: string;
    isChandrashtama: boolean;
    chandrashtamaWarning?: string;
    mahaFunctionalStatus: string;
    badhakaSummary: string;
    dignifiedSummary: string;
    retroCombustSummary: string;
    gandantaSummary: string;
    savSummaryText: string;
  };
}

export interface BookletCoverContent {
  brandBannerTitle: string;
  kshetraSubtitle: string;
  exclusiveForTag: string;
  bookletEditionLine: string;
  personalAssurancePara1: string;
  personalAssurancePara2: string;
  sealHeading: string;
  confidentialFooterNote: string;
}

const FUNCTIONAL_NATURE_6L: Record<FunctionalNature, Record<SixLang, string>> = {
  YOGAKARAKA: {
    kn: "ಪರಮ ಯೋಗಕಾರಕ ಗ್ರಹ",
    mr: "परम योगकारक ग्रह",
    hi: "परम योगकारक ग्रह",
    te: "పరమ యోగకారక గ్రహం",
    ta: "உத்தம யோககாரக கிரகம்",
    en: "Supreme Yogakaraka"
  },
  BENEFIC: {
    kn: "ಶುಭ ಫಲದಾಯಕ ಗ್ರಹ",
    mr: "शुभ फलदायी ग्रह",
    hi: "शुभ फलदायी ग्रह",
    te: "శుభ ఫలదాయక గ్రహం",
    ta: "சுப பலன் தரும் கிரகம்",
    en: "Functional Benefic"
  },
  NEUTRAL: {
    kn: "ಸಮಸ್ಥಿತಿ ಫಲಕಾರಕ",
    mr: "समस्थिती फलकारक",
    hi: "समस्थिति फलकारक",
    te: "సమస్థితి ఫలకారకుడు",
    ta: "சமநிலை பலன் தரும் கிரகம்",
    en: "Balanced Dispositor"
  },
  MALEFIC: {
    kn: "ಪರೀಕ್ಷಾ ಹಾಗೂ ಶಿಸ್ತು ಕಾರಕ",
    mr: "परीक्षा व शिस्त कारक",
    hi: "परीक्षा एवं अनुशासन कारक",
    te: "పరీక్షా మరియు క్రమశిక్షణ కారకుడు",
    ta: "சோதனை மற்றும் ஒழுக்க காரகர்",
    en: "Karmic Discipline Tester"
  },
  MARAKA: {
    kn: "ಮಾರಕ ಸ್ಥಾನಾಧಿಪತಿ (ಸೂಕ್ಷ್ಮ ಎಚ್ಚರಿಕೆ)",
    mr: "मारक स्थानाधिपती (दक्षता आवश्यक)",
    hi: "मारक स्थानाधिपति (सजगता आवश्यक)",
    te: "మారక స్థానాధిపతి (జాగ్రత్త అవసరం)",
    ta: "மாரக அதிபதி (கவனம் அவசியம்)",
    en: "Maraka Dispositor (Protective Guard)"
  }
};

const EXALT_RASHI_BY_PLANET: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6
};

const OWN_RASHIS_BY_PLANET: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10]
};

function formatDigits(num: number | string, lang: SixLang): string {
  const s = String(num);
  if (lang === "en") return s;
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  const map =
    lang === "kn"
      ? knDigits
      : lang === "mr" || lang === "hi"
      ? hiDigits
      : lang === "te"
      ? teDigits
      : taDigits;
  return s.replace(/\d/g, (d) => map[parseInt(d, 10)] || d);
}

export function formatPageTag6L(pageNum: number, lang: SixLang): string {
  const nPage = formatDigits(pageNum, lang);
  return pick6(
    {
      kn: `ಪುಟ ${nPage}`,
      mr: `पृ. ${nPage}`,
      hi: `पृ. ${nPage}`,
      te: `పుట ${nPage}`,
      ta: `பக். ${nPage}`,
      en: `Page ${nPage}`
    },
    lang
  );
}

/**
 * Computes extended classical Jyotish gates from real birth chart placements:
 * Functional nature per Lagna, Combustion (Asta), Retrograde (Vakri),
 * Vargottama / Exaltation / Own-Sign dignity, Gandanta / Rashi Sandhi knots,
 * Movable/Fixed/Dual Badhaka Sthana, Domain Sarvashtakavarga, and Live Tarabala.
 */
export function computeExtendedPrecisionMetrics(params: {
  result: KundliOutput;
  targetLang: SixLang;
  lagnaRashiIdx: RashiIndex;
  moonRashiIdx: RashiIndex;
  moonNakIdx: number;
  sunLon: number;
  rawMaha: string;
  rawBhukti: string;
  lagnaPlanetNature: Record<string, FunctionalNature>;
  precisionPlanets: PlanetPosition[];
  savTable: number[];
  getHouseLordPlacement: (houseNum: number) => HouseLordPlacementInfo;
  now: Date;
}): ExtendedPrecisionMetrics {
  const {
    result,
    targetLang,
    lagnaRashiIdx,
    moonRashiIdx,
    moonNakIdx,
    sunLon,
    rawMaha,
    rawBhukti,
    lagnaPlanetNature,
    precisionPlanets,
    savTable,
    getHouseLordPlacement,
    now
  } = params;

  const n = (v: number | string) => formatDigits(v, targetLang);

  // 1. Badhaka Sthana (Chara=11th, Sthira=9th, Dwiswabhava=7th)
  const lagnaMod = lagnaRashiIdx % 3;
  const badhakaHouse = lagnaMod === 0 ? 11 : lagnaMod === 1 ? 9 : 7;
  const badhakaInfo = getHouseLordPlacement(badhakaHouse);

  const house1Info = getHouseLordPlacement(1);
  const house4Info = getHouseLordPlacement(4);
  const house8Info = getHouseLordPlacement(8);
  const house9Info = getHouseLordPlacement(9);
  const house12Info = getHouseLordPlacement(12);

  // 2. Domain Sarvashtakavarga scores
  const getSav = (hNum: number) => savTable[(lagnaRashiIdx + hNum - 1) % 12] ?? 28;
  const savByHouse = {
    1: getSav(1),
    2: getSav(2),
    5: getSav(5),
    7: getSav(7),
    10: getSav(10),
    11: getSav(11)
  } as const;

  // 3. Functional Lagna nature
  const mahaFunctionalNature = lagnaPlanetNature[rawMaha] || "NEUTRAL";
  const bhuktiFunctionalNature = lagnaPlanetNature[rawBhukti] || "NEUTRAL";
  const mahaNatureLabel = FUNCTIONAL_NATURE_6L[mahaFunctionalNature][targetLang];
  const bhuktiNatureLabel = FUNCTIONAL_NATURE_6L[bhuktiFunctionalNature][targetLang];

  // 4. Combustion (Asta), Retrograde (Vakri), Exalted, Own Sign, Vargottama
  const combustRaw: string[] = [];
  const retroRaw: string[] = [];
  const exaltedRaw: string[] = [];
  const ownSignRaw: string[] = [];
  const vargottamaRaw: string[] = [];

  for (const pp of precisionPlanets) {
    const pName = String(pp.planet);
    if (pp.isRetrograde && pName !== "Rahu" && pName !== "Ketu") {
      retroRaw.push(pName);
    }

    if (pName !== "Sun" && pName !== "Rahu" && pName !== "Ketu") {
      const diff = Math.abs(pp.longitude - sunLon) % 360;
      const arc = diff > 180 ? 360 - diff : diff;
      const orb =
        pName === "Moon"
          ? 12
          : pName === "Mars"
          ? 17
          : pName === "Mercury"
          ? pp.isRetrograde
            ? 12
            : 14
          : pName === "Jupiter"
          ? 11
          : pName === "Venus"
          ? pp.isRetrograde
            ? 8
            : 10
          : 15;
      if (arc <= orb) {
        combustRaw.push(pName);
      }
    }

    if (EXALT_RASHI_BY_PLANET[pName] === pp.rashi) {
      exaltedRaw.push(pName);
    }
    if (OWN_RASHIS_BY_PLANET[pName]?.includes(pp.rashi)) {
      ownSignRaw.push(pName);
    }

    const d9Rashi = Math.floor((((pp.longitude % 360) + 360) % 360) / (30 / 9)) % 12;
    if (d9Rashi === pp.rashi) {
      vargottamaRaw.push(pName);
    }
  }

  const localizePlanets = (arr: string[]) => arr.map((p) => GRAHA_6L[p]?.[targetLang] || p);
  const combustPlanetsLocalized = localizePlanets(combustRaw);
  const retroPlanetsLocalized = localizePlanets(retroRaw);
  const exaltedPlanetsLocalized = localizePlanets(exaltedRaw);
  const ownSignPlanetsLocalized = localizePlanets(ownSignRaw);
  const vargottamaPlanetsLocalized = localizePlanets(vargottamaRaw);

  // 5. Gandanta & Rashi Sandhi Degree Vulnerability
  const gandantaPointsLocalized: string[] = [];
  const sandhiPointsLocalized: string[] = [];
  const lagnaWord = pick6(
    { kn: "ಜನ್ಮ ಲಗ್ನ", mr: "जन्म लग्न", hi: "जन्म लग्न", te: "జన్మ లగ్నం", ta: "ஜென்ம லக்னம்", en: "Ascendant" },
    targetLang
  );
  const lagnaDegInSign = ((result.ascendant || 15) % 30 + 30) % 30;
  const lagnaVuln = getDegreeVulnerability(lagnaRashiIdx, lagnaDegInSign);
  if (lagnaVuln.isGandanta) gandantaPointsLocalized.push(lagnaWord);
  else if (lagnaVuln.isRashiSandhi) sandhiPointsLocalized.push(lagnaWord);

  for (const pp of precisionPlanets) {
    const vul = getDegreeVulnerability(pp.rashi, pp.degreeInSign);
    const label = GRAHA_6L[pp.planet]?.[targetLang] || pp.planet;
    if (vul.isGandanta) gandantaPointsLocalized.push(label);
    else if (vul.isRashiSandhi) sandhiPointsLocalized.push(label);
  }

  // 6. Live Today's Tarabala & Chandrashtama
  const liveTarabala = calculateLiveTodayTarabalaAndChandrashtama(moonNakIdx, moonRashiIdx, now, targetLang);
  const taraEntry = TARA_NAMES_7L[liveTarabala.taraNumber]?.[targetLang] || TARA_NAMES_7L[liveTarabala.taraNumber]?.en;
  const taraLabelLocalized = taraEntry?.name || liveTarabala.taraName;
  const taraGuidanceLocalized = taraEntry?.desc || liveTarabala.guidanceText;

  // 7. Rahu & Ketu Dispositors
  const rahuPos = precisionPlanets.find((p) => p.planet === "Rahu");
  const ketuPos = precisionPlanets.find((p) => p.planet === "Ketu");
  const rahuDispGraha = signLord(rahuPos?.rashi ?? 0);
  const ketuDispGraha = signLord(ketuPos?.rashi ?? 6);
  const rahuDispPos = precisionPlanets.find((p) => p.planet === rahuDispGraha);
  const ketuDispPos = precisionPlanets.find((p) => p.planet === ketuDispGraha);
  const rahuDispositorName = GRAHA_6L[rahuDispGraha]?.[targetLang] || rahuDispGraha;
  const ketuDispositorName = GRAHA_6L[ketuDispGraha]?.[targetLang] || ketuDispGraha;
  const rahuDispositorHouse = rahuDispPos?.rashiHouse ?? 1;
  const ketuDispositorHouse = ketuDispPos?.rashiHouse ?? 7;

  // 8. Summaries for User Details Dossier
  const noneText = pick6(
    { kn: "ಶುಭ ಸಮಸ್ಥಿತಿ (ವಿಶೇಷ ದೋಷವಿಲ್ಲ)", mr: "संतुलित स्थिती", hi: "संतुलित स्थिति", te: "సమతుల్య స్థితి", ta: "சமநிலை (தோஷமில்லை)", en: "Balanced (None Active)" },
    targetLang
  );

  const dignifiedAll = Array.from(new Set([...exaltedPlanetsLocalized, ...ownSignPlanetsLocalized, ...vargottamaPlanetsLocalized]));
  const dignifiedSummary =
    dignifiedAll.length > 0
      ? dignifiedAll.join(", ")
      : pick6(
          { kn: "ಮಿತ್ರ ರಾಶಿ ಸ್ಥಿರ ಬಲ", mr: "मित्र राशी स्थिर बळ", hi: "मित्र राशि स्थिर बल", te: "మిత్ర రాశి స్థిర బలం", ta: "நட்பு ராசி பலம்", en: "Harmonious Friendly Dignity" },
          targetLang
        );

  const retroText = retroPlanetsLocalized.length > 0
    ? `${pick6({ kn: "ವಕ್ರ", mr: "वक्री", hi: "वक्री", te: "వక్ర", ta: "வக்ர", en: "Retro" }, targetLang)}: ${retroPlanetsLocalized.join(", ")}`
    : "";
  const combustText = combustPlanetsLocalized.length > 0
    ? `${pick6({ kn: "ಅಸ್ತ", mr: "अस्त", hi: "अस्त", te: "అస్తంగత", ta: "அஸ்தமனம்", en: "Combust" }, targetLang)}: ${combustPlanetsLocalized.join(", ")}`
    : "";
  const retroCombustSummary = [retroText, combustText].filter(Boolean).join(" • ") || noneText;

  const gandantaSummary =
    gandantaPointsLocalized.length > 0
      ? `${pick6({ kn: "ಗಂಡಾಂತ ಸಂಧಿ", mr: "गंडांत संधी", hi: "गंडांत संधि", te: "గండాంత సంధి", ta: "கண்டாந்த சந்தி", en: "Gandanta" }, targetLang)}: ${gandantaPointsLocalized.join(", ")}`
      : sandhiPointsLocalized.length > 0
      ? `${pick6({ kn: "ರಾಶಿ ಸಂಧಿ", mr: "राशी संधी", hi: "राशि संधि", te: "రాశి సంధి", ta: "ராசி சந்தி", en: "Sandhi" }, targetLang)}: ${sandhiPointsLocalized.join(", ")}`
      : noneText;

  const badhakaSummary = pick6(
    {
      kn: `${n(badhakaHouse)}ನೇ ಭಾವ (${badhakaInfo.lordName} • ${n(badhakaInfo.placedHouse)}ನೇ ಮನೆ)`,
      mr: `${n(badhakaHouse)}वे स्थान (${badhakaInfo.lordName} • ${n(badhakaInfo.placedHouse)}वे घर)`,
      hi: `${n(badhakaHouse)}वां भाव (${badhakaInfo.lordName} • ${n(badhakaInfo.placedHouse)}वें में)`,
      te: `${n(badhakaHouse)}వ భావం (${badhakaInfo.lordName} • ${n(badhakaInfo.placedHouse)}వ స్థానం)`,
      ta: `${n(badhakaHouse)}-ம் பாவம் (${badhakaInfo.lordName} • ${n(badhakaInfo.placedHouse)}-ம் வீடு)`,
      en: `House ${badhakaHouse} (${badhakaInfo.lordName} in H${badhakaInfo.placedHouse})`
    },
    targetLang
  );

  const savSummaryText = pick6(
    {
      kn: `ಲಗ್ನ ${n(savByHouse[1])} • ಧನ ${n(savByHouse[2])} • ಕರ್ಮ ${n(savByHouse[10])} • ಲಾಭ ${n(savByHouse[11])} ಬಿಂದು`,
      mr: `लग्न ${n(savByHouse[1])} • धन ${n(savByHouse[2])} • कर्म ${n(savByHouse[10])} • लाभ ${n(savByHouse[11])} बिंदू`,
      hi: `लग्न ${n(savByHouse[1])} • धन ${n(savByHouse[2])} • कर्म ${n(savByHouse[10])} • लाभ ${n(savByHouse[11])} बिंदू`,
      te: `లగ్నం ${n(savByHouse[1])} • ధనం ${n(savByHouse[2])} • కర్మ ${n(savByHouse[10])} • లాభం ${n(savByHouse[11])} బిందువులు`,
      ta: `லக்னம் ${n(savByHouse[1])} • தனம் ${n(savByHouse[2])} • தொழில் ${n(savByHouse[10])} • லாபம் ${n(savByHouse[11])} பரல்கள்`,
      en: `H1 ${savByHouse[1]} • H2 ${savByHouse[2]} • H10 ${savByHouse[10]} • H11 ${savByHouse[11]} Bindus`
    },
    targetLang
  );

  const chandrashtamaWarning = liveTarabala.isChandrashtama
    ? pick6(
        {
          kn: "ಇಂದು ಚಂದ್ರಾಷ್ಟಮ ಸಂಚಾರ: ತಾಳ್ಮೆ ಮತ್ತು ಮಂತ್ರ ಸ್ಮರಣೆ ಉತ್ತಮ",
          mr: "आज चंद्राष्टम प्रभाव: संयम व मनःशांती राखा",
          hi: "आज चंद्राष्टम प्रभाव: धैर्य एवं मंत्र स्मरण श्रेष्ठ",
          te: "నేడు చంద్రాష్టమ ప్రభావం: నిదానం అవసరం",
          ta: "இன்று சந்திராஷ்டமம்: பொறுமையும் அமைதியும் அவசியம்",
          en: "Chandrashtama Active Today: Maintain Serenity & Patience"
        },
        targetLang
      )
    : undefined;

  return {
    badhakaHouse,
    badhakaInfo,
    house1Info,
    house4Info,
    house8Info,
    house9Info,
    house12Info,
    savByHouse,
    mahaFunctionalNature,
    bhuktiFunctionalNature,
    mahaNatureLabel,
    bhuktiNatureLabel,
    combustPlanetsLocalized,
    retroPlanetsLocalized,
    exaltedPlanetsLocalized,
    ownSignPlanetsLocalized,
    vargottamaPlanetsLocalized,
    gandantaPointsLocalized,
    sandhiPointsLocalized,
    liveTarabala,
    taraLabelLocalized,
    taraGuidanceLocalized,
    rahuDispositorName,
    rahuDispositorHouse,
    ketuDispositorName,
    ketuDispositorHouse,
    precisionProfileSummary: {
      liveTarabalaHeadline: `${taraLabelLocalized} (${n(liveTarabala.score)}%)`,
      liveTarabalaBadge: taraGuidanceLocalized,
      isChandrashtama: liveTarabala.isChandrashtama,
      chandrashtamaWarning,
      mahaFunctionalStatus: mahaNatureLabel,
      badhakaSummary,
      dignifiedSummary,
      retroCombustSummary,
      gandantaSummary,
      savSummaryText
    }
  };
}

/**
 * Generates deeply personal, emotionally reassuring Cover Page narration
 * establishing that the booklet belongs exclusively to the devotee.
 */
export function buildBookletCoverContent(params: {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lagnaName: string;
  moonRashi: string;
  nakshatraName: string;
  nakshatraPada: number;
  targetLang: SixLang;
}): BookletCoverContent {
  const {
    devoteeName,
    birthDate,
    birthTime,
    birthPlace,
    lagnaName,
    moonRashi,
    nakshatraName,
    nakshatraPada,
    targetLang
  } = params;
  const n = (v: number | string) => formatDigits(v, targetLang);

  return {
    brandBannerTitle: pick6(
      {
        kn: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥",
        mr: "॥ बग्गोण पंचांग ॥",
        hi: "॥ बग्गोण पंचांग ॥",
        te: "॥ బగ్గోణ పంచాంగం ॥",
        ta: "✦ பக்கோண பஞ்சாங்கம் ✦",
        en: "BAGGONA PANCHANGA"
      },
      targetLang
    ),
    kshetraSubtitle: pick6(
      {
        kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ • ಶುದ್ಧ ಪರಾಶರ ಹಾಗೂ ದಕ್ಷಿಣ ಭಾರತೀಯ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ",
        mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर सानिध्य • पाराशरी व दक्षिण भारतीय ज्योतिष पीठ",
        hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर सान्निध्य • शुद्ध पाराशरी एवं दक्षिण भारतीय ज्योतिष पीठ",
        te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం • పరాశర జ్యోతిష పీఠం",
        ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதி • பாரம்பரிய பராசர ஜோதிட பீடம்",
        en: "Sri Kshetra Gokarna Mahabaleshwara Sannidhana • Heritage Parashari & South Indian Jyotish Peetha"
      },
      targetLang
    ),
    exclusiveForTag: pick6(
      {
        kn: "ಕೇವಲ ನಿಮಗಾಗಿ ಮಾತ್ರ ಸಿದ್ಧಪಡಿಸಲಾದ ವೈಯಕ್ತಿಕ ಜಾತಕ ಪುಸ್ತಕ (ನಿಮ್ಮ ಸ್ವಂತ ಸಂಗ್ರಹಕ್ಕೆ)",
        mr: "केवळ आपल्यासाठी विशेषतः तयार केलेला वैयक्तिक ग्रंथ (फक्त आपल्या संग्रहासाठी)",
        hi: "विशेष रूप से केवल आपके लिए निर्मित पवित्र जन्मकुंडली पुस्तिका (निजी संग्रह हेतु)",
        te: "కేవలం మీ కోసం మాత్రమే రూపొందించబడిన పవిత్ర జాతక పుస్తకం (వ్యక్తిగత పత్రం)",
        ta: "உங்களுக்காக மட்டுமே பிரத்யேகமாக உருவாக்கப்பட்ட புனித ஜாதக நூல் (தனிப்பட்ட தொகுப்பு)",
        en: "PERSONALIZED SACRED FOLIO • PREPARED EXCLUSIVELY FOR YOUR PRIVATE KEEPING"
      },
      targetLang
    ),
    bookletEditionLine: pick6(
      {
        kn: `${devoteeName} ರವರ ಜನ್ಮ ಕುಂಡಲಿ ಸಾರಾಂಶ ಗ್ರಂಥ • ಪವಿತ್ರ ಗೋಕರ್ಣ ಆವೃತ್ತಿ`,
        mr: `${devoteeName} यांचा संपूर्ण जीवन-दिग्दर्शन ग्रंथ • पावन गोकर्ण आवृत्ती`,
        hi: `${devoteeName} की संपूर्ण जीवन-दिग्दर्शन पुस्तिका • पावन गोकर्ण संस्करण`,
        te: `${devoteeName} గారి సమగ్ర జాతక పుస్తకం • పవిత్ర గోకర్ణ సంచిక`,
        ta: `${devoteeName} அவர்களின் முழுமையான வாழ்க்கை வழிகாட்டி நூல் • கோகர்ண பதிப்பு`,
        en: `Private Destiny Compendium of ${devoteeName} • Sacred Gokarna Sanctuary Edition`
      },
      targetLang
    ),
    personalAssurancePara1: pick6(
      {
        kn: `ಪ್ರೀತಿಯ ${devoteeName}, ಈ ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಮಹಾ ಜಾತಕ ಗ್ರಂಥವು ಯಾವುದೇ ಸಾಮಾನ್ಯ ವರದಿಯಲ್ಲ — ಇದು ${n(birthDate)} ರಂದು ${n(birthTime)} ಗಂಟೆಗೆ ${birthPlace} ಪುಣ್ಯಭೂಮಿಯಲ್ಲಿ ನೀವು ಪ್ರಥಮ ಶ್ವಾಸವನ್ನು ತೆಗೆದುಕೊಂಡ ಕ್ಷಣದ ನಿಖರ ನಕ್ಷತ್ರ-ಗ್ರಹ ಸ್ಥಿತಿಗಳಿಂದ ಕೇವಲ ನಿಮಗಾಗಿ ಮಾತ್ರ ಹೆಣೆಯಲ್ಪಟ್ಟ ಜೀವನ ದರ್ಪಣವಾಗಿದೆ. ನಿಮ್ಮ ${lagnaName} ಲಗ್ನ, ${moonRashi} ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ನಕ್ಷತ್ರದ ಸೂಕ್ಷ್ಮ ತರಂಗಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ, ನಿಮ್ಮ ಸ್ವಂತ ಆತ್ಮದ ಕೈಪಿಡಿಯಾಗಿ ರಕ್ಷಿಸಿಟ್ಟುಕೊಳ್ಳಲು ಈ ಪುಸ್ತಕವನ್ನು ಭಕ್ತಿಯಿಂದ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`,
        mr: `प्रिय ${devoteeName}, ही २५ अध्यायांची महा-जन्मपत्रिका पुस्तिका केवळ आपल्यासाठीच घडवलेली एक अद्वितीय जीवन-नोंद आहे. दिनांक ${n(birthDate)} रोजी ${n(birthTime)} वाजता ${birthPlace} येथे आपण घेतलेल्या पहिल्या श्वासाच्या अचूक ग्रहस्थितीवरून हा ग्रंथ तयार केला आहे. आपले ${lagnaName} लग्न, ${moonRashi} चंद्र राशी व ${nakshatraName} (चरण ${n(nakshatraPada)}) नक्षत्राच्या सूक्ष्म स्पंदनांचा अभ्यास करून केवळ आपल्या वैयक्तिक जपवणुकीसाठी ही अमृतपुस्तिका अर्पण केली आहे.`,
        hi: `प्रिय ${devoteeName}, यह संपूर्ण २५-अध्यायीय महा-जन्मकुंडली पुस्तिका कोई सामान्य विवरण नहीं, अपितु केवल आपके लिए निर्मित आपके जीवन का प्रामाणिक दर्पण है। दिनांक ${n(birthDate)} को ${n(birthTime)} बजे ${birthPlace} में आपके जन्म क्षण की शुद्ध खगोलीय गणनाओं के आधार पर यह ग्रंथ रचा गया है। आपके ${lagnaName} लग्न, ${moonRashi} चंद्र राशि एवं ${nakshatraName} (पाद ${n(nakshatraPada)}) की सूक्ष्म तरंगों को संजोकर यह अमूल्य धरोहर केवल आपकी निजी सहेज के लिए तैयार की गई है।`,
        te: `ప్రియమైన ${devoteeName}, ఈ 25 అధ్యాయాల సంపూర్ణ జాతక పుస్తకం కేవలం మీ కోసం మాత్రమే రూపొందించబడిన పవిత్ర జీవన దర్పణం. ${n(birthDate)} నాడు ${n(birthTime)} గంటలకు ${birthPlace} లో మీరు జన్మించిన ఖచ్చితమైన గ్రహ స్థితుల ఆధారంగా, మీ ${lagnaName} లగ్నం, ${moonRashi} చంద్ర రాశి మరియు ${nakshatraName} (${n(nakshatraPada)}వ పాదం) ఆధారంగా దీనిని మీ వ్యక్తిగత భద్రత మరియు మార్గదర్శనం కోసం ఎంతో శ్రద్ధతో సిద్ధం చేశాము.`,
        ta: `அன்புள்ள ${devoteeName}, இந்த 25 அத்தியாய மகா ஜாதக நூல் பொதுவான அறிக்கை அல்ல; ${n(birthDate)} அன்று ${n(birthTime)} மணிக்கு ${birthPlace} புண்ணிய மண்ணில் நீங்கள் பிறந்த துல்லியமான வானியல் கணக்கீட்டின்படி உங்களுக்காக மட்டுமே உருவாக்கப்பட்ட வாழ்க்கைக் கண்ணாடியாகும். உங்கள் ${lagnaName} லக்னம், ${moonRashi} சந்திர ராசி மற்றும் ${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) நட்சத்திர அதிர்வுகளைக் கணித்து உங்கள் தனிப்பட்ட பாதுகாப்பிற்காக இது அன்புடன் படைக்கப்பட்டுள்ளது.`,
        en: `Dear ${devoteeName}, this 25-Chapter Sampoorna Destiny Booklet is not an impersonal printout — it is a sacred mirror crafted solely for you from the exact celestial sky above ${birthPlace} at ${birthTime} on ${birthDate}. Computed directly from your ${lagnaName} Ascendant, ${moonRashi} Moon, and ${nakshatraName} (Pada ${nakshatraPada}), every page is dedicated exclusively for your personal keeping.`
      },
      targetLang
    ),
    personalAssurancePara2: pick6(
      {
        kn: `ನೀವು ಮನಸ್ಸಿನಲ್ಲೇ ಮೌನವಾಗಿ ಹೊತ್ತಿರುವ ಕನಸುಗಳು, ಯಾರಿಗೂ ಹೇಳಿಕೊಳ್ಳದ ತ್ಯಾಗಗಳು ಹಾಗೂ ಕಳೆದ ದಿನಗಳಲ್ಲಿ ಎದುರಿಸಿದ ಪರೀಕ್ಷೆಗಳನ್ನು ಈ ಗ್ರಂಥವು ಅತ್ಯಂತ ಗೌರವದಿಂದ ಅರ್ಥೈಸುತ್ತದೆ. ಪ್ರತಿ ಪುಟವೂ ನಿಮಗೆ ಭರವಸೆಯ ದೀಪವಾಗಿರಲಿ — ನೀವು ಒಂಟಿಯಲ್ಲ; ಧರ್ಮ, ದೈವ ಕೃಪೆ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಅನಂತ ರಕ್ಷಣೆ ಸದಾ ನಿಮ್ಮ ನೆರಳಾಗಿ ನಿಂತಿದೆ ಎಂಬ ದೃಢ ನಂಬಿಕೆಯೊಂದಿಗೆ ಮುಂದಿನ ಅಧ್ಯಾಯಗಳನ್ನು ಓದಿರಿ.`,
        mr: `आपण मनात जपलेले मौन कष्ट, कोणाशीही न बोललेले त्याग आणि अनुभवलेले कठीण प्रसंग यांना ही पुस्तिका अत्यंत संवेदनशीलतेने न्याय देते. हे प्रत्येक पान आपल्यासाठी आशेचा शांत दिवा ठरो — आपण एकटे नाही आहात; धर्म, आत्मबल आणि श्री क्षेत्र गोकर्ण महाबळेश्वराची अखंड कृपा सदैव आपल्या पाठीशी आहे, या विश्वासाने पुढील अध्याय वाचा.`,
        hi: `जीवन में आपने जो मूक संघर्ष सहे हैं, जो अनकहे त्याग किए हैं और जो आशाएं हृदय में संजोई हैं, यह पुस्तिका उन सबका आदरपूर्वक मार्गदर्शन करती है। इसका प्रत्येक पृष्ठ आपके लिए एक आश्वस्त करने वाला दीप बने — आप कभी अकेले नहीं हैं; श्री क्षेत्र गोकर्ण महाबलेश्वर की कृपा एवं सनातन ज्योतिष का प्रकाश सदैव आपके साथ है।`,
        te: `మీరు మౌనంగా చేసిన త్యాగాలు, ఎవరికీ చెప్పుకోలేని బాధలు మరియు భవిష్యత్తుపై ఉన్న ఆశలను ఈ గ్రంథం ఎంతో గౌరవంతో అర్థం చేసుకుంటుంది. ఇందులోని ప్రతి పుట మీకు ఒక భరోసా దీపంలా నిలవాలని, శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వరుని దివ్య రక్షణ ఎల్లప్పుడూ మీకు అండగా ఉంటుందని మనసారా ఆకాంక్షిస్తున్నాము.`,
        ta: `நீங்கள் மனதிற்குள் சுமந்த மௌனத் தியாகங்களும், யாரிடமும் பகிராத கவலைகளும் இந்த நூலில் கருணையுடன் அணுகப்பட்டுள்ளன. இதன் ஒவ்வொரு பக்கமும் உங்களுக்கு நம்பிக்கை ஒளியாக இருக்கட்டும் — நீங்கள் தனிமையில் இல்லை; ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் பேரருள் எப்போதும் உங்களைப் பாதுகாக்கும் என்ற மன உறுதியுடன் தொடர்ந்து படியுங்கள்.`,
        en: `Every silent prayer you have whispered and every unseen sacrifice you carried finds compassionate validation within these pages. Keep this manuscript beside you as an assuring lamp whenever clarity feels distant — you never walk alone beneath the eternal sanctuary and grace of Sri Kshetra Gokarna Mahabaleshwara.`
      },
      targetLang
    ),
    sealHeading: pick6(
      {
        kn: "ಆಶೀರ್ವಾದದ ಮುದ್ರೆ • ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
        mr: "आशीर्वाद मुद्रा • वेदमूर्ती चैतन्य पंडित • श्री क्षेत्र गोकर्ण",
        hi: "आशीर्वाद मुद्रा • वेदमूर्ति चैतन्य पंडित • श्री क्षेत्र गोकर्ण",
        te: "ఆశీర్వాద ముద్ర • వేదమూర్తి చైతన్య పండిత్ • శ్రీ క్షేత్ర గోకర్ణ",
        ta: "ஆசீர்வாத முத்திரை • வேதமூர்த்தி சைதன்ய பண்டிதர் • ஸ்ரீ கோகர்ண",
        en: "Blessed & Sealed • Veda Moorthy Chaitanya Pandit • Sri Kshetra Gokarna"
      },
      targetLang
    ),
    confidentialFooterNote: pick6(
      {
        kn: "ವೈಯಕ್ತಿಕ ಹಾಗೂ ಗೌಪ್ಯ ಜಾತಕ ಪ್ರತಿಯು ಕೇವಲ ಜಾತಕರ ಹಿತಕ್ಕಾಗಿ ಮೀಸಲಾಗಿದೆ",
        mr: "ही वैयक्तिक व गोपनीय पत्रिका केवळ जातकांच्या हितासाठी तयार केली आहे",
        hi: "यह व्यक्तिगत एवं गोपनीय कुंडली प्रति केवल जातक के कल्याण हेतु समर्पित है",
        te: "ఈ వ్యక్తిగత మరియు గోప్యమైన జాతక పుస్తకం కేవలం మీ శ్రేయస్సు కొరకే",
        ta: "இந்த தனிப்பட்ட ஜாதக நூல் ஜாதகரின் நலனுக்காக மட்டுமே பிரத்யேகமாக வழங்கப்படுகிறது",
        en: "Private Personal Edition • Dedicated Exclusively for the Native's Guidance & Peace"
      },
      targetLang
    )
  };
}

/**
 * Generates chapter-specific astronomical verification pills and a deep 5-6 line
 * precision synthesis paragraph anchored directly in real natal/transit math.
 */
export function buildChapterPrecisionEnrichment(params: {
  chapterNumber: number;
  targetLang: SixLang;
  devoteeName: string;
  lagnaRashiName: string;
  moonRashiName: string;
  nakshatraName: string;
  nakshatraPada: number;
  currentHoraPlanet: string;
  currentMahadasha: string;
  currentBhuktiLord: string;
  bhuktiEndDate: string;
  yogiPlanetName: string;
  avayogiPlanetName: string;
  bhriguBinduRashiName: string;
  bhriguDeg: string;
  maandiHouse: number;
  maandiRashiName: string;
  shaniTransitRashi: string;
  shaniHouseFromMoon: number;
  shaniTransitSav: number;
  guruTransitRashi: string;
  guruHouseFromMoon: number;
  guruTransitSav: number;
  rahuHouseFromMoon: number;
  house10Info: HouseLordPlacementInfo;
  house2Info: HouseLordPlacementInfo;
  house11Info: HouseLordPlacementInfo;
  house7Info: HouseLordPlacementInfo;
  house5Info: HouseLordPlacementInfo;
  house6Info: HouseLordPlacementInfo;
  isMinor: boolean;
  isChildOrInfant: boolean;
  isSenior: boolean;
  ext: ExtendedPrecisionMetrics;
}): { extraParagraphs: string[]; precisionAnchors: string[] } {
  const {
    chapterNumber,
    targetLang,
    devoteeName,
    lagnaRashiName,
    moonRashiName,
    nakshatraName,
    nakshatraPada,
    currentHoraPlanet,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    yogiPlanetName,
    avayogiPlanetName,
    bhriguBinduRashiName,
    bhriguDeg,
    maandiHouse,
    maandiRashiName,
    shaniTransitRashi,
    shaniHouseFromMoon,
    shaniTransitSav,
    guruTransitRashi,
    guruHouseFromMoon,
    guruTransitSav,
    house10Info,
    house2Info,
    house11Info,
    house7Info,
    house5Info,
    house6Info,
    isMinor,
    isChildOrInfant,
    isSenior,
    ext
  } = params;

  const n = (v: number | string) => formatDigits(v, targetLang);
  const {
    badhakaHouse,
    badhakaInfo,
    house1Info,
    house4Info,
    house8Info,
    house9Info,
    house12Info,
    savByHouse,
    mahaNatureLabel,
    bhuktiNatureLabel,
    combustPlanetsLocalized,
    retroPlanetsLocalized,
    exaltedPlanetsLocalized,
    vargottamaPlanetsLocalized,
    gandantaPointsLocalized,
    sandhiPointsLocalized,
    liveTarabala,
    taraLabelLocalized,
    taraGuidanceLocalized,
    rahuDispositorName,
    rahuDispositorHouse,
    ketuDispositorName,
    ketuDispositorHouse
  } = ext;

  const dignStr =
    exaltedPlanetsLocalized.length > 0
      ? exaltedPlanetsLocalized.join(", ")
      : vargottamaPlanetsLocalized.length > 0
      ? vargottamaPlanetsLocalized.join(", ")
      : house1Info.lordName;

  const retroNote =
    retroPlanetsLocalized.length > 0
      ? pick6(
          {
            kn: `ವಕ್ರ ಗ್ರಹ ಬಲ (${retroPlanetsLocalized.join(", ")}) ತೀವ್ರ ಆಂತರಿಕ ಸಂಕಲ್ಪವನ್ನು ನೀಡುತ್ತದೆ`,
            mr: `वक्री ग्रह (${retroPlanetsLocalized.join(", ")}) आंतरिक जिद्द व चिकाटी वाढवतात`,
            hi: `वक्री ग्रहों (${retroPlanetsLocalized.join(", ")}) का चेष्टा बल आंतरिक दृढ़ता देता है`,
            te: `వక్ర గ్రహాలు (${retroPlanetsLocalized.join(", ")}) ఆంతరంగిక పట్టుదలను పెంచుతాయి`,
            ta: `வக்ர கிரகங்கள் (${retroPlanetsLocalized.join(", ")}) ஆழ்ந்த மன உறுதியைத் தருகின்றன`,
            en: `retrograde Chesta Bala (${retroPlanetsLocalized.join(", ")}) intensifies inner resolve`
          },
          targetLang
        )
      : pick6(
          {
            kn: `ನೇರ ಗ್ರಹ ಚಲನೆಯು ಪ್ರಯತ್ನಗಳಿಗೆ ಸ್ಪಷ್ಟ ಫಲಿತಾಂಶ ತರುತ್ತದೆ`,
            mr: `सरळ ग्रहगतीमुळे प्रयत्नांना स्पष्ट दिशा मिळते`,
            hi: `मार्गी ग्रह गति प्रयासों को सीधा एवं स्पष्ट परिणाम देती है`,
            te: `గ్రహాల ప్రత్యక్ష గతి ప్రయత్నాలకు స్పష్టమైన ఫలితాన్ని ఇస్తుంది`,
            ta: `நேர்க்கோட்டு கிரக சஞ்சாரம் முயற்சிகளுக்குத் தெளிவான பலன் தரும்`,
            en: `direct planetary pacing converts steady effort cleanly into external clarity`
          },
          targetLang
        );

  const combustNote =
    combustPlanetsLocalized.length > 0
      ? pick6(
          {
            kn: `ಅಸ್ತಂಗತ ಸ್ಥಿತಿಯಲ್ಲಿರುವ (${combustPlanetsLocalized.join(", ")}) ಗ್ರಹಗಳು ತಕ್ಷಣದ ಬಾಹ್ಯ ಪ್ರದರ್ಶನಕ್ಕಿಂತ ಮೌನ ಸಾಧನೆಯ ಮೂಲಕ ಯಶಸ್ಸು ನೀಡುತ್ತವೆ`,
            mr: `अस्त स्थितीतील (${combustPlanetsLocalized.join(", ")}) ग्रह दिखाव्यापेक्षा शांत आणि सातत्यपूर्ण कार्यातून यश देतात`,
            hi: `अस्त अवस्था के ग्रह (${combustPlanetsLocalized.join(", ")}) बाह्य प्रदर्शन की अपेक्षा शांत साधना से सिद्धि देते हैं`,
            te: `అస్తంగత గ్రహాలు (${combustPlanetsLocalized.join(", ")}) ఆడంబరం కంటే మౌన శ్రమ ద్వారా ఫలితాలనిస్తాయి`,
            ta: `அஸ்தமன கிரகங்கள் (${combustPlanetsLocalized.join(", ")}) ஆரவாரமின்றி அமைதியான உழைப்பால் வெற்றியைத் தரும்`,
            en: `combust placements (${combustPlanetsLocalized.join(", ")}) reward quiet inward integrity rather than noisy publicity`
          },
          targetLang
        )
      : pick6(
          {
            kn: `ಪ್ರಮುಖ ಗ್ರಹಗಳು ಅಸ್ತಂಗತ ದೋಷದಿಂದ ಮುಕ್ತವಾಗಿ ಪೂರ್ಣ ತೇಜಸ್ಸಿನೊಂದಿಗೆ ಫಲ ನೀಡುತ್ತವೆ`,
            mr: `प्रमुख ग्रह अस्त दोषापासून मुक्त असून पूर्ण तेजाने शुभ फळ देण्यास समर्थ आहेत`,
            hi: `प्रमुख ग्रह अस्त दोष से मुक्त रहकर अपना पूर्ण स्वाभाविक तेज प्रकट कर रहे हैं`,
            te: `ప్రధాన గ్రహాలు అస్తంగత దోషం లేకుండా సంపూర్ణ బలంతో ఫలితాలను ఇస్తున్నాయి`,
            ta: `முக்கிய கிரகங்கள் அஸ்தமன தோஷமின்றி முழு ஒளியுடன் சுப பலன்களை வழங்கும்`,
            en: `key planetary lords remain uncombusted, operating at full radiant luminance`
          },
          targetLang
        );

  const knotNote =
    gandantaPointsLocalized.length > 0
      ? pick6(
          {
            kn: `ಗಂಡಾಂತ ಸಂಧಿ (${gandantaPointsLocalized.join(", ")}) ಇರುವುದರಿಂದ ತೀವ್ರ ಭಾವನಾತ್ಮಕ ತಿರುವುಗಳಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಶಿವ ಸ್ಮರಣೆ ಅಗತ್ಯ`,
            mr: `गंडांत संधी (${gandantaPointsLocalized.join(", ")}) असल्याने संवेदनशील टप्प्यांवर शांतता व शिवस्मरण हितावह`,
            hi: `गंडांत संधि (${gandantaPointsLocalized.join(", ")}) की उपस्थिति संवेदनशील मोड़ों पर धैर्य व शिव उपासना की अपेक्षा रखती है`,
            te: `గండాంత సంధి (${gandantaPointsLocalized.join(", ")}) ఉన్నందున భావోద్వేగ మలుపుల్లో శివ స్మరణ రక్షణ ఇస్తుంది`,
            ta: `கண்டாந்த சந்தி (${gandantaPointsLocalized.join(", ")}) உள்ளதால் முக்கிய திருப்பங்களில் சிவ வழிபாடு பாதுகாப்பளிக்கும்`,
            en: `Gandanta sensitivity (${gandantaPointsLocalized.join(", ")}) deepens psychic depth while calling for calm spiritual anchors at major turns`
          },
          targetLang
        )
      : sandhiPointsLocalized.length > 0
      ? pick6(
          {
            kn: `ರಾಶಿ ಸಂಧಿ ಸ್ಥಾನ (${sandhiPointsLocalized.join(", ")}) ಎರಡು ಜೀವನ ಹಂತಗಳ ನಡುವಿನ ಸೂಕ್ಷ್ಮ ಸೇತುವೆಯಾಗಿದೆ`,
            mr: `राशी संधी (${sandhiPointsLocalized.join(", ")}) दोन अवस्थांमधील सूक्ष्म संक्रमण दर्शवते`,
            hi: `राशि संधि (${sandhiPointsLocalized.join(", ")}) दो अवस्थाओं के मध्य एक सूक्ष्म सेतु का कार्य करती है`,
            te: `రాశి సంధి (${sandhiPointsLocalized.join(", ")}) రెండు దశల మధ్య సున్నిత మార్పును సూచిస్తుంది`,
            ta: `ராசி சந்தி (${sandhiPointsLocalized.join(", ")}) இரு காலகட்டங்களுக்கு இடையிலான நுட்பமான பாலமாகும்`,
            en: `Rashi Sandhi edge (${sandhiPointsLocalized.join(", ")}) reflects transitional subtlety between two distinct evolutionary stages`
          },
          targetLang
        )
      : pick6(
          {
            kn: `ಗ್ರಹಾಂಶಗಳು ರಾಶಿ ಮಧ್ಯದಲ್ಲಿ ಸ್ಥಿರವಾಗಿರುವುದರಿಂದ ಫಲಿತಾಂಶಗಳು ದೃಢ ಹಾಗೂ ನಂಬಿಕಾರ್ಹವಾಗಿರುತ್ತವೆ`,
            mr: `ग्रहांचे अंश राशीच्या मध्यभागी स्थिर असल्याने फळे भक्कम व विश्वासार्ह मिळतात`,
            hi: `ग्रहों के अंश स्थिर अवस्था में होने से जीवन की दिशा स्पष्ट एवं विश्वसनीय रहती है`,
            te: `గ్రహ డిగ్రీలు స్థిరంగా ఉన్నందున ఫలితాలు నమ్మకంగా మరియు స్థిరంగా లభిస్తాయి`,
            ta: `கிரக பாகைகள் உறுதியான நிலையில் இருப்பதால் பலன்கள் நிலையாகவும் நம்பிக்கையாகவும் கிடைக்கும்`,
            en: `clean planetary longitudes away from cusp extremes deliver steady, dependable execution`
          },
          targetLang
        );

  const chBand =
    chapterNumber <= 3
      ? "hook"
      : chapterNumber <= 6
      ? "secret"
      : chapterNumber <= 11
      ? "power"
      : chapterNumber <= 16
      ? "pillar"
      : chapterNumber <= 22
      ? "horizon"
      : "remedy";

  let extraParagraph = "";
  let precisionAnchors: string[] = [];

  if (chBand === "hook") {
    const ch1Extra = pick6(
      {
        kn: `${devoteeName}, ಇಂದಿನ ನಿಖರ ತಾರಾಬಲ ಗಣಿತವನ್ನು ಗಮನಿಸಿದಾಗ ಪ್ರಸ್ತುತ ಚಂದ್ರ ಸಂಚಾರವು ನಿಮ್ಮ ${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ನಕ್ಷತ್ರಕ್ಕೆ '${taraLabelLocalized}' (${n(liveTarabala.score)}% ಶುಭ ಬಲ — ${taraGuidanceLocalized}) ಫಲವನ್ನು ನೀಡುತ್ತಿದೆ. ಅಲ್ಲದೆ ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ ${house1Info.lordName} ${n(house1Info.placedHouse)}ನೇ ಭಾವದಲ್ಲಿದ್ದು (${house1Info.placedRashi}), ${retroNote}. ${knotNote} — ಆದ್ದರಿಂದ ಪ್ರಸ್ತುತ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಯಾವುದೇ ದ್ವಂದ್ವವನ್ನು ಶಾಂತವಾಗಿ ಬಿಡಿಸಿಕೊಂಡು ಮುಂದುವರಿಯಲು ಇದು ಸೂಕ್ತ ದೈವಿಕ ಸೂಚನೆಯಾಗಿದೆ.`,
        mr: `${devoteeName}, आजचे ताराबल गणित पाहिले असता आपल्या ${nakshatraName} (चरण ${n(nakshatraPada)}) नक्षत्रासाठी '${taraLabelLocalized}' (${n(liveTarabala.score)}% अनुकूल बळ — ${taraGuidanceLocalized}) कार्यरत आहे. आपले लग्नेश ${house1Info.lordName} ${n(house1Info.placedHouse)}व्या स्थानात (${house1Info.placedRashi}) स्थित असून, ${retroNote}. तसेच ${knotNote}; त्यामुळे कोणताही ताण न घेता पुढच्या पावलावर विश्वास ठेवणे हाच या क्षणाचा खरा मार्ग आहे.`,
        hi: `${devoteeName}, आज के प्रत्यक्ष ताराबल परीक्षण से विदित होता है कि आपके ${nakshatraName} (पाद ${n(nakshatraPada)}) के सापेक्ष '${taraLabelLocalized}' (${n(liveTarabala.score)}% शुभ बल — ${taraGuidanceLocalized}) सक्रिय है। आपके लग्नेश ${house1Info.lordName} की ${n(house1Info.placedHouse)}वें भाव (${house1Info.placedRashi}) में स्थिति के साथ ${retroNote}। ${knotNote}, अतः मन के संदेह त्यागकर धैर्यपूर्वक कदम बढ़ाना ही इस क्षण का सटीक मार्ग है।`,
        te: `${devoteeName}, ఈనాటి తారాబల గణన ప్రకారం మీ ${nakshatraName} (${n(nakshatraPada)}వ పాదం) నక్షత్రానికి '${taraLabelLocalized}' (${n(liveTarabala.score)}% అనుకూల బలం — ${taraGuidanceLocalized}) నడుస్తోంది. మీ లగ్నాధిపతి ${house1Info.lordName} ${n(house1Info.placedHouse)}వ స్థానంలో (${house1Info.placedRashi}) ఉండి, ${retroNote}. ${knotNote} — కనుక మనసులోని ఆందోళనను వీడి స్థిరంగా ముందుకు సాగండి.`,
        ta: `${devoteeName}, இன்றைய தாராபலக் கணக்கீட்டின்படி உங்கள் ${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) நட்சத்திரத்திற்கு '${taraLabelLocalized}' (${n(liveTarabala.score)}% சுப பலம் — ${taraGuidanceLocalized}) செயல்படுகிறது. உங்கள் லக்னாதிபதி ${house1Info.lordName} ${n(house1Info.placedHouse)}-ம் வீட்டில் (${house1Info.placedRashi}) அமர்ந்து, ${retroNote}. ${knotNote} — ஆகவே மனக்குழப்பம் நீங்கி நம்பிக்கையுடன் செயல்பட இதுவே சரியான தருணம்.`,
        en: `${devoteeName}, real-time Tarabala calculation relative to your natal ${nakshatraName} (Pada ${nakshatraPada}) confirms today activates '${taraLabelLocalized}' (${liveTarabala.score}% cosmic alignment — ${taraGuidanceLocalized}). Simultaneously, your ascendant lord ${house1Info.lordName} positioned in House ${house1Info.placedHouse} (${house1Info.placedRashi}) interacts dynamically where ${retroNote}. Because ${knotNote}, trust that present friction marks a passing threshold rather than permanent defeat.`
      },
      targetLang
    );
    const ch2Extra = pick6(
      {
        kn: `ನಿಮ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಮೇಶ (${house8Info.lordName}, ${n(house8Info.placedHouse)}ನೇ ಮನೆ) ಹಾಗೂ ದ್ವಾದಶೇಶ (${house12Info.lordName}, ${n(house12Info.placedHouse)}ನೇ ಮನೆ) ಪರಸ್ಪರ ಸೂಕ್ಷ್ಮ ಆಂತರಿಕ ಆಳವನ್ನು ನಿರ್ಮಿಸುತ್ತವೆ. ${combustNote}. ನೀವು ಯಾರಿಗೂ ಹೇಳದೆ ಮಾಡಿದ ಮೌನ ಸೇವೆಗಳು ಭಗವಂತನ ಖಾತೆಯಲ್ಲಿ ಪುಣ್ಯವಾಗಿ ಶೇಖರವಾಗಿದ್ದು, ${n(house9Info.placedHouse)}ನೇ ಮನೆಯಲ್ಲಿರುವ ಭಾಗ್ಯಾಧಿಪತಿ ${house9Info.lordName} ಹಾಗೂ ${yogiPlanetName} ಯೋಗಿ ಬಲವು ಸಕಾಲದಲ್ಲಿ ಅದಕ್ಕೆ ಅನಿರೀಕ್ಷಿತ ಪ್ರತಿಫಲ ತಂದುಕೊಡುತ್ತದೆ.`,
        mr: `कुंडलीतील अष्टमेश (${house8Info.lordName}, ${n(house8Info.placedHouse)}वे स्थान) व व्ययेश (${house12Info.lordName}, ${n(house12Info.placedHouse)}वे स्थान) आपली भावनिक खोली व त्यागवृत्ती सिद्ध करतात. ${combustNote}. भाग्याधिपती ${house9Info.lordName} व योगी ग्रह ${yogiPlanetName} यांची कृपा आपल्या न बोललेल्या कष्टांचा योग्य सन्मान नक्कीच मिळवून देईल.`,
        hi: `आपकी कुंडली के अष्टमेश (${house8Info.lordName}, ${n(house8Info.placedHouse)}वां भाव) एवं द्वादशेश (${house12Info.lordName}, ${n(house12Info.placedHouse)}वां भाव) आपके अंतर्मुखी त्याग एवं भावनात्मक गहराई को प्रमाणित करते हैं। ${combustNote}। भाग्येश ${house9Info.lordName} तथा योगी ग्रह ${yogiPlanetName} की सक्रियता आपके निस्वार्थ श्रम का समुचित प्रतिफल सुनिश्चित करती है।`,
        te: `మీ జాతకంలో అష్టమాధిపతి (${house8Info.lordName}, ${n(house8Info.placedHouse)}వ స్థానం) మరియు వ్యయాధిపతి (${house12Info.lordName}, ${n(house12Info.placedHouse)}వ స్థానం) మీ నిస్వార్థ త్యాగాలను సూచిస్తున్నాయి. ${combustNote}. భాగ్యాధిపతి ${house9Info.lordName} మరియు యోగి గ్రహం ${yogiPlanetName} అనుగ్రహంతో మీ మంచితనానికి తగిన గౌరవం లభిస్తుంది.`,
        ta: `உங்கள் ஜாதகத்தில் அஷ்டமாதிபதி (${house8Info.lordName}, ${n(house8Info.placedHouse)}-ம் வீடு) மற்றும் விரயாதிபதி (${house12Info.lordName}, ${n(house12Info.placedHouse)}-ம் வீடு) உங்கள் ஆழ்ந்த தியாக உணர்வைக் காட்டுகின்றன. ${combustNote}. பாக்கியாதிபதி ${house9Info.lordName} மற்றும் யோகி ${yogiPlanetName} அருளால் உங்கள் நல்லுள்ளத்திற்கு உரிய அங்கீகாரம் நிச்சயம் கிடைக்கும்.`,
        en: `Analyzing the subtle depths of 8th lord ${house8Info.lordName} (in House ${house8Info.placedHouse}) and 12th lord ${house12Info.lordName} (in House ${house12Info.placedHouse}) mathematically confirms why others underestimate your silent endurance. Moreover, ${combustNote}. Paired with 9th fortune lord ${house9Info.lordName} and Yogi ${yogiPlanetName}, unseen karmic deposits are ripening toward rightful restitution.`
      },
      targetLang
    );
    const ch3Extra = pick6(
      {
        kn: `ಗತಕಾಲದ ೨೪ ತಿಂಗಳುಗಳನ್ನು ಸರ್ವಾಷ್ಟಕವರ್ಗ ಹಾಗೂ ದಶಾ ನಾಥರ (${currentMahadasha} – ${currentBhuktiLord}) ದೃಷ್ಟಿಯಿಂದ ಪರಿಶೀಲಿಸಿದಾಗ: ಶನಿ ಸಂಚಾರ ರಾಶಿಯ (${shaniTransitRashi}) ${n(shaniTransitSav)} ಬಿಂದುಗಳು ಮತ್ತು ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿಯು ನಿಮ್ಮ ಸಹನೆಯನ್ನು ಕಠಿಣವಾಗಿ ಪರೀಕ್ಷಿಸಿವೆ. ಆದರೆ '${mahaNatureLabel}' ಸ್ವರೂಪದ ${currentMahadasha} ನಾಥನು ಈಗ ಪ್ರಸ್ತುತ ಅಂತರ್ದಶೆ (${bhuktiEndDate} ವರೆಗೆ) ಮುಗಿಯುವ ವೇಳೆಗೆ ಆ ಎಲ್ಲಾ ಪರೀಕ್ಷೆಗಳ ಫಲವನ್ನು ಸ್ಥಿರ ಅನುಭವ ಮತ್ತು ಯಶಸ್ಸಾಗಿ ಪರಿವರ್ತಿಸುತ್ತಾನೆ.`,
        mr: `मागील २४ महिन्यांचे मूल्यमापन अष्टकवर्ग व चालू ${currentMahadasha} – ${currentBhuktiLord} दशेवरून केल्यास: ${shaniTransitRashi} राशीतील ${n(shaniTransitSav)} बिंदू व ${n(maandiHouse)}व्या स्थानातील मांदीने कठीण परीक्षा घेतली. आता '${mahaNatureLabel}' स्वरूपाचे महादशा स्वामी (${bhuktiEndDate} पर्यंत) या सर्व अनुभवांचे रूपांतर भक्कम यशात करतील.`,
        hi: `विगत २४ महीनों का अष्टकवर्ग एवं वर्तमान ${currentMahadasha} – ${currentBhuktiLord} दशा के आधार पर सूक्ष्म निरीक्षण: ${shaniTransitRashi} के ${n(shaniTransitSav)} बिंदुओं और ${n(maandiHouse)}वें भाव की मांदी ने आपके धैर्य की कड़ी कसौटी ली। किंतु '${mahaNatureLabel}' रूप में महादशा स्वामी (${bhuktiEndDate} तक के चरण में) उस तपस्या को स्थायी उपलब्धि में बदल रहे हैं।`,
        te: `గత 24 నెలలను అష్టకవర్గ మరియు ${currentMahadasha} – ${currentBhuktiLord} దశల పరంగా చూస్తే: ${shaniTransitRashi} లోని ${n(shaniTransitSav)} బిందువులు, ${n(maandiHouse)}వ స్థాన మాంది మీ సహనాన్ని పరీక్షించాయి. '${mahaNatureLabel}' గుణం గల దశానాథుడు (${bhuktiEndDate} నాటికి) ఆ కష్టాలను స్థిర విజయంగా మారుస్తాడు.`,
        ta: `கடந்த 24 மாதங்களை அஷ்டகவர்க்கம் மற்றும் நடப்பு ${currentMahadasha} – ${currentBhuktiLord} தசை மூலம் பார்த்தால்: ${shaniTransitRashi}-ன் ${n(shaniTransitSav)} பரல்களும் ${n(maandiHouse)}-ம் இட மாந்தியும் உங்கள் பொறுமையைச் சோதித்தன. '${mahaNatureLabel}' தன்மை கொண்ட தசாநாதன் (${bhuktiEndDate}-க்குள்) அந்த அனுபவங்களை உறுதியான வெற்றியாக மாற்றுவார்.`,
        en: `Auditing the past 24 months via Sarvashtakavarga (${shaniTransitRashi} carrying ${shaniTransitSav} bindus) alongside active ${currentMahadasha}–${currentBhuktiLord} Dasha explains those steep trials cleanly. Because ${currentMahadasha} operates as a '${mahaNatureLabel}' for ${lagnaRashiName} ascendant (with current Bhukti maturing through ${bhuktiEndDate}), those difficult months served as necessary structural seasoning before lasting gains.`
      },
      targetLang
    );

    const anchors1 = [
      `${currentHoraPlanet}`,
      `${taraLabelLocalized} (${n(liveTarabala.score)}%)`,
      `${house1Info.lordName} → ${n(house1Info.placedHouse)}`
    ];
    const anchors2 = [
      `${house8Info.lordName} (${n(house8Info.placedHouse)}) / ${house12Info.lordName} (${n(house12Info.placedHouse)})`,
      `${house9Info.lordName} → ${house9Info.placedRashi}`,
      knotNote.split("—")[0].slice(0, 42)
    ];
    const anchors3 = [
      `${shaniTransitRashi} (${n(shaniTransitSav)})`,
      `${currentMahadasha} • ${mahaNatureLabel}`,
      `${n(bhuktiEndDate)}`
    ];

    extraParagraph = chapterNumber === 1 ? ch1Extra : chapterNumber === 2 ? ch2Extra : ch3Extra;
    precisionAnchors = chapterNumber === 1 ? anchors1 : chapterNumber === 2 ? anchors2 : anchors3;
  } else if (chBand === "secret") {
    const ch4Extra = pick6(
      {
        kn: `ವಿಶೇಷ ಬಾಧಕ-ಮಾಂದಿ ಸಮನ್ವಯ ಗಣಿತ: ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ${n(badhakaHouse)}ನೇ ಮನೆಯು 'ಬಾಧಕ ಸ್ಥಾನ'ವಾಗಿದ್ದು, ಬಾಧಕಾಧಿಪತಿ ${badhakaInfo.lordName} (${n(badhakaInfo.placedHouse)}ನೇ ಭಾವ) ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿಯು (${maandiRashiName}) ಜಂಟಿಯಾಗಿ ಕೊನೆಯ ಕ್ಷಣದ ವಿಳಂಬವನ್ನು ಸೃಷ್ಟಿಸುತ್ತವೆ. ಅದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಲಗ್ನ ಸರ್ವಾಷ್ಟಕವರ್ಗ ಬಲವು ${n(savByHouse[1])} ಬಿಂದುಗಳಷ್ಟಿರುವುದರಿಂದ ನಿಮ್ಮ ಆಂತರಿಕ ಚೇತನ ಗಟ್ಟಿಯಾಗಿದೆ; ನಿಯಮಿತ ಶನಿವಾರ ತೈಲಾಭಿಷೇಕ ಮತ್ತು ಬಾಧಕ ದೋಷ ಶಾಂತಿಯಿಂದ ೯೯% ಗಂಟು ಪೂರ್ಣವಾಗಿ ಕರಗುತ್ತದೆ.`,
        mr: `विशेष बाधक व मांदी समन्वय: आपल्या ${lagnaRashiName} लग्नासाठी ${n(badhakaHouse)}वे स्थान 'बाधक स्थान' असून बाधकेश ${badhakaInfo.lordName} (${n(badhakaInfo.placedHouse)}वे स्थान) आणि ${n(maandiHouse)}व्या स्थानातील मांदी (${maandiRashiName}) यामुळे शेवटच्या टप्प्यात विलंब होतो. लग्न अष्टकवर्गात ${n(savByHouse[1])} बिंदू असल्याने आपले मूळ बळ भक्कम आहे; शास्त्रीय शांती विधीने ही अडकलेली गाठ पूर्णपणे सुटेल.`,
        hi: `सूक्ष्म बाधक एवं मांदी समन्वय सूत्र: आपके ${lagnaRashiName} लग्न हेतु ${n(badhakaHouse)}वां भाव 'बाधक स्थान' है, जिसके स्वामी ${badhakaInfo.lordName} (${n(badhakaInfo.placedHouse)}वें भाव) एवं ${n(maandiHouse)}वें भाव की मांदी (${maandiRashiName}) के संयुक्त प्रभाव से अंतिम चरण में अड़चनें आती हैं। लग्न में ${n(savByHouse[1])} अष्टकवर्ग बिंदुओं का बल होने से विधिवत शमन द्वारा यह ग्रंथि शीघ्र खुल जाती है।`,
        te: `సూక్ష్మ బాధక-మాంది విశ్లేషణ: మీ ${lagnaRashiName} లగ్నానికి ${n(badhakaHouse)}వ స్థానం 'బాధక స్థానం'. బాధకాధిపతి ${badhakaInfo.lordName} (${n(badhakaInfo.placedHouse)}వ స్థానం) మరియు ${n(maandiHouse)}వ స్థాన మాంది కలిసి చివరి క్షణ ఆటంకాలు కలిగిస్తాయి. లగ్న అష్టకవర్గంలో ${n(savByHouse[1])} బిందువులు ఉండటంతో సరైన శాంతి ద్వారా ఈ ముడి వీడిపోతుంది.`,
        ta: `நுட்பமான பாதக-மாந்தி கணிதம்: உங்கள் ${lagnaRashiName} லக்னத்திற்கு ${n(badhakaHouse)}-ம் இடம் 'பாதக ஸ்தானம்' ஆகும். பாதகாதிபதி ${badhakaInfo.lordName} (${n(badhakaInfo.placedHouse)}-ம் வீடு) மற்றும் ${n(maandiHouse)}-ம் இட மாந்தி (${maandiRashiName}) இணைந்து கடைசி நேரத் தடையை உருவாக்குகின்றன. லக்னத்தில் ${n(savByHouse[1])} பரல்கள் பலம் இருப்பதால் உரிய பரிகாரம் மூலம் இந்தத் தடை முழுமையாக நீங்கும்.`,
        en: `Synthesizing Classical Badhaka and Maandi Geometry: for ${lagnaRashiName} ascendant, House ${badhakaHouse} acts as the Badhaka locus ruled by ${badhakaInfo.lordName} (seated in House ${badhakaInfo.placedHouse}). When Badhaka interacts with Maandi in House ${maandiHouse} (${maandiRashiName}), last-mile delays intensify—yet your ${savByHouse[1]} Sarvashtakavarga bindus on Lagna verify inherent resilience once the knot is ritually harmonized.`
      },
      targetLang
    );

    const ch5Extra = pick6(
      {
        kn: `ಪಂಚಭೂತ-ಗ್ರಹ ಬಲದ ನಿಖರ ಪುರಾವೆ: ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಪ್ರಮುಖ ಸ್ಥಾನ ಬಲ ಹೊಂದಿರುವ '${dignStr}' ಗ್ರಹಗಳು ನಿಮ್ಮ ಆತ್ಮಸ್ಥೈರ್ಯವನ್ನು ಕಾಯುತ್ತವೆ. ಅಲ್ಲದೆ ${knotNote}. ದೇಹದ ಜೀವಶಕ್ತಿಯನ್ನು ಸೂಚಿಸುವ ಲಗ್ನ ಭಾವವು ${n(savByHouse[1])} ಬಿಂದುಗಳನ್ನೂ, ಜ್ಞಾನ-ಬುದ್ಧಿ ಭಾವವು (೫ನೇ ಮನೆ) ${n(savByHouse[5])} ಬಿಂದುಗಳನ್ನೂ ಹೊಂದಿರುವುದರಿಂದ ಶಾಂತ ಚಿತ್ತದೊಂದಿಗೆ ನಿಮ್ಮ ನಿರ್ಧಾರಗಳು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣ ಹಾಗೂ ಸತ್ಯಪರವಾಗಿರುತ್ತವೆ.`,
        mr: `पंचतत्त्व व ग्रहबलाचा पुरावा: पत्रिकेतील '${dignStr}' या बलवान ग्रहांचा पाठिंबा आपल्या आत्मविश्वासाला कायम ठेवतो. शिवाय ${knotNote}. लग्न स्थानात ${n(savByHouse[1])} व पंचम स्थानात ${n(savByHouse[5])} अष्टकवर्ग बिंदू असल्याने आपले निर्णय शांत डोक्याने घेतल्यास अचूक ठरतात.`,
        hi: `पंचभूत एवं ग्रह बल का प्रामाणिक आधार: आपकी कुंडली में '${dignStr}' जैसे बली ग्रह आपके आंतरिक स्वाभिमान की रक्षा करते हैं। साथ ही ${knotNote}। लग्न भाव में ${n(savByHouse[1])} तथा पंचम भाव में ${n(savByHouse[5])} बिंदुओं की उपस्थिति प्रमाणित करती है कि शांत चित्त से लिए गए आपके निर्णय सदैव सत्य एवं दूरदर्शी होते हैं।`,
        te: `పంచభూత మరియు గ్రహ బల నిర్ధారణ: మీ కుండలిలో '${dignStr}' గ్రహ బలం మీ ఆత్మగౌరవాన్ని కాపాడుతుంది. ${knotNote}. లగ్నంలో ${n(savByHouse[1])} మరియు 5వ భావంలో ${n(savByHouse[5])} బిందువులు ఉండటంతో ప్రశాంత మనసుతో తీసుకునే నిర్ణయాలు ఖచ్చితంగా ఫలిస్తాయి.`,
        ta: `பஞ்சபூத மற்றும் கிரக பல ஆதாரம்: உங்கள் ஜாதகத்தில் வலிமை பெற்ற '${dignStr}' கிரகங்கள் உங்கள் சுயமரியாதையைப் பாதுகாக்கின்றன. மேலும் ${knotNote}. லக்னத்தில் ${n(savByHouse[1])} பரல்களும் 5-ம் இடத்தில் ${n(savByHouse[5])} பரல்களும் உள்ளதால் அமைதியான மனதுடன் எடுக்கும் முடிவுகள் துல்லியமாக வெற்றி பெறும்.`,
        en: `Confirming your elemental bedrock mathematically: strong chart dignity anchored by '${dignStr}' protects your moral autonomy. ${knotNote}. With House 1 holding ${savByHouse[1]} Sarvashtakavarga bindus and House 5 holding ${savByHouse[5]} bindus, composure turns innate sensitivity into razor-sharp intuition.`
      },
      targetLang
    );

    const ch6Extra = pick6(
      {
        kn: `ಯೋಗಿ-ಅವಯೋಗಿ ಅಷ್ಟಕವರ್ಗ ತಾಳೆ: ನಿಮ್ಮ ಧನ ಸ್ಥಾನವಾದ ೨ನೇ ಮನೆಯಲ್ಲಿ ${n(savByHouse[2])} ಬಿಂದುಗಳು ಹಾಗೂ ಲಾಭ ಸ್ಥಾನವಾದ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ${n(savByHouse[11])} ಬಿಂದುಗಳು ದಾಖಲಾಗಿವೆ. '${yogiPlanetName}' ಯೋಗಿ ಗ್ರಹದ ಶಕ್ತಿಗೆ ಪೂರಕವಾಗಿ ${combustNote}. ${isChildOrInfant ? "ಮಗುವಿನ ಭವಿಷ್ಯದ ಶಿಕ್ಷಣ ನಿಧಿ ಹಾಗೂ ಪೋಷಕರ ಉದ್ಯಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಯೋಗಿ ಗ್ರಹದ ದಿನವನ್ನು ಬಳಸುವುದು ಕುಟುಂಬಕ್ಕೆ ಶಾಶ್ವತ ಲಕ್ಷ್ಮೀಕಟಾಕ್ಷ ತರುತ್ತದೆ." : `ಆದ್ದರಿಂದ '${avayogiPlanetName}' ದಿನಗಳಲ್ಲಿ ಆತುರದ ಹಣಕಾಸು ಸಾಲ ಅಥವಾ ಜಾಮೀನು ನೀಡದೆ, ಯೋಗಿ ಗ್ರಹದ (${yogiPlanetName}) ದಿನದಂದು ಸಂಪತ್ತು ವೃದ್ಧಿ ಯೋಜನೆಗಳನ್ನು ಹಮ್ಮಿಕೊಳ್ಳುವುದು ಶ್ರೇಷ್ಠ.`}`,
        mr: `योगी-अवयोगी अष्टकवर्ग ताळमेळ: आपल्या धन स्थानात (२ रे घर) ${n(savByHouse[2])} व लाभ स्थानात (११ वे घर) ${n(savByHouse[11])} शुभ बिंदू आहेत. '${yogiPlanetName}' योगी ग्रहासोबतच ${combustNote}. ${isChildOrInfant ? "पालकांनी मुलांच्या शिक्षणासाठी व कुटुंबाच्या बचतीसाठी योगी ग्रहाचा शुभ वार निवडणे लाभदायक ठरेल." : `म्हणून '${avayogiPlanetName}' च्या दिवशी धोकादायक आर्थिक व्यवहार टाळून योगी ग्रहाच्या दिवशी बचत व गुंतवणूक करणे अत्यंत फलदायी राहील.`}`,
        hi: `योगी-अवयोगी अष्टकवर्ग मिलान: आपके धन भाव (द्वितीय) में ${n(savByHouse[2])} तथा लाभ भाव (एकादश) में ${n(savByHouse[11])} बिंदू विद्यमान हैं। योगी ग्रह '${yogiPlanetName}' के साथ ${combustNote}। ${isChildOrInfant ? "अभिभावक बालक के विद्या कोष हेतु योगी ग्रह के शुभ दिवस का चयन करें, इससे परिवार में समृद्धि स्थिर रहेगी।" : `अतः '${avayogiPlanetName}' दिवस पर अनावश्यक उधार या जोखिम से बचते हुए योगी ग्रह (${yogiPlanetName}) के दिन धन संचय करना श्रेष्ठ रहेगा।`}`,
        te: `యోగి-అవయోగి అష్టకవర్గ సరిపోలిక: మీ ధన స్థానంలో (2వ) ${n(savByHouse[2])} మరియు లాభ స్థానంలో (11వ) ${n(savByHouse[11])} బిందువులు ఉన్నాయి. '${yogiPlanetName}' యోగి గ్రహంతో పాటు ${combustNote}. ${isChildOrInfant ? "చిన్నారి విద్యా నిధికి సంబంధించిన శుభ కార్యాలు యోగి గ్రహ వారంలో చేయడం శ్రేయస్కరం." : `కాబట్టి '${avayogiPlanetName}' రోజుల్లో అప్పులు ఇవ్వడం మాని, యోగి గ్రహం (${yogiPlanetName}) వారంలో ధన ప్రణాళికలు వేసుకోండి.`}`,
        ta: `யோகி-அவயோகி அஷ்டகவர்க்க ஒப்பீடு: உங்கள் தன ஸ்தானத்தில் (2-ம்) ${n(savByHouse[2])} பரல்களும் லாப ஸ்தானத்தில் (11-ம்) ${n(savByHouse[11])} பரல்களும் உள்ளன. '${yogiPlanetName}' யோகி கிரகத்துடன் ${combustNote}. ${isChildOrInfant ? "குழந்தையின் கல்வி சேமிப்பு திட்டங்களை யோகி கிரக நாளில் தொடங்குவது குடும்ப வளத்தைப் பெருக்கும்." : `எனவே '${avayogiPlanetName}' நாட்களில் பணப் பரிவர்த்தனை தவிர்த்து, யோகி கிரக (${yogiPlanetName}) நாளில் முதலீடு செய்வது மிகுந்த லாபம் தரும்.`}`,
        en: `Cross-checking Yogi magnetism against your financial matrix: House 2 (liquid wealth) holds ${savByHouse[2]} SAV bindus while House 11 (gains) scores ${savByHouse[11]} bindus. Additionally, ${combustNote}. ${isChildOrInfant ? `Scheduling family educational savings reserves around Yogi ${yogiPlanetName}'s auspicious weekday fortifies long-term provision.` : `Discipline financial commitments strictly away from ${avayogiPlanetName} days while concentrating constructive initiatives on ${yogiPlanetName}'s harmonic window.`}`
      },
      targetLang
    );

    const anchors4 = [
      `${n(badhakaHouse)} (${badhakaInfo.lordName})`,
      `${maandiRashiName} (${n(maandiHouse)})`,
      `${n(savByHouse[1])} (${moonRashiName})`
    ];
    const anchors5 = [
      `${dignStr}`,
      `${n(savByHouse[1])} / ${n(savByHouse[5])}`,
      `${lagnaRashiName} • ${moonRashiName}`
    ];
    const anchors6 = [
      `${yogiPlanetName}`,
      `${n(savByHouse[2])} / ${n(savByHouse[11])}`,
      `${avayogiPlanetName}`
    ];

    extraParagraph = chapterNumber === 4 ? ch4Extra : chapterNumber === 5 ? ch5Extra : ch6Extra;
    precisionAnchors = chapterNumber === 4 ? anchors4 : chapterNumber === 5 ? anchors5 : anchors6;
  } else if (chBand === "power") {
    const ch7Extra = pick6(
      {
        kn: `ಲಗ್ನ ಮೈತ್ರಿ ಹಾಗೂ ದಶಾ ಕಾರ್ಯವಿಧಾನ: ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಮಹಾದಶಾ ನಾಥ ${currentMahadasha} ಗ್ರಹವು '${mahaNatureLabel}' ಆಗಿದ್ದು, ಅಂತರ್ದಶಾ ನಾಥ ${currentBhuktiLord} ಗ್ರಹವು '${bhuktiNatureLabel}' ಪಾತ್ರ ವಹಿಸುತ್ತಿದೆ (ಪ್ರಸ್ತುತ ಹಂತದ ಅವಧಿ: ${n(bhuktiEndDate)} ವರೆಗೆ). ${retroNote}; ಅಲ್ಲದೆ ${combustNote}. ಆದ್ದರಿಂದ ಈ ಕಾಲಘಟ್ಟವನ್ನು ಕೇವಲ ನಿರೀಕ್ಷೆಯಲ್ಲಿ ಕಳೆಯದೆ, ಸಕಾಲಿಕ ಶಿಸ್ತು ಹಾಗೂ ಶಿವನ ಅನುಗ್ರಹದೊಂದಿಗೆ ಸುವರ್ಣಾವಕಾಶವನ್ನಾಗಿ ರೂಪಿಸಿಕೊಳ್ಳುವುದು ಅತ್ಯುತ್ತಮ.`,
        mr: `लग्न मैत्री व दशा सूक्ष्मता: आपल्या ${lagnaRashiName} लग्नासाठी चालू महादशा स्वामी ${currentMahadasha} हे '${mahaNatureLabel}' तर अंतर्दशा स्वामी ${currentBhuktiLord} हे '${bhuktiNatureLabel}' म्हणून कार्य करत आहेत (अंतर्दशा कालावधी: ${n(bhuktiEndDate)} पर्यंत). ${retroNote}, तसेच ${combustNote}. त्यामुळे वेळेचा अचूक उपयोग करून शिस्तबद्ध प्रगती साधणे उत्तम ठरेल.`,
        hi: `लग्न मैत्री एवं दशा संचालन सूत्र: आपके ${lagnaRashiName} लग्न के लिए वर्तमान महादशा स्वामी ${currentMahadasha} '${mahaNatureLabel}' एवं अंतर्दशा स्वामी ${currentBhuktiLord} '${bhuktiNatureLabel}' की भूमिका निभा रहे हैं (${n(bhuktiEndDate)} तक)। ${retroNote} तथा ${combustNote}। अतः धैर्य एवं नियमबद्ध प्रयास से इस दशा को सिद्धिदायक बनाया जा सकता है।`,
        te: `లగ్న మైత్రి మరియు దశా ఫలిత నియమం: మీ ${lagnaRashiName} లగ్నానికి ప్రస్తుతం ${currentMahadasha} '${mahaNatureLabel}' గానూ, ${currentBhuktiLord} '${bhuktiNatureLabel}' గానూ పనిచేస్తున్నాయి (${n(bhuktiEndDate)} వరకు). ${retroNote} మరియు ${combustNote}. కనుక సమయపాలనతో ప్రయత్నాలు చేయడం శుభప్రదం.`,
        ta: `லக்ன நட்பு மற்றும் தசா செயல்முறை: உங்கள் ${lagnaRashiName} லக்னத்திற்கு தற்போதைய மகாதசா நாதர் ${currentMahadasha} '${mahaNatureLabel}' ஆகவும், புக்தி நாதர் ${currentBhuktiLord} '${bhuktiNatureLabel}' ஆகவும் செயல்படுகின்றனர் (${n(bhuktiEndDate)} வரை). ${retroNote} மற்றும் ${combustNote}. எனவே ஒழுங்குமுறையுடன் செயல்பட்டு வெற்றியை உறுதி செய்யலாம்.`,
        en: `Functional Dasha Classification for ${lagnaRashiName} ascendant: running Mahadasha lord ${currentMahadasha} operates classically as a '${mahaNatureLabel}', modulated by Bhukti lord ${currentBhuktiLord} acting as a '${bhuktiNatureLabel}' through ${bhuktiEndDate}. Furthermore, ${retroNote} and ${combustNote}—proving why steady discipline rather than guesswork governs every milestone.`
      },
      targetLang
    );

    const ch8or9Extra = chapterNumber === 8
      ? pick6(
          {
            kn: `ಶನಿ ಗೋಚಾರ ಹಾಗೂ ಲಗ್ನ-ಚಂದ್ರ ಸಮನ್ವಯ: ಶನಿಯು ${shaniTransitRashi} ರಾಶಿಯಲ್ಲಿ (${n(shaniTransitSav)} ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳೊಂದಿಗೆ, ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಮನೆ) ಸಂಚರಿಸುವಾಗ, ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನದ (೧೦ನೇ ಮನೆ — ${n(savByHouse[10])} ಬಿಂದುಗಳು) ಹಾಗೂ ಲಾಭ ಸ್ಥಾನದ (${n(savByHouse[11])} ಬಿಂದುಗಳು) ದೃಢತೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಾನೆ. ವೃಥಾ ವಾದ-ವಿವಾದ, ಅಶಿಸ್ತು ಹಾಗೂ ಕಾನೂನುಬಾಹಿರ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳನ್ನು ದೂರವಿಟ್ಟು ಸತ್ಯದ ಮಾರ್ಗದಲ್ಲಿ ನಡೆದರೆ ಶನೈಶ್ಚರನು ತಾತ್ಕಾಲಿಕ ಪರೀಕ್ಷೆಯ ನಂತರ ಅಚಲ ಸ್ಥಾನಮಾನವನ್ನು ಅನುಗ್ರಹಿಸುತ್ತಾನೆ.`,
            mr: `शनी गोचर व कर्म-लाभ ताळमेळ: ${shaniTransitRashi} मधील शनी (${n(shaniTransitSav)} बिंदू, चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान) आपल्या कर्म भावातील ${n(savByHouse[10])} आणि लाभ भावातील ${n(savByHouse[11])} बिंदूंची ताकद तपासतो. शॉर्टकट टाळून प्रामाणिक परिश्रम केल्यास शनीदेव शेवटी भक्कम प्रतिष्ठा मिळवून देतात.`,
            hi: `शनि गोचर एवं कर्म-लाभ संतुलन: ${shaniTransitRashi} में शनि का संचरण (${n(shaniTransitSav)} बिंदू, चंद्र से ${n(shaniHouseFromMoon)}वां भाव) आपके कर्म भाव (${n(savByHouse[10])} बिंदू) और लाभ भाव (${n(savByHouse[11])} बिंदू) की प्रामाणिकता परखता है। अनुचित शॉर्टकट से बचकर सत्यनिष्ठ श्रम करने पर शनिदेव अंततः स्थायी मान-सम्मान प्रदान करते हैं।`,
            te: `శని గోచారం మరియు కర్మ-లాభ సమతుల్యత: ${shaniTransitRashi} లోని శని (${n(shaniTransitSav)} బిందువులు, చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం) మీ కర్మ స్థానంలోని ${n(savByHouse[10])} మరియు లాభ స్థానంలోని ${n(savByHouse[11])} బిందువులను పరీక్షిస్తుంది. నిజాయితీతో కూడిన కష్టం మీకు స్థిర కీర్తిని తెస్తుంది.`,
            ta: `சனி கோசாரமும் தொழில்-லாப சமநிலையும்: ${shaniTransitRashi}-ல் சஞ்சரிக்கும் சனி (${n(shaniTransitSav)} பரல்கள், ராசியிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம்) உங்கள் தொழில் ஸ்தான ${n(savByHouse[10])} மற்றும் லாப ஸ்தான ${n(savByHouse[11])} பரல்களைச் சோதிக்கிறது. நேர்மையான உழைப்பு இறுதியில் நிலையான உயர்வையும் புகழையும் வழங்கும்.`,
            en: `Integrating Saturn's transit (${shaniTransitRashi}, ${shaniTransitSav} bindus, House ${shaniHouseFromMoon} from Moon) with your natal Work (House 10: ${savByHouse[10]} bindus) and Gains (House 11: ${savByHouse[11]} bindus) proves Saturn only prunes unsustainable shortcuts. Grounded persistence transforms endurance directly into authoritative bedrock.`
          },
          targetLang
        )
      : pick6(
          {
            kn: `ಗುರು ಗೋಚಾರ ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿ ಸಮನ್ವಯ: ಪ್ರಸ್ತುತ ಗುರುವು ${guruTransitRashi} ರಾಶಿಯಲ್ಲಿ (${n(guruTransitSav)} ಬಿಂದು, ಚಂದ್ರನಿಂದ ${n(guruHouseFromMoon)}ನೇ ಮನೆ) ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಭಾಗ್ಯಾಧಿಪತಿ ${house9Info.lordName} (${n(house9Info.placedHouse)}ನೇ ಭಾವ, ${house9Info.placedRashi}) ಹಾಗೂ ಪಂಚಮ ಸ್ಥಾನದ (${n(savByHouse[5])} ಬಿಂದುಗಳು) ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿದ್ದಾನೆ. ಸತ್ಸಂಗ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಧರ್ಮಬದ್ಧ ಜ್ಞಾನಾರ್ಜನೆಯಿಂದ ಮುನ್ನಡೆದರೆ ಈ ಗುರು ಸಂಚಾರವು ಕುಟುಂಬದಲ್ಲಿ ಮಂಗಳಕರ ವಾತಾವರಣವನ್ನು ನೆಲೆಗೊಳಿಸುತ್ತದೆ.`,
            mr: `गुरू गोचर व भाग्याधिपती योग: ${guruTransitRashi} मधील गुरु (${n(guruTransitSav)} बिंदू, चंद्रापासून ${n(guruHouseFromMoon)}वे स्थान) आपल्या भाग्याधिपती ${house9Info.lordName} (${n(house9Info.placedHouse)}वे स्थान) व पंचम भावाचे (${n(savByHouse[5])} बिंदू) बळ वाढवत आहे. सज्जन संगत व ज्येष्ठांच्या आशीर्वादाने घरात सुखद प्रसंग घडतील.`,
            hi: `गुरु गोचर एवं भाग्येश समन्वय: ${guruTransitRashi} में गुरु का गोचर (${n(guruTransitSav)} बिंदू, चंद्र से ${n(guruHouseFromMoon)}वां भाव) आपके भाग्येश ${house9Info.lordName} (${n(house9Info.placedHouse)}वें भाव) एवं पंचम भाव (${n(savByHouse[5])} बिंदू) की शुभता जागृत कर रहा है। सत्संग व गुरुजनों के आशीर्वाद से परिवार में मांगलिक सुख बढ़ेगा।`,
            te: `గురు గోచారం మరియు భాగ్యాధిపతి బలం: ${guruTransitRashi} లోని గురువు (${n(guruTransitSav)} బిందువులు, చంద్రుని నుండి ${n(guruHouseFromMoon)}వ స్థానం) మీ భాగ్యాధిపతి ${house9Info.lordName} మరియు 5వ స్థాన (${n(savByHouse[5])} బిందువులు) శక్తిని పెంచుతున్నాడు. పెద్దల ఆశీస్సులతో శుభకార్యాలు నెరవేరుతాయి.`,
            ta: `குரு கோசாரமும் பாக்கியாதிபதி பலமும்: ${guruTransitRashi}-ல் சஞ்சரிக்கும் குரு (${n(guruTransitSav)} பரல்கள், ராசியிலிருந்து ${n(guruHouseFromMoon)}-ம் இடம்) உங்கள் பாக்கியாதிபதி ${house9Info.lordName} மற்றும் 5-ம் இட (${n(savByHouse[5])} பரல்கள்) பலத்தை ஊக்குவிக்கிறார். பெரியோரின் ஆசியுடன் இல்லத்தில் சுப நிகழ்ச்சிகள் கூடும்.`,
            en: `Pairing Jupiter's current orbit in ${guruTransitRashi} (${guruTransitSav} bindus, House ${guruHouseFromMoon} from Moon) with 9th fortune lord ${house9Info.lordName} (in House ${house9Info.placedHouse}) and 5th house credit (${savByHouse[5]} bindus) highlights intellectual growth and principled harmony when mentored wisely.`
          },
          targetLang
        );

    const ch10Extra = pick6(
      {
        kn: `ರಾಹು-ಕೇತು ಅಧಿಪತಿಗಳ (Dispositor) ರಹಸ್ಯ: ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು ಮತ್ತು ಕೇತುಗಳು ತಮ್ಮ ರಾಶ್ಯಾಧಿಪತಿಗಳಾದ ${rahuDispositorName} (${n(rahuDispositorHouse)}ನೇ ಭಾವ) ಹಾಗೂ ${ketuDispositorName} (${n(ketuDispositorHouse)}ನೇ ಭಾವ) ಗ್ರಹಗಳ ಮೂಲಕವೇ ಫಲ ನೀಡುತ್ತವೆ. ಅಲ್ಲದೆ ${knotNote}. ಹೀಗಾಗಿ ಅನಗತ್ಯ ವೇಗ ಅಥವಾ ಭಯಕ್ಕೆ ಒಳಗಾಗದೆ, ಸತ್ಯ-ಶುದ್ಧ ಬುದ್ಧಿಯಿಂದ ಹೆಜ್ಜೆ ಹಾಕಿದರೆ ಈ ಛಾಯಾಗ್ರಹಗಳೇ ನಿಮಗೆ ಅನಿರೀಕ್ಷಿತ ರಕ್ಷಣಾ ಶಕ್ತಿಯಾಗಿ ಪರಿಣಮಿಸುತ್ತವೆ.`,
        mr: `राहु-केतू राशीस्वामी विश्लेषण: छायाग्रह आपले फळ त्यांच्या राशीस्वामींद्वारे देतात — राहु स्वामी ${rahuDispositorName} (${n(rahuDispositorHouse)}वे स्थान) व केतू स्वामी ${ketuDispositorName} (${n(ketuDispositorHouse)}वे स्थान) येथे आहेत. शिवाय ${knotNote}. त्यामुळे अवास्तव घाई न करता विवेकाने काम केल्यास मोठा लाभ होतो.`,
        hi: `राहु-केतु राशिस्वामी रहस्य: छायाग्रह सदैव अपने अधिपति ग्रहों के अनुसार फल देते हैं — राहु के स्वामी ${rahuDispositorName} (${n(rahuDispositorHouse)}वें भाव) एवं केतु के स्वामी ${ketuDispositorName} (${n(ketuDispositorHouse)}वें भाव) में स्थित हैं। साथ ही ${knotNote}। अतः भ्रम से दूर रहकर विवेकपूर्वक चलने से अप्रत्याशित लाभ सिद्ध होता है।`,
        te: `రాహు-కేతు రాశ్యాధిపతుల రహస్యం: ఛాయాగ్రహాలు వాటి అధిపతులైన ${rahuDispositorName} (${n(rahuDispositorHouse)}వ స్థానం) మరియు ${ketuDispositorName} (${n(ketuDispositorHouse)}వ స్థానం) ద్వారా ఫలితాలనిస్తాయి. ${knotNote}. కనుక భ్రమలకు లోనుకాకుండా నిజాయితీతో ముందుకు సాగండి.`,
        ta: `ராகு-கேது அதிபதிகளின் ரகசியம்: சாயா கிரகங்கள் தங்கள் வீட்டு அதிபதிகளான ${rahuDispositorName} (${n(rahuDispositorHouse)}-ம் வீடு) மற்றும் ${ketuDispositorName} (${n(ketuDispositorHouse)}-ம் வீடு) வழியே பலன் தரும். மேலும் ${knotNote}. எனவே மாயைகளைத் தவிர்த்து தெளிவுடன் செயல்படுவது நன்மை தரும்.`,
        en: `Dispositor Truth of the Nodes: shadow planets Rahu and Ketu deliver outcomes primarily through their sign rulers—${rahuDispositorName} (in House ${rahuDispositorHouse}) and ${ketuDispositorName} (in House ${ketuDispositorHouse}). Alongside ${knotNote}, piercing artificial urgency unlocks unexpected strategic breakthroughs.`
      },
      targetLang
    );

    const ch11Extra = pick6(
      {
        kn: `ಗ್ರಹಗಳ ಪೂರ್ಣ ದರ್ಜಾ (Dignity) ಮತ್ತು ನವಾಂಶ ಶಕ್ತಿ: ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ '${dignStr}' ಮುಂತಾದ ಬಲಿಷ್ಠ ಸ್ಥಾನಗಳು ಹಾಗೂ ೧೦ನೇ (${n(savByHouse[10])} ಬಿಂದು) ಮತ್ತು ೧೧ನೇ (${n(savByHouse[11])} ಬಿಂದು) ಭಾವಗಳ ಅಷ್ಟಕವರ್ಗ ಬಲವು ರಾಜಯೋಗ ಫಲದ ತಳಹದಿಯನ್ನು ನಿರ್ಮಿಸಿವೆ. ${retroNote}; ಇದೇ ಕಾರಣದಿಂದ ನಿಮ್ಮ ಜಾತಕದ ಯೋಗಗಳು ತಾತ್ಕಾಲಿಕ ಪ್ರದರ್ಶನಕ್ಕಿಂತ ದೀರ್ಘಕಾಲಿಕ ಗೌರವ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ತಂದುಕೊಡುತ್ತವೆ.`,
        mr: `ग्रहांचे उच्च-नवांश बळ: पत्रिकेत '${dignStr}' सारखी बलवान स्थिती तसेच कर्म (${n(savByHouse[10])} बिंदू) व लाभ (${n(savByHouse[11])} बिंदू) स्थानांचे बळ राजयोगाचा पाया मजबूत करतात. ${retroNote}, ज्यामुळे आपल्या यशात दीर्घकाळ टिकणारे स्थैर्य निर्माण होते.`,
        hi: `ग्रहों का उच्च एवं नवांश बल: कुंडली में '${dignStr}' की सुदृढ़ स्थिति तथा दशम (${n(savByHouse[10])} बिंदू) एवं एकादश (${n(savByHouse[11])} बिंदू) के अष्टकवर्ग बल से राजयोग का पक्का आधार बनता है। ${retroNote}, जिससे आपको क्षणिक नहीं अपितु चिरस्थायी सम्मान प्राप्त होता है।`,
        te: `గ్రహాల నవాంశ మరియు ఉన్నత బలం: మీ జాతకంలో '${dignStr}' బలం మరియు 10వ (${n(savByHouse[10])} బిందువులు), 11వ (${n(savByHouse[11])} బిందువులు) స్థానాల శక్తి రాజయోగానికి బలమైన పునాది. ${retroNote}, తద్వారా మీకు దీర్ఘకాలిక విజయం సిద్ధిస్తుంది.`,
        ta: `கிரகங்களின் உச்ச-நவாம்ச வலிமை: உங்கள் ஜாதகத்தில் '${dignStr}' நிலைகளும் 10-ம் (${n(savByHouse[10])} பரல்கள்), 11-ம் (${n(savByHouse[11])} பரல்கள்) அஷ்டகவர்க்கமும் ராஜயோக அடித்தளத்தை வலுவாக்குகின்றன. ${retroNote}; இதனால் நிலையான கௌரவமும் செல்வமும் நிலைபெறும்.`,
        en: `Planetary Dignity & Navamsha Synthesis: elevated placements anchored by '${dignStr}' alongside House 10 (${savByHouse[10]} bindus) and House 11 (${savByHouse[11]} bindus) seal your Rajayoga architecture. Additionally, ${retroNote}—confirming that triumphs mature into lasting dignity rather than fleeting applause.`
      },
      targetLang
    );

    const anchorMap: Record<number, string[]> = {
      7: [`${currentMahadasha} • ${mahaNatureLabel}`, `${currentBhuktiLord} • ${bhuktiNatureLabel}`, `${n(bhuktiEndDate)}`],
      8: [`${shaniTransitRashi} (${n(shaniHouseFromMoon)})`, `${n(shaniTransitSav)}`, `${n(savByHouse[10])} / ${n(savByHouse[11])}`],
      9: [`${guruTransitRashi} (${n(guruHouseFromMoon)})`, `${n(guruTransitSav)}`, `${house9Info.lordName} (${n(house9Info.placedHouse)})`],
      10: [`${rahuDispositorName} (${n(rahuDispositorHouse)})`, `${ketuDispositorName} (${n(ketuDispositorHouse)})`, `${lagnaRashiName}`],
      11: [`${dignStr}`, `${n(savByHouse[10])} / ${n(savByHouse[11])}`, `${house1Info.lordName}`]
    };

    extraParagraph =
      chapterNumber === 7
        ? ch7Extra
        : chapterNumber === 8 || chapterNumber === 9
        ? ch8or9Extra
        : chapterNumber === 10
        ? ch10Extra
        : ch11Extra;
    precisionAnchors = anchorMap[chapterNumber] || [];
  } else if (chBand === "pillar") {
    const map: Record<number, { text: string; anchors: string[] }> = {
      12: {
        text: isChildOrInfant
          ? pick6(
              {
                kn: `ವಿದ್ಯೆ ಹಾಗೂ ರಕ್ಷಣಾ ಅಷ್ಟಕವರ್ಗ ಗಣಿತ: ಮಗುವಿನ ಬುದ್ಧಿ ಸ್ಥಾನವಾದ ೫ನೇ ಮನೆಯಲ್ಲಿ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಹಾಗೂ ಲಗ್ನ ಭಾವದಲ್ಲಿ ${n(savByHouse[1])} ಬಿಂದುಗಳು ದಾಖಲಾಗಿದ್ದು, ಲಗ್ನಾಧಿಪತಿ ${house1Info.lordName} ಮಗುವಿನ ಚೈತನ್ಯವನ್ನು ಕಾಯುತ್ತಿದೆ. ${knotNote}. ಕಂದನಿಗೆ ಬಾಲ್ಯದಿಂದಲೇ ಕಥೆಗಳು, ಶ್ಲೋಕಗಳು ಮತ್ತು ಆಟಗಳ ಮೂಲಕ ಜ್ಞಾನದ ಬೀಜ ಬಿತ್ತಿದರೆ ಸಹಜವಾಗಿಯೇ ಉನ್ನತ ಏಕಾಗ್ರತೆ ವಿಕಸಿಸುತ್ತದೆ.`,
                mr: `शिक्षण व संरक्षण अष्टकवर्ग: बालकाच्या पंचम भावात ${n(savByHouse[5])} व लग्न भावात ${n(savByHouse[1])} बिंदू आहेत; लग्नेश ${house1Info.lordName} बाळाच्या आरोग्याचे व बुद्धीचे रक्षण करतात. ${knotNote}. गोष्टी व श्लोकांच्या माध्यमातून सहज शिक्षण दिल्यास स्मरणशक्ती उत्तम विकसित होईल.`,
                hi: `विद्या एवं सुरक्षा अष्टकवर्ग गणित: बालक के पंचम भाव में ${n(savByHouse[5])} एवं लग्न में ${n(savByHouse[1])} बिंदू हैं; लग्नेश ${house1Info.lordName} इसकी मेधा शक्ति को सुरक्षा देते हैं। ${knotNote}। कहानियों और श्लोकों द्वारा सहज संस्कार देने से एकाग्रता स्वतः निखरती है।`,
                te: `విద్య మరియు రక్షణ అష్టకవర్గ గణితం: చిన్నారి 5వ స్థానంలో ${n(savByHouse[5])} మరియు లగ్నంలో ${n(savByHouse[1])} బిందువులు ఉన్నాయి; లగ్నాధిపతి ${house1Info.lordName} రక్షణగా ఉంటుంది. ${knotNote}. చిన్ననాటి నుండి మంచి కథలు, శ్లోకాలతో ఏకాగ్రత మరింత పెరుగుతుంది.`,
                ta: `கல்வி மற்றும் பாதுகாப்பு அஷ்டகவர்க்கம்: குழந்தையின் 5-ம் இடத்தில் ${n(savByHouse[5])} பரல்களும் லக்னத்தில் ${n(savByHouse[1])} பரல்களும் உள்ளன; லக்னாதிபதி ${house1Info.lordName} குழந்தையைக் காக்கிறது. ${knotNote}. கதைகள் மற்றும் ஸ்லோகங்கள் மூலம் இயல்பான அறிவுத்திறன் சிறப்பாக வளரும்.`,
                en: `Foundational Astakavarga audit for this child: House 5 (learning & retention) carries ${savByHouse[5]} bindus alongside House 1 holding ${savByHouse[1]} bindus under ascendant lord ${house1Info.lordName}. ${knotNote}—nurturing joyful stories and gentle rhythm builds lifelong confidence.`
              },
              targetLang
            )
          : pick6(
              {
                kn: `ವೃತ್ತಿ-ಅಧಿಕಾರದ ಅಷ್ಟಕವರ್ಗ ಮತ್ತು ದಶಾ ಪುರಾವೆ: ನಿಮ್ಮ ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[10])} ಬಿಂದುಗಳು (ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[11])} ಬಿಂದುಗಳು) ದಾಖಲಾಗಿದ್ದು, ದಶಮೇಶ ${house10Info.lordName} ${n(house10Info.placedHouse)}ನೇ ಮನೆಯಿಂದ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ನಿರ್ದೇಶಿಸುತ್ತಿದ್ದಾರೆ. ${retroNote}; ಅಲ್ಲದೆ ${combustNote}. ಆದ್ದರಿಂದ '${mahaNatureLabel}' ಸ್ವರೂಪದ ಪ್ರಸ್ತುತ ಮಹಾದಶೆಯಲ್ಲಿ ಆತುರದ ಬದಲಾವಣೆಗಿಂತ ತಜ್ಞತೆಯನ್ನು ಬೆಳೆಸಿಕೊಂಡು ಮುನ್ನಡೆದರೆ ಸ್ಥಿರ ಗೌರವ ಖಚಿತ.`,
                mr: `कारकीर्द अष्टकवर्ग व दशा विश्लेषण: आपल्या १०व्या कर्म भावात ${n(savByHouse[10])} व ११व्या लाभ भावात ${n(savByHouse[11])} बिंदू असून दशमेश ${house10Info.lordName} ${n(house10Info.placedHouse)}व्या स्थानातून नेतृत्व दर्शवतात. ${retroNote}, आणि ${combustNote}. त्यामुळे कौशल्यावर भर दिल्यास स्थिर पदोन्नती नक्की मिळेल.`,
                hi: `आजीविका अष्टकवर्ग एवं दशा प्रमाण: आपके दशम कर्म भाव में ${n(savByHouse[10])} तथा एकादश लाभ भाव में ${n(savByHouse[11])} बिंदू हैं; दशमेश ${house10Info.lordName} ${n(house10Info.placedHouse)}वें भाव से कार्यक्षेत्र का संचालन कर रहे हैं। ${retroNote} व ${combustNote}। विशेषज्ञता बढ़ाने से स्थायी प्रतिष्ठा प्राप्त होगी।`,
                te: `వృత్తి-అధికార అష్టకవర్గ నిర్ధారణ: మీ 10వ కర్మ స్థానంలో ${n(savByHouse[10])} మరియు 11వ లాభ స్థానంలో ${n(savByHouse[11])} బిందువులు ఉన్నాయి; దశమాధిపతి ${house10Info.lordName} ${n(house10Info.placedHouse)}వ స్థానం నుండి నడిపిస్తున్నారు. ${retroNote}, మరియు ${combustNote}. నైపుణ్యంతో ముందుకు సాగితే స్థిర ఉన్నతి ఖాయం.`,
                ta: `தொழில்-பதவி அஷ்டகவர்க்க சான்று: உங்கள் 10-ம் தொழில் இடத்தில் ${n(savByHouse[10])} பரல்களும் 11-ம் லாப இடத்தில் ${n(savByHouse[11])} பரல்களும் உள்ளன; 10-ம் அதிபதி ${house10Info.lordName} ${n(house10Info.placedHouse)}-ம் வீட்டிலிருந்து இயக்குகிறார். ${retroNote}; மேலும் ${combustNote}. திறமையை வளர்ப்பதால் நிரந்தர உயர்வு கிட்டும்.`,
                en: `Career & Status Precision Audit: House 10 (Karma) registers ${savByHouse[10]} SAV bindus while House 11 (Gains) holds ${savByHouse[11]} bindus, directed by 10th lord ${house10Info.lordName} in House ${house10Info.placedHouse}. With ${retroNote} and ${combustNote}, disciplined mastery under your '${mahaNatureLabel}' Mahadasha anchors enduring executive authority.`
              },
              targetLang
            ),
        anchors: [
          `${house10Info.lordName} (${n(house10Info.placedHouse)})`,
          `${n(savByHouse[10])} / ${n(savByHouse[11])}`,
          `${currentMahadasha}`
        ]
      },
      13: {
        text: isChildOrInfant
          ? pick6(
              {
                kn: `ಕುಟುಂಬ ಸಂಪತ್ತು ಹಾಗೂ ವಿದ್ಯಾ ನಿಧಿ ಗಣಿತ: ೨ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[2])} ಬಿಂದುಗಳು ಹಾಗೂ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[11])} ಬಿಂದುಗಳು ಇರುವುದರಿಂದ ಈ ಮಗುವಿನ ಜಾತಕವು ಕುಟುಂಬಕ್ಕೆ ಸುಭಿಕ್ಷೆಯನ್ನು ತರುತ್ತದೆ. ಧನಾಧಿಪತಿ ${house2Info.lordName} ಮತ್ತು ಲಾಭಾಧಿಪತಿ ${house11Info.lordName} ರಕ್ಷಣೆಯಿಂದ ಮಗುವಿನ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಅವಶ್ಯಕತೆಗಳಿಗೆ ಸಕಾಲಿಕ ಸಂಪನ್ಮೂಲ ಸದಾ ಸಿದ್ಧವಾಗಿರುತ್ತದೆ.`,
                mr: `कौटुंबिक संपत्ती व शिक्षण निधी गणित: २ऱ्या धन स्थानात ${n(savByHouse[2])} व ११व्या लाभ स्थानात ${n(savByHouse[11])} बिंदू असल्याने बाळाचे पायगुण कुटुंबात भरभराट आणतात. द्वितीयेश ${house2Info.lordName} व लाभेश ${house11Info.lordName} यांच्या बळामुळे शिक्षणाच्या सर्व गरजा वेळोवेळी पूर्ण होतील.`,
                hi: `पारिवारिक समृद्धि एवं विद्या कोष गणित: द्वितीय धन भाव में ${n(savByHouse[2])} तथा एकादश लाभ भाव में ${n(savByHouse[11])} बिंदू होने से बालक का भाग्य परिवार में सुख-संपन्नता बढ़ाता है। धनेश ${house2Info.lordName} एवं लाभेश ${house11Info.lordName} की अनुकूलता शिक्षा के साधनों की पूर्ति करती रहेगी।`,
                te: `కుటుంబ ఐశ్వర్యం మరియు విద్యా నిధి గణితం: 2వ ధన స్థానంలో ${n(savByHouse[2])} మరియు 11వ లాభ స్థానంలో ${n(savByHouse[11])} బిందువులు ఉండటంతో చిన్నారి అదృష్టం కుటుంబానికి శుభాన్ని తెస్తుంది. ${house2Info.lordName} మరియు ${house11Info.lordName} బలంతో విద్యా అవసరాలకు కొదవ ఉండదు.`,
                ta: `குடும்ப வளம் மற்றும் கல்வி நிதி கணிதம்: 2-ம் தன இடத்தில் ${n(savByHouse[2])} பரல்களும் 11-ம் லாப இடத்தில் ${n(savByHouse[11])} பரல்களும் உள்ளதால் குழந்தையின் வருகை குடும்பத்திற்கு வளம் சேர்க்கும். ${house2Info.lordName} மற்றும் ${house11Info.lordName} பலத்தால் கல்வித் தேவைகள் தடையின்றி நிறைவேறும்.`,
                en: `Childhood Prosperity Audit: House 2 (Family Resources) carries ${savByHouse[2]} bindus and House 11 carries ${savByHouse[11]} bindus, supported by ${house2Info.lordName} and ${house11Info.lordName}. Consistent, debt-free family planning on Yogi ${yogiPlanetName}'s weekday locks educational security smoothly.`
              },
              targetLang
            )
          : pick6(
              {
                kn: `ಧನ-ಲಾಭ ಅಷ್ಟಕವರ್ಗ ಮತ್ತು ಖರ್ಚು ನಿಯಂತ್ರಣ: ನಿಮ್ಮ ೨ನೇ ಧನ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[2])} ಬಿಂದುಗಳು ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[11])} ಬಿಂದುಗಳಿವೆ; ಆದರೆ ದ್ವಾದಶೇಶ ${house12Info.lordName} (${n(house12Info.placedHouse)}ನೇ ಭಾವ) ಅನಿರೀಕ್ಷಿತ ವ್ಯಯವನ್ನು ಸೂಚಿಸುವುದರಿಂದ ಉಳಿತಾಯ ಶಿಸ್ತು ಅತ್ಯಗತ್ಯ. '${yogiPlanetName}' ಯೋಗಿ ಗ್ರಹದ ಬಲವನ್ನು ಬಳಸಿ ಸ್ಥಿರ ಆಸ್ತಿಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ '${avayogiPlanetName}' ದಿನಗಳಲ್ಲಿ ಖರ್ಚು ನಿಯಂತ್ರಿಸಿದರೆ ಸಂಪತ್ತು ವಂಶಪಾರಂಪರ್ಯವಾಗಿ ಉಳಿಯುತ್ತದೆ.`,
                mr: `धन-लाभ अष्टकवर्ग व खर्च नियंत्रण: आपल्या धन भावात ${n(savByHouse[2])} व लाभ भावात ${n(savByHouse[11])} बिंदू आहेत; तथापि व्ययेश ${house12Info.lordName} (${n(house12Info.placedHouse)}वे स्थान) अचानक खर्च दर्शवत असल्याने बचतीची शिस्त हवी. '${yogiPlanetName}' योगी बळाचा वापर करून अचल संपत्तीत गुंतवणूक केल्यास धन स्थिर राहील.`,
                hi: `धन-लाभ अष्टकवर्ग एवं व्यय नियंत्रण सूत्र: द्वितीय धन भाव में ${n(savByHouse[2])} एवं एकादश लाभ भाव में ${n(savByHouse[11])} बिंदू हैं; किंतु द्वादशेश ${house12Info.lordName} (${n(house12Info.placedHouse)}वें भाव) के कारण आकस्मिक व्यय पर अंकुश आवश्यक है। योगी '${yogiPlanetName}' के बल से अचल संपत्ति में संचय समृद्धि को चिरस्थायी बनाता है।`,
                te: `ధన-లాభ అష్టకవర్గ మరియు ఖర్చు నియంత్రణ: 2వ ధన స్థానంలో ${n(savByHouse[2])} మరియు 11వ లాభ స్థానంలో ${n(savByHouse[11])} బిందువులు ఉన్నాయి; అయితే వ్యయాధిపతి ${house12Info.lordName} కారణంగా అనవసర ఖర్చులపై అదుపు అవసరం. యోగి '${yogiPlanetName}' బలంతో స్థిర ఆస్తులలో పొదుపు చేయడం శ్రేయస్కరం.`,
                ta: `தன-லாப அஷ்டகவர்க்கம் மற்றும் செலவு கட்டுப்பாடு: 2-ம் தன இடத்தில் ${n(savByHouse[2])} பரல்களும் 11-ம் லாப இடத்தில் ${n(savByHouse[11])} பரல்களும் உள்ளன; 12-ம் அதிபதி ${house12Info.lordName} திடீர் செலவுகளைத் தரக்கூடும் என்பதால் சேமிப்பு ஒழுக்கம் அவசியம். யோகி '${yogiPlanetName}' பலத்தால் நிலையான சொத்துகளில் முதலீடு செய்ய செல்வம் தங்கும்.`,
                en: `Wealth & Reserve Precision Audit: House 2 (${savByHouse[2]} bindus, lord ${house2Info.lordName}) and House 11 (${savByHouse[11]} bindus, lord ${house11Info.lordName}) generate steady cash flow, whereas 12th expense lord ${house12Info.lordName} in House ${house12Info.placedHouse} creates sudden outflow leaks. Aligning durable asset retention with Yogi ${yogiPlanetName} seals leakage.`
              },
              targetLang
            ),
        anchors: [
          `${n(savByHouse[2])} (${house2Info.lordName})`,
          `${n(savByHouse[11])} (${house11Info.lordName})`,
          `${house12Info.lordName} → ${n(house12Info.placedHouse)}`
        ]
      },
      14: {
        text: isMinor
          ? pick6(
              {
                kn: `ಕೌಟುಂಬಿಕ ಸುರಕ್ಷೆ ಮತ್ತು ಗೃಹ ಶಾಂತಿ ಗಣಿತ: ೪ನೇ ಗೃಹ ಸ್ಥಾನಾಧಿಪತಿ ${house4Info.lordName} (${n(house4Info.placedHouse)}ನೇ ಮನೆ, ${house4Info.placedRashi}) ಹಾಗೂ ಚಂದ್ರ-ಶುಕ್ರರ ಸ್ಥಿತಿಯು ಕುಟುಂಬದಲ್ಲಿ ಮಗುವಿಗೆ ದೊರೆಯುವ ಬೆಚ್ಚಗಿನ ಪ್ರೀತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಮನೆಯ ಹಿರಿಯರು ಶಾಂತ, ಪ್ರೀತಿಪೂರ್ಣ ಸಂಭಾಷಣೆಯನ್ನು ಕಾಪಾಡಿಕೊಂಡರೆ ಮಗುವಿನ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಸಂಸ್ಕಾರ ಸದೃಢವಾಗಿ ಬೆಳೆಯುತ್ತದೆ.`,
                mr: `कौटुंबिक सुरक्षितता व गृह शांती: चतुर्थेश ${house4Info.lordName} (${n(house4Info.placedHouse)}वे स्थान, ${house4Info.placedRashi}) घरात बालकासाठी प्रेमळ व सुरक्षित वातावरण दर्शवतात. ज्येष्ठांच्या संवादामुळे मुलांचा आत्मविश्वास बहरतो.`,
                hi: `पारिवारिक संरक्षण एवं गृह शांति गणित: चतुर्थेश ${house4Info.lordName} (${n(house4Info.placedHouse)}वें भाव, ${house4Info.placedRashi}) घर में बालक के लिए स्नेहमय एवं सुरक्षित परिवेश दर्शाते हैं। बड़ों का मधुर व्यवहार बालक के संस्कारों को पुष्ट करता है।`,
                te: `కుటుంబ రక్షణ మరియు గృహ శాంతి గణితం: చతుర్థాధిపతి ${house4Info.lordName} (${n(house4Info.placedHouse)}వ స్థానం, ${house4Info.placedRashi}) కుటుంబంలో ప్రేమపూర్వక వాతావరణాన్ని సూచిస్తుంది. పెద్దల ప్రశాంతత పిల్లల మనోవికాసానికి బలాన్నిస్తుంది.`,
                ta: `குடும்ப பாதுகாப்பு மற்றும் இல்லற அமைதி: 4-ம் அதிபதி ${house4Info.lordName} (${n(house4Info.placedHouse)}-ம் வீடு, ${house4Info.placedRashi}) குழந்தைக்கு அன்பான குடும்பச் சூழலைக் காட்டுகிறார். பெரியவர்களின் ஒற்றுமை குழந்தையின் நம்பிக்கையை வளர்க்கும்.`,
                en: `Domestic Sanctuary Audit: 4th lord ${house4Info.lordName} residing in House ${house4Info.placedHouse} (${house4Info.placedRashi}) establishes deep maternal and household shelter for this young life, nurturing lifelong emotional security through gentle family dialogue.`
              },
              targetLang
            )
          : pick6(
              {
                kn: `ಸಪ್ತಮ ಭಾವ ಅಷ್ಟಕವರ್ಗ ಹಾಗೂ ಸಂಬಂಧ ಸಾಮರಸ್ಯ: ನಿಮ್ಮ ೭ನೇ ಸಪ್ತಮ ಸ್ಥಾನದಲ್ಲಿ ${n(savByHouse[7])} ಬಿಂದುಗಳಿದ್ದು, ಸಪ್ತಮೇಶ ${house7Info.lordName} (${n(house7Info.placedHouse)}ನೇ ಭಾವ) ಹಾಗೂ ಚತುರ್ಥೇಶ ${house4Info.lordName} (${n(house4Info.placedHouse)}ನೇ ಭಾವ) ಗೃಹ ಸುಖವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತಾರೆ. ${combustNote}. ಅಲ್ಲದೆ ಬಾಧಕ ಸ್ಥಾನ (${n(badhakaHouse)}ನೇ ಮನೆ) ಪ್ರಭಾವದಿಂದ ಸಣ್ಣ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ದೊಡ್ಡದಾಗದಂತೆ ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ತಾಳ್ಮೆಯಿಂದ ಸಂವಹನ ನಡೆಸುವುದು ದೀರ್ಘಕಾಲಿಕ ಸೌಹಾರ್ದತೆಗೆ ಕೀಲಿಕೈಯಾಗಿದೆ.`,
                mr: `सप्तम भाव अष्टकवर्ग व कौटुंबिक सलोखा: सप्तम भावात ${n(savByHouse[7])} बिंदू असून सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वे स्थान) व चतुर्थेश ${house4Info.lordName} वैवाहिक सौख्य दर्शवतात. ${combustNote}. छोट्या गैरसमजांपासून दूर राहून शांत संवादाने नात्यातील गोडवा टिकवून ठेवता येतो.`,
                hi: `सप्तम भाव अष्टकवर्ग एवं दांपत्य सामंजस्य: सप्तम भाव में ${n(savByHouse[7])} बिंदू हैं तथा सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वें भाव) एवं चतुर्थेश ${house4Info.lordName} गृह सुख का निर्धारण करते हैं। ${combustNote}। पारस्परिक सम्मान और धैर्यपूर्ण संवाद से हर वैचारिक दूरी सहज ही मिट जाती है।`,
                te: `సప్తమ భావ అష్టకవర్గ మరియు సంబంధాల సామరస్యం: 7వ స్థానంలో ${n(savByHouse[7])} బిందువులు ఉండి, సప్తమాధిపతి ${house7Info.lordName} (${n(house7Info.placedHouse)}వ స్థానం) మరియు చతుర్థాధిపతి ${house4Info.lordName} కుటుంబ శాంతిని నిర్ణయిస్తారు. ${combustNote}. పరస్పర గౌరవం, సహనంతో దాంపత్యం బలపడుతుంది.`,
                ta: `சப்தம பாவ அஷ்டகவர்க்கம் மற்றும் இல்லற ஒற்றுமை: 7-ம் இடத்தில் ${n(savByHouse[7])} பரல்கள் உள்ளன; 7-ம் அதிபதி ${house7Info.lordName} (${n(house7Info.placedHouse)}-ம் வீடு) மற்றும் 4-ம் அதிபதி ${house4Info.lordName} குடும்ப மகிழ்ச்சியை நிர்ணயிக்கின்றனர். ${combustNote}. விட்டுக்கொடுத்து பேசுவதே நீடித்த மகிழ்ச்சிக்கு அடிப்படை.`,
                en: `Partnership & Domestic Equilibrium Audit: House 7 registers ${savByHouse[7]} SAV bindus with 7th lord ${house7Info.lordName} in House ${house7Info.placedHouse} paired against 4th domestic lord ${house4Info.lordName} in House ${house4Info.placedHouse}. Since ${combustNote}, prioritizing quiet listening over pride dissolves friction instantly.`
              },
              targetLang
            ),
        anchors: [
          `${house7Info.lordName} (${n(house7Info.placedHouse)})`,
          `${n(savByHouse[7])}`,
          `${house4Info.lordName} (${n(house4Info.placedHouse)})`
        ]
      },
      15: {
        text: pick6(
          {
            kn: `ಪಂಚಮ ಪೂರ್ವಪುಣ್ಯ ಅಷ್ಟಕವರ್ಗ: ೫ನೇ ಭಾವದಲ್ಲಿ ${n(savByHouse[5])} ಬಿಂದುಗಳು ಹಾಗೂ ಪಂಚಮೇಶ ${house5Info.lordName} (${n(house5Info.placedHouse)}ನೇ ಭಾವ, ${house5Info.placedRashi}) ಸ್ಥಿತನಾಗಿರುವುದರ ಜೊತೆಗೆ ಭಾಗ್ಯಾಧಿಪತಿ ${house9Info.lordName} ವಂಶ ಪರಂಪರೆಗೆ ಆಶೀರ್ವಾದ ನೀಡುತ್ತಿದ್ದಾರೆ. ${retroNote}. ${isMinor ? "ಕಂದನ ಬುದ್ಧಿಶಕ್ತಿ ಮತ್ತು ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ ವಿಕಸಿಸಲು ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಗುರು ಸ್ಮರಣೆ ಪರಮ ಶ್ರೇಷ್ಠವಾಗಿದೆ." : "ಸಂತಾನದ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಸೃಜನಶೀಲ ಕೀರ್ತಿಗಾಗಿ ಪಿತೃ ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಮಕ್ಕಳೊಂದಿಗೆ ಸ್ನೇಹಯುತ ಸಂಭಾಷಣೆ ನಡೆಸುವುದು ವಂಶದ ಬೆಳಕನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ."}`,
            mr: `पंचम पूर्वपुण्य अष्टकवर्ग: पंचम भावात ${n(savByHouse[5])} बिंदू व पंचमेश ${house5Info.lordName} (${n(house5Info.placedHouse)}वे स्थान, ${house5Info.placedRashi}) असून भाग्याधिपती ${house9Info.lordName} वंशवृद्धीस पाठबळ देतात. ${retroNote}. ${isMinor ? "बालकाच्या सर्जनशील बुद्धीला ज्येष्ठांचे मार्गदर्शन लाभदायक ठरेल." : "संतातीच्या प्रगतीसाठी वडिलधाऱ्यांचा आशीर्वाद व मुलांशी स्नेहपूर्ण संवाद ठेवणे अत्यंत शुभ आहे."}`,
            hi: `पंचम पूर्वपुण्य अष्टकवर्ग गणित: पंचम भाव में ${n(savByHouse[5])} बिंदू एवं पंचमेश ${house5Info.lordName} (${n(house5Info.placedHouse)}वें भाव) के साथ भाग्येश ${house9Info.lordName} कुल की परंपरा को आलोकित करते हैं। ${retroNote}। ${isMinor ? "बालक की प्रतिभा को गुरुजनों एवं पूर्वजों का आशीर्वाद सहज प्रस्फुटित करेगा।" : "संतान उन्नति एवं वंश प्रतिष्ठा हेतु पितरों के प्रति कृतज्ञता व बच्चों से स्नेहपूर्ण संवाद रखें।"}`,
            te: `పంచమ పూర్వపుణ్య అష్టకవర్గ గణితం: 5వ స్థానంలో ${n(savByHouse[5])} బిందువులు, పంచమాధిపతి ${house5Info.lordName} (${n(house5Info.placedHouse)}వ స్థానం) మరియు భాగ్యాధిపతి ${house9Info.lordName} వంశాభివృద్ధికి బలాన్నిస్తాయి. ${retroNote}. ${isMinor ? "పిల్లల సృజనాత్మకతకు పెద్దల మార్గదర్శనం ఎంతో తోడ్పడుతుంది." : "పిల్లలతో స్నేహపూర్వక సంభాషణ మరియు పూర్వీకుల స్మరణ వంశ గౌరవాన్ని పెంచుతుంది."}`,
            ta: `பஞ்சம பூர்வ புண்ணிய அஷ்டகவர்க்கம்: 5-ம் இடத்தில் ${n(savByHouse[5])} பரல்கள், 5-ம் அதிபதி ${house5Info.lordName} (${n(house5Info.placedHouse)}-ம் வீடு) மற்றும் பாக்கியாதிபதி ${house9Info.lordName} வம்சப் பெருமையைக் காக்கின்றனர். ${retroNote}. ${isMinor ? "குழந்தையின் அறிவுத் திறனுக்கு பெரியோரின் வழிகாட்டல் துணை நிற்கும்." : "குழந்தைகளுடன் அன்பான உரையாடலும் முன்னோர் ஆசியும் வம்சத்தை செழிக்கச் செய்யும்."}`,
            en: `Purva Punya & Progeny Audit: House 5 scores ${savByHouse[5]} SAV bindus with 5th lord ${house5Info.lordName} in House ${house5Info.placedHouse} harmonized by 9th fortune lord ${house9Info.lordName}. Because ${retroNote}, patient encouragement and ancestral gratitude unlock deep creative and generational fulfillment.`
          },
          targetLang
        ),
        anchors: [
          `${house5Info.lordName} (${n(house5Info.placedHouse)})`,
          `${n(savByHouse[5])}`,
          `${house9Info.lordName} (${n(house9Info.placedHouse)})`
        ]
      },
      16: {
        text: pick6(
          {
            kn: `ಜೀವಶಕ್ತಿ-ಆಯುಷ್ಯದ ಸಮಗ್ರ ಗಣಿತ: ಲಗ್ನ ಬಲವು ${n(savByHouse[1])} ಬಿಂದುಗಳು, ೬ನೇ ರೋಗ ಸ್ಥಾನಾಧಿಪತಿ ${house6Info.lordName} (${n(house6Info.placedHouse)}ನೇ ಭಾವ) ಹಾಗೂ ೮ನೇ ಆಯುಷ್ಯ ಸ್ಥಾನಾಧಿಪತಿ ${house8Info.lordName} (${n(house8Info.placedHouse)}ನೇ ಭಾವ) ನಿಮ್ಮ ಶಾರೀರಿಕ ತಾಳ್ಮೆಯನ್ನು ತೋರಿಸುತ್ತವೆ. ${knotNote}. ${isSenior ? "ವಯೋಸಹಜ ಆರೋಗ್ಯದ ರಕ್ಷಣೆಗೆ ನಿತ್ಯ ಲಘು ವಾಕಿಂಗ್, ಶುದ್ಧ ಆಹಾರ ಹಾಗೂ ಕಾಲೋಚಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಯನ್ನು ತಪ್ಪದೆ ಪಾಲಿಸುವುದು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ರಕ್ಷಾ ಕವಚವಾಗಿದೆ." : "ನಿಯಮಿತ ನಿದ್ರೆ, ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡವನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಹುದುಗಿಸದಿರುವುದು ನಿಮ್ಮ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಸದಾ ಉತ್ತುಂಗದಲ್ಲಿಡುತ್ತದೆ."}`,
            mr: `प्राणशक्ती व दीर्घायुष्य गणित: लग्न स्थानात ${n(savByHouse[1])} बिंदू, षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वे स्थान) व अष्टमेश ${house8Info.lordName} शारीरिक क्षमता दर्शवतात. ${knotNote}. ${isSenior ? "नियमित हलका व्यायाम, सात्त्विक आहार व आरोग्य तपासणी दीर्घायुष्याचे रक्षण करते." : "नियमित झोप, वेळेवर भोजन व मानसिक ताण हलका केल्यास प्राणशक्ती उत्तम राहते."}`,
            hi: `प्राणशक्ति एवं दीर्घायु परीक्षण: लग्न में ${n(savByHouse[1])} बिंदू, षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वां भाव) एवं अष्टमेश ${house8Info.lordName} आपकी शारीरिक प्रतिरोधक क्षमता दर्शाते हैं। ${knotNote}। ${isSenior ? "नियमित प्रातः भ्रमण, सात्त्विक आहार एवं समयोचित स्वास्थ्य जांच दीर्घायु की रक्षा करते हैं।" : "समय पर विश्राम, संतुलित भोजन और मानसिक तनाव से मुक्ति आपकी जीवन ऊर्जा को अक्षुण्ण रखती है।"}`,
            te: `జీవశక్తి మరియు ఆయురారోగ్య గణితం: లగ్నంలో ${n(savByHouse[1])} బిందువులు, షష్టాధిపతి ${house6Info.lordName} మరియు అష్టమాధిపతి ${house8Info.lordName} మీ శరీర బలాన్ని సూచిస్తాయి. ${knotNote}. ${isSenior ? "నడక, సాత్విక ఆహారం మరియు క్రమబద్ధమైన ఆరోగ్య పరీక్షలు ఆయురారోగ్యాలను కాపాడుతాయి." : "సరైన నిద్ర, వేళకు భోజనం మరియు ఒత్తిడిని తగ్గించుకోవడం ఆరోగ్యానికి శ్రీరామరక్ష."}`,
            ta: `உடல் வலிமை மற்றும் ஆயுள் கணிதம்: லக்னத்தில் ${n(savByHouse[1])} பரல்கள், 6-ம் அதிபதி ${house6Info.lordName} மற்றும் 8-ம் அதிபதி ${house8Info.lordName} உடல் எதிர்ப்பு சக்தியைக் காட்டுகின்றன. ${knotNote}. ${isSenior ? "நடைப்பயிற்சி, எளிய உணவு மற்றும் முறையான மருத்துவ பரிசோதனை நீண்ட ஆயுளைப் பாதுகாக்கும்." : "முறையான தூக்கம், சரியான நேர உணவு மற்றும் மன அமைதி பிராண சக்தியை எப்போதும் காக்கும்."}`,
            en: `Vitality & Longevity Integration: Lagna SAV strength (${savByHouse[1]} bindus) works alongside 6th resistance lord ${house6Info.lordName} (House ${house6Info.placedHouse}) and 8th longevity lord ${house8Info.lordName} (House ${house8Info.placedHouse}). ${knotNote}. Guarding restorative sleep cycles, pure sattvic hydration, and steady nervous calm preserves lifelong vigor.`
          },
          targetLang
        ),
        anchors: [
          `${n(savByHouse[1])} (${lagnaRashiName})`,
          `${house6Info.lordName} (${n(house6Info.placedHouse)})`,
          `${house8Info.lordName} (${n(house8Info.placedHouse)})`
        ]
      }
    };
    const chosen = map[chapterNumber] || map[12];
    extraParagraph = chosen.text;
    precisionAnchors = chosen.anchors;
  } else if (chBand === "horizon") {
    const ch17or18 =
      chapterNumber === 17
        ? pick6(
            {
              kn: `ಮುಂದಿನ ೯೦ ದಿನಗಳ ದಶಾ-ತಾರಾ ಸಮನ್ವಯ: ಪ್ರಸ್ತುತ '${mahaNatureLabel}' ಸ್ವರೂಪದ ${currentMahadasha} ದಶೆಯೊಳಗೆ ${currentBhuktiLord} ಅಂತರ್ದಶೆಯು ${n(bhuktiEndDate)} ರವರೆಗೆ ಸಾಗುತ್ತಿದ್ದು, ಇಂದಿನ ತಾರಾಬಲ '${taraLabelLocalized}' (${n(liveTarabala.score)}%) ನಿಮ್ಮ ಆರಂಭಿಕ ವೇಗವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ${guruHouseFromMoon === 2 || guruHouseFromMoon === 5 || guruHouseFromMoon === 7 || guruHouseFromMoon === 9 || guruHouseFromMoon === 11 ? "ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು" : "ಶಾಂತ ತಾಳ್ಮೆಯು"} ಮುಂದಿನ ೯೦ ದಿನಗಳ ನಿರ್ಣಾಯಕ ಮಾತುಕತೆಗಳಲ್ಲಿ ನಿಮಗೆ ಜಯ ತಂದುಕೊಡುತ್ತದೆ.`,
              mr: `आगामी ९० दिवसांचे दशा-तारा समन्व्य: चालू ${currentMahadasha} – ${currentBhuktiLord} अंतर्दशा (${n(bhuktiEndDate)} पर्यंत) व आजचे '${taraLabelLocalized}' (${n(liveTarabala.score)}%) बळ सुरुवातीची गती दर्शवतात. संयम व स्पष्ट नियोजनाने या तिमाहीत महत्त्वाची कामे पूर्ण होतील.`,
              hi: `आगामी ९० दिनों का दशा-तारा समन्वय: वर्तमान ${currentMahadasha} – ${currentBhuktiLord} अंतर्दशा (${n(bhuktiEndDate)} तक) तथा '${taraLabelLocalized}' (${n(liveTarabala.score)}%) ताराबल आपकी प्रारंभिक गति तय करते हैं। धैर्य और स्पष्ट योजना से इस तिमाही के प्रमुख कार्य पूर्ण होंगे।`,
              te: `రాబోయే 90 రోజుల దశా-తారా సమన్వయం: ప్రస్తుతం ${currentMahadasha} – ${currentBhuktiLord} అంతర్దశ (${n(bhuktiEndDate)} వరకు) మరియు '${taraLabelLocalized}' (${n(liveTarabala.score)}%) బలం మీ తక్షణ వేగాన్ని సూచిస్తున్నాయి. క్రమశిక్షణతో ముఖ్య పనులు పూర్తవుతాయి.`,
              ta: `அடுத்த 90 நாட்களின் தசா-தாரை ஒருங்கிணைப்பு: நடப்பு ${currentMahadasha} – ${currentBhuktiLord} புக்தி (${n(bhuktiEndDate)} வரை) மற்றும் '${taraLabelLocalized}' (${n(liveTarabala.score)}%) தாராபலம் உங்கள் ஆரம்ப வேகத்தைக் காட்டுகின்றன. நிதானமான திட்டமிடல் முக்கிய பணிகளை நிறைவேற்றும்.`,
              en: `Precision 90-Day Alignment: running '${mahaNatureLabel}' ${currentMahadasha}–${currentBhuktiLord} (through ${bhuktiEndDate}) synchronized with today's '${taraLabelLocalized}' (${liveTarabala.score}%) reveals clear tactical traction once administrative details are verified calmly.`
            },
            targetLang
          )
        : pick6(
            {
              kn: `ಬೃಗು ಬಿಂದು (${bhriguBinduRashiName}, ${n(bhriguDeg)}) ಹಾಗೂ ಕರ್ಮ-ಲಾಭ ಸಮನ್ವಯ: ರಾಹು-ಚಂದ್ರ ಮಧ್ಯಬಿಂದುವಿನ ಮೇಲೆ ಶುಭ ದೃಷ್ಟಿ ಬೀಳುವ ೪–೬ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ, ನಿಮ್ಮ ${n(savByHouse[10])} ಬಿಂದುಗಳ ಕರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ${n(savByHouse[11])} ಬಿಂದುಗಳ ಲಾಭ ಸ್ಥಾನಗಳು ಜಾಗೃತಗೊಳ್ಳುತ್ತವೆ. ${isMinor ? "ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ, ಪ್ರತಿಭಾ ಪ್ರದರ್ಶನ ಹಾಗೂ ಗುರು-ಪೋಷಕರ ಮೆಚ್ಚುಗೆಗೆ ಇದು ಅತ್ಯುತ್ತಮ ಅವಧಿಯಾಗಲಿದೆ." : "ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಬಡ್ತಿ, ವ್ಯವಹಾರ ವಿಸ್ತರಣೆ ಅಥವಾ ಕುಟುಂಬದ ಆಸ್ತಿ ಮಾತುಕತೆಗಳು ಸ್ಪಷ್ಟ ರೂಪ ಪಡೆದು ಶುಭ ತಿರುವು ನೀಡುತ್ತವೆ."}`,
              mr: `भृगु बिंदू (${bhriguBinduRashiName}, ${n(bhriguDeg)}) व कर्म-लाभ संयोग: पुढील ४–६ महिन्यांत या बिंदूशी शुभ ग्रह संबंध आल्यावर आपल्या ${n(savByHouse[10])} कर्म व ${n(savByHouse[11])} लाभ बिंदूंना गती मिळते. ${isMinor ? "अभ्यास व कलागुणांमध्ये विशेष यश मिळेल." : "रखडलेले काम, बढती किंवा संपत्तीचे विषय सकारात्मक वळण घेतील."}`,
              hi: `भृगु बिंदु (${bhriguBinduRashiName}, ${n(bhriguDeg)}) एवं कर्म-लाभ संयोग: ४–६ मास की अवधि में शुभ गोचर का संबंध बनते ही आपके ${n(savByHouse[10])} कर्म तथा ${n(savByHouse[11])} लाभ बिंदुओं की ऊर्जा जागृत होती है। ${isMinor ? "विद्या एवं रचनात्मक क्षेत्र में प्रशंसा प्राप्त होगी।" : "पदोन्नति, व्यवसाय विस्तार अथवा संपत्ति के निर्णय अनुकूल परिणाम देंगे।"}`,
              te: `భృగు బిందువు (${bhriguBinduRashiName}, ${n(bhriguDeg)}) మరియు కర్మ-లాభ యోగం: రాబోయే 4–6 నెలల్లో శుభ గ్రహ దృష్టితో మీ ${n(savByHouse[10])} కర్మ మరియు ${n(savByHouse[11])} లాభ బిందువులు చైతన్యవంతమవుతాయి. ${isMinor ? "చదువు మరియు కళలలో ప్రగతి కనిపిస్తుంది." : "ఆగిపోయిన పదోన్నతులు, వ్యాపార మరియు గృహ ప్రయత్నాలు ఫలిస్తాయి."}`,
              ta: `பிருகு பிந்து (${bhriguBinduRashiName}, ${n(bhriguDeg)}) மற்றும் தொழில்-லாப இணைவு: 4–6 மாதங்களில் சுப கிரக பார்வை சேரும்போது ${n(savByHouse[10])} தொழில் மற்றும் ${n(savByHouse[11])} லாப பரல்கள் பலன் தரும். ${isMinor ? "கல்வி மற்றும் தனித்திறமையில் பாராட்டு கிடைக்கும்." : "தடைபட்ட பதவி உயர்வு, வியாபார வளர்ச்சி மற்றும் சொத்து முயற்சிகள் வெற்றியாகும்."}`,
              en: `Bhrigu Bindu Timing Matrix (${bhriguBinduRashiName} at ${bhriguDeg}): as Months 4–6 transits aspect this coordinate, House 10 (${savByHouse[10]} bindus) and House 11 (${savByHouse[11]} bindus) synchronize. ${isMinor ? `Academic brilliance and joyful recognition unfold naturally.` : `Stalled promotions, asset planning, and recognition crystallize smoothly.`}`
            },
            targetLang
          );

    const yearHorizonExtra = pick6(
      {
        kn: `ಪಂಚವಾರ್ಷಿಕ ಅಷ್ಟಕವರ್ಗ-ಭುಕ್ತಿ ಸ್ಥಿರತೆ: ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಧನ (${n(savByHouse[2])}), ಪಂಚಮ (${n(savByHouse[5])}), ಸಪ್ತಮ (${n(savByHouse[7])}) ಮತ್ತು ಕರ್ಮ (${n(savByHouse[10])}) ಬಿಂದುಗಳ ಜೊತೆಗೆ '${dignStr}' ಗ್ರಹ ಬಲವು ನಿಮ್ಮ ದೀರ್ಘಕಾಲಿಕ ಪಯಣಕ್ಕೆ ಭದ್ರ ಬುನಾದಿ ಹಾಕಿದೆ. '${yogiPlanetName}' ಯೋಗಿ ತತ್ವವನ್ನು ಅನುಸರಿಸುತ್ತಾ, ${n(bhuktiEndDate)} ರ ನಂತರ ಬರುವ ದಶಾ ಪರ್ವಗಳಲ್ಲಿ ಶಾಂತಚಿತ್ತದೊಂದಿಗೆ ಮುನ್ನಡೆದರೆ ಪ್ರತಿಯೊಂದು ವರ್ಷವೂ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ ತರುತ್ತದೆ.`,
        mr: `पंचवार्षिक अष्टकवर्ग व दशा स्थैर्य: आपल्या पत्रिकेतील धन (${n(savByHouse[2])}), पंचम (${n(savByHouse[5])}), सप्तम (${n(savByHouse[7])}) व कर्म (${n(savByHouse[10])}) बिंदू तसेच '${dignStr}' या ग्रहांचे बळ दीर्घकालीन प्रगतीची भक्कम हमी देतात. '${yogiPlanetName}' योगी तत्त्वाचा अवलंब करून ${n(bhuktiEndDate)} नंतरच्या टप्प्यांत पुढे गेल्यास प्रत्येक वर्ष स्थैर्य व कीर्ती देणारे ठरेल.`,
        hi: `पंचवर्षीय अष्टकवर्ग एवं दशा स्थायित्व: आपकी कुंडली के धन (${n(savByHouse[2])}), पंचम (${n(savByHouse[5])}), सप्तम (${n(savByHouse[7])}) तथा कर्म (${n(savByHouse[10])}) बिंदू एवं '${dignStr}' का ग्रह बल दीर्घकालीन प्रगति की सुदृढ़ गारंटी देता है। योगी '${yogiPlanetName}' के नियमों व धैर्य के साथ ${n(bhuktiEndDate)} के आगामी चरणों में बढ़ने पर प्रत्येक वर्ष परिवार की प्रतिष्ठा बढ़ाएगा।`,
        te: `పంచవర్ష అష్టకవర్గ మరియు దశా స్థిరత్వం: మీ కుండలిలోని ధన (${n(savByHouse[2])}), పంచమ (${n(savByHouse[5])}), సప్తమ (${n(savByHouse[7])}) మరియు కర్మ (${n(savByHouse[10])}) బిందువులు మరియు '${dignStr}' బలం మీ ఐదేళ్ల ప్రగతికి గట్టి పునాది. యోగి '${yogiPlanetName}' మార్గదర్శనంలో ${n(bhuktiEndDate)} తదుపరి దశలు కుటుంబానికి కీర్తి మరియు స్థిరత్వాన్ని అందిస్తాయి.`,
        ta: `ஐந்தாண்டு அஷ்டகவர்க்கம் மற்றும் தசா உறுதி: உங்கள் ஜாதகத்தின் தன (${n(savByHouse[2])}), பஞ்சம (${n(savByHouse[5])}), சப்தம (${n(savByHouse[7])}) மற்றும் தொழில் (${n(savByHouse[10])}) பரல்களும் '${dignStr}' பலமும் நீண்ட கால வளர்ச்சிக்கு வலுவான அடித்தளம் இடுகின்றன. யோகி '${yogiPlanetName}' வழியில் ${n(bhuktiEndDate)}-க்குப் பிந்தைய காலத்தில் ஒவ்வொரு ஆண்டும் குடும்பத்திற்குப் பெருமையும் நிதி உறுதியும் சேர்க்கும்.`,
        en: `5-Year Sarvashtakavarga & Sub-Period Grounding: balanced bindus across Wealth (${savByHouse[2]}), Creativity (${savByHouse[5]}), Harmony (${savByHouse[7]}), and Karma (${savByHouse[10]}) supported by '${dignStr}' secure your multi-year horizon. Moving mindfully past the ${bhuktiEndDate} Bhukti shift aligned with Yogi ${yogiPlanetName} steadily converts long-term effort into generational serenity.`
      },
      targetLang
    );

    const anchorHorizon =
      chapterNumber === 17
        ? [`${currentMahadasha} – ${currentBhuktiLord}`, `${taraLabelLocalized}`, `${n(bhuktiEndDate)}`]
        : chapterNumber === 18
        ? [`${bhriguBinduRashiName} (${n(bhriguDeg)})`, `${n(savByHouse[10])} / ${n(savByHouse[11])}`, `${yogiPlanetName}`]
        : [`${dignStr}`, `${n(savByHouse[10])} / ${n(savByHouse[2])}`, `${n(bhuktiEndDate)}`];

    extraParagraph = chapterNumber === 17 || chapterNumber === 18 ? ch17or18 : yearHorizonExtra;
    precisionAnchors = anchorHorizon;
  } else {
    // REMEDY CHAPTERS (23, 24, 25)
  const ch23Extra = pick6(
    {
      kn: `ದೋಷ ಪರಿಹಾರದ ನಿಖರ ಚಿಕಿತ್ಸಾ ಕ್ರಮ: ನಿಮ್ಮ ಲಗ್ನಕ್ಕೆ ${n(badhakaHouse)}ನೇ ಭಾವದ ಬಾಧಕಾಧಿಪತಿ ${badhakaInfo.lordName} ಹಾಗೂ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿ ಮತ್ತು ${knotNote} ಇವುಗಳ ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವವನ್ನು ಗಮನದಲ್ಲಿರಿಸಿಕೊಂಡು, ಪ್ರದರ್ಶನದ ದುಬಾರಿ ವಿಧಿಗಳಿಗಿಂತ ಶುದ್ಧ ವೈದಿಕ ಸಂಕಲ್ಪವನ್ನು ಆರಿಸಿರಿ. ಅಲ್ಲದೆ ನಿಮ್ಮ ಯೋಗಿ ಗ್ರಹವಾದ '${yogiPlanetName}' ದೇವತಾ ಆರಾಧನೆಯನ್ನು ಬಾಧಕ ಹಾಗೂ ದೋಷ ಶಾಂತಿಯೊಂದಿಗೆ ಜೋಡಿಸುವುದರಿಂದ, ಭಂಗ ಯೋಗಗಳು ವೇಗವಾಗಿ ಜಾಗೃತವಾಗಿ ಜೀವನದ ಹಾದಿ ಸುಗಮವಾಗುತ್ತದೆ.`,
      mr: `दोष निवारणाची अचूक पद्धत: आपल्या लग्नाचा बाधक स्वामी ${badhakaInfo.lordName} (${n(badhakaHouse)}वे स्थान), ${n(maandiHouse)}व्या स्थानातील मांदी आणि ${knotNote} यांचा विचार करता महागड्या अवडंबरापेक्षा शुद्ध वैदिक संकल्प व योगी ग्रह '${yogiPlanetName}' ची उपासना अधिक प्रभावी ठरते. यामुळे सर्व अडथळे शांत होऊन मार्ग सुकर होतो.`,
      hi: `दोष निवारण की सटीक वैज्ञानिक विधि: आपके लग्न के बाधक स्वामी ${badhakaInfo.lordName} (${n(badhakaHouse)}वां भाव), ${n(maandiHouse)}वें भाव की मांदी एवं ${knotNote} को देखते हुए आडंबरपूर्ण उपायों के स्थान पर शुद्ध वैदिक संकल्प तथा योगी ग्रह '${yogiPlanetName}' की आराधना ही सर्वाधिक फलदायी है। इससे समस्त कर्म ग्रंथियां सहज खुल जाती हैं।`,
      te: `దోష నివారణ ఖచ్చితమైన పద్ధతి: మీ లగ్నానికి ${n(badhakaHouse)}వ బాధకాధిపతి ${badhakaInfo.lordName}, ${n(maandiHouse)}వ స్థాన మాంది మరియు ${knotNote} ఆధారంగా, అనవసర ఖర్చుల కంటే శుద్ధ వైదిక సంకల్పం మరియు యోగి గ్రహం '${yogiPlanetName}' ఆరాధన ఎంతో శ్రేయస్కరం. తద్వారా కష్టాలు తొలగి శాంతి లభిస్తుంది.`,
      ta: `தோஷ நிவர்த்தியின் துல்லிய முறை: உங்கள் லக்னத்தின் ${n(badhakaHouse)}-ம் பாதகாதிபதி ${badhakaInfo.lordName}, ${n(maandiHouse)}-ம் இட மாந்தி மற்றும் ${knotNote} ஆகியவற்றை ஆராய்ந்து பார்க்கையில், ஆடம்பரப் பரிகாரங்களை விட தூய வேத சங்கல்பமும் யோகி '${yogiPlanetName}' வழிபாடும் முழுமையான நன்மையைத் தரும்.`,
      en: `Precision Diagnostic Filtering: correlating Badhaka lord ${badhakaInfo.lordName} (House ${badhakaHouse}), Maandi in House ${maandiHouse}, and degree integrity where ${knotNote} clarifies exactly which karmic knots need gentle Vedic propitiation—eliminating fear-based excess in favor of authentic Gokarna Rudrabhisheka paired with Yogi ${yogiPlanetName} devotion.`
    },
    targetLang
  );

  const ch24Extra = pick6(
    {
      kn: `ನಿತ್ಯ ಜಪದಲ್ಲಿ ವೈಯಕ್ತಿಕ ತಾರಾ-ಯೋಗಿ ಶಕ್ತಿ: ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName} (${n(nakshatraPada)}ನೇ ಪಾದ) ಮತ್ತು ಧನ ಪ್ರದಾತ ಯೋಗಿ ಗ್ರಹ ${yogiPlanetName} ತರಂಗಗಳನ್ನು ಒಂದೇ ಮಂತ್ರ ಚಕ್ರದಲ್ಲಿ ಜೋಡಿಸಲು, ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ದೀಪದ ಮುಂದೆ ೧೦ ನಿಮಿಷ ಶಾಂತವಾಗಿ ಕುಳಿತು '${yogiPlanetName}' ದಿನದಂದು ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ. ಈ ಸರಳ ನಿರಂತರ ಅಭ್ಯಾಸವು ನಿಮ್ಮ ಅಂತರಂಗದ ಒತ್ತಡವನ್ನು ತಗ್ಗಿಸಿ ಬುದ್ಧಿಯಲ್ಲಿ ದೈವಿಕ ಸ್ಪಷ್ಟತೆಯನ್ನು ತುಂಬುತ್ತದೆ.`,
      mr: `दैनिक जपातील तारा-योगी शक्ती: आपले नक्षत्र ${nakshatraName} (चरण ${n(nakshatraPada)}) व योगी ग्रह '${yogiPlanetName}' यांची ऊर्जा एकत्रित करण्यासाठी दररोज सकाळी १० मिनिटे शांत ध्यान व जप करा. हा नियमित सराव मनाची अस्थिरता दूर करून विवेक जागृत ठेवतो.`,
      hi: `दैनिक जप में नक्षत्र-योगी समन्वय: अपने जन्म नक्षत्र ${nakshatraName} (पाद ${n(nakshatraPada)}) एवं योगी ग्रह '${yogiPlanetName}' की ऊर्जा को एकीकृत करने हेतु नित्य प्रातः १० मिनट शांत दीपक के समक्ष जप करें। यह नियमित साधना मानसिक उद्वेग शांत कर दिव्य स्पष्टता प्रदान करती है।`,
      te: `నిత్య జపంలో తారా-యోగి సమన్వయం: మీ ${nakshatraName} (${n(nakshatraPada)}వ పాదం) నక్షత్రం మరియు యోగి గ్రహం '${yogiPlanetName}' శక్తిని ఏకం చేయడానికి రోజూ ఉదయం 10 నిమిషాలు దీపం ముందు ప్రశాంతంగా జపం చేయండి. ఇది మనసులోని ఆందోళనను తొలగించి స్పష్టతనిస్తుంది.`,
      ta: `தினசரி ஜபத்தில் நட்சத்திர-யோகி இணைப்பு: உங்கள் ${nakshatraName} (${n(nakshatraPada)}-ம் பாதம்) நட்சத்திரம் மற்றும் யோகி '${yogiPlanetName}' ஆற்றலை ஒருங்கிணைக்க தினமும் காலையில் 10 நிமிடங்கள் தீபத்தின் முன் அமைதியாக ஜபிக்கவும். இந்தப் பயிற்சி மன அழுத்தத்தை நீக்கித் தெளிவைத் தரும்.`,
      en: `Integrating Nakshatra & Yogi Resonance into Daily Japa: uniting your natal star ${nakshatraName} (Pada ${nakshatraPada}) with Yogi ${yogiPlanetName} in just 10 calm morning minutes before a lamp dissolves stress and harmonizes intuition across every weekly cycle.`
    },
    targetLang
  );

  const ch25Extra = pick6(
    {
      kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪೀಠದ ಪರಮ ಭರವಸೆ ಹಾಗೂ ಮನೆ-ಕುಟುಂಬದ ರಕ್ಷಣೆ: ${devoteeName}, ಈ ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಗ್ರಂಥವು ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaRashiName}), ಚಂದ್ರ ರಾಶಿ (${moonRashiName}), ${n(savByHouse[1])} ಲಗ್ನ ಬಿಂದುಗಳು, '${mahaNatureLabel}' ದಶಾ ಬಲ ಹಾಗೂ ಯೋಗಿ '${yogiPlanetName}' ಕೃಪೆಯ ಸಮ್ಮಿಲನವಾಗಿದೆ. ಕಷ್ಟಗಳು ಬಂದಾಗಲೂ ಧೈರ್ಯ ಕಳೆದುಕೊಳ್ಳದಿರಿ — ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಪ್ರಾಮಾಣಿಕ ಹೆಜ್ಜೆಯನ್ನೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನು ಕಾಯುತ್ತಿದ್ದಾನೆ; ಈ ಪವಿತ್ರ ಪುಸ್ತಕವನ್ನು ನಿಮ್ಮ ಬಳಿಯೇ ಗೌರವದಿಂದ ರಕ್ಷಿಸಿಟ್ಟುಕೊಳ್ಳಿ.`,
      mr: `श्री क्षेत्र गोकर्ण पीठाचा परम आश्वासक संदेश: प्रिय ${devoteeName}, हा संपूर्ण २५ अध्यायांचा ग्रंथ आपल्या ${lagnaRashiName} लग्न, ${moonRashiName} चंद्र राशी, '${mahaNatureLabel}' दशा बळ व योगी '${yogiPlanetName}' कृपेचा परिपाक आहे. कठीण प्रसंगातही धीर सोडू नका — श्री गोकर्ण महाबळेश्वराची कृपा सदैव आपल्या पाठीशी आहे; ही पवित्र पुस्तिका आपल्या संग्रही जतन करून ठेवा.`,
      hi: `श्री क्षेत्र गोकर्ण पीठ का परम आश्वस्त संदेश: प्रिय ${devoteeName}, यह संपूर्ण २५-अध्यायीय पुस्तिका आपके ${lagnaRashiName} लग्न, ${moonRashiName} चंद्र राशि, '${mahaNatureLabel}' दशा शक्ति एवं योगी '${yogiPlanetName}' के शुभ योग का सार है। चुनौतियों में कभी निराश न हों — भगवान महाबलेश्वर का वरदहस्त सदैव आपके साथ है; इस पावन पुस्तिका को ससम्मान अपने पास सुरक्षित रखें।`,
      te: `శ్రీ క్షేత్ర గోకర్ణ పీఠం యొక్క పరమ భరోసా: ప్రియమైన ${devoteeName}, ఈ 25 అధ్యాయాల సంపూర్ణ పుస్తకం మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశి మరియు యోగి '${yogiPlanetName}' అనుగ్రహ సారం. ఎటువంటి కష్టంలోనూ ధైర్యాన్ని కోల్పోకండి — శ్రీ గోకర్ణ మహాబలేశ్వరుని దివ్య రక్షణ ఎల్లప్పుడూ మీకు తోడుగా ఉంటుంది; ఈ పవిత్ర పుస్తకాన్ని మీ వద్దే భద్రపరుచుకోండి.`,
      ta: `ஸ்ரீ கோகர்ண பீடத்தின் இறுதி நம்பிக்கை மொழி: அன்புள்ள ${devoteeName}, இந்த 25 அத்தியாய நூல் உங்கள் ${lagnaRashiName} லக்னம், ${moonRashiName} ராசி, '${mahaNatureLabel}' தசா பலம் மற்றும் யோகி '${yogiPlanetName}' அருளின் தொகுப்பாகும். சோதனைகளிலும் மனம் தளராதீர்கள் — ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் பேரருள் எப்போதும் உங்களைப் பாதுகாக்கும்; இந்தப் புனித நூலை உங்கள் கைவசம் பாதுகாப்பாக வைத்திருங்கள்.`,
      en: `Final Gokarna Sanctuary Assurance: Dear ${devoteeName}, synthesizing your ${lagnaRashiName} ascendant, ${moonRashiName} Moon, ${savByHouse[1]}-bindu core vitality, '${mahaNatureLabel}' Mahadasha, and Yogi ${yogiPlanetName} protection confirms unwavering cosmic backing. Keep this private 25-chapter booklet close as a reassuring anchor; through every crest and valley ahead, Lord Mahabaleshwara of Gokarna shelters your journey.`
    },
    targetLang
  );

    const remedyAnchors: Record<number, string[]> = {
      23: [`${n(badhakaHouse)} (${badhakaInfo.lordName})`, `${maandiRashiName} (${n(maandiHouse)})`, `${yogiPlanetName}`],
      24: [`${nakshatraName} (${n(nakshatraPada)})`, `${yogiPlanetName}`, `${currentMahadasha}`],
      25: [`${lagnaRashiName}`, `${moonRashiName}`, `${yogiPlanetName}`]
    };

    extraParagraph = chapterNumber === 23 ? ch23Extra : chapterNumber === 24 ? ch24Extra : ch25Extra;
    precisionAnchors = remedyAnchors[chapterNumber] || [];
  }

  // 5th Holistic Chart-Specific Life Application Paragraph (strictly age-safe & pure native script)
  const fifthParagraph =
    chBand === "hook" || chBand === "secret"
      ? pick6(
          {
            kn: `ಪ್ರಾಯೋಗಿಕ ಜೀವನ ಸಮನ್ವಯ: ${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ${nakshatraName} ಹಾಗೂ ${lagnaRashiName} ಲಗ್ನಾಧಿಪತಿ ${house1Info.lordName} (${house1Info.placedRashi}) ನೀಡಿರುವ ಅಂತಃಪ್ರಜ್ಞೆಯು ಸಾಮಾನ್ಯರಿಗಿಂತ ತೀಕ್ಷ್ಣವಾಗಿದೆ. ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ಮನಸ್ಸನ್ನು ಶಾಂತಗೊಳಿಸಿ, ಭಾಗ್ಯಾಧಿಪತಿ ${house9Info.lordName} ಮತ್ತು ಧನ ಯೋಗಿ ${yogiPlanetName} ಗ್ರಹಗಳ ಆಶೀರ್ವಾದವನ್ನು ಸ್ಮರಿಸಿ. ಸಕಾರಾತ್ಮಕ ಮಾತು, ಸತ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಆಂತರಿಕ ಗೊಂದಲಗಳು ದೂರವಾಗಿ ಸ್ಥಿರ ನೆಮ್ಮದಿ ನೆಲೆಸುತ್ತದೆ.`,
            mr: `व्यावहारिक जीवन समन्वय: ${devoteeName}, आपल्या ${nakshatraName} नक्षत्राने व लग्नेश ${house1Info.lordName} (${house1Info.placedRashi}) यांनी आपणास सखोल अंतर्ज्ञान दिले आहे. दररोज सकाळी घाई न करता शांतपणे विचारांचा आढावा घ्या व भाग्याधिपती ${house9Info.lordName} तसेच योगी ${yogiPlanetName} यांचे स्मरण करा. संयम, सत्यनिष्ठा व श्री गोकर्ण महाबळेश्वराच्या आशीर्वादाने मनातील सर्व अस्वस्थता दूर होऊन स्थैर्य लाभेल.`,
            hi: `व्यावहारिक जीवन समन्वय: ${devoteeName}, आपके ${nakshatraName} नक्षत्र एवं लग्नेश ${house1Info.lordName} (${house1Info.placedRashi}) ने आपको गहरा विवेक और अंतर्ज्ञान प्रदान किया है। प्रातः महत्वपूर्ण निर्णय लेने से पूर्व चित्त को शांत कर भाग्येश ${house9Info.lordName} तथा योगी ग्रह ${yogiPlanetName} का स्मरण करें। सत्यनिष्ठा, धैर्य और श्री गोकर्ण महाबलेश्वर की कृपा से जीवन में स्थिर शांति स्थापित होती है।`,
            te: `ఆచరణాత్మక జీవన సమన్వయం: ${devoteeName}, మీ ${nakshatraName} నక్షత్రం మరియు లగ్నాధిపతి ${house1Info.lordName} (${house1Info.placedRashi}) మీకు అద్భుతమైన అంతర్దృష్టిని అందించాయి. ప్రతిరోజూ ఉదయం ప్రశాంత మనస్సుతో నిర్ణయాలు తీసుకుని, భాగ్యాధిపతి ${house9Info.lordName} మరియు యోగి ${yogiPlanetName} అనుగ్రహాన్ని స్మరించండి. సత్యం, సహనం మరియు గోకర్ణ మహాబలేశ్వరుని రక్షణ మీకు శాశ్వత శాంతిని ప్రసాదిస్తాయి.`,
            ta: `நடைமுறை வாழ்க்கை ஒருங்கிணைப்பு: ${devoteeName}, உங்கள் ${nakshatraName} நட்சத்திரமும் லக்னாதிபதி ${house1Info.lordName} (${house1Info.placedRashi}) நிலையும் உங்களுக்கு ஆழ்ந்த உள்ளுணர்வைத் தந்துள்ளன. தினமும் காலையில் அமைதியான மனதுடன் முக்கிய முடிவுகளை எடுத்து, பாக்கியாதிபதி ${house9Info.lordName} மற்றும் யோகி ${yogiPlanetName} அருளை நினையுங்கள். நேர்மையும் பொறுமையும் கோகர்ண ஈசன் அருளும் நிலையான மன அமைதியைத் தரும்.`,
            en: `Daily Integration Guidance: ${devoteeName}, your ${nakshatraName} sensitivity guided by ascendant lord ${house1Info.lordName} in ${house1Info.placedRashi} grants sharper discernment than you often credit yourself for. Anchor quiet morning reflection before high-stakes conversations, align with 9th fortune lord ${house9Info.lordName} and Yogi ${yogiPlanetName}, and trust Sri Kshetra Gokarna's steady protection.`
          },
          targetLang
        )
      : chBand === "power" || chBand === "horizon"
      ? pick6(
          {
            kn: `ಸಮಗ್ರ ಕಾಲಮಾನ ಮತ್ತು ಕಾರ್ಯತಂತ್ರ: ಪ್ರಸ್ತುತ ${currentMahadasha} – ${currentBhuktiLord} (${n(bhuktiEndDate)}) ಹಂತವು ಬೃಗು ಬಿಂದುವಿನ (${bhriguBinduRashiName}) ತಿರುವಿನೊಂದಿಗೆ ಸಮನ್ವಯಗೊಳ್ಳುತ್ತಿರುವುದರಿಂದ, ಹಂತ-ಹಂತವಾದ ಯೋಜನೆಯೇ ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸಿನ ರಹಸ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ಕರ್ಮ ಭಾವಾಧಿಪತಿ ${house10Info.lordName} (${n(house10Info.placedHouse)}ನೇ ಭಾವ) ಹಾಗೂ ಲಾಭಾಧಿಪತಿ ${house11Info.lordName} ಶಕ್ತಿಯು ಶಿಸ್ತುಬದ್ಧ ಪ್ರಯತ್ನಗಳಿಗೆ ಖಚಿತ ಪ್ರತಿಫಲ ನೀಡುತ್ತದೆ. ${isMinor ? "ವಿದ್ಯಾರ್ಥಿ ದೆಸೆಯಲ್ಲಿ ಉತ್ತಮ ಸಂಸ್ಕಾರ, ಶಿಸ್ತುಬದ್ಧ ಓದು ಮತ್ತು ಆರೋಗ್ಯಕರ ದಿನಚರಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು" : "ಆದಾಯ-ಖರ್ಚುಗಳ ಲೆಕ್ಕಾಚಾರವನ್ನು ಪಾರದರ್ಶಕವಾಗಿಟ್ಟು, ಹೊಸ ಹೆಜ್ಜೆಗಳನ್ನು ಶುಭ ದಿನದಂದು ಆರಂಭಿಸುವುದು"} ನಿಮಗೆ ಅನಪೇಕ್ಷಿತ ವಿಳಂಬಗಳಿಂದ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.`,
            mr: `समग्र कालमान व कार्यनीती: चालू ${currentMahadasha} – ${currentBhuktiLord} (${n(bhuktiEndDate)}) दशा आणि भृगु बिंदू (${bhriguBinduRashiName}) यांचा संयोग पाहता टप्प्याटप्प्याने नियोजन करणेच दीर्घकालीन प्रगतीची गुरुकिल्ली आहे. कर्मेश ${house10Info.lordName} (${n(house10Info.placedHouse)}वे स्थान) व लाभेश ${house11Info.lordName} यांचे पाठबळ प्रामाणिक कष्टांना निश्चित फळ देते. ${isMinor ? "विद्यार्थी दशेत शिस्तबद्ध अभ्यास, चांगले संस्कार व आरोग्याची काळजी घेणे आणि गुरुजनांचा आदर राखणे" : "जमा-खर्चाचा स्पष्ट ताळमेळ राखून महत्त्वाचे आर्थिक किंवा व्यावसायिक निर्णय शुभ दिवशी घेणे"} अनपेक्षित अडथळ्यांपासून आपले संरक्षण करेल व कुटुंबात स्थैर्य वाढवेल.`,
            hi: `समग्र काल-नियोजन एवं रणनीति: वर्तमान ${currentMahadasha} – ${currentBhuktiLord} (${n(bhuktiEndDate)}) तथा भृगु बिंदु (${bhriguBinduRashiName}) के समन्वयानुसार क्रमबद्ध योजना ही स्थायी सिद्धि का रहस्य है। कर्मेश ${house10Info.lordName} (${n(house10Info.placedHouse)}वां भाव) और लाभेश ${house11Info.lordName} का शुभ संयोग आपके निष्ठावान प्रयासों को ठोस सफलता में परिवर्तित करता है। ${isMinor ? "बाल्य एवं विद्यार्थी काल में अनुशासित अध्ययन, सुसंस्कार व दिनचर्या बनाए रखना" : "आय-व्यय का संतुलन रखते हुए शुभ दिवस पर महत्वपूर्ण कार्य प्रारंभ करना"} अप्रत्याशित अवरोधों से पूर्ण सुरक्षा प्रदान करता है।`,
            te: `సమగ్ర కాలమాన వ్యూహం: ప్రస్తుత ${currentMahadasha} – ${currentBhuktiLord} (${n(bhuktiEndDate)}) దశ మరియు భృగు బిందువు (${bhriguBinduRashiName}) కలయికను బట్టి క్రమపద్ధతిలో ప్రణాళిక వేసుకోవడమే దీర్ఘకాలిక విజయానికి రహస్యం. దశమాధిపతి ${house10Info.lordName} మరియు లాభాధిపతి ${house11Info.lordName} బలం వల్ల మీ కృషికి తగిన గౌరవం, ధనలాభం చేకూరుతాయి. ${isMinor ? "విద్యార్థి దశలో క్రమశిక్షణతో కూడిన చదువు, మంచి అలవాట్లు మరియు ఆరోగ్యం కాపాడుకోవడం" : "ఆదాయ-వ్యయాలను సమన్వయం చేసుకుంటూ శుభ రోజున ముఖ్య పనులు ప్రారంభించడం"} ఆటంకాల నుండి పూర్తి రక్షణ మరియు కుటుంబ సౌభాగ్యాన్ని ఇస్తుంది.`,
            ta: `முழுமையான கால திட்டமிடல்: நடப்பு ${currentMahadasha} – ${currentBhuktiLord} (${n(bhuktiEndDate)}) தசையும் பிருகு பிந்து (${bhriguBinduRashiName}) இணைவும் படிப்படியான திட்டமிடலே நிலையான வெற்றிக்கான வழி என்பதைக் காட்டுகின்றன. கர்மாதிபதி ${house10Info.lordName} மற்றும் லாபாதிபதி ${house11Info.lordName} ஆகியோரின் பலம் உங்கள் நேர்மையான முயற்சிகளுக்கு உரிய பலனைத் தரும். ${isMinor ? "இளமைப் பருவத்தில் ஒழுக்கமான கல்வி, நல்ல பழக்கங்கள் மற்றும் ஆரோக்கியத்தைப் பேணுவது" : "வரவு-செலவுகளைத் தெளிவாகக் கண்காணித்து சுப நாளில் முக்கிய பணிகளைத் தொடங்குவது"} தேவையற்ற தாமதங்களைத் தவிர்க்கும்.`,
            en: `Integrated Timing Blueprint: uniting active ${currentMahadasha}–${currentBhuktiLord} (through ${bhuktiEndDate}) with Bhrigu Bindu (${bhriguBinduRashiName}) proves methodical planning conquers turbulence. Your 10th career lord ${house10Info.lordName} (House ${house10Info.placedHouse}) and 11th gains lord ${house11Info.lordName} steadily convert patient execution into tangible prosperity. ${isMinor ? `Maintaining joyful academic discipline, healthy rest, and parental trust builds an unshakable foundation for coming decades.` : `Keeping accounts transparent, avoiding impulsive commitments, and launching critical steps aligned with Yogi ${yogiPlanetName}'s auspicious weekday neutralizes unforeseen friction cleanly.`}`
          },
          targetLang
        )
      : pick6(
          {
            kn: `ಕುಟುಂಬ-ಧರ್ಮ ಸಂರಕ್ಷಣೆಯ ಅಂತಿಮ ಸೂತ್ರ: ${devoteeName}, ನಿಮ್ಮ ೪ನೇ ಮನೆಯ (${house4Info.placedRashi}) ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ೯ನೇ ಮನೆಯ (${house9Info.lordName}) ಭಾಗ್ಯಬಲವು ಸದಾ ದೈವಿಕ ರಕ್ಷಣೆಯಲ್ಲಿದೆ. ಮನೆಯಲ್ಲಿ ಪ್ರತಿದಿನ ಸಂಜೆ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗದ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಶುಭ ಕರ್ಮಗಳನ್ನು ಮುಂದುವರಿಸುವುದರಿಂದ ವಂಶದ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯಲ್ಲೂ ಆರೋಗ್ಯ, ಗೌರವ ಮತ್ತು ಸಮೃದ್ಧಿ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.`,
            mr: `कौटुंबिक धर्मसंरक्षणाचा मूलमंत्र: ${devoteeName}, आपल्या चतुर्थ भावातील (${house4Info.placedRashi}) गृहशांती व नवम भावातील (${house9Info.lordName}) भाग्यबळ सदैव ईश्वरीय रक्षणाखाली आहे. दररोज संध्याकाळी घरात तुपाचा दिवा लावून वडीलधाऱ्यांचा आशीर्वाद व गोकर्ण आत्मलिंगाचे स्मरण ठेवल्याने घरात आरोग्य, समाधान व सौख्य अखंड नांदते.`,
            hi: `पारिवारिक कल्याण एवं धर्म-संरक्षण सूत्र: ${devoteeName}, आपके चतुर्थ भाव (${house4Info.placedRashi}) की गृह शांति एवं नवम भाव (${house9Info.lordName}) का भाग्य बल निरंतर ईश्वरीय संरक्षण में है। प्रतिदिन संध्या में शुद्ध घी का दीपक जलाकर बड़ों का आशीर्वाद एवं गोकर्ण आत्मलिंग का स्मरण करने से कुल में आरोग्य, मान और सुख बढ़ता है।`,
            te: `కుటుంబ సంరక్షణ మరియు ధర్మ సూత్రం: ${devoteeName}, మీ 4వ గృహ స్థానం (${house4Info.placedRashi}) మరియు 9వ భాగ్య స్థానం (${house9Info.lordName}) ఎల్లప్పుడూ దైవ రక్షణలో ఉంటాయి. ప్రతిరోజూ సాయంత్రం ఇంట్లో నేతి దీపం వెలిగించి, పెద్దల ఆశీస్సులతో శ్రీ గోకర్ణ ఆత్మలింగాన్ని స్మరించడం వల్ల కుటుంబంలో ఆరోగ్యం, కీర్తి మరియు సౌభాగ్యం వెల్లివిరుస్తాయి.`,
            ta: `குடும்ப அறப் பாதுகாப்பு நெறி: ${devoteeName}, உங்கள் 4-ம் வீட்டின் (${house4Info.placedRashi}) இல்லற அமைதியும் 9-ம் வீட்டின் (${house9Info.lordName}) பாக்கிய பலமும் எப்போதும் இறை அருளில் உள்ளன. தினமும் மாலையில் நெய் தீபம் ஏற்றி பெரியோரின் ஆசியுடன் கோகர்ண ஆத்மலிங்கத்தை வணங்கி வருவது குடும்பத்தில் நலமும் செல்வமும் நிலைக்கச் செய்யும்.`,
            en: `Household Dharma Sanctuary Axiom: ${devoteeName}, your 4th domestic sector (${house4Info.placedRashi}) and 9th fortune pillar (${house9Info.lordName}) stand guarded under lasting grace. Lighting an evening lamp with gratitude for elders and recalling Sri Gokarna's Atma Linga sustains unbroken wellness, dignity, and domestic peace.`
          },
          targetLang
        );

  return {
    extraParagraphs: [extraParagraph, fifthParagraph],
    precisionAnchors
  };
}

const PLACE_TERMS_6L: Record<string, Record<SixLang, string>> = {
  india: { kn: "ಭಾರತ", mr: "भारत", hi: "भारत", te: "భారతదేశం", ta: "இந்தியா", en: "India" },
  karnataka: { kn: "ಕರ್ನಾಟಕ", mr: "कर्नाटक", hi: "कर्नाटक", te: "కర్ణాటక", ta: "கர்நாடகா", en: "Karnataka" },
  maharashtra: { kn: "ಮಹಾರಾಷ್ಟ್ರ", mr: "महाराष्ट्र", hi: "महाराष्ट्र", te: "మహారాష్ట్ర", ta: "மகாராஷ்டிரா", en: "Maharashtra" },
  "tamil nadu": { kn: "ತಮಿಳುನಾಡು", mr: "तमिळनाडू", hi: "तमिलनाडु", te: "తమిళనాడు", ta: "தமிழ்நாடு", en: "Tamil Nadu" },
  "andhra pradesh": { kn: "ಆಂಧ್ರ ಪ್ರದೇಶ", mr: "आंध्र प्रदेश", hi: "आंध्र प्रदेश", te: "ఆంధ్ర ప్రదేశ్", ta: "ஆந்திர பிரதேசம்", en: "Andhra Pradesh" },
  telangana: { kn: "ತೆಲಂಗಾಣ", mr: "तेलंगणा", hi: "तेलंगाना", te: "తెలంగాణ", ta: "తెలంగాణ", en: "Telangana" },
  kerala: { kn: "ಕೇರಳ", mr: "केरळ", hi: "केरल", te: "కేరళ", ta: "கேரளா", en: "Kerala" },
  gokarna: { kn: "ಗೋಕರ್ಣ", mr: "गोकर्ण", hi: "गोकर्ण", te: "గోకర్ణ", ta: "கோகர்ணா", en: "Gokarna" },
  bengaluru: { kn: "ಬೆಂಗಳೂರು", mr: "बेंगळुरू", hi: "बेंगलुरु", te: "బెంగళూరు", ta: "பெங்களூரு", en: "Bengaluru" },
  bangalore: { kn: "ಬೆಂಗಳೂರು", mr: "बेंगळुरू", hi: "बेंगलुरु", te: "బెంగళూరు", ta: "பெங்களூரு", en: "Bangalore" },
  mysuru: { kn: "ಮೈಸೂರು", mr: "म्हैसूर", hi: "मैसूरु", te: "మైసూరు", ta: "மைசூரு", en: "Mysuru" },
  mysore: { kn: "ಮೈಸೂರು", mr: "म्हैसूर", hi: "मैसूर", te: "మైసూరు", ta: "மைசூர்", en: "Mysore" },
  mangaluru: { kn: "ಮಂಗಳೂರು", mr: "मंगळुरू", hi: "मंगलुरु", te: "మంగళూరు", ta: "மங்களூரு", en: "Mangaluru" },
  mangalore: { kn: "ಮಂಗಳೂರು", mr: "मंगळुरू", hi: "मंगलोर", te: "మంగళూరు", ta: "மங்களூர்", en: "Mangalore" },
  udupi: { kn: "ಉಡುಪಿ", mr: "उडुपी", hi: "उडुपी", te: "ఉడుపి", ta: "உடுப்பி", en: "Udupi" },
  honnavar: { kn: "ಹೊನ್ನಾವರ", mr: "होन्नावर", hi: "होन्नावर", te: "హొన్నావర్", ta: "ஹொன்னாவர்", en: "Honnavar" },
  kumta: { kn: "ಕುಮಟಾ", mr: "कुमटा", hi: "कुमटा", te: "కుమటా", ta: "கும்தா", en: "Kumta" },
  karwar: { kn: "ಕಾರವಾರ", mr: "कारवार", hi: "कारवार", te: "కార్వార్", ta: "கார்வார்", en: "Karwar" },
  sirsi: { kn: "ಶಿರಸಿ", mr: "सिरसी", hi: "सिरसी", te: "సిర్సి", ta: "சிர்சி", en: "Sirsi" },
  hubballi: { kn: "ಹುಬ್ಬಳ್ಳಿ", mr: "हुबळी", hi: "हुबली", te: "హుబ్లీ", ta: "ஹுப்பள்ளி", en: "Hubballi" },
  dharwad: { kn: "ಧಾರವಾಡ", mr: "धारवाड", hi: "धारवाड़", te: "ధార్వాడ్", ta: "தார்வாட்", en: "Dharwad" },
  mumbai: { kn: "ಮುಂಬೈ", mr: "मुंबई", hi: "मुंबई", te: "ముంబై", ta: "மும்பை", en: "Mumbai" },
  pune: { kn: "ಪುಣೆ", mr: "पुणे", hi: "पुणे", te: "పుణే", ta: "புனே", en: "Pune" },
  hyderabad: { kn: "ಹೈದರಾಬಾದ್", mr: "हैदराबाद", hi: "हैदराबाद", te: "హైదరాబాద్", ta: "ஹைதராபாத்", en: "Hyderabad" },
  chennai: { kn: "ಚೆನ್ನೈ", mr: "चेन्नई", hi: "चेन्नई", te: "చెన్నై", ta: "சென்னை", en: "Chennai" },
  delhi: { kn: "ದೆಹಲಿ", mr: "दिल्ली", hi: "दिल्ली", te: "ఢిల్లీ", ta: "டெல்லி", en: "Delhi" }
};

/**
 * Parses and deduplicates noisy compound place strings such as
 * "Gokarna (581326) · Gokarna (581326) · Karnataka" into a crisp, non-repeating
 * localized display string without losing parenthesized pincodes.
 */
export function resolvePlaceDisplayName(rawPlace: string, lang: SixLang): string {
  const clean = (rawPlace || "").trim();
  if (!clean) return "";

  const rawParts = clean
    .split(/[,·•|\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Deduplicate semantically equivalent tokens; prefer the pincode-annotated token if both exist.
  const orderedKeys: string[] = [];
  const byCoreKey = new Map<string, string>();

  for (const segment of rawParts) {
    const pinMatch = segment.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    const rawCore = (pinMatch ? pinMatch[1] : segment).trim();
    const rawPin = pinMatch ? pinMatch[2].trim() : "";

    const localizeCore = (text: string): string => {
      if (!text) return "";
      const lower = text.toLowerCase();
      if (PLACE_TERMS_6L[lower]?.[lang]) {
        return PLACE_TERMS_6L[lower][lang];
      }
      if (lang === "en") {
        return resolveDevoteeDisplayName(text, "en");
      }
      const localized = /[a-zA-Z]/.test(text)
        ? transliterateName(text, lang)
        : resolveDevoteeDisplayName(text, lang);
      return formatDigits(localized, lang);
    };

    const localizedCore = localizeCore(rawCore);
    if (!localizedCore && !rawPin) continue;

    const localizedPin = rawPin ? formatDigits(rawPin, lang) : "";
    const formatted = localizedPin && localizedCore
      ? `${localizedCore} (${localizedPin})`
      : (localizedCore || localizedPin);

    const coreKey = (rawCore || localizedCore).toLowerCase().replace(/\s+/g, " ").trim();
    const existing = byCoreKey.get(coreKey);
    if (!existing) {
      orderedKeys.push(coreKey);
      byCoreKey.set(coreKey, formatted);
    } else if (localizedPin && !existing.includes("(")) {
      byCoreKey.set(coreKey, formatted);
    }
  }

  return orderedKeys.map((k) => byCoreKey.get(k)!).filter(Boolean).join(", ");
}

/**
 * Extracts a concise single-city label (without repeating segments or pincodes)
 * for natural conversational sentences in the cover & chapter narratives.
 */
export function extractShortPlaceDisplayName(rawPlace: string, lang: SixLang): string {
  const resolved = resolvePlaceDisplayName(rawPlace, lang);
  if (!resolved) return "";
  const firstSegment = resolved.split(",")[0]?.trim() || resolved;
  return firstSegment.replace(/\s*\([^)]*\)\s*/g, "").trim() || firstSegment;
}
