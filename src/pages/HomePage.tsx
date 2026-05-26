import { useEffect, useMemo, useRef, useState } from "react";
import SunCalc from "suncalc";
import { useTranslation } from "react-i18next";
import { calculatePanchang } from "../core/PanchangEngine";
import { calculateRahuKaal } from "../core/RahuKaalEngine";
import {
  calendarYmdForPanchangPin,
  civilTimeZoneForPanchangHeader,
  panchangClockTimeZone,
  panchangSolarAnchorDate,
  weekdayInTimeZone
} from "../core/placeTime";
import { applySunTimesToPanchang, fetchSunriseSunsetUtc } from "../core/sunriseSunsetApi";
import { resolvePanchangCoords } from "../core/resolvePanchangCoords";
import { analytics } from "../core/analytics";
import { getPanchangCache, savePanchangCache } from "../db/indexedDb";
import type { PanchangOutput, RahuKaalOutput } from "../core/AstroTypes";
import { useAppStore } from "../stores/appStore";
import MapLocationPicker from "../components/MapLocationPicker";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { displayPanchangValue } from "../i18n/panchangLabels";
import { resolvePlaceFromPincode } from "../services/locationApi";

// 1. Starfield Nebula Background component
const Starfield = () => (
  <div className="stars-container">
    <div className="stars-layer-1" />
    <div className="stars-layer-2" />
    <div className="stars-layer-3" />
  </div>
);

// 2. Interactive Astrolabe / Zodiac Dial component
const ZodiacDial = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startAngle = useRef(0);

  // Auto-rotate slowly in background
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      if (typeof window === "undefined" || !window.document) return;
      setRotation((r) => (r + 0.1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    startAngle.current = angle - (rotation * Math.PI) / 180;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const newRot = ((angle - startAngle.current) * 180) / Math.PI;
    setRotation(newRot);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const signs = [
    { name: "Mesha", symbol: "♈" },
    { name: "Vrishabha", symbol: "♉" },
    { name: "Mithuna", symbol: "♊" },
    { name: "Karka", symbol: "♋" },
    { name: "Simha", symbol: "♌" },
    { name: "Kanya", symbol: "♍" },
    { name: "Tula", symbol: "♎" },
    { name: "Vrischika", symbol: "♏" },
    { name: "Dhanu", symbol: "♐" },
    { name: "Makara", symbol: "♑" },
    { name: "Kumbha", symbol: "♒" },
    { name: "Meena", symbol: "♓" }
  ];

  return (
    <div className="relative mx-auto flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
      {/* Outer soft glowing rings */}
      <div className="absolute inset-0 rounded-full bg-amber-500/5 blur-xl animate-pulse" />
      <div className="absolute h-[90%] w-[90%] rounded-full border border-dashed border-amber-500/10 animate-spin-slow" />
      
      {/* Interactive Dial */}
      <svg
        className="h-full w-full cursor-grab active:cursor-grabbing select-none"
        viewBox="0 0 200 200"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Main plate background */}
        <circle cx="100" cy="100" r="92" fill="#0d0a21" stroke="#d97706" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="74" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="54" fill="none" stroke="#d97706" strokeWidth="0.75" />

        {/* Rotating sectors */}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "100px 100px" }}>
          {signs.map((s, idx) => {
            const angle = (idx * 30 * Math.PI) / 180;
            const textX = 100 + 82 * Math.cos(angle);
            const textY = 100 + 82 * Math.sin(angle);
            
            const lineX1 = 100 + 74 * Math.cos(angle);
            const lineY1 = 100 + 74 * Math.sin(angle);
            const lineX2 = 100 + 92 * Math.cos(angle);
            const lineY2 = 100 + 92 * Math.sin(angle);

            return (
              <g key={s.name}>
                <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="rgba(217,119,6,0.3)" strokeWidth="0.75" />
                <text
                  x={textX}
                  y={textY}
                  fill="#fbbf24"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${idx * 30 + 90}, ${textX}, ${textY})`}
                >
                  {s.symbol}
                </text>
              </g>
            );
          })}
          
          {/* Inner Nakshatra markers */}
          {Array.from({ length: 27 }).map((_, idx) => {
            const angle = (idx * (360 / 27) * Math.PI) / 180;
            const x1 = 100 + 54 * Math.cos(angle);
            const y1 = 100 + 54 * Math.sin(angle);
            const x2 = 100 + 74 * Math.cos(angle);
            const y2 = 100 + 74 * Math.sin(angle);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(217,119,6,0.18)"
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        {/* Golden sun core */}
        <circle cx="100" cy="100" r="14" fill="url(#sunGlow)" />
        <circle cx="100" cy="100" r="9" fill="#f59e0b" className="animate-pulse" />
        
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="65%" stopColor="#d97706" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// 3. Sun Path Semicircle Arc component
const CelestialArc = ({
  sunrise,
  sunset,
  timezone
}: {
  sunrise: Date | null;
  sunset: Date | null;
  timezone: string;
}) => {
  const progress = useMemo(() => {
    if (!sunrise || !sunset) return 0.5;
    const now = new Date();
    const start = sunrise.getTime();
    const end = sunset.getTime();
    const current = now.getTime();
    
    if (current < start || current > end) return -1; // night
    return (current - start) / (end - start);
  }, [sunrise, sunset]);

  const isDay = progress !== -1;

  const R = 72;
  const cx = 100;
  const cy = 80;
  const arcPath = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

  const pointerPos = useMemo(() => {
    let f = 0.5;
    if (isDay) {
      f = progress;
    } else {
      const now = new Date();
      if (sunrise && sunset) {
        const start = sunset.getTime();
        const end = sunrise.getTime() + (now.getTime() < sunrise.getTime() ? 0 : 24 * 60 * 60 * 1000);
        const current = now.getTime() + (now.getTime() < sunset.getTime() ? 24 * 60 * 60 * 1000 : 0);
        f = (current - start) / (end - start);
      }
    }
    const angle = Math.PI - f * Math.PI;
    return {
      x: cx + R * Math.cos(angle),
      y: cy - R * Math.sin(angle)
    };
  }, [progress, isDay, sunrise, sunset]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-indigo-950/40 p-4 text-center text-white shadow-inner backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />
      <p className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-amber-400">
        {isDay ? "☀️ Suryapatha - Sun Path Arc" : "🌙 Chandrapatha - Night Transit"}
      </p>

      <svg className="mx-auto mt-2 h-24 w-full max-w-[280px]" viewBox="0 0 200 90">
        <line x1="10" y1="80" x2="190" y2="80" stroke="rgba(245,158,11,0.25)" strokeWidth="1" strokeDasharray="3 3" />
        <path d={arcPath} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        
        {/* Glow indicator at Sun/Moon position */}
        <g transform={`translate(${pointerPos.x}, ${pointerPos.y})`}>
          {isDay ? (
            <>
              <circle r="7" fill="#fbbf24" className="animate-ping opacity-30" />
              <circle r="5" fill="#fbbf24" />
              <circle r="3.5" fill="#fffbeb" />
            </>
          ) : (
            <>
              <circle r="6" fill="#e2e8f0" className="animate-pulse" />
              <circle r="4.5" fill="#e2e8f0" />
              <circle cx="1.5" cy="-1.5" r="4.5" fill="#0d0a21" />
            </>
          )}
        </g>
        
        {/* Sunrise Label */}
        <text x="28" y="88" fill="rgba(245,158,11,0.6)" fontSize="6.5" textAnchor="middle">
          {sunrise ? sunrise.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }) : "06:00"}
        </text>
        <circle cx="28" cy="80" r="1.5" fill="#d97706" />

        {/* Sunset Label */}
        <text x="172" y="88" fill="rgba(245,158,11,0.6)" fontSize="6.5" textAnchor="middle">
          {sunset ? sunset.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }) : "18:30"}
        </text>
        <circle cx="172" cy="80" r="1.5" fill="#d97706" />
      </svg>
      
      <p className="relative z-10 mt-1 text-[10px] font-medium text-slate-300">
        {isDay 
          ? `Day progress: ${Math.floor(progress * 100)}% completed` 
          : "Night transit: Moon is navigating the lunar sky"}
      </p>
    </div>
  );
};

export default function HomePage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabel = useAppStore((s) => s.placeLabel);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);
  const locationConfirmed = useAppStore((s) => s.locationConfirmed);
  const setPage = useAppStore((s) => s.setPage);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panchang, setPanchang] = useState<PanchangOutput | null>(null);
  const [rahu, setRahu] = useState<RahuKaalOutput | null>(null);
  const [sunrise, setSunrise] = useState<Date | null>(null);
  const [sunset, setSunset] = useState<Date | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(!locationConfirmed);

  const pincodeStore = useAppStore((s) => s.pincode);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);

  const [panchangDayAnchor, setPanchangDayAnchor] = useState<Date | null>(null);
  const [displayLat, setDisplayLat] = useState(defaultLat);
  const [displayLng, setDisplayLng] = useState(defaultLng);

  // Home page pincode input states
  const [pinInput, setPinInput] = useState(pincodeStore || "");
  const [pinError, setPinError] = useState("");
  const [resolvingPin, setResolvingPin] = useState(false);

  const validIndianPin = (pc: string) => /^[1-9]\d{5}$/.test((pc ?? "").trim());

  const pinCivilTz = useMemo(
    () => civilTimeZoneForPanchangHeader(defaultLat, defaultLng, pincodeStore),
    [defaultLat, defaultLng, pincodeStore]
  );

  const localeTag = useMemo(() => {
    const base = i18n.resolvedLanguage ?? i18n.language ?? "en";
    if (base === "en") return "en-IN";
    if (base === "kn") return "kn-IN";
    if (base === "hi") return "hi-IN";
    if (base === "te") return "te-IN";
    if (base === "ta") return "ta-IN";
    return base;
  }, [i18n.language, i18n.resolvedLanguage]);

  const formatTimeAtPlace = (d: Date, lat: number, lng: number) => {
    const tz = panchangClockTimeZone(lat, lng, pincodeStore);
    return d.toLocaleTimeString(localeTag, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz
    });
  };

  const formatHeaderDateAtPin = (d: Date) =>
    d.toLocaleDateString(localeTag, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: pinCivilTz
    });

  const weekdayIdx = panchangDayAnchor ? weekdayInTimeZone(panchangDayAnchor, pinCivilTz) : new Date().getDay();

  const loadData = async (latIn: number, lngIn: number) => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lng } = await resolvePanchangCoords(latIn, lngIn, pincodeStore, placeLabel);
      setDisplayLat(lat);
      setDisplayLng(lng);
      const ymd = calendarYmdForPanchangPin(new Date(), lat, lng, pincodeStore);
      const anchor = panchangSolarAnchorDate(new Date(), lat, lng, pincodeStore);
      const cacheKey = `${ymd}_${lat.toFixed(2)},${lng.toFixed(2)},v6-${ayanamsaModel}`;
      const cached = await getPanchangCache(ymd, cacheKey);
      let p =
        cached ??
        calculatePanchang(anchor, lat, lng, {
          locale: localeTag,
          pincode: pincodeStore,
          ayanamsaModel
        });

      const apiTimes = await fetchSunriseSunsetUtc(lat, lng, ymd);
      const scTimes = SunCalc.getTimes(anchor, lat, lng);
      const times = apiTimes ?? { sunrise: scTimes.sunrise, sunset: scTimes.sunset };
      p = applySunTimesToPanchang(p, times, localeTag, lat, lng, pincodeStore);
      await savePanchangCache(ymd, cacheKey, p);

      const r = calculateRahuKaal(new Date(), times.sunrise, times.sunset, {
        locale: localeTag,
        clockTimeZone: panchangClockTimeZone(lat, lng, pincodeStore)
      });
      setPanchangDayAnchor(anchor);
      setPanchang(p);
      setRahu(r);
      setSunrise(times.sunrise);
      setSunset(times.sunset);
      await analytics.track("panchang_viewed");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDisplayLat(defaultLat);
    setDisplayLng(defaultLng);
    setPinInput(pincodeStore);
  }, [defaultLat, defaultLng, pincodeStore]);

  useEffect(() => {
    if (!locationConfirmed || !validIndianPin(pincodeStore)) {
      setLoading(false);
      setShowLocationPanel(true);
      return;
    }
    setShowLocationPanel(false);
    void loadData(defaultLat, defaultLng);
  }, [defaultLat, defaultLng, locationConfirmed, localeTag, pincodeStore, placeLabel, ayanamsaModel]);

  const useDeviceLocation = () => {
    setResolvingPin(true);
    setPinError("");
    void new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          void setDefaultLocation(lat, lng, t("home.deviceLocationLabel"), "");
          void loadData(lat, lng);
          setShowLocationPanel(false);
          setResolvingPin(false);
          resolve();
        },
        (err) => {
          setPinError("GPS access failed: " + err.message);
          setResolvingPin(false);
          resolve();
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!validIndianPin(trimmed)) {
      setPinError(t("kundli.pincodeRequired"));
      return;
    }
    setResolvingPin(true);
    setPinError("");
    try {
      const res = await resolvePlaceFromPincode(trimmed);
      if (res) {
        await setDefaultLocation(
          res.lat,
          res.lng,
          `${res.villageName} (${res.pincode})`,
          res.pincode
        );
        setShowLocationPanel(false);
      } else {
        setPinError("Pincode not found. Try another PIN.");
      }
    } catch (err) {
      setPinError((err as Error).message);
    } finally {
      setResolvingPin(false);
    }
  };

  const beforeSunrise = Boolean(sunrise && new Date() < sunrise);

  return (
    <div className="cosmic-bg min-h-[80vh] w-full p-4 sm:p-6 select-none relative rounded-3xl">
      <Starfield />

      {/* Main card panel with gaming HUD styling */}
      <div className="relative z-10 w-full space-y-4">
        {/* Title HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-amber-400 sm:text-3xl">
              {t("home.todayPanchang")}
            </h1>
            <p className="text-xs text-slate-300">
              {panchangDayAnchor ? formatHeaderDateAtPin(panchangDayAnchor) : formatHeaderDateAtPin(new Date())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-amber-500/20">
              📍 {placeLabel ? placeLabel.split("·")[0].trim() : t("common.na")} {pincodeStore ? `(${pincodeStore})` : ""}
            </span>
            <button
              type="button"
              className="jk-btn text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30"
              onClick={() => setShowLocationPanel(!showLocationPanel)}
            >
              {showLocationPanel ? "Close" : "Change"}
            </button>
          </div>
        </div>

        {/* Location selector HUD */}
        {showLocationPanel && (
          <div className="cosmic-card p-4 animate-fade-in space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Set Your Cosmic Coordinates
            </h2>
            <form onSubmit={(e) => void handlePinSubmit(e)} className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 rounded-xl border border-amber-500/30 bg-indigo-950/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={resolvingPin}
                className="jk-btn rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-950 hover:bg-amber-400 disabled:opacity-50"
              >
                Resolve PIN
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="jk-btn flex-1 rounded-xl border border-amber-500/30 bg-indigo-950/50 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-indigo-950/80"
                onClick={() => useDeviceLocation()}
              >
                Use Device GPS
              </button>
              <button
                type="button"
                className="jk-btn flex-1 rounded-xl border border-amber-500/30 bg-indigo-950/50 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-indigo-950/80"
                onClick={() => setMapOpen(true)}
              >
                Map Picker
              </button>
            </div>
            {resolvingPin && <GrahaSpinner size="sm" message="Mapping cosmic grid..." />}
            {pinError && <p className="text-xs font-semibold text-red-400">{pinError}</p>}
          </div>
        )}

        <MapLocationPicker
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          defaultLat={defaultLat}
          defaultLng={defaultLng}
          onConfirm={(lat, lng, label) => {
            void setDefaultLocation(lat, lng, label, "");
            void loadData(lat, lng);
            setShowLocationPanel(false);
          }}
        />

        {/* Celestial Zodiac Wheel dial */}
        <ZodiacDial />

        {/* Sunrise/Sunset animated arc */}
        {sunrise && sunset && <CelestialArc sunrise={sunrise} sunset={sunset} timezone={pinCivilTz} />}

        {/* Main Panchang display Grid */}
        {loading && <GrahaSpinner />}
        {error && <p className="mt-4 text-sm font-semibold text-red-400 text-center">{error}</p>}

        {panchang && !loading && (
          <div data-testid="panchang-card" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Tithi card */}
            <div className="cosmic-card flex items-center justify-between p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  {t("panchang.tithi")}
                </p>
                <p className="text-sm font-extrabold mt-0.5 text-white">
                  {displayPanchangValue("tithi", panchang.tithi, i18n.language, t)}
                </p>
              </div>
              <span className="text-2xl opacity-80">🌙</span>
            </div>

            {/* Nakshatra card */}
            <div className="cosmic-card flex items-center justify-between p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  {t("panchang.nakshatra")}
                </p>
                <p className="text-sm font-extrabold mt-0.5 text-white">
                  {displayPanchangValue("nakshatra", panchang.nakshatra, i18n.language, t)}
                </p>
              </div>
              <span className="text-2xl opacity-80">⭐</span>
            </div>

            {/* Yoga card */}
            <div className="cosmic-card flex items-center justify-between p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  {t("panchang.yoga")}
                </p>
                <p className="text-sm font-extrabold mt-0.5 text-white">
                  {displayPanchangValue("yoga", panchang.yoga, i18n.language, t)}
                </p>
              </div>
              <span className="text-2xl opacity-80">☍</span>
            </div>

            {/* Karana card */}
            <div className="cosmic-card flex items-center justify-between p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  {t("panchang.karana")}
                </p>
                <p className="text-sm font-extrabold mt-0.5 text-white">
                  {displayPanchangValue("karana", panchang.karana, i18n.language, t)}
                </p>
              </div>
              <span className="text-2xl opacity-80">☸</span>
            </div>

            {/* Paksha card */}
            <div className="cosmic-card flex items-center justify-between p-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                  {t("panchang.paksha")}
                </p>
                <p className="text-sm font-extrabold mt-0.5 text-white">
                  {displayPanchangValue("paksha", panchang.paksha, i18n.language, t)}
                </p>
              </div>
              <span className="text-2xl opacity-80">🌓</span>
            </div>

            {/* Rahu Kaal HUD */}
            {rahu && (
              <div className="cosmic-card p-3.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                      {t("home.rahuKaal")}
                    </p>
                    <p className="text-sm font-extrabold mt-0.5 text-white">
                      {rahu.startTime} – {rahu.endTime}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      rahu.isActive ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {rahu.isActive ? t("rahuKaal.active") : t("rahuKaal.inactive")}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 italic">
                  {t("rahuKaal.warning")}
                </p>
              </div>
            )}

            {/* Daily astrological tip */}
            <div className="cosmic-card p-3.5 sm:col-span-2 border-l-[3px] border-l-amber-500">
              <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest">
                {t("home.weekdayCardTitle")}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                {t(`weekday.${weekdayIdx}`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
