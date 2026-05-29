import { normalizeDegree } from "./AstroMath";

export const msToGhatiVighati = (ms: number): { ghati: number; vighati: number } => {
  const totalMinutes = Math.abs(ms) / 60000;
  const totalGhatis = totalMinutes / 24;
  const ghati = Math.floor(totalGhatis);
  const vighati = Math.floor((totalGhatis - ghati) * 60);
  return { ghati, vighati };
};

export const formatGhatiVighati = (ghati: number, vighati: number): string => {
  return `ಘಟಿ ${ghati.toString().padStart(2, "೦")} ವಿ ${vighati.toString().padStart(2, "೦")}`
    .replace(/0/g, "೦").replace(/1/g, "೧").replace(/2/g, "೨").replace(/3/g, "೩")
    .replace(/4/g, "೪").replace(/5/g, "೫").replace(/6/g, "೬").replace(/7/g, "೭")
    .replace(/8/g, "೮").replace(/9/g, "೯");
};

export const calculateSuryodayadiIshta = (birthUtc: Date, sunriseUtc: Date): { ghati: number; vighati: number } => {
  // If birth is before sunrise, it belongs to the previous day's sunrise in Vedic terms,
  // but for simple calculation here we just assume sunriseUtc is the correct one for the birth day.
  const diffMs = birthUtc.getTime() - sunriseUtc.getTime();
  if (diffMs < 0) {
    // If negative, it means birth was before the sunrise of the given date.
    // In a real panchang engine, we'd fetch the previous day's sunrise.
    // For now we just return 0, 0 or handle absolute difference.
    return msToGhatiVighati(Math.abs(diffMs));
  }
  return msToGhatiVighati(diffMs);
};

// These are mock calculations for the exact Baggona Panchang specific values.
// In reality, these require the specific ephemeris and local algorithms.
export const getTraditionalPanchangDetails = () => {
  return {
    visha: "ಘಟಿ ೦೦ ವಿ ೦೦",
    amruta: "ಘಟಿ ೦೦ ವಿ ೦೦",
    diva: "ಘಟಿ ೩೦ ವಿ ೦೦",
    sankranti: "ಸಂಕ್ರಾಂತಿ",
    parama: "ಘಟಿ ೬೦ ವಿ ೦೦",
    ishta: "ಘಟಿ ೦೦ ವಿ ೦೦",
    gata: "ಘಟಿ ೦೦ ವಿ ೦೦",
  };
};
