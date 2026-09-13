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

const CHILD_SUGGESTED_QUESTIONS = [
  { icon: "😭", kn: "ಮಗು ಬೆಳಿಗ್ಗೆಯಿಂದ ಸಂಜೆವರೆಗೆ ಅಳುವುದು ಮತ್ತು ಕಿರಿಕಿರಿ ಏಕೆ ಮಾಡುತ್ತದೆ?", en: "Why does the child cry and throw tantrums all day?" },
  { icon: "⚔️", kn: "ಮಗು ಸದಾ ಜಗಳ, ಹಠ ಮತ್ತು ಸಾಮಾನುಗಳನ್ನು ಎಸೆಯುವುದು ಏಕೆ?", en: "Why is the child aggressive, fighting and throwing toys?" },
  { icon: "🥣", kn: "ಮಗು ಊಟ ತಿನ್ನಲು ನಿರಾಕರಿಸುವುದು ಮತ್ತು ಹೊಟ್ಟೆ ನೋವು ಏಕೆ?", en: "Why does the child refuse food and get stomach colic?" },
  { icon: "👁️", kn: "ಮಗುವಿಗೆ ದೃಷ್ಟಿ ದೋಷ ಮತ್ತು ನಿದ್ದೆಯಲ್ಲಿ ಬೆದರುವುದು ಉಂಟಾಗುತ್ತಿದೆಯೇ?", en: "Is evil eye causing disturbed sleep and night startles?" },
  { icon: "🪔", kn: "ಮಗುವಿನ ಆರೋಗ್ಯ ಮತ್ತು ನೆಮ್ಮದಿಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ಯಾವ ಶಾಂತಿ ಮಾಡಿಸಬೇಕು?", en: "What Gokarna Shanti should be performed for the child?" }
];

const ADULT_SUGGESTED_QUESTIONS = [
  { icon: "🍷", kn: "ಮದ್ಯಪಾನ ಮತ್ತು ದುಶ್ಚಟಗಳ ನೈಜ ಸ್ಥಿತಿ ಹಾಗೂ ಬಿಡುವ ಪರಿಹಾರವೇನು?", en: "What is the reality of drinking addiction and the remedy?" },
  { icon: "👩‍❤️‍👨", kn: "ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ ಅಥವಾ ಬಾಹ್ಯ ಆಕರ್ಷಣೆಯ ಅಪಾಯ ಜಾತಕದಲ್ಲಿದೆಯೇ?", en: "Is there a risk of external affairs or secret attractions?" },
  { icon: "⚖️", kn: "ಅಕ್ರಮ ವ್ಯವಹಾರ, ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್) ಅಥವಾ ಅಡ್ಡದಾರಿ ಹಣದ ರಿಸ್ಕ್ ಇದೆಯೇ?", en: "Is there a risk of unethical trade or illicit shortcuts?" },
  { icon: "💰", kn: "ನನ್ನ ಜೀವನದ ದೊಡ್ಡ ತಿರುವು ಹಾಗೂ ಆರ್ಥಿಕ ಮುನ್ನಡೆ ಯಾವಾಗ ಬರುತ್ತದೆ?", en: "When will my major financial turning point occur?" },
  { icon: "💼", kn: "ಸರ್ಕಾರಿ ಕೆಲಸ ಅಥವಾ ವ್ಯಾಪಾರದಲ್ಲಿ ಯಾವ ಕ್ಷೇತ್ರ ನನಗೆ ಶ್ರೇಷ್ಠ?", en: "Which career or business path is best for me?" },
  { icon: "🕉️", kn: "ಜಾತಕದ ನೆರಳು ಕರ್ಮಗಳನ್ನು ಕರಗಿಸಲು ಗೋಕರ್ಣದಲ್ಲಿ ಯಾವ ಪೂಜೆ ಮಾಡಿಸಬೇಕು?", en: "Which Gokarna Shanti dissolves shadow karmas?" }
];

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
      return;
    }

    const birthDate = session.birthDateYmd || session.input.birthDate || "1990-01-01";
    const birthTime = session.birthTimeHm || session.input.birthTime || "12:00";
    const lat = session.input.latitude || 14.5479;
    const lon = session.input.longitude || 74.3187;

    const data = generatePanchangaAngaSynthesis(session.result, {
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lon,
      lang: i18n.language,
      devoteeName: session.input.name || "Devotee",
      gender: session.input.gender
    });

    setSynthesisData(data);
    setAiNarration(data.multiParagraphExecutiveReading.map(cleanAstrologyText));
    setLoading(false);

    // Trigger AI enhanced live reading with strict formatting instructions
    void (async () => {
      setAiLoading(true);
      try {
        const promptContext = `
Devotee Name: ${session.input.name || "Devotee"}
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
- Current Challenge: ${data.currentDiagnosis.primaryLifeChallenge.area} -> ${data.currentDiagnosis.primaryLifeChallenge.description} (${data.currentDiagnosis.primaryLifeChallenge.planetaryRootCause})
- Prescriptions: ${data.prescriptions.rudraksha.nameKn}, ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}) on ${data.prescriptions.gemstoneRing.fingerKn}.

STRICT WRITING & ASTROLOGER PERSONA RULES:
1. Speak DIRECTLY to the devotee in authoritative, deeply empathetic, face-to-face Vedic Astrologer spoken voice in 100% PURE ${isKn ? "Kannada" : "English"}. NO English words or foreign language mix-up.
2. Use standard traditional Vedic planetary terminology: 'ರವಿ' (Ravi), 'ಕುಜ' (Kuja), 'ಗುರು' (Guru), 'ಶುಕ್ರ' (Shukra), 'ಶನಿ' (Shani), 'ಬುಧ' (Budha), 'ಚಂದ್ರ' (Chandra), 'ರಾಹು' (Rahu), 'ಕೇತು' (Ketu).
3. ZERO CRISIS ASSUMPTIONS: DO NOT assume a tragedy, severe turmoil, or late-night 2:00 to 4:30 AM insomnia. Focus on genuine personality (dignified ego, unyielding conviction, refusal to bow to arbitrary commands), age-appropriate intellectual focus, career independence, and explicit Dosha analysis for relationships & children.
4. Structure your response into 4 comprehensive paragraphs:
   - Paragraph 1: Direct greeting ("ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ."). Reveal their Lagna, Moon, 4th house and authentic dignified personality traits.
   - Paragraph 2: Explain their current life focus and active challenge (${data.currentDiagnosis.primaryLifeChallenge.area} & ${data.currentDiagnosis.primaryLifeChallenge.description}) without generic misery assumptions.
   - Paragraph 3: Explain the astrological planetary reality (10th/7th/4th house aspects & running Dasha-Bhukti). Give an exact turning-point timeline based on running Dasha-Bhukti remaining duration (${data.currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ"}) using ENGLISH DIGITS when breakthroughs occur.
   - Paragraph 4: Prescribe the exact remedies with precision: ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}), ${data.prescriptions.rudraksha.nameKn}, daily morning rituals, and Gokarna Mahabaleshwara Kshetra blessings.
5. DO NOT use markdown bold asterisks (no ** or *). Use clean, plain text.
6. ALL NUMBERS MUST BE IN ENGLISH DIGITS (e.g. 1, 2, 3, 4.25 - 6.5 Carat, 9 Mukhi, 7th house, 10th house, 3 to 6 months).
`;

        const promptContextWithJson = `${promptContext}

OUTPUT FORMAT INSTRUCTIONS:
Return a valid JSON object matching this schema:
{
  "executiveReadingParagraphs": [
    "Paragraph 1 (Direct Greeting, Lagna & Dignified Persona)",
    "Paragraph 2 (Current Focus & Active Challenge)",
    "Paragraph 3 (Planetary Reality & Turning Point Timeline in English digits)",
    "Paragraph 4 (Practical Remedies & Blessings)"
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
          const contextData = `
Devotee: ${session.input.name || "Devotee"}
Gender: ${session.input.gender || "Not Specified"}
Age: ${devoteeAge} (${isChild ? "Child / Minor (<14 years)" : "Adult (>=14 years)"})
Lagna: ${session.result.lagnaRashi.english} | Moon: ${session.result.moonSign.english} | Nakshatra: ${session.result.planets.find(p => p.name === "Moon")?.nakshatra.english}
Panchanga 5-Angas: Vara=${synthesisData.panchanga.vara.nameKn}, Tithi=${synthesisData.panchanga.tithi.nameKn}, Yoga=${synthesisData.panchanga.yoga.nameKn}, Karana=${synthesisData.panchanga.karana.nameKn}
Technical Placements: 4th=${synthesisData.currentDiagnosis.technicalAspects.fourthHouseDetail}, 7th=${synthesisData.currentDiagnosis.technicalAspects.seventhHouseDetail}, 10th=${synthesisData.currentDiagnosis.technicalAspects.tenthHouseDetail}.
Dasha: ${synthesisData.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}.
Prescriptions: ${synthesisData.prescriptions.rudraksha.nameKn}, ${synthesisData.prescriptions.gemstoneRing.primaryGemstoneKn} (${synthesisData.prescriptions.gemstoneRing.caratWeight}).

Question from Devotee: "${q}"

Task: Give a deep, face-to-face conversational Vedic Pandit consultation response in natural spoken ${isKn ? "Kannada" : "English"} adopting this exact conversational spoken tone:
"ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ."

Respond in crisp, structured bullet points directly answering the devotee's specific question. The very FIRST bullet point MUST be the direct verdict/answer:
• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: Direct, unambiguous verdict in 1-2 powerful sentences (e.g., if asked about extramarital attraction: state clearly "ಇಲ್ಲ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕಳತ್ರ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದೆ..." or "ಹೌದು...", if marriage timing: give exact months, if debt: state clear clearance timeline). MUST be the 1st bullet point!
• 🎯 ಶಾಸ್ತ್ರೀಯ ಕಾರಣ & ಗ್ರಹ ಸ್ಥಿತಿ: Exact planetary positions, houses, dasha-bhukti, and gochara transits influencing this question and explaining why this verdict is true.
• ⏳ ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು: Exact turning point timeline in English digits calculated from running Dasha-Bhukti remaining duration (${synthesisData.currentDiagnosis.dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ"}).
• 🪔 ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ: Prescribe authentic Vedic remedies, Gokarna Mahabaleshwara Shanti Pooja, and sacred practices to resolve this issue.

STRICT RULES:
- ZERO CONTRADICTIONS: If the answer is "ಇಲ್ಲ" (e.g. no extramarital affairs, morality is intact), DO NOT contradict yourself in subsequent bullets by warning about secret affairs leaking or prescribing lust suppression!
- DO NOT invent tragedies, crimes, or fake scandals.
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
          session.input.gender
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
        session.input.gender
      );
      setQaHistory((prev) => [{ question: q, answer: fallbackAns }, ...prev]);
      setQuestionInput("");
    } finally {
      setAnswering(false);
    }
  };

  if (!session || !session.result) {
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
          {/* 🚨 0. PRIMARY ACUTE LIFE CRISIS & IMMEDIATE EXIT STRATEGY (ಮುಖ್ಯ ಪ್ರಸ್ತುತ ಬಿಕ್ಕಟ್ಟು & ತ್ವರಿತ ಪರಿಹಾರ) 🚨 */}
          {currentDiagnosis?.primaryLifeChallenge && (
            <div className="rounded-3xl border-2 border-rose-400 bg-gradient-to-br from-rose-50/95 via-amber-50/70 to-white p-6 md:p-8 text-stone-950 shadow-xl space-y-5 ring-1 ring-rose-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white text-2xl shadow-md border border-rose-300">
                    {currentDiagnosis.primaryLifeChallenge.area === "Personal / Marriage"
                      ? "💍"
                      : currentDiagnosis.primaryLifeChallenge.area === "Financial / Debts"
                      ? "💰"
                      : currentDiagnosis.primaryLifeChallenge.area === "Career / Workplace"
                      ? "💼"
                      : currentDiagnosis.primaryLifeChallenge.area === "Health / Vitality" || currentDiagnosis.primaryLifeChallenge.area === "Health / Physical"
                      ? "🩺"
                      : "⚡"}
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 block">
                      {isKn
                        ? "॥ ಪ್ರಸ್ತುತ ತಕ್ಷಣದ ಜೀವಿತ ಬಿಕ್ಕಟ್ಟು & ಮುಕ್ತಿ ಮಾರ್ಗ (Primary Acute Life Crisis & Exit Strategy) ॥"
                        : "॥ Primary Acute Life Crisis & Astrological Exit Strategy ॥"}
                    </span>
                    <h3 className="text-base md:text-xl font-black text-rose-950 font-serif">
                      {cleanAstrologyText(isKn ? (currentDiagnosis.primaryLifeChallenge.areaKn || currentDiagnosis.primaryLifeChallenge.area) : currentDiagnosis.primaryLifeChallenge.area)}
                    </h3>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-950 text-xs font-black border border-rose-300 shadow-sm flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                  <span>{isKn ? "ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯ (Top Priority)" : "Top Priority Life Focus"}</span>
                </span>
              </div>

              {/* Pandit Direct Empathetic Spoken Voice */}
              <div className="p-4 rounded-2xl bg-rose-100/70 border border-rose-200/90 text-stone-900 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗣️</span>
                  <b className="text-xs uppercase tracking-wider text-rose-950">
                    {isKn ? "ದೈವಜ್ಞರ ಮೊದಲ ನೇರ ಮಾತು (Astrologer's Immediate Spoken Counsel):" : "Astrologer's Primary Spoken Counsel:"}
                  </b>
                </div>
                <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                  {isKn
                    ? `ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ, ಉಳಿದೆಲ್ಲ ವಿಷಯಗಳಿಗಿಂತ ಮೊದಲು ನಿಮ್ಮನ್ನು ಪ್ರಸ್ತುತ ತೀವ್ರವಾಗಿ ಕಾಡುತ್ತಿರುವ ಈ ಪ್ರಮುಖ ಜೀವಿತ ಬಿಕ್ಕಟ್ಟಿನ ಬಗ್ಗೆ ನಾವು ಮಾತನಾಡಲೇಬೇಕು. ಈ ಕಷ್ಟದಿಂದ ಶೀಘ್ರವಾಗಿ ಹೊರಬರಲು ಗ್ರಹಗಳ ನೈಜ ಸ್ಥಿತಿ, ಬಿಕ್ಕಟ್ಟು ಮುಕ್ತವಾಗುವ ನಿಖರ ಕಾಲಾವಧಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಮಾರ್ಗೋಪಾಯ ಇಲ್ಲಿದೆ:`
                    : `Namaskara ${session.input.name || "Devotee"}, reviewing your birth chart deeply, before discussing other life areas, we must first address this acute life challenge that is causing you immediate distress. Here is the astrological diagnosis, relief timeline, and sacred exit strategy to overcome this:`}
                </p>
              </div>

              {/* 4 Diagnostic & Resolution Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                {/* 1. Core Crisis Nature */}
                <div className="p-4 rounded-2xl border-2 border-rose-200 bg-white space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-900 font-bold border-b border-rose-100 pb-1.5 text-xs">
                    <span>💥</span>
                    <span>{isKn ? "ಪ್ರಸ್ತುತ ಬಿಕ್ಕಟ್ಟಿನ ನೈಜ ಸ್ವರೂಪ" : "Nature of Current Crisis"}</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed text-xs">
                    {cleanAstrologyText(isKn ? currentDiagnosis.primaryLifeChallenge.description : (currentDiagnosis.primaryLifeChallenge.descriptionEn || currentDiagnosis.primaryLifeChallenge.description))}
                  </p>
                </div>

                {/* 2. Astrological Root Cause */}
                <div className="p-4 rounded-2xl border-2 border-amber-200 bg-white space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-900 font-bold border-b border-amber-100 pb-1.5 text-xs">
                    <span>🪐</span>
                    <span>{isKn ? "ಗ್ರಹಗಳ ಶಾಸ್ತ್ರೀಯ ಮೂಲ ಕಾರಣ" : "Astrological Root Cause"}</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed text-xs">
                    {cleanAstrologyText(isKn ? currentDiagnosis.primaryLifeChallenge.planetaryRootCause : (currentDiagnosis.primaryLifeChallenge.planetaryRootCauseEn || currentDiagnosis.primaryLifeChallenge.planetaryRootCause))}
                  </p>
                </div>

                {/* 3. Timeline of Relief */}
                <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-100 pb-1.5 text-xs">
                    <span>⏳</span>
                    <span>{isKn ? "ಬಿಕ್ಕಟ್ಟು ಕರಗುವ ನಿಖರ ಕಾಲಾವಧಿ" : "Turning Point & Relief Timeline"}</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed text-xs">
                    {cleanAstrologyText(
                      isKn
                        ? (currentDiagnosis.dashaTiming?.timelineKn
                          ? `ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿಯ ಪ್ರಕಾರ, ಇನ್ನು ${currentDiagnosis.dashaTiming.timelineKn} ಒಳಗೆ ಈ ಬಿಕ್ಕಟ್ಟಿನಿಂದ ಹೊರಬರಲು ಪ್ರಮುಖ ಸಕಾರಾತ್ಮಕ ತಿರುವು ಮತ್ತು ದಾರಿ ಗೋಚರಿಸಲಿದೆ.`
                          : "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಮುಕ್ತಾಯವಾಗುವ ಹೊತ್ತಿಗೆ ಈ ಬಿಕ್ಕಟ್ಟು ಶಾಂತವಾಗಲಿದೆ.")
                        : (currentDiagnosis.dashaTiming?.timelineEn
                          ? `According to ongoing Dasha-Bhukti, a decisive relief turning point will manifest within ${currentDiagnosis.dashaTiming.timelineEn}.`
                          : "Relief unfolds as the ongoing Dasha-Bhukti completes.")
                    )}
                  </p>
                </div>

                {/* 4. Immediate Exit Strategy & Gokarna Seva */}
                <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-white space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold border-b border-emerald-100 pb-1.5 text-xs">
                    <span>🪔</span>
                    <span>{isKn ? "ಈ ಬಿಕ್ಕಟ್ಟಿನಿಂದ ಹೊರಬರಲು ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ" : "Exit Strategy & Gokarna Remedy"}</span>
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed text-xs">
                    {cleanAstrologyText(
                      isKn
                        ? (currentDiagnosis.primaryLifeChallenge.solutionKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ.")
                        : (currentDiagnosis.primaryLifeChallenge.solutionEn || "Perform Sankalpa Pooja at Sri Kshetra Gokarna.")
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🌟 1. DEDICATED SECTION: GOOD THINGS ABOUT HIM (ವ್ಯಕ್ತಿಯ ಉತ್ತಮ ಗುಣಗಳು & ದೈವಿಕ ಸಾಮರ್ಥ್ಯಗಳು) 🌟 */}
          {currentDiagnosis?.goodBadAnalysis?.goodTraits && (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-950 text-2xl shadow-md border border-amber-300">
                    🌟
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                      ॥ ಸದ್ಗುಣ, ಧೈರ್ಯ & ದೈವಿಕ ಆತ್ಮಬಲ ದರ್ಶನ ॥
                    </span>
                    <h3 className="text-base md:text-xl font-black text-amber-950 font-serif">
                      {isKn
                        ? (isChild ? "ಮಗುವಿನ ಉತ್ತಮ ಗುಣಗಳು & ದೈವಿಕ ಸಾಮರ್ಥ್ಯಗಳು (Child Strengths & Divine Qualities)" : "ವ್ಯಕ್ತಿಯ ಉತ್ತಮ ಗುಣಗಳು & ದೈವಿಕ ಸಾಮರ್ಥ್ಯಗಳು (Good Things & Divine Strengths)")
                        : (isChild ? "Child Strengths & Divine Qualities" : "Good Things & Divine Strengths")}
                    </h3>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black border border-amber-400 shadow-sm">
                  {isKn ? "5 ಪ್ರಮುಖ ಸದ್ಗುಣಗಳು" : "5 Master Virtues"}
                </span>
              </div>

              {/* Good Traits Cards Grid */}
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

          {/* ⚠️ 2. DEDICATED SECTION: BAD THINGS, SHADOW SECRETS & ADDICTIONS (ದೋಷಗಳು, ದುರ್ಬಲತೆಗಳು & ರಹಸ್ಯ ನೆರಳು ಪ್ರವೃತ್ತಿಗಳು) ⚠️ */}
          {currentDiagnosis?.goodBadAnalysis?.badTraits && (
            <div className="rounded-3xl border-2 border-rose-300 bg-gradient-to-b from-rose-50/50 via-white to-amber-50/40 p-6 md:p-8 text-stone-950 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-amber-500 text-neutral-950 text-2xl shadow-md border border-rose-300">
                    ⚠️
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 block">
                      ॥ ನೆರಳು ಕರ್ಮ, ರಹಸ್ಯ ಕಾಮನೆಗಳು & ಪ್ರಾಯಶ್ಚಿತ್ತ ದರ್ಶನ ॥
                    </span>
                    <h3 className="text-base md:text-xl font-black text-rose-950 font-serif">
                      {isKn
                        ? (isChild
                          ? "ಮಗುವಿನ ನಡವಳಿಕೆಯ ಸವಾಲುಗಳು, ಕಿರಿಕಿರಿ & ಬಾಲಾರಿಷ್ಟ ದೋಷಗಳು (Childhood Tantrums, Crying & Afflictions)"
                          : "ವ್ಯಕ್ತಿಯ ದುರ್ಬಲತೆಗಳು, ದೋಷಗಳು & ರಹಸ್ಯ ನೆರಳು ಪ್ರವೃತ್ತಿಗಳು (Bad Things, Shadow Vices & Addictions)")
                        : (isChild ? "Childhood Behavioral Challenges, Crying & Afflictions" : "Bad Things, Shadow Secrets & Vulnerabilities")}
                    </h3>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-950 text-xs font-black border border-rose-300 shadow-sm">
                  {isKn ? "ಎಚ್ಚರಿಕೆ & ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ" : "Shadow Pitfalls & Remedies"}
                </span>
              </div>

              {/* HIGHLIGHT BANNER 1: SECRET LIFE HABIT (ರಹಸ್ಯ ಜೀವನದ ವರ್ತನೆ) */}
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

              {/* HIGHLIGHT BANNER 2: GOKARNA PRAYASHCHITTA (ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಾಯಶ್ಚಿತ್ತ ಪರಿಹಾರ) */}
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
                {currentDiagnosis.goodBadAnalysis.badTraits.map((trait) => (
                  <div
                    key={trait.id}
                    className={`p-5 rounded-2xl border-2 border-rose-200 bg-white space-y-3 shadow-md transition-all hover:border-rose-400 ${
                      trait.id === 6 || trait.id === 7 ? "md:col-span-2 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-amber-400" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                      <span className="font-black text-sm flex items-center gap-2 text-rose-950">
                        <span className="text-lg">{trait.icon}</span>
                        <span>{trait.id}. {isKn ? trait.titleKn : trait.titleEn}</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold border border-rose-300">
                        {isKn ? trait.badgeKn : trait.badgeEn}
                      </span>
                    </div>

                    <p className="text-stone-800 leading-relaxed font-medium bg-rose-50/40 p-3.5 rounded-xl border border-rose-100">
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

          {/* 🌟 3. 11 MASTER ASTROLOGICAL LIFE & PERSONALITY REVELATIONS (11 ಪ್ರಮುಖ ಮುಖಾಮುಖಿ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯಾಂಶಗಳು) 🌟 */}
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
                      {isKn ? `${synthesisData.tenLifeAspectBullets.length} ಪ್ರಮುಖ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯಾಂಶಗಳು & ವ್ಯಕ್ತಿತ್ವ ದರ್ಶನ` : `${synthesisData.tenLifeAspectBullets.length} Master Astrological Life & Personality Revelations`}
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
                {synthesisData.tenLifeAspectBullets.map((bullet) => (
                  <div
                    key={bullet.id}
                    className={`p-5 rounded-2xl border-2 space-y-3 shadow-md transition-all ${
                      bullet.id === 1 || bullet.id === 10 || bullet.id === 11
                        ? "md:col-span-2 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-amber-400 ring-1 ring-amber-300"
                        : bullet.doshaSpecifics?.hasDosha
                        ? "bg-white border-rose-300 ring-1 ring-rose-200"
                        : "bg-white border-amber-200 hover:border-amber-400"
                    }`}
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                      <span className="font-black text-sm flex items-center gap-2 text-amber-950">
                        <span className="text-lg">{bullet.icon}</span>
                        <span>{bullet.id}. {isKn ? bullet.titleKn : bullet.titleEn}</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        {isKn ? bullet.badgeKn : bullet.badgeEn}
                      </span>
                    </div>

                    {/* READING BODY */}
                    <p className="text-stone-800 leading-relaxed font-medium bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CURRENT SITUATION MULTI-PARAGRAPH LIVE READING */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg md:text-xl font-black text-indigo-950 flex items-center gap-2 font-serif">
                <span>🪔</span>
                <span>{isKn ? "ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಪಂಚಾಂಗ ಗ್ರಹ ಪ್ರಭಾವಗಳ ನೇರ ವಿಶ್ಲೇಷಣೆ" : "Live Astrological Situation & Life Overview"}</span>
              </h2>
              {aiLoading && (
                <span className="text-xs text-amber-700 font-semibold animate-pulse flex items-center gap-1.5">
                  <GrahaSpinner size="sm" />
                  <span>{isKn ? "ದೈವಜ್ಞ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Refining reading..."}</span>
                </span>
              )}
            </div>

            <div className="space-y-3.5 text-xs md:text-sm text-stone-700 leading-relaxed">
              {aiNarration.map((para, idx) => (
                <p key={idx} className="bg-stone-50/80 p-4 rounded-2xl border border-stone-100/90 text-stone-800">
                  {cleanAstrologyText(para)}
                </p>
              ))}
            </div>

            {/* QUICK HIGHLIGHT BADGES */}
            {currentDiagnosis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                    🧠 {isKn ? "ಮಾನಸಿಕ ಸ್ಥಿತಿ & ಅಂತರಂಗ ಶಾಂತಿ" : "Mind & Inner Peace"}
                  </span>
                  <p className="text-xs text-amber-950 font-medium">
                    {cleanAstrologyText(currentDiagnosis.mentalStateIssue.diagnosis)}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block mb-1">
                    🎯 {isKn ? `ಪ್ರಮುಖ ಜೀವನ ಸವಾಲು (${toKannadaChallengeArea(currentDiagnosis.primaryLifeChallenge.area)})` : `Primary Life Challenge (${currentDiagnosis.primaryLifeChallenge.area})`}
                  </span>
                  <p className="text-xs text-indigo-950 font-medium">
                    {cleanAstrologyText(currentDiagnosis.primaryLifeChallenge.description)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. ONE-TAP CATEGORIZED QUESTIONS (INSTANT CLIENT Q&A CARDS) */}
          <div className="rounded-3xl border border-indigo-200 bg-white p-6 md:p-8 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100 gap-2">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-900 tracking-wider block">
                  ಕ್ಲೈಂಟ್ ಕೇಳಬಹುದಾದ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು (1-Click Instant Answers)
                </span>
                <h3 className="text-base md:text-lg font-black text-indigo-950 font-serif">
                  {isKn ? "ತ್ವರಿತ ಪ್ರಶ್ನೋತ್ತರ ಪಟ್ಟಿ (ಪ್ರಶ್ನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಉತ್ತರ ಪಡೆಯಿರಿ)" : "Common Devotee Questions (1-Click Pandit Response)"}
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
                    {isKn ? "ಜಾತಕ & ಪಂಚಾಂಗಾಧಾರಿತ 100% ನಿಖರ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣಗಳು" : "Panchanga Unified Astrological Prescriptions (100% Accurate)"}
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
                      {isKn ? "ಜಾತಕ ಶಾಸ್ತ್ರೋಕ್ತ ಪಿತೃ ಕಾರ್ಯ & ದೇವತಾ ಯಜ್ಞ-ಹವನಗಳು" : "Chart-Specific Pitru Karya & Deva Yajna Prescriptions"}
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
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha ? "bg-amber-200 text-amber-950 border border-amber-400" : "bg-emerald-100 text-emerald-950 border border-emerald-300"}`}>
                    {yajnaHawanaPlan.pitruDoshaAssessment.severityLabelKn}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                  {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.detailedExplanationKn)}
                </p>

                {yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha && (
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
                )}

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
                {isKn ? "ಯಾವುದೇ ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ (ಧ್ವನಿ ಅಥವಾ ಟೈಪ್ ಮೂಲಕ)" : "Ask Any Specific Follow-up Question"}
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
                {(isChild ? CHILD_SUGGESTED_QUESTIONS : ADULT_SUGGESTED_QUESTIONS).map((sq, idx) => (
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
