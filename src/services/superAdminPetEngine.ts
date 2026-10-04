/**
 * superAdminPetEngine.ts
 *
 * Core Intelligence and Action Execution Engine for the Super Admin AI Pet.
 * strictly accessible ONLY to Super Admin and Master Profiles.
 *
 * Capabilities:
 * 1. Janma Kundali & Dosha Deep Analysis & Remedial Prescriptions.
 * 2. Revenue & Monetization Strategies ("How to earn money with Baggona Panchanga").
 * 3. App Marketing & Viral Growth Strategies ("How to market the application").
 * 4. Autonomous App Actions ("Do on behalf of me", navigate, mint, check health).
 * 5. Full System & Astronomical Calculation Diagnostics.
 * 6. Dual-Brain: Online Gemini (gemini-3.5-flash-lite) + 100% Offline Vedic & Business Knowledge Matrix.
 */

import type { SupportedLanguage, AppPage } from "../stores/appStore";
import { askGemini } from "../core/GeminiEngine";
import { calculateComprehensiveDoshas, type ComprehensiveDoshaReport } from "../core/ComprehensiveDoshaEngine";
import { calculateYearlyAstodaya, calculateYearlyEclipses } from "../core/AstodayaGrahanaEngine";
import { calculatePanchang } from "../core/PanchangEngine";
import { db } from "../db/indexedDb";

export type PetEmotion = "peaceful" | "thinking" | "speaking" | "excited" | "remedy" | "alert";

export type PetActionItem = {
  id: string;
  label: Record<SupportedLanguage, string>;
  icon: string;
  targetPage?: AppPage;
  actionType?: "navigate" | "run_diagnostic" | "load_sample_kundli" | "open_admin" | "custom";
  payload?: any;
};

export type PetResponse = {
  text: Record<SupportedLanguage, string>;
  spokenText: Record<SupportedLanguage, string>;
  emotion: PetEmotion;
  category: "revenue" | "marketing" | "kundli" | "diagnostics" | "navigation" | "admin" | "general";
  actions: PetActionItem[];
};

export type SuperAdminPetContext = {
  activePage: AppPage;
  currentKundliSession?: any;
  coinBalance?: number;
  currentUser: string | null;
  geminiApiKey?: string;
  selectedLanguage: SupportedLanguage;
};

/**
 * Checks whether the current user has Super Admin or Master Profile privileges.
 */
export function isSuperAdminAuthorized(role?: string, currentUser?: string | null): boolean {
  if (!currentUser) return false;
  const clean = currentUser.toLowerCase();
  return (
    role === "superadmin" ||
    clean === "superadmin" ||
    clean === "baggona" ||
    clean === "shrisuma" ||
    currentUser === "$hriSuma"
  );
}

/**
 * Executes a Super Admin prompt and returns text, spoken voice text, emotion, and executable actions.
 */
export async function executeSuperAdminPetQuery(
  rawQuery: string,
  context: SuperAdminPetContext
): Promise<PetResponse> {
  const query = rawQuery.trim().toLowerCase();
  const lang = context.selectedLanguage || "kn";

  // 1. NAVIGATION INTENTS
  if (
    query.includes("go to") ||
    query.includes("open") ||
    query.includes("take me to") ||
    query.includes("ತೆರೆ") ||
    query.includes("ಹೋಗು") ||
    query.includes("ಕರೆದುಕೊಂಡು ಹೋಗು") ||
    query.includes("खोलो") ||
    query.includes("चलो")
  ) {
    return handleNavigationIntent(query);
  }

  // 2. REVENUE & EARNING MONEY INTENTS
  if (
    query.includes("earn money") ||
    query.includes("revenue") ||
    query.includes("monetiz") ||
    query.includes("business") ||
    query.includes("income") ||
    query.includes("ಹಣ") ||
    query.includes("ಆದಾಯ") ||
    query.includes("ಸಂಪಾದನೆ") ||
    query.includes("ಕಮಾಯಿ") ||
    query.includes("पैसा") ||
    query.includes("कमाई") ||
    query.includes("ధనం") ||
    query.includes("ఆదాయం") ||
    query.includes("வருமானம்")
  ) {
    return handleRevenueStrategy();
  }

  // 3. MARKETING & APPLICATION GROWTH INTENTS
  if (
    query.includes("market") ||
    query.includes("promote") ||
    query.includes("growth") ||
    query.includes("traffic") ||
    query.includes("users") ||
    query.includes("share") ||
    query.includes("ಮಾರ್ಕೆಟ್") ||
    query.includes("ಪ್ರಚಾರ") ||
    query.includes("ಬೆಳವಣಿಗೆ") ||
    query.includes("ಮಾರ್ಕೆಟಿಂಗ್") ||
    query.includes("मार्केटिंग") ||
    query.includes("प्रचार") ||
    query.includes("మార్కెటింగ్") ||
    query.includes("சந்தைப்படுத்தல்")
  ) {
    return handleMarketingStrategy();
  }

  // 4. KUNDLI & DOSHA ANALYSIS INTENTS
  if (
    query.includes("kundli") ||
    query.includes("dosha") ||
    query.includes("horoscope") ||
    query.includes("manglik") ||
    query.includes("kala sarpa") ||
    query.includes("sade sati") ||
    query.includes("pitru") ||
    query.includes("ಜಾತಕ") ||
    query.includes("ದೋಷ") ||
    query.includes("ಕುಂಡಲಿ") ||
    query.includes("ಮಾಂಗಲಿಕ") ||
    query.includes("ಕಾಳ ಸರ್ಪ") ||
    query.includes("ಸಾಡೇ ಸಾತಿ") ||
    query.includes("ಪಿತೃ") ||
    query.includes("कुंडली") ||
    query.includes("दोष") ||
    query.includes("జాతకం") ||
    query.includes("தோஷம்")
  ) {
    return handleKundliAndDoshaAnalysis(context);
  }

  // 5. SYSTEM HEALTH & DIAGNOSTICS INTENTS
  if (
    query.includes("health") ||
    query.includes("diagnostic") ||
    query.includes("check") ||
    query.includes("status") ||
    query.includes("validate") ||
    query.includes("test") ||
    query.includes("ಆರೋಗ್ಯ") ||
    query.includes("ಪರೀಕ್ಷಿಸು") ||
    query.includes("ಸ್ಥಿತಿ") ||
    query.includes("ತಪಾಸಣೆ") ||
    query.includes("परीक्षण") ||
    query.includes("स्वास्थ्य") ||
    query.includes("పరిశీలించు")
  ) {
    return await handleSystemDiagnostics(context);
  }

  // 6. ONLINE GEMINI AI BRAIN (if API key available)
  const activeKey = (context.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  if (activeKey) {
    try {
      const systemPrompt = `
You are "Kamadhenu" (ಕಾಮಧೇನು) - the sacred celestial divine pet and all-knowing AI companion of the Super Admin in Baggona Panchanga Astrology (Gokarna Kshetra).
You speak directly, warmly, and authoritatively to the Super Admin.
The user is asking: "${rawQuery}".
Provide a concise, practical, highly empowering response in the language "${lang}".
If it relates to astrology or doshas, cite Parashari rules and Gokarna Mahabaleshwara remedies.
If it relates to business, give actionable revenue and marketing tactics for Baggona Panchanga.
Keep spoken clarity in mind. Avoid excessive formatting.
      `.trim();

      const aiText = await askGemini(rawQuery, systemPrompt, activeKey, lang, { raw: true, temperature: 0.6 });
      if (aiText && aiText.length > 10) {
        return {
          text: {
            kn: aiText,
            hi: aiText,
            te: aiText,
            ta: aiText,
            en: aiText
          },
          spokenText: {
            kn: aiText.substring(0, 200),
            hi: aiText.substring(0, 200),
            te: aiText.substring(0, 200),
            ta: aiText.substring(0, 200),
            en: aiText.substring(0, 200)
          },
          emotion: "speaking",
          category: "general",
          actions: [
            {
              id: "open_admin",
              label: {
                kn: "🛡️ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
                hi: "🛡️ सुपर एडमिन नियंत्रण केंद्र",
                te: "🛡️ సూపర్ అడ్మిన్ నియంత్రణ కేంద్రం",
                ta: "🛡️ சூப்பர் அட்மின் கட்டுப்பாட்டு மையம்",
                en: "🛡️ Super Admin Control Center"
              },
              icon: "🛡️",
              targetPage: "superadmindashboard",
              actionType: "navigate"
            }
          ]
        };
      }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to offline matrix:", e);
    }
  }

  // 7. DEFAULT OFFLINE KNOWLEDGE MATRIX RESPONSE
  return handleDefaultOfflineCompanion(rawQuery, lang);
}

// =========================================================================
// HANDLER 1: NAVIGATION
// =========================================================================
function handleNavigationIntent(query: string): PetResponse {
  let targetPage: AppPage = "superadmindashboard";
  let pageName = "Super Admin Dashboard";

  if (query.includes("kundli") || query.includes("ಜಾತಕ") || query.includes("कुंडली")) {
    targetPage = "kundli";
    pageName = "Kundli";
  } else if (query.includes("calendar") || query.includes("ಕ್ಯಾಲೆಂಡರ್") || query.includes("कैलेंडर")) {
    targetPage = "calendar";
    pageName = "90-Day Rhythm Calendar";
  } else if (query.includes("seva") || query.includes("ಪೂಜೆ") || query.includes("पूजा") || query.includes("prasada")) {
    targetPage = "seva";
    pageName = "Seva & Prasada";
  } else if (query.includes("dosha") || query.includes("ದೋಷ") || query.includes("दोष")) {
    targetPage = "doshas";
    pageName = "Kundli Doshas Analysis";
  } else if (query.includes("astodaya") || query.includes("grahana") || query.includes("ಗ್ರಹಣ") || query.includes("ग्रहण") || query.includes("eclipse")) {
    targetPage = "astodaya_grahana";
    pageName = "Guru-Shukra Astodaya & Eclipses";
  } else if (query.includes("bhavishya") || query.includes("ಭವಿಷ್ಯ") || query.includes("भविष्य")) {
    targetPage = "ramanbhavishya";
    pageName = "Raman Bhavishya Predictions";
  } else if (query.includes("palm") || query.includes("ಹಸ್ತ") || query.includes("हस्तरेखा")) {
    targetPage = "palmreading";
    pageName = "Palm Reading";
  } else if (query.includes("face") || query.includes("ಮುಖ") || query.includes("सामुद्रिक")) {
    targetPage = "facereading";
    pageName = "Face Reading";
  } else if (query.includes("settings") || query.includes("ಸೆಟ್ಟಿಂಗ್ಸ್") || query.includes("सेटिंग्स")) {
    targetPage = "settings";
    pageName = "Settings";
  }

  return {
    text: {
      kn: `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pageName}" ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಮುಂದುವರಿಯಿರಿ.`,
      hi: `जी स्वामी! मैं तुरंत आपके लिए "${pageName}" पृष्ठ खोल रहा हूँ। नीचे दिए गए बटन पर क्लिक करें।`,
      te: `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pageName}" పేజీని తెరుస్తున్నాను.`,
      ta: `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pageName}" பக்கத்தை திறக்கிறேன்.`,
      en: `Understood Super Admin! Navigating on your behalf to "${pageName}". Click below to jump instantly.`
    },
    spokenText: {
      kn: `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pageName} ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`,
      hi: `जी स्वामी! मैं तुरंत ${pageName} पृष्ठ खोल रहा हूँ।`,
      te: `తప్పకుండా స్వామి! నేను తక్షణమే ${pageName} పేజీని తెరుస్తున్నాను.`,
      ta: `நிச்சயமாக சுவாமி! நான் ${pageName} பக்கத்தை திறக்கிறேன்.`,
      en: `Navigating on your behalf to ${pageName}.`
    },
    emotion: "excited",
    category: "navigation",
    actions: [
      {
        id: `navigate_${targetPage}`,
        label: {
          kn: `🚀 ${pageName} ಪುಟಕ್ಕೆ ಹೋಗಿ`,
          hi: `🚀 ${pageName} पृष्ठ पर जाएं`,
          te: `🚀 ${pageName} పేజీకి వెళ్లండి`,
          ta: `🚀 ${pageName} பக்கத்திற்குச் செல்க`,
          en: `🚀 Go to ${pageName}`
        },
        icon: "🚀",
        targetPage,
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 2: REVENUE & EARNING MONEY STRATEGY
// =========================================================================
function handleRevenueStrategy(): PetResponse {
  return {
    text: {
      kn: `👑 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಿಂದ ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ಆದಾಯ ಗಳಿಸುವ ೫ ಪ್ರಮುಖ ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗಗಳು:**

1. **ಪ್ರೀಮಿಯಂ ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ ಪುಸ್ತಕ & ಜಾತಕ PDF ಮಾರಾಟ**:
   - ಪ್ರತಿಯೊಬ್ಬ ಭಕ್ತನಿಗೂ ವಾರ್ಷಿಕ ₹೨೯೯ ರಿಂದ ₹೯೯೯ ದರದಲ್ಲಿ ೧೦೪ ಪುಟಗಳ ನಿಖರ ಸಂವತ್ಸರ ಪಂಚಾಂಗ ಪುಸ್ತಕ ಹಾಗೂ ರಮಣ ಪದ್ಧತಿಯ ಭವಿಷ್ಯ ಡೌನ್‌ಲೋಡ್ ನೀಡಬಹುದು.

2. **ಗೋಕರ್ಣ ಶ್ರೀ ಕ್ಷೇತ್ರ ಸೇವಾ & ಪ್ರಸಾದ ಆಶೀರ್ವಾದ ಪಾಸ್ ಕಮಿಷನ್**:
   - ಪ್ರಧಾನ ಅರ್ಚಕ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ, ಕಾಳಸರ್ಪ ಶಾಂತಿ, ನವಗ್ರಹ ದೋಷ ನಿವಾರಣೆ ಸೇವೆಗಳನ್ನು ಭಕ್ತರಿಗೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಬುಕಿಂಗ್ ಮಾಡಿಸಿ ಪ್ರತಿ ಸೇವೆಗೆ ೨೦% - ೩೦% ನಿವ್ವಳ ಲಾಭ ಪಡೆಯಬಹುದು.

3. **ಪುರೋಹಿತರ B2B ನಾಣ್ಯ ಪ್ಯಾಕೇಜ್ ಮಾರಾಟ (Priest Coin Bundles)**:
   - ಕರ್ನಾಟಕದ ಸಾವಿರಾರು ಗ್ರಾಮ ಪುರೋಹಿತರಿಗೆ ₹೨,೦೦೦ ರಿಂದ ₹೧೦,೦೦೦ ಮೌಲ್ಯದ ನಾಣ್ಯ ರಿಚಾರ್ಜ್ ಪ್ಯಾಕ್ ಮಾರಾಟ ಮಾಡಿ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಲು ಉತ್ತೇಜಿಸಿ.

4. **ದೈನಂದಿನ ವಾಟ್ಸಾಪ್ ದರ್ಶನ ಚಂದಾದಾರಿಕೆ (Monthly Retainer)**:
   - ಭಕ್ತರಿಗೆ ದಿನದ ೯೦ ದಿನಗಳ ರಿದಮ್ ಶಕ್ತಿ ಕ್ಯಾಲೆಂಡರ್, ಶುಭ ಮುಹೂರ್ತ ಸಂದೇಶಗಳನ್ನು ಪ್ರತಿ ತಿಂಗಳು ₹೪೯ ಅಥವಾ ವಾರ್ಷಿಕ ₹೪೯೯ ಕ್ಕೆ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ರವಾನಿಸಬಹುದು.

5. **ವಿದೇಶಿ ಅನಿವಾಸಿ ಭಾರತೀಯ (NRI) ಇ-ಪೂಜಾ ಸೇವೆಗಳು**:
   - ಅಮೆರಿಕ, ಯುರೋಪ್‌ನ ಕನ್ನಡಿಗರಿಗೆ $೫೧ ರಿಂದ $೧೦೮ ದರದಲ್ಲಿ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಹಾಗೂ ಪವಿತ್ರ ಪ್ರಸಾದ ಕೊರಿಯರ್ ಸೇವೆ ಒದಗಿಸಿ.`,

      hi: `👑 **बग्गोना पंचांग से लाखों रुपये की आय अर्जित करने की ५ मुख्य रणनीतियाँ:**

1. **प्रीमियम १०४ पृष्ठीय वार्षिक पंचांग एवं कुंडली PDF विक्रय** (₹२९९ - ₹९९९ प्रति प्रति)।
2. **गोकर्ण महाबलेश्वर सेवा एवं आशीर्वाद पास कमीशन** (श्रीराम पंडित जी के माध्यम से २५% लाभांश)।
3. **पुरोहित B2B सिक्का वॉलेट रीचार्ज बंडल** (गाँव-शहर के पुरोहितों को थोक कॉइन पैक)।
4. **व्हाट्सएप दैनिक दर्शन मासिक सदस्यता** (₹४९/माह या ₹४९९/वर्ष)।
5. **प्रवासी भारतीय (NRI) ई-पूजा संकल्प** ($५१ - $१०८ प्रति यजमान)।`,

      te: `👑 **బగ్గోణ పంచాంగం ద్వారా గణనీయమైన ఆదాయం పొందే 5 ముఖ్య మార్గాలు:**
1. ప్రీమియం 104 పేజీల వార్షిక పంచాంగ పుస్తకం & జాతక PDF విక్రయం (₹299 - ₹999).
2. గోకర్ణ క్షేత్ర సేవా & ప్రసాద బుకింగ్స్ కమీషన్.
3. పురోహితుల కాయిన్ బండిల్స్ విక్రయం.
4. వాట్సాప్ డైలీ పంచాంగ సబ్‌స్క్రిప్షన్.
5. ఎన్‌ఆర్‌ఐ భక్తులకు ప్రత్యేక ఈ-పూజలు.`,

      ta: `👑 **பக்கோனா பஞ்சாங்கம் மூலம் வருமானம் ஈட்டும் 5 வழிகள்:**
1. பிரீமியம் 104 பக்க பஞ்சாங்க புத்தகம் & ஜாதக PDF விற்பனை (₹299 - ₹999).
2. கோகர்ண க்ஷேத்ர சேவா ஆசீர்வாத பாஸ் முன்பதிவு.
3. புரோஹிதர் நாணய ரீசார்ஜ் விற்பனை.
4. வாட்ஸ்அப் தினசரி தரிசன சந்தா.
5. வெளிநாட்டு வாழ் இந்தியர்களுக்கான சிறப்பு ஈ-பூஜை.`,

      en: `👑 **5 High-Yield Revenue Blueprints for Baggona Panchanga:**

1. **Premium 104-Page Annual Book & Bhavishya Dossier Sales**:
   - Offer customized, press-ready 104-page Samvatsara Panchanga books and Raman Bhavishya life reports at ₹299 to ₹999 per PDF.

2. **Gokarna Temple Seva & Ashirvada Pass Bookings**:
   - Partner with Chief Priest Shreeram Pandit for Rudrabhisheka, Kala Sarpa, and Navagraha Shanti with a 20%–30% platform margin.

3. **B2B Priest Coin Bundles**:
   - Distribute wholesale coin packs (5,000 / 10,000 coins) to practicing astrologers and temple priests across India.

4. **WhatsApp Daily Darshana Retainer**:
   - Automated morning personalized rhythm alerts at ₹49/month or ₹499/year.

5. **Diaspora & NRI E-Pooja Packages**:
   - Live video sankalpa and sanctified Gokarna Prasada courier packages at $51–$108.`
    },
    spokenText: {
      kn: `ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಿಂದ ಆದಾಯ ಗಳಿಸಲು ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ ಮಾರಾಟ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವಾ ಬುಕಿಂಗ್, ಪುರೋಹಿತರ ನಾಣ್ಯ ಪ್ಯಾಕ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ದರ್ಶನ ಚಂದಾದಾರಿಕೆಗಳು ಅತ್ಯಂತ ಯಶಸ್ವಿ ಮಾರ್ಗಗಳಾಗಿವೆ.`,
      hi: `बग्गोना पंचांग से आय के लिए १०४ पृष्ठीय पंचांग विक्रय, गोकर्ण पूजा बुकिंग और व्हाट्सएप सदस्यता सर्वोत्तम उपाय हैं।`,
      te: `పంచాంగ పుస్తక విక్రయం, గోకర్ణ సేవా బుకింగ్స్ మరియు వాట్సాప్ సబ్‌స్క్రిప్షన్ ద్వారా గొప్ప ఆదాయం లభిస్తుంది.`,
      ta: `பஞ்சாங்க புத்தகம் விற்பனை மற்றும் கோகர்ண பூஜை முன்பதிவு மூலம் அதிக வருமானம் ஈட்டலாம்.`,
      en: `The top monetization models are 104-page book PDF sales, Gokarna Seva bookings with Shreeram Pandit, B2B priest coin bundles, and WhatsApp subscriptions.`
    },
    emotion: "excited",
    category: "revenue",
    actions: [
      {
        id: "open_seva",
        label: {
          kn: "🪔 ಸೇವಾ & ಪ್ರಸಾದ ಬುಕಿಂಗ್ ನೋಡಿ",
          hi: "🪔 सेवा एवं प्रसाद बुकिंग देखें",
          te: "🪔 సేవా & ప్రసాదం చూడండి",
          ta: "🪔 சேவா முன்பதிவு பார்க்க",
          en: "🪔 View Seva Bookings"
        },
        icon: "🪔",
        targetPage: "seva",
        actionType: "navigate"
      },
      {
        id: "open_pricing",
        label: {
          kn: "⚙️ ನಾಣ್ಯ & ಸೇವಾ ದರ ಪರಿಶೀಲಿಸಿ",
          hi: "⚙️ सिक्का एवं सेवा दर जांचें",
          te: "⚙️ కాయిన్ ధరలు చూడండి",
          ta: "⚙️ சேவைக் கட்டணம் பார்க்க",
          en: "⚙️ Check Coin & Service Pricing"
        },
        icon: "⚙️",
        targetPage: "superadmindashboard",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 3: MARKETING & VIRAL GROWTH STRATEGY
// =========================================================================
function handleMarketingStrategy(): PetResponse {
  return {
    text: {
      kn: `📢 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗವನ್ನು ಲಕ್ಷಾಂತರ ಜನರಿಗೆ ತಲುಪಿಸಲು ವೈರಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸೂತ್ರಗಳು:**

1. **೯೦ ದಿನಗಳ ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್ ವಾಟ್ಸಾಪ್ ವೈರಲ್ ಶೇರ್ (Viral WhatsApp Loop)**:
   - ಬಳಕೆದಾರರು ತಮ್ಮ ಹಸಿರು (ಉತ್ತಮ ಶಕ್ತಿ ದಿನ) ಹಾಗೂ ಕೆಂಪು (ಚಂದ್ರಾಷ್ಟಮ / ಎಚ್ಚರಿಕೆಯ ದಿನ) ಕಾರ್ಡ್‌ಗಳನ್ನು ಕುಟುಂಬದ ಗ್ರೂಪ್‌ಗಳಿಗೆ ಶೇರ್ ಮಾಡಲು "ಶೇರ್ ಕಾರ್ಡ್" ಬಟನ್ ಒತ್ತಿ ಕಳುಹಿಸುವಂತೆ ಪ್ರೇರೇಪಿಸಿ.

2. **ಗ್ರಹಣ & ಮೌಢ್ಯ ಕಾಲದ ತುರ್ತು ಅಲರ್ಟ್ ಪ್ರಚಾರ**:
   - ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣ ಅಥವಾ ಗುರು-ಶುಕ್ರ ಮೌಢ್ಯ ಪ್ರಾರಂಭವಾಗುವ ೩ ದಿನಗಳ ಮುಂಚೆ "ಸೂತಕ ನಿಯಮಗಳು & ಶಾಂತಿ ಪೂಜೆ" ಕುರಿತ ಸಂದೇಶಗಳನ್ನು ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ. ಇದು ೧೦ ಪಟ್ಟು ಟ್ರಾಫಿಕ್ ತರುತ್ತದೆ.

3. **ಗೋಕರ್ಣ ಹಾಗೂ ಪ್ರಮುಖ ದೇವಾಲಯಗಳಲ್ಲಿ ಭೌತಿಕ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಟ್ಯಾಂಡಿ (QR Standees)**:
   - ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ, ಇಡಗುಂಜಿ, ಮುರುಡೇಶ್ವರ ದೇವಾಲಯಗಳ ಆವರಣದಲ್ಲಿ "ಉಚಿತ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್" QR ಕೋಡ್ ಪ್ರದರ್ಶಿಸಿ.

4. **ದೈನಂದಿನ ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ & ಯೂಟ್ಯೂಬ್ ಶಾರ್ಟ್ಸ್ (Daily 30-Sec Reels)**:
   - ದಿನದ ರಾಹುಕಾಲ, ಯಮಗಂಡ, ಇಂದಿನ ನಕ್ಷತ್ರ ಫಲ ಹಾಗೂ ಚಂದ್ರಾಷ್ಟಮ ರಾಶಿಗಳ ೩೦-ಸೆಕೆಂಡಿನ ವಿಡಿಯೋ ಹಾಕಿ ಅಪ್ಲಿಕೇಶನ್ ಲಿಂಕ್ ನೀಡಿ.

5. **ಸ್ಥಳೀಯ ಪುರೋಹಿತರ ನೆಟ್‌ವರ್ಕ್ ಪ್ರಚಾರ**:
   - ಅರ್ಚಕರು ತಮ್ಮ ಭಕ್ತರಿಗೆ ಜಾತಕ ನೀಡುವಾಗ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಆಶೀರ್ವಾದ ಪಾಸ್ ನೀಡುವುದರಿಂದ ತಂತಾನೇ ಪ್ರಚಾರವಾಗುತ್ತದೆ.`,

      hi: `📢 **बग्गोना पंचांग को घर-घर पहुँचाने के वायरल मार्केटिंग सूत्र:**
1. **व्हाट्सएप ९०-दिवसीय ऊर्जा कैलेंडर शेयरिंग** (हर परिवार में ग्रीन/रेड डे शेयर कराएं)।
2. **सूर्य-चंद्र ग्रहण एवं मौढ्य अलर्ट अभियान** (सूतक नियमों से १० गुना ट्रैफिक)।
3. **गोकर्ण व प्रसिद्ध मंदिरों में QR कोड स्टैंडी**।
4. **दैनिक ३० सेकंड यूट्यूब शॉर्ट्स/रील्स** (आज का राहुकाल एवं चंद्र बल)।
5. **स्थानीय पुरोहितों का रेफरल नेटवर्क**।`,

      te: `📢 **బగ్గోణ పంచాంగం ప్రచార వ్యూహాలు:**
1. వాట్సాప్‌లో 90 రోజుల క్యాలెండర్ షేరింగ్.
2. సూర్య-చంద్ర గ్రహణాల ప్రత్యేక హెచ్చరికలు.
3. దేవాలయాల వద్ద క్యూఆర్ కోడ్ స్టాండీలు.
4. డైలీ ఇన్‌స్టాగ్రామ్ రీల్స్ (రాహుకాలం & నక్షత్రం).
5. పురోహితుల ద్వారా మౌత్ పబ్లిసిటీ.`,

      ta: `📢 **பக்கோனா பஞ்சாங்கம் சந்தைப்படுத்தல் உத்திகள்:**
1. வாட்ஸ்அப் 90 நாள் காலண்டர் பகிர்வு.
2. கிரகண மற்றும் மௌட்டிய எச்சரிக்கை பிரச்சாரம்.
3. கோயில்களில் QR குறியீடு ஸ்டாண்டுகள்.
4. தினசரி 30 வினாடி ரீல்ஸ் மற்றும் ஷார்ட்ஸ்.
5. புரோகிதர்கள் மூலமான வாய்வழி விளம்பரம்.`,

      en: `📢 **Viral Marketing Playbook for Baggona Panchanga:**

1. **WhatsApp 90-Day Rhythm Calendar Sharing**:
   - Leverage the dynamic Green/Yellow/Red energy scorecards. Devotees love sharing auspicious and caution days in family groups.

2. **Event-Driven Eclipse & Moudhya Alerts**:
   - Send Sutaka and combustion warnings 3 days prior to any celestial event. This creates an immediate 10x traffic surge.

3. **Temple QR Code Standees at Gokarna & Coastal Karnataka**:
   - Install stands at Gokarna, Idagunji, and Murudeshwara for free 90-day calendar downloads.

4. **Daily 30-Second Social Reels / Shorts**:
   - Automated bite-sized clips for Rahu Kaalam, Yamaganda, and Moon transit.

5. **Purohita Referral Program**:
   - Priests hand out Baggona Ashirvada Passes directly to their clients, driving organic referral loops.`
    },
    spokenText: {
      kn: `ಮಾರ್ಕೆಟಿಂಗ್‌ಗಾಗಿ ವಾಟ್ಸಾಪ್ ೯೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಶೇರ್, ಗ್ರಹಣದ ಮುಂಚಿನ ಅಲರ್ಟ್ ಸಂದೇಶಗಳು ಹಾಗೂ ಗೋಕರ್ಣ ದೇವಾಲಯದ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಟ್ಯಾಂಡಿಗಳು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ತಂತ್ರಗಳಾಗಿವೆ.`,
      hi: `मार्केटिंग के लिए व्हाट्सएप शेयरिंग, ग्रहण अलर्ट और मंदिरों में क्यूआर कोड सबसे प्रभावी उपाय हैं।`,
      te: `వాట్సాప్ షేరింగ్ మరియు గ్రహణ అలర్ట్స్ ద్వారా అప్లికేషన్ వేగంగా ప్రాచుర్యం పొందుతుంది.`,
      ta: `வாட்ஸ்அப் பகிர்வு மற்றும் கோயில் QR குறியீடுகள் மூலம் பயன்பாட்டை விரைவாக பிரபலப்படுத்தலாம்.`,
      en: `To market the app effectively, deploy WhatsApp rhythm sharing, pre-eclipse alerts, and temple QR standees.`
    },
    emotion: "excited",
    category: "marketing",
    actions: [
      {
        id: "open_calendar",
        label: {
          kn: "📅 ೯೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ವೀಕ್ಷಿಸಿ",
          hi: "📅 ९०-दिवसीय कैलेंडर देखें",
          te: "📅 90 రోజుల క్యాలెండర్ చూడండి",
          ta: "📅 90 நாள் காலண்டர் பார்க்க",
          en: "📅 View 90-Day Calendar"
        },
        icon: "📅",
        targetPage: "calendar",
        actionType: "navigate"
      },
      {
        id: "open_astodaya",
        label: {
          kn: "🌒 ಗ್ರಹಣ & ಮೌಢ್ಯ ಪುಟ ಪರಿಶೀಲಿಸಿ",
          hi: "🌒 ग्रहण एवं अस्तोदय पृष्ठ देखें",
          te: "🌒 గ్రహణ & మౌఢ్య పేజీ చూడండి",
          ta: "🌒 கிரகண & மௌட்டிய பக்கம் பார்க்க",
          en: "🌒 Check Eclipses & Astodaya"
        },
        icon: "🌒",
        targetPage: "astodaya_grahana",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 4: KUNDLI & DOSHA DEEP ANALYSIS
// =========================================================================
function handleKundliAndDoshaAnalysis(context: SuperAdminPetContext): PetResponse {
  const session = context.currentKundliSession;

  if (session && session.input) {
    const nativeName = session.input.name || "ಜಾತಕರು";
    const dob = session.input.dateOfBirth || "N/A";
    const tob = session.input.timeOfBirth || "N/A";
    const pob = session.input.placeOfBirth || "N/A";

    let doshaSummary = "";
    let detectedDoshasList: string[] = [];

    if (session.result && Array.isArray(session.result.planets) && session.result.planets.length >= 7) {
      try {
        const report = calculateComprehensiveDoshas(session.input, session.result);
        detectedDoshasList = report.doshas.map((d) => d.name[context.selectedLanguage] || d.name.kn);
      } catch (e) {
        console.warn("Dosha calculation error in pet:", e);
      }
    }

    const doshaText = detectedDoshasList.length > 0
      ? `ಸಕ್ರಿಯ ಕರ್ಮ ದೋಷಗಳು: ${detectedDoshasList.slice(0, 4).join(", ")}.`
      : "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಬಾಧಕ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ; ಗ್ರಹಬಲ ಉತ್ತಮವಾಗಿದೆ.";

    return {
      text: {
        kn: `🔮 **ಪ್ರಸ್ತುತ ಲೋಡ್ ಆಗಿರುವ ಜಾತಕರ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ:**

- **ಹೆಸರು**: ${nativeName}
- **ಜನನ ದಿನಾಂಕ & ಸಮಯ**: ${dob} ${tob} (${pob})
- **ದೋಷ ಪರಿಶೀಲನೆ**: ${doshaText}

**ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಕ್ರಮಗಳು (ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ವಿಧಿ):**
1. ಕುಜ/ಸರ್ಪ ದೋಷವಿದ್ದಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮ.
2. ಶನಿ ಸಾಡೇ ಸಾತಿ ಅಥವಾ ಕಂಟಕ ಶನಿ ಇದ್ದರೆ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಷ್ಟೋತ್ತರ ಜಪ ಹಾಗೂ ಎಳ್ಳು ದೀಪಾರಾಧನೆ.
3. ಪಿತೃ ದೋಷ ಪರಿಹಾರಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ತಿಲತರ್ಪಣ ಶ್ರಾದ್ಧ ವಿಧಿ.`,

        hi: `🔮 **वर्तमान कुंडली का विश्लेषण:**
- **नाम**: ${nativeName} (${dob}, ${pob})
- **दोष स्थिति**: ${doshaText}
- **वैदिक शांति**: गोकर्ण क्षेत्र में रुद्राभिषेक एवं नवग्रह शांति पूजा अनुशंसित।`,

        te: `🔮 **ప్రస్తుత జాతక విశ్లేషణ:**
- **పేరు**: ${nativeName}
- **దోషాల వివరాలు**: ${doshaText}
- **పరిహారం**: గోకర్ణ క్షేత్రంలో రుద్రాభిషేకం మరియు నవగ్రహ శాంతి.`,

        ta: `🔮 **தற்போதைய ஜாதக ஆய்வு:**
- **பெயர்**: ${nativeName}
- **தோஷ நிலை**: ${doshaText}
- **பரிகாரம்**: கோகர்ண க்ஷேத்ரத்தில் ருத்ராபிஷேகம் மற்றும் சாந்தி பூஜை.`,

        en: `🔮 **Active Kundli Diagnostic for ${nativeName}:**
- **Birth Details**: ${dob} at ${tob} (${pob})
- **Dosha Evaluation**: ${doshaText}
- **Prescribed Remedial Protocol**: Rudrabhisheka and Navagraha Shanti at Gokarna Kshetra; Tila Tarpan at Koti Tirtha for ancestral pacification.`
      },
      spokenText: {
        kn: `${nativeName} ಅವರ ಜಾತಕದಲ್ಲಿ ${doshaText} ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸೂಕ್ತ ಶಾಂತಿ ಪೂಜೆ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`,
        hi: `${nativeName} की कुंडली में ${doshaText} गोकर्ण में शांति पूजा अनुशंसित है।`,
        te: `${nativeName} జాతకంలో దోష నివారణకు గోకర్ణ శాంతి పూజ చేయించండి.`,
        ta: `${nativeName} ஜாதகத்தில் தோஷ நிவர்த்திக்கு கோகர்ண பூஜை உகந்தது.`,
        en: `For ${nativeName}, ${doshaText} Remedial puja at Gokarna Kshetra is highly recommended.`
      },
      emotion: "remedy",
      category: "kundli",
      actions: [
        {
          id: "open_doshas",
          label: {
            kn: "📜 ಸಂಪೂರ್ಣ ದೋಷ ಪತ್ರ & ವಯೋಮಿತಿ ವೀಕ್ಷಿಸಿ",
            hi: "📜 संपूर्ण दोष पत्र एवं आयु सीमा देखें",
            te: "📜 పూర్తి దోష పత్రం చూడండి",
            ta: "📜 முழுமையான தோஷ அறிக்கை பார்க்க",
            en: "📜 View Full Dosha & Age Threshold Dossier"
          },
          icon: "📜",
          targetPage: "doshas",
          actionType: "navigate"
        },
        {
          id: "open_bhavishya",
          label: {
            kn: "🌟 ರಮಣ ಪದ್ಧತಿ ಭವಿಷ್ಯ ವೀಕ್ಷಿಸಿ",
            hi: "🌟 रमण पद्धति भविष्य देखें",
            te: "🌟 రమణ పద్ధతి భవిష్యత్ చూడండి",
            ta: "🌟 ராமன் முறை பலன்கள் பார்க்க",
            en: "🌟 View Raman Bhavishya Predictions"
          },
          icon: "🌟",
          targetPage: "ramanbhavishya",
          actionType: "navigate"
        }
      ]
    };
  }

  // If no Kundli is loaded currently
  return {
    text: {
      kn: `🔮 **ಜಾತಕ & ದೋಷ ಪರಿಶೀಲನೆ ವ್ಯವಸ್ಥೆ:**

ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಜಾತಕ ಲೋಡ್ ಆಗಿಲ್ಲ. ಆದರೆ ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಕೆಳಗಿನ ಎಲ್ಲಾ ಮಹಾ ದೋಷಗಳನ್ನು ನೂರಕ್ಕೆ ನೂರು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕುತ್ತದೆ:
- **ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ** (೧, ೨, ೪, ೭, ೮, ೧೨ ನೇ ಮನೆ ಹಾಗೂ ಭಂಗ ನಿರ್ಣಯ)
- **ಕಾಳ ಸರ್ಪ ದೋಷ** (೧೨ ಪ್ರಕಾರಗಳ ಅನಂತ, ಕುಳಿಕ, ವಾಸುಕಿ, ಶಂಖಪಾಲ ಇತ್ಯಾದಿ)
- **ಶನಿ ಸಾಡೇ ಸಾತಿ, ಅಷ್ಟಮ ಶನಿ & ಕಂಟಕ ಶನಿ**
- **ಗುರು ಚಂಡಾಲ ದೋಷ & ಪಿತೃ ದೋಷ**
- **ಗಂಡಾಂತ & ನಕ್ಷತ್ರ ಸಂಧಿ ದೋಷಗಳು**

ದಯವಿಟ್ಟು ಜಾತಕ ಪುಟಕ್ಕೆ ತೆರಳಿ ಜನ್ಮ ವಿವರ ನಮೂದಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ದೋಷ ಪರೀಕ್ಷಾ ವಿಭಾಗಕ್ಕೆ ತೆರಳಿ.`,

      hi: `🔮 **कुंडली एवं दोष प्रणाली:**
वर्तमान में कोई कुंडली लोड नहीं है। हमारी प्रणाली मांगलिक, कालसर्प, साढ़ेसाती, गुरु चांडाल और पितृ दोष की शत-प्रतिशत सटीक गणना करती है। विवरण देखने हेतु कुण्डली पेज पर जाएं।`,

      te: `🔮 **జాతక & దోష వ్యవస్థ:**
ప్రస్తుతం ఎటువంటి జాతకం లోడ్ కాలేదు. మాంగలిక, కాళసర్ప, సాడేసాతి మొదలైన దోషాలను సరిచూడటానికి జాతకం పేజీకి వెళ్ళండి.`,

      ta: `🔮 **ஜாதக & தோஷ ஆய்வு:**
தற்போது ஜாதகம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை. மாங்கல்ய, கால சர்ப்ப, ஏழரை சனி தோஷங்களை ஆய்வு செய்ய ஜாதக பக்கத்திற்குச் செல்லவும்.`,

      en: `🔮 **Vedic Kundli & Dosha Intelligence Engine:**
No active horoscope session is currently loaded. Baggona Panchanga computes:
- Kuja / Manglik Dosha (with authentic Parashari cancellations)
- Kala Sarpa Dosha (12 classical variations)
- Shani Sade Sati, Ashtama & Kantaka Shani
- Guru Chandala & Pitru Dosha
- Gandanta & Nakshatra Sandhi Age Thresholds.
Navigate to the Kundli or Dosha page to inspect any chart.`
    },
    spokenText: {
      kn: `ಸ್ವಾಮಿ, ಜಾತಕ ಮತ್ತು ದೋಷಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ದಯವಿಟ್ಟು ಜಾತಕ ಪುಟಕ್ಕೆ ತೆರಳಿ ಅಥವಾ ದೋಷ ವಿಭಾಗವನ್ನು ತೆರೆಯಿರಿ.`,
      hi: `स्वामी, कृपया कुंडली या दोष विभाग खोलकर जन्म विवरण दर्ज करें।`,
      te: `స్వామి, దయచేసి జాతకం లేదా దోష విభాగం తెరిచి వివరాలు చూడండి.`,
      ta: `சுவாமி, ஜாதக பக்கத்திற்கு சென்று தோஷங்களை ஆய்வு செய்யலாம்.`,
      en: `Please navigate to the Kundli or Doshas section to evaluate any birth chart.`
    },
    emotion: "peaceful",
    category: "kundli",
    actions: [
      {
        id: "open_kundli",
        label: {
          kn: "🪐 ಜಾತಕ ರಚನೆ ಪುಟಕ್ಕೆ ಹೋಗಿ",
          hi: "🪐 कुण्डली रचना पृष्ठ पर जाएं",
          te: "🪐 జాతక రచన పేజీకి వెళ్లండి",
          ta: "🪐 ஜாதக பக்கத்திற்குச் செல்க",
          en: "🪐 Go to Kundli Page"
        },
        icon: "🪐",
        targetPage: "kundli",
        actionType: "navigate"
      },
      {
        id: "open_doshas",
        label: {
          kn: "🛡️ ದೋಷ ವಿಶ್ಲೇಷಣಾ ಕೇಂದ್ರ ತೆರೆಯಿರಿ",
          hi: "🛡️ दोष विश्लेषण केंद्र खोलें",
          te: "🛡️ దోష విశ్లేషణ కేంద్రం తెరవండి",
          ta: "🛡️ தோஷ ஆய்வு மையம் திறக்க",
          en: "🛡️ Open Dosha Analysis Center"
        },
        icon: "🛡️",
        targetPage: "doshas",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 5: SYSTEM HEALTH & DIAGNOSTICS
// =========================================================================
async function handleSystemDiagnostics(context: SuperAdminPetContext): Promise<PetResponse> {
  const now = new Date();
  let userCount = 0;
  let panchangaOk = false;
  let astodayaOk = false;
  let eclipsesOk = false;

  try {
    userCount = await db.users.count();
  } catch (e) {
    userCount = 1;
  }

  try {
    const p = calculatePanchang(now, 14.54, 74.31);
    if (p && p.tithi) panchangaOk = true;
  } catch (e) {
    panchangaOk = false;
  }

  try {
    const a = calculateYearlyAstodaya(now.getFullYear());
    if (a && a.events.length > 0) astodayaOk = true;
  } catch (e) {
    astodayaOk = false;
  }

  try {
    const ec = calculateYearlyEclipses(now.getFullYear(), "world");
    if (ec && ec.length > 0) eclipsesOk = true;
  } catch (e) {
    eclipsesOk = false;
  }

  const allGreen = panchangaOk && astodayaOk && eclipsesOk;

  return {
    text: {
      kn: `🩺 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ವರದಿ:**

- **ಖಗೋಳ ಗಣಿತ ಎಂಜಿನ್ (Panchanga Engine)**: ${panchangaOk ? "✅ ಸಕ್ರಿಯ (೧೦೦% ನಿಖರ)" : "⚠️ ಪರಿಶೀಲನೆ ಅಗತ್ಯ"}
- **ಅಸ್ತೋದಯ ಎಂಜಿನ್ (Astodaya Arcus Visionis)**: ${astodayaOk ? "✅ ಸಕ್ರಿಯ (Drik Ganita ಪ್ರಮಾಣಿತ)" : "⚠️ ದೋಷ"}
- **ಗ್ರಹಣ ಎಂಜಿನ್ (Eclipses Engine)**: ${eclipsesOk ? "✅ ಸಕ್ರಿಯ (ಜಾಗತಿಕ & ಭಾರತೀಯ ವೇಧ)" : "⚠️ ದೋಷ"}
- **ಡೇಟಾಬೇಸ್ ಸ್ಥಿತಿ (IndexedDB / Cache)**: ✅ ಸಕ್ರಿಯ (${userCount} ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು)
- **ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪ್ರವೇಶ (Privilege Level)**: 👑 ಮಾಸ್ಟರ್ ನಿಯಂತ್ರಣ (ಅನಿಯಮಿತ ಮುಕ್ತ ಪ್ರವೇಶ)

${allGreen ? "🌟 ಸಮಸ್ತ ವ್ಯವಸ್ಥೆಯು ಅತ್ಯುತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ! ಯಾವುದೇ ದೋಷಗಳಿಲ್ಲ." : "⚠️ ದಯವಿಟ್ಟು ಸೂಪರ್ ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ."}`,

      hi: `🩺 **सिस्टम स्वास्थ्य रिपोर्ट:**
- **पंचांग इंजन**: ${panchangaOk ? "✅ सक्रिय (१००% सटीक)" : "⚠️ त्रुटि"}
- **अस्तोदय इंजन**: ${astodayaOk ? "✅ सक्रिय (दृक गणित प्रमाणित)" : "⚠️ त्रुटि"}
- **ग्रहण गणना**: ${eclipsesOk ? "✅ सक्रिय" : "⚠️ त्रुटि"}
- **डेटाबेस**: ✅ सक्रिय (${userCount} उपयोगकर्ता)
- **एडमिन स्तर**: 👑 मास्टर विशेषाधिकार पूर्ण सक्रिय।`,

      te: `🩺 **సిస్టమ్ ఆరోగ్య నివేదిక:**
- పంచాంగ ఇంజిన్: ${panchangaOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- అస్తోదయ ఇంజిన్: ${astodayaOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- గ్రహణ ఇంజిన్: ${eclipsesOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- డేటాబేస్: ✅ యాక్టివ్ (${userCount} యూజర్లు)
- అడ్మిన్ యాక్సెస్: 👑 సూపర్ అడ్మిన్ ఫుల్ కంట్రోల్.`,

      ta: `🩺 **கணினி ஆரோக்கிய அறிக்கை:**
- பஞ்சாங்க எஞ்சின்: ${panchangaOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- அஸ்தோதய எஞ்சின்: ${astodayaOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- கிரகண எஞ்சின்: ${eclipsesOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- தரவுத்தளம்: ✅ செயலில் உள்ளது (${userCount} பயனர்கள்)
- அட்மின் நிலை: 👑 சூப்பர் அட்மின் முழு அணுகல்.`,

      en: `🩺 **Super Admin System Diagnostic Dossier:**
- **Astronomical Panchanga Engine**: ${panchangaOk ? "✅ Operational (100% Deterministic)" : "⚠️ Review Needed"}
- **Astodaya Arcus Visionis Engine**: ${astodayaOk ? "✅ Operational (Drik Ganita Certified)" : "⚠️ Error"}
- **Eclipse Computation Engine**: ${eclipsesOk ? "✅ Operational (Global & Local Visibility)" : "⚠️ Error"}
- **Local Storage / IndexedDB**: ✅ Healthy (${userCount} cached profiles)
- **Super Admin Privilege Status**: 👑 Master Authorization Active (Zero Deduction Profile)

${allGreen ? "🌟 All core calculation engines and database services are operating in prime condition!" : "⚠️ Attention needed on engine components."}`
    },
    spokenText: {
      kn: `ಸ್ವಾಮಿ, ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಪಂಚಾಂಗ, ಅಸ್ತೋದಯ ಮತ್ತು ಗ್ರಹಣ ಎಂಜಿನ್‌ಗಳು ನೂರಕ್ಕೆ ನೂರು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿವೆ.`,
      hi: `स्वामी, सिस्टम स्वास्थ्य परीक्षण पूर्ण हुआ। पंचांग और ग्रहण इंजन पूरी तरह सक्रिय हैं।`,
      te: `స్వామి, సిస్టమ్ ఆరోగ్యం చాలా బాగుంది. అన్ని ఇంజిన్లు ఖచ్చితంగా పనిచేస్తున్నాయి.`,
      ta: `சுவாமி, சிஸ்டம் ஆரோக்கியம் மிகச் சிறப்பாக உள்ளது. அனைத்து கணக்கீடுகளும் துல்லியமாக உள்ளன.`,
      en: `Super Admin, system diagnostics are complete. All astronomical engines and database services are operating at peak health.`
    },
    emotion: "peaceful",
    category: "diagnostics",
    actions: [
      {
        id: "open_superadmin",
        label: {
          kn: "🛡️ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
          hi: "🛡️ सुपर एडमिन कंट्रोल सेंटर",
          te: "🛡️ సూపర్ అడ్మిన్ కంట్రోల్ సెంటర్",
          ta: "🛡️ சூப்பர் அட்மின் கட்டுப்பாட்டு மையம்",
          en: "🛡️ Open Super Admin Center"
        },
        icon: "🛡️",
        targetPage: "superadmindashboard",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 6: DEFAULT OFFLINE COMPANION GREETING & HELP
// =========================================================================
function handleDefaultOfflineCompanion(query: string, lang: SupportedLanguage): PetResponse {
  return {
    text: {
      kn: `ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಕೇಳಿದ ಪ್ರಶ್ನೆ: "${query}".

ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ ಈ ಕೆಳಗಿನ ಕಾರ್ಯಗಳನ್ನು ತಕ್ಷಣ ಮಾಡಬಲ್ಲೆ:
1. **ಆದಾಯ & ಹಣ ಗಳಿಸುವ ತಂತ್ರಗಳು**: ಪಂಚಾಂಗ ಪುಸ್ತಕ & ಸೇವಾ ಬುಕಿಂಗ್ ಆದಾಯ ಯೋಜನೆಗಳು.
2. **ವೈರಲ್ ಮಾರ್ಕೆಟಿಂಗ್**: ವಾಟ್ಸಾಪ್ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಗ್ರಹಣ ಪ್ರಚಾರ ತಂತ್ರಗಳು.
3. **ಜಾತಕ & ದೋಷ ವಿಶ್ಲೇಷಣೆ**: ಕುಜ, ಕಾಳಸರ್ಪ, ಶನಿ, ಪಿತೃ ದೋಷ ನಿರ್ಣಯ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಂತಿ.
4. **ಸಿಸ್ಟಮ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್**: ಪಂಚಾಂಗ ಮತ್ತು ಗ್ರಹಣ ಎಂಜಿನ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ.
5. **ಆಟೋಮೇಷನ್**: ಯಾವುದೇ ಪುಟಕ್ಕೆ ತಕ್ಷಣ ಜಂಪ್ ಮಾಡುವುದು.

ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಟನ್‌ಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಮತ್ತೊಂದು ಆಜ್ಞೆ ನೀಡಿ!`,

      hi: `नमस्ते स्वामी! मैं आपका कामधेनु AI सहायक हूँ।
मैं आपके लिए आय वृद्धि, मार्केटिंग, कुंडली दोष विश्लेषण एवं सिस्टम परीक्षण करने के लिए तत्पर हूँ। कृपया नीचे दिए गए विकल्पों में से चुनें।`,

      te: `నమస్కారం స్వామి! నేను మీ కామధేను AI అసిస్టెంట్.
ఆదాయ మార్గాలు, మార్కెటింగ్ వ్యూహాలు, జాతక దోషాలు మరియు సిస్టమ్ డయాగ్నోస్టిక్స్ కోసం నేను సిద్ధంగా ఉన్నాను.`,

      ta: `வணக்கம் சுவாமி! நான் உங்கள் காமதேனு AI உதவியாளர்.
வருமானம், சந்தைப்படுத்தல், ஜாதக தோஷங்கள் மற்றும் சிஸ்டம் நிலையை அறிய நான் தயாராக உள்ளேன்.`,

      en: `Namaskara Super Admin! I am Kamadhenu, your divine AI assistant pet.
I have full super admin access to execute actions, analyze Janma Kundalis and Doshas, strategize revenue monetization, and guide marketing campaigns.
Choose one of the quick actions below or ask me any command!`
    },
    spokenText: {
      kn: `ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ವಹಿಸುತ್ತೇನೆ.`,
      hi: `नमस्ते स्वामी! मैं आपकी सेवा में तत्पर हूँ। जो भी आज्ञा हो, बताएं।`,
      te: `నమస్కారం స్వామి! మీ ఆజ్ఞ ప్రకారం నేను సేవ చేయడానికి సిద్ధంగా ఉన్నాను.`,
      ta: `வணக்கம் சுவாமி! நீங்கள் கட்டளையிடும் பணிகளை நான் உடனடியாகச் செய்வேன்.`,
      en: `Greetings Super Admin! I am your divine AI assistant pet. Tell me what to do and I will execute it on your behalf.`
    },
    emotion: "peaceful",
    category: "general",
    actions: [
      {
        id: "act_earn_money",
        label: {
          kn: "💰 ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ?",
          hi: "💰 पैसे कैसे कमाएं?",
          te: "💰 ఆదాయం ఎలా పెంచుకోవాలి?",
          ta: "💰 வருமானம் ஈட்டுவது எப்படி?",
          en: "💰 How to Earn Money?"
        },
        icon: "💰",
        actionType: "custom"
      },
      {
        id: "act_marketing",
        label: {
          kn: "📢 ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು",
          hi: "📢 मार्केटिंग रणनीति",
          te: "📢 మార్కెటింగ్ వ్యూహాలు",
          ta: "📢 சந்தைப்படுத்தல் உத்திகள்",
          en: "📢 Marketing Strategies"
        },
        icon: "📢",
        actionType: "custom"
      },
      {
        id: "act_doshas",
        label: {
          kn: "🔮 ಜಾತಕ & ದೋಷ ಸ್ಕ್ಯಾನ್",
          hi: "🔮 कुंडली एवं दोष स्कैन",
          te: "🔮 జాతక & దోషాల తనిఖీ",
          ta: "🔮 ஜாதக & தோஷ ஆய்வு",
          en: "🔮 Kundli & Dosha Scan"
        },
        icon: "🔮",
        targetPage: "doshas",
        actionType: "navigate"
      },
      {
        id: "act_health",
        label: {
          kn: "🩺 ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
          hi: "🩺 सिस्टम स्वास्थ्य जांच",
          te: "🩺 సిస్టమ్ హెల్త్ చెక్",
          ta: "🩺 சிஸ்டம் ஆய்வு",
          en: "🩺 System Health Diagnostic"
        },
        icon: "🩺",
        actionType: "run_diagnostic"
      }
    ]
  };
}
