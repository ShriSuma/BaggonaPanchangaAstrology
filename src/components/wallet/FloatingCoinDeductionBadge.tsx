import React from "react";
import { useWalletStore } from "../../features/wallet/walletStore";

export const FloatingCoinDeductionBadge: React.FC = () => {
  const recentDeductions = useWalletStore((s) => s.recentDeductions);

  if (!recentDeductions || recentDeductions.length === 0) return null;

  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center gap-1">
      {recentDeductions.map((d) => (
        <div
          key={d.id}
          className="animate-coin-deduct-float flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-mono font-black text-xs shadow-xl border-2 border-amber-300 ring-2 ring-red-500/50 backdrop-blur-sm whitespace-nowrap"
        >
          <span className="text-sm">🪙</span>
          <span>-{d.coins.toLocaleString()}</span>
          <span className="text-[10px] opacity-90 font-sans font-bold">
            (₹{Math.round(d.coins / 10)})
          </span>
        </div>
      ))}
    </div>
  );
};
