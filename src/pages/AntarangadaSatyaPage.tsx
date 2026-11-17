import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { resolvePlaceOrPincode } from "../services/locationApi";
import {
  generateAntarangaSatya,
  getHotelPaymentUpiUri,
  getHotelPhonePeUri,
  getHotelGPayUri,
  getHotelPaytmUri,
  verifyHotelPaymentUtr,
  verifyHotelPaymentInstant,
  checkHotelPaymentWebhookStatus,
  generateHotelOrderId,
  HOTEL_PDF_PRICE_INR,
  HOTEL_REMEDY_ADDON_INR,
  HOTEL_PREMIUM_REMEDY_PRICE_INR,
  type HotelPackageType,
  PRIEST_UPI_ID,
  PRIEST_NAME,
  PRIEST_PHONE,
  DEFAULT_HOTEL_FULL_NAME,
  type AntarangaLang,
  type AntarangaSecretResult,
  ANTARANGA_LANGUAGES
} from "../features/hotelSecret/antarangaService";
import {
  saveHotelOrderInitiated,
  updateHotelOrderVerified,
  verifyHotelOrderPayment,
  type HotelTableOrderDoc
} from "../db/firestoreDb";
import {
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload
} from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { captureFiveYearPredictionPdf } from "../features/fiveYearPrediction/fiveYearPredictionService";
import { FiveYearPredictionPdfTemplate } from "../components/fiveYearPrediction/FiveYearPredictionPdfTemplate";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";

// Core Kundli & Remedy PDF Imports
import { PublicKundliPdfDocument } from "../components/kundli/PublicKundliPdfDocument";
import {
  calculatePublicKundliProfile,
  generateDynamicLifeInsights,
  type PublicKundliProfile,
  type DynamicLifeAnalysisOutput
} from "../features/publicKundli/publicKundliEngine";
import type { PublicKundliLang } from "../features/publicKundli/publicKundliLocale";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import {
  generateKundliRemedyReport,
  type KundliRemedyDiagnosis
} from "../features/remedies/kundliRemedyEngine";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import {
  AntarangaAstrologicalScreenLoader,
  type AntarangaLoaderStage
} from "../components/loaders/AntarangaAstrologicalScreenLoader";
import { CityAutocompleteInput } from "../components/common/CityAutocompleteInput";

// 7-Language Popular Dining Cities
const QUICK_CITIES_BY_LANG: Record<AntarangaLang, Array<{ name: string; lat: number; lng: number }>> = {
  kn: [
    { name: "ಬೆಂಗಳೂರು (Bengaluru)", lat: 12.9716, lng: 77.5946 },
    { name: "ಗೋಕರ್ಣ (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "ಮಂಗಳೂರು (Mangaluru)", lat: 12.9141, lng: 74.8560 },
    { name: "ಹುಬ್ಬಳ್ಳಿ (Hubballi)", lat: 15.3647, lng: 75.1240 },
    { name: "ಮೈಸೂರು (Mysuru)", lat: 12.2958, lng: 76.6394 },
    { name: "ಶಿವಮೊಗ್ಗ (Shivamogga)", lat: 13.9299, lng: 75.5681 },
    { name: "ಬೆಳಗಾವಿ (Belagavi)", lat: 15.8497, lng: 74.4977 }
  ],
  en: [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Gokarna", lat: 14.5479, lng: 74.3188 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Mangaluru", lat: 12.9141, lng: 74.8560 }
  ],
  hi: [
    { name: "गोकर्ण (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "बेंगलुरु (Bengaluru)", lat: 12.9716, lng: 77.5946 },
    { name: "मुंबई (Mumbai)", lat: 19.0760, lng: 72.8777 },
    { name: "दिल्ली (Delhi)", lat: 28.6139, lng: 77.2090 },
    { name: "हैदराबाद (Hyderabad)", lat: 17.3850, lng: 78.4867 },
    { name: "पुणे (Pune)", lat: 18.5204, lng: 73.8567 },
    { name: "वाराणसी (Varanasi)", lat: 25.3176, lng: 82.9739 }
  ],
  te: [
    { name: "గోకర్ణ (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "హైదరాబాద్ (Hyderabad)", lat: 17.3850, lng: 78.4867 },
    { name: "విజయవాడ (Vijayawada)", lat: 16.5062, lng: 80.6480 },
    { name: "విశాఖపట్నం (Visakhapatnam)", lat: 17.6868, lng: 83.2185 },
    { name: "బెంగళూరు (Bengaluru)", lat: 12.9716, lng: 77.5946 },
    { name: "తిరుపతి (Tirupati)", lat: 13.6288, lng: 79.4192 }
  ],
  ta: [
    { name: "கோகர்ணம் (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "சென்னை (Chennai)", lat: 13.0827, lng: 80.2707 },
    { name: "கோயம்புத்தூர் (Coimbatore)", lat: 11.0168, lng: 76.9558 },
    { name: "மதுரை (Madurai)", lat: 9.9252, lng: 78.1198 },
    { name: "பெங்களூரு (Bengaluru)", lat: 12.9716, lng: 77.5946 },
    { name: "திருச்சி (Trichy)", lat: 10.7905, lng: 78.7047 }
  ],
  ml: [
    { name: "ഗോകർണം (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "കൊച്ചി (Kochi)", lat: 9.9312, lng: 76.2673 },
    { name: "തിരുവനന്തപുരം (Thiruvananthapuram)", lat: 8.5241, lng: 76.9366 },
    { name: "കോഴിക്കോട് (Kozhikode)", lat: 11.2588, lng: 75.7804 },
    { name: "തൃശ്ശൂർ (Thrissur)", lat: 10.5276, lng: 76.2144 },
    { name: "ബംഗളൂരു (Bengaluru)", lat: 12.9716, lng: 77.5946 }
  ],
  mr: [
    { name: "गोकर्ण (Gokarna)", lat: 14.5479, lng: 74.3188 },
    { name: "मुंबई (Mumbai)", lat: 19.0760, lng: 72.8777 },
    { name: "पुणे (Pune)", lat: 18.5204, lng: 73.8567 },
    { name: "नागपूर (Nagpur)", lat: 21.1458, lng: 79.0882 },
    { name: "नाशिक (Nashik)", lat: 19.9975, lng: 73.7898 },
    { name: "कोल्हापूर (Kolhapur)", lat: 16.7050, lng: 74.2433 },
    { name: "बेंगळुरू (Bengaluru)", lat: 12.9716, lng: 77.5946 }
  ]
};

// Comprehensive 7-Language Pure UI Translations
export const ANTARANGA_UI_STRINGS: Record<
  AntarangaLang,
  {
    topMantra: string;
    defaultSanctuaryTitle: string;
    tableLabel: string;
    langSelectHeader: string;
    langSelectSubtitle: string;
    startReadingBtn: string;
    changeLangBtn: string;
    freeBannerBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    formHeader: string;
    freeTag: string;
    nameLabel: string;
    namePlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    genderLabel: string;
    maleLabel: string;
    femaleLabel: string;
    placeLabel: string;
    customSearchPlaceholder: string;
    searchButton: string;
    searchingButton: string;
    revealSecretCta: string;
    calculatingCta: string;
    resultHeading: string;
    resultBadge: string;
    authenticTruthBadge: string;
    moonSignLabel: string;
    starLabel: string;
    lagnaLabel: string;
    h8LordLabel: string;
    paragraph1Title: string;
    paragraph2Title: string;
    specialOfferBadge: string;
    specialOfferTitle: string;
    specialOfferDesc: string;
    featurePoints: [string, string, string, string, string];
    regularPriceLabel: string;
    packageSelectTitle: string;
    packageStandardTitle: string;
    packageStandardPrice: string;
    packageStandardDesc: string;
    packageRemedyTitle: string;
    packageRemedyPrice: string;
    packageRemedyDesc: string;
    packageRemedyBadge: string;
    payUnlockCta: string;
    upiSectionTitle: string;
    paymentInstructions: string;
    phonePeBtn: string;
    gpayBtn: string;
    paytmBtn: string;
    copyUpiBtn: string;
    copiedUpiBtn: string;
    instantUnlockTitle: string;
    instantUnlockDesc: string;
    instantUnlockBtn: string;
    manualUtrToggleText: string;
    utrLabel: string;
    utrPlaceholder: string;
    verifyUtrBtn: string;
    verifyingUtrBtn: string;
    verifiedUtrBtn: string;
    pdfReadyHeader: string;
    downloadFiveYearPdfBtn: string;
    downloadKundliPdfBtn: string;
    downloadRemedyPdfBtn: string;
    downloadAllPdfsBtn: string;
    downloadedBtn: string;
    downloadAllCompletedBtn: string;
    viewPdfBtn: string;
    iphoneSafariTip: string;
    unpaidWarning: string;
    footerSanctum: string;
    footerContact: string;
    nameRequiredError: string;
    cityNotFoundError: string;
    calcError: string;

    // Gochara & Transit Ribbon
    gocharaSectionTitle: string;
    gocharaSectionBadge: string;
    shaniTransitTitle: string;
    guruBalaTitle: string;
    runningDashaTitle: string;
    turningPointVerdictTitle: string;

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: string;

    // Free Lucky Blueprint
    luckyBlueprintTitle: string;
    luckyBlueprintBadge: string;
    luckyGemstoneLabel: string;
    luckyDayLabel: string;
    luckyNumberLabel: string;
    luckyDirectionColorLabel: string;
    ishtaDevataLabel: string;

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: string;
    fiveYearPreviewSubtitle: string;
    year1FreeBadge: string;
    vitalityScoreLabel: string;
    turningPointSeasonLabel: string;
    goldenOpportunityLabel: string;
    cautionAlertLabel: string;
    lockedYearsNotice: string;
    yearNumLabel: string;

    // Dining Special Offer Card
    dinerSpecialBadge: string;
    dinerSpecialDiscountNotice: string;
    unlockFiveYearCtaBtn: string;

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: string;
    launchingPhonePeMsg: string;
    launchingGPayTitle: string;
    launchingGPayMsg: string;
    launchingPaytmTitle: string;
    launchingPaytmMsg: string;

    // UTR verification & Download Center
    utrSectionTitle: string;
    singleUseNotice: string;
    alreadyDownloadedAlert: string;
    allAlreadyDownloadedAlert: string;
    generatingKundliPdfStage: string;
    generatingRemedyPdfStage: string;
    paymentVerifiedSuccess: string;
  }
> = {
  kn: {
    topMantra: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥",
    defaultSanctuaryTitle: "ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್",
    tableLabel: "ಮೇಜು",
    langSelectHeader: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    langSelectSubtitle: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಅಂತರಂಗದ ಸತ್ಯ, ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ೫-ವರ್ಷಗಳ ಭವಿಷ್ಯ ತಿಳಿಯಿರಿ",
    startReadingBtn: "ಮುಂದುವರಿಯಿರಿ • ಉಚಿತ ಅಂತರಂಗದ ಸತ್ಯ ತಿಳಿಯಿರಿ →",
    changeLangBtn: "← ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    freeBannerBadge: "✨ ಊಟಕ್ಕೆ ಮುಂಚೆ ನಿಮ್ಮ ಅಂತಃಸತ್ವದ ರಹಸ್ಯ ತಿಳಿಯಿರಿ • ೧೦೦% ಉಚಿತ",
    heroTitle: "ಅಂತರಂಗದ ಸತ್ಯ",
    heroSubtitle: "ಯಾರಿಗೂ ಹೇಳಲಾಗದ ಯಾವ ನಿಗೂಢ ರಹಸ್ಯ ಮತ್ತು ಒಳಮನಸ್ಸಿನ ತುಮುಲಗಳನ್ನು ನೀವು ಮೌನವಾಗಿ ಹೊತ್ತಿದ್ದೀರಿ? ನಿಮ್ಮ ಜನನ ವಿವರ ನೀಡಿ ೧-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ತಿಳಿಯಿರಿ!",
    formHeader: "ನಿಮ್ಮ ಜನನ ವಿವರಗಳು",
    freeTag: "೧೦೦% ಉಚಿತ",
    nameLabel: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು *",
    namePlaceholder: "ಉದಾ: ರಾಘವೇಂದ್ರ / ಪ್ರಮೋದ್ ಶರ್ಮಾ",
    dateLabel: "ಜನನ ದಿನಾಂಕ *",
    timeLabel: "ಜನನ ಸಮಯ *",
    genderLabel: "ಲಿಂಗ",
    maleLabel: "ಪುರುಷ",
    femaleLabel: "ಮಹಿಳೆ",
    placeLabel: "ಜನನ ಸ್ಥಳ",
    customSearchPlaceholder: "ಬೇರೆ ಊರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ಹುಡುಕಿ...",
    searchButton: "ಹುಡುಕಿ",
    searchingButton: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    revealSecretCta: "🔮 ನನ್ನ ಅಂತರಂಗದ ಸತ್ಯ ತಿಳಿಸಿ • ೧೦೦% ಉಚಿತ",
    calculatingCta: "ಜಾತಕದ ಅಂತರಾಳ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    resultHeading: "ಅವರ ಅಂತರಂಗದ ನಿಗೂಢ ಸತ್ಯ",
    resultBadge: "॥ ಅಂತರಂಗದ ಸತ್ಯ · ನಿಗೂಢ ಜಾತಕ ರಹಸ್ಯ ॥",
    authenticTruthBadge: "✓ ೧೦೦% ಸತ್ಯ ವೇದಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ",
    moonSignLabel: "ಚಂದ್ರ ರಾಶಿ (ರಾಶಿ)",
    starLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    lagnaLabel: "ಜನ್ಮ ಲಗ್ನ",
    h8LordLabel: "ಅಷ್ಟಮಾಧಿಪತಿ (ಗುಪ್ತ ಭಾವ)",
    paragraph1Title: "🎭 ೧. ಬಾಹ್ಯ ಗಾಂಭೀರ್ಯ ಮತ್ತು ಯಾರಿಗೂ ಹೇಳಲಾಗದ ಆಂತರಿಕ ತುಮುಲ",
    paragraph2Title: "🌙 ೨. ಏಕಾಂತದ ಮೌನ ವೇದನೆ ಮತ್ತು ಯಾರಿಗೂ ತಿಳಿಯದ ರಹಸ್ಯ ಸತ್ಯ",
    specialOfferBadge: "ಹೋಟೆಲ್ ಅತಿಥಿ ವಿಶೇಷ ಕೊಡುಗೆ",
    specialOfferTitle: "ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ ಮತ್ತು ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಜಾತಕ (೨೦೨೬–೨೦೩೧)",
    specialOfferDesc: "ಮೇಲಿನ ಅಂತರಂಗದ ಸತ್ಯವು ನಿಮ್ಮ ಜೀವನದ ಕನ್ನಡಿಯ ಒಂದು ಸಣ್ಣ ಝಲಕ್ ಮಾತ್ರ! ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ನಿಜವಾಗಿಯೂ ಏನಾಗುತ್ತಿದೆ? ಮುಂದಿನ ೫ ವರ್ಷಗಳಲ್ಲಿ (೨೦೨೬–೨೦೩೧) ವೃತ್ತಿ, ಆರ್ಥಿಕ ಉನ್ನತಿ, ಕುಟುಂಬ ಸೌಖ್ಯ, ಹಾಗೂ ಆರೋಗ್ಯ ಹೇಗಿರಲಿದೆ? ಸಂಪೂರ್ಣ ಪ್ರೀಮಿಯಂ ಜಾತಕ PDF ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲೇ ಪಡೆಯಿರಿ.",
    featurePoints: [
      "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ ಹಾಗೂ ಗ್ರಹ ಗೋಚಾರಗಳ ಸೂಕ್ಷ್ಮ ವಿಶ್ಲೇಷಣೆ",
      "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ವರ್ಷವಾರು (ವರ್ಷ ೧ ರಿಂದ ೫) ನಿಖರ ಭವಿಷ್ಯ",
      "ಉದ್ಯೋಗ, ಬಡ್ತಿ, ವ್ಯಾಪಾರ ಹಾಗೂ ಧನಾಗಮನದ ಭವಿಷ್ಯವಾಣಿ",
      "ಕುಟುಂಬ ನೆಮ್ಮದಿ, ವಿವಾಹ ಯೋಗ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ",
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ಮಹಾ ಆಶೀರ್ವಾದ, ಸಿದ್ಧ ಪರಿಹಾರ ಹಾಗೂ ಸ್ತೋತ್ರಗಳು"
    ],
    regularPriceLabel: "ಸಾಮಾನ್ಯ ಶುಲ್ಕ: ₹೧,೫೦೦",
    packageSelectTitle: "ನಿಮ್ಮ ಜಾತಕ ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆ ಮಾಡಿ",
    packageStandardTitle: "ಮೂಲ ವೇದಿಕ ಜಾತಕ ಪ್ಯಾಕೇಜ್",
    packageStandardPrice: "₹೩೫೦",
    packageStandardDesc: "೫-ವರ್ಷಗಳ ಮಹಾ ಜಾತಕ ಭವಿಷ್ಯ PDF (2026–2031) + ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ PDF",
    packageRemedyTitle: "ಪ್ರೀಮಿಯಂ ಜಾತಕ + ದೈವಿಕ ಪರಿಹಾರ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
    packageRemedyPrice: "₹೪೫೦",
    packageRemedyDesc: "೫-ವರ್ಷಗಳ ಭವಿಷ್ಯ PDF + ಬಗ್ಗೋಣ ಜನ್ಮ ಕುಂಡಲಿ PDF + ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ ವರದಿ PDF (+₹೧೦೦)",
    packageRemedyBadge: "ಹೆಚ್ಚು ಶಿಫಾರಸು",
    payUnlockCta: "💳 ಪಾವತಿಸಿ ತಕ್ಷಣ PDF ಡೌನ್‌ಲೋಡ್ ಅನ್‌ಲಾಕ್ ಮಾಡಿ",
    upiSectionTitle: "📱 ತ್ವರಿತ UPI ಪಾವತಿ & PDF ಅನ್‌ಲಾಕ್",
    paymentInstructions: "PhonePe / GPay / Paytm ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಪಾವತಿಸಿ, ಅಥವಾ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    phonePeBtn: "PhonePe ಮೂಲಕ ಪಾವತಿಸಿ",
    gpayBtn: "Google Pay ಮೂಲಕ ಪಾವತಿಸಿ",
    paytmBtn: "Paytm / ಇತರೆ UPI ಮೂಲಕ ಪಾವತಿಸಿ",
    copyUpiBtn: "UPI ID ಕಾಪಿ ಮಾಡಿ",
    copiedUpiBtn: "✓ ಕಾಪಿ ಆಗಿದೆ",
    instantUnlockTitle: "⚡ PhonePe ನಲ್ಲಿ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆಯೇ?",
    instantUnlockDesc: "೧೨-ಅಂಕಿಯ ನಂಬರ್ ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ! ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ತಕ್ಷಣ ನಿಮ್ಮ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    instantUnlockBtn: "✓ ಪಾವತಿಸಿದ್ದೇನೆ • ತಕ್ಷಣ PDF ಪಡೆಯಿರಿ",
    manualUtrToggleText: "ಅಥವಾ UTR ನಂಬರ್ ನಮೂದಿಸಿ",
    utrLabel: "ಪಾವತಿಯ ನಂತರ PhonePe / GPay ರಶೀದಿಯಲ್ಲಿರುವ ೧೨-ಅಂಕಿಯ UTR / Reference ನಂಬರ್ ನಮೂದಿಸಿ:",
    utrPlaceholder: "ಉದಾ: 432109876543 (೧೨ ಅಂಕಿಗಳು)",
    verifyUtrBtn: "ಪರಿಶೀಲಿಸಿ & PDF ಪಡೆಯಿರಿ",
    verifyingUtrBtn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    verifiedUtrBtn: "✓ ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    pdfReadyHeader: "🎉 ನಿಮ್ಮ ಅಧಿಕೃತ ಜಾತಕ PDF ಗಳು ಡೌನ್‌ಲೋಡ್‌ಗೆ ಸಿದ್ಧವಾಗಿವೆ!",
    downloadFiveYearPdfBtn: "📥 ೫-ವರ್ಷಗಳ ಮಹಾ ಜಾತಕ ಭವಿಷ್ಯ PDF",
    downloadKundliPdfBtn: "📜 ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ PDF",
    downloadRemedyPdfBtn: "🪔 ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ ವರದಿ PDF",
    downloadAllPdfsBtn: "📦 ಎಲ್ಲ PDF ಒಟ್ಟಿಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    downloadedBtn: "✓ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ",
    downloadAllCompletedBtn: "✓ ಎಲ್ಲ PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ",
    viewPdfBtn: "👁️ PDF ವೀಕ್ಷಿಸಿ",
    iphoneSafariTip: "iPhone Safari ಬಳಕೆದಾರರು: ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ, ಅಥವಾ ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆದು 'Save to Files' ಗೆ ಸೇವ್ ಮಾಡಬಹುದು.",
    unpaidWarning: "ಪಾವತಿ ಪೂರ್ಣಗೊಂಡ ನಂತರವೇ ಅಧಿಕೃತ PDF ಡೌನ್‌ಲೋಡ್ ಸಕ್ರಿಯವಾಗುತ್ತದೆ.",
    footerSanctum: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    footerContact: `ಪೂಜಾ ಸಂಕಲ್ಪ ಅಥವಾ ಸೇವಾ ವಿವರಗಳಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    cityNotFoundError: "ಸ್ಥಳ ದೊರೆಯಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಮೀಪದ ಊರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.",
    calcError: "ಜಾತಕ ಗಣನೆಯಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಿನಾಂಕ ಹಾಗೂ ಸಮಯವನ್ನು ಪರಿಶೀಲಿಸಿ.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "ಈ ಕ್ಷಣದ ಗ್ರಹಬಲ, ಜೀವಶಕ್ತಿ & ಗೋಚಾರ ನಿರ್ಣಯ",
    gocharaSectionBadge: "ಉಚಿತ ದರ್ಶನ",
    shaniTransitTitle: "ಶನಿ ಗೋಚಾರ ಸ್ಥಿತಿ",
    guruBalaTitle: "ಗುರುಬಲ ಅನುಗ್ರಹ",
    runningDashaTitle: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶಾ & ಅಂತರ್ದಶಾ",
    turningPointVerdictTitle: "ತತ್ಕ್ಷಣದ ಜೀವನ ನಿರ್ಣಯ:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "ಶಾಸ್ತ್ರೋಕ್ತ ಫಲ",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "ನಿಮ್ಮ ದೈವಿಕ ಅದೃಷ್ಟ ಅಂಶಗಳು (ಉಚಿತ ಉಡುಗೊರೆ)",
    luckyBlueprintBadge: "ಅದೃಷ್ಟ ರಕ್ಷೆ",
    luckyGemstoneLabel: "ಅದೃಷ್ಟ ರತ್ನ",
    luckyDayLabel: "ಶುಭ ವಾರ",
    luckyNumberLabel: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ",
    luckyDirectionColorLabel: "ಶುಭ ದಿಕ್ಕು & ವರ್ಣ",
    ishtaDevataLabel: "ಇಷ್ಟದೈವ:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಕಾಲ & ಎಚ್ಚರಿಕೆಯ ರಹಸ್ಯ ಮುನ್ನೋಟ",
    fiveYearPreviewSubtitle: "ವರ್ಷ ೧ ಉಚಿತ ಮುನ್ನೋಟ · ವರ್ಷ ೨-೫ ರಹಸ್ಯ ಪ್ರಶ್ನೆಗಳು",
    year1FreeBadge: "ವರ್ಷ ೧ ಉಚಿತ",
    vitalityScoreLabel: "ಜೀವಶಕ್ತಿ ಸ್ಕೋರ್",
    turningPointSeasonLabel: "ಮಹಾ ತಿರುವು ನೀಡುವ ಋತು:",
    goldenOpportunityLabel: "ಸುವರ್ಣಾವಕಾಶದ ಕಾಲಾವಧಿ:",
    cautionAlertLabel: "ವರ್ಷ ೧ರ ಮುನ್ನೆಚ್ಚರಿಕೆ:",
    lockedYearsNotice: "🔒 ಮುಂದಿನ ವರ್ಷಗಳು (ವರ್ಷ ೨ ರಿಂದ ೫) - ಪ್ರೀಮಿಯಂ ದಸ್ತಾವೇಜಿನಲ್ಲಿ ಲಭ್ಯ",
    yearNumLabel: "ವರ್ಷ",

    // Dining Special Offer Card
    dinerSpecialBadge: "ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್ ವಿಶೇಷ ಅತಿಥಿ ಸೌಲಭ್ಯ",
    dinerSpecialDiscountNotice: "🍽️ ಹೋಟೆಲ್ ಮೇಜಿನ ವಿಶೇಷ ರಿಯಾಯಿತಿ: ನೀವು ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್‌ನಲ್ಲಿ ಊಟ ಮಾಡುತ್ತಿರುವ ಈ ಸಮಯದಲ್ಲಿ ಮಾತ್ರ ₹೩೫೦ ಕ್ಕೆ ಅನ್‌ಲಾಕ್ ಲಭ್ಯವಿದೆ. (ಸಾಮಾನ್ಯ ಶುಲ್ಕ: ₹೧,೫೦೦ - ೭೭% ರಿಯಾಯಿತಿ)",
    unlockFiveYearCtaBtn: "🔓 ಕೇವಲ ₹೩೫೦ ನೀಡಿ ಪೂರ್ಣ ೫-ವರ್ಷಗಳ ಮಹಾ ದಸ್ತಾವೇಜು ಅನ್‌ಲಾಕ್ ಮಾಡಿ",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
    launchingPhonePeMsg: "PhonePe ನಲ್ಲಿ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ...",
    launchingGPayTitle: "📲 Google Pay ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
    launchingGPayMsg: "Google Pay ನಲ್ಲಿ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ...",
    launchingPaytmTitle: "📲 Paytm ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
    launchingPaytmMsg: "Paytm ನಲ್ಲಿ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ...",

    // UTR verification & Download Center
    utrSectionTitle: "ಪಾವತಿ ದೃಢೀಕರಣ (೧೨-ಅಂಕಿಯ UPI UTR ದೃಢೀಕರಣ)",
    singleUseNotice: "ಗಮನಿಸಿ: ಭದ್ರತಾ ನಿಯಮಗಳ ಪ್ರಕಾರ, ಪ್ರತಿ ಫೈಲ್ ಅನ್ನು ಒಂದು ಬಾರಿ ಮಾತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು.",
    alreadyDownloadedAlert: "ಈ ಫೈಲ್ ಅನ್ನು ಈಗಾಗಲೇ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ. ಪ್ರತಿ ಫೈಲ್‌ಗೆ ಒಂದು ಬಾರಿ ಮಾತ್ರ ಡೌನ್‌ಲೋಡ್ ಅನುಮತಿ ನೀಡಲಾಗಿದೆ.",
    allAlreadyDownloadedAlert: "ಎಲ್ಲಾ PDF ಗಳನ್ನು ಈಗಾಗಲೇ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ. ಮರು-ಡೌನ್‌ಲೋಡ್ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ.",
    generatingKundliPdfStage: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    generatingRemedyPdfStage: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ದೈವಿಕ ಪರಿಹಾರ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    paymentVerifiedSuccess: "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ!"
  },
  en: {
    topMantra: "॥ Sri Kshetra Gokarna Mahabaleshwara Prasanna ॥",
    defaultSanctuaryTitle: "Pandit Palette",
    tableLabel: "Table",
    langSelectHeader: "Select Your Preferred Language",
    langSelectSubtitle: "Discover your soul's unspoken secret, authentic Baggona Janma Kundali & 5-year destiny in your language",
    startReadingBtn: "Continue • Reveal My Dark Secret Free →",
    changeLangBtn: "← Change Language",
    freeBannerBadge: "✨ Reveal the secret truth of your soul before dining • 100% Free",
    heroTitle: "Antarangada Satya (Dark Secret of the Soul)",
    heroSubtitle: "What unspoken secrets and subterranean turmoil do you silently carry? Enter your birth details to reveal them in 1-click!",
    formHeader: "Your Birth Details",
    freeTag: "100% Free",
    nameLabel: "Your Full Name *",
    namePlaceholder: "e.g., Alexander / Rahul Sharma",
    dateLabel: "Date of Birth *",
    timeLabel: "Time of Birth *",
    genderLabel: "Gender",
    maleLabel: "Male",
    femaleLabel: "Female",
    placeLabel: "Birth Place",
    customSearchPlaceholder: "Search other city or pincode...",
    searchButton: "Search",
    searchingButton: "Searching...",
    revealSecretCta: "🔮 Reveal My Dark Secret • 100% Free",
    calculatingCta: "Analyzing astrological secrets...",
    resultHeading: "'s Unspoken Soul Secrets",
    resultBadge: "॥ Antarangada Satya · Vedic Secret Profile ॥",
    authenticTruthBadge: "✓ 100% Authentic Astrological Truth",
    moonSignLabel: "Moon Sign (Rashi)",
    starLabel: "Birth Star (Nakshatra)",
    lagnaLabel: "Ascendant (Janma Lagna)",
    h8LordLabel: "8th Lord (Occult House)",
    paragraph1Title: "🎭 1. Outward Composure vs. Unspoken Inner Dilemma",
    paragraph2Title: "🌙 2. Subconscious Solitude & The Private Truth of the Soul",
    specialOfferBadge: "Special Guest Privilege · 5-Year Horizon",
    specialOfferTitle: "Current Life Reality & Complete 5-Year Master Destiny Horoscope (2026–2031)",
    specialOfferDesc: "The secret above is merely a glimpse of your cosmic mirror! What is truly unfolding in your life right now? How will career, wealth, family harmony, and health prosper over the next 5 years (2026–2031)? Download your authoritative 5-Year Premium Horoscope PDF directly onto your iPhone or mobile.",
    featurePoints: [
      "In-depth Mahadasha & Current Planetary Transit Analysis",
      "Year-by-Year Predictions for 5 Consecutive Years (Year 1 to Year 5)",
      "Career Growth, Promotions, Business & Wealth Forecast",
      "Family Harmony, Marriage, Relationships & Health Shield",
      "Sacred Gokarna Remedies, Classical Vedic Stotras & Priestly Blessings"
    ],
    regularPriceLabel: "Standard Fee: ₹1,500",
    packageSelectTitle: "Select Your Horoscope Package",
    packageStandardTitle: "Standard Vedic Destiny Package",
    packageStandardPrice: "₹350",
    packageStandardDesc: "5-Year Master Destiny PDF (2026–2031) + Authentic Baggona Janma Kundali Multi-Page PDF",
    packageRemedyTitle: "Premium Destiny + Sacred Gokarna Remedy (Recommended)",
    packageRemedyPrice: "₹450",
    packageRemedyDesc: "5-Year Destiny PDF + Baggona Janma Kundali PDF + Sacred Gokarna Remedy & Japa Mantra Dossier PDF (+₹100)",
    packageRemedyBadge: "Highly Recommended",
    payUnlockCta: "💳 Pay & Unlock Premium PDFs",
    upiSectionTitle: "📱 Instant UPI Payment & PDF Unlock",
    paymentInstructions: "Tap PhonePe / GPay / Paytm below to pay directly on your mobile, or scan the QR code.",
    phonePeBtn: "Pay via PhonePe",
    gpayBtn: "Pay via Google Pay",
    paytmBtn: "Pay via Paytm / UPI",
    copyUpiBtn: "Copy UPI ID",
    copiedUpiBtn: "✓ Copied",
    instantUnlockTitle: "⚡ Completed payment on PhonePe / GPay?",
    instantUnlockDesc: "No need to copy or type 12-digit UTR numbers! Tap below to instantly unlock & download your PDFs.",
    instantUnlockBtn: "✓ I Have Paid • Download PDFs (1-Tap Auto Unlock)",
    manualUtrToggleText: "Or enter 12-digit UPI reference number manually (Optional)",
    utrLabel: "After payment, enter the 12-digit UTR / UPI Reference Number from your PhonePe / GPay receipt:",
    utrPlaceholder: "e.g., 432109876543 (12 Digits)",
    verifyUtrBtn: "Verify & Unlock PDFs",
    verifyingUtrBtn: "Verifying...",
    verifiedUtrBtn: "✓ Payment Verified",
    pdfReadyHeader: "🎉 Your Official Horoscope PDFs are Ready for Download!",
    downloadFiveYearPdfBtn: "📥 5-Year Master Destiny PDF (2026–2031)",
    downloadKundliPdfBtn: "📜 Baggona Panchanga Janma Kundali PDF",
    downloadRemedyPdfBtn: "🪔 Sacred Gokarna Remedy & Mantra Dossier PDF",
    downloadAllPdfsBtn: "📦 Download All PDFs (Complete Package)",
    downloadedBtn: "✓ Downloaded",
    downloadAllCompletedBtn: "✓ All PDFs Downloaded (Completed)",
    viewPdfBtn: "👁️ View PDF (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari Users: Tap above to download. You can also view in a new tab, tap the Safari Share icon, and select 'Save to Files' or 'Books'.",
    unpaidWarning: "Payment verification required. Complete payment to download official PDFs.",
    footerSanctum: "॥ Sri Kshetra Gokarna Mahabaleshwara Sanctum · Baggona Panchanga Astrology ॥",
    footerContact: `For Seva Assistance or Sankalpa, Contact: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "Please enter your full name.",
    cityNotFoundError: "Location not found. Please enter a nearby town or pincode.",
    calcError: "Calculation error occurred. Please verify your birth date and time.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "Live Cosmic Vitality Voltage & Gochara Nirnaya",
    gocharaSectionBadge: "ASTRONOMICAL TRANSIT",
    shaniTransitTitle: "Saturn Transit Status",
    guruBalaTitle: "Jupiter Guru Bala",
    runningDashaTitle: "Running Mahadasha & Bhukti",
    turningPointVerdictTitle: "Immediate Turning Point Verdict:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "CLASSICAL SHASTRA",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "Your Divine Lucky Blueprint (100% Free Gift)",
    luckyBlueprintBadge: "LUCKY ALIGNMENT",
    luckyGemstoneLabel: "Lucky Gemstone",
    luckyDayLabel: "Auspicious Day",
    luckyNumberLabel: "Lucky Number",
    luckyDirectionColorLabel: "Direction & Color",
    ishtaDevataLabel: "Ishta Devata:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "Next 5-Year Horizon Sneak Preview (2026–2031)",
    fiveYearPreviewSubtitle: "Year 1 Free Preview · Years 2–5 Locked Mystery Questions",
    year1FreeBadge: "YEAR 1 FREE",
    vitalityScoreLabel: "Vitality Score",
    turningPointSeasonLabel: "Turning Point Season:",
    goldenOpportunityLabel: "Golden Opportunity Window:",
    cautionAlertLabel: "Immediate Caution Alert:",
    lockedYearsNotice: "🔒 Next Years Horizon (Years 2 to 5) - Unlocked in Full Dossier",
    yearNumLabel: "Year",

    // Dining Special Offer Card
    dinerSpecialBadge: "Pandit Palette Special Dining Privilege",
    dinerSpecialDiscountNotice: "🍽️ Dining Table Privilege: Unlocking for ₹350 is only available while seated at Pandit Palette. (Standard Fee: ₹1,500 - 77% OFF)",
    unlockFiveYearCtaBtn: "🔓 Unlock Full 5-Year Master Horizon for ₹350",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 Launching PhonePe...",
    launchingPhonePeMsg: "Please complete payment in PhonePe...",
    launchingGPayTitle: "📲 Launching Google Pay...",
    launchingGPayMsg: "Please complete payment in Google Pay...",
    launchingPaytmTitle: "📲 Launching Paytm...",
    launchingPaytmMsg: "Please complete payment in Paytm...",

    // UTR verification & Download Center
    utrSectionTitle: "Payment Verification (12-Digit UPI UTR Verification)",
    singleUseNotice: "Notice: Under security protocol, each PDF file can only be downloaded once.",
    alreadyDownloadedAlert: "This PDF has already been downloaded. Single-use download per file is enforced.",
    allAlreadyDownloadedAlert: "All PDFs have already been downloaded. Re-downloading is disabled.",
    generatingKundliPdfStage: "Generating Baggona Panchanga Janma Kundali PDF...",
    generatingRemedyPdfStage: "Generating Sacred Gokarna Remedy PDF...",
    paymentVerifiedSuccess: "Payment verified successfully!"
  },
  hi: {
    topMantra: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
    defaultSanctuaryTitle: "पंडित पैलेट",
    tableLabel: "टेबल",
    langSelectHeader: "अपनी पसंदीदा भाषा चुनें",
    langSelectSubtitle: "अपनी भाषा में अपने अंतर्मन का सत्य, बग्गोण जन्म कुंडली एवं 5-वर्षीय महा भविष्य जानें",
    startReadingBtn: "आगे बढ़ें • निःशुल्क अंतर्मन का सत्य जानें →",
    changeLangBtn: "← भाषा बदलें",
    freeBannerBadge: "✨ भोजन से पूर्व अपने अंतर्मन का सत्य जानें • 100% निःशुल्क",
    heroTitle: "अंतरंग का सत्य",
    heroSubtitle: "वह कौन सा गुप्त रहस्य और आंतरिक द्वंद्व है जो आपने कभी किसी से साझा नहीं किया? जन्म विवरण देकर 1-क्लिक में जानें!",
    formHeader: "आपके जन्म का विवरण",
    freeTag: "100% निःशुल्क",
    nameLabel: "आपका पूरा नाम *",
    namePlaceholder: "उदा: राहुल शर्मा",
    dateLabel: "जन्म तिथि *",
    timeLabel: "जन्म समय *",
    genderLabel: "लिंग",
    maleLabel: "पुरुष",
    femaleLabel: "महिला",
    placeLabel: "जन्म स्थान",
    customSearchPlaceholder: "अन्य शहर या पिनकोड खोजें...",
    searchButton: "खोजें",
    searchingButton: "खोजा जा रहा है...",
    revealSecretCta: "🔮 मेरे अंतर्मन का सत्य बताएं • 100% निःशुल्क",
    calculatingCta: "जन्मकुंडली का गूढ़ विश्लेषण हो रहा है...",
    resultHeading: "के अंतर्मन का गुप्त रहस्य",
    resultBadge: "॥ अंतरंग का सत्य · गूढ़ जन्मकुंडली रहस्य ॥",
    authenticTruthBadge: "✓ 100% सटीक वैदिक ज्योतिष सत्य",
    moonSignLabel: "चन्द्र राशि",
    starLabel: "जन्म नक्षत्र",
    lagnaLabel: "जन्म लग्न",
    h8LordLabel: "अष्टमेश (गुप्त भाव)",
    paragraph1Title: "🎭 1. बाह्य मुखौटा और अंतर्मन का अनकहा द्वंद्व",
    paragraph2Title: "🌙 2. एकांत की मौन वेदना और अनकहा गुप्त रहस्य",
    specialOfferBadge: "होटल अतिथि विशेष विशेषाधिकार",
    specialOfferTitle: "वर्तमान जीवन स्थिति एवं आगामी 5 वर्षों की संपूर्ण महा कुंडली (2026-2031)",
    specialOfferDesc: "ऊपर दिया गया सत्य केवल एक सूक्ष्म झलक है! वर्तमान में आपके जीवन में क्या घटित हो रहा है? आगामी 5 वर्षों (2026-2031) में आपका करियर, धन, पारिवारिक सुख और स्वास्थ्य कैसा रहेगा? संपूर्ण प्रीमियम महा कुंडली PDF अपने iPhone/मोबाइल में प्राप्त करें।",
    featurePoints: [
      "वर्तमान महादशा और गोचर ग्रहों का सूक्ष्म विश्लेषण",
      "आगामी 5 वर्षों का वर्षवार (1 से 5) भविष्यफल",
      "करियर, पदोन्नति, व्यापार और आर्थिक समृद्धि की भविष्यवाणियां",
      "पारिवारिक सौख्य, विवाह योग एवं स्वास्थ्य रक्षा कवच",
      "श्री क्षेत्र गोकर्ण सन्निधान के सिद्ध उपाय, वैदिक स्तोत्र एवं आशीर्वाद"
    ],
    regularPriceLabel: "सामान्य शुल्क: ₹1,500",
    packageSelectTitle: "अपना जन्मकुंडली पैकेज चुनें",
    packageStandardTitle: "मानक वैदिक महा कुंडली पैकेज",
    packageStandardPrice: "₹350",
    packageStandardDesc: "5-वर्षीय महा कुंडली PDF (2026-2031) + प्रामाणिक बग्गोण जन्म कुंडली PDF",
    packageRemedyTitle: "प्रीमियम महा कुंडली + गोकर्ण दैविक उपाय (अनुशंसित)",
    packageRemedyPrice: "₹450",
    packageRemedyDesc: "5-वर्षीय PDF + बग्गोण जन्म कुंडली PDF + गोकर्ण सिद्ध दैविक उपाय एवं मंत्र साधना रिपोर्ट PDF (+₹100)",
    packageRemedyBadge: "अत्यधिक अनुशंसित",
    payUnlockCta: "💳 भुगतान कर संपूर्ण PDF अनलॉक करें",
    upiSectionTitle: "📱 त्वरित UPI भुगतान एवं PDF अनलॉक",
    paymentInstructions: "PhonePe / GPay / Paytm बटन पर टैप करें या ऊपर दिए QR कोड को स्कैन करें।",
    phonePeBtn: "PhonePe द्वारा भुगतान करें",
    gpayBtn: "Google Pay द्वारा भुगतान करें",
    paytmBtn: "Paytm / अन्य UPI से भुगतान करें",
    copyUpiBtn: "कॉपी करें",
    copiedUpiBtn: "✓ कॉपी हो गया",
    instantUnlockTitle: "⚡ PhonePe पर भुगतान पूर्ण हो गया?",
    instantUnlockDesc: "12-अंकीय UTR नंबर टाइप करने की आवश्यकता नहीं! नीचे क्लिक कर तुरंत PDF डाउनलोड करें।",
    instantUnlockBtn: "✓ भुगतान हो गया • तुरंत PDF डाउनलोड करें",
    manualUtrToggleText: "अथवा 12-अंकीय UTR संदर्भ संख्या स्वयं दर्ज करें (वैकल्पिक)",
    utrLabel: "भुगतान के उपरांत PhonePe / GPay रसीद से 12-अंकीय UTR / UPI संदर्भ संख्या यहां दर्ज करें:",
    utrPlaceholder: "उदा: 432109876543 (12 अंक)",
    verifyUtrBtn: "सत्यापित करें व PDF प्राप्त करें",
    verifyingUtrBtn: "सत्यापित हो रहा है...",
    verifiedUtrBtn: "✓ भुगतान सत्यापित",
    pdfReadyHeader: "🎉 आपकी आधिकारिक जन्मकुंडली PDF डाउनलोड के लिए तैयार हैं!",
    downloadFiveYearPdfBtn: "📥 5-वर्षीय महा कुंडली भविष्यफल PDF",
    downloadKundliPdfBtn: "📜 बग्गोण पंचांग जन्म कुंडली PDF",
    downloadRemedyPdfBtn: "🪔 गोकर्ण दैविक उपाय व मंत्र साधना PDF",
    downloadAllPdfsBtn: "📦 सभी PDF एक साथ डाउनलोड करें",
    downloadedBtn: "✓ डाउनलोड हो गया",
    downloadAllCompletedBtn: "✓ सभी PDF डाउनलोड हो गए",
    viewPdfBtn: "👁️ PDF देखें",
    iphoneSafariTip: "iPhone Safari उपयोगकर्ता: ऊपर क्लिक कर PDF डाउनलोड करें या Safari Share आइकन से 'Save to Files' में सुरक्षित करें।",
    unpaidWarning: "भुगतान सत्यापन आवश्यक है। आधिकारिक PDF डाउनलोड करने के लिए भुगतान पूरा करें।",
    footerSanctum: "॥ श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    footerContact: `पूजा संकल्प या सहायता के लिए संपर्क करें: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "कृपया अपना पूरा नाम दर्ज करें।",
    cityNotFoundError: "स्थान नहीं मिला। कृपया नजदीकी शहर या पिनकोड दर्ज करें।",
    calcError: "कुंडली गणना में त्रुटि। कृपया जन्म तिथि और समय जांचें।",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "वर्तमान ग्रहबल, जीवन ऊर्जा एवं गोचर निर्णय",
    gocharaSectionBadge: "शास्त्रीय गोचर निर्णय",
    shaniTransitTitle: "शनि गोचर स्थिति",
    guruBalaTitle: "गुरुबल अनुग्रह",
    runningDashaTitle: "वर्तमान महादशा - अंतर्दशा",
    turningPointVerdictTitle: "तात्कालिक जीवन निर्णय:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "शास्त्रीय फल",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "आपके दैवीय भाग्यशाली तत्व (निःशुल्क उपहार)",
    luckyBlueprintBadge: "भाग्य रक्षा",
    luckyGemstoneLabel: "भाग्यशाली रत्न",
    luckyDayLabel: "शुभ दिन",
    luckyNumberLabel: "भाग्यशाली अंक",
    luckyDirectionColorLabel: "शुभ दिशा एवं रंग",
    ishtaDevataLabel: "इष्टदेव:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "आगामी ५ वर्षों का स्वर्णिम काल एवं महत्वपूर्ण पूर्वावलोकन (2026–2031)",
    fiveYearPreviewSubtitle: "वर्ष १ निःशुल्क पूर्वावलोकन · वर्ष २-५ रहस्यमय प्रश्न",
    year1FreeBadge: "वर्ष १ निःशुल्क",
    vitalityScoreLabel: "जीवन ऊर्जा स्कोर",
    turningPointSeasonLabel: "महा परिवर्तन ऋतु:",
    goldenOpportunityLabel: "स्वर्णिम अवसर काल:",
    cautionAlertLabel: "वर्ष १ की चेतावनी:",
    lockedYearsNotice: "🔒 आगामी वर्ष (वर्ष २ से ५) - सम्पूर्ण महा कुंडली में उपलब्ध",
    yearNumLabel: "वर्ष",

    // Dining Special Offer Card
    dinerSpecialBadge: "पंडित पैलेट विशेष अतिथि विशेषाधिकार",
    dinerSpecialDiscountNotice: "🍽️ डाइनिंग टेबल विशेष छूट: केवल पंडित पैलेट में भोजन करते समय ₹३५० में अनलॉक उपलब्ध है। (सामान्य शुल्क: ₹१,५०० - ७७% छूट)",
    unlockFiveYearCtaBtn: "🔓 मात्र ₹३५० में सम्पूर्ण ५-वर्षीय महा कुंडली अनलॉक करें",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe खोला जा रहा है...",
    launchingPhonePeMsg: "PhonePe में भुगतान पूर्ण करें...",
    launchingGPayTitle: "📲 Google Pay खोला जा रहा है...",
    launchingGPayMsg: "Google Pay में भुगतान पूर्ण करें...",
    launchingPaytmTitle: "📲 Paytm खोला जा रहा है...",
    launchingPaytmMsg: "Paytm में भुगतान पूर्ण करें...",

    // UTR verification & Download Center
    utrSectionTitle: "भुगतान सत्यापन (१२-अंकीय UPI UTR सत्यापन)",
    singleUseNotice: "सूचना: सुरक्षा नियमों के अनुसार प्रत्येक फाइल केवल एक बार डाउनलोड की जा सकती है।",
    alreadyDownloadedAlert: "यह PDF पहले ही डाउनलोड की जा चुकी है। प्रत्येक फाइल के लिए एक बार डाउनलोड की अनुमति है।",
    allAlreadyDownloadedAlert: "सभी PDF पहले ही डाउनलोड की जा चुकी हैं। पुनः डाउनलोड प्रतिबंधित है।",
    generatingKundliPdfStage: "बग्गोण पंचांग जन्म कुंडली PDF तैयार हो रही है...",
    generatingRemedyPdfStage: "श्री क्षेत्र गोकर्ण सिद्ध उपाय रिपोर्ट तैयार हो रही है...",
    paymentVerifiedSuccess: "भुगतान सफलतापूर्वक सत्यापित हो गया!"
  },
  te: {
    topMantra: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్నం ॥",
    defaultSanctuaryTitle: "పండిట్ ప్యాలెట్",
    tableLabel: "టేబుల్",
    langSelectHeader: "మీ భాషను ఎంచుకోండి",
    langSelectSubtitle: "మీ భాషలో మీ అంతరంగ సత్యం, బగ్గోణ జన్మ కుండలి మరియు 5 సంవత్సరాల భవిష్యత్తు తెలుసుకోండి",
    startReadingBtn: "కొనసాగించండి • ఉచిత అంతరంగ సత్యం తెలుసుకోండి →",
    changeLangBtn: "← భాష మార్చండి",
    freeBannerBadge: "✨ భోజనానికి ముందు మీ అంతరంగ సత్యం తెలుసుకోండి • 100% ఉచితం",
    heroTitle: "అంతరంగ సత్యం",
    heroSubtitle: "ఎవరికీ చెప్పలేని ఏ అంతర్గత రహస్యాలు మరియు నిశ్శబ్ద వేదనలను మీరు మోస్తున్నారు? మీ పుట్టిన వివరాలు అందించి 1-క్లిక్‌లో తెలుసుకోండి!",
    formHeader: "మీ జనన వివరాలు",
    freeTag: "100% ఉచితం",
    nameLabel: "మీ పూర్తి పేరు *",
    namePlaceholder: "ఉదా: రమేష్ రావు",
    dateLabel: "పుట్టిన తేదీ *",
    timeLabel: "పుట్టిన సమయం *",
    genderLabel: "లింగం",
    maleLabel: "పురుషుడు",
    femaleLabel: "స్త్రీ",
    placeLabel: "పుట్టిన స్థలం",
    customSearchPlaceholder: "ఇతర నగరం లేదా పిన్‌కోడ్ శోధించండి...",
    searchButton: "శోధించండి",
    searchingButton: "శోధిస్తోంది...",
    revealSecretCta: "🔮 నా అంతరంగ సత్యాన్ని వెల్లడించండి • 100% ఉచితం",
    calculatingCta: "జాతక అంతరంగాన్ని విశ్లేషిస్తోంది...",
    resultHeading: "వారి అంతరంగ నిగూఢ సత్యం",
    resultBadge: "॥ అంతరంగ సత్యం · నిగూఢ జాతక రహస్యం ॥",
    authenticTruthBadge: "✓ 100% ఖచ్చితమైన వేద జ్యోతిష్యం",
    moonSignLabel: "చంద్ర రాశి",
    starLabel: "జన్మ నక్షత్రం",
    lagnaLabel: "జన్మ లగ్నం",
    h8LordLabel: "అష్టమాధిపతి (రహస్య భావం)",
    paragraph1Title: "🎭 1. బాహ్య గాంభీర్యం మరియు ఎవరికీ చెప్పలేని అంతర్గత ఘర్షణ",
    paragraph2Title: "🌙 2. ఏకాంతపు నిశ్శబ్ద వేదన మరియు ఎవరికీ తెలియని రహస్యం",
    specialOfferBadge: "హోటల్ అతిథి ప్రత్యేక అవకాశం",
    specialOfferTitle: "ప్రస్తుత జీవిత స్థితి మరియు రాబోయే 5 సంవత్సరాల సంపూర్ణ మహా జాతకం (2026-2031)",
    specialOfferDesc: "పైన తెలిపిన అంతరంగ సత్యం ఒక చిన్న నమూనా మాత్రమే! ప్రస్తుతం మీ జీవితంలో నిజంగా ఏమి జరుగుతోంది? రాబోయే 5 సంవత్సరాలలో (2026-2031) మీ కెరీర్, ఆర్థిక ఎదుగుదల, కుటుంబం, ఆరోగ్యం ఎలా ఉంటాయి? పూర్తి ప్రీమియం జాతక PDF మీ మొబైల్‌లోనే పొందండి.",
    featurePoints: [
      "ప్రస్తుత మహాదశ మరియు గ్రహ గోచారాల విశ్లేషణ",
      "రాబోయే 5 సంవత్సరాల సంవత్సరం వారీ (1 నుండి 5) ఫలితాలు",
      "ఉద్యోగం, ప్రమోషన్, వ్యాపారం మరియు ధనలాభ అవకాశాలు",
      "కుటుంబ శాంతి, వివాహ యోగం మరియు ఆరోగ్య రక్షా కవచం",
      "శ్రీ గోకర్ణ సన్నిధాన ఆశీస్సులు, సిద్ధ పరిహారాలు & స్తోత్రాలు"
    ],
    regularPriceLabel: "సాధారణ రుసుము: ₹1,500",
    packageSelectTitle: "మీ జాతక ప్యాకేజీని ఎంచుకోండి",
    packageStandardTitle: "ప్రామాణిక వేద జాతక ప్యాకేజీ",
    packageStandardPrice: "₹350",
    packageStandardDesc: "5 సంవత్సరాల మహా జాతకం PDF (2026-2031) + అసలైన బగ్గోణ జన్మ కుండలి PDF",
    packageRemedyTitle: "ప్రీమియం జాతకం + పవిత్ర గోకర్ణ పరిహారాలు (సిఫార్సు చేయబడింది)",
    packageRemedyPrice: "₹450",
    packageRemedyDesc: "5 సంవత్సరాల PDF + బగ్గోణ జన్మ కుండలి PDF + గోకర్ణ సిద్ధ పరిహారాలు & మంత్ర సాధన రిపోర్ట్ PDF (+₹100)",
    packageRemedyBadge: "అత్యంత సిఫార్సు చేయబడింది",
    payUnlockCta: "💳 చెల్లించి వెంటనే PDF డౌన్‌లోడ్ చేసుకోండి",
    upiSectionTitle: "📱 తక్షణ UPI చెల్లింపు & PDF అన్‌లాక్",
    paymentInstructions: "PhonePe / GPay / Paytm బటన్‌పై నొక్కండి లేదా పైన ఉన్న QR కోడ్‌ను స్కాన్ చేయండి.",
    phonePeBtn: "PhonePe ద్వారా చెల్లించండి",
    gpayBtn: "Google Pay ద్వారా చెల్లించండి",
    paytmBtn: "Paytm / ఇతర UPI ద్వారా చెల్లించండి",
    copyUpiBtn: "కాపీ చేయండి",
    copiedUpiBtn: "✓ కాపీ అయింది",
    instantUnlockTitle: "⚡ PhonePe లో చెల్లింపు పూర్తయిందా?",
    instantUnlockDesc: "12 అంకెల నంబర్ టైప్ చేయాల్సిన అవసరం లేదు! కింద క్లిక్ చేసి వెంటనే PDF పొందండి.",
    instantUnlockBtn: "✓ చెల్లించాను • వెంటనే PDF డౌన్‌లోడ్ చేయండి",
    manualUtrToggleText: "లేదా 12 అంకెల UTR నంబర్‌ను నమోదు చేయండి (ఐచ్ఛికం)",
    utrLabel: "చెల్లింపు తర్వాత PhonePe / GPay రశీదులోని 12 అంకెల UTR నంబర్‌ను ఇక్కడ నమోదు చేయండి:",
    utrPlaceholder: "ఉదా: 432109876543 (12 అంకెలు)",
    verifyUtrBtn: "ధృవీకరించి PDF పొందండి",
    verifyingUtrBtn: "ధృవీకరిస్తోంది...",
    verifiedUtrBtn: "✓ చెల్లింపు నిర్ధారించబడింది",
    pdfReadyHeader: "🎉 మీ అధికారిక జాతక PDFలు డౌన్‌లోడ్‌కు సిద్ధంగా ఉన్నాయి!",
    downloadFiveYearPdfBtn: "📥 5 సంవత్సరాల మహా జాతక భవిష్యత్తు PDF",
    downloadKundliPdfBtn: "📜 బగ్గోణ పంచాంగ జన్మ కుండలి PDF",
    downloadRemedyPdfBtn: "🪔 గోకర్ణ దైవిక పరిహారాలు & మంత్ర సాధన PDF",
    downloadAllPdfsBtn: "📦 అన్ని PDFలు కలిపి డౌన్‌లోడ్ చేసుకోండి",
    downloadedBtn: "✓ డౌన్‌లోడ్ పూర్తయింది",
    downloadAllCompletedBtn: "✓ అన్ని PDFలు డౌన్‌లోడ్ అయ్యాయి",
    viewPdfBtn: "👁️ PDF చూడండి",
    iphoneSafariTip: "iPhone Safari వినియోగదారులు: పైన క్లిక్ చేస్తే PDF ఓపెన్ అవుతుంది. Share చిహ్నం నొక్కి 'Save to Files' లో సేవ్ చేయవచ్చు.",
    unpaidWarning: "చెల్లింపు ధృవీకరణ అవసరం. అధికారిక PDFలను డౌన్‌లోడ్ చేయడానికి చెల్లింపును పూర్తి చేయండి.",
    footerSanctum: "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    footerContact: `సహాయం లేదా పూజా సంకల్పం కొరకు సంప్రదించండి: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.",
    cityNotFoundError: "ప్రదేశం కనుగొనబడలేదు. దయచేసి సమీప పట్టణం లేదా పిన్‌కోడ్ నమోదు చేయండి.",
    calcError: "జాతక గణనలో లోపం జరిగింది. పుట్టిన తేదీ మరియు సమయాన్ని తనిఖీ చేయండి.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "ప్రస్తుత గ్రహబలం, జీవశక్తి & గోచార నిర్ణయం",
    gocharaSectionBadge: "శాస్త్రీయ గోచార నిర్ణయం",
    shaniTransitTitle: "శని గోచార స్థితి",
    guruBalaTitle: "గురుబల అనుగ్రహం",
    runningDashaTitle: "ప్రస్తుత మహాదశ - అంతర్దశ",
    turningPointVerdictTitle: "తక్షణ జీవిత నిర్ణయం:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "శాస్త్రీయ ఫలితం",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "మీ దివ్య అదృష్ట అంశాలు (ఉచిత బహుమతి)",
    luckyBlueprintBadge: "అదృష్ట రక్ష",
    luckyGemstoneLabel: "అదృష్ట రత్నం",
    luckyDayLabel: "శుభ వారం",
    luckyNumberLabel: "అదృష్ట సంఖ్య",
    luckyDirectionColorLabel: "శుభ దిశ & వర్ణం",
    ishtaDevataLabel: "ఇష్టదైవం:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "రాబోయే 5 సంవత్సరాల సువర్ణ కాలం & ముందస్తు దర్శనం (2026–2031)",
    fiveYearPreviewSubtitle: "సంవత్సరం 1 ఉచిత దర్శనం · సంవత్సరాలు 2-5 రహస్య ప్రశ్నలు",
    year1FreeBadge: "సంవత్సరం 1 ఉచితం",
    vitalityScoreLabel: "జీవశక్తి స్కోర్",
    turningPointSeasonLabel: "మలుపు తిప్పే ఋతువు:",
    goldenOpportunityLabel: "సువర్ణావకాశ కాలం:",
    cautionAlertLabel: "సంవత్సరం 1 హెచ్చరిక:",
    lockedYearsNotice: "🔒 తర్వాతి సంవత్సరాలు (సంవత్సరం 2 నుండి 5) - సంపూర్ణ జాతకంలో లభ్యం",
    yearNumLabel: "సంవత్సరం",

    // Dining Special Offer Card
    dinerSpecialBadge: "పండిట్ ప్యాలెట్ ప్రత్యేక అతిథి సదుపాయం",
    dinerSpecialDiscountNotice: "🍽️ డైనింగ్ టేబుల్ ప్రత్యేక రాయితీ: మీరు పండిట్ ప్యాలెట్‌లో భోజనం చేస్తున్న ఈ సమయంలో మాత్రమే ₹350 కి అన్‌లాక్ అందుబాటులో ఉంది. (సాధారణ రుసుము: ₹1,500 - 77% రాయితీ)",
    unlockFiveYearCtaBtn: "🔓 కేవలం ₹350 చెల్లించి 5 సంవత్సరాల సంపూర్ణ జాతకాన్ని అన్‌లాక్ చేయండి",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe తెరవబడుతోంది...",
    launchingPhonePeMsg: "PhonePe లో చెల్లింపు పూర్తి చేయండి...",
    launchingGPayTitle: "📲 Google Pay తెరవబడుతోంది...",
    launchingGPayMsg: "Google Pay లో చెల్లింపు పూర్తి చేయండి...",
    launchingPaytmTitle: "📲 Paytm తెరవబడుతోంది...",
    launchingPaytmMsg: "Paytm లో చెల్లింపు పూర్తి చేయండి...",

    // UTR verification & Download Center
    utrSectionTitle: "చెల్లింపు ధృవీకరణ (12 అంకెల UPI UTR ధృవీకరణ)",
    singleUseNotice: "గమనిక: భద్రతా నిబంధనల ప్రకారం, ప్రతి ఫైల్ ఒకసారి మాత్రమే డౌన్‌లోడ్ చేయబడుతుంది.",
    alreadyDownloadedAlert: "ఈ PDF ఇప్పటికే డౌన్‌లోడ్ చేయబడింది. ఒక్కో ఫైల్‌కు ఒకసారి మాత్రమే అనుమతించబడుతుంది.",
    allAlreadyDownloadedAlert: "అన్ని PDFలు ఇప్పటికే డౌన్‌లోడ్ చేయబడ్డాయి. తిరిగి డౌన్‌లోడ్ చేయడం నిరోధించబడింది.",
    generatingKundliPdfStage: "బగ్గోణ పంచాంగ జన్మ కుండలి PDF సిద్ధమవుతోంది...",
    generatingRemedyPdfStage: "శ్రీ గోకర్ణ దైవిక పరిహార నివేదిక సిద్ధమవుతోంది...",
    paymentVerifiedSuccess: "చెల్లింపు విజయవంతంగా ధృవీకరించబడింది!"
  },
  ta: {
    topMantra: "॥ ஸ்ரீ கோகர்ணம் மகாபலேஸ்வர சுவாமி பிரசன்னம் ॥",
    defaultSanctuaryTitle: "பண்டிட் பேலட்",
    tableLabel: "மேஜை",
    langSelectHeader: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    langSelectSubtitle: "உங்கள் மொழியில் அந்தரங்க ரகசியம், பக்கோண ஜென்ம குண்டலி மற்றும் 5 ஆண்டு ஜாதகம் அறியுங்கள்",
    startReadingBtn: "தொடரவும் • இலவச அந்தரங்க ரகசியம் அறிக →",
    changeLangBtn: "← மொழி மாற்றுக",
    freeBannerBadge: "✨ உணவுக்கு முன் உங்கள் மனதின் ரகசியத்தை அறியுங்கள் • 100% இலவசம்",
    heroTitle: "அந்தரங்க ரகசியம்",
    heroSubtitle: "யாரிடமும் கூறாத எந்த ரகசியங்களையும் உள்ளக் குமுறல்களையும் நீங்கள் மௌனமாக சுமக்கிறீர்கள்? உங்கள் பிறந்த விவரங்களை அளித்து 1-கிளிக்கில் அறியுங்கள்!",
    formHeader: "உங்கள் பிறப்பு விவரங்கள்",
    freeTag: "100% இலவசம்",
    nameLabel: "உங்கள் முழுப் பெயர் *",
    namePlaceholder: "உதா: செந்தில் குமார்",
    dateLabel: "பிறந்த தேதி *",
    timeLabel: "பிறந்த நேரம் *",
    genderLabel: "பாலினம்",
    maleLabel: "ஆண்",
    femaleLabel: "பெண்",
    placeLabel: "பிறந்த இடம்",
    customSearchPlaceholder: "வேறு நகரம் அல்லது பின்கோட் தேடுக...",
    searchButton: "தேடுக",
    searchingButton: "தேடுகிறது...",
    revealSecretCta: "🔮 எனது அந்தரங்க ரகசியத்தை வெளிப்படுத்துங்கள் • 100% இலவசம்",
    calculatingCta: "ஜாதக ரகசிய ஆய்வு நடக்கிறது...",
    resultHeading: "அவர்களின் அந்தரங்க மௌன ரகசியம்",
    resultBadge: "॥ அந்தரங்க ரகசியம் · மறைமுக ஜாதக உண்மை ॥",
    authenticTruthBadge: "✓ 100% துல்லிய வேத ஜோதிட உண்மை",
    moonSignLabel: "சந்திர ராசி",
    starLabel: "ஜென்ம நட்சத்திரம்",
    lagnaLabel: "ஜென்ம லக்னம்",
    h8LordLabel: "எட்டாம் அதிபதி (ரகசிய பாவம்)",
    paragraph1Title: "🎭 1. வெளிப்படையான கம்பீரமும் யாரிடமும் கூறாத உள்ளக் குமுறலும்",
    paragraph2Title: "🌙 2. தனிமையின் மௌன வேதனையும் யாரும் அறியாத ரகசியமும்",
    specialOfferBadge: "ஹோட்டல் விருந்தினர் சிறப்பு சலுகை",
    specialOfferTitle: "தற்போதைய வாழ்க்கை நிலையும் அடுத்த 5 ஆண்டுகளுக்கான முழு மகா ஜாதகமும் (2026-2031)",
    specialOfferDesc: "மேலே கூறப்பட்ட உண்மை ஒரு சிறு முன்னோட்டம் மட்டுமே! தற்போது உங்கள் வாழ்வில் என்ன நடக்கிறது? அடுத்த 5 ஆண்டுகளில் (2026-2031) உங்கள் தொழில், பொருளாதார வளர்ச்சி, குடும்பம், ஆரோக்கியம் எப்படி இருக்கும்? பிரீமியம் ஜாதக PDF உங்கள் மொபைலிலேயே பெறுங்கள்.",
    featurePoints: [
      "தற்போதைய மகா திசை மற்றும் கோச்சார கிரக ஆய்வு",
      "அடுத்த 5 ஆண்டுகளின் ஆண்டுவாரியான (1 முதல் 5) துல்லிய பலன்கள்",
      "வேலை வாய்ப்பு, பதவி உயர்வு, தொழில் மற்றும் பண வரவு கணிப்புகள்",
      "குடும்ப அமைதி, திருமண யோகம் மற்றும் ஆரோக்கிய பாதுகாப்பு கவசம்",
      "ஸ்ரீ கோகர்ணம் சன்னிதானத்தின் சித்த பரிகாரங்கள், ஸ்தோத்திரங்கள் & ஆசிகள்"
    ],
    regularPriceLabel: "வழக்கமான கட்டணம்: ₹1,500",
    packageSelectTitle: "உங்கள் ஜாதக தொகுப்பைத் தேர்ந்தெடுக்கவும்",
    packageStandardTitle: "நிலையான வேத ஜாதக தொகுப்பு",
    packageStandardPrice: "₹350",
    packageStandardDesc: "5 ஆண்டு மகா ஜாதக PDF (2026-2031) + அதிகாரப்பூர்வ பக்கோண ஜென்ம குண்டலி PDF",
    packageRemedyTitle: "பிரீமியம் ஜாதகம் + புனித கோகர்ணம் பரிகாரம் (பரிந்துரைக்கப்பட்டது)",
    packageRemedyPrice: "₹450",
    packageRemedyDesc: "5 ஆண்டு PDF + பக்கோண ஜென்ம குண்டலி PDF + கோகர்ணம் பரிகாரம் & மந்திர சாதனை PDF (+₹100)",
    packageRemedyBadge: "அதிகம் பரிந்துரைக்கப்படுகிறது",
    payUnlockCta: "💳 கட்டணம் செலுத்தி PDF உடனடியாக பதிவிறக்கவும்",
    upiSectionTitle: "📱 உடனடி UPI கட்டணம் & PDF திறத்தல்",
    paymentInstructions: "PhonePe / GPay / Paytm பொத்தானை அழுத்தவும் அல்லது மேலே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    phonePeBtn: "PhonePe மூலம் கட்டணம் செலுத்துக",
    gpayBtn: "Google Pay மூலம் செலுத்துக",
    paytmBtn: "Paytm / பிற UPI மூலம் செலுத்துக",
    copyUpiBtn: "நகலெடு",
    copiedUpiBtn: "✓ நகலெடுக்கப்பட்டது",
    instantUnlockTitle: "⚡ PhonePe-ல் கட்டணம் செலுத்திவிட்டீர்களா?",
    instantUnlockDesc: "12 இலக்க எண் தட்டச்சு செய்ய வேண்டிய அவசியமில்லை! கீழே கிளிக் செய்து உடனடியாக PDF பதிவிறக்கவும்.",
    instantUnlockBtn: "✓ செலுத்திவிட்டேன் • உடனடியாக PDF பெறுக",
    manualUtrToggleText: "அல்லது 12 இலக்க UTR எண்ணை உள்ளிடவும் (விருப்பத்தேர்வு)",
    utrLabel: "கட்டணம் செலுத்திய பிறகு PhonePe / GPay ரசீதில் உள்ள 12 இலக்க UTR எண்ணை உள்ளிடவும்:",
    utrPlaceholder: "உதா: 432109876543 (12 இலக்கங்கள்)",
    verifyUtrBtn: "சரிபார்த்து PDF பெறுக",
    verifyingUtrBtn: "சரிபார்க்கப்படுகிறது...",
    verifiedUtrBtn: "✓ கட்டணம் உறுதியானது",
    pdfReadyHeader: "🎉 உங்கள் அதிகாரப்பூர்வ ஜாதக PDFகள் தயாராகிவிட்டன!",
    downloadFiveYearPdfBtn: "📥 5 ஆண்டு மகா ஜாதக பலன் PDF",
    downloadKundliPdfBtn: "📜 பக்கோண பஞ்சாங்க ஜென்ம குண்டலி PDF",
    downloadRemedyPdfBtn: "🪔 கோகர்ணம் பரிகார & மந்திர சாதனை PDF",
    downloadAllPdfsBtn: "📦 அனைத்து PDFகளையும் ஒன்றாக பதிவிறக்குக",
    downloadedBtn: "✓ பதிவிறக்கம் செய்யப்பட்டது",
    downloadAllCompletedBtn: "✓ அனைத்து PDFகளும் பதிவிறக்கம் செய்யப்பட்டன",
    viewPdfBtn: "👁️ PDF பார்க்க",
    iphoneSafariTip: "iPhone Safari பயனர்கள்: மேலே கிளிக் செய்தால் PDF திறக்கும். கீழே உள்ள Share குறியீட்டை அழுத்தி 'Save to Files' அல்லது 'Books' இல் சேமிக்கலாம்.",
    unpaidWarning: "கட்டண சரிபார்ப்பு தேவை. அதிகாரப்பூர்வ PDF பதிவிறக்க கட்டணத்தை முடிக்கவும்.",
    footerSanctum: "॥ ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வர சன்னிதானம் · பக்கவணா ஜோதிடம் ॥",
    footerContact: `உதவி அல்லது பூஜை சங்கல்பத்திற்கு தொடர்பு கொள்ளவும்: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.",
    cityNotFoundError: "ஊர் கிடைக்கவில்லை. அருகிலுள்ள நகரம் அல்லது பின்கோட் உள்ளிடவும்.",
    calcError: "ஜாதகக் கணிப்பில் பிழை ஏற்பட்டுள்ளது. பிறந்த தேதி மற்றும் நேரத்தை சரிபார்க்கவும்.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "தற்போதைய கிரகபலம், ஆற்றல் நிலை & கோச்சார முடிவு",
    gocharaSectionBadge: "சாஸ்திர கோச்சார முடிவு",
    shaniTransitTitle: "சனி கோச்சார நிலை",
    guruBalaTitle: "குருபல அனுக்கிரகம்",
    runningDashaTitle: "தற்போதைய மகாதிசை - புக்தி",
    turningPointVerdictTitle: "உடனடி வாழ்க்கை முடிவு:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "சாஸ்திர பலன்",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "உங்கள் தெய்வீக அதிர்ஷ்ட அம்சங்கள் (இலவச பரிசு)",
    luckyBlueprintBadge: "அதிர்ஷ்ட கவசம்",
    luckyGemstoneLabel: "அதிர்ஷ்ட ரத்தினம்",
    luckyDayLabel: "சுப கிழமை",
    luckyNumberLabel: "அதிர்ஷ்ட எண்",
    luckyDirectionColorLabel: "சுப திசை & நிறம்",
    ishtaDevataLabel: "இஷ்ட தெய்வம்:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "அடுத்த 5 ஆண்டுகளின் பொற்காலம் & ரகசிய முன்னோட்டம் (2026–2031)",
    fiveYearPreviewSubtitle: "ஆண்டு 1 இலவச முன்னோட்டம் · ஆண்டுகள் 2-5 ரகசிய கேள்விகள்",
    year1FreeBadge: "ஆண்டு 1 இலவசம்",
    vitalityScoreLabel: "ஆற்றல் குறியீடு",
    turningPointSeasonLabel: "பெரும் திருப்புமுனை பருவம்:",
    goldenOpportunityLabel: "பொற்கால வாய்ப்பு காலம்:",
    cautionAlertLabel: "ஆண்டு 1 எச்சரிக்கை:",
    lockedYearsNotice: "🔒 அடுத்த ஆண்டுகள் (ஆண்டு 2 முதல் 5) - முழு ஜாதக தொகுப்பில் கிடைக்கும்",
    yearNumLabel: "ஆண்டு",

    // Dining Special Offer Card
    dinerSpecialBadge: "பண்டிட் பேலட் சிறப்பு விருந்தினர் சலுகை",
    dinerSpecialDiscountNotice: "🍽️ டைனிங் டேபிள் சிறப்பு தள்ளுபடி: நீங்கள் பண்டிட் பேலட்டில் உணவு உண்ணும் இந்த நேரத்தில் மட்டுமே ₹350-க்கு அன்லாக் கிடைக்கும். (வழக்கமான கட்டணம்: ₹1,500 - 77% தள்ளுபடி)",
    unlockFiveYearCtaBtn: "🔓 வெறும் ₹350 செலுத்தி 5 ஆண்டு முழு மகா ஜாதகத்தை அன்லாக் செய்க",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe திறக்கப்படுகிறது...",
    launchingPhonePeMsg: "PhonePe-ல் கட்டணத்தை முடிக்கவும்...",
    launchingGPayTitle: "📲 Google Pay திறக்கப்படுகிறது...",
    launchingGPayMsg: "Google Pay-ல் கட்டணத்தை முடிக்கவும்...",
    launchingPaytmTitle: "📲 Paytm திறக்கப்படுகிறது...",
    launchingPaytmMsg: "Paytm-ல் கட்டணத்தை முடிக்கவும்...",

    // UTR verification & Download Center
    utrSectionTitle: "கட்டண சரிபார்ப்பு (12 இலக்க UPI UTR சரிபார்ப்பு)",
    singleUseNotice: "குறிப்பு: பாதுகாப்பு விதிகளின்படி, ஒவ்வொரு கோப்பும் ஒரு முறை மட்டுமே பதிவிறக்க முடியும்.",
    alreadyDownloadedAlert: "இந்த PDF ஏற்கனவே பதிவிறக்கம் செய்யப்பட்டுவிட்டது. ஒரு கோப்பிற்கு ஒரு முறை மட்டுமே அனுமதி உண்டு.",
    allAlreadyDownloadedAlert: "அனைத்து PDFகளும் ஏற்கனவே பதிவிறக்கப்பட்டுவிட்டன. மீண்டும் பதிவிறக்குவது முடக்கப்பட்டுள்ளது.",
    generatingKundliPdfStage: "பக்கோணா பஞ்சாங்க ஜென்ம குண்டலி PDF தயாராகிறது...",
    generatingRemedyPdfStage: "ஸ்ரீ கோகர்ணம் பரிகார அறிக்கை தயாராகிறது...",
    paymentVerifiedSuccess: "கட்டணம் வெற்றிகரமாக சரிபார்க்கப்பட்டது!"
  },
  ml: {
    topMantra: "॥ ശ്രീ ഗോകർണം മഹാബലേശ്വര സ്വാമി പ്രസന്നം ॥",
    defaultSanctuaryTitle: "പണ്ഡിറ്റ് പാലറ്റ്",
    tableLabel: "മേശ",
    langSelectHeader: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    langSelectSubtitle: "നിങ്ങളുടെ ഭാഷയിൽ അന്തരംഗ രহസ്യം, ബഗ്ഗോണ ജന്മ കുണ്ഡലി, 5 വർഷത്തെ ഭാവിയും അറിയുക",
    startReadingBtn: "തുടരുക • സൗജന്യ അന്തരംഗ രഹസ്യം അറിയൂ →",
    changeLangBtn: "← ഭാഷ മാറ്റുക",
    freeBannerBadge: "✨ ഭക്ഷണത്തിന് മുൻപ് മനസ്സിന്റെ രഹസ്യങ്ങൾ അറിയൂ • 100% സൗജന്യം",
    heroTitle: "അന്തരംഗ രഹസ്യം",
    heroSubtitle: "ആരോടും പറയാതെ മനസ്സിൽ ഒതുക്കിവെച്ചിരിക്കുന്ന രഹസ്യങ്ങളും ഉള്ളിലെ വിങ്ങലുകളും എന്തെല്ലാമാണ്? ജനന വിവരങ്ങൾ നൽകി 1-ക്ലിക്കിൽ അറിയൂ!",
    formHeader: "നിങ്ങളുടെ ജനന വിവരങ്ങൾ",
    freeTag: "100% സൗജന്യം",
    nameLabel: "നിങ്ങളുടെ പൂർണ്ണ നാമം *",
    namePlaceholder: "ഉദാ: അനൂപ് മേനോൻ",
    dateLabel: "ജനന തീയതി *",
    timeLabel: "ജനന സമയം *",
    genderLabel: "ലിംഗം",
    maleLabel: "പുരുഷൻ",
    femaleLabel: "സ്ത്രീ",
    placeLabel: "ജനിച്ച സ്ഥലം",
    customSearchPlaceholder: "മറ്റ് നഗരമോ പിൻകോഡോ തിരയുക...",
    searchButton: "തിരയുക",
    searchingButton: "തിരയുന്നു...",
    revealSecretCta: "🔮 എന്റെ അന്തരംഗ രഹസ്യം അറിയൂ • 100% സൗജന്യം",
    calculatingCta: "അന്തരംഗ ജാതക വിശകലനം നടക്കുന്നു...",
    resultHeading: "അവരുടെ മനസ്സിന്റെ ഉള്ളറ രഹസ്യങ്ങൾ",
    resultBadge: "॥ അന്തരംഗ രഹസ്യം · നിഗൂഢ ജാതക സത്യം ॥",
    authenticTruthBadge: "✓ 100% കൃത്യമായ ജ്യോതിഷ സത്യം",
    moonSignLabel: "ചന്ദ്ര രാശി",
    starLabel: "ജന്മ നക്ഷത്രം",
    lagnaLabel: "ജന്മ ലഗ്നം",
    h8LordLabel: "8-ാം ഭാവധിപൻ (രഹസ്യ ഭാവം)",
    paragraph1Title: "🎭 1. ബാഹ്യമായ മുഖംമൂടിയും ആരോടും പറയാത്ത ഉള്ളിലെ വിങ്ങലുകളും",
    paragraph2Title: "🌙 2. ഏകാന്തതയിലെ മൂക വേദനയും ആരോടും പങ്കുവെക്കാത്ത രഹസ്യവും",
    specialOfferBadge: "ഹോട്ടൽ അതിഥി പ്രത്യേക ഓഫർ",
    specialOfferTitle: "നിലവിലെ ജീവിതാവസ്ഥയും അടുത്ത 5 വർഷത്തെ സമ്പൂർണ്ണ മഹാ ജാതകവും (2026-2031)",
    specialOfferDesc: "മുകളിൽ നൽകിയ അന്തരംഗ രഹസ്യം ഒരു ചെറിയ സൂചന മാത്രമാണ്! ഇപ്പോൾ നിങ്ങളുടെ ജീവിതത്തിൽ എന്താണ് സംഭവിക്കുന്നത്? അടുത്ത 5 വർഷങ്ങളിൽ (2026-2031) കരിയർ, സാമ്പത്തിക വളർച്ച, കുടുംബം, ആരോഗ്യം എന്നിവ എങ്ങനെയായിരിക്കും? പ്രീമിയം ജാതക PDF നിങ്ങളുടെ മൊബൈലിൽ നേടൂ.",
    featurePoints: [
      "നിലവിലെ ദശാ-അപഹാരങ്ങളും ഗ്രഹഗോചര വിശകലനവും",
      "അടുത്ത 5 വർഷത്തെ ഓരോ വർഷത്തേയും സമഗ്ര ഫലങ്ങൾ",
      "തൊഴിൽ, സ്ഥാനക്കയറ്റം, ബിസിനസ്സ്, ധനാഗമ സാധ്യതകൾ",
      "കുടുംബ സമാധാനം, വിവാഹ യോഗം, ആരോഗ്യ രക്ഷാ കവചം",
      "ശ്രീ ഗോകർണം സന്നിധാനത്തിലെ സിദ്ധ പരിഹാരങ്ങൾ, സ്തോത്രങ്ങൾ & അനുഗ്രഹം"
    ],
    regularPriceLabel: "സാധാരണ ഫീസ്: ₹1,500",
    packageSelectTitle: "നിങ്ങളുടെ ജാതക പാക്കേജ് തിരഞ്ഞെടുക്കുക",
    packageStandardTitle: "സ്റ്റാൻഡേർഡ് വേദ ജാതക പാക്കേജ്",
    packageStandardPrice: "₹350",
    packageStandardDesc: "5 വർഷത്തെ മഹാ ജാതക PDF (2026-2031) + ബഗ്ഗോണ ജന്മ കുണ്ഡലി PDF",
    packageRemedyTitle: "പ്രീമിയം ജാതകം + ഗോകർണം ദിവ്യ പരിഹാരം (ശുപാർശ ചെയ്യുന്നത്)",
    packageRemedyPrice: "₹450",
    packageRemedyDesc: "5 വർഷത്തെ PDF + ബഗ്ഗോണ ജന്മ കുണ്ഡലി PDF + ഗോകർണം ദിവ്യ പരിഹാരങ്ങളും മന്ത്ര സാധന റിപ്പോർട്ടും PDF (+₹100)",
    packageRemedyBadge: "ഏറ്റവും അനുയോജ്യം",
    payUnlockCta: "💳 പണം നൽകി PDF അൺലോക്ക് ചെയ്യുക",
    upiSectionTitle: "📱 ത്വരിത UPI പേയ്‌മെന്റും PDF അൺലോക്കും",
    paymentInstructions: "PhonePe / GPay / Paytm ബട്ടൺ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ മുകളിലെ QR കോഡ് സ്കാൻ ചെയ്യുക.",
    phonePeBtn: "PhonePe വഴി നൽകുക",
    gpayBtn: "Google Pay വഴി നൽകുക",
    paytmBtn: "Paytm / മറ്റ് UPI വഴി നൽകുക",
    copyUpiBtn: "കോപ്പി ചെയ്യുക",
    copiedUpiBtn: "✓ കോപ്പി ചെയ്തു",
    instantUnlockTitle: "⚡ PhonePe-ൽ പേയ്‌മെന്റ് പൂർത്തിയായി കഴിഞ്ഞോ?",
    instantUnlockDesc: "12 അക്ക നമ്പർ ടൈപ്പ് ചെയ്യേണ്ട ആവശ്യമില്ല! ഉടൻ PDF ഡൗൺലോഡ് ചെയ്യാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.",
    instantUnlockBtn: "✓ പണം നൽകി • ഉടൻ PDF നേടൂ",
    manualUtrToggleText: "അല്ലെങ്കിൽ 12 അക്ക UTR നമ്പർ നൽകുക (ഐച്ഛികം)",
    utrLabel: "പണം നൽകിയ ശേഷം PhonePe / GPay രസീതിലുള്ള 12 അക്ക UTR നമ്പർ ഇവിടെ നൽകുക:",
    utrPlaceholder: "ഉദാ: 432109876543 (12 അക്കങ്ങൾ)",
    verifyUtrBtn: "സ്ഥിരീകരിച്ച് PDF നേടൂ",
    verifyingUtrBtn: "പരിശോധിക്കുന്നു...",
    verifiedUtrBtn: "✓ പേയ്‌മെന്റ് ഉറപ്പിച്ചു",
    pdfReadyHeader: "🎉 നിങ്ങളുടെ ഔദ്യോഗിക ജാതക PDFകൾ തയ്യാറായിരിക്കുന്നു!",
    downloadFiveYearPdfBtn: "📥 5 വർഷത്തെ മഹാ ജാതക ഭാവിയവസ്ഥ PDF",
    downloadKundliPdfBtn: "📜 ബഗ്ഗോണ പഞ്ചാംഗ ജന്മ കുണ്ഡലി PDF",
    downloadRemedyPdfBtn: "🪔 ഗോകർണം ദിവ്യ പരിഹാര റിപ്പോർട്ട് PDF",
    downloadAllPdfsBtn: "📦 എല്ലാ PDFകളും ഒരുമിച്ച് ഡൗൺലോഡ് ചെയ്യുക",
    downloadedBtn: "✓ ഡൗൺലോഡ് ചെയ്തു",
    downloadAllCompletedBtn: "✓ എല്ലാ PDFകളും ഡൗൺലോഡ് ചെയ്തു",
    viewPdfBtn: "👁️ PDF കാണുക",
    iphoneSafariTip: "iPhone Safari ഉപയോക്താക്കൾ: മുകളിൽ ക്ലിക്ക് ചെയ്താൽ PDF തുറക്കും. താഴെയുള്ള Share ചിഹ്നം അമർത്തി 'Save to Files' അല്ലെങ്കിൽ 'Books'-ലേക്ക് സേവ് ചെയ്യാം.",
    unpaidWarning: "പേയ്‌മെന്റ് സ്ഥിരീകരണം ആവശ്യമാണ്. ഔദ്യോഗിക PDF ഡൗൺലോഡ് ചെയ്യാൻ പേയ്‌മെന്റ് പൂർത്തിയാക്കുക.",
    footerSanctum: "॥ ശ്രീ ഗോകർണം മഹാബലേശ്വര സന്നിധാനം · ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷം ॥",
    footerContact: `സഹായത്തിനോ പൂജാ സങ്കല്പത്തിനോ ബന്ധപ്പെടുക: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "ദയവായി നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക.",
    cityNotFoundError: "സ്ഥലം കണ്ടെത്താനായില്ല. അടുത്തുള്ള പട്ടണമോ പിൻകോഡോ നൽകുക.",
    calcError: "ജാതക കണക്കുകൂട്ടലിൽ പിശക് സംഭവിച്ചു. ജനന തീയതിയും സമയവും പരിശോധിക്കുക.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "നിലവിലെ ഗ്രഹബലം, ഊർജ്ജ നില & ഗോചാര നിർണ്ണയം",
    gocharaSectionBadge: "ശാസ്തീയ ഗോചാര നിർണ്ണയം",
    shaniTransitTitle: "ശനി ഗോചാര സ്ഥിതി",
    guruBalaTitle: "ഗുരുബല അനുഗ്രഹം",
    runningDashaTitle: "നിലവിലെ മഹാദശ - അപഹാരം",
    turningPointVerdictTitle: "തത്സമയ ജീവിത നിർണ്ണയം:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "ശാസ്തീയ ഫലം",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "നിങ്ങളുടെ ഭാഗ്യ ഘടകങ്ങൾ (സൗജന്യ ഉപഹാരം)",
    luckyBlueprintBadge: "ഭാഗ്യ കവചം",
    luckyGemstoneLabel: "ഭാഗ്യ രത്നം",
    luckyDayLabel: "ശുഭ ദിനം",
    luckyNumberLabel: "ഭാഗ്യ നമ്പർ",
    luckyDirectionColorLabel: "ശുഭ ദിശ & നിറം",
    ishtaDevataLabel: "ഇഷ്ടദേവത:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "അടുത്ത 5 വർഷത്തെ സുവർണ്ണ കാലവും രഹസ്യ മുൻനോട്ടവും (2026–2031)",
    fiveYearPreviewSubtitle: "വർഷം 1 സൗജന്യ മുൻനോട്ടം · വർഷങ്ങൾ 2-5 രഹസ്യ ചോദ്യങ്ങൾ",
    year1FreeBadge: "വർഷം 1 സൗജന്യം",
    vitalityScoreLabel: "ഊർജ്ജ സ്കോർ",
    turningPointSeasonLabel: "വഴിത്തിരിവാകുന്ന ഋതു:",
    goldenOpportunityLabel: "സുവർണ്ണാവസര കാലം:",
    cautionAlertLabel: "വർഷം 1 ജാഗ്രതാ നിർദ്ദേശം:",
    lockedYearsNotice: "🔒 തുടർന്നുള്ള വർഷങ്ങൾ (വർഷം 2 മുതൽ 5) - സമ്പൂർണ്ണ ജാതകത്തിൽ ലഭ്യമാണ്",
    yearNumLabel: "വർഷം",

    // Dining Special Offer Card
    dinerSpecialBadge: "പണ്ഡിറ്റ് പാലറ്റ് പ്രത്യേക അതിഥി ആനുകൂല്യം",
    dinerSpecialDiscountNotice: "🍽️ ഡൈനിംഗ് ടേബിൾ പ്രത്യേക കിഴിവ്: നിങ്ങൾ പണ്ഡിറ്റ് പാലറ്റിൽ ഭക്ഷണം കഴിക്കുന്ന ഈ സമയത്ത് മാത്രം ₹350-ൽ അൺലോക്ക് ലഭ്യമാണ്. (സാധാരണ ഫീസ്: ₹1,500 - 77% കിഴിവ്)",
    unlockFiveYearCtaBtn: "🔓 വെറും ₹350 നൽകി 5 വർഷത്തെ സമ്പൂർണ്ണ മഹാ ജാതകം അൺലോക്ക് ചെയ്യൂ",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe തുറക്കുന്നു...",
    launchingPhonePeMsg: "PhonePe-ൽ പേയ്‌മെന്റ് പൂർത്തിയാക്കൂ...",
    launchingGPayTitle: "📲 Google Pay തുറക്കുന്നു...",
    launchingGPayMsg: "Google Pay-ൽ പേയ്‌മെന്റ് പൂർത്തിയാക്കൂ...",
    launchingPaytmTitle: "📲 Paytm തുറക്കുന്നു...",
    launchingPaytmMsg: "Paytm-ൽ പേയ്‌മെന്റ് പൂർത്തിയാക്കൂ...",

    // UTR verification & Download Center
    utrSectionTitle: "പേയ്‌മെന്റ് സ്ഥിരീകരണം (12 അക്ക UPI UTR സ്ഥിരീകരണം)",
    singleUseNotice: "ശ്രദ്ധിക്കുക: സുരക്ഷാ നിയമങ്ങൾ അനുസരിച്ച് ഓരോ ഫയലും ഒരു തവണ മാത്രമേ ഡൗൺലോഡ് ചെയ്യാൻ സാധിക്കൂ.",
    alreadyDownloadedAlert: "ഈ PDF ഇതിനകം ഡൗൺലോഡ് ചെയ്തിട്ടുണ്ട്. ഓരോ ഫയലിനും ഒരു തവണ മാത്രമേ അനുവാദമുള്ളൂ.",
    allAlreadyDownloadedAlert: "എല്ലാ PDFകളും ഇതിനകം ഡൗൺലോഡ് ചെയ്തു കഴിഞ്ഞു. വീണ്ടും ഡൗൺലോഡ് ചെയ്യുന്നത് തടഞ്ഞിരിക്കുന്നു.",
    generatingKundliPdfStage: "ബഗ്ഗോണ പഞ്ചാംഗ ജന്മ കുണ്ഡലി PDF തയ്യാറാകുന്നു...",
    generatingRemedyPdfStage: "ശ്രീ ഗോകർണം ദിവ്യ പരിഹാര റിപ്പോർട്ട് തയ്യാറാകുന്നു...",
    paymentVerifiedSuccess: "പേയ്‌മെന്റ് വിജയകരമായി സ്ഥിരീകരിച്ചു!"
  },
  mr: {
    topMantra: "॥ श्री गोकर्ण महाबळेश्वर स्वामी प्रसन्न ॥",
    defaultSanctuaryTitle: "पंडित पॅलेट",
    tableLabel: "टेबल",
    langSelectHeader: "आपली भाषा निवडा",
    langSelectSubtitle: "आपल्या भाषेत अंतर्मनातील सत्य, बग्गोण जन्म पत्रिका व ५-वर्षांचे भविष्य जाणून घ्या",
    startReadingBtn: "पुढे जा • मोफत अंतर्मनातील सत्य उलगडा →",
    changeLangBtn: "← भाषा बदला",
    freeBannerBadge: "✨ जेवणापूर्वी आपल्या अंतर्मनातील गूढ सत्य जाणून घ्या • १००% मोफत",
    heroTitle: "अंतर्मनातील गूढ सत्य",
    heroSubtitle: "कोणालाही न सांगता आपण मनात दडवून ठेवलेले गूढ सत्य आणि आंतरिक द्वंद्व काय आहे? आपले जन्म तपशील देऊन एका क्लिकवर जाणून घ्या!",
    formHeader: "आपले जन्म तपशील",
    freeTag: "१००% मोफत",
    nameLabel: "आपले पूर्ण नाव *",
    namePlaceholder: "उदा: अमित कुलकर्णी",
    dateLabel: "जन्म तारीख *",
    timeLabel: "जन्म वेळ *",
    genderLabel: "लिंग",
    maleLabel: "पुरुष",
    femaleLabel: "स्त्री",
    placeLabel: "जन्म गाव / शहर",
    customSearchPlaceholder: "इतर शहर किंवा पिनकोड शोधा...",
    searchButton: "शोधा",
    searchingButton: "शोधत आहे...",
    revealSecretCta: "🔮 माझ्या अंतर्मनातील गूढ सत्य उलगडा • १००% मोफत",
    calculatingCta: "जन्मपत्रिकेचे गूढ विश्लेषण होत आहे...",
    resultHeading: "यांच्या अंतर्मनातील गुप्त सत्य",
    resultBadge: "॥ अंतर्मनातील सत्य · गूढ जन्मपत्रिका रहस्य ॥",
    authenticTruthBadge: "✓ १००% अचूक वैदिक ज्योतिष सत्य",
    moonSignLabel: "चंद्र रास",
    starLabel: "जन्म नक्षत्र",
    lagnaLabel: "जन्म लग्न",
    h8LordLabel: "अष्टमेश (गूढ स्थान)",
    paragraph1Title: "🎭 1. बाह्य मुखवटा आणि कोणालाही न सांगता येणारे आंतरिक द्वंद्व",
    paragraph2Title: "🌙 2. एकांतातील मूक वेदना आणि कोणालाही न ठाऊक असणारे रहस्य",
    specialOfferBadge: "हॉटेल अतिथी विशेष सवलत",
    specialOfferTitle: "सध्याची जीवनस्थिती आणि पुढील ५ वर्षांची संपूर्ण महा पत्रिका (२०२६-२०३१)",
    specialOfferDesc: "वरील अंतर्मनातील सत्य ही केवळ एक छोटीशी झलक आहे! सध्या आपल्या जीवनात काय घडत आहे? पुढील ५ वर्षांत (२०२६-२०३१) आपली कारकीर्द, आर्थिक प्रगती, कुटुंब आणि आरोग्य कसे असेल? संपूर्ण प्रीमियम महा पत्रिका PDF आपल्या मोबाईल/iPhone वर मिळवा.",
    featurePoints: [
      "सध्याची महादशा आणि गोचर ग्रहांचे सखोल विश्लेषण",
      "पुढील ५ वर्षांचे वर्षनिहाय (१ ते ५) सविस्तर भविष्य",
      "नोकरी, पदोन्नती, व्यवसाय आणि आर्थिक वृद्धीचा वेध",
      "कौटुंबिक सुख, विवाह योग आणि आरोग्य संरक्षण कवच",
      "श्री क्षेत्र गोकर्ण सन्निधानाचे सिद्ध उपाय, वैदिक स्तोत्रे आणि आशीर्वाद"
    ],
    regularPriceLabel: "नियमित शुल्क: ₹१,५००",
    packageSelectTitle: "आपले जन्मपत्रिका पॅकेज निवडा",
    packageStandardTitle: "प्रमाणित वैदिक महा पत्रिका पॅकेज",
    packageStandardPrice: "₹३५०",
    packageStandardDesc: "५-वर्षांची महा पत्रिका PDF (२०२६-२०३१) + अधिकृत बग्गोण जन्म पत्रिका PDF",
    packageRemedyTitle: "प्रीमियम महा पत्रिका + गोकर्ण सिद्ध उपाय (शिफारस केलेले)",
    packageRemedyPrice: "₹४५०",
    packageRemedyDesc: "५-वर्षांची PDF + बग्गोण जन्म पत्रिका PDF + गोकर्ण सिद्ध उपाय व मंत्र साधना अहवाल PDF (+₹१००)",
    packageRemedyBadge: "अत्यंत शिफारस केलेले",
    payUnlockCta: "💳 पेमेंट करून त्वरित PDF अनलॉक करा",
    upiSectionTitle: "📱 झटपट UPI पेमेंट आणि PDF अनलॉक",
    paymentInstructions: "PhonePe / GPay / Paytm बटण दाबा किंवा वरील QR कोड स्कॅन करा.",
    phonePeBtn: "PhonePe द्वारे भरा",
    gpayBtn: "Google Pay द्वारे भरा",
    paytmBtn: "Paytm / इतर UPI द्वारे भरा",
    copyUpiBtn: "कॉपी करा",
    copiedUpiBtn: "✓ कॉपी झाले",
    instantUnlockTitle: "⚡ PhonePe वर पेमेंट पूर्ण झाले का?",
    instantUnlockDesc: "१२-अंकी नंबर टाईप करण्याची गरज नाही! खाली क्लिक करून त्वरित PDF डाउनलोड करा.",
    instantUnlockBtn: "✓ पेमेंट केले • त्वरित PDF डाउनलोड करा",
    manualUtrToggleText: "किंवा १२-अंकी UTR संदर्भ क्रमांक स्वतः टाका (पर्यायी)",
    utrLabel: "पेमेंट केल्यानंतर PhonePe / GPay पावतीवरील १२-अंकी UTR / संदर्भ क्रमांक येथे टाका:",
    utrPlaceholder: "उदा: 432109876543 (१२ अंक)",
    verifyUtrBtn: "पडताळणी करा आणि PDF मिळवा",
    verifyingUtrBtn: "पडताळणी चालू आहे...",
    verifiedUtrBtn: "✓ पेमेंट यशस्वी झाले",
    pdfReadyHeader: "🎉 आपली अधिकृत जन्मपत्रिका PDF डाउनलोडसाठी तयार आहेत!",
    downloadFiveYearPdfBtn: "📥 ५-वर्षांची महा पत्रिका भविष्यफल PDF",
    downloadKundliPdfBtn: "📜 बग्गोण पंचांग जन्म पत्रिका PDF",
    downloadRemedyPdfBtn: "🪔 गोकर्ण सिद्ध उपाय व मंत्र साधना PDF",
    downloadAllPdfsBtn: "📦 सर्व PDF एकत्रित डाउनलोड करा",
    downloadedBtn: "✓ डाउनलोड झाले",
    downloadAllCompletedBtn: "✓ सर्व PDF डाउनलोड झाले",
    viewPdfBtn: "👁️ PDF पहा",
    iphoneSafariTip: "iPhone Safari वापरकर्ते: वरील बटण दाबताच PDF उघडेल. खालील Share चिन्हावर टॅप करून 'Save to Files' किंवा 'Books' मध्ये सेव्ह करू शकता.",
    unpaidWarning: "पेमेंट पडताळणी आवश्यक आहे. अधिकृत PDF डाउनलोड करण्यासाठी कृपया पेमेंट पूर्ण करा.",
    footerSanctum: "॥ श्री क्षेत्र गोकर्ण महाबळेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    footerContact: `मदत किंवा पूजा संकल्पासाठी संपर्क साधा: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "कृपया आपले पूर्ण नाव प्रविष्ट करा.",
    cityNotFoundError: "ठिकाण सापडले नाही. कृपया जवळचे शहर किंवा पिनकोड प्रविष्ट करा.",
    calcError: "पत्रिका गणनेत त्रुटी आली. कृपया जन्म तारीख व वेळ तपासा.",

    // Gochara & Transit Ribbon
    gocharaSectionTitle: "सध्याचे ग्रहबल, जीवन ऊर्जा व गोचर निर्णय",
    gocharaSectionBadge: "शास्त्रीय गोचर निर्णय",
    shaniTransitTitle: "शनी गोचर स्थिती",
    guruBalaTitle: "गुरुबल कृपा",
    runningDashaTitle: "सध्याची महादशा - अंतर्दशा",
    turningPointVerdictTitle: "तात्काळ जीवन निर्णय:",

    // Moorthy Nirnaya Badge
    moorthyClassicalBadge: "शास्त्रीय फळ",

    // Free Lucky Blueprint
    luckyBlueprintTitle: "आपले दैवी भाग्यशाली घटक (विनामूल्य भेट)",
    luckyBlueprintBadge: "भाग्य कवच",
    luckyGemstoneLabel: "भाग्यशाली रत्न",
    luckyDayLabel: "शुभ वार",
    luckyNumberLabel: "भाग्यशाली अंक",
    luckyDirectionColorLabel: "शुभ दिशा व रंग",
    ishtaDevataLabel: "इष्टदेवता:",

    // 5-Year Horizon Preview
    fiveYearPreviewTitle: "पुढील ५ वर्षांचा सुवर्ण काळ व पूर्वदर्शन (२०२६-२०३१)",
    fiveYearPreviewSubtitle: "वर्ष १ विनामूल्य पूर्वदर्शन · वर्ष २-५ गूढ प्रश्न",
    year1FreeBadge: "वर्ष १ विनामूल्य",
    vitalityScoreLabel: "जीवन ऊर्जा निर्देशांक",
    turningPointSeasonLabel: "मोठा टप्पा देणारा ऋतू:",
    goldenOpportunityLabel: "सुवर्णसंधी काळ:",
    cautionAlertLabel: "वर्ष १ चा सावधानतेचा इशारा:",
    lockedYearsNotice: "🔒 पुढील वर्षे (वर्ष २ ते ५) - संपूर्ण महा पत्रिकेत उपलब्ध",
    yearNumLabel: "वर्ष",

    // Dining Special Offer Card
    dinerSpecialBadge: "पंडित पॅलेट विशेष पाहुणे सवलत",
    dinerSpecialDiscountNotice: "🍽️ डायनिंग टेबल विशेष सवलत: पंडित पॅलेटमध्ये जेवणाचा आनंद घेत असतानाच ₹३५० मध्ये अनलॉक उपलब्ध आहे. (नियमित शुल्क: ₹१,५०० - ७७% सूट)",
    unlockFiveYearCtaBtn: "🔓 फक्त ₹३५० मध्ये संपूर्ण ५-वर्षांची महा पत्रिका अनलॉक करा",

    // Payment App Launch Titles & Messages
    launchingPhonePeTitle: "📲 PhonePe उघडत आहे...",
    launchingPhonePeMsg: "PhonePe मध्ये पेमेंट पूर्ण करा...",
    launchingGPayTitle: "📲 Google Pay उघडत आहे...",
    launchingGPayMsg: "Google Pay मध्ये पेमेंट पूर्ण करा...",
    launchingPaytmTitle: "📲 Paytm उघडत आहे...",
    launchingPaytmMsg: "Paytm मध्ये पेमेंट पूर्ण करा...",

    // UTR verification & Download Center
    utrSectionTitle: "पेमेंट पडताळणी (१२-अंकी UPI UTR पडताळणी)",
    singleUseNotice: "सूचना: सुरक्षा नियमांनुसार प्रत्येक फाईल केवळ एकदाच डाउनलोड करता येईल.",
    alreadyDownloadedAlert: "ही PDF आधीच डाउनलोड झाली आहे. प्रत्येक फाईलसाठी फक्त एकदाच डाउनलोडची अनुमती आहे.",
    allAlreadyDownloadedAlert: "सर्व PDF आधीच डाउनलोड झाल्या आहेत. पुन्हा डाउनलोड करणे प्रतिबंधित आहे.",
    generatingKundliPdfStage: "बग्गोण पंचांग जन्म पत्रिका PDF तयार होत आहे...",
    generatingRemedyPdfStage: "श्री क्षेत्र गोकर्ण सिद्ध उपाय अहवाल तयार होत आहे...",
    paymentVerifiedSuccess: "पेमेंट यशस्वीरीत्या पडताळले गेले!"
  }
};

// 7-Language Progress Stage Strings
const PDF_STAGES: Record<AntarangaLang, { s1: string; s2: string; s3: string; done: string }> = {
  kn: {
    s1: "೧. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ, ಕುಂಡಲಿ ಹಾಗೂ ೫ ವರ್ಷಗಳ ಗ್ರಹ ಗೋಚಾರ ಸಿದ್ಧತೆ...",
    s2: "೨. ಪಂಚವರ್ಷ ಮಹಾ ದಶಾ, ರಾಜಯೋಗ ಹಾಗೂ ದೈವಿಕ ಪರಿಹಾರಗಳ ಗಣನೆ...",
    s3: "೩. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ಮಹಾ ಆಶೀರ್ವಾದ ಸಂಕಲ್ಪ...",
    done: "✓ ಪ್ರೀಮಿಯಂ PDF ಗಳು ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧವಾಗಿವೆ!"
  },
  en: {
    s1: "1. Calculating Janma Lagna, Natal Kundali & 5-Year Transits...",
    s2: "2. Computing Vimshottari Mahadasha, Raja Yogas & Remedy Protocols...",
    s3: "3. Formulating Sacred Gokarna Kshetra Shanti Protocols...",
    done: "✓ Premium PDFs generated successfully!"
  },
  hi: {
    s1: "1. जन्म लग्न, जन्म कुंडली और 5-वर्षीय ग्रह गोचर की तैयारी...",
    s2: "2. पंचवर्षीय महादशा, राजयोग एवं दैविक उपायों की सूक्ष्म गणना...",
    s3: "3. श्री क्षेत्र गोकर्ण सन्निधान आशीर्वाद संकल्प...",
    done: "✓ प्रीमियम PDF सफलतापूर्वक तैयार हैं!"
  },
  te: {
    s1: "1. జన్మ లగ్నం, జన్మ కుండలి మరియు 5 సంవత్సరాల గ్రహ గోచార సన్నాహం...",
    s2: "2. పంచవర్ష మహాదశ, రాజయోగాలు మరియు దైవిక పరిహారాల గణన...",
    s3: "3. శ్రీ క్షేత్ర గోకర్ణ సన్నిధాన ఆశీర్వాద సంకల్పం...",
    done: "✓ ప్రీమియం PDFలు విజయవంతంగా సిద్ధమయ్యాయి!"
  },
  ta: {
    s1: "1. ஜென்ம லக்னம், குண்டலி மற்றும் 5 ஆண்டு கிரக கோச்சார தயாரிப்பு...",
    s2: "2. ஐந்தாண்டு மகா திசை, ராஜயோகம் மற்றும் பரிகார கணிப்புகள்...",
    s3: "3. ஸ்ரீ கோகர்ணம் சன்னிதான ஆசீர்வாத சங்கல்பம்...",
    done: "✓ பிரீமியம் PDFகள் வெற்றிகரமாக தயாராகிவிட்டன!"
  },
  ml: {
    s1: "1. ജന്മ ലഗ്നവും ജന്മ കുണ്ഡലിയും 5 വർഷത്തെ ഗ്രഹഗോചരവും...",
    s2: "2. പഞ്ചവത്സര മഹാദശാ കാലഘട്ടങ്ങളും രാജയോഗങ്ങളും പരിഹാരങ്ങളും...",
    s3: "3. ശ്രീ ഗോകർണം സന്നിധാന ദിവ്യ അനുഗ്രഹ സങ്കല്പം...",
    done: "✓ പ്രീമിയം PDFകൾ വിജയകരമായി തയ്യാറായി!"
  },
  mr: {
    s1: "१. जन्म लग्न, जन्म पत्रिका आणि ५-वर्षांचे ग्रह गोचर विश्लेषण...",
    s2: "२. पंचवार्षिक महादशा, राजयोग व सिद्ध उपायांची सूक्ष्म गणना...",
    s3: "३. श्री क्षेत्र गोकर्ण सन्निधान आशीर्वाद संकल्प...",
    done: "✓ प्रीमियम PDF यशस्वीरीत्या तयार झाल्या आहेत!"
  }
};

// ═════════════════════════════════════════════════════════════════════════
// 🌟 DYNAMIC ASTRONOMICAL VISUALS & ROTATING CELESTIAL SYMBOLS
// ═════════════════════════════════════════════════════════════════════════

/**
 * Majestic rotating golden Vedic Surya Mandala / Kalachakra emblem
 * with concentric rings, sun rays, and a pulsing sacred core.
 */
export const RotatingSuryaKalachakra: React.FC<{ size?: number; className?: string }> = ({ size = 52, className = "" }) => (
  <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
    {/* Outer rotating Surya Rays (Clockwise) */}
    <div className="absolute inset-0 animate-spin-slow">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(217,119,6,0.35)]">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <path d="M 50 2 L 53 14 L 47 14 Z" fill="#D97706" />
            <circle cx="50" cy="8" r="1.5" fill="#FBBF24" />
          </g>
        ))}
      </svg>
    </div>

    {/* Counter-rotating Inner Shatkona / Star Geometry */}
    <div className="absolute inset-2 animate-spin-reverse">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,18 78,66 22,66" fill="none" stroke="#B45309" strokeWidth="1.2" opacity="0.8" />
        <polygon points="50,78 78,30 22,30" fill="none" stroke="#B45309" strokeWidth="1.2" opacity="0.8" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>

    {/* Pulsing Sacred Golden Core */}
    <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_12px_rgba(217,119,6,0.5)] border border-amber-200 animate-pulse-celestial">
      <span className="text-[12px] text-amber-950 font-black select-none leading-none">🕉️</span>
    </div>
  </div>
);

/**
 * Ambient background rotating mandalas providing living Vedic astrological atmosphere
 * without interfering with user interaction.
 */
export const AmbientRotatingMandalaWatermark: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Top Right Ambient Mandala */}
    <div className="absolute -top-24 -right-24 sm:-top-32 sm:-right-32 w-80 h-80 sm:w-96 sm:h-96 opacity-[0.07] animate-spin-slow">
      <svg viewBox="0 0 200 200" className="w-full h-full text-amber-700">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((d) => (
          <line key={d} x1="100" y1="8" x2="100" y2="28" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${d} 100 100)`} />
        ))}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
          <polygon key={d} points="100,24 106,44 94,44" fill="currentColor" transform={`rotate(${d} 100 100)`} />
        ))}
      </svg>
    </div>

    {/* Bottom Left Ambient Counter-Rotating Mandala */}
    <div className="absolute -bottom-24 -left-24 sm:-bottom-32 sm:-left-32 w-80 h-80 sm:w-96 sm:h-96 opacity-[0.06] animate-spin-reverse">
      <svg viewBox="0 0 200 200" className="w-full h-full text-amber-800">
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx="100" cy="100" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon points="100,10 180,150 20,150" fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon points="100,190 180,50 20,50" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════
// 🧠 COGNITIVE SALIENCE & PSYCHOLOGICAL CONVERSION HIGHLIGHTING
// ═════════════════════════════════════════════════════════════════════════

const PSYCH_PHRASES: {
  p1_amber: Record<AntarangaLang, string>;
  p1_crimson: Record<AntarangaLang, string>;
  p2_indigo: Record<AntarangaLang, string>;
  p2_emerald: Record<AntarangaLang, string>;
} = {
  p1_amber: {
    kn: "ನೀವು ಹೊರಗಿನ ಜಗತ್ತಿಗೆ ಸದಾ ನಗುಮುಖದ, ದೃಢಸಂಕಲ್ಪದ ಹಾಗೂ ಎಲ್ಲರ ಕಷ್ಟಗಳಿಗೂ ತಕ್ಷಣ ಸ್ಪಂದಿಸುವ ಧೀರ ವ್ಯಕ್ತಿಯಂತೆ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತೀರಿ.",
    hi: "संसार और समाज के समक्ष आप सदैव अत्यंत सुलझे हुए, आत्मविश्वासी और सबकी सहायता करने वाले एक मजबूत स्तंभ की भांति खड़े रहते हैं।",
    mr: "बाह्य जगासमोर आपण नेहमी कणखर, हसमुख आणि इतरांच्या अडचणी सोडवणारे आधारस्तंभ म्हणून वावरता.",
    te: "బయటి ప్రపంచానికి మీరు ఎంతో ధైర్యంగా, చిరునవ్వుతో అందరి సమస్యలను పరిష్కరించే మార్గదర్శిగా కనిపిస్తారు.",
    ta: "வெளியுலகிற்கு நீங்கள் எப்போதுமே புன்னகையுடனும், மன உறுதியுடனும் அனைவரையும் தாங்கும் தூணாகத் திகழ்கிறீர்கள்.",
    ml: "പുറംലോകത്തിന് മുന്നിൽ നിങ്ങൾ എപ്പോഴും പുഞ്ചിരിക്കുന്ന, ഉത്തരവാദിത്തമുള്ള, മറ്റുള്ളവരുടെ സങ്കടങ്ങൾക്ക് തണലേകുന്ന ധീരനായ വ്യക്തിയായി നിലകൊള്ളുന്നു.",
    en: "To friends, family, and society, you project an admirable persona of quiet dignity, emotional resilience, and selfless dependability."
  },
  p1_crimson: {
    kn: "ಎಷ್ಟೇ ಮಾನಸಿಕ ಒತ್ತಡ, ಹಣಕಾಸಿನ ಆತಂಕ ಅಥವಾ ಆಪ್ತರಿಂದ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದರೂ ಎಲ್ಲವನ್ನೂ ನಿಮ್ಮ ಎದೆಯಾಳದಲ್ಲೇ ಮೌನವಾಗಿ ಹುದುಗಿಸಿಟ್ಟುಕೊಳ್ಳುತ್ತೀರಿ.",
    hi: "भीतर कितना भी मानसिक तनाव, आर्थिक चिंता या अपनों से विश्वासघात का दंश क्यों न हो, आप समस्त वेदना को अपने ही सीने में दबाए रखते हैं।",
    mr: "कितीही मानसिक ताण, आर्थिक चिंता किंवा विश्वासघात झाला तरी सर्व वेदना आपण मनातल्या मनात दडवून ठेवता.",
    te: "ఎంతటి ఆర్థిక లేదా మానసిక ఒత్తిడి ఉన్నప్పటికీ అన్నింటినీ మీ గుండెల్లోనే దాచుకుంటారు.",
    ta: "எத்தனை மன உளைச்சல்கள் அல்லது நிதிச் சுமைகள் வந்தாலும் எல்லாவற்றையும் உங்களுக்குள்ளேயே புதைத்து வைக்கிறீர்கள்.",
    ml: "എത്ര മാനസിക സമ്മർദ്ദവും സാമ്പത്തിക പ്രതിസന്ധിയും ഉണ്ടായാലും എല്ലാം നെഞ്ചിൽ ഒതുക്കിവെക്കുന്ന പ്രകൃതമാണ് നിങ്ങളുടേത്.",
    en: "you stoically shoulder financial pressures, emotional disappointments, or feelings of betrayal completely alone."
  },
  p2_indigo: {
    kn: "ಎಲ್ಲರಿಗೂ ನಾನಿದ್ದೇನೆ, ಆದರೆ ನನ್ನ ಮನಸ್ಸಿನ ನೋವು ಮತ್ತು ಆಂತರಿಕ ಸಂಕಟಗಳನ್ನು ಆಲಿಸಲು ಯಾರೂ ಇಲ್ಲ",
    hi: "सबके लिए मैं सदैव तत्पर रहता हूं, किंतु मेरे अंतर्मन की व्यथा को सुनने व समझने वाला कोई नहीं है",
    mr: "मी सर्वांसाठी खंबीरपणे उभा राहतो, पण माझे मन मोकळे करायला आणि माझे अश्रू समजून घ्यायला कोणीच नाही",
    te: "అందరి కోసం నేనున్నాను, కానీ నా మనసులోని ఆవేదనను వినేవారు ఎవరూ లేరు",
    ta: "எல்லோருக்கும் நான் இருக்கிறேன், ஆனால் என் ஆழ்மன வலியைப் புரிந்து கொள்ள யாருமில்லை",
    ml: "എല്ലാവർക്കും ഞാനുണ്ട്, എന്നാൽ എന്റെ ഉള്ളിലെ വേദന കേൾക്കാനും മനസ്സിലാക്കാനും ആരുമില്ല",
    en: "I am always there for everyone, yet nobody truly sees or holds the silent sorrow of my own soul"
  },
  p2_emerald: {
    kn: "ಯಾರ ಮುಂದೆಯೂ ಕಣ್ಣೀರು ಹಾಕದೆ, ಕೇವಲ ನಗುವಿನ ಮುಖವಾಡದ ಹಿಂದೆ ನೀವು ಕಾಪಾಡಿಕೊಂಡು ಬಂದಿರುವ ಈ ಮೌನ ತ್ಯಾಗಗಳು ಹಾಗೂ ಮುಚ್ಚಿಟ್ಟ ಅಸಹಾಯಕತೆಯೇ ನಿಮ್ಮ ಅಂತರಂಗದ ನಿಗೂಢ ಸತ್ಯವಾಗಿದೆ.",
    hi: "किसी के सम्मुख अश्रु न बहाकर, अपनी मुस्कुराहट के पीछे छिपाई गई यही मूक पीड़ा और अनकहे त्याग आपके जीवन का सबसे बड़ा गुप्त रहस्य हैं।",
    mr: "कोणापुढेही अश्रू न ढाळता हसऱ्या चेहऱ्यामागे आपण सांभाळलेले हे मूक त्याग म्हणजेच आपल्या अंतर्मनातील गूढ सत्य आहे.",
    te: "ఎవరి ముందూ కన్నీరు కార్చకుండా పెదవులపై చిరునవ్వుతో దాచిపెట్టిన ఈ మూగ త్యాగాలే మీ అంతరంగపు అత్యంత రహస్య సత్యం.",
    ta: "மற்றவர் முன் கண்ணீர் சிந்தாமல் புன்னகை முகமூடிக்கு பின்னே ஒளித்து வைத்துள்ள இந்த மௌன தியாகங்களே உங்கள் ஆழ்மன ரகசியமாகும்.",
    ml: "ആരുടെയും മുന്നിൽ കരയാതെ പുഞ്ചിരിക്ക് പിന്നിൽ ഒളിപ്പിച്ച ഈ മൗന ത്യാഗങ്ങളാണ് നിങ്ങളുടെ അന്തരംഗ രഹസ്യം.",
    en: "These silent sacrifices, unuttered wounds, and private resilience form the profound Dark Secret you have never disclosed to anyone."
  }
};

/**
 * Highlights deeply penetrative emotional phrases with tailored psychological colors:
 * - Golden Amber: Validated Outward Fortitude & Dignity
 * - Ruby Crimson: Subterranean Turmoil, Financial Strain & Betrayal
 * - Deep Indigo Quote Box: Nocturnal Solitude & The Haunting Lonely Ache
 * - Emerald Green: Silent Masked Sacrifices & Soul Resilience
 */
function renderPsychologicalAntarangaText(
  fullText: string,
  lang: AntarangaLang,
  paraNum: 1 | 2
): React.ReactNode {
  if (!fullText) return null;

  if (paraNum === 1) {
    const amber = PSYCH_PHRASES.p1_amber[lang] || PSYCH_PHRASES.p1_amber.en;
    const crimson = PSYCH_PHRASES.p1_crimson[lang] || PSYCH_PHRASES.p1_crimson.en;

    if (fullText.includes(amber)) {
      const [beforeAmber, rest] = fullText.split(amber);
      if (rest && rest.includes(crimson)) {
        const [between, afterCrimson] = rest.split(crimson);
        return (
          <span>
            {beforeAmber}
            <span className="font-bold text-amber-950 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300 shadow-xs inline">
              {amber}
            </span>
            {between}
            <span className="font-semibold text-rose-950 bg-rose-100/90 px-1.5 py-0.5 rounded border border-rose-300 shadow-xs inline">
              {crimson}
            </span>
            {afterCrimson}
          </span>
        );
      }
      return (
        <span>
          {beforeAmber}
          <span className="font-bold text-amber-950 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300 shadow-xs inline">
            {amber}
          </span>
          {rest}
        </span>
      );
    }
    return <span>{fullText}</span>;
  }

  // paraNum === 2
  const indigo = PSYCH_PHRASES.p2_indigo[lang] || PSYCH_PHRASES.p2_indigo.en;
  const emerald = PSYCH_PHRASES.p2_emerald[lang] || PSYCH_PHRASES.p2_emerald.en;

  if (fullText.includes(indigo)) {
    const [beforeRaw, restRaw] = fullText.split(indigo);
    let beforeIndigo = beforeRaw;
    let rest = restRaw;

    // Clean up surrounding single quotes if present
    if (beforeIndigo.endsWith("'")) {
      beforeIndigo = beforeIndigo.slice(0, -1);
    }
    if (rest.startsWith("'")) {
      rest = rest.slice(1);
    }

    if (rest && rest.includes(emerald)) {
      const [between, afterEmerald] = rest.split(emerald);
      return (
        <span>
          {beforeIndigo}
          <span className="block my-2 p-2.5 rounded-xl bg-indigo-50/90 border-l-4 border-indigo-500 text-indigo-950 font-serif italic text-xs sm:text-sm shadow-sm">
            “{indigo}”
          </span>
          {between}
          <span className="font-bold text-emerald-950 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 shadow-xs inline">
            {emerald}
          </span>
          {afterEmerald}
        </span>
      );
    }

    return (
      <span>
        {beforeIndigo}
        <span className="block my-2 p-2.5 rounded-xl bg-indigo-50/90 border-l-4 border-indigo-500 text-indigo-950 font-serif italic text-xs sm:text-sm shadow-sm">
          “{indigo}”
        </span>
        {rest}
      </span>
    );
  }

  return <span>{fullText}</span>;
}

export default function AntarangadaSatyaPage(): JSX.Element {
  // 1. Context from Table QR Code URL
  const [tableNumber, setTableNumber] = useState<string>("");
  const [hotelName, setHotelName] = useState<string>("");

  // 2. Step 1 Gate: Language Selection First View
  const [isLanguageConfirmed, setIsLanguageConfirmed] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<AntarangaLang>("kn");
  const ui = ANTARANGA_UI_STRINGS[selectedLang] || ANTARANGA_UI_STRINGS.en;

  // 3. Unique Order Session ID & Package Tier Selection (₹350 vs ₹450)
  const [activeOrderId, setActiveOrderId] = useState<string>(() => generateHotelOrderId("1"));
  const [selectedPackage, setSelectedPackage] = useState<HotelPackageType>("standard_350");
  const packagePrice = selectedPackage === "remedy_450" ? HOTEL_PREMIUM_REMEDY_PRICE_INR : HOTEL_PDF_PRICE_INR;

  const [hasClickedPaymentApp, setHasClickedPaymentApp] = useState<boolean>(false);
  const [returnedFromPaymentApp, setReturnedFromPaymentApp] = useState<boolean>(false);
  const [showManualUtrInput, setShowManualUtrInput] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("table") || params.get("t") || "";
      const h = params.get("hotel") || params.get("h") || "";
      const l = params.get("lang") || params.get("l") || "";

      if (t) {
        setTableNumber(t);
        setActiveOrderId(generateHotelOrderId(t));
      }
      if (h) setHotelName(h);
      if (l && ANTARANGA_LANGUAGES.some((item) => item.code === l)) {
        setSelectedLang(l as AntarangaLang);
      }
    }
  }, []);

  // 4. User Input State
  const [devoteeName, setDevoteeName] = useState("");
  const [birthDate, setBirthDate] = useState("1995-05-15");
  const [birthTime, setBirthTime] = useState("10:30");
  const [selectedCityName, setSelectedCityName] = useState("Gokarna");
  const [latitude, setLatitude] = useState(14.5479);
  const [longitude, setLongitude] = useState(74.3188);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [customCitySearch, setCustomCitySearch] = useState("");

  // 5. Computation & Result State
  const [isCalculating, setIsCalculating] = useState(false);
  const [secretResult, setSecretResult] = useState<AntarangaSecretResult | null>(null);
  const [computedKundli, setComputedKundli] = useState<KundliOutput | null>(null);

  // 6. PDF Payloads for All 3 Reports
  const [fiveYearPayload, setFiveYearPayload] = useState<FiveYearPredictionPayload | null>(null);
  const [publicKundliProfile, setPublicKundliProfile] = useState<PublicKundliProfile | null>(null);
  const [publicKundliInsights, setPublicKundliInsights] = useState<DynamicLifeAnalysisOutput | null>(null);
  const [remedyDiagnosis, setRemedyDiagnosis] = useState<KundliRemedyDiagnosis | null>(null);

  // 7. Payment & Order State (₹350 or ₹450 strictly gated via Firebase Firestore)
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [verifiedTxnId, setVerifiedTxnId] = useState<string>("");

  // Single-use Download Guard: track downloaded status to disable button once downloaded
  const [downloadedPdfs, setDownloadedPdfs] = useState<{
    fiveYear?: boolean;
    kundli?: boolean;
    remedy?: boolean;
    all?: boolean;
  }>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = sessionStorage.getItem(`baggona_hotel_downloads_${activeOrderId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Re-sync downloaded state if activeOrderId changes
  useEffect(() => {
    if (!activeOrderId || typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(`baggona_hotel_downloads_${activeOrderId}`);
      if (saved) {
        setDownloadedPdfs(JSON.parse(saved));
      }
    } catch {}
  }, [activeOrderId]);

  // 8. PDF Generation State & Refs
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStageText, setPdfStageText] = useState("");
  const [pdfDownloadReady, setPdfDownloadReady] = useState(false);

  // PDF blob URLs for iPhone / Safari
  const [fiveYearPdfUrl, setFiveYearPdfUrl] = useState<string | null>(null);
  const [kundliPdfUrl, setKundliPdfUrl] = useState<string | null>(null);
  const [remedyPdfUrl, setRemedyPdfUrl] = useState<string | null>(null);

  const fiveYearPdfRef = useRef<HTMLDivElement>(null);
  const kundliPdfRef = useRef<HTMLDivElement>(null);
  const remedyPdfRef = useRef<HTMLDivElement>(null);

  // 9. Astrological Full-Screen Loader State for Mobile & Desktop
  const [screenLoaderOpen, setScreenLoaderOpen] = useState(false);
  const [screenLoaderStage, setScreenLoaderStage] = useState<AntarangaLoaderStage>("antaranga_calc");
  const [screenLoaderTitle, setScreenLoaderTitle] = useState<string | undefined>(undefined);
  const [screenLoaderMessage, setScreenLoaderMessage] = useState<string | undefined>(undefined);
  const [screenLoaderProgress, setScreenLoaderProgress] = useState<number | undefined>(undefined);

  const triggerScreenLoader = (
    stage: AntarangaLoaderStage,
    durationMs?: number,
    options?: { title?: string; message?: string; progress?: number }
  ) => {
    setScreenLoaderStage(stage);
    setScreenLoaderTitle(options?.title);
    setScreenLoaderMessage(options?.message);
    setScreenLoaderProgress(options?.progress);
    setScreenLoaderOpen(true);
    if (durationMs && durationMs > 0) {
      setTimeout(() => {
        setScreenLoaderOpen(false);
      }, durationMs);
    }
  };

  const closeScreenLoader = () => {
    setScreenLoaderOpen(false);
  };

  // Map 7-languages to Public Kundli 5-Language & Remedy locale
  const publicKundliLang: PublicKundliLang =
    (selectedLang === "mr" ? "hi" : selectedLang === "ml" ? "en" : selectedLang) as PublicKundliLang;
  const remedyLang = (selectedLang === "mr" ? "hi" : selectedLang === "ml" ? "en" : selectedLang);

  // Generate dynamic UPI QR Code matching the chosen package (₹350 or ₹450)
  useEffect(() => {
    const upiUri = getHotelPaymentUpiUri(packagePrice, activeOrderId);
    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    })
      .then((url) => setPaymentQrDataUrl(url))
      .catch((err) => console.warn("Payment QR error:", err));
  }, [activeOrderId, packagePrice]);

  // Synchronize Order with Firebase Firestore when package or devotee details change
  useEffect(() => {
    if (activeOrderId && devoteeName.trim()) {
      const orderDoc: HotelTableOrderDoc = {
        id: activeOrderId,
        orderId: activeOrderId,
        tableNumber: tableNumber || "1",
        hotelName: hotelName || "Pandit Palette",
        devoteeName: devoteeName.trim(),
        amountInr: packagePrice,
        packageType: selectedPackage,
        status: isPaymentVerified ? "VERIFIED" : "INITIATED",
        selectedLang,
        birthDate,
        birthTime,
        placeName: selectedCityName,
        latitude,
        longitude,
        gender,
        createdAt: new Date().toISOString()
      };
      void saveHotelOrderInitiated(orderDoc);
    }
  }, [activeOrderId, devoteeName, packagePrice, selectedPackage, selectedLang, birthDate, birthTime, selectedCityName, latitude, longitude, gender, isPaymentVerified]);

  // App-Switch detection: Listen for user returning from PhonePe / GPay / Paytm
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasClickedPaymentApp && !isPaymentVerified) {
        setReturnedFromPaymentApp(true);
      }
    };
    const handleWindowFocus = () => {
      if (hasClickedPaymentApp && !isPaymentVerified) {
        setReturnedFromPaymentApp(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [hasClickedPaymentApp, isPaymentVerified]);

  // Automated Webhook Polling: If PhonePe webhook confirms payment, auto-unlock in real-time
  useEffect(() => {
    if (!showPaymentSection || isPaymentVerified || !activeOrderId) return;

    const intervalId = setInterval(async () => {
      try {
        const isPaid = await checkHotelPaymentWebhookStatus(activeOrderId, packagePrice);
        if (isPaid) {
          clearInterval(intervalId);
          setIsPaymentVerified(true);
          setVerifiedTxnId(`TXN_WEBHOOK_${activeOrderId}`);
        }
      } catch {
        // Silently continue polling
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [showPaymentSection, isPaymentVerified, activeOrderId, packagePrice]);

  // Quick City Selection
  const handleSelectQuickCity = (city: { name: string; lat: number; lng: number }) => {
    setSelectedCityName(city.name);
    setLatitude(city.lat);
    setLongitude(city.lng);
  };

  // Custom City Lookup
  const handleSearchCustomCity = async () => {
    if (!customCitySearch.trim()) return;
    setIsSearchingCity(true);
    try {
      const res = await resolvePlaceOrPincode(customCitySearch.trim());
      if (res && res.lat && res.lng) {
        setSelectedCityName(res.placeName || customCitySearch);
        setLatitude(res.lat);
        setLongitude(res.lng);
        setCustomCitySearch("");
      } else {
        alert(ui.cityNotFoundError);
      }
    } catch {
      alert(ui.cityNotFoundError);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // 1-Click Free "Get Antarangada Satya" with Astrological Full-Screen Loader
  const handleGetDarkSecret = async () => {
    if (!devoteeName.trim()) {
      alert(ui.nameRequiredError);
      return;
    }

    setIsCalculating(true);
    triggerScreenLoader("antaranga_calc", undefined, { progress: 20 });

    try {
      // Allow user to witness the authentic celestial chakra alignment
      await new Promise((r) => setTimeout(r, 450));
      setScreenLoaderProgress(55);

      const input: KundliInput = {
        name: devoteeName.trim(),
        birthDate,
        birthTime,
        latitude,
        longitude,
        gender: gender === "female" ? "Female" : "Male"
      };

      const kundli = calculateKundli(input);
      setComputedKundli(kundli);

      // 1. Generate Free Dark Secret & Complete 7-Language Free Revelation Suite
      const secret = generateAntarangaSatya(
        kundli,
        selectedLang,
        devoteeName.trim(),
        gender,
        birthDate,
        birthTime,
        latitude,
        longitude
      );
      setSecretResult(secret);

      // 2. Pre-compute 5-Year Master Horizon
      try {
        const pdfLang: SixLang = (selectedLang === "ml" ? "en" : selectedLang) as SixLang;
        const payload = compute5YearMasterPrediction(
          kundli,
          birthDate,
          birthTime,
          pdfLang,
          devoteeName.trim(),
          new Date().getFullYear(),
          {
            gender: gender === "female" ? "Female" : "Male",
            latitude,
            longitude,
            ayanamsa: "lahiri"
          }
        );
        setFiveYearPayload(payload);
      } catch (payloadErr) {
        console.warn("Precomputing 5-year payload warning:", payloadErr);
      }

      // 3. Pre-compute Baggona Panchanga Janma Kundali Multi-Page Profile
      try {
        const profile = calculatePublicKundliProfile(kundli, birthDate, birthTime, latitude, longitude);
        setPublicKundliProfile(profile);
        const insights = generateDynamicLifeInsights(profile, publicKundliLang);
        setPublicKundliInsights(insights);
      } catch (kundliErr) {
        console.warn("Precomputing public kundli profile warning:", kundliErr);
      }

      // 4. Pre-compute Sacred Gokarna Remedy Dossier
      try {
        const diag = generateKundliRemedyReport(kundli, input);
        setRemedyDiagnosis(diag);
      } catch (remedyErr) {
        console.warn("Precomputing remedy report warning:", remedyErr);
      }

      // 5. Register Order in Firebase Firestore
      const initialOrder: HotelTableOrderDoc = {
        id: activeOrderId,
        orderId: activeOrderId,
        tableNumber: tableNumber || "1",
        hotelName: hotelName || "Pandit Palette",
        devoteeName: devoteeName.trim(),
        amountInr: packagePrice,
        packageType: selectedPackage,
        status: "INITIATED",
        selectedLang,
        birthDate,
        birthTime,
        placeName: selectedCityName,
        latitude,
        longitude,
        gender,
        createdAt: new Date().toISOString()
      };
      void saveHotelOrderInitiated(initialOrder);

      setScreenLoaderProgress(100);
      await new Promise((r) => setTimeout(r, 350));

      // Smooth scroll to the result
      setTimeout(() => {
        const resultEl = document.getElementById("antaranga-result-card");
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } catch (err: any) {
      console.error("Antaranga calculation error:", err);
      alert(ui.calcError);
    } finally {
      setIsCalculating(false);
      closeScreenLoader();
    }
  };

  // Re-generate secret and profiles when language changes
  useEffect(() => {
    if (computedKundli && devoteeName.trim()) {
      const updatedSecret = generateAntarangaSatya(
        computedKundli,
        selectedLang,
        devoteeName.trim(),
        gender
      );
      setSecretResult(updatedSecret);

      try {
        const pdfLang: SixLang = (selectedLang === "ml" ? "en" : selectedLang) as SixLang;
        const payload = compute5YearMasterPrediction(
          computedKundli,
          birthDate,
          birthTime,
          pdfLang,
          devoteeName.trim(),
          new Date().getFullYear(),
          {
            gender: gender === "female" ? "Female" : "Male",
            latitude,
            longitude,
            ayanamsa: "lahiri"
          }
        );
        setFiveYearPayload(payload);
      } catch (err) {
        console.warn("Language switch payload warning:", err);
      }

      try {
        const profile = calculatePublicKundliProfile(computedKundli, birthDate, birthTime, latitude, longitude);
        setPublicKundliProfile(profile);
        const insights = generateDynamicLifeInsights(profile, publicKundliLang);
        setPublicKundliInsights(insights);
      } catch {}
    }
  }, [selectedLang]);

  // Mandatory 12-Digit UPI UTR Payment Verification Handler with Firestore Consistency
  const handleVerifyManualPayment = async () => {
    if (!enteredUtr.trim()) {
      setPaymentError(ui.utrLabel);
      return;
    }

    setIsVerifyingPayment(true);
    setPaymentError(null);
    triggerScreenLoader("payment_verify", undefined, { progress: 30 });

    try {
      await new Promise((r) => setTimeout(r, 450));
      setScreenLoaderProgress(60);

      const res = await verifyHotelPaymentUtr(
        enteredUtr.trim(),
        devoteeName || "Hotel Devotee",
        packagePrice,
        selectedLang,
        activeOrderId,
        selectedPackage
      );

      if (!res.success) {
        setPaymentError(res.message);
        return;
      }

      setScreenLoaderProgress(85);
      // Check Firestore to guarantee 100% human financial consistency
      const fsCheck = await verifyHotelOrderPayment(activeOrderId, packagePrice);
      if (!fsCheck.verified) {
        setPaymentError(fsCheck.reason || "Payment record verification pending in database.");
        return;
      }

      setScreenLoaderProgress(100);
      await new Promise((r) => setTimeout(r, 350));

      setIsPaymentVerified(true);
      setVerifiedTxnId(res.transactionId || `TXN_${enteredUtr.trim()}`);

      // Smooth scroll to Download Center so user sees download buttons
      setTimeout(() => {
        const downloadCenterEl = document.getElementById("hotel-download-center");
        if (downloadCenterEl) {
          downloadCenterEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } catch (err: any) {
      setPaymentError(err?.message || "Payment verification failed.");
    } finally {
      setIsVerifyingPayment(false);
      closeScreenLoader();
    }
  };

  // ── STRICT SECURITY: Verify in Firebase Firestore before allowing any PDF generation ──
  const ensurePaymentVerified = async (): Promise<boolean> => {
    if (!isPaymentVerified) {
      setShowPaymentSection(true);
      setTimeout(() => {
        const payEl = document.getElementById("hotel-payment-box");
        if (payEl) payEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return false;
    }

    // Verify in Firestore database
    const check = await verifyHotelOrderPayment(activeOrderId, packagePrice);
    if (!check.verified) {
      setPaymentError(check.reason || ui.unpaidWarning);
      setIsPaymentVerified(false);
      setShowPaymentSection(true);
      return false;
    }
    return true;
  };

  // 1. Download 5-Year Master Destiny PDF (Single-use disabled once downloaded)
  const handleDownload5YearPdf = async (isPartOfBatch = false) => {
    if (!(await ensurePaymentVerified())) return;
    if (downloadedPdfs.fiveYear || downloadedPdfs.all) {
      alert(ui.alreadyDownloadedAlert);
      return;
    }
    if (!fiveYearPdfRef.current) {
      alert("PDF template loading. Please retry in 2 seconds.");
      return;
    }

    const stages = PDF_STAGES[selectedLang] || PDF_STAGES.en;
    setIsGeneratingPdf(true);
    setPdfProgress(15);
    setPdfStageText(stages.s1);
    if (!isPartOfBatch) {
      triggerScreenLoader("pdf_download_5year", undefined, { progress: 15 });
    }

    try {
      const cleanName = (devoteeName || "Devotee").replace(/\s+/g, "_");
      const fileName = `Pandit_Palette_5_Year_Destiny_${selectedLang.toUpperCase()}_${cleanName}.pdf`;

      const pdf = await captureFiveYearPredictionPdf(
        fiveYearPdfRef.current,
        fileName,
        true,
        (p) => {
          setPdfProgress(p);
          if (!isPartOfBatch) setScreenLoaderProgress(p);
          if (p < 40) setPdfStageText(stages.s1);
          else if (p < 80) setPdfStageText(stages.s2);
          else setPdfStageText(stages.s3);
        }
      );

      try {
        const arrayBuf = pdf.output("arraybuffer");
        const blob = new Blob([arrayBuf], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setFiveYearPdfUrl(blobUrl);
      } catch (blobErr) {
        console.warn("Blob URL preview warning:", blobErr);
      }

      setPdfDownloadReady(true);
      setPdfProgress(100);
      if (!isPartOfBatch) setScreenLoaderProgress(100);
      setPdfStageText(stages.done);

      // Single-use disable: mark 5-Year PDF as successfully downloaded
      setDownloadedPdfs((prev) => {
        const next = { ...prev, fiveYear: true };
        try {
          sessionStorage.setItem(`baggona_hotel_downloads_${activeOrderId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (pdfErr: any) {
      console.error("5-Year PDF Generation error:", pdfErr);
      alert(`PDF download error: ${pdfErr?.message || "Please try again."}`);
    } finally {
      setIsGeneratingPdf(false);
      if (!isPartOfBatch) {
        closeScreenLoader();
      }
    }
  };

  // 2. Download Baggona Panchanga Janma Kundali Multi-Page PDF (Single-use disabled once downloaded)
  const handleDownloadKundliPdf = async (isPartOfBatch = false) => {
    if (!(await ensurePaymentVerified())) return;
    if (downloadedPdfs.kundli || downloadedPdfs.all) {
      alert(ui.alreadyDownloadedAlert);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfProgress(30);
    setPdfStageText(ui.generatingKundliPdfStage);
    if (!isPartOfBatch) {
      triggerScreenLoader("pdf_download_kundli", undefined, { progress: 30 });
    }

    try {
      const cleanName = (devoteeName || "Devotee").replace(/\s+/g, "_");
      const fileName = `Baggona_Panchanga_Janma_Kundali_${selectedLang.toUpperCase()}_${cleanName}.pdf`;

      if (!isPartOfBatch) setScreenLoaderProgress(60);
      const pdf = await generatePDFFromElement("hotel-kundli-pdf-render", fileName, true);

      try {
        const arrayBuf = pdf.output("arraybuffer");
        const blob = new Blob([arrayBuf], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setKundliPdfUrl(blobUrl);
      } catch {}

      setPdfDownloadReady(true);
      setPdfProgress(100);
      if (!isPartOfBatch) setScreenLoaderProgress(100);
      setPdfStageText(PDF_STAGES[selectedLang]?.done || PDF_STAGES.en.done);

      // Single-use disable: mark Kundli PDF as successfully downloaded
      setDownloadedPdfs((prev) => {
        const next = { ...prev, kundli: true };
        try {
          sessionStorage.setItem(`baggona_hotel_downloads_${activeOrderId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (pdfErr: any) {
      console.error("Kundli PDF Generation error:", pdfErr);
      alert(`Kundli PDF download error: ${pdfErr?.message || "Please try again."}`);
    } finally {
      setIsGeneratingPdf(false);
      if (!isPartOfBatch) {
        closeScreenLoader();
      }
    }
  };

  // 3. Download Sacred Gokarna Remedy & Parihara PDF (Available in ₹450 Package, single-use disabled once downloaded)
  const handleDownloadRemedyPdf = async (isPartOfBatch = false) => {
    if (!(await ensurePaymentVerified())) return;
    if (downloadedPdfs.remedy || downloadedPdfs.all) {
      alert(ui.alreadyDownloadedAlert);
      return;
    }

    setIsGeneratingPdf(true);
    setPdfProgress(40);
    setPdfStageText(ui.generatingRemedyPdfStage);
    if (!isPartOfBatch) {
      triggerScreenLoader("pdf_download_remedy", undefined, { progress: 40 });
    }

    try {
      const cleanName = (devoteeName || "Devotee").replace(/\s+/g, "_");
      const fileName = `Baggona_Gokarna_Remedy_Dossier_${selectedLang.toUpperCase()}_${cleanName}.pdf`;

      if (!isPartOfBatch) setScreenLoaderProgress(70);
      const pdf = await generatePDFFromElement("hotel-remedy-pdf-render", fileName, true);

      try {
        const arrayBuf = pdf.output("arraybuffer");
        const blob = new Blob([arrayBuf], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setRemedyPdfUrl(blobUrl);
      } catch {}

      setPdfDownloadReady(true);
      setPdfProgress(100);
      if (!isPartOfBatch) setScreenLoaderProgress(100);
      setPdfStageText(PDF_STAGES[selectedLang]?.done || PDF_STAGES.en.done);

      // Single-use disable: mark Remedy PDF as successfully downloaded
      setDownloadedPdfs((prev) => {
        const next = { ...prev, remedy: true };
        try {
          sessionStorage.setItem(`baggona_hotel_downloads_${activeOrderId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (pdfErr: any) {
      console.error("Remedy PDF Generation error:", pdfErr);
      alert(`Remedy PDF download error: ${pdfErr?.message || "Please try again."}`);
    } finally {
      setIsGeneratingPdf(false);
      if (!isPartOfBatch) {
        closeScreenLoader();
      }
    }
  };

  // 4. Download Complete Package (All remaining PDFs sequentially, disabled once completed)
  const handleDownloadAllPdfs = async () => {
    if (!(await ensurePaymentVerified())) return;
    const isAllDone =
      Boolean(downloadedPdfs.all) ||
      (Boolean(downloadedPdfs.fiveYear) &&
        Boolean(downloadedPdfs.kundli) &&
        (selectedPackage !== "remedy_450" || Boolean(downloadedPdfs.remedy)));
    if (isAllDone) {
      alert(ui.allAlreadyDownloadedAlert);
      return;
    }

    triggerScreenLoader("pdf_download_all", undefined, { progress: 10 });
    try {
      if (!downloadedPdfs.fiveYear) {
        await handleDownload5YearPdf(true);
      }
      setScreenLoaderProgress(45);
      await new Promise((r) => setTimeout(r, 600));

      if (!downloadedPdfs.kundli) {
        await handleDownloadKundliPdf(true);
      }
      setScreenLoaderProgress(75);

      if (selectedPackage === "remedy_450" && !downloadedPdfs.remedy) {
        await new Promise((r) => setTimeout(r, 600));
        await handleDownloadRemedyPdf(true);
        setScreenLoaderProgress(95);
      }

      setScreenLoaderProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      // Single-use disable: mark all as downloaded
      setDownloadedPdfs((prev) => {
        const next = { ...prev, fiveYear: true, kundli: true, remedy: true, all: true };
        try {
          sessionStorage.setItem(`baggona_hotel_downloads_${activeOrderId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (batchErr: any) {
      console.error("Batch download error:", batchErr);
      alert(`Download error: ${batchErr?.message || "Please retry downloading individually."}`);
    } finally {
      closeScreenLoader();
    }
  };

  const currentCities = QUICK_CITIES_BY_LANG[selectedLang] || QUICK_CITIES_BY_LANG.en;

  // ═════════════════════════════════════════════════════════════════════════
  // SCREEN 1: DEDICATED WHOLE-PAGE LANGUAGE SELECTION FIRST VIEW
  // ═════════════════════════════════════════════════════════════════════════
  if (!isLanguageConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FFF3DE] text-stone-900 font-sans selection:bg-amber-300 selection:text-amber-950 flex flex-col justify-between relative overflow-x-hidden">
        {/* Background Rotating Mandalas */}
        <AmbientRotatingMandalaWatermark />

        {/* Top Gold Gradient Bar with Shimmer */}
        <div className="relative z-10 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 via-amber-300 to-amber-600 w-full shadow-sm" />

        {/* Central Language Selection Portal */}
        <div className="relative z-10 max-w-xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center space-y-6 text-center">
          {/* Rotating Surya Emblem + Temple Invocation */}
          <div className="flex flex-col items-center justify-center gap-3">
            <RotatingSuryaKalachakra size={64} />
            <div className="text-xs tracking-widest text-amber-900 font-serif font-black uppercase flex items-center justify-center gap-2">
              <span className="inline-block animate-spin-slow text-amber-700 text-xs">☸</span>
              <span>{ui.topMantra}</span>
              <span className="inline-block animate-spin-slow text-amber-700 text-xs">☸</span>
            </div>
          </div>

          {/* Hotel Identity */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 border-2 border-amber-300/80 text-amber-950 text-xs font-bold shadow-sm">
              <span>🍽️</span>
              <span>{hotelName || DEFAULT_HOTEL_FULL_NAME}</span>
              {tableNumber && (
                <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full font-black text-[10px]">
                  {ui.tableLabel} {tableNumber}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif">
              {ui.langSelectHeader}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
              {ui.langSelectSubtitle}
            </p>
          </div>

          {/* 7-Language Interactive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            {ANTARANGA_LANGUAGES.map((l) => {
              const isSelected = selectedLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    if (selectedLang !== l.code) {
                      triggerScreenLoader("language_switch", 450);
                      setSelectedLang(l.code);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-100/95 via-amber-50 to-amber-100/95 border-[#D4AF37] shadow-[0_6px_24px_rgba(217,119,6,0.18)] scale-[1.02]"
                      : "bg-white/95 border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/70 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {l.code === "kn" ? "🟡" : l.code === "hi" ? "🟠" : l.code === "te" ? "🟢" : l.code === "ta" ? "🟣" : l.code === "ml" ? "🔵" : l.code === "mr" ? "🔴" : "🌐"}
                    </span>
                    <div>
                      <div className="text-base font-black text-amber-950 font-serif">
                        {l.nativeName}
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {l.englishName}
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-[#D4AF37] bg-amber-500" : "border-stone-300 bg-stone-100"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue Action Button with Astrological Screen Loader */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                triggerScreenLoader("language_init", 700);
                setTimeout(() => {
                  setIsLanguageConfirmed(true);
                }, 700);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-black text-base tracking-wide shadow-xl shadow-amber-600/30 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{ui.startReadingBtn}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-4 text-center text-[11px] text-stone-500 border-t border-amber-200/80 font-serif">
          {ui.footerSanctum}
        </footer>

        {/* Full-Screen Astrological Screen Loader for Screen 1 */}
        <AntarangaAstrologicalScreenLoader
          isOpen={screenLoaderOpen}
          stage={screenLoaderStage}
          lang={selectedLang}
          customTitle={screenLoaderTitle}
          customMessage={screenLoaderMessage}
          devoteeName={devoteeName}
          progressPercent={screenLoaderProgress}
        />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SCREEN 2: DEVOTEE FORM, DARK SECRET, PACKAGE SELECTION & PAYMENT GATE
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FFF3DE] text-stone-900 font-sans selection:bg-amber-300 selection:text-amber-950 relative overflow-x-hidden">
      {/* Background Rotating Mandalas */}
      <AmbientRotatingMandalaWatermark />

      {/* Top Gold Bar with Shimmer */}
      <div className="relative z-10 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 via-amber-300 to-amber-600 w-full shadow-sm" />

      {/* Hotel & Table Welcome Banner */}
      <header className="relative z-10 max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2.5">
            <RotatingSuryaKalachakra size={44} />
            <div>
              <div className="text-xs tracking-wider text-amber-900 font-serif font-black uppercase flex items-center gap-1.5">
                <span className="inline-block animate-spin-slow text-amber-700 text-[10px]">☸</span>
                <span>{ui.topMantra}</span>
              </div>
              <h1 className="text-lg font-black text-amber-950 font-serif">
                {hotelName ? hotelName : ui.defaultSanctuaryTitle}
                {tableNumber && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {ui.tableLabel} {tableNumber}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Change Language Button + 7-Language Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerScreenLoader("language_switch", 600);
                setTimeout(() => setIsLanguageConfirmed(false), 600);
              }}
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-white px-2.5 py-1.5 rounded-xl border-2 border-amber-300 hover:border-amber-400 shadow-sm transition cursor-pointer"
            >
              {ui.changeLangBtn}
            </button>
            <div className="flex flex-wrap items-center gap-1 bg-amber-100/70 border border-amber-300 rounded-xl p-1 text-xs shadow-inner">
              {ANTARANGA_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    if (selectedLang !== l.code) {
                      triggerScreenLoader("language_switch", 550);
                      setSelectedLang(l.code);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg font-medium transition cursor-pointer ${
                    selectedLang === l.code
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-sm"
                      : "text-stone-700 hover:text-amber-900"
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
            <span className="inline-block animate-spin-slow text-amber-700">☸</span>
            <span>{ui.freeBannerBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif">
            {ui.heroTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
            {ui.heroSubtitle}
          </p>
        </div>

        {/* ── STEP 1: Devotee Free Input Form ── */}
        <section className="bg-white/95 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(217,119,6,0.12)] space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <span>👤</span>
              <span>{ui.formHeader}</span>
            </h3>
            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-sm">
              {ui.freeTag}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Devotee Name */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {ui.nameLabel}
              </label>
              <input
                type="text"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                placeholder={ui.namePlaceholder}
                className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 font-medium shadow-sm"
              />
            </div>

            {/* Birth Date & Birth Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {ui.dateLabel}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 font-medium shadow-sm"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {ui.timeLabel}
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-500 font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {ui.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    gender === "male"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md font-bold"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >
                  <span>👨</span>
                  <span>{ui.maleLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    gender === "female"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-md font-bold"
                      : "bg-white border-amber-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >
                  <span>👩</span>
                  <span>{ui.femaleLabel}</span>
                </button>
              </div>
            </div>

            {/* Birth Place */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-stone-700 font-semibold">
                  {ui.placeLabel}: <span className="text-amber-800 font-bold">{selectedCityName}</span>
                </label>
              </div>

              {/* Quick Popular Cities */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectQuickCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border-2 transition cursor-pointer ${
                      selectedCityName === c.name
                        ? "bg-amber-200/90 border-amber-500 text-amber-950 font-black shadow-sm"
                        : "bg-white border-amber-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Google-Style Pan-India Instant City Dropdown Autocomplete */}
              <div className="relative">
                <CityAutocompleteInput
                  value={customCitySearch}
                  placeholder={ui.customSearchPlaceholder}
                  onSelectCity={(city) => {
                    setSelectedCityName(city.name);
                    setLatitude(city.lat);
                    setLongitude(city.lng);
                    setCustomCitySearch(city.name);
                  }}
                  currentSelectedCity={selectedCityName}
                  currentLat={latitude}
                  currentLng={longitude}
                />
              </div>
            </div>
          </div>

          {/* Big Golden Action Button */}
          <button
            type="button"
            onClick={handleGetDarkSecret}
            disabled={isCalculating}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-amber-600/30 hover:from-amber-600 hover:to-yellow-700 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{ui.calculatingCta}</span>
              </>
            ) : (
              <span>{ui.revealSecretCta}</span>
            )}
          </button>
        </section>

        {/* ── STEP 2: The Two 100% Accurate Paragraphs Result ── */}
        {secretResult && (
          <section
            id="antaranga-result-card"
            className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-5 sm:p-6 shadow-[0_12px_45px_rgba(217,119,6,0.18)] space-y-4 animate-in fade-in duration-300"
          >
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-800 uppercase flex items-center gap-1">
                  <span className="inline-block animate-spin-slow text-amber-600">☸</span>
                  <span>{ui.resultBadge}</span>
                </span>
                <h3 className="text-xl font-black text-amber-950 font-serif">
                  {secretResult.devoteeName} {ui.resultHeading}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
                {ui.authenticTruthBadge}
              </span>
            </div>

            {/* Astrological Coordinates Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-amber-50/80 border-2 border-amber-200 rounded-xl p-2.5">
              <div>
                <span className="text-stone-500 block text-[10px]">{ui.moonSignLabel}:</span>
                <span className="font-bold text-amber-950">{secretResult.moonSignName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">{ui.starLabel}:</span>
                <span className="font-bold text-amber-950">
                  {secretResult.nakshatraName} ({secretResult.moonPada})
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">{ui.lagnaLabel}:</span>
                <span className="font-bold text-amber-950">{secretResult.lagnaSignName}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[10px]">{ui.h8LordLabel}:</span>
                <span className="font-bold text-amber-950">{secretResult.h8LordName}</span>
              </div>
            </div>

            {/* Paragraph 1: Outward Composure vs Hidden Inner Dilemma */}
            <div className="bg-gradient-to-r from-amber-50/90 via-[#FFFDF7] to-amber-50/40 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed font-serif space-y-2 shadow-sm">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <span>{ui.paragraph1Title}</span>
              </div>
              <div className="text-stone-800 text-justify leading-relaxed">
                {renderPsychologicalAntarangaText(secretResult.paragraph1, selectedLang, 1)}
              </div>
            </div>

            {/* Paragraph 2: Subconscious Solitude & The Unspoken Truth */}
            <div className="bg-gradient-to-r from-amber-50/90 via-[#FFFDF7] to-amber-50/40 border-l-4 border-amber-400 rounded-r-xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed font-serif space-y-2 shadow-sm">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <span>{ui.paragraph2Title}</span>
              </div>
              <div className="text-stone-800 text-justify leading-relaxed">
                {renderPsychologicalAntarangaText(secretResult.paragraph2, selectedLang, 2)}
              </div>
            </div>

            {/* Sacred Kshetra Blessing */}
            <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed font-serif shadow-sm">
              {secretResult.kshetraBlessing}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 🌟 FREE FEATURE SUITE: COSMIC VOLTAGE, MOORTHY NIRNAYA,        */}
            {/*    LUCKY BLUEPRINT, 5-YEAR TEASER & DINING SOCIAL PROOF        */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* 1. ⚡ COSMIC LIFE VOLTAGE & GOCHARA NIRNAYA */}
            {secretResult.cosmicVoltage && (
              <div className="bg-white/95 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-amber-950 font-serif">
                        {ui.gocharaSectionTitle}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {secretResult.cosmicVoltage.energyLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-amber-700">
                      {secretResult.cosmicVoltage.energyScore}%
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {ui.gocharaSectionBadge}
                    </span>
                  </div>
                </div>

                {/* Animated Energy Progress Meter */}
                <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden border border-amber-300 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-amber-500 to-yellow-500 transition-all duration-1000 shadow-md"
                    style={{ width: `${secretResult.cosmicVoltage.energyScore}%` }}
                  />
                </div>
                <p className="text-xs text-stone-800 leading-relaxed font-serif">
                  {secretResult.cosmicVoltage.energyDesc}
                </p>

                {/* 3-Pillar Gochara & Dasha Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  {/* Shani Transit Status */}
                  <div className="bg-gradient-to-b from-[#FFFDF7] to-amber-50/50 border border-amber-200 rounded-xl p-2.5 space-y-1 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-stone-600 block">
                      🪐 {ui.shaniTransitTitle}
                    </span>
                    <span className="font-bold text-amber-950 block">
                      {secretResult.cosmicVoltage.shaniGocharaStatus}
                    </span>
                    <p className="text-[10px] text-stone-600 leading-tight">
                      {secretResult.cosmicVoltage.shaniGocharaImpact}
                    </p>
                  </div>

                  {/* Guru Bala Status */}
                  <div className="bg-gradient-to-b from-[#FFFDF7] to-amber-50/50 border border-amber-200 rounded-xl p-2.5 space-y-1 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-stone-600 block">
                      🌟 {ui.guruBalaTitle}
                    </span>
                    <span className="font-bold text-amber-900 block">
                      {secretResult.cosmicVoltage.guruGocharaStatus}
                    </span>
                    <p className="text-[10px] text-stone-600 leading-tight">
                      {secretResult.cosmicVoltage.guruGocharaImpact}
                    </p>
                  </div>

                  {/* Running Dasha & Bhukti */}
                  <div className="bg-gradient-to-b from-[#FFFDF7] to-amber-50/50 border border-amber-200 rounded-xl p-2.5 space-y-1 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-stone-600 block">
                      ⏳ {ui.runningDashaTitle}
                    </span>
                    <span className="font-bold text-amber-950 block">
                      {secretResult.cosmicVoltage.activeMahadasha} - {secretResult.cosmicVoltage.activeBhukti}
                    </span>
                    <span className="text-[10px] text-stone-600 block">
                      {secretResult.cosmicVoltage.dashaPeriodText}
                    </span>
                  </div>
                </div>

                {/* Turning Point Verdict Card */}
                <div className="bg-amber-50/90 border-l-4 border-amber-500 rounded-r-xl p-3 text-xs text-amber-950 font-serif leading-relaxed shadow-sm">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    ⚖️ {ui.turningPointVerdictTitle}
                  </span>
                  {secretResult.cosmicVoltage.turningPointVerdict}
                </div>
              </div>
            )}

            {/* 2. 🏆 CLASSICAL MOORTHY NIRNAYA (ಮೂರ್ತಿ ನಿರ್ಣಯ) */}
            {secretResult.moorthyNirnaya && (
              <div className="bg-gradient-to-r from-amber-50 via-[#FFFDF7] to-amber-50 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 shadow-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {secretResult.moorthyNirnaya.tier === "swarna" ? "🥇"
                        : secretResult.moorthyNirnaya.tier === "rajata" ? "🥈"
                        : secretResult.moorthyNirnaya.tier === "tamra" ? "🥉"
                        : "🛡️"}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-amber-950 font-serif">
                        {secretResult.moorthyNirnaya.title}: {secretResult.moorthyNirnaya.moorthyName}
                      </h4>
                      <span className="text-[11px] font-bold text-amber-800">
                        {secretResult.moorthyNirnaya.badge}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {ui.moorthyClassicalBadge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-serif">
                  {secretResult.moorthyNirnaya.description}
                </p>
              </div>
            )}

            {/* 3. 💎 FREE DIVINE LUCKY BLUEPRINT */}
            {secretResult.luckyElements && (
              <div className="bg-white/95 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider font-serif">
                      {ui.luckyBlueprintTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    {ui.luckyBlueprintBadge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Gemstone */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 space-y-0.5 shadow-sm">
                    <span className="text-[10px] text-stone-600 block font-medium">
                      💍 {ui.luckyGemstoneLabel}
                    </span>
                    <span className="font-bold text-amber-950 text-xs block truncate">
                      {secretResult.luckyElements.gemstone}
                    </span>
                  </div>

                  {/* Lucky Day */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 space-y-0.5 shadow-sm">
                    <span className="text-[10px] text-stone-600 block font-medium">
                      🗓️ {ui.luckyDayLabel}
                    </span>
                    <span className="font-bold text-amber-950 text-xs block">
                      {secretResult.luckyElements.luckyDay}
                    </span>
                  </div>

                  {/* Lucky Number */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 space-y-0.5 shadow-sm">
                    <span className="text-[10px] text-stone-600 block font-medium">
                      🔢 {ui.luckyNumberLabel}
                    </span>
                    <span className="font-bold text-amber-950 text-xs block">
                      {secretResult.luckyElements.luckyNumber}
                    </span>
                  </div>

                  {/* Auspicious Direction & Color */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 space-y-0.5 shadow-sm">
                    <span className="text-[10px] text-stone-600 block font-medium">
                      🧭 {ui.luckyDirectionColorLabel}
                    </span>
                    <span className="font-bold text-amber-950 text-xs block truncate">
                      {secretResult.luckyElements.luckyDirection} • {secretResult.luckyElements.luckyColor}
                    </span>
                  </div>
                </div>

                {/* Ishta Devata Banner */}
                <div className="bg-amber-100/70 border border-amber-300 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-amber-950 font-serif shadow-sm">
                  <span className="text-base">🕉️</span>
                  <span>
                    <strong className="text-amber-900">{ui.ishtaDevataLabel}</strong>{" "}
                    {secretResult.luckyElements.ishtaDevata}
                  </span>
                </div>
              </div>
            )}

            {/* 4. 🔮 NEXT 5-YEAR HORIZON SNEAK PREVIEW & LOCKED TEASERS */}
            {secretResult.fiveYearPreview && (
              <div className="bg-gradient-to-b from-[#FFFDF7] to-amber-50/50 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔮</span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-amber-950 font-serif">
                        {ui.fiveYearPreviewTitle}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {ui.fiveYearPreviewSubtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase tracking-wider">
                    {ui.year1FreeBadge}
                  </span>
                </div>

                {/* YEAR 1 (2026 - 2027) UNLOCKED FREE CARD */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border-2 border-amber-400 rounded-xl p-3.5 sm:p-4 space-y-2 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-950 bg-amber-400 px-2 py-0.5 rounded-full">
                        {secretResult.fiveYearPreview.year1.gregorianRange}
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        {secretResult.fiveYearPreview.year1.samvatsaraName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      ⚡ {ui.vitalityScoreLabel}: {secretResult.fiveYearPreview.year1.vitalityScore}%
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-amber-950 font-serif">
                    {secretResult.fiveYearPreview.year1.headline}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-amber-300 rounded-lg p-2.5 shadow-sm">
                      <span className="text-amber-900 font-bold block mb-0.5">
                        🍂 {ui.turningPointSeasonLabel}
                      </span>
                      <span className="text-stone-800">
                        {secretResult.fiveYearPreview.year1.turningPointSeason}
                      </span>
                    </div>

                    <div className="bg-white border border-emerald-300 rounded-lg p-2.5 shadow-sm">
                      <span className="text-emerald-800 font-bold block mb-0.5">
                        🌟 {ui.goldenOpportunityLabel}
                      </span>
                      <span className="text-stone-800">
                        {secretResult.fiveYearPreview.year1.goldenOpportunity}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-100/80 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-950 font-serif shadow-sm">
                    <span className="font-bold text-amber-900 block mb-0.5">
                      ⚠️ {ui.cautionAlertLabel}
                    </span>
                    {secretResult.fiveYearPreview.year1.cautionAlert}
                  </div>
                </div>

                {/* YEARS 2 TO 5: 4 LOCKED CLIFFHANGER TEASERS */}
                <div className="space-y-2 pt-1">
                  <div className="text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      {ui.lockedYearsNotice}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {secretResult.fiveYearPreview.lockedYears.map((item) => (
                      <div
                        key={item.yearNum}
                        onClick={() => {
                          const target = document.getElementById("package-select-section");
                          if (target) target.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-white border-2 border-amber-200 hover:border-amber-500 rounded-xl p-3 space-y-1.5 cursor-pointer transition hover:bg-amber-50/60 group shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-amber-100">
                          <span className="font-bold text-amber-950">
                            {ui.yearNumLabel} {item.yearNum} ({item.gregorianRange})
                          </span>
                          <span className="text-amber-600 text-sm group-hover:scale-110 transition">🔒</span>
                        </div>
                        <p className="text-xs text-stone-800 font-serif leading-relaxed">
                          {item.headlineQuestion}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-stone-600 text-[10px]">{item.keyTheme}</span>
                          <span className="text-amber-800 font-bold group-hover:underline text-[10px]">
                            {item.teaserCta} &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. 🔥 PANDIT PALETTE DINING CONVERSION OFFER (SOCIAL PROOF & 10-SEC DELIVERY) */}
            {secretResult.diningOffer && (
              <div className="bg-gradient-to-r from-amber-100/90 via-[#FFF9EC] to-amber-100/90 border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 text-center space-y-3 shadow-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] text-stone-950 text-xs font-black uppercase tracking-wider shadow">
                  <span>🍽️</span>
                  <span>{ui.dinerSpecialBadge}</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-amber-950 font-serif">
                  {secretResult.diningOffer.headline}
                </h4>
                <p className="text-xs text-stone-800 max-w-md mx-auto">
                  {secretResult.diningOffer.subheadline}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-xs text-stone-800 pt-1">
                  {secretResult.diningOffer.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5 bg-white/90 p-2 rounded-lg border border-amber-300 shadow-sm">
                      <span className="text-emerald-700 font-black">✓</span>
                      <span className="text-[11px] leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = document.getElementById("package-select-section");
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  {ui.unlockFiveYearCtaBtn}
                </button>
              </div>
            )}

            {/* ── STEP 3: PACKAGE SELECTION (₹350 Standard vs ₹450 with Sacred Remedy) ── */}
            <div id="package-select-section" className="pt-2 space-y-3 scroll-mt-6">
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black tracking-wide uppercase">
                  {ui.specialOfferBadge}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-amber-950 font-serif">
                  {ui.packageSelectTitle}
                </h4>
                <p className="text-xs text-stone-700 max-w-lg mx-auto">
                  {ui.specialOfferDesc}
                </p>
              </div>

              {/* Comparative Package Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* Package 1: Standard Vedic Destiny (₹350) */}
                <div
                  onClick={() => {
                    if (selectedPackage !== "standard_350") {
                      triggerScreenLoader("package_switch", 450);
                      setSelectedPackage("standard_350");
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPackage === "standard_350"
                      ? "bg-gradient-to-b from-amber-50 to-white border-[#D4AF37] shadow-xl shadow-amber-500/10 ring-2 ring-[#D4AF37]"
                      : "bg-white/95 border-amber-200 hover:border-amber-400 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <span className="text-xs font-bold text-amber-950">{ui.packageStandardTitle}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-stone-500 line-through">₹1,500</span>
                      <span className="text-lg font-black text-amber-800">₹350</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-700 mt-2 leading-relaxed">
                    {ui.packageStandardDesc}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-stone-800">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span>✓</span>
                      <span>5-Year Master Destiny PDF (2026–2031)</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span>✓</span>
                      <span>Baggona Panchanga Janma Kundali PDF</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-right">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedPackage === "standard_350" ? "bg-amber-400 text-stone-950" : "text-stone-500"
                    }`}>
                      {selectedPackage === "standard_350" ? "✓ Selected" : "Select"}
                    </span>
                  </div>
                </div>

                {/* Package 2: Premium Destiny + Sacred Remedy (₹450) */}
                <div
                  onClick={() => {
                    if (selectedPackage !== "remedy_450") {
                      triggerScreenLoader("package_switch", 450);
                      setSelectedPackage("remedy_450");
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    selectedPackage === "remedy_450"
                      ? "bg-gradient-to-b from-amber-100/70 via-amber-50 to-white border-amber-500 shadow-xl shadow-amber-500/15 ring-2 ring-amber-500"
                      : "bg-white/95 border-amber-200 hover:border-amber-400 shadow-sm"
                  }`}
                >
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {ui.packageRemedyBadge}
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <span className="text-xs font-bold text-amber-950">{ui.packageRemedyTitle}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-stone-500 line-through">₹2,100</span>
                      <span className="text-lg font-black text-amber-900">₹450</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-700 mt-2 leading-relaxed">
                    {ui.packageRemedyDesc}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-stone-800">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span>✓</span>
                      <span>5-Year Master Destiny PDF (2026–2031)</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span>✓</span>
                      <span>Baggona Panchanga Janma Kundali PDF</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <span>✓</span>
                      <span>Sacred Gokarna Remedy & Japa Mantra PDF (+₹100)</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-right">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedPackage === "remedy_450" ? "bg-amber-500 text-stone-950" : "text-stone-500"
                    }`}>
                      {selectedPackage === "remedy_450" ? "✓ Selected" : "Select"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Summary & CTA to Open Payment */}
              <div className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-4 text-center space-y-3 shadow-md">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-stone-700 font-medium">
                    {selectedPackage === "remedy_450" ? "5-Year PDF + Kundali + Remedy Dossier" : "5-Year PDF + Janma Kundali"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-900">₹{packagePrice}</span>
                    <span className="text-xs text-stone-500">({selectedPackage === "remedy_450" ? "INR 450 Only" : "INR 350 Only"})</span>
                  </div>
                </div>

                {!showPaymentSection && !isPaymentVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentSection(true);
                      setTimeout(() => {
                        const payEl = document.getElementById("hotel-payment-box");
                        if (payEl) payEl.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{ui.payUnlockCta} (₹{packagePrice})</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── STEP 4: STRICT PAYMENT GATE SECTION (₹350 or ₹450) ── */}
            {showPaymentSection && (
              <div
                id="hotel-payment-box"
                className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in duration-300"
              >
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>{ui.upiSectionTitle}</span>
                  </h4>
                  <span className="text-xs text-amber-900 font-mono font-bold">
                    UPI: {PRIEST_UPI_ID} (₹{packagePrice})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Dynamic QR Code for chosen package (₹350 or ₹450) */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-md border-2 border-amber-200">
                    {paymentQrDataUrl ? (
                      <img
                        src={paymentQrDataUrl}
                        alt={`Pay ₹${packagePrice} UPI QR`}
                        className="w-48 h-48 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-stone-500 text-xs">
                        Loading QR...
                      </div>
                    )}
                    <div className="text-center mt-2 text-stone-900">
                      <div className="text-xs font-bold font-serif">{PRIEST_NAME}</div>
                      <div className="text-[11px] text-stone-600 font-mono">
                        Amount: <span className="text-emerald-700 font-bold text-sm">₹{packagePrice}</span>
                        <span className="ml-1 text-[10px] text-stone-500">
                          ({selectedPackage === "remedy_450" ? "Destiny + Remedy" : "Standard"})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions & Mobile 1-Tap Buttons */}
                  <div className="space-y-3 text-xs">
                    <p className="text-stone-700 leading-relaxed">
                      {ui.paymentInstructions}
                    </p>

                    {/* Mobile 1-Tap Deep Link Buttons */}
                    <div className="space-y-2">
                      <a
                        href={getHotelPhonePeUri(packagePrice, activeOrderId)}
                        onClick={(e) => {
                          e.preventDefault();
                          setHasClickedPaymentApp(true);
                          triggerScreenLoader("payment_init", 1200, {
                            title: ui.launchingPhonePeTitle,
                            message: `${ui.launchingPhonePeMsg} (₹${packagePrice})`
                          });
                          setTimeout(() => {
                            window.location.href = getHotelPhonePeUri(packagePrice, activeOrderId);
                          }, 350);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow cursor-pointer active:scale-[0.99] transition"
                      >
                        <span>🟣</span>
                        <span>{ui.phonePeBtn} (₹{packagePrice})</span>
                      </a>
                      <a
                        href={getHotelGPayUri(packagePrice, activeOrderId)}
                        onClick={(e) => {
                          e.preventDefault();
                          setHasClickedPaymentApp(true);
                          triggerScreenLoader("payment_init", 1200, {
                            title: ui.launchingGPayTitle,
                            message: `${ui.launchingGPayMsg} (₹${packagePrice})`
                          });
                          setTimeout(() => {
                            window.location.href = getHotelGPayUri(packagePrice, activeOrderId);
                          }, 350);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow cursor-pointer active:scale-[0.99] transition"
                      >
                        <span>🔵</span>
                        <span>{ui.gpayBtn} (₹{packagePrice})</span>
                      </a>
                      <a
                        href={getHotelPaytmUri(packagePrice, activeOrderId)}
                        onClick={(e) => {
                          e.preventDefault();
                          setHasClickedPaymentApp(true);
                          triggerScreenLoader("payment_init", 1200, {
                            title: ui.launchingPaytmTitle,
                            message: `${ui.launchingPaytmMsg} (₹${packagePrice})`
                          });
                          setTimeout(() => {
                            window.location.href = getHotelPaytmUri(packagePrice, activeOrderId);
                          }, 350);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow cursor-pointer active:scale-[0.99] transition"
                      >
                        <span>💠</span>
                        <span>{ui.paytmBtn} (₹{packagePrice})</span>
                      </a>
                    </div>

                    {/* Copy UPI ID */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="font-mono text-amber-950 text-[11px] font-bold">{PRIEST_UPI_ID}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(PRIEST_UPI_ID);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-[11px] text-amber-800 hover:underline font-semibold"
                      >
                        {copiedUpi ? ui.copiedUpiBtn : ui.copyUpiBtn}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MANDATORY 12-DIGIT UTR PAYMENT VERIFICATION SECTION ── */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-[#FFFDF7] to-amber-50 border-2 border-amber-400 space-y-3 shadow-md">
                  <div className="text-amber-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5">
                    <span>🛡️</span>
                    <span>{ui.utrSectionTitle}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-700 max-w-md mx-auto text-center leading-relaxed">
                    {ui.utrLabel}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <input
                      type="text"
                      maxLength={22}
                      value={enteredUtr}
                      onChange={(e) => {
                        setEnteredUtr(e.target.value);
                        setPaymentError(null);
                      }}
                      placeholder={ui.utrPlaceholder}
                      className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 font-mono tracking-wider focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => void handleVerifyManualPayment()}
                      disabled={isVerifyingPayment || isPaymentVerified}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm tracking-wide shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isVerifyingPayment ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-stone-950" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>{ui.verifyingUtrBtn}</span>
                        </>
                      ) : isPaymentVerified ? (
                        <span>{ui.verifiedUtrBtn}</span>
                      ) : (
                        <span>{ui.verifyUtrBtn}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Payment Error */}
                {paymentError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs">
                    {paymentError}
                  </div>
                )}

                {/* Payment Success Confirmation */}
                {isPaymentVerified && (
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs space-y-1 shadow-sm">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✓</span>
                      <span>
                        ₹{packagePrice} {ui.paymentVerifiedSuccess} (Txn ID: {verifiedTxnId})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      {PDF_STAGES[selectedLang]?.s1 || PDF_STAGES.en.s1}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 5: PDF Progress ── */}
            {isGeneratingPdf && (
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs text-amber-950 font-bold">
                  <span>{pdfStageText}</span>
                  <span>{pdfProgress}%</span>
                </div>
                <div className="w-full bg-amber-100 h-2.5 rounded-full overflow-hidden border border-amber-300">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full transition-all duration-300"
                    style={{ width: `${pdfProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 6: DEVOTEE MULTI-PDF DOWNLOAD CENTER (Single-use download per file) ── */}
            {isPaymentVerified && (
              <div
                id="hotel-download-center"
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#FFFDF7] to-emerald-50 border-2 border-emerald-500 space-y-4 text-center shadow-xl animate-in fade-in"
              >
                <div className="space-y-1">
                  <div className="text-emerald-900 text-sm sm:text-base font-bold flex items-center justify-center gap-2">
                    <span>{ui.pdfReadyHeader}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 max-w-md mx-auto">
                    {ui.singleUseNotice}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
                  {/* Button 1: 5-Year Master Destiny PDF */}
                  <button
                    type="button"
                    onClick={() => void handleDownload5YearPdf()}
                    disabled={isGeneratingPdf || Boolean(downloadedPdfs.fiveYear) || Boolean(downloadedPdfs.all)}
                    className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition ${
                      downloadedPdfs.fiveYear || downloadedPdfs.all
                        ? "bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed opacity-80"
                        : "bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-[0.99] cursor-pointer"
                    }`}
                  >
                    <span>
                      {downloadedPdfs.fiveYear || downloadedPdfs.all
                        ? ui.downloadedBtn
                        : ui.downloadFiveYearPdfBtn}
                    </span>
                  </button>

                  {/* Button 2: Baggona Panchanga Janma Kundali PDF */}
                  <button
                    type="button"
                    onClick={() => void handleDownloadKundliPdf()}
                    disabled={isGeneratingPdf || Boolean(downloadedPdfs.kundli) || Boolean(downloadedPdfs.all)}
                    className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition ${
                      downloadedPdfs.kundli || downloadedPdfs.all
                        ? "bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed opacity-80"
                        : "bg-yellow-500 hover:bg-yellow-400 text-stone-950 active:scale-[0.99] cursor-pointer"
                    }`}
                  >
                    <span>
                      {downloadedPdfs.kundli || downloadedPdfs.all
                        ? ui.downloadedBtn
                        : ui.downloadKundliPdfBtn}
                    </span>
                  </button>

                  {/* Button 3: Sacred Gokarna Remedy PDF (Only if ₹450 package chosen) */}
                  {selectedPackage === "remedy_450" && (
                    <button
                      type="button"
                      onClick={() => void handleDownloadRemedyPdf()}
                      disabled={isGeneratingPdf || Boolean(downloadedPdfs.remedy) || Boolean(downloadedPdfs.all)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition sm:col-span-2 ${
                        downloadedPdfs.remedy || downloadedPdfs.all
                          ? "bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed opacity-80"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white active:scale-[0.99] cursor-pointer"
                      }`}
                    >
                      <span>
                        {downloadedPdfs.remedy || downloadedPdfs.all
                          ? ui.downloadedBtn
                          : ui.downloadRemedyPdfBtn}
                      </span>
                    </button>
                  )}

                  {/* Button 4: Download Complete All-in-One Package */}
                  {(() => {
                    const isAllDone =
                      Boolean(downloadedPdfs.all) ||
                      (Boolean(downloadedPdfs.fiveYear) &&
                        Boolean(downloadedPdfs.kundli) &&
                        (selectedPackage !== "remedy_450" || Boolean(downloadedPdfs.remedy)));
                    return (
                      <button
                        type="button"
                        onClick={() => void handleDownloadAllPdfs()}
                        disabled={isGeneratingPdf || isAllDone}
                        className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md sm:col-span-2 transition ${
                          isAllDone
                            ? "bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed opacity-80"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-400 cursor-pointer"
                        }`}
                      >
                        <span>{isAllDone ? ui.downloadAllCompletedBtn : ui.downloadAllPdfsBtn}</span>
                      </button>
                    );
                  })()}
                </div>

                {/* iPhone Safari Tip */}
                <p className="text-[11px] text-stone-600 max-w-md mx-auto leading-relaxed">
                  {ui.iphoneSafariTip}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── HIDDEN OFFSCREEN PDF TEMPLATE RENDER CONTAINERS ──                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: "0px",
          width: "900px",
          zIndex: -1,
          opacity: 0.01,
          pointerEvents: "none"
        }}
      >
        {/* 1. 5-Year Master Destiny PDF Template */}
        <div ref={fiveYearPdfRef}>
          <FiveYearPredictionPdfTemplate data={fiveYearPayload} />
        </div>

        {/* 2. Baggona Panchanga Janma Kundali Multi-Page PDF Template */}
        <div ref={kundliPdfRef} id="hotel-kundli-pdf-render">
          {publicKundliProfile && computedKundli && (
            <PublicKundliPdfDocument
              profile={publicKundliProfile}
              kundli={computedKundli}
              insights={publicKundliInsights}
              lang={publicKundliLang}
              placeLabel={selectedCityName}
            />
          )}
        </div>

        {/* 3. Sacred Gokarna Daivika Parihara & Remedy PDF Template */}
        <div ref={remedyPdfRef} id="hotel-remedy-pdf-render">
          {remedyDiagnosis && (
            <div style={{ width: "900px", background: "#FFFDF7" }}>
              <KundliRemedyPdfTemplate
                diagnosis={remedyDiagnosis}
                lang={remedyLang}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center border-t border-amber-200 mt-12 text-xs text-stone-500 space-y-1">
        <p className="font-serif text-stone-600">
          {ui.footerSanctum}
        </p>
        <p className="text-[11px] text-stone-500">
          {ui.footerContact}
        </p>
      </footer>

      {/* Full-Screen Astrological Screen Loader for Screen 2 */}
      <AntarangaAstrologicalScreenLoader
        isOpen={screenLoaderOpen}
        stage={screenLoaderStage}
        lang={selectedLang}
        customTitle={screenLoaderTitle}
        customMessage={screenLoaderMessage}
        devoteeName={devoteeName}
        progressPercent={screenLoaderProgress}
      />
    </div>
  );
}
