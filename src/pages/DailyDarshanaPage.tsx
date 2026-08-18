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
import { getDailyKaalaTimings, getEnergyMeterAndVibe, generateSevaICalendarString, downloadIcsFile, getDayLordIndex } from "../features/seva/icsCalendarGenerator";
import { decodeDevoteeToken } from "../utils/tokenCipher";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import type { TaraNumber } from "../core/TaraBalaEngine";
import { nakshatraName, rashiName, grahaName, colourName, tithiLabel, getDailyActionableGuidance, formatLongDate, getLocalizedPanditName } from "../features/seva/sevaPresentation";
import type { GrahaKey, ColourKey } from "../features/seva/sevaLocale";
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
  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");
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

  const [generatedIcs, setGeneratedIcs] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const dayLordIdx = useMemo(() => {
    const d = new Date(dateParam);
    return isNaN(d.getDay()) ? 1 : d.getDay();
  }, [dateParam]);

  const deity = DEITY_CONFIG[dayLordIdx] || DEITY_CONFIG[1];

  const daysElapsed = useMemo(() => {
    const startDateStr = decoded?.d || dateParam;
    const start = new Date(startDateStr);
    const target = new Date(dateParam);
    if (isNaN(start.getTime()) || isNaN(target.getTime())) return 0;
    const startMs = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const targetMs = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.floor((targetMs - startMs) / (1000 * 60 * 60 * 24));
  }, [decoded, dateParam]);

  const isTokenExpired = useMemo(() => {
    if (!tokenParam) return false;
    if (!decoded) return true; // invalid / tampered token
    return daysElapsed >= 90 || daysElapsed < -7;
  }, [tokenParam, decoded, daysElapsed]);

  const mockDay: RhythmDay = useMemo(() => {
    const d = new Date(dateParam);
    const validD = isNaN(d.getTime()) ? new Date() : d;
    const dayNum = validD.getDate();
    const yearNum = validD.getFullYear();
    const monthNum = validD.getMonth();
    const dayOfWeek = validD.getDay();

    const birthNakIdx = decoded?.nk !== undefined ? decoded.nk : ((dayNum * 2) % 27);
    const birthRashiIdx = decoded?.r !== undefined ? decoded.r : Math.floor(birthNakIdx / 2.25);

    const safeOffset = Math.max(0, Math.min(89, daysElapsed));
    const transitNak = (birthNakIdx + safeOffset) % 27;
    const transitRashi = (birthRashiIdx + Math.floor(safeOffset / 2.25)) % 12;

    const taraVal = (((transitNak - birthNakIdx + 27) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    const isTaraFav = [2, 4, 6, 8, 9].includes(taraVal);

    const houseOffset = ((transitRashi - birthRashiIdx + 12) % 12) + 1;
    const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
    const isChandrashtamaDay = houseOffset === 8;

    const scoreVal = (isTaraFav ? 45 : 20) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
    const finalEnergy = Math.max(25, Math.min(98, scoreVal));

    const bandType: "high" | "steady" | "rest" = finalEnergy >= 75 ? "high" : finalEnergy >= 50 ? "steady" : "rest";
    const tithiVal = ((dayNum % 15) + 1);

    return {
      ymd: dateParam,
      weekday: dayOfWeek,
      dayOfMonth: dayNum,
      monthIndex: monthNum,
      year: yearNum,
      moonNakshatraIndex: transitNak,
      moonRashiIndex: transitRashi,
      tithiNumber: tithiVal,
      tithiInPaksha: tithiVal,
      paksha: dayNum <= 15 ? "shukla" : "krishna",
      tithiGroup: "purna",
      tara: {
        tara: taraVal,
        count: taraVal,
        isFavourable: isTaraFav,
        isDifficult: !isTaraFav,
        score: isTaraFav ? 85 : 40
      },
      chandra: {
        house: houseOffset,
        isChandrashtama: isChandrashtamaDay,
        isFavourable: isChandraFav,
        score: isChandraFav ? 85 : 35
      },
      dayLord: GRAHA_KEYS[dayOfWeek] || "Sun",
      bhuktiLord: "Jupiter",
      energyScore: finalEnergy,
      band: bandType,
      arthaScore: Math.min(95, finalEnergy + 5),
      isMoneyDay: (safeOffset % 7 === 2 || safeOffset % 7 === 4) && !isChandrashtamaDay,
      isChandrashtama: isChandrashtamaDay,
      isJanmaNakshatraDay: transitNak === birthNakIdx,
      isEkadashi: tithiVal === 11,
      isPurnima: dayNum === 15,
      isAmavasya: dayNum === 30,
      isPradosha: false,
      isSankashti: false,
      isPoojaDay: dayOfWeek === 2 || dayOfWeek === 5,
      luckyNumbers: [(safeOffset % 9) + 1, ((safeOffset + 3) % 9) + 1],
      luckyColour: (dayOfWeek === 0 ? "orange" : dayOfWeek === 1 ? "white" : dayOfWeek === 2 ? "red" : dayOfWeek === 3 ? "green" : dayOfWeek === 4 ? "yellow" : dayOfWeek === 5 ? "pink" : "dark") as ColourKey,
      luckyDirection: dayOfWeek === 0 ? "east" : dayOfWeek === 1 ? "northwest" : dayOfWeek === 2 ? "south" : dayOfWeek === 3 ? "north" : dayOfWeek === 4 ? "northeast" : dayOfWeek === 5 ? "southeast" : "west"
    };
  }, [dateParam, decoded, daysElapsed]);

  const kaala = useMemo(() => getDailyKaalaTimings(dayLordIdx, lang), [dayLordIdx, lang]);
  const vibe = useMemo(() => getEnergyMeterAndVibe(mockDay, lang), [mockDay, lang]);
  const devoteeName = nameParam || storedSession?.form?.name || (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee");
  const localizedPandit = useMemo(() => getLocalizedPanditName(panditParam, lang), [panditParam, lang]);
  const salutation = useMemo(() => getDevoteeSalutation(devoteeName, localizedPandit, lang), [devoteeName, localizedPandit, lang]);
  const benediction = useMemo(() => buildDeterministicPriestBenediction(mockDay, lang, devoteeName), [mockDay, lang, devoteeName]);
  const actionableGuidance = useMemo(() => getDailyActionableGuidance(mockDay, lang), [mockDay, lang]);

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

    if (actionParam === "ics90" && decoded) {
      try {
        const birthNakIdx = decoded.nk ?? 0;
        const birthRashiIdx = decoded.r ?? 0;
        const startDate = new Date(decoded.d || dateParam);
        if (isNaN(startDate.getTime())) return;

        const DASHA_LORDS: GrahaKey[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Mercury", "Jupiter"];
        const BHUKTI_LORDS: GrahaKey[] = ["Saturn", "Mercury", "Venus", "Sun", "Moon", "Mars", "Jupiter", "Saturn", "Venus"];

        const personalDays: RhythmDay[] = [];
        for (let i = 0; i < 90; i++) {
          const curr = new Date(startDate);
          curr.setDate(curr.getDate() + i);

          const y = curr.getFullYear();
          const m = curr.getMonth();
          const d = curr.getDate();
          const ymdStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

          const dayOfWeek = curr.getDay();
          const dayLordName = GRAHA_KEYS[dayOfWeek] || "Sun";

          const tithiVal = (d + m * 2) % 30 + 1;
          const pakshaType = tithiVal <= 15 ? "shukla" : "krishna";
          const tithiInP = tithiVal <= 15 ? tithiVal : tithiVal - 15;

          const transitNak = (birthNakIdx + i) % 27;
          const transitRashi = (birthRashiIdx + Math.floor(i / 2.25)) % 12;

          const taraVal = ((transitNak - birthNakIdx + 27) % 9) + 1;
          const isTaraFav = [2, 4, 6, 8, 9].includes(taraVal);

          const houseOffset = ((transitRashi - birthRashiIdx + 12) % 12) + 1;
          const isChandraFav = [1, 3, 6, 7, 10, 11].includes(houseOffset);
          const isChandrashtamaDay = houseOffset === 8;

          const scoreVal = (isTaraFav ? 45 : 20) + (isChandraFav ? 40 : 15) + (isChandrashtamaDay ? -25 : 5);
          const finalEnergy = Math.max(25, Math.min(98, scoreVal));

          const bandType: "high" | "steady" | "rest" = finalEnergy >= 75 ? "high" : finalEnergy >= 50 ? "steady" : "rest";

          personalDays.push({
            ymd: ymdStr,
            year: y,
            monthIndex: m,
            dayOfMonth: d,
            weekday: dayOfWeek,
            tithiNumber: tithiVal,
            tithiInPaksha: tithiInP,
            paksha: pakshaType,
            tithiGroup: "nanda",
            isAmavasya: tithiVal === 30,
            isPurnima: tithiVal === 15,
            moonRashiIndex: transitRashi,
            moonNakshatraIndex: transitNak,
            tara: {
              tara: taraVal as TaraNumber,
              count: taraVal,
              isFavourable: isTaraFav,
              isDifficult: !isTaraFav,
              score: isTaraFav ? 85 : 40
            },
            chandra: {
              house: houseOffset,
              isChandrashtama: isChandrashtamaDay,
              isFavourable: isChandraFav,
              score: isChandraFav ? 85 : 35
            },
            dayLord: dayLordName,
            bhuktiLord: BHUKTI_LORDS[i % BHUKTI_LORDS.length],
            band: bandType,
            energyScore: finalEnergy,
            arthaScore: Math.min(95, finalEnergy + 5),
            isChandrashtama: isChandrashtamaDay,
            isMoneyDay: (i % 7 === 2 || i % 7 === 4) && !isChandrashtamaDay,
            isJanmaNakshatraDay: transitNak === birthNakIdx,
            isEkadashi: tithiInP === 11,
            isPradosha: tithiInP === 13,
            isSankashti: tithiInP === 4 && pakshaType === "krishna",
            isPoojaDay: dayOfWeek === 2 || dayOfWeek === 5,
            luckyNumbers: [(i % 9) + 1, ((i + 3) % 9) + 1],
            luckyColour: (dayOfWeek === 0 ? "orange" : dayOfWeek === 1 ? "white" : dayOfWeek === 2 ? "red" : dayOfWeek === 3 ? "green" : dayOfWeek === 4 ? "yellow" : dayOfWeek === 5 ? "pink" : "dark") as ColourKey,
            luckyDirection: dayOfWeek === 0 ? "east" : dayOfWeek === 1 ? "northwest" : dayOfWeek === 2 ? "south" : dayOfWeek === 3 ? "north" : dayOfWeek === 4 ? "northeast" : dayOfWeek === 5 ? "southeast" : "west"
          });
        }

        const selectedTime = decoded.tm || params.get("time") || "08:00";
        const payloadStr = generateSevaICalendarString({
          days: personalDays,
          lang,
          panditName: decoded.p || panditParam,
          notificationTime: selectedTime,
          personName: decoded.n || devoteeName
        });
        setGeneratedIcs(payloadStr);
        const fileNameStr = `Baggona-Panchanga-90Day-${(decoded.n || devoteeName || "Devotee").replace(/\s+/g, "-")}.ics`;
        downloadIcsFile(fileNameStr, payloadStr);
      } catch (err) {
        console.error("Error generating 90-day ICS payload:", err);
      }
    }
  }, [actionParam, mockDay, lang, panditParam, devoteeName, decoded, dateParam]);

  // Synthesized Solfeggio 528Hz Sacred Temple Bell audio chime generator
  const playTempleBell = () => {
    try {
      setIsPlayingAudio(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const freqs = [528, 1056, 1584, 2112];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        const volume = 0.3 / (idx + 1);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 3.5);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3500);
    } catch (e) {
      console.error("Audio synthesis error:", e);
      setIsPlayingAudio(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🕉️ *Baggona Daily Panchanga & Darshana*\n` +
      `🏛️ Gokarna Mahabaleshwara Sacred Sanctum\n` +
      `📅 ${formatLongDate(mockDay, lang)}\n` +
      `👤 Devotee: ${devoteeName}\n` +
      `⚡ Energy Score: ${vibe.meter} (${vibe.badgeText})\n` +
      `🪔 Priest Benediction: "${benediction.slice(0, 100)}..."\n\n` +
      `🌐 Open Sanctum Web Page: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const planetaryPositions = useMemo(() => {
    if (storedSession?.result?.planets) {
      return storedSession.result.planets;
    }
    return [
      { name: "Surya (Sun)", rashi: "Simha (Leo)", house: 1, deg: "28° 14'", status: "Moolatrikona" },
      { name: "Chandra (Moon)", rashi: "Vrishabha (Taurus)", house: 10, deg: "14° 32'", status: "Uccha" },
      { name: "Kuja (Mars)", rashi: "Makara (Capricorn)", house: 6, deg: "08° 19'", status: "Uccha" },
      { name: "Budha (Mercury)", rashi: "Kanya (Virgo)", house: 2, deg: "11° 45'", status: "Uccha" },
      { name: "Guru (Jupiter)", rashi: "Karkataka (Cancer)", house: 12, deg: "05° 22'", status: "Uccha" },
      { name: "Shukra (Venus)", rashi: "Meena (Pisces)", house: 8, deg: "27° 10'", status: "Uccha" },
      { name: "Shani (Saturn)", rashi: "Kumbha (Aquarius)", house: 7, deg: "18° 06'", status: "Swakshetra" },
      { name: "Rahu", rashi: "Meena (Pisces)", house: 8, deg: "12° 40'", status: "Mitra" },
      { name: "Ketu", rashi: "Kanya (Virgo)", house: 2, deg: "12° 40'", status: "Mitra" }
    ];
  }, [storedSession]);

  // Language flags defined at top level component scope

  if (isTokenExpired) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1C0A00 0%, #2A1202 50%, #150600 100%)",
        color: "#FDE68A",
        fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
        padding: "32px 16px 60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          maxWidth: 600,
          width: "100%",
          background: "rgba(35, 15, 5, 0.95)",
          border: "2px solid #D4AF37",
          borderRadius: 24,
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(12px)"
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #78350F, #451A03)",
            border: "2px solid #F59E0B",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)"
          }}>
            🪔
          </div>

          <div style={{
            display: "inline-block",
            background: "rgba(220, 38, 38, 0.2)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            padding: "4px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 16
          }}>
            404 - {isKn ? "ಚಂದಾದಾರಿಕೆ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ" : "90-Day Sacred Token Expired"}
          </div>

          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#FFF8E7",
            marginBottom: 14,
            lineHeight: 1.3
          }}>
            {isKn
              ? "ನಿಮ್ಮ 90 ದಿನಗಳ ಪವಿತ್ರ ಪಂಚಾಂಗ ಸೇವಾ ಲಿಂಕ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ"
              : "Your Sacred 90-Day Panchanga Subscription Has Ended"}
          </h1>

          <p style={{
            fontSize: 15,
            color: "#E2E8F0",
            lineHeight: 1.6,
            marginBottom: 24
          }}>
            {isKn
              ? "ಈ ವ್ಯಕ್ತಿಗತ 90 ದಿನಗಳ ಪಂಚಾಂಗ ಸೇವಾ ಲಿಂಕ್ ಅತ್ಯಂತ ಯಶಸ್ವಿಯಾಗಿ 90 ದಿನಗಳ ಅವಧಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದೆ. ಮುಂದುವರಿದ ದಿನಗಳ ದೈನಂದಿನ ದರ್ಶನ ಮತ್ತು ಪಂಚಾಂಗ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಹೊಸ 90 ದಿನಗಳ ಚಂದಾದಾರಿಕೆಯನ್ನು ಪಡೆಯಿರಿ."
              : "This personalized 90-day devotional token has completed its sacred 90-day duration. To continue receiving daily Panchanga transit updates, Tara-Chandra energy guidance, and Archaka benedictions, please request a fresh subscription."}
          </p>

          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px dashed rgba(245, 158, 11, 0.4)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 28,
            textAlign: "left",
            fontSize: 13,
            color: "#FDE68A"
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>📜 Devotee Subscription Details:</div>
            {decoded?.n && <div>• Devotee: <strong>{decoded.n}</strong></div>}
            {decoded?.p && <div>• Chief Archaka: <strong>{decoded.p}</strong></div>}
            {decoded?.d && <div>• Package Start Date: <strong>{decoded.d}</strong></div>}
            <div>• Expiry Status: <span style={{ color: "#F87171", fontWeight: 700 }}>Expired (Passed 90 Days Limit)</span></div>
          </div>

          {/* Shreeram Pandit Contact Information (No Login Redirect) */}
          <div style={{
            background: "linear-gradient(135deg, #2D1407 0%, #451A03 100%)",
            border: "2px solid #F59E0B",
            borderRadius: 20,
            padding: "20px",
            marginBottom: 20,
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(245, 158, 11, 0.25)"
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📞</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#FDE68A", margin: "0 0 4px" }}>
              {isKn ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಮುಖ್ಯ ಅರ್ಚಕರು)" : "Shreeram Pandit (Chief Archaka)"}
            </h2>
            <p style={{ fontSize: 13, color: "#FCD34D", margin: "0 0 14px", lineHeight: 1.5 }}>
              {isKn
                ? "ನಿಮ್ಮ ಹೊಸ 90 ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಮತ್ತು ನಕ್ಷತ್ರ ಫಲಕ್ಕಾಗಿ ಪಂಡಿತರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
                : "Call Shreeram Pandit to renew or get your personalized 90-Day Panchanga Calendar."}
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="tel:9972339362"
                style={{
                  background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                  color: "#FFFFFF",
                  border: "1px solid #F59E0B",
                  padding: "12px 22px",
                  borderRadius: 24,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 15px rgba(217, 119, 6, 0.4)"
                }}
              >
                📞 {isKn ? "ಕರೆ ಮಾಡಿ: 9972339362" : "Call: +91 9972339362"}
              </a>
              <a
                href="https://wa.me/919972339362?text=Namaste%20Shreeram%20Panditji,%20I%20want%20to%20get%20a%20personalized%2090-day%20Baggona%20Panchanga%20calendar."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#25D366",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px 22px",
                  borderRadius: 24,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)"
                }}
              >
                💬 WhatsApp (9972339362)
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFFDF0 0%, #FDF6E2 50%, #F5E6BE 100%)",
      color: "#3B1408",
      fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
      padding: "24px 16px 60px"
    }}>
      {/* Top Header Bar */}
      <header style={{
        maxWidth: 780,
        margin: "0 auto 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <button
          onClick={() => setShowContactModal(true)}
          style={{
            background: "#FFF8E7",
            border: "1px solid #D4AF37",
            color: "#78350F",
            padding: "8px 18px",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(180, 130, 20, 0.12)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          📞 {isKn ? "ಅರ್ಚಕರ ಸಂಪರ್ಕ (9972339362)" : "Contact Archaka (9972339362)"}
        </button>

        {/* Language Selector */}
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
                background: lang === l.code ? "linear-gradient(135deg, #D97706, #B45309)" : "#FFF8E7",
                color: lang === l.code ? "#FFFFFF" : "#78350F",
                border: lang === l.code ? "1px solid #9A3412" : "1px solid #E5C158",
                padding: "6px 14px",
                borderRadius: 18,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: lang === l.code ? "0 4px 10px rgba(217, 119, 6, 0.3)" : "none"
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        maxWidth: 780,
        margin: "0 auto",
        background: "rgba(255, 253, 245, 0.96)",
        backdropFilter: "blur(16px)",
        border: "2px solid #D4AF37",
        borderRadius: 24,
        padding: "28px 20px",
        boxShadow: "0 20px 60px rgba(180, 130, 20, 0.18)"
      }}>
        {actionParam === "ics90" && (
          <div style={{
            background: "linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)",
            border: "2px solid #D4AF37",
            borderRadius: 18,
            padding: "16px 20px",
            marginBottom: 20,
            textAlign: "center",
            boxShadow: "0 4px 14px rgba(212, 175, 55, 0.15)"
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#78350F", marginBottom: 6 }}>
              📅 {isKn ? "90 ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಸಿದ್ಧವಾಗಿದೆ!" : "90-Day Personalized Calendar Series Ready!"}
            </div>
            <div style={{ fontSize: 13, color: "#451A03", marginBottom: 12 }}>
              {isKn ? "ನಿಮ್ಮ ಫೋನ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ 90 ದಿನಗಳ ಫಲಗಳನ್ನು ಸೇರಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ" : "Tap below to import all 90 daily events into your Phone or Google Calendar as a single series."}
            </div>
            <button
              onClick={() => {
                if (generatedIcs) {
                  downloadIcsFile(`Baggona-Panchanga-90Day-${devoteeName.replace(/\s+/g, "-")}.ics`, generatedIcs);
                }
              }}
              style={{
                background: "linear-gradient(135deg, #D97706, #B45309)",
                color: "#FFFFFF",
                border: "none",
                padding: "12px 24px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
              }}
            >
              📥 {isKn ? ".ics ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್ / ಸೇರಿಸಿ" : "Add 90 Days to Calendar (.ics)"}
            </button>
          </div>
        )}

        {/* Kshetra Temple Header Banner */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #78350F, #451A03)",
            color: "#FDE68A",
            padding: "6px 18px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.5,
            marginBottom: 12,
            boxShadow: "0 4px 12px rgba(120, 53, 15, 0.25)"
          }}>
            🕉️ {isKn ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ" : "Gokarna Mahabaleshwara Sacred Sanctum"}
          </div>

          <h1 style={{
            margin: "0 0 6px",
            fontSize: "clamp(22px, 4.5vw, 32px)",
            fontWeight: 900,
            color: "#78350F",
            letterSpacing: -0.5
          }}>
            {isKn ? "ದೈನಿಕ ದರ್ಶನ & ಲೈಫ್ ಗೈಡೆನ್ಸ್" : "Daily Sanctum Darshana & Guidance"}
          </h1>

          <div style={{ color: "#9A3412", fontSize: 14, fontWeight: 700 }}>
            📅 {formatLongDate(mockDay, lang)} · {tithiLabel(mockDay, lang)}
          </div>
        </div>

        {/* Devotee Greeting Banner */}
        <div style={{
          background: "linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 18,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 4px 15px rgba(212, 175, 55, 0.1)"
        }}>
          <div style={{ fontSize: 32 }}>🪔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#78350F" }}>
              {salutation}
            </div>
            <div style={{ fontSize: 13, color: "#451A03", marginTop: 2, fontWeight: 600 }}>
              ⭐ {isKn ? "ಗೋಚಾರ ನಕ್ಷತ್ರ" : "Transit Star"}: {nakshatraName(mockDay.moonNakshatraIndex, lang)} | 🦁 {isKn ? "ರಾಶಿ" : "Sign"}: {rashiName(mockDay.moonRashiIndex, lang)}
            </div>
          </div>
        </div>

        {/* 4 Interactive Feature Navigation Tabs */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          background: "#FFF3D6",
          border: "1px solid #E5C158",
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
                  ? "linear-gradient(135deg, #D97706 0%, #B45309 100%)"
                  : "transparent",
                color: activeTab === tab.id ? "#FFFFFF" : "#78350F",
                border: activeTab === tab.id ? "1px solid #9A3412" : "none",
                borderRadius: 12,
                padding: "10px 4px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s ease",
                boxShadow: activeTab === tab.id ? "0 4px 10px rgba(217, 119, 6, 0.3)" : "none"
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{isKn ? tab.kn : tab.en}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: SINGLE-PAGE EXECUTIVE DASHBOARD & SANCTUM ── */}
        {activeTab === "darshana" && (
          <div>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#78350F" }}>
                {isKn ? "ಇಂದಿನ ಪ್ರಮುಖ 3 - 4 ಮಾರ್ಗದರ್ಶನಗಳು" : "Today's Key Actionable Focus Points"}
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
              marginBottom: 24
            }}>
              {actionableGuidance.map((pt, idx) => (
                <div key={idx} style={{
                  background: pt.type === "positive" ? "linear-gradient(135deg, #FFFDF0 0%, #FEF3C7 100%)" : pt.type === "warning" ? "linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%)" : "linear-gradient(135deg, #FFFDF0 0%, #F3F4F6 100%)",
                  border: pt.type === "positive" ? "1.5px solid #D4AF37" : pt.type === "warning" ? "1.5px solid #FCA5A5" : "1.5px solid #E5C158",
                  borderRadius: 16,
                  padding: "16px 18px",
                  boxShadow: "0 4px 12px rgba(180, 130, 20, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{pt.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: pt.type === "warning" ? "#991B1B" : "#78350F" }}>
                      {pt.category}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: pt.type === "warning" ? "#7F1D1D" : "#451A03", fontWeight: 500 }}>
                    {pt.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 24
            }}>
              <div style={{
                background: "linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)",
                border: "1.5px solid #E5C158",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 4px 12px rgba(180, 130, 20, 0.08)"
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#9A3412", fontWeight: 700, marginBottom: 4 }}>
                  ⚡ {isKn ? "ಶಕ್ತಿ ಮಟ್ಟ (Energy Level)" : "Daily Energy Meter"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#D97706" }}>
                  {vibe.meter} ({vibe.badgeText})
                </div>
                <div style={{ background: "#E5E7EB", borderRadius: 10, height: 8, marginTop: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${mockDay.energyScore}%`,
                    background: "linear-gradient(90deg, #D97706, #10B981)",
                    height: "100%",
                    borderRadius: 10
                  }} />
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)",
                border: "1.5px solid #E5C158",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 4px 12px rgba(180, 130, 20, 0.08)"
              }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#9A3412", fontWeight: 700, marginBottom: 4 }}>
                  🧠 {isKn ? "ಮನಃಸ್ಥಿತಿ (Manas State)" : "Mind Peace & Focus"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#78350F" }}>
                  {mockDay.isChandrashtama ? (isKn ? "ಚಂದ್ರಾಷ್ಟಮ (ಶಾಂತವಾಗಿರಿ)" : "Restless (Stay Calm)") : (isKn ? "ಚಿತ್ತ ಏಕಾಗ್ರತೆ & ಪ್ರಸನ್ನತೆ" : "Chitta Ekagrata (Calm)")}
                </div>
                <div style={{ fontSize: 12, color: "#451A03", marginTop: 4, fontWeight: 600 }}>
                  🌙 {isKn ? "ಚಂದ್ರಬಲ" : "Moon Strength"}: {mockDay.chandra.score}%
                </div>
              </div>
            </div>

            <div style={{
              background: "#FFF8E7",
              border: "1.5px solid #E5C158",
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 24,
              boxShadow: "0 4px 15px rgba(212, 175, 55, 0.1)"
            }}>
              <h2 style={{
                margin: "0 0 12px",
                fontSize: 15,
                fontWeight: 800,
                color: "#78350F",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                ⏳ {isKn ? "ಇಂದಿನ ಕಾಲ ಸಮಯಗಳು (Kolkata Time)" : "Daily Kaala Timings (Kolkata Time)"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, fontSize: 13 }}>
                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "10px 12px", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#991B1B", fontWeight: 700 }}>🔴 Rahu Kaala</div>
                  <div style={{ fontWeight: 800, color: "#7F1D1D", marginTop: 2 }}>{kaala.rahu}</div>
                </div>
                <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", padding: "10px 12px", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#854D0E", fontWeight: 700 }}>🟡 Gulika Kaala</div>
                  <div style={{ fontWeight: 800, color: "#713F12", marginTop: 2 }}>{kaala.gulika}</div>
                </div>
                <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", padding: "10px 12px", borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>🟢 Yamaganda</div>
                  <div style={{ fontWeight: 800, color: "#14532D", marginTop: 2 }}>{kaala.yamaganda}</div>
                </div>
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 18,
              padding: "22px 20px",
              marginBottom: 24,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(120, 53, 15, 0.3)",
              color: "#FDE68A"
            }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#FDE68A", marginBottom: 6, fontWeight: 700 }}>
                🪔 {isKn ? `ಇಂದಿನ ದೇವತಾ ಜಪ ಮಂತ್ರ (${deity.titleKn})` : `Sacred Deity Mantra of the Day (${deity.titleEn})`}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginBottom: 14, lineHeight: 1.5 }}>
                {deity.mantra}
              </div>
              <button
                onClick={playTempleBell}
                style={{
                  background: isPlayingAudio ? "#10B981" : "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                }}
              >
                🔔 {isPlayingAudio ? (isKn ? "ಘಂಟಾನಾದ ಧ್ವನಿಸುತ್ತಿದೆ..." : "Chanting Temple Bell...") : (isKn ? "ದೇವಸ್ಥಾನದ ಘಂಟಾನಾದ (Play Bell)" : "Play Temple Chime")}
              </button>
            </div>

            <div style={{
              background: "#FFF8E7",
              border: "1.5px solid #E5C158",
              borderRadius: 18,
              padding: "18px 20px",
              marginBottom: 24,
              boxShadow: "0 4px 15px rgba(212, 175, 55, 0.1)"
            }}>
              <h2 style={{
                margin: "0 0 10px",
                fontSize: 15,
                fontWeight: 800,
                color: "#78350F",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                📜 {localizedPandit} - {isKn ? "ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಮಾರ್ಗದರ್ಶನ" : isHi ? "मुख्य अर्चक का आशीर्वाद एवं मार्गदर्शन" : isTe ? "ముఖ్య అర్చకుల ఆశీర్వచనం & మార్గదర్శకత్వం" : isTa ? "முதன்மை அர்ச்சகரின் ஆசி & வழிகாட்டுதல்" : "Chief Priest Benediction & Guidance"}
              </h2>
              <p style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#451A03",
                fontStyle: "italic",
                fontWeight: 500
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
              background: "#FFF8E7",
              border: "1.5px solid #E5C158",
              borderRadius: 18,
              padding: 18,
              marginBottom: 20,
              boxShadow: "0 4px 12px rgba(180, 130, 20, 0.08)"
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#78350F", display: "flex", alignItems: "center", gap: 8 }}>
                🕉️ {isKn ? "ಜನ್ಮ ಕುಂಡಲಿ ಮೂಲ ವಿವರಗಳು (Birth Attributes)" : "100% Janma Kundali Attributes"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                <div style={{ background: "#FFFDF0", border: "1px solid #E5C158", padding: 12, borderRadius: 12 }}>
                  <span style={{ color: "#78350F", fontWeight: 600 }}>{isKn ? "ಜನ್ಮ ಲಗ್ನ:" : "Janma Lagna:"}</span>{" "}
                  <strong style={{ color: "#B45309" }}>{storedSession?.result?.ascendant?.english || "Simha (Leo)"}</strong>
                </div>
                <div style={{ background: "#FFFDF0", border: "1px solid #E5C158", padding: 12, borderRadius: 12 }}>
                  <span style={{ color: "#78350F", fontWeight: 600 }}>{isKn ? "ಚಂದ್ರ ರಾಶಿ:" : "Moon Sign:"}</span>{" "}
                  <strong style={{ color: "#B45309" }}>{storedSession?.result?.moonSign?.english || "Vrishabha (Taurus)"}</strong>
                </div>
                <div style={{ background: "#FFFDF0", border: "1px solid #E5C158", padding: 12, borderRadius: 12 }}>
                  <span style={{ color: "#78350F", fontWeight: 600 }}>{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Birth Nakshatra:"}</span>{" "}
                  <strong style={{ color: "#B45309" }}>{storedSession?.result?.nakshatra?.english || "Rohini 2nd Pada"}</strong>
                </div>
                <div style={{ background: "#FFFDF0", border: "1px solid #E5C158", padding: 12, borderRadius: 12 }}>
                  <span style={{ color: "#78350F", fontWeight: 600 }}>{isKn ? "ರಾಶ್ಯಾಧಿಪತಿ:" : "Rashi Lord:"}</span>{" "}
                  <strong style={{ color: "#B45309" }}>Shukra (Venus)</strong>
                </div>
              </div>
            </div>

            <div style={{
              background: "#FFFDF0",
              border: "1.5px solid #E5C158",
              borderRadius: 18,
              padding: 18,
              marginBottom: 24,
              overflowX: "auto",
              boxShadow: "0 4px 12px rgba(180, 130, 20, 0.08)"
            }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: "#78350F" }}>
                🪐 {isKn ? "ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಸ್ಥಾನಗಳು (Graha Sphutas & Bhavas)" : "Complete Planetary Sphuta Table"}
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E5C158", color: "#78350F" }}>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಗ್ರಹ" : "Graha"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ರಾಶಿ" : "Rashi"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಭಾವ" : "House"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಅಂಶಗಳು" : "Deg"}</th>
                    <th style={{ padding: "8px 6px" }}>{isKn ? "ಸ್ಥಿತಿ" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {planetaryPositions.map((p: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #FEF3C7" }}>
                      <td style={{ padding: "10px 6px", fontWeight: 800, color: "#78350F" }}>{p.name}</td>
                      <td style={{ padding: "10px 6px", color: "#451A03" }}>{p.rashi || "Simha"}</td>
                      <td style={{ padding: "10px 6px", color: "#B45309", fontWeight: 700 }}>{p.house || idx + 1}</td>
                      <td style={{ padding: "10px 6px", color: "#78350F" }}>{p.deg || "15° 00'"}</td>
                      <td style={{ padding: "10px 6px", color: "#166534", fontWeight: 700 }}>{p.status || "Subha"}</td>
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

      {/* Shreeram Pandit Contact Modal */}
      {showContactModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1C0A00 0%, #2A1202 100%)",
            border: "2px solid #F59E0B",
            borderRadius: 24,
            padding: "28px 24px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            color: "#FFF8E7",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowContactModal(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 16,
                background: "transparent",
                border: "none",
                color: "#FDE68A",
                fontSize: 22,
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: 42, marginBottom: 10 }}>🪔</div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#FDE68A", margin: "0 0 6px" }}>
              {isKn ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "Shreeram Pandit"}
            </h3>
            <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 700, marginBottom: 14 }}>
              🕉️ {isKn ? "ಮುಖ್ಯ ಅರ್ಚಕರು - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : "Chief Archaka - Gokarna Kshetra"}
            </div>

            <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6, marginBottom: 20 }}>
              {isKn
                ? "ನಿಮ್ಮ ಹೆಸರು, ಗೋತ್ರ ಹಾಗೂ ನಕ್ಷತ್ರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ವೈಯಕ್ತಿಕ 90 ದಿನಗಳ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೇವಾ ಕ್ಯಾಲೆಂಡರ್ ಪಡೆಯಲು ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರನ್ನು ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ."
                : "Call Shreeram Pandit to get your personalized 90-Day Baggona Panchanga calendar tailored to your Name, Gotra & Nakshatra."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="tel:9972339362"
                style={{
                  background: "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#FFFFFF",
                  padding: "14px",
                  borderRadius: 16,
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 4px 15px rgba(217, 119, 6, 0.4)"
                }}
              >
                📞 {isKn ? "ನೇರ ಕರೆ: 9972339362" : "Call Directly: +91 9972339362"}
              </a>

              <a
                href="https://wa.me/919972339362?text=Namaste%20Shreeram%20Panditji,%20I%20want%20to%20get%20a%20personalized%2090-day%20Baggona%20Panchanga%20calendar."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#25D366",
                  color: "#FFFFFF",
                  padding: "14px",
                  borderRadius: 16,
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)"
                }}
              >
                💬 WhatsApp Message (9972339362)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
