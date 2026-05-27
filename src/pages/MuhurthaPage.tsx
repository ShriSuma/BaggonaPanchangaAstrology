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
  const [selectedMuhurthaYear, setSelectedMuhurthaYear] = useState<number>(2026);
  const [selectedMuhurthaCategory, setSelectedMuhurthaCategory] = useState<
    "all" | "marriage" | "housewarming" | "upanayana" | "general"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All
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
      return true;
    });
  }, [muhurthas, selectedMuhurthaCategory, selectedMonth]);

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
              {[2026, 2027].map((y) => (
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
              {(["all", "marriage", "housewarming", "upanayana", "general"] as const).map((cat) => {
                const label =
                  cat === "all"
                    ? (isKn ? "ಎಲ್ಲಾ" : "All")
                    : cat === "marriage"
                    ? (isKn ? "ವಿವಾಹ 💍" : "Marriage 💍")
                    : cat === "housewarming"
                    ? (isKn ? "ಗೃಹಪ್ರವೇಶ 🏡" : "Housewarming 🏡")
                    : cat === "upanayana"
                    ? (isKn ? "ಉಪನಯನ 🪘" : "Upanayana 🪘")
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
                  <div className="p-4 border-b border-black/5 bg-white/40">
                    <div className="flex justify-between items-start gap-2">
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
                      <div className="mt-3 pt-3 border-t border-black/5 space-y-2 text-[11px] leading-relaxed text-slate-700 animate-slide-down bg-white/20 p-2 rounded-xl border border-black/5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{isKn ? "ಯೋಗ" : "Yoga"}</span>
                          <span className="font-medium text-slate-900">
                            {isKn ? m.yogaNameKn : m.yogaName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{isKn ? "ಕರಣ" : "Karana"}</span>
                          <span className="font-medium text-slate-900">
                            {isKn ? m.karanaNameKn : m.karanaName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{isKn ? "ವಾಸರ" : "Day"}</span>
                          <span className="font-medium text-slate-900">
                            {isKn ? m.weekdayNameKn : m.weekdayName}
                          </span>
                        </div>
                        <div className="mt-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[10px] text-emerald-950 font-bold leading-normal">
                          ✨{" "}
                          {isKn
                            ? `ಈ ದಿನವು ${m.tithiNameKn} ತಿಥಿ ಮತ್ತು ${m.nakshatraNameKn} ನಕ್ಷತ್ರದೊಂದಿಗೆ ಕೂಡಿದ್ದು ಪೂರ್ಣ ಶುದ್ಧ ಮುಹೂರ್ತವಾಗಿದೆ. ಭದ್ರ ಕರಣ ಮತ್ತು ಮಲಿನ್ ಯೋಗಗಳ ಸಂಪೂರ್ಣ ಅನುಪಸ್ಥಿತಿಯಿದ್ದು, ಕಾರ್ಯಗಳಿಗೆ ಸಿದ್ಧಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ.`
                            : `This day hosts pure ${m.tithiName} Tithi and auspicious ${m.nakshatraName} Nakshatra. It is free from Bhadra Karana and malefic Yogas, promising maximum success.`}
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
