import type { AskGeminiChatTurn } from "../../core/GeminiEngine";
import type {
  ConsultationSession,
  ConsultationLanguage,
  ConsultationRulingRecord
} from "./consultationTypes";
import { deduplicateResponseText } from "./consultationFallbackReadings";
import { buildDeterministicAbroadSettlementReading } from "./consultationDomainReadings";
import type {
  DevoteeKundliComputedData,
  AstrologicalRecommendationProfile
} from "./consultationAIEngine";

/**
 * Detects and resolves "Ulta-Palta", reversed, or hypothetical questions
 * that probe against prior rulings in the Consultation Ruling Ledger.
 * Enforces 100% unwavering multi-turn consistency with zero dilemma!
 */
export function detectAndResolveUltaPaltaProbe(
  question: string,
  ledger?: ConsultationRulingRecord[],
  lang: ConsultationLanguage = "kn",
  historyText?: string
): string | null {
  if (!question || !ledger || ledger.length === 0) return null;
  const qLower = question.toLowerCase();

  // 1. PUSHPARAGA / YELLOW SAPPHIRE PROBE (User asks about Pushparaga for Libra Lagna or when Pushparaga was rejected)
  const isPushparagaQuery = /ಪುಷ್ಯರಾಗ|ಪುಷ್ಯ|ಹಳದಿ ಪುಷ್ಯ|pushparaga|yellow sapphire|pukhraj|पुखराज|పుష్యరాగం|புஷ்பராகம்|പുഷ്യരാഗം/i.test(qLower);
  const isTulaProbe =
    /ತುಲಾ|tula|libra/i.test(qLower) ||
    ledger.some((r) => /tula|libra|ತುಲಾ/i.test(r.questionSummary || "") || /tula|libra|ತುಲಾ/i.test(r.primaryVerdict || ""));
  const gemRecord = ledger.find((r) => r.domain === "GEMSTONE_REMEDY");
  const isPushparagaRejectedInLedger = gemRecord?.rejectedOptions?.some((opt) =>
    /yellow sapphire|pushparaga|pukhraj|ಪುಷ್ಯರಾಗ/i.test(opt)
  );

  if (isPushparagaQuery && (isPushparagaRejectedInLedger || isTulaProbe)) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling (100% Authoritative Determination): As firmly ruled in our earlier determination with 100% certainty, Yellow Sapphire (Pushparaga / Pukhraj) is STRICTLY PROHIBITED for your chart! Regardless of whether someone suggests wearing it for one month, one week, or in gold, you must NOT wear it. For your Libra (Tula) Lagna, Jupiter is the malefic 6th lord of debts, diseases, litigation, and enemies. Energizing the 6th lord with Yellow Sapphire will only attract financial liabilities, health complications, and obstacles.`;
      const p2 = `Your single authentic, scripture-approved gemstone is Diamond (Vajra) or natural White Zircon to strengthen your benefic Lagna Lord Venus. Stand firmly by authentic Vedic Shastra with zero dilemma.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): जैसा कि पूर्व में पूरी दृढ़ता के साथ स्पष्ट किया जा चुका है, आपकी कुंडली के लिए पीला पुखराज (Yellow Sapphire) पूरी तरह वर्जित है! कोई कितना भी कहे, इसे एक महीने या एक हफ्ते के लिए भी धारण न करें। आपकी तुला लग्न कुंडली में बृहस्पति षष्ठ भाव (रोग, ऋण, शत्रु एवं विवाद) का स्वामी है। पुखराज पहनने से केवल कर्ज, बीमारी और मानसिक तनाव बढ़ेगा।`;
      const p2 = `आपके लग्नेश शुक्र का एकमात्र कल्याणकारी रत्न हीरा अथवा प्राकृतिक सफेद जरकन है। बिना किसी संकोच के इसी शास्त्रसम्मत निर्णय पर अडिग रहें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం (100% శాస్త్రోక్త తీర్పు): మీ జాతకానికి పసుపు పుష్యరాగం (Yellow Sapphire / Pukhraj) ధరించడం ఖచ్చితంగా నిషిద్ధం! మీ తులా లగ్నానికి గురుడు 6వ రోగ, ఋణ, శత్రు స్థానాధిపతి. పుష్యరాగం ధరిస్తే అప్పుల బాధ, అనారోగ్యం మరియు కష్టాలు పెరుగుతాయి.`;
      const p2 = `లగ్నాధిపతి శుక్రుని రత్నమైన వజ్రం (Diamond) లేదా సహజ వైట్ జిర్కాన్ మాత్రమే ధరించాలి. ఎటువంటి సందేహం లేకుండా ఈ నిర్ణయానికి కట్టుబడి ఉండండి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு (100% சாஸ்திர முடிவு): உங்கள் ஜாதகத்திற்கு மஞ்சள் புஷ்பராகம் (Yellow Sapphire) அணிவது முற்றிலும் தடைசெய்யப்பட்டுள்ளது! உங்கள் துலாம் லக்னத்திற்கு குரு 6-ஆம் கடன், நோய், எதிரி ஸ்தானாதிபதி ஆவார். புஷ்பராகம் அணிந்தால் கடன் மற்றும் உடல்நலக் கோளாறுகள் அதிகரிக்கும்.`;
      const p2 = `லக்னாதிபதி சுக்கிரனின் ரத்தினமான வைரம் (Diamond) அல்லது இயற்கை வெள்ளை ஜிர்கான் மட்டுமே உங்களுக்கு சுபமானது. எவ்வித சந்தேகமும் இன்றி இதில் உறுதியாக இருங்கள்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ് (100% ശാസ്ത്രീയ സത്യം): നിങ്ങളുടെ ജാതകപ്രകാരം മഞ്ഞ പുഷ്യരാഗം (Yellow Sapphire) ധരിക്കുന്നത് കർശനമായി വിലക്കിയിരിക്കുന്നു! തുലാം ലഗ്നത്തിന് വ്യാഴം 6-ാം ദുരിത-രോഗ-ശത്രു ഭാവത്തിന്റെ നാഥനാണ്. പുഷ്യരാഗം ധരിച്ചാൽ കടബാധ്യതകളും അനാവശ്യ പ്രയാസങ്ങളും വർദ്ധിക്കും.`;
      const p2 = `ലഗ്നാധിപനായ ശുക്രന്റെ രത്നമായ വജ്രം അല്ലെങ്കിൽ വൈറ്റ് സിർക്കോൺ മാത്രമാണ് നിങ്ങൾക്ക് അനുകൂലം. ഈ ശാസ്ത്രോക്ത തീരുമാനത്തിൽ പൂർണ്ണമായി ഉറച്ചുനിൽക്കുക.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): आपल्या कुंडलीनुसार पिवळा पुखराज (Yellow Sapphire) वापरणे पूर्णपणे निषिद्ध आहे! आपल्या तूळ लग्नासाठी गुरु हा ६ व्या रोग, ऋण व शत्रू स्थानाचा स्वामी आहे. पुखराज धारण केल्यास आर्थिक नुकसान आणि संकटे वाढतील.`;
      const p2 = `आपल्या लग्नेश शुक्राचे शुभ रत्न हिरा अथवा नैसर्गिक पांढरा जरकन हेच आहे. या शास्त्रसम्मत निर्णयावर ठाम राहा.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ (೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ತೀರ್ಮಾನ): ನಾನು ಮೊದಲೇ ಸಂಪೂರ್ಣ ಖಚಿತತೆಯೊಂದಿಗೆ ಸ್ಪಷ್ಟಪಡಿಸಿದಂತೆ, ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಹಳದಿ ಪುಷ್ಯರಾಗವನ್ನು (Yellow Sapphire / Pukhraj) ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಧರಿಸಬಾರದು! ಯಾರೇ ಸಲಹೆ ನೀಡಿದರೂ ಅಥವಾ ಕೇವಲ ಒಂದು ತಿಂಗಳಿಗಾಗಲಿ ಪುಷ್ಯರಾಗ ಧರಿಸಲು ಎಂದಿಗೂ ಮುಂದಾಗಬೇಡಿ. ನಿಮ್ಮ ತುಲಾ ಲಗ್ನಕ್ಕೆ ಗುರುವು ೬ನೇ ರೋಗ-ಸಾಲ-ಶತ್ರು-ವ್ಯಾಜ್ಯಗಳ ದುಸ್ಥಾನಾಧಿಪತಿಯಾಗಿದ್ದು, ಪುಷ್ಯರಾಗ ಧರಿಸಿದರೆ ಸಾಲದ ಹೊರೆ, ಅನಾರೋಗ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಹೆಚ್ಚುವುದು ಖಚಿತ.`;
    const p2 = `ನಿಮ್ಮ ದೇಹರಕ್ಷಕ ಹಾಗೂ ಭಾಗ್ಯೋದಾಯಕ ಏಕೈಕ ರತ್ನವೆಂದರೆ ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ವಜ್ರ (Diamond) ಅಥವಾ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon). ಯಾವುದೇ ಗೊಂದಲವಿಲ್ಲದೆ ಇದೇ ಸತ್ಯಕ್ಕೆ ಬದ್ಧರಾಗಿರಿ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 2. MARRIAGE DELAY PROBE (User asks "Will marriage take 3 years?", "Is marriage delayed?", or probes opposite)
  // Do NOT hijack genuine proof/why follow-up queries ("How are you sure 2027?", "Why next 6 months?").
  const isAskingProofQuestion =
    /how are you (so )?sure|how can you (be so sure|be sure|say|tell)|what is the (proof|reason|basis)|give me proof|prove it|on what basis|why (did you say|are you saying|do you say|202[5-9]|203\d|next \d+)|ಹೇಗೆ ಖಚಿತ|ಹೇಗೆ ಹೇಳ್ತೀರ|ಹೇಗೆ ಹೇಳುತ್ತೀರಿ|ಹೇಗೆ ಗೊತ್ತು|ಯಾಕೆ ಹಾಗೆ|ಆಧಾರ ಏನು|ಪ್ರೂಫ್|ಸಾಕ್ಷಿ|ಕैसे कह सकते|सबूत|कारण क्या|ఎలా చెప్పగలరు|ఆధారం|எப்படி சொல்கிறீர்கள்|ஆதாரம்|എങ്ങനെ ഉറപ്പിക്കും|കसे सांगता|पुरावा/i.test(
      qLower
    );
  const isMarriageQuery =
    /ವಿವಾಹ|ಮದುವೆ|ಕಂಕಣ|maduve|kalyana|marriage|wedding|shadi|विवाह|शादी|వివాహ|పెళ్లి|కళ్యాణ|திருமணம்|கல்யாணம்|വിവാഹം|കല്യാണം|लग्न/i.test(
      qLower
    );
  const isDelayOrDoubtProbe =
    !isAskingProofQuestion &&
    /delay|postpone|3 years|5 years|late|not happen|will not get married|ಆಗಲ್ವಾ|ತಡವಾಗುತ್ತಾ|೩ ವರ್ಷ|೫ ವರ್ಷ|ವಿಳಂಬ|ಸಂದೇಹ|ಖಚಿತವೇ|ನಿಜంగా|ఆలస్యం|3 ఏళ్ల|5 ఏళ్ల|కాదా|జరగదా|देरी|विलंब|तमाम|நடக்காதா|தாமதம்|3 வருடம்|5 வருடம்|தள்ளிப்போகுமா|വൈകുമോ|താമസം|3 വർഷം|5 വർഷം|നടക്കില്ലേ|उशीर|३ वर्षे|५ वर्षे|होणार नाही का/i.test(
      qLower
    );
  const marriageRecord = ledger.find((r) => r.domain === "MARRIAGE");

  if (isMarriageQuery && isDelayOrDoubtProbe && marriageRecord) {
    const askedFiveYears = /(?:^|\s)(?:5|೫|५)\s*(?:years?|ವರ್ಷ|वर्ष|ఏళ్ల|సంవత్సర|வருட|വർഷ|वर्षे)/i.test(qLower);
    const delayYearsEn = askedFiveYears ? "5 years" : "3 years";
    const delayYearsHi = askedFiveYears ? "५ वर्ष" : "३ वर्ष";
    const delayYearsTe = askedFiveYears ? "5 సంవత్సరాలు" : "3 సంవత్సరాల";
    const delayYearsTa = askedFiveYears ? "5 வருடம்" : "3 வருட";
    const delayYearsMl = askedFiveYears ? "5 വർഷം" : "3 വർഷത്തെ";
    const delayYearsMr = askedFiveYears ? "५ वर्षे" : "३ वर्षांचा";
    const delayYearsKn = askedFiveYears ? "೫ ವರ್ಷ" : "೩ ವರ್ಷ";

    const spokenEn = historyText?.match(/(?:next|within)\s+\d+\s+to\s+\d+\s+months/i)?.[0];
    const spokenHi = historyText?.match(/अगले\s+[०-९\d]+\s+से\s+[०-९\d]+\s+महीनों/)?.[0];
    const spokenTe = historyText?.match(/రాబోయే\s+\d+\s+నుండి\s+\d+\s+నెలల్లో/)?.[0];
    const spokenTa = historyText?.match(/அடுத்த\s+\d+\s+முதல்\s+\d+\s+மாதங்களுக்குள்/)?.[0];
    const spokenMl = historyText?.match(/അടുത്ത\s+\d+\s+മുതൽ\s+\d+\s+മാസത്തിനുള്ളിൽ/)?.[0];
    const spokenMr = historyText?.match(/पुढील\s+[०-९\d]+\s+ते\s+[०-९\d]+\s+महिन्यांत/)?.[0];
    const spokenKn = historyText?.match(/ಮುಂದಿನ\s+[೦-೯\d]+\s+ರಿಂದ\s+[೦-೯\d]+\s+ತಿಂಗಳ(?:ಲ್ಲಿ|ೊಳಗೆ)/)?.[0];

    if (lang === "en") {
      const windowEn = spokenEn ? spokenEn.replace(/^next/i, "within the next") : "within the next 6 months";
      const p1 = `Master Daivajna Confident Ruling (100% Confirmed Matrimonial Verdict): As established with 100% unwavering certainty in your astrological chart, there is zero room for doubt or dilemma: your marriage will NOT be delayed for ${delayYearsEn}! Your 7th house of matrimony, Venus, and upcoming Gochara Guru aspect are actively aligned right now, and with 98% to 100% certainty ${windowEn} your marriage will definitely be solemnized!`;
      const p2 = `Just as a blossom opens naturally at sunrise without forcing its petals, planetary timing works quietly behind the scenes until the auspicious moment arrives. Cast aside pessimistic anxieties, offer a sincere Kalyana Sankalpa at Sri Kshetra Gokarna, and welcome this sacred union with complete peace of mind.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const windowHi = spokenHi ? `${spokenHi} में` : "अगले ६ महीनों में";
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% विवाह समय निर्धारण): जैसा कि हमने पूर्व में स्पष्ट किया है, आपके मन में किसी भी भ्रम का कोई कारण नहीं है: आपका विवाह ${delayYearsHi} विलंबित नहीं होगा! आपकी कुंडली में सप्तम भाव और गोचर गुरु का प्रभाव वर्तमान में अत्यंत बलवान है, और ${windowHi} आपका विवाह शत-प्रतिशत संपन्न होगा।`;
      const p2 = `जैसे वृक्ष पर फल अपनी ऋतु आने पर स्वतः पककर मीठा हो जाता है, वैसे ही शुभ ग्रह दशा समय पर विवाह योग पूर्ण करती है। सभी निराधार शंकाओं को त्यागकर श्री क्षेत्र गोकर्ण में कल्याण संकल्प करें और प्रसन्न चित्त से आगे बढ़ें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const windowTe = spokenTe || "రాబోయే 6 నెలల్లో";
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం (100% వివాహ నిర్ణయం): మేము ఇంతకు ముందే స్పష్టం చేసినట్లుగా, మీ వివాహానికి ${delayYearsTe} ఆలస్యం ఉండదు! మీ జాతకంలో 7వ స్థానం మరియు గురు బలం బలంగా ఉన్నందున ${windowTe} వివాహానికి అత్యంత శుభ సమయం నడుస్తోంది.`;
      const p2 = `చెట్టుపై కాయ తన సరైన కాలంలో సహజంగా పండినట్లుగానే, శుభ గ్రహ గతి సరైన సమయానికి కళ్యాణ ఘడియలను తీసుకువస్తుంది. ఎటువంటి సందేహాలు లేకుండా ప్రశాంతంగా ఉండండి; గోకర్ణ మహాబలేశ్వర స్వామి అనుగ్రహంతో శుభకార్యం నెరవేరుతుంది.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const windowTa = spokenTa || "அடுத்த 6 மாதங்களுக்குள்";
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு (100% சாஸ்திர முடிவு): முன்பே தெளிவுபடுத்தியபடி, உங்கள் திருமணத்தில் ${delayYearsTa} கால தாமதம் ஏற்படாது! உங்கள் ஜாதகத்தின் 7-ஆம் பாவமும் கோசார குரு பார்வையும் வலிமையாக உள்ளதால், ${windowTa} திருமணம் இனிதே நடைபெற சுப கிரக அமைப்புகள் உள்ளன.`;
      const p2 = `மரத்தில் கனி தன் பருவத்தில் இயற்கையாகப் பழுப்பது போல, காலம் கனியும் போது நல்ல வரன் தானாகத் தேடி வரும். எதிர்மறை எண்ணங்களை நீக்கி கோகர்ண மகாபலேஸ்வரரை வழிபடுங்கள்; அனைத்தும் சுபமாக நடக்கும்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const windowMl = spokenMl || "അടുത്ത 6 മാസത്തിനുള്ളിൽ";
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ് (100% ശാസ്ത്രീയ സത്യം): മുൻപ് വ്യക്തമാക്കിയതുപോലെ, നിങ്ങളുടെ വിവാഹത്തിന് ${delayYearsMl} താമസം ഉണ്ടാവില്ല! 7-ാം ഭാവവും വ്യാഴബലവും അനുകൂലമായതിനാൽ ${windowMl} ശുഭകരമായ വിവാഹ സമയം തെളിയുന്നുണ്ട്.`;
      const p2 = `മരത്തിലെ കായ് സമയമാകുമ്പോൾ താനേ പഴുക്കുന്നതുപോലെ, ഗ്രഹാനുകൂല്യം ഒത്തുവരുമ്പോൾ വിവാഹകാര്യം സുഗമമായി നടക്കും. സന്ദേഹങ്ങൾ വെടിഞ്ഞ് ഗോകർണ്ണത്തിൽ പ്രാർത്ഥിച്ച് സമാധാനത്തോടെ മുന്നോട്ട് പോവുക.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const windowMr = spokenMr || "पुढील ६ महिन्यांत";
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत): पूर्वी स्पष्ट केल्याप्रमाणे, आपल्या विवाहास ${delayYearsMr} विलंब होणार नाही! सप्तम भाव आणि गुरुचे पाठबळ भक्कम असल्याने ${windowMr} विवाहाचे अत्यंत शुभ योग जुळून येत आहेत.`;
      const p2 = `झाडाचे फळ जसे योग्य मोसम आल्यावर आपोआप गोड पक्व होते, तसेच ग्रहमानाचा शुभ काळ आल्यावर मंगळकार्य निर्विघ्न पार पडते. मनातील संशय दूर ठेवा आणि गोकर्ण महाबळेश्वराची उपासना करा.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const windowKn = spokenKn ? `${spokenKn}` : "ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲೇ";
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ (೧೦೦% ಶತಸಿದ್ಧ ವಿವಾಹ ತೀರ್ಮಾನ): ನಾನು ಮೊದಲೇ ೧೦೦% ಖಚಿತವಾಗಿ ನಿರ್ಣಯಿಸಿದಂತೆ, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಗೊಂದಲ ಅಥವಾ ಆತಂಕಕ್ಕೆ ಆಸ್ಪದ ಬೇಡ: ನಿಮ್ಮ ವಿವಾಹವು ${delayYearsKn} ವಿಳಂಬವಾಗುವುದಿಲ್ಲ! ನಿಮ್ಮ ಜಾತಕವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ನೋಡಿದಾಗ ೭ನೇ ಕಳತ್ರ ಭಾವ ಹಾಗೂ ಗೋಚಾರ ಗುರು ಬಲವು ಈಗ ಪೂರ್ಣವಾಗಿ ಸಕ್ರಿಯವಾಗಿದ್ದು, ಶೇಕಡಾ ೯೮ ರಷ್ಟು ನಿಖರತೆಯೊಂದಿಗೆ ${windowKn} ನಿಮ್ಮ ವಿವಾಹ ಯೋಗ ಶತಸಿದ್ಧವಿದೆ!`;
    const p2 = `ಮರದಲ್ಲಿ ಹಣ್ಣು ತನ್ನ ಋತುವಿನಲ್ಲಿ ಸಹಜವಾಗಿ ಮಾಗಿ ಸಿಹಿಯಾಗುವಂತೆ, ಶುಭ ಗ್ರಹಗಳ ಕಾಲಚಕ್ರವು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಕಂಕಣ ಭಾಗ್ಯವನ್ನು ಕೂಡಿಬರುವಂತೆ ಮಾಡುತ್ತದೆ. ಸಕಲ ಸಂದೇಹಗಳನ್ನು ತ್ಯಜಿಸಿ, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಹಾಗೂ ದೈವಿಕ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಧೈರ್ಯವಾಗಿ ಮುನ್ನಡೆಯಿರಿ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 3. WHITE CORAL INQUIRY WHEN PROBED AS DIAMOND REPLACEMENT
  const isWhiteCoralQuery =
    /ಬಿಳಿ\s*ಹವಳ|white\s*coral|safed\s*moonga|white\s*havala|తెల్ల\s*పగడం|வெள்ளை\s*பவளம்|വെളുത്ത\s*പവിഴം|पांढरा\s*पोवळा|सफेद\s*मूंगा/i.test(
      qLower
    );
  if (isWhiteCoralQuery && gemRecord?.rejectedOptions?.some((opt) => /white coral/i.test(opt))) {
    if (lang === "en") {
      const p1 = `Vedic Jyotisha Absolute Truth: White Coral (Safed Moonga) is strictly NOT a substitute for Diamond or Venus! Coral belongs exclusively to Mars (Kuja), channeling Martian heat and cooling high Pitta. It does not transmit Venusian energies.`;
      const p2 = `Just as copper wire carries heat differently than silver filament, each planetary gem channels a distinct ray. If Diamond is outside your budget, the scripture-approved substitutes are Natural White Zircon, Australian White Opal, or Pure Clear Quartz worn in silver.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): सफेद मूंगा कभी भी हीरे का विकल्प नहीं हो सकता! मूंगा पूर्णतः मंगल का रत्न है और केवल पित्त-अग्नि शांत करने के लिए पहना जाता है। हीरे के स्थान पर सफेद मूंगा न पहनें।`;
      const p2 = `यदि हीरा महंगा है, तो प्राकृतिक सफेद जरकन (White Zircon) अथवा ओपल चांदी में धारण करें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం: తెల్ల పగడం ఎప్పటికీ వజ్రానికి ప్రత్యామ్నాయం కాదు! పగడం కుజ గ్రహ రత్నం. వజ్రానికి బదులుగా తెల్ల పగడం ధరించవద్దు.`;
      const p2 = `బడ్జెట్ తక్కువగా ఉంటే సహజ వైట్ జిర్కాన్ లేదా ఓపల్ వెండిలో ధరించండి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு: வெள்ளை பவளம் ஒருபோதும் வைரத்திற்கு மாற்று ஆகாது! பவளம் செவ்வாயின் ரத்தினம். வைரத்திற்குப் பதில் வெள்ளை பவளம் அணியாதீர்கள்.`;
      const p2 = `வைரத்திற்குப் பதிலாக இயற்கை வெள்ளை ஜிர்கான் அல்லது ஓபல் அணிவது சிறந்தது.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: വെളുത്ത പവിഴം ഒരിക്കലും വജ്രത്തിന് പകരമാവില്ല! പവിഴം ചൊവ്വയുടെ രത്നമാണ്. വജ്രത്തിന് പകരം വെളുത്ത പവിഴം ധരിക്കരുത്.`;
      const p2 = `സ്വാഭാവിക വൈറ്റ് സിർക്കോണോ ഓപ്പലോ ധരിക്കുകയാണ് ഉചിതം.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: पांढरा पोवळा कधीही हिऱ्याचा पर्याय ठरू शकत नाही! पोवळा हा मंगळाचा रत्न आहे. हिऱ्याच्या ऐवजी पांढरा पोवळा वापरू नका.`;
      const p2 = `नैसर्गिक पांढरा जरकन किंवा ओपल वापरणे शास्त्रसम्मत आहे.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ಶಾಸ್ತ್ರೋಕ್ತ ನಿಶ್ಚಿತ ಸತ್ಯ: ಬಿಳಿ ಹವಳವು ಮಂಗಳನ ರತ್ನವಾಗಿದ್ದು, ಶುಕ್ರನ ವಜ್ರಕ್ಕೆ ಪರ್ಯಾಯವಲ್ಲ! ವಜ್ರದ ಬದಲು ಬಿಳಿ ಹವಳವನ್ನು ಧರಿಸಿದರೆ ಮಂಗಳನ ದೋಷಗಳು ಉಲ್ಬಣಗೊಳ್ಳುತ್ತವೆ.`;
    const p2 = `ವಜ್ರದ ಬಜೆಟ್ ಇಲ್ಲದಿದ್ದರೆ ಶುಕ್ರನ ಅಧಿಕೃತ ಉಪರತ್ನಗಳಾದ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon) ಅಥವಾ ಬಿಳಿ ಓಪಲ್ ಅನ್ನು ಬೆಳ್ಳಿಯಲ್ಲಿ ಧರಿಸಬೇಕು.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 4. PARTNERSHIP BUSINESS PROBE (User probes doing partnership when rejected)
  const isPartnershipQuery =
    /ಪಾಲುದಾರಿಕೆ|ಪಾರ್ಟ್ನರ್‌ಶಿಪ್|partnership|partner in business|50-50|भागीदारी|साझेदारी|భాగస్వామ్య|పార్ట్‌నర్‌షిప్|పార్ట్నర్షిప్|கூட்டாண்மை|பார்ட்னர்ஷிப்|പങ്കാളിത്ത|പാർട്ണർഷിപ്പ്|पार्टनरशिप/i.test(
      qLower
    );
  const bizRecord = ledger.find((r) => r.domain === "BUSINESS_VS_JOB");
  if (isPartnershipQuery && bizRecord?.rejectedOptions?.some((opt) => /partnership/i.test(opt))) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling (100% Authoritative Determination): As firmly ruled in our earlier determination with 100% certainty, 50-50 partnership business is STRICTLY PROHIBITED for your chart! Entering a commercial partnership with even a close friend will invite ego clashes, financial mismatch, and dispute.`;
      const p2 = `Just as a boat fitted with two separate rudders loses direction in rough waves, divided decision-making destabilizes your 7th-house karma. Your chart strongly favors sole proprietorship or registering in an auspicious family member's name rather than shared ownership.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): जैसा कि हमने पूर्व में स्पष्ट किया है, आपकी कुंडली के अनुसार किसी भी प्रकार का साझेदारी व्यापार पूर्णतः वर्जित है! मित्रों अथवा अन्य व्यक्तियों के साथ साझेदारी करने पर विश्वासघात, धन हानि और विवाद होना तय है।`;
      const p2 = `जैसे एक नाव में दो अलग-अलग पतवारें होने से दिशा भटक जाती है, वैसे ही साझा व्यापार में मतभेद उत्पन्न होते हैं। केवल एकल स्वामित्व ही आपको स्थायी सफलता दिलाएगा, बिना किसी संशय के इसी निर्णय पर अडिग रहें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం (100% శాస్త్రోక్త తీర్పు): ఇంతకు ముందే స్పష్టం చేసినట్లు, 50-50 భాగస్వామ్య వ్యాపారం మీ జాతకానికి ఖచ్చితంగా నిషిద్ధం! 7వ భావ స్థితి ప్రకారం భాగస్వామ్యం వల్ల ఆర్థిక నష్టాలు మరియు స్నేహంలో విభేదాలు కలుగుతాయి.`;
      const p2 = `రెండు చేతులు కలిస్తే శబ్దం రావచ్చు కానీ వ్యాపారపు సారథ్యం ఒక్కరి చేతిలోనే స్థిరంగా ఉంటుంది కాబట్టి, స్వతంత్ర వ్యాపారం చేయండి లేదా ప్రస్తుత ఉద్యోగంలో కొనసాగండి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு (100% சாஸ்திர முடிவு): முன்பே உறுதிப்படுத்தியபடி, 50-50 கூட்டாண்மை (Partnership) தொழில் உங்கள் ஜாதகத்திற்கு முற்றிலும் தடைசெய்யப்பட்டுள்ளது! நெருங்கிய நண்பருடன் கூட்டுத் தொழில் செய்தாலும் கருத்து வேறுபாடும் நிதி நஷ்டமும் ஏற்படும்.`;
      const p2 = `இரண்டு சுக்கான் கொண்ட படகு அலைகளில் தடுமாறுவது போல கூட்டு முடிவில் குழப்பம் வரும். எனவே தனிப்பட்ட சொந்தத் தொழில் செய்யுங்கள் அல்லது தற்போதைய வேலையில் நிலைத்து முன்னேறுங்கள்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ് (100% ശാസ്ത്രീയ സത്യം): മുൻപ് വ്യക്തമാക്കിയതുപോലെ, 50-50 പങ്കാളിത്ത ബിസിനസ്സ് നിങ്ങളുടെ ജാതകപ്രകാരം കർശനമായി ഒഴിവാക്കേണ്ടതാണ്! അടുത്ത സുഹൃത്തുമായുള്ള കൂട്ടുകച്ചവടം പോലും സൗഹൃദത്തിൽ അകൽച്ചയ്ക്കും ധനനഷ്ടത്തിനും വഴിവെക്കും.`;
      const p2 = `രണ്ട് ചുക്കാൻ പിടിക്കുന്ന തോണി തിരമാലകളിൽ ആടിയുലയുന്നതുപോലെ പങ്കാളിത്തത്തിൽ തീരുമാനങ്ങൾ തെറ്റാനിടയുണ്ട്. സ്വന്തം നിലയിൽ ബിസിനസ്സ് തുടങ്ങുകയോ ജോലിയിൽ ഉറച്ചുനിൽക്കുകയോ ചെയ്യുക.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत): पूर्वी स्पष्ट केल्याप्रमाणे, ५०-५० भागीदारी व्यवसाय आपल्या कुंडलीनुसार पूर्णपणे वर्जित आहे! आपल्या सप्तम भावातील ग्रहस्थितीनुसार जवळच्या मित्रासोबतही भागीदारी केल्यास मतभेद, आर्थिक नुकसान आणि नात्यात दुरावा येणे निश्चित आहे.`;
      const p2 = `जसे दोन सुकाणू असलेली नाव लाटांवर डगमगते, तसेच संमिश्र भागीदारीत निर्णय फिसकटतात; म्हणून केवळ स्वतःचा स्वतंत्र व्यवसाय करा किंवा चालू नोकरीतच स्थिर प्रगती साधा.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ (೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ತೀರ್ಮಾನ): ನಾನು ಮೊದಲೇ ಸಂಪೂರ್ಣ ಖಚಿತತೆಯೊಂದಿಗೆ ಸ್ಪಷ್ಟಪಡಿಸಿದಂತೆ, ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಯಾವುದೇ ಪಾಲುದಾರಿಕೆ (Partnership) ವ್ಯವಹಾರವು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧವಾಗಿದೆ! ಯಾರೇ ಆತ್ಮೀಯ ಸ್ನೇಹಿತರಾಗಲಿ, ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ವ್ಯಾಪಾರ ಆರಂಭಿಸಿದರೆ ವಂಚನೆ, ಹಣದ ನಷ್ಟ ಹಾಗೂ ಸಂಬಂಧಗಳು ಮುರಿದುಬೀಳುವುದು ಖಚಿತ.`;
    const p2 = `ಒಂದೇ ದೋಣಿಗೆ ಇಬ್ಬರು ಚುಕ್ಕಾಣಿ ಹಿಡಿದರೆ ದಿಕ್ಕು ತಪ್ಪುವಂತೆ, ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ನಿರ್ಧಾರಗಳು ಹಳಿತಪ್ಪುತ್ತವೆ. ನಿಮ್ಮ ಏಳಿಗೆಗೆ ಸ್ವತಂತ್ರ ಮಾಲೀಕತ್ವ ಅಥವಾ ಕುಟುಂಬದ ಶುಭ ಜಾತಕದ ಹೆಸರಿನಲ್ಲಿ ಮಾತ್ರ ವ್ಯಾಪಾರ ಮಾಡುವುದು ಶ್ರೇಯಸ್ಕರ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 5. SPECULATIVE FRESH DEBT PROBE
  const isFreshDebtQuery =
    /ಮತ್ತೆ ಸಾಲ|ಹೊಸ ಸಾಲ|ಇನ್ನಷ್ಟು ಸಾಲ|fresh loan|more debt|take loan to invest|another loan|और कर्ज|नया कर्ज|కొత్త అప్పు|మళ్ళీ అప్పు|మరో లోన్|புதிய கடன்|மீண்டும் கடன்|இன்னொரு கடன்|പുതിയ കടം|വീണ്ടും വായ്പ|വീണ്ടും കടം|नवीन कर्ज|आणखी कर्ज|पुन्हा कर्ज/i.test(
      qLower
    );
  const debtRecord = ledger.find((r) => r.domain === "DEBT_FINANCIAL_RELIEF");
  if (isFreshDebtQuery && debtRecord) {
    if (lang === "en") {
      const p1 = `Vedic Jyotisha Absolute Truth: Taking fresh speculative debt or high-interest loans to cover liabilities is strictly warned against! Borrowing again to speculate in volatile markets will multiply your financial burden rather than relieve it.`;
      const p2 = `Just as pouring water into a cracked earthen pot drains faster than you fill it, new loans only deepen the leak. Seal existing EMIs systematically through disciplined budgeting alongside Runavimochana Mangala Stotra and incoming benefic transits.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): वर्तमान में कोई भी नया कर्ज या अनौपचारिक ऋण लेना आपकी कुंडली के अनुसार सख्त मना है! नया कर्ज आपको और गहरे आर्थिक संकट में डाल देगा।`;
      const p2 = `जैसे टूटे घड़े में ऊपर से पानी डालने से वह खाली ही रहता है, वैसे ही नए उधार से पुराना कर्ज नहीं कटता। पुराने कर्ज को योजनाबद्ध तरीके से चुकाने और ऋणविमोचन मंगल स्तोत्र के पाठ पर ध्यान दें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం: ప్రస్తుతం ఎటువంటి కొత్త అప్పులు లేదా అధిక వడ్డీ రుణాలు తీసుకోవద్దు! పాత అప్పు తీర్చడానికి లేదా పెట్టుబడి కోసం మళ్లీ అప్పు చేస్తే ఆర్థిక భారం రెట్టింపవుతుంది.`;
      const p2 = `చిల్లు పడిన కుండలో నీరు పోసినట్లుగా కొత్త అప్పు నిలకడనివ్వదు; క్రమశిక్షణతో ఉన్న అప్పులను క్రమంగా తీర్చడంపై దృష్టి పెడుతూ ఋణవిమోచన మంగళ స్తోత్రం పఠించండి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு: தற்சமயம் எந்தவொரு புதிய கடனையும் வாங்கக் கூடாது! பழைய கடனை அடைக்கவோ முதலீட்டிற்கோ மீண்டும் கடன் வாங்குவது நிதிச்சுமையைப் பன்மடங்கு அதிகரிக்கும்.`;
      const p2 = `ஓட்டைப் பானையில் தண்ணீர் ஊற்றுவது போல புதிய கடன் பலன் தராது; சிக்கனத்துடன் பழைய கடன்களை முறைப்படி அடைப்பதில் கவனம் செலுத்தி ருணவிமோசன மங்கள ஸ்தோத்திரம் பாராயணம் செய்யுங்கள்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: നിലവിൽ പുതിയ വായ്പകളോ കടങ്ങളോ എടുക്കരുത്! പഴയ ബാധ്യതകൾ തീർക്കാനോ നിക്ഷേപത്തിനോ വീണ്ടും കടമെടുക്കുന്നത് സാമ്പത്തിക പ്രതിസന്ധി രൂക്ഷമാക്കും.`;
      const p2 = `ഓട്ടയുള്ള കുടത്തിൽ വെള്ളം നിറയ്ക്കുന്നതുപോലെ പുതിയ കടം കൊണ്ട് പ്രയോജനമില്ല; കൃത്യമായ സാമ്പത്തിക അച്ചടക്കത്തോടെ പഴയ കടങ്ങൾ തീർക്കാൻ മുൻഗണന നൽകുക.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: सध्या कोणतेही नवीन कर्ज घेऊ नका! जुने कर्ज फेडण्यासाठी किंवा गुंतवणुकीसाठी पुन्हा कर्ज काढल्यास आर्थिक संकट अधिक गडद होईल.`;
      const p2 = `ज्याप्रमाणे गळक्या मडक्यात पाणी साठत नाही, तसेच नवीन कर्जाने स्थैर्य येत नाही; शिस्तबद्ध नियोजनाने जुने कर्ज हळूहळू फेडण्यावर लक्ष केंद्रित करा.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ಶಾಸ್ತ್ರೋಕ್ತ ನಿಶ್ಚಿತ ಸತ್ಯ: ಹಳೆಯ ಸಾಲವನ್ನು ಮುಚ್ಚಲು ಮತ್ತೆ ಹೊಸ ಸಾಲ ಅಥವಾ ಹೆಚ್ಚಿನ ಬಡ್ಡಿಯ ಸಾಲವನ್ನು ಮಾಡುವುದನ್ನು ಶಾಸ್ತ್ರವು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ವಿರೋಧಿಸುತ್ತದೆ! ಹೊಸ ಸಾಲದಿಂದ ಹೂಡಿಕೆ ಅಥವಾ ಹಳೆಯ ಹೊರೆ ಕಡಿಮೆಯಾಗುವುದಿಲ್ಲ.`;
    const p2 = `ಒಡೆದ ಕೊಡದಲ್ಲಿ ನೀರು ತುಂಬಿದಂತೆ ಹೊಸ ಸಾಲವು ನೆಮ್ಮದಿಯನ್ನು ಹಾಳುಮಾಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ಸಾಲವನ್ನು ನಿಯಮಿತವಾಗಿ ತೀರಿಸಿ; ಶ್ರೀ ಋಣವಿಮೋಚನ ಮಂಗಳ ಸ್ತೋತ್ರದ ಪಠಣೆಯಿಂದ ಶೀಘ್ರವೇ ಸಾಲಮುಕ್ತಿ ಸಾಧ್ಯವಾಗಲಿದೆ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 6. ABROAD PERMANENT SETTLEMENT PROBE
  const isAbroadQuery =
    /ವಿದೇಶ|ಪರದೇಶ|ಕೆನಡಾ|ಕನಡ|ಅಮೆರಿಕ|ಜರ್ಮನಿ|ಯೂರೋಪ್|ಶಾಶ್ವತ.*ನೆಲೆ|ಶಾಶ್ವತ.*ವಾಸ|ನೆಲೆಸ|permanent.*settle|settle.*abroad|foreign.*pr|foreign.*citizen|settle.*outside|विदेश.*बसना|विदेश.*स्थायी|విదేశ|శాశ్వతంగా|స్థిరపడ|గ్రీన్ కార్డ్|అమెరికా|కెనడా|வெளிநாட்|நிரந்தரமாக|குடியேற|அமெரிக்கா|கனடா|വിദേശ|സ്ഥിരതാമസം|സ്ഥിരമായി|അമേരിക്ക|കാനഡ|परदेश|विदेशात|कायमस्वरूपी|स्थायिक|अमेरिका|कॅनडा/i.test(
      qLower
    );
  const abroadRecord = ledger.find((r) => r.domain === "ABROAD_SETTLEMENT");
  if (isAbroadQuery && (abroadRecord || ledger.some((r) => /swadesha|ಭಾರತದಲ್ಲೇ|स्वदेश/i.test(r.primaryVerdict || "")))) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling (100% Authoritative Determination): As firmly ruled in our earlier determination with 100% certainty, permanent settlement or foreign citizenship outside India is STRICTLY UNFAVORABLE for your chart! While short-term project assignments or higher educational travel are permitted during favorable Dasha periods, anchoring your permanent home, family assets, and life in Swadesha (India) is where your true prosperity and peace reside. Do not seek permanent emigration.`;
      const p2 = `Maintain your roots firmly in India and recite Aditya Hridaya Stotra daily for sovereign career growth.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): जैसा कि हमने पूर्व में स्पष्ट किया है, भारत छोड़कर विदेश में स्थायी रूप से बसना अथवा नागरिकता लेना आपकी कुंडली के अनुसार पूर्णतः प्रतिकूल है! अल्पकालिक प्रोजेक्ट अथवा उच्च शिक्षा हेतु यात्रा उचित है, किंतु स्थायी निवास स्वदेश (भारत) में ही आपके लिए परम मंगलकारी है।`;
      const p2 = `नित्य आदित्य हृदय स्तोत्र का पाठ करें एवं कुलदेवता का स्मरण करें।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ నిశ్చిత నిర్ణయం (100% శాస్త్రోక్త తీర్పు): మేము గతంలో స్పష్టం చేసినట్లుగా, భారతదేశాన్ని విడిచి విదేశాలలో శాశ్వతంగా స్థిరపడటం లేదా విదేశీ పౌరసత్వం పొందడం మీ జాతకానికి అనుకూలం కాదు! స్వల్పకాలిక ప్రాజెక్ట్‌లు లేదా ఉన్నత విద్యాభ్యాసం కోసం విదేశీ ప్రయాణం శుభప్రదమైనప్పటికీ, మీ శాశ్వత సుఖం, కుటుంబ ప్రశాంతత మరియు స్థిరమైన అదృష్టం స్వదేశంలోనే (భారతదేశంలోనే) ఉన్నాయి.`;
      const p2 = `మీ శాశ్వత వృత్తి మరియు ఆస్తులను భారతదేశంలోనే స్థిరపరచుకోండి; రోజూ ఆదిత్య హృదయ స్తోత్రం పఠించండి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `தெய்வக்ஞரின் உறுதியான சாஸ்திரத் தீர்ப்பு: முன்னர் தெளிவாகக் கூறியபடி, இந்தியாவை விட்டு வெளிநாட்டில் நிரந்தரமாகக் குடியேறுவதோ அல்லது வெளிநாட்டுக் குடியுரிமை பெறுவதோ உங்கள் ஜாதகத்திற்கு சாதகமற்றது! குறுகிய காலத் திட்டப் பணிகள் அல்லது உயர்கல்விக்கான வெளிநாட்டுப் பயணம் நன்மையளிக்கும் என்றாலும், உங்கள் நிரந்தர மகிழ்ச்சி, குடும்ப அமைதி மற்றும் நிலைத்த செல்வம் தாய்நாட்டிலேயே (இந்தியாவிலேயே) அமைந்துள்ளது.`;
      const p2 = `நிரந்தரப் பணி மற்றும் சொத்துக்களை இந்தியாவிலேயே அமைத்துக் கொள்ளுங்கள்; தினமும் ஆதித்ய ஹிருதய ஸ்தோத்திரம் பாராயணம் செய்யுங்கள்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ് (100% ശാസ്ത്രീയ സത്യം): മുൻപ് വ്യക്തമാക്കിയതുപോലെ, ഭാരതം വിട്ട് വിദേശത്ത് സ്ഥിരതാമസമാക്കുന്നതോ വിദേശ പൗരത്വം നേടുന്നതോ നിങ്ങളുടെ ജാതകപ്രകാരം ശുഭകരമല്ല! ഹ്രസ്വകാല പ്രോജക്ടുകൾക്കോ ഉപരിപഠനത്തിനോ വേണ്ടിയുള്ള വിദേശയാത്രകൾ ഗുണകരമാണെങ്കിലും, നിങ്ങളുടെ ശാശ്വത സമാധാനവും കുടുംബ ഐശ്വര്യവും സ്വദേശത്താണ് (ഭാരതത്തിൽ).`;
      const p2 = `നിങ്ങളുടെ സ്ഥിരമായ ജോലിയും സ്വത്തുക്കളും ഭാരതത്തിൽ തന്നെ ഉറപ്പിക്കുക; ദിവസവും ആദിത്യ ഹൃദയ സ്തോത്രം ജപിക്കുക.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): पूर्वी स्पष्ट केल्याप्रमाणे, भारत सोडून परदेशात कायमस्वरूपी स्थायिक होणे किंवा परदेशी नागरिकत्व घेणे आपल्या पत्रिकेनुसार पूर्णपणे प्रतिकूल आहे! अल्पकालीन प्रोजेक्ट किंवा उच्च शिक्षणासाठी परदेश प्रवास अनुकूल असला, तरी आपले कायमस्वरूपी सुख, कौटुंबिक शांतता आणि स्थिर भाग्य स्वदेशातच (भारतातच) आहे.`;
      const p2 = `आपली कायमची नोकरी आणि मालमत्ता भारतातच ठेवा; नित्य आदित्य हृदय स्तोत्राचे पठण करा.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ (೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ತೀರ್ಮಾನ): ನಾನು ಮೊದಲೇ ಸಂಪೂರ್ಣ ಖಚಿತತೆಯೊಂದಿಗೆ ಸ್ಪಷ್ಟಪಡಿಸಿದಂತೆ, ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಭಾರತವನ್ನು ಬಿಟ್ಟು ವಿದೇಶದಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ನೆಲೆಸುವುದು ಅಥವಾ ವಿದೇಶಿ ಪೌರತ್ವ ಪಡೆಯುವುದು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಅಶುಭಕರವಾಗಿದೆ! ಅಲ್ಪಾವಧಿಯ ತಾಂತ್ರಿಕ ಪ್ರಾಜೆಕ್ಟ್ ಅಥವಾ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ವಿದೇಶ ಪ್ರಯಾಣ ಶುಭವಾದರೂ, ನಿಮ್ಮ ಶಾಶ್ವತ ಸುಖ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸ್ಥಿರ ಭಾಗ್ಯವು ಸ್ವದೇಶದಲ್ಲೇ (ಭಾರತದಲ್ಲೇ) ನೆಲೆಸಿದೆ.`;
    const p2 = `ನಿಮ್ಮ ಶಾಶ್ವತ ಉದ್ಯೋಗ ಮತ್ತು ಆಸ್ತಿಗಳನ್ನು ಭಾರತದಲ್ಲೇ ಸ್ಥಾಪಿಸಿ; ನಿತ್ಯವೂ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರವನ್ನು ಪಠಿಸಿ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 7. BLUE SAPPHIRE (NEELAM) PROBE (when prohibited in ledger)
  const isNeelamQuery = /ನೀಲಂ|ನೀಲ|ಇಂದ್ರನೀಲ|blue sapphire|neelam|नीलम|నీలం|நீலம்|നീലക്കല്ല്|नीलम रत्न/i.test(qLower);
  const isNeelamRejected = gemRecord?.rejectedOptions?.some((opt) => /blue sapphire|neelam|ನೀಲಂ|ನೀಲ/i.test(opt));
  if (isNeelamQuery && isNeelamRejected) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling (100% Authoritative Determination): Blue Sapphire (Neelam) is STRICTLY PROHIBITED for your chart! Saturn acts as a malefic or Maraka/Dusthana lord for your Lagna. Wearing Blue Sapphire will trigger sudden health setbacks, mental anxiety, and professional instability. Adhere strictly to your prescribed Vedic gemstone.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): आपकी कुंडली के लिए नीलम (Blue Sapphire) पूर्णतः वर्जित है! आपकी लग्न कुंडली में शनि मारक अथवा त्रिक भाव का स्वामी है। नीलम पहनने से स्वास्थ्य हानि एवं मानसिक बेचैनी हो सकती है। केवल अपने निर्धारित रत्न को ही धारण करें।`;
      return deduplicateResponseText(p1);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం: నీలం (Blue Sapphire) రత్నం మీ జాతకానికి ఖచ్చితంగా నిషిద్ధం! మీ లగ్నానికి శని మారక లేదా దుస్థాన ఫలితాలను ఇస్తున్నందున, ఒకవేళ నీలం ధరిస్తే అనవసర ఆరోగ్య సమస్యలు మరియు మానసిక అశాంతి కలగవచ్చు.\n\nమీ లగ్నాధిపతికి అనుకూలమైన శాస్త్రోక్త రత్నాన్ని మాత్రమే ధరించి మనశ్శాంతితో ముందుకు సాగండి.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு: நீலம் (Blue Sapphire) ரத்தினம் உங்கள் ஜாதகத்திற்குத் தடைசெய்யப்பட்டுள்ளது! உங்கள் லக்னத்திற்கு சனி மாரக அல்லது துஸ்தான ஆதிபத்தியம் பெறுவதால், நீலம் அணிந்தால் தேவையற்ற மன அழுத்தமும் தொழிலில் தடங்கலும் ஏற்படலாம்.\n\nஉங்கள் ஜாதகத்திற்குரிய சுப ரத்தினத்தை மட்டுமே அணிவது முழுமையான பாதுகாப்பைத் தரும்.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: നീലക്കല്ല് (Blue Sapphire) നിങ്ങളുടെ ജാതകപ്രകാരം ധരിക്കാൻ പാടില്ലാത്തതാണ്! നിങ്ങളുടെ ലഗ്നത്തിന് ശനി ദോഷകരമായ ഭാവാധിപത്യത്തിൽ നിൽക്കുന്നതിനാൽ നീലക്കല്ല് ധരിക്കുന്നത് അനാവശ്യ ആശങ്കകളും ആരോഗ്യ-തൊഴിൽ തടസ്സങ്ങളും സൃഷ്ടിച്ചേക്കാം.\n\nലഗ്നാധിപന് അനുയോജ്യമായ ശാസ്ത്രോക്ത രത്നം മാത്രം ധരിക്കുക.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: नीलम रत्न आपल्या कुंडलीनुसार पूर्णपणे निषिद्ध आहे! आपल्या लग्नासाठी शनि हा मारक किंवा अशुभ स्थानाचा स्वामी असल्याने नीलम वापरल्यास विनाकारण मानसिक ताण व आरोग्याचे प्रश्न उद्भवू शकतात.\n\nआपल्या लग्नेशास अनुकूल असलेले शास्त्रसम्मत रत्नच धारण करावे.`;
      return deduplicateResponseText(p1);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ (೧೦೦% ಶಾಸ್ತ್ರೋಕ್ತ ತೀರ್ಮಾನ): ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಇಂದ್ರನೀಲ ಅಥವಾ ನೀಲಂ (Blue Sapphire) ರತ್ನವು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧವಾಗಿದೆ! ನಿಮ್ಮ ಲಗ್ನಕ್ಕೆ ಶನಿಯು ಮಾರಕ ಅಥವಾ ದುಸ್ಥಾನಾಧಿಪತಿಯಾಗಿದ್ದು, ನೀಲಂ ಧರಿಸಿದರೆ ಹಠಾತ್ ಅನಾರೋಗ್ಯ, ಮಾನಸಿಕ ತಲ್ಲಣ ಹಾಗೂ ಕಾರ್ಯಹಾನಿ ಸಂಭವಿಸುವುದು ನಿಶ್ಚಿತ. ನಿಮ್ಮ ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನಕ್ಕೆ ಮಾತ್ರ ಬದ್ಧರಾಗಿರಿ.`;
    return deduplicateResponseText(p1);
  }

  // 8. EMERALD (PANNA) PROBE (when prohibited in ledger)
  const isPannaQuery = /ಪಚ್ಚೆ|ಮರಕತ|emerald|panna|पन्ना|పచ్చ|மரகதம்|മരതകം|पाचू/i.test(qLower);
  const isPannaRejected = gemRecord?.rejectedOptions?.some((opt) => /emerald|panna|ಪಚ್ಚೆ/i.test(opt));
  if (isPannaQuery && isPannaRejected) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling: Emerald (Panna) is strictly NOT recommended for your chart as Mercury holds a Dusthana rulership! Energizing Mercury with Emerald will increase unnecessary expenditures and nervous tension. Please wear only your Lagna-approved primary gemstone.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय (१००% शास्त्रसम्मत सिद्धांत): पन्ना (Emerald) रत्न आपकी कुंडली के लिए शुभ नहीं है। लग्नेश के अनुकूल मुख्य रत्न ही धारण करें।`;
      return deduplicateResponseText(p1);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ ఖచ్చిత నిర్ణయం: పచ్చ (Emerald) రత్నం మీ జాతకానికి అనుకూలం కాదు. బుధుడు దుస్థాన అధిపత్యం వహిస్తున్నందున పచ్చ ధరిస్తే అనవసర ఖర్చులు పెరుగుతాయి.\n\nలగ్నాధిపతికి శుభప్రదమైన ప్రధాన రత్నాన్ని మాత్రమే ధరించండి.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் அறுதியான தீர்ப்பு: மரகதம் (Emerald) உங்கள் ஜாதகத்திற்குப் பொருந்தாது. புதன் துஸ்தான ஆதிபத்தியம் பெறுவதால் மரகதம் அணிவது தேவையற்ற மனச்சோர்வைத் தரலாம்.\n\nஉங்கள் லக்னாதிபதிக்குரிய சுப ரத்தினத்தையே அணியுங்கள்.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: മരതകം (Emerald) നിങ്ങളുടെ ജാതകത്തിന് യോജിച്ചതല്ല. ബുധൻ ദോഷഭാവങ്ങളുടെ അധിപനായതിനാൽ മരതകം ധരിക്കുന്നത് അനാവശ്യ ചെലവുകൾക്കും മാനസിക സമ്മർദ്ദത്തിനും കാരണമാകാം.\n\nലഗ്നാധിപന്റെ ശുഭരത്നം മാത്രം ധരിക്കുക.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: पाचू (Emerald) रत्न आपल्या कुंडलीसाठी अनुकूल नाही. बुध हा अशुभ भावांचा स्वामी असल्याने पाचू वापरल्यास अनावश्यक खर्च व चिंता वाढू शकतात.\n\nआपल्या लग्नेशाचे मुख्य शुभ रत्नच वापरावे.`;
      return deduplicateResponseText(p1);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ: ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಪಚ್ಚೆ (Emerald) ರತ್ನವು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ನಿಷೇಧವಾಗಿದೆ! ಬುಧನು ದುಸ್ಥಾನಾಧಿಪತಿಯಾಗಿದ್ದು, ಪಚ್ಚೆ ಧರಿಸುವುದರಿಂದ ಅನಾವಶ್ಯಕ ಖರ್ಚುಗಳು ಹಾಗೂ ನರಗಳ ದೌರ್ಬಲ್ಯ ಉಂಟಾಗಬಹುದು. ಲಗ್ನಾಧಿಪತಿಯ ಅಧಿಕೃತ ರತ್ನವನ್ನು ಮಾತ್ರ ಧರಿಸಿರಿ.`;
    return deduplicateResponseText(p1);
  }

  // 9. STOPPING MEDICAL TREATMENT / MEDICINE PROBE
  const isStopMedicineQuery =
    /ಔಷಧ.*ನಿಲ್ಲಿಸ|ಮಾತ್ರೆ.*ಬೇಡ|ಆಸ್ಪತ್ರೆ.*ಬೇಡ|stop.*medicine|stop.*doctor|only.*pooja|दवा.*बंद|दवाई.*छोड़|మందులు.*ఆప|మాత్రలు.*వద్ద|மருந்து.*நிறுத்த|மருத்துவம்.*வேண்டாம்|മരുന്ന്.*നിർത്ത|ഗുളിക.*വേണ്ട|औषध.*बंद|गोळ्या.*बंद/i.test(
      qLower
    );
  if (isStopMedicineQuery) {
    if (lang === "en") {
      const p1 = `Vedic Jyotisha Absolute Directive: You must NEVER discontinue your prescribed medicines or doctor's treatments! Classical Vedic Shastra states: 'Aushadham Jahnavi Toyam, Vaidyo Narayano Harih' - divine healing works through certified physicians and medicine. Continue your doctor's prescriptions conscientiously, alongside daily recitation of the Sri Dhanvantari Mantra and Gokarna Sankalpa for total restoration of vitality.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "hi") {
      const p1 = `वैदिक शास्त्र सम्मत अटल सिद्धांत: डॉक्टर द्वारा निर्धारित दवाइयां अथवा उपचार कभी बंद न करें! शास्त्र कहते हैं 'वैद्यो नारायणो हरिः' - ईश्वर की कृपा चिकित्सा के माध्यम से ही पूर्ण फलित होती है। दवा का नियमित सेवन जारी रखें और साथ में श्री धन्वंतरि मंत्र का पाठ करें।`;
      return deduplicateResponseText(p1);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ స్పష్ట హెచ్చరిక: డాక్టర్ ఇచ్చిన మందులను ఎట్టి పరిస్థితుల్లోనూ ఆపవద్దు! "వైద్యో నారాయణో హరిః" అన్నట్లుగా దైవకృప కూడా వైద్యం ద్వారానే త్వరగా ఫలిస్తుంది.\n\nవైద్యుల సలహా ప్రకారం మందులు కొనసాగిస్తూనే, ప్రతిరోజూ శ్రీ ధన్వంతరి మంత్రాన్ని జపించండి; ఆరోగ్యం త్వరలోనే మెరుగుపడుతుంది.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ta") {
      const p1 = `ஜோதிடரின் கண்டிப்பான எச்சரிக்கை: மருத்துவரின் மருந்துகளை ஒருபோதும் நிறுத்தாதீர்கள்! "வைத்யோ நாராயணோ ஹரி:" என்ற சாஸ்திர வாக்குப்படி இறைவனின் அருளும் மருத்துவத்தின் வழியாகவே செயல்படுகிறது.\n\nமருத்துவர் பரிந்துரைத்த சிகிச்சையைத் தொடர்ந்து எடுத்துக்கொண்டு, தினமும் ஸ்ரீ தன்வந்திரி மந்திரத்தை ஜெபியுங்கள்.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ കർശന മുന്നറിയിപ്പ്: ഡോക്ടറുടെ മരുന്നുകൾ ഒരിക്കലും നിർത്തരുത്! "വൈദ്യോ നാരాయണോ ഹരിഃ" എന്ന ശാസ്ത്രവചനപ്രകാരം ദൈവാനുഗ്രഹം ചികിത്സയിലൂടെയാണ് പൂർണ്ണമായി ഫലിക്കുന്നത്.\n\nഡോക്ടറുടെ നിർദ്ദേശപ്രകാരം മരുന്നുകൾ കൃത്യമായി തുടരുകയും അതോടൊപ്പം ശ്രീ ധന്വന്തരി മന്ത്രം ജപിക്കുകയും ചെയ്യുക.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ कडक इशारा: डॉक्टरांची औषधे किंवा उपचार कधीही बंद करू नका! "वैद्यो नारायणो हरिः" या शास्त्रवचनानुसार ईश्वरी कृपाही योग्य वैद्यकीय उपचारांद्वारेच फलद्रूप होते.\n\nऔषधोपचार नियमितपणे सुरू ठेवा आणि दररोज श्री धन्वंतरी मंत्राचे पठण करा; आरोग्यात निश्चित सुधारणा होईल.`;
      return deduplicateResponseText(p1);
    }
    // Kannada Default
    const p1 = `ಶಾಸ್ತ್ರೋಕ್ತ ಪರಮ ಸತ್ಯ: ವೈದ್ಯರು ನೀಡಿದ ಔಷಧ ಅಥವಾ ಚಿಕಿತ್ಸೆಯನ್ನು ಎಂದಿಗೂ ನಿಲ್ಲಿಸಬಾರದು! 'ಔಷಧಂ ಜಾನ್ಹವೀ ತೋಯಂ, ವೈದ್ಯೋ ನಾರಾಯಣೋ ಹರಿಃ' ಎಂದು ಶಾಸ್ತ್ರವೇ ಸಾರುತ್ತದೆ. ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಮುಂದುವರಿಸಿ, ಅದರ ಜತೆಗೆ ಶ್ರೀ ಧನ್ವಂತರಿ ಮಂತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಸಂಕಲ್ಪ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಮಾತ್ರ ಪರಿಪೂರ್ಣ ಆರೋಗ್ಯ ಭಾಗ್ಯ ಲಭಿಸಲಿದೆ.`;
    return deduplicateResponseText(p1);
  }

  // 10. ABRUPT JOB RESIGNATION / SPECULATIVE TRADING PROBE
  const isQuitJobQuery =
    /ಕೆಲಸ.*ಬಿಡಲಾ|ಉದ್ಯೋಗ.*ರಾಜೀನಾಮೆ|quit.*job.*now|leave.*job.*immediately|intraday.*trading|crypto.*trading|नौकरी.*छोड़|ఉద్యోగం.*వదిల|రాజీనామా|ట్రేడింగ్|வேலையை.*விடலாமா|ராஜினாமா|டிரேடிங்|ജോലി.*രാജി|ഉപേക്ഷിക്ക|ട്രേഡിംഗ്|नोकरी.*सोडू|राजीनामा|ट्रेडिंग/i.test(
      qLower
    );
  if (isQuitJobQuery) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling: Abruptly resigning from your employment or pouring savings into speculative day-trading/crypto is STRICTLY ADVISED AGAINST by your planetary configuration! Maintain your current employment with discipline until the upcoming auspicious Gochara window opens stable alternative avenues. Prudence and steady karma protect your wealth.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय: वर्तमान नौकरी को अचानक छोड़ना अथवा बचत के धन को शेयर बाजार के इंट्राडे ट्रेडिंग या सट्टे में लगाना आपकी ग्रह स्थिति अनुसार पूर्णतः वर्जित है! धैर्यपूर्वक अपनी वर्तमान नौकरी जारी रखें; आगामी शुभ गोचर तक संयम बनाए रखना ही आपकी आर्थिक सुरक्षा है।`;
      return deduplicateResponseText(p1);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ నిశ్చిత నిర్ణయం: ప్రస్తుత ఉద్యోగానికి హఠాత్తుగా రాజీనామా చేయడం లేదా పొదుపు మొత్తాన్ని డే-ట్రేడింగ్ వంటి ఊహాజనిత వ్యాపారాలలో పెట్టడం మీ జాతకానికి కచ్చితంగా నిషేధం! ప్రస్తుత ఉద్యోగంలో క్రమశిక్షణతో కొనసాగండి; రాబోయే శుభ గోచారం వరకు ఓపిక పట్టడమే మీ ఆర్థిక స్థిరత్వానికి రక్ష.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ta") {
      const p1 = `தெய்வக்ஞரின் உறுதியான தீர்ப்பு: தற்போதைய வேலையை உடனடியாக ராஜினாமா செய்வதோ அல்லது சேமிப்பை பங்குச் சந்தை டே-டிரேடிங்கில் முதலீடு செய்வதோ உங்கள் ஜாதகத்திற்கு முற்றிலும் தடைசெய்யப்பட்டுள்ளது! தற்போதைய வேலையை பொறுப்புடன் தொடருங்கள்; வரும் நல்ல கிரகப் பெயர்ச்சி வரை பொறுமை காப்பதே உங்கள் பொருளாதாரத்திற்குப் பாதுகாப்பு.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: നിലവിലെ ജോലി പെട്ടെന്ന് ഉപേക്ഷിക്കുന്നതോ സമ്പാദ്യം ഊഹക്കച്ചവടങ്ങളിലോ ഡേ-ട്രേഡിംഗിലോ നിക്ഷേപിക്കുന്നതോ നിങ്ങളുടെ ജാതകപ്രകാരം കർശനമായി വിലക്കിയിരിക്കുന്നു! നിലവിലെ ജോലിയിൽ ശ്രദ്ധയോടെ തുടരുക; വരാനിരിക്കുന്ന ശുഭ ഗ്രഹചാരം വരെ ക്ഷമയോടെ കാത്തിരിക്കുക.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: चालू नोकरीचा अचानक राजीनामा देणे किंवा बचतीचे पैसे शेअर बाजारातील डे-ट्रेडिंग अथवा सट्टेबाजीत गुंतवणे आपल्या कुंडलीनुसार पूर्णपणे वर्जित आहे! चालू नोकरी संयमाने सुरू ठेवा; आगामी शुभ गोचरापर्यंत संयम बाळगणेच आपल्या आर्थिक सुरक्षिततेसाठी आवश्यक आहे.`;
      return deduplicateResponseText(p1);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ: ಪ್ರಸ್ತುತ ಕೆಲಸಕ್ಕೆ ಹಠಾತ್ತನೆ ರಾಜೀನಾಮೆ ನೀಡುವುದಾಗಲಿ ಅಥವಾ ಷೇರು ಮಾರುಕಟ್ಟೆಯ ಡೇ-ಟ್ರೇಡಿಂಗ್ ಮುಂತಾದ ಊಹಾತ್ಮಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಹಣ ತೊಡಗಿಸುವುದಾಗಲಿ ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧವಾಗಿದೆ! ಪ್ರಸ್ತುತ ಉದ್ಯೋಗವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಮುಂದುವರಿಸಿ, ಮುಂದಿನ ಶುಭ ಗ್ರಹ ಸಂಚಾರದವರೆಗೂ ತಾಳ್ಮೆಯಿಂದ ಇರುವುದೇ ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಗೆ ಶ್ರೀರಕ್ಷೆ.`;
    return deduplicateResponseText(p1);
  }

  // 11. DISPUTED / LITIGATION PROPERTY PROBE
  const isDisputedPropertyQuery =
    /(?:ವಿವಾದಿತ|ಕೋರ್ಟ್.*ವ್ಯಾಜ್ಯ|disputed|litigation).*(?:ಜಮೀನ|ಆಸ್ತಿ|ಭೂಮಿ|ಸ್ಥಳ|property|land|plot)|विवादित.*संपत्ति|వివాదాస్పద.*ఆస్తి|కోర్టు.*భూమి|சர்ச்சைக்குரிய.*நிலம்|வழக்கு.*சொத்து|തർക്ക.*ഭൂమి|കേസ്.*വസ്തു|वादग्रस्त.*मालमत्ता|कोर्ट.*जमीन/i.test(
      qLower
    );
  if (isDisputedPropertyQuery) {
    if (lang === "en") {
      const p1 = `Master Daivajna Confident Ruling: Purchasing disputed litigation property, encumbered land, or speculative plots is STRICTLY PROHIBITED for your chart! Such investments will only entangle your hard-earned wealth in protracted legal quagmires. Acquire only clear-title residential or agricultural property.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "hi") {
      const p1 = `दैवज्ञ निश्चित निर्णय: किसी भी विवादित संपत्ति, अदालती मुकदमे वाली जमीन अथवा संदेहास्पद प्लॉट को खरीदना आपकी कुंडली के अनुसार पूर्णतः वर्जित है! ऐसे सौदे आपकी गाढ़ी कमाई को लंबे मुकदमों में फंसा देंगे। केवल स्पष्ट दस्तावेज (Clear Title) वाली निर्दोष संपत्ति ही खरीदें।`;
      return deduplicateResponseText(p1);
    }
    if (lang === "te") {
      const p1 = `దైవజ్ఞ నిశ్చిత నిర్ణయం: ఎలాంటి వివాదాస్పద ఆస్తి, కోర్టు కేసులలో ఉన్న భూమి లేదా వివాదాల్లో ఉన్న స్థలాలను కొనుగోలు చేయడం మీ జాతకానికి కచ్చితంగా నిషిద్ధం! ఇటువంటి లావాదేవీలు మీ కష్టార్జితాన్ని దీర్ఘకాలిక వివాదాలలో చిక్కుకునేలా చేస్తాయి. కేవలం క్లియర్ టైటిల్ ఉన్న శుద్ధమైన ఆస్తిని మాత్రమే కొనుగోలు చేయండి.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ta") {
      const p1 = `தெய்வக்ஞரின் உறுதியான தீர்ப்பு: நீதிமன்ற வழக்கில் உள்ள நிலம், சர்ச்சைக்குரிய சொத்து அல்லது சிக்கலான இடங்களை வாங்குவது உங்கள் ஜாதகத்திற்கு முற்றிலும் தடைசெய்யப்பட்டுள்ளது! இத்தகைய பரிவர்த்தனைகள் உங்கள் கடின உழைப்பின் பணத்தை நீண்டகால வழக்குகளில் சிக்க வைத்துவிடும். தெளிவான ஆவணங்கள் (Clear Title) கொண்ட நிலத்தை மட்டுமே வாங்குங்கள்.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "ml") {
      const p1 = `ദൈവജ്ഞ നിശ്ചിത തീർപ്പ്: കോടതി വ്യവഹാരങ്ങളിലുള്ള ഭൂമിയോ തർക്കമുള്ള വസ്തുക്കളോ വാങ്ങുന്നത് നിങ്ങളുടെ ജാതകപ്രകാരം കർശനമായി വിലക്കിയിരിക്കുന്നു! ഇത്തരം ഇടപാടുകൾ നിങ്ങളുടെ അധ്വാനഫലം ദീർഘകാല കേസുകളിൽ കുടുക്കും. വ്യക്തമായ രേഖകളുള്ള (Clear Title) ഭൂമി മാത്രം വാങ്ങുക.`;
      return deduplicateResponseText(p1);
    }
    if (lang === "mr") {
      const p1 = `दैवज्ञ निश्चित निर्णय: कोणतीही वादग्रस्त मालमत्ता, कोर्ट कचेरीची जागा किंवा संशयास्पद जमीन खरेदी करणे आपल्या पत्रिकेनुसार पूर्णपणे वर्जित आहे! अशा व्यवहारांमुळे आपली कष्टाची कमाई दीर्घकाळ वादात अडकून पडेल. केवळ निर्दोष कागदपत्रे (Clear Title) असलेलीच जागा खरेदी करा.`;
      return deduplicateResponseText(p1);
    }
    // Kannada Default
    const p1 = `ದೈವಜ್ಞ ನಿಶ್ಚಿತ ವಚನ: ಯಾವುದೇ ವಿವಾದಿತ ಆಸ್ತಿ, ಕೋರ್ಟ್ ವ್ಯಾಜ್ಯವಿರುವ ಜಮೀನು ಅಥವಾ ಅನುಮಾನಾಸ್ಪದ ನಿವೇಶನಗಳನ್ನು ಖರೀದಿಸುವುದು ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧವಾಗಿದೆ! ಇಂತಹ ವ್ಯವಹಾರಗಳು ನಿಮ್ಮ ಕಷ್ಟಾರ್ಜಿತ ಧನವನ್ನು ದೀರ್ಘಕಾಲೀನ ವ್ಯಾಜ್ಯಗಳಲ್ಲಿ ಸಿಲುಕಿಸುತ್ತವೆ. ಕೇವಲ ಕ್ಲಿಯರ್ ಟೈಟಲ್ ಇರುವ ನಿರ್ದೋಷ ಆಸ್ತಿಯನ್ನು ಮಾತ್ರ ಖರೀದಿಸಿ.`;
    return deduplicateResponseText(p1);
  }

  return null;
}


export function verifyAndHarmonizeWithPreviousAnswers(params: {
  session: ConsultationSession;
  userQuestion: string;
  candidateAnswer: string;
  conversationHistory?: AskGeminiChatTurn[];
  rulingsLedger?: ConsultationRulingRecord[];
}): {
  harmonizedText: string;
  isHarmonized: boolean;
  detectedDomain?: string;
} {
  const { session, userQuestion, candidateAnswer, conversationHistory, rulingsLedger } = params;
  const ledger = rulingsLedger || session.rulingsLedger || [];
  const lang = (session.language || "kn") as ConsultationLanguage;

  const historyJoined = (conversationHistory || []).map((h) => h.text).join("\n");

  // 1. Direct Ulta-Palta Probe Check
  const ultaPaltaMatch = detectAndResolveUltaPaltaProbe(userQuestion, ledger, lang, historyJoined);
  if (ultaPaltaMatch) {
    return {
      harmonizedText: ultaPaltaMatch,
      isHarmonized: true,
      detectedDomain: "ULTA_PALTA_PROBE"
    };
  }

  let text = candidateAnswer.trim();

  // 2. Scan past history to check if the candidate answer contradicts earlier determinations
  const historyText = (conversationHistory || []).map((h) => h.text).join("\n");

  // Cross-check: If Swadesha/India was earlier ruled for abroad settlement,
  // ensure the new answer does not advocate foreign PR / permanent relocation abroad
  const hadSwadeshaRuling =
    /swadesha|ಭಾರತದಲ್ಲೇ|स्वदेश|భారతదేశంలోనే|இந்தியாவிலேயே|ഭാരതത്തിൽ|ഇന്ത്യയിൽ|स्वदेशात|भारतातच/i.test(
      historyText
    );
  if (
    hadSwadeshaRuling &&
    /settle.*abroad|permanent.*relocation|take.*pr.*in.*(canada|usa|germany)|विदेश.*में.*स्थायी|విదేశాలలో శాశ్వత|வெளிநாட்டில் நிரந்தர|വിദേശത്ത് സ്ഥിര|परदेशात कायमस्वरूपी/i.test(
      text
    )
  ) {
    const correction = buildDeterministicAbroadSettlementReading(session, userQuestion, undefined, ledger, true);
    return {
      harmonizedText: correction,
      isHarmonized: true,
      detectedDomain: "ABROAD_SETTLEMENT"
    };
  }

  // Cross-check: If Yellow Sapphire / Blue Sapphire was prohibited,
  // ensure candidate answer NEVER advises wearing that prohibited stone
  const gemRecord = ledger.find((r) => r.domain === "GEMSTONE_REMEDY");
  if (gemRecord && gemRecord.rejectedOptions) {
    for (const rejected of gemRecord.rejectedOptions) {
      if (/yellow sapphire|pushparaga|pukhraj|ಪುಷ್ಯರಾಗ/i.test(rejected)) {
        if (/ಪುಷ್ಯರಾಗ.*ಧರಿಸಿ|wear.*yellow sapphire|wear.*pukhraj|पुखराज.*पहनें/i.test(text)) {
          const safeGem = gemRecord.approvedOptions?.[0] || "Diamond (Vajra)";
          text = text.replace(/ಪುಷ್ಯರಾಗ.*ಧರಿಸಿ/g, `${safeGem} ಧರಿಸಬೇಕು`);
          text = text.replace(/wear.*yellow sapphire/gi, `wear your prescribed ${safeGem}`);
          text = text.replace(/पुखराज.*पहनें/g, `${safeGem} धारण करें`);
        }
      }
      if (/blue sapphire|neelam|ನೀಲ/i.test(rejected)) {
        if (/ನೀಲಂ.*ಧರಿಸಿ|wear.*blue sapphire|wear.*neelam|नीलम.*पहनें/i.test(text)) {
          const safeGem = gemRecord.approvedOptions?.[0] || "prescribed gemstone";
          text = text.replace(/ನೀಲಂ.*ಧರಿಸಿ/g, `${safeGem} ಧರಿಸಬೇಕು`);
          text = text.replace(/wear.*blue sapphire/gi, `wear your prescribed ${safeGem}`);
          text = text.replace(/नीलम.*पहनें/g, `${safeGem} धारण करें`);
        }
      }
    }
  }

  // Cross-check: If 50-50 partnership was prohibited, ensure candidate answer does not recommend partnership
  const bizRecord = ledger.find((r) => r.domain === "BUSINESS_VS_JOB");
  if (bizRecord && bizRecord.rejectedOptions?.some((opt) => /partnership/i.test(opt))) {
    if (/ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ.*ವ್ಯಾಪಾರ.*ಮಾಡಿ|start.*partnership|partner.*with.*friend|साझेदारी.*करें/i.test(text)) {
      text = text.replace(/ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ.*ವ್ಯಾಪಾರ.*ಮಾಡಿ/g, "ಸ್ವತಂತ್ರ ಮಾಲೀಕತ್ವದಲ್ಲಿ (Sole Proprietorship) ವ್ಯಾಪಾರ ಮಾಡಿ");
      text = text.replace(/start.*partnership.*business/gi, "pursue sole proprietorship in your own name");
      text = text.replace(/साझेदारी.*व्यापार.*करें/g, "एकल स्वामित्व में व्यापार करें");
    }
  }

  // 3. Ensure answer is rich and detailed (good enough details for end user)
  if (text.length < 150) {
    const paddingByLang: Record<ConsultationLanguage, string> = {
      en: `\n\nUnder your running planetary Dasha and Gochara transits, maintain steady devotion and patience. Light a cow-ghee lamp daily and pray to Sri Kshetra Gokarna Mahabaleshwara for supreme peace and success.`,
      hi: `\n\nअपनी वर्तमान ग्रह दशा एवं गोचर प्रभाव को ध्यान में रखते हुए नियमित पुरुषार्थ एवं ईश्वर निष्ठा बनाए रखें। नित्य गाय के घी का दीपक प्रज्वलित कर श्री क्षेत्र गोकर्ण महाबलेश्वर का स्मरण करें।`,
      te: `\n\nమీ ప్రస్తుత గ్రహ దశా-భుక్తి మరియు గోచార బలానికి అనుగుణంగా ఓపికతో, దృఢ విశ్వాసంతో ముందుకు సాగండి. ప్రతిరోజూ ఆవు నేతి దీపం వెలిగించి శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వరుని ప్రార్థించడం వలన సకల శుభాలు కలుగుతాయి.`,
      ta: `\n\nஉங்கள் நடப்பு தசா-புக்தி மற்றும் கிரக சஞ்சாரத்திற்கு ஏற்ப பொறுமையுடனும் நம்பிக்கையுடனும் செயல்படுங்கள். தினமும் பசு நெய் தீபம் ஏற்றி ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகாபலேஸ்வரரை வழிபடுவது சகல நன்மைகளையும் தரும்.`,
      ml: `\n\nനിലവിലുള്ള ഗ്രഹ ദശാ-ഭുക്തികളും ഗോചര ഫലങ്ങളും അനുസരിച്ച് ക്ഷമയോടും ഈശ്വരവിശ്വാസത്തോടും കൂടി മുന്നോട്ട് നീങ്ങുക. ദിവസവും നെയ്‌വിളക്ക് കൊളുത്തി ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വരനെ പ്രാർത്ഥിക്കുന്നത് സർവ്വ മംഗളങ്ങളും നൽകും.`,
      mr: `\n\nआपल्या चालू ग्रह दशा-भुक्ती व गोचर बळानुसार संयम व श्रद्धेने पावले टाका. दररोज गाईच्या तुपाचा दिवा लावून श्री क्षेत्र गोकर्ण महाबळेश्वराचे स्मरण केल्यास सर्व कार्यात उत्तम यश लाभेल.`,
      kn: `\n\nನಿಮ್ಮ ಪ್ರಸ್ತುತ ಗ್ರಹ ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಗೋಚಾರ ಬಲಕ್ಕೆ ಅನುಗುಣವಾಗಿ ದೃಢ ಶ್ರದ್ಧೆಯಿಂದ ಮುನ್ನಡೆಯಿರಿ. ಪ್ರತಿದಿನ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪವನ್ನು ಹಚ್ಚಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯನ್ನು ಪ್ರಾರ್ಥಿಸುವುದರಿಂದ ಸಕಲ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.`
    };
    const padding = paddingByLang[lang] || paddingByLang.kn;
    text = `${text}${padding}`;
  }

  return {
    harmonizedText: deduplicateResponseText(text),
    isHarmonized: false
  };
}



/**
 * Generates an authentic, focused 1-to-2 paragraph gemstone reading.
 * Strictly adheres to the 80/20 golden rule with the direct recommendation front-loaded in sentence 1.
 */
export function buildDeterministicGemstoneReading(
  session: ConsultationSession,
  question: string,
  _astroData: DevoteeKundliComputedData | undefined,
  rec: AstrologicalRecommendationProfile,
  _isSubsequent: boolean,
  conversationHistory?: AskGeminiChatTurn[]
): string {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const gemName = rec.primaryGemstoneName[lang] || rec.primaryGemstoneName.kn;
  const metal = rec.idealMetal[lang] || rec.idealMetal.kn;
  const finger = rec.idealFinger[lang] || rec.idealFinger.kn;
  const wearingDayAndTime = rec.wearingDayAndTime[lang] || rec.wearingDayAndTime.kn;
  const mantra = rec.gemstoneMantra[lang] || rec.gemstoneMantra.kn;
  const benefits = rec.gemstoneBenefits[lang] || rec.gemstoneBenefits.kn;
  const substitute = rec.substituteGemstones[lang] || rec.substituteGemstones.kn;
  const incompatibilities = rec.gemstoneIncompatibilities[lang] || rec.gemstoneIncompatibilities.kn;

  const qLower = question.toLowerCase();

  // Multi-turn context inspection
  const historyText = conversationHistory
    ? conversationHistory.map((t) => t.text.toLowerCase()).join(" ")
    : "";
  const hasDiamondInHistory = /diamond|heera|ವಜ್ರ|हीरा|वज्र|వజ్రం|వైరం|വൈരം/i.test(historyText);
  const hasRejectedWhiteCoralInHistory = /white coral|safed moonga|ಬಿಳಿ ಹವಳ|white havala/i.test(historyText);

  // 0. SPECIFIC TULA (LIBRA) PUSHPARAGA (YELLOW SAPPHIRE) STRICT PROHIBITION INQUIRY
  const isTulaNative =
    /ತುಲಾ|tula|libra/i.test(_astroData?.lagnaName || "") ||
    /ತುಲಾ|tula|libra/i.test(_astroData?.moonRashi || "") ||
    /ತುಲಾ|tula|libra/i.test(question) ||
    /ತುಲಾ|tula|libra/i.test(session.place || "");

  const isPushparagaQuery =
    /ಪುಷ್ಯರಾಗ|ಪುಷ್ಯ|ಹಳದಿ ಪುಷ್ಯ|pushparaga|yellow sapphire|pukhraj|पुखराज|పుష్యరాగం|புஷ்பராகம்|പുഷ്യരാഗം/i.test(
      qLower
    );

  if (isPushparagaQuery && isTulaNative) {
    if (lang === "en") {
      const p1 = `100% Authoritative Astrological Determination (Pushparaga for Tula Prohibited): For your Tula (Libra) Lagna / Rashi, Yellow Sapphire (Pushparaga / Pukhraj) will NOT work and is STRICTLY PROHIBITED! In classical Parashari Jyotisha, Jupiter (Guru) is the functional lord of your 3rd house (effort/strain) and the 6th house (Roga/disease, Rina/debts, Shatru/enemies, and litigation). Even if Jupiter is naturally a benefic, or placed in the 9th or 11th house, or whatever transit Jupiter is currently undergoing, functional lordship of the 6th house takes absolute precedence (Adhipatya Dosha). Wearing Yellow Sapphire will directly energize your 6th house, inviting digestive and liver ailments, unexpected financial liabilities/debts, and workplace hostility. Therefore, Yellow Sapphire must never be worn for Tula.`;
      const p2 = `Your single scripture-approved benefic gemstone is Diamond (Vajra) or authentic natural White Zircon / White Opal in pure silver to empower your benefic Lagna Lord Venus. Setting White Zircon in silver and wearing it on a Friday morning will attract genuine wealth, marital harmony, and protective grace from Sri Kshetra Gokarna Mahabaleshwara.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `१००% प्रामाणिक दैवज्ञ निर्णय (तुला लग्न/राशि के लिए पुखराज पूर्णतः वर्जित): आपकी तुला लग्न अथवा तुला राशि के लिए पीला पुखराज (Yellow Sapphire) कभी फलदायी नहीं होगा और पूरी तरह वर्जित है! महर्षि पराशर के सिद्धांत के अनुसार, तुला लग्न में देवगुरु बृहस्पति तृतीय (कठिन परिश्रम) तथा षष्ठ भाव (रोग, ऋण, शत्रु एवं कोर्ट-कचहरी विवाद) के स्वामी होते हैं। गुरु कुंडली में भले ही किसी भी भाव में स्थित हों या वर्तमान गोचर में हों, षष्ठ भाव का आधिपत्य दोष सर्वोच्च रहता है। पुखराज धारण करने से रोग, अनावश्यक कर्ज और मानसिक अशांति बढ़ती है।`;
      const p2 = `तुला के लिए एकमात्र कल्याणकारी रत्न लग्नेश शुक्र का हीरा (Vajra) अथवा प्राकृतिक सफेद जरकन / ओपल है। इसे चांदी में बनवाकर शुक्रवार की सुबह धारण करने से सुख, ऐश्वर्य और श्री क्षेत्र गोकर्ण महाबलेश्वर की कृपा प्राप्त होगी।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `೧೦೦% ಖಚಿತ ಶಾಸ್ತ್ರೋಕ್ತ ತೀರ್ಮಾನ (ತುಲಾ ಲಗ್ನ/ರಾಶಿಗೆ ಪುಷ್ಯರಾಗ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಷೇಧ): ನಿಮ್ಮ ತುಲಾ ಲಗ್ನ ಅಥವಾ ತುಲಾ ರಾಶಿಗೆ ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire / Pukhraj) ರತ್ನವು ಶತಸಿದ್ಧವಾಗಿ ನಿಷೇಧವಾಗಿದ್ದು, ಎಂದಿಗೂ ಫಲಿಸುವುದಿಲ್ಲ! ಪರಾಶರ ಮಹರ್ಷಿಗಳ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ತುಲಾ ಲಗ್ನಕ್ಕೆ ಗುರುವು ೩ನೇ (ಅತಿಯಾದ ಪ್ರಯಾಸ) ಹಾಗೂ ೬ನೇ (ರೋಗ, ಋಣ/ಸಾಲ, ಶತ್ರು ಹಾಗೂ ನ್ಯಾಯಾಲಯದ ವ್ಯಾಜ್ಯ) ದುಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿದ್ದಾನೆ. ಜಾತಕದಲ್ಲಿ ಗುರುವು ನೈಸರ್ಗಿಕ ಶುಭಗ್ರಹವಾಗಿದ್ದರೂ, ಅಥವಾ ೯/೧೧ನೇ ಮನೆಗಳಲ್ಲಿದ್ದರೂ, ಅಥವಾ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಗೋಚಾರದಲ್ಲಿದ್ದರೂ, ೬ನೇ ಮನೆಯ ಅಧಿಪತ್ಯ ದೋಷವೇ ಪ್ರಮುಖವಾಗುತ್ತದೆ. ಇಂತಹ ಸ್ಥಿತಿಯಲ್ಲಿ ಪುಷ್ಯರಾಗ ಧರಿಸಿದರೆ ಹೊಟ್ಟೆ/ಯಕೃತ್ತಿನ ಕಾಯಿಲೆಗಳು, ತೀರಿಸಲಾಗದ ಸಾಲದ ಹೊರೆ ಹಾಗೂ ವಿವಾದಗಳು ಉಲ್ಬಣಗೊಳ್ಳುತ್ತವೆ.`;
    const p2 = `ತುಲಾ ಲಗ್ನಕ್ಕೆ ಶುಭವನ್ನು ತರುವ ಏಕೈಕ ರತ್ನವೆಂದರೆ ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರನ ವಜ್ರ (Diamond) ಅಥವಾ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon / White Opal). ಇದನ್ನು ಶುದ್ಧ ಬೆಳ್ಳಿಯ ಉಂಗುರದಲ್ಲಿ ಮಾಡಿಸಿ ಶುಕ್ರವಾರದಂದು ಧರಿಸುವುದರಿಂದ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ, ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ರಕ್ಷಣೆ ದೊರೆಯಲಿದೆ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // 1. SPECIFIC WHITE CORAL INQUIRY (e.g. Can I wear white coral instead of diamond? / Is white coral good for me?)
  const isWhiteCoralInquiry =
    /ಬಿಳಿ\s*ಹವಳ|white\s*coral|safed\s*moonga|safed\s*munga|सफेद\s*मूंगा|తెల్ల\s*పగడం|வெள்ளை\s*பவளம்|വെളുത്ത\s*പവിഴം|पांढरा\s*पोवळा|white\s*havala/i.test(
      qLower
    ) ||
    ((/ಹವಳ|coral|moonga|పగడం|பவளம்|പവിഴം|पोवळा/i.test(qLower) &&
      /ವಜ್ರ|diamond|heera|ಶುಕ್ರ|venus|वज्र|हीरा|వజ్రం|వైరం|വൈരം/i.test(qLower)));

  // 2. DIAMOND ALTERNATIVE / BUDGET INQUIRY (e.g. "I don't have money for diamond, alternative what do you suggest?")
  const isDiamondAlternativeInquiry =
    (!isWhiteCoralInquiry &&
      (/diamond|ವಜ್ರ|heera|हीरा|वज्र|వజ్రం|వైరం|വൈരം/i.test(qLower) ||
        (hasDiamondInHistory && !/ruby|emerald|sapphire|pearl|ಮಾಣಿಕ್ಯ|ಪಚ್ಚೆ|ಪುಷ್ಯರಾಗ|ನೀಲ|ಮುತ್ತು/i.test(qLower))) &&
      /alternative|substitute|expensive|money|cost|afford|budget|cheap|another|option|other|ಬೇರೆ|ಬದಲಿ|ಪರ್ಯಾಯ|ಹಣ|ಖರ್ಚು|ಕೈಗೆಟುಕುವ|ಬಜೆಟ್|बदला|सस्ता|पैसे|विकल्प|ఖర్చు|తక్కువ ధర|விலை|பட்ஜெட்|ചെലവ്|बजेट/i.test(
        qLower
      )) ||
    (hasDiamondInHistory &&
      hasRejectedWhiteCoralInHistory &&
      /alternative|substitute|what do you suggest|what else|other|ಬೇರೆ|ಬದಲಿ|ಪರ್ಯಾಯ/i.test(qLower));

  // --- WHITE CORAL INQUIRY RESOLUTION (TRUTH DIRECTLY UPFRONT) ---
  if (isWhiteCoralInquiry) {
    if (lang === "en") {
      const p1 = `According to authentic Vedic Jyotisha, White Coral (Safed Moonga / ಬಿಳಿ ಹವಳ) is strictly NOT a substitute for Diamond or Venus (Shukra). Coral is governed entirely by Mars (Kuja/Mangala), and White Coral is prescribed specifically to cool high Pitta, bodily heat, and severe Martian afflictions. It carries Martian frequencies, not Venusian energies. Therefore, you should NOT buy or wear White Coral in place of Diamond. If Diamond is outside your budget, the authentic scripture-approved Vedic substitutes (Uparatnas) for Venus are Natural White Zircon (Shveta Zircon), Natural White Opal, or Pure Sphatika (Clear Quartz). Setting any of these in silver and wearing it on a Friday on the middle or little finger will bestow genuine Venusian blessings.`;
      const p2 = `Always prioritize natural, untreated gemstones cleansed with sacred Vedic mantras. May the divine blessings of Sri Kshetra Gokarna Mahabaleshwara grant you enduring prosperity and joy.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `वैदिक ज्योतिष शास्त्र के अनुसार, सफेद मूंगा (White Coral) शुक्र ग्रह अथवा हीरे का विकल्प नहीं है। मूंगा पूर्णतः मंगल ग्रह का रत्न है और सफेद मूंगा केवल मंगल के अत्यधिक पित्त, शारीरिक ताप एवं क्रोधाग्नि को शांत करने के लिए धारण किया जाता है। अतः हीरे के स्थान पर सफेद मूंगा कभी धारण न करें। यदि हीरे का बजट नहीं है, तो शुक्र के शास्त्रसम्मत शुद्ध उपरत्न प्राकृतिक सफेद जरकन (White Zircon), सफेद ओपल (White Opal) अथवा शुद्ध स्फटिक हैं। इन्हें चांदी में बनवाकर शुक्रवार की सुबह मध्यमा या कनिष्ठिका उंगली में धारण करने से हीरे के समान शुभ फल प्राप्त होते हैं।`;
      const p2 = `श्री क्षेत्र गोकर्ण महाबलेश्वर के आशीर्वाद से यह शुद्ध उपरत्न आपके जीवन में ऐश्वर्य, शांति और सुख-समृद्धि प्रदान करेगा।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `వైదిక జ్యోతిష శాస్త్రం ప్రకారం, తెల్ల పగడం (White Coral) శుక్ర గ్రహానికి లేదా వజ్రానికి ప్రత్యామ్నాయ రత్నం కాదు. పగడం పూర్తిగా కుజ గ్రహానికి సంబంధించిన రత్నం. కుజుని అధిక వేడి, పిత్త దోషం మరియు రక్త సంబంధిత సమస్యలను తగ్గించడానికి మాత్రమే తెల్ల పగడం ధరిస్తారు. కాబట్టి వజ్రానికి బదులుగా తెల్ల పగడం ఎట్టి పరిస్థితుల్లోనూ ధరించరాదు. వజ్రానికి నిజమైన శాస్త్రోక్తమైన ఉపరత్నాలు సహజమైన వైట్ జిర్కాన్ (White Zircon), వైట్ ఓపల్ (White Opal) లేదా శుద్ధ స్ఫటికం. వీటిని వెండిలో చేయించి శుక్రవారం ఉదయం ధరించడం వల్ల వజ్రం లాంటి శుక్ర అనుగ్రహం లభిస్తుంది.`;
      const p2 = `శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్య ఆశీస్సులతో మీకు సమస్త శుభాలు, శాంతి మరియు సంపదలు చేకూరుతాయి.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `வேத ஜோதிட சாஸ்திரப்படி, வெள்ளை பவளம் (White Coral) சுக்கிர கிரகத்திற்கோ அல்லது வைரத்திற்கோ மாற்றான ரத்தினம் அல்ல. பவளம் முற்றிலும் செவ்வாய் (குஜ) கிரகத்திற்குரியது; பித்த தோஷத்தையும் அதிக உஷ்ணத்தையும் தணிக்க மட்டுமே வெள்ளை பவளம் பரிந்துரைக்கப்படுகிறது. எனவே வைரத்திற்குப் பதிலாக வெள்ளை பவளத்தை அணியக்கூடாது. வைரத்திற்கு உண்மையான மற்றும் சாஸ்திரப்பூர்வமான உப ரத்தினங்கள் இயற்கை வெள்ளை ஜிர்கான் (White Zircon), வெள்ளை ஓபல் (White Opal) அல்லது தூய ஸ்படிகம் ஆகும். இவற்றை வெள்ளியில் பதித்து வெள்ளிக்கிழமை அணிவதால் சுக்கிரனின் முழு அருள் கிட்டும்.`;
      const p2 = `ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமியின் திருவருளால் சகல காரியங்களிலும் வெற்றி மற்றும் சுபிக்ஷம் உண்டாகும்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `വേദ ജ്യോതിഷപ്രകാരം, വെളുത്ത പവിഴം (White Coral) ശുക്ര ഗ്രഹത്തിനോ വജ്രത്തിനോ പകരമുള്ള രത്നമല്ല. പവിഴം പൂർണ്ണമായും ചൊവ്വ (കുജ) ഗ്രഹത്തിന്റേതാണ്; അമിത പിത്തവും ഉഷ്ണവും ശമിപ്പിക്കാൻ മാത്രമാണ് വെളുത്ത പവിഴം ധരിക്കുന്നത്. അതിനാൽ വജ്രത്തിന് പകരം വെളുത്ത പവിഴം ധരിക്കരുത്. വജ്രത്തിന് ഏറ്റവും അനുയോജ്യമായ ഉപരത്നങ്ങൾ സ്വാഭാവിക വൈറ്റ് സിർക്കോൺ (White Zircon), വൈറ്റ് ഓപ്പൽ (White Opal) അല്ലെങ്കിൽ ശുദ്ധമായ സ്ഫടികം എന്നിവയാണ്. ഇവ വെള്ളിയിൽ തീർത്ത് വെള്ളിയാഴ്ച ധരിക്കുന്നത് ശുക്രന്റെ അനുഗ്രഹം നൽകും.`;
      const p2 = `ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിയുടെ അനുഗ്രഹത്താൽ ഐശ്വര്യവും സൗഭാഗ്യവും കൈവരും.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `वैदिक ज्योतिष शास्त्रानुसार, पांढरा पोवळा (White Coral) हा शुक्र ग्रहाचा किंवा हिऱ्याचा पर्याय नाही. पोवळा पूर्णपणे मंगळ ग्रहाचे रत्न आहे आणि शरीरातील अतिरिक्त उष्णता व पित्त शांत करण्यासाठीच पांढरा पोवळा वापरला जातो. त्यामुळे हिऱ्याच्या जागी पांढरा पोवळा अजिबात घालू नये. हिऱ्याचे खरे आणि शास्त्रोक्त उपरत्न म्हणजे नैसर्गिक पांढरा जरकन (White Zircon), पांढरा ओपल (White Opal) किंवा शुद्ध स्फटिक आहेत. हे चांदीत बनवून शुक्रवारी धारण केल्यास शुक्राची पूर्ण कृपा लाभते.`;
      const p2 = `श्री क्षेत्र गोकर्ण महाबळेश्वर यांच्या कृपेने तुमच्या जीवनात प्रगती, समाधान आणि यश लाभेल.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಬಿಳಿ ಹವಳವು (White Coral / Safed Moonga) ಶುಕ್ರ ಗ್ರಹಕ್ಕೆ ಅಥವಾ ವಜ್ರಕ್ಕೆ ಪರ್ಯಾಯ ರತ್ನವಲ್ಲ. ಹವಳವು ಸಂಪೂರ್ಣವಾಗಿ ಮಂಗಳ (ಕುಜ) ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ರತ್ನವಾಗಿದ್ದು, ಕುಜನ ಅಧಿಕ ಉಷ್ಣ, ಪಿತ್ತ ವಿಕಾರ ಮತ್ತು ರಕ್ತದೋಷವನ್ನು ಶಮನಗೊಳಿಸಲು ಮಾತ್ರ ಬಿಳಿ ಹವಳವನ್ನು ಧರಿಸಲಾಗುತ್ತದೆ. ಆದ್ದರಿಂದ ವಜ್ರದ ಬದಲು ಬಿಳಿ ಹವಳವನ್ನು ಎಂದಿಗೂ ಧರಿಸಬಾರದು. ವಜ್ರಕ್ಕೆ ನಿಜವಾದ ಮತ್ತು ಕೈಗೆಟುಕುವ ಶಾಸ್ತ್ರೋಕ್ತ ಉಪರತ್ನಗಳೆಂದರೆ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon), ನೈಸರ್ಗಿಕ ಬಿಳಿ ಓಪಲ್ (White Opal) ಅಥವಾ ಶುದ್ಧ ಸ್ಫಟಿಕ (Sphatika). ಇವುಗಳನ್ನು ಬೆಳ್ಳಿಯಲ್ಲಿ ಉಂಗುರ ಮಾಡಿಸಿ ಶುಕ್ರವಾರ ಧರಿಸುವುದರಿಂದ ವಜ್ರದಷ್ಟೇ ಪವಿತ್ರ ಶುಕ್ರಾನುಗ್ರಹ ಲಭಿಸುತ್ತದೆ.`;
    const p2 = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ರತ್ನವನ್ನು ಪವಿತ್ರಗೊಳಿಸಿ ಧರಿಸುವುದರಿಂದ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಸೌಭಾಗ್ಯ ಮತ್ತು ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // --- DIAMOND ALTERNATIVE / BUDGET INQUIRY RESOLUTION ---
  if (isDiamondAlternativeInquiry) {
    if (lang === "en") {
      const p1 = `If a natural Diamond is beyond your budget, Vedic astrology offers three authentic, highly potent, and affordable substitutes (Uparatnas) for Venus (Shukra): 1) Natural White Zircon (Shveta Zircon - closest optical and energetic frequency to Diamond), 2) Natural Australian White Opal, or 3) Pure Sphatika (Clear Quartz). Important reminder: Never substitute Diamond with White Coral, as Coral belongs strictly to Mars. Have your chosen substitute gemstone set in pure silver and wear it on your middle or little finger on a Friday morning during Shukla Paksha after chanting 'Om Shum Shukraya Namaha' 108 times.`;
      const p2 = `These authentic Vedic Uparatnas channel the exact benefic Venusian grace, enhancing creativity, marital happiness, and financial prosperity. May Lord Mahabaleshwara of Sri Kshetra Gokarna bless you with complete fulfillment.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "hi") {
      const p1 = `यदि हीरा आपके बजट से बाहर है, तो वैदिक ज्योतिष में शुक्र ग्रह के लिए तीन अत्यंत शुभ, शक्तिशाली एवं किफायती शास्त्रसम्मत उपरत्न बताए गए हैं: १) प्राकृतिक सफेद जरकन (White Zircon - हीरे का सर्वश्रेष्ठ विकल्प), २) प्राकृतिक सफेद ओपल (White Opal), अथवा ३) शुद्ध स्फटिक। ध्यान रहे कि हीरे के स्थान पर सफेद मूंगा कभी न पहनें, क्योंकि मूंगा मंगल का रत्न है। इनमें से किसी एक उपरत्न को शुद्ध चांदी में बनवाकर शुक्ल पक्ष के शुक्रवार की सुबह 'ॐ शुं शुक्राय नमः' मंत्र का १०८ बार जप करके मध्यमा या कनिष्ठिका उंगली में धारण करें।`;
      const p2 = `यह शास्त्रोक्त उपरत्न आपको हीरे के समान ही सुख, ऐश्वर्य और पारिवारिक सौहार्द प्रदान करेगा। श्री क्षेत्र गोकर्ण महाबलेश्वर की कृपा आप पर सदैव बनी रहे।`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "te") {
      const p1 = `వజ్రం ఖరీదైనది కావడం వల్ల మీ బడ్జెట్‌కు అనుకూలంగా లేకపోతే, వైదిక జ్యోతిషంలో శుక్ర గ్రహానికి మూడు అత్యంత శుభప్రదమైన, చవకైన ఉపరత్నాలు సూచించబడ్డాయి: 1) సహజ వైట్ జిర్కాన్ (White Zircon), 2) సహజ వైట్ ఓపల్ (White Opal), లేదా 3) శుద్ధ స్ఫటికం. గమనించండి, వజ్రానికి బదులుగా తెల్ల పగడం ఎప్పుడూ ధరించకూడదు, ఎందుకంటే పగడం కుజుడి రత్నం. ఈ ఉపరత్నాలలో ఒకదానిని శుద్ధ వెండిలో చేయించి, శుక్ల పక్షం శుక్రవారం ఉదయం 'ఓం శుం శుక్రాయ నమః' మంత్రాన్ని 108 సార్లు జపించి మధ్య వేలు లేదా చిటికెన వేలుకు ధరించాలి.`;
      const p2 = `ఈ దివ్య ఉపరత్నం వజ్రం లాంటి ఫలితాలను, దాంపత్య సుఖాన్ని మరియు ఆర్థిక శ్రేయస్సును అందిస్తుంది. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామి అనుగ్రహం మీకు సదా ఉండాలని ప్రార్థిస్తున్నాను.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ta") {
      const p1 = `வைரம் அதிக விலை கொண்டதாக இருந்து உங்கள் வசதிக்கு அப்பாற்பட்டதாக இருந்தால், வேத ஜோதிடத்தில் சுக்கிர கிரகத்திற்கு மூன்று சிறந்த மற்றும் மலிவான உப ரத்தினங்கள் பரிந்துரைக்கப்பட்டுள்ளன: 1) இயற்கை வெள்ளை ஜிர்கான் (White Zircon), 2) இயற்கை வெள்ளை ஓபல் (White Opal), அல்லது 3) தூய ஸ்படிகம். முக்கிய குறிப்பு: வைரத்திற்கு பதிலாக வெள்ளை பவளத்தை அணியக்கூடாது, ஏனெனில் பவளம் செவ்வாயின் ரத்தினம். இந்த உப ரத்தினத்தை சுத்தமான வெள்ளியில் பதித்து, சுக்கில பட்ச வெள்ளிக்கிழமை காலையில் 'ஓம் ஷும் சுக்ராய நமஹ' மந்திரத்தை 108 முறை ஜெபித்து நடுவிரல் அல்லது சுண்டுவிரலில் அணிய வேண்டும்.`;
      const p2 = `இது வைரத்திற்கு இணையான நற்பலன்களையும், குடும்ப அமைதியையும், பொருளாதார மேன்மையையும் தரும். ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமியின் ஆசிகள் உங்களுக்கு என்றும் துணை நிற்கும்.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "ml") {
      const p1 = `വജ്രം വാങ്ങാൻ സാമ്പത്തിക ബുദ്ധിമുട്ടുണ്ടെങ്കിൽ, വേദ ജ്യോതിഷത്തിൽ ശുക്ര ഗ്രഹത്തിനായി മൂന്ന് വിശേഷപ്പെട്ടതും ചെലവ് കുറഞ്ഞതുമായ ഉപരത്നങ്ങൾ നിർദ്ദേശിച്ചിട്ടുണ്ട്: 1) സ്വാഭാവിക വൈറ്റ് സിർക്കോൺ (White Zircon), 2) സ്വാഭാവിക വൈറ്റ് ഓപ്പൽ (White Opal), അല്ലെങ്കിൽ 3) ശുദ്ധമായ സ്ഫടികം. ശ്രദ്ധിക്കുക, വജ്രത്തിന് പകരമായി വെളുത്ത പവിഴം ഒരിക്കലും ധരിക്കരുത്, കാരണം പവിഴം ചൊവ്വയുടെ രത്നമാണ്. ഈ ഉപരത്നം ശുദ്ധമായ വെള്ളിയിൽ മോതിരം തീർത്ത്, ശുക്ലപക്ഷത്തിലെ വെള്ളിയാഴ്ച 'ഓം ശും ശുക്രായ നമഃ' മന്ത്രം 108 തവണ ജപിച്ച് നടുവിരലിലോ ചെറുവിരലിലോ ധരിക്കുക.`;
      const p2 = `ഇത് വജ്രത്തിന് തുല്യമായ ഗുണഫലങ്ങളും സാമ്പത്തിക അഭിവൃദ്ധിയും നൽകും. ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിയുടെ അനുഗ്രഹം ഉണ്ടാകട്ടെ.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    if (lang === "mr") {
      const p1 = `जर हिरा खरेदी करणे तुमच्या बजेटबाहेर असेल, तर वैदिक ज्योतिषात शुक्र ग्रहासाठी तीन अत्यंत प्रभावी आणि परवडणारे शास्त्रोक्त उपरत्न सांगितले आहेत: १) नैसर्गिक पांढरा जरकन (White Zircon), २) नैसर्गिक पांढरा ओपल (White Opal), किंवा ३) शुद्ध स्फटिक. लक्षात ठेवा, हिऱ्याच्या ऐवजी पांढरा पोवळा कधीही घालू नका, कारण पोवळा मंगळाचा आहे. यापैकी एक उपरत्न शुद्ध चांदीत बनवून, शुक्ल पक्षातील शुक्रवारी सकाळी 'ॐ शुं शुक्राय नमः' मंत्राचा १०८ वेळा जप करून मधल्या किंवा करंगळी बोटात धारण करावे.`;
      const p2 = `हे शास्त्रोक्त उपरत्न हिऱ्याप्रमाणेच समृद्धी, कला आणि कौटुंबिक सौख्य प्रदान करेल. श्री क्षेत्र गोकर्ण महाबळेश्वर यांच्या कृपेने तुमचे सर्व कार्य सिद्ध होवो.`;
      return deduplicateResponseText(`${p1}\n\n${p2}`);
    }
    // Kannada Default
    const p1 = `ವಜ್ರದ ಬೆಲೆ ಹೆಚ್ಚಾಗಿದ್ದು ನಿಮ್ಮ ಬಜೆಟ್‌ಗೆ ಕೈಗೆಟುಕದಿದ್ದರೆ, ವೈದಿಕ ಶಾಸ್ತ್ರದಲ್ಲಿ ಶುಕ್ರ ಗ್ರಹಕ್ಕೆ ಮೂರು ಶ್ರೇಷ್ಠ ಮತ್ತು ಕೈಗೆಟುಕುವ ನೈಸರ್ಗಿಕ ಉಪರತ್ನಗಳನ್ನು (Substitutes) ವಿಧಿಸಲಾಗಿದೆ: ೧) ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (White Zircon - ವಜ್ರಕ್ಕೆ ಅತ್ಯಂತ ಸಮೀಪವಾದ ರತ್ನ), ೨) ನೈಸರ್ಗಿಕ ಬಿಳಿ ಓಪಲ್ (White Opal), ೩) ಶುದ್ಧ ಸ್ಫಟಿಕ ಮಣಿ (Sphatika). ನೆನಪಿನಲ್ಲಿಡಿ, ಬಿಳಿ ಹವಳವನ್ನು ಎಂದಿಗೂ ವಜ್ರದ ಬದಲು ಧರಿಸಬಾರದು ಏಕೆಂದರೆ ಹವಳವು ಮಂಗಳನ ರತ್ನ. ಈ ಪರ್ಯಾಯ ಉಪರತ್ನಗಳನ್ನು ಶುದ್ಧ ಬೆಳ್ಳಿಯ (Silver) ಉಂಗುರದಲ್ಲಿ ಮಾಡಿಸಿ, ಶುಕ್ಲ ಪಕ್ಷದ ಶುಕ್ರವಾರದಂದು 'ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳಿಗೆ ಧರಿಸಬೇಕು.`;
    const p2 = `ಈ ಪವಿತ್ರ ಉಪರತ್ನವು ವಜ್ರದಷ್ಟೇ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ನೀಡಿ ವೈವಾಹಿಕ ಸಾಮರಸ್ಯ, ಸೌಂದರ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಮೃದ್ಧಿಯನ್ನು ತರುತ್ತದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮಗೆ ಸಕಲ ಸಿದ್ಧಿ ಲಭಿಸಲಿ.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // --- GENERAL GEMSTONE INQUIRY ---
  const asksCoral = /ಹವಳ|havala|coral|ಮೂಂಗಾ|moonga|munga|मूंगा|పగడం|pagadam|பவளம்|pavalam|പവിഴം|pavizham|पोवळा/i.test(question);
  const isCoralMatched = rec.isCoralMatched;

  if (lang === "en") {
    let coralLine = "";
    if (asksCoral) {
      if (isTulaNative) {
        coralLine = "Regarding Red Coral (Moonga / Havala): For Tula (Libra) Lagna, Mars rules the 2nd and 7th houses, which are Maraka sthanas (critical transition/death-inflicting houses). Wearing Red Coral is strictly caution-advised and generally NOT recommended, as Martian fire intensifies marital friction, aggressive anger, and discord with your spouse. ";
      } else {
        coralLine = isCoralMatched
          ? "The Red Coral (Havala / Moonga) you specifically inquired about is indeed an exceptional Yoga-Karaka gemstone that aligns superbly with your chart. "
          : `Regarding Red Coral, your primary ascendant gem is ${gemName}, which will yield the most potent and balanced benefits for your chart. `;
      }
    } else if (isCoralMatched) {
      coralLine = "In addition, Red Coral (Havala) serves as a potent secondary Yoga-Karaka gemstone for your chart. ";
    }
    const p1 = `For your birth chart, the most auspicious and empowering primary gemstone is ${gemName} to strengthen your ruling planet ${rec.gemstonePlanet}. ${coralLine}Authentic affordable substitutes (Uparatna) include ${substitute}. Note that incompatible stones to avoid are: ${incompatibilities}. This sacred gemstone should be set in ${metal} and worn on the ${finger} on ${wearingDayAndTime}. Before wearing, purify it in unboiled milk or holy water while chanting the sacred mantra '${mantra}' 108 times, which ${benefits}`;
    const p2 = `Always ensure the gemstone is authentic, natural, and free from cracks or flaws before consecrating it. May the divine grace of Sri Kshetra Gokarna Mahabaleshwara bestow immense confidence, success, and prosperity upon your journey.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "hi") {
    let coralLine = "";
    if (asksCoral) {
      coralLine = isCoralMatched
        ? "आपके द्वारा पूछा गया लाल मूंगा (Red Coral) आपकी कुंडली के अनुसार अत्यंत शुभ और योगकारक रत्न है। "
        : `लाल मूंगे की तुलना में आपकी कुंडली के लग्नेश का मुख्य रत्न ${gemName} धारण करना अधिक फलदायी रहेगा। `;
    } else if (isCoralMatched) {
      coralLine = "विशेष रूप से आपकी कुंडली में लाल मूंगा (Red Coral) भी उत्तम योगकारक बल प्रदान करता है। ";
    }
    const p1 = `आपकी जन्म कुंडली के अनुसार आपके लिए सबसे शुभ और भाग्यवर्धक मुख्य रत्न ${gemName} है, जो आपके ग्रह ${rec.gemstonePlanet} को विशेष बल प्रदान करता है। ${coralLine}किफायती शास्त्रोक्त उपरत्न: ${substitute}। वर्जित रत्न: ${incompatibilities}। इस पवित्र रत्न को ${metal} में बनवाकर ${wearingDayAndTime} ${finger} में धारण करें। धारण करने से पूर्व कच्चे दूध या गंगाजल से शुद्ध करके '${mantra}' मंत्र का १०८ बार जप करें। यह रत्न ${benefits}`;
    const p2 = `ध्यान रहे कि रत्न सर्वथा प्राकृतिक, शुद्ध और दोषरहित होना चाहिए। श्री क्षेत्र गोकर्ण महाबलेश्वर के आशीर्वाद से यह रत्न आपके जीवन में स्थिरता, तेज और सफलता प्रदान करेगा।`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "te") {
    let coralLine = "";
    if (asksCoral) {
      coralLine = isCoralMatched
        ? "మీరు అడిగిన ఎరుపు పగడం (Red Coral) మీ జాతకానికి అత్యంత శుభప్రదమైన యోగకారక రత్నం. "
        : `పగడం కంటే కూడా మీ లగ్నాధిపతి రత్నమైన ${gemName} ధరించడం విశేష ఫలితాన్నిస్తుంది. `;
    } else if (isCoralMatched) {
      coralLine = "విశేషించి మీ జాతకానికి ఎరుపు పగడం (Red Coral) కూడా అద్భుతమైన యోగకారక బలాన్ని ఇస్తుంది. ";
    }
    const p1 = `మీ జన్మ కుండలి ప్రకారం మీకు అత్యంత శుభప్రదమైన మరియు శక్తివంతమైన ప్రధాన రత్నం ${gemName}, ఇది మీ గ్రహమైన ${rec.gemstonePlanet}కు విశేష బలాన్ని చేకూరుస్తుంది. ${coralLine}సరసమైన ఉపరత్నాలు: ${substitute}। ధరించకూడని రత్నాలు: ${incompatibilities}। ఈ రత్నాన్ని ${metal}లో పొదిగించి, ${wearingDayAndTime} ${finger} ధరించాలి. ధరించడానికి ముందు శుద్ధ జలంతో లేదా ఆవు పాలతో శుద్ధి చేసి '${mantra}' మంత్రాన్ని 108 సార్లు జపించి ధరించడం వలన ${benefits}`;
    const p2 = `రత్నం సహజమైనది మరియు దోషరహితమైనదిగా ఉండేలా చూసుకోండి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామివారి దివ్య ఆశీస్సులతో మీకు సర్వదా శుభం కలుగుతుంది.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ta") {
    let coralLine = "";
    if (asksCoral) {
      coralLine = isCoralMatched
        ? "நீங்கள் கேட்ட பவளம் (Red Coral) உங்கள் ஜாதகத்திற்கு மிகச்சிறந்த யோககாரக ரத்தினமாகும். "
        : `பவளத்தை விட உங்கள் லக்னாதிபதி ரத்தினமான ${gemName} அணிவதே அதிக நற்பலன்களைத் தரும். `;
    } else if (isCoralMatched) {
      coralLine = "குறிப்பாக உங்கள் ஜாதகத்திற்கு பவளமும் (Red Coral) சிறந்த யோக பலனைத் தரும். ";
    }
    const p1 = `உங்கள் ஜாதக அமைப்பின்படி உங்களுக்கு மிகவும் யோகமும் மங்களமும் தரும் முதன்மை நவரத்தினம் ${gemName} ஆகும். இது உங்கள் ${rec.gemstonePlanet} கிரகத்திற்கு அளப்பரிய பலத்தைத் தரும். ${coralLine}மலிவான உப ரத்தினங்கள்: ${substitute}। தவிர்க்க வேண்டிய ரத்தினங்கள்: ${incompatibilities}। இந்த ரத்தினத்தை ${metal}-ல் பதித்து, ${wearingDayAndTime} ${finger}-ல் அணிய வேண்டும். அணியும் முன் தூய பால் அல்லது கங்கை நீரால் சுத்தி செய்து '${mantra}' மந்திரத்தை 108 முறை ஜெபித்து அணிவதால் ${benefits}`;
    const p2 = `ரத்தினம் இயற்கையானதாகவும் தரம் வாய்ந்ததாகவும் இருக்க வேண்டும். ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமியின் திருவருளால் உங்களுக்கு சகல காரியங்களிலும் வெற்றி உண்டாகும்.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ml") {
    let coralLine = "";
    if (asksCoral) {
      coralLine = isCoralMatched
        ? "നിങ്ങൾ ചോദിച്ച പവിഴം (Red Coral) നിങ്ങളുടെ ജാതകത്തിന് ഏറ്റവും ഉത്തമമായ യോഗകാരക രത്നമാണ്. "
        : `പവിഴത്തേക്കാൾ നിങ്ങളുടെ ലഗ്നാധിപൻ്റെ രത്നമായ ${gemName} ധരിക്കുന്നതാണ് കൂടുതൽ ഗുണകരം. `;
    } else if (isCoralMatched) {
      coralLine = "പ്രത്യേകിച്ചും ചുവന്ന പവിഴവും (Red Coral) നിങ്ങളുടെ ജാതകത്തിന് യോഗബലം നൽകുന്നു. ";
    }
    const p1 = `നിങ്ങളുടെ ജാതകപ്രകാരം ഏറ്റവും അനുകൂലവും ഐശ്വര്യപ്രദവുമായ പ്രധാന രത്നം ${gemName} ആണ്. ഇത് നിങ്ങളുടെ ${rec.gemstonePlanet} ഗ്രഹത്തിന് വിശേഷ ബലം നൽകുന്നു. ${coralLine}ചെലവ് കുറഞ്ഞ ഉപരത്നങ്ങൾ: ${substitute}। ധരിക്കാൻ പാടില്ലാത്ത രത്നങ്ങൾ: ${incompatibilities}। ഈ രത്നം ${metal}-ൽ പണിത് ${wearingDayAndTime} ${finger}-ൽ ധരിക്കണം. ധരിക്കുന്നതിന് മുമ്പ് പശുവിൻ പാലിലോ തീർത്ഥത്തിലോ ശുദ്ധിവരുത്തി '${mantra}' മന്ത്രം 108 തവണ ജപിച്ച് ധരിച്ചാൽ ${benefits}`;
    const p2 = `സ്വാഭാവികവും കളങ്കമില്ലാത്തതുമായ രത്നം തിരഞ്ഞെടുക്കുക. ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിയുടെ അനുഗ്രഹത്താൽ ഐശ്വര്യവും സൗഭാഗ്യവും കൈവരും.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "mr") {
    let coralLine = "";
    if (asksCoral) {
      coralLine = isCoralMatched
        ? "तुम्ही विचारलेला लाल पोवळा (Red Coral) तुमच्या पत्रिकेनुसार अत्यंत शुभ आणि योगकारक रत्न आहे. "
        : `पोवळ्यापेक्षा तुमच्या लग्नेशाचे मुख्य रत्न ${gemName} धारण करणे अधिक लाभदायक ठरेल. `;
    } else if (isCoralMatched) {
      coralLine = "विशेषतः तुमच्या कुंडलीत लाल पोवळा (Red Coral) देखील उत्तम योगकारक बल प्रदान करतो. ";
    }
    const p1 = `तुमच्या जन्म कुंडलीनुसार तुमच्यासाठी सर्वात शुभ आणि लाभदायक मुख्य रत्न ${gemName} आहे, जे तुमच्या ${rec.gemstonePlanet} ग्रहाला विशेष बल प्रदान करते. ${coralLine}परवडणारे शास्त्रोक्त उपरत्न: ${substitute}। टाळायची रत्ने: ${incompatibilities}। हे रत्न ${metal} मध्ये बनवून ${wearingDayAndTime} ${finger} मध्ये धारण करावे. धारण करण्यापूर्वी कच्चे दूध किंवा गंगाजलाने शुद्ध करून '${mantra}' मंत्राचा १०८ वेळा जप करावा. यामुळे ${benefits}`;
    const p2 = `रत्न पूर्णपणे नैसर्गिक आणि दोषमुक्त असावे. श्री क्षेत्र गोकर्ण महाबळेश्वर यांच्या कृपेने तुमच्या जीवनात प्रगती आणि यश लाभेल.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // Default: Kannada
  let coralLine = "";
  if (asksCoral) {
    if (isTulaNative) {
      coralLine = "ನೀವು ಕೇಳಿರುವ ಕೆಂಪು ಹವಳದ (Red Coral / Moonga) ವಿಚಾರದಲ್ಲಿ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಮಂಗಳನು ೨ನೇ ಹಾಗೂ ೭ನೇ ಮಾರಕ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಯಾಗಿದ್ದಾನೆ. ಹವಳ ಧರಿಸುವುದರಿಂದ ಕೋಪ, ದಾಂಪತ್ಯ ಕಲಹ ಹಾಗೂ ರಕ್ತದೊತ್ತಡ ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ ತುಲಾ ಲಗ್ನದವರಿಗೆ ಹವಳವನ್ನು ಧರಿಸಲು ಶಿಫಾರಸು ಮಾಡುವುದಿಲ್ಲ. ";
    } else {
      coralLine = isCoralMatched
        ? "ನೀವು ಕೇಳಿರುವ ಕೆಂಪು ಹವಳವು (Red Coral) ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನ ಮತ್ತು ತ್ರಿಕೋಣಾಧಿಪತಿಯ ಬಲಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಯೋಗಕಾರಕ ರತ್ನವಾಗಿದೆ. "
        : `ನೀವು ಕೇಳಿರುವ ಹವಳಕ್ಕಿಂತಲೂ ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನಾಧಿಪತಿಯಾದ ${gemName} ಧರಿಸುವುದು ಶ್ರೇಷ್ಠ ಫಲ ನೀಡುತ್ತದೆ. `;
    }
  } else if (isCoralMatched) {
    coralLine = "ವಿಶೇಷವಾಗಿ ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಕೆಂಪು ಹವಳವು (Red Coral) ಸಹ ಅತ್ಯುತ್ತಮ ಯೋಗಕಾರಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ. ";
  }
  const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಮಂಗಳಕರವಾದ ಮುಖ್ಯ ರತ್ನವೆಂದರೆ ${gemName} (ಗ್ರಹಾಧಿಪತಿ ${rec.gemstonePlanet} ಬಲಕ್ಕಾಗಿ). ${coralLine}ಕೈಗೆಟುಕುವ ಶಾಸ್ತ್ರೋಕ್ತ ಉಪರತ್ನಗಳು: ${substitute}। ಈ ರತ್ನದೊಂದಿಗೆ ಧರಿಸಬಾರದ ವಿರುದ್ಧ ರತ್ನಗಳು: ${incompatibilities}। ಈ ಪವಿತ್ರ ರತ್ನವನ್ನು ${metal}ದಲ್ಲಿ ಉಂಗುರ ಮಾಡಿಸಿ, ${finger}ಗೆ ${wearingDayAndTime} ಧರಿಸಬೇಕು. ಧರಿಸುವ ಮುನ್ನ ಹಸಿಹಾಲು ಅಥವಾ ಗಂಗಾಜಲದಲ್ಲಿ ಶುದ್ಧೀಕರಿಸಿ '${mantra}' ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ ಧರಿಸುವುದರಿಂದ ${benefits}`;
  const p2 = `ರತ್ನವನ್ನು ಆಯ್ಕೆಮಾಡುವಾಗ ಯಾವುದೇ ಬಿರುಕು ಅಥವಾ ಕೃತಕತೆಯಿಲ್ಲದ ನೈಸರ್ಗಿಕ ಹರಳನ್ನೇ ಧರಿಸಿ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಅನುಗ್ರಹದಿಂದ ಈ ರತ್ನಧಾರಣೆಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ, ಧೈರ್ಯ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಸಿದ್ಧಿಯನ್ನು ತರಲಿದೆ.`;
  return deduplicateResponseText(`${p1}\n\n${p2}`);
}

export function buildDeterministicColorReading(
  session: ConsultationSession,
  _question: string,
  _astroData: DevoteeKundliComputedData | undefined,
  rec: AstrologicalRecommendationProfile,
  _isSubsequent: boolean
): string {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const luckyColors = rec.luckyColors[lang] || rec.luckyColors.kn;
  const colorsToAvoid = rec.colorsToAvoid[lang] || rec.colorsToAvoid.kn;

  if (lang === "en") {
    const p1 = `According to your birth chart, your most auspicious and fortunate colors are **${luckyColors}**. Wearing these colors during pivotal interviews, signing contracts, launching new ventures, or attending auspicious ceremonies greatly amplifies your confidence and cosmic favor. Meanwhile, it is beneficial to avoid or minimize wearing ${colorsToAvoid}.`;
    const p2 = `Incorporating these harmonious colors into your daily wardrobe alongside heartfelt prayers to Lord Mahabaleshwara at Sri Kshetra Gokarna will maintain serene mental clarity and invite steady prosperity.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "hi") {
    const p1 = `आपकी जन्म कुंडली के अनुसार आपके लिए सबसे शुभ और भाग्यशाली रंग **${luckyColors}** हैं। महत्वपूर्ण साक्षात्कारों, नए अनुबंधों, परीक्षाओं या शुभ कार्यों के अवसर पर इन रंगों के वस्त्र धारण करने से आपका आत्मविश्वास और सफलता की संभावनाएं कई गुना बढ़ जाती हैं। साथ ही, ${colorsToAvoid} रंगों का अधिक उपयोग करने से बचना चाहिए।`;
    const p2 = `दैनिक जीवन में इन अनुकूल रंगों का प्रयोग करने के साथ-साथ श्री क्षेत्र गोकर्ण महाबलेश्वर का स्मरण करने से मानसिक शांति और निरंतर प्रगति की प्राप्ति होगी।`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "te") {
    const p1 = `మీ జన్మ కుండలి ప్రకారం మీకు అత్యంత శుభప్రదమైన మరియు అదృష్టాన్నిచ్చే రంగులు: **${luckyColors}**. కీలకమైన ఇంటర్వ్యూలు, వ్యాపార ఒప్పందాలు, పరీక్షలు లేదా శుభకార్యాల సమయంలో ఈ రంగుల దుస్తులను ధరించడం వలన మీ ఆత్మవిశ్వాసం మరియు గ్రహానుకూలత పెరుగుతుంది. అదే సమయంలో, ${colorsToAvoid} రంగులను వీలైనంత వరకు నివారించడం శ్రేయస్కరం.`;
    const p2 = `ఈ శుభ రంగులను మీ దైనందిన జీవితంలో ఉపయోగిస్తూ, శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామివారిని స్మరించడం వలన మీకు మానసిక ప్రశాంతత మరియు నిరంతర కార్యజయం లభిస్తాయి.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ta") {
    const p1 = `உங்கள் ஜாதக அமைப்பின்படி உங்களுக்கு மிகவும் அதிர்ஷ்டமும் நன்மையும் தரும் நிறங்கள்: **${luckyColors}**. முக்கியமான நேர்காணல்கள், புதிய முயற்சிகள், தேர்வுகள் அல்லது மங்களகரமான நிகழ்வுகளின் போது இந்த வண்ண ஆடைகளை அணிவது உங்களுக்கு தன்னம்பிக்கையையும் வெற்றிகளையும் தரும். அதே வேளையில், ${colorsToAvoid} நிறங்களை அதிகமாகப் பயன்படுத்துவதைத் தவிர்ப்பது நல்லது.`;
    const p2 = `இந்த மங்களகரமான வண்ணங்களை அன்றாட வாழ்வில் பயன்படுத்துவதோடு, ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமியை தியானித்து வருவதால் மன அமைதியும் காரிய வெற்றியும் கிட்டும்.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ml") {
    const p1 = `നിങ്ങളുടെ ജാതകപ്രകാരം ഏറ്റവും അനുകൂലവും ഭാഗ്യപ്രദവുമായ നിറങ്ങൾ: **${luckyColors}**. പ്രധാനപ്പെട്ട ഇന്റർവ്യൂകൾ, പുതിയ സംരംഭങ്ങൾ, പരീക്ഷകൾ, മംഗളകരമായ ചടങ്ങുകൾ എന്നിവയിൽ ഈ നിറങ്ങളിലുള്ള വസ്ത്രങ്ങൾ ധരിക്കുന്നത് ആത്മവിശ്വാസവും ഭാഗ്യവും നൽകും. അതേസമയം, ${colorsToAvoid} നിറങ്ങൾ പരമാവധി ഒഴിവാക്കുന്നത് നല്ലതാണ്.`;
    const p2 = `ഈ ശുഭ നിറങ്ങൾ ദൈനംദിന ജീവിതത്തിൽ ഉപയോഗിക്കുന്നതിനൊപ്പം ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിയെ ഭജിക്കുന്നത് മനസ്സമാധാനവും വിജയവും നേടിത്തരും.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "mr") {
    const p1 = `तुमच्या जन्म पत्रिकेनुसार तुमच्यासाठी सर्वात शुभ आणि भाग्यशाली रंग **${luckyColors}** आहेत. महत्त्वाच्या मुलाखती, नवीन व्यवसाय करार, परीक्षा किंवा शुभ कार्यांच्या प्रसंगी या रंगांचे वस्त्र परिधान केल्याने तुमचा आत्मविश्वास आणि यश वाढेल. तसेच ${colorsToAvoid} रंगांचा अति वापर टाळणे योग्य ठरेल.`;
    const p2 = `दैनंदिन जीवनात या अनुकूल रंगांचा वापर करण्यासोबतच श्री क्षेत्र गोकर्ण महाबळेश्वर यांचे स्मरण केल्याने मानसिक शांतता आणि प्रगती लाभेल.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // Kannada Default
  const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಕಾರ ನಿಮಗೆ ಅತ್ಯಂತ ಶುಭ ಮತ್ತು ಅದೃಷ್ಟ ತರುವ ಮುಖ್ಯ ಬಣ್ಣಗಳು: **${luckyColors}**. ಈ ಬಣ್ಣದ ವಸ್ತ್ರಗಳನ್ನು ಪ್ರಮುಖ ಸಂದರ್ಶನಗಳು, ನೂತನ ವ್ಯವಹಾರಗಳ ಆರಂಭ, ಪರೀಕ್ಷೆಗಳು ಅಥವಾ ಶುಭ ಕಾರ್ಯಗಳ ದಿನ ಧರಿಸುವುದರಿಂದ ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಗ್ರಹಬಲದ ಧನಾತ್ಮಕ ಸ್ಪಂದನ ಹೆಚ್ಚುತ್ತದೆ. ಅದೇ ವೇಳೆ, ${colorsToAvoid} ಬಣ್ಣದ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು ಜಾತಕ ರೀತ್ಯಾ ಹಿತಕರ.`;
  const p2 = `ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಈ ಶುಭ ಬಣ್ಣಗಳನ್ನು ಹೆಚ್ಚಾಗಿ ಬಳಸುವುದರೊಂದಿಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಪ್ರಶಾಂತತೆ ಹಾಗೂ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಂತರ ಜಯವು ಲಭಿಸಲಿದೆ.`;
  return deduplicateResponseText(`${p1}\n\n${p2}`);
}

/**
 * Generates an authentic, focused 1-to-2 paragraph lucky number reading.
 */
export function buildDeterministicNumberReading(
  session: ConsultationSession,
  _question: string,
  _astroData: DevoteeKundliComputedData | undefined,
  rec: AstrologicalRecommendationProfile,
  _isSubsequent: boolean
): string {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const primaryNumber = rec.primaryNumber;
  const luckyNumbersText = rec.luckyNumbersText[lang] || rec.luckyNumbersText.kn;

  if (lang === "en") {
    const p1 = `Based on your ascendant and planetary vibrations, your primary lucky number is **${primaryNumber}**, supported by the harmonious series **${luckyNumbersText}**. Selecting these auspicious digits for significant dates, bank registrations, vehicle numbers, or major negotiations brings aligned planetary support.`;
    const p2 = `Before undertaking crucial decisions, synchronizing with these auspicious numbers while seeking the grace of Lord Mahaganapati at Sri Kshetra Gokarna ensures swift clearance of obstacles and enduring success.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "hi") {
    const p1 = `आपकी जन्म कुंडली के अनुसार आपका मुख्य भाग्यशाली अंक **${primaryNumber}** है तथा शुभ अंकों की श्रृंखला **${luckyNumbersText}** है। महत्वपूर्ण तिथियों, वाहन संख्या, बैंकिंग कार्यों अथवा नए समझौतों के लिए इन अंकों का चयन आपके लिए ग्रहबल का अनुकूल सहयोग प्रदान करेगा।`;
    const p2 = `किसी भी नए कार्य के आरंभ से पूर्व इन शुभ अंकों का ध्यान रखकर श्री क्षेत्र गोकर्ण महागणपति की प्रार्थना करने से समस्त विघ्न दूर होकर कार्य सिद्ध होगा।`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "te") {
    const p1 = `మీ జన్మ కుండలి ప్రకారం మీ ప్రధాన అదృష్ట సంఖ్య **${primaryNumber}** మరియు అనుకూల సంఖ్యల శ్రేణి **${luckyNumbersText}**. ముఖ్యమైన తేదీలు, బ్యాంకింగ్ వ్యవహారాలు, వాహన నంబర్లు లేదా వ్యాపార ఒప్పందాలలో ఈ సంఖ్యలను ఎంచుకోవడం వలన గ్రహబలం అనుకూలిస్తుంది.`;
    const p2 = `ఏదైనా కొత్త పనిని ప్రారంభించే ముందు ఈ శుభ సంఖ్యల అనుకూలతతో పాటు శ్రీ క్షేత్ర గోకర్ణ మహాగణపతిని ప్రార్థించడం వలన సకల విఘ్నాలు తొలగి విజయం చేకూరుతుంది.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ta") {
    const p1 = `உங்கள் ஜாதகப்படி உங்கள் முதன்மை அதிர்ஷ்ட எண் **${primaryNumber}** மற்றும் மங்களகரமான எண் வரிசை **${luckyNumbersText}** ஆகும். முக்கியமான தேதிகள், வங்கி கணக்குகள், வாகன எண்கள் அல்லது புதிய ஒப்பந்தங்களின் போது இந்த எண்களைப் பயன்படுத்துவது கிரக பலத்தைத் தரும்.`;
    const p2 = `எந்தவொரு நல்ல காரியத்தைத் தொடங்கும் முன்பும் இந்த எண்களைத் தேர்ந்தெடுத்து ஸ்ரீ சேத்ர கோகர்ண மகா கணபதியை வழிபடுவது தடைகளை நீக்கி வெற்றியைத் தரும்.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ml") {
    const p1 = `നിങ്ങളുടെ ജാതകപ്രകാരം പ്രധാന ഭാഗ്യ നമ്പർ **${primaryNumber}** ഉം ശുഭകരമായ സംഖ്യാ പരമ്പര **${luckyNumbersText}** ഉം ആണ്. പ്രധാനപ്പെട്ട തീയതികൾ, വാഹന രജിസ്ട്രേഷൻ, കരാറുകൾ എന്നിവയിൽ ഈ സംഖ്യകൾ തിരഞ്ഞെടുക്കുന്നത് ഗ്രഹാനുകൂല്യം നൽകും.`;
    const p2 = `പുതിയ സംരംഭങ്ങൾ തുടങ്ങുമ്പോൾ ഈ ഭാഗ്യ നമ്പറുകൾ ശ്രദ്ധിക്കുന്നതിനൊപ്പം ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാഗണപതിയെ ഭജിക്കുന്നത് വിഘ്നങ്ങളെല്ലാം മാറ്റി വിജയം തരും.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "mr") {
    const p1 = `तुमच्या जन्म कुंडलीनुसार तुमचा मुख्य भाग्यशाली अंक **${primaryNumber}** आणि शुभ अंकांचे समीकरण **${luckyNumbersText}** आहे. महत्त्वाच्या तारखा, वाहन क्रमांक, बँकिंग किंवा नवीन करारांसाठी या अंकांचा वापर केल्यास अनुकूल ग्रहबल लाभेल.`;
    const p2 = `कोणत्याही नवीन कार्यास सुरुवात करताना या शुभ अंकांचा विचार करून श्री क्षेत्र गोकर्ण महागणपतीची प्रार्थना केल्यास सर्व विघ्न दूर होऊन यश लाभेल.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // Kannada Default
  const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಲಗ್ನಾಧಿಪತಿಯ ಗ್ರಹಬಲದ ಪ್ರಕಾರ ನಿಮ್ಮ ಮುಖ್ಯ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ **${primaryNumber}** ಹಾಗೂ ಅತ್ಯಂತ ಶುಭಕರ ಸಂಖ್ಯೆಗಳ ಸರಣಿ **${luckyNumbersText}**. ನಿಮ್ಮ ಪ್ರಮುಖ ಬ್ಯಾಂಕ್ ವ್ಯವಹಾರಗಳು, ವಾಹನ ನೋಂದಣಿ ಸಂಖ್ಯೆ, ಹೊಸ ಒಪ್ಪಂದಗಳ ದಿನಾಂಕ ಅಥವಾ ಮಹತ್ವದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವಾಗ ಈ ಸಂಖ್ಯೆಗಳು ಬರುವಂತೆ ನೋಡಿಕೊಳ್ಳುವುದು ಗ್ರಹಬಲದ ಶುಭ ಸ್ಪಂದನವನ್ನು ನೀಡುತ್ತದೆ.`;
  const p2 = `ಯಾವುದೇ ಹೊಸ ಕಾರ್ಯಕ್ಕೆ ತೊಡಗುವ ಮುನ್ನ ಈ ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳ ಸಂಯೋಗ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಯ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳೂ ನಿವಾರಣೆಯಾಗಿ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ.`;
  return deduplicateResponseText(`${p1}\n\n${p2}`);
}

/**
 * Generates an authentic, focused 1-to-2 paragraph day & deity reading.
 */
export function buildDeterministicDayDeityReading(
  session: ConsultationSession,
  _question: string,
  _astroData: DevoteeKundliComputedData | undefined,
  rec: AstrologicalRecommendationProfile,
  _isSubsequent: boolean
): string {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const ishtaDevata = rec.ishtaDevata[lang] || rec.ishtaDevata.kn;
  const sacredMantra = rec.sacredMantra[lang] || rec.sacredMantra.kn;
  const auspiciousDay = rec.auspiciousDay[lang] || rec.auspiciousDay.kn;

  if (lang === "en") {
    const p1 = `For your birth chart, your supreme protective Ishta Devata is **${ishtaDevata}**, and your most auspicious weekday is **${auspiciousDay}**. Devoting time on every ${auspiciousDay} to chant the sacred mantra **'${sacredMantra}'** 108 times pacifies astrological tensions and invokes profound inner strength.`;
    const p2 = `Before undertaking important journeys or tasks, remembering your Ishta Devata and offering prayers to Lord Mahabaleshwara at Sri Kshetra Gokarna ensures divine grace and steady fulfillment.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "hi") {
    const p1 = `आपकी जन्म कुंडली के अनुसार आपके परम कल्याणकारी इष्टदेव **${ishtaDevata}** हैं तथा आपका सबसे शुभ वार **${auspiciousDay}** है। प्रत्येक ${auspiciousDay} को प्रातःकाल स्नान के पश्चात पवित्र मन से **'${sacredMantra}'** मंत्र का १०८ बार जप करना आपके समस्त ग्रहदोषों को शांत कर आत्मविश्वास प्रदान करेगा।`;
    const p2 = `किसी भी महत्वपूर्ण कार्य पर जाने से पूर्व अपने इष्टदेव का स्मरण और श्री क्षेत्र गोकर्ण महाबलेश्वर की प्रार्थना करने से आपके सभी संकल्प सिद्ध होंगे।`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "te") {
    const p1 = `మీ జన్మ కుండలి ప్రకారం మీకు అత్యంత అనుగ్రహప్రదమైన ఇష్టదైవం **${ishtaDevata}** మరియు మీ వారపు అత్యంత శుభదినం **${auspiciousDay}**. ప్రతి ${auspiciousDay} ఉదయం స్నానానంతరం పవిత్ర మనస్సుతో **'${sacredMantra}'** మంత్రాన్ని 108 సార్లు జపించడం వలన గ్రహదోషాలు శాంతించి అద్భుతమైన మనోధైర్యం కలుగుతుంది.`;
    const p2 = `ముఖ్యమైన పనులకు వెళ్లేముందు ఇష్టదైవాన్ని స్మరిస్తూ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర స్వామివారిని ప్రార్థించడం వలన సంకల్పసిద్ధి కలుగుతుంది.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ta") {
    const p1 = `உங்கள் ஜாதகப்படி உங்களுக்கு அருள் புரியும் இஷ்ட தெய்வம் **${ishtaDevata}** மற்றும் உங்கள் வாராந்திர மங்களகரமான நாள் **${auspiciousDay}** ஆகும். ஒவ்வொரு ${auspiciousDay}-ம் காலையில் நீராடி தூய மனதுடன் **'${sacredMantra}'** மந்திரத்தை 108 முறை ஜெபித்து வந்தால் சகல கிரக தோஷங்களும் நீங்கி மனோபலம் பெருகும்.`;
    const p2 = `முக்கியமான காரியங்களை மேற்கொள்ளும் முன் இஷ்ட தெய்வத்தை தியானித்து ஸ்ரீ சேத்ர கோகர்ண மகாபலேஸ்வர சுவாமியை வழிபடுவது காரிய சித்தியை அளிக்கும்.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "ml") {
    const p1 = `നിങ്ങളുടെ ജാതകപ്രകാരം ഏറ്റവും അനുഗ്രഹപ്രദമായ ഇഷ്ടദേവത **${ishtaDevata}** യും ശുഭദിനം **${auspiciousDay}** യും ആണ്. എല്ലാ ${auspiciousDay} രാവിലെയും കുളിച്ച് ശുദ്ധിയോടെ **'${sacredMantra}'** മന്ത്രം 108 തവണ ജപിക്കുന്നത് ഗ്രഹദോഷങ്ങളെ ശമിപ്പിക്കുകയും ആത്മശക്തി നൽകുകയും ചെയ്യും.`;
    const p2 = `പ്രധാന കാര്യങ്ങൾക്കായി പോകുമ്പോൾ ഇഷ്ടദേവതയെ സ്മരിക്കുന്നതും ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സ്വാമിയെ പ്രാർത്ഥിക്കുന്നതും കാര്യവിജയം ഉറപ്പാക്കും.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  if (lang === "mr") {
    const p1 = `तुमच्या जन्म पत्रिकेनुसार तुमचे परम कल्याणकारी इष्टदैवत **${ishtaDevata}** आणि सर्वात शुभ वार **${auspiciousDay}** आहे. प्रत्येक ${auspiciousDay} रोजी सकाळी स्नानानंतर शुद्ध अंतःकरणाने **'${sacredMantra}'** मंत्राचा १०८ वेळा जप केल्याने सर्व ग्रहदोष शांत होऊन मनोबल वाढेल.`;
    const p2 = `कोणत्याही महत्त्वाच्या कार्याला जाताना इष्टदेवतेचे स्मरण करून श्री क्षेत्र गोकर्ण महाबळेश्वर यांची प्रार्थना केल्यास संकल्पांची पूर्तता होईल.`;
    return deduplicateResponseText(`${p1}\n\n${p2}`);
  }

  // Kannada Default
  const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಅತ್ಯಂತ ಪ್ರಬಲ ಹಾಗೂ ಅನುಗ್ರಹಕಾರಕ ಇಷ್ಟದೇವತೆ **${ishtaDevata}** ಹಾಗೂ ನಿಮ್ಮ ವಾರದ ಅತ್ಯಂತ ಶುಭದಿನ **${auspiciousDay}**. ಪ್ರತಿ ${auspiciousDay} ದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನ ಮುಗಿಸಿ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ **'${sacredMantra}'** ಮಂತ್ರವನ್ನು ಕನಿಷ್ಠ ೨೧ ಅಥವಾ ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸುವುದು ನಿಮ್ಮ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ ಅದ್ಭುತ ಆತ್ಮಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.`;
  const p2 = `ವಿಶೇಷ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವ ಮುನ್ನ ಇಷ್ಟದೇವತೆಯ ಸ್ಮರಣೆ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದರ್ಶನ/ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಂಕಲ್ಪಗಳಿಗೆ ಜಯವನ್ನು ಕರುಣಿಸಲಿದೆ.`;
  return deduplicateResponseText(`${p1}\n\n${p2}`);
}

/**
 * Generates a concise, single-paragraph follow-up clarification reading (e.g. finger, metal, wearing time).
 */
export function buildDeterministicFollowUpClarificationReading(
  session: ConsultationSession,
  _question: string,
  _astroData: DevoteeKundliComputedData | undefined,
  rec: AstrologicalRecommendationProfile,
  _isSubsequent: boolean
): string {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const metal = rec.idealMetal[lang] || rec.idealMetal.kn;
  const finger = rec.idealFinger[lang] || rec.idealFinger.kn;
  const wearingDayAndTime = rec.wearingDayAndTime[lang] || rec.wearingDayAndTime.kn;

  if (lang === "en") {
    return deduplicateResponseText(
      `Regarding your specific clarification: This gemstone must be crafted in **${metal}** and worn on the **${finger}** of your right (working) hand on **${wearingDayAndTime}**. Purify it briefly in unboiled milk or holy water with heartfelt prayer before wearing.`
    );
  }

  if (lang === "hi") {
    return deduplicateResponseText(
      `रत्न धारण का शास्त्रोक्त नियम: इस रत्न को **${metal}** में बनवाकर दाहिने हाथ की **${finger}** में **${wearingDayAndTime}** धारण करना चाहिए। धारण करने से पूर्व कच्चे दूध अथवा गंगाजल से शुद्ध करके इष्टदेव की प्रार्थना करें।`
    );
  }

  if (lang === "te") {
    return deduplicateResponseText(
      `రత్న ధారణ శాస్త్రోక్త నియమం: ఈ రత్నాన్ని **${metal}**లో చేయించి, కుడిచేతి **${finger}**కి **${wearingDayAndTime}** ధరించాలి. ధరించే ముందు ఆవు పాలు లేదా శుద్ధ జలంతో శుద్ధి చేసి ఇష్టదైవాన్ని ప్రార్థించండి.`
    );
  }

  if (lang === "ta") {
    return deduplicateResponseText(
      `ரத்தினம் அணியும் சாஸ்திர விதிமுறை: இந்த ரத்தினத்தை **${metal}**-ல் பதித்து, வலது கையின் **${finger}**-ல் **${wearingDayAndTime}** அணிய வேண்டும். அணியும் முன் தூய பால் அல்லது தீர்த்தத்தால் சுத்தி செய்து இஷ்ட தெய்வத்தை பிரார்த்திக்கவும்.`
    );
  }

  if (lang === "ml") {
    return deduplicateResponseText(
      `രത്നം ധരിക്കുന്നതിനുള്ള ശാസ്ത്രീയ വിധി: ഈ രത്നം **${metal}**-ൽ പണിത് വലതു കൈയിലെ **${finger}**-ൽ **${wearingDayAndTime}** ധരിക്കണം. ധരിക്കുന്നതിന് മുമ്പ് പശുവിൻ പാലിലോ തീർത്ഥത്തിലോ ശുദ്ധിവരുത്തി ഇഷ്ടദേവതയെ പ്രാർത്ഥിക്കുക.`
    );
  }

  if (lang === "mr") {
    return deduplicateResponseText(
      `रत्न धारण करण्याचा शास्त्रीय नियम: हे रत्न **${metal}** मध्ये बनवून उजव्या हाताच्या **${finger}** मध्ये **${wearingDayAndTime}** धारण करावे. धारण करण्यापूर्वी कच्चे दूध किंवा गंगाजलाने शुद्ध करून इष्टदेवतेची प्रार्थना करावी.`
    );
  }

  // Kannada Default
  return deduplicateResponseText(
    `ರತ್ನ ಧಾರಣೆಯ ಶಾಸ್ತ್ರೋಕ್ತ ನಿಯಮ: ಈ ರತ್ನವನ್ನು **${metal}**ದಲ್ಲಿ ಉಂಗುರ ಮಾಡಿಸಿ, ಬಲಗೈಯ **${finger}**ಗೆ **${wearingDayAndTime}** ಧರಿಸಬೇಕು. ಧರಿಸುವ ಮುನ್ನ ಹಸಿಹಾಲು ಅಥವಾ ಗಂಗಾಜಲದಿಂದ ಶುದ್ಧೀಕರಿಸಿ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ ಧರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`
  );
}

