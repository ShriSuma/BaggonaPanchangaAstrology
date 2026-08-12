import { useEffect, useMemo, useState } from "react";
import { calculateRhythm, type RhythmResult } from "../../core/DailyRhythmEngine";
import { recommendSevas, type SevaRecommendation } from "../../core/GokarnaSevaEngine";
import { isRoughIndiaRegion } from "../../core/placeTime";
import { useAppStore } from "../../stores/appStore";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";

const IST_OFFSET_MINUTES = 330;

/** Minutes east of UTC for the person's own place, so the calendar days line up locally. */
const offsetMinutesFor = (lat: number, lng: number): number => {
  if (isRoughIndiaRegion(lat, lng)) return IST_OFFSET_MINUTES;
  return Math.round(lng / 15) * 60;
};

export type SevaData = {
  rhythm: RhythmResult;
  recommendations: SevaRecommendation[];
  personName: string;
  gotra: string;
  placeLabel: string;
  birthDateYmd: string;
  birthTimeHm: string;
};

/**
 * Computes the six-month rhythm and the seva recommendations for the chart
 * currently held in the viewer session.
 *
 * The rhythm needs 180 ephemeris samples, so it is deferred by one frame to
 * let the loading state paint before the main thread is occupied.
 */
export const useSevaData = (): { data: SevaData | null; loading: boolean } => {
  const session = useKundliViewerStore((s) => s.session);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);

  const [data, setData] = useState<SevaData | null>(null);
  const [loading, setLoading] = useState(true);

  // A stable key so the heavy work reruns only when the inputs really change.
  const key = useMemo(() => {
    if (!session) return "";
    return [
      session.birthDateYmd,
      session.birthTimeHm,
      session.input.latitude,
      session.input.longitude,
      session.input.name,
      ayanamsaModel,
      nodeType
    ].join("|");
  }, [session, ayanamsaModel, nodeType]);

  useEffect(() => {
    if (!session) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      try {
        const { latitude, longitude } = session.input;

        const rhythm = calculateRhythm(
          session.result,
          session.birthDateYmd,
          session.birthTimeHm,
          latitude,
          longitude,
          new Date(),
          {
            days: 90,
            ayanamsaModel,
            nodeType,
            utcOffsetMinutes: offsetMinutesFor(latitude, longitude)
          }
        );

        const { recommendations } = recommendSevas(session.result, { ayanamsaModel, nodeType });

        if (cancelled) return;
        setData({
          rhythm,
          recommendations,
          personName: session.input.name?.trim() || "—",
          gotra: session.input.gothra?.trim() || "",
          placeLabel: session.placeLabel || session.homePlaceName || "",
          birthDateYmd: session.birthDateYmd,
          birthTimeHm: session.birthTimeHm
        });
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 30);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `key` captures every input that affects the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading };
};
