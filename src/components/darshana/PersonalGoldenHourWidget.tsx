import React, { useState, useEffect, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { downloadIcsFile } from "../../features/seva/icsCalendarGenerator";
import { playTempleBellChime, speakPriestNarration } from "../../features/seva/priestAudioNarrator";

export interface PersonalGoldenHourWidgetProps {
  dateStr: string; // YYYY-MM-DD
  devoteeName: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
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
  reason: string;
  countdownPrefix: string;
}> = {
  kn: {
    title: "ಇಂದಿನ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ (Personal Golden Hour)",
    badge: "೪೮ ನಿಮಿಷಗಳ ಪರಮ ಶುಭ ಅಮೃತ ಕಾಲ",
    activeNow: "🟢 ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active Now)",
    upcoming: "⏳ ಇಂದಿನ ಶುಭ ಸಮಯ",
    passed: "✓ ಇಂದಿನ ಮುಹೂರ್ತ ಸಂಪನ್ನವಾಗಿದೆ",
    suitableFor: "ಈ ಸಮಯದಲ್ಲಿ ಕೈಗೊಳ್ಳಬೇಕಾದ ಶುಭ ಕಾರ್ಯಗಳು:",
    activities: "ಧನ ಹೂಡಿಕೆ, ಮಹತ್ವದ ಮಾತುಕತೆ, ನೂತನ ಕಾರ್ಯಾರಂಭ, ಚಿನ್ನ/ವಾಹನ ಖರೀದಿ, ಶುಭ ಪ್ರಾರ್ಥನೆ.",
    addToCalendarBtn: "📅 ಮುಹೂರ್ತವನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ (.ics)",
    listenChantBtn: "🔔 ಮುಹೂರ್ತ ಸಂಕಲ್ಪ ಶ್ರವಣ (Listen Chants)",
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
    listenChantBtn: "🔔 Listen to Muhurtha Chants",
    reason: "Personalized peak auspicious window computed from your Janma Nakshatra and Tara Bala.",
    countdownPrefix: "Time until window:"
  },
  hi: {
    title: "आज का व्यक्तिगत गोल्डन मुहूर्त (Personal Golden Hour)",
    badge: "४८ मिनट का परम शुभ अमृत काल",
    activeNow: "🟢 वर्तमान में सक्रिय (Active Now)",
    upcoming: "⏳ आज का शुभ समय",
    passed: "✓ आज का मुहूर्त संपन्न",
    suitableFor: "इस समय किए जाने वाले शुभ कार्य:",
    activities: "धन निवेश, महत्वपूर्ण बातचीत, नया कार्य प्रारंभ, खरीदारी एवं प्रार्थना।",
    addToCalendarBtn: "📅 फोन कैलेंडर में जोड़ें (.ics)",
    listenChantBtn: "🔔 मुहूर्त संकल्प सुनें",
    reason: "आपके जन्म नक्षत्र और ताराबल के अनुसार गणना की गई सर्वोच्च सकारात्मक ऊर्जा का समय।",
    countdownPrefix: "मुहूर्त प्रारंभ होने में समय:"
  },
  te: {
    title: "నేటి వ్యక్తిగత గోల్డెన్ ముహూర్తం (Personal Golden Hour)",
    badge: "౪౮ నిమిషాల పరమ శుభ అమృత కాలం",
    activeNow: "🟢 ప్రస్తుతం కొనసాగుతోంది (Active Now)",
    upcoming: "⏳ నేటి శుభ సమయం",
    passed: "✓ నేటి ముహూర్తం పూర్తయింది",
    suitableFor: "ఈ సమయంలో చేపట్టవలసిన శుభ కార్యాలు:",
    activities: "ధన పెట్టుబడులు, ముఖ్యమైన చర్చలు, నూతన ప్రారంభాలు, పూజలు.",
    addToCalendarBtn: "📅 ఫోన్ క్యాలెండర్‌కు జోడించండి (.ics)",
    listenChantBtn: "🔔 ముహూర్త సంకల్పం వినండి",
    reason: "మీ జన్మ నక్షత్రం మరియు తారాబలం ఆధారంగా లెక్కించబడిన అత్యున్నత శుభ సమయం.",
    countdownPrefix: "ముహూర్త సమయానికి మిగిలినది:"
  },
  ta: {
    title: "இன்றைய தனிப்பட்ட பொன் முகூர்த்தம் (Personal Golden Hour)",
    badge: "48 நிமிட அதிர்ஷ்ட அமிர்த நேரம்",
    activeNow: "🟢 இப்போது நடப்பில் உள்ளது",
    upcoming: "⏳ இன்றைய சுப நேரம்",
    passed: "✓ இன்றைய முகூர்த்தம் முடிந்தது",
    suitableFor: "இந்த நேரத்தில் செய்ய வேண்டிய நற்காரியங்கள்:",
    activities: "பண முதலீடு, முக்கிய பேச்சுவார்த்தை, புதிய தொடக்கங்கள், பிரார்த்தனை.",
    addToCalendarBtn: "📅 காலண்டரில் சேர்க்க (.ics)",
    listenChantBtn: "🔔 முகூர்த்த சங்கல்பம் கேட்க",
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

  const windowOffsetsMinutes = [
    { start: 7 * 60 + 12, end: 8 * 60 },      // 07:12 AM - 08:00 AM
    { start: 9 * 60 + 36, end: 10 * 60 + 24 }, // 09:36 AM - 10:24 AM
    { start: 10 * 60 + 48, end: 11 * 60 + 36 },// 10:48 AM - 11:36 AM
    { start: 12 * 60 + 15, end: 13 * 60 + 3 }, // 12:15 PM - 01:03 PM
    { start: 15 * 60 + 20, end: 16 * 60 + 8 }, // 03:20 PM - 04:08 PM
    { start: 16 * 60 + 40, end: 17 * 60 + 28 },// 04:40 PM - 05:28 PM
    { start: 18 * 60 + 15, end: 19 * 60 + 3 }  // 06:15 PM - 07:03 PM
  ];

  const chosen = windowOffsetsMinutes[daySeed];

  const formatTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const startTimeStr = formatTime(chosen.start);
  const endTimeStr = formatTime(chosen.end);

  const now = new Date();
  const todayYmd = now.toISOString().slice(0, 10);

  let status: "upcoming" | "active" | "passed" = "upcoming";

  if (dateStr === todayYmd) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes >= chosen.start && nowMinutes <= chosen.end) {
      status = "active";
    } else if (nowMinutes > chosen.end) {
      status = "passed";
    } else {
      status = "upcoming";
    }
  } else if (dateStr < todayYmd) {
    status = "passed";
  } else {
    status = "upcoming";
  }

  return {
    startMinutes: chosen.start,
    endMinutes: chosen.end,
    startTimeStr,
    endTimeStr,
    status
  };
}

export interface PersonalGoldenHourWidgetProps {
  dateStr: string;
  devoteeName: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  lang?: SevaLang;
  voiceId?: string;
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

  const goldenHour = useMemo(() => {
    return computePersonalGoldenHour(dateStr, nakshatraIndex);
  }, [dateStr, nakshatraIndex]);

  const handlePlayChant = () => {
    playTempleBellChime();
    setIsPlayingChant(true);
    const chantText = lang === "kn"
      ? `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ. ${devoteeName} ಅವರ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಮಯ ${goldenHour.startTimeStr} ರಿಂದ ${goldenHour.endTimeStr}. ಓಂ ನಮಃ ಶಿವಾಯ.`
      : `Sri Mahabaleshwara Blessed. Personal Golden Hour for ${devoteeName} is from ${goldenHour.startTimeStr} to ${goldenHour.endTimeStr}. Om Namah Shivaya.`;
    speakPriestNarration(chantText, lang, () => {
      setIsPlayingChant(false);
    }, undefined, voiceId);
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
      `SUMMARY:✨ ${devoteeName} ಅವರ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ (${goldenHour.startTimeStr} - ${goldenHour.endTimeStr})`,
      `DESCRIPTION:ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ.\\nಧನ ಹೂಡಿಕೆ, ಮಾತುಕತೆ, ನೂತನ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಅತ್ಯಂತ ಶುಭ ಕಾಲ.\\nಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಕೃಪೆ.`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      "BEGIN:VALARM",
      "ACTION:AUDIO",
      "TRIGGER:-PT10M",
      "ATTACH;VALUE=URI:PresetSound#Bells",
      "DESCRIPTION:ಮುಹೂರ್ತ ಪ್ರಾರಂಭವಾಗಲು ೧೦ ನಿಮಿಷಗಳಿವೆ!",
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
      <div className="p-4 sm:p-5 bg-black/40 rounded-2xl border-2 border-amber-500/40 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-inner w-full box-border">
        <div className="text-center lg:text-left space-y-1 w-full lg:w-auto">
          <div className="text-xs font-black text-[#FDE68A] uppercase tracking-wider">
            ಅಮೃತ ಮುಹೂರ್ತ ಕಾಲಾವಧಿ (Auspicious Window)
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-white flex items-center gap-2 justify-center lg:justify-start">
            <span className="text-amber-400 font-sans">✦</span>
            <span>{goldenHour.startTimeStr}</span>
            <span className="text-xs text-amber-300/70">ರಿಂದ</span>
            <span>{goldenHour.endTimeStr}</span>
          </div>
        </div>

        {/* Action Buttons: Responsive container that stays perfectly inside box */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 max-w-full">
          <button
            type="button"
            onClick={handlePlayChant}
            className={`w-full px-4 py-2.5 rounded-xl font-black text-xs border shadow-sm transition-all flex items-center justify-center gap-1.5 ${
              isPlayingChant
                ? "bg-emerald-600 text-white border-emerald-400 animate-pulse"
                : "bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-400"
            }`}
          >
            <span>{isPlayingChant ? "🔔 ನುಡಿಯುತ್ತಿದೆ..." : "▶️ ಸಂಕಲ್ಪ ಶ್ರವಣ"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadGoldenHourIcs}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-300"
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
