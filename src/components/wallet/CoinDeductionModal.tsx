import React from "react";
import { useWalletStore } from "../../features/wallet/walletStore";

export interface CoinDeductionModalProps {
  isOpen: boolean;
  serviceTitle: string;
  serviceKannadaTitle?: string;
  serviceTitleKannada?: string;
  coinsRequired?: number;
  costCoins?: number;
  inrEquivalent?: number;
  icon?: string;
  devoteeName?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  onInsufficientCoins?: () => void;
  onOpenRefill?: () => void;
}

export const CoinDeductionModal: React.FC<CoinDeductionModalProps> = ({
  isOpen,
  serviceTitle,
  serviceKannadaTitle,
  serviceTitleKannada,
  coinsRequired,
  costCoins,
  inrEquivalent,
  icon = "🪙",
  devoteeName,
  description,
  onConfirm,
  onCancel,
  onClose,
  onInsufficientCoins,
  onOpenRefill
}) => {
  const wallet = useWalletStore((s) => s.wallet);
  const currentBalance = wallet?.coinBalance ?? 0;
  const coins = costCoins ?? coinsRequired ?? 100;
  const inrAmount = inrEquivalent ?? Math.round(coins / 10);
  const isSufficient = currentBalance >= coins;
  const balanceAfter = Math.max(0, currentBalance - coins);
  const kannadaTitle = serviceTitleKannada || serviceKannadaTitle || serviceTitle;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const handleRefillTrigger = () => {
    if (onOpenRefill) {
      onOpenRefill();
    } else if (onInsufficientCoins) {
      onInsufficientCoins();
    } else {
      useWalletStore.getState().openRechargeModal();
    }
  };

  if (!isOpen) return null;

  const handleProceed = async () => {
    if (!isSufficient) {
      handleRefillTrigger();
      handleClose();
      return;
    }
    await onConfirm();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-900 my-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-black p-1 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-2xl shadow-md border border-amber-400">
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
              ॥ ನಾಣ್ಯ ಕಡಿತ ಖಚಿತತೆ • Coin Confirmation ॥
            </div>
            <h3 className="text-base font-black text-amber-950 leading-tight">
              {kannadaTitle}
            </h3>
            <p className="text-[11px] text-amber-800 font-semibold">{serviceTitle}</p>
          </div>
        </div>

        {/* Optional Devotee Name & Description */}
        {(devoteeName || description) && (
          <div className="mb-3 px-3 py-2 bg-amber-100/50 rounded-xl border border-amber-200/80 text-xs">
            {devoteeName && (
              <div className="font-bold text-amber-950">
                <span className="text-slate-600 font-normal">ಭಕ್ತರ ಹೆಸರು: </span>
                {devoteeName}
              </div>
            )}
            {description && (
              <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                {description}
              </div>
            )}
          </div>
        )}

        {/* Question Prompt */}
        <div className="p-3.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl mb-4 shadow-inner space-y-2">
          <p className="text-xs font-bold text-amber-950 leading-relaxed">
            ಈ ಸೇವೆಯನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಖಾತೆಯಿಂದ{" "}
            <span className="text-amber-900 font-black font-mono underline decoration-amber-500 underline-offset-2">
              {coins.toLocaleString()} ನಾಣ್ಯಗಳನ್ನು (₹{inrAmount})
            </span>{" "}
            ಕಡಿತಗೊಳಿಸಲಾಗುತ್ತದೆ. ಮುಂದುವರಿಯಲು ಸಮ್ಮತವೇ?
          </p>
          <p className="text-[11px] text-slate-600 font-medium italic">
            "This request will deduct {coins.toLocaleString()} Coins (₹{inrAmount}) from your wallet. Is this fine, can I go ahead?"
          </p>
        </div>

        {/* Ledger Simulation Card */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between p-2.5 bg-white border border-amber-200 rounded-xl text-xs">
            <span className="text-slate-600 font-bold">ಪ್ರಸ್ತುತ ಬ್ಯಾಲೆನ್ಸ್ (Current):</span>
            <span
              className={`font-mono font-black ${
                currentBalance === 0
                  ? "text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-300 animate-pulse"
                  : currentBalance < coins
                  ? "text-orange-600 font-bold"
                  : "text-amber-950"
              }`}
            >
              {currentBalance.toLocaleString()} 🪙
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-amber-100/60 border border-amber-300 rounded-xl text-xs">
            <span className="text-amber-900 font-bold">ಸೇವಾ ವೆಚ್ಚ (Service Cost):</span>
            <span className="font-mono font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              - {coins.toLocaleString()} 🪙 (₹{inrAmount})
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white border border-amber-200 rounded-xl text-xs">
            <span className="text-slate-700 font-bold">ಕಡಿತದ ನಂತರ (After Deduction):</span>
            <span
              className={`font-mono font-black ${
                !isSufficient ? "text-red-600" : "text-emerald-700 font-black"
              }`}
            >
              {!isSufficient ? "⚠️ ಕೊರತೆ (Insufficient)" : `${balanceAfter.toLocaleString()} 🪙`}
            </span>
          </div>
        </div>

        {/* Low/Zero Balance Alert */}
        {!isSufficient && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-400 rounded-2xl flex items-center gap-2.5 text-xs text-red-950 font-bold animate-pulse">
            <span className="text-lg">⚠️</span>
            <div>
              <div className="font-black text-red-900">ಖಾತೆಯಲ್ಲಿ ನಾಣ್ಯಗಳ ಕೊರತೆಯಿದೆ!</div>
              <div className="text-[10px] text-red-800 font-medium">
                ದಯವಿಟ್ಟು ವಾಲೆಟ್ ರೀಚಾರ್ಜ್ ಮಾಡಿಕೊಂಡು ಮುಂದುವರಿಯಿರಿ.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-4 bg-white hover:bg-amber-50 text-slate-700 hover:text-slate-900 font-black text-xs rounded-xl border border-amber-300 shadow-sm transition-all text-center"
          >
            ✕ ರದ್ದುಮಾಡಿ (Cancel)
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className={`py-2.5 px-4 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 border ${
              isSufficient
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 border-amber-400"
                : "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white border-red-400"
            }`}
          >
            <span>{isSufficient ? "✓" : "⚡"}</span>
            <span>{isSufficient ? "ಹೌದು, ಮುಂದುವರಿಯಿರಿ" : "ರೀಚಾರ್ಜ್ ಮಾಡಿ (Refill)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
