import React from "react";
import { Baggona8kPromoPoster } from "../components/poster/Baggona8kPromoPoster";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../features/auth/authStore";

export default function BaggonaPosterPage(): JSX.Element {
  const setAppPage = useAppStore((s) => s.setPage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const role = useAuthStore((s) => s.role);

  const isMasterOrSuperAdmin =
    role === "superadmin" ||
    currentUser?.toLowerCase() === "baggona" ||
    currentUser?.toLowerCase() === "shrisuma" ||
    currentUser === "$hriSuma" ||
    currentUser?.toLowerCase() === "superadmin";

  if (!isMasterOrSuperAdmin) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-2xl p-6 text-center shadow-2xl">
          <span className="text-4xl">🛡️</span>
          <h2 className="text-xl font-black text-amber-300 mt-3 font-serif">
            ಕೇವಲ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪ್ರವೇಶ (Super Admin Only)
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            ಈ ೮K ಪ್ರಚಾರ ಪೋಸ್ಟರ್, AI ಇಮೇಜ್ ಪ್ರಾಂಪ್ಟ್ ಜನರೇಟರ್ ಹಾಗೂ ಬೆಲೆ ಪರಿಷ್ಕರಣೆ ಸ್ಟುಡಿಯೋ ಕೇವಲ ಸೂಪರ್ ಅಡ್ಮಿನ್ (Super Omi) ಅವರಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.
          </p>
          <button
            onClick={() => setAppPage("home")}
            className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ (Go to Home)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950">
      <Baggona8kPromoPoster onClose={() => setAppPage("superadmindashboard")} />
    </div>
  );
}
