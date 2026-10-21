import React, { useState } from "react";
import type { GokarnaSevaRecommendation } from "./karmaMandalaTypes";
import type { SupportedLanguage } from "../../stores/appStore";
import { KARMA_MANDALA_5L } from "./karmaMandalaLocale";
import { useWalletStore } from "../wallet/walletStore";

interface GokarnaSevaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seva: GokarnaSevaRecommendation;
  devoteeName: string;
  gotra?: string;
  nakshatraName: string;
  rashiName: string;
  language: SupportedLanguage;
}

export const GokarnaSevaBookingModal: React.FC<GokarnaSevaBookingModalProps> = ({
  isOpen,
  onClose,
  seva,
  devoteeName: initialDevoteeName,
  gotra: initialGotra,
  nakshatraName,
  rashiName,
  language
}) => {
  const [name, setName] = useState(initialDevoteeName || "");
  const [gotra, setGotra] = useState(initialGotra || "ಕಶ್ಯಪ / Kashyapa");
  const [phone, setPhone] = useState("");
  const [sankalpa, setSankalpa] = useState("");
  const [address, setAddress] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const wallet = useWalletStore((s) => s.wallet);
  const deductForService = useWalletStore((s) => s.deductForService);
  const openRechargeModal = useWalletStore((s) => s.openRechargeModal);

  const t = KARMA_MANDALA_5L.sevaBooking;
  const currentCoinBalance = wallet?.coinBalance ?? 0;

  if (!isOpen) return null;

  const handleBookWithCoins = async () => {
    if (currentCoinBalance < seva.costInCoins) {
      setErrorMessage(
        KARMA_MANDALA_5L.wallet.insufficientBalance[language] ||
        KARMA_MANDALA_5L.wallet.insufficientBalance.kn
      );
      return;
    }

    setErrorMessage("");
    const result = await deductForService(
      seva.costInCoins,
      seva.name[language] || seva.name.kn,
      name
    );

    if (result.success) {
      setBookingStatus("success");
    } else {
      setErrorMessage(result.error || "Transaction error");
    }
  };

  const handleDirectCall = () => {
    window.location.href = `tel:${seva.priestPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-[#140e28] via-slate-950 to-[#070510] p-5 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-300 text-xl font-bold p-1 rounded-lg focus:outline-none"
          aria-label="Close Modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <span className="text-3xl">🪔</span>
          <h2 className="text-lg md:text-2xl font-bold font-serif text-amber-300 mt-1">
            {seva.name[language] || seva.name.kn}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1">
            {seva.templeName[language] || seva.templeName.kn}
          </p>
        </div>

        {/* Priest Contact Guarantee Callout */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center mb-5">
          <div className="text-xs md:text-sm font-bold text-amber-200 flex items-center justify-center gap-1.5">
            <span>🕉️</span>
            <span>{t.priestContactLine[language] || t.priestContactLine.kn}</span>
          </div>
        </div>

        {bookingStatus === "success" ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-400 text-center space-y-4 animate-scale-up">
            <span className="text-5xl">✨</span>
            <h3 className="text-lg md:text-xl font-bold text-emerald-300">
              {t.bookingSuccess[language] || t.bookingSuccess.kn}
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {seva.prasadaDetails[language] || seva.prasadaDetails.kn}
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                ಧನ್ಯವಾದಗಳು (Close)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldDevoteeName[language] || t.fieldDevoteeName.kn}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-amber-500/30 text-amber-100 text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldGotra[language] || t.fieldGotra.kn}
                </label>
                <input
                  type="text"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-amber-500/30 text-amber-100 text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="Gotra"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldNakshatra[language] || t.fieldNakshatra.kn}
                </label>
                <input
                  type="text"
                  value={nakshatraName}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-slate-700 text-slate-300 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldRashi[language] || t.fieldRashi.kn}
                </label>
                <input
                  type="text"
                  value={rashiName}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-slate-700 text-slate-300 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-300 mb-1">
                {t.fieldSankalpa[language] || t.fieldSankalpa.kn}
              </label>
              <textarea
                value={sankalpa}
                onChange={(e) => setSankalpa(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-amber-500/30 text-amber-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="ಉದಾಹರಣೆ: ಸಾಡೇಸಾತಿ ಶಾಂತಿ, ಆಯುರ್ ರಕ್ಷಣೆ, ವಿವಾಹ ಸಿದ್ಧಿ..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldPhone[language] || t.fieldPhone.kn}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-amber-500/30 text-amber-100 text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">
                  {t.fieldAddress[language] || t.fieldAddress.kn}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-amber-500/30 text-amber-100 text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="Postal address for Prasada"
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center">
                {errorMessage}
              </div>
            )}

            {/* Pricing & Booking Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={handleBookWithCoins}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <span>🪙</span>
                <span>
                  {t.payWithWalletCoins[language] || t.payWithWalletCoins.kn} (
                  {seva.costInCoins} Coins / ₹{seva.costInRupees})
                </span>
              </button>

              <button
                onClick={handleDirectCall}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-amber-500/30 hover:bg-slate-800 text-amber-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>📞</span>
                <span>{t.directCallPriest[language] || t.directCallPriest.kn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
