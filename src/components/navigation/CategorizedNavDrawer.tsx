import React, { useState, useMemo, useEffect } from "react";
import { useAppStore, type AppPage } from "../../stores/appStore";
import { useAuthStore } from "../../features/auth/authStore";
import { getNavLabel } from "../../i18n/navigationLocale";

export interface NavItemConfig {
  page: AppPage;
  icon: string;
  labelKey: string;
  badge?: string;
  badgeColor?: string;
  visible: boolean;
  keywords?: string[];
}

export interface NavCategoryConfig {
  id: string;
  titleKey: string;
  icon: string;
  accentColor: string;
  headerBg: string;
  items: NavItemConfig[];
}

interface CategorizedNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  isMasterOrSuperAdmin: boolean;
  language: string;
  currentUser?: string | null;
  priestName?: string | null;
  hasPanchanga: boolean;
  hasSankhya: boolean;
  hasDiksuchi: boolean;
  hasPurvaJanma: boolean;
  hasPublicKundli: boolean;
  session?: any;
}

export default function CategorizedNavDrawer({
  isOpen,
  onClose,
  role,
  isMasterOrSuperAdmin,
  language,
  currentUser,
  priestName,
  hasPanchanga,
  hasSankhya,
  hasDiksuchi,
  hasPurvaJanma,
  hasPublicKundli,
  session
}: CategorizedNavDrawerProps): JSX.Element | null {
  const currentPage = useAppStore((s) => s.currentPage);
  const setPage = useAppStore((s) => s.setPage);

  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Assemble full navigation categories based on live permissions
  const categories: NavCategoryConfig[] = useMemo(() => {
    return [
      {
        id: "panchanga",
        titleKey: "cat_panchanga_calendar",
        icon: "📅",
        accentColor: "text-amber-400 border-amber-500/40",
        headerBg: "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200",
        items: [
          { page: "home", icon: "⌂", labelKey: "home", visible: true, keywords: ["home", "mukha", "main"] },
          { page: "calendar", icon: "📅", labelKey: "calendar", badge: "90 Days", badgeColor: "bg-amber-500/30 text-amber-300 border-amber-500/40", visible: true, keywords: ["calendar", "panchanga", "darshana", "tithi", "nakshatra"] },
          { page: "quick_calendar", icon: "🗓️", labelKey: "quick_calendar", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["quick", "ashirvada", "patra"] },
          { page: "astodaya_grahana", icon: "☀️", labelKey: "astodaya_grahana", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["eclipse", "grahana", "astodaya", "guru", "shukra"] },
          { page: "muhurtha", icon: "🔔", labelKey: "muhurtha", badge: "Shubha", badgeColor: "bg-emerald-500/30 text-emerald-300 border-emerald-500/40", visible: hasPanchanga, keywords: ["muhurtha", "auspicious", "vivaha", "gruha", "vahana"] }
        ]
      },
      {
        id: "kundli",
        titleKey: "cat_kundli_predictions",
        icon: "◈",
        accentColor: "text-orange-400 border-orange-500/40",
        headerBg: "bg-orange-950/40 hover:bg-orange-950/60 text-orange-200",
        items: [
          { page: "kundli", icon: "◈", labelKey: "kundli", visible: hasPanchanga, keywords: ["kundli", "birth", "chart", "horoscope", "janma"] },
          { page: "public_kundli", icon: "🌟", labelKey: "public_kundli", badge: "Free", badgeColor: "bg-emerald-500/30 text-emerald-300 border-emerald-500/40", visible: hasPublicKundli, keywords: ["public", "instant", "darshana", "soul"] },
          { page: "ramanbhavishya", icon: "📖", labelKey: "ramanbhavishya", badge: "10 Ch", badgeColor: "bg-yellow-500/30 text-yellow-300 border-yellow-500/40", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["bhavishya", "raman", "pdf", "10 chapters", "life predictions"] },
          { page: "bhagyodaya", icon: "🌟", labelKey: "bhagyodaya", badge: "VIP", badgeColor: "bg-amber-500/40 text-amber-200 border-amber-400/50", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["bhagyodaya", "dossier", "career", "wealth"] },
          { page: "predictions", icon: "✦", labelKey: "predictions", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["predictions", "graha", "dasha", "bhukti"] },
          { page: "insights", icon: "☍", labelKey: "insights", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["insights", "yogas", "doshas", "deep"] },
          { page: "baggona", icon: "📜", labelKey: "baggona", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["baggona", "predictions", "annual"] },
          { page: "varshabavishya", icon: "🔮", labelKey: "varshabavishya", visible: hasPanchanga, keywords: ["yearly", "varsha", "annual", "bhavishya"] },
          { page: "melapak", icon: "💞", labelKey: "melapak", visible: hasPanchanga, keywords: ["matching", "marriage", "guna", "melapak", "compatibility"] },
          { page: "instant_reading", icon: "⚡", labelKey: "instant_reading", badge: "AI", badgeColor: "bg-cyan-500/30 text-cyan-300 border-cyan-500/40", visible: hasPanchanga, keywords: ["instant", "reading", "ai"] },
          { page: "gurukula", icon: "🏛️", labelKey: "gurukula", visible: hasPanchanga, keywords: ["gurukula", "academy", "learn", "classes"] },
          { page: "doshas", icon: "⚠️", labelKey: "doshas", visible: hasPanchanga, keywords: ["doshas", "kuja", "kalatra", "sarpa"] }
        ]
      },
      {
        id: "seva",
        titleKey: "cat_seva_pooja",
        icon: "🪔",
        accentColor: "text-emerald-400 border-emerald-500/40",
        headerBg: "bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-200",
        items: [
          { page: "package_download", icon: "📦", labelKey: "package_download", badge: "ZIP", badgeColor: "bg-yellow-500/40 text-yellow-200 border-yellow-400/50", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["package", "zip", "all reports", "download", "qr card"] },
          { page: "aiaastrologer", icon: "🔮", labelKey: "aiaastrologer", badge: "AI Q&A", badgeColor: "bg-purple-500/30 text-purple-300 border-purple-500/40", visible: true, keywords: ["ask", "qa", "consultation", "prashne", "prashnottara"] },
          { page: "guided_pooja", icon: "🕉️", labelKey: "guided_pooja", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["pooja", "vidhi", "mantra", "guided", "homa"] },
          { page: "pooja_estimate", icon: "📜", labelKey: "pooja_estimate", badge: "New", badgeColor: "bg-amber-500/30 text-amber-300 border-amber-500/40", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["estimate", "cost", "samagri", "priest", "plan"] },
          { page: "seva", icon: "🪔", labelKey: "seva", visible: hasPanchanga && (session || isMasterOrSuperAdmin), keywords: ["seva", "prasada", "temple", "donation", "archana"] },
          { page: "varamahalakshmi", icon: "🌸", labelKey: "varamahalakshmi", visible: hasPanchanga, keywords: ["vratha", "lakshmi", "pooja"] }
        ]
      },
      {
        id: "mystic",
        titleKey: "cat_mystic_shastra",
        icon: "🔮",
        accentColor: "text-purple-400 border-purple-500/40",
        headerBg: "bg-purple-950/40 hover:bg-purple-950/60 text-purple-200",
        items: [
          { page: "sankhyashastra", icon: "🔢", labelKey: "sankhyashastra", visible: hasSankhya, keywords: ["numerology", "numbers", "sankhya"] },
          { page: "palmreading", icon: "✋", labelKey: "palmreading", visible: hasPanchanga, keywords: ["palm", "reading", "hasta", "samudrika"] },
          { page: "facereading", icon: "👤", labelKey: "facereading", visible: hasPanchanga, keywords: ["face", "reading", "mukha", "samudrika"] },
          { page: "hindinajanma", icon: "🕉️", labelKey: "hindinajanma", visible: hasPurvaJanma, keywords: ["past life", "purva janma", "karma"] },
          { page: "maranottara", icon: "🪔", labelKey: "maranottara", visible: hasPanchanga, keywords: ["shradh", "maranottara", "pitru", "tarpana"] },
          { page: "kaaladiksuchi", icon: "🧭", labelKey: "kaaladiksuchi", visible: hasDiksuchi, keywords: ["diksuchi", "direction", "kaala"] },
          { page: "ayursanjeevini", icon: "🛡️", labelKey: "ayursanjeevini", visible: hasPanchanga, keywords: ["ayur", "sanjeevini", "health", "longevity"] },
          { page: "lifeguidance", icon: "🔮", labelKey: "lifeguidance", visible: hasPanchanga, keywords: ["guidance", "solutions", "life"] },
          { page: "astrogames", icon: "🎮", labelKey: "astrogames", visible: hasPanchanga, keywords: ["games", "arena", "khela"] }
        ]
      },
      {
        id: "admin",
        titleKey: "cat_admin_system",
        icon: "⚙️",
        accentColor: "text-sky-400 border-sky-500/40",
        headerBg: "bg-sky-950/40 hover:bg-sky-950/60 text-sky-200",
        items: [
          { page: "superadmindashboard", icon: "🛡️", labelKey: "superadmindashboard", badge: "ADMIN", badgeColor: "bg-amber-500 text-slate-950 font-bold", visible: role === "superadmin", keywords: ["superadmin", "admin", "dashboard", "control"] },
          { page: "priestdashboard", icon: "🪙", labelKey: "priestdashboard", visible: true, keywords: ["priest", "coins", "wallet", "portal"] },
          { page: "settings", icon: "⚙", labelKey: "settings", visible: true, keywords: ["settings", "location", "language", "theme"] }
        ]
      }
    ];
  }, [
    hasPanchanga,
    hasSankhya,
    hasDiksuchi,
    hasPurvaJanma,
    hasPublicKundli,
    session,
    isMasterOrSuperAdmin,
    role
  ]);

  // Determine which category currently houses currentPage
  const currentCategory = useMemo(() => {
    for (const cat of categories) {
      if (cat.items.some((item) => item.visible && item.page === currentPage)) {
        return cat.id;
      }
    }
    return "panchanga";
  }, [categories, currentPage]);

  // Initialize open state: expand the current page's category by default
  useEffect(() => {
    if (isOpen) {
      setOpenCategories((prev) => {
        // If user hasn't explicitly customized, keep currentCategory open
        if (Object.keys(prev).length === 0) {
          return { [currentCategory]: true };
        }
        return prev;
      });
    }
  }, [isOpen, currentCategory]);

  // Toggle category accordion
  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    categories.forEach((cat) => {
      allOpen[cat.id] = true;
    });
    setOpenCategories(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenCategories({});
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Search filter computation
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return categories.map((cat) => ({
        ...cat,
        visibleItems: cat.items.filter((item) => item.visible)
      }));
    }

    return categories
      .map((cat) => {
        const catTitle = getNavLabel(cat.titleKey, language).toLowerCase();
        const catMatches = catTitle.includes(q);

        const visibleItems = cat.items.filter((item) => {
          if (!item.visible) return false;
          if (catMatches) return true;
          const label = getNavLabel(item.labelKey, language).toLowerCase();
          const pageStr = item.page.toLowerCase();
          const keywords = item.keywords || [];
          return (
            label.includes(q) ||
            pageStr.includes(q) ||
            keywords.some((k) => k.toLowerCase().includes(q))
          );
        });

        return {
          ...cat,
          visibleItems
        };
      })
      .filter((cat) => cat.visibleItems.length > 0);
  }, [categories, searchQuery, language]);

  const totalMatchingItems = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.visibleItems.length, 0);
  }, [filteredCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed Glassmorphic Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Smooth Slide-In) */}
      <div
        className="fixed inset-y-0 left-0 max-w-[85vw] w-80 sm:w-88 bg-slate-950 border-r border-amber-500/25 shadow-2xl flex flex-col z-50 text-slate-100 overflow-hidden transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Application Navigation Drawer"
      >
        {/* Sticky Header */}
        <div className="p-4 border-b border-amber-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none" aria-hidden>🪔</span>
              <div>
                <h2 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
                </h2>
                <p className="text-[11px] font-medium text-amber-200/70">
                  {getNavLabel("menuHeader", language)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
              aria-label="Close Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Profile Identity Bar */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-300">
              {isMasterOrSuperAdmin ? "👑 Master Profile" : priestName ? `🙏 ${priestName}` : `👤 ${currentUser}`}
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono text-[10px] font-bold">
              {isMasterOrSuperAdmin ? "UNLIMITED" : `${role.toUpperCase()}`}
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="mt-3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getNavLabel("searchPlaceholder", language)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg text-xs text-slate-100 placeholder-slate-400 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200 text-xs"
                title={getNavLabel("clearSearch", language)}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Expand / Collapse Controls */}
          {!searchQuery && (
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">
                {categories.length} ವಿಭಾಗಗಳು / Categories
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExpandAll}
                  className="text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                >
                  {getNavLabel("expandAll", language)}
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={handleCollapseAll}
                  className="text-slate-400 hover:text-slate-200 hover:underline transition-colors cursor-pointer"
                >
                  {getNavLabel("collapseAll", language)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Categories & Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 custom-scrollbar">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <span className="text-3xl block mb-2" aria-hidden>🔍</span>
              <p className="text-sm font-semibold text-slate-300">
                {getNavLabel("noResults", language)}
              </p>
              <p className="text-xs text-slate-400 mt-1">"{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
              >
                {getNavLabel("clearSearch", language)}
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const isCategoryOpen = searchQuery ? true : !!openCategories[category.id];
              const categoryTitle = getNavLabel(category.titleKey, language);
              const hasActiveChild = category.visibleItems.some((item) => item.page === currentPage);

              return (
                <div
                  key={category.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    hasActiveChild
                      ? "border-amber-500/50 bg-slate-900/60 shadow-xs"
                      : "border-slate-800/80 bg-slate-900/30"
                  }`}
                >
                  {/* Category Header (Accordion trigger) */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors font-bold text-xs ${category.headerBg} focus:outline-none`}
                    aria-expanded={isCategoryOpen}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm select-none" aria-hidden>
                        {category.icon}
                      </span>
                      <span className="tracking-wide">{categoryTitle}</span>
                      {hasActiveChild && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Active page here" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-900/70 text-slate-300 border border-slate-700/60 font-semibold">
                        {category.visibleItems.length}
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${
                          isCategoryOpen ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Subtopics List */}
                  {isCategoryOpen && (
                    <div className="p-1.5 space-y-1 bg-slate-950/60 divide-y divide-slate-800/30 animate-in fade-in duration-150">
                      {category.visibleItems.map((item) => {
                        const isActive = currentPage === item.page;
                        const label = getNavLabel(item.labelKey, language);

                        return (
                          <button
                            key={item.page}
                            type="button"
                            onClick={() => {
                              setPage(item.page);
                              onClose();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-all duration-150 ${
                              isActive
                                ? "bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent text-amber-200 border-l-3 border-amber-400 font-bold shadow-xs"
                                : "text-slate-300 hover:text-amber-200 hover:bg-slate-800/60 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-sm select-none flex-shrink-0" aria-hidden>
                                {item.icon}
                              </span>
                              <span className="truncate">{label}</span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded-md border font-semibold uppercase tracking-wider ${
                                    item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {isActive ? (
                                <span className="text-[10px] text-amber-400 font-mono font-bold">
                                  ●
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[10px] group-hover:text-slate-400">
                                  ›
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Sticky Drawer Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setPage("settings");
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
            >
              <span>⚙️</span>
              <span>{getNavLabel("settings", language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                useAuthStore.getState().logout();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
              title={getNavLabel("signOut", language)}
            >
              <span>🚪</span>
              <span>{getNavLabel("signOut", language)}</span>
            </button>
          </div>

          <div className="text-center pt-1 text-[10px] text-slate-400">
            ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ
          </div>
        </div>
      </div>
    </div>
  );
}
