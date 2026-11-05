import { transliterateName, transliterateIndicToLatin } from "../../utils/transliterator";
import React from "react";
import { type KundliRemedyDiagnosis, type SupportedLanguage, computeMandalaVrataSadhana } from "../../features/remedies/kundliRemedyEngine";
import { PlanetName } from "../../core/AstroTypes";
import { getRemedyJapaForGraha } from "../../features/remedies/kundliPersonalRemedyJapaEngine";

export type KundliRemedyPdfTemplateProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang?: string;
  overridePriestName?: string;
  overridePriestPhone?: string;
};

// UI Localization Dictionary for PDF (5 Languages)
export const PDF_I18N: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ",
    page2Title: "ಮನಃಶಾಂತಿ ಸಾಧನೆ, ದೈನಂದಿನ ಶಾಂತಿ ದಿನಚರ್ಯೆ & ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ",
    page3Title: "ದಶಾ-ಭುಕ್ತಿ ಫಲ, ಗೋಚಾರ ಪರಿಹಾರ, ವೈದಿಕ ಗ್ರಹ ಶಾಂತಿ ಮಂತ್ರ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ",
    page4Title: "ದಶಾ-ಭುಕ್ತಿ ಫಲ, ಗೋಚಾರ ಪರಿಹಾರ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ",
    dhyanaShloka: "॥ ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ । ಚಂದ್ರಶೇಖರಂ ಪ್ರಣಮಾಮಿ ಸರ್ವ ಶಾಂತಿ ಪ್ರದಾಯಕಮ್ ॥",
    mandalaBanner: "॥ ಏಕ ಮಂಡಲ ತಪಸ್ಸಿನಿಂದ ಸಮಸ್ತ ಕರ್ಮ ಕಲ್ಮಷ ಶಮನ & ಸಂಕಲ್ಪ ಸಿದ್ಧಿ ॥",
    devotee: "ಜಾತಕರು:",
    gotraSuffix: "ಗೋತ್ರ",
    lagna: "ಲಗ್ನ:",
    rashi: "ರಾಶಿ:",
    nakshatra: "ನಕ್ಷತ್ರ:",
    birthDetails: "ಜನನ ವಿವರ:",
    panchangaTithiVara: "ತಿಥಿ & ವಾರ:",
    narrationHeader: "॥ ಶ್ರೀ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ & ಸಂದೇಶ ॥",
    narrationBadge: "ಅಧಿಕೃತ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ",
    sec1Title: "೧. ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ & ಮುಖ್ಯ ಸವಾಲು",
    krodhaLabel: "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ",
    manasLabel: "ಮನೋ ಶಾಂತಿ",
    vitalityLabel: "ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ",
    patienceLabel: "ತಾಳ್ಮೆ / ಧೃತಿ",
    sec2Title: "೨. ಪಂಚಾಂಗ ೫-ಅಂಗ ದೈವಿಕ ಸಾಧನೆ & ನಕ್ಷತ್ರ ವೃಕ್ಷ",
    sec3Title: "೩. ತಕ್ಷಣ ಕೋಪ, ಆವೇಶ & ಆತಂಕ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ",
    emergencyMantraTitle: "ಆಪತ್ಕಾಲೀನ ಮನಃಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಮನಸ್ಸಿನಲ್ಲೇ ೧೧ ಬಾರಿ ಜಪಿಸಿ):",
    sec4Title: "೪. ದೈನಂದಿನ ಪ್ರಾತಃಕಾಲ, ಮಧ್ಯಾಹ್ನ & ಸಂಧ್ಯಾಕಾಲದ ಶಾಂತಿ ನಿಯಮಾವಳಿ",
    morningTab: "🌅 ಮುಂಜಾನೆ (06:00 - 07:30)",
    afternoonTab: "🥗 ಮಧ್ಯಾಹ್ನ & ಸಾತ್ವಿಕ ಆಹಾರ",
    eveningTab: "🪔 ಮುಸ್ಸಂಜೆ & ರಾತ್ರಿ ಶಯನ",
    sec5Title: "೫. ಜನ್ಮ ಕುಂಡಲಿಗೆ ನಿಗದಿತ ದೈನಂದಿನ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ",
    stotraRules: "ಪಠಣ ನಿಯಮ:",
    stotraTiming: "ಸಮಯ:",
    stotraDirection: "ದಿಕ್ಕು:",
    stotraCount: "ಆವರ್ತನೆ:",
    stotraBenefits: "ಫಲಶೃತಿ:",
    dailySankalpaTitle: "🪔 ದೈನಂದಿನ ಶಾಂತಿ ಸಂಕಲ್ಪ & ಸನ್ನಿಧಾನದ ನಿಯಮಾವಳಿ",
    dailySankalpaText: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಮತ್ತು ಸೂರ್ಯಾಸ್ತ ಸಮಯದಲ್ಲಿ ಈ ನಿಯಮಗಳನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಪಾಲಿಸುವುದರಿಂದ ಜಾತಕದಲ್ಲಿನ ಪೀಡಾಕಾರಕ ಗ್ರಹಗಳ ಅಶಾಂತಿ ಶಮನಗೊಂಡು, ಕುಟುಂಬದಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ ದೈವಿಕ ನೆಮ್ಮದಿ ನೆಲೆಸುತ್ತದೆ.",
    vedicGrahaShantiTitle: "ವೈದಿಕ ಗ್ರಹ ಶಾಂತಿ ಮಂತ್ರ & ನಿತ್ಯ ೧೧ ಬಾರಿ ಜಪ ವಿಧಾನ",
    chant11TimesDaily: "ನಿತ್ಯ ೧೧ ಬಾರಿ ಜಪಿಸಿ",
    prescribedDeityLabel: "ಶಾಂತಿ ದೇವತೆ / ಗ್ರಹ",
    mantraMeaningLabel: "ಮಂತ್ರದ ದಿವ್ಯ ಅರ್ಥ",
    calmingBenefitLabel: "ಮನಃಶಾಂತಿ & ದೋಷ ಶಮನ ಫಲ",
    muhurthaTitle: "೬. ಜನ್ಮ ತಾರಾಬಲ ಆಧಾರಿತ ವ್ರತ ಆರಂಭ ಮುಹೂರ್ತ & ಸಾಧನಾ ವಿಧಿ",
    taraBalaLabel: "ತಾರಾಬಲ:",
    weekdayLabel: "ಶುಭ ವಾರ:",
    tithiLabel: "ಪ್ರಶಸ್ತ ತಿಥಿ:",
    timeWindowLabel: "ಶುಭ ಕಾಲ:",
    directionLabel: "ದಿಕ್ಕು & ಆಸನ:",
    threePhaseTitle: "೭. ೪೫-ದಿನಗಳ ೩-ಹಂತದ ಜೀವನ ಪರಿವರ್ತನಾ ಕಾಲಾವಧಿ (Three-Phase Roadmap)",
    phase1Label: "ಪ್ರಥಮ ಹಂತ (ದಿನ ೧ - ೧೫):",
    phase2Label: "ದ್ವಿತೀಯ ಹಂತ (ದಿನ ೧೬ - ೩೦):",
    phase3Label: "ತೃತೀಯ ಹಂತ (ದಿನ ೩೧ - ೪೫):",
    focusLabel: "ಸಾಧನಾ ಕೇಂದ್ರ:",
    reliefLabel: "ಅನುಭವಕ್ಕೆ ಬರುವ ಪರಿವರ್ತನೆ:",
    shiftLabel: "ಆಂತರಿಕ ಜಾಗೃತಿ:",
    japaFormulaTitle: "೮. ಲಘು ಪುರಶ್ಚರಣ ಮಂತ್ರ ಜಪ ಗಣಿತ & ಮಾಲಾ ನಿಯಮ",
    dailyJapaLabel: "ದೈನಂದಿನ ಜಪ:",
    totalJapaLabel: "೪೫ ದಿನಗಳ ಒಟ್ಟು ಜಪ:",
    malaLabel: "ನಿಗದಿತ ಜಪಮಾಲೆ:",
    malaRuleLabel: "ಮಾಲಾ ಜಪ ನಿಯಮ:",
    pathyaTitle: "೯. ಸಾತ್ವಿಕ ಆಹಾರ & ಆಚರಣಾ ಪಥ್ಯ ನಿಯಮಾವಳಿ (Sattvic Pathya & Niyama)",
    dietLabel: "ಆಹಾರ ಪಥ್ಯ:",
    conductLabel: "ಆಚರಣಾ ಶಿಸ್ತು:",
    charityLabel: "ಸಾಪ್ತಾಹಿಕ ದಾನ:",
    trackerTitle: "೧೦. ೪೫-ದಿನಗಳ ದೈನಂದಿನ ಸಂಕಲ್ಪ ಪರಿಶೀಲನಾ ಕೋಷ್ಟಕ (Daily Sadhana Checklist)",
    trackerSubtext: "ಪ್ರತಿದಿನ ಜಪ ಮತ್ತು ಸ್ತೋತ್ರ ಪೂರ್ಣಗೊಳಿಸಿದ ನಂತರ ಕೆಳಗಿನ ದಿನದ ಕೋಷ್ಟಕದಲ್ಲಿ ಸರಿಗುರುತು (✓) ಹಾಕಿ ಸಾಧನೆ ಮುಂದುವರಿಸಿ:",
    sankalpaBoxTitle: "ದೈವಿಕ ಮಂಡಲ ಸಂಕಲ್ಪ ಪ್ರತಿಜ್ಞೆ:",
    sec6Title: "೬. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಫಲ ಪರಿಹಾರ",
    currentDasha: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ & ಭುಕ್ತಿ:",
    activeKarmicFlow: "ದಶಾ ಪ್ರಭಾವ:",
    remedialStep: "ಪರಿಹಾರ ಕ್ರಮ:",
    sandhiKalaLabel: "ದಶಾ-ಸಂಧಿ ಕಾಲಾವಧಿ:",
    turnaroundTitle: "🌟 ಭಾಗ್ಯೋದಯ & ಪರಿಹಾರ ಕಾಲಾವಧಿ:",
    day10Title: "⚡ ೧೦ ದಿನಗಳ ನಿರಂತರ ಸಾಧನೆಯ ಅನುಭವ:",
    day15Title: "🌅 ೧೫ ದಿನಗಳ ನಂತರ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಜೀವನ ತಿರುವು:",
    beforeAfterTitle: "🔄 ಪರಿಹಾರ ಪೂರ್ವ vs ಪರಿಹಾರೋತ್ತರ ಫಲ:",
    elementalBalanceTitle: "🌿 ಪಂಚಭೂತ ಸಮನ್ವಯ ತತ್ತ್ವ:",
    sec7Title: "೭. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪವಿತ್ರ ಪರಿಹಾರಗಳು & ದಾನ",
    prescribedSeva: "ವಿಶೇಷ ಸೇವೆ:",
    rudraksha: "ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ:",
    gemstone: "ರತ್ನ / ಲೋಹ:",
    daana: "ದಾನ & ಗೋಸೇವೆ:",
    badhakeshLabel: "ಬಾಧಕ ಗ್ರಹ & ಅಡೆತಡೆ:",
    anupanaLabel: "ಪವಿತ್ರ ಅನುಪಾನ ತೀರ್ಥ:",
    adhidevataTitle: "ದಶಾಧಿಪತಿ ಅಧಿದೇವತೆ & ಪ್ರತ್ಯಧಿದೇವತೆ:",
    sec8Title: "೮. ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    templeSealLabel: "ಅಧಿಕೃತ ಮುದ್ರೆ",
    priestContact: "ದೂರವಾಣಿ:",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page3Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)",
    page4Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)"
  },
  en: {
    templeBanner: "॥ SRI GOKARNA MAHABALESHWARA TEMPLE · BAGGONA PANCHANGA ASTROLOGY ॥",
    mainTitle: "Personalized Kundali Astrological Remedy & Pacification Report",
    page2Title: "Daily Mind Pacification Protocol & Classical Vedic Stotra",
    page3Title: "Dasha-Bhukti, Live Transits, Vedic Graha Shanti Mantra, Gokarna Sevas & Blessings",
    page4Title: "Dasha-Bhukti, Live Transits, Vedic Graha Shanti Mantra, Gokarna Sevas & Blessings",
    dhyanaShloka: "॥ Shantakaram Bhujagashayanam Padmanabham Suresham | Chandrashekharam Pranamami Sarva Shanti Pradayakam ॥",
    mandalaBanner: "॥ Karma Purification & Sacred Sankalpa Manifestation via One Mandala ॥",
    devotee: "Devotee:",
    gotraSuffix: "Gotra",
    lagna: "Lagna:",
    rashi: "Rashi:",
    nakshatra: "Nakshatra:",
    birthDetails: "Birth Details:",
    panchangaTithiVara: "Tithi & Vara:",
    narrationHeader: "॥ Sacred Divine Astrological Narration & Astrologer's Guidance ॥",
    narrationBadge: "Authentic Chart Analysis",
    sec1Title: "1. Kundali Root Cause & Struggle Diagnosis",
    krodhaLabel: "Pitta / Anger Surge",
    manasLabel: "Mental Stability",
    vitalityLabel: "Vitality / Prana Force",
    patienceLabel: "Patience Index",
    sec2Title: "2. Panchanga 5-Anga Sacred Alignment & Astral Tree",
    sec3Title: "3. 4-Step Instant Anger & Stress Pacification Protocol",
    emergencyMantraTitle: "Emergency Mind Pacification Mantra (Chant 11 times in mind):",
    sec4Title: "4. Daily Morning & Evening Pacification Routine",
    morningTab: "🌅 Morning (06:00 - 07:30)",
    afternoonTab: "🥗 Afternoon & Sattvic Diet",
    eveningTab: "🪔 Twilight & Restful Sleep",
    sec5Title: "5. Designated Daily Classical Vedic Stotra",
    stotraRules: "Recitation Rules:",
    stotraTiming: "Best Time:",
    stotraDirection: "Direction:",
    stotraCount: "Count:",
    stotraBenefits: "Spiritual Benefits:",
    dailySankalpaTitle: "🪔 Daily Sacred Peace Sankalpa & Shastric Discipline",
    dailySankalpaText: "By observing these daily shastric disciplines at dawn and twilight with devotion, planetary afflictions are pacified, ensuring mental equilibrium, familial harmony, and divine grace.",
    vedicGrahaShantiTitle: "Sacred Vedic Graha Shanti Mantra & Daily 11-Time Japa",
    chant11TimesDaily: "Chant 11 Times Daily",
    prescribedDeityLabel: "Prescribed Deity / Graha",
    mantraMeaningLabel: "Sacred Meaning",
    calmingBenefitLabel: "Inner Peace & Pacification Result",
    muhurthaTitle: "6. Janma Tara Bala Auspicious Starting Muhurtha & Setup",
    taraBalaLabel: "Tara Bala:",
    weekdayLabel: "Ideal Weekday:",
    tithiLabel: "Auspicious Tithi:",
    timeWindowLabel: "Sacred Timing:",
    directionLabel: "Direction & Asana:",
    threePhaseTitle: "7. 45-Day Three-Phase Life Transformation Roadmap",
    phase1Label: "Phase 1 (Days 1 - 15):",
    phase2Label: "Phase 2 (Days 16 - 30):",
    phase3Label: "Phase 3 (Days 31 - 45):",
    focusLabel: "Core Focus:",
    reliefLabel: "Experiential Relief:",
    shiftLabel: "Subconscious Shift:",
    japaFormulaTitle: "8. Laghu Purashcharana Mantra Japa Formula & Mala Rules",
    dailyJapaLabel: "Daily Japa:",
    totalJapaLabel: "Total 45-Day Japa:",
    malaLabel: "Prescribed Mala:",
    malaRuleLabel: "Mala Discipline:",
    pathyaTitle: "9. Sacred Sattvic Pathya & Shastric Conduct Disciplines",
    dietLabel: "Sattvic Diet:",
    conductLabel: "Conduct Rules:",
    charityLabel: "Weekly Charity:",
    trackerTitle: "10. 45-Day Daily Sadhana Tick-off Grid (Daily Checklist)",
    trackerSubtext: "Mark a checkmark (✓) on each day after completing your daily japa and classical stotra recitation:",
    sankalpaBoxTitle: "Sacred Mandala Resolve Declaration:",
    sec6Title: "6. Active Dasha-Bhukti & Gochara (Transit) Shanti",
    currentDasha: "Active Dasha-Bhukti:",
    activeKarmicFlow: "Karmic Effect:",
    remedialStep: "Remedial Action:",
    sandhiKalaLabel: "Dasha-Sandhi Transition Phase:",
    turnaroundTitle: "🌟 Turnaround Window & Practice Milestones:",
    day10Title: "⚡ 10-Day Daily Practice Experience:",
    day15Title: "🌅 15-Day Transformation Breakthrough:",
    beforeAfterTitle: "🔄 Before vs After Transformation:",
    elementalBalanceTitle: "🌿 5 Cosmic Elements Balance:",
    sec7Title: "7. Sacred Sri Gokarna Mahabaleshwara Temple Remedies & Daana",
    prescribedSeva: "Prescribed Seva:",
    rudraksha: "Rudraksha:",
    gemstone: "Gemstone / Metal:",
    daana: "Daana & Goseva:",
    badhakeshLabel: "Badhaka Obstruction Planet:",
    anupanaLabel: "Sacred Anupana Vehicle:",
    adhidevataTitle: "Dasha Lord Adhidevata & Pratyadhidevata:",
    sec8Title: "8. Chief Priest Vedic Blessing & Official Temple Seal",
    templeSealLabel: "Official Temple Seal",
    priestContact: "Contact:",
    page1Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 1 of 3 (Continued...)",
    page2Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 2 of 3 (Continued...)",
    page3Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 3 of 3 (Complete)",
    page4Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 3 of 3 (Complete)"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित वैदिक ज्योतिषीय उपाय एवं मनःशांति रिपोर्ट",
    page2Title: "मनःशांति साधना, दैनिक शांति नियमावली एवं शास्त्रीय स्तोत्र",
    page3Title: "दशा-भुक्ति फल, गोचर शांति, वैदिक ग्रह शांति मंत्र, गोकर्ण क्षेत्र सेवाएं एवं अर्चक आशीर्वाद",
    page4Title: "दशा-भुक्ति फल, गोचर शांति, वैदिक ग्रह शांति मंत्र, गोकर्ण क्षेत्र सेवाएं एवं अर्चक आशीर्वाद",
    dhyanaShloka: "॥ शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं । चन्द्रशेखरं प्रणमामि सर्व शान्ति प्रदायकम् ॥",
    mandalaBanner: "॥ एक मंडल साधना से समस्त कर्मदोष निवारण एवं संकल्प सिद्धि ॥",
    devotee: "जातक:",
    gotraSuffix: "गोत्र",
    lagna: "लग्न:",
    rashi: "राशि:",
    nakshatra: "नक्षत्र:",
    birthDetails: "जन्म विवरण:",
    panchangaTithiVara: "तिथि एवं वार:",
    narrationHeader: "॥ श्री सन्निधान का विशेष दैविक ज्योतिषीय विश्लेषण एवं सन्देश ॥",
    narrationBadge: "प्रामाणिक कुंडली विश्लेषण",
    sec1Title: "१. कुंडली ग्रहदोष विश्लेषण एवं मुख्य चुनौती",
    krodhaLabel: "क्रोध / पित्त स्तर",
    manasLabel: "मानसिक शांति",
    vitalityLabel: "आत्मबल / प्राणशक्ति",
    patienceLabel: "धैर्य सूचकांक",
    sec2Title: "२. पंचांग ५-अंग दैवीय साधना एवं नक्षत्र वृक्ष",
    sec3Title: "३. तत्काल क्रोध एवं आवेग शमन हेतु ४-चरणीय विधि",
    emergencyMantraTitle: "आपत्कालीन मनःशांति बीज मंत्र (मन ही मन ११ बार जपें):",
    sec4Title: "४. दैनिक प्रातःकालीन एवं संध्याकालीन शांति नियमावली",
    morningTab: "🌅 प्रातःकाल (06:00 - 07:30)",
    afternoonTab: "🥗 दोपहर एवं सात्विक आहार",
    eveningTab: "🪔 सायंकाल एवं शयन",
    sec5Title: "५. कुंडली अनुसार निर्धारित दैनिक शास्त्रीय स्तोत्र",
    stotraRules: "पठन नियम:",
    stotraTiming: "समय:",
    stotraDirection: "दिशा:",
    stotraCount: "आवृत्ति:",
    stotraBenefits: "फलश्रुति:",
    dailySankalpaTitle: "🪔 दैनिक शांति संकल्प एवं सन्निधान नियमावली",
    dailySankalpaText: "प्रतिदिन प्रातःकाल एवं संध्याकाल इन शास्त्रोक्त नियमों का श्रद्धापूर्वक पालन करने से ग्रह दोष शांत होते हैं और मानसिक शांति प्राप्त होती है।",
    vedicGrahaShantiTitle: "वैदिक ग्रह शांति मंत्र एवं नित्य ११ बार जप विधि",
    chant11TimesDaily: "नित्य ११ बार जपें",
    prescribedDeityLabel: "शांति देवता / ग्रह",
    mantraMeaningLabel: "मंत्र का पावन अर्थ",
    calmingBenefitLabel: "मानसिक शांति एवं दोष शमन फल",
    muhurthaTitle: "६. जन्म ताराबल आधारित व्रत आरंभ मुहूर्त एवं साधना विधि",
    taraBalaLabel: "ताराबल:",
    weekdayLabel: "शुभ वार:",
    tithiLabel: "प्रशस्त तिथि:",
    timeWindowLabel: "शुभ काल:",
    directionLabel: "दिशा एवं आसन:",
    threePhaseTitle: "७. ४५-दिवसीय ३-चरणीय जीवन परिवर्तन समयावधि",
    phase1Label: "प्रथम चरण (दिन १ - १५):",
    phase2Label: "द्वितीय चरण (दिन १६ - ३०):",
    phase3Label: "तृतीय चरण (दिन ३१ - ४५):",
    focusLabel: "साधना केंद्र:",
    reliefLabel: "अनुभवजन्य परिवर्तन:",
    shiftLabel: "आंतरिक जागृति:",
    japaFormulaTitle: "८. लघु पुरश्चरण मंत्र जप गणित एवं माला नियम",
    dailyJapaLabel: "दैनिक जप:",
    totalJapaLabel: "४५ दिनों का कुल जप:",
    malaLabel: "निर्धारित जपमाला:",
    malaRuleLabel: "माला जप नियम:",
    pathyaTitle: "९. सात्विक आहार एवं आचरण पथ्य नियमावली",
    dietLabel: "आहार पथ्य:",
    conductLabel: "आचरण नियम:",
    charityLabel: "साप्ताहिक सेवा:",
    trackerTitle: "१०. ४५-दिवसीय दैनिक साधना चेकलिस्ट",
    trackerSubtext: "प्रतिदिन जप एवं स्तोत्र पूर्ण करने के उपरांत नीचे दिए गए दिन के कोष्ठक में सही का चिह्न (✓) लगाएं:",
    sankalpaBoxTitle: "दैविक मंडल संकल्प प्रतिज्ञा:",
    sec6Title: "६. वर्तमान दशा-भुक्ति एवं गोचर ग्रहफल शांति",
    currentDasha: "वर्तमान महादशा एवं भुक्ति:",
    activeKarmicFlow: "दशा प्रभाव:",
    remedialStep: "उपाय क्रम:",
    sandhiKalaLabel: "दशा-संधिकाल स्थिति:",
    turnaroundTitle: "🌟 भाग्योदय एवं दैनिक साधना समयावधि:",
    day10Title: "⚡ १० दिनों की साधना का अनुभव:",
    day15Title: "🌅 १५ दिनों के उपरांत जीवन परिवर्तन:",
    beforeAfterTitle: "🔄 उपाय पूर्व बनाम उपाय पश्चात प्रभाव:",
    elementalBalanceTitle: "🌿 पंचतत्व संतुलन सिद्धांत:",
    sec7Title: "७. श्री गोकर्ण महाबलेश्वर सन्निधि के पावन उपाय एवं दान",
    prescribedSeva: "विशेष सेवा:",
    rudraksha: "रुद्राक्ष धारण:",
    gemstone: "रत्न / धातु:",
    daana: "दान एवं गौसेवा:",
    badhakeshLabel: "बाधक ग्रह एवं बाधा:",
    anupanaLabel: "पवित्र अनुपान तीर्थ:",
    adhidevataTitle: "दशाधिपति अधिदेवता एवं प्रत्यधिदेवता:",
    sec8Title: "८. प्रधान अर्चक का आशीर्वचन एवं गोकर्ण मुद्रा",
    templeSealLabel: "आधिकारिक मुद्रा",
    priestContact: "संपर्क:",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ १/३ (आगे जारी...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/३ (आगे जारी...)",
    page3Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ ३/३ (संपूर्ण)",
    page4Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ ३/३ (संपूर्ण)"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి ఆధారిత దైవిక జ్యోతిష్య పరిహార & మనశ్శాంతి నివేదిక",
    page2Title: "మనశ్శాంతి సాధన, దైనందిన నియమావళి & జన్మ నక్షత్ర స్తోత్రం",
    page3Title: "దశా-భుక్తి ఫలం, గోచార పరిహారం, వైదిక గ్రహ శాంతి మంత్రం, గోకర్ణ క్షేత్ర సేవలు & అర్చకుల ఆశీర్వచనం",
    page4Title: "దశా-భుక్తి ఫలం, గోచార పరిహారం, వైదిక గ్రహ శాంతి మంత్రం, గోకర్ణ క్షేత్ర సేవలు & అర్చకుల ఆశీర్వచనం",
    dhyanaShloka: "॥ శాంతాకారం భుజగశయనం పద్మనాభం సురేశం । చంద్రశేఖరం ప్రణమామి సర్వ శాంతి ప్రదాయకమ్ ॥",
    mandalaBanner: "॥ ఏక మండల తపస్సుతో సమస్త కర్మదోష నివారణ & సంకల్ప సిద్ధి ॥",
    devotee: "జాతకుడు:",
    gotraSuffix: "గోత్రం",
    lagna: "లగ్నం:",
    rashi: "రాశి:",
    nakshatra: "నక్షత్రం:",
    birthDetails: "జన్మ వివరాలు:",
    panchangaTithiVara: "తిథి & వారం:",
    narrationHeader: "॥ శ్రీ సన్నిధానం విశేష దైవిక జ్యోతిష్య వివరణ & సందేశం ॥",
    narrationBadge: "ప్రామాణిక జాతక విశ్లేషణ",
    sec1Title: "1. కుండలి గ్రహదోష విశ్లేషణ & ప్రధాన సవాలు",
    krodhaLabel: "క్రోధం / పిత్తం",
    manasLabel: "మనశ్శాంతి",
    vitalityLabel: "ఆత్మబలం",
    patienceLabel: "ఓపిక",
    sec2Title: "2. పంచాంగ 5-అంగ దైవిక సాధన & నక్షత్ర వృక్షం",
    sec3Title: "3. తక్షణ కోపం & ఆవేశ నివారణ 4-దశల విధానం",
    emergencyMantraTitle: "ఆపత్కాలీన మనశ్శాంతి బీజ మంత్రం (మనస్సులో 11 సార్లు జపించండి):",
    sec4Title: "4. దైనందిన ప్రాతఃకాల & సంధ్యా సమయ నియమావళి",
    morningTab: "🌅 ఉదయం (06:00 - 07:30)",
    afternoonTab: "🥗 మధ్యాహ్నం & సాత్విక ఆహారం",
    eveningTab: "🪔 సాయంత్రం & ప్రశాంత నిద్ర",
    sec5Title: "5. జన్మ కుండలికి నిర్దేశించిన నిత్య స్తోత్రం",
    stotraRules: "పఠన నియమం:",
    stotraTiming: "సమయం:",
    stotraDirection: "దిశ:",
    stotraCount: "సంఖ్య:",
    stotraBenefits: "ఫలితం:",
    dailySankalpaTitle: "🪔 దైనందిన శాంతి సంకల్పం & నియమావళి",
    dailySankalpaText: "ప్రతిరోజూ ఉదయం మరియు సాయంత్రం ఈ శాస్త్రోక్త నియమాలను శ్రద్ధతో పాటించడం వలన గ్రహ దోషాలు తొలగి, మనశ్శాంతి లభిస్తుంది.",
    vedicGrahaShantiTitle: "వైదిక గ్రహ శాంతి మంత్రం & నిత్య 11 సార్లు జప విధానం",
    chant11TimesDaily: "నిత్యం 11 సార్లు జపించండి",
    prescribedDeityLabel: "శాంతి దేవత / గ్రహం",
    mantraMeaningLabel: "మంత్ర దివ్యార్థం",
    calmingBenefitLabel: "మనఃశాంతి & దోష నివారణ ఫలం",
    muhurthaTitle: "6. జన్మ తారాబల ఆధారిత వ్రత ప్రారంభ ముహూర్తం & సాధనా విధానం",
    taraBalaLabel: "తారాబలం:",
    weekdayLabel: "శుభ వారం:",
    tithiLabel: "ప్రశస్త తిథి:",
    timeWindowLabel: "శుభ సమయం:",
    directionLabel: "దిశ & ఆసనం:",
    threePhaseTitle: "7. 45-రోజుల 3-దశల జీవన పరివర్తన కాలక్రమం",
    phase1Label: "మొదటి దశ (రోజులు 1 - 15):",
    phase2Label: "రెండవ దశ (రోజులు 16 - 30):",
    phase3Label: "మూడవ దశ (రోజులు 31 - 45):",
    focusLabel: "సాధనా కేంద్రం:",
    reliefLabel: "అనుభవపూర్వక ఉపశమనం:",
    shiftLabel: "అంతర్గత జాగృతి:",
    japaFormulaTitle: "8. లఘు పురశ్చరణ మంత్ర జప గణితం & మాల నియమం",
    dailyJapaLabel: "దైనందిన జపం:",
    totalJapaLabel: "45 రోజుల మొత్తం జపం:",
    malaLabel: "నిర్దేశిత జపమాల:",
    malaRuleLabel: "మాలా జప నియమం:",
    pathyaTitle: "9. సాత్విక ఆహార & ఆచరణ పథ్య నియమావళి",
    dietLabel: "ఆహార పథ్యం:",
    conductLabel: "ఆచరణ నియమాలు:",
    charityLabel: "వారపు దానం:",
    trackerTitle: "10. 45-రోజుల దైనందిన సాధనా చెక్‌లిస్ట్",
    trackerSubtext: "ప్రతిరోజూ జపం మరియు స్తోత్రం ముగిసిన తర్వాత కింద ఉన్న బాక్స్‌లో సరి గుర్తు (✓) ఉంచండి:",
    sankalpaBoxTitle: "దైవిక మండల సంకల్ప ప్రతిజ్ఞ:",
    sec6Title: "6. ప్రస్తుత దశా-భుక్తి & గోచార గ్రహ పరిహారాలు",
    currentDasha: "ప్రస్తుత మహాదశ & భుక్తి:",
    activeKarmicFlow: "దశా ప్రభావం:",
    remedialStep: "పరిహార మార్గం:",
    sandhiKalaLabel: "దశా-సంధి సమయం:",
    turnaroundTitle: "🌟 భాగ్యోదయ & దైవిక సాధన సమయం:",
    day10Title: "⚡ 10 రోజుల సాధన అనుభవం:",
    day15Title: "🌅 15 రోజుల తర్వాత జీవిత మలుపు:",
    beforeAfterTitle: "🔄 పరిహారానికి ముందు vs తర్వాత మార్పు:",
    elementalBalanceTitle: "🌿 పంచభూత సమతుల్యత:",
    sec7Title: "7. శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్ర పవిత్ర పరిహారాలు & దానం",
    prescribedSeva: "విశేష సేవ:",
    rudraksha: "రుద్రాక్ష ధారణ:",
    gemstone: "రత్నం / లోహం:",
    daana: "దానం & గోసేవ:",
    badhakeshLabel: "బాధక గ్రహం & అడ్డంకి:",
    anupanaLabel: "పవిత్ర అనుపాన తీర్థం:",
    adhidevataTitle: "దశాధిపతి అధిదేవత & ప్రత్యధిదేవత:",
    sec8Title: "8. ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ ముద్ర",
    templeSealLabel: "అధికారిక ముద్ర",
    priestContact: "ఫోన్:",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 1/3 (కొనసాగింపు...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2/3 (కొనసాగింపు...)",
    page3Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 3/3 (సంపూర్ణం)",
    page4Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 3/3 (సంపూర్ణం)"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜாதக அடிப்படையிலான தெய்வீக பரிகாரம் & மன அமைதி அறிக்கை",
    page2Title: "மன அமைதி சாதனை, தினசரி வழிபாட்டு முறை & ஸ்தோத்திரம்",
    page3Title: "திசை-புக்தி பலன், கோசார பரிகாரம், வைதீக கிரக சாந்தி மந்திரம், ஆலய பூஜைகள் & அர்ச்சகர் ஆசி",
    page4Title: "திசை-புக்தி பலன், கோசார பரிகாரம், வைதீக கிரக சாந்தி மந்திரம், ஆலய பூஜைகள் & அர்ச்சகர் ஆசி",
    dhyanaShloka: "॥ சாந்தாகாரம் புஜகசயனம் பத்மநாபம் ஸுரேசம் । சந்த்ரசேகரம் ப்ரணமாமி ஸர்வ சாந்தி ப்ரதாயகம் ॥",
    mandalaBanner: "॥ ஒரு மண்டல வழிபாட்டால் கர்ம தோஷ நிவர்த்தி & சங்கல்ப சித்தி ॥",
    devotee: "ஜாதகர்:",
    gotraSuffix: "கோத்திரம்",
    lagna: "லக்னம்:",
    rashi: "ராசி:",
    nakshatra: "நட்சத்திரம்:",
    birthDetails: "பிறப்பு விவரம்:",
    panchangaTithiVara: "திதி & வாரம்:",
    narrationHeader: "॥ ஸ்ரீ சந்நிதானத்தின் சிறப்பு தெய்வீக ஜோதிட உரை & செய்தி ॥",
    narrationBadge: "சாஸ்திர ரீதியான ஜாதக ஆய்வு",
    sec1Title: "1. ஜாதக கிரக தோஷ பகுப்பாய்வு & முக்கிய சவால்",
    krodhaLabel: "கோபம் / பித்தம்",
    manasLabel: "மன அமைதி",
    vitalityLabel: "ஆத்ம பலம்",
    patienceLabel: "பொறுமை",
    sec2Title: "2. பஞ்சாங்க 5-அங்க தெய்வீக சாதனை & நட்சத்திர மரம்",
    sec3Title: "3. உடனடி கோபத்தை தணிக்கும் 4-படிமுறை விதிகள்",
    emergencyMantraTitle: "அவசர மன அமைதி பீஜ மந்திரம் (மனதில் 11 முறை ஜபிக்கவும்):",
    sec4Title: "4. தினசரி காலை மற்றும் மாலை வழிபாட்டு முறைகள்",
    morningTab: "🌅 காலை (06:00 - 07:30)",
    afternoonTab: "🥗 மதியம் & சாத்வீக உணவு",
    eveningTab: "🪔 மாலை & அமைதியான உறக்கம்",
    sec5Title: "5. ஜாதகத்திற்குரிய தினசரி ஸ்தோத்திரம்",
    stotraRules: "வழிபாட்டு விதி:",
    stotraTiming: "நேரம்:",
    stotraDirection: "திசை:",
    stotraCount: "எண்ணிக்கை:",
    stotraBenefits: "பலன்கள்:",
    dailySankalpaTitle: "🪔 தினசரி சாந்தி சங்கல்பம் & வழிபாட்டு நெறிமுறை",
    dailySankalpaText: "தினசரி காலை மற்றும் மாலை வேளைகளில் இந்த சாஸ்திர வழிபாடுகளை பக்தியுடன் கடைப்பிடிப்பதால் கிரக தோஷங்கள் நீங்கி, மன அமைதி உண்டாகும்.",
    vedicGrahaShantiTitle: "வைதீக கிரக சாந்தி மந்திரம் & தினசரி 11 முறை ஜப முறை",
    chant11TimesDaily: "தினமும் 11 முறை ஜபிக்கவும்",
    prescribedDeityLabel: "சாந்தி தெய்வம் / கிரகம்",
    mantraMeaningLabel: "மந்திரத்தின் புனிதப் பொருள்",
    calmingBenefitLabel: "மன அமைதி & தோஷ நிவர்த்தி பலன்",
    muhurthaTitle: "6. ஜன்ம தாராபல அடிப்படையிலான விரத ஆரம்ப முகூர்த்தம் & வழிபாட்டு விதி",
    taraBalaLabel: "தாராபலம்:",
    weekdayLabel: "சுப வாரம்:",
    tithiLabel: "உகந்த திதி:",
    timeWindowLabel: "சுப நேரம்:",
    directionLabel: "திசை & ஆசனம்:",
    threePhaseTitle: "7. 45-நாள் 3-படிநிலை வாழ்வு மாற்ற காலக்கோடு",
    phase1Label: "முதல் படி (நாட்கள் 1 - 15):",
    phase2Label: "இரண்டாம் படி (நாட்கள் 16 - 30):",
    phase3Label: "மூன்றாம் படி (நாட்கள் 31 - 45):",
    focusLabel: "சாதனை நோக்கம்:",
    reliefLabel: "உணரக்கூடிய அமைதி:",
    shiftLabel: "உள்ளுணர்வு விழிப்புணர்வு:",
    japaFormulaTitle: "8. லகு புரச்சரண மந்திர ஜப கணிதம் & மாலை விதி",
    dailyJapaLabel: "தினசரி ஜபம்:",
    totalJapaLabel: "45 நாட்கள் மொத்த ஜபம்:",
    malaLabel: "குறிப்பிடப்பட்ட மாலை:",
    malaRuleLabel: "மாலை ஜப விதிமுறை:",
    pathyaTitle: "9. சாத்வீக உணவு & ஆசார பத்திய நெறிமுறைகள்",
    dietLabel: "உணவு பத்தியம்:",
    conductLabel: "ஒழுக்க விதிகள்:",
    charityLabel: "வாராந்திர தானம்:",
    trackerTitle: "10. 45-நாள் தினசரி சாதனை சரிபார்ப்பு பட்டியல்",
    trackerSubtext: "தினசரி ஜபம் மற்றும் ஸ்தோத்திரம் முடித்தவுடன் கீழே உள்ள பெட்டியில் சரி (✓) குறியிடவும்:",
    sankalpaBoxTitle: "தெய்வீக மண்டல சங்கல்ப உறுதிமொழி:",
    sec6Title: "6. நடப்பு திசை-புக்தி & கோசார கிரக பரிகாரங்கள்",
    currentDasha: "நடப்பு மகாதிசை & புக்தி:",
    activeKarmicFlow: "திசை பலன்:",
    remedialStep: "பரிகாரம்:",
    sandhiKalaLabel: "திசை-சந்தி நிலை:",
    turnaroundTitle: "🌟 வாழ்வு திருப்பம் & தினசரி வழிபாட்டு காலம்:",
    day10Title: "⚡ 10 நாட்கள் வழிபாட்டு பலன்:",
    day15Title: "🌅 15 நாட்களுக்குப் பிறகு வாழ்வு திருப்பம்:",
    beforeAfterTitle: "🔄 பரிகாரத்திற்கு முன் vs பின் மாற்றம்:",
    elementalBalanceTitle: "🌿 பஞ்சபூத சமநிலை தத்துவம்:",
    sec7Title: "7. ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலய வழிபாடுகள் & தானம்",
    prescribedSeva: "சிறப்பு பூஜை:",
    rudraksha: "ருத்ராட்சம்:",
    gemstone: "ரத்தினம் / உலோகம்:",
    daana: "தானம் & கோபூஜை:",
    badhakeshLabel: "பாதக கிரகம் & தடை:",
    anupanaLabel: "புனித அனுபான தீர்த்தம்:",
    adhidevataTitle: "திசாதிபதி அதிதேவதை & பிரத்யதிதேவதை:",
    sec8Title: "8. தலைமை அர்ச்சகரின் ஆசி & ஆலய முத்திரை",
    templeSealLabel: "அங்கீகரிக்கப்பட்ட முத்திரை",
    priestContact: "தொலைபேசி:",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 1/3 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 2/3 (தொடர்கிறது...)",
    page3Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 3/3 (முழுமை)",
    page4Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 3/3 (முழுமை)"
  }
};

export const TATVA_LOCALE: Record<string, Record<SupportedLanguage, string>> = {
  Earth: { kn: "ಪೃಥ್ವಿ", en: "Earth", hi: "पृथ्वी", te: "పృథ్వి", ta: "நிலம்" },
  Water: { kn: "ಜಲ", en: "Water", hi: "जल", te: "జలం", ta: "நீர்" },
  Fire: { kn: "ಅಗ್ನಿ", en: "Fire", hi: "अग्नि", te: "అగ్ని", ta: "நெருப்பு" },
  Air: { kn: "ವಾಯು", en: "Air", hi: "वायु", te: "వాయువు", ta: "காற்று" },
  Ether: { kn: "ಆಕಾಶ", en: "Ether", hi: "आकाश", te: "ఆకాశం", ta: "ஆகாயம்" }
};

export function formatHouseName(house: number, langCode: SupportedLanguage): string {
  if (langCode === "kn") return `${house}ನೇ ಮನೆ`;
  if (langCode === "hi") return `${house}वां भाव`;
  if (langCode === "te") return `${house}వ స్థానం`;
  if (langCode === "ta") return `${house}ஆம் வீடு`;
  return `${house}th House`;
}

function formatDevoteeNameForLanguage(name: string, targetLang: string): string {
  if (!name || !name.trim()) return "Devotee";
  const trimmed = name.trim();
  const lang = (targetLang || "kn").toLowerCase();

  if (lang === "kn" && /[ಀ-೿]/.test(trimmed)) return trimmed;
  if (lang === "hi" && /[\u0900-\u097F]/.test(trimmed)) return trimmed;
  if (lang === "te" && /[\u0C00-\u0C7F]/.test(trimmed)) return trimmed;
  if (lang === "ta" && /[\u0B80-\u0BFF]/.test(trimmed)) return trimmed;
  if (lang === "en" && !/[\u0900-\u0D7F]/.test(trimmed)) return trimmed;

  return transliterateName(trimmed, lang);
}

/** Deterministic Shastric synthesis to guarantee 100% complete, non-generic narrative if AI is pending or offline */
function getDeterministicSacredNarration(diagnosis: KundliRemedyDiagnosis, code: SupportedLanguage): string {
  const { devoteeName, gotra, lagnaName, rashiName, nakshatraName, primaryStruggle, dashaBhuktiAnalysis, gokarnaTempleRemedies, personalizedStotras, lifeTurnaroundTiming } = diagnosis;
  const dispDevotee = formatDevoteeNameForLanguage(devoteeName, code);
  const dispGotra = gotra ? formatDevoteeNameForLanguage(gotra, code) : "";
  const stotra = personalizedStotras[0] || personalizedStotras[1];
  const stotraTitle = stotra?.title[code] || stotra?.title.kn || "";
  const sevaName = gokarnaTempleRemedies?.prescribedSeva?.name[code] || gokarnaTempleRemedies?.prescribedSeva?.name.kn || "";
  const lagnaStr = lagnaName[code] || lagnaName.kn;
  const rashiStr = rashiName[code] || rashiName.kn;
  const nakshatraStr = nakshatraName[code] || nakshatraName.kn;
  const struggleTitle = primaryStruggle.title[code] || primaryStruggle.title.kn;
  const dashaStr = `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.kn} - ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.kn}`;
  const sandhiTitle = dashaBhuktiAnalysis.sandhiAlert?.title[code] || dashaBhuktiAnalysis.sandhiAlert?.title.kn || "";
  const day10Text = lifeTurnaroundTiming?.day10Expectation?.[code] || lifeTurnaroundTiming?.day10Expectation?.kn || "";
  const day15Text = lifeTurnaroundTiming?.day15Expectation?.[code] || lifeTurnaroundTiming?.day15Expectation?.kn || "";

  if (code === "en") {
    const sandhiPhrase = dashaBhuktiAnalysis.isSandhiActive && sandhiTitle
      ? `Under the active ${sandhiTitle} transition, `
      : "";
    return `॥ Sri Gokarna Mahabaleshwara Prasanna ॥\n` +
      `Upon deep shastric examination of the natal horoscope for ${dispDevotee}${dispGotra ? ` (${dispGotra} Gotra)` : ""}, born under ${lagnaStr} Lagna and ${rashiStr} Rashi (${nakshatraStr} Nakshatra), active planetary currents unfold under ${dashaStr}. ${sandhiPhrase}the primary karmic challenge manifests as ${struggleTitle}.\n` +
      `The moment you commence this consecrated sadhana with faith, self-doubt, inner turbulence, and hesitation dissolve completely, instilling unshakable confidence, mental peace, and divine fortitude. Within 10 days of starting this practice: ${day10Text} Furthermore, after 15 days: ${day15Text} Offering the sacred ${sevaName} at Sri Kshetra Gokarna Mahabaleshwara and reciting daily ${stotraTitle} permanently neutralizes planetary afflictions, granting enduring protection, prosperity, and triumphant success.`;
  }
  if (code === "hi") {
    const sandhiPhrase = dashaBhuktiAnalysis.isSandhiActive && sandhiTitle
      ? `वर्तमान में ${sandhiTitle} संधिकाल के प्रभाव से `
      : "";
    return `॥ श्री गोकर्ण महाबलेश्वर प्रसन्न ॥\n` +
      `जातक ${dispDevotee}${dispGotra ? ` (${dispGotra} गोत्र)` : ""} की जन्म कुंडली का पाराशरी शास्त्र अनुसार सूक्ष्म विश्लेषण किया गया है। ${lagnaStr} लग्न एवं ${rashiStr} राशि (${nakshatraStr} नक्षत्र) में जन्म होने से वर्तमान में ${dashaStr} चल रही है। ${sandhiPhrase}मुख्य रूप से ${struggleTitle} की स्थिति उत्पन्न हो रही है।\n` +
      `इस शास्त्रोक्त दैवीय साधना को पूर्ण श्रद्धा से प्रारंभ करते ही मन का भय, संशय और व्याकुलता समाप्त होकर अटूट आत्मविश्वास और दैवीय आत्मबल का संचार होगा। साधना प्रारंभ के १० दिनों में: ${day10Text} तत्पश्चात १५ दिनों में: ${day15Text} श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधि में विहित ${sevaName} एवं नित्य ${stotraTitle} के पाठ से समस्त ग्रहपीड़ा शांत होकर अखंड सुख-समृद्धि, विजय और मनःशांति की प्राप्ति होगी।`;
  }
  if (code === "te") {
    const sandhiPhrase = dashaBhuktiAnalysis.isSandhiActive && sandhiTitle
      ? `ప్రస్తుతం ${sandhiTitle} సంధి ప్రభావంతో `
      : "";
    return `॥ శ్రీ గోకర్ణ మహాబలేశ్వర ప్రసన్న ॥\n` +
      `జాతకుడు ${dispDevotee}${dispGotra ? ` (${dispGotra} గోత్రం)` : ""} గారి జన్మ కుండలిని పారాశరి శాస్త్రోక్త పద్ధతిలో పరిశీలించడమైనది. ${lagnaStr} లగ్నం మరియు ${rashiStr} రాశి (${nakshatraStr} నక్షత్రం) లో జన్మించిన వీరికి, ప్రస్తుత ${dashaStr} ప్రభావంతో ${sandhiPhrase}ప్రధానంగా ${struggleTitle} ఎదురవుతోంది.\n` +
      `ఈ పవిత్ర సాధనను భక్తిశ్రద్ధలతో ప్రారంభించిన క్షణం నుంచే మనస్సులోని భయం, సంశయం తొలగిపోయి అచంచలమైన ఆత్మవిశ్వాసం, దైవబలం కలుగుతాయి. సాధన ప్రారంభించిన 10 రోజుల్లో: ${day10Text} అనంతరం 15 రోజుల్లో: ${day15Text} శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో ${sevaName} మరియు నిత్యం ${stotraTitle} పఠనం ద్వారా గ్రహదోషాలు నివారణమై సంపూర్ణ మనశ్శాంతి, కార్యానుకూలత లభిస్తాయి.`;
  }
  if (code === "ta") {
    const sandhiPhrase = dashaBhuktiAnalysis.isSandhiActive && sandhiTitle
      ? `தற்போது ${sandhiTitle} சந்தி தாக்கத்தால் `
      : "";
    return `॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் பிரசன்னம் ॥\n` +
      `ஜாதகர் ${dispDevotee}${dispGotra ? ` (${dispGotra} கோத்திரம்)` : ""} அவர்களின் ஜாதகத்தை பராசர ஜோதிட முறைப்படி ஆய்வு செய்ததில், ${lagnaStr} லக்னம் மற்றும் ${rashiStr} ராசி (${nakshatraStr} நட்சத்திரம்) அமைந்திருக்கிறது. நடப்பு ${dashaStr} காலத்தில் ${sandhiPhrase}${struggleTitle} சவால் ஏற்படுகிறது.\n` +
      `இந்த தெய்வீக வழிபாட்டை நம்பிக்கையுடன் தொடங்கும் தருணத்திலிருந்தே மனதில் உள்ள அச்சமும் தயக்கமும் நீங்கி, உறுதியான தன்னம்பிக்கையும் இறைசக்தியும் பெருகும். பரிகாரம் தொடங்கிய 10 நாட்களில்: ${day10Text} தொடர்ந்து 15 நாட்களில்: ${day15Text} ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்தில் ${sevaName} பூஜை மற்றும் தினமும் ${stotraTitle} பாராயணம் செய்வதால் கிரக தோஷங்கள் நீங்கி, மன நிம்மதியும் சுப யோகமும் வெற்றியும் நிலைக்கும்.`;
  }
  // Kannada default
  const sandhiPhrase = dashaBhuktiAnalysis.isSandhiActive && sandhiTitle
    ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${sandhiTitle} ಸಂಧಿಕಾಲವು ಸಕ್ರಿಯವಾಗಿದ್ದು, `
    : "";
  return `॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n` +
    `ಜಾತಕರಾದ ${dispDevotee}${dispGotra ? ` (${dispGotra} ಗೋತ್ರ)` : ""} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪರಾಶರೀ ಸಿದ್ಧಾಂತದಂತೆ ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ${lagnaStr} ಲಗ್ನ ಮತ್ತು ${rashiStr} ರಾಶಿಯ ${nakshatraStr} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ ಇವರಿಗೆ, ಪ್ರಸ್ತುತ ${dashaStr} ಕಾಲ ನಡೆಯುತ್ತಿದೆ. ${sandhiPhrase}ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವದಿಂದ ಜೀವನದಲ್ಲಿ ಮುಖ್ಯವಾಗಿ ${struggleTitle} ಎದುರಾಗುತ್ತಿದೆ.\n` +
    `ಈ ಪವಿತ್ರ ಪರಿಹಾರಗಳನ್ನು ನಿಷ್ಠೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿದ ತಕ್ಷಣವೇ ಮನಸ್ಸಿನ ಭಯ, ಆತಂಕ ಹಾಗೂ ಅಸ್ಥಿರತೆಗಳು ಕರಗಿ ಅಚಲ ಆತ್ಮವಿಶ್ವಾಸ, ಧೈರ್ಯ ಹಾಗೂ ದೈವಬಲ ಮೂಡುತ್ತದೆ. ಸಾಧನೆ ಪ್ರಾರಂಭಿಸಿದ ೧೦ ದಿನಗಳಲ್ಲಿ: ${day10Text} ನಂತರ ೧೫ ದಿನಗಳಲ್ಲಿ: ${day15Text} ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಗದಿತ ${sevaName} ಸೇವೆ ಹಾಗೂ ನಿತ್ಯ ${stotraTitle} ಪಠಣೆಯಿಂದ ಸಮಸ್ತ ಗ್ರಹಪೀಡೆಗಳು ಕರಗಿ ಅಖಂಡ ಶಾಂತಿ, ದೃಢ ಯಶಸ್ಸು ಹಾಗೂ ಭಾಗ್ಯೋದಯ ಸಿದ್ಧಿಸುತ್ತದೆ.`;
}




const PRIEST_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
  hi: "वेदमूर्ति चैतन्य पंडित",
  te: "వేదమూర్తి చైతన్య పండిట్",
  ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்",
  en: "Veda Moorthy Chaitanya Pandit"
};

const SHORT_PRIEST_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
  hi: "वेदमूर्ति चैतन्य पंडित",
  te: "వేదమూర్తి చైతన్య పండిట్",
  ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்",
  en: "Veda Moorthy Chaitanya Pandit"
};

function getShortPriestName(override?: string, langCode: SupportedLanguage = "kn"): string {
  const cleanLang = (["kn", "hi", "te", "ta", "en"].includes(langCode) ? langCode : "kn") as SupportedLanguage;
  if (!override || !override.trim()) {
    return SHORT_PRIEST_DISPLAY_NAMES[cleanLang];
  }
  const trimmed = override.trim();
  const isDefaultPriest =
    trimmed.includes("ಚೈತನ್ಯ") ||
    trimmed.includes("Chaitanya") ||
    trimmed.includes("चैतन्य") ||
    trimmed.includes("చైతన్య") ||
    trimmed.includes("சைதன்ய") ||
    trimmed.includes("ಶ್ರೀರಾಮ") ||
    trimmed.includes("ಶ್ರೀರಾಮ್") ||
    trimmed.includes("Shreeram") ||
    trimmed.includes("श्रीराम") ||
    trimmed.includes("శ్రీరామ్") ||
    trimmed.includes("ஸ்ரீராம்");
  if (isDefaultPriest) {
    return SHORT_PRIEST_DISPLAY_NAMES[cleanLang];
  }
  return formatDevoteeNameForLanguage(trimmed, cleanLang);
}

function getLocalizedPriestName(override?: string, langCode: SupportedLanguage = "kn"): string {
  const cleanLang = (["kn", "hi", "te", "ta", "en"].includes(langCode) ? langCode : "kn") as SupportedLanguage;
  if (!override || !override.trim()) {
    return PRIEST_DISPLAY_NAMES[cleanLang];
  }
  const trimmed = override.trim();
  const isDefaultPriest =
    trimmed.includes("ಚೈತನ್ಯ") ||
    trimmed.includes("Chaitanya") ||
    trimmed.includes("चैतन्य") ||
    trimmed.includes("చైతన్య") ||
    trimmed.includes("சைதன்ய") ||
    trimmed.includes("ಶ್ರೀರಾಮ") ||
    trimmed.includes("ಶ್ರೀರಾಮ್") ||
    trimmed.includes("Shreeram") ||
    trimmed.includes("श्रीराम") ||
    trimmed.includes("శ్రీరామ్") ||
    trimmed.includes("ஸ்ரீராம்");
  if (isDefaultPriest) {
    return PRIEST_DISPLAY_NAMES[cleanLang];
  }
  return formatDevoteeNameForLanguage(trimmed, cleanLang);
}

const cleanLabel = (lbl: string): string => {
  if (!lbl) return "";
  return lbl.replace(/[:：\s]+$/, "") + ":";
};

export const KundliRemedyPdfTemplate: React.FC<KundliRemedyPdfTemplateProps> = ({
  diagnosis,
  lang = "kn",
  overridePriestName,
  overridePriestPhone
}) => {
  const code = (lang || "kn").slice(0, 2) as SupportedLanguage;
  const isKn = code === "kn";
  const isHi = code === "hi";
  const isTe = code === "te";
  const isTa = code === "ta";
  const i18n = PDF_I18N[code] || PDF_I18N.kn;

  const {
    devoteeName,
    birthDate,
    birthTime,
    gotra,
    lagnaName,
    rashiName,
    nakshatraName,
    primaryStruggle,
    lifeTurnaroundTiming,
    afflictionFactors,
    psychologicalProfile,
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    panchangaRemedies,
    planetaryStrengthRemedies,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing,
    badhakaAnalysis,
    vedicDoctorPrescription
  } = diagnosis;

  const primaryGraha = afflictionFactors?.[0]?.graha || dashaBhuktiAnalysis?.currentMahaDasha || "sarvadosha";
  const grahaMantra = getRemedyJapaForGraha(primaryGraha);

  const displayDevoteeName = formatDevoteeNameForLanguage(devoteeName, code);
  const displayGotra = gotra ? formatDevoteeNameForLanguage(gotra, code) : "";

  const stotra = personalizedStotras[0] || personalizedStotras[1];

  const mandalaVrata = diagnosis.mandalaVrataSadhana || computeMandalaVrataSadhana(
    primaryStruggle.category,
    PlanetName.Jupiter,
    0,
    devoteeName,
    gotra
  );

  const toKnDigits = (n: number | string) => {
    const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
    return String(n).replace(/[0-9]/g, d => knDigits[Number(d)]);
  };

  const toDevaDigits = (n: number | string) => {
    const devaDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(n).replace(/[0-9]/g, d => devaDigits[Number(d)]);
  };

  const formatDayNum = (n: number) => {
    if (isKn) return toKnDigits(n);
    if (isHi) return toDevaDigits(n);
    return String(n);
  };

  const getShlokaByLang = (st: typeof stotra) => {
    if (!st) return "";
    if (code === "te") return st.shlokaTelugu;
    if (code === "ta") return st.shlokaTamil;
    if (code === "hi") return st.shlokaHindi;
    if (code === "en") return st.transliteration || (st as any).shlokaEnglish || transliterateIndicToLatin(st.shlokaSanskrit);
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (code === "te") return bm.telugu;
    if (code === "ta") return bm.tamil;
    if (code === "hi") return bm.hindi;
    if (code === "en") return bm.transliteration || (bm as any).english || transliterateIndicToLatin(bm.sanskrit);
    return bm.kannada;
  };

  const isScriptMatchingLang = (text: string, langCode: SupportedLanguage) => {
    if (!text) return false;
    if (langCode === "kn") return /[\u0C80-\u0CFF]/.test(text);
    if (langCode === "hi") return /[\u0900-\u097F]/.test(text);
    if (langCode === "te") return /[\u0C00-\u0C7F]/.test(text);
    if (langCode === "ta") return /[\u0B80-\u0BFF]/.test(text);
    if (langCode === "en") return !/[\u0900-\u0D7F]/.test(text);
    return false;
  };

  // Determine active narration text (AI synthesized with language-purity check, or rich deterministic fallback)
  const rawNarrationText =
    (diagnosis.aiNarrationText?.[code]?.trim() && isScriptMatchingLang(diagnosis.aiNarrationText[code], code)
      ? diagnosis.aiNarrationText[code].trim()
      : "") ||
    (diagnosis.isAiGenerated && typeof diagnosis.aiNarration === "string" && isScriptMatchingLang(diagnosis.aiNarration, code)
      ? diagnosis.aiNarration.trim()
      : "") ||
    getDeterministicSacredNarration(diagnosis, code);

  const narrationText = rawNarrationText
    .replace(/\r\n/g, "\n")
    .replace(/[#*`_~]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  // Robust Indic font stack with zero-broken vattaksharas
  const fontFamily = isKn
    ? "'Noto Serif Kannada', 'Tiro Kannada', 'Kaveri', 'Segoe UI', serif, sans-serif"
    : code === "te"
    ? "'Noto Serif Telugu', 'Tiro Telugu', serif, sans-serif"
    : code === "ta"
    ? "'Noto Serif Tamil', 'Tiro Tamil', serif, sans-serif"
    : code === "hi"
    ? "'Noto Serif Devanagari', 'Tiro Devanagari Hindi', serif, sans-serif"
    : "'Cinzel', 'Noto Serif', 'Georgia', serif, sans-serif";

  return (
    <div
      id="kundli-remedy-pdf-container"
      style={{
        width: "900px",
        display: "block",
        background: "#FFFDF7",
        fontFamily,
        color: "#261605",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: JANANA KUNDALI, SACRED NARRATION, DIAGNOSIS & 5-ANGAS         */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1241px",
            maxHeight: "1241px",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "13px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 30%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* 4 Corner Florets placed safely away from border to prevent any collision */}
          <div style={{ position: "absolute", top: "12px", left: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "12px", right: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", left: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", right: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "9px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "17px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.35 }}>
              {i18n.mainTitle}
            </div>
            <div style={{ fontSize: "10.5px", color: "#FEF08A", marginTop: "2px", fontStyle: "italic", lineHeight: 1.35 }}>
              {i18n.dhyanaShloka}
            </div>
          </div>

          {/* Devotee Info Matrix: 6-item comprehensive birth coordinates */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: "6px",
              fontSize: "11.5px",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>👤 {i18n.devotee}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 900 }}>{displayDevoteeName}</span>
              {displayGotra && <span style={{ color: "#92400E", fontSize: "11px", display: "inline-block", marginLeft: "4px" }}>({displayGotra} {i18n.gotraSuffix})</span>}
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🏛️ {i18n.lagna}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 900 }}>{lagnaName[code] || lagnaName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌙 {i18n.rashi}</span>{" "}
              <span style={{ color: "#92400E", fontWeight: 900 }}>{rashiName[code] || rashiName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>⭐ {i18n.nakshatra}</span>{" "}
              <span style={{ color: "#1E3A8A", fontWeight: 900 }}>{nakshatraName[code] || nakshatraName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>📅 {i18n.birthDetails}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 700 }}>{birthDate} {birthTime}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌿 {i18n.panchangaTithiVara}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 700 }}>
                {panchangaRemedies ? `${panchangaRemedies.tithiRemedy.tithiName[code] || panchangaRemedies.tithiRemedy.tithiName.kn}, ${panchangaRemedies.varaRemedy.dayName[code] || panchangaRemedies.varaRemedy.dayName.kn}` : (isKn ? "ಶುಭ ದಿನ" : isHi ? "शुभ दिन" : isTe ? "శుభ దినం" : isTa ? "சுப தினம்" : "Auspicious Day")}
              </span>
            </div>
          </div>

          {/* Prestigious Astrological Narration Card (Warm Vedic Gold Styling, Zero Tech Jargon) */}
          <div
            style={{
              background: "linear-gradient(135deg, #FEFCE8 0%, #FFFBEB 50%, #FEF3C7 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "9px 13px",
              color: "#451A03",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
                borderBottom: "1px dashed #D97706",
                paddingBottom: "3px"
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#78350F" }}>
                🪔 {i18n.narrationHeader}
              </span>
              <span
                style={{
                  fontSize: "9.5px",
                  background: "#DCFCE7",
                  color: "#166534",
                  padding: "1px 8px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  border: "1px solid #86EFAC"
                }}
              >
                {i18n.narrationBadge}
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#451A03",
                lineHeight: 1.5,
                borderLeft: "3px solid #D97706",
                paddingLeft: "8px"
              }}
            >
              {narrationText.split(/\n\s*\n/).filter(Boolean).map((para, pIdx) => (
                <p
                  key={pIdx}
                  style={{
                    margin: pIdx === 0 ? "0 0 4px 0" : "4px 0",
                    lineHeight: 1.5,
                    fontSize: "11px",
                    color: "#451A03"
                  }}
                >
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Section 1: Astrological Diagnosis & Struggle Identification */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "9px 13px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🔍 {i18n.sec1Title}</span>
              <span
                style={{
                  background: primaryStruggle.intensity === "High" ? "#FEE2E2" : "#FEF3C7",
                  color: primaryStruggle.intensity === "High" ? "#991B1B" : "#92400E",
                  border: `1px solid ${primaryStruggle.intensity === "High" ? "#F87171" : "#FBBF24"}`,
                  padding: "1px 8px",
                  borderRadius: "12px",
                  fontSize: "10.5px",
                  fontWeight: 800
                }}
              >
                {primaryStruggle.intensityLabel[code] || primaryStruggle.intensityLabel.kn}
              </span>
            </div>

            <div style={{ fontSize: "11.5px", color: "#451A03", lineHeight: 1.5, fontWeight: 700 }}>
              <span style={{ color: "#991B1B" }}>• {primaryStruggle.title[code] || primaryStruggle.title.kn}:</span>{" "}
              <span style={{ color: "#27272A", fontWeight: 500 }}>{primaryStruggle.description[code] || primaryStruggle.description.kn}</span>
            </div>

            {/* Affliction Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px" }}>
              {afflictionFactors.slice(0, 2).map((af, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    borderRadius: "6px",
                    padding: "6px 9px",
                    fontSize: "11px",
                    lineHeight: 1.45
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E" }}>🔥 {af.title[code] || af.title.kn}</div>
                  <div style={{ color: "#451A03", marginTop: "2px" }}>{af.reason[code] || af.reason.kn}</div>
                </div>
              ))}
            </div>

            {/* Badhaka Graha & Badhakesh Placement */}
            {badhakaAnalysis && (
              <div
                style={{
                  marginTop: "5px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "5px",
                  padding: "4px 8px",
                  fontSize: "10px",
                  color: "#991B1B",
                  lineHeight: 1.35
                }}
              >
                <span>
                  <strong>🚧 {i18n.badhakeshLabel} </strong>
                  {badhakaAnalysis.badhakeshName[code] || badhakaAnalysis.badhakeshName.kn} ({formatHouseName(badhakaAnalysis.badhakaHouse, code)} · {badhakaAnalysis.badhakaSignName[code] || badhakaAnalysis.badhakaSignName.kn}) — {badhakaAnalysis.shantiRemedy[code] || badhakaAnalysis.shantiRemedy.kn}
                </span>
              </div>
            )}

            {/* Psychological & Temperament Meters with Progress Bar Visualizations */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginTop: "7px",
                paddingTop: "6px",
                borderTop: "1px dashed #E5E7EB",
                textAlign: "center"
              }}
            >
              <div style={{ background: "#FEF2F2", padding: "5px 4px", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ color: "#991B1B", fontWeight: 800, fontSize: "10.5px" }}>{i18n.krodhaLabel}</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#B91C1C", marginTop: "1px" }}>{psychologicalProfile.krodhaLevel}%</div>
                <div style={{ width: "100%", height: "4px", background: "#FEE2E2", borderRadius: "2px", marginTop: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${psychologicalProfile.krodhaLevel}%`, height: "100%", background: "#DC2626" }} />
                </div>
              </div>
              <div style={{ background: "#F0FDF4", padding: "5px 4px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ color: "#166534", fontWeight: 800, fontSize: "10.5px" }}>{i18n.manasLabel}</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#15803D", marginTop: "1px" }}>{psychologicalProfile.manasStability}%</div>
                <div style={{ width: "100%", height: "4px", background: "#DCFCE7", borderRadius: "2px", marginTop: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${psychologicalProfile.manasStability}%`, height: "100%", background: "#16A34A" }} />
                </div>
              </div>
              <div style={{ background: "#EFF6FF", padding: "5px 4px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ color: "#1E40AF", fontWeight: 800, fontSize: "10.5px" }}>{i18n.vitalityLabel}</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#1D4ED8", marginTop: "1px" }}>{psychologicalProfile.vitalityScore}%</div>
                <div style={{ width: "100%", height: "4px", background: "#DBEAFE", borderRadius: "2px", marginTop: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${psychologicalProfile.vitalityScore}%`, height: "100%", background: "#2563EB" }} />
                </div>
              </div>
              <div style={{ background: "#FAF5FF", padding: "5px 4px", borderRadius: "6px", border: "1px solid #E9D5FF" }}>
                <div style={{ color: "#6B21A8", fontWeight: 800, fontSize: "10.5px" }}>{i18n.patienceLabel}</div>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "#7E22CE", marginTop: "1px" }}>{psychologicalProfile.patienceIndex}%</div>
                <div style={{ width: "100%", height: "4px", background: "#F3E8FF", borderRadius: "2px", marginTop: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${psychologicalProfile.patienceIndex}%`, height: "100%", background: "#9333EA" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Panchanga 5-Angas Divine Anchor & Sacred Tree */}
          {panchangaRemedies && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #D97706",
                borderRadius: "9px",
                padding: "9px 13px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#78350F",
                  borderBottom: "1.5px solid #FDE68A",
                  paddingBottom: "4px",
                  marginBottom: "6px"
                }}
              >
                🌿 {i18n.sec2Title}
              </div>

              {/* Nakshatra & Sacred Tree */}
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #86EFAC",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  fontSize: "11px",
                  lineHeight: 1.45,
                  marginBottom: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#166534" }}>
                  <span>⭐ {isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪವಿತ್ರ ನಕ್ಷತ್ರ ವೃಕ್ಷ:" : isHi ? "जन्म नक्षत्र एवं पवित्र नक्षत्र वृक्ष:" : isTe ? "జన్మ నక్షత్రం & పవిత్ర వృక్షం:" : isTa ? "ஜன்ம நட்சத்திரம் & புனித மரம்:" : "Birth Nakshatra & Sacred Astral Tree:"} {panchangaRemedies.nakshatraRemedy.nakshatraName[code] || panchangaRemedies.nakshatraRemedy.nakshatraName.en || panchangaRemedies.nakshatraRemedy.nakshatraName.kn} ({isKn ? "ಪಾದ" : isHi ? "चरण" : isTe ? "పాద" : isTa ? "பாதம்" : "Pada"} {panchangaRemedies.nakshatraRemedy.pada})</span>
                  <span style={{ background: "#DCFCE7", color: "#14532D", padding: "1px 7px", borderRadius: "10px", fontSize: "10.5px", fontWeight: 800 }}>
                    {isKn ? "ದೇವತೆ: " : isHi ? "देवता: " : isTe ? "దేవత: " : isTa ? "தெய்வம்: " : "Deity: "}{panchangaRemedies.nakshatraRemedy.rulingDeity[code] || panchangaRemedies.nakshatraRemedy.rulingDeity.kn}
                  </span>
                </div>
                <div style={{ color: "#14532D", marginTop: "2px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ಪವಿತ್ರ ವೃಕ್ಷ: " : isHi ? "• पवित्र वृक्ष: " : isTe ? "• పవిత్ర వృక్షం: " : isTa ? "• புனித மரம்: " : "• Sacred Tree: "}</span>
                  <span style={{ fontWeight: 900, color: "#166534" }}>
                    {(code === "hi" ? panchangaRemedies.nakshatraRemedy.sacredTree.hindi :
                      code === "te" ? panchangaRemedies.nakshatraRemedy.sacredTree.telugu :
                      code === "ta" ? panchangaRemedies.nakshatraRemedy.sacredTree.tamil :
                      code === "en" ? panchangaRemedies.nakshatraRemedy.sacredTree.english :
                      panchangaRemedies.nakshatraRemedy.sacredTree.kannada) ||
                      panchangaRemedies.nakshatraRemedy.sacredTree.english ||
                      panchangaRemedies.nakshatraRemedy.sacredTree.kannada}
                  </span> ({panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName}) — {panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod[code] || panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod.kn}
                </div>
                <div style={{ color: "#166534", marginTop: "2px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ನಕ್ಷತ್ರ ಬೀಜ ಮಂತ್ರ: " : isHi ? "• नक्षत्र बीज मंत्र: " : isTe ? "• నక్షత్ర బీజ మంత్రం: " : isTa ? "• நட்சத்திர பீஜ மந்திரம்: " : "• Beeja Mantra: "}</span>
                  <span style={{ fontWeight: 900, color: "#065F46" }}>
                    {code === "kn"
                      ? (panchangaRemedies.nakshatraRemedy.beejaMantra.kannada || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                      : code === "hi"
                      ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).hindi || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                      : code === "te"
                      ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).telugu || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                      : code === "ta"
                      ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).tamil || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                      : ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).transliteration ||
                         (panchangaRemedies.nakshatraRemedy.beejaMantra as any).english ||
                         transliterateIndicToLatin(panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit || panchangaRemedies.nakshatraRemedy.beejaMantra.kannada))}
                  </span> ({panchangaRemedies.nakshatraRemedy.beejaMantra.meaning[code] || panchangaRemedies.nakshatraRemedy.beejaMantra.meaning.kn})
                </div>
              </div>

              {/* 4 Angas Grid: Tithi, Vara, Yoga, Karana */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {/* Tithi */}
                <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px", lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    🌕 {isKn ? "ತಿಥಿ & ಪಕ್ಷ ದೈವಿಕ ಸಾಧನೆ" : isHi ? "तिथि एवं पक्ष दैवीय साधना" : isTe ? "తిథి & పక్ష దైవిక సాధన" : isTa ? "திதி & பட்ச வழிபாட்டு முறை" : "Tithi & Paksha Alignment"}
                  </div>
                  <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                    {panchangaRemedies.tithiRemedy.tithiName[code] || panchangaRemedies.tithiRemedy.tithiName.en || panchangaRemedies.tithiRemedy.tithiName.kn} ({panchangaRemedies.tithiRemedy.paksha === "Shukla" ? (isKn ? "ಶುಕ್ಲ ಪಕ್ಷ" : isHi ? "शुक्ल पक्ष" : isTe ? "శుక్ల పక్షం" : isTa ? "சுக்ல பட்சம்" : "Shukla Paksha") : (isKn ? "ಕೃಷ್ಣ ಪಕ್ಷ" : isHi ? "कृष्ण पक्ष" : isTe ? "కృష్ణ పక్షం" : isTa ? "கிருஷ்ண பட்சம்" : "Krishna Paksha")})
                  </div>
                  <div style={{ color: "#78350F", marginTop: "1px" }}>
                    {panchangaRemedies.tithiRemedy.vrataAndRemedy[code] || panchangaRemedies.tithiRemedy.vrataAndRemedy.kn}
                  </div>
                </div>

                {/* Vara */}
                <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px", lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    ☀️ {isKn ? "ಜನ್ಮ ವಾರ & ಗ್ರಹಾಧಿಪತಿ ಸಾಧನೆ" : isHi ? "जन्म वार एवं ग्रह साधना" : isTe ? "జన్మ వారం & గ్రహ సాధన" : isTa ? "ஜன்ம வாரம் & கிரக வழிபாடு" : "Weekday & Planetary Ruler"}
                  </div>
                  <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                    {panchangaRemedies.varaRemedy.dayName[code] || panchangaRemedies.varaRemedy.dayName.en || panchangaRemedies.varaRemedy.dayName.kn} · {isKn ? "ಶುಭ ಬಣ್ಣ: " : isHi ? "शुभ रंग: " : isTe ? "శుభ రంగు: " : isTa ? "சுப வண்ணம்: " : "Color: "}<span style={{ color: "#B45309", fontWeight: 900 }}>{panchangaRemedies.varaRemedy.dailyColor[code] || panchangaRemedies.varaRemedy.dailyColor.en || panchangaRemedies.varaRemedy.dailyColor.kn}</span>
                  </div>
                  <div style={{ color: "#78350F", marginTop: "1px" }}>
                    {panchangaRemedies.varaRemedy.dailySadhana[code] || panchangaRemedies.varaRemedy.dailySadhana.kn}
                  </div>
                </div>

                {/* Yoga */}
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#166534" }}>
                    <span>🧘 {isKn ? "ಜನ್ಮ ಯೋಗ: " : isHi ? "जन्म योग: " : isTe ? "జన్మ యోగం: " : isTa ? "ஜன்ம யோகம்: " : "Birth Yoga: "}{panchangaRemedies.yogaRemedy.yogaName[code] || panchangaRemedies.yogaRemedy.yogaName.kn}</span>
                    <span style={{ fontSize: "9.5px", background: panchangaRemedies.yogaRemedy.isAuspicious ? "#DCFCE7" : "#FEE2E2", color: panchangaRemedies.yogaRemedy.isAuspicious ? "#15803D" : "#991B1B", padding: "1px 5px", borderRadius: "5px", fontWeight: 800 }}>
                      {panchangaRemedies.yogaRemedy.isAuspicious ? (isKn ? "ಶುಭ ಯೋಗ" : isHi ? "शुभ योग" : isTe ? "శుభ యోగం" : isTa ? "சுப யோகம்" : "Auspicious") : (isKn ? "ಶಾಂತಿ ಅಗತ್ಯ" : isHi ? "शांति आवश्यक" : isTe ? "శాంతి అవసరం" : isTa ? "சாந்தி தேவை" : "Shanti Needed")}
                    </span>
                  </div>
                  <div style={{ color: "#14532D", marginTop: "1px" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "• ದೇವತೆ: " : isHi ? "• देवता: " : isTe ? "• దేవత: " : isTa ? "• தெய்வம்: " : "• Deity: "}</span>{formatDevoteeNameForLanguage(panchangaRemedies.yogaRemedy.deity, code)}
                  </div>
                  <div style={{ color: "#166534", marginTop: "1px" }}>
                    {panchangaRemedies.yogaRemedy.shantiPractice[code] || panchangaRemedies.yogaRemedy.shantiPractice.kn}
                  </div>
                </div>

                {/* Karana */}
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#1E40AF" }}>
                    <span>⚡ {isKn ? "ಜನ್ಮ ಕರಣ: " : isHi ? "जन्म करण: " : isTe ? "జన్మ కరణం: " : isTa ? "ஜன்ம கரணம்: " : "Birth Karana: "}{panchangaRemedies.karanaRemedy.karanaName[code] || panchangaRemedies.karanaRemedy.karanaName.kn}</span>
                    <span style={{ fontSize: "9.5px", background: "#DBEAFE", color: "#1D4ED8", padding: "1px 5px", borderRadius: "5px", fontWeight: 800 }}>
                      {isKn
                        ? `ತತ್ತ್ವ: ${TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.kn || "ಪೃಥ್ವಿ"}`
                        : isHi
                        ? `तत्व: ${TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.hi || "पृथ्वी"}`
                        : isTe
                        ? `తత్త్వం: ${TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.te || "పృథ్వి"}`
                        : isTa
                        ? `தத்துவம்: ${TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.ta || "நிலம்"}`
                        : `Element: ${TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.en || "Earth"}`}
                    </span>
                  </div>
                  <div style={{ color: "#1E3A8A", marginTop: "1px" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "• ಅಧಿದೇವತೆ: " : isHi ? "• अधिदेवता: " : isTe ? "• అధిదేవత: " : isTa ? "• அதிதேவதை: " : "• Presiding Deity: "}</span>{formatDevoteeNameForLanguage(panchangaRemedies.karanaRemedy.deity, code)}
                  </div>
                  <div style={{ color: "#1E40AF", marginTop: "1px" }}>
                    {panchangaRemedies.karanaRemedy.karyaShanti[code] || panchangaRemedies.karanaRemedy.karyaShanti.kn}
                  </div>
                </div>
              </div>

              {/* Elemental Balance Reason Banner */}
              {panchangaRemedies.elementalBalanceReason && (
                <div
                  style={{
                    marginTop: "5px",
                    background: "#FEFCE8",
                    border: "1px dashed #D97706",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "9.5px",
                    color: "#78350F",
                    lineHeight: 1.35
                  }}
                >
                  <span style={{ fontWeight: 800, color: "#92400E" }}>{i18n.elementalBalanceTitle} </span>
                  {panchangaRemedies.elementalBalanceReason[code] || panchangaRemedies.elementalBalanceReason.kn}
                </div>
              )}
            </div>
          )}

          {/* Page 1 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "5px"
            }}
          >
            {i18n.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: INSTANT PACIFICATION, DAILY ROUTINE, STOTRA & SANKALPA         */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "900px",
          height: "1273px",
          minHeight: "1273px",
          maxHeight: "1273px",
          padding: "16px 20px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1241px",
            maxHeight: "1241px",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "13px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 30%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* 4 Corner Florets placed safely away from border to prevent any collision */}
          <div style={{ position: "absolute", top: "12px", left: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "12px", right: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", left: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", right: "14px", color: "#D97706", fontSize: "13px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "9px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "16.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.35 }}>
              {i18n.page2Title}
            </div>
          </div>

          {/* Section 3: 4-Step Instant Anger Calming Protocol */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>⚡ {i18n.sec3Title}</span>
              {instantCalmingProtocol.title && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#FEF3C7",
                    color: "#92400E",
                    padding: "1px 8px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    border: "1px solid #FCD34D"
                  }}
                >
                  {instantCalmingProtocol.title[code] || instantCalmingProtocol.title.kn}
                </span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "#92400E", marginBottom: "6px", fontWeight: 700, lineHeight: 1.4 }}>
              {instantCalmingProtocol.subtitle[code] || instantCalmingProtocol.subtitle.kn}
            </div>

            {/* 4-Step Action Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
              {instantCalmingProtocol.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  style={{
                    background: "#FEFCE8",
                    border: "1px solid #FDE047",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11px",
                    lineHeight: 1.45
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#92400E" }}>
                    <span>{step.icon} {step.name[code] || step.name.kn}</span>
                    <span style={{ fontSize: "10px", background: "#FEF08A", padding: "1px 6px", borderRadius: "8px", color: "#854D0E" }}>
                      {typeof step.duration === "object" ? step.duration[code] || step.duration.kn : step.duration}
                    </span>
                  </div>
                  <div style={{ color: "#451A03", marginTop: "3px", fontWeight: 700 }}>
                    {step.action[code] || step.action.kn}
                  </div>
                  <div style={{ color: "#713F12", marginTop: "2px", fontSize: "10.5px", lineHeight: 1.4 }}>
                    {step.detail[code] || step.detail.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Beeja Japa Box */}
            <div
              style={{
                marginTop: "7px",
                background: "linear-gradient(135deg, #451A03 0%, #78350F 100%)",
                borderRadius: "7px",
                padding: "8px 12px",
                color: "#FFFFFF",
                border: "1.5px solid #F59E0B",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 800, marginBottom: "2px" }}>
                🕉️ {i18n.emergencyMantraTitle}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "normal", lineHeight: 1.5 }}>
                {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
              </div>
              <div style={{ fontSize: "10.5px", color: "#FEF08A", marginTop: "2px", lineHeight: 1.4 }}>
                {instantCalmingProtocol.emergencyBeejaMantra.meaning[code] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}
              </div>
            </div>
          </div>

          {/* Section 4: Daily Morning & Evening Pacification Routine */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "6px"
              }}
            >
              🗓️ {i18n.sec4Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {/* Morning */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", padding: "7px 9px", fontSize: "11px", lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, color: "#92400E", borderBottom: "1px dashed #FCD34D", paddingBottom: "2px", marginBottom: "4px" }}>
                  {i18n.morningTab}
                </div>
                {dailyPacificationRoutine.morning.map((m, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "4px" }}>
                    <span style={{ fontWeight: 800, color: "#451A03" }}>{m.icon} {m.title[code] || m.title.kn}:</span>{" "}
                    <span style={{ color: "#78350F" }}>{m.desc[code] || m.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Afternoon / Diet */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "7px 9px", fontSize: "11px", lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, color: "#166534", borderBottom: "1px dashed #86EFAC", paddingBottom: "2px", marginBottom: "4px" }}>
                  {i18n.afternoonTab}
                </div>
                {dailyPacificationRoutine.afternoonLifestyle.map((a, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "4px" }}>
                    <span style={{ fontWeight: 800, color: "#14532D" }}>{a.icon} {a.title[code] || a.title.kn}:</span>{" "}
                    <span style={{ color: "#166534" }}>{a.desc[code] || a.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Evening / Night */}
              <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "6px", padding: "7px 9px", fontSize: "11px", lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, color: "#6B21A8", borderBottom: "1px dashed #D8B4FE", paddingBottom: "2px", marginBottom: "4px" }}>
                  {i18n.eveningTab}
                </div>
                {dailyPacificationRoutine.evening.map((e, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "4px" }}>
                    <span style={{ fontWeight: 800, color: "#581C87" }}>{e.icon} {e.title[code] || e.title.kn}:</span>{" "}
                    <span style={{ color: "#6B21A8" }}>{e.desc[code] || e.desc.kn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Personalized Daily Classical Stotra */}
          {stotra && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #D97706",
                borderRadius: "9px",
                padding: "10px 14px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#78350F",
                  borderBottom: "1.5px solid #FDE68A",
                  paddingBottom: "4px",
                  marginBottom: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>📜 {i18n.sec5Title}</span>
                <span style={{ fontSize: "10.5px", color: "#92400E", fontWeight: 800, background: "#FEF08A", padding: "1px 8px", borderRadius: "10px" }}>
                  {stotra.dedicatedTo[code] || stotra.dedicatedTo.kn}
                </span>
              </div>

              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#991B1B", marginBottom: "4px" }}>
                ✨ {stotra.title[code] || stotra.title.kn}
              </div>

              {/* Shloka Box with pristine vattaksharas */}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FCD34D",
                  borderRadius: "7px",
                  padding: "7px 12px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#451A03",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  letterSpacing: "normal"
                }}
              >
                {getShlokaByLang(stotra).trim()}
              </div>

              <div style={{ fontSize: "11px", color: "#78350F", marginTop: "5px", lineHeight: 1.5 }}>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{isKn ? "• ಅರ್ಥ: " : isHi ? "• अर्थ: " : isTe ? "• భావం: " : isTa ? "• பொருள்: " : "• Meaning: "}</span> {stotra.meaning[code] || stotra.meaning.kn}
              </div>

              {/* Stotra Metadata Rules */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.3fr",
                  gap: "6px",
                  marginTop: "5px",
                  paddingTop: "4px",
                  borderTop: "1px dashed #FDE68A",
                  fontSize: "10.5px"
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>⏰ {i18n.stotraTiming}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.bestTimeToRecite[code] || stotra.bestTimeToRecite.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>🧭 {i18n.stotraDirection}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.facingDirection[code] || stotra.facingDirection.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>📿 {i18n.stotraCount}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.recitationCount[code] || stotra.recitationCount.kn}</span>
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "#065F46", marginTop: "3px", fontWeight: 700, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 800 }}>🌿 {i18n.stotraBenefits} </span>
                {stotra.spiritualBenefits[code] || stotra.spiritualBenefits.kn}
              </div>
            </div>
          )}

          {/* Dedicated Daily Peace Sankalpa & Sacred Anupana Card (Guarantees 100% Page Balance & Zero Empty Space) */}
          <div
            style={{
              background: "linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 50%, #FFFBEB 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "7px 12px",
              color: "#78350F",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, color: "#92400E" }}>
                {i18n.dailySankalpaTitle}
              </span>
              {vedicDoctorPrescription?.anupana && (
                <span style={{ fontSize: "9.5px", background: "#DCFCE7", color: "#166534", padding: "1px 6px", borderRadius: "8px", fontWeight: 800, border: "1px solid #86EFAC" }}>
                  🧪 {i18n.anupanaLabel} {vedicDoctorPrescription.anupana.vehicleName[code] || vedicDoctorPrescription.anupana.vehicleName.kn}
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "#451A03", lineHeight: 1.45, fontStyle: "italic" }}>
              {vedicDoctorPrescription?.anupana
                ? `${vedicDoctorPrescription.anupana.preparationMethod[code] || vedicDoctorPrescription.anupana.preparationMethod.kn} (${vedicDoctorPrescription.anupana.intakeTiming[code] || vedicDoctorPrescription.anupana.intakeTiming.kn}) — ${i18n.dailySankalpaText}`
                : i18n.dailySankalpaText}
            </div>
          </div>

          {/* Page 2 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "5px"
            }}
          >
            {i18n.page2Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 3: DASHA/GOCHARA SHANTI, VEDIC MANTRAS, GOKARNA SEVAS & ASHIRVADA */}
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
          background: "#FFFDF7",
          color: "#451A03",
          fontFamily: "'Cinzel', 'Playfair Display', 'Noto Serif Tamil', 'Noto Serif Kannada', 'Noto Serif', serif, sans-serif",
          display: "block"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1241px",
            maxHeight: "1241px",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "13px 18px",
            boxSizing: "border-box",
            backgroundColor: "#FCFBF9",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* 4 Corner Florets placed safely away from border to prevent any collision */}
          <div style={{ position: "absolute", top: "12px", left: "16px", color: "#D97706", fontSize: "12px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", top: "12px", right: "16px", color: "#D97706", fontSize: "12px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", left: "16px", color: "#D97706", fontSize: "12px", lineHeight: 1, pointerEvents: "none" }}>❖</div>
          <div style={{ position: "absolute", bottom: "12px", right: "16px", color: "#D97706", fontSize: "12px", lineHeight: 1, pointerEvents: "none" }}>❖</div>

          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "8px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              flexShrink: 0
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "15.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.3 }}>
              {i18n.page3Title}
            </div>
          </div>

          {/* Section 6: Dasha-Bhukti & Gochara Transits */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "12px",
              padding: "11px 16px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "3px"
              }}
            >
              🪐 {i18n.sec6Title}
            </div>

            {/* Dasha & Bhukti Card */}
            <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 13px", fontSize: "12px", lineHeight: 1.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: "#92400E", fontSize: "12.5px" }}>
                  <span>⏳ {cleanLabel(i18n.currentDasha)} </span>
                  <span style={{ color: "#B45309", fontWeight: 900 }}>
                    {isKn
                      ? `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn} ಮಹಾದಶೆ — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn} ಭುಕ್ತಿ`
                      : isHi
                      ? `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn} महादशा — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn} भुक्ति`
                      : isTe
                      ? `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn} మహర్దశ — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn} భుక్తి`
                      : isTa
                      ? `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn} மகாதிசை — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn} புக்தி`
                      : `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en} Dasha — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en} Bhukti`}
                  </span>
                </div>
                {dashaBhuktiAnalysis.sandhiAlert && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      backgroundColor: dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "#FEE2E2" : "#FEF3C7",
                      color: dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "#991B1B" : "#92400E",
                      padding: "0 9px",
                      height: "22px",
                      borderRadius: "6px",
                      fontWeight: 800,
                      border: "1px solid #FDE68A",
                      lineHeight: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box"
                    }}
                  >
                    <span style={{ transform: "translateY(-0.5px)" }}>
                      {dashaBhuktiAnalysis.sandhiAlert.durationFormatted?.[code] ||
                        dashaBhuktiAnalysis.sandhiAlert.durationFormatted?.kn ||
                        (isKn
                          ? (dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "ಸಕ್ರಿಯ" : "ಸ್ಥಿರ")
                          : isHi
                          ? (dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "सक्रिय" : "स्थिर")
                          : isTe
                          ? (dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "సక్రియం" : "స్థిరం")
                          : isTa
                          ? (dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "செயலில்" : "நிலையானது")
                          : (dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "Active" : "Stable"))}
                    </span>
                  </span>
                )}
              </div>

              {/* Dasha Sandhi Transition Alert Box */}
              {dashaBhuktiAnalysis.sandhiAlert && (
                <div
                  style={{
                    marginTop: "4px",
                    paddingTop: "4px",
                    borderTop: "1px dashed #FDE68A",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "11.5px"
                  }}
                >
                  <span style={{ fontWeight: 800, color: dashaBhuktiAnalysis.sandhiAlert.status === "active" ? "#991B1B" : "#B45309" }}>
                    <span>⏳ {cleanLabel(i18n.sandhiKalaLabel)} </span>
                    <span style={{ color: "#78350F" }}>
                      {dashaBhuktiAnalysis.sandhiAlert.title[code] || dashaBhuktiAnalysis.sandhiAlert.title.kn}
                    </span>
                  </span>
                </div>
              )}

              <div style={{ color: "#451A03", marginTop: "3px" }}>
                <span style={{ fontWeight: 800 }}>• {cleanLabel(i18n.activeKarmicFlow)} </span>
                <span>{dashaBhuktiAnalysis.periodEffect[code] || dashaBhuktiAnalysis.periodEffect.kn}</span>
              </div>
              <div style={{ color: "#78350F", marginTop: "2px", fontWeight: 700 }}>
                <span style={{ fontWeight: 800 }}>• {cleanLabel(i18n.remedialStep)} </span>
                <span>{dashaBhuktiAnalysis.remedialAction[code] || dashaBhuktiAnalysis.remedialAction.kn}</span>
              </div>
              {dashaBhuktiAnalysis.adhidevata && (
                <div style={{ color: "#78350F", marginTop: "2px", fontSize: "11.5px" }}>
                  <span style={{ fontWeight: 800 }}>• {cleanLabel(i18n.adhidevataTitle)} </span>
                  <span style={{ color: "#451A03", fontWeight: 700 }}>
                    {dashaBhuktiAnalysis.adhidevata.adhidevata[code] || dashaBhuktiAnalysis.adhidevata.adhidevata.kn} / {dashaBhuktiAnalysis.adhidevata.pratyadhidevata[code] || dashaBhuktiAnalysis.adhidevata.pratyadhidevata.kn}
                  </span>{" "}
                  — {dashaBhuktiAnalysis.adhidevata.sadhana[code] || dashaBhuktiAnalysis.adhidevata.sadhana.kn}
                </div>
              )}
            </div>

            {/* Gochara Transits Grid */}
            <div style={{ display: "grid", gridTemplateColumns: gocharaTransitAnalysis.transitHighlights.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr", gap: "8px" }}>
              {gocharaTransitAnalysis.transitHighlights.map((gh, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFDF8",
                    border: "1px solid #FDE68A",
                    borderRadius: "8px",
                    padding: "7px 10px",
                    fontSize: "11px",
                    lineHeight: 1.45
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E", fontSize: "11.5px" }}>
                    ✨ {gh.title[code] || gh.title.kn}
                  </div>
                  <div style={{ color: "#451A03", marginTop: "1px", fontSize: "10.5px" }}>
                    {gh.description[code] || gh.description.kn}
                  </div>
                  <div style={{ color: "#78350F", marginTop: "1px", fontWeight: 700, fontSize: "10.5px" }}>
                    {gh.remedy[code] || gh.remedy.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Sade Sati Status Alert */}
            <div
              style={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #FDE68A",
                borderRadius: "6px",
                padding: "6px 11px",
                fontSize: "11.5px",
                color: "#92400E",
                fontWeight: 800,
                lineHeight: 1.4
              }}
            >
              🪐 {gocharaTransitAnalysis.sadeSatiStatus[code] || gocharaTransitAnalysis.sadeSatiStatus.kn}
            </div>

            {/* Turnaround Timing & Milestones */}
            {lifeTurnaroundTiming && (
              <div
                style={{
                  backgroundColor: "#FFFDF8",
                  border: "1px solid #FDE68A",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  fontSize: "11.5px",
                  lineHeight: 1.45
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 900, color: "#78350F", fontSize: "12px" }}>
                  <span>⭐ {i18n.turnaroundTitle}</span>
                  <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", padding: "0 9px", height: "20px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 800, display: "inline-flex", alignItems: "center" }}>
                    {lifeTurnaroundTiming.timeline?.[code] || (isKn ? lifeTurnaroundTiming.timelineKn : (lifeTurnaroundTiming.timelineEn || lifeTurnaroundTiming.timelineKn))}
                  </span>
                </div>
                <div style={{ color: "#451A03", marginTop: "3px" }}>
                  <span style={{ fontWeight: 800 }}>
                    {isKn ? "• ಪ್ರೇರಕ ಗ್ರಹ & ಸೇವೆ: " : isHi ? "• प्रेरक ग्रह एवं सेवा: " : isTe ? "• ప్రేరక గ్రహం & సేవ: " : isTa ? "• தூண்டுதல் கிரகம் & சேவை: " : "• Catalyst & Seva: "}
                  </span>
                  <span style={{ fontWeight: 700, color: "#92400E" }}>
                    {(() => {
                      const catalyst = lifeTurnaroundTiming.catalystGraha?.[code] || (isKn ? lifeTurnaroundTiming.catalystGrahaKn : (lifeTurnaroundTiming.catalystGrahaEn || (isTa ? "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர்" : isHi ? "श्री गोकर्ण महाबलेश्वर" : isTe ? "శ్రీ గోకర్ణ మహాబలేశ్వర" : "Sri Gokarna Mahabaleshwara")));
                      const seva = lifeTurnaroundTiming.specificSeva?.[code] || (isKn ? lifeTurnaroundTiming.specificSevaKn : (lifeTurnaroundTiming.specificSevaEn || (isTa ? "சிறப்பு பூஜை" : isHi ? "विशेष पूजा" : isTe ? "విశేష పూజ" : "Special Seva")));
                      return `${catalyst} · ${seva}`;
                    })()}
                  </span>
                </div>
                {lifeTurnaroundTiming.day10Expectation && (
                  <div style={{ color: "#78350F", marginTop: "2px" }}>
                    <span style={{ fontWeight: 800 }}>• {cleanLabel(i18n.day10Title)} </span>
                    <span>{lifeTurnaroundTiming.day10Expectation[code] || lifeTurnaroundTiming.day10Expectation.kn}</span>
                  </div>
                )}
                {lifeTurnaroundTiming.day15Expectation && (
                  <div style={{ color: "#78350F", marginTop: "2px" }}>
                    <span style={{ fontWeight: 800 }}>• {cleanLabel(i18n.day15Title)} </span>
                    <span>{lifeTurnaroundTiming.day15Expectation[code] || lifeTurnaroundTiming.day15Expectation.kn}</span>
                  </div>
                )}
                {/* Before vs After Transformation */}
                {lifeTurnaroundTiming.beforeState && lifeTurnaroundTiming.afterState && (
                  <div style={{ color: "#78350F", marginTop: "3px", fontSize: "11px", lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 800, color: "#92400E" }}>{cleanLabel(i18n.beforeAfterTitle)} </span>
                    <span style={{ color: "#991B1B", fontWeight: 700 }}>{lifeTurnaroundTiming.beforeState[code] || lifeTurnaroundTiming.beforeState.kn}</span>
                    <span style={{ color: "#D97706", fontWeight: 800 }}> ➔ </span>
                    <span style={{ color: "#166534", fontWeight: 700 }}>{lifeTurnaroundTiming.afterState[code] || lifeTurnaroundTiming.afterState.kn}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sacred Vedic Graha Shanti Mantra Box (MANDATORY & AUTHENTIC) */}
          <div
            style={{
              backgroundColor: "#FFFDF8",
              border: "1.5px solid #D97706",
              borderRadius: "12px",
              padding: "11px 16px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "3px"
              }}
            >
              <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#78350F" }}>
                📿 {i18n.vedicGrahaShantiTitle}
              </div>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 900,
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #D97706",
                  padding: "0 11px",
                  height: "23px",
                  borderRadius: "6px",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  boxSizing: "border-box"
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", transform: "translateY(-0.5px)" }}>
                  ✦ {i18n.chant11TimesDaily}
                </span>
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "12px", fontSize: "12px", lineHeight: 1.5 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#92400E", fontSize: "12.5px" }}>
                  🔯 {cleanLabel(i18n.prescribedDeityLabel)}{" "}
                  <span style={{ color: "#78350F", fontWeight: 900 }}>
                    {grahaMantra.deityName[code] || grahaMantra.deityName.kn}
                  </span>
                </div>
                <div
                  style={{
                    color: "#991B1B",
                    fontWeight: 900,
                    fontSize: "12.5px",
                    marginTop: "3px",
                    fontStyle: "italic",
                    backgroundColor: "#FFFFFF",
                    padding: "7px 11px",
                    borderRadius: "8px",
                    border: "1.5px solid #FDE68A",
                    lineHeight: 1.55,
                    letterSpacing: "0.2px"
                  }}
                >
                  {code === "en"
                    ? (grahaMantra.sanskritShlokaL5?.en || grahaMantra.transliteration || transliterateIndicToLatin(grahaMantra.sanskritShloka))
                    : (grahaMantra.sanskritShlokaL5?.[code] || grahaMantra.sanskritShloka)}
                </div>
              </div>
              <div>
                <div style={{ color: "#451A03" }}>
                  <strong style={{ color: "#78350F" }}>📖 {cleanLabel(i18n.mantraMeaningLabel)} </strong>
                  <span>{grahaMantra.meaning[code] || grahaMantra.meaning.kn}</span>
                </div>
                <div style={{ color: "#78350F", marginTop: "3px", fontWeight: 700 }}>
                  <strong style={{ color: "#92400E" }}>✨ {cleanLabel(i18n.calmingBenefitLabel)} </strong>
                  <span>{grahaMantra.calmingBenefit[code] || grahaMantra.calmingBenefit.kn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Sacred Gokarna Mahabaleshwara Remedies */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "12px",
              padding: "11px 16px",
              boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "3px"
              }}
            >
              🛕 {i18n.sec7Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px" }}>
              {/* Prescribed Seva */}
              <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 13px", fontSize: "12px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#92400E", fontSize: "12px" }}>🔱 {cleanLabel(i18n.prescribedSeva)}</div>
                <div style={{ color: "#451A03", fontWeight: 900, fontSize: "13px", marginTop: "2px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.name[code] || gokarnaTempleRemedies.prescribedSeva.name.kn}
                </div>
                <div style={{ color: "#78350F", fontSize: "11.5px", marginTop: "2px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.temple[code] || gokarnaTempleRemedies.prescribedSeva.temple.kn}
                </div>
                <div style={{ color: "#78350F", fontSize: "11.5px", marginTop: "2px", fontWeight: 700 }}>
                  📅 {gokarnaTempleRemedies.prescribedSeva.idealDay[code] || gokarnaTempleRemedies.prescribedSeva.idealDay.kn}
                </div>
              </div>

              {/* Rudraksha, Gemstone, Daana */}
              <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #FDE68A", borderRadius: "8px", padding: "8px 13px", fontSize: "12px", lineHeight: 1.5 }}>
                <div>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>📿 {cleanLabel(i18n.rudraksha)} </span>
                  <span style={{ color: "#451A03", fontWeight: 700 }}>
                    {gokarnaTempleRemedies.rudrakshaRecommendation.mukhi[code] || gokarnaTempleRemedies.rudrakshaRecommendation.mukhi.kn}
                  </span>
                </div>
                <div style={{ marginTop: "3px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>💎 {cleanLabel(i18n.gemstone)} </span>
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.gemstoneRecommendation.stone[code] || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn} ({gokarnaTempleRemedies.gemstoneRecommendation.metal[code] || gokarnaTempleRemedies.gemstoneRecommendation.metal.kn})
                  </span>
                </div>
                {gokarnaTempleRemedies.neckWearRecommendation && (
                  <div style={{ marginTop: "3px" }}>
                    <span style={{ fontWeight: 800, color: "#92400E" }}>📿 {code === "kn" ? "ಕಂಠಹಾರ / ಸಾರ:" : code === "hi" ? "कंठहार / माला:" : code === "te" ? "కంఠహారం / సారా:" : code === "ta" ? "கழுத்து மாலை / சாரா:" : "Neck Wear / Sara:"} </span>
                    <span style={{ color: "#451A03" }}>
                      {gokarnaTempleRemedies.neckWearRecommendation.pendant[code] || gokarnaTempleRemedies.neckWearRecommendation.pendant.kn} ({gokarnaTempleRemedies.neckWearRecommendation.thread[code] || gokarnaTempleRemedies.neckWearRecommendation.thread.kn})
                    </span>
                  </div>
                )}
                <div style={{ marginTop: "3px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>🌾 {cleanLabel(i18n.daana)} </span>
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.donationDaana.item[code] || gokarnaTempleRemedies.donationDaana.item.kn} — {gokarnaTempleRemedies.donationDaana.beneficiary[code] || gokarnaTempleRemedies.donationDaana.beneficiary.kn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Chief Priest Veda Moorthy Chaitanya Pandit & Temple Contact */}
          {(() => {
            const shortPriestName = getShortPriestName(overridePriestName, code);
            const displayPhone = overridePriestPhone?.trim()
              ? (["9972339362", "9482109844"].includes(overridePriestPhone.replace(/[^0-9]/g, "")) ? "+91 94821 09844" : overridePriestPhone)
              : chiefPriestBlessing.phone;

            return (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #D97706",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #FDE68A",
                    paddingBottom: "3px"
                  }}
                >
                  <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F" }}>
                    🙏 {i18n.sec8Title}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#92400E",
                      fontWeight: 800,
                      backgroundColor: "#FEF3C7",
                      border: "1px solid #FDE68A",
                      padding: "1px 7px",
                      borderRadius: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px"
                    }}
                  >
                    🪔 {isKn ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ಅಧಿಕೃತ ಮುದ್ರೆ" : isHi ? "॥ गोकर्ण सन्निधि ॥ आधिकारिक मुद्रा" : isTe ? "॥ గోకర్ణ సన్నిధి ॥ అధికారిక ముద్ర" : isTa ? "॥ கோகர்ண சந்நிதி ॥ அங்கீகரிக்கப்பட்ட முத்திரை" : "॥ Sri Gokarna Kshetra ॥ Official Seal"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>
                    {shortPriestName}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#92400E", fontWeight: 700 }}>
                    {chiefPriestBlessing.priestTitle[code] || chiefPriestBlessing.priestTitle.kn} · {cleanLabel(i18n.priestContact)} {displayPhone}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Page 3 Footer */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "11.5px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1.5px dashed #FDE68A",
              paddingTop: "7px",
              flexShrink: 0
            }}
          >
            {i18n.page3Footer}
          </div>
        </div>
      </div>
    </div>
  );
};
