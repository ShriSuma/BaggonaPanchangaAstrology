import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import { calculateVivahaMelameli, type VivahaMelameliResult } from "../features/melameli/vivahaMelameliEngine";
import type { MelameliLanguage } from "../features/melameli/vivahaMelameliLocale";
import { getMelameliText } from "../features/melameli/vivahaMelameliLocale";
import { formatPickerDateLocalYmd, formatPickerTimeLocalHm } from "../core/birthTime";
import { useAppStore } from "../stores/appStore";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import MapLocationPicker from "../components/MapLocationPicker";
import Card from "../components/ui/Card";
import KundliChart from "../components/kundli/KundliChart";
import VivahaMelameliPdfTemplate from "../components/melameli/VivahaMelameliPdfTemplate";

export default function MelapakPage(): JSX.Element {
  const { i18n } = useTranslation();
  const currentLang = (["kn", "en", "hi", "te", "ta"].includes(i18n.language)
    ? i18n.language
    : "kn") as MelameliLanguage;

  const [selectedLang, setSelectedLang] = useState<MelameliLanguage>(currentLang);

  useEffect(() => {
    if (["kn", "en", "hi", "te", "ta"].includes(i18n.language)) {
      setSelectedLang(i18n.language as MelameliLanguage);
    }
  }, [i18n.language]);

  const chartStyle = useAppStore((s) => s.chartStyle);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);

  // Form States
  const [boyName, setBoyName] = useState("");
  const [boyDate, setBoyDate] = useState<Date | null>(null);
  const [boyTime, setBoyTime] = useState<Date | null>(null);

  const [girlName, setGirlName] = useState("");
  const [girlDate, setGirlDate] = useState<Date | null>(null);
  const [girlTime, setGirlTime] = useState<Date | null>(null);

  const [pincode, setPincode] = useState(pincodeStore || "581326");
  const [lat, setLat] = useState(defaultLat || 14.5479);
  const [lng, setLng] = useState(defaultLng || 74.3188);
  const [locationCore, setLocationCore] = useState(placeLabelStore || "Gokarna, Karnataka");
  const [homePlaceName, setHomePlaceName] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");

  // Calculation & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"ashtakoota" | "dashakoota" | "kujaAndPapa" | "dashaAndSeva">("ashtakoota");
  const [result, setResult] = useState<VivahaMelameliResult | null>(null);

  const placeDisplay = useMemo(
    () => (homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore),
    [homePlaceName, locationCore]
  );

  const pushPlace = (la: number, lo: number, core: string, pin: string) => {
    const label = homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core;
    void setDefaultLocation(la, lo, label, /^\d{6}$/.test(pin) ? pin : "");
  };

  const handleMatch = () => {
    if (!boyDate || !boyTime || !girlDate || !girlTime) {
      setError(getMelameliText("requiredError", selectedLang));
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setError(getMelameliText("pincodeError", selectedLang));
      return;
    }
    setError("");
    setIsLoading(true);
    setLoadingStep(1);

    const timer1 = setTimeout(() => setLoadingStep(2), 500);
    const timer2 = setTimeout(() => setLoadingStep(3), 1000);
    const timer3 = setTimeout(() => setLoadingStep(4), 1500);

    const timerFinal = setTimeout(() => {
      const boyBirth = formatPickerDateLocalYmd(boyDate);
      const boyHm = formatPickerTimeLocalHm(boyTime);
      const girlBirth = formatPickerDateLocalYmd(girlDate);
      const girlHm = formatPickerTimeLocalHm(girlTime);

      const base: Pick<KundliInput, "latitude" | "longitude" | "pincode"> = {
        latitude: lat,
        longitude: lng,
        pincode: pincode.trim()
      };

      const bInput: KundliInput = {
        name: boyName.trim() || (selectedLang === "kn" ? "ವರ (Groom)" : "Groom"),
        birthDate: boyBirth,
        birthTime: boyHm,
        ...base
      };

      const gInput: KundliInput = {
        name: girlName.trim() || (selectedLang === "kn" ? "ವಧು (Bride)" : "Bride"),
        birthDate: girlBirth,
        birthTime: girlHm,
        ...base
      };

      const calculated = calculateVivahaMelameli(bInput, gInput, { ayanamsaModel, nodeType });
      setResult(calculated);
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFinal);
    };
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsPdfGenerating(true);
    try {
      const sanitizedBoy = (boyName.trim() || "Groom").replace(/\s+/g, "_");
      const sanitizedGirl = (girlName.trim() || "Bride").replace(/\s+/g, "_");
      await generatePDFFromElement(
        "vivaha-melameli-pdf-root",
        `Vivaha_Melameli_${sanitizedBoy}_and_${sanitizedGirl}.pdf`
      );
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const scoreColor =
    result == null
      ? "text-slate-600"
      : result.band === "excellent"
      ? "text-emerald-700"
      : result.band === "good"
      ? "text-lime-700"
      : result.band === "average"
      ? "text-amber-800"
      : "text-rose-800";

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "auspicious":
      case "cancelled":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "moderate":
        return "bg-amber-100 text-amber-900 border-amber-300";
      default:
        return "bg-rose-100 text-rose-900 border-rose-300";
    }
  };

  return (
    <Card className="relative overflow-hidden bg-[#fffdfa] border border-amber-200/80 shadow-md">
      {/* Top Gold Spiritual Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪔</span>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-950 tracking-tight">
              {getMelameliText("pageTitle", selectedLang)}
            </h2>
            <p className="text-xs text-amber-900/80 mt-0.5">
              {getMelameliText("pageSubtitle", selectedLang)}
            </p>
          </div>
        </div>

        {/* 5-Language Switcher */}
        <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
          {(["kn", "en", "hi", "te", "ta"] as MelameliLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedLang === lang
                  ? "bg-amber-600 text-white shadow-xs scale-105"
                  : "text-amber-950 hover:bg-amber-100"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 italic">
        {getMelameliText("disclaimer", selectedLang)}
      </p>

      {/* Romantic Boy & Girl Input Cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 relative">
        {/* Animated Heart Icon in Center on Desktop */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
          <div className="bg-white/95 p-3.5 rounded-full shadow-lg backdrop-blur-md border border-rose-200 animate-pulse scale-110">
            <span className="text-2xl text-rose-500">💞</span>
          </div>
        </div>

        {/* Boy Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-lg shadow-inner">
                <span>🤵</span>
              </div>
              <h3 className="text-base font-bold text-indigo-950">
                {getMelameliText("boyHeader", selectedLang)}
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              GROOM
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                {selectedLang === "kn" ? "ವರನ ಪೂರ್ಣ ಹೆಸರು" : "Groom's Full Name"}
              </label>
              <input
                type="text"
                value={boyName}
                onChange={(e) => setBoyName(e.target.value)}
                placeholder={getMelameliText("namePlaceholderBoy", selectedLang)}
                className="w-full min-h-10 rounded-xl border border-indigo-200 bg-white/90 px-3 py-2 text-xs text-indigo-950 shadow-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/80 mb-1">
                  {getMelameliText("birthDateLabel", selectedLang)}
                </p>
                <DatePicker selected={boyDate} onChange={setBoyDate} placeholderText="YYYY-MM-DD" />
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/80 mb-1">
                  {getMelameliText("birthTimeLabel", selectedLang)}
                </p>
                <TimePicker selected={boyTime} onChange={setBoyTime} />
              </div>
            </div>
          </div>
        </div>

        {/* Girl Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-pink-50/50 to-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-rose-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-lg shadow-inner">
                <span>👰</span>
              </div>
              <h3 className="text-base font-bold text-rose-950">
                {getMelameliText("girlHeader", selectedLang)}
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
              BRIDE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block mb-1">
                {selectedLang === "kn" ? "ವಧುವಿನ ಪೂರ್ಣ ಹೆಸರು" : "Bride's Full Name"}
              </label>
              <input
                type="text"
                value={girlName}
                onChange={(e) => setGirlName(e.target.value)}
                placeholder={getMelameliText("namePlaceholderGirl", selectedLang)}
                className="w-full min-h-10 rounded-xl border border-rose-200 bg-white/90 px-3 py-2 text-xs text-rose-950 shadow-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/80 p-2 rounded-xl border border-rose-100 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/80 mb-1">
                  {getMelameliText("birthDateLabel", selectedLang)}
                </p>
                <DatePicker selected={girlDate} onChange={setGirlDate} placeholderText="YYYY-MM-DD" />
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-rose-100 shadow-2xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/80 mb-1">
                  {getMelameliText("birthTimeLabel", selectedLang)}
                </p>
                <TimePicker selected={girlTime} onChange={setGirlTime} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Location & Pincode Selection */}
      <div className="mt-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
            <span>📍</span> {getMelameliText("birthPlaceLabel", selectedLang)}
          </span>
          <button
            type="button"
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
            onClick={() => setMapOpen(true)}
          >
            <span>🗺️</span> {selectedLang === "kn" ? "ನಕ್ಷೆ ತೆರೆಯಿರಿ (Map)" : "Open Map"}
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <input
            required
            aria-required
            placeholder="Pincode (e.g. 581326)"
            className="min-h-10 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs text-indigo-950 shadow-xs"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <div className="flex min-h-10 items-center rounded-xl border border-amber-200 bg-white/80 px-3 text-xs text-slate-800">
            {placeDisplay}
          </div>
        </div>

        <LocationSelector
          filterPincode={/^\d{6}$/.test(pincode.trim()) ? pincode.trim() : undefined}
          onChange={(location: SelectedLocation) => {
            setLat(location.lat);
            setLng(location.lng);
            const core = `${location.villageName} (${location.pincode})`;
            setLocationCore(core);
            setPincode(location.pincode);
            pushPlace(location.lat, location.lng, core, location.pincode);
          }}
        />
      </div>

      <MapLocationPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        defaultLat={lat}
        defaultLng={lng}
        onConfirm={(la, lo, label) => {
          setLat(la);
          setLng(lo);
          setLocationCore(label);
          pushPlace(la, lo, label, pincode.trim());
        }}
      />

      {error ? <p className="mt-3 text-xs font-bold text-rose-700 text-center">{error}</p> : null}

      {/* Calculate Button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={isLoading}
          className="relative overflow-hidden rounded-full bg-gradient-to-r from-amber-600 via-rose-500 to-amber-700 px-10 py-3 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50"
          onClick={handleMatch}
        >
          <span className="relative z-10 flex items-center gap-2">
            ✨ {getMelameliText("matchBtn", selectedLang)} ✨
          </span>
        </button>
      </div>

      {/* ------------------- CONSECRATED FULL-SCREEN LOADER MODAL ------------------- */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-[#fffdf7] via-white to-[#fbf7ee] p-6 shadow-2xl text-center">
            {/* Spinning Golden Chakra */}
            <div className="relative mx-auto h-20 w-20 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-600 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400 animate-spin" style={{ animationDirection: "reverse" }} />
              <span className="text-3xl">🪔</span>
            </div>

            <h3 className="text-lg font-extrabold text-amber-950 tracking-tight">
              {getMelameliText("loaderTitle", selectedLang)}
            </h3>
            <p className="mt-1 text-xs text-amber-900/80 italic font-serif">
              "{getMelameliText("loaderShloka", selectedLang)}"
            </p>

            {/* Step-by-Step Progress */}
            <div className="mt-6 space-y-2.5 text-left text-xs">
              <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${loadingStep >= 1 ? "bg-amber-100/70 text-amber-950 font-bold" : "text-slate-400"}`}>
                <span className="text-sm">{loadingStep > 1 ? "✅" : "⏳"}</span>
                <span>{getMelameliText("step1", selectedLang)}</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${loadingStep >= 2 ? "bg-amber-100/70 text-amber-950 font-bold" : "text-slate-400"}`}>
                <span className="text-sm">{loadingStep > 2 ? "✅" : loadingStep === 2 ? "⏳" : "○"}</span>
                <span>{getMelameliText("step2", selectedLang)}</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${loadingStep >= 3 ? "bg-amber-100/70 text-amber-950 font-bold" : "text-slate-400"}`}>
                <span className="text-sm">{loadingStep > 3 ? "✅" : loadingStep === 3 ? "⏳" : "○"}</span>
                <span>{getMelameliText("step3", selectedLang)}</span>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${loadingStep >= 4 ? "bg-amber-100/70 text-amber-950 font-bold" : "text-slate-400"}`}>
                <span className="text-sm">{loadingStep >= 4 ? "⏳" : "○"}</span>
                <span>{getMelameliText("step4", selectedLang)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- RESULTS DISPLAY ------------------- */}
      {result && (
        <div className="mt-10 space-y-6">
          {/* Grand Score Banner */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-[#fffdf8] via-[#fffbf2] to-amber-50/50 p-6 text-center shadow-md">
            <div className="mb-2 flex items-center justify-center gap-2 text-2xl">
              <span>🎆</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-900">
                {getMelameliText("scoreLabel", selectedLang)}
              </span>
              <span>🎇</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className={`text-5xl font-extrabold tabular-nums tracking-tight ${scoreColor}`}>
                {result.totalScore} / {result.maxScore}
              </span>
              <span className="text-sm font-extrabold bg-amber-600 text-white px-3 py-1 rounded-full shadow-sm">
                {result.percentage}%
              </span>
            </div>

            <p className="mt-2 text-base font-bold text-amber-950">
              {result.band === "excellent"
                ? getMelameliText("verdictExcellent", selectedLang)
                : result.band === "good"
                ? getMelameliText("verdictGood", selectedLang)
                : result.band === "average"
                ? getMelameliText("verdictAverage", selectedLang)
                : getMelameliText("verdictInauspicious", selectedLang)}
            </p>
            <p className="mt-1.5 text-xs text-slate-700 max-w-xl mx-auto italic">
              "{result.verdictText[selectedLang]}"
            </p>

            {/* Multi-Page PDF Download Button */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                disabled={isPdfGenerating}
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900 active:scale-95 transition-all"
              >
                <span>📜</span>
                <span>
                  {isPdfGenerating ? "Generating PDF..." : getMelameliText("pdfDownloadBtn", selectedLang)}
                </span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Kundli Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-3">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>🤵</span> {boyName || (selectedLang === "kn" ? "ವರ" : "Groom")} Kundli (Lagna: {result.boyKundli.lagnaRashi.sanskrit})
                </h4>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                  {result.boyKundli.planets.find((p) => p.name === PlanetName.Moon)?.rashi.sanskrit}
                </span>
              </div>
              <div className="flex justify-center">
                <KundliChart kundli={result.boyKundli} chartStyle={chartStyle} personName={boyName || "Groom"} />
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2 mb-3">
                <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span>👰</span> {girlName || (selectedLang === "kn" ? "ವಧು" : "Bride")} Kundli (Lagna: {result.girlKundli.lagnaRashi.sanskrit})
                </h4>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  {result.girlKundli.planets.find((p) => p.name === PlanetName.Moon)?.rashi.sanskrit}
                </span>
              </div>
              <div className="flex justify-center">
                <KundliChart kundli={result.girlKundli} chartStyle={chartStyle} personName={girlName || "Bride"} />
              </div>
            </div>
          </div>

          {/* 4 Interactive Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-amber-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("ashtakoota")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "ashtakoota"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-950 hover:bg-amber-100"
              }`}
            >
              🔱 {getMelameliText("tabAshtakoota", selectedLang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dashakoota")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "dashakoota"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-950 hover:bg-amber-100"
              }`}
            >
              🌟 {getMelameliText("tabDashakoota", selectedLang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kujaAndPapa")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "kujaAndPapa"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-950 hover:bg-amber-100"
              }`}
            >
              🛡️ {getMelameliText("tabKujaAndPapa", selectedLang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dashaAndSeva")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "dashaAndSeva"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-950 hover:bg-amber-100"
              }`}
            >
              🪔 {getMelameliText("tabDashaAndSeva", selectedLang)}
            </button>
          </div>

          {/* TAB 1: ASHTA KOOTA */}
          {activeTab === "ashtakoota" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.ashtaKuta.map((kuta) => (
                <div
                  key={kuta.id}
                  className="border border-amber-200 rounded-2xl p-4 bg-white/90 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-amber-950">{kuta.name[selectedLang]}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${getBadgeClass(kuta.status)}`}>
                      {kuta.score} / {kuta.maxScore} Pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{kuta.description[selectedLang]}</p>
                  {kuta.cancellationNote && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                      ✨ {kuta.cancellationNote[selectedLang]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: DASHAKOOTA */}
          {activeTab === "dashakoota" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(result.dashaKutaAdditions).map(([key, kuta]) => (
                <div
                  key={key}
                  className="border border-amber-200 rounded-2xl p-4 bg-white/90 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-amber-950">{kuta.name[selectedLang]}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${getBadgeClass(kuta.status)}`}>
                      {kuta.score === 1 ? "ಶುಭ (Auspicious)" : "ದೋಷ / ಗಮನಿಸಿ"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{kuta.description[selectedLang]}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: KUJA & PAPA */}
          {activeTab === "kujaAndPapa" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-indigo-200 rounded-2xl p-4 bg-indigo-50/50">
                  <h4 className="text-xs font-bold text-indigo-950 mb-2 flex items-center justify-between">
                    <span>
                      {selectedLang === "kn"
                        ? "🤵 ವರನ ಕುಜ (ಮಾಂಗ್ಲಿಕ್) ಸ್ಥಿತಿ"
                        : selectedLang === "hi"
                        ? "🤵 वर का मांगलिक विवरण"
                        : selectedLang === "te"
                        ? "🤵 వరుని కుజ వివరాలు"
                        : selectedLang === "ta"
                        ? "🤵 மணமகன் செவ்வாய் தோஷம்"
                        : "🤵 Groom Kuja Dosha Profile"}
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      {result.kujaDosha.boy.hasKujaDosha
                        ? result.kujaDosha.boy.isCancelled
                          ? selectedLang === "kn" ? "ಪರಿಹಾರವಾಗಿದೆ" : "Cancelled"
                          : selectedLang === "kn" ? "ದೋಷವಿದೆ" : "Present"
                        : selectedLang === "kn" ? "ದೋಷವಿಲ್ಲ" : "None"}
                    </span>
                  </h4>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p>
                      {selectedLang === "kn"
                        ? `ಲಗ್ನದಿಂದ: ${result.kujaDosha.boy.marsHouseFromLagna}ನೇ ಮನೆ | ಚಂದ್ರನಿಂದ: ${result.kujaDosha.boy.marsHouseFromMoon}ನೇ ಮನೆ`
                        : `From Lagna: House ${result.kujaDosha.boy.marsHouseFromLagna} | From Moon: House ${result.kujaDosha.boy.marsHouseFromMoon}`}
                    </p>
                    {result.kujaDosha.boy.cancellationReason && (
                      <p className="text-emerald-800 font-bold mt-1.5">✨ {result.kujaDosha.boy.cancellationReason[selectedLang]}</p>
                    )}
                  </div>
                </div>

                <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/50">
                  <h4 className="text-xs font-bold text-rose-950 mb-2 flex items-center justify-between">
                    <span>
                      {selectedLang === "kn"
                        ? "👰 ವಧುವಿನ ಕುಜ (ಮಾಂಗ್ಲಿಕ್) ಸ್ಥಿತಿ"
                        : selectedLang === "hi"
                        ? "👰 वधू का मांगलिक विवरण"
                        : selectedLang === "te"
                        ? "👰 వధువు కుజ వివరాలు"
                        : selectedLang === "ta"
                        ? "👰 மணமகள் செவ்வாய் தோஷம்"
                        : "👰 Bride Kuja Dosha Profile"}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      {result.kujaDosha.girl.hasKujaDosha
                        ? result.kujaDosha.girl.isCancelled
                          ? selectedLang === "kn" ? "ಪರಿಹಾರವಾಗಿದೆ" : "Cancelled"
                          : selectedLang === "kn" ? "ದೋಷವಿದೆ" : "Present"
                        : selectedLang === "kn" ? "ದೋಷವಿಲ್ಲ" : "None"}
                    </span>
                  </h4>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p>
                      {selectedLang === "kn"
                        ? `ಲಗ್ನದಿಂದ: ${result.kujaDosha.girl.marsHouseFromLagna}ನೇ ಮನೆ | ಚಂದ್ರನಿಂದ: ${result.kujaDosha.girl.marsHouseFromMoon}ನೇ ಮನೆ`
                        : `From Lagna: House ${result.kujaDosha.girl.marsHouseFromLagna} | From Moon: House ${result.kujaDosha.girl.marsHouseFromMoon}`}
                    </p>
                    {result.kujaDosha.girl.cancellationReason && (
                      <p className="text-emerald-800 font-bold mt-1.5">✨ {result.kujaDosha.girl.cancellationReason[selectedLang]}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-amber-200 rounded-2xl p-4 bg-white/90">
                  <span className="font-bold text-xs text-amber-950 block mb-1">
                    {selectedLang === "kn"
                      ? "⚖️ ಪಾಪ ಸಾಮ್ಯ"
                      : selectedLang === "hi"
                      ? "⚖️ पाप साम्य"
                      : selectedLang === "te"
                      ? "⚖️ పాప సామ్యం"
                      : selectedLang === "ta"
                      ? "⚖️ பாப சாம்யம்"
                      : "⚖️ Papa Samya (Malefic Balance)"}
                  </span>
                  <p className="text-xs text-slate-700">{result.papaSamya.verdict[selectedLang]}</p>
                </div>
                <div className="border border-amber-200 rounded-2xl p-4 bg-white/90">
                  <span className="font-bold text-xs text-amber-950 block mb-1">
                    {selectedLang === "kn"
                      ? "⏳ ದಶಾ ಸಂಧಿ ಪರಿಶೀಲನೆ"
                      : selectedLang === "hi"
                      ? "⏳ दशा संधि विश्लेषण"
                      : selectedLang === "te"
                      ? "⏳ దశా సంధి విశ్లేషణ"
                      : selectedLang === "ta"
                      ? "⏳ தசா சந்தி"
                      : "⏳ Dasha Sandhi Analysis"}
                  </span>
                  <p className="text-xs text-slate-700">{result.dashaSandhi.verdict[selectedLang]}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEVAS */}
          {activeTab === "dashaAndSeva" && (
            <div className="space-y-3">
              {result.gokarnaSevas.map((seva) => (
                <div
                  key={seva.sevaId}
                  className="border border-amber-300 rounded-2xl p-4 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>🔱</span> {seva.title[selectedLang]}
                    </h4>
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2.5 py-0.5 rounded-full">
                      {selectedLang === "kn" ? "ಕೋಡ್: " : "Code: "} {seva.bookingCode}
                    </span>
                  </div>
                  <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-3">
                    <div>
                      <span className="font-bold text-amber-900 block">
                        {selectedLang === "kn"
                          ? "ಏಕೆ ಅವಶ್ಯಕ:"
                          : selectedLang === "hi"
                          ? "उद्देश्य:"
                          : selectedLang === "te"
                          ? "ఎందుకు అవసరం:"
                          : selectedLang === "ta"
                          ? "ஏன் தேவை:"
                          : "Why Required:"}
                      </span>
                      <span>{seva.whyRequired[selectedLang]}</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">
                        {selectedLang === "kn"
                          ? "ಮಹಾತ್ಮೆ:"
                          : selectedLang === "hi"
                          ? "माहात्म्य:"
                          : selectedLang === "te"
                          ? "ప్రాముఖ్యత:"
                          : selectedLang === "ta"
                          ? "பெருமை:"
                          : "Significance:"}
                      </span>
                      <span>{seva.significance[selectedLang]}</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">
                        {selectedLang === "kn"
                          ? "ಫಲ ಪ್ರಾಪ್ತಿ:"
                          : selectedLang === "hi"
                          ? "फल प्राप्ति:"
                          : selectedLang === "te"
                          ? "ఫల ప్రాప్తి:"
                          : selectedLang === "ta"
                          ? "பயன்:"
                          : "Transformation:"}
                      </span>
                      <span>{seva.howTransforms[selectedLang]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------- HIDDEN PDF CONTAINER ------------------- */}
      {result && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <VivahaMelameliPdfTemplate
            melameliResult={result}
            selectedLang={selectedLang}
            boyName={boyName || (selectedLang === "kn" ? "ವರ" : "Groom")}
            girlName={girlName || (selectedLang === "kn" ? "ವಧು" : "Bride")}
            boyBirthDate={boyDate ? formatPickerDateLocalYmd(boyDate) : ""}
            boyBirthTime={boyTime ? formatPickerTimeLocalHm(boyTime) : ""}
            girlBirthDate={girlDate ? formatPickerDateLocalYmd(girlDate) : ""}
            girlBirthTime={girlTime ? formatPickerTimeLocalHm(girlTime) : ""}
            placeLabel={placeDisplay}
          />
        </div>
      )}
    </Card>
  );
}
