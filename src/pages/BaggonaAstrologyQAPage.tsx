import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore, type SupportedLanguage } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useDevoteeHistoryStore } from "../stores/devoteeHistoryStore";
import {
  askBaggonaAstrology,
  type AstrologyQAResponse,
  type AstrologyQASection,
  type BirthDetailsInput,
  type PersonalHoroscopeData
} from "../services/astrologyQAService";
import {
  calculateTraditionalBaggona,
  type TraditionalBaggonaPanchanga
} from "../core/TraditionalBaggonaEngine";
import {
  calculateInstantPrashnaClock,
  type InstantPrashnaClock
} from "../core/instantPrashnaEngine";
import type { AskGeminiChatTurn } from "../core/GeminiEngine";

interface ChatTurnItem {
  id: string;
  sender: "user" | "astrologer";
  question?: string;
  response?: AstrologyQAResponse;
  rawText?: string;
  timestamp: string;
}

/**
 * Converts pada number 1..4 to Kannada numeral string (೧, ೨, ೩, ೪)
 */
function toKannadaPadaNumber(pada: number): string {
  const map: Record<number, string> = { 1: "೧", 2: "೨", 3: "೩", 4: "೪" };
  return map[pada] || String(pada);
}

/**
 * Returns an authentic Vedic celestial symbol for each planetary highlight item
 */
function getPlanetaryHighlightIcon(highlight: string): string {
  const hLower = highlight.toLowerCase();
  if (hLower.includes("lagna") || hLower.includes("ಲಗ್ನ")) return "☀️";
  if (hLower.includes("moon") || hLower.includes("ರಾಶಿ")) return "🌙";
  if (hLower.includes("nakshatra") || hLower.includes("ನಕ್ಷತ್ರ")) return "⭐";
  if (hLower.includes("dasha") || hLower.includes("ದಶಾ")) return "⏳";
  if (hLower.includes("7th") || hLower.includes("marriage") || hLower.includes("ವಿವಾಹ")) return "💍";
  if (hLower.includes("4th") || hLower.includes("vehicle") || hLower.includes("ವಾಹನ")) return "🚗";
  if (hLower.includes("10th") || hLower.includes("career") || hLower.includes("ವೃತ್ತಿ")) return "💼";
  return "✨";
}

/**
 * Formats section content with luxury Indic book typography and structured visual elements
 */
function renderSectionContent(
  sec: AstrologyQASection,
  sIdx: number,
  lang: SupportedLanguage
): JSX.Element {
  // Strip any lingering markdown formatting debris
  const cleanRaw = sec.content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/[*#]/g, "")
    .trim();

  // 1. Section 2: Sacred Remedies (ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ)
  if (sIdx === 2) {
    // Check if the content contains numbered items like ೧., ೨., ೩. or 1., 2., 3.
    const itemRegex = /(?:^|\n)\s*([೧೨೩೪1234]\.|\d\.)\s*/;
    const parts = cleanRaw.split(itemRegex).filter((p) => p.trim().length > 0);

    if (parts.length >= 2) {
      const remedies: { num: string; title: string; body: string }[] = [];
      for (let i = 0; i < parts.length; i += 2) {
        const num = (parts[i] || "").replace(".", "").trim();
        const rawBody = (parts[i + 1] || "").trim();
        if (!num || !rawBody) continue;

        const colonIdx = rawBody.indexOf(":");
        let title = "";
        let body = rawBody;
        if (colonIdx !== -1 && colonIdx < 60) {
          title = rawBody.substring(0, colonIdx).trim();
          body = rawBody.substring(colonIdx + 1).trim();
        } else {
          const firstPeriod = rawBody.indexOf(".");
          if (firstPeriod !== -1 && firstPeriod < 50) {
            title = rawBody.substring(0, firstPeriod).trim();
            body = rawBody.substring(firstPeriod + 1).trim();
          } else {
            title = rawBody;
            body = "";
          }
        }
        remedies.push({ num, title, body });
      }

      if (remedies.length > 0) {
        return (
          <div className="space-y-3 mt-2">
            {remedies.map((rem, remIdx) => {
              const isTempleSeva = /ಗೋಕರ್ಣ|ಇಡಗುಂಜಿ|ಸುಬ್ರಹ್ಮಣ್ಯ|Gokarna|Idagunji|Subramanya|ದೇವಸ್ಥಾನ|Temple/i.test(
                rem.title + " " + rem.body
              );

              return (
                <div
                  key={remIdx}
                  className="rounded-xl border border-amber-300/70 dark:border-amber-800/70 bg-white/90 dark:bg-slate-900/90 p-3.5 sm:p-4 shadow-xs transition-all hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold font-serif text-xs sm:text-sm flex items-center justify-center shadow-xs">
                      {rem.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h6 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 font-serif baggona-book-typography">
                          {rem.title}
                        </h6>
                        {isTempleSeva && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/50">
                            🛕 {lang === "kn" ? "ಕ್ಷೇತ್ರ ಸೇವೆ" : "Temple Seva"}
                          </span>
                        )}
                      </div>
                      {rem.body && (
                        <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif baggona-book-typography mt-1">
                          {rem.body}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    }
  }

  // 2. Section 1: Timing & Muhurtha (ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ)
  if (sIdx === 1) {
    const lines = cleanRaw.split("\n").filter((l) => l.trim().length > 0);
    return (
      <div className="space-y-2.5 mt-2">
        {lines.map((line, lIdx) => {
          const isAvoid = /ವರ್ಜ್ಯ|ತ್ಯಜಿಸ|ಬಿಡಬೇಕು|avoid|rahu|ರಾಹುಕಾಲ|ಯಮಗಂಡ/i.test(line);
          const colonIdx = line.indexOf(":");
          const hasColon = colonIdx !== -1 && colonIdx < 50;

          if (isAvoid) {
            return (
              <div
                key={lIdx}
                className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-rose-950 dark:text-rose-200 font-serif baggona-book-typography leading-relaxed"
              >
                <span className="text-base flex-shrink-0">⚠️</span>
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-300 mr-1.5">
                    {lang === "kn" ? "ವರ್ಜ್ಯ ಕಾಲ:" : "Times to Avoid:"}
                  </span>
                  <span>{line.replace(/^[೧೨೩೪1234]\.\s*/, "").replace(/^ವರ್ಜ್ಯ ಸಮಯ:\s*/, "")}</span>
                </div>
              </div>
            );
          }

          if (hasColon) {
            const label = line.substring(0, colonIdx).replace(/^[೧೨೩೪1234]\.\s*/, "").trim();
            const val = line.substring(colonIdx + 1).trim();
            return (
              <div
                key={lIdx}
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/80 p-3 sm:p-3.5 flex items-start gap-2.5 shadow-xs"
              >
                <span className="text-base flex-shrink-0">🗓️</span>
                <div className="text-xs sm:text-sm font-serif baggona-book-typography leading-relaxed text-stone-800 dark:text-stone-200">
                  <span className="font-bold text-amber-950 dark:text-amber-200 mr-1.5">{label}:</span>
                  <span>{val}</span>
                </div>
              </div>
            );
          }

          return (
            <p
              key={lIdx}
              className="text-xs sm:text-sm font-serif baggona-book-typography leading-relaxed text-stone-800 dark:text-stone-200"
            >
              {line}
            </p>
          );
        })}
      </div>
    );
  }

  // 3. Section 3: Priest Verdict & Blessing (ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ)
  if (sIdx === 3) {
    const sealMatch = cleanRaw.match(/॥\s*(.+?)\s*॥/);
    const blessingSeal = sealMatch ? `॥ ${sealMatch[1]} ॥` : "॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥";
    const bodyWithoutSeal = cleanRaw.replace(/॥\s*(.+?)\s*॥/g, "").trim();

    return (
      <div className="space-y-4 mt-2">
        <p className="text-sm sm:text-base font-serif baggona-book-typography leading-relaxed text-amber-950 dark:text-amber-100 italic">
          "{bodyWithoutSeal}"
        </p>

        {/* Sacred Priest Seal */}
        <div className="pt-3 border-t border-amber-300/60 dark:border-amber-700/60 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border border-amber-400/50 text-xs sm:text-sm font-bold font-serif text-amber-900 dark:text-amber-300 tracking-wider shadow-xs">
            {blessingSeal}
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-amber-900/80 dark:text-amber-400">
            <a
              href="tel:9972339362"
              className="inline-flex items-center gap-1 font-semibold hover:underline"
            >
              <span>📞</span>
              <span>{lang === "kn" ? "ಪಂಡಿತರ ಸಂಪರ್ಕ: 9972339362" : "Priest Contact: 9972339362"}</span>
            </a>
            <span>•</span>
            <a
              href="https://wa.me/919972339362"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:underline text-emerald-700 dark:text-emerald-400"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default Section 0: Classical Shastra (ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ)
  const paragraphs = cleanRaw.split(/\n+/).filter((p) => p.trim().length > 0);
  return (
    <div className="space-y-3 mt-2">
      {paragraphs.map((para, pIdx) => {
        return (
          <p
            key={pIdx}
            className="text-xs sm:text-sm font-serif baggona-book-typography leading-[1.85] text-stone-900 dark:text-stone-100"
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}

interface PersonalHoroscopeCardProps {
  data: PersonalHoroscopeData;
  lang: SupportedLanguage;
  detectedIntent?: string;
}

function PersonalHoroscopeCard({
  data,
  lang,
  detectedIntent
}: PersonalHoroscopeCardProps): JSX.Element {
  const initialTab =
    detectedIntent === "aarogya_health"
      ? "aarogya"
      : detectedIntent === "ayush_longevity"
      ? "ayush"
      : detectedIntent === "namakarana_naming"
      ? "namakarana"
      : detectedIntent === "comprehensive_dosha_shanti"
      ? "doshas"
      : "overview";

  const [activeTab, setActiveTab] = useState<"overview" | "aarogya" | "ayush" | "namakarana" | "doshas">(initialTab);

  return (
    <div className="m-5 sm:m-6 mb-2 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 dark:from-amber-950/70 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-300/70 dark:border-amber-700/60 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🕉️</span>
          <div>
            <h5 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 font-serif baggona-book-typography">
              {lang === "kn"
                ? "॥ ಬಗ್ಗೋಣ ವೈಯಕ್ತಿಕ ಜನ್ಮಕುಂಡಲಿ, ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ನಿರ್ಣಯ ॥"
                : "Baggona Personal Horoscope, Health & Longevity Determination"}
            </h5>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300 font-serif">
              {lang === "kn"
                ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಭಾವ ರೋಗ-ಆಯುರ್ದಾಯ & ಅವಕಹಡಾ ಚಕ್ರ ಗಣಿತ"
                : "Parashara Hora Shastra, Bhava Roga-Ayurdaya & Avakahada Chakra Math"}
            </p>
          </div>
        </div>

        {/* Devotee Info Pill */}
        <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5">
          <span>👤 {data.name}</span>
          <span>•</span>
          <span>{data.birthDate}</span>
          <span>•</span>
          <span>{data.place} {data.pincode ? `(${data.pincode})` : ""}</span>
        </div>
      </div>

      {/* Astronomical Key Positions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-xs">
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/80 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
            ☀️ {lang === "kn" ? "ಲಗ್ನ (Ascendant)" : "Lagna"}
          </span>
          <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
            {data.lagnaRashiKn} ({data.lagnaDegree.toFixed(1)}°)
          </span>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/80 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
            🌙 {lang === "kn" ? "ಜನ್ಮ ರಾಶಿ (Moon Sign)" : "Moon Sign"}
          </span>
          <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
            {data.moonRashiKn}
          </span>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/80 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
            ⭐ {lang === "kn" ? "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪಾದ" : "Nakshatra & Pada"}
          </span>
          <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
            {data.moonNakshatraKn} • {toKannadaPadaNumber(data.moonPada)}ನೇ ಪಾದ
          </span>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/80 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
            🌞 {lang === "kn" ? "ಸೂರ್ಯ ರಾಶಿ" : "Sun Sign"}
          </span>
          <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
            {data.sunRashiKn}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/80 dark:border-slate-800">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
            ⏳ {lang === "kn" ? "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ" : "Running Dasha"}
          </span>
          <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
            {data.currentMahadashaKn} - {data.currentAntardashaKn}
          </span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-1.5 mt-3.5 pb-2 border-b border-amber-200/70 dark:border-slate-800 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white/70 dark:bg-slate-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🌟</span>
          <span>{lang === "kn" ? "ಸಾರಾಂಶ" : "Overview"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("aarogya")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "aarogya"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white/70 dark:bg-slate-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🩺</span>
          <span>{lang === "kn" ? "ಆರೋಗ್ಯ & ರೋಗ" : "Health & 6th House"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ayush")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "ayush"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white/70 dark:bg-slate-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>⏳</span>
          <span>{lang === "kn" ? "ಆಯುಷ್ಯ ನಿರ್ಣಯ" : "Longevity & Ayush"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("namakarana")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "namakarana"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white/70 dark:bg-slate-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>👶</span>
          <span>{lang === "kn" ? "ನಾಮಕರಣ" : "Baby Naming"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doshas")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "doshas"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white/70 dark:bg-slate-800 text-amber-950 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🛡️</span>
          <span>{lang === "kn" ? `ದೋಷಗಳು (${data.doshas.activeCount})` : `Doshas (${data.doshas.activeCount})`}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-3.5">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Aarogya Quick Panel */}
            <div
              onClick={() => setActiveTab("aarogya")}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-950 dark:text-amber-200 font-serif flex items-center gap-1">
                  <span>🩺</span>
                  <span>{lang === "kn" ? "ಆರೋಗ್ಯ & ರೋಗ ಭಾವ" : "Health & Vitality"}</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {data.aarogya.tridoshaKn}
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif line-clamp-2">
                {data.aarogya.vitalitySummaryKn}
              </p>
              <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>ಪರಿಹಾರ: {data.aarogya.remedialHomasKn[0] || "ಧನ್ವಂತರಿ ಹೋಮ"}</span>
                <span>→</span>
              </div>
            </div>

            {/* Ayush Quick Panel */}
            <div
              onClick={() => setActiveTab("ayush")}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-950 dark:text-amber-200 font-serif flex items-center gap-1">
                  <span>⏳</span>
                  <span>{lang === "kn" ? "ಆಯುಷ್ಯ ನಿರ್ಣಯ & ರಕ್ಷೆ" : "Longevity & Ayush"}</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {data.ayush.longevityCategoryKn}
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif line-clamp-2">
                {data.ayush.ayurBhavaKn}
              </p>
              <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>ಮಂತ್ರ: ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ</span>
                <span>→</span>
              </div>
            </div>

            {/* Namakarana Quick Panel */}
            <div
              onClick={() => setActiveTab("namakarana")}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-950 dark:text-amber-200 font-serif flex items-center gap-1">
                  <span>👶</span>
                  <span>{lang === "kn" ? "ನಾಮಕರಣ ನಾಮಾಕ್ಷರ" : "Namakarana Syllables"}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  '{data.namakarana.canonicalSyllableKn}'
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                {lang === "kn" ? "ಶುಭ ಹೆಸರುಗಳು:" : "Recommended:"} {data.namakarana.sampleNamesKn.slice(0, 4).join(", ")}
              </p>
              <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>ಗಣ: {data.namakarana.ganaKn} • ನಾಡಿ: {data.namakarana.nadiKn}</span>
                <span>→</span>
              </div>
            </div>

            {/* Dosha Quick Panel */}
            <div
              onClick={() => setActiveTab("doshas")}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/80 dark:border-slate-800 hover:border-amber-400 cursor-pointer transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-950 dark:text-amber-200 font-serif flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{lang === "kn" ? "ದೋಷಗಳು & ಪರಿಹಾರ" : "Doshas & Remedies"}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.doshas.activeCount === 0 ? "text-emerald-800 bg-emerald-100" : "text-amber-900 bg-amber-200"
                }`}>
                  {data.doshas.activeCount === 0 ? "ದೋಷಮುಕ್ತ" : `${data.doshas.activeCount} ಪತ್ತೆ`}
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                {data.doshas.doshaList.length > 0
                  ? data.doshas.doshaList.map(d => d.nameKn).join(", ")
                  : data.doshas.gandantaSummaryKn || "ಕುಂಡಲಿ ಶುದ್ಧವಾಗಿದೆ."}
              </p>
              <div className="mt-2 text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>ಗೋಕರ್ಣ ಶಾಂತಿ ವಿವರಗಳು</span>
                <span>→</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Aarogya Tab */}
        {activeTab === "aarogya" && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1">
                  🌿 ತ್ರಿದೋಷ ವಿಶ್ಲೇಷಣೆ (Tridosha)
                </span>
                <p className="text-xs font-serif font-bold text-amber-950 dark:text-amber-100">
                  {data.aarogya.tridoshaKn}
                </p>
                <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif mt-1">
                  {data.aarogya.vitalitySummaryKn}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1">
                  🏥 ರೋಗ ಮತ್ತು ಆಯುರ್-ಭಾವಾಧಿಪತಿಗಳು (6th & 8th Lords)
                </span>
                <p className="text-[11px] text-stone-800 dark:text-stone-200 font-serif">
                  {data.aarogya.sixthHouseSummaryKn}
                </p>
                <p className="text-[11px] text-stone-800 dark:text-stone-200 font-serif mt-1">
                  {data.aarogya.eighthHouseSummaryKn}
                </p>
              </div>
            </div>

            {data.aarogya.cautionsKn.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60">
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 block mb-1">
                  ⚠️ ಗಮನಿಸಬೇಕಾದ ಶಾರೀರಿಕ ಅಂಗಗಳು & ಮುನ್ನೆಚ್ಚರಿಕೆ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.aarogya.cautionsKn.map((c, idx) => (
                    <span key={idx} className="bg-white/90 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] text-stone-800 dark:text-stone-200 font-serif">
                      • {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/60">
              <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                🛕 ಶಾಸ್ತ್ರೋಕ್ತ ಧನ್ವಂತರಿ & ಆಯುಷ್ಯ ಪರಿಹಾರ ಹೋಮಗಳು:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.aarogya.remedialHomasKn.map((h, idx) => (
                  <span key={idx} className="bg-white/90 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-300/70 text-xs font-semibold text-emerald-950 dark:text-emerald-200 font-serif">
                    🕉️ {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Ayush Tab */}
        {activeTab === "ayush" && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1">
                  ⏳ ಪರಾಶರಿ ಆಯುರ್ದಾಯ ವರ್ಗ (Longevity Category)
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold text-xs font-serif mb-1.5 border border-emerald-300/60">
                  {data.ayush.longevityCategoryKn} ({data.ayush.longevityCategoryEn})
                </span>
                <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                  {data.ayush.ayurBhavaKn}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1">
                  🪐 ಆಯುಷ್ಕಾರಕ ಶನಿ & ಮಾರಕ ಗ್ರಹ ಸ್ಥಿತಿ
                </span>
                <p className="text-[11px] text-stone-800 dark:text-stone-200 font-serif">
                  {data.ayush.saturnPlacementKn}
                </p>
                <p className="text-[11px] text-stone-800 dark:text-stone-200 font-serif mt-1">
                  {data.ayush.marakaGrahasKn}
                </p>
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-serif mt-1 font-semibold">
                  {data.ayush.protectiveYogasKn}
                </p>
              </div>
            </div>

            {/* Sacred Maha Mrityunjaya Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-100/80 via-orange-50 to-amber-100/70 dark:from-amber-950/60 dark:to-slate-900 border-2 border-amber-400/80 text-center">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1 font-serif uppercase tracking-wider">
                🛡️ ದೈವಿಕ ಸಂರಕ್ಷಕ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ಮಂತ್ರ
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 font-serif leading-relaxed">
                {data.ayush.mrityunjayaMantra}
              </p>
              <p className="text-[10px] text-amber-800 dark:text-amber-400 font-serif mt-1.5">
                ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ೧೦೮ ಬಾರಿ ಅಥವಾ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕದೊಂದಿಗೆ ಜಪಿಸುವುದು ಪರಮ ಶ್ರೇಯಸ್ಕರ.
              </p>
            </div>
          </div>
        )}

        {/* 4. Namakarana Tab */}
        {activeTab === "namakarana" && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                  🔤 ಜನ್ಮ ನಕ್ಷತ್ರ ಪಾದದ ಪ್ರಧಾನ ನಾಮಾಕ್ಷರ (Primary Syllable)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-amber-900 dark:text-amber-200 font-serif">
                    '{data.namakarana.canonicalSyllableKn}'
                  </span>
                  <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">
                    ({data.namakarana.canonicalSyllableEn})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                  ⭐ ಸಮಸ್ತ ನಕ್ಷತ್ರ ನಾಮಾಕ್ಷರಗಳು
                </span>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-100 font-serif">
                  {data.namakarana.allSyllablesKn.join(", ")}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1.5">
                👶 ಶಾಸ್ತ್ರೋಕ್ತ ಶುಭ ಶಿಶು ನಾಮಾವಳಿ (Recommended Vedic Baby Names):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.namakarana.sampleNamesKn.map((n, idx) => (
                  <span key={idx} className="bg-amber-100/70 dark:bg-slate-800 px-3 py-1 rounded-lg border border-amber-300/60 text-xs font-bold text-amber-950 dark:text-amber-100 font-serif">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">🦁 ಗಣ</span>
                <span className="font-bold text-amber-950 dark:text-amber-100 font-serif">{data.namakarana.ganaKn}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">🐾 ಯೋನಿ</span>
                <span className="font-bold text-amber-950 dark:text-amber-100 font-serif">{data.namakarana.animalYoniKn}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">🧬 ನಾಡಿ</span>
                <span className="font-bold text-amber-950 dark:text-amber-100 font-serif">{data.namakarana.nadiKn}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">🔥 ತತ್ತ್ವ</span>
                <span className="font-bold text-amber-950 dark:text-amber-100 font-serif">{data.namakarana.elementKn}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Doshas Tab */}
        {activeTab === "doshas" && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/70 dark:border-slate-800">
              <span className="font-bold text-amber-950 dark:text-amber-200 font-serif flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{lang === "kn" ? "ಪರಾಶರಿ ಸರ್ವ ದೋಷ ಪರೀಕ್ಷೆ:" : "Parashari Comprehensive Dosha Report:"}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                data.doshas.activeCount === 0 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                {data.doshas.activeCount === 0 ? "ಯಾವುದೇ ದೋಷವಿಲ್ಲ" : `${data.doshas.activeCount} ದೋಷಗಳು ಸಕ್ರಿಯ`}
              </span>
            </div>

            {data.doshas.doshaList.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-950 dark:text-emerald-200 font-serif">
                ✓ ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷ, ಕಾಲಸರ್ಪ ದೋಷ ಅಥವಾ ಪಿತೃ ದೋಷಗಳಿಲ್ಲ. ಗ್ರಹ ಸ್ಥಿತಿಗಳು ಅನುಕೂಲಕರವಾಗಿವೆ.
              </div>
            ) : (
              <div className="space-y-2">
                {data.doshas.doshaList.map((d, dIdx) => (
                  <div key={dIdx} className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-300/80 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
                        ⚠️ {d.nameKn}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md">
                        {d.severityKn}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                      {d.technicalWhyKn}
                    </p>
                    <div className="mt-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300 font-serif flex items-center gap-1">
                      <span>🛕 ಪರಿಹಾರ:</span>
                      <span>{d.pariharaKn}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.doshas.gandantaSummaryKn && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 text-[11px] text-amber-950 dark:text-amber-200 font-serif">
                <span className="font-bold">⭐ ಗಂಡಾಂತ ಸ್ಥಿತಿ: </span>
                <span>{data.doshas.gandantaSummaryKn}</span>
              </div>
            )}

            {data.doshas.sadeSatiSummaryKn && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 text-[11px] text-amber-950 dark:text-amber-200 font-serif">
                <span className="font-bold">🪐 ಸಾಡೇಸಾತಿ ಗೋಚಾರ ಸ್ಥಿತಿ: </span>
                <span>{data.doshas.sadeSatiSummaryKn}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BaggonaAstrologyQAPage(): JSX.Element {
  const { t } = useTranslation();
  const appLanguage = useAppStore((s) => s.language);
  const setAppLanguage = useAppStore((s) => s.setLanguage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const defaultPlace = useAppStore((s) => s.placeLabel);

  const session = useKundliViewerStore((s) => s.session);
  const devoteeRecords = useDevoteeHistoryStore((s) => s.records);

  // Language state (default to Kannada per user requirement)
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(
    appLanguage || "kn"
  );

  // Question & consultation state
  const [inputText, setInputText] = useState("");
  const [chatItems, setChatItems] = useState<ChatTurnItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  // Optional birth details panel
  const [showBirthDetails, setShowBirthDetails] = useState(false);
  const [birthDetails, setBirthDetails] = useState<BirthDetailsInput>({
    name: session?.input.name || "",
    birthDate: session?.input.birthDate || "",
    birthTime: session?.input.birthTime || "",
    place: session?.input.name ? defaultPlace : "",
    latitude: defaultLat,
    longitude: defaultLng,
    gender: "Male"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-fill from active Kundali session if available
  useEffect(() => {
    if (session) {
      setBirthDetails((prev) => ({
        ...prev,
        name: prev.name || session.input.name,
        birthDate: prev.birthDate || session.input.birthDate,
        birthTime: prev.birthTime || session.input.birthTime,
        place: prev.place || defaultPlace,
        latitude: session.input.latitude || defaultLat,
        longitude: session.input.longitude || defaultLng
      }));
    }
  }, [session, defaultPlace, defaultLat, defaultLng]);

  // Scroll to bottom on new item
  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === "function") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatItems, isLoading]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Real-time Baggona Panchanga & Prashna Clock
  const liveBaggona = useMemo(() => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]!;
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const lat = defaultLat || 14.5479;
      const lng = defaultLng || 74.3188;
      const p = calculateTraditionalBaggona(dateStr, timeStr, lat, lng);
      const clk = calculateInstantPrashnaClock(0, now, lat, lng);
      return { p, clk };
    } catch (e) {
      console.error("[BaggonaAstrologyQAPage] Live Panchanga calculation error:", e);
      return { p: null, clk: null };
    }
  }, [defaultLat, defaultLng]);

  // Quick Preset Questions
  const PRESET_QUESTIONS: { labelKn: string; labelEn: string; promptKn: string; promptEn: string; icon: string }[] = [
    {
      icon: "🩺",
      labelKn: "ಆರೋಗ್ಯ & ರೋಗ ಭಾವ ವಿಚಾರ",
      labelEn: "Health & 6th House",
      promptKn: "ಹೆಸರು ವಿನಾಯಕ, ಹುಟ್ಟಿದ ದಿನಾಂಕ 1990-05-15, ಸಮಯ 10:30 AM, ಗೋಕರ್ಣ 581326. ನನ್ನ ಆರೋಗ್ಯ, ೬ನೇ ಭಾವ ಮತ್ತು ದೈವಿಕ ಪರಿಹಾರ ತಿಳಿಸಿ.",
      promptEn: "Name: Vinayaka, DOB: 1990-05-15, TOB: 10:30 AM, Gokarna 581326. Please evaluate my Health, 6th house, and remedies."
    },
    {
      icon: "⏳",
      labelKn: "ಆಯುಷ್ಯ ನಿರ್ಣಯ & ಮೃತ್ಯುಂಜಯ",
      labelEn: "Longevity & Ayush",
      promptKn: "ಹೆಸರು ರಮೇಶ್, ದಿನಾಂಕ 1985-11-20, ಸಮಯ 14:45, ಬೆಂಗಳೂರು 560001. ಆಯುಷ್ಯ ನಿರ್ಣಯ, ೮ನೇ ಭಾವ ಮತ್ತು ಮೃತ್ಯುಂಜಯ ಕವಚ ತಿಳಿಸಿ.",
      promptEn: "Name: Ramesh, DOB: 1985-11-20, TOB: 14:45, Bangalore 560001. Please calculate Ayush, longevity category, and Mrityunjaya Kavacha."
    },
    {
      icon: "👶",
      labelKn: "ನಾಮಕರಣ & ಶುಭ ನಾಮಾಕ್ಷರ",
      labelEn: "Baby Naming & Syllables",
      promptKn: "ಮಗುವಿನ ಜನನ ದಿನಾಂಕ 2026-03-10, ಸಮಯ ಬೆಳಿಗ್ಗೆ 06:30, ಕುಮಟಾ. ನಾಮಕರಣಕ್ಕೆ ಬರುವ ನಾಮಾಕ್ಷರ ಮತ್ತು ಶುಭ ಹೆಸರುಗಳು ಯಾವುವು?",
      promptEn: "Baby born on 2026-03-10 at 06:30 AM, Kumta. What are the auspicious Namakarana syllables and recommended baby names?"
    },
    {
      icon: "🛡️",
      labelKn: "ಸರ್ವ ದೋಷ & ಗೋಕರ್ಣ ಶಾಂತಿ",
      labelEn: "Doshas & Shanti Parihara",
      promptKn: "ಹೆಸರು ಕುಮಾರ್, ದಿನಾಂಕ 1995-04-25, ಸಮಯ 08:30 AM, ಹೊನ್ನಾವರ 581334. ನನ್ನ ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷ, ಕಾಲಸರ್ಪ ಅಥವಾ ಪಿತೃ ದೋಷವಿದೆಯೇ?",
      promptEn: "Name: Kumar, DOB: 1995-04-25, TOB: 08:30 AM, Honnavar 581334. Are there Kuja Dosha, Kala Sarpa, or Pitru Dosha in my chart?"
    },
    {
      icon: "⚱️",
      labelKn: "ಶ್ರಾದ್ಧ ತಿಥಿ & ಮರಣ ಗಣಿತ",
      labelEn: "Shraddha Tithi & Demise Math",
      promptKn: "ತೀರಿಕೊಂಡ ದಿನಾಂಕ 2023-04-12, ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಆ ದಿನದ ತಿಥಿ, ನಕ್ಷತ್ರ ಮತ್ತು 2026ನೇ ಸಾಲಿನ ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧ ದಿನಾಂಕ ಯಾವಾಗ ಬರುತ್ತದೆ?",
      promptEn: "Person died on 2023-04-12, what was the Tithi, Nakshatra, and when will Pratyabdika Shraddha fall in 2026?"
    },
    {
      icon: "🏢",
      labelKn: "ಹೊಟೇಲ್ / ವ್ಯಾಪಾರ ಒಪ್ಪಿಸುವ ಮುಹೂರ್ತ (ಋಣ ಮುಕ್ತಿ)",
      labelEn: "Hotel Surrender & Debt Clearance",
      promptKn: "ಹೊಟೇಲ್ ಗುತ್ತಿಗೆ ಒಪ್ಪಿಸಲು ಅಥವಾ ವ್ಯಾಪಾರ ಸಮಾಪ್ತಿ ಮಾಡಲು ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಋಣ ವಿಮೋಚನಾ ಶುಭ ಮುಹೂರ್ತ ಯಾವುದು?",
      promptEn: "What is the best auspicious Muhurtha to surrender a hotel or close commercial business according to Baggona Panchanga?"
    },
    {
      icon: "🪔",
      labelKn: "ಗಣೇಶ ಚತುರ್ಥಿ & ಹಬ್ಬಗಳ ದಿನಾಂಕ",
      labelEn: "Ganesha Chaturthi & Festivals",
      promptKn: "ಈ ವರ್ಷದ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ) ಯಾವಾಗ ಬರುತ್ತದೆ ಮತ್ತು ಪೂಜಾ ಮುಹೂರ್ತ ತಿಳಿಸಿ.",
      promptEn: "When is Varasiddhi Vinayaka Vrata (Ganesha Chaturthi) celebrated this year and what is the Puja Muhurtha?"
    },
    {
      icon: "⭐",
      labelKn: "ಹಿರಣ್ಯಾಕ್ಷ ನಾಮಾಕ್ಷರ ನಕ್ಷತ್ರ (ಪುನರ್ವಸು ೪)",
      labelEn: "Hiranyaksha Star Lookup (Punarvasu 4)",
      promptKn: "ಹಿರಣ್ಯಾಕ್ಷ (Hiranyaksha) ಯಾರ ಹೆಸರು ಮತ್ತು ಯಾವ ನಕ್ಷತ್ರ, ಪಾದ, ರಾಶಿಗೆ ಸೇರುತ್ತದೆ? ಅವಕಹಡಾ ಚಕ್ರದ ಪ್ರಕಾರ ನಿಖರ ವಿವರಣೆ ನೀಡಿ.",
      promptEn: "Hiranya Aksha whose name it is, which nakshatra, pada, and rashi does it belong to according to Avakahada Chakra?"
    },
    {
      icon: "🕉️",
      labelKn: "ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಹೋರಾ",
      labelEn: "Today's Baggona Panchanga & Hora",
      promptKn: "ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ, ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ ಮತ್ತು ಪ್ರಸ್ತುತ ಶುಭ ಹೋರಾ ಸಮಯದ ಸಂಪೂರ್ಣ ವಿವರಣೆ ತಿಳಿಸಿ.",
      promptEn: "Please give today's Baggona Panchanga details: Tithi, Nakshatra, Yoga, Karana, and current auspicious Hora timing."
    },
    {
      icon: "🔮",
      labelKn: "ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ (ಕಾರ್ಯ ಸಿದ್ಧಿ ಮುಹೂರ್ತ)",
      labelEn: "Horary Prashna (Task Success)",
      promptKn: "ಈಗ ಕೈಗೊಳ್ಳುವ ಕೆಲಸವು ಜಯಪ್ರದವಾಗುವುದೇ? ಪ್ರಸ್ತುತ ಪ್ರಶ್ನ ಲಗ್ನ ಮತ್ತು ಚೋಘಡಿಯಾ ಫಲವೇನು?",
      promptEn: "Will the task initiated right now be successful? What is the Prashna Lagna and Choghadiya indication?"
    },
    {
      icon: "🌟",
      labelKn: "ಮೂಲಾ ೧ನೇ ಪಾದ ಶಾಂತಿ",
      labelEn: "Mula 1st Pada Dosha",
      promptKn: "ನನ್ನ ಸ್ನೇಹಿತನ ಮಗ ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದದಲ್ಲಿ ಜನಿಸಿದ್ದಾನೆ, ಇದು ಅಪಾಯವೇ? ಯಾವ ಶಾಂತಿ ಮತ್ತು ಪೂಜೆ ಮಾಡಬೇಕು?",
      promptEn: "My friend's son is born in Mula Nakshatra 1st Pada. Is it dangerous? What Shanti and remedies are required?"
    },
    {
      icon: "🚗",
      labelKn: "ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ (ರೇವತಿ / ಮೀನ)",
      labelEn: "Vehicle Purchase Muhurtha",
      promptKn: "ನನ್ನ ಸ್ನೇಹಿತ ರೇವತಿ ನಕ್ಷತ್ರ ಮೀನ ರಾಶಿ, ವಾಹನ ಖರೀದಿಸಲು ಈ ತಿಂಗಳು ಅಥವಾ ಮುಂದಿನ ತಿಂಗಳು ಶುಭ ಮುಹೂರ್ತ ಯಾವುದು?",
      promptEn: "My friend is Revati Nakshatra, Meena Rashi. When can he buy a vehicle, and what is the best Muhurtha this month or next month?"
    },
    {
      icon: "💍",
      labelKn: "ವಿವಾಹ ಕಾಲ & ೭ನೇ ಭಾವ",
      labelEn: "Marriage & 7th House",
      promptKn: "ಮದುವೆ ಯಾವಾಗ ಆಗಬಹುದು? ಸಪ್ತಮ ಭಾವ, ಸಪ್ತಮಾಧಿಪತಿ ಮತ್ತು ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಕಾರ ನಿಖರ ವಿವರಣೆ ನೀಡಿ.",
      promptEn: "When will marriage happen? Please give 7th house, 7th lord, and running Dasha-Bhukti technical analysis."
    },
    {
      icon: "🪐",
      labelKn: "ಸಾಡೇಸಾತಿ ಶನಿ ಪರಿಹಾರ",
      labelEn: "Sade Sati & Shani Parihara",
      promptKn: "ಮೀನ ಮತ್ತು ಕುಂಭ ರಾಶಿಗೆ ಸಾಡೇಸಾತಿ ಶನಿ ಪ್ರಭಾವ ಹೇಗಿದೆ? ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪರಿಹಾರವೇನು?",
      promptEn: "What is the impact of Sade Sati Saturn transit on Meena Rashi, and what are the sacred remedies?"
    }
  ];

  // Speech Recognition (Dictation)
  const toggleDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        activeLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Speech Recognition) ಲಭ್ಯವಿಲ್ಲ."
          : "Speech Recognition is not supported in this browser."
      );
      return;
    }

    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeLang === "kn" ? "kn-IN" : activeLang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsDictating(false);
    }
  };

  // Text to Speech playback
  const handlePlayAudio = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playingItemId === id) {
      window.speechSynthesis.cancel();
      setPlayingItemId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingItemId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      activeLang === "kn"
        ? "kn-IN"
        : activeLang === "hi"
        ? "hi-IN"
        : activeLang === "te"
        ? "te-IN"
        : activeLang === "ta"
        ? "ta-IN"
        : "en-IN";
    utterance.rate = 0.92;

    utterance.onend = () => setPlayingItemId(null);
    utterance.onerror = () => setPlayingItemId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Question Submission
  const handleAskQuestion = async (promptOverride?: string) => {
    const questionText = (promptOverride !== undefined ? promptOverride : inputText).trim();
    if (!questionText || isLoading) return;

    // Reset voice synthesis if playing
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingItemId(null);
    }

    const userTurnId = `user_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user question
    setChatItems((prev) => [
      ...prev,
      {
        id: userTurnId,
        sender: "user",
        rawText: questionText,
        timestamp: timestampStr
      }
    ]);

    setInputText("");
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory: AskGeminiChatTurn[] = chatItems
        .filter((item) => item.rawText || item.response)
        .map((item) => ({
          role: item.sender === "user" ? "user" : "model",
          text: item.rawText || item.response?.fullAnswer || ""
        }));

      const activeBirthDetails: BirthDetailsInput | undefined =
        showBirthDetails && (birthDetails.birthDate || birthDetails.name)
          ? birthDetails
          : undefined;

      const result = await askBaggonaAstrology({
        question: questionText,
        language: activeLang,
        birthDetails: activeBirthDetails,
        conversationHistory,
        geminiApiKey
      });

      const astrologerTurnId = `astro_${Date.now()}`;
      setChatItems((prev) => [
        ...prev,
        {
          id: astrologerTurnId,
          sender: "astrologer",
          question: questionText,
          response: result,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      console.error("[BaggonaAstrologyQAPage] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      
      {/* ── 1. Sacred Royal Hero Header ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white shadow-2xl p-6 sm:p-8 mb-6">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪔</span>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-200 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-400/30">
                ॥ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ & ಪ್ರಶ್ನೋತ್ತರ ॥
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-serif">
              {activeLang === "kn"
                ? "ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಮಹಾವೇದಿಕೆ"
                : activeLang === "hi"
                ? "बग्गोण ज्योतिष प्रश्नोत्तरी महामंच"
                : activeLang === "te"
                ? "బగ్గోణ జ్యోతిష్య ప్రశ్నోత్తర వేదిక"
                : activeLang === "ta"
                ? "பக்கோண ஜோதிட வினா-விடை அரங்கம்"
                : "Baggona Vedic Astrology Consultation & Q&A"}
            </h1>
            <p className="text-sm text-amber-100/90 mt-1.5 max-w-2xl leading-relaxed">
              {activeLang === "kn"
                ? "ಮೂಲಾ ನಕ್ಷತ್ರ ಗಂಡಾಂತ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಯೋಗ, ೭ನೇ ಭಾವ, ಉದ್ಯೋಗ ಅಥವಾ ಯಾವುದೇ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಕೇಳಿ. ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಮಾರ್ಗದರ್ಶನದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತದ ನಿಖರ ಉತ್ತರ ಪಡೆಯಿರಿ."
                : "Ask any Astrology question (Mula Nakshatra 1st Pada, Vehicle Purchase Muhurtha, Marriage 7th House, Career, Sade Sati) in Kannada or English. Receive authentic classical Vedic guidance backed by Baggona Panchanga."}
            </p>
          </div>

          {/* 5-Language Switcher */}
          <div className="flex items-center gap-1.5 bg-amber-950/60 p-1.5 rounded-2xl border border-amber-400/40 backdrop-blur-md self-start md:self-auto shadow-inner">
            {(
              [
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" }
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setActiveLang(l.code);
                  setAppLanguage(l.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeLang === l.code
                    ? "bg-gradient-to-r from-amber-400 to-amber-300 text-amber-950 shadow-md scale-105"
                    : "text-amber-200 hover:text-white hover:bg-amber-800/40"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 1.5. Live Baggona Panchanga & Instant Prashna Clock Banner ────── */}
      {liveBaggona.p && liveBaggona.clk && (
        <div className="mb-6 rounded-3xl border-2 border-amber-300/90 dark:border-amber-700/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-slate-900/90 dark:via-amber-950/20 dark:to-slate-900/90 backdrop-blur-md shadow-xl p-5 sm:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-amber-200/80 dark:border-amber-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xl shadow-md border border-amber-300/60 flex-shrink-0">
                🚩
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100 font-serif baggona-book-typography">
                    {activeLang === "kn"
                      ? "॥ ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಲೈವ್ ಪ್ರಶ್ನ ಮುಹೂರ್ತ ಗಡಿಯಾರ ॥"
                      : "Today's Live Baggona Panchanga & Prashna Clock"}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 dark:bg-amber-950 dark:text-amber-300 border border-amber-400/60">
                    ● {activeLang === "kn" ? "ಲೈವ್ ಜ್ಯೋತಿಷ್ಯ ಕಾಲ" : "Live Celestial Time"}
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-300 font-medium font-serif mt-0.5">
                  {liveBaggona.p.samvatsaraKn} ಸಂವತ್ಸರ • {liveBaggona.p.masaKn} ಮಾಸ • {liveBaggona.p.pakshaKn} • {liveBaggona.p.weekdayKn}
                </p>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <button
              type="button"
              onClick={() =>
                handleAskQuestion(
                  activeLang === "kn"
                    ? "ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ, ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ ಮತ್ತು ಪ್ರಸ್ತುತ ಶುಭ ಹೋರಾ ಸಮಯದ ಸಂಪೂರ್ಣ ವಿವರಣೆ ತಿಳಿಸಿ."
                    : "Please give today's Baggona Panchanga details: Tithi, Nakshatra, Yoga, Karana, and current auspicious Hora timing."
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md transition-all self-start md:self-auto hover:scale-102"
            >
              <span>🕉️</span>
              <span>{activeLang === "kn" ? "ಇಂದಿನ ಪಂಚಾಂಗ ವಿಶ್ಲೇಷಣೆ ಕೇಳಿ" : "Analyze Today's Panchanga"}</span>
            </button>
          </div>

          {/* 5 Angas & Prashna Clock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 text-xs">
            {/* Tithi */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                🌙 {activeLang === "kn" ? "ತಿಥಿ (Tithi)" : "Tithi"}
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif block truncate">
                {liveBaggona.p.tithiKn}
              </span>
              {liveBaggona.p.tithiEndTime && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {activeLang === "kn" ? "ಅಂತ್ಯ:" : "Until:"} {liveBaggona.p.tithiEndTime}
                </span>
              )}
            </div>

            {/* Nakshatra */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                ⭐ {activeLang === "kn" ? "ನಕ್ಷತ್ರ (Star)" : "Nakshatra"}
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif block truncate">
                {liveBaggona.p.moonNakshatraKn}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                ಚಂದ್ರ: {liveBaggona.clk.transitMoonRashiKn}
              </span>
            </div>

            {/* Yoga & Karana */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                🌀 {activeLang === "kn" ? "ಯೋಗ & ಕರಣ" : "Yoga & Karana"}
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif block truncate">
                {liveBaggona.p.yogaKn}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5 truncate">
                ಕರಣ: {liveBaggona.p.karanaKn}
              </span>
            </div>

            {/* Hora */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                ⏳ {activeLang === "kn" ? "ಪ್ರಸ್ತುತ ಹೋರಾ" : "Active Hora"}
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif block truncate">
                {liveBaggona.clk.horaLordKn} ಹೋರಾ
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">
                {liveBaggona.clk.horaSignificanceKn}
              </span>
            </div>

            {/* Choghadiya */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                🛡️ {activeLang === "kn" ? "ಚೋಘಡಿಯಾ" : "Choghadiya"}
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif block truncate">
                {liveBaggona.clk.choghadiyaNameKn}
              </span>
              <span
                className={`text-[10px] font-bold block mt-0.5 truncate ${
                  liveBaggona.clk.choghadiyaQuality === "auspicious" || liveBaggona.clk.choghadiyaQuality === "gainful"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : liveBaggona.clk.choghadiyaQuality === "caution" || liveBaggona.clk.choghadiyaQuality === "inauspicious"
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {liveBaggona.clk.choghadiyaDescKn}
              </span>
            </div>

            {/* Rahu Kalam & Sun Times */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 border border-amber-200/70 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                ☀️ {activeLang === "kn" ? "ಸೂರ್ಯ & ರಾಹುಕಾಲ" : "Sun & Rahu"}
              </span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate">
                {liveBaggona.p.sunrise} - {liveBaggona.p.sunset}
              </span>
              <span
                className={`text-[10px] font-bold block mt-0.5 truncate ${
                  liveBaggona.clk.isRahuKalamActive ? "text-rose-600 font-extrabold" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                ರಾಹು: {liveBaggona.clk.rahuKalamTimeStr}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Optional Birth Details Collapsible Panel ────────── */}
      <div className="mb-6 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md p-4 transition-all">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowBirthDetails(!showBirthDetails)}
            className="flex items-center gap-2.5 text-left text-sm font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 transition-colors"
          >
            <span className="text-lg">{showBirthDetails ? "📂" : "📁"}</span>
            <span>
              {activeLang === "kn"
                ? "ಆಪ್ಷನಲ್ ಜನ್ಮ ವಿವರಗಳು (ನಿಖರ ಕುಂಡಲಿ & ೭ನೇ/೪ನೇ ಭಾವ ವಿಶ್ಲೇಷಣೆಗಾಗಿ)"
                : "Optional Birth Details (For precise Kundali & 7th/4th House analysis)"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-normal">
              {showBirthDetails
                ? activeLang === "kn" ? "ಮುಚ್ಚಿ" : "Hide"
                : activeLang === "kn" ? "ತೆರೆಯಿರಿ" : "Expand"}
            </span>
          </button>

          {showBirthDetails && birthDetails.birthDate && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-300/50">
              ✓ {activeLang === "kn" ? "ಕುಂಡಲಿ ಜೋಡಿಸಲಾಗಿದೆ" : "Birth Chart Linked"}
            </span>
          )}
        </div>

        {showBirthDetails && (
          <div className="mt-4 pt-4 border-t border-amber-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in text-xs">
            {/* Quick Devotee Selector */}
            {devoteeRecords.length > 0 && (
              <div className="sm:col-span-2 md:col-span-4 mb-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {activeLang === "kn" ? "ನೋಂದಾಯಿತ ಭಕ್ತರನ್ನು ಆರಿಸಿ:" : "Select Saved Devotee Profile:"}
                </label>
                <select
                  value={birthDetails.name}
                  onChange={(e) => {
                    const found = devoteeRecords.find((d) => d.name === e.target.value);
                    if (found) {
                      setBirthDetails({
                        name: found.name,
                        birthDate: found.birthDate || "",
                        birthTime: found.birthTime || "",
                        place: found.city || defaultPlace,
                        latitude: found.latitude || defaultLat,
                        longitude: found.longitude || defaultLng,
                        gender: "Male"
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300/70 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">
                    {activeLang === "kn" ? "-- ಹೊಸ ವ್ಯಕ್ತಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ --" : "-- Enter custom details --"}
                  </option>
                  {devoteeRecords.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.birthDate || "No DOB"}) - {d.city || "Baggona"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹೆಸರು (Name)" : "Name"}
              </label>
              <input
                type="text"
                value={birthDetails.name || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                placeholder="e.g. Suresh / ರಾಘವೇಂದ್ರ"
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (DOB)" : "Birth Date"}
              </label>
              <input
                type="date"
                value={birthDetails.birthDate || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ಸಮಯ (Time)" : "Birth Time"}
              </label>
              <input
                type="time"
                value={birthDetails.birthTime || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, birthTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ಸ್ಥಳ (Place)" : "Birth Place"}
              </label>
              <input
                type="text"
                value={birthDetails.place || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                placeholder="e.g. Baggona / Bangalore"
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Quick Suggestion Question Pills ─────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-bold text-amber-900/80 dark:text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <span>💡</span>
          <span>{activeLang === "kn" ? "ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು:" : "Common Inquiries & Quick Prompts:"}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(activeLang === "kn" ? pq.promptKn : pq.promptEn)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-xs font-semibold transition-all shadow-xs hover:scale-102"
            >
              <span>{pq.icon}</span>
              <span>{activeLang === "kn" ? pq.labelKn : pq.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Chat & Consultation Stream ──────────────────────── */}
      <div className="space-y-6 mb-6">
        {chatItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-amber-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <span className="text-5xl block mb-3">🔮</span>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200 font-serif">
              {activeLang === "kn"
                ? "ಯಾವುದೇ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ"
                : "Ask Any Vedic Astrology Question"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              {activeLang === "kn"
                ? "ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಸಪ್ತಮ ಭಾವ, ಸಾಡೇಸಾತಿ ಶನಿ, ಅಥವಾ ಜನ್ಮ ದಿನಾಂಕದೊಂದಿಗೆ ಯಾವುದೇ ವಿಷಯವನ್ನು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಮೂಲಕ ಮಾತನಾಡಿ."
                : "Type your query below or tap the microphone to ask via voice in Kannada or English. You can include birth details or ask general knowledge questions."}
            </p>
          </div>
        ) : (
          chatItems.map((item) => (
            <div key={item.id} className="animate-fade-in">
              {/* User Question Bubble */}
              {item.sender === "user" ? (
                <div className="flex justify-end mb-4">
                  <div className="max-w-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-md">
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {item.rawText}
                    </p>
                    <div className="text-[10px] text-amber-200/80 mt-1 text-right">
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              ) : (
                /* Astrologer Response Card */
                <div className="flex justify-start mb-6">
                  <div className="w-full max-w-4xl rounded-3xl border-2 border-amber-300/80 dark:border-amber-700/80 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
                    
                    {/* Header with Priest Attribution & Actions */}
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/60 dark:via-slate-900 dark:to-slate-950 px-5 sm:px-6 py-4 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xl shadow-md border border-amber-300/60 flex-shrink-0">
                          🕉️
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 font-serif baggona-book-typography">
                              {activeLang === "kn"
                                ? "ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರೀಯ ತೀರ್ಪು"
                                : "Baggona Vedic Astrological Verdict"}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60">
                              ✓ {activeLang === "kn" ? "ಶಾಸ್ತ್ರೋಕ್ತ ನಿಖರತೆ" : "100% Shastra"}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800/90 dark:text-amber-400 font-medium font-serif baggona-book-typography">
                            {activeLang === "kn"
                              ? "ಮಾರ್ಗದರ್ಶನ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸೇವೆ)"
                              : "Guided by Priest Shreeram Pandit (Baggona Panchanga Tradition)"}
                          </p>
                        </div>
                      </div>

                      {/* Controls: Audio Listen, Copy, WhatsApp */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.response && (
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(item.response!.spokenText, item.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                              playingItemId === item.id
                                ? "bg-red-600 text-white animate-pulse shadow-md"
                                : "bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-950/60 dark:to-slate-800 text-amber-950 dark:text-amber-200 border border-amber-300/70 dark:border-amber-700/60 hover:bg-amber-200"
                            }`}
                            title="ದೈವಜ್ಞರ ಧ್ವನಿ ಆಲಿಸಿ / Listen to response"
                          >
                            {playingItemId === item.id ? (
                              <>
                                <span className="flex items-center gap-0.5 h-3">
                                  <span className="w-0.5 h-3 bg-white animate-pulse" />
                                  <span className="w-0.5 h-2 bg-white animate-pulse delay-75" />
                                  <span className="w-0.5 h-3.5 bg-white animate-pulse delay-150" />
                                </span>
                                <span>{activeLang === "kn" ? "ನಿಲ್ಲಿಸಿ" : "Stop"}</span>
                              </>
                            ) : (
                              <>
                                <span>🔊</span>
                                <span>{activeLang === "kn" ? "ಧ್ವನಿ ಆಲಿಸಿ" : "Listen"}</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(item.response?.fullAnswer || "", item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                          title="ಪ್ರತಿಯನ್ನು ನಕಲಿಸಿ / Copy"
                        >
                          <span>{copySuccessId === item.id ? "✓" : "📋"}</span>
                          <span>
                            {copySuccessId === item.id
                              ? activeLang === "kn" ? "ನಕಲಿಸಲಾಗಿದೆ" : "Copied"
                              : activeLang === "kn" ? "ಪ್ರತಿ" : "Copy"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Technical Kundali Badge strip if present */}
                    {item.response?.chartData && (
                      <div className="bg-amber-100/50 dark:bg-slate-800/60 px-5 sm:px-6 py-3 border-b border-amber-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-950 dark:text-amber-300 font-serif baggona-book-typography">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 mr-1 flex items-center gap-1">
                          <span>✨</span>
                          <span>{activeLang === "kn" ? "ಕುಂಡಲಿ ವಿವರಣೆ:" : "Chart Highlights:"}</span>
                        </span>
                        {item.response.chartData.technicalHighlights.map((th, thIdx) => (
                          <span
                            key={thIdx}
                            className="bg-white dark:bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-300/60 dark:border-slate-700 shadow-2xs flex items-center gap-1.5"
                          >
                            <span>{getPlanetaryHighlightIcon(th)}</span>
                            <span>{th}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Avakahada Chakra Name-to-Star Lookup Card */}
                    {item.response?.nameLookupData && (
                      <div className="m-5 sm:m-6 mb-2 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/20 dark:from-amber-950/80 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-5 shadow-lg">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-300/70 dark:border-amber-700/60 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">🕉️</span>
                            <div>
                              <h5 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 font-serif baggona-book-typography">
                                {activeLang === "kn"
                                  ? "॥ ಬೃಹತ್ ಪರಾಶರ ಅವಕಹಡಾ ಚಕ್ರ • ನಾಮಾಕ್ಷರ ನಕ್ಷತ್ರ ನಿರ್ಣಯ ॥"
                                  : "Classical Avakahada Chakra: Name-to-Nakshatra Resolution"}
                              </h5>
                              <p className="text-[11px] text-amber-900/80 dark:text-amber-300 font-serif">
                                {activeLang === "kn"
                                  ? "ನಾಮಾಕ್ಷರ ಧ್ವನಿ ಕಂಪನ ಸಿದ್ಧಾಂತ (೧೦೮ ಪಾದಗಳ ಶಾಸ್ತ್ರೀಯ ವರ್ಗೀಕರಣ)"
                                  : "Sound Vibration Frequency & 108 Pada Catalog"}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-xs">
                            ⭐ {item.response.nameLookupData.nakshatraNameKn} • {toKannadaPadaNumber(item.response.nameLookupData.pada)}ನೇ ಪಾದ ({item.response.nameLookupData.pada}th Pada)
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🏷️ {activeLang === "kn" ? "ಹೆಸರು (Name)" : "Name"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
                              {item.response.nameLookupData.name}
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🔤 {activeLang === "kn" ? "ಆರಂಭಿಕ ಧ್ವನಿ (Sound)" : "Starting Sound"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
                              '{item.response.nameLookupData.syllableKn}' ({item.response.nameLookupData.syllableEn})
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🦀 {activeLang === "kn" ? "ರಾಶಿ & ಅಧಿಪತಿ" : "Rashi & Lord"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm font-serif">
                              {item.response.nameLookupData.rashiNameKn} ({item.response.nameLookupData.rashiLordKn})
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🪐 {activeLang === "kn" ? "ನಕ್ಷತ್ರಾಧಿಪತಿ" : "Star Lord"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
                              {item.response.nameLookupData.nakshatraLordKn}
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🪔 {activeLang === "kn" ? "ಅಧಿದೇವತೆ (Deity)" : "Deity"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
                              {item.response.nameLookupData.deityKn}
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🦁 {activeLang === "kn" ? "ಗಣ (Gana)" : "Gana"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
                              {item.response.nameLookupData.ganaKn} ಗಣ
                            </span>
                          </div>

                          <div className="col-span-2 bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-amber-200/70 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                              🐾 {activeLang === "kn" ? "ಯೋನಿ & ಲಕ್ಷಣ" : "Yoni"}
                            </span>
                            <span className="font-bold text-amber-950 dark:text-amber-100 text-xs font-serif">
                              {item.response.nameLookupData.animalYoniKn}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300/60 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-950 dark:text-amber-200 font-serif">
                          <span>🛡️</span>
                          <span className="font-medium">
                            {activeLang === "kn"
                              ? `ಅವಕಹಡಾ ಸಿದ್ಧಾಂತದಂತೆ '${item.response.nameLookupData.name}' ಹೆಸರು ${item.response.nameLookupData.nakshatraNameKn} ನಕ್ಷತ್ರ ${toKannadaPadaNumber(item.response.nameLookupData.pada)}ನೇ ಪಾದಕ್ಕೆ ಸೇರಿದ್ದು, ಇದು ಯಾವುದೇ ಗಂಡಾಂತ ಅಥವಾ ಮೂಲಾ ದೋಷಕ್ಕೆ ಒಳಪಡುವುದಿಲ್ಲ.`
                              : `Per Avakahada Shastra, the name '${item.response.nameLookupData.name}' strictly maps to ${item.response.nameLookupData.nakshatraNameEn} Pada ${item.response.nameLookupData.pada} and has zero relation to Mula Gandanta.`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Marana & Shraddha Tithi Determination Card */}
                    {item.response?.maranaShraddhaData && (
                      <div className="m-5 sm:m-6 mb-2 rounded-2xl border-2 border-stone-400 bg-gradient-to-br from-stone-100 via-amber-50 to-stone-50 dark:from-stone-900/90 dark:via-slate-900 dark:to-stone-950 p-4 sm:p-5 shadow-lg">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-300/80 dark:border-stone-700/80 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">⚱️</span>
                            <div>
                              <h5 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif baggona-book-typography">
                                {activeLang === "kn"
                                  ? "॥ ಬಗ್ಗೋಣ ಮರಣೋತ್ತರ & ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ ನಿರ್ಣಯ ॥"
                                  : "Baggona Maranottara & Annual Shraddha Tithi Determination"}
                              </h5>
                              <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                                {activeLang === "kn"
                                  ? "ಧರ್ಮಸಿಂಧು & ನಿರ್ಣಯಸಿಂಧು ಅಪರಾಹ್ನ ವ್ಯಾಪ್ತಿ ಸಿದ್ಧಾಂತ"
                                  : "Dharma Sindhu & Nirnaya Sindhu Aparahna Shastra"}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-stone-700 to-amber-900 text-white font-bold text-xs shadow-xs">
                            📅 {item.response.maranaShraddhaData.targetYear} ಶ್ರಾದ್ಧ ದಿನ: {item.response.maranaShraddhaData.pratyabdikaFormattedKn}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-0.5">
                              ⚱️ {activeLang === "kn" ? "ಮರಣ ದಿನಾಂಕ" : "Demise Date"}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif">
                              {item.response.maranaShraddhaData.demiseDate} ({item.response.maranaShraddhaData.demiseWeekdayKn})
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-0.5">
                              🚩 {activeLang === "kn" ? "ಸಂವತ್ಸರ & ಮಾಸ" : "Masa & Paksha"}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif">
                              {item.response.maranaShraddhaData.demiseMasaKn} • {item.response.maranaShraddhaData.demisePakshaKn}
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-0.5">
                              🌙 {activeLang === "kn" ? "ಶ್ರಾದ್ಧ ತಿಥಿ & ನಕ್ಷತ್ರ" : "Demise Tithi"}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif">
                              {item.response.maranaShraddhaData.demiseTithiKn} ({item.response.maranaShraddhaData.demiseNakshatraKn})
                            </span>
                          </div>

                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800">
                            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 block mb-0.5">
                              ⏳ {activeLang === "kn" ? "ಶ್ರಾದ್ಧ ಅಪರಾಹ್ನ ಕಾಲ" : "Aparahna Kala"}
                            </span>
                            <span className="font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-serif">
                              {item.response.maranaShraddhaData.aparahnaKala}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-stone-200/60 dark:bg-stone-900/70 border border-stone-300 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-200 font-serif space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span>{item.response.maranaShraddhaData.hasPanchakaDosha ? "⚠️" : "✓"}</span>
                            <span className="font-bold">
                              {activeLang === "kn" ? "ಪಂಚಕ ಶಾಂತಿ ಸ್ಥಿತಿ:" : "Panchaka Status:"}
                            </span>
                            <span>{item.response.maranaShraddhaData.panchakaSummaryKn}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-800 dark:text-stone-300">
                            <span>🛕</span>
                            <span className="font-bold">{activeLang === "kn" ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮುಕ್ತಿ ಸೇವೆಗಳು:" : "Gokarna Moksha Sevas:"}</span>
                            <span>{item.response.maranaShraddhaData.gokarnaSevas.join(" • ")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Surrender / Hotel & Business Closure Muhurtha Card */}
                    {item.response?.surrenderMuhurthaData && (
                      <div className="m-5 sm:m-6 mb-2 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-amber-50/50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-4 sm:p-5 shadow-lg">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-200 dark:border-emerald-800/60 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">🏢</span>
                            <div>
                              <h5 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100 font-serif baggona-book-typography">
                                {activeLang === "kn"
                                  ? "॥ ಬಗ್ಗೋಣ ಋಣ ಮುಕ್ತಿ & ವ್ಯಾಪಾರ/ಹೊಟೇಲ್ ಒಪ್ಪಿಸುವ ಮುಹೂರ್ತ ॥"
                                  : "Baggona Debt Clearance & Business/Hotel Handover Muhurtha"}
                              </h5>
                              <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300 font-serif">
                                {activeLang === "kn"
                                  ? "ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ: ಮಂಗಳವಾರ ಭೌಮೇ ಋಣವಿಮೋಚನಮ್ & ಚರ ಲಗ್ನ ಸಿದ್ಧಾಂತ"
                                  : "Bhaume Rina Vimochana: Permanent Debt Release & Chara Lagna Shastra"}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-xs">
                            🛡️ ಋಣ ವಿಮೋಚನಾ ಶುಭ ಮುಹೂರ್ತ
                          </div>
                        </div>

                        <div className="space-y-2 mt-3 text-xs">
                          {item.response.surrenderMuhurthaData.recommendedDays.map((rd, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm font-serif">
                                    🗓️ {rd.date} ({rd.weekdayKn})
                                  </span>
                                  <span className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-md font-semibold">
                                    {rd.tithiKn} • {rd.nakshatraKn}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-700 dark:text-stone-300 font-serif mt-1">
                                  {rd.reasonKn}
                                </p>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300/50 self-start sm:self-auto flex-shrink-0">
                                ⏰ {rd.timeWindowKn}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/50 text-[11px] text-amber-950 dark:text-amber-200 font-serif space-y-1">
                          <p className="font-bold">⚠️ ವರ್ಜ್ಯ ನಿಯಮಗಳು: {item.response.surrenderMuhurthaData.inauspiciousAvoidDays.join(" • ")}</p>
                          <p className="text-emerald-900 dark:text-emerald-300 font-semibold italic">🕉️ ಋಣಮೋಚಕ ಮಂತ್ರ: {item.response.surrenderMuhurthaData.rinaMuktiMantra}</p>
                        </div>
                      </div>
                    )}

                    {/* Festival & Vrata Details Card */}
                    {item.response?.festivalData && (
                      <div className="m-5 sm:m-6 mb-2 rounded-2xl border-2 border-orange-400 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/40 dark:from-slate-900 dark:via-orange-950/30 dark:to-slate-900 p-4 sm:p-5 shadow-lg">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-orange-200 dark:border-orange-800/60 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">🪔</span>
                            <div>
                              <h5 className="text-sm sm:text-base font-bold text-orange-950 dark:text-orange-100 font-serif baggona-book-typography">
                                {item.response.festivalData.festivalNameKn} ({item.response.festivalData.festivalNameEn})
                              </h5>
                              <p className="text-[11px] text-orange-800 dark:text-orange-300 font-serif">
                                {item.response.festivalData.masaKn} ಮಾಸ • {item.response.festivalData.pakshaKn} • {item.response.festivalData.tithiKn}
                              </p>
                            </div>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-xs">
                            📅 {item.response.festivalData.date}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-orange-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 block mb-0.5">
                              ⏰ {activeLang === "kn" ? "ಶುಭ ಪೂಜಾ ಮುಹೂರ್ತ" : "Auspicious Pooja Window"}
                            </span>
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif">
                              {item.response.festivalData.pujaWindowKn}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-orange-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 block mb-0.5">
                              📜 {activeLang === "kn" ? "ವ್ರತ ಮಹತ್ವ" : "Spiritual Significance"}
                            </span>
                            <span className="text-xs text-stone-800 dark:text-stone-200 font-serif">
                              {item.response.festivalData.descriptionKn}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 p-2.5 rounded-xl bg-orange-100/60 dark:bg-orange-950/40 border border-orange-300/50 dark:border-orange-800/50 text-xs font-serif text-orange-950 dark:text-orange-200">
                          <span className="font-bold">🙏 ವ್ರತ ವಿಧಿ & ಸಂಕಲ್ಪ: </span>
                          <span>{item.response.festivalData.vrataVidhanaKn}</span>
                          {item.response.festivalData.mantra && (
                            <p className="mt-1 font-semibold text-orange-900 dark:text-orange-300 italic">
                              🕉️ ಮಂತ್ರ: {item.response.festivalData.mantra}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Personal Horoscope, Health, Ayush & Avakahada Card */}
                    {item.response?.personalHoroscopeData && (
                      <PersonalHoroscopeCard
                        data={item.response.personalHoroscopeData}
                        lang={activeLang}
                        detectedIntent={item.response.detectedIntent}
                      />
                    )}

                    {/* Live Prashna Panchanga Moment Strip if present */}
                    {item.response?.livePanchangaMoment && (
                      <div className="mx-5 sm:mx-6 mt-3 mb-1 px-4 py-2 rounded-xl bg-amber-50 dark:bg-slate-800/50 border border-amber-200/60 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-[11px] text-amber-900 dark:text-amber-300 font-serif">
                        <div className="flex items-center gap-2">
                          <span>🚩</span>
                          <span className="font-bold">{activeLang === "kn" ? "ಪ್ರಶ್ನ ಕಾಲ ಪಂಚಾಂಗ:" : "Prashna Moment:"}</span>
                          <span>
                            {item.response.livePanchangaMoment.samvatsaraKn} • {item.response.livePanchangaMoment.tithiKn} • {item.response.livePanchangaMoment.moonNakshatraKn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-amber-800 dark:text-amber-400">
                          <span>⏳ ಹೋರಾ: {item.response.livePanchangaMoment.horaLordKn}</span>
                          <span>•</span>
                          <span>🛡️ ಚೋಘಡಿಯಾ: {item.response.livePanchangaMoment.choghadiyaKn}</span>
                        </div>
                      </div>
                    )}

                    {/* Thematic Structured Cards */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {item.response?.sections.map((sec, sIdx) => {
                        // Section card visual themes:
                        // 0: Classical Shastra (Amber parchment)
                        // 1: Timing & Muhurtha (Emerald timing)
                        // 2: Sacred Remedies (Amber gold temple)
                        // 3: Priest Blessing (Royal blessing parchment)
                        const themeClass =
                          sIdx === 0
                            ? "rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/70 via-orange-50/20 to-amber-50/60 dark:from-slate-850 dark:to-slate-900 p-4 sm:p-5 shadow-xs border-l-4 border-l-amber-500"
                            : sIdx === 1
                            ? "rounded-2xl border border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/40 via-amber-50/20 to-emerald-50/30 dark:from-slate-850 dark:to-slate-900 p-4 sm:p-5 shadow-xs border-l-4 border-l-emerald-600"
                            : sIdx === 2
                            ? "rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50/80 via-yellow-50/30 to-amber-100/40 dark:from-slate-850 dark:to-slate-900 p-4 sm:p-5 shadow-xs border-l-4 border-l-amber-600"
                            : "rounded-2xl border-2 border-amber-400/90 dark:border-amber-500/70 bg-gradient-to-br from-amber-100/70 via-orange-50/40 to-amber-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 p-5 sm:p-6 shadow-md";

                        const headerColor =
                          sIdx === 1
                            ? "text-emerald-950 dark:text-emerald-100"
                            : "text-amber-950 dark:text-amber-100";

                        const iconBg =
                          sIdx === 1
                            ? "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300/60"
                            : sIdx === 3
                            ? "bg-amber-200/80 dark:bg-amber-900/60 border-amber-400"
                            : "bg-amber-100 dark:bg-amber-950/80 border-amber-300/60";

                        return (
                          <div key={sIdx} className={`${themeClass} transition-all`}>
                            <h5
                              className={`text-sm sm:text-base font-bold ${headerColor} flex items-center gap-2.5 mb-2 font-serif baggona-book-typography border-b border-amber-200/50 dark:border-slate-800 pb-2`}
                            >
                              <span
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${iconBg} border flex items-center justify-center text-sm sm:text-base shadow-2xs flex-shrink-0`}
                              >
                                {sec.icon}
                              </span>
                              <span>{sec.title}</span>
                            </h5>
                            {renderSectionContent(sec, sIdx, activeLang)}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer attribution & quick contact */}
                    <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 dark:bg-slate-950/80 px-5 sm:px-6 py-3.5 border-t border-amber-200/70 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-center sm:text-left text-[11px] text-amber-950/80 dark:text-amber-400 font-serif baggona-book-typography">
                      <div className="mx-auto sm:mx-0">
                        ॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸೇವೆ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ • 9972339362 ॥
                      </div>
                      <div className="mx-auto sm:mx-0 flex items-center gap-3">
                        <a
                          href="tel:9972339362"
                          className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-300 hover:underline"
                        >
                          <span>📞</span>
                          <span>{activeLang === "kn" ? "ಕರೆ ಮಾಡಿ" : "Call"}</span>
                        </a>
                        <span>•</span>
                        <a
                          href="https://wa.me/919972339362"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="rounded-3xl border border-amber-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-3 shadow-lg">
              <svg className="animate-spin h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-serif">
                {activeLang === "kn"
                  ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತ ಹಾಗೂ ಗ್ರಹ ಗಣಿತದ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..."
                  : "Consulting Baggona Panchanga Siddhanta & Vedic planetary positions..."}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── 5. Sticky Bottom Question Input Bar ────────────────── */}
      <div className="sticky bottom-4 z-30 mx-auto max-w-4xl px-2">
        <div className="rounded-3xl border-2 border-amber-400 dark:border-amber-600/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2.5 sm:p-3 flex items-end gap-2">
          
          {/* Microphone Dictation Button */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
              isDictating
                ? "bg-red-600 text-white animate-bounce shadow-lg ring-4 ring-red-300"
                : "bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
            }`}
            title="ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ / Speak Question"
          >
            <span className="text-lg">{isDictating ? "🔴" : "🎙️"}</span>
          </button>

          {/* Textarea Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskQuestion();
              }
            }}
            placeholder={
              activeLang === "kn"
                ? "ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದ ದೋಷ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಸಮಯ)..."
                : "Type your astrology question here (e.g. Mula Nakshatra 1st Pada, Vehicle purchase muhurtha, marriage 7th house)..."
            }
            rows={2}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none py-1.5 px-2 font-medium"
          />

          {/* Send Action Button */}
          <button
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={() => handleAskQuestion()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{isLoading ? "⏳" : "🔮"}</span>
            <span className="hidden sm:inline">
              {isLoading
                ? activeLang === "kn" ? "ಪರಿಶೀಲನೆ..." : "Analyzing..."
                : activeLang === "kn" ? "ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Ask"}
            </span>
          </button>

          {/* Reset Conversation Button */}
          {chatItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(activeLang === "kn" ? "ಹೊಸ ಪ್ರಶ್ನೆ ಆರಂಭಿಸಬೇಕೇ?" : "Start new consultation?")) {
                  setChatItems([]);
                  setInputText("");
                }
              }}
              className="p-3 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="ಹೊಸ ಪ್ರಶ್ನೆ / New consultation"
            >
              <span className="text-sm">🔄</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
