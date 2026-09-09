import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "../../features/wallet/walletStore";
import {
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_UPI_NAME,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  generateUpiPayUri,
  generatePhonePeUri,
  generateGPayUri,
  generatePaytmUri,
  type CoinPackage
} from "../../features/wallet/walletTypes";

export interface FallingCoinsRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCoins?: number;
  serviceTitle?: string;
  currentCoins?: number;
}

export const FallingCoinsRefillModal: React.FC<FallingCoinsRefillModalProps> = ({
  isOpen,
  onClose,
  requiredCoins,
  serviceTitle,
  currentCoins
}) => {
  const {
    wallet,
    selectedPackage,
    isSubmittingRecharge,
    error,
    successMessage,
    setSelectedPackage,
    submitUpiRecharge,
    clearMessages
  } = useWalletStore();

  const [upiUtr, setUpiUtr] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [rechargeCompleted, setRechargeCompleted] = useState<boolean>(false);
  const [creditedCoinsDisplay, setCreditedCoinsDisplay] = useState<number>(0);

  // Compute effective INR amount and Coins
  const parsedCustom = parseInt(customAmount, 10);
  const effectiveAmountInr = isCustomMode && !isNaN(parsedCustom) && parsedCustom > 0
    ? parsedCustom
    : selectedPackage.amountInr;

  const effectiveCoins = isCustomMode && !isNaN(parsedCustom) && parsedCustom > 0
    ? parsedCustom * 10
    : selectedPackage.totalCoins;

  const upiId = DEFAULT_PRIEST_UPI_ID;
  const payeeName = DEFAULT_PRIEST_UPI_NAME;
  const note = `PanchangaSeva`;

  const upiUri = generateUpiPayUri(effectiveAmountInr, note);
  const phonePeUri = generatePhonePeUri(effectiveAmountInr, note);
  const gPayUri = generateGPayUri(effectiveAmountInr, note);
  const paytmUri = generatePaytmUri(effectiveAmountInr, note);

  // Generate Scannable Dynamic PhonePe / Google Pay QR Code
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(upiUri, {
        width: 240,
        margin: 1,
        color: {
          dark: "#0a0a0a",
          light: "#ffffff"
        },
        errorCorrectionLevel: "H"
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [upiUri, isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Instant 1-Click Coin Loader
  const handleInstantCoinLoad = async () => {
    const res = await submitUpiRecharge(
      upiUtr.trim() || undefined,
      effectiveAmountInr,
      effectiveCoins
    );
    if (res.success) {
      setCreditedCoinsDisplay(effectiveCoins);
      setRechargeCompleted(true);
      setUpiUtr("");
    }
  };

  const handleClose = () => {
    clearMessages();
    setRechargeCompleted(false);
    onClose();
  };

  const effectiveBalance = currentCoins !== undefined ? currentCoins : (wallet?.coinBalance ?? 0);
  const isZeroOrLow = effectiveBalance < (requiredCoins ?? 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900">
        
        {/* 1. FIXED TOP HEADER */}
        <div className="sticky top-0 z-30 bg-[#FFFDF7]/98 backdrop-blur-md border-b-2 border-amber-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md border border-amber-400 shrink-0">
              🏺
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-amber-950 truncate leading-tight">
                ಅಕ್ಷಯ ಪಾತ್ರೆ • ನಾಣ್ಯ ರೀಚಾರ್ಜ್ (PhonePe / GPay Refill)
              </h2>
              <p className="text-[11px] text-amber-800 font-bold">
                ಪ್ರಸ್ತುತ ಬ್ಯಾಲೆನ್ಸ್:{" "}
                <span className="font-extrabold text-amber-950 font-mono text-xs">
                  {effectiveBalance.toLocaleString()} 🪙
                </span>
                {isZeroOrLow && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded-md text-[9px] font-black uppercase animate-pulse">
                    ⚠️ ಕೊರತೆ
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-red-600 hover:text-white text-amber-950 font-black rounded-xl border border-amber-300 transition-all text-xs shadow-xs active:scale-95 shrink-0 cursor-pointer"
            aria-label="Close"
            title="ಮುಚ್ಚಿ (Close Window)"
          >
            <span>✕</span>
            <span className="hidden xs:inline">ಮುಚ್ಚಿ</span>
          </button>
        </div>

        {/* 2. SCROLLABLE INNER BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Success Banner when Coins Loaded */}
          {rechargeCompleted ? (
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-emerald-100/70 to-teal-50 border-2 border-emerald-500 rounded-3xl text-center space-y-3 shadow-lg animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-md border-2 border-emerald-300 animate-bounce">
                ✓
              </div>
              <h3 className="text-lg font-black text-emerald-950">
                ✨ ನಾಣ್ಯಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!
              </h3>
              <p className="text-xs text-emerald-900 font-bold max-w-md mx-auto leading-relaxed">
                ₹{effectiveAmountInr} ಪಾವತಿ ಸ್ವೀಕೃತವಾಗಿದೆ. ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ{" "}
                <strong className="text-base text-emerald-950 font-mono">+{creditedCoinsDisplay.toLocaleString()} ನಾಣ್ಯಗಳು</strong>{" "}
                ತಕ್ಷಣವೇ ಜಮೆಯಾಗಿವೆ.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  🚀 ಸೇವೆಯನ್ನು ಮುಂದುವರಿಸಿ (Continue)
                </button>
                <button
                  type="button"
                  onClick={() => setRechargeCompleted(false)}
                  className="px-4 py-2 bg-white/80 hover:bg-white text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-all cursor-pointer"
                >
                  + ಇನ್ನಷ್ಟು ನಾಣ್ಯಗಳನ್ನು ಸೇರಿಸಿ (Add More)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Required Coins Warning Banner */}
              {requiredCoins && requiredCoins > 0 && isZeroOrLow && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-2xl flex items-center gap-3 text-xs text-red-950 font-bold shadow-xs">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div>
                    <div className="font-black text-red-900">
                      {serviceTitle || "ಈ ಸೇವೆಗೆ"} ಕನಿಷ್ಠ {requiredCoins.toLocaleString()} ನಾಣ್ಯಗಳು (₹{Math.round(requiredCoins / 10)}) ಅಗತ್ಯವಿದೆ.
                    </div>
                    <div className="text-[11px] text-red-800 font-medium">
                      ನಿಮ್ಮ ವಾಲೆಟ್‌ನಲ್ಲಿ {(wallet?.coinBalance ?? 0).toLocaleString()} ನಾಣ್ಯಗಳಿವೆ. ಕೆಳಗಿನ PhonePe / GPay ಸ್ಕ್ಯಾನರ್ ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ತಕ್ಷಣವೇ ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ.
                    </div>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-900 text-xs font-bold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                  <button type="button" onClick={() => clearMessages()} className="text-red-700 font-black px-1 cursor-pointer">✕</button>
                </div>
              )}

              {/* 1. SELECT AMOUNT / PACKAGE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>೧.</span>
                    <span>ಮೊತ್ತ ಆಯ್ಕೆಮಾಡಿ (Select Amount • ₹1 = 10 Coins):</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    ⚡ ತಕ್ಷಣದ ಕ್ರೆಡಿಟ್
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Preset Packages */}
                  {[
                    { amount: 50, coins: 500, label: "ಆರಂಭ", bonus: "500 🪙" },
                    { amount: 100, coins: 1100, label: "ಶುಭ ಆರಂಭ", bonus: "+10% ಬೋನಸ್" },
                    { amount: 250, coins: 3000, label: "ಸಿಲ್ವರ್", bonus: "+20% ಬೋನಸ್", popular: true },
                    { amount: 500, coins: 6500, label: "ಗೋಲ್ಡ್", bonus: "+30% ಬೋನಸ್" },
                    { amount: 1000, coins: 14000, label: "ಪ್ಲಾಟಿನಂ", bonus: "+40% ಬೋನಸ್" }
                  ].map((preset) => {
                    const isSelected = !isCustomMode && effectiveAmountInr === preset.amount;
                    return (
                      <button
                        key={preset.amount}
                        type="button"
                        onClick={() => {
                          setIsCustomMode(false);
                          const matchingPkg = RECHARGE_PACKAGES.find(p => p.amountInr === preset.amount) || {
                            key: `custom_${preset.amount}`,
                            name: preset.label,
                            kannadaName: preset.label,
                            amountInr: preset.amount,
                            baseCoins: preset.amount * 10,
                            bonusCoins: preset.coins - (preset.amount * 10),
                            totalCoins: preset.coins,
                            effectiveRateText: ""
                          };
                          setSelectedPackage(matchingPkg);
                        }}
                        className={`relative p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FEFCF4] border-amber-600 shadow-md ring-2 ring-amber-400 scale-[1.02]"
                            : "bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50/50"
                        }`}
                      >
                        {preset.popular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full bg-amber-600 text-white shadow-xs">
                            ಜನಪ್ರಿಯ
                          </span>
                        )}
                        <div className="text-base font-black text-emerald-800">
                          ₹{preset.amount}
                        </div>
                        <div className="text-[11px] font-mono font-black text-amber-950">
                          {preset.coins.toLocaleString()} 🪙
                        </div>
                        <div className="text-[9px] text-amber-800 font-bold mt-0.5">
                          {preset.bonus}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. THE DEDICATED PHONEPE & GOOGLE PAY SCANNER CARD */}
              <div className="bg-gradient-to-br from-[#FFFDF7] via-white to-amber-50/80 border-2 border-amber-400 rounded-3xl p-5 shadow-lg space-y-4">
                
                {/* Header with App Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200">
                  <div>
                    <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider">
                      ೨. ಅಧಿಕೃತ ಸ್ಕ್ಯಾನರ್ • OFFICIAL SCANNER
                    </span>
                    <h3 className="text-base font-black text-amber-950 flex items-center gap-1.5">
                      <span>📱</span>
                      <span>PhonePe ಅಥವಾ Google Pay ಮೂಲಕ ₹{effectiveAmountInr} ಪಾವತಿಸಿ</span>
                    </h3>
                  </div>

                  {/* Brand Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#5f259f] text-white text-[10px] font-black tracking-wide shadow-xs">
                      PhonePe
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-[10px] font-black tracking-wide shadow-xs flex items-center gap-1">
                      <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">P</span><span className="text-[#FBBC05]">a</span><span className="text-[#34A853]">y</span>
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-[#002970] text-white text-[10px] font-black tracking-wide shadow-xs">
                      Paytm
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black tracking-wide">
                      BHIM UPI
                    </span>
                  </div>
                </div>

                {/* Central Scanner Presentation */}
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  
                  {/* Large Crisp QR Code */}
                  <div className="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-amber-400 shadow-md shrink-0">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="PhonePe / Google Pay QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                        ಸ್ಕ್ಯಾನರ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...
                      </div>
                    )}
                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-mono font-black text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        Scan to Pay ₹{effectiveAmountInr}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Direct 1-Tap Buttons & UPI Details */}
                  <div className="flex-1 w-full space-y-3">
                    
                    {/* Direct App Launchers for Mobile */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-950">
                        ಮೊಬೈಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಪಾವತಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ (1-Tap Pay):
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* PhonePe Direct */}
                        <a
                          href={phonePeUri}
                          className="py-2.5 px-3 bg-[#5f259f] hover:bg-[#4d1d82] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>🟣 PhonePe</span>
                        </a>

                        {/* Google Pay Direct */}
                        <a
                          href={gPayUri}
                          className="py-2.5 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>🔵 Google Pay</span>
                        </a>
                      </div>

                      {/* Universal Any UPI */}
                      <a
                        href={upiUri}
                        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>📲 Open Any UPI App (₹{effectiveAmountInr})</span>
                      </a>
                    </div>

                    {/* UPI ID Details */}
                    <div className="p-2.5 bg-[#FFFDF7] border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-black">ಸ್ವೀಕರಿಸುವವರ ಹೆಸರು / UPI ID</div>
                        <div className="font-bold text-amber-950">{payeeName}</div>
                        <div className="font-mono text-xs font-black text-amber-900">{upiId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black rounded-lg border border-amber-300 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                      >
                        {copiedUpi ? "✓ ನಕಲಿಸಲಾಗಿದೆ" : "Copy UPI"}
                      </button>
                    </div>

                    {/* Safe Instruction */}
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                      💡 PhonePe ಅಥವಾ Google Pay ನಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿದ ತಕ್ಷಣ, ಕೆಳಗಿನ ಹಸಿರು ಬಟನ್ ಒತ್ತಿ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ.
                    </p>
                  </div>
                </div>

                {/* 3. PRIMARY ACTION: INSTANT COIN LOADER BUTTON */}
                <div className="pt-2 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={handleInstantCoinLoad}
                    disabled={isSubmittingRecharge}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border-2 border-emerald-400 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-xl">⚡</span>
                    <span>
                      {isSubmittingRecharge
                        ? "ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..."
                        : `ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿದ್ದೇನೆ • +${effectiveCoins.toLocaleString()} ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Optional UTR / Reference Helper (Never Blocking) */}
              <div className="p-3 bg-[#FFFDF7] border border-amber-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">
                    ೧೨-ಅಂಕಿಯ UPI UTR ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ / Optional - ಅಗತ್ಯವಿದ್ದರೆ ಮಾತ್ರ ನಮೂದಿಸಿ):
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">ಬ್ಯಾಂಕಿಂಗ್ ರೆಫರೆನ್ಸ್</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                    placeholder="ಉದಾ: 423512345678 (ಐಚ್ಛಿಕ)"
                    maxLength={18}
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,\nನನ್ನ ಯೂಸರ್ ID (${wallet?.userId || "Devotee"}) ಗೆ ₹${effectiveAmountInr} (${effectiveCoins.toLocaleString()} Coins) PhonePe/GPay ಮೂಲಕ ರೀಚಾರ್ಜ್ ಮಾಡಿದ್ದೇನೆ.\nUTR: ${upiUtr || "Done"}`
                      );
                      window.open(`https://api.whatsapp.com/send?phone=91${DEFAULT_PRIEST_MOBILE_NUMBER}&text=${msg}`, "_blank");
                    }}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold rounded-xl border border-emerald-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>📲 WhatsApp ರಸೀದಿ</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* 3. FIXED BOTTOM BAR */}
        <div className="bg-[#FFFDF7] border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-amber-800 font-bold">
            ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ({DEFAULT_PRIEST_MOBILE_NUMBER}) ॥
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black rounded-xl border border-amber-300 transition-all text-xs active:scale-95 cursor-pointer"
          >
            ✕ ಮುಚ್ಚಿ (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
