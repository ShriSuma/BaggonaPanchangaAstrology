import React, { useState, useEffect, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { downloadIcsFile } from "../../features/seva/icsCalendarGenerator";
import { playTempleBellChime, speakPriestNarration } from "../../features/seva/priestAudioNarrator";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../../features/audio/globalAudioManager";

export interface PersonalGoldenHourWidgetProps {
  dateStr: string; // YYYY-MM-DD
  devoteeName: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
  voiceId?: string;
}

const GOLDEN_TEXTS: Record<SevaLang, {
  title: string;
  badge: string;
  activeNow: string;
  upcoming: string;
  passed: string;
  suitableFor: string;
  activities: string;
  addToCalendarBtn: string;
  listenChantBtn: string;
  stopAudioBtn: string;
  synthesizingBtn: string;
  loaderTitle: string;
  loaderSubtitle: string;
  windowLabel: string;
  toLabel: string;
  durationBadge: string;
  reason: string;
  countdownPrefix: string;
}> = {
  kn: {
    title: "ಇಂದಿನ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ",
    badge: "೪೮ ನಿಮಿಷಗಳ ಪರಮ ಶುಭ ಅಮೃತ ಕಾಲ",
    activeNow: "🟢 ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
    upcoming: "⏳ ಇಂದಿನ ಶುಭ ಸಮಯ",
    passed: "✓ ಇಂದಿನ ಮುಹೂರ್ತ ಸಂಪನ್ನವಾಗಿದೆ",
    suitableFor: "ಈ ಸಮಯದಲ್ಲಿ ಕೈಗೊಳ್ಳಬೇಕಾದ ಶುಭ ಕಾರ್ಯಗಳು:",
    activities: "ಧನ ಹೂಡಿಕೆ, ಮಹತ್ವದ ಮಾತುಕತೆ, ನೂತನ ಕಾರ್ಯಾರಂಭ, ಚಿನ್ನ/ವಾಹನ ಖರೀದಿ, ಶುಭ ಪ್ರಾರ್ಥನೆ.",
    addToCalendarBtn: "📅 ಮುಹೂರ್ತವನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ (.ics)",
    listenChantBtn: "🔔 ಮುಹೂರ್ತ ಸಂಕಲ್ಪ ಶ್ರವಣ",
    stopAudioBtn: "⏹️ ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    synthesizingBtn: "⏳ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    loaderTitle: "ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಂಕಲ್ಪ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    loaderSubtitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ಅರ್ಚಕರ ಧ್ವನಿಯಲ್ಲಿ ಮುಹೂರ್ತ ಸಂಕಲ್ಪ ಸಿದ್ಧವಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ.",
    windowLabel: "ಅಮೃತ ಮುಹೂರ್ತ ಕಾಲಾವಧಿ",
    toLabel: "ರಿಂದ",
    durationBadge: "⏳ ೪೮ ನಿಮಿಷಗಳ ಕಾಲಾವಧಿ",
    reason: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ದಿನದ ತಾರಾಬಲದ ಆಧಾರದಲ್ಲಿ ಗಣಿಸಲಾದ ಅತ್ಯುನ್ನತ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯ ಕಾಲಘಟ್ಟ.",
    countdownPrefix: "ಮುಹೂರ್ತಕ್ಕೆ ಬಾಕಿ ಸಮಯ:"
  },
  en: {
    title: "Today's Personal Golden Hour",
    badge: "48-Minute Peak Auspicious Amritha Window",
    activeNow: "🟢 ACTIVE NOW",
    upcoming: "⏳ Upcoming Auspicious Hour",
    passed: "✓ Today's Window Concluded",
    suitableFor: "Recommended Auspicious Activities:",
    activities: "Financial investments, signing agreements, starting ventures, purchases & prayers.",
    addToCalendarBtn: "📅 Add to Phone Calendar (.ics)",
    listenChantBtn: "🔔 Listen Golden Hour Chants",
    stopAudioBtn: "⏹️ Stop Audio",
    synthesizingBtn: "⏳ Preparing Sacred Chants...",
    loaderTitle: "Preparing Golden Hour Sacred Audio...",
    loaderSubtitle: "Gokarna Chief Priest voice is preparing your personalized Sankalpa, please wait a moment.",
    windowLabel: "Auspicious Window",
    toLabel: "to",
    durationBadge: "⏳ 48-Min Window",
    reason: "Auspicious timing computed specifically for your Janma Nakshatra and Tara Bala.",
    countdownPrefix: "Time until window:"
  },
  hi: {
    title: "आज का व्यक्तिगत शुभ मुहूर्त",
    badge: "४८ मिनट का परम शुभ अमृत काल",
    activeNow: "🟢 वर्तमान में सक्रिय",
    upcoming: "⏳ आज का शुभ समय",
    passed: "✓ आज का मुहूर्त संपन्न",
    suitableFor: "इस समय किए जाने वाले शुभ कार्य:",
    activities: "धन निवेश, महत्वपूर्ण बातचीत, नया कार्य प्रारंभ, खरीदारी एवं प्रार्थना।",
    addToCalendarBtn: "📅 फोन कैलेंडर में जोड़ें (.ics)",
    listenChantBtn: "🔔 मुहूर्त संकल्प सुनें",
    stopAudioBtn: "⏹️ ध्वनि रोकें",
    synthesizingBtn: "⏳ ध्वनि तैयार हो रही है...",
    loaderTitle: "व्यक्तिगत गोल्डन मुहूर्त संकल्प ध्वनि तैयार हो रही है...",
    loaderSubtitle: "गोकर्ण क्षेत्र के मुख्य अर्चक के स्वर में मुहूर्त संकल्प तैयार हो रहा है, कृपया प्रतीक्षा करें।",
    windowLabel: "अमृत मुहूर्त कालावधि",
    toLabel: "से",
    durationBadge: "⏳ ४८ मिनट की अवधि",
    reason: "आपके जन्म नक्षत्र और ताराबल के अनुसार गणना की गई सर्वोच्च सकारात्मक ऊर्जा का समय।",
    countdownPrefix: "मुहूर्त प्रारंभ होने में समय:"
  },
  te: {
    title: "నేటి వ్యక్తిగత శుభ ముహూర్తం",
    badge: "౪౮ నిమిషాల పరమ శుభ అమృత కాలం",
    activeNow: "🟢 ప్రస్తుతం కొనసాగుతోంది",
    upcoming: "⏳ నేటి శుభ సమయం",
    passed: "✓ నేటి ముహూర్తం పూర్తయింది",
    suitableFor: "ఈ సమయంలో చేపట్టవలసిన శుభ కార్యాలు:",
    activities: "ధన పెట్టుబడులు, ముఖ్యమైన చర్చలు, నూతన ప్రారంభాలు, పూజలు.",
    addToCalendarBtn: "📅 ఫోన్ క్యాలెండర్‌కు జోడించండి (.ics)",
    listenChantBtn: "🔔 ముహూర్త సంకల్పం వినండి",
    stopAudioBtn: "⏹️ ధ్వని ఆపండి",
    synthesizingBtn: "⏳ ధ్వని సిద్ధమవుతోంది...",
    loaderTitle: "వ్యక్తిగత గోల్డెన్ ముహూర్తం సంకల్ప ధ్వని సిద్ధమవుతోంది...",
    loaderSubtitle: "గోకర్ణ క్షేత్ర ప్రధాన అర్చకుల ధ్వనిలో ముహూర్త సంకల్పం సిద్ధమవుతోంది, దయచేసి వేచి ఉండండి.",
    windowLabel: "అమృత ముహూర్త కాల వ్యవధి",
    toLabel: "నుండి",
    durationBadge: "⏳ ౪౮ నిమిషాల కాలవ్యవధి",
    reason: "మీ జన్మ నక్షత్రం మరియు తారాబలం ఆధారంగా లెక్కించబడిన అత్యున్నత శుభ సమయం.",
    countdownPrefix: "ముహూర్త సమయానికి మిగిలినది:"
  },
  ta: {
    title: "இன்றைய தனிப்பட்ட பொன் முகூர்த்தம்",
    badge: "48 நிமிட அதிர்ஷ்ட அமிர்த நேரம்",
    activeNow: "🟢 இப்போது நடப்பில் உள்ளது",
    upcoming: "⏳ இன்றைய சுப நேரம்",
    passed: "✓ இன்றைய முகூர்த்தம் முடிந்தது",
    suitableFor: "இந்த நேரத்தில் செய்ய வேண்டிய நற்காரியங்கள்:",
    activities: "பண முதலீடு, முக்கிய பேச்சுவார்த்தை, புதிய தொடக்கங்கள், பிரார்த்தனை.",
    addToCalendarBtn: "📅 காலண்டரில் சேர்க்க (.ics)",
    listenChantBtn: "🔔 முகூர்த்த சங்கல்பம் கேட்க",
    stopAudioBtn: "⏹️ குரலை நிறுத்து",
    synthesizingBtn: "⏳ குரல் தயாராகிறது...",
    loaderTitle: "தனிப்பட்ட பொன் முகூர்த்த சங்கல்ப ஆடியோ தயாராகிறது...",
    loaderSubtitle: "கோகர்ண க்ஷேத்திர முதன்மை அர்ச்சகர் குரலில் முகூர்த்த சங்கல்பம் தயாராகிறது, தயவுசெய்து காத்திருக்கவும்.",
    windowLabel: "அமிர்த முகூர்த்த கால அளவு",
    toLabel: "முதல்",
    durationBadge: "⏳ 48 நிமிட கால அளவு",
    reason: "உங்கள் ஜென்ம நட்சத்திரம் மற்றும் தாராபலத்தின் அடிப்படையில் கணிக்கப்பட்ட நற்பொழுது.",
    countdownPrefix: "நேரம் மீதம்:"
  }
};

/**
 * Computes deterministic 48-minute peak auspicious window for the day
 */
function computePersonalGoldenHour(dateStr: string, nakshatraIndex = 18) {
  const d = new Date(dateStr);
  const daySeed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + nakshatraIndex * 7) % 7;

  const candidateSlots = [
    { startMinutes: 8 * 60 + 24, endMinutes: 9 * 60 + 12 },
    { startMinutes: 9 * 60 + 36, endMinutes: 10 * 60 + 24 },
    { startMinutes: 10 * 60 + 48, endMinutes: 11 * 60 + 36 },
    { startMinutes: 12 * 60 + 12, endMinutes: 13 * 60 + 0 },
    { startMinutes: 14 * 60 + 24, endMinutes: 15 * 60 + 12 },
    { startMinutes: 15 * 60 + 36, endMinutes: 16 * 60 + 24 },
    { startMinutes: 16 * 60 + 48, endMinutes: 17 * 60 + 36 }
  ];

  const slot = candidateSlots[daySeed];

  const formatMinutes = (m: number) => {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayH = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayH}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  const startTimeStr = formatMinutes(slot.startMinutes);
  const endTimeStr = formatMinutes(slot.endMinutes);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = now.toISOString().slice(0, 10) === dateStr;

  let status: "active" | "upcoming" | "passed" = "upcoming";
  if (isToday) {
    if (currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes) {
      status = "active";
    } else if (currentMinutes > slot.endMinutes) {
      status = "passed";
    } else {
      status = "upcoming";
    }
  }

  return {
    ...slot,
    startTimeStr,
    endTimeStr,
    status
  };
}


export const PersonalGoldenHourWidget: React.FC<PersonalGoldenHourWidgetProps> = ({
  dateStr,
  devoteeName,
  nakshatraIndex = 18,
  lang = "kn",
  voiceId
}) => {
  const t = GOLDEN_TEXTS[lang] || GOLDEN_TEXTS.kn;
  const [isPlayingChant, setIsPlayingChant] = useState(false);
  const [isLoadingChant, setIsLoadingChant] = useState(false);

  useEffect(() => {
    const unsub = onGlobalAudioStop(() => {
      setIsPlayingChant(false);
      setIsLoadingChant(false);
    });
    return () => {
      unsub();
      stopAllAudioGlobal();
    };
  }, []);

  const goldenHour = useMemo(() => {
    return computePersonalGoldenHour(dateStr, nakshatraIndex);
  }, [dateStr, nakshatraIndex]);

  const handlePlayChant = () => {
    if (isPlayingChant || isLoadingChant) {
      stopAllAudioGlobal();
      setIsPlayingChant(false);
      setIsLoadingChant(false);
      return;
    }

    stopAllAudioGlobal();
    playTempleBellChime();
    setIsLoadingChant(true);

    // STRICT USER MANDATE: "100% accurately whatever written, no blah blah added, only what is written clearly needs to be told."
    // Recite strictly the sacred Om Namah Shivaya chant. Zero added meta text.
    const chantText = lang === "ta"
      ? "ஓம் நம சிவாய."
      : lang === "te"
      ? "ఓం నమః శివాయ."
      : lang === "hi"
      ? "ॐ नमः शिवाय।"
      : lang === "en"
      ? "Om Namah Shivaya."
      : "ಓಂ ನಮಃ ಶಿವಾಯ.";

    speakPriestNarration(
      chantText,
      lang,
      () => {
        setIsPlayingChant(false);
        setIsLoadingChant(false);
      },
      undefined,
      voiceId,
      () => {
        setIsLoadingChant(false);
        setIsPlayingChant(true);
      }
    );
  };

  const handleDownloadGoldenHourIcs = () => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    const startH = Math.floor(goldenHour.startMinutes / 60).toString().padStart(2, "0");
    const startM = (goldenHour.startMinutes % 60).toString().padStart(2, "0");
    const endH = Math.floor(goldenHour.endMinutes / 60).toString().padStart(2, "0");
    const endM = (goldenHour.endMinutes % 60).toString().padStart(2, "0");

    const dtStart = `${year}${month}${day}T${startH}${startM}00`;
    const dtEnd = `${year}${month}${day}T${endH}${endM}00`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Baggona Panchanga//Golden Hour Reminder//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:✨ ${devoteeName} - Golden Hour (${goldenHour.startTimeStr} - ${goldenHour.endTimeStr})`,
      `DESCRIPTION:${t.title}\\n${t.activities}\\nOm Namah Shivaya.`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "TRIGGER:-PT10M",
      "ATTACH;VALUE=URI:PresetSound#Bells",
      `DESCRIPTION:${t.countdownPrefix} 10 min`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    downloadIcsFile(`Baggona_Golden_Hour_${dateStr}_${devoteeName.replace(/[^a-zA-Z0-9]/g, "_")}.ics`, icsContent);
  };

  return (
    <div className="bg-gradient-to-br from-[#501B11] via-[#3A140B] to-[#250C06] border-2 border-[#D4AF37] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-amber-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shadow-xs">
            ⏳
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#FDE68A]">
              {t.title}
            </h3>
            <span className="text-xs text-amber-300 font-bold">
              {t.badge}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs ${
            goldenHour.status === "active"
              ? "bg-emerald-950 border-emerald-400 text-emerald-300 animate-pulse"
              : goldenHour.status === "upcoming"
              ? "bg-amber-950 border-amber-400 text-amber-300"
              : "bg-slate-900 border-slate-700 text-slate-400"
          }`}
        >
          {goldenHour.status === "active"
            ? t.activeNow
            : goldenHour.status === "upcoming"
            ? t.upcoming
            : t.passed}
        </span>
      </div>

      {/* Golden Window Time Strip */}
      <div className="p-4 sm:p-5 bg-black/50 rounded-2xl border-2 border-amber-500/40 shadow-inner w-full box-border space-y-4">
        {/* Top: Time Display & Auspicious Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-b border-amber-500/20 pb-3">
          <div className="space-y-1">
            <div className="text-xs font-black text-[#FDE68A] uppercase tracking-wider">
              {t.windowLabel}
            </div>
            <div className="text-lg sm:text-2xl font-black font-mono text-white flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-amber-400 font-sans">✦</span>
              <span>{goldenHour.startTimeStr}</span>
              <span className="text-xs text-amber-300/70 font-sans">{t.toLabel}</span>
              <span>{goldenHour.endTimeStr}</span>
            </div>
          </div>
          <div className="text-xs text-amber-300 font-black bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-xs">
            {t.durationBadge}
          </div>
        </div>

        {/* Bottom: 2 Action Buttons Side-by-Side (100% inside container, strictly zero overflow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full box-border">
          <button
            type="button"
            onClick={handlePlayChant}
            disabled={isLoadingChant}
            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs border shadow-sm transition-all flex items-center justify-center gap-2 text-center box-border ${
              isPlayingChant
                ? "bg-emerald-600 text-white border-emerald-400 animate-pulse"
                : isLoadingChant
                ? "bg-amber-950/70 text-amber-300 border-amber-500/60 opacity-80 cursor-wait"
                : "bg-amber-950/90 hover:bg-amber-900 text-amber-200 border-amber-400 active:scale-95"
            }`}
          >
            <span>
              {isLoadingChant ? t.synthesizingBtn : isPlayingChant ? t.stopAudioBtn : t.listenChantBtn}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadGoldenHourIcs}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-300 text-center box-border"
          >
            <span>{t.addToCalendarBtn}</span>
          </button>
        </div>
      </div>

      {/* Suggested Activities */}
      <div className="p-3.5 bg-amber-950/60 rounded-2xl border border-amber-500/30 text-xs space-y-1">
        <div className="font-black text-[#FDE68A] flex items-center gap-1.5 text-xs">
          <span>🌟</span>
          <span>{t.suitableFor}</span>
        </div>
        <p className="text-xs text-amber-100 font-semibold leading-relaxed pl-4 border-l-2 border-amber-400">
          {t.activities}
        </p>
      </div>

    </div>
  );
};
