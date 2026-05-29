import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import {
  generateBaggonaPredictions,
  translateBaggonaPredictions,
  type BaggonaPredictions,
  generatePersonalReading,
  translatePersonalReading,
  type PersonalReadingOutput,
  getComprehensiveKundaliPrediction
} from "../core/BaggonaPredictionEngine";
import type { KundaliPrediction } from "../core/AstroTypes";
import {
  generateJayashreePrediction,
  type JayashreePrediction
} from "../core/JayashreePredictionEngine";
import { useAppStore } from "../stores/appStore";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import AudioPlayerButton from "../components/ui/AudioPlayerButton";

import SouthIndianChart from "../components/kundli/SouthIndianChart";
import { RASHIS, NAKSHATRAS, PlanetName, type PlanetPosition, type KundliOutput } from "../core/AstroTypes";
import { siderealLongitudes } from "../core/EphemerisEngine";
import { degreeToRashi, degreeToNakshatra, degreeToNakshatraPada } from "../core/AstroMath";
import { wallClockBirthToUtc, ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";

type SubTab = "kundali" | "personal" | "jayashree" | "overview" | "planets" | "houses" | "yogas" | "gochara";

const rashiTKey = (sanskrit: string): string => `rashis.${sanskrit.replace(/\s+/g, "")}`;

const getPlanetTransitStatus = (pName: string, house: number, isKn: boolean) => {
  const names: Record<string, { en: string; kn: string }> = {
    Sun: { en: "Sun (Surya)", kn: "ಸೂರ್ಯ (ರವಿ)" },
    Moon: { en: "Moon (Chandra)", kn: "ಚಂದ್ರ" },
    Mars: { en: "Mars (Mangala)", kn: "ಮಂಗಳ" },
    Jupiter: { en: "Jupiter (Guru)", kn: "ಗುರು" },
    Saturn: { en: "Saturn (Shani)", kn: "ಶನಿ" }
  };

  const name = isKn ? names[pName]?.kn : names[pName]?.en;

  if (pName === "Jupiter") {
    const isGood = [2, 5, 7, 9, 11].includes(house);
    const desc = isKn
      ? isGood
        ? `ಗುರು ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಅತ್ಯಂತ ಶುಭ ಫಲಗಳು, ಕಲ್ಯಾಣ ಮತ್ತು ಧನಲಾಭ.`
        : `ಗುರು ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಸಾಮಾನ್ಯ ಪ್ರಗತಿ, ಜಾಗರೂಕತೆ ಇರಲಿ.`
      : isGood
        ? `Jupiter in ${house}th House - Highly Auspicious. Brings growth, wisdom, and financial success.`
        : `Jupiter in ${house}th House - Neutral/Mixed. Normal progress with standard daily efforts.`;
    return { name, house, desc, status: isGood ? "positive" : "neutral" };
  }

  if (pName === "Saturn") {
    const isGood = [3, 6, 11].includes(house);
    const isSadeSati = [12, 1, 2].includes(house);
    const isAshtama = house === 8;
    const isArdhaAshtama = house === 4;

    let desc = "";
    let status: "positive" | "neutral" | "caution" = "neutral";

    if (isGood) {
      status = "positive";
      desc = isKn
        ? `ಶನಿ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು, ಶತ್ರುನಾಶ ಮತ್ತು ಉದ್ಯೋಗ ಸ್ಥಿರತೆ.`
        : `Saturn in ${house}th House - Favorable. Brings career stability, victory over challenges, and long-term gains.`;
    } else if (isSadeSati) {
      status = "caution";
      const phase = house === 12 ? "ಮೊದಲ ಹಂತ (ವ್ಯಯ ಶನಿ)" : house === 1 ? "ಮಧ್ಯ ಹಂತ (ಜನ್ಮ ಶನಿ)" : "ಕೊನೆಯ ಹಂತ (ದ್ವಿತೀಯ ಶನಿ)";
      const phaseEn = house === 12 ? "1st Phase (12th House)" : house === 1 ? "Peak Phase (1st House)" : "3rd Phase (2nd House)";
      desc = isKn
        ? `ಶನಿ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಏಳೂವರೆ ಶನಿಯ ಪ್ರಭಾವ (${phase}). ತಾಳ್ಮೆ ಮತ್ತು ಶ್ರಮ ಅಗತ್ಯ.`
        : `Saturn in ${house}th House - Sade Sati (${phaseEn}). Demands patience, focus on health, and avoiding major risks.`;
    } else if (isAshtama) {
      status = "caution";
      desc = isKn
        ? `ಶನಿ ಗೋಚರದಲ್ಲಿ ೮ನೇ ಮನೆಯಲ್ಲಿದೆ - ಅಷ್ಟಮ ಶನಿಯ ಪ್ರಭಾವ. ಆರೋಗ್ಯದಲ್ಲಿ ಜಾಗರೂಕತೆ ಇರಲಿ, ವಿವಾದಗಳನ್ನು ತಪ್ಪಿಸಿ.`
        : `Saturn in 8th House - Ashtama Shani (Challenging). Take extra care of health and avoid workplace arguments.`;
    } else if (isArdhaAshtama) {
      status = "caution";
      desc = isKn
        ? `ಶನಿ ಗೋಚರದಲ್ಲಿ ೪ನೇ ಮನೆಯಲ್ಲಿದೆ - ಅರ್ಧಾಷ್ಟಮ ಶನಿಯ ಪ್ರಭಾವ. ಗೃಹ ಸುಖದ ಕೊರತೆ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಸಾಧ್ಯತೆ.`
        : `Saturn in 4th House - Ardha-Ashtama Shani. Focus on emotional peace and domestic stability.`;
    } else {
      desc = isKn
        ? `ಶನಿ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಸಾಮಾನ್ಯ ಪ್ರಗತಿ, ವ್ಯವಹಾರದಲ್ಲಿ ಶ್ರದ್ಧೆಯ ಅಗತ್ಯವಿದೆ.`
        : `Saturn in ${house}th House - Neutral. Requires consistent efforts and disciplined daily routine.`;
    }
    return { name, house, desc, status };
  }

  if (pName === "Mars") {
    const isGood = [3, 6, 11].includes(house);
    const desc = isKn
      ? isGood
        ? `ಮಂಗಳ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಧೈರ್ಯ, ಉದ್ಯೋಗದಲ್ಲಿ ಉತ್ಸಾಹ ಮತ್ತು ಶತ್ರುಜಯ.`
        : `ಮಂಗಳ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಕೋಪದ ಹತೋಟಿ ಅತ್ಯಗತ್ಯ, ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ.`
      : isGood
        ? `Mars in ${house}th House - Favorable. High energy, success in competitions, and physical vitality.`
        : `Mars in ${house}th House - Challenging. Guard against impulsive anger, sudden arguments, and driving hazards.`;
    return { name, house, desc, status: isGood ? "positive" : "caution" };
  }

  if (pName === "Sun") {
    const isGood = [3, 6, 10, 11].includes(house);
    const desc = isKn
      ? isGood
        ? `ಸೂರ್ಯ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಗೌರವ ಪ್ರಾಪ್ತಿ, ಕೆಲಸದಲ್ಲಿ ಯಶಸ್ಸು ಮತ್ತು ಉತ್ತಮ ಆರೋಗ್ಯ.`
        : `ಸೂರ್ಯ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಶಾರೀರಿಕ ಆಯಾಸ, ತಲೆನೋವು ಅಥವಾ ಉದ್ಯೋಗದಲ್ಲಿ ವಿಳಂಬ.`
      : isGood
        ? `Sun in ${house}th House - Favorable. Brings recognition, authority, and vitality.`
        : `Sun in ${house}th House - Challenging. Suggestions of fatigue, low vital energy, or minor administrative delays.`;
    return { name, house, desc, status: isGood ? "positive" : "neutral" };
  }

  const isGood = [1, 3, 6, 7, 10, 11].includes(house);
  const desc = isKn
    ? isGood
      ? `ಚಂದ್ರ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಉತ್ತಮ ಭೋಜನ, ಮಾನಸಿಕ ತೃಪ್ತಿ ಮತ್ತು ಸುಖ.`
      : `ಚಂದ್ರ ಗೋಚರದಲ್ಲಿ ${house}ನೇ ಮನೆಯಲ್ಲಿದೆ - ಮಾನಸಿಕ ಚಂಚಲತೆ, ಅನಾವಶ್ಯಕ ಚಿಂತೆ; ತಾಳ್ಮೆ ಇರಲಿ.`
    : isGood
      ? `Moon in ${house}th House - Favorable. Brings emotional comfort, clarity, and happy encounters.`
      : `Moon in ${house}th House - Restless. Indicates emotional sensitivity, overthinking, or mood swings.`;
  return { name, house, desc, status: isGood ? "positive" : "neutral" };
};

export default function BaggonaPredictionsPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const session = useKundliViewerStore((s) => s.session);

  const record = useMemo(() => {
    if (!session) return null;
    return {
      name: session.input.name || "Seeker",
      birthDate: session.birthDateYmd,
      birthTime: session.birthTimeHm,
      latitude: session.input.latitude,
      longitude: session.input.longitude,
      kundliData: session.result,
      gothra: session.input.gothra,
      pincode: session.input.pincode
    };
  }, [session]);

  const [tab, setTab] = useState<SubTab>("kundali");
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [predictions, setPredictions] = useState<BaggonaPredictions | null>(null);
  const [personalReading, setPersonalReading] = useState<PersonalReadingOutput | null>(null);
  const [jayashreeReading, setJayashreeReading] = useState<JayashreePrediction | null>(null);
  const [kundaliPrediction, setKundaliPrediction] = useState<KundaliPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [jayashreeLoading, setJayashreeLoading] = useState<boolean>(false);
  const [jayashreeDataReady, setJayashreeDataReady] = useState<boolean>(false);

  useEffect(() => {
    if (tab === "jayashree" && !jayashreeDataReady) {
      setJayashreeLoading(true);
      const timer = setTimeout(() => {
        setJayashreeLoading(false);
        setJayashreeDataReady(true);
      }, 3500); // 3.5 seconds loading for Jayashree
      return () => clearTimeout(timer);
    }
  }, [tab, jayashreeDataReady]);
  
  const lang = i18n.language.split("-")[0] || "en";
  const isKn = lang === "kn";

  const traditionalData = useMemo(() => {
    if (!record) return null;
    return calculateTraditionalBaggona(
      record.birthDate,
      record.birthTime,
      record.latitude,
      record.longitude,
      ayanamsaModel
    );
  }, [record, ayanamsaModel]);

  const gocharaDays = useMemo(() => {
    if (!record || !traditionalData) return [];

    const days = [];
    const todayObj = new Date();

    for (let i = 0; i < 15; i++) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Calculate Traditional Panchanga at Sunrise for the transit day
      const transitPanchanga = calculateTraditionalBaggona(
        dateStr,
        "12:00",
        record.latitude,
        record.longitude,
        ayanamsaModel
      );

      // Noon UTC for planetary positions
      const noonUtc = wallClockBirthToUtc(dateStr, "12:00", record.latitude, record.longitude);
      const transitLongs = siderealLongitudes(noonUtc, ayanamsaModel);

      // Construct transit KundliOutput
      const transitPlanets: PlanetPosition[] = [
        PlanetName.Sun,
        PlanetName.Moon,
        PlanetName.Mars,
        PlanetName.Mercury,
        PlanetName.Jupiter,
        PlanetName.Venus,
        PlanetName.Saturn,
        PlanetName.Rahu,
        PlanetName.Ketu
      ].map((pName) => {
        const key = pName.toLowerCase() as keyof typeof transitLongs;
        const long = transitLongs[key] as number;
        return {
          name: pName,
          degree: long % 30,
          rashi: degreeToRashi(long),
          nakshatra: degreeToNakshatra(long),
          house: (degreeToRashi(long).index - record.kundliData.moonSign.index + 12) % 12 + 1
        };
      });

      const transitMoonSign = degreeToRashi(transitLongs.moon);
      const transitSunSign = degreeToRashi(transitLongs.sun);
      const transitMoonPada = degreeToNakshatraPada(transitLongs.moon);

      const transitKundli: KundliOutput = {
        ascendant: record.kundliData.ascendant,
        planets: transitPlanets,
        houses: record.kundliData.houses,
        moonSign: transitMoonSign,
        sunSign: transitSunSign,
        lagnaRashi: record.kundliData.moonSign, // Set Moon sign as Lagna for correct clockwise counting
        moonPada: transitMoonPada
      };

      // House transits relative to natal Moon sign (Chandra Lagna)
      const birthMoonIdx = record.kundliData.moonSign.index;
      const planetTransitHouses = {
        sun: (degreeToRashi(transitLongs.sun).index - birthMoonIdx + 12) % 12 + 1,
        moon: (degreeToRashi(transitLongs.moon).index - birthMoonIdx + 12) % 12 + 1,
        mars: (degreeToRashi(transitLongs.mars).index - birthMoonIdx + 12) % 12 + 1,
        jup: (degreeToRashi(transitLongs.jupiter).index - birthMoonIdx + 12) % 12 + 1,
        sat: (degreeToRashi(transitLongs.saturn).index - birthMoonIdx + 12) % 12 + 1
      };

      // Running Dasha & Bhukti at this transit day's UTC time
      const transitAge = ageDecimalYearsAt(
        record.birthDate,
        record.birthTime,
        record.latitude,
        record.longitude,
        noonUtc
      );
      const activeDb = findBhuktiAtAge(record.kundliData, transitAge);

      days.push({
        date: dateStr,
        weekday: transitPanchanga.weekday,
        weekdayKn: transitPanchanga.weekdayKn,
        tithi: transitPanchanga.tithi,
        tithiKn: transitPanchanga.tithiKn,
        nakshatra: transitPanchanga.moonNakshatra,
        nakshatraKn: transitPanchanga.moonNakshatraKn,
        sunrise: transitPanchanga.sunrise,
        sunset: transitPanchanga.sunset,
        kundli: transitKundli,
        planetHouses: planetTransitHouses,
        dashaLord: activeDb ? activeDb.maha.planet : null,
        bhuktiLord: activeDb ? activeDb.bhukti : null,
        tithiEndTime: transitPanchanga.tithiEndTime,
        tithiNext: transitPanchanga.tithiNext,
        tithiNextKn: transitPanchanga.tithiNextKn
      });
    }

    return days;
  }, [record, traditionalData, ayanamsaModel]);

  useEffect(() => {
    if (!record || !traditionalData) {
      setPredictions(null);
      setPersonalReading(null);
      setJayashreeReading(null);
      setKundaliPrediction(null);
      return;
    }

    let cancelled = false;
    const computeAndTranslate = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const basePreds = generateBaggonaPredictions(record.kundliData, traditionalData, lang, record);
        const basePersonal = generatePersonalReading(record.kundliData, record, lang);
        const jayashree = await generateJayashreePrediction(record.kundliData, record, lang);
        const baseKundali = await getComprehensiveKundaliPrediction(record.kundliData, gocharaDays[0]?.kundli, lang);

        if (lang !== "en") {
          const [translatedPreds, translatedPersonal] = await Promise.all([
            translateBaggonaPredictions(basePreds, lang),
            translatePersonalReading(basePersonal, lang)
          ]);
          if (!cancelled) {
            setPredictions(translatedPreds);
            setPersonalReading(translatedPersonal);
            setJayashreeReading(jayashree);
            setKundaliPrediction(baseKundali);
          }
        } else {
          if (!cancelled) {
            setPredictions(basePreds);
            setPersonalReading(basePersonal);
            setJayashreeReading(jayashree);
            setKundaliPrediction(baseKundali);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void computeAndTranslate();

    return () => {
      cancelled = true;
    };
  }, [record, traditionalData, lang]);



  if (record === undefined) {
    return (
      <Card>
        <GrahaSpinner />
      </Card>
    );
  }

  if (!record || !traditionalData) {
    return (
      <Card>
        <p className="font-semibold text-indigo-950 text-base">
          {isKn ? "ಕುಂಡಲಿ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ" : "No Birth Chart Data Found"}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {isKn 
            ? "ಭಾಗ್ಗೋಣ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಹುಟ್ಟಿದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ." 
            : "Please enter your birth details and generate a chart first to view your traditional predictions."}
        </p>
        <button
          type="button"
          className="jk-btn mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md shadow-amber-500/10 active:scale-95"
          onClick={() => setPage("kundli")}
        >
          {isKn ? "ಕುಂಡಲಿಗೆ ಹೋಗಿ" : "Go to Birth Chart"}
        </button>
      </Card>
    );
  }

  const getTabLabel = (id: SubTab): string => {
    switch (id) {
      case "kundali":
        if (lang === "kn") return "ಜನ್ಮ ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ";
        if (lang === "hi") return "जन्म कुण्डली विश्लेषण";
        if (lang === "ta") return "ஜன்ம குண்டலி";
        if (lang === "te") return "జన్మ కుండలి";
        return "Janma Kundali";
      case "personal":
        if (lang === "kn") return "ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯ";
        if (lang === "hi") return "व्यक्तिगत फल";
        if (lang === "ta") return "தனிப்பட்ட பலன்கள்";
        if (lang === "te") return "వ్యక్తిగత ఫలితాలు";
        return "Personal Reading";
      case "overview":
        if (lang === "kn") return "ಮುಖ್ಯಾಂಶಗಳು";
        if (lang === "hi") return "अवलोकन";
        if (lang === "ta") return "கண்ணோட்டம்";
        if (lang === "te") return "అవలోకనం";
        return "Overview";
      case "planets":
        if (lang === "kn") return "ಗ್ರಹ ಬಲಗಳು";
        if (lang === "hi") return "ग्रह बल";
        if (lang === "ta") return "கிரக பலன்கள்";
        if (lang === "te") return "ग्रह बलाలు";
        return "Planets";
      case "houses":
        if (lang === "kn") return "ದ್ವಾದಶ ಭಾವಗಳು";
        if (lang === "hi") return "12 भाव";
        if (lang === "ta") return "12 பாவங்கள்";
        if (lang === "te") return "12 భావాలు";
        return "12 Houses";
      case "yogas":
        if (lang === "kn") return "ಯೋಗ, ದೋಷ & ಆಯುಷ್ಯ";
        if (lang === "hi") return "योग, दोष और आयु";
        if (lang === "ta") return "யோகம், தோஷம் & ஆயுள்";
        if (lang === "te") return "యోగం, దోషం & ಆಯುಷ್షు";
        return "Yogas, Doshas & Ayush";
      case "gochara":
        if (lang === "kn") return "೧೫ ದಿನಗಳ ಗೋಚಾರ";
        if (lang === "hi") return "15 दिवसीय गोचर";
        if (lang === "ta") return "15 நாள் கோச்சாரம்";
        if (lang === "te") return "15 రోజుల గోచారం";
        return "15-Day Gochara";
      case "jayashree":
        return t("predictions.jayashree");
    }
  };

  const sectionTitleProfile =
    lang === "kn" ? "ನಿಮ್ಮ ಕಾಸ್ಮಿಕ್ ಪ್ರೊಫೈಲ್ (ವಿವರಣೆ)" :
    lang === "hi" ? "आपका कॉस्मिक प्रोफाइल (विवरण)" :
    lang === "ta" ? "உங்கள் காஸ்மிக் சுயவிவரம்" :
    lang === "te" ? "మీ కాಸ್మిక్ ప్రొఫైల్" :
    "Your Cosmic Profile";

  const sectionTitleTransit =
    lang === "kn" ? "ಇಂದಿನ ಗ್ರಹ ಸಂಚಾರ (ಗೋಚಾರ)" :
    lang === "hi" ? "आज का गोचर विवरण" :
    lang === "ta" ? "இன்றைய கோச்சாரம்" :
    lang === "te" ? "నేటి கிரக ಸంచారం (గోచారం)" :
    "What's Happening Today (Current Transits)";

  const sectionTitleChapter =
    lang === "kn" ? "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜೀವನದ ಅಧ್ಯಾಯ (ದಶಾ ಭುಕ್ತಿ)" :
    lang === "hi" ? "आपका वर्तमान जीवन अध्याय" :
    lang === "ta" ? "உங்கள் தற்போதைய வாழ்க்கை அத்தியாயம்" :
    lang === "te" ? "మీ ప్రస్తుత జీవిత అధ్యాయం (దశా భుక్తి)" :
    "Your Current Life Chapter (Running Dasha-Bhukthi)";

  const activeUntilLabel =
    lang === "kn" ? "ಅಲ್ಲಿಯವರೆಗೆ ಸಕ್ರಿಯ" :
    lang === "hi" ? "तब तक सक्रिय" :
    lang === "ta" ? "அதுவரை செயல்படும்" :
    lang === "te" ? "అప్పటి వరకు క్రియాశీలం" :
    "Active Until";

  const upcomingTitle =
    lang === "kn" ? "ನಿಮ್ಮ ಮುಂದಿನ ಜೀವನದ ಅಧ್ಯಾಯಗಳು (ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳು)" :
    lang === "hi" ? "आपके आगामी जीवन के अध्याय (अगले 2 भुक्ति)" :
    lang === "ta" ? "உங்கள் வரவிருக்கும் வாழ்க்கை அத்தியாயங்கள் (அடுத்த 2 புக்தி)" :
    lang === "te" ? "మీ రాబోయే జీవిత అధ్యాయాలు (తదుపరి 2 భుక్తులు)" :
    "Your Upcoming Life Chapters (Next 2 Sub-periods)";

  const subTabs: { id: SubTab; label: string; icon: string }[] = [
    { id: "kundali", label: getTabLabel("kundali"), icon: "🕉️" },
    { id: "personal", label: getTabLabel("personal"), icon: "✨" },
    { id: "jayashree", label: getTabLabel("jayashree"), icon: "🎙️" },
    { id: "overview", label: getTabLabel("overview"), icon: "✵" },
    { id: "planets", label: getTabLabel("planets"), icon: "🪐" },
    { id: "houses", label: getTabLabel("houses"), icon: "☸" },
    { id: "yogas", label: getTabLabel("yogas"), icon: "📜" },
    { id: "gochara", label: getTabLabel("gochara"), icon: "📅" }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/80 p-5 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-xl" />
        <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl" />
        
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            {isKn ? "ಸಾಂಪ್ರದಾಯಿಕ ಭಾಗ್ಗೋಣ ಭವಿಷ್ಯ" : "Traditional Baggona Predictions"}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {isKn ? `${record.name} ಅವರ ಜನ್ಮಕುಂಡಲಿ ಭವಿಷ್ಯ` : `Vedic Astrology Readings for ${record.name}`}
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            {isKn 
              ? "ಹಸ್ತಪ್ರತಿಯ ನಿಯಮಗಳು ಮತ್ತು ಗ್ರಹಗಳ ಗುಣಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ಭವಿಷ್ಯ" 
              : "Astrological predictions generated using rules from the ancient handwritten manual."}
          </p>
          
          {/* Metadata Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಹುಟ್ಟಿದ ದಿನ" : "Birth Date"}</p>
              <p className="mt-0.5 font-bold text-white">{record.birthDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಹುಟ್ಟಿದ ಸಮಯ" : "Birth Time"}</p>
              <p className="mt-0.5 font-bold text-white">{record.birthTime}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ಸಂವತ್ಸರ" : "Samvatsara"}</p>
              <p className="mt-0.5 font-bold text-amber-300">{isKn ? traditionalData.samvatsaraKn : traditionalData.samvatsara}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">{isKn ? "ನಕ್ಷತ್ರ" : "Nakshatra"}</p>
              <p className="mt-0.5 font-bold text-amber-300">{isKn ? traditionalData.moonNakshatraKn : traditionalData.moonNakshatra}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex overflow-x-auto rounded-xl border border-amber-500/10 bg-amber-500/5 p-1 shadow-inner backdrop-blur-sm">
        {subTabs.map((st) => (
          <button
            key={st.id}
            type="button"
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
              tab === st.id
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
                : "text-indigo-950 hover:bg-amber-500/10"
            }`}
            onClick={() => setTab(st.id)}
          >
            <span>{st.icon}</span>
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 shadow-sm animate-fade-in">
          <p className="font-semibold">{isKn ? "ದೋಷ ಉಂಟಾಗಿದೆ" : "Failed to Load Predictions"}</p>
          <p className="mt-1 text-xs text-rose-800">{loadError}</p>
        </div>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center py-12">
          <GrahaSpinner />
          <p className="mt-4 text-xs font-semibold text-indigo-950 animate-pulse">
            {isKn ? "ಪಂಚಾಂಗ ನಿಯಮಗಳನ್ನು ಅನ್ವಯಿಸಲಾಗುತ್ತಿದೆ..." : "Applying traditional Vedic rules..."}
          </p>
        </Card>
      )}

      {!loading && predictions && (
        <div className="space-y-4 animate-fade-in">
          {tab === "kundali" && kundaliPrediction && (
            <div className="space-y-6">
              {/* Lagna Phal */}
              <div className="rounded-2xl border border-indigo-100/80 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                  <span>✨</span> {isKn ? "ಲಗ್ನ ಫಲ" : "Lagna Phal"}
                </h4>
                <p className="mt-2 text-xs font-bold text-indigo-800">{kundaliPrediction.lagnaAnalysis.description}</p>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">{isKn ? "ಶುಭ ಗ್ರಹಗಳು" : "Benefic Planets"}</p>
                    <ul className="mt-1 space-y-1 text-xs text-emerald-900">
                      {kundaliPrediction.lagnaAnalysis.benefics.map((b, i) => <li key={i}>• {b}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
                    <p className="text-[10px] uppercase font-bold text-rose-800">{isKn ? "ಅಶುಭ ಗ್ರಹಗಳು" : "Malefic Planets"}</p>
                    <ul className="mt-1 space-y-1 text-xs text-rose-900">
                      {kundaliPrediction.lagnaAnalysis.malefics.map((m, i) => <li key={i}>• {m}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Yogas & Doshas */}
              <div className="rounded-2xl border border-amber-100/80 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                  <span>📜</span> {isKn ? "ಯೋಗಗಳು ಮತ್ತು ದೋಷಗಳು" : "Yogas & Doshas"}
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-amber-50 p-3 border border-amber-100">
                    <p className="text-[10px] uppercase font-bold text-amber-800">{isKn ? "ಯೋಗಗಳು" : "Yogas"}</p>
                    {kundaliPrediction.yogasAndDoshas.yogas.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-xs text-amber-900">
                        {kundaliPrediction.yogasAndDoshas.yogas.map((y, i) => <li key={i}>• {y}</li>)}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-amber-700">{isKn ? "ಯಾವುದೇ ಪ್ರಮುಖ ಯೋಗಗಳಿಲ್ಲ." : "No major yogas found."}</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3 border border-rose-100">
                    <p className="text-[10px] uppercase font-bold text-rose-800">{isKn ? "ದೋಷಗಳು" : "Doshas"}</p>
                    {kundaliPrediction.yogasAndDoshas.doshas.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-xs text-rose-900">
                        {kundaliPrediction.yogasAndDoshas.doshas.map((d, i) => <li key={i}>• {d}</li>)}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-emerald-700">{isKn ? "ಯಾವುದೇ ದೋಷಗಳಿಲ್ಲ." : "No doshas found."}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Career & Saturn */}
              <div className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                  <span>💼</span> {isKn ? "ವೃತ್ತಿ ಮತ್ತು ಕರ್ಮ (ಶನಿಯ ಪ್ರಭಾವ)" : "Career & Karma (Saturn's Influence)"}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">{kundaliPrediction.careerSaturn}</p>
                {kundaliPrediction.saturnConjunctions.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-800">{isKn ? "ಶನಿಯ ಯುತಿಗಳು" : "Saturn Conjunctions"}</p>
                    <ul className="mt-1 space-y-1 text-xs text-slate-700">
                      {kundaliPrediction.saturnConjunctions.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                )}
                <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-800">{isKn ? "ಶನಿಯ ದೃಷ್ಟಿ (ವಿಳಂಬಗಳು)" : "Saturn Aspects (Delays)"}</p>
                  <ul className="mt-1 space-y-1 text-xs text-slate-700">
                    {kundaliPrediction.saturnAspects.map((a, i) => <li key={i}>• {a}</li>)}
                  </ul>
                  {kundaliPrediction.vipareetaShani && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">⭐ {kundaliPrediction.vipareetaShani}</p>
                  )}
                </div>
              </div>

              {/* Health & Transits */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-rose-100/80 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                    <span>🩺</span> {isKn ? "ರೋಗ ವಿಚಾರ" : "Health (Roga Vichara)"}
                  </h4>
                  {kundaliPrediction.healthVichara.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-xs text-slate-700">
                      {kundaliPrediction.healthVichara.map((h, i) => <li key={i}>• {h}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600">{isKn ? "ಯಾವುದೇ ಪ್ರಮುಖ ಗ್ರಹ ದೋಷಗಳಿಲ್ಲ." : "No major health warnings based on 6, 8, 12 placements."}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-purple-100/80 bg-white p-5 shadow-sm">
                  <h4 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                    <span>⚠️</span> {isKn ? "ಗೋಚಾರ ಎಚ್ಚರಿಕೆಗಳು" : "Transit Alerts"}
                  </h4>
                  {kundaliPrediction.gocharaAlerts.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-xs text-rose-700 font-medium">
                      {kundaliPrediction.gocharaAlerts.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-emerald-700 font-medium">{isKn ? "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಕಠಿಣ ಗೋಚಾರ ದೋಷಗಳಿಲ್ಲ." : "No harsh transit warnings at the moment."}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "personal" && personalReading && (
            <div className="space-y-6">
              {/* Summary Section */}
              {personalReading.monthlySummary && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 px-5 py-4 border border-indigo-500/20 text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-6 -mr-6 h-20 w-20 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-indigo-200">
                      <span>📊</span> {isKn ? "ಸಾರಾಂಶ (ಈ ತಿಂಗಳು ಮತ್ತು ಮುಂದಿನ ತಿಂಗಳ ಭವಿಷ್ಯ)" : "Summary (This Month & Next Month Prediction)"}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-indigo-100/90 text-justify">
                      {isKn
                        ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ (Natal Chart) ಮತ್ತು ಪ್ರಸ್ತುತ ಸಂಚರಿಸುವ ಗೋಚಾರ ಕುಂಡಲಿ (Transit Chart) ಎರಡನ್ನೂ ಸಮಗ್ರವಾಗಿ ಜೋಡಿಸಿ ಈ ಸಾರಾಂಶವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಇದು ಈ ತಿಂಗಳು ಮತ್ತು ಮುಂದಿನ ತಿಂಗಳ ಮುಖ್ಯ ವಿದ್ಯಮಾನಗಳನ್ನು ಸಂಶ್ಲೇಷಿಸುತ್ತದೆ."
                        : "This dynamic summary blends your birth chart (Janma Kundali) with the current transits (Gochara Kundali) to offer a precise and synthesized roadmap for this month and next month."}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {personalReading.monthlySummary.map((sec, i) => (
                      <div
                        key={`monthly-summary-${i}`}
                        className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/20 p-5 shadow-sm transition-all hover:shadow-md dark:from-indigo-950/10 dark:via-slate-900/30 dark:to-amber-950/5"
                      >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-indigo-500/5 blur-lg" />
                        <div className="flex items-start gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-600">
                            📅
                          </span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80">
                              {isKn ? "ಮಾಸಿಕ ಸಾರಾಂಶ" : "Monthly Summary"}
                            </span>
                            <h3 className="mt-0.5 text-base font-extrabold text-indigo-950">
                              {sec.title}
                            </h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-700 md:text-sm text-justify whitespace-pre-line">
                              {sec.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Cosmic Profile */}
              {personalReading.cosmicProfile.map((sec, i) => (
                <div
                  key={`cosmic-${i}`}
                  className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/20 p-5 shadow-sm transition-all hover:shadow-md dark:from-indigo-950/10 dark:via-slate-900/30 dark:to-amber-950/5"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-indigo-500/5 blur-lg" />
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-600">
                      ✨
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80">
                        {sectionTitleProfile}
                      </span>
                      <h3 className="mt-0.5 text-base font-extrabold text-indigo-950">
                        {sec.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* 2. Today's Transits */}
              {personalReading.todaysTransits.map((sec, i) => (
                <div
                  key={`transit-${i}`}
                  className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 p-5 shadow-sm transition-all hover:shadow-md dark:from-amber-950/10 dark:via-slate-900/30 dark:to-orange-950/5"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-amber-500/5 blur-lg" />
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600">
                      🪐
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        {sectionTitleTransit}
                      </span>
                      <h3 className="mt-0.5 text-base font-extrabold text-indigo-950">
                        {sec.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* 3. Current Life Chapter */}
              <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 p-5 shadow-sm transition-all hover:shadow-md dark:from-purple-950/10 dark:via-slate-900/30 dark:to-indigo-950/5">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-purple-500/5 blur-lg" />
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-xl text-purple-600">
                    ⏳
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                        {sectionTitleChapter}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                        {activeUntilLabel}: {personalReading.currentLifeChapter.activeUntilAge}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-extrabold text-indigo-950">
                      {personalReading.currentLifeChapter.cycle}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                      {personalReading.currentLifeChapter.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Upcoming Chapters */}
              <div className="space-y-3">
                <div className="rounded-xl bg-indigo-50/40 px-4 py-2 border border-indigo-100/50">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    {upcomingTitle}
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-900/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        {lang === "kn" ? "ಮುಂದಿನ ಹಂತ ೧" : "Next Phase 1"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {personalReading.upcomingChapters.chapter1.ages}
                      </span>
                    </div>
                    <h5 className="mt-2 text-sm font-bold text-indigo-950">
                      {personalReading.upcomingChapters.chapter1.cycle}
                    </h5>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 text-justify">
                      {personalReading.upcomingChapters.chapter1.description}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-900/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block rounded-lg bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        {lang === "kn" ? "ಮುಂದಿನ ಹಂತ ೨" : "Next Phase 2"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {personalReading.upcomingChapters.chapter2.ages}
                      </span>
                    </div>
                    <h5 className="mt-2 text-sm font-bold text-indigo-950">
                      {personalReading.upcomingChapters.chapter2.cycle}
                    </h5>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 text-justify">
                      {personalReading.upcomingChapters.chapter2.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "jayashree" && jayashreeLoading && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-indigo-900/20 shadow-inner">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-indigo-950">
                {isKn ? "ಜಯಶ್ರೀ ಪಂಡಿತ್ ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ..." : "Jayashree Pandit is analyzing your Kundali..."}
              </h3>
              <p className="max-w-md text-sm text-slate-600">
                {isKn 
                  ? "ಕಳೆದ ೬೦ ವರ್ಷಗಳಿಂದ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಅಪಾರ ಅನುಭವ ಹೊಂದಿರುವ ಜಯಶ್ರೀಯವರು, ನಿಮ್ಮ ಗ್ರಹಗತಿಗಳ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ ಮಾಡುತ್ತಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ." 
                  : "With over 60 years of profound experience in Jyotishya, Jayashree is currently reading your planetary positions. Please wait."}
              </p>
            </div>
          )}

          {tab === "jayashree" && !jayashreeLoading && jayashreeDataReady && jayashreeReading && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Jayashree's voice intro */}
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
                <div className="absolute right-0 top-0 -mt-8 -mr-8 h-28 w-28 rounded-full bg-amber-500/10 blur-xl" />
                <div className="relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                      🎙️ {t("predictions.jayashree")}
                    </span>
                    <AudioPlayerButton text={`${jayashreeReading.intro} ${jayashreeReading.dashaContext}`} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" className="text-amber-300 hover:bg-amber-500/20 hover:text-white" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200 text-justify">
                    {jayashreeReading.intro}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-300 font-bold">
                    {jayashreeReading.dashaContext}
                  </p>
                </div>
              </div>

              {/* Reading Sections */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Education */}
                <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">
                      🎓
                    </span>
                    <h4 className="flex-1 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      {isKn ? "ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಶಿಕ್ಷಣ" : "Education & Academic Prospects"}
                    </h4>
                    <AudioPlayerButton text={jayashreeReading.education} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {jayashreeReading.education}
                  </p>
                </div>

                {/* Career */}
                <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-sm">
                      💼
                    </span>
                    <h4 className="flex-1 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      {isKn ? "ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿಜೀವನ" : "Career & Employment Opportunities"}
                    </h4>
                    <AudioPlayerButton text={jayashreeReading.career} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {jayashreeReading.career}
                  </p>
                </div>

                {/* Health */}
                <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 text-sm">
                      🩺
                    </span>
                    <h4 className="flex-1 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      {isKn ? "ಆರೋಗ್ಯ ಮತ್ತು ದೈಹಿಕ ಸ್ಥಿತಿ" : "Health & Well-being"}
                    </h4>
                    <AudioPlayerButton text={jayashreeReading.health} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {jayashreeReading.health}
                  </p>
                </div>

                {/* Finance */}
                <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-sm">
                      💰
                    </span>
                    <h4 className="flex-1 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      {isKn ? "ಹಣಕಾಸು ಮತ್ತು ಸಂಪತ್ತು" : "Finance & Wealth Management"}
                    </h4>
                    <AudioPlayerButton text={jayashreeReading.finance} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {jayashreeReading.finance}
                  </p>
                </div>

                {/* Housing */}
                <div className="rounded-2xl border border-amber-500/10 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/20 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 text-sm">
                      🏠
                    </span>
                    <h4 className="flex-1 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      {isKn ? "ಗೃಹ ಮತ್ತು ವಾಸಸ್ಥಳ" : "Housing & Residence"}
                    </h4>
                    <AudioPlayerButton text={jayashreeReading.housing} lang={isKn ? "kn-IN" : "en-IN"} voiceType="jayashree" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 text-justify">
                    {jayashreeReading.housing}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "overview" && (
            <div className="space-y-4">
              {predictions.overview.map((sec, i) => (
                <div
                  key={`overview-${i}`}
                  className="group rounded-2xl border border-amber-500/10 bg-white p-4 shadow-sm transition-all hover:border-amber-500/20 hover:shadow-md"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                    <span className="text-amber-500">✵</span> {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "planets" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {predictions.planets.map((sec, i) => {
                let cardColor = "border-amber-200 bg-amber-50/15";
                let badgeColor = "bg-amber-100 text-amber-800";
                if (sec.status === "positive") {
                  cardColor = "border-emerald-200 bg-emerald-50/15";
                  badgeColor = "bg-emerald-100 text-emerald-800";
                } else if (sec.status === "caution") {
                  cardColor = "border-rose-200 bg-rose-50/15";
                  badgeColor = "bg-rose-100 text-rose-800";
                }

                return (
                  <div
                    key={`planet-${i}`}
                    className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${cardColor}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-xs">
                          🪐
                        </span>
                        {sec.title}
                      </h3>
                      {sec.score !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {isKn ? `ಬಲ: ${sec.score}/100` : `Strength: ${sec.score}/100`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 md:text-sm text-justify">
                      {sec.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "houses" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50/50 p-3 text-center border border-amber-500/15">
                <p className="text-[11px] font-semibold text-amber-950 uppercase tracking-wide">
                  {isKn ? "ದ್ವಾದಶ ಭಾವ ಫಲಗಳು" : "12 House Significations & Occupants"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {predictions.houses.map((sec, i) => {
                  let cardColor = "border-amber-200 bg-amber-50/15";
                  let badgeColor = "bg-amber-100 text-amber-800";
                  if (sec.status === "positive") {
                    cardColor = "border-emerald-200 bg-emerald-50/15";
                    badgeColor = "bg-emerald-100 text-emerald-800";
                  } else if (sec.status === "caution") {
                    cardColor = "border-rose-200 bg-rose-50/15";
                    badgeColor = "bg-rose-100 text-rose-800";
                  }

                  return (
                    <div
                      key={`house-${i}`}
                      className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${cardColor}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3 pb-1.5 border-b border-black/5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-[10px] font-bold text-white">
                              {i + 1}
                            </span>
                            <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                              {sec.title}
                            </h3>
                          </div>
                          {sec.score !== undefined && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {isKn ? `ಬಲ: ${sec.score}/100` : `Strength: ${sec.score}/100`}
                            </span>
                          )}
                        </div>

                        <p className="text-xs leading-relaxed text-slate-700 md:text-sm text-justify mb-3">
                          {sec.description}
                        </p>

                        <div className="space-y-2 mt-3 pt-3 border-t border-dashed border-black/10">
                          {sec.whatIsGood && (
                            <div className="text-xs">
                              <span className="font-bold text-emerald-800">{isKn ? "✨ ಸಕಾರಾತ್ಮಮ ಅಂಶಗಳು: " : "✨ Positive Influences: "}</span>
                              <span className="text-slate-700">{sec.whatIsGood}</span>
                            </div>
                          )}

                          {sec.whatIsWrong && (
                            <div className="text-xs">
                              <span className="font-bold text-rose-800">{isKn ? "⚠️ ಸವಾಲುಗಳು/ಅಡೆತಡೆಗಳು: " : "⚠️ Potential Challenges: "}</span>
                              <span className="text-slate-700">{sec.whatIsWrong}</span>
                            </div>
                          )}

                          {sec.worstPlanet && (
                            <div className="text-xs">
                              <span className="font-bold text-rose-900">{isKn ? "🪐 ಪೀಡಿತ ಗ್ರಹ: " : "🪐 Afflicted Graha: "}</span>
                              <span className="text-rose-950 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/50 inline-block mt-0.5">{sec.worstPlanet}</span>
                            </div>
                          )}

                          {sec.remedy && (
                            <div className="text-xs bg-indigo-50/50 border border-indigo-100 rounded-lg p-2 mt-2">
                              <span className="font-bold text-indigo-900">{isKn ? "📿 ಪರಿಹಾರ/ಆರಾಧನೆ: " : "📿 Remedy & Advice: "}</span>
                              <span className="text-indigo-950 font-medium text-[11px] block mt-0.5">{sec.remedy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "yogas" && (
            <div className="space-y-4">
              {/* Yogas Section */}
              <div className="rounded-xl bg-amber-50/50 p-2 text-center border border-amber-500/15">
                <p className="text-[11px] font-semibold text-amber-950 uppercase tracking-wide">
                  {isKn ? "ಜಾತಕದಲ್ಲಿನ ಯೋಗಗಳು" : "Auspicious Yogas in Chart"}
                </p>
              </div>
              {predictions.yogas.map((sec, i) => (
                <div
                  key={`yoga-${i}`}
                  className="rounded-2xl border-2 border-double border-amber-500/25 bg-amber-50/10 p-4 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    📜 {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-800 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}

              {/* Doshas Section */}
              <div className="rounded-xl bg-rose-50/50 p-2 text-center border border-rose-500/15 mt-6">
                <p className="text-[11px] font-semibold text-rose-950 uppercase tracking-wide">
                  {isKn ? "ದೋಷಗಳ ವಿಶ್ಲೇಷಣೆ (ಕುಜ ಮತ್ತು ಶನಿ ದೋಷ)" : "Dosha Evaluation (Kuja & Shani)"}
                </p>
              </div>
              {predictions.doshas && predictions.doshas.map((sec, i) => {
                let cardColor = "border-amber-200 bg-amber-50/15";
                let badgeColor = "bg-amber-100 text-amber-800";
                if (sec.status === "positive") {
                  cardColor = "border-emerald-200 bg-emerald-50/15";
                  badgeColor = "bg-emerald-100 text-emerald-800";
                } else if (sec.status === "caution") {
                  cardColor = "border-rose-200 bg-rose-50/15";
                  badgeColor = "bg-rose-100 text-rose-800";
                }

                return (
                  <div
                    key={`dosha-${i}`}
                    className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${cardColor}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-black/5">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                        <span>{sec.status === "caution" ? "⚠️" : "✨"}</span> {sec.title}
                      </h3>
                      {sec.score !== undefined && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {isKn ? `ಅಂಕ: ${sec.score}/100` : `Score: ${sec.score}/100`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-800 md:text-sm text-justify">
                      {sec.description}
                    </p>
                    {sec.whatIsWrong && sec.status === "caution" && (
                      <div className="mt-2 text-xs">
                        <span className="font-bold text-rose-800">{isKn ? "ತೊಂದರೆಗಳು: " : "Afflictions: "}</span>
                        <span className="text-slate-700">{sec.whatIsWrong}</span>
                      </div>
                    )}
                    {sec.remedy && sec.status === "caution" && (
                      <div className="mt-2 text-xs bg-indigo-50/50 border border-indigo-100 rounded-lg p-2">
                        <span className="font-bold text-indigo-900">{isKn ? "ಪರಿಹಾರ: " : "Remedy: "}</span>
                        <span className="text-indigo-950 font-medium block mt-0.5">{sec.remedy}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Longevity Section */}
              <div className="rounded-xl bg-emerald-50/50 p-2 text-center border border-emerald-500/15 mt-6">
                <p className="text-[11px] font-semibold text-emerald-950 uppercase tracking-wide">
                  {isKn ? "ಆಯುಷ್ಯ ವಿಶ್ಲೇಷಣೆ" : "Ayush (Longevity) Evaluation"}
                </p>
              </div>
              {predictions.longevity.map((sec, i) => (
                <div
                  key={`longevity-${i}`}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-50/10 p-4 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    💚 {sec.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-800 md:text-sm text-justify">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === "gochara" && (
            <div className="space-y-6">
              {/* Horizontal Date Picker */}
              <div className="rounded-xl border border-amber-500/10 bg-amber-50/10 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-sm font-bold text-indigo-950 mb-3 flex items-center gap-2">
                  <span>📅</span>
                  {isKn ? "೧೫ ದಿನಗಳ ದೈನಂದಿನ ಗ್ರಹ ಸಂಚಾರ ವಿವರಗಳು" : "15-Day Daily Transit Calendar (Gochara)"}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500">
                  {gocharaDays.map((day, idx) => {
                    const isSelected = selectedDayIdx === idx;
                    const dateObj = new Date(day.date);
                    const formattedDate = dateObj.toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
                      month: "short",
                      day: "numeric"
                    });
                    const dayLabel = isKn ? `ದಿನ ${idx + 1}` : `Day ${idx + 1}`;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`flex flex-col items-center justify-center shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600 text-white shadow-md scale-95"
                            : "bg-white border-slate-200 text-indigo-950 hover:bg-amber-500/10"
                        }`}
                      >
                        <span className="opacity-80 text-[10px]">{dayLabel}</span>
                        <span className="text-sm mt-0.5">{formattedDate}</span>
                        <span className="text-[9px] mt-0.5 opacity-90">
                          {isKn ? day.weekdayKn.split(" ")[0] : day.weekday.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Details Grid */}
              {gocharaDays[selectedDayIdx] && (() => {
                const day = gocharaDays[selectedDayIdx];
                const planetsToEvaluate = ["Jupiter", "Saturn", "Mars", "Sun", "Moon"];
                return (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Panel: Chart & Panchanga */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Daily Panchanga Info */}
                      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                          {isKn ? "ಪಂಚಾಂಗ ವಿವರಗಳು" : "Panchanga Details"}
                        </h4>
                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">{isKn ? "ದಿನಾಂಕ" : "Date"}:</span>
                            <span className="font-bold text-indigo-950">{day.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">{isKn ? "ವಾರ" : "Weekday"}:</span>
                            <span className="font-bold text-indigo-950">{isKn ? day.weekdayKn : day.weekday}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 border-b border-slate-100/50 pb-1.5">
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-500">{isKn ? "ತಿಥಿ (ಸೂರ್ಯೋದಯಕ್ಕೆ)" : "Tithi (at Sunrise)"}:</span>
                              <span className="font-bold text-amber-700">{isKn ? day.tithiKn : day.tithi}</span>
                            </div>
                            {day.tithiEndTime && day.tithiNext && (
                              <div className="text-[10px] text-right text-slate-500 font-medium italic">
                                {isKn
                                  ? `(${day.tithiEndTime} ರವರೆಗೆ, ನಂತರ ಉಪರಿ ${day.tithiNextKn})`
                                  : `(up to ${day.tithiEndTime}, then Upari ${day.tithiNext})`}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">{isKn ? "ನಕ್ಷತ್ರ (ಸೂರ್ಯೋದಯಕ್ಕೆ)" : "Nakshatra (at Sunrise)"}:</span>
                            <span className="font-bold text-amber-700">{isKn ? day.nakshatraKn : day.nakshatra}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-100">
                            <span className="font-semibold text-slate-500">{isKn ? "ಸೂರ್ಯೋದಯ" : "Sunrise"}:</span>
                            <span className="font-bold text-slate-800">☀️ {day.sunrise}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">{isKn ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset"}:</span>
                            <span className="font-bold text-slate-800">🌙 {day.sunset}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gochara Kundli Chart */}
                      <div className="rounded-2xl border border-amber-500/15 bg-white p-4 shadow-sm flex flex-col items-center">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4">
                          {isKn ? "ಗೋಚಾರ ಕುಂಡಲಿ (ಸಂಚಾರ)" : "Gochara Transit Kundli"}
                        </h4>
                        <SouthIndianChart
                          kundli={day.kundli}
                          personName={isKn ? "ಗೋಚಾರ ಸಂಚಾರ" : "Transit Chart"}
                          gothra={record.gothra}
                        />
                        <p className="mt-3 text-[10px] text-slate-500 text-center">
                          {isKn 
                            ? "* ಲಗ್ನ (ಲ) ಸ್ಥಾನವನ್ನು ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರ ರಾಶಿ (ಚಂದ್ರ ಲಗ್ನ) ಎಂದು ಪರಿಗಣಿಸಿ, ಭಾವಗಳನ್ನು ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ (clockwise) ತೋರಿಸಲಾಗಿದೆ."
                            : "* The Moon sign (Chandra Lagna) is set as the starting Lagna cell, with houses counting clockwise."}
                        </p>
                      </div>
                    </div>

                    {/* Right Panel: Gocharafala Predictions */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span>{isKn ? "ಚಂದ್ರ ಲಗ್ನದಿಂದ ಗೋಚಾರ ಫಲ" : "Gocharafala from Chandra Lagna"}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            {isKn 
                              ? `ಜನ್ಮ ಚಂದ್ರ ರಾಶಿ: ${t(rashiTKey(record.kundliData.moonSign.sanskrit) as "rashis.Mesha")}` 
                              : `Birth Moon Sign: ${record.kundliData.moonSign.english}`}
                          </span>
                        </h4>

                        <div className="space-y-4">
                          {planetsToEvaluate.map((pName) => {
                            const pKey = (pName === "Jupiter" ? "jup" : pName === "Saturn" ? "sat" : pName.toLowerCase()) as keyof typeof day.planetHouses;
                            const house = day.planetHouses[pKey];
                            const statusInfo = getPlanetTransitStatus(pName, house, isKn);

                            let borderClass = "border-slate-200 bg-slate-50/30";
                            let badgeClass = "bg-slate-100 text-slate-800";
                            if (statusInfo.status === "positive") {
                              borderClass = "border-emerald-200 bg-emerald-50/20";
                              badgeClass = "bg-emerald-100 text-emerald-800";
                            } else if (statusInfo.status === "caution") {
                              borderClass = "border-rose-200 bg-rose-50/20";
                              badgeClass = "bg-rose-100 text-rose-800";
                            }

                            const getPlanetEnum = (name: string): PlanetName => {
                              switch (name) {
                                case "Sun": return PlanetName.Sun;
                                case "Moon": return PlanetName.Moon;
                                case "Mars": return PlanetName.Mars;
                                case "Jupiter": return PlanetName.Jupiter;
                                case "Saturn": return PlanetName.Saturn;
                                default: return PlanetName.Sun;
                              }
                            };
                            const pEnum = getPlanetEnum(pName);
                            const isDashaLord = day.dashaLord === pEnum;
                            const isBhuktiLord = day.bhuktiLord === pEnum;

                            return (
                              <div
                                key={pName}
                                className={`rounded-xl border p-4 transition-all hover:shadow-sm ${borderClass}`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                                    <span>{pName === "Saturn" ? "🪐" : pName === "Sun" ? "☀️" : pName === "Moon" ? "🌙" : "✨"}</span>
                                    {statusInfo.name}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                    {isKn ? `${house}ನೇ ಮನೆ` : `House ${house}`}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-700">
                                  {statusInfo.desc}
                                </p>
                                {(isDashaLord || isBhuktiLord) && (
                                  <div className="mt-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 p-2 text-[10px] text-amber-900 font-bold leading-normal">
                                    {isDashaLord && isBhuktiLord ? (
                                      isKn 
                                        ? `* ಈ ಗೋಚಾರವು ಅತ್ಯಂತ ಮುಖ್ಯವಾಗಿದೆ ಏಕೆಂದರೆ ${statusInfo.name} ಗ್ರಹವು ನಿಮ್ಮ ಸದ್ಯದ ಮಹಾದಶೆ ಮತ್ತು ಭುಕ್ತಿ ಎರಡರ ಅಧಿಪತಿಯಾಗಿದೆ. ಇದು ಫಲಗಳನ್ನು ತೀವ್ರವಾಗಿ ಸಕ್ರಿಯಗೊಳಿಸುತ್ತದೆ.`
                                        : `* Highly Critical: ${pName} is both your active Mahadasha and Bhukti Lord. This transit will bring highly intensified events during this period.`
                                    ) : isDashaLord ? (
                                      isKn
                                        ? `* ಈ ಗೋಚಾರವು ಪ್ರಮುಖವಾಗಿದೆ ಏಕೆಂದರೆ ${statusInfo.name} ನಿಮ್ಮ ಸದ್ಯದ ಮಹಾದಶಾದಿಪತಿಯಾಗಿದೆ. ಇದು ಈ ಅವಧಿಯ ಪ್ರಮುಖ ಘಟನೆಗಳನ್ನು ನೇರವಾಗಿ ಪ್ರಭಾವಿಸುತ್ತದೆ.`
                                        : `* Significant: ${pName} is your active Mahadasha Lord. Its transit shapes the major theme of this period.`
                                    ) : (
                                      isKn
                                        ? `* ${statusInfo.name} ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಭುಕ್ತಿ (ಅಂತರ್ದಶೆ) ಅಧಿಪತಿಯಾಗಿರುವುದರಿಂದ, ಈ ಸಂಚಾರವು ತಕ್ಷಣದ ದೈನಂದಿನ ಫಲಗಳನ್ನು ನೀಡಲು ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ.`
                                        : `* Active: ${pName} is your current Bhukti Lord, meaning this transit's day-to-day effects are actively manifesting.`
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}


        </div>
      )}

      {/* Astro Theme Small Callout */}
      <div className="text-center text-[10px] text-slate-500 py-4 border-t border-slate-200">
        <p>✵ {isKn ? "ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರ ನಿಯಮಗಳು" : "Baggona Panchanga Vedic Astrological Standards"} ✵</p>
      </div>
    </div>
  );
}
