import { create } from "zustand";
import type { DashaEntry } from "../core/DashaBhuktiEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";

/** In-memory session so the chart survives tab switches until the user closes it. */
export type KundliViewerSession = {
  result: KundliOutput;
  input: KundliInput;
  birthDateYmd: string;
  birthTimeHm: string;
  homePlaceName: string;
  placeLabel: string;
  dasha: DashaEntry[];
  dailyPrediction: string;
};

type KundliViewerState = {
  session: KundliViewerSession | null;
  draftInput: Partial<KundliViewerSession> | null;
  setSession: (s: KundliViewerSession) => void;
  clearSession: () => void;
  resetResult: () => void;
};

export const useKundliViewerStore = create<KundliViewerState>((set) => ({
  session: null,
  draftInput: null,
  setSession: (s) => set({ session: s, draftInput: { input: s.input, birthDateYmd: s.birthDateYmd, birthTimeHm: s.birthTimeHm, homePlaceName: s.homePlaceName, placeLabel: s.placeLabel } }),
  clearSession: () => set({ session: null, draftInput: null }),
  resetResult: () => set((state) => ({
    session: null,
    draftInput: state.session ? { input: state.session.input, birthDateYmd: state.session.birthDateYmd, birthTimeHm: state.session.birthTimeHm, homePlaceName: state.session.homePlaceName, placeLabel: state.session.placeLabel } : state.draftInput
  }))
}));
