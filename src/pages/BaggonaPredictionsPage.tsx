import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getLatestKundliRecord, type KundliRecord } from "../db/indexedDb";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { generateBaggonaPredictions, translateBaggonaPredictions, type BaggonaPredictions } from "../core/BaggonaPredictionEngine";
import { useAppStore } from "../stores/appStore";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";

type SubTab = "overview" | "planets" | "houses" | "yogas";

export default function BaggonaPredictionsPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const [record, setRecord] = useState<KundliRecord | null | undefined>(undefined);
  const [tab, setTab] = useState<SubTab>("overview");
  const [predictions, setPredictions] = useState<BaggonaPredictions | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const lang = i18n.language.split("-")[0] || "en";
  const isKn = lang === "kn";

  useEffect(() => {
    void getLatestKundliRecord().then((r) => setRecord(r ?? null));
  }, []);

  const traditionalData = useMemo(() => {
    if (!record) return null;
    return calculateTraditionalBaggona(
      record.birthDate,
      record.birthTime,
      record.latitude,
      record.longitude,
      ayanamsaModel
    );
  }, [record, ayanamsaModel]);

  useEffect(() => {
    if (!record || !traditionalData) {
      setPredictions(null);
      return;
    }

    let cancelled = false;
    const computeAndTranslate = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Generate the base English predictions from the Kundli & traditional Panchanga data
        const basePreds = generateBaggonaPredictions(record.kundliData, traditionalData);

        // Dynamically translate all strings to the target Indic language if active
        if (lang !== "en") {
          const translatedPreds = await translateBaggonaPredictions(basePreds, lang);
          if (!cancelled) {
            setPredictions(translatedPreds);
          }
        } else {
          if (!cancelled) {
            setPredictions(basePreds);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void computeAndTranslate();

    return () => {
      cancelled = true;
    };
  }, [record, traditionalData, lang]);

  if (record === undefined) {
    return (
      <Card>
        <GrahaSpinner />
      </Card>
    );
  }

  if (!record || !traditionalData) {
    return (
      <Card>
        <p className="font-semibold text-indigo-950 text-base">
          {isKn ? "ಕುಂಡಲಿ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ" : "No Birth Chart Data Found"}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {isKn 
            ? "ಭಾಗ್ಗೋಣ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಹುಟ್ಟಿದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ." 
            : "Please enter your birth details and generate a chart first to view your traditional predictions."}
        </p>
        <button
          type="button"
          className="jk-btn mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md shadow-amber-500/10 active:scale-95"
          onClick={() => setPage("kundli")}
        >
          {isKn ? "ಕುಂಡಲಿಗೆ ಹೋಗಿ" : "Go to Birth Chart"}
        </button>
      </Card>
    );
  }

  const subTabs: { id: SubTab; label: string; icon: string }[] = [
    { id: "overview", label: isKn ? "ಮುಖ್ಯಾಂಶಗಳು" : "Overview", icon: "✵" },
    { id: "planets", label: isKn ? "ಗ್ರಹ ಬಲಗಳು" : "Planets", icon: "🪐" },
    { id: "houses", label: isKn ? "ದ್ವಾದಶ ಭಾವಗಳು" : "12 Houses", icon: "☸" },
    { id: "yogas", label: isKn ? "ಯೋಗ & ಆಯುಷ್ಯ" : "Yogas & Ayush", icon: "📜" }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/80 p-5 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-xl" />
        <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl" />
        
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            {isKn ? "ಸಾಂಪ್ರದಾಯಿಕ ಭಾಗ್ಗೋಣ ಭವಿಷ್ಯ" : "Traditional Baggona Predictions"}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {isKn ? `${record.name} ಅವರ ಜನ್ಮಕುಂಡಲಿ ಭವಿಷ್ಯ` : `Vedic Astrology Readings for ${record.name}`}
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            {isKn 
              ? "ಹಸ್ತಪ್ರತಿಯ ನಿಯಮಗಳು ಮತ್ತು ಗ್ರಹಗಳ ಗುಣಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ಭವಿಷ್ಯ" 
              : "Astrological predictions generated using rules from the ancient handwritten manual."}
          </p>
          
          {/* Metadata Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಹುಟ್ಟಿದ ದಿನ" : "Birth Date"}</p>
              <p className="mt-0.5 font-bold text-white">{record.birthDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಹುಟ್ಟಿದ ಸಮಯ" : "Birth Time"}</p>
              <p className="mt-0.5 font-bold text-white">{record.birthTime}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಸಂವತ್ಸರ" : "Samvatsara"}</p>
              <p className="mt-0.5 font-bold text-amber-300">{isKn ? traditionalData.samvatsaraKn : traditionalData.samvatsara}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ನಕ್ಷತ್ರ" : "Nakshatra"}</p>
              <p className="mt-0.5 font-bold text-amber-300">{isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex overflow-x-auto rounded-xl border border-amber-500/10 bg-amber-500/5 p-1 shadow-inner backdrop-blur-sm">
        {subTabs.map((st) => (
          <button
            key={st.id}
            type="button"
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
              tab === st.id
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
                : "text-indigo-950 hover:bg-amber-500/10"
            }`}
            onClick={() => setTab(st.id)}
          >
            <span>{st.icon}</span>
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 shadow-sm animate-fade-in">
          <p className="font-semibold">{isKn ? "ದೋಷ ಉಂಟಾಗಿದೆ" : "Failed to Load Predictions"}</p>
          <p className="mt-1 text-xs text-rose-800">{loadError}</p>
        </div>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center py-12">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-semibold text-indigo-950 animate-pulse">
            {isKn ? "ಪಂಚಾಂಗ ನಿಯಮಗಳನ್ನು ಅನ್ವಯಿಸಲಾಗುತ್ತಿದೆ..." : "Applying traditional Vedic rules..."}
          </p>
        </Card>
      )}

      {!loading && predictions && (
        <div className="space-y-4 animate-fade-in">
          {tab === "overview" && (
            <div className="space-y-4">
              {predictions.overview.map((sec, i) => (
                <div
                  key={`overview-${i}`}
                  className="group rounded-2xl border border-amber-500/10 bg-white p-4 shadow-sm transition-all hover:border-amber-500/20 hover:shadow-md"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                    <span className="text-amber-500">✵</span> {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "planets" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {predictions.planets.map((sec, i) => (
                <div
                  key={`planet-${i}`}
                  className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/10 p-4 shadow-sm transition-all hover:border-amber-500/25 hover:shadow-md"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-xs text-amber-600">
                      🪐
                    </span>
                    {sec.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "houses" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50/50 p-3 text-center border border-amber-500/15">
                <p className="text-[11px] font-semibold text-amber-950 uppercase tracking-wide">
                  {isKn ? "ದ್ವಾದಶ ಭಾವ ಫಲಗಳು" : "12 House Significations & Occupants"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {predictions.houses.map((sec, i) => (
                  <div
                    key={`house-${i}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-amber-500/20 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-900">
                        {i + 1}
                      </span>
                      <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                        {sec.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                      {sec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "yogas" && (
            <div className="space-y-4">
              {predictions.yogas.map((sec, i) => (
                <div
                  key={`yoga-${i}`}
                  className="rounded-2xl border-2 border-double border-amber-500/25 bg-amber-50/10 p-4 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    📜 {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-800 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
              {predictions.longevity.map((sec, i) => (
                <div
                  key={`longevity-${i}`}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-50/10 p-4 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    💚 {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-800 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Astro Theme Small Callout */}
      <div className="text-center text-[10px] text-slate-500 py-4 border-t border-slate-200">
        <p>✵ {isKn ? "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರ ನಿಯಮಗಳು" : "Baggona Panchanga Vedic Astrological Standards"} ✵</p>
      </div>
    </div>
  );
}
