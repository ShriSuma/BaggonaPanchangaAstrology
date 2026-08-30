import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "./walletStore";
import {
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  type CoinPackage
} from "./walletTypes";

export const PriestWalletModal: React.FC = () => {
  const {
    wallet,
    transactions,
    selectedPackage,
    isRechargeModalOpen,
    isSubmittingRecharge,
    error,
    successMessage,
    setSelectedPackage,
    closeRechargeModal,
    submitUpiRecharge,
    clearMessages
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<"recharge" | "history">("recharge");
  const [upiUtr, setUpiUtr] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const amountInr = selectedPackage.amountInr;
  const upiId = DEFAULT_PRIEST_UPI_ID;
  const payeeName = "Baggona Panchanga";
  const note = `COINS-${selectedPackage.key.toUpperCase()}-${wallet?.userId || "PRIEST"}`;

  // NPCI standard UPI Payment URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amountInr.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

  useEffect(() => {
    if (isRechargeModalOpen) {
      QRCode.toDataURL(upiUri, {
        width: 220,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [upiUri, isRechargeModalOpen]);

  if (!isRechargeModalOpen) return null;

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
    closeRechargeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900">
        
        {/* 1. FIXED STICKY TOP HEADER (Guaranteed visible at all times) */}
        <div className="sticky top-0 z-30 bg-[#FFFDF7]/98 backdrop-blur-md border-b-2 border-amber-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md border border-amber-400 shrink-0">
              🪙
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-amber-950 truncate leading-tight">
                Priest Coin Wallet • ಪುರೋಹಿತ ನಾಣ್ಯ ಕೋಶ
              </h2>
              <p className="text-[11px] text-amber-800 font-bold">
                ಪ್ರಸ್ತುತ ಬ್ಯಾಲೆನ್ಸ್:{" "}
                <span className="font-extrabold text-amber-950 font-mono text-xs">
                  {(wallet?.coinBalance ?? 0).toLocaleString()} Coins
                </span>
                <span className="text-[10px] text-amber-700 ml-1">
                  (≈ ₹{Math.round((wallet?.coinBalance ?? 0) / 10)})
                </span>
              </p>
            </div>
          </div>

          {/* Prominent Always-Clickable Close Button */}
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

        {/* 2. TAB CONTROLLER NAVIGATION */}
        <div className="bg-[#FEFCF4] border-b border-amber-200 px-4 sm:px-6 pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("recharge")}
            className={`pb-2 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "recharge"
                ? "border-amber-600 text-amber-950"
                : "border-transparent text-slate-500 hover:text-amber-900"
            }`}
          >
            <span>⚡</span>
            <span>ನಾಣ್ಯ ರೀಚಾರ್ಜ್ (UPI Recharge)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-2 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-amber-600 text-amber-950"
                : "border-transparent text-slate-500 hover:text-amber-900"
            }`}
          >
            <span>📜</span>
            <span>ವ್ಯವಹಾರ ಇತಿಹಾಸ ({transactions.length})</span>
          </button>
        </div>

        {/* 3. SCROLLABLE INNER BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Error / Success Banners */}
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-2xl text-red-950 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => clearMessages()} className="text-red-700 font-black px-1">✕</button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
              <button type="button" onClick={() => clearMessages()} className="text-emerald-700 font-black px-1">✕</button>
            </div>
          )}

          {activeTab === "recharge" ? (
            <div className="space-y-5">
              {/* Step 1: Package Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-amber-950 mb-2.5">
                  1. ನಾಣ್ಯ ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆಮಾಡಿ (Select Recharge Package • ₹1 = 10 Coins)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {RECHARGE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.key === pkg.key;
                    return (
                      <button
                        key={pkg.key}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-3 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? "bg-amber-100/90 border-amber-500 shadow-md ring-2 ring-amber-400"
                            : "bg-[#FEFCF4] border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        {pkg.tag && (
                          <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-full bg-amber-600 text-white shadow-xs">
                            {pkg.tag}
                          </span>
                        )}
                        <div className="text-xs font-black text-amber-950">{pkg.name}</div>
                        <div className="text-[10px] text-amber-800 font-bold">{pkg.kannadaName}</div>
                        <div className="mt-1.5 flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-black text-emerald-700">
                            ₹{pkg.amountInr}
                          </span>
                        </div>
                        <div className="text-xs font-extrabold text-amber-950 mt-0.5 font-mono">
                          🪙 {pkg.totalCoins.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                          +{pkg.bonusCoins} Bonus Coins
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Payment via UPI QR & Apps */}
              <div className="bg-[#FEFCF4] border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-950 text-center sm:text-left">
                  2. UPI ಮೂಲಕ ₹{amountInr} ಪಾವತಿಸಿ (Scan & Pay ₹{amountInr})
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between">
                  {/* QR Code */}
                  <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-md border-2 border-amber-300 shrink-0">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="UPI QR Code"
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-slate-500 text-xs font-bold">
                        QR ರಚಿಸಲಾಗುತ್ತಿದೆ...
                      </div>
                    )}
                    <span className="text-[9px] sm:text-[10px] text-slate-800 font-extrabold mt-1 text-center">
                      Scan with GPay / PhonePe / Paytm / BHIM
                    </span>
                  </div>

                  {/* UPI Details & Mobile Quick Pay Buttons */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="p-3 bg-[#FFFDF7] border-2 border-amber-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-amber-800 uppercase font-black">ಅಧಿಕೃತ UPI ID / VPA</div>
                        <div className="font-mono text-xs sm:text-sm font-black text-amber-950">{upiId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black rounded-xl border border-amber-300 transition-colors shadow-2xs active:scale-95"
                      >
                        {copiedUpi ? "✓ ಕಾಪಿ ಆಗಿದೆ" : "Copy UPI"}
                      </button>
                    </div>

                    {/* Direct Mobile UPI Intent Link */}
                    <div>
                      <a
                        href={upiUri}
                        className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl text-xs shadow-md transition-all gap-2 active:scale-95"
                      >
                        <span>📲 ಮೊಬೈಲ್ UPI ಆ್ಯಪ್ ತೆರೆಯಿರಿ (Pay ₹{amountInr})</span>
                      </a>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-amber-900 leading-relaxed font-semibold">
                      ✨ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡ ನಂತರ, ನಿಮ್ಮ UPI ಆ್ಯಪ್ ರಶೀದಿಯಿಂದ <strong>12-ಅಂಕಿಯ UTR / Reference ಸಂಖ್ಯೆಯನ್ನು</strong> ಕೆಳಗೆ ನಮೂದಿಸಿ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: UTR Verification Submission */}
              <form onSubmit={handleUtrSubmit} className="space-y-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-950">
                  3. 12-ಅಂಕಿಯ UTR / Reference ನಂಬರ್ ನಮೂದಿಸಿ
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                    placeholder="ಉದಾ: 423512345678"
                    maxLength={18}
                    className="flex-1 px-4 py-3 bg-white border-2 border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-sm font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingRecharge || upiUtr.length < 8}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-400 shrink-0"
                  >
                    {isSubmittingRecharge ? (
                      <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                    ) : (
                      <span>⚡ ಪರಿಶೀಲಿಸಿ & ನಾಣ್ಯ ಪಡೆಯಿರಿ</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-amber-800 font-semibold">
                  ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ ಪ್ರಧಾನ ಆಡಳಿತಕ್ಕೆ ಸ್ವಯಂಚಾಲಿತ ಸೂಚನೆ ರವಾನೆಯಾಗುತ್ತದೆ.
                </p>
              </form>
            </div>
          ) : (
            /* Tab 2: Transaction History */
            <div className="space-y-2.5">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">
                  ಯಾವುದೇ ಹಿಂದಿನ ವ್ಯವಹಾರಗಳು ದಾಖಲಾಗಿಲ್ಲ.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#FEFCF4] border-2 border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-950">{tx.description}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        {new Date(tx.createdAt).toLocaleString("en-IN")}
                        {tx.upiUtr && <span className="ml-2 font-mono text-amber-900 font-bold">UTR: {tx.upiUtr}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-black font-mono text-sm ${
                          tx.coins > 0 ? "text-emerald-700" : "text-amber-900"
                        }`}
                      >
                        {tx.coins > 0 ? `+${tx.coins.toLocaleString()}` : tx.coins.toLocaleString()} Coins
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[8px] rounded-full font-black uppercase mt-1 ${
                          tx.status === "approved" || tx.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : tx.status === "pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. FIXED STICKY BOTTOM BAR (Secondary Close Option) */}
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
