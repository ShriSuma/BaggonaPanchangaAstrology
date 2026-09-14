import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashaEntry } from "../core/DashaBhuktiEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";

/** Session stored in localStorage so the chart survives page refreshes, phone interruptions, and navigation. */
export type KundliViewerSession = {
  result: KundliOutput;
  input: KundliInput;
  birthDateYmd: string;
  birthTimeHm: string;
  homePlaceName: string;
  placeLabel: string;
  dasha: DashaEntry[];
  dailyPrediction: string;
  includePriestCalendar?: boolean;
};

type KundliViewerState = {
  session: KundliViewerSession | null;
  draftInput: Partial<KundliViewerSession> | null;
  setSession: (s: KundliViewerSession) => void;
  setDraftInput: (d: Partial<KundliViewerSession>) => void;
  clearSession: () => void;
  resetResult: () => void;
};

export const useKundliViewerStore = create<KundliViewerState>()(
  persist(
    (set) => ({
      session: null,
      draftInput: null,
      setSession: (s) =>
        set({
          session: s,
          draftInput: {
            input: s.input,
            birthDateYmd: s.birthDateYmd,
            birthTimeHm: s.birthTimeHm,
            homePlaceName: s.homePlaceName,
            placeLabel: s.placeLabel,
            includePriestCalendar: s.includePriestCalendar
          }
        }),
      setDraftInput: (d) =>
        set((state) => ({
          draftInput: {
            ...(state.draftInput || {}),
            ...d
          }
        })),
      clearSession: () => set({ session: null, draftInput: null }),
      resetResult: () =>
        set((state) => ({
          session: null,
          draftInput: state.session
            ? {
                input: state.session.input,
                birthDateYmd: state.session.birthDateYmd,
                birthTimeHm: state.session.birthTimeHm,
                homePlaceName: state.session.homePlaceName,
                placeLabel: state.session.placeLabel,
                includePriestCalendar: state.session.includePriestCalendar
              }
            : state.draftInput
        }))
    }),
    {
      name: "baggona_kundli_viewer_store"
    }
  )
);

