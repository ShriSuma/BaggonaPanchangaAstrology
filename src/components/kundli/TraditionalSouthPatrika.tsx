import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import type { AyanamsaModel, KundliOutput, PlanetPosition, Rashi } from "../../core/AstroTypes";
import { RASHIS } from "../../core/AstroTypes";
import { getCellForRashiIndex } from "./southIndianLayout";
import { formatChartHouseNumber, formatGhatiVighati, patrikaNavamshaFromDegree } from "../../core/localeNumbers";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { vimshottariBalanceAtBirth, vimshottariBalanceYmdPatrika } from "../../core/DashaBhuktiEngine";

type Props = {
  kundli: KundliOutput;
  personName: string;
  gothra?: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  pincode?: string;
  ayanamsaModel?: AyanamsaModel;
};

const rashiTKey = (sanskrit: string): string => `rashis.${sanskrit.replace(/\s+/g, "")}`;
const nakSanTKey = (sanskrit: string): string => `nakshatras.${sanskrit.replace(/\s+/g, "")}`;

export default function TraditionalSouthPatrika({
  kundli,
  personName,
  gothra,
  birthDate,
  birthTime,
  latitude,
  longitude,
  placeLabel,
  pincode,
  ayanamsaModel
}: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const ayanModel = ayanamsaModel ?? "lahiri";
  const exportRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language;
  const isKn = lang.startsWith("kn");

  const traditionalData = useMemo(() => {
    return calculateTraditionalBaggona(birthDate, birthTime, latitude, longitude, ayanModel);
  }, [birthDate, birthTime, latitude, longitude, ayanModel]);

  const byRashi = useMemo(() => {
    const map = new Map<number, PlanetPosition[]>();
    for (const p of kundli.planets) {
      const arr = map.get(p.rashi.index) ?? [];
      arr.push(p);
      map.set(p.rashi.index, arr);
    }
    return map;
  }, [kundli.planets]);

  const moon = kundli.planets.find((p) => p.name === "Moon");

  const onDownloadPng = async () => {
    const el = exportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fbf6e8",
      logging: false
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `patrike-${(personName || "traditional-panchanga").replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const cellStyle = (rashi: Rashi): CSSProperties => {
    const c = getCellForRashiIndex(rashi.index);
    return {
      gridColumn: c.col + 1,
      gridRow: c.row + 1
    };
  };

  const centerStyle: CSSProperties = { gridColumn: "2 / 4", gridRow: "2 / 4" };

  const labelRow = (labelKey: string, value: string) => (
    <div className="flex gap-1 border-b border-black/10 py-0.5 text-[11px] leading-tight">
      <span className="shrink-0 font-semibold text-black">{t(labelKey as any)} :</span>
      <span className="jk-patrika-ink min-w-0 flex-1 font-medium">{value || "—"}</span>
    </div>
  );

  const dashaBal = useMemo(() => vimshottariBalanceAtBirth(kundli), [kundli]);
  const dashaBalYmd = useMemo(() => vimshottariBalanceYmdPatrika(dashaBal.balanceYears), [dashaBal.balanceYears]);

  const dashaYears = traditionalData.dashaYears !== undefined ? traditionalData.dashaYears : dashaBalYmd.y;
  const dashaMonths = traditionalData.dashaMonths !== undefined ? traditionalData.dashaMonths : dashaBalYmd.m;
  const dashaDays = traditionalData.dashaDays !== undefined ? traditionalData.dashaDays : dashaBalYmd.d;
  const dashaLord = traditionalData.dashaLord !== undefined ? traditionalData.dashaLord : dashaBal.lord;

  const paragraphText = isKn ? (
    `ಸ್ವಸ್ತಿ ಶ್ರೀಮಜ್ಜಯಾಭ್ಯುದಯ ನೃಪಶಾಲೀವಾಹನ ಗತಶಕವರ್ಷ ${formatChartHouseNumber(traditionalData.shakaYear, "kn")} ${traditionalData.samvatsaraKn} ಸಂವತ್ಸರೇ, ${traditionalData.masaKn} ಮಾಸೇ, ${traditionalData.pakshaKn} ಪಕ್ಷೇ, ${traditionalData.tithiKn} ತಿಥೌ, ${traditionalData.weekdayKn}, ಘಟಿ ${formatChartHouseNumber(traditionalData.tithiGhati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.tithiVighati, "kn")}, ರವಿ ನ. ${traditionalData.sunNakshatraKn} ಘಟಿ ${formatChartHouseNumber(traditionalData.sunNakshatraGhati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.sunNakshatraVighati, "kn")}, ಚಂದ್ರ ನ. ${traditionalData.moonNakshatraKn} ಘಟಿ ${formatChartHouseNumber(traditionalData.moonNakshatraGhati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.moonNakshatraVighati, "kn")}, ${traditionalData.yogaKn} ಯೋಗ ಘಟಿ ${formatChartHouseNumber(traditionalData.yogaGhati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.yogaVighati, "kn")}, ಕರಣ ${traditionalData.karanaKn} ಘಟಿ ${formatChartHouseNumber(traditionalData.karanaGhati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.karanaVighati, "kn")}, ವಿಷಘಟಿ ${formatChartHouseNumber(traditionalData.vishaGhati.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.vishaGhati.vighati, "kn")}, ಅಮೃತಘಟಿ ${formatChartHouseNumber(traditionalData.amrithaGhati.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.amrithaGhati.vighati, "kn")}, ದಿವಾಘಟಿ ${formatChartHouseNumber(traditionalData.divaGhati.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.divaGhati.vighati, "kn")}, ಸಂಕ್ರಾಂತಿ ${traditionalData.sankrantiSignKn} ಗತದಿನ ${formatChartHouseNumber(traditionalData.sankrantiGataDina, "kn")} ${traditionalData.moonNakshatraKn}, ಪರಮ ಘಟಿ ${formatChartHouseNumber(traditionalData.paramaGhati.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.paramaGhati.vighati, "kn")} ಐಷ್ಯಘಟಿ ${formatChartHouseNumber(traditionalData.ashayaGhati.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.ashayaGhati.vighati, "kn")} ಗತಘಟಿ ${formatChartHouseNumber(traditionalData.ghatadina.ghati, "kn")} ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.ghatadina.vighati, "kn")} ಏವಂ ಪಂಚಾಂಗಮ್ ।`
  ) : (
    `Swasti Shrimaj-Jaya-Abhyudaya Nripa-Shalivahana Gata-Shaka-Varsha ${traditionalData.shakaYear} ${traditionalData.samvatsara} Samvatsare, ${traditionalData.masa} Mase, ${traditionalData.paksha} Pakshe, ${traditionalData.tithi} Tithau, ${traditionalData.weekday}, Ghati ${traditionalData.tithiGhati} Vighati ${traditionalData.tithiVighati}, Ravi Nakshatra ${traditionalData.sunNakshatra} Ghati ${traditionalData.sunNakshatraGhati} Vighati ${traditionalData.sunNakshatraVighati}, Chandra Nakshatra ${traditionalData.moonNakshatra} Ghati ${traditionalData.moonNakshatraGhati} Vighati ${traditionalData.moonNakshatraVighati}, ${traditionalData.yoga} Yoga Ghati ${traditionalData.yogaGhati} Vighati ${traditionalData.yogaVighati}, Karana ${traditionalData.karana} Ghati ${traditionalData.karanaGhati} Vighati ${traditionalData.karanaVighati}, Visha Ghati ${traditionalData.vishaGhati.ghati} Vighati ${traditionalData.vishaGhati.vighati}, Amritha Ghati ${traditionalData.amrithaGhati.ghati} Vighati ${traditionalData.amrithaGhati.vighati}, Diva Ghati ${traditionalData.divaGhati.ghati} Vighati ${traditionalData.divaGhati.vighati}, Sankranti ${traditionalData.sankrantiSign} solar days passed ${traditionalData.sankrantiGataDina} ${traditionalData.moonNakshatra}, Parama Ghati ${traditionalData.paramaGhati.ghati} Vighati ${traditionalData.paramaGhati.vighati} Aishya Ghati ${traditionalData.ashayaGhati.ghati} Vighati ${traditionalData.ashayaGhati.vighati} Gata Ghati ${traditionalData.ghatadina.ghati} Vighati ${traditionalData.ghatadina.vighati}. Even Panchangam.`
  );

  const birthGhatiText = isKn ? (
    `ಅಸ್ಮಿನ್ ಶುಭದಿನೇ ಸೂರ್ಯೋದಯಾದ್ಯಾತ ಘಟಿ ${formatChartHouseNumber(traditionalData.suryodhayadgata.ghati, "kn")}, ವಿಘಟಿ ${formatChartHouseNumber(traditionalData.suryodhayadgata.vighati, "kn")} (ಹಗಲು) ಘಂಟೆ ${formatChartHouseNumber(Number(birthTime.split(":")[0]), "kn")} ಮಿ ${formatChartHouseNumber(Number(birthTime.split(":")[1]), "kn")} ತತ್ಕಾಲೇ, ಶ್ರೀ ${t(rashiTKey(kundli.lagnaRashi.sanskrit))} ಲಗ್ನಸ್ಥೇ ಜನ್ಮಕಾಲೇ...`
  ) : (
    `On this auspicious day, sunrise-passed Ghati ${traditionalData.suryodhayadgata.ghati}, Vighati ${traditionalData.suryodhayadgata.vighati} (Day), at clock time ${birthTime}, Sri ${t(rashiTKey(kundli.lagnaRashi.sanskrit))} Lagna at birth...`
  );

  const dashaText = isKn ? (
    `ಜನ್ಮಕಾಲಃ ಜನ್ಮಶಿಷ್ಟ ${t(`planets.${dashaLord}` as "planets.Sun")} ದಶಾವರ್ಷ ${formatChartHouseNumber(dashaYears, "kn")}, ಮಾಸ ${formatChartHouseNumber(dashaMonths, "kn")}, ದಿನ ${formatChartHouseNumber(dashaDays, "kn")}`
  ) : (
    `At birth: Remaining ${t(`planets.${dashaLord}` as "planets.Sun")} Dasha: Years ${dashaYears}, Months ${dashaMonths}, Days ${dashaDays}`
  );

  const detailUiItem = (label: string, value: string, icon: string) => (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/10 bg-white/70 p-3.5 shadow-sm transition-all hover:border-amber-500/20 hover:bg-white">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-lg shadow-[0_2px_8px_rgba(217,119,6,0.08)]">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs font-bold text-indigo-950 sm:text-sm break-words whitespace-normal">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-6 space-y-4">
      {/* 1. Web UI Dashboard Detail Grid (Above the Patrika Card) */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-50/10 to-indigo-50/5 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-indigo-950 sm:text-lg">
          <span>✵</span> {isKn ? "ಪಂಚಾಂಗ ಮೌಲ್ಯಗಳು (ಸಂಪೂರ್ಣ ವಿವರಣೆ)" : "Vedic Panchanga Parameters"}
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          {isKn ? "ಹಸ್ತಪ್ರತಿಯಲ್ಲಿರುವ ಎಲ್ಲಾ ಲೆಕ್ಕಾಚಾರದ ವಿವರಗಳು" : "All traditional values matching handwriting document calculations"}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {detailUiItem(isKn ? "ಶಕ ವರ್ಷ" : "Gatashaka Varsha", formatChartHouseNumber(traditionalData.shakaYear, lang), "⏳")}
          {detailUiItem(isKn ? "ಸಂವತ್ಸರ" : "Samvatsara", isKn ? traditionalData.samvatsaraKn : traditionalData.samvatsara, "📅")}
          {detailUiItem(isKn ? "ಮಾಸ" : "Masa", isKn ? traditionalData.masaKn : traditionalData.masa, "📅")}
          {detailUiItem(isKn ? "ಪಕ್ಷ" : "Paksha", isKn ? `${traditionalData.pakshaKn} ಪಕ್ಷ` : `${traditionalData.paksha} Paksha`, "🌓")}
          {detailUiItem(isKn ? "ತಿಥಿ" : "Tithi", `${isKn ? traditionalData.tithiKn : traditionalData.tithi} · ${traditionalData.tithiGhati} Ghati ${traditionalData.tithiVighati} Vighati`, "🌙")}
          {detailUiItem(isKn ? "ವಾರ" : "Weekday", isKn ? traditionalData.weekdayKn : traditionalData.weekday, "🌅")}
          {detailUiItem(isKn ? "ರವಿ ನಕ್ಷತ್ರ" : "Sun Nakshatra", `${isKn ? traditionalData.sunNakshatraKn : traditionalData.sunNakshatra} · ${traditionalData.sunNakshatraGhati} Ghati ${traditionalData.sunNakshatraVighati} Vighati`, "☀️")}
          {detailUiItem(isKn ? "ಚಂದ್ರ ನಕ್ಷತ್ರ" : "Moon Nakshatra", `${isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra} · ${traditionalData.moonNakshatraGhati} Ghati ${traditionalData.moonNakshatraVighati} Vighati`, "⭐")}
          {detailUiItem(isKn ? "ಯೋಗ" : "Yoga", `${isKn ? traditionalData.yogaKn : traditionalData.yoga} · ${traditionalData.yogaGhati} Ghati ${traditionalData.yogaVighati} Vighati`, "☍")}
          {detailUiItem(isKn ? "ಕರಣ" : "Karana", `${isKn ? traditionalData.karanaKn : traditionalData.karana} · ${traditionalData.karanaGhati} Ghati ${traditionalData.karanaVighati} Vighati`, "☸")}
          {detailUiItem(isKn ? "ವಿಷ ಘಟಿ" : "Visha Ghati", `${traditionalData.vishaGhati.ghati} Ghati ${traditionalData.vishaGhati.vighati} Vighati`, "⚠️")}
          {detailUiItem(isKn ? "ಅಮೃತ ಘಟಿ" : "Amritha Ghati", `${traditionalData.amrithaGhati.ghati} Ghati ${traditionalData.amrithaGhati.vighati} Vighati`, "💎")}
          {detailUiItem(isKn ? "ದಿವಾ ಘಟಿ" : "Diva Ghati", `${traditionalData.divaGhati.ghati} Ghati ${traditionalData.divaGhati.vighati} Vighati`, "☀️")}
          {detailUiItem(isKn ? "ಸಂಕ್ರಾಂತಿ ಗತದಿನ" : "Sankranti Gata Dina", `${isKn ? traditionalData.sankrantiSignKn : traditionalData.sankrantiSign} ${traditionalData.sankrantiGataDina} (${isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra})`, "☀️")}
          {detailUiItem(isKn ? "ಪರಮ ಘಟಿ" : "Parama Ghati", `${traditionalData.paramaGhati.ghati} Ghati ${traditionalData.paramaGhati.vighati} Vighati`, "📈")}
          {detailUiItem(isKn ? "ಐಷ್ಯ ಘಟಿ" : "Aishya Ghati", `${traditionalData.ashayaGhati.ghati} Ghati ${traditionalData.ashayaGhati.vighati} Vighati`, "📉")}
          {detailUiItem(isKn ? "ಗತದಿನ ಘಟಿ" : "Gata Ghati", `${traditionalData.ghatadina.ghati} Ghati ${traditionalData.ghatadina.vighati} Vighati`, "⏱️")}
          {detailUiItem(isKn ? "ಸೂರ್ಯೋದಯಾದ್ಯಾತ ಘಟಿ" : "Suryodhayadvalita Ghati", `${traditionalData.suryodhayadgata.ghati} Ghati ${traditionalData.suryodhayadgata.vighati} Vighati`, "🌅")}
          {detailUiItem(isKn ? "ಸೂರ್ಯೋದಯ" : "Sunrise", traditionalData.sunrise, "🌅")}
          {detailUiItem(isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset", traditionalData.sunset, "🌇")}
        </div>
      </div>

      {/* 2. Download / Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-indigo-950">{isKn ? "ಸಾಂಪ್ರದಾಯಿಕ ಜನ್ಮಪತ್ರಿಕೆ ಚಿತ್ರ" : "Traditional Janma Patrika Image"}</h3>
        <button
          type="button"
          className="jk-btn rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-950 hover:bg-slate-50 transition-colors shadow-sm"
          onClick={() => void onDownloadPng()}
        >
          {t("kundli.patrikaDownloadPatrike")}
        </button>
      </div>
      <p className="text-xs text-slate-600">{t("kundli.patrikaNote")}</p>

      {/* 3. The Patrika Card (captured by html2canvas) */}
      <div
        ref={exportRef}
        className="jk-patrika-root mx-auto max-w-lg overflow-hidden rounded-sm border-[3px] border-double border-neutral-900 bg-[#fbf6e8] p-4 shadow-sm"
        style={{
          fontFamily: "'Noto Serif Kannada','Noto Sans Kannada',Georgia,serif"
        }}
      >
        <div
          className="border border-neutral-900 p-3"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 5px,
              rgba(0,0,0,0.03) 5px,
              rgba(0,0,0,0.03) 6px
            )`
          }}
        >
          <div className="mb-3 text-center">
            <p className="text-sm font-bold tracking-wider text-black">|| ಶ್ರೀ ಭಾಸ್ಕರಾಯ ನಮಃ ||</p>
            <p className="mt-1 text-[9px] italic leading-tight text-neutral-800">
              ಜನನೀ ಜನ್ಮ ಸೌಖ್ಯಾನಾಂ ವರ್ಧನೀ ಕುಲಸಂಪದಾಂ । ಪದವೀ ಪೂರ್ವಪುಣ್ಯಾನಾಂ ಲಿಖ್ಯತೇ ಜನ್ಮಪತ್ರಿಕಾ ॥
            </p>
            <div className="mx-auto mt-1.5 h-[1.5px] w-2/3 bg-black/35" />
          </div>

          {/* Standard Handwritten Paragraph */}
          <div className="mb-3 text-[10px] leading-relaxed text-black text-justify border-b border-black/15 pb-2.5">
            <p className="text-neutral-950 font-normal leading-normal">{paragraphText}</p>
            <p className="mt-1.5 font-bold text-neutral-950">{birthGhatiText}</p>
            <p className="mt-1 font-bold text-amber-950">{dashaText}</p>
          </div>

          {/* Clean, nicely spaced grid inside the Patrika Image */}
          <div className="my-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-black/15 pb-3 text-[10px] text-black">
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಗತಶಕ ವರ್ಷ" : "Gatashaka Varsha"}:</span>
              <span className="font-medium">{formatChartHouseNumber(traditionalData.shakaYear, lang)}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಸಂವತ್ಸರ" : "Samvatsara"}:</span>
              <span className="font-medium">{isKn ? traditionalData.samvatsaraKn : traditionalData.samvatsara}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಮಾಸ" : "Masa"}:</span>
              <span className="font-medium">{isKn ? traditionalData.masaKn : traditionalData.masa}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಪಕ್ಷ" : "Paksha"}:</span>
              <span className="font-medium">{isKn ? traditionalData.pakshaKn : traditionalData.paksha}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ತಿಥಿ ವಿವರ" : "Tithi Details"}:</span>
              <span className="font-medium">{isKn ? traditionalData.tithiKn : traditionalData.tithi} ({traditionalData.tithiGhati} ಘಟಿ {traditionalData.tithiVighati} ವಿ)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ವಾರ" : "Weekday"}:</span>
              <span className="font-medium">{isKn ? traditionalData.weekdayKn : traditionalData.weekday}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ರವಿ ನಕ್ಷತ್ರ" : "Sun Nakshatra"}:</span>
              <span className="font-medium">{isKn ? traditionalData.sunNakshatraKn : traditionalData.sunNakshatra} ({traditionalData.sunNakshatraGhati} ಘಟಿ {traditionalData.sunNakshatraVighati} ವಿ)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಚಂದ್ರ ನಕ್ಷತ್ರ" : "Moon Nakshatra"}:</span>
              <span className="font-medium">{isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra} ({traditionalData.moonNakshatraGhati} ಘಟಿ {traditionalData.moonNakshatraVighati} ವಿ)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಯೋಗ" : "Yoga"}:</span>
              <span className="font-medium">{isKn ? traditionalData.yogaKn : traditionalData.yoga} ({traditionalData.yogaGhati} ಘಟಿ {traditionalData.yogaVighati} ವಿ)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಕರಣ" : "Karana"}:</span>
              <span className="font-medium">{isKn ? traditionalData.karanaKn : traditionalData.karana} ({traditionalData.karanaGhati} ಘಟಿ {traditionalData.karanaVighati} ವಿ)</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ವಿಷ ಘಟಿ" : "Visha Ghati"}:</span>
              <span className="font-medium">{traditionalData.vishaGhati.ghati} ಘಟಿ {traditionalData.vishaGhati.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಅಮೃತ ಘಟಿ" : "Amritha Ghati"}:</span>
              <span className="font-medium">{traditionalData.amrithaGhati.ghati} ಘಟಿ {traditionalData.amrithaGhati.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ದಿವಾ ಘಟಿ" : "Diva Ghati"}:</span>
              <span className="font-medium">{traditionalData.divaGhati.ghati} ಘಟಿ {traditionalData.divaGhati.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಸಂಕ್ರಾಂತಿ ಗತದಿನ" : "Sankranti Gata Dina"}:</span>
              <span className="font-medium">{isKn ? traditionalData.sankrantiSignKn : traditionalData.sankrantiSign} {traditionalData.sankrantiGataDina}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಪರಮ ಘಟಿ" : "Parama Ghati"}:</span>
              <span className="font-medium">{traditionalData.paramaGhati.ghati} ಘಟಿ {traditionalData.paramaGhati.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಐಷ್ಯ ಘಟಿ" : "Aishya Ghati"}:</span>
              <span className="font-medium">{traditionalData.ashayaGhati.ghati} ಘಟಿ {traditionalData.ashayaGhati.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಗತದಿನ ಘಟಿ" : "Gata Ghati"}:</span>
              <span className="font-medium">{traditionalData.ghatadina.ghati} ಘಟಿ {traditionalData.ghatadina.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಸೂರ್ಯೋದಯಾದ್ಯಾತ ಘಟಿ" : "Suryodhayadvalita Ghati"}:</span>
              <span className="font-medium">{traditionalData.suryodhayadgata.ghati} ಘಟಿ {traditionalData.suryodhayadgata.vighati} ವಿ</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ" : "Birth Date"}:</span>
              <span className="font-medium">{birthDate}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಹುಟ್ಟಿದ ಸಮಯ" : "Birth Time"}:</span>
              <span className="font-medium">{birthTime}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಸೂರ್ಯೋದಯ" : "Sunrise"}:</span>
              <span className="font-medium">{traditionalData.sunrise}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5">
              <span className="font-semibold text-neutral-800">{isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset"}:</span>
              <span className="font-medium">{traditionalData.sunset}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 py-0.5 col-span-2">
              <span className="font-semibold text-neutral-800">{isKn ? "ಜನ್ಮಕಾಲೀನ ಶಿಷ್ಟ ದಶೆ" : "Birth Dasha Balance"}:</span>
              <span className="font-medium">
                {isKn 
                  ? `ಶ್ರೀ ${t(`planets.${dashaLord}` as any)} ದಶೆ: ${formatChartHouseNumber(dashaYears, "kn")} ವರ್ಷ, ${formatChartHouseNumber(dashaMonths, "kn")} ತಿಂಗಳು, ${formatChartHouseNumber(dashaDays, "kn")} ದಿನ`
                  : `${dashaLord} Dasha: ${dashaYears} Y, ${dashaMonths} M, ${dashaDays} D`
                }
              </span>
            </div>
          </div>

          <div className="relative mt-4">
            <div
              className="absolute left-0 top-[8%] z-10 max-w-[1.1rem] text-[8px] font-bold leading-tight text-black"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {t("kundli.patrikaSunsetSide")}
            </div>
            <div
              className="absolute left-0 bottom-[8%] z-10 max-w-[1.1rem] text-[8px] font-bold leading-tight text-black"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {t("kundli.patrikaSunriseSide")}
            </div>
            <div
              className="absolute right-0 top-[6%] z-10 max-w-[1rem] text-[8px] font-bold leading-tight text-black"
              style={{ writingMode: "vertical-rl" }}
            >
              {t("kundli.patrikaSolar")}
            </div>
            <div
              className="absolute right-0 top-[42%] z-10 max-w-[1rem] text-[8px] font-bold leading-tight text-black"
              style={{ writingMode: "vertical-rl" }}
            >
              {t("kundli.patrikaMonth")}
            </div>
            <div
              className="absolute right-0 bottom-[6%] z-10 max-w-[1rem] text-[8px] font-bold leading-tight text-black"
              style={{ writingMode: "vertical-rl" }}
            >
              {t("kundli.patrikaBirthDate")}
            </div>

            <div
              className="mx-auto grid aspect-square w-full max-w-[340px] grid-cols-4 grid-rows-4 border border-black bg-[#fbf6e8]"
              style={{ marginLeft: "1.1rem", marginRight: "1rem" }}
            >
              {RASHIS.map((rashi) => {
                const planetsHere = byRashi.get(rashi.index) ?? [];
                const c = getCellForRashiIndex(rashi.index);
                const cells: JSX.Element[] = [];
                if (rashi.index === kundli.lagnaRashi.index) {
                  cells.push(
                    <span key="lagna" className="jk-patrika-ink block">
                      {t("kundli.lagMark", { defaultValue: "ಲ" })}{formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.ascendant), lang)}
                    </span>
                  );
                }
                for (const pl of planetsHere) {
                  cells.push(
                    <span key={pl.name} className="jk-patrika-ink block">
                      {t(`planets.${pl.name}` as "planets.Sun")} {formatChartHouseNumber(patrikaNavamshaFromDegree(pl.degree), lang)}
                    </span>
                  );
                }
                if (kundli.maandi && kundli.maandi.rashi.index === rashi.index) {
                  cells.push(
                    <span key="maandi" className="jk-patrika-ink block">
                      {t("kundli.maandiShort")} {formatChartHouseNumber(patrikaNavamshaFromDegree(kundli.maandi.degree), lang)}
                    </span>
                  );
                }
                return (
                  <div
                    key={rashi.index}
                    data-rashi={rashi.index}
                    className={`flex flex-col border-r border-b border-black p-1 ${c.row === 0 ? "border-t" : ""} ${c.col === 0 ? "border-l" : ""}`}
                    style={cellStyle(rashi)}
                  >
                    <span className="text-[7px] font-bold uppercase tracking-wide text-neutral-500">
                      {t(rashiTKey(rashi.sanskrit) as "rashis.Mesha")}
                    </span>
                    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 text-center text-[10px] font-bold leading-tight">
                      {cells}
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col border border-black bg-[#fdfaf0] p-2" style={centerStyle}>
                <div className="flex min-h-0 flex-1 flex-col justify-center text-[11px]">
                  {labelRow("kundli.patrikaName", personName)}
                  {labelRow(
                    "kundli.patrikaNakshatra",
                    moon ? t(nakSanTKey(moon.nakshatra.sanskrit) as "nakshatras.Ashwini") : "—"
                  )}
                  {labelRow("kundli.patrikaRashi", t(rashiTKey(kundli.moonSign.sanskrit) as "rashis.Mesha"))}
                  {labelRow("kundli.patrikaGotra", gothra ?? "")}
                  {labelRow("kundli.patrikaPada", String(kundli.moonPada))}
                </div>
              </div>
            </div>

            <div
              className="mx-auto mt-2.5 grid max-w-[340px] grid-cols-3 gap-1 border-t border-black/25 pt-2 text-center text-[9px] text-black"
              style={{ marginLeft: "1.1rem", marginRight: "1rem" }}
            >
              <div>
                <span className="font-semibold">{t("kundli.patrikaYoni")}</span>
                <div className="jk-patrika-ink font-bold">
                  {isKn ? patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).yoniKn : patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).yoniEn}
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("kundli.patrikaGana")}</span>
                <div className="jk-patrika-ink font-bold">
                  {isKn ? patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).ganaKn : patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).ganaEn}
                </div>
              </div>
              <div>
                <span className="font-semibold">{t("kundli.patrikaNadi")}</span>
                <div className="jk-patrika-ink font-bold">
                  {isKn ? patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).nadiKn : patrikaMetaForNakshatraIndex(moon?.nakshatra.index ?? 0).nadiEn}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[8px] text-neutral-600 font-medium">
              {placeLabel} · {birthDate} · {birthTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function patrikaMetaForNakshatraIndex(index: number) {
  const i = ((index % 27) + 27) % 27;
  const list = [
    { yoniKn: "ಅಶ್ವ", yoniEn: "Horse", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಗಜ", yoniEn: "Elephant", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಮೇಷ", yoniEn: "Goat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಸರ್ಪ", yoniEn: "Serpent", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಸರ್ಪ", yoniEn: "Serpent", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಶ್ವಾನ", yoniEn: "Dog", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಮಾರ್ಜಾಲ", yoniEn: "Cat", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಮೇಷ", yoniEn: "Goat", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಮಾರ್ಜಾಲ", yoniEn: "Cat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಮೂಷಕ", yoniEn: "Rat", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಮೂಷಕ", yoniEn: "Rat", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಗೌ", yoniEn: "Cow", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಮಹಿಷ", yoniEn: "Buffalo", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ವ್ಯಾಘ್ರ", yoniEn: "Tiger", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಮಹಿಷ", yoniEn: "Buffalo", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ವ್ಯಾಘ್ರ", yoniEn: "Tiger", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಹರಿಣ", yoniEn: "Deer", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಹರಿಣ", yoniEn: "Deer", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಶ್ವಾನ", yoniEn: "Dog", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ವಾನರ", yoniEn: "Monkey", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ನಕುಲ", yoniEn: "Mongoose", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ವಾನರ", yoniEn: "Monkey", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" },
    { yoniKn: "ಸಿಂಹ", yoniEn: "Lion", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಅಶ್ವ", yoniEn: "Horse", ganaKn: "ರಾಕ್ಷಸ", ganaEn: "Rakshasa", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಸಿಂಹ", yoniEn: "Lion", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಆದಿ", nadiEn: "Adi" },
    { yoniKn: "ಗೌ", yoniEn: "Cow", ganaKn: "ಮಾನವ", ganaEn: "Manushya", nadiKn: "ಮಧ್ಯ", nadiEn: "Madhya" },
    { yoniKn: "ಗಜ", yoniEn: "Elephant", ganaKn: "ದೇವ", ganaEn: "Deva", nadiKn: "ಅಂತ್ಯ", nadiEn: "Antya" }
  ];
  return list[i]!;
}
