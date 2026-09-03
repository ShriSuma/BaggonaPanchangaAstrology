import React from "react";
import { useWalletStore } from "../../features/wallet/walletStore";

export const FloatingCoinDeductionBadge: React.FC = () => {
  const recentDeductions = useWalletStore((s) => s.recentDeductions);

  if (!recentDeductions || recentDeductions.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-[9999] flex flex-col items-center gap-2">
      {recentDeductions.map((d) => (
        <div
          key={d.id}
          className="animate-coin-deduct-float flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-mono font-black text-base md:text-lg shadow-[0_10px_35px_rgba(239,68,68,0.8)] border-2 border-amber-300 ring-4 ring-red-500/60 backdrop-blur-md whitespace-nowrap"
        >
          <span className="text-lg">🪙</span>
          <span className="tracking-wide text-white font-black drop-shadow-md">
            -{d.coins.toLocaleString()} Coins
          </span>
          <span className="text-xs font-sans font-bold bg-black/40 px-2 py-0.5 rounded text-amber-200">
            (₹{Math.round(d.coins / 10)})
          </span>
          {d.serviceName && (
            <span className="hidden sm:inline text-[10px] text-amber-100 font-sans font-medium max-w-[140px] truncate">
              {d.serviceName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

