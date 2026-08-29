import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "./walletStore";
import {
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_NAME,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 p-5 sm:p-8 text-amber-50 my-auto">
        {/* Close button */}
        <button
          onClick={() => {
            clearMessages();
            closeRechargeModal();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-300 transition-colors rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-amber-500/20 pb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg shadow-amber-500/20">
            🪙
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-200">
              Priest Coin Wallet • ಪುರೋಹಿತ ನಾಣ್ಯ ಕೋಶ
            </h2>
            <p className="text-xs text-slate-400">
              Current Balance:{" "}
              <span className="font-bold text-amber-300 font-mono text-sm">
                {(wallet?.coinBalance ?? 0).toLocaleString()} Coins
              </span>
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("recharge")}
            className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "recharge"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Recharge Coins (UPI)
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "history"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📜 Transaction History ({transactions.length})
          </button>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === "recharge" ? (
          <div className="space-y-6">
            {/* Step 1: Package Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-3">
                1. Select Coin Recharge Package (₹1 = 10 Coins)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RECHARGE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage.key === pkg.key;
                  return (
                    <button
                      key={pkg.key}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400"
                          : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40"
                      }`}
                    >
                      {pkg.tag && (
                        <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="text-xs font-bold text-amber-200">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400">{pkg.kannadaName}</div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-emerald-400">
                          ₹{pkg.amountInr}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-amber-300 mt-1 font-mono">
                        🪙 {pkg.totalCoins.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-400/80 mt-0.5">
                        +{pkg.bonusCoins} Bonus
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Payment via UPI QR & Apps */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 md:p-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-3 text-center md:text-left">
                2. Scan & Pay ₹{amountInr} via Any UPI App
              </label>

              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                {/* QR Code */}
                <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-lg">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain rounded"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-slate-600 text-xs">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[10px] text-slate-700 font-bold mt-1">
                    Scan with GPay / PhonePe / Paytm
                  </span>
                </div>

                {/* UPI Details & Mobile Quick Pay Buttons */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">UPI ID / VPA</div>
                      <div className="font-mono text-sm font-bold text-amber-200">{upiId}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg border border-amber-500/30 transition-colors"
                    >
                      {copiedUpi ? "✓ Copied" : "Copy UPI"}
                    </button>
                  </div>

                  {/* Direct Mobile UPI Intent Link */}
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1.5">Mobile 1-Tap Pay:</div>
                    <a
                      href={upiUri}
                      className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all gap-2"
                    >
                      <span>📲 Open UPI App (Pay ₹{amountInr})</span>
                    </a>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    ✨ After completing payment, copy the <strong>12-Digit UPI Reference / UTR Number</strong> from your UPI app receipt and submit below.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: UTR Verification Submission */}
            <form onSubmit={handleUtrSubmit} className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                3. Enter 12-Digit UPI Reference / UTR Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiUtr}
                  onChange={(e) => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                  placeholder="e.g. 423512345678"
                  maxLength={18}
                  className="flex-1 px-4 py-3 bg-slate-950/90 border border-amber-500/30 rounded-xl text-amber-200 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingRecharge || upiUtr.length < 8}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmittingRecharge ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>Verify & Credit Coins</span>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Notification will be immediately dispatched to Shri Mahabaleshwara administration for record verification.
              </p>
            </form>
          </div>
        ) : (
          /* Tab 2: Transaction History */
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No transactions recorded yet.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{tx.description}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      {new Date(tx.createdAt).toLocaleString("en-IN")}
                      {tx.upiUtr && <span className="ml-2 font-mono text-slate-400">UTR: {tx.upiUtr}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold font-mono text-sm ${
                        tx.coins > 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {tx.coins > 0 ? `+${tx.coins.toLocaleString()}` : tx.coins.toLocaleString()} Coins
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] rounded-full font-semibold uppercase mt-1 ${
                        tx.status === "approved" || tx.status === "completed"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                          : tx.status === "pending"
                          ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                          : "bg-red-950 text-red-300 border border-red-500/30"
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
    </div>
  );
};
