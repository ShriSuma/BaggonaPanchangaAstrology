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

export default function InstantReadingPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);

  const [loading, setLoading] = useState(true);
  const [synthesisData, setSynthesisData] = useState<PanchangaSynthesisOutput | null>(null);
  const [aiNarration, setAiNarration] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Selected Category & Active Question Modal / Drawer
  const [activeCategory, setActiveCategory] = useState<"all" | "career" | "marriage" | "mind" | "wealth">("all");
  const [selectedQA, setSelectedQA] = useState<InstantQAQuestion | null>(null);

  // Custom Q&A State
  const [questionInput, setQuestionInput] = useState("");
  const [answering, setAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string; basis?: string }[]>([]);
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
      lang: i18n.language
    });

    setSynthesisData(data);
    setAiNarration(data.multiParagraphExecutiveReading);
    setLoading(false);

    // Trigger AI enhanced live reading
    void (async () => {
      setAiLoading(true);
      try {
        const promptContext = `
Devotee Name: ${session.input.name || "Devotee"}
Birth Details: ${birthDate} at ${birthTime} (Lat: ${lat}, Lon: ${lon})
Lagna: ${session.result.lagnaRashi.english} (${session.result.lagnaRashi.sanskrit})
Moon Rashi: ${session.result.moonSign.english} (${session.result.moonSign.sanskrit})
Moon Nakshatra: ${session.result.planets.find((p) => p.name === "Moon")?.nakshatra.english || "Ashwini"}
Panchanga Angas:
- Vara: ${data.panchanga.vara.nameKn} (${data.panchanga.vara.tatva})
- Tithi: ${data.panchanga.tithi.nameKn}
- Nakshatra: ${data.panchanga.nakshatra.nameKn}
- Yoga: ${data.panchanga.yoga.nameKn} (${data.panchanga.yoga.rule.isAuspicious ? "Auspicious" : "Requires Care"})
- Karana: ${data.panchanga.karana.nameKn} (${data.panchanga.karana.rule.type})
Current Life Issue Diagnosis:
- Mental State: ${data.currentDiagnosis.mentalStateIssue.diagnosis}
- Primary Challenge: ${data.currentDiagnosis.primaryLifeChallenge.area} -> ${data.currentDiagnosis.primaryLifeChallenge.description} (${data.currentDiagnosis.primaryLifeChallenge.planetaryRootCause})
- Dasha Sthiti: ${data.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}
- Prescribed Rudraksha: ${data.prescriptions.rudraksha.nameKn}
- Prescribed Gemstone Ring: ${data.prescriptions.gemstoneRing.primaryGemstoneKn} (${data.prescriptions.gemstoneRing.caratWeight}) on ${data.prescriptions.gemstoneRing.fingerKn}

Task: Write a deeply empathetic, highly accurate 3-to-4 paragraph personalized astrological reading in fluent, pure ${isKn ? "Kannada" : "English"}.
Highlight exactly what the person is feeling inside (Manassu/peace of mind), where they are facing friction right now (work, family, health, or finance), and provide clear astrological reassurance and practical remedies. Do not use generic fluff.
`;

        const response = await askGemini(
          "Generate comprehensive live life situation reading",
          promptContext,
          geminiApiKey,
          isKn ? "kn" : "en",
          { raw: true, temperature: 0.2 }
        );

        if (response) {
          const paragraphs = response.split("\n\n").filter((p) => p.trim().length > 0);
          if (paragraphs.length >= 2) {
            setAiNarration(paragraphs);
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
Dasha & Diagnosis: ${synthesisData.currentDiagnosis.prasthuthaSthiti.runningDashaSummary}. Current challenge: ${synthesisData.currentDiagnosis.primaryLifeChallenge.description}.
Prescriptions: Rudraksha=${synthesisData.prescriptions.rudraksha.nameKn}, Gemstone=${synthesisData.prescriptions.gemstoneRing.primaryGemstoneKn}.

Question from Devotee: "${q}"

Task: Give a direct, expert Pandit response in ${isKn ? "Kannada" : "English"}.
First give 2 punchy spoken sentences that the Astrologer can tell the devotee immediately.
Then specify the exact planetary/house basis and the 1 practical Vedic remedy.
`;

      const ans = await askGemini(
        q,
        contextData,
        geminiApiKey,
        isKn ? "kn" : "en",
        { temperature: 0.2 }
      );

      setQaHistory((prev) => [{ question: q, answer: ans }, ...prev]);
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

  const { prescriptions, currentDiagnosis, instantQAList } = synthesisData || {};
  const filteredQA = instantQAList?.filter((item) => activeCategory === "all" || item.category === activeCategory) || [];

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
              ಲಗ್ನ: <b className="text-amber-200">{session.result.lagnaRashi.english}</b> • ರಾಶಿ: <b className="text-amber-200">{session.result.moonSign.english}</b> • ನಕ್ಷತ್ರ: <b className="text-amber-200">{session.result.planets.find(p => p.name === "Moon")?.nakshatra.english} (ಪಾದ {session.result.moonPada})</b> • ಪ್ರಸ್ತುತ ದಶಾ: <b className="text-yellow-300">{currentDiagnosis?.prasthuthaSthiti.runningDashaSummary.split("|")[0]}</b>
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-900/40 border border-amber-400/40 text-right">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆ</span>
            <span className="text-sm font-black text-white">೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ಫಲಿತ</span>
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
          {/* 🌟 1. SECRET TALKING POINTS FOR THE ASTROLOGER (ದೈವಜ್ಞ ಮಾರ್ಗದರ್ಶಿ / Talking Prompts) 🌟 */}
          {currentDiagnosis && (
            <div className="rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-r from-emerald-950 via-slate-950 to-neutral-900 p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 text-lg">
                    🗣️
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      ದೈವಜ್ಞರ ನೇರ ನುಡಿ ಮಾರ್ಗದರ್ಶಿ (Astrologer's Direct Verbal Prompts)
                    </span>
                    <h3 className="text-sm font-extrabold text-emerald-200">
                      {isKn ? "ಕ್ಲೈಂಟ್‌ಗೆ ನೇರವಾಗಿ ಹೇಳಬೇಕಾದ ಪ್ರಮುಖ ಸತ್ಯಾಂಶಗಳು (Say these directly)" : "Authoritative Speaking Points"}
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Secret Astrologer Cue
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px]">1. ಆರಂಭಿಕ ಮಾತು (Opening Icebreaker):</span>
                  <p className="text-slate-200 italic leading-relaxed">
                    "{currentDiagnosis.astrologerTalkingPoints.openingIceBreakerKn}"
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px]">2. ಆಂತರಿಕ ರಹಸ್ಯ (Hidden Subconscious Worry):</span>
                  <p className="text-slate-200 italic leading-relaxed">
                    "{currentDiagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn}"
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-1">
                  <span className="text-emerald-400 font-bold block text-[11px]">3. ತಿರುವು ನೀಡುವ ಕಾಲ (Turning Point Timeline):</span>
                  <p className="text-slate-200 italic leading-relaxed">
                    "{currentDiagnosis.astrologerTalkingPoints.immediateTurningPointKn}"
                  </p>
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
                  {para}
                </p>
              ))}
            </div>

            {/* QUICK HIGHLIGHT BADGES */}
            {currentDiagnosis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                    🧠 ಮಾನಸಿಕ ಸ್ಥಿತಿ (Mind & Inner Peace)
                  </span>
                  <p className="text-xs text-amber-950 font-medium">
                    {currentDiagnosis.mentalStateIssue.diagnosis}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block mb-1">
                    🎯 ಪ್ರಮುಖ ಜೀವನ ಸವಾಲು ({currentDiagnosis.primaryLifeChallenge.area})
                  </span>
                  <p className="text-xs text-indigo-950 font-medium">
                    {currentDiagnosis.primaryLifeChallenge.description}
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
                        <p className="leading-relaxed font-medium">"{qa.panditScriptKn}"</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700">
                          <b>ಶಾಸ್ತ್ರೀಯ ಆಧಾರ:</b> {qa.astrologicalBasisKn}
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950">
                          <b>ತಕ್ಷಣದ ಪರಿಹಾರ:</b> {qa.immediateRemedyKn}
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
                    {isKn ? "ಜಾತಕ & ಪಂಚಾಂಗಾಧಾರಿತ ೧೦೦% ನಿಖರ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣಗಳು" : "Panchanga Unified Astrological Prescriptions (100% Accurate)"}
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
                    <b>ದೇವತೆ:</b> {prescriptions.rudraksha.deity} • <b>ಅಧಿಪತಿ ಗ್ರಹ:</b> {prescriptions.rudraksha.planet}
                  </p>
                  <p className="text-xs text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                    💡 <b>ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:</b> {prescriptions.rudraksha.astrologicalReason}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    ✨ <b>ಪಂಚಾಂಗ ಸಮನ್ವಯ:</b> {prescriptions.rudraksha.panchangaSynergy}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    <b>ಧರಿಸುವ ಕ್ರಮ:</b> {prescriptions.rudraksha.wearingMethod}
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
                    💡 <b>ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:</b> {prescriptions.gemstoneRing.astrologicalReason}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    ✨ <b>ಪಂಚಾಂಗ ಸಮನ್ವಯ:</b> {prescriptions.gemstoneRing.panchangaSynergy}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    <b>ಬೆರಳು & ಶುಭ ವಾರ:</b> {prescriptions.gemstoneRing.fingerKn} ({prescriptions.gemstoneRing.activationDay})
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
                    <span className="font-black text-indigo-950">{prescriptions.luckyAttributes.carColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ಅದೃಷ್ಟ ವಸ್ತ್ರ ಬಣ್ಣ</span>
                    <span className="font-black text-emerald-900">{prescriptions.luckyAttributes.clothColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ವರ್ಜಿಸಬೇಕಾದ ಬಣ್ಣ</span>
                    <span className="font-black text-rose-800">{prescriptions.luckyAttributes.avoidColors.join(", ")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">ಅದೃಷ್ಟ ದಿಕ್ಕು & ಸಂಖ್ಯೆ</span>
                    <span className="font-black text-amber-900">{prescriptions.luckyAttributes.directions.join(", ")} (ಸಂಖ್ಯೆ: {prescriptions.luckyAttributes.numbers.join(", ")})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE VOICE & CUSTOM QUESTION BOX */}
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
                  ? "ಕ್ಲೈಂಟ್ ಕೇಳುವ ಯಾವುದೇ ಅನಿರೀಕ್ಷಿತ ಪ್ರಶ್ನೆಗೆ ಮೈಕ್ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ಉತ್ತರ ಪಡೆಯಿರಿ."
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
                      {item.answer}
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
