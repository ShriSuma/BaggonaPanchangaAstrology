import { useEffect } from "react";
import { analytics } from "./core/analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import PrivacyConsent from "./components/PrivacyConsent";
import HomePage from "./pages/HomePage";
import KundliPage from "./pages/KundliPage";
import MelapakPage from "./pages/MelapakPage";
import PredictionsPage from "./pages/PredictionsPage";
import SettingsPage from "./pages/SettingsPage";
import InsightsPage from "./pages/InsightsPage";
import BaggonaPredictionsPage from "./pages/BaggonaPredictionsPage";
import MuhurthaPage from "./pages/MuhurthaPage";
import VarshaBavishyaPage from "./pages/VarshaBavishyaPage";
import RamanBhavishyaPage from "./pages/RamanBhavishyaPage";
import AIAstrologerPage from "./pages/AIAstrologerPage";
import SevaPage from "./pages/SevaPage";
import VaramahalakshmiPage from "./pages/VaramahalakshmiPage";
import SankhyaShastraPage from "./pages/SankhyaShastraPage";
import PalmReadingPage from "./pages/PalmReadingPage";
import FaceReadingPage from "./pages/FaceReadingPage";
import { MaranottaraPage } from "./pages/MaranottaraPage";
import { LifeGuidancePage } from "./pages/LifeGuidancePage";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./features/auth/authStore";
import { LoginPage } from "./components/auth/LoginPage";
import { initDailyReportScheduler } from "./features/reports/dailyScheduler";
import DailyDarshanaPage from "./pages/DailyDarshanaPage";

export default function App(): JSX.Element {
  const isDailyRoute = typeof window !== "undefined" && (
    window.location.pathname.startsWith("/daily") ||
    window.location.pathname.startsWith("/darshana") ||
    window.location.search.includes("token=") ||
    window.location.search.includes("fromCal=") ||
    window.location.search.includes("action=ics")
  );

  const currentPage = useAppStore((state) => state.currentPage);
  const hydrateSettings = useAppStore((state) => state.hydrateSettings);
  const consentResolved = useAppStore((state) => state.consentResolved);
  const setConsentResolved = useAppStore((state) => state.setConsentResolved);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    const run = async () => {
      await hydrateSettings();
      await checkSession();
      initDailyReportScheduler();
      await analytics.init();
      await analytics.track("app_loaded");
    };
    void run();
  }, [hydrateSettings, checkSession]);

  if (isDailyRoute) {
    return <DailyDarshanaPage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-semibold text-sm">Loading Baggona Panchanga...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
      {!consentResolved && (
        <PrivacyConsent
          onResolved={() => {
            setConsentResolved(true);
          }}
        />
      )}
      <Layout>
        {currentPage === "home" && <HomePage />}
        {currentPage === "kundli" && <KundliPage />}
        {currentPage === "baggona" && <BaggonaPredictionsPage />}
        {currentPage === "predictions" && <PredictionsPage />}
        {currentPage === "insights" && <InsightsPage />}
        {currentPage === "melapak" && <MelapakPage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "muhurtha" && <MuhurthaPage />}
        {currentPage === "varshabavishya" && <VarshaBavishyaPage />}
        {currentPage === "ramanbhavishya" && <RamanBhavishyaPage />}
        {currentPage === "aiaastrologer" && <AIAstrologerPage />}
        {currentPage === "seva" && <SevaPage />}
        {currentPage === "varamahalakshmi" && <VaramahalakshmiPage />}
        {currentPage === "sankhyashastra" && <SankhyaShastraPage />}
        {currentPage === "palmreading" && <PalmReadingPage />}
        {currentPage === "facereading" && <FaceReadingPage />}
        {currentPage === "maranottara" && <MaranottaraPage />}
        {currentPage === "lifeguidance" && <LifeGuidancePage />}
      </Layout>
    </ErrorBoundary>
  );
}
