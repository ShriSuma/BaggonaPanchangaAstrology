/**
 * Baggona Panchanga - Guided Pooja & Vrata URL Configuration & Sharing Service
 * (ಪೂಜಾ & ವ್ರತ ಲಿಂಕ್ ಜನರೇಟರ್ & ಡಿಕೋಡರ್ ಸೇವೆ)
 * 
 * Enables priests and devotees to select specific poojas, sacred vratas,
 * configure personalized Sankalpa intentions (marriage, family, exams, job, etc.),
 * and generate a unique, shareable link for end-users to perform guided rituals.
 */

import type { SevaLang } from "../seva/sevaLocale";
import { GUIDED_POOJA_KEYS, type GuidedPoojaKey } from "./guidedPoojaData";
import { GUIDED_VRATA_KEYS, type GuidedVrataKey } from "./guidedVrataData";
import { SANKALPA_PURPOSES, type SankalpaPurposeKey } from "./guidedSankalpaService";

export interface GuidedPoojaConfig {
  poojaKeys: GuidedPoojaKey[];
  vrataKeys: GuidedVrataKey[];
  sankalpaKey: SankalpaPurposeKey;
  customGoal?: string;
  activeCategory: "poojas" | "vratas";
  selectedItemKey?: string;
  devoteeName?: string;
  devoteePhone?: string;
  devoteeEmail?: string;
  gotra?: string;
  lang?: SevaLang;
  priestName?: string;
}

export const DEFAULT_GUIDED_POOJA_CONFIG: GuidedPoojaConfig = {
  poojaKeys: [...GUIDED_POOJA_KEYS], // By default all 5 poojas
  vrataKeys: [...GUIDED_VRATA_KEYS], // By default all 6 vratas
  sankalpaKey: "kutumba",
  activeCategory: "poojas",
  devoteeName: "ಭಕ್ತರು",
  gotra: "ಕಾಶ್ಯಪ",
  lang: "kn",
  priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
};

/**
 * Base64URL safe encoder with Unicode (Kannada) support
 */
function toBase64Url(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    const b64 = typeof btoa === "function" ? btoa(bin) : "";
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return encodeURIComponent(str);
  }
}

/**
 * Base64URL safe decoder with Unicode (Kannada) support
 */
function fromBase64Url(str: string): string {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = typeof atob === "function" ? atob(b64) : "";
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(str);
  }
}

/**
 * Generates the full shareable URL with selected poojas, vratas, and devotee parameters
 */
export function generateGuidedPoojaShareUrl(
  config: Partial<GuidedPoojaConfig>,
  origin?: string
): string {
  const merged: GuidedPoojaConfig = {
    ...DEFAULT_GUIDED_POOJA_CONFIG,
    ...config,
    poojaKeys: config.poojaKeys !== undefined ? config.poojaKeys : [...GUIDED_POOJA_KEYS],
    vrataKeys: config.vrataKeys !== undefined ? config.vrataKeys : [...GUIDED_VRATA_KEYS]
  };

  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://baggona.com");
  const params = new URLSearchParams();

  // Readable poojas parameter (only if poojas are selected)
  if (merged.poojaKeys && merged.poojaKeys.length > 0) {
    params.set("poojas", merged.poojaKeys.join(","));
  }

  // Readable vratas parameter (only if vratas are selected)
  if (merged.vrataKeys && merged.vrataKeys.length > 0) {
    params.set("vratas", merged.vrataKeys.join(","));
  }

  // Active category: poojas or vratas
  if (merged.activeCategory && merged.activeCategory !== "poojas") {
    params.set("tab", merged.activeCategory);
  }

  // Sankalpa purpose key
  if (merged.sankalpaKey && merged.sankalpaKey !== "kutumba") {
    params.set("sankalpa", merged.sankalpaKey);
  }

  // Custom Sankalpa goal text (if any)
  if (merged.sankalpaKey === "custom" && merged.customGoal && merged.customGoal.trim()) {
    params.set("goal", merged.customGoal.trim());
  }

  if (merged.selectedItemKey) {
    params.set("item", merged.selectedItemKey);
  }

  if (merged.lang && merged.lang !== "kn") {
    params.set("lang", merged.lang);
  }
  if (merged.devoteeName && merged.devoteeName.trim() && merged.devoteeName !== "ಭಕ್ತರು") {
    params.set("name", merged.devoteeName.trim());
  }
  if (merged.devoteePhone && merged.devoteePhone.trim()) {
    params.set("phone", merged.devoteePhone.trim());
  }
  if (merged.devoteeEmail && merged.devoteeEmail.trim()) {
    params.set("email", merged.devoteeEmail.trim());
  }
  if (merged.gotra && merged.gotra.trim() && merged.gotra !== "ಕಾಶ್ಯಪ") {
    params.set("gotra", merged.gotra.trim());
  }
  if (merged.priestName && merged.priestName.trim() && merged.priestName !== "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್") {
    params.set("priest", merged.priestName.trim());
  }

  // Also include a compact resilient token for bookmarking / social messengers
  const tokenPayload = JSON.stringify({
    p: merged.poojaKeys,
    v: merged.vrataKeys,
    cat: merged.activeCategory,
    sk: merged.sankalpaKey,
    cg: merged.customGoal,
    it: merged.selectedItemKey,
    n: merged.devoteeName,
    ph: merged.devoteePhone,
    em: merged.devoteeEmail,
    g: merged.gotra,
    l: merged.lang,
    pr: merged.priestName
  });
  params.set("pToken", toBase64Url(tokenPayload));

  return `${baseOrigin}/guided-pooja?${params.toString()}`;
}

/**
 * Parses the configuration from current window URL or provided search string
 */
export function parseGuidedPoojaFromUrl(searchOrUrl?: string): GuidedPoojaConfig {
  const fallback = { ...DEFAULT_GUIDED_POOJA_CONFIG };

  if (typeof window === "undefined" && !searchOrUrl) {
    return fallback;
  }

  try {
    let search = searchOrUrl || "";
    if (!search && typeof window !== "undefined") {
      search = window.location.search || "";
      if (!search && window.location.hash.includes("?")) {
        search = window.location.hash.substring(window.location.hash.indexOf("?"));
      }
    } else if (search.includes("?")) {
      search = search.substring(search.indexOf("?"));
    }

    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);

    // Check if encoded token exists
    const pToken = params.get("pToken") || params.get("poojaToken");
    let tokenParsed: any = null;
    if (pToken) {
      try {
        const decodedStr = fromBase64Url(pToken);
        tokenParsed = JSON.parse(decodedStr);
      } catch (err) {
        console.warn("[GuidedPoojaUrl] Token decode warning, falling back to params:", err);
      }
    }

    // Check direct query parameters for Poojas
    const poojasParam = params.get("poojas") || params.get("pooja") || params.get("items");
    let resolvedPoojaKeys: GuidedPoojaKey[] = [];

    if (poojasParam) {
      const split = poojasParam.split(",").map((s) => s.trim().toLowerCase());
      for (const item of split) {
        if (GUIDED_POOJA_KEYS.includes(item as GuidedPoojaKey)) {
          resolvedPoojaKeys.push(item as GuidedPoojaKey);
        } else if (item === "sandhya" || item === "sandhyavandanam") {
          resolvedPoojaKeys.push("sandhyavandana");
        } else if (item === "morning" || item === "pratah" || item === "deva") {
          resolvedPoojaKeys.push("morning_pooja");
        } else if (item === "evening" || item === "sayankaala" || item === "deepa") {
          resolvedPoojaKeys.push("evening_pooja");
        } else if (item === "ganapati" || item === "ganesha" || item === "sankashti") {
          resolvedPoojaKeys.push("ganapati_pooja");
        } else if (item === "shiva" || item === "rudra" || item === "rudrabhisheka") {
          resolvedPoojaKeys.push("shiva_pooja");
        }
      }
    } else if (tokenParsed && Array.isArray(tokenParsed.p)) {
      resolvedPoojaKeys = (tokenParsed.p as GuidedPoojaKey[]).filter((k) => GUIDED_POOJA_KEYS.includes(k));
    }

    // Check direct query parameters for Vratas
    const vratasParam = params.get("vratas") || params.get("vrata");
    let resolvedVrataKeys: GuidedVrataKey[] = [];

    if (vratasParam) {
      const split = vratasParam.split(",").map((s) => s.trim().toLowerCase());
      for (const item of split) {
        if (GUIDED_VRATA_KEYS.includes(item as GuidedVrataKey)) {
          resolvedVrataKeys.push(item as GuidedVrataKey);
        } else if (item === "kalyana" || item === "mangalagauri" || item === "marriage" || item === "vivaha") {
          resolvedVrataKeys.push("kalyana_mangalagauri_vrata");
        } else if (item === "satyanarayana" || item === "satyanarayan") {
          resolvedVrataKeys.push("satyanarayana_vrata");
        } else if (item === "varalakshmi" || item === "lakshmi") {
          resolvedVrataKeys.push("varalakshmi_vrata");
        } else if (item === "sankashti" || item === "sankashtahara" || item === "sankata") {
          resolvedVrataKeys.push("sankashtahara_vrata");
        } else if (item === "somavara" || item === "shiva_vrata" || item === "mrityunjaya") {
          resolvedVrataKeys.push("somavara_shiva_vrata");
        } else if (item === "saraswati" || item === "medha" || item === "vidya") {
          resolvedVrataKeys.push("saraswati_medha_vrata");
        }
      }
    } else if (tokenParsed && Array.isArray(tokenParsed.v)) {
      resolvedVrataKeys = (tokenParsed.v as GuidedVrataKey[]).filter((k) => GUIDED_VRATA_KEYS.includes(k));
    }

    // STRICT USER MANDATE:
    // If only Vrata(s) were selected in the URL, create ONLY the Vrata tab(s) - zero default poojas!
    // If only Pooja(s) were selected in the URL, create ONLY the Pooja tab(s) - zero default vratas!
    // If both or neither, reflect both.
    const hasExplicitVratas = Boolean(vratasParam) || (tokenParsed && Array.isArray(tokenParsed.v) && tokenParsed.v.length > 0);
    const hasExplicitPoojas = Boolean(poojasParam) || (tokenParsed && Array.isArray(tokenParsed.p) && tokenParsed.p.length > 0);

    let finalPoojaKeys: GuidedPoojaKey[];
    let finalVrataKeys: GuidedVrataKey[];

    if (hasExplicitVratas && !hasExplicitPoojas) {
      finalVrataKeys = resolvedVrataKeys.length > 0 ? resolvedVrataKeys : [...GUIDED_VRATA_KEYS];
      finalPoojaKeys = [];
    } else if (hasExplicitPoojas && !hasExplicitVratas) {
      finalPoojaKeys = resolvedPoojaKeys.length > 0 ? resolvedPoojaKeys : [...GUIDED_POOJA_KEYS];
      finalVrataKeys = [];
    } else if (hasExplicitPoojas && hasExplicitVratas) {
      finalPoojaKeys = resolvedPoojaKeys.length > 0 ? resolvedPoojaKeys : [...GUIDED_POOJA_KEYS];
      finalVrataKeys = resolvedVrataKeys.length > 0 ? resolvedVrataKeys : [...GUIDED_VRATA_KEYS];
    } else {
      // Default initial state: all poojas and vratas available
      finalPoojaKeys = [...GUIDED_POOJA_KEYS];
      finalVrataKeys = [...GUIDED_VRATA_KEYS];
    }

    // Sankalpa purpose
    const rawSankalpa = params.get("sankalpa") || params.get("purpose") || tokenParsed?.sk || "kutumba";
    const sankalpaParam = String(rawSankalpa).toLowerCase();
    const sankalpaKey: SankalpaPurposeKey = (sankalpaParam in SANKALPA_PURPOSES)
      ? (sankalpaParam as SankalpaPurposeKey)
      : (sankalpaParam.includes("marri") || sankalpaParam.includes("viva") ? "vivaha" : "kutumba");

    const customGoal = params.get("goal") || params.get("wish") || tokenParsed?.cg || undefined;

    // Active Category (Tab)
    const tabParam = (params.get("tab") || params.get("category") || params.get("mode") || tokenParsed?.cat || "").toLowerCase();
    let activeCategory: "poojas" | "vratas" = "poojas";
    if (finalPoojaKeys.length === 0 && finalVrataKeys.length > 0) {
      activeCategory = "vratas";
    } else if (finalVrataKeys.length === 0 && finalPoojaKeys.length > 0) {
      activeCategory = "poojas";
    } else if (tabParam === "vrata" || tabParam === "vratas" || hasExplicitVratas) {
      activeCategory = "vratas";
    } else {
      activeCategory = "poojas";
    }

    const selectedItemKey = params.get("item") || tokenParsed?.it || undefined;
    const devoteeName = params.get("name") || params.get("devotee") || tokenParsed?.n || fallback.devoteeName;
    const devoteePhone = params.get("phone") || params.get("ph") || tokenParsed?.ph || undefined;
    const devoteeEmail = params.get("email") || params.get("em") || tokenParsed?.em || undefined;
    const gotra = params.get("gotra") || tokenParsed?.g || fallback.gotra;
    const lang = (params.get("lang") || tokenParsed?.l || fallback.lang) as SevaLang;
    const priestName = params.get("priest") || tokenParsed?.pr || fallback.priestName;

    return {
      poojaKeys: finalPoojaKeys,
      vrataKeys: finalVrataKeys,
      sankalpaKey,
      customGoal,
      activeCategory,
      selectedItemKey,
      devoteeName,
      devoteePhone,
      devoteeEmail,
      gotra,
      lang,
      priestName
    };
  } catch (err) {
    console.warn("[GuidedPoojaUrl] Error parsing guided pooja config from URL:", err);
    return fallback;
  }
}
