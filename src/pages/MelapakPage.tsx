import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import { calculateKundli } from "../core/KundliEngine";
import { computeMelapak } from "../core/MelapakEngine";
import { formatPickerDateLocalYmd, formatPickerTimeLocalHm } from "../core/birthTime";
import { useAppStore } from "../stores/appStore";
import DatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import MapLocationPicker from "../components/MapLocationPicker";
import Card from "../components/ui/Card";
import KundliChart from "../components/kundli/KundliChart";

const moonFrom = (k: KundliOutput) => k.planets.find((p) => p.name === PlanetName.Moon)!;

export default function MelapakPage(): JSX.Element {
  const { t } = useTranslation();
  const chartStyle = useAppStore((s) => s.chartStyle);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);

  const [boyDate, setBoyDate] = useState<Date | null>(null);
  const [boyTime, setBoyTime] = useState<Date | null>(null);
  const [girlDate, setGirlDate] = useState<Date | null>(null);
  const [girlTime, setGirlTime] = useState<Date | null>(null);
  const [pincode, setPincode] = useState(pincodeStore || "");
  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [locationCore, setLocationCore] = useState(placeLabelStore);
  const [homePlaceName, setHomePlaceName] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [boyK, setBoyK] = useState<KundliOutput | null>(null);
  const [girlK, setGirlK] = useState<KundliOutput | null>(null);
  const [melapak, setMelapak] = useState<ReturnType<typeof computeMelapak> | null>(null);

  const placeDisplay = useMemo(
    () => (homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore),
    [homePlaceName, locationCore]
  );

  const pushPlace = (la: number, lo: number, core: string, pin: string) => {
    const label = homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core;
    void setDefaultLocation(la, lo, label, /^\d{6}$/.test(pin) ? pin : "");
  };

  const onMatch = () => {
    if (!boyDate || !boyTime || !girlDate || !girlTime) {
      setError(t("melapak.required"));
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setError(t("kundli.pincodeRequired"));
      return;
    }
    setError("");
    const boyBirth = formatPickerDateLocalYmd(boyDate);
    const boyHm = formatPickerTimeLocalHm(boyTime);
    const girlBirth = formatPickerDateLocalYmd(girlDate);
    const girlHm = formatPickerTimeLocalHm(girlTime);
    const base: Pick<KundliInput, "latitude" | "longitude" | "pincode"> = {
      latitude: lat,
      longitude: lng,
      pincode: pincode.trim()
    };
    const boyIn: KundliInput = { name: t("melapak.boy"), birthDate: boyBirth, birthTime: boyHm, ...base };
    const girlIn: KundliInput = { name: t("melapak.girl"), birthDate: girlBirth, birthTime: girlHm, ...base };
    const bk = calculateKundli(boyIn, { ayanamsaModel, nodeType });
    const gk = calculateKundli(girlIn, { ayanamsaModel, nodeType });
    setBoyK(bk);
    setGirlK(gk);
    const bm = moonFrom(bk);
    const gm = moonFrom(gk);
    setMelapak(computeMelapak(gm.rashi.index, bm.rashi.index, gm.nakshatra.index, bm.nakshatra.index));
  };

  const scoreColor =
    melapak == null
      ? "text-slate-600"
      : melapak.band >= 3
        ? "text-emerald-700"
        : melapak.band === 2
          ? "text-lime-700"
          : melapak.band === 1
            ? "text-amber-800"
            : "text-rose-800";

  const showCelebrate = melapak && !melapak.rajjuDosha && !melapak.vedhaDosha && melapak.total >= 24;

  return (
    <Card>
      <h2 className="text-2xl font-bold text-indigo-950">{t("melapak.title")}</h2>
      <p className="mt-1 text-sm text-slate-600">{t("melapak.subtitle")}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{t("melapak.disclaimer")}</p>

      {/* Romantic Boy & Girl Input Cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 relative">
        {/* Heart icon floating between cards on desktop */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
          <div className="bg-white/80 p-3 rounded-full shadow-md backdrop-blur-sm border border-rose-100 animate-pulse">
            <span className="text-2xl text-rose-400">💞</span>
          </div>
        </div>

        {/* Boy Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <span className="text-sm">🤵</span>
            </div>
            <h3 className="text-lg font-bold text-indigo-950">{t("melapak.boy")}</h3>
          </div>
          <div className="mt-2 grid gap-3 relative z-10">
            <div className="bg-white/60 p-2 rounded-xl backdrop-blur-sm border border-indigo-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/60 mb-1 ml-1">{t("kundli.birthDate")}</p>
              <DatePicker selected={boyDate} onChange={setBoyDate} placeholderText={t("kundli.birthDate")} />
            </div>
            <div className="bg-white/60 p-2 rounded-xl backdrop-blur-sm border border-indigo-50">
               <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/60 mb-1 ml-1">{t("kundli.birthTime")}</p>
              <TimePicker selected={boyTime} onChange={setBoyTime} />
            </div>
          </div>
        </div>

        {/* Girl Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-rose-50/80 to-pink-50/50 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <span className="text-sm">👰</span>
            </div>
            <h3 className="text-lg font-bold text-rose-950">{t("melapak.girl")}</h3>
          </div>
          <div className="mt-2 grid gap-3 relative z-10">
            <div className="bg-white/60 p-2 rounded-xl backdrop-blur-sm border border-rose-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/60 mb-1 ml-1">{t("kundli.birthDate")}</p>
              <DatePicker selected={girlDate} onChange={setGirlDate} placeholderText={t("kundli.birthDate")} />
            </div>
            <div className="bg-white/60 p-2 rounded-xl backdrop-blur-sm border border-rose-50">
               <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/60 mb-1 ml-1">{t("kundli.birthTime")}</p>
              <TimePicker selected={girlTime} onChange={setGirlTime} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <input
          required
          aria-required
          placeholder={t("kundli.pincodePlaceholder")}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm md:col-span-2"
          inputMode="numeric"
          maxLength={6}
          autoComplete="postal-code"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <input
          placeholder={t("kundli.homePlaceName")}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm md:col-span-2"
          value={homePlaceName}
          onChange={(e) => setHomePlaceName(e.target.value)}
        />
        <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 md:col-span-2">
          {placeDisplay}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="jk-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" onClick={() => setMapOpen(true)}>
          {t("kundli.openMap")}
        </button>
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

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="jk-btn relative overflow-hidden rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-10 py-3.5 text-base font-extrabold tracking-wide text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-rose-500/40 active:scale-95"
          onClick={onMatch}
        >
          <span className="relative z-10 flex items-center gap-2">
            ✨ {t("melapak.match")} ✨
          </span>
        </button>
      </div>

      {melapak && boyK && girlK ? (
        <div className="mt-8 space-y-6">
          <div className="relative rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 p-6 text-center shadow-sm">
            {showCelebrate ? (
              <div className="jk-melapak-celebrate mb-3 flex justify-center gap-2 text-3xl" aria-hidden>
                <span>🎆</span>
                <span>✨</span>
                <span>🎇</span>
              </div>
            ) : (
              <div className="mb-3 text-3xl opacity-80" aria-hidden>
                {melapak.total < 18 || melapak.rajjuDosha || melapak.vedhaDosha ? "☁️" : "◇"}
              </div>
            )}
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("melapak.scoreLabel")}</p>
            <p className={`mt-1 text-4xl font-bold tabular-nums ${scoreColor}`}>
              {melapak.total}/{melapak.maxTotal}
            </p>
            <p className="mt-2 text-sm text-slate-600">{t(`melapak.verdict.${melapak.band}` as "melapak.verdict.0")}</p>
            <p className="mt-2 text-xs text-slate-500">{t("melapak.cutoffHint")}</p>
            {melapak.rajjuDosha ? (
              <p className="mt-3 rounded-lg bg-rose-100/80 px-3 py-2 text-xs font-medium text-rose-950">{t("melapak.rajjuWarn")}</p>
            ) : null}
            {melapak.vedhaDosha ? (
              <p className="mt-2 rounded-lg bg-amber-100/80 px-3 py-2 text-xs font-medium text-amber-950">{t("melapak.vedhaWarn")}</p>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[280px] text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-indigo-950">
                <tr>
                  <th className="px-2 py-2">{t("melapak.kuta")}</th>
                  <th className="px-2 py-2">{t("melapak.points")}</th>
                </tr>
              </thead>
              <tbody>
                {melapak.kutas.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-2 py-1.5">{t(`melapak.kutas.${row.id}` as "melapak.kutas.varna")}</td>
                    <td className="px-2 py-1.5 font-medium tabular-nums">
                      {row.score}/{row.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-indigo-950">{t("melapak.boyChart")}</h4>
              <div className="mt-2 flex justify-center">
                <KundliChart kundli={boyK} chartStyle={chartStyle} personName={t("melapak.boy")} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-indigo-950">{t("melapak.girlChart")}</h4>
              <div className="mt-2 flex justify-center">
                <KundliChart kundli={girlK} chartStyle={chartStyle} personName={t("melapak.girl")} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
