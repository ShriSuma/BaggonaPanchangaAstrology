import React, { useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import {
  getDailyInspiration,
  buildCleanDailyWhatsAppShareText,
  type SupportedLang
} from "../../features/darshana/dailyInspirationAlmanac";
import {
  getDailyBackgroundConfig,
  renderDailyVedicSvgBackground
} from "../../features/darshana/dailyBlessingBackgrounds";

export interface DailyBlessingShareCardProps {
  devoteeName?: string;
  dateStr: string;
  tithiStr?: string;
  nakshatraStr?: string;
  goldenHourStr?: string;
  lang?: string;
  priestName?: string;
}

export const DailyBlessingShareCard: React.FC<DailyBlessingShareCardProps> = ({
  dateStr,
  tithiStr = "",
  nakshatraStr = "",
  goldenHourStr = "10:48 AM - 11:36 AM",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(
    ["kn", "en", "hi", "te", "ta"].includes(lang) ? (lang as SupportedLang) : "kn"
  );

  // Exact deterministic date for all 365 days
  const parsedDate = useMemo(() => {
    try {
      const parts = dateStr.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    } catch {}
    return new Date();
  }, [dateStr]);

  const inspiration = useMemo(() => {
    return getDailyInspiration(parsedDate);
  }, [parsedDate]);

  // 365-Day Deterministic High-Definition Vedic Background Configuration
  const bgConfig = useMemo(() => {
    return getDailyBackgroundConfig(inspiration.dayOfYear);
  }, [inspiration.dayOfYear]);

  const svgBackgroundHtml = useMemo(() => {
    return renderDailyVedicSvgBackground(bgConfig);
  }, [bgConfig]);

  const morningVibe = inspiration.goodMorningVibe[selectedLang] || inspiration.goodMorningVibe.kn;
  const shlokaText = selectedLang === "en" ? inspiration.shlokaText.transliteration : inspiration.shlokaText.kn;
  const shlokaMeaning = inspiration.shlokaMeaning[selectedLang] || inspiration.shlokaMeaning.kn;
  const goodDeed = inspiration.goodDeedOfTheDay[selectedLang] || inspiration.goodDeedOfTheDay.kn;
  const motivationalQuote = inspiration.motivationalQuote[selectedLang] || inspiration.motivationalQuote.kn;

  const shareText = useMemo(() => {
    return buildCleanDailyWhatsAppShareText(dateStr, selectedLang, tithiStr, nakshatraStr);
  }, [dateStr, selectedLang, tithiStr, nakshatraStr]);

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleDownloadCardImage = async () => {
    if (!cardRef.current || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#1A0500"
      });

      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `Baggona_Panchanga_Daily_Blessings_${dateStr.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      a.click();
    } catch (err) {
      console.warn("Failed to generate blessing card image:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isKn = selectedLang === "kn";

  return (
    <div className="bg-gradient-to-br from-[#3B1300] via-[#240A00] to-[#120300] border-2 border-[#D4AF37] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-amber-100">
      {/* Header with Title & Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg shadow-xs">
            {inspiration.theme.icon}
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#FDE68A]">
              {isKn ? "ನಿತ್ಯ ಶುಭೋದಯ ಸಂದೇಶ & ಆಶೀರ್ವಾದ ಎನ್‌ವಲಪ್" : "Daily Good Morning & Shloka Blessings"}
            </h3>
            <span className="text-[11px] text-amber-300 font-bold">
              {isKn ? `೩೬೫ ದಿನಗಳ ವಿಶಿಷ್ಟ ಶ್ಲೋಕ, ಸೂರ್ಯೋದಯ ಕಲಾಚಿತ್ರ & ವಾಟ್ಸಾಪ್ ಹಂಚಿಕೆ (ದಿನ ${inspiration.dayOfYear})` : `365 Days Daily Shloka, Sunrise Art & WhatsApp Share (Day ${inspiration.dayOfYear})`}
            </span>
          </div>
        </div>

        {/* 5-Language Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-500/40 text-[10px] font-bold">
          {(["kn", "en", "hi", "te", "ta"] as SupportedLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setSelectedLang(l)}
              className={`px-2 py-1 rounded-lg transition-all ${
                selectedLang === l
                  ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                  : "text-amber-200/80 hover:text-white"
              }`}
            >
              {l === "kn" ? "ಕನ್ನಡ" : l === "en" ? "EN" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : "தமிழ்"}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Blessing Card Preview (Renderable to High-Res PNG with 365-Day Background) */}
      <div
        ref={cardRef}
        style={{
          borderColor: bgConfig.accentGold || "#F59E0B",
          minHeight: 520
        }}
        className="relative overflow-hidden rounded-3xl border-2 p-5 text-amber-50 shadow-2xl text-center space-y-3.5"
      >
        {/* 🌟 365-Day High-Definition Vector SVG Background (Vedic Sunrise, Sun Rays, Temple Spires, Gokarna Waves) */}
        <div
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          dangerouslySetInnerHTML={{ __html: svgBackgroundHtml }}
        />

        {/* Decorative Golden Corner Accents */}
        <div className="relative z-10">
          <div className="absolute -top-3 -left-3 text-amber-300/60 text-xs font-serif font-black">✦ ✦</div>
          <div className="absolute -top-3 -right-3 text-amber-300/60 text-xs font-serif font-black">✦ ✦</div>
        </div>

        {/* Kshetra Insignia Banner */}
        <div className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/80 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">
          ✨ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ✨
        </div>

        {/* Date & Panchanga Chips */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-amber-400/50 text-amber-200 font-bold shadow-md">
            📅 {dateStr}
          </span>
          {tithiStr && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-amber-400/50 text-amber-200 font-bold shadow-md">
              ✨ {tithiStr}
            </span>
          )}
          {nakshatraStr && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-md border border-amber-400/50 text-amber-200 font-bold shadow-md">
              ⭐ {nakshatraStr}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-400/70 text-emerald-300 font-bold shadow-md">
            ⏳ ಶುಭ ಮುಹೂರ್ತ: {goldenHourStr}
          </span>
        </div>

        {/* Good Morning Vibe */}
        <div className="relative z-10 bg-black/55 backdrop-blur-md p-3.5 rounded-2xl border border-amber-400/40 text-xs sm:text-[13.5px] font-semibold text-amber-100 leading-relaxed shadow-lg">
          <span className="text-amber-300 font-black block mb-1 text-[11px] uppercase tracking-wider">
            ☀️ {isKn ? "ಶುಭೋದಯ ಸಂದೇಶ (Morning Blessing)" : "Good Morning Blessing"}
          </span>
          {morningVibe}
        </div>

        {/* Sacred Daily Shloka & Meaning */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-400/70 text-center space-y-2 shadow-xl">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
            🪔 {isKn ? `ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${inspiration.deitySource})` : `Daily Sacred Shloka (${inspiration.deitySource})`}
          </span>
          <p className="text-xs sm:text-sm font-black text-white font-serif leading-relaxed text-amber-100 drop-shadow-md">
            "{shlokaText}"
          </p>
          <p className="text-[11px] sm:text-xs text-amber-200/95 italic font-medium leading-relaxed pt-1.5 border-t border-amber-500/30">
            {shlokaMeaning}
          </p>
        </div>

        {/* Two-Column Grid: Good Karma Deed & Motivational Thought */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
          <div className="p-3.5 bg-black/55 backdrop-blur-md rounded-2xl border border-emerald-400/50 space-y-1 shadow-lg">
            <span className="text-[10.5px] font-black text-emerald-300 uppercase flex items-center gap-1">
              <span>🌱</span>
              <span>{isKn ? "ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ (Good Karma Deed):" : "Today's Good Karma Action:"}</span>
            </span>
            <p className="text-[11.5px] font-semibold text-amber-100 leading-relaxed">
              {goodDeed}
            </p>
          </div>

          <div className="p-3.5 bg-black/55 backdrop-blur-md rounded-2xl border border-amber-400/50 space-y-1 shadow-lg">
            <span className="text-[10.5px] font-black text-amber-300 uppercase flex items-center gap-1">
              <span>💡</span>
              <span>{isKn ? "ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ (Life Insight):" : "Daily Inspiration:"}</span>
            </span>
            <p className="text-[11.5px] font-semibold text-amber-100 leading-relaxed">
              "{motivationalQuote}"
            </p>
          </div>
        </div>

        {/* Bottom Temple Benediction & Priest Stamp */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-bold text-amber-200 pt-2 border-t border-amber-500/40 px-2">
          <span>🛕 ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿ</span>
          <span>ಮುಖ್ಯ ಅರ್ಚಕರು: {priestName}</span>
        </div>
      </div>

      {/* Action Buttons: 1-Tap WhatsApp, High-Res Image Download, Copy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="py-3 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400 cursor-pointer"
        >
          <span>💬</span>
          <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಹಂಚಿ (Clean Share)" : "Share on WhatsApp"}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCardImage}
          disabled={isGeneratingImage}
          className="py-3 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-400 disabled:opacity-50 cursor-pointer"
        >
          <span>📸</span>
          <span>{isGeneratingImage ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating Image...") : (isKn ? "ಕಾರ್ಡ್ ಇಮೇಜ್ ಡೌನ್‌ಲೋಡ್ (PNG)" : "Download Card Image")}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyMessage}
          className="py-3 px-3 bg-[#FFFDF7] hover:bg-amber-50 text-slate-900 font-black text-xs rounded-2xl border border-amber-300 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📋</span>
          <span>{isCopied ? (isKn ? "ಕಾಪಿ ಆಗಿದೆ! ✓" : "Copied! ✓") : (isKn ? "ಸಂದೇಶ ಕಾಪಿ ಮಾಡಿ" : "Copy Text")}</span>
        </button>
      </div>
    </div>
  );
};
