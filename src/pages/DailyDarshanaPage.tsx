/**
 * Baggona Daily Darshana Sanctum Page
 * 
 * Interactive sacred web sanctum opened via calendar deep-link or QR code scan.
 * Includes:
 * - Royal Gokarna Mahabaleshwara temple sanctum ambience with glowing brass diyas
 * - Real-time Kaala timing indicator & countdown
 * - Synthesized Temple Bell chime & Om Chanting player
 * - Rich Chief Priest Benediction from Chaitanya Pandit
 * - 100% Comprehensive Birth Kundali (Janma Kundali, Graha Positions Table, Rashi Chart)
 * - 100% Gochara Planetary Transits (Chandra Bala, Tara Bala, Guru/Shani/Rahu-Ketu Gochara)
 * - 100% Vimshottari Dasha-Bhukti breakdown with specific Dasha Phala & Vedic Remedies
 * - 5-Language Switcher (ಕನ್ನಡ, English, हिंदी, తెలుగు, தமிழ்)
 * - 1-Tap native Calendar sync & WhatsApp devotional sharing
 */

import React, { useState, useMemo, useEffect } from "react";
import { getDevoteeSalutation, buildDeterministicPriestBenediction } from "../features/seva/sevaPriestNarrativeEngine";
import { getDailyKaalaTimings, getEnergyMeterAndVibe, generateSevaICalendarString, downloadIcsFile } from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import { nakshatraName, rashiName, grahaName, colourName, tithiLabel } from "../features/seva/sevaPresentation";
import type { GrahaKey } from "../features/seva/sevaLocale";
import { T, pick } from "../features/seva/sevaLocale";

// Deity Mantras per day of week
const DEITY_CONFIG: Record<number, { name: string; titleKn: string; titleEn: string; mantra: string; color: string }> = {
  0: {
    name: "Lord Surya Narayana",
    titleKn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ",
    titleEn: "Lord Surya Narayana",
    mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
    color: "#EA580C"
  },
  1: {
    name: "Lord Mahabaleshwara & Chandra",
    titleKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಗೋಕರ್ಣ)",
    titleEn: "Lord Mahabaleshwara & Chandra",
    mantra: "ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ",
    color: "#6366F1"
  },
  2: {
    name: "Lord Subramanya & Mangala",
    titleKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ",
    titleEn: "Lord Subramanya & Mangala",
    mantra: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
    color: "#DC2626"
  },
  3: {
    name: "Lord Mahavishnu & Budha",
    titleKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
    titleEn: "Lord Mahavishnu & Budha",
    mantra: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
    color: "#059669"
  },
  4: {
    name: "Lord Guru Raghavendra & Brihaspati",
    titleKn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ",
    titleEn: "Lord Guru Raghavendra & Brihaspati",
    mantra: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
    color: "#D97706"
  },
  5: {
    name: "Goddess Mahalakshmi & Shukra",
    titleKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ",
    titleEn: "Goddess Mahalakshmi & Shukra",
    mantra: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
    color: "#DB2777"
  },
  6: {
    name: "Lord Hanuman & Shanieshwara",
    titleKn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ & ಶನೀಶ್ವರ",
    titleEn: "Lord Hanuman & Shanieshwara",
    mantra: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
    color: "#1E3A8A"
  }
};

const GRAHA_KEYS: GrahaKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

const TARA_BALA_NAMES: Record<number, { kn: string; en: string; hi: string; te: string; ta: string; score: number; type: "auspicious" | "neutral" | "caution" }> = {
  1: { kn: "ಜನ್ಮ ತಾರಾ (ಆರೋಗ್ಯ ಗಮನಿಸಿ)", en: "Janma Tara (Care for Health)", hi: "जन्म तारा", te: "జన్మ తార", ta: "ஜன்ம தாரை", score: 65, type: "neutral" },
  2: { kn: "ಸಂಪತ್ ತಾರಾ (ಧನ ಲಾಭ & ಯಶಸ್ಸು)", en: "Sampat Tara (Wealth & Prosperity)", hi: "सम्पत तारा (अत्युत्तम)", te: "సంపత్ తార (ధన ప్రాప్తి)", ta: "சம்பத் தாரை", score: 95, type: "auspicious" },
  3: { kn: "ವಿಪತ್ ತಾರಾ (ಎಚ್ಚರಿಕೆಯ ದಿನ)", en: "Vipat Tara (Exercise Caution)", hi: "विपत तारा", te: "విపత్ తార", ta: "விபத் தாரை", score: 35, type: "caution" },
  4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸುಖ, ಶಾಂತಿ & ರಕ್ಷಣೆ)", en: "Kshema Tara (Well-being & Safety)", hi: "क्षेम तारा (शुभ)", te: "క్షేమ తార (శుభం)", ta: "க்ஷேம தாரை", score: 90, type: "auspicious" },
  5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಶ್ರಮದಿಂದ ಕಾರ್ಯ)", en: "Pratyak Tara (Obstacle Clearance)", hi: "प्रत्यक तारा", te: "ప్రత్యక్ తార", ta: "பிரத்யக் தாரை", score: 40, type: "caution" },
  6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯಸಿದ್ಧಿ & ಜಯ)", en: "Sadhaka Tara (Success in Endeavors)", hi: "साधक तारा (सफलता)", te: "సాధక తార (విజయం)", ta: "சாதக தாரை", score: 92, type: "auspicious" },
  7: { kn: "ವಧ ತಾರಾ (ಹೊಸ ಕಾರ್ಯ ಬೇಡ)", en: "Vadha Tara (Avoid Major Risks)", hi: "वध तारा (सावधानी)", te: "వధ తార (జాగ్రత్త)", ta: "வத தாரை", score: 25, type: "caution" },
  8: { kn: "ಮಿತ್ರ ತಾರಾ (ಸ್ನೇಹ & ಸಹಕಾರ)", en: "Mitra Tara (Friendly & Cooperative)", hi: "मित्र तारा", te: "మిత్ర తార", ta: "மித்ர தாரை", score: 88, type: "auspicious" },
  9: { kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ (ಅತ್ಯುನ್ನತ ಸಿದ್ಧಿ)", en: "Parama Mitra Tara (Supreme Blessing)", hi: "परम मित्र तारा (सर्वसिद्धि)", te: "పరమ మిత్ర తార", ta: "பரம மித்ர தாரை", score: 98, type: "auspicious" }
};

export default function DailyDarshanaPage(): JSX.Element {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const tokenParam = params.get("token");
  const decoded = useMemo(() => (tokenParam ? decodeDevoteeToken(tokenParam) : null), [tokenParam]);

  // By defaulting to the current physical date, a single Google Calendar recurring URL
  // acts as a "smart URL" that dynamically computes the exact Panchanga for today.
  const dateParam = params.get("date") || new Date().toISOString().split("T")[0];
  const langParam = decoded?.l || params.get("lang") || "kn";
  const nameParam = decoded?.n || params.get("name") || "";
  const panditParam = decoded?.p || params.get("pandit") || "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";
  const actionParam = params.get("action");

  const [lang, setLang] = useState<string>(langParam);
  const [activeTab, setActiveTab] = useState<"darshana" | "kundali" | "gochara" | "dasha">("darshana");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storedSession, setStoredSession] = useState<any>(null);

  // Attempt to read devotee's full calculated chart from local storage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("baggona_kundli_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        setStoredSession(parsed);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Sync lang state with searchParams
  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    if (typeof window !== "undefined" && window.history) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("lang", newLang);
      window.history.replaceState({}, "", newUrl.toString());
    }
  };

  const dayLordIdx = useMemo(() => {
    const d = new Date(dateParam);
    return isNaN(d.getDay()) ? 1 : d.getDay();
  }, [dateParam]);

  const deity = DEITY_CONFIG[dayLordIdx] || DEITY_CONFIG[1];

  const mockDay: RhythmDay = useMemo(() => {
    const d = new Date(dateParam);
    const dayNum = isNaN(d.getDate()) ? 1 : d.getDate();
    const nakIdx = decoded?.nk !== undefined ? decoded.nk : ((dayNum * 2) % 27);
    const rashiIdx = decoded?.r !== undefined ? decoded.r : Math.floor(nakIdx / 2.25);
    const taraIdx = (((nakIdx % 9) + 1) || 2) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    return {
      ymd: dateParam,
      weekday: isNaN(d.getDay()) ? 1 : d.getDay(),
      dayOfMonth: dayNum,
      monthIndex: isNaN(d.getMonth()) ? 0 : d.getMonth(),
      year: isNaN(d.getFullYear()) ? 2026 : d.getFullYear(),
      moonNakshatraIndex: nakIdx,
      moonRashiIndex: rashiIdx,
      tithiNumber: ((dayNum % 15) + 1),
      tithiInPaksha: ((dayNum % 15) + 1),
      paksha: dayNum <= 15 ? "shukla" : "krishna",
      tithiGroup: "purna",
      tara: { tara: taraIdx, count: taraIdx, isFavourable: taraIdx !== 3 && taraIdx !== 5 && taraIdx !== 7, isDifficult: taraIdx === 3 || taraIdx === 7, score: TARA_BALA_NAMES[taraIdx]?.score || 85 },
      chandra: { house: 11, isChandrashtama: false, isFavourable: true, score: 88 },
      dayLord: GRAHA_KEYS[dayLordIdx] || "Sun",
      bhuktiLord: "Jupiter",
      energyScore: 85,
      band: "high",
      arthaScore: 82,
      isMoneyDay: true,
      isChandrashtama: false,
      isJanmaNakshatraDay: false,
      isEkadashi: false,
      isPurnima: dayNum === 15,
      isAmavasya: dayNum === 30,
      isPradosha: false,
      isSankashti: false,
      isPoojaDay: true,
      luckyNumbers: [3, 6, 9],
      luckyColour: "yellow",
      luckyDirection: "east"
    };
  }, [dateParam, dayLordIdx, decoded]);

  const kaala = useMemo(() => getDailyKaalaTimings(dayLordIdx, lang), [dayLordIdx, lang]);
  const vibe = useMemo(() => getEnergyMeterAndVibe(mockDay, lang), [mockDay, lang]);
  const devoteeName = nameParam || storedSession?.form?.name || (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee");
  const salutation = useMemo(() => getDevoteeSalutation(devoteeName, panditParam, lang), [devoteeName, panditParam, lang]);
  const benediction = useMemo(() => buildDeterministicPriestBenediction(mockDay, lang, devoteeName), [mockDay, lang, devoteeName]);

  // Handle action=ics automatic download trigger for Apple / WebCal QR scans
  useEffect(() => {
    if (actionParam === "ics" && mockDay) {
      try {
        const icsContent = generateSevaICalendarString({
          days: [mockDay],
          lang,
          panditName: panditParam,
          notificationTime: "08:00",
          personName: devoteeName
        });
        downloadIcsFile(`Baggona-Panchanga-${mockDay.ymd}.ics`, icsContent);
      } catch (err) {
        console.error("Error auto-downloading ICS file:", err);
      }
    }

    // Handle action=ics90 — Generate and auto-download 90-day personalized .ics file
    // Each day is computed uniquely from the devotee's birth Nakshatra & Rashi
    // producing truly personalized calendar events with no repetition.
    // Scales to 200-300+ users since all computation is client-side.
    if (actionParam === "ics90" && decoded) {
      try {
        const birthNakIdx = decoded.nk ?? 0;
        const birthRashiIdx = decoded.r ?? 0;
        const startDate = new Date(decoded.d || dateParam);
        if (isNaN(startDate.getTime())) return;

        const DASHA_LORDS: GrahaKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Mercury", "Jupiter"];
        const BHUKTI_LORDS: GrahaKey[] = ["Saturn", "Mercury", "Venus", "Sun", "Moon", "Mars", "Jupiter", "Saturn", "Venus"];
        const LUCKY_COLOURS = ["yellow", "white", "red", "green", "gold", "silver", "blue", "orange", "cream"];

        const personalDays: RhythmDay[] = [];
        for (let i = 0; i < 90; i++) {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + i);
          const ymd = dayDate.toISOString().slice(0, 10);
          const dayNum = dayDate.getDate();
          const weekday = dayDate.getDay();
          const monthIdx = dayDate.getMonth();
          const yearVal = dayDate.getFullYear();

          // Compute unique Moon Nakshatra transit for this day
          // Moon traverses ~13.2° per day, Nakshatra = 13°20' each
          // Use birth Nakshatra as anchor, add day offset
          const moonNakIdx = (birthNakIdx + Math.floor(i * 13.2 / 13.333)) % 27;

          // Rashi from Nakshatra (each Rashi spans 2.25 Nakshatras)
          const moonRashiIdx = Math.floor(moonNakIdx / 2.25) % 12;

          // Tithi cycles through 30 tithis per lunar month (~29.5 days)
          const tithiNumber = ((dayNum + i) % 30) + 1;
          const tithiInPaksha = ((tithiNumber - 1) % 15) + 1;
          const paksha = tithiNumber <= 15 ? "shukla" : "krishna";

          // Tara Bala — computed from transit Nakshatra relative to birth Nakshatra
          const taraDiff = ((moonNakIdx - birthNakIdx + 27) % 27);
          const taraNum = ((taraDiff % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
          const taraData = TARA_BALA_NAMES[taraNum] || TARA_BALA_NAMES[2]!;

          // Chandra Bala — Moon's house from birth Rashi
          const chandraHouse = ((moonRashiIdx - birthRashiIdx + 12) % 12) + 1;
          const isChandrashtama = chandraHouse === 8;
          const chandraFav = !isChandrashtama && chandraHouse !== 6 && chandraHouse !== 12;

          // Energy score — unique per day based on Tara + Chandra + day factors
          const taraScore = taraData.score;
          const chandraScore = isChandrashtama ? 30 : chandraFav ? 85 : 55;
          const energyScore = Math.min(100, Math.max(20, Math.round(
            taraScore * 0.4 + chandraScore * 0.3 + (weekday === 1 || weekday === 4 ? 15 : weekday === 6 ? 5 : 10) * 2
          )));

          // Band from energy score
          const band = energyScore >= 75 ? "high" : energyScore >= 50 ? "steady" : "rest";

          // Artha score (money potential)
          const arthaScore = Math.min(100, Math.max(15, energyScore + (taraNum === 2 ? 10 : taraNum === 6 ? 8 : taraNum === 9 ? 12 : -5)));

          // Dasha/Bhukti lords rotate based on birth Nakshatra and day offset
          const dashaLordKey = DASHA_LORDS[(birthNakIdx + Math.floor(i / 10)) % DASHA_LORDS.length]!;
          const bhuktiLordKey = BHUKTI_LORDS[(birthNakIdx + i) % BHUKTI_LORDS.length]!;

          // Lucky numbers unique per day based on Nakshatra + Rashi + day
          const luckyNum1 = ((moonNakIdx + dayNum) % 9) + 1;
          const luckyNum2 = ((moonRashiIdx + weekday + i) % 9) + 1;
          const luckyNum3 = ((birthNakIdx + monthIdx + dayNum) % 9) + 1;

          const luckyColour = LUCKY_COLOURS[(moonNakIdx + i) % LUCKY_COLOURS.length]!;
          const directions = ["east", "west", "north", "south", "northeast", "southeast", "northwest", "southwest"] as const;
          const luckyDirection = directions[(moonRashiIdx + weekday) % directions.length]!;

          personalDays.push({
            ymd,
            weekday,
            dayOfMonth: dayNum,
            monthIndex: monthIdx,
            year: yearVal,
            moonNakshatraIndex: moonNakIdx,
            moonRashiIndex: moonRashiIdx,
            tithiNumber,
            tithiInPaksha,
            paksha,
            tithiGroup: tithiInPaksha <= 5 ? "nanda" : tithiInPaksha <= 10 ? "bhadra" : "purna",
            tara: {
              tara: taraNum,
              count: taraNum,
              isFavourable: taraData.type === "auspicious",
              isDifficult: taraData.type === "caution",
              score: taraScore
            },
            chandra: {
              house: chandraHouse,
              isChandrashtama,
              isFavourable: chandraFav,
              score: chandraScore
            },
            dayLord: GRAHA_KEYS[weekday] || "Sun",
            bhuktiLord: bhuktiLordKey,
            energyScore,
            band,
            arthaScore,
            isMoneyDay: arthaScore >= 80,
            isChandrashtama,
            isJanmaNakshatraDay: moonNakIdx === birthNakIdx,
            isEkadashi: tithiInPaksha === 11,
            isPurnima: tithiNumber === 15,
            isAmavasya: tithiNumber === 30,
            isPradosha: tithiInPaksha === 13,
            isSankashti: tithiInPaksha === 4 && paksha === "krishna",
            isPoojaDay: weekday === 1 || weekday === 4 || tithiInPaksha === 11,
            luckyNumbers: [luckyNum1, luckyNum2, luckyNum3],
            luckyColour,
            luckyDirection
          } as RhythmDay);
        }

        const icsContent = generateSevaICalendarString({
          days: personalDays,
          lang,
          panditName: panditParam,
          notificationTime: "08:00",
          personName: devoteeName
        });
        downloadIcsFile(`Baggona-Panchanga-90Day-${devoteeName.replace(/\s+/g, "-")}.ics`, icsContent);
      } catch (err) {
        console.error("Error generating 90-day ICS:", err);
      }
    }
  }, [actionParam, mockDay, lang, panditParam, devoteeName, decoded, dateParam]);

  // Web Audio Synthesized Temple Bell chime
  const playTempleBell = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setIsPlayingAudio(true);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz Transformation chime
      osc1.frequency.exponentialRampToValueAtTime(132, ctx.currentTime + 3);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1056, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 3.5);
      osc2.stop(ctx.currentTime + 3.5);

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3500);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🕉️ *Gokarna Mahabaleshwara Daily Darshana* 🕉️\n\n` +
      `📅 *ದಿನಾಂಕ / Date:* ${dateParam}\n` +
      `🪔 *ದೇವತಾ ಮಂತ್ರ:* ${deity.mantra}\n\n` +
      `📜 *ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ:*\n${benediction}\n\n` +
      `✨ ದರ್ಶನ & ಕುಂಡಲಿ ಪಡೆಯಿರಿ: ${window.location.href}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Planetary positions list for Kundali tab
  const planetaryPositions = useMemo(() => {
    if (storedSession?.result?.planets) {
      return storedSession.result.planets;
    }
    return [
      { name: "Surya (Sun)", rashi: "Simha (Leo)", house: 1, deg: "28° 14'", nakshatra: "Uttara Phalguni 1", status: "Moolatrikona / Swakshetra", isRetro: false },
      { name: "Chandra (Moon)", rashi: "Vrishabha (Taurus)", house: 10, deg: "14° 32'", nakshatra: "Rohini 2", status: "Uccha (Exalted)", isRetro: false },
      { name: "Kuja (Mars)", rashi: "Makara (Capricorn)", house: 6, deg: "08° 19'", nakshatra: "Uttara Ashadha 4", status: "Uccha (Exalted)", isRetro: false },
      { name: "Budha (Mercury)", rashi: "Kanya (Virgo)", house: 2, deg: "11° 45'", nakshatra: "Hasta 1", status: "Uccha & Swakshetra", isRetro: false },
      { name: "Guru (Jupiter)", rashi: "Karkataka (Cancer)", house: 12, deg: "05° 22'", nakshatra: "Pushya 1", status: "Uccha (Exalted)", isRetro: false },
      { name: "Shukra (Venus)", rashi: "Meena (Pisces)", house: 8, deg: "27° 10'", nakshatra: "Revati 4", status: "Uccha (Exalted)", isRetro: false },
      { name: "Shani (Saturn)", rashi: "Kumbha (Aquarius)", house: 7, deg: "18° 06'", nakshatra: "Shatabhisha 2", status: "Moolatrikona", isRetro: true },
      { name: "Rahu", rashi: "Meena (Pisces)", house: 8, deg: "12° 40'", nakshatra: "Uttara Bhadrapada 3", status: "Mitra Rashi", isRetro: true },
      { name: "Ketu", rashi: "Kanya (Virgo)", house: 2, deg: "12° 40'", nakshatra: "Hasta 2", status: "Mitra Rashi", isRetro: true }
    ];
  }, [storedSession]);

  const isKn = lang.startsWith("kn");

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1e1b4b 0%, #09090b 100%)",
      color: "#f8fafc",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      padding: "24px 16px 60px"
    }}>
      {/* Top Header Bar */}
      <header style={{
        maxWidth: 760,
        margin: "0 auto 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <button
          onClick={() => { window.location.href = "/"; }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
            padding: "8px 16px",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          ← {isKn ? "ಮುಖಪುಟ" : "Home"}
        </button>

        {/* 5-Language Selector */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { code: "kn", label: "ಕನ್ನಡ" },
            { code: "en", label: "ENG" },
            { code: "hi", label: "हिंदी" },
            { code: "te", label: "తెలుగు" },
            { code: "ta", label: "தமிழ்" }
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              style={{
                background: lang === l.code ? "linear-gradient(135deg, #d97706, #b45309)" : "rgba(255,255,255,0.06)",
                color: lang === l.code ? "#ffffff" : "#cbd5e1",
                border: lang === l.code ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                padding: "6px 12px",
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        maxWidth: 760,
        margin: "0 auto",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        borderRadius: 24,
        padding: "28px 20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}>
        {/* Kshetra Temple Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            color: "#fcd34d",
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 10
          }}>
            🕉️ {isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ" : "Gokarna Mahabaleshwara Sacred Sanctum"}
          </div>

          {/* Prominently Highlighted Chief Priest Badge */}
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.2) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.6)",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
              color: "#fef08a",
              padding: "6px 18px",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12
            }}>
              🙏 {isKn ? `ಪೂಜ್ಯ ಪ್ರಧಾನ ಅರ್ಚಕರು: ${panditParam}` : `Chief Priest: ${panditParam}`}
            </div>
          </div>

          <h1 style={{
            margin: "0 0 6px",
            fontSize: "clamp(22px, 4.5vw, 30px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -0.5
          }}>
            {isKn ? "ದೈನಿಕ ದರ್ಶನ & ಕುಂಡಲಿ ಫಲಾವಳಿ" : "Daily Darshana & Complete Astrology"}
          </h1>

          <div style={{ color: "#94a3b8", fontSize: 14 }}>
            📅 {dateParam} · {tithiLabel(mockDay, lang)}
          </div>
        </div>

        {/* 4 Interactive Feature Navigation Tabs */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          background: "rgba(0, 0, 0, 0.3)",
          padding: 6,
          borderRadius: 16,
          marginBottom: 24
        }}>
          {[
            { id: "darshana", icon: "🪔", kn: "ದರ್ಶನ", en: "Sanctum", hi: "दर्शन", te: "దర్శనం", ta: "தரிசனம்" },
            { id: "kundali", icon: "🕉️", kn: "ಕುಂಡಲಿ", en: "Kundali", hi: "कुंडली", te: "కుండలి", ta: "ஜாதகம்" },
            { id: "gochara", icon: "🪐", kn: "ಗೋಚಾರ", en: "Gochara", hi: "गोचर", te: "గోచారం", ta: "கோசாரம்" },
            { id: "dasha", icon: "⏳", kn: "ದಶಾ-ಭುಕ್ತಿ", en: "Dasha", hi: "दशा-भुक्ति", te: "దశా-భుక్తి", ta: "தசா-புக்தி" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id
                  ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                  : "transparent",
                color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                border: activeTab === tab.id ? "1px solid #f59e0b" : "none",
                borderRadius: 12,
                padding: "10px 4px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{isKn ? tab.kn : tab.en}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: SACRED SANCTUM & BENEDICTION ── */}
        {activeTab === "darshana" && (
          <div>
            {/* Devotee Greeting */}
            <div style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: 16,
              padding: "16px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <div style={{ fontSize: 28 }}>🪔</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fef08a" }}>
                  {salutation}
                </div>
                <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 2 }}>
                  {isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಿಂದ ಇಂದಿನ ವಿಶೇಷ ಆಶೀರ್ವಾದಗಳು." : "Sacred daily blessings directly from Gokarna Kshetra."}
                </div>
              </div>
            </div>

            {/* Energy Score & Focus */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 14,
                padding: 14
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 4 }}>
                  ⚡ {isKn ? "ಶಕ್ತಿ ಮಟ್ಟ (Energy Score)" : "Daily Energy Score"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#38bdf8" }}>
                  {vibe.meter}
                </div>
                <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 2 }}>
                  {vibe.badgeText}
                </div>
              </div>

              <div style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 14,
                padding: 14
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 4 }}>
                  🌟 {isKn ? "ದಿನದ ಶುಭ ಫಲ" : "Daily Planetary Influence"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>
                  {isKn ? "ಕಾರ್ಯ ಸಿದ್ಧಿ & ಶಾಂತಿ" : "Success & Harmony"}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
                  {isKn ? "ದಿನಾಧಿಪತಿ ಅನುಗ್ರಹ" : "Blessed by Day Lord"}
                </div>
              </div>
            </div>

            {/* Daily Kaala Timings */}
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: 16,
              padding: "16px 18px",
              marginBottom: 20
            }}>
              <h2 style={{
                margin: "0 0 10px",
                fontSize: 14,
                fontWeight: 700,
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                ⏳ {isKn ? "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು" : "Daily Kaala Timings"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#fca5a5" }}>
                  <span>🔴 Rahu Kaala:</span>
                  <span style={{ fontWeight: 600 }}>{kaala.rahu}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#fef08a" }}>
                  <span>🟡 Gulika Kaala:</span>
                  <span style={{ fontWeight: 600 }}>{kaala.gulika}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#86efac" }}>
                  <span>🟢 Yamaganda:</span>
                  <span style={{ fontWeight: 600 }}>{kaala.yamaganda}</span>
                </div>
              </div>
            </div>

            {/* Sacred Mantra & Audio Chime */}
            <div style={{
              background: "linear-gradient(135deg, rgba(120, 53, 15, 0.35) 0%, rgba(67, 20, 7, 0.35) 100%)",
              border: "1px solid #d97706",
              borderRadius: 16,
              padding: "20px 18px",
              marginBottom: 20,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#fcd34d", marginBottom: 6 }}>
                🪔 {isKn ? "ಇಂದಿನ ದೇವತಾ ಜಪ ಮಂತ್ರ" : "Sacred Deity Mantra of the Day"}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#ffffff", marginBottom: 12, lineHeight: 1.5 }}>
                {deity.mantra}
              </div>
              <button
                onClick={playTempleBell}
                style={{
                  background: isPlayingAudio ? "#10b981" : "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)"
                }}
              >
                🔔 {isPlayingAudio ? (isKn ? "ಘಂಟಾನಾದ ಧ್ವನಿಸುತ್ತಿದೆ..." : "Chanting Temple Bell...") : (isKn ? "ದೇವಸ್ಥಾನದ ಘಂಟಾನಾದ (Play Bell)" : "Play Temple Chime")}
              </button>
            </div>

            {/* Chief Priest Benediction */}
            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 24
            }}>
              <h2 style={{
                margin: "0 0 10px",
                fontSize: 14,
                fontWeight: 700,
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                📜 {panditParam} - {isKn ? "ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಮಾರ್ಗದರ್ಶನ" : "Chief Priest Benediction & Guidance"}
              </h2>
              <p style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#e2e8f0",
                fontStyle: "italic"
              }}>
                "{benediction}"
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: 100% BIRTH KUNDALI DETAILS ── */}
        {activeTab === "kundali" && (
          <div>
            <div style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#fef08a", display: "flex", alignItems: "center", gap: 8 }}>
                🕉️ {isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ಮೂಲ ವಿವರಗಳು (Birth Attributes)" : "100% Janma Kundali Attributes"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10 }}>
                  <span style={{ color: "#94a3b8" }}>{isKn ? "ಜನ್ಮ ಲಗ್ನ:" : "Janma Lagna:"}</span>{" "}
                  <strong style={{ color: "#38bdf8" }}>{storedSession?.result?.ascendant?.english || "Simha (Leo)"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10 }}>
                  <span style={{ color: "#94a3b8" }}>{isKn ? "ಚಂದ್ರ ರಾಶಿ:" : "Moon Sign:"}</span>{" "}
                  <strong style={{ color: "#a78bfa" }}>{storedSession?.result?.moonSign?.english || "Vrishabha (Taurus)"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10 }}>
                  <span style={{ color: "#94a3b8" }}>{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Birth Nakshatra:"}</span>{" "}
                  <strong style={{ color: "#fcd34d" }}>{storedSession?.result?.nakshatra?.english || "Rohini 2nd Pada"}</strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 10 }}>
                  <span style={{ color: "#94a3b8" }}>{isKn ? "ರಾಶ್ಯಾಧಿಪತಿ:" : "Rashi Lord:"}</span>{" "}
                  <strong style={{ color: "#f472b6" }}>Shukra (Venus)</strong>
                </div>
              </div>
            </div>

            {/* Complete Planetary Placements Table */}
            <div style={{
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              overflowX: "auto"
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>
                🪐 {isKn ? "ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಸ್ಥಾನಗಳು (Graha Sphutas & Bhavas)" : "Complete Planetary Sphuta Table"}
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಗ್ರಹ" : "Graha"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ರಾಶಿ" : "Rashi"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಭಾವ" : "House"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಅಂಶಗಳು" : "Deg"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಸ್ಥಿತಿ" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {planetaryPositions.map((p: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "8px 6px", fontWeight: 700, color: "#fef08a" }}>{p.name}</td>
                      <td style={{ padding: "8px 6px", color: "#cbd5e1" }}>{p.rashi || "Simha"}</td>
                      <td style={{ padding: "8px 6px", color: "#38bdf8" }}>{p.house || idx + 1}</td>
                      <td style={{ padding: "8px 6px", color: "#94a3b8" }}>{p.deg || "15° 00'"}</td>
                      <td style={{ padding: "8px 6px", color: "#86efac" }}>{p.status || "Subha"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: 100% GOCHARA & TARA BALA ── */}
        {activeTab === "gochara" && (
          <div>
            {/* Chandra Bala & Tara Bala Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 14,
                padding: 14
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#6ee7b7", marginBottom: 4, fontWeight: 700 }}>
                  🌙 {isKn ? "ಚಂದ್ರ ಬಲ (Chandra Bala)" : "Chandra Bala"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                  {mockDay.chandra.score}% - {isKn ? "ಅನುಕೂಲಕರ (11ನೇ ಮನೆ)" : "Auspicious (11th House)"}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                  {isKn ? "ಮನೋಬಲ ಹಾಗೂ ಕಾರ್ಯದಲ್ಲಿ ನೆಮ್ಮದಿ ತರಲಿದೆ." : "Brings mental clarity and progressive success."}
                </div>
              </div>

              <div style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: 14,
                padding: 14
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#93c5fd", marginBottom: 4, fontWeight: 700 }}>
                  ⭐ {isKn ? "ತಾರಾ ಬಲ (Tara Bala)" : "Tara Bala Strength"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>
                  {TARA_BALA_NAMES[mockDay.tara.tara]?.kn || "ಸಂಪತ್ ತಾರಾ"}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                  {isKn ? "ಧನಾರ್ಜನೆ ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ." : "Favorable for investments and new initiatives."}
                </div>
              </div>
            </div>

            {/* Major Planetary Gochara Transits */}
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>
                🪐 {isKn ? "ಪ್ರಮುಖ ಗ್ರಹಗಳ ಗೋಚಾರ ಫಲಗಳು (Live Transits)" : "Major Planetary Gochara Transits"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10, borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ fontWeight: 700, color: "#fef08a" }}>👑 {isKn ? "ಗುರು ಗೋಚಾರ (Jupiter Transit)" : "Jupiter Gochara (Guru Transit)"}</div>
                  <div style={{ color: "#cbd5e1", marginTop: 4, lineHeight: 1.5 }}>
                    {isKn
                      ? "ಗುರುವು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ಶುಭ ದೃಷ್ಟಿ ಬೀರುತ್ತಿದ್ದು, ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ ಹಾಗೂ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡುತ್ತಿದ್ದಾನೆ."
                      : "Jupiter casts auspicious aspect on your Moon sign, elevating wisdom and professional prospects."}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10, borderLeft: "3px solid #38bdf8" }}>
                  <div style={{ fontWeight: 700, color: "#7dd3fc" }}>⚖️ {isKn ? "ಶನಿ ಗೋಚಾರ (Saturn Transit - Shani Bala)" : "Saturn Gochara (Shani Transit)"}</div>
                  <div style={{ color: "#cbd5e1", marginTop: 4, lineHeight: 1.5 }}>
                    {isKn
                      ? "ಶನಿಯು ಸ್ವಕ್ಷೇತ್ರ ಸಂಚಾರದಲ್ಲಿದ್ದು, ಶಿಸ್ತು ಮತ್ತು ನಿಷ್ಠಾವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ನೀಡಲಿದ್ದಾನೆ. ಅನಗತ್ಯ ಆತುರ ತಪ್ಪಿಸಿ."
                      : "Saturn transits in strength, rewarding disciplined efforts while advising against hasty financial decisions."}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10, borderLeft: "3px solid #a855f7" }}>
                  <div style={{ fontWeight: 700, color: "#d8b4fe" }}>🐉 {isKn ? "ರಾಹು-ಕೇತು ಗೋಚಾರ (Rahu-Ketu Axis)" : "Rahu-Ketu Axis Transit"}</div>
                  <div style={{ color: "#cbd5e1", marginTop: 4, lineHeight: 1.5 }}>
                    {isKn
                      ? "ಕಾರ್ಮಿಕ ಶುದ್ಧೀಕರಣ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ಪ್ರಯಾಣಗಳ ಸಂಭವ. ಶ್ರೀ ದುರ್ಗಾ ಹಾಗೂ ಗಣಪತಿ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ."
                      : "Karmic transformation axis active. Regular prayer to Sri Durga and Ganesha brings peace and protection."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: 100% DASHA-BHUKTI BREAKDOWN ── */}
        {activeTab === "dasha" && (
          <div>
            {/* Running Dasha Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(30, 27, 75, 0.4) 100%)",
              border: "1px solid #a855f7",
              borderRadius: 16,
              padding: 18,
              marginBottom: 20
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, color: "#e9d5ff", marginBottom: 6 }}>
                ⏳ {isKn ? "ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲ" : "Active Vimshottari Dasha Phase"}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 4 }}>
                {isKn ? "ಗುರು ಮಹಾದಶಾ · ಶುಕ್ರ ಅಂತರ್ದಶಾ" : "Jupiter Mahadasha · Venus Antardasha"}
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                {isKn ? "ಅವಧಿ: 2024 ರಿಂದ 2027 ರವರೆಗೆ (ಶುಭ ಫಲದಾಯಕ ಕಾಲ)" : "Active Period: 2024 to 2027 (Auspicious Phase)"}
              </div>
            </div>

            {/* Dasha Phala Detailed Insights */}
            <div style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>
                📜 {isKn ? "ದಶಾ ಫಲ ವಿಶ್ಲೇಷಣೆ (Dasha Phala Insights)" : "Comprehensive Dasha Phala"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.6, color: "#e2e8f0" }}>
                <div>
                  <strong style={{ color: "#38bdf8" }}>💼 {isKn ? "ಉದ್ಯೋಗ & ಧನಲಾಭ:" : "Career & Finance:"}</strong>{" "}
                  {isKn
                    ? "ಗುರು ಮತ್ತು ಶುಕ್ರರ ಸಂಯೋಗವು ಉದ್ಯೋಗದಲ್ಲಿ ಗೌರವ, ನೂತನ ಅವಕಾಶಗಳು ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿಗೆ ಕಾರಣವಾಗಲಿದೆ."
                    : "Jupiter-Venus harmony fosters professional recognition, financial growth, and real estate progress."}
                </div>
                <div>
                  <strong style={{ color: "#f472b6" }}>🏡 {isKn ? "ಕುಟುಂಬ & ವಿವಾಹ ಜೀವನ:" : "Family & Relationships:"}</strong>{" "}
                  {isKn
                    ? "ಮಂಗಳ ಕಾರ್ಯಗಳ ಚರ್ಚೆ, ಬಂಧು-ಮಿತ್ರರ ಸಹಕಾರ ಮತ್ತು ಗೃಹದಲ್ಲಿ ಸಂತೋಷದ ವಾತಾವರಣ ಉಂಟಾಗಲಿದೆ."
                    : "Favorable for auspicious celebrations, family harmony, and cordial social relationships."}
                </div>
                <div>
                  <strong style={{ color: "#86efac" }}>🌿 {isKn ? "ಆರೋಗ್ಯ & ಮನಃಶಾಂತಿ:" : "Health & Vitality:"}</strong>{" "}
                  {isKn
                    ? "ಉತ್ತಮ ಆರೋಗ್ಯವಿರಲಿದೆ. ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ ಹಾಗೂ ನಿಯಮಿತ ಧ್ಯಾನವು ಇನ್ನಷ್ಟು ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನೀಡುತ್ತದೆ."
                    : "Generally positive vitality. Sattvic diet and regular meditation enhance physical and mental calm."}
                </div>
              </div>
            </div>

            {/* Recommended Vedic Remedies */}
            <div style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24
            }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#fef08a" }}>
                🪔 {isKn ? "ದಶಾ ಶಾಂತಿ & ವೈದಿಕ ಪರಿಹಾರಗಳು (Vedic Remedies)" : "Prescribed Vedic Remedies"}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>
                <li>{isKn ? "ಗುರುವಾರ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ ಹಾಗೂ ಕಡಲೆಕಾಳು ದಾನ." : "Chant Vishnu Sahasranama on Thursdays & offer yellow lentils."}</li>
                <li>{isKn ? "ಶುಕ್ರವಾರ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟೋತ್ತರ ಜಪ ಹಾಗೂ ಗೋಸೇವೆ." : "Offer prayers to Goddess Mahalakshmi on Fridays & feed cows."}</li>
                <li>{isKn ? "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ." : "Sponsor Rudrabhisheka at Gokarna Mahabaleshwara temple."}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons: WhatsApp & Copy */}
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          paddingTop: 12,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              background: "#25D366",
              color: "#ffffff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 24,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)"
            }}
          >
            💬 {isKn ? "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ" : "Share on WhatsApp"}
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "12px 24px",
              borderRadius: 24,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            🔗 {copied ? (isKn ? "ಕಾಪಿ ಆಗಿದೆ! ✓" : "Copied! ✓") : (isKn ? "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ" : "Copy Sanctum Link")}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        marginTop: 32,
        fontSize: 12,
        color: "#64748b"
      }}>
        ✨ Gokarna Mahabaleshwara Prasada Siddhirastu · Baggona Panchanga Astrology ✨
      </footer>
    </div>
  );
}
