import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { chartYogasWithPolarity, type YogaId } from "../core/KundliInsightsEngine";
import { getDailyPrediction } from "../core/PredictionEngine";
import { generateDashaTimeline, type DashaEntry } from "../core/DashaBhuktiEngine";
import { exportSvgAsPdf, exportSvgAsPng, exportElementAsPdf, exportElementAsPng, exportPanchangaWithDashaPdf, exportDashaPdf } from "../core/ExportUtils";
import { DashaPdfTemplate } from "../components/kundli/DashaPdfTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { translateText } from "../utils/translator";
import { patrikaMetaForNakshatraIndex as import_patrikaMetaForNakshatraIndex } from "../core/nakshatraPatrikaMeta";
import { analytics } from "../core/analytics";
import { LifeGuidancePage } from "./LifeGuidancePage";
import { saveKundli, recordDailyHit } from "../db/indexedDb";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import KundliChart from "../components/kundli/KundliChart";
import TraditionalSouthPatrika from "../components/kundli/TraditionalSouthPatrika";
import { DashaBhuktiExplorer, LifetimeDashaBar } from "../components/kundli/DashaLifetimeChart";
import { DashaVisualization } from "../components/kundli/DashaVisualization";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import MapLocationPicker from "../components/MapLocationPicker";
import { GokarnaKundaliTemplate } from "../components/template/GokarnaKundaliTemplate";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { buildNarrativeSummary, fetchKundliNarrative, NarrativeApiError } from "../services/kundliNarrativeApi";
import { localizeNarrativeText } from "../services/localizeContent";
import { formatPickerDateLocalYmd } from "../core/birthTime";
import { GOTRA_OPTIONS, gotraI18nKey } from "../data/gotras";
import { formatNavamsaPada, formatRashiAmsha, patrikaNavamshaFromDegree } from "../core/localeNumbers";
import { isRoughIndiaRegion } from "../core/placeTime";
import { resolvePlaceFromPincode } from "../services/locationApi";

const parseYmdToDate = (ymd: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
};

export default function KundliPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const chartStyle = useAppStore((s) => s.chartStyle);
  const setChartStyle = useAppStore((s) => s.setChartStyle);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);
  const narrativeConsent = useAppStore((s) => s.narrativeConsent);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);
  const setPage = useAppStore((s) => s.setPage);
  const kundliSession = useKundliViewerStore((s) => s.session);
  const draftInput = useKundliViewerStore((s) => s.draftInput);
  const setSession = useKundliViewerStore((s) => s.setSession);
  const clearKundliSession = useKundliViewerStore((s) => s.clearSession);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const traditionalExportRef = useRef<HTMLDivElement>(null);
  const dashaExportRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"jataka" | "dasha" | "lifeguidance">("jataka");
  const [dashaViewType, setDashaViewType] = useState<"grid" | "visualization">("grid");

  const [pdfLanguage, setPdfLanguage] = useState<string>(i18n.language);
  const [isTranslating, setIsTranslating] = useState(false);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [isGeneratingDashaPdf, setIsGeneratingDashaPdf] = useState(false);
  const [form, setForm] = useState<KundliInput>({
    name: "",
    birthDate: "",
    birthTime: "",
    latitude: defaultLat,
    longitude: defaultLng,
    gothra: "",
    gender: "Male",
    pincode: pincodeStore || undefined
  });
  const [result, setResult] = useState<KundliOutput | null>(null);
  const [dailyPrediction, setDailyPrediction] = useState<string>("");
  const [dasha, setDasha] = useState<DashaEntry[]>([]);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(null);
  const [birthTimeHm, setBirthTimeHm] = useState("");
  const [locationCore, setLocationCore] = useState<string>(placeLabelStore);
  const [homePlaceName, setHomePlaceName] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");

  const placeDisplay = useMemo(
    () => (homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore),
    [homePlaceName, locationCore]
  );

  const pushPlaceToStore = (lat: number, lng: number, core: string, pin?: string) => {
    const label = homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core;
    void setDefaultLocation(lat, lng, label, pin && /^\d{6}$/.test(pin) ? pin : "");
  };

  const [pinResolving, setPinResolving] = useState(false);
  const pinResolveGen = useRef(0);
  const [locationEpoch, setLocationEpoch] = useState(0);
  const lastResolvedPinRef = useRef<string>(kundliSession?.input?.pincode || "");

  /** When PIN changes, resolve village + lat/lng immediately (not only via dropdown). */
  useEffect(() => {
    const pin = form.pincode?.trim() ?? "";
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setPinResolving(false);
      return;
    }
    if (pin === lastResolvedPinRef.current) {
      return;
    }
    const gen = ++pinResolveGen.current;
    setLocationEpoch((e) => e + 1);
    setPinResolving(true);
    setLocationCore(`${pin} · ${t("location.loading")}`);
    void resolvePlaceFromPincode(pin)
      .then((place) => {
        if (gen !== pinResolveGen.current) return;
        if (!place) {
          setLocationCore(`${pin} · ${t("location.pinNotFound")}`);
          return;
        }
        const core = `${place.villageName} (${place.pincode})`;
        setForm((f) => ({
          ...f,
          latitude: place.lat,
          longitude: place.lng,
          pincode: place.pincode
        }));
        setLocationCore(core);
        setResult(null);
        lastResolvedPinRef.current = place.pincode;
        void setDefaultLocation(
          place.lat,
          place.lng,
          homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core,
          place.pincode
        );
      })
      .catch(() => {
        if (gen !== pinResolveGen.current) return;
        setLocationCore(`${pin} · ${t("location.pinNotFound")}`);
      })
      .finally(() => {
        if (gen === pinResolveGen.current) setPinResolving(false);
      });
  }, [form.pincode, setDefaultLocation, t]);

  const birthTimeZoneHint = useMemo(() => {
    const pin = form.pincode?.trim() ?? "";
    if (/^[1-9]\d{5}$/.test(pin) || isRoughIndiaRegion(form.latitude, form.longitude)) {
      return t("kundli.birthTimeIst");
    }
    return t("kundli.birthTimeLocal");
  }, [form.pincode, form.latitude, form.longitude, t]);

  /** Restore chart from in-memory session when returning to this tab. */
  useEffect(() => {
    if (kundliSession) {
      lastResolvedPinRef.current = kundliSession.input.pincode || "";
      setForm(kundliSession.input);
      setResult(kundliSession.result);
      const bd = parseYmdToDate(kundliSession.birthDateYmd);
      if (bd) setBirthDatePicker(bd);
      setBirthTimeHm(kundliSession.birthTimeHm);
      setHomePlaceName(kundliSession.homePlaceName);
      setLocationCore(kundliSession.placeLabel);
      setDasha(kundliSession.dasha);
      setDailyPrediction(kundliSession.dailyPrediction);
    } else if (draftInput) {
      if (draftInput.input) {
        lastResolvedPinRef.current = draftInput.input.pincode || "";
        setForm(draftInput.input);
      }
      if (draftInput.birthDateYmd) {
        const bd = parseYmdToDate(draftInput.birthDateYmd);
        if (bd) setBirthDatePicker(bd);
      }
      if (draftInput.birthTimeHm) setBirthTimeHm(draftInput.birthTimeHm);
      if (draftInput.homePlaceName) setHomePlaceName(draftInput.homePlaceName);
      if (draftInput.placeLabel) setLocationCore(draftInput.placeLabel);
    } else {
      setResult(null);
      setForm({
        name: "",
        birthDate: "",
        birthTime: "",
        latitude: defaultLat,
        longitude: defaultLng,
        gothra: "",
        gender: "Male",
        pincode: pincodeStore || undefined
      });
      setBirthDatePicker(null);
      setBirthTimeHm("");
      setHomePlaceName("");
      setLocationCore(placeLabelStore);
      setDasha([]);
      setDailyPrediction("");
    }
  }, [kundliSession, draftInput, defaultLat, defaultLng, pincodeStore, placeLabelStore]);

  const [dictatingField, setDictatingField] = useState<"name" | "gothra" | "date" | "time" | null>(null);
  const startDictation = (field: "name" | "gothra" | "date" | "time") => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    // Default to Kannada if selected, else English (India) to catch Indian names/accents
    recognition.lang = i18n.language.startsWith('kn') ? 'kn-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setDictatingField(field);
    recognition.onend = () => setDictatingField(null);
    recognition.onerror = () => setDictatingField(null);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      console.log(`Dictated for ${field}:`, text);
      
      if (field === "name") {
        let foundName = text.trim();
        const nameMatch = text.match(/(?:name(?:\s+is)?|hesaru|ಹೆಸರು)\s+([a-z\u0C80-\u0CFF]+)/i);
        if (nameMatch) foundName = nameMatch[1];
        setForm(f => ({ ...f, name: foundName.charAt(0).toUpperCase() + foundName.slice(1) }));
        return;
      }
      
      if (field === "gothra") {
        let foundGothra = text.trim();
        const gothraMatch = text.match(/(?:gothra|ಗೋತ್ರ)\s+([a-z\u0C80-\u0CFF]+)|([a-z\u0C80-\u0CFF]+)\s+(?:gothra|ಗೋತ್ರ)/i);
        if (gothraMatch) foundGothra = gothraMatch[1] || gothraMatch[2];
        setForm(f => ({ ...f, gothra: foundGothra.charAt(0).toUpperCase() + foundGothra.slice(1) }));
        return;
      }

      if (field === "date") {
        let foundDate: Date | null = null;
        const knMonths = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
        const enMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "aug", "sep", "sept", "oct", "nov", "dec"];
        
        let realMonth = -1;
        for (let i = 0; i < knMonths.length; i++) {
          if (text.includes(knMonths[i])) { realMonth = i; break; }
        }
        if (realMonth === -1) {
          for (let i = 0; i < enMonths.length; i++) {
            if (text.includes(enMonths[i])) {
              realMonth = new Date(Date.parse(enMonths[i] +" 1, 2012")).getMonth();
              break;
            }
          }
        }

        if (realMonth !== -1) {
          const yearMatch = text.match(/\b(19|20)\d{2}\b/);
          const dayMatch = text.match(/\b(1st|2nd|3rd|\d{1,2}(th)?)\b/);
          
          if (yearMatch && dayMatch) {
            const dayNum = parseInt(dayMatch[0].replace(/\D/g, ''), 10);
            const yearNum = parseInt(yearMatch[0], 10);
            if (dayNum >= 1 && dayNum <= 31) {
              foundDate = new Date(yearNum, realMonth, dayNum, 12, 0, 0, 0);
            }
          }
        }
        if (foundDate) setBirthDatePicker(foundDate);
        return;
      }

      if (field === "time") {
        let foundTime = "";
        const pat1 = /(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)\s*(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?/i;
        const pat2 = /\b(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?\s*(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)/i;
        const pat3 = /\b(\d{1,2}):(\d{2})\b/i;

        let match = text.match(pat1);
        let hr = 0, mn = 0, marker = "";
        if (match) {
            marker = match[1].toLowerCase();
            hr = parseInt(match[2], 10);
            mn = match[3] ? parseInt(match[3], 10) : 0;
        } else {
            match = text.match(pat2);
            if (match) {
                hr = parseInt(match[1], 10);
                mn = match[2] ? parseInt(match[2], 10) : 0;
                marker = match[3].toLowerCase();
            } else {
                match = text.match(pat3);
                if (match) {
                    hr = parseInt(match[1], 10);
                    mn = parseInt(match[2], 10);
                }
            }
        }

        if (match) {
          const isPM = marker === "pm" || marker === "ಮಧ್ಯಾಹ್ನ" || marker === "ಸಂಜೆ" || marker === "ರಾತ್ರಿ";
          const isAM = marker === "am" || marker === "ಬೆಳಿಗ್ಗೆ";
          
          if (isPM && hr < 12) hr += 12;
          if (isAM && hr === 12) hr = 0;
          
          if (hr >= 0 && hr <= 23 && mn >= 0 && mn <= 59) {
            foundTime = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
          }
        }
        if (foundTime) setBirthTimeHm(foundTime);
      }
    };

    recognition.start();
  };

  /** Sync default place from settings when no active chart session (skip while PIN is resolving). */
  useEffect(() => {
    if (kundliSession || pinResolving) return;
    const pin = form.pincode?.trim() ?? "";
    if (/^[1-9]\d{5}$/.test(pin)) return;
    setForm((f) => ({
      ...f,
      latitude: defaultLat,
      longitude: defaultLng
    }));
    setLocationCore(placeLabelStore);
  }, [kundliSession, pinResolving, form.pincode, defaultLat, defaultLng, placeLabelStore]);

  const onGenerate = async () => {
    if (!form.name || !birthDatePicker || !birthTimeHm.trim()) {
      setError(t("kundli.requiredFields"));
      return;
    }
    if (!/^\d{1,2}:\d{2}$/.test(birthTimeHm.trim())) {
      setError(t("kundli.requiredFields"));
      return;
    }
    if (!form.pincode || !/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      setError(t("kundli.pincodeRequired"));
      return;
    }

    const birthDate = formatPickerDateLocalYmd(birthDatePicker);
    const birthTime = birthTimeHm.trim();
    const payload: KundliInput = {
      ...form,
      birthDate,
      birthTime,
      pincode: form.pincode && /^\d{6}$/.test(form.pincode) ? form.pincode : undefined
    };

    setError("");
    const output = await calculateKundliWithPlaceSun(payload, { ayanamsaModel, nodeType });
    setResult(output);
    const birthCtx = {
      birthDate,
      birthTime,
      latitude: form.latitude,
      longitude: form.longitude,
      ayanamsaModel
    };
    const dp = getDailyPrediction(output, new Date(), t, form.name, birthCtx);
    const dashaTimeline = generateDashaTimeline(output);
    const predText = [dp.summary, dp.dashaLine, dp.timingLine].filter(Boolean).join("\n\n");
    setDailyPrediction(predText);
    setDasha(dashaTimeline);
    setSession({
      result: output,
      input: payload,
      birthDateYmd: birthDate,
      birthTimeHm: birthTime,
      homePlaceName,
      placeLabel: homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore,
      dasha: dashaTimeline,
      dailyPrediction: predText
    });
    try {
      localStorage.setItem("baggona_kundli_session", JSON.stringify({
        name: form.name,
        birthDate: birthDate,
        birthTime: birthTime,
        nakshatraIndex: output.planets.find(p => p.name === "Moon")?.nakshatra.index,
        rashiIndex: output.planets.find(p => p.name === "Moon")?.rashi.index,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude
      }));
    } catch {
      // Ignore
    }
    const id = await saveKundli(payload, output);
    setSavedId(id);
    setNarrative("");
    setNarrativeError("");
    await analytics.track("kundli_generated");
    await recordDailyHit();
  };

  const summaryText = useMemo(() => {
    if (!result) return "";
    return t("kundli.shareSummary", {
      name: form.name,
      lagna: t(`rashis.${result.lagnaRashi.sanskrit}` as "rashis.Mesha"),
      moon: t(`rashis.${result.moonSign.sanskrit}` as "rashis.Mesha")
    });
  }, [form.name, result, t]);

  const chartYogas = useMemo(
    () => (result ? chartYogasWithPolarity(result) : []),
    [result]
  );

  const traditionalData = useMemo(() => {
    if (!birthDatePicker || !birthTimeHm.trim()) return null;
    return calculateTraditionalBaggona(
      birthDatePicker ? format(birthDatePicker, 'yyyy-MM-dd') : "",
      birthTimeHm,
      form.latitude,
      form.longitude,
      ayanamsaModel,
      form.pincode
    );
  }, [birthDatePicker, birthTimeHm, form.latitude, form.longitude, ayanamsaModel, form.pincode]);

  const isDayBirthComputed = useMemo(() => {
    if (!birthDatePicker) return true;
    const h = birthDatePicker.getHours();
    const m = birthDatePicker.getMinutes();
    const birthMins = h * 60 + m;

    let sunriseMins = 6 * 60;
    let sunsetMins = 18 * 60;

    if (traditionalData?.sunrise && traditionalData.sunrise.includes(":")) {
      const parts = traditionalData.sunrise.split(":");
      const sh = parseInt(parts[0] || "6", 10);
      const sm = parseInt(parts[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunriseMins = sh * 60 + sm;
    }

    if (traditionalData?.sunset && traditionalData.sunset.includes(":")) {
      const parts = traditionalData.sunset.split(":");
      const sh = parseInt(parts[0] || "18", 10);
      const sm = parseInt(parts[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunsetMins = sh * 60 + sm;
    }

    return birthMins >= sunriseMins && birthMins < sunsetMins;
  }, [birthDatePicker, traditionalData?.sunrise, traditionalData?.sunset]);

  const gotraDisplay = useMemo(() => {
    const v = (form.gothra ?? "").trim();
    if (!v) return "";
    const key = gotraI18nKey(v);
    const label = t(key as "gotras.Vasishtha");
    return label === key ? v : label;
  }, [form.gothra, t]);

  const narrativeUrlConfigured = Boolean(import.meta.env.VITE_NARRATIVE_API_URL);
  const narrativeReady = narrativeConsent && narrativeUrlConfigured;

  const onDetailsAboutMe = async () => {
    if (!result || !birthDatePicker || !birthTimeHm.trim()) return;
    if (!narrativeReady) return;
    setNarrativeLoading(true);
    setNarrativeError("");
    try {
      const birthDate = formatPickerDateLocalYmd(birthDatePicker);
      const birthTime = birthTimeHm.trim();
      const body = buildNarrativeSummary({ name: form.name, birthDate, birthTime }, result, i18n.language);
      const text = await fetchKundliNarrative(body);
      const localized = await localizeNarrativeText(text, i18n.language);
      setNarrative(localized);
    } catch (e) {
      let msg = e instanceof NarrativeApiError ? e.message : (e as Error).message;
      if (e instanceof NarrativeApiError && /missing/i.test(msg)) {
        msg = t("kundli.detailsMissingUrl");
      }
      setNarrativeError(msg || t("kundli.detailsError"));
    } finally {
      setNarrativeLoading(false);
    }
  };

  const fillTestKundali = () => {
    const testDate = new Date(1993, 4, 31, 9, 25, 0);
    setForm(f => ({
      ...f,
      name: "Pramod Kodgi",
      birthDate: "1993-05-31",
      birthTime: "09:25",
      gothra: "Vasishtha",
      gender: "Male"
    }));
    setBirthDatePicker(testDate);
    setBirthTimeHm("09:25");
  };

  return (
    <Card>
      {!(result && birthDatePicker && birthTimeHm.trim()) ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="text-2xl font-bold text-indigo-950">{t("kundli.formTitle")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("kundli.subtitle")}</p>
            </div>
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={fillTestKundali}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-sm transition"
              >
                <span>⚡</span>
                <span>Fill Test Details (Pramod Kodgi)</span>
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900/70">{t("kundli.name")}</p>
                <button
                  type="button"
                  title="Dictate Name"
                  onClick={() => startDictation("name")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "name" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <input
                placeholder={t("kundli.name")}
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900/70">{t("kundli.gothra")}</p>
                <button
                  type="button"
                  title="Dictate Gotra"
                  onClick={() => startDictation("gothra")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "gothra" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <select
                aria-label={t("kundli.gothra")}
                className="w-full jk-touch-input min-h-[3rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-indigo-950 shadow-sm"
                value={form.gothra ?? ""}
                onChange={(e) => setForm({ ...form, gothra: e.target.value })}
              >
                <option value="">{t("kundli.gotraNone")}</option>
                {GOTRA_OPTIONS.map((id) => (
                  <option key={id} value={id}>
                    {t(gotraI18nKey(id) as "gotras.Vasishtha")}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-4 items-center">
              <label className="text-sm font-semibold text-indigo-950 mr-2">{t("kundli.gender", "Gender")}:</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Male" checked={form.gender === "Male"} onChange={() => setForm({ ...form, gender: "Male" })} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-sm text-slate-700">{t("gender.male", "Male")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Female" checked={form.gender === "Female"} onChange={() => setForm({ ...form, gender: "Female" })} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-sm text-slate-700">{t("gender.female", "Female")}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">{t("kundli.birthDate")}</p>
                <button
                  type="button"
                  title="Dictate Date"
                  onClick={() => startDictation("date")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "date" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">{t("kundli.birthTime")}</p>
                <button
                  type="button"
                  title="Dictate Time"
                  onClick={() => startDictation("time")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "time" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <BirthTimePicker value={birthTimeHm} onChange={setBirthTimeHm} zoneHint={birthTimeZoneHint} />
            </div>
            <input
              required
              aria-required
              placeholder={t("kundli.pincodePlaceholder")}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              value={form.pincode ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setForm({ ...form, pincode: v.length ? v : undefined });
              }}
            />
            <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800">
              {placeDisplay}
            </div>
            <input
              placeholder={t("kundli.homePlaceName")}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm md:col-span-2"
              value={homePlaceName}
              onChange={(e) => setHomePlaceName(e.target.value)}
              onBlur={() => pushPlaceToStore(form.latitude, form.longitude, locationCore, form.pincode)}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{t("kundli.pincodeHint")}</p>
          {pinResolving ? <GrahaSpinner size="sm" message={t("location.loading")} /> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="jk-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-indigo-950"
              onClick={() => setMapOpen(true)}
            >
              {t("kundli.openMap")}
            </button>
          </div>
          <div className="mt-3">
            <LocationSelector
              key={`loc-${form.pincode ?? ""}-${locationEpoch}`}
              filterPincode={form.pincode && /^\d{6}$/.test(form.pincode) ? form.pincode : undefined}
              onChange={(location: SelectedLocation) => {
                setForm({ ...form, latitude: location.lat, longitude: location.lng, pincode: location.pincode });
                const core = `${location.villageName} (${location.pincode})`;
                setLocationCore(core);
                setResult(null);
                pushPlaceToStore(location.lat, location.lng, core, location.pincode);
              }}
            />
          </div>
          <MapLocationPicker
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            defaultLat={form.latitude}
            defaultLng={form.longitude}
            onConfirm={(lat, lng, label) => {
              setForm({ ...form, latitude: lat, longitude: lng });
              setLocationCore(label);
              pushPlaceToStore(lat, lng, label, form.pincode && /^\d{6}$/.test(form.pincode) ? form.pincode : undefined);
            }}
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="jk-btn rounded-xl bg-indigo-950 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-md hover:bg-indigo-900 transition-colors"
              onClick={() => void onGenerate()}
            >
              {t("kundli.generate")}
            </button>
          </div>
          {savedId && (
            <p className="mt-2 text-xs text-emerald-800">
              {t("kundli.savedPrefix")} ({savedId})
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 shadow-sm gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-indigo-950 capitalize">{form.name}</h3>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
              {formatPickerDateLocalYmd(birthDatePicker)} • {birthTimeHm}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{placeDisplay}</p>
          </div>
          <button
            type="button"
            className="jk-btn rounded-xl bg-rose-500 hover:bg-rose-600 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-md transition-all scale-100 active:scale-95"
            onClick={() => {
              clearKundliSession();
              setResult(null);
              setForm({
                name: "",
                birthDate: "",
                birthTime: "",
                latitude: defaultLat,
                longitude: defaultLng,
                gothra: "",
                gender: "Male",
                pincode: pincodeStore || undefined
              });
              setBirthDatePicker(null);
              setBirthTimeHm("");
              setHomePlaceName("");
              setLocationCore(placeLabelStore);
              setDasha([]);
              setDailyPrediction("");
            }}
          >
            {i18n.language.startsWith("kn") ? "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ (Edit)" : "Edit / Reset"}
          </button>
        </div>
      )}
      {/* Buttons removed as per user request */}
      {/* Standalone KundliChart removed to avoid duplication with Jataka details */}
      
      {result && birthDatePicker && birthTimeHm.trim() ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
            <button
              type="button"
              className={`jk-btn rounded-xl px-8 py-3 text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "jataka"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveView("jataka")}
            >
              Jataka Details
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "dasha"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveView("dasha")}
            >
              Complete Dasha Bhukti
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "lifeguidance"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-50"
              }`}
              onClick={() => setActiveView("lifeguidance")}
            >
              🔮 {i18n.language.startsWith("kn") ? "ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ" : "Life Guidance"}
            </button>
          </div>

          {activeView === "lifeguidance" && (
            <div className="animate-fade-in">
              <LifeGuidancePage
                initialInput={{
                  personName: form.name,
                  dob: form.birthDate,
                  tob: form.birthTime,
                  gender: form.gender
                }}
              />
            </div>
          )}

          {activeView === "jataka" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col items-center justify-center mb-6">
                
                {/* PDF Language Selection */}
                <div className="flex flex-col items-center mb-4">
                  <label className="text-sm font-semibold text-indigo-900 mb-2">{t("selectPdfLanguage", "Select PDF Language")}:</label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { code: "kn", label: "Kannada" },
                      { code: "ta", label: "Tamil" },
                      { code: "te", label: "Telugu" },
                      { code: "hi", label: "Hindi" },
                      { code: "en", label: "English" }
                    ].map(lang => (
                      <label key={lang.code} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pdfLanguage"
                          value={lang.code}
                          checked={pdfLanguage === lang.code}
                          onChange={(e) => setPdfLanguage(e.target.value)}
                          className="w-4 h-4 text-indigo-600 border-indigo-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isTranslating || isGeneratingDashaPdf}
                  className={`jk-btn rounded-xl bg-amber-500 px-8 py-4 text-base font-extrabold tracking-wide text-indigo-950 shadow-lg hover:bg-amber-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${(isTranslating || isGeneratingDashaPdf) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={async () => {
                    const el = traditionalExportRef.current;
                    const dashaEl = dashaExportRef.current;
                    
                    if (el) {
                      try {
                        setIsTranslating(true);
                        
                        const newVals: Record<string, string> = {};
                        if (pdfLanguage !== "kn" && traditionalData) {
                           const yoniMeta = import_patrikaMetaForNakshatraIndex(result.planets.find((p: any) => p.name === "Moon")?.nakshatra.index || 0);
                           
                           const keys = [
                             "samvatsara", "masa", "paksha", "tithi", "weekday", "sunNakshatra", "moonNakshatra", "yoga", "karana", "sankrantiSign",
                             "yoni", "gana", "nadi", "label_yoni", "label_gana", "label_nadi", "label_footer"
                           ];
                           const texts = [
                             traditionalData.samvatsaraKn, traditionalData.masaKn, traditionalData.pakshaKn, traditionalData.tithiKn, traditionalData.weekdayKn, 
                             traditionalData.sunNakshatraKn, traditionalData.moonNakshatraKn, traditionalData.yogaKn, traditionalData.karanaKn, traditionalData.sankrantiSignKn,
                             yoniMeta.yoniKn, yoniMeta.ganaKn, yoniMeta.nadiKn, "ಯೋನಿ", "ಗಣ", "ನಾಡಿ", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು"
                           ];
                           
                           const translated = await Promise.all(texts.map(txt => translateText(txt, pdfLanguage === "en" ? "en-US" : pdfLanguage + "-IN")));
                           
                           keys.forEach((k, i) => newVals[k] = translated[i]);
                        }
                        setDynamicValues(newVals);
                        
                        // Small wait to ensure template is rendered with new state
                        await new Promise(r => setTimeout(r, 500));
                        
                        if (dashaEl) {
                          setIsGeneratingDashaPdf(true);
                          await exportPanchangaWithDashaPdf(el, dashaEl, `baggona-janana-kundali-${form.name || "chart"}`);
                          setIsGeneratingDashaPdf(false);
                        } else {
                          await exportElementAsPdf(el, `baggona-janana-kundali-${form.name || "chart"}`);
                        }
                      } catch (e) {
                        console.error("PDF generation failed:", e);
                        setIsGeneratingDashaPdf(false);
                      } finally {
                        setIsTranslating(false);
                      }
                    }
                  }}
                >
                  {isTranslating ? <div className="w-5 h-5 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin"></div> : null}
                  {isTranslating ? "Translating..." : "Baggoona Panchanga Janan Kundali Download"}
                </button>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
                 <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 text-center">
                     <h3 className="text-lg font-bold text-indigo-950">{t("kundli.jatakaDetails", "Jataka & Panchanga Details")}</h3>
                 </div>
                 <div className="p-4 overflow-x-auto flex justify-center">
                    <TraditionalSouthPatrika
                      kundli={result}
                      personName={form.name}
                      gothra={gotraDisplay}
                      birthDate={formatPickerDateLocalYmd(birthDatePicker)}
                      birthTime={birthTimeHm.trim()}
                      latitude={form.latitude}
                      longitude={form.longitude}
                      placeLabel={placeDisplay}
                      pincode={form.pincode}
                      ayanamsaModel={ayanamsaModel}
                    />
                 </div>
              </div>
            </div>
          )}
          
          {activeView === "dasha" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  disabled={isGeneratingDashaPdf}
                  className={`jk-btn flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-extrabold tracking-wide text-white shadow-lg hover:bg-emerald-400 hover:scale-[1.02] transition-all ${isGeneratingDashaPdf ? 'opacity-75 cursor-wait' : ''}`}
                  onClick={async () => {
                    setIsGeneratingDashaPdf(true);
                    try {
                      // Small wait to ensure template is rendered
                      await new Promise(r => setTimeout(r, 100));
                      
                      const el = dashaExportRef.current;
                      if (el) {
                        await exportDashaPdf(el, `Dasha_Bhukti_Timeline_${form.name || "chart"}`);
                      }
                    } catch (e) {
                      console.error("PDF generation failed:", e);
                    } finally {
                      setIsGeneratingDashaPdf(false);
                    }
                  }}
                >
                  {isGeneratingDashaPdf ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  )}
                  {isGeneratingDashaPdf ? "Generating PDF..." : "Download Complete Dasha Bhukti PDF"}
                </button>
              </div>

              {/* Dasha View Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                  <button
                    onClick={() => setDashaViewType("grid")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${dashaViewType === 'grid' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("kundli.dashaGrid", "Grid View")}
                  </button>
                  <button
                    onClick={() => setDashaViewType("visualization")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${dashaViewType === 'visualization' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("kundli.dashaVisual", "Visualization")}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm overflow-hidden p-4">
                 <h3 className="text-lg font-bold text-indigo-950 mb-3 text-center">{t("kundli.dashaTitle", "Dasha Bhukti Timeline (120 Years)")}</h3>
                 <div className="p-4 bg-white rounded-xl">
                   <div className="text-center mb-6 border-b border-slate-100 pb-4">
                     <h2 className="text-2xl font-extrabold text-indigo-900">{form.name}</h2>
                     <p className="text-sm font-medium text-slate-600 mt-1">
                       Complete Dasha Bhukti Timeline (Birth to 120 Years)
                     </p>
                   </div>
                   {kundliSession && dashaViewType === "grid" && <DashaBhuktiExplorer session={kundliSession} maxAge={120} />}
                   {kundliSession && dashaViewType === "visualization" && <DashaVisualization session={kundliSession} maxAge={120} />}
                 </div>
              </div>
              
            </div>
          )}

        </div>
      ) : null}
      
      {result && birthDatePicker && birthTimeHm.trim() ? (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "794px", minHeight: "1123px" }}>
          <div ref={traditionalExportRef} style={{ width: "100%", height: "100%", backgroundColor: "#fbf8f1" }}>
            <GokarnaKundaliTemplate
            kundli={result}
            personName={form.name}
            parentsName={""}
            birthDateObj={birthDatePicker}
            birthTimeStr={birthTimeHm}
            isDayBirth={isDayBirthComputed}
            panchanga={traditionalData}
            gothra={gotraDisplay}
            pdfLanguage={pdfLanguage}
            dynamicValues={dynamicValues}
          /></div>
        </div>
      ) : null}
      {/* Hidden Dasha PDF Template Container */}
      {result && birthDatePicker && birthTimeHm.trim() && kundliSession ? (
        <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
          <DashaPdfTemplate ref={dashaExportRef} session={kundliSession} maxAge={120} pdfLanguage={pdfLanguage} />
        </div>
      ) : null}

    </Card>
  );
}
