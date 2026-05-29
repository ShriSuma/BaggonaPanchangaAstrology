import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { chartYogasWithPolarity, type YogaId } from "../core/KundliInsightsEngine";
import { getDailyPrediction } from "../core/PredictionEngine";
import { generateDashaTimeline, type DashaEntry } from "../core/DashaBhuktiEngine";
import { exportSvgAsPdf, exportSvgAsPng, exportElementAsPdf, exportElementAsPng } from "../core/ExportUtils";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";

import { analytics } from "../core/analytics";
import { saveKundli } from "../db/indexedDb";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import KundliChart from "../components/kundli/KundliChart";
import TraditionalSouthPatrika from "../components/kundli/TraditionalSouthPatrika";
import { DashaBhuktiExplorer, LifetimeDashaBar } from "../components/kundli/DashaLifetimeChart";
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
  const setKundliSession = useKundliViewerStore((s) => s.setSession);
  const clearKundliSession = useKundliViewerStore((s) => s.clearSession);
  const kundliSession = useKundliViewerStore((s) => s.session);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const traditionalExportRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<KundliInput>({
    name: "",
    birthDate: "",
    birthTime: "",
    latitude: defaultLat,
    longitude: defaultLng,
    gothra: "",
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
    if (!kundliSession) return;
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
  }, [kundliSession]);

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
    setKundliSession({
      result: output,
      input: payload,
      birthDateYmd: birthDate,
      birthTimeHm: birthTime,
      homePlaceName,
      placeLabel: homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore,
      dasha: dashaTimeline,
      dailyPrediction: predText
    });
    const id = await saveKundli(payload, output);
    setSavedId(id);
    setNarrative("");
    setNarrativeError("");
    await analytics.track("kundli_generated");
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
      form.date,
      form.time,
      form.latitude,
      form.longitude,
      form.ayanamsa
    );
  }, [form.date, form.time, form.latitude, form.longitude, form.ayanamsa]);

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

  return (
    <Card>
      <h2 className="text-2xl font-bold text-indigo-950">{t("kundli.formTitle")}</h2>
      <p className="mt-1 text-sm text-slate-600">{t("kundli.subtitle")}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          placeholder={t("kundli.name")}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          aria-label={t("kundli.gothra")}
          className="jk-touch-input min-h-[3rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-indigo-950 shadow-sm"
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
        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900/70">{t("kundli.birthDate")}</p>
          <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
        </div>
        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-900/70">{t("kundli.birthTime")}</p>
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
      {/* Buttons removed as per user request */}
      {/* Standalone KundliChart removed to avoid duplication with Jataka details */}
      
      {result && birthDatePicker && birthTimeHm.trim() ? (
        <div className="mt-8 space-y-6">
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="jk-btn rounded-xl bg-amber-500 px-8 py-4 text-base font-extrabold tracking-wide text-indigo-950 shadow-lg hover:bg-amber-400 hover:scale-[1.02] transition-all"
              onClick={async () => {
                const el = traditionalExportRef.current;
                if (el) {
                  await exportElementAsPdf(el, `baggona-janana-kundali-${form.name || "chart"}`);
                }
              }}
            >
              Baggoona Panchanga Janan Kundali Download
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
          
          <div className="rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm overflow-hidden p-4">
             <h3 className="text-lg font-bold text-indigo-950 mb-3 text-center">{t("kundli.dashaTitle", "Dasha Bhukti Timeline")}</h3>
             <LifetimeDashaBar kundli={result} maxAge={120} />
             <div className="mt-4">
               <DashaBhuktiExplorer kundli={result} maxAge={120} />
             </div>
          </div>

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
            isDayBirth={true}
            panchanga={traditionalData}
            gothra={gotraDisplay}
          /></div>
        </div>
      ) : null}

    </Card>
  );
}
