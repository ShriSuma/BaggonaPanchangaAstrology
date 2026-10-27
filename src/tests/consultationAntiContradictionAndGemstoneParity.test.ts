import { describe, it, expect } from "vitest";
import {
  analyzeQuestionComplexity,
  buildDeterministicGemstoneReading,
  type AstrologicalRecommendationProfile
} from "../features/consultation/consultationAIEngine";
import { CONSULTATION_CHAT_UI_I18N, type ConsultationSession } from "../features/consultation/consultationTypes";
import { type AskGeminiChatTurn } from "../core/GeminiEngine";

describe("Consultation Anti-Contradiction & Vedic Gemstone Parity Suite", () => {
  const dummySession: ConsultationSession = {
    id: "session-test-1",
    name: "Shri Devotee",
    dob: "1988-06-15",
    tob: "10:30",
    place: "Gokarna",
    language: "kn",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    createdAt: new Date().toISOString(),
    status: "active",
    messages: [],
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362"
  };

  const venusRecProfile: AstrologicalRecommendationProfile = {
    primaryGemstoneName: {
      kn: "ವಜ್ರ (Diamond / Heera)",
      en: "Diamond (Heera / Vajra)",
      hi: "हीरा (Diamond)",
      te: "వజ్రం (Diamond)",
      ta: "வைரம் (Diamond)",
      ml: "വൈരം (Diamond)",
      mr: "हिरा (Diamond)"
    },
    substituteGemstones: {
      kn: "ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ನೈಸರ್ಗಿಕ ಬಿಳಿ ಓಪಲ್ (White Opal), ಶುದ್ಧ ಸ್ಫಟಿಕ (Sphatika), ಬಿಳಿ ಪುಷ್ಯರಾಗ (White Sapphire)",
      en: "Natural White Zircon (Shveta Zircon), Natural White Opal, Pure Sphatika (Clear Quartz), White Sapphire",
      hi: "प्राकृतिक सफेद जरकन (White Zircon), प्राकृतिक सफेद ओपल (White Opal), शुद्ध स्फटिक, सफेद पुखराज",
      te: "సహజ వైట్ జిర్కాన్ (White Zircon), సహజ వైట్ ఓపల్, శుద్ధ స్ఫటికం, తెల్ల పుష్యరాగం",
      ta: "இயற்கை வெள்ளை ஜிர்கான், இயற்கை வெள்ளை ஓபல், தூய ஸ்படிகம், வெள்ளை புஷ்பராகம்",
      ml: "സ്വാഭാവിക വൈറ്റ് സിർക്കോൺ, വൈറ്റ് ഓപ്പൽ, ശുദ്ധ സ്ഫടികം, വെള്ള പുഷ്യരാഗം",
      mr: "नैसर्गिक पांढरा जरकन, पांढरा ओपल, शुद्ध स्फटिक, पांढरा पुखराज"
    },
    gemstoneIncompatibilities: {
      kn: "ಮಾಣಿಕ್ಯ (Ruby), ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire); ಬಿಳಿ ಹವಳವು ಮಂಗಳನ ರತ್ನವಾಗಿದ್ದು ವಜ್ರಕ್ಕೆ ಪರ್ಯಾಯವಲ್ಲ (White Coral is strictly prohibited)",
      en: "Ruby, Yellow Sapphire; White Coral is strictly prohibited (Coral belongs exclusively to Mars)",
      hi: "माणिक्य, पीला पुखराज; सफेद मूंगा पूरी तरह वर्जित है (मूंगा केवल मंगल का रत्न है)",
      te: "కెంపు, పసుపు పుష్యరాగం; తెల్ల పగడం నిషేధం (పగడం కుజుడి రత్నం మాత్రమే)",
      ta: "மாணிக்கம், மஞ்சள் புஷ்பராகம்; வெள்ளை பவளம் அணியக்கூடாது (பவளம் செவ்வாயின் ரத்தினம்)",
      ml: "മാണിക്യം, മഞ്ഞ പുഷ്യരാഗം; വെളുത്ത പവിഴം കർശനമായി ഒഴിവാക്കുക (പവിഴം ചൊവ്വയുടേതാണ്)",
      mr: "माणिक, पिवळा पुखराज; पांढरा पोवळा पूर्णपणे वर्जित (पोवळा फक्त मंगळाचा आहे)"
    },
    gemstonePlanet: "ಶುಕ್ರ (Venus)",
    idealMetal: {
      kn: "ಶುದ್ಧ ಬೆಳ್ಳಿ, ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬಿಳಿ ಬಂಗಾರ",
      en: "Silver, Platinum, or White Gold",
      hi: "चांदी, प्लैटिनम अथवा सफेद सोना",
      te: "వెండి, ప్లాటినం లేదా వైట్ గోల్డ్",
      ta: "வெள்ளி, பிளாட்டினம் அல்லது வெள்ளை தங்கம்",
      ml: "വെള്ളി, പ്ലാറ്റിനം അല്ലെങ്കിൽ വൈറ്റ് ഗോൾഡ്",
      mr: "चांदी, प्लॅटिनम किंवा पांढरे सोने"
    },
    idealFinger: {
      kn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು",
      en: "Middle or Little finger",
      hi: "मध्यमा अथवा कनिष्ठिका उंगली",
      te: "మధ్య వేలు లేదా చిటికెన వేలు",
      ta: "நடுவிரல் அல்லது சுண்டுவிரல்",
      ml: "നടുവിരൽ അല്ലെങ്കിൽ ചെറുവിരൽ",
      mr: "मधले किंवा करंगळी बोट"
    },
    wearingDayAndTime: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಶುಕ್ರವಾರ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ",
      en: "Friday morning during Shukla Paksha at sunrise",
      hi: "शुक्ल पक्ष के शुक्रवार सूर्योदय के समय",
      te: "శుక్ల పక్ష శుక్రవారం సూర్యోదయ సమయంలో",
      ta: "சுக்கில பட்ச வெள்ளிக்கிழமை சூரியோதய வேளையில்",
      ml: "ശുക്ലപക്ഷത്തിലെ വെള്ളിയാഴ്ച സൂര്യോദയ സമയത്ത്",
      mr: "शुक्ल पक्षातील शुक्रवारी सूर्योदयाच्या वेळी"
    },
    gemstoneMantra: {
      kn: "ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ",
      en: "Om Shum Shukraya Namaha",
      hi: "ॐ शुं शुक्राय नमः",
      te: "ఓం శుం శుక్రాయ నమః",
      ta: "ஓம் ஷும் சுக்ராய நமஹ",
      ml: "ഓം ശും ശുക്രായ നമഃ",
      mr: "ॐ शुं शुक्राय नमः"
    },
    gemstoneBenefits: {
      kn: "ವೈವಾಹಿಕ ಸೌಖ್ಯ, ಕಲಾ ಪ್ರಾವೀಣ್ಯ, ಸೌಂದರ್ಯ ಹಾಗೂ ಐಶ್ವರ್ಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      en: "Enhances marital bliss, artistic creativity, aesthetic grace, and luxury.",
      hi: "वैवाहिक सुख, कलात्मक कौशल, सौंदर्य एवं ऐश्वर्य में वृद्धि करता है।",
      te: "వైవాహిక సౌఖ్యం, కళా నైపుణ్యం, అందం మరియు ఐశ్వర్యాన్ని పెంచుతుంది.",
      ta: "திருமண மகிழ்ச்சி, கலைத்திறன் மற்றும் செல்வ வளத்தை பெருக்கும்.",
      ml: "വൈവാഹിക സൗഖ്യവും സമ്പത്തും വർദ്ധിപ്പിക്കുന്നു.",
      mr: "वैवाहिक सौख्य, कलात्मकता आणि ऐश्वर्य वृद्धिंगत करतो."
    },
    luckyColors: {
      kn: "ಬಿಳಿ, ರೇಷ್ಮೆ ಬಣ್ಣ, ತಿಳಿ ನೀಲಿ",
      en: "White, Cream, Light Blue",
      hi: "सफेद, क्रीम, हल्का नीला",
      te: "తెలుపు, క్రీమ్, లేత నీలం",
      ta: "வெள்ளை, கிரீம், வெளிர் நீலம்",
      ml: "വെള്ള, ക്രീം, ഇളം നീല",
      mr: "पांढरा, क्रीम, हलका निळा"
    },
    colorsToAvoid: {
      kn: "ಗಾಢ ಕೆಂಪು, ಹಳದಿ",
      en: "Dark Red, Yellow",
      hi: "गहरा लाल, पीला",
      te: "ముదురు ఎరుపు, పసుపు",
      ta: "அடர் சிவப்பு, மஞ்சள்",
      ml: "കടും ചുവപ്പ്, മഞ്ഞ",
      mr: "गडद लाल, पिवळा"
    },
    primaryNumber: 6,
    compatibleNumbers: [5, 8],
    luckyNumbersText: {
      kn: "೬ (ಶುಕ್ರನ ಸಂಖ್ಯೆ), ಮಿತ್ರ ಸಂಖ್ಯೆಗಳು: ೫, ೮",
      en: "6 (Venus number), Friendly numbers: 5, 8",
      hi: "६ (शुक्र का अंक), मित्र अंक: ५, ८",
      te: "6 (శుక్రుని సంఖ్య), మిత్ర సంఖ్యలు: 5, 8",
      ta: "6 (சுக்கிரன் எண்), நட்பு எண்கள்: 5, 8",
      ml: "6 (ശുക്രന്റെ സംഖ്യ), മിത്ര സംഖ്യകൾ: 5, 8",
      mr: "६ (शुक्राचा अंक), मित्र अंक: ५, ८"
    },
    ishtaDevata: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ",
      en: "Goddess Mahalakshmi",
      hi: "श्री महालक्ष्मी",
      te: "శ్రీ మహాలక్ష్మి",
      ta: "ஸ்ரீ மகாலட்சுமி",
      ml: "ശ്രീ മഹാലക്ഷ്മി",
      mr: "श्री महालक्ष्मी"
    },
    sacredMantra: {
      kn: "ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ",
      en: "Om Shreem Hreem Kleem Mahalakshmyai Namah",
      hi: "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः",
      te: "ఓం శ్రీం హ్రీం క్లీం మహాలక్ష్మ్యై నమః",
      ta: "ஓம் ஸ்ரீம் ஹ்ரீம் க்ளீம் மஹாலக்ஷ்ம்யை நமஹ",
      ml: "ഓം ശ്രീം ഹ്രീം ക്ലീം മഹാലക്ഷ്മ്യൈ നമഃ",
      mr: "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः"
    },
    auspiciousDay: {
      kn: "ಶುಕ್ರವಾರ",
      en: "Friday",
      hi: "शुक्रवार",
      te: "శుక్రవారం",
      ta: "வெள்ளிக்கிழமை",
      ml: "വെള്ളിയാഴ്ച",
      mr: "शुक्रवार"
    },
    isCoralMatched: false
  };

  it("1. analyzeQuestionComplexity detects gemstone and multi-turn alternative queries", () => {
    // Single turn inquiries
    const res1 = analyzeQuestionComplexity("ನನಗೆ ಯಾವ ರತ್ನ ಸೂಕ್ತ?");
    expect(res1.complexity).toBe("QUICK_SPECIFIC");
    expect(res1.domain).toBe("GEMSTONE_RATNA");

    const res2 = analyzeQuestionComplexity("Can I wear white coral instead of diamond?");
    expect(res2.domain).toBe("GEMSTONE_RATNA");

    // Multi-turn context: user previously discussed diamond, now asks for an alternative due to money
    const historyWithDiamond: AskGeminiChatTurn[] = [
      { role: "user", text: "Can I wear white coral instead of diamond?" },
      { role: "model", text: "White coral is NOT a substitute for diamond; wear Diamond or White Zircon." }
    ];

    const res3 = analyzeQuestionComplexity(
      "I don't have money for diamond, alternative what do you suggest?",
      historyWithDiamond
    );
    expect(res3.domain).toBe("GEMSTONE_RATNA");

    const res4 = analyzeQuestionComplexity(
      "ವಜ್ರ ಕೊಳ್ಳಲು ಹಣವಿಲ್ಲ, ಬೇರೆ ಬದಲಿ ರತ್ನ ಯಾವುದು?",
      historyWithDiamond
    );
    expect(res4.domain).toBe("GEMSTONE_RATNA");
  });

  it("2. Parashari recommendation profile provides authentic Uparatnas and strict prohibitions", () => {
    // Check Venus Uparatnas
    expect(venusRecProfile.substituteGemstones.kn).toContain("ಬಿಳಿ ಜಿರ್ಕಾನ್");
    expect(venusRecProfile.substituteGemstones.kn).toContain("ಬಿಳಿ ಓಪಲ್");
    expect(venusRecProfile.substituteGemstones.kn).toContain("ಶುದ್ಧ ಸ್ಫಟಿಕ");

    expect(venusRecProfile.substituteGemstones.en).toContain("White Zircon");
    expect(venusRecProfile.substituteGemstones.en).toContain("White Opal");
    expect(venusRecProfile.substituteGemstones.en).toContain("Clear Quartz");

    // Check White Coral prohibition for Venus
    expect(venusRecProfile.gemstoneIncompatibilities.kn).toContain("ಬಿಳಿ ಹವಳವು ಮಂಗಳನ ರತ್ನವಾಗಿದ್ದು ವಜ್ರಕ್ಕೆ ಪರ್ಯಾಯವಲ್ಲ");
    expect(venusRecProfile.gemstoneIncompatibilities.en).toContain("Coral belongs exclusively to Mars");
  });

  it("3. Turn 1: Devotee asks about White Coral for Diamond -> explicitly rejects White Coral with Vedic truth", () => {
    // English
    const enSession = { ...dummySession, language: "en" as const };
    const readingEn = buildDeterministicGemstoneReading(
      enSession,
      "Can I wear white coral instead of diamond?",
      undefined,
      venusRecProfile,
      false
    );

    expect(readingEn).toContain("White Coral");
    expect(readingEn).toContain("strictly NOT a substitute for Diamond or Venus");
    expect(readingEn).toContain("governed entirely by Mars");
    expect(readingEn).toContain("White Zircon");

    // Kannada
    const knSession = { ...dummySession, language: "kn" as const };
    const readingKn = buildDeterministicGemstoneReading(
      knSession,
      "ವಜ್ರದ ಬದಲಿಗೆ ಬಿಳಿ ಹವಳ ಧರಿಸಬಹುದೇ?",
      undefined,
      venusRecProfile,
      false
    );

    expect(readingKn).toContain("ಬಿಳಿ ಹವಳವು");
    expect(readingKn).toContain("ಶುಕ್ರ ಗ್ರಹಕ್ಕೆ ಅಥವಾ ವಜ್ರಕ್ಕೆ ಪರ್ಯಾಯ ರತ್ನವಲ್ಲ");
    expect(readingKn).toContain("ಮಂಗಳ (ಕುಜ) ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ರತ್ನವಾಗಿದ್ದು");
    expect(readingKn).toContain("ಬಿಳಿ ಜಿರ್ಕಾನ್");
    expect(readingKn).toContain("ಬಿಳಿ ಓಪಲ್");
  });

  it("4. Turn 2 Multi-Turn Anti-Contradiction: Devotee asks for affordable alternative to Diamond -> NEVER recommends White Coral", () => {
    const history: AskGeminiChatTurn[] = [
      { role: "user", text: "Can I wear white coral instead of diamond?" },
      { role: "model", text: "White coral is NOT a substitute for diamond; wear Diamond or White Zircon." }
    ];

    // English
    const enSession = { ...dummySession, language: "en" as const };
    const replyEn = buildDeterministicGemstoneReading(
      enSession,
      "I don't have money for diamond, alternative what do you suggest?",
      undefined,
      venusRecProfile,
      true,
      history
    );

    expect(replyEn).toContain("Natural White Zircon");
    expect(replyEn).toContain("Natural Australian White Opal");
    expect(replyEn).toContain("Pure Sphatika");
    // Verify anti-contradiction: Never suggest buying white coral!
    expect(replyEn).toContain("Never substitute Diamond with White Coral, as Coral belongs strictly to Mars");

    // Kannada
    const knSession = { ...dummySession, language: "kn" as const };
    const replyKn = buildDeterministicGemstoneReading(
      knSession,
      "ವಜ್ರ ಕೊಳ್ಳಲು ನನ್ನ ಬಳಿ ಹಣವಿಲ್ಲ, ಬೇರೆ ಪರ್ಯಾಯ ರತ್ನ ಯಾವುದು?",
      undefined,
      venusRecProfile,
      true,
      history
    );

    expect(replyKn).toContain("ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್");
    expect(replyKn).toContain("ನೈಸರ್ಗಿಕ ಬಿಳಿ ಓಪಲ್");
    expect(replyKn).toContain("ಶುದ್ಧ ಸ್ಫಟಿಕ");
    expect(replyKn).toContain("ಬಿಳಿ ಹವಳವನ್ನು ಎಂದಿಗೂ ವಜ್ರದ ಬದಲು ಧರಿಸಬಾರದು");
  });

  it("5. Zero technical / developer percentage leaks in CONSULTATION_CHAT_UI_I18N", () => {
    const allJson = JSON.stringify(CONSULTATION_CHAT_UI_I18N);
    expect(allJson).not.toContain("80%");
    expect(allJson).not.toContain("20%");
    expect(allJson).not.toContain("೮೦%");
    expect(allJson).not.toContain("೨೦%");
    expect(allJson).not.toContain("80% Direct Answer");
    expect(allJson).not.toContain("20% Technical");

    // Check spiritual labels
    expect(CONSULTATION_CHAT_UI_I18N.kn.directAnswerTag).toBe("ಮುಖ್ಯ ತೀರ್ಮಾನ");
    expect(CONSULTATION_CHAT_UI_I18N.en.directAnswerTag).toBe("Key Verdict");
    expect(CONSULTATION_CHAT_UI_I18N.hi.directAnswerTag).toBe("मुख्य निर्णय");
  });
});
