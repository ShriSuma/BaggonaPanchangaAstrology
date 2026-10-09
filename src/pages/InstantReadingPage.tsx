import { toKannadaRashi, toKannadaNakshatra, toKannadaPlanet, toKannadaDeity, toKannadaColor, toKannadaDirection, toKannadaChallengeArea, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  generatePanchangaAngaSynthesis,
  generateVedicConsultationAnswer,
  calculateDevoteeAge,
  type PanchangaSynthesisOutput,
  type InstantQAQuestion
} from "../core/PanchangaAngaSynthesisEngine";
import { askGemini } from "../core/GeminiEngine";
import { generateCurrentLifeSituationWithAi } from "../core/instantReadingAiEngine";
import type { CurrentLifeSituationDiagnosis } from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import InstantReadingPdfTemplate from "../components/instantReading/InstantReadingPdfTemplate";
import { PDF_LANGUAGES, type SupportedPdfLang } from "../components/instantReading/instantReadingPdfLocale";
import {
  buildDeterministicFirstSixPoints,
  parseOrEnhanceTalkingPoints,
  type FirstSixTalkingPointsStructured,
  type AstrologerPointItem
} from "../core/instantReadingTalkingPointsEngine";

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 900,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
  overflow: "hidden",
  height: 0
};

/**
 * Sanitizes astrology text to guarantee clean presentation:
 * 1. Strips all markdown asterisks (** or *) and hashes (#).
 * 2. Converts any Kannada digits (೦-೯) to English digits (0-9).
 * 3. Removes stray non-standard artifacts, English planet/zodiac words and foreign charsets.
 */
export function cleanAstrologyText(text: string): string {
  return sanitizeAstrologyKannadaText(text);
}

export default function InstantReadingPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);

  const [loading, setLoading] = useState(true);
  const [synthesisData, setSynthesisData] = useState<PanchangaSynthesisOutput | null>(null);
  const [maritalStatusOverride, setMaritalStatusOverride] = useState<string | undefined>(
    session?.input?.maritalStatus
  );

  useEffect(() => {
    if (session?.input?.maritalStatus) {
      setMaritalStatusOverride(session.input.maritalStatus);
    } else {
      setMaritalStatusOverride(undefined);
    }
  }, [session?.input?.name, session?.input?.maritalStatus]);
  const [aiNarration, setAiNarration] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dynamicTalkingPoints, setDynamicTalkingPoints] = useState<{
    openingIceBreakerKn: string;
    hiddenSubconsciousWorryKn: string;
    maandiKarmicImpactKn: string;
    bodyMarkAndTemperamentKn?: string;
    karmaFinancialRealityKn: string;
    immediateTurningPointKn: string;
    siddhaPariharaRemedyKn: string;
    ageGroupBadge?: string;
    technicalAspectsCueKn?: string;
  } | null>(null);

  const [dynamicCurrentLifeSituation, setDynamicCurrentLifeSituation] = useState<CurrentLifeSituationDiagnosis | null>(null);
  const [structuredTalkingPoints, setStructuredTalkingPoints] = useState<FirstSixTalkingPointsStructured | null>(null);

  const [playingPointKey, setPlayingPointKey] = useState<string | null>(null);

  const handlePlayTalkingPoint = (pointKey: string, content: string | AstrologerPointItem[]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(isKn ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಸೌಲಭ್ಯವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ." : "Audio speech is not supported in this browser.");
      return;
    }

    if (playingPointKey === pointKey) {
      window.speechSynthesis.cancel();
      setPlayingPointKey(null);
      return;
    }

    window.speechSynthesis.cancel();
    const rawText = Array.isArray(content)
      ? content.map((p) => `${p.id}. ${p.text}`).join(". ")
      : content;
    const cleanText = rawText.replace(/[*#_`]/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isKn ? "kn-IN" : "en-IN";
    utterance.rate = 0.88;
    utterance.pitch = 0.95;

    utterance.onstart = () => setPlayingPointKey(pointKey);
    utterance.onend = () => setPlayingPointKey(null);
    utterance.onerror = () => setPlayingPointKey(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Selected Category & Active Question Drawer
  const [activeCategory, setActiveCategory] = useState<"all" | "career" | "marriage" | "children" | "mind" | "wealth">("all");
  const [selectedQA, setSelectedQA] = useState<InstantQAQuestion | null>(null);
  const [personalityTab, setPersonalityTab] = useState<"all" | "strengths" | "challenges" | "integrity">("all");
  const [destinyAuditTab, setDestinyAuditTab] = useState<"all" | "lucky" | "unlucky" | "examples" | "matrix">("all");
  const [selectedBhuktiTab, setSelectedBhuktiTab] = useState<number>(0);

  // Custom Q&A State
  const [questionInput, setQuestionInput] = useState("");
  const [answering, setAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // PDF Export State & 6-Language Support
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPdfLangModalOpen, setIsPdfLangModalOpen] = useState(false);
  const [pdfLanguage, setPdfLanguage] = useState<SupportedPdfLang>("kn");
  const [pdfStatusMessage, setPdfStatusMessage] = useState("");

  const isKn = i18n.language.startsWith("kn");

  useEffect(() => {
    return () => {
      stopAllAudioGlobal();
    };
  }, []);

  useEffect(() => {
    if (!session || !session.result) {
      setLoading(false);
      return;
    }

    const birthDate = session.birthDateYmd || session.input?.birthDate;
    const birthTime = session.birthTimeHm || session.input?.birthTime || "12:00";
    const lat = session.input?.latitude;
    const lon = session.input?.longitude;

    if (!birthDate || typeof lat !== "number" || typeof lon !== "number") {
      setLoading(false);
      return;
    }

    const devoteeAge = calculateDevoteeAge(birthDate);
    const resolvedMaritalStatus = maritalStatusOverride !== undefined
      ? maritalStatusOverride
      : session.input?.maritalStatus;

    const data = generatePanchangaAngaSynthesis(session.result, {
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lon,
      lang: i18n.language,
      devoteeName: session.input.name || "Devotee",
      gender: session.input.gender,
      devoteeAge,
      maritalStatus: resolvedMaritalStatus
    });

    setSynthesisData(data);
    const initialStructured = buildDeterministicFirstSixPoints(data, session, isKn);
    setStructuredTalkingPoints(initialStructured);
    setDynamicCurrentLifeSituation(data.currentDiagnosis.currentLifeSituation || null);
    setAiNarration(data.multiParagraphExecutiveReading.map(cleanAstrologyText));
    setLoading(false);

    // Trigger AI enhanced Current Life Situation generation (with 10-retry loop & impressive header)
    void (async () => {
      try {
        const enhancedCls = await generateCurrentLifeSituationWithAi({
          session,
          currentDiagnosis: data.currentDiagnosis,
          cls: data.currentDiagnosis.currentLifeSituation,
          apiKey: geminiApiKey,
          lang: i18n.language
        });
        if (enhancedCls) {
          setDynamicCurrentLifeSituation(enhancedCls);
          data.currentDiagnosis.currentLifeSituation = enhancedCls;
          setSynthesisData({ ...data });
        }
      } catch (err) {
        console.warn("[InstantReadingPage] AI CurrentLifeSituation error:", err);
      }
    })();

    // Trigger AI enhanced live reading with strict formatting instructions
    void (async () => {
      setAiLoading(true);
      try {
        const isFemale = session.input.gender === "Female";
        const gba = data.currentDiagnosis.goodBadAnalysis;
        const isTeetotaler = gba?.isTeetotaler ?? false;
        const hasMaritalFidelity = gba?.hasMaritalFidelity ?? false;
        const dietSummaryEn = gba?.dietSummaryEn || "";
        const fidelitySummaryEn = gba?.fidelitySummaryEn || "";
        const spouseTerm = isFemale ? "ಪತಿ (ಗಂಡ)" : "ಪತ್ನಿ (ಹೆಂಡತಿ)";
        const negShades = data.currentDiagnosis.negativeShades;
        const isNegClean = !negShades || negShades.overallScore <= 15 || negShades.isJupiterProtected || negShades.isChildShielded;
        const cls = data.currentDiagnosis.currentLifeSituation;
        const prof = data.currentDiagnosis.accurateProfession;

        const promptContext = `
Devotee Name: ${session.input.name || "Devotee"}
Gender: ${session.input.gender || "Not Specified"} (${isFemale ? "Female/ಸ್ತ್ರೀ" : "Male/ಪುರುಷ"})
Age: ${devoteeAge} (${devoteeAge < 14 ? "Child / Minor (<14 years) - Protect innocence" : "Adult"})
Marital Status: ${resolvedMaritalStatus || (devoteeAge >= 30 ? "Presumed Married (Grihastha - Adult)" : "Single/Unmarried")}
Birth Details: ${birthDate} at ${birthTime} (Lat: ${lat}, Lon: ${lon})
Lagna: ${session.result.lagnaRashi.english} (${session.result.lagnaRashi.sanskrit})
Moon Rashi: ${session.result.moonSign.english} (${session.result.moonSign.sanskrit})
Moon Nakshatra: ${session.result.planets.find((p) => p.name === "Moon")?.nakshatra.english || "Ashwini"}
Panchanga 5-Angas:
- Vara: ${data.panchanga.vara.nameKn} (${data.panchanga.vara.tatva})
- Tithi: ${data.panchanga.tithi.nameKn}
- Nakshatra: ${data.panchanga.nakshatra.nameKn}
- Yoga: ${data.panchanga.yoga.nameKn} (${data.panchanga.yoga.rule.isAuspicious ? "Auspicious" : "Requires Care"})
- Karana: ${data.panchanga.karana.nameKn} (${data.panchanga.karana.rule.type})
Technical Astrological Placements:
- 4th House (Mind/Peace): ${data.currentDiagnosis.technicalAspects.fourthHouseDetail}
- 5th House (Intellect/Purva Punya): ${data.currentDiagnosis.technicalAspects.fifthHouseDetail}
- 7th House (Partnership/Marriage): ${data.currentDiagnosis.technicalAspects.seventhHouseDetail}
- 10th House (Career/Karma): ${data.currentDiagnosis.technicalAspects.tenthHouseDetail}
- Running Dasha & Gochara: ${data.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}
- Acute Current Life Reality & Internal Mindset (ಹಾಲಿ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಆಂತರಿಕ ಮನಸ್ಥಿತಿ):
  * Headline: ${cls?.headlineKn || data.currentDiagnosis.primaryLifeChallenge.description} (${cls?.headlineEn || data.currentDiagnosis.primaryLifeChallenge.descriptionEn})
  * External Life Reality (ಬಾಹ್ಯ ವಾಸ್ತವ ಸಂಗತಿಗಳು): ${cls?.externalLifeRealityKn || cls?.detailedRealityKn || data.currentDiagnosis.primaryLifeChallenge.description}
  * Internal Mindset & Psychological Weather (ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಯೋಚನಾ ಲಹರಿ): ${cls?.internalMindsetKn || "ಮಾನಸಿಕ ಚಿಂತನೆಗಳು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳ ಸಮನ್ವಯ."}
  * Planetary Culprit: ${cls?.planetaryCulpritKn || data.currentDiagnosis.primaryLifeChallenge.planetaryRootCause}
  * Key Daily Life Symptoms: ${cls?.symptomsChecklistKn.join(" | ") || ""}
- Accurate Career Fields Where Native Will Shine & Flourish (ಜಾತಕರು ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ & ಗರಿಷ್ಠ ಯಶಸ್ಸು ಕಾಣುವ ವೃತ್ತಿ ರಂಗಗಳು):
  * Primary Field: ${prof?.titleKn || ""} (${prof?.titleEn || ""})
  * Top Recommended Fields: ${prof?.topSuitableFields ? prof.topSuitableFields.slice(0, 4).map((f: any) => `${f.fieldNameKn} (${f.suitabilityPercentage}%)`).join(", ") : ""}
  * Why Native Flourishes: ${prof?.whyNativeShinesKn || prof?.workEnvironmentKn || ""}
  * Special Career Yogas: ${prof?.specialCareerYogasKn?.join(", ") || "ಕರ್ಮ ಸ್ಥಾನದ ಶುಭ ಯೋಗ"}
  * Leadership Potential: ${prof?.leadershipPotentialKn || ""}
  * Natural Academic / Subject Talents: ${prof?.subjectAptitudes ? prof.subjectAptitudes.map((s: any) => `${s.nameKn} (${s.ratingKn})`).join(", ") : ""}
  * Classical Basis: ${prof?.astrologicalBasisKn || ""}
  * Jaimini Amatyakaraka (AmK): ${prof?.amatyakarakaPlanetKn || ""}
  * 10th House Sign: ${prof?.tenthHouseSignKn || ""} (Lord: ${prof?.primaryPlanetKn || ""})
- Character & Dietary Verification (4-Tier Separation):
  * Diet / Substance: ${isTeetotaler ? "STRICT TEETOTALER (ಸಾತ್ವಿಕ ಆಹಾರಿ - Zero alcohol, zero smoking, clean vegetarian intake due to benefic/Guru protection on 2nd house). NEVER accuse of alcohol or drugs!" : (data.currentDiagnosis.goodBadAnalysis?.hasDhumapanaOrSubstanceTendency ? `PRONE TO DHUMAPANA/SMOKING/WEED/TOBACCO (ಧೂಮಪಾನ / ಹುಕ್ಕಾ / ತಂಬಾಕು ಸೆಳೆತ): Rahu/Mars influence on 2nd/8th/12th houses. Address smoking/nicotine habit without harshness and advise respiratory care.` : (data.currentDiagnosis.goodBadAnalysis?.hasMadyapanaRisk ? `PRONE TO ALCOHOL/MADYAPANA (ಮದ್ಯಪಾನದ ಸೆಳೆತ): Saturn/Rahu or watery sign influence on 2nd/8th houses. Address evening alcohol habit under stress and advise detox.` : `BALANCED DIET / OCCASIONAL SOCIAL INTAKE: ${dietSummaryEn || "Normal diet without severe substance risks"}.`))}
  * Marital Fidelity & Sensual Reality (3-Tier Separation): ${data.currentDiagnosis.goodBadAnalysis?.isHighFidelityVrata ? `SACRED EKAPATNI/EKAPATI VRATA (ಪವಿತ್ರ ಏಕಪತ್ನಿ ವ್ರತ - Pure 7th house and Venus under divine Jupiter protection). Unshakeable lifelong devotion to spouse '${spouseTerm}'. NEVER accuse of infidelity!` : (data.currentDiagnosis.goodBadAnalysis?.hasMultipleRelationshipsRisk ? `MULTIPLE RELATIONSHIPS / SENSUAL RESTLESSNESS (ಬಹು ಪ್ರಣಯ ಸಂಬಂಧಗಳು / ಕಾಮ ಚಾಂಚಲ್ಯ): Rahu in 7th/5th or Mars-Venus aspect. Address romantic wanderlust and attractions outside marriage, counseling strict ethical boundaries.` : (hasMaritalFidelity ? `STANDARD MARITAL FIDELITY (ಸಾಮಾನ್ಯ ದಾಂಪತ್ಯ ಧರ್ಮ & ನೈತಿಕ ಸಂಯಮ): Committed to family honor and marital norms.` : `SENSUAL RESTLESSNESS (ಕಾಮ ಚಾಂಚಲ್ಯ): Address private inner distractions causing friction with ${spouseTerm}, counseling sensory restraint.`))}
- Moral Integrity & Criminality Assessment:
  * Overall Negative Shade Score: ${negShades ? negShades.overallScore : 0}/100 (${negShades?.categoryTitleEn || "Moral Purity"})
  * Clean / Purity Status: ${isNegClean ? "100% CLEAN & MORALLY PURE (ಸರ್ವದೋಷ ವಿನಾಶನಃ - Protected by Jupiter/benefics. Absolutely ZERO criminal, theft, murder, violence, sexual assault, fraud, or prison yogas!). NEVER ACCUSE THIS NATIVE OF ANY CRIME, THEFT, VIOLENCE, EXTRAMARITAL SINS, OR FRAUD!" : "Has certain shadow propensities under malefic dasha/gochara"}
  * 5 Dimension Details:
    1. Sensual/Marital: ${negShades?.sensualMarital.analysisEn || "Clean"}
    2. Financial/Theft: ${negShades?.financialIntegrity.analysisEn || "Clean"}
    3. Violence/Cruelty: ${negShades?.violenceAggression.analysisEn || "Clean"}
    4. Legal/Imprisonment: ${negShades?.legalBandhana.analysisEn || "Clean"}
    5. Conduct/Bad Company: ${negShades?.conductDownwardPath.analysisEn || "Clean"}
- Prescriptions: ${data.prescriptions.rudraksha.nameKn}, ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}) on ${data.prescriptions.gemstoneRing.fingerKn}.

Baseline Kundli Astrologer Cards (Deterministic Shastra Calculations):
- Card 1 (Lagna & Core Nature): ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn : (data.currentDiagnosis.astrologerTalkingPoints.openingIceBreakerEn || data.currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn)}
- Card 2 (Chandra & Mental Worry): ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn : (data.currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryEn || data.currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn)}
- Card 3 (Maandi Karma Knot): ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn : (data.currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactEn || data.currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn)}
- Card 4 (Anga Lakshana & Tridosha): ${isKn ? (data.currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentKn || "") : (data.currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentEn || data.currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentKn || "")}
- Card 5 (Karma & Financial Reality): ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn : (data.currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityEn || data.currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn)}
- Card 6 (Dasha Turning Point): ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn : (data.currentDiagnosis.astrologerTalkingPoints.immediateTurningPointEn || data.currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn)}
- Sacred Remedy: ${isKn ? data.currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn : (data.currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyEn || data.currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn)}

STRICT WRITING & ASTROLOGER PERSONA RULES:
1. Speak DIRECTLY to the devotee in authoritative, deeply empathetic, face-to-face Vedic Astrologer spoken voice in 100% PURE ${isKn ? "Kannada" : "English"}. NO English words or foreign language mix-up.
2. Use standard traditional Vedic planetary terminology: 'ರವಿ' (Ravi), 'ಕುಜ' (Kuja), 'ಗುರು' (Guru), 'ಶುಕ್ರ' (Shukra), 'ಶನಿ' (Shani), 'ಬುಧ' (Budha), 'ಚಂದ್ರ' (Chandra), 'ರಾಹು' (Rahu), 'ಕೇತು' (Ketu).
3. MANDATORY PARAGRAPH 1 DIRECT REALITY: The very first paragraph MUST start with what the person is currently experiencing in both: (A) External Real-Life Events (${cls?.externalLifeRealityKn || cls?.detailedRealityKn || data.currentDiagnosis.primaryLifeChallenge.description}), and (B) Internal Mindset & Psychological Weather (${cls?.internalMindsetKn || ""}). Reveal their running Dasha (${data.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}) and planetary timing.
4. MANDATORY PARAGRAPH 2 CAREER FIELDS & NATURAL TALENTS: Highlight the prime career fields where the native is destined to shine and flourish (${prof?.topSuitableFields ? prof.topSuitableFields.slice(0, 3).map((f: any) => isKn ? f.fieldNameKn : f.fieldNameEn).join(", ") : prof?.titleKn || ""}). Mention their natural academic/intellectual aptitudes, leadership potential (${prof?.leadershipPotentialKn || ""}), and high-power career yogas (${prof?.specialCareerYogasKn?.join(", ") || ""}) based on the 10th house, Amatyakaraka, and planetary dignity. DO NOT guess or assert what temporary job they currently do today.
5. Structure your response into 4 comprehensive paragraphs:
   - Paragraph 1: Direct greeting ("ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ."). Address both external real-life events and internal mindset/anxieties, running Dasha, and acute planetary timing.
   - Paragraph 2: State their destined career fields where they achieve highest success (${prof?.topSuitableFields ? prof.topSuitableFields.slice(0, 3).map((f: any) => isKn ? f.fieldNameKn : f.fieldNameEn).join(", ") : prof?.titleKn || ""}), their natural academic & intellectual aptitudes, and classical yogas supporting growth.
   - Paragraph 3: Explain the astrological planetary reality and give an exact turning-point timeline (${cls?.reliefTimelineKn || data.currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ"}) using ENGLISH DIGITS when breakthroughs occur.
   - Paragraph 4: Prescribe the exact remedies with precision: ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}), ${data.prescriptions.rudraksha.nameKn}, daily morning rituals, and Gokarna Mahabaleshwara Kshetra blessings.
6. DO NOT use markdown bold asterisks (no ** or *). Use clean, plain text.
7. ALL NUMBERS MUST BE IN ENGLISH DIGITS (e.g. 1, 2, 3, 4.25 - 6.5 Carat, 9 Mukhi, 7th house, 10th house, 3 to 6 months).
8. CHARACTER & GENDER ACCURACY:
   - If Diet is TEETOTALER, highlight their clean, pure lifestyle (ಸಾತ್ವಿಕ ಆಹಾರ); NEVER accuse of alcohol, smoking, or drug habits.
   - If Diet indicates DHUMAPANA/SMOKING, address smoking/hookah/nicotine habit without harshness and advise lung protection.
   - If Diet indicates ALCOHOL VULNERABILITY, compassionately address their private evening alcohol habit under stress (ಮದ್ಯಪಾನದ ಸೆಳೆತ) and advise conscious detox.
   - If Relationship is SACRED EKAPATNI VRATA, praise their divine devotion to spouse; NEVER accuse of cheating or extramarital affairs.
   - If Relationship indicates MULTIPLE RELATIONSHIPS, address their romantic wanderlust and attractions outside marriage, counseling strict moral discipline.
   - If Relationship is STANDARD FIDELITY, acknowledge their commitment to normal family ethics and boundaries.
   - If devotee is Female, NEVER use 'ಹೆಂಡತಿ' or 'ಪತ್ನಿ' to describe the native.
   - If devotee is a Child (<14), focus purely on education, health, and parent guidance without adult topics.
   - CRITICAL ZERO FALSE ACCUSATION OF CRIMINALITY/THEFT/VIOLENCE: If native has score <= 15 or Jupiter/benefic shield, you MUST NEVER accuse them of crime, theft, violence, murder, imprisonment, cheating, or sexual misconduct. Acknowledge and praise their clean moral integrity and character shield.
9. MANDATORY 10+ STRUCTURED BULLET POINTS FOR THE FIRST 6 SECTIONS:
   Instead of dense paragraphs, EVERY SINGLE ONE OF THE FIRST 6 SECTIONS MUST HAVE AT LEAST 10 TO 12 STRUCTURED BULLET POINTS with tone classification:
   - "good": Auspicious qualities, strengths, positive yogas, gains, and protections (highlighted in Green in UI)
   - "bad": Afflictions, doshas, 99% stalls, anxieties, hurdles, and stresses (highlighted in Red in UI)
   - "notice": Key turning points, milestones, transition countdown, and vigilance rules (highlighted in Yellow in UI)
   - "normal": General classical Shastric foundations and factual details (Normal neutral in UI)
   
   Section 1 (openingIceBreakerPoints): CRITICAL: STRICTLY ZERO TECHNICAL ASTROLOGICAL JARGON (NEVER mention words like Lagna, Ascendant, Rashi, Moon sign, Nakshatra, Graha, House, Lord, Pada, or planetary names). Every single bullet must describe a CRISP, POINT-TO-POINT, UNQUESTIONABLE PERSONALITY TRAIT, BEHAVIORAL HABIT, OR EMOTIONAL CHARACTERISTIC of this native based on their temperament. Focus on: sovereign self-respect, zero tolerance for bossiness, selective loyalty, inability to forgive betrayal, razor-sharp lie-detector sense, bearing burdens in silence without begging for pity, blunt truth-telling, hatred of sluggishness/carelessness, unadvertised charity, relentless perfectionism, outer smile vs midnight overthinking, and purva-punya resilience. Every point must make the client say 'YES, that is 100% me!'
   Section 2 (hiddenSubconsciousWorryPoints): At least 10 points on Chandra, midnight overthinking, silent burdens, and intuitive recovery.
   Section 3 (maandiKarmicImpactPoints): At least 10 points on Maandi house, 99% task hurdle, last-mile glitch, and Gokarna remedy.
   Section 4 (bodyMarkAndTemperamentPoints): At least 10 points on Brihat Jataka Ch. 25 Anga Lakshana, mole/mark position, and Tridosha metabolism.
   Section 5 (karmaFinancialRealityPoints): At least 10 points on 10th house karma, workplace ethics, uncredited labor, and liquid cash vs asset reality.
   Section 6 (immediateTurningPointPoints): At least 10 points on Dasha timeline countdown, Gochara turning point window, and sacred Gokarna Atma Linga remedies.
`;

        const promptContextWithJson = `${promptContext}

OUTPUT FORMAT INSTRUCTIONS:
Return a valid JSON object matching this schema:
{
  "executiveReadingParagraphs": [
    "Paragraph 1 (Direct Greeting & Acute Current Life Situation - ಹಾಲಿ ಅನುಭವಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ)",
    "Paragraph 2 (Destined Career Fields & Natural Talents - ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ ವೃತ್ತಿ ರಂಗಗಳು & ಪ್ರತಿಭೆ)",
    "Paragraph 3 (Planetary Reality & Turning Point Timeline in English digits)",
    "Paragraph 4 (Practical Remedies, Gemstone, Rudraksha & Gokarna Blessings)"
  ],
  "openingIceBreakerPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "hiddenSubconsciousWorryPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "maandiKarmicImpactPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "bodyMarkAndTemperamentPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "karmaFinancialRealityPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "immediateTurningPointPoints": [
    { "id": 1, "text": "Point 1 in pure ${isKn ? "Kannada" : "English"}", "tone": "good|bad|notice|normal" }
  ],
  "siddhaPariharaRemedy": "Gokarna Siddha Parashari remedy in pure ${isKn ? "Kannada with zero English words" : "English"}."
}

STRICT RULES:
1. Speak DIRECTLY to the devotee in empathetic, authoritative Vedic pandit voice in natural ${isKn ? "Kannada (CRITICAL: ZERO English words or Latin letters in Kannada text)" : "English"}.
2. NO markdown asterisks (no ** or *).
3. ALL NUMBERS MUST BE IN ENGLISH DIGITS (1, 2, 3, 4, 5, etc.).
4. EVERY SINGLE TALKING POINT SECTION MUST CONTAIN AT LEAST 10 DISTINCT BULLET POINTS with tone classification ("good", "bad", "notice", or "normal").
5. Return ONLY raw valid JSON.
6. In Section 1 (openingIceBreakerPoints), STRICTLY ZERO TECHNICAL ASTROLOGY WORDS (no Lagna, Rashi, Nakshatra, Graha, House, Lord, Pada, Ascendant). Describe only the native's real psychological characteristics and behavioral realities.`;

        const response = await askGemini(
          "Generate comprehensive live life situation reading and 5 astrologer verbal prompts",
          promptContextWithJson,
          geminiApiKey,
          isKn ? "kn" : "en",
          { raw: true, temperature: 0.2 }
        );

        if (response) {
          try {
            const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            const tpFallback = data.currentDiagnosis.astrologerTalkingPoints;

            const enhanced = parseOrEnhanceTalkingPoints(parsed, initialStructured, isKn);
            setStructuredTalkingPoints(enhanced);

            setDynamicTalkingPoints({
              openingIceBreakerKn: enhanced.openingIceBreaker.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              hiddenSubconsciousWorryKn: enhanced.hiddenSubconsciousWorry.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              maandiKarmicImpactKn: enhanced.maandiKarmicImpact.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              bodyMarkAndTemperamentKn: enhanced.bodyMarkAndTemperament.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              karmaFinancialRealityKn: enhanced.karmaFinancialReality.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              immediateTurningPointKn: enhanced.immediateTurningPoint.map((p) => `${p.id}. ${p.text}`).join("\n\n"),
              siddhaPariharaRemedyKn: cleanAstrologyText(
                parsed.siddhaPariharaRemedy || (isKn ? tpFallback.siddhaPariharaRemedyKn : (tpFallback.siddhaPariharaRemedyEn || tpFallback.siddhaPariharaRemedyKn))
              ),
              ageGroupBadge: isKn ? tpFallback.ageGroupBadgeKn : (tpFallback.ageGroupBadgeEn || tpFallback.ageGroupBadgeKn),
              technicalAspectsCueKn: tpFallback.technicalAspectsCueKn
            });

            if (Array.isArray(parsed.executiveReadingParagraphs) && parsed.executiveReadingParagraphs.length >= 2) {
              setAiNarration(parsed.executiveReadingParagraphs.map(cleanAstrologyText));
            }
          } catch (jsonErr) {
            console.warn("[InstantReadingPage] JSON parse error in AI talking points:", jsonErr);
          }
        }
      } catch (err) {
        console.warn("AI reading fallback to deterministic rules:", err);
      } finally {
        setAiLoading(false);
      }
    })();
  }, [session, geminiApiKey, i18n.language, maritalStatusOverride]);

  // Handle Speech Recognition for Voice Q&A
  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isKn ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice Input) ಲಭ್ಯವಿಲ್ಲ." : "Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isKn ? "kn-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestionInput(transcript);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Devotee age computation for child vs adult behavior handling
  const devoteeAge = session?.input?.birthDate ? calculateDevoteeAge(session.input.birthDate) : 30;
  const isChild = devoteeAge < 14;

  // Handle Asking Custom Astrologer Question
  const handleAskQuestion = async (customQ?: string) => {
    const q = (customQ || questionInput).trim();
    if (!q || !session || !session.result || !synthesisData) return;

    setAnswering(true);
    try {
      let ansText = "";

      if (geminiApiKey) {
        try {
          const isFemaleQ = session.input.gender === "Female";
          const spouseTermQ = isFemaleQ ? "ಪತಿ (ಗಂಡ)" : "ಪತ್ನಿ (ಹೆಂಡತಿ)";
          const gbaQ = synthesisData.currentDiagnosis.goodBadAnalysis;
          const isTeetotalerQ = gbaQ?.isTeetotaler ?? false;
          const hasDhumapanaQ = gbaQ?.hasDhumapanaOrSubstanceTendency ?? false;
          const hasMadyapanaQ = gbaQ?.hasMadyapanaRisk ?? false;
          const isHighFidelityQ = gbaQ?.isHighFidelityVrata ?? false;
          const hasMultipleRelQ = gbaQ?.hasMultipleRelationshipsRisk ?? false;
          const hasMaritalFidelityQ = gbaQ?.hasMaritalFidelity ?? false;
          const dietSummaryEnQ = gbaQ?.dietSummaryEn || "";
          const fidelitySummaryEnQ = gbaQ?.fidelitySummaryEn || "";
          const negShadesQ = synthesisData.currentDiagnosis.negativeShades;
          const isNegCleanQ = !negShadesQ || negShadesQ.overallScore <= 15 || negShadesQ.isJupiterProtected || negShadesQ.isChildShielded;

          const contextData = `
Devotee: ${session.input.name || "Devotee"}
Gender: ${session.input.gender || "Not Specified"} (${isFemaleQ ? "Female/ಸ್ತ್ರೀ" : "Male/ಪುರುಷ"})
Age: ${devoteeAge} (${isChild ? "Child / Minor (<14 years)" : "Adult (>=14 years)"})
Marital Status: ${(maritalStatusOverride ?? session.input?.maritalStatus) || (devoteeAge >= 30 ? "Presumed Married (Grihastha - Adult)" : "Single/Unmarried")}
Lagna: ${session.result.lagnaRashi.english} | Moon: ${session.result.moonSign.english} | Nakshatra: ${session.result.planets.find(p => p.name === "Moon")?.nakshatra.english}
Panchanga 5-Angas: Vara=${synthesisData.panchanga.vara.nameKn}, Tithi=${synthesisData.panchanga.tithi.nameKn}, Yoga=${synthesisData.panchanga.yoga.nameKn}, Karana=${synthesisData.panchanga.karana.nameKn}
Technical Placements: 4th=${synthesisData.currentDiagnosis.technicalAspects.fourthHouseDetail}, 7th=${synthesisData.currentDiagnosis.technicalAspects.seventhHouseDetail}, 10th=${synthesisData.currentDiagnosis.technicalAspects.tenthHouseDetail}.
Dasha: ${synthesisData.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}.
Character & Morality Verification:
- Dietary Intake / Addictions (4-Tier Separation): ${isTeetotalerQ ? "STRICT TEETOTALER (ಸಾತ್ವಿಕ ಆಹಾರಿ - Zero alcohol, zero smoking, clean vegetarian intake due to Guru/benefic protection on 2nd house). If asked about alcohol, smoking, or intoxicants, give an authoritative 'ಇಲ್ಲ!' verdict and celebrate their pure lifestyle." : (hasDhumapanaQ ? `DHUMAPANA / SMOKING / WEED / TOBACCO VULNERABILITY (ಧೂಮಪಾನ / ಹುಕ್ಕಾ / ತಂಬಾಕು ಸೆಳೆತ): ${dietSummaryEnQ || "Prone to smoking/hookah/tobacco under stress"}. If asked about smoking/tobacco, state clearly this tendency and urge respiratory care, but DO NOT falsely accuse them of being an alcoholic.` : (hasMadyapanaQ ? `ALCOHOL VULNERABILITY (ಮದ್ಯಪಾನ / ಶನಿ-ರಾಹು ದೃಷ್ಟಿ): ${dietSummaryEnQ || "Prone to evening alcohol consumption under stress"}. If asked about drinking, state clearly that stress triggers alcohol intake and urge detox.` : `BALANCED DIET / OCCASIONAL SOCIAL INTAKE: ${dietSummaryEnQ || "Normal diet without severe substance risks"}. No severe addiction.`))}
- Relationship Fidelity (3-Tier Separation): ${isHighFidelityQ ? `DIVINE MARITAL FIDELITY / EKAPATNI VRATA (ದೈವಿಕ ${isFemaleQ ? "ಏಕಪತಿ ವ್ರತ" : "ಏಕಪತ್ನಿ ವ್ರತ"} - Highest moral purity, 7th house and Venus strictly protected by Guru). If asked about extramarital affairs or wandering, give an authoritative 'ಇಲ್ಲ!' verdict celebrating their sacred loyalty.` : (hasMultipleRelQ ? `MULTIPLE RELATIONSHIPS / SENSUAL WANDERLUST RISK (ಕಾಮ ಚಾಂಚಲ್ಯ & ಬಹು ಪ್ರಣಯ ಸಂಬಂಧಗಳ ಸಾಧ್ಯತೆ): ${fidelitySummaryEnQ || "Prone to multiple romantic interests or wanderlust due to Rahu in 7th/5th or afflicted Venus"}. If asked about fidelity, address internal wandering honestly and urge sensory discipline to preserve marriage.` : (hasMaritalFidelityQ ? `STANDARD MARITAL FIDELITY (ಸಾಮಾನ್ಯ ದಾಂಪತ್ಯ ಧರ್ಮ & ನೈತಿಕ ಸಂಯಮ): Natural loyalty and ethical responsibility in domestic life. Clean marital character.` : `DOMESTIC ATTENTION NEEDED: ${fidelitySummaryEnQ || "Requires mutual communication and emotional care in marriage"}.`))}
- Moral Integrity & Criminality Assessment:
  * Overall Negative Shade Score: ${negShadesQ ? negShadesQ.overallScore : 0}/100 (${negShadesQ?.categoryTitleEn || "Moral Purity"})
  * Purity Shield: ${isNegCleanQ ? "100% CLEAN & FREE FROM CRIME, THEFT, FRAUD, VIOLENCE, MURDER, SEXUAL ASSAULT, IMPRISONMENT (Protected by Guru/benefics - ಸರ್ವದೋಷ ವಿನಾಶನಃ)" : "Shadow tendencies active"}
  * Theft/Fraud Risk: ${negShadesQ?.financialIntegrity.hasRisk ? "Yes" : "NO (100% Honest/Clean)"}
  * Violence/Murder Risk: ${negShadesQ?.violenceAggression.hasRisk ? "Yes" : "NO (100% Peaceful/Non-violent)"}
  * Prison/Bandhana Risk: ${negShadesQ?.legalBandhana.hasRisk ? "Yes" : "NO (100% Law-abiding)"}
  * Extramarital/Sensual Risk: ${negShadesQ?.sensualMarital.hasRisk ? "Yes" : "NO (100% Faithful)"}
  * Bad Company/Downward Risk: ${negShadesQ?.conductDownwardPath.hasRisk ? "Yes" : "NO (100% Righteous Path)"}
- Gender Awareness: ${isFemaleQ ? "Female native - NEVER use 'ಹೆಂಡತಿ' or 'ಪತ್ನಿ' for the native; spouse is husband ('ಪತಿ')" : "Male native - spouse is wife ('ಪತ್ನಿ')"}
Prescriptions: ${synthesisData.prescriptions.rudraksha.nameKn}, ${synthesisData.prescriptions.gemstoneRing.primaryGemstoneKn} (${synthesisData.prescriptions.gemstoneRing.caratWeight}).

Question from Devotee: "${q}"

Task: Give a deep, face-to-face conversational Vedic Pandit consultation response in natural spoken ${isKn ? "Kannada" : "English"} adopting this exact conversational spoken tone:
"ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ."

Respond in crisp, structured bullet points directly answering the devotee's specific question. The very FIRST bullet point MUST be the direct verdict/answer:
• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: Direct, unambiguous verdict in 1-2 powerful sentences (e.g., if asked about extramarital attraction: state clearly "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದೆ..." or "ಹೌದು...", if drinking/addiction asked for a teetotaler: state clearly "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 2ನೇ ಸ್ಥಾನವು ಗುರು ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಸಾತ್ವಿಕ ಆಹಾರ ಸಂಸ್ಕಾರವಿದೆ...", if crime/theft/violence asked for a clean native: state clearly "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಶ್ರೀರಕ್ಷೆಯಿದ್ದು, ಯಾವುದೇ ಕಳ್ಳತನ, ವಂಚನೆ, ಹಿಂಸೆ ಅಥವಾ ಅಪರಾಧದ ಕಳಂಕವಿಲ್ಲ...", if marriage timing: give exact months, if debt: state clear clearance timeline). MUST be the 1st bullet point!
• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: Exact planetary positions, houses, dasha-bhukti, and gochara transits influencing this question and explaining why this verdict is true.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: Exact turning point timeline in English digits calculated from running Dasha-Bhukti remaining duration (${synthesisData.currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ"}).
• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: Prescribe authentic Vedic remedies, Gokarna Mahabaleshwara Shanti Pooja, and sacred practices to resolve this issue.

STRICT RULES:
- ZERO FALSE ACCUSATIONS & CONTRADICTIONS: If the native is a verified Teetotaler (ಸಾತ್ವಿಕ ಆಹಾರಿ), queries regarding alcohol/drugs/smoking MUST receive an authoritative 'ಇಲ್ಲ!' verdict. If verified High Fidelity Vrata or standard Marital Fidelity without multiple relationship risks, queries regarding infidelity MUST receive an authoritative 'ಇಲ್ಲ!' verdict. If prone to smoking/tobacco (Dhumapana), do NOT falsely accuse them of being an alcoholic (Madyapana). If verified Clean from crime/theft/violence, queries regarding criminality, theft, murder, violence, rape, or jail MUST receive an authoritative 'ಇಲ್ಲ!' verdict celebrating their moral purity. DO NOT contradict yourself in subsequent bullets!
- DO NOT invent tragedies, crimes, or fake scandals.
- Respect gender: For female natives, use '${isFemaleQ ? "ಪತಿ" : "ಪತ್ನಿ"}' for spouse.
- DO NOT use markdown bold asterisks (no ** or *). Use clean, natural text.
- ALL numbers must be in ENGLISH DIGITS (1, 2, 3, 4, 5, etc.).
`;

          const aiAns = await askGemini(
            q,
            contextData,
            geminiApiKey,
            isKn ? "kn" : "en",
            { temperature: 0.2 }
          );
          if (aiAns && aiAns.trim().length > 30) {
            ansText = cleanAstrologyText(aiAns);
          }
        } catch (geminiErr) {
          console.warn("Gemini question call failed, falling back to deterministic Vedic response:", geminiErr);
        }
      }

      if (!ansText) {
        ansText = generateVedicConsultationAnswer(
          session.result,
          synthesisData.currentDiagnosis,
          synthesisData.prescriptions,
          q,
          session.input.name,
          isKn,
          devoteeAge,
          session.input.gender,
          synthesisData.panchanga.sunset
        );
      }

      setQaHistory((prev) => [{ question: q, answer: ansText }, ...prev]);
      setQuestionInput("");
    } catch (err: any) {
      console.error("Consultation answer fallback:", err);
      const fallbackAns = generateVedicConsultationAnswer(
        session.result,
        synthesisData.currentDiagnosis,
        synthesisData.prescriptions,
        q,
        session.input.name,
        isKn,
        devoteeAge,
        session.input.gender,
        synthesisData.panchanga.sunset
      );
      setQaHistory((prev) => [{ question: q, answer: fallbackAns }, ...prev]);
      setQuestionInput("");
    } finally {
      setAnswering(false);
    }
  };

  if (!session || !session.result || (!loading && !synthesisData)) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center space-y-4">
        <Card className="p-8">
          <p className="text-lg font-bold text-indigo-950">
            {isKn ? "ಕುಂಡಲಿ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ" : "No Birth Chart Data Found"}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            {isKn ? "ದಯವಿಟ್ಟು ಮೊದಲು ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ." : "Please generate a birth chart first to view the instant reading."}
          </p>
          <button
            onClick={() => setPage("kundli")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-sm shadow-md hover:bg-indigo-800 transition-all"
          >
            {isKn ? "ಕುಂಡಲಿಗೆ ಹೋಗಿ" : "Go to Birth Chart"}
          </button>
        </Card>
      </div>
    );
  }

  const { prescriptions, currentDiagnosis, destinyCatalysts, instantQAList, yajnaHawanaPlan } = synthesisData || {};
  const filteredQA = instantQAList?.filter((item) => activeCategory === "all" || item.category === activeCategory) || [];

  const deterministicStructured = synthesisData
    ? buildDeterministicFirstSixPoints(synthesisData, session, isKn)
    : null;

  const activeStructuredPoints: FirstSixTalkingPointsStructured | null =
    structuredTalkingPoints || deterministicStructured;

  const activeTalkingPoints = dynamicTalkingPoints || (currentDiagnosis ? {
    openingIceBreakerKn: isKn ? currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn : (currentDiagnosis.astrologerTalkingPoints.openingIceBreakerEn || currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn),
    hiddenSubconsciousWorryKn: isKn ? currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn : (currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryEn || currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn),
    maandiKarmicImpactKn: isKn ? currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn : (currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactEn || currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn),
    bodyMarkAndTemperamentKn: isKn ? currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentKn : (currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentEn || currentDiagnosis.astrologerTalkingPoints.bodyMarkAndTemperamentKn),
    karmaFinancialRealityKn: isKn ? currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn : (currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityEn || currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn),
    immediateTurningPointKn: isKn ? currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn : (currentDiagnosis.astrologerTalkingPoints.immediateTurningPointEn || currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn),
    siddhaPariharaRemedyKn: isKn ? currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn : (currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyEn || currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn),
    ageGroupBadge: isKn ? currentDiagnosis.astrologerTalkingPoints.ageGroupBadgeKn : (currentDiagnosis.astrologerTalkingPoints.ageGroupBadgeEn || currentDiagnosis.astrologerTalkingPoints.ageGroupBadgeKn),
    technicalAspectsCueKn: currentDiagnosis.astrologerTalkingPoints.technicalAspectsCueKn
  } : null);

  const renderPointList = (points: AstrologerPointItem[] | undefined, fallbackText?: string) => {
    if (!points || points.length === 0) {
      if (fallbackText) {
        return (
          <p className="text-xs md:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
            {fallbackText}
          </p>
        );
      }
      return null;
    }
    return (
      <div className="space-y-2 pt-1">
        {points.map((p) => {
          let badgeClass = "bg-stone-100 text-stone-700 border-stone-300";
          let cardClass = "bg-white border-stone-200 text-stone-800 hover:border-stone-400";
          let indicator = "⚪";
          let toneBadge = isKn ? "ವಿವರಣೆ" : "Detail";

          if (p.tone === "good") {
            badgeClass = "bg-emerald-100 text-emerald-950 border-emerald-300 font-black";
            cardClass = "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs hover:bg-emerald-100/90 ring-1 ring-emerald-200/60";
            indicator = "🟢";
            toneBadge = isKn ? "ಶುಭ" : "Good";
          } else if (p.tone === "bad") {
            badgeClass = "bg-rose-100 text-rose-950 border-rose-300 font-black";
            cardClass = "bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs hover:bg-rose-100/90 ring-1 ring-rose-200/60";
            indicator = "🔴";
            toneBadge = isKn ? "ಸವಾಲು" : "Challenge";
          } else if (p.tone === "notice") {
            badgeClass = "bg-amber-100 text-amber-950 border-yellow-400 font-black";
            cardClass = "bg-amber-50/90 border-yellow-400 text-amber-950 shadow-xs hover:bg-amber-100/90 ring-1 ring-yellow-300/60";
            indicator = "🟡";
            toneBadge = isKn ? "ಗಮನಿಸಿ" : "Notice";
          }

          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-2.5 ${cardClass}`}
            >
              {/* Number bullet badge */}
              <span
                className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-lg text-xs font-black shadow-xs ${
                  p.tone === "good"
                    ? "bg-emerald-600 text-white"
                    : p.tone === "bad"
                    ? "bg-rose-600 text-white"
                    : p.tone === "notice"
                    ? "bg-amber-500 text-neutral-950 font-black"
                    : "bg-amber-200 text-amber-950"
                }`}
              >
                {p.id}
              </span>

              {/* Content & Tag */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold">
                    <span>{indicator}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] ${badgeClass}`}>
                      {toneBadge}
                    </span>
                    {p.tagKn && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        • {isKn ? p.tagKn : p.tagEn}
                      </span>
                    )}
                  </span>
                </div>
                <p className="leading-relaxed font-medium">
                  {p.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDownloadPdf = async (chosenLang: SupportedPdfLang) => {
    if (!synthesisData || isGeneratingPdf) return;
    setIsPdfLangModalOpen(false);
    setIsGeneratingPdf(true);
    setPdfLanguage(chosenLang);
    setPdfStatusMessage(
      isKn
        ? "ದೈವಜ್ಞ ಮುಖ್ಯಾಂಶಗಳು ಹಾಗೂ ಶಾಸ್ತ್ರೋಕ್ತ ಫಲಿತಾಂಶಗಳ A4 PDF ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ..."
        : "Rendering Baggona Panchanga A4 Executive Astrological PDF..."
    );

    try {
      // Allow React to re-render DOM with the updated language in the hidden container
      await new Promise((resolve) => setTimeout(resolve, 450));

      const cleanName = (session?.input?.name || "Devotee").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
      const fileName = `Baggona_Instant_Reading_${cleanName}_${chosenLang.toUpperCase()}.pdf`;

      await generatePDFFromElement("instant-reading-pdf-container", fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(
        isKn
          ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ."
          : "Failed to generate PDF. Please try again."
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6 animate-fade-in pb-16">
      {/* TOP NAVIGATION & MODE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setPage("kundli")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-yellow-500/10 border-2 border-amber-400 text-amber-950 font-black text-xs md:text-sm hover:scale-105 hover:bg-amber-400 hover:text-neutral-950 shadow-md transition-all cursor-pointer"
        >
          <span>←</span>
          <span>{isKn ? "ಕುಂಡಲಿಗೆ ಹಿಂತಿರುಗಿ (Back to Kundali)" : "Back to Kundali"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* A4 PDF Download Button */}
          <button
            onClick={() => setIsPdfLangModalOpen(true)}
            disabled={!synthesisData || isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 font-black text-xs md:text-sm hover:scale-105 hover:shadow-lg shadow-md transition-all border-2 border-amber-500 cursor-pointer disabled:opacity-50"
            title="Download A4 Executive Astrological PDF"
          >
            <span className="text-base">📜</span>
            <span>{isKn ? "A4 PDF ಡೌನ್‌ಲೋಡ್" : "Download A4 PDF"}</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950/10 text-[10px] font-black uppercase tracking-wider">
              {pdfLanguage}
            </span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold">
            <span>🔮</span>
            <span>{isKn ? "ದೈವಜ್ಞ ನೇರ ಸಮಾಲೋಚನೆ & ತ್ವರಿತ ದರ್ಶನ" : "Live Astrologer Consultation Desk"}</span>
          </div>
        </div>
      </div>

      {/* DEVOTEE PROFILE BANNER - 100% WHITE & GOLD THEME */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 p-6 text-stone-950 shadow-xl">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-950 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-amber-400/60">
              ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ ಮಂಡಲ ॥
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-amber-950 font-serif">
              {session.input.name || "Devotee"} {isKn ? "ಅವರ ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಫಲಿತ ದರ್ಶನ" : "- Live Life Situation Reading"}
            </h1>
            <p className="text-xs text-stone-700 mt-1">
              ಲಗ್ನ: <b className="text-amber-900">{toKannadaRashi(session.result.lagnaRashi.english)}</b> • ರಾಶಿ: <b className="text-amber-900">{toKannadaRashi(session.result.moonSign.english)}</b> • ನಕ್ಷತ್ರ: <b className="text-amber-900">{toKannadaNakshatra(session.result.planets.find(p => p.name === "Moon")?.nakshatra.english)} (ಪಾದ {session.result.moonPada})</b> • ಪ್ರಸ್ತುತ ದಶಾ: <b className="text-amber-800">{cleanAstrologyText(currentDiagnosis?.prasthuthaSthiti.runningDashaSummary.split("|")[0] || "")}</b>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-amber-300/40">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                <span>ವಿವಾಹ ಸ್ಥಿತಿ:</span>
              </span>
              <button
                type="button"
                onClick={() => setMaritalStatusOverride(undefined)}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
                  maritalStatusOverride === undefined && !session.input?.maritalStatus
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-white/80 text-stone-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                ❓ ತಿಳಿಸಿಲ್ಲ (Not Specified)
              </button>
              <button
                type="button"
                onClick={() => setMaritalStatusOverride("married")}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
                  (maritalStatusOverride ?? session.input?.maritalStatus) === "married"
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-white/80 text-stone-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                💍 ವಿವಾಹಿತರು (Married)
              </button>
              <button
                type="button"
                onClick={() => setMaritalStatusOverride("unmarried")}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
                  (maritalStatusOverride ?? session.input?.maritalStatus) === "unmarried"
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-white/80 text-stone-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                🌸 ಅವಿವಾಹಿತರು (Unmarried)
              </button>
              <button
                type="button"
                onClick={() => setMaritalStatusOverride("separated")}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
                  (maritalStatusOverride ?? session.input?.maritalStatus) === "separated"
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-white/80 text-stone-700 border-amber-300 hover:bg-amber-100"
                }`}
              >
                ⚡ ಪ್ರತ್ಯೇಕಿತರು (Separated)
              </button>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-200/70 border border-amber-400 text-right">
            <span className="text-[10px] text-amber-900 uppercase font-black block">ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆ</span>
            <span className="text-sm font-black text-stone-950">100% ಶಾಸ್ತ್ರೋಕ್ತ ಫಲಿತ</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-semibold text-amber-950 animate-pulse">
            {isKn ? "ಪಂಚಾಂಗದ ಪಂಚ ಅಂಗಗಳು ಹಾಗೂ ದಶಾ-ಗೋಚರ ಸ್ಥಿತಿಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Computing 5-Angas, Dasha, and Gochara transits..."}
          </p>
        </Card>
      ) : (
        <>
          {/* 🔮 ದೈವಜ್ಞ ಗೋಪ್ಯ ಮುಖಾಮುಖಿ ರಹಸ್ಯ ದರ್ಶನ (Face-to-Face Astrologer's Mind-Reading Dossier) 🔮 */}
          {activeTalkingPoints && (
            <div className="rounded-3xl border-2 border-amber-500/70 bg-gradient-to-br from-amber-50/95 via-yellow-50/60 to-amber-100/50 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden ring-2 ring-amber-400/40">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-300 pb-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 border border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider shadow-sm">
                    <span>🔮</span>
                    <span>{isKn ? "ದೈವಜ್ಞ ಗೋಪ್ಯ ಮುಖಾಮುಖಿ ರಹಸ್ಯ ದರ್ಶನ" : "Face-to-Face Astrologer's Mind-Reading Dossier"}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
                    <span>{isKn ? "ಜಾತಕರನ್ನು ಬೆರಗುಗೊಳಿಸುವ 100% ನಿಖರ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಖ್ಯಾಂಶಗಳು" : "100% Authentic Face-to-Face Astrological Consultation Points"}</span>
                  </h2>
                  <p className="text-xs md:text-sm text-stone-700 font-medium">
                    {isKn
                      ? "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ & ಬೃಹತ್ ಜಾತಕದ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ಗೋಪ್ಯ ಪಂಚಾಂಗ ದರ್ಶನ. ಜ್ಯೋತಿಷಿಗಳು ಮುಖತಃ ಓದಿ ಹೇಳಬಹುದು."
                      : "Classical Parashari & Brihat Jataka principles structured for direct face-to-face recitation by the astrologer."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeTalkingPoints.ageGroupBadge && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-200/90 border border-amber-400 text-amber-950 text-xs font-black shadow-sm">
                      {activeTalkingPoints.ageGroupBadge}
                    </span>
                  )}
                  {activeTalkingPoints.technicalAspectsCueKn && (
                    <span className="hidden lg:inline-block px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300 text-stone-700 text-xs font-semibold">
                      {isKn ? activeTalkingPoints.technicalAspectsCueKn : "4th/10th House, Maandi & Vimshottari Dasha Analysis"}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Highlight Legend Bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs shadow-sm">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>🎨</span>
                  <span>{isKn ? "ಮುಖ್ಯಾಂಶಗಳ ಬಣ್ಣ ವಿನ್ಯಾಸ:" : "Point Color Legend:"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{isKn ? "ಹಸಿರು (ಶುಭ ಫಲಗಳು / Good)" : "Green (Auspicious / Good)"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-950 font-bold border border-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>{isKn ? "ಕೆಂಪು (ದೋಷ / ಸವಾಲು / Bad)" : "Red (Challenge / Bad)"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 font-bold border border-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{isKn ? "ಹಳದಿ (ಗಮನಿಸಬೇಕಾದ ಅಂಶ / Notice)" : "Yellow (Notice / Turning Point)"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-stone-800 font-medium border border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                  <span>{isKn ? "ಬಿಳಿ (ಸಾಮಾನ್ಯ ವಿವರಣೆ / Normal)" : "White (General / Normal)"}</span>
                </span>
              </div>

              {/* 6 Reading Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Ice-Breaker & Temperament */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>🗣️</span>
                        <span>{isKn ? "1. ಆರಂಭ & ಮೂಲ ಪ್ರಕೃತಿ" : "1. Ice-Breaker & Core Temperament"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.openingIceBreaker?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("icebreaker", activeStructuredPoints?.openingIceBreaker || activeTalkingPoints.openingIceBreakerKn)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "icebreaker"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "icebreaker" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    {renderPointList(activeStructuredPoints?.openingIceBreaker, activeTalkingPoints.openingIceBreakerKn)}
                  </div>
                </div>

                {/* 2. Hidden Subconscious Worry / Agony */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>🧠</span>
                        <span>{isKn ? "2. ಅಂತರಂಗದ ಗುಪ್ತ ಆತಂಕ & ಚಿಂತೆ" : "2. Hidden Subconscious Worry / Agony"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.hiddenSubconsciousWorry?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("worry", activeStructuredPoints?.hiddenSubconsciousWorry || activeTalkingPoints.hiddenSubconsciousWorryKn)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "worry"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "worry" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    {renderPointList(activeStructuredPoints?.hiddenSubconsciousWorry, activeTalkingPoints.hiddenSubconsciousWorryKn)}
                  </div>
                </div>

                {/* 3. The 99% Last-Mile Knot & Maandi Karma */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>🌀</span>
                        <span>{isKn ? "3. 99% ಆದ ಕೆಲಸ ನಿಲ್ಲಿಸುವ 'ಮಾಂದಿ ಕರ್ಮ ಗಂಟು'" : "3. The 99% Last-Mile Knot & Maandi Karma"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.maandiKarmicImpact?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("maandi", activeStructuredPoints?.maandiKarmicImpact || activeTalkingPoints.maandiKarmicImpactKn)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "maandi"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "maandi" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    {renderPointList(activeStructuredPoints?.maandiKarmicImpact, activeTalkingPoints.maandiKarmicImpactKn)}
                  </div>
                </div>

                {/* 4. Classical Anga Lakshana & Tridosha Constitution */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>🩺</span>
                        <span>{isKn ? "4. ಶಾರೀರಿಕ ಮಚ್ಚೆ ಗುರುತು & ತ್ರಿದೋಷ ಪ್ರಕೃತಿ" : "4. Physical Sign (Anga Lakshana) & Tridosha"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.bodyMarkAndTemperament?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("bodymark", activeStructuredPoints?.bodyMarkAndTemperament || activeTalkingPoints.bodyMarkAndTemperamentKn || "")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "bodymark"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "bodymark" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    {renderPointList(activeStructuredPoints?.bodyMarkAndTemperament, activeTalkingPoints.bodyMarkAndTemperamentKn || (isKn ? "ಲಗ್ನಾಧಿಪತಿಯ ಗ್ರಹಬಲದಂತೆ ದೇಹ ಪ್ರಕೃತಿ ಸಮತೋಲನದಲ್ಲಿದೆ." : "Ayurvedic constitution and physical markers are balanced."))}
                  </div>
                </div>

                {/* 5. Karma & Financial Reality */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>💼</span>
                        <span>{isKn ? "5. ಕರ್ಮ ಸ್ಥಾನ & ವಾಸ್ತವಿಕ ಆರ್ಥಿಕ ಸ್ಥಿತಿ" : "5. Karma & Financial Reality"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.karmaFinancialReality?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("finance", activeStructuredPoints?.karmaFinancialReality || activeTalkingPoints.karmaFinancialRealityKn)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "finance"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "finance" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    {renderPointList(activeStructuredPoints?.karmaFinancialReality, activeTalkingPoints.karmaFinancialRealityKn)}
                  </div>
                </div>

                {/* 6. Turning Point Countdown & Sacred Remedy */}
                <div className="rounded-2xl border border-amber-300 bg-white/90 p-5 shadow-md flex flex-col justify-between space-y-3 hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                        <span>⏳</span>
                        <span>{isKn ? "6. ದಶಾ ತಿರುವು & ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ" : "6. Turning Point & Sacred Gokarna Remedy"}</span>
                        <span className="text-[11px] font-normal text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          ({activeStructuredPoints?.immediateTurningPoint?.length || 10}+ {isKn ? "ಅಂಶಗಳು" : "Points"})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlayTalkingPoint("turningpoint", activeStructuredPoints?.immediateTurningPoint || `${activeTalkingPoints.immediateTurningPointKn}\n\n${activeTalkingPoints.siddhaPariharaRemedyKn}`)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          playingPointKey === "turningpoint"
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                        }`}
                      >
                        <span>{playingPointKey === "turningpoint" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {renderPointList(activeStructuredPoints?.immediateTurningPoint, activeTalkingPoints.immediateTurningPointKn)}
                      <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 leading-relaxed font-semibold shadow-sm">
                        <span className="text-[11px] text-amber-900 uppercase font-black block mb-1.5 flex items-center gap-1.5">
                          <span>🔱</span>
                          <span>{isKn ? "✦ ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ ನಿರ್ದೇಶನ (ಪೂಜ್ಯ ಪ್ರಧಾನ ಪರಿಹಾರ):" : "✦ Sacred Gokarna Siddha Remedy Direction (Primary Shastric Solution):"}</span>
                        </span>
                        <p className="whitespace-pre-line text-stone-800 font-medium">
                          {activeTalkingPoints.siddhaPariharaRemedyKn}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🚨 0. PRIMARY LIFE FOCUS, CRISIS RESOLUTION OR LIFE PHASE STRATEGY 🚨 */}
          {currentDiagnosis?.primaryLifeChallenge && (() => {
            const cls = dynamicCurrentLifeSituation || currentDiagnosis.currentLifeSituation;
            const isAcuteCrisis = cls
              ? (cls.severity === "critical" || cls.severity === "high")
              : [
                  "Personal / Marriage",
                  "Financial / Debts",
                  "Career / Workplace",
                  "Health / Vitality",
                  "Health / Physical"
                ].includes(currentDiagnosis.primaryLifeChallenge.area);

            return (
              <div
                className={`rounded-3xl border-2 p-6 md:p-8 text-stone-950 shadow-xl space-y-5 transition-all ${
                  isAcuteCrisis
                    ? "border-rose-400 bg-gradient-to-br from-rose-50/95 via-amber-50/70 to-white ring-1 ring-rose-300"
                    : "border-amber-400 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 ring-1 ring-amber-300"
                }`}
              >
                <div
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 ${
                    isAcuteCrisis ? "border-rose-200" : "border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-md border ${
                        isAcuteCrisis
                          ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white border-rose-300"
                          : "bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 border-amber-300"
                      }`}
                    >
                      {currentDiagnosis.primaryLifeChallenge.area === "Personal / Marriage"
                        ? "💍"
                        : currentDiagnosis.primaryLifeChallenge.area === "Financial / Debts"
                        ? "💰"
                        : currentDiagnosis.primaryLifeChallenge.area === "Career / Workplace"
                        ? "💼"
                        : currentDiagnosis.primaryLifeChallenge.area === "Health / Vitality" || currentDiagnosis.primaryLifeChallenge.area === "Health / Physical"
                        ? "🩺"
                        : currentDiagnosis.primaryLifeChallenge.area === "Sports & Competition"
                        ? "🏆"
                        : currentDiagnosis.primaryLifeChallenge.area === "Creative & Media Arts"
                        ? "🎭"
                        : currentDiagnosis.primaryLifeChallenge.area === "Leadership & Scaling"
                        ? "👑"
                        : currentDiagnosis.primaryLifeChallenge.area === "Legal / Confinement"
                        ? "⚖️"
                        : currentDiagnosis.primaryLifeChallenge.area === "Health / Convalescence"
                        ? "🌿"
                        : currentDiagnosis.primaryLifeChallenge.area === "Personal / Divorce Rebuilding"
                        ? "🕊️"
                        : "🧭"}
                    </span>
                    <div>
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider block ${
                          isAcuteCrisis ? "text-rose-900" : "text-amber-900"
                        }`}
                      >
                        {isKn
                          ? "॥ ಪ್ರಸ್ತುತ ಮನಸ್ಥಿತಿ ಮತ್ತು ಜೀವನ (Current Mindset & Real-Life Reality) ॥"
                          : "॥ Current Mindset & Real-Life Reality (ಪ್ರಸ್ತುತ ಮನಸ್ಥಿತಿ ಮತ್ತು ಜೀವನ) ॥"}
                      </span>
                      <h3
                        className={`text-base md:text-xl font-black font-serif ${
                          isAcuteCrisis ? "text-rose-950" : "text-amber-950"
                        }`}
                      >
                        {isKn
                          ? (cls?.headlineKn || `${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ • ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.areaKn || currentDiagnosis.primaryLifeChallenge.area)}`)
                          : (cls?.headlineEn || `${session.result.lagnaRashi.english} Ascendant • ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.area)}`)}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black border shadow-sm flex items-center gap-1.5 ${
                      isAcuteCrisis
                        ? "bg-rose-100 text-rose-950 border-rose-300"
                        : "bg-amber-100 text-amber-950 border-amber-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        isAcuteCrisis ? "bg-rose-600 animate-ping" : "bg-emerald-600 animate-pulse"
                      }`}
                    />
                    <span>
                      {isKn
                        ? isAcuteCrisis
                          ? "ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ (Top Priority)"
                          : "ಪ್ರಸ್ತುತ ಜೀವಿತ ಘಟ್ಟ (Current Life Phase)"
                        : isAcuteCrisis
                        ? "Top Priority Life Focus"
                        : "Current Life Phase"}
                    </span>
                  </span>
                </div>

                {/* Pandit Direct Empathetic Spoken Voice */}
                <div
                  className={`p-4 rounded-2xl border text-stone-900 space-y-2 ${
                    isAcuteCrisis ? "bg-rose-100/70 border-rose-200/90" : "bg-amber-100/70 border-amber-300/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🗣️</span>
                    <b
                      className={`text-xs uppercase tracking-wider ${
                        isAcuteCrisis ? "text-rose-950" : "text-amber-950"
                      }`}
                    >
                      {isKn
                        ? isAcuteCrisis
                          ? "ದೈವಜ್ಞರ ಮೊದಲ ನೇರ ಮಾತು (Astrologer's Immediate Spoken Counsel):"
                          : "ದೈವಜ್ಞರ ನೇರ ಮಾರ್ಗದರ್ಶನ (Astrologer's Direct Guidance):"
                        : isAcuteCrisis
                        ? "Astrologer's Primary Spoken Counsel:"
                        : "Astrologer's Direct Life Guidance:"}
                    </b>
                  </div>
                  <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                    {isKn
                      ? cls
                        ? `ನಮಸ್ಕಾರ ${session.input.name || (isChild ? "ಮಗುವಿನ ಪೋಷಕರೇ" : "ಭಕ್ತರೇ")}, ನಿಮ್ಮ ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ ಮತ್ತು ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿಯ ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿ ಗೋಚರಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಪರಿಸ್ಥಿತಿ: ${cleanAstrologyText(cls.headlineKn)}. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary} ಅವಧಿಯಲ್ಲಿ, ${cleanAstrologyText(cls.detailedRealityKn)}. ಈ ಸಂಕಷ್ಟದಿಂದ ಶೀಘ್ರವಾಗಿ ಹೊರಬರಲು ಗ್ರಹಗಳ ನೈಜ ಸ್ಥಿತಿ, ಬಿಕ್ಕಟ್ಟು ಮುಕ್ತವಾಗುವ ನಿಖರ ಕಾಲಾವಧಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`
                        : (isAcuteCrisis
                          ? `ನಮಸ್ಕಾರ ${session.input.name || (isChild ? "ಮಗುವಿನ ಪೋಷಕರೇ" : "ಭಕ್ತರೇ")}, ನಿಮ್ಮ ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ ಮತ್ತು ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿಯ ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಉಳಿದೆಲ್ಲ ವಿಷಯಗಳಿಗಿಂತ ಮೊದಲು ನಿಮ್ಮನ್ನು ಪ್ರಸ್ತುತ ಕಾಡುತ್ತಿರುವ ಈ ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.areaKn || toKannadaChallengeArea(currentDiagnosis.primaryLifeChallenge.area))} ವಿಷಯದ ಬಗ್ಗೆ ನಾವು ಮಾತನಾಡಲೇಬೇಕು. ಈ ಕಷ್ಟದಿಂದ ಶೀಘ್ರವಾಗಿ ಹೊರಬರಲು ಗ್ರಹಗಳ ನೈಜ ಸ್ಥಿತಿ, ಬಿಕ್ಕಟ್ಟು ಮುಕ್ತವಾಗುವ ನಿಖರ ಕಾಲಾವಧಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`
                          : `ನಮಸ್ಕಾರ ${session.input.name || (isChild ? "ಮಗುವಿನ ಪೋಷಕರೇ" : "ಭಕ್ತರೇ")}, ನಿಮ್ಮ ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ ಮತ್ತು ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿಯ (${toKannadaNakshatra(session.result.planets.find(p => p.name === "Moon")?.nakshatra.english) || ""} ನಕ್ಷತ್ರ) ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಜೀವಿತ ಘಟ್ಟದಲ್ಲಿ ನಿಮ್ಮ ದಶಾ-ಗೋಚಾರ ಸ್ಥಿತಿ ಹಾಗೂ ಮುನ್ನಡೆಯ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`)
                      : cls
                      ? `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, your paramount real-life situation is: ${cleanAstrologyText(cls.headlineEn)}. Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, ${cleanAstrologyText(cls.detailedRealityEn)}. Here is the astrological root cause, relief timeline, and sacred exit strategy:`
                      : (isAcuteCrisis
                        ? `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, before discussing other life areas, here is the astrological root cause, relief timeline, and sacred exit strategy for your current ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.area)} challenge:`
                        : `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, here is your planetary guidance, upcoming turning points, and strategic path forward for your current life phase:`)}
                  </p>
                </div>

                {/* TWO DISTINCT RICH BLOCKS: REAL-LIFE HAPPENINGS & INTERNAL MINDSET */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  {/* Block 1: Real-Life Reality & Happenings */}
                  <div
                    className={`p-4 rounded-2xl border-2 bg-gradient-to-br from-amber-50/80 to-white space-y-2 shadow-sm ${
                      isAcuteCrisis ? "border-rose-300" : "border-amber-300"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-bold border-b pb-1.5 text-xs ${
                        isAcuteCrisis ? "text-rose-950 border-rose-200" : "text-amber-950 border-amber-200"
                      }`}
                    >
                      <span className="text-base">🌍</span>
                      <span className="font-extrabold tracking-wide">
                        {isKn
                          ? "ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ನೈಜ ಸಂಗತಿಗಳು (Current Life Reality & Happenings)"
                          : "Current Life Reality & Happenings (ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ನೈಜ ಸಂಗತಿಗಳು)"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs whitespace-pre-line font-medium">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.externalLifeRealityKn || cls?.detailedRealityKn || currentDiagnosis.primaryLifeChallenge.description
                          : cls?.externalLifeRealityEn || cls?.detailedRealityEn || currentDiagnosis.primaryLifeChallenge.descriptionEn || currentDiagnosis.primaryLifeChallenge.description
                      )}
                    </p>
                  </div>

                  {/* Block 2: Current Mindset & Psychological Weather */}
                  <div
                    className={`p-4 rounded-2xl border-2 bg-gradient-to-br from-indigo-50/80 to-white space-y-2 shadow-sm ${
                      isAcuteCrisis ? "border-indigo-300" : "border-amber-300"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 font-bold border-b pb-1.5 text-xs text-indigo-950 border-indigo-200"
                    >
                      <span className="text-base">🧠</span>
                      <span className="font-extrabold tracking-wide">
                        {isKn
                          ? "ಪ್ರಸ್ತುತ ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಯೋಚನಾ ಲಹರಿ (Current Mindset & Psychological Weather)"
                          : "Current Mindset & Psychological Weather (ಪ್ರಸ್ತುತ ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಯೋಚನಾ ಲಹರಿ)"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs whitespace-pre-line font-medium">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.internalMindsetKn || "ಮನಸ್ಸಿನಲ್ಲಿ ಭವಿಷ್ಯದ ಯೋಜನೆಗಳು, ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆಂತರಿಕ ಶಾಂತಿಯ ಹಂಬಲದ ಯೋಚನಾ ಲಹರಿ ಮುಂದುವರಿದಿದೆ."
                          : cls?.internalMindsetEn || "Internal thoughts balance pragmatic duties, long-term aspirations, and emotional stability."
                      )}
                    </p>
                  </div>
                </div>

                {/* 3 Astrological Root Cause, Timeline & Remedy Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
                  {/* Card 1: Astrological Alignment / Root Cause */}
                  <div
                    className={`p-4 rounded-2xl border-2 bg-white space-y-2 shadow-sm ${
                      isAcuteCrisis ? "border-amber-200" : "border-indigo-200"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-bold border-b pb-1.5 text-xs ${
                        isAcuteCrisis ? "text-amber-900 border-amber-100" : "text-indigo-900 border-indigo-100"
                      }`}
                    >
                      <span>🪐</span>
                      <span>
                        {isKn
                          ? isAcuteCrisis
                            ? "ಗ್ರಹಗಳ ಶಾಸ್ತ್ರೀಯ ಮೂಲ ಕಾರಣ"
                            : "ದಶಾ-ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ"
                          : isAcuteCrisis
                          ? "Astrological Root Cause"
                          : "Dasha & Gochara Planetary Alignment"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.planetaryCulpritKn || currentDiagnosis.primaryLifeChallenge.planetaryRootCause
                          : cls?.planetaryCulpritEn || currentDiagnosis.primaryLifeChallenge.planetaryRootCauseEn || currentDiagnosis.primaryLifeChallenge.planetaryRootCause
                      )}
                    </p>
                  </div>

                  {/* Card 2: Timeline of Relief / Turning Point */}
                  <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-100 pb-1.5 text-xs">
                      <span>⏳</span>
                      <span>
                        {isKn
                          ? isAcuteCrisis
                            ? "ಬಿಕ್ಕಟ್ಟು ಕರಗುವ ನಿಖರ ಕಾಲಾವಧಿ"
                            : "ಮುಂದಿನ ಪ್ರಮುಖ ಸಕಾರಾತ್ಮಕ ತಿರುವು"
                          : isAcuteCrisis
                          ? "Turning Point & Relief Timeline"
                          : "Upcoming Positive Turning Point"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.reliefTimelineKn || currentDiagnosis.dashaTiming?.timelineKn || "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿಯ ಕಾಲಾವಧಿಯಲ್ಲಿ ಪ್ರಮುಖ ಸಕಾರಾತ್ಮಕ ತಿರುವು ಮೂಡಿಬರಲಿದೆ."
                          : cls?.reliefTimelineEn || currentDiagnosis.dashaTiming?.timelineEn || "Progress unfolds as the ongoing Dasha-Bhukti completes."
                      )}
                    </p>
                  </div>

                  {/* Card 3: Astrological Remedy & Gokarna Seva */}
                  <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-white space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold border-b border-emerald-100 pb-1.5 text-xs">
                      <span>🪔</span>
                      <span>
                        {isKn
                          ? isAcuteCrisis
                            ? "ಈ ಬಿಕ್ಕಟ್ಟಿನಿಂದ ಹೊರಬರಲು ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ"
                            : "ಸಿದ್ಧ ಮಾರ್ಗದರ್ಶನ & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆ"
                          : isAcuteCrisis
                          ? "Exit Strategy & Gokarna Remedy"
                          : "Astrological Guidance & Gokarna Remedy"}
                      </span>
                    </div>
                    <p className="text-emerald-950 font-medium leading-relaxed text-xs">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.gokarnaRemedyKn || currentDiagnosis.primaryLifeChallenge.solutionKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ."
                          : cls?.gokarnaRemedyEn || currentDiagnosis.primaryLifeChallenge.solutionEn || "Perform Sankalpa Pooja at Sri Kshetra Gokarna."
                      )}
                    </p>
                  </div>
                </div>

                {/* 📋 Real-Life Symptoms Native is Currently Experiencing */}
                {cls?.symptomsChecklistKn && cls.symptomsChecklistKn.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/70 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                      <span className="text-xs font-black text-amber-950 flex items-center gap-2">
                        <span>📋</span>
                        <span>{isKn ? "ಪ್ರಸ್ತುತ ನೀವು ದಿನನಿತ್ಯ ಅನುಭವಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಲಕ್ಷಣಗಳು (Symptoms Checklist):" : "Daily Life Symptoms Native is Currently Experiencing:"}</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300">
                        {isKn ? "100% ವಾಸ್ತವ ಅನುಭವ" : "100% Real-World Reality"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                      {(isKn ? cls.symptomsChecklistKn : cls.symptomsChecklistEn).map((sym, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-amber-200 text-stone-800 font-medium shadow-xs">
                          <span className="text-amber-600 font-bold text-sm">✓</span>
                          <span>{cleanAstrologyText(sym)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ⚡ 2. DEDICATED SECTION: DASHA-BHUKTI SANDHI ALERT & NEXT 2 BHUKTIS ROADMAP (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಎಚ್ಚರಿಕೆ & ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳ ಫಲಿತ ದರ್ಶನ) ⚡ */}
          {currentDiagnosis?.dashaSandhiAndRoadmap && (() => {
            const dsr = currentDiagnosis.dashaSandhiAndRoadmap;
            const sandhi = dsr.primarySandhiDisplay;
            const activeBhukti = dsr.roadmapList[selectedBhuktiTab] || dsr.currentBhukti;
            const isFemale = session.input.gender === "Female";

            return (
              <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white text-2xl shadow-md border border-amber-300">
                      ⚡
                    </span>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                        {isKn ? "॥ ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಎಚ್ಚರಿಕೆ & ಮುಂದಿನ 2 ವರ್ಷಗಳ ಫಲಿತ ದರ್ಶನ ॥" : "॥ Dasha-Bhukti Sandhi Alert & Next 2 Years Roadmap ॥"}
                      </span>
                      <h3 className="text-base md:text-xl font-black text-amber-950 font-serif">
                        {isKn
                          ? `${session.input.name || "ಜಾತಕರ"} ದಶಾ ಸಂಧಿ ಎಚ್ಚರಿಕೆ & ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳ ನಿಖರ ಮುನ್ನೋಟ`
                          : `${session.input.name || "Devotee"}'s Dasha Sandhi Alert & Next 2 Bhuktis Forecast`}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black border border-amber-400 shadow-sm flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                      <span>{isKn ? "100% ಪರಾಶರ ನಿಖರತೆ" : "100% Parashari Precision"}</span>
                    </span>
                  </div>
                </div>

                {/* --- A. DASHA SANDHI ALERT CARD --- */}
                {sandhi && (
                  <div
                    className={`rounded-2xl border-2 p-5 shadow-sm space-y-4 ${
                      sandhi.alertLevel === "critical"
                        ? "border-rose-400 bg-rose-50/60"
                        : sandhi.alertLevel === "high"
                        ? "border-orange-400 bg-orange-50/50"
                        : "border-amber-300 bg-amber-50/50"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">
                          {sandhi.sandhiCode === "venus_sun" ? "🌸" : sandhi.sandhiCode === "mars_rahu" ? "🔥" : "🪐"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm md:text-base font-black text-stone-900 font-serif">
                              {isKn ? sandhi.titleKn : sandhi.titleEn}
                            </h4>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                                sandhi.status === "active"
                                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                  : "bg-amber-500 text-white border-amber-600"
                              }`}
                            >
                              {sandhi.status === "active"
                                ? (isKn ? "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active Sandhi)" : "Active Sandhi Phase")
                                : (isKn ? "ಶೀಘ್ರದಲ್ಲೇ ಆರಂಭ (Upcoming Sandhi)" : "Upcoming Sandhi Phase")}
                            </span>
                            {sandhi.isSpecialForWomen && (
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-700 text-white border border-purple-800 shadow-xs">
                                {isKn ? "ಸ್ತ್ರೀಯರಿಗೆ ವಿಶೇಷ ಎಚ್ಚರಿಕೆ" : "Vital Alert for Women"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            {isKn
                              ? `${sandhi.outgoingPlanetKn} ಮಹಾದಶೆಯಿಂದ ${sandhi.incomingPlanetKn} ಮಹಾದಶೆಗೆ ಪರಿವರ್ತನೆ`
                              : `Transition from ${sandhi.outgoingPlanetEn} to ${sandhi.incomingPlanetEn} Mahadasha`}
                          </p>
                        </div>
                      </div>

                      {/* Countdown & Dates */}
                      <div className="flex items-center gap-2 text-right self-end md:self-auto">
                        <div className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 shadow-xs text-right">
                          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                            {sandhi.status === "active"
                              ? (isKn ? "ಉಳಿದಿರುವ ದಿನಗಳು" : "Days Remaining")
                              : (isKn ? "ಆರಂಭಕ್ಕೆ ದಿನಗಳು" : "Days Until Start")}
                          </div>
                          <div className="text-sm md:text-base font-black text-rose-700 font-mono">
                            {sandhi.daysRemainingOrUntil} {isKn ? "ದಿನಗಳು" : "Days"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Lady Banner if Shukraditya Sandhi */}
                    {sandhi.isSpecialForWomen && (
                      <div className="p-3.5 rounded-xl bg-purple-100/90 border-2 border-purple-300 text-purple-950 text-xs leading-relaxed space-y-1 shadow-xs">
                        <div className="font-black flex items-center gap-1.5 text-purple-900">
                          <span>🌸</span>
                          <span>{isKn ? "ಸ್ತ್ರೀಯರಿಗೆ ಪರಮ ಎಚ್ಚರಿಕೆಯ ಶಾಸ್ತ್ರೋಕ್ತ ರಹಸ್ಯ:" : "Vital Classical Advisory for Women:"}</span>
                        </div>
                        <p>
                          {isKn
                            ? "ಶುಕ್ರನು ಸ್ತ್ರೀ ಶರೀರದ ಸೌಂದರ್ಯ, ಹಾರ್ಮೋನ್, ರಕ್ತಪರಿಚಲನೆ ಮತ್ತು ದಾಂಪತ್ಯ ಸೌಖ್ಯದ ಕಾರಕನಾಗಿದ್ದು, ಸೂರ್ಯನು ತೀಕ್ಷ್ಣ ಉಷ್ಣಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿಕಾಲದಲ್ಲಿ ಹಾರ್ಮೋನ್ ಏರುಪೇರು, ಗರ್ಭಾಶಯ/ಥೈರಾಯ್ಡ್ ಸೂಕ್ಷ್ಮತೆ, ನೇತ್ರದೋಷ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಹಂ ಸಂಘರ್ಷ ಹಾಗೂ ಅತ್ತೆ-ಮಾವಂದಿರೊಂದಿಗಿನ ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತೊಡಕುಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ. ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಧಿ ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯ."
                            : "Venus governs feminine vitality, hormones, and marital harmony, while Sun is intense solar heat. In Shukraditya Sandhi, women face heightened risk of hormonal/thyroid fluctuations, uterine sensitivities, eye fatigue, and marital ego clashes. Prescribed Vedic Shanti is strongly recommended."}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                      {cleanAstrologyText(isKn ? sandhi.descriptionKn : sandhi.descriptionEn)}
                    </p>

                    {/* Dates Summary Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-stone-800 font-medium">
                        <span className="text-stone-500 block text-[10px] font-bold">{isKn ? "ಸಂಧಿ ಆರಂಭ ದಿನಾಂಕ" : "Sandhi Start Date"}</span>
                        <span className="font-bold text-stone-900 font-mono">{sandhi.startDateStr}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-stone-800 font-medium">
                        <span className="text-stone-500 block text-[10px] font-bold">{isKn ? "ಸಂಧಿ ಮುಕ್ತಾಯ ದಿನಾಂಕ" : "Sandhi End Date"}</span>
                        <span className="font-bold text-stone-900 font-mono">{sandhi.endDateStr}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-stone-800 font-medium">
                        <span className="text-stone-500 block text-[10px] font-bold">{isKn ? "ಒಟ್ಟು ಸಂಧಿಕಾಲದ ಅವಧಿ" : "Total Sandhi Span"}</span>
                        <span className="font-bold text-rose-800">{isKn ? sandhi.durationFormattedKn : sandhi.durationFormattedEn}</span>
                      </div>
                    </div>

                    {/* Warning Symptoms Checklist */}
                    {sandhi.warningSymptomsKn && sandhi.warningSymptomsKn.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-black text-stone-900 flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{isKn ? "ಸಂಧಿಕಾಲದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುವ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು (Warning Symptoms):" : "Key Warning Symptoms in this Sandhi:"}</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          {(isKn ? sandhi.warningSymptomsKn : sandhi.warningSymptomsEn).map((sym, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-rose-200 text-stone-800 font-medium shadow-2xs">
                              <span className="text-rose-600 font-black">!</span>
                              <span>{cleanAstrologyText(sym)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remedial Solutions & Gokarna Seva */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 shadow-xs">
                      <div className="font-black text-emerald-900 flex items-center gap-1.5">
                        <span>🪔</span>
                        <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಧಿ ಶಾಂತಿ & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮುಕ್ತಿ ಸೇವೆ:" : "Classical Sandhi Shanti & Sri Kshetra Gokarna Seva:"}</span>
                      </div>
                      <ul className="space-y-1 font-medium pl-1">
                        {(isKn ? sandhi.recommendedShantiRemediesKn : sandhi.recommendedShantiRemediesEn).map((rem, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-700 font-bold">✓</span>
                            <span>{cleanAstrologyText(rem)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 pt-2 border-t border-emerald-200 text-emerald-900 font-bold flex items-center gap-2">
                        <span>🚩</span>
                        <span>{isKn ? sandhi.gokarnaSevaKn : sandhi.gokarnaSevaEn}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- B. NEXT 2 BHUKTIS DEEP ROADMAP (ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳ ಫಲಿತ & ನಿರೀಕ್ಷೆ) --- */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <span>🧭</span>
                        <span>{isKn ? "ಮುಂದಿನ 2 ವರ್ಷಗಳ ದಶಾ-ಭುಕ್ತಿ ಮುನ್ನೋಟ (Roadmap for Next 2+ Years)" : "Next 2+ Years Dasha-Bhukti Roadmap"}</span>
                      </span>
                      <h4 className="text-sm md:text-base font-black text-amber-950 font-serif">
                        {isKn ? "ಪ್ರಸ್ತುತ & ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳಲ್ಲಿ ಏನನ್ನು ನಿರೀಕ್ಷಿಸಬೇಕು?" : "What to Expect in Current & Next 2 Bhuktis?"}
                      </h4>
                    </div>
                    <span className="text-[10px] text-stone-600 bg-amber-100 font-bold px-2.5 py-1 rounded-full border border-amber-300">
                      {isKn ? "ನಿಖರ ದಿನಗಳ ಲೆಕ್ಕಾಚಾರ" : "Exact Days & Dates"}
                    </span>
                  </div>

                  {/* 3-Tab Navigator / Timeline Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {dsr.roadmapList.map((item, idx) => {
                      const isSelected = selectedBhuktiTab === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedBhuktiTab(idx)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? "bg-amber-950 text-white border-amber-700 shadow-md scale-[1.02]"
                              : "bg-white text-stone-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isSelected ? "bg-amber-500 text-stone-950" : idx === 0 ? "bg-rose-100 text-rose-800" : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {idx === 0
                                ? (isKn ? "ಪ್ರಸ್ತುತ ಭುಕ್ತಿ" : "Current Bhukti")
                                : idx === 1
                                ? (isKn ? "ಮುಂದಿನ ಭುಕ್ತಿ 1" : "Next Bhukti 1")
                                : (isKn ? "ಮುಂದಿನ ಭುಕ್ತಿ 2" : "Next Bhukti 2")}
                            </span>
                          </div>
                          <div className={`text-xs md:text-sm font-black font-serif truncate ${isSelected ? "text-amber-200" : "text-stone-900"}`}>
                            {isKn ? `${item.mahaPlanetKn}-${item.bhuktiPlanetKn}` : `${item.mahaPlanetEn}-${item.bhuktiPlanetEn}`}
                          </div>
                          <div className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? "text-amber-300" : "text-stone-500"}`}>
                            {item.totalDays} {isKn ? "ದಿನಗಳು" : "days"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Bhukti Card */}
                  {activeBhukti && (
                    <div className="rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm space-y-4">
                      {/* Bhukti Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {selectedBhuktiTab === 0
                                ? (isKn ? "ಹಂತ 1: ಪ್ರಸ್ತುತ ಭುಕ್ತಿ" : "Phase 1: Current Bhukti")
                                : selectedBhuktiTab === 1
                                ? (isKn ? "ಹಂತ 2: ಮುಂದಿನ ಭುಕ್ತಿ 1" : "Phase 2: Next Bhukti 1")
                                : (isKn ? "ಹಂತ 3: ಮುಂದಿನ ಭುಕ್ತಿ 2" : "Phase 3: Next Bhukti 2")}
                            </span>
                            <h5 className="text-base md:text-lg font-black text-amber-950 font-serif">
                              {isKn ? activeBhukti.titleKn : activeBhukti.titleEn}
                            </h5>
                          </div>
                          <p className="text-xs text-stone-600 font-medium mt-1">
                            {isKn
                              ? `${activeBhukti.startDateStr} ರಿಂದ ${activeBhukti.endDateStr} ರವರೆಗೆ (${activeBhukti.daysCountFormattedKn})`
                              : `${activeBhukti.startDateStr} to ${activeBhukti.endDateStr} (${activeBhukti.daysCountFormattedEn})`}
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs">
                          {isKn ? activeBhukti.statusCountdownKn : activeBhukti.statusCountdownEn}
                        </div>
                      </div>

                      {/* Parashari Astrological Foundation Badges */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-stone-800 font-bold flex items-center gap-1">
                          <span>🪐</span>
                          <span>{isKn ? activeBhukti.relationshipKn : activeBhukti.relationshipEn}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold flex items-center gap-1">
                          <span>📐</span>
                          <span>{isKn ? activeBhukti.houseDistanceLabelKn : activeBhukti.houseDistanceLabelEn}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-1">
                          <span>👑</span>
                          <span>{isKn ? activeBhukti.bhuktiLordHousesKn : activeBhukti.bhuktiLordHousesEn}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1">
                          <span>📍</span>
                          <span>{isKn ? activeBhukti.bhuktiLordPlacementKn : activeBhukti.bhuktiLordPlacementEn}</span>
                        </span>
                      </div>

                      {/* Headline & Overview */}
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs md:text-sm space-y-1">
                        <div className="font-black text-amber-950 font-serif">
                          {cleanAstrologyText(isKn ? activeBhukti.headlineKn : activeBhukti.headlineEn)}
                        </div>
                        <p className="text-stone-800 leading-relaxed font-medium">
                          {cleanAstrologyText(isKn ? activeBhukti.whatToExpectOverviewKn : activeBhukti.whatToExpectOverviewEn)}
                        </p>
                      </div>

                      {/* 5-Pillar Detailed What To Expect Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* 1. Career & Business */}
                        <div className="p-3.5 rounded-xl bg-white border border-indigo-200 space-y-1 shadow-2xs">
                          <div className="font-bold text-indigo-900 flex items-center gap-1.5 border-b border-indigo-100 pb-1">
                            <span>💼</span>
                            <span>{isKn ? "ವೃತ್ತಿ & ವ್ಯಾಪಾರ (Career & Business)" : "Career & Profession"}</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed font-medium">
                            {cleanAstrologyText(isKn ? activeBhukti.careerProspectsKn : activeBhukti.careerProspectsEn)}
                          </p>
                        </div>

                        {/* 2. Finances & Wealth */}
                        <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1 shadow-2xs">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-100 pb-1">
                            <span>💰</span>
                            <span>{isKn ? "ಆರ್ಥಿಕತೆ & ಹೂಡಿಕೆ (Finances & Wealth)" : "Finances & Assets"}</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed font-medium">
                            {cleanAstrologyText(isKn ? activeBhukti.financialProspectsKn : activeBhukti.financialProspectsEn)}
                          </p>
                        </div>

                        {/* 3. Family & Marriage */}
                        <div className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-1 shadow-2xs">
                          <div className="font-bold text-rose-900 flex items-center gap-1.5 border-b border-rose-100 pb-1">
                            <span>🏡</span>
                            <span>{isKn ? "ಕುಟುಂಬ & ದಾಂಪತ್ಯ (Family & Marriage)" : "Family & Relationships"}</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed font-medium">
                            {cleanAstrologyText(isKn ? activeBhukti.familyMarriageProspectsKn : activeBhukti.familyMarriageProspectsEn)}
                          </p>
                        </div>

                        {/* 4. Health & Mind */}
                        <div className="p-3.5 rounded-xl bg-white border border-teal-200 space-y-1 shadow-2xs">
                          <div className="font-bold text-teal-900 flex items-center gap-1.5 border-b border-teal-100 pb-1">
                            <span>🌿</span>
                            <span>{isKn ? "ಆರೋಗ್ಯ & ಮನಃಸ್ಥಿತಿ (Health & Mind)" : "Health & Mental Peace"}</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed font-medium">
                            {cleanAstrologyText(isKn ? activeBhukti.healthMindProspectsKn : activeBhukti.healthMindProspectsEn)}
                          </p>
                        </div>
                      </div>

                      {/* Precautions & Gokarna Remedy Footer */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 space-y-1">
                          <span className="font-bold text-stone-900 flex items-center gap-1">
                            <span>🛡️</span>
                            <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಮುನ್ನೆಚ್ಚರಿಕೆ (Precautions):" : "Vedic Precautions:"}</span>
                          </span>
                          <p className="leading-relaxed">{cleanAstrologyText(isKn ? activeBhukti.precautionsKn : activeBhukti.precautionsEn)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <span>🪔</span>
                            <span>{isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪರಿಹಾರ ಸೇವೆ:" : "Sri Kshetra Gokarna Seva:"}</span>
                          </span>
                          <p className="leading-relaxed">{cleanAstrologyText(isKn ? activeBhukti.gokarnaPariharaKn : activeBhukti.gokarnaPariharaEn)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 🌟 1. DEDICATED SECTION: CAREER FIELDS WHERE NATIVE WILL SHINE & FLOURISH (ಜಾತಕರು ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ & ಗರಿಷ್ಠ ಯಶಸ್ಸು ಕಾಣುವ ವೃತ್ತಿ ರಂಗಗಳು) 🌟 */}
          {currentDiagnosis?.accurateProfession && (() => {
            const prof = currentDiagnosis.accurateProfession;
            const fieldsToDisplay = prof.topSuitableFields && prof.topSuitableFields.length > 0
              ? prof.topSuitableFields
              : [
                  {
                    fieldCode: prof.code,
                    fieldNameKn: prof.titleKn,
                    fieldNameEn: prof.titleEn,
                    suitabilityPercentage: prof.confidenceScore,
                    coreStrengthsKn: prof.specificRoleKn,
                    coreStrengthsEn: prof.specificRoleEn,
                    whyNativeShinesKn: prof.astrologicalBasisKn,
                    whyNativeShinesEn: prof.astrologicalBasisEn,
                    verdictKn: "ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು (Top Recommended)" as const,
                    verdictEn: "Top Recommended" as const
                  }
                ];

            return (
              <div className="space-y-6">
                <div className="rounded-3xl border-2 border-indigo-400 bg-gradient-to-b from-indigo-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-300 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 text-white text-2xl shadow-md border border-indigo-300">
                        🌟
                      </span>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 block">
                          ॥ ಜಾತಕರು ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ & ಗರಿಷ್ಠ ಯಶಸ್ಸು ಕಾಣುವ ವೃತ್ತಿ ರಂಗಗಳು ॥
                        </span>
                        <h3 className="text-base md:text-xl font-black text-indigo-950 font-serif">
                          {isKn
                            ? `${session.input.name || "ಜಾತಕರು"} ಅತ್ಯುನ್ನತವಾಗಿ ಶೈನ್ ಆಗುವ ವೃತ್ತಿ ರಂಗಗಳು`
                            : `${session.input.name || "Devotee"}'s Destined Flourishing Career Fields`}
                        </h3>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-950 text-xs font-black border border-indigo-400 shadow-sm flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                      <span>{isKn ? `${prof.confidenceScore}% ಗ್ರಹಬಲ ಹೊಂದಾಣಿಕೆ` : `${prof.confidenceScore}% Planetary Alignment`}</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {isKn
                      ? "ಜನ್ಮ ಕುಂಡಲಿಯ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ, ಕರ್ಮಾಧಿಪತಿ, ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ಹಾಗೂ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಯೋಗಗಳ ಆಧಾರದ ಮೇಲೆ ಜಾತಕರು ಯಾವ ರಂಗಗಳಲ್ಲಿ ಅಪ್ರತಿಮ ಯಶಸ್ಸು ಗಳಿಸುತ್ತಾರೆ ಎಂಬುದರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ (ಯಾವುದೇ ಕಲ್ಪಿತ ಊಹೆಗಳಿಲ್ಲದೆ ಜನ್ಮಜಾತ ಪ್ರತಿಭೆಯ ಆಧಾರಿತ)."
                      : "Classical determination of career fields where the native is destined to excel and flourish based on the 10th house, lord of vocation, Jaimini Amatyakaraka, and Kendra-Trikona yogas."}
                  </p>

                  {/* Top Suitable Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldsToDisplay.slice(0, 4).map((field, idx) => {
                      const isTopRank = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                            isTopRank
                              ? "bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/70 border-amber-400 shadow-md"
                              : "bg-white border-indigo-200/90 shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                                isTopRank ? "bg-amber-500 text-white shadow-xs" : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                              }`}>
                                #{idx + 1}
                              </span>
                              <h4 className="font-black text-stone-950 text-sm sm:text-base font-serif">
                                {isKn ? field.fieldNameKn : field.fieldNameEn}
                              </h4>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-950 border border-indigo-300 whitespace-nowrap">
                              {isKn ? field.verdictKn : field.verdictEn}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-stone-700">
                              <span>{isKn ? "ಸೂಕ್ತತೆ ಪ್ರಮಾಣ" : "Suitability"}</span>
                              <span className="text-indigo-950 font-black">{field.suitabilityPercentage}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-700"
                                style={{ width: `${field.suitabilityPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Core Strengths */}
                          <div className="text-xs text-stone-800 space-y-1">
                            <span className="font-bold text-indigo-900 block">{isKn ? "ಕೇಂದ್ರ ಸಾಮರ್ಥ್ಯ:" : "Core Strengths:"}</span>
                            <p className="font-medium leading-relaxed">{cleanAstrologyText(isKn ? field.coreStrengthsKn : field.coreStrengthsEn)}</p>
                          </div>

                          {/* Interest Fields & Core Specializations */}
                          {Boolean(((isKn ? (field as any).interestFieldsKn : (field as any).interestFieldsEn) || (field as any).interestFieldsKn)?.length) && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                <span>🎯</span>
                                <span>{isKn ? "ಆಸಕ್ತಿ ರಂಗಗಳು & ಪ್ರಮುಖ ವಿಭಾಗಗಳು (Interest Fields):" : "Interest Fields & Specializations:"}</span>
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(((isKn ? (field as any).interestFieldsKn : (field as any).interestFieldsEn) || (field as any).interestFieldsKn) as string[]).map((tag: string, tIdx: number) => (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-stone-900 text-[11px] font-bold shadow-2xs"
                                  >
                                    <span className="text-amber-700 mr-1">•</span>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Why Native Shines */}
                          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-[11px] text-stone-800 leading-relaxed space-y-1">
                            <span className="font-bold text-indigo-950 block">✨ {isKn ? "ಈ ರಂಗದಲ್ಲಿ ಶೈನ್ ಆಗಲು ಗ್ರಹಗಳ ಕಾರಣ:" : "Astrological Driver for Success:"}</span>
                            <p className="font-medium">{cleanAstrologyText(isKn ? field.whyNativeShinesKn : field.whyNativeShinesEn)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* High-Power Career Yogas */}
                  {prof.specialCareerYogasKn && prof.specialCareerYogasKn.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                        <span>👑</span>
                        <span>{isKn ? "ರಾಜಯೋಗ & ಕರ್ಮ ಸ್ಥಾನದ ವಿಶೇಷ ಯೋಗಗಳು (Special Career Yogas):" : "Special Career Yogas & Royal Combinations:"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {prof.specialCareerYogasKn.map((yoga, yIdx) => (
                          <span
                            key={yIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-bold shadow-xs"
                          >
                            <span className="text-amber-600">✦</span>
                            <span>{yoga}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leadership Potential */}
                  {prof.leadershipPotentialKn && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-amber-50/60 border border-indigo-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                        <span>🎖️</span>
                        <span>{isKn ? "ನಾಯಕತ್ವ & ಆಡಳಿತಾತ್ಮಕ ಸಾಮರ್ಥ್ಯ (Leadership & Governance Potential):" : "Leadership & Governance Potential:"}</span>
                      </div>
                      <p className="text-stone-900 font-semibold text-xs sm:text-sm leading-relaxed">
                        {cleanAstrologyText(isKn ? prof.leadershipPotentialKn : (prof.leadershipPotentialEn || prof.leadershipPotentialKn))}
                      </p>
                    </div>
                  )}

                  {/* Classical Astrological Pillars */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-stone-800 shadow-xs">
                      <span className="text-[10px] text-indigo-900 font-bold block uppercase">{isKn ? "ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ (AmK)" : "Jaimini Amatyakaraka"}</span>
                      <b className="text-indigo-950 text-sm">{isKn ? prof.amatyakarakaPlanetKn : prof.amatyakarakaPlanetEn}</b>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-stone-800 shadow-xs">
                      <span className="text-[10px] text-indigo-900 font-bold block uppercase">{isKn ? "10ನೇ ಕರ್ಮ ಸ್ಥಾನ" : "10th House of Career"}</span>
                      <b className="text-indigo-950 text-sm">{isKn ? `${prof.tenthHouseSignKn} ರಾಶಿ` : prof.tenthHouseSignEn}</b>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-200 text-stone-800 shadow-xs col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-indigo-900 font-bold block uppercase">{isKn ? "ಕರ್ಮೇಶ ಗ್ರಹ" : "10th House Lord"}</span>
                      <b className="text-indigo-950 text-sm">{isKn ? prof.primaryPlanetKn : prof.primaryPlanetEn}</b>
                    </div>
                  </div>

                  {prof.secondaryAlternativeKn && (
                    <div className="text-[11px] text-indigo-900 bg-indigo-50/50 px-3.5 py-2 rounded-xl border border-indigo-200 flex items-center gap-2 font-medium">
                      <span>🔄</span>
                      <span><b>{isKn ? "ಪರ್ಯಾಯ / ಪೂರಕ ಅವಕಾಶಗಳು:" : "Alternative / Complementary Opportunities:"}</b> {cleanAstrologyText(isKn ? prof.secondaryAlternativeKn : prof.secondaryAlternativeEn)}</span>
                    </div>
                  )}
                </div>

                {/* 📚 2. DEDICATED SECTION: ACADEMIC & SUBJECT APTITUDES (ಶೈಕ್ಷಣಿಕ ವಿಷಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ & ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ) 📚 */}
                {prof.subjectAptitudes && prof.subjectAptitudes.length > 0 && (
                  <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-300 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl shadow-md border border-emerald-300">
                          📚
                        </span>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                            ॥ ಶೈಕ್ಷಣಿಕ ವಿಷಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ & ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ ॥
                          </span>
                          <h3 className="text-base md:text-xl font-black text-emerald-950 font-serif">
                            {isKn
                              ? "ನೈಸರ್ಗಿಕ ಶೈಕ್ಷಣಿಕ & ಬೌದ್ಧಿಕ ಒಲವು (Academic & Subject Aptitudes)"
                              : "Natural Academic & Subject Aptitudes"}
                          </h3>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black border border-emerald-400 shadow-sm flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{isKn ? "5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ & ಬುಧ-ಗುರು ಬಲ" : "5th House & Mercury-Jupiter Strength"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {isKn
                        ? "ಜಾತಕದ 5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ, ಬುದ್ಧಿಕಾರಕ ಬುಧ, ಜ್ಞಾನಕಾರಕ ಗುರು ಹಾಗೂ 2ನೇ ವಾಗ್ಸ್ಥಾನಗಳ ಆಧಾರದ ಮೇಲೆ ಜಾತಕರಿಗೆ ಯಾವ ವಿಷಯಗಳಲ್ಲಿ ಜನ್ಮತಃ ಆಸಕ್ತಿ ಮತ್ತು ಶ್ರೇಷ್ಠ ಗ್ರಹಣ ಶಕ್ತಿ ಇದೆ ಎಂಬ ಸಮಗ್ರ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ."
                        : "Evaluation of natural intellectual inclinations, grasping ability, and academic strengths based on the 5th house of intellect, Mercury (intellect), and Jupiter (wisdom)."}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {prof.subjectAptitudes.map((subj, sIdx) => {
                        const isHigh = subj.scorePercentage >= 80;
                        const isRank1 = sIdx === 0;
                        return (
                          <div
                            key={sIdx}
                            className={`p-4 rounded-2xl bg-white transition-all space-y-3 relative ${
                              isRank1
                                ? "border-2 border-emerald-500 shadow-md ring-2 ring-emerald-400/20 bg-gradient-to-b from-emerald-50/40 via-white to-white"
                                : "border-2 border-emerald-200/80 shadow-sm hover:shadow-md"
                            }`}
                          >
                            {isRank1 && (
                              <div className="flex items-center gap-1.5 -mt-1 -mb-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full w-fit border border-emerald-300">
                                <span>🌟</span>
                                <span>{isKn ? "ಅಗ್ರಗಣ್ಯ ನೈಸರ್ಗಿಕ ಒಲವು (Top Rank)" : "Top Natural Inclination"}</span>
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                                {isKn ? subj.nameKn : subj.nameEn}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black border whitespace-nowrap ${
                                  isHigh
                                    ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                                    : "bg-amber-100 text-amber-950 border-amber-400"
                                }`}
                              >
                                {isKn ? subj.ratingKn : subj.ratingEn}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold text-stone-700">
                                <span>{isKn ? "ಸಾಮರ್ಥ್ಯ ಸ್ಕೋರ್" : "Aptitude Score"}</span>
                                <span className="text-emerald-950 font-black">{subj.scorePercentage}%</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    isHigh
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                      : "bg-gradient-to-r from-amber-400 to-yellow-500"
                                  }`}
                                  style={{ width: `${subj.scorePercentage}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                              {cleanAstrologyText(isKn ? subj.planetaryIndicatorKn : subj.planetaryIndicatorEn)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 💍 3. DEDICATED SECTION: LIFETIME MARRIAGE DESTINY DETERMINATION (ಜೀವಿತಾವಧಿಯ ವಿವಾಹ ಯೋಗ ನಿರ್ಣಯ: ಜೀವಿತಾವಧಿಯಲ್ಲಿ ವಿವಾಹ ಯೋಗವಿದೆಯೇ?) 💍 */}
          {currentDiagnosis?.marriageDestiny && (() => {
            const md = currentDiagnosis.marriageDestiny;
            const isDelayed = md.verdict === "delayed_marriage";

            const colorConfig: Record<string, { border: string; bg: string; badge: string; text: string; iconBg: string }> = {
              emerald: {
                border: "border-emerald-400",
                bg: "bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/40",
                badge: "bg-emerald-100 text-emerald-950 border-emerald-400",
                text: "text-emerald-950",
                iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              },
              amber: {
                border: "border-amber-400",
                bg: "bg-gradient-to-b from-amber-50/70 via-white to-orange-50/40",
                badge: "bg-amber-100 text-amber-950 border-amber-400",
                text: "text-amber-950",
                iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              },
              purple: {
                border: "border-purple-400",
                bg: "bg-gradient-to-b from-purple-50/70 via-white to-indigo-50/40",
                badge: "bg-purple-100 text-purple-950 border-purple-400",
                text: "text-purple-950",
                iconBg: "bg-gradient-to-br from-purple-600 to-indigo-700 text-white"
              },
              rose: {
                border: "border-rose-400",
                bg: "bg-gradient-to-b from-rose-50/70 via-white to-amber-50/40",
                badge: "bg-rose-100 text-rose-950 border-rose-400",
                text: "text-rose-950",
                iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white"
              }
            };

            const style = colorConfig[md.badgeColor] || colorConfig.amber;

            return (
              <div className={`rounded-3xl border-2 ${style.border} ${style.bg} p-6 md:p-8 text-stone-950 shadow-xl space-y-6`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconBg} text-2xl shadow-md`}>
                      💍
                    </span>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 block">
                        ॥ ಜೀವಿತಾವಧಿಯ ವಿವಾಹ ಯೋಗ ನಿರ್ಣಯ ॥
                      </span>
                      <h3 className="text-base md:text-xl font-black text-stone-950 font-serif">
                        {isKn ? md.titleKn : md.titleEn}
                      </h3>
                    </div>
                  </div>
                  <span className={`px-3.5 py-1.5 rounded-full ${style.badge} text-xs font-black shadow-sm flex items-center gap-1.5`}>
                    <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                    <span>{isKn ? md.subtitleKn : md.subtitleEn}</span>
                  </span>
                </div>

                {/* Hero Direct Answer Banner */}
                <div className="p-5 rounded-2xl border-2 border-stone-300 bg-white/95 shadow-md space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                    <span>🔮</span>
                    <span>{isKn ? "ದೈವಜ್ಞ ನೇರ & ನಿಖರ ಉತ್ತರ (Definitive Astrological Verdict):" : "Definitive Astrological Verdict:"}</span>
                  </div>
                  <h4 className="text-lg md:text-2xl font-black text-stone-950 font-serif leading-tight">
                    {cleanAstrologyText(isKn ? md.directAnswerKn : md.directAnswerEn)}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold">
                      ⏳ {cleanAstrologyText(isKn ? md.marriageTimingWindowKn : md.marriageTimingWindowEn)}
                    </span>
                  </div>
                </div>

                {/* Reassurance Banner for Delayed Marriage */}
                {isDelayed && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                      <span className="text-xl">🛡️</span>
                      <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಭರವಸೆ: ವಿಳಂಬವೇ ಹೊರತು ವಿವಾಹ ನಿರಾಕರಣೆಯಲ್ಲ! (Delay is NOT Denial!)" : "Classical Assurance: Delay is NOT Denial!"}</span>
                    </div>
                    <p className="text-stone-800 text-xs sm:text-sm leading-relaxed font-medium">
                      {isKn
                        ? `${md.delayFactorsKn && md.delayFactorsKn.length > 0 ? md.delayFactorsKn.map(f => f.split("—")[0].trim()).join(", ") : "ಜಾತಕದ ಗ್ರಹಗಳ"} ಪ್ರಭಾವದಿಂದ ಕಲ್ಯಾಣ ಕಾಲ ವಿಳಂಬವಾಗುತ್ತದೆಯೇ ವಿನಃ, ದಾಂಪತ್ಯ ಭಾಗ್ಯ ಶಾಶ್ವತವಾಗಿ ನಿರಾಕರಿಸಲ್ಪಟ್ಟಿಲ್ಲ. ಸೂಕ್ತ ವಯಸ್ಸಿನಲ್ಲಿ ದೈವಿಕ ಸಂಕಲ್ಪ, ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ ಹಾಗೂ ಸಕಾಲದ ಪ್ರಯತ್ನದಿಂದ ದಾಂಪತ್ಯ ಜೀವನ ಸಿದ್ಧಿಸಲಿದೆ.`
                        : `${md.delayFactorsEn && md.delayFactorsEn.length > 0 ? md.delayFactorsEn.map(f => f.split("—")[0].trim()).join(", ") : "Planetary influences"} indicate a delayed timing window, not denial of marriage. With proper spiritual remedies and conscious effort, fruitful marital destiny manifests.`}
                    </p>
                  </div>
                )}

                {/* Delay Factors if present */}
                {md.delayFactorsKn && md.delayFactorsKn.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                      <span>⚠️</span>
                      <span>{isKn ? "ವಿವಾಹ ವಿಳಂಬಕ್ಕೆ ಕಾರಣವಾದ ಗ್ರಹ ಸ್ಥಿತಿಗಳು:" : "Planetary Factors Causing Delay:"}</span>
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {(isKn ? md.delayFactorsKn : (md.delayFactorsEn || md.delayFactorsKn)).map((fac, fIdx) => (
                        <li key={fIdx} className="text-xs text-stone-800 flex items-start gap-2 font-medium">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{cleanAstrologyText(fac)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Astrological Reasoning & Classical Rule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <span>🪐</span>
                      <span>{isKn ? "7ನೇ ಸಪ್ತಮ ಸ್ಥಾನ & ಗ್ರಹಗಳ ಸ್ಥಿತಿ:" : "7th House & Astrological Reasoning:"}</span>
                    </div>
                    <p className="text-stone-800 font-medium text-xs sm:text-sm leading-relaxed">
                      {cleanAstrologyText(isKn ? md.astrologicalReasoningKn : md.astrologicalReasoningEn)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <span>📜</span>
                      <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಪ್ರಮಾಣ ಗ್ರಂಥ & ನಿಯಮ:" : "Classical Shastric Citation:"}</span>
                    </div>
                    <p className="text-stone-800 font-medium text-xs sm:text-sm leading-relaxed">
                      {cleanAstrologyText(isKn ? md.classicalRuleCitedKn : md.classicalRuleCitedEn)}
                    </p>
                  </div>
                </div>

                {/* Historical / Celebrity Parallel if present */}
                {md.historicalCelebrityParallelKn && (
                  <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-300 text-xs text-stone-900 space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-950">
                      <span>🏛️</span>
                      <span>{isKn ? "ಇತಿಹಾಸ ಪ್ರಸಿದ್ಧ ಮಹನೀಯರ ಜಾತಕ ಸಾಮ್ಯತೆ:" : "Historical & Illustrious Chart Parallels:"}</span>
                    </div>
                    <p className="font-medium leading-relaxed">
                      {cleanAstrologyText(isKn ? md.historicalCelebrityParallelKn : (md.historicalCelebrityParallelEn || md.historicalCelebrityParallelKn))}
                    </p>
                  </div>
                )}

                {/* Blessing Remedy */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-xs text-stone-900 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <span>🪔</span>
                    <span>{isKn ? "ದೈವಿಕ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ & ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ:" : "Sacred Remedial Measures & Blessing Path:"}</span>
                  </div>
                  <p className="font-medium leading-relaxed">
                    {cleanAstrologyText(isKn ? md.blessingRemedyKn : md.blessingRemedyEn)}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 🧘 2. MASTER SECTION: COMPREHENSIVE PERSONALITY, STRENGTHS & MORAL INTEGRITY (ಸಮಗ್ರ ವ್ಯಕ್ತಿತ್ವ, ಸಾಮರ್ಥ್ಯಗಳು & ನೈತಿಕ ಸದಾಚಾರ ದರ್ಶನ) 🧘 */}
          {(currentDiagnosis?.goodBadAnalysis || currentDiagnosis?.negativeShades) && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
              {/* MASTER SECTION HEADER */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-300 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 text-2xl shadow-md border border-amber-300">
                    🧘
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      ॥ ಸಮಗ್ರ ವ್ಯಕ್ತಿತ್ವ, ಸಾಮರ್ಥ್ಯಗಳು & ನೈತಿಕ ಸದಾಚಾರ ದರ್ಶನ ॥
                    </span>
                    <h3 className="text-base md:text-xl font-black text-amber-950 font-serif">
                      {isKn
                        ? (isChild
                          ? `${session.input.name || "ಮಗುವಿನ"} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ, ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿ) ವ್ಯಕ್ತಿತ್ವ, ನಡವಳಿಕೆ & ಚಾರಿತ್ರ್ಯ ವಿಶ್ಲೇಷಣೆ`
                          : `${session.input.name || "ಜಾತಕರ"} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ, ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿ) ವ್ಯಕ್ತಿತ್ವ, ಸಾಮರ್ಥ್ಯಗಳು & ನೈತಿಕ ಸದಾಚಾರ`)
                        : `${session.input.name ? `${session.input.name}'s ` : ""}(${session.result.lagnaRashi.english} Asc, ${session.result.moonSign.english} Moon) Personality, Strengths & Moral Integrity`}
                    </h3>
                  </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex flex-wrap items-center gap-1.5 bg-amber-100/90 p-1.5 rounded-2xl border border-amber-300 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setPersonalityTab("all")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      personalityTab === "all"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "text-amber-900 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "ಎಲ್ಲವೂ (All)" : "All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalityTab("strengths")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      personalityTab === "strengths"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "text-amber-900 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "🌟 ಉತ್ತಮ ಗುಣಗಳು" : "🌟 Strengths"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalityTab("challenges")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      personalityTab === "challenges"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "text-amber-900 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "⚠️ ಎಚ್ಚರಿಕೆ & ಸವಾಲುಗಳು" : "⚠️ Challenges"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalityTab("integrity")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      personalityTab === "integrity"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "text-amber-900 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "🛡️ ನೈತಿಕ ಸದಾಚಾರ" : "🛡️ Integrity"}
                  </button>
                </div>
              </div>

              {/* SUB-BLOCK 1: STRENGTHS & VIRTUES */}
              {(personalityTab === "all" || personalityTab === "strengths") && currentDiagnosis?.goodBadAnalysis?.goodTraits && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🌟</span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                        {isKn ? "ಉತ್ತಮ ಗುಣಗಳು, ಸಾಮರ್ಥ್ಯಗಳು & ದೈವಿಕ ಆತ್ಮಬಲ (Divine Strengths & Virtues)" : "Divine Strengths & Virtues"}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black border border-amber-300">
                      {isKn ? "5 ಪ್ರಮುಖ ಸದ್ಗುಣಗಳು" : "5 Master Virtues"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    {currentDiagnosis.goodBadAnalysis.goodTraits.map((trait) => (
                      <div
                        key={trait.id}
                        className={`p-5 rounded-2xl border-2 border-amber-300 bg-white space-y-3 shadow-md transition-all hover:border-amber-500 ${
                          trait.id === 1 ? "md:col-span-2 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 border-amber-400" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <span className="font-black text-sm flex items-center gap-2 text-amber-950">
                            <span className="text-lg">{trait.icon}</span>
                            <span>{trait.id}. {isKn ? trait.titleKn : trait.titleEn}</span>
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                            {isKn ? trait.badgeKn : trait.badgeEn}
                          </span>
                        </div>

                        <p className="text-stone-800 leading-relaxed font-medium bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                          "{cleanAstrologyText(isKn ? trait.bulletKn : trait.bulletEn)}"
                        </p>

                        <div className="text-[11px] text-amber-900 flex items-center gap-1.5 px-1 font-semibold">
                          <span>🎯</span>
                          <span><b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b> {cleanAstrologyText(isKn ? trait.astrologicalBasisKn : trait.astrologicalBasisEn)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-BLOCK 2: CHALLENGES, RESTRAINT & SHADOW CAUTIONS */}
              {(personalityTab === "all" || personalityTab === "challenges") && currentDiagnosis?.goodBadAnalysis?.badTraits && (
                <div className="space-y-4 pt-4 border-t border-amber-200">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚠️</span>
                      <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                        {isKn
                          ? (isChild ? "ನಡವಳಿಕೆಯ ಸವಾಲುಗಳು, ಕಿರಿಕಿರಿ & ರಕ್ಷಾ ಎಚ್ಚರಿಕೆಗಳು" : "ನಡವಳಿಕೆಯ ಸವಾಲುಗಳು, ಇಂದ್ರಿಯ ಸಂಯಮ & ನೆರಳು ಎಚ್ಚರಿಕೆಗಳು")
                          : "Behavioral Challenges, Restraint & Shadow Cautions"}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-950 text-[10px] font-black border border-rose-300">
                      {isKn ? "ಎಚ್ಚರಿಕೆ & ಪ್ರಾಯಶ್ಚಿತ್ತ" : "Cautions & Remedies"}
                    </span>
                  </div>

                  {/* HIGHLIGHT BANNER 0: PURE CHARACTER & TEETOTALER/FIDELITY PRAISE */}
                  {(currentDiagnosis.goodBadAnalysis.isTeetotaler || currentDiagnosis.goodBadAnalysis.isHighFidelityVrata || (currentDiagnosis.goodBadAnalysis.hasMaritalFidelity && !currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk)) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-emerald-50 border-2 border-emerald-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs md:text-sm">
                        <span>✨</span>
                        <span>{isKn ? "ಚಾರಿತ್ರ್ಯ & ಸದಾಚಾರ ದೃಢೀಕರಣ:" : "Character Purity & Moral Integrity:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn
                          ? `${currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍃 ಜಾತಕರ 2ನೇ ಧನ-ಆಹಾರ ಸ್ಥಾನದ ಮೇಲೆ ಗುರು/ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿ ರಕ್ಷಣೆ ಇರುವುದರಿಂದ ಸಾತ್ವಿಕ ಆಹಾರ ಪದ್ಧತಿ ಹೊಂದಿದ್ದು, ಧೂಮಪಾನ-ಮದ್ಯಪಾನಗಳಂತಹ ದುಶ್ಚಟಗಳಿಂದ ಮುಕ್ತವಾದ ಪರಿಶುದ್ಧ ಸಾತ್ವಿಕ ಶರೀರ ರಕ್ಷಣೆ ಹೊಂದಿದ್ದಾರೆ. " : ""}${currentDiagnosis.goodBadAnalysis.isHighFidelityVrata ? `💍 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಮತ್ತು ಶುಕ್ರನ ಮೇಲೆ ಬೃಹಸ್ಪತಿಯ ಪೂರ್ಣ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಜಾತಕದಲ್ಲಿ ಅದ್ಭುತ ಚಾರಿತ್ರ್ಯ ಶುದ್ಧಿ ಹಾಗೂ ದೈವಿಕ ${session.input.gender === "Female" ? "ಏಕಪತಿ ವ್ರತ" : "ಏಕಪತ್ನಿ ವ್ರತ"} ಯೋಗವಿದೆ; ದಾಂಪತ್ಯ ಧರ್ಮದಲ್ಲಿ ಅಚಲ ನೈತಿಕ ನಿಷ್ಠೆ ರಕ್ಷಣೆಯಾಗಿದೆ.` : (currentDiagnosis.goodBadAnalysis.hasMaritalFidelity && !currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk ? "💍 ದಾಂಪತ್ಯದಲ್ಲಿ ಸಾಮಾನ್ಯ ಧರ್ಮ, ನೈತಿಕ ಸಂಯಮ ಹಾಗೂ ಸಾಂಸಾರಿಕ ಜವಾಬ್ದಾರಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವ ಸದ್ಗುಣವಿದೆ." : "")}`
                          : `${currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍃 Benefic and Jupiterian aspects on the 2nd house protect dietary purity, ensuring a clean teetotaler lifestyle free of alcohol or intoxicants. " : ""}${currentDiagnosis.goodBadAnalysis.isHighFidelityVrata ? `💍 Divine protection on the 7th house and Venus grants an exceptional vow of marital fidelity (${session.input.gender === "Female" ? "Ekapati Vrata" : "Ekapatni Vrata"}), ensuring sacred loyalty to the spouse.` : (currentDiagnosis.goodBadAnalysis.hasMaritalFidelity && !currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk ? "💍 Upholds natural marital responsibility, ethical restraint, and commitment in domestic life." : "")}`}
                      </p>
                    </div>
                  )}

                  {/* HIGHLIGHT BANNER 0B: SELF-RESTRAINT & MARITAL VIGILANCE CAUTION */}
                  {(currentDiagnosis.goodBadAnalysis.hasDhumapanaOrSubstanceTendency || currentDiagnosis.goodBadAnalysis.hasMadyapanaRisk || currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk || (!currentDiagnosis.goodBadAnalysis.isTeetotaler && !currentDiagnosis.goodBadAnalysis.isHighFidelityVrata)) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 via-rose-50 to-orange-50 border-2 border-amber-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                        <span>⚠️</span>
                        <span>{isKn ? "ಇಂದ್ರಿಯ ಸಂಯಮ & ಸಾಂಸಾರಿಕ ರಕ್ಷಾ ಎಚ್ಚರಿಕೆ (Self-Restraint & Marital Vigilance):" : "Sensual Restraint & Marital Vigilance:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn
                          ? `${currentDiagnosis.goodBadAnalysis.hasDhumapanaOrSubstanceTendency ? "🚭 2ನೇ ಮುಖ ಸ್ಥಾನ ಅಥವಾ ರಾಹು ಪ್ರಭಾವದಿಂದಾಗಿ ಧೂಮಪಾನ, ಹುಕ್ಕಾ ಅಥವಾ ತಂಬಾಕು/ವ್ಯಸನದ ಆಕರ್ಷಣೆಯ ಪ್ರವೃತ್ತಿ ಇರಬಹುದು; ಶ್ವಾಸಕೋಶ ಹಾಗೂ ನರಗಳ ಆರೋಗ್ಯಕ್ಕಾಗಿ ದುಶ್ಚಟದಿಂದ ದೂರವಿರುವುದು ಅತ್ಯಗತ್ಯ. " : (currentDiagnosis.goodBadAnalysis.hasMadyapanaRisk ? "🍷 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನಕ್ಕೆ ಶನಿ-ರಾಹು ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ಮದ್ಯಪಾನ ಪ್ರಲೋಭನೆಗೆ ಒಳಗಾಗುವ ಸೂಕ್ಷ್ಮತೆ ಇದೆ; ಸಾತ್ವಿಕ ಶಿಸ್ತು ಅತ್ಯಗತ್ಯ. " : (!currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍽️ ಆಹಾರ ಮತ್ತು ಜೀವನಶೈಲಿಯಲ್ಲಿ ಅತಿಯಾದ ಕರಿದ ಪದಾರ್ಥ ಅಥವಾ ಸಾಂದರ್ಭಿಕ ಶಿಸ್ತುಭಂಗದ ಕಡೆ ಗಮನವಿರಲಿ. " : ""))}${currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk ? "👀 5ನೇ/7ನೇ ಭಾವದಲ್ಲಿ ರಾಹು ಅಥವಾ ಶುಕ್ರ-ಕುಜರ ತೀವ್ರ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಕಾಮ ಚಾಂಚಲ್ಯ, ಏಕಕಾಲದಲ್ಲಿ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಪ್ರಣಯ ಸಂಬಂಧಗಳು ಅಥವಾ ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ಆಕರ್ಷಣೆಯ ತೀವ್ರ ಪರೀಕ್ಷೆ ಎದುರಾಗಬಹುದು; ದಾಂಪತ್ಯ ವಿಶ್ವಾಸಘಾತುಕತನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕಲಹ ತಡೆಯಲು ಕಠಿಣ ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಅತ್ಯಗತ್ಯ." : (!currentDiagnosis.goodBadAnalysis.hasMaritalFidelity && !currentDiagnosis.goodBadAnalysis.isHighFidelityVrata ? "⚡ ದಾಂಪತ್ಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಸಂವಹನ ಕೊರತೆ ಹಾಗೂ ಸಾಂದರ್ಭಿಕ ಭಾವನಾತ್ಮಕ ಅಸಮಾಧಾನದ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ ಪರಸ್ಪರ ನಂಬಿಕೆಯನ್ನು ಜತನದಿಂದ ರಕ್ಷಿಸಿಕೊಳ್ಳಿ." : "")}`
                          : `${currentDiagnosis.goodBadAnalysis.hasDhumapanaOrSubstanceTendency ? "🚭 Rahu or 2nd house afflictions indicate vulnerability toward smoking, hookah, or tobacco; respiratory discipline and detox are advised. " : (currentDiagnosis.goodBadAnalysis.hasMadyapanaRisk ? "🍷 Afflictions to the 2nd house indicate vulnerability toward alcohol consumption under stress; moderation and detox are recommended. " : (!currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍽️ Occasional lifestyle and dietary irregularities require moderation. " : ""))}${currentDiagnosis.goodBadAnalysis.hasMultipleRelationshipsRisk ? "👀 Rahu in the 5th/7th or Venus-Mars tensions trigger sensual restlessness and romantic wanderlust; practicing strict sensory self-control is essential to preserve marital peace." : (!currentDiagnosis.goodBadAnalysis.hasMaritalFidelity && !currentDiagnosis.goodBadAnalysis.isHighFidelityVrata ? "⚡ Occasional marital miscommunication requires conscious effort and mutual trust." : "")}`}
                      </p>
                    </div>
                  )}

                  {/* HIGHLIGHT BANNER 1: SECRET LIFE HABIT & DISCLOSURE DYNAMIC */}
                  {currentDiagnosis.goodBadAnalysis.secrecyHabitKn && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/90 border-2 border-amber-400 space-y-2.5 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
                        <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                          <span className="text-lg">🎭</span>
                          <span>
                            {isKn
                              ? "ಅಂತರಂಗದ ರಹಸ್ಯ ವರ್ತನೆ: ಜನರೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆಯೇ ಅಥವಾ ಒಳಗೇ ಮುಚ್ಚಿಡುತ್ತಾರೆಯೇ?"
                              : "Inner Secrecy & Disclosure Dynamic: Do they openly share secrets or conceal inside?"}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-white/90 text-amber-900 border border-amber-300 shadow-2xs self-start sm:self-auto">
                          {isKn
                            ? currentDiagnosis.goodBadAnalysis.secrecyHabitKn.includes("ಕುಲ್ಲಂ ಕುಲ್ಲಾ")
                              ? "🗣️ ಕುಲ್ಲಂ ಕುಲ್ಲಾ / ನಿರ್ಭಯ ಮುಕ್ತತೆ"
                              : currentDiagnosis.goodBadAnalysis.secrecyHabitKn.includes("ಪ್ರಾಯೋಗಿಕ")
                              ? "🔒 ಪ್ರಾಯೋಗಿಕ ಮೌನ / ಶಿಸ್ತುಬದ್ಧ ಗೌಪ್ಯತೆ"
                              : currentDiagnosis.goodBadAnalysis.secrecyHabitKn.includes("ಬೌದ್ಧಿಕ")
                              ? "🎭 ಬೌದ್ಧಿಕ ಚಾಣಾಕ್ಷತೆ / ನಯವಾದ ಮರೆಮಾಚುವಿಕೆ"
                              : "🌊 ಆಳವಾದ ಭಾವನಾತ್ಮಕ ಕಂದಕ / ಸಂಪೂರ್ಣ ಗೌಪ್ಯತೆ"
                            : "Psychological Disclosure Mode"}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {cleanAstrologyText(isKn ? currentDiagnosis.goodBadAnalysis.secrecyHabitKn : (currentDiagnosis.goodBadAnalysis.secrecyHabitEn || currentDiagnosis.goodBadAnalysis.secrecyHabitKn))}
                      </p>
                    </div>
                  )}

                  {/* HIGHLIGHT BANNER 2: GOKARNA PRAYASHCHITTA */}
                  {currentDiagnosis.goodBadAnalysis.gokarnaPrayashchittaKn && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-100 via-amber-100 to-amber-50 border-2 border-amber-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                        <span>🕉️</span>
                        <span>{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಾಯಶ್ಚಿತ್ತ & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮುಕ್ತಿ ಪರಿಹಾರ:" : "Authentic Vedic Prayashchitta at Gokarna Kshetra:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {cleanAstrologyText(isKn ? currentDiagnosis.goodBadAnalysis.gokarnaPrayashchittaKn : (currentDiagnosis.goodBadAnalysis.gokarnaPrayashchittaEn || currentDiagnosis.goodBadAnalysis.gokarnaPrayashchittaKn))}
                      </p>
                    </div>
                  )}

                  {/* Bad Traits Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    {currentDiagnosis.goodBadAnalysis.badTraits.map((trait) => {
                      const isVirtuousTrait =
                        trait.badgeKn?.includes("ಸಾತ್ವಿಕ") ||
                        trait.badgeKn?.includes("ನಿಷ್ಠೆ") ||
                        trait.badgeEn?.toLowerCase().includes("teetotaler") ||
                        trait.badgeEn?.toLowerCase().includes("fidelity") ||
                        trait.titleKn?.includes("ಸಾತ್ವಿಕ") ||
                        trait.titleKn?.includes("ದಾಂಪತ್ಯ ನಿಷ್ಠೆ");

                      return (
                        <div
                          key={trait.id}
                          className={`p-5 rounded-2xl border-2 space-y-3 shadow-md transition-all ${
                            isVirtuousTrait
                              ? "border-emerald-300 bg-white hover:border-emerald-500 ring-1 ring-emerald-200"
                              : trait.id === 6 || trait.id === 7
                              ? "md:col-span-2 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-amber-400"
                              : "border-rose-200 bg-white hover:border-rose-400"
                          }`}
                        >
                          <div className={`flex items-center justify-between border-b pb-2 ${isVirtuousTrait ? "border-emerald-100" : "border-rose-100"}`}>
                            <span className={`font-black text-sm flex items-center gap-2 ${isVirtuousTrait ? "text-emerald-950" : "text-rose-950"}`}>
                              <span className="text-lg">{trait.icon}</span>
                              <span>{trait.id}. {isKn ? trait.titleKn : trait.titleEn}</span>
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                              isVirtuousTrait ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-rose-100 text-rose-900 border-rose-300"
                            }`}>
                              {isKn ? trait.badgeKn : trait.badgeEn}
                            </span>
                          </div>

                          <p className={`text-stone-800 leading-relaxed font-medium p-3.5 rounded-xl border ${
                            isVirtuousTrait ? "bg-emerald-50/40 border-emerald-100" : "bg-rose-50/40 border-rose-100"
                          }`}>
                            "{cleanAstrologyText(isKn ? trait.bulletKn : trait.bulletEn)}"
                          </p>

                          <div className="text-[11px] text-amber-900 flex items-center gap-1.5 px-1 font-semibold">
                            <span>🎯</span>
                            <span><b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b> {cleanAstrologyText(isKn ? trait.astrologicalBasisKn : trait.astrologicalBasisEn)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-BLOCK 3: MORAL INTEGRITY, CRIMINALITY VERIFICATION & 5 DIMENSIONS */}
              {(personalityTab === "all" || personalityTab === "integrity") && currentDiagnosis?.negativeShades && (() => {
                const shades = currentDiagnosis.negativeShades;
                const isClean = shades.overallScore <= 15 || shades.isJupiterProtected || shades.isChildShielded;

                const scoreColor =
                  shades.overallScore <= 15
                    ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                    : shades.overallScore <= 35
                    ? "text-sky-700 bg-sky-100 border-sky-300"
                    : shades.overallScore <= 60
                    ? "text-amber-800 bg-amber-100 border-amber-300"
                    : shades.overallScore <= 80
                    ? "text-orange-700 bg-orange-100 border-orange-300"
                    : "text-rose-800 bg-rose-100 border-rose-300";

                const progressGradient =
                  shades.overallScore <= 15
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                    : shades.overallScore <= 35
                    ? "bg-gradient-to-r from-sky-400 to-emerald-500"
                    : shades.overallScore <= 60
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : shades.overallScore <= 80
                    ? "bg-gradient-to-r from-orange-500 to-rose-600"
                    : "bg-gradient-to-r from-rose-600 to-red-800";

                const dimensions = [
                  { key: "sensualMarital", data: shades.sensualMarital, icon: "💍" },
                  { key: "financialIntegrity", data: shades.financialIntegrity, icon: "⚖️" },
                  { key: "violenceAggression", data: shades.violenceAggression, icon: "🛡️" },
                  { key: "legalBandhana", data: shades.legalBandhana, icon: "🏛️" },
                  { key: "conductDownwardPath", data: shades.conductDownwardPath, icon: "🧭" },
                ];

                return (
                  <div className="space-y-5 pt-4 border-t border-amber-200">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛡️</span>
                        <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                          {isKn ? "ನೈತಿಕ ಚಾರಿತ್ರ್ಯ & 5 ಆಯಾಮಗಳ ಅಪರಾಧ ಮುಕ್ತತಾ ಪರೀಕ್ಷೆ" : "Moral Integrity & 5 Dimensions Audit"}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs ${scoreColor}`}>
                        {isKn ? shades.categoryTitleKn : shades.categoryTitleEn}
                      </span>
                    </div>

                    {/* 4 QUICK INTEGRITY BADGES */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                        !shades.legalBandhana.hasRisk ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-rose-50 border-rose-300 text-rose-950"
                      }`}>
                        <span className="text-base">{!shades.legalBandhana.hasRisk ? "🛡️" : "⚠️"}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{isKn ? "ನಾಗರಿಕ ಸತ್ಪ್ರಜೆ" : "Civic Standing"}</span>
                        <span className="text-[11px] font-black">{!shades.legalBandhana.hasRisk ? (isKn ? "ಕಾನೂನು ಪಾಲಕ" : "Law-Abiding") : (isKn ? "ಅಪರಾಧ ಎಚ್ಚರಿಕೆ" : "Criminal Risk")}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                        !shades.financialIntegrity.hasRisk ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-amber-50 border-amber-300 text-amber-950"
                      }`}>
                        <span className="text-base">{!shades.financialIntegrity.hasRisk ? "💎" : "🚨"}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{isKn ? "ಆರ್ಥಿಕ ಪ್ರಾಮಾಣಿಕತೆ" : "Wealth Integrity"}</span>
                        <span className="text-[11px] font-black">{!shades.financialIntegrity.hasRisk ? (isKn ? "ನ್ಯಾಯ ಸಂಪತ್ತು" : "Clean Wealth") : (isKn ? "ಚೋರ/ವಂಚನೆ ಯೋಗ" : "Fraud / Theft Risk")}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                        !shades.violenceAggression.hasRisk ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-rose-50 border-rose-300 text-rose-950"
                      }`}>
                        <span className="text-base">{!shades.violenceAggression.hasRisk ? "🕊️" : "⚡"}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{isKn ? "ಅಹಿಂಸಾ ಪ್ರವೃತ್ತಿ" : "Non-Violence"}</span>
                        <span className="text-[11px] font-black">{!shades.violenceAggression.hasRisk ? (isKn ? "ಅಹಿಂಸಾ ಧರ್ಮ" : "Ahimsa / Peaceful") : (isKn ? "ಹತ್ಯಾ/ಹಿಂಸಾ ಯೋಗ" : "Violent Assault")}</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                        currentDiagnosis?.accurateProfession?.code === "legal_judiciary"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-950"
                          : !shades.legalBandhana.hasRisk
                          ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                          : "bg-rose-50 border-rose-300 text-rose-950"
                      }`}>
                        <span className="text-base">{currentDiagnosis?.accurateProfession?.code === "legal_judiciary" ? "⚖️" : (!shades.legalBandhana.hasRisk ? "🕊️" : "🏛️")}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{isKn ? "ನ್ಯಾಯಾಂಗ ಸ್ಥಾನ" : "Legal Status"}</span>
                        <span className="text-[11px] font-black">
                          {currentDiagnosis?.accurateProfession?.code === "legal_judiciary"
                            ? (isKn ? "ಕೋರ್ಟ್ ಹೋರಾಟಗಾರ" : "Court Fighter")
                            : !shades.legalBandhana.hasRisk
                            ? (isKn ? "ಬಂಧನ ಮುಕ್ತ" : "Free of Custody")
                            : (isKn ? "ಬಂಧನ ಯೋಗ" : "Custody Confinement")}
                        </span>
                      </div>
                    </div>

                    {/* EMERALD CERTIFICATE OF PURITY */}
                    {isClean && (
                      <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 shadow-sm space-y-2.5 ring-1 ring-emerald-300">
                        <div className="flex items-center gap-2 text-emerald-950 font-black text-sm md:text-base">
                          <span className="text-xl">🛡️</span>
                          <span>
                            {isKn
                              ? "ಪರಿಶುದ್ಧ ಸತ್ಚಾರಿತ್ರ್ಯ & ಅಪರಾಧ-ಕಳಂಕ ಮುಕ್ತ ದೃಢೀಕರಣ (100% Free from Criminal / Deceptive Shadows)"
                              : "Certified 100% Free from Criminal & Deceptive Shadows"}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-900 leading-relaxed font-medium">
                          {isKn
                            ? shades.isChildShielded
                              ? "ಈ ಜಾತಕವು ಮಗುವಿನ ಜಾತಕವಾಗಿದ್ದು (14 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸು), ನೈಸರ್ಗಿಕ ಬಾಲ್ಯದ ಮುಗ್ಧತೆ ಹಾಗೂ ಸಾತ್ವಿಕತೆಯ ರಕ್ಷಣೆಯಲ್ಲಿದೆ. ಯಾವುದೇ ಅಪರಾಧ ಅಥವಾ ನಕಾರಾತ್ಮಕ ನೆರಳುಗಳಿಲ್ಲ."
                              : "ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಲಗ್ನ, ಲಗ್ನಾಧಿಪತಿ, ಚಂದ್ರ ಅಥವಾ 2ನೇ ಭಾವದ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ದೃಷ್ಟಿ / ಕೇಂದ್ರ ಶುಭ ಗ್ರಹಗಳ ಶ್ರೀರಕ್ಷೆ ಇರುವುದರಿಂದ (ಸರ್ವದೋಷ ವಿನಾಶನಃ), ಈ ಜಾತಕದಲ್ಲಿ ಕಳ್ಳತನ, ವಂಚನೆ, ಕ್ರಿಮಿನಲ್ ಚಟುವಟಿಕೆ, ಹಿಂಸಾ ಪ್ರವೃತ್ತಿ, ಜಾರತ್ವ ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದಂತಹ ಯಾವುದೇ ಕಳಂಕಗಳಿಲ್ಲ. ಇದು ಪರಿಶುದ್ಧ ನೈತಿಕ ಸತ್ಚಾರಿತ್ರ್ಯದ ಜಾತಕವಾಗಿದೆ."
                            : shades.categoryDescriptionEn}
                        </p>
                      </div>
                    )}

                    {/* QUANTITATIVE SCORE GAUGE */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <span>📊</span>
                          <span>{isKn ? "ನಕಾರಾತ್ಮಕ ನೆರಳುಗಳ ಪ್ರಮಾಣ ಸೂಚ್ಯಂಕ (Shadow Vulnerability Score):" : "Shadow Vulnerability Score:"}</span>
                        </span>
                        <span className="font-black text-sm md:text-base text-stone-900">
                          <span className={shades.overallScore <= 15 ? "text-emerald-700 font-extrabold" : shades.overallScore <= 35 ? "text-sky-700" : "text-amber-800"}>
                            {shades.overallScore}
                          </span>
                          <span className="text-stone-400 text-xs"> / 100</span>
                        </span>
                      </div>

                      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-700 ${progressGradient}`}
                          style={{ width: `${Math.max(4, shades.overallScore)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                        <span className="text-emerald-700 font-bold">0 - 15: ಪರಿಶುದ್ಧ (Purity)</span>
                        <span className="text-sky-700">16 - 35: ಸಾಮಾನ್ಯ (Mild)</span>
                        <span className="text-amber-700">36 - 60: ಎಚ್ಚರಿಕೆ (Caution)</span>
                        <span className="text-rose-700">61 - 100: ಗಂಭೀರ (Critical)</span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed pt-1 border-t border-stone-100">
                        {isKn ? shades.categoryDescriptionKn : shades.categoryDescriptionEn}
                      </p>
                    </div>

                    {/* 5 DIMENSIONS CARDS GRID */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>{isKn ? "5 ಶಾಸ್ತ್ರೀಯ ಆಯಾಮಗಳ ನಿಖರ ಪರಿಶೀಲನೆ (Brihat Parashara, Saravali & Raman Yogas):" : "5 Classical Dimensions Audit:"}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                        {dimensions.map((dim, idx) => {
                          const d = dim.data;
                          const isDimClean = !d.hasRisk || d.score <= 3;

                          return (
                            <div
                              key={d.id}
                              className={`p-5 rounded-2xl border-2 space-y-3 shadow-sm transition-all ${
                                idx === 4 ? "md:col-span-2" : ""
                              } ${
                                isDimClean
                                  ? "bg-white border-emerald-200 hover:border-emerald-400 ring-1 ring-emerald-100"
                                  : "bg-white border-rose-200 hover:border-rose-400 ring-1 ring-rose-100"
                              }`}
                            >
                              <div className={`flex items-center justify-between border-b pb-2 ${isDimClean ? "border-emerald-100" : "border-rose-100"}`}>
                                <span className={`font-black text-sm flex items-center gap-2 ${isDimClean ? "text-emerald-950" : "text-rose-950"}`}>
                                  <span className="text-lg">{dim.icon}</span>
                                  <span>{isKn ? d.titleKn : d.titleEn}</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                      isDimClean ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-rose-100 text-rose-900 border-rose-300"
                                    }`}
                                  >
                                    {isKn ? d.badgeKn : d.badgeEn}
                                  </span>
                                  <span className="text-[11px] font-bold text-stone-500">({d.score}/20)</span>
                                </div>
                              </div>

                              <p
                                className={`text-stone-800 leading-relaxed font-medium p-3 rounded-xl border ${
                                  isDimClean ? "bg-emerald-50/40 border-emerald-100" : "bg-rose-50/40 border-rose-100"
                                }`}
                              >
                                "{cleanAstrologyText(isKn ? d.analysisKn : d.analysisEn)}"
                              </p>

                              <div className="text-[11px] text-amber-950 flex items-center gap-1.5 px-1 font-semibold">
                                <span>🎯</span>
                                <span>
                                  <b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b>{" "}
                                  {cleanAstrologyText(isKn ? d.astrologicalBasisKn : d.astrologicalBasisEn)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* REAL-TIME PLANETARY & PANCHANGA TRIGGERS */}
                    <div className="bg-amber-50/70 rounded-2xl border border-amber-300 p-4 md:p-5 space-y-3">
                      <div className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>{isKn ? "ನೈಜ-ಸಮಯದ ಗೋಚಾರ, ದಶಾ ಪ್ರಚೋದನೆ & ಪಂಚಾಂಗ 5-ಅಂಗ ಪ್ರಭಾವ:" : "Real-time Gochara, Dasha & Panchanga Root Influence:"}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                          <span className="font-bold text-amber-900 block">⏳ {isKn ? "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ:" : "Active Dasha-Bhukti Influence:"}</span>
                          <p className="text-stone-700 leading-relaxed">
                            {cleanAstrologyText(isKn ? shades.activeDashaTriggerKn : shades.activeDashaTriggerEn)}
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                          <span className="font-bold text-amber-900 block">🪐 {isKn ? "ಪ್ರಸ್ತುತ ಗ್ರಹ ಗೋಚಾರ ಸಂಚಾರ:" : "Live Gochara Transit Status:"}</span>
                          <p className="text-stone-700 leading-relaxed">
                            {cleanAstrologyText(isKn ? shades.activeGocharaTriggerKn : shades.activeGocharaTriggerEn)}
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1 md:col-span-2">
                          <span className="font-bold text-amber-900 block">
                            🕉️ {isKn ? "ಪಂಚಾಂಗ 5-ಅಂಗ ಮೂಲ ಪ್ರಭಾವ (ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ):" : "Panchanga 5-Anga Root Influence:"}
                          </span>
                          <p className="text-stone-700 leading-relaxed">
                            {cleanAstrologyText(isKn ? shades.panchangaInfluenceKn : shades.panchangaInfluenceEn)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* GOKARNA SHANTRIC PRAYASHCHITTA */}
                    <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/80 p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                        <span>🪔</span>
                        <span>{isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷಾ ಕವಚ & ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗ:" : "Gokarna Kshetra Shastric Protection & Remedial Strategy:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {cleanAstrologyText(isKn ? shades.protectionRemedyKn : shades.protectionRemedyEn)}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 🌟 3. 11 MASTER ASTROLOGICAL LIFE REVELATIONS (11 ಪ್ರಮುಖ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯಾಂಶಗಳು) 🌟 */}
          {synthesisData?.tenLifeAspectBullets && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 text-2xl shadow-md border border-amber-300">
                    👑
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ದರ್ಶನ ॥
                    </span>
                    <h3 className="text-base md:text-xl font-black text-amber-950 font-serif">
                      {isKn
                        ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ, ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿ) ${synthesisData.tenLifeAspectBullets.length} ಪ್ರಮುಖ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯಾಂಶಗಳು`
                        : `${session.input.name ? `${session.input.name}'s ` : ""}(${session.result.lagnaRashi.english} Asc, ${session.result.moonSign.english} Moon) ${synthesisData.tenLifeAspectBullets.length} Master Astrological Life Revelations`}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black border border-amber-400 shadow-sm">
                    {isKn ? "100% ನೈಜ ಜಾತಕ ಫಲಿತ" : "100% Dynamic Vedic Truth"}
                  </span>
                </div>
              </div>

              {/* Dynamic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                {synthesisData.tenLifeAspectBullets.map((bullet) => {
                  const isCleanCard11 = bullet.id === 11 && bullet.doshaSpecifics && !bullet.doshaSpecifics.hasDosha;

                  return (
                    <div
                      key={bullet.id}
                      className={`p-5 rounded-2xl border-2 space-y-3 shadow-md transition-all ${
                        bullet.id === 1 || bullet.id === 10 || bullet.id === 11
                          ? isCleanCard11
                            ? "md:col-span-2 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/90 border-emerald-400 ring-1 ring-emerald-300"
                            : "md:col-span-2 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-amber-400 ring-1 ring-amber-300"
                          : bullet.doshaSpecifics?.hasDosha
                          ? "bg-white border-rose-300 ring-1 ring-rose-200"
                          : "bg-white border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className={`flex items-center justify-between border-b pb-2.5 ${isCleanCard11 ? "border-emerald-100" : "border-amber-100"}`}>
                        <span className={`font-black text-sm flex items-center gap-2 ${isCleanCard11 ? "text-emerald-950" : "text-amber-950"}`}>
                          <span className="text-lg">{bullet.icon}</span>
                          <span>{bullet.id}. {isKn ? bullet.titleKn : bullet.titleEn}</span>
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isCleanCard11 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}>
                          {isKn ? bullet.badgeKn : bullet.badgeEn}
                        </span>
                      </div>

                      {/* READING BODY */}
                      <p className={`text-stone-800 leading-relaxed font-medium p-3.5 rounded-xl border ${
                        isCleanCard11 ? "bg-emerald-50/60 border-emerald-200/60" : "bg-amber-50/60 border-amber-200/60"
                      }`}>
                        "{cleanAstrologyText(isKn ? bullet.readingKn : bullet.readingEn)}"
                      </p>

                      {/* ASTROLOGICAL FOUNDATION FOOTER */}
                      <div className="text-[11px] text-amber-900 flex items-center gap-1.5 px-1 font-semibold">
                        <span>🎯</span>
                        <span><b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b> {cleanAstrologyText(isKn ? bullet.astrologicalBasisKn : bullet.astrologicalBasisEn)}</span>
                      </div>

                      {/* DEDICATED DOSHA & REMEDY BOX IF AFFLICTED */}
                      {bullet.doshaSpecifics?.hasDosha && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 space-y-2 text-xs text-stone-800 shadow-sm">
                          <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
                            <span className="text-rose-900 font-black text-xs flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>{isKn ? "ನಿರ್ದಿಷ್ಟ ದೋಷ:" : "Detected Dosha:"} {isKn ? bullet.doshaSpecifics.doshaNameKn : bullet.doshaSpecifics.doshaNameEn}</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-bold">
                              {isKn ? "ಪರಿಹಾರ ಅಗತ್ಯ" : "Remedy Recommended"}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <p><b>{isKn ? "ಮೂಲ ಕಾರಣ & ಸ್ಥಾನ:" : "Root Cause & House:"}</b> {isKn ? bullet.doshaSpecifics.rootCauseHouseKn : bullet.doshaSpecifics.rootCauseHouseEn} ({isKn ? bullet.doshaSpecifics.afflictedPlanetKn : bullet.doshaSpecifics.afflictedPlanetEn})</p>
                            <p className="text-amber-900"><b>{isKn ? "ದೈವಿಕ ಬೀಜ ಮಂತ್ರ:" : "Beeja Mantra:"}</b> {isKn ? bullet.doshaSpecifics.mantraKn : bullet.doshaSpecifics.mantraEn}</p>
                            <p className="text-emerald-900"><b>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪೂಜೆ:" : "Gokarna Kshetra Pooja:"}</b> {isKn ? bullet.doshaSpecifics.pujaKn : bullet.doshaSpecifics.pujaEn}</p>
                          </div>
                        </div>
                      )}

                      {/* DEDICATED BLESSING BOX IF DOSHA FREE & VIRTUOUS */}
                      {bullet.doshaSpecifics && !bullet.doshaSpecifics.hasDosha && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-xs text-stone-800 shadow-sm">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                            <span className="text-emerald-900 font-black text-xs flex items-center gap-1.5">
                              <span>✨</span>
                              <span>{isKn ? "ಸದಾಚಾರ & ಶುಭ ರಕ್ಷಣೆ:" : "Virtuous Protection:"} {isKn ? bullet.doshaSpecifics.doshaNameKn : bullet.doshaSpecifics.doshaNameEn}</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-bold">
                              {isKn ? "ದೋಷ ಮುಕ್ತ" : "Dosha Free"}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <p><b>{isKn ? "ಶುಭ ಗ್ರಹ ಕವಚ & ಸ್ಥಾನ:" : "Benefic Aspect & House:"}</b> {isKn ? bullet.doshaSpecifics.rootCauseHouseKn : bullet.doshaSpecifics.rootCauseHouseEn} ({isKn ? bullet.doshaSpecifics.afflictedPlanetKn : bullet.doshaSpecifics.afflictedPlanetEn})</p>
                            <p className="text-amber-900"><b>{isKn ? "ದೈವಿಕ ಅನುಗ್ರಹ ಮಂತ್ರ:" : "Auspicious Mantra:"}</b> {isKn ? bullet.doshaSpecifics.mantraKn : bullet.doshaSpecifics.mantraEn}</p>
                            <p className="text-emerald-900"><b>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆಶೀರ್ವಾದ:" : "Gokarna Kshetra Blessing:"}</b> {isKn ? bullet.doshaSpecifics.pujaKn : bullet.doshaSpecifics.pujaEn}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. ONE-TAP CATEGORIZED QUESTIONS (INSTANT CLIENT Q&A CARDS) */}
          <div className="rounded-3xl border border-indigo-200 bg-white p-6 md:p-8 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100 gap-2">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider block">
                  {isKn
                    ? `॥ ${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ • ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗಳು ॥`
                    : `॥ ${session.input.name || "Native"} ${session.result.lagnaRashi.english} Asc • ${session.result.moonSign.english} Moon Specific Questions ॥`}
                </span>
                <h3 className="text-base md:text-lg font-black text-indigo-950 font-serif">
                  {isKn
                    ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ) ತ್ವರಿತ ಪ್ರಶ್ನೋತ್ತರ ಪಟ್ಟಿ (ಪ್ರಶ್ನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಉತ್ತರ ಪಡೆಯಿರಿ)`
                    : `${session.input.name ? `${session.input.name}'s ` : ""}(${session.result.lagnaRashi.english} Ascendant) 1-Click Instant Astrological Answers`}
                </h3>
              </div>

              {/* CATEGORY FILTER TABS */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: isKn ? "ಎಲ್ಲವೂ" : "All" },
                  { id: "career", label: isKn ? "💼 ಉದ್ಯೋಗ" : "Career" },
                  { id: "marriage", label: isKn ? "💍 ವಿವಾಹ" : "Marriage" },
                  { id: "children", label: isKn ? "👶 ಸಂತಾನ" : "Children" },
                  { id: "mind", label: isKn ? "🧠 ಮನಸ್ಸು" : "Mind" },
                  { id: "wealth", label: isKn ? "💰 ಆರ್ಥಿಕತೆ" : "Wealth" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeCategory === tab.id
                        ? "bg-indigo-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QUESTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredQA.map((qa) => (
                <div
                  key={qa.id}
                  onClick={() => setSelectedQA(selectedQA?.id === qa.id ? null : qa)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedQA?.id === qa.id
                      ? "border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {qa.categoryLabelKn}
                    </span>
                    <span className="text-xs font-bold text-amber-800">
                      {selectedQA?.id === qa.id ? "▲ ಮರೆಮಾಡಿ" : "▼ ಉತ್ತರ ನೋಡಿ"}
                    </span>
                  </div>

                  <h4 className="text-xs md:text-sm font-black text-indigo-950 mt-2">
                    {qa.questionKn}
                  </h4>

                  {selectedQA?.id === qa.id && (
                    <div className="mt-3 pt-3 border-t border-amber-200 space-y-2.5 animate-fade-in text-xs">
                      <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-200/80 text-amber-950">
                        <b className="block text-[11px] uppercase tracking-wider text-amber-900 mb-1">
                          🗣️ ದೈವಜ್ಞರ ನೇರ ಮಾತು (Say to Devotee):
                        </b>
                        <div className="leading-relaxed font-medium space-y-2 text-amber-950">
                          {cleanAstrologyText(qa.panditScriptKn)
                            .split("\n\n")
                            .map((pText, pIdx) => (
                              <p key={pIdx} className="leading-relaxed">{pText}</p>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700">
                          <b>ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:</b> {cleanAstrologyText(qa.astrologicalBasisKn)}
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950">
                          <b>ತಕ್ಷಣದ ಪರಿಹಾರ:</b> {cleanAstrologyText(qa.immediateRemedyKn)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. 5-ANGAS UNIFIED PRESCRIPTION HUB (RUDRAKSHA, GEMSTONE RING, CAR/CLOTH COLORS) */}
          {prescriptions && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    ॥ ಪಂಚಾಂಗ ಸಮಗ್ರ ರಕ್ಷಾ ಕವಚ ॥
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-amber-950 font-serif">
                    {isKn
                      ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ) ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣಗಳು`
                      : `${session.input.name ? `${session.input.name}'s ` : ""}(${session.result.lagnaRashi.english} Ascendant) Prescriptions (Gems, Rudraksha & Colors)`}
                  </h3>
                </div>
                <span className="text-2xl">💍</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RUDRAKSHA */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <span>📿</span>
                    <span>{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ರುದ್ರಾಕ್ಷಿ:" : "Prescribed Rudraksha:"} <b className="text-indigo-950 text-base">{prescriptions.rudraksha.nameKn}</b></span>
                  </div>
                  <p className="text-xs text-stone-600">
                    <b>ದೇವತೆ:</b> {isKn ? toKannadaDeity(prescriptions.rudraksha.deity) : prescriptions.rudraksha.deity} • <b>ಅಧಿಪತಿ ಗ್ರಹ:</b> {isKn ? toKannadaPlanet(prescriptions.rudraksha.planet) : prescriptions.rudraksha.planet}
                  </p>
                  <p className="text-xs text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                    💡 <b>ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:</b> {cleanAstrologyText(prescriptions.rudraksha.astrologicalReason)}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    ✨ <b>ಪಂಚಾಂಗ ಸಮನ್ವಯ:</b> {cleanAstrologyText(prescriptions.rudraksha.panchangaSynergy)}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    <b>ಧರಿಸುವ ಕ್ರಮ:</b> {cleanAstrologyText(prescriptions.rudraksha.wearingMethod)}
                  </p>
                </div>

                {/* GEMSTONE RING */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <span>💍</span>
                    <span>{isKn ? "ಭಾಗ್ಯ ರತ್ನ ಉಂಗುರ:" : "Prescribed Gemstone Ring:"} <b className="text-indigo-950 text-base">{prescriptions.gemstoneRing.primaryGemstoneKn}</b></span>
                  </div>
                  <p className="text-xs text-stone-600">
                    <b>ತೂಕ:</b> {prescriptions.gemstoneRing.caratWeight} • <b>ಲೋಹ:</b> {prescriptions.gemstoneRing.metalKn}
                  </p>
                  <p className="text-xs text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                    💡 <b>ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:</b> {cleanAstrologyText(prescriptions.gemstoneRing.astrologicalReason)}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    ✨ <b>ಪಂಚಾಂಗ ಸಮನ್ವಯ:</b> {cleanAstrologyText(prescriptions.gemstoneRing.panchangaSynergy)}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    <b>ಬೆರಳು & ಶುಭ ವಾರ:</b> {cleanAstrologyText(prescriptions.gemstoneRing.fingerKn)} ({prescriptions.gemstoneRing.activationDay})
                  </p>
                </div>
              </div>

              {/* LUCKY COLORS & ATTRIBUTES */}
              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚗</span>
                  <span>{isKn ? "ಅದೃಷ್ಟ ವಾಹನ (ಕಾರು/ಬೈಕ್), ವಸ್ತ್ರ ಬಣ್ಣಗಳು & ದಿಕ್ಕುಗಳು" : "Lucky Vehicle & Garment Colors & Directions"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣ</span>
                    <span className="font-black text-indigo-950">{isKn ? prescriptions.luckyAttributes.carColors.map(toKannadaColor).join(", ") : prescriptions.luckyAttributes.carColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ಅದೃಷ್ಟ ವಸ್ತ್ರ ಬಣ್ಣ</span>
                    <span className="font-black text-emerald-900">{isKn ? prescriptions.luckyAttributes.clothColors.map(toKannadaColor).join(", ") : prescriptions.luckyAttributes.clothColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ವರ್ಜಿಸಬೇಕಾದ ಬಣ್ಣ</span>
                    <span className="font-black text-rose-800">{isKn ? prescriptions.luckyAttributes.avoidColors.map(toKannadaColor).join(", ") : prescriptions.luckyAttributes.avoidColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ಅದೃಷ್ಟ ದಿಕ್ಕು & ಸಂಖ್ಯೆ</span>
                    <span className="font-black text-amber-900">{isKn ? prescriptions.luckyAttributes.directions.map(toKannadaDirection).join(", ") : prescriptions.luckyAttributes.directions.join(", ")} ({isKn ? "ಸಂಖ್ಯೆ" : "No."}: {prescriptions.luckyAttributes.numbers.join(", ")})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4.5 DESTINY CATALYSTS & LUCKY/UNLUCKY AUDIT HUB */}
          {destinyCatalysts && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/95 via-white to-amber-50/60 p-6 md:p-8 shadow-xl space-y-7">
              {/* HEADER WITH BADGE, TITLE, AUDIO & 5-TAB CONTROLLER */}
              <div className="border-b border-amber-200 pb-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      ॥ ಭಾಗ್ಯೋದಯದ ರಹಸ್ಯ & ಅದೃಷ್ಟ-ದುರದೃಷ್ಟ ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ (LUCKY & UNLUCKY AUDIT) ॥
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-amber-950 font-serif">
                      {isKn
                        ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} ಅದೃಷ್ಟದ ರಹಸ್ಯ, ದುರದೃಷ್ಟ ಎಚ್ಚರಿಕೆಗಳು & ಸಮಗ್ರ ಸಾಧನಗಳ ಪಟ್ಟಿ`
                        : `${session.input.name ? `${session.input.name}'s ` : ""}Complete Lucky & Unlucky Audit, Destiny Catalysts & Protective Shield`}
                    </h3>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      {isKn
                        ? "ಯಾವ ಅಂಶಗಳು ಅದೃಷ್ಟ ತರುತ್ತವೆ • ಯಾವ ವಿಚಾರಗಳಲ್ಲಿ ದುರದೃಷ್ಟ ಕಾಡಬಹುದು • ಜನ್ಮ ಕುಂಡಲಿ, ಗೋಚಾರ & ದಶಾಭುಕ್ತಿ ಕಾರಣಗಳು • ನೈಜ ಜೀವನದ ಉದಾಹರಣೆಗಳು • ವರ್ಜ್ಯ & ರಕ್ಷಾ ಕವಚ"
                        : "What triggers luck • What triggers misfortune • Astrological root causes (Natal, Transit, Dasha) • Real-life scenarios • Avoid matrix & Gokarna shield"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const luckAudit = destinyCatalysts.luckAudit;
                        const unluckyAudit = destinyCatalysts.unluckyAudit;
                        const text = isKn
                          ? `ಭಾಗ್ಯೋದಯದ ರಹಸ್ಯ ಮತ್ತು ಅದೃಷ್ಟ-ದುರದೃಷ್ಟ ಸಮಗ್ರ ಲೆಕ್ಕಾಚಾರ. ಮೊದಲನೆಯದಾಗಿ, ಜಾತಕನಿಗೆ ಯಾವ ಅಂಶಗಳು ಅದೃಷ್ಟ ತರುತ್ತವೆ: ${luckAudit?.whyFeelingLucky.overviewKn || destinyCatalysts.whyLuckUnlocksNow.explanationKn}. ಯೋಗಕಾರಕ ರತ್ನ ${destinyCatalysts.gemstoneRingCatalyst.yogakarakaGemstoneKn} ಮತ್ತು ಕಳತ್ರ ಭಾಗ್ಯೋದಯ ${destinyCatalysts.marriageBhagya.detailedExplanationKn}. ಎರಡನೆಯದಾಗಿ, ಯಾವ ವಿಚಾರಗಳಲ್ಲಿ ದುರದೃಷ್ಟ ಕಾಡಬಹುದು: ${unluckyAudit?.whyFeelingUnlucky.overviewKn || destinyCatalysts.whyFeltUnlucky.explanationKn}. ಜಾತಕದಲ್ಲಿ ದುರದೃಷ್ಟ ಕಾಡಲು ಜನ್ಮ ಕುಂಡಲಿಯ ಕಾರಣ: ${unluckyAudit?.whyFeelingUnlucky.janmaKundliCauseKn || destinyCatalysts.whyFeltUnlucky.astrologicalReasonKn}. ಪ್ರಸ್ತುತ ಗೋಚಾರ ಪ್ರಭಾವ: ${unluckyAudit?.whyFeelingUnlucky.gocharaTransitCauseKn || "ಗೋಚಾರ ಶನಿ ಪ್ರಭಾವ"}. ಪ್ರಸ್ತುತ ದಶಾಭುಕ್ತಿ ಪ್ರಭಾವ: ${unluckyAudit?.whyFeelingUnlucky.dashaBhuktiCauseKn || "ದಶಾಭುಕ್ತಿ ಪ್ರಭಾವ"}. ಮೂರನೆಯದಾಗಿ, ದುರದೃಷ್ಟದ ನೈಜ ಉದಾಹರಣೆ: 99% ರವರೆಗೆ ಬಂದ ಕೆಲಸ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಮುಗ್ಗರಿಸುವುದು ಮತ್ತು ಕೈಸಾಲ ಅಥವಾ ಜಾಮೀನು ನಿಂತು ನಷ್ಟ ಅನುಭವಿಸುವುದು. ನಾಲ್ಕನೆಯದಾಗಿ, ಎಚ್ಚರಿಕೆ ಹಾಗೂ ವರ್ಜ್ಯ ಸಾಧನಗಳು: ಶಡಾಷ್ಟಕ ಅಶುಭ ರಾಶಿಗಳು ${unluckyAudit?.unluckyMatrix?.inimicalRashisKn?.join(", ") || "ವರ್ಜ್ಯ ರಾಶಿಗಳು"}. ಅಶುಭ ದಿನಗಳು ${unluckyAudit?.unluckyMatrix?.unluckyDaysKn?.join(", ") || "ಮಂಗಳವಾರ"}. ಐದನೆಯದಾಗಿ, ಅದೃಷ್ಟ ಸಾಧನಗಳು: ಭಾಗ್ಯೋದಯ ವಯಸ್ಸು ${destinyCatalysts.luckyMatrix.ageOfAwakeningKn}. ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು ${destinyCatalysts.luckyMatrix.luckyNumbers.join(", ")}. ಪರಿಹಾರ ಕ್ಷೇತ್ರ: ${destinyCatalysts.spiritualTempleCatalyst.templeKn}. ರಕ್ಷಾ ಪರಿಹಾರ: ${unluckyAudit?.unluckyRemediesAndShields?.protectiveKshetraKn || destinyCatalysts.spiritualTempleCatalyst.remedyDetailsKn}.`
                          : `Complete Destiny Blueprint, Lucky and Unlucky Audit. First, what makes you lucky: ${luckAudit?.whyFeelingLucky.overviewEn || destinyCatalysts.whyLuckUnlocksNow.explanationEn}. Yogakaraka gemstone is ${destinyCatalysts.gemstoneRingCatalyst.yogakarakaGemstoneEn}. Second, what and all can trigger bad luck: ${unluckyAudit?.whyFeelingUnlucky.overviewEn || destinyCatalysts.whyFeltUnlucky.explanationEn}. Astrological root causes: Natal factor: ${unluckyAudit?.whyFeelingUnlucky.janmaKundliCauseEn || destinyCatalysts.whyFeltUnlucky.astrologicalReasonEn}. Live transit factor: ${unluckyAudit?.whyFeelingUnlucky.gocharaTransitCauseEn || "Saturn transit"}. Running dasha factor: ${unluckyAudit?.whyFeelingUnlucky.dashaBhuktiCauseEn || "Dasha transit"}. Third, real-life unlucky examples: 99% finish line stall and compassion loan guarantee entrapment. Fourth, inimical signs to avoid: ${unluckyAudit?.unluckyMatrix?.inimicalRashisEn?.join(", ") || "Inimical signs"}. Avoid days: ${unluckyAudit?.unluckyMatrix?.unluckyDaysEn?.join(", ") || "Tuesday"}. Fifth, lucky charms: Awakening age ${destinyCatalysts.luckyMatrix.ageOfAwakening}. Lucky numbers ${destinyCatalysts.luckyMatrix.luckyNumbers.join(", ")}. Temple remedy: ${destinyCatalysts.spiritualTempleCatalyst.templeEn}. Gokarna protection shield: ${unluckyAudit?.unluckyRemediesAndShields?.protectiveKshetraEn || destinyCatalysts.spiritualTempleCatalyst.remedyDetailsEn}.`;
                        handlePlayTalkingPoint("destiny_catalysts", text);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                        playingPointKey === "destiny_catalysts"
                          ? "bg-amber-600 text-white animate-pulse"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300"
                      }`}
                      title={isKn ? "ಅದೃಷ್ಟ ಮತ್ತು ದುರದೃಷ್ಟ ವಿವರಗಳನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ" : "Listen to Lucky & Unlucky Audit"}
                    >
                      <span>{playingPointKey === "destiny_catalysts" ? "🔊 ನಿಲ್ಲಿಸಿ" : "🎙️ ಧ್ವನಿ ವಿವರಣೆ"}</span>
                    </button>
                    <span className="text-2xl">✨</span>
                  </div>
                </div>

                {/* 5-TAB PILL SWITCHER */}
                <div className="flex flex-wrap items-center gap-1.5 bg-amber-100/90 p-1.5 rounded-2xl border border-amber-300 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setDestinyAuditTab("all")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      destinyAuditTab === "all"
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "text-amber-900 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "ಎಲ್ಲವೂ (All)" : "All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinyAuditTab("lucky")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      destinyAuditTab === "lucky"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-emerald-950 hover:bg-emerald-100/60"
                    }`}
                  >
                    {isKn ? "🌟 1. ಅದೃಷ್ಟ ಲೆಕ್ಕಾಚಾರ (Luck)" : "🌟 1. Luck Audit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinyAuditTab("unlucky")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      destinyAuditTab === "unlucky"
                        ? "bg-rose-700 text-white shadow-xs"
                        : "text-rose-950 hover:bg-rose-100/60"
                    }`}
                  >
                    {isKn ? "⚡ 2. ದುರದೃಷ್ಟ ಎಚ್ಚರಿಕೆಗಳು (Unluck)" : "⚡ 2. Unluck Triggers"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinyAuditTab("examples")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      destinyAuditTab === "examples"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-indigo-950 hover:bg-indigo-100/60"
                    }`}
                  >
                    {isKn ? "📖 3. ನೈಜ ಉದಾಹರಣೆಗಳು (Real Scenarios)" : "📖 3. Real Scenarios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinyAuditTab("matrix")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      destinyAuditTab === "matrix"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-amber-950 hover:bg-amber-200/60"
                    }`}
                  >
                    {isKn ? "🛡️ 4. ಸಾಧನಗಳು & ರಕ್ಷಾ ಕವಚ (Charms & Shield)" : "🛡️ 4. Charms & Shield"}
                  </button>
                </div>
              </div>

              {/* PILLAR 1: WHAT MAKES YOU LUCKY? (LUCK AUDIT & DESTINY CATALYSTS) */}
              {(destinyAuditTab === "all" || destinyAuditTab === "lucky") && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-black text-emerald-950 bg-emerald-100/90 px-3 py-1 rounded-xl border border-emerald-300">
                      🌟 1. {isKn ? "ಯಾವ ಅಂಶಗಳು ಜಾತಕನಿಗೆ ನಿಖರ ಅದೃಷ್ಟ ತರುತ್ತವೆ? (Luck Audit & Catalysts)" : "1. What Will Make You Lucky? (Luck Audit & Catalysts)"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                      {isKn ? "(ರತ್ನ, ಕಳತ್ರ, ಪುತ್ರಿ, ಪರಸ್ಥಳ, ನಾಮಾಕ್ಷರ ಕಂಪನ & ಭಾಗ್ಯೋದಯ ಸ್ತಂಭಗಳು)" : "(Gemstone, Marriage, Daughter, Relocation & Fortune Pillars)"}
                    </span>
                  </div>

                  {/* LUCK AUDIT HERO SUMMARY BANNER */}
                  {destinyCatalysts.luckAudit && (
                    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50/70 to-emerald-50 border-2 border-emerald-300 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-black text-emerald-950">
                          ☀️ {isKn ? destinyCatalysts.luckAudit.whyFeelingLucky.titleKn : destinyCatalysts.luckAudit.whyFeelingLucky.titleEn}
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                          {isKn ? "ಸುಪ್ತ ಭಾಗ್ಯೋದಯ" : "Fortune Catalysts"}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn ? destinyCatalysts.luckAudit.whyFeelingLucky.overviewKn : destinyCatalysts.luckAudit.whyFeelingLucky.overviewEn}
                      </p>
                      <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-xs text-emerald-950 font-semibold leading-relaxed space-y-1.5">
                        <div>
                          <b>✨ {isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ಭಾಗ್ಯ ಬಲ:" : "Janma Kundli Grace:"}</b>{" "}
                          {isKn ? destinyCatalysts.luckAudit.whyFeelingLucky.janmaKundliGraceKn : destinyCatalysts.luckAudit.whyFeelingLucky.janmaKundliGraceEn}
                        </div>
                        <div>
                          <b>🪐 {isKn ? "ಗೋಚಾರ & ದಶಾಭುಕ್ತಿ ಅನುಗ್ರಹ:" : "Transit & Dasha Grace:"}</b>{" "}
                          {isKn
                            ? `${destinyCatalysts.luckAudit.whyFeelingLucky.gocharaTransitGraceKn} • ${destinyCatalysts.luckAudit.whyFeelingLucky.dashaBhuktiGraceKn}`
                            : `${destinyCatalysts.luckAudit.whyFeelingLucky.gocharaTransitGraceEn} • ${destinyCatalysts.luckAudit.whyFeelingLucky.dashaBhuktiGraceEn}`}
                        </div>
                      </div>

                      {/* PRIMARY LUCKY CATALYSTS TAGS */}
                      {destinyCatalysts.luckAudit.primaryLuckyCatalystsKn && destinyCatalysts.luckAudit.primaryLuckyCatalystsKn.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-emerald-950">
                            {isKn ? "ಮುಖ್ಯ ಅದೃಷ್ಟ ಸಾಧನಗಳು:" : "Primary Catalysts:"}
                          </span>
                          {(isKn ? destinyCatalysts.luckAudit.primaryLuckyCatalystsKn : destinyCatalysts.luckAudit.primaryLuckyCatalystsEn).map((cat, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-900">
                              ✓ {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. GEMSTONE RING CATALYST */}
                    <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                            <span>💍</span>
                            <span>{isKn ? "ಯೋಗಕಾರಕ ರತ್ನ & ಉಂಗುರ:" : "Gemstone & Ring Catalyst:"}</span>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? "ಲಗ್ನ & ಕರ್ಮ ಬಲ" : "Yogakaraka Force"}
                          </span>
                        </div>
                        <div className="text-xs text-stone-700 space-y-1">
                          <p>
                            <b>{isKn ? "ಮುಖ್ಯ ಯೋಗಕಾರಕ ರತ್ನ:" : "Primary Gem:"}</b>{" "}
                            <span className="font-black text-indigo-950 text-sm">
                              {isKn ? destinyCatalysts.gemstoneRingCatalyst.yogakarakaGemstoneKn : destinyCatalysts.gemstoneRingCatalyst.yogakarakaGemstoneEn}
                            </span>
                          </p>
                          <p>
                            <b>{isKn ? "ಭಾಗ್ಯ ರತ್ನ ಪರ್ಯಾಯ:" : "Bhagya Gem Alternative:"}</b>{" "}
                            <span className="font-semibold text-amber-950">
                              {isKn ? destinyCatalysts.gemstoneRingCatalyst.bhagyaGemstoneKn : destinyCatalysts.gemstoneRingCatalyst.bhagyaGemstoneEn}
                            </span>
                          </p>
                          <p className="text-[11px] text-stone-600">
                            <b>{isKn ? "ಧಾರಣೆ ಬೆರಳು & ಲೋಹ:" : "Finger & Metal:"}</b>{" "}
                            {isKn ? destinyCatalysts.gemstoneRingCatalyst.prescribedRingFingerKn : destinyCatalysts.gemstoneRingCatalyst.prescribedRingFingerEn} •{" "}
                            {isKn ? destinyCatalysts.gemstoneRingCatalyst.prescribedMetalKn : destinyCatalysts.gemstoneRingCatalyst.prescribedMetalEn}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-amber-950 bg-amber-50/90 p-2.5 rounded-xl border border-amber-100 leading-relaxed mt-2">
                        ⚡ <b>{isKn ? "ಅದೃಷ್ಟದ ಪ್ರಭಾವ:" : "Catalytic Impact:"}</b>{" "}
                        {isKn ? destinyCatalysts.gemstoneRingCatalyst.catalyticImpactKn : destinyCatalysts.gemstoneRingCatalyst.catalyticImpactEn}
                      </p>
                    </div>

                    {/* 2. MARRIAGE BHAGYA (KALATRA BHAGYA) */}
                    <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                            <span>💑</span>
                            <span>{isKn ? "ವಿವಾಹದ ನಂತರ ಭಾಗ್ಯೋದಯ:" : "Post-Marriage Fortune:"}</span>
                          </div>
                          <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? destinyCatalysts.marriageBhagya.bhagyaIntensityKn : destinyCatalysts.marriageBhagya.bhagyaIntensityEn}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">
                          <b>{isKn ? "ಸಕ್ರಿಯ ವಯೋಮಾನ:" : "Activation Phase:"}</b>{" "}
                          <span className="text-stone-900 font-semibold">
                            {isKn ? destinyCatalysts.marriageBhagya.activationAgeRangeKn : destinyCatalysts.marriageBhagya.activationAgeRangeEn}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-rose-950 bg-rose-50/80 p-2.5 rounded-xl border border-rose-100 leading-relaxed mt-2">
                        🌺 <b>{isKn ? "ಕಳತ್ರ ಭಾಗ್ಯ ರಹಸ್ಯ:" : "Spouse Catalyst:"}</b>{" "}
                        {isKn ? destinyCatalysts.marriageBhagya.detailedExplanationKn : destinyCatalysts.marriageBhagya.detailedExplanationEn}
                      </p>
                    </div>

                    {/* 3. DAUGHTER BHAGYA (GRIHALAKSHMI YOGA) */}
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                            <span>👧</span>
                            <span>{isKn ? "ಪುತ್ರಿ ಭಾಗ್ಯ & ಗೃಹಲಕ್ಷ್ಮಿ:" : "Daughter Grace (Grihalakshmi):"}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? "ಗೃಹಲಕ್ಷ್ಮೀ ಯೋಗ ಸಕ್ರಿಯ" : "Grihalakshmi Active"}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-950 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                          ✨ <b>{isKn ? "ಲಕ್ಷ್ಮೀ ಆಗಮನ ಫಲ:" : "Lakshmi Impact:"}</b>{" "}
                          {isKn ? destinyCatalysts.daughterBhagya.lakshmiArrivalImpactKn : destinyCatalysts.daughterBhagya.lakshmiArrivalImpactEn}
                        </p>
                      </div>
                      <p className="text-[11px] text-stone-500 pt-1 border-t border-emerald-100">
                        <b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b>{" "}
                        {isKn ? destinyCatalysts.daughterBhagya.astrologicalBasisKn : destinyCatalysts.daughterBhagya.astrologicalBasisEn}
                      </p>
                    </div>

                    {/* 4. RELOCATION BHAGYA (DESHANTARA BHAGYA) */}
                    <div className="p-4 rounded-2xl bg-white border border-cyan-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-cyan-900 font-bold text-sm">
                            <span>✈️</span>
                            <span>{isKn ? "ವಿದೇಶ & ಪರಸ್ಥಳ ಭಾಗ್ಯ:" : "Relocation & Distant City:"}</span>
                          </div>
                          <span className="text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? "ದೇಶಾಂತರ ಭಾಗ್ಯ ಸಕ್ರಿಯ" : "Deshantara Active"}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-950 bg-cyan-50/80 p-2.5 rounded-xl border border-cyan-100 leading-relaxed">
                          🌍 <b>{isKn ? "ಪರಸ್ಥಳದಲ್ಲಿ ಮಹಾ ಉನ್ನತಿ:" : "Distant Base Catalyst:"}</b>{" "}
                          {isKn ? destinyCatalysts.relocationBhagya.explanationKn : destinyCatalysts.relocationBhagya.explanationEn}
                        </p>
                      </div>
                      <p className="text-[11px] text-cyan-900 font-semibold pt-1 border-t border-cyan-100">
                        🧭 <b>{isKn ? "ಅನುಕೂಲಕರ ದಿಕ್ಕುಗಳು:" : "Favorable Directions:"}</b>{" "}
                        {isKn ? destinyCatalysts.relocationBhagya.favorableDirectionsKn : destinyCatalysts.relocationBhagya.favorableDirectionsEn}
                      </p>
                    </div>

                    {/* 5. NAME SOUND VIBRATION */}
                    <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                            <span>🔤</span>
                            <span>{isKn ? "ನಾಮಾಕ್ಷರ ಕಂಪನ & ಧ್ವನಿ:" : "Name Frequency Tuning:"}</span>
                          </div>
                          <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? `ಜನ್ಮ ಪಾದ ${destinyCatalysts.nameSoundVibration.janmaPadaNumber}` : `Pada ${destinyCatalysts.nameSoundVibration.janmaPadaNumber}`}
                          </span>
                        </div>
                        <div className="text-xs text-stone-700">
                          <span className="text-stone-500 font-bold">{isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ನಾಮಾಕ್ಷರಗಳು:" : "Resonant Syllables:"} </span>
                          <span className="font-black text-indigo-950 text-sm">
                            {isKn
                              ? destinyCatalysts.nameSoundVibration.recommendedStartingSyllablesKn.join(", ")
                              : destinyCatalysts.nameSoundVibration.recommendedStartingSyllablesEn.join(", ")}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-950 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 leading-relaxed">
                          🔔 <b>{isKn ? "ಧ್ವನಿ ಸಾಮರಸ್ಯ ವಿಶ್ಲೇಷಣೆ:" : "Acoustic Tuning:"}</b>{" "}
                          {isKn ? destinyCatalysts.nameSoundVibration.vibrationHarmonyAnalysisKn : destinyCatalysts.nameSoundVibration.vibrationHarmonyAnalysisEn}
                        </p>
                      </div>
                      <p className="text-[11px] text-indigo-900 font-medium pt-1 border-t border-indigo-100">
                        🎯 <b>{isKn ? "ಹೆಸರು ತಿದ್ದುಪಡಿ ಫಲ:" : "Tuning Effect:"}</b>{" "}
                        {isKn ? destinyCatalysts.nameSoundVibration.nameCorrectionImpactKn : destinyCatalysts.nameSoundVibration.nameCorrectionImpactEn}
                      </p>
                    </div>

                    {/* 6. STREE BHAGYA (AUSPICIOUS FEMININE GRACE) */}
                    <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                            <span>🪷</span>
                            <span>{isKn ? "ಸ್ತ್ರೀ ಭಾಗ್ಯೋದಯ (ತ್ರಿಶಕ್ತಿ):" : "Auspicious Feminine Grace:"}</span>
                          </div>
                          <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? "ಸ್ತ್ರೀ ಭಾಗ್ಯ ಯೋಗ" : "Stree Bhagya Active"}
                          </span>
                        </div>
                        <p className="text-xs text-purple-950 bg-purple-50/80 p-2.5 rounded-xl border border-purple-100 leading-relaxed">
                          🌸 <b>{isKn ? "ಮಹಿಳೆಯರ ಆಶೀರ್ವಾದದ ಪ್ರಭಾವ:" : "Feminine Pillars:"}</b>{" "}
                          {isKn ? destinyCatalysts.streeBhagya.explanationKn : destinyCatalysts.streeBhagya.explanationEn}
                        </p>
                      </div>
                      <p className="text-[11px] text-purple-900 font-bold pt-1 border-t border-purple-100">
                        👑 <b>{isKn ? "ಅದೃಷ್ಟದ ವ್ಯಕ್ತಿಗಳು:" : "Key Benefactors:"}</b>{" "}
                        {isKn ? destinyCatalysts.streeBhagya.luckyPersonKn : destinyCatalysts.streeBhagya.luckyPersonEn}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PILLAR 2: WHAT CAN MAKE YOU UNLUCKY? (UNLUCKY AUDIT & ROOT CAUSES) */}
              {(destinyAuditTab === "all" || destinyAuditTab === "unlucky") && (
                <div className="space-y-4 pt-3 border-t border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-black text-rose-950 bg-rose-100/90 px-3 py-1 rounded-xl border border-rose-300">
                      ⚡ 2. {isKn ? "ಯಾವ ಮತ್ತು ಯಾರ ಜೊತೆ ದುರದೃಷ್ಟ ಕಾಡಬಹುದು? (Unlucky Audit & Warnings)" : "2. What & With Whom Can You Feel Unlucky? (Unlucky Audit & Warnings)"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                      {isKn ? "(ಪಾಲುದಾರಿಕೆ, ಜಾಮೀನು, ಸಟ್ಟಾ ವ್ಯಾಪಾರ, ಜನ್ಮ ಕುಂಡಲಿ, ಗೋಚಾರ & ದಶಾಭುಕ್ತಿ ವಿಶ್ಲೇಷಣೆ)" : "(Partnership, Surety, Speculation, Natal Karma, Transits & Dasha)"}
                    </span>
                  </div>

                  {/* UNLUCKY AUDIT HERO WARNING BANNER */}
                  {destinyCatalysts.unluckyAudit && (
                    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50/70 to-rose-50 border-2 border-rose-300 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-black text-rose-950 flex items-center gap-1.5">
                          ⚠️ {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.titleKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.titleEn}
                        </span>
                        <span className="text-[10px] bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full font-bold">
                          {isKn ? "ಅನಿರೀಕ್ಷಿತ ಆಘಾತ ಮುನ್ನೆಚ್ಚರಿಕೆ" : "Misfortune Audit"}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.overviewKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.overviewEn}
                      </p>
                      <div className="p-3 rounded-xl bg-white/90 border border-rose-200 text-xs text-rose-950 font-semibold leading-relaxed">
                        <b>🌧️ {isKn ? "ದುರದೃಷ್ಟ ಮತ್ತು ಅಡೆತಡೆಗಳು ಕಾಡಲು ಕರ್ಮ ಕಾರಣ:" : "Why Native Felt Roadblocks & Unluck:"}</b>{" "}
                        {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.karmicCrucibleKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.karmicCrucibleEn}
                      </div>

                      {/* 3-FOLD ASTROLOGICAL ROOT CAUSES (JANMA KUNDLI, LIVE GOCHARA, RUNNING DASHA-BHUKTI) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {/* 1. JANMA KUNDLI CAUSE */}
                        <div className="p-3 rounded-xl bg-white border border-rose-200/90 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                            <span>🪐</span>
                            <span>{isKn ? "1. ಜನ್ಮ ಕುಂಡಲಿ ಮೂಲ (Natal Karma):" : "1. Natal Karma Basis:"}</span>
                          </div>
                          <p className="text-[11px] text-stone-700 leading-snug">
                            {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.janmaKundliCauseKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.janmaKundliCauseEn}
                          </p>
                        </div>

                        {/* 2. LIVE GOCHARA CAUSE */}
                        <div className="p-3 rounded-xl bg-white border border-amber-300 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                            <span>🛰️</span>
                            <span>{isKn ? "2. ಪ್ರಸ್ತುತ ಲೈವ್ ಗೋಚಾರ (Live Transit):" : "2. Live Transit Factor:"}</span>
                          </div>
                          <p className="text-[11px] text-stone-700 leading-snug">
                            {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.gocharaTransitCauseKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.gocharaTransitCauseEn}
                          </p>
                        </div>

                        {/* 3. RUNNING DASHA-BHUKTI CAUSE */}
                        <div className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                            <span>⏳</span>
                            <span>{isKn ? "3. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ (Running Dasha):" : "3. Running Dasha Factor:"}</span>
                          </div>
                          <p className="text-[11px] text-stone-700 leading-snug">
                            {isKn ? destinyCatalysts.unluckyAudit.whyFeelingUnlucky.dashaBhuktiCauseKn : destinyCatalysts.unluckyAudit.whyFeelingUnlucky.dashaBhuktiCauseEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5 VULNERABLE LIFE SECTORS & TRIGGER POINTS */}
                  {destinyCatalysts.unluckyAudit?.unluckyThingsAndTriggers && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-stone-700 block">
                        🚨 {isKn ? "ದುರದೃಷ್ಟಕ್ಕೆ ಎಡೆಮಾಡಿಕೊಡುವ 5 ಸೂಕ್ಷ್ಮ ರಂಗಗಳು & ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು:" : "5 High-Risk Life Sectors & Vulnerable Trigger Points:"}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {destinyCatalysts.unluckyAudit.unluckyThingsAndTriggers.map((trig, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs flex flex-col justify-between space-y-2">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-rose-950 flex items-center gap-1">
                                  <span>{trig.icon}</span>
                                  <span>{isKn ? trig.itemKn : trig.itemEn}</span>
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                  trig.severity === "critical"
                                    ? "bg-rose-700 text-white animate-pulse"
                                    : "bg-amber-600 text-white"
                                }`}>
                                  {trig.severity.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-stone-500 block">
                                {isKn ? trig.categoryKn : trig.categoryEn}
                              </span>
                              <p className="text-[11px] text-stone-700 leading-snug">
                                {isKn ? trig.warningDetailKn : trig.warningDetailEn}
                              </p>
                            </div>
                            <div className="space-y-1 pt-1.5 border-t border-rose-100">
                              <span className="text-[10px] text-stone-500 block">
                                🔍 <b>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:" : "Astrological Basis:"}</b> {isKn ? trig.astrologicalBasisKn : trig.astrologicalBasisEn}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PILLAR 3: REAL-LIFE SCENARIOS: LUCK VS UNLUCK (ನೈಜ ಜೀವನದ ಉದಾಹರಣೆಗಳು) */}
              {(destinyAuditTab === "all" || destinyAuditTab === "examples") && (
                <div className="space-y-4 pt-3 border-t border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-black text-indigo-950 bg-indigo-100/90 px-3 py-1 rounded-xl border border-indigo-300">
                      📖 3. {isKn ? "ನೈಜ ಜೀವನದ ಉದಾಹರಣೆಗಳು: ಅದೃಷ್ಟ vs ದುರದೃಷ್ಟ (Real-Life Scenarios: Luck vs Unluck)" : "3. Real-Life Scenarios: Luck vs Unluck"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                      {isKn ? "(ಯಾವ ಸಂದರ್ಭಗಳಲ್ಲಿ ಆಕಸ್ಮಿಕ ಅದೃಷ್ಟ ಒಲಿಯಿತು & ಯಾವ ಸಂದರ್ಭಗಳಲ್ಲಿ ದುರದೃಷ್ಟ ಕಾಡಿತು?)" : "(Case Studies: Miracle Turns vs Painful Roadblocks)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* LEFT COLUMN: REAL-LIFE LUCK SCENARIOS (4 EXAMPLES) */}
                    <div className="space-y-3 p-4 md:p-5 rounded-2xl bg-gradient-to-b from-emerald-50/80 via-white to-stone-50 border-2 border-emerald-300 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                          <span>🌟</span>
                          <span>{isKn ? "ಅದೃಷ್ಟದ ನೈಜ ಉದಾಹರಣೆಗಳು (Real-Life Luck Scenarios):" : "Real-Life Luck Scenarios:"}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          {isKn ? "4 ಸ್ವರ್ಣ ನಿದರ್ಶನಗಳು" : "4 Golden Milestones"}
                        </span>
                      </div>

                      {destinyCatalysts.luckAudit?.realLifeLuckExamples && destinyCatalysts.luckAudit.realLifeLuckExamples.length > 0 ? (
                        destinyCatalysts.luckAudit.realLifeLuckExamples.map((ex, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white border border-emerald-200/90 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                                <span>{ex.icon}</span>
                                <span>{isKn ? ex.titleKn : ex.titleEn}</span>
                              </span>
                              <span className="text-[9px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-semibold uppercase">
                                {ex.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-700 leading-snug">
                              {isKn ? ex.scenarioKn : ex.scenarioEn}
                            </p>
                            <div className="text-[10px] text-emerald-900 pt-1 border-t border-emerald-100 font-medium">
                              <b>{isKn ? "ಜ್ಯೋತಿಷ್ಯ ಪ್ರೇರಕ:" : "Astrological Trigger:"}</b> {isKn ? ex.triggerKn : ex.triggerEn}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-stone-500 italic">
                          {isKn ? "ಅದೃಷ್ಟ ನಿದರ್ಶನಗಳು ಲೆಕ್ಕಹಾಕಲ್ಪಡುತ್ತಿವೆ..." : "Computing real-life luck scenarios..."}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: REAL-LIFE UNLUCKY SCENARIOS (4 EXAMPLES) */}
                    <div className="space-y-3 p-4 md:p-5 rounded-2xl bg-gradient-to-b from-rose-50/80 via-white to-stone-50 border-2 border-rose-300 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                        <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                          <span>⚡</span>
                          <span>{isKn ? "ದುರದೃಷ್ಟದ ನೈಜ ಉದಾಹರಣೆಗಳು (Real-Life Unlucky Scenarios):" : "Real-Life Unlucky Scenarios:"}</span>
                        </div>
                        <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                          {isKn ? "4 ಎಚ್ಚರಿಕೆಯ ನಿದರ್ಶನಗಳು" : "4 Critical Roadblocks"}
                        </span>
                      </div>

                      {destinyCatalysts.unluckyAudit?.realLifeUnluckyExamples && destinyCatalysts.unluckyAudit.realLifeUnluckyExamples.length > 0 ? (
                        destinyCatalysts.unluckyAudit.realLifeUnluckyExamples.map((ex, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-white border border-rose-200/90 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-rose-950 flex items-center gap-1">
                                <span>{ex.icon}</span>
                                <span>{isKn ? ex.titleKn : ex.titleEn}</span>
                              </span>
                              <span className="text-[9px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-semibold uppercase">
                                {ex.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-700 leading-snug">
                              {isKn ? ex.scenarioKn : ex.scenarioEn}
                            </p>
                            <div className="text-[10px] text-rose-900 pt-1 border-t border-rose-100 font-medium">
                              <b>{isKn ? "ಜ್ಯೋತಿಷ್ಯ ಪ್ರೇರಕ:" : "Astrological Trigger:"}</b> {isKn ? ex.triggerKn : ex.triggerEn}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-stone-500 italic">
                          {isKn ? "ದುರದೃಷ್ಟ ನಿದರ್ಶನಗಳು ಲೆಕ್ಕಹಾಕಲ್ಪಡುತ್ತಿವೆ..." : "Computing real-life unlucky scenarios..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PILLAR 4: LUCKY CHARMS MATRIX & SACRED GOKARNA SHIELD */}
              {(destinyAuditTab === "all" || destinyAuditTab === "matrix") && (
                <div className="space-y-5 pt-3 border-t border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-black text-amber-950 bg-amber-200/90 px-3 py-1 rounded-xl border border-amber-300">
                      🛡️ 4. {isKn ? "ಅದೃಷ್ಟ ಸಾಧನಗಳ ಪಟ್ಟಿ vs ಅಶುಭ ವರ್ಜ್ಯ ಸಾಧನಗಳು & ಗೋಕರ್ಣ ರಕ್ಷಾ ಕವಚ" : "4. Lucky Charms Matrix vs Avoid Matrix & Sacred Gokarna Shield"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                      {isKn ? "(ಅದೃಷ್ಟ ವೃದ್ಧಿಸುವ ಶುಭ ಅಂಶಗಳು ಹಾಗೂ ದುರದೃಷ್ಟದಿಂದ ಶಾಶ್ವತ ರಕ್ಷಣೆ ನೀಡುವ ಪರಿಹಾರಗಳು)" : "(Auspicious Charms vs Inimical Avoid Attributes & Gokarna Shield)"}
                    </span>
                  </div>

                  {/* PART A: 8 LUCKY CHARMS CARDS */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      🍀 {isKn ? "ಭಾಗ್ಯೋದಯ ವೃದ್ಧಿಸುವ ಅದೃಷ್ಟ ಸಾಧನಗಳ ಪಟ್ಟಿ (Auspicious Charms):" : "Auspicious Lucky Charms Matrix:"}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {/* 1. Awakening Age */}
                      <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          ⏳ {isKn ? "ಭಾಗ್ಯೋದಯ ವಯಸ್ಸು" : "Awakening Age"}
                        </span>
                        <span className="font-black text-amber-950 text-sm block">
                          {isKn ? destinyCatalysts.luckyMatrix.ageOfAwakeningKn : `Age ${destinyCatalysts.luckyMatrix.ageOfAwakening}`}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಭಾಗ್ಯಾಧಿಪತಿಯ ಸಹಜ ಕಾಲ" : "Planetary activation cycle"}
                        </span>
                      </div>

                      {/* 2. Lucky Person */}
                      <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🛡️ {isKn ? "ಅದೃಷ್ಟ ತರುವ ವ್ಯಕ್ತಿ" : "Lucky Person"}
                        </span>
                        <span className="font-black text-rose-950 text-sm block truncate" title={isKn ? destinyCatalysts.luckyMatrix.luckyPersonKn : destinyCatalysts.luckyMatrix.luckyPersonEn}>
                          {isKn ? destinyCatalysts.luckyMatrix.luckyPersonKn : destinyCatalysts.luckyMatrix.luckyPersonEn}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಭಾಗ್ಯೋದಯದ ರಕ್ಷಾ ಕವಚ" : "Primary fortune catalyst"}
                        </span>
                      </div>

                      {/* 3. Lucky Numbers */}
                      <div className="p-3.5 rounded-2xl bg-white border border-indigo-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🔢 {isKn ? "ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು" : "Lucky Numbers"}
                        </span>
                        <span className="font-black text-indigo-950 text-sm block">
                          {destinyCatalysts.luckyMatrix.luckyNumbers.join(", ")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ದಿನಾಂಕ & ನಿರ್ಧಾರಗಳಿಗೆ ಶುಭ" : "Auspicious numeric roots"}
                        </span>
                      </div>

                      {/* 4. Lucky Days */}
                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🗓️ {isKn ? "ಅದೃಷ್ಟ ವಾರಗಳು" : "Lucky Days"}
                        </span>
                        <span className="font-black text-emerald-950 text-sm block truncate">
                          {isKn ? destinyCatalysts.luckyMatrix.luckyDaysKn.join(", ") : destinyCatalysts.luckyMatrix.luckyDaysEn.join(", ")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಹೊಸ ಆರಂಭ & ಒಪ್ಪಂದಕ್ಕೆ ಶುಭ" : "Auspicious for milestones"}
                        </span>
                      </div>

                      {/* 5. Lucky Direction */}
                      <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🧭 {isKn ? "ಅದೃಷ್ಟ ದಿಕ್ಕುಗಳು" : "Lucky Directions"}
                        </span>
                        <span className="font-black text-amber-900 text-sm block truncate">
                          {isKn ? destinyCatalysts.luckyMatrix.luckyDirectionsKn.join(", ") : destinyCatalysts.luckyMatrix.luckyDirectionsEn.join(", ")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಪ್ರಯಾಣ & ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಶುಭ" : "Travel & trade alignment"}
                        </span>
                      </div>

                      {/* 6. Vehicle Colors */}
                      <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🚗 {isKn ? "ವಾಹನ & ವಸ್ತ್ರ ಬಣ್ಣಗಳು" : "Lucky Colors"}
                        </span>
                        <span className="font-black text-amber-950 text-sm block truncate">
                          {isKn ? destinyCatalysts.luckyMatrix.vehicleColorsKn.join(", ") : destinyCatalysts.luckyMatrix.vehicleColorsEn.join(", ")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ವೃದ್ಧಿ" : "Resonant aura colors"}
                        </span>
                      </div>

                      {/* 7. Avoid Colors */}
                      <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-1">
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          🚫 {isKn ? "ವರ್ಜಿಸಬೇಕಾದ ಬಣ್ಣಗಳು" : "Avoid Colors"}
                        </span>
                        <span className="font-black text-rose-900 text-sm block truncate">
                          {isKn ? destinyCatalysts.luckyMatrix.avoidColorsKn.join(", ") : destinyCatalysts.luckyMatrix.avoidColorsEn.join(", ")}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {isKn ? "ಮುಖ್ಯ ಕಾರ್ಯಗಳಲ್ಲಿ ತ್ಯಜಿಸಿ" : "Avoid on key milestones"}
                        </span>
                      </div>

                      {/* 8. Sacred Temple Remedy */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 shadow-xs space-y-1">
                        <span className="text-[10px] text-amber-800 font-bold uppercase block">
                          🛕 {isKn ? "ದೈವಿಕ ಕ್ಷೇತ್ರ ಪರಿಹಾರ" : "Sacred Temple"}
                        </span>
                        <span className="font-black text-amber-950 text-sm block truncate" title={isKn ? destinyCatalysts.spiritualTempleCatalyst.templeKn : destinyCatalysts.spiritualTempleCatalyst.templeEn}>
                          {isKn ? destinyCatalysts.spiritualTempleCatalyst.templeKn : destinyCatalysts.spiritualTempleCatalyst.templeEn}
                        </span>
                        <span className="text-[10px] text-stone-600 block line-clamp-1" title={isKn ? destinyCatalysts.spiritualTempleCatalyst.remedyDetailsKn : destinyCatalysts.spiritualTempleCatalyst.remedyDetailsEn}>
                          {isKn ? destinyCatalysts.spiritualTempleCatalyst.remedyDetailsKn : destinyCatalysts.spiritualTempleCatalyst.remedyDetailsEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PART B: UNLUCKY AVOID MATRIX & SACRED GOKARNA SHIELD */}
                  {destinyCatalysts.unluckyAudit?.unluckyMatrix && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                        ⚠️ {isKn ? "ಅಶುಭ ವರ್ಜ್ಯ ಸಾಧನಗಳ ಪಟ್ಟಿ & ಗೋಕರ್ಣ ರಕ್ಷಾ ಕವಚ (Inimical Matrix & Protection Shield):" : "Inimical Avoid Matrix & Gokarna Protection Shield:"}
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {/* 1. Inimical Shadashtaka Signs */}
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-300 shadow-xs space-y-1">
                          <span className="text-[10px] text-rose-900 font-bold uppercase block">
                            ⚡ {isKn ? "ಅಶುಭ ಶಡಾಷ್ಟಕ ರಾಶಿಗಳು" : "Inimical Signs"}
                          </span>
                          <span className="font-black text-rose-950 text-xs block">
                            {isKn ? destinyCatalysts.unluckyAudit.unluckyMatrix.inimicalRashisKn.join(", ") : destinyCatalysts.unluckyAudit.unluckyMatrix.inimicalRashisEn.join(", ")}
                          </span>
                          <span className="text-[10px] text-stone-600 block leading-tight">
                            {isKn ? "ಪಾಲುದಾರಿಕೆ & ಸಾಲಕ್ಕೆ ವರ್ಜ್ಯ" : "Avoid partnering & lending"}
                          </span>
                        </div>

                        {/* 2. Unlucky Days */}
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-300 shadow-xs space-y-1">
                          <span className="text-[10px] text-rose-900 font-bold uppercase block">
                            🗓️ {isKn ? "ಅಶುಭ ವಾರಗಳು" : "Avoid Days"}
                          </span>
                          <span className="font-black text-rose-950 text-xs block">
                            {isKn ? destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyDaysKn.join(", ") : destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyDaysEn.join(", ")}
                          </span>
                          <span className="text-[10px] text-stone-600 block leading-tight">
                            {isKn ? "ಹೊಸ ಹೂಡಿಕೆಗೆ ವರ್ಜ್ಯ" : "Avoid starting contracts"}
                          </span>
                        </div>

                        {/* 3. Unlucky Directions */}
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-300 shadow-xs space-y-1">
                          <span className="text-[10px] text-rose-900 font-bold uppercase block">
                            🧭 {isKn ? "ಅಶುಭ ದಿಕ್ಕುಗಳು" : "Avoid Directions"}
                          </span>
                          <span className="font-black text-rose-950 text-xs block">
                            {isKn ? destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyDirectionsKn.join(", ") : destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyDirectionsEn.join(", ")}
                          </span>
                          <span className="text-[10px] text-stone-600 block leading-tight">
                            {isKn ? "ದೀರ್ಘ ಪ್ರಯಾಣಕ್ಕೆ ವರ್ಜ್ಯ" : "Avoid travel orientation"}
                          </span>
                        </div>

                        {/* 4. Strictly Avoid Numbers */}
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-300 shadow-xs space-y-1">
                          <span className="text-[10px] text-rose-900 font-bold uppercase block">
                            🔢 {isKn ? "ವರ್ಜಿಸಬೇಕಾದ ಸಂಖ್ಯೆ" : "Avoid Numbers"}
                          </span>
                          <span className="font-black text-rose-950 text-xs block">
                            {destinyCatalysts.unluckyAudit.unluckyMatrix.avoidNumbers.join(", ")}
                          </span>
                          <span className="text-[10px] text-stone-600 block leading-tight">
                            {isKn ? "ಖಾತೆ, ವಾಹನ ಸಂಖ್ಯೆಗೆ ತ್ಯಜಿಸಿ" : "Avoid in key registrations"}
                          </span>
                        </div>

                        {/* 5. Strictly Avoid Colors */}
                        <div className="p-3 rounded-2xl bg-rose-50/90 border border-rose-300 shadow-xs space-y-1">
                          <span className="text-[10px] text-rose-900 font-bold uppercase block">
                            🎨 {isKn ? "ವರ್ಜಿಸಬೇಕಾದ ಬಣ್ಣ" : "Avoid Colors"}
                          </span>
                          <span className="font-black text-rose-950 text-xs block">
                            {isKn ? destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyColorsKn.join(", ") : destinyCatalysts.unluckyAudit.unluckyMatrix.unluckyColorsEn.join(", ")}
                          </span>
                          <span className="text-[10px] text-stone-600 block leading-tight">
                            {isKn ? "ಶುಭ ಸಂದರ್ಭಗಳಲ್ಲಿ ತ್ಯಜಿಸಿ" : "Avoid in key gatherings"}
                          </span>
                        </div>
                      </div>

                      {/* STRICT DO-NOTS & SACRED REMEDIES (2 LARGE CARDS) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* 1. STRICT PROHIBITIONS */}
                        <div className="p-4 rounded-2xl bg-rose-50/80 border-2 border-rose-200/90 space-y-2">
                          <span className="text-xs font-bold text-rose-950 block">
                            🚫 {isKn ? "ಜೀವನದಲ್ಲಿ ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಬೇಕಾದ ಎಚ್ಚರಿಕೆಗಳು:" : "Mandatory Prohibitions to Ward Off Misfortune:"}
                          </span>
                          <ul className="text-xs text-stone-800 space-y-1.5 list-disc list-inside">
                            {(isKn
                              ? destinyCatalysts.unluckyAudit.unluckyMatrix.strictlyAvoidActivitiesKn
                              : destinyCatalysts.unluckyAudit.unluckyMatrix.strictlyAvoidActivitiesEn
                            ).map((rule: string, idx: number) => (
                              <li key={idx} className="leading-snug">{rule}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. PROTECTIVE MANTRA & GOKARNA SHANTI REMEDY */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100/70 via-white to-amber-50 border-2 border-amber-300 shadow-xs space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-amber-900 tracking-wider block">
                              🛡️ {isKn ? "ದಿನನಿತ್ಯದ ರಕ್ಷಾ ಮಂತ್ರ (Daily Protective Mantra)" : "Daily Protective Mantra"}
                            </span>
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-xs font-black text-amber-950 leading-relaxed font-serif">
                              {isKn ? destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.protectiveMantraKn : destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.protectiveMantraEn}
                            </div>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-amber-200">
                            <span className="text-[10px] uppercase font-black text-amber-900 tracking-wider block">
                              🛕 {isKn ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಪರಿಹಾರ (Gokarna Shanti Seva)" : "Gokarna Kshetra Shanti Seva"}
                            </span>
                            <p className="text-xs text-stone-800 font-medium leading-relaxed">
                              {isKn ? destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.protectiveKshetraKn : destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.protectiveKshetraEn}
                            </p>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-amber-200 text-xs text-stone-700">
                            <span className="text-[10px] uppercase font-black text-amber-900 tracking-wider block">
                              🛡️ {isKn ? "ದಿನನಿತ್ಯದ ರಕ್ಷಾ ಕ್ರಮ" : "Daily Shield Habit"}
                            </span>
                            <p className="text-[11px] leading-snug">
                              {isKn ? destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.dailyShieldHabitKn : destinyCatalysts.unluckyAudit.unluckyRemediesAndShields.dailyShieldHabitEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 5. YAJNA, HAWANA, SANDHI & PITRU DOSHA PARIHARA HUB - WHITE & GOLD THEME */}
          {yajnaHawanaPlan && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-7">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 text-3xl shadow-md border border-amber-300">
                    🔥
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      {isKn ? "॥ ದೈವಿಕ ಯಜ್ಞ, ಹವನ, ಸಂಧಿ & ಪಿತೃ ಮುಕ್ತಿ ಸಂಕಲ್ಪ ಮಂಡಲ ॥" : "Vedic Yajna, Hawana & Ancestral Liberation Hub"}
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-amber-950 font-serif">
                      {isKn
                        ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ) ಪಿತೃ ಕಾರ್ಯ & ದೇವತಾ ಯಜ್ಞ-ಹವನಗಳು`
                        : `${session.input.name ? `${session.input.name}'s ` : ""}(${session.result.lagnaRashi.english} Ascendant) Pitru Karya & Deva Yajna Prescriptions`}
                    </h3>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black border border-amber-400 shadow-sm">
                  {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರತ್ಯೇಕ ವಿಭಾಗಗಳು" : "Vedic Separate Domains"}
                </span>
              </div>

              {/* SHASTRA RULE ALERT BANNER */}
              <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-400 flex items-start gap-3 text-xs text-amber-950 shadow-sm">
                <span className="text-xl">📜</span>
                <div>
                  <b className="block text-amber-950 font-bold mb-0.5">
                    {isKn ? "ಧರ್ಮಶಾಸ್ತ್ರದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮ (Strict Shastra Separation Rule):" : "Vedic Shastra Rule on Pitru vs Deva Karya:"}
                  </b>
                  <p className="text-stone-800 leading-relaxed text-[11px]">
                    {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.shastraSeparationRuleKn)}
                  </p>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION A: PITRU KARYA SANCTUARY (ಪಿತೃ ಮುಕ್ತಿ & ಅಪರ ಕರ್ಮ) */}
              {/* ---------------------------------------------------- */}
              {yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha && !isChild ? (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌾</span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                          {isKn ? "ವಿಭಾಗ 1: ಅಪರ ಕರ್ಮ / ಮುಕ್ತಿ" : "Domain 1: Ancestral Mukti"}
                        </span>
                        <h4 className="text-base font-black text-amber-950 font-serif">
                          {isKn ? "ಪಿತೃ ಮುಕ್ತಿ & ಪೂರ್ವಜರ ಶಾಂತಿ ಸಂಕಲ್ಪ (ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ)" : "Pitru Mukti & Ancestral Peace Seva"}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-950 border border-amber-400">
                      {yajnaHawanaPlan.pitruDoshaAssessment.severityLabelKn}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                    {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.detailedExplanationKn)}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-amber-300 shadow-sm">
                      <b className="text-amber-950 block mb-1">🔍 ಜಾತಕದಲ್ಲಿ ಕಂಡ ಕಾರಣಗಳು:</b>
                      <ul className="list-disc list-inside space-y-1 text-stone-700 text-[11px]">
                        {yajnaHawanaPlan.pitruDoshaAssessment.reasonsKn.map((r, i) => (
                          <li key={i}>{cleanAstrologyText(r)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-amber-300 shadow-sm">
                      <b className="text-amber-950 block mb-1">🪔 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸೂಚಿಸಿದ ವಿಧಿ:</b>
                      <p className="text-amber-950 font-semibold text-[11px]">
                        {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.suggestedKaryaKn)}
                      </p>
                      <p className="text-[10px] text-stone-600 mt-1">
                        {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.gokarnaSignificanceKn)}
                      </p>
                    </div>
                  </div>

                  {/* PITRU KARYAS GRID */}
                  {yajnaHawanaPlan.pitruKaryas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {yajnaHawanaPlan.pitruKaryas.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border-2 border-amber-300 bg-white space-y-2.5 text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase block">
                                {cleanAstrologyText(item.categoryLabelKn)}
                              </span>
                              <h5 className="text-xs font-black text-amber-950 font-serif mt-0.5">
                                {cleanAstrologyText(item.nameKn)}
                              </h5>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[11px]">
                            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                              <b className="text-amber-950 block text-[10px]">📌 ಜಾತಕ ಕಾರಣ:</b>
                              <p className="text-stone-700">{cleanAstrologyText(item.astrologicalRootCauseKn)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                              <b className="text-amber-950 block text-[10px]">🪔 ಗೋಕರ್ಣ ವಿಧಿ:</b>
                              <p className="text-stone-700">{cleanAstrologyText(item.sacredProcedureKn)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                              <b className="text-emerald-950 block text-[10px]">✨ ನಿರೀಕ್ಷಿತ ಫಲ:</b>
                              <p className="text-emerald-900">{cleanAstrologyText(item.expectedShiftsAfterPoojaKn)}</p>
                            </div>
                            <p className="text-[10px] text-stone-600 italic pt-0.5">
                              {cleanAstrologyText(item.priestSecretNoteKn)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 space-y-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🕊️</span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block">
                          {isKn ? "ಪೂರ್ವಜರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ & ಶ್ರೀ ರಕ್ಷೆ" : "Ancestral Blessings & Protection"}
                        </span>
                        <h4 className="text-base font-black text-emerald-950 font-serif">
                          {isKn
                            ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} ಕುಂಡಲಿಯಲ್ಲಿ ಪಿತೃ ದೋಷವಿಲ್ಲ (ಪೂರ್ವಜರ ಆಶೀರ್ವಾದವಿದೆ)`
                            : `Ancestral Blessings Intact (No Pitru Dosha)`}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-950 border border-emerald-400">
                      {isKn ? "ದೋಷಮುಕ್ತ ಶುಭ ಜಾತಕ" : "Auspicious"}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                    {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.detailedExplanationKn)}
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-stone-700">
                    <p className="text-emerald-950 font-semibold text-[11px]">
                      ✨ <b>ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ:</b> {isKn ? "ನಿಮಗೆ ಯಾವುದೇ ಅಪರ ಕರ್ಮ ಅಥವಾ ಶ್ರಾದ್ಧ ಕಾರ್ಯಗಳ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಸಕಲ ಕಾರ್ಯಸಿದ್ಧಿಗಾಗಿ ನೇರವಾಗಿ ಕೆಳಗಿನ ವಿಭಾಗ 2ರಲ್ಲಿರುವ ಮಂಗಳಕರ ದೇವತಾ ಯಜ್ಞ-ಹವನಗಳು ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ರುದ್ರಾಭಿಷೇಕವನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯುನ್ನತ ಫಲ ನೀಡುತ್ತದೆ." : "You do not require any ancestral expiation rites. You may proceed directly to the auspicious divine homas and Gokarna Atmalinga Rudrabhisheka in Domain 2."}
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SECTION B: DEVA KARYA SANCTUARY (ದೇವತಾ ಯಜ್ಞ & ಶುಭ ಹವನ) */}
              {/* ---------------------------------------------------- */}
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
                  <span className="text-2xl">🔱</span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                      {isKn ? "ವಿಭಾಗ 2: ಶುಭ ಕರ್ಮ / ದೈವ ಯಜ್ಞ" : "Domain 2: Divine Yajna"}
                    </span>
                    <h4 className="text-base font-black text-amber-950 font-serif">
                      {isKn ? "ದೇವತಾ ಯಜ್ಞ, ಶುಭ ಹವನಗಳು & ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ" : "Divine Yajna, Hawana & Atmalinga Abhisheka"}
                    </h4>
                  </div>
                </div>

                {/* DEVA HOMAS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yajnaHawanaPlan.devaHomas.map((homa) => (
                    <div
                      key={homa.id}
                      className={`p-5 rounded-2xl border-2 ${homa.isUrgentPrimary ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-50 ring-1 ring-amber-300 shadow-md" : "border-amber-200 bg-white shadow-sm"} space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{homa.icon}</span>
                          <div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase block mb-1 border border-amber-300">
                              {cleanAstrologyText(homa.categoryLabelKn)}
                            </span>
                            <h5 className="text-sm font-black text-amber-950 font-serif">
                              {cleanAstrologyText(homa.nameKn)}
                            </h5>
                          </div>
                        </div>
                        {homa.isUrgentPrimary && (
                          <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-400 whitespace-nowrap">
                            {isKn ? "ಮುಖ್ಯ ಯಜ್ಞ" : "Primary"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                          <b className="text-amber-950 block text-[11px] mb-0.5">📌 ಜಾತಕದ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:</b>
                          <p className="text-stone-700 leading-relaxed">{cleanAstrologyText(homa.astrologicalRootCauseKn)}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                          <b className="text-amber-950 block text-[11px] mb-0.5">🪔 ದೈವಿಕ ಸಂಕಲ್ಪ & ಹವನ ವಿಧಾನ:</b>
                          <p className="text-stone-700 leading-relaxed">{cleanAstrologyText(homa.sacredProcedureKn)}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <b className="text-emerald-950 block text-[11px] mb-0.5">✨ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಬದಲಾವಣೆಗಳು:</b>
                          <p className="text-emerald-900 leading-relaxed">{cleanAstrologyText(homa.expectedShiftsAfterPoojaKn)}</p>
                        </div>

                        <div className="pt-1 text-[11px] text-stone-600 italic">
                          {cleanAstrologyText(homa.priestSecretNoteKn)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION C: 2-STAGE SACRED SCHEDULE TIMELINE */}
              {/* ---------------------------------------------------- */}
              <div className="p-5 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100/80 via-yellow-50 to-amber-100/80 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-950 font-bold block">
                      {isKn ? "॥ ಶಾಸ್ತ್ರೋಕ್ತ ಬಹು-ದಿನದ ಸಂಪುಟ ಯೋಜನೆ ॥" : "Vedic Multi-Day Sacred Schedule"}
                    </span>
                    <h4 className="text-base font-black text-amber-950 font-serif">
                      {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.titleKn)}
                    </h4>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-400 shadow-sm">
                    {yajnaHawanaPlan.combinedSchedule.scheduleType === "two_stage_multi_day" ? (isKn ? "2-ಹಂತದ ಶಾಸ್ತ್ರೀಯ ಯೋಜನೆ" : "2-Stage Schedule") : (isKn ? "ಏಕದಿನ ದೇವತಾ ಸಂಪುಟ" : "1-Day Samputa")}
                  </span>
                </div>

                {/* TIMELINE CARDS */}
                {yajnaHawanaPlan.combinedSchedule.scheduleType === "two_stage_multi_day" && yajnaHawanaPlan.combinedSchedule.stage1PitruKarya && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* STAGE 1: PITRU KARYA */}
                    <div className="p-3.5 rounded-xl bg-white border-2 border-amber-300 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-300">
                          {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage1PitruKarya.dayLabelKn)}
                        </span>
                        <span>🌾</span>
                      </div>
                      <b className="text-amber-950 block text-xs">{cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage1PitruKarya.placeKn)}</b>
                      <div className="flex flex-wrap gap-1">
                        {yajnaHawanaPlan.combinedSchedule.stage1PitruKarya.ritualsKn.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-950 text-[10px]">
                            {cleanAstrologyText(r)}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-stone-700 leading-relaxed">
                        {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage1PitruKarya.descriptionKn)}
                      </p>
                    </div>

                    {/* REST & SHUDDHI DAY */}
                    {yajnaHawanaPlan.combinedSchedule.restPeriodShuddhi && (
                      <div className="p-3.5 rounded-xl bg-white border-2 border-stone-300 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[10px] border border-stone-300">
                            {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.restPeriodShuddhi.dayLabelKn)}
                          </span>
                          <span>🌊</span>
                        </div>
                        <b className="text-stone-900 block text-xs">ಆಶೌಚ ನಿವೃತ್ತಿ & ಸಾಗರ ತೀರ್ಥ ಸ್ನಾನ</b>
                        <p className="text-[11px] text-stone-700 leading-relaxed">
                          {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.restPeriodShuddhi.descriptionKn)}
                        </p>
                        <p className="text-[10px] text-amber-900 font-semibold italic border-t border-stone-200 pt-1">
                          {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.restPeriodShuddhi.shastraRuleKn)}
                        </p>
                      </div>
                    )}

                    {/* STAGE 2: DEVA KARYA */}
                    <div className="p-3.5 rounded-xl bg-white border-2 border-amber-300 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-300">
                          {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage2DevaKarya.dayLabelKn)}
                        </span>
                        <span>🔱</span>
                      </div>
                      <b className="text-amber-950 block text-xs">{cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage2DevaKarya.placeKn)}</b>
                      <div className="flex flex-wrap gap-1">
                        {yajnaHawanaPlan.combinedSchedule.stage2DevaKarya.ritualsKn.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-950 text-[10px]">
                            {cleanAstrologyText(r)}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-stone-700 leading-relaxed">
                        {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.stage2DevaKarya.descriptionKn)}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                  {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.synergyExplanationKn)}
                </p>

                <p className="text-xs text-amber-950 font-bold">
                  🗓️ <b>{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಶುಭ ಮುಹೂರ್ತ:" : "Recommended Muhurtha:"}</b> {cleanAstrologyText(yajnaHawanaPlan.combinedSchedule.recommendedMuhurthaKn)}
                </p>
              </div>
            </div>
          )}

          {/* 6. INTERACTIVE VOICE & CUSTOM QUESTION BOX - WHITE & GOLD THEME */}
          <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-100/70 via-white to-amber-50 p-6 md:p-8 text-stone-950 shadow-xl space-y-5">
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-amber-400">
                🎙️ {isKn ? "ದೈವಜ್ಞ ನೇರ ಪ್ರಶ್ನೋತ್ತರ ಪೆಟ್ಟಿಗೆ" : "Direct Astrologer Q&A"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-amber-950 font-serif">
                {isKn
                  ? `${session.input.name || (isChild ? "ಮಗುವಿನ" : "ಜಾತಕರ")} (${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ) ಯಾವುದೇ ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಧ್ವನಿ ಅಥವಾ ಟೈಪ್ ಮೂಲಕ)`
                  : `Ask Any Specific Follow-up Question for ${session.input.name || "Native"}'s Chart (${session.result.lagnaRashi.english} Asc)`}
              </h3>
              <p className="text-xs text-stone-700 mt-1">
                {isKn 
                  ? "ಕ್ಲೈಂಟ್ ಕೇಳುವ ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಪ್ರಶ್ನೆಗೆ ಮೈಕ್ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ 100% ಶಾಸ್ತ್ರೋಕ್ತ ಉತ್ತರ ಪಡೆಯಿರಿ."
                  : "Get accurate, direct answers for any client follow-up question based on their chart."}
              </p>
            </div>

            {/* QUICK SUGGESTION CHIPS */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1">
                <span>💡</span>
                <span>{isKn ? (isChild ? "ಮಗುವಿನ ನಡವಳಿಕೆ & ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):" : "ಸಾಮಾನ್ಯ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):") : "Quick Question Suggestions (Click for instant answer):"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(instantQAList || []).slice(0, 6).map((q) => ({
                  icon: q.category === "career" ? "💼" : q.category === "marriage" ? "💍" : q.category === "children" ? "👶" : q.category === "wealth" ? "💰" : "🧠",
                  kn: q.questionKn,
                  en: q.questionEn
                })).map((sq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={answering}
                    onClick={() => {
                      const qText = isKn ? sq.kn : sq.en;
                      setQuestionInput(qText);
                      void handleAskQuestion(qText);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-amber-600 hover:bg-amber-100/70 text-amber-950 text-xs font-medium text-left shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer disabled:opacity-50"
                  >
                    <span>{sq.icon}</span>
                    <span className="group-hover:underline">{isKn ? sq.kn : sq.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT BOX */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-amber-300 focus-within:border-amber-500 shadow-sm">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !answering) void handleAskQuestion();
                }}
                placeholder={isKn ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ..." : "Type your question or click mic..."}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-400 hover:text-neutral-950 border border-amber-300"
                }`}
                title={isListening ? "Listening..." : "Click to speak"}
              >
                🎤
              </button>

              <button
                type="button"
                onClick={() => void handleAskQuestion()}
                disabled={answering || !questionInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              >
                {answering ? (isKn ? "ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ..." : "Answering...") : (isKn ? "ಕೇಳಿ" : "Ask")}
              </button>
            </div>

            {/* Q&A HISTORY */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-amber-200">
                {qaHistory.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border-2 border-amber-200 space-y-2 shadow-sm text-stone-900">
                    <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>❓</span>
                      <span>{item.question}</span>
                    </p>
                    <p className="text-xs md:text-sm text-stone-800 leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200 whitespace-pre-line">
                      {cleanAstrologyText(item.answer)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM RETURN TO KUNDLI BAR */}
          <div className="flex items-center justify-center pt-6">
            <button
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-sm md:text-base shadow-xl hover:scale-105 transition-all border-2 border-amber-300 cursor-pointer"
            >
              <span>←</span>
              <span>{isKn ? "ಕುಂಡಲಿಗೆ ಹಿಂತಿರುಗಿ (Back to Kundali)" : "Back to Kundali Chart"}</span>
            </button>
          </div>
        </>
      )}

      {/* 🚨 SCREEN-BLOCKING INTERACTIVE LOADER OVERLAY 🚨 */}
      {isGeneratingPdf && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-stone-950/85 backdrop-blur-md text-center p-6 select-none animate-fade-in"
        >
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-amber-950/90 via-stone-900/95 to-black/95 border-2 border-amber-400/70 shadow-[0_0_50px_rgba(245,158,11,0.35)] max-w-md w-full flex flex-col items-center text-amber-100">
            <GrahaSpinner size="lg" message="" />
            <h3 className="mt-4 text-xl font-serif font-black text-amber-300 tracking-wide">
              ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ ॥
            </h3>
            <p className="mt-2 text-xs font-medium text-amber-200/90 tracking-wide leading-relaxed">
              {pdfStatusMessage || "100% ಶಾಸ್ತ್ರೋಕ್ತ ಫಲಿತಾಂಶ ಹಾಗೂ ದೈವಜ್ಞ ಮುಖ್ಯಾಂಶಗಳ A4 PDF ಮುದ್ರಣಗೊಳ್ಳುತ್ತಿದೆ..."}
            </p>
            <div className="mt-5 w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-amber-500/30">
              <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full animate-pulse w-full" />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-amber-400/90 font-bold">
              <span>✨</span>
              <span>A4 Executive Print Edition ({PDF_LANGUAGES.find((l) => l.code === pdfLanguage)?.label || "Kannada"})</span>
            </div>
          </div>
        </div>
      )}

      {/* 🌐 6-LANGUAGE PDF EXPORT SELECTION MODAL 🌐 */}
      {isPdfLangModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50/90 border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-amber-900 block">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ A4 ಮುದ್ರಣ ॥
                </span>
                <h3 className="text-lg font-black text-amber-950 font-serif">
                  {isKn ? "ವರದಿ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Select Report Language"}
                </h3>
              </div>
              <button
                onClick={() => setIsPdfLangModalOpen(false)}
                className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {isKn
                ? "ದೈವಜ್ಞ ಮುಖ್ಯಾಂಶಗಳು ಹಾಗೂ ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಕೆಳಗಿನ ಯಾವುದೇ 6 ಭಾಷೆಗಳಲ್ಲಿ ಮುದ್ರಿಸಬಹುದು:"
                : "Choose your preferred language for the A4 executive reading and Vedic consultation report:"}
            </p>

            <div className="grid grid-cols-2 gap-2.5 py-1">
              {PDF_LANGUAGES.map((langOpt) => {
                const isSelected = pdfLanguage === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    onClick={() => setPdfLanguage(langOpt.code)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-amber-500 bg-amber-100/90 text-amber-950 shadow-md ring-2 ring-amber-400/40"
                        : "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-stone-800"
                    }`}
                  >
                    <span className="text-xl">{langOpt.flagEmoji}</span>
                    <div>
                      <div className="text-xs font-black">{langOpt.nativeScript}</div>
                      <div className="text-[10px] text-stone-500">{langOpt.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                onClick={() => setIsPdfLangModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer"
              >
                {isKn ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
              </button>
              <button
                onClick={() => void handleDownloadPdf(pdfLanguage)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 text-xs font-black shadow-md hover:scale-105 transition-all border border-amber-400 cursor-pointer"
              >
                {isKn ? "📥 ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "📥 Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN A4 PDF RENDER HOST (Adheres strictly to baggona-pdf-layout-guard) */}
      {synthesisData && (
        <div id="instant-reading-pdf-container" style={hiddenHost} aria-hidden>
          <InstantReadingPdfTemplate
            synthesisData={synthesisData}
            session={session}
            aiNarration={aiNarration}
            lang={pdfLanguage}
          />
        </div>
      )}
    </div>
  );
}
