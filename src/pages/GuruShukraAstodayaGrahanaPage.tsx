import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore, type SupportedLanguage } from "../stores/appStore";
import {
  calculateAnnualAstroReport,
  LOCATION_PRESETS,
  type AnnualAstroReport,
  type AstodayaPeriod,
  type GrahanaEvent,
  type MajorTransitEvent,
  type LocationPreset,
} from "../core/AstodayaGrahanaEngine";

// Comprehensive 5-Language UI Dictionary for GuruShukraAstodayaGrahanaPage
const UI_TEXT: Record<string, Record<string, string>> = {
  pageTitle: {
    kn: "॥ ಗುರು-ಶುಕ್ರರ ಅಸ್ತೋದಯ & ಗ್ರಹಣ ಮಹಾದರ್ಶನ ॥",
    hi: "॥ गुरु-शुक्र अस्तोदय एवं ग्रहण महादर्शन ॥",
    te: "॥ గురు-శుక్ర అస్తోదయం & గ్రహణ మహాదర్శనం ॥",
    ta: "॥ குரு-சுக்கிர அஸ்தோதயம் & கிரகண மகா தரிசனம் ॥",
    en: "Guru-Shukra Astodaya & Global Eclipse Chronology",
  },
  pageSubtitle: {
    kn: "೧೯೦೦ ರಿಂದ ೨೦೫೦+ ವರೆಗಿನ ಜಾಗತಿಕ & ಭಾರತೀಯ ಗ್ರಹಣಗಳು, ಗೋಚರತೆ, ವೇಧ-ಸೂತಕ ನಿಯಮಗಳು, ದ್ವಾದಶ ರಾಶಿ ಫಲ ಹಾಗೂ ಮೌಢ್ಯ ನಿರ್ಣಯ",
    hi: "१९०० से २०५०+ तक के वैश्विक एवं भारतीय ग्रहण, दृश्यता, सूतक निर्णय, द्वादश राशि फल एवं मौढ्य काल",
    te: "1900 నుండి 2050+ వరకు గల ప్రపంచ & భారతీయ గ్రహణాలు, సూతక నియమాలు, ద్వాదశ రాశి ఫలాలు & మౌఢ్య నిర్ణయం",
    ta: "1900 முதல் 2050+ வரையிலான உலகளாவிய & இந்திய கிரகணங்கள், பார்வை நிலை, சூதக விதிகள் & மௌட்ய காலங்கள்",
    en: "Astronomical & Parashari Almanac of Eclipses, Local Visibility, Sutaka Rules, 12-Rashi Phala & Combustion Periods (1900–2050+)",
  },
  backToHome: {
    kn: "← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    hi: "← मुख्य पृष्ठ पर वापस",
    te: "← ముఖచిత్రానికి తిరిగి వెళ్ళు",
    ta: "← முகப்புக்குத் திரும்பு",
    en: "← Back to Home",
  },
  printPdf: {
    kn: "ಪತ್ರ ಮುದ್ರಣ (Print PDF)",
    hi: "दस्तावेज़ प्रिंट करें (PDF)",
    te: "పత్ర ముద్రణ (Print PDF)",
    ta: "அறிக்கை அச்சிடுக (Print PDF)",
    en: "Print Dossier (PDF)",
  },
  yearLabel: {
    kn: "ವರ್ಷ (ಕ್ರಿ.ಶ.):",
    hi: "वर्ष (ईस्वी):",
    te: "సంవత్సరం (క్రీ.శ.):",
    ta: "ஆண்டு (கி.பி.):",
    en: "Year (CE):",
  },
  locationLabel: {
    kn: "ಸ್ಥಳೀಯ ಗೋಚರತೆ / ವೀಕ್ಷಣಾ ಪ್ರದೇಶ:",
    hi: "स्थानीय दृश्यता / अवलोकन क्षेत्र:",
    te: "స్థానిక దృశ్యత / పరిశీలన ప్రాంతం:",
    ta: "உள்ளூர் பார்வை நிலை / பகுதி:",
    en: "Observation Region / Location Filter:",
  },
  tabEclipses: {
    kn: "ಗ್ರಹಣ ದರ್ಶನ (ಸೂರ್ಯ & ಚಂದ್ರ)",
    hi: "ग्रहण दर्शन (सूर्य एवं चंद्र)",
    te: "గ్రహణ దర్శనం (సూర్య & చంద్ర)",
    ta: "கிரகண தரிசனம் (சூரிய & சந்திர)",
    en: "Solar & Lunar Eclipses",
  },
  tabAstodaya: {
    kn: "ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ",
    hi: "गुरु-शुक्र अस्तोदय एवं मौढ्य",
    te: "గురు-శుక్ర అస్తోదయం & మౌఢ్యం",
    ta: "குரு-சுக்கிர அஸ்தோதயம் & மௌட்யம்",
    en: "Guru & Shukra Astodaya",
  },
  tabTransits: {
    kn: "ಪ್ರಮುಖ ಗ್ರಹ ಗೋಚಾರ ಸಂಚಾರ",
    hi: "प्रमुख ग्रह गोचर संचरण",
    te: "ప్రధాన గ్రహ గోచార సంచారం",
    ta: "முக்கிய கிரக பெயர்ச்சி நிலைகள்",
    en: "Major Planetary Ingresses",
  },
  tabRashiPhala: {
    kn: "ದ್ವಾದಶ ರಾಶಿ ಫಲ & ಶಾಂತಿ",
    hi: "द्वादश राशि फल एवं शांति",
    te: "ద్వాదశ రాశి ఫలితాలు & శాంతి",
    ta: "12 ராசி பலன்கள் & பரிகாரம்",
    en: "12-Rashi Phala & Shanti",
  },
  tabUnified: {
    kn: "ಸಮಗ್ರ ವಾರ್ಷಿಕ ಪಂಚಾಂಗ ಸೂಚಿ",
    hi: "समग्र वार्षिक पंचांग सूची",
    te: "సమగ్ర వార్షిక పంచాంగ సూచిక",
    ta: "முழுமையான ஆண்டு பஞ்சாங்க அறிக்கை",
    en: "Unified Annual Dossier",
  },
  solarEclipse: {
    kn: "ಸೂರ್ಯ ಗ್ರಹಣ",
    hi: "सूर्य ग्रहण",
    te: "సూర్య గ్రహణం",
    ta: "சூரிய கிரகணம்",
    en: "Solar Eclipse",
  },
  lunarEclipse: {
    kn: "ಚಂದ್ರ ಗ್ರಹಣ",
    hi: "चंद्र ग्रहण",
    te: "చంద్ర గ్రహణం",
    ta: "சந்திர கிரகணம்",
    en: "Lunar Eclipse",
  },
  visibleBadge: {
    kn: "🟢 ಆಯ್ದ ಸ್ಥಳದಲ್ಲಿ ಗೋಚರ",
    hi: "🟢 चयनित स्थान पर दृश्य",
    te: "🟢 ఎంచుకున్న ప్రదేశంలో గోచరం",
    ta: "🟢 தேர்ந்தெடுக்கப்பட்ட இடத்தில் தென்படும்",
    en: "🟢 Visible in Selected Location",
  },
  invisibleBadge: {
    kn: "⚪ ಆಯ್ದ ಸ್ಥಳದಲ್ಲಿ ಅದೃಶ್ಯ (ಸೂತಕ ದೋಷವಿಲ್ಲ)",
    hi: "⚪ चयनित स्थान पर अदृश्य (सूतक दोष नहीं)",
    te: "⚪ ఎంచుకున్న ప్రదేశంలో అదృశ్యం (సూతక దోషం లేదు)",
    ta: "⚪ தேர்ந்தெடுக்கப்பட்ட இடத்தில் மறைந்தது (சூதக தோஷம் இல்லை)",
    en: "⚪ Invisible Locally (No Sutaka Applies)",
  },
  sparsha: {
    kn: "ಸ್ಪರ್ಶ (ಆರಂಭ)",
    hi: "स्पर्श (प्रारंभ)",
    te: "స్పర్శ (ప్రారంభం)",
    ta: "ஸ்பர்சம் (துவக்கம்)",
    en: "Contact / Ingress (Sparsha)",
  },
  madhya: {
    kn: "ಮಧ್ಯ (ಪರಮಗ್ರಾಸ)",
    hi: "मध्य (परमग्रास)",
    te: "మధ్య (పరమగ్రాసం)",
    ta: "மத்தியம் (அதிகபட்சம்)",
    en: "Greatest Eclipse (Madhya)",
  },
  moksha: {
    kn: "ಮೋಕ್ಷ (ಮುಕ್ತಾಯ)",
    hi: "मोक्ष (समाप्ति)",
    te: "మోక్షం (ముగింపు)",
    ta: "மோக்ஷம் (முடிவு)",
    en: "Egress / Conclusion (Moksha)",
  },
  duration: {
    kn: "ಒಟ್ಟು ಕಾಲಾವಧಿ",
    hi: "कुल अवधि",
    te: "మొత్తం వ్యవధి",
    ta: "மொத்த கால அளவு",
    en: "Total Duration",
  },
  sutakaRules: {
    kn: "ವೇಧ & ಸೂತಕ ನಿಯಮಗಳು (ಧರ್ಮಶಾಸ್ತ್ರ)",
    hi: "वेध एवं सूतक नियम (धर्मशास्त्र)",
    te: "వేధ & సూతక నియమాలు (ధర్మశాస్త్రం)",
    ta: "வேத & சூதக விதிகள் (தர்மசாஸ்திரம்)",
    en: "Vedha & Sutaka Shastric Injunctions",
  },
  benefic: {
    kn: "ಶುಭ ಫಲ",
    hi: "शुभ फल",
    te: "శుభ ఫలితం",
    ta: "சுப பலன்",
    en: "Benefic",
  },
  moderate: {
    kn: "ಮಧ್ಯಮ ಫಲ",
    hi: "मध्यम फल",
    te: "మధ్యమ ఫలితం",
    ta: "மத்தியம பலன்",
    en: "Moderate",
  },
  adverse: {
    kn: "ಅಶುಭ / ಶಾಂತಿ ಅಪೇಕ್ಷಿತ",
    hi: "अशुभ / शांति आवश्यक",
    te: "అశుభం / శాంతి అవసరం",
    ta: "அசுபம் / பரிகாரம் தேவை",
    en: "Adverse / Shanti Advised",
  },
  gokarnaSevaCallout: {
    kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ & ಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಗ್ರಹಣ ಶಾಂತಿ ಹಾಗೂ ಮೌಢ್ಯ ನಿವಾರಣಾ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಿ.",
    hi: "गोकर्ण महाबलेश्वर एवं महागणपति सानिध्य में विशेष ग्रहण शांति एवं मौढ्य निवारण पूजा संपन्न कराएं।",
    te: "గోకర్ణ మహాబలేశ్వర & మహా గణపతి సన్నిధిలో విశేష గ్రహణ శాంతి మరియు మౌఢ్య నివారణ పూజ చేయించండి.",
    ta: "கோகர்ண மகாபலேஸ்வரர் & மகா கணபதி சந்நிதியில் சிறப்பு கிரகண சாந்தி மற்றும் மௌட்ய நிவர்த்தி பூஜை செய்க.",
    en: "Perform sacred Eclipse Shanti & Combustion Pacification Pujas at the holy Gokarna Kshetra shrine.",
  },
  priestContact: {
    kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗೋಕರ್ಣ) • ಸಹಾಯವಾಣಿ: +91 94812 77004",
    hi: "प्रधान अर्चक: श्रीराम पंडित (गोकर्ण) • हेल्पलाइन: +91 94812 77004",
    te: "ప్రధాన అర్చకులు: శ్రీరామ్ పండిత్ (గోకర్ణ) • హెల్ప్‌లైన్: +91 94812 77004",
    ta: "தலைமை அர்ச்சகர்: ஸ்ரீராம் பண்டிட் (கோகர்ண) • உதவி எண்: +91 94812 77004",
    en: "Chief Priest: Shreeram Pandit (Gokarna) • Helpline: +91 94812 77004",
  },
  guruMantra: {
    kn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಮಂತ್ರ: ಓಂ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
    hi: "देवगुरु बृहस्पति मंत्र: ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
    te: "దేవగురు బృహస్పతి మంత్రం: ఓం గ్రాం గ్రీం గ్రౌం సః గురవే నమః",
    ta: "தேவகுரு பிரகஸ்பதி மந்திரம்: ஓம் கிராம் கிரீம் க்ரௌம் ஸஹ குரவே நமஹ",
    en: "Brihaspati Mantra: Om Graam Greem Graum Sah Gurave Namah",
  },
  shukraMantra: {
    kn: "ದೈತ್ಯಗುರು ಶುಕ್ರ ಮಂತ್ರ: ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
    hi: "दैत्यगुरु शुक्र मंत्र: ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
    te: "దైత్యగురు శుక్ర మంత్రం: ఓం ద్రాం ద్రీం ద్రౌం సః శుక్రాయ నమః",
    ta: "சுக்கிர மந்திரம்: ஓம் த்ராம் த்ரீம் த்ரௌம் ஸஹ சுக்ராய நமஹ",
    en: "Shukra Mantra: Om Draam Dreem Draum Sah Shukraya Namah",
  },
};

export default function GuruShukraAstodayaGrahanaPage(): JSX.Element {
  const { i18n } = useTranslation();
  const currentLang = (useAppStore((s) => s.language) || "kn") as SupportedLanguage;
  const setPage = useAppStore((s) => s.setPage);
  const setLanguage = useAppStore((s) => s.setLanguage);

  // Default to 2026 (current year context)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedLocation, setSelectedLocation] = useState<string>("karnataka");
  const [activeTab, setActiveTab] = useState<"eclipses" | "astodaya" | "transits" | "rashiphala" | "unified">("eclipses");
  const [selectedEclipseIndex, setSelectedEclipseIndex] = useState<number>(0);

  const txt = (key: string): string => {
    const entry = UI_TEXT[key];
    if (!entry) return key;
    return entry[currentLang] || entry.kn || entry.en || key;
  };

  const loc = (record?: Record<string, any>, fallback: string = ""): string => {
    if (!record) return fallback;
    return record[currentLang] || record.kn || record.en || fallback;
  };

  const locArray = (record?: Record<string, string[]>, fallback: string[] = []): string[] => {
    if (!record) return fallback;
    return record[currentLang] || record.kn || record.en || fallback;
  };

  // Astronomical & Parashari calculations via calculateAnnualAstroReport
  const report: AnnualAstroReport = useMemo(() => {
    return calculateAnnualAstroReport(selectedYear, selectedLocation);
  }, [selectedYear, selectedLocation]);

  const activeLocationPreset: LocationPreset = useMemo(() => {
    return (
      LOCATION_PRESETS.find((p) => p.id === selectedLocation) || LOCATION_PRESETS[2]
    );
  }, [selectedLocation]);

  // Separate Jupiter and Venus periods
  const guruPeriods = useMemo(() => {
    return report.astodayaPeriods.filter((p) => p.planet === "Jupiter");
  }, [report.astodayaPeriods]);

  const shukraPeriods = useMemo(() => {
    return report.astodayaPeriods.filter((p) => p.planet === "Venus");
  }, [report.astodayaPeriods]);

  // Ensure selected eclipse index is safe
  useEffect(() => {
    if (selectedEclipseIndex >= report.eclipses.length) {
      setSelectedEclipseIndex(0);
    }
  }, [report, selectedEclipseIndex]);

  const currentSelectedEclipse: GrahanaEvent | undefined =
    report.eclipses[selectedEclipseIndex] || report.eclipses[0];

  const quickYears = [2024, 2025, 2026, 2027, 2028, 2030, 2040, 2050];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-amber-500 selection:text-slate-950">
      {/* 👑 Royal Golden Temple Header */}
      <header className="sticky top-0 z-30 border-b border-amber-500/30 bg-slate-950/95 backdrop-blur-md px-4 py-3 shadow-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage("home")}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all shadow-sm"
              title={txt("backToHome")}
            >
              <span>{txt("backToHome")}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <span className="text-xl">☀️</span>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಖಗೋಳ & ಗ್ರಹಣ ಮಂಡಲ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 5-Language Toggle */}
            <div className="flex items-center rounded-lg border border-amber-500/40 bg-slate-900 p-0.5 shadow-inner">
              {(["kn", "hi", "te", "ta", "en"] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs font-bold uppercase rounded-md transition-all ${
                    currentLang === lang
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Print PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-amber-400 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">{txt("printPdf")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Hero Banner & Title */}
      <div className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 py-8 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-900/30 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-sm mb-3">
            <span>✨</span>
            <span>ದೇವಗುರು-ದೈತ್ಯಗುರು ಮೌಢ್ಯ ನಿರ್ಣಯ & ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣ ಸಂಹಿತಾ</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-amber-200 drop-shadow-md tracking-wide">
            {txt("pageTitle")}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-amber-200/80 max-w-2xl mx-auto leading-relaxed">
            {txt("pageSubtitle")}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 🎛️ Interactive Year & Location Controller Card */}
        <section className="mb-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 p-4 sm:p-5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Year Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{txt("yearLabel")}</span>
                </label>
                <span className="text-[11px] text-amber-400/80 font-mono">
                  ೧೯೦೦ - ೨೦೫೦+ ನಿಖರ ಖಗೋಳ ಗಣನೆ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => Math.max(1900, y - 1))}
                  className="rounded-xl border border-amber-500/40 bg-slate-800 px-3 py-2 text-sm font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
                  title="ಹಿಂದಿನ ವರ್ಷ"
                >
                  ◀
                </button>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={selectedYear}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1900 && val <= 2100) {
                      setSelectedYear(val);
                    }
                  }}
                  className="w-full text-center rounded-xl border border-amber-400/60 bg-slate-950 px-4 py-2 font-mono text-xl font-black text-amber-300 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => Math.min(2100, y + 1))}
                  className="rounded-xl border border-amber-500/40 bg-slate-800 px-3 py-2 text-sm font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
                  title="ಮುಂದಿನ ವರ್ಷ"
                >
                  ▶
                </button>
              </div>

              {/* Quick Year Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-amber-300/70 font-semibold mr-1">ತ್ವರಿತ ಆಯ್ಕೆ:</span>
                {quickYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                      selectedYear === yr
                        ? "bg-amber-400 text-slate-950 font-black shadow-md scale-105 ring-1 ring-amber-300"
                        : "border border-amber-500/30 bg-slate-800/80 text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selector Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{txt("locationLabel")}</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ವೇಧ-ಸೂತಕ ಸ್ಥಳ ನಿರ್ಣಯ
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-xl border border-amber-400/60 bg-slate-950 px-4 py-2.5 text-sm font-bold text-amber-200 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none cursor-pointer"
                >
                  {LOCATION_PRESETS.map((locPreset) => (
                    <option key={locPreset.id} value={locPreset.id} className="bg-slate-900 text-amber-100 py-1">
                      {loc(locPreset.name)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-400">
                  ▼
                </div>
              </div>

              {/* Status pill of selected location */}
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-200">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  {selectedLocation === "world" ? (
                    <b>ಜಾಗತಿಕ ನೋಟ: ಎಲ್ಲಾ ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ ಗ್ರಹಣಗಳು ({report.totalGlobalEclipsesCount})</b>
                  ) : (
                    <>
                      ವೀಕ್ಷಣೆ: <b>{loc(activeLocationPreset.name)}</b> • ಈ ವರ್ಷ{" "}
                      <span className="text-amber-300 font-bold">
                        {report.visibleEclipsesCount} ಗ್ರಹಣಗಳು ಗೋಚರ
                      </span>
                      , {report.totalGlobalEclipsesCount - report.visibleEclipsesCount} ಅದೃಶ್ಯ
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 📑 Tab Navigation */}
        <div className="mb-6 flex overflow-x-auto rounded-2xl border border-amber-500/30 bg-slate-900/90 p-1.5 shadow-lg gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("eclipses")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "eclipses"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
            }`}
          >
            <span>🌒</span>
            <span>{txt("tabEclipses")} ({report.totalGlobalEclipsesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("astodaya")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "astodaya"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
            }`}
          >
            <span>✨</span>
            <span>{txt("tabAstodaya")} ({report.astodayaPeriods.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transits")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "transits"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
            }`}
          >
            <span>🪐</span>
            <span>{txt("tabTransits")} ({report.majorTransits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rashiphala")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "rashiphala"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
            }`}
          >
            <span>🛡️</span>
            <span>{txt("tabRashiPhala")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unified")}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "unified"
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md font-black"
                : "text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
            }`}
          >
            <span>📜</span>
            <span>{txt("tabUnified")}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ಗ್ರಹಣ ದರ್ಶನ (SOLAR & LUNAR ECLIPSES)                */}
        {/* ======================================================== */}
        {activeTab === "eclipses" && (
          <div className="space-y-6">
            {/* Quick summary banner */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-4 text-amber-100 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/30">
                    🌒
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-amber-200 font-serif">
                      {selectedYear} ರಲ್ಲಿ ಜಾಗತಿಕ ಗ್ರಹಣಗಳ ಒಟ್ಟು ಸಂಖ್ಯೆ: {report.totalGlobalEclipsesCount}
                    </h2>
                    <p className="text-xs text-amber-200/80">
                      ಸೂರ್ಯ ಗ್ರಹಣಗಳು: <b>{report.eclipses.filter((e) => e.type === "surya").length}</b> • ಚಂದ್ರ ಗ್ರಹಣಗಳು: <b>{report.eclipses.filter((e) => e.type === "chandra").length}</b>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs text-emerald-200 font-bold">
                  {selectedLocation === "world" ? (
                    "🌍 ಸಮಸ್ತ ಜಾಗತಿಕ ಗಣನೆ"
                  ) : (
                    <>
                      {loc(activeLocationPreset.name)}ದಲ್ಲಿ ಗೋಚರ:{" "}
                      <b className="text-emerald-300">
                        {report.visibleEclipsesCount} ಗ್ರಹಣ
                      </b>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* List of Eclipses */}
            <div className="grid grid-cols-1 gap-6">
              {report.eclipses.map((eclipse, idx) => {
                const isSolar = eclipse.type === "surya";
                const isVisible = eclipse.visibility.isVisibleInSelected;
                return (
                  <div
                    key={eclipse.id || idx}
                    className={`rounded-2xl border-2 transition-all p-5 shadow-xl relative overflow-hidden ${
                      isVisible
                        ? "border-emerald-500/70 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 shadow-emerald-950/20"
                        : "border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-slate-950/50"
                    }`}
                  >
                    {/* Header bar of individual eclipse */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/40">
                          {isSolar ? "☀️" : "🌕"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300">
                              ಗ್ರಹಣ #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-amber-400">
                              {eclipse.peakDateStr}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg sm:text-xl font-black text-amber-100 mt-0.5">
                            {loc(eclipse.title)}
                          </h3>
                        </div>
                      </div>

                      {/* Visibility Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isVisible ? (
                          <div className="rounded-xl border border-emerald-400 bg-emerald-950 px-3 py-1.5 text-xs font-black text-emerald-300 shadow-md">
                            <span>{loc(eclipse.visibility.statusBadge, txt("visibleBadge"))}</span>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300">
                            <span>{loc(eclipse.visibility.statusBadge, txt("invisibleBadge"))}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grid of Eclipse Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      {/* Column 1: Contact Timings */}
                      <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                          <span>⏱️</span>
                          <span>ಗ್ರಹಣ ಸ್ಪರ್ಶ-ಮೋಕ್ಷ ಕಾಲ (IST & UTC)</span>
                        </h4>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">{txt("sparsha")}:</span>
                            <span className="font-mono font-bold text-amber-200">
                              {eclipse.startTimeIst ? `${eclipse.startTimeIst} IST` : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">{txt("madhya")}:</span>
                            <span className="font-mono font-black text-amber-300">
                              {eclipse.peakTimeIst} IST ({eclipse.peakTimeUtc} UTC)
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">{txt("moksha")}:</span>
                            <span className="font-mono font-bold text-amber-200">
                              {eclipse.endTimeIst ? `${eclipse.endTimeIst} IST` : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-400">{txt("duration")}:</span>
                            <span className="font-mono font-extrabold text-emerald-400">
                              {eclipse.durationMinutes} ನಿಮಿಷ ({Math.floor(eclipse.durationMinutes / 60)} ಗಂಟೆ {eclipse.durationMinutes % 60} ನಿಮಿಷ)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Sidereal Astrological Position */}
                      <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                          <span>🪐</span>
                          <span>ಖಗೋಳ ರಾಶಿ & ನಕ್ಷತ್ರ ಗಣನೆ (ಚಿತ್ರಾಪಕ್ಷ)</span>
                        </h4>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">ರಾಶಿ (Rashi):</span>
                            <span className="font-bold text-amber-200">
                              {loc(eclipse.rashi)}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">ರಾಶಿ ಅಂಶ (Degree):</span>
                            <span className="font-mono font-bold text-amber-300">
                              {eclipse.degreeFormatted}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-slate-400">ನಕ್ಷತ್ರ (Nakshatra):</span>
                            <span className="font-bold text-amber-200">
                              {loc(eclipse.nakshatra)} ({eclipse.pada}ನೇ ಪಾದ)
                            </span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-400">ಪೀಡಿತ ನಕ್ಷತ್ರ:</span>
                            <span className="font-bold text-amber-300">
                              {loc(eclipse.impact.afflictedNakshatra)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Sutaka & Shastric Rules */}
                      <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                          <span>🪔</span>
                          <span>{txt("sutakaRules")}</span>
                        </h4>
                        {isVisible ? (
                          <div className="space-y-2 text-xs">
                            <div className="rounded-lg bg-amber-950/40 p-2 border border-amber-500/30">
                              <p className="font-semibold text-amber-300">
                                {isSolar ? "ಸೂರ್ಯ ಗ್ರಹಣ ಸೂತಕ (೪ ಯಾಮಗಳು - ೧೨ ಗಂಟೆ ಮೊದಲು)" : "ಚಂದ್ರ ಗ್ರಹಣ ಸೂತಕ (೩ ಯಾಮಗಳು - ೯ ಗಂಟೆ ಮೊದಲು)"}
                              </p>
                              {eclipse.visibility.sutakaStartTimeIst && (
                                <p className="text-[11px] text-amber-200/90 mt-1 font-mono">
                                  ಆರಂಭ: <b>{eclipse.visibility.sutakaStartTimeIst} IST</b>
                                </p>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {loc(eclipse.vedicInjunctions.sutakaRule)}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-700/60 text-xs">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                              <span>✓</span>
                              <span>ಸೂತಕ ನಿಯಮಗಳು ಅನ್ವಯಿಸುವುದಿಲ್ಲ</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              ಧರ್ಮಶಾಸ್ತ್ರ ವಚನ: <i>&quot;ಯಸ್ಯ ದರ್ಶನಂ ತಸ್ಯ ವೇಧಃ&quot;</i> — ಈ ಗ್ರಹಣವು {loc(activeLocationPreset.name)}ದಲ್ಲಿ ಗೋಚರವಾಗದ ಕಾರಣ ಯಾವುದೇ ವೇಧ, ಸೂತಕ, ಉಪವಾಸ, ತರ್ಪಣ ಅಥವಾ ಸ್ನಾನದ ಬಾಧೆ ಇರುವುದಿಲ್ಲ. ನಿತ್ಯ ಪೂಜೆಗಳನ್ನು ಯಥಾವತ್ತಾಗಿ ನಡೆಸಬಹುದು.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Global Visibility Regions & Local Note */}
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-slate-950/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-amber-300">🌍 ಜಾಗತಿಕ ಗೋಚರ ಪ್ರದೇಶಗಳು: </span>
                        <span className="text-slate-300">{loc(eclipse.globalVisibilityNote)}</span>
                      </div>
                      {eclipse.visibility.visibilityDetails && (
                        <div className="text-emerald-300 font-medium sm:text-right shrink-0">
                          {loc(eclipse.visibility.visibilityDetails)}
                        </div>
                      )}
                    </div>

                    {/* Affected Rashis Quick Strip */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-400">⚠️ ಪೀಡಿತ ರಾಶಿ:</span>
                        <span className="text-rose-200">
                          {loc(eclipse.impact.afflictedRashi)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEclipseIndex(idx);
                          setActiveTab("rashiphala");
                        }}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all"
                      >
                        ದ್ವಾದಶ ರಾಶಿ ಫಲ ನೋಡಿ →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ (COMBUSTION & RISING)      */}
        {/* ======================================================== */}
        {activeTab === "astodaya" && (
          <div className="space-y-6">
            {/* Intro banner about Moudhya */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-5 text-amber-100 shadow-md">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/40 shrink-0">
                  ✨
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-amber-200 font-serif">
                    {selectedYear} ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ ಕಾಲ ನಿರ್ಣಯ
                  </h2>
                  <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
                    {loc(report.auspiciousMarriageWindowsSummary)}
                  </p>
                </div>
              </div>
            </div>

            {/* Jupiter Astodaya Card */}
            <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-xl border border-amber-400/30">
                    🪐
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-black text-amber-200">
                      ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಅಸ್ತೋದಯ (Guru Astodaya)
                    </h3>
                    <p className="text-xs text-amber-400/80">
                      ಜ್ಞಾನ, ಸಂತಾನ, ವಿದ್ಯಾ & ಧರ್ಮಕಾರಕ ಗುರುವಿನ ಮೌಢ್ಯ ಕಾಲಾವಧಿ
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                  ಗುರು ಮೌಢ್ಯ ವಾರ್ಷಿಕ ಪಟ್ಟಿ ({guruPeriods.length})
                </div>
              </div>

              {guruPeriods.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {selectedYear} ರಲ್ಲಿ ಗುರು ಅಸ್ತೋದಯ ಸಂಭವಿಸುವುದಿಲ್ಲ. ಗುರುವು ವರ್ಷಪೂರ್ತಿ ಶುಭಪ್ರದವಾಗಿ ಉದಯದಲ್ಲಿದ್ದಾನೆ.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {guruPeriods.map((period, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-amber-500/30 bg-slate-950/60 p-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <span className="text-slate-400 block">ಅಸ್ತ ಆರಂಭ (Asta Date):</span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            {period.astaDateStr}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಉದಯ ಕಾಲ (Udaya Date):</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {period.udayaDateStr}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಒಟ್ಟು ಮೌಢ್ಯ ದಿನಗಳು:</span>
                          <span className="font-bold text-amber-200 text-sm">
                            {period.durationDays} ದಿನಗಳು
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಉದಯ ದಿಕ್ಕು & ರಾಶಿ:</span>
                          <span className="font-bold text-amber-200 text-sm">
                            {loc(period.direction)} • {loc(period.rashi)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2.5">
                          <p className="font-bold text-rose-300 mb-1">❌ ನಿಷೇಧಿತ ಕಾರ್ಯಗಳು:</p>
                          <p className="text-[11px] text-rose-100/90 leading-relaxed">
                            {locArray(period.prohibitions).join(", ")}.
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5">
                          <p className="font-bold text-emerald-300 mb-1">✅ ಧರ್ಮಶಾಸ್ತ್ರ ನಿಯಮಗಳು:</p>
                          <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                            {loc(period.shastraRules)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-300/80 font-mono">
                        {txt("guruMantra")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Venus Astodaya Card */}
            <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-xl border border-amber-400/30">
                    ⭐
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-black text-amber-200">
                      ದೈತ್ಯಗುರು ಶುಕ್ರ ಅಸ್ತೋದಯ (Shukra Astodaya)
                    </h3>
                    <p className="text-xs text-amber-400/80">
                      ವಿವಾಹ, ಸೌಭಾಗ್ಯ, ಕಲಾ & ವೈಭವಕಾರಕ ಶುಕ್ರನ ಮೌಢ್ಯ ಕಾಲಾವಧಿ
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                  ಶುಕ್ರ ಮೌಢ್ಯ ವಾರ್ಷಿಕ ಪಟ್ಟಿ ({shukraPeriods.length})
                </div>
              </div>

              {shukraPeriods.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {selectedYear} ರಲ್ಲಿ ಶುಕ್ರ ಅಸ್ತೋದಯ ಸಂಭವಿಸುವುದಿಲ್ಲ. ಶುಕ್ರನು ವರ್ಷಪೂರ್ತಿ ಉದಯದಲ್ಲಿದ್ದಾನೆ.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {shukraPeriods.map((period, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-amber-500/30 bg-slate-950/60 p-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <span className="text-slate-400 block">ಅಸ್ತ ಆರಂಭ (Asta Date):</span>
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            {period.astaDateStr}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಉದಯ ಕಾಲ (Udaya Date):</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {period.udayaDateStr}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಒಟ್ಟು ಮೌಢ್ಯ ದಿನಗಳು:</span>
                          <span className="font-bold text-amber-200 text-sm">
                            {period.durationDays} ದಿನಗಳು ({period.durationDays > 30 ? "ಮಾರ್ಗಿ / ದೂರ" : "ವಕ್ರಿ / ಸಮೀಪ"})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">ಉದಯ ದಿಕ್ಕು & ರಾಶಿ:</span>
                          <span className="font-bold text-amber-200 text-sm">
                            {loc(period.direction)} • {loc(period.rashi)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2.5">
                          <p className="font-bold text-rose-300 mb-1">❌ ನಿಷೇಧಿತ ಕಾರ್ಯಗಳು:</p>
                          <p className="text-[11px] text-rose-100/90 leading-relaxed">
                            {locArray(period.prohibitions).join(", ")}.
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5">
                          <p className="font-bold text-emerald-300 mb-1">✅ ಧರ್ಮಶಾಸ್ತ್ರ ನಿಯಮಗಳು:</p>
                          <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                            {loc(period.shastraRules)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-300/80 font-mono">
                        {txt("shukraMantra")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dharmashastra & Shanti Remedies Card */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-black text-amber-200">
                    ಗೋಕರ್ಣ ಶ್ರೀ ಕ್ಷೇತ್ರ ಮೌಢ್ಯ ನಿವಾರಣಾ & ನವಗ್ರಹ ಶಾಂತಿ
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-1 max-w-2xl leading-relaxed">
                    {txt("gokarnaSevaCallout")}
                  </p>
                  <p className="text-[11px] text-amber-400 font-mono mt-1">
                    {txt("priestContact")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPage("seva")}
                  className="rounded-xl border border-amber-400 bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all shrink-0"
                >
                  ಶಾಂತಿ ಸೇವಾ ಬುಕಿಂಗ್ →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ಪ್ರಮುಖ ಗ್ರಹ ಗೋಚಾರ ಸಂಚಾರ (MAJOR INGRESSES)          */}
        {/* ======================================================== */}
        {activeTab === "transits" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-4 text-amber-100 shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/30">
                  🪐
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-amber-200 font-serif">
                    {selectedYear} ರ ಪ್ರಮುಖ ಗ್ರಹಗಳ ರಾಶಿ ಪ್ರವೇಶ (Transit Chronology)
                  </h2>
                  <p className="text-xs text-amber-200/80">
                    ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಕರ್ಮಾಧಿಪತಿ ಶನಿ ಮಹಾತ್ಮರ ಯುಗಾಂತರಕಾರಿ ರಾಶಿ ಸಂಚಾರಗಳು
                  </p>
                </div>
              </div>
            </div>

            {report.majorTransits.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400 text-xs">
                {selectedYear} ರಲ್ಲಿ ಯಾವುದೇ ದೀರ್ಘಕಾಲದ ರಾಶಿ ಸಂಚಾರ ಬದಲಾವಣೆಗಳಿಲ್ಲ (ಗ್ರಹಗಳು ಹಾಲಿ ರಾಶಿಯಲ್ಲೇ ಸಂಚರಿಸಲಿವೆ).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.majorTransits.map((transit, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-4 shadow-lg text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="font-serif font-black text-amber-300 text-sm">
                        {transit.planet === "Jupiter" ? "🪐 ಗುರು ಸಂಚಾರ (Jupiter Ingress)" : "🪐 ಶನಿ ಸಂಚಾರ (Saturn Ingress)"}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {transit.dateStr}
                      </span>
                    </div>
                    <div className="text-amber-100 font-bold mb-1">
                      {loc(transit.title)}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {loc(transit.description)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ದ್ವಾದಶ ರಾಶಿ ಫಲ & ಗ್ರಹಣ ಶಾಂತಿ (12-RASHI PHALA)       */}
        {/* ======================================================== */}
        {activeTab === "rashiphala" && (
          <div className="space-y-6">
            {/* Eclipse Selection Picker for Rashi Phala */}
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 shadow-md">
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
                ಆಯ್ದ ವರ್ಷದ ಗ್ರಹಣವನ್ನು ಆರಿಸಿ:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {report.eclipses.map((e, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedEclipseIndex(idx)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selectedEclipseIndex === idx
                        ? "border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400"
                        : "border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">
                        {e.type === "surya" ? "☀️ ಸೂರ್ಯ" : "🌕 ಚಂದ್ರ"} #{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{e.peakDateStr}</span>
                    </div>
                    <div className="mt-1 font-serif text-xs font-bold text-amber-100 truncate">
                      {loc(e.title)}
                    </div>
                    <div className="mt-1 text-[10px] text-amber-200/80">
                      {loc(e.rashi)} ({loc(e.nakshatra)})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rashi Phala Matrix for the Selected Eclipse */}
            {currentSelectedEclipse && (
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 p-5 shadow-xl">
                <div className="border-b border-amber-500/20 pb-4 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {currentSelectedEclipse.type === "surya" ? "☀️" : "🌕"}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-black text-amber-200">
                          {loc(currentSelectedEclipse.title)} — ದ್ವಾದಶ ರಾಶಿ ಫಲ ನಿರ್ಣಯ
                        </h3>
                      </div>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        ದಿನಾಂಕ: <b>{currentSelectedEclipse.peakDateStr}</b> • ಗ್ರಹಣ ರಾಶಿ:{" "}
                        <b>{loc(currentSelectedEclipse.rashi)}</b> ({loc(currentSelectedEclipse.nakshatra)})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        ● ಶುಭ ಫಲ
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        ● ಮಧ್ಯಮ
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                        ● ಅಶುಭ / ಶಾಂತಿ
                      </span>
                    </div>
                  </div>
                </div>

                {/* 12-Rashi Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {currentSelectedEclipse.impact.rashiSummary.map((rashi) => {
                    const isBenefic = rashi.effect === "shubha";
                    const isAdverse = rashi.effect === "ashubha";
                    return (
                      <div
                        key={rashi.rashiIndex}
                        className={`rounded-xl border p-3.5 transition-all text-xs flex flex-col justify-between ${
                          isBenefic
                            ? "border-emerald-500/40 bg-emerald-950/20"
                            : isAdverse
                            ? "border-rose-500/50 bg-rose-950/25 ring-1 ring-rose-500/30"
                            : "border-amber-500/30 bg-amber-950/15"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                            <span className="font-serif text-sm font-black text-amber-200">
                              {loc(rashi.rashiName)}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isBenefic
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : isAdverse
                                  ? "bg-rose-500/30 text-rose-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {loc(rashi.badge)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {loc(rashi.description)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shanti Box */}
                <div className="mt-6 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-amber-200">
                        ಅಶುಭ ರಾಶಿಯವರು ಆಚರಿಸಬೇಕಾದ ಗ್ರಹಣ ಶಾಂತಿ ವಿಧಾನ
                      </h4>
                      <p className="text-slate-300 mt-1">
                        {loc(currentSelectedEclipse.vedicInjunctions.gokarnaPooja)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage("seva")}
                      className="rounded-lg border border-amber-400 bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow hover:bg-amber-300 transition-all shrink-0"
                    >
                      ಗೋಕರ್ಣ ಶಾಂತಿ ಸೇವೆ →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ಸಮಗ್ರ ವಾರ್ಷಿಕ ಪಂಚಾಂಗ ಸೂಚಿ (UNIFIED ANNUAL DOSSIER)   */}
        {/* ======================================================== */}
        {activeTab === "unified" && (
          <div className="space-y-6 print:space-y-4">
            {/* Unified Printable Report Header */}
            <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 text-center shadow-2xl relative">
              <div className="inline-block rounded-full bg-amber-500/20 px-4 py-1 text-xs font-black tracking-widest text-amber-300 uppercase mb-2">
                ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಅಧಿಕೃತ ಶಾಸ್ತ್ರೀಯ ವರದಿ ॥
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-amber-200">
                {selectedYear} ವಾರ್ಷಿಕ ಗ್ರಹಣ & ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ ಸಮಗ್ರ ಪತ್ರ
              </h2>
              <p className="mt-1 text-xs text-amber-300/80">
                ಪರಿಗಣಿತ ಪ್ರದೇಶ: <b>{loc(activeLocationPreset.name)}</b> • ಗಣನೆ: ಚಿತ್ರಾಪಕ್ಷ ಅಯನಾಂಶ
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
                <span className="rounded-lg bg-slate-900 border border-amber-500/30 px-3 py-1">
                  ಒಟ್ಟು ಗ್ರಹಣಗಳು: <b>{report.totalGlobalEclipsesCount}</b>
                </span>
                <span className="rounded-lg bg-slate-900 border border-amber-500/30 px-3 py-1">
                  ಸ್ಥಳೀಯ ಗೋಚರ: <b>{report.visibleEclipsesCount}</b>
                </span>
                <span className="rounded-lg bg-slate-900 border border-amber-500/30 px-3 py-1">
                  ಗುರು ಮೌಢ್ಯ ಕಾಲಗಳು: <b>{guruPeriods.length}</b>
                </span>
                <span className="rounded-lg bg-slate-900 border border-amber-500/30 px-3 py-1">
                  ಶುಕ್ರ ಮೌಢ್ಯ ಕಾಲಗಳು: <b>{shukraPeriods.length}</b>
                </span>
              </div>
            </div>

            {/* Unified Section 1: Eclipses Table */}
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-lg">
              <h3 className="font-serif text-base font-black text-amber-200 border-b border-amber-500/20 pb-2 mb-4 flex items-center gap-2">
                <span>🌒</span>
                <span>{selectedYear} ಸೂರ್ಯ & ಚಂದ್ರ ಗ್ರಹಣಗಳ ಕೋಷ್ಟಕ (Eclipses Table)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold">
                      <th className="py-2.5 px-3">ಕ್ರ.ಸಂ</th>
                      <th className="py-2.5 px-3">ದಿನಾಂಕ</th>
                      <th className="py-2.5 px-3">ಗ್ರಹಣ ಪ್ರಭೇದ</th>
                      <th className="py-2.5 px-3">ರಾಶಿ & ನಕ್ಷತ್ರ</th>
                      <th className="py-2.5 px-3">ಸ್ಪರ್ಶ-ಮಧ್ಯ-ಮೋಕ್ಷ (IST)</th>
                      <th className="py-2.5 px-3">ಸ್ಥಳೀಯ ಗೋಚರತೆ</th>
                      <th className="py-2.5 px-3">ಪೀಡಿತ ರಾಶಿ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.eclipses.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-amber-400">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-amber-200">
                          {e.peakDateStr}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-amber-100">{loc(e.title)}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-amber-300">{loc(e.rashi)}</span> ({e.degreeFormatted})<br />
                          <span className="text-[10px] text-slate-300">{loc(e.nakshatra)} {e.pada} ಪಾದ</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          ಸ್ಪ: {e.startTimeIst || "—"}<br />
                          ಮ: {e.peakTimeIst}<br />
                          ಮೋ: {e.endTimeIst || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          {e.visibility.isVisibleInSelected ? (
                            <span className="inline-block rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                              {loc(e.visibility.statusBadge)}
                            </span>
                          ) : (
                            <span className="inline-block rounded bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px]">
                              {loc(e.visibility.statusBadge)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-rose-300 text-[11px]">
                          {loc(e.impact.afflictedRashi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unified Section 2: Guru & Shukra Astodaya Table */}
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-5 shadow-lg">
              <h3 className="font-serif text-base font-black text-amber-200 border-b border-amber-500/20 pb-2 mb-4 flex items-center gap-2">
                <span>✨</span>
                <span>{selectedYear} ಗುರು & ಶುಕ್ರ ಮೌಢ್ಯ ಪಟ್ಟಿ (Combustion Chronology)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold">
                      <th className="py-2.5 px-3">ಗ್ರಹ</th>
                      <th className="py-2.5 px-3">ಅಸ್ತ ದಿನಾಂಕ</th>
                      <th className="py-2.5 px-3">ಉದಯ ದಿನಾಂಕ</th>
                      <th className="py-2.5 px-3">ಅವಧಿ (ದಿನಗಳು)</th>
                      <th className="py-2.5 px-3">ಉದಯ ದಿಕ್ಕು</th>
                      <th className="py-2.5 px-3">ಸಂಚಾರ ರಾಶಿ</th>
                      <th className="py-2.5 px-3">ಮುಖ್ಯ ನಿಷೇಧ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {guruPeriods.map((p, idx) => (
                      <tr key={`guru-${idx}`} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-amber-300">🪐 ಗುರು (Guru)</td>
                        <td className="py-2.5 px-3 font-mono text-amber-200">{p.astaDateStr}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{p.udayaDateStr}</td>
                        <td className="py-2.5 px-3 font-bold">{p.durationDays} ದಿನ</td>
                        <td className="py-2.5 px-3">{loc(p.direction)}</td>
                        <td className="py-2.5 px-3">{loc(p.rashi)}</td>
                        <td className="py-2.5 px-3 text-rose-300">ವಿವಾಹ, ಉಪನಯನ, ಗೃಹಪ್ರವೇಶ ನಿಷೇಧ</td>
                      </tr>
                    ))}
                    {shukraPeriods.map((p, idx) => (
                      <tr key={`shukra-${idx}`} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-amber-300">⭐ ಶುಕ್ರ (Shukra)</td>
                        <td className="py-2.5 px-3 font-mono text-amber-200">{p.astaDateStr}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{p.udayaDateStr}</td>
                        <td className="py-2.5 px-3 font-bold">{p.durationDays} ದಿನ</td>
                        <td className="py-2.5 px-3">{loc(p.direction)}</td>
                        <td className="py-2.5 px-3">{loc(p.rashi)}</td>
                        <td className="py-2.5 px-3 text-rose-300">ವಿವಾಹ, ವಧು ಪ್ರವೇಶ, ಗೃಹಪ್ರವೇಶ ನಿಷೇಧ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Priest Ashirvada & Footer */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 p-5 text-center text-xs">
              <p className="font-serif text-sm font-bold text-amber-200">
                ॥ ಶುಭಂ ಭವತು • ಸಮಸ್ತ ಸನ್ಮಂಗಳಾನಿ ಭವಂತು ॥
              </p>
              <p className="text-amber-200/80 mt-1">
                ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ & ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪಾಶೀರ್ವಾದಗಳೊಂದಿಗೆ ಪ್ರಸ್ತುತಪಡಿಸಲಾಗಿದೆ.
              </p>
              <p className="text-amber-400 font-mono mt-1">
                {txt("priestContact")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
