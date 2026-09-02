/**
 * Baggona Panchanga Smart User ID & Username Suggestion Engine
 * Provides deterministic + AI-enhanced intelligent username suggestions for Priests and Devotees.
 * Handles pure Kannada (ಕನ್ನಡ), Devanagari, Telugu, Tamil, and English name inputs.
 */

import { transliterateName } from "./transliterator";
import { askGemini } from "../core/GeminiEngine";

export interface UserIdSuggestion {
  id: string;
  category: "role" | "standard" | "sacred" | "dotted" | "compact" | "ai";
  label: string;
  icon: string;
}

/** Words to strip out when identifying root first & last names */
const TITLE_PREFIXES = new Set([
  "shree", "sri", "sree", "dr", "prof", "pt", "pandit", "shastri", "archak", "archaka",
  "purohit", "purohita", "bhat", "bhatt", "hegde", "joshi", "sharma", "swamy", "acharya"
]);

/** Transliterate and split any Indic or English name into clean Roman word tokens */
export function extractCleanNameTokens(rawName: string): string[] {
  if (!rawName || !rawName.trim()) return [];

  // Step 1: Transliterate to English if Indic script
  const englishName = transliterateName(rawName.trim(), "en");

  // Step 2: Clean punctuation, symbols, special chars
  const sanitized = englishName
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return [];

  const tokens = sanitized.split(" ").filter((t) => t.length > 0);
  return tokens;
}

/** Sanitize string for valid user ID format (lowercase alphanumeric + underscores/dots) */
export function sanitizeUserIdSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/[_.]{2,}/g, "_")
    .replace(/^[._]+|[._]+$/g, "")
    .slice(0, 30);
}

/**
 * Generate deterministic smart User ID suggestions based on name and role.
 * @param name Devotee or Priest full name in any language
 * @param role "priest" | "devotee" | "admin" | "user"
 */
export function generateSmartUserIdSuggestions(
  name: string,
  role: "priest" | "devotee" | "admin" | "user" = "priest"
): UserIdSuggestion[] {
  const tokens = extractCleanNameTokens(name);
  if (tokens.length === 0) return [];

  const suggestions: UserIdSuggestion[] = [];
  const seen = new Set<string>();

  const add = (id: string, category: UserIdSuggestion["category"], label: string, icon: string) => {
    const clean = sanitizeUserIdSlug(id);
    if (clean && clean.length >= 3 && !seen.has(clean)) {
      seen.add(clean);
      suggestions.push({ id: clean, category, label, icon });
    }
  };

  const primary = tokens[0];
  const secondary = tokens.length > 1 ? tokens[1] : "";
  const filteredTokens = tokens.filter((t) => !TITLE_PREFIXES.has(t));
  const mainToken = filteredTokens.length > 0 ? filteredTokens[0] : primary;
  const secondaryToken = filteredTokens.length > 1 ? filteredTokens[1] : secondary;

  const isPriest = role === "priest";

  // 1. Role-based Primary Suggestion
  if (isPriest) {
    add(`priest_${mainToken}`, "role", "ಪುರೋಹಿತ ಪ್ರಿಫಿಕ್ಸ್ (Priest Role)", "✨");
    if (secondaryToken) {
      add(`priest_${mainToken}_${secondaryToken}`, "role", "ಪುರೋಹಿತ ಪೂರ್ಣ ಹೆಸರು", "🛡️");
    }
    add(`pandit_${mainToken}`, "role", "ಪಂಡಿತ್ ಟೈಟಲ್", "👑");
  } else {
    add(`user_${mainToken}`, "role", "ಬಳಕೆದಾರ ID (User)", "👤");
    add(`devotee_${mainToken}`, "role", "ಭಕ್ತರ ID (Devotee)", "🙏");
  }

  // 2. Standard Combined Names (First_Last & Last_First)
  if (secondary) {
    add(`${primary}_${secondary}`, "standard", "ಹೆಸರು & ಉಪನಾಮ", "⭐");
    add(`${secondary}_${primary}`, "standard", "ಉಪನಾಮ & ಹೆಸರು", "🌟");
    add(`${primary}.${secondary}`, "dotted", "ಡಾಟ್ ಫಾರ್ಮ್ಯಾಟ್", "🌐");
    add(`${primary[0]}.${secondary}`, "dotted", "ಇನಿಷಿಯಲ್ & ಉಪನಾಮ", "🏷️");
    add(`${primary}_${secondary[0]}`, "standard", "ಹೆಸರು & ಇನಿಷಿಯಲ್", "🔖");
  } else {
    add(`${primary}`, "standard", "ಮೂಲ ಹೆಸರು", "⭐");
  }

  // 3. Sacred / Temple / Vedic Suffixes
  if (isPriest) {
    add(`${mainToken}_gokarna`, "sacred", "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ", "🛕");
    add(`${mainToken}_baggona`, "sacred", "ಬಗ್ಗೋಣ ಸನ್ನಿಧಿ", "🔱");
    add(`${mainToken}_vedic`, "sacred", "ವೈದಿಕ ಗುರುತು", "🕉️");
    add(`${mainToken}_jyotishya`, "sacred", "ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶಿ", "📜");
    add(`${mainToken}_purohit`, "sacred", "ವೇದ ಪುರೋಹಿತ", "🪔");
  } else {
    add(`${mainToken}_baggona`, "sacred", "ಬಗ್ಗೋಣ ಭಕ್ತರು", "🛕");
    add(`${mainToken}_gokarna`, "sacred", "ಗೋಕರ್ಣ ಸನ್ನಿಧಿ", "🕉️");
    add(`${mainToken}_vedic`, "sacred", "ವೈದಿಕ ಕುಟುಂಬ", "✨");
  }

  // 4. Compact / Numeric Handles
  add(`${mainToken}108`, "compact", "ಮಂಗಳ ಸಂಖ್ಯೆ 108", "🎲");
  add(`${mainToken}_108`, "compact", "ಪವಿತ್ರ 108", "🔢");
  add(`${mainToken}99`, "compact", "ಸುಲಭ ಸಂಖ್ಯೆ 99", "⚡");
  add(`${mainToken}${new Date().getFullYear()}`, "compact", "ಪ್ರಸ್ತುತ ವರ್ಷ", "📅");

  return suggestions;
}

/**
 * Enhanced Gemini GenAI User ID Suggestion Generator
 * Uses Gemini Flash Lite to generate ultra-smart, creative, context-aware suggestions.
 */
export async function suggestUserIdsWithAI(
  name: string,
  role: "priest" | "devotee" | "admin" | "user" = "priest",
  apiKey?: string
): Promise<UserIdSuggestion[]> {
  const deterministic = generateSmartUserIdSuggestions(name, role);
  if (!name.trim()) return deterministic;

  try {
    const prompt = `You are a system architect for Baggona Panchanga Vedic Astrology & Priest Portal.
Given the person's name "${name}" and role "${role}", generate 5 unique, clean, professional, and memorable username/user ID slugs (lowercase letters, numbers, underscores or dots only, between 4 to 20 characters).
For priests, incorporate traditional titles like priest, pandit, sharma, bhat, gokarna, vedic, baggona where relevant.
Return strictly a valid JSON array of strings only.
Example: ["priest_shreeram", "pandit_shreeram", "shreeram_gokarna", "shreeram.hegde", "shreeram_vedic"]`;

    const rawResponse = await askGemini(
      "Generate Smart User IDs",
      prompt,
      apiKey || "",
      "en",
      { raw: true, temperature: 0.3 }
    );

    // Extract JSON array
    const jsonMatch = rawResponse.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed: string[] = JSON.parse(jsonMatch[0]);
      const aiSuggestions: UserIdSuggestion[] = [];
      const seen = new Set(deterministic.map((d) => d.id));

      for (const item of parsed) {
        const clean = sanitizeUserIdSlug(item);
        if (clean && clean.length >= 3 && !seen.has(clean)) {
          seen.add(clean);
          aiSuggestions.push({
            id: clean,
            category: "ai",
            label: "AI ಸ್ಮಾರ್ಟ್ ಸಲಹೆ (GenAI)",
            icon: "🪄"
          });
        }
      }

      return [...aiSuggestions, ...deterministic];
    }
  } catch (err) {
    console.warn("[UserIdSuggestionEngine] AI suggestion fallback to deterministic:", err);
  }

  return deterministic;
}
