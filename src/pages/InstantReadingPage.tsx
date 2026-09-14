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
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";

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
  const [aiNarration, setAiNarration] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [dynamicTalkingPoints, setDynamicTalkingPoints] = useState<{
    openingIceBreakerKn: string;
    hiddenSubconsciousWorryKn: string;
    maandiKarmicImpactKn: string;
    karmaFinancialRealityKn: string;
    immediateTurningPointKn: string;
    siddhaPariharaRemedyKn: string;
  } | null>(null);

  // Selected Category & Active Question Drawer
  const [activeCategory, setActiveCategory] = useState<"all" | "career" | "marriage" | "children" | "mind" | "wealth">("all");
  const [selectedQA, setSelectedQA] = useState<InstantQAQuestion | null>(null);
  const [personalityTab, setPersonalityTab] = useState<"all" | "strengths" | "challenges" | "integrity">("all");

  // Custom Q&A State
  const [questionInput, setQuestionInput] = useState("");
  const [answering, setAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

    const data = generatePanchangaAngaSynthesis(session.result, {
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lon,
      lang: i18n.language,
      devoteeName: session.input.name || "Devotee",
      gender: session.input.gender,
      devoteeAge
    });

    setSynthesisData(data);
    setAiNarration(data.multiParagraphExecutiveReading.map(cleanAstrologyText));
    setLoading(false);

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
- Acute Current Life Reality (ಹಾಲಿ ಅನುಭವಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಸಂಕಷ್ಟಗಳು):
  * Headline: ${cls?.headlineKn || data.currentDiagnosis.primaryLifeChallenge.description} (${cls?.headlineEn || data.currentDiagnosis.primaryLifeChallenge.descriptionEn})
  * Detailed Reality: ${cls?.detailedRealityKn || data.currentDiagnosis.primaryLifeChallenge.description}
  * Planetary Culprit: ${cls?.planetaryCulpritKn || data.currentDiagnosis.primaryLifeChallenge.planetaryRootCause}
  * Key Daily Life Symptoms: ${cls?.symptomsChecklistKn.join(" | ") || ""}
- Accurate Specific Profession Determination (ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ ನಿರ್ಣಯ - Which work is he doing?):
  * Title: ${prof?.titleKn || ""} (${prof?.titleEn || ""})
  * Specific Role: ${prof?.specificRoleKn || ""} (${prof?.specificRoleEn || ""})
  * Work Environment: ${prof?.workEnvironmentKn || ""} (${prof?.workEnvironmentEn || ""})
  * Classical Basis: ${prof?.astrologicalBasisKn || ""}
  * Jaimini Amatyakaraka (AmK): ${prof?.amatyakarakaPlanetKn || ""}
  * 10th House Sign: ${prof?.tenthHouseSignKn || ""} (Lord: ${prof?.primaryPlanetKn || ""})
- Character & Dietary Verification:
  * Diet / Substance: ${isTeetotaler ? "STRICT TEETOTALER (ಸಾತ್ವಿಕ ಆಹಾರಿ - Zero alcohol, zero drugs, clean vegetarian intake due to benefic/Guru protection on 2nd house). NEVER accuse of alcohol or drugs!" : `PRONE TO ALCOHOL/INTAKE VULNERABILITY (ಮದ್ಯಪಾನದ ಸೆಳೆತ): ${dietSummaryEn || "Has evening alcohol habit under stress / 2nd house aspect from 8th house Saturn"}. Tactfully address their private struggle with evening alcohol/detox without harshness.`}
  * Marital Fidelity & Sensual Reality: ${hasMaritalFidelity ? `HIGH MARITAL FIDELITY (ದಾಂಪತ್ಯ ನಿಷ್ಠೆ - Pure 7th house). NEVER accuse of extramarital affairs! Always refer to spouse as '${spouseTerm}'.` : `SENSUAL RESTLESSNESS & ROVING EYE (ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆ): ${fidelitySummaryEn || "Sensual restlessness and roving eye toward other women causing marital friction with spouse"}. Address their private inner distractions and how it is causing domestic discord with ${spouseTerm}, counseling sensory restraint.`}
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

STRICT WRITING & ASTROLOGER PERSONA RULES:
1. Speak DIRECTLY to the devotee in authoritative, deeply empathetic, face-to-face Vedic Astrologer spoken voice in 100% PURE ${isKn ? "Kannada" : "English"}. NO English words or foreign language mix-up.
2. Use standard traditional Vedic planetary terminology: 'ರವಿ' (Ravi), 'ಕುಜ' (Kuja), 'ಗುರು' (Guru), 'ಶುಕ್ರ' (Shukra), 'ಶನಿ' (Shani), 'ಬುಧ' (Budha), 'ಚಂದ್ರ' (Chandra), 'ರಾಹು' (Rahu), 'ಕೇತು' (Ketu).
3. MANDATORY PARAGRAPH 1 DIRECT REALITY: The very first paragraph MUST start with what the person is currently going through in their real life right now (${cls?.headlineKn || data.currentDiagnosis.primaryLifeChallenge.description}). Reveal their running Dasha (${data.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}), acute life reality, and planetary cause.
4. MANDATORY PARAGRAPH 2 ACCURATE PROFESSION: Accurately declare which work the native is doing (${prof?.titleKn || ""} - ${prof?.specificRoleKn || ""}). Detail their day-to-day work environment and astrological foundation.
5. Structure your response into 4 comprehensive paragraphs:
   - Paragraph 1: Direct greeting ("ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ."). IMMEDIATELY state what they are going through in their actual life (${cls?.headlineKn || data.currentDiagnosis.primaryLifeChallenge.description}), running Dasha, and acute planetary tension.
   - Paragraph 2: State their accurate profession & vocation (${prof?.titleKn || ""}), specific role (${prof?.specificRoleKn || ""}), work environment (${prof?.workEnvironmentKn || ""}), and 10th house / Jaimini AmK basis.
   - Paragraph 3: Explain the astrological planetary reality and give an exact turning-point timeline (${cls?.reliefTimelineKn || data.currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ"}) using ENGLISH DIGITS when breakthroughs occur.
   - Paragraph 4: Prescribe the exact remedies with precision: ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}), ${data.prescriptions.rudraksha.nameKn}, daily morning rituals, and Gokarna Mahabaleshwara Kshetra blessings.
6. DO NOT use markdown bold asterisks (no ** or *). Use clean, plain text.
7. ALL NUMBERS MUST BE IN ENGLISH DIGITS (e.g. 1, 2, 3, 4.25 - 6.5 Carat, 9 Mukhi, 7th house, 10th house, 3 to 6 months).
8. CHARACTER & GENDER ACCURACY:
   - If Diet is TEETOTALER, highlight their clean, pure lifestyle (ಸಾತ್ವಿಕ ಆಹಾರ); NEVER accuse of alcohol, smoking, or drug habits.
   - If Diet indicates ALCOHOL VULNERABILITY, compassionately address their private evening alcohol habit under stress (ಮದ್ಯಪಾನದ ಸೆಳೆತ) and advise conscious detox and spiritual discipline.
   - If Relationship is MARITAL FIDELITY, praise their devotion to family and spouse; NEVER accuse of cheating or extramarital affairs.
   - If Relationship indicates SENSUAL RESTLESSNESS / ROVING EYE, honestly address their inner wandering gaze and distractions (ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆ) causing friction in marriage with ${spouseTerm}, guiding them toward sensory self-control and marital harmony.
   - If devotee is Female, NEVER use 'ಹೆಂಡತಿ' or 'ಪತ್ನಿ' to describe the native.
   - If devotee is a Child (<14), focus purely on education, health, and parent guidance without adult topics.
   - CRITICAL ZERO FALSE ACCUSATION OF CRIMINALITY/THEFT/VIOLENCE: If native has score <= 15 or Jupiter/benefic shield, you MUST NEVER accuse them of crime, theft, violence, murder, imprisonment, cheating, or sexual misconduct. Acknowledge and praise their clean moral integrity and character shield.
`;

        const promptContextWithJson = `${promptContext}

OUTPUT FORMAT INSTRUCTIONS:
Return a valid JSON object matching this schema:
{
  "executiveReadingParagraphs": [
    "Paragraph 1 (Direct Greeting & Acute Current Life Situation - ಹಾಲಿ ಅನುಭವಿಸುತ್ತಿರುವ ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ)",
    "Paragraph 2 (Accurate Specific Profession - ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ ನಿರ್ಣಯ: Which work is he doing?)",
    "Paragraph 3 (Planetary Reality & Turning Point Timeline in English digits)",
    "Paragraph 4 (Practical Remedies, Gemstone, Rudraksha & Gokarna Blessings)"
  ]
}

STRICT RULES:
1. Speak DIRECTLY to the devotee in empathetic, authoritative Vedic pandit voice in natural ${isKn ? "Kannada" : "English"}.
2. NO markdown asterisks (no ** or *).
3. ALL NUMBERS MUST BE IN ENGLISH DIGITS (1, 2, 3, 4, 5, etc.).
4. Return ONLY raw valid JSON.`;

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
            if (parsed.openingIceBreaker && parsed.hiddenSubconsciousWorry) {
              setDynamicTalkingPoints({
                openingIceBreakerKn: cleanAstrologyText(parsed.openingIceBreaker),
                hiddenSubconsciousWorryKn: cleanAstrologyText(parsed.hiddenSubconsciousWorry),
                maandiKarmicImpactKn: cleanAstrologyText(parsed.maandiKarmicImpact || data.currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn),
                karmaFinancialRealityKn: cleanAstrologyText(parsed.karmaFinancialReality || data.currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn),
                immediateTurningPointKn: cleanAstrologyText(parsed.immediateTurningPoint || data.currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn),
                siddhaPariharaRemedyKn: cleanAstrologyText(parsed.siddhaPariharaRemedy || data.currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn)
              });
            }
            if (Array.isArray(parsed.executiveReadingParagraphs) && parsed.executiveReadingParagraphs.length >= 2) {
              setAiNarration(parsed.executiveReadingParagraphs.map(cleanAstrologyText));
            }
          } catch (jsonErr) {
            const rawParagraphs = response.split("\n\n").filter((p) => p.trim().length > 0);
            const cleaned = rawParagraphs.map(cleanAstrologyText);
            if (cleaned.length >= 2) {
              setAiNarration(cleaned);
            }
          }
        }
      } catch (err) {
        console.warn("AI reading fallback to deterministic rules:", err);
      } finally {
        setAiLoading(false);
      }
    })();
  }, [session, geminiApiKey, i18n.language]);

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
          const hasMaritalFidelityQ = gbaQ?.hasMaritalFidelity ?? false;
          const dietSummaryEnQ = gbaQ?.dietSummaryEn || "";
          const fidelitySummaryEnQ = gbaQ?.fidelitySummaryEn || "";
          const negShadesQ = synthesisData.currentDiagnosis.negativeShades;
          const isNegCleanQ = !negShadesQ || negShadesQ.overallScore <= 15 || negShadesQ.isJupiterProtected || negShadesQ.isChildShielded;

          const contextData = `
Devotee: ${session.input.name || "Devotee"}
Gender: ${session.input.gender || "Not Specified"} (${isFemaleQ ? "Female/ಸ್ತ್ರೀ" : "Male/ಪುರುಷ"})
Age: ${devoteeAge} (${isChild ? "Child / Minor (<14 years)" : "Adult (>=14 years)"})
Lagna: ${session.result.lagnaRashi.english} | Moon: ${session.result.moonSign.english} | Nakshatra: ${session.result.planets.find(p => p.name === "Moon")?.nakshatra.english}
Panchanga 5-Angas: Vara=${synthesisData.panchanga.vara.nameKn}, Tithi=${synthesisData.panchanga.tithi.nameKn}, Yoga=${synthesisData.panchanga.yoga.nameKn}, Karana=${synthesisData.panchanga.karana.nameKn}
Technical Placements: 4th=${synthesisData.currentDiagnosis.technicalAspects.fourthHouseDetail}, 7th=${synthesisData.currentDiagnosis.technicalAspects.seventhHouseDetail}, 10th=${synthesisData.currentDiagnosis.technicalAspects.tenthHouseDetail}.
Dasha: ${synthesisData.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}.
Character & Morality Verification:
- Dietary Intake / Addictions: ${isTeetotalerQ ? "STRICT TEETOTALER (ಸಾತ್ವಿಕ ಆಹಾರಿ - Zero alcohol, zero drugs, clean diet due to Guru/benefic protection on 2nd house). If asked about alcohol, drugs, or intoxicants, give an authoritative 'ಇಲ್ಲ!' verdict and celebrate their pure lifestyle." : `ALCOHOL VULNERABILITY (ಮದ್ಯಪಾನ / ಶನಿ-ರಾಹು ದೃಷ್ಟಿ): ${dietSummaryEnQ || "Prone to evening alcohol consumption under stress"}. If asked about drinking or habits, state clearly that stress triggers alcohol intake and urge detox.`}
- Relationship Fidelity: ${hasMaritalFidelityQ ? `HIGH MARITAL FIDELITY (ದಾಂಪತ್ಯ ನಿಷ್ಠೆ - Pure 7th house). If asked about extramarital affairs/infidelity, give an authoritative 'ಇಲ್ಲ!' verdict praising their steadfast devotion to ${spouseTermQ}.` : `SENSUAL RESTLESSNESS & ROVING EYE (ಕಾಮ ಚಾಂಚಲ್ಯ & ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆ): ${fidelitySummaryEnQ || "Prone to sensual restlessness and roving eye"}. If asked about marriage or fidelity, state honestly that inner distractions and roving eyes create friction with ${spouseTermQ}, and urge sensory restraint.`}
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
- ZERO FALSE ACCUSATIONS & CONTRADICTIONS: If the native is a verified Teetotaler (ಸಾತ್ವಿಕ ಆಹಾರಿ), queries regarding alcohol/drugs MUST receive an authoritative 'ಇಲ್ಲ!' verdict. If verified Marital Fidelity, queries regarding infidelity MUST receive an authoritative 'ಇಲ್ಲ!' verdict. If verified Clean from crime/theft/violence, queries regarding criminality, theft, murder, violence, rape, or jail MUST receive an authoritative 'ಇಲ್ಲ!' verdict celebrating their moral purity. DO NOT contradict yourself in subsequent bullets!
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

  const { prescriptions, currentDiagnosis, instantQAList, yajnaHawanaPlan } = synthesisData || {};
  const filteredQA = instantQAList?.filter((item) => activeCategory === "all" || item.category === activeCategory) || [];

  const activeTalkingPoints = dynamicTalkingPoints || (currentDiagnosis ? {
    openingIceBreakerKn: isKn ? currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn : (currentDiagnosis.astrologerTalkingPoints.openingIceBreakerEn || currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn),
    hiddenSubconsciousWorryKn: isKn ? currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn : (currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryEn || currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn),
    maandiKarmicImpactKn: isKn ? currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn : (currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactEn || currentDiagnosis.astrologerTalkingPoints.maandiKarmicImpactKn),
    karmaFinancialRealityKn: isKn ? currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn : (currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityEn || currentDiagnosis.astrologerTalkingPoints.karmaFinancialRealityKn),
    immediateTurningPointKn: isKn ? currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn : (currentDiagnosis.astrologerTalkingPoints.immediateTurningPointEn || currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn),
    siddhaPariharaRemedyKn: isKn ? currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn : (currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyEn || currentDiagnosis.astrologerTalkingPoints.siddhaPariharaRemedyKn)
  } : null);

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

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold">
          <span>🔮</span>
          <span>{isKn ? "ದೈವಜ್ಞ ನೇರ ಸಮಾಲೋಚನೆ & ತ್ವರಿತ ದರ್ಶನ" : "Live Astrologer Consultation Desk"}</span>
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
          {/* 🚨 0. PRIMARY LIFE FOCUS, CRISIS RESOLUTION OR LIFE PHASE STRATEGY 🚨 */}
          {currentDiagnosis?.primaryLifeChallenge && (() => {
            const cls = currentDiagnosis.currentLifeSituation;
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
                        : "🧭"}
                    </span>
                    <div>
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider block ${
                          isAcuteCrisis ? "text-rose-900" : "text-amber-900"
                        }`}
                      >
                        {isKn
                          ? isAcuteCrisis
                            ? "॥ ಪ್ರಸ್ತುತ ತಕ್ಷಣದ ಜೀವಿತ ಬಿಕ್ಕಟ್ಟು & ಮುಕ್ತಿ ಮಾರ್ಗ (Primary Acute Life Crisis & Exit Strategy) ॥"
                            : "॥ ಪ್ರಸ್ತುತ ಜೀವಿತ ಘಟ್ಟ, ದಶಾ-ಗೋಚಾರ ಪ್ರಭಾವ & ಮುನ್ನಡೆ ಮಾರ್ಗ (Current Life Phase & Astrological Strategy) ॥"
                          : isAcuteCrisis
                          ? "॥ Primary Acute Life Crisis & Astrological Exit Strategy ॥"
                          : "॥ Current Life Phase & Astrological Strategy ॥"}
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
                          ? `ನಮಸ್ಕಾರ ${session.input.name || (isChild ? "ಮಗುವಿನ ಪೋಷಕರೇ" : "ಭಕ್ತರೇ")}, ನಿಮ್ಮ ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ ಮತ್ತು ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿಯ ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಉಳಿದೆಲ್ಲ ವಿಷಯಗಳಿಗಿಂತ ಮೊದಲು ನಿಮ್ಮನ್ನು ಪ್ರಸ್ತುತ ಕಾಡುತ್ತಿರುವ ಈ ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.areaKn || currentDiagnosis.primaryLifeChallenge.area)} ವಿಷಯದ ಬಗ್ಗೆ ನಾವು ಮಾತನಾಡಲೇಬೇಕು. ಈ ಕಷ್ಟದಿಂದ ಶೀಘ್ರವಾಗಿ ಹೊರಬರಲು ಗ್ರಹಗಳ ನೈಜ ಸ್ಥಿತಿ, ಬಿಕ್ಕಟ್ಟು ಮುಕ್ತವಾಗುವ ನಿಖರ ಕಾಲಾವಧಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`
                          : `ನಮಸ್ಕಾರ ${session.input.name || (isChild ? "ಮಗುವಿನ ಪೋಷಕರೇ" : "ಭಕ್ತರೇ")}, ನಿಮ್ಮ ${toKannadaRashi(session.result.lagnaRashi.english)} ಲಗ್ನ ಮತ್ತು ${toKannadaRashi(session.result.moonSign.english)} ರಾಶಿಯ (${toKannadaNakshatra(session.result.planets.find(p => p.name === "Moon")?.nakshatra.english) || ""} ನಕ್ಷತ್ರ) ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ಜೀವಿತ ಘಟ್ಟದಲ್ಲಿ ನಿಮ್ಮ ದಶಾ-ಗೋಚಾರ ಸ್ಥಿತಿ ಹಾಗೂ ಮುನ್ನಡೆಯ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`)
                      : cls
                      ? `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, your paramount real-life situation is: ${cleanAstrologyText(cls.headlineEn)}. Under ${currentDiagnosis.prasthuthaSthiti.runningDashaSummary}, ${cleanAstrologyText(cls.detailedRealityEn)}. Here is the astrological root cause, relief timeline, and sacred exit strategy:`
                      : (isAcuteCrisis
                        ? `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, before discussing other life areas, here is the astrological root cause, relief timeline, and sacred exit strategy for your current ${cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.area)} challenge:`
                        : `Namaskara ${session.input.name || (isChild ? "Parents" : "Devotee")}, reviewing your ${session.result.lagnaRashi.english} Ascendant and ${session.result.moonSign.english} Moon sign deeply, here is your planetary guidance, upcoming turning points, and strategic path forward for your current life phase:`)}
                  </p>
                </div>

                {/* 4 Diagnostic & Resolution Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  {/* 1. Core Focus / Nature */}
                  <div
                    className={`p-4 rounded-2xl border-2 bg-white space-y-2 shadow-sm ${
                      isAcuteCrisis ? "border-rose-200" : "border-amber-200"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-bold border-b pb-1.5 text-xs ${
                        isAcuteCrisis ? "text-rose-900 border-rose-100" : "text-amber-900 border-amber-100"
                      }`}
                    >
                      <span>{isAcuteCrisis ? "💥" : "🎯"}</span>
                      <span>
                        {isKn
                          ? isAcuteCrisis
                            ? "ಪ್ರಸ್ತುತ ಬಿಕ್ಕಟ್ಟಿನ ನೈಜ ಸ್ವರೂಪ"
                            : "ಪ್ರಸ್ತುತ ಜೀವಿತ ಘಟ್ಟದ ನೈಜ ಸ್ವರೂಪ"
                          : isAcuteCrisis
                          ? "Nature of Current Crisis"
                          : "Nature of Current Life Phase"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed text-xs">
                      {cleanAstrologyText(
                        isKn
                          ? cls?.detailedRealityKn || currentDiagnosis.primaryLifeChallenge.description
                          : cls?.detailedRealityEn || currentDiagnosis.primaryLifeChallenge.descriptionEn || currentDiagnosis.primaryLifeChallenge.description
                      )}
                    </p>
                  </div>

                  {/* 2. Astrological Alignment / Root Cause */}
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

                  {/* 3. Timeline of Relief / Turning Point */}
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

                  {/* 4. Astrological Remedy & Gokarna Seva */}
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

          {/* 💼 1. DEDICATED SECTION: ACCURATE PROFESSION & VOCATION DETERMINATION (ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ ನಿರ್ಣಯ) 💼 */}
          {currentDiagnosis?.accurateProfession && (() => {
            const prof = currentDiagnosis.accurateProfession;
            return (
              <div className="rounded-3xl border-2 border-indigo-400 bg-gradient-to-b from-indigo-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-300 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 text-white text-2xl shadow-md border border-indigo-300">
                      💼
                    </span>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 block">
                        ॥ ಜಾತಕರ ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ ನಿರ್ಣಯ ॥
                      </span>
                      <h3 className="text-base md:text-xl font-black text-indigo-950 font-serif">
                        {isKn
                          ? `${session.input.name || "ಜಾತಕರ"} ನಿಖರ ಉದ್ಯೋಗ / ಕಾರ್ಯಕ್ಷೇತ್ರ: ${prof.titleKn}`
                          : `${session.input.name || "Devotee"}'s Accurate Vocation: ${prof.titleEn}`}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-950 text-xs font-black border border-indigo-400 shadow-sm flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span>{isKn ? `${prof.confidenceScore}% ನಿಖರ ಹೊಂದಾಣಿಕೆ` : `${prof.confidenceScore}% Classical Alignment`}</span>
                  </span>
                </div>

                {/* Main Profession Summary Box */}
                <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/60 shadow-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specific Role */}
                    <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                        <span>🎯</span>
                        <span>{isKn ? "ನಿರ್ದಿಷ್ಟ ವೃತ್ತಿ ಪಾತ್ರ & ಜವಾಬ್ದಾರಿ (Specific Role):" : "Specific Role & Responsibilities:"}</span>
                      </div>
                      <p className="text-stone-900 font-semibold text-sm leading-relaxed">
                        {cleanAstrologyText(isKn ? prof.specificRoleKn : prof.specificRoleEn)}
                      </p>
                    </div>

                    {/* Work Environment */}
                    <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                        <span>🏢</span>
                        <span>{isKn ? "ದಿನನಿತ್ಯದ ಕಾರ್ಯಕ್ಷೇತ್ರ & ಪರಿಸರ (Work Environment):" : "Daily Work Environment:"}</span>
                      </div>
                      <p className="text-stone-900 font-semibold text-sm leading-relaxed">
                        {cleanAstrologyText(isKn ? prof.workEnvironmentKn : prof.workEnvironmentEn)}
                      </p>
                    </div>
                  </div>

                  {/* Classical Astrological Basis */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-300/80 text-xs text-stone-800 leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-950">
                      <span>🪐</span>
                      <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಕರ್ಮ ಸ್ಥಾನ & ಗ್ರಹ ಸಂಯೋಗ (Astrological Basis):" : "Classical Astrological Basis:"}</span>
                    </div>
                    <p className="font-medium">
                      {cleanAstrologyText(isKn ? prof.astrologicalBasisKn : prof.astrologicalBasisEn)}
                    </p>
                  </div>

                  {/* Classical Pillars Badges */}
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
                  {(currentDiagnosis.goodBadAnalysis.isTeetotaler || currentDiagnosis.goodBadAnalysis.hasMaritalFidelity) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-emerald-50 border-2 border-emerald-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs md:text-sm">
                        <span>✨</span>
                        <span>{isKn ? "ಚಾರಿತ್ರ್ಯ & ಸದಾಚಾರ ದೃಢೀಕರಣ:" : "Character Purity & Moral Integrity:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn
                          ? `${currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍃 ಜಾತಕರ 2ನೇ ಧನ-ಆಹಾರ ಸ್ಥಾನದ ಮೇಲೆ ಗುರು/ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿ ರಕ್ಷಣೆ ಇರುವುದರಿಂದ ಸಾತ್ವಿಕ ಆಹಾರ ಪದ್ಧತಿ ಹೊಂದಿದ್ದು, ಮದ್ಯಪಾನ-ದುಶ್ಚಟಗಳಿಂದ ಮುಕ್ತವಾದ ಪರಿಶುದ್ಧ ಸಾತ್ವಿಕ ಶರೀರ ರಕ್ಷಣೆ ಹೊಂದಿದ್ದಾರೆ. " : ""}${currentDiagnosis.goodBadAnalysis.hasMaritalFidelity ? `💍 7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಶುಭ ಗ್ರಹ ಕವಚವಿರುವುದರಿಂದ ದಾಂಪತ್ಯದಲ್ಲಿ ಅಚಲ ನಿಷ್ಠೆ ಹೊಂದಿದ್ದು, ಅನೈತಿಕ ಸಂಬಂಧಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿದ್ದಾರೆ (${session.input.gender === "Female" ? "ಏಕಪತಿ ವ್ರತ" : "ಏಕಪತ್ನಿ ವ್ರತ"}).` : ""}`
                          : `${currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍃 Benefic and Jupiterian aspects on the 2nd house protect dietary purity, ensuring a clean teetotaler lifestyle free of alcohol or intoxicants. " : ""}${currentDiagnosis.goodBadAnalysis.hasMaritalFidelity ? "💍 Divine protection on the 7th house ensures steadfast marital fidelity and pure moral character." : ""}`}
                      </p>
                    </div>
                  )}

                  {/* HIGHLIGHT BANNER 0B: SELF-RESTRAINT & MARITAL VIGILANCE CAUTION */}
                  {(!currentDiagnosis.goodBadAnalysis.isTeetotaler || !currentDiagnosis.goodBadAnalysis.hasMaritalFidelity) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/80 via-rose-50 to-orange-50 border-2 border-amber-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                        <span>⚠️</span>
                        <span>{isKn ? "ಇಂದ್ರಿಯ ಸಂಯಮ & ಸಾಂಸಾರಿಕ ರಕ್ಷಾ ಎಚ್ಚರಿಕೆ (Self-Restraint & Marital Vigilance):" : "Sensual Restraint & Marital Vigilance:"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                        {isKn
                          ? `${!currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍷 2ನೇ ಆಹಾರ/ಮುಖ ಸ್ಥಾನಕ್ಕೆ ಶನಿ-ರಾಹು ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ಒತ್ತಡದ ಸಮಯದಲ್ಲಿ ಮದ್ಯಪಾನ ಅಥವಾ ವ್ಯಸನಗಳ ಪ್ರಲೋಭನೆಗೆ ಒಳಗಾಗುವ ಸೂಕ್ಷ್ಮತೆ ಇದೆ; ಸಾತ್ವಿಕ ಶಿಸ್ತು ಅತ್ಯಗತ್ಯ. " : ""}${!currentDiagnosis.goodBadAnalysis.hasMaritalFidelity ? "👀 5ನೇ ರಾಹು ಮತ್ತು ನೀಚ ಕುಜನಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಕಾಮ ಚಾಂಚಲ್ಯ ಮತ್ತು ಪರಸ್ತ್ರೀ ಆಕರ್ಷಣೆಯ ಪ್ರವೃತ್ತಿ ಕಾಡಬಹುದು; ಇದು ಸಂಸಾರದಲ್ಲಿ ಹೆಂಡತಿಯೊಂದಿಗೆ ಕಲಹ ತರದಂತೆ ಇಂದ್ರಿಯ ನಿಗ್ರಹ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಅನಿವಾರ್ಯ." : ""}`
                          : `${!currentDiagnosis.goodBadAnalysis.isTeetotaler ? "🍷 Saturn/Rahu aspect on the 2nd house creates vulnerability to alcohol consumption during periods of stress; dietary detox is recommended. " : ""}${!currentDiagnosis.goodBadAnalysis.hasMaritalFidelity ? "👀 Rahu in the 5th and afflicted Mars trigger sensual restlessness and roving eyes; practicing strict sensory self-control is essential to preserve marital peace." : ""}`}
                      </p>
                    </div>
                  )}

                  {/* HIGHLIGHT BANNER 1: SECRET LIFE HABIT */}
                  {currentDiagnosis.goodBadAnalysis.secrecyHabitKn && (
                    <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-400 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                        <span>🎭</span>
                        <span>{isKn ? "ರಹಸ್ಯ ಜೀವನದ ನಡವಳಿಕೆ & ಸಂವಹನ ಪ್ರವೃತ್ತಿ (Secret Life Habit):" : "Secret Life Expression Dynamic:"}</span>
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
    </div>
  );
}
