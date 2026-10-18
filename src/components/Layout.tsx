import { useEffect, useState, type ReactNode } from "react";
import SunCalc from "suncalc";
import { useTranslation } from "react-i18next";
import { calculatePanchang } from "../core/PanchangEngine";
import { calculateRahuKaal } from "../core/RahuKaalEngine";
import { calendarYmdForPanchangPin, panchangClockTimeZone, panchangSolarAnchorDate } from "../core/placeTime";
import { applySunTimesToPanchang, fetchSunriseSunsetUtc } from "../core/sunriseSunsetApi";
import { resolvePanchangCoords } from "../core/resolvePanchangCoords";
import { getPermissionStatus } from "../core/NotificationManager";
import { scheduleDailyPanchang, scheduleRahuKaal } from "../core/NotificationScheduler";
import { useAppStore, type AppPage } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useAuthStore } from "../features/auth/authStore";
import { useWalletStore } from "../features/wallet/walletStore";
import { PriestWalletModal } from "../features/wallet/PriestWalletModal";
import { AdminCoinApprovalModal } from "../features/wallet/AdminCoinApprovalModal";
import { FloatingCoinDeductionBadge } from "./wallet/FloatingCoinDeductionBadge";
import { getNavLabel } from "../i18n/navigationLocale";
import InstallPrompt from "./InstallPrompt";
import { SuperAdminAiPet } from "./pet/SuperAdminAiPet";
import CategorizedNavDrawer from "./navigation/CategorizedNavDrawer";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props): JSX.Element {
  const { t } = useTranslation();
  const notifications = useAppStore((s) => s.notifications);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const pincode = useAppStore((s) => s.pincode);
  const placeLabel = useAppStore((s) => s.placeLabel);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const language = useAppStore((s) => s.language);
  const setPage = useAppStore((s) => s.setPage);
  const [online, setOnline] = useState(navigator.onLine);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const session = useKundliViewerStore((s) => s.session);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (getPermissionStatus() !== "granted") return;
      if (!notifications.dailyPanchang && !notifications.rahuKaal) return;
      const now = new Date();
      const { lat, lng } = await resolvePanchangCoords(defaultLat, defaultLng, pincode, placeLabel);
      const anchor = panchangSolarAnchorDate(now, lat, lng, pincode);
      const ymd = calendarYmdForPanchangPin(now, lat, lng, pincode);
      let panchang = calculatePanchang(anchor, lat, lng, {
        locale: "en-IN",
        pincode,
        ayanamsaModel
      });
      const apiTimes = await fetchSunriseSunsetUtc(lat, lng, ymd);
      const scTimes = SunCalc.getTimes(anchor, lat, lng);
      const times = apiTimes ?? { sunrise: scTimes.sunrise, sunset: scTimes.sunset };
      panchang = applySunTimesToPanchang(panchang, times, "en-IN", lat, lng, pincode);
      const rahu = calculateRahuKaal(now, times.sunrise, times.sunset, {
        locale: "en-IN",
        clockTimeZone: panchangClockTimeZone(lat, lng, pincode)
      });
      if (notifications.dailyPanchang) await scheduleDailyPanchang(panchang);
      if (notifications.rahuKaal) await scheduleRahuKaal(rahu);
    };
    void run();
  }, [notifications.dailyPanchang, notifications.rahuKaal, defaultLat, defaultLng, pincode, placeLabel, ayanamsaModel]);

  const wallet = useWalletStore((s) => s.wallet);
  const openRechargeModal = useWalletStore((s) => s.openRechargeModal);
  const openAdminApprovalModal = useWalletStore((s) => s.openAdminApprovalModal);
  const pendingAdminTransactions = useWalletStore((s) => s.pendingAdminTransactions);
  const currentUser = useAuthStore((s) => s.currentUser);
  const role = useAuthStore((s) => s.role);

  // MANDATORY SECURITY RULE:
  // ONLY Super Admin and Baggona Master Profile ever get Burger Control & full access!
  const isMasterOrSuperAdmin =
    role === "superadmin" ||
    currentUser?.toLowerCase() === "baggona" ||
    currentUser?.toLowerCase() === "shrisuma" ||
    currentUser === "$hriSuma" ||
    currentUser?.toLowerCase() === "superadmin";

  const coinBalance = wallet?.coinBalance ?? 0;
  const isLowCoins = !isMasterOrSuperAdmin && coinBalance < 100;

  // Module access permissions
  const allowedModules: string[] = isMasterOrSuperAdmin
    ? ["public_kundli", "panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"]
    : (wallet?.allowedModules && wallet.allowedModules.length > 0)
    ? wallet.allowedModules
    : ["public_kundli"];

  const hasPanchanga = isMasterOrSuperAdmin || allowedModules.includes("panchanga");
  const hasSankhya = isMasterOrSuperAdmin || allowedModules.includes("sankhyashastra");
  const hasDiksuchi = isMasterOrSuperAdmin || allowedModules.includes("diksuchi");
  const hasPurvaJanma = isMasterOrSuperAdmin || allowedModules.includes("purva_janma");
  const hasPublicKundli = isMasterOrSuperAdmin || allowedModules.includes("public_kundli");

  return (
    <div className="min-h-screen text-[color:var(--jk-card-fg)] overflow-x-hidden relative">
      {!online && (
        <div
          className="border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
          role="status"
        >
          {t("layout.offlineMode")}
        </div>
      )}
      
      {/* Header with Hamburger & Priest Coin Wallet */}
      <header className="border-b border-slate-800 bg-slate-950 px-3 md:px-4 py-2.5 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* BURGER CONTROL: Strictly only for Super Admin and Baggona Master Profile */}
          {isMasterOrSuperAdmin ? (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-1 text-amber-500 hover:text-amber-400 rounded-lg transition-colors focus:outline-none"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          ) : (
            <div className="flex items-center gap-1 py-1">
              <span className="text-xl pl-1 pr-0.5 select-none" aria-hidden>🪔</span>
            </div>
          )}
          <div>
            <span className="text-base md:text-lg font-semibold tracking-tight text-amber-400 block leading-tight">{t("app.title")}</span>
            <p className="text-[10px] md:text-xs text-amber-100/70">
              {currentUser && !isMasterOrSuperAdmin
                ? `🙏 ${wallet?.priestName || currentUser}`
                : t("app.subtitle")}
            </p>
          </div>
        </div>

        {/* Right side Actions: Wallet Pill, Super Admin & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage("calendar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-xs"
            title="ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ / Baggona Panchanga Calendar"
          >
            <span>📅</span>
            <span className="hidden sm:inline">ಕ್ಯಾಲೆಂಡರ್</span>
          </button>
          <button
            onClick={() => setPage("aiaastrologer")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/60 text-amber-300 hover:bg-amber-500/35 text-xs font-bold transition-all shadow-xs"
            title="ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ / Ask Astrology Consultation"
          >
            <span>🔮</span>
            <span className="hidden sm:inline">ಪ್ರಶ್ನೋತ್ತರ</span>
          </button>
          <button
            onClick={() => setPage("consultation_generator")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/35 text-xs font-bold transition-all shadow-xs"
            title="೨೦-ನಿಮಿಷ ಚಾಟ್ ಲಿಂಕ್ ಜನರೇಟರ್ / 20-Min Devotee Consultation Link Generator"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">೨೦-ನಿಮಿಷ ಲಿಂಕ್</span>
          </button>
          <button
            onClick={() => setPage("pooja_estimate")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-xs"
            title="ಪೂಜಾ ಯೋಜನೆ & ವೆಚ್ಚ ವಿವರ / Pooja Packages & Estimate"
          >
            <span>📜</span>
            <span className="hidden md:inline">ಪೂಜಾ ಯೋಜನೆ</span>
          </button>
          <button
            onClick={() => setPage("package_download")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-300 text-amber-200 hover:bg-amber-500/40 text-xs font-bold transition-all shadow-xs"
            title="ಸಂಪೂರ್ಣ ಜಾತಕ & ಪರಿಹಾರ ಸಂಪುಟ / Devotee Complete Astrology & Remedy Package"
          >
            <span>📦</span>
            <span className="hidden sm:inline">ಸಂಪುಟ ಡೌನ್‌ಲೋಡ್</span>
          </button>
          {/* Super Admin Control Center Button */}
          {role === "superadmin" && (
            <button
              onClick={() => setPage("superadmindashboard")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-400 text-xs font-extrabold transition-all shadow-md"
              title="Super Admin Master Control Center"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Super Admin</span>
            </button>
          )}

          {/* Admin Approval Button (if pending or admin) */}
          {(pendingAdminTransactions.length > 0 || role === "admin") && role !== "superadmin" && (
            <button
              onClick={openAdminApprovalModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold transition-all shadow-sm"
              title="Admin Coin Approval Desk"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Admin</span>
              {pendingAdminTransactions.length > 0 && (
                <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold animate-pulse">
                  {pendingAdminTransactions.length}
                </span>
              )}
            </button>
          )}

          {/* Priest Coin Wallet Pill with Floating Deduction Animation & Red Low/Zero Balance Alert */}
          <div className="relative inline-flex items-center">
            <FloatingCoinDeductionBadge />
            <button
              onClick={openRechargeModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold shadow-sm ${
                isLowCoins
                  ? "bg-red-950/90 border-2 border-red-500 text-red-200 hover:bg-red-900 shadow-red-900/40 animate-pulse ring-2 ring-red-500/40"
                  : isMasterOrSuperAdmin
                  ? "bg-amber-500/20 border border-amber-400 text-amber-200 hover:bg-amber-500/30"
                  : "bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400"
              }`}
              title={
                isLowCoins
                  ? "⚠️ ನಾಣ್ಯಗಳ ಕೊರತೆ! Click to refill coins"
                  : isMasterOrSuperAdmin
                  ? "👑 ಮಾಸ್ಟರ್ ಖಾತೆ • ಅನಿಯಮಿತ ಮುಕ್ತ ಪ್ರವೇಶ (Zero Deduction Master Profile)"
                  : "Priest Coin Wallet • Click to recharge"
              }
            >
              <span className="text-sm">{isLowCoins ? "⚠️" : isMasterOrSuperAdmin ? "👑" : "🪙"}</span>
              <span className={`font-mono font-black ${isLowCoins ? "text-red-200" : "text-amber-200"}`}>
                {isMasterOrSuperAdmin ? "♾️ ಮುಕ್ತ" : coinBalance.toLocaleString()} {isLowCoins ? "🪙" : ""}
              </span>
              <span className={`hidden sm:inline text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                isLowCoins
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white animate-bounce"
                  : isMasterOrSuperAdmin
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                  : "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950"
              }`}>
                {isLowCoins ? "+ ರೀಫಿಲ್" : isMasterOrSuperAdmin ? "UNLIMITED" : "+ Recharge"}
              </span>
            </button>
          </div>

          {/* Reset / Edit Kundali button if a kundali exists */}
          {session && (
            <button 
              onClick={() => {
                useKundliViewerStore.getState().clearSession();
                useAppStore.getState().setPage("kundli");
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg shadow-sm hover:bg-rose-100 transition-colors"
              title="Reset / Edit current Kundali"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">{t("app.reset", "Reset")}</span>
            </button>
          )}
          {/* Direct Sign Out Button for restricted priest profiles without drawer */}
          {!isMasterOrSuperAdmin && (
            <button
              type="button"
              onClick={() => {
                useAuthStore.getState().logout();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 rounded-xl hover:bg-rose-900 transition-colors shadow-sm"
              title="Sign Out"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">ನಿರ್ಗಮನ</span>
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pt-4 pb-12">
        <InstallPrompt />
        {children}
      </div>

      {/* Wallet & Admin Modals */}
      <PriestWalletModal />
      <AdminCoinApprovalModal />

      {/* Super Admin AI Assistant Pet (Kamadhenu) - Accessible strictly to Super Admin */}
      {isMasterOrSuperAdmin && <SuperAdminAiPet />}

      {/* Smart, Categorized Navigation Drawer with Headings, Subtopics & Search */}
      {isMasterOrSuperAdmin && (
        <CategorizedNavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          role={role}
          isMasterOrSuperAdmin={isMasterOrSuperAdmin}
          language={language}
          currentUser={currentUser}
          priestName={wallet?.priestName}
          hasPanchanga={hasPanchanga}
          hasSankhya={hasSankhya}
          hasDiksuchi={hasDiksuchi}
          hasPurvaJanma={hasPurvaJanma}
          hasPublicKundli={hasPublicKundli}
          session={session}
        />
      )}
    </div>
  );
}

