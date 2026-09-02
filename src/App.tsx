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
import BhagyodayaPage from "./pages/BhagyodayaPage";
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
import { HindinaJanmaPage } from "./pages/HindinaJanmaPage";
import { LifeGuidancePage } from "./pages/LifeGuidancePage";
import AstroGamesPage from "./pages/AstroGamesPage";
import { DivyaKaalaDiksuchiPage } from "./pages/DivyaKaalaDiksuchiPage";
import { AyurSanjeeviniPage } from "./pages/AyurSanjeeviniPage";
import { PriestDashboard } from "./features/wallet/PriestDashboard";
import { SuperAdminDashboard } from "./features/wallet/SuperAdminDashboard";
import { SankhyaShastraPriestPortal } from "./features/priest/SankhyaShastraPriestPortal";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./features/auth/authStore";
import { LoginPage } from "./components/auth/LoginPage";
import { initDailyReportScheduler } from "./features/reports/dailyScheduler";
import DailyDarshanaPage from "./pages/DailyDarshanaPage";
import KundliAcademyStandalonePage from "./pages/KundliAcademyStandalonePage";
import { PriestPanchangaPage } from "./pages/PriestPanchangaPage";
import InstantReadingPage from "./pages/InstantReadingPage";
import PublicKundliPage from "./pages/PublicKundliPage";

export default function App(): JSX.Element {
  const isPriestPanchangaRoute = typeof window !== "undefined" && (
    window.location.pathname.startsWith("/priest-panchanga") ||
    window.location.pathname.startsWith("/priest_panchanga") ||
    window.location.search.includes("portal=priest_panchanga") ||
    window.location.search.includes("page=priest_panchanga") ||
    window.location.hash.includes("#/priest-panchanga")
  );

  const isAcademyRoute = typeof window !== "undefined" && !isPriestPanchangaRoute && (
    window.location.pathname.startsWith("/academy") ||
    window.location.pathname.startsWith("/learnkundli") ||
    window.location.search.includes("academyToken=") ||
    (window.location.search.includes("game=learnkundli") && window.location.search.includes("mode=standalone"))
  );

  const isDailyRoute = typeof window !== "undefined" && !isPriestPanchangaRoute && !isAcademyRoute && (
    window.location.pathname.startsWith("/daily") ||
    window.location.pathname.startsWith("/darshana") ||
    window.location.search.includes("token=") ||
    window.location.search.includes("fromCal=") ||
    window.location.search.includes("action=ics")
  );

  const isPublicKundliRoute = typeof window !== "undefined" && !isPriestPanchangaRoute && !isAcademyRoute && !isDailyRoute && (
    window.location.pathname.startsWith("/public-kundli") ||
    window.location.pathname.startsWith("/kundli-darshana") ||
    window.location.search.includes("portal=public_kundli") ||
    window.location.search.includes("portal=kundli_public") ||
    window.location.search.includes("portal=public") ||
    window.location.hash.includes("#/public-kundli")
  );

  const isPriestPortalRoute = typeof window !== "undefined" && !isPriestPanchangaRoute && !isAcademyRoute && !isDailyRoute && !isPublicKundliRoute && (
    window.location.pathname.startsWith("/priest") ||
    window.location.pathname.startsWith("/purohita") ||
    window.location.pathname.startsWith("/sankhya") ||
    window.location.search.includes("portal=priest") ||
    window.location.search.includes("portal=panchanga") ||
    window.location.search.includes("portal=purohita") ||
    window.location.search.includes("portal=sankhya") ||
    window.location.search.includes("portal=sankhyashastra") ||
    window.location.search.includes("portal=diksuchi") ||
    window.location.search.includes("portal=purva_janma") ||
    window.location.search.includes("portal=vahana_muhurtha") ||
    window.location.search.includes("modules=") ||
    window.location.hash.includes("#/priest") ||
    window.location.hash.includes("#/sankhya")
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
      // Check for URL parameters (?reset=true or ?reset=false)
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const resetParam = urlParams.get("reset");
        
        if (resetParam === "true" || resetParam === "1") {
          // Explicit reset requested: clear session cache
          localStorage.removeItem("baggona_priest_kundli_active_session");
          localStorage.removeItem("baggona_priest_sankhya_active_session");
        }

        // If coming from a deep link URL (token, portal, or reset flag), validate URL once and bypass recurring popups
        if (
          urlParams.has("token") ||
          urlParams.has("portal") ||
          urlParams.has("fromCal") ||
          urlParams.has("reset") ||
          isDailyRoute ||
          isAcademyRoute ||
          isPublicKundliRoute ||
          isPriestPortalRoute
        ) {
          localStorage.setItem("jk-consent", "accepted");
          setConsentResolved(true);
        }
      }

      await hydrateSettings();
      await checkSession();
      initDailyReportScheduler();
      await analytics.init();
      await analytics.track("app_loaded");
    };
    void run();
  }, [hydrateSettings, checkSession, setConsentResolved, isDailyRoute, isAcademyRoute, isPublicKundliRoute, isPriestPortalRoute]);

  if (isPriestPanchangaRoute) {
    return <PriestPanchangaPage />;
  }

  if (isAcademyRoute) {
    return <KundliAcademyStandalonePage />;
  }

  if (isDailyRoute) {
    return <DailyDarshanaPage />;
  }

  if (isPublicKundliRoute) {
    return <PublicKundliPage />;
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

  if (isPriestPortalRoute) {
    return (
      <ErrorBoundary>
        <PriestDashboard />
      </ErrorBoundary>
    );
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
        {currentPage === "predictions" && <PredictionsPage />}
        {currentPage === "insights" && <InsightsPage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "melapak" && <MelapakPage />}
        {currentPage === "baggona" && <BaggonaPredictionsPage />}
        {currentPage === "bhagyodaya" && <BhagyodayaPage />}
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
        {currentPage === "astrogames" && <AstroGamesPage />}
        {currentPage === "kaaladiksuchi" && <DivyaKaalaDiksuchiPage />}
        {currentPage === "hindinajanma" && <HindinaJanmaPage />}
        {currentPage === "ayursanjeevini" && <AyurSanjeeviniPage />}
        {currentPage === "priestdashboard" && <PriestDashboard />}
        {currentPage === "superadmindashboard" && <SuperAdminDashboard />}
        {currentPage === "priest_panchanga" && <PriestPanchangaPage />}
        {currentPage === "instant_reading" && <InstantReadingPage />}
        {currentPage === "public_kundli" && <PublicKundliPage />}
      </Layout>
    </ErrorBoundary>
  );
}
