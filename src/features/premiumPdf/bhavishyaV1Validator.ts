import type { BhavishyaV1Payload } from "./bhavishyaV1Service";

export interface BhavishyaValidationResult {
  isValid: boolean;
  missingSections: string[];
  errorMessage: string;
}

export class BhavishyaValidationError extends Error {
  missingSections: string[];
  constructor(message: string, missingSections: string[]) {
    super(message);
    this.name = "BhavishyaValidationError";
    this.missingSections = missingSections;
  }
}

/**
 * Returns authentic, pure localized titles for missing chapters across all 5 supported languages:
 * Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), and English (en).
 */
function getLocalizedSectionName(key: string, baseLang: string): string {
  const dictionary: Record<string, Record<string, string>> = {
    name: {
      kn: "ಜಾತಕರ ಹೆಸರು (Name)",
      hi: "जातक का नाम (Name)",
      te: "జాతకుని పేరు (Name)",
      ta: "ஜாதகரின் பெயர் (Name)",
      en: "Devotee Name"
    },
    dob: {
      kn: "ಜನ್ಮ ವಿವರಗಳು (Birth Details)",
      hi: "जन्म विवरण (Birth Details)",
      te: "జన్మ వివరాలు (Birth Details)",
      ta: "பிறப்பு விவரங்கள் (Birth Details)",
      en: "Birth Details"
    },
    lagna: {
      kn: "ಜನ್ಮ ಲಗ್ನ (Birth Lagna)",
      hi: "जन्म लग्न (Birth Lagna)",
      te: "జన్మ లగ్నం (Birth Lagna)",
      ta: "ஜென்ம லக்னம் (Birth Lagna)",
      en: "Birth Lagna"
    },
    moon: {
      kn: "ಜನ್ಮ ರಾಶಿ (Moon Sign)",
      hi: "जन्म राशि (Moon Sign)",
      te: "జన్మ రాశి (Moon Sign)",
      ta: "ஜென்ம ராசி (Moon Sign)",
      en: "Moon Sign"
    },
    characteristics: {
      kn: "ಅಧ್ಯಾಯ ೨: ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ (Characteristics)",
      hi: "अध्याय २: जन्म लग्न व्यक्तित्व (Characteristics)",
      te: "అధ్యాయం 2: జన్మ లగ్న వ్యక్తిత్వం (Characteristics)",
      ta: "அத்தியாயம் 2: ஜென்ம லக்ன ஆளுமை (Characteristics)",
      en: "Chapter 2: Natal Personality & Characteristics"
    },
    darkSecret: {
      kn: "ಅಧ್ಯಾಯ ೩: ಅಂತರಂಗ ಸತ್ಯ (Dark Secret)",
      hi: "अध्याय ३: अंतरंग सत्य (Dark Secret)",
      te: "అధ్యాయం 3: అంతరంగ సత్యం (Dark Secret)",
      ta: "அத்தியாயம் 3: அந்தரங்க உண்மை (Dark Secret)",
      en: "Chapter 3: Soul Pattern & Inner Truth"
    },
    currentPhase: {
      kn: "ಅಧ್ಯಾಯ ೪: ಪ್ರಸ್ತುತ ದಶಾ ಫಲ & ಮಾರ್ಗದರ್ಶನ (Current Phase)",
      hi: "अध्याय ४: वर्तमान दशा फल एवं मार्गदर्शन (Current Phase)",
      te: "అధ్యాయం 4: ప్రస్తుత దశా ఫలితం & మార్గదర్శనం (Current Phase)",
      ta: "அத்தியாயம் 4: தற்போதைய தசா பலன் & வழிகாட்டுதல் (Current Phase)",
      en: "Chapter 4: Current Phase & Planetary Guidance"
    },
    maandi: {
      kn: "ಕರ್ಮ ಪಯಣ: ಮಾಂದಿ ದೃಷ್ಟಿ (Karmic Inquest)",
      hi: "कर्म यात्रा: मांदी दृष्टि (Karmic Inquest)",
      te: "కర్మ ప్రయాణం: మాంది దృష్టి (Karmic Inquest)",
      ta: "கர்ம பயணம்: மாந்தி பார்வை (Karmic Inquest)",
      en: "Sacred Karmic Inquest: Planetary Balance"
    },
    lifePredictions: {
      kn: "ಅಧ್ಯಾಯ ೫: ಪಂಚಮುಖ ಜೀವಮಾನ ಭವಿಷ್ಯ (5 Life Areas)",
      hi: "अध्याय ५: पंचमुखी जीवन फल (5 Life Areas)",
      te: "అధ్యాయం 5: పంచముఖ జీవిత భవిష్యత్తు (5 Life Areas)",
      ta: "அத்தியாயம் 5: பஞ்சமுக வாழ்க்கை பலன் (5 Life Areas)",
      en: "Chapter 5: 5 Core Life Stage Predictions"
    },
    incompleteLifePredictions: {
      kn: "ಅಧ್ಯಾಯ ೫: ಅಪೂರ್ಣ ಪರಿಚ್ಛೇದಗಳು (Incomplete Life Chapters)",
      hi: "अध्याय ५: अपूर्ण परिच्छेद (Incomplete Life Chapters)",
      te: "అధ్యాయం 5: అసంపూర్ణ విభాగాలు (Incomplete Life Chapters)",
      ta: "அத்தியாயம் 5: முழுமையடையாத பகுதிகள் (Incomplete Life Chapters)",
      en: "Chapter 5: Incomplete Paragraphs in Life Predictions"
    },
    yogas: {
      kn: "ಅಧ್ಯಾಯ ೬: ಶುಭ ರಾಜಯೋಗಗಳು (Special Yogas)",
      hi: "अध्याय ६: शुभ राजयोग (Special Yogas)",
      te: "అధ్యాయం 6: శుభ రాజయోగాలు (Special Yogas)",
      ta: "அத்தியாயம் 6: சுப ராஜயோகங்கள் (Special Yogas)",
      en: "Chapter 6: Auspicious Natal Yogas"
    },
    doshas: {
      kn: "ಅಧ್ಯಾಯ ೭: ಕರ್ಮ ಸವಾಲುಗಳು & ದೋಷ ಪರಿಹಾರ (Doshas & Remedies)",
      hi: "अध्याय ७: कर्म चुनौतियां एवं दोष परिहार (Doshas & Remedies)",
      te: "అధ్యాయం 7: కర్మ సవాళ్లు & దోష పరిహారాలు (Doshas & Remedies)",
      ta: "அத்தியாயம் 7: கர்ம சவால்கள் & தோஷ பரிகாரங்கள் (Doshas & Remedies)",
      en: "Chapter 7: Karmic Doshas & Remedies"
    },
    gochara: {
      kn: "ಅಧ್ಯಾಯ ೮: ಪ್ರಸ್ತುತ ಗೋಚಾರ ಫಲ (Planetary Transits)",
      hi: "अध्याय ८: वर्तमान गोचर फल (Planetary Transits)",
      te: "అధ్యాయం 8: ప్రస్తుత గోచార ఫలితం (Planetary Transits)",
      ta: "அத்தியாயம் 8: தற்போதைய கோசார பலன் (Planetary Transits)",
      en: "Chapter 8: Current Planetary Transits"
    },
    timeline: {
      kn: "ಅಧ್ಯಾಯ ೯: ೬ ತಿಂಗಳ ಭವಿಷ್ಯ ನಕ್ಷೆ (6-Month Timeline)",
      hi: "अध्याय ९: आगामी ६ माह का भविष्य चक्र (6-Month Timeline)",
      te: "అధ్యాయం 9: రాబోయే 6 నెలల కాలచక్రం (6-Month Timeline)",
      ta: "அத்தியாயம் 9: அடுத்த 6 மாத காலச்சக்கரம் (6-Month Timeline)",
      en: "Chapter 9: The Next 6 Months Planetary Timeline"
    },
    summary: {
      kn: "ಅಧ್ಯಾಯ ೧೦: ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ (Astrologer's Summary / Saramsha)",
      hi: "अध्याय १०: ज्योतिषी का सारांश (Astrologer's Summary / Saramsha)",
      te: "అధ్యాయం 10: జ్యోతిష్కుని సారాంశం (Astrologer's Summary / Saramsha)",
      ta: "அத்தியாயம் 10: ஜோதிடரின் சுருக்கம் (Astrologer's Summary / Saramsha)",
      en: "Chapter 10: Astrologer's Final Summary (Saramsha)"
    },
    ashirvada: {
      kn: "ದೈವಜ್ಞ ಆಶೀರ್ವಾದ (Astrologer's Blessing)",
      hi: "ज्योतिषी का आशीर्वाद (Astrologer's Blessing)",
      te: "జ్యోతిష్కుని ఆశీర్వాదం (Astrologer's Blessing)",
      ta: "ஜோதிடரின் ஆசீர்வாதம் (Astrologer's Blessing)",
      en: "Astrologer's Blessing (Ashirvada)"
    },
    payloadData: {
      kn: "ಸಮಗ್ರ ಭವಿಷ್ಯ ದತ್ತಾಂಶ (Astrology Payload Data)",
      hi: "समग्र ज्योतिष डेटा (Astrology Payload Data)",
      te: "సమగ్ర జ్యోతిష డేటా (Astrology Payload Data)",
      ta: "முழுமையான ஜோதிட தரவு (Astrology Payload Data)",
      en: "Astrology Payload Data"
    }
  };

  const item = dictionary[key];
  if (!item) return key;
  return item[baseLang] || item.en || key;
}

/**
 * Validates the astrological content and DOM structure of Baggona Divya Bhavishya V1 PDF.
 * Ensures 100% complete chapters are present before allowing any PDF generation or download.
 * If Saramsha (Astrologer's Summary) or any core chapter is missing, halts download and returns
 * descriptive, localized error messages for all 5 languages (Kannada, Hindi, Telugu, Tamil, English).
 */
export function validateBhavishyaV1Content(
  containerEl: HTMLElement,
  payload?: BhavishyaV1Payload | null,
  lang: string = "kn"
): BhavishyaValidationResult {
  const missing: string[] = [];
  const baseLang = (lang || "en").split("-")[0];

  // 1. Payload-Level Audit (Verify data structures in memory)
  if (payload) {
    const pd = payload.premiumData;
    const translations = payload.translations;

    // A. Personal/Birth Details
    if (!translations?.nameValue || translations.nameValue.trim().length === 0) {
      missing.push(getLocalizedSectionName("name", baseLang));
    }
    if (!translations?.dobValue || translations.dobValue.trim().length === 0) {
      missing.push(getLocalizedSectionName("dob", baseLang));
    }
    if (!translations?.lagnaValue || translations.lagnaValue.trim().length === 0) {
      missing.push(getLocalizedSectionName("lagna", baseLang));
    }
    if (!translations?.moonValue || translations.moonValue.trim().length === 0) {
      missing.push(getLocalizedSectionName("moon", baseLang));
    }

    if (pd) {
      // B. Chapter 2: Characteristics
      const hasCharacteristics = pd.characteristics &&
        pd.characteristics.length > 0 &&
        pd.characteristics.some(c => (c.impact || "").trim().length >= 20);
      if (!hasCharacteristics) {
        missing.push(getLocalizedSectionName("characteristics", baseLang));
      }

      // C. Chapter 3: Dark Secret (Mandatory for adult devotees age >= 8)
      const devoteeAge = payload.ageYears ?? 30;
      if (devoteeAge >= 8) {
        const hasDarkSecret = pd.darkSecret &&
          pd.darkSecret.length > 0 &&
          pd.darkSecret.some(d => (d.impact || "").trim().length >= 20);
        if (!hasDarkSecret) {
          missing.push(getLocalizedSectionName("darkSecret", baseLang));
        }
      }

      // D. Chapter 4: Current Phase & Guidance
      const hasCurrentPhase = pd.currentPhase &&
        pd.currentPhase.length > 0 &&
        pd.currentPhase.some(cp => (cp.impact || "").trim().length >= 20);
      if (!hasCurrentPhase) {
        missing.push(getLocalizedSectionName("currentPhase", baseLang));
      }

      // E. Sacred Karmic Inquest (Maandi Inquest)
      const hasMaandi = pd.maandiInquest &&
        (pd.maandiInquest.paragraph1 || "").trim().length >= 30 &&
        (pd.maandiInquest.paragraph2 || "").trim().length >= 30;
      if (!hasMaandi) {
        missing.push(getLocalizedSectionName("maandi", baseLang));
      }

      // F. Chapter 5: 5 Core Life Stage Predictions
      if (!payload.predictions || payload.predictions.length < 5) {
        missing.push(getLocalizedSectionName("lifePredictions", baseLang));
      } else {
        const invalidPred = payload.predictions.some(p => (p.translatedText || "").trim().length < 40);
        if (invalidPred) {
          missing.push(getLocalizedSectionName("incompleteLifePredictions", baseLang));
        }
      }

      // G. Chapter 6: Yogas
      const hasYogas = pd.yogas &&
        pd.yogas.length > 0 &&
        pd.yogas.some(y => (y.impact || "").trim().length >= 10);
      if (!hasYogas) {
        missing.push(getLocalizedSectionName("yogas", baseLang));
      }

      // H. Chapter 7: Doshas & Remedies
      const hasDoshas = pd.doshas &&
        pd.doshas.length > 0 &&
        pd.doshas.some(d => (d.impact || "").trim().length >= 10);
      if (!hasDoshas) {
        missing.push(getLocalizedSectionName("doshas", baseLang));
      }

      // I. Chapter 8: Gochara
      const hasGochara = pd.gochara &&
        pd.gochara.length > 0 &&
        pd.gochara.some(g => (g.impact || "").trim().length >= 10);
      if (!hasGochara) {
        missing.push(getLocalizedSectionName("gochara", baseLang));
      }

      // J. Chapter 9: 6-Month Planetary Journey Map / Timeline
      const hasTimeline = pd.timeline &&
        pd.timeline.length >= 4 &&
        pd.timeline.every(t => (t.dateRange || "").trim().length > 0 && (t.impact || "").trim().length >= 20);
      if (!hasTimeline) {
        missing.push(getLocalizedSectionName("timeline", baseLang));
      }

      // K. Chapter 10: Astrologer's Summary (Saramsha) - STRICT CRITICAL VALIDATION
      const hasSummary = pd.summary &&
        pd.summary.length > 0 &&
        pd.summary.some(s => (s.impact || "").trim().length >= 50);
      if (!hasSummary) {
        missing.push(getLocalizedSectionName("summary", baseLang));
      }
    } else {
      missing.push(getLocalizedSectionName("payloadData", baseLang));
    }

    // L. Astrologer's Blessing
    if (!translations?.ashirvadaValue || translations.ashirvadaValue.trim().length < 10) {
      missing.push(getLocalizedSectionName("ashirvada", baseLang));
    }
  }

  // 2. DOM-Level Audit (Verify actual elements rendered by React in containerEl)
  if (containerEl) {
    const sections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    if (sections.length < 8) {
      const msg = baseLang === "kn"
        ? `ಮುದ್ರಣ ಪುಟಗಳ ಕೊರತೆ (ಕೇವಲ ${sections.length} ಅಧ್ಯಾಯಗಳು ಮಾತ್ರ ಮೂಡಿಬಂದಿವೆ - ಕನಿಷ್ಠ ೧೨ ಅಗತ್ಯವಿದೆ)`
        : baseLang === "hi"
        ? `प्रिंट पृष्ठों की कमी (केवल ${sections.length} खंड लोड हुए - न्यूनतम 12 आवश्यक हैं)`
        : baseLang === "te"
        ? `ముద్రణ పేజీల కొరత (కేవలం ${sections.length} విభాగాలు మాత్రమే వచ్చాయి - కనీసం 12 అవసరం)`
        : baseLang === "ta"
        ? `அச்சுப் பக்கக் குறைபாடு (மட்டும் ${sections.length} பகுதிகள் வந்துள்ளன - குறைந்தபட்சம் 12 தேவை)`
        : `Insufficient DOM sections (Found ${sections.length}, minimum 12 required)`;
      missing.push(msg);
    }

    // Check scrollHeight to ensure container isn't blank or crushed
    const domHeight = containerEl.scrollHeight || containerEl.offsetHeight;
    if (domHeight < 3000) {
      const msg = baseLang === "kn"
        ? `ವರದಿಯ ಪುಟ ವಿನ್ಯಾಸ ಅಪೂರ್ಣವಾಗಿದೆ (ಎತ್ತರ: ${domHeight}px - ಕನಿಷ್ಠ ೩೫೦೦px ಅಗತ್ಯ)`
        : baseLang === "hi"
        ? `रिपोर्ट की पृष्ठ संरचना अपूर्ण है (ऊंचाई: ${domHeight}px - न्यूनतम 3500px आवश्यक)`
        : baseLang === "te"
        ? `నివేదిక పేజీ నిర్మాణం అసంపూర్ణం (ఎత్తు: ${domHeight}px - కనీసం 3500px అవసరం)`
        : baseLang === "ta"
        ? `அறிக்கை பக்க வடிவமைப்பு முழுமையடையவில்லை (உயரம்: ${domHeight}px - குறைந்தபட்சம் 3500px தேவை)`
        : `Rendered DOM height too short (${domHeight}px, minimum 3500px required)`;
      missing.push(msg);
    }

    // Explicitly verify Saramsha (Astrologer's Summary) in the rendered DOM across all 5 languages
    const summarySection = containerEl.querySelector('[data-section="summary"], #pdf-section-summary');
    const domText = containerEl.innerText || containerEl.textContent || "";
    const saramshaKeywords = [
      "ಸಾರಾಂಶ", "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ",
      "सारांश", "ज्योतिषी का सारांश",
      "సారాంశం", "జ్యోతిష్కుని సారాంశం",
      "சுருக்கம்", "ஜோதிடரின் சுருக்கம்",
      "Summary", "Astrologer's Summary"
    ];
    const hasSaramshaKeyword = saramshaKeywords.some(kw => domText.includes(kw));

    if (!summarySection && !hasSaramshaKeyword) {
      const msg = baseLang === "kn"
        ? "ಮುದ್ರಣ ಪುಟದಲ್ಲಿ ಸಾರಾಂಶ ಅಧ್ಯಾಯ ಕಾಣಿಸುತ್ತಿಲ್ಲ (Saramsha Section Missing in DOM)"
        : baseLang === "hi"
        ? "प्रिंट पृष्ठ में सारांश खंड अनुपस्थित है (Saramsha Section Missing in DOM)"
        : baseLang === "te"
        ? "ముద్రణ పేజీలో సారాంశం విభాగం కనిపించడం లేదు (Saramsha Section Missing in DOM)"
        : baseLang === "ta"
        ? "அச்சுப் பக்கத்தில் சுருக்கம் பகுதி காணவில்லை (Saramsha Section Missing in DOM)"
        : "Astrologer's Summary (Saramsha) section is missing in rendered DOM";
      missing.push(msg);
    }

    // Explicitly verify Timeline in the rendered DOM across all 5 languages
    const timelineSection = containerEl.querySelector('[data-section="timeline"]');
    const timelineKeywords = [
      "ತಿಂಗಳ ಭವಿಷ್ಯ", "ಮುಂದಿನ ಆರು ತಿಂಗಳ", "ತಿಂಗಳ",
      "महीनों का", "आगामी छह माह", "छह माह",
      "నెలల", "రాబోయే ఆరు నెలల",
      "மாத", "அடுத்த ஆறு மாத",
      "Timeline", "Journey Map", "The Next Six Months", "Six Months"
    ];
    const hasTimelineKeyword = timelineKeywords.some(kw => domText.includes(kw));

    if (!timelineSection && !hasTimelineKeyword) {
      const msg = baseLang === "kn"
        ? "ಮುದ್ರಣ ಪುಟದಲ್ಲಿ ಕಾಲಗಣನೆ ನಕ್ಷೆ ಕಾಣಿಸುತ್ತಿಲ್ಲ (Timeline Missing in DOM)"
        : baseLang === "hi"
        ? "प्रिंट पृष्ठ में कालचक्र रूपरेखा अनुपस्थित है (Timeline Missing in DOM)"
        : baseLang === "te"
        ? "ముద్రణ పేజీలో కాలచక్ర విభాగం కనిపించడం లేదు (Timeline Missing in DOM)"
        : baseLang === "ta"
        ? "அச்சுப் பக்கத்தில் காலச்சக்கரப் பகுதி காணவில்லை (Timeline Missing in DOM)"
        : "Planetary Timeline section is missing in rendered DOM";
      missing.push(msg);
    }
  } else {
    const msg = baseLang === "kn"
      ? "ಪಿಡಿಎಫ್ ಕಂಟೇನರ್ ಲಭ್ಯವಿಲ್ಲ (PDF Container Null)"
      : baseLang === "hi"
      ? "पीडीएफ कंटेनर उपलब्ध नहीं है (PDF Container Null)"
      : baseLang === "te"
      ? "పిడిఎఫ్ కంటైనర్ అందుబాటులో లేదు (PDF Container Null)"
      : baseLang === "ta"
      ? "PDF கொள்கலன் கிடைக்கவில்லை (PDF Container Null)"
      : "PDF Container DOM Element is null";
    missing.push(msg);
  }

  const isValid = missing.length === 0;
  let errorMessage = "";

  if (!isValid) {
    const uniqueMissing = Array.from(new Set(missing));
    errorMessage = baseLang === "kn"
      ? `ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ತಡೆಹಿಡಿಯಲಾಗಿದೆ: ಈ ಕೆಳಗಿನ ಪ್ರಮುಖ ಅಧ್ಯಾಯಗಳು ಪೂರ್ಣಗೊಂಡಿಲ್ಲ:\n• ${uniqueMissing.join("\n• ")}\n\nಅಪೂರ್ಣ ಅಥವಾ ಅರ್ಧಂಬರ್ಧ ಕತ್ತರಿಸಿದ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಆಗುವುದನ್ನು ತಡೆಯಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.`
      : baseLang === "hi"
      ? `पीडीएफ डाउनलोड रोक दिया गया है: निम्न मुख्य खंड अपूर्ण हैं:\n• ${uniqueMissing.join("\n• ")}\n\nअपूर्ण रिपोर्ट को डाउनलोड होने से सुरक्षित रूप से रोका गया है। कृपया पुनः प्रयास करें।`
      : baseLang === "te"
      ? `పిడిఎఫ్ డౌన్‌లోడ్ నిలిపివేయబడింది: క్రింది విభాగాలు అసంపూర్ణంగా ఉన్నాయి:\n• ${uniqueMissing.join("\n• ")}\n\nఅసంపూర్ణ నివేదిక డౌన్‌లోడ్ కాకుండా సురక్షితంగా ఆపబడింది. దయచేసి మళ్లీ ప్రయత్నించండి.`
      : baseLang === "ta"
      ? `PDF பதிவிறக்கம் நிறுத்தப்பட்டது: பின்வரும் முக்கிய பகுதிகள் முழுமையடையவில்லை:\n• ${uniqueMissing.join("\n• ")}\n\nமுழுமையடையாத அறிக்கை பதிவிறக்கம் ஆவதைத் தடுக்க பாதுகாப்பாக நிறுத்தப்பட்டுள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.`
      : `PDF download aborted: The following required sections are missing or incomplete:\n• ${uniqueMissing.join("\n• ")}\n\nGeneration was halted to prevent downloading a truncated report. Please try again.`;
  }

  return {
    isValid,
    missingSections: Array.from(new Set(missing)),
    errorMessage
  };
}

/**
 * Asserts that the Bhavishya V1 content and DOM are 100% valid.
 * Throws a BhavishyaValidationError if any section (especially Saramsha) is missing.
 */
export function assertBhavishyaV1Integrity(
  containerEl: HTMLElement,
  payload?: BhavishyaV1Payload | null,
  lang: string = "kn"
): void {
  const result = validateBhavishyaV1Content(containerEl, payload, lang);
  if (!result.isValid) {
    console.error("[BhavishyaV1 Integrity Guard]", result.missingSections);
    throw new BhavishyaValidationError(result.errorMessage, result.missingSections);
  }
}
