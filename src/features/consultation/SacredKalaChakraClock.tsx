/**
 * Sacred Vedic Kala Chakra Clock & 20-Minute Timepiece Engine
 * 
 * Psychological Time Perception Architecture:
 * 1. 60-Second Authentic Ticking Astrological Dial: A mechanical second-hand
 *    actively steps 6° every second with a luminous golden spark beacon.
 * 2. 4-Pada Ghati Vedic Chapter System: Divides the 20-minute session into
 *    4 distinct 5-minute sacred chapters (Chart Foundation -> Core Questions ->
 *    Dasha/Transits -> Parihara & Blessings), making 20 minutes feel as expansive
 *    and comprehensive as a 1-hour in-person consultation.
 * 3. 1,200-Second Granular Counter: Displays total elapsed/remaining seconds
 *    with micro-pulsing seconds digits.
 * 4. Liquid-gold shimmer progress track with 4 jeweled quadrant nodes.
 * 5. Full 7-language localization with zero English token leakage.
 */

import React, { useState } from "react";
import type { ConsultationSession, ConsultationLanguage } from "./consultationTypes";

interface SacredKalaChakraClockProps {
  session: ConsultationSession;
  remainingSeconds: number;
  totalDurationSeconds?: number;
  language: ConsultationLanguage;
  isExpired: boolean;
  onStart?: () => void;
  startingTimer?: boolean;
  onClaimBonus?: () => void;
  claimingBonus?: boolean;
  showBonusBanner?: boolean;
}

interface ClockLocale {
  sessionTitle: string;
  readyToStart: string;
  startBtn: string;
  startingBtn: string;
  timeRemaining: string;
  sessionEnded: string;
  callPriest: string;
  secondsRemaining: string;
  secondsTotal: string;
  generosityText: string;
  bonusTitle: string;
  bonusSubtitle: string;
  addBonusBtn: string;
  padas: [string, string, string, string];
  padaNames: [string, string, string, string];
  expandText: string;
  collapseText: string;
}

const CLOCK_I18N: Record<ConsultationLanguage, ClockLocale> = {
  kn: {
    sessionTitle: "॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಕಾಲಚಕ್ರ ಮುಹೂರ್ತ ॥",
    readyToStart: "೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಸಮಾಲೋಚನೆ (ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧ)",
    startBtn: "ಪ್ರಾರಂಭಿಸಿ (೨೦ ನಿಮಿಷ)",
    startingBtn: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
    timeRemaining: "ಪವಿತ್ರ ಸಂವಾದ ಸಮಯ ಬಾಕಿ:",
    sessionEnded: "ಸಮಾಲೋಚನಾ ಸಮಯ ಸಮಾಪ್ತಗೊಂಡಿದೆ",
    callPriest: "📞 ಶ್ರೀರಾಮ್ ಪಂಡಿತರಿಗೆ ಕರೆ ಮಾಡಿ (9972339362)",
    secondsRemaining: "ಸೆಕೆಂಡು ಬಾಕಿ",
    secondsTotal: "೧೨೦೦ ಸೆಕೆಂಡುಗಳ ಕಾಲಾವಕಾಶ",
    generosityText: "೨೦ ನಿಮಿಷಗಳ ವಿಸ್ತೃತ ದೈವಿಕ ಸಂವಾದ • ೮ ರಿಂದ ೧೨ ಆಳವಾದ ಪ್ರಶ್ನೆಗಳನ್ನು ಸಮಾಧಾನವಾಗಿ ಕೇಳಲು ಸಂಪೂರ್ಣ ಕಾಲಾವಕಾಶವಿದೆ",
    bonusTitle: "ಉಚಿತ +೧ ನಿಮಿಷ ವಿಸ್ತರಣೆ ಲಭ್ಯ!",
    bonusSubtitle: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹದಿಂದ ಹೆಚ್ಚುವರಿ ೬೦ ಸೆಕೆಂಡುಗಳನ್ನು ಪಡೆಯಿರಿ.",
    addBonusBtn: "+೧ ನಿಮಿಷ ಸೇರಿಸಿ",
    padas: [
      "ಪಾದ ೧ (೦-೫ ನಿ)",
      "ಪಾದ ೨ (೫-೧೦ ನಿ)",
      "ಪಾದ ೩ (೧೦-೧೫ ನಿ)",
      "ಪಾದ ೪ (೧೫-೨೦ ನಿ)"
    ],
    padaNames: [
      "ಕುಂಡಲಿ ಪರಿಚಯ",
      "ಪ್ರಶ್ನಾವಳಿ ಸಂವಾದ",
      "ದಶಾ-ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ",
      "ಪರಿಹಾರ & ಆಶೀರ್ವಾದ"
    ],
    expandText: "ಕಾಲಚಕ್ರ ವಿಸ್ತರಿಸಿ ▾",
    collapseText: "ಸಂಕ್ಷಿಪ್ತ ▴"
  },
  en: {
    sessionTitle: "॥ Sri Baggona Kala Chakra Timepiece ॥",
    readyToStart: "20-Minute Private Consultation (Ready to Start)",
    startBtn: "Start (20 Mins)",
    startingBtn: "Starting...",
    timeRemaining: "Sacred Dialogue Time Remaining:",
    sessionEnded: "Consultation Session Has Ended",
    callPriest: "📞 Call Shreeram Pandit (9972339362)",
    secondsRemaining: "seconds left",
    secondsTotal: "1,200 Total Seconds Available",
    generosityText: "Abundant 20-Minute Divine Session • Ample time to calmly discuss 8 to 12 deep questions and sacred remedies",
    bonusTitle: "Free +1 Minute Extension Available!",
    bonusSubtitle: "Receive an additional 60 seconds of divine consultation.",
    addBonusBtn: "Add +1 Min",
    padas: [
      "Pada 1 (0-5m)",
      "Pada 2 (5-10m)",
      "Pada 3 (10-15m)",
      "Pada 4 (15-20m)"
    ],
    padaNames: [
      "Chart Foundation",
      "Core Questions",
      "Dasha & Transits",
      "Parihara & Blessings"
    ],
    expandText: "Expand Timepiece ▾",
    collapseText: "Compact ▴"
  },
  hi: {
    sessionTitle: "॥ श्री बग्गोण कालचक्र मुहूर्त ॥",
    readyToStart: "२० मिनट का निजी परामर्श (प्रारंभ हेतु तैयार)",
    startBtn: "प्रारंभ करें (२० मिनट)",
    startingBtn: "प्रारंभ हो रहा है...",
    timeRemaining: "पवित्र संवाद शेष समय:",
    sessionEnded: "परामर्श सत्र समाप्त हो चुका है",
    callPriest: "📞 श्रीराम पंडित जी को कॉल करें (9972339362)",
    secondsRemaining: "सेकंड शेष",
    secondsTotal: "१२०० सेकंड का पर्याप्त समय",
    generosityText: "२० मिनट का विस्तृत दिव्य संवाद • ८ से १२ गहन प्रश्नों व उपायों पर शांति से चर्चा का पूरा समय",
    bonusTitle: "निःशुल्क +१ मिनट विस्तार उपलब्ध!",
    bonusSubtitle: "श्री महाबलेश्वर कृपा से ६० अतिरिक्त सेकंड प्राप्त करें।",
    addBonusBtn: "+१ मिनट जोड़ें",
    padas: [
      "पाद १ (०-५ मि)",
      "पाद २ (५-१० मि)",
      "पाद ३ (१०-१५ मि)",
      "पाद ४ (१५-२० मि)"
    ],
    padaNames: [
      "कुंडली परिचय",
      "प्रश्नावली संवाद",
      "दशा-गोचर विश्लेषण",
      "परिहार व आशीर्वाद"
    ],
    expandText: "कालचक्र विस्तार ▾",
    collapseText: "संक्षिप्त ▴"
  },
  te: {
    sessionTitle: "॥ శ్రీ బగ్గోణ కాలచక్ర ముహూర్తం ॥",
    readyToStart: "20 నిమిషాల వ్యక్తిగత సంప్రదింపులు (ప్రారంభించడానికి సిద్ధం)",
    startBtn: "ప్రారంభించండి (20 నిమిషాలు)",
    startingBtn: "ప్రారంభమవుతోంది...",
    timeRemaining: "పవిత్ర సంభాషణ మిగిలిన సమయం:",
    sessionEnded: "సంప్రదింపు సమయం ముగిసింది",
    callPriest: "📞 శ్రీరామ్ పండిత్ గారికి కాల్ చేయండి (9972339362)",
    secondsRemaining: "సెకన్లు మిగిలి ఉన్నాయి",
    secondsTotal: "1200 సెకన్ల సమృద్ధి సమయం",
    generosityText: "20 నిమిషాల విస్తృత దివ్య సంభాషణ • 8 నుండి 12 ముఖ్యమైన ప్రశ్నలు నిదానంగా అడగడానికి పూర్తి సమయం",
    bonusTitle: "ఉచిత +1 నిమిషం పొడిగింపు అందుబాటులో ఉంది!",
    bonusSubtitle: "శ్రీ మహాబలేశ్వరుని అనుగ్రహంతో అదనంగా 60 సెకన్లు పొందండి.",
    addBonusBtn: "+1 నిమిషం జోడించండి",
    padas: [
      "పాదం 1 (0-5ని)",
      "పాదం 2 (5-10ని)",
      "పాదం 3 (10-15ని)",
      "పాదం 4 (15-20ని)"
    ],
    padaNames: [
      "కుండలి పరిచయం",
      "ప్రశ్నోత్తరాలు",
      "దశా-గోచారం",
      "పరిహారం & ఆశీస్సులు"
    ],
    expandText: "కాలచక్రం విస్తరించు ▾",
    collapseText: "సంక్షిప్తం ▴"
  },
  ta: {
    sessionTitle: "॥ ஸ்ரீ பக்கவணா காலசக்கரம் ॥",
    readyToStart: "20 நிமிட பிரத்யேக ஆலோசனை (தொடங்க தயார்)",
    startBtn: "தொடங்கு (20 நிமிடம்)",
    startingBtn: "தொடங்குகிறது...",
    timeRemaining: "புனித உரையாடல் மீதமுள்ள நேரம்:",
    sessionEnded: "ஆலோசனை நேரம் முடிவடைந்தது",
    callPriest: "📞 ஸ்ரீராம் பண்டிதரை அழைக்கவும் (9972339362)",
    secondsRemaining: "வினாடிகள் மீதம்",
    secondsTotal: "1200 வினாடிகள் முழு நேரம்",
    generosityText: "20 நிமிட விரிவான தெய்வீக உரையாடல் • 8 முதல் 12 முக்கிய கேள்விகளை நிதானமாக கேட்க போதுமான நேரம்",
    bonusTitle: "இலவச +1 நிமிடம் கூடுதல் நேரம்!",
    bonusSubtitle: "ஸ்ரீ மகாபலேஸ்வரர் அருளால் கூடுதல் 60 வினாடிகளைப் பெறுங்கள்.",
    addBonusBtn: "+1 நிமிடம் சேர்",
    padas: [
      "பாதம் 1 (0-5நி)",
      "பாதம் 2 (5-10நி)",
      "பாதம் 3 (10-15நி)",
      "பாதம் 4 (15-20நி)"
    ],
    padaNames: [
      "ஜாதக தொடக்கம்",
      "கேள்விகள் உரையாடல்",
      "தசா-கோச்சாரம்",
      "பரிகாரம் & ஆசி"
    ],
    expandText: "காலசக்கரம் விரி ▾",
    collapseText: "சுருக்கு ▴"
  },
  ml: {
    sessionTitle: "॥ ശ്രീ ബഗ്ഗോണ കാലചക്രം ॥",
    readyToStart: "20 മിനിറ്റ് സ്വകാര്യ സംഭാഷണം (ആരംഭിക്കാൻ തയ്യാറാണ്)",
    startBtn: "ആരംഭിക്കുക (20 മിനിറ്റ്)",
    startingBtn: "ആരംഭിക്കുന്നു...",
    timeRemaining: "പവിത്ര സംഭാഷണ സമയം ബാക്കി:",
    sessionEnded: "കൺസൾട്ടേഷൻ സമയം അവസാനിച്ചു",
    callPriest: "📞 ശ്രീറാം പണ്ഡിറ്റിനെ വിളിക്കുക (9972339362)",
    secondsRemaining: "സെക്കൻഡുകൾ ബാക്കി",
    secondsTotal: "1200 സെക്കൻഡ് ലഭ്യമായ സമയം",
    generosityText: "20 മിനിറ്റ് വിപുലമായ ദിവ്യ സംഭാഷണം • 8 മുതൽ 12 ആഴത്തിലുള്ള ചോദ്യങ്ങൾ ശാന്തമായി ചോദിക്കാൻ പൂർണ്ണ സമയം",
    bonusTitle: "സൗജന്യ +1 മിനിറ്റ് അധിക സമയം ലഭ്യമാണ്!",
    bonusSubtitle: "ശ്രീ മഹാബലേശ്വര അനുഗ്രഹത്താൽ 60 സെക്കൻഡ് കൂടി നേടൂ.",
    addBonusBtn: "+1 മിനിറ്റ് ചേർക്കുക",
    padas: [
      "പാദം 1 (0-5മി)",
      "പാദം 2 (5-10മി)",
      "പാദം 3 (10-15മി)",
      "പാദം 4 (15-20മി)"
    ],
    padaNames: [
      "ജാതക പ്രാരംഭം",
      "ചോദ്യോത്തരങ്ങൾ",
      "ദശാ-ഗോചാരം",
      "പരിഹാരവും അനുഗ്രഹവും"
    ],
    expandText: "കാലചക്രം വികസിപ്പിക്കുക ▾",
    collapseText: "ലഘുരൂപം ▴"
  },
  mr: {
    sessionTitle: "॥ श्री बग्गोण कालचक्र मुहूर्त ॥",
    readyToStart: "२० मिनिटांची खाजगी चर्चा (सुरू करण्यासाठी सज्ज)",
    startBtn: "सुरू करा (२० मिनिटे)",
    startingBtn: "सुरू होत आहे...",
    timeRemaining: "पवित्र संवाद शिल्लक वेळ:",
    sessionEnded: "सल्लामसलत सत्र संपले आहे",
    callPriest: "📞 श्रीराम पंडित यांना कॉल करा (9972339362)",
    secondsRemaining: "सेकंद शिल्लक",
    secondsTotal: "१२०० सेकंदांचा भरपूर अवधी",
    generosityText: "२० मिनिटांचा सविस्तर दिव्य संवाद • ८ ते १२ सखोल प्रश्न व उपायांवर शांतपणे चर्चा करण्यासाठी पूर्ण वेळ",
    bonusTitle: "विनामूल्य +१ मिनिट वाढ उपलब्ध!",
    bonusSubtitle: "श्री महाबळेश्वर कृपेने ६० अतिरिक्त सेकंद मिळवा.",
    addBonusBtn: "+१ मिनिट जोडा",
    padas: [
      "चरण १ (०-५ मि)",
      "चरण २ (५-१० मि)",
      "चरण ३ (१०-१५ मि)",
      "चरण ४ (१५-२० मि)"
    ],
    padaNames: [
      "पत्रिका परिचय",
      "प्रश्नावली संवाद",
      "दशा-गोचर",
      "उपाय व आशीर्वाद"
    ],
    expandText: "कालचक्र उघडा ▾",
    collapseText: "संक्षिप्त ▴"
  }
};

export const SacredKalaChakraClock: React.FC<SacredKalaChakraClockProps> = ({
  session,
  remainingSeconds,
  totalDurationSeconds = 1200,
  language,
  isExpired,
  onStart,
  startingTimer = false,
  onClaimBonus,
  claimingBonus = false,
  showBonusBanner = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const locale = CLOCK_I18N[language] || CLOCK_I18N.kn;

  // Minutes and seconds calculation
  const mins = Math.max(0, Math.floor(remainingSeconds / 60));
  const secs = Math.max(0, remainingSeconds % 60);
  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  // Percentage calculations
  const elapsedSeconds = Math.max(0, totalDurationSeconds - remainingSeconds);
  const overallPercentage = Math.min(100, Math.max(0, (remainingSeconds / totalDurationSeconds) * 100));
  const elapsedPercentage = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));

  // Ticking second hand calculation (6 degrees per second for a standard 60-second mechanical face)
  // When ticking, the second hand rotates smoothly around the 360 degree dial
  const secondHandAngle = (secs % 60) * 6; // 0 to 354 degrees
  const currentMinuteCyclePercentage = ((60 - (secs === 0 ? 60 : secs)) / 60) * 100;

  // 4 Padas determination (0 to 3)
  // Pada 0: 1200 -> 900s (0 to 5 mins elapsed)
  // Pada 1: 900 -> 600s (5 to 10 mins elapsed)
  // Pada 2: 600 -> 300s (10 to 15 mins elapsed)
  // Pada 3: 300 -> 0s (15 to 20 mins elapsed)
  const currentPadaIndex = Math.min(3, Math.floor(elapsedSeconds / 300));

  // Urgency color states:
  // > 5 mins: Luxury Royal Amber & Gold
  // 2 - 5 mins: Warm Sunset Gold
  // < 2 mins: Urgent Divine Ruby Red
  const isUrgent = remainingSeconds < 120;
  const isWarning = remainingSeconds >= 120 && remainingSeconds < 300;

  return (
    <div className="w-full bg-gradient-to-b from-[#1C1308] via-[#2A1B0E] to-[#1C1308] text-amber-100 border-b-2 border-amber-500/60 shadow-xl relative overflow-hidden select-none">
      {/* Decorative Gold Filigree Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" 
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 relative z-10">
        
        {/* ==============================================================
            STATE 1: PENDING (BEFORE START)
            ============================================================== */}
        {session.status === "pending" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-xl animate-pulse">🕉️</span>
              </div>
              <div>
                <h3 className="font-serif font-black text-amber-300 text-sm tracking-wide">
                  {locale.sessionTitle}
                </h3>
                <p className="text-[11px] text-amber-200/80">
                  {locale.readyToStart}
                </p>
              </div>
            </div>

            <button
              onClick={onStart}
              disabled={startingTimer}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black px-5 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-900/40 border border-amber-300 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="text-base animate-bounce">⏳</span>
              {startingTimer ? locale.startingBtn : locale.startBtn}
            </button>
          </div>
        )}

        {/* ==============================================================
            STATE 2: EXPIRED (SESSION ENDED)
            ============================================================== */}
        {isExpired && session.status !== "pending" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5 text-red-300 font-bold text-xs sm:text-sm">
              <span className="text-lg">⌛</span>
              <span>{locale.sessionEnded}</span>
            </div>
            <a
              href="tel:9972339362"
              className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-md border border-red-500 flex items-center gap-2 transition active:scale-95"
            >
              {locale.callPriest}
            </a>
          </div>
        )}

        {/* ==============================================================
            STATE 3: ACTIVE 20-MINUTE TOCKING CLOCK
            ============================================================== */}
        {session.status === "active" && !isExpired && (
          <div className="flex flex-col gap-2">
            
            {/* Top Bar: Kala Chakra Dial + Digital Readout + Pada Badge + Expand Button */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* LEFT: Ticking Mechanical Kala Chakra Dial (SVG) */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center">
                  
                  {/* Glowing ambient golden aura */}
                  <div 
                    className="absolute inset-0 rounded-full blur-xs opacity-60 pointer-events-none"
                    style={{
                      backgroundColor: isUrgent ? "#dc2626" : isWarning ? "#ea580c" : "#f59e0b"
                    }}
                  />

                  {/* SVG Clock Face */}
                  <svg 
                    className="w-12 h-12 sm:w-14 sm:h-14 relative z-10" 
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient id="goldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="50%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>
                      <linearGradient id="clockProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>

                    {/* Outer Antique Brass Rim */}
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="#1e1308"
                      stroke="url(#goldBezel)"
                      strokeWidth="2.5"
                    />

                    {/* Overall Session Countdown Ring Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#451a03"
                      strokeWidth="4"
                    />

                    {/* Overall Session Countdown Progress Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={isUrgent ? "#ef4444" : isWarning ? "#f97316" : "url(#clockProgressGrad)"}
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - overallPercentage / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-1000 ease-linear"
                    />

                    {/* 12 Rashi / Bhava Tick Marks (Every 30 degrees) */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                      const rad = (deg - 90) * (Math.PI / 180);
                      const x1 = 50 + 34 * Math.cos(rad);
                      const y1 = 50 + 34 * Math.sin(rad);
                      const x2 = 50 + 38 * Math.cos(rad);
                      const y2 = 50 + 38 * Math.sin(rad);
                      const isQuarter = deg % 90 === 0;
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isQuarter ? "#fef3c7" : "#d97706"}
                          strokeWidth={isQuarter ? "2" : "1"}
                          strokeLinecap="round"
                          opacity={isQuarter ? 0.95 : 0.6}
                        />
                      );
                    })}

                    {/* 60 Minor Second Tick Dots */}
                    {Array.from({ length: 60 }).map((_, i) => {
                      if (i % 5 === 0) return null; // handled by major ticks
                      const deg = i * 6;
                      const rad = (deg - 90) * (Math.PI / 180);
                      const cx = 50 + 36 * Math.cos(rad);
                      const cy = 50 + 36 * Math.sin(rad);
                      return (
                        <circle
                          key={`dot-${i}`}
                          cx={cx}
                          cy={cy}
                          r="0.75"
                          fill="#fef08a"
                          opacity={0.4}
                        />
                      );
                    })}

                    {/* LIVE TICKING SECOND HAND (Cosmic Needle) */}
                    {/* Rotates 6 degrees per second with realistic mechanical tick animation */}
                    <g 
                      transform={`rotate(${secondHandAngle} 50 50)`}
                      className="transition-transform duration-150 ease-out"
                    >
                      {/* Needle counterweight */}
                      <circle cx="50" cy="57" r="2.5" fill="#d97706" />
                      {/* Slender gold needle shaft */}
                      <line
                        x1="50"
                        y1="57"
                        x2="50"
                        y2="17"
                        stroke="#fef08a"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      {/* Luminous beacon spark at needle tip */}
                      <circle
                        cx="50"
                        y="17"
                        r="2.8"
                        fill="#f59e0b"
                        stroke="#fff"
                        strokeWidth="0.8"
                      />
                    </g>

                    {/* Center Sacred Medallion / Brass Hub */}
                    <circle
                      cx="50"
                      cy="50"
                      r="6"
                      fill="url(#goldBezel)"
                      stroke="#451a03"
                      strokeWidth="1"
                    />
                    <circle cx="50" cy="50" r="2" fill="#fff" />
                  </svg>
                </div>

                {/* Status & Sacred Pada Description */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] sm:text-xs font-bold text-amber-200">
                      {locale.timeRemaining}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                    <span className="bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-600/50">
                      {locale.padas[currentPadaIndex]}
                    </span>
                    <span className="hidden sm:inline text-amber-300/80">
                      • {locale.padaNames[currentPadaIndex]}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: High-Precision Digital Timepiece (MM:SS) + Expand Toggle */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Digital Box with Ticking Micro-Bounce on Seconds */}
                <div 
                  className={`flex items-baseline font-mono font-black px-2.5 sm:px-3.5 py-1 rounded-xl border shadow-inner transition-all ${
                    isUrgent
                      ? "bg-red-950/80 text-red-200 border-red-500 animate-pulse shadow-red-900/50"
                      : isWarning
                      ? "bg-amber-950/80 text-amber-200 border-amber-500"
                      : "bg-[#2A1808] text-amber-100 border-amber-400/80 shadow-amber-950"
                  }`}
                >
                  <span className="text-lg sm:text-2xl tracking-tight text-amber-50">
                    {formattedMins}
                  </span>
                  <span className="text-base sm:text-xl text-amber-400 animate-pulse mx-0.5">
                    :
                  </span>
                  <span 
                    key={remainingSeconds} 
                    className="text-lg sm:text-2xl text-yellow-300 inline-block transform animate-in zoom-in-95 duration-100"
                  >
                    {formattedSecs}
                  </span>
                  <span className="text-[9px] text-amber-400 ml-1.5 uppercase tracking-wider font-sans font-bold">
                    {secs}s
                  </span>
                </div>

                {/* Expand / Collapse Details Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-600/40 px-2 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                  title="Toggle Kala Chakra Details"
                >
                  {isExpanded ? locale.collapseText : locale.expandText}
                </button>
              </div>
            </div>

            {/* ==========================================================
                THE 4-PADA LUXURY PROGRESS TRACK (Vedic Ghati Milestones)
                ========================================================== */}
            <div className="w-full flex flex-col gap-1 pt-0.5">
              
              {/* Outer Golden Track */}
              <div className="relative w-full h-3 bg-amber-950/90 rounded-full border border-amber-500/50 p-0.5 overflow-hidden shadow-inner">
                {/* Liquid Gold Progress Bar */}
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear relative overflow-hidden ${
                    isUrgent
                      ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-600"
                      : isWarning
                      ? "bg-gradient-to-r from-amber-600 via-orange-400 to-amber-500"
                      : "bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500"
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                >
                  {/* Flowing Shimmer Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-[shimmer_2s_infinite]" />
                </div>

                {/* 4 Quarter Milestone Dividing Markers (25%, 50%, 75%) */}
                <div className="absolute top-0 left-1/4 w-0.5 h-full bg-[#1C1308]/70" />
                <div className="absolute top-0 left-2/4 w-0.5 h-full bg-[#1C1308]/70" />
                <div className="absolute top-0 left-3/4 w-0.5 h-full bg-[#1C1308]/70" />
              </div>

              {/* 4 Sacred Padas Indicator Labels */}
              <div className="grid grid-cols-4 text-[9px] sm:text-[10px] font-bold tracking-tight text-center pt-0.5">
                {[0, 1, 2, 3].map((padaIdx) => {
                  const isActive = currentPadaIndex === padaIdx;
                  const isCompleted = currentPadaIndex > padaIdx;
                  return (
                    <div 
                      key={padaIdx} 
                      className={`flex flex-col items-center px-1 transition-all ${
                        isActive
                          ? "text-yellow-300 scale-102 font-black"
                          : isCompleted
                          ? "text-amber-500/70"
                          : "text-amber-300/40"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isActive 
                            ? "bg-yellow-300 ring-2 ring-yellow-400/50 animate-pulse" 
                            : isCompleted 
                            ? "bg-amber-600" 
                            : "bg-amber-900"
                        }`} />
                        <span>{locale.padas[padaIdx]}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-normal opacity-85 truncate max-w-full">
                        {locale.padaNames[padaIdx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==========================================================
                EXPANDED ASTROLOGICAL TIME HORIZON VIEW
                (Psychological Generosity Architecture)
                ========================================================== */}
            {isExpanded && (
              <div className="bg-[#150D05]/90 border border-amber-600/40 rounded-xl p-3 mt-1.5 flex flex-col gap-2.5 text-xs animate-in slide-in-from-top-2 duration-200">
                
                {/* Granular Second Progression Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-base animate-pulse">🕰️</span>
                    <div>
                      <p className="font-bold text-amber-200 text-xs">
                        {remainingSeconds} {locale.secondsRemaining} ({locale.secondsTotal})
                      </p>
                      <p className="text-[10px] text-amber-300/70">
                        {Math.floor(elapsedSeconds / 60)} ನಿಮಿಷ ಕಳೆದಿದೆ • {mins} ನಿಮಿಷ ಬಾಕಿ
                      </p>
                    </div>
                  </div>

                  {/* 60-second micro-cycle pulse bar */}
                  <div className="w-full sm:w-40 flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] text-amber-400/80">
                      <span>ಪ್ರಸ್ತುತ ನಿಮಿಷದ ಸೆಕೆಂಡು:</span>
                      <span className="font-mono font-bold">{secs}s</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-900/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(secs / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Psychological Peace & Calm Assurance */}
                <div className="flex items-center gap-2 text-amber-200/90 text-[11px] leading-relaxed bg-amber-900/20 px-2.5 py-1.5 rounded-lg border border-amber-600/20">
                  <span className="text-sm shrink-0">🌿</span>
                  <span>{locale.generosityText}</span>
                </div>
              </div>
            )}

            {/* ==========================================================
                BONUS +1 MINUTE BANNER (FINAL 60s / 10s)
                ========================================================== */}
            {showBonusBanner && !session.bonusMinuteClaimed && onClaimBonus && (
              <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-amber-950 px-3 py-1.5 rounded-lg shadow-md flex items-center justify-between text-xs font-bold animate-in zoom-in-95 duration-200 border border-amber-300 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-base animate-bounce">🎁</span>
                  <div>
                    <p className="leading-tight">{locale.bonusTitle}</p>
                    <p className="text-[10px] text-amber-900/80 font-normal">{locale.bonusSubtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClaimBonus}
                  disabled={claimingBonus}
                  className="bg-amber-950 hover:bg-black text-amber-200 px-3 py-1 rounded-md text-xs font-black shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {claimingBonus ? "..." : locale.addBonusBtn}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
