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
import { getNavLabel } from "../i18n/navigationLocale";
import InstallPrompt from "./InstallPrompt";

type Props = {
  children: ReactNode;
};

const TabButton = ({ page, icon, label, onClose }: { page: AppPage; icon: string; label: string; onClose?: () => void }) => {
  const currentPage = useAppStore((s) => s.currentPage);
  const setPage = useAppStore((s) => s.setPage);
  const active = currentPage === page;
  return (
    <button
      type="button"
      className={`flex items-center w-full px-6 py-4 text-left transition-colors ${
        active 
          ? "bg-amber-50 dark:bg-amber-900/20 text-[color:var(--jk-accent)] border-r-4 border-[color:var(--jk-accent)]" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
      onClick={() => {
        setPage(page);
        onClose?.();
      }}
    >
      <span className="w-8 text-xl" aria-hidden>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
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
      
      {/* Header with Hamburger */}
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 shadow-md flex items-center">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -ml-2 mr-2 text-amber-500 hover:text-amber-400 rounded-lg transition-colors focus:outline-none"
          aria-label="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold tracking-tight text-amber-400 block">{t("app.title")}</span>
          <p className="mt-0.5 text-xs text-amber-100/70">{t("app.subtitle")}</p>
        </div>
        {/* Reset / Edit Kundali button if a kundali exists */}
        {session ? (
          <button 
            onClick={() => {
              useKundliViewerStore.getState().clearSession();
              useAppStore.getState().setPage("kundli");
            }}
            className="ml-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg shadow-sm hover:bg-rose-100 transition-colors"
            title="Reset / Edit current Kundali"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{t("app.reset", "Reset")}</span>
          </button>
        ) : (
          <div className="w-10 ml-2" />
        )}
      </header>

      <div className="mx-auto max-w-4xl px-4 pt-4 pb-12">
        <InstallPrompt />
        {children}
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* Side Drawer Navigation */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-amber-100 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">{t("app.title")}</h2>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1 font-medium tracking-wide">{getNavLabel("menuHeader", language)}</p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-2">
          <TabButton page="home" icon="⌂" label={getNavLabel("home", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="varamahalakshmi" icon="🌸" label={getNavLabel("varamahalakshmi", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="kundli" icon="◈" label={getNavLabel("kundli", language)} onClose={() => setIsDrawerOpen(false)} />
          
          {session && (
            <>
              <div className="px-6 py-3 mt-2 mb-1 text-xs font-bold text-amber-700/80 dark:text-amber-500/80 uppercase tracking-widest bg-amber-50/30 dark:bg-slate-800/30">
                {getNavLabel("premiumSection", language)}
              </div>
              <TabButton page="baggona" icon="📜" label={getNavLabel("baggona", language)} onClose={() => setIsDrawerOpen(false)} />
              <TabButton page="predictions" icon="✦" label={getNavLabel("predictions", language)} onClose={() => setIsDrawerOpen(false)} />
              <TabButton page="insights" icon="☍" label={getNavLabel("insights", language)} onClose={() => setIsDrawerOpen(false)} />
              <TabButton page="ramanbhavishya" icon="📖" label={getNavLabel("ramanbhavishya", language)} onClose={() => setIsDrawerOpen(false)} />
              <TabButton page="aiaastrologer" icon="🤖" label={getNavLabel("aiaastrologer", language)} onClose={() => setIsDrawerOpen(false)} />
              <TabButton page="seva" icon="🪔" label={getNavLabel("seva", language)} onClose={() => setIsDrawerOpen(false)} />
              <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
            </>
          )}
          {!session && <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>}
          
          <TabButton page="muhurtha" icon="🔔" label={getNavLabel("muhurtha", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="sankhyashastra" icon="🔢" label={getNavLabel("sankhyashastra", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="palmreading" icon="✋" label={getNavLabel("palmreading", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="facereading" icon="👤" label={getNavLabel("facereading", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="maranottara" icon="🪔" label={getNavLabel("maranottara", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="hindinajanma" icon="🕉️" label={getNavLabel("hindinajanma", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="lifeguidance" icon="🔮" label={getNavLabel("lifeguidance", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="kaaladiksuchi" icon="🧭" label={getNavLabel("kaaladiksuchi", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="ayursanjeevini" icon="🛡️" label={getNavLabel("ayursanjeevini", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="astrogames" icon="🎮" label={getNavLabel("astrogames", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="varshabavishya" icon="🔮" label={getNavLabel("varshabavishya", language)} onClose={() => setIsDrawerOpen(false)} />
          <TabButton page="melapak" icon="💞" label={getNavLabel("melapak", language)} onClose={() => setIsDrawerOpen(false)} />
          <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
          <TabButton page="settings" icon="⚙" label={getNavLabel("settings", language)} onClose={() => setIsDrawerOpen(false)} />
          <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              useAuthStore.getState().logout();
            }}
            className="flex items-center w-full px-6 py-4 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
          >
            <span className="w-8 text-xl" aria-hidden>🚪</span>
            <span>{getNavLabel("signOut", language)}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
