import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import PrasadaKit from "../components/seva/PrasadaKit";
import RoyalBookletTab from "../components/seva/RoyalBookletTab";
import PriestQrGeneratorTab from "../components/seva/PriestQrGeneratorTab";
import SevaCalendar from "../components/seva/SevaCalendar";
import SevaCalendarSyncModal from "../components/seva/SevaCalendarSyncModal";
import SevaDayDetail from "../components/seva/SevaDayDetail";
import SevaRecommendations from "../components/seva/SevaRecommendations";
import { T, pick } from "../features/seva/sevaLocale";
import {
  formatLongDate,
  nakshatraName,
  rashiName,
  todayYmd
} from "../features/seva/sevaPresentation";
import { useSevaData } from "../features/seva/useSevaData";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";

type SevaTab = "seva" | "calendar" | "prasada" | "royal" | "priestQr";

const IdentityChip = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <div className="rounded-lg border border-amber-300/60 bg-white/70 px-3 py-1.5">
    <div className="text-[9px] font-bold uppercase tracking-widest text-amber-700/70">{label}</div>
    <div className="text-sm font-semibold text-amber-950">{value}</div>
  </div>
);

export default function SevaPage(): JSX.Element {
  const lang = useAppStore((s) => s.language);
  const setPage = useAppStore((s) => s.setPage);
  const session = useKundliViewerStore((s) => s.session);
  const { data, loading } = useSevaData();

  const [tab, setTab] = useState<SevaTab>("seva");
  const [selectedYmd, setSelectedYmd] = useState("");
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Land on today once the six months are ready.
  useEffect(() => {
    if (!data) return;
    const today = todayYmd();
    const exists = data.rhythm.days.some((d) => d.ymd === today);
    setSelectedYmd(exists ? today : data.rhythm.days[0]!.ymd);
  }, [data]);

  const selectedDay = useMemo(
    () => data?.rhythm.days.find((d) => d.ymd === selectedYmd) ?? data?.rhythm.days[0],
    [data, selectedYmd]
  );

  /* ---------- No chart yet ---------- */
  if (!session) {
    return (
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">
          ❖
        </div>
        <h2 className="mt-4 font-serif text-xl font-semibold text-amber-950">
          {pick(T.pageTitle!, lang)}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-900/75">
          {pick(T.needChart!, lang)}
        </p>
        <button
          type="button"
          onClick={() => setPage("kundli")}
          className="mt-5 rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-amber-800"
        >
          {pick(T.goToChart!, lang)}
        </button>
      </Card>
    );
  }

  /* ---------- Computing ---------- */
  if (loading || !data || !selectedDay) {
    return (
      <Card className="py-14 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-amber-200 border-t-amber-700" />
        <p className="mt-4 text-sm text-amber-900/75">{pick(T.calculating!, lang)}</p>
      </Card>
    );
  }

  const { rhythm, recommendations } = data;

  const identity = {
    personName: data.personName,
    gotra: data.gotra,
    rashiIndex: rhythm.janmaRashiIndex,
    nakshatraIndex: rhythm.janmaNakshatraIndex,
    placeLabel: data.placeLabel,
    dob: session?.birthDateYmd,
    tob: session?.birthTimeHm
  };

  const tabs: { id: SevaTab; label: string }[] = [
    { id: "seva", label: pick(T.tabSeva!, lang) },
    { id: "calendar", label: pick(T.tabCalendar!, lang) },
    {
      id: "priestQr",
      label: pick({
        kn: "📲 QR ಕೋಡ್ & ಸಿಂಕ್ (1M/3M/6M/1Y)",
        hi: "📲 QR कोड & सिंक (1M/3M/6M/1Y)",
        te: "📲 QR కోడ్ & సింక్ (1M/3M/6M/1Y)",
        ta: "📲 QR குறியீடு & சிங் (1M/3M/6M/1Y)",
        en: "📲 QR Code & Sync (1M/3M/6M/1Y)"
      }, lang)
    },
    { id: "prasada", label: pick(T.tabPrasada!, lang) },
    {
      id: "royal",
      label: pick({
        kn: "👑 ೮ ಪುಟಗಳ ರಾಯಲ್ ಗ್ರಂಥ (₹1,200)",
        hi: "👑 8-पृष्ठ रॉयल ग्रंथ (₹1,200)",
        te: "👑 8-పేజీల రాయల్ గ్రంథం (₹1,200)",
        ta: "👑 8-பக்க ராயல் நூல் (₹1,200)",
        en: "👑 8-Page Royal Booklet (₹1,200)"
      }, lang)
    }
  ];

  const monthOfSelected = rhythm.months.find(
    (m) => m.monthIndex === selectedDay.monthIndex && m.year === selectedDay.year
  );

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #B45309 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-700/80">
            {pick(T.preparedBy!, lang)}
          </div>
          <h1 className="mt-1.5 font-serif text-2xl font-bold text-amber-950 sm:text-3xl">
            {pick(T.pageTitle!, lang)}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-amber-900/70">
            {pick(T.pageSubtitle!, lang)}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <IdentityChip label={pick(T.labelName!, lang)} value={identity.personName} />
              <IdentityChip
                label={pick(T.labelRashi!, lang)}
                value={rashiName(identity.rashiIndex, lang)}
              />
              <IdentityChip
                label={pick(T.labelNakshatra!, lang)}
                value={nakshatraName(identity.nakshatraIndex, lang)}
              />
              {identity.gotra && (
                <IdentityChip label={pick(T.labelGotra!, lang)} value={identity.gotra} />
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-2 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900"
            >
              <span>📲</span> {pick(T.syncCalendarTitle!, lang)}
            </button>
          </div>
        </div>
      </Card>

      {/* Sub-tabs */}
      <div className="flex gap-1.5 rounded-xl border border-amber-200 bg-white/60 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-2 py-2 text-[12px] font-semibold leading-tight transition sm:text-sm ${
              tab === t.id
                ? "bg-amber-700 text-amber-50 shadow-sm"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "seva" && (
        <Card>
          <SevaRecommendations recommendations={recommendations} lang={lang} />
        </Card>
      )}

      {tab === "calendar" && (
        <>
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-semibold text-amber-950">
                  {pick(T.tabCalendar!, lang)}
                </h3>
                <p className="mt-1 text-xs text-amber-900/60">{pick(T.tapDay!, lang)}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
              >
                <span>📲</span> {pick(T.syncCalendarTitle!, lang)}
              </button>
            </div>
            <SevaCalendar
              rhythm={rhythm}
              lang={lang}
              selectedYmd={selectedYmd}
              onSelect={setSelectedYmd}
            />
          </Card>

          <SevaDayDetail day={selectedDay} lang={lang} />

          {monthOfSelected && (
            <Card>
              <h3 className="mb-3 font-serif text-lg font-semibold text-amber-950">
                {pick(T.monthSummary!, lang)}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800/80">
                    {pick(T.bestDays!, lang)}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {monthOfSelected.bestDays.map((d) => (
                      <button
                        key={d.ymd}
                        type="button"
                        onClick={() => setSelectedYmd(d.ymd)}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 transition hover:bg-emerald-100"
                      >
                        {formatLongDate(d, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                {monthOfSelected.moneyDays.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-800/80">
                      {pick(T.moneyDays!, lang)}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {monthOfSelected.moneyDays.slice(0, 8).map((d) => (
                        <button
                          key={d.ymd}
                          type="button"
                          onClick={() => setSelectedYmd(d.ymd)}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
                        >
                          {formatLongDate(d, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {pick(T.carefulDays!, lang)}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {monthOfSelected.carefulDays.map((d) => (
                      <button
                        key={d.ymd}
                        type="button"
                        onClick={() => setSelectedYmd(d.ymd)}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        {formatLongDate(d, lang)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {tab === "prasada" && (
        <Card>
          <PrasadaKit
            rhythm={rhythm}
            recommendations={recommendations}
            identity={identity}
            lang={lang}
          />
        </Card>
      )}

      {tab === "royal" && (
        <Card>
          <RoyalBookletTab
            rhythm={rhythm}
            identity={identity}
            lang={lang}
          />
        </Card>
      )}

      {tab === "priestQr" && (
        <Card>
          <PriestQrGeneratorTab identity={identity} lang={lang} />
        </Card>
      )}

      {/* 6-Month Calendar & QR Code Sync Modal */}
      <SevaCalendarSyncModal
        days={rhythm.days}
        personName={identity.personName}
        dob={identity.dob}
        tob={identity.tob}
        lang={lang}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
