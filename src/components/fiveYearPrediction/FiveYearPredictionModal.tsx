import React, { useState, useEffect } from "react";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { useWalletStore } from "../../features/wallet/walletStore";
import {
  type SixLang,
  SIX_LANGS,
  LANGUAGE_DISPLAY_NAMES_6L,
  pick6,
  FIVE_YEAR_TEXT_6L,
  formatNumber6L
} from "../../features/fiveYearPrediction/fiveYearLocale";
import {
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload
} from "../../features/fiveYearPrediction/fiveYearPredictionEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: KundliViewerSession | null;
  currentLanguage?: string;
  geminiApiKey?: string;
  onDownloadPdf: (lang: SixLang) => Promise<void>;
  isGeneratingPdf: boolean;
  pdfProgress: number;
  pdfStageText: string;
}

export const FiveYearPredictionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  session,
  currentLanguage = "kn",
  geminiApiKey = "",
  onDownloadPdf,
  isGeneratingPdf,
  pdfProgress,
  pdfStageText
}) => {
  const initialLang = ((currentLanguage || "kn").split("-")[0].toLowerCase()) as SixLang;
  const [selectedLang, setSelectedLang] = useState<SixLang>(
    SIX_LANGS.includes(initialLang) ? initialLang : "kn"
  );
  const [previewData, setPreviewData] = useState<FiveYearPredictionPayload | null>(null);

  const { wallet, deductForService } = useWalletStore();

  useEffect(() => {
    if (session) {
      try {
        const payload = compute5YearMasterPrediction(
          session.result,
          session.birthDateYmd || session.input.birthDate,
          session.birthTimeHm || session.input.birthTime,
          selectedLang,
          session.input.name || "Devotee",
          2026,
          {
            gender: session.input.gender,
            maritalStatus: (session.input as any)?.maritalStatus,
            childrenStatus: (session.input as any)?.childrenStatus,
            latitude: session.input.latitude,
            longitude: session.input.longitude,
            ayanamsa: (session.input as any)?.ayanamsa || "lahiri"
          }
        );
        setPreviewData(payload);
      } catch (err) {
        console.warn("[FiveYearPredictionModal] Preview generation error:", err);
      }
    }
  }, [session, selectedLang]);

  if (!isOpen || !session) return null;

  const t = (key: string) => pick6(FIVE_YEAR_TEXT_6L[key], selectedLang);
  const isKn = selectedLang === "kn";
  const isMr = selectedLang === "mr";
  const isHi = selectedLang === "hi";
  const isTe = selectedLang === "te";
  const isTa = selectedLang === "ta";

  const handleDownloadClick = async () => {
    // 2,500 Coins = ₹250
    const SERVICE_COINS = 2500;
    try {
      if (wallet && wallet.coinBalance >= SERVICE_COINS) {
        await deductForService(
          SERVICE_COINS,
          "Next 5 Years Master Destiny Blueprint PDF (₹250)",
          session.input.name
        );
      }
    } catch (e) {
      console.warn("[Wallet] Coin deduction notice:", e);
    }
    await onDownloadPdf(selectedLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-amber-950/90 to-slate-950 border-2 border-amber-400/80 rounded-3xl shadow-2xl overflow-hidden text-amber-50 my-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-7 border-b border-amber-500/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
              <span>🌟 {t("headerBadge")}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide">
              {t("buttonTitle")}
            </h3>
            <p className="text-xs text-amber-200/90 max-w-xl leading-relaxed">
              {t("psychologyPitch")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGeneratingPdf}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-200 hover:text-white transition-colors border border-amber-500/30 text-lg shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-5 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 6-Language Selection Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <span>🌐</span>
              <span>
                {isKn ? "ವರದಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (೬ ಭಾಷೆಗಳು ಲಭ್ಯ):"
                  : isMr ? "अहवाल भाषा निवडा (६ भाषा उपलब्ध):"
                  : isHi ? "रिपोर्ट भाषा चुनें (६ भाषाएं उपलब्ध):"
                  : "Choose Report Language (6 Languages Supported):"}
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SIX_LANGS.map((lng) => {
                const isSelected = selectedLang === lng;
                const isMarathi = lng === "mr";
                return (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setSelectedLang(lng)}
                    disabled={isGeneratingPdf}
                    className={`relative px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-yellow-200 shadow-lg scale-105 font-black ring-2 ring-amber-300/60"
                        : "bg-slate-800/80 text-amber-200 border-amber-500/30 hover:bg-slate-800 hover:border-amber-400"
                    }`}
                  >
                    {isMarathi && (
                      <span className="absolute -top-2 -right-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">
                        NEW!
                      </span>
                    )}
                    <span>{LANGUAGE_DISPLAY_NAMES_6L[lng].native}</span>
                    <span className="text-[10px] opacity-80">({LANGUAGE_DISPLAY_NAMES_6L[lng].english})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Devotee Astrological Alignment Card */}
          {previewData && (
            <div className="bg-slate-800/60 border border-amber-400/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-amber-500/20 pb-2">
                <span className="font-bold text-amber-300">
                  👤 {previewData.devoteeName} ({formatNumber6L(Math.round(previewData.ageYears), selectedLang)} {isKn ? "ವರ್ಷ" : isMr ? "वर्षे" : isHi ? "वर्ष" : isTe ? "సంవత్సరాలు" : isTa ? "ஆண்டுகள்" : "Yrs"})
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-md border border-amber-400/30 text-[11px] font-bold">
                  {isKn ? `ಲಗ್ನ: ${previewData.lagnaRashi} • ನಕ್ಷತ್ರ: ${previewData.nakshatra} (${previewData.padaWord} ${formatNumber6L(previewData.nakshatraPada, selectedLang)})`
                    : isMr ? `लग्न: ${previewData.lagnaRashi} • नक्षत्र: ${previewData.nakshatra} (${previewData.padaWord} ${formatNumber6L(previewData.nakshatraPada, selectedLang)})`
                    : isHi ? `लग्न: ${previewData.lagnaRashi} • नक्षत्र: ${previewData.nakshatra} (${previewData.padaWord} ${formatNumber6L(previewData.nakshatraPada, selectedLang)})`
                    : isTe ? `లగ్నం: ${previewData.lagnaRashi} • నక్షత్రం: ${previewData.nakshatra} (${previewData.padaWord} ${formatNumber6L(previewData.nakshatraPada, selectedLang)})`
                    : isTa ? `லக்னம்: ${previewData.lagnaRashi} • நட்சத்திரம்: ${previewData.nakshatra} (${previewData.padaWord} ${formatNumber6L(previewData.nakshatraPada, selectedLang)})`
                    : `Lagna: ${previewData.lagnaRashi} • Nakshatra: ${previewData.nakshatra} (${previewData.padaWord} ${previewData.nakshatraPada})`}
                </span>
              </div>

              {/* Pivotal Turning Point Teaser Card - High Curiosity Hook */}
              {previewData.macroSummary && (
                <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-400/60 rounded-2xl p-3.5 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <span>🌟</span>
                      <span>{t("pivotalTurningPointCardTitle")}</span>
                    </span>
                    <span className="bg-yellow-400/20 border border-yellow-300/40 text-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ⏳ {previewData.macroSummary.pivotalTurningPointSeason}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-amber-100 font-serif">
                    {previewData.macroSummary.pivotalTurningPointTitle}
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed italic">
                    "{previewData.macroSummary.pivotalTurningPointImpact ? previewData.macroSummary.pivotalTurningPointImpact.slice(0, 160) : ""}..."
                  </p>
                </div>
              )}

              {/* 5-Year Master Milestones Matrix Preview */}
              {previewData.milestoneMatrix && previewData.milestoneMatrix.length > 0 && (
                <div className="bg-slate-900/80 border border-amber-400/30 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <span>🔮</span>
                      <span>{t("milestoneMatrixTitle")}</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-normal">
                      ({formatNumber6L(previewData.milestoneMatrix.length, selectedLang)} {isKn ? "ಪ್ರಮುಖ ತಿರುವುಗಳು" : isMr ? "मुख्य टप्पे" : isHi ? "मुख्य पड़ाव" : isTe ? "కీలక మైలురాళ్ళు" : isTa ? "முக்கிய மைல்கற்கள்" : "Key Milestones"})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {previewData.milestoneMatrix.slice(0, 6).map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-800/80 border border-amber-500/20 rounded-lg p-2 space-y-0.5">
                        <span className="font-bold text-amber-200 block text-[10.5px] truncate">
                          {m.dimensionTitle}
                        </span>
                        <span className="text-[10px] text-yellow-300 font-medium block">⏱️ {m.timingWindow}</span>
                        <span className="text-[9.5px] text-emerald-400 font-semibold block">⚡ {m.planetaryCatalyst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Year Timeline Horizontal Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  🗓️ {isKn ? "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸಾರಾಂಶ ನೋಟ (2026 - 2031):" : isMr ? "पुढील ५ वर्षांचे संक्षिप्त दर्शन:" : isHi ? "आगामी ५ वर्षों का संक्षिप्त दर्शन:" : isTe ? "రాబోయే 5 సంవత్సరాల సంగ్రహం:" : isTa ? "அடுத்த 5 ஆண்டுகளின் சுருக்கம்:" : "5-Year Horizon Summary:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                  {previewData.years.map((yr, idx) => (
                    <div
                      key={yr.yearIndex}
                      className="bg-slate-900/90 border border-amber-400/30 rounded-xl p-3 space-y-1.5 text-center hover:border-amber-300 transition-all"
                    >
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md block">
                        {isKn ? `ವರ್ಷ ${formatNumber6L(idx + 1, selectedLang)}` : isMr ? `वर्ष ${formatNumber6L(idx + 1, selectedLang)}` : isHi ? `वर्ष ${formatNumber6L(idx + 1, selectedLang)}` : isTe ? `సంవత్సరం ${formatNumber6L(idx + 1, selectedLang)}` : isTa ? `ஆண்டு ${formatNumber6L(idx + 1, selectedLang)}` : `Year ${idx + 1}`}
                      </span>
                      <p className="font-bold text-xs text-amber-100">{yr.gregorianRange}</p>
                      <p className="text-[10px] text-amber-300/80 font-serif leading-tight">
                        {yr.samvatsaraKn}
                      </p>
                      <div className="pt-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            yr.vitalityCategory === "exceptional"
                              ? "bg-emerald-900/80 text-emerald-300 border border-emerald-500/50"
                              : yr.vitalityCategory === "balanced"
                              ? "bg-amber-900/80 text-amber-300 border border-amber-500/50"
                              : "bg-orange-900/80 text-orange-300 border border-orange-500/50"
                          }`}
                        >
                          ⚡ {formatNumber6L(yr.vitalityScore, selectedLang)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescribed Stotra Teaser */}
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    🪔 {isKn ? "೫ ವರ್ಷಗಳ ದಿವ್ಯ ರಕ್ಷಾ ಸ್ತೋತ್ರ:" : isMr ? "५ वर्षांचे सिद्ध रक्षा स्तोत्र:" : isHi ? "५ वर्षीय सिद्ध रक्षा स्तोत्र:" : isTe ? "5 సంవత్సరాల రక్షా స్తోత్రం:" : isTa ? "5 ஆண்டுகளுக்கான ரக்ஷா ஸ்தோத்திரம்:" : "Prescribed Stotra:"}
                  </span>
                  <p className="font-black text-amber-100">{previewData.prescribedStotra.stotraName}</p>
                  <p className="text-[11px] text-amber-300/80">{previewData.prescribedStotra.primaryBenefit}</p>
                </div>
                <span className="text-xl">📿</span>
              </div>
            </div>
          )}

          {/* In-Flight Progress Loader */}
          {isGeneratingPdf && (
            <div className="bg-amber-950/80 border-2 border-yellow-400/80 rounded-2xl p-4 text-center space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span>{pdfStageText || "Generating..."}</span>
                <span>{formatNumber6L(pdfProgress, selectedLang)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-amber-500/40">
                <div
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-300/80">
                {isKn ? "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ, ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಪಂಚವರ್ಷ ಮುದ್ರಣ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
                  : isMr ? "कृपया थांबा, अधिकृत बग्गोण ५ वर्षांचा अहवाल तयार होत आहे..."
                  : isHi ? "कृपया प्रतीक्षा करें, आधिकारिक बागगोण ५ वर्षीय रिपोर्ट तैयार हो रही है..."
                  : isTe ? "దయచేసి వేచి ఉండండి, అధికారిక బాగ్‌గోణ 5 సంవత్సరాల నివేదిక సిద్ధమవుతోంది..."
                  : isTa ? "தயவுசெய்து காத்திருக்கவும், அதிகாரப்பூர்வ பாகோண 5 ஆண்டு அறிக்கை தயாராகிறது..."
                  : "Please wait, assembling official Baggona 5-Year Blueprint PDF..."}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer / Download Action Bar */}
        <div className="relative z-10 p-5 sm:p-7 border-t border-amber-500/30 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-sm font-black text-yellow-300 flex items-center gap-1.5 justify-center sm:justify-start">
              <span>🪙</span>
              <span>₹{formatNumber6L(250, selectedLang)} (2,500 Coins)</span>
            </span>
            <p className="text-[11px] text-amber-300/80">
              {isKn
                ? "ಪೂರ್ಣ ೫ ವರ್ಷಗಳ ಮುದ್ರಣ ಆವೃತ್ತಿ • ವರ್ಷವಾರು ಭವಿಷ್ಯ • ಸ್ತೋತ್ರ • ಪರಿಹಾರ"
                : isMr
                ? "संपूर्ण ५ वर्षांची प्रिंट आवृत्ती • वर्षनिहाय भविष्य • स्तोत्र • परिहार"
                : isHi
                ? "सम्पूर्ण ५ वर्षीय प्रिंट संस्करण • वार्षिक भविष्यफल • स्तोत्र • परिहार"
                : isTe
                ? "పూర్తి 5 సంవత్సరాల ముద్రణ కాపీ • వార్షిక ఫలితాలు • స్తోత్రం • నివారణలు"
                : isTa
                ? "முழுமையான 5 ஆண்டு அச்சு பதிப்பு • வருடாந்திர கணிப்புகள் • ஸ்தோத்திரம் • பரிகாரங்கள்"
                : "Complete 5-Year Printable Edition • Yearly Timeline • Stotra • Remedies"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-bold transition-all border border-amber-500/30 cursor-pointer"
            >
              {isKn ? "ರದ್ದುಮಾಡಿ" : isMr ? "रद्द करा" : isHi ? "रद्द करें" : isTe ? "రద్దు చేయండి" : isTa ? "ரத்து செய்" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleDownloadClick}
              disabled={isGeneratingPdf}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:via-yellow-300 hover:to-orange-400 text-slate-950 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 shadow-xl border-2 border-yellow-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isGeneratingPdf ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="text-base animate-pulse">📜✨</span>
              <span>
                {isGeneratingPdf
                  ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : isMr ? "तयार होत आहे..." : isHi ? "तैयार हो रहा है..." : isTe ? "సిద్ధమవుతోంది..." : isTa ? "தயாராகிறது..." : "Crafting...")
                  : (isKn ? "₹೨೫೦ ರ ಭವಿಷ್ಯ PDF ಪಡೆಯಿರಿ" : isMr ? "₹२५० भविष्य PDF मिळवा" : isHi ? "₹२५० भविष्य PDF प्राप्त करें" : isTe ? "₹250 భవిష్యత్ PDF పొందండి" : isTa ? "₹250 எதிர்கால PDF பெறுக" : "Download 5-Year PDF (₹250)")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
