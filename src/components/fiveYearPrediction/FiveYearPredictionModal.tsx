import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { useWalletStore } from "../../features/wallet/walletStore";
import { useAuthStore, SUPER_ADMIN_USERNAMES } from "../../features/auth/authStore";
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
import { logPremiumPdfDownload } from "../../db/firestoreDb";
import {
  notifyPremiumPdfDownloaded,
  triggerDailyPdfSummaryIfActive
} from "../../features/notifications/notificationService";
import { getIndianStandardDateStr } from "../../core/placeTime";

export type FiveYearPackageTier = "standard_350" | "remedy_450";

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

  // Package Tier Selection (₹350 Standard vs ₹450 with Consecrated Remedies)
  const [selectedPackage, setSelectedPackage] = useState<FiveYearPackageTier>("standard_350");
  const packagePrice = selectedPackage === "remedy_450" ? 450 : 350;
  const packageCoins = selectedPackage === "remedy_450" ? 4500 : 3500;

  // Auth & Super Admin Privileges
  const { currentUser, role } = useAuthStore();
  const isMasterOrSuperAdmin =
    role === "superadmin" ||
    Boolean(
      currentUser &&
      SUPER_ADMIN_USERNAMES.some(
        (u) => u.toLowerCase() === currentUser.toLowerCase() || u === currentUser
      )
    );

  // Payment & Verification States
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "wallet">("upi");
  const [isPaymentVerified, setIsPaymentVerified] = useState(isMasterOrSuperAdmin);
  const [verifiedReference, setVerifiedReference] = useState(
    isMasterOrSuperAdmin ? "SUPER_ADMIN_VIP_PASS" : ""
  );
  const [utrInput, setUtrInput] = useState("");
  const [utrError, setUtrError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isDeductingCoins, setIsDeductingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState("");

  const { wallet, deductForService } = useWalletStore();

  // Ensure Super Admin is never held or gated by payment verification
  useEffect(() => {
    if (isMasterOrSuperAdmin) {
      setIsPaymentVerified(true);
      setVerifiedReference("SUPER_ADMIN_VIP_PASS");
    }
  }, [isMasterOrSuperAdmin]);

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

  // Dynamic UPI Intent URI targeting Priest Shreeram Pandit (₹350 or ₹450)
  const devoteeCleanName = (session?.input.name || "Devotee").replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const upiTxnNote = encodeURIComponent(`Baggona 5-Yr Destiny PDF ${devoteeCleanName}`);
  const upiUri = `upi://pay?pa=9108135387@ybl&pn=Shreeram%20Pandit&am=${packagePrice}&cu=INR&tn=${upiTxnNote}`;
  const phonePeUri = `phonepe://pay?pa=9108135387@ybl&pn=Shreeram%20Pandit&am=${packagePrice}&cu=INR&tn=${upiTxnNote}`;
  const gPayUri = `tez://upi/pay?pa=9108135387@ybl&pn=Shreeram%20Pandit&am=${packagePrice}&cu=INR&tn=${upiTxnNote}`;
  const paytmUri = `paytmmp://pay?pa=9108135387@ybl&pn=Shreeram%20Pandit&am=${packagePrice}&cu=INR&tn=${upiTxnNote}`;

  // Generate Scannable UPI QR Code matching the chosen package price
  useEffect(() => {
    if (upiUri) {
      QRCode.toDataURL(upiUri, {
        width: 220,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.warn("[FiveYearPredictionModal] QR code generation error:", err));
    }
  }, [upiUri]);

  if (!isOpen || !session) return null;

  const t = (key: string) => pick6(FIVE_YEAR_TEXT_6L[key], selectedLang);
  const isKn = selectedLang === "kn";
  const isMr = selectedLang === "mr";
  const isHi = selectedLang === "hi";
  const isTe = selectedLang === "te";
  const isTa = selectedLang === "ta";

  // Verify UTR
  const handleVerifyUtr = () => {
    const clean = utrInput.trim();
    if (!clean || clean.length < 6) {
      setUtrError(
        isKn ? "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ೬-೧೨ ಅಂಕಿಗಳ ಸರಿಯಾದ UTR / Reference ನಮೂದಿಸಿ."
          : isMr ? "कृपया किमान ६-१२ अंकी योग्य UTR / संदर्भ क्रमांक टाका."
          : isHi ? "कृपया न्यूनतम ६-१२ अंकों का सही UTR / संदर्भ क्रमांक दर्ज करें."
          : "Please enter a valid 6-12 digit UTR / UPI Reference Number."
      );
      return;
    }
    setUtrError("");
    setIsPaymentVerified(true);
    setVerifiedReference(`UPI UTR: ${clean}`);
  };

  // Deduct Wallet Coins (3,500 Coins = ₹350 or 4,500 Coins = ₹450)
  const handleDeductCoins = async () => {
    if (!wallet || wallet.coinBalance < packageCoins) {
      setCoinsError(
        isKn ? `ನಾಣ್ಯಗಳ ಕೊರತೆ: ನಿಮ್ಮಲ್ಲಿ ${formatNumber6L(wallet?.coinBalance || 0, selectedLang)} ನಾಣ್ಯಗಳಿವೆ (ಅಗತ್ಯ: ${formatNumber6L(packageCoins, selectedLang)}). UPI QR ಮೂಲಕ ₹${formatNumber6L(packagePrice, selectedLang)} ಪಾವತಿಸಿ.`
          : isMr ? `नाणी अपुरी आहेत: आपल्याकडे ${formatNumber6L(wallet?.coinBalance || 0, selectedLang)} नाणी आहेत (आवश्यक: ${formatNumber6L(packageCoins, selectedLang)}). कृपया UPI द्वारे ₹${formatNumber6L(packagePrice, selectedLang)} भरा.`
          : isHi ? `सिक्कों की कमी: आपके पास ${formatNumber6L(wallet?.coinBalance || 0, selectedLang)} सिक्के हैं (आवश्यक: ${formatNumber6L(packageCoins, selectedLang)}). कृपया UPI द्वारा ₹${formatNumber6L(packagePrice, selectedLang)} भुगतान करें.`
          : `Insufficient coins: You have ${wallet?.coinBalance || 0} coins (needed: ${packageCoins}). Please pay ₹${packagePrice} via UPI QR Code.`
      );
      return;
    }

    try {
      setIsDeductingCoins(true);
      setCoinsError("");
      await deductForService(
        packageCoins,
        `Next 5 Years Master Destiny Blueprint PDF (₹${packagePrice})`,
        session.input.name
      );
      setIsPaymentVerified(true);
      setVerifiedReference(`Wallet: ${packageCoins.toLocaleString()} Coins Deducted`);
    } catch (e: any) {
      setCoinsError(e?.message || "Coin deduction failed");
    } finally {
      setIsDeductingCoins(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!isPaymentVerified && !isMasterOrSuperAdmin) {
      return;
    }

    const effectiveAmount = isMasterOrSuperAdmin ? 0 : packagePrice;
    const effectiveCoins = isMasterOrSuperAdmin ? 0 : packageCoins;
    const effectiveReference = isMasterOrSuperAdmin
      ? "SUPER_ADMIN_VIP_PASS"
      : verifiedReference || "VERIFIED";
    const effectiveMethod = isMasterOrSuperAdmin
      ? "super_admin_pass"
      : paymentMethod === "wallet"
      ? "wallet_coins"
      : "upi_qr";

    // 1. Log download to Firestore for daily summary aggregation & audit
    try {
      await logPremiumPdfDownload({
        devoteeName: session.input.name || "Devotee",
        username: session.input.name || "Devotee",
        priestName: "Shreeram Pandit",
        portalSource: "Baggona Bhavishya",
        language: selectedLang,
        coinsSpent: effectiveCoins,
        amountInr: effectiveAmount,
        timestamp: new Date().toISOString(),
        dateKey: getIndianStandardDateStr(),
        packageType: selectedPackage,
        paymentUtr: effectiveReference,
        paymentMethod: effectiveMethod
      });
    } catch (logErr) {
      console.warn("[FiveYearPredictionModal] Log download error:", logErr);
    }

    // 2. Send instant transactional email notification to spshreepandit@gmail.com
    try {
      await notifyPremiumPdfDownloaded({
        clientName: session.input.name || "Devotee",
        pdfType: `5-Year Master Destiny Blueprint (${selectedPackage === "remedy_450" ? "With Remedies" : "Standard"})${isMasterOrSuperAdmin ? " [SUPER ADMIN PASS]" : ""}`,
        language: selectedLang,
        pageCount: 16,
        priestName: "Shreeram Pandit",
        amountInr: effectiveAmount,
        coinsSpent: effectiveCoins,
        packageType: selectedPackage,
        paymentMethod: isMasterOrSuperAdmin ? "Super Admin VIP Pass" : paymentMethod === "wallet" ? "Wallet Coins" : "UPI QR Code",
        paymentUtr: effectiveReference
      });
    } catch (mailErr) {
      console.warn("[FiveYearPredictionModal] Notification email error:", mailErr);
    }

    // 3. Trigger daily summary report email (summarizes all copies sent today if >= 1)
    try {
      void triggerDailyPdfSummaryIfActive(getIndianStandardDateStr());
    } catch (summaryErr) {
      console.warn("[FiveYearPredictionModal] Daily summary trigger error:", summaryErr);
    }

    // 4. Download PDF
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

          {/* ── PACKAGE SELECTION TIER (₹350 Standard vs ₹450 with Consecrated Remedies) ── */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📦</span>
                <span>
                  {isKn ? "೧. ಭವಿಷ್ಯ ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆಮಾಡಿ:"
                    : isMr ? "१. अहवाल पॅकेज निवडा:"
                    : isHi ? "१. भविष्यफल पैकेज का चयन करें:"
                    : isTe ? "1. ప్యాకేజీని ఎంచుకోండి:"
                    : isTa ? "1. பேக்கேஜைத் தேர்ந்தெடுக்கவும்:"
                    : "1. Select 5-Year Package Tier:"}
                </span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                {selectedPackage === "remedy_450" ? "⭐ Consecrated" : "Standard"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Standard 5-Year Master Destiny (₹350 / 3,500 Coins) */}
              <button
                type="button"
                onClick={() => {
                  if (!isPaymentVerified) setSelectedPackage("standard_350");
                }}
                disabled={isPaymentVerified || isGeneratingPdf}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedPackage === "standard_350"
                    ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-yellow-400 shadow-lg ring-1 ring-yellow-400/50"
                    : "bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-200">
                    📜 {isKn ? "ಸ್ಟ್ಯಾಂಡರ್ಡ್ ೫ ವರ್ಷಗಳ ಜಾತಕ" : isMr ? "स्टँडर्ड ५ वर्षांची पत्रिका" : isHi ? "स्टैंडर्ड ५-वर्षीय महा कुंडली" : "Standard 5-Year Destiny"}
                  </span>
                  <span className="text-sm font-black text-yellow-300">₹350</span>
                </div>
                <p className="text-[11px] text-amber-300/80 leading-snug">
                  {isKn
                    ? "ಸಂಪೂರ್ಣ ೧೬ ಪುಟಗಳ ೫ ವರ್ಷಗಳ ಜಾತಕ, ವಾರ್ಷಿಕ ಮುನ್ನೋಟ, ನಗನಾಣ್ಯ ಯೋಗ & ಪ್ರಧಾನ ರಕ್ಷಾ ಸ್ತೋತ್ರ."
                    : isMr
                    ? "संपूर्ण १६ पानांचा अहवाल, वार्षिक भविष्य, सुवर्ण संचय योग व सिद्ध रक्षा स्तोत्र."
                    : isHi
                    ? "सम्पूर्ण १६ पृष्ठीय अहवाल, वार्षिक भविष्यफल, सुवर्ण संचय योग एवं सिद्ध रक्षा स्तोत्र।"
                    : "Full 16-page 5-year timeline, yearly milestones, gold & jewelry forecast, and prescribed stotra."}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-amber-400/90 bg-slate-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                  🪙 3,500 Coins
                </span>
              </button>

              {/* Option 2: Consecrated Remedies & Shanti (₹450 / 4,500 Coins) */}
              <button
                type="button"
                onClick={() => {
                  if (!isPaymentVerified) setSelectedPackage("remedy_450");
                }}
                disabled={isPaymentVerified || isGeneratingPdf}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                  selectedPackage === "remedy_450"
                    ? "bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-transparent border-amber-300 shadow-xl ring-2 ring-yellow-400/60"
                    : "bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60 opacity-80"
                }`}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  POPULAR
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-100">
                    🪔 {isKn ? "ಜಾತಕ + ಗೋಕರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ" : isMr ? "पत्रिका + गोकर्ण शास्त्रोक्त उपाय" : isHi ? "कुंडली + गोकर्ण शास्त्रोक्त उपाय" : "With Consecrated Remedies"}
                  </span>
                  <span className="text-sm font-black text-yellow-300">₹450</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-snug">
                  {isKn
                    ? "ಸ್ಟ್ಯಾಂಡರ್ಡ್ ಜಾತಕದ ಜೊತೆಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಅರ್ಚಕರ ವೈಯಕ್ತಿಕ ಶಾಂತಿ ಸಂಕಲ್ಪ, ವಾರ್ಷಿಕ ಪರಿಹಾರಗಳು & ದೋಷ ನಿವಾರಣೆ."
                    : isMr
                    ? "स्टँडर्ड अहवालासह गोकर्ण महाबळेश्वर शांती संकल्प, वर्षनिहाय विशेष उपाय व दोष निवारण."
                    : isHi
                    ? "स्टैंडर्ड कुंडली के साथ गोकर्ण महाबलेश्वर शांति संकल्प, वर्षवार विशेष उपाय एवं दोष निवारण।"
                    : "Full 16-page blueprint PLUS Gokarna Priest Sankalpa, annual remedial rituals & dosha counter-measures."}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded border border-amber-400/40">
                  🪙 4,500 Coins
                </span>
              </button>
            </div>
          </div>

          {/* Payment & Verification Gateway Section (or Super Admin VIP Free Access) */}
          {isMasterOrSuperAdmin ? (
            <div className="bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-2 border-yellow-400/90 rounded-2xl p-5 space-y-2.5 shadow-xl text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-yellow-400/30 border border-yellow-300 rounded-full text-xs font-black text-yellow-200 uppercase tracking-widest shadow-xs">
                <span>👑</span>
                <span>
                  {isKn ? "ಸೂಪರ್ ಅಡ್ಮಿನ್ ವಿಶೇಷ ಪ್ರವೇಶ (Super Admin VIP Access)"
                    : isMr ? "सुपर ॲडमिन विशेष प्रवेश (Super Admin VIP)"
                    : isHi ? "सुपर एडमिन विशेष अधिकार (Super Admin VIP)"
                    : isTe ? "సూపర్ అడ్మిన్ ప్రత్యేక ప్రవేశం (Super Admin VIP)"
                    : isTa ? "சூப்பர் அட்மின் விஐபி அணுகல் (Super Admin VIP)"
                    : "Super Admin Sovereign VIP Access"}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-yellow-100 font-serif">
                {isKn ? "ಅನಿಯಮಿತ ಉಚಿತ ಡೌನ್‌ಲೋಡ್ ಸೌಲಭ್ಯ ಸಕ್ರಿಯವಾಗಿದೆ"
                  : isMr ? "अमर्यादित मोफत डाउनलोड सुविधा सक्रिय आहे"
                  : isHi ? "असीमित निःशुल्क डाउनलोड सुविधा सक्रिय है"
                  : isTe ? "అపరిమిత ఉచిత డౌన్‌లోడ్ సదుపాయం ప్రారంభించబడింది"
                  : isTa ? "வரம்பற்ற இலவச பதிவிறக்க வசதி செயல்படுத்தப்பட்டுள்ளது"
                  : "Unrestricted Free 5-Year Report Download Unlocked"}
              </h4>
              <p className="text-xs text-amber-200/90 max-w-xl mx-auto leading-relaxed">
                {isKn
                  ? "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಖಾತೆಗೆ ಯಾವುದೇ ಪಾವತಿ ಶುಲ್ಕ ಅಥವಾ ವ್ಯಾಲೆಟ್ ನಾಣ್ಯಗಳ ಕಡಿತ ಇರುವುದಿಲ್ಲ. ನೀವು ೫ ವರ್ಷಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಜಾತಕವನ್ನು ತಕ್ಷಣವೇ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು."
                  : isMr
                  ? "सुपर ॲडमिनसाठी कोणतेही शुल्क अथवा नाणी कपात केली जाणार नाही. आपण ५ वर्षांचा संपूर्ण महा अहवाल त्वरित डाउनलोड करू शकता."
                  : isHi
                  ? "सुपर एडमिन हेतु कोई शुल्क अथवा सिक्का कटौती नहीं होगी। आप ५-वर्षीय संपूर्ण महा कुंडली तत्काल डाउनलोड कर सकते हैं।"
                  : isTe
                  ? "సూపర్ అడ్మిన్ ఖాతాకు ఎలాంటి చెల్లింపు లేదా నాణేల కోత ఉండదు. మీరు పూర్తి 5 సంవత్సరాల మహా జాతకాన్ని వెంటనే డౌన్‌లోడ్ చేసుకోవచ్చు."
                  : isTa
                  ? "சூப்பர் அட்மின் கணக்கிற்கு கட்டணம் அல்லது நாணயக் கழிப்பு இல்லை. முழுமையான 5 ஆண்டு ஜாதகத்தை உடனடியாகப் பதிவிறக்கலாம்."
                  : "Zero fees and zero wallet coin deductions for Super Admin. You can download the complete 5-Year Master Destiny Report immediately."}
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
                <div>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💳</span>
                    <span>
                      {isKn ? `೨. ಅಧಿಕೃತ ಮುದ್ರಣ PDF ಪಾವತಿ & ಅನ್‌ಲಾಕ್ ಗೇಟ್‌ವೇ (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} ನಾಣ್ಯಗಳು)`
                        : isMr ? `२. अधिकृत प्रिंट PDF देयक व अनलॉक (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} नाणी)`
                        : isHi ? `२. आधिकारिक प्रिंट PDF भुगतान एवं अनलॉक (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} सिक्के)`
                        : `2. Official Printable PDF Payment & Verification (₹${packagePrice} / ${packageCoins.toLocaleString()} Coins)`}
                    </span>
                  </span>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    {isKn ? "ಪಾವತಿ ದೃಢೀಕರಣದ ನಂತರವೇ ಅಧಿಕೃತ ೫ ವರ್ಷಗಳ ಜಾತಕ PDF ಡೌನ್‌ಲೋಡ್ ಲಭ್ಯವಾಗುತ್ತದೆ."
                      : isMr ? "देयक पडताळणीनंतरच ५ वर्षांचा अधिकृत कुंडली अहवाल PDF उपलब्ध होईल."
                      : isHi ? "भुगतान सत्यापन के उपरांत ही ५-वर्षीय आधिकारिक कुंडली PDF डाउनलोड उपलब्ध होगी।"
                      : "The 5-Year Destiny Blueprint PDF download unlocks immediately upon payment verification."}
                  </p>
                </div>

                {isPaymentVerified ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-full text-xs font-black shadow-xs">
                    <span>✓</span>
                    <span>{isKn ? "ಪಾವತಿ ದೃಢಪಟ್ಟಿದೆ" : isMr ? "देयक पडताळले" : isHi ? "भुगतान सत्यापित" : "Payment Verified"}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-amber-900/60 border border-amber-400/60 text-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                    <span>🔒</span>
                    <span>{isKn ? "ಪಾವತಿ ಬಾಕಿ ಇದೆ" : isMr ? "देयक प्रलंबित" : isHi ? "भुगतान लंबित" : "Payment Required"}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector Tabs */}
              {!isPaymentVerified && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-amber-500/30">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "upi"
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-amber-200 hover:text-white"
                    }`}
                  >
                    <span>📱</span>
                    <span>{isKn ? `UPI QR ಕೋಡ್ / UPI ಆ್ಯಪ್‌ಗಳು (₹${formatNumber6L(packagePrice, selectedLang)})` : isMr ? `UPI QR कोड / ॲप्स (₹${formatNumber6L(packagePrice, selectedLang)})` : isHi ? `UPI QR कोड / ऐप्स (₹${formatNumber6L(packagePrice, selectedLang)})` : `UPI QR Code / Apps (₹${packagePrice})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "wallet"
                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-amber-200 hover:text-white"
                    }`}
                  >
                    <span>🪙</span>
                    <span>{isKn ? `ವ್ಯಾಲೆಟ್ ನಾಣ್ಯಗಳು (${formatNumber6L(packageCoins, selectedLang)} Coins)` : isMr ? `वॉलेट नाणी (${formatNumber6L(packageCoins, selectedLang)} Coins)` : isHi ? `वॉलेट सिक्के (${formatNumber6L(packageCoins, selectedLang)} Coins)` : `Wallet Coins (${packageCoins.toLocaleString()} Coins)`}</span>
                  </button>
                </div>
              )}

              {/* Verified Banner */}
              {isPaymentVerified && (
                <div className="bg-emerald-950/70 border-2 border-emerald-400/70 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-3xl text-emerald-400">✓</span>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-emerald-200">
                      {isKn ? "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢಪಟ್ಟಿದೆ!" : isMr ? "देयक यशस्वीपणे पडताळले गेले आहे!" : isHi ? "भुगतान सफलतापूर्वक सत्यापित हो गया है!" : "Payment Successfully Verified!"}
                    </h4>
                    <p className="text-xs text-emerald-300/80">
                      {verifiedReference} • {isKn ? "ನಿಮ್ಮ ೫ ವರ್ಷಗಳ ಅಧಿಕೃತ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಕೆಳಗಿನ ಹಳದಿ ಬಟನ್ ಒತ್ತಿರಿ." : isMr ? "आपली ५ वर्षांची अधिकृत PDF डाउनलोड करण्यासाठी खालील बटण दाबा." : isHi ? "अपनी ५-वर्षीय आधिकारिक PDF डाउनलोड करने के लिए नीचे दिए गए बटन पर क्लिक करें।" : "Click the button below to download your consecrated 5-year destiny blueprint PDF."}
                    </p>
                  </div>
                </div>
              )}

              {/* UPI QR Payment Pane */}
              {!isPaymentVerified && paymentMethod === "upi" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border-2 border-amber-400 shadow-md">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`UPI QR Code - ₹${packagePrice}`}
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">
                        QR Code Loading...
                      </div>
                    )}
                    <div className="mt-2 text-center text-slate-900">
                      <span className="text-xs font-black block">ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)</span>
                      <span className="text-[11px] font-mono font-bold text-amber-800 block">9108135387@ybl</span>
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        ₹{formatNumber6L(packagePrice, selectedLang)} ({selectedPackage === "remedy_450" ? "With Remedies" : "Standard"})
                      </span>
                    </div>
                  </div>

                  {/* UPI Intent Apps & UTR Entry */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        {isKn ? "೧. ಮೊಬೈಲ್ UPI ಆ್ಯಪ್ ಮೂಲಕ ತ್ವರಿತವಾಗಿ ಪಾವತಿಸಿ:" : isMr ? "१. मोबाईल UPI ॲपद्वारे त्वरित भरा:" : isHi ? "१. मोबाइल UPI ऐप द्वारा तुरंत भुगतान करें:" : "1. Quick Pay via Mobile UPI App:"}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={phonePeUri}
                          className="px-2 py-1.5 bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 rounded-lg text-center text-[11px] font-bold text-purple-200 transition-all"
                        >
                          PhonePe
                        </a>
                        <a
                          href={gPayUri}
                          className="px-2 py-1.5 bg-blue-900/80 hover:bg-blue-800 border border-blue-400/50 rounded-lg text-center text-[11px] font-bold text-blue-200 transition-all"
                        >
                          Google Pay
                        </a>
                        <a
                          href={paytmUri}
                          className="px-2 py-1.5 bg-cyan-900/80 hover:bg-cyan-800 border border-cyan-400/50 rounded-lg text-center text-[11px] font-bold text-cyan-200 transition-all"
                        >
                          Paytm
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
                      <label className="text-[11px] font-bold text-amber-300 block">
                        {isKn ? "೨. ಪಾವತಿಸಿದ ನಂತರ ೧೨ ಅಂಕಿಗಳ UTR / Ref ನಂಬರ್ ನಮೂದಿಸಿ:"
                          : isMr ? "२. देयकानंतर १२ अंकी UTR / संदर्भ क्रमांक टाका:"
                          : isHi ? "२. भुगतान पश्चात १२ अंकों का UTR / संदर्भ क्रमांक दर्ज करें:"
                          : "2. Enter 12-Digit UPI UTR / Reference Number:"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          placeholder="e.g. 412389123456"
                          className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyUtr}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                        >
                          {isKn ? "ದೃಢೀಕರಿಸಿ" : isMr ? "पडताळा" : isHi ? "सत्यापित करें" : "Verify"}
                        </button>
                      </div>
                      {utrError && (
                        <p className="text-[11px] text-red-400 font-semibold">{utrError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Coins Payment Pane */}
              {!isPaymentVerified && paymentMethod === "wallet" && (
                <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      🪙 {isKn ? "ನಿಮ್ಮ ಹಾಲಿ ವ್ಯಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್:" : isMr ? "आपली शिल्लक नाणी:" : isHi ? "आपका वर्तमान वॉलेट बैलेंस:" : "Your Current Coin Balance:"}
                    </span>
                    <span className="text-sm font-black text-yellow-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40">
                      {formatNumber6L(wallet?.coinBalance || 0, selectedLang)} Coins
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-amber-200/90 border-t border-amber-500/20 pt-2">
                    <span>{isKn ? "೫ ವರ್ಷಗಳ PDF ಸೇವಾ ಶುಲ್ಕ:" : isMr ? "५ वर्षांचे PDF सेवा शुल्क:" : isHi ? "५-वर्षीय PDF सेवा शुल्क:" : "5-Year PDF Service Cost:"}</span>
                    <span className="font-bold text-amber-300">
                      {formatNumber6L(packageCoins, selectedLang)} Coins (₹{formatNumber6L(packagePrice, selectedLang)})
                    </span>
                  </div>

                  {coinsError && (
                    <p className="text-xs text-red-400 font-semibold bg-red-950/50 p-2 rounded-lg border border-red-500/30">
                      {coinsError}
                    </p>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleDeductCoins}
                      disabled={isDeductingCoins}
                      className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        wallet && wallet.coinBalance >= packageCoins
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950"
                          : "bg-slate-800 text-amber-400/60 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      <span>🪙</span>
                      <span>
                        {isDeductingCoins
                          ? (isKn ? "ನಾಣ್ಯಗಳನ್ನು ಕಡಿತಗೊಳಿಸಲಾಗುತ್ತಿದೆ..." : "Deducting Coins...")
                          : wallet && wallet.coinBalance >= packageCoins
                          ? (isKn ? `${formatNumber6L(packageCoins, selectedLang)} ನಾಣ್ಯಗಳನ್ನು ಕಡಿತಗೊಳಿಸಿ PDF ಅನ್‌ಲಾಕ್ ಮಾಡಿ` : isMr ? `${formatNumber6L(packageCoins, selectedLang)} नाणी वजा करून PDF अनलॉक करा` : isHi ? `${formatNumber6L(packageCoins, selectedLang)} सिक्के काटकर PDF अनलॉक करें` : `Deduct ${packageCoins.toLocaleString()} Coins & Unlock PDF`)
                          : (isKn ? "ನಾಣ್ಯಗಳ ಕೊರತೆ (ದಯವಿಟ್ಟು UPI QR ಬಳಸಿ)" : isMr ? "नाणी अपुरी आहेत (कृपया UPI QR वापरा)" : isHi ? "सिक्के अपर्याप्त (कृपया UPI QR का उपयोग करें)" : "Insufficient Coins (Please use UPI QR)")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
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
              <span>
                ₹{formatNumber6L(packagePrice, selectedLang)} ({formatNumber6L(packageCoins, selectedLang)} Coins)
                {selectedPackage === "remedy_450" && (
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 ml-1.5 font-bold">
                    {isKn ? "ಪರಿಹಾರ ಸಹಿತ" : isMr ? "उपाय सह" : isHi ? "उपाय सहित" : "With Remedies"}
                  </span>
                )}
              </span>
            </span>
            <p className="text-[11px] text-amber-300/80">
              {selectedPackage === "remedy_450"
                ? (isKn
                  ? "ಸಂಪೂರ್ಣ ೧೬ ಪುಟಗಳ ಮುದ್ರಣ ಆವೃತ್ತಿ • ವರ್ಷವಾರು ಭವಿಷ್ಯ • ಗೋಕರ್ಣ ಶಾಂತಿ ಸಂಕಲ್ಪ • ಸಿದ್ಧ ಪರಿಹಾರಗಳು"
                  : isMr
                  ? "संपूर्ण १६ पानांची प्रिंट आवृत्ती • वर्षनिहाय भविष्य • गोकर्ण शांती संकल्प • सिद्ध उपाय"
                  : isHi
                  ? "सम्पूर्ण १६ पृष्ठीय प्रिंट संस्करण • वार्षिक भविष्यफल • गोकर्ण शांति संकल्प • सिद्ध उपाय"
                  : isTe
                  ? "పూర్తి 16 పేజీల ముద్రణ కాపీ • వార్షిక ఫలితాలు • గోకర్ణ శాంతి సంకల్పం • సిద్ధ పరిహారాలు"
                  : isTa
                  ? "முழுமையான 16 பக்க அச்சு பதிப்பு • வருடாந்திர கணிப்புகள் • கோகர்ண சாந்தி சங்கல்பம் • பரிகாரங்கள்"
                  : "Complete 16-Page Printable Edition • Yearly Timeline • Gokarna Sankalpa • Consecrated Remedies")
                : (isKn
                  ? "ಪೂರ್ಣ ೫ ವರ್ಷಗಳ ಮುದ್ರಣ ಆವೃತ್ತಿ • ವರ್ಷವಾರು ಭವಿಷ್ಯ • ನಗನಾಣ್ಯ ಯೋಗ • ರಕ್ಷಾ ಸ್ತೋತ್ರ"
                  : isMr
                  ? "संपूर्ण ५ वर्षांची प्रिंट आवृत्ती • वर्षनिहाय भविष्य • सुवर्ण संचय योग • रक्षा स्तोत्र"
                  : isHi
                  ? "सम्पूर्ण ५ वर्षीय प्रिंट संस्करण • वार्षिक भविष्यफल • स्वर्ण संचय योग • रक्षा स्तोत्र"
                  : isTe
                  ? "పూర్తి 5 సంవత్సరాల ముద్రణ కాపీ • వార్షిక ఫలితాలు • నగల సేకరణ • రక్షా స్తోత్రం"
                  : isTa
                  ? "முழுமையான 5 ஆண்டு அச்சு பதிப்பு • வருடாந்திர கணிப்புகள் • ஆபரண யோகம் • ரக்ஷா ஸ்தோத்திரம்"
                  : "Complete 5-Year Printable Edition • Yearly Timeline • Gold Accumulation • Stotra")}
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
              disabled={(!isPaymentVerified && !isMasterOrSuperAdmin) || isGeneratingPdf}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 shadow-xl border-2 ${
                !isPaymentVerified && !isMasterOrSuperAdmin
                  ? "bg-slate-800 text-amber-400/50 border-slate-700 cursor-not-allowed opacity-60"
                  : isGeneratingPdf
                  ? "bg-amber-500 text-slate-950 border-yellow-200 cursor-not-allowed opacity-75"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:via-yellow-300 hover:to-orange-400 text-slate-950 border-yellow-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              }`}
            >
              <span className="text-base">{(!isPaymentVerified && !isMasterOrSuperAdmin) ? "🔒" : isMasterOrSuperAdmin ? "👑" : "📜✨"}</span>
              <span>
                {isGeneratingPdf
                  ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : isMr ? "तयार होत आहे..." : isHi ? "तैयार हो रहा है..." : isTe ? "సిద్ధమవుతోంది..." : isTa ? "தயாராகிறது..." : "Crafting...")
                  : isMasterOrSuperAdmin
                  ? (isKn ? "👑 ೫ ವರ್ಷಗಳ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (ಉಚಿತ ಸೂಪರ್ ಅಡ್ಮಿನ್)"
                    : isMr ? "👑 ५ वर्षांची PDF डाउनलोड करा (मोफत ॲडमिन)"
                    : isHi ? "👑 ५-वर्षीय PDF डाउनलोड करें (निःशुल्क एडमिन)"
                    : isTe ? "👑 5 సంవత్సరాల PDF డౌన్‌లోడ్ చేసుకోండి (సూపర్ అడ్మిన్)"
                    : isTa ? "👑 5 ஆண்டு PDF பதிவிறக்குக (சூப்பர் அட்மின்)"
                    : "👑 Download 5-Year PDF (Super Admin Pass)")
                  : !isPaymentVerified
                  ? (isKn ? `🔒 ಮೊದಲು ಪಾವತಿ ದೃಢೀಕರಿಸಿ (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} ನಾಣ್ಯ)`
                    : isMr ? `🔒 देयकाची पडताळणी करा (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} नाणी)`
                    : isHi ? `🔒 भुगतान सत्यापन पश्चात डाउनलोड (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} सिक्के)`
                    : isTe ? `🔒 చెల్లింపు ధృవీకరించండి (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} నాణేలు)`
                    : isTa ? `🔒 கட்டண சரிபார்ப்பிற்குப் பின் பெறுக (₹${formatNumber6L(packagePrice, selectedLang)} / ${formatNumber6L(packageCoins, selectedLang)} நாணயங்கள்)`
                    : `🔒 Verify Payment to Unlock (₹${packagePrice} / ${packageCoins.toLocaleString()} Coins)`)
                  : (isKn ? `₹${formatNumber6L(packagePrice, selectedLang)} ರ ಭವಿಷ್ಯ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (ದೃಢಪಟ್ಟಿದೆ)`
                    : isMr ? `₹${formatNumber6L(packagePrice, selectedLang)} भविष्य PDF डाउनलोड करा (पडताळणी पूर्ण)`
                    : isHi ? `₹${formatNumber6L(packagePrice, selectedLang)} भविष्य PDF डाउनलोड करें (सत्यापित)`
                    : isTe ? `₹${formatNumber6L(packagePrice, selectedLang)} భవిష్యత్ PDF డౌన్‌లోడ్ చేసుకోండి (ధృవీకరించబడింది)`
                    : isTa ? `₹${formatNumber6L(packagePrice, selectedLang)} எதிர்கால PDF பதிவிறக்குக (சரிபார்க்கப்பட்டது)`
                    : `Download 5-Year PDF (₹${packagePrice} Verified)`)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
