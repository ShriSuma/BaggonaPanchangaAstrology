import { type ReactNode } from "react";

export const RASHI_ICONS: Record<number, ReactNode> = {
  // Mesha (Aries)
  0: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M12 5v14M17 9a5 5 0 0 0-10 0c0 2.5 2 4.5 5 4.5s5-2 5-4.5z" />
    </svg>
  ),
  // Vrishabha (Taurus)
  1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M12 14m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M17 9c0-3-2-6-5-6s-5 3-5 6" />
    </svg>
  ),
  // Mithuna (Gemini)
  2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M7 4v16M17 4v16M4 8h16M4 16h16" />
    </svg>
  ),
  // Karka (Cancer)
  3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M14.5 9.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M9.5 14.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M11 11a5 5 0 0 1 5 -5M13 13a5 5 0 0 1 -5 5" />
    </svg>
  ),
  // Simha (Leo)
  4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M10 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M11.5 11.5c1.5 -1.5 3.5 -2.5 5.5 -2.5a3 3 0 0 1 0 6c-2 0 -4 -1 -6 -3" />
      <path d="M13 16c-1.5 3 -4.5 4 -7 3" />
    </svg>
  ),
  // Kanya (Virgo)
  5: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M4 6v5a3 3 0 0 0 6 0v-5M10 6v5a3 3 0 0 0 6 0v-5M16 6v10c0 1.5 1 2.5 2.5 2.5s2.5 -1 2.5 -2.5" />
      <path d="M13 14l-4 6" />
    </svg>
  ),
  // Tula (Libra)
  6: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M4 14h16M4 17h16M12 14c0-4-3-7-6-7s-6 3-6 7" transform="translate(6, 0) scale(0.5, 1)" />
      <path d="M12 14c-3-3 -6-4 -9 -4" />
      <path d="M12 14c3-3 6-4 9 -4" />
    </svg>
  ),
  // Vrischika (Scorpio)
  7: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M4 6v5a3 3 0 0 0 6 0v-5M10 6v5a3 3 0 0 0 6 0v-5M16 6v10c0 1.5 1 2.5 2.5 2.5s2.5 -1 2.5 -2.5v-2" />
      <path d="M19 16l2 -2l2 2" />
    </svg>
  ),
  // Dhanu (Sagittarius)
  8: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M4 20l16 -16M13 4h7v7M6.5 10.5l7 7" />
    </svg>
  ),
  // Makara (Capricorn)
  9: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M4 6v5a3 3 0 0 0 6 0v-5M10 11a3 3 0 0 0 6 0v-2" />
      <path d="M16 9v5c0 2 -1 4 -3 5" />
      <circle cx="13" cy="19" r="1" />
    </svg>
  ),
  // Kumbha (Aquarius)
  10: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M3 10l3 -3l3 3l3 -3l3 3l3 -3l3 3M3 17l3 -3l3 3l3 -3l3 3l3 -3l3 3" />
    </svg>
  ),
  // Meena (Pisces)
  11: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-400">
      <path d="M6 4c-2 3 -2 11 0 16M18 4c2 3 2 11 0 16M4 12h16" />
    </svg>
  )
};
