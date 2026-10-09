/**
 * astrologyQAService.ts
 *
 * Baggona Authentic Vedic Astrology Q&A & Consultation Service (ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಎಂಜಿನ್)
 * Powered by classical treatises (Brihat Parashara Hora Shastra, Muhurtha Chintamani, Jataka Parijata),
 * deterministic astronomical math engines, and Google Gemini (gemini-3.5-flash-lite).
 *
 * Capabilities:
 * 1. General & deep Vedic Astrology questions in Kannada, English, Hindi, Telugu, Tamil.
 * 2. Specialized Nakshatra & Pada Dosha analysis (e.g. Mula 1st Pada Gandanta, Ashlesha, Jyeshtha, Revati).
 * 3. Exact Muhurtha calculations (Vehicle purchase, Griha Pravesha, Marriage, Shop opening) with Baggona Panchanga dates.
 * 4. Technical Birth Chart / Kundali analysis (7th house marriage, 4th house property, 10th house career) with optional DOB/TOB/Place.
 * 5. Sacred Baggona & Gokarna temple remedies (Shanti Homa, Rudrabhisheka, Ganapati Seva, Shreeram Pandit blessings).
 */

import { askGemini, type AskGeminiChatTurn } from "../core/GeminiEngine";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../core/birthTime";
import { calculateVahanaKharidiMuhurtha } from "../features/muhurtha/vahanaMuhurthaEngine";
import { RASHIS } from "../core/AstroTypes";
import {
  NAKSHATRA_SHASTRA_CATALOG,
  BHAVA_SHASTRA_CATALOG,
  GRAHA_SHASTRA_MATRIX
} from "./jyotishyaShastraKnowledge";
import type { SupportedLanguage } from "../stores/appStore";

export interface BirthDetailsInput {
  name?: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  place?: string;
  latitude?: number;
  longitude?: number;
  gender?: "Male" | "Female" | "Other";
}

export interface AstrologyQASection {
  title: string;
  content: string;
  icon: string;
}

export interface AstrologyQAResponse {
  id: string;
  question: string;
  language: SupportedLanguage;
  fullAnswer: string;
  spokenText: string;
  detectedIntent: "nakshatra_pada_dosha" | "muhurtha_timing" | "marriage_7th_house" | "career_10th_house" | "general_siddhanta";
  sections: AstrologyQASection[];
  chartData?: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    dashaText: string;
    technicalHighlights: string[];
  };
}

export interface AskBaggonaAstrologyParams {
  question: string;
  language: SupportedLanguage;
  birthDetails?: BirthDetailsInput;
  conversationHistory?: AskGeminiChatTurn[];
  geminiApiKey?: string;
}

/**
 * Detects special astrological entities from the user prompt
 */
function inspectQuestionIntent(question: string): {
  intent: AstrologyQAResponse["detectedIntent"];
  nakshatraIndex?: number;
  pada?: number;
  isVahanaMuhurtha: boolean;
  isMarriageQuery: boolean;
  isCareerQuery: boolean;
  isMulaNakshatra: boolean;
  isRevatiNakshatra: boolean;
  isMeenaRashi: boolean;
} {
  const qLower = question.toLowerCase();

  const isMula = /mula|moola|ಮೂಲ|ಮೂಲಾ|मूल|మూల|மூல/i.test(qLower);
  const isRevati = /revati|revathi|ರೇವತಿ|रेवती|రేవతి|ரேவதி/i.test(qLower);
  const isMeena = /meen|meena|pisces|ಮೀನ|मीन|మీన|மீனம்/i.test(qLower);

  const isPada1 = /1st|1\s*st|೧|1|first|ಪ್ರಥಮ|ಒಂದನೆ|पहला|ఒకటవ|முதல்/i.test(qLower);
  const isPada4 = /4th|4\s*th|೪|4|fourth|ಚತುರ್ಥ|ನಾಲ್ಕನೆ|चौथा|నాల్గవ|நான்காம்/i.test(qLower);

  const isVahana = /vahana|vehicle|car|bike|ಖರೀದಿ|ವಾಹನ|ಗಾಡಿ|ಕಾರು|वाहन|गाड़ी|వాహనం|வாகனம்|buy|purchase/i.test(qLower);
  const isMarriage = /marriage|marry|wedding|vivaha|maduve|ಲಗ್ನ|ಮದುವೆ|ವಿವಾಹ|ಸಪ್ತಮ|7th\s*house|विवाह|शादी|పెళ్లి|వివాహం|திருமணம்/i.test(qLower);
  const isCareer = /job|career|work|business|promotion|ವೃತ್ತಿ|ಉದ್ಯೋಗ|ಕೆಲಸ|ವ್ಯಾಪಾರ|10th\s*house|ದಶಮ|नौकरी|व्यापार|ఉద్యోగం|தொழில்/i.test(qLower);

  let intent: AstrologyQAResponse["detectedIntent"] = "general_siddhanta";
  if (isVahana || /muhurtha|muhurat|ಮುಹೂರ್ತ|ಶುಭ ದಿನ|good day|griha\s*pravesha|ಗೃಹಪ್ರವೇಶ/i.test(qLower)) {
    intent = "muhurtha_timing";
  } else if (isMarriage) {
    intent = "marriage_7th_house";
  } else if (isCareer) {
    intent = "career_10th_house";
  } else if (isMula || /ashlesha|jyeshtha|ashwini|magha|ಗಂಡಾಂತ|ದೋಷ|ಶಾಂತಿ|pada|ನಕ್ಷತ್ರ\s*ದೋಷ/i.test(qLower)) {
    intent = "nakshatra_pada_dosha";
  } else if (/nakshatra|ನಕ್ಷತ್ರ/i.test(qLower)) {
    intent = "nakshatra_pada_dosha";
  }

  return {
    intent,
    nakshatraIndex: isMula ? 18 : isRevati ? 26 : undefined,
    pada: isPada1 ? 1 : isPada4 ? 4 : undefined,
    isVahanaMuhurtha: isVahana,
    isMarriageQuery: isMarriage,
    isCareerQuery: isCareer,
    isMulaNakshatra: isMula,
    isRevatiNakshatra: isRevati,
    isMeenaRashi: isMeena
  };
}

/**
 * Strips raw markdown artifacts (stars, slashes, hashtags) and normalizes formatting
 * into clean, natural Indic/English prose.
 */
export function sanitizeAstrologyText(text: string, lang: SupportedLanguage = "kn"): string {
  if (!text) return "";
  let cleaned = text;

  // 1. Remove bold/italic markdown stars (**bold**, *italic*, __bold__, _italic_)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/__(.*?)__/g, "$1");
  cleaned = cleaned.replace(/_(.*?)_/g, "$1");

  // 2. Remove markdown header markers at start of lines (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // 3. Replace awkward raw slashes between words with natural conjunctions
  if (lang === "kn") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " ಮತ್ತು ");
  } else if (lang === "hi") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " और ");
  } else if (lang === "te") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " మరియు ");
  } else if (lang === "ta") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " மற்றும் ");
  } else {
    cleaned = cleaned.replace(/\s*\/\s*/g, " and ");
  }

  // 4. Clean bullet markdown tokens (* bullet, - bullet) at line starts
  cleaned = cleaned.replace(/^[*\-•]\s+/gm, "");

  // 5. Clean any lingering raw asterisks or hash symbols
  cleaned = cleaned.replace(/[*#]/g, "");

  // 6. Clean multiple spaces but keep line breaks intact
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  return cleaned.trim();
}

/**
 * Formulates a serene, natural spoken narration for text-to-speech audio playback.
 * Removes all bullet symbols, numbering, and technical debris so it sounds like a living
 * master Daivajna speaking live wisdom to the devotee.
 */
export function buildSpokenAstrologyNarrative(
  sections: AstrologyQASection[],
  lang: SupportedLanguage
): string {
  if (!sections || sections.length === 0) return "";

  const cleanSpoken = (txt: string) =>
    txt
      .replace(/^[೧೨೩೪1234]\.\s*/gm, "")
      .replace(/^[*\-•]\s*/gm, "")
      .replace(/[#*`_~]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const parts: string[] = [];

  // 1. Spoken philosophical analysis
  if (sections[0]?.content) {
    const p1 = sections[0].content.split("\n").filter((l) => l.trim().length > 0)[0] || "";
    if (p1) parts.push(cleanSpoken(p1));
  }

  // 2. Spoken timing counsel
  if (sections[1]?.content) {
    const p2 = sections[1].content.split("\n").filter((l) => l.trim().length > 0)[0] || "";
    if (p2) parts.push(cleanSpoken(p2));
  }

  // 3. Spoken priest blessing & verdict
  if (sections[3]?.content) {
    const p4 = cleanSpoken(sections[3].content);
    if (p4) parts.push(p4);
  }

  return parts.join(". ");
}

/**
 * Parses raw markdown response into structured royal cards
 */
function parseAstrologyAnswerSections(rawText: string, lang: SupportedLanguage): AstrologyQASection[] {
  const sections: AstrologyQASection[] = [];

  // First try splitting by markdown headings with section numbers
  let rawParts = rawText.split(/(?:^|\n)(?:###|\*\*|##)\s*(?:[೧೨೩೪1234]\.|\d\.)\s*/);

  // If no markdown tokens were present, split by top-level numbered headings separated by double newlines
  if (rawParts.length < 4) {
    rawParts = rawText.split(/(?:^|\n\s*\n)\s*(?:[೧೨೩೪1234]\.|\d\.)\s*/);
  }

  const defaultTitles: Record<SupportedLanguage, [string, string, string, string]> = {
    kn: [
      "೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ",
      "೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ",
      "೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ",
      "೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ"
    ],
    en: [
      "1. Classical Shastra & Technical Analysis",
      "2. Auspicious Timing, Muhurtha & Planetary Transits",
      "3. Sacred Remedies, Shanti Homa & Temple Sevas",
      "4. Astrologer's Verdict & Divine Blessings"
    ],
    hi: [
      "१. शास्त्रीय सिद्धांत एवं तकनीकी विश्लेषण",
      "२. काल निर्णय, शुभ मुहूर्त एवं दशा फल",
      "३. दैवीय उपाय, शांति होम एवं पूजा विधि",
      "४. ज्योतिषी का संदेश एवं आशीर्वाद"
    ],
    te: [
      "1. శాస్త్రీయ సిద్ధాంతం & జ్యోతిష్య విశ్లేషణ",
      "2. కాల నిర్ణయం, శుభ ముహూర్తం & దశా ఫలితం",
      "3. దైవిక పరిహారాలు, శాంతి హోమం & పూజా విధానం",
      "4. ఆచార్యుల సందేశం & ఆశీర్వాదం"
    ],
    ta: [
      "1. சாஸ்திர ரீதியான ஜோதிட விளக்கம்",
      "2. கால நிர்ணயம், சுப முகூர்த்தம் & தசா பலன்கள்",
      "3. பரிகாரங்கள், சாந்தி ஹோமம் & வழிபாட்டு முறை",
      "4. ஜோதிடரின் வழிகாட்டுதல் & ஆசிகள்"
    ]
  };

  const icons = ["📜", "⏱️", "🪔", "✨"];
  const titles = defaultTitles[lang] || defaultTitles.kn;

  if (rawParts.length >= 4) {
    for (let i = 1; i < rawParts.length && i <= 4; i++) {
      const part = rawParts[i].trim();
      const firstLineEnd = part.indexOf("\n");
      let title = titles[i - 1];
      let content = part;

      if (firstLineEnd !== -1) {
        const potentialTitle = part.substring(0, firstLineEnd).replace(/[*#]/g, "").trim();
        if (potentialTitle.length > 3 && potentialTitle.length < 80) {
          title = potentialTitle;
          content = part.substring(firstLineEnd).trim();
        }
      }

      sections.push({
        title: title.replace(/[*#]/g, "").trim(),
        content: sanitizeAstrologyText(content, lang),
        icon: icons[i - 1]
      });
    }
  }

  // Fallback if unstructured
  if (sections.length === 0) {
    const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (paragraphs.length >= 4) {
      for (let i = 0; i < 4; i++) {
        sections.push({
          title: titles[i],
          content: sanitizeAstrologyText(paragraphs[i], lang),
          icon: icons[i]
        });
      }
    } else {
      sections.push({
        title: titles[0],
        content: sanitizeAstrologyText(rawText, lang),
        icon: "📜"
      });
    }
  }

  return sections;
}

/**
 * Main Astrological Q&A Consultation Engine
 */
export async function askBaggonaAstrology({
  question,
  language,
  birthDetails,
  conversationHistory = [],
  geminiApiKey = ""
}: AskBaggonaAstrologyParams): Promise<AstrologyQAResponse> {
  const analysis = inspectQuestionIntent(question);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let astronomicalContext = "";
  let chartData: AstrologyQAResponse["chartData"] | undefined;

  // 1. Calculate live birth chart if Date & Time are provided
  if (birthDetails?.birthDate && birthDetails?.birthTime) {
    try {
      const lat = birthDetails.latitude || 19.076;
      const lng = birthDetails.longitude || 72.8777;
      const kundliResult = await calculateKundliWithPlaceSun(
        {
          name: birthDetails.name || "Devotee",
          birthDate: birthDetails.birthDate,
          birthTime: birthDetails.birthTime,
          latitude: lat,
          longitude: lng
        },
        { ayanamsaModel: "lahiri", nodeType: "true" }
      );

      const age = ageDecimalYearsAt(
        birthDetails.birthDate,
        birthDetails.birthTime,
        lat,
        lng,
        now
      );
      const currentBhukti = findBhuktiAtAge(kundliResult, age);

      const lagnaRashi = kundliResult.lagnaRashi?.english || "Unknown";
      const moonPlanet = kundliResult.planets?.find((p) => p.name === "Moon");
      const moonRashi = kundliResult.moonSign?.english || "Unknown";
      const nakshatra = moonPlanet?.nakshatra?.english || "Unknown";
      const pada = kundliResult.moonPada ?? 1;

      const dashaStr = currentBhukti
        ? `${currentBhukti.maha.planet} Mahadasha - ${currentBhukti.bhukti} Antardasha`
        : "Vimshottari Dasha";

      // 7th House for Marriage
      const seventhHouseDeg = kundliResult.houses?.[6];
      const seventhSign =
        seventhHouseDeg !== undefined
          ? RASHIS[Math.floor(seventhHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      // 4th House for Vehicles & Comforts
      const fourthHouseDeg = kundliResult.houses?.[3];
      const fourthSign =
        fourthHouseDeg !== undefined
          ? RASHIS[Math.floor(fourthHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      // 10th House for Career & Profession
      const tenthHouseDeg = kundliResult.houses?.[9];
      const tenthSign =
        tenthHouseDeg !== undefined
          ? RASHIS[Math.floor(tenthHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      const planetSummary = (kundliResult.planets || [])
        .map((p) => `${p.name} in House ${p.house} (${p.rashi?.english})`)
        .join(", ");

      astronomicalContext += `
[ASTRONOMICAL KUNDALI DATA OF DEVOTEE]:
- Name: ${birthDetails.name || "Devotee"}
- Gender: ${birthDetails.gender || "Not specified"}
- DOB: ${birthDetails.birthDate}, Time: ${birthDetails.birthTime}, Place: ${birthDetails.place || "Custom"}
- Ascendant (Lagna / 1st House): ${lagnaRashi}
- Moon Sign (Rashi): ${moonRashi}
- Birth Nakshatra & Pada: ${nakshatra} Pada ${pada}
- Current Running Period: ${dashaStr}
- 4th House (Vehicles/Property/Home): ${fourthSign}
- 7th House (Marriage/Spouse/Kalatra): ${seventhSign}
- 10th House (Career/Karma/Status): ${tenthSign}
- Complete Natal Planetary Houses: ${planetSummary}
- Current Transits (Gochara): Saturn in Pisces/Aquarius, Jupiter in Taurus/Gemini, Rahu in Pisces, Ketu in Virgo.
`;

      chartData = {
        lagna: lagnaRashi,
        moonSign: moonRashi,
        nakshatra: `${nakshatra} (Pada ${pada})`,
        dashaText: dashaStr,
        technicalHighlights: [
          `Lagna: ${lagnaRashi}`,
          `Moon: ${moonRashi} (${nakshatra} Pada ${pada})`,
          `Dasha: ${dashaStr}`,
          `7th House (Marriage): ${seventhSign}`,
          `4th House (Vehicles): ${fourthSign}`,
          `10th House (Career): ${tenthSign}`
        ]
      };
    } catch (e) {
      console.warn("[astrologyQAService] Error calculating birth chart, proceeding with general astronomical engine:", e);
    }
  }

  // 2. Inject Vahana Muhurtha Engine data if question asks about vehicle purchase
  if (analysis.isVahanaMuhurtha) {
    try {
      const rashiIdx = analysis.isMeenaRashi ? 11 : 0; // Default to Meena if mentioned
      const nakshatraIdx = analysis.isRevatiNakshatra ? 26 : 0; // Default to Revati if mentioned

      const curReport = calculateVahanaKharidiMuhurtha({
        personName: birthDetails?.name || "Devotee",
        rashiIndex: rashiIdx,
        nakshatraIndex: nakshatraIdx,
        year: currentYear,
        month: currentMonth,
        lang: language
      });

      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const nextReport = calculateVahanaKharidiMuhurtha({
        personName: birthDetails?.name || "Devotee",
        rashiIndex: rashiIdx,
        nakshatraIndex: nakshatraIdx,
        year: nextYear,
        month: nextMonth,
        lang: language
      });

      const curTopDays = (curReport.topRecommendedDays || []).slice(0, 3);
      const nextTopDays = (nextReport.topRecommendedDays || []).slice(0, 3);

      const topDaysText = [...curTopDays, ...nextTopDays]
        .map(
          (d) =>
            `- Date: ${d.dayFormatted} (${d.weekdayKn} / ${d.weekdayEn}) | Tithi: ${d.tithiKn} | Nakshatra: ${d.nakshatraKn} | Auspicious Time Window: ${d.auspiciousTimeWindowKn} | Suitability Score: ${d.suitabilityScore}% (Tara: ${d.taraNameKn}, Chandra Bala: ${d.chandraNameKn})`
        )
        .join("\n");

      astronomicalContext += `
[BAGGONA PANCHANGA VAHANA MUHURTHA ENGINE OUTPUT]:
Evaluated for Devotee Rashi: ${analysis.isMeenaRashi ? "ಮೀನ (Pisces)" : "Janma Rashi"}, Nakshatra: ${analysis.isRevatiNakshatra ? "ರೇವತಿ (Revati)" : "Janma Nakshatra"}.
Top highly recommended vehicle purchase & delivery days for ${currentMonth}/${currentYear} & ${nextMonth}/${nextYear}:
${topDaysText}
Vehicle Purchase Rules according to Baggona Siddhanta:
- Lord Venus (ಶುಕ್ರ) is the planetary Karaka for vehicles, and 4th House (ಸುಖ/ವಾಹನ ಸ್ಥಾನ) governs vehicular comforts.
- Auspicious Weekdays: Friday (ಶುಕ್ರವಾರ), Wednesday (ಬುಧವಾರ), Thursday (ಗುರುವಾರ).
- Auspicious Nakshatras: Revati, Ashwini, Rohini, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Dhanishta, Shatabhisha.
- Tithi: Shukla Paksha 2, 3, 5, 7, 10, 11, 13 (avoid Amavasya & Rikta Tithis 4, 9, 14).
- Avoid: Rahu Kaala, Yamagandam, Gulika Kaala, and Vishti (Bhadra) Karana.
- Vahana Pooja: Perform Ganesha & Lord Hanuman Pooja at the temple with lemon under 4 wheels and coconut breaking.
`;
    } catch (e) {
      console.warn("[astrologyQAService] Error generating Vahana Muhurtha context:", e);
    }
  }

  // 3. Inject Gandanta & Nakshatra Pada Shastra if question touches Mula, Ashlesha, Jyeshtha, Revati
  if (analysis.isMulaNakshatra || analysis.intent === "nakshatra_pada_dosha") {
    astronomicalContext += `
[VEDIC SHASTRA ON MULA NAKSHATRA & GANDANTA DOSHA - BRIHAT PARASHARA HORA SHASTRA]:
- Mula Nakshatra (ಮೂಲಾ ನಕ್ಷತ್ರ) spans 0°00' to 13°20' Dhanu (Sagittarius). Lord is Ketu, Deity is Nirriti.
- Pada 1 (೧ನೇ ಪಾದ): 0°00' - 3°20' Dhanu. This is the exact junction (Sandhi) between Jala Rashi (Scorpio 30°) and Agni Rashi (Sagittarius 0°). This is classical "Abhukta Moola / Ganda Moola".
- Classical Texts on Pada 1: Brihat Parashara states "ಆದ್ಯೇ ಪಾದೇ ಪಿತುರ್ಹಾನಿಃ" (can bring temporary health/financial struggles to father or elders if left without Shanti).
- CRITICAL ASTROLOGICAL REASSURANCE:
  * It is NOT an incurable danger or life-threatening curse. In Vedic astrology, Gandanta represents deep spiritual fire and karmic transformation.
  * Classical Shastra prescribes the exact 'Mula Nakshatra Shanti Homa' (ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ) performed within 27 days (when Moon returns to Mula) or on any Shukla Paksha auspicious Mula day.
  * Shanti Vidhi: 27 Kalasha Snana with 27 Nakshatra sacred herbal waters, Navagraha Homa, Rudra Japa, Maha Mrityunjaya Japa, and Go-dana (cow donation or Gau-seva).
  * Father should not see the child directly until Shanti is performed; father views the baby's face first in a bronze vessel filled with pure clarified butter/ghee (ಕಂಚಿನ ಪಾತ್ರೆಯಲ್ಲಿ ತುಪ್ಪದ ಮುಖ ದರ್ಶನ).
  * Post-Shanti Outcome: After Mula Shanti, Mula 1st Pada children grow into exceptionally brilliant, fearless, visionary leaders, scholars, and spiritual achievers.
  * Prescribed Sacred Temple Seva: Gokarna Mahabaleshwara Rudrabhisheka, Idagunji Ganapati Pooja, and Subramanya Sarpa/Ketu Shanti.
`;
  }

  // 4. Inject 7th House & Vivaha Shastra if marriage inquiry
  if (analysis.isMarriageQuery) {
    astronomicalContext += `
[VEDIC SHASTRA ON MARRIAGE & 7TH HOUSE (ಸಪ್ತಮ ಭಾವ / ವಿವಾಹ ಕಾಲ)]:
- 7th House (Kalatra Bhava) governs marriage, spouse, relationship harmony, and marital longevity.
- Venus (ಶುಕ್ರ) is Karaka for spouse in male charts; Jupiter (ಗುರು) is Karaka in female charts.
- Marriage Timing Windows: Triggered during Mahadasha/Antardasha of 7th Lord, 1st Lord, 2nd Lord, 9th Lord, or planets aspecting the 7th House.
- Gochara (Transit) Trigger: Double transit of Jupiter (Guru Gochara) and Saturn (Shani Gochara) aspecting the 7th house or natal Venus/Jupiter.
- When Gochara Guru casts 5th, 7th, or 9th divine aspect on 7th house or Lagna, marriage alliances materialize rapidly.
- Sacred Remedies: Mangala Gowri Pooja, Katyayani Vrata, Lord Shiva-Parvati Kalyana Seva, Gokarna Mahabaleshwara Abhisheka.
`;
  }

  // Construct target language instruction
  const langNames: Record<SupportedLanguage, string> = {
    kn: "Kannada (ಕನ್ನಡ)",
    en: "English",
    hi: "Hindi (हिन्दी)",
    te: "Telugu (తెలుగు)",
    ta: "Tamil (தமிழ்)"
  };
  const targetLangStr = langNames[language] || "Kannada (ಕನ್ನಡ)";

  const systemPrompt = `You are a revered, highly scholarly master Vedic Astrologer following the sacred Baggona Panchanga tradition (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸಂಪ್ರದಾಯ), under the spiritual guidance of Priest Shreeram Pandit (ಶ್ರೀರಾಮ್ ಪಂಡಿತ್).

OUTPUT LANGUAGE: ${targetLangStr}.
${
  language === "kn"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure, grammatically rich, respectful Kannada script (ಕನ್ನಡ ಲಿಪಿ). NEVER use English letters (Latin characters) to write Kannada words. Use classical Sanskrit-Kannada astrological terminology (ಲಗ್ನ, ಭಾವ, ನಕ್ಷತ್ರ, ಗೋಚಾರ, ಮುಹೂರ್ತ, ಶಾಂತಿ, ಪರಿಹಾರ)."
    : language === "hi"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Devanagari Hindi script."
    : language === "te"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Telugu script."
    : language === "ta"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Tamil script."
    : "Write in clear, authoritative, empathetic English with standard Vedic astrological Sanskrit terms in parentheses."
}

PERSONA & NARRATION:
Adopt the persona of a revered, warm, deeply learned master Vedic Daivajna (Priest Shreeram Pandit of Baggona).
Speak directly to the devotee as if sharing live spoken wisdom from your profound astrological knowledge, not reading from a textbook.
Begin Section 1 with a respectful, warm address: 'ಆತ್ಮೀಯ ಭಕ್ತರೇ,' (or 'Dear Devotee,' in English).

CRITICAL FORMATTING INSTRUCTIONS (STRICT):
1. NEVER USE RAW ASTERISKS (**bold** or *italic* or * bullets).
2. NEVER USE RAW SLASHES (/); replace slashes with natural words like 'ಮತ್ತು' (and) or 'ಅಥವಾ' (or).
3. DO NOT USE RAW HASHES (#, ##) inside the body text.
4. For numbered points in Section 2 and Section 3, write clean numbers like '೧. [ಶೀರ್ಷಿಕೆ]: [ವಿವರಣೆ]' or '1. [Title]: [Description]' without asterisks.
5. The explanation must flow smoothly and naturally like an enlightened master astrologer giving oral counsel.

THE USER'S QUESTION:
"${question}"

ASTRONOMICAL & SHASTRA CONTEXT DETECTED BY BAGGONA ENGINES:
${astronomicalContext || "General Vedic Astrology Siddhanta Query."}

STRICT 4-SECTION STRUCTURAL CONTRACT:
You must provide a deeply learned, comprehensive, clear, and reassuring response structured into the following EXACT 4 sections:

### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
(For English: ### 1. Classical Shastra & Technical Analysis)
- Deep dive into the astrological mechanics: exact Nakshatra Pada, Gandanta junction, Bhavas (7th for marriage, 4th for vehicle, 10th for career), Graha lords, and classical treatises (Brihat Parashara, Jataka Parijata).
- If birth details are provided, weave in the Lagna, running Dasha-Bhukti, and specific houses.
- Address the user's specific concern directly with empathy (e.g. if asking whether Mula 1st Pada is dangerous, explain calmly with Shastra authority).

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
(For English: ### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits)
- Provide concrete dates, months, favorable weekdays, Tithis, and Nakshatras based on Baggona Panchanga.
- Mention favorable planetary transits (Jupiter, Saturn, Rahu-Ketu) and timing windows.
- Mention timings to avoid: Rahu Kaala, Yamagandam, Gulika, and Chandrashtama.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
(For English: ### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas)
- Give 3 practical, authentic, classical Vedic remedies (Parihara / Shanti) as clean numbered lines without asterisks.
- E.g. for Mula 1st Pada: Mula Shanti Homa, 27 Kalasha Snana, Gau-seva, Ghee vessel face viewing by father.
- E.g. for Vehicle: Lord Ganesha & Hanuman Vahana Pooja with lemon and coconut.
- E.g. for Marriage: Katyayani Mantra Japa, Gokarna Mahabaleshwara Rudrabhisheka, Ganapati Homa.
- Specific sacred deity mantras with authentic count (e.g. 108 or 1008 times).

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
(For English: ### 4. Astrologer's Verdict & Sacred Blessing)
- Provide a compassionate, uplifting verdict dispelling fear and inspiring confidence.
- Conclude with a traditional Vedic blessing and priest attribution by Priest Shreeram Pandit of Baggona ("॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥").
`;

  let responseText = "";

  try {
    responseText = await askGemini(
      `Baggona Astrology Q&A: ${question.slice(0, 40)}`,
      systemPrompt,
      geminiApiKey,
      language,
      {
        raw: true,
        temperature: 0.5,
        conversationHistory: conversationHistory.slice(-8)
      }
    );
  } catch (err: any) {
    console.error("[astrologyQAService] Gemini API call failed, generating deterministic Vedic Shastra fallback:", err);
    responseText = generateDeterministicVedicFallback(question, analysis, language, birthDetails, chartData);
  }

  // Parse structured sections
  const sections = parseAstrologyAnswerSections(responseText, language);

  // Generate spoken text for audio synthesis
  const spokenText = buildSpokenAstrologyNarrative(sections, language);

  return {
    id: `qa_${Date.now()}`,
    question,
    language,
    fullAnswer: responseText,
    spokenText,
    detectedIntent: analysis.intent,
    sections,
    chartData
  };
}

/**
 * 100% Deterministic Fallback when offline or API key is not present
 */
function generateDeterministicVedicFallback(
  question: string,
  analysis: ReturnType<typeof inspectQuestionIntent>,
  lang: SupportedLanguage,
  birthDetails?: BirthDetailsInput,
  chartData?: AstrologyQAResponse["chartData"]
): string {
  if (analysis.isMulaNakshatra) {
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ ಹಾಗೂ ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಸಿದ್ಧಾಂತದ ಆಧಾರದಲ್ಲಿ ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಮೂಲಾ ನಕ್ಷತ್ರವು ಕೇತು ಗ್ರಹದ ಅಧಿಪತ್ಯದಲ್ಲಿದ್ದು, ವೃಶ್ಚಿಕ ರಾಶಿಯ ಜಲತತ್ವ ಮತ್ತು ಧನು ರಾಶಿಯ ಅಗ್ನಿತತ್ವದ ಸಂಧಿಯಲ್ಲಿ ಬರುತ್ತದೆ. ಮೊದಲನೇ ಪಾದವು (೦° ರಿಂದ ೩°೨೦' ಧನು) ಅಭುಕ್ತ ಮೂಲಾ ಅಥವಾ ಗಂಡಾಂತ ಸಂಧಿ ಎಂದು ಕರೆಯಲ್ಪಡುತ್ತದೆ. ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಮೊದಲ ಪಾದದಲ್ಲಿ ಜನನವಾದಾಗ ಪೋಷಕರಿಗೆ ವಿಶೇಷವಾಗಿ ತಂದೆಯ ಆರೋಗ್ಯ ಮತ್ತು ವ್ಯವಹಾರದಲ್ಲಿ ಆರಂಭಿಕ ಸವಾಲುಗಳು ಉಂಟಾಗಬಹುದು. ಆದರೆ ಇದು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಶಾಶ್ವತವಾದ ಅಪಾಯ ಅಥವಾ ಹೆದರಿಕೆಯ ವಿಷಯವಲ್ಲ. ವೈದಿಕ ಶಾಸ್ತ್ರದಲ್ಲಿ ಇದಕ್ಕೆ ಸ್ಪಷ್ಟ ಮತ್ತು ಶಕ್ತಿಯುತ ಪರಿಹಾರಗಳನ್ನು ನೀಡಲಾಗಿದೆ. ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿಯ ನಂತರ ಈ ದೋಷವು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಶಿಶು ಜನಿಸಿದ ೨೭ನೇ ದಿನದಂದು (ಚಂದ್ರನು ಪುನಃ ಮೂಲಾ ನಕ್ಷತ್ರಕ್ಕೆ ಪ್ರವೇಶಿಸಿದಾಗ) ಅಥವಾ ಮುಂದಿನ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನದಂದು ಮೂಲಾ ಶಾಂತಿ ಮುಹೂರ್ತ ನಿಗದಿಪಡಿಸಬೇಕು. ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಬ್ರಹ್ಮ ಮುಹೂರ್ತ ಅಥವಾ ಅಭಿಜಿತ್ ಮುಹೂರ್ತದ ಸಮಯ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿದೆ. ರಾಹುಕಾಲ, ಯಮಗಂಡ ಕಾಲ ಮತ್ತು ಭದ್ರಾ ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ: ೨೭ ತೀರ್ಥಕ್ಷೇತ್ರಗಳ ಪವಿತ್ರ ಜಲದಿಂದ ೨೭ ನಕ್ಷತ್ರ ಕಲಶ ಸ್ನಾನ ಮಾಡಿಸುವುದು.
೨. ತುಪ್ಪದ ಪಾತ್ರೆಯಲ್ಲಿ ಮುಖ ದರ್ಶನ: ಶಾಂತಿ ಪೂಜೆ ಮುಗಿಯುವವರೆಗೆ ತಂದೆ ಮಗುವನ್ನು ನೇರವಾಗಿ ನೋಡದೆ, ಕಂಚಿನ ಪಾತ್ರೆಯಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ತುಂಬಿಸಿ ಅದರಲ್ಲಿ ಮಗುವಿನ ಮುಖದ ಪ್ರತಿಬಿಂಬವನ್ನು ನೋಡಿ ದೃಷ್ಟಿದೋಷ ನಿವಾರಿಸಿಕೊಳ್ಳಬೇಕು.
೩. ಗೋ-ದಾನ ಮತ್ತು ರುದ್ರಾಭಿಷೇಕ: ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋಮಾತೆಯ ಸೇವೆ ಮಾಡಿಸುವುದು ಅತ್ಯಂತ ಶುಭಪ್ರದ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದದ ಮಕ್ಕಳು ಶಾಂತಿ ಹೋಮದ ನಂತರ ಅತ್ಯಂತ ಧೈರ್ಯಶಾಲಿಗಳಾಗಿ, ಉನ್ನತ ನಾಯಕತ್ವ ಮತ್ತು ತೀಕ್ಷ್ಣ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಪಡೆದು ಕುಟುಂಬಕ್ಕೆ ಕೀರ್ತಿ ತರುತ್ತಾರೆ. ಹೆದರುವ ಅಗತ್ಯವಿಲ್ಲ, ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ ನೆರವೇರಿಸಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on classical Brihat Parashara Hora Shastra and the sacred Baggona tradition, your inquiry has been deeply evaluated. Mula Nakshatra is ruled by Ketu and presiding deity Nirriti, placed at the critical Gandanta junction between Scorpio (water) and Sagittarius (fire). The 1st Pada (0°00' to 3°20' Sagittarius) is known as Abhukta Moola Gandanta. Classical texts like Brihat Parashara note that an unpropitiated birth in this pada can bring temporary hurdles to the father or elders. However, this is NOT a permanent curse or incurable danger; classical Vedic Shastra provides comprehensive Shanti rites that completely dissolve all negative influences and awaken immense spiritual strength.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
The Shanti ceremony should ideally be conducted on the 27th day after birth when the Moon returns to Mula Nakshatra, or during an auspicious Shukla Paksha morning in Abhijit Muhurtha. Avoid Rahu Kaalam, Yamagandam, and Vishti Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Mula Nakshatra Shanti Homa: Sacred 27-Kalasha herbal water bath and Navagraha Homa.
2. Father Ghee Reflection Ritual: The father first views the infant reflection in a bronze vessel filled with pure clarified butter before looking at the baby directly.
3. Cow Service and Gokarna Rudrabhisheka: Perform Rudrabhisheka at Gokarna Mahabaleshwara temple and offer feed to cows.

### 4. Astrologer's Verdict & Sacred Blessing
Once proper Shanti is performed, children born in Mula 1st Pada develop fearless leadership, brilliant intellectual acumen, and deep wisdom. May Lord Mahabaleshwara and Lord Ganesha bless the child.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  if (analysis.isVahanaMuhurtha) {
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ವಾಹನ ಖರೀದಿಗೆ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ೪ನೇ ಭಾವ (ವಾಹನ ಮತ್ತು ಸುಖ ಸ್ಥಾನ) ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಬಲ ಅತ್ಯಂತ ಮುಖ್ಯವಾಗಿದೆ. ರೇವತಿ ನಕ್ಷತ್ರ ಹಾಗೂ ಮೀನ ರಾಶಿಯವರಿಗೆ ಶುಕ್ರನು ಕಾರಕನಾಗಿದ್ದು, ಚರ ಮತ್ತು ಮೃದು ನಕ್ಷತ್ರಗಳಾದ ರೇವತಿ, ಅಶ್ವಿನಿ, ರೋಹಿಣಿ, ಪುನರ್ವಸು, ಪುಷ್ಯ, ಹಸ್ತ, ಸ್ವಾತಿ, ಶ್ರವಣ ನಕ್ಷತ್ರಗಳು ಅತ್ಯಂತ ಶುಭವಾಗಿವೆ. ಚಂದ್ರಬಲವು ೧, ೩, ೬, ೭, ೧೦, ೧೧ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಅಷ್ಟಮ ಚಂದ್ರ (ಚಂದ್ರಷ್ಟಮ) ಇಲ್ಲದ ದಿನವನ್ನು ಆರಿಸಬೇಕು.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ವಾಹನ ಖರೀದಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ ದಿನಗಳು:
೧. ಶುಕ್ರವಾರ ಮತ್ತು ಗುರುವಾರ: ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ ೯:೩೦ ರಿಂದ ೧೦:೪೫ (ಅಮೃತ ಕಾಲ) ಅಥವಾ ಮಧ್ಯಾಹ್ನ ೧೨:೦೦ ರಿಂದ ೧೨:೪೫ (ಅಭಿಜಿತ್ ಮುಹೂರ್ತ).
೨. ಬುಧವಾರ: ರೇವತಿ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಬುಧನಾಗಿದ್ದರಿಂದ, ಬುಧವಾರದ ಮುಹೂರ್ತವೂ ರೇವತಿ ನಕ್ಷತ್ರದವರಿಗೆ ಅತ್ಯಂತ ಶುಭಪ್ರದ.
೩. ವರ್ಜ್ಯ ಸಮಯ: ರಾಹುಕಾಲ (ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ ೧೦:೩೦ ರಿಂದ ೧೨:೦೦), ಯಮಗಂಡ ಕಾಲ ಮತ್ತು ಭದ್ರಾ ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಬಿಡಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ದೇವಸ್ಥಾನದಲ್ಲಿ ವಾಹನ ಪೂಜೆ: ವಾಹನವನ್ನು ಮನೆಗೆ ತರುವ ಮುನ್ನ ಸಮೀಪದ ಗಣಪತಿ ಅಥವಾ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನದಲ್ಲಿ ವಾಹನ ಪೂಜೆ ನೆರವೇರಿಸಿ.
೨. ನಿಂಬೆಹಣ್ಣು ಮತ್ತು ತೆಂಗಿನಕಾಯಿ: ನಾಲ್ಕು ಚಕ್ರಗಳ ಕೆಳಗೆ ನಿಂಬೆಹಣ್ಣುಗಳನ್ನು ಇರಿಸಿ ವಾಹನ ಚಲಾಯಿಸುವುದು ಮತ್ತು ದೃಷ್ಟಿದೋಷ ನಿವಾರಣೆಗೆ ವಾಹನದ ಮುಂದೆ ಕಾಯಿ ಒಡೆಯುವುದು.
೩. ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಜಪ: ವಾಹನದಲ್ಲಿ ಕುಳಿತು ೧೨ ಬಾರಿ ಈ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ ಮೊದಲ ಪ್ರಯಾಣ ಆರಂಭಿಸಿ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ರೇವತಿ ನಕ್ಷತ್ರ ಮೀನ ರಾಶಿಯವರಿಗೆ ಈ ಮುಹೂರ್ತದಲ್ಲಿ ಖರೀದಿಸುವ ವಾಹನವು ದೀರ್ಘಕಾಲಿಕ ಸುಖ, ಸುರಕ್ಷತೆ ಮತ್ತು ಸಂಪತ್ತನ್ನು ತರಲಿದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, for vehicle purchase, the 4th House (Sukha and Vahana Bhava) and Lord Venus are primary significators. For Revati Nakshatra and Meena Rashi, Mercury and Jupiter provide guidance. Movable and soft nakshatras like Revati, Rohini, Punarvasu, Pushya, Hasta, Swati, and Shravana are considered supremely auspicious. Chandra Bala must be favorable, avoiding 8th house Chandrashtama.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
According to Baggona Panchanga:
1. Recommended Days: Fridays (Venus), Thursdays (Jupiter), and Wednesdays (Mercury).
2. Favorable Hours: Abhijit Muhurtha (11:55 AM to 12:45 PM) or morning Amrita Kaala.
3. Strictly Avoid: Rahu Kaalam, Yamagandam, and Vishti Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Temple Vahana Pooja: Conduct a dedicated Pooja to Lord Ganesha and Lord Hanuman before driving home.
2. Protection Ritual: Place lemons beneath the four tires and break a sacred coconut to ward off evil eye.
3. Sacred Chanting: Chant 'Om Namo Bhagavate Vasudevaya' 12 times before commencing your first journey.

### 4. Astrologer's Verdict & Sacred Blessing
A vehicle acquired during these aligned planetary hours will bring safety, prosperity, and continuous joy to the family.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // General Vedic Astrological Fallback
  if (lang === "kn") {
    return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಗ್ರಹಗಳು, ಭಾವಗಳು ಮತ್ತು ನಕ್ಷತ್ರ ಸಂಯೋಗಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ${
      chartData ? `ನಿಮ್ಮ ಲಗ್ನ: ${chartData.lagna}, ರಾಶಿ: ${chartData.moonSign}, ನಕ್ಷತ್ರ: ${chartData.nakshatra}, ಪ್ರಸ್ತುತ ದಶಾ: ${chartData.dashaText}.` : ""
    } ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿ ಮತ್ತು ಕಾರಕತ್ವಗಳು ಸಕಾರಾತ್ಮಕ ಫಲಗಳನ್ನು ಸೂಚಿಸುತ್ತಿವೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಪ್ರಸ್ತುತ ಗುರು ಮತ್ತು ಶನಿ ಗೋಚಾರ ಫಲಗಳು ಕರ್ಮ ಮತ್ತು ಫಲ ಸಮತೋಲನವನ್ನು ತರುತ್ತಿವೆ. ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ತಿಥಿಗಳು ಹಾಗೂ ಗುರು, ಶುಕ್ರವಾರಗಳ ದಿನಗಳು ನಿಮ್ಮ ಉದ್ದೇಶಿತ ಕಾರ್ಯಗಳಿಗೆ ಅತ್ಯಂತ ಫಲಪ್ರದವಾಗಿವೆ. ರಾಹುಕಾಲ ಹಾಗೂ ಚಂದ್ರಷ್ಟಮ ದಿನಗಳನ್ನು ಹೊರತುಪಡಿಸಿ ಮುಂದುವರಿಯಿರಿ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ನಿತ್ಯ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ) ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಮತ್ತು ಪಂಚಾಮೃತ ಅಭಿಷೇಕ.
೩. ಪ್ರತಿ ಶನಿವಾರ ಮತ್ತು ಮಂಗಳವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶ್ರದ್ಧೆ ಮತ್ತು ಸತ್ಕರ್ಮಗಳಿಂದ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೈವಾನುಗ್ರಹ ಸದಾ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
  } else {
    return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, according to classical Vedic Siddhanta and Baggona Panchanga traditions, the planetary positions and relevant houses for your query indicate positive spiritual and material alignments. ${
      chartData ? `Lagna: ${chartData.lagna}, Rashi: ${chartData.moonSign}, Nakshatra: ${chartData.nakshatra}, Running Period: ${chartData.dashaText}.` : ""
    } Benefic aspects support steady progress.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Jupiter transit offers grace, while Saturn encourages disciplined effort. Favorable timing is supported in the coming months during Shukla Paksha on Thursdays and Fridays, avoiding Rahu Kaalam.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Daily Gayatri Mantra chanting (108 times) and Kuladevata remembrance.
2. Rudrabhisheka and Sankalpa Seva at Gokarna Mahabaleshwara Temple.
3. Recitation of Hanuman Chalisa on Tuesdays and Saturdays.

### 4. Astrologer's Verdict & Sacred Blessing
Maintain steady faith and pure intentions. Auspicious cosmic grace will guide your path forward.
- Blessings by Priest Shreeram Pandit of Baggona.`;
  }
}
