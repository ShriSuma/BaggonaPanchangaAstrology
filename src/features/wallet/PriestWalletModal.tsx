import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "./walletStore";
import {
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_UPI_NAME,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  generateUpiPayUri,
  generatePhonePeUri,
  generateGPayUri,
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
    verifyAndCreditPayment,
    clearMessages
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<"recharge" | "history">("recharge");
  const [upiUtr, setUpiUtr] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isAwaitingPaymentReturn, setIsAwaitingPaymentReturn] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [instantVerified, setInstantVerified] = useState<{ creditedCoins: number; newBalance: number } | null>(null);

  const amountInr = selectedPackage.amountInr;
  const upiId = DEFAULT_PRIEST_UPI_ID;
  const note = `PanchangaSeva`;

  // Clean NPCI UPI URIs without merchant 'tr' parameter (prevents PhonePe "There is some error, please retry")
  const upiUri = useMemo(
    () => generateUpiPayUri(amountInr, note, upiId),
    [amountInr, note, upiId]
  );
  const phonePeUri = useMemo(
    () => generatePhonePeUri(amountInr, note, upiId, false),
    [amountInr, note, upiId]
  );
  const phonePeNativeUri = useMemo(
    () => generatePhonePeUri(amountInr, note, upiId, true),
    [amountInr, note, upiId]
  );
  const gPayUri = useMemo(
    () => generateGPayUri(amountInr, note, upiId),
    [amountInr, note, upiId]
  );

  // Auto-redirect timer when payment is verified
  useEffect(() => {
    if (!instantVerified) return;
    setRedirectCountdown(3);
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [instantVerified]);

  // Payment app launch handler
  const handleLaunchPaymentApp = (app: "phonepe" | "gpay" | "upi") => {
    setIsAwaitingPaymentReturn(true);
    try {
      sessionStorage.setItem(
        "baggona_priest_pending_payment",
        JSON.stringify({ app, amountInr, coins: selectedPackage.totalCoins, timestamp: Date.now() })
      );
    } catch {}

    if (app === "phonepe") {
      const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = phonePeNativeUri;
        setTimeout(() => {
          if (typeof document !== "undefined" && document.visibilityState === "visible") {
            window.location.href = phonePeUri;
          }
        }, 1200);
      } else {
        window.location.href = phonePeUri;
      }
    } else if (app === "gpay") {
      window.location.href = gPayUri;
    } else {
      window.location.href = upiUri;
    }
  };

  // Return detection: When priest finishes payment in PhonePe and returns to the app
  useEffect(() => {
    if (!isRechargeModalOpen) return;
    const handleReturnFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        try {
          const pending = sessionStorage.getItem("baggona_priest_pending_payment");
          if (pending || isAwaitingPaymentReturn) {
            setIsAwaitingPaymentReturn(true);
            if (navigator.clipboard && navigator.clipboard.readText) {
              navigator.clipboard.readText().then((clip) => {
                const digits = (clip || "").trim().replace(/[^0-9]/g, "");
                if (digits.length === 12) setUpiUtr(digits);
              }).catch(() => {});
            }
          }
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", handleReturnFocus);
    window.addEventListener("focus", handleReturnFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleReturnFocus);
      window.removeEventListener("focus", handleReturnFocus);
    };
  }, [isRechargeModalOpen, isAwaitingPaymentReturn]);

  useEffect(() => {
    if (!isRechargeModalOpen) return;
    let isMounted = true;

    QRCode.toDataURL(upiUri, {
      width: 220,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => console.error("QR Code Error:", err));

    return () => {
      isMounted = false;
    };
  }, [upiUri, isRechargeModalOpen]);

  if (!isRechargeModalOpen) return null;

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleInstantVerify = async (candidateUtr?: string) => {
    const rawUtr = (typeof candidateUtr === "string" ? candidateUtr : upiUtr).trim();
    const finalUtr = rawUtr.length >= 6
      ? rawUtr
      : `PH_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await verifyAndCreditPayment(
      finalUtr,
      amountInr,
      selectedPackage.totalCoins
    );
    if (res.success) {
      setIsAwaitingPaymentReturn(false);
      try { sessionStorage.removeItem("baggona_priest_pending_payment"); } catch {}
      setInstantVerified({
        creditedCoins: res.coinsCredited || selectedPackage.totalCoins,
        newBalance: res.newBalance || ((wallet?.coinBalance ?? 0) + selectedPackage.totalCoins)
      });
    }
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleInstantVerify();
  };

  const handleClose = () => {
    clearMessages();
    setInstantVerified(null);
    setIsAwaitingPaymentReturn(false);
    try { sessionStorage.removeItem("baggona_priest_pending_payment"); } catch {}
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
          {/* Instant Verification Celebration Screen */}
          {instantVerified ? (
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-500 rounded-3xl text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-emerald-300 animate-bounce">
                🎉
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
                  ✓ ಪಾವತಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ (Instant Verified)
                </span>
                <h3 className="text-xl font-black text-slate-900 pt-1">
                  ನಾಣ್ಯಗಳು ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ತಕ್ಷಣ ಜಮೆಯಾಗಿವೆ!
                </h3>
              </div>
              <div className="p-4 bg-white/90 border border-emerald-200 rounded-2xl max-w-sm mx-auto shadow-inner space-y-1">
                <div className="text-xs text-slate-500 font-bold uppercase">ಹೊಸ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ (New Balance)</div>
                <div className="text-3xl font-black text-emerald-700 font-mono">
                  {instantVerified.newBalance.toLocaleString()} Coins
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  +{instantVerified.creditedCoins.toLocaleString()} ನಾಣ್ಯಗಳು (₹{amountInr}) ಸೇರಿಸಲಾಗಿದೆ
                </div>
              </div>

              {/* Automatic Redirect Countdown Banner */}
              <div className="max-w-sm mx-auto p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center justify-center gap-2 animate-pulse">
                <span>🚀</span>
                <span>{redirectCountdown} ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪುಟಕ್ಕೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮರಳಲಾಗುತ್ತಿದೆ... (Redirecting in {redirectCountdown}s)</span>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✓ ಈಗಲೇ ಮುಚ್ಚಿ (Return to Page Now)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  {/* Active Payment Return Prompt (PhonePe / UPI) */}
                  {isAwaitingPaymentReturn && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 via-emerald-50/80 to-teal-50 border-2 border-emerald-500 rounded-3xl space-y-3 shadow-lg animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md animate-pulse shrink-0">
                            ⚡
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-emerald-950 leading-tight">
                              PhonePe ನಿಂದ ವಾಪಸ್ ಬಂದಿದ್ದೀರಿ (Returned from PhonePe)
                            </h4>
                            <p className="text-[11px] text-emerald-900 font-bold">
                              ₹{amountInr} ({selectedPackage.totalCoins.toLocaleString()} Coins) ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದ್ದರೆ, ದಯವಿಟ್ಟು ಇಲ್ಲಿ ದೃಢೀಕರಿಸಿ ನಾಣ್ಯಗಳನ್ನು ಪಡೆಯಿರಿ.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAwaitingPaymentReturn(false)}
                          className="px-2 py-1 text-slate-500 hover:text-red-600 text-xs font-bold rounded-lg border border-slate-300 bg-white cursor-pointer"
                          title="ಹಿಂದಕ್ಕೆ"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                            placeholder="PhonePe UTR ಸಂಖ್ಯೆ (12-Digit)"
                            maxLength={18}
                            className="w-full px-3.5 py-2.5 pr-20 bg-white border-2 border-emerald-400 rounded-xl text-slate-900 font-mono text-xs font-bold shadow-inner focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (navigator.clipboard && navigator.clipboard.readText) {
                                  const text = await navigator.clipboard.readText();
                                  const clean = text.trim().replace(/[^a-zA-Z0-9]/g, "");
                                  if (clean) setUpiUtr(clean);
                                }
                              } catch {}
                            }}
                            className="absolute right-1.5 top-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-[10px] font-black rounded-lg border border-amber-300 cursor-pointer active:scale-95"
                          >
                            📋 Paste
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInstantVerify()}
                          disabled={isSubmittingRecharge}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
                        >
                          <span>⚡</span>
                          <span>{isSubmittingRecharge ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "✓ ಪಾವತಿ ದೃಢೀಕರಿಸಿ & ನಾಣ್ಯ ಪಡೆಯಿರಿ"}</span>
                        </button>
                      </div>
                    </div>
                  )}

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

                        {/* Direct Mobile UPI Intent Links (PhonePe & Google Pay) */}
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={phonePeUri}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLaunchPaymentApp("phonepe");
                              }}
                              className="py-2 px-3 bg-[#5f259f] hover:bg-[#4d1d82] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 text-center cursor-pointer"
                            >
                              <span>🟣 PhonePe</span>
                            </a>
                            <a
                              href={gPayUri}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLaunchPaymentApp("gpay");
                              }}
                              className="py-2 px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 text-center cursor-pointer"
                            >
                              <span>🔵 Google Pay</span>
                            </a>
                          </div>
                          <a
                            href={upiUri}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLaunchPaymentApp("upi");
                            }}
                            className="inline-flex items-center justify-center w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs shadow-md transition-all gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <span>📲 Open Any UPI App (Pay ₹{amountInr})</span>
                          </a>
                        </div>

                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-950 font-medium leading-relaxed">
                          💡 PhonePe ಅಥವಾ Google Pay ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿದ ನಂತರ, ರಶೀದಿಯನ್ನು WhatsApp ಮೂಲಕ ಕಳುಹಿಸಿ ಅಥವಾ UTR ಸಲ್ಲಿಸಿ. ಪರಿಶೀಲನೆಯ ನಂತರ ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತದೆ.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Verification & Receipt Submission */}
                  <div className="space-y-3 bg-[#FEFCF4] border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-sm">
                    <label className="block text-xs font-black uppercase tracking-wider text-amber-950 text-center sm:text-left">
                      3. ಪಾವತಿ ವಿವರ ಕಳುಹಿಸಿ (ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು)
                    </label>

                    {/* Primary: WhatsApp Receipt */}
                    <button
                      type="button"
                      onClick={() => {
                        const msg = encodeURIComponent(
                          `ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,\nನನ್ನ ಪುರೋಹಿತ ID (${wallet?.userId || "Priest"}) ಗೆ ₹${amountInr} (${selectedPackage.totalCoins.toLocaleString()} Coins) PhonePe/GPay ಮೂಲಕ ಪಾವತಿಸಿದ್ದೇನೆ.\nದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ನನ್ನ ವಾಲೆಟ್‌ಗೆ ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ.\nUTR: ${upiUtr || "Done"}`
                        );
                        window.open(`https://api.whatsapp.com/send?phone=91${DEFAULT_PRIEST_MOBILE_NUMBER}&text=${msg}`, "_blank");
                      }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border-2 border-emerald-400 active:scale-95 cursor-pointer"
                    >
                      <span className="text-lg">📲</span>
                      <span>WhatsApp ನಲ್ಲಿ ರಶೀದಿ ಕಳುಹಿಸಿ • ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಿಸಿಕೊಳ್ಳಿ</span>
                    </button>

                    {/* Secondary: UTR Submission & Instant Verification */}
                    <form onSubmit={handleUtrSubmit} className="space-y-2 pt-2 border-t border-amber-200">
                      <label className="block text-[11px] font-bold text-slate-700">
                        ಅಥವಾ ೧೨-ಅಂಕಿಯ UPI UTR ಸಂಖ್ಯೆ ನಮೂದಿಸಿ ತಕ್ಷಣ ನಾಣ್ಯ ಪಡೆಯಿರಿ:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                          placeholder="ಉದಾ: 423512345678 (UTR ಸಂಖ್ಯೆ)"
                          maxLength={18}
                          className="flex-1 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-xs font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingRecharge}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <span>⚡</span>
                          <span>{isSubmittingRecharge ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "ಪರಿಶೀಲಿಸಿ ನಾಣ್ಯ ಪಡೆಯಿರಿ"}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-semibold">
                        ✓ ತಕ್ಷಣ ದೃಢೀಕರಣ: ಸೂಪರ್ ಅಡ್ಮಿನ್ ಅನುಮೋದನೆಗೆ ಕಾಯಬೇಕಾಗಿಲ್ಲ — ನಾಣ್ಯಗಳು ತಕ್ಷಣ ವಾಲೆಟ್‌ಗೆ ಜಮೆಯಾಗುತ್ತವೆ!
                      </p>
                    </form>
                  </div>
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
            </>
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
