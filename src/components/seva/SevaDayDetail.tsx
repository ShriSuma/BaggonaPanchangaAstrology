import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  BAND_LABEL_L5,
  COLOUR_HEX,
  T,
  pick
} from "../../features/seva/sevaLocale";
import {
  getDailyKaalaTimings,
  getEnergyMeterAndVibe
} from "../../features/seva/icsCalendarGenerator";
import {
  BAND_STYLE,
  MARK,
  bandGuide,
  colourName,
  dayExplanation,
  directionName,
  formatLongDate,
  grahaName,
  nakshatraName,
  rashiName,
  tithiLabel,
  weekdayName
} from "../../features/seva/sevaPresentation";

import { useAppStore } from "../../stores/appStore";

type Props = {
  day: RhythmDay;
  lang: string;
  priestName?: string;
  lat?: number;
  lng?: number;
};

export default function SevaDayDetail({
  day,
  lang,
  priestName = "Shreeram Pandit (Chief Archaka)",
  lat,
  lng
}: Props): JSX.Element {
  const storeLat = useAppStore((s) => s.defaultLat);
  const storeLng = useAppStore((s) => s.defaultLng);
  const storePincode = useAppStore((s) => s.pincode);

  const activeLat = lat ?? storeLat;
  const activeLng = lng ?? storeLng;

  const style = BAND_STYLE[day.band];
  const vibe = getEnergyMeterAndVibe(day, lang);
  const kaala = getDailyKaalaTimings(day.dayLord, lang, day.ymd, activeLat, activeLng, storePincode);

  const isKn = lang.startsWith("kn");

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 shadow-xl transition-all">
      {/* Background Decorative Mandala Watermark */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #B45309 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* TOP BANNER RIBBON: Date, Day & Chief Priest Badge */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-amber-50 shadow-sm">
              🗓️
            </span>
            <h2 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              {formatLongDate(day, lang)}
            </h2>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-amber-900/80">
            <span className="font-semibold">{weekdayName(day, lang)}</span>
            <span>•</span>
            <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-amber-900">{tithiLabel(day, lang)}</span>
            <span>•</span>
            <span className="text-amber-800">{nakshatraName(day.moonNakshatraIndex, lang)}</span>
            <span>({rashiName(day.moonRashiIndex, lang)})</span>
          </div>
        </div>

        {/* Chief Priest Badge */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100/80 px-3.5 py-2 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-sm text-amber-50 shadow-inner">
            🪔
          </span>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              {pick(T.priestTitleHeader, lang) || "Chief Archaka — Baggona Gokarna Kshetra"}
            </div>
            <div className="text-xs font-bold text-amber-950">
              {priestName}
            </div>
          </div>
        </div>
      </div>

      {/* INFOGRAPHIC DUAL-PILLAR FLOW LAYOUT */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* PILLAR 1: Cosmic Flow & Janana Kundali Rhythm */}
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200/90 bg-white/80 p-4 shadow-sm">
          {/* Step 1: Energy & Vibe Meter */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[11px] font-bold text-amber-50">
                  1
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {pick(T.energyLevelTitle, lang) || "Daily Energy Meter & Vibe"}
                </h3>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm ${style.chip}`}>
                {vibe.badgeText}
              </span>
            </div>

            {/* Visual 10-Block Energy Meter */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                <span>{isKn ? "ದಿನದ ಶಕ್ತಿ ಸಾಮರ್ಥ್ಯ" : "Daily Cosmic Potency"}</span>
                <span className="font-mono text-xs font-bold text-amber-950">{day.energyScore}%</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-amber-100 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-600 transition-all duration-500"
                  style={{
                    width: `${day.energyScore}%`,
                    backgroundColor: style.printBorder
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-0.5 text-amber-800 shadow-xs border border-amber-200">
                  {vibe.meter}
                </span>
                <span className="rounded-md bg-amber-700 px-2 py-0.5 text-amber-50 shadow-xs">
                  {vibe.vibeTag}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Janana Kundali & Gochara Harmony */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[11px] font-bold text-amber-50">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {pick(T.kundaliHarmonyTitle, lang) || "Janana Kundali & Gochara Harmony"}
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-amber-200/80 bg-white p-2 text-center">
                <div className="text-[10px] font-bold uppercase text-amber-800/70">
                  {pick(T.labelTaraBala, lang) || "Tara Bala"}
                </div>
                <div className="mt-0.5 text-xs font-bold text-emerald-800">
                  {day.tara?.isFavourable ? `🌟 ${isKn ? "ಅನುಕೂಲ" : "Favourable"}` : `⚠️ ${isKn ? "ಮಧ್ಯಮ" : "Moderate"}`}
                </div>
                <div className="text-[10px] text-amber-900/70">
                  Tara #{day.tara?.tara || 1}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200/80 bg-white p-2 text-center">
                <div className="text-[10px] font-bold uppercase text-amber-800/70">
                  {pick(T.labelChandraBala, lang) || "Chandra Bala"}
                </div>
                <div className="mt-0.5 text-xs font-bold text-amber-950">
                  {day.isChandrashtama ? (
                    <span className="text-rose-700">⚠️ {pick(T.chandrashtama, lang)}</span>
                  ) : (
                    <span className="text-emerald-700">✓ {isKn ? "ಶುಭ ಚಂದ್ರ" : "Auspicious"}</span>
                  )}
                </div>
                <div className="text-[10px] text-amber-900/70">
                  {day.chandra?.house ? `House ${day.chandra.house}` : "Direct"}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200/80 bg-white p-2 text-center">
                <div className="text-[10px] font-bold uppercase text-amber-800/70">
                  {pick(T.labelVara, lang) || "Day Lord"}
                </div>
                <div className="mt-0.5 text-xs font-bold text-amber-950">
                  🪐 {grahaName(day.dayLord, lang)}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200/80 bg-white p-2 text-center">
                <div className="text-[10px] font-bold uppercase text-amber-800/70">
                  {pick(T.labelDasha, lang) || "Running Bhukti"}
                </div>
                <div className="mt-0.5 text-xs font-bold text-amber-950">
                  🔮 {day.bhuktiLord ? grahaName(day.bhuktiLord, lang) : "Active"}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {day.isMoneyDay && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900">
                <span>💰</span>
                <span>{MARK.money} {pick(T.moneyDay, lang)}</span>
              </div>
            )}
            {day.isChandrashtama && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-900">
                <span>⚠️</span>
                <span>{MARK.chandrashtama} {pick(T.chandrashtama, lang)}</span>
              </div>
            )}
          </div>
        </div>

        {/* PILLAR 2: Daily Kaala Muhurtha Timings (Localized Location Times) */}
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200/90 bg-white/80 p-4 shadow-sm">
          {/* Step 3: Kaala Windows */}
          <div className="h-full rounded-xl border border-amber-100 bg-amber-50/40 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[11px] font-bold text-amber-50">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {isKn ? "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು (ಸ್ಥಳೀಯ ಸಮಯ)"
                : lang.startsWith("hi") ? "आज के काल समय (स्थानीय समय)"
                : lang.startsWith("te") ? "నేటి కాల సమయాలు (స్థానిక సమయం)"
                : lang.startsWith("ta") ? "இன்றைய கால நேரங்கள்"
                : "Daily Kaala Timings (Local Time)"}
              </h3>
            </div>

            <div className="mt-3 space-y-2.5">
              {/* Rahu Kaala */}
              <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔴</span>
                  <div>
                    <div className="text-[11px] font-extrabold text-rose-950">
                      {isKn ? "ರಾಹು ಕಾಲ" : lang.startsWith("hi") ? "राहु काल" : lang.startsWith("te") ? "రాహు కాలం" : lang.startsWith("ta") ? "ராகு காலம்" : "Rahu Kaala"}
                    </div>
                    <div className="text-[10px] text-rose-800/80">
                      {isKn ? "ಹೊಸ ಕಾರ್ಯ ತಪ್ಪಿಸಿ" : lang.startsWith("hi") ? "नए कार्य से बचें" : lang.startsWith("te") ? "కొత్త పనులు వద్దు" : "Avoid starting new ventures"}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-bold text-rose-900 shadow-xs border border-rose-200">
                  {kaala.rahu}
                </div>
              </div>

              {/* Gulika Kaala */}
              <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟡</span>
                  <div>
                    <div className="text-[11px] font-extrabold text-amber-950">
                      {isKn ? "ಗುಳಿಕ ಕಾಲ" : lang.startsWith("hi") ? "गुलिक काल" : lang.startsWith("te") ? "గుళిక కాలం" : lang.startsWith("ta") ? "குளிகை காலம்" : "Gulika Kaala"}
                    </div>
                    <div className="text-[10px] text-amber-800/80">
                      {isKn ? "ಶುಭ ಕಾರ್ಯ & ಅಭಿವೃದ್ಧಿಗೆ ಶ್ರೇಷ್ಠ" : lang.startsWith("hi") ? "शुभ कार्य हेतु उत्तम" : lang.startsWith("te") ? "శుభ కార్యాలకు అనుకూలం" : "Auspicious for asset growth"}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-bold text-amber-900 shadow-xs border border-amber-200">
                  {kaala.gulika}
                </div>
              </div>

              {/* Yamaganda */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">⏳</span>
                  <div>
                    <div className="text-[11px] font-extrabold text-emerald-950">
                      {isKn ? "ಯಮಗಂಡ ಕಾಲ" : lang.startsWith("hi") ? "यमगंड काल" : lang.startsWith("te") ? "యమగండ కాలం" : lang.startsWith("ta") ? "யமகண்ட காலம்" : "Yamaganda Kaala"}
                    </div>
                    <div className="text-[10px] text-emerald-800/80">
                      {isKn ? "ಪ್ರಾರ್ಥನೆ & ನಿತ್ಯ ಕಾರ್ಯಕ್ಕೆ ಸೂಕ್ತ" : lang.startsWith("hi") ? "प्रार्थना एवं नित्य कार्य हेतु" : lang.startsWith("te") ? "ప్రార్థన & నిత్య పనులకు శ్రేష్టం" : "Ideal for prayer & routine duties"}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-bold text-emerald-900 shadow-xs border border-emerald-200">
                  {kaala.yamaganda}
                </div>
              </div>

              {/* Abhijit Muhurtha */}
              <div className="flex items-center justify-between rounded-xl border border-amber-400 bg-gradient-to-r from-amber-100/90 to-yellow-100/70 p-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌟</span>
                  <div>
                    <div className="text-[11px] font-extrabold text-amber-950">
                      {isKn ? "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ" : lang.startsWith("hi") ? "अभिजित मुहूर्त" : lang.startsWith("te") ? "అభిజిత్ ముహూర్తం" : lang.startsWith("ta") ? "அபிஜித் முகூர்த்தம்" : "Abhijit Muhurtha"}
                    </div>
                    <div className="text-[10px] text-amber-900/80">
                      {isKn ? "ಸರ್ವ ಕಾರ್ಯ ಸಿದ್ಧಿ ಶ್ರೇಷ್ಠ ಮುಹೂರ್ತ" : lang.startsWith("hi") ? "सर्व कार्य सिद्धि शुभ मुहूर्त" : lang.startsWith("te") ? "సర్వ కార్య సిద్ధి శుభ ముహూర్తం" : "Golden window for success"}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-700 px-2.5 py-1 font-mono text-xs font-bold text-amber-50 shadow-xs">
                  11:45 AM – 12:35 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFOGRAPHIC BAR: Chief Archaka Sanstha & Daily Obligations (Inspired by Reference Diagram) */}
      <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100/80 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-amber-50">
              ⚖️
            </span>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-950">
              {pick(T.archakaSansthaObligations, lang) || "Chief Archaka Sanstha & Daily Obligations"}
            </h3>
          </div>
          <span className="rounded-full bg-amber-700 px-3 py-0.5 text-[10px] font-bold text-amber-50 shadow-xs">
            Baggona Panchanga Discipline
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Step 4: Lucky Symbols */}
          <div className="rounded-xl border border-amber-200 bg-white/90 p-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-amber-50">
                4
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                {pick(T.stepLucky, lang) || "Personal Lucky Symbols"}
              </span>
            </div>

            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-amber-50/60 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] font-semibold text-amber-800">{pick(T.luckyNumber, lang)}</span>
                <span className="font-serif text-sm font-bold text-amber-950">{day.luckyNumbers.join(" · ")}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50/60 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] font-semibold text-amber-800">{pick(T.luckyColour, lang)}</span>
                <span className="flex items-center gap-1.5 font-medium text-amber-950">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-amber-300 shadow-xs"
                    style={{ backgroundColor: COLOUR_HEX[day.luckyColour] }}
                  />
                  {colourName(day, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50/60 px-2.5 py-1.5 text-xs">
                <span className="text-[11px] font-semibold text-amber-800">{pick(T.luckyDirection, lang)}</span>
                <span className="font-bold text-amber-950">🧭 {directionName(day, lang)}</span>
              </div>
            </div>
          </div>

          {/* Step 5: Archaka Guidance & Explanations */}
          <div className="col-span-1 rounded-xl border border-amber-200 bg-white/90 p-3 shadow-xs md:col-span-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-amber-50">
                5
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                {pick(T.stepArchaka, lang) || "Archaka's Direct Word & Vedic Rationale"}
              </span>
            </div>

            <div className="mt-2 space-y-2">
              <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 p-2.5 text-xs font-semibold leading-relaxed text-amber-950">
                "{bandGuide(day, lang)}"
              </div>

              <div className="space-y-1">
                {dayExplanation(day, lang).map((line, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-900/90">
                    <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
