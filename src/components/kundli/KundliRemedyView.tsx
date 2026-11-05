import React, { useState, useEffect, useMemo } from "react";
import Card from "../ui/Card";
import { type KundliRemedyDiagnosis, type SupportedLanguage, computeMandalaVrataSadhana } from "../../features/remedies/kundliRemedyEngine";
import { transliterateName, transliterateIndicToLatin } from "../../utils/transliterator";
import { REMEDY_AI_FALLBACK_MESSAGES } from "../../features/remedies/kundliRemedyAiEngine";
import {
  getAllPriests,
  saveOrUpdatePriestProfile,
  type PriestProfile
} from "../../features/seva/sevaPriestDirectory";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { PostPoojaRemedyJapaCard } from "../darshana/PostPoojaRemedyJapaCard";

export type KundliRemedyViewProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang: string;
  onDownloadPdf: (selectedLang: string, priestName?: string, priestPhone?: string) => void;
  isGeneratingPdf?: boolean;
  isAiGenerating?: boolean;
  initialPriestId?: string;
  initialPriestName?: string;
  initialPriestPhone?: string;
  onPriestChange?: (priestName: string, priestPhone: string) => void;
};

export const REMEDY_VIEW_I18N: Record<SupportedLanguage, {
  headerTitle: string;
  headerSubtitle: string;
  pdfLangLabel: string;
  generatingPdfBtn: string;
  downloadPdfBtn: string;
  gotraLabel: string;
  lagnaLabel: string;
  rashiLabel: string;
  nakshatraLabel: string;
  dashaLabel: string;
  bhuktiLabel: string;
  calmingTimeLabel: string;
  startCalmTimerBtn: string;
  emergencyMantraTitle: string;
  rootCauseTitle: string;
  lifeTurnaroundTitle: string;
  catalystGrahaTitle: string;
  targetedSevaTitle: string;
  mechanismTitle: string;
  astrologicalReasonTitle: string;
  day10Title: string;
  day15Title: string;
  beforeAfterTitle: string;
  currentFrictionTitle: string;
  transformedStateTitle: string;
  afflictedGrahasTitle: string;
  metersTitle: string;
  meterKrodha: string;
  meterManas: string;
  meterVitality: string;
  meterPatience: string;
  meterTip: string;
  panchangaTitle: string;
  panchangaSubtitle: string;
  sacredTreeTitle: string;
  deityWorshipTitle: string;
  tithiVrataTitle: string;
  weekdaySadhanaTitle: string;
  colorTitle: string;
  yogaKaranaTitle: string;
  yogaRemedyTitle: string;
  karanaRemedyTitle: string;
  dailyStotrasTitle: string;
  dailyStotrasSubtitle: string;
  deityLabel: string;
  meaningLabel: string;
  benefitsLabel: string;
  timeLabel: string;
  directionLabel: string;
  // 45-Day Mandala Vrata Sadhana & Tracker
  mandalaSectionTitle: string;
  mandalaSubtitle: string;
  mandalaPhase1Title: string;
  mandalaPhase1Desc: string;
  mandalaPhase2Title: string;
  mandalaPhase2Desc: string;
  mandalaPhase3Title: string;
  mandalaPhase3Desc: string;
  muhurthaCardTitle: string;
  auspiciousWeekdaysTitle: string;
  taraBalaRuleTitle: string;
  japaFormulaCardTitle: string;
  japaFormulaCount: string;
  malaRuleTitle: string;
  pathyaCardTitle: string;
  aharaTitle: string;
  acharaTitle: string;
  weeklyDanaTitle: string;
  trackerCardTitle: string;
  trackerProgressLabel: string;
  daysCompletedSuffix: string;
  clickToToggleHelp: string;
  dailyChecklistTitle: string;
  dailyCheckItem1: string;
  dailyCheckItem2: string;
  dailyCheckItem3: string;
  dailyCheckItem4: string;
  dailyCheckItem5: string;
  sankalpaBoxTitle: string;
  copySankalpaBtn: string;
  copiedMsg: string;
  // Dasha Gochara & Planetary
  dashaGocharaTitle: string;
  dashaSuffix: string;
  mahaDashaLabel: string;
  bhuktiSuffix: string;
  activeSandhiBadge: string;
  upcomingSandhiBadge: string;
  stableSandhiBadge: string;
  sandhiRemedyPrefix: string;
  remedyPrefix: string;
  planetaryTitle: string;
  planetarySubtitle: string;
  debilitatedTitle: string;
  nbryBadge: string;
  debilitatedBadge: string;
  shantiRemedyPrefix: string;
  gemstoneCautionPrefix: string;
  exaltedTitle: string;
  exaltedBadge: string;
  blessingPrefix: string;
  sadhanaPrefix: string;
  influencerBenchmarkTitle: string;
  influencerAuthenticPrefix: string;
  gokarnaSevasTitle: string;
  prescribedSevaTitle: string;
  idealDayTitle: string;
  rudrakshaGemstoneTitle: string;
  rudrakshaPrefix: string;
  gemstonePrefix: string;
  sacredDanaTitle: string;
  itemPrefix: string;
  dayPrefix: string;
  beneficiaryPrefix: string;
  priestSelectionTitle: string;
  priestSelectionDesc: string;
  selectPriestLabel: string;
  addNewPriestOption: string;
  priestNameLabel: string;
  priestPhoneLabel: string;
  priestNamePlaceholder: string;
  savePriestBtn: string;
  saveSuccessMsg: string;
  badhakaBadge: string;
  adhidevataBadge: string;
  pratyadhidevataBadge: string;
  prescriptionCardTitle: string;
  prescriptionCardSubtitle: string;
  prescriptionNidanaTitle: string;
  prescriptionAushadhaTitle: string;
  prescriptionAnupanaTitle: string;
  prescriptionPathyaTitle: string;
  prescriptionApathyaTitle: string;
  prescriptionTimingTitle: string;
  prescriptionProgressionTitle: string;
  padaLabel: string;
  yogaLabel: string;
  karanaLabel: string;
  elementalBalanceLabel: string;
  houseSuffix: (house: number) => string;
  transitEffectAuspicious: string;
  transitEffectChallenging: string;
  shastricAnalysisBadge: string;
  clinicalChikitsaBadge: string;
  firebaseSyncBadge: string;
  templeSealBadge: string;
  analyzingNatalSubtitle: string;
}> = {
  kn: {
    headerTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ",
    headerSubtitle: "ಕುಂಡಲಿಯ ಗ್ರಹದೋಷ, ತೀವ್ರ ಕೋಪ / ಆವೇಶ ಶಮನ, ನಿತ್ಯ ಸ್ತೋತ್ರ, ೪೫ ದಿನಗಳ ಮಂಡಲ ವ್ರತ, ಗೋಚಾರ & ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಸೇವೆಗಳು.",
    pdfLangLabel: "🌐 PDF ಭಾಷೆ:",
    generatingPdfBtn: "⌛ ೪-ಪುಟಗಳ PDF ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    downloadPdfBtn: "ದೈವಿಕ ಪರಿಹಾರ ವರದಿ PDF ಡೌನ್‌ಲೋಡ್ (4-ಪುಟ A4)",
    gotraLabel: "ಗೋತ್ರ",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ರಾಶಿ:",
    nakshatraLabel: "ನಕ್ಷತ್ರ:",
    dashaLabel: "ದಶೆ",
    bhuktiLabel: "ಭುಕ್ತಿ",
    calmingTimeLabel: "ಶಾಂತಿ ಸಮಯ:",
    startCalmTimerBtn: "೩-ನಿಮಿಷಗಳ ಶಾಂತಿ ಟೈಮರ್ ಪ್ರಾರಂಭಿಸಿ",
    emergencyMantraTitle: "ಆಪತ್ಕಾಲೀನ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಕೋಪ ಬಂದಾಗ ೧೧ ಬಾರಿ ಮನಸ್ಸಿನಲ್ಲೇ ಜಪಿಸಿ)",
    rootCauseTitle: "ಕುಂಡಲಿ ದೋಷ & ಮಾನಸಿಕ ಸಂಘರ್ಷಗಳ ಮೂಲ ಕಾರಣ",
    lifeTurnaroundTitle: "ಭಾಗ್ಯೋದಯ & ಪರಿಹಾರ ಕಾಲಾವಧಿ (Life Turnaround Window)",
    catalystGrahaTitle: "ಭಾಗ್ಯೋದಯ ಪ್ರೇರಕ ಗ್ರಹ (Catalyst Graha):",
    targetedSevaTitle: "ನಿರ್ದಿಷ್ಟ ಗೋಕರ್ಣ ಸೇವೆ (Targeted Seva):",
    mechanismTitle: "ಬದಲಾವಣೆಯ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಕ್ರಿಯೆ: ",
    astrologicalReasonTitle: "ಜ್ಯೋತಿಷ್ಯ ಕಾರಣ & ಗ್ರಹ ಪ್ರಭಾವ: ",
    day10Title: "೧೦ ದಿನಗಳ ನಿರಂತರ ಸಾಧನೆಯ ಅನುಭವ",
    day15Title: "೧೫ ದಿನಗಳ ನಂತರ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಜೀವನ ತಿರುವು",
    beforeAfterTitle: "ಪರಿಹಾರ ಪೂರ್ವ vs ಪರಿಹಾರೋತ್ತರ ಫಲ",
    currentFrictionTitle: "ಪ್ರಸ್ತುತ ಕರ್ಮ ಸ್ಥಿತಿ: ",
    transformedStateTitle: "ಪರಿಹಾರೋತ್ತರ ಬದಲಾವಣೆ: ",
    afflictedGrahasTitle: "ಪರಿಹಾರ ಅಗತ್ಯವಿರುವ ಗ್ರಹ ದೋಷಗಳು:",
    metersTitle: "ಮಾನಸಿಕ ತತ್ತ್ವ ಮಾಪನ",
    meterKrodha: "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ",
    meterManas: "ಮನೋ ಶಾಂತಿ & ಧೃತಿ",
    meterVitality: "ಆತ್ಮ ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ",
    meterPatience: "ತಾಳ್ಮೆ & ಸಹಿಷ್ಣುತೆ",
    meterTip: "ಸಲಹೆ: ದಿನಕ್ಕೆ ೧೦ ನಿಮಿಷ ಶಾಂತಚಿತ್ತದಿಂದ ಕುಳಿತು ಚಂದ್ರ ಧ್ಯಾನ ಮಾಡುವುದರಿಂದ ಪಿತ್ತ ಶಕ್ತಿ ಶಾಂತವಾಗಿ ತಾಳ್ಮೆ ವೃದ್ಧಿಸುತ್ತದೆ.",
    panchangaTitle: "ಪಂಚಾಂಗ ೫-ಅಂಗ ದೈವಿಕ ಪರಿಹಾರಗಳು & ನಕ್ಷತ್ರ ವೃಕ್ಷ ಸಾಧನೆ",
    panchangaSubtitle: "ಜನ್ಮ ನಕ್ಷತ್ರ ವೃಕ್ಷ, ತಿಥಿ ವ್ರತ, ವಾರದ ಆರಾಧನೆ, ಯೋಗ & ಕರಣ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರಗಳು.",
    sacredTreeTitle: "ಜನ್ಮ ನಕ್ಷತ್ರ ವೃಕ್ಷ (Sacred Tree):",
    deityWorshipTitle: "ದೇವತಾ ಆರಾಧನೆ:",
    tithiVrataTitle: "ಜನ್ಮ ತಿಥಿ ವ್ರತ & ಉಪಾಯ:",
    weekdaySadhanaTitle: "ವಾರದ ದೈವಿಕ ಸಾಧನೆ & ಶುಭ ವರ್ಣ:",
    colorTitle: "ಬಣ್ಣ:",
    yogaKaranaTitle: "ಸೌರ-ಚಾಂದ್ರ ಯೋಗ & ಕರಣ ಕರ್ಮ ಫಲ:",
    yogaRemedyTitle: "ಯೋಗ ಪರಿಹಾರ:",
    karanaRemedyTitle: "ಕರಣ ಪರಿಹಾರ:",
    dailyStotrasTitle: "ಜಾತಕಕ್ಕೆ ವಿಶೇಷವಾಗಿ ನಿಗದಿಪಡಿಸಿದ ನಿತ್ಯ ಸ್ತೋತ್ರಗಳು (Daily Stotra Guide)",
    dailyStotrasSubtitle: "ನಿಮ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹ ಪೀಡೆ ಪರಿಹರಿಸಲು ಪ್ರತಿದಿನ ಪಠಿಸಬೇಕಾದ ಶಕ್ತಿಶಾಲಿ ಸ್ತೋತ್ರಗಳು.",
    deityLabel: "ದೇವತೆ:",
    meaningLabel: "ಭಾವಾರ್ಥ:",
    benefitsLabel: "ಫಲಶ್ರುತಿ:",
    timeLabel: "ಸಮಯ:",
    directionLabel: "ದಿಕ್ಕು:",
    mandalaSectionTitle: "೪೫ ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನಾ ಮಾರ್ಗ & ಸಂಕಲ್ಪ ಸಿದ್ಧಿ",
    mandalaSubtitle: "ಶಾಸ್ತ್ರೋಕ್ತ ೪೫ ದಿನಗಳ ನಿರಂತರ ಮಂಡಲ ಸಾಧನೆ - ಜನ್ಮ ತಾರಾಬಲ ಮುಹೂರ್ತ, ಲಘು ಪುರಶ್ಚರಣ ಮಂತ್ರ, ಸಾತ್ತ್ವಿಕ ಪಥ್ಯ & ದೈನಂದಿನ ಟ್ರ್ಯಾಕರ್.",
    mandalaPhase1Title: "ಹಂತ ೧: ಶುದ್ಧೀಕರಣ & ದೋಷ ಶಮನ",
    mandalaPhase1Desc: "ಸಂಚಿತ ಕರ್ಮ ಪ್ರಕ್ಷಾಲನೆ, ಕೋಪ-ಉದ್ವೇಗ ಶಾಂತಿ ಮತ್ತು ಪ್ರಾಣಶಕ್ತಿ ಸ್ಥಿರತೆ.",
    mandalaPhase2Title: "ಹಂತ ೨: ಶಕ್ತಿ ಸಂಚಯನ & ಭಾಗ್ಯೋದಯ",
    mandalaPhase2Desc: "ಮಾನಸಿಕ ಧೃತಿ, ಸಾತ್ತ್ವಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ಕಾರ್ಯಗಳಲ್ಲಿನ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆ.",
    mandalaPhase3Title: "ಹಂತ ೩: ಸಂಕಲ್ಪ ಸಿದ್ಧಿ & ಸ್ಥಿರ ಶಾಂತಿ",
    mandalaPhase3Desc: "ಅಭೀಷ್ಟ ಸಿದ್ಧಿ, ದೈವಾನುಗ್ರಹ ಸ್ಥಿರತೆ ಮತ್ತು ಜೀವನದಲ್ಲಿ ದೃಢ ಶಾಂತಿ-ಸಮೃದ್ಧಿ.",
    muhurthaCardTitle: "ಶುಭ ಮುಹೂರ್ತ & ತಾರಾಬಲ ನಿಯಮ",
    auspiciousWeekdaysTitle: "ಸಾಧನೆಗೆ ಪ್ರಶಸ್ತ ವಾರಗಳು:",
    taraBalaRuleTitle: "ಜನ್ಮ ತಾರಾಬಲ ಶಾಸ್ತ್ರ:",
    japaFormulaCardTitle: "ಲಘು ಪುರಶ್ಚರಣ ೧೦೮ ಜಪ ಸೂತ್ರ",
    japaFormulaCount: "೪,೮೬೦ ಜಪ ಸಂಖ್ಯಾ",
    malaRuleTitle: "ಮಾಲಾ ನಿಯಮ & ದಿಕ್ಕು:",
    pathyaCardTitle: "ಸಾತ್ತ್ವಿಕ ಪಥ್ಯ & ನಿತ್ಯ ನಿಯಮಾವಳಿ",
    aharaTitle: "ಆಹಾರ ಪಥ್ಯ:",
    acharaTitle: "ಆಚಾರ ನಿಯಮ:",
    weeklyDanaTitle: "ವಾರದ ದಾನ & ಗೋಸೇವೆ:",
    trackerCardTitle: "೪೫ ದಿನಗಳ ದೈನಂದಿನ ಸಾಧನಾ ಟ್ರ್ಯಾಕರ್ (ಪ್ರತಿದಿನ ಸಾಧನೆ ಮುಗಿದ ನಂತರ ಕ್ಲಿಕ್ ಮಾಡಿ)",
    trackerProgressLabel: "ಸಾಧನಾ ಪ್ರಗತಿ:",
    daysCompletedSuffix: "ದಿನಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
    clickToToggleHelp: "ಯಾವುದೇ ದಿನದ ಸಾಧನೆ ಪೂರ್ಣಗೊಂಡಾಗ ಆ ದಿನದ ಸಂಖ್ಯೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಗುರುತು ಮಾಡಿ.",
    dailyChecklistTitle: "ದೈನಂದಿನ ೫-ಹಂತದ ಸಾಧನಾ ಪಟ್ಟಿ:",
    dailyCheckItem1: "ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದಲ್ಲಿ ಎದ್ದು ಶುಚಿರ್ಭೂತರಾಗಿ ಸ್ನಾನ ಮಾಡಿ ಶುಭ್ರ ವಸ್ತ್ರ ಧರಿಸುವುದು.",
    dailyCheckItem2: "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರಕ್ಕೆ ಮುಖಮಾಡಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಸಂಕಲ್ಪ ಧ್ಯಾನ ಮಾಡುವುದು.",
    dailyCheckItem3: "ತುಳಸಿ ಅಥವಾ ರುದ್ರಾಕ್ಷಿ ಮಾಲೆಯಿಂದ ನಿಗದಿತ ಬೀಜ ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಏಕಾಗ್ರತೆಯಿಂದ ಜಪಿಸುವುದು.",
    dailyCheckItem4: "ಕುಂಡಲಿಗೆ ನಿಗದಿತ ದೇವತಾ ಸ್ತೋತ್ರವನ್ನು ಭಕ್ತಿಭಾವದಿಂದ ಪಠಿಸುವುದು.",
    dailyCheckItem5: "ದಿನವಿಡೀ ಸಾತ್ತ್ವಿಕ ಆಹಾರ, ಸತ್ಯ-ಶಾಂತ ಮಾತು ಹಾಗೂ ಕ್ರೋಧ ಮುಕ್ತ ನಡವಳಿಕೆ ಕಾಪಾಡುವುದು.",
    sankalpaBoxTitle: "ದೈವಿಕ ಸಂಕಲ್ಪ ವಿಧಿ (ವ್ರತಾರಂಭದ ದಿನ ಪಠಿಸಬೇಕಾದದ್ದು)",
    copySankalpaBtn: "📋 ಸಂಕಲ್ಪ ನಕಲಿಸಿ",
    copiedMsg: "✓ ನಕಲಿಸಲಾಗಿದೆ!",
    dashaGocharaTitle: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಫಲ ಪರಿಹಾರ",
    dashaSuffix: "ದಶೆ",
    mahaDashaLabel: "ಮಹಾದಶೆ",
    bhuktiSuffix: "ಭುಕ್ತಿ",
    activeSandhiBadge: "ಸಕ್ರಿಯ ಸಂಧಿ ಕಾಲ",
    upcomingSandhiBadge: "ಮುಂಬರುವ ಸಂಧಿ ಕಾಲ",
    stableSandhiBadge: "ಸ್ಥಿರ ಕಾಲ",
    sandhiRemedyPrefix: "ಸಂಧಿ ಕಾಲ ಶಾಂತಿ ಪರಿಹಾರ: ",
    remedyPrefix: "ಪರಿಹಾರ: ",
    planetaryTitle: "ಗ್ರಹಗಳ ಉಚ್ಚ / ನೀಚ ಬಲ, ನೀಚಭಂಗ ರಾಜಯೋಗ & ರತ್ನ ಎಚ್ಚರಿಕೆ",
    planetarySubtitle: "ಗ್ರಹಗಳ ಪ್ರಭಾವಕ್ಕೆ ತಕ್ಕಂತೆ ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ ಧಾರಣೆ, ನೀಚಭಂಗ ರಾಜಯೋಗ ಪರಿಶೀಲನೆ ಹಾಗೂ ಆಧುನಿಕ ಪ್ರಭಾವಿಗಳ ತುಲನೆ.",
    debilitatedTitle: "ಕುಂಡಲಿಯಲ್ಲಿ ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿರುವ ಗ್ರಹಗಳು & ಶಾಂತಿ ಪರಿಹಾರ:",
    nbryBadge: "ನೀಚಭಂಗ ರಾಜಯೋಗ (NBRY)",
    debilitatedBadge: "ನೀಚ ಸ್ಥಿತಿ",
    shantiRemedyPrefix: "ಶಾಂತಿ ಪರಿಹಾರ: ",
    gemstoneCautionPrefix: "ರತ್ನ ಎಚ್ಚರಿಕೆ: ",
    exaltedTitle: "ಕುಂಡಲಿಯಲ್ಲಿ ಉಚ್ಚ ಸ್ಥಿತಿಯಲ್ಲಿರುವ ಗ್ರಹಗಳು & ಸದ್ಬಲ ಕ್ರಿಯಾಶೀಲತೆ:",
    exaltedBadge: "ಉಚ್ಚ ಸ್ಥಾನ",
    blessingPrefix: "ಆಶೀರ್ವಾದ: ",
    sadhanaPrefix: "ಸಾಧನೆ: ",
    influencerBenchmarkTitle: "ಆಧುನಿಕ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಭಾವಿಗಳ ತುಲನೆ & ಶಾಸ್ತ್ರೀಯ ಸತ್ಯತೆ",
    influencerAuthenticPrefix: "ಶಾಸ್ತ್ರೋಕ್ತ ಸತ್ಯತೆ: ",
    gokarnaSevasTitle: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ದೈವಿಕ ಸೇವೆಗಳು & ಧರ್ಮೋಪಾಯ",
    prescribedSevaTitle: "ಶಿಫಾರಸು ಮಾಡಿದ ಸೇವೆ:",
    idealDayTitle: "ಶುಭ ದಿನ:",
    rudrakshaGemstoneTitle: "ರುದ್ರಾಕ್ಷಿ & ರತ್ನ ಧಾರಣೆ:",
    rudrakshaPrefix: "• ರುದ್ರಾಕ್ಷಿ: ",
    gemstonePrefix: "• ರತ್ನ: ",
    sacredDanaTitle: "ಶುಭ ದಾನ & ಗೋಸೇವೆ:",
    itemPrefix: "• ದ್ರವ್ಯ: ",
    dayPrefix: "• ದಿನ: ",
    beneficiaryPrefix: "• ಸ್ವೀಕಾರಕರ್ತರು: ",
    priestSelectionTitle: "ದೈವಿಕ ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶಕ ಪುರೋಹಿತರ ಆಯ್ಕೆ (Priest Selection)",
    priestSelectionDesc: "ದೈವಿಕ ಪರಿಹಾರಗಳಿಗಾಗಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬದಲು ಇತರ ಪುರೋಹಿತರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಹೊಸ ಪುರೋಹಿತರನ್ನು ಸೇರಿಸಿ. ಉಳಿಸಿದಾಗ ವಿವರಗಳು Firebase ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸೇರ್ಪಡೆಗೊಳ್ಳುತ್ತವೆ:",
    selectPriestLabel: "ಪುರೋಹಿತರ ಆಯ್ಕೆ (Select Priest)",
    addNewPriestOption: "➕ ಹೊಸ ಪುರೋಹಿತರನ್ನು ಸೇರಿಸಿ (+ Add New Priest)",
    priestNameLabel: "ಪುರೋಹಿತರ ಹೆಸರು (Priest Name)",
    priestPhoneLabel: "ಮೊಬೈಲ್ / WhatsApp ಸಂಖ್ಯೆ",
    priestNamePlaceholder: "ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    savePriestBtn: "💾 ಉಳಿಸಿ",
    saveSuccessMsg: "✓ ಪುರೋಹಿತರ ವಿವರಗಳು Firebase ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿದಿವೆ!",
    badhakaBadge: "ಬಾಧಕ ಗ್ರಹ & ಅಡೆತಡೆ",
    adhidevataBadge: "ಅಧಿದೇವತೆ",
    pratyadhidevataBadge: "ಪ್ರತ್ಯಧಿದೇವತೆ",
    prescriptionCardTitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಚಿಕಿತ್ಸಾ ಪತ್ರ (Medical-Grade Astrological Prescription)",
    prescriptionCardSubtitle: "ವೈದ್ಯರು ರೋಗಿಗೆ ನಿಖರ ಔಷಧ ಮತ್ತು ಪಥ್ಯ ನೀಡುವಂತೆ, ಕುಂಡಲಿಯ ಗ್ರಹದೋಷ ಶಮನಕ್ಕೆ ಶಾಸ್ತ್ರೋಕ್ತ ನಿಧಾನ, ಔಷಧ, ಅನುಪಾನ ಹಾಗೂ ೧೫-೨೦ ದಿನಗಳ ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆ.",
    prescriptionNidanaTitle: "ಕರ್ಮ & ದೋಷ ನಿಧಾನ (Karmic & Doshic Diagnosis):",
    prescriptionAushadhaTitle: "ದೈವಿಕ ಮಂತ್ರೌಷಧ (Prescribed Shastric Aushadha):",
    prescriptionAnupanaTitle: "ಪವಿತ್ರ ಅನುಪಾನ & ಸೇವನಾ ವಿಧಿ (Sacred Vehicle & Ingestion):",
    prescriptionPathyaTitle: "ಅನುಸರಿಸಬೇಕಾದ ಪಥ್ಯ (Prescribed Pathya - 15 to 20 Days):",
    prescriptionApathyaTitle: "ವರ್ಜಿಸಬೇಕಾದ ಅಪಥ್ಯ (Strictly Prohibited Apathya):",
    prescriptionTimingTitle: "ಚಿಕಿತ್ಸಾ ಕಾಲ, ಆಸನ & ದಿಕ್ಕು (Clinical Timing & Setup):",
    prescriptionProgressionTitle: "೧೫ ರಿಂದ ೨೦ ದಿನಗಳಲ್ಲಿ ಅನುಭವಕ್ಕೆ ಬರುವ ಪರಿಹಾರ ಹಂತಗಳು (15-20 Day Relief Progression):",
    padaLabel: "ಪಾದ",
    yogaLabel: "ಯೋಗ",
    karanaLabel: "ಕರಣ",
    elementalBalanceLabel: "ಪಂಚಮಹಾಭೂತ ಸಮತೋಲನ ಕಾರಣ: ",
    houseSuffix: (h) => `${h}ನೇ ಭಾವ`,
    transitEffectAuspicious: "ಶುಭ ಫಲ",
    transitEffectChallenging: "ಸವಾಲು / ಪರೀಕ್ಷೆ",
    shastricAnalysisBadge: "ಅಧಿಕೃತ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ",
    clinicalChikitsaBadge: "ಶಾಸ್ತ್ರೋಕ್ತ ಚಿಕಿತ್ಸಾ ಪದ್ಧತಿ",
    firebaseSyncBadge: "🔥 ಕ್ಲೌಡ್ ಸಿಂಕ್ ಆಗಿದೆ",
    templeSealBadge: "ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    analyzingNatalSubtitle: "ಜಾತಕದ ಗ್ರಹಸ್ಥಿತಿ ಮತ್ತು ದಶಾ ಕಾಲಾವಧಿಗೆ ಅನುಗುಣವಾಗಿ ನಿಖರ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ."
  },
  hi: {
    headerTitle: "जन्म कुंडली आधारित दैविक ज्योतिषीय उपाय एवं मनःशांति रिपोर्ट",
    headerSubtitle: "ग्रहदोष शांति, क्रोध-तनाव उपशमन, नित्य स्तोत्र, ४५ दिवसीय मंडल व्रत, गोचर एवं श्री गोकर्ण महाबलेश्वर सन्निधि की सेवाएँ।",
    pdfLangLabel: "🌐 PDF भाषा:",
    generatingPdfBtn: "⌛ ४-पृष्ठों की PDF तैयार हो रही है...",
    downloadPdfBtn: "दैविक उपाय रिपोर्ट PDF डाउनलोड (4-पृष्ठ A4)",
    gotraLabel: "गोत्र",
    lagnaLabel: "लग्न:",
    rashiLabel: "राशि:",
    nakshatraLabel: "नक्षत्र:",
    dashaLabel: "दशा",
    bhuktiLabel: "भुक्ति",
    calmingTimeLabel: "शांति समय:",
    startCalmTimerBtn: "३-मिनट शांति टाइमर प्रारंभ करें",
    emergencyMantraTitle: "आपत्कालीन शांति बीज मंत्र (क्रोध आने पर ११ बार मौन जप करें)",
    rootCauseTitle: "कुंडली दोष एवं मानसिक संघर्षों का मूल कारण",
    lifeTurnaroundTitle: "भाग्योदय एवं परिहार समयावधि (Life Turnaround Window)",
    catalystGrahaTitle: "भाग्योदय प्रेरक ग्रह (Catalyst Graha):",
    targetedSevaTitle: "अनुशंसित गोकर्ण सेवा (Targeted Seva):",
    mechanismTitle: "परिवर्तन की ज्योतिषीय प्रक्रिया: ",
    astrologicalReasonTitle: "ज्योतिषीय कारण एवं ग्रह प्रभाव: ",
    day10Title: "१० दिनों की निरंतर साधना का अनुभव",
    day15Title: "१५ दिनों के बाद संभावित जीवन परिवर्तन",
    beforeAfterTitle: "उपाय पूर्व बनाम उपायोत्तर फल",
    currentFrictionTitle: "वर्तमान कर्म स्थिति: ",
    transformedStateTitle: "उपायोत्तर रूपांतरण: ",
    afflictedGrahasTitle: "शांति योग्य प्रमुख ग्रह दोष:",
    metersTitle: "मानसिक तत्त्व मापन",
    meterKrodha: "क्रोध / पित्त ऊर्जा",
    meterManas: "मनोशांति एवं संतुलन",
    meterVitality: "आत्म तेज / प्राणबल",
    meterPatience: "धैर्य एवं सहनशीलता",
    meterTip: "सुझाव: प्रतिदिन १० मिनट शांत भाव से चंद्र ध्यान करने से पित्त शांत होता है और धैर्य बढ़ता है।",
    panchangaTitle: "पंचांग ५-अंग दैविक उपाय एवं नक्षत्र वृक्ष साधना",
    panchangaSubtitle: "जन्म नक्षत्र वृक्ष, तिथि व्रत, वार आराधना, योग एवं करण के शास्त्रीय उपाय।",
    sacredTreeTitle: "जन्म नक्षत्र वृक्ष (Sacred Tree):",
    deityWorshipTitle: "देवता आराधना:",
    tithiVrataTitle: "जन्म तिथि व्रत एवं अनुग्रह:",
    weekdaySadhanaTitle: "वार साधना एवं शुभ रंग:",
    colorTitle: "रंग:",
    yogaKaranaTitle: "सौर-चांद्र योग एवं करण कर्म फल:",
    yogaRemedyTitle: "योग शांति:",
    karanaRemedyTitle: "करण उपाय:",
    dailyStotrasTitle: "कुंडली आधारित नित्य शास्त्रीय स्तोत्र (Daily Stotra Guide)",
    dailyStotrasSubtitle: "ग्रह पीड़ा निवारण हेतु प्रतिदिन श्रद्धापूर्वक पाठ करने योग्य प्रभावशाली स्तोत्र।",
    deityLabel: "देवता:",
    meaningLabel: "भावार्थ:",
    benefitsLabel: "फलश्रुति:",
    timeLabel: "समय:",
    directionLabel: "दिशा:",
    mandalaSectionTitle: "४५ दिवसीय मंडल व्रत साधना मार्ग एवं संकल्प सिद्धि",
    mandalaSubtitle: "शास्त्रीय ४५ दिवसीय अखंड मंडल साधना - जन्म ताराबल मुहूर्त, लघु पुरश्चरण मंत्र, सात्त्विक पथ्य एवं दैनिक ट्रैकर।",
    mandalaPhase1Title: "चरण १: शुद्धिकरण एवं दोष शमन",
    mandalaPhase1Desc: "संचित कर्म प्रक्षालन, क्रोध-उद्वेग शांति तथा प्राणशक्ति स्थिरता।",
    mandalaPhase2Title: "चरण २: शक्ति संचयन एवं भाग्योदय",
    mandalaPhase2Desc: "मानसिक संतुलन, सात्त्विक तेज एवं कार्यों में आने वाले विघ्नों का निवारण।",
    mandalaPhase3Title: "चरण ३: संकल्प सिद्धि एवं स्थिर शांति",
    mandalaPhase3Desc: "अभीष्ट फल सिद्धि, दैवानुग्रह स्थिरता तथा जीवन में चिर शांति व समृद्धि।",
    muhurthaCardTitle: "शुभ मुहूर्त एवं ताराबल नियम",
    auspiciousWeekdaysTitle: "साधना हेतु प्रशस्त वार:",
    taraBalaRuleTitle: "जन्म ताराबल शास्त्र:",
    japaFormulaCardTitle: "लघु पुरश्चरण १०८ जप सूत्र",
    japaFormulaCount: "४,८६० जप संख्या",
    malaRuleTitle: "माला नियम एवं दिशा:",
    pathyaCardTitle: "सात्त्विक पथ्य एवं नित्य नियमावली",
    aharaTitle: "आहार पथ्य:",
    acharaTitle: "आचार नियम:",
    weeklyDanaTitle: "साप्ताहिक दान एवं गोसेवा:",
    trackerCardTitle: "४५ दिवसीय दैनिक साधना ट्रैकर (प्रतिदिन साधना पूर्ण होने पर क्लिक करें)",
    trackerProgressLabel: "साधना प्रगति:",
    daysCompletedSuffix: "दिन पूर्ण हुए",
    clickToToggleHelp: "दैनिक साधना संपन्न होने पर संबंधित दिन संख्या पर क्लिक करके अंकित करें।",
    dailyChecklistTitle: "दैनिक ५-चरणीय साधना सूची:",
    dailyCheckItem1: "ब्राह्म मुहूर्त में उठकर शुचिर्भूत होकर स्नान करें और स्वच्छ वस्त्र धारण करें।",
    dailyCheckItem2: "पूर्व या उत्तर मुख होकर गोघृत का दीपक जलाएं और संकल्प का ध्यान करें।",
    dailyCheckItem3: "तुलसी या रुद्राक्ष माला से निर्धारित बीज मंत्र का १०८ बार एकाग्रचित्त जप करें।",
    dailyCheckItem4: "कुंडली हेतु निर्धारित देवता स्तोत्र का भक्तिभाव से सस्वर पाठ करें।",
    dailyCheckItem5: "दिनभर सात्त्विक आहार, सत्य व मधुर वाणी तथा क्रोधरहित आचरण बनाए रखें।",
    sankalpaBoxTitle: "दैविक संकल्प विधि (व्रतारंभ के दिन पठनीय)",
    copySankalpaBtn: "📋 संकल्प कॉपी करें",
    copiedMsg: "✓ कॉपी हो गया!",
    dashaGocharaTitle: "वर्तमान दशा-भुक्ति एवं लाइव गोचर ग्रहशांति",
    dashaSuffix: "दशा",
    mahaDashaLabel: "महादशा",
    bhuktiSuffix: "भुक्ति",
    activeSandhiBadge: "सक्रिय संधि काल",
    upcomingSandhiBadge: "आगामी संधि काल",
    stableSandhiBadge: "स्थिर काल",
    sandhiRemedyPrefix: "संधि काल शांति उपाय: ",
    remedyPrefix: "उपाय: ",
    planetaryTitle: "ग्रहों का उच्च / नीच बल, नीचभंग राजयोग एवं रत्न सावधानी",
    planetarySubtitle: "ग्रह स्थिति अनुसार शास्त्रीय रत्न धारण, नीचभंग राजयोग परीक्षण तथा आधुनिक तुलना।",
    debilitatedTitle: "कुंडली में नीच स्थित ग्रह एवं शांति उपाय:",
    nbryBadge: "नीचभंग राजयोग (NBRY)",
    debilitatedBadge: "नीच स्थिति",
    shantiRemedyPrefix: "शांति उपाय: ",
    gemstoneCautionPrefix: "रत्न सावधानी: ",
    exaltedTitle: "कुंडली में उच्च स्थित ग्रह एवं सद्बल सक्रियता:",
    exaltedBadge: "उच्च स्थान",
    blessingPrefix: "आशीर्वाद: ",
    sadhanaPrefix: "साधना: ",
    influencerBenchmarkTitle: "आधुनिक ज्योतिष प्रभावकों की तुलना एवं शास्त्रीय सत्यता",
    influencerAuthenticPrefix: "शास्त्रीय दृष्टिकोण: ",
    gokarnaSevasTitle: "श्री गोकर्ण महाबलेश्वर सन्निधि की सेवाएँ एवं धर्मोपाय",
    prescribedSevaTitle: "अनुशंसित सेवा:",
    idealDayTitle: "शुभ दिन:",
    rudrakshaGemstoneTitle: "रुद्राक्ष एवं रत्न धारण:",
    rudrakshaPrefix: "• रुद्राक्ष: ",
    gemstonePrefix: "• रत्न: ",
    sacredDanaTitle: "शुभ दान एवं गोसेवा:",
    itemPrefix: "• सामग्री: ",
    dayPrefix: "• दिन: ",
    beneficiaryPrefix: "• पात्र व्यक्ति: ",
    priestSelectionTitle: "दैविक उपाय मार्गदर्शक पुरोहित चयन (Priest Selection)",
    priestSelectionDesc: "उपाय मार्गदर्शन हेतु पुरोहित का चयन करें अथवा नवीन पुरोहित जोड़ें। यह विवरण Firebase में सुरक्षित होगा:",
    selectPriestLabel: "पुरोहित चयन (Select Priest)",
    addNewPriestOption: "➕ नए पुरोहित जोड़ें (+ Add New Priest)",
    priestNameLabel: "पुरोहित का नाम (Priest Name)",
    priestPhoneLabel: "मोबाइल / WhatsApp नंबर",
    priestNamePlaceholder: "उदा: श्रीराम पंडित",
    savePriestBtn: "💾 सहेजें",
    saveSuccessMsg: "✓ पुरोहित विवरण Firebase डेटाबेस में सफलतापूर्वक सहेजा गया!",
    badhakaBadge: "बाधक ग्रह एवं विघ्न",
    adhidevataBadge: "अधिदेवता",
    pratyadhidevataBadge: "प्रत्यधिदेवता",
    prescriptionCardTitle: "वैदिक ज्योतिष चिकित्सा पत्र (Medical-Grade Astrological Prescription)",
    prescriptionCardSubtitle: "जैसे चिकित्सक रोगी को सटीक औषधि एवं अनुपान देते हैं, वैसे ही ग्रहदोष निवारण हेतु शास्त्रीय निदान, औषधि, अनुपान एवं १५-२० दिवसीय राहत प्रक्रिया।",
    prescriptionNidanaTitle: "कर्म एवं दोष निदान (Karmic Diagnosis):",
    prescriptionAushadhaTitle: "दैविक मंत्रौषध (Prescribed Shastric Aushadha):",
    prescriptionAnupanaTitle: "पवित्र अनुपान एवं सेवन विधि (Sacred Vehicle & Ingestion):",
    prescriptionPathyaTitle: "पालनीय पथ्य (Prescribed Pathya - 15 to 20 Days):",
    prescriptionApathyaTitle: "त्याज्य अपथ्य (Strictly Prohibited Apathya):",
    prescriptionTimingTitle: "चिकित्सा काल, आसन एवं दिशा (Clinical Timing & Setup):",
    prescriptionProgressionTitle: "१५ से २० दिनों में अनुभव होने वाले राहत के चरण (15-20 Day Relief Progression):",
    padaLabel: "चरण",
    yogaLabel: "योग",
    karanaLabel: "करण",
    elementalBalanceLabel: "पंचमहाभूत संतुलन कारण: ",
    houseSuffix: (h) => `${h}वां भाव`,
    transitEffectAuspicious: "शुभ फल",
    transitEffectChallenging: "चुनौतीपूर्ण",
    shastricAnalysisBadge: "प्रामाणिक शास्त्रीय विश्लेषण",
    clinicalChikitsaBadge: "शास्त्रोक्त चिकित्सा पद्धति",
    firebaseSyncBadge: "🔥 क्लाउड सिंक",
    templeSealBadge: "गोकर्ण सन्निधि मुद्रा",
    analyzingNatalSubtitle: "जन्मकुंडली की ग्रह स्थिति एवं दशा काल के अनुसार गहन शास्त्रीय विश्लेषण चल रहा है।"
  },
  te: {
    headerTitle: "జన్మ కుండలి ఆధారిత దైవిక జ్యోతిష్య పరిహార & మనశ్శాంతి నివేదిక",
    headerSubtitle: "గ్రహదోష నివారణ, కోప-ఉద్వేగ శమనం, నిత్య స్తోత్రాలు, 45 రోజుల మండల వ్రతం, గోచార & శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి సేవలు.",
    pdfLangLabel: "🌐 PDF భాష:",
    generatingPdfBtn: "⌛ 4-పేజీల PDF రూపొందుతోంది...",
    downloadPdfBtn: "దైవిక పరిహార నివేదిక PDF డౌన్‌లోడ్ (4-పేజీల A4)",
    gotraLabel: "గోత్రం",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "దశ",
    bhuktiLabel: "భుక్తి",
    calmingTimeLabel: "శాంతి సమయం:",
    startCalmTimerBtn: "3-నిమిషాల శాంతి టైమర్ ప్రారంభించండి",
    emergencyMantraTitle: "ఆపత్కాలీన శాంతి బీజ మంత్రం (కోపం వచ్చినప్పుడు 11 సార్లు మనస్సులో జపించండి)",
    rootCauseTitle: "కుండలి దోషం & మానసిక సంఘర్షణల మూల కారణం",
    lifeTurnaroundTitle: "భాగ్యోదయ & పరిహార కాలపరిమితి (Life Turnaround Window)",
    catalystGrahaTitle: "భాగ్యోదయ ప్రేరక గ్రహం (Catalyst Graha):",
    targetedSevaTitle: "నిర్దిష్ట గోకర్ణ సేవ (Targeted Seva):",
    mechanismTitle: "మార్పు యొక్క జ్యోతిష్య ప్రక్రియ: ",
    astrologicalReasonTitle: "జ్యోతిష్య కారణం & గ్రహ ప్రభావం: ",
    day10Title: "10 రోజుల నిరంతర సాధన అనుభవం",
    day15Title: "15 రోజుల తర్వాత ఊహించదగిన జీవిత మలుపు",
    beforeAfterTitle: "పరిహార పూర్వ vs పరిహారోత్తర ఫలితం",
    currentFrictionTitle: "ప్రస్తుత కర్మ స్థితి: ",
    transformedStateTitle: "పరిహారోత్తర మార్పు: ",
    afflictedGrahasTitle: "పరిహారం అవసరమైన ముఖ్య గ్రహ దోషాలు:",
    metersTitle: "మానసిక తత్త్వ మాపనం",
    meterKrodha: "క్రోధం / పిత్త శక్తి",
    meterManas: "మనో శాంతి & సమతుల్యత",
    meterVitality: "ఆత్మ తేజస్సు / ప్రాణబలం",
    meterPatience: "ఓర్పు & సహనం",
    meterTip: "సూచన: రోజుకు 10 నిమిషాలు ప్రశాంతంగా కూర్చుని చంద్ర ధ్యానం చేయడం వల్ల పిత్తం తగ్గి ఓర్పు పెరుగుతుంది.",
    panchangaTitle: "పంచాంగ 5-అంగ దైవిక పరిహారాలు & నక్షత్ర వృక్ష సాధన",
    panchangaSubtitle: "జన్మ నక్షత్ర వృక్షం, తిథి వ్రతం, వార ఆరాధన, యోగ & కరణ శాస్త్రోక్త పరిహారాలు.",
    sacredTreeTitle: "జన్మ నక్షత్ర వృక్షం (Sacred Tree):",
    deityWorshipTitle: "దేవతా ఆరాధన:",
    tithiVrataTitle: "జన్మ తిథి వ్రతం & అనుగ్రహం:",
    weekdaySadhanaTitle: "వార సాధన & శుభ వర్ణం:",
    colorTitle: "రంగు:",
    yogaKaranaTitle: "సౌర-చాంద్ర యోగ & కరణ కర్మ ఫలం:",
    yogaRemedyTitle: "యోగ పరిహారం:",
    karanaRemedyTitle: "కరణ పరిహారం:",
    dailyStotrasTitle: "కుండలికి నిర్దేశించిన నిత్య స్తోత్రాలు (Daily Stotra Guide)",
    dailyStotrasSubtitle: "గ్రహ పీడల నివారణకు ప్రతిరోజూ పఠించవలసిన పవిత్ర స్తోత్రాలు.",
    deityLabel: "దేవత:",
    meaningLabel: "భావార్థం:",
    benefitsLabel: "ఫలశ్రుతి:",
    timeLabel: "సమయం:",
    directionLabel: "దిశ:",
    mandalaSectionTitle: "45 రోజుల మండల వ్రత సాధనా మార్గం & సంకల్ప సిద్ధి",
    mandalaSubtitle: "శాస్త్రోక్త 45 రోజుల నిరంతర మండల సాధన - జన్మ తారాబల ముహూర్తం, లఘు పురశ్చరణ మంత్రం, సాత్త్విక పథ్యం & డైలీ ట్రాకర్.",
    mandalaPhase1Title: "దశ 1: శుద్ధీకరణ & దోష శమనం",
    mandalaPhase1Desc: "సంచిత కర్మ ప్రక్షాళన, కోప-ఉద్వేగ శాంతి మరియు ప్రాణశక్తి స్థిరత్వం.",
    mandalaPhase2Title: "దశ 2: శక్తి సంచయనం & భాగ్యోదయం",
    mandalaPhase2Desc: "మానసిక ధైర్యం, సాత్త్విక తేజస్సు మరియు కార్య విఘ్నాల తొలగింపు.",
    mandalaPhase3Title: "దశ 3: సంకల్ప సిద్ధి & స్థిర శాంతి",
    mandalaPhase3Desc: "అభీష్ట సిద్ధి, దైవానుగ్రహ స్థిరత్వం మరియు జీవితంలో సంపూర్ణ శాంతి-సమృద్ధి.",
    muhurthaCardTitle: "శుభ ముహూర్తం & తారాబల నియమం",
    auspiciousWeekdaysTitle: "సాధనకు అనుకూలమైన వారాలు:",
    taraBalaRuleTitle: "జన్మ తారాబల శాస్త్రం:",
    japaFormulaCardTitle: "లఘు పురశ్చరణ 108 జప సూత్రం",
    japaFormulaCount: "4,860 జప సంఖ్య",
    malaRuleTitle: "మాలా నియమం & దిశ:",
    pathyaCardTitle: "సాత్త్విక పథ్యం & నిత్య నియమావళి",
    aharaTitle: "ఆహార పథ్యం:",
    acharaTitle: "ఆచార నియమం:",
    weeklyDanaTitle: "వారపు దానం & గోసేవ:",
    trackerCardTitle: "45 రోజుల సాధనా ట్రాకర్ (రోజూ సాధన పూర్తయ్యాక క్లిక్ చేయండి)",
    trackerProgressLabel: "సాధనా పురోగతి:",
    daysCompletedSuffix: "రోజులు పూర్తయ్యాయి",
    clickToToggleHelp: "ఆ రోజు సాధన పూర్తయినప్పుడు ఆ రోజు సంఖ్యపై క్లిక్ చేసి గుర్తించండి.",
    dailyChecklistTitle: "దైనందిన 5-దశల సాధనా జాబితా:",
    dailyCheckItem1: "బ్రాహ్మీ ముహూర్తంలో నిద్రలేచి శుచిగా స్నానం చేసి శుభ్రమైన వస్త్రాలు ధరించాలి.",
    dailyCheckItem2: "తూర్పు లేదా ఉత్తరం ముఖంగా ఆవు నెయ్యి దీపం వెలిగించి సంకల్ప ధ్యానం చేయాలి.",
    dailyCheckItem3: "తులసి లేదా రుద్రాక్ష మాలతో నిర్దేశిత బీజ మంత్రాన్ని 108 సార్లు ఏకాగ్రతతో జపించాలి.",
    dailyCheckItem4: "కుండలికి నిర్దేశించిన దేవతా స్తోత్రాన్ని భక్తితో పఠించాలి.",
    dailyCheckItem5: "రోజంతా సాత్త్విక ఆహారం, సత్యవాక్కు మరియు శాంత స్వభావం కొనసాగించాలి.",
    sankalpaBoxTitle: "దైవిక సంకల్ప విధి (వ్రతారంభ దినం పఠించవలసినది)",
    copySankalpaBtn: "📋 సంకల్పం కాపీ చేయండి",
    copiedMsg: "✓ కాపీ అయింది!",
    dashaGocharaTitle: "ప్రస్తుత దశా-భుక్తి & ప్రత్యక్ష గోచార గ్రహశాంతి",
    dashaSuffix: "దశ",
    mahaDashaLabel: "మహాదశ",
    bhuktiSuffix: "భుక్తి",
    activeSandhiBadge: "క్రియాశీల సంధి కాలం",
    upcomingSandhiBadge: "రాబోవు సంధి కాలం",
    stableSandhiBadge: "స్థిర కాలం",
    sandhiRemedyPrefix: "సంధి కాల శాంతి పరిహారం: ",
    remedyPrefix: "పరిహారం: ",
    planetaryTitle: "గ్రహాల ఉచ్ఛ / నీచ బలం, నీచభంగ రాజయోగం & రత్న హెచ్చరిక",
    planetarySubtitle: "గ్రహ ప్రభావాలకు అనుగుణంగా శాస్త్రోక్త రత్న ధారణ, నీచభంగ రాజయోగ విశ్లేషణ.",
    debilitatedTitle: "కుండలిలో నీచ స్థితిలో ఉన్న గ్రహాలు & శాంతి పరిహారం:",
    nbryBadge: "నీచభంగ రాజయోగం (NBRY)",
    debilitatedBadge: "నీచ స్థితి",
    shantiRemedyPrefix: "శాంతి పరిహారం: ",
    gemstoneCautionPrefix: "రత్న హెచ్చరిక: ",
    exaltedTitle: "కుండలిలో ఉచ్ఛ స్థితిలో ఉన్న గ్రహాలు & సద్బల చైతన్యం:",
    exaltedBadge: "ఉచ్ఛ స్థానం",
    blessingPrefix: "ఆశీర్వాదం: ",
    sadhanaPrefix: "సాధన: ",
    influencerBenchmarkTitle: "ఆధునిక జ్యోతిష్య ప్రభావకుల పోలిక & శాస్త్రీయ వాస్తవాలు",
    influencerAuthenticPrefix: "శాస్త్రోక్త మార్గం: ",
    gokarnaSevasTitle: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి సేవలు & ధర్మోపాయాలు",
    prescribedSevaTitle: "సిఫార్సు చేసిన సేవ:",
    idealDayTitle: "శుభ దినం:",
    rudrakshaGemstoneTitle: "రుద్రాక్ష & రత్న ధారణ:",
    rudrakshaPrefix: "• రుద్రాక్ష: ",
    gemstonePrefix: "• రత్నం: ",
    sacredDanaTitle: "శుభ దానం & గోసేవ:",
    itemPrefix: "• ద్రవ్యం: ",
    dayPrefix: "• రోజు: ",
    beneficiaryPrefix: "• స్వీకర్తలు: ",
    priestSelectionTitle: "దైవిక పరిహార పురోహితుల ఎంపిక (Priest Selection)",
    priestSelectionDesc: "పరిహార సేవల కోసం పురోహితులను ఎంచుకోండి లేదా కొత్తవారిని చేర్చండి. వివరాలు Firebase లో భద్రపరచబడతాయి:",
    selectPriestLabel: "పురోహితుల ఎంపిక (Select Priest)",
    addNewPriestOption: "➕ కొత్త పురోహితులను జోడించండి (+ Add New Priest)",
    priestNameLabel: "పురోహితుని పేరు (Priest Name)",
    priestPhoneLabel: "మొబైల్ / WhatsApp సంఖ్య",
    priestNamePlaceholder: "ఉదా: శ్రీరామ్ పండిట్",
    savePriestBtn: "💾 భద్రపరచు",
    saveSuccessMsg: "✓ పురోహితుని వివరాలు Firebase డేటాబేస్ లో విజయవంతంగా నమోదయ్యాయి!",
    badhakaBadge: "బాధక గ్రహం & అడ్డంకులు",
    adhidevataBadge: "అధిదేవత",
    pratyadhidevataBadge: "ప్రత్యధిదేవత",
    prescriptionCardTitle: "వైదిక జ్యోతిష్య చికిత్సా పత్రం (Medical-Grade Astrological Prescription)",
    prescriptionCardSubtitle: "వైద్యులు రోగికి ఖచ్చితమైన ఔషధం మరియు పథ్యం ఇచ్చే విధంగా, కుండలి గ్రహదోష నివారణకు శాస్త్రోక్త నిదానం, ఔషధం, అనుపానం మరియు 15-20 రోజుల ఉపశమన ప్రక్రియ.",
    prescriptionNidanaTitle: "కర్మ & దోష నిదానం (Karmic Diagnosis):",
    prescriptionAushadhaTitle: "దైవిక మంత్రౌషధం (Prescribed Shastric Aushadha):",
    prescriptionAnupanaTitle: "పవిత్ర అనుపానం & సేవన విధానం (Sacred Vehicle & Ingestion):",
    prescriptionPathyaTitle: "పాటించవలసిన పథ్యం (Prescribed Pathya - 15 to 20 Days):",
    prescriptionApathyaTitle: "వర్జించవలసిన అపథ్యం (Strictly Prohibited Apathya):",
    prescriptionTimingTitle: "చికిత్సా సమయం, ఆసనం & దిశ (Clinical Timing & Setup):",
    prescriptionProgressionTitle: "15 నుండి 20 రోజుల్లో అనుభవంలోకి వచ్చే ఉపశమన దశలు (15-20 Day Relief Progression):",
    padaLabel: "పాదం",
    yogaLabel: "యోగం",
    karanaLabel: "కరణం",
    elementalBalanceLabel: "పంచమహాభూత సమతుల్య కారణం: ",
    houseSuffix: (h) => `${h}వ స్థానం`,
    transitEffectAuspicious: "శుభ ఫలితం",
    transitEffectChallenging: "సవాలు",
    shastricAnalysisBadge: "ప్రామాణిక శాస్త్రీయ విశ్లేషణ",
    clinicalChikitsaBadge: "శాస్త్రోక్త చికిత్సా విధానం",
    firebaseSyncBadge: "🔥 క్లౌడ్ సింక్ అయింది",
    templeSealBadge: "గోకర్ణ సన్నిధి ముద్ర",
    analyzingNatalSubtitle: "జాతక గ్రహస్థితి మరియు దశా కాలానికి అనుగుణంగా లోతైన శాస్త్రోక్త విశ్లేషణ జరుగుతోంది."
  },
  ta: {
    headerTitle: "ஜாதக அடிப்படையிலான தெய்வீக பரிகாரம் & மனஅமைதி அறிக்கை",
    headerSubtitle: "கிரகதோஷ நிவாரணம், கோப-உணர்ச்சி சாந்தி, நித்ய ஸ்தோத்திரங்கள், 45 நாள் மண்டல விரதம், கோசாரம் & ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி சேவைகள்.",
    pdfLangLabel: "🌐 PDF மொழி:",
    generatingPdfBtn: "⌛ 4-பக்க PDF உருவாக்கப்படுகிறது...",
    downloadPdfBtn: "தெய்வீக பரிகார அறிக்கை PDF பதிவிறக்கம் (4-பக்க A4)",
    gotraLabel: "கோத்திரம்",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "திசை",
    bhuktiLabel: "புக்தி",
    calmingTimeLabel: "சாந்தி நேரம்:",
    startCalmTimerBtn: "3-நிமிட அமைதி டைமரைத் தொடங்குங்கள்",
    emergencyMantraTitle: "அவசரகால அமைதி பீஜ மந்திரம் (கோபம் வரும்போது 11 முறை மனதில் ஜபிக்கவும்)",
    rootCauseTitle: "ஜாதக தோஷம் & மன உளைச்சல்களின் மூல காரணம்",
    lifeTurnaroundTitle: "பாக்யோதய & பரிகார காலஅளவு (Life Turnaround Window)",
    catalystGrahaTitle: "பாக்யோதய தூண்டுதல் கிரகம் (Catalyst Graha):",
    targetedSevaTitle: "குறிப்பிட்ட கோகர்ண சேவை (Targeted Seva):",
    mechanismTitle: "மாற்றத்தின் ஜோதிட முறை: ",
    astrologicalReasonTitle: "ஜோதிட காரணம் & கிரக தாக்கம்: ",
    day10Title: "10 நாள் தொடர் சாதனை உணர்வு",
    day15Title: "15 நாட்களுக்குப் பிறகு எதிர்பார்க்கப்படும் வாழ்க்கை திருப்புமுனை",
    beforeAfterTitle: "பரிகாரத்திற்கு முன் vs பின் பலன்",
    currentFrictionTitle: "தற்போதைய கர்ம நிலை: ",
    transformedStateTitle: "பரிகாரத்திற்குப் பின் நிலை: ",
    afflictedGrahasTitle: "பரிகாரம் தேவைப்படும் முக்கிய கிரக தோஷங்கள்:",
    metersTitle: "மனோ தத்துவ அளவீடு",
    meterKrodha: "கோபம் / பித்த ஆற்றல்",
    meterManas: "மன அமைதி & சமநிலை",
    meterVitality: "ஆன்ம தேஜஸ் / பிராணபலம்",
    meterPatience: "பொறுமை & சகிப்புத்தன்மை",
    meterTip: "குறிப்பு: தினமும் 10 நிமிடங்கள் அமைதியாக அமர்ந்து சந்திர தியானம் செய்வது பித்தத்தை தணித்து பொறுமையை அதிகரிக்கும்.",
    panchangaTitle: "பஞ்சாங்க 5-அங்க தெய்வீக பரிகாரங்கள் & நட்சத்திர விருட்ச சாதனை",
    panchangaSubtitle: "ஜென்ம நட்சத்திர மரம், திதி விரதம், வார வழிபாடு, யோகம் & கரண சாஸ்திர பரிகாரங்கள்.",
    sacredTreeTitle: "ஜென்ம நட்சத்திர மரம் (Sacred Tree):",
    deityWorshipTitle: "தெய்வ வழிபாடு:",
    tithiVrataTitle: "ஜென்ம திதி விரதம் & அருள்:",
    weekdaySadhanaTitle: "வார வழிபாடு & சுப நிறம்:",
    colorTitle: "நிறம்:",
    yogaKaranaTitle: "சூரிய-சந்திர யோகம் & கரண கர்ம பலன்:",
    yogaRemedyTitle: "யோக பரிகாரம்:",
    karanaRemedyTitle: "கரண பரிகாரம்:",
    dailyStotrasTitle: "ஜாதகத்திற்கு பரிந்துரைக்கப்பட்ட நித்ய ஸ்தோத்திரங்கள் (Daily Stotra Guide)",
    dailyStotrasSubtitle: "கிரக பீடைகளை நீக்க தினமும் பக்தியுடன் பாராயணம் செய்ய வேண்டிய சக்திவாய்ந்த ஸ்தோத்திரங்கள்.",
    deityLabel: "தெய்வம்:",
    meaningLabel: "பொருளுரை:",
    benefitsLabel: "பலன்கள்:",
    timeLabel: "நேரம்:",
    directionLabel: "திசை:",
    mandalaSectionTitle: "45 நாள் மண்டல விரத சாதனை வழி & சங்கல்ப சித்தி",
    mandalaSubtitle: "சாஸ்திரோக்தமான 45 நாள் தொடர் மண்டல சாதனை - ஜென்ம தாராபல முகூர்த்தம், லகு புரச்சரண மந்திரம், சாத்வீக பத்தியம் & தினசரி டிராக்கர்.",
    mandalaPhase1Title: "நிலை 1: சுத்திகரிப்பு & தோஷ சாந்தி",
    mandalaPhase1Desc: "சஞ்சித கர்ம சுத்தி, கோப-படபடப்பு தணிப்பு மற்றும் பிராணசக்தி நிலைத்தன்மை.",
    mandalaPhase2Title: "நிலை 2: சக்தி சேமிப்பு & பாக்யோதயம்",
    mandalaPhase2Desc: "மன உறுதி, சாத்வீக தேஜஸ் மற்றும் காரியத் தடைகள் நீங்குதல்.",
    mandalaPhase3Title: "நிலை 3: சங்கல்ப சித்தி & நிலைத்த அமைதி",
    mandalaPhase3Desc: "நினைத்த காரிய சித்தி, தெய்வ அருள் நிலைபெறுதல் மற்றும் வாழ்வில் நிரந்தர அமைதி-செழிப்பு.",
    muhurthaCardTitle: "சுப முகூர்த்தம் & தாராபல விதி",
    auspiciousWeekdaysTitle: "சாதனைக்கு உகந்த வார நாட்கள்:",
    taraBalaRuleTitle: "ஜென்ம தாராபல சாஸ்திரம்:",
    japaFormulaCardTitle: "லகு புரச்சரண 108 ஜப சூத்திரம்",
    japaFormulaCount: "4,860 ஜப எண்ணிக்கை",
    malaRuleTitle: "மாலை விதி & திசை:",
    pathyaCardTitle: "சாத்வீக பத்தியம் & நித்ய ஒழுக்க நெறிகள்",
    aharaTitle: "உணவு பத்தியம்:",
    acharaTitle: "ஆசார நெறி:",
    weeklyDanaTitle: "வாராந்திர தானம் & கோபூஜை:",
    trackerCardTitle: "45 நாள் தினசரி சாதனை டிராக்கர் (தினமும் சாதனை முடிந்ததும் கிளிக் செய்யவும்)",
    trackerProgressLabel: "சாதனை முன்னேற்றம்:",
    daysCompletedSuffix: "நாட்கள் நிறைவடைந்தன",
    clickToToggleHelp: "அன்றைய சாதனை முடிந்தவுடன் அந்த நாளின் எண்ணை கிளிக் செய்து குறிக்கவும்.",
    dailyChecklistTitle: "தினசரி 5-படி சாதனை பட்டியல்:",
    dailyCheckItem1: "பிரம்ம முகூர்த்தத்தில் எழுந்து நீராடி சுத்தமான ஆடைகளை அணியவும்.",
    dailyCheckItem2: "கிழக்கு அல்லது வடக்கு நோக்கி பசு நெய் விளக்கேற்றி சங்கல்ப தியானம் செய்யவும்.",
    dailyCheckItem3: "துளசி அல்லது ருத்ராட்ச மாலையால் நிர்ணயிக்கப்பட்ட மந்திரத்தை 108 முறை ஜபிக்கவும்.",
    dailyCheckItem4: "ஜாதகத்திற்கு பரிந்துரைக்கப்பட்ட தெய்வ ஸ்தோத்திரத்தை பக்தியுடன் பாராயணம் செய்யவும்.",
    dailyCheckItem5: "நாள் முழுவதும் சாத்வீக உணவு, வாய்மை மற்றும் அமைதியான பண்பைக் கடைப்பிடிக்கவும்.",
    sankalpaBoxTitle: "தெய்வீக சங்கல்ப விதி (விரத தொடக்க நாளில் படிக்க வேண்டியது)",
    copySankalpaBtn: "📋 சங்கல்பத்தை நகலெடு",
    copiedMsg: "✓ நகலெடுக்கப்பட்டது!",
    dashaGocharaTitle: "தற்போதைய திசை-புக்தி & கோசார கிரக சாந்தி",
    dashaSuffix: "திசை",
    mahaDashaLabel: "மகாதிசை",
    bhuktiSuffix: "புக்தி",
    activeSandhiBadge: "செயலில் உள்ள சந்தி காலம்",
    upcomingSandhiBadge: "வரவிருக்கும் சந்தி காலம்",
    stableSandhiBadge: "நிலையான காலம்",
    sandhiRemedyPrefix: "சந்தி கால சாந்தி பரிகாரம்: ",
    remedyPrefix: "பரிகாரம்: ",
    planetaryTitle: "கிரகங்களின் உட்ச / நீச பலம், நீசபங்க ராஜயோகம் & ரத்தின எச்சரிக்கை",
    planetarySubtitle: "கிரகங்களின் நிலைக்கு ஏற்ப சாஸ்திரோக்த ரத்தினம் அணிதல், நீசபங்க ராஜயோகம் ஆய்வு.",
    debilitatedTitle: "ஜாதகத்தில் நீச நிலையில் உள்ள கிரகங்கள் & சாந்தி பரிகாரம்:",
    nbryBadge: "நீசபங்க ராஜயோகம் (NBRY)",
    debilitatedBadge: "நீச நிலை",
    shantiRemedyPrefix: "சாந்தி பரிகாரம்: ",
    gemstoneCautionPrefix: "ரத்தின எச்சரிக்கை: ",
    exaltedTitle: "ஜாதகத்தில் உட்ச நிலையில் உள்ள கிரகங்கள் & சுப பலம்:",
    exaltedBadge: "உட்ச ஸ்தானம்",
    blessingPrefix: "ஆசி: ",
    sadhanaPrefix: "சாதனை: ",
    influencerBenchmarkTitle: "நவீன ஜோதிட கருத்துகளின் ஒப்பீடு & சாஸ்திர உண்மை",
    influencerAuthenticPrefix: "சாஸ்திரோக்த நெறி: ",
    gokarnaSevasTitle: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி சேவைகள் & தர்ம பரிகாரங்கள்",
    prescribedSevaTitle: "பரிந்துரைக்கப்பட்ட சேவை:",
    idealDayTitle: "சுப நாள்:",
    rudrakshaGemstoneTitle: "ருத்ராட்சம் & ரத்தினம் அணிதல்:",
    rudrakshaPrefix: "• ருத்ராட்சம்: ",
    gemstonePrefix: "• ரத்தினம்: ",
    sacredDanaTitle: "சுப தானம் & கோசேவை:",
    itemPrefix: "• பொருள்: ",
    dayPrefix: "• நாள்: ",
    beneficiaryPrefix: "• பெறுபவர்: ",
    priestSelectionTitle: "தெய்வீக பரிகார வழிகாட்டி குருக்கள் தேர்வு (Priest Selection)",
    priestSelectionDesc: "பரிகார வழிகாட்டலுக்கு குருக்களை தேர்வு செய்யவும் அல்லது புதியவரை சேர்க்கவும். விவரங்கள் Firebase இல் சேமிக்கப்படும்:",
    selectPriestLabel: "குருக்கள் தேர்வு (Select Priest)",
    addNewPriestOption: "➕ புதிய குருக்களை சேர்க்க (+ Add New Priest)",
    priestNameLabel: "குருக்கள் பெயர் (Priest Name)",
    priestPhoneLabel: "மொபைல் / WhatsApp எண்",
    priestNamePlaceholder: "உதா: ஸ்ரீராம் பண்டிட்",
    savePriestBtn: "💾 சேமி",
    saveSuccessMsg: "✓ குருக்கள் விவரங்கள் Firebase தரவுத்தளத்தில் வெற்றிகரமாக சேமிக்கப்பட்டன!",
    badhakaBadge: "பாதக கிரகம் & தடைகள்",
    adhidevataBadge: "அதிதேவதை",
    pratyadhidevataBadge: "பிரத்யதிதேவதை",
    prescriptionCardTitle: "வைதிக ஜோதிட சிகிச்சை சீட்டு (Medical-Grade Astrological Prescription)",
    prescriptionCardSubtitle: "மருத்துவர் நோயாளிக்கு மருந்து மற்றும் பத்தியம் வழங்குவது போல, ஜாதக கிரக தோஷ நிவர்த்திக்கு சாஸ்திர நிதானம், ஔஷதம், அனுபானம் மற்றும் 15-20 நாள் நிவாரண முறை.",
    prescriptionNidanaTitle: "கர்ம & தோஷ நிதானம் (Karmic Diagnosis):",
    prescriptionAushadhaTitle: "தெய்வீக மந்திர ஔஷதம் (Prescribed Shastric Aushadha):",
    prescriptionAnupanaTitle: "புனித அனுபானம் & உட்கொள்ளும் முறை (Sacred Vehicle & Ingestion):",
    prescriptionPathyaTitle: "கடைப்பிடிக்க வேண்டிய பத்தியம் (Prescribed Pathya - 15 to 20 Days):",
    prescriptionApathyaTitle: "தவிர்க்க வேண்டிய அபத்தியம் (Strictly Prohibited Apathya):",
    prescriptionTimingTitle: "சிகிச்சை நேரம், ஆசனம் & திசை (Clinical Timing & Setup):",
    prescriptionProgressionTitle: "15 முதல் 20 நாட்களில் உணரக்கூடிய நிவாரண நிலைகள் (15-20 Day Relief Progression):",
    padaLabel: "பாதம்",
    yogaLabel: "யோகம்",
    karanaLabel: "கரணம்",
    elementalBalanceLabel: "பஞ்சமகாபூத சமநிலை காரணம்: ",
    houseSuffix: (h) => `${h}ஆம் இடம்`,
    transitEffectAuspicious: "சுப பலன்",
    transitEffectChallenging: "சவால்",
    shastricAnalysisBadge: "சாஸ்திர ரீதியான ஆய்வு",
    clinicalChikitsaBadge: "சாஸ்திரோக்த சிகிச்சை முறை",
    firebaseSyncBadge: "🔥 கிளவுட் ஒத்திசைவு",
    templeSealBadge: "கோகர்ண சன்னிதான முத்திரை",
    analyzingNatalSubtitle: "ஜாதக கிரக நிலை மற்றும் திசா காலத்திற்கு ஏற்ப ஆழமான சாஸ்திர பகுப்பாய்வு நடைபெறுகிறது."
  },
  en: {
    headerTitle: "Natal Kundali Astrological Remedy & Mind Pacification Report",
    headerSubtitle: "Chart affliction pacification, anger management, daily stotras, 45-day mandala vrata, transits & Sri Gokarna temple remedies.",
    pdfLangLabel: "🌐 PDF Language:",
    generatingPdfBtn: "⌛ Generating 4-Page PDF...",
    downloadPdfBtn: "Download 4-Page Remedy PDF (A4)",
    gotraLabel: "Gotra",
    lagnaLabel: "Lagna:",
    rashiLabel: "Rashi:",
    nakshatraLabel: "Nakshatra:",
    dashaLabel: "Dasha",
    bhuktiLabel: "Bhukti",
    calmingTimeLabel: "Calming Time:",
    startCalmTimerBtn: "Start 3-Min Calm Timer",
    emergencyMantraTitle: "Emergency Mind Pacification Mantra (Chant 11 times silently when agitated)",
    rootCauseTitle: "Kundali Affliction & Psychological Diagnosis",
    lifeTurnaroundTitle: "Life Turnaround Point & Timing Window",
    catalystGrahaTitle: "Catalyst Planet / Force:",
    targetedSevaTitle: "Recommended Gokarna Seva:",
    mechanismTitle: "Astrological Breakthrough Mechanism: ",
    astrologicalReasonTitle: "Astrological Reason & Karmic Alignment: ",
    day10Title: "10-Day Experiential Practice Relief",
    day15Title: "15-Day Transformation Breakthrough",
    beforeAfterTitle: "Before vs After Transformation Contrast",
    currentFrictionTitle: "Current Friction: ",
    transformedStateTitle: "Transformed State: ",
    afflictedGrahasTitle: "Key Afflicted Graha Placements:",
    metersTitle: "Temperament & Energy Meters",
    meterKrodha: "Pitta / Anger Surge",
    meterManas: "Mental Peace & Balance",
    meterVitality: "Vitality / Prana Force",
    meterPatience: "Patience & Resilience",
    meterTip: "Tip: 10 minutes of daily silent breathwork grounds adrenal surges and elevates patience by 40%.",
    panchangaTitle: "Panchanga 5-Anga Divine Remedies & Sacred Tree Alignment",
    panchangaSubtitle: "Authentic remedies derived strictly from your natal Nakshatra sacred tree, Tithi, Vara, Yoga, and Karana.",
    sacredTreeTitle: "Janma Nakshatra Sacred Tree:",
    deityWorshipTitle: "Deity Worship:",
    tithiVrataTitle: "Janma Tithi Vrata & Grace:",
    weekdaySadhanaTitle: "Weekday Sadhana & Daily Color:",
    colorTitle: "Color:",
    yogaKaranaTitle: "Solar-Lunar Yoga & Karana Shanti:",
    yogaRemedyTitle: "Yoga Shanti:",
    karanaRemedyTitle: "Karana Remedy:",
    dailyStotrasTitle: "Personalized Daily Classical Stotras (Daily Stotra Guide)",
    dailyStotrasSubtitle: "Sacred classical hymns calibrated to pacify chart afflictions.",
    deityLabel: "Deity:",
    meaningLabel: "Meaning:",
    benefitsLabel: "Spiritual Benefits:",
    timeLabel: "Time:",
    directionLabel: "Direction:",
    mandalaSectionTitle: "45-Day Mandala Vrata Sadhana & Resolution Guide",
    mandalaSubtitle: "Rigorous 45-day sacred sadhana roadmap - Janma Tara Bala Muhurtha, Laghu Purashcharana formula, Sattvic Pathya & interactive daily tracker.",
    mandalaPhase1Title: "Phase 1: Cleansing & Pacification",
    mandalaPhase1Desc: "Purging accumulated karmic weight, pacifying adrenal irritability, and calming mind fluctuations.",
    mandalaPhase2Title: "Phase 2: Alignment & Energy Elevation",
    mandalaPhase2Desc: "Steadfast concentration, awakening positive vitality, and dissolving external obstacles.",
    mandalaPhase3Title: "Phase 3: Manifestation & Siddhi",
    mandalaPhase3Desc: "Realizing your core Sankalpa, sealing divine grace, and anchoring lifelong peace and clarity.",
    muhurthaCardTitle: "Auspicious Starting Muhurtha & Tara Bala Rule",
    auspiciousWeekdaysTitle: "Auspicious Weekdays:",
    taraBalaRuleTitle: "Janma Tara Bala Rule:",
    japaFormulaCardTitle: "Laghu Purashcharana 108 Japa Formula",
    japaFormulaCount: "4,860 Total Japa Count",
    malaRuleTitle: "Mala Rule & Facing Direction:",
    pathyaCardTitle: "Sattvic Pathya & Daily Discipline Guidelines",
    aharaTitle: "Dietary Pathya:",
    acharaTitle: "Daily Conduct:",
    weeklyDanaTitle: "Weekly Charity & Cow Seva:",
    trackerCardTitle: "45-Day Daily Sadhana Tracker (Click each day badge after completing practice)",
    trackerProgressLabel: "Sadhana Progress:",
    daysCompletedSuffix: "Days Completed",
    clickToToggleHelp: "Click on any day number to toggle completion of your daily sadhana.",
    dailyChecklistTitle: "Daily 5-Step Sadhana Checklist:",
    dailyCheckItem1: "Wake in Brahma Muhurtha, take a mindful bath, and wear clean natural clothing.",
    dailyCheckItem2: "Light a pure cow ghee lamp facing East or North and hold your Sankalpa in mind.",
    dailyCheckItem3: "Chant 108 rounds of the prescribed Beeja Mantra using a Tulsi or Rudraksha mala.",
    dailyCheckItem4: "Recite the dedicated chart stotra with heartfelt devotion and reverent focus.",
    dailyCheckItem5: "Maintain a pure sattvic diet, speak truthful gentle words, and avoid angry speech.",
    sankalpaBoxTitle: "Sacred Sankalpa Resolution (Chant on initiation day)",
    copySankalpaBtn: "📋 Copy Sankalpa",
    copiedMsg: "✓ Copied!",
    dashaGocharaTitle: "Active Dasha-Bhukti & Gochara Transit Shanti",
    dashaSuffix: "Dasha",
    mahaDashaLabel: "Maha Dasha",
    bhuktiSuffix: "Bhukti",
    activeSandhiBadge: "Active Sandhi Junction",
    upcomingSandhiBadge: "Upcoming Sandhi Junction",
    stableSandhiBadge: "Stable Period",
    sandhiRemedyPrefix: "Sandhi Transition Shanti: ",
    remedyPrefix: "Remedy: ",
    planetaryTitle: "Planetary Strength (Exaltation / Debilitation) & Gemstone Precautions",
    planetarySubtitle: "Rigorous Vedic analysis of debilitation cancellation, authentic gemstones, and influencer benchmark.",
    debilitatedTitle: "Debilitated Planets & Pacification Remedies:",
    nbryBadge: "Neecha Bhanga Raja Yoga (NBRY)",
    debilitatedBadge: "Debilitated",
    shantiRemedyPrefix: "Pacification Remedy: ",
    gemstoneCautionPrefix: "Gemstone Caution: ",
    exaltedTitle: "Exalted Planets & Positive Activation:",
    exaltedBadge: "Exalted",
    blessingPrefix: "Blessing Area: ",
    sadhanaPrefix: "Activation Practice: ",
    influencerBenchmarkTitle: "Social Media Astrology Benchmark vs Authentic Shastric Grounding",
    influencerAuthenticPrefix: "Authentic Shastric Path: ",
    gokarnaSevasTitle: "Sacred Gokarna Mahabaleshwara Sevas & Remedy Items",
    prescribedSevaTitle: "Prescribed Temple Seva:",
    idealDayTitle: "Ideal Weekday:",
    rudrakshaGemstoneTitle: "Rudraksha & Gemstone Recommendation:",
    rudrakshaPrefix: "• Rudraksha: ",
    gemstonePrefix: "• Gemstone: ",
    sacredDanaTitle: "Sacred Charity & Cow Seva (Daana):",
    itemPrefix: "• Item: ",
    dayPrefix: "• Day: ",
    beneficiaryPrefix: "• Beneficiary: ",
    priestSelectionTitle: "Divine Remedies Priest Attribution & Override",
    priestSelectionDesc: "Select a priest from the database or add a new priest with phone number. Any new priest or edits will persist directly into Firebase database for future access:",
    selectPriestLabel: "Select Priest from Database",
    addNewPriestOption: "➕ Add New Priest (+ Add New Priest)",
    priestNameLabel: "Priest Name",
    priestPhoneLabel: "Mobile / WhatsApp Number",
    priestNamePlaceholder: "e.g. Veda Moorthy Chaitanya Pandit",
    savePriestBtn: "💾 Save",
    saveSuccessMsg: "✓ Priest details saved into Firebase database successfully!",
    badhakaBadge: "Badhaka Graha & Obstruction",
    adhidevataBadge: "Adhidevata",
    pratyadhidevataBadge: "Pratyadhidevata",
    prescriptionCardTitle: "Vedic Astrological Clinical Prescription (Medical-Grade Shastric Protocol)",
    prescriptionCardSubtitle: "Calibrated exactly like a medical prescription: precise Karmic Diagnosis (Nidana), Divine Mantra (Aushadha), Ingestion Vehicle (Anupana), Dietary Discipline (Pathya), and a measurable 15-20 day relief trajectory.",
    prescriptionNidanaTitle: "Karmic & Doshic Diagnosis (Nidana):",
    prescriptionAushadhaTitle: "Divine Sacred Aushadha (Prescription Mantra):",
    prescriptionAnupanaTitle: "Sacred Vehicle & Ingestion Method (Anupana):",
    prescriptionPathyaTitle: "Prescribed Pathya (Strict 15-20 Days):",
    prescriptionApathyaTitle: "Strictly Prohibited Apathya (Avoid Completely):",
    prescriptionTimingTitle: "Sacred Chikitsa Kala, Direction & Asana:",
    prescriptionProgressionTitle: "15 to 20-Day Measurable Relief Trajectory (Vedic Chikitsa Progression):",
    padaLabel: "Pada",
    yogaLabel: "Yoga",
    karanaLabel: "Karana",
    elementalBalanceLabel: "Five Elements Balance Reason: ",
    houseSuffix: (h) => `${h}th House`,
    transitEffectAuspicious: "Auspicious",
    transitEffectChallenging: "Challenging",
    shastricAnalysisBadge: "100% Shastric Chart Analysis",
    clinicalChikitsaBadge: "100% Shastric Clinical Chikitsa",
    firebaseSyncBadge: "🔥 Cloud Synced",
    templeSealBadge: "Gokarna Temple Seal",
    analyzingNatalSubtitle: "Analyzing natal chart and transit periods with deep Shastric precision."
  }
};

export const PAKSHA_LOCALE: Record<"Shukla" | "Krishna", Record<SupportedLanguage, string>> = {
  Shukla: {
    kn: "ಶುಕ್ಲ ಪಕ್ಷ",
    en: "Shukla Paksha",
    hi: "शुक्ल पक्ष",
    te: "శుక్ల పక్షం",
    ta: "சுக்கில பக்ஷம்"
  },
  Krishna: {
    kn: "ಕೃಷ್ಣ ಪಕ್ಷ",
    en: "Krishna Paksha",
    hi: "कृष्ण पक्ष",
    te: "కృష్ణ పక్షం",
    ta: "கிருஷ்ண பக்ஷம்"
  }
};

export const TRANSIT_EFFECT_LOCALE: Record<"Benefic" | "Caution" | "Challenging", Record<SupportedLanguage, string>> = {
  Benefic: {
    kn: "ಶುಭ ಫಲ",
    en: "Benefic",
    hi: "शुभ फल",
    te: "శుభ ఫలితం",
    ta: "சுப பலன்"
  },
  Caution: {
    kn: "ಎಚ್ಚರಿಕೆ",
    en: "Caution",
    hi: "सावधानी",
    te: "జాగ్రత్త",
    ta: "எச்சரிக்கை"
  },
  Challenging: {
    kn: "ಸವಾಲು / ಪರೀಕ್ಷೆ",
    en: "Challenging",
    hi: "चुनौतीपूर्ण",
    te: "సవాలు",
    ta: "சவால்"
  }
};

export const TATVA_LOCALE: Record<string, Record<SupportedLanguage, string>> = {
  Earth: { kn: "ಪೃಥ್ವಿ", en: "Earth", hi: "पृथ्वी", te: "పృథ్వి", ta: "நிலம்" },
  Water: { kn: "ಜಲ", en: "Water", hi: "जल", te: "జలం", ta: "நீர்" },
  Fire: { kn: "ಅಗ್ನಿ", en: "Fire", hi: "अग्नि", te: "అग्नि", ta: "நெருப்பு" },
  Air: { kn: "ವಾಯು", en: "Air", hi: "वायु", te: "వాయువు", ta: "காற்று" },
  Ether: { kn: "ಆಕಾಶ", en: "Ether", hi: "आकाश", te: "ఆకాశం", ta: "ஆகாயம்" }
};

function formatDevoteeNameForLanguage(name: string, targetLang: string): string {
  if (!name || !name.trim()) return "Devotee";
  const trimmed = name.trim();
  const lang = (targetLang || "kn").toLowerCase();

  if (lang === "kn" && /[\u0C80-\u0CFF]/.test(trimmed)) return trimmed;
  if (lang === "hi" && /[\u0900-\u097F]/.test(trimmed)) return trimmed;
  if (lang === "te" && /[\u0C00-\u0C7F]/.test(trimmed)) return trimmed;
  if (lang === "ta" && /[\u0B80-\u0BFF]/.test(trimmed)) return trimmed;
  if (lang === "en" && !/[\u0900-\u0D7F]/.test(trimmed)) return trimmed;

  return transliterateName(trimmed, lang);
}

export const KundliRemedyView: React.FC<KundliRemedyViewProps> = ({
  diagnosis,
  lang,
  onDownloadPdf,
  isGeneratingPdf = false,
  isAiGenerating = false,
  initialPriestId,
  initialPriestName,
  initialPriestPhone,
  onPriestChange
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>((lang || "kn").slice(0, 2) as SupportedLanguage);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeStotraId, setActiveStotraId] = useState<string>(diagnosis.personalizedStotras[0]?.id || "chandrashekhara_ashtakam");

  // 45-Day Mandala Vrata Tracker State
  const storageKey = `baggona_mandala_${(diagnosis.devoteeName || "devotee").replace(/\s+/g, "_")}_days`;
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [1]; // Day 1 completed by default as welcome
  });

  const [activeMandalaPhase, setActiveMandalaPhase] = useState<1 | 2 | 3>(1);
  const [sankalpaCopied, setSankalpaCopied] = useState<boolean>(false);

  const toggleDayCompletion = (dayNum: number) => {
    setCompletedDays((prev) => {
      const next = prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum];
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Priest Attribution & Firebase DB Selection State
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>(initialPriestId || "chaitanya-pandit");
  const [priestNameInput, setPriestNameInput] = useState<string>(() => {
    if (initialPriestName) return initialPriestName;
    const p = getAllPriests().find(pr => pr.id === (initialPriestId || "chaitanya-pandit"));
    return p?.name.kn || "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್";
  });
  const [priestPhoneInput, setPriestPhoneInput] = useState<string>(() => {
    if (initialPriestPhone) return initialPriestPhone;
    const p = getAllPriests().find(pr => pr.id === (initialPriestId || "chaitanya-pandit"));
    return p?.phone || "9482109844";
  });
  const [isSavingPriest, setIsSavingPriest] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handlePriestSelect = (id: string) => {
    setSelectedPriestId(id);
    if (id === "new_priest") {
      setPriestNameInput("");
      setPriestPhoneInput("");
      onPriestChange?.("", "");
    } else {
      const p = priestsList.find(pr => pr.id === id);
      if (p) {
        const langKey = ((selectedLang as unknown) as SevaLang) || "kn";
        const nameToUse = (p.name as Record<string, string>)[langKey] || p.name.kn || p.name.en || "";
        const phoneToUse = p.phone || "";
        setPriestNameInput(nameToUse);
        setPriestPhoneInput(phoneToUse);
        onPriestChange?.(nameToUse, phoneToUse);
      }
    }
  };

  useEffect(() => {
    if (selectedPriestId && selectedPriestId !== "new_priest") {
      const p = priestsList.find(pr => pr.id === selectedPriestId);
      if (p) {
        const langKey = ((selectedLang as unknown) as SevaLang) || "kn";
        const nameToUse = (p.name as Record<string, string>)[langKey] || p.name.kn || p.name.en || "";
        setPriestNameInput(nameToUse);
        onPriestChange?.(nameToUse, priestPhoneInput);
      }
    }
  }, [selectedLang, selectedPriestId, priestsList]);

  const handleSavePriestToDb = async () => {
    const cleanName = priestNameInput.trim();
    const cleanPhone = priestPhoneInput.trim();
    if (!cleanName && !cleanPhone) return;

    setIsSavingPriest(true);
    try {
      const res = await saveOrUpdatePriestProfile({
        id: selectedPriestId === "new_priest" ? undefined : selectedPriestId,
        name: cleanName,
        phone: cleanPhone,
        lang: selectedLang
      });
      const updatedList = getAllPriests();
      setPriestsList(updatedList);
      if (res.profile?.id) {
        setSelectedPriestId(res.profile.id);
      }
      setSaveSuccessMsg(t.saveSuccessMsg);
      setTimeout(() => setSaveSuccessMsg(""), 4000);
      onPriestChange?.(cleanName, cleanPhone);
    } catch (err) {
      console.warn("Failed to persist priest details:", err);
    } finally {
      setIsSavingPriest(false);
    }
  };

  const t = REMEDY_VIEW_I18N[selectedLang] || REMEDY_VIEW_I18N.kn;

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startBreathingTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

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
    mandalaVrataSadhana,
    badhakaAnalysis,
    vedicDoctorPrescription
  } = diagnosis;

  const displayDevoteeName = useMemo(() => formatDevoteeNameForLanguage(devoteeName, selectedLang), [devoteeName, selectedLang]);
  const displayGotra = useMemo(() => gotra ? formatDevoteeNameForLanguage(gotra, selectedLang) : "", [gotra, selectedLang]);

  const mandalaVrata = useMemo(() => {
    if (mandalaVrataSadhana) return mandalaVrataSadhana;
    const cat = primaryStruggle?.category || "anger_temper";
    const catGraha = (planetaryStrengthRemedies?.exaltedPlanets[0]?.graha || "Jupiter") as any;
    return computeMandalaVrataSadhana(cat, catGraha, 0, devoteeName, gotra);
  }, [mandalaVrataSadhana, primaryStruggle, planetaryStrengthRemedies, devoteeName, gotra]);

  const currentStotra = personalizedStotras.find((s) => s.id === activeStotraId) || personalizedStotras[0];

  const getShlokaByLang = (st: typeof currentStotra) => {
    if (!st) return "";
    if (selectedLang === "te") return st.shlokaTelugu;
    if (selectedLang === "ta") return st.shlokaTamil;
    if (selectedLang === "hi") return st.shlokaHindi;
    if (selectedLang === "en") return st.transliteration || (st as any).shlokaEnglish || transliterateIndicToLatin(st.shlokaSanskrit);
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (selectedLang === "te") return bm.telugu;
    if (selectedLang === "ta") return bm.tamil;
    if (selectedLang === "hi") return bm.hindi;
    if (selectedLang === "en") return bm.transliteration || (bm as any).english || transliterateIndicToLatin(bm.sanskrit);
    return bm.kannada;
  };

  const handleCopySankalpa = () => {
    if (!mandalaVrata?.sankalpaDeclaration) return;
    const text = mandalaVrata.sankalpaDeclaration[selectedLang] || mandalaVrata.sankalpaDeclaration.kn;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSankalpaCopied(true);
      setTimeout(() => setSankalpaCopied(false), 3000);
    }
  };

  const completionPercent = Math.round((completedDays.length / 45) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-5 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪔</span>
              <h2 className="font-serif text-lg font-black text-amber-200 sm:text-2xl">
                {t.headerTitle}
              </h2>
            </div>
            <p className="mt-1 text-xs text-amber-100/90 font-medium">
              {t.headerSubtitle}
            </p>

            {/* Devotee Metadata Badges */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-lg bg-amber-800/80 px-2.5 py-1 text-amber-100 border border-amber-600/60">
                👤 {displayDevoteeName} {displayGotra ? `(${displayGotra} ${t.gotraLabel})` : ""}
              </span>
              <span className="rounded-lg bg-emerald-950/80 px-2.5 py-1 text-emerald-200 border border-emerald-600/60">
                🏛️ {t.lagnaLabel} {lagnaName[selectedLang] || lagnaName.kn}
              </span>
              <span className="rounded-lg bg-amber-900/80 px-2.5 py-1 text-amber-200 border border-amber-500/60">
                🌙 {t.rashiLabel} {rashiName[selectedLang] || rashiName.kn}
              </span>
              <span className="rounded-lg bg-indigo-950/80 px-2.5 py-1 text-indigo-200 border border-indigo-600/60">
                ⭐ {t.nakshatraLabel} {nakshatraName[selectedLang] || nakshatraName.kn}
              </span>
              <span className="rounded-lg bg-rose-950/80 px-2.5 py-1 text-rose-200 border border-rose-600/60">
                ⏳ {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn} {t.dashaLabel} / {dashaBhuktiAnalysis.bhuktiLabel[selectedLang] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn} {t.bhuktiLabel}
              </span>
            </div>
          </div>

          {/* Language Selector & PDF Download Action */}
          <div className="flex flex-col sm:items-end gap-3">
            {/* 5-Language Selector */}
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-900/80 p-1 border border-amber-600/60">
              <span className="text-[11px] font-bold text-amber-200 px-2">{t.pdfLangLabel}</span>
              {(["kn", "en", "hi", "te", "ta"] as SupportedLanguage[]).map((lCode) => (
                <button
                  key={lCode}
                  type="button"
                  onClick={() => setSelectedLang(lCode)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${selectedLang === lCode
                      ? "bg-amber-400 text-amber-950 shadow-sm"
                      : "text-amber-200 hover:bg-amber-800"
                    }`}
                >
                  {lCode.toUpperCase()}
                </button>
              ))}
            </div>

            {/* 1-Click PDF Download Button (4-Page A4) */}
            <button
              type="button"
              onClick={() => onDownloadPdf(selectedLang, priestNameInput, priestPhoneInput)}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-black text-amber-950 shadow-lg hover:from-amber-300 hover:to-amber-400 active:scale-95 transition disabled:opacity-60 cursor-pointer"
            >
              <span>📄</span>
              <span>
                {isGeneratingPdf ? t.generatingPdfBtn : t.downloadPdfBtn}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Divine Narration Banner */}
      {isAiGenerating ? (
        <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 text-white shadow-lg flex items-center gap-3 animate-pulse">
          <span className="text-2xl animate-spin">⏳</span>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-300">
              {selectedLang === "kn"
                ? "ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
                : selectedLang === "hi"
                  ? "दैविक ज्योतिष विवरण तैयार हो रहा है..."
                  : selectedLang === "te"
                    ? "దైవిక జ్యోతిష్య వివరణ సిద్ధమవుతోంది..."
                    : selectedLang === "ta"
                      ? "தெய்வீக ஜோதிட உரை தயாராகிறது..."
                      : "Synthesizing Divine Astrological Narration..."}
            </h4>
            <p className="text-[11px] text-amber-200">
              {t.analyzingNatalSubtitle}
            </p>
          </div>
        </div>
      ) : diagnosis.isAiGenerated && diagnosis.aiNarrationText?.[selectedLang] ? (
        <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-amber-600/60 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <h3 className="font-serif text-base sm:text-lg font-black text-amber-200">
                {selectedLang === "kn"
                  ? "ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ & ಸಂದೇಶ"
                  : selectedLang === "hi"
                    ? "दैविक ज्योतिष विवरण एवं सन्देश"
                    : selectedLang === "te"
                      ? "దైవిక జ్యోతిష్య వివరణ & సందేశం"
                      : selectedLang === "ta"
                        ? "தெய்வீக ஜோதிட உரை & செய்தி"
                        : "Personalized Divine Astrological Narration"}
              </h3>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              {t.shastricAnalysisBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed font-normal whitespace-pre-line">
            {diagnosis.aiNarrationText[selectedLang]}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 text-amber-950 shadow-md flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5">🪔</span>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-900 mb-0.5">
              {selectedLang === "kn"
                ? "ಪಾರಂಪರಿಕ ಶಾಸ್ತ್ರೀಯ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ & ಮಾರ್ಗದರ್ಶನ"
                : selectedLang === "hi"
                  ? "पारंपरिक शास्त्रीय जन्मकुंडली विश्लेषण एवं मार्गदर्शन"
                  : selectedLang === "te"
                    ? "పారంపరిక శాస్త్రీయ జాతక విశ్లేషణ & మార్గదర్శనం"
                    : selectedLang === "ta"
                      ? "பாரம்பரிய சாஸ்திர ஜாதக பகுப்பாய்வு & வழிகாட்டல்"
                      : "Traditional Classical Astrological Guidance"}
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
              {diagnosis.aiFallbackMessage?.[selectedLang] ||
                REMEDY_AI_FALLBACK_MESSAGES[selectedLang] ||
                REMEDY_AI_FALLBACK_MESSAGES.kn}
            </p>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. INSTANT ANGER & STRESS PACIFICATION PROTOCOL (Interactive Guided)  */}
      {/* ====================================================================== */}
      <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-300/80 pb-3 gap-2">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
              <span>⚡</span>
              <span>{instantCalmingProtocol.title[selectedLang] || instantCalmingProtocol.title.kn}</span>
            </h3>
            <p className="text-xs text-amber-900 font-semibold mt-0.5">
              {instantCalmingProtocol.subtitle[selectedLang] || instantCalmingProtocol.subtitle.kn}
            </p>
          </div>

          {/* Interactive Breathing & Calm Timer */}
          {isTimerRunning ? (
            <div className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white text-xs font-black animate-pulse shadow-md">
              <span>⏱️ {t.calmingTimeLabel}</span>
              <span className="text-base">{timerSeconds}s</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startBreathingTimer(180)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500 bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 transition shadow-sm cursor-pointer"
            >
              <span>⏱️</span>
              <span>{t.startCalmTimerBtn}</span>
            </button>
          )}
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {instantCalmingProtocol.steps.map((st, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(st.stepNumber)}
              className={`rounded-xl p-3.5 border-2 transition cursor-pointer space-y-1.5 ${activeStep === st.stepNumber
                  ? "border-amber-600 bg-amber-100/90 shadow-md scale-[1.02]"
                  : "border-amber-200 bg-white hover:bg-amber-50/60"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{st.icon}</span>
                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  {typeof st.duration === "object" ? st.duration[selectedLang] || st.duration.kn : st.duration}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-amber-950">
                {st.name[selectedLang] || st.name.kn}
              </h4>
              <p className="text-[11px] font-bold text-amber-900 leading-snug">
                {st.action[selectedLang] || st.action.kn}
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                {st.detail[selectedLang] || st.detail.kn}
              </p>
            </div>
          ))}
        </div>

        {/* Emergency Beeja Japa Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 text-white shadow-inner space-y-2 border border-amber-400">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-700/60 pb-2">
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              <span>🕉️</span>
              <span>{t.emergencyMantraTitle}</span>
            </span>
            <span className="rounded-full bg-amber-500/20 border border-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
              {typeof instantCalmingProtocol.emergencyBeejaMantra.japaCount === "object"
                ? instantCalmingProtocol.emergencyBeejaMantra.japaCount[selectedLang] || instantCalmingProtocol.emergencyBeejaMantra.japaCount.kn
                : instantCalmingProtocol.emergencyBeejaMantra.japaCount}
            </span>
          </div>

          <div className="py-1 text-center font-serif text-sm sm:text-base font-black text-amber-200 tracking-wide">
            {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
          </div>

          <div className="text-center text-[11px] text-amber-100/90 font-medium italic">
            "{instantCalmingProtocol.emergencyBeejaMantra.meaning[selectedLang] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}"
          </div>
        </div>
      </Card>

      {/* ====================================================================== */}
      {/* 2. KUNDALI ROOT CAUSE DIAGNOSIS & PSYCHOLOGICAL METERS                */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Struggle & Afflictions Breakdown (Col span 2) */}
        <Card className="lg:col-span-2 border border-amber-300 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="font-serif text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
              <span>🔍</span>
              <span>{t.rootCauseTitle}</span>
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${primaryStruggle.intensity === "High"
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
            >
              {primaryStruggle.intensityLabel
                ? primaryStruggle.intensityLabel[selectedLang] || primaryStruggle.intensityLabel.kn
                : primaryStruggle.intensity}
            </span>
          </div>

          {/* Primary Struggle Card */}
          <div className="rounded-xl bg-amber-50/80 border border-amber-300 p-3.5 space-y-1.5">
            <div className="text-xs font-black text-rose-900 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{primaryStruggle.title[selectedLang] || primaryStruggle.title.kn}</span>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              {primaryStruggle.description[selectedLang] || primaryStruggle.description.kn}
            </p>
          </div>

          {/* Golden Life Turnaround & Timing Card */}
          {lifeTurnaroundTiming && (
            <div className="rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-yellow-500/15 border-2 border-amber-400/80 p-4 space-y-2.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/80 pb-2">
                <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <span className="text-base">🌟</span>
                  <span>{t.lifeTurnaroundTitle}</span>
                </div>
                <span className="rounded-full bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                  {lifeTurnaroundTiming.timeline?.[selectedLang] || (selectedLang === "kn" ? lifeTurnaroundTiming.timelineKn : (lifeTurnaroundTiming.timelineEn || lifeTurnaroundTiming.timelineKn))}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white/90 border border-amber-200 p-2.5 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    {t.catalystGrahaTitle}
                  </span>
                  <p className="text-xs font-black text-amber-950">
                    {lifeTurnaroundTiming.catalystGraha?.[selectedLang] || (selectedLang === "kn" ? lifeTurnaroundTiming.catalystGrahaKn : (lifeTurnaroundTiming.catalystGrahaEn || lifeTurnaroundTiming.catalystGrahaKn))}
                  </p>
                </div>
                <div className="rounded-lg bg-white/90 border border-amber-200 p-2.5 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    {t.targetedSevaTitle}
                  </span>
                  <p className="text-xs font-black text-amber-950">
                    {lifeTurnaroundTiming.specificSeva?.[selectedLang] || (selectedLang === "kn" ? lifeTurnaroundTiming.specificSevaKn : (lifeTurnaroundTiming.specificSevaEn || lifeTurnaroundTiming.specificSevaKn))}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-amber-950 leading-relaxed font-medium bg-white/70 rounded-lg p-2.5 border border-amber-200/80">
                <span className="font-bold text-amber-900">{t.mechanismTitle}</span>
                {lifeTurnaroundTiming.breakthroughMechanism?.[selectedLang] || (selectedLang === "kn" ? lifeTurnaroundTiming.breakthroughMechanismKn : (lifeTurnaroundTiming.breakthroughMechanismEn || lifeTurnaroundTiming.breakthroughMechanismKn))}
              </div>

              {/* Astrological Reason if provided */}
              {lifeTurnaroundTiming.astrologicalReason && (
                <div className="text-[11px] text-amber-900 leading-relaxed font-medium bg-amber-50/80 rounded-lg p-2.5 border border-amber-300">
                  <span className="font-bold text-amber-950">
                    {t.astrologicalReasonTitle}
                  </span>
                  {lifeTurnaroundTiming.astrologicalReason[selectedLang] || lifeTurnaroundTiming.astrologicalReason.kn}
                </div>
              )}

              {/* 10-Day Relief & 15-Day Transformation Milestones */}
              {(lifeTurnaroundTiming.day10Expectation || lifeTurnaroundTiming.day15Expectation) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                  {lifeTurnaroundTiming.day10Expectation && (
                    <div className="rounded-lg bg-emerald-50/90 border border-emerald-300 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">
                        🌱 {t.day10Title}
                      </span>
                      <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
                        {lifeTurnaroundTiming.day10Expectation[selectedLang] || lifeTurnaroundTiming.day10Expectation.kn}
                      </p>
                    </div>
                  )}
                  {lifeTurnaroundTiming.day15Expectation && (
                    <div className="rounded-lg bg-amber-50/90 border border-amber-300 p-2.5 space-y-1">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                        🌅 {t.day15Title}
                      </span>
                      <p className="text-[11px] text-amber-950 leading-relaxed font-medium">
                        {lifeTurnaroundTiming.day15Expectation[selectedLang] || lifeTurnaroundTiming.day15Expectation.kn}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Before vs After Transformation Contrast */}
              {(lifeTurnaroundTiming.beforeState || lifeTurnaroundTiming.afterState) && (
                <div className="rounded-lg bg-white/90 border border-amber-200 p-2.5 text-xs space-y-1.5">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                    ⚖️ {t.beforeAfterTitle}
                  </span>
                  {lifeTurnaroundTiming.beforeState && (
                    <p className="text-[11px] text-rose-900 font-medium leading-snug">
                      <span className="font-bold text-rose-950">⚠️ {t.currentFrictionTitle}</span>
                      {lifeTurnaroundTiming.beforeState[selectedLang] || lifeTurnaroundTiming.beforeState.kn}
                    </p>
                  )}
                  {lifeTurnaroundTiming.afterState && (
                    <p className="text-[11px] text-emerald-900 font-bold leading-snug">
                      <span className="font-bold text-emerald-950">✨ {t.transformedStateTitle}</span>
                      {lifeTurnaroundTiming.afterState[selectedLang] || lifeTurnaroundTiming.afterState.kn}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Affliction Grahas Grid */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-amber-950">
              {t.afflictedGrahasTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {afflictionFactors.map((af, idx) => (
                <div key={idx} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <span>🔥</span>
                    <span>{af.title[selectedLang] || af.title.kn}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">{af.reason[selectedLang] || af.reason.kn}</p>
                  <p className="text-[10px] text-rose-800 font-semibold">{af.impact[selectedLang] || af.impact.kn}</p>
                </div>
              ))}
            </div>

            {/* Badhaka Graha & Obstruction House Card */}
            {badhakaAnalysis && (
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50/60 p-3.5 text-xs space-y-1.5 mt-2 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-black text-rose-950 flex items-center gap-1.5">
                    <span>🚧</span>
                    <span>{t.badhakaBadge} ({badhakaAnalysis.modalityLabel[selectedLang] || badhakaAnalysis.modalityLabel.kn} - {t.houseSuffix(badhakaAnalysis.badhakaHouse)})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                    {badhakaAnalysis.badhakeshName[selectedLang] || badhakaAnalysis.badhakeshName.kn} ({badhakaAnalysis.badhakaSignName[selectedLang] || badhakaAnalysis.badhakaSignName.kn})
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  {badhakaAnalysis.diagnosisReason[selectedLang] || badhakaAnalysis.diagnosisReason.kn}
                </p>
                <p className="text-[11px] text-rose-900 font-bold bg-white/80 p-2 rounded-lg border border-rose-200">
                  💡 {t.remedyPrefix}{badhakaAnalysis.shantiRemedy[selectedLang] || badhakaAnalysis.shantiRemedy.kn}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Psychological Meters & Equilibrium (Col span 1) */}
        <Card className="border border-amber-300 bg-gradient-to-b from-white to-amber-50/40 p-5 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
            <span>📊</span>
            <span>{t.metersTitle}</span>
          </h3>

          <div className="space-y-3.5">
            {/* Meter 1: Anger / Pitta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-900">🔥 {t.meterKrodha}</span>
                <span className="text-rose-900">{psychologicalProfile.krodhaLevel}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.krodhaLevel}%` }}
                />
              </div>
            </div>

            {/* Meter 2: Mental Stability */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-900">🌙 {t.meterManas}</span>
                <span className="text-emerald-900">{psychologicalProfile.manasStability}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.manasStability}%` }}
                />
              </div>
            </div>

            {/* Meter 3: Vitality / Prana */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-900">☀️ {t.meterVitality}</span>
                <span className="text-amber-900">{psychologicalProfile.vitalityScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.vitalityScore}%` }}
                />
              </div>
            </div>

            {/* Meter 4: Patience Index */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-900">🧘 {t.meterPatience}</span>
                <span className="text-indigo-900">{psychologicalProfile.patienceIndex}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${psychologicalProfile.patienceIndex}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Equilibrium Tip */}
          <div className="rounded-xl bg-amber-100/70 p-3 text-[11px] text-amber-950 font-bold leading-relaxed border border-amber-300">
            💡 {t.meterTip}
          </div>
        </Card>
      </div>

      {/* ====================================================================== */}
      {/* 2B. MEDICAL-GRADE ASTROLOGICAL PRESCRIPTION (Vedic Doctor Protocol)   */}
      {/* ====================================================================== */}
      {vedicDoctorPrescription && (
        <Card className="border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-50/40 via-white to-amber-50/30 p-5 shadow-lg space-y-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-emerald-200 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <h3 className="font-serif text-base sm:text-lg font-black text-emerald-950">
                  {t.prescriptionCardTitle}
                </h3>
              </div>
              <p className="text-xs text-emerald-900 font-semibold mt-0.5">
                {t.prescriptionCardSubtitle}
              </p>
            </div>
            <span className="rounded-full bg-emerald-800 text-emerald-50 text-[10px] font-black px-3 py-1 shadow-xs tracking-wider uppercase self-start sm:self-auto">
              {t.clinicalChikitsaBadge}
            </span>
          </div>

          {/* 4 Pillars Grid: Nidana + Anupana + Aushadha + Chikitsa Kala */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* 1. Nidana (Diagnosis) */}
            <div className="rounded-xl border border-emerald-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                  <span>🩺</span>
                  <span>{t.prescriptionNidanaTitle}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                  {vedicDoctorPrescription.nidana.primaryDosha} ({vedicDoctorPrescription.nidana.doshaLabel[selectedLang] || vedicDoctorPrescription.nidana.doshaLabel.kn})
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {vedicDoctorPrescription.nidana.rootCauseDescription[selectedLang] || vedicDoctorPrescription.nidana.rootCauseDescription.kn}
              </p>
              <div className="text-[10.5px] text-emerald-900 font-bold bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                ⚡ {vedicDoctorPrescription.nidana.affectedNadis[selectedLang] || vedicDoctorPrescription.nidana.affectedNadis.kn}
              </div>
            </div>

            {/* 2. Anupana (Sacred Vehicle & Ingestion) */}
            <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                <span>🧪</span>
                <span>{t.prescriptionAnupanaTitle}</span>
              </div>
              <div className="font-black text-amber-900 text-sm">
                • {vedicDoctorPrescription.anupana.vehicleName[selectedLang] || vedicDoctorPrescription.anupana.vehicleName.kn}
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {vedicDoctorPrescription.anupana.preparationMethod[selectedLang] || vedicDoctorPrescription.anupana.preparationMethod.kn}
              </p>
              <div className="text-[10.5px] text-amber-950 font-bold bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                ⏰ {vedicDoctorPrescription.anupana.intakeTiming[selectedLang] || vedicDoctorPrescription.anupana.intakeTiming.kn}
              </div>
            </div>

            {/* 3. Aushadha (Prescription Mantra & Sacred Substance) */}
            <div className="rounded-xl border border-indigo-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                  <span>🕉️</span>
                  <span>{t.prescriptionAushadhaTitle}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                  {vedicDoctorPrescription.aushadha.beejaMantra.dailyDosageCount[selectedLang] || vedicDoctorPrescription.aushadha.beejaMantra.dailyDosageCount.kn}
                </span>
              </div>
              <div className="text-center py-1 font-serif font-black text-sm text-indigo-950 bg-indigo-50/60 rounded-lg border border-indigo-100">
                {vedicDoctorPrescription.aushadha.beejaMantra.mantraNative[selectedLang] || vedicDoctorPrescription.aushadha.beejaMantra.mantraNative.kn}
              </div>
              <p className="text-[10.5px] text-slate-700 leading-snug">
                {vedicDoctorPrescription.aushadha.beejaMantra.instructions[selectedLang] || vedicDoctorPrescription.aushadha.beejaMantra.instructions.kn}
              </p>
              <div className="text-[11px] text-indigo-900 font-bold pt-1 border-t border-indigo-100 space-y-0.5">
                <div>📜 {vedicDoctorPrescription.aushadha.stotraKavacha[selectedLang] || vedicDoctorPrescription.aushadha.stotraKavacha.kn}</div>
                <div>🌿 {vedicDoctorPrescription.aushadha.sacredSubstance[selectedLang] || vedicDoctorPrescription.aushadha.sacredSubstance.kn}</div>
              </div>
            </div>

            {/* 4. Chikitsa Kala (Timing, Direction & Asana) */}
            <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                <span>🧭</span>
                <span>{t.prescriptionTimingTitle}</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-amber-950 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-700">⏰</span>
                  <span>{vedicDoctorPrescription.chikitsaKala.idealTimeWindow[selectedLang] || vedicDoctorPrescription.chikitsaKala.idealTimeWindow.kn}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-700">🧭</span>
                  <span>{vedicDoctorPrescription.chikitsaKala.facingDirection[selectedLang] || vedicDoctorPrescription.chikitsaKala.facingDirection.kn}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-700">🧘</span>
                  <span>{vedicDoctorPrescription.chikitsaKala.asanaMaterial[selectedLang] || vedicDoctorPrescription.chikitsaKala.asanaMaterial.kn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pathya vs Apathya 2-Column Discipline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Prescribed Pathya */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-3.5 space-y-1.5">
              <div className="font-black text-emerald-950 flex items-center gap-1.5 text-xs">
                <span>✅</span>
                <span>{t.prescriptionPathyaTitle}</span>
              </div>
              <div className="space-y-1 text-[11px] text-emerald-950 font-medium">
                {vedicDoctorPrescription.pathyaApathya.pathyaPrescribed.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{item[selectedLang] || item.kn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Apathya */}
            <div className="rounded-xl border-2 border-rose-300 bg-rose-50/50 p-3.5 space-y-1.5">
              <div className="font-black text-rose-950 flex items-center gap-1.5 text-xs">
                <span>🚫</span>
                <span>{t.prescriptionApathyaTitle}</span>
              </div>
              <div className="space-y-1 text-[11px] text-rose-950 font-medium">
                {vedicDoctorPrescription.pathyaApathya.apathyaProhibited.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">•</span>
                    <span>{item[selectedLang] || item.kn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 15-to-20 Day Measurable Relief Trajectory */}
          <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50/60 to-emerald-50/50 p-4 space-y-3">
            <div className="font-serif font-black text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
              <span>📈</span>
              <span>{t.prescriptionProgressionTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              {/* Day 1-3 */}
              <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide block">
                  {vedicDoctorPrescription.reliefMilestones.day1To3.stage[selectedLang] || vedicDoctorPrescription.reliefMilestones.day1To3.stage.kn}
                </span>
                <p className="text-[10.5px] text-slate-700 leading-snug font-medium">
                  {vedicDoctorPrescription.reliefMilestones.day1To3.observation[selectedLang] || vedicDoctorPrescription.reliefMilestones.day1To3.observation.kn}
                </p>
              </div>

              {/* Day 4-7 */}
              <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide block">
                  {vedicDoctorPrescription.reliefMilestones.day4To7.stage[selectedLang] || vedicDoctorPrescription.reliefMilestones.day4To7.stage.kn}
                </span>
                <p className="text-[10.5px] text-slate-700 leading-snug font-medium">
                  {vedicDoctorPrescription.reliefMilestones.day4To7.observation[selectedLang] || vedicDoctorPrescription.reliefMilestones.day4To7.observation.kn}
                </p>
              </div>

              {/* Day 8-14 */}
              <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide block">
                  {vedicDoctorPrescription.reliefMilestones.day8To14.stage[selectedLang] || vedicDoctorPrescription.reliefMilestones.day8To14.stage.kn}
                </span>
                <p className="text-[10.5px] text-slate-700 leading-snug font-medium">
                  {vedicDoctorPrescription.reliefMilestones.day8To14.observation[selectedLang] || vedicDoctorPrescription.reliefMilestones.day8To14.observation.kn}
                </p>
              </div>

              {/* Day 15-20 (Key Breakthrough) */}
              <div className="rounded-lg bg-emerald-50/90 p-2.5 border-2 border-emerald-400 space-y-1 shadow-xs">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wide block flex items-center gap-1">
                  <span>✨</span>
                  <span>{vedicDoctorPrescription.reliefMilestones.day15To20.stage[selectedLang] || vedicDoctorPrescription.reliefMilestones.day15To20.stage.kn}</span>
                </span>
                <p className="text-[10.5px] text-emerald-950 leading-snug font-bold">
                  {vedicDoctorPrescription.reliefMilestones.day15To20.observation[selectedLang] || vedicDoctorPrescription.reliefMilestones.day15To20.observation.kn}
                </p>
              </div>

              {/* Day 21-45 (Mandala Siddhi) */}
              <div className="rounded-lg bg-amber-100/90 p-2.5 border border-amber-300 space-y-1">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide block">
                  {vedicDoctorPrescription.reliefMilestones.day21To45.stage[selectedLang] || vedicDoctorPrescription.reliefMilestones.day21To45.stage.kn}
                </span>
                <p className="text-[10.5px] text-amber-950 leading-snug font-medium">
                  {vedicDoctorPrescription.reliefMilestones.day21To45.observation[selectedLang] || vedicDoctorPrescription.reliefMilestones.day21To45.observation.kn}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* 3. PANCHANGA 5-ANGA DIVINE REMEDIES & NAKSHATRA VRIKSHA                 */}
      {/* ====================================================================== */}
      {panchangaRemedies && (
        <Card className="border border-amber-300 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-2.5 gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🌿</span>
                <span>{t.panchangaTitle}</span>
              </h3>
              <p className="text-xs text-amber-900 font-medium mt-0.5">
                {t.panchangaSubtitle}
              </p>
            </div>
            <span className="rounded-full bg-amber-800 text-amber-50 px-3 py-1 text-xs font-bold shrink-0 self-start sm:self-auto">
              {panchangaRemedies.nakshatraRemedy.nakshatraName[selectedLang] || panchangaRemedies.nakshatraRemedy.nakshatraName.kn} ({t.padaLabel} {panchangaRemedies.nakshatraRemedy.pada})
            </span>
          </div>

          {/* Elemental Balance Reason */}
          {panchangaRemedies.elementalBalanceReason && (
            <div className="rounded-xl bg-amber-100/70 border border-amber-300 p-2.5 text-xs text-amber-950 font-medium leading-relaxed">
              <span className="font-bold text-amber-900">
                🌀 {t.elementalBalanceLabel}
              </span>
              {panchangaRemedies.elementalBalanceReason[selectedLang] || panchangaRemedies.elementalBalanceReason.kn}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Nakshatra Vriksha (Sacred Tree) */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span>🌳</span>
                  <span>{t.sacredTreeTitle}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  {panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName}
                </span>
              </div>
              <div className="text-emerald-900 font-bold text-sm">
                • {panchangaRemedies.nakshatraRemedy.sacredTree[selectedLang === "en" ? "english" : selectedLang === "hi" ? "hindi" : selectedLang === "te" ? "telugu" : selectedLang === "ta" ? "tamil" : "kannada"]}
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod[selectedLang] || panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod.kn}
              </p>
              <div className="rounded-xl bg-emerald-950 text-emerald-200 p-2.5 text-center font-serif font-black text-xs">
                {selectedLang === "en"
                  ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).transliteration ||
                    (panchangaRemedies.nakshatraRemedy.beejaMantra as any).english ||
                    transliterateIndicToLatin(panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit || panchangaRemedies.nakshatraRemedy.beejaMantra.kannada))
                  : selectedLang === "kn"
                    ? (panchangaRemedies.nakshatraRemedy.beejaMantra.kannada || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                    : selectedLang === "hi"
                      ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).hindi || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                      : selectedLang === "te"
                        ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).telugu || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                        : selectedLang === "ta"
                          ? ((panchangaRemedies.nakshatraRemedy.beejaMantra as any).tamil || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)
                          : (panchangaRemedies.nakshatraRemedy.beejaMantra.kannada || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)}
              </div>
              <div className="text-[10px] text-emerald-900 font-bold">
                🙏 {t.deityWorshipTitle} {panchangaRemedies.nakshatraRemedy.aradhana[selectedLang] || panchangaRemedies.nakshatraRemedy.aradhana.kn}
              </div>
            </div>

            {/* 2. Tithi Vrata & Devata */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                  <span>🌕</span>
                  <span>{t.tithiVrataTitle}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {PAKSHA_LOCALE[panchangaRemedies.tithiRemedy.paksha]?.[selectedLang] || `${panchangaRemedies.tithiRemedy.paksha} Paksha`}
                </span>
              </div>
              <div className="text-amber-900 font-bold text-sm">
                • {panchangaRemedies.tithiRemedy.tithiName[selectedLang] || panchangaRemedies.tithiRemedy.tithiName.kn} ({panchangaRemedies.tithiRemedy.rulingDeity[selectedLang] || panchangaRemedies.tithiRemedy.rulingDeity.kn})
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {panchangaRemedies.tithiRemedy.vrataAndRemedy[selectedLang] || panchangaRemedies.tithiRemedy.vrataAndRemedy.kn}
              </p>
              <div className="pt-2 border-t border-amber-200 space-y-1">
                <div className="font-bold text-amber-950 flex items-center gap-1">
                  <span>📅</span>
                  <span>{t.weekdaySadhanaTitle}</span>
                </div>
                <div className="text-[11px] text-slate-800 font-semibold">
                  {panchangaRemedies.varaRemedy.dayName[selectedLang] || panchangaRemedies.varaRemedy.dayName.kn} · {t.colorTitle} {panchangaRemedies.varaRemedy.dailyColor[selectedLang] || panchangaRemedies.varaRemedy.dailyColor.kn}
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  {panchangaRemedies.varaRemedy.dailySadhana[selectedLang] || panchangaRemedies.varaRemedy.dailySadhana.kn}
                </p>
              </div>
            </div>

            {/* 3. Yoga & Karana Shanti */}
            <div className="rounded-2xl border border-amber-300 bg-white p-3.5 space-y-1.5 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{t.yogaKaranaTitle}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${panchangaRemedies.yogaRemedy.isAuspicious ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {t.yogaLabel}: {panchangaRemedies.yogaRemedy.yogaName[selectedLang] || panchangaRemedies.yogaRemedy.yogaName.kn}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {t.karanaLabel}: {panchangaRemedies.karanaRemedy.karanaName[selectedLang] || panchangaRemedies.karanaRemedy.karanaName.kn} ({TATVA_LOCALE[panchangaRemedies.karanaRemedy.tatva]?.[selectedLang] || panchangaRemedies.karanaRemedy.tatva})
                  </span>
                </div>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                💡 <span className="font-bold text-amber-900">{t.yogaRemedyTitle}</span> {panchangaRemedies.yogaRemedy.shantiPractice[selectedLang] || panchangaRemedies.yogaRemedy.shantiPractice.kn}
              </p>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                💡 <span className="font-bold text-amber-900">{t.karanaRemedyTitle}</span> {panchangaRemedies.karanaRemedy.karyaShanti[selectedLang] || panchangaRemedies.karanaRemedy.karyaShanti.kn}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* 4. PERSONALIZED DAILY STOTRA & JAPA SECTION                           */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200 pb-3 gap-2">
          <div>
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>📜</span>
              <span>{t.dailyStotrasTitle}</span>
            </h3>
            <p className="text-xs text-amber-900 font-medium mt-0.5">
              {t.dailyStotrasSubtitle}
            </p>
          </div>

          {/* Stotra Selector Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {personalizedStotras.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStotraId(st.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${activeStotraId === st.id
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
              >
                {st.title[selectedLang]?.split(" ")[0] || st.title.kn.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Stotra Reader */}
        {currentStotra && (
          <div className="space-y-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/40 to-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div>
                <h4 className="text-sm font-extrabold text-amber-950">
                  {currentStotra.title[selectedLang] || currentStotra.title.kn}
                </h4>
                <div className="text-xs text-amber-900 font-bold">
                  {t.deityLabel} {currentStotra.dedicatedTo[selectedLang] || currentStotra.dedicatedTo.kn}
                </div>
              </div>
              <span className="rounded-full bg-amber-800 text-amber-50 px-3 py-1 text-xs font-bold">
                {typeof currentStotra.recitationCount === "object"
                  ? currentStotra.recitationCount[selectedLang] || currentStotra.recitationCount.kn
                  : currentStotra.recitationCount}
              </span>
            </div>

            {/* Sacred Verse in Localized Script */}
            <div className="rounded-xl bg-amber-950 text-amber-200 p-4 text-center font-serif text-xs sm:text-sm font-black leading-relaxed whitespace-pre-line border border-amber-400 shadow-inner">
              {getShlokaByLang(currentStotra)}
            </div>

            {/* Translation & Benefits */}
            <div className="space-y-1.5 text-xs">
              <div className="text-amber-950 font-bold leading-relaxed">
                <span className="text-amber-800 font-extrabold">📖 {t.meaningLabel}</span>{" "}
                {currentStotra.meaning[selectedLang] || currentStotra.meaning.kn}
              </div>
              <div className="text-emerald-950 font-semibold leading-relaxed">
                <span className="text-emerald-800 font-extrabold">✨ {t.benefitsLabel}</span>{" "}
                {currentStotra.spiritualBenefits[selectedLang] || currentStotra.spiritualBenefits.kn}
              </div>
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-bold text-amber-900">
                <span>⏰ {t.timeLabel} {currentStotra.bestTimeToRecite[selectedLang] || currentStotra.bestTimeToRecite.kn}</span>
                <span>🧭 {t.directionLabel} {currentStotra.facingDirection[selectedLang] || currentStotra.facingDirection.kn}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ====================================================================== */}
      {/* 5. VEDIC GRAHA SHANTI MANTRA & 11-BEAD JAPA COUNTER                   */}
      {/* ====================================================================== */}
      <div className="space-y-2">
        <PostPoojaRemedyJapaCard
          devoteeName={displayDevoteeName}
          rashiName={diagnosis.rashiName[selectedLang] || diagnosis.rashiName.kn}
          nakshatraName={diagnosis.nakshatraName[selectedLang] || diagnosis.nakshatraName.kn}
          lang={selectedLang as SevaLang}
        />
      </div>

      {/* ====================================================================== */}
      {/* 5B. 45-DAY MANDALA VRATA SADHANA & INTERACTIVE PROGRESS TRACKER        */}
      {/* ====================================================================== */}
      {mandalaVrata && (
        <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 p-5 shadow-lg space-y-4 rounded-2xl">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-amber-300/80 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪔</span>
                <h3 className="font-serif text-base sm:text-lg font-black text-amber-950">
                  {t.mandalaSectionTitle}
                </h3>
              </div>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                {t.mandalaSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="rounded-full bg-amber-800 text-amber-100 text-[10px] font-black px-3 py-1 shadow-xs tracking-wider uppercase">
                {mandalaVrata.durationLabel[selectedLang] || mandalaVrata.durationLabel.kn}
              </span>
            </div>
          </div>

          {/* 3-Phase Roadmap Tabs & Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <span>🌟</span>
                <span>{selectedLang === "kn" ? "೩-ಹಂತದ ಜೀವನ ಪರಿವರ್ತನಾ ಕಾಲಾವಧಿ" : selectedLang === "hi" ? "३-चरणीय जीवन परिवर्तन समयावधि" : selectedLang === "te" ? "3-దశల జీవన పరివర్తన కాలక్రమం" : selectedLang === "ta" ? "3-படிநிலை வாழ்வு மாற்ற காலக்கோடு" : "Three-Phase Life Transformation Roadmap"}</span>
              </h4>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    data-testid={`mandala-phase-btn-${pNum}`}
                    onClick={() => setActiveMandalaPhase(pNum)}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition cursor-pointer ${
                      activeMandalaPhase === pNum
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-100/80 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    {selectedLang === "kn" ? `ಹಂತ ${pNum}` : selectedLang === "hi" ? `चरण ${pNum}` : selectedLang === "te" ? `దశ ${pNum}` : selectedLang === "ta" ? `நிலை ${pNum}` : `Phase ${pNum}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Phase Card */}
            {(() => {
              const pData = activeMandalaPhase === 1
                ? mandalaVrata.threePhaseRoadmap.phase1
                : activeMandalaPhase === 2
                  ? mandalaVrata.threePhaseRoadmap.phase2
                  : mandalaVrata.threePhaseRoadmap.phase3;
              return (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50/70 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-amber-200 pb-1.5">
                    <span className="font-black text-amber-950 text-xs sm:text-sm">
                      {pData.phaseTitle[selectedLang] || pData.phaseTitle.kn}
                    </span>
                    <span className="rounded-full bg-amber-200 text-amber-900 text-[10px] font-black px-2.5 py-0.5">
                      {pData.daysRange[selectedLang] || pData.daysRange.kn}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                    <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">
                        🎯 {selectedLang === "kn" ? "ಸಾಧನಾ ಕೇಂದ್ರ:" : selectedLang === "hi" ? "साधना केंद्र:" : selectedLang === "te" ? "సాధనా కేంద్రం:" : selectedLang === "ta" ? "சாதனை நோக்கம்:" : "Core Focus:"}
                      </span>
                      <p className="text-[11px] text-amber-950 font-bold leading-snug">
                        {pData.focusArea[selectedLang] || pData.focusArea.kn}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
                        🌱 {selectedLang === "kn" ? "ಅನುಭವಕ್ಕೆ ಬರುವ ಪರಿವರ್ತನೆ:" : selectedLang === "hi" ? "अनुभवजन्य परिवर्तन:" : selectedLang === "te" ? "అనుభవపూర్వక ఉపశమనం:" : selectedLang === "ta" ? "உணரக்கூடிய அமைதி:" : "Experiential Relief:"}
                      </span>
                      <p className="text-[11px] text-emerald-950 font-bold leading-snug">
                        {pData.experientialRelief[selectedLang] || pData.experientialRelief.kn}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide block">
                        ✨ {selectedLang === "kn" ? "ಆಂತರಿಕ ಜಾಗೃತಿ:" : selectedLang === "hi" ? "आंतरिक जागृति:" : selectedLang === "te" ? "అంతర్గత జాగృతి:" : selectedLang === "ta" ? "உள்ளுணர்வு விழிப்புணர்வு:" : "Subconscious Shift:"}
                      </span>
                      <p className="text-[11px] text-indigo-950 font-bold leading-snug">
                        {pData.subconsciousShift[selectedLang] || pData.subconsciousShift.kn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2-Column: Muhurtha & Setup + Japa Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Muhurtha & Tara Bala Card */}
            <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                <span>⭐</span>
                <span>{t.muhurthaCardTitle}</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="font-black text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                  <span className="text-amber-800">{t.taraBalaRuleTitle}</span>{" "}
                  {mandalaVrata.auspiciousStartMuhurtha.taraBalaCategory[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.taraBalaCategory.kn}
                </div>
                <p className="text-slate-700 leading-snug">
                  {mandalaVrata.auspiciousStartMuhurtha.taraBalaReason[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.taraBalaReason.kn}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 font-bold text-amber-950 text-[10.5px]">
                  <div>📅 <span className="text-amber-800">{t.auspiciousWeekdaysTitle}</span> {mandalaVrata.auspiciousStartMuhurtha.auspiciousWeekday[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.auspiciousWeekday.kn}</div>
                  <div>🌕 {mandalaVrata.auspiciousStartMuhurtha.tithiPakshaRecommendation[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.tithiPakshaRecommendation.kn}</div>
                  <div>⏰ {mandalaVrata.auspiciousStartMuhurtha.idealTimeWindow[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.idealTimeWindow.kn}</div>
                  <div>🧭 {mandalaVrata.auspiciousStartMuhurtha.facingDirection[selectedLang] || mandalaVrata.auspiciousStartMuhurtha.facingDirection.kn}</div>
                </div>
              </div>
            </div>

            {/* Japa Formula & Mala Rules */}
            <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 shadow-xs">
              <div className="font-extrabold text-amber-950 text-xs flex items-center justify-between border-b border-amber-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>📿</span>
                  <span>{t.japaFormulaCardTitle}</span>
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-extrabold border border-emerald-300">
                  {t.japaFormulaCount}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="font-black text-emerald-950 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  {mandalaVrata.japaPurashcharanaFormula.dailyCountFormatted[selectedLang] || mandalaVrata.japaPurashcharanaFormula.dailyCountFormatted.kn}
                </div>
                <div className="font-bold text-amber-900">
                  ✨ {mandalaVrata.japaPurashcharanaFormula.totalMandalaCountFormatted[selectedLang] || mandalaVrata.japaPurashcharanaFormula.totalMandalaCountFormatted.kn}
                </div>
                <div className="font-bold text-amber-950">
                  • {t.malaRuleTitle} {mandalaVrata.japaPurashcharanaFormula.prescribedMala[selectedLang] || mandalaVrata.japaPurashcharanaFormula.prescribedMala.kn}
                </div>
                <p className="text-[10.5px] text-slate-700 leading-snug">
                  {mandalaVrata.japaPurashcharanaFormula.shastricRule[selectedLang] || mandalaVrata.japaPurashcharanaFormula.shastricRule.kn}
                </p>
              </div>
            </div>
          </div>

          {/* Sattvic Pathya & Niyama Card */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-2.5 text-xs">
            <div className="font-extrabold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
              <span>🥗</span>
              <span>{t.pathyaCardTitle}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="space-y-1">
                <span className="font-black text-amber-900 block">{t.aharaTitle}</span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {mandalaVrata.sattvicPathyaAndNiyama.aharaRules.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{r[selectedLang] || r.kn}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="font-black text-amber-900 block">{t.acharaTitle}</span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {mandalaVrata.sattvicPathyaAndNiyama.acharaRules.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-indigo-700 font-bold">•</span>
                      <span>{r[selectedLang] || r.kn}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="font-black text-amber-900 block">{t.weeklyDanaTitle}</span>
                <p className="text-slate-700 font-medium bg-white/80 p-2 rounded-lg border border-amber-200 leading-snug">
                  {mandalaVrata.sattvicPathyaAndNiyama.weeklyDaana[selectedLang] || mandalaVrata.sattvicPathyaAndNiyama.weeklyDaana.kn}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Step Daily Sadhana Checklist */}
          <div className="rounded-xl border border-amber-300 bg-white p-3.5 space-y-2 text-xs">
            <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>📋</span>
              <span>{t.dailyChecklistTitle}</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[10.5px]">
              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200 font-medium text-amber-950">
                1️⃣ {t.dailyCheckItem1}
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200 font-medium text-amber-950">
                2️⃣ {t.dailyCheckItem2}
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200 font-medium text-amber-950">
                3️⃣ {t.dailyCheckItem3}
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200 font-medium text-amber-950">
                4️⃣ {t.dailyCheckItem4}
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200 font-medium text-amber-950">
                5️⃣ {t.dailyCheckItem5}
              </div>
            </div>
          </div>

          {/* Interactive 45-Day Daily Progress Tracker */}
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-4 sm:p-5 text-white shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-600/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h4 className="font-serif text-xs sm:text-sm font-black text-amber-200">
                  {t.trackerCardTitle}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300">
                  {t.trackerProgressLabel} {completedDays.length} / 45 {t.daysCompletedSuffix} ({completionPercent}%)
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5">
                  {completionPercent === 100 ? "🎉 SIDDHI" : `${completionPercent}%`}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-stone-800 overflow-hidden border border-amber-600/40">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-amber-200/80 italic">
              💡 {t.clickToToggleHelp}
            </p>

            {/* 45-Day Grid */}
            <div className="grid grid-cols-9 sm:grid-cols-15 gap-1.5 pt-1">
              {Array.from({ length: 45 }, (_, i) => i + 1).map((dayNum) => {
                const isDone = completedDays.includes(dayNum);
                return (
                  <button
                    key={dayNum}
                    type="button"
                    data-testid={`mandala-day-${dayNum}`}
                    onClick={() => toggleDayCompletion(dayNum)}
                    className={`h-8 sm:h-9 rounded-lg font-mono font-black text-[11px] flex flex-col items-center justify-center transition active:scale-90 cursor-pointer ${
                      isDone
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-sm border border-emerald-300"
                        : "bg-stone-800 text-amber-200/80 border border-stone-700 hover:bg-stone-700"
                    }`}
                  >
                    <span>{dayNum}</span>
                    <span className="text-[8px] leading-none">{isDone ? "✓" : "○"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sacred Sankalpa Resolution Declaration with Copy Action */}
          <div className="rounded-xl bg-amber-950 border-2 border-amber-400 p-4 text-white space-y-2 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-700/60 pb-2">
              <span className="text-xs font-black text-amber-200 flex items-center gap-1.5 uppercase tracking-wide">
                <span>🕉️</span>
                <span>{t.sankalpaBoxTitle}</span>
              </span>
              <button
                type="button"
                onClick={handleCopySankalpa}
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-[11px] shadow-sm transition cursor-pointer"
              >
                {sankalpaCopied ? t.copiedMsg : t.copySankalpaBtn}
              </button>
            </div>
            <p className="font-serif text-xs sm:text-sm text-amber-100/95 leading-relaxed italic text-center py-1">
              "{mandalaVrata.sankalpaDeclaration[selectedLang] || mandalaVrata.sankalpaDeclaration.kn}"
            </p>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* 6. GOCHARA (TRANSIT) & ACTIVE DASHA-BHUKTI SHANTI                     */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
            <span>🪐</span>
            <span>{t.dashaGocharaTitle}</span>
          </h3>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.kn} {t.dashaSuffix}
          </span>
        </div>

        <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 text-xs space-y-1.5">
          <div className="font-bold text-amber-900">
            ⏳ {dashaBhuktiAnalysis.mahaDashaLabel[selectedLang] || dashaBhuktiAnalysis.mahaDashaLabel.kn} {t.mahaDashaLabel} / {dashaBhuktiAnalysis.bhuktiLabel[selectedLang] || dashaBhuktiAnalysis.bhuktiLabel.kn} {t.bhuktiSuffix}
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {dashaBhuktiAnalysis.periodEffect[selectedLang] || dashaBhuktiAnalysis.periodEffect.kn}
          </p>
          <p className="text-emerald-900 font-bold">
            💡 {t.remedyPrefix}{dashaBhuktiAnalysis.remedialAction[selectedLang] || dashaBhuktiAnalysis.remedialAction.kn}
          </p>
          {dashaBhuktiAnalysis.adhidevata && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/80 mt-2">
              <div className="rounded-lg bg-white/90 p-2.5 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 text-[11px] block">
                  🏛️ {t.adhidevataBadge}: <span className="text-amber-950 font-black">{dashaBhuktiAnalysis.adhidevata.adhidevata[selectedLang] || dashaBhuktiAnalysis.adhidevata.adhidevata.kn}</span>
                </span>
                <span className="font-bold text-amber-900 text-[11px] block">
                  🔱 {t.pratyadhidevataBadge}: <span className="text-amber-950 font-black">{dashaBhuktiAnalysis.adhidevata.pratyadhidevata[selectedLang] || dashaBhuktiAnalysis.adhidevata.pratyadhidevata.kn}</span>
                </span>
              </div>
              <div className="rounded-lg bg-emerald-50/90 p-2.5 border border-emerald-200 text-[11px] text-emerald-950 font-medium">
                <span className="font-black text-emerald-900 block mb-0.5">✨ {t.sadhanaPrefix}</span>
                {dashaBhuktiAnalysis.adhidevata.sadhana[selectedLang] || dashaBhuktiAnalysis.adhidevata.sadhana.kn}
              </div>
            </div>
          )}
        </div>

        {/* Dasha Sandhi Junction Alert */}
        {dashaBhuktiAnalysis.sandhiAlert && (
          <div
            className={`rounded-xl p-3.5 border text-xs space-y-1.5 ${dashaBhuktiAnalysis.sandhiAlert.status === "active"
                ? "bg-rose-50/80 border-rose-300"
                : dashaBhuktiAnalysis.sandhiAlert.status === "upcoming"
                  ? "bg-amber-50/80 border-amber-300"
                  : "bg-emerald-50/80 border-emerald-300"
              }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span
                className={
                  dashaBhuktiAnalysis.sandhiAlert.status === "active"
                    ? "text-rose-950 text-sm"
                    : dashaBhuktiAnalysis.sandhiAlert.status === "upcoming"
                      ? "text-amber-950 text-sm"
                      : "text-emerald-950 text-sm"
                }
              >
                ⚡ {dashaBhuktiAnalysis.sandhiAlert.title[selectedLang] || dashaBhuktiAnalysis.sandhiAlert.title.kn}
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${dashaBhuktiAnalysis.sandhiAlert.status === "active"
                    ? "bg-rose-200 text-rose-900"
                    : dashaBhuktiAnalysis.sandhiAlert.status === "upcoming"
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
              >
                {dashaBhuktiAnalysis.sandhiAlert.status === "active"
                  ? t.activeSandhiBadge
                  : dashaBhuktiAnalysis.sandhiAlert.status === "upcoming"
                    ? t.upcomingSandhiBadge
                    : t.stableSandhiBadge}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium text-[11px]">
              {dashaBhuktiAnalysis.sandhiAlert.description[selectedLang] || dashaBhuktiAnalysis.sandhiAlert.description.kn}
            </p>
            <p className="text-amber-950 font-bold text-[11px]">
              💡 <span className="underline">{t.sandhiRemedyPrefix}</span>{" "}
              {dashaBhuktiAnalysis.sandhiAlert.remedy[selectedLang] || dashaBhuktiAnalysis.sandhiAlert.remedy.kn}
            </p>
          </div>
        )}

        {/* Gochara Transit Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {gocharaTransitAnalysis.transitHighlights.map((th, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3.5 border text-xs space-y-1 ${th.effect === "Challenging"
                  ? "bg-rose-50/70 border-rose-300"
                  : "bg-emerald-50/70 border-emerald-300"
                }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span className={th.effect === "Challenging" ? "text-rose-900" : "text-emerald-900"}>
                  {th.title[selectedLang] || th.title.kn}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border">
                  {TRANSIT_EFFECT_LOCALE[th.effect]?.[selectedLang] || th.effect}
                </span>
              </div>
              <p className="text-slate-700 text-[11px] leading-snug">{th.description[selectedLang] || th.description.kn}</p>
              <p className="text-amber-900 font-bold text-[11px]">
                💡 {t.remedyPrefix}{th.remedy[selectedLang] || th.remedy.kn}
              </p>
            </div>
          ))}
        </div>

        {/* Sade Sati Alert */}
        <div className="rounded-xl bg-amber-100/80 border border-amber-300 p-3 text-xs text-amber-950 font-bold leading-relaxed">
          {gocharaTransitAnalysis.sadeSatiStatus[selectedLang] || gocharaTransitAnalysis.sadeSatiStatus.kn}
        </div>
      </Card>

      {/* ====================================================================== */}
      {/* 7. PLANETARY STRENGTH, NEECHA BHANGA & INFLUENCER BENCHMARK           */}
      {/* ====================================================================== */}
      {planetaryStrengthRemedies && (
        <Card className="border border-amber-300 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-amber-200 pb-2">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>💎</span>
              <span>{t.planetaryTitle}</span>
            </h3>
            <p className="text-xs text-amber-900 font-medium mt-0.5">
              {t.planetarySubtitle}
            </p>
          </div>

          {/* Debilitated Planets */}
          {planetaryStrengthRemedies.debilitatedPlanets.length > 0 && (
            <div className="space-y-2.5">
              <div className="font-extrabold text-xs text-rose-950 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{t.debilitatedTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {planetaryStrengthRemedies.debilitatedPlanets.map((dp, idx) => (
                  <div key={idx} className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950 text-sm">
                        {dp.grahaName[selectedLang] || dp.grahaName.kn}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${dp.hasNeechaBhanga ? "bg-emerald-100 text-emerald-800" : "bg-rose-200 text-rose-900"}`}>
                        {dp.hasNeechaBhanga ? t.nbryBadge : t.debilitatedBadge}
                      </span>
                    </div>
                    {dp.neechaBhangaReason && (
                      <p className="text-emerald-900 font-semibold text-[11px] leading-snug">
                        ✨ {dp.neechaBhangaReason[selectedLang] || dp.neechaBhangaReason.kn}
                      </p>
                    )}
                    <p className="text-slate-700 text-[11px] leading-snug">
                      <span className="font-bold text-amber-900">{t.shantiRemedyPrefix}</span> {dp.shantiRemedy[selectedLang] || dp.shantiRemedy.kn}
                    </p>
                    <p className="text-rose-900 font-bold text-[11px] leading-snug bg-rose-100/70 p-1.5 rounded-lg border border-rose-200">
                      🚫 <span className="underline">{t.gemstoneCautionPrefix}</span> {dp.gemstoneCaution[selectedLang] || dp.gemstoneCaution.kn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exalted Planets */}
          {planetaryStrengthRemedies.exaltedPlanets.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <span>⭐</span>
                <span>{t.exaltedTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {planetaryStrengthRemedies.exaltedPlanets.map((ep, idx) => (
                  <div key={idx} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span>{ep.grahaName[selectedLang] || ep.grahaName.kn} ({ep.exaltationSign[selectedLang] || ep.exaltationSign.kn})</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">{t.exaltedBadge}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-snug">
                      <span className="font-bold text-emerald-900">{t.blessingPrefix}</span> {ep.blessingArea[selectedLang] || ep.blessingArea.kn}
                    </p>
                    <p className="text-amber-900 font-bold text-[11px] leading-snug">
                      💡 {t.sadhanaPrefix}{ep.activationRemedy[selectedLang] || ep.activationRemedy.kn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Influencer Benchmark Comparison Box */}
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50/40 p-4 space-y-2 text-xs">
            <div className="font-extrabold text-indigo-950 flex items-center gap-2 text-sm">
              <span>🌐</span>
              <span>{planetaryStrengthRemedies.influencerBenchmarkComparison.title[selectedLang] || planetaryStrengthRemedies.influencerBenchmarkComparison.title.kn}</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {planetaryStrengthRemedies.influencerBenchmarkComparison.insights[selectedLang] || planetaryStrengthRemedies.influencerBenchmarkComparison.insights.kn}
            </p>
            <div className="rounded-xl bg-indigo-900 text-indigo-100 p-3 font-semibold leading-relaxed border border-indigo-400/50">
              💡 {t.influencerAuthenticPrefix}{planetaryStrengthRemedies.influencerBenchmarkComparison.authenticApproach[selectedLang] || planetaryStrengthRemedies.influencerBenchmarkComparison.authenticApproach.kn}
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================== */}
      {/* 8. GOKARNA MAHABALESHWARA TEMPLE REMEDIES & ASHIRVADA                 */}
      {/* ====================================================================== */}
      <Card className="border border-amber-300 bg-gradient-to-b from-white to-amber-50/30 p-5 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
          <span>🪔</span>
          <span>{t.gokarnaSevasTitle}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Temple Seva */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>🕉️</span>
              <span>{t.prescribedSevaTitle}</span>
            </div>
            <div className="font-extrabold text-amber-950">
              {gokarnaTempleRemedies.prescribedSeva.name[selectedLang] || gokarnaTempleRemedies.prescribedSeva.name.kn}
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              {gokarnaTempleRemedies.prescribedSeva.significance[selectedLang] || gokarnaTempleRemedies.prescribedSeva.significance.kn}
            </p>
            <div className="text-[10px] text-amber-800 font-bold pt-1">
              📅 {t.idealDayTitle} {gokarnaTempleRemedies.prescribedSeva.idealDay[selectedLang] || gokarnaTempleRemedies.prescribedSeva.idealDay.kn}
            </div>
          </div>

          {/* Rudraksha & Gemstone */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>📿</span>
              <span>{t.rudrakshaGemstoneTitle}</span>
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              {t.rudrakshaPrefix}{typeof gokarnaTempleRemedies.rudrakshaRecommendation.mukhi === "object"
                ? gokarnaTempleRemedies.rudrakshaRecommendation.mukhi[selectedLang] || gokarnaTempleRemedies.rudrakshaRecommendation.mukhi.kn
                : gokarnaTempleRemedies.rudrakshaRecommendation.mukhi}
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              {t.gemstonePrefix}{gokarnaTempleRemedies.gemstoneRecommendation.stone[selectedLang] || gokarnaTempleRemedies.gemstoneRecommendation.stone.en || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn}
            </div>
            <div className="text-[10px] text-slate-700 pt-1">
              {gokarnaTempleRemedies.rudrakshaRecommendation.benefits[selectedLang] || gokarnaTempleRemedies.rudrakshaRecommendation.benefits.kn}
            </div>
          </div>

          {/* Daana */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <span>🌾</span>
              <span>{t.sacredDanaTitle}</span>
            </div>
            <div className="font-bold text-amber-950 text-[11px]">
              {t.itemPrefix}{gokarnaTempleRemedies.donationDaana.item[selectedLang] || gokarnaTempleRemedies.donationDaana.item.en || gokarnaTempleRemedies.donationDaana.item.kn}
            </div>
            <div className="text-[10px] text-slate-700">
              {t.dayPrefix}{gokarnaTempleRemedies.donationDaana.day[selectedLang] || gokarnaTempleRemedies.donationDaana.day.en || gokarnaTempleRemedies.donationDaana.day.kn}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold pt-1">
              {t.beneficiaryPrefix}{gokarnaTempleRemedies.donationDaana.beneficiary[selectedLang] || gokarnaTempleRemedies.donationDaana.beneficiary.en || gokarnaTempleRemedies.donationDaana.beneficiary.kn}
            </div>
          </div>
        </div>

        {/* Priest Contact Override & Firebase Persistence Control */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/60 to-amber-950/70 border-2 border-amber-500/50 p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
            <div className="flex items-center gap-2 text-amber-200 text-sm font-black">
              <span className="text-xl">📿</span>
              <span>{t.priestSelectionTitle}</span>
            </div>
            <span className="text-[10px] text-amber-300 bg-amber-900/80 px-2.5 py-1 rounded-full border border-amber-500/40 font-bold self-start sm:self-auto">
              {t.firebaseSyncBadge}
            </span>
          </div>

          <p className="text-xs text-amber-100/90 leading-relaxed">
            {t.priestSelectionDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-amber-200 mb-1">
                {t.selectPriestLabel}
              </label>
              <select
                id="remedy-priest-select"
                data-testid="remedy-priest-select"
                value={selectedPriestId}
                onChange={(e) => handlePriestSelect(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-amber-500/50 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {priestsList.map((p) => {
                  const langKey = ((selectedLang as unknown) as SevaLang) || "kn";
                  const pName = (p.name as Record<string, string>)[langKey] || p.name.kn || p.name.en;
                  const pPhone = p.phone ? ` (${p.phone})` : "";
                  return (
                    <option key={p.id} value={p.id}>
                      {pName}{pPhone}
                    </option>
                  );
                })}
                <option value="new_priest">
                  {t.addNewPriestOption}
                </option>
              </select>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-[11px] font-bold text-amber-200 mb-1">
                {t.priestNameLabel}
              </label>
              <input
                id="remedy-priest-name-input"
                data-testid="remedy-priest-name-input"
                type="text"
                value={priestNameInput}
                onChange={(e) => {
                  setPriestNameInput(e.target.value);
                  onPriestChange?.(e.target.value, priestPhoneInput);
                }}
                placeholder={t.priestNamePlaceholder}
                className="w-full rounded-xl bg-slate-900/90 border border-amber-500/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-[11px] font-bold text-amber-200 mb-1">
                {t.priestPhoneLabel}
              </label>
              <div className="flex gap-2">
                <input
                  id="remedy-priest-phone-input"
                  data-testid="remedy-priest-phone-input"
                  type="text"
                  value={priestPhoneInput}
                  onChange={(e) => {
                    setPriestPhoneInput(e.target.value);
                    onPriestChange?.(priestNameInput, e.target.value);
                  }}
                  placeholder="9482109844"
                  className="w-full rounded-xl bg-slate-900/90 border border-amber-500/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  id="save-priest-to-firebase-btn"
                  data-testid="save-priest-to-firebase-btn"
                  onClick={handleSavePriestToDb}
                  disabled={isSavingPriest}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingPriest ? "⏳..." : t.savePriestBtn}
                </button>
              </div>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-bold text-center animate-fade-in shadow-md">
              {saveSuccessMsg}
            </div>
          )}
        </div>

        {/* Chief Priest Blessing Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400">
          <div className="space-y-1">
            <div className="text-xs font-black text-amber-200">
              🙏 {priestNameInput || chiefPriestBlessing.priestName[selectedLang] || chiefPriestBlessing.priestName.kn}
            </div>
            <div className="text-[10px] text-amber-100/90">
              {chiefPriestBlessing.priestTitle[selectedLang] || chiefPriestBlessing.priestTitle.kn} · {priestPhoneInput || chiefPriestBlessing.phone}
            </div>
            <p className="text-xs text-amber-100 font-serif italic pt-1 leading-relaxed">
              "{chiefPriestBlessing.ashirvadaMeaning[selectedLang] || chiefPriestBlessing.ashirvadaMeaning.kn}"
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 border-2 border-dashed border-amber-400 rounded-full w-16 h-16 bg-amber-800/40 text-[8px] font-black text-amber-200 text-center px-1">
            <span className="text-base">🕉️</span>
            <span>{t.templeSealBadge}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
