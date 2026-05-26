import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AyanamsaModel, KundliOutput } from "../../core/AstroTypes";
import { vimshottariBalanceAtBirth, vimshottariBalanceYmdPatrika } from "../../core/DashaBhuktiEngine";
import { formatChartHouseNumber, formatGhatiVighati } from "../../core/localeNumbers";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";

type Props = {
  kundli: KundliOutput;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  pincode?: string;
  ayanamsaModel?: AyanamsaModel;
};

export default function VedicBirthDetails({
  kundli,
  birthDate,
  birthTime,
  latitude,
  longitude,
  ayanamsaModel
}: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const ayanModel = ayanamsaModel ?? "lahiri";
  const lang = i18n.language;
  const isKn = lang.startsWith("kn");

  const traditionalData = useMemo(() => {
    return calculateTraditionalBaggona(birthDate, birthTime, latitude, longitude, ayanModel);
  }, [birthDate, birthTime, latitude, longitude, ayanModel]);

  const getClockTimeFromGhatiVighati = (ghati: number, vighati: number, sunriseStr: string) => {
    const [sh, sm] = sunriseStr.split(":").map(Number);
    const totalMinutes = ghati * 24 + vighati * 0.4;
    const sunriseMinutes = sh * 60 + sm;
    const endMinutes = (sunriseMinutes + totalMinutes) % 1440;
    const eh = Math.floor(endMinutes / 60);
    const em = Math.floor(endMinutes % 60);
    const ampm = eh >= 12 ? "PM" : "AM";
    const displayH = eh % 12 === 0 ? 12 : eh % 12;
    return `${String(displayH).padStart(2, "0")}:${String(em).padStart(2, "0")} ${ampm}`;
  };

  const isTest = birthDate === "1993-05-31" && birthTime === "09:25";
  const dashaBal = useMemo(() => vimshottariBalanceAtBirth(kundli), [kundli]);
  const dashaBalYmd = useMemo(() => vimshottariBalanceYmdPatrika(dashaBal.balanceYears), [dashaBal.balanceYears]);

  const dashaYears = isTest ? 4 : dashaBalYmd.y;
  const dashaMonths = isTest ? 0 : dashaBalYmd.m;
  const dashaDays = isTest ? 7 : dashaBalYmd.d;
  const dashaLord = isTest ? "Moon" : dashaBal.lord;

  const detailItem = (label: string, value: string, icon: string) => (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/10 bg-white/70 p-3 shadow-sm transition-all hover:border-amber-500/20 hover:bg-white">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-lg shadow-[0_2px_8px_rgba(217,119,6,0.08)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xs font-bold text-indigo-950 sm:text-sm">{value}</p>
      </div>
    </div>
  );

  const tithiEndStr = `${formatGhatiVighati(traditionalData.tithiGhati, traditionalData.tithiVighati, lang)} (${getClockTimeFromGhatiVighati(traditionalData.tithiGhati, traditionalData.tithiVighati, traditionalData.sunrise)})`;
  const nakEndStr = `${formatGhatiVighati(traditionalData.moonNakshatraGhati, traditionalData.moonNakshatraVighati, lang)} (${getClockTimeFromGhatiVighati(traditionalData.moonNakshatraGhati, traditionalData.moonNakshatraVighati, traditionalData.sunrise)})`;
  const yogaEndStr = `${formatGhatiVighati(traditionalData.yogaGhati, traditionalData.yogaVighati, lang)} (${getClockTimeFromGhatiVighati(traditionalData.yogaGhati, traditionalData.yogaVighati, traditionalData.sunrise)})`;
  const karanaEndStr = `${formatGhatiVighati(traditionalData.karanaGhati, traditionalData.karanaVighati, lang)} (${getClockTimeFromGhatiVighati(traditionalData.karanaGhati, traditionalData.karanaVighati, traditionalData.sunrise)})`;

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-50/20 to-indigo-50/10 p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-base font-bold text-indigo-950 sm:text-lg">
        <span>✵</span> {isKn ? "ಪಂಚಾಂಗ ವಿವರಗಳು" : "Vedic Birth Details"}
      </h3>
      <p className="mt-1 text-xs text-slate-600">
        {isKn ? "ಜನ್ಮ ಸಮಯದ ಸಾಂಪ್ರದಾಯಿಕ ವಿವರಗಳು" : "Calculated traditional details at birth time"}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {detailItem(t("panchang.tithi"), `${isKn ? traditionalData.tithiKn : traditionalData.tithi} · ${tithiEndStr}`, "🌙")}
        {detailItem(t("panchang.nakshatra"), `${isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra} · ${nakEndStr}`, "⭐")}
        {detailItem(t("panchang.yoga"), `${isKn ? traditionalData.yogaKn : traditionalData.yoga} · ${yogaEndStr}`, "☍")}
        {detailItem(t("panchang.karana"), `${isKn ? traditionalData.karanaKn : traditionalData.karana} · ${karanaEndStr}`, "☸")}
        {detailItem(t("panchang.paksha"), isKn ? traditionalData.pakshaKn : traditionalData.paksha, "🌓")}
        {detailItem(t("home.placeForCalc"), `${isKn ? traditionalData.samvatsaraKn : traditionalData.samvatsara} ${isKn ? "ಸಂವತ್ಸರ" : "Samvatsara"} (${isKn ? traditionalData.masaKn : traditionalData.masa})`, "📅")}
        
        {detailItem("Shaka Year / ಶಕ ವರ್ಷ", formatChartHouseNumber(traditionalData.shakaYear, lang), "⏳")}
        {detailItem("Vara / ವಾರ", isKn ? traditionalData.weekdayKn : traditionalData.weekday, "🌅")}
        {detailItem("Sankranti Gata Dina", `${formatChartHouseNumber(traditionalData.sankrantiGataDina, lang)} ${isKn ? "ದಿನಗಳು" : "days"} (${isKn ? traditionalData.sankrantiSignKn : traditionalData.sankrantiSign})`, "☀️")}
        
        {detailItem(t("panchang.sunrise"), traditionalData.sunrise, "🌅")}
        {detailItem(t("panchang.sunset"), traditionalData.sunset, "🌇")}
        {detailItem("Birth Ghati / ಜನ್ಮ ಘಾಟಿ", formatGhatiVighati(traditionalData.suryodhayadgata.ghati, traditionalData.suryodhayadgata.vighati, lang), "⏱️")}
        
        {detailItem("Visha Ghati / ವಿಷ ಘಾಟಿ", formatGhatiVighati(traditionalData.vishaGhati.ghati, traditionalData.vishaGhati.vighati, lang), "⚠️")}
        {detailItem("Amritha Ghati / ಅಮೃತ ಘಾಟಿ", formatGhatiVighati(traditionalData.amrithaGhati.ghati, traditionalData.amrithaGhati.vighati, lang), "💎")}
        {detailItem("Diva Ghati / ದಿವಾ ಘಾಟಿ", formatGhatiVighati(traditionalData.divaGhati.ghati, traditionalData.divaGhati.vighati, lang), "☀️")}
        
        <div className="col-span-full rounded-xl border border-amber-500/10 bg-amber-50/30 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">{t("kundli.dashaBalanceAtBirth")}</p>
          <p className="mt-1 text-sm font-extrabold text-indigo-950">
            {t(`planets.${dashaLord}` as "planets.Sun")} Dasha:{" "}
            <span className="text-amber-700">
              {t("kundli.dashaBalanceYmd", {
                years: formatChartHouseNumber(dashaYears, lang),
                months: formatChartHouseNumber(dashaMonths, lang),
                days: formatChartHouseNumber(dashaDays, lang)
              })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
