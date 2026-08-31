import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import type { SevaLang } from "../../features/seva/sevaLocale";

export interface DailyBlessingShareCardProps {
  devoteeName: string;
  dateStr: string;
  tithiStr: string;
  nakshatraStr: string;
  goldenHourStr: string;
  lang?: SevaLang;
  priestName?: string;
}

export const DailyBlessingShareCard: React.FC<DailyBlessingShareCardProps> = ({
  devoteeName,
  dateStr,
  tithiStr,
  nakshatraStr,
  goldenHourStr,
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shareText = `🕉️ *ಶುಭೋದಯ! ಇಂದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದರ್ಶನ & ಆಶೀರ್ವಾದ*\n\n` +
    `🙏 *ಭಕ್ತರು:* ${devoteeName}\n` +
    `📅 *ದಿನಾಂಕ:* ${dateStr}\n` +
    `✨ *ತಿಥಿ:* ${tithiStr} · *ನಕ್ಷತ್ರ:* ${nakshatraStr}\n` +
    `⏳ *ಇಂದಿನ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ:* ${goldenHourStr}\n\n` +
    `🪔 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಇಂದಿನ ದಿನವು ಸುಖ-ಶಾಂತಿ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸಿನಿಂದ ಕೂಡಿರಲಿ.\n\n` +
    `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ ॥\n` +
    `👉 ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ದರ್ಶನ ಪಡೆಯಿರಿ: ${typeof window !== "undefined" ? window.location.href : ""}`;

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleDownloadCardImage = async () => {
    if (!cardRef.current || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0F172A"
      });

      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `Baggona_Blessing_Card_${dateStr}_${devoteeName.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
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

  return (
    <div className="bg-gradient-to-br from-[#451A03] via-[#301004] to-[#1C0A00] border-2 border-[#D4AF37] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-amber-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shadow-xs">
            📲
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#FDE68A]">
              ಶುಭೋದಯ ಆಶೀರ್ವಾದ ಕಾರ್ಡ್ (Daily Blessing Card)
            </h3>
            <span className="text-xs text-amber-300 font-bold">
              ೧-ಟ್ಯಾಪ್ ವಾಟ್ಸಾಪ್ ಸ್ಟೇಟಸ್ & ಕುಟುಂಬಕ್ಕೆ ಹಂಚಿ
            </span>
          </div>
        </div>
      </div>

      {/* Visual Blessing Card Preview (Renderable to PNG) */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-amber-950/90 to-slate-950 border-2 border-amber-400 p-5 text-amber-50 shadow-2xl text-center space-y-3"
      >
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-2 left-2 text-amber-400/50 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute top-2 right-2 text-amber-400/50 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute bottom-2 left-2 text-amber-400/50 text-xs font-serif font-black">✦ ✦</div>
        <div className="absolute bottom-2 right-2 text-amber-400/50 text-xs font-serif font-black">✦ ✦</div>

        {/* Kshetra Insignia */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/60 rounded-full text-[10px] font-black uppercase tracking-widest">
          ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥
        </div>

        <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
          🕉️
        </div>

        <div className="space-y-0.5">
          <div className="text-xs text-amber-300 font-bold tracking-wide">
            ಶುಭೋದಯ & ನಿತ್ಯ ದೈವಿಕ ಆಶೀರ್ವಾದ
          </div>
          <h2 className="text-lg font-black text-white font-serif drop-shadow-sm">
            {devoteeName}
          </h2>
        </div>

        {/* Panchanga & Golden Hour Chips */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-900/80 p-3 rounded-2xl border border-amber-400/40">
          <div>
            <span className="text-[9px] text-amber-400 font-black block uppercase">ದಿನಾಂಕ & ತಿಥಿ</span>
            <span className="font-bold text-amber-100 text-[11px] truncate block">{dateStr} · {tithiStr}</span>
          </div>
          <div>
            <span className="text-[9px] text-amber-400 font-black block uppercase">ನಕ್ಷತ್ರ</span>
            <span className="font-bold text-amber-100 text-[11px] truncate block">{nakshatraStr}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-amber-400/20 flex items-center justify-between">
            <span className="text-[9px] text-emerald-400 font-black uppercase">ಇಂದಿನ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ:</span>
            <span className="font-mono font-black text-amber-300 text-xs">{goldenHourStr}</span>
          </div>
        </div>

        {/* Sacred Benediction */}
        <p className="text-[11px] text-amber-200/90 font-medium italic leading-relaxed px-2">
          "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಸಕಲ ಸಂಕಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಸರ್ವ ಕಾರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿ."
        </p>

        <div className="text-[9px] text-amber-400 font-bold pt-1">
          ಮುಖ್ಯ ಅರ್ಚಕರು: {priestName} • ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-400"
        >
          <span>💬</span>
          <span>ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿ</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCardImage}
          disabled={isGeneratingImage}
          className="py-2.5 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-400 disabled:opacity-50"
        >
          <span>📸</span>
          <span>{isGeneratingImage ? "ಚಿತ್ರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "ಕಾರ್ಡ್ ಇಮೇಜ್ ಡೌನ್‌ಲೋಡ್"}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyMessage}
          className="py-2.5 px-3 bg-white hover:bg-amber-50 text-slate-800 font-black text-xs rounded-xl border border-amber-300 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>📋</span>
          <span>{isCopied ? "ಕಾಪಿ ಆಗಿದೆ! ✓" : "ಸಂದೇಶ ಕಾಪಿ ಮಾಡಿ"}</span>
        </button>
      </div>
    </div>
  );
};
