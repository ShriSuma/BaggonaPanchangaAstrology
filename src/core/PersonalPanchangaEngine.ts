/**
 * PersonalPanchangaEngine.ts — Dedicated 90-Day Personal Panchanga Engine
 * 
 * Computes deterministic day-by-day personal panchanga scores (0–100),
 * 3-color day status (Green 🟢, Yellow 🟡, Red 🔴), 2 uplifting guidance lines,
 * and vehicle/asset purchase suitability for any devotee across a 90-day window.
 * 
 * Combines 5 Vedic parameters:
 * 1. Janma Kundali (Ascendant, Moon Sign, Nakshatra, Lagna & Moon Lords)
 * 2. Real-time Ephemeris Transits (Gochara for Moon, Sun, Mars, Jupiter, Saturn, etc.)
 * 3. Active Vimshottari Dasha-Bhukti at target date
 * 4. Tara Bala (9-fold star compatibility)
 * 5. Chandra Bala & Chandrashtama (12-house transit Moon relationship)
 */

import { calculateKundliWithPlaceSun } from "./KundliEngine";
import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToNakshatra, degreeToRashi } from "./AstroMath";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { friendshipScore, janmaRashiLord } from "./TaraBalaEngine";
import type { AyanamsaModel, KundliInput } from "./AstroTypes";
import type { EnergyBand, GrahaKey } from "../features/seva/sevaLocale";

export type DayColor = "green" | "yellow" | "red";

export type PersonalDayPanchanga = {
  /** Target date YYYY-MM-DD */
  ymd: string;
  /** 0 = Sunday, 1 = Monday, ... 6 = Saturday */
  weekday: number;
  dayOfMonth: number;
  monthIndex: number;
  year: number;

  /** Overall day energy score (0..100) */
  score: number;
  /** 3-Color classification */
  color: DayColor;
  band: EnergyBand;

  /** Astrological markers */
  moonNakshatraIndex: number;
  moonRashiIndex: number;
  taraNumber: number;
  isTaraFavourable: boolean;
  isDifficultTara: boolean;

  chandraHouseOffset: number;
  isChandraFavourable: boolean;
  isChandrashtama: boolean;

  dayLord: GrahaKey;
  mahadashaLord: GrahaKey;
  antardashaLord: GrahaKey;

  /** Localized 5-language guidance and tags */
  badgeEmoji: string;
  badgeText: Record<string, string>;
  vibeTag: Record<string, string>;
  guidanceLine1: Record<string, string>;
  guidanceLine2: Record<string, string>;
  vehicleSuitability: Record<string, string>;

  /** UI styling hints */
  googleColorId: string;
  icalColor: string;
};

export type Personal90DayReport = {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  startDate: string;
  endDate: string;
  natalAscendantIndex: number;
  natalMoonRashiIndex: number;
  natalMoonNakshatraIndex: number;
  days: PersonalDayPanchanga[];
  greenDaysCount: number;
  yellowDaysCount: number;
  redDaysCount: number;
};

const WEEKDAY_LORDS: GrahaKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/** Generate a 90-Day Personal Panchanga for a given devotee input */
export async function calculatePersonal90DayPanchanga(
  input: KundliInput,
  startDateStr?: string,
  daysCount: number = 90,
  options: { ayanamsaModel?: AyanamsaModel } = { ayanamsaModel: "lahiri" }
): Promise<Personal90DayReport> {
  const ayanamsaModel = options.ayanamsaModel || "lahiri";
  const natalKundli = await calculateKundliWithPlaceSun(input, { ayanamsaModel });

  const birthMoon = natalKundli.planets.find((p) => p.name === "Moon");
  const birthNakIdx = birthMoon ? birthMoon.nakshatra.index : 12; // Default Hasta
  const birthRashiIdx = birthMoon ? birthMoon.rashi.index : 5; // Default Kanya
  const birthAscendantIdx = natalKundli.ascendant; // 0..11
  const birthMoonLord = janmaRashiLord(natalKundli);

  const startD = startDateStr ? new Date(startDateStr) : new Date();
  const validStart = isNaN(startD.getTime()) ? new Date() : startD;
  const startYmd = validStart.toISOString().slice(0, 10);

  const days: PersonalDayPanchanga[] = [];
  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;

  for (let i = 0; i < daysCount; i++) {
    const curDate = new Date(validStart);
    curDate.setDate(validStart.getDate() + i);
    const ymd = curDate.toISOString().slice(0, 10);
    const weekday = curDate.getDay();
    const dayOfMonth = curDate.getDate();
    const monthIndex = curDate.getMonth();
    const year = curDate.getFullYear();

    // Age in decimal years on target date for Dasha-Bhukti
    const ageYears = ageDecimalYearsAt(
      input.birthDate,
      input.birthTime,
      input.latitude || 14.5479,
      input.longitude || 74.3187,
      curDate
    );

    // Fast ephemeris transit calculation at 06:00 AM IST for target date
    const targetUtc = new Date(Date.UTC(year, monthIndex, dayOfMonth, 0, 30)); // 06:00 IST = 00:30 UTC
    const longs = siderealLongitudes(targetUtc, ayanamsaModel);

    const transitMoonNak = degreeToNakshatra(longs.moon);
    const transitNakIdx = transitMoonNak.index;
    const transitMoonRashi = degreeToRashi(longs.moon);
    const transitRashiIdx = transitMoonRashi.index;

    // 1. Tara Bala Calculation
    const taraNumber = ((((transitNakIdx - birthNakIdx + 27) % 9) + 1) as unknown) as number;
    const isTaraFav = [2, 4, 6, 8, 9].includes(taraNumber);
    const isDifficultTara = [3, 5, 7].includes(taraNumber);
    const taraScore = isTaraFav ? 90 : (taraNumber === 1 ? 65 : 30);

    // 2. Chandra Bala Calculation
    const houseOffset = ((transitRashiIdx - birthRashiIdx + 12) % 12) + 1;
    const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
    const isChandrashtama = houseOffset === 8;
    const chandraScore = isChandrashtama ? 20 : (isChandraFav ? 90 : 55);

    // 3. Dasha-Bhukti Calculation
    let mahaLord: GrahaKey = "Jupiter";
    let bhuktiLord: GrahaKey = "Jupiter";
    try {
      const bhuktiInfo = findBhuktiAtAge(natalKundli, ageYears);
      if (bhuktiInfo) {
        const mP = bhuktiInfo.maha.planet;
        const bP = bhuktiInfo.bhukti;
        mahaLord = (mP.slice(0, 1).toUpperCase() + mP.slice(1).toLowerCase()) as GrahaKey;
        bhuktiLord = (bP.slice(0, 1).toUpperCase() + bP.slice(1).toLowerCase()) as GrahaKey;
      }
    } catch {
      // Fallback
    }

    const dashaFriendship = (friendshipScore(birthMoonLord, mahaLord) + friendshipScore(birthMoonLord, bhuktiLord)) / 2;
    const dashaScore = Math.round(dashaFriendship * 100);

    // 4. Gochara Harmony (Jupiter transit relative to natal Moon)
    const jupiterRashiIdx = degreeToRashi(longs.jupiter).index;
    const jupOffset = ((jupiterRashiIdx - birthRashiIdx + 12) % 12) + 1;
    const isJupFav = [2, 5, 7, 9, 11].includes(jupOffset);
    const gocharaScore = isJupFav ? 85 : 55;

    // 5. Vara (Weekday) Harmony
    const dayLord = WEEKDAY_LORDS[weekday] || "Sun";
    const varaFriendship = friendshipScore(birthMoonLord, dayLord);
    const varaScore = Math.round(varaFriendship * 100);

    // Composite Weighted Score
    const rawScore = Math.round(
      0.30 * taraScore +
      0.25 * chandraScore +
      0.20 * dashaScore +
      0.15 * gocharaScore +
      0.10 * varaScore
    );
    const score = Math.max(18, Math.min(98, rawScore));

    // 3-Color Band Classification
    let color: DayColor = "yellow";
    let band: EnergyBand = "steady";

    if (isChandrashtama || isDifficultTara || score < 50) {
      color = "red";
      band = "rest";
      redCount++;
    } else if (isTaraFav && isChandraFav && score >= 75) {
      color = "green";
      band = "high";
      greenCount++;
    } else {
      color = "yellow";
      band = "steady";
      yellowCount++;
    }

    // Guidance text & UI properties
    const badgeEmoji = color === "green" ? "🟢" : (color === "yellow" ? "🟡" : "🔴");
    const googleColorId = color === "green" ? "10" : (color === "yellow" ? "5" : "11");
    const icalColor = color === "green" ? "green" : (color === "yellow" ? "gold" : "crimson");

    const badgeText: Record<string, string> = {
      kn: color === "green" ? "🟢 ಶುಭ ಕಾರ್ಯ, ನೂತನ ವಾಹನ ಹಾಗೂ ಧನ ಅಭಿವೃದ್ಧಿಗೆ ಪ್ರಶಸ್ತ"
        : color === "yellow" ? "🟡 ನಿತ್ಯ ಕರ್ಮ ಹಾಗೂ ಸಾಮಾನ್ಯ ಕಾರ್ಯಕ್ಕೆ ಸೂಕ್ತ"
        : "🔴 ಮುನ್ನೆಚ್ಚರಿಕೆಯಿಂದ ಪ್ರಯಾಣಿಸಿ & ಜಪಿಸಿ",
      en: color === "green" ? "🟢 AUSPICIOUS FOR NEW WORK, VEHICLES & PURCHASES"
        : color === "yellow" ? "🟡 SUITABLE FOR ROUTINE WORK & PLANNED TASKS"
        : "🔴 MINDFUL TRAVEL & PROTECTION PRAYER",
      hi: color === "green" ? "🟢 नए कार्य, वाहन क्रय एवं धन वृद्धि हेतु शुभ"
        : color === "yellow" ? "🟡 दैनिक कार्य एवं सामान्य गतिविधियों हेतु उपयुक्त"
        : "🔴 सतर्कता से यात्रा करें एवं जपें",
      te: color === "green" ? "🟢 నూతన కార్యం, వాహన కొనుగోలు & ధన లాభానికి శుభప్రదం"
        : color === "yellow" ? "🟡 దైనిక కార్యం & సాధారణ పనులకు అనుకూలం"
        : "🔴 జాగ్రత్తగా ప్రయాణించండి & జపించండి",
      ta: color === "green" ? "🟢 புதிய காரியம், வாகனம் & தன லாபத்திற்கு உகந்தது"
        : color === "yellow" ? "🟡 அன்றாட வேலைகள் & சாதாரண பணிக்கு ஏற்றது"
        : "🔴 கவனத்துடன் பயணம் & ஜபம்"
    };

    const vibeTag: Record<string, string> = {
      kn: color === "green" ? "⚡ A (ನವಾರಂಭ / ವಾಹನ ಯೋಗ)"
        : color === "yellow" ? "⚖️ B (ಸಮತೋಲನ / ಕರ್ತವ್ಯ)"
        : "🧘 S (ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ / ಜಾಗರೂಕತೆ)",
      en: color === "green" ? "⚡ A (New Venture / Vehicle / Growth)"
        : color === "yellow" ? "⚖️ B (Routine Work / Safe Transit)"
        : "🧘 S (Mindful Travel / Care)",
      hi: color === "green" ? "⚡ A (नया कार्य / वाहन योग)"
        : color === "yellow" ? "⚖️ B (संतुलन / कर्तव्य)"
        : "🧘 S (सुरक्षित यात्रा / संयम)",
      te: color === "green" ? "⚡ A (నూతన కార్యం / వాహనం)"
        : color === "yellow" ? "⚖️ B (సమతుల్యత / విధి)"
        : "🧘 S (సురక్షిత ప్రయాణం / జాగ్రత్త)",
      ta: color === "green" ? "⚡ A (புதிய தொடக்கம் / வாகனம்)"
        : color === "yellow" ? "⚖️ B (சமநிலை / கடமை)"
        : "🧘 S (பாதுகாப்பான பயணம் / கவனம்)"
    };

    const guidanceLine1: Record<string, string> = {
      kn: color === "green" ? "ಇಂದಿನ ದಿನವು ನಿಮ್ಮ ಶಕ್ತಿ ಹಾಗೂ ಮನಃಶಾಂತಿಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲಿದೆ."
        : color === "yellow" ? "ದೈನಂದಿನ ಕಾರ್ಯಗಳನ್ನು ಶಿಸ್ತಿನಿಂದ ಪೂರ್ಣಗೊಳಿಸಲು ಸೂಕ್ತ ದಿನ."
        : "ಶಾಂತ ಚಿತ್ತದಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸಿ; ಗಾಯತ್ರಿ ಹಾಗೂ ಶಿವ ಸ್ಮರಣೆ ನಿಮಗೆ ಕವಚವಾಗಲಿದೆ.",
      en: color === "green" ? "Today's planetary rhythm multiplies your vital energy and focus."
        : color === "yellow" ? "An excellent day to complete pending tasks with steady dedication."
        : "Proceed with calm mindfulness; Gayatri & Shiva prayers offer full protection.",
      hi: color === "green" ? "आज का ग्रहीय योग आपकी ऊर्जा एवं संकल्प शक्ति में वृद्धि करेगा।"
        : color === "yellow" ? "दैनिक कार्यों को निष्ठा एवं संतुलन से पूर्ण करने का शुभ दिन।"
        : "शांत मन से कार्य करें; गायत्री व शिव मंत्र का जप रक्षा कवच बनेगा।",
      te: color === "green" ? "ఈరోజు గ్రహ బలం మీ శక్తిని, కార్యసిద్ధిని పెంపొందిస్తుంది."
        : color === "yellow" ? "దైనిక పనులను క్రమశిక్షణతో పూర్తి చేయడానికి అనుకూల సమయం."
        : "ప్రశాంతంగా నిర్ణయాలు తీసుకోండి; గాయత్రీ ధ్యానం మీకు రక్షణనిస్తుంది.",
      ta: color === "green" ? "இன்றைய கிரக யோகம் உங்கள் ஆற்றலையும் மன உறுதியையும் உயர்த்தும்."
        : color === "yellow" ? "அன்றாடப் பணிகளை சீராக செய்து முடிக்க ஏதுவான நாள்."
        : "அமைதியான மனதுடன் செயல்படுங்கள்; காயத்ரி தியானம் உங்களுக்கு பாதுகாப்பாகும்."
    };

    const guidanceLine2: Record<string, string> = {
      kn: color === "green" ? "ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಚಾಲನೆ ನೀಡಲು ಹಾಗೂ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ."
        : color === "yellow" ? "ಸಾಮಾನ್ಯ ಆರ್ಥಿಕ ವ್ಯವಹಾರ ಹಾಗೂ ಪ್ರವಾಸಗಳಿಗೆ ಸಮತೋಲಿತ ವಾತಾವರಣವಿದೆ."
        : "ಅಗತ್ಯವಿಲ್ಲದ ಆತುರದ ಪ್ರಯಾಣ ಹಾಗೂ ಸಾಲದ ವ್ಯವಹಾರಗಳನ್ನು ನಾಳೆಗೆ ಮುಂದೂಡಿ.",
      en: color === "green" ? "Optimal window for launching initiatives, investments, and major purchases."
        : color === "yellow" ? "Balanced atmosphere for routine financial planning and peaceful travel."
        : "Postpone non-essential long travel and major financial commitments to tomorrow.",
      hi: color === "green" ? "नए संकल्पों की शुरुआत एवं वित्तीय निर्णयों हेतु उत्तम समय।"
        : color === "yellow" ? "सामान्य लेन-देन एवं यात्रा हेतु संतुलित समय।"
        : "अनावश्यक जल्दबाजी व वित्तीय जोखिम से बचें; कल के लिए योजना बनाएं।",
      te: color === "green" ? "నూతన ప్రయత్నాలు, ఆర్థిక ప్రణాళికలు ప్రారంభించడానికి మంచి సమయం."
        : color === "yellow" ? "సాధారణ ఆర్థిక లావాదేవీలు & ప్రయాణాలకు అనుకూలమైన వాతావరణం."
        : "అత్యవసరం కాని ప్రయాణాలను, పెద్ద ఆర్థిక నిర్ణయాలను వాయిదా వేయండి.",
      ta: color === "green" ? "புதிய முயற்சிகள் மற்றும் நிதி சார்ந்த முடிவுகளுக்கு மிகச்சிறந்த நேரம்."
        : color === "yellow" ? "சாதாரண நிதி திட்டமிடல் மற்றும் பயணங்களுக்கு உகந்த சூழல்."
        : "அவசியமற்ற நீண்ட தூரப் பயணம் மற்றும் பெரிய நிதியீடுகளைத் தவிர்க்கவும்."
    };

    const vehicleSuitability: Record<string, string> = {
      kn: color === "green" ? "🚘 ವಾಹನ ಯೋಗ: ಅತ್ಯುತ್ತಮ (ನೂತನ ಕಾರು/ಬೈಕ್ ಖರೀದಿ ಹಾಗೂ ನೋಂದಣಿಗೆ ಪ್ರಶಸ್ತ)"
        : color === "yellow" ? "🚘 ವಾಹನ ಯೋಗ: ಸಾಮಾನ್ಯ (ಸುಗಮ ಪ್ರಯಾಣ ಹಾಗೂ ವಾಹನ ಪೂಜೆ/ನಿರ್ವಹಣೆಗೆ ಸೂಕ್ತ)"
        : "🚘 ವಾಹನ ಯೋಗ: ಜಾಗರೂಕತೆ (ಶಾಂತ ಚಾಲನೆ, ವಾಹನ ತಪಾಸಣೆ ಹಾಗೂ ಶ್ರೀ ದುರ್ಗಾ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ)",
      en: color === "green" ? "🚘 Vehicle Purchases: Highly Auspicious (Ideal for new car/bike booking & delivery)"
        : color === "yellow" ? "🚘 Vehicle Purchases: Favourable (Suitable for maintenance & planned commutes)"
        : "🚘 Vehicle Purchases: Mindful Drive (Maintain calm driving & check safety inspection)",
      hi: color === "green" ? "🚘 वाहन योग: अत्यंत शुभ (नवीन वाहन क्रय एवं बुकिंग हेतु उत्तम समय)"
        : color === "yellow" ? "🚘 वाहन योग: सामान्य (सुरक्षित यात्रा एवं वाहन रखरखाव हेतु उपयुक्त)"
        : "🚘 वाहन योग: संयमित रहें (सावधानी से चलाएं एवं वाहन सुरक्षा जांच करें)",
      te: color === "green" ? "🚘 వాహన యోగం: మిక్కిలి శుభం (క్రొత్త వాహనం కొనుగోలు & రిజిస్ట్రేషన్‌కు అనుకూలం)"
        : color === "yellow" ? "🚘 వాహన యోగం: అనుకూలం (సురక్షిత ప్రయాణం & వాహన నిర్వహణకు మంచిది)"
        : "🚘 వాహన యోగం: జాగ్రత్త (ప్రశాంతమైన డ్రైవింగ్ & వాహన రక్షణ ప్రార్థన చేయండి)",
      ta: color === "green" ? "🚘 வாகன யோகம்: மிகச் சிறப்பு (புதிய வாகனம் வாங்குதல் & பதிவு செய்ய உகந்தது)"
        : color === "yellow" ? "🚘 வாகன யோகம்: சாதாரணமானது (சீரான பயணம் & பராமரிப்பிற்கு ஏற்றது)"
        : "🚘 வாகன யோகம்: கவனம் (நிதானமான வாகனம் ஓட்டுதல் & பாதுகாப்பு வழிபாடு செய்ய வேண்டும்)"
    };

    days.push({
      ymd,
      weekday,
      dayOfMonth,
      monthIndex,
      year,
      score,
      color,
      band,
      moonNakshatraIndex: transitNakIdx,
      moonRashiIndex: transitRashiIdx,
      taraNumber,
      isTaraFavourable: isTaraFav,
      isDifficultTara,
      chandraHouseOffset: houseOffset,
      isChandraFavourable: isChandraFav,
      isChandrashtama,
      dayLord,
      mahadashaLord: mahaLord,
      antardashaLord: bhuktiLord,
      badgeEmoji,
      badgeText,
      vibeTag,
      guidanceLine1,
      guidanceLine2,
      vehicleSuitability,
      googleColorId,
      icalColor
    });
  }

  const lastYmd = days.length > 0 ? days[days.length - 1].ymd : startYmd;

  return {
    devoteeName: input.name || "Devotee",
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    startDate: startYmd,
    endDate: lastYmd,
    natalAscendantIndex: birthAscendantIdx,
    natalMoonRashiIndex: birthRashiIdx,
    natalMoonNakshatraIndex: birthNakIdx,
    days,
    greenDaysCount: greenCount,
    yellowDaysCount: yellowCount,
    redDaysCount: redCount
  };
}
