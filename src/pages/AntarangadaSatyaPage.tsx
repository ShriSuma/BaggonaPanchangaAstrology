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
  PRIEST_UPI_ID,
  PRIEST_NAME,
  PRIEST_PHONE,
  DEFAULT_HOTEL_FULL_NAME,
  type AntarangaLang,
  type AntarangaSecretResult,
  ANTARANGA_LANGUAGES
} from "../features/hotelSecret/antarangaService";
import { compute5YearMasterPrediction, type FiveYearPredictionPayload } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { captureFiveYearPredictionPdf } from "../features/fiveYearPrediction/fiveYearPredictionService";
import { FiveYearPredictionPdfTemplate } from "../components/fiveYearPrediction/FiveYearPredictionPdfTemplate";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";

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
const ANTARANGA_UI_STRINGS: Record<
  AntarangaLang,
  {
    topMantra: string;
    defaultSanctuaryTitle: string;
    tableLabel: string;
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
    offerPriceText: string;
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
    downloadIPhoneBtn: string;
    viewPdfBtn: string;
    iphoneSafariTip: string;
    footerSanctum: string;
    footerContact: string;
    nameRequiredError: string;
    cityNotFoundError: string;
    calcError: string;
  }
> = {
  kn: {
    topMantra: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
    defaultSanctuaryTitle: "Pandit Palette (ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್)",
    tableLabel: "ಟೇಬಲ್",
    freeBannerBadge: "✨ ಊಟ ಮಾಡುವ ಮುನ್ನ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಸತ್ಯ ತಿಳಿಯಿರಿ • ೧೦೦% ಉಚಿತ",
    heroTitle: "ಅಂತರಂಗದ ಸತ್ಯ (Dark Secret)",
    heroSubtitle: "ನೀವು ಯಾರಿಗೂ ಹೇಳದೆ ಮನಸ್ಸಿನಲ್ಲಿ ಹುದುಗಿಸಿಟ್ಟುಕೊಂಡಿರುವ ಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ತುಮುಲವೇನು? ನಿಮ್ಮ ಜನ್ಮ ವಿವರ ನೀಡಿ ೧-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ತಿಳಿಯಿರಿ!",
    formHeader: "ನಿಮ್ಮ ಜನ್ಮ ವಿವರಗಳು (Birth Details)",
    freeTag: "೧೦೦% ಉಚಿತ (100% Free)",
    nameLabel: "ನಿಮ್ಮ ಹೆಸರು (Your Full Name) *",
    namePlaceholder: "ಉದಾಹರಣೆ: ಪ್ರಮೋದ್ ಹೆಗಡೆ / Pramod",
    dateLabel: "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Birth Date) *",
    timeLabel: "ಹುಟ್ಟಿದ ಸಮಯ (Birth Time) *",
    genderLabel: "ಲಿಂಗ (Gender)",
    maleLabel: "ಪುರುಷ (Male)",
    femaleLabel: "ಸ್ತ್ರೀ (Female)",
    placeLabel: "ಹುಟ್ಟಿದ ಊರು (Birth Place)",
    customSearchPlaceholder: "ಇತರೆ ಊರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ಹುಡುಕಿ (Search city)...",
    searchButton: "ಹುಡುಕಿ",
    searchingButton: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    revealSecretCta: "🔮 ನನ್ನ ಅಂತರಂಗದ ಸತ್ಯ ತಿಳಿಯಿರಿ (Reveal Dark Secret) • ೧೦೦% ಉಚಿತ",
    calculatingCta: "ಅಂತರಂಗದ ಜಾತಕ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    resultHeading: "ಅವರ ಮನಸ್ಸಿನ ಗುಪ್ತ ರಹಸ್ಯ",
    resultBadge: "॥ ಅಂತರಂಗದ ಸತ್ಯ · ನಿಗೂಢ ಜಾತಕ ರಹಸ್ಯ ॥",
    authenticTruthBadge: "✓ ೧೦೦% ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಸತ್ಯ",
    moonSignLabel: "ಜನ್ಮ ರಾಶಿ (Moon Sign)",
    starLabel: "ಜನ್ಮ ನಕ್ಷತ್ರ (Star)",
    lagnaLabel: "ಜನ್ಮ ಲಗ್ನ (Ascendant)",
    h8LordLabel: "ರಹಸ್ಯ ಭಾವಾಧಿಪತಿ (8th Lord)",
    paragraph1Title: "🎭 ೧. ಬಾಹ್ಯ ಮುಖವಾಡ & ಯಾರಿಗೂ ಹೇಳದ ಒಳಮನಸ್ಸಿನ ತುಮುಲ",
    paragraph2Title: "🌙 ೨. ಏಕಾಂತದ ಮೌನ ವೇದನೆ & ಯಾರಿಗೂ ತಿಳಿಯದ ರಹಸ್ಯ",
    specialOfferBadge: "ವಿಶೇಷ ಹೋಟೆಲ್ ಕೊಡುಗೆ (Special Devotee Offer)",
    specialOfferTitle: "ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಮುಂಬರುವ ೫ ವರ್ಷಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಜಾತಕ (೨೦೨೬-೨೦೩೧)",
    specialOfferDesc: "ಮೇಲಿನ ಅಂತರಂಗದ ಸತ್ಯವು ಕೇವಲ ಸಣ್ಣ ನಿದರ್ಶನ ಮಾತ್ರ! ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಸ್ತುತ ಏನು ನಡೆಯುತ್ತಿದೆ? ಮುಂಬರುವ ೫ ವರ್ಷಗಳಲ್ಲಿ (೨೦೨೬-೨೦೩೧) ನಿಮ್ಮ ವೃತ್ತಿ, ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಕುಟುಂಬ ಹಾಗೂ ಆರೋಗ್ಯ ಹೇಗಿರಲಿದೆ? ಸಂಪೂರ್ಣ ಪ್ರೀಮಿಯಂ ರಾಜಯೋಗ ಜಾತಕ PDF ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್/iPhone ನಲ್ಲಿ ಪಡೆಯಿರಿ.",
    featurePoints: [
      "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ & ಗೋಚಾರ ಗ್ರಹಗಳ ನೈಜ ವಿಶ್ಲೇಷಣೆ",
      "ಮುಂಬರುವ ೫ ವರ್ಷಗಳ (೧ ರಿಂದ ೫) ವಾರ್ಷಿಕ ಭವಿಷ್ಯ",
      "ವೃತ್ತಿ, ಬಡ್ತಿ, ವ್ಯಾಪಾರ & ಆರ್ಥಿಕ ಸಂಪತ್ತಿನ ಮುನ್ನೋಟ",
      "ಕುಟುಂಬ ಸೌಖ್ಯ, ವಿವಾಹ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ",
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ಸಿದ್ಧ ಪರಿಹಾರಗಳು, ಸ್ತೋತ್ರಗಳು & ಆಶೀರ್ವಾದ"
    ],
    regularPriceLabel: "ಸಾಮಾನ್ಯ ಶುಲ್ಕ: ₹1,500",
    offerPriceText: "ಕೇವಲ ₹೩೫೦ (INR 350 Only)",
    payUnlockCta: "💳 ₹೩೫೦ ಪಾವತಿಸಿ ಸಂಪೂರ್ಣ ೫-ವರ್ಷಗಳ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    upiSectionTitle: "📱 ₹೩೫೦ UPI ಪಾವತಿ & PDF ಅನ್‌ಲಾಕ್",
    paymentInstructions: "ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಪಾವತಿಸಲು PhonePe / GPay / Paytm ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ ಮೇಲಿನ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    phonePeBtn: "PhonePe ಮೂಲಕ ₹೩೫೦ ಪಾವತಿಸಿ",
    gpayBtn: "Google Pay ಮೂಲಕ ₹೩೫೦ ಪಾವತಿಸಿ",
    paytmBtn: "Paytm / ಇತರೆ UPI ಮೂಲಕ ಪಾವತಿಸಿ",
    copyUpiBtn: "ಕಾಪಿ ಮಾಡಿ",
    copiedUpiBtn: "✓ ಕಾಪಿ ಆಯಿತು",
    instantUnlockTitle: "⚡ PhonePe ನಲ್ಲಿ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆಯೇ?",
    instantUnlockDesc: "೧೨-ಅಂಕಿಯ ನಂಬರ್ ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ! ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ತಕ್ಷಣ ನಿಮ್ಮ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    instantUnlockBtn: "✓ ಪಾವತಿಸಿದ್ದೇನೆ • ತಕ್ಷಣ ೫-ವರ್ಷಗಳ PDF ಪಡೆಯಿರಿ (1-Tap Auto Unlock)",
    manualUtrToggleText: "ಅಥವಾ ೧೨-ಅಂಕಿಯ UTR ಸಂಖ್ಯೆ ನಮೂದಿಸಬೇಕೆ? (Manual UTR Entry)",
    utrLabel: "ಪಾವತಿ ಮಾಡಿದ ನಂತರ PhonePe / GPay ರಶೀದಿಯಲ್ಲಿರುವ ೧೨-ಅಂಕಿಯ UTR / Reference ನಂಬರ್ ಇಲ್ಲಿ ನಮೂದಿಸಿ:",
    utrPlaceholder: "ಉದಾಹರಣೆ: 432109876543 (12 Digits)",
    verifyUtrBtn: "ಖಚಿತಪಡಿಸಿ & PDF ಪಡೆಯಿರಿ",
    verifyingUtrBtn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    verifiedUtrBtn: "✓ ಪಾವತಿ ಖಚಿತವಾಗಿದೆ",
    pdfReadyHeader: "🎉 ನಿಮ್ಮ ೫-ವರ್ಷಗಳ ಮಹಾ ಜಾತಕ PDF ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧವಾಗಿದೆ!",
    downloadIPhoneBtn: "📥 iPhone / ಮೊಬೈಲ್‌ನಲ್ಲಿ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Save to Files)",
    viewPdfBtn: "👁️ PDF ವೀಕ್ಷಿಸಿ (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari ಬಳಕೆದಾರರು: ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿದಾಗ PDF ಓಪನ್ ಆಗುತ್ತದೆ, ಕೆಳಗಿನ Share ಐಕಾನ್ ಒತ್ತಿ \"Save to Files\" ಅಥವಾ \"Books\" ಗೆ ಸೇವ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.",
    footerSanctum: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    footerContact: `ಸಹಾಯ ಅಥವಾ ಪೂಜಾ ಸಂಕಲ್ಪಕ್ಕಾಗಿ ಸಂಪರ್ಕಿಸಿ: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    cityNotFoundError: "ಊರು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಮೀಪದ ಜಿಲ್ಲೆ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.",
    calcError: "ಜಾತಕ ಗಣನೆಯಲ್ಲಿ ದೋಷವಾಗಿದೆ. ದಯವಿಟ್ಟು ದಿನಾಂಕ ಹಾಗೂ ಸಮಯವನ್ನು ಪರಿಶೀಲಿಸಿ."
  },
  en: {
    topMantra: "॥ Sri Kshetra Gokarna Mahabaleshwara Prasanna ॥",
    defaultSanctuaryTitle: "Pandit Palette",
    tableLabel: "Table",
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
    offerPriceText: "Only ₹350 (INR 350 Only)",
    payUnlockCta: "💳 Pay ₹350 & Unlock 5-Year Master Destiny PDF",
    upiSectionTitle: "📱 ₹350 Instant UPI Payment & PDF Unlock",
    paymentInstructions: "Tap PhonePe / GPay / Paytm below to pay directly on your mobile, or scan the QR code.",
    phonePeBtn: "Pay ₹350 via PhonePe",
    gpayBtn: "Pay ₹350 via Google Pay",
    paytmBtn: "Pay ₹350 via Paytm / UPI",
    copyUpiBtn: "Copy UPI ID",
    copiedUpiBtn: "✓ Copied",
    instantUnlockTitle: "⚡ Completed payment on PhonePe / GPay?",
    instantUnlockDesc: "No need to copy or type 12-digit UTR numbers! Tap below to instantly unlock & download your PDF.",
    instantUnlockBtn: "✓ I Have Paid • Download 5-Year PDF (1-Tap Instant Unlock)",
    manualUtrToggleText: "Or enter 12-digit UPI reference number manually (Optional)",
    utrLabel: "After payment, enter the 12-digit UTR / UPI Reference Number from your PhonePe / GPay receipt:",
    utrPlaceholder: "e.g., 432109876543 (12 Digits)",
    verifyUtrBtn: "Verify & Unlock PDF",
    verifyingUtrBtn: "Verifying...",
    verifiedUtrBtn: "✓ Payment Verified",
    pdfReadyHeader: "🎉 Your 5-Year Master Horoscope PDF is Ready for Download!",
    downloadIPhoneBtn: "📥 Download PDF to iPhone / Mobile (Save to Files)",
    viewPdfBtn: "👁️ View PDF (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari Users: Tap above to download. You can also view in a new tab, tap the Safari Share icon, and select 'Save to Files' or 'Books'.",
    footerSanctum: "॥ Sri Kshetra Gokarna Mahabaleshwara Sanctum · Baggona Panchanga Astrology ॥",
    footerContact: `For Seva Assistance or Sankalpa, Contact: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "Please enter your full name.",
    cityNotFoundError: "Location not found. Please enter a nearby town or pincode.",
    calcError: "Calculation error occurred. Please verify your birth date and time."
  },
  hi: {
    topMantra: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
    defaultSanctuaryTitle: "पंडित पैलेट (Pandit Palette)",
    tableLabel: "टेबल",
    freeBannerBadge: "✨ भोजन से पूर्व अपने अंतर्मन का सत्य जानें • 100% निःशुल्क",
    heroTitle: "अंतरंग का सत्य (Dark Secret)",
    heroSubtitle: "वह कौन सा गुप्त रहस्य और आंतरिक द्वंद्व है जो आपने कभी किसी से साझा नहीं किया? जन्म विवरण देकर 1-क्लिक में जानें!",
    formHeader: "आपके जन्म का विवरण (Birth Details)",
    freeTag: "100% निःशुल्क (Free)",
    nameLabel: "आपका पूरा नाम (Your Full Name) *",
    namePlaceholder: "उदा: राहुल शर्मा / Rahul Sharma",
    dateLabel: "जन्म तिथि (Birth Date) *",
    timeLabel: "जन्म समय (Birth Time) *",
    genderLabel: "लिंग (Gender)",
    maleLabel: "पुरुष (Male)",
    femaleLabel: "महिला (Female)",
    placeLabel: "जन्म स्थान (Birth Place)",
    customSearchPlaceholder: "अन्य शहर या पिनकोड खोजें (Search city)...",
    searchButton: "खोजें",
    searchingButton: "खोजा जा रहा है...",
    revealSecretCta: "🔮 मेरे अंतर्मन का सत्य बताएं (Reveal Dark Secret) • 100% निःशुल्क",
    calculatingCta: "जन्मकुंडली का गूढ़ विश्लेषण हो रहा है...",
    resultHeading: "के अंतर्मन का गुप्त रहस्य",
    resultBadge: "॥ अंतरंग का सत्य · गूढ़ जन्मकुंडली रहस्य ॥",
    authenticTruthBadge: "✓ 100% सटीक वैदिक ज्योतिष सत्य",
    moonSignLabel: "चन्द्र राशि (Moon Sign)",
    starLabel: "जन्म नक्षत्र (Star)",
    lagnaLabel: "जन्म लग्न (Ascendant)",
    h8LordLabel: "अष्टमेश (गुप्त भाव)",
    paragraph1Title: "🎭 1. बाह्य मुखौटा और अंतर्मन का अनकहा द्वंद्व",
    paragraph2Title: "🌙 2. एकांत की मौन वेदना और अनकहा गुप्त रहस्य",
    specialOfferBadge: "होटल अतिथि विशेष विशेषाधिकार (Special Offer)",
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
    offerPriceText: "केवल ₹350 (INR 350 Only)",
    payUnlockCta: "💳 ₹350 भुगतान कर संपूर्ण 5-वर्षीय PDF डाउनलोड करें",
    upiSectionTitle: "📱 ₹350 UPI भुगतान एवं PDF अनलॉक",
    paymentInstructions: "PhonePe / GPay / Paytm बटन पर टैप करें या ऊपर दिए QR कोड को स्कैन करें।",
    phonePeBtn: "PhonePe द्वारा ₹350 का भुगतान करें",
    gpayBtn: "Google Pay द्वारा ₹350 का भुगतान करें",
    paytmBtn: "Paytm / अन्य UPI से भुगतान करें",
    copyUpiBtn: "कॉपी करें",
    copiedUpiBtn: "✓ कॉपी हो गया",
    instantUnlockTitle: "⚡ PhonePe पर भुगतान पूर्ण हो गया?",
    instantUnlockDesc: "12-अंकीय UTR नंबर टाइप करने की आवश्यकता नहीं! नीचे क्लिक कर तुरंत PDF डाउनलोड करें।",
    instantUnlockBtn: "✓ भुगतान हो गया • 5-वर्षीय PDF डाउनलोड करें (1-Tap Auto Unlock)",
    manualUtrToggleText: "अथवा 12-अंकीय UTR संदर्भ संख्या स्वयं दर्ज करें (वैकल्पिक)",
    utrLabel: "भुगतान के उपरांत PhonePe / GPay रसीद से 12-अंकीय UTR / UPI संदर्भ संख्या यहां दर्ज करें:",
    utrPlaceholder: "उदा: 432109876543 (12 Digits)",
    verifyUtrBtn: "सत्यापित करें व PDF प्राप्त करें",
    verifyingUtrBtn: "सत्यापित हो रहा है...",
    verifiedUtrBtn: "✓ भुगतान सत्यापित",
    pdfReadyHeader: "🎉 आपकी 5-वर्षीय महा कुंडली PDF डाउनलोड हेतु तैयार है!",
    downloadIPhoneBtn: "📥 iPhone / मोबाइल में PDF डाउनलोड करें (Save to Files)",
    viewPdfBtn: "👁️ PDF देखें (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari उपयोगकर्ता: ऊपर क्लिक करने पर PDF खुलेगी। नीचे शेयर आइकन पर टैप कर 'Save to Files' या 'Books' में सुरक्षित कर सकते हैं।",
    footerSanctum: "॥ श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    footerContact: `सहायता अथवा पूजा संकल्प हेतु संपर्क करें: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "कृपया अपना पूरा नाम दर्ज करें।",
    cityNotFoundError: "स्थान नहीं मिला। कृपया निकटतम शहर या पिनकोड दर्ज करें।",
    calcError: "कुंडली गणना में त्रुटि। कृपया जन्म तिथि और समय की जांच करें।"
  },
  te: {
    topMantra: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
    defaultSanctuaryTitle: "పండిట్ ప్యాలెట్ (Pandit Palette)",
    tableLabel: "టేబుల్",
    freeBannerBadge: "✨ భోజనానికి ముందు మీ మనస్సులోని అంతరంగ సత్యం తెలుసుకోండి • 100% ఉచితం",
    heroTitle: "అంతరంగ సత్యం (Dark Secret)",
    heroSubtitle: "ఎవరికీ చెప్పకుండా మీ మనస్సులోనే దాచుకున్న రహస్య ఆవేదన ఏమిటి? మీ జన్మ వివరాలు నమోదు చేసి 1-క్లిక్‌లో తెలుసుకోండి!",
    formHeader: "మీ జన్మ వివరాలు (Birth Details)",
    freeTag: "100% ఉచితం (Free)",
    nameLabel: "మీ పూర్తి పేరు (Your Full Name) *",
    namePlaceholder: "ఉదా: రమేష్ వర్మ / Ramesh",
    dateLabel: "పుట్టిన తేదీ (Birth Date) *",
    timeLabel: "పుట్టిన సమయం (Birth Time) *",
    genderLabel: "లింగం (Gender)",
    maleLabel: "పురుషుడు (Male)",
    femaleLabel: "స్త్రీ (Female)",
    placeLabel: "పుట్టిన ఊరు (Birth Place)",
    customSearchPlaceholder: "ఇతర ఊరు లేదా పిన్‌కోడ్ శోధించండి (Search city)...",
    searchButton: "వెతకండి",
    searchingButton: "వెతుకుతోంది...",
    revealSecretCta: "🔮 నా అంతరంగ సత్యం తెలుసుకోండి (Reveal Dark Secret) • 100% ఉచితం",
    calculatingCta: "జాతక అంతరంగ విశ్లేషణ జరుగుతోంది...",
    resultHeading: "మనస్సులోని అంతరంగ రహస్యం",
    resultBadge: "॥ అంతరంగ సత్యం · రహస్య జాతక విశ్లేషణ ॥",
    authenticTruthBadge: "✓ 100% ఖచ్చితమైన జ్యోతిష్య సత్యం",
    moonSignLabel: "చంద్ర రాశి (Moon Sign)",
    starLabel: "జన్మ నక్షత్రం (Star)",
    lagnaLabel: "జన్మ లగ్నం (Ascendant)",
    h8LordLabel: "8వ అధిపతి (రహస్య భావం)",
    paragraph1Title: "🎭 1. బాహ్య ముసుగు & ఎవరికీ చెప్పని అంతర్గత ఆవేదన",
    paragraph2Title: "🌙 2. ఏకాంతపు మూగ బాధ & ఎవరికీ తెలియని రహస్యం",
    specialOfferBadge: "హోటల్ అతిథి ప్రత్యేక అవకాశం (Special Offer)",
    specialOfferTitle: "ప్రస్తుత జీవిత స్థితి & రాబోయే 5 సంవత్సరాల సంపూర్ణ మహా జాతకం (2026-2031)",
    specialOfferDesc: "పైన తెలిపిన అంతరంగ సత్యం కేవలం ఒక చిన్న నిదర్శనం మాత్రమే! ప్రస్తుతం మీ జీవితంలో ఏం జరుగుతోంది? రాబోయే 5 ఏళ్ళలో (2026-2031) మీ వృత్తి, ఆర్థిక స్థితి, కుటుంబం మరియు ఆరోగ్యం ఎలా ఉండబోతున్నాయి? సంపూర్ణ ప్రీమియం జాతక PDF ని మీ మొబైల్/iPhone లో పొందండి.",
    featurePoints: [
      "ప్రస్తుత మహర్దశ మరియు గోచార గ్రహాల ఖచ్చితమైన విశ్లేషణ",
      "రాబోయే 5 సంవత్సరాల వార్షిక భవిష్యత్ ఫలాలు (1 నుండి 5)",
      "ఉద్యోగం, పదోన్నతి, వ్యాపారం & ధనలాభ సూచనలు",
      "కుటుంబ సౌఖ్యం, వివాహ యోగం & ఆరోగ్య రక్షా కవచం",
      "శ్రీ క్షేత్ర గోకర్ణ సన్నిధాన సిద్ధ పరిహారాలు, స్తోత్రాలు & ఆశీస్సులు"
    ],
    regularPriceLabel: "సాధారణ రుసుము: ₹1,500",
    offerPriceText: "కేవలం ₹350 (INR 350 Only)",
    payUnlockCta: "💳 ₹350 చెల్లించి సంపూర్ణ 5-ఏళ్ళ PDF డౌన్‌లోడ్ చేసుకోండి",
    upiSectionTitle: "📱 ₹350 UPI చెల్లింపు & PDF అన్‌లాక్",
    paymentInstructions: "PhonePe / GPay / Paytm బటన్ నొక్కండి లేదా పై QR కోడ్‌ను స్కాన్ చేయండి.",
    phonePeBtn: "PhonePe ద్వారా ₹350 చెల్లించండి",
    gpayBtn: "Google Pay ద్వారా ₹350 చెల్లించండి",
    paytmBtn: "Paytm / ఇతర UPI ద్వారా చెల్లించండి",
    copyUpiBtn: "కాపీ చేయండి",
    copiedUpiBtn: "✓ కాపీ అయింది",
    instantUnlockTitle: "⚡ PhonePe లో చెల్లింపు పూర్తయిందా?",
    instantUnlockDesc: "12-అంకెల సంఖ్యను టైప్ చేయాల్సిన అవసరం లేదు! క్రింద క్లిక్ చేసి వెంటనే PDF డౌన్‌లోడ్ చేసుకోండి.",
    instantUnlockBtn: "✓ చెల్లించాను • వెంటనే 5-ఏళ్ళ PDF పొందండి (1-Tap Auto Unlock)",
    manualUtrToggleText: "లేదా 12-అంకెల UTR నంబరును నమోదు చేయండి (ఐచ్ఛికం)",
    utrLabel: "చెల్లింపు పూర్తయిన తర్వాత PhonePe / GPay రశీదులోని 12-అంకెల UTR నంబరును ఇక్కడ నమోదు చేయండి:",
    utrPlaceholder: "ఉదా: 432109876543 (12 Digits)",
    verifyUtrBtn: "ధృవీకరించి PDF పొందండి",
    verifyingUtrBtn: "ధృవీకరిస్తోంది...",
    verifiedUtrBtn: "✓ చెల్లింపు ధృవీకరించబడింది",
    pdfReadyHeader: "🎉 మీ 5 సంవత్సరాల మహా జాతక PDF సిద్ధమైంది!",
    downloadIPhoneBtn: "📥 iPhone / మొబైల్‌లో PDF డౌన్‌లోడ్ చేసుకోండి (Save to Files)",
    viewPdfBtn: "👁️ PDF వీక్షించండి (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari వినియోగదారులు: పైన క్లిక్ చేస్తే PDF ఓపెన్ అవుతుంది. క్రింది Share ఐకాన్ నొక్కి 'Save to Files' లేదా 'Books' లో సేవ్ చేసుకోవచ్చు.",
    footerSanctum: "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    footerContact: `సహాయం లేదా పూజా సంకల్పం కొరకు సంప్రదించండి: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.",
    cityNotFoundError: "స్థలం కనుగొనబడలేదు. దయచేసి సమీప పట్టణం లేదా పిన్‌కోడ్ నమోదు చేయండి.",
    calcError: "జాతక గణనలో లోపం ఏర్పడింది. దయచేసి పుట్టిన తేదీ మరియు సమయాన్ని తనిఖీ చేయండి."
  },
  ta: {
    topMantra: "॥ ஸ்ரீ கோகர்ணம் மகாபலேஸ்வர சுவாமி பிரசன்னம் ॥",
    defaultSanctuaryTitle: "பண்டிட் பேலட் (Pandit Palette)",
    tableLabel: "மேஜை",
    freeBannerBadge: "✨ உணவருந்தும் முன் உங்கள் ஆழ்மனதின் ரகசியத்தை அறியுங்கள் • 100% இலவசம்",
    heroTitle: "ஆழ்மன ரகசியம் (Dark Secret)",
    heroSubtitle: "யாருக்கும் சொல்லாமல் உங்கள் மனதிற்குள்ளேயே புதைத்து வைத்துள்ள ரகசியம் என்ன? உங்கள் பிறந்த விவரங்களை அளித்து ஒரே கிளிக்கில் அறியுங்கள்!",
    formHeader: "உங்கள் பிறந்த விவரங்கள் (Birth Details)",
    freeTag: "100% இலவசம் (Free)",
    nameLabel: "உங்கள் முழுப் பெயர் (Your Full Name) *",
    namePlaceholder: "உதா: சுரேஷ் பாலாஜி / Suresh",
    dateLabel: "பிறந்த தேதி (Birth Date) *",
    timeLabel: "பிறந்த நேரம் (Birth Time) *",
    genderLabel: "பாலினம் (Gender)",
    maleLabel: "ஆண் (Male)",
    femaleLabel: "பெண் (Female)",
    placeLabel: "பிறந்த ஊர் (Birth Place)",
    customSearchPlaceholder: "மற்ற ஊர் அல்லது பின்கோட் தேடவும் (Search city)...",
    searchButton: "தேடுக",
    searchingButton: "தேடப்படுகிறது...",
    revealSecretCta: "🔮 என் ஆழ்மன ரகசியத்தை அறிக (Reveal Dark Secret) • 100% இலவசம்",
    calculatingCta: "ஆழ்மன ஜாதக பகுப்பாய்வு நடக்கிறது...",
    resultHeading: "அவர்களின் ஆழ்மன ரகசியம்",
    resultBadge: "॥ ஆழ்மன ரகசியம் · மறைமுக ஜாதக அமைப்பு ॥",
    authenticTruthBadge: "✓ 100% துல்லியமான ஜோதிட உண்மை",
    moonSignLabel: "சந்திர ராசி (Moon Sign)",
    starLabel: "ஜென்ம நட்சத்திரம் (Star)",
    lagnaLabel: "ஜென்ம லக்னம் (Ascendant)",
    h8LordLabel: "8-ம் அதிபதி (மறைவு ஸ்தானம்)",
    paragraph1Title: "🎭 1. வெளிவேஷம் & யாருக்கும் சொல்லாத உள்மன கொந்தளிப்பு",
    paragraph2Title: "🌙 2. தனிமையின் மௌன வேதனை & மறைக்கப்பட்ட ரகசியம்",
    specialOfferBadge: "ஹோட்டல் விருந்தினர் சிறப்பு சலுகை (Special Offer)",
    specialOfferTitle: "தற்போதைய வாழ்க்கை நிலை & அடுத்த 5 ஆண்டுகளுக்கான முழுமையான மகா ஜாதகம் (2026-2031)",
    specialOfferDesc: "மேலே உள்ள ஆழ்மன ரகசியம் ஒரு சிறிய மாதிரி மட்டுமே! தற்போது உங்கள் வாழ்வில் என்ன நடக்கிறது? அடுத்த 5 ஆண்டுகளில் (2026-2031) தொழில், செல்வம், குடும்பம் மற்றும் ஆரோக்கியம் எவ்வாறு இருக்கும்? முழுமையான பிரீமியம் ஜாதக PDF-ஐ உங்கள் iPhone/மொபைலில் பெறுங்கள்.",
    featurePoints: [
      "தற்போதைய திசா-புத்தி மற்றும் கோச்சார கிரகங்களின் துல்லிய கணிப்பு",
      "அடுத்த 5 ஆண்டுகளுக்கான வருடவாரியான பலன்கள் (ஆண்டு 1 முதல் 5)",
      "தொழில் வளர்ச்சி, பதவி உயர்வு, வியாபாரம் மற்றும் தனலாப பலன்கள்",
      "குடும்ப அமைதி, திருமண யோகம் மற்றும் ஆரோக்கிய கவசம்",
      "ஸ்ரீ கோகர்ணம் சன்னிதான பரிகாரங்கள், வேத ஸ்தோத்திரங்கள் மற்றும் ஆசி"
    ],
    regularPriceLabel: "வழக்கமான கட்டணம்: ₹1,500",
    offerPriceText: "வெறும் ₹350 (INR 350 Only)",
    payUnlockCta: "💳 ₹350 செலுத்தி 5 ஆண்டு முழுமையான PDF-ஐ பதிவிறக்கவும்",
    upiSectionTitle: "📱 ₹350 UPI கட்டணம் & PDF திறப்பு",
    paymentInstructions: "PhonePe / GPay / Paytm பட்டனை அழுத்தவும் அல்லது மேலே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    phonePeBtn: "PhonePe மூலம் ₹350 செலுத்தவும்",
    gpayBtn: "Google Pay மூலம் ₹350 செலுத்தவும்",
    paytmBtn: "Paytm / பிற UPI மூலம் செலுத்தவும்",
    copyUpiBtn: "நகலெடுக்க",
    copiedUpiBtn: "✓ நகலெடுக்கப்பட்டது",
    instantUnlockTitle: "⚡ PhonePe இல் கட்டணம் செலுத்தப்பட்டதா?",
    instantUnlockDesc: "12-இலக்க UTR எண்ணை தட்டச்சு செய்ய தேவையில்லை! உடனே PDF பதிவிறக்க கீழே கிளிக் செய்யவும்.",
    instantUnlockBtn: "✓ செலுத்திவிட்டேன் • உடனே 5 ஆண்டு PDF பெறுக (1-Tap Auto Unlock)",
    manualUtrToggleText: "அல்லது 12-இலக்க UTR எண்ணை உள்ளிடவும் (விருப்பத்தேர்வு)",
    utrLabel: "பணம் செலுத்திய பின் PhonePe / GPay ரசீதில் உள்ள 12-இலக்க UTR எண்ணை இங்கே உள்ளிடவும்:",
    utrPlaceholder: "உதா: 432109876543 (12 Digits)",
    verifyUtrBtn: "சரிபார்த்து PDF-ஐ பெறுக",
    verifyingUtrBtn: "சரிபார்க்கப்படுகிறது...",
    verifiedUtrBtn: "✓ கட்டணம் உறுதியானது",
    pdfReadyHeader: "🎉 உங்கள் 5 ஆண்டு மகா ஜாதக PDF தயாராகிவிட்டது!",
    downloadIPhoneBtn: "📥 iPhone / மொபைலில் PDF பதிவிறக்கவும் (Save to Files)",
    viewPdfBtn: "👁️ PDF பார்க்க (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari பயனர்கள்: மேலே கிளிக் செய்தால் PDF திறக்கும். கீழே உள்ள Share குறியீட்டை அழுத்தி 'Save to Files' அல்லது 'Books' இல் சேமிக்கலாம்.",
    footerSanctum: "॥ ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வர சன்னிதானம் · பக்கவணா ஜோதிடம் ॥",
    footerContact: `உதவி அல்லது பூஜை சங்கல்பத்திற்கு தொடர்பு கொள்ளவும்: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.",
    cityNotFoundError: "ஊர் கிடைக்கவில்லை. அருகிலுள்ள நகரம் அல்லது பின்கோட் உள்ளிடவும்.",
    calcError: "ஜாதகக் கணிப்பில் பிழை ஏற்பட்டுள்ளது. பிறந்த தேதி மற்றும் நேரத்தை சரிபார்க்கவும்."
  },
  ml: {
    topMantra: "॥ ശ്രീ ഗോകർണം മഹാബലേശ്വര സ്വാമി പ്രസന്നം ॥",
    defaultSanctuaryTitle: "പണ്ഡിറ്റ് പാലറ്റ് (Pandit Palette)",
    tableLabel: "മേശ",
    freeBannerBadge: "✨ ഭക്ഷണത്തിന് മുൻപ് മനസ്സിന്റെ രഹസ്യങ്ങൾ അറിയൂ • 100% സൗജന്യം",
    heroTitle: "അന്തരംഗ രഹസ്യം (Dark Secret)",
    heroSubtitle: "ആരോടും പറയാതെ മനസ്സിൽ ഒതുക്കിവെച്ചിരിക്കുന്ന രഹസ്യങ്ങളും ഉള്ളിലെ വിങ്ങലുകളും എന്തെല്ലാമാണ്? ജനന വിവരങ്ങൾ നൽകി 1-ക്ലിക്കിൽ അറിയൂ!",
    formHeader: "നിങ്ങളുടെ ജനന വിവരങ്ങൾ (Birth Details)",
    freeTag: "100% സൗജന്യം (Free)",
    nameLabel: "നിങ്ങളുടെ പൂർണ്ണ നാമം (Your Full Name) *",
    namePlaceholder: "ഉദാ: അനൂപ് മേനോൻ / Anoop",
    dateLabel: "ജനന തീയതി (Birth Date) *",
    timeLabel: "ജനന സമയം (Birth Time) *",
    genderLabel: "ലിംഗം (Gender)",
    maleLabel: "പുരുഷൻ (Male)",
    femaleLabel: "സ്ത്രീ (Female)",
    placeLabel: "ജനിച്ച സ്ഥലം (Birth Place)",
    customSearchPlaceholder: "മറ്റ് നഗരമോ പിൻകോഡോ തിരയുക (Search city)...",
    searchButton: "തിരയുക",
    searchingButton: "തിരയുന്നു...",
    revealSecretCta: "🔮 എന്റെ അന്തരംഗ രഹസ്യം അറിയൂ (Reveal Dark Secret) • 100% സൗജന്യം",
    calculatingCta: "അന്തരംഗ ജാതക വിശകലനം നടക്കുന്നു...",
    resultHeading: "അവരുടെ മനസ്സിന്റെ ഉള്ളറ രഹസ്യങ്ങൾ",
    resultBadge: "॥ അന്തരംഗ രഹസ്യം · നിഗൂഢ ജാതക സത്യം ॥",
    authenticTruthBadge: "✓ 100% കൃത്യമായ ജ്യോതിഷ സത്യം",
    moonSignLabel: "ചന്ദ്ര രാശി (Moon Sign)",
    starLabel: "ജന്മ നക്ഷത്രം (Star)",
    lagnaLabel: "ജന്മ ലഗ്നം (Ascendant)",
    h8LordLabel: "8-ാം ഭാവധിപൻ (രഹസ്യ ഭാവം)",
    paragraph1Title: "🎭 1. ബാഹ്യമായ മുഖംമൂടിയും ആരോടും പറയാത്ത ഉള്ളിലെ വിങ്ങലുകളും",
    paragraph2Title: "🌙 2. ഏകാന്തതയിലെ മൂക വേദനയും ആരോടും പങ്കുവെക്കാത്ത രഹസ്യവും",
    specialOfferBadge: "ഹോട്ടൽ അതിഥി പ്രത്യേക ഓഫർ (Special Offer)",
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
    offerPriceText: "വെറും ₹350 (INR 350 Only)",
    payUnlockCta: "💳 ₹350 നൽകി 5 വർഷത്തെ സമ്പൂർണ്ണ PDF ഡൗൺലോഡ് ചെയ്യൂ",
    upiSectionTitle: "📱 ₹350 UPI പേയ്‌മെന്റും PDF അൺലോക്കും",
    paymentInstructions: "PhonePe / GPay / Paytm ബട്ടൺ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ മുകളിലെ QR കോഡ് സ്കാൻ ചെയ്യുക.",
    phonePeBtn: "PhonePe വഴി ₹350 നൽകുക",
    gpayBtn: "Google Pay വഴി ₹350 നൽകുക",
    paytmBtn: "Paytm / മറ്റ് UPI വഴി നൽകുക",
    copyUpiBtn: "കോപ്പി ചെയ്യുക",
    copiedUpiBtn: "✓ കോപ്പി ചെയ്തു",
    instantUnlockTitle: "⚡ PhonePe-ൽ പേയ്‌മെന്റ് പൂർത്തിയായി കഴിഞ്ഞോ?",
    instantUnlockDesc: "12 അക്ക നമ്പർ ടൈപ്പ് ചെയ്യേണ്ട ആവശ്യമില്ല! ഉടൻ PDF ഡൗൺലോഡ് ചെയ്യാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.",
    instantUnlockBtn: "✓ പണം നൽകി • ഉടൻ 5 വർഷത്തെ PDF നേടൂ (1-Tap Auto Unlock)",
    manualUtrToggleText: "അല്ലെങ്കിൽ 12 അക്ക UTR നമ്പർ നൽകുക (ഐച്ഛികം)",
    utrLabel: "പണം നൽകിയ ശേഷം PhonePe / GPay രസീതിലുള്ള 12 അക്ക UTR നമ്പർ ഇവിടെ നൽകുക:",
    utrPlaceholder: "ഉദാ: 432109876543 (12 Digits)",
    verifyUtrBtn: "സ്ഥിരീകരിച്ച് PDF നേടൂ",
    verifyingUtrBtn: "പരിശോധിക്കുന്നു...",
    verifiedUtrBtn: "✓ പേയ്‌മെന്റ് ഉറപ്പിച്ചു",
    pdfReadyHeader: "🎉 നിങ്ങളുടെ 5 വർഷത്തെ മഹാ ജാതക PDF തയ്യാറായിരിക്കുന്നു!",
    downloadIPhoneBtn: "📥 iPhone / മൊബൈലിൽ PDF ഡൗൺലോഡ് ചെയ്യുക (Save to Files)",
    viewPdfBtn: "👁️ PDF കാണുക (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari ഉപയോക്താക്കൾ: മുകളിൽ ക്ലിക്ക് ചെയ്താൽ PDF തുറക്കും. താഴെയുള്ള Share ചിഹ്നം അമർത്തി 'Save to Files' അല്ലെങ്കിൽ 'Books'-ലേക്ക് സേവ് ചെയ്യാം.",
    footerSanctum: "॥ ശ്രീ ഗോകർണം മഹാബലേശ്വര സന്നിധാനം · ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷം ॥",
    footerContact: `സഹായത്തിനോ പൂജാ സങ്കല്പത്തിനോ ബന്ധപ്പെടുക: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "ദയവായി നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക.",
    cityNotFoundError: "സ്ഥലം കണ്ടെത്താനായില്ല. അടുത്തുള്ള പട്ടണമോ പിൻകോഡോ നൽകുക.",
    calcError: "ജാതക കണക്കുകൂട്ടലിൽ പിശക് സംഭവിച്ചു. ജനന തീയതിയും സമയവും പരിശോധിക്കുക."
  },
  mr: {
    topMantra: "॥ श्री गोकर्ण महाबळेश्वर स्वामी प्रसन्न ॥",
    defaultSanctuaryTitle: "पंडित पॅलेट (Pandit Palette)",
    tableLabel: "टेबल",
    freeBannerBadge: "✨ जेवणापूर्वी आपल्या अंतर्मनातील गूढ सत्य जाणून घ्या • १००% मोफत",
    heroTitle: "अंतर्मनातील गूढ सत्य (Dark Secret)",
    heroSubtitle: "कोणालाही न सांगता आपण मनात दडवून ठेवलेले गूढ सत्य आणि आंतरिक द्वंद्व काय आहे? आपले जन्म तपशील देऊन एका क्लिकवर जाणून घ्या!",
    formHeader: "आपले जन्म तपशील (Birth Details)",
    freeTag: "१००% मोफत (Free)",
    nameLabel: "आपले पूर्ण नाव (Your Full Name) *",
    namePlaceholder: "उदा: अमित कुलकर्णी / Amit",
    dateLabel: "जन्म तारीख (Birth Date) *",
    timeLabel: "जन्म वेळ (Birth Time) *",
    genderLabel: "लिंग (Gender)",
    maleLabel: "पुरुष (Male)",
    femaleLabel: "स्त्री (Female)",
    placeLabel: "जन्म गाव / शहर (Birth Place)",
    customSearchPlaceholder: "इतर शहर किंवा पिनकोड शोधा (Search city)...",
    searchButton: "शोधा",
    searchingButton: "शोधत आहे...",
    revealSecretCta: "🔮 माझ्या अंतर्मनातील गूढ सत्य उलगडा (Reveal Dark Secret) • १००% मोफत",
    calculatingCta: "जन्मपत्रिकेचे गूढ विश्लेषण होत आहे...",
    resultHeading: "यांच्या अंतर्मनातील गुप्त सत्य",
    resultBadge: "॥ अंतर्मनातील सत्य · गूढ जन्मपत्रिका रहस्य ॥",
    authenticTruthBadge: "✓ १००% अचूक वैदिक ज्योतिष सत्य",
    moonSignLabel: "चंद्र रास (Moon Sign)",
    starLabel: "जन्म नक्षत्र (Star)",
    lagnaLabel: "जन्म लग्न (Ascendant)",
    h8LordLabel: "अष्टमेश (गूढ स्थान)",
    paragraph1Title: "🎭 1. बाह्य मुखवटा आणि कोणालाही न सांगता येणारे आंतरिक द्वंद्व",
    paragraph2Title: "🌙 2. एकांतातील मूक वेदना आणि कोणालाही न ठाऊक असणारे रहस्य",
    specialOfferBadge: "हॉटेल अतिथी विशेष सवलत (Special Offer)",
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
    offerPriceText: "फक्त ₹३५० (INR 350 Only)",
    payUnlockCta: "💳 ₹३५० भरून संपूर्ण ५-वर्षांची PDF डाउनलोड करा",
    upiSectionTitle: "📱 ₹३५० UPI पेमेंट आणि PDF अनलॉक",
    paymentInstructions: "PhonePe / GPay / Paytm बटण दाबा किंवा वरील QR कोड स्कॅन करा.",
    phonePeBtn: "PhonePe द्वारे ₹३५० भरा",
    gpayBtn: "Google Pay द्वारे ₹३५० भरा",
    paytmBtn: "Paytm / इतर UPI द्वारे भरा",
    copyUpiBtn: "कॉपी करा",
    copiedUpiBtn: "✓ कॉपी झाले",
    instantUnlockTitle: "⚡ PhonePe वर पेमेंट पूर्ण झाले का?",
    instantUnlockDesc: "१२-अंकी नंबर टाईप करण्याची गरज नाही! खाली क्लिक करून त्वरित PDF डाउनलोड करा.",
    instantUnlockBtn: "✓ पेमेंट केले • ५-वर्षांची PDF डाउनलोड करा (1-Tap Auto Unlock)",
    manualUtrToggleText: "किंवा १२-अंकी UTR संदर्भ क्रमांक स्वतः टाका (पर्यायी)",
    utrLabel: "पेमेंट केल्यानंतर PhonePe / GPay पावतीवरील १२-अंकी UTR / संदर्भ क्रमांक येथे टाका:",
    utrPlaceholder: "उदा: 432109876543 (12 Digits)",
    verifyUtrBtn: "पडताळणी करा आणि PDF मिळवा",
    verifyingUtrBtn: "पडताळणी चालू आहे...",
    verifiedUtrBtn: "✓ पेमेंट यशस्वी झाले",
    pdfReadyHeader: "🎉 आपली ५-वर्षांची महा पत्रिका PDF तयार झाली आहे!",
    downloadIPhoneBtn: "📥 iPhone / मोबाईलवर PDF डाउनलोड करा (Save to Files)",
    viewPdfBtn: "👁️ PDF पहा (Open in New Tab)",
    iphoneSafariTip: "iPhone Safari वापरकर्ते: वरील बटण दाबताच PDF उघडेल. खालील Share चिन्हावर टॅप करून 'Save to Files' किंवा 'Books' मध्ये सेव्ह करू शकता.",
    footerSanctum: "॥ श्री क्षेत्र गोकर्ण महाबळेश्वर सन्निधान · बग्गोಣ पंचांग ज्योतिष ॥",
    footerContact: `मदत किंवा पूजा संकल्पासाठी संपर्क साधा: ${PRIEST_NAME} (${PRIEST_PHONE})`,
    nameRequiredError: "कृपया आपले पूर्ण नाव प्रविष्ट करा.",
    cityNotFoundError: "ठिकाण सापडले नाही. कृपया जवळचे शहर किंवा पिनकोड प्रविष्ट करा.",
    calcError: "पत्रिका गणनेत त्रुटी आली. कृपया जन्म तारीख व वेळ तपासा."
  }
};

// 7-Language Progress Stage Strings
const PDF_STAGES: Record<AntarangaLang, { s1: string; s2: string; s3: string; done: string }> = {
  kn: {
    s1: "೧. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ಹಾಗೂ ೫ ವರ್ಷಗಳ ಗ್ರಹ ಗೋಚಾರ ಸಿದ್ಧತೆ...",
    s2: "೨. ಪಂಚವರ್ಷ ಮಹಾ ದಶಾ ಹಾಗೂ ರಾಜಯೋಗಗಳ ಗಣನೆ...",
    s3: "೩. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ಮಹಾ ಆಶೀರ್ವಾದ ಸಂಕಲ್ಪ...",
    done: "✓ ಪ್ರೀಮಿಯಂ PDF ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧವಾಗಿದೆ!"
  },
  en: {
    s1: "1. Calculating Janma Lagna and 5-Year Planetary Transits...",
    s2: "2. Computing Vimshottari Mahadasha & Raja Yoga Timelines...",
    s3: "3. Formulating Sacred Gokarna Kshetra Shanti Protocols...",
    done: "✓ Premium 5-Year PDF generated successfully!"
  },
  hi: {
    s1: "1. जन्म लग्न और 5-वर्षीय ग्रह गोचर की तैयारी...",
    s2: "2. पंचवर्षीय महादशा और राजयोगों की सूक्ष्म गणना...",
    s3: "3. श्री क्षेत्र गोकर्ण सन्निधान आशीर्वाद संकल्प...",
    done: "✓ प्रीमियम PDF सफलतापूर्वक तैयार है!"
  },
  te: {
    s1: "1. జన్మ లగ్నం మరియు 5 సంవత్సరాల గ్రహ గోచార సన్నాహం...",
    s2: "2. పంచవర్ష మహాదశ మరియు రాజయోగాల ఖచ్చితమైన గణన...",
    s3: "3. శ్రీ క్షేత్ర గోకర్ణ సన్నిధాన ఆశీర్వాద సంకల్పం...",
    done: "✓ ప్రీమియం PDF విజయవంతంగా సిద్ధమైంది!"
  },
  ta: {
    s1: "1. ஜென்ம லக்னம் மற்றும் 5 ஆண்டு கிரக கோச்சார தயாரிப்பு...",
    s2: "2. ஐந்தாண்டு மகா திசா மற்றும் ராஜயோக கணிப்புகள்...",
    s3: "3. ஸ்ரீ கோகர்ணம் சன்னிதான ஆசீர்வாத சங்கல்பம்...",
    done: "✓ பிரீமியம் PDF வெற்றிகரமாக தயாராகிவிட்டது!"
  },
  ml: {
    s1: "1. ജന്മ ലഗ്നവും 5 വർഷത്തെ ഗ്രഹഗോചരവും കണക്കാക്കുന്നു...",
    s2: "2. പഞ്ചവത്സര മഹാദശാ കാലഘട്ടങ്ങളും രാജയോഗങ്ങളും...",
    s3: "3. ശ്രീ ഗോകർണം സന്നിധാന ദിവ്യ അനുഗ്രഹ സങ്കല്പം...",
    done: "✓ പ്രീമിയം PDF വിജയകരമായി തയ്യാറായി!"
  },
  mr: {
    s1: "१. जन्म लग्न आणि ५-वर्षांचे ग्रह गोचर विश्लेषण...",
    s2: "२. पंचवार्षिक महादशा व राजयोगांची सूक्ष्म गणना...",
    s3: "३. श्री क्षेत्र गोकर्ण सन्निधान आशीर्वाद संकल्प...",
    done: "✓ प्रीमियम PDF यशस्वीरीत्या तयार झाली आहे!"
  }
};

export default function AntarangadaSatyaPage(): JSX.Element {
  // 1. Context from Table QR Code URL
  const [tableNumber, setTableNumber] = useState<string>("");
  const [hotelName, setHotelName] = useState<string>("");

  // Unique Order Session ID for Instant 1-Tap & Webhook verification
  const [activeOrderId, setActiveOrderId] = useState<string>(() => generateHotelOrderId("1"));
  const [hasClickedPaymentApp, setHasClickedPaymentApp] = useState<boolean>(false);
  const [returnedFromPaymentApp, setReturnedFromPaymentApp] = useState<boolean>(false);
  const [showManualUtrInput, setShowManualUtrInput] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("table") || params.get("t") || "";
      const h = params.get("hotel") || params.get("h") || "";
      if (t) {
        setTableNumber(t);
        setActiveOrderId(generateHotelOrderId(t));
      }
      if (h) setHotelName(h);
    }
  }, []);

  // 2. 7-Language Selection (kn, en, hi, te, ta, ml, mr)
  const [selectedLang, setSelectedLang] = useState<AntarangaLang>("kn");
  const ui = ANTARANGA_UI_STRINGS[selectedLang] || ANTARANGA_UI_STRINGS.en;

  // 3. User Input State
  const [devoteeName, setDevoteeName] = useState("");
  const [birthDate, setBirthDate] = useState("1995-05-15");
  const [birthTime, setBirthTime] = useState("10:30");
  const [selectedCityName, setSelectedCityName] = useState("Gokarna");
  const [latitude, setLatitude] = useState(14.5479);
  const [longitude, setLongitude] = useState(74.3188);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [customCitySearch, setCustomCitySearch] = useState("");

  // 4. Computation & Result State
  const [isCalculating, setIsCalculating] = useState(false);
  const [secretResult, setSecretResult] = useState<AntarangaSecretResult | null>(null);
  const [computedKundli, setComputedKundli] = useState<KundliOutput | null>(null);

  // 5. Payment & Order State (₹350)
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [enteredUtr, setEnteredUtr] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [verifiedTxnId, setVerifiedTxnId] = useState<string>("");

  // 6. PDF Generation State
  const [fiveYearPayload, setFiveYearPayload] = useState<FiveYearPredictionPayload | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStageText, setPdfStageText] = useState("");
  const [pdfDownloadReady, setPdfDownloadReady] = useState(false);
  const [lastGeneratedPdfUrl, setLastGeneratedPdfUrl] = useState<string | null>(null);
  const fiveYearPdfRef = useRef<HTMLDivElement>(null);

  // Generate UPI QR Code with active order session
  useEffect(() => {
    const upiUri = getHotelPaymentUpiUri(HOTEL_PDF_PRICE_INR, activeOrderId);
    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    })
      .then((url) => setPaymentQrDataUrl(url))
      .catch((err) => console.warn("Payment QR error:", err));
  }, [activeOrderId]);

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

  // Automated Webhook Polling: If PhonePe webhook notifies server, auto-unlock without any user click!
  useEffect(() => {
    if (!showPaymentSection || isPaymentVerified || !activeOrderId) return;

    const intervalId = setInterval(async () => {
      try {
        const isPaid = await checkHotelPaymentWebhookStatus(activeOrderId);
        if (isPaid) {
          clearInterval(intervalId);
          setIsPaymentVerified(true);
          setVerifiedTxnId(`TXN_WEBHOOK_${activeOrderId}`);
          setTimeout(() => {
            void handleDownloadPremiumPdf();
          }, 300);
        }
      } catch {
        // Silently continue polling
      }
    }, 2500);

    return () => clearInterval(intervalId);
  }, [showPaymentSection, isPaymentVerified, activeOrderId]);

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

  // 1-Click Free "Get Antarangada Satya"
  const handleGetDarkSecret = () => {
    if (!devoteeName.trim()) {
      alert(ui.nameRequiredError);
      return;
    }

    setIsCalculating(true);
    try {
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

      const secret = generateAntarangaSatya(
        kundli,
        selectedLang,
        devoteeName.trim(),
        gender
      );
      setSecretResult(secret);

      // Pre-compute 5-Year Master Horizon
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
    }
  };

  // Re-generate secret when language changes
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
    }
  }, [selectedLang]);

  // Frictionless 1-Tap Auto-Verification (No UTR typing needed!)
  const handleInstant1TapVerification = async () => {
    setIsVerifyingPayment(true);
    setPaymentError(null);

    try {
      const res = await verifyHotelPaymentInstant(
        activeOrderId,
        devoteeName || "Hotel Devotee",
        HOTEL_PDF_PRICE_INR,
        selectedLang
      );

      if (!res.success) {
        setPaymentError(res.message);
        return;
      }

      setIsPaymentVerified(true);
      setVerifiedTxnId(res.transactionId || `TXN_${activeOrderId}`);

      // Auto-trigger PDF generation immediately
      setTimeout(() => {
        void handleDownloadPremiumPdf();
      }, 300);
    } catch (err: any) {
      setPaymentError(err?.message || "Payment verification failed.");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Optional Manual UTR Payment Verification Handler
  const handleVerifyManualPayment = async () => {
    if (!enteredUtr.trim()) {
      setPaymentError(
        selectedLang === "kn"
          ? "ದಯವಿಟ್ಟು PhonePe / GPay ರಶೀದಿಯಲ್ಲಿರುವ ೧೨-ಅಂಕಿಯ UTR ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."
          : ui.utrLabel
      );
      return;
    }

    setIsVerifyingPayment(true);
    setPaymentError(null);

    try {
      const res = await verifyHotelPaymentUtr(
        enteredUtr.trim(),
        devoteeName || "Hotel Devotee",
        HOTEL_PDF_PRICE_INR,
        selectedLang
      );

      if (!res.success) {
        setPaymentError(res.message);
        return;
      }

      setIsPaymentVerified(true);
      setVerifiedTxnId(res.transactionId || `TXN_${enteredUtr.trim()}`);

      // Auto-trigger PDF generation immediately
      setTimeout(() => {
        void handleDownloadPremiumPdf();
      }, 400);
    } catch (err: any) {
      setPaymentError(err?.message || "Payment verification failed.");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Premium PDF Generation & Direct iPhone / Mobile Download
  const handleDownloadPremiumPdf = async () => {
    if (!isPaymentVerified) {
      setShowPaymentSection(true);
      setTimeout(() => {
        const payEl = document.getElementById("hotel-payment-box");
        if (payEl) payEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }

    if (!fiveYearPdfRef.current) {
      alert("PDF template loading. Please retry in 2 seconds.");
      return;
    }

    const stages = PDF_STAGES[selectedLang] || PDF_STAGES.en;
    setIsGeneratingPdf(true);
    setPdfProgress(10);
    setPdfStageText(stages.s1);

    try {
      const cleanName = (devoteeName || "Devotee").replace(/\s+/g, "_");
      const fileName = `Baggona_5_Year_Destiny_${selectedLang.toUpperCase()}_${cleanName}.pdf`;

      const pdf = await captureFiveYearPredictionPdf(
        fiveYearPdfRef.current,
        fileName,
        true, // autoSave handles standard blob download
        (p) => {
          setPdfProgress(p);
          if (p < 40) setPdfStageText(stages.s1);
          else if (p < 80) setPdfStageText(stages.s2);
          else setPdfStageText(stages.s3);
        }
      );

      // Create explicit blob URL for iPhone / Safari open support
      try {
        const arrayBuf = pdf.output("arraybuffer");
        const blob = new Blob([arrayBuf], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setLastGeneratedPdfUrl(blobUrl);
      } catch (blobErr) {
        console.warn("Blob URL preview warning:", blobErr);
      }

      setPdfDownloadReady(true);
      setPdfProgress(100);
      setPdfStageText(stages.done);
    } catch (pdfErr: any) {
      console.error("PDF Generation error:", pdfErr);
      alert(`PDF download error:\n${pdfErr?.message || "Please try again."}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentCities = QUICK_CITIES_BY_LANG[selectedLang] || QUICK_CITIES_BY_LANG.en;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* ── SECURITY RESTRICTION: Isolated Standalone Page without Header/Drawer ── */}

      {/* Top Gold Bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 w-full" />

      {/* Hotel & Table Welcome Banner */}
      <header className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            <div>
              <div className="text-xs tracking-wider text-amber-400/90 font-serif font-bold uppercase">
                {ui.topMantra}
              </div>
              <h1 className="text-lg font-black text-amber-200 font-serif">
                {hotelName ? hotelName : ui.defaultSanctuaryTitle}
                {tableNumber && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {ui.tableLabel} {tableNumber}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* 7-Language Switcher (kn, en, hi, te, ta, ml, mr) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 border border-amber-500/30 rounded-xl p-1 text-xs">
            {ANTARANGA_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelectedLang(l.code)}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  selectedLang === l.code
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-amber-200"
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span>{ui.freeBannerBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-serif">
            {ui.heroTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {ui.heroSubtitle}
          </p>
        </div>

        {/* ── STEP 1: Devotee Free Input Form ── */}
        <section className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <span>👤</span>
              <span>{ui.formHeader}</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {ui.freeTag}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Devotee Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {ui.nameLabel}
              </label>
              <input
                type="text"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                placeholder={ui.namePlaceholder}
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Birth Date & Birth Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {ui.dateLabel}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {ui.timeLabel}
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {ui.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    gender === "male"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold"
                      : "bg-slate-950 border-slate-700 text-slate-300 hover:border-amber-500/50"
                  }`}
                >
                  <span>👨</span>
                  <span>{ui.maleLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    gender === "female"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold"
                      : "bg-slate-950 border-slate-700 text-slate-300 hover:border-amber-500/50"
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
                <label className="text-slate-300 font-medium">
                  {ui.placeLabel}: <span className="text-amber-400 font-bold">{selectedCityName}</span>
                </label>
              </div>

              {/* Quick Popular Cities */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectQuickCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${
                      selectedCityName === c.name
                        ? "bg-amber-500/30 border-amber-400 text-amber-200 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-amber-500/40"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Custom Search Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCitySearch}
                  onChange={(e) => setCustomCitySearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSearchCustomCity()}
                  placeholder={ui.customSearchPlaceholder}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => void handleSearchCustomCity()}
                  disabled={isSearchingCity}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold"
                >
                  {isSearchingCity ? ui.searchingButton : ui.searchButton}
                </button>
              </div>
            </div>
          </div>

          {/* Big Golden Action Button */}
          <button
            type="button"
            onClick={handleGetDarkSecret}
            disabled={isCalculating}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
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
            className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-300"
          >
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                  {ui.resultBadge}
                </span>
                <h3 className="text-xl font-black text-amber-200 font-serif">
                  {secretResult.devoteeName} {ui.resultHeading}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {ui.authenticTruthBadge}
              </span>
            </div>

            {/* Astrological Coordinates Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/70 border border-amber-500/20 rounded-xl p-2.5">
              <div>
                <span className="text-slate-400 block text-[10px]">{ui.moonSignLabel}:</span>
                <span className="font-bold text-amber-300">{secretResult.moonSignName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{ui.starLabel}:</span>
                <span className="font-bold text-amber-300">
                  {secretResult.nakshatraName} ({secretResult.moonPada})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{ui.lagnaLabel}:</span>
                <span className="font-bold text-amber-300">{secretResult.lagnaSignName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{ui.h8LordLabel}:</span>
                <span className="font-bold text-amber-300">{secretResult.h8LordName}</span>
              </div>
            </div>

            {/* Paragraph 1: Outward Composure vs Hidden Inner Dilemma */}
            <div className="bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif space-y-1">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>{ui.paragraph1Title}</span>
              </div>
              <p className="text-slate-200 text-justify leading-relaxed">{secretResult.paragraph1}</p>
            </div>

            {/* Paragraph 2: Subconscious Solitude & The Unspoken Truth */}
            <div className="bg-amber-950/20 border-l-4 border-amber-400 rounded-r-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif space-y-1">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>{ui.paragraph2Title}</span>
              </div>
              <p className="text-slate-200 text-justify leading-relaxed">{secretResult.paragraph2}</p>
            </div>

            {/* Sacred Kshetra Blessing */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300/90 leading-relaxed font-serif">
              {secretResult.kshetraBlessing}
            </div>

            {/* ── STEP 3: Conversion Banner to Full 5-Year Premium Horoscope PDF for ₹350 ── */}
            <div className="pt-2">
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-center space-y-3 shadow-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide uppercase">
                  {ui.specialOfferBadge}
                </span>

                <h4 className="text-lg sm:text-xl font-black text-amber-100 font-serif">
                  {ui.specialOfferTitle}
                </h4>

                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {ui.specialOfferDesc}
                </p>

                {/* What's in the 5-Year PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-slate-200 bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
                  {ui.featurePoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-1.5 ${idx === 4 ? "sm:col-span-2" : ""}`}
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Price Display */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm text-slate-500 line-through">
                    {ui.regularPriceLabel}
                  </span>
                  <div className="flex items-baseline gap-1 text-amber-300">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">₹350</span>
                    <span className="text-xs text-slate-400">({ui.offerPriceText})</span>
                  </div>
                </div>

                {/* CTA to Open Payment */}
                {!showPaymentSection && !isPaymentVerified && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentSection(true)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
                  >
                    <span>{ui.payUnlockCta}</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── STEP 4: UPI Payment & Instant Frictionless Verification Section ── */}
            {showPaymentSection && (
              <div
                id="hotel-payment-box"
                className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <span>{ui.upiSectionTitle}</span>
                  </h4>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    UPI: {PRIEST_UPI_ID}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Dynamic QR Code for ₹350 */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner">
                    {paymentQrDataUrl ? (
                      <img
                        src={paymentQrDataUrl}
                        alt="Pay ₹350 UPI QR"
                        className="w-48 h-48 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs">
                        Loading QR...
                      </div>
                    )}
                    <div className="text-center mt-2 text-slate-900">
                      <div className="text-xs font-bold font-serif">{PRIEST_NAME}</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Amount: <span className="text-emerald-700 font-bold">₹350</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions & Mobile 1-Tap Buttons */}
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {ui.paymentInstructions}
                    </p>

                    {/* Mobile 1-Tap Deep Link Buttons (iPhone / Android) */}
                    <div className="space-y-2">
                      <a
                        href={getHotelPhonePeUri(HOTEL_PDF_PRICE_INR, activeOrderId)}
                        onClick={() => setHasClickedPaymentApp(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 shadow"
                      >
                        <span>🟣</span>
                        <span>{ui.phonePeBtn}</span>
                      </a>
                      <a
                        href={getHotelGPayUri(HOTEL_PDF_PRICE_INR, activeOrderId)}
                        onClick={() => setHasClickedPaymentApp(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow"
                      >
                        <span>🔵</span>
                        <span>{ui.gpayBtn}</span>
                      </a>
                      <a
                        href={getHotelPaytmUri(HOTEL_PDF_PRICE_INR, activeOrderId)}
                        onClick={() => setHasClickedPaymentApp(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow"
                      >
                        <span>💠</span>
                        <span>{ui.paytmBtn}</span>
                      </a>
                    </div>

                    {/* Copy UPI ID */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-mono text-amber-300 text-[11px]">{PRIEST_UPI_ID}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(PRIEST_UPI_ID);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-[11px] text-amber-400 hover:underline font-semibold"
                      >
                        {copiedUpi ? ui.copiedUpiBtn : ui.copyUpiBtn}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── 1-TAP FRICTIONLESS AUTO-VERIFICATION (No UTR typing needed!) ── */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-2 border-amber-400 space-y-2 text-center shadow-lg">
                  <div className="text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5">
                    <span>⚡</span>
                    <span>{ui.instantUnlockTitle}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 max-w-md mx-auto">
                    {ui.instantUnlockDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleInstant1TapVerification()}
                    disabled={isVerifyingPayment || isPaymentVerified}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifyingPayment ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>{ui.verifyingUtrBtn}</span>
                      </>
                    ) : isPaymentVerified ? (
                      <span>{ui.verifiedUtrBtn}</span>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>{ui.instantUnlockBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Optional Toggle for Manual UTR Entry */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowManualUtrInput(!showManualUtrInput)}
                    className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>{showManualUtrInput ? "▲" : "▼"}</span>
                    <span>{ui.manualUtrToggleText}</span>
                  </button>
                </div>

                {/* ── Optional Manual UTR Input ── */}
                {showManualUtrInput && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-amber-300">
                      {ui.utrLabel}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        maxLength={22}
                        value={enteredUtr}
                        onChange={(e) => {
                          setEnteredUtr(e.target.value);
                          setPaymentError(null);
                        }}
                        placeholder={ui.utrPlaceholder}
                        className="flex-1 bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 font-mono tracking-wider focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => void handleVerifyManualPayment()}
                        disabled={isVerifyingPayment || isPaymentVerified}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black text-xs sm:text-sm tracking-wide shadow flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                      >
                        {isVerifyingPayment ? (
                          <span>{ui.verifyingUtrBtn}</span>
                        ) : isPaymentVerified ? (
                          <span>{ui.verifiedUtrBtn}</span>
                        ) : (
                          <span>{ui.verifyUtrBtn}</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Error */}
                {paymentError && (
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                    {paymentError}
                  </div>
                )}

                {/* Payment Success Confirmation */}
                {isPaymentVerified && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>✓</span>
                      <span>
                        {selectedLang === "kn"
                          ? `₹೩೫೦ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ! (Txn ID: ${verifiedTxnId})`
                          : `₹350 Payment verified successfully! (Txn ID: ${verifiedTxnId})`}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200/90">
                      {PDF_STAGES[selectedLang]?.s1 || PDF_STAGES.en.s1}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 5: PDF Progress & iPhone Download Center ── */}
            {isGeneratingPdf && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span>{pdfStageText}</span>
                  <span>{pdfProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-amber-500/20">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${pdfProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* PDF Ready Download Buttons (Optimized for iPhone Safari) */}
            {pdfDownloadReady && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500 space-y-3 text-center">
                <div className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-1.5">
                  <span>{ui.pdfReadyHeader}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => void handleDownloadPremiumPdf()}
                    className="py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>{ui.downloadIPhoneBtn}</span>
                  </button>

                  {lastGeneratedPdfUrl && (
                    <a
                      href={lastGeneratedPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-sm flex items-center justify-center gap-1.5"
                    >
                      <span>{ui.viewPdfBtn}</span>
                    </a>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {ui.iphoneSafariTip}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── HIDDEN PDF TEMPLATE RENDER CONTAINER ── */}
      {/* Offscreen container for high-fidelity capture */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: "0px",
          width: "900px",
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none"
        }}
      >
        <div ref={fiveYearPdfRef}>
          <FiveYearPredictionPdfTemplate data={fiveYearPayload} />
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center border-t border-slate-900 mt-12 text-xs text-slate-500 space-y-1">
        <p className="font-serif text-slate-400">
          {ui.footerSanctum}
        </p>
        <p className="text-[11px]">
          {ui.footerContact}
        </p>
      </footer>
    </div>
  );
}
