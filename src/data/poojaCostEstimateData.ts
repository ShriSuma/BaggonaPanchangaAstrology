/**
 * Baggona Panchanga Astrology - Pooja Packages, Estimate, Samagri & Vidhana Data Engine.
 * 
 * Comprehensive Kannada catalog of authentic Vedic rituals (Pitru Karyas, Devata Homas, Combined Bundles),
 * with 3-tier pricing standards (Low ₹12,000, Medium ₹20,000, High ₹30,000), complete samagri lists
 * (Kalasha, Coconut, Ghee, Samittu, Prathima, etc.), homa dravyas, priest count, brahmana bhojana,
 * transparent rupee-by-rupee cost breakdown, persuasive high-tier justification, and life-shift benefits.
 */

export type PoojaTier = "low" | "medium" | "high";
export type PoojaDomain = "pitru" | "devata" | "combined";
export type SamagriSource = "devotee" | "priest";
export type SamagriGroup = "kalasha_coconut" | "homa_dravya" | "puja_articles" | "vastra_prathima" | "fruits_flowers" | "bhojana_dana";

export interface SamagriItem {
  id: string;
  nameKn: string;
  quantityKn: string;
  source: SamagriSource; // "devotee" (ಭಕ್ತರು ತರುವುದು) vs "priest" (ಪುರೋಹಿತರು ವ್ಯವಸ್ಥೆ ಮಾಡುವುದು)
  group: SamagriGroup;
  importanceKn: string; // e.g. "ಅತ್ಯಗತ್ಯ", "ವಿಶೇಷ", "ಪೂರ್ಣಾಹುತಿ"
  notesKn?: string;
}

export interface CostBreakdownItem {
  headKn: string;
  amount: number;
  descriptionKn: string;
}

export interface TierConfig {
  tier: PoojaTier;
  labelKn: string;
  badgeKn: string;
  taglineKn: string;
  basePrice: number;
  priestCount: number;
  priestTeamKn: string;
  japaCountKn: string;
  durationKn: string;
  kalashaCountKn: string;
  prathimaKn: string;
  homaDravyasKn: string[];
  brahmanaBhojanaKn: string;
  costBreakdown: CostBreakdownItem[];
  whyChooseThisTierKn: string;
  persuasiveAdvantageKn: string; // Why this tier is impactful
}

export interface PoojaEstimateItem {
  id: string;
  nameKn: string;
  subtitleKn: string;
  domain: PoojaDomain;
  icon: string;
  isPopular?: boolean;
  isCombined?: boolean;
  combinedComponentsKn?: string[];
  
  // Section 3: Why do this & expected life shifts
  whyNeedThisPoojaKn: string;
  shastraReferenceKn: string;
  rootCauseKn: string;
  expectedLifeShiftsKn: string[];
  
  // Section 2: Procedure & Havana details
  sacredProcedureSummaryKn: string;
  havanaSpecialtiesKn: string[];
  priestDutiesKn: string[];
  
  // High tier special persuasion (Why go with ₹30,000)
  whyHighTierGrandImpactKn: string;
  
  // Tier configurations (Low ₹12k, Medium ₹20k, High ₹30k)
  tiers: Record<PoojaTier, TierConfig>;
  
  // Section 1: Samagri list
  samagriList: SamagriItem[];
}

export const TIER_METADATA: Record<PoojaTier, {
  nameKn: string;
  englishLabel: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  priceTag: string;
  icon: string;
  descriptionKn: string;
}> = {
  low: {
    nameKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ (ಮಿತವ್ಯಯ)",
    englishLabel: "Low Standard",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
    borderClass: "border-amber-400/50",
    bgClass: "bg-amber-50/50 dark:bg-amber-950/20",
    priceTag: "₹12,000",
    icon: "🥉",
    descriptionKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಮೂಲ ವಿಧಿ, ಮಿತವ್ಯಯದಲ್ಲಿ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಲು ಸೂಕ್ತ."
  },
  medium: {
    nameKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ (ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ)",
    englishLabel: "Medium Standard",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200",
    borderClass: "border-blue-400/60 ring-2 ring-blue-500/20",
    bgClass: "bg-blue-50/50 dark:bg-blue-950/20",
    priceTag: "₹20,000",
    icon: "🥈",
    descriptionKn: "ಸಮಗ್ರ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಧಿ, 4 ವೇದಮೂರ್ತಿಗಳ ಮಂತ್ರ ಜಪ & ಪರಿಪೂರ್ಣ ಫಲ."
  },
  high: {
    nameKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ (ಭವ್ಯ ದಿವ್ಯ ವಿಧಿ)",
    englishLabel: "High Standard",
    badgeClass: "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border-amber-300 shadow-md",
    borderClass: "border-amber-500 ring-2 ring-amber-500/40 shadow-xl",
    bgClass: "bg-gradient-to-b from-amber-500/10 via-yellow-500/5 to-transparent",
    priceTag: "₹30,000",
    icon: "👑",
    descriptionKn: "ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪ, 7 ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ಸ್ವರ್ಣ-ರಜತ ಪ್ರತಿಮೆ & ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ."
  }
};

export const POOJA_ESTIMATE_CATALOG: PoojaEstimateItem[] = [
  // 1. ನಾರಾಯಣ ಬಲಿ (Narayana Bali)
  {
    id: "narayana_bali",
    nameKn: "ನಾರಾಯಣ ಬಲಿ (ಶ್ರೀಮನ್ನಾರಾಯಣ ಬಲಿ ವಿಧಿ)",
    subtitleKn: "ಅಕಾಲ ಮರಣ, ಅತೃಪ್ತ ಪಿತೃ ದೋಷ ನಿವಾರಣೆ & ವಂಶಾವಳಿ ಮುಕ್ತಿ",
    domain: "pitru",
    icon: "☘",
    isPopular: true,
    whyNeedThisPoojaKn: "ಕುಟುಂಬದಲ್ಲಿ ಅಕಾಲಿಕ ಸಾವು, ಅಪಮೃತ್ಯು, ಸರಿಯಾದ ಸಂಸ್ಕಾರ ಸಿಗದಿರುವುದು ಅಥವಾ ಪಿತೃಗಳ ಅತೃಪ್ತಿಯಿಂದ ಸಂತಾನ ತಡೆ, ವಿವಾಹ ವಿಳಂಬ, ತೀವ್ರ ಆರ್ಥಿಕ ನಷ್ಟ ಹಾಗೂ ಮನೆಯಲ್ಲಿ ನಿರಂತರ ಅಶಾಂತಿ ಉಂಟಾದಾಗ ನಾರಾಯಣ ಬಲಿ ಅತ್ಯಂತ ಅನಿವಾರ್ಯ. ಶ್ರೀಮನ್ನಾರಾಯಣನ ಸಾನ್ನಿಧ್ಯದಲ್ಲಿ ವಿಷ್ಣು ಪೂಜೆ ನಡೆಸಿ ಅತೃಪ್ತ ಆತ್ಮಗಳಿಗೆ ವೈಕುಂಠ ಪ್ರಾಪ್ತಿ ಕರುಣಿಸಲಾಗುತ್ತದೆ.",
    shastraReferenceKn: "ಗರುಡ ಪುರಾಣ & ಧರ್ಮಸಿಂಧು: 'ಅಕಾಲಮರಣೇ ಚೈವ ದುರ್ಮರಣೇ ತಥೈವ ಚ | ನಾರಾಯಣಬಲಿಂ ಕುರ್ಯಾತ್ ಸರ್ವಪಾಪಪ್ರಣಾಶಿನೀಮ್ ||'",
    rootCauseKn: "ಕುಟುಂಬದ ಪೂರ್ವಿಕರಲ್ಲಿ ಯಾರಾದರೂ ಅಪಮೃತ್ಯು ಹೊಂದಿದ್ದರೆ ಅಥವಾ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧಗಳು ಲೋಪವಾಗಿದ್ದರೆ ಉಂಟಾಗುವ ಪಿತೃ ಶಾಂತಿ ಲೋಪ.",
    expectedLifeShiftsKn: [
      "ಮನೆಯಲ್ಲಿ ಬಹುಕಾಲದಿಂದ ನೆಲೆಸಿದ್ದ ನಿಗೂಢ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ಭಯ ನಿವಾರಣೆಯಾಗಿ ದಿವ್ಯ ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ.",
      "ಸಂತಾನ ಭಾಗ್ಯಕ್ಕೆ ಅಡ್ಡಿಯಾಗಿದ್ದ ಕರ್ಮಬಂಧ ಮುಕ್ತವಾಗಿ ವಂಶಾಭಿವೃದ್ಧಿ ಆರಂಭವಾಗುತ್ತದೆ.",
      "ವಿವಾಹ ತಡೆಗಳು ತಕ್ಷಣವೇ ಶಮನವಾಗಿ ಯೋಗ್ಯ ಕಲ್ಯಾಣ ಸಂಬಂಧಗಳು ಕೂಡಿಬರುತ್ತವೆ.",
      "ವ್ಯಾಪಾರ-ವ್ಯವಹಾರಗಳಲ್ಲಿ ಇದ್ದ ಅನಿರೀಕ್ಷಿತ ಧನ ನಷ್ಟಗಳು ನಿಂತು ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಲಭಿಸುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ, ಪಂಚಕಲಶ ಸ್ಥಾಪನೆ, ಶ್ರೀಮನ್ನಾರಾಯಣ ಆರಾಧನೆ, ೧೬ ಪಿಂಡ ಪ್ರದಾನ, ರುದ್ರ-ವಿಷ್ಣು ತರ್ಪಣ, ನಾರಾಯಣ ಬಲಿ ಹೋಮ, ತಿಲ ಹವನ ಹಾಗೂ ಪೂರ್ಣಾಹುತಿ.",
    havanaSpecialtiesKn: [
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ಅಶ್ವತ್ಥ ಸಮಿತ್ತು",
      "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ) ಹಾಗೂ ಹಸುವಿನ ಶುದ್ಧ ತುಪ್ಪ (ಆಜ್ಯ)",
      "ವಿಷ್ಣು ಗಾಯತ್ರಿಯಿಂದ ಆಹುತಿ ನೀಡುವ ತುಪ್ಪದ ಪಾಯಸ",
      "ಪಂಚಗವ್ಯ ಹಾಗೂ ನವಧಾನ್ಯ ಆಹುತಿ"
    ],
    priestDutiesKn: [
      "ಪ್ರಧಾನ ಆಚಾರ್ಯರಿಂದ ಪಂಚಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ವಿಧಿ ನಿರ್ವಹಣೆ",
      "ಬ್ರಹ್ಮ ಸ್ಥಾನದಲ್ಲಿ ವೇದ ವಿದ್ವಾಂಸರಿಂದ ಮಂತ್ರ ರಕ್ಷಣೆ",
      "ಹೋತೃವಿನಿಂದ ಹವನ ಕುಂಡದಲ್ಲಿ ಅಖಂಡ ಅಗ್ನಿಮುಖ ಆಹುತಿ",
      "ಜಪಕರ್ತೃಗಳಿಂದ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಹಾಗೂ ನಾರಾಯಣ ಮಂತ್ರ ಜಪ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ 7 ಜನ ಶ್ರೋತ್ರೀಯ ವಿದ್ವಾಂಸರು ಸೇರಿ 10,000+ ನಾರಾಯಣ ಮಂತ್ರ ಜಪ, ಶುದ್ಧ ಬೆಳ್ಳಿ/ಚಿನ್ನದ ರೇಖಾ ಪ್ರತಿಮೆ ಸಮರ್ಪಣೆ, ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ 10 ಕೆಜಿ ತುಪ್ಪದ ಆಹುತಿ ಹಾಗೂ ರೇಷ್ಮೆ ಶಾಲು ಪೂರ್ಣಾಹುತಿ ಮಾಡುತ್ತಾರೆ. ಇದರಿಂದ ತಲೆಮಾರುಗಳ ಘೋರ ಪಿತೃ ಶಾಪಗಳು ಬೇರು ಸಹಿತ ಕರಗಿ ವಂಶಕ್ಕೆ ಅಜರಾಮರ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮಿತವ್ಯಯ ಶಾಸ್ತ್ರೋಕ್ತ",
        taglineKn: "ಮೂಲ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಧಿ, ಸೀಮಿತ ಬಜೆಟ್‌ನಲ್ಲಿ ಪರಿಪೂರ್ಣ ಸಂಕಲ್ಪ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು (ಪ್ರಧಾನ ಆಚಾರ್ಯ + ಸಹಾಯಕ ಪುರೋಹಿತ)",
        japaCountKn: "೧,೦೦೮ ನಾರಾಯಣ ಮೂಲ ಮಂತ್ರ ಜಪ",
        durationKn: "ಸುಮಾರು ೩ ರಿಂದ ೪ ಗಂಟೆ",
        kalashaCountKn: "೧ ಪ್ರಧಾನ ಕಲಶ + ೪ ಉಪ ಕಲಶಗಳು",
        prathimaKn: "ತಾಮ್ರದ ವಿಷ್ಣು ಪ್ರತಿಮೆ & ನಾರಿಕೇಲ ಸ್ಥಾಪನೆ",
        homaDravyasKn: ["೨.೫ ಕೆಜಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", "ಕಪ್ಪು ಎಳ್ಳು ೧ ಕೆಜಿ", "ಪಲಾಶ ಸಮಿತ್ತು", "ಪಾಯಸ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ-ತಾಂಬೂಲ",
        whyChooseThisTierKn: "ಮಿತವ್ಯಯದಲ್ಲಿ ಶಾಸ್ತ್ರದ ಕಡ್ಡಾಯ ವಿಧಿಯನ್ನು ಲೋಪವಿಲ್ಲದೆ ಪೂರೈಸಲು ಇದು ಅತ್ಯಂತ ಅನುಕೂಲಕರ ಆಯ್ಕೆ.",
        persuasiveAdvantageKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲೂ ಗರುಡ ಪುರಾಣದ ಮೂಲ ಮಂತ್ರಗಳು ಹಾಗೂ ೧೬ ಪಿಂಡಗಳ ವಿಧಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಪೂಜಾ ಸಾಮಗ್ರಿ, ಸಮಿತ್ತು & ಎಳ್ಳು", amount: 3500, descriptionKn: "ಕಲಶ, ತೆಂಗಿನಕಾಯಿ, ತುಪ್ಪ ೨.೫ ಕೆಜಿ, ತಿಲ, ನವಧಾನ್ಯ, ದರ್ಭೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ಪುರೋಹಿತರ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ಉಪಚಾರ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ಹಾಗೂ ತಾಂಬೂಲ ದಕ್ಷಿಣೆ" },
          { headKn: "ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ & ಮಂಟಪ ವ್ಯವಸ್ಥೆ", amount: 2000, descriptionKn: "ಹೋಮ ಕುಂಡ ಸಿದ್ಧತೆ, ರಂಗೋಲಿ, ಸೌದೆ, ದೀಪಾರಾಧನೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ಮಂತ್ರ ಘೋಷ, ಸಮಗ್ರ ಶಾಸ್ತ್ರೋಕ್ತ ಪಿತೃ ಮುಕ್ತಿ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು (ಆಚಾರ್ಯ, ಬ್ರಹ್ಮ, ಹೋತೃ, ಜಪಕರ್ತೃ)",
        japaCountKn: "೫,೦೦೦ ನಾರಾಯಣ ಮಂತ್ರ ಜಪ & ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸಂಪೂರ್ಣ ಪಾರಾಯಣ",
        durationKn: "ಸುಮಾರು ೫ ರಿಂದ ೬ ಗಂಟೆ",
        kalashaCountKn: "೩ ಪ್ರಧಾನ ಕಲಶಗಳು (ವಿಷ್ಣು, ರುದ್ರ, ಬ್ರಹ್ಮ) + ನವಗ್ರಹ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ವಿಷ್ಣು ಪ್ರತಿಮೆ & ದರ್ಭೆಯ ಪ್ರತಿಮೆಗಳು",
        homaDravyasKn: ["೫ ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ಶುದ್ಧ ತುಪ್ಪ", "ಕಪ್ಪು ಎಳ್ಳು ೨.೫ ಕೆಜಿ", "ಪಲಾಶ & ಅಶ್ವತ್ಥ ಸಮಿತ್ತುಗಳು", "ಕೇಸರಿ-ತುಪ್ಪದ ಪಾಯಸ", "ಅಷ್ಟದ್ರವ್ಯಗಳು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರಿಗೆ ಹಾಗೂ ಹೆಚ್ಚುವರಿ ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ವಸ್ತ್ರದಾನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ನಾಲ್ವರು ಋತ್ವಿಜರ ಸಂಘಟಿತ ಮಂತ್ರೋಚ್ಛಾರಣೆಯಿಂದ ಪಿತೃಗಳಿಗೆ ತಕ್ಷಣ ಮುಕ್ತಿ ಸಿಗುತ್ತದೆ. ಕುಟುಂಬಕ್ಕೆ ದೀರ್ಘಕಾಲಿಕ ಸುಖ-ಶಾಂತಿ.",
        persuasiveAdvantageKn: "ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನ, ಅಷ್ಟದ್ರವ್ಯ ಹವಿಸ್ಸು ಹಾಗೂ ೫,೦೦೦ ಜಪಗಳಿಂದ ದೋಷ ನಿವಾರಣೆ ತ್ವರಿತವಾಗಿ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ಅಷ್ಟದ್ರವ್ಯ & ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ, ತುಪ್ಪ ೫ ಕೆಜಿ, ಕೇಸರಿ, ತಿಲ, ಕಲಶಗಳು, ರೇಷ್ಮೆ ಬಟ್ಟೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರಿಗೆ ಗೌರವಯುತ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ, ವಸ್ತ್ರ & ದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ & ಪೂಜಾ ಮಂಟಪ", amount: 2500, descriptionKn: "ಭವ್ಯ ಮಂಡಲ ರಚನೆ, ಹೂವು, ಹಣ್ಣು, ಕುಂಡ ಸೌದೆ & ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪ (ಪೂರ್ಣ ಮುಕ್ತಿ)",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ವೇದ ಘೋಷ, ಸುವರ್ಣ-ರಜತ ದಾನ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು (ಆಚಾರ್ಯ, ಬ್ರಹ್ಮ, ಋಗ್ವೇದ, ಯಜುರ್ವೇದ, ಸಾಮವೇದ ಪಾರಾಯಣಕರ್ತೃಗಳು)",
        japaCountKn: "೧೦,೦೦೦+ ನಾರಾಯಣ ಸಂಪುಟ ಜಪ, ಪುರುಷ ಸೂಕ್ತ & ನಾರಾಯಣ ಸೂಕ್ತ ಅಖಂಡ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಕರ್ಮ (೬ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೯ ಮಹಾ ಕಲಶಗಳು (ನವಗ್ರಹ ಸಂಪುಟ + ತ್ರಿಮೂರ್ತಿ ಕಲಶಗಳು)",
        prathimaKn: "ಶುದ್ಧ ಸುವರ್ಣ-ರಜತ (ಬಂಗಾರ-ಬೆಳ್ಳಿ) ಪ್ರತಿಮೆ ದಾನ & ಗೋಪೂಜೆ ಸಂಕಲ್ಪ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "೫ ಕೆಜಿ ತಿಲ", "ಅಪರೂಪದ ಅಷ್ಟಗಂಧ, ಕಸ್ತೂರಿ, ರಕ್ತಚಂದನ", "ರೇಷ್ಮೆ ಶಾಲು ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ ಸಮರ್ಪಣೆ"],
        brahmanaBhojanaKn: "೭ ವೇದ ವಿದ್ವಾಂಸರು + ಇತರ ಬ್ರಾಹ್ಮಣರಿಗೆ (ಒಟ್ಟು ೧೦+ ಜನರಿಗೆ) ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ಕಠಿಣ, ಬಹುಕಾಲದ ಪಿತೃ ಶಾಪಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿರ್ನಾಮ ಮಾಡಲು ಇದು ಸರ್ವೋತ್ಕೃಷ್ಟ ದಿವ್ಯ ವಿಧಿ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ಸಾಮುದಾಯಿಕ ಮಂತ್ರಶಕ್ತಿ, ೧೦,೦೦೦ ಜಪ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಚಿನ್ನ/ಬೆಳ್ಳಿ ದಾನದಿಂದ ವಂಶಕ್ಕೆ ಸಪ್ತ ತಲೆಮಾರುಗಳ ರಕ್ಷಣೆ ದೊರೆಯುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ಅಪರೂಪದ ಹವಿಸ್ಸು", amount: 11000, descriptionKn: "ಸ್ವರ್ಣ-ರಜತ ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಕಸ್ತೂರಿ, ಕೇಸರಿ, ಶ್ರೀಫಲ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ & ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ, ವಸ್ತ್ರದಾನ & ಗೋ ಸಂಕಲ್ಪ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ, ಉತ್ತರೀಯ & ಗೋಪೂಜೆ ವ್ಯಯ" },
          { headKn: "ಭವ್ಯ ಮಂಡಲ, ಪುಷ್ಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಪುಷ್ಪ ಮಂಟಪ, ೯ ಕಲಶ ಅಲಂಕಾರ, ದೀಪಾರಾಧನೆ & ಪವಿತ್ರ ಕ್ಷೇತ್ರ ಸೇವೆ" }
        ]
      }
    },
    samagriList: [
      { id: "s1", nameKn: "ಕಲಶ ಚೊಂಬುಗಳು (ತಾಮ್ರ/ಹಿತ್ತಾಳೆ)", quantityKn: "೧ ರಿಂದ ೯ ಸಂಖ್ಯೆ (ಶ್ರೇಣಿಗೆ ತಕ್ಕಂತೆ)", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s2", nameKn: "ಶ್ರೀಫಲ (ನೀರುಳ್ಳ ಗಟ್ಟಿ ತೆಂಗಿನಕಾಯಿಗಳು)", quantityKn: "೮ ರಿಂದ ೧೫ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s3", nameKn: "ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨.೫ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ ವರೆಗೆ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "s4", nameKn: "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ)", quantityKn: "೧ ಕೆಜಿ ಯಿಂದ ೫ ಕೆಜಿ ವರೆಗೆ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s5", nameKn: "ಪಲಾಶ ಹಾಗೂ ಅಶ್ವತ್ಥ ಸಮಿತ್ತುಗಳು", quantityKn: "೩ ರಿಂದ ೭ ಕಟ್ಟುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s6", nameKn: "ದರ್ಭೆ (ಪವಿತ್ರ ಕುಶ ಹುಲ್ಲು)", quantityKn: "೧ ದೊಡ್ಡ ಕಟ್ಟು", source: "priest", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s7", nameKn: "ನವಧಾನ್ಯಗಳು", quantityKn: "೧ ಸೆಟ್ (೯ ಬಗೆಯ ಧಾನ್ಯ)", source: "priest", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s8", nameKn: "ಪಂಚಾಮೃತ (ಹಾಲು, ಮೊಸರು, ತುಪ್ಪ, ಜೇನುತುಪ್ಪ, ಸಕ್ಕರೆ)", quantityKn: "ಪ್ರತಿಯೊಂದೂ ಅರ್ಧ ಲೀಟರ್", source: "devotee", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s9", nameKn: "ವಿಷ್ಣು ಪ್ರತಿಮೆ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಪ್ರತಿಮೆ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "s10", nameKn: "ಬಿಳಿ ಹಾಗೂ ಹಳದಿ ಧೋತಿ, ಶಾಲು", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "s11", nameKn: "ಪೂರ್ಣಾಹುತಿ ರೇಷ್ಮೆ ವಸ್ತ್ರ (ಕೆಂಪು/ಹಳದಿ)", quantityKn: "೧ ಮೀಟರ್ ರೇಷ್ಮೆ ಶಾಲು", source: "priest", group: "vastra_prathima", importanceKn: "ಪೂರ್ಣಾಹುತಿ" },
      { id: "s12", nameKn: "ಹೂವು, ತುಳಸಿ ಮಾಲೆ & ಹಣ್ಣುಗಳು", quantityKn: "೫ ಬಗೆಯ ಹಣ್ಣು, ತುಳಸಿ ಮಾಲೆ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s13", nameKn: "ವೀಳ್ಯದೆಲೆ, ಅಡಿಕೆ (ತಾಂಬೂಲ)", quantityKn: "೫೦ ವೀಳ್ಯದೆಲೆ, ೨೫ ಅಡಿಕೆ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "s14", nameKn: "ಅಕ್ಕಿ (ಅಕ್ಷತೆ & ಪಿಂಡ ದ್ರವ್ಯಕ್ಕೆ)", quantityKn: "೫ ಕೆಜಿ ಯಿಂದ ೧೫ ಕೆಜಿ", source: "devotee", group: "bhojana_dana", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 2. ಪ್ರೇತೋದ್ಧಾರ (Preta Uddhara)
  {
    id: "pretoddhara",
    nameKn: "ಪ್ರೇತೋದ್ಧಾರ ಶಾಂತಿ (ಅತೃಪ್ತ ಪ್ರೇತ ವಿಮೋಚನೆ)",
    subtitleKn: "ಅತೃಪ್ತ ಆತ್ಮಗಳಿಗೆ ಮುಕ್ತಿ, ದುಃಸ್ವಪ್ನ-ಭಯ ನಿವಾರಣೆ & ವಂಶ ರಕ್ಷಣೆ",
    domain: "pitru",
    icon: "🪔",
    isPopular: true,
    whyNeedThisPoojaKn: "ಅಕಾಲಿಕ ಸಾವು, ಅಪಘಾತ, ಆತ್ಮಹತ್ಯೆ, ನೀರಿನಲ್ಲಿ ಮುಳುಗಿ ಸಾವು ಅಥವಾ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ನರಳಿದ ಆತ್ಮಗಳು ಪ್ರೇತಾವಸ್ಥೆಯಲ್ಲಿ ಸಿಲುಕಿದಾಗ ಕುಟುಂಬದವರಿಗೆ ದುಃಸ್ವಪ್ನಗಳು, ರಾತ್ರಿ ಬೆಚ್ಚಿಬೀಳುವುದು, ಮನೆಯಲ್ಲಿ ನಿಗೂಢ ತೊಂದರೆ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ ಸ್ಥಗಿತವಾಗುತ್ತದೆ. ಪ್ರೇತೋದ್ಧಾರ ವಿಧಿಯಿಂದ ಆ ಜೀವಿಗೆ ಪ್ರೇತತ್ವ ಮುಕ್ತಿ ಸಿಕ್ಕು ಸದ್ಗತಿ ದೊರೆಯುತ್ತದೆ.",
    shastraReferenceKn: "ಧರ್ಮಸಿಂಧು: 'ಪ್ರೇತರೂಪೇಣ ಯಸ್ತಿಷ್ಠೇತ್ ತಸ್ಯ ಮೋಕ್ಷಾರ್ಥಮೇವ ಚ | ಪ್ರೇತೋದ್ಧಾರಪ್ರಭಾವೇನ ಮುಕ್ತಿಂ ಯಾತಿ ನ ಸಂಶಯಃ ||'",
    rootCauseKn: "ಅತೃಪ್ತ ಬಯಕೆಗಳೊಂದಿಗೆ ದೇಹ ತ್ಯಜಿಸಿದ ಆತ್ಮಗಳು ಪ್ರೇತ ಯೋನಿಯಲ್ಲಿ ಉಳಿದು ವಂಶಸ್ಥರನ್ನು ಪೀಡಿಸುವುದು.",
    expectedLifeShiftsKn: [
      "ರಾತ್ರಿ ವೇಳೆ ಕಾಣುವ ಕೆಟ್ಟ ಕನಸುಗಳು, ಭಯ ಹಾಗೂ ಮನೆಯ ಅಶಾಂತಿ ತಕ್ಷಣವೇ ಶಮನವಾಗುತ್ತದೆ.",
      "ಮಕ್ಕಳಿಗೆ ಕಾಡುವ ಅಪಶಕುನಗಳು, ಕಾರಣವಿಲ್ಲದ ಅನಾರೋಗ್ಯ ದೂರವಾಗಿ ಚೈತನ್ಯ ಬರುತ್ತದೆ.",
      "ಕುಟುಂಬದ ಸದಸ್ಯರ ನಡುವೆ ನೆಮ್ಮದಿ ಮತ್ತು ಪ್ರೇಮಭಾವ ಮರುಕಳಿಸುತ್ತದೆ.",
      "ಮನೆಯಲ್ಲಿ ನಿಂತುಹೋಗಿದ್ದ ಶುಭ ಕಾರ್ಯಗಳು ಯಾವುದೇ ಅಡೆತಡೆ ಇಲ್ಲದೆ ಸಂಪನ್ನಗೊಳ್ಳುತ್ತವೆ."
    ],
    sacredProcedureSummaryKn: "ಪ್ರಾಯಶ್ಚಿತ್ತ, ಸಂಕಲ್ಪ, ಪಂಚಬಲಿ ಪ್ರದಾನ, ರುದ್ರ ಕಲಶ ಸ್ಥಾಪನೆ, ಪ್ರೇತೋದ್ಧಾರ ಮಂತ್ರ ಜಪ, ತಿಲ-ಆಜ್ಯ ಹವನ, ಪಿಂಡ ತರ್ಪಣ ಹಾಗೂ ಮಹಾ ಬ್ರಾಹ್ಮಣ ಭೋಜನ.",
    havanaSpecialtiesKn: [
      "ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ದರ್ಭೆ ಸಮಿತ್ತು",
      "ಯಮ-ರುದ್ರ ಶಾಂತಿ ಹವಿಸ್ಸು",
      "ವಿಷ್ಣು ಪಾದೋದಕ ಸಮರ್ಪಣೆ"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ಪ್ರೇತ ಮುಕ್ತಿ ಸಂಕಲ್ಪ ಹಾಗೂ ರುದ್ರ ಪಾರಾಯಣ",
      "ಹೋತೃವಿನಿಂದ ಅಗ್ನಿಮುಖದಲ್ಲಿ ತಿಲ ಹೋಮ ಆಹುತಿ",
      "ಶಾಂತಿ ಪಾಠ ಹಾಗೂ ರಕ್ಷಾ ಕವಚ ಬಂಧನ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೭ ಪುರೋಹಿತರು ಅಹೋರಾತ್ರಿ ಪ್ರೇತೋದ್ಧಾರ ಸೂಕ್ತಗಳನ್ನು ಪಠಿಸುತ್ತಾರೆ, ಬೆಳ್ಳಿಯ ಯಮ-ವಿಷ್ಣು ಪ್ರತಿಮೆ ದಾನ ಮಾಡಲಾಗುತ್ತದೆ, ೧೦ ಕೆಜಿ ತುಪ್ಪದ ಹವನ ಹಾಗೂ ೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ನೀಡಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಅತ್ಯಂತ ತೀವ್ರವಾದ ಪ್ರೇತ ಬಾಧೆಗಳೂ ಸಂಪೂರ್ಣ ನಾಶವಾಗಿ ಮನೆಗೆ ದೈವೀ ಕವಚ ದೊರೆಯುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮಿತವ್ಯಯ ವಿಧಿ",
        taglineKn: "ಮೂಲ ಪ್ರೇತ ವಿಮೋಚನಾ ಶಾಂತಿ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ಪಂಡಿತರು",
        japaCountKn: "೧,೦೦೮ ಪ್ರೇತ ಮುಕ್ತಿ ಮಂತ್ರ ಜಪ",
        durationKn: "೩ ರಿಂದ ೪ ಗಂಟೆ",
        kalashaCountKn: "೨ ಕಲಶಗಳು (ರುದ್ರ & ವಿಷ್ಣು)",
        prathimaKn: "ತಾಮ್ರದ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೨.೫ ಕೆಜಿ ತುಪ್ಪ", "ತಿಲ ೧.೫ ಕೆಜಿ", "ಪಲಾಶ ಸಮಿತ್ತು"],
        brahmanaBhojanaKn: "೨ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಪ್ರೇತತ್ವ ನಿವಾರಣೆಯ ಮೂಲ ವಿಧಿಯನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ನೆರವೇರಿಸಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಕಡ್ಡಾಯವಾದ ತಿಲ ಹೋಮ ಹಾಗೂ ಪಿಂಡ ಪ್ರದಾನ ವಿಧಿ ಲೋಪವಿಲ್ಲದೆ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ತಿಲ & ತುಪ್ಪ", amount: 3500, descriptionKn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಕಲಶ, ದರ್ಭೆ, ನವಧಾನ್ಯ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ಪುರೋಹಿತರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ವಿದ್ವಾಂಸರ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ & ಕ್ಷೇತ್ರ ಸಿದ್ಧತೆ", amount: 2000, descriptionKn: "ಹೋಮ ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಪೂರ್ಣ",
        taglineKn: "೪ ಋತ್ವಿಜರ ಸಂಘಟಿತ ಪ್ರೇತ ಶಾಂತಿ & ರುದ್ರ ಜಪ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೫,೦೦೦ ಮಂತ್ರ ಜಪ & ರುದ್ರ ನಮಕ-ಚಮಕ ಪಾರಾಯಣ",
        durationKn: "೫ ರಿಂದ ೬ ಗಂಟೆ",
        kalashaCountKn: "೪ ಕಲಶಗಳು (ರುದ್ರ, ಯಮ, ವಿಷ್ಣು, ಕಾಲ)",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೫ ಕೆಜಿ ದೇಸಿ ತುಪ್ಪ", "೩ ಕೆಜಿ ತಿಲ", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ಪಾಯಸ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಪೂರ್ಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "ರುದ್ರ ಜಪ ಮತ್ತು ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನದಿಂದ ಅತೃಪ್ತ ಆತ್ಮಕ್ಕೆ ತಕ್ಷಣವೇ ವೈಕುಂಠ ಲೋಕ ಲಭಿಸುತ್ತದೆ.",
        persuasiveAdvantageKn: "೪ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಶಕ್ತಿಯಿಂದ ಮನೆಯಲ್ಲಿ ನೆಲೆಸಿದ್ದ ನಿಗೂಢ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಬೇರು ಸಹಿತ ನಾಶವಾಗುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ಹವಿಸ್ಸು", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ೫ ಕೆಜಿ ತುಪ್ಪ, ತಿಲ, ಕಲಶಗಳು, ವಸ್ತ್ರ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ಪುರೋಹಿತರು)", amount: 8000, descriptionKn: "೪ ವಿದ್ವಾಂಸರಿಗೆ ಗೌರವಯುತ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಭೋಜನ, ವಸ್ತ್ರ & ದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ & ಮಂಟಪ", amount: 2500, descriptionKn: "ಮಂಡಲ ರಚನೆ, ಹೂವು, ಹಣ್ಣು, ದೀಪಾರಾಧನೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ಮಹಾ ವಿಮೋಚನೆ",
        taglineKn: "೭ ವಿದ್ವಾಂಸರ ಅಖಂಡ ಶಾಂತಿ, ಸುವರ್ಣ ದಾನ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೦,೦೦೦+ ಮಂತ್ರ ಜಪ & ಮಹಾ ರುದ್ರ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನ (೬ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೮ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸುವರ್ಣ-ರಜತ ಪ್ರತಿಮೆ ದಾನ & ಮಹಾ ಗೋಪೂಜೆ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", "೫ ಕೆಜಿ ತಿಲ", "ಕಸ್ತೂರಿ, ಕೇಸರಿ, ರಕ್ತಚಂದನ", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ಹಳೆಯ, ಕ್ಲಿಷ್ಟಕರವಾದ ಪ್ರೇತ ಬಾಧೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿರ್ಮೂಲನಗೊಳಿಸಲು ಏಕೈಕ ದಿವ್ಯ ಮಾರ್ಗ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ೧೦,೦೦೦ ಜಪಗಳು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಮನೆಗೆ ಸಕಲ ದೇವತೆಗಳ ಅಭಯ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ಅಪರೂಪದ ದ್ರವ್ಯ", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಕಸ್ತೂರಿ, ಕೇಸರಿ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಮಂಡಲ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "p1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ)", quantityKn: "೨ ರಿಂದ ೮ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "p2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೮ ರಿಂದ ೧೫ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "p3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨.೫ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "p4", nameKn: "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ)", quantityKn: "೧.೫ ಕೆಜಿ ಯಿಂದ ೫ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "p5", nameKn: "ಪಲಾಶ ಸಮಿತ್ತು", quantityKn: "೩ ರಿಂದ ೫ ಕಟ್ಟುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "p6", nameKn: "ಪ್ರೇತೋದ್ಧಾರ ಪ್ರತಿಮೆ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಪ್ರತಿಮೆ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "p7", nameKn: "ಬಿಳಿ ವಸ್ತ್ರಗಳು & ಉತ್ತರೀಯ", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "p8", nameKn: "ಪಂಚಾಮೃತ ದ್ರವ್ಯಗಳು", quantityKn: "ಪ್ರತಿಯೊಂದೂ ಅರ್ಧ ಲೀಟರ್", source: "devotee", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "p9", nameKn: "ಅಕ್ಕಿ, ಹೂವು, ಹಣ್ಣು, ತಾಂಬೂಲ", quantityKn: "೫ ಕೆಜಿ ಅಕ್ಕಿ, ೫ ಹಣ್ಣು, ವೀಳ್ಯದೆಲೆ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 3. ನಾರಾಯಣ ಬಲಿ + ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಪ್ರೇತೋದ್ಧಾರ (ಸಂಯುಕ್ತ ಪಿತೃ ಮಹಾ ಮುಕ್ತಿ ಸಂಪುಟ)
  {
    id: "narayana_bali_tripindi_pretoddhara",
    nameKn: "ನಾರಾಯಣ ಬಲಿ + ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ + ಪ್ರೇತೋದ್ಧಾರ (ಮಹಾ ಸಂಪುಟ)",
    subtitleKn: "ಮೂರು ತಲೆಮಾರುಗಳ ಸಮಗ್ರ ಪಿತೃ ಋಣ ಮುಕ್ತಿ, ಅಕಾಲ ಮರಣ ಶಾಂತಿ & ವಂಶ ರಕ್ಷಣೆ",
    domain: "combined",
    icon: "🔱",
    isPopular: true,
    isCombined: true,
    combinedComponentsKn: [
      "ಶ್ರೀಮನ್ನಾರಾಯಣ ಬಲಿ ವಿಧಿ",
      "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ (ಮೂರು ತಲೆಮಾರುಗಳ ಪಿಂಡ ಪ್ರದಾನ)",
      "ಪ್ರೇತೋದ್ಧಾರ ಶಾಂತಿ ಹೋಮ"
    ],
    whyNeedThisPoojaKn: "ಇದು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ, ಸರ್ವತೋಮುಖ ಪಿತೃ ಪರಿಹಾರ ವಿಧಿ. ಮೂರು ತಲೆಮಾರುಗಳ ಶ್ರಾದ್ಧ ಲೋಪ, ಕುಟುಂಬದಲ್ಲಿ ಸಂಭವಿಸಿದ ಅಕಾಲ ಮರಣಗಳು ಹಾಗೂ ಅತೃಪ್ತ ಪ್ರೇತ ಬಾಧೆಗಳು ಒಟ್ಟಿಗೆ ಸೇರಿದಾಗ ಈ ತ್ರಿಪುಟ ಶಾಂತಿ ಅನಿವಾರ್ಯ. ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರಗಳನ್ನು ಒಂದೇ ಮಂಟಪದಲ್ಲಿ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃ ಲೋಕದ ಸಕಲ ಋಣಗಳು ಸಂಪೂರ್ಣ ತೀರಿ, ವಂಶಕ್ಕೆ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ.",
    shastraReferenceKn: "ನಿರ್ಣಯಸಿಂಧು & ಧರ್ಮಸಿಂಧು: 'ತ್ರಿಪಿಂಡೀಂ ಚ ನಾರಾಯಣಬಲಿಂ ತಥಾ | ಪ್ರೇತೋದ್ಧಾರಂ ಸದಾ ಕುರ್ಯಾತ್ ಪಿತೃಣಾಂ ಮುಕ್ತಿಕಾಂಕ್ಷಿಣಾಮ್ ||'",
    rootCauseKn: "ತಲೆಮಾರುಗಳಿಂದ ನಡೆದುಕೊಂಡು ಬಂದಿರುವ ಬಹುಮುಖ ಪಿತೃ ದೋಷ, ಶ್ರಾದ್ಧ ಕರ್ಮ ಲೋಪ ಹಾಗೂ ಅತೃಪ್ತ ಆತ್ಮಗಳ ಶಾಪ.",
    expectedLifeShiftsKn: [
      "ಕುಟುಂಬದಲ್ಲಿ ಅನೇಕ ವರ್ಷಗಳಿಂದ ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಶೀಘ್ರವೇ ನೆರವೇರುತ್ತದೆ.",
      "ವಿವಾಹದಲ್ಲಿ ಪದೇ ಪದೇ ಬರುತ್ತಿದ್ದ ನಿಗೂಢ ಅಡೆತಡೆಗಳು ಸಂಪೂರ್ಣ ಪರಿಹಾರವಾಗುತ್ತವೆ.",
      "ಮನೆಯಲ್ಲಿ ನಿರಂತರವಾಗಿ ಕಾಡುತ್ತಿದ್ದ ಅನಾರೋಗ್ಯ ಹಾಗೂ ಅಕಾಲಿಕ ಆಸ್ಪತ್ರೆ ಖರ್ಚುಗಳು ನಿಲ್ಲುತ್ತವೆ.",
      "ಆರ್ಥಿಕ ದಿವಾಳಿತನ, ಸಾಲದ ಹೊರೆ ನಿವಾರಣೆಯಾಗಿ ಹೊಸ ಆದಾಯದ ಮೂಲಗಳು ತೆರೆದುಕೊಳ್ಳುತ್ತವೆ.",
      "ಪಿತೃ ದೇವತೆಗಳ ಪೂರ್ಣ ಕೃಪೆಯಿಂದ ಮನೆಯ ಮಕ್ಕಳಿಗೆ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಉದ್ಯೋಗದಲ್ಲಿ ಅದ್ಭುತ ಪ್ರಗತಿ ಲಭಿಸುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ, ತ್ರಿಪಿಂಡಿ ಸ್ಥಾಪನೆ (ಸಾತ್ತ್ವಿಕ, ರಾಜಸ, ತಾಮಸ ಪಿಂಡಗಳು), ಪಂಚಕಲಶ ಆರಾಧನೆ, ನಾರಾಯಣ ಬಲಿ ವಿಧಿ, ಪ್ರೇತೋದ್ಧಾರ ಹೋಮ, ತಿಲ-ಆಜ್ಯ ಹವನ, ವಿಷ್ಣು ಪಾದೋದಕ ತರ್ಪಣ ಹಾಗೂ ಬೃಹತ್ ಬ್ರಾಹ್ಮಣ ಭೋಜನ.",
    havanaSpecialtiesKn: [
      "ಅಶ್ವತ್ಥ, ಪಲಾಶ, ಔದುಂಬರ ಸಮಿತ್ತುಗಳು",
      "ಕಪ್ಪು ಎಳ್ಳು, ಶುದ್ಧ ದೇಸಿ ತುಪ್ಪ ಹಾಗೂ ಕ್ಷೀರ ಪಾಯಸ",
      "ಅಷ್ಟದ್ರವ್ಯ ಹವಿಸ್ಸು & ನವಧಾನ್ಯ ಆಹುತಿ",
      "ಪೂರ್ಣಾಹುತಿಗೆ ರೇಷ್ಮೆ ವಸ್ತ್ರ & ಶ್ರೀಫಲ"
    ],
    priestDutiesKn: [
      "ಪ್ರಧಾನ ಆಚಾರ್ಯರಿಂದ ತ್ರಿಪುಟ ಸಂಕಲ್ಪ ಹಾಗೂ ಸೂಕ್ತ ಪಾರಾಯಣ",
      "ಬ್ರಹ್ಮ ಸ್ಥಾನದಲ್ಲಿ ವೇದ ವಿದ್ವಾಂಸರಿಂದ ತ್ರಿಪಿಂಡಿ ವಿಧಿ ರಕ್ಷಣೆ",
      "ಹೋತೃವಿನಿಂದ ಅಗ್ನಿಮುಖದಲ್ಲಿ ಅಖಂಡ ತಿಲ ಹಾಗೂ ಆಜ್ಯ ಆಹುತಿ",
      "ಋಗ್ವೇದ & ಯಜುರ್ವೇದ ವಿದ್ವಾಂಸರಿಂದ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಶಾಂತಿ ಮಂತ್ರ ಪಠಣ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು ಇಡೀ ದಿನ ಕುಳಿತು ೧೨,೦೦೦+ ಮಂತ್ರ ಜಪಗಳನ್ನು ಮಾಡುತ್ತಾರೆ. ಶುದ್ಧ ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಮೂರು ಪ್ರತಿಮೆಗಳ (ವಿಷ್ಣು, ಬ್ರಹ್ಮ, ರುದ್ರ) ಸಮರ್ಪಣೆ, ೧೨ ಕೆಜಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ಆಹುತಿ ಹಾಗೂ ೧೨+ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ನೀಡಲಾಗುತ್ತದೆ. ಮೂರು ತಲೆಮಾರುಗಳ ಸಕಲ ಪಾಪಗಳು ಕರಗಿ ವಂಶಕ್ಕೆ ದೈವೀ ಶ್ರೀರಕ್ಷೆ ಲಭಿಸುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮಿತವ್ಯಯ ಸಂಯುಕ್ತ ವಿಧಿ",
        taglineKn: "ಮೂಲ ತ್ರಿಪುಟ ಪಿತೃ ಮುಕ್ತಿ ಶಾಂತಿ",
        basePrice: 15000,
        priestCount: 3,
        priestTeamKn: "೩ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೨,೫೦೦ ಸಂಯುಕ್ತ ಮಂತ್ರ ಜಪ",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೪ ಕಲಶಗಳು",
        prathimaKn: "ತಾಮ್ರದ ಪ್ರತಿಮೆಗಳು",
        homaDravyasKn: ["೪ ಕೆಜಿ ಶುದ್ಧ ತುಪ್ಪ", "೨ ಕೆಜಿ ತಿಲ", "ಸಮಿತ್ತುಗಳು"],
        brahmanaBhojanaKn: "೩ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಮೂರು ಪೂಜೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಮಾಡುವುದಕ್ಕಿಂತ ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಒಟ್ಟಿಗೆ ನೆರವೇರಿಸಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಮೂರೂ ಪ್ರಧಾನ ವಿಧಿಗಳಾದ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರಗಳ ಮೂಲ ಶಾಸ್ತ್ರ ಸಂಪನ್ನವಾಗುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ತಿಲ & ತುಪ್ಪ ೪ ಕೆಜಿ", amount: 4500, descriptionKn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ತ್ರಿಪಿಂಡಿ ದ್ರವ್ಯಗಳು, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೩ ವಿದ್ವಾಂಸರು)", amount: 6500, descriptionKn: "೩ ವೇದ ವಿದ್ವಾಂಸರ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 2000, descriptionKn: "೩ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕ್ಷೇತ್ರ ಹಾಗೂ ಮಂಟಪ ವೆಚ್ಚ", amount: 2000, descriptionKn: "ತ್ರಿಕುಂಡ/ಏಕಕುಂಡ ಸಿದ್ಧತೆ, ರಂಗೋಲಿ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಸಮಗ್ರ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೫ ವೇದಮೂರ್ತಿಗಳ ಮಂತ್ರ ಘೋಷ, ಪರಿಪೂರ್ಣ ತ್ರಿಪುಟ ಪಿತೃ ಮುಕ್ತಿ",
        basePrice: 22000,
        priestCount: 5,
        priestTeamKn: "೫ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೭,೦೦೦ ಮಂತ್ರ ಜಪ & ವಿಷ್ಣು ಸಹಸ್ರನಾಮ, ರುದ್ರ ಪಾರಾಯಣ",
        durationKn: "೬ ಗಂಟೆ",
        kalashaCountKn: "೬ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ತ್ರಿಮೂರ್ತಿ ಪ್ರತಿಮೆಗಳು",
        homaDravyasKn: ["೭ ಕೆಜಿ ದೇಸಿ ತುಪ್ಪ", "೪ ಕೆಜಿ ತಿಲ", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ಪಾಯಸ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೫ ಋತ್ವಿಜರು + ೩ ಬ್ರಾಹ್ಮಣರಿಗೆ (ಒಟ್ಟು ೮ ಜನರಿಗೆ) ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "ಐವರು ವಿದ್ವಾಂಸರ ಸಾಮುದಾಯಿಕ ಜಪದಿಂದ ಮೂರು ತಲೆಮಾರುಗಳ ಪಿತೃಗಳಿಗೆ ತಕ್ಷಣ ಮುಕ್ತಿ ದೊರೆಯುತ್ತದೆ.",
        persuasiveAdvantageKn: "ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನ, ಅಷ್ಟದ್ರವ್ಯ ಹವಿಸ್ಸು ಹಾಗೂ ೭,೦೦೦ ಜಪಗಳಿಂದ ವಂಶದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ೭ ಕೆಜಿ ತುಪ್ಪ", amount: 7500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆಗಳು, ತುಪ್ಪ, ತಿಲ, ಕಲಶಗಳು, ರೇಷ್ಮೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೫ ವಿದ್ವಾಂಸರು)", amount: 9000, descriptionKn: "೫ ವೇದ ವಿದ್ವಾಂಸರಿಗೆ ಗೌರವಯುತ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3500, descriptionKn: "೮ ಜನರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಕ್ಷೇತ್ರ ಮಂಟಪ & ಕುಂಡ ವ್ಯವಸ್ಥೆ", amount: 2000, descriptionKn: "ಭವ್ಯ ಮಂಡಲ ರಚನೆ, ಹೂವು, ಹಣ್ಣು, ದೀಪಾರಾಧನೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ದಿವ್ಯ ಮಹಾ ಸಂಪುಟ",
        taglineKn: "೭ ಶ್ರೋತ್ರೀಯ ವಿದ್ವಾಂಸರ ಅಖಂಡ ಜಪ, ಸ್ವರ್ಣ-ರಜತ ದಾನ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 32000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೨,೦೦೦+ ಅಖಂಡ ಮಂತ್ರ ಜಪ & ಚತುರ್ವೇದ ಸೂಕ್ತ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಯಾಗ (೭ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೧೨ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಪ್ರತಿಮೆ ದಾನ, ಗೋಪೂಜೆ & ಧೇನು ದಾನ ಸಂಕಲ್ಪ",
        homaDravyasKn: ["೧೨ ಕೆಜಿ ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "೬ ಕೆಜಿ ತಿಲ", "ಕಸ್ತೂರಿ, ಕೇಸರಿ, ರಕ್ತಚಂದನ", "ರೇಷ್ಮೆ ಶಾಲು ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ ಸಮರ್ಪಣೆ"],
        brahmanaBhojanaKn: "೧೨+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ಘೋರವಾದ, ಬಹು ತಲೆಮಾರುಗಳ ಪಿತೃ ಶಾಪಗಳನ್ನು ಒಂದೇ ಬಾರಿಗೆ ಶಾಶ್ವತವಾಗಿ ಕರಗಿಸಲು ಇದು ಪರಮೋಚ್ಛ ವಿಧಿ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ೧೨,೦೦೦ ಜಪ, ಸ್ವರ್ಣ ದಾನ ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಸಪ್ತ ತಲೆಮಾರುಗಳಿಗೂ ಶಾಶ್ವತ ದೈವೀ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಸ್ವರ್ಣ/ರಜತ ಪ್ರತಿಮೆ & ಅಪರೂಪದ ಹವಿಸ್ಸು", amount: 12000, descriptionKn: "ಚಿನ್ನ-ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ೧೨ ಕೆಜಿ ತುಪ್ಪ, ಕಸ್ತೂರಿ, ಕೇಸರಿ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12500, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 5000, descriptionKn: "೧೨+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು" },
          { headKn: "ಭವ್ಯ ಮಂಡಲ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಪುಷ್ಪ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "c1", nameKn: "ಕಲಶ ಚೊಂಬುಗಳು (ತಾಮ್ರ/ಹಿತ್ತಾಳೆ)", quantityKn: "೪ ರಿಂದ ೧೨ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c2", nameKn: "ಶ್ರೀಫಲ (ನೀರುಳ್ಳ ಗಟ್ಟಿ ತೆಂಗಿನಕಾಯಿಗಳು)", quantityKn: "೧೨ ರಿಂದ ೨೧ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c3", nameKn: "ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೪ ಕೆಜಿ ಯಿಂದ ೧೨ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "c4", nameKn: "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ)", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೬ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c5", nameKn: "ಅಶ್ವತ್ಥ, ಪಲಾಶ, ಔದುಂಬರ ಸಮಿತ್ತುಗಳು", quantityKn: "೫ ರಿಂದ ೯ ಕಟ್ಟುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c6", nameKn: "ತ್ರಿಪಿಂಡಿ ದ್ರವ್ಯಗಳು (ಜವ, ತಿಲ, ಸಕ್ಕರೆ, ತುಪ್ಪ, ಹಾಲು)", quantityKn: "ಸಂಪೂರ್ಣ ಸೆಟ್", source: "priest", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c7", nameKn: "ವಿಷ್ಣು, ರುದ್ರ, ಬ್ರಹ್ಮ ಪ್ರತಿಮೆಗಳು", quantityKn: "೩ ಪ್ರತಿಮೆಗಳು (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "c8", nameKn: "ಬಿಳಿ ಹಾಗೂ ಹಳದಿ ಧೋತಿ, ಶಾಲು", quantityKn: "೩ ರಿಂದ ೮ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "c9", nameKn: "ಪೂರ್ಣಾಹುತಿ ರೇಷ್ಮೆ ವಸ್ತ್ರ", quantityKn: "೧ ಮೀಟರ್ ರೇಷ್ಮೆ ಶಾಲು", source: "priest", group: "vastra_prathima", importanceKn: "ಪೂರ್ಣಾಹುತಿ" },
      { id: "c10", nameKn: "ಅಕ್ಕಿ (ಅಕ್ಷತೆ & ಪಿಂಡ ದ್ರವ್ಯಕ್ಕೆ)", quantityKn: "೧೦ ಕೆಜಿ ಯಿಂದ ೨೫ ಕೆಜಿ", source: "devotee", group: "bhojana_dana", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "c11", nameKn: "ಹೂವು, ತುಳಸಿ, ಹಣ್ಣುಗಳು, ತಾಂಬೂಲ", quantityKn: "೫ ಬಗೆಯ ಹಣ್ಣು, ವೀಳ್ಯದೆಲೆ, ಅಡಿಕೆ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 4. ಮಹಾಗಣಪತಿ ಹೋಮ (Maha Ganapati Homa)
  {
    id: "maha_ganapati_homa",
    nameKn: "ಮಹಾಗಣಪತಿ ಹೋಮ (ಸರ್ವ ವಿಘ್ನ ನಿವಾರಣಾ ಹೋಮ)",
    subtitleKn: "ಸಕಲ ಕಾರ್ಯಸಿದ್ಧಿ, ನೂತನ ಗೃಹ ಪ್ರವೇಶ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ & ಶುಭಾರಂಭ",
    domain: "devata",
    icon: "🐘",
    isPopular: true,
    whyNeedThisPoojaKn: "ಯಾವುದೇ ಹೊಸ ಕಾರ್ಯ, ಮನೆ ಕಟ್ಟುವುದು, ನೂತನ ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಆರಂಭ, ಅಥವಾ ನಿರಂತರವಾಗಿ ಬರುತ್ತಿರುವ ವಿಘ್ನ-ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಲು ಪ್ರಥಮ ಪೂಜಿತನಾದ ಮಹಾಗಣಪತಿಯ ಹೋಮ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ಗಣಪತಿ ಮಂತ್ರಗಳ ಆಹುತಿಯಿಂದ ಎಲ್ಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಕರಗಿ ಅಭಯ ಹಸ್ತ ಲಭಿಸುತ್ತದೆ.",
    shastraReferenceKn: "ಋಗ್ವೇದ & ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ: 'ತ್ವಮೇವ ಪ್ರತ್ಯಕ್ಷಂ ತತ್ತ್ವಮಸಿ | ತ್ವಮೇವ ಕೇವಲಂ ಕರ್ತಾಸಿ | ಸರ್ವಂ ಜಗದಿದಂ ತ್ವತ್ತೋ ಜಾಯತೇ ||'",
    rootCauseKn: "ಆರಂಭಿಸಿದ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ವಿಘ್ನಗಳು, ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಪ್ರಭಾವ.",
    expectedLifeShiftsKn: [
      "ಮನೆಯಲ್ಲಿ ಶುಭ ಮಂಗಳ ವಾತಾವರಣ ಉಂಟಾಗಿ ಎಲ್ಲ ಕಾರ್ಯಗಳು ಸುಸೂತ್ರವಾಗಿ ನೆರವೇರುತ್ತವೆ.",
      "ವ್ಯಾಪಾರ-ಉದ್ಯೋಗಗಳಲ್ಲಿ ಇದ್ದ ಮಂದಗತಿ ದೂರವಾಗಿ ನೂತನ ಲಾಭಗಳು ಗೋಚರಿಸುತ್ತವೆ.",
      "ಬುದ್ಧಿ ಶಕ್ತಿ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಮಾನಸಿಕ ಧೈರ್ಯ ವೃದ್ಧಿಸುತ್ತದೆ.",
      "ಶತ್ರು ಬಾಧೆಗಳು ಹಾಗೂ ದೃಷ್ಟಿ ದೋಷಗಳು ತಕ್ಷಣವೇ ಭಸ್ಮವಾಗುತ್ತವೆ."
    ],
    sacredProcedureSummaryKn: "ಸ್ವಸ್ತಿ ಪುಣ್ಯಾಹವಾಚನ, ಮಹಾಗಣಪತಿ ಆವಾಹನೆ, ಕಲಶ ಪೂಜೆ, ಅಷ್ಟದ್ರವ್ಯ ಹೋಮ, ಮೋದಕ-ದೂರ್ವಾ-ತಿಲ-ಆಜ್ಯ ಆಹುತಿ, ಮಹಾ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಆಶೀರ್ವಾದ.",
    havanaSpecialtiesKn: [
      "ಅಷ್ಟದ್ರವ್ಯಗಳು (ಕಬ್ಬು, ತೆಂಗಿನಕಾಯಿ, ಅವಲಕ್ಕಿ, ಅರಳು, ಕಬ್ಬಿನ ಹಾಲು, ಎಳ್ಳು, ಬಾಳೆಹಣ್ಣು, ಜೇನುತುಪ್ಪ)",
      "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ಹಾಗೂ ಮೋದಕಗಳು",
      "ದೂರ್ವಾ (ಗರಿಕೆ ಹುಲ್ಲು) ೧೦೮ ಕಟ್ಟುಗಳು",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ಶ್ರೀಫಲ"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಆವರ್ತನ",
      "ಹೋತೃವಿನಿಂದ ಅಷ್ಟದ್ರವ್ಯ ಆಹುತಿ ನಿರ್ವಹಣೆ",
      "ಜಪಕರ್ತೃಗಳಿಂದ ಗಣಪತಿ ಮೂಲ ಮಂತ್ರ ಜಪ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೧,೦೦೮ ಮೋದಕಗಳ ಆಹುತಿ, ೧೦,೦೦೦ ಗಣಪತಿ ಜಪ, ಬೆಳ್ಳಿಯ ಗಣಪತಿ ಮೂರ್ತಿ ದಾನ, ೧೦ ಕೆಜಿ ಹಸುವಿನ ತುಪ್ಪದ ಅಖಂಡ ಹವಿಸ್ಸು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಮಾಡಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಎಂತಹ ಕಠಿಣ ವಿಘ್ನಗಳೂ ಕ್ಷಣಮಾತ್ರದಲ್ಲಿ ಧ್ವಂಸವಾಗಿ ಅಷ್ಟೈಶ್ವರ್ಯ ಲಭಿಸುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮೂಲ ವಿಘ್ನ ಶಾಂತಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ಮಹಾಗಣಪತಿ ಹೋಮ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ಗಣಪತಿ ಮೂಲ ಮಂತ್ರ ಜಪ",
        durationKn: "೨ ರಿಂದ ೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ಪ್ರಧಾನ ಗಣಪತಿ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ಅಷ್ಟದ್ರವ್ಯ ಸೆಟ್", "೧೦೮ ಗರಿಕೆ", "ಮೋದಕ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ನೂತನ ಕಾರ್ಯಕ್ಕೆ ಗಣೇಶನ ಆಶೀರ್ವಾದ ಪಡೆಯಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಅಷ್ಟದ್ರವ್ಯ ಹೋಮ ಹಾಗೂ ಪೂರ್ಣಾಹುತಿ ಲೋಪವಿಲ್ಲದೆ ನೆರವೇರುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಅಷ್ಟದ್ರವ್ಯ, ತುಪ್ಪ & ಕಲಶ ಸಾಮಗ್ರಿ", amount: 3500, descriptionKn: "ಅಷ್ಟದ್ರವ್ಯಗಳು, ತುಪ್ಪ ೨ ಕೆಜಿ, ಕಲಶ, ಗರಿಕೆ, ತೆಂಗಿನಕಾಯಿ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ವಿದ್ವಾಂಸರ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ತಾಂಬೂಲ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ಹಾಗೂ ದಕ್ಷಿಣೆ" },
          { headKn: "ಹೋಮ ಕುಂಡ ಸಿದ್ಧತೆ & ಹೂವು-ಹಣ್ಣು", amount: 2000, descriptionKn: "ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ಹೂವಿನ ಅಲಂಕಾರ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಸಿದ್ಧಿ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ಅಥರ್ವಶೀರ್ಷ ಮಂತ್ರ ಘೋಷ & ಸಮಗ್ರ ಅಷ್ಟದ್ರವ್ಯ ಹವನ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೫,೦೦೦ ಮಂತ್ರ ಜಪ & ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ೨೧ ಆವರ್ತನಗಳು",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೩ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಗಣಪತಿ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೫ ಕೆಜಿ ತುಪ್ಪ", "ವಿಶೇಷ ಅಷ್ಟದ್ರವ್ಯಗಳು", "೪೪೪ ಗರಿಕೆ ಕಟ್ಟುಗಳು", "೫೪ ಮೋದಕಗಳು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "ನಾಲ್ವರು ವಿದ್ವಾಂಸರಿಂದ ೨೧ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ ಹಾಗೂ ಬೆಳ್ಳಿ ಮೂರ್ತಿ ದಾನದಿಂದ ಸಕಲ ವಿಘ್ನ ನಾಶ.",
        persuasiveAdvantageKn: "ಮನೆ ಮತ್ತು ಉದ್ಯಮಕ್ಕೆ ಸಮಗ್ರ ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ಶಾಶ್ವತ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ಅಷ್ಟದ್ರವ್ಯ & ೫ ಕೆಜಿ ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ, ತುಪ್ಪ, ಅಷ್ಟದ್ರವ್ಯ, ಮೋದಕ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಮಂಟಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಪುಷ್ಪ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ಸಹಸ್ರ ಮೋದಕ ಮಹಾಯಾಗ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ೧,೦೦೮ ಮೋದಕ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೦,೦೦೦+ ಮೂಲ ಮಂತ್ರ ಜಪ & ಅಥರ್ವಶೀರ್ಷ ಮಹಾ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಹೋಮ (೬ ಗಂಟೆ)",
        kalashaCountKn: "೭ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಗಣಪತಿ ಪ್ರತಿಮೆ & ಗೋಪೂಜೆ ಸಂಕಲ್ಪ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "೧,೦೦೮ ಮೋದಕಗಳು", "ಬೃಹತ್ ಅಷ್ಟದ್ರವ್ಯ ಸಂಪುಟ", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ದೊಡ್ಡ ಯೋಜನೆಗಳು, ಬೃಹತ್ ವ್ಯಾಪಾರ, ರಾಜಕೀಯ ಯಶಸ್ಸು ಹಾಗೂ ಅಸಾಧ್ಯ ಕಾರ್ಯ ಸಿದ್ಧಿಗೆ ಪರಮೋಚ್ಛ ಮಹಾಯಾಗ.",
        persuasiveAdvantageKn: "೧,೦೦೮ ಮೋದಕಗಳ ಆಹುತಿ, ೭ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ತರಂಗಗಳು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಅಷ್ಟದಿಕ್ಕುಗಳಲ್ಲೂ ಜಯ ದೊರೆಯುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ೧,೦೦೮ ಮೋದಕಗಳು", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಅಷ್ಟದ್ರವ್ಯ, ಮೋದಕ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಪುಷ್ಪ ಮಂಟಪ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಪುಷ್ಪಾಲಂಕಾರ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ" }
        ]
      }
    },
    samagriList: [
      { id: "g1", nameKn: "ಕಲಶ ಚೊಂಬುಗಳು (ತಾಮ್ರ/ಹಿತ್ತಾಳೆ)", quantityKn: "೧ ರಿಂದ ೭ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "g2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೬ ರಿಂದ ೧೨ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "g3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "g4", nameKn: "ಅಷ್ಟದ್ರವ್ಯ ಸಾಮಗ್ರಿಗಳು (ಕಬ್ಬು, ಅವಲಕ್ಕಿ, ಎಳ್ಳು, ಇತ್ಯಾದಿ)", quantityKn: "ಸಂಪೂರ್ಣ ಸೆಟ್", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "g5", nameKn: "ಗರಿಕೆ ಹುಲ್ಲು (ದೂರ್ವಾ)", quantityKn: "೧೦೮ ರಿಂದ ೧,೦೦೮ ಕಟ್ಟುಗಳು", source: "devotee", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "g6", nameKn: "ಮೋದಕಗಳು (ಹೋಮಕ್ಕೆ ತಯಾರಿಸಿದ ಕಡುಬು)", quantityKn: "೨೧ ರಿಂದ ೧,೦೦೮ ಸಂಖ್ಯೆ", source: "devotee", group: "homa_dravya", importanceKn: "ವಿಶೇಷ ಹವಿಸ್ಸು" },
      { id: "g7", nameKn: "ಗಣಪತಿ ಮೂರ್ತಿ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಪ್ರತಿಮೆ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "g8", nameKn: "ಕೆಂಪು ಹಾಗೂ ಹಳದಿ ವಸ್ತ್ರಗಳು", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "g9", nameKn: "ಕೆಂಪು ಹೂವುಗಳು (ದಾಸವಾಳ, ಸೇವಂತಿಗೆ, ಇತ್ಯಾದಿ)", quantityKn: "೨ ಕೆಜಿ ಹೂವು", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 5. ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ (Maha Mrityunjaya Homa)
  {
    id: "maha_mrityunjaya_homa",
    nameKn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ (ಆಯುಷ್ಯ ರಕ್ಷಾ ಹೋಮ)",
    subtitleKn: "ದೀರ್ಘ ರೋಗ ನಿವಾರಣೆ, ಅಪಮೃತ್ಯು ಭಯ ನಾಶ, ಸಂಕಟ ಮೋಚನೆ & ದಿವ್ಯ ಆಯುಷ್ಯ",
    domain: "devata",
    icon: "🔱",
    isPopular: true,
    whyNeedThisPoojaKn: "ಜಾತಕದಲ್ಲಿ ಮಾರಕ ದಶಾ ನಡೆಯುತ್ತಿದ್ದಾಗ, ಗಂಭೀರ ಅನಾರೋಗ್ಯ, ಆಸ್ಪತ್ರೆಯ ನಿರಂತರ ಅಲೆದಾಟ, ಅಪಘಾತದ ಭೀತಿ ಅಥವಾ ವೃದ್ಧಾಪ್ಯದ ಕಷ್ಟಗಳಿದ್ದಾಗ ಪರಮೇಶ್ವರನ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ ಜೀವ ರಕ್ಷಕ ಕವಚದಂತೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. 'ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ' ಮಂತ್ರದ ಪ್ರತಿಯೊಂದು ಆಹುತಿಯೂ ಅಮೃತದಂತೆ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ತುಂಬುತ್ತದೆ.",
    shastraReferenceKn: "ಋಗ್ವೇದ & ಶಿವ ಪುರಾಣ: 'ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ | ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ||'",
    rootCauseKn: "ಮಾರಕ ಗ್ರಹಗಳ ದಶಾ-ಭುಕ್ತಿ, ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಆಯುರ್ಭಾವ ದೋಷ, ತೀವ್ರ ಅನಾರೋಗ್ಯ.",
    expectedLifeShiftsKn: [
      "ದೀರ್ಘಕಾಲದ ಮಾರಣಾಂತಿಕ ಕಾಯಿಲೆಗಳಿಂದ ಶೀಘ್ರ ಗುಣಮುಖರಾಗುವ ದೈವೀ ಶಕ್ತಿ ಲಭಿಸುತ್ತದೆ.",
      "ಅಪಘಾತ, ಆಕಸ್ಮಿಕ ಸಾವು ಮತ್ತು ದುರ್ಮರಣದ ಭಯ ಸಂಪೂರ್ಣವಾಗಿ ತೊಲಗುತ್ತದೆ.",
      "ಮನಸ್ಸಿನಲ್ಲಿ ನವ ಚೈತನ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ಪ್ರಾಣಶಕ್ತಿ ತುಂಬಿಕೊಳ್ಳುತ್ತದೆ.",
      "ವಯೋವೃದ್ಧರಿಗೆ ಮತ್ತು ಕುಟುಂಬದ ಹಿರಿಯರಿಗೆ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆಯುರ್ಬಲ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಮೃತ್ಯುಂಜಯ ಕಲಶ ಸ್ಥಾಪನೆ, ಅಮೃತ ಕಲಶಾಭಿಷೇಕ, ತ್ರ್ಯಂಬಕ ಮಂತ್ರ ಜಪ, ಆಜ್ಯ-ದೂರ್ವಾ-ತಿಲ-ಅಮೃತಬಳ್ಳಿ ಸಮಿತ್ತು ಹವನ, ಮಹಾ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಭಸ್ಮ ಧಾರಣೆ.",
    havanaSpecialtiesKn: [
      "ಅಮೃತಬಳ್ಳಿ (ಗುಡುಚಿ) ಸಮಿತ್ತುಗಳು",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ಗರಿಕೆ (ದೂರ್ವಾ)",
      "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ಹಾಗೂ ಹಾಲು-ಜೇನುತುಪ್ಪ ಮಿಶ್ರಿತ ಪಾಯಸ",
      "ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಬಿಲ್ವಪತ್ರೆಗಳು"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ಮೃತ್ಯುಂಜಯ ಸೂಕ್ತ ಹಾಗೂ ರುದ್ರ ನಮಕ-ಚಮಕ ಪಾರಾಯಣ",
      "ಹೋತೃವಿನಿಂದ ಅಮೃತಬಳ್ಳಿ ಸಮಿತ್ತುಗಳ ಆಹುತಿ",
      "ಜಪಕರ್ತೃಗಳಿಂದ ತ್ರ್ಯಂಬಕ ಮಂತ್ರದ ಅಖಂಡ ಜಪ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೧೦,೦೦೦+ ಮೃತ್ಯುಂಜಯ ಜಪ, ೭ ವೇದ ವಿದ್ವಾಂಸರ ರುದ್ರ ಪಾರಾಯಣ, ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ದಾನ, ೧೦ ಕೆಜಿ ತುಪ್ಪದ ಅಮೃತ ಹವಿಸ್ಸು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಮಾಡಲಾಗುತ್ತದೆ. ಇದು ಮರಣ ಶಯ್ಯೆಯಲ್ಲಿರುವವರಿಗೂ ಹೊಸ ಪ್ರಾಣದಾನ ಮಾಡುವಷ್ಟು ಅಗಾಧ ಶಕ್ತಿ ಹೊಂದಿದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮೂಲ ಆಯುಷ್ಯ ರಕ್ಷೆ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ಮೃತ್ಯುಂಜಯ ಹೋಮ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ತ್ರ್ಯಂಬಕ ಮಂತ್ರ ಜಪ",
        durationKn: "೨ ರಿಂದ ೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ಮೃತ್ಯುಂಜಯ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ಶಿವಲಿಂಗ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ಅಮೃತಬಳ್ಳಿ", "ಬಿಲ್ವಪತ್ರೆ", "ತಿಲ"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಅನಾರೋಗ್ಯ ಶಮನಕ್ಕೆ ಮೂಲ ಮೃತ್ಯುಂಜಯ ಆಶೀರ್ವಾದ ಪಡೆಯಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಅಮೃತಬಳ್ಳಿ ಸಮಿತ್ತು ಹಾಗೂ ಆಜ್ಯ ಆಹುತಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ತುಪ್ಪ & ಬಿಲ್ವಪತ್ರೆ", amount: 3500, descriptionKn: "ಅಮೃತಬಳ್ಳಿ, ತುಪ್ಪ ೨ ಕೆಜಿ, ಬಿಲ್ವಪತ್ರೆ, ತಿಲ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ವಿದ್ವಾಂಸರ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ ಸಿದ್ಧತೆ & ಹೂವು-ಹಣ್ಣು", amount: 2000, descriptionKn: "ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ಹೂವಿನ ಅಲಂಕಾರ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ರುದ್ರ ಮಂತ್ರ ಘೋಷ & ಸಮಗ್ರ ಅಮೃತ ಹವನ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೫,೦೦೦ ಮಂತ್ರ ಜಪ & ಮಹಾ ರುದ್ರ ಪಾರಾಯಣ",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೩ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೫ ಕೆಜಿ ತುಪ್ಪ", "ಅಮೃತಬಳ್ಳಿ ೧೦೮", "೧,೦೦೮ ಬಿಲ್ವಪತ್ರೆ", "ಪಾಯಸ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "ನಾಲ್ವರು ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಶಕ್ತಿ ಹಾಗೂ ಬೆಳ್ಳಿಯ ಶಿವಲಿಂಗ ದಾನದಿಂದ ಗಂಭೀರ ರೋಗಗಳು ಶಮನವಾಗುತ್ತವೆ.",
        persuasiveAdvantageKn: "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರಿಗೂ ದೀರ್ಘಾಯುಷ್ಯದ ರಕ್ಷಾ ಕವಚ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ಬಿಲ್ವಪತ್ರೆ & ೫ ಕೆಜಿ ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಶಿವಲಿಂಗ, ತುಪ್ಪ, ಬಿಲ್ವಪತ್ರೆ, ಅಮೃತಬಳ್ಳಿ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಮಂಟಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ಅಮೃತ ಮಹಾ ಸಂಪುಟ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ೧೦,೦೦೦+ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೦,೦೦೦+ ಅಖಂಡ ಮೃತ್ಯುಂಜಯ ಜಪ & ಏಕಾದಶ ರುದ್ರ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಯಾಗ (೬ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೭ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಶಿವಲಿಂಗ ಪ್ರತಿಮೆ & ಗೋಪೂಜೆ ಸಂಕಲ್ಪ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "೧,೦೦೮ ಬಿಲ್ವಪತ್ರೆ", "ಅಮೃತಬಳ್ಳಿ ಸಂಪುಟ", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ಕಠಿಣ ಮಾರಣಾಂತಿಕ ಕಾಯಿಲೆಗಳು, ಅಪಮೃತ್ಯು ಯೋಗ ಹಾಗೂ ಜೀವ ಭಯ ನಿವಾರಣೆಗೆ ಪರಮೋಚ್ಛ ದಿವ್ಯ ಶಾಂತಿ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ೧೦,೦೦೦ ಜಪ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಅಮೃತ ಸಮಿತ್ತು ಆಹುತಿಯಿಂದ ಆಯುಷ್ಯ ಪುನಶ್ಚೇತನಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ೧೦ ಕೆಜಿ ತುಪ್ಪ", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಬಿಲ್ವಪತ್ರೆ, ಅಮೃತಬಳ್ಳಿ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಪುಷ್ಪ ಮಂಟಪ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಬಿಲ್ವ-ಪುಷ್ಪ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "m1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ)", quantityKn: "೧ ರಿಂದ ೭ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "m2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೬ ರಿಂದ ೧೨ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "m3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "m4", nameKn: "ಅಮೃತಬಳ್ಳಿ (ಗುಡುಚಿ) ಸಮಿತ್ತುಗಳು", quantityKn: "೧೦೮ ರಿಂದ ೧,೦೦೮ ತುಂಡುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "m5", nameKn: "ಬಿಲ್ವಪತ್ರೆಗಳು", quantityKn: "೧೦೮ ರಿಂದ ೧,೦೦೮ ಎಲೆಗಳು", source: "devotee", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "m6", nameKn: "ಶಿವಲಿಂಗ ಮೂರ್ತಿ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಪ್ರತಿಮೆ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "m7", nameKn: "ಬಿಳಿ ಧೋತಿ & ಶಾಲು", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "m8", nameKn: "ಹಸುವಿನ ಹಾಲು, ಜೇನುತುಪ್ಪ, ಗಂಗಾಜಲ", quantityKn: "ಅರ್ಧ ಲೀಟರ್ ಪ್ರತಿಯೊಂದೂ", source: "devotee", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 6. ಶ್ರೀ ಸುದರ್ಶನ ಹೋಮ (Shri Sudarshana Homa)
  {
    id: "sudarshana_homa",
    nameKn: "ಶ್ರೀ ಸುದರ್ಶನ ಹೋಮ (ದಿವ್ಯ ಚಕ್ರ ರಕ್ಷಾ ಹೋಮ)",
    subtitleKn: "ಶತ್ರು ಬಾಧಾ ನಿವಾರಣೆ, ಮಾಟ-ಮಂತ್ರ-ದೃಷ್ಟಿ ದೋಷ ನಾಶ & ಜಯಪ್ರದ ರಕ್ಷೆ",
    domain: "devata",
    icon: "☸",
    isPopular: true,
    whyNeedThisPoojaKn: "ವ್ಯಾಪಾರ-ವ್ಯವಹಾರದಲ್ಲಿ ಶತ್ರುಗಳ ಉಪಟಳ, ಅಸೂಯೆ, ಕಣ್ಣುದೃಷ್ಟಿ, ಮಾಟ-ಮಂತ್ರದ ಶಂಕೆ, ಅಥವಾ ನಿರಂತರವಾಗಿ ನ್ಯಾಯಾಲಯದ ವಿವಾದಗಳಿದ್ದಾಗ ಶ್ರೀಮನ್ನಾರಾಯಣನ ಸುದರ್ಶನ ಚಕ್ರದ ಹೋಮ ಅತ್ಯುಗ್ರ ರಕ್ಷಣಾ ಕವಚವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ. ಸುದರ್ಶನ ಜ್ವಾಲೆಯು ಸಕಲ ಅನಿಷ್ಟಗಳನ್ನು ಸುಟ್ಟು ಭಸ್ಮ ಮಾಡುತ್ತದೆ.",
    shastraReferenceKn: "ಅಹಿರ್ಬುಧ್ನ್ಯ ಸಂಹಿತೆ: 'ಸುದರ್ಶನ ಮಹಾಜ್ವಾಲ ಕೋಟಿಸೂರ್ಯಸಮಪ್ರಭ | ಅಜ್ಞಾನತಿಮಿರಾನ್ಧಾನಾಂ ಜ್ಞಾನದೃಷ್ಟಿಪ್ರದೋ ಭವ ||'",
    rootCauseKn: "ಅಸೂಯೆ, ತೀವ್ರ ಶತ್ರು ಪೀಡೆ, ದೃಷ್ಟಿ ದೋಷ, ನಕಾರಾತ್ಮಕ ತಾಂತ್ರಿಕ ಪ್ರಭಾವಗಳು.",
    expectedLifeShiftsKn: [
      "ಶತ್ರುಗಳ ಕುತಂತ್ರಗಳು ಮತ್ತು ಅಡೆತಡೆಗಳು ತಾವಾಗಿಯೇ ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ.",
      "ಮನೆಯಲ್ಲಿ ನಿರಾಳತೆ, ರಕ್ಷಣೆ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸ ಮರುಕಳಿಸುತ್ತದೆ.",
      "ನ್ಯಾಯಾಲಯದ ಕೇಸುಗಳು ಹಾಗೂ ಭೂ ವಿವಾದಗಳಲ್ಲಿ ಜಯ ಸಿಗುತ್ತದೆ.",
      "ವ್ಯಾಪಾರದಲ್ಲಿ ಎದುರಾಗಿದ್ದ ನಿಗೂಢ ನಷ್ಟಗಳು ಕೊನೆಗಾಣುತ್ತವೆ."
    ],
    sacredProcedureSummaryKn: "ಸುದರ್ಶನ ಯಂತ್ರ ಸ್ಥಾಪನೆ, ನಾರಸಿಂಹ-ಸುದರ್ಶನ ಆವಾಹನೆ, ಸುದರ್ಶನ ಮಂತ್ರ ಜಪ, ಸಾಸಿವೆ-ತಿಲ-ಆಜ್ಯ-ಪಲಾಶ ಹವನ, ಮಹಾ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ರಕ್ಷಾ ಸೂತ್ರ ಧಾರಣೆ.",
    havanaSpecialtiesKn: [
      "ಬಿಳಿ ಸಾಸಿವೆ (ಸಿದ್ಧಾರ್ಥಕ) ಹಾಗೂ ಕಪ್ಪು ಎಳ್ಳು",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ತುಪ್ಪದಲ್ಲಿ ಅದ್ದಿದ ಹವಿಸ್ಸು",
      "ಸುದರ್ಶನ ಗಾಯತ್ರಿ ಆಹುತಿ",
      "ಶ್ರೀ ನೃಸಿಂಹ ಬೀಜ ಮಂತ್ರ ಆಹುತಿ"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ಸುದರ್ಶನ ಶತಕ ಹಾಗೂ ಪುರುಷ ಸೂಕ್ತ ಪಾರಾಯಣ",
      "ಹೋತೃವಿನಿಂದ ಸಾಸಿವೆ ಹಾಗೂ ಆಜ್ಯ ಆಹುತಿ ನಿರ್ವಹಣೆ",
      "ಜಪಕರ್ತೃಗಳಿಂದ ಸುದರ್ಶನ ಮಹಾ ಮಂತ್ರ ಜಪ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೧೦,೦೦೦ ಸುದರ್ಶನ ಮಂತ್ರ ಜಪ, ೭ ವಿದ್ವಾಂಸರ ಸಾಮುದಾಯಿಕ ನಾರಸಿಂಹ ಕವಚ ಪಠಣ, ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಸುದರ್ಶನ ಯಂತ್ರ ದಾನ, ೧೦ ಕೆಜಿ ತುಪ್ಪದ ಆಹುತಿ ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಮಾಡಲಾಗುತ್ತದೆ. ಇದು ಇಡೀ ಕುಟುಂಬಕ್ಕೆ ಅಭೇದ್ಯ ದೈವೀ ಕೋಟೆಯಂತೆ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮೂಲ ರಕ್ಷಾ ವಿಧಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ಸುದರ್ಶನ ಹೋಮ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ಸುದರ್ಶನ ಮಂತ್ರ ಜಪ",
        durationKn: "೨ ರಿಂದ ೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ಸುದರ್ಶನ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ಯಂತ್ರ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ಬಿಳಿ ಸಾಸಿವೆ", "ತಿಲ", "ಪಲಾಶ ಸಮಿತ್ತು"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಶತ್ರು ಬಾಧೆ ಹಾಗೂ ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆಗೆ ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಸಾಸಿವೆ ಆಹುತಿ ಹಾಗೂ ರಕ್ಷಾ ಸೂತ್ರ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ಸಾಸಿವೆ & ತುಪ್ಪ", amount: 3500, descriptionKn: "ಬಿಳಿ ಸಾಸಿವೆ, ತುಪ್ಪ ೨ ಕೆಜಿ, ಕಲಶ, ಸಮಿತ್ತು, ತಿಲ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ವಿದ್ವಾಂಸರ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ ಸಿದ್ಧತೆ & ಹೂವು-ಹಣ್ಣು", amount: 2000, descriptionKn: "ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ಹೂವಿನ ಅಲಂಕಾರ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷೆ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ಸುದರ್ಶನ ಮಂತ್ರ ಘೋಷ & ಸಮಗ್ರ ಚಕ್ರ ಹವನ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೫,೦೦೦ ಮಂತ್ರ ಜಪ & ಸುದರ್ಶನ ಶತಕ ಪಾರಾಯಣ",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೩ ಕಲಶಗಳು (ಸುದರ್ಶನ, ನಾರಸಿಂಹ, ವಿಷ್ಣು)",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಸುದರ್ಶನ ಯಂತ್ರ",
        homaDravyasKn: ["೫ ಕೆಜಿ ತುಪ್ಪ", "ಬಿಳಿ ಸಾಸಿವೆ ೧ ಕೆಜಿ", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ಪಾಯಸ ಹವಿಸ್ಸು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "ನಾಲ್ವರು ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಶಕ್ತಿ ಹಾಗೂ ಬೆಳ್ಳಿಯ ಯಂತ್ರದಿಂದ ಎಂತಹ ಶತ್ರು ಬಾಧೆಯೂ ನಿರ್ನಾಮವಾಗುತ್ತದೆ.",
        persuasiveAdvantageKn: "ಕುಟುಂಬ ಹಾಗೂ ವ್ಯಾಪಾರಕ್ಕೆ ದೃಢ ರಕ್ಷಣಾ ಕವಚ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಯಂತ್ರ, ಸಾಸಿವೆ & ೫ ಕೆಜಿ ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಯಂತ್ರ, ತುಪ್ಪ, ಸಾಸಿವೆ, ಕಲಶ, ರೇಷ್ಮೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಮಂಟಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ನೃಸಿಂಹ-ಸುದರ್ಶನ ಮಹಾಯಾಗ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ೧೦,೦೦೦+ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೦,೦೦೦+ ಸುದರ್ಶನ & ನೃಸಿಂಹ ಮಹಾ ಮಂತ್ರ ಜಪ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಯಾಗ (೬ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೭ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಸುದರ್ಶನ ಚಕ್ರ ಯಂತ್ರ & ಗೋಪೂಜೆ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ದೇಸಿ ತುಪ್ಪ", "ಬಿಳಿ ಸಾಸಿವೆ ಸಂಪುಟ", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ಕಠಿಣ ಮಾಟ-ಮಂತ್ರ, ನ್ಯಾಯಾಲಯ ಕೇಸುಗಳು ಹಾಗೂ ತೀವ್ರ ಶತ್ರು ಪೀಡೆಗೆ ಅಂತಿಮ ದೈವೀ ಬ್ರಹ್ಮಾಸ್ತ್ರ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ೧೦,೦೦೦ ಜಪಗಳು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಸಕಲ ದಿಕ್ಕುಗಳಲ್ಲೂ ಶತ್ರು ಜಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಯಂತ್ರ & ೧೦ ಕೆಜಿ ತುಪ್ಪ", amount: 11000, descriptionKn: "ಯಂತ್ರ, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಸಾಸಿವೆ, ಅಷ್ಟದ್ರವ್ಯ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಪುಷ್ಪ ಮಂಟಪ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "su1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ)", quantityKn: "೧ ರಿಂದ ೭ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "su2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೬ ರಿಂದ ೧೨ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "su3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "su4", nameKn: "ಬಿಳಿ ಸಾಸಿವೆ (ಸಿದ್ಧಾರ್ಥಕ)", quantityKn: "೫೦೦ ಗ್ರಾಂ ನಿಂದ ೨ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "su5", nameKn: "ಸುದರ್ಶನ ಯಂತ್ರ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಯಂತ್ರ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "su6", nameKn: "ಕೆಂಪು ಧೋತಿ & ಶಾಲು", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "su7", nameKn: "ಕೆಂಪು ಹೂವುಗಳು (ದಾಸವಾಳ)", quantityKn: "೨ ಕೆಜಿ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 7. ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮ (Navagraha Shanti Homa)
  {
    id: "navagraha_shanti_homa",
    nameKn: "ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮ (ಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ಹೋಮ)",
    subtitleKn: "ಗ್ರಹ ಪೀಡೆ ನಿವಾರಣೆ, ಸಾಡೇ ಸಾತಿ, ಅಷ್ಟಮ ಶನಿ, ರಾಹು-ಕೇತು ಶಾಂತಿ & ಶುಭ ಫಲ",
    domain: "devata",
    icon: "🪐",
    isPopular: true,
    whyNeedThisPoojaKn: "ಜಾತಕದಲ್ಲಿ ಶನಿ ದೆಸೆ, ಸಾಡೇ ಸಾತಿ, ಅಷ್ಟಮ ಶನಿ, ರಾಹು-ಕೇತು ದೋಷ, ಕುಜ ದೋಷ ಅಥವಾ ಗುರು ಬಲ ಹೀನವಾಗಿದ್ದಾಗ ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮದಿಂದ ಒಂಬತ್ತು ಗ್ರಹಗಳೂ ಪ್ರಸನ್ನರಾಗುತ್ತಾರೆ. ಪ್ರತಿಯೊಂದು ಗ್ರಹಕ್ಕೆ ತಕ್ಕ ಸಮಿತ್ತು, ಧಾನ್ಯ ಮತ್ತು ಮಂತ್ರಗಳ ಆಹುತಿಯಿಂದ ಪ್ರತಿಕೂಲ ಗ್ರಹಗಳು ಅನುಕೂಲಕರವಾಗಿ ಬದಲಾಗುತ್ತವೆ.",
    shastraReferenceKn: "ಯಾಜ್ಞವಲ್ಕ್ಯ ಸ್ಮೃತಿ: 'ಗ್ರಹಾಧೀನಾ ನರೇಂದ್ರಾಶ್ಚ ಗ್ರಹಾಧೀನಾ ಜಗತ್ಸ್ಥಿತಿಃ | ತಸ್ಮಾತ್ ಗ್ರಹಾಃ ಸದಾ ಪೂಜ್ಯಾಃ ಶಾಂತಿಕಾಮೈರ್ವಿಪಶ್ಚಿತ್ ||'",
    rootCauseKn: "ಅನುಕೂಲವಲ್ಲದ ಗೋಚಾರ ಗ್ರಹ ಸ್ಥಿತಿ, ನೀಚ ಗ್ರಹಗಳ ದಶಾ-ಭುಕ್ತಿ, ಜನ್ಮ ಕುಂಡಲಿಯ ನವಗ್ರಹ ದೋಷ.",
    expectedLifeShiftsKn: [
      "ಶನಿ, ರಾಹು, ಕೇತುಗಳ ಉಗ್ರ ಪ್ರಭಾವ ತಗ್ಗಿ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಮಾಧಾನ ಸಿಗುತ್ತದೆ.",
      "ಆರೋಗ್ಯ, ಉದ್ಯೋಗ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯಲ್ಲಿ ಹಠಾತ್ ಸ್ಥಿರತೆ ಕಂಡುಬರುತ್ತದೆ.",
      "ಕುಟುಂಬದಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದ ನಿರಂತರ ಜಗಳಗಳು ಮತ್ತು ಮನಸ್ತಾಪಗಳು ಶಮನವಾಗುತ್ತವೆ.",
      "ಪ್ರತಿ ಕೆಲಸದಲ್ಲೂ ಮುಗ್ಗರಿಸುತ್ತಿದ್ದ ಪರಿಸ್ಥಿತಿ ಬದಲಾಗಿ ಅದೃಷ್ಟ ಹಾಗೂ ಯಶಸ್ಸು ಕೂಡಿಬರುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ನವಗ್ರಹ ಮಂಡಲ ರಚನೆ, ನವ ಕಲಶ ಸ್ಥಾಪನೆ, ನವಧಾನ್ಯ ಆರಾಧನೆ, ೯ ಗ್ರಹಗಳ ಮಂತ್ರ ಜಪ, ನವಗ್ರಹ ಸಮಿತ್ತುಗಳ ಆಹುತಿ, ಮಹಾ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಗ್ರಹ ದಾನ.",
    havanaSpecialtiesKn: [
      "೯ ಗ್ರಹಗಳ ಸಮಿತ್ತುಗಳು (ಅರ್ಕ, ಪಲಾಶ, ಖದಿರ, ಅಪಾಮಾರ್ಗ, ಅಶ್ವತ್ಥ, ಶಮೀ, ದೂರ್ವಾ, ಕುಶ)",
      "೯ ಬಗೆಯ ಧಾನ್ಯಗಳು (ಗೋಧಿ, ಭತ್ತ, ತೊಗರಿ, ಹೆಸರು, ಕಡಲೆ, ಅವರೇ, ಎಳ್ಳು, ಉದ್ದು, ಹುರುಳಿ)",
      "ಶುದ್ಧ ತುಪ್ಪ ಹಾಗೂ ನವಗ್ರಹ ಪಾಯಸ",
      "ನವಗ್ರಹ ವಸ್ತ್ರಗಳು ಹಾಗೂ ಪ್ರಧಾನ ಆಹುತಿ"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ನವಗ್ರಹ ಸೂಕ್ತ ಪಾರಾಯಣ",
      "ಹೋತೃವಿನಿಂದ ೯ ಸಮಿತ್ತುಗಳ ಪ್ರತ್ಯೇಕ ಆಹುತಿ",
      "ಜಪಕರ್ತೃಗಳಿಂದ ನವಗ್ರಹ ಮೂಲ ಗಾಯತ್ರಿ ಜಪ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ಒಂಬತ್ತೂ ಗ್ರಹಗಳಿಗೆ ಪ್ರತ್ಯೇಕವಾಗಿ ೧,೦೦೮ ಜಪ (ಒಟ್ಟು ೯,೦೦೦+ ಜಪ), ೭ ವಿದ್ವಾಂಸರಿಂದ ನವಗ್ರಹ ಶಾಂತಿ, ಬೆಳ್ಳಿಯ ನವಗ್ರಹ ಮೂರ್ತಿ ದಾನ, ೯ ಬಣ್ಣದ ರೇಷ್ಮೆ ವಸ್ತ್ರ ದಾನ ಹಾಗೂ ೧೦ ಕೆಜಿ ತುಪ್ಪದ ಹವಿಸ್ಸು ಮಾಡಲಾಗುತ್ತದೆ. ಇದು ಎಂತಹ ಪ್ರಬಲ ಗ್ರಹ ದೋಷವನ್ನೂ ಸಂಪೂರ್ಣ ತಟಸ್ಥಗೊಳಿಸುತ್ತದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮೂಲ ಗ್ರಹ ಶಾಂತಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ನವಗ್ರಹ ಹೋಮ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ನವಗ್ರಹ ಮಂತ್ರ ಜಪ",
        durationKn: "೨ ರಿಂದ ೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ನವಗ್ರಹ ಪ್ರಧಾನ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ನವಗ್ರಹ ಯಂತ್ರ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ನವಗ್ರಹ ಸಮಿತ್ತುಗಳು", "ನವಧಾನ್ಯ ಸೆಟ್", "ತಿಲ"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ನವಗ್ರಹಗಳ ಶಾಂತಿಗೆ ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "೯ ಗ್ರಹಗಳ ಶಾಸ್ತ್ರೋಕ್ತ ಸಮಿತ್ತು ಆಹುತಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ನವಧಾನ್ಯ, ಸಮಿತ್ತು & ತುಪ್ಪ", amount: 3500, descriptionKn: "ನವಗ್ರಹ ಸಮಿತ್ತು, ತುಪ್ಪ ೨ ಕೆಜಿ, ನವಧಾನ್ಯ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪ್ರಧಾನ ಆಚಾರ್ಯ ಹಾಗೂ ಸಹಾಯಕ ವಿದ್ವಾಂಸರ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ ಸಿದ್ಧತೆ & ಹೂವು-ಹಣ್ಣು", amount: 2000, descriptionKn: "ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ಹೂವಿನ ಅಲಂಕಾರ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಪೂರ್ಣ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ನವಗ್ರಹ ಮಂತ್ರ ಘೋಷ & ಸಮಗ್ರ ಗ್ರಹ ಹವನ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೪,೫೦೦ ಮಂತ್ರ ಜಪ (ಪ್ರತಿ ಗ್ರಹಕ್ಕೆ ೫೦೦ ಜಪ)",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೯ ನವಗ್ರಹ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ನವಗ್ರಹ ಪ್ರತಿಮೆಗಳು",
        homaDravyasKn: ["೫ ಕೆಜಿ ತುಪ್ಪ", "೯ ಸಮಿತ್ತುಗಳ ದೊಡ್ಡ ಕಟ್ಟುಗಳು", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ಪಾಯಸ"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ೯ ಬಣ್ಣದ ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "೯ ಕಲಶ ಸ್ಥಾಪನೆ ಹಾಗೂ ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನದಿಂದ ಸಾಡೇ ಸಾತಿ ಮತ್ತು ರಾಹು ದೋಷ ಶಮನ.",
        persuasiveAdvantageKn: "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಗ್ರಹಾನುಕೂಲತೆ ದೊರೆಯುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ಸಮಿತ್ತು & ೫ ಕೆಜಿ ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆಗಳು, ತುಪ್ಪ, ನವಗ್ರಹ ಸಮಿತ್ತು, ಧಾನ್ಯ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಮಂಟಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ನವಗ್ರಹ ಮಂಡಲ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ನವಗ್ರಹ ಮಹಾಯಾಗ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ೯,೦೦೦+ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೯,೦೦೦+ ಅಖಂಡ ನವಗ್ರಹ ಜಪ & ಸೂಕ್ತ ಪಾರಾಯಣ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಯಾಗ (೬ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೯ ಮಹಾ ಕಲಶಗಳು + ಪ್ರಧಾನ ಕಲಶ",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ನವಗ್ರಹ ಪ್ರತಿಮೆಗಳು & ಗೋಪೂಜೆ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "೯ ಸಮಿತ್ತುಗಳ ಬೃಹತ್ ರಾಶಿ", "ನವಧಾನ್ಯ ಹವಿಸ್ಸು", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ೯ ಬಣ್ಣದ ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ಅತ್ಯಂತ ತೀವ್ರವಾದ ಸಾಡೇ ಸಾತಿ, ಕಾಳಸರ್ಪ, ಗುರು ಚಾಂಡಾಲ ಹಾಗೂ ಪಂಚಮ ಶನಿ ದೋಷಗಳ ಸಮಗ್ರ ನಿವಾರಣೆಗೆ ಪರಮೋಚ್ಛ ಯಾಗ.",
        persuasiveAdvantageKn: "೯,೦೦೦+ ಜಪಗಳು, ೭ ವಿದ್ವಾಂಸರ ವೇದ ಮಂತ್ರಗಳು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಸಕಲ ಗ್ರಹಗಳೂ ಅನುಗ್ರಹ ನೀಡುತ್ತವೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ೧೦ ಕೆಜಿ ತುಪ್ಪ", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆಗಳು, ರೇಷ್ಮೆ ಶಾಲು, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಸಮಿತ್ತುಗಳು" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ನವಗ್ರಹ ಮಂಡಲ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಡಲ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "n1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ)", quantityKn: "೧ ರಿಂದ ೯ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "n2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೯ ರಿಂದ ೧೮ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "n3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "n4", nameKn: "೯ ಗ್ರಹಗಳ ಪ್ರತ್ಯೇಕ ಸಮಿತ್ತುಗಳು", quantityKn: "೯ ಕಟ್ಟುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "n5", nameKn: "ನವಧಾನ್ಯಗಳು (೯ ಬಗೆಯ ಧಾನ್ಯಗಳು)", quantityKn: "ಪ್ರತಿಯೊಂದೂ ೨೫೦ ಗ್ರಾಂ", source: "devotee", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "n6", nameKn: "ನವಗ್ರಹ ಪ್ರತಿಮೆಗಳು (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೯ ಪ್ರತಿಮೆಗಳು", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "n7", nameKn: "೯ ಬಣ್ಣದ ವಸ್ತ್ರಗಳು (ಗ್ರಹ ವಸ್ತ್ರ)", quantityKn: "೯ ಬಣ್ಣದ ಶಾಲುಗಳು", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" },
      { id: "n8", nameKn: "ಹೂವು, ಹಣ್ಣು, ವೀಳ್ಯದೆಲೆ, ಅಡಿಕೆ", quantityKn: "೯ ಬಗೆಯ ಹಣ್ಣು, ತಾಂಬೂಲ", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  },

  // 8. ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ (Tripindi Shraddha)
  {
    id: "tripindi_shraddha",
    nameKn: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ (ಮೂರು ತಲೆಮಾರುಗಳ ಪಿತೃ ಶ್ರಾದ್ಧ)",
    subtitleKn: "ಪೂರ್ವಿಕರ ಅತೃಪ್ತಿ ನಿವಾರಣೆ, ಸಾತ್ತ್ವಿಕ-ರಾಜಸ-ತಾಮಸ ಪಿತೃ ಮುಕ್ತಿ",
    domain: "pitru",
    icon: "⁂",
    isPopular: false,
    whyNeedThisPoojaKn: "ಮೂರು ತಲೆಮಾರುಗಳ (ತಂದೆ, ಅಜ್ಜ, ಮುತ್ತಜ್ಜ ಹಾಗೂ ತಾಯಿಯ ಕಡೆಯ) ಪೂರ್ವಿಕರಲ್ಲಿ ಯಾರಾದರೂ ತಿಥಿ-ಶ್ರಾದ್ಧವಿಲ್ಲದೆ ತೃಪ್ತಿ ಕಾಣದಿದ್ದರೆ ಉಂಟಾಗುವ ತೀವ್ರ ಪಿತೃ ಬಾಧೆಗೆ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಏಕೈಕ ಪರಮ ಪರಿಹಾರ. ಮೂರು ಪಿಂಡಗಳನ್ನು ಸಾತ್ತ್ವಿಕ (ವಿಷ್ಣು), ರಾಜಸ (ಬ್ರಹ್ಮ) ಹಾಗೂ ತಾಮಸ (ರುದ್ರ) ರೂಪದಲ್ಲಿ ಸಮರ್ಪಿಸಿ ಮುಕ್ತಿ ನೀಡಲಾಗುತ್ತದೆ.",
    shastraReferenceKn: "ಶ್ರಾದ್ಧ ಕಲ್ಪಲತಾ: 'ತ್ರಿಪಿಂಡೀಂ ಯಃ ಪ್ರಕುರ್ವೀತ ವಿಧಿನಾ ಬ್ರಹ್ಮವಾದಿನಃ | ಮುಚ್ಯತೇ ಸರ್ವಪಾಪೇಭ್ಯಃ ಪಿತೃಣಾಮೃಣತಸ್ತಥಾ ||'",
    rootCauseKn: "ಬಹುಕಾಲದಿಂದ ಶ್ರಾದ್ಧ ಮಾಡದಿರುವುದು, ಗೋತ್ರದಲ್ಲಿ ಪಿತೃ ಋಣ ಉಳಿದಿರುವುದು.",
    expectedLifeShiftsKn: [
      "ಮನೆಯಲ್ಲಿ ಬಹುಕಾಲದಿಂದ ನಿಂತಿದ್ದ ಕಾರ್ಯಗಳು ಚುರುಕುಗೊಳ್ಳುತ್ತವೆ.",
      "ಪಿತೃಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದದಿಂದ ಸಂತಾನ ಮತ್ತು ವಿವಾಹ ಯೋಗ ಕೂಡಿಬರುತ್ತದೆ.",
      "ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು ಕರಗಿ ವಂಶದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ನಿವಾಸ ಸ್ಥಿರವಾಗುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ, ತೀರ್ಥ ವಿಧಿ, ತ್ರಿಪಿಂಡಿ ನಿರ್ಮಾಣ, ರುದ್ರ-ಬ್ರಹ್ಮ-ವಿಷ್ಣು ಆರಾಧನೆ, ಪಿಂಡ ಪ್ರದಾನ, ತಿಲ ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ.",
    havanaSpecialtiesKn: [
      "ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ದರ್ಭೆ",
      "ಜವ (ಯವ) ಧಾನ್ಯ ಹಾಗೂ ಅಕ್ಕಿಯ ಹಿಟ್ಟು"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ತ್ರಿಪಿಂಡಿ ವಿಧಿ ಮಂತ್ರ ಪಠಣ",
      "ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಪಿಂಡ ವಿಸರ್ಜನೆ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೭ ವಿದ್ವಾಂಸರು ಅಖಂಡ ಪಿತೃ ಸೂಕ್ತ ಪಾರಾಯಣ ಮಾಡುತ್ತಾರೆ, ಬೆಳ್ಳಿಯ ಮೂರು ಪ್ರತಿಮೆಗಳ ದಾನ ಹಾಗೂ ೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ ನೀಡಲಾಗುತ್ತದೆ. ಇದರಿಂದ ಪಿತೃ ಲೋಕದ ಅತೃಪ್ತ ಆತ್ಮಗಳು ಶಾಶ್ವತ ಶಾಂತಿ ಪಡೆಯುತ್ತವೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮಿತವ್ಯಯ ವಿಧಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ಪಿತೃ ಮಂತ್ರ ಜಪ",
        durationKn: "೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ಪ್ರಧಾನ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ತಿಲ ೧.೫ ಕೆಜಿ", "ಜವ"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ತ್ರಿಪಿಂಡಿ ವಿಧಿ ಪೂರೈಸಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಮೂರು ಪಿಂಡಗಳ ಶಾಸ್ತ್ರೋಕ್ತ ಸಮರ್ಪಣೆ ಸಂಪನ್ನವಾಗುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ತಿಲ & ಜವ", amount: 3500, descriptionKn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಪಿಂಡ ದ್ರವ್ಯ, ಕಲಶ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪುರೋಹಿತರ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕ್ಷೇತ್ರ ಸಿದ್ಧತೆ", amount: 2000, descriptionKn: "ಹೋಮ ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ಮಂತ್ರ ಘೋಷ & ಸಮಗ್ರ ಪಿಂಡ ಶ್ರಾದ್ಧ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೪,೦೦೦ ಮಂತ್ರ ಜಪ & ಪಿತೃ ಸೂಕ್ತ ಪಾರಾಯಣ",
        durationKn: "೪ ರಿಂದ ೫ ಗಂಟೆ",
        kalashaCountKn: "೩ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ತ್ರಿಮೂರ್ತಿ ಪ್ರತಿಮೆಗಳು",
        homaDravyasKn: ["೫ ಕೆಜಿ ತುಪ್ಪ", "೩ ಕೆಜಿ ತಿಲ", "ಅಷ್ಟದ್ರವ್ಯಗಳು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "೪ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಶಕ್ತಿಯಿಂದ ಮೂರು ತಲೆಮಾರುಗಳಿಗೂ ಮುಕ್ತಿ ಲಭಿಸುತ್ತದೆ.",
        persuasiveAdvantageKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ ದಾನ ಹಾಗೂ ಪಿಂಡ ತರ್ಪಣದಿಂದ ವಂಶಕ್ಕೆ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ದೊರೆಯುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ತಿಲ & ೫ ಕೆಜಿ ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆಗಳು, ತುಪ್ಪ, ತಿಲ, ಕಲಶ, ವಸ್ತ್ರ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ", amount: 2500, descriptionKn: "ಮಂಡಲ ರಚನೆ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ತ್ರಿಪಿಂಡಿ ಮಹಾಸಂಕಲ್ಪ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ಸ್ವರ್ಣ-ರಜತ ದಾನ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೮,೦೦೦+ ಮಂತ್ರ ಜಪ & ಚತುರ್ವೇದ ಪಿತೃ ಶಾಂತಿ ಪಾರಾಯಣ",
        durationKn: "೬ ರಿಂದ ೮ ಗಂಟೆ",
        kalashaCountKn: "೬ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಪ್ರತಿಮೆಗಳು & ಗೋಪೂಜೆ",
        homaDravyasKn: ["೮ ಕೆಜಿ ದೇಸಿ ತುಪ್ಪ", "೫ ಕೆಜಿ ತಿಲ", "ಕಸ್ತೂರಿ, ಕೇಸರಿ", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ದೀರ್ಘಕಾಲದ ಪಿತೃ ಶಾಪಗಳನ್ನು ಬುಡಸಮೇತ ಕಿತ್ತೊಗೆಯಲು ಪರಮೋಚ್ಛ ವಿಧಿ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಘೋಷ ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಪಿತೃ ಋಣ ಸಂಪೂರ್ಣ ಪರಿಹಾರವಾಗುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ತುಪ್ಪ", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆಗಳು, ರೇಷ್ಮೆ ಶಾಲು, ತುಪ್ಪ, ತಿಲ, ಜವ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಮಂಡಲ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "t1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ)", quantityKn: "೧ ರಿಂದ ೬ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "t2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೬ ರಿಂದ ೧೨ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "t3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೮ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "t4", nameKn: "ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಜವ ಧಾನ್ಯ", quantityKn: "೨ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "t5", nameKn: "ಹಿಟ್ಟಿನ ಪಿಂಡ ದ್ರವ್ಯಗಳು", quantityKn: "೩ ಪಿಂಡಗಳ ಸೆಟ್", source: "priest", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "t6", nameKn: "ಬಿಳಿ ವಸ್ತ್ರಗಳು & ದಕ್ಷಿಣೆ ತಾಂಬೂಲ", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" }
    ]
  },

  // 9. ತಿಲ ಹೋಮ (Tila Homa)
  {
    id: "tila_homa",
    nameKn: "ತಿಲ ಹೋಮ (ಪಿತೃ ತೃಪ್ತಿ & ಕರ್ಮ ಶಮನ ಹೋಮ)",
    subtitleKn: "ಕಪ್ಪು ಎಳ್ಳಿನ ಅಖಂಡ ಆಹುತಿ, ಪಾಪ ಕ್ಷಯ & ಪಿತೃ ಶಾಂತಿ",
    domain: "pitru",
    icon: "🔥",
    isPopular: false,
    whyNeedThisPoojaKn: "ಪಿತೃಗಳ ಕರ್ಮ ಶೇಷ, ಅಪಮೃತ್ಯು ಭಯ ಹಾಗೂ ಜನ್ಮಾಂತರ ಪಾಪಗಳ ಕಡಿತಕ್ಕಾಗಿ ಕಪ್ಪು ಎಳ್ಳಿನಿಂದ (ತಿಲ) ಮಾಡುವ ಹೋಮ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ. ಅಗ್ನಿದೇವನ ಮುಖಾಂತರ ಪಿತೃಗಳಿಗೆ ತಲುಪುವ ಎಳ್ಳಿನ ಆಹುತಿಯು ಅವರ ಆತ್ಮಗಳನ್ನು ತಣಿಸಿ, ವಂಶಸ್ಥರಿಗೆ ಆಶೀರ್ವಾದವನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    shastraReferenceKn: "ಬೋಧಾಯನ ಗೃಹ್ಯಸೂತ್ರ: 'ತಿಲೈರ್ಹೋಮಂ ಪ್ರಕುರ್ವೀತ ಪಿತೃಣಾಂ ಪ್ರೀತಯೇ ಸದಾ | ಸರ್ವೇ ಕಾಮಾಃ ಸಮೃದ್ಧ್ಯಂತಿ ತಿಲಹೋಮಪ್ರಭಾವತಃ ||'",
    rootCauseKn: "ಪಿತೃ ಕರ್ಮಗಳಲ್ಲಿ ಲೋಪ, ಜಾತಕದಲ್ಲಿ ರಾಹು-ಕೇತು ಪಿತೃ ದೋಷ.",
    expectedLifeShiftsKn: [
      "ಮನಸ್ಸಿನಲ್ಲಿ ನೆಲೆಸಿದ್ದ ನಿಗೂಢ ಪಾಪ ಪ್ರಜ್ಞೆ ಮತ್ತು ಭಯ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.",
      "ಆರೋಗ್ಯದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಂಡುಬಂದು ಹೊಸ ಚೈತನ್ಯ ಲಭಿಸುತ್ತದೆ.",
      "ಪಿತೃಗಳ ಕೃಪೆಯಿಂದ ಮನೆಯಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ, ಪಿತೃ ತರ್ಪಣ, ಅಗ್ನಿ ಪ್ರತಿಷ್ಠೆ, ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ತುಪ್ಪದ ಅಖಂಡ ಆಹುತಿ, ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಸಂತರ್ಪಣೆ.",
    havanaSpecialtiesKn: [
      "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ) ೨ ಕೆಜಿ ಯಿಂದ ೬ ಕೆಜಿ",
      "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ",
      "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ದರ್ಭೆ"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ತಿಲ ಹೋಮ ಮಂತ್ರ ಪಠಣ",
      "ಹೋತೃವಿನಿಂದ ಎಳ್ಳಿನ ಅಖಂಡ ಆಹುತಿ ನಿರ್ವಹಣೆ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೭ ವಿದ್ವಾಂಸರು ೧೦,೦೦೦ ತಿಲ ಆಹುತಿಗಳನ್ನು ಅರ್ಪಿಸುತ್ತಾರೆ, ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನ ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಸಕಲ ಪಾಪಗಳು ಭಸ್ಮವಾಗುತ್ತವೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮಿತವ್ಯಯ ವಿಧಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ತಿಲ ಹೋಮ",
        basePrice: 12000,
        priestCount: 2,
        priestTeamKn: "೨ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧,೦೦೮ ತಿಲ ಮಂತ್ರ ಜಪ",
        durationKn: "೨ ರಿಂದ ೩ ಗಂಟೆ",
        kalashaCountKn: "೧ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೨ ಕೆಜಿ ತುಪ್ಪ", "ತಿಲ ೨ ಕೆಜಿ", "ಪಲಾಶ ಸಮಿತ್ತು"],
        brahmanaBhojanaKn: "೨ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ತಿಲ ಹೋಮ ಪೂರೈಸಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರೋಕ್ತ ತಿಲ ಆಹುತಿ ಸಂಪನ್ನವಾಗುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ತಿಲ, ಸಮಿತ್ತು & ತುಪ್ಪ", amount: 3500, descriptionKn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಕಲಶ, ದರ್ಭೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೨ ವಿದ್ವಾಂಸರು)", amount: 5000, descriptionKn: "ಪುರೋಹಿತರ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 1500, descriptionKn: "೨ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ ಸಿದ್ಧತೆ", amount: 2000, descriptionKn: "ಹೋಮ ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ದೀಪ ವ್ಯವಸ್ಥೆ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೪ ಋತ್ವಿಜರ ಮಂತ್ರ ಘೋಷ & ವಿಸ್ತೃತ ತಿಲ ಹವನ",
        basePrice: 20000,
        priestCount: 4,
        priestTeamKn: "೪ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೪,೦೦೦ ತಿಲ ಮಂತ್ರ ಜಪ",
        durationKn: "೪ ಗಂಟೆ",
        kalashaCountKn: "೨ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೪ ಕೆಜಿ ತುಪ್ಪ", "೪ ಕೆಜಿ ತಿಲ", "ಅಷ್ಟದ್ರವ್ಯಗಳು"],
        brahmanaBhojanaKn: "೪ ಋತ್ವಿಜರು + ೨ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "೪ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ಶಕ್ತಿ ಹಾಗೂ ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ ದಾನದಿಂದ ಪಿತೃ ತೃಪ್ತಿ ಶೀಘ್ರವೇ ಲಭಿಸುತ್ತದೆ.",
        persuasiveAdvantageKn: "ಕುಟುಂಬದ ಸಕಲ ಕರ್ಮದೋಷಗಳು ಶಾಂತವಾಗುತ್ತವೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ತಿಲ & ತುಪ್ಪ", amount: 6500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ತುಪ್ಪ, ತಿಲ, ಕಲಶ, ವಸ್ತ್ರ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೪ ವಿದ್ವಾಂಸರು)", amount: 8000, descriptionKn: "೪ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 3000, descriptionKn: "೬ ಜನರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ" },
          { headKn: "ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ", amount: 2500, descriptionKn: "ಮಂಡಲ ರಚನೆ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ತಿಲ ಮಹಾಯಾಗ",
        taglineKn: "೭ ಋತ್ವಿಜರ ಅಖಂಡ ಜಪ, ೮,೦೦೦+ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 30000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೮,೦೦೦+ ತಿಲ ಮಂತ್ರ ಜಪ & ಸೂಕ್ತ ಪಾರಾಯಣ",
        durationKn: "೬ ಗಂಟೆ",
        kalashaCountKn: "೪ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಪ್ರತಿಮೆ & ಗೋಪೂಜೆ",
        homaDravyasKn: ["೮ ಕೆಜಿ ತುಪ್ಪ", "೬ ಕೆಜಿ ತಿಲ", "ಕಸ್ತೂರಿ, ಕೇಸರಿ", "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಧೋತಿ-ಶಾಲು ದಾನ",
        whyChooseThisTierKn: "ತೀವ್ರ ಕರ್ಮ ಬಂಧನಗಳನ್ನು ಕರಗಿಸಲು ಪರಮೋಚ್ಛ ತಿಲ ಯಾಗ.",
        persuasiveAdvantageKn: "೭ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ತರಂಗಗಳು ಹಾಗೂ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿಯಿಂದ ಶಾಶ್ವತ ಪುಣ್ಯ ಫಲ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ತುಪ್ಪ", amount: 11000, descriptionKn: "ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಶಾಲು, ತುಪ್ಪ, ತಿಲ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12000, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ವಸ್ತ್ರದಾನ", amount: 4500, descriptionKn: "೧೦+ ಜನರಿಗೆ ರಾಜಭೋಗ ಭೋಜನ, ವಸ್ತ್ರದಾನ" },
          { headKn: "ಭವ್ಯ ಮಂಡಲ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "ti1", nameKn: "ಕಲಶ ಪಾತ್ರೆ (ತಾಮ್ರ)", quantityKn: "೧ ರಿಂದ ೪ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ti2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೬ ರಿಂದ ೧೦ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ti3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೮ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "ti4", nameKn: "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ)", quantityKn: "೨ ಕೆಜಿ ಯಿಂದ ೬ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ti5", nameKn: "ಪಲಾಶ ಸಮಿತ್ತು ಹಾಗೂ ದರ್ಭೆ", quantityKn: "೩ ಕಟ್ಟುಗಳು", source: "priest", group: "homa_dravya", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ti6", nameKn: "ಬಿಳಿ ವಸ್ತ್ರಗಳು & ದಕ್ಷಿಣೆ", quantityKn: "೨ ರಿಂದ ೭ ಜೊತೆ", source: "devotee", group: "vastra_prathima", importanceKn: "ದಾನಾರ್ಥ" }
    ]
  },

  // 10. ಶ್ರೀ ಚಂಡಿಕಾ ಹೋಮ (Shri Chandika Homa)
  {
    id: "chandika_homa",
    nameKn: "ಶ್ರೀ ಚಂಡಿಕಾ ಹೋಮ (ದುರ್ಗಾ ಸಪ್ತಶತೀ ಮಹಾಯಾಗ)",
    subtitleKn: "ಸಕಲ ಅಭೀಷ್ಟ ಸಿದ್ಧಿ, ಶತ್ರು ಧ್ವಂಸ, ರಾಜಯೋಗ, ಐಶ್ವರ್ಯ ವೃದ್ಧಿ & ಮಹಾ ರಕ್ಷೆ",
    domain: "devata",
    icon: "🔥",
    isPopular: true,
    whyNeedThisPoojaKn: "ಜಗನ್ಮಾತೆಯಾದ ಚಂಡಿಕಾ ಪರಮೇಶ್ವರಿಯ ಹೋಮವು ವೇದ-ತಂತ್ರ ಶಾಸ್ತ್ರಗಳಲ್ಲಿ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ಮಹಾಯಾಗವೆಂದು ಪ್ರಸಿದ್ಧ. ೭೦೦ ದುರ್ಗಾ ಸಪ್ತಶತೀ ಶ್ಲೋಕಗಳ ಪ್ರತಿಯೊಂದು ಮಂತ್ರಕ್ಕೂ ತುಪ್ಪ, ಪಾಯಸ, ರೇಷ್ಮೆ ಹಾಗೂ ನವರತ್ನಗಳ ಆಹುತಿಯನ್ನು ನೀಡಲಾಗುತ್ತದೆ. ಎಂತಹ ಅಸಾಧ್ಯ ಕಾರ್ಯವೂ ಸಿದ್ಧಿಸಲು, ದಾರಿದ್ರ್ಯ ನಾಶವಾಗಿ ರಾಜವೈಭವ ಲಭಿಸಲು ಚಂಡಿಕಾ ಹೋಮವೇ ಪರಮ ಆಶ್ರಯ.",
    shastraReferenceKn: "ದೇವಿ ಮಹಾತ್ಮ್ಯ (ಮಾರ್ಕಂಡೇಯ ಪುರಾಣ): 'ಸರ್ವಬಾಧಾಪ್ರಶಮನಂ ತ್ರೈಲೋಕ್ಯಸ್ಯಾಖಿಲೇಶ್ವರಿ | ಏವಮೇವ ತ್ವಯಾ ಕಾರ್ಯಮಸ್ಮದ್ವೈರಿವಿನಾಶನಮ್ ||'",
    rootCauseKn: "ಘೋರ ದಾರಿದ್ರ್ಯ, ಅತಿ ತೀವ್ರ ಶತ್ರು ಪೀಡೆ, ದೀರ್ಘಕಾಲದ ದುರದೃಷ್ಟ, ಅಸಾಧ್ಯ ಕಷ್ಟಗಳು.",
    expectedLifeShiftsKn: [
      "ಎಲ್ಲ ರೀತಿಯ ಋಣ, ದಾರಿದ್ರ್ಯ ಹಾಗೂ ಕಷ್ಟಗಳು ಸಂಪೂರ್ಣ ಕರಗಿ ಭಾಗ್ಯೋದಯವಾಗುತ್ತದೆ.",
      "ಶತ್ರುಗಳು, ಅಸೂಯಾಪರರು ಹಾಗೂ ದುಷ್ಟ ಶಕ್ತಿಗಳು ತಾವಾಗಿಯೇ ಶರಣಾಗುತ್ತಾರೆ.",
      "ವ್ಯಾಪಾರ, ರಾಜಕೀಯ, ಉದ್ಯೋಗದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನಮಾನ ಹಾಗೂ ಅಧಿಕಾರ ಯೋಗ ಕೂಡಿಬರುತ್ತದೆ.",
      "ಮನೆಯಲ್ಲಿ ಸದಾ ಧನಧಾನ್ಯ, ಲಕ್ಷ್ಮೀ ಕೃಪೆ ಹಾಗೂ ಪರಮ ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ."
    ],
    sacredProcedureSummaryKn: "ಪುಣ್ಯಾಹವಾಚನ, ಚಂಡಿಕಾ ನವಾಕ್ಷರೀ ಜಪ, ಸಪ್ತಶತೀ ಪಾರಾಯಣ, ಪಾಯಸ-ಘೃತ-ಮೋದಕ ಆಹುತಿ, ಕುಮಾರೀ ಪೂಜೆ, ಸುವಾಸಿನೀ ಪೂಜೆ, ಮಹಾ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ಭಸ್ಮಧಾರಣೆ.",
    havanaSpecialtiesKn: [
      "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ಹಾಗೂ ಕ್ಷೀರ ಪಾಯಸ",
      "ಕೆಂಪು ರೇಷ್ಮೆ ವಸ್ತ್ರ, ಶ್ರೀಫಲ ಹಾಗೂ ಪೂರ್ಣಾಹುತಿ",
      "ಕಸ್ತೂರಿ, ಕೇಸರಿ, ರಕ್ತಚಂದನ, ನವರತ್ನ ರೇಖೆ",
      "ಕುಮಾರೀ ಪೂಜೆ ಹಾಗೂ ಸುವಾಸಿನೀ ಪೂಜೆ ದ್ರವ್ಯಗಳು"
    ],
    priestDutiesKn: [
      "ಆಚಾರ್ಯರಿಂದ ಸಂಪೂರ್ಣ ಸಪ್ತಶತೀ ೧೩ ಅಧ್ಯಾಯಗಳ ಪಾರಾಯಣ",
      "ಹೋತೃವಿನಿಂದ ೭೦೦ ಮಂತ್ರಗಳ ಪ್ರತ್ಯೇಕ ಆಹುತಿ",
      "ಕುಮಾರೀ ಪೂಜೆ ಹಾಗೂ ಸುವಾಸಿನೀ ಆರಾಧನೆ ನಿರ್ವಹಣೆ"
    ],
    whyHighTierGrandImpactKn: "₹30,000 ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ ೭ ಶ್ರೋತ್ರೀಯ ವಿದ್ವಾಂಸರು ಸಂಪೂರ್ಣ ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಾರಾಯಣ ಮಾಡುತ್ತಾರೆ, ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಚಂಡಿಕಾ ಮೂರ್ತಿ ದಾನ, ಕುಮಾರೀ ಪೂಜೆ, ಸುವಾಸಿನೀ ಪೂಜೆ, ೧೦ ಕೆಜಿ ತುಪ್ಪದ ಹವಿಸ್ಸು ಹಾಗೂ ಬೃಹತ್ ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಮಾಡಲಾಗುತ್ತದೆ. ಇದು ಬ್ರಹ್ಮಾಂಡದ ಸಕಲ ಶುಭಗಳನ್ನು ಆಕರ್ಷಿಸುವ ದಿವ್ಯ ಶಕ್ತಿ ಹೊಂದಿದೆ.",
    tiers: {
      low: {
        tier: "low",
        labelKn: "ಸಾಧಾರಣ ಸಂಕಲ್ಪ",
        badgeKn: "ಮೂಲ ಚಂಡಿಕಾ ಶಾಂತಿ",
        taglineKn: "ಸರಳ ಶಾಸ್ತ್ರೋಕ್ತ ನವಾಕ್ಷರೀ ಚಂಡಿಕಾ ಹೋಮ",
        basePrice: 15000,
        priestCount: 3,
        priestTeamKn: "೩ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೨,೫೦೦ ನವಾಕ್ಷರೀ ಮಂತ್ರ ಜಪ",
        durationKn: "೪ ಗಂಟೆ",
        kalashaCountKn: "೧ ಚಂಡಿಕಾ ಪ್ರಧಾನ ಕಲಶ",
        prathimaKn: "ತಾಮ್ರದ ದುರ್ಗಾ ಯಂತ್ರ",
        homaDravyasKn: ["೩ ಕೆಜಿ ತುಪ್ಪ", "ಪಾಯಸ", "ಕುಂಕುಮ", "ಸಮಿತ್ತು"],
        brahmanaBhojanaKn: "೩ ಋತ್ವಿಜರಿಗೆ ಸಾತ್ತ್ವಿಕ ಭೋಜನ & ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಚಂಡಿಕಾ ದೇವಿಯ ಮೂಲ ಆಶೀರ್ವಾದ ಪಡೆಯಲು ಸೂಕ್ತ.",
        persuasiveAdvantageKn: "ಶಾಸ್ತ್ರೋಕ್ತ ನವಾಕ್ಷರೀ ಮಂತ್ರ ಆಹುತಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಸಾಮಗ್ರಿ, ಪಾಯಸ & ತುಪ್ಪ", amount: 4500, descriptionKn: "ಕುಂಕುಮ, ತುಪ್ಪ ೩ ಕೆಜಿ, ಕಲಶ, ಪಾಯಸ, ಸೀರೆ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೩ ವಿದ್ವಾಂಸರು)", amount: 6500, descriptionKn: "೩ ವಿದ್ವಾಂಸರ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ", amount: 2000, descriptionKn: "೩ ಋತ್ವಿಜರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ & ತಾಂಬೂಲ" },
          { headKn: "ಕುಂಡ ಸಿದ್ಧತೆ & ಹೂವು-ಹಣ್ಣು", amount: 2000, descriptionKn: "ಹೋಮ ಕುಂಡ ಸೌದೆ, ರಂಗೋಲಿ, ಹೂವಿನ ಅಲಂಕಾರ" }
        ]
      },
      medium: {
        tier: "medium",
        labelKn: "ಮಧ್ಯಮ ಸಂಕಲ್ಪ",
        badgeKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಸಪ್ತಶತೀ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
        taglineKn: "೫ ಋತ್ವಿಜರ ಸಪ್ತಶತೀ ಪಾರಾಯಣ & ಕುಮಾರೀ ಪೂಜೆ",
        basePrice: 22000,
        priestCount: 5,
        priestTeamKn: "೫ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೫,೦೦೦ ಮಂತ್ರ ಜಪ & ಸಪ್ತಶತೀ ಹವನ",
        durationKn: "೫ ರಿಂದ ೬ ಗಂಟೆ",
        kalashaCountKn: "೩ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಶುದ್ಧ ಬೆಳ್ಳಿಯ ದುರ್ಗಾ ಪ್ರತಿಮೆ",
        homaDravyasKn: ["೬ ಕೆಜಿ ತುಪ್ಪ", "ಕ್ಷೀರ ಪಾಯಸ", "ಅಷ್ಟದ್ರವ್ಯಗಳು", "ರೇಷ್ಮೆ ಸೀರೆ"],
        brahmanaBhojanaKn: "೫ ಋತ್ವಿಜರು + ೩ ಬ್ರಾಹ್ಮಣರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಕುಮಾರೀ ಪೂಜೆ & ವಸ್ತ್ರದಾನ",
        whyChooseThisTierKn: "೫ ವಿದ್ವಾಂಸರ ಸಪ್ತಶತೀ ಪಠಣ ಹಾಗೂ ಬೆಳ್ಳಿ ಮೂರ್ತಿ ದಾನದಿಂದ ಸಕಲ ಅಭೀಷ್ಟ ಸಿದ್ಧಿ.",
        persuasiveAdvantageKn: "ಕುಟುಂಬಕ್ಕೆ ರಾಜಯೋಗ ಹಾಗೂ ಅಪಾರ ಸಂಪತ್ತು ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಸೀರೆ & ೬ ಕೆಜಿ ತುಪ್ಪ", amount: 7500, descriptionKn: "ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ತುಪ್ಪ, ರೇಷ್ಮೆ, ಅಷ್ಟದ್ರವ್ಯ, ಪಾಯಸ" },
          { headKn: "ಋತ್ವಿಕ್ ದಕ್ಷಿಣೆ (೫ ವಿದ್ವಾಂಸರು)", amount: 9000, descriptionKn: "೫ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಭಾವನೆ" },
          { headKn: "ಭೋಜನ, ಕುಮಾರೀ ಪೂಜೆ & ವಸ್ತ್ರದಾನ", amount: 3500, descriptionKn: "೮ ಜನರಿಗೆ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ಕುಮಾರೀ ವಸ್ತ್ರದಾನ" },
          { headKn: "ಮಂಟಪಾಲಂಕಾರ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2000, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕುಂಡ ಸೌದೆ" }
        ]
      },
      high: {
        tier: "high",
        labelKn: "ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ",
        badgeKn: "ಭವ್ಯ ಚಂಡಿಕಾ ಮಹಾಯಾಗ",
        taglineKn: "೭ ಶ್ರೋತ್ರೀಯ ವಿದ್ವಾಂಸರ ೭೦೦ ಸಪ್ತಶತೀ ಆಹುತಿ, ಸ್ವರ್ಣ ದಾನ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ",
        basePrice: 32000,
        priestCount: 7,
        priestTeamKn: "೭ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು",
        japaCountKn: "೧೦,೦೦೦+ ನವಾಕ್ಷರೀ ಜಪ & ಸಂಪೂರ್ಣ ೭೦೦ ಸಪ್ತಶತೀ ಶ್ಲೋಕ ಆಹುತಿ",
        durationKn: "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಯಾಗ (೭ ರಿಂದ ೮ ಗಂಟೆ)",
        kalashaCountKn: "೯ ಮಹಾ ಕಲಶಗಳು",
        prathimaKn: "ಸ್ವರ್ಣ-ರಜತ ಚಂಡಿಕಾ ಪ್ರತಿಮೆ, ಸುವಾಸಿನೀ ಪೂಜೆ & ಗೋಪೂಜೆ",
        homaDravyasKn: ["೧೦ ಕೆಜಿ ಶುದ್ಧ ದೇಸಿ ಹಸುವಿನ ತುಪ್ಪ", "ಬೃಹತ್ ಕ್ಷೀರ ಪಾಯಸ", "ಕಸ್ತೂರಿ, ಕೇಸರಿ", "ರೇಷ್ಮೆ ಸೀರೆ ಪೂರ್ಣಾಹುತಿ", "ಶ್ರೀಫಲ"],
        brahmanaBhojanaKn: "೧೦+ ಬ್ರಾಹ್ಮಣರಿಗೆ ರಾಜಭೋಗ ಮೃಷ್ಟಾನ್ನ ಭೋಜನ, ರೇಷ್ಮೆ ಧೋತಿ-ಶಾಲು ದಾನ, ಕುಮಾರೀ-ಸುವಾಸಿನೀ ದಕ್ಷಿಣೆ",
        whyChooseThisTierKn: "ಜೀವನದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಕೀರ್ತಿ, ಸಕಲ ಶತ್ರು ಜಯ, ಅಗಾಧ ಸಂಪತ್ತು ಹಾಗೂ ಸರ್ವ ಸಿದ್ಧಿಗೆ ಪರಮೋಚ್ಛ ಮಹಾಯಾಗ.",
        persuasiveAdvantageKn: "೭೦೦ ಮಂತ್ರಗಳ ಪ್ರತ್ಯೇಕ ತುಪ್ಪದ ಆಹುತಿ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ ಹಾಗೂ ೭ ವಿದ್ವಾಂಸರ ಮಂತ್ರ ತರಂಗಗಳಿಂದ ಜಗನ್ಮಾತೆಯ ಪ್ರತ್ಯಕ್ಷ ಕೃಪೆ ಲಭಿಸುತ್ತದೆ.",
        costBreakdown: [
          { headKn: "ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ & ೧೦ ಕೆಜಿ ತುಪ್ಪ", amount: 12000, descriptionKn: "ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಸೀರೆ, ೧೦ ಕೆಜಿ ತುಪ್ಪ, ಕಸ್ತೂರಿ, ಕೇಸರಿ" },
          { headKn: "ಋತ್ವಿಕ್ ಮಹಾದಕ್ಷಿಣೆ (೭ ವಿದ್ವಾಂಸರು)", amount: 12500, descriptionKn: "೭ ವೇದ ವಿದ್ವಾಂಸರ ಪೂರ್ಣ ದಕ್ಷಿಣೆ" },
          { headKn: "ಭೋಜನ, ಕುಮಾರೀ-ಸುವಾಸಿನೀ ಪೂಜೆ & ವಸ್ತ್ರದಾನ", amount: 5000, descriptionKn: "೧೦+ ಜನರಿಗೆ ಭೋಜನ, ಕುಮಾರೀ-ಸುವಾಸಿನೀ ದಕ್ಷಿಣೆ & ವಸ್ತ್ರ" },
          { headKn: "ಭವ್ಯ ಪುಷ್ಪ ಮಂಟಪ & ಕ್ಷೇತ್ರ ಸೇವೆ", amount: 2500, descriptionKn: "ವಿಶೇಷ ಮಂಟಪ, ದೀಪಾರಾಧನೆ, ಕ್ಷೇತ್ರ ವ್ಯವಸ್ಥೆ" }
        ]
      }
    },
    samagriList: [
      { id: "ch1", nameKn: "ಕಲಶ ಪಾತ್ರೆಗಳು (ತಾಮ್ರ/ಹಿತ್ತಾಳೆ)", quantityKn: "೧ ರಿಂದ ೯ ಸಂಖ್ಯೆ", source: "priest", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ch2", nameKn: "ತೆಂಗಿನಕಾಯಿಗಳು (ಶ್ರೀಫಲ)", quantityKn: "೮ ರಿಂದ ೧೫ ಕಾಯಿಗಳು", source: "devotee", group: "kalasha_coconut", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ch3", nameKn: "ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ", quantityKn: "೩ ಕೆಜಿ ಯಿಂದ ೧೦ ಕೆಜಿ", source: "priest", group: "homa_dravya", importanceKn: "ಪ್ರಧಾನ ಹವಿಸ್ಸು" },
      { id: "ch4", nameKn: "ರೇಷ್ಮೆ ಸೀರೆ (ದೇವಿಗೆ ಸಮರ್ಪಿಸಲು & ಪೂರ್ಣಾಹುತಿಗೆ)", quantityKn: "೧ ರಿಂದ ೨ ರೇಷ್ಮೆ ಸೀರೆಗಳು", source: "devotee", group: "vastra_prathima", importanceKn: "ಪೂರ್ಣಾಹುತಿ" },
      { id: "ch5", nameKn: "ಚಂಡಿಕಾ ಪ್ರತಿಮೆ (ತಾಮ್ರ/ಬೆಳ್ಳಿ/ಚಿನ್ನ)", quantityKn: "೧ ಪ್ರತಿಮೆ", source: "priest", group: "vastra_prathima", importanceKn: "ವಿಶೇಷ" },
      { id: "ch6", nameKn: "ಕುಂಕುಮ, ಅರಿಶಿನ, ಗಂಧ, ಕಸ್ತೂರಿ", quantityKn: "ಸಂಪೂರ್ಣ ಸೆಟ್", source: "priest", group: "puja_articles", importanceKn: "ಅತ್ಯಗತ್ಯ" },
      { id: "ch7", nameKn: "ಕೆಂಪು ಹೂವುಗಳು, ಕಮಲದ ಹೂವುಗಳು", quantityKn: "೩ ಕೆಜಿ ಹೂವು, ಕಮಲದ ಹೂವು", source: "devotee", group: "fruits_flowers", importanceKn: "ಅತ್ಯಗತ್ಯ" }
    ]
  }
];

/**
 * Intelligent bundle calculator for single or multiple selected poojas.
 * Combines pricing, priest coordination, samagri lists, and transparent breakdowns.
 */
export interface ConsolidatedPoojaPlan {
  selectedPoojas: PoojaEstimateItem[];
  selectedTier: PoojaTier;
  
  // Pricing
  totalIndividualCost: number;
  comboPackageCost: number;
  bundleSavings: number;
  
  // Priests
  totalPriestsCoordinated: number;
  priestTeamSummaryKn: string;
  
  // Duration & Japa
  totalDurationKn: string;
  totalJapaCountKn: string;
  
  // Samagri
  consolidatedSamagriList: SamagriItem[];
  devoteeItems: SamagriItem[];
  priestItems: SamagriItem[];
  
  // Cost breakdown
  consolidatedCostBreakdown: { headKn: string; amount: number; descriptionKn: string }[];
  
  // Why choose ₹30k High standard summary
  whyHighTierPersuasionKn: string;
}

export function computeConsolidatedPoojaPlan(
  poojaIds: string[],
  selectedTier: PoojaTier = "medium"
): ConsolidatedPoojaPlan {
  const selectedPoojas = POOJA_ESTIMATE_CATALOG.filter(p => poojaIds.includes(p.id));
  
  if (selectedPoojas.length === 0) {
    // Fallback to first pooja if empty
    const defaultPooja = POOJA_ESTIMATE_CATALOG[0];
    return computeConsolidatedPoojaPlan([defaultPooja.id], selectedTier);
  }

  // 1. Calculate base sum
  const totalIndividualCost = selectedPoojas.reduce((sum, p) => {
    return sum + p.tiers[selectedTier].basePrice;
  }, 0);

  // 2. Intelligent bundle combo discount when multiple poojas are selected together
  let comboPackageCost = totalIndividualCost;
  let bundleSavings = 0;

  if (selectedPoojas.length === 2) {
    // 10% combo synergy savings due to shared mandapa and synchronized priest team
    comboPackageCost = Math.round((totalIndividualCost * 0.90) / 500) * 500;
    bundleSavings = totalIndividualCost - comboPackageCost;
  } else if (selectedPoojas.length >= 3) {
    // 15% combo synergy savings for 3 or more rituals
    comboPackageCost = Math.round((totalIndividualCost * 0.85) / 500) * 500;
    bundleSavings = totalIndividualCost - comboPackageCost;
  }

  // 3. Priest coordination (Max of rituals + intelligent scaling)
  const maxPriestsInSingle = Math.max(...selectedPoojas.map(p => p.tiers[selectedTier].priestCount));
  const totalPriestsCoordinated = selectedPoojas.length === 1 
    ? maxPriestsInSingle
    : Math.min(maxPriestsInSingle + (selectedPoojas.length - 1), selectedTier === "high" ? 9 : selectedTier === "medium" ? 6 : 4);

  const priestTeamSummaryKn = selectedPoojas.length === 1
    ? selectedPoojas[0].tiers[selectedTier].priestTeamKn
    : `${totalPriestsCoordinated} ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರ ಸಂಘಟಿತ ಮಂಡಳಿ (ಪ್ರಧಾನ ಆಚಾರ್ಯ, ಬ್ರಹ್ಮ, ಹೋತೃ ಹಾಗೂ ಜಪಕರ್ತೃಗಳು)`;

  // 4. Duration & Japa
  const totalDurationKn = selectedPoojas.length === 1
    ? selectedPoojas[0].tiers[selectedTier].durationKn
    : selectedTier === "high" ? "ಪೂರ್ಣ ದಿನದ ಮಹಾ ಕರ್ಮ (೭ ರಿಂದ ೯ ಗಂಟೆ)" : selectedTier === "medium" ? "ಸುಮಾರು ೬ ರಿಂದ ೭ ಗಂಟೆ" : "ಸುಮಾರು ೪ ರಿಂದ ೫ ಗಂಟೆ";

  const totalJapaCountKn = selectedPoojas.length === 1
    ? selectedPoojas[0].tiers[selectedTier].japaCountKn
    : selectedTier === "high" ? "೧೫,೦೦೦+ ಸಂಯುಕ್ತ ಮಹಾ ಸಂಪುಟ ಜಪಗಳು" : selectedTier === "medium" ? "೮,೦೦೦+ ಸಂಯುಕ್ತ ಮಂತ್ರ ಜಪಗಳು" : "೩,೫೦೦+ ಸಂಯುಕ್ತ ಜಪಗಳು";

  // 5. Consolidated Samagri (Deduplicate common items by name)
  const samagriMap = new Map<string, SamagriItem>();
  selectedPoojas.forEach(p => {
    p.samagriList.forEach(item => {
      if (!samagriMap.has(item.nameKn)) {
        samagriMap.set(item.nameKn, { ...item });
      }
    });
  });

  const consolidatedSamagriList = Array.from(samagriMap.values());
  const devoteeItems = consolidatedSamagriList.filter(s => s.source === "devotee");
  const priestItems = consolidatedSamagriList.filter(s => s.source === "priest");

  // 6. Cost breakdown consolidation
  const breakdownMap = new Map<string, { headKn: string; amount: number; descriptionKn: string }>();
  selectedPoojas.forEach(p => {
    p.tiers[selectedTier].costBreakdown.forEach(b => {
      const existing = breakdownMap.get(b.headKn);
      if (existing) {
        existing.amount += b.amount;
      } else {
        breakdownMap.set(b.headKn, { ...b });
      }
    });
  });

  // Apply bundle savings proportionally to breakdown if multi-pooja
  let consolidatedCostBreakdown = Array.from(breakdownMap.values());
  if (bundleSavings > 0) {
    const ratio = comboPackageCost / totalIndividualCost;
    consolidatedCostBreakdown = consolidatedCostBreakdown.map(item => ({
      ...item,
      amount: Math.round((item.amount * ratio) / 100) * 100
    }));
  }

  // 7. High tier persuasion
  const whyHighTierPersuasionKn = selectedPoojas.map(p => p.whyHighTierGrandImpactKn).join(" ");

  return {
    selectedPoojas,
    selectedTier,
    totalIndividualCost,
    comboPackageCost,
    bundleSavings,
    totalPriestsCoordinated,
    priestTeamSummaryKn,
    totalDurationKn,
    totalJapaCountKn,
    consolidatedSamagriList,
    devoteeItems,
    priestItems,
    consolidatedCostBreakdown,
    whyHighTierPersuasionKn
  };
}
