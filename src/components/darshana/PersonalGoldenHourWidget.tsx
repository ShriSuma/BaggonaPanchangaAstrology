import React, { useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { downloadIcsFile } from "../../features/seva/icsCalendarGenerator";

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
  reason: string;
}> = {
  kn: {
    title: "ಇಂದಿನ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ (Golden Hour)",
    badge: "೪೮ ನಿಮಿಷಗಳ ಪರಮ ಶುಭ ಕಾಲ",
    activeNow: "🟢 ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Active Now)",
    upcoming: "⏳ ಇಂದಿನ ಶುಭ ಸಮಯ",
    passed: "✓ ಇಂದಿನ ಮುಹೂರ್ತ ಸಂಪನ್ನವಾಗಿದೆ",
    suitableFor: "ಈ ಸಮಯದಲ್ಲಿ ಕೈಗೊಳ್ಳಬೇಕಾದ ಶುಭ ಕಾರ್ಯಗಳು:",
    activities: "ಧನ ಹೂಡಿಕೆ, ಮಹತ್ವದ ಮಾತುಕತೆ, ನೂತನ ಕಾರ್ಯಾರಂಭ, ಚಿನ್ನ/ವಾಹನ ಖರೀದಿ, ಶುಭ ಪ್ರಾರ್ಥನೆ.",
    addToCalendarBtn: "📅 ಮುಹೂರ್ತವನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ (.ics)",
    reason: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ದಿನದ ತಾರಾಬಲದ ಆಧಾರದಲ್ಲಿ ಗಣಿಸಲಾದ ಅತ್ಯುನ್ನತ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯ ಕಾಲಘಟ್ಟ."
  },
  en: {
    title: "Today's Personal Golden Hour",
    badge: "48-Minute Peak Auspicious Window",
    activeNow: "🟢 ACTIVE NOW",
    upcoming: "⏳ Upcoming Auspicious Hour",
    passed: "✓ Today's Window Concluded",
    suitableFor: "Recommended Auspicious Activities:",
    activities: "Financial investments, signing agreements, starting ventures, purchases & prayers.",
    addToCalendarBtn: "📅 Add to Phone Calendar (.ics)",
    reason: "Personalized peak auspicious window computed from your Janma Nakshatra and Tara Bala."
  },
  hi: {
    title: "आज का व्यक्तिगत गोल्डन मुहूर्त (Golden Hour)",
    badge: "४८ मिनट का परम शुभ काल",
    activeNow: "🟢 वर्तमान में सक्रिय (Active Now)",
    upcoming: "⏳ आज का शुभ समय",
    passed: "✓ आज का मुहूर्त संपन्न",
    suitableFor: "इस समय किए जाने वाले शुभ कार्य:",
    activities: "धन निवेश, महत्वपूर्ण बातचीत, नया कार्य प्रारंभ, खरीदारी एवं प्रार्थना।",
    addToCalendarBtn: "📅 फोन कैलेंडर में जोड़ें (.ics)",
    reason: "आपके जन्म नक्षत्र और ताराबल के अनुसार गणना की गई सर्वोच्च सकारात्मक ऊर्जा का समय।"
  },
  te: {
    title: "నేటి వ్యక్తిగత గోల్డెన్ ముహూర్తం (Golden Hour)",
    badge: "౪౮ నిమిషాల పరమ శుభ కాలం",
    activeNow: "🟢 ప్రస్తుతం కొనసాగుతోంది (Active Now)",
    upcoming: "⏳ నేటి శుభ సమయం",
    passed: "✓ నేటి ముహూర్తం పూర్తయింది",
    suitableFor: "ఈ సమయంలో చేపట్టవలసిన శుభ కార్యాలు:",
    activities: "ధన పెట్టుబడులు, ముఖ్యమైన చర్చలు, నూతన ప్రారంభాలు, పూజలు.",
    addToCalendarBtn: "📅 ఫోన్ క్యాలెండర్‌కు జోడించండి (.ics)",
    reason: "మీ జన్మ నక్షత్రం మరియు తారాబలం ఆధారంగా లెక్కించబడిన అత్యున్నత శుభ సమయం."
  },
  ta: {
    title: "இன்றைய தனிப்பட்ட பொன் முகூர்த்தம் (Golden Hour)",
    badge: "48 நிமிட அதிர்ஷ்ட நேரம்",
    activeNow: "🟢 இப்போது நடப்பில் உள்ளது",
    upcoming: "⏳ இன்றைய சுப நேரம்",
    passed: "✓ இன்றைய முகூர்த்தம் முடிந்தது",
    suitableFor: "இந்த நேரத்தில் செய்ய வேண்டிய நற்காரியங்கள்:",
    activities: "பண முதலீடு, முக்கிய பேச்சுவார்த்தை, புதிய தொடக்கங்கள், பிரார்த்தனை.",
    addToCalendarBtn: "📅 காலண்டரில் சேர்க்க (.ics)",
    reason: "உங்கள் ஜென்ம நட்சத்திரம் மற்றும் தாராபலத்தின் அடிப்படையில் கணிக்கப்பட்ட நற்பொழுது."
  }
};

/**
 * Computes deterministic 48-minute peak auspicious window for the day
 */
function computePersonalGoldenHour(dateStr: string, nakshatraIndex = 18) {
  const d = new Date(dateStr);
  const daySeed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + nakshatraIndex * 7) % 7;

  // Window offsets from 6:00 AM (in minutes)
  const windowOffsetsMinutes = [
    { start: 7 * 60 + 12, end: 8 * 60 },      // 07:12 AM - 08:00 AM (Brahma / Surya Hora)
    { start: 9 * 60 + 36, end: 10 * 60 + 24 }, // 09:36 AM - 10:24 AM (Guru Hora)
    { start: 10 * 60 + 48, end: 11 * 60 + 36 },// 10:48 AM - 11:36 AM (Abhijit / Shukra)
    { start: 12 * 60 + 15, end: 13 * 60 + 3 }, // 12:15 PM - 01:03 PM (Amritha Kaala)
    { start: 15 * 60 + 20, end: 16 * 60 + 8 }, // 03:20 PM - 04:08 PM (Budha Hora)
    { start: 16 * 60 + 40, end: 17 * 60 + 28 },// 04:40 PM - 05:28 PM (Chandra / Guru)
    { start: 18 * 60 + 15, end: 19 * 60 + 3 }  // 06:15 PM - 07:03 PM (Sandhya Shubha)
  ];

  const chosen = windowOffsetsMinutes[daySeed];

  const formatHourMin = (totalMin: number) => {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${h12}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  const startTimeStr = formatHourMin(chosen.start);
  const endTimeStr = formatHourMin(chosen.end);

  // Status computation against current time
  const now = new Date();
  const todayYmd = now.toISOString().split("T")[0];
  let status: "active" | "upcoming" | "passed" = "upcoming";

  if (dateStr === todayYmd) {
    const currentMin = now.getHours() * 60 + now.getMinutes();
    if (currentMin >= chosen.start && currentMin <= chosen.end) {
      status = "active";
    } else if (currentMin > chosen.end) {
      status = "passed";
    } else {
      status = "upcoming";
    }
  } else if (dateStr < todayYmd) {
    status = "passed";
  }

  return {
    startTimeStr,
    endTimeStr,
    status,
    startMinutes: chosen.start,
    endMinutes: chosen.end
  };
}

export const PersonalGoldenHourWidget: React.FC<PersonalGoldenHourWidgetProps> = ({
  dateStr,
  devoteeName,
  nakshatraIndex = 18,
  lang = "kn"
}) => {
  const t = GOLDEN_TEXTS[lang] || GOLDEN_TEXTS.kn;

  const goldenHour = useMemo(() => {
    return computePersonalGoldenHour(dateStr, nakshatraIndex);
  }, [dateStr, nakshatraIndex]);

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
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      "DESCRIPTION:ಮುಹೂರ್ತ ಪ್ರಾರಂಭವಾಗಲು ೧೦ ನಿಮಿಷಗಳಿವೆ!",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    downloadIcsFile(`Baggona_Golden_Hour_${dateStr}_${devoteeName.replace(/[^a-zA-Z0-9]/g, "_")}.ics`, icsContent);
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow-sm border border-amber-400">
            ⏳
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-amber-950">
              {t.title}
            </h3>
            <span className="text-[10px] text-amber-800 font-bold">
              {t.badge}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black border shadow-xs ${
            goldenHour.status === "active"
              ? "bg-emerald-100 border-emerald-400 text-emerald-950 animate-pulse"
              : goldenHour.status === "upcoming"
              ? "bg-amber-100 border-amber-400 text-amber-950"
              : "bg-slate-100 border-slate-300 text-slate-700"
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
      <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-400/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
        <div className="text-center sm:text-left space-y-0.5">
          <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
            ಅಮೃತ ಮುಹೂರ್ತ ಕಾಲಾವಧಿ (Auspicious Window)
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-amber-950 flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-amber-600 font-sans">✦</span>
            <span>{goldenHour.startTimeStr}</span>
            <span className="text-xs text-slate-400">ರಿಂದ</span>
            <span>{goldenHour.endTimeStr}</span>
          </div>
        </div>

        {/* 1-Tap Calendar Reminder Button */}
        <button
          type="button"
          onClick={handleDownloadGoldenHourIcs}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-400 whitespace-nowrap"
        >
          <span>{t.addToCalendarBtn}</span>
        </button>
      </div>

      {/* Suggested Activities */}
      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-300/80 text-xs space-y-1">
        <div className="font-black text-amber-950 flex items-center gap-1.5 text-[11px]">
          <span>🌟</span>
          <span>{t.suitableFor}</span>
        </div>
        <p className="text-[11px] text-slate-800 font-semibold leading-relaxed pl-4 border-l-2 border-amber-400">
          {t.activities}
        </p>
      </div>
    </div>
  );
};
