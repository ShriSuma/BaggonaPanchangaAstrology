import React, { useState, useRef } from "react";
import Card from "../components/ui/Card";
import {
  executeHindinaJanmaCalculation
} from "../features/hindinajanma/hindinaJanmaEngine";
import type {
  HindinaJanmaInput,
  HindinaJanmaResult,
  HindinaJanmaLang,
  BirthMarkLocation,
  InexplicableAffinity,
  InexplicablePhobia
} from "../features/hindinajanma/hindinaJanmaTypes";
import {
  T_HINDINA_JANMA,
  pickL5,
  pickL5Array
} from "../features/hindinajanma/hindinaJanmaLocale";
import { HindinaJanmaPdfTemplate } from "../components/hindinajanma/HindinaJanmaPdfTemplate";
import { useAppStore } from "../stores/appStore";
import { sanitizeAIText } from "../utils/textFormatter";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const HindinaJanmaPage: React.FC = () => {
  const activeKey = useAppStore((state) => state.geminiApiKey);
  const globalLang = useAppStore((state) => state.language) as HindinaJanmaLang;
  const [selectedLang, setSelectedLang] = useState<HindinaJanmaLang>(
    ["kn", "en", "hi", "te", "ta"].includes(globalLang) ? globalLang : "kn"
  );
  const isKn = selectedLang === "kn";

  // Form State
  const [personName, setPersonName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [tob, setTob] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [birthPlace, setBirthPlace] = useState<string>("Gokarna");
  const [birthMarkLocation, setBirthMarkLocation] = useState<BirthMarkLocation>("head_face");
  const [inexplicableAffinity, setInexplicableAffinity] = useState<InexplicableAffinity>("ancient_temples");
  const [inexplicablePhobia, setInexplicablePhobia] = useState<InexplicablePhobia>("none");
  const [customQuestion, setCustomQuestion] = useState<string>("");

  // Processing & Voice Input States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [result, setResult] = useState<HindinaJanmaResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "identity" | "karma" | "talents" | "phobia" | "moksha" | "remedies" | "aiNarrative"
  >("identity");

  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeMicField, setActiveMicField] = useState<"name" | "place" | "question" | null>(null);

  // Web Speech API Voice Recognition
  const handleMicToggle = (field: "name" | "place" | "question") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isKn
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ."
          : "Speech recognition is not supported in your browser. Please type your text."
      );
      return;
    }

    if (activeMicField === field) {
      setActiveMicField(null);
      return;
    }

    setActiveMicField(field);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        selectedLang === "kn"
          ? "kn-IN"
          : selectedLang === "hi"
          ? "hi-IN"
          : selectedLang === "te"
          ? "te-IN"
          : selectedLang === "ta"
          ? "ta-IN"
          : "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (field === "name") setPersonName(transcript);
        else if (field === "place") setBirthPlace(transcript);
        else if (field === "question") setCustomQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setActiveMicField(null);
      };

      recognition.onend = () => {
        setActiveMicField(null);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setActiveMicField(null);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;

    setIsProcessing(true);

    try {
      const inputPayload: HindinaJanmaInput = {
        personName: personName.trim() || (isKn ? "ಶ್ರೀಯುತ ಜಿಜ್ಞಾಸು" : "Devout Soul"),
        dob,
        tob: tob || undefined,
        gender,
        birthPlace: birthPlace.trim() || "Gokarna",
        birthMarkLocation,
        inexplicableAffinity,
        inexplicablePhobia,
        customQuestion: customQuestion.trim() || undefined,
        lang: selectedLang
      };

      const res = await executeHindinaJanmaCalculation(inputPayload, activeKey);
      setResult(res);
      setIsProcessing(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error("Hindina Janma calculation error:", err);
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const container = document.getElementById("hindina-janma-pdf-container");
      if (!container) throw new Error("PDF container missing");

      const pages = container.querySelectorAll(".pdf-page-a4");
      if (!pages || pages.length === 0) throw new Error("No PDF pages found");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#FFFDF7"
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      const cleanName = (result.input.personName || "Soul").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Baggona_Hindina_Janma_${cleanName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(isKn ? "PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "Failed to generate PDF report. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Luxury Golden Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-5 sm:p-8 text-white shadow-2xl border-2 border-amber-500/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-amber-500/30 text-amber-200 border border-amber-400/50">
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಧರ್ಮಜ್ಞ ಷಷ್ಟ್ಯಂಶ (D-60) ಪದ್ಧತಿ ॥
            </span>

            {/* Language Picker */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-amber-500/40 overflow-x-auto max-w-full">
              {(["kn", "en", "hi", "te", "ta"] as HindinaJanmaLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelectedLang(l)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    selectedLang === l
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md font-extrabold"
                      : "text-amber-200 hover:text-white font-medium"
                  }`}
                >
                  {l === "kn" ? "ಕನ್ನಡ" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : l === "ta" ? "தமிழ்" : "English"}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-amber-200 tracking-tight leading-snug">
            {T_HINDINA_JANMA.heroTitle[selectedLang]}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-amber-100 max-w-3xl leading-relaxed font-medium">
            {T_HINDINA_JANMA.heroSubtitle[selectedLang]}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-amber-300 font-bold">
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಹಿಂದಿನ ಜನ್ಮದ ಗುರುತು & ವೃತ್ತಿ</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಸಂಚಿತ ಕರ್ಮ & ಋಣಾನುಬಂಧ</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಸುಪ್ತ ಪ್ರತಿಭೆ & ಮಚ್ಚೆಯ ರಹಸ್ಯ</span>
            <span className="bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">✓ ಧ್ವನಿ ಮೈಕ್ರೋಫೋನ್ ಸಪೋರ್ಟ್ 🎙️</span>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xl rounded-3xl">
        <h3 className="font-extrabold text-sm sm:text-base text-amber-950 dark:text-amber-300 mb-4 flex items-center gap-2 border-b-2 border-amber-100 dark:border-slate-800 pb-3">
          <span>🔮</span>
          <span>{isKn ? "ಪೂರ್ವ ಜನ್ಮ ಗಣನೆಗಾಗಿ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "Enter Details for Past Life Blueprint"}</span>
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Person Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {T_HINDINA_JANMA.formName[selectedLang]} *
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("name")}
                  className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black rounded-lg transition shadow-sm ${
                    activeMicField === "name"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                  title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರನ್ನು ಹೇಳಿ" : "Dictate name via mic"}
                >
                  <span>{activeMicField === "name" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "name" ? (isKn ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (isKn ? "ಧ್ವನಿ (Mic)" : "Mic")}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={isKn ? "ಉದಾ: ಶ್ರೀ ಶಂಕರ ಭಟ್" : "e.g., Sri Shankara Bhat"}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_HINDINA_JANMA.formDob[selectedLang]}
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_HINDINA_JANMA.formTob[selectedLang]}
              </label>
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block mt-1">
                {isKn ? "* ಸಮಯ ನೀಡಿದರೆ ಲಗ್ನ & ಷಷ್ಟ್ಯಂಶ ನಿಖರತೆ ಹೆಚ್ಚುತ್ತದೆ." : "* Time refines Ascendant & D-60 precision."}
              </span>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {isKn ? "ಲಿಂಗ (Gender):" : "Gender:"}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Male">{isKn ? "ಪುರುಷ (Male)" : "Male"}</option>
                <option value="Female">{isKn ? "ಮಹಿಳೆ (Female)" : "Female"}</option>
                <option value="Other">{isKn ? "ಇತರ (Other)" : "Other"}</option>
              </select>
            </div>

            {/* Birthmark / Mole Location */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_HINDINA_JANMA.formBirthMark[selectedLang]}
              </label>
              <select
                value={birthMarkLocation}
                onChange={(e) => setBirthMarkLocation(e.target.value as BirthMarkLocation)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="head_face">{isKn ? "ಶಿರಸ್ಸು / ಮುಖ / ಹಣೆ (Head/Face)" : "Head / Face / Forehead"}</option>
                <option value="neck_chest">{isKn ? "ಕಂಠ / ಎದೆ (Neck/Chest)" : "Neck / Chest"}</option>
                <option value="hands_arms">{isKn ? "ಕೈಗಳು / ತೋಳು (Hands/Arms)" : "Hands / Arms"}</option>
                <option value="back_spine">{isKn ? "ಬೆನ್ನು / ಬೆನ್ನುಹುರಿ (Back/Spine)" : "Back / Spine"}</option>
                <option value="abdomen_waist">{isKn ? "ಹೊಟ್ಟೆ / ನಡು (Abdomen/Waist)" : "Abdomen / Waist"}</option>
                <option value="legs_feet">{isKn ? "ಕಾಲುಗಳು / ಪಾದ (Legs/Feet)" : "Legs / Feet"}</option>
                <option value="none">{isKn ? "ಯಾವುದೂ ಇಲ್ಲ (None)" : "None"}</option>
              </select>
            </div>

            {/* Innate Affinity */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_HINDINA_JANMA.formAffinity[selectedLang]}
              </label>
              <select
                value={inexplicableAffinity}
                onChange={(e) => setInexplicableAffinity(e.target.value as InexplicableAffinity)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="ancient_temples">{isKn ? "ಪುರಾತನ ದೇವಾಲಯಗಳು & ಶಿಲ್ಪಕಲೆ (Ancient Temples)" : "Ancient Temples & Architecture"}</option>
                <option value="forest_hermitage">{isKn ? "ಅರಣ್ಯ ಏಕಾಂತ & ತಪಸ್ಸು (Forest Solitude & Meditation)" : "Forest Hermitage & Solitude"}</option>
                <option value="ocean_travel">{isKn ? "ಸಾಗರ & ನದಿ ಸಂಗಮಗಳು (Ocean & Sacred Rivers)" : "Ocean & Sacred Rivers"}</option>
                <option value="royal_warfare">{isKn ? "ಕೋಟೆಗಳು, ಇತಿಹಾಸ & ನಾಯಕತ್ವ (History & Leadership)" : "Forts, History & Leadership"}</option>
                <option value="sacred_music">{isKn ? "ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತ & ವೇದ ಮಂತ್ರ (Vedic Chanting)" : "Sacred Music & Vedic Chanting"}</option>
                <option value="occult_mysticism">{isKn ? "ಜ್ಯೋತಿಷ್ಯ, ತಂತ್ರ & ಗೂಢ ಶಾಸ್ತ್ರ (Astrology & Mysticism)" : "Astrology & Occult Wisdom"}</option>
              </select>
            </div>

            {/* Innate Phobia */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300 mb-1.5">
                {T_HINDINA_JANMA.formPhobia[selectedLang]}
              </label>
              <select
                value={inexplicablePhobia}
                onChange={(e) => setInexplicablePhobia(e.target.value as InexplicablePhobia)}
                className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="none">{isKn ? "ಯಾವುದೇ ವಿಶೇಷ ಭಯವಿಲ್ಲ (No Phobia)" : "No Specific Phobia"}</option>
                <option value="water_drowning">{isKn ? "ನೀರಿನಲ್ಲಿ ಮುಳುಗುವ / ಆಳವಾದ ಜಲ ಭಯ (Deep Water)" : "Deep Water / Drowning Aversion"}</option>
                <option value="heights_fall">{isKn ? "ಎತ್ತರದ ಸ್ಥಳ / ಬೀಳುವ ಭಯ (Heights / Falling)" : "Heights / Falling Aversion"}</option>
                <option value="fire_burns">{isKn ? "ಅಗ್ನಿ / ಬೆಂಕಿ ಭಯ (Fire / Burns)" : "Fire / Burn Aversion"}</option>
                <option value="enclosed_darkness">{isKn ? "ಕತ್ತಲೆ / ಮುಚ್ಚಿದ ಕೋಣೆಯ ಭಯ (Darkness / Enclosed)" : "Darkness / Enclosed Spaces"}</option>
                <option value="sharp_weapons">{isKn ? "ಚೂಪಾದ ಆಯುಧಗಳ ಭಯ (Sharp Weapons)" : "Sharp Weapons"}</option>
                <option value="isolation_abandonment">{isKn ? "ಒಂಟಿತನ / ತ್ಯಜಿಸಲ್ಪಡುವ ಭಯ (Isolation / Abandonment)" : "Isolation / Fear of Abandonment"}</option>
              </select>
            </div>

            {/* Custom Question with Speech-to-Text Microphone Button */}
            <div className="sm:col-span-2 md:col-span-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {T_HINDINA_JANMA.formQuestion[selectedLang]}
                </label>
                <button
                  type="button"
                  onClick={() => handleMicToggle("question")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-xl transition shadow-md ${
                    activeMicField === "question"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-100 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-400 hover:bg-amber-200"
                  }`}
                >
                  <span>{activeMicField === "question" ? "🔴" : "🎙️"}</span>
                  <span>{activeMicField === "question" ? (isKn ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening...") : (isKn ? "ಮಾತನಾಡಿ ಕೇಳಿ (Mic)" : "Speak via Mic")}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={
                    isKn
                      ? "ಉದಾ: ನನ್ನ ಈ ಜನ್ಮದ ಮುಖ್ಯ ಕರ್ಮ ಗುರಿ ಏನು? ನನ್ನ ಹಿಂದಿನ ಜನ್ಮದ ಆಸೆ ಯಾವುದು? (ಧ್ವನಿ ಮೂಲಕವೂ ಮಾತನಾಡಬಹುದು)"
                      : "e.g., What is my soul's highest purpose and karmic lesson? (You can also speak via mic)"
                  }
                  className="w-full rounded-2xl border-2 border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-3">
            <button
              type="submit"
              disabled={isProcessing || !dob}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl disabled:opacity-50 transition transform active:scale-95 border border-amber-400/40"
            >
              {isProcessing
                ? (isKn ? "⌛ ಪೂರ್ವ ಜನ್ಮ ಷಷ್ಟ್ಯಂಶ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..." : "Deciphering Past Life Blueprint...")
                : T_HINDINA_JANMA.submitBtn[selectedLang]}
            </button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Header Summary Pill */}
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 sm:p-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-2xl">
                🕉️
              </div>
              <div>
                <h3 className="font-black text-amber-200 text-base sm:text-lg">
                  {result.input.personName} · {pickL5(result.mokshaAxis.soulMaturityLevel, selectedLang)}
                </h3>
                <p className="text-xs text-amber-100 font-bold">
                  {result.sunSign} · {result.moonNakshatra} · {isKn ? "ಸಂಚಿತ ಪುಣ್ಯ ಬಲ:" : "Punya Ratio:"} {result.karmaAnalysis.sanchitaPunyaPercentage}%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ರಚನೆಯಾಗುತ್ತಿದೆ..." : "Generating PDF...") : T_HINDINA_JANMA.downloadPdfBtn[selectedLang]}</span>
            </button>
          </div>

          {/* Navigation Tabs Bar with touch scroll */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-amber-200/60 dark:border-slate-700">
            {[
              { id: "identity", label: T_HINDINA_JANMA.tabIdentity[selectedLang] },
              { id: "karma", label: T_HINDINA_JANMA.tabKarma[selectedLang] },
              { id: "talents", label: T_HINDINA_JANMA.tabTalents[selectedLang] },
              { id: "phobia", label: T_HINDINA_JANMA.tabPhobia[selectedLang] },
              { id: "moksha", label: T_HINDINA_JANMA.tabMokshaAxis[selectedLang] },
              { id: "remedies", label: T_HINDINA_JANMA.tabRemedies[selectedLang] },
              { id: "aiNarrative", label: T_HINDINA_JANMA.tabAiNarrative[selectedLang] }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-white shadow-lg font-black"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Past Life Identity & Era */}
          {activeTab === "identity" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಡಿ-೬೦ ಷಷ್ಟ್ಯಂಶ ಪೂರ್ವ ಜನ್ಮ ಗುರುತು
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  👑 ಹಿಂದಿನ ಜನ್ಮದ ವ್ಯಕ್ತಿತ್ವ, ಯುಗ & ಸಾಮಾಜಿಕ ವೃತ್ತಿ
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">
                    {isKn ? "ಕಾಲಮಾನ & ಐತಿಹಾಸಿಕ ಯುಗ:" : "Historical Era:"}
                  </span>
                  <p className="text-sm font-black text-amber-950 dark:text-amber-200">
                    {pickL5(result.pastLifePersona.eraAndTimeline, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">
                    {isKn ? "ಭೌಗೋಳಿಕ ತಪೋಭೂಮಿ / ಪ್ರದೇಶ:" : "Geographical Realm:"}
                  </span>
                  <p className="text-sm font-black text-amber-950 dark:text-amber-200">
                    {pickL5(result.pastLifePersona.geographicalRealm, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">
                    {isKn ? "ವೃತ್ತಿ & ಸಾಮಾಜಿಕ ಸ್ಥಾನಮಾನ:" : "Vocation & Status:"}
                  </span>
                  <p className="text-sm font-black text-amber-950 dark:text-amber-200">
                    {pickL5(result.pastLifePersona.socialStatusAndVocation, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">
                    {isKn ? "ಪ್ರಭಾವಿ ಗ್ರಹ ಕಾರಕತ್ವ:" : "Dominant Graha:"}
                  </span>
                  <p className="text-sm font-black text-amber-950 dark:text-amber-200">
                    {result.pastLifePersona.dominantGraha}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-amber-300 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300 mb-2">
                  📜 {isKn ? "ಪೂರ್ವ ಜನ್ಮದ ಚಾರಿತ್ರ್ಯ ಸಾರಾಂಶ:" : "Character Summary:"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {pickL5(result.pastLifePersona.personalitySummary, selectedLang)}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 2: Sanchita Karma & Debts */}
          {activeTab === "karma" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಸಂಚಿತ, ಪ್ರಾರಬ್ಧ & ಋಣಾನುಬಂಧ
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  ⚖️ ಸಂಚಿತ ಕರ್ಮದ ಲೆಕ್ಕಾಚಾರ & ಬಾಕಿ ಉಳಿದ ಕರ್ತವ್ಯಗಳು
                </h3>
              </div>

              {/* Karma Ratio Bar */}
              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200 space-y-2">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-emerald-800 dark:text-emerald-400">
                    {isKn ? "ಪುಣ್ಯ ಕರ್ಮ ಬಲ:" : "Punya Karma Ratio:"} {result.karmaAnalysis.sanchitaPunyaPercentage}%
                  </span>
                  <span className="text-rose-800 dark:text-rose-400">
                    {isKn ? "ಕಳೆಯಬೇಕಾದ ಕರ್ಮ ಶೇಷ:" : "Residual Karma:"} {result.karmaAnalysis.sanchitaPaapaPercentage}%
                  </span>
                </div>
                <div className="w-full h-4 bg-rose-200 dark:bg-rose-950 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${result.karmaAnalysis.sanchitaPunyaPercentage}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    🔗 {isKn ? "ಪ್ರಧಾನ ಋಣಾನುಬಂಧ (Dominant Debt):" : "Dominant Karmic Debt:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.karmaAnalysis.dominantKarmicDebt, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    🌟 {isKn ? "ಪೂರ್ವ ಪುಣ್ಯ ಫಲ / ರಕ್ಷಾ ಕವಚ:" : "Karmic Blessing Shield:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.karmaAnalysis.karmicCurseOrBlessing, selectedLang)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-100/70 dark:bg-slate-800 rounded-2xl border border-amber-300">
                <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">
                  🎯 {isKn ? "ಹಿಂದಿನ ಜನ್ಮದಿಂದ ಹೊತ್ತು ತಂದ ಅಪೂರ್ಣ ಸಂಕಲ್ಪ:" : "Past Life Unfinished Soul Desire:"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {pickL5(result.karmaAnalysis.pastLifeUnfinishedDesire, selectedLang)}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 3: Innate Boons & Talents */}
          {activeTab === "talents" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಪೂರ್ವ ಜನ್ಮ ಸಾಧನೆಯ ವರಗಳು
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🌟 ಇಂದಿನ ಜನ್ಮಕ್ಕೆ ತಂದಿರುವ ಸುಪ್ತ ಪ್ರತಿಭೆಗಳು & ಅಂತಃಪ್ರಜ್ಞೆ
                </h3>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-2">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                  ✨ {isKn ? "ಪೂರ್ವ ಜನ್ಮಾರ್ಜಿತ ಸುಪ್ತ ಕೌಶಲ್ಯಗಳು:" : "Innate Inherited Talents:"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {pickL5Array(result.innateBoons.inheritedTalents, selectedLang).map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700">
                      <span>✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                  🕉️ {isKn ? "ಪೂರ್ವ ಜನ್ಮದ ಇಷ್ಟ ದೇವತಾ ಸನ್ನಿಧಿ:" : "Past Life Deity Affinity:"}
                </h4>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-black">
                  {pickL5(result.innateBoons.sacredDeityAffinity, selectedLang)}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 space-y-1">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                  ⚡ {isKn ? "ಅಂತಃಪ್ರಜ್ಞಾ ಶಕ್ತಿ (Intuitive Instincts):" : "Intuitive Instincts:"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {pickL5(result.innateBoons.intuitiveInstincts, selectedLang)}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 4: Phobias, Birthmarks & Deja-Vu */}
          {activeTab === "phobia" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಸಾಮುದ್ರಿಕ ಲಕ್ಷಣ & ಸ್ಮೃತಿ ಅನುಸಂಧಾನ
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🐍 ಮಚ್ಚೆಗಳ ರಹಸ್ಯ, ಬಾಲ್ಯದ ಭಯಗಳು & ಡೆಜಾ-ವು ಅನುಭವಗಳು
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    📍 {isKn ? "ಮಚ್ಚೆಯ ಸಾಮುದ್ರಿಕ ರಹಸ್ಯ:" : "Birthmark Significance:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.phobiaCorrelation.birthmarkSignificance, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                    🌊 {isKn ? "ಭಯದ ಕರ್ಮ ಮೂಲ:" : "Phobia Karmic Origin:"}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.phobiaCorrelation.phobiaKarmicOrigin, selectedLang)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 space-y-2">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300">
                  🌌 {isKn ? "ನಿಮ್ಮ ಆತ್ಮ ಅನುಭವಿಸುವ ಡೆಜಾ-ವು (Deja-Vu) ಸೂಕ್ಷ್ಮ ಘಟನೆಗಳು:" : "Soul Deja-Vu Resonances:"}
                </h4>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  {pickL5Array(result.innateBoons.dejaVuTriggers, selectedLang).map((d, idx) => (
                    <div key={idx} className="p-2 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-200">
                      • {d}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: Rahu-Ketu Soul Mission */}
          {activeTab === "moksha" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಛಾಯಾಗ್ರಹಗಳ ಕರ್ಮ ಅಕ್ಷ
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🔄 ರಾಹು-ಕೇತು ಮೋಕ್ಷ ಅಕ್ಷ & ಈ ಜನ್ಮದ ಪರಮ ಗುರಿ
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-100/60 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1.5">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                    🚩 {isKn ? "ಕೇತು (ಪೂರ್ವ ಜನ್ಮ ಸಿದ್ಧಿ):" : "Ketu (Past Life Mastery):"}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.mokshaAxis.ketuPastLifeMastery, selectedLang)}
                  </p>
                </div>

                <div className="p-4 bg-amber-100/60 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 space-y-1.5">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                    🎯 {isKn ? "ರಾಹು (ಪ್ರಸ್ತುತ ಜನ್ಮದ ಗುರಿ):" : "Rahu (Current Soul Mission):"}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {pickL5(result.mokshaAxis.rahuCurrentLifeMission, selectedLang)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-200">
                <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-300 mb-1">
                  🕉️ {isKn ? "ಆತ್ಮದ ವಿಕಾಸ ಹಂತ:" : "Soul Evolutionary Realm:"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {pickL5(result.mokshaAxis.d60SoulEvolutionStage, selectedLang)}
                </p>
              </div>
            </Card>
          )}

          {/* TAB 6: Karmic Remedies & Gokarna Seva */}
          {activeTab === "remedies" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಪೂರ್ವ ಜನ್ಮ ದೋಷ ನಿವಾರಣೆ
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  🪔 ಕರ್ಮ ಮುಕ್ತಿ, ಶಾಂತಿ ಮಂತ್ರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸೇವೆ
                </h3>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {pickL5(result.remedies.sacredGokarnaRemedy, selectedLang)}
              </div>

              <div className="p-4 bg-amber-100/70 dark:bg-slate-800 rounded-2xl border border-amber-300 space-y-2">
                <h4 className="font-bold text-xs text-amber-950 dark:text-amber-300">
                  📜 {isKn ? "ಆತ್ಮ ಶಾಂತಿ & ಕರ್ಮ ಮುಕ್ತಿ ಮಹಾ ಮಂತ್ರ:" : "Sacred Atma Shanti Mantra:"}
                </h4>
                <p className="font-serif font-black text-base text-amber-950 dark:text-amber-300">
                  {result.remedies.sacredAtmaShantiMantra}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-amber-200 space-y-2">
                <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-300">
                  🎁 {isKn ? "ಶ್ರೇಷ್ಠ ದಾನ & ಸೇವಾ ಪರಿಹಾರಗಳು:" : "Recommended Charity & Sevas:"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                  {pickL5Array(result.remedies.recommendedTilaAndDanaItems, selectedLang).map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50 dark:bg-slate-900 rounded-xl border border-amber-200">
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Priest Call Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-2 border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                    🕉️ {result.remedies.priestName}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಹಾಗೂ ಕರ್ಮ ಶಾಂತಿ ಸೇವೆಗಳಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ
                  </p>
                </div>
                <a
                  href={`tel:+91${result.remedies.priestPhone}`}
                  className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>📞 {result.remedies.priestPhone} ಗೆ ಕರೆ ಮಾಡಿ</span>
                </a>
              </div>
            </Card>
          )}

          {/* TAB 7: AI Past Life Narrative */}
          {activeTab === "aiNarrative" && (
            <Card className="border-2 border-amber-300 dark:border-amber-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl rounded-3xl space-y-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  ಗೋಕರ್ಣ ವೇದಜ್ಞರ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನ
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                  ✨ ಹಿಂದಿನ ಜನ್ಮದ ಸಮಗ್ರ ದೈವಿಕ ಕಥನ & ಆತ್ಮ ದರ್ಶನ
                </h3>
              </div>

              {result.aiNarrative ? (
                <div className="p-5 bg-gradient-to-br from-amber-950/80 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-xl text-white">
                  <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {sanitizeAIText(result.aiNarrative)}
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {isKn
                    ? "ನಿಮ್ಮ ಹಿಂದಿನ ಜನ್ಮದ ಆಳವಾದ ವೃತ್ತಾಂತ ಮತ್ತು ಸತ್ಯವು ಮೇಲಿನ ೬ ಟ್ಯಾಬ್‌ಗಳಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಲಭ್ಯವಿದೆ."
                    : "Your past life details and karmic trajectory are detailed across all 6 tabs above."}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Offscreen PDF template (Fixed & Visible to layout engine at -15000px) */}
      {result && (
        <div
          id="hindina-janma-pdf-wrapper"
          style={{
            position: "fixed",
            top: "-15000px",
            left: "-15000px",
            width: "794px",
            zIndex: -9999,
            pointerEvents: "none"
          }}
        >
          <HindinaJanmaPdfTemplate result={result} />
        </div>
      )}
    </div>
  );
};
