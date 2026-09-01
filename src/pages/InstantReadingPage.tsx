import { toKannadaRashi, toKannadaNakshatra, toKannadaPlanet, toKannadaDeity, toKannadaColor, toKannadaDirection, toKannadaChallengeArea, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  generatePanchangaAngaSynthesis,
  type PanchangaSynthesisOutput,
  type InstantQAQuestion
} from "../core/PanchangaAngaSynthesisEngine";
import { askGemini } from "../core/GeminiEngine";
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
  const [activeCategory, setActiveCategory] = useState<"all" | "career" | "marriage" | "mind" | "wealth">("all");
  const [selectedQA, setSelectedQA] = useState<InstantQAQuestion | null>(null);

  // Custom Q&A State
  const [questionInput, setQuestionInput] = useState("");
  const [answering, setAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isKn = i18n.language.startsWith("kn");

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
      devoteeName: session.input.name || "Devotee"
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
1. Speak DIRECTLY to the devotee in authoritative, deeply empathetic, face-to-face Vedic Astrologer spoken voice in 100% PURE ${isKn ? "Kannada" : "English"}. NO English words or foreign language mix-up (e.g. NEVER write 'Leo', 'Cancer', 'Pushya', 'Mars', 'Sun' inside Kannada sentences).
2. Use standard traditional Vedic planetary terminology:
   - Use 'ರವಿ' (Ravi) for Sun (NEVER 'Sun' or 'ಸೂರ್ಯ').
   - Use 'ಕುಜ' (Kuja) for Mars (NEVER 'Mars' or 'ಮಂಗಳ').
   - Use 'ಗುರು' for Jupiter, 'ಶುಕ್ರ' for Venus, 'ಶನಿ' for Saturn, 'ಬುಧ' for Mercury, 'ಚಂದ್ರ' for Moon, 'ರಾಹು' for Rahu, 'ಕೇತು' for Ketu.
   - Use pure Kannada Rashi names: ಮೇಷ, ವೃಷಭ, ಮಿಥುನ, ಕರ್ಕಾಟಕ, ಸಿಂಹ, ಕನ್ಯಾ, ತುಲಾ, ವೃಶ್ಚಿಕ, ಧನುಸ್ಸು, ಮಕರ, ಕುಂಭ, ಮೀನ.
   - Use pure Kannada Nakshatra names with perfect Vathakshara: ಅಶ್ವಿನಿ, ಭರಣಿ, ಕೃತ್ತಿಕಾ, ರೋಹಿಣಿ, ಮೃಗಶಿರಾ, ಆರಿದ್ರಾ, ಪುನರ್ವಸು, ಪುಷ್ಯ, ಆಶ್ಲೇಷ, ಮಖಾ, ಪುಬ್ಬಾ, ಉತ್ತರಾ, ಹಸ್ತಾ, ಚಿತ್ತಾ, ಸ್ವಾತಿ, ವಿಶಾಖಾ, ಅನೂರಾಧಾ, ಜ್ಯೇಷ್ಠಾ, ಮೂಲಾ, ಪೂರ್ವಾಷಾಢಾ, ಉತ್ತರಾಷಾಢಾ, ಶ್ರವಣ, ಧನಿಷ್ಠಾ, ಶತಭಿಷಾ, ಪೂರ್ವಾಭಾದ್ರಾ, ಉತ್ತರಾಭಾದ್ರಾ, ರೇವತಿ.
3. Every sub-level reading and question response MUST have COMPLETE 4 DETAILED DENSE PARAGRAPHS (at least 6 to 7 lines per paragraph), 100% accurate to their Kundali, running Dasha-Bhukti, and Gochara.
2. Must write EXACTLY 4 comprehensive, dense paragraphs:
   - Paragraph 1: Address the devotee directly. Reveal that you know why they came today—an unexpected incident or turmoil recently disturbed their peace. Mention their 4th house and Moon's sensitive placement causing late-night overthinking (2:00 AM to 4:30 AM) and unspoken inner burden.
   - Paragraph 2: Explain the exact active friction in their life right now (${data.currentDiagnosis.primaryLifeChallenge.area} & ${data.currentDiagnosis.primaryLifeChallenge.description}). Explain how their good intentions have been misunderstood, or how their efforts are being delayed despite immense dedication.
   - Paragraph 3: Explain the astrological planetary reality (10th/7th/4th house aspects & running Dasha-Bhukti). Give an exact turning-point timeline (e.g. Next 3 to 5 Months) using ENGLISH DIGITS when the cloud lifts and breakthroughs occur.
   - Paragraph 4: Prescribe the exact remedies with precision: ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}), ${data.prescriptions.rudraksha.nameKn}, daily morning rituals, and Gokarna Mahabaleshwara Kshetra blessings.
3. DO NOT use markdown bold asterisks (no ** or *). Use clean, plain text.
4. ALL NUMBERS MUST BE IN ENGLISH DIGITS (e.g. 1, 2, 3, 4.25 - 6.5 Carat, 9 Mukhi, 7th house, 10th house, 3 to 5 months).
`;

        const promptContextWithJson = `${promptContext}

OUTPUT FORMAT INSTRUCTIONS:
Return a valid JSON object matching this schema:
{
  "openingIceBreaker": "2 dense paragraphs starting with 'ನೋಡಿ...' naming their Lagna, Nakshatra, uncovering their core personality and revealing the recent trigger incident/turmoil that disturbed their peace.",
  "hiddenSubconsciousWorry": "2 dense paragraphs describing their unspoken inner anxiety, late-night overthinking (2:00 ರಿಂದ 4:30), emotional dilemma, and feelings of being misunderstood.",
  "maandiKarmicImpact": "2 dense paragraphs in pure Kannada analyzing shadow planet Maandi in their house, its karmic influence, and Gokarna Maandi Shanti remedy.",
  "karmaFinancialReality": "2 dense paragraphs detailing their 10th house karma, workplace struggle, why rewards are delayed despite 100% dedication, and money leakage.",
  "immediateTurningPoint": "2 dense paragraphs detailing the exact turning point timeline (Next 3 to 5 Months) using ENGLISH DIGITS, explaining the Dasha-Bhukti and Gochara planetary shift.",
  "siddhaPariharaRemedy": "2 dense paragraphs detailing the exact Gemstone (${data.prescriptions.gemstoneRing.primaryGemstoneKn}, ${data.prescriptions.gemstoneRing.caratWeight}), Rudraksha (${data.prescriptions.rudraksha.nameKn}), daily rituals, and Gokarna Kshetra Sankalpa.",
  "executiveReadingParagraphs": [
    "Paragraph 1 (The Trigger Incident & Persona)",
    "Paragraph 2 (Current Conflict & Good Intentions Misunderstood)",
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

  // Handle Asking Custom Astrologer Question
  const handleAskQuestion = async (customQ?: string) => {
    const q = (customQ || questionInput).trim();
    if (!q || !session || !session.result || !synthesisData) return;

    setAnswering(true);
    try {
      const contextData = `
Devotee: ${session.input.name || "Devotee"}
Lagna: ${session.result.lagnaRashi.english} | Moon: ${session.result.moonSign.english} | Nakshatra: ${session.result.planets.find(p => p.name === "Moon")?.nakshatra.english}
Panchanga 5-Angas: Vara=${synthesisData.panchanga.vara.nameKn}, Tithi=${synthesisData.panchanga.tithi.nameKn}, Yoga=${synthesisData.panchanga.yoga.nameKn}, Karana=${synthesisData.panchanga.karana.nameKn}
Technical Placements: 4th=${synthesisData.currentDiagnosis.technicalAspects.fourthHouseDetail}, 7th=${synthesisData.currentDiagnosis.technicalAspects.seventhHouseDetail}, 10th=${synthesisData.currentDiagnosis.technicalAspects.tenthHouseDetail}.
Dasha: ${synthesisData.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}.
Prescriptions: ${synthesisData.prescriptions.rudraksha.nameKn}, ${synthesisData.prescriptions.gemstoneRing.primaryGemstoneKn} (${synthesisData.prescriptions.gemstoneRing.caratWeight}).

Question from Devotee: "${q}"

Task: Give a deep, face-to-face conversational Vedic Pandit consultation response in natural spoken ${isKn ? "Kannada" : "English"} adopting this exact conversational spoken tone:
"ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ. ನೋಡಿದ್ರೆ ಇದರಲ್ಲಿ ಇರುವಂತಹ..."

Structure your response into 3-4 detailed dense paragraphs:
1. Paragraph 1 (Direct Spoken Hook & Planetary Placement): Start with "ನಮಸ್ಕಾರ ${session.input.name || "ಭಕ್ತರೇ"}, ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ...". Identify the exact house/planet combination (4th/7th/10th house) and validate their mental state/frustration.
2. Paragraph 2 (Day-to-day Struggle & Insomnia): Describe their late-night overthinking (2:00 AM to 4:30 AM), sleeplessness, lack of appreciation, and emotional weight.
3. Paragraph 3 (Astrological Turning Point & Exact Timeline): Explain the Dasha-Bhukti and Gochara transit shift, giving concrete timing in ENGLISH DIGITS (e.g. Next 3 to 5 Months) when relief and breakthrough manifest.
4. Paragraph 4 (Practical Remedies & Divine Blessing): Prescribe ${synthesisData.prescriptions.gemstoneRing.primaryGemstoneKn} (${synthesisData.prescriptions.gemstoneRing.caratWeight}), ${synthesisData.prescriptions.rudraksha.nameKn}, daily morning rituals, and Gokarna Mahabaleshwara Kshetra blessings.
STRICT RULES:
- DO NOT use markdown asterisks (no ** or *). Use clean, natural text.
- ALL numbers must be in ENGLISH DIGITS (1, 2, 3, 4, 5, etc.).
`;

      const ans = await askGemini(
        q,
        contextData,
        geminiApiKey,
        isKn ? "kn" : "en",
        { temperature: 0.2 }
      );

      setQaHistory((prev) => [{ question: q, answer: cleanAstrologyText(ans) }, ...prev]);
      setQuestionInput("");
    } catch (err: any) {
      alert(isKn ? "ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ." : "Failed to get answer. Please check network/API key and try again.");
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <span>←</span>
          <span>{isKn ? "ಕುಂಡಲಿಗೆ ಹಿಂತಿರುಗಿ" : "Back to Birth Chart"}</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold">
          <span>🔮</span>
          <span>{isKn ? "ದೈವಜ್ಞ ನೇರ ಸಮಾಲೋಚನೆ & ತ್ವರಿತ ದರ್ಶನ" : "Live Astrologer Consultation Desk"}</span>
        </div>
      </div>

      {/* DEVOTEE PROFILE BANNER */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-neutral-950 via-stone-900 to-amber-950 p-6 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-amber-500/30">
              ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ ಮಂಡಲ ॥
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 font-serif">
              {session.input.name || "Devotee"} {isKn ? "ಅವರ ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಫಲಿತ ದರ್ಶನ" : "- Live Life Situation Reading"}
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              ಲಗ್ನ: <b className="text-amber-200">{toKannadaRashi(session.result.lagnaRashi.english)}</b> • ರಾಶಿ: <b className="text-amber-200">{toKannadaRashi(session.result.moonSign.english)}</b> • ನಕ್ಷತ್ರ: <b className="text-amber-200">{toKannadaNakshatra(session.result.planets.find(p => p.name === "Moon")?.nakshatra.english)} (ಪಾದ {session.result.moonPada})</b> • ಪ್ರಸ್ತುತ ದಶಾ: <b className="text-yellow-300">{cleanAstrologyText(currentDiagnosis?.prasthuthaSthiti.runningDashaSummary.split("|")[0] || "")}</b>
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-900/40 border border-amber-400/40 text-right">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆ</span>
            <span className="text-sm font-black text-white">100% ಶಾಸ್ತ್ರೋಕ್ತ ಫಲಿತ</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-semibold text-indigo-950 animate-pulse">
            {isKn ? "ಪಂಚಾಂಗದ ಪಂಚ ಅಂಗಗಳು ಹಾಗೂ ದಶಾ-ಗೋಚರ ಸ್ಥಿತಿಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Computing 5-Angas, Dasha, and Gochara transits..."}
          </p>
        </Card>
      ) : (
        <>
          {/* 🌟 1. SECRET TALKING POINTS FOR THE ASTROLOGER (ದೈವಜ್ಞ ಮಾರ್ಗದರ್ಶಿ / 5 Master Verbal Prompts) 🌟 */}
          {activeTalkingPoints && (
            <div className="rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-r from-emerald-950 via-slate-950 to-neutral-900 p-6 md:p-8 text-white shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl shadow-inner border border-emerald-500/40">
                    🗣️
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                      ದೈವಜ್ಞರ ನೇರ ನುಡಿ ಮಾರ್ಗದರ್ಶಿ (Astrologer's Direct Verbal Prompts)
                    </span>
                    <h3 className="text-base md:text-lg font-black text-emerald-100">
                      {isKn ? "ಕ್ಲೈಂಟ್‌ಗೆ ನೇರವಾಗಿ ಹೇಳಬೇಕಾದ ೬ ಪ್ರಮುಖ ಸತ್ಯಾಂಶಗಳು (Say these directly)" : "6 Master Authoritative Speaking Points"}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                    {isKn ? "೬ ರಹಸ್ಯ ದೈವಜ್ಞ ನುಡಿಗಳು" : "6 Secret Astrologer Cues"}
                  </span>
                </div>
              </div>

              {/* 6 Dynamic Multi-Paragraph Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                {/* 1. Opening Icebreaker / The Grill */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-emerald-500/30 space-y-2.5 md:col-span-2 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>{isKn ? "೧. ಆರಂಭಿಕ ಮುಖಾಮುಖಿ ಸತ್ಯ (ನೇರ ದೈವಿಕ ನುಡಿ):" : "1. Opening Icebreaker & Direct Hook:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {isKn ? "ಮುಖಾಮುಖಿ ವಿಶ್ಲೇಷಣೆ" : "The Grill"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.openingIceBreakerKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* 2. Hidden Subconscious Worry */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-emerald-500/30 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                      <span>🧠</span>
                      <span>{isKn ? "೨. ಆಂತರಿಕ ಸುಪ್ತ ಆತಂಕ & ನಿದ್ರಾಹೀನತೆ:" : "2. Hidden Subconscious Worry & Mental State:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {isKn ? "ಮನಸ್ಸು & ನಿದ್ರೆ" : "Mind & Sleep"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.hiddenSubconsciousWorryKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* 3. Maandi Sthiti & Karmic Node Impact (3RD PLACE) */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-amber-400/50 space-y-2.5 shadow-lg ring-1 ring-amber-400/30">
                  <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                    <span className="text-amber-300 font-black text-sm flex items-center gap-1.5">
                      <span>🪐</span>
                      <span>{isKn ? "೩. ಮಾಂದಿ ಗ್ರಹ ಸ್ಥಿತಿ & ಸೂಕ್ಷ್ಮ ಛಾಯಾ ಕರ್ಮ ಪ್ರಭಾವ:" : "3. Maandi Sthiti & Karmic Node Impact:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 font-bold">
                      {isKn ? "ಮಾಂದಿ ಸ್ಥಿತಿ" : "Maandi Node"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.maandiKarmicImpactKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* 4. Karma & Career Bottleneck */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-emerald-500/30 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                      <span>💼</span>
                      <span>{isKn ? "೪. ಕರ್ಮ & ಆರ್ಥಿಕ ವಾಸ್ತವಿಕತೆ:" : "4. Karma & Financial Reality:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {isKn ? "ವೃತ್ತಿ & ಧನ" : "Career & Wealth"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.karmaFinancialRealityKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* 5. Turning Point Timeline */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-emerald-500/30 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>{isKn ? "೫. ತಿರುವು ನೀಡುವ ಕಾಲಾವಧಿ:" : "5. Turning Point Timeline:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {isKn ? "ದಶಾ & ಗೋಚಾರ" : "Dasha & Gochara"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.immediateTurningPointKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* 6. Siddha Parihara & Shield */}
                <div className="p-5 rounded-2xl bg-white/[0.07] border border-emerald-500/30 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-300 font-black text-sm flex items-center gap-1.5">
                      <span>🪔</span>
                      <span>{isKn ? "೬. ಸಿದ್ಧ ಪರಿಹಾರ & ರಕ್ಷಾ ಕವಚ:" : "6. Siddha Remedies & Sacred Shield:"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {isKn ? "ರತ್ನ & ಕ್ಷೇತ್ರ ಸಂಕಲ್ಪ" : "Gem & Temple"}
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed space-y-2">
                    {activeTalkingPoints.siddhaPariharaRemedyKn.split("\n\n").map((p, i) => (
                      <p key={i} className="italic bg-black/20 p-3 rounded-xl border border-white/5">
                        "{cleanAstrologyText(p)}"
                      </p>
                    ))}
                  </div>
                </div>
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

          {/* 5. YAJNA, HAWANA, SANDHI & PITRU DOSHA PARIHARA HUB */}
          {yajnaHawanaPlan && (
            <div className="rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-stone-950 via-neutral-900 to-stone-950 p-6 md:p-8 text-white shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 text-3xl shadow-inner border border-amber-500/40">
                    🔥
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      {isKn ? "॥ ದೈವಿಕ ಯಜ್ಞ, ಹವನ & ಪಿತೃ ದೋಷ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಮಂಡಲ ॥" : "Vedic Yajna, Hawana & Pitru Dosha Sanctuary"}
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 font-serif">
                      {isKn ? "ಜಾತಕ ಶಾಸ್ತ್ರೋಕ್ತ ಯಜ್ಞ, ಹವನ, ಸಂಧಿ ಪೂಜೆ & ಪಿತೃ ಮುಕ್ತಿ ಸಂಕಲ್ಪಗಳು" : "Chart-Specific Yajna, Hawana, Sandhi & Ancestral Prescriptions"}
                    </h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                  {isKn ? "100% ಜಾತಕ ಗಣಿತ ಆಧಾರಿತ" : "100% Chart-Specific"}
                </span>
              </div>

              {/* PITRU DOSHA & ANCESTRAL MUKTI EVALUATION BANNER */}
              <div className={`p-5 rounded-2xl border ${yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha ? "bg-amber-950/40 border-amber-500/50" : "bg-emerald-950/40 border-emerald-500/50"} space-y-3`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha ? "🌾" : "✨"}</span>
                    <h4 className="font-bold text-sm text-amber-200">
                      {isKn ? "ಪಿತೃ ದೋಷ & ಪೂರ್ವಜರ ಮುಕ್ತಿ ವಿಶ್ಲೇಷಣೆ (Pitru Dosha & Ancestral Blessing Status):" : "Ancestral Karma & Pitru Blessing Assessment:"}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}>
                    {yajnaHawanaPlan.pitruDoshaAssessment.severityLabelKn}
                  </span>
                </div>
                
                <p className="text-xs md:text-sm text-stone-200 leading-relaxed">
                  {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.detailedExplanationKn)}
                </p>

                {yajnaHawanaPlan.pitruDoshaAssessment.hasPitruDosha && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30">
                      <b className="text-amber-300 block mb-1">🔍 ಜಾತಕದಲ್ಲಿ ಕಂಡ ಕಾರಣಗಳು:</b>
                      <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
                        {yajnaHawanaPlan.pitruDoshaAssessment.reasonsKn.map((r, i) => (
                          <li key={i}>{cleanAstrologyText(r)}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30">
                      <b className="text-amber-300 block mb-1">🪔 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸೂಚಿಸಿದ ಪರಿಹಾರ:</b>
                      <p className="text-amber-100 font-semibold text-[11px]">
                        {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.suggestedKaryaKn)}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        {cleanAstrologyText(yajnaHawanaPlan.pitruDoshaAssessment.gokarnaSignificanceKn)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RECOMMENDED YAJNA & HAWANAS GRID */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🔱</span>
                  <span>{isKn ? "ಜಾತಕಾನುಸಾರ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮುಖ ಯಜ್ಞ & ಹವನಗಳು (ವಿವರವಾದ ಶಾಸ್ತ್ರೀಯ ಮಾಹಿತಿ):" : "Recommended Vedic Yajna & Hawana Sevas:"}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {yajnaHawanaPlan.recommendedHomas.map((homa) => (
                    <div
                      key={homa.id}
                      className={`p-5 rounded-2xl border ${homa.isUrgentPrimary ? "border-amber-400/80 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black ring-1 ring-amber-400/30" : "border-white/10 bg-white/[0.04]"} space-y-3 shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{homa.icon}</span>
                          <div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase block mb-1">
                              {cleanAstrologyText(homa.categoryLabelKn)}
                            </span>
                            <h5 className="text-sm font-black text-white font-serif">
                              {cleanAstrologyText(homa.nameKn)}
                            </h5>
                          </div>
                        </div>
                        {homa.isUrgentPrimary && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40 whitespace-nowrap">
                            {isKn ? "ಮುಖ್ಯ ಪರಿಹಾರ" : "Primary"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                          <b className="text-amber-300 block text-[11px] mb-0.5">📌 ಜಾತಕದ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ (Why in Your Chart):</b>
                          <p className="text-stone-300 leading-relaxed">{cleanAstrologyText(homa.astrologicalRootCauseKn)}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                          <b className="text-amber-300 block text-[11px] mb-0.5">🪔 ದೈವಿಕ ಸಂಕಲ್ಪ & ಹವನ ವಿಧಾನ (Sacred Ritual):</b>
                          <p className="text-stone-300 leading-relaxed">{cleanAstrologyText(homa.sacredProcedureKn)}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                          <b className="text-emerald-300 block text-[11px] mb-0.5">✨ ಪೂಜೆಯ ನಂತರ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಬದಲಾವಣೆಗಳು (Expected Shifts):</b>
                          <p className="text-emerald-100 leading-relaxed">{cleanAstrologyText(homa.expectedShiftsAfterPoojaKn)}</p>
                        </div>

                        <div className="pt-1 text-[11px] text-stone-400 italic">
                          {cleanAstrologyText(homa.priestSecretNoteKn)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMBINED SAMPUTA SEVA BANNER */}
              <div className="p-5 rounded-2xl border border-yellow-500/50 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-neutral-900 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-yellow-500/30 pb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold block">
                      {isKn ? "॥ ಸಕಲ ಸಿದ್ಧಿದಾಯಕ ಸಂಯುಕ್ತ ಮಹಾ ಸಂಕಲ್ಪ ॥" : "Synergistic Master Pooja Ensemble"}
                    </span>
                    <h4 className="text-base font-black text-yellow-200 font-serif">
                      {cleanAstrologyText(yajnaHawanaPlan.combinedSamputaSeva.titleKn)}
                    </h4>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40">
                    {isKn ? "ಗರಿಷ್ಠ ಫಲಪ್ರದ ಸಂಯೋಜನೆ" : "Max Synergistic Power"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {yajnaHawanaPlan.combinedSamputaSeva.includedHomasKn.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-black/40 border border-yellow-500/30 text-yellow-100 text-xs font-semibold flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>{cleanAstrologyText(name)}</span>
                    </span>
                  ))}
                </div>

                <p className="text-xs md:text-sm text-stone-200 leading-relaxed">
                  {cleanAstrologyText(yajnaHawanaPlan.combinedSamputaSeva.synergyExplanationKn)}
                </p>

                <p className="text-xs text-yellow-300 font-medium">
                  🗓️ <b>{isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಶುಭ ಮುಹೂರ್ತ:" : "Recommended Muhurtha:"}</b> {cleanAstrologyText(yajnaHawanaPlan.combinedSamputaSeva.recommendedMuhurthaKn)}
                </p>
              </div>
            </div>
          )}

          {/* 6. INTERACTIVE VOICE & CUSTOM QUESTION BOX */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-950 to-slate-950 p-6 md:p-8 text-white shadow-2xl space-y-5">
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-amber-500/30">
                🎙️ {isKn ? "ದೈವಜ್ಞ ನೇರ ಪ್ರಶ್ನೋತ್ತರ ಪೆಟ್ಟಿಗೆ" : "Direct Astrologer Q&A"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-serif">
                {isKn ? "ಯಾವುದೇ ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ (ಧ್ವನಿ ಅಥವಾ ಟೈಪ್ ಮೂಲಕ)" : "Ask Any Specific Follow-up Question"}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isKn 
                  ? "ಕ್ಲೈಂಟ್ ಕೇಳುವ ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಪ್ರಶ್ನೆಗೆ ಮೈಕ್ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ 100% ಶಾಸ್ತ್ರೋಕ್ತ ಉತ್ತರ ಪಡೆಯಿರಿ."
                  : "Get accurate, direct answers for any client follow-up question based on their chart."}
              </p>
            </div>

            {/* INPUT BOX */}
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/20 focus-within:border-amber-400">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !answering) void handleAskQuestion();
                }}
                placeholder={isKn ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ..." : "Type your question or click mic..."}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-neutral-950"
                }`}
                title={isListening ? "Listening..." : "Click to speak"}
              >
                🎤
              </button>

              <button
                type="button"
                onClick={() => void handleAskQuestion()}
                disabled={answering || !questionInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {answering ? (isKn ? "ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ..." : "Answering...") : (isKn ? "ಕೇಳಿ" : "Ask")}
              </button>
            </div>

            {/* Q&A HISTORY */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                {qaHistory.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>❓</span>
                      <span>{item.question}</span>
                    </p>
                    <p className="text-xs md:text-sm text-slate-100 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                      {cleanAstrologyText(item.answer)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
