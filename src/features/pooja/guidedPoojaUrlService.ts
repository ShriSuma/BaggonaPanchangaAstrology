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
    poojaKeys: (config.poojaKeys && config.poojaKeys.length > 0)
      ? config.poojaKeys
      : [...GUIDED_POOJA_KEYS],
    vrataKeys: (config.vrataKeys && config.vrataKeys.length > 0)
      ? config.vrataKeys
      : [...GUIDED_VRATA_KEYS]
  };

  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://baggona.com");
  const params = new URLSearchParams();

  // Readable poojas parameter
  params.set("poojas", merged.poojaKeys.join(","));

  // Readable vratas parameter
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
    }

    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);

    // Check if encoded token exists
    const pToken = params.get("pToken") || params.get("poojaToken");
    if (pToken) {
      try {
        const decodedStr = fromBase64Url(pToken);
        const parsed = JSON.parse(decodedStr);
        if (parsed && typeof parsed === "object") {
          const tokenPoojaKeys = (parsed.p && Array.isArray(parsed.p))
            ? (parsed.p as GuidedPoojaKey[]).filter((k) => GUIDED_POOJA_KEYS.includes(k))
            : [];
          const tokenVrataKeys = (parsed.v && Array.isArray(parsed.v))
            ? (parsed.v as GuidedVrataKey[]).filter((k) => GUIDED_VRATA_KEYS.includes(k))
            : [];

          const resolvedSankalpa = (parsed.sk && parsed.sk in SANKALPA_PURPOSES)
            ? (parsed.sk as SankalpaPurposeKey)
            : fallback.sankalpaKey;

          return {
            poojaKeys: tokenPoojaKeys.length > 0 ? tokenPoojaKeys : [...GUIDED_POOJA_KEYS],
            vrataKeys: tokenVrataKeys.length > 0 ? tokenVrataKeys : [...GUIDED_VRATA_KEYS],
            sankalpaKey: resolvedSankalpa,
            customGoal: parsed.cg || params.get("goal") || undefined,
            activeCategory: parsed.cat === "vratas" ? "vratas" : "poojas",
            selectedItemKey: parsed.it || params.get("item") || undefined,
            devoteeName: parsed.n || params.get("name") || fallback.devoteeName,
            gotra: parsed.g || params.get("gotra") || fallback.gotra,
            lang: (parsed.l || params.get("lang") || fallback.lang) as SevaLang,
            priestName: parsed.pr || params.get("priest") || fallback.priestName
          };
        }
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
    }

    // Sankalpa purpose
    const sankalpaParam = (params.get("sankalpa") || params.get("purpose") || "kutumba").toLowerCase();
    const sankalpaKey: SankalpaPurposeKey = (sankalpaParam in SANKALPA_PURPOSES)
      ? (sankalpaParam as SankalpaPurposeKey)
      : (sankalpaParam.includes("marri") || sankalpaParam.includes("viva") ? "vivaha" : "kutumba");

    const customGoal = params.get("goal") || params.get("wish") || undefined;

    // Active Category (Tab)
    const tabParam = (params.get("tab") || params.get("category") || params.get("mode") || "").toLowerCase();
    const activeCategory = (tabParam === "vrata" || tabParam === "vratas" || params.has("vratas"))
      ? "vratas"
      : "poojas";

    const selectedItemKey = params.get("item") || undefined;
    const devoteeName = params.get("name") || params.get("devotee") || fallback.devoteeName;
    const gotra = params.get("gotra") || fallback.gotra;
    const lang = (params.get("lang") || fallback.lang) as SevaLang;
    const priestName = params.get("priest") || fallback.priestName;

    return {
      poojaKeys: resolvedPoojaKeys.length > 0 ? resolvedPoojaKeys : [...GUIDED_POOJA_KEYS],
      vrataKeys: resolvedVrataKeys.length > 0 ? resolvedVrataKeys : [...GUIDED_VRATA_KEYS],
      sankalpaKey,
      customGoal,
      activeCategory,
      selectedItemKey,
      devoteeName,
      gotra,
      lang,
      priestName
    };
  } catch (err) {
    console.warn("[GuidedPoojaUrl] Error parsing guided pooja config from URL:", err);
    return fallback;
  }
}
