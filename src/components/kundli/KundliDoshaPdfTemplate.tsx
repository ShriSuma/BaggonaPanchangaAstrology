import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type {
  ComprehensiveDoshaReport,
  DetectedDosha,
  DetectedGandantara,
  DetectedFear
} from "../../core/ComprehensiveDoshaEngine";
import { cleanDegreesFromText } from "../../features/premiumPdf/yogaDoshaGocharaEnricher";

export type SupportedLanguage = "kn" | "hi" | "te" | "ta" | "en";

export interface KundliDoshaPdfTemplateProps {
  id?: string;
  report: ComprehensiveDoshaReport;
  lang?: string;
  qrCodeDataUrl?: string;
  overridePriestName?: string;
  overridePriestPhone?: string;
}

// 5-Language UI Localized Dictionary for 4-Page Master Dossier PDF
const PDF_TEXT: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ವಯೋನುಗುಣ ಪರಿಹಾರ ಪತ್ರ",
    page1Title: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ, ಗಂಡಾಂತರ & ವಯೋನುಗುಣ ಪರಿಹಾರ ಪತ್ರ",
    page2Title: "ದ್ವಿತೀಯ ಭಾಗ: ದ್ವಿತೀಯ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ",
    page3Title: "ತೃತೀಯ ಭಾಗ: ಜಾತಕ ರಕ್ಷಾ ಕವಚ, ಗ್ರಹ ಗೋಚಾರ & ದೈವಿಕ ಬಲ",
    page4Title: "ಚತುರ್ಥ ಭಾಗ: ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ, ಮನೋಭಯ ನಿವಾರಣೆ, ಗೋಕರ್ಣ ಸೇವೆಗಳು & ಆಶೀರ್ವಾದ",
    shloka: "॥ ನಮಃ ಸೂರ್ಯಾಯ ಶಾಂತಾಯ ಸರ್ವರೋಗ ನಿವಾರಿಣೇ । ಆಯುರಾರೋಗ್ಯಮೈಶ್ವರ್ಯಂ ದೇಹಿ ದೇವ ಜಗತ್ಪತೇ ॥",
    page2Shloka: "॥ ಸದಾಶಿವೋ ರಕ್ಷತು ಮಾಂ ಪ್ರಪನ್ನಂ । ಗೋಕರ್ಣನಾಥಂ ಶರಣಂ ಪ್ರಪದ್ಯೇ ॥",
    nativeDetails: "ಜಾತಕರ ವಿವರ",
    birthDetails: "ಜನನ ವಿವರ:",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ಚಂದ್ರ ರಾಶಿ:",
    nakshatraLabel: "ನಕ್ಷತ್ರ:",
    dashaLabel: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ-ಭುಕ್ತಿ:",
    currentAgeLabel: "ಪ್ರಸ್ತುತ ವಯಸ್ಸು:",
    ageStageLabel: "ಜೀವನ ಹಂತ:",
    activeDoshasCountLabel: "ಸಕ್ರಿಯ ದೋಷಗಳು:",
    ageStrategyHeading: "⭐ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತಾ ಸೂಚಿ & ತುರ್ತು ಮಾರ್ಗದರ್ಶನ",
    ageStrategyNotice: "ಗಮನಿಸಿ: ದೋಷಗಳನ್ನು ಜಾತಕರ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ತುರ್ತು ಆಧಾರದ ಮೇಲೆ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ (#1, #2, #3...) ಜೋಡಿಸಲಾಗಿದೆ.",
    immediateActionLabel: "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:",
    agePriorityBadgeLabel: "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತೆ",
    technicalRootLabel: "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ:",
    realLifeImpactLabel: "ನೈಜ ಜೀವನದ ಪರಿಣಾಮಗಳು:",
    dashaResonanceLabel: "ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ:",
    pariharaHeading: "ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ:",
    mantraLabel: "ಮಂತ್ರ ಜಪ & ಪರಿಹಾರ ಕ್ರಮ:",
    daanaLabel: "ದಾನ & ಸೇವೆ:",
    noDoshaTitle: "🕊️ ಶುದ್ಧ ನಿರ್ದೋಷ ಜಾತಕ (ದೋಷ ರಹಿತ)",
    noDoshaDesc: "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ಮಾರಕ ಕರ್ಮ ದೋಷಗಳು ಅಥವಾ ಗಂಡಾಂತರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸಕಲ ಶುಭಗಳು ಲಭಿಸಲಿ.",
    secondaryDoshasHeading: "⚡ ದ್ವಿತೀಯ ಕರ್ಮ ದೋಷ ನಿರ್ಣಯ",
    planetaryHarmonyHeading: "🕊️ ಗ್ರಹ ಸಾಮರಸ್ಯ & ದೋಷ ಶಮನ ರಕ್ಷಾ ಕವಚ",
    planetaryHarmonyDesc: "ಜಾತಕದ ಇತರ ಭಾವಗಳು ಮತ್ತು ಗ್ರಹ ಸ್ಥಾನಗಳು ಸುಸ್ಥಿತಿಯಲ್ಲಿದ್ದು, ಪ್ರಮುಖ ಕರ್ಮ ದೋಷಗಳು ಪ್ರಥಮ ಪುಟಗಳಲ್ಲಿ ಆದ್ಯತಾ ಕ್ರಮದಲ್ಲಿ ದಾಖಲಾಗಿವೆ. ಕೆಳಗಿನ ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾ ಪರಿಹಾರಗಳು ಸಕಲ ಶುಭಗಳನ್ನು ತರಲಿವೆ.",
    chartBalanceHeading: "🪐 ಗ್ರಹ ಸ್ಥಿತಿ & ಜಾತಕ ಭಾವ ಪರೀಕ್ಷೆ",
    gandantaraHeading: "⚡ ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ",
    gandantaraNotice: "ಜಲ, ಅಗ್ನಿ, ವಾಹನ, ಸರ್ಪ ಇತ್ಯಾದಿ ಅಪಾಯಗಳ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ಹಾಗೂ ಕಡ್ಡಾಯ ನಿಷೇಧಗಳು",
    safeAgeLimitLabel: "ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ:",
    karmicCauseLabel: "ಕರ್ಮ ಕಾರಣ:",
    mandatoryPrecautionLabel: "ಕಡ್ಡಾಯ ನಿಷೇಧ & ರಕ್ಷಣೆ:",
    protectiveMantraLabel: "ರಕ್ಷಾ ಕವಚ & ಮಂತ್ರ:",
    fearsHeading: "🧠 ಅಂತರ್ಗತ ಮನೋಭಯಗಳು & ನಿವಾರಣಾ ಸಾಧನೆ",
    fearsSubheading: "ಗ್ರಹ ಪ್ರಭಾವದಿಂದ ಉಂಟಾಗುವ ಆಂತರಿಕ ಭಯಗಳ ಶಮನ ಹಾಗೂ ಮನೋಬಲ ವೃದ್ಧಿ",
    symptomLabel: "ಮಾನಸಿಕ ಲಕ್ಷಣ:",
    strengtheningPracticeLabel: "ಮನೋಬಲ ಸಾಧನೆ:",
    templeRemediesHeading: "🪔 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಮಹಾ ಪರಿಹಾರಗಳು",
    priestBlessingHeading: "🙏 ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    priestName: "ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestTitle: "ಪ್ರಧಾನ ಅರ್ಚಕರು, ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ",
    priestPhone: "ದೂರವಾಣಿ: +91 99723 39362",
    sanskritAshirvada: "॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ । ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥",
    ashirvadaMeaning: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹದಿಂದ ಜಾತಕದ ಸಮಸ್ತ ದೋಷಗಳು, ಗಂಡಾಂತರಗಳು ಶಮನವಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸನ್ಮಂಗಳ ಉಂಟಾಗಲಿ ಎಂದು ಆಶೀರ್ವದಿಸಲಾಗಿದೆ.",
    officialSealLabel: "ಅಧಿಕೃತ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    scanToVerify: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ (ಆನ್‌ಲೈನ್ ಪರಿಶೀಲನೆ)",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೧/೪ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೨/೪ (ಮುಂದುವರಿದಿದೆ...)",
    page3Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೩/೪ (ಮುಂದುವರಿದಿದೆ...)",
    page4Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಅಧಿಕೃತ ದೋಷ ಪತ್ರ · ಪುಟ ೪/೪ (ಸಂಪೂರ್ಣ)",
    expectedImprovementHeading: "✨ ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:",
    pillar1Question: "🔍 ೧. ಸಮಸ್ಯೆ ಏನು? (ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ:)",
    pillar2Question: "⚡ ೨. ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ಆಗುತ್ತಿರುವ ತೊಂದರೆಗಳೇನು? (ನೈಜ ಜೀವನದ ಪರಿಣಾಮಗಳು:)",
    pillar3Question: "🪔 ೩. ಪರಿಹಾರದ ಮಾರ್ಗವೇನು? (ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ:)",
    pillar4Question: "✨ ೪. ಪರಿಹಾರದ ನಂತರ ಏನಾಗುತ್ತದೆ? (ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:)",
    ageDirectiveDivider: "❖ ವಯೋನುಗುಣ ಕರ್ಮ ಆದ್ಯತಾ ಮಾರ್ಗದರ್ಶನ ❖",
    protectionShieldDivider: "❖ ಜಾತಕ ರಕ್ಷಾ ಕವಚ & ಗ್ರಹ ಬಲ ❖",
    gandantaraDivider: "❖ ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ & ಮುನ್ನೆಚ್ಚರಿಕೆ ❖",
    fearsAndSevasDivider: "❖ ಅಂತರ್ಗತ ಮನೋಭಯ ನಿವಾರಣೆ & ಗೋಕರ್ಣ ಸೇವೆಗಳು ❖",
    gokarnaProtectionLabel: "🔱 ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ರಕ್ಷಣೆ:",
    gokarnaProtectionDesc: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಲಿಂಗದ ಸನ್ನಿಧಾನದಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ನಿತ್ಯ ಅರ್ಚನೆ, ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋಸೇವೆಯು ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ, ಅಖಂಡ ಶುಭ ಫಲಗಳನ್ನು ತರಲಿದೆ."
  },
  en: {
    templeBanner: "॥ Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga Astrology ॥",
    mainTitle: "Natal Kundli Comprehensive Doshas, Hazards & Age-Adaptive Remedies",
    page1Title: "Natal Kundli Comprehensive Doshas, Hazards & Age-Adaptive Remedies",
    page2Title: "Part II: Secondary Karmic Afflictions & Classical Remedies",
    page3Title: "Part III: Natal Celestial Fortitude, Planetary Transits & Divine Armor",
    page4Title: "Part IV: Life Hazards, Fears Mitigation, Gokarna Temple Sevas & Blessings",
    shloka: "॥ Namah Suryaya Shantaya Sarva Roga Nivarine | Ayur Arogyam Aishwaryam Dehi Deva Jagatpate ॥",
    page2Shloka: "॥ Sadashivo Rakshatu Mam Prapannam | Gokarnanatham Sharanam Prapadye ॥",
    nativeDetails: "Devotee Profile",
    birthDetails: "Birth Details:",
    lagnaLabel: "Lagna (Ascendant):",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Birth Star:",
    dashaLabel: "Running Dasha-Bhukti:",
    currentAgeLabel: "Current Age:",
    ageStageLabel: "Life Phase:",
    activeDoshasCountLabel: "Active Doshas:",
    ageStrategyHeading: "⭐ Age-Adaptive Priority Strategy & Urgent Guidance",
    ageStrategyNotice: "Notice: Doshas are strictly arranged by urgency for your current age phase (#1, #2, #3...).",
    immediateActionLabel: "🎯 Immediate Priority Action (Must Do First):",
    agePriorityBadgeLabel: "Current Age Priority",
    technicalRootLabel: "Classical Astrological Root:",
    realLifeImpactLabel: "Real-World Manifestation:",
    dashaResonanceLabel: "Dasha-Bhukti Resonance:",
    pariharaHeading: "Prescribed Parihara & Gokarna Seva:",
    mantraLabel: "Sacred Mantra & Remedy:",
    daanaLabel: "Charity & Offerings:",
    noDoshaTitle: "🕊️ Pure & Unafflicted Natal Chart",
    noDoshaDesc: "No critical karmic afflictions or life hazards detected. Under divine grace, may life remain peaceful and prosperous.",
    secondaryDoshasHeading: "⚡ Secondary Karmic Afflictions",
    planetaryHarmonyHeading: "🕊️ Planetary Harmony & Karmic Shield",
    planetaryHarmonyDesc: "Other planetary placements and bhavas are well-aligned. The primary karmic obligations are prioritized on preceding pages. Following the protective guidance below ensures comprehensive auspiciousness.",
    chartBalanceHeading: "🪐 Natal Balance & Planetary Fortitude",
    gandantaraHeading: "⚡ Gandantara Hazards & Protective Age Windows",
    gandantaraNotice: "Critical elemental hazard thresholds (Water, Fire, Travel, Serpentine) and required precautions.",
    safeAgeLimitLabel: "Safe Age Threshold:",
    karmicCauseLabel: "Karmic Cause:",
    mandatoryPrecautionLabel: "Mandatory Cautions & Protections:",
    protectiveMantraLabel: "Protective Kavacha & Mantra:",
    fearsHeading: "🧠 Subconscious Innate Fears & Strengthening Practices",
    fearsSubheading: "Planetary root causes of subconscious anxieties and practical methods to cultivate mental fortitude.",
    symptomLabel: "Psychological Symptom:",
    strengtheningPracticeLabel: "Fortitude Practice:",
    templeRemediesHeading: "🪔 Sacred Gokarna Mahabaleshwara Remedies by Life Stage",
    priestBlessingHeading: "🙏 Chief Priest Blessing & Official Temple Seal",
    priestName: "Vedamurthy Shreeram Pandit",
    priestTitle: "Chief Priest & Astrologer, Sri Gokarna Kshetra",
    priestPhone: "Direct Phone: +91 99723 39362",
    sanskritAshirvada: "॥ Sarve Bhavantu Sukhinah Sarve Santu Niramayah | Sarve Bhadrani Pashyantu Ma Kashchid Duhkhabhag Bhavet ॥",
    ashirvadaMeaning: "Blessed with divine longevity, health, and liberation from all karmic afflictions under Sri Mahabaleshwara's grace.",
    officialSealLabel: "Official Temple Seal",
    scanToVerify: "Scan to Verify (Online)",
    page1Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 1/4 (Contd...)",
    page2Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 2/4 (Contd...)",
    page3Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 3/4 (Contd...)",
    page4Footer: "Sri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga · Official Dosha Report · Page 4/4 (Complete)",
    expectedImprovementHeading: "✨ Expected Life Improvement & Positive Transformations:",
    pillar1Question: "🔍 1. What is the Issue? (Classical Astrological Root:)",
    pillar2Question: "⚡ 2. What is it Doing in Life Now? (Real-World Manifestation:)",
    pillar3Question: "🪔 3. What is the Prescribed Solution? (Prescribed Parihara & Gokarna Seva:)",
    pillar4Question: "✨ 4. What Happens After the Remedy? (Expected Life Improvement & Positive Transformations:)",
    ageDirectiveDivider: "❖ Age-Adaptive Karmic Priority Guidance ❖",
    protectionShieldDivider: "❖ Natal Protection Shield & Planetary Strength ❖",
    gandantaraDivider: "❖ Gandantara Safeguards & Age Boundaries ❖",
    fearsAndSevasDivider: "❖ Innate Fears Mitigation & Gokarna Temple Sevas ❖",
    gokarnaProtectionLabel: "🔱 Gokarna Sannidhi Divine Protection:",
    gokarnaProtectionDesc: "Daily archana, Rudrabhishekam, and Go-Seva performed at the sanctum of Sri Gokarna Mahabaleshwara pacify all planetary afflictions and bestow uninterrupted auspicious blessings."
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित समग्र दोष निर्णय, गंडांतर एवं आयु-अनुकूल परिहार पत्र",
    page1Title: "जन्म कुंडली आधारित समग्र दोष निर्णय, गंडांतर एवं आयु-अनुकूल परिहार पत्र",
    page2Title: "द्वितीय भाग: द्वितीयक कर्म दोष विश्लेषण एवं शास्त्रोक्त परिहार",
    page3Title: "तृतीय भाग: जातक रक्षा कवच, ग्रह गोचर एवं दैवीय बल",
    page4Title: "चतुर्थ भाग: गंडांतर संरक्षण, मनोभय निवारण, गोकर्ण सेवा एवं आशीर्वाद",
    shloka: "॥ नमः सूर्याय शांताय सर्वरोग निवारिणे । आयुरारोग्यमैश्वर्यं देहि देव जगत्पते ॥",
    page2Shloka: "॥ सदाशिवो रक्षतु मां प्रपन्नं । गोकर्णनाथं शरणं प्रपद्ये ॥",
    nativeDetails: "जातक विवरण",
    birthDetails: "जन्म विवरण:",
    lagnaLabel: "लग्न:",
    rashiLabel: "चंद्र राशि:",
    nakshatraLabel: "नक्षत्र:",
    dashaLabel: "वर्तमान महादशा-भुक्ति:",
    currentAgeLabel: "वर्तमान आयु:",
    ageStageLabel: "जीवन काल:",
    activeDoshasCountLabel: "सक्रिय दोष:",
    ageStrategyHeading: "⭐ वर्तमान आयु प्राथमिकता एवं त्वरित मार्गदर्शन",
    ageStrategyNotice: "सूचना: दोषों को वर्तमान आयु की अनिवार्यता के अनुसार प्राथमिकता क्रम में व्यवस्थित किया गया है।",
    immediateActionLabel: "🎯 प्रथम कर्तव्य:",
    agePriorityBadgeLabel: "वर्तमान आयु प्राथमिकता",
    technicalRootLabel: "शास्त्रीय तकनीकी कारण:",
    realLifeImpactLabel: "वास्तविक जीवन पर प्रभाव:",
    dashaResonanceLabel: "दशा-भुक्ति प्रभाव:",
    pariharaHeading: "शास्त्रोक्त परिहार एवं गोकर्ण सेवा:",
    mantraLabel: "मंत्र जप एवं विधि:",
    daanaLabel: "दान एवं सेवा:",
    noDoshaTitle: "🕊️ शुद्ध निर्दोष जातक (दोष रहित)",
    noDoshaDesc: "कुंडली में कोई मारक कर्म दोष या गंडांतर नहीं है। ईश्वर की कृपा से जीवन मंगलमय रहे।",
    secondaryDoshasHeading: "⚡ द्वितीयक कर्म दोष निर्णय",
    planetaryHarmonyHeading: "🕊️ ग्रह सामंजस्य एवं दोष शमन रक्षा कवच",
    planetaryHarmonyDesc: "अन्य भाव एवं ग्रह अनुकूल स्थिति में हैं। प्राथमिक कर्म दायित्व पूर्व पृष्ठों पर उल्लिखित हैं। नीचे दिए गए गोकर्ण परिहार अखंड शुभ फल प्रदान करेंगे।",
    chartBalanceHeading: "🪐 ग्रह स्थिति एवं कुंडली भाव परीक्षण",
    gandantaraHeading: "⚡ गंडांतर सुरक्षा एवं संवेद्य आयु सीमा",
    gandantaraNotice: "जल, अग्नि, वाहन, सर्प आदि आपदाओं से रक्षा हेतु संवेद्य आयु सीमा एवं आवश्यक सावधानियां",
    safeAgeLimitLabel: "संवेद्य आयु सीमा:",
    karmicCauseLabel: "कर्म कारण:",
    mandatoryPrecautionLabel: "अनिवार्य सावधानी एवं सुरक्षा:",
    protectiveMantraLabel: "रक्षा कवच एवं मंत्र:",
    fearsHeading: "🧠 आंतरिक मनोभय एवं आत्मबल संवर्धन",
    fearsSubheading: "ग्रह प्रभाव से उत्पन्न अंतर्निहित भय का शमन तथा आत्मबल विकास के उपाय।",
    symptomLabel: "मानसिक लक्षण:",
    strengtheningPracticeLabel: "आत्मबल साधना:",
    templeRemediesHeading: "🪔 श्री गोकर्ण महाबलेश्वर सान्निध्य महा परिहार",
    priestBlessingHeading: "🙏 मुख्य अर्चक आशीर्वाद एवं आधिकारिक सन्निधि मुहर",
    priestName: "वेदामूर्ति श्रीराम पंडित",
    priestTitle: "प्रधान अर्चक, श्री गोकर्ण महाबलेश्वर सन्निधान",
    priestPhone: "दूरभाष: +91 99723 39362",
    sanskritAshirvada: "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग्भवेत् ॥",
    ashirvadaMeaning: "श्री महाबलेश्वर स्वामी के दिव्य अनुग्रह से कुंडली के समस्त दोष व गंडांतर शांत होकर आयु, आरोग्य व सौभाग्य की प्राप्ति हो।",
    officialSealLabel: "आधिकारिक सन्निधि मुहर",
    scanToVerify: "सत्यापन हेतु स्कैन करें",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ १/४ (जारी...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ २/४ (जारी...)",
    page3Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ ३/४ (जारी...)",
    page4Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग · आधिकारिक दोष पत्र · पृष्ठ ४/४ (संपूर्ण)",
    expectedImprovementHeading: "✨ शांति उपरांत अपेक्षित जीवन सुधार एवं शुभ परिणाम:",
    pillar1Question: "🔍 १. समस्या क्या है? (शास्त्रीय तकनीकी कारण:)",
    pillar2Question: "⚡ २. वर्तमान जीवन में क्या प्रभाव पड़ रहा है? (वास्तविक जीवन पर प्रभाव:)",
    pillar3Question: "🪔 ३. समाधान क्या है? (शास्त्रोक्त परिहार एवं गोकर्ण सेवा:)",
    pillar4Question: "✨ ४. शांति के बाद क्या बदलाव आएगा? (शांति उपरांत अपेक्षित जीवन सुधार एवं शुभ परिणाम:)",
    ageDirectiveDivider: "❖ आयोनुरूप कर्म प्राथमिकता मार्गदर्शन ❖",
    protectionShieldDivider: "❖ जातक रक्षा कवच एवं ग्रह बल ❖",
    gandantaraDivider: "❖ गण्डांत सुरक्षा एवं पूर्व चेतावनी ❖",
    fearsAndSevasDivider: "❖ आंतरिक मनोभय निवारण एवं गोकर्ण सेवा ❖",
    gokarnaProtectionLabel: "🔱 गोकर्ण सन्निधि रक्षा:",
    gokarnaProtectionDesc: "श्री गोकर्ण महाबलेश्वर महालिंग के सान्निध्य में नित्य अर्चना, रुद्राभिषेक और गोसेवा जातक के समस्त ग्रह दोषों को शांत कर अखंड शुभ फल प्रदान करती है।"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి సమగ్ర దోష నిర్ణయం, గండాతర & వయోనుగుణ పరిహార పత్రం",
    page1Title: "జన్మ కుండలి సమగ్ర దోష నిర్ణయం, గండాతర & వయోనుగుణ పరిహార పత్రం",
    page2Title: "రెండవ భాగం: ద్వితీయ కర్మ దోష విశ్లేషణ & శాస్త్రోక్త పరిహారాలు",
    page3Title: "మూడవ భాగం: జాతక రక్షా కవచం, గ్రహ గోచారం & దైవిక బలం",
    page4Title: "నాల్గవ భాగం: గండాతర రక్షణ, మనోభయ నివారణ, గోకర్ణ సేవలు & ఆశీర్వాదం",
    shloka: "॥ నమః సూర్యాయ శాంతాయ సర్వరోగ నివారిణే । ఆయురారోగ్యమైశ్వర్యం దేహి దేవ జగత్పతే ॥",
    page2Shloka: "॥ సదాశివో రక్షతు మాం ప్రపన్నం । గోకర్ణనాథం శరణం ప్రపద్యే ॥",
    nativeDetails: "జాతకుని వివరాలు",
    birthDetails: "జన్మ వివరాలు:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "చంద్ర రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "ప్రస్తుత మహాదశ-భుక్తి:",
    currentAgeLabel: "ప్రస్తుత వయస్సు:",
    ageStageLabel: "జీవిత దశ:",
    activeDoshasCountLabel: "సక్రియ దోషాలు:",
    ageStrategyHeading: "⭐ ప్రస్తుత వయస్సు ప్రాధాన్యత & తక్షణ మార్గదర్శనం",
    ageStrategyNotice: "గమనిక: ప్రస్తుత వయస్సు అవసరానికి అనుగుణంగా దోషాలు ప్రాధాన్యతా క్రమంలో అమర్చబడ్డాయి.",
    immediateActionLabel: "🎯 మొదట చేయవలసిన కర్తవ్యం:",
    agePriorityBadgeLabel: "ప్రస్తుత వయస్సు ప్రాధాన్యత",
    technicalRootLabel: "శాస్త్రీయ సాంకేతిక కారణం:",
    realLifeImpactLabel: "నిజ జీవితంలో ప్రభావం:",
    dashaResonanceLabel: "దశా-భుక్తి ప్రభావం:",
    pariharaHeading: "శాస్త్రోక్త పరిహారం & గోకర్ణ సేవ:",
    mantraLabel: "మంత్ర జపం & పరిహార విధి:",
    daanaLabel: "దాన ధర్మాలు & సేవ:",
    noDoshaTitle: "🕊️ నిర్దోష జాతకం (దోష రహితం)",
    noDoshaDesc: "కుండలిలో ఎటువంటి తీవ్ర కర్మ దోషాలు లేదా గండాతరాలు లేవు. దైవానుగ్రహంతో సకల శుభాలు కలుగుగాక.",
    secondaryDoshasHeading: "⚡ ద్వితీయ కర్మ దోష నిర్ణయం",
    planetaryHarmonyHeading: "🕊️ గ్రహ సామరస్యం & రక్షా కవచం",
    planetaryHarmonyDesc: "ఇతర గ్రహ స్థితులు శుభప్రదంగా ఉన్నాయి. ప్రధాన కర్మ బాధ్యతలు మొదటి పేజీలలో సూచించబడ్డాయి. గోకర్ణ మహా పరిహారాలు సకల శుభాలను ప్రసాదిస్తాయి.",
    chartBalanceHeading: "🪐 గ్రహ స్థితి & కుండలి భావ పరీక్ష",
    gandantaraHeading: "⚡ గండాతర రక్షణ & క్లిష్ట వయోపరిమితి",
    gandantaraNotice: "జల, అగ్ని, వాహన, సర్ప ప్రమాదాల సంరక్షణ వయోపరిమితి మరియు జాగ్రత్తలు",
    safeAgeLimitLabel: "రక్షణ వయోపరిమితి:",
    karmicCauseLabel: "కర్మ కారణం:",
    mandatoryPrecautionLabel: "తప్పనిసరి జాగ్రత్తలు & రక్షణ:",
    protectiveMantraLabel: "రక్షా కవచం & మంత్రం:",
    fearsHeading: "🧠 అంతర్గత మనోభయాలు & ఆత్మబల సాధన",
    fearsSubheading: "గ్రహ ప్రభావంతో ఏర్పడే ఆందోళనల నివారణ మరియు మనోధైర్యం పెంచే పద్ధతులు.",
    symptomLabel: "మానసిక లక్షణం:",
    strengtheningPracticeLabel: "మనోబల సాధన:",
    templeRemediesHeading: "🪔 శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధాన మహా పరిహారాలు",
    priestBlessingHeading: "🙏 ప్రధాన అర్చకుల ఆశీర్వచనం & అధికారిక ముద్ర",
    priestName: "వేదమూర్తి శ్రీరామ్ పండిత్",
    priestTitle: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం",
    priestPhone: "ఫోన్: +91 99723 39362",
    sanskritAshirvada: "॥ సర్వే భవంతు సుఖినః సర్వే సంతు నిరామయాః । సర్వే భద్రాణి పశ్యంతు మా కశ్చిద్ దుఃఖభాగ్భవేత్ ॥",
    ashirvadaMeaning: "శ్రీ మహాబలేశ్వర స్వామి అనుగ్రహంతో సమస్త దోషాలు తొలగి, ఆయురారోగ్యాలు సిద్ధించుగాక.",
    officialSealLabel: "అధికారిక సన్నిధి ముద్ర",
    scanToVerify: "స్కాన్ చేయండి (ధృవీకరణ)",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 1/4 (కొనసాగింపు...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 2/4 (కొనసాగింపు...)",
    page3Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 3/4 (కొనసాగింపు...)",
    page4Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · అధికారిక దోష పత్రం · పేజీ 4/4 (సంపూర్ణం)",
    expectedImprovementHeading: "✨ పరిహారం తర్వాత ఆశించే శుభ పరిణామాలు & అభివృద్ధి:",
    pillar1Question: "🔍 1. సమస్య ఏమిటి? (శాస్త్రీయ సాంకేతిక కారణం:)",
    pillar2Question: "⚡ 2. ప్రస్తుత జీవితంలో ఏమి జరుగుతోంది? (నిజ జీవితంలో ప్రభావం:)",
    pillar3Question: "🪔 3. పరిష్కారం ఏమిటి? (శాస్త్రోక్త పరిహారం & గోకర్ణ సేవ:)",
    pillar4Question: "✨ 4. పరిహారం తర్వాత ఏమి జరుగుతుంది? (పరిహారం తర్వాత ఆశించే శుభ పరిణామాలు & అభివృద్ధి:)",
    ageDirectiveDivider: "❖ వయోనుగుణ కర్మ ప్రాధాన్యతా మార్గదర్శనం ❖",
    protectionShieldDivider: "❖ జాతక రక్షా కవచం & గ్రహ బలం ❖",
    gandantaraDivider: "❖ గండాంతర సంరక్షణ & ముందస్తు హెచ్చరిక ❖",
    fearsAndSevasDivider: "❖ అంతర్గత మనోభయ నివారణ & గోకర్ణ సేవలు ❖",
    gokarnaProtectionLabel: "🔱 గోకర్ణ సన్నిధి రక్షణ:",
    gokarnaProtectionDesc: "శ్రీ గోకర్ణ మహాబలేశ్వర మహాలింగ సన్నిధానంలో నిర్వహించే నిత్య అర్చన, రుద్రాభిషేకం మరియు గోసేవ జాతకంలోని సమస్త గ్రహ దోషాలను శాంతింపజేసి అఖండ శుభ ఫలితాలను ప్రసాదిస్తుంది."
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜன்ம குண்டலி தோஷ ஆய்வு, கண்டாந்தரங்கள் & வயதுக்கேற்ற பரிகார அறிக்கை",
    page1Title: "ஜன்ம குண்டலி தோஷ ஆய்வு, கண்டாந்தரங்கள் & வயதுக்கேற்ற பரிகார அறிக்கை",
    page2Title: "இரண்டாம் பகுதி: இரண்டாம் நிலை தோஷ ஆய்வு & சாஸ்திரோக்த பரிகாரங்கள்",
    page3Title: "மூன்றாம் பகுதி: ஜாதக பாதுகாப்புக் கவசம், கிரக கோசாரம் & தெய்வீக பலம்",
    page4Title: "நான்காம் பகுதி: கண்டாந்தர பாதுகாப்பு, பய நிவாரணம், கோகர்ண சேவைகள் & ஆசி",
    shloka: "॥ நமஃ சூர்யாய சாந்தாய சர்வரோக நிவாரினே । ஆயுராரோக்யமைஸ்வர்யம் தேஹி தேவ ஜகத்பதே ॥",
    page2Shloka: "॥ சதாசிவோ ரக்ஷது மாம் ப்ரபன்னம் । கோகர்ணநாதம் சரணம் ப்ரபத்யே ॥",
    nativeDetails: "ஜாதகர் விவரம்",
    birthDetails: "பிறப்பு விவரம்:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "சந்திர ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "தற்போதைய திசை-புக்தி:",
    currentAgeLabel: "தற்போதைய வயது:",
    ageStageLabel: "வாழ்க்கை பருவம்:",
    activeDoshasCountLabel: "செயலில் உள்ள தோஷங்கள்:",
    ageStrategyHeading: "⭐ வயதுக்கேற்ற முன்னுரிமை & உடனடி வழிகாட்டுதல்",
    ageStrategyNotice: "குறிப்பு: தற்போதைய வயதின் அவசியத்திற்கேற்ப தோஷங்கள் முன்னுரிமை வரிசையில் தரப்பட்டுள்ளன.",
    immediateActionLabel: "🎯 முதலில் செய்ய வேண்டிய கடமை:",
    agePriorityBadgeLabel: "வயதுக்கேற்ற முன்னுரிமை",
    technicalRootLabel: "சாஸ்திர ஜோதிடக் காரணம்:",
    realLifeImpactLabel: "நடைமுறை வாழ்க்கைப் பாதிப்புகள்:",
    dashaResonanceLabel: "திசை-புக்தி தாக்கம்:",
    pariharaHeading: "சாஸ்திரோக்த பரிகாரம் & கோகர்ண சேவை:",
    mantraLabel: "மந்திர ஜபம் & பரிகார முறை:",
    daanaLabel: "தான தர்மங்கள்:",
    noDoshaTitle: "🕊️ களங்கமற்ற சுப ஜாதகம் (தோஷமற்றது)",
    noDoshaDesc: "ஜாதகத்தில் கடுமையான கர்ம தோஷங்களோ கண்டாந்தரங்களோ இல்லை. இறைவன் அருளால் சகல நன்மைகளும் உண்டாகட்டும்.",
    secondaryDoshasHeading: "⚡ இரண்டாம் நிலை கர்ம தோஷங்கள்",
    planetaryHarmonyHeading: "🕊️ கிரக நல்லிணக்கம் & பாதுகாப்புக் கவசம்",
    planetaryHarmonyDesc: "மற்ற கிரக நிலைகளும் சுபமாக உள்ளன. முக்கிய கர்ம பொறுப்புகள் முந்தைய பக்கங்களில் தரப்பட்டுள்ளன. கோகர்ண மகா பரிகாரங்கள் சகல நன்மைகளையும் நல்கும்.",
    chartBalanceHeading: "🪐 கிரக நிலை & ஜாதக பாவ ஆய்வு",
    gandantaraHeading: "⚡ கண்டாந்தரங்கள் & பாதுகாப்பான வயது எல்லை",
    gandantaraNotice: "நீர், நெருப்பு, வாகனம், சர்ப்ப விபத்துக்களிலிருந்து காக்கும் வயது வரம்பு மற்றும் முன்னெச்சரிக்கைகள்",
    safeAgeLimitLabel: "பாதுகாப்பான வயது வரம்பு:",
    karmicCauseLabel: "கர்ம காரணம்:",
    mandatoryPrecautionLabel: "கட்டாய எச்சரிக்கை & பாதுகாப்பு:",
    protectiveMantraLabel: "பாதுகாப்பு கவசம் & மந்திரம்:",
    fearsHeading: "🧠 ஆழ்மன பயங்கள் & மனோபல வளர்ச்சி",
    fearsSubheading: "கிரக தாக்கத்தால் ஏற்படும் உள்மன அச்சங்களை நீக்கி மனோதைரியம் பெருக்கும் முறைகள்.",
    symptomLabel: "மனோதத்துவ அறிகுறி:",
    strengtheningPracticeLabel: "மனோபல சாதனை:",
    templeRemediesHeading: "🪔 ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி மகா பரிகாரங்கள்",
    priestBlessingHeading: "🙏 தலைமை அர்ச்சகர் ஆசீர்வாதம் & சந்நிதி முத்திரை",
    priestName: "வேதமூர்த்தி ஸ்ரீராம் பண்டிதர்",
    priestTitle: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம்",
    priestPhone: "நேரடி அழைப்பு: +91 99723 39362",
    sanskritAshirvada: "॥ சர்வே பவந்து சுகினஃ சர்வே சந்து நிராமயாஃ । சர்வே பத்ராணி பஸ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ॥",
    ashirvadaMeaning: "ஸ்ரீ மகாபலேஸ்வரர் திருவருளால் சகல தோஷங்களும் நீங்கி, நீண்ட ஆயுளும் ஆரோக்கியமும் உண்டாக வாழ்த்துகிறோம்.",
    officialSealLabel: "அதிகாரப்பூர்வ சந்நிதி முத்திரை",
    scanToVerify: "ஸ்கேன் செய்க (சரிபார்ப்பு)",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 1/4 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 2/4 (தொடர்கிறது...)",
    page3Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 3/4 (தொடர்கிறது...)",
    page4Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம் · அதிகாரப்பூர்வ அறிக்கை · பக்கம் 4/4 (முழுமை)",
    expectedImprovementHeading: "✨ பரிகாரத்திற்குப் பின் எதிர்பார்க்கப்படும் நற்பலன்கள் & முன்னேற்றம்:",
    pillar1Question: "🔍 1. பிரச்சனை என்ன? (சாஸ்திர ஜோதிடக் காரணம்:)",
    pillar2Question: "⚡ 2. தற்போதைய வாழ்க்கையில் என்ன பாதிப்பு? (நடைமுறை வாழ்க்கைப் பாதிப்புகள்:)",
    pillar3Question: "🪔 3. இதற்கான தீர்வு என்ன? (சாஸ்திரோக்த பரிகாரம் & கோகர்ண சேவை:)",
    pillar4Question: "✨ 4. பரிகாரத்திற்குப் பின் என்ன நடக்கும்? (பரிகாரத்திற்குப் பின் எதிர்பார்க்கப்படும் நற்பலன்கள் & முன்னேற்றம்:)",
    ageDirectiveDivider: "❖ வயதுக்கேற்ற கர்ம முன்னுரிமை வழிகாட்டுதல் ❖",
    protectionShieldDivider: "❖ ஜாதக பாதுகாப்புக் கவசம் & கிரக பலம் ❖",
    gandantaraDivider: "❖ கண்டாந்தர பாதுகாப்பு & முன்னெச்சரிக்கை ❖",
    fearsAndSevasDivider: "❖ உள்மன பய நிவர்த்தி & கோகர்ண சேவைகள் ❖",
    gokarnaProtectionLabel: "🔱 கோகர்ண சந்நிதி பாதுகாப்பு:",
    gokarnaProtectionDesc: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மகாலிங்கத்தின் சந்நிதியில் செய்யப்படும் நித்திய அர்ச்சனை, ருத்ராபிஷேகம் மற்றும் கோபூஜை ஜாதகத்தின் அனைத்து கிரக தோஷங்களையும் அமைதிப்படுத்தி, முழுமையான சுப பலன்களை வழங்கும்."
  }
};

interface DoshaSnippets {
  part1: string;
  part2: string;
  part3: string;
  part4: string;
  shivaMedallion: string;
  suryaMedallion: string;
  gokarnanathaMedallion: string;
  yearsUnit: string;
  yearsTillUnit: string;
  evaluated: string;
  critical: string;
  moderate: string;
  karmicVulnerability: string;
  subconsciousFear: string;
  subconsciousFearShort: string;
  shantiCompleted: string;
  shantiPrep: string;
  guidance: string;
  guidanceShort: string;
  lagnaFortitude: string;
  chandraFortitude: string;
  suryaFortitudeTitle: string;
  suryaFortitudeDesc: string;
  trikonaFortitudeTitle: string;
  trikonaFortitudeDesc: string;
  pitruBadge: string;
  hazardsActiveSuffix: string;
  allHazardSafe: string;
  noGandantaraDetected: string;
  safeAgePassed: string;
  safeThresholdSurpassedDesc: (age: number) => string;
  parashariProtocol: string;
  parashariRuleDesc: string;
  agePrefix: string;
  ageFocusFallback: string;
  priorityPrefix: string;
  divNative: string;
  divPrimaryDosha: string;
  divSecondaryDosha: string;
  divPriestBlessing: string;
}

const LOCALIZED_SNIPPETS: Record<string, DoshaSnippets> = {
  kn: {
    part1: "ಭಾಗ ೧",
    part2: "ಭಾಗ ೨",
    part3: "ಭಾಗ ೩",
    part4: "ಭಾಗ ೪",
    shivaMedallion: "॥ ಶಿವ ॥",
    suryaMedallion: "॥ ಸೂರ್ಯ ॥",
    gokarnanathaMedallion: "॥ ಗೋಕರ್ಣನಾಥ ॥",
    yearsUnit: "ವರ್ಷ",
    yearsTillUnit: "ವರ್ಷದವರೆಗೆ",
    evaluated: "ಪರಿಶೀಲಿತ ವರ್ಗಗಳು:",
    critical: "ತೀವ್ರ ಬಾಧೆ:",
    moderate: "ಮಧ್ಯಮ ಬಾಧೆ:",
    karmicVulnerability: "ದೋಷ ಸೂಚ್ಯಂಕ:",
    subconsciousFear: "ಆಂತರಿಕ ಮನೋಭಯ & ಚಿಂತೆಗಳು:",
    subconsciousFearShort: "ಆಂತರಿಕ ಮನೋಭಯ:",
    shantiCompleted: "ಶಾಂತಿ ನೆರವೇರಿದ ದೃಢೀಕರಣ:",
    shantiPrep: "ಶಾಂತಿ ಸಿದ್ಧತೆ:",
    guidance: "ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:",
    guidanceShort: "ಮಾರ್ಗದರ್ಶನ:",
    lagnaFortitude: "ಲಗ್ನ ಕೇಂದ್ರವು ಜಾತಕರ ಶಾರೀರಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಜೀವ ಶಕ್ತಿಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಪ್ರಮುಖ ಭಾವಗಳು ರಕ್ಷಿತವಾಗಿವೆ.",
    chandraFortitude: "ಚಂದ್ರ ರಾಶಿ ಮತ್ತು ಮನೋಸ್ಥಿತಿ ಸಮತೋಲನದಲ್ಲಿದ್ದು, ನಿತ್ಯ ಪೂಜೆ ಹಾಗೂ ಈಶ್ವರ ಪ್ರಾರ್ಥನೆಯು ಮಾನಸಿಕ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ.",
    suryaFortitudeTitle: "ಆತ್ಮಕಾರಕ ಸೂರ್ಯ ಬಲ:",
    suryaFortitudeDesc: "ಪೂರ್ವ ಪುಣ್ಯ ಮತ್ತು ಪಿತೃ ಆಶೀರ್ವಾದದ ಪ್ರಭಾವದಿಂದ ಜಾತಕರಿಗೆ ಕಷ್ಟಗಳನ್ನು ಎದುರಿಸುವ ನೈಸರ್ಗಿಕ ಸಂಕಲ್ಪ ಶಕ್ತಿ ಲಭಿಸಿದೆ.",
    trikonaFortitudeTitle: "ತ್ರಿಕೋಣ ಭಾವ ರಕ್ಷಣೆ:",
    trikonaFortitudeDesc: "ಧರ್ಮ ಮತ್ತು ಭಾಗ್ಯ ಸ್ಥಾನಗಳು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ನಿತ್ಯ ಅರ್ಚನೆಯಿಂದ ಸದಾ ಜಾಗೃತವಾಗಿರುತ್ತವೆ.",
    pitruBadge: "🪔 ಪವಿತ್ರ ಪಿತೃ ಋಣ ನಿವಾರಣಾ ವಿಶೇಷ ಆದ್ಯತೆ · ಶ್ರೀ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತಿಲ ಹೋಮ & ನಾರಾಯಣ ಬಲಿ",
    hazardsActiveSuffix: "ಗಂಡಾಂತರಗಳು ಸಕ್ರಿಯ",
    allHazardSafe: "✓ ಸಕಲ ಗಂಡಾಂತರ ವಯೋಮಿತಿ ಸುರಕ್ಷಿತವಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ",
    noGandantaraDetected: "ಯಾವುದೇ ಮಾರಕ ಜಲ-ಅಗ್ನಿ-ಸರ್ಪ ಗಂಡಾಂತರಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಜಾತಕರು ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ.",
    safeAgePassed: "ವಯೋಮಿತಿ ದಾಟಿದೆ",
    safeThresholdSurpassedDesc: (age: number) => `ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ (${age} ವರ್ಷ) ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಈ ಗಂಡಾಂತರದಿಂದ ಜಾತಕರು ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತರಾಗಿದ್ದಾರೆ.`,
    parashariProtocol: "ಪರಾಶರ ಶಾಸ್ತ್ರ ರಕ್ಷಾ ಸೂತ್ರ:",
    parashariRuleDesc: "ಗಂಡಾಂತರ ವಯೋಮಿತಿ ದಾಟುವ ತನಕ ಜಾತಕರಿಗೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.",
    agePrefix: "ವಯಸ್ಸು ",
    ageFocusFallback: "ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಆದ್ಯತೆಯ ಪರಿಹಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಾವಶ್ಯಕ.",
    priorityPrefix: "ಆದ್ಯತೆ #",
    divNative: "❖ ಜಾತಕ ವಿವರ ❖",
    divPrimaryDosha: "❖ ಪ್ರಮುಖ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ ❖",
    divSecondaryDosha: "❖ ದ್ವಿತೀಯ ಕರ್ಮ ಫಲ & ಗ್ರಹ ಸಾಮರಸ್ಯ ❖",
    divPriestBlessing: "❖ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಸನ್ನಿಧಿ ಮುದ್ರೆ ❖"
  },
  hi: {
    part1: "भाग १",
    part2: "भाग २",
    part3: "भाग ३",
    part4: "भाग ४",
    shivaMedallion: "॥ शिव ॥",
    suryaMedallion: "॥ सूर्य ॥",
    gokarnanathaMedallion: "॥ गोकर्णनाथ ॥",
    yearsUnit: "वर्ष",
    yearsTillUnit: "वर्ष की आयु तक",
    evaluated: "परीक्षित वर्ग:",
    critical: "तीव्र बाधा:",
    moderate: "मध्यम बाधा:",
    karmicVulnerability: "कर्म दोष सूचकांक:",
    subconsciousFear: "आंतरिक मनोभय एवं चिंताएं:",
    subconsciousFearShort: "आंतरिक मनोभय:",
    shantiCompleted: "शांति संपन्न प्रमाण:",
    shantiPrep: "शांति तैयारी:",
    guidance: "विशेष मार्गदर्शन:",
    guidanceShort: "मार्गदर्शन:",
    lagnaFortitude: "लग्न केंद्र जातक के शारीरिक स्वास्थ्य और जीवन शक्ति को निर्धारित करता है। प्रमुख भाव सुरक्षित हैं।",
    chandraFortitude: "चंद्र राशि एवं मनोस्थिति संतुलन में है, नित्य पूजा तथा शिव आराधना मानसिक शांति प्रदान करती है।",
    suryaFortitudeTitle: "आत्मकारक सूर्य बल:",
    suryaFortitudeDesc: "पूर्व पुण्य एवं पितृ आशीर्वाद के प्रभाव से जातक को विपत्तियों से लड़ने की स्वाभाविक संकल्प शक्ति प्राप्त है।",
    trikonaFortitudeTitle: "त्रिकोण भाव रक्षा:",
    trikonaFortitudeDesc: "धर्म एवं भाग्य स्थान श्री गोकर्ण महाबलेश्वर के सानिध्य में की जाने वाली नित्य आराधना से सदैव जागृत रहते हैं।",
    pitruBadge: "🪔 पवित्र पितृ ऋण निवारण विशेष प्राथमिकता · श्री गोकर्ण कोटितीर्थ तिल होम एवं नारायण बलि",
    hazardsActiveSuffix: "गंडांतर सक्रिय",
    allHazardSafe: "✓ सभी गंडांतर आयु-सीमाएं सुरक्षित रूप से समाप्त हो चुकी हैं",
    noGandantaraDetected: "कोई घातक जल-अग्नि-सर्प गंडांतर नहीं पाया गया। जातक पूर्णतः सुरक्षित हैं।",
    safeAgePassed: "आयु-सीमा पार हो चुकी है",
    safeThresholdSurpassedDesc: (age: number) => `सुरक्षा आयु-सीमा (${age} वर्ष) सफलतापूर्वक पार हो चुकी है। इस गंडांतर से जातक पूरी तरह सुरक्षित हैं।`,
    parashariProtocol: "पाराशर शास्त्र रक्षा सूत्र:",
    parashariRuleDesc: "गंडांतर आयु सीमा पार करने तक जातक को नित्य रुद्राभिषेक तीर्थ मार्जन, महामृत्युंजय मंत्र जप एवं गोकर्ण क्षेत्र में आयुष्य शांति अनुष्ठान कराना अत्यंत मंगलकारी है।",
    agePrefix: "आयु ",
    ageFocusFallback: "वर्तमान आयु की आवश्यकतानुसार प्राथमिक उपायों का श्रद्धापूर्वक अनुष्ठान करना अत्यंत आवश्यक है।",
    priorityPrefix: "प्राथमिकता #",
    divNative: "❖ जातक विवरण ❖",
    divPrimaryDosha: "❖ प्रमुख कर्म दोष विश्लेषण ❖",
    divSecondaryDosha: "❖ द्वितीय कर्म फल एवं ग्रह सामंजस्य ❖",
    divPriestBlessing: "❖ अर्चक आशीर्वचन एवं सन्निधि मुद्रा ❖"
  },
  en: {
    part1: "Part 1",
    part2: "Part 2",
    part3: "Part 3",
    part4: "Part 4",
    shivaMedallion: "॥ Shiva ॥",
    suryaMedallion: "॥ Surya ॥",
    gokarnanathaMedallion: "॥ Gokarnanatha ॥",
    yearsUnit: "Yrs",
    yearsTillUnit: "Years",
    evaluated: "Evaluated Categories:",
    critical: "Critical Afflictions:",
    moderate: "Moderate Afflictions:",
    karmicVulnerability: "Karmic Vulnerability:",
    subconsciousFear: "Subconscious Fear & Anxiety:",
    subconsciousFearShort: "Subconscious Fear:",
    shantiCompleted: "Remedy Completed:",
    shantiPrep: "Remedy Preparation:",
    guidance: "Special Guidance:",
    guidanceShort: "Guidance:",
    lagnaFortitude: "The Ascendant kendra protects physical vitality, immunity and baseline life fortitude.",
    chandraFortitude: "Lunar dignity preserves cognitive resilience; regular worship and meditation maintain calm clarity.",
    suryaFortitudeTitle: "Sun & Vital Dignity:",
    suryaFortitudeDesc: "Solar fortitude and dharmic inheritance bestow innate will-power to overcome karmic hurdles.",
    trikonaFortitudeTitle: "Trikona Divine Grace:",
    trikonaFortitudeDesc: "Benefic 9th and 5th house trines anchor lasting divine protection under Mahabaleshwara's grace.",
    pitruBadge: "🪔 Sacred Ancestral Karma Priority · Sri Gokarna Kotiteertha Tila Homa & Narayana Bali",
    hazardsActiveSuffix: "Hazards Active",
    allHazardSafe: "✓ All Hazard Windows Safely Surpassed",
    noGandantaraDetected: "No critical life hazards or Gandantaras detected. Devotee is safeguarded.",
    safeAgePassed: "Safe Age Passed",
    safeThresholdSurpassedDesc: (age: number) => `Safe threshold (${age} years) successfully surpassed. Native is fully shielded.`,
    parashariProtocol: "Parashari Hazard Protocol:",
    parashariRuleDesc: "Until the safe age threshold is crossed, daily Mahamrityunjaya chanting, protective sacred ash (Vibhuti), and temple Kavacha are strongly advised.",
    agePrefix: "Age ",
    ageFocusFallback: "It is essential to undertake priority remedial measures aligned with your current life stage.",
    priorityPrefix: "Priority #",
    divNative: "❖ Native Profile ❖",
    divPrimaryDosha: "❖ Primary Karmic Doshas ❖",
    divSecondaryDosha: "❖ Secondary Karmic Impact & Balance ❖",
    divPriestBlessing: "❖ Priest Blessing & Sannidhi Seal ❖"
  },
  te: {
    part1: "భాగం 1",
    part2: "భాగం 2",
    part3: "భాగం 3",
    part4: "భాగం 4",
    shivaMedallion: "॥ శివ ॥",
    suryaMedallion: "॥ సూర్య ॥",
    gokarnanathaMedallion: "॥ గోకర్ణనాథ ॥",
    yearsUnit: "సంవత్సరాలు",
    yearsTillUnit: "సంవత్సరాల వరకు",
    evaluated: "పరిశీలించిన వర్గాలు:",
    critical: "తీవ్ర బాధ:",
    moderate: "మధ్యమ బాధ:",
    karmicVulnerability: "దోష సూచిక:",
    subconsciousFear: "అంతర్గత భయాలు & ఆందోళనలు:",
    subconsciousFearShort: "అంతర్గత భయం:",
    shantiCompleted: "శాంతి పూర్తయిన నిర్ధారణ:",
    shantiPrep: "శాంతి సన్నద్ధత:",
    guidance: "ప్రత్యేక మార్గదర్శకత్వం:",
    guidanceShort: "మార్గదర్శకత్వం:",
    lagnaFortitude: "లగ్న కేంద్రం జాతకుని శారీరక ఆరోగ్యం మరియు ప్రాణశక్తిని నిర్ణయిస్తుంది. ముఖ్య భావాలు రక్షించబడ్డాయి.",
    chandraFortitude: "చంద్ర రాశి మరియు మనఃస్థితి సమతుల్యతలో ఉన్నాయి, నిత్య పూజ మరియు శివారాధన మానసిక ప్రశాంతతను చేకూరుస్తాయి.",
    suryaFortitudeTitle: "ఆత్మకారక సూర్య బలం:",
    suryaFortitudeDesc: "పూర్వ పుణ్యం మరియు పితృ ఆశీర్వాద ప్రభావంతో జాతకునికి కష్టాలను ఎదుర్కొనే సహజ సంకల్ప బలం లభించింది.",
    trikonaFortitudeTitle: "త్రికోణ భావ రక్షణ:",
    trikonaFortitudeDesc: "ధర్మ మరియు భాగ్య స్థానాలు గోకర్ణ మహాబలేశ్వరుని సన్నిధిలో చేసే నిత్య పూజతో సదా రక్షణనిస్తాయి.",
    pitruBadge: "🪔 పవిత్ర పితృ రుణ నివారణ ప్రత్యేక ప్రాధాన్యత · శ్రీ గోకర్ణ కోటితీర్థ తిల హోమం & నారాయణ బలి",
    hazardsActiveSuffix: "గండాంతరాలు చురుకుగా ఉన్నాయి",
    allHazardSafe: "✓ అన్ని గండాంతర వయోపరిమితులు సురక్షితంగా దాటాయి",
    noGandantaraDetected: "ఎటువంటి ప్రాణాంతక జల-అగ్ని-సర్ప గండాంతరాలు లేవు. జాతకుడు సురక్షితంగా ఉన్నాడు.",
    safeAgePassed: "వయోపరిమితి దాటింది",
    safeThresholdSurpassedDesc: (age: number) => `రక్షణ వయోపరిమితి (${age} సం.) విజయవంతంగా దాటింది. ఈ గండాంతరం నుండి జాతకుడు సంపూర్ణంగా సురక్షితం.`,
    parashariProtocol: "పరాశర శాస్త్ర రక్షా సూత్రం:",
    parashariRuleDesc: "గండాంతర వయోపరిమితి దాటే వరకు జాతకునికి నిత్య రుద్రాభిషేక తీర్థ ప్రోక్షణ, మహామృత్యుంజయ మంత్ర జపం మరియు గోకర్ణ సన్నిధిలో ఆయుష్య శాంతి చేయడం అత్యంత శ్రేయస్కరం.",
    agePrefix: "వయస్సు ",
    ageFocusFallback: "ప్రస్తుత వయస్సు అవసరానికి అనుగుణంగా ప్రాధాన్యతా పరిహారాలను ఆచరించడం అత్యంత ఆవశ్యకం.",
    priorityPrefix: "ప్రాధాన్యత #",
    divNative: "❖ జాతక వివరాలు ❖",
    divPrimaryDosha: "❖ ప్రధాన కర్మ దోష విశ్లేషణ ❖",
    divSecondaryDosha: "❖ ద్వితీయ కర్మ ఫలం & గ్రహ సమన్వయం ❖",
    divPriestBlessing: "❖ అర్చకుల ఆశీర్వచనం & సన్నిధి ముద్ర ❖"
  },
  ta: {
    part1: "பகுதி 1",
    part2: "பகுதி 2",
    part3: "பகுதி 3",
    part4: "பகுதி 4",
    shivaMedallion: "॥ சிவ ॥",
    suryaMedallion: "॥ சூர்யா ॥",
    gokarnanathaMedallion: "॥ கோகர்ணநாதர் ॥",
    yearsUnit: "ஆண்டுகள்",
    yearsTillUnit: "ஆண்டுகள் வரை",
    evaluated: "ஆய்வு செய்யப்பட்டவை:",
    critical: "தீவிர பாதிப்பு:",
    moderate: "நடுத்தர பாதிப்பு:",
    karmicVulnerability: "கர்ம தோஷ குறியீடு:",
    subconsciousFear: "ஆழ்மன பயம் & கவலைகள்:",
    subconsciousFearShort: "ஆழ்மன பயம்:",
    shantiCompleted: "பரிகாரம் நிறைவடைந்த உறுதிப்படுத்தல்:",
    shantiPrep: "பரிகார முன்னேற்பாடு:",
    guidance: "சிறப்பு வழிகாட்டுதல்:",
    guidanceShort: "வழிகாட்டுதல்:",
    lagnaFortitude: "லக்ன கேந்திரம் ஜாதகரின் உடல் நலம் மற்றும் ஆயுள் பலத்தை உறுதி செய்கிறது. முக்கிய ஸ்தானங்கள் பாதுகாக்கப்பட்டுள்ளன.",
    chandraFortitude: "சந்திர ராசி மற்றும் மனநிலை சமநிலையில் உள்ளது, தினசரி இறை வழிபாடு மன அமைதியை வழங்கும்.",
    suryaFortitudeTitle: "ஆத்மகாரக சூரிய பலம்:",
    suryaFortitudeDesc: "பூர்வ புண்ணியம் மற்றும் பித்ருக்களின் ஆசியால் தடைகளை வெல்லும் திடசங்கல்ப பலம் கிடைத்துள்ளது.",
    trikonaFortitudeTitle: "திரிகோண ஸ்தான பாதுகாப்பு:",
    trikonaFortitudeDesc: "தர்ம மற்றும் பாக்கிய ஸ்தானங்கள் கோகர்ண மகாபலேஸ்வரரின் அருளால் எப்போதும் பூரண பாதுகாப்பு அளிக்கின்றன.",
    pitruBadge: "🪔 புனித பித்ரு கடன் நிவர்த்தி முன்னுரிமை · ஸ்ரீ கோகர்ண கோடித்தீர்த்த தில ஹோமம் & நாராயண பலி",
    hazardsActiveSuffix: "கண்டாந்தரங்கள் தீவிரமாக உள்ளன",
    allHazardSafe: "✓ அனைத்து கண்டாந்தர ஆபத்து வயது வரம்புகளும் பாதுகாப்பாக கடந்துவிட்டன",
    noGandantaraDetected: "எந்தவித கொடிய நீர்-நெருப்பு-நாக கண்டாந்தரங்களும் இல்லை. ஜாதகர் பாதுகாப்பாக உள்ளார்.",
    safeAgePassed: "பாதுகாப்பான வயது கடந்துவிட்டது",
    safeThresholdSurpassedDesc: (age: number) => `பாதுகாப்பு வயது வரம்பு (${age} ஆண்டுகள்) வெற்றிகரமாக கடக்கப்பட்டது. இந்த கண்டாந்தரத்திலிருந்து ஜாதகர் பூரண பாதுகாப்பில் உள்ளார்.`,
    parashariProtocol: "பராசர சாஸ்திர பாதுகாப்பு சூத்திரம்:",
    parashariRuleDesc: "கண்டாந்தர வயது வரம்பு முடியும் வரை தினமும் ருத்ராபிஷேக தீர்த்தம் தெளித்தல், மகா மிருத்யுஞ்சய மந்திர ஜெபம் மற்றும் கோகர்ண சந்நிதானத்தில் ஆயுஷ்ய சாந்தி செய்வது மிகச் சிறந்தது.",
    agePrefix: "வயது ",
    ageFocusFallback: "தற்போதைய வயதின் தேவைக்கேற்ப முன்னுரிமை பரிகாரங்களைச் செய்வது மிகவும் அவசியம்.",
    priorityPrefix: "முன்னுரிமை #",
    divNative: "❖ ஜாதகர் விவரம் ❖",
    divPrimaryDosha: "❖ முதன்மை கர்ம தோஷ ஆய்வு ❖",
    divSecondaryDosha: "❖ இரண்டாம் நிலை கர்ம பலன் & கிரக சமநிலை ❖",
    divPriestBlessing: "❖ அர்ச்சகர் ஆசி & சந்நிதி முத்திரை ❖"
  }
};

const getAgeStageRemedies = (stage: string, lang: string, hasPitru: boolean) => {
  const titles: Record<string, string[]> = {
    kn: [
      hasPitru ? "ಪವಿತ್ರ ಪಿತೃ ತರ್ಪಣ & ತಿಲ ಹೋಮ" : "ಶ್ರೀ ಮಹಾಗಣಪತಿ & ಮೃತ್ಯುಂಜಯ ಹೋಮ",
      "ರುದ್ರಾಭಿಷೇಕ & ಪಂಚಾಮೃತ ಪೂಜೆ",
      "ಗೋಸೇವೆ & ಅನ್ನದಾನ ಸೇವೆ",
      "ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ & ರಕ್ಷಾ ಕವಚ ಧಾರಣೆ"
    ],
    hi: [
      hasPitru ? "पवित्र पितृ तर्पण एवं तिल होम" : "श्री महागणपति एवं मृत्युंजय होम",
      "रुद्राभिषेक एवं पंचामृत पूजा",
      "गोसेवा एवं अन्नदान सेवा",
      "सिद्ध रुद्राक्ष एवं रक्षा कवच धारण"
    ],
    te: [
      hasPitru ? "పవిత్ర పితృ తర్పణం & తిల హోమం" : "శ్రీ మహాగణపతి & మృత్యుంజయ హోమం",
      "రుద్రాభిషేకం & పంచామృత పూజ",
      "గోసేవ & అన్నదాన సేవ",
      "సిద్ధ రుద్రాక్ష & రక్షా కవచ ధారణ"
    ],
    ta: [
      hasPitru ? "புனித பித்ரு தர்பணம் & தில ஹோமம்" : "ஸ்ரீ மாகணபதி & மிருத்யுஞ்சய ஹோமம்",
      "ருத்ராபிஷேகம் & பஞ்சாமிர்த பூஜை",
      "கோபூஜை & அன்னதான சேவை",
      "சித்த ருத்ராட்சம் & ரட்சா கவசம் அணிதல்"
    ],
    en: [
      hasPitru ? "Sacred Pitru Tarpana & Tila Homa" : "Sri Mahaganapati & Mrityunjaya Homa",
      "Rudrabhisheka & Panchamrita Seva",
      "Go-Seva (Cow Care) & Annadaana",
      "Consecrated Rudraksha & Kavacha"
    ]
  };

  const descs: Record<string, string[]> = {
    kn: [
      hasPitru
        ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪವಿತ್ರ ತಿಲ ಹೋಮ ಹಾಗೂ ನಾರಾಯಣ ಬಲಿಯಿಂದ ಪಿತೃ ಋಣ ನಿವಾರಣೆ."
        : "ಆರಂಭಿಕ ವಿಘ್ನ ನಿವಾರಣೆ, ಆಯುರ್ವೃದ್ಧಿ ಹಾಗೂ ಗ್ರಹ ದೋಷ ಶಮನಕ್ಕಾಗಿ ವಿಶೇಷ ಹೋಮ.",
      "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ನಿತ್ಯ ರುದ್ರಾಭಿಷೇಕ ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ ಮತ್ತು ಶ್ರದ್ಧಾ ಭಕ್ತಿ ಸಮರ್ಪಣೆ.",
      "ಗೋಮಾತೆಗೆ ಸೇವೆ ಹಾಗೂ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಅನ್ನದಾನದ ಮೂಲಕ ಆಧ್ಯಾತ್ಮಿಕ ಪುಣ್ಯ ಸಂಚಯ.",
      "ಮನಸ್ಸಿನ ಶಾಂತಿ, ಪರಮಾತ್ಮನ ಸಾಕ್ಷಾತ್ಕಾರ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಗೆ ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ."
    ],
    hi: [
      hasPitru
        ? "गोकर्ण कोटितीर्थ में पवित्र तिल होम एवं नारायण बलि द्वारा पितृ ऋण निवारण।"
        : "विघ्न निवारण, आयु वृद्धि एवं ग्रह दोष शमन हेतु विशेष होम।",
      "श्री महाबलेश्वर आत्मलिंग पर नित्य रुद्राभिषेक तीर्थ एवं श्रद्धा भक्ति समर्पण।",
      "गोसेवा एवं गोकर्ण क्षेत्र में अन्नदान द्वारा आध्यात्मिक पुण्य संचय।",
      "आत्मिक शांति एवं ईश्वर सान्निध्य हेतु गोकर्ण पूजित रुद्राक्ष धारण।"
    ],
    te: [
      hasPitru
        ? "గోకర్ణ కోటితీర్థంలో పవిత్ర తిల హోమం మరియు నారాయణ బలి ద్వారా పితృ ఋణ నివారణ."
        : "విఘ్న నివారణ, ఆయుర్వృద్ధి మరియు గ్రహ దోష శమనం కొరకు విశేష హోమం.",
      "శ్రీ మహాబలేశ్వర ఆత్మలింగానికి నిత్య రుద్రాభిషేక తీర్థ ప్రోక్షణ మరియు భక్తి సమర్పణ.",
      "గోసేవ మరియు గోకర్ణంలో నిత్యాన్నదానం ద్వారా ఆధ్యాత్మిక పుణ్య సంపాదన.",
      "మనోశాంతి మరియు మోక్ష సాధన కొరకు పవిత్ర రుద్రాక్ష ధారణ."
    ],
    ta: [
      hasPitru
        ? "கோகர்ண கோடிதீர்த்தத்தில் புனித தில ஹோமம் மற்றும் நாராயண பலி மூலம் பித்ரு கடன் நிவர்த்தி."
        : "விக்னங்கள் நீங்கி, ஆயுள் ஆரோக்கியம் பெருக மாகணபதி மற்றும் மிருத்யுஞ்சய ஹோமம்.",
      "ஸ்ரீ மகாபலேஸ்வரர் ஆத்மலிங்கத்திற்கு நித்ய ருத்ராபிஷேக தீர்த்த வழிபாடு.",
      "கோசேவை மற்றும் கோகர்ண சந்நிதியில் அன்னதானம் மூலம் புண்ணிய நற்பேறுகளைப் பெறுதல்.",
      "மன அமைதி, இறை அருள் மற்றும் ஆன்மீக உயர்வுக்கு புனித ருத்ராட்சம் அணிதல்."
    ],
    en: [
      hasPitru
        ? "Tila Homa and Narayana Bali at Gokarna Kotiteertha to dissolve ancestral debts."
        : "Consecrated Homa for obstacle removal, longevity, and vitality.",
      "Daily Rudrabhisheka to Sri Mahabaleshwara Atmalinga for divine healing and peace.",
      "Sacred Cow protection and Annadaana to accumulate dharmic merits and spiritual grace.",
      "Blessed Rudraksha bead consecrated at Gokarna for inner peace and divine connection."
    ]
  };

  const tList = titles[lang] || titles.kn;
  const dList = descs[lang] || descs.kn;
  return [
    { icon: "🪔", title: tList[0], desc: dList[0], isPriority: true },
    { icon: "🌿", title: tList[1], desc: dList[1] },
    { icon: "🐄", title: tList[2], desc: dList[2] },
    { icon: "📿", title: tList[3], desc: dList[3] }
  ];
};

/**
 * Strips redundant duplicate prefixes from text (e.g. duplicate "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:" or "💡 ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:").
 */
function stripDuplicatePrefix(text: string, prefixes: string[]): string {
  let cleaned = (text || "").trim();
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
    }
  }
  return cleaned;
}

// Ultra-Luxury Gold & Parchment Palette
const PARCHMENT_BG = "#FDFBF7"; // Royal warm parchment background
const CARD_BG = "#FFFFFF"; // Clean crisp white card background
const PANEL_WARM = "#FAF7F2"; // Royal warm serene panel
const PANEL_ACCENT = "#FFFBEB"; // Soft amber panel for highlights
const INK_DEEP = "#1C140D"; // Deepest contrast charcoal bronze - zero faint text
const INK_MUTED = "#5C4028"; // Warm sepia brown for subtitles and citations
const GOLD_PRIMARY = "#B45309"; // Regal amber gold
const GOLD_DARK = "#78350F"; // Deep imperial gold / rich maroon
const GOLD_LIGHT = "#E7C68A"; // Delicate golden filigree border
const GOLD_BORDER = "#D97706"; // Crisp royal golden border

function getSeverityLabel(severity: string, code: SupportedLanguage): string {
  const map: Record<string, Record<SupportedLanguage, string>> = {
    critical: {
      kn: "ತೀವ್ರ ದೋಷ",
      hi: "तीव्र दोष",
      en: "Critical Dosha",
      te: "తీవ్ర దోషం",
      ta: "தீவிர தோஷம்"
    },
    high: {
      kn: "ಮಧ್ಯಮ-ತೀವ್ರ",
      hi: "मध्यम-तीव्र",
      en: "High Priority",
      te: "మధ్యమ-తీవ్రం",
      ta: "நடுத்தர-தீவிரம்"
    },
    moderate: {
      kn: "ಮಧ್ಯಮ ದೋಷ",
      hi: "मध्यम दोष",
      en: "Moderate Dosha",
      te: "మధ్యమ దోషం",
      ta: "நடுத்தர தோஷம்"
    },
    low: {
      kn: "ಸಾಮಾನ್ಯ ದೋಷ",
      hi: "सामान्य दोष",
      en: "Mild Dosha",
      te: "సాధారణ దోషం",
      ta: "சாதாரண தோஷம்"
    }
  };
  return map[severity]?.[code] || map.critical[code] || "Critical Dosha";
}

const FEAR_SEVERITY_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  high: {
    kn: "ತೀವ್ರ ಭಯ",
    hi: "तीव्र भय",
    te: "తీవ్ర భయం",
    ta: "தீவிர பயம்",
    en: "High"
  },
  moderate: {
    kn: "ಮಧ್ಯಮ ಭಯ",
    hi: "मध्यम भय",
    te: "మధ్యమ భయం",
    ta: "நடுத்தர பயம்",
    en: "Moderate"
  },
  mild: {
    kn: "ಸಾಮಾನ್ಯ ಭಯ",
    hi: "सामान्य भय",
    te: "సాధారణ భయం",
    ta: "சாதாரண பயம்",
    en: "Mild"
  }
};

function getFearSeverityLabel(severity: string, code: SupportedLanguage): string {
  return FEAR_SEVERITY_LABELS[severity]?.[code] || FEAR_SEVERITY_LABELS.moderate[code] || severity;
}

const SCRIPTURAL_REF_5LANG: Record<string, Record<SupportedLanguage, string>> = {
  pitru_dosha: {
    kn: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಪಿತೃದೋಷಾಧ್ಯಾಯ",
    hi: "बृहत् पराशर होरा शास्त्र, पितृदोषाध्याय",
    te: "బృహత్ పరాశర హోరా శాస్త్రం, పితృదోషాధ్యాయం",
    ta: "பிருஹத் பராசர ஹோரா சாஸ்திரம், பித்ரு தோஷாத்தியாயம்",
    en: "BPHS, Pitru Dosha Adhyaya"
  },
  narayana_bali: {
    kn: "ಗರುಡ ಪುರಾಣ, ಪ್ರೇತ ಕಲ್ಪ & ಧರ್ಮಸಿಂಧು",
    hi: "गरुड़ पुराण, प्रेत कल्प एवं धर्मसिंधु",
    te: "గరుడ పురాణం, ప్రేత కల్పం & ధర్మసింధు",
    ta: "கருட புராணம், பிரேத கல்பம் & தர்மசிந்து",
    en: "Garuda Purana & Dharmasindhu"
  },
  kala_sarpa: {
    kn: "ಹೋರಾ ಸಾರ & ಭೃಗು ಸಂಹಿತಾ",
    hi: "होरा सार एवं भृगु संहिता",
    te: "హోరా సార & భృగు సంహిత",
    ta: "ஹோரா சாரம் & பிருகு சம்ஹிதை",
    en: "Horasara & Bhrigu Samhita"
  },
  kala_sarpa_dosha: {
    kn: "ಹೋರಾ ಸಾರ & ಭೃಗು ಸಂಹಿತಾ",
    hi: "होरा सार एवं भृगु संहिता",
    te: "హೋరా సార & భೃగు సంహిత",
    ta: "ஹோரா சாரம் & பிருகு சம்ஹிதை",
    en: "Horasara & Bhrigu Samhita"
  },
  guru_chandala: {
    kn: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಯೋಗಾಧ್ಯಾಯ",
    hi: "बृहत् पराशर होरा शास्त्र, योगाध्याय",
    te: "బృహత్ పరాశర హోరా శాస్త్రం, యోగాధ్యాయం",
    ta: "பிருஹத் பராசர ஹோரா சாஸ்திரம், யோகாத்தியாயம்",
    en: "BPHS, Yogadhyaya"
  },
  guru_chandal_dosha: {
    kn: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಯೋಗಾಧ್ಯಾಯ",
    hi: "बृहत् पराशर होरा शास्त्र, योगाध्याय",
    te: "బృహత్ పరాశర హోరా శాస్త్రం, యోగాధ్యాయం",
    ta: "பிருஹத் பராசர ஹோரா சாஸ்திரம், யோகாத்தியாயம்",
    en: "BPHS, Yogadhyaya"
  },
  balarishta: {
    kn: "ಫಲದೀಪಿಕಾ, ಬಾಲಾರಿಷ್ಟಾಧ್ಯಾಯ",
    hi: "फलदीपिका, बालारिष्टाध्याय",
    te: "ఫలదీపిక, బాలారిష్టాధ్యాయం",
    ta: "பலதீபிகை, பாலாரிஷ்டாத்தியாயம்",
    en: "Phaladeepika, Balarishta Adhyaya"
  },
  balyagraha: {
    kn: "ಸುಶ್ರುತ ಸಂಹಿತಾ & ಆಯುರ್ವೇದ ಜ್ಯೋತಿಷ",
    hi: "सुश्रुत संहिता एवं आयुर्वेद ज्योतिष",
    te: "సుశ్రుత సంహిత & ఆయుర్వేద జ్యోతిష్యం",
    ta: "சுஸ்ருத சம்ஹிதை & ஆயுர்வேத ஜோதிடம்",
    en: "Sushruta Samhita & Ayurvedic Jyotisha"
  },
  kuja_dosha: {
    kn: "ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ & ಪರಾಶರ ಸಂಹಿತಾ",
    hi: "मुहूर्त चिंतामणि एवं पराशर संहिता",
    te: "ముహూర్త చింతామణి & పరాశర సంహిత",
    ta: "முகூர்த்த சிந்தாமணி & பராசர சம்ஹிதை",
    en: "Muhurtha Chintamani & Parashara"
  },
  grahan_dosha: {
    kn: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಗ್ರಹಣ ದೋಷಾಧ್ಯಾಯ",
    hi: "बृहत् पराशर होरा शास्त्र, ग्रहण दोषाध्याय",
    te: "బృహత్ పరాశర హోరా శాస్త్రం, గ్రహణ దోషాధ్యాయం",
    ta: "பிருஹத் பராசர ஹோரா சாஸ்திரம், கிரகண தோஷாத்தியாயம்",
    en: "BPHS, Grahan Adhyaya"
  },
  shrapit_dosha: {
    kn: "ಭೃಗು ಸಂಹಿತಾ, ಶ್ರಪಿತ ಕುಂಡಲಿ ಯೋಗಾಧ್ಯಾಯ",
    hi: "भृगु संहिता, शापित कुंडली योगाध्याय",
    te: "భృగు సంహిత, శ్రాపిత కుండలి యోగాధ్యాయం",
    ta: "பிருகு சம்ஹிதை, சாபித குண்டலி யோகாத்தியாயம்",
    en: "Bhrigu Samhita, Shrapit Yoga"
  },
  kemadruma_dosha: {
    kn: "ಜಾತಕ ಪಾರಿಜಾತ & ಫಲದೀಪಿಕಾ",
    hi: "जातक पारिजात एवं फलदीपिका",
    te: "జాతక పారిజాతం & ఫలదీపిక",
    ta: "ஜாதக பாரிஜாதம் & பலதீபிகை",
    en: "Jataka Parijata & Phaladeepika"
  },
  gandanta_dosha: {
    kn: "ನಾರದ ಸಂಹಿತಾ & ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಗಂಡಾಂತಾಧ್ಯಾಯ",
    hi: "नारद संहिता एवं पराशर होरा शास्त्र, गंडांताध्याय",
    te: "నారద సంహిత & పరాశర హోరా శాస్త్రం, గండాంతాధ్యాయం",
    ta: "நாரத சம்ஹிதை & பராசர ஹோரா சாஸ்திரம், கண்டாந்தாத்தியாயம்",
    en: "Narada Samhita & BPHS"
  },
  dasha_sandhi: {
    kn: "ಫಲದೀಪಿಕಾ, ದಶಾಫಲಾಧ್ಯಾಯ",
    hi: "फलदीपिका, दशाफलाध्याय",
    te: "ఫలదీపిక, దశాఫలాధ్యాయం",
    ta: "பலதீபிகை, தசாபலாத்தியாயம்",
    en: "Phaladeepika, Dasha Phala Adhyaya"
  },
  gochara_shani: {
    kn: "ಬೃಹತ್ ಸಂಹಿತಾ & ಗೋಚಾರ ಫಲಾದ್ಯಾಯ",
    hi: "बृहत् संहिता एवं गोचर फलाध्याय",
    te: "బృహత్ సంహిత & గోచార ఫలాధ్యాయం",
    ta: "பிருஹத் சம்ஹிதை & கோசார பலாத்தியாயம்",
    en: "Brihat Samhita & Gochara Phala"
  },
  shani_sade_sati: {
    kn: "ಬೃಹತ್ ಸಂಹಿತಾ & ಗೋಚಾರ ಫಲಾದ್ಯಾಯ",
    hi: "बृहत् संहिता एवं गोचर फलाध्याय",
    te: "బృహత్ సంహిత & గోచార ఫలాధ్యాయం",
    ta: "பிருஹத் சம்ஹிதை & கோசார பலாத்தியாயம்",
    en: "Brihat Samhita & Gochara Phala"
  },
  gochara_guru: {
    kn: "ಫಲದೀಪಿಕಾ & ಬೃಹತ್ ಸಂಹಿತಾ - ಗೋಚಾರ ಫಲ",
    hi: "फलदीपिका एवं बृहत् संहिता - गोचर फल",
    te: "ఫలదీపిక & బృహత్ సంహిత - గోచార ఫలం",
    ta: "பலதீபிகை & பிருஹத் சம்ஹிதை - கோசார பலன்",
    en: "Phaladeepika Ch. 26"
  },
  gochara_rahu_ketu: {
    kn: "ಜಾತಕ ಪಾರಿಜಾತ & ನಾರದ ಸಂಹಿತಾ",
    hi: "जातक पारिजात एवं नारद संहिता",
    te: "జాతక పారిజాతం & నారద సంహిత",
    ta: "ஜாதக பாரிஜாதம் & நாரத சம்ஹிதை",
    en: "Jataka Parijata"
  },
  tithi_shunya_dosha: {
    kn: "ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ & ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ",
    hi: "मुहूर्त चिंतामणि एवं बृहत् पराशर होरा शास्त्र",
    te: "ముహూర్త చింతామణి & బృహత్ పరాశర హోరా శాస్త్రం",
    ta: "முகூர்த்த சிந்தாமணி & பிருஹத் பராசர ஹோரா சாஸ்திரம்",
    en: "Muhurtha Chintamani"
  },
  panchanga_yoga_dosha: {
    kn: "ಕಾಳಾಮೃತ & ನಾರದ ಸಂಹಿತಾ - ಯೋಗಾಧ್ಯಾಯ",
    hi: "कालामृत एवं नारद संहिता - योगाध्याय",
    te: "కాలామృతం & నారద సంహిత - యోగాధ్యాయం",
    ta: "காலாமிர்தம் & நாரத சம்ஹிதை - யோகாத்தியாயம்",
    en: "Kalamrita & Narada Samhita"
  },
  panchanga_karana_dosha: {
    kn: "ಮುಹೂರ್ತ ಗಣಪತಿ & ನಾರದ ಸಂಹಿತಾ",
    hi: "मुहूर्त गणपति एवं नारद संहिता",
    te: "ముహూర్త గణపతి & నారద సంహిత",
    ta: "முகூர்த்த கணபதி & நாரத சம்ஹிதை",
    en: "Muhurtha Ganapati"
  }
};

function getScripturalReference(doshaId: string, rawRef: string | undefined, code: SupportedLanguage): string {
  const normId = (doshaId || "").toLowerCase().replace(/-/g, "_");
  const found = SCRIPTURAL_REF_5LANG[normId];
  if (found && found[code]) return found[code];
  if (!rawRef) return "";
  if (code === "en") {
    const enMatch = rawRef.match(/\(([^)]+)\)/);
    return enMatch ? enMatch[1].trim() : rawRef;
  }
  if (code === "kn") {
    return rawRef.replace(/\([^)]+\)/g, "").trim() || rawRef;
  }
  const enMatch = rawRef.match(/\(([^)]+)\)/);
  return enMatch ? enMatch[1].trim() : rawRef;
}

function getExpectedImprovementAfterParihara(doshaId: string, lang: SupportedLanguage): string {
  const improvements: Record<string, Record<SupportedLanguage, string>> = {
    pitru_dosha: {
      kn: "ಪಿತೃ ಶಾಂತಿ ಮತ್ತು ತರ್ಪಣದಿಂದ ವಂಶಪಾರಂಪರ್ಯ ಕರ್ಮಋಣ ಕರಗಿ, ನಿಂತುಹೋಗಿದ್ದ ಶುಭ ಕಾರ್ಯಗಳು, ಸ್ಥಿರಾಸ್ತಿ ವಿವಾದಗಳು ಹಾಗೂ ವೃತ್ತಿ ಅಡೆತಡೆಗಳು ಸುಲಭವಾಗಿ ಶಮನಗೊಳ್ಳುತ್ತವೆ. ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ, ಸಂತಾನ ಸೌಖ್ಯ, ಆರೋಗ್ಯ ಮತ್ತು ಪಿತೃಗಳ ಅಖಂಡ ದಿವ್ಯ ರಕ್ಷಣೆ ಸದಾ ಲಭಿಸಿ ಅಚಲ ಆತ್ಮವಿಶ್ವಾಸ ಮೂಡುತ್ತದೆ.",
      hi: "पितृ शांति एवं तर्पण से वंशानुगत कर्म ऋण शांत होकर रुके हुए मांगलिक कार्य, पारिवारिक गतिरोध एवं आजीविका की अड़चनें दूर होंगी। घर में सुख-शांति, वंश वृद्धि और पितरों का दिव्य आशीर्वाद प्राप्त होगा।",
      en: "Through sacred Pitru Shanti and Tarpanam, ancestral karmic debts dissolve. Stalled auspicious ceremonies, property disputes, and career stagnations clear away. Enduring domestic peace, progeny blessings, and divine ancestral protection flow abundantly.",
      te: "పితృ శాంతి మరియు తర్పణాల ద్వారా పూర్వీకుల కర్మ రుణాలు తొలగిపోయి, నిలిచిపోయిన శుభకార్యాలు మరియు ఆస్తి వివాదాలు పరిష్కారమవుతాయి. సంతాన సౌఖ్యం, ఆరోగ్యం మరియు పితృదేవతల రక్షణ చేకూరుతాయి.",
      ta: "பித்ரு சாந்தி மற்றும் தர்ப்பண வழிபாட்டால் முன்னோர்களின் கர்ம வினைகள் நீங்கி, தடைபட்ட சுபகாரியங்கள் மற்றும் குடும்ப சச்சரவுகள் அகலும். சந்தான பாக்கியமும் பித்ருக்களின் ஆசியும் நிறையும்."
    },
    narayana_bali: {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ಶಾಂತಿ ನೆರವೇರಿಸಿದ ತಕ್ಷಣವೇ ಅಗೋಚರ ಪಿತೃಶಾಪ, ಅತೃಪ್ತ ಆತ್ಮಗಳ ಬಾಧೆ ಹಾಗೂ ನಿರಂತರ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳು ಶಾಂತವಾಗಿ, ಕುಟುಂಬದಲ್ಲಿ ಅಖಂಡ ದೈವಿಕ ರಕ್ಷಣೆ, ನವಚೈತನ್ಯ ಹಾಗೂ ಸಂತಾನ-ಆಸ್ತಿ ಅಭಿವೃದ್ಧಿ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      hi: "श्री गोकर्ण क्षेत्र में नारायण बलि अनुष्ठान संपन्न होते ही अतृप्त पितृ बाधा एवं अदृश्य नकारात्मक ऊर्जा शांत होकर परिवार में सुरक्षा कवच, सुख-शांति तथा संतान व संपत्ति की वृद्धि होती है।",
      en: "Performing sacred Narayana Bali at Sri Gokarna Kshetra immediately pacifies unfulfilled ancestral energies and hidden psychic turbulence, bestowing complete family protection, vibrant health, and lineage prosperity.",
      te: "గోకర్ణ క్షేత్రంలో నారాయణ బలి పూజ చేయడం ద్వారా అదృశ్య పితృ దోషాలు మరియు ప్రతికూల శక్తులు శాంతించి, కుటుంబంలో దైవ రక్షణ, శాంతి మరియు సంతానాభివృద్ధి కలుగుతాయి.",
      ta: "கோகர்ண க்ஷேத்திரத்தில் நாராயண பலி பூஜை செய்வதன் மூலம் பித்ரு தோஷங்களும் எதிர்மறை சக்திகளும் நீங்கி, குடும்பத்தில் தெய்வீகப் பாதுகாப்பும் சந்ததி மேன்மையும் உண்டாகும்."
    },
    kala_sarpa: {
      kn: "ಕಾಳಸರ್ಪ ಶಾಂತಿಯ ನಂತರ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪುತ್ತಿದ್ದ ಸುವರ್ಣಾವಕಾಶಗಳು, ನಿರಂತರ ಆರ್ಥಿಕ ಅನಿಶ್ಚಿತತೆ ಹಾಗೂ ಅಕಾರಣ ಭೀತಿಗಳು ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗುತ್ತವೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ವ್ಯಾಪಾರ, ವೃತ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅದ್ಭುತ ಸ್ಥಿರ ಯಶಸ್ಸು ಮತ್ತು ನಾಯಕತ್ವ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
      hi: "कालसर्प शांति के उपरांत अंतिम समय पर हाथ से निकलने वाले अवसर, आर्थिक उतार-चढ़ाव और अकारण भय समाप्त होंगे। परिश्रम का पूर्ण फल व्यापार, आजीविका और समाज में प्रतिष्ठा के रूप में प्राप्त होगा।",
      en: "Following Kala Sarpa Shanti, recurring last-minute setbacks, financial volatility, and ungrounded anxieties dissolve completely. Your steadfast dedication yields stable career breakthroughs, enterprise growth, and high social respect.",
      te: "కాలసర్ప శాంతి అనంతరం చివరి క్షణంలో చేజారే అవకాశాలు మరియు అనవసర భయాలు సమసిపోతాయి. మీ శ్రమకు తగిన స్థిరమైన విజయం, ఆర్థికాభివృద్ధి మరియు సమాజంలో గౌరవం లభిస్తాయి.",
      ta: "காலசர்ப்ப சாந்திக்குப் பின் கடைசி நேரத்தில் தடைபடும் வாய்ப்புகளும் தேவையற்ற பயமும் நீங்கும். உழைப்பிற்கு ஏற்ற முன்னேற்றம், தொழில் வெற்றி மற்றும் நற்பெயர் உண்டாகும்."
    },
    kala_sarpa_dosha: {
      kn: "ಕಾಳಸರ್ಪ ಶಾಂತಿಯ ನಂತರ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಕೈತಪ್ಪುತ್ತಿದ್ದ ಸುವರ್ಣಾವಕಾಶಗಳು, ನಿರಂತರ ಆರ್ಥಿಕ ಅನಿಶ್ಚಿತತೆ ಹಾಗೂ ಅಕಾರಣ ಭೀತಿಗಳು ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗುತ್ತವೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ವ್ಯಾಪಾರ, ವೃತ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅದ್ಭುತ ಸ್ಥಿರ ಯಶಸ್ಸು ಮತ್ತು ನಾಯಕತ್ವ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
      hi: "कालसर्प शांति के उपरांत अंतिम समय पर हाथ से निकलने वाले अवसर, आर्थिक उतार-चढ़ाव और अकारण भय समाप्त होंगे। परिश्रम का पूर्ण फल व्यापार, आजीविका और समाज में प्रतिष्ठा के रूप में प्राप्त होगा।",
      en: "Following Kala Sarpa Shanti, recurring last-minute setbacks, financial volatility, and ungrounded anxieties dissolve completely. Your steadfast dedication yields stable career breakthroughs, enterprise growth, and high social respect.",
      te: "కాలసర్ప శాంతి అనంతరం చివరి క్షణంలో చేజారే అవకాశాలు మరియు అనవసర భయాలు సమసిపోతాయి. మీ శ్రమకు తగిన స్థిరమైన విజయం, ఆర్థికాభివృద్ధి మరియు సమాజంలో గౌరవం లభిస్తాయి.",
      ta: "காலசர்ப்ப சாந்திக்குப் பின் கடைசி நேரத்தில் தடைபடும் வாய்ப்புகளும் தேவையற்ற பயமும் நீங்கும். உழைப்பிற்கு ஏற்ற முன்னேற்றம், தொழில் வெற்றி மற்றும் நற்பெயர் உண்டாகும்."
    },
    guru_chandala: {
      kn: "ಗುರು ಚಾಂಡಾಲ ದೋಷ ಶಾಂತಿಯಿಂದ ಮಾನಸಿಕ ಗೊಂದಲಗಳು, ದಾರಿ ತಪ್ಪಿಸುವ ನಕಾರಾತ್ಮಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ಧನವ್ಯಯಗಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಬರುತ್ತವೆ. ಶುದ್ಧ ವಿವೇಕ, ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಸದ್ಗೌರವ ವೃದ್ಧಿಸುತ್ತದೆ.",
      hi: "गुरु चांडाल दोष निवारण से मानसिक भ्रम, अवांछित निर्णय और धन हानि से मुक्ति मिलेगी। विवेकपूर्ण निर्णय, श्रेष्ठ गुरु कृपा और समाज में सम्मान व प्रतिष्ठा की वृद्धि होगी।",
      en: "Pacifying Guru Chandala Dosha eliminates mental fog, misdirected counsel, and financial leaks. Crystal-clear discernment, spiritual mentorship, Guru's grace, and dignified societal acclaim flourish.",
      te: "గురు చండాల దోష శాంతితో మానసిక అయోమయం మరియు తప్పుడు నిర్ణయాల వల్ల కలిగే నష్టాలు తొలగిపోతాయి. సద్బుద్ధి, గురుకృప మరియు ఉన్నత గౌరవం లభిస్తాయి.",
      ta: "குரு சண்டாள தோஷ சாந்தியால் மனக் குழப்பங்களும் தவறான வழிகாட்டுதல்களும் நீங்கும். தெளிவான சிந்தனை, குருவின் அருள் மற்றும் சமுதாய மரியாதை பெருகும்."
    },
    guru_chandal_dosha: {
      kn: "ಗುರು ಚಾಂಡಾಲ ದೋಷ ಶಾಂತಿಯಿಂದ ಮಾನಸಿಕ ಗೊಂದಲಗಳು, ದಾರಿ ತಪ್ಪಿಸುವ ನಕಾರಾತ್ಮಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ಧನವ್ಯಯಗಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಬರುತ್ತವೆ. ಶುದ್ಧ ವಿವೇಕ, ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಸದ್ಗೌರವ ವೃದ್ಧಿಸುತ್ತದೆ.",
      hi: "गुरु चांडाल दोष निवारण से मानसिक भ्रम, अवांछित निर्णय और धन हानि से मुक्ति मिलेगी। विवेकपूर्ण निर्णय, श्रेष्ठ गुरु कृपा और समाज में सम्मान व प्रतिष्ठा की वृद्धि होगी।",
      en: "Pacifying Guru Chandala Dosha eliminates mental fog, misdirected counsel, and financial leaks. Crystal-clear discernment, spiritual mentorship, Guru's grace, and dignified societal acclaim flourish.",
      te: "గురు చండాల దోష శాంతితో మానసిక అయోమయం మరియు తప్పుడు నిర్ణయాల వల్ల కలిగే నష్టాలు తొలగిపోతాయి. సద్బుద్ధి, గురుకృప మరియు ఉన్నత గౌరవం లభిస్తాయి.",
      ta: "குரு சண்டாள தோஷ சாந்தியால் மனக் குழப்பங்களும் தவறான வழிகாட்டுதல்களும் நீங்கும். தெளிவான சிந்தனை, குருவின் அருள் மற்றும் சமுதாய மரியாதை பெருகும்."
    },
    balarishta: {
      kn: "ಬಾಲಾರಿಷ್ಟ ದೋಷ ಪರಿಹಾರದಿಂದ ಆಯಸ್ಸು, ಆರೋಗ್ಯ ಮತ್ತು ಪ್ರಾಣಶಕ್ತಿ ದೃಢಗೊಳ್ಳುತ್ತದೆ. ಬಾಲ್ಯಾವಸ್ಥೆಯ ಪದೇಪದೇ ಕಾಡುವ ಅನಾರೋಗ್ಯ, ಆಕಸ್ಮಿಕ ಭಯ ಹಾಗೂ ಜಡತ್ವ ನಿವಾರಣೆಯಾಗಿ ಮಗುವಿನಲ್ಲಿ ತೇಜಸ್ಸು ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      hi: "बालारिष्ट दोष शांति से आयु, आरोग्य और प्राणशक्ति सुदृढ़ होती है। बार-बार होने वाले रोग, भय और दुर्बलता का निवारण होकर बालक में तेज और दीर्घायु की वृद्धि होती है।",
      en: "Balarishta propitiation fortifies infant vitality, longevity, and constitutional immunity. Recurring pediatric ailments and frights dissolve, awakening vibrant physical health and divine protection.",
      te: "బాలారిష్ట దోష నివారణతో ఆయుష్షు, ఆరోగ్యం మరియు వ్యాధి నిరోధక శక్తి పెరుగుతాయి. పదేపదే వచ్చే అనారోగ్యాలు తగ్గి బాలుడిలో తేజస్సు, దీర్ఘాయువు చేకూరుతాయి.",
      ta: "பாலாரிஷ்ட தோஷ நிவர்த்தியால் குழந்தையின் ஆயுள், ஆரோக்கியம் மற்றும் நோய் எதிர்ப்பு சக்தி கூடும். தொடர் உடல் உபாதைகள் நீங்கி நீண்ட ஆயுளும் சுபிட்சமும் உண்டாகும்."
    },
    balyagraha: {
      kn: "ಬಾಲ್ಯಗ್ರಹ ಶಾಂತಿಯಿಂದ ಶಿಶುಗಳಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುವ ಅಕಾರಣ ರೋದನ, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ದೃಷ್ಟಿದೋಷಗಳು ಶಮನವಾಗಿ, ಮಗುವಿನ ಮುಖದಲ್ಲಿ ಮಂದಹಾಸ, ಲವಲವಿಕೆ ಮತ್ತು ಸುಖ ನಿದ್ರೆ ನೆಲೆಸುತ್ತದೆ.",
      hi: "बाल्यग्रह शांति से शिशुओं का अकारण रोना, अनिद्रा और नजर दोष दूर होकर बालक का स्वास्थ्य उत्तम, प्रफुल्लित और शांत रहता है।",
      en: "Balyagraha pacification silences unexplained infant distress, restless nights, and evil-eye afflictions, restoring deep restorative sleep, joyful smiles, and tender maternal peace.",
      te: "బాల్యగ్రహ శాంతితో చిన్నపిల్లల ఏడుపు, నిద్రలేమి మరియు దిష్టి దోషాలు సమసిపోయి, పిల్లలు ఆరోగ్యంగా మరియు సంతోషంగా ఉంటారు.",
      ta: "பால்யகிரக வழிபாட்டால் குழந்தைகள் காரணமின்றி அழுவது, தூக்கமின்மை மற்றும் திருஷ்டி தோஷங்கள் நீங்கி ஆரோக்கியமும் மகிழ்ச்சியும் கூடும்."
    },
    kuja_dosha: {
      kn: "ಕುಜ ಶಾಂತಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಆರಾಧನೆಯಿಂದ ವಿವಾಹದಲ್ಲಿ ಉಂಟಾಗುತ್ತಿದ್ದ ಅಡೆತಡೆಗಳು, ಅಕಾರಣ ವಿಳಂಬ ಹಾಗೂ ಸಂಬಂಧಗಳಲ್ಲಿನ ಮುನಿಸು ದೂರವಾಗಿ, ಯೋಗ್ಯ ಜೀವನ ಸಂಗಾತಿಯ ಆಯ್ಕೆ ಸುಗಮವಾಗುತ್ತದೆ. ದಾಂಪತ್ಯದಲ್ಲಿ ಅನ್ಯೋನ್ಯತೆ ಹಾಗೂ ಆಂತರಿಕ ನೆಮ್ಮದಿ ನೆಲೆಸುತ್ತದೆ.",
      hi: "मंगल शांति एवं सुब्रह्मण्य साधना से विवाह में विलंब, क्रोध और दांपत्य तनाव शांत होता है। सुयोग्य जीवनसाथी का सहयोग तथा परिवार में प्रेम और सुख-सौहार्द का संचार होता है।",
      en: "Kuja Shanti and Subrahmanya sadhana harmonize fiery temperaments, dissolving matrimonial delays and domestic friction. A deeply compatible, virtuous union and mutual lifelong devotion are established.",
      te: "కుజ శాంతితో వివాహ ఆటంకాలు, కోపం మరియు దాంపత్య ఘర్షణలు సమసిపోతాయి. అనుకూలమైన భాగస్వామి లభించి, కుటుంబంలో ప్రేమ మరియు శాంతి వెల్లివిరుస్తాయి.",
      ta: "செவ்வாய் சாந்தி வழிபாட்டால் திருமணத் தடைகளும் வாக்குவாதங்களும் நீங்கி, சிறந்த வாழ்க்கைத்துணை அமைந்து இல்வாழ்க்கையில் அன்யோன்யம் நிலவும்."
    },
    grahan_dosha: {
      kn: "ಗ್ರಹಣ ದೋಷ ಶಾಂತಿಯಿಂದ ರವಿ-ಚಂದ್ರರ ತೇಜಸ್ಸು ಪುನಶ್ಚೇತನಗೊಂಡು, ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ, ತಂದೆ-ತಾಯಿಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಹಾಗೂ ಮಾನಸಿಕ ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗಿ ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಪ್ರಭಾವಶಾಲಿ ಸ್ಥಾನ ಲಭಿಸುತ್ತದೆ.",
      hi: "ग्रहण दोष निवारण से सूर्य एवं चंद्र की आभा पुनः प्रखर होती है। आत्मविश्वास की कमी, माता-पिता के स्वास्थ्य संबंधी चिंताएं समाप्त होकर समाज में यश और प्रतिष्ठा मिलती है।",
      en: "Grahan Dosha propitiation restores the radiant luminance of Sun and Moon, clearing identity crises, self-doubt, and parental health concerns while elevating societal honor.",
      te: "గ్రహణ దోష శాంతితో ఆత్మవిశ్వాసం పెరుగుతుంది. తల్లిదండ్రుల ఆరోగ్య సమస్యలు మరియు మానసిక భయాలు తొలగి సమాజంలో కీర్తి ప్రతిష్టలు పెరుగుతాయి.",
      ta: "கிரகண தோஷ நிவர்த்தியால் தன்னம்பிக்கை உயரும். பெற்றோரின் உடல்நலக் கவலைகள் மற்றும் மன அச்சங்கள் நீங்கி சமுதாயத்தில் நற்பெயர் உண்டாகும்."
    },
    shrapit_dosha: {
      kn: "ಶಾಪಿತ ದೋಷ (ಶನಿ-ರಾಹು ಸಂಯೋಗ) ಶಾಂತಿಯಿಂದ ಪೂರ್ವಜನ್ಮದ ಕರ್ಮಬಂಧಗಳು ಮುಕ್ತವಾಗಿ, ವ್ಯಾಪಾರ, ಉದ್ಯೋಗ ಹಾಗೂ ಆರೋಗ್ಯದಲ್ಲಿ ಎದುರಾಗುತ್ತಿದ್ದ ನಿರಂತರ ನಕಾರಾತ್ಮಕ ಅಡೆತಡೆಗಳು ಕರಗಿ ಶಾಶ್ವತ ಪ್ರಗತಿಯ ಹಾದಿ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ.",
      hi: "शापित दोष (शनि-राहु युति) शांति से पूर्व जन्म के कर्म बंधनों का क्षय होकर आजीविका, व्यापार और स्वास्थ्य में निरंतर आने वाली रुकावटें दूर होती हैं।",
      en: "Shrapit Dosha (Saturn-Rahu conjunction) remedies unbind deep-seated karmic shackles, turning chronic professional stagnation and mysterious setbacks into sustained upward progress.",
      te: "శ్రాపిత దోష శాంతితో పూర్వజన్మ కర్మ భారం తొలగిపోయి, ఉద్యోగ, వ్యాపార మరియు ఆరోగ్య విషయాలలో అడ్డంకులు తొలగి స్థిరమైన ప్రగతి సాధిస్తారు.",
      ta: "சாபித தோஷ வழிபாட்டால் முற்பிறவி கர்ம வினைகள் விலகி, தொழில் மற்றும் ஆரோக்கியத்தில் நிலவிய தொடர் முட்டுக்கட்டைகள் தகர்ந்து முன்னேற்றம் உண்டாகும்."
    },
    kemadruma_dosha: {
      kn: "ಕೇಮದ್ರುಮ ದೋಷ ಪರಿಹಾರದಿಂದ ಮಾನಸಿಕ ಏಕಾಂಗಿತನ, ಆರ್ಥಿಕ ಅಭಾವ ಮತ್ತು ಆಂತರಿಕ ಅಸ್ಥಿರತೆ ದೂರವಾಗಿ, ನೂತನ ಧನಾಗಮನ, ಆಪ್ತರ ಪ್ರೀತಿಯ ಬೆಂಬಲ ಹಾಗೂ ದೃಢ ಮನಃಸ್ಥೈರ್ಯ ಲಭಿಸುತ್ತದೆ.",
      hi: "केमद्रुम दोष निवारण से अकेलापन, मानसिक तनाव और आर्थिक अस्थिरता दूर होती है। नए आय स्रोत, परिवार का स्नेह और आंतरिक संतोष प्राप्त होता है।",
      en: "Kemadruma Dosha remedies neutralize isolation, financial void, and emotional loneliness, magnetizing trusted allies, stable cash flow, and emotional contentment.",
      te: "కేమద్రుమ దోష పరిహారంతో ఒంటరితనం, మానసిక అశాంతి మరియు ఆర్థిక ఇబ్బందులు తొలగిపోయి, బంధుమిత్రుల ఆదరణ మరియు సంపద వృద్ధి చెందుతాయి.",
      ta: "கேமத்ரும தோஷ பரிகாரத்தால் தனிமை உணர்வும் பொருளாதார நெருக்கடியும் நீங்கி, உற்றாரின் ஆதரவும் பணப்புழக்கமும் பெருகும்."
    },
    gandanta_dosha: {
      kn: "ಗಂಡಾಂತ ದೋಷ ಶಾಂತಿಯಿಂದ ನಕ್ಷತ್ರ-ತಿಥಿ-ಲಗ್ನ ಸಂಧಿ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಜೀವನದ ಮಹತ್ವದ ತಿರುವುಗಳಲ್ಲಿ ಎದುರಾಗುತ್ತಿದ್ದ ಆಕಸ್ಮಿಕ ಅಪಾಯಗಳು ತಗ್ಗಿ, ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಭಾಗ್ಯೋದಯ ಲಭಿಸುತ್ತದೆ.",
      hi: "गंडांत दोष शांति से नक्षत्र व लग्न संधि के अशुभ प्रभाव समाप्त होकर जीवन में अचानक आने वाले संकट टलते हैं तथा दीर्घायु व भाग्योदय की प्राप्ति होती है।",
      en: "Gandanta Shanti resolves transitional karmic knots across astral junctions, shielding against sudden shocks and opening pathways to longevity, resilience, and destiny fulfillment.",
      te: "గండాంత దోష శాంతితో ఆకస్మిక విపత్తులు మరియు ప్రమాదాలు తొలగిపోతాయి. దీర్ఘాయువు, భాగ్యోదయము మరియు మనశ్శాంతి లభిస్తాయి.",
      ta: "கண்டாந்த தோஷ நிவர்த்தியால் திடீர் ஆபத்துகளும் கண்டங்களும் விலகி, நீண்ட ஆயுளும் சுப யோகங்களும் கூடிவரும்."
    },
    dasha_sandhi: {
      kn: "ದಶಾ ಸಂಧಿ ಶಾಂತಿಯಿಂದ ಹಳೆಯ ದಶೆಯ ನಕಾರಾತ್ಮಕ ತೀವ್ರತೆ ಶಮನವಾಗಿ, ನೂತನ ದಶಾಧಿಪತಿಯು ಶುಭ ಫಲಗಳನ್ನು ನೀಡಲು ಪ್ರಾರಂಭಿಸುತ್ತಾನೆ. ಜೀವನದ ಸ್ಥಿತ್ಯಂತರ ಕಾಲದಲ್ಲಿ ಉಂಟಾಗುವ ಗೊಂದಲ ಹಾಗೂ ಆರ್ಥಿಕ ನಷ್ಟಗಳು ತಪ್ಪುತ್ತವೆ.",
      hi: "दशा संधि शांति से पुरानी दशा के अनिष्ट प्रभाव समाप्त होकर नवीन दशा का शुभारंभ अत्यंत शुभ, प्रगतिशील और सुखदायक होता है।",
      en: "Dasha Sandhi propitiation cushions the turbulent planetary gear shift, mitigating turbulence and ensuring that the incoming dasha unfolds with grace, clarity, and auspicious opportunities.",
      te: "దశా సంధి శాంతితో పాత దశా దోషాలు తొలగి, కొత్త దశా కాలం అత్యంత శుభప్రదంగా, ఆర్థిక స్థిరత్వంతో మరియు ఉత్సాహంగా ప్రారంభమవుతుంది.",
      ta: "திசா சந்தி சாந்தியால் முந்தைய திசையின் தாக்கங்கள் தணிந்து, புதிய திசா காலம் சுப யோகங்களையும் தொழில் முன்னேற்றத்தையும் தரும்."
    },
    gochara_shani: {
      kn: "ಸಾಡೇಸಾತಿ, ಕಂಟಕ ಅಥವಾ ಅಷ್ಟಮ ಶನಿಯ ಶಾಂತಿಯಿಂದ ದೀರ್ಘಕಾಲದ ಮಾನಸಿಕ ಒತ್ತಡ, ಸ್ಥಾನಪಲ್ಲಟದ ಆತಂಕ ಮತ್ತು ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೃಢ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ, ಆಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.",
      hi: "साढ़ेसाती, कंटक अथवा अष्टम शनि की शांति से दीर्घकालिक मानसिक तनाव, कार्यक्षेत्र की अस्थिरता समाप्त होकर आजीविका में स्थायित्व एवं स्थायी सुख-शांति की प्राप्ति होती है।",
      en: "Shani Sade Sati, Kantaka, and Ashtama pacification transmutes heavy mental pressure and stagnation into disciplined strength, professional security, asset creation, and serene peace.",
      te: "ఏలినాటి శని లేదా అష్టమ శని శాంతితో మానసిక ఒత్తిడి మరియు ఉద్యోగ అస్థిరత తొలగిపోయి, స్థిరమైన ఉన్నతి, సంపద మరియు మనశ్శాంతి లభిస్తాయి.",
      ta: "ஏழரை சனி மற்றும் அஷ்டம சனி சாந்தியால் மன அழுத்தமும் தொழில் தடைகளும் நீங்கி, நிரந்தர வேலையும் பொருளாதார வளர்ச்சியும் மன அமைதியும் கிட்டும்."
    },
    shani_sade_sati: {
      kn: "ದೀರ್ಘಕಾಲದ ಮಾನಸಿಕ ಒತ್ತಡ, ಸ್ಥಾನಪಲ್ಲಟದ ಆತಂಕ ಮತ್ತು ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೃಢ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ, ಆಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.",
      hi: "दीर्घकालिक मानसिक तनाव, कार्यक्षेत्र की अस्थिरता और आर्थिक दबाव समाप्त होंगे। धैर्य और निष्ठापूर्वक किए गए कार्यों में स्थायित्व तथा उन्नति प्राप्त होगी।",
      en: "Protracted mental fatigue and professional turbulence give way to stability, long-term asset building, resilience, and unshakeable inner peace.",
      te: "సుదీర్ఘ మానసిక ఒత్తిడి మరియు ఉద్యోగ అస్థిరత తొలగిపోతాయి. కష్టానికి తగిన ప్రతిఫలం, స్థిరమైన ఉన్నతి మరియు శాంతి చేకూరుతాయి.",
      ta: "நீண்டகால மன அழுத்தமும் தொழில் தடைகளும் நீங்கும். உழைப்பிற்கு ஏற்ற நிலையான வெற்றியும் பொருளாதார வளர்ச்சியும் கிட்டும்."
    },
    gochara_guru: {
      kn: "ಗುರು ಗೋಚಾರ ಶಾಂತಿಯಿಂದ ಕಾರ್ಯಗಳಲ್ಲಿ ಎದುರಾಗುತ್ತಿದ್ದ ಅಡಚಣೆಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೈವಾನುಗ್ರಹ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ಧನಾಗಮನ ಹಾಗೂ ಸಕಲ ಪ್ರಯತ್ನಗಳಲ್ಲಿ ಸತ್ಫಲಗಳು ಸಿದ್ಧಿಸುತ್ತವೆ.",
      hi: "गुरु गोचर शांति से कार्यों की बाधाएं समाप्त होकर ईश्वरीय कृपा, गुरुजनों का आशीर्वाद, धन लाभ एवं समस्त प्रयासों में सफलता प्राप्त होती है।",
      en: "Guru transit propitiation turns adverse planetary winds into divine favor, unblocking spiritual blessings, elder mentorship, wealth flow, and auspicious outcomes.",
      te: "గురు గోచార శాంతితో పనుల్లో ఆటంకాలు తొలగిపోయి, దైవానుగ్రహం, పెద్దల ఆశీస్సులు మరియు సర్వకార్య సిద్ధి కలుగుతాయి.",
      ta: "குரு பெயர்ச்சி சாந்தியால் காரியத் தடைகள் விலகி, குருவின் அருளும் தனலாபமும் சகல காரிய வெற்றியும் கைகூடும்."
    },
    gochara_rahu_ketu: {
      kn: "ರಾಹು-ಕೇತು ಗೋಚಾರ ಶಾಂತಿಯಿಂದ ಅನಿರೀಕ್ಷಿತ ಭ್ರಮೆಗಳು, ವಂಚನೆಯ ಭೀತಿ ಹಾಗೂ ಆರೋಗ್ಯ ಅಸ್ಥಿರತೆಗಳು ಕರಗಿ, ಆಂತರಿಕ ಸ್ಪಷ್ಟತೆ, ನೂತನ ಅವಕಾಶಗಳು ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ ಒಲಿಯುತ್ತದೆ.",
      hi: "राहु-केतु गोचर शांति से अनिर्णय, भ्रम एवं अचानक आने वाली बाधाएं दूर होकर मानसिक स्पष्टता, नए अवसर एवं दैवीय सुरक्षा मिलती है।",
      en: "Rahu-Ketu transit remedies neutralize sudden delusions, deceit traps, and health turbulence, grounding native with sharp intuition, breakthrough avenues, and spiritual grace.",
      te: "రాహు-కేతు గోచార శాంతితో మానసిక భ్రమలు మరియు ఆకస్మిక నష్టాలు తొలగి, వివేకము, నూతన అవకాశాలు మరియు దైవ రక్షణ లభిస్తాయి.",
      ta: "ராகு-கேது பெயர்ச்சி சாந்தியால் மனக்குழப்பங்களும் ஏமாற்றங்களும் நீங்கி, தெளிவான முடிவுகளும் புதிய வாய்ப்புகளும் கிட்டும்."
    },
    tithi_shunya_dosha: {
      kn: "ತಿಥಿ ಶೂನ್ಯ ದೋಷ ಶಾಂತಿಯಿಂದ ಶೂನ್ಯ ರಾಶಿಗಳ ಪ್ರತಿಕೂಲ ಫಲಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆ ಭಾವಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಸುಖ, ಸಂಪತ್ತು ಹಾಗೂ ಸಂಬಂಧಗಳು ಪುನಶ್ಚೇತನಗೊಳ್ಳುತ್ತವೆ.",
      hi: "तिथि शून्य दोष शांति से शून्य राशियों का अनिष्ट प्रभाव समाप्त होकर उन भावों से संबंधित धन, स्वास्थ्य और रिश्तों में शुभता आती है।",
      en: "Tithi Shunya Dosha shanti clears the void effects on blank signs, infusing the affected life houses with renewed vitality, wealth, and auspicious fulfillment.",
      te: "తిథి శూన్య దోష శాంతితో శూన్య రాశుల చెడు ప్రభావాలు తొలగిపోయి, సంబంధిత విషయాలలో శుభ ఫలితాలు మరియు అభివృద్ధి లభిస్తాయి.",
      ta: "திதி சூன்ய தோஷ சாந்தியால் சூன்ய ராசிகளின் தோஷம் நீங்கி, சுப பலன்களும் குடும்பத்தில் மகிழ்ச்சியும் பெருகும்."
    },
    panchanga_yoga_dosha: {
      kn: "ಪಂಚಾಂಗ ಅಶುಭ ಯೋಗ (ವ್ಯತೀಪಾತ, ವೈಧೃತಿ, ಶೂಲ ಇತ್ಯಾದಿ) ಶಾಂತಿಯಿಂದ ದೇಹದ ಪ್ರಾಣನಾಡಿಗಳು ಶುದ್ಧಗೊಂಡು, ಕಾರ್ಯಗಳಲ್ಲಿ ಎದುರಾಗುತ್ತಿದ್ದ ಆಕಸ್ಮಿಕ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿರಂತರ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
      hi: "पंचांग अशुभ योग (व्यतीपात, वैधृति आदि) शांति से प्राण ऊर्जा संतुलित होती है और कार्यों में बार-बार आने वाली आकस्मिक रुकावटें समाप्त होती हैं।",
      en: "Panchanga Inauspicious Yoga (Vyatipata, Vaidhrithi, Shoola etc.) propitiation purifies subtle vital energy pathways, neutralizing sudden stumbling blocks and paving a smooth path to success.",
      te: "పంచాంగ అశుభ యోగ శాంతితో పనుల్లో ఆకస్మికంగా వచ్చే ఆటంకాలు తొలగిపోయి, నిరంతర విజయం మరియు మానసిక ప్రశాంతత లభిస్తాయి.",
      ta: "பஞ்சாங்க அசுப யோக சாந்தியால் பணிகளில் ஏற்படும் திடீர் தடைகள் விலகி, தொடர் வெற்றியும் மன நிம்மதியும் உண்டாகும்."
    },
    panchanga_karana_dosha: {
      kn: "ಅಶುಭ ಕರಣ (ವಿಷ್ಟಿ / ಭದ್ರಾ) ಶಾಂತಿಯಿಂದ ಕಠಿಣ ಶ್ರಮ ವ್ಯರ್ಥವಾಗುವುದು ತಪ್ಪಿ, ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸ-ಕಾರ್ಯಗಳು ನಿರ್ವಿಘ್ನವಾಗಿ ಪೂರ್ಣಗೊಂಡು ಅಪೇಕ್ಷಿತ ಫಲಗಳು ಸಕಾಲದಲ್ಲಿ ದೊರೆಯುತ್ತವೆ.",
      hi: "अशुभ करण (विष्टि/भद्रा) शांति से व्यर्थ की भागदौड़ रुकती है और आरंभ किए गए सभी कार्य बिना विघ्न के समय पर सिद्ध होते हैं।",
      en: "Inauspicious Karana (Vishti/Bhadra) propitiation eliminates wasted toil and repetitive fatigue, enabling endeavors to reach completion smoothly on schedule.",
      te: "అశుభ కరణ (విష్టి/భద్ర) శాంతితో వ్యర్థ ప్రయాసలు తగ్గి, చేపట్టిన పనులు ఆటంకాలు లేకుండా సకాలంలో పూర్తవుతాయి.",
      ta: "அசுப கரண (விஷ்டி/பத்ரா) சாந்தியால் வீண் அலைச்சல் குறைந்து, தொடங்கிய காரியங்கள் தடையின்றி வெற்றிகரமாக முடியும்."
    }
  };

  const defaultImprovement: Record<SupportedLanguage, string> = {
    kn: "ಗ್ರಹಗಳ ಪ್ರತಿಕೂಲ ಪ್ರಭಾವ ಶಮನವಾಗಿ, ದೀರ್ಘಕಾಲದಿಂದ ನೆನೆಗುದಿಗೆ ಬಿದ್ದಿದ್ದ ಕೆಲಸ-ಕಾರ್ಯಗಳು ಚುರುಕುಗೊಳ್ಳುತ್ತವೆ. ಆರ್ಥಿಕ ಚೇತರಿಕೆ, ಆರೋಗ್ಯ ವೃದ್ಧಿ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚವು ನಿಮಗೆ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ನೀಡಲಿದೆ.",
    hi: "ग्रहों का प्रतिकूल प्रभाव शांत होगा और लंबे समय से अटके हुए कार्य गति पकड़ेंगे। आर्थिक स्थिरता, उत्तम स्वास्थ्य और ईश्वर की कृपा से जीवन में आत्मविश्वास बढ़ेगा।",
    en: "Adverse planetary influences harmonize, helping long-stuck tasks and delayed opportunities move forward smoothly. Financial stability, vitality, and divine peace will be restored.",
    te: "గ్రహాల ప్రతికూల ప్రభావం తొలగి, చాలా కాలంగా నిలిచిపోయిన పనులు వేగవంతమవుతాయి. ఆర్థిక స్థిరత్వం, ఆరోగ్యం మరియు ఆత్మవిశ్వాసం పెరుగుతాయి.",
    ta: "கிரகங்களின் பாதகமான தாக்கங்கள் நீங்கி, நீண்ட நாட்களாக தேங்கிக்கிடந்த பணிகள் விரைந்து முடியும். பொருளாதார நிலை உயர்ந்து மன அமைதி கிட்டும்."
  };

  const normalizedId = (doshaId || "").toLowerCase().replace(/-/g, "_");
  const matched = improvements[normalizedId] || improvements[doshaId];
  if (matched && matched[lang]) return matched[lang];
  return defaultImprovement[lang] || defaultImprovement.kn;
}

export const KundliDoshaPdfTemplate: React.FC<KundliDoshaPdfTemplateProps> = ({
  id = "kundli-doshas-pdf-container",
  report,
  lang = "kn",
  qrCodeDataUrl,
  overridePriestName,
  overridePriestPhone
}) => {
  const normalizedLang = (lang || "kn").toLowerCase();
  const code: SupportedLanguage = (["kn", "hi", "te", "ta", "en"].includes(normalizedLang) ? normalizedLang : "kn") as SupportedLanguage;
  const t = PDF_TEXT[code] || PDF_TEXT.kn;
  const snip = LOCALIZED_SNIPPETS[code] || LOCALIZED_SNIPPETS.en;

  const displayPriestName = overridePriestName?.trim() || t.priestName;
  const displayPriestPhone = overridePriestPhone?.trim() || t.priestPhone;

  const { devoteeInfo, doshas, gandantaraAndBhaya, summary } = report;
  const activeDoshas = (doshas || []).filter((d) => d.isDetected);
  const isPitruActive = activeDoshas.some((d) => d.id === "pitru_dosha");
  const ageStageRemedies = getAgeStageRemedies(devoteeInfo.ageStageKey || "gruhastha", code, isPitruActive);
  const gandantaras = gandantaraAndBhaya?.activeGandantaras || [];
  const fears = gandantaraAndBhaya?.detectedFears || [];

  // Scannable Verification QR Code State
  const [internalQr, setInternalQr] = useState<string>(qrCodeDataUrl || "");

  useEffect(() => {
    if (qrCodeDataUrl) {
      setInternalQr(qrCodeDataUrl);
      return;
    }
    // In Node / Vitest test runner environments, skip background async canvas rendering to prevent post-teardown state updates
    if (typeof window === "undefined" || (typeof process !== "undefined" && process.env?.NODE_ENV === "test")) {
      return;
    }
    let isMounted = true;
    try {
      const phoneDigits = (overridePriestPhone || "9972339362").replace(/[^0-9]/g, "") || "9972339362";
      const verifyUrl = `https://baggonapanchanga.web.app/daily?action=dosha_verify&devotee=${encodeURIComponent(
        devoteeInfo.name || "Devotee"
      )}&priestPhone=${phoneDigits}&lang=${code}`;

      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 260,
        color: {
          dark: "#78350F", // Royal deep gold/amber
          light: "#FFFFFF"
        }
      })
        .then((url) => {
          if (isMounted && typeof window !== "undefined") {
            setInternalQr(url);
          }
        })
        .catch((err) => {
          console.warn("[KundliDoshaPdfTemplate] QR Code generation fallback:", err);
        });
    } catch {
      // Safe fallback in non-browser or test runner
    }

    return () => {
      isMounted = false;
    };
  }, [qrCodeDataUrl, devoteeInfo.name, code, overridePriestPhone]);

  // 4-PAGE MASTER DOSSIER ARCHITECTURE FOR CRISP, UNCLUTTERED DEVOTEE EXPERIENCE:
  // Page 1: Devotee Profile Matrix, Karmic Diagnostic Assessment, Age Priority Strategy & Natal Planetary Fortitude Shield.
  // Page 2: Primary Karmic Afflictions & Classical Remedies (Pillars 1 to 4 in Full Depth with generous 12px-13px font).
  // Page 3: Secondary Afflictions & Planetary Transits (or Grand Planetary Harmony & Divine Protection Shield).
  // Page 4: Life Hazards (Gandantara), Innate Fears, Gokarna Temple Sevas, Chief Priest Blessing & Live Scannable QR Code.
  const page2Doshas =
    activeDoshas.length <= 1
      ? activeDoshas
      : activeDoshas.length === 2
      ? [activeDoshas[0]]
      : [activeDoshas[0], activeDoshas[1]];

  const page3Doshas =
    activeDoshas.length <= 1
      ? []
      : activeDoshas.length === 2
      ? [activeDoshas[1]]
      : activeDoshas.slice(2, 4);

  const getLangVal = (obj: any, fallback: string = ""): string => {
    if (!obj) return fallback;
    if (typeof obj === "string") return obj;
    return obj[code] || obj["en"] || obj["kn"] || fallback;
  };

  const getLangArr = (obj: any): string[] => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return obj[code] || obj["en"] || obj["kn"] || [];
  };

  const fontStack =
    "'Cinzel', 'Playfair Display', 'Noto Serif Kannada', 'Noto Serif Devanagari', 'Noto Serif Telugu', 'Noto Serif Tamil', 'Noto Serif', serif, sans-serif";

  // Dedicated Ornate Gold Landline Divider Component
  const renderGoldLandlineDivider = (centerOrnament: string = "❖ ॐ ❖") => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        margin: "3px 0",
        flexShrink: 0
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1.5px",
          background: "linear-gradient(90deg, transparent 0%, #E7C68A 25%, #B45309 70%, #D97706 100%)"
        }}
      />
      <span
        style={{
          fontSize: "10.5px",
          fontWeight: 900,
          color: GOLD_PRIMARY,
          letterSpacing: "normal",
          padding: "0 4px"
        }}
      >
        {centerOrnament}
      </span>
      <div
        style={{
          flex: 1,
          height: "1.5px",
          background: "linear-gradient(90deg, #D97706 0%, #B45309 30%, #E7C68A 75%, transparent 100%)"
        }}
      />
    </div>
  );

  // Common Royal Header with Lord Shiva and Lord Surya Sacred Imagery
  const renderRoyalHeader = (partNum: number, title: string, subtitle?: string) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "62px 1fr 62px",
        gap: "12px",
        alignItems: "center",
        background: "linear-gradient(135deg, #451A03 0%, #78350F 45%, #92400E 75%, #451A03 100%)",
        borderRadius: "12px",
        padding: "8px 14px",
        color: "#FFFFFF",
        border: `2px solid ${GOLD_BORDER}`,
        boxShadow: "0 4px 12px rgba(120, 53, 15, 0.25)",
        flexShrink: 0
      }}
    >
      {/* Left Deity Medallion: Lord Shiva Mahabaleshwara Atmalinga */}
      <div style={{ textAlign: "center" }}>
        <img
          src="/daily_posters/poster_1_shiva.jpg"
          alt="Lord Shiva Mahabaleshwara Atmalinga"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2.5px solid #FDE68A",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
            objectFit: "cover",
            backgroundColor: "#FEF3C7",
            display: "inline-block"
          }}
        />
        <div style={{ fontSize: "8px", fontWeight: 900, color: "#FDE68A", marginTop: "2px", letterSpacing: "normal" }}>
          {snip.shivaMedallion}
        </div>
      </div>

      {/* Center Temple Title & Sanskrit Invocation */}
      <div style={{ textAlign: "center", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(254, 243, 199, 0.35)",
            paddingBottom: "3px",
            marginBottom: "3px"
          }}
        >
          <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 800, letterSpacing: "normal" }}>
            {t.templeBanner}
          </div>
          <div
            style={{
              fontSize: "9.5px",
              fontWeight: 900,
              color: GOLD_DARK,
              backgroundColor: "#FEF3C7",
              padding: "1px 8px",
              borderRadius: 6,
              border: `1px solid ${GOLD_LIGHT}`
            }}
          >
            {partNum === 1 ? snip.part1 : partNum === 2 ? snip.part2 : partNum === 3 ? snip.part3 : snip.part4}
          </div>
        </div>
        <div
          style={{
            fontSize: "14.5px",
            fontWeight: 900,
            color: "#FFFFFF",
            marginTop: "1px",
            letterSpacing: "normal",
            lineHeight: 1.3
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "10.5px",
              color: "#FEF08A",
              fontStyle: "italic",
              marginTop: "2px",
              letterSpacing: "normal",
              lineHeight: 1.35
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Deity Medallion: Lord Surya Bhagavan (Vitality & All-Protective Graha Raja) */}
      <div style={{ textAlign: "center" }}>
        <img
          src="/daily_posters/poster_0_surya.jpg"
          alt="Lord Surya Bhagavan Graha Raja"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2.5px solid #FDE68A",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
            objectFit: "cover",
            backgroundColor: "#FEF3C7",
            display: "inline-block"
          }}
        />
        <div style={{ fontSize: "8px", fontWeight: 900, color: "#FDE68A", marginTop: "2px", letterSpacing: "normal" }}>
          {snip.suryaMedallion}
        </div>
      </div>
    </div>
  );

  // Reusable Spacious Dosha Card for Layman Readability (Zero nested cluttered boxes)
  const renderDoshaCard = (dosha: DetectedDosha, isPrimary: boolean) => {
    const isPitru = dosha.id === "pitru_dosha";
    const isKuja = dosha.id === "kuja_dosha";
    const isSarpa = dosha.id === "kala_sarpa_dosha" || dosha.id === "kala_sarpa";
    const isCompleted = dosha.shantiStatus === "completed";
    const priorityRank = dosha.agePriorityRank || 1;
    const devoteeAge = devoteeInfo.currentAge || devoteeInfo.devoteeAge || "";

    // Clean, crisp priority badge with ample lineHeight so Indic glyphs never drop out or clip
    const priorityPillText =
      code === "kn"
        ? `⚡ ಆದ್ಯತೆ #${priorityRank} (${devoteeAge} ವರ್ಷ)`
        : code === "hi"
        ? `⚡ प्राथमिकता #${priorityRank} (${devoteeAge} वर्ष)`
        : code === "te"
        ? `⚡ ప్రాధాన్యత #${priorityRank} (${devoteeAge} సం.)`
        : code === "ta"
        ? `⚡ முன்னுரிமை #${priorityRank} (${devoteeAge} வயது)`
        : `⚡ Priority #${priorityRank} (Age ${devoteeAge})`;

    return (
      <div
        key={dosha.id}
        style={{
          backgroundColor: "#FFFFFF",
          border: `1.5px solid ${GOLD_BORDER}`,
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(180, 83, 9, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          boxSizing: "border-box"
        }}
      >
        {isPitru && (
          <div
            style={{
              backgroundColor: "#78350F",
              color: "#FEF9E7",
              fontSize: "11.5px",
              fontWeight: 900,
              padding: "4px 12px",
              borderRadius: "6px",
              letterSpacing: "0.2px",
              lineHeight: 1.45,
              border: `1px solid ${GOLD_LIGHT}`
            }}
          >
            {snip.pitruBadge}
          </div>
        )}

        {/* Header Row: Title & Scripture on Left, Clean Unclipped Badges on Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            borderBottom: "1.5px solid #F1E8D9",
            paddingBottom: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: "20px", flexShrink: 0 }}>
              {isPitru ? "🪔" : isKuja ? "⚔️" : isSarpa ? "🐍" : "🪐"}
            </span>
            <span style={{ fontSize: "16.5px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3, letterSpacing: "0.2px" }}>
              {getLangVal(dosha.name)}
            </span>
            {(() => {
              const sRef = getScripturalReference(dosha.id, dosha.technicalDetail?.scripturalReference, code);
              return sRef ? (
                <span style={{ fontSize: "11.5px", color: INK_MUTED, fontWeight: 700, letterSpacing: "0.2px" }}>
                  ({sRef})
                </span>
              ) : null;
            })()}
          </div>

          {/* Right: Badges Group with whitespace nowrap */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {/* Severity Badge */}
            <span
              style={{
                backgroundColor: dosha.severity === "critical" ? "#FEF2F2" : "#FFFBEB",
                border: `1px solid ${dosha.severity === "critical" ? "#FCA5A5" : "#FCD34D"}`,
                color: dosha.severity === "critical" ? "#991B1B" : "#92400E",
                fontSize: "11px",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: "5px",
                flexShrink: 0,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1.45,
                boxSizing: "border-box"
              }}
            >
              {getSeverityLabel(dosha.severity, code)}
            </span>

            {/* Red / Crimson Age Priority Badge with Crystal Clear Typography & Proper Line Height */}
            <span
              style={{
                backgroundColor: "#991B1B",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "5px",
                border: "1px solid #7F1D1D",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1.45,
                boxSizing: "border-box"
              }}
            >
              {priorityPillText}
            </span>

            {/* Status Badge */}
            <span
              style={{
                backgroundColor: isCompleted ? "#F0FDF4" : "#FEF3C7",
                border: `1px solid ${isCompleted ? "#86EFAC" : GOLD_BORDER}`,
                color: isCompleted ? "#166534" : GOLD_DARK,
                fontSize: "11px",
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: "5px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1.45,
                boxSizing: "border-box"
              }}
            >
              {getLangVal(dosha.statusBadge)}
            </span>
          </div>
        </div>

        {/* Age Priority Reason if present */}
        {dosha.agePriorityReason && (
          <div style={{ fontSize: "12px", color: INK_MUTED, fontStyle: "italic", lineHeight: 1.45, wordSpacing: "1px" }}>
            ({getLangVal(dosha.agePriorityReason)})
          </div>
        )}

        {/* Immediate Action Banner: Clean Corporate Callout with Deep Left Accent Line */}
        {dosha.immediateActionRequired && (
          <div
            style={{
              backgroundColor: "#FCFBF9",
              borderLeft: `4px solid ${GOLD_BORDER}`,
              borderTop: "1px solid #F1E8D9",
              borderRight: "1px solid #F1E8D9",
              borderBottom: "1px solid #F1E8D9",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "12.5px",
              lineHeight: 1.6,
              wordSpacing: "1px"
            }}
          >
            <span style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px" }}>{t.immediateActionLabel} </span>
            <span style={{ fontWeight: 700, color: INK_DEEP }}>
              {stripDuplicatePrefix(getLangVal(dosha.immediateActionRequired), [
                "🎯 ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ:",
                "🎯 Immediate Priority Action:",
                "🎯 प्रथम कर्तव्य:",
                "🎯 మొదట చేయవలసిన కర్తవ్యం:",
                "🎯 முதலில் செய்ய வேண்டிய கடமை:"
              ])}
            </span>
          </div>
        )}

        {/* 4 PILLARS FOR NON-ASTROLOGY USERS: SINGLE CLEAN BACKGROUND, NO NESTED PATCHWORK */}
        {/* Pillar 1: Root Cause / What is the Issue? */}
        <div style={{ paddingTop: "2px" }}>
          <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
            {t.pillar1Question}
          </div>
          <div style={{ color: INK_DEEP, marginTop: "4px", fontSize: "12.5px", lineHeight: 1.65, wordSpacing: "1.2px", letterSpacing: "0.15px" }}>
            {cleanDegreesFromText(getLangVal(dosha.technicalWhy) || getLangVal((dosha as any).technicalReason))}
          </div>
        </div>

        {/* Pillar 2: Real Life Impact / What is it Doing in Life Now? */}
        <div style={{ borderTop: "1px solid #F1E8D9", paddingTop: "8px" }}>
          <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
            {t.pillar2Question}
          </div>
          <div style={{ color: INK_DEEP, marginTop: "4px", fontSize: "12.5px", lineHeight: 1.65, wordSpacing: "1.2px", letterSpacing: "0.15px" }}>
            {getLangVal(dosha.currentLifeProblems) || getLangVal(dosha.lifeImpact)}
          </div>
          {/* Dasha Resonance if available */}
          {dosha.dashaResonance && (
            <div
              style={{
                borderLeft: `3px solid ${GOLD_LIGHT}`,
                paddingLeft: "10px",
                fontSize: "12px",
                color: INK_DEEP,
                lineHeight: 1.55,
                marginTop: "6px",
                wordSpacing: "1px"
              }}
            >
              <strong style={{ color: GOLD_DARK }}>⏳ {t.dashaResonanceLabel} </strong>
              <span>{getLangVal(dosha.dashaResonance)}</span>
            </div>
          )}
        </div>

        {/* Pillar 3: Prescribed Remedy & Sacred Gokarna Seva / What is the Solution? */}
        <div style={{ borderTop: "1px solid #F1E8D9", paddingTop: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
            <div>
              <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
                {t.pillar3Question}
              </div>
              <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "4px", fontSize: "12.5px", lineHeight: 1.55, wordSpacing: "1px" }}>
                {getLangVal(dosha.recommendedPooja)}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
                📿 {t.mantraLabel}
              </div>
              <div style={{ color: INK_DEEP, marginTop: "4px", fontSize: "12.5px", lineHeight: 1.55, wordSpacing: "1px" }}>
                {getLangArr(dosha.remedies).slice(0, 2).join(" • ")}
              </div>
            </div>
          </div>

          {/* Subconscious Fear */}
          {dosha.subconsciousFear && (
            <div
              style={{
                marginTop: "6px",
                borderLeft: `3px solid ${GOLD_LIGHT}`,
                paddingLeft: "10px",
                fontSize: "12px",
                color: INK_DEEP,
                lineHeight: 1.5,
                wordSpacing: "1px"
              }}
            >
              <strong style={{ color: GOLD_DARK }}>🧠 {snip.subconsciousFear} </strong>
              <span>{getLangVal(dosha.subconsciousFear)}</span>
            </div>
          )}

          {/* Completed Narration vs Conditional Guidance */}
          {isCompleted ? (
            <div
              style={{
                borderLeft: "3px solid #166534",
                paddingLeft: "10px",
                marginTop: "6px",
                fontSize: "12px",
                color: "#166534",
                lineHeight: 1.5,
                wordSpacing: "1px"
              }}
            >
              <strong>✓ {snip.shantiCompleted} </strong>
              <span>{getLangVal(dosha.alreadyDoneNarration)}</span>
            </div>
          ) : (
            dosha.conditionalGuidance && (
              <div
                style={{
                  borderLeft: `3px solid ${GOLD_LIGHT}`,
                  paddingLeft: "10px",
                  marginTop: "6px",
                  fontSize: "12px",
                  color: INK_DEEP,
                  lineHeight: 1.5,
                  wordSpacing: "1px"
                }}
              >
                <strong style={{ color: GOLD_DARK }}>💡 {snip.guidance} </strong>
                <span>
                  {stripDuplicatePrefix(getLangVal(dosha.conditionalGuidance), [
                    "ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:",
                    "Special Guidance:",
                    "विशेष मार्गदर्शन:",
                    "ప్రత్యేక మార్గదర్శకత్వం:",
                    "சிறப்பு வழிகாட்டுதல்:"
                  ])}
                </span>
              </div>
            )
          )}
        </div>

        {/* Pillar 4: Expected Life Improvement & Positive Transformations / What Will Happen After? */}
        <div style={{ borderTop: "1px solid #F1E8D9", paddingTop: "8px" }}>
          <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
            {t.pillar4Question}
          </div>
          <div style={{ color: INK_DEEP, fontWeight: 600, marginTop: "4px", fontSize: "12.5px", lineHeight: 1.6, wordSpacing: "1.2px", letterSpacing: "0.15px" }}>
            {getExpectedImprovementAfterParihara(dosha.id, code)}
          </div>
        </div>
      </div>
    );
  };

  // 4-PAGE LUXURY MASTER DOSSIER ARCHITECTURE (BALANCED & FULL A4 UTILIZATION):
  // Page 1: Devotee Profile Matrix, Age Strategy & Primary Urgent Karmic Affliction (#1). (NO BLANK SPACE).
  // Page 2: Secondary Affliction (#2, e.g. Kuja Dosha in Full Depth) & Parashari Protective Counterbalance. (NO CUT-OFF).
  // Page 3: Natal Celestial Fortitude & Protection Shield (4 Houses) + Gochara Planetary Transits. (NO 25% EMPTY SPACE).
  // Page 4: Critical Life Hazards (Gandantara), Fears, Gokarna Temple Sevas & Chief Priest Blessings. (FULL A4).
  const primaryDosha = activeDoshas[0] || null;
  const secondaryDoshas = activeDoshas.slice(1);

  return (
    <div
      id={id}
      style={{
        width: "900px",
        fontFamily: fontStack,
        color: INK_DEEP,
        WebkitFontSmoothing: "antialiased",
        letterSpacing: "0.2px",
        lineHeight: 1.6,
        wordBreak: "break-word",
        overflowWrap: "break-word",
        backgroundColor: PARCHMENT_BG
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: DEVOTEE PROFILE, AGE DIRECTIVE & PRIMARY URGENT DOSHA (#1)    */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          minWidth: "900px",
          maxWidth: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack,
          display: "block"
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        {/* Ornate Gold Landline Border Frame with Double Lines & Corner Florets */}
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3px double ${GOLD_BORDER}`,
            outline: `1px solid rgba(180, 83, 9, 0.25)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "16px 20px",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner with Lord Shiva and Lord Surya Sacred Medallions */}
          {renderRoyalHeader(1, t.page1Title || t.mainTitle, t.shloka)}

          {renderGoldLandlineDivider(snip.divNative)}

          {/* Devotee Info Matrix & Karmic Assessment Grid */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "14px 20px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1.1fr 1.1fr 1.15fr", gap: "10px 16px", fontSize: "12.5px", lineHeight: 1.6, wordSpacing: "1px" }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>👤 {t.nativeDetails}:</span>{" "}
                <span style={{ fontWeight: 900, color: INK_DEEP, fontSize: "15.5px" }}>{devoteeInfo.name}</span>
                <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "4px", lineHeight: 1.5 }}>
                  📅 {[devoteeInfo.birthDate, devoteeInfo.birthTime].filter(Boolean).join(" • ")}
                  {devoteeInfo.place ? ` · 📍 ${devoteeInfo.place}` : ""}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>🏛️ {t.lagnaLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: INK_DEEP, fontSize: "14px" }}>
                  {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}
                </span>
                <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "4px", lineHeight: 1.5 }}>
                  🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>⭐ {t.nakshatraLabel}</span>{" "}
                <span style={{ fontWeight: 800, color: INK_DEEP, fontSize: "14px" }}>
                  {devoteeInfo.nakshatraRecord?.[code] || devoteeInfo.nakshatra} ({devoteeInfo.pada})
                </span>
                <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "4px", lineHeight: 1.5 }}>
                  ⏳ {t.dashaLabel} {devoteeInfo.currentDashaRecord?.[code] || devoteeInfo.currentDashaStr}
                </div>
              </div>

              <div style={{ backgroundColor: "#F7F3E9", border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "8px 12px", textAlign: "center", minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", lineHeight: 1.35 }}>
                  ⭐ {t.currentAgeLabel} {devoteeInfo.currentAge || devoteeInfo.devoteeAge} {snip.yearsUnit}
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: GOLD_PRIMARY, marginTop: "3px", lineHeight: 1.35 }}>
                  🔥 {activeDoshas.length} {t.activeDoshasCountLabel} ({devoteeInfo.ageStageNameRecord?.[code] || devoteeInfo.ageStageKey})
                </div>
              </div>
            </div>

            {/* Karmic Index Indicator Bar */}
            <div style={{ marginTop: "10px", paddingTop: "9px", borderTop: `1px dashed ${GOLD_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", lineHeight: 1.5 }}>
              <div style={{ display: "flex", gap: "16px", color: INK_MUTED, fontWeight: 700, wordSpacing: "1px" }}>
                <span>📋 {snip.evaluated} <strong style={{ color: INK_DEEP }}>{summary?.totalEvaluated || 18}</strong></span>
                <span>⚡ {snip.critical} <strong style={{ color: "#B91C1C" }}>{summary?.criticalCount || 0}</strong></span>
                <span>⚠️ {snip.moderate} <strong style={{ color: GOLD_PRIMARY }}>{(summary?.highCount || 0) + (summary?.moderateCount || 0)}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 800, color: GOLD_DARK }}>{snip.karmicVulnerability}</span>
                <span style={{ fontWeight: 900, color: GOLD_DARK, fontSize: "13px", backgroundColor: "#F7F3E9", padding: "3px 12px", borderRadius: "6px", border: `1px solid ${GOLD_BORDER}` }}>
                  {summary?.karmicIndexScore || 0}%
                </span>
              </div>
            </div>
          </div>

          {renderGoldLandlineDivider(t.ageDirectiveDivider)}

          {/* Age-Adaptive Priority Strategy Card */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "12px 18px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35, letterSpacing: "0.2px" }}>
                {t.ageStrategyHeading} ({devoteeInfo.ageStageNameRecord?.[code] || snip.agePrefix + (devoteeInfo.currentAge || devoteeInfo.devoteeAge)})
              </div>
              <div style={{ fontSize: "11px", backgroundColor: "#991B1B", color: "#FFFFFF", padding: "3px 10px", borderRadius: "6px", fontWeight: 800, border: `1px solid #7F1D1D`, letterSpacing: "normal", flexShrink: 0, lineHeight: 1.4 }}>
                ⚡ {t.agePriorityBadgeLabel}
              </div>
            </div>
            <div style={{ fontSize: "12.5px", color: INK_DEEP, fontWeight: 700, marginTop: "5px", lineHeight: 1.65, wordSpacing: "1.2px" }}>
              {getLangVal(devoteeInfo.currentAgeFocusSummary, snip.ageFocusFallback)}
            </div>
            <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "4px", fontStyle: "italic", lineHeight: 1.45, wordSpacing: "1px" }}>
              {t.ageStrategyNotice}
            </div>
          </div>

          {renderGoldLandlineDivider(snip.divPrimaryDosha)}

          {/* Primary Urgent Dosha Card (#1) */}
          <div style={{ flexShrink: 0 }}>
            {primaryDosha ? (
              renderDoshaCard(primaryDosha, true)
            ) : (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `2px dashed ${GOLD_BORDER}`,
                  borderRadius: "12px",
                  padding: "28px 20px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "18px", color: GOLD_DARK, fontWeight: 900 }}>
                  {t.noDoshaTitle}
                </div>
                <div style={{ fontSize: "13px", color: INK_MUTED, marginTop: "8px", lineHeight: 1.6, maxWidth: "680px", margin: "8px auto 0", wordSpacing: "1px" }}>
                  {t.noDoshaDesc}
                </div>
              </div>
            )}
          </div>

          {/* Page 1 Pinned Footer */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "10.5px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "6px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: SECONDARY KARMIC AFFLICTION (#2) & PARASHARI COUNTERBALANCE   */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          minWidth: "900px",
          maxWidth: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack,
          display: "block"
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3px double ${GOLD_BORDER}`,
            outline: `1px solid rgba(180, 83, 9, 0.25)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "16px 20px",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner */}
          {renderRoyalHeader(2, t.page2Title, t.shloka)}

          {renderGoldLandlineDivider(snip.divSecondaryDosha)}

          {/* Secondary Dosha (Dosha #2, e.g. Kuja Dosha in Full Depth with ZERO Cut-Off) */}
          <div style={{ flexShrink: 0 }}>
            {secondaryDoshas.length > 0 ? (
              renderDoshaCard(secondaryDoshas[0], false)
            ) : (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1.5px solid ${GOLD_BORDER}`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(180, 83, 9, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.35, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "5px", letterSpacing: "0.2px" }}>
                  {t.planetaryHarmonyHeading}
                </div>
                <div style={{ fontSize: "13px", color: INK_DEEP, lineHeight: 1.7, wordSpacing: "1.2px" }}>
                  {t.planetaryHarmonyDesc}
                </div>
                <div style={{ backgroundColor: "#FCFBF9", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "12px 16px", fontSize: "12.5px", color: INK_DEEP, lineHeight: 1.6, wordSpacing: "1px" }}>
                  <strong style={{ color: GOLD_DARK }}>{t.gokarnaProtectionLabel} </strong>
                  <span>{t.gokarnaProtectionDesc}</span>
                </div>
              </div>
            )}
          </div>

          {renderGoldLandlineDivider(t.ageDirectiveDivider)}

          {/* Parashari Protective Counterbalance / Immediate Relief Guidance Card */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "14.5px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "5px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
              🔱 {code === "kn" ? "ಪರಿಹಾರ ಕಾಲಾವಧಿ & ದೈವಿಕ ಸಂಕಲ್ಪ ಮಾರ್ಗದರ್ಶನ" : code === "hi" ? "शांति काल एवं दैवीय संकल्प मार्गदर्शन" : code === "te" ? "పరిహార కాలం & దైవిక సంకల్ప మార్గదర్శనం" : code === "ta" ? "பரிகாரக் காலம் & தெய்வீக சங்கல்ப வழிகாட்டுதல்" : "Parihara Duration & Divine Resolution Guidance"}
            </div>
            <div style={{ fontSize: "12.5px", color: INK_DEEP, lineHeight: 1.7, marginTop: "8px", wordSpacing: "1.2px", letterSpacing: "0.15px" }}>
              {code === "kn"
                ? "ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ, ಈ ಪ್ರಮುಖ ಕರ್ಮ ದೋಷಗಳಿಗೆ ಸೂಚಿಸಲಾದ ಪವಿತ್ರ ಪರಿಹಾರ ಮತ್ತು ಮಂತ್ರ ಸಾಧನೆಯನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ೩೦ ರಿಂದ ೪೫ ದಿನಗಳ ಕಾಲ ಆಚರಿಸುವುದರಿಂದ ದೋಷದ ತೀವ್ರತೆಯು ಶಮನಗೊಳ್ಳುತ್ತದೆ. ಸಂಕಲ್ಪಿಸಿದ ಕಾರ್ಯಗಳಲ್ಲಿ ಎದುರಾಗುತ್ತಿದ್ದ ಕಠಿಣ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ."
                : code === "hi"
                ? "शास्त्रों के अनुसार, इन प्रमुख कर्म दोषों हेतु निर्देशित पवित्र परिहार एवं मंत्र साधना को 30 से 45 दिनों तक श्रद्धापूर्वक करने से दोष का अनिष्ट प्रभाव शांत हो जाता है। जीवन में आ रही रुकावटें दूर होकर आर्थिक स्थिरता एवं पारिवारिक शांति प्राप्त होती है।"
                : code === "te"
                ? "శాస్త్రాల ప్రకారం, ఈ ప్రధాన కర్మ దోషాలకు సూచించిన పవిత్ర పరిహారం మరియు మంత్ర సాధనను 30 నుండి 45 రోజుల పాటు శ్రద్ధతో పాటించడం వల్ల దోష తీవ్రత తగ్గుతుంది. ఆటంకాలు తొలగి, ఆర్థిక స్థిరత్వం మరియు కుటుంబ శాంతి లభిస్తుంది."
                : code === "ta"
                ? "சாஸ்திரங்களின்படி, இந்த முக்கிய கர்ம தோஷங்களுக்குரிய பரிகாரத்தை 30 முதல் 45 நாட்கள் வரை நம்பிக்கையுடன் செய்வதன் மூலம் தோஷத்தின் தாக்கம் குறையும். தடைகள் நீங்கி, நல்வாழ்வும் மனசாந்தியும் உண்டாகும்."
                : "According to classical Vedic scriptures, performing these sacred remedies and dedicated mantra japa for 30 to 45 days brings profound pacification of these primary karmic afflictions, dissolving stubborn obstacles and unlocking peace, health, and prosperity."}
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: INK_DEEP, marginTop: "10px", lineHeight: 1.55, wordSpacing: "1px" }}>
              <strong style={{ color: GOLD_DARK }}>{t.gokarnaProtectionLabel} </strong>
              <span>{t.gokarnaProtectionDesc}</span>
            </div>
          </div>

          {/* Page 2 Pinned Footer */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "10.5px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "6px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page2Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 3: NATAL FORTITUDE SHIELD (4 HOUSES) & PLANETARY TRANSITS        */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          minWidth: "900px",
          maxWidth: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack,
          display: "block"
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3px double ${GOLD_BORDER}`,
            outline: `1px solid rgba(180, 83, 9, 0.25)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "16px 20px",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner */}
          {renderRoyalHeader(3, t.page3Title, t.shloka)}

          {renderGoldLandlineDivider(t.protectionShieldDivider)}

          {/* Natal Planetary Fortitude & Protection Shield (4 houses 2x2 grid) */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "5px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
              🪐 {t.chartBalanceHeading}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px", lineHeight: 1.55 }}>
              <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "12px 16px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: GOLD_DARK, fontSize: "13.5px", lineHeight: 1.3, letterSpacing: "0.2px" }}>🏛️ {t.lagnaLabel} {devoteeInfo.lagnaRashiRecord?.[code] || devoteeInfo.lagnaRashi}</div>
                <div style={{ color: INK_DEEP, marginTop: "4px", lineHeight: 1.6, wordSpacing: "1px" }}>
                  {snip.lagnaFortitude}
                </div>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "12px 16px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: GOLD_DARK, fontSize: "13.5px", lineHeight: 1.3, letterSpacing: "0.2px" }}>🌙 {t.rashiLabel} {devoteeInfo.moonRashiRecord?.[code] || devoteeInfo.moonRashi}</div>
                <div style={{ color: INK_DEEP, marginTop: "4px", lineHeight: 1.6, wordSpacing: "1px" }}>
                  {snip.chandraFortitude}
                </div>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "12px 16px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: GOLD_DARK, fontSize: "13.5px", lineHeight: 1.3, letterSpacing: "0.2px" }}>☀️ {snip.suryaFortitudeTitle}</div>
                <div style={{ color: INK_DEEP, marginTop: "4px", lineHeight: 1.6, wordSpacing: "1px" }}>
                  {snip.suryaFortitudeDesc}
                </div>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "12px 16px", minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: GOLD_DARK, fontSize: "13.5px", lineHeight: 1.3, letterSpacing: "0.2px" }}>🪔 {snip.trikonaFortitudeTitle}</div>
                <div style={{ color: INK_DEEP, marginTop: "4px", lineHeight: 1.6, wordSpacing: "1px" }}>
                  {snip.trikonaFortitudeDesc}
                </div>
              </div>
            </div>

            {/* Parashari Benefic Shield Banner */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${GOLD_LIGHT}`,
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "12.5px",
                color: INK_DEEP,
                lineHeight: 1.6,
                wordSpacing: "1px"
              }}
            >
              <strong style={{ color: GOLD_DARK }}>🔱 {snip.parashariProtocol} </strong>
              <span>{snip.parashariRuleDesc}</span>
            </div>
          </div>

          {renderGoldLandlineDivider(snip.divSecondaryDosha)}

          {/* Planetary Transits, Gochara Guidance & Additional Afflictions */}
          <div style={{ flexShrink: 0 }}>
            {secondaryDoshas.length > 1 ? (
              renderDoshaCard(secondaryDoshas[1], false)
            ) : (
              <div
                style={{
                  backgroundColor: "#FCFBF9",
                  border: `1.5px solid ${GOLD_BORDER}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ fontSize: "14.5px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "5px", lineHeight: 1.35, letterSpacing: "0.2px" }}>
                  🪐 {code === "kn" ? "ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ, ಸಾಡೇ ಸಾತಿ & ದೈವಿಕ ರಕ್ಷಣೆ" : code === "hi" ? "गोचर ग्रह प्रभाव, साढ़े साती एवं दैवीय सुरक्षा" : code === "te" ? "గోచార గ్రహ ప్రభావం, సాడే సాతి & దైవిక రక్షణ" : code === "ta" ? "கோசார கிரக தாக்கம், ஏழரை சனி & தெய்வீக பாதுகாப்பு" : "Planetary Transits, Sade Sati & Divine Safeguards"}
                </div>
                <div style={{ fontSize: "12.5px", color: INK_DEEP, lineHeight: 1.7, marginTop: "4px", wordSpacing: "1.2px", letterSpacing: "0.15px" }}>
                  {code === "kn"
                    ? "ಗೋಚಾರದಲ್ಲಿ ಶನಿ ಮಹಾತ್ಮನ ಸಂಚಾರ, ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷ ಬದಲಾವಣೆ ಅಥವಾ ಗುರು ಗ್ರಹದ ವಕ್ರ ಸಂಚಾರವು ಕುಂಡಲಿಯ ಪ್ರಮುಖ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಭಾವಗಳ ಮೇಲೆ ಸದಾ ಪರಿಣಾಮ ಬೀರುತ್ತಿರುತ್ತದೆ. ಜಾತಕರ ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲದಲ್ಲಿ ನಿತ್ಯ ಗಾಯತ್ರಿ ಜಪ, ಶಿವನಾಮ ಸ್ಮರಣೆ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ನಿತ್ಯ ಅರ್ಚನೆಯು ಸಕಲ ಗ್ರಹ ಬಾಧೆಗಳನ್ನು ಶಮನಗೊಳಿಸಿ, ಸರ್ವತ್ರ ಜಯವನ್ನು ತರಲಿದೆ."
                    : code === "hi"
                    ? "गोचर में शनि देव का संचार, राहु-केतु का अक्ष परिवर्तन अथवा गुरु की स्थिति कुंडली के प्रमुख भावों पर निरंतर प्रभाव डालती है। वर्तमान दशा काल में नित्य गायत्री जप, शिव आराधना तथा गोकर्ण महाबलेश्वर की नित्य पूजा समस्त ग्रह बाधाओं को शांत कर जीवन में सफलता प्रदान करती है।"
                    : code === "te"
                    ? "గోచారంలో శని సంచారం, రాహు-కేతువుల స్థాన చలనం లేదా గురు గ్రహ ప్రభావం కుండలిలోని ప్రధాన భావాలపై నిరంతరం ప్రభావం చూపుతాయి. ప్రస్తుత దశా కాలంలో నిత్య గాయత్రీ జపం, శివారాధన మరియు గోకర్ణ మహాబలేశ్వర నిత్య పూజ సమస్త గ్రహ బాధలను నివారించి విజయాన్ని చేకూరుస్తాయి."
                    : code === "ta"
                    ? "கோசாரத்தில் சனி பகவானின் சஞ்சாரம், ராகு-கேது பெயர்ச்சி மற்றும் குருவின் நிலை ஜாதகத்தின் முக்கிய பாவங்களை பாதிக்கின்றன. தற்போதைய திசை காலத்தில் நித்திய காயத்ரி ஜபம், சிவ வழிபாடு மற்றும் கோகர்ண மகாபலேஸ்வரர் பூஜை சகல தோஷங்களையும் போக்கி வெற்றியைத் தரும்."
                    : "Planetary transits of Saturn, Rahu-Ketu, or Jupiter across sensitive natal axes interact dynamically with running dashas. Daily sacred Gayatri mantra japa, Shiva archana, and Sri Gokarna Mahabaleshwara's divine grace neutralize transit friction, protect health, and bestow comprehensive victory."}
                </div>
                <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${GOLD_LIGHT}`, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: INK_DEEP, marginTop: "6px", lineHeight: 1.55, wordSpacing: "1px" }}>
                  <strong style={{ color: GOLD_DARK }}>🔱 {t.gokarnaProtectionLabel} </strong>
                  <span>{t.gokarnaProtectionDesc}</span>
                </div>
              </div>
            )}
          </div>

          {/* Page 3 Pinned Footer */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "10.5px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "6px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page3Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 4: LIFE HAZARDS, FEARS, TEMPLE REMEDIES & PRIEST BLESSING         */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          minWidth: "900px",
          maxWidth: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          backgroundColor: PARCHMENT_BG,
          color: INK_DEEP,
          fontFamily: fontStack,
          display: "block"
        }}
      >
        {/* Subtle Sacred Sri Yantra / Atma Linga Watermark Overlay */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "520px",
            height: "520px",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0
          }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="95" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="86" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="76" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,20 170,140 30,140" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,180 30,60 170,60" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,32 158,132 42,132" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,168 42,68 158,68" stroke="#B45309" strokeWidth="1" />
          <polygon points="100,48 145,124 55,124" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="100,152 55,76 145,76" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="24" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="#B45309" />
        </svg>

        <div
          style={{
            width: "100%",
            height: "100%",
            border: `3px double ${GOLD_BORDER}`,
            outline: `1px solid rgba(180, 83, 9, 0.25)`,
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "16px 20px",
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 4 Corner Florets */}
          <div style={{ position: "absolute", top: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", left: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "7px", right: "9px", color: GOLD_PRIMARY, fontSize: "14px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner with Lord Shiva and Lord Surya Sacred Imagery */}
          {renderRoyalHeader(4, t.page4Title, t.page2Shloka)}

          {renderGoldLandlineDivider(t.gandantaraDivider)}

          {/* Section: Critical Gandantara Hazards & Protective Age Windows */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "12px 18px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "4px", gap: "8px" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3, letterSpacing: "0.2px" }}>
                {t.gandantaraHeading}
              </div>
              <div style={{ fontSize: "11.5px", color: INK_MUTED, fontWeight: 700, flexShrink: 0, wordSpacing: "1px" }}>
                {gandantaras.filter(g => g.isCurrentlyInDangerWindow).length > 0
                  ? `${gandantaras.filter(g => g.isCurrentlyInDangerWindow).length} ${snip.hazardsActiveSuffix}`
                  : snip.allHazardSafe}
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "3px", fontStyle: "italic", lineHeight: 1.45, wordSpacing: "1px" }}>
              {t.gandantaraNotice}
            </div>

            {/* Gandantara Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "7px" }}>
              {gandantaras.length === 0 ? (
                <div style={{ textAlign: "center", padding: "10px", color: GOLD_DARK, fontWeight: 700, fontSize: "12.5px", lineHeight: 1.5, wordSpacing: "1px" }}>
                  ✓ {snip.noGandantaraDetected}
                </div>
              ) : (
                gandantaras.slice(0, 3).map((g) => {
                  const isDanger = g.isCurrentlyInDangerWindow;
                  return (
                    <div
                      key={g.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: `1.5px solid ${isDanger ? GOLD_LIGHT : GOLD_BORDER}`,
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        lineHeight: 1.55,
                        wordSpacing: "1px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ fontWeight: 900, color: isDanger ? GOLD_DARK : "#78350F", fontSize: "12.5px", lineHeight: 1.3, minWidth: 0, letterSpacing: "0.2px" }}>
                          {isDanger ? "⚡" : "✓"} {getLangVal(g.name)}
                        </div>
                        <span
                          style={{
                            backgroundColor: isDanger ? "#991B1B" : "#FEFAF0",
                            color: isDanger ? "#FFFFFF" : "#78350F",
                            fontSize: "11px",
                            fontWeight: 900,
                            padding: "3px 9px",
                            borderRadius: "5px",
                            border: `1px solid ${isDanger ? "#7F1D1D" : GOLD_BORDER}`,
                            letterSpacing: "normal",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            lineHeight: 1.4
                          }}
                        >
                          {isDanger
                            ? `${t.safeAgeLimitLabel} ${g.vulnerableTillAge} ${snip.yearsTillUnit}`
                            : `✓ ${snip.safeAgePassed} (${g.vulnerableTillAge} ${snip.yearsUnit})`}
                        </span>
                      </div>

                      {isDanger ? (
                        <>
                          <div style={{ color: GOLD_DARK, fontWeight: 700, marginTop: "4px", lineHeight: 1.5 }}>
                            ⛔ {t.mandatoryPrecautionLabel} {getLangArr(g.cautionDirectives).slice(0, 2).join(" • ") || cleanDegreesFromText(getLangVal(g.technicalReason))}
                          </div>
                          <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "3px", lineHeight: 1.5 }}>
                            🛡️ {t.protectiveMantraLabel} {[getLangVal(g.protectiveParihara), getLangArr(g.protectiveMantras)[0]].filter(Boolean).join(" • ")}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "#78350F", fontWeight: 700, marginTop: "4px", lineHeight: 1.5 }}>
                          ✓ {snip.safeThresholdSurpassedDesc(g.vulnerableTillAge)}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sacred Guidance Box */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${GOLD_LIGHT}`,
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11.5px",
                color: INK_DEEP,
                lineHeight: 1.5,
                marginTop: "7px",
                wordSpacing: "1px"
              }}
            >
              <strong style={{ color: GOLD_DARK }}>🔱 {snip.parashariProtocol}</strong>{" "}
              <span>{snip.parashariRuleDesc}</span>
            </div>
          </div>

          {renderGoldLandlineDivider(t.fearsAndSevasDivider)}

          {/* Section: Subconscious Innate Phobias & Fears */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "12px 18px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "4px", lineHeight: 1.3, letterSpacing: "0.2px" }}>
              🧠 {t.fearsHeading}
            </div>
            <div style={{ fontSize: "11.5px", color: INK_MUTED, marginTop: "3px", fontStyle: "italic", lineHeight: 1.45, wordSpacing: "1px" }}>
              {t.fearsSubheading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
              {fears.slice(0, 2).map((fear) => (
                <div
                  key={fear.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "11.5px",
                    lineHeight: 1.5,
                    minWidth: 0
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3, minWidth: 0, fontSize: "12px", letterSpacing: "0.2px" }}>
                      {fear.icon} {getLangVal(fear.name)}
                    </div>
                    <span style={{ fontSize: "10.5px", backgroundColor: "#FCFBF9", color: GOLD_DARK, padding: "2px 7px", borderRadius: "4px", fontWeight: 700, border: `1px solid ${GOLD_LIGHT}`, flexShrink: 0 }}>
                      {getFearSeverityLabel(fear.severity, code)}
                    </span>
                  </div>
                  <div style={{ color: INK_MUTED, marginTop: "4px", lineHeight: 1.45, wordSpacing: "1px" }}>
                    <strong>{t.symptomLabel}</strong> {getLangVal(fear.psychologicalSymptom)}
                  </div>
                  <div style={{ color: INK_DEEP, fontWeight: 700, marginTop: "4px", lineHeight: 1.45, wordSpacing: "1px" }}>
                    <strong style={{ color: GOLD_DARK }}>{t.strengtheningPracticeLabel}</strong> {getLangVal(fear.strengtheningPractice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Sacred Gokarna Mahabaleshwara Remedies tailored to Age Stage */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "12px 18px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 900, color: GOLD_DARK, borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "4px", lineHeight: 1.3, letterSpacing: "0.2px" }}>
              🪔 {t.templeRemediesHeading}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px", fontSize: "12px", lineHeight: 1.5 }}>
              {ageStageRemedies.map((remedy, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderRadius: "8px",
                    padding: "8px 12px",
                    minWidth: 0
                  }}
                >
                  <div style={{ fontWeight: 800, color: GOLD_DARK, lineHeight: 1.3, fontSize: "12.5px", letterSpacing: "0.2px" }}>
                    {remedy.icon} {remedy.title}
                  </div>
                  <div style={{ color: INK_DEEP, marginTop: "3px", lineHeight: 1.5, wordSpacing: "1px" }}>
                    {remedy.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {renderGoldLandlineDivider(snip.divPriestBlessing)}

          {/* Section: Chief Priest Shreeram Pandit's Blessing, Official Temple Seal & Scannable QR Code */}
          <div
            style={{
              backgroundColor: "#FCFBF9",
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "12px",
              padding: "12px 18px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.04)",
              flexShrink: 0
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${GOLD_LIGHT}`, paddingBottom: "4px" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3, letterSpacing: "0.2px" }}>
                🙏 {t.priestBlessingHeading}
              </div>
              <div style={{ fontSize: "12px", color: GOLD_DARK, fontWeight: 800 }}>
                {displayPriestPhone}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "68px 1fr 120px", gap: "12px", marginTop: "8px", alignItems: "center" }}>
              {/* Priest & Gokarnanatha Sacred Emblem */}
              <div style={{ textAlign: "center" }}>
                <img
                  src="/daily_posters/poster_1_shiva.jpg"
                  alt="Chief Priest Sanctum Medallion"
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    border: "2px solid #FDE68A",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
                    objectFit: "cover",
                    backgroundColor: "#FEF3C7",
                    display: "inline-block"
                  }}
                />
                <div style={{ fontSize: "9px", fontWeight: 900, color: GOLD_PRIMARY, marginTop: "3px" }}>
                  {snip.gokarnanathaMedallion}
                </div>
              </div>

              {/* Priest Ashirvada Sanskrit Verse & Meaning */}
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 900, color: GOLD_DARK, lineHeight: 1.3, letterSpacing: "0.2px" }}>
                  {displayPriestName}
                </div>
                <div style={{ fontSize: "11.5px", color: INK_MUTED, fontWeight: 700, marginTop: "2px" }}>
                  {t.priestTitle} · {displayPriestPhone}
                </div>
                <div style={{ fontSize: "12px", color: GOLD_DARK, fontStyle: "italic", marginTop: "4px", lineHeight: 1.45, fontWeight: 700, wordSpacing: "1px" }}>
                  {t.sanskritAshirvada}
                </div>
                <div style={{ fontSize: "11.5px", color: INK_DEEP, marginTop: "3px", lineHeight: 1.5, wordSpacing: "1px" }}>
                  {t.ashirvadaMeaning}
                </div>
              </div>

              {/* Official Sannidhi Mudre & Live Verification QR Code */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 10px",
                  backgroundColor: "#FFFFFF",
                  border: `1.5px solid ${GOLD_BORDER}`,
                  borderRadius: "8px",
                  textAlign: "center"
                }}
              >
                {internalQr ? (
                  <>
                    <img
                      src={internalQr}
                      alt="Online Verification QR"
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "5px",
                        border: `1px solid ${GOLD_LIGHT}`,
                        backgroundColor: "#FFFFFF"
                      }}
                    />
                    <div style={{ fontSize: "8.5px", color: GOLD_DARK, fontWeight: 900, marginTop: "3px", lineHeight: 1.1 }}>
                      {t.scanToVerify}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "6px" }}>
                    <div style={{ fontSize: "22px" }}>🔱</div>
                    <div style={{ fontSize: "9.5px", color: GOLD_DARK, fontWeight: 900, marginTop: "2px" }}>
                      {code === "kn" ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥" : code === "hi" ? "॥ गोकर्ण सन्निधि ॥" : code === "te" ? "॥ గోకర్ణ సన్నిధి ॥" : code === "ta" ? "॥ கோகர்ண சந்நிதி ॥" : "॥ Sri Gokarna ॥"}
                    </div>
                    <div style={{ fontSize: "8.5px", color: GOLD_PRIMARY, fontWeight: 800, marginTop: "2px" }}>
                      {t.officialSealLabel}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page 4 Pinned Footer */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "10.5px",
              color: GOLD_DARK,
              fontWeight: 800,
              borderTop: `1.5px dashed ${GOLD_LIGHT}`,
              paddingTop: "6px",
              flexShrink: 0,
              lineHeight: 1.4,
              letterSpacing: "normal"
            }}
          >
            {t.page4Footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KundliDoshaPdfTemplate;
