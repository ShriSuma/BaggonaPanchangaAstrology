/**
 * 5-Language Native Localization Engine for Devotee Package Download Center
 * Pure native script translations for Kannada, English, Hindi, Telugu, and Tamil.
 * Complies with baggona-public-kundli-pure-locale-guard (Zero English token leakage).
 */

export type PackageLang = "kn" | "en" | "hi" | "te" | "ta";

export interface PackageLocaleDict {
  pageTitle: string;
  pageSubtitle: string;
  selectLanguage: string;
  devoteeDetailsTitle: string;
  devoteeDetailsSubtitle: string;
  useCurrentKundliBtn: string;
  devoteeNameLabel: string;
  genderLabel: string;
  male: string;
  female: string;
  dobLabel: string;
  tobLabel: string;
  pobLabel: string;
  gotraLabel: string;
  calculatedKundliBadge: string;
  lagnaLabel: string;
  rashiLabel: string;
  nakshatraLabel: string;
  priestAndPoojaTitle: string;
  priestAndPoojaSubtitle: string;
  priestNameLabel: string;
  priestPhoneLabel: string;
  poojaNameLabel: string;
  poojaPlaceLabel: string;
  defaultPriestName: string;
  defaultPriestPhone: string;
  defaultPoojaName: string;
  defaultPoojaPlace: string;
  divyaBhavishyaTitle: string;
  divyaBhavishyaSubtitle: string;
  questionModeLabel: string;
  singleQuestionMode: string;
  multiQuestionMode: string;
  selectTopicLabel: string;
  customQuestionLabel: string;
  customQuestionPlaceholder: string;
  voiceInputTitle: string;
  addQuestionBtn: string;
  removeQuestionBtn: string;
  generateAnswersBtn: string;
  generatingAnswersText: string;
  answersReadyBadge: string;
  packageContentsTitle: string;
  packageContentsSubtitle: string;
  item1Title: string;
  item1Desc: string;
  item2Title: string;
  item2Desc: string;
  item3Title: string;
  item3Desc: string;
  item4Title: string;
  item4Desc: string;
  item5Title: string;
  item5Desc: string;
  item6Title: string;
  item6Desc: string;
  item7Title: string;
  item7Desc: string;
  downloadSinglePdfBtn: string;
  downloadQrPngsBtn: string;
  previewBtn: string;
  downloadZipBtn: string;
  downloadZipSubtitle: string;
  packagingZipProgress: string;
  zipCompleteTitle: string;
  zipCompleteDesc: string;
  closeBtn: string;
  topics: {
    career: { label: string; sample: string };
    marriage: { label: string; sample: string };
    wealth: { label: string; sample: string };
    children: { label: string; sample: string };
    house: { label: string; sample: string };
    foreign: { label: string; sample: string };
    health: { label: string; sample: string };
    general: { label: string; sample: string };
  };
  qrTitles: {
    day30: string;
    day90: string;
    day120: string;
    scanInstructions: string;
    androidStep: string;
    iosStep: string;
  };
  currentLifeTitles: {
    runningDasha: string;
    liveGochara: string;
    immediateForecast: string;
    remediesTitle: string;
  };
}

export const PACKAGE_LOCALES: Record<PackageLang, PackageLocaleDict> = {
  kn: {
    pageTitle: "॥ ಬಗ್ಗೋಣ ಸಮಗ್ರ ಜಾತಕ, ದೈವಿಕ ಪರಿಹಾರ & ದೇವತಾ ಪ್ರಸಾದ ಡೌನ್‌ಲೋಡ್ ಕೇಂದ್ರ ॥",
    pageSubtitle: "ಜಾತಕರ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1, ದೈವಿಕ ಪರಿಹಾರ, ದೋಷಗಳು, ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ, ೩೦/೯೦/೧೨೦ ದಿನಗಳ ಕ್ಯೂಆರ್ ಕೋಡ್ & ದಿವ್ಯ ಭವಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರಗಳನ್ನು ಒಂದೇ ಜಿಪ್ ಕಡತವಾಗಿ ಪಡೆಯಿರಿ.",
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ (Select Language):",
    devoteeDetailsTitle: "೧. ಜಾತಕರ ವಿವರ ಹಾಗೂ ಜನನ ವಿವರ",
    devoteeDetailsSubtitle: "ನಿಖರ ಫಲಗಣನೆಗೆ ಜಾತಕರ ಜನನ ದಿನಾಂಕ, ಸಮಯ ಹಾಗೂ ಸ್ಥಳ ದಾಖಲಿಸಿ.",
    useCurrentKundliBtn: "✨ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಜಾತಕದ ವಿವರಗಳನ್ನು ಭರ್ತಿಮಾಡಿ",
    devoteeNameLabel: "ಜಾತಕರ ಹೆಸರು:",
    genderLabel: "ಲಿಂಗ:",
    male: "ಪುರುಷ",
    female: "ಸ್ತ್ರೀ",
    dobLabel: "ಜನನ ದಿನಾಂಕ:",
    tobLabel: "ಜನನ ಸಮಯ:",
    pobLabel: "ಜನನ ಸ್ಥಳ:",
    gotraLabel: "ಗೋತ್ರ:",
    calculatedKundliBadge: "ಖಚಿತ ಗಣಿತ ಜಾತಕ ವಿವರಗಳು",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ಚಂದ್ರ ರಾಶಿ:",
    nakshatraLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ:",
    priestAndPoojaTitle: "೨. ಪುರೋಹಿತರು & ಪೂಜಾ ಸಂಕಲ್ಪ ವಿವರ",
    priestAndPoojaSubtitle: "ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಹಾಗೂ ಆಶೀರ್ವಾದ ಪತ್ರದಲ್ಲಿ ಮುದ್ರಿತವಾಗುವ ಪುರೋಹಿತರು & ಪೂಜಾ ಸ್ಥಳದ ವಿವರ.",
    priestNameLabel: "ಪುರೋಹಿತರ ಹೆಸರು:",
    priestPhoneLabel: "ಪುರೋಹಿತರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ:",
    poojaNameLabel: "ಪೂಜಾ ಸಂಕಲ್ಪ ವಿವರ:",
    poojaPlaceLabel: "ಪೂಜೆ ನೆರವೇರುವ ಪವಿತ್ರ ಕ್ಷೇತ್ರ:",
    defaultPriestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    defaultPriestPhone: "9972339362",
    defaultPoojaName: "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹೋಮ, ನವಗ್ರಹ ಶಾಂತಿ & ರುದ್ರಾಭಿಷೇಕ ಪೂಜೆ",
    defaultPoojaPlace: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ",
    divyaBhavishyaTitle: "೩. ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ - ಪ್ರಶ್ನೋತ್ತರ ವೇದಿಕೆ",
    divyaBhavishyaSubtitle: "ಏಕ ಪ್ರಶ್ನೆ ಅಥವಾ ಬಹು ಪ್ರಶ್ನೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಜಾತಕ ಆಧಾರಿತ ೪-ಹಂತದ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.",
    questionModeLabel: "ಪ್ರಶ್ನೆ ವಿಧಾನ:",
    singleQuestionMode: "ಏಕ ಪ್ರಶ್ನೆ (Single Question)",
    multiQuestionMode: "ಬಹು ಪ್ರಶ್ನೆಗಳು (Multi-Questions)",
    selectTopicLabel: "ಪ್ರಶ್ನೆಯ ವಿಷಯ:",
    customQuestionLabel: "ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ:",
    customQuestionPlaceholder: "ಉದಾಹರಣೆಗೆ: ನನಗೆ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಯಾವಾಗ ಸಿಗಲಿದೆ? ಅಥವಾ ಗೃಹ ನಿರ್ಮಾಣ ಯೋಗ ಯಾವಾಗ?",
    voiceInputTitle: "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    addQuestionBtn: "+ ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ ಸೇರಿಸಿ",
    removeQuestionBtn: "ತೆಗೆದುಹಾಕಿ",
    generateAnswersBtn: "🔮 ದಿವ್ಯ ಭವಿಷ್ಯ ಉತ್ತರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ",
    generatingAnswersText: "ಗ್ರಹ ಸ್ಥಿತಿ ಹಾಗೂ ದಶಾಕಾಲವನ್ನು ಪರಿಶೀಲಿಸಿ ಉತ್ತರ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    answersReadyBadge: "ಉತ್ತರಗಳು ಸಿದ್ಧವಾಗಿವೆ!",
    packageContentsTitle: "೪. ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಸಿದ್ಧವಿರುವ ೭ ಮಹಾ ಸಂಪುಟಗಳು",
    packageContentsSubtitle: "ಕೆಳಗಿನ ಪ್ರತಿಯೊಂದು ವರದಿಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಅಥವಾ ಎಲ್ಲವನ್ನೂ ಒಂದೇ ಜಿಪ್ ಕಡತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.",
    item1Title: "೧. ಜನನ ಕುಂಡಲಿ (Janana Kundali)",
    item1Desc: "ಸಂಪೂರ್ಣ ಜಾತಕ ಚಕ್ರ (ದಕ್ಷಿಣ/ಉತ್ತರ ಭಾರತ ಶೈಲಿ), ೯ ಗ್ರಹಗಳ ಸ್ಪಷ್ಟ ಸ್ಫುಟ ಕೋಷ್ಟಕ, ಲಗ್ನ, ನವಾಂಶ ಹಾಗೂ ದಶಾ ಭುಕ್ತಿ ಶಿಷ್ಟ.",
    item2Title: "೨. ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 (Premium PDF V1)",
    item2Desc: "ಅಧಿಕೃತ ೧೦-ಅಧ್ಯಾಯಗಳ ಸಮಗ್ರ ಜೀವನ ಭವಿಷ್ಯ, ಯೋಗಗಳು, ಭಾವ ಫಲಗಳು ಹಾಗೂ ಜೀವಮಾನದ ವಿಸ್ತೃತ ವಿಶ್ಲೇಷಣೆ.",
    item3Title: "೩. ದೈವಿಕ ಪರಿಹಾರ (Daivika Parihara)",
    item3Desc: "ಗ್ರಹ ಪೀಡಾ ಶಮನ ಪೂಜೆಗಳು, ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರಗಳು, ಬೀಜ ಮಂತ್ರಗಳು, ಪವಿತ್ರ ಕ್ಷೇತ್ರ ದರ್ಶನ, ರುದ್ರಾಕ್ಷಿ, ರತ್ನ ಹಾಗೂ ದಾನ ಮಾರ್ಗದರ್ಶನ.",
    item4Title: "೪. ಸಮಗ್ರ ದೋಷಗಳು (Doshagalu & Shanti)",
    item4Desc: "ಕುಜ ದೋಷ, ಕಾಳಸರ್ಪ ದೋಷ, ಪಿತೃ ದೋಷ, ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ಶನಿ), ಗ್ರಹಣ ದೋಷ, ಗಂಡಾಂತರ ಸಂರಕ್ಷಣೆ & ಮನೋಭಯ ಶಮನ.",
    item5Title: "೫. ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ (Current Life Status & Gochara)",
    item5Desc: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ, ಲೈವ್ ಗುರು-ಶನಿ-ರಾಹು-ಕೇತು ಗೋಚಾರ ಪ್ರಭಾವ, ಚಂದ್ರಬಲ-ತಾರಾಬಲ & ಮುಂದಿನ ೬-೧೨ ತಿಂಗಳ ಮಾರ್ಗದರ್ಶನ.",
    item6Title: "೬. ೩೦, ೯೦ & ೧೨೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್‌ಗಳು",
    item6Desc: "ಪುರೋಹಿತರ ಹೆಸರು, ಫೋನ್ ಸಂಖ್ಯೆ, ಪೂಜಾ ವಿವರ ಹಾಗೂ ಪೂಜಾ ಸ್ಥಳ ಸಹಿತ ೩ ಪ್ರತ್ಯೇಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದಾದ ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್‌ಗಳು.",
    item7Title: "೭. ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ವರದಿ",
    item7Desc: "ಆಯ್ಕೆಮಾಡಿದ ಏಕ ಅಥವಾ ಬಹು ಪ್ರಶ್ನೆಗಳಿಗೆ ಶಾಸ್ತ್ರೀಯ ಭಾವ, ದಶಾ, ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ ಹಾಗೂ ಪರಿಹಾರ ಸಹಿತ ಸಮಗ್ರ ಲಿಖಿತ ಉತ್ತರ ಪತ್ರ.",
    downloadSinglePdfBtn: "ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ⬇️",
    downloadQrPngsBtn: "ಕ್ಯೂಆರ್ ಚಿತ್ರಗಳು (PNG) ⬇️",
    previewBtn: "ವೀಕ್ಷಿಸಿ 👁️",
    downloadZipBtn: "📦 ಸಮಗ್ರ ಜಿಪ್ ಕಡತ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download All in 1 ZIP)",
    downloadZipSubtitle: "ಮೇಲಿನ ಎಲ್ಲಾ ೭ ಪಿಡಿಎಫ್‌ಗಳು ಮತ್ತು ೩ ಹೈ-ರೆಸಲ್ಯೂಶನ್ ಕ್ಯೂಆರ್ ಚಿತ್ರಗಳನ್ನು ಒಳಗೊಂಡ ಒಂದೇ ಸುಲಭ ಜಿಪ್ ಕಡತ.",
    packagingZipProgress: "ವರದಿಗಳನ್ನು ರಚಿಸಿ ಜಿಪ್ ಕಡತವಾಗಿ ಸಂಯೋಜಿಸಲಾಗುತ್ತಿದೆ...",
    zipCompleteTitle: "🎉 ಸಮಗ್ರ ಸಂಪುಟ ಡೌನ್‌ಲೋಡ್ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    zipCompleteDesc: "ಎಲ್ಲಾ ಅಧಿಕೃತ ವರದಿಗಳು ಮತ್ತು ಕ್ಯೂಆರ್ ಚಿತ್ರಗಳನ್ನು ಒಳಗೊಂಡ ಜಿಪ್ ಕಡತ ನಿಮ್ಮ ಸಾಧನಕ್ಕೆ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ.",
    closeBtn: "ಮುಚ್ಚಿ (Close)",
    topics: {
      career: { label: "ಉದ್ಯೋಗ & ವೃತ್ತಿ ಏಳಿಗೆ", sample: "ನನಗೆ ಪ್ರಸ್ತುತ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಹಾಗೂ ಉತ್ತಮ ಆರ್ಥಿಕ ಪ್ರಗತಿ ಯಾವಾಗ ಲಭಿಸಲಿದೆ?" },
      marriage: { label: "ವಿವಾಹ & ಸಂಗಾತಿ", sample: "ನನ್ನ ವಿವಾಹ ಕಾಲ ಯಾವಾಗ ಕೂಡಿಬರಲಿದೆ ಮತ್ತು ಸಂಗಾತಿಯ ಸ್ವಭಾವ ಹೇಗಿರಲಿದೆ?" },
      wealth: { label: "ಧನ ಸಂಪತ್ತು & ಹೂಡಿಕೆ", sample: "ನನ್ನ ಆರ್ಥಿಕ ಪರಿಸ್ಥಿತಿ ಯಾವಾಗ ಸುಧಾರಿಸಲಿದೆ ಮತ್ತು ಹೂಡಿಕೆಯಲ್ಲಿ ಲಾಭ ಯಾವಾಗ?" },
      children: { label: "ಸಂತಾನ ಭಾಗ್ಯ & ಮಕ್ಕಳು", sample: "ನನಗೆ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ಯೋಗ ಯಾವಾಗ ಮತ್ತು ಮಕ್ಕಳ ಆರೋಗ್ಯ ಹೇಗಿರಲಿದೆ?" },
      house: { label: "ಗೃಹ & ಆಸ್ತಿ ಖರೀದಿ", sample: "ನಾನು ಸ್ವಂತ ಮನೆ ಅಥವಾ ಭೂಮಿ ಖರೀದಿಸುವ ಶುಭ ಯೋಗ ಯಾವಾಗ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ?" },
      foreign: { label: "ವಿದೇಶ ಯಾನ & ಸ್ಥಳಾಂತರ", sample: "ನನಗೆ ವಿದೇಶ ಪ್ರಯಾಣ, ವೀಸಾ ಪ್ರಾಪ್ತಿ ಅಥವಾ ಬೇರೆ ಊರಿಗೆ ಸ್ಥಳಾಂತರ ಯೋಗವಿದೆಯೇ?" },
      health: { label: "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ", sample: "ನನ್ನ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಶಮನಗೊಳ್ಳಲು ಯಾವ ದೈವಿಕ ಪರಿಹಾರವನ್ನು ಆಚರಿಸಬೇಕು?" },
      general: { label: "ವೈಯಕ್ತಿಕ ಜಾತಕ ವಿಚಾರಣೆ", sample: "ನನ್ನ ಜೀವನದ ಪ್ರಸ್ತುತ ಸಂಕಷ್ಟಗಳು ದೂರವಾಗಿ ಮನಃಶಾಂತಿ ಲಭಿಸಲು ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ." }
    },
    qrTitles: {
      day30: "೩೦-ದಿನಗಳ ದೈನಂದಿನ ಶುಭ ಮುಹೂರ್ತ ಕ್ಯಾಲೆಂಡರ್",
      day90: "೯೦-ದಿನಗಳ ಮಹಾ ದೈವಿಕ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್",
      day120: "೧೨೦-ದಿನಗಳ ದೀರ್ಘಾವಧಿ ಸಾಧನಾ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್",
      scanInstructions: "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸುಲಭ ವಿಧಾನ:",
      androidStep: "Android: Google Lens ಅಥವಾ ಕ್ಯಾಮೆರಾ ತೆರೆದು ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
      iosStep: "iPhone: ಕ್ಯಾಮೆರಾ ತೆರೆದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, 'Add to Calendar' ಆಯ್ಕೆಮಾಡಿ."
    },
    currentLifeTitles: {
      runningDasha: "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ ಹಾಗೂ ಅಂತರ್ದಶೆ",
      liveGochara: "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಗಳ ಸ್ಥಿತಿ (ಪ್ರಸ್ತುತ ಆಕಾಶ)",
      immediateForecast: "ಮುಂದಿನ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ಜೀವನ ಭವಿಷ್ಯ",
      remediesTitle: "ಪ್ರಸ್ತುತ ಹಂತಕ್ಕೆ ತಕ್ಷಣ ಆಚರಿಸಬೇಕಾದ ದೈವಿಕ ಪರಿಹಾರಗಳು"
    }
  },

  en: {
    pageTitle: "॥ Baggona Devotee Astrology, Divine Remedies & Prasad Download Portal ॥",
    pageSubtitle: "Download Janana Kundali, Premium Bhavishya V1, Daivika Parihara, Doshagalu, Current Life Status, 30/90/120-Day QR Codes & Divya Bhavishya Q&A in a single ZIP bundle.",
    selectLanguage: "Select Language (ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ):",
    devoteeDetailsTitle: "1. Devotee Profile & Birth Details",
    devoteeDetailsSubtitle: "Enter birth details for astronomical chart precision.",
    useCurrentKundliBtn: "✨ Load Active Kundli Devotee",
    devoteeNameLabel: "Devotee Name:",
    genderLabel: "Gender:",
    male: "Male",
    female: "Female",
    dobLabel: "Date of Birth:",
    tobLabel: "Time of Birth:",
    pobLabel: "Place of Birth:",
    gotraLabel: "Gotra:",
    calculatedKundliBadge: "Computed Astrological Attributes",
    lagnaLabel: "Ascendant (Lagna):",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Birth Star (Nakshatra):",
    priestAndPoojaTitle: "2. Priest & Sacred Pooja Configuration",
    priestAndPoojaSubtitle: "Details embedded into calendar QR codes, sankalpa, and printed blessing cards.",
    priestNameLabel: "Priest Name:",
    priestPhoneLabel: "Priest Phone Number:",
    poojaNameLabel: "Pooja Details:",
    poojaPlaceLabel: "Pooja Place / Sacred Kshetra:",
    defaultPriestName: "Shreeram Pandit",
    defaultPriestPhone: "9972339362",
    defaultPoojaName: "Sri Mahaganapathi Homa, Navagraha Shanti & Rudrabhisheka Pooja",
    defaultPoojaPlace: "Sri Kshetra Gokarna Mahabaleshwara Temple Sannidhi",
    divyaBhavishyaTitle: "3. Baggona Divya Bhavishya - Astrological Q&A Studio",
    divyaBhavishyaSubtitle: "Select single or multi-question mode to receive comprehensive 4-paragraph Vedic astrological answers.",
    questionModeLabel: "Question Mode:",
    singleQuestionMode: "Single Question",
    multiQuestionMode: "Multi-Questions",
    selectTopicLabel: "Inquiry Topic:",
    customQuestionLabel: "Your Specific Question:",
    customQuestionPlaceholder: "e.g. When will I receive a job promotion and financial increment?",
    voiceInputTitle: "Ask question using voice",
    addQuestionBtn: "+ Add Another Question",
    removeQuestionBtn: "Remove",
    generateAnswersBtn: "🔮 Generate Divine Vedic Answers",
    generatingAnswersText: "Analyzing birth chart placements, dasha cycles, and planetary transits...",
    answersReadyBadge: "Answers Ready!",
    packageContentsTitle: "4. Seven Authentic Dossiers Available for Download",
    packageContentsSubtitle: "Download each dossier individually or package everything into a single master ZIP file.",
    item1Title: "1. Janana Kundali (Birth Chart)",
    item1Desc: "Full natal birth chart (South/North style), 9 planetary sphuta table, Lagna, Navamsha, and Dasha balance.",
    item2Title: "2. Premium Bhavishya V1 (Master Reading)",
    item2Desc: "Authentic 10-chapter life prediction report, yogas, house significations, and lifelong Vedic guidance.",
    item3Title: "3. Daivika Parihara (Divine Remedies)",
    item3Desc: "Graha pacification poojas, sacred stotras, beeja mantras, temple pilgrimages, rudraksha, gemstones & daana.",
    item4Title: "4. Doshagalu (Comprehensive Afflictions & Shanti)",
    item4Desc: "Kuja Dosha, Kala Sarpa, Pitru Dosha, Shani Sade Sati, Grahan Dosha, Gandantara age thresholds & phobia healing.",
    item5Title: "5. Currently What Is Happening in Life (Gochara & Dasha)",
    item5Desc: "Real-time Mahadasha-Antardasha, live transits of Jupiter/Saturn/Rahu/Ketu, Chandra Bala & 6-12 month outlook.",
    item6Title: "6. QR Codes for 30, 90 & 120-Day Daily Calendars",
    item6Desc: "3 separate scannable Google Calendar QR codes embedded with Priest name, phone, pooja details, and venue.",
    item7Title: "7. Baggona Divya Bhavishya Q&A Report",
    item7Desc: "Comprehensive dossier containing selected single/multi questions with 4-paragraph detailed astrological answers.",
    downloadSinglePdfBtn: "Download PDF ⬇️",
    downloadQrPngsBtn: "QR Images (PNG) ⬇️",
    previewBtn: "Preview 👁️",
    downloadZipBtn: "📦 Download Everything in 1 ZIP File",
    downloadZipSubtitle: "Includes all 7 detailed PDF reports and 3 high-resolution QR PNG files in a single organized zip archive.",
    packagingZipProgress: "Generating PDFs and bundling into ZIP archive...",
    zipCompleteTitle: "🎉 Master Package Downloaded Successfully!",
    zipCompleteDesc: "All 7 reports and calendar QR codes have been packaged and downloaded to your device.",
    closeBtn: "Close",
    topics: {
      career: { label: "Career & Job Promotion", sample: "When will I secure a career promotion and financial growth?" },
      marriage: { label: "Marriage & Spouse Nature", sample: "What is my marriage timing window and what will my spouse's nature be?" },
      wealth: { label: "Wealth & Financial Gains", sample: "When will my financial position strengthen and investments yield returns?" },
      children: { label: "Children & Progeny Blessings", sample: "What does my chart indicate regarding progeny timing and children's wellbeing?" },
      house: { label: "House & Property Acquisition", sample: "When is the auspicious window to purchase my own house, flat, or land?" },
      foreign: { label: "Foreign Travel & Relocation", sample: "Do I have yogas for foreign travel, visa approval, or long-distance relocation?" },
      health: { label: "Health & Longevity Remedies", sample: "What Vedic remedies and lifestyle practices are recommended for my health stability?" },
      general: { label: "Personalized Astrological Query", sample: "Kindly provide spiritual and practical guidance for my present life phase." }
    },
    qrTitles: {
      day30: "30-Day Auspicious Daily Calendar",
      day90: "90-Day Royal Devotional Panchanga Calendar",
      day120: "120-Day Extended Sadhana Panchanga Calendar",
      scanInstructions: "How to Sync Calendar to Mobile:",
      androidStep: "Android: Open Google Lens or Camera app and point at the QR code.",
      iosStep: "iPhone: Open Camera app and tap the detected link to add to Calendar."
    },
    currentLifeTitles: {
      runningDasha: "Current Running Mahadasha & Antardasha",
      liveGochara: "Real-Time Gochara Transits (Current Planetary Positions)",
      immediateForecast: "Strategic 6 to 12-Month Life Outlook",
      remediesTitle: "Immediate Divine Remedies & Sadhana for Current Phase"
    }
  },

  hi: {
    pageTitle: "॥ बग्गोण समग्र जातक, दैविक समाधान एवं देव प्रसादम डाउनलोड केंद्र ॥",
    pageSubtitle: "जातक की जन्म कुंडली, प्रीमियम भविष्य V1, दैविक समाधान, दोष निर्णय, वर्तमान जीवन स्थिति, ३०/९०/१२० दिनों का क्यूआर कोड एवं दिव्य भविष्य प्रश्नोत्तर एक ही ज़िप फाइल में प्राप्त करें।",
    selectLanguage: "भाषा चुनें (Select Language):",
    devoteeDetailsTitle: "१. जातक विवरण एवं जन्म विवरण",
    devoteeDetailsSubtitle: "सटीक गणना हेतु जातक की जन्म तिथि, समय एवं स्थान दर्ज करें।",
    useCurrentKundliBtn: "✨ सक्रिय कुंडली विवरण भरें",
    devoteeNameLabel: "जातक का नाम:",
    genderLabel: "लिंग:",
    male: "पुरुष",
    female: "महिला",
    dobLabel: "जन्म तिथि:",
    tobLabel: "जन्म समय:",
    pobLabel: "जन्म स्थान:",
    gotraLabel: "गोत्र:",
    calculatedKundliBadge: "गणना की गई ज्योतिषीय स्थिति",
    lagnaLabel: "लग्न:",
    rashiLabel: "चंद्र राशि:",
    nakshatraLabel: "जन्म नक्षत्र:",
    priestAndPoojaTitle: "२. पुरोहित एवं पूजा संकल्प विवरण",
    priestAndPoojaSubtitle: "कैलेंडर क्यूआर कोड एवं आशीर्वाद पत्र में मुद्रित होने वाले पुरोहित व पूजा स्थल का विवरण।",
    priestNameLabel: "पुरोहित का नाम:",
    priestPhoneLabel: "पुरोहित का मोबाइल नंबर:",
    poojaNameLabel: "पूजा संकल्प विवरण:",
    poojaPlaceLabel: "पूजा का पावन क्षेत्र:",
    defaultPriestName: "श्रीराम पंडित",
    defaultPriestPhone: "9972339362",
    defaultPoojaName: "श्री महागणपति होम, नवग्रह शांति एवं रुद्राभिषेक पूजा",
    defaultPoojaPlace: "श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधान",
    divyaBhavishyaTitle: "३. बग्गोण दिव्य भविष्य - प्रश्नोत्तर मंच",
    divyaBhavishyaSubtitle: "एकल प्रश्न अथवा बहु-प्रश्न चुनें, जातक आधारित ४-चरणीय प्रामाणिक ज्योतिषीय उत्तर प्राप्त करें।",
    questionModeLabel: "प्रश्न विधा:",
    singleQuestionMode: "एकल प्रश्न (Single Question)",
    multiQuestionMode: "बहु-प्रश्न (Multi-Questions)",
    selectTopicLabel: "प्रश्न का विषय:",
    customQuestionLabel: "आपका विशिष्ट प्रश्न:",
    customQuestionPlaceholder: "उदाहरण: मुझे नौकरी में पदोन्नति और आर्थिक लाभ कब प्राप्त होगा?",
    voiceInputTitle: "आवाज से प्रश्न पूछें",
    addQuestionBtn: "+ अन्य प्रश्न जोड़ें",
    removeQuestionBtn: "हटाएं",
    generateAnswersBtn: "🔮 दिव्य भविष्य उत्तर तैयार करें",
    generatingAnswersText: "ग्रह स्थिति एवं दशा काल का विश्लेषण कर उत्तर तैयार किया जा रहा है...",
    answersReadyBadge: "उत्तर तैयार हैं!",
    packageContentsTitle: "४. डाउनलोड हेतु उपलब्ध ७ प्रमुख रिपोर्ट",
    packageContentsSubtitle: "प्रत्येक रिपोर्ट को अलग से अथवा सभी को एक साथ ज़िप बंडल में डाउनलोड करें।",
    item1Title: "१. जन्म कुंडली (Janana Kundali)",
    item1Desc: "पूर्ण जन्म चक्र (दक्षिण/उत्तर शैली), ९ ग्रहों की स्पष्ट स्फुट तालिका, लग्न, नवांश एवं दशा भुक्ति शेष।",
    item2Title: "२. प्रीमियम भविष्य V1 (Premium PDF V1)",
    item2Desc: "आधिकारिक १०-अध्यायों की संपूर्ण जीवन भविष्यवाणी, योग, भाव फल एवं आजीवन वैदिक मार्गदर्शन।",
    item3Title: "३. दैविक समाधान (Daivika Parihara)",
    item3Desc: "ग्रह शांति पूजा, शास्त्रोक्त स्तोत्र, बीज मंत्र, तीर्थ दर्शन, रुद्राक्ष, रत्न एवं दान निर्देश।",
    item4Title: "४. समग्र दोष एवं शांति (Doshagalu & Shanti)",
    item4Desc: "कुज दोष, कालसर्प दोष, पितृ दोष, साढ़े साती (शनि), ग्रहण दोष, गंडांतर सुरक्षा एवं मनोभय शमन।",
    item5Title: "೫. वर्तमान जीवन स्थिति (Current Life Status & Gochara)",
    item5Desc: "वर्तमान महादशा-अंतर्दशा, लाइव गुरु-शनि-राहु-केतु गोचर प्रभाव, चंद्रबल एवं आगामी ६-१२ माह का मार्गदर्शन।",
    item6Title: "೬. ३०, ९० एवं १२० दिनों के कैलेंडर क्यूआर कोड",
    item6Desc: "पुरोहित नाम, फोन नंबर, पूजा विवरण एवं स्थान सहित ३ अलग-अलग स्कैन योग्य गूगल कैलेंडर क्यूआर कोड।",
    item7Title: "७. बग्गोण दिव्य भविष्य प्रश्नोत्तर रिपोर्ट",
    item7Desc: "चयनित एकल/बहु प्रश्नों के भाव, दशा, सटीक समय सिद्धि एवं समाधान सहित विस्तृत लिखित उत्तर।",
    downloadSinglePdfBtn: "पीडीएफ डाउनलोड ⬇️",
    downloadQrPngsBtn: "क्यूआर चित्र (PNG) ⬇️",
    previewBtn: "देखें 👁️",
    downloadZipBtn: "📦 संपूर्ण ज़िप फाइल डाउनलोड करें (Download All in 1 ZIP)",
    downloadZipSubtitle: "उपरोक्त सभी ७ पीडीएफ और ३ उच्च-रिज़ॉल्यूशन क्यूआर चित्रों से युक्त एकल ज़िप संग्रह।",
    packagingZipProgress: "रिपोर्ट तैयार कर ज़िप बंडल बनाया जा रहा है...",
    zipCompleteTitle: "🎉 समग्र पैकेज सफलतापूर्वक डाउनलोड हुआ!",
    zipCompleteDesc: "सभी आधिकारिक रिपोर्ट और क्यूआर कोड आपके डिवाइस पर डाउनलोड हो चुके हैं।",
    closeBtn: "बंद करें (Close)",
    topics: {
      career: { label: "करियर एवं नौकरी पदोन्नति", sample: "मुझे वर्तमान नौकरी में पदोन्नति एवं आर्थिक उन्नति कब प्राप्त होगी?" },
      marriage: { label: "विवाह एवं जीवनसाथी", sample: "मेरा विवाह कब होगा और जीवनसाथी का स्वभाव कैसा रहेगा?" },
      wealth: { label: "धन संपत्ति एवं निवेश", sample: "मेरी आर्थिक स्थिति कब सुदृढ़ होगी और निवेश में लाभ कब मिलेगा?" },
      children: { label: "संतान योग एवं बच्चे", sample: "संतान प्राप्ति का शुभ योग कब है और बच्चों का स्वास्थ्य कैसा रहेगा?" },
      house: { label: "गृह एवं भूमि क्रय", sample: "स्वयं का घर या जमीन खरीदने का शुभ योग कब प्राप्त होगा?" },
      foreign: { label: "विदेश यात्रा एवं स्थानांतरण", sample: "क्या मेरी कुंडली में विदेश यात्रा अथवा वीज़ा प्राप्ति का योग है?" },
      health: { label: "स्वास्थ्य एवं आरोग्य", sample: "स्वास्थ्य समस्याओं के निवारण हेतु कौन से वैदिक उपाय करने चाहिए?" },
      general: { label: "व्यक्तिगत जातक प्रश्न", sample: "जीवन में शांति एवं प्रगति हेतु उपयुक्त आध्यात्मिक व व्यावहारिक मार्गदर्शन दें।" }
    },
    qrTitles: {
      day30: "३०-दिनों का दैनिक शुभ मुहूर्त कैलेंडर",
      day90: "९०-दिनों का महा पंचांग कैलेंडर",
      day120: "१२०-दिनों का साधना पंचांग कैलेंडर",
      scanInstructions: "कैलेंडर सिंक करने के सरल चरण:",
      androidStep: "Android: Google Lens या कैमरा खोलकर क्यूआर कोड स्कैन करें।",
      iosStep: "iPhone: कैमरा खोलकर स्कैन करें और 'Add to Calendar' चुनें।"
    },
    currentLifeTitles: {
      runningDasha: "वर्तमान सक्रिय महादशा एवं अंतर्दशा",
      liveGochara: "लाइव गोचर ग्रहों की स्थिति",
      immediateForecast: "आगामी ६ से १२ माह का सामरिक जीवन दृष्टिकोण",
      remediesTitle: "वर्तमान चरण हेतु तत्काल करने योग्य दैविक उपाय"
    }
  },

  te: {
    pageTitle: "॥ బగ్గోణ సమగ్ర జాతకం, దైవిక పరిహారాలు & దేవతా ప్రసాద డౌన్‌లోడ్ కేంద్రం ॥",
    pageSubtitle: "జాతకుల జన్మ కుండలి, ప్రీమియం భవిష్యత్తు V1, దైవిక పరిహారాలు, దోషాలు, ప్రస్తుత జీవిత స్థితి, 30/90/120 రోజుల క్యూఆర్ కోడ్‌లు & దివ్య భవిష్య ప్రశ్న సమాధానాలు ఒకే జిప్ ఫైల్‌లో పొందండి.",
    selectLanguage: "భాషను ఎంచుకోండి (Select Language):",
    devoteeDetailsTitle: "1. జాతకుల వివరాలు & జనన వివరాలు",
    devoteeDetailsSubtitle: "ఖచ్చితమైన గణన కోసం పుట్టిన తేదీ, సమయం మరియు స్థలం నమోదు చేయండి.",
    useCurrentKundliBtn: "✨ సక్రియ కుండలి వివరాలు నింపండి",
    devoteeNameLabel: "జాతకుల పేరు:",
    genderLabel: "లింగం:",
    male: "పురుషుడు",
    female: "స్త్రీ",
    dobLabel: "పుట్టిన తేదీ:",
    tobLabel: "పుట్టిన సమయం:",
    pobLabel: "పుట్టిన స్థలం:",
    gotraLabel: "గోత్రం:",
    calculatedKundliBadge: "గణించిన జ్యోతిష్య వివరాలు",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "చంద్ర రాశి:",
    nakshatraLabel: "జన్మ నక్షత్రం:",
    priestAndPoojaTitle: "2. పురోహితులు & పూజా సంకల్ప వివరాలు",
    priestAndPoojaSubtitle: "క్యాలెండర్ క్యూఆర్ కోడ్ మరియు ఆశీర్వాద పత్రంలో ముద్రించబడే పురోహితులు & పూజా స్థల వివరాలు.",
    priestNameLabel: "పురోహితుల పేరు:",
    priestPhoneLabel: "పురోహితుల ఫోన్ నంబర్:",
    poojaNameLabel: "పూజా సంకల్ప వివరాలు:",
    poojaPlaceLabel: "పూజ జరిగే పవిత్ర క్షేత్రం:",
    defaultPriestName: "శ్రీరామ్ పండితులు",
    defaultPriestPhone: "9972339362",
    defaultPoojaName: "శ్రీ మహాగణపతి హోమం, నవగ్రహ శాంతి & రుద్రాభిషేక పూజ",
    defaultPoojaPlace: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం",
    divyaBhavishyaTitle: "3. బగ్గోణ దివ్య భవిష్యత్తు - ప్రశ్నోత్తర వేదిక",
    divyaBhavishyaSubtitle: "ఏక ప్రశ్న లేదా బహుళ ప్రశ్నలను ఎంచుకుని, జాతక ఆధారిత 4-దశల శాస్త్రీయ జ్యోతిష్య సమాధానాలు పొందండి.",
    questionModeLabel: "ప్రశ్న విధానం:",
    singleQuestionMode: "ఏక ప్రశ్న (Single Question)",
    multiQuestionMode: "బహుళ ప్రశ్నలు (Multi-Questions)",
    selectTopicLabel: "ప్రశ్న విషయం:",
    customQuestionLabel: "మీ నిర్దిష్ట ప్రశ్న:",
    customQuestionPlaceholder: "ఉదాహరణకు: నాకు ఉద్యోగంలో పదోన్నతి మరియు ఆర్థిక వృద్ధి ఎప్పుడు లభిస్తుంది?",
    voiceInputTitle: "వాయిస్ ద్వారా ప్రశ్న అడగండి",
    addQuestionBtn: "+ మరో ప్రశ్న జోడించండి",
    removeQuestionBtn: "తొలగించు",
    generateAnswersBtn: "🔮 దివ్య భవిష్య సమాధానాలు సిద్ధం చేయండి",
    generatingAnswersText: "గ్రహ స్థితులు మరియు దశా కాలాన్ని విశ్లేషించి సమాధానాలు సిద్ధం చేయబడుతున్నాయి...",
    answersReadyBadge: "సమాధానాలు సిద్ధమయ్యాయి!",
    packageContentsTitle: "4. డౌన్‌లోడ్ చేయడానికి సిద్ధంగా ఉన్న 7 నివేదికలు",
    packageContentsSubtitle: "ప్రతి నివేదికను విడిగా లేదా అన్నింటినీ కలిపి ఒకే జిప్ ఫైల్‌గా డౌన్‌లోడ్ చేసుకోండి.",
    item1Title: "1. జన్మ కుండలి (Janana Kundali)",
    item1Desc: "పూర్తి జాతక చక్రం (దక్షిణ/ఉత్తర శైలి), 9 గ్రహాల స్పష్ట స్ఫుట పట్టిక, లగ్నం, నవాంశ మరియు దశా భుక్తి శేషం.",
    item2Title: "2. ప్రీమియం భవిష్యత్తు V1 (Premium PDF V1)",
    item2Desc: "అధికారిక 10-అధ్యాయాల సమగ్ర జీవిత ఫలితాలు, యోగాలు, భావ ఫలాలు మరియు శాస్త్రీయ మార్గదర్శనం.",
    item3Title: "3. దైవిక పరిహారాలు (Daivika Parihara)",
    item3Desc: "గ్రహ శాంతి పూజలు, స్తోత్రాలు, బీజ మంత్రాలు, పవిత్ర క్షేత్ర దర్శనం, రుద్రాక్ష, రత్నాలు & దాన మార్గదర్శనం.",
    item4Title: "4. సమగ్ర దోషాలు & శాంతి (Doshagalu & Shanti)",
    item4Desc: "కుజ దోషం, కాలసర్ప దోషం, పితృ దోషం, ఏలినాటి శని, గ్రహణ దోషం, గండాంతర రక్షణ & మనోభయ నివారణ.",
    item5Title: "5. ప్రస్తుత జీవిత స్థితి (Current Life Status & Gochara)",
    item5Desc: "ప్రస్తుత మహర్దశ-అంతర్దశ, గురు-శని-రాహు-కేతు గోచార ప్రభావం, చంద్రబలం & రాబోయే 6-12 నెలల మార్గదర్శనం.",
    item6Title: "6. 30, 90 & 120 రోజుల క్యాలెండర్ క్యూఆర్ కోడ్‌లు",
    item6Desc: "పురోహితుల పేరు, ఫోన్ నంబర్, పూజా వివరాలు మరియు స్థలంతో కూడిన 3 ప్రత్యేక స్కాన్ చేయదగిన క్యూఆర్ కోడ్‌లు.",
    item7Title: "7. బగ్గోణ దివ్య భవిష్య ప్రశ్నోత్తర నివేదిక",
    item7Desc: "ఎంచుకున్న ప్రశ్నలకు భావం, దశ, ఖచ్చితమైన సమయ ప్రాప్తి మరియు పరిహారాలతో కూడిన సమగ్ర లిఖిత సమాధానాలు.",
    downloadSinglePdfBtn: "పీడీఎఫ్ డౌన్‌లోడ్ ⬇️",
    downloadQrPngsBtn: "క్యూఆర్ చిత్రాలు (PNG) ⬇️",
    previewBtn: "వీక్షించండి 👁️",
    downloadZipBtn: "📦 సమగ్ర జిప్ ఫైల్ డౌన్‌లోడ్ చేయండి (Download All in 1 ZIP)",
    downloadZipSubtitle: "పై 7 పీడీఎఫ్ నివేదికలు మరియు 3 క్యూఆర్ చిత్రాలతో కూడిన సంపూర్ణ జిప్ ఫైల్.",
    packagingZipProgress: "నివేదికలను రూపొందించి జిప్ ఫైల్‌గా భద్రపరుస్తున్నాము...",
    zipCompleteTitle: "🎉 సమగ్ర ప్యాకేజీ విజయవంతంగా డౌన్‌లోడ్ అయింది!",
    zipCompleteDesc: "అన్ని అధికారిక నివేదికలు మరియు క్యూఆర్ కోడ్‌లు మీ పరికరంలో భద్రపరచబడ్డాయి.",
    closeBtn: "మూసివేయి (Close)",
    topics: {
      career: { label: "ఉద్యోగం & పదోన్నతి", sample: "నాకు ఉద్యోగంలో పదోన్నతి మరియు ఆర్థిక పురోగతి ఎప్పుడు కలుగుతుంది?" },
      marriage: { label: "వివాహం & భాగస్వామి", sample: "నా వివాహం ఎప్పుడు జరుగుతుంది మరియు భాగస్వామి స్వభావం ఎలా ఉంటుంది?" },
      wealth: { label: "ధన సంపద & పెట్టుబడులు", sample: "నా ఆర్థిక స్థితి ఎప్పుడు మెరుగుపడుతుంది మరియు పెట్టుబడుల్లో లాభం ఎప్పుడు?" },
      children: { label: "సంతాన ప్రాప్తి & పిల్లలు", sample: "నాకు సంతాన ప్రాప్తి ఎప్పుడు కలుగుతుంది మరియు వారి ఆరోగ్యం ఎలా ఉంటుంది?" },
      house: { label: "గృహం & ఆస్తి కొనుగోలు", sample: "స్వంత ఇల్లు లేదా స్థలం కొనుగోలు చేసే యోగం ఎప్పుడు ప్రాప్తిస్తుంది?" },
      foreign: { label: "విదేశీ ప్రయాణం & బదిలీ", sample: "నాకు విదేశీ ప్రయాణం లేదా ఉద్యోగ బదిలీ యోగం ఉందా?" },
      health: { label: "ఆరోగ్యం & ఆయుష్షు", sample: "ఆరోగ్య సమస్యల నివారణకు ఏ దైవిక పరిహారాలు ఆచరించాలి?" },
      general: { label: "వ్యక్తిగత జాతక విచారణ", sample: "జీవితంలో మనశ్శాంతి మరియు అభివృద్ధి కోసం తగిన మార్గదర్శనం ఇవ్వండి." }
    },
    qrTitles: {
      day30: "30-రోజుల దైనందిన శుభ ముహూర్త క్యాలెండర్",
      day90: "90-రోజుల మహా దైవిక పంచాంగ క్యాలెండర్",
      day120: "120-రోజుల దీర్ఘకాలిక సాధనా పంచాంగ క్యాలెండర్",
      scanInstructions: "క్యాలెండర్ సింక్ చేసుకునే సులభ విధానం:",
      androidStep: "Android: Google Lens లేదా కెమెరా తెరిచి క్యూఆర్ కోడ్ స్కాన్ చేయండి.",
      iosStep: "iPhone: కెమెరా తెరిచి స్కాన్ చేసి, 'Add to Calendar' ఎంచుకోండి."
    },
    currentLifeTitles: {
      runningDasha: "ప్రస్తుతం నడుస్తున్న మహర్దశ & అంతర్దశ",
      liveGochara: "లైవ్ గోచార గ్రహ స్థితులు",
      immediateForecast: "రాబోయే 6 నుండి 12 నెలల జీవిత దృక్పథం",
      remediesTitle: "ప్రస్తుత దశలో తక్షణమే ఆచరించవలసిన దైవిక పరిహారాలు"
    }
  },

  ta: {
    pageTitle: "॥ பக்கோண முழுமையான ஜாதகம், பரிகாரம் & பிரசாத பதிவிறக்க மையம் ॥",
    pageSubtitle: "ஜாதகரின் பிறப்பு குண்டலி, பிரீமியம் கணிப்பு V1, பரிகாரங்கள், தோஷங்கள், தற்போதைய வாழ்க்கை நிலை, 30/90/120 நாட்கள் கியூஆர் குறியீடுகள் & திவ்ய பவிஷ்ய கேள்வி பதில்களை ஒரே ஜிப் கோப்பாகப் பெறுங்கள்.",
    selectLanguage: "மொழியைத் தேர்வுசெய்க (Select Language):",
    devoteeDetailsTitle: "1. ஜாதகர் விவரம் & பிறப்பு தகவல்கள்",
    devoteeDetailsSubtitle: "துல்லியமான கணிப்புக்கு பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்.",
    useCurrentKundliBtn: "✨ நடப்பு ஜாதக விவரங்களை நிரப்பவும்",
    devoteeNameLabel: "ஜாதகர் பெயர்:",
    genderLabel: "பாலினம்:",
    male: "ஆண்",
    female: "பெண்",
    dobLabel: "பிறந்த தேதி:",
    tobLabel: "பிறந்த நேரம்:",
    pobLabel: "பிறந்த இடம்:",
    gotraLabel: "கோத்திரம்:",
    calculatedKundliBadge: "கணிக்கப்பட்ட ஜோதிட நிலைகள்",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "சந்திர ராசி:",
    nakshatraLabel: "பிறப்பு நட்சத்திரம்:",
    priestAndPoojaTitle: "2. அர்ச்சகர் & பூஜை சங்கல்ப விவரம்",
    priestAndPoojaSubtitle: "நாள்காட்டி கியூஆர் குறியீடு மற்றும் ஆசீர்வாத கடிதத்தில் அச்சிடப்படும் அர்ச்சகர் & பூஜை இட விவரங்கள்.",
    priestNameLabel: "அர்ச்சகர் பெயர்:",
    priestPhoneLabel: "அர்ச்சகர் அலைபேசி எண்:",
    poojaNameLabel: "பூஜை சங்கல்ப விவரம்:",
    poojaPlaceLabel: "பூஜை நடைபெறும் புனித தலம்:",
    defaultPriestName: "ஸ்ரீராம் பண்டிதர்",
    defaultPriestPhone: "9972339362",
    defaultPoojaName: "ஸ்ரீ மகா கணபதி ஹோமம், நவக்கிரக சாந்தி & ருத்ராபிஷேக பூஜை",
    defaultPoojaPlace: "ஸ்ரீ க்ஷேத்ர கோகர்ண மகாபலேஸ்வரர் சந்நிதி",
    divyaBhavishyaTitle: "3. பக்கோண திவ்ய பவிஷ்யா - கேள்வி பதில் தளம்",
    divyaBhavishyaSubtitle: "ஒற்றைக் கேள்வி அல்லது பல கேள்விகளைத் தேர்ந்தெடுத்து, ஜாதக ரீதியான 4-படிநிலைகள் கொண்ட துல்லிய பதில்களைப் பெறுங்கள்.",
    questionModeLabel: "கேள்வி முறை:",
    singleQuestionMode: "ஒற்றைக் கேள்வி (Single Question)",
    multiQuestionMode: "பல கேள்விகள் (Multi-Questions)",
    selectTopicLabel: "கேள்வித் தலைப்பு:",
    customQuestionLabel: "உங்கள் பிரத்யேக கேள்வி:",
    customQuestionPlaceholder: "உதாரணமாக: எனக்கு வேலையில் பதவி உயர்வு மற்றும் ஊதிய உயர்வு எப்போது கிடைக்கும்?",
    voiceInputTitle: "குரல் மூலம் கேள்வி கேட்க",
    addQuestionBtn: "+ மற்றொரு கேள்வி சேர்க்க",
    removeQuestionBtn: "நீக்கு",
    generateAnswersBtn: "🔮 திவ்ய பவிஷ்ய பதில்களைத் தயார் செய்க",
    generatingAnswersText: "கிரக நிலைகள் மற்றும் தசா காலங்களை ஆராய்ந்து பதில்கள் தயாரிக்கப்படுகின்றன...",
    answersReadyBadge: "பதில்கள் தயாராக உள்ளன!",
    packageContentsTitle: "4. பதிவிறக்கத்திற்குத் தயாராக உள்ள 7 முக்கிய அறிக்கைகள்",
    packageContentsSubtitle: "ஒவ்வொரு அறிக்கையையும் தனியாகவோ அல்லது அனைத்தையும் ஒன்றாக ஜிப் கோப்பாகவோ பதிவிறக்கம் செய்யலாம்.",
    item1Title: "1. பிறப்பு ஜாதகம் (Janana Kundali)",
    item1Desc: "முழு ஜாதகக் கட்டம் (தெற்கு/வடக்கு பாணி), 9 கிரகங்களின் பாகை அட்டவணை, லக்னம், நவாம்சம் மற்றும் தசா இருப்பு.",
    item2Title: "2. பிரீமியம் கணிப்பு V1 (Premium PDF V1)",
    item2Desc: "அங்கீகரிக்கப்பட்ட 10-அத்தியாயங்கள் கொண்ட முழு வாழ்க்கை பலன்கள், யோகங்கள் மற்றும் பரிகார வழிகாட்டுதல்.",
    item3Title: "3. தெய்விக பரிகாரங்கள் (Daivika Parihara)",
    item3Desc: "கிரக சாந்தி பூஜைகள், ஸ்தோத்திரங்கள், பீஜ மந்திரங்கள், புனித யாத்திரை, ருத்ராட்சம், ரத்தினம் மற்றும் தானங்கள்.",
    item4Title: "4. முழுமையான தோஷங்கள் & சாந்தி (Doshagalu & Shanti)",
    item4Desc: "செவ்வாய் தோஷம், காலசர்ப்ப தோஷம், பித்ரு தோஷம், ஏழரை சனி, கிரகண தோஷம், கண்டாந்தர பாதுகாப்பு & மனபய நிவர்த்தி.",
    item5Title: "5. தற்போதைய வாழ்க்கை நிலை (Current Life Status & Gochara)",
    item5Desc: "நடப்பு மகாதிசை-புத்தி, குரு-சனி-ராகு-கேது கோச்சார தாக்கம், சந்திரபலம் & அடுத்த 6-12 மாதங்களுக்கான வழிகாட்டுதல்.",
    item6Title: "6. 30, 90 & 120 நாட்கள் நாள்காட்டி கியூஆர் குறியீடுகள்",
    item6Desc: "அர்ச்சகர் பெயர், அலைபேசி எண், பூஜை விவரம் மற்றும் இடத்துடன் கூடிய 3 தனித்துவமான கூகுள் காலண்டர் கியூஆர் கோடுகள்.",
    item7Title: "7. பக்கோண திவ்ய பவிஷ்ய கேள்வி பதில் அறிக்கை",
    item7Desc: "தேர்வுசெய்த கேள்விகளுக்கு பாவம், தசா, துல்லிய கால நேரம் மற்றும் பரிகாரங்களுடன் கூடிய முழுமையான எழுத்துப்பூர்வ அறிக்கை.",
    downloadSinglePdfBtn: "பிடிஎஃப் பதிவிறக்கம் ⬇️",
    downloadQrPngsBtn: "கியூஆர் படங்கள் (PNG) ⬇️",
    previewBtn: "பார்வையிடுக 👁️",
    downloadZipBtn: "📦 முழு ஜிப் கோப்பையும் பதிவிறக்குக (Download All in 1 ZIP)",
    downloadZipSubtitle: "மேற்கண்ட 7 அறிக்கைகள் மற்றும் 3 உயர்தர கியூஆர் படங்களை உள்ளடக்கிய ஒற்றை ஜிப் கோப்பு.",
    packagingZipProgress: "அறிக்கைகளை உருவாக்கி ஜிப் கோப்பாக இணைக்கிறோம்...",
    zipCompleteTitle: "🎉 முழு தொகுப்பும் வெற்றிகரமாக பதிவிறக்கப்பட்டது!",
    zipCompleteDesc: "அனைத்து அறிக்கைகளும் மற்றும் கியூஆர் குறியீடுகளும் உங்கள் சாதனத்தில் பதிவிறக்கம் செய்யப்பட்டுள்ளன.",
    closeBtn: "மூடுக (Close)",
    topics: {
      career: { label: "வேலை & பதவி உயர்வு", sample: "எனக்கு பணியில் பதவி உயர்வு மற்றும் நிதி வளர்ச்சி எப்போது கிடைக்கும்?" },
      marriage: { label: "திருமணம் & வரன் குணம்", sample: "எனக்கு திருமண யோகம் எப்போது கூடிவரும் மற்றும் வாழ்க்கைத் துணையின் குணம் எப்படி இருக்கும்?" },
      wealth: { label: "செல்வம் & முதலீடுகள்", sample: "எனது நிதி நிலைமை எப்போது சீரடையும் மற்றும் முதலீடுகளில் லாபம் எப்போது கிட்டும்?" },
      children: { label: "சந்ததி யோகம் & குழந்தைகள்", sample: "எனக்கு குழந்தை பாக்கியம் எப்போது கிடைக்கும் மற்றும் குழந்தைகளின் நலம் எவ்வாறு இருக்கும்?" },
      house: { label: "வீடு & நிலம் வாங்குதல்", sample: "சொந்த வீடு அல்லது மனை வாங்குவதற்கான சுப யோகம் எப்போது உண்டாகும்?" },
      foreign: { label: "வெளிநாட்டு பயணம் & இடமாற்றம்", sample: "எனக்கு வெளிநாடு செல்ல அல்லது வேறு ஊருக்கு இடமாற்றம் ஏற்பட யோகம் உள்ளதா?" },
      health: { label: "ஆரோக்கியம் & ஆயுள்", sample: "உடல்நலக் குறைபாடுகள் தீர எந்த தெய்விக பரிகாரங்களைச் செய்ய வேண்டும்?" },
      general: { label: "தனிப்பட்ட ஜாதகக் கேள்வி", sample: "வாழ்க்கையில் அமைதியும் முன்னேற்றமும் பெற தகுந்த ஆன்மீக வழிகாட்டுதல் வழங்கவும்." }
    },
    qrTitles: {
      day30: "30-நாட்கள் தினசரி சுப முகூர்த்த காலண்டர்",
      day90: "90-நாட்கள் மகா பஞ்சாங்க காலண்டர்",
      day120: "120-நாட்கள் சாதன பஞ்சாங்க காலண்டர்",
      scanInstructions: "காலண்டரை மொபைலில் இணைக்கும் எளிய முறை:",
      androidStep: "Android: Google Lens அல்லது கேமராவைத் திறந்து கியூஆர் குறியீட்டை ஸ்கேன் செய்க.",
      iosStep: "iPhone: கேமராவைத் திறந்து ஸ்கேன் செய்து, 'Add to Calendar' என்பதைத் தேர்ந்தெடுக்கவும்."
    },
    currentLifeTitles: {
      runningDasha: "தற்போது நடக்கும் மகாதிசை மற்றும் புத்தி",
      liveGochara: "நேரலை கோச்சார கிரக நிலைகள்",
      immediateForecast: "அடுத்த 6 முதல் 12 மாதங்களுக்கான வாழ்க்கைக் கண்ணோட்டம்",
      remediesTitle: "தற்போதைய காலகட்டத்தில் உடனடியாக செய்ய வேண்டிய பரிகாரங்கள்"
    }
  }
};
