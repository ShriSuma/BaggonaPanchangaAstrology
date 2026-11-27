/**
 * ============================================================================
 * BAGGONA PANCHANGA — SELF-EXPLANATORY VISUAL CHAPTER INFOGRAPHICS
 * ============================================================================
 * Designed so the user understands EVERY chapter at a 1-second glance purely
 * from the visual diagram + Near-vs-Far strips, without wading through text:
 *   1. ZERO <table> tags (pure inline <svg> + CSS Flexbox/Grid).
 *   2. html2canvas-safe (numeric width/height/viewBox, hex fills, zero filters).
 *   3. Highlights THAT chapter's exact House (focusHouse) or Horizon Year
 *      (focusYearOffset) and Verdict Badge directly inside the SVG.
 *   4. Side-by-side "Near You Now" (emerald) vs "Fading Behind" (amber) cards.
 *   5. Consolidated Active Dosha Highlight Matrix on Chapter 23.
 * ============================================================================
 */

import React from "react";
import { type SevenLang, pick7, RASHI_7L, toNativeDigits7L, getIndicFontFamily7L } from "../../services/sampoornaMaster25Locale7L";
import type {
  ActiveDoshaProfile,
  ChapterVisualSummary,
  ChapterVisualType,
  ChartVisualMetrics,
} from "../../services/sampoornaMaster25StoryEngine";

interface Props {
  chapterNumber: number;
  visualType?: ChapterVisualType;
  metrics?: ChartVisualMetrics;
  visualSummary?: ChapterVisualSummary;
  lang: SevenLang;
  activeDoshaProfiles?: ActiveDoshaProfile[];
  bhuktiEndDate?: string;
}

function nDigits(val: number | string, lang: SevenLang): string {
  return toNativeDigits7L(val, lang);
}

const FONT_STACK: Record<SevenLang, string> = {
  kn: getIndicFontFamily7L("kn"),
  mr: getIndicFontFamily7L("mr"),
  hi: getIndicFontFamily7L("hi"),
  te: getIndicFontFamily7L("te"),
  ta: getIndicFontFamily7L("ta"),
  ml: getIndicFontFamily7L("ml"),
  en: "'Outfit', Georgia, sans-serif",
};

export const SampoornaChapterVisual: React.FC<Props> = ({
  chapterNumber,
  visualType = "energy-gauge",
  metrics,
  visualSummary,
  lang,
  activeDoshaProfiles,
  bhuktiEndDate,
}) => {
  if (!metrics) return null;
  const font = FONT_STACK[lang] || FONT_STACK.en;
  const n = (v: number | string) => nDigits(v, lang);

  // Instant 1-glance Near vs Far comparison strip shown right below visual SVG
  const renderNearFarBar = () => {
    if (!visualSummary) return null;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #86efac",
            borderRadius: "6px",
            padding: "7px 11px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#166534" }}>
            📍 {visualSummary.nearLabel}
          </span>
          <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#14532d", lineHeight: 1.32 }}>
            {visualSummary.nearValue}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "6px",
            padding: "7px 11px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#92400e" }}>
            🌫️ {visualSummary.farLabel}
          </span>
          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#78350f", lineHeight: 1.32 }}>
            {visualSummary.farValue}
          </span>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // CHAPTER 23 SPECIALTY: CONSOLIDATED ACTIVE DOSHA HIGHLIGHT CARDS
  // ──────────────────────────────────────────────────────────────────────────
  if (chapterNumber === 23 && activeDoshaProfiles && activeDoshaProfiles.length > 0) {
    const cards = activeDoshaProfiles.slice(0, 4);
    const headerTitle = pick7(
      {
        kn: "ಪ್ರಸ್ತುತ ಜಾತಕದ ಪ್ರಮುಖ ದೋಷಗಳು, ಪರಿಣಾಮ ಮತ್ತು ನಿಖರ ಪರಿಹಾರ",
        mr: "कुंडलीतील प्रमुख सक्रिय दोष, सद्यस्थिती आणि नेमके निवारण",
        hi: "कुंडली के प्रमुख सक्रिय दोष, वर्तमान प्रभाव एवं सटीक समाधान",
        te: "జాతకంలోని ప్రధాన క్రియాశీల దోషాలు, ప్రభావం & ఖచ్చిత పరిహారం",
        ta: "ஜாதகத்தின் முக்கிய தோஷங்கள், தாக்கம் மற்றும் சரியான தீர்வு",
        ml: "ജാതകത്തിലെ പ്രധാന ദോഷങ്ങളും നിലവിലെ ഫലവും കൃത്യമായ പരിഹാരവും",
        en: "Consolidated Active Dosha Highlight: Happening Now, Impact Area & Exact Action",
      },
      lang
    );
    const lblNow = pick7(
      { kn: "ಈಗ ಏನಾಗುತ್ತಿದೆ:", mr: "सध्याचा परिणाम:", hi: "अभी क्या हो रहा है:", te: "ప్రస్తుతం జరిగేది:", ta: "இப்போதைய நிலை:", ml: "ഇപ്പോഴത്തെ അവസ്ഥ:", en: "Happening Now:" },
      lang
    );
    const lblArea = pick7(
      { kn: "ಪರಿಣಾಮದ ಕ್ಷೇತ್ರ:", mr: "प्रभावित क्षेत्र:", hi: "प्रभावित क्षेत्र:", te: "ప్రభావిత రంగం:", ta: "பாதிக்கும் துறை:", ml: "സ്വാധീന മേഖല:", en: "Phase / Area:" },
      lang
    );
    const lblFix = pick7(
      { kn: "ನಿಖರ ಪರಿಹಾರ:", mr: "योग्य उपाय:", hi: "सटीक समाधान:", te: "సరైన పరిహారం:", ta: "சரியான தீர்வு:", ml: "കൃത്യമായ പരിഹാരം:", en: "Exact Solution:" },
      lang
    );

    return (
      <div
        style={{
          marginTop: "10px",
          backgroundColor: "#fdf3dc",
          border: "1px solid #e6c280",
          borderRadius: "10px",
          padding: "10px 12px",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            paddingBottom: "5px",
            borderBottom: "1px solid #e2b86d",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 800, color: "#78350f" }}>{headerTitle}</span>
          {visualSummary?.glanceVerdict && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#ffffff",
                backgroundColor: "#9a3412",
                padding: "2px 8px",
                borderRadius: "9999px",
                whiteSpace: "nowrap",
              }}
            >
              {visualSummary.glanceVerdict}
            </span>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cards.length >= 2 ? "1fr 1fr" : "1fr",
            gap: "8px",
          }}
        >
          {cards.map((d) => (
            <div
              key={d.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e6c280",
                borderRadius: "6px",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "6px",
                  borderBottom: "1px solid #fef3c7",
                  paddingBottom: "3px",
                }}
              >
                <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#7c2d12" }}>{d.title}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#92400e",
                    backgroundColor: "#fef3c7",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.severityLabel}
                </span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: 1.38, color: "#291505" }}>
                <strong style={{ color: "#92400e" }}>{lblNow} </strong>
                {d.doingNow}
              </div>
              <div style={{ fontSize: "12px", lineHeight: 1.38, color: "#291505" }}>
                <strong style={{ color: "#92400e" }}>{lblArea} </strong>
                {d.affectingArea}
              </div>
              <div style={{ fontSize: "12px", lineHeight: 1.38, color: "#14532d", fontWeight: 600 }}>
                <strong style={{ color: "#166534" }}>{lblFix} </strong>
                {d.exactAction}
              </div>
            </div>
          ))}
        </div>
        {renderNearFarBar()}
      </div>
    );
  }

  // Outer Royal Card matching Premium PDF V1 aesthetics (clear caption + instant verdict chip + SVG + Near/Far)
  const wrapBox = (caption: string, svgEl: React.ReactNode) => (
    <div
      style={{
        marginTop: "10px",
        backgroundColor: "#fdf6e4",
        border: "1px solid #e6c280",
        borderRadius: "10px",
        padding: "10px 12px",
        letterSpacing: "normal",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
          paddingBottom: "5px",
          borderBottom: "1px solid #ebd19a",
        }}
      >
        <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350f" }}>
          {caption}
        </span>
        {visualSummary?.glanceVerdict && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#ffffff",
              backgroundColor: "#b45309",
              padding: "2px 10px",
              borderRadius: "9999px",
              whiteSpace: "nowrap",
            }}
          >
            ✦ {visualSummary.glanceVerdict}
          </span>
        )}
      </div>
      {svgEl}
      {renderNearFarBar()}
    </div>
  );

  // 1. ENERGY GAUGE (Tarabala Clarity + Guru vs Shani vs Maandi Visual Signals)
  if (visualType === "energy-gauge") {
    const score = Math.max(25, Math.min(98, Math.round(metrics.tarabalaScore || 72)));
    const angleDeg = -90 + (score / 100) * 180;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const cx = 165;
    const cy = 116;
    const nx = cx + 68 * Math.cos(rad);
    const ny = cy + 68 * Math.sin(rad);

    const caption = pick7(
      {
        kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ಜನ್ಮ ಶಕ್ತಿ ಮತ್ತು ಗ್ರಹ ಗೋಚಾರ ದಿಕ್ಸೂಚಿ",
        mr: "तात्काळ दृश्य: जन्म ऊर्जा व ग्रह गोचर स्थिती",
        hi: "तत्काल दृश्य संकेत: जन्म ऊर्जा एवं ग्रह संतुलन सूचकांक",
        te: "చూడగానే అర్థమయ్యే చిత్రం: జన్మ శక్తి & గోచార సూచిక",
        ta: "பார்த்தவுடன் புரியும் படம்: பிறப்பு ஆற்றல் & கோசார அளவி",
        ml: "തൽക്ഷണ ചിത്രം: ജന്മബലവും ഗ്രഹഗോചര സൂചികയും",
        en: "At-a-Glance Cosmic Gauge: Clarity & Planetary Alignment",
      },
      lang
    );

    const lblClarity = pick7({ kn: "ಪ್ರಸ್ತುತ ಸ್ಪಷ್ಟತೆ", mr: "सध्याची स्पष्टता", hi: "वर्तमान स्पष्टता", te: "ప్రస్తుత స్పష్టత", ta: "தற்போதைய தெளிவு", ml: "നിലവിലെ വ്യക്തത", en: "Clarity Index" }, lang);
    const lblGuru = pick7({ kn: "ಗುರು ಬಲ ಸ್ಥಾನ", mr: "गुरू अनुकूलता", hi: "गुरु बल भाव", te: "గురు బల స్థానం", ta: "குரு பல இடம்", ml: "വ്യാഴ ബല ഭാവം", en: "Jupiter Door" }, lang);
    const lblShani = pick7({ kn: "ಶನಿ ಶಿಸ್ತು ಸ್ಥಾನ", mr: "शनी स्थैर्य स्थान", hi: "शनि निर्माण भाव", te: "శని స్థిర స్థానం", ta: "சனி உறுதி இடம்", ml: "ശനി സ്ഥിര ഭാവം", en: "Saturn Anchor" }, lang);
    const lblMaandi = pick7({ kn: "ಮಾಂದಿ ಗಮನ ಮನೆ", mr: "मांदी सूक्ष्म स्थान", hi: "मांदी सूक्ष्म भाव", te: "మాంది జాగ్రత్త స్థానం", ta: "மாந்தி கவன இடம்", ml: "മാന്ദി ശ്രദ്ധാ ഭാവം", en: "Maandi Focus" }, lang);

    return wrapBox(
      caption,
      <svg width="785" height="142" viewBox="0 0 785 142" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <path d="M 80 116 A 85 85 0 0 1 250 116" fill="none" stroke="#fde68a" strokeWidth="16" strokeLinecap="round" />
        <path d="M 80 116 A 85 85 0 0 1 134 36" fill="none" stroke="#ea580c" strokeWidth="16" strokeLinecap="round" />
        <path d="M 138 34 A 85 85 0 0 1 194 35" fill="none" stroke="#d97706" strokeWidth="16" />
        <path d="M 198 37 A 85 85 0 0 1 250 116" fill="none" stroke="#16a34a" strokeWidth="16" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6.5" fill="#78350f" />
        <text x={cx} y={92} textAnchor="middle" fill="#451a03" fontSize="22" fontWeight="800">
          {`${n(score)}%`}
        </text>
        <text x={cx} y={134} textAnchor="middle" fill="#92400e" fontSize="11.5" fontWeight="700">
          {lblClarity}
        </text>

        <rect x="325" y="12" width="142" height="114" rx="8" fill="#ecfdf5" stroke="#22c55e" strokeWidth="1.2" />
        <text x="396" y="42" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="800">{lblGuru}</text>
        <text x="396" y="82" textAnchor="middle" fill="#15803d" fontSize="24" fontWeight="800">{n(metrics.guruHouseFromMoon)}</text>
        <text x="396" y="109" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">{`${n(metrics.guruTransitSav)}/${n(48)}`}</text>

        <rect x="480" y="12" width="142" height="114" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.2" />
        <text x="551" y="42" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="800">{lblShani}</text>
        <text x="551" y="82" textAnchor="middle" fill="#b45309" fontSize="24" fontWeight="800">{n(metrics.shaniHouseFromMoon)}</text>
        <text x="551" y="109" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">{`${n(metrics.shaniTransitSav)}/${n(48)}`}</text>

        <rect x="635" y="12" width="140" height="114" rx="8" fill="#ffffff" stroke="#d97706" strokeWidth="1.2" />
        <text x="705" y="42" textAnchor="middle" fill="#9a3412" fontSize="12" fontWeight="800">{lblMaandi}</text>
        <text x="705" y="82" textAnchor="middle" fill="#9a3412" fontSize="24" fontWeight="800">{n(metrics.maandiHouse)}</text>
        <text x="705" y="109" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">{metrics.yogiPlanetName}</text>
      </svg>
    );
  }

  // 2. TIMELINE METER (Visual Story Bridge from Past Filter -> Now -> Cycle Switch -> Golden Peak)
  if (visualType === "timeline-meter") {
    const caption = pick7(
      {
        kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ಕಳೆದ ಪರೀಕ್ಷೆಯಿಂದ ಮುಂದಿನ ಸುವರ್ಣ ಶಿಖರದ ಪಯಣ",
        mr: "तात्काळ दृश्य: कसोटीच्या टप्प्यापासून सुवर्ण वळणापर्यंतचा प्रवास",
        hi: "तत्काल दृश्य: पिछली परीक्षा से स्वर्णिम शिखर की जीवन-रेखा",
        te: "చూడగానే అర్థమయ్యే చిత్రం: గత పరీక్ష నుండి సువర్ణ మలుపు వరకు",
        ta: "பார்த்தவுடன் புரியும் படம்: கடந்த சோதனையிலிருந்து பொற்காலம் வரை",
        ml: "തൽക്ഷണ ചിത്രം: കടന്ന വെല്ലുവിളികളിൽ നിന്ന് സുവർണ്ണ ഘട്ടത്തിലേക്ക്",
        en: "At-a-Glance Story Bridge: Cleared Past -> Today's Turn -> Golden Crest",
      },
      lang
    );

    const nodes = [
      { x: 92, color: "#9ca3af", status: "✓", yr: `${n(metrics.nowYear - 2)}–${n(metrics.nowYear - 1)}`, lbl: pick7({ kn: "ಹಳೆಯ ಪಾಠ ಮುಕ್ತಾಯ", mr: "जुना टप्पा समाप्त", hi: "पिछली परीक्षा पूर्ण", te: "గత పరీక్ష పూర్తి", ta: "கடந்த சோதனை முடிவு", ml: "പഴയ പരീക്ഷണം കഴിഞ്ഞു", en: "Past Storm Cleared" }, lang) },
      { x: 296, color: "#d97706", status: "⚡", yr: `${n(metrics.nowYear)}`, lbl: pick7({ kn: "ಈಗಿನ ತಿರುವು", mr: "सध्याचे वळण", hi: "वर्तमान मोड़", te: "ప్రస్తుత మలుపు", ta: "இப்போதைய திருப்பம்", ml: "ഇപ്പോഴത്തെ വഴിത്തിരിവ്", en: "Live Turning Scene" }, lang) },
      { x: 500, color: "#0284c7", status: "🔑", yr: n((bhuktiEndDate || `${metrics.nowYear + 1}`).slice(0, 7)), lbl: pick7({ kn: "ದಶಾ ಬದಲಾವಣೆ", mr: "दशा परिवर्तन", hi: "भुक्ति मोड़", te: "దశ మార్పు", ta: "தசா மாற்றம்", ml: "ദശാ മാറ്റം", en: "Cycle Unlock Date" }, lang) },
      { x: 700, color: "#15803d", status: "★", yr: `${n(metrics.nowYear + 2)}–${n(metrics.nowYear + 4)}`, lbl: pick7({ kn: "ಸುವರ್ಣ ಶಿಖರ", mr: "सुवर्ण शिखर", hi: "स्वर्णिम शिखर", te: "సువర్ణ శిఖరం", ta: "பொற்கால உச்சம்", ml: "സുവർണ്ണ ശിഖരം", en: "Golden Ascent" }, lang) },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="138" viewBox="0 0 785 138" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <line x1="92" y1="64" x2="296" y2="64" stroke="#d1d5db" strokeWidth="6" strokeLinecap="round" />
        <line x1="296" y1="64" x2="700" y2="64" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
        {nodes.map((nd, idx) => (
          <g key={idx}>
            <circle cx={nd.x} cy={64} r="18" fill="#ffffff" stroke={nd.color} strokeWidth="4" />
            <text x={nd.x} y={70} textAnchor="middle" fill={nd.color} fontSize="14" fontWeight="800">{nd.status}</text>
            <text x={nd.x} y={32} textAnchor="middle" fill="#451a03" fontSize="12.5" fontWeight="800">{nd.yr}</text>
            <text x={nd.x} y={108} textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">{nd.lbl}</text>
          </g>
        ))}
      </svg>
    );
  }

  // 3. RASHI MANDALA (12-Sign Visual Wheel + Active Spot Focus)
  if (visualType === "rashi-mandala") {
    const caption = pick7(
      {
        kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ದ್ವಾದಶ ರಾಶಿ ಚಕ್ರ ಮತ್ತು ಮುಖ್ಯ ಶಕ್ತಿ ಬಿಂದುಗಳು",
        mr: "तात्काळ दृश्य: द्वादश राशी चक्र व मुख्य ग्रह स्थिती",
        hi: "तत्काल दृश्य: द्वादश राशि चक्र एवं मुख्य शक्ति बिंदु",
        te: "చూడగానే అర్థమయ్యే చిత్రం: 12 రాశుల చక్రం & ముఖ్య స్థానాలు",
        ta: "பார்த்தவுடன் புரியும் படம்: 12 ராசி சக்கரம் & முக்கிய புள்ளிகள்",
        ml: "തൽക്ഷണ ചിത്രം: പന്ത്രണ്ട് രാശി ചക്രവും പ്രധാന ബിന്ദുക്കളും",
        en: "At-a-Glance 12-Sign Mandala & Key Orbit Markers",
      },
      lang
    );

    const mp = metrics.mandalaPlacements;
    const markersByRashi: Record<number, string[]> = {};
    const addM = (rIdx: number, tag: string) => {
      const k = ((rIdx % 12) + 12) % 12;
      if (!markersByRashi[k]) markersByRashi[k] = [];
      markersByRashi[k].push(tag);
    };
    addM(mp.lagnaRashiIdx, pick7({ kn: "ಲ", mr: "ल", hi: "ल", te: "ల", ta: "ல", ml: "ല", en: "Lg" }, lang));
    addM(mp.moonRashiIdx, pick7({ kn: "ಚಂ", mr: "चं", hi: "चं", te: "చం", ta: "ச", ml: "ച", en: "Mo" }, lang));
    addM(mp.yogiRashiIdx, pick7({ kn: "ಯೋ", mr: "यो", hi: "यो", te: "యో", ta: "யோ", ml: "യോ", en: "Yg" }, lang));
    addM(mp.maandiRashiIdx, pick7({ kn: "ಮಾ", mr: "मां", hi: "मां", te: "మాం", ta: "மா", ml: "മാ", en: "Mn" }, lang));
    addM(mp.jupiterRashiIdx, pick7({ kn: "ಗು", mr: "गु", hi: "गु", te: "గు", ta: "கு", ml: "ഗു", en: "Ju" }, lang));
    addM(mp.saturnRashiIdx, pick7({ kn: "ಶ", mr: "श", hi: "श", te: "శ", ta: "சனி", ml: "ശ", en: "Sa" }, lang));

    const cx = 128;
    const cy = 84;
    const legendItems = [
      { code: pick7({ kn: "ಲ", mr: "ल", hi: "ल", te: "ల", ta: "ல", ml: "ല", en: "Lg" }, lang), label: pick7({ kn: "ಜನ್ಮ ಲಗ್ನ", mr: "जन्म लग्न", hi: "जन्म लग्न", te: "జన్మ లగ్నం", ta: "ஜனன லக்னம்", ml: "ജന്മലഗ്നം", en: "Natal Lagna" }, lang), val: RASHI_7L[mp.lagnaRashiIdx]?.[lang] || "" },
      { code: pick7({ kn: "ಚಂ", mr: "चं", hi: "चं", te: "చం", ta: "ச", ml: "ച", en: "Mo" }, lang), label: pick7({ kn: "ಚಂದ್ರ ರಾಶಿ", mr: "चंद्र राशी", hi: "चंद्र राशि", te: "చంద్ర రాశి", ta: "சந்திர ராசி", ml: "ചന്ദ്രരാശി", en: "Moon Sign" }, lang), val: RASHI_7L[mp.moonRashiIdx]?.[lang] || "" },
      { code: pick7({ kn: "ಯೋ", mr: "यो", hi: "यो", te: "యో", ta: "யோ", ml: "യോ", en: "Yg" }, lang), label: pick7({ kn: "ಯೋಗಿ ಬಲ", mr: "योगी बल", hi: "योगी बल", te: "యోగి బలం", ta: "யோகி பலம்", ml: "യോഗി ബലം", en: "Yogi Boost" }, lang), val: `${metrics.yogiPlanetName} (${RASHI_7L[mp.yogiRashiIdx]?.[lang] || ""})` },
      { code: pick7({ kn: "ಮಾ", mr: "मां", hi: "मां", te: "మాం", ta: "மா", ml: "മാ", en: "Mn" }, lang), label: pick7({ kn: "ಮಾಂದಿ ಕೀಲಿ", mr: "मांदी गाठ", hi: "मांदी कुंजी", te: "మాంది ముడి", ta: "மாந்தி முடிச்சு", ml: "മാന്ദി സ്ഥാനം", en: "Maandi Focus" }, lang), val: `${RASHI_7L[mp.maandiRashiIdx]?.[lang] || ""} (${n(metrics.maandiHouse)})` },
      { code: pick7({ kn: "ಭೃ", mr: "भृ", hi: "भृ", te: "భృ", ta: "பி", ml: "ഭൃ", en: "BB" }, lang), label: pick7({ kn: "ಬೃಗು ಬಿಂದು", mr: "भृगु बिंदू", hi: "भृगु बिंदु", te: "భృగు బిందువు", ta: "பிருகு பிந்து", ml: "ഭൃഗു ബിന്ദു", en: "Destiny Bindu" }, lang), val: metrics.bhriguRashiName },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="168" viewBox="0 0 785 168" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <circle cx={cx} cy={cy} r="74" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="40" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#78350f" fontSize="12.5" fontWeight="800">
          {RASHI_7L[mp.lagnaRashiIdx]?.[lang] || ""}
        </text>
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = -90 + i * 30;
          const rad1 = (deg * Math.PI) / 180;
          const midRad = ((deg + 15) * Math.PI) / 180;
          const lx = cx + 74 * Math.cos(rad1);
          const ly = cy + 74 * Math.sin(rad1);
          const ix = cx + 40 * Math.cos(rad1);
          const iy = cy + 40 * Math.sin(rad1);
          const px = cx + 57 * Math.cos(midRad);
          const py = cy + 57 * Math.sin(midRad);
          const tags = markersByRashi[i];
          const isHighlight = Boolean(tags && tags.length > 0);
          return (
            <g key={i}>
              <line x1={ix} y1={iy} x2={lx} y2={ly} stroke="#e2b45d" strokeWidth="1" />
              {isHighlight ? (
                <>
                  <circle cx={px} cy={py} r="11" fill={i === mp.maandiRashiIdx ? "#9a3412" : i === mp.lagnaRashiIdx ? "#15803d" : "#d97706"} />
                  <text x={px} y={py + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                    {tags.slice(0, 2).join(",")}
                  </text>
                </>
              ) : (
                <text x={px} y={py + 3} textAnchor="middle" fill="#92400e" fontSize="9.5" fontWeight="600">
                  {n(i + 1)}
                </text>
              )}
            </g>
          );
        })}

        {legendItems.map((it, idx) => {
          const ry = 10 + idx * 30;
          return (
            <g key={idx}>
              <rect x="255" y={ry} width="515" height="25" rx="5" fill={idx % 2 === 0 ? "#ffffff" : "#fef3c7"} stroke="#e6c280" strokeWidth="1" />
              <rect x="263" y={ry + 3.5} width="34" height="18" rx="4" fill="#92400e" />
              <text x="280" y={ry + 16} textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="800">{it.code}</text>
              <text x="308" y={ry + 16.5} fill="#78350f" fontSize="12.5" fontWeight="700">{it.label}</text>
              <text x="756" y={ry + 16.5} textAnchor="end" fill="#451a03" fontSize="12.5" fontWeight="800">{it.val}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // 4. ELEMENT RADAR (Panchabhuta Superpower Visual Bars)
  if (visualType === "element-radar") {
    const caption = pick7(
      {
        kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ಪಂಚಭೂತ ಸ್ವಭಾವ ಶಕ್ತಿ ಪ್ರಮಾಣ (★ = ಪ್ರಮುಖ ಬಲ)",
        mr: "तात्काळ दृश्य: पंचमहाभूत स्वभाव शक्ती संतुलन (★ = मुख्य बळ)",
        hi: "तत्काल दृश्य: पंचभूत स्वभाव शक्ति अनुपात (★ = प्रमुख बल)",
        te: "చూడగానే అర్థమయ్యే చిత్రం: పంచభూత స్వభావ బలం (★ = ప్రధాన శక్తి)",
        ta: "பார்த்தவுடன் புரியும் படம்: பஞ்சபூத இயல்பு பலம் (★ = முதன்மை பலம்)",
        ml: "തൽക്ഷണ ചിത്രം: പഞ്ചഭൂത സ്വഭാവ ശക്തി അനുപാതം (★ = പ്രധാന ബലം)",
        en: "At-a-Glance Elemental Signature (★ = Primary Superpower)",
      },
      lang
    );

    const elems = [
      { key: "fire" as const, pct: metrics.elemPercentages.fire, color: "#dc2626", bg: "#fee2e2", name: pick7({ kn: "🔥 ಅಗ್ನಿ (ಉತ್ಸಾಹ & ಧೈರ್ಯ)", mr: "🔥 अग्नी (नेतृत्व व ऊर्जा)", hi: "🔥 अग्नि (उत्साह व साहस)", te: "🔥 అగ్ని (ధైర్యం & చొరవ)", ta: "🔥 அக்னி (ஆற்றல் & துணிவு)", ml: "🔥 അഗ്നി (ഊർജ്ജവും ധൈര്യവും)", en: "🔥 Fire (Drive & Boldness)" }, lang) },
      { key: "earth" as const, pct: metrics.elemPercentages.earth, color: "#b45309", bg: "#fef3c7", name: pick7({ kn: "🌍 ಪೃಥ್ವಿ (ಸ್ಥಿರತೆ & ಆಸ್ತಿ)", mr: "🌍 पृथ्वी (स्थैर्य व व्यवहार)", hi: "🌍 पृथ्वी (स्थिरता व संपत्ति)", te: "🌍 పృథ్వి (స్థిరత్వం & ఆచరణ)", ta: "🌍 பூமி (நிலைத்தன்மை)", ml: "🌍 ഭൂമി (സ്ഥിരതയും സമ്പത്തും)", en: "🌍 Earth (Grounded Wealth)" }, lang) },
      { key: "air" as const, pct: metrics.elemPercentages.air, color: "#0284c7", bg: "#e0f2fe", name: pick7({ kn: "💨 ವಾಯು (ಬುದ್ಧಿ & ಸಂಪರ್ಕ)", mr: "💨 वायू (विचार व संवाद)", hi: "💨 वायु (विवेक व संपर्क)", te: "💨 వాయు (తెలివి & మాట)", ta: "💨 வாயு (அறிவு & தொடர்பு)", ml: "💨 വായു (ബുദ്ധിയും ആശയവിനിമയവും)", en: "💨 Air (Strategy & Voice)" }, lang) },
      { key: "water" as const, pct: metrics.elemPercentages.water, color: "#0d9488", bg: "#ccfbf1", name: pick7({ kn: "💧 ಜಲ (ಅಂತಃಪ್ರಜ್ಞೆ & ಪ್ರೀತಿ)", mr: "💧 जल (अंतर्ज्ञान व प्रेम)", hi: "💧 जल (अंतर्दृष्टि व भाव)", te: "💧 జల (అంతర్దృష్టి & ప్రేమ)", ta: "💧 நீர் (உள்ளுணர்வு & அன்பு)", ml: "💧 ജലം (ഉൾക്കാഴ്ചയും സ്നേഹവും)", en: "💧 Water (Intuition & Heart)" }, lang) },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="148" viewBox="0 0 785 148" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        {elems.map((el, idx) => {
          const y = 10 + idx * 34;
          const barMax = 375;
          const barW = Math.max(36, Math.round((el.pct / 100) * barMax));
          const isDom = el.key === metrics.dominantElementKey;
          return (
            <g key={el.key}>
              <text x="10" y={y + 17} fill={isDom ? "#451a03" : "#78350f"} fontSize="13" fontWeight={isDom ? "800" : "700"}>
                {el.name}
              </text>
              <rect x="292" y={y + 2} width={barMax} height="20" rx="10" fill={el.bg} />
              <rect x="292" y={y + 2} width={barW} height="20" rx="10" fill={el.color} />
              <text x="688" y={y + 17} fill="#451a03" fontSize="13.5" fontWeight="800">{`${n(el.pct)}%`}</text>
              {isDom && <text x="742" y={y + 17} fill="#15803d" fontSize="14" fontWeight="800">★</text>}
            </g>
          );
        })}
      </svg>
    );
  }

  // 5. SAV PILLARS (Highlights THAT Chapter's Specific Focus House with Emerald Crown!)
  if (visualType === "sav-pillars") {
    const focusH = visualSummary?.focusHouse;
    const caption = pick7(
      {
        kn: focusH
          ? `ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ${n(focusH)}ನೇ ಮನೆಯ ವಿಶೇಷ ಬಲ ಮತ್ತು ದ್ವಾದಶ ಭಾವ ಶಕ್ತಿ ನಕ್ಷೆ (ಹಸಿರು = ಪ್ರಸ್ತುತ ಅಧ್ಯಾಯದ ಕ್ಷೇತ್ರ)`
          : "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ದ್ವಾದಶ ಭಾವ ಶಕ್ತಿ ಸ್ತಂಭಗಳು (ಬಂಗಾರದ ಸ್ತಂಭ = ಅತಿ ಬಲಶಾಲಿ ಕ್ಷೇತ್ರ)",
        mr: focusH
          ? `तात्काळ दृश्य: या अध्यायाचे ${n(focusH)}वे स्थान व १२ स्थानांचा शक्ती आलेख (हिरवा = मुख्य लक्ष)`
          : "तात्काळ दृश्य: १२ स्थानांचा शक्ती आलेख (सुवर्ण = सर्वाधिक बळ)",
        hi: focusH
          ? `तत्काल दृश्य: इस अध्याय का ${n(focusH)}वां मुख्य भाव एवं द्वादश शक्ति स्तंभ (हरा = सक्रिय केंद्र)`
          : "तत्काल दृश्य: द्वादश भाव शक्ति स्तंभ (स्वर्ण = सर्वाधिक बल)",
        te: focusH
          ? `చూడగానే అర్థమయ్యే చిత్రం: ${n(focusH)}వ స్థాన బలం & 12 స్థానాల శక్తి (ఆకుపచ్చ = ప్రస్తుత అధ్యాయ రంగం)`
          : "చూడగానే అర్థమయ్యే చిత్రం: 12 స్థానాల శక్తి చిత్రం",
        ta: focusH
          ? `பார்த்தவுடன் புரியும் படம்: ${n(focusH)}-ம் வீடு மற்றும் 12 வீடுகளின் பலம் (பச்சை = இந்த அத்தியாய மையம்)`
          : "பார்த்தவுடன் புரியும் படம்: 12 வீடுகளின் பலம்",
        ml: focusH
          ? `തൽക്ഷണ ചിത്രം: ഈ അധ്യായത്തിലെ ${n(focusH)}-ാം ഭാവ ബലവും 12 ഭാവ ശക്തിയും (പച്ച = പ്രധാന കേന്ദ്രം)`
          : "തൽക്ഷണ ചിത്രം: 12 ഭാവങ്ങളുടെ ശക്തി സ്തംഭങ്ങൾ",
        en: focusH
          ? `At-a-Glance Strength Map: Green Crown = This Chapter's House (${focusH})`
          : "At-a-Glance 12-House Strength Map (Gold = Peak Domains >= 30)",
      },
      lang
    );

    const savs = metrics.savByHouse.length === 12 ? metrics.savByHouse : new Array(12).fill(28);
    const maxV = Math.max(40, ...savs);
    const colW = 54;
    const gap = 8;
    const startX = 28;
    const baseY = 128;

    return wrapBox(
      caption,
      <svg width="785" height="154" viewBox="0 0 785 154" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <line x1="20" y1={baseY - Math.round((28 / maxV) * 90)} x2="765" y2={baseY - Math.round((28 / maxV) * 90)} stroke="#d97706" strokeDasharray="5 4" strokeWidth="1.2" />
        {savs.map((val, idx) => {
          const hNum = idx + 1;
          const isFocus = focusH === hNum;
          const h = Math.max(16, Math.round((val / maxV) * 90));
          const x = startX + idx * (colW + gap);
          const y = baseY - h;
          const isPeak = val >= 30;
          const fill = isFocus ? "#15803d" : isPeak ? "#d97706" : val < 25 ? "#cbd5e1" : "#f59e0b";
          return (
            <g key={idx}>
              <rect x={x} y={y} width={colW} height={h} rx="5" fill={fill} stroke={isFocus ? "#052e16" : "none"} strokeWidth={isFocus ? "2" : "0"} />
              {isFocus && (
                <text x={x + colW / 2} y={Math.max(13, y - 16)} textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="800">
                  ★
                </text>
              )}
              <text x={x + colW / 2} y={y - 4} textAnchor="middle" fill={isFocus ? "#14532d" : "#451a03"} fontSize="11.5" fontWeight="800">
                {n(val)}
              </text>
              <text x={x + colW / 2} y={144} textAnchor="middle" fill={isFocus ? "#15803d" : "#78350f"} fontSize={isFocus ? "12.5" : "11.5"} fontWeight="800">
                {n(hNum)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // 6. HORIZON WAVE (Spotlights THAT Chapter's Specific Year on the 5-Year Curve!)
  if (visualType === "horizon-wave") {
    const focusYr = visualSummary?.focusYearOffset;
    const caption = pick7(
      {
        kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ೫ ವರ್ಷಗಳ ಅಭ್ಯುದಯ ರೇಖೆ (ಹಸಿರು ವೃತ್ತ = ಈ ಅಧ್ಯಾಯದ ವರ್ಷ)",
        mr: "तात्काळ दृश्य: ५ वर्षांचा प्रगती आलेख (हिरवे वर्तुळ = या अध्यायाचे वर्ष)",
        hi: "तत्काल दृश्य: ५-वर्षीय उत्थान वक्र (हरा घेरा = इस अध्याय का वर्ष)",
        te: "చూడగానే అర్థమయ్యే చిత్రం: 5 ఏళ్ల ప్రగతి రేఖ (ఆకుపచ్చ వృత్తం = ఈ అధ్యాయ సంవత్సరం)",
        ta: "பார்த்தவுடன் புரியும் படம்: 5 ஆண்டு வளர்ச்சி அலை (பச்சை வட்டம் = இந்த அத்தியாய ஆண்டு)",
        ml: "തൽക്ഷണ ചിത്രം: 5 വർഷത്തെ വളർച്ചാ ഗ്രാഫ് (പച്ച വൃത്തം = ഈ അധ്യായ വർഷം)",
        en: "At-a-Glance 5-Year Momentum Curve (Spotlight = This Chapter's Year)",
      },
      lang
    );

    const pts = metrics.fiveYearScores.length >= 5
      ? metrics.fiveYearScores.slice(0, 5)
      : [
          { year: metrics.nowYear, score: 62 },
          { year: metrics.nowYear + 1, score: 70 },
          { year: metrics.nowYear + 2, score: 77 },
          { year: metrics.nowYear + 3, score: 84 },
          { year: metrics.nowYear + 4, score: 89 },
        ];

    const coords = pts.map((p, idx) => ({
      x: 78 + idx * 158,
      y: Math.round(122 - ((p.score - 30) / 70) * 84),
      year: p.year,
      score: p.score,
    }));

    const linePath = coords.map((c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(" ");
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} 126 L ${coords[0].x} 126 Z`;

    return wrapBox(
      caption,
      <svg width="785" height="152" viewBox="0 0 785 152" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <line x1="55" y1="126" x2="730" y2="126" stroke="#efd5a3" strokeWidth="1.5" />
        <path d={areaPath} fill="#fef3c7" opacity="0.88" />
        <path d={linePath} fill="none" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, idx) => {
          const isFocus = focusYr === idx || (focusYr === undefined && idx >= 3);
          return (
            <g key={idx}>
              {focusYr === idx && <circle cx={c.x} cy={c.y} r="14" fill="none" stroke="#15803d" strokeWidth="2.5" strokeDasharray="4 2" />}
              <circle cx={c.x} cy={c.y} r="7.5" fill={isFocus ? "#15803d" : "#d97706"} stroke="#ffffff" strokeWidth="2" />
              <text x={c.x} y={c.y - 16} textAnchor="middle" fill={focusYr === idx ? "#15803d" : "#451a03"} fontSize="13" fontWeight="800">
                {`${n(c.score)}%`}
              </text>
              <text x={c.x} y={145} textAnchor="middle" fill={focusYr === idx ? "#15803d" : "#78350f"} fontSize="12.5" fontWeight="800">
                {n(c.year)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // 7. POWER COMPASS (8-Direction Yogi Compass + Lucky Day, Color, Direction & Finale Peak)
  const caption = pick7(
    {
      kn: "ನೋಡಿದ ತಕ್ಷಣದ ಚಿತ್ರ: ವೈಯಕ್ತಿಕ ಯೋಗಿ ದಿಕ್ಸೂಚಿ & ೪ ಪವರ್ ಕೀಗಳು",
      mr: "तात्काळ दृश्य: वैयक्तिक योगी होकायंत्र व ४ मुख्य शक्ती",
      hi: "तत्काल दृश्य: व्यक्तिगत योगी दिशा-सूचक एवं ४ शक्ति कुंजियां",
      te: "చూడగానే అర్థమయ్యే చిత్రం: యోగి దిక్సూచి & 4 పవర్ కీలు",
      ta: "பார்த்தவுடன் புரியும் படம்: யோகி திசைகாட்டி & 4 ஆற்றல் சாவிகள்",
      ml: "തൽക്ഷണ ചിത്രം: വ്യക്തിഗത യോഗി ദിശാസൂചിയും 4 ശക്തി കീകളും",
      en: "At-a-Glance Yogi Power Compass (Direction, Day, Shade & Peak)",
    },
    lang
  );

  const cx = 128;
  const cy = 80;
  const rad = ((metrics.yogiDirectionDeg - 90) * Math.PI) / 180;
  const tx = cx + 48 * Math.cos(rad);
  const ty = cy + 48 * Math.sin(rad);

  const lblN = pick7({ kn: "ಉ", mr: "उ", hi: "उ", te: "ఉ", ta: "வ", ml: "വ", en: "N" }, lang);
  const lblE = pick7({ kn: "ಪೂ", mr: "पू", hi: "पू", te: "తూ", ta: "கி", ml: "കി", en: "E" }, lang);
  const lblS = pick7({ kn: "ದ", mr: "द", hi: "द", te: "ద", ta: "தெ", ml: "തെ", en: "S" }, lang);
  const lblW = pick7({ kn: "ಪ", mr: "प", hi: "प", te: "ప", ta: "மே", ml: "പ", en: "W" }, lang);

  const statRows = [
    { k: pick7({ kn: "ಯೋಗಿ & ದಿಕ್ಕು:", mr: "योगी व दिशा:", hi: "योगी व दिशा:", te: "యోగి & దిశ:", ta: "யோகி & திசை:", ml: "യോഗിയും ദിശയും:", en: "Yogi & Direction:" }, lang), v: `${metrics.yogiPlanetName} • ${metrics.yogiDirection}` },
    { k: pick7({ kn: "ಶುಭ ವಾರ & ಬಣ್ಣ:", mr: "शुभ वार व रंग:", hi: "शुभ वार व रंग:", te: "శుభ వారం & రంగు:", ta: "நல்ல நாள் & நிறம்:", ml: "ശുഭ ദിനവും നിറവും:", en: "Power Day & Color:" }, lang), v: `${metrics.yogiDay} • ${metrics.yogiColor}` },
    { k: pick7({ kn: "ಭಾಗ್ಯ ಬೃಗು ಬಿಂದು:", mr: "भृगु बिंदू राशी:", hi: "भृगु बिंदु राशि:", te: "భృగు బిందు రాశి:", ta: "பிருகு பிந்து:", ml: "ഭൃഗു ബിന്ദു രാശി:", en: "Bhrigu Bindu Sign:" }, lang), v: metrics.bhriguRashiName },
    { k: pick7({ kn: "ಸುವರ್ಣ ಶಿಖರ:", mr: "सुवर्ण काळ:", hi: "स्वर्णिम काल:", te: "సువర్ణ కాలం:", ta: "பொற்காலம்:", ml: "സുവർണ്ണ ഘട്ടം:", en: "Golden Horizon:" }, lang), v: `${n(metrics.nowYear + 2)}–${n(metrics.nowYear + 4)}` },
  ];

  return wrapBox(
    caption,
    <svg width="785" height="158" viewBox="0 0 785 158" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
      <circle cx={cx} cy={cy} r="62" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="40" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
      <text x={cx} y={cy - 46} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblN}</text>
      <text x={cx + 48} y={cy + 4} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblE}</text>
      <text x={cx} y={cy + 54} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblS}</text>
      <text x={cx - 48} y={cy + 4} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblW}</text>
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      <circle cx={tx} cy={ty} r="6" fill="#15803d" />
      <circle cx={cx} cy={cy} r="5.5" fill="#78350f" />

      {statRows.map((row, idx) => {
        const y = 10 + idx * 35;
        return (
          <g key={idx}>
            <rect x="240" y={y} width="530" height="28" rx="6" fill={idx % 2 === 0 ? "#ffffff" : "#fef3c7"} stroke="#e6c280" strokeWidth="1" />
            <text x="254" y={y + 19} fill="#92400e" fontSize="12.5" fontWeight="700">{row.k}</text>
            <text x="756" y={y + 19} textAnchor="end" fill="#451a03" fontSize="13" fontWeight="800">{row.v}</text>
          </g>
        );
      })}
    </svg>
  );
};
