import React, { useState } from "react";
import { useWalletStore } from "./walletStore";

export const AdminCoinApprovalModal: React.FC = () => {
  const {
    pendingAdminTransactions,
    isAdminApprovalModalOpen,
    closeAdminApprovalModal,
    approveTx
  } = useWalletStore();

  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isAdminApprovalModalOpen) return null;

  const handleApprove = async (txId: string) => {
    setProcessingId(txId);
    try {
      await approveTx(txId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 md:p-8 text-amber-50 my-8">
        <button
          onClick={closeAdminApprovalModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-300 transition-colors rounded-lg hover:bg-slate-800"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-amber-500/20 pb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-200">
              Admin Coin Approval Desk
            </h2>
            <p className="text-xs text-slate-400">
              Review and approve incoming UPI payments and credit priest coin balances.
            </p>
          </div>
        </div>

        {pendingAdminTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-slate-300 font-semibold text-sm">All Transactions Cleared</div>
            <p className="text-slate-500 text-xs mt-1">There are no pending coin recharge requests.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {pendingAdminTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-amber-200 text-sm">
                      {tx.priestName || "Shreeram Pandit"}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({new Date(tx.createdAt).toLocaleString("en-IN")})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold text-base">
                      ₹{tx.inrAmount}
                    </span>
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      ➔ +{tx.coins.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    UPI UTR / Reference ID:
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-amber-500/20">
                    {tx.upiUtr}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={processingId === tx.id}
                    onClick={() => handleApprove(tx.id)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {processingId === tx.id ? (
                      <span>Crediting Coins...</span>
                    ) : (
                      <span>✓ Confirm Payment & Credit {tx.coins.toLocaleString()} Coins</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
