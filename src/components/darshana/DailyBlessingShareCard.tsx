import React, { useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import {
  getDailyInspiration,
  buildCleanDailyWhatsAppShareText,
  type SupportedLang
} from "../../features/darshana/dailyInspirationAlmanac";

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

  const inspiration = useMemo(() => {
    return getDailyInspiration();
  }, []);

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
              {isKn ? "೩೬೫ ದಿನಗಳ ವಿಶಿಷ್ಟ ಶ್ಲೋಕ, ಸತ್ಕಾರ್ಯ ಸಂಕಲ್ಪ & ವಾಟ್ಸಾಪ್ ಹಂಚಿಕೆ" : "365 Days Daily Shloka, Good Karma Action & WhatsApp Share"}
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

      {/* Visual Blessing Card Preview (Renderable to High-Res PNG) */}
      <div
        ref={cardRef}
        style={{
          background: inspiration.theme.bgGradient,
          borderColor: inspiration.theme.borderGold
        }}
        className="relative overflow-hidden rounded-3xl border-2 p-5 text-amber-50 shadow-2xl text-center space-y-3.5"
      >
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-2 left-2 text-amber-300/40 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute top-2 right-2 text-amber-300/40 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute bottom-2 left-2 text-amber-300/40 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute bottom-2 right-2 text-amber-300/40 text-xs font-serif font-black">✦ ✦</div>

        {/* Kshetra Insignia Banner */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-black/40 text-amber-300 border border-amber-400/80 rounded-full text-[11px] font-black uppercase tracking-widest shadow-inner">
          ✨ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ✨
        </div>

        {/* Date & Panchanga Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-lg bg-black/30 border border-amber-400/40 text-amber-200 font-bold">
            📅 {dateStr}
          </span>
          {tithiStr && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/30 border border-amber-400/40 text-amber-200 font-bold">
              ✨ {tithiStr}
            </span>
          )}
          {nakshatraStr && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/30 border border-amber-400/40 text-amber-200 font-bold">
              ⭐ {nakshatraStr}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 font-bold">
            ⏳ ಶುಭ ಮುಹೂರ್ತ: {goldenHourStr}
          </span>
        </div>

        {/* Good Morning Vibe */}
        <div className="bg-black/30 p-3 rounded-2xl border border-amber-400/30 text-xs sm:text-[13px] font-semibold text-amber-100 leading-relaxed shadow-sm">
          <span className="text-amber-400 font-black block mb-0.5 text-[11px] uppercase">
            ☀️ {isKn ? "ಶುಭೋದಯ ಸಂದೇಶ (Morning Blessing)" : "Good Morning Blessing"}
          </span>
          {morningVibe}
        </div>

        {/* Sacred Daily Shloka & Meaning */}
        <div className="bg-gradient-to-r from-amber-950/80 via-black/60 to-amber-950/80 p-3.5 rounded-2xl border border-amber-400/60 text-center space-y-1.5 shadow-md">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
            🪔 {isKn ? `ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${inspiration.deitySource})` : `Daily Sacred Shloka (${inspiration.deitySource})`}
          </span>
          <p className="text-xs sm:text-sm font-black text-white font-serif leading-relaxed text-amber-100 drop-shadow-sm">
            "{shlokaText}"
          </p>
          <p className="text-[11px] text-amber-200/90 italic font-medium leading-relaxed pt-1 border-t border-amber-500/20">
            {shlokaMeaning}
          </p>
        </div>

        {/* Two-Column Grid: Good Karma Deed & Motivational Thought */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs">
          <div className="p-3 bg-black/40 rounded-2xl border border-amber-400/40 space-y-1 shadow-xs">
            <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-1">
              <span>🌱</span>
              <span>{isKn ? "ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ (Good Karma Deed):" : "Today's Good Karma Action:"}</span>
            </span>
            <p className="text-[11px] font-semibold text-amber-100 leading-relaxed">
              {goodDeed}
            </p>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-amber-400/40 space-y-1 shadow-xs">
            <span className="text-[10px] font-black text-amber-300 uppercase flex items-center gap-1">
              <span>💡</span>
              <span>{isKn ? "ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ (Life Insight):" : "Daily Inspiration:"}</span>
            </span>
            <p className="text-[11px] font-semibold text-amber-100 leading-relaxed">
              "{motivationalQuote}"
            </p>
          </div>
        </div>

        {/* Bottom Temple Benediction & Priest Stamp */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-bold text-amber-300/90 pt-2 border-t border-amber-500/30 px-1">
          <span>🛕 ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿ</span>
          <span>ಮುಖ್ಯ ಅರ್ಚಕರು: {priestName}</span>
        </div>
      </div>

      {/* Action Buttons: 1-Tap WhatsApp, High-Res Image Download, Copy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="py-3 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400"
        >
          <span>💬</span>
          <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಹಂಚಿ (Clean Share)" : "Share on WhatsApp"}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCardImage}
          disabled={isGeneratingImage}
          className="py-3 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-400 disabled:opacity-50"
        >
          <span>📸</span>
          <span>{isGeneratingImage ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating Image...") : (isKn ? "ಕಾರ್ಡ್ ಇಮೇಜ್ ಡೌನ್‌ಲೋಡ್ (PNG)" : "Download Card Image")}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyMessage}
          className="py-3 px-3 bg-[#FFFDF7] hover:bg-amber-50 text-slate-900 font-black text-xs rounded-2xl border border-amber-300 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>📋</span>
          <span>{isCopied ? (isKn ? "ಕಾಪಿ ಆಗಿದೆ! ✓" : "Copied! ✓") : (isKn ? "ಸಂದೇಶ ಕಾಪಿ ಮಾಡಿ" : "Copy Text")}</span>
        </button>
      </div>
    </div>
  );
};
