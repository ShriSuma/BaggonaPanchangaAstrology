import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "../../features/wallet/walletStore";
import {
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
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

  const amountInr = selectedPackage.amountInr;
  const upiId = DEFAULT_PRIEST_UPI_ID;
  const payeeName = "Baggona Panchanga";
  const note = `COINS-${selectedPackage.key.toUpperCase()}-${wallet?.userId || "PRIEST"}`;

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amountInr.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(upiUri, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
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

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiUtr.trim()) return;

    const res = await submitUpiRecharge(upiUtr);
    if (res.success) {
      setUpiUtr("");
    }
  };

  const handleClose = () => {
    clearMessages();
    onClose();
  };

  const effectiveBalance = currentCoins !== undefined ? currentCoins : (wallet?.coinBalance ?? 0);
  const isZeroOrLow = effectiveBalance < (requiredCoins ?? 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900">
        
        {/* 1. FIXED STICKY TOP HEADER */}
        <div className="sticky top-0 z-30 bg-[#FFFDF7]/98 backdrop-blur-md border-b-2 border-amber-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md border border-amber-400 shrink-0">
              🏺
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-amber-950 truncate leading-tight">
                ಅಕ್ಷಯ ಪಾತ್ರೆ • ನಾಣ್ಯ ರೀಚಾರ್ಜ್ (Wallet Refill)
              </h2>
              <p className="text-[11px] text-amber-800 font-bold">
                ಬ್ಯಾಲೆನ್ಸ್:{" "}
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
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-red-600 hover:text-white text-amber-950 font-black rounded-xl border border-amber-300 transition-all text-xs shadow-xs active:scale-95 shrink-0"
            aria-label="Close"
            title="ಮುಚ್ಚಿ (Close Window)"
          >
            <span>✕</span>
            <span className="hidden xs:inline">ಮುಚ್ಚಿ</span>
          </button>
        </div>

        {/* 2. SCROLLABLE INNER BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Animated Falling Coins Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-amber-950 to-slate-950 p-4 border-2 border-amber-400 shadow-md text-amber-50 flex items-center justify-between gap-4">
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-amber-300 select-none animate-bounce"
                  style={{
                    left: `${(i * 8.5) + 3}%`,
                    top: `${(i % 4) * 15}%`,
                    fontSize: `${14 + (i % 3) * 6}px`,
                    animationDuration: `${1.2 + (i % 5) * 0.4}s`,
                    animationDelay: `${(i % 4) * 0.25}s`,
                    filter: "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.6))"
                  }}
                >
                  🪙
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>⚡</span>
                <span>॥ ತ್ವರಿತ ನಾಣ್ಯ ರೀಚಾರ್ಜ್ • Instant Coin Refill ॥</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-tight">
                ಅಕ್ಷಯ ಪಾತ್ರೆ ನಾಣ್ಯ ಕೋಶ
              </h3>
              <p className="text-[11px] text-amber-100/90 font-medium mt-0.5">
                ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ ಅಧಿಕೃತ ಭಕ್ತರ & ಪುರೋಹಿತರ ವಾಲೆಟ್
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center text-2xl shadow-lg border border-amber-300 animate-pulse">
                🏺
              </div>
            </div>
          </div>

          {/* Required Coins Warning */}
          {requiredCoins && requiredCoins > 0 && isZeroOrLow && (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-2xl flex items-center gap-3 text-xs text-red-950 font-bold shadow-xs">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <div className="font-black text-red-900">
                  {serviceTitle || "ಈ ಸೇವೆಗೆ"} ಕನಿಷ್ಠ {requiredCoins.toLocaleString()} ನಾಣ್ಯಗಳು (₹{Math.round(requiredCoins / 10)}) ಅಗತ್ಯವಿದೆ.
                </div>
                <div className="text-[11px] text-red-800 font-medium">
                  ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ {(wallet?.coinBalance ?? 0).toLocaleString()} ನಾಣ್ಯಗಳಿವೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಯಾವುದೇ ಪ್ಯಾಕೇಜ್ ಆರಿಸಿ ರೀಚಾರ್ಜ್ ಮಾಡಿಕೊಳ್ಳಿ.
                </div>
              </div>
            </div>
          )}

          {/* Error / Success Banners */}
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-red-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => clearMessages()} className="text-red-700 font-black px-1">✕</button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
              <button type="button" onClick={() => clearMessages()} className="text-emerald-700 font-black px-1">✕</button>
            </div>
          )}

          {/* Package Selector */}
          <div>
            <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>೧. ರೀಚಾರ್ಜ್ ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆಮಾಡಿ (Select Package • ₹1 = 10 Coins):</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                ಬೋನಸ್ ನಾಣ್ಯಗಳು ಲಭ್ಯ
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {RECHARGE_PACKAGES.map((pkg: CoinPackage) => {
                const isSelected = selectedPackage.key === pkg.key;
                return (
                  <button
                    key={pkg.key}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? "bg-[#FEFCF4] border-amber-500 shadow-md ring-2 ring-amber-400 scale-[1.02]"
                        : "bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50/50"
                    }`}
                  >
                    {pkg.tag && (
                      <span className="absolute -top-2 right-2 px-2 py-0.5 text-[8px] font-black uppercase rounded-full bg-amber-600 text-white border border-amber-300 shadow-xs">
                        {pkg.tag}
                      </span>
                    )}
                    <div className="text-xs font-black text-amber-950">{pkg.name}</div>
                    <div className="text-[10px] text-amber-800 font-semibold">{pkg.kannadaName}</div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-base sm:text-lg font-black text-emerald-800">
                        ₹{pkg.amountInr}
                      </span>
                    </div>
                    <div className="text-xs font-black text-amber-900 mt-0.5 font-mono">
                      🪙 {pkg.totalCoins.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                      +{pkg.bonusCoins} Bonus
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic UPI QR Scanner */}
          <div className="bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
            <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2.5 text-center sm:text-left">
              ೨. ಯಾವುದೇ UPI ಆ್ಯಪ್ ಮೂಲಕ ₹{amountInr} ಪಾವತಿಸಿ (GPay / PhonePe / Paytm):
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex flex-col items-center bg-white p-2.5 rounded-2xl border-2 border-amber-300 shadow-md shrink-0">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="UPI QR Code"
                    className="w-32 h-32 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs">
                    Loading QR...
                  </div>
                )}
                <span className="text-[9px] text-slate-700 font-black mt-1 uppercase tracking-wider">
                  Scan to Pay ₹{amountInr}
                </span>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div className="p-2.5 bg-white border border-amber-300 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">UPI ID / VPA</div>
                    <div className="font-mono text-xs font-black text-amber-950">{upiId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black rounded-lg border border-amber-300 transition-colors shadow-2xs active:scale-95"
                  >
                    {copiedUpi ? "✓ Copied" : "Copy UPI"}
                  </button>
                </div>

                <a
                  href={upiUri}
                  className="inline-flex items-center justify-center w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl text-xs shadow-md transition-all gap-1.5 active:scale-95"
                >
                  <span>📲 Open UPI App (Pay ₹{amountInr})</span>
                </a>

                <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                  ✨ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡ ನಂತರ UPI ರಸೀದಿಯಲ್ಲಿರುವ <strong>12-ಅಂಕಿಯ UTR ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆಯನ್ನು</strong> ಕೆಳಗೆ ನಮೂದಿಸಿ ಸಲ್ಲಿಸಿ.
                </p>
              </div>
            </div>
          </div>

          {/* UTR Submission Form */}
          <form onSubmit={handleUtrSubmit} className="space-y-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
            <label className="block text-xs font-black text-amber-950 uppercase tracking-wider">
              ೩. ೧೨-ಅಂಕಿಯ UPI ರೆಫರೆನ್ಸ್ / UTR ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (Enter UTR):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={upiUtr}
                onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                placeholder="ಉದಾ: 423512345678"
                maxLength={18}
                className="flex-1 px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-amber-500 shadow-inner"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingRecharge || upiUtr.length < 8}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 border border-amber-400 active:scale-95 shrink-0"
              >
                {isSubmittingRecharge ? (
                  <span>ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                ) : (
                  <span>ಪರಿಶೀಲಿಸಿ & ಕ್ರೆಡಿಟ್ ಮಾಡಿ</span>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold pt-1">
              <span>ಸಂಪರ್ಕ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9108135387)</span>
              <button
                type="button"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,\nನನ್ನ ಯೂಸರ್ ID (${wallet?.userId || "Priest"}) ಗೆ ₹${selectedPackage.amountInr} (${selectedPackage.totalCoins} Coins) ರೀಚಾರ್ಜ್ ಮಾಡಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಅನುಮೋದಿಸಿ.\nUTR: ${upiUtr || "Pending"}`
                  );
                  window.open(`https://api.whatsapp.com/send?phone=919108135387&text=${msg}`, "_blank");
                }}
                className="text-emerald-700 hover:text-emerald-900 font-black flex items-center gap-1"
              >
                <span>📲 WhatsApp ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. FIXED STICKY BOTTOM BAR */}
        <div className="bg-[#FFFDF7] border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-amber-800 font-bold">
            ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black rounded-xl border border-amber-300 transition-all text-xs active:scale-95"
          >
            ✕ ವಿಂಡೋ ಮುಚ್ಚಿ (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
