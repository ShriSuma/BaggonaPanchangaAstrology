import React, { forwardRef } from "react";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import SouthIndianChart from "../kundli/SouthIndianChart";

export interface DashaBhuktiTimelineData {
  activeMaha: {
    lord: string;
    lordLocalized: string;
    startYear: number | string;
    endYear: number | string;
    totalYears: number;
  };
  activeBhukti: {
    lord: string;
    lordLocalized: string;
    startDate: string;
    endDate: string;
    durationMonths: number | string;
    badge: string;
    influenceSummary: string;
  };
  upcomingBhuktis: {
    lord: string;
    lordLocalized: string;
    startDate: string;
    endDate: string;
    qualityBadge: string;
    qualityType: "benefic" | "neutral" | "caution";
  }[];
  upcomingMaha?: {
    lord: string;
    lordLocalized: string;
    startYear: number | string;
    endYear: number | string;
  };
}

export interface RoyalA4Data {
  title: string;
  subtitle: string;
  name: string;
  dobFormatted: string;
  birthTime: string;
  birthPlace: string;
  lagnaName: string;
  lagnaLord: string;
  moonSignName: string;
  moonLord: string;
  nakshatraName: string;
  nakshatraPada: number | string;
  weekdayName: string;
  tithiName: string;
  currentMahaLord: string;
  currentBhuktiLord: string;
  runningPeriodText: string;
  dashaBhuktiTimeline?: DashaBhuktiTimelineData;
  planetsTable?: {
    name: string;
    rashi: string;
    house: number;
    longitudeStr: string;
    nakshatra: string;
    pada: number | string;
    dignity: string;
    isRetrograde?: boolean;
  }[];
  characteristics: { trait?: string; impact: string }[];
  currentPhase: { impact: string }[];
  yogas: { name: string; impact: string }[];
  doshas: { name: string; impact: string; remedy?: string }[];
  gochara: { name: string; impact: string; remedy?: string }[];
  timeline: {
    monthName: string;
    dateRange: string;
    dashaInfluence: string;
    transitSummary: string;
    shubhaDinagalu: string;
    chandrashtamaDinagalu: string;
    forecast: string;
    monthlyUpasana: string;
  }[];
  careerGuidance: string;
  financeGuidance: string;
  relationshipGuidance: string;
  childrenGuidance?: string;
  healthGuidance: string;
  summary: string;
  ashirvada: string;
  shloka: string;
  karmicInwardJourney?: {
    title: string;
    paragraph1: string;
    paragraph2: string;
  };
}

interface RoyalA4PrintTemplateProps {
  session: KundliViewerSession;
  lang: string;
  data: RoyalA4Data;
  qrCodeUrl?: string;
  activePage?: "all" | 1 | 2 | 3 | 4 | 5;
}

export const RoyalA4PrintTemplate = forwardRef<HTMLDivElement, RoyalA4PrintTemplateProps>(
  ({ session, lang, data, qrCodeUrl, activePage = "all" }, ref) => {
    const isKn = lang === "kn";
    const isHi = lang === "hi";
    const isTe = lang === "te";
    const isTa = lang === "ta";

    const labels = {
      headerSub: isKn
        ? "॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ • ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ॥"
        : isHi
        ? "॥ श्री कुलदेवता प्रसन्न • गोकर्ण महाबलेश्वर अनुग्रह ॥"
        : isTe
        ? "॥ శ్రీ కులదేవతా ప్రసన్న • గోకర్ణ మహాబలేశ్వర అనుగ్రహం ॥"
        : isTa
        ? "॥ ஸ்ரீ குலதேவதா பிரசன்ன • கோகர்ண மகாபலேஸ்வரர் அருள் ॥"
        : "॥ Sri Kuladevata Prasanna • Divine Gokarna Blessings ॥",
      royalBadge: isKn
        ? "ರಾಜಮುದ್ರಣ ಜಾತಕ ಪ್ರತಿ (₹೩೦೦ ಭೌತಿಕ ಮುದ್ರಣ ಆವೃತ್ತಿ)"
        : isHi
        ? "राजमुद्रण जन्मपत्रिका (₹३०० मुद्रण संस्करण)"
        : isTe
        ? "రాజముద్రణ జన్మపత్రిక (₹300 ముద్రణ సంచిక)"
        : isTa
        ? "ராஜமுத்ரா ஜாதகம் (₹300 அச்சு பதிப்பு)"
        : "Royal Horoscope Printout (₹300 Physical Print Edition)",
      nativeDetails: isKn ? "ಜಾತಕರ ಜನನ ಜಾತಕ ವಿವರ" : isHi ? "जातक जन्म विवरण" : isTe ? "జాతక జనన వివరాలు" : isTa ? "பிறப்பு விவரங்கள்" : "Native's Astrological Details",
      chartTitle: isKn ? "ಜನ್ಮ ಲಗ್ನ ಕುಂಡಲಿ (ಗೋಕರ್ಣ ಪದ್ಧತಿ)" : isHi ? "जन्म लग्न कुंडली (गोकर्ण पद्धति)" : isTe ? "జన్మ లగ్న కుండలి" : isTa ? "ஜென்ம லக்ன குண்டலி" : "Janma Lagna Kundali (Gokarna System)",
      planetsTitle: isKn ? "ಗ್ರಹ ಸ್ಥಿತಿ ಕೋಷ್ಟಕ (ನವಾಂಶ & ದೀಪ್ತಾಂಶ)" : isHi ? "ग्रह स्थिति सारणी" : isTe ? "గ్రహ స్థితి పట్టిక" : isTa ? "கிரக நிலை அட்டவணை" : "Planetary Positions & Dignity Table",
      personalityTitle: isKn ? "೧. ಆತ್ಮಾನ್ವೇಷಣೆ & ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ ತತ್ವ" : isHi ? "1. आत्मा एवं जन्म लग्न व्यक्तित्व" : isTe ? "1. ఆత్మాన్వేషణ & వ్యక్తిత్వ తత్వం" : isTa ? "1. ஆத்ம ஆய்வு & குணநலன்" : "1. Soul & Core Personality Blueprint",
      dashaPhaseTitle: isKn ? "೨. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಫಲ & ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ" : isHi ? "2. वर्तमान दशा-भुक्ति प्रभाव एवं मार्गदर्शन" : isTe ? "2. ప్రస్తుత దశా-భుక్తి ఫలితాలు" : isTa ? "2. தற்போதைய தசா-புக்தி பலன்" : "2. Running Planetary Period (Dasha-Bhukti) Guidance",
      yogasTitle: isKn ? "೩. ಜಾತಕದಲ್ಲಿರುವ ವಿಶೇಷ ರಾಜಯೋಗಗಳು & ಶುಭ ಯೋಗಗಳು" : isHi ? "3. जन्म कुंडली में विशेष राजयोग एवं शुभ योग" : isTe ? "3. విశేష రాజయోగాలు & శుభ యోగాలు" : isTa ? "3. ராஜயோகங்கள் & சுப யோகங்கள்" : "3. Auspicious Planetary Yogas & Divine Combinations",
      doshasTitle: isKn ? "೪. ಕರ್ಮ ದೋಷಗಳು ಹಾಗೂ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ ಮಾರ್ಗಗಳು" : isHi ? "4. कर्म दोष एवं शास्त्रोक्त अचूक उपाय" : isTe ? "4. కర్మ దోషాలు & పరిహార మార్గాలు" : isTa ? "4. கிரக தோஷங்கள் & சாஸ்திர பரிகாரங்கள்" : "4. Karmic Planetary Doshas & Authentic Remedies",
      gocharaTitle: isKn ? "೫. ಪ್ರಸ್ತುತ ಪ್ರಮುಖ ಗ್ರಹಗಳ ಗೋಚಾರ ಫಲ (ಗುರು, ಶನಿ, ರಾಹು-ಕೇತು)" : isHi ? "5. वर्तमान प्रमुख ग्रह गोचर फल" : isTe ? "5. ప్రస్తుత గోచార ఫలితాలు" : isTa ? "5. கோச்சார கிரக பலன்கள்" : "5. Real-Time Major Planetary Transits (Gochara)",
      timelineTitle: isKn ? "೬. ಮುಂದಿನ ೬ ತಿಂಗಳ ಸಂಕ್ರಮಣ, ಶುಭ ದಿನಗಳು & ಉಪಾಸನಾ ಮಾರ್ಗಸೂಚಿ" : isHi ? "6. आगामी ६ महीनों का संक्रमण, शुभ तिथियाँ एवं उपासना" : isTe ? "6. రాబోయే 6 నెలల ప్రయాణం & శుభ దినాలు" : isTa ? "6. அடுத்த 6 மாத கால பயணம் & சுப நாட்கள்" : "6. Comprehensive 6-Month Astrological Roadmap & Rituals",
      lifeAreasTitle: isKn ? "೭. ಜೀವನದ ಪಂಚ ಮಹಾ ಕ್ಷೇತ್ರಗಳ ಭವಿಷ್ಯ ನಿರೂಪಣೆ" : isHi ? "7. जीवन के 5 प्रमुख क्षेत्रों का विस्तृत भविष्यफल" : isTe ? "7. జీవిత పంచ మహా రంగాల సమగ్ర విశ్లేషణ" : isTa ? "7. வாழ்வின் 5 முக்கிய துறைகளின் விரிவான பலன்கள்" : "7. Fivefold Life Domains In-Depth Analysis",
      ashirvadaTitle: isKn ? "ದೈವಜ್ಞರ ಆಶೀರ್ವಾದ & ಶಾಂತಿ ಮಂತ್ರ" : isHi ? "दैवज्ञ आशीर्वाद एवं शांति मंत्र" : isTe ? "దైవజ్ఞ ఆశీర్వాదం & శాంతి మంత్రం" : isTa ? "ஜோதிடரின் ஆசீர்வாதம் & சாந்தி மந்திரம்" : "Astrologer's Benediction (Ashirvada) & Peace Shloka",
      priestOffice: isKn ? "ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ • ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ" : isHi ? "आधिकारिक बग्गोण पंचांग ज्योतिष कार्यालय • गोकर्ण क्षेत्र" : isTe ? "అధికారిక బగ్గోణ పంచాంగ జ్యోతిష్య కార్యాలయం • గోకర్ణ క్షేత్రం" : isTa ? "அதிகாரபூர்வ பக்கோண பஞ்சாங்க ஜோதிட அலுவலகம் • கோகர்ணா" : "Official Baggona Panchanga Astrology Sansthana • Gokarna Kshetra",
      priestName: isKn ? "ಪ್ರಧಾನ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : isHi ? "प्रधान ज्योतिषी: श्रीराम पंडित" : isTe ? "ప్రధాన అర్చకులు: శ్రీరామ్ పండితులు" : isTa ? "தலைமை ஜோதிடர்: ஸ்ரீராம் பண்டிதர்" : "Chief Priest: Shreeram Pandit",
      dashaTimelineTitle: isKn
        ? "ದಶಾ-ಭುಕ್ತಿ ವಿವರವಾದ ಕಾಲಕ್ರಮ & ಪ್ರಭಾವ"
        : isHi
        ? "दशा-भुक्ति विस्तृत कालक्रम एवं प्रभाव"
        : isTe
        ? "దశా-భుక్తి సమగ్ర కాలక్రమం"
        : isTa
        ? "தசா-புக்தி விரிவான காலவரிசை"
        : "Dasha-Bhukti Detailed Timeline & Impact",
      pageHeaderTitle: isKn
        ? "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ • ರಾಜಮುದ್ರಣ ಆವೃತ್ತಿ ॥"
        : isHi
        ? "॥ बग्गोण पंचांग ज्योतिष • राजमुद्रण संस्करण ॥"
        : isTe
        ? "॥ బగ్గోణ పంచాంగ జ్యోతిష్యం • రాజముద్రణ సంచిక ॥"
        : isTa
        ? "॥ பக்கோண பஞ்சாங்க ஜோதிடம் • ராஜமுத்ரா பதிப்பு ॥"
        : "॥ Baggona Panchanga Astrology • Royal Print Edition ॥",
      page2HeaderSub: isKn ? "ಜಾತಕ ವಿಶ್ಲೇಷಣೆ" : isHi ? "कुंडली विश्लेषण" : isTe ? "జాతక విశ్లేషణ" : isTa ? "ஜாதக ஆய்வு" : "Horoscope Analysis",
      page3HeaderSub: isKn ? "ದೋಷ ಹಾಗೂ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ" : isHi ? "दोष एवं गोचर विश्लेषण" : isTe ? "దోష & గోచార విశ్లేషణ" : isTa ? "தோஷ & கோச்சார ஆய்வு" : "Doshas & Planetary Transits",
      page4HeaderSub: isKn ? "೬ ತಿಂಗಳ ಸಂಕ್ರಮಣ ಮಾರ್ಗಸೂಚಿ" : isHi ? "६ माह का गोचर मार्गदर्शन" : isTe ? "6 నెలల మార్గదర్శనం" : isTa ? "6 மாத கால வழிகாட்டல்" : "6-Month Transit Roadmap",
      page5HeaderSub: isKn ? "ದೈವಿಕ ಆಶೀರ್ವಾದ & ಪೂರ್ಣ ಫಲ" : isHi ? "दैवीय आशीर्वाद एवं पूर्ण फल" : isTe ? "దైవిక ఆశీర్వాదం & సంపూర్ణ ఫలితం" : isTa ? "தெய்வீக ஆசீர்வாதம் & நற்பலன்" : "Divine Blessings & Life Destiny",
      contactPhone: "+91 9972339362",
      scanHelp: isKn ? "ದಿನದರ್ಶನ & ಕೌಟುಂಬಿಕ ಪೂಜಾ ಸಂಕಲ್ಪಕ್ಕೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ" : isHi ? "दैनिक दर्शन एवं पूजा संकल्प हेतु स्कैन करें" : isTe ? "రోజువారీ దర్శనం కొరకు స్కాన్ చేయండి" : isTa ? "தினசரி தர்சனத்திற்கு ஸ்கேன் செய்யவும்" : "Scan for Daily Darshana & Seva Booking"
    };

    const pageBorder = "border-[3px] border-amber-800/60 rounded-lg p-8 relative overflow-hidden";
    const innerDashed = "absolute inset-3 border border-dashed border-amber-600/30 rounded pointer-events-none";

    const pageLabel = (pageNum: number) => {
      const indicNumKn = ["೧", "೨", "೩", "೪", "೫"][pageNum - 1];
      const indicNumHi = ["१", "२", "३", "४", "५"][pageNum - 1];
      const indicNumTe = ["౧", "౨", "౩", "౪", "౫"][pageNum - 1];
      const indicNumTa = ["௧", "௨", "௩", "௪", "௫"][pageNum - 1];
      if (isKn) return `ಪುಟ ${indicNumKn}/೫ (Page ${pageNum} of 5)`;
      if (isHi) return `पृष्ठ ${indicNumHi}/५ (Page ${pageNum} of 5)`;
      if (isTe) return `పుట ${indicNumTe}/౫ (Page ${pageNum} of 5)`;
      if (isTa) return `பக்கம் ${indicNumTa}/௫ (Page ${pageNum} of 5)`;
      return `Page ${pageNum} of 5`;
    };

    const renderDomainParas = (text?: string) => {
      if (!text) return null;
      const paras = text.split('\n').map(p => p.trim()).filter(Boolean);
      return (
        <div className="space-y-1.5 mt-1">
          {paras.map((para, idx) => {
            const isDoshaOrShield = para.startsWith('【') || para.startsWith('[');
            if (isDoshaOrShield) {
              return (
                <div
                  key={idx}
                  className="bg-rose-50/90 border border-rose-300/80 rounded-lg text-rose-950 p-2 shadow-xs font-serif leading-relaxed text-justify text-[11px]"
                >
                  {para}
                </div>
              );
            }
            return (
              <p key={idx} className="text-amber-950 font-serif leading-relaxed text-justify text-[11px]">
                {para}
              </p>
            );
          })}
        </div>
      );
    };

    return (
      <div ref={ref} className="bg-[#FFFDF8] text-amber-950 font-serif" style={{ width: "900px" }}>
        
        {/* ==================================================================== */}
        {/* PAGE 1: COVER, DEVOTEE PROFILE, KUNDALI CHART & PLANETS TABLE        */}
        {/* ==================================================================== */}
        {(!activePage || activePage === "all" || activePage === 1) && (
        <div
          className="pdf-page relative bg-[#FFFDF8]"
          style={{ width: "900px", minHeight: "1273px", boxSizing: "border-box", padding: "40px", pageBreakAfter: "always" }}
        >
          <div className={`${pageBorder} h-full flex flex-col justify-between`}>
            <div className={innerDashed} />

            {/* Corner Decorative Ornaments */}
            <span className="absolute top-4 left-5 text-amber-800/60 text-lg select-none">卐</span>
            <span className="absolute top-4 right-5 text-amber-800/60 text-lg select-none">卐</span>
            <span className="absolute bottom-4 left-5 text-amber-800/60 text-lg select-none">🕉️</span>
            <span className="absolute bottom-4 right-5 text-amber-800/60 text-lg select-none">🕉️</span>

            <div>
              {/* Header Invocations */}
              <div className="text-center pb-4 border-b-2 border-amber-800/40">
                <div className="text-xs font-bold tracking-widest text-amber-800 uppercase font-sans mb-1">
                  {labels.headerSub}
                </div>
                <h1 className="text-3xl font-extrabold text-amber-900 tracking-wide font-serif mb-1">
                  {data.title || "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥"}
                </h1>
                <p className="text-sm font-semibold text-amber-800 italic">
                  {data.subtitle || "ಅಧಿಕೃತ ವೈದಿಕ ಜಾತಕ ಫಲ & ಜೀವಮಾನ ಮಾರ್ಗದರ್ಶಿ"}
                </p>
                <div className="inline-block mt-2 px-4 py-1 bg-amber-100 border border-amber-600/50 rounded-full text-xs font-bold text-amber-900 shadow-sm">
                  {labels.royalBadge}
                </div>
              </div>

              {/* Devotee Astrological Profile Parchment */}
              <div className="mt-5 p-4 rounded-xl border border-amber-700/40 bg-amber-50/80 shadow-sm">
                <div className="text-xs font-bold text-amber-900 tracking-wider uppercase mb-3 flex items-center gap-2 border-b border-amber-700/20 pb-1">
                  <span>📜</span>
                  <span>{labels.nativeDetails}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ಜಾತಕರ ಹೆಸರು:" : "Native Name:"} </span>
                    <span className="font-black text-amber-950 text-sm">{data.name}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ಜನನ ವಿವರ:" : "Birth Details:"} </span>
                    <span className="font-bold text-amber-950">{data.dobFormatted} | {data.birthTime}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ಜನ್ಮ ಲಗ್ನ:" : "Birth Lagna:"} </span>
                    <span className="font-bold text-amber-950">{data.lagnaName} ({data.lagnaLord})</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ಜನ್ಮ ರಾಶಿ:" : "Moon Sign (Rashi):"} </span>
                    <span className="font-bold text-amber-950">{data.moonSignName} ({data.moonLord})</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ (ಪಾದ):" : "Nakshatra (Pada):"} </span>
                    <span className="font-bold text-amber-950">{data.nakshatraName} - {data.nakshatraPada} {isKn ? "ಪಾದ" : "Pada"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900/80">{isKn ? "ವಾರ & ತಿಥಿ:" : "Vaara & Tithi:"} </span>
                    <span className="font-bold text-amber-950">{data.weekdayName}, {data.tithiName}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-amber-700/20">
                    <span className="font-bold text-amber-900/80">{isKn ? "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ-ಭುಕ್ತಿ:" : "Current Dasha-Bhukti:"} </span>
                    <span className="font-black text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                      {data.currentMahaLord} {isKn ? "ಮಹಾದಶಾ" : "Maha Dasha"} / {data.currentBhuktiLord} {isKn ? "ಭುಕ್ತಿ" : "Bhukti"}
                    </span>
                    <span className="text-[11px] text-amber-800 ml-2 italic">({data.runningPeriodText})</span>
                  </div>
                </div>
              </div>

              {/* South Indian Chart & Planetary Positions Table Split */}
              <div className="mt-5 grid grid-cols-12 gap-5 items-start">
                {/* Left: Gokarna South Indian Chart */}
                <div className="col-span-6 flex flex-col items-center">
                  <div className="text-xs font-bold text-amber-900 mb-1 text-center">
                    {labels.chartTitle}
                  </div>
                  <div className="w-full max-w-[360px] bg-[#FFFDF8] p-1 rounded-xl border border-amber-700/40 shadow-sm">
                    <SouthIndianChart kundli={session.result} personName={session.input.name} />
                  </div>
                </div>

                {/* Right: Comprehensive Dasha-Bhukti Detailed Timeline */}
                <div className="col-span-6">
                  <div className="text-xs font-bold text-amber-900 mb-1 flex items-center justify-between">
                    <span>⏳ {labels.dashaTimelineTitle}</span>
                  </div>

                  {data.dashaBhuktiTimeline ? (
                    <div className="space-y-2">
                      {/* Active Dasha-Bhukti Card */}
                      <div className="p-2.5 rounded-xl border border-amber-700/50 bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50/80 shadow-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-black text-amber-950 text-xs">
                            {data.dashaBhuktiTimeline.activeMaha.lordLocalized} {isKn ? "ಮಹಾದಶಾ" : isHi ? "महादशा" : isTe ? "మహాదశ" : isTa ? "மகாதிசை" : "Maha Dasha"} / {data.dashaBhuktiTimeline.activeBhukti.lordLocalized} {isKn ? "ಭುಕ್ತಿ" : isHi ? "भुक्ति" : isTe ? "భుక్తి" : isTa ? "புக்தி" : "Bhukti"}
                          </span>
                          <span className="text-[9.5px] font-sans font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-full shrink-0">
                            {data.dashaBhuktiTimeline.activeBhukti.badge}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10.5px] text-amber-900 font-semibold mb-1 border-b border-amber-700/20 pb-1">
                          <span>📅 {isKn ? "ಅವಧಿ:" : "Span:"} {data.dashaBhuktiTimeline.activeBhukti.startDate} — {data.dashaBhuktiTimeline.activeBhukti.endDate}</span>
                          <span className="italic font-sans">({data.dashaBhuktiTimeline.activeBhukti.durationMonths} {isKn ? "ತಿಂಗಳುಗಳು" : isHi ? "माह" : "Months"})</span>
                        </div>

                        <p className="text-[11px] text-amber-950 font-serif leading-relaxed text-justify">
                          {data.dashaBhuktiTimeline.activeBhukti.influenceSummary}
                        </p>
                      </div>

                      {/* Upcoming Bhuktis Sequence Table */}
                      <div className="overflow-hidden rounded-xl border border-amber-700/40 bg-white/90 shadow-xs">
                        <div className="bg-amber-100/90 px-2.5 py-1 text-[11px] font-bold text-amber-950 border-b border-amber-700/20 flex justify-between items-center">
                          <span>{isKn ? "ಮುಂಬರುವ ಭುಕ್ತಿಗಳ ಸಂಚಾರ & ಫಲ ಸೂಚನೆ" : isHi ? "आगामी भुक्ति क्रम एवं फल संकेत" : isTe ? "రాబోయే భుక్తులు & ఫలితాలు" : isTa ? "வரவிருக்கும் புக்திகள் & பலன்" : "Upcoming Bhukti Sequence & Forecast"}</span>
                        </div>
                        <table className="w-full text-left border-collapse text-[10.5px]">
                          <thead>
                            <tr className="bg-amber-50 text-amber-900/80 font-bold border-b border-amber-700/20 text-[10px]">
                              <th className="py-1 px-2">{isKn ? "ಭುಕ್ತಿ ನಾಥ" : "Bhukti"}</th>
                              <th className="py-1 px-2">{isKn ? "ದಿನಾಂಕ" : "Span"}</th>
                              <th className="py-1 px-2 text-right">{isKn ? "ಫಲ ಸಂಕೇತ" : "Quality"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-700/10">
                            {data.dashaBhuktiTimeline.upcomingBhuktis.slice(0, 4).map((ub, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="py-1 px-2 font-bold text-amber-950">
                                  {ub.lordLocalized} {isKn ? "ಭುಕ್ತಿ" : isHi ? "भुक्ति" : isTe ? "భుక్తి" : isTa ? "புக்தி" : "Bhukti"}
                                </td>
                                <td className="py-1 px-2 text-slate-700 font-sans text-[10px]">
                                  {ub.startDate} - {ub.endDate}
                                </td>
                                <td className="py-1 px-2 text-right">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-sans ${
                                    ub.qualityType === "benefic"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : ub.qualityType === "caution"
                                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                                      : "bg-amber-100 text-amber-800 border border-amber-300"
                                  }`}>
                                    {ub.qualityBadge}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {data.dashaBhuktiTimeline.upcomingMaha && (
                          <div className="bg-amber-50/80 px-2 py-1 border-t border-amber-700/20 text-[10px] text-amber-900 font-semibold flex items-center justify-between">
                            <span>✨ {isKn ? "ಮುಂದಿನ ಮಹಾದಶಾ:" : isHi ? "आगामी महादशा:" : isTe ? "తదుపరి మహాదశ:" : isTa ? "அடுத்த மகாதிசை:" : "Next Mahadasha:"} {data.dashaBhuktiTimeline.upcomingMaha.lordLocalized}</span>
                            <span className="font-sans">({data.dashaBhuktiTimeline.upcomingMaha.startYear} — {data.dashaBhuktiTimeline.upcomingMaha.endYear})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    data.planetsTable && (
                      <div className="overflow-hidden rounded-xl border border-amber-700/40 bg-white/80 shadow-sm">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-amber-100/90 text-amber-950 font-bold border-b border-amber-700/30">
                              <th className="p-1.5">{isKn ? "ಗ್ರಹ" : "Planet"}</th>
                              <th className="p-1.5">{isKn ? "ರಾಶಿ" : "Rashi"}</th>
                              <th className="p-1.5 text-center">{isKn ? "ಭಾವ" : "House"}</th>
                              <th className="p-1.5">{isKn ? "ದೀಪ್ತಾಂಶ" : "Deg"}</th>
                              <th className="p-1.5">{isKn ? "ಸ್ಥಿತಿ" : "Dignity"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-700/15">
                            {data.planetsTable.slice(0, 10).map((p, idx) => (
                              <tr key={idx} className={idx % 2 === 1 ? "bg-amber-50/50" : ""}>
                                <td className="p-1.5 font-bold text-amber-950">{p.name}</td>
                                <td className="p-1.5 text-amber-900">{p.rashi}</td>
                                <td className="p-1.5 text-center font-bold text-amber-950">{p.house}</td>
                                <td className="p-1.5 font-mono text-[10px] text-amber-800">{p.longitudeStr}</td>
                                <td className="p-1.5 text-[10px] font-semibold text-amber-950">{p.dignity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-amber-800/30 flex justify-between items-center text-[11px] text-amber-800">
              <span>{labels.priestOffice}</span>
              <span className="font-bold">{pageLabel(1)}</span>
            </div>
          </div>
        </div>
        )}

        {/* ==================================================================== */}
        {/* PAGE 2: SOUL BLUEPRINT, CURRENT PHASE & AUSPICIOUS YOGAS             */}
        {/* ==================================================================== */}
        {(!activePage || activePage === "all" || activePage === 2) && (
        <div
          className="pdf-page relative bg-[#FFFDF8]"
          style={{ width: "900px", minHeight: "1273px", boxSizing: "border-box", padding: "40px", pageBreakAfter: "always" }}
        >
          <div className={`${pageBorder} h-full flex flex-col justify-between`}>
            <div className={innerDashed} />
            <div>
              {/* Running Page Header */}
              <div className="flex justify-between items-center pb-2 border-b border-amber-800/30 text-[11px] text-amber-800">
                <span className="font-bold">{labels.pageHeaderTitle}</span>
                <span>{data.name} — {labels.page2HeaderSub}</span>
              </div>

              {/* Section 1: Personality Blueprint */}
              <div className="mt-4">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-2.5 flex items-center gap-2">
                  <span>🕉️</span>
                  <span>{labels.personalityTitle}</span>
                </h2>
                <div className="space-y-2 text-xs leading-relaxed text-amber-950">
                  {data.characteristics.slice(0, 2).map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-700/20">
                      {c.trait && <div className="font-bold text-amber-900 text-xs mb-0.5">{c.trait}</div>}
                      <p className="text-justify font-serif text-[11px]">{c.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Current Dasha-Bhukti Phase */}
              <div className="mt-3.5">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-2 flex items-center gap-2">
                  <span>⏳</span>
                  <span>{labels.dashaPhaseTitle}</span>
                </h2>
                <div className="p-3 bg-amber-100/50 rounded-lg border border-amber-700/30 text-[11px] leading-relaxed text-amber-950 text-justify">
                  {data.currentPhase.slice(0, 1).map((cp, idx) => (
                    <p key={idx} className="font-serif">{cp.impact}</p>
                  ))}
                </div>
              </div>

              {/* Karmic Inward Journey (Maandi Perspective Inquest - No Maandi/Gulika word) */}
              {data.karmicInwardJourney && (
                <div className="mt-3.5 p-3.5 bg-gradient-to-br from-amber-50/90 via-[#FFFDF8] to-orange-50/70 rounded-xl border border-amber-600/40 shadow-xs relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-amber-600/30">
                    <span className="text-amber-800 text-sm">✨</span>
                    <h3 className="font-bold text-amber-950 font-serif text-sm tracking-wide">
                      {data.karmicInwardJourney.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-amber-950 font-serif leading-relaxed text-justify mb-2 indent-3">
                    {data.karmicInwardJourney.paragraph1}
                  </p>
                  <p className="text-[11px] text-amber-950 font-serif leading-relaxed text-justify indent-3">
                    {data.karmicInwardJourney.paragraph2}
                  </p>
                </div>
              )}

              {/* Section 3: Auspicious Yogas */}
              <div className="mt-3.5">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-2 flex items-center gap-2">
                  <span>👑</span>
                  <span>{labels.yogasTitle}</span>
                </h2>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {data.yogas.slice(0, 2).map((y, idx) => (
                    <div key={idx} className="p-2.5 bg-white/90 rounded-lg border border-amber-600/30 shadow-xs flex flex-col justify-between">
                      <div>
                        <span className="font-black text-amber-900 text-xs bg-amber-100/80 px-2 py-0.5 rounded inline-block mb-1">
                          {y.name.replace(/^[\s:,\.\-–—×*•~|]+/gu, "")}
                        </span>
                        <p className="text-amber-950 text-justify font-serif text-[11px] leading-relaxed line-clamp-4">
                          {(y.impact || "").replace(/^[\s:,\.\-–—×*•~|]+(?=[^\s:,\.\-–—×*•~|])/gu, "").replace(/^[\s:,\.\-–—×*•~|]+/gu, "")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-amber-800/30 flex justify-between items-center text-[11px] text-amber-800">
              <span>{labels.priestOffice}</span>
              <span className="font-bold">{pageLabel(2)}</span>
            </div>
          </div>
        </div>
        )}

        {/* ==================================================================== */}
        {/* PAGE 3: DOSHAS & REMEDIES + REAL-TIME LIVE GOCHARA                   */}
        {/* ==================================================================== */}
        {(!activePage || activePage === "all" || activePage === 3) && (
        <div
          className="pdf-page relative bg-[#FFFDF8]"
          style={{ width: "900px", minHeight: "1273px", boxSizing: "border-box", padding: "40px", pageBreakAfter: "always" }}
        >
          <div className={`${pageBorder} h-full flex flex-col justify-between`}>
            <div className={innerDashed} />
            <div>
              {/* Running Page Header */}
              <div className="flex justify-between items-center pb-2 border-b border-amber-800/30 text-[11px] text-amber-800">
                <span className="font-bold">{labels.pageHeaderTitle}</span>
                <span>{data.name} — {labels.page3HeaderSub}</span>
              </div>

              {/* Section 4: Doshas and Pariharas */}
              <div className="mt-4">
                <h2 className="text-lg font-black text-rose-900 border-b-2 border-rose-700/40 pb-1 mb-3 flex items-center gap-2">
                  <span>🛡️</span>
                  <span>{labels.doshasTitle}</span>
                </h2>
                <div className="space-y-3">
                  {data.doshas.slice(0, 3).map((d, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-300 shadow-sm text-xs">
                      <div className="font-black text-rose-950 text-sm mb-1 flex items-center justify-between">
                        <span>{d.name}</span>
                        <span className="text-[10px] font-sans font-bold bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                          {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ನಿವಾರಣೆ" : "Authentic Remedy"}
                        </span>
                      </div>
                      <p className="text-amber-950 font-serif leading-relaxed text-justify mb-2">{d.impact}</p>
                      {d.remedy && (
                        <div className="mt-2 pt-2 border-t border-rose-200/60 bg-amber-50/80 p-2.5 rounded-lg border border-amber-600/30">
                          <span className="font-bold text-amber-900 block mb-1">
                            🕉️ {isKn ? "ದೈವಿಕ ಪರಿಹಾರ ಕ್ರಮ & ಉಪಾಸನೆ:" : "Vedic Parihara & Sadhana:"}
                          </span>
                          <p className="text-amber-950 font-serif leading-relaxed">{d.remedy}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Gochara (Planetary Transits) */}
              <div className="mt-5">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-3 flex items-center gap-2">
                  <span>🪐</span>
                  <span>{labels.gocharaTitle}</span>
                </h2>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  {data.gochara.slice(0, 3).map((g, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/60 rounded-lg border border-amber-700/20">
                      <div className="font-black text-amber-900 text-sm mb-1 flex items-center justify-between">
                        <span>{g.name}</span>
                        <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded">
                          {isKn ? "ನೈಜ ಗೋಚಾರ" : "Live Transit"}
                        </span>
                      </div>
                      <p className="text-amber-950 font-serif leading-relaxed text-justify">{g.impact}</p>
                      {g.remedy && (
                        <div className="mt-1.5 text-[11px] text-amber-900 font-semibold">
                          <span>✨ {isKn ? "ಪರಿಹಾರ:" : "Remedy:"} </span>
                          <span className="font-serif">{g.remedy}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-amber-800/30 flex justify-between items-center text-[11px] text-amber-800">
              <span>{labels.priestOffice}</span>
              <span className="font-bold">{pageLabel(3)}</span>
            </div>
          </div>
        </div>
        )}

        {/* ==================================================================== */}
        {/* PAGE 4: 6-MONTH ASTROLOGICAL ROADMAP & TIMELINE                      */}
        {/* ==================================================================== */}
        {(!activePage || activePage === "all" || activePage === 4) && (
        <div
          className="pdf-page relative bg-[#FFFDF8]"
          style={{ width: "900px", minHeight: "1273px", boxSizing: "border-box", padding: "40px", pageBreakAfter: "always" }}
        >
          <div className={`${pageBorder} h-full flex flex-col justify-between`}>
            <div className={innerDashed} />
            <div>
              {/* Running Page Header */}
              <div className="flex justify-between items-center pb-2 border-b border-amber-800/30 text-[11px] text-amber-800">
                <span className="font-bold">{labels.pageHeaderTitle}</span>
                <span>{data.name} — {labels.page4HeaderSub}</span>
              </div>

              {/* Section 6: 6-Month Detailed Timeline */}
              <div className="mt-4">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-3 flex items-center gap-2">
                  <span>📅</span>
                  <span>{labels.timelineTitle}</span>
                </h2>
                <div className="space-y-3">
                  {data.timeline.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/90 rounded-xl border border-amber-700/30 shadow-sm text-xs">
                      {/* Month Header Banner */}
                      <div className="flex justify-between items-center bg-amber-100/70 p-2 rounded-lg border border-amber-600/30 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-black text-amber-950 text-sm">{item.monthName}</span>
                          <span className="text-[11px] text-amber-800">({item.dateRange})</span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                          {item.dashaInfluence}
                        </span>
                      </div>

                      {/* Planetary Shift & Prediction */}
                      <p className="text-amber-950 font-serif leading-relaxed text-justify mb-2">
                        {item.forecast || item.transitSummary}
                      </p>

                      {/* Auspicious Dates, Caution Dates & Upasana 3-Badge Strip */}
                      <div className="grid grid-cols-12 gap-2 text-[11px] pt-2 border-t border-amber-700/20">
                        <div className="col-span-4 bg-emerald-50 border border-emerald-300 p-1.5 rounded text-emerald-950">
                          <span className="font-black text-emerald-800 block">🟢 {isKn ? "ಶುಭ ದಿನಗಳು (ಚಂದ್ರಬಲ):" : "Auspicious Dates:"}</span>
                          <span className="font-bold font-sans">{item.shubhaDinagalu}</span>
                        </div>
                        <div className="col-span-4 bg-rose-50 border border-rose-300 p-1.5 rounded text-rose-950">
                          <span className="font-black text-rose-800 block">🔴 {isKn ? "ಚಂದ್ರಾಷ್ಟಮ / ಎಚ್ಚರಿಕೆಯ ದಿನ:" : "Caution Dates:"}</span>
                          <span className="font-bold font-sans">{item.chandrashtamaDinagalu}</span>
                        </div>
                        <div className="col-span-4 bg-amber-50 border border-amber-300 p-1.5 rounded text-amber-950">
                          <span className="font-black text-amber-800 block">🕉️ {isKn ? "ಮಾಸಿಕ ಉಪಾಸನೆ:" : "Monthly Upasana:"}</span>
                          <span className="font-serif">{item.monthlyUpasana}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-amber-800/30 flex justify-between items-center text-[11px] text-amber-800">
              <span>{labels.priestOffice}</span>
              <span className="font-bold">{pageLabel(4)}</span>
            </div>
          </div>
        </div>
        )}

        {/* ==================================================================== */}
        {/* PAGE 5: 4 LIFE DIMENSIONS, ASHIRVADA, SHLOKA & PRIEST QR SEAL       */}
        {/* ==================================================================== */}
        {(!activePage || activePage === "all" || activePage === 5) && (
        <div
          className="pdf-page relative bg-[#FFFDF8]"
          style={{ width: "900px", minHeight: "1273px", boxSizing: "border-box", padding: "40px", pageBreakAfter: "always" }}
        >
          <div className={`${pageBorder} h-full flex flex-col justify-between`}>
            <div className={innerDashed} />
            <div>
              {/* Running Page Header */}
              <div className="flex justify-between items-center pb-2 border-b border-amber-800/30 text-[11px] text-amber-800">
                <span className="font-bold">{labels.pageHeaderTitle}</span>
                <span>{data.name} — {labels.page5HeaderSub}</span>
              </div>

              {/* Section 7: 4 Key Life Areas */}
              <div className="mt-4">
                <h2 className="text-lg font-black text-amber-900 border-b-2 border-amber-700/40 pb-1 mb-3 flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{labels.lifeAreasTitle}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* 1. Career & Profession */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-700/30">
                    <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>💼</span>
                      <span>{isKn ? "ವೃತ್ತಿ & ಉದ್ಯೋಗ ಭಾಗ್ಯ" : isHi ? "करियर एवं आजीविका" : isTe ? "వృత్తి & ఉద్యోగ భాగ్యం" : isTa ? "தொழில் & உத்தியோகம்" : "Career & Profession"}</span>
                    </div>
                    {renderDomainParas(data.careerGuidance)}
                  </div>

                  {/* 2. Wealth & Finance */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-700/30">
                    <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>🪙</span>
                      <span>{isKn ? "ಧನ & ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ" : isHi ? "धन एवं आर्थिक समृद्धि" : isTe ? "ధన & ఆర్థిక సమృద్ధి" : isTa ? "தனம் & நிதி நிலை" : "Wealth & Finance"}</span>
                    </div>
                    {renderDomainParas(data.financeGuidance)}
                  </div>

                  {/* 3. Marriage & Relationships */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-700/30">
                    <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>💍</span>
                      <span>{isKn ? "ವಿವಾಹ & ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ" : isHi ? "विवाह एवं पारिवारिक सुख" : isTe ? "వివాహ & కుటుంబ సౌఖ్యం" : isTa ? "திருமணம் & குடும்ப வாழ்வு" : "Marriage & Family Harmony"}</span>
                    </div>
                    {renderDomainParas(data.relationshipGuidance)}
                  </div>

                  {/* 4. Children & Progeny Legacy */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-700/30">
                    <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>👶</span>
                      <span>{isKn ? "ಸಂತಾನ ಭಾಗ್ಯ & ವಂಶಾಭಿವೃದ್ಧಿ" : isHi ? "संतान सुख एवं कुल प्रतिष्ठा" : isTe ? "సంతాన భాగ్యం & వంశాభివృద్ధి" : isTa ? "புத்திர பாக்கியம் & சந்ததி" : "Children & Lineage Legacy"}</span>
                    </div>
                    {renderDomainParas(data.childrenGuidance || data.relationshipGuidance)}
                  </div>

                  {/* 5. Health & Vitality (Spanning full width across 2 columns) */}
                  <div className="col-span-2 p-3 bg-amber-50/70 rounded-xl border border-amber-700/30">
                    <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>🌿</span>
                      <span>{isKn ? "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ಬಲ" : isHi ? "आरोग्य एवं दीर्घायु" : isTe ? "ఆరోగ్యం & ఆయుర్బలం" : isTa ? "ஆரோக்கியம் & ஆயுள் பலம்" : "Health & Vitality"}</span>
                    </div>
                    {renderDomainParas(data.healthGuidance)}
                  </div>
                </div>
              </div>

              {/* Sacred Sanskrit Shloka */}
              <div className="mt-5 text-center p-4 bg-amber-100/40 rounded-xl border-y-2 border-amber-800/40">
                <div className="text-amber-900 font-bold text-base leading-relaxed" style={{ fontFamily: "Noto Sans Devanagari, serif" }}>
                  {data.shloka || "असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय॥ ॐ शान्तिः शान्तिः शान्तिः॥"}
                </div>
              </div>

              {/* Astrologer's Benediction (Ashirvada) */}
              <div className="mt-4 p-4 bg-amber-50/90 rounded-xl border border-amber-600/40 text-center">
                <span className="text-2xl text-amber-700 block mb-1">ॐ</span>
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-1.5">
                  {labels.ashirvadaTitle}
                </h3>
                <p className="text-xs text-amber-950 font-serif italic max-w-xl mx-auto leading-relaxed">
                  "{data.ashirvada}"
                </p>
              </div>

              {/* Official Royal Verification Seal & Priest Contact Card */}
              <div className="mt-4 p-4 rounded-xl border-2 border-amber-800/60 bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-100/80 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👑</span>
                      <span className="font-black text-amber-950 text-sm uppercase tracking-wide">
                        {labels.priestOffice}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-900">
                      {labels.priestName}
                    </div>
                    <div className="text-xs text-amber-900">
                      <span>📞 {isKn ? "ದೂರವಾಣಿ / ನೇರ ಸಂಪರ್ಕ:" : "Direct Call:"} </span>
                      <span className="font-bold font-sans text-amber-950">{labels.contactPhone}</span>
                    </div>
                    <div className="text-[11px] text-amber-800 italic">
                      {labels.scanHelp}
                    </div>
                  </div>

                  {/* Scannable High-Definition QR Code */}
                  <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-amber-700/40 shadow-sm shrink-0">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Baggona Panchanga Priest Verification QR" className="w-20 h-20 object-contain" />
                    ) : (
                      <div className="w-20 h-20 bg-amber-100 flex items-center justify-center text-xs text-amber-800">
                        QR Code
                      </div>
                    )}
                    <span className="text-[9px] font-sans font-bold text-amber-900 mt-1">
                      {isKn ? "ಪರಿಶೀಲನಾ ಮುದ್ರೆ" : "Verified Seal"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-amber-800/30 flex justify-between items-center text-[11px] text-amber-800">
              <span>{labels.priestOffice}</span>
              <span className="font-bold">{pageLabel(5)}</span>
            </div>
          </div>
        </div>
        )}

      </div>
    );
  }
);

RoyalA4PrintTemplate.displayName = "RoyalA4PrintTemplate";
export default RoyalA4PrintTemplate;
