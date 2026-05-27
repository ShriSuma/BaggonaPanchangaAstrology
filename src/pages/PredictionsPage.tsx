import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getDailyPrediction,
  getWeeklyPrediction,
  getMonthlyPrediction,
  getYearlyPrediction
} from "../core/PredictionEngine";
import { ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { fetchPredictionFromApi } from "../services/predictionApi";
import { hydrateMissingTranslations } from "../services/i18nHydrate";
import {
  localizePredictionOutput,
  predictionNeedsLocalization
} from "../services/localizeContent";
import { analytics } from "../core/analytics";
import {
  getLatestKundliRecord,
  getPredictionCache,
  savePredictionCache
} from "../db/indexedDb";
import type { PredictionOutput } from "../core/AstroTypes";
import { useAppStore } from "../stores/appStore";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";

type Tab = "daily" | "weekly" | "monthly" | "yearly";

export default function PredictionsPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const [tab, setTab] = useState<Tab>("daily");
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [empty, setEmpty] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Get active language code
  const lang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setPrediction(null);
      try {
        const kundli = await getLatestKundliRecord();
        if (!kundli) {
          if (!cancelled) {
            setEmpty(true);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setEmpty(false);
        if (lang !== "en") {
          await hydrateMissingTranslations(lang);
        }
        const key =
          (tab === "daily"
            ? new Date().toISOString().slice(0, 10)
            : tab === "weekly"
            ? `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`
            : tab === "monthly"
            ? `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
            : `${new Date().getFullYear()}`) + `-${ayanamsaModel}`;

        const cached = kundli.id ? await getPredictionCache(kundli.id, tab as any, key, lang) : null;
        if (cached) {
          const localized =
            lang !== "en" && predictionNeedsLocalization(cached, lang)
              ? await localizePredictionOutput(cached, lang)
              : cached;
          if (!cancelled) {
            setPrediction(localized);
            setLoading(false);
          }
          return;
        }

        const birth = {
          birthDate: kundli.birthDate,
          birthTime: kundli.birthTime,
          latitude: kundli.latitude,
          longitude: kundli.longitude,
          ayanamsaModel
        };

        const now = new Date();
        const ageYears = ageDecimalYearsAt(kundli.birthDate, kundli.birthTime, kundli.latitude, kundli.longitude, now);
        const vb = findBhuktiAtAge(kundli.kundliData, ageYears);
        const apiUrl = import.meta.env.VITE_PREDICTION_API_URL as string | undefined;

        let generated: PredictionOutput;
        if (apiUrl?.trim()) {
          try {
            generated = await fetchPredictionFromApi({
              lang,
              period: tab === "yearly" ? "monthly" : tab, // fallback API parameter
              periodKey: key,
              name: kundli.name,
              kundliSummary: {
                lagnaSanskrit: kundli.kundliData.lagnaRashi.sanskrit,
                moonSignSanskrit: kundli.kundliData.moonSign.sanskrit,
                moonPada: kundli.kundliData.moonPada,
                dashaMaha: vb?.maha.planet,
                dashaBhukti: vb?.bhukti,
                ageYears
              }
            });
          } catch {
            generated =
              tab === "daily"
                ? getDailyPrediction(kundli.kundliData, new Date(), t, kundli.name, birth)
                : tab === "weekly"
                ? getWeeklyPrediction(kundli.kundliData, new Date(), t, kundli.name, birth)
                : tab === "monthly"
                ? getMonthlyPrediction(kundli.kundliData, new Date().getFullYear(), new Date().getMonth() + 1, t, kundli.name, birth)
                : getYearlyPrediction(kundli.kundliData, new Date().getFullYear(), t, kundli.name, birth);
          }
        } else {
          generated =
            tab === "daily"
              ? getDailyPrediction(kundli.kundliData, new Date(), t, kundli.name, birth)
              : tab === "weekly"
              ? getWeeklyPrediction(kundli.kundliData, new Date(), t, kundli.name, birth)
              : tab === "monthly"
              ? getMonthlyPrediction(kundli.kundliData, new Date().getFullYear(), new Date().getMonth() + 1, t, kundli.name, birth)
              : getYearlyPrediction(kundli.kundliData, new Date().getFullYear(), t, kundli.name, birth);
        }
        if (lang !== "en" && predictionNeedsLocalization(generated, lang)) {
          generated = await localizePredictionOutput(generated, lang);
        }
        if (kundli.id) {
          await savePredictionCache(kundli.id, tab as any, key, lang, generated);
        }
        if (!cancelled) {
          setPrediction(generated);
          await analytics.track("prediction_viewed", { tab });
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setLoadError(msg || t("predictions.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, i18n.language, i18n.resolvedLanguage, t, ayanamsaModel, lang]);

  const getPeriodLabel = (id: Tab): string => {
    switch (id) {
      case "daily":
        if (lang === "kn") return "ಇಂದು 📅";
        if (lang === "hi") return "आज 📅";
        if (lang === "te") return "ఈ రోజు 📅";
        if (lang === "ta") return "இன்று 📅";
        return "Today 📅";
      case "weekly":
        if (lang === "kn") return "ಈ ವಾರ 🗓️";
        if (lang === "hi") return "इस सप्ताह 🗓️";
        if (lang === "te") return "ఈ వారం 🗓️";
        if (lang === "ta") return "இந்த வாரம் 🗓️";
        return "This Week 🗓️";
      case "monthly":
        if (lang === "kn") return "ಈ ತಿಂಗಳು 🌕";
        if (lang === "hi") return "इस महीने 🌕";
        if (lang === "te") return "ఈ నెల 🌕";
        if (lang === "ta") return "இந்த மாதம் 🌕";
        return "This Month 🌕";
      case "yearly":
        if (lang === "kn") return "ಈ ವರ್ಷ 🪐";
        if (lang === "hi") return "इस वर्ष 🪐";
        if (lang === "te") return "ఈ సంవత్సరం 🪐";
        if (lang === "ta") return "இந்த வருடம் 🪐";
        return "This Year 🪐";
    }
  };

  const getDomainLabel = (domain: "career" | "finance" | "health" | "relationships" | "lucky" | "rating"): string => {
    switch (domain) {
      case "career":
        if (lang === "kn") return "ಉದ್ಯೋಗ ಮತ್ತು ವ್ಯವಹಾರ";
        if (lang === "hi") return "करियर और व्यवसाय";
        if (lang === "te") return "ఉద్యోగ మరియు వ్యాపారం";
        if (lang === "ta") return "தொழில் மற்றும் வியாபாரம்";
        return "Career & Business";
      case "finance":
        if (lang === "kn") return "ಹಣಕಾಸು ಮತ್ತು ಸಂಪತ್ತು";
        if (lang === "hi") return "वित्त और संपत्ति";
        if (lang === "te") return "ఆర్థిక మరియు సంపద";
        if (lang === "ta") return "நிதி மற்றும் செல்வம்";
        return "Finance & Wealth";
      case "health":
        if (lang === "kn") return "ಆರೋಗ್ಯ ಮತ್ತು ದೈಹಿಕ ಸ್ಥಿತಿ";
        if (lang === "hi") return "स्वास्थ्य और ऊर्जा";
        if (lang === "te") return "ఆరోగ్యం మరియు శారీరక స్థితి";
        if (lang === "ta") return "உடல் நலம் மற்றும் ஆரோக்கியம்";
        return "Health & Vitality";
      case "relationships":
        if (lang === "kn") return "ಕೌಟುಂಬಿಕ ಮತ್ತು ಒಡನಾಟ";
        if (lang === "hi") return "पारिवारिक और संबंध";
        if (lang === "te") return "కుటుంబ మరియు సంబంధాలు";
        if (lang === "ta") return "குடும்பம் மற்றும் உறவுகள்";
        return "Love & Relationships";
      case "lucky":
        if (lang === "kn") return "ಅದೃಷ್ಟ ಸೂಚಕಗಳು";
        if (lang === "hi") return "भाग्यशाली सूचक";
        if (lang === "te") return "అదృష్ట సూచికలు";
        if (lang === "ta") return "அதிர்ஷ்ட காரணிகள்";
        return "Lucky Indicators";
      case "rating":
        if (lang === "kn") return "ಒಟ್ಟಾರೆ ಗ್ರಹ ಬಲ";
        if (lang === "hi") return "कुल मिलाकर गोचर बल";
        if (lang === "te") return "మొత్తం గ్రహ బలం";
        if (lang === "ta") return "ஒட்டுமொத்த கிரக பலம்";
        return "Overall Energy Rating";
    }
  };

  const parseBoldText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={index}
            className="text-indigo-950 dark:text-amber-300 font-bold bg-amber-500/10 dark:bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block font-sans shadow-sm"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (empty === null) {
    return (
      <Card className="flex items-center justify-center py-20">
        <GrahaSpinner />
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="max-w-md mx-auto text-center p-8 border border-amber-500/10 bg-[#fffdf9]/80 shadow-lg">
        <div className="text-4xl mb-4">🔮</div>
        <p className="font-extrabold text-indigo-950 text-base">{t("predictions.emptyTitle")}</p>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">{t("predictions.emptyBody")}</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/10 transition-all hover:scale-105 active:scale-95"
          onClick={() => setPage("kundli")}
        >
          {t("predictions.goToKundli")}
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Period Selection Bar */}
      <div className="flex overflow-x-auto rounded-2xl border border-amber-500/10 bg-[#fffdf9]/90 p-1.5 shadow-md backdrop-blur-sm justify-between">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((tId) => (
          <button
            key={tId}
            type="button"
            className={`flex-1 min-w-[90px] whitespace-nowrap rounded-xl py-3 text-xs font-extrabold transition-all duration-300 ${
              tab === tId
                ? "bg-indigo-950 text-white shadow-md scale-102"
                : "text-indigo-900/60 hover:text-indigo-950 hover:bg-indigo-50/50"
            }`}
            onClick={() => setTab(tId)}
          >
            {getPeriodLabel(tId)}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 shadow-sm">
          <p className="font-bold">Failed to load reading</p>
          <p className="mt-1 text-slate-600">{loadError}</p>
        </div>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center py-20 bg-[#fffdf9]/50 border-amber-500/10">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-bold text-indigo-900/80 animate-pulse">
            Analyzing Gochara Transits & Dasha periods...
          </p>
        </Card>
      )}

      {!loading && prediction && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card / Title */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 h-28 w-28 rounded-full bg-amber-500/10 blur-xl" />
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                🚀 Gochara Kundali predictions (1st House as Rashi)
              </span>
              <h3 className="mt-3 text-lg font-extrabold tracking-tight sm:text-xl text-yellow-300">
                {prediction.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 text-justify">
                {prediction.summary}
              </p>

              {/* Dasha & Timing context banner */}
              {prediction.dashaLine && (
                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-white/5 border border-white/10 p-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span>⏳</span>
                    <span>{prediction.dashaLine}</span>
                  </div>
                  {prediction.timingLine && (
                    <p className="text-slate-400 italic font-medium">{prediction.timingLine}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lucky metrics dashboard & Rating */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Rating card */}
            <div className="rounded-2xl border border-amber-500/10 bg-[#fffdf9]/80 p-5 shadow-md flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900/60 mb-2">
                  {getDomainLabel("rating")}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-indigo-950">{prediction.rating}</span>
                  <span className="text-slate-300 text-xl">/ 5</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < prediction.rating ? "text-amber-500 font-bold" : "text-slate-200"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-3 border-t border-slate-100 pt-2 leading-relaxed">
                Score based on transit aspects of Jupiter, Saturn, and your running Vimshottari lords.
              </p>
            </div>

            {/* Lucky properties */}
            <div className="rounded-2xl border border-amber-500/10 bg-[#fffdf9]/80 p-5 shadow-md">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900/60 mb-3">
                {getDomainLabel("lucky")}
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Color</p>
                  <p className="mt-1 text-xs font-extrabold text-indigo-950 truncate">
                    🎨 {prediction.lucky.color}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Number</p>
                  <p className="mt-1 text-xs font-extrabold text-indigo-950">
                    🔢 {prediction.lucky.number}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Direction</p>
                  <p className="mt-1 text-xs font-extrabold text-indigo-950 truncate">
                    🧭 {prediction.lucky.direction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Four Core domains of life */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Career & Business */}
            <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">
                  💼
                </span>
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                  {getDomainLabel("career")}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {parseBoldText(prediction.career)}
              </p>
            </div>

            {/* Finance & Wealth */}
            <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-sm">
                  💰
                </span>
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                  {getDomainLabel("finance")}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {parseBoldText(prediction.finance)}
              </p>
            </div>

            {/* Health & Vitality */}
            <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 text-sm">
                  🩺
                </span>
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                  {getDomainLabel("health")}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {parseBoldText(prediction.health)}
              </p>
            </div>

            {/* Love & Relationships */}
            <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-600 text-sm">
                  💖
                </span>
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                  {getDomainLabel("relationships")}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 text-justify">
                {parseBoldText(prediction.relationships)}
              </p>
            </div>
          </div>

          {/* Integrated reading / Cosmic Synthesis */}
          {prediction.integratedReading && (
            <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-50/50 via-[#fffdf9]/50 to-indigo-50/30 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">✵</span>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                  {lang === "kn" ? "ಸಂಪೂರ್ಣ ಜಾತಕ ಮತ್ತು ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ" : "Cosmic Synthesis (Combined Reading)"}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-800 text-justify font-medium">
                {parseBoldText(prediction.integratedReading)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
