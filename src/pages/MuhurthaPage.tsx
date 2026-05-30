import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { fetchShuddhaMuhurthas, type MuhurthaEntry } from "../core/MuhurthaEngine";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";

const MONTH_NAMES: Record<string, string[]> = {
  en: ["All Months", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  kn: ["ಎಲ್ಲಾ ತಿಂಗಳುಗಳು", "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"],
  hi: ["सभी महीने", "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
  te: ["అన్ని నెలలు", "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబరు", "అక్టోబరు", "నవంబరు", "డిసెంబరు"],
  ta: ["அனைத்து மாதங்கள்", "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"]
};

export default function MuhurthaPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const isKn = lang.startsWith("kn");

  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabel = useAppStore((s) => s.placeLabel);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const session = useKundliViewerStore((s) => s.session);

  // Determine active coordinates
  const activeLat = session ? session.input.latitude : defaultLat;
  const activeLng = session ? session.input.longitude : defaultLng;
  const activeLabel = session ? session.placeLabel : placeLabel;

  const [muhurthas, setMuhurthas] = useState<MuhurthaEntry[]>([]);
  const [selectedMuhurthaYear, setSelectedMuhurthaYear] = useState<number>(new Date().getFullYear());
  const [selectedMuhurthaCategory, setSelectedMuhurthaCategory] = useState<
    "all" | "marriage" | "housewarming" | "upanayana" | "choula" | "devapratishtha" | "general"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All
  const [authenticOnly, setAuthenticOnly] = useState<boolean>(false);
  const [loadingMuhurthas, setLoadingMuhurthas] = useState<boolean>(false);
  const [expandedEntryDate, setExpandedEntryDate] = useState<string | null>(null);

  useEffect(() => {
    setLoadingMuhurthas(true);
    fetchShuddhaMuhurthas(selectedMuhurthaYear, activeLat, activeLng, ayanamsaModel)
      .then((res) => {
        setMuhurthas(res);
        setLoadingMuhurthas(false);
      })
      .catch(() => {
        setLoadingMuhurthas(false);
      });
  }, [selectedMuhurthaYear, activeLat, activeLng, ayanamsaModel]);

  const filteredMuhurthas = useMemo(() => {
    return muhurthas.filter((m) => {
      // 1. Filter by category
      if (selectedMuhurthaCategory !== "all" && !m.types.includes(selectedMuhurthaCategory)) {
        return false;
      }
      // 2. Filter by month
      if (selectedMonth !== 0) {
        const monthPart = parseInt(m.date.split("-")[1] || "0", 10);
        if (monthPart !== selectedMonth) {
          return false;
        }
      }
      // 3. Filter by Authentic Match
      if (authenticOnly && !m.isAuthenticMatch) {
        return false;
      }
      return true;
    });
  }, [muhurthas, selectedMuhurthaCategory, selectedMonth, authenticOnly]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-indigo-950/5 p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold text-indigo-950">
          {isKn ? "ಶುಭ ಮುಹೂರ್ತಗಳು" : "Auspicious Muhurthas"}
        </h2>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {isKn
            ? "ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಪಂಚಾಂಗದ ಆಧಾರದ ಮೇಲೆ ಪ್ರಸ್ತುತ ಮತ್ತು ಮುಂದಿನ ವರ್ಷದ ಶುದ್ಧ ಮುಹೂರ್ತಗಳನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು. ಇವು ಸಾಮಾನ್ಯ ಮತ್ತು ವೈವಾಹಿಕ, ಗೃಹಪ್ರವೇಶ ಮತ್ತು ಉಪನಯನಗಳ ಶುದ್ಧ ದಿನಗಳನ್ನು ಒಳಗೊಂಡಿವೆ."
            : "Explore 100% pure Vedic auspicious timings for the current and next calendar years. Scans are customized to your location, eliminating malefic Yogas, Bhadra Karana, and unfavorable Nakshatras."}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 px-3 py-1 text-[10px] font-semibold text-indigo-900 border border-indigo-100">
          📍 {isKn ? "ಲೆಕ್ಕಾಚಾರದ ಸ್ಥಳ: " : "Calculated for: "}
          <span className="font-bold">{activeLabel}</span>
          <span className="text-slate-400">
            ({activeLat.toFixed(3)}°N, {activeLng.toFixed(3)}°E)
          </span>
        </div>
      </div>

      {/* Year & Category Selectors */}
      <div className="rounded-2xl border border-amber-500/10 bg-[#fffdf9]/80 p-5 shadow-md backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Year Tabs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/80 mb-2">
              {isKn ? "ವರ್ಷ ಆಯ್ಕೆ" : "Select Year"}
            </h3>
            <div className="inline-flex rounded-xl bg-indigo-50/80 p-1 border border-indigo-100">
              {[new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                    selectedMuhurthaYear === y
                      ? "bg-indigo-950 text-white shadow-sm scale-105"
                      : "text-indigo-900/70 hover:text-indigo-950"
                  }`}
                  onClick={() => {
                    setSelectedMuhurthaYear(y);
                    setExpandedEntryDate(null);
                  }}
                >
                  {isKn ? `${y} ನೇ ಸಾಲು` : `${y} Year`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex-1 sm:max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/80 mb-2 sm:text-right">
              {isKn ? "ಮುಹೂರ್ತದ ವಿಧ" : "Muhurtha Type"}
            </h3>
            <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
              {(["all", "marriage", "housewarming", "upanayana", "choula", "devapratishtha", "general"] as const).map((cat) => {
                const label =
                  cat === "all"
                    ? (isKn ? "ಎಲ್ಲಾ" : "All")
                    : cat === "marriage"
                    ? (isKn ? "ವಿವಾಹ 💍" : "Marriage 💍")
                    : cat === "housewarming"
                    ? (isKn ? "ಗೃಹಪ್ರವೇಶ 🏡" : "Housewarming 🏡")
                    : cat === "upanayana"
                    ? (isKn ? "ಉಪನಯನ 🪘" : "Upanayana 🪘")
                    : cat === "choula"
                    ? (isKn ? "ಚೌಲ ✂️" : "Choula ✂️")
                    : cat === "devapratishtha"
                    ? (isKn ? "ದೇವ ಪ್ರತಿಷ್ಠಾ 🕉️" : "Deva Pratishtha 🕉️")
                    : (isKn ? "ಶುಭ ಕಾರ್ಯ ✨" : "General ✨");

                const isActive = selectedMuhurthaCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => {
                      setSelectedMuhurthaCategory(cat);
                      setExpandedEntryDate(null);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Month Selector Grid */}
        <div className="border-t border-slate-100 pt-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/80 mb-2">
            {isKn ? "ತಿಂಗಳು ಆಯ್ಕೆ" : "Select Month"}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(MONTH_NAMES[lang] || MONTH_NAMES.en).map((monthName, idx) => (
              <button
                key={idx}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all duration-300 ${
                  selectedMonth === idx
                    ? "bg-indigo-950 text-white shadow-sm scale-105"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-150 border border-slate-200/50"
                }`}
                onClick={() => {
                  setSelectedMonth(idx);
                  setExpandedEntryDate(null);
                }}
              >
                {monthName}
              </button>
            ))}
          </div>
        </div>

        {/* Authentic Filter Toggle */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between sm:justify-start sm:gap-4">
          <div>
            <h3 className="text-xs font-bold text-indigo-900/80">
              {isKn ? "ಬಗ್ಗೋಣ ದತ್ತಾಂಶ ಮಾತ್ರ" : "Authentic Baggona Only"}
            </h3>
            <p className="text-[9px] text-slate-500">
              {isKn 
                ? "ಕೇವಲ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಮುದ್ರಿತ ಪ್ರತಿಯಲ್ಲಿರುವ ಮುಹೂರ್ತಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸಿ." 
                : "Show only dates explicitly found in the printed almanac."}
            </p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              authenticOnly ? 'bg-amber-500' : 'bg-slate-200'
            }`}
            onClick={() => setAuthenticOnly(!authenticOnly)}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                authenticOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loadingMuhurthas ? (
        <Card className="flex flex-col items-center justify-center py-16 bg-[#fffdf9]/50">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-bold text-indigo-900/80 animate-pulse">
            {isKn ? "ಶುದ್ಧ ಮುಹೂರ್ತಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Finding Shuddha Muhurthas for you..."}
          </p>
        </Card>
      ) : (() => {
        if (filteredMuhurthas.length === 0) {
          return (
            <Card className="flex flex-col items-center justify-center py-16 text-center border-amber-500/10 bg-[#fffdf9]/40">
              <span className="text-3xl">🔔</span>
              <h4 className="mt-3 text-sm font-bold text-indigo-950">
                {isKn ? "ಯಾವುದೇ ಶುದ್ಧ ಮುಹೂರ್ತಗಳು ಲಭ್ಯವಿಲ್ಲ" : "No Shuddha Muhurthas Found"}
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 leading-normal">
                {isKn
                  ? "ಆಯ್ಕೆ ಮಾಡಿದ ತಿಂಗಳು, ವರ್ಷ ಮತ್ತು ವಿಭಾಗದಲ್ಲಿ ಪಂಚಾಂಗದ ಎಲ್ಲಾ ಶುದ್ಧ ನಿಯಮಗಳನ್ನು ಪೂರೈಸುವ ಮುಹೂರ್ತಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
                  : "No days meet 100% of the Vedic purity criteria for this month, year and category."}
              </p>
            </Card>
          );
        }

        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredMuhurthas.map((m) => {
              const isExpanded = expandedEntryDate === m.date;
              const dateObj = new Date(m.date);
              const formattedDate = dateObj.toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric"
              });

              // Determine color scheme based on types with premium block borders
              let accentClass = "border-indigo-400 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/20 dark:to-purple-950/10";
              let badgeClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border border-indigo-200";
              let icon = "✨";
              let typeLabel = isKn ? "ಶುಭ ಕಾರ್ಯ" : "General Auspicious";
              if (lang === "hi") typeLabel = "सामान्य मुहूर्त";
              if (lang === "te") typeLabel = "సాధారణ ముహూర్తం";
              if (lang === "ta") typeLabel = "பொதுவான முகூர்த்தம்";

              if (m.types.includes("marriage")) {
                accentClass = "border-rose-400 bg-gradient-to-br from-rose-50/90 to-pink-50/90 dark:from-rose-950/20 dark:to-pink-950/10";
                badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200";
                icon = "💍";
                typeLabel = isKn ? "ಶುಭ ವಿವಾಹ" : "Marriage Muhurtha";
                if (lang === "hi") typeLabel = "विवाह मुहूर्त";
                if (lang === "te") typeLabel = "వివాహ ముహూర్తం";
                if (lang === "ta") typeLabel = "திருமண முகூர்த்தம்";
              } else if (m.types.includes("devapratishtha")) {
                accentClass = "border-orange-400 bg-gradient-to-br from-orange-50/90 to-red-50/90 dark:from-orange-950/20 dark:to-red-950/10";
                badgeClass = "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200";
                icon = "🕉️";
                typeLabel = isKn ? "ದೇವ ಪ್ರತಿಷ್ಠಾ" : "Deva Pratishtha";
              } else if (m.types.includes("housewarming")) {
                accentClass = "border-emerald-400 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/20 dark:to-teal-950/10";
                badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200";
                icon = "🏡";
                typeLabel = isKn ? "ಗೃಹಪ್ರವೇಶ" : "Housewarming";
                if (lang === "hi") typeLabel = "गृह प्रवेश";
                if (lang === "te") typeLabel = "గృహప్రవేశం";
                if (lang === "ta") typeLabel = "கிருஹப்பிரவேசம்";
              } else if (m.types.includes("upanayana")) {
                accentClass = "border-amber-400 bg-gradient-to-br from-amber-50/90 to-yellow-50/90 dark:from-amber-950/20 dark:to-yellow-950/10";
                badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200";
                icon = "🪘";
                typeLabel = isKn ? "ಉಪನಯನ" : "Upanayana";
                if (lang === "hi") typeLabel = "उपनयन संस्कार";
                if (lang === "te") typeLabel = "ఉపనయనం";
                if (lang === "ta") typeLabel = "உபநயனம்";
              } else if (m.types.includes("choula")) {
                accentClass = "border-cyan-400 bg-gradient-to-br from-cyan-50/90 to-blue-50/90 dark:from-cyan-950/20 dark:to-blue-950/10";
                badgeClass = "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200";
                icon = "✂️";
                typeLabel = isKn ? "ಚೌಲ" : "Choula";
              }

              return (
                <div
                  key={m.date}
                  className={`overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${accentClass} ${
                    isExpanded ? "ring-4 ring-indigo-500/20 scale-[1.03]" : ""
                  }`}
                  onClick={() => setExpandedEntryDate(isExpanded ? null : m.date)}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-black/5 bg-white/40 relative">
                    {m.isAuthenticMatch && (
                      <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[8px] font-bold text-white shadow-sm flex items-center gap-1 uppercase tracking-wider">
                        📜 {isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದತ್ತಾಂಶ" : "Authentic Baggona"}
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${badgeClass}`}>
                        <span>{icon}</span> {typeLabel}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200/50">
                        {m.purityScore}% {isKn ? "ಶುದ್ಧತೆ" : "Pure"}
                      </span>
                    </div>
                    <h4 className="mt-3 text-sm font-extrabold text-indigo-950 capitalize">
                      {formattedDate}
                    </h4>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5 bg-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{isKn ? "ನಕ್ಷತ್ರ" : "Nakshatra"}</span>
                      <span className="font-bold text-slate-900">
                        {isKn ? m.nakshatraNameKn : m.nakshatraName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{isKn ? "ತಿಥಿ" : "Tithi"}</span>
                      <span className="font-bold text-slate-900">
                        {isKn ? m.tithiNameKn : m.tithiName}
                      </span>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-black/5 space-y-3 text-[11px] leading-relaxed text-slate-700 animate-slide-down bg-white/20 p-2 rounded-xl border border-black/5">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex flex-col">
                            <span className="text-slate-400 text-[9px] uppercase tracking-wider">{isKn ? "ಯೋಗ" : "Yoga"}</span>
                            <span className="font-medium text-slate-900">{isKn ? m.yogaNameKn : m.yogaName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-400 text-[9px] uppercase tracking-wider">{isKn ? "ಕರಣ" : "Karana"}</span>
                            <span className="font-medium text-slate-900">{isKn ? m.karanaNameKn : m.karanaName}</span>
                          </div>
                        </div>

                        {/* Baggona Muhurtha Explanation */}
                        {m.baggonaCriteria && (
                          <div className="space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-3">
                            <h5 className="font-bold text-indigo-900/90 text-xs border-b border-indigo-900/10 pb-1">
                              {isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ನಿಯಮಗಳು (ವೈಶಿಷ್ಟ್ಯಗಳು)" : "Baggona Panchanga Rules Applied"}
                            </h5>
                            <ul className="list-disc pl-4 space-y-1 text-[10px] text-indigo-900/80">
                              {m.baggonaCriteria.reasons.map((reason: string, idx: number) => (
                                <li key={idx}>✨ {reason}</li>
                              ))}
                            </ul>
                            <div className="mt-2 pt-2 border-t border-indigo-900/10 font-bold text-indigo-950 text-xs text-right">
                              {isKn ? "ಒಟ್ಟು ಶುದ್ಧತೆ: " : "Overall Purity: "} {m.purityScore}%
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h5 className="font-bold text-indigo-900/90 text-xs border-b border-indigo-900/10 pb-1">
                            {isKn ? "ಶುಭ ಮುಹೂರ್ತ (ಲಗ್ನ) ಸಮಯಗಳು" : "Auspicious Lagna Timings"}
                          </h5>
                          
                          {m.lagnas && m.lagnas.length > 0 ? (
                            m.lagnas.map((lagna, i) => (
                              <div key={i} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 relative">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-emerald-950 text-xs">
                                    {lagna.startTime} - {lagna.endTime}
                                  </span>
                                  <span className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded-full text-emerald-800">
                                    {isKn ? lagna.rashiNameKn : lagna.rashiName} {isKn ? "ಲಗ್ನ" : "Lagna"}
                                  </span>
                                </div>
                                <p className="text-[10px] text-emerald-900/80 mt-1 leading-snug">
                                  ✨ {isKn ? lagna.explanationKn : lagna.explanation}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[10px] text-amber-950">
                              {isKn ? "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಶುದ್ಧ ಲಗ್ನ ಕಂಡುಬಂದಿಲ್ಲ." : "No specific pure Lagna found for this day."}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isExpanded && (
                      <div className="text-[10px] text-center text-indigo-900/60 font-bold mt-1">
                        {isKn ? "ವಿವರಗಳಿಗಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ ➔" : "Click to view full details ➔"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
      
      {/* Astro Theme Small Callout */}
      <div className="text-center text-[10px] text-slate-500 py-4 border-t border-slate-200">
        <p>✵ {isKn ? "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರ ನಿಯಮಗಳು" : "Baggona Panchanga Vedic Astrological Standards"} ✵</p>
      </div>
    </div>
  );
}
