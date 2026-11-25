/**
 * ============================================================================
 * BAGGONA PANCHANGA — SAMPOORNA 25 DYNAMIC CHAPTER SVG VISUALS & DOSHA CARDS
 * ============================================================================
 * Fills A4 lower-page space meaningfully with chart-grounded vector diagrams:
 *   1. ZERO <table> tags (pure inline <svg> + CSS Flexbox/Grid).
 *   2. html2canvas-safe (explicit numeric width/height/viewBox, hex colors only,
 *      zero <foreignObject>, zero filters, zero CSS var()).
 *   3. 100% Native Script Purity across kn, mr, hi, te, ta, en.
 *   4. Special Consolidated Active Dosha Highlight Grid for Chapter 23 showing
 *      per-Dosha: (a) Happening Now, (b) Domain/Phase Affected, (c) Action.
 * ============================================================================
 */

import React from "react";
import { type SixLang, pick6, RASHI_6L } from "../../features/fiveYearPrediction/fiveYearLocale";
import type {
  ActiveDoshaProfile,
  ChapterVisualType,
  ChartVisualMetrics,
} from "../../services/sampoornaMaster25StoryEngine";

interface Props {
  chapterNumber: number;
  visualType?: ChapterVisualType;
  metrics?: ChartVisualMetrics;
  lang: SixLang;
  activeDoshaProfiles?: ActiveDoshaProfile[];
  bhuktiEndDate?: string;
}

function nDigits(val: number | string, lang: SixLang): string {
  const s = String(val);
  if (lang === "en") return s;
  const map =
    lang === "kn"
      ? ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"]
      : lang === "mr" || lang === "hi"
      ? ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
      : lang === "te"
      ? ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"]
      : ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  return s.replace(/\d/g, (d) => map[parseInt(d, 10)] || d);
}

const FONT_STACK: Record<SixLang, string> = {
  kn: "'Noto Serif Kannada', 'Noto Sans Kannada', sans-serif",
  mr: "'Noto Sans Devanagari', sans-serif",
  hi: "'Noto Sans Devanagari', sans-serif",
  te: "'Noto Sans Telugu', sans-serif",
  ta: "'Noto Sans Tamil', sans-serif",
  en: "'Outfit', Georgia, sans-serif",
};

export const SampoornaChapterVisual: React.FC<Props> = ({
  chapterNumber,
  visualType = "energy-gauge",
  metrics,
  lang,
  activeDoshaProfiles,
  bhuktiEndDate,
}) => {
  if (!metrics) return null;
  const font = FONT_STACK[lang] || FONT_STACK.en;
  const n = (v: number | string) => nDigits(v, lang);

  // ──────────────────────────────────────────────────────────────────────────
  // CHAPTER 23 SPECIALTY: CONSOLIDATED DOSHA ACTION MATRIX (ZERO REMEDY SPAM IN CH 1–22)
  // ──────────────────────────────────────────────────────────────────────────
  if (chapterNumber === 23 && activeDoshaProfiles && activeDoshaProfiles.length > 0) {
    const cards = activeDoshaProfiles.slice(0, 4);
    const headerTitle = pick6(
      {
        kn: "ಪ್ರಸ್ತುತ ಜಾತಕದ ಪ್ರಮುಖ ದೋಷಗಳು, ಪರಿಣಾಮದ ಕ್ಷೇತ್ರ ಮತ್ತು ನಿಖರ ಪರಿಹಾರ",
        mr: "कुंडलीतील प्रमुख सक्रिय दोष, सद्यस्थितीचा प्रभाव आणि नेमके निवारण",
        hi: "कुंडली के प्रमुख सक्रिय दोष, वर्तमान प्रभाव एवं सटीक समाधान",
        te: "జాతకంలోని ప్రధాన క్రియాశీల దోషాలు, ప్రస్తుత ప్రభావం & ఖచ్చిత పరిహారం",
        ta: "ஜாதகத்தின் முக்கிய தோஷங்கள், தற்போதைய தாக்கம் மற்றும் சரியான தீர்வு",
        en: "Consolidated Active Dosha Highlight: Happening Now, Impact Area & Exact Action",
      },
      lang
    );
    const lblNow = pick6(
      { kn: "ಈಗ ಏನಾಗುತ್ತಿದೆ:", mr: "सध्याचा परिणाम:", hi: "अभी क्या हो रहा है:", te: "ప్రస్తుతం జరిగేది:", ta: "இப்போதைய நிலை:", en: "Happening Now:" },
      lang
    );
    const lblArea = pick6(
      { kn: "ಪರಿಣಾಮ ಬೀರುವ ಕ್ಷೇತ್ರ:", mr: "प्रभावित क्षेत्र / टप्पा:", hi: "प्रभावित क्षेत्र व चरण:", te: "ప్రభావిత రంగం:", ta: "பாதிக்கும் துறை:", en: "Phase / Area Affected:" },
      lang
    );
    const lblFix = pick6(
      { kn: "ನಿಖರ ಪರಿಹಾರ:", mr: "योग्य उपाय / कृती:", hi: "सटीक समाधान:", te: "సరైన పరిహారం:", ta: "சரியான தீர்வு:", en: "Exact Remedy / Action:" },
      lang
    );

    return (
      <div
        style={{
          marginTop: "14px",
          backgroundColor: "#fffbf2",
          border: "1px solid #efd5a3",
          borderRadius: "8px",
          padding: "12px 14px",
          letterSpacing: "normal",
        }}
      >
        <div
          style={{
            fontSize: "14.5px",
            fontWeight: 800,
            color: "#78350f",
            marginBottom: "10px",
            paddingBottom: "6px",
            borderBottom: "1px solid #fde68a",
          }}
        >
          {headerTitle}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cards.length >= 2 ? "1fr 1fr" : "1fr",
            gap: "10px",
          }}
        >
          {cards.map((d) => (
            <div
              key={d.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #f5deb3",
                borderRadius: "6px",
                padding: "9px 11px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "6px",
                  borderBottom: "1px solid #fef3c7",
                  paddingBottom: "4px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#7c2d12" }}>{d.title}</span>
                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#92400e",
                    backgroundColor: "#fef3c7",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.severityLabel}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.42, color: "#291505" }}>
                <strong style={{ color: "#92400e" }}>{lblNow} </strong>
                {d.doingNow}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.42, color: "#291505" }}>
                <strong style={{ color: "#92400e" }}>{lblArea} </strong>
                {d.affectingArea}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.42, color: "#14532d", fontWeight: 600 }}>
                <strong style={{ color: "#166534" }}>{lblFix} </strong>
                {d.exactAction}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Common outer wrapper for SVG visual panel
  const wrapBox = (caption: string, svgEl: React.ReactNode) => (
    <div
      style={{
        marginTop: "14px",
        backgroundColor: "#fffdf8",
        border: "1px solid #efd5a3",
        borderRadius: "8px",
        padding: "10px 12px 8px 12px",
        letterSpacing: "normal",
      }}
    >
      <div
        style={{
          fontSize: "13.5px",
          fontWeight: 800,
          color: "#78350f",
          marginBottom: "6px",
          letterSpacing: "normal",
        }}
      >
        {caption}
      </div>
      {svgEl}
    </div>
  );

  // 1. ENERGY GAUGE (Tarabala Clarity + Guru vs Shani Transit Pulse)
  if (visualType === "energy-gauge") {
    const score = Math.max(25, Math.min(98, Math.round(metrics.tarabalaScore || 72)));
    const angleDeg = -90 + (score / 100) * 180;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const cx = 170;
    const cy = 128;
    const nx = cx + 74 * Math.cos(rad);
    const ny = cy + 74 * Math.sin(rad);

    const caption = pick6(
      {
        kn: "ಜನ್ಮ ಶಕ್ತಿ ಮತ್ತು ಗೋಚಾರ ಒತ್ತಡ ಸೂಚ್ಯಂಕ (ಲೈವ್ ತಾರಾಬಲ ಮಾಪಕ)",
        mr: "जन्म ऊर्जा व गोचर संतुलन मीटर (तात्काळ ताराबळ स्थिती)",
        hi: "जन्म ऊर्जा एवं गोचर संतुलन सूचकांक (तात्कालिक ताराबल मीटर)",
        te: "జన్మ శక్తి మరియు గోచార సమతుల్యత సూచిక (తారాబల మీటర్)",
        ta: "பிறப்பு ஆற்றல் மற்றும் கோசார சமநிலை அளவி (தாராபலன்)",
        en: "Natal Clarity & Live Cosmic Alignment Gauge (Tarabala & Transit Index)",
      },
      lang
    );

    const lblClarity = pick6(
      { kn: "ಪ್ರಸ್ತುತ ಸ್ಪಷ್ಟತೆ", mr: "सध्याची स्पष्टता", hi: "वर्तमान स्पष्टता", te: "ప్రస్తుత స్పష్టత", ta: "தற்போதைய தெளிவு", en: "Clarity Score" },
      lang
    );
    const lblGuru = pick6(
      { kn: "ಗುರು ಬಲ ಸ್ಥಾನ", mr: "गुरू अनुकूलता", hi: "गुरु बल स्थान", te: "గురు బల స్థానం", ta: "குரு பல இடம்", en: "Jupiter House" },
      lang
    );
    const lblShani = pick6(
      { kn: "ಶನಿ ಸಂಚಾರ ಮನೆ", mr: "शनी गोचर स्थान", hi: "शनि गोचर भाव", te: "శని సంచార స్థానం", ta: "சனி கோசார வீடு", en: "Saturn House" },
      lang
    );
    const lblMaandi = pick6(
      { kn: "ಮಾಂದಿ ಜಾಗ್ರತೆ ಮನೆ", mr: "मांदी सूक्ष्म स्थान", hi: "मांदी सूक्ष्म भाव", te: "మాంది జాగ్రత్త స్థానం", ta: "மாந்தி கவன வீடு", en: "Maandi Focus House" },
      lang
    );

    return wrapBox(
      caption,
      <svg width="785" height="156" viewBox="0 0 785 156" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        {/* Background Arc */}
        <path d="M 80 128 A 90 90 0 0 1 260 128" fill="none" stroke="#fde68a" strokeWidth="18" strokeLinecap="round" />
        {/* Colored Segments */}
        <path d="M 80 128 A 90 90 0 0 1 138 44" fill="none" stroke="#ea580c" strokeWidth="18" strokeLinecap="round" />
        <path d="M 142 42 A 90 90 0 0 1 200 43" fill="none" stroke="#d97706" strokeWidth="18" />
        <path d="M 204 45 A 90 90 0 0 1 260 128" fill="none" stroke="#16a34a" strokeWidth="18" strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill="#78350f" />
        <text x={cx} y={102} textAnchor="middle" fill="#451a03" fontSize="22" fontWeight="800">
          {`${n(score)}%`}
        </text>
        <text x={cx} y={148} textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="700">
          {lblClarity}
        </text>

        {/* Three Clean Alignment Readout Cards on Right */}
        <rect x="330" y="16" width="138" height="118" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <text x="399" y="48" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="700">
          {lblGuru}
        </text>
        <text x="399" y="88" textAnchor="middle" fill="#15803d" fontSize="24" fontWeight="800">
          {n(metrics.guruHouseFromMoon)}
        </text>
        <text x="399" y="116" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">
          {`${n(metrics.guruTransitSav)}/${n(48)}`}
        </text>

        <rect x="482" y="16" width="138" height="118" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <text x="551" y="48" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="700">
          {lblShani}
        </text>
        <text x="551" y="88" textAnchor="middle" fill="#b45309" fontSize="24" fontWeight="800">
          {n(metrics.shaniHouseFromMoon)}
        </text>
        <text x="551" y="116" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">
          {`${n(metrics.shaniTransitSav)}/${n(48)}`}
        </text>

        <rect x="634" y="16" width="138" height="118" rx="8" fill="#fffbeb" stroke="#d97706" strokeWidth="1" />
        <text x="703" y="48" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="700">
          {lblMaandi}
        </text>
        <text x="703" y="88" textAnchor="middle" fill="#9a3412" fontSize="24" fontWeight="800">
          {n(metrics.maandiHouse)}
        </text>
        <text x="703" y="116" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="700">
          {metrics.yogiPlanetName}
        </text>
      </svg>
    );
  }

  // 2. TIMELINE METER (Past 24 Months -> Now -> Next Switch -> Golden Apex)
  if (visualType === "timeline-meter") {
    const caption = pick6(
      {
        kn: "ಜೀವನ ಕಥೆಯ ಕಾಲಚಕ್ರ: ಕಳೆದ ಪರೀಕ್ಷೆಯಿಂದ ಮುಂದಿನ ಸುವರ್ಣ ತಿರುವಿನವರೆಗೆ",
        mr: "जीवन प्रवास काळरेषा: मागील कसोटीपासून पुढील सुवर्ण वळणापर्यंत",
        hi: "जीवन-यात्रा समयरेखा: पिछली परीक्षा से आगामी स्वर्णिम मोड़ तक",
        te: "జీవన కథ కాలరేఖ: గత పరీక్ష నుండి రాబోయే సువర్ణ మలుపు వరకు",
        ta: "வாழ்க்கை காலக்கோடு: கடந்த சோதனையிலிருந்து அடுத்த பொற்காலம் வரை",
        en: "Story Timeline Map: From Past Filter to Upcoming Turning Point",
      },
      lang
    );

    const nodes = [
      {
        x: 90,
        color: "#b45309",
        yr: `${n(metrics.nowYear - 2)}–${n(metrics.nowYear - 1)}`,
        lbl: pick6({ kn: "ಶುದ್ಧೀಕರಣ ಪಾಠ", mr: "कसोटीचा टप्पा", hi: "परीक्षा व शुद्धिकरण", te: "శుద్ధి పరీక్ష", ta: "சோதனைக் காலம்", en: "24-Mo Crucible" }, lang),
      },
      {
        x: 295,
        color: "#d97706",
        yr: `${n(metrics.nowYear)}`,
        lbl: pick6({ kn: "ಪ್ರಸ್ತುತ ತಿರುವು", mr: "सध्याचा टप्पा", hi: "वर्तमान मोड़", te: "ప్రస్తుత మలుపు", ta: "தற்போதைய திருப்பம்", en: "Current Pivot" }, lang),
      },
      {
        x: 500,
        color: "#0369a1",
        yr: n((bhuktiEndDate || `${metrics.nowYear + 1}`).slice(0, 7)),
        lbl: pick6({ kn: "ದಶಾ ಸಂಧಿ ಬದಲಾವಣೆ", mr: "पुढील दशा वळण", hi: "भुक्ति परिवर्तन", te: "భుక్తి మార్పు", ta: "புத்தி மாற்றம்", en: "Cycle Shift" }, lang),
      },
      {
        x: 700,
        color: "#15803d",
        yr: `${n(metrics.nowYear + 2)}–${n(metrics.nowYear + 4)}`,
        lbl: pick6({ kn: "ಸುವರ್ಣ ಶಿಖರ", mr: "सुवर्ण शिखर", hi: "स्वर्णिम शिखर", te: "సువర్ణ శిఖరం", ta: "பொற்கால உச்சம்", en: "Golden Ascent" }, lang),
      },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="148" viewBox="0 0 785 148" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <line x1="90" y1="68" x2="700" y2="68" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" />
        <line x1="295" y1="68" x2="700" y2="68" stroke="#16a34a" strokeWidth="4" strokeDasharray="6 4" />
        {nodes.map((nd, idx) => (
          <g key={idx}>
            <circle cx={nd.x} cy={68} r="18" fill="#fffdf8" stroke={nd.color} strokeWidth="4" />
            <text x={nd.x} y={73} textAnchor="middle" fill={nd.color} fontSize="13" fontWeight="800">
              {n(idx + 1)}
            </text>
            <text x={nd.x} y={34} textAnchor="middle" fill="#451a03" fontSize="13" fontWeight="800">
              {nd.yr}
            </text>
            <text x={nd.x} y={114} textAnchor="middle" fill="#78350f" fontSize="12.5" fontWeight="700">
              {nd.lbl}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // 3. RASHI MANDALA (12-Segment Cosmic Dial highlighting Lagna, Moon, Yogi, Maandi, Guru, Shani)
  if (visualType === "rashi-mandala") {
    const caption = pick6(
      {
        kn: "ದ್ವಾದಶ ರಾಶಿ ಚಕ್ರ ಮತ್ತು ಪ್ರಮುಖ ಗ್ರಹ ಸ್ಥಾನಗಳ ದೃಶ್ಯ ನಕ್ಷೆ",
        mr: "द्वादश राशी चक्र आणि प्रमुख ग्रह बिंदूंचे नकाशाचित्र",
        hi: "द्वादश राशि चक्र एवं प्रमुख ग्रह स्थितियों का दृश्य मानचित्र",
        te: "ద్వాదశ రాశి చక్రం మరియు ముఖ్య గ్రహ స్థానాల పటం",
        ta: "பன்னிரண்டு ராசி சக்கரம் மற்றும் முக்கிய கிரக நிலைகள்",
        en: "12-Sign Cosmic Mandala & Active Point Constellation",
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
    addM(mp.lagnaRashiIdx, pick6({ kn: "ಲ", mr: "ल", hi: "ल", te: "ల", ta: "ல", en: "Lg" }, lang));
    addM(mp.moonRashiIdx, pick6({ kn: "ಚಂ", mr: "चं", hi: "चं", te: "చం", ta: "ச", en: "Mo" }, lang));
    addM(mp.yogiRashiIdx, pick6({ kn: "ಯೋ", mr: "यो", hi: "यो", te: "యో", ta: "யோ", en: "Yg" }, lang));
    addM(mp.maandiRashiIdx, pick6({ kn: "ಮಾ", mr: "मां", hi: "मां", te: "మాం", ta: "மா", en: "Mn" }, lang));
    addM(mp.jupiterRashiIdx, pick6({ kn: "ಗು", mr: "गु", hi: "गु", te: "గు", ta: "கு", en: "Ju" }, lang));
    addM(mp.saturnRashiIdx, pick6({ kn: "ಶ", mr: "श", hi: "श", te: "శ", ta: "சனி", en: "Sa" }, lang));

    const cx = 135;
    const cy = 92;
    const legendItems = [
      { code: pick6({ kn: "ಲ", mr: "ल", hi: "ल", te: "ల", ta: "ல", en: "Lg" }, lang), label: pick6({ kn: "ಜನ್ಮ ಲಗ್ನ", mr: "जन्म लग्न", hi: "जन्म लग्न", te: "జన్మ లగ్నం", ta: "ஜனன லக்னம்", en: "Natal Lagna" }, lang), val: RASHI_6L[mp.lagnaRashiIdx]?.[lang] || "" },
      { code: pick6({ kn: "ಚಂ", mr: "चं", hi: "चं", te: "చం", ta: "ச", en: "Mo" }, lang), label: pick6({ kn: "ಜನ್ಮ ರಾಶಿ (ಚಂದ್ರ)", mr: "जन्म राशी (चंद्र)", hi: "जन्म राशि (चंद्र)", te: "జన్మ రాశి", ta: "ராசி (சந்திரன்)", en: "Moon Sign" }, lang), val: RASHI_6L[mp.moonRashiIdx]?.[lang] || "" },
      { code: pick6({ kn: "ಯೋ", mr: "यो", hi: "यो", te: "యో", ta: "யோ", en: "Yg" }, lang), label: pick6({ kn: "ಯೋಗಿ ಗ್ರಹ ಸ್ಥಾನ", mr: "योगी स्थान", hi: "योगी स्थान", te: "యోగి స్థానం", ta: "யோகி இடம்", en: "Yogi Sector" }, lang), val: `${metrics.yogiPlanetName} (${RASHI_6L[mp.yogiRashiIdx]?.[lang] || ""})` },
      { code: pick6({ kn: "ಮಾ", mr: "मां", hi: "मां", te: "మాం", ta: "மா", en: "Mn" }, lang), label: pick6({ kn: "ಮಾಂದಿ ಗಂಟು", mr: "मांदी गाठ", hi: "मांदी ग्रंथि", te: "మాంది ముడి", ta: "மாந்தி முடிச்சு", en: "Maandi Knot" }, lang), val: `${RASHI_6L[mp.maandiRashiIdx]?.[lang] || ""} (${n(metrics.maandiHouse)})` },
      { code: pick6({ kn: "ಗು/ಶ", mr: "गु/श", hi: "गु/श", te: "గు/శ", ta: "கு/சனி", en: "Ju/Sa" }, lang), label: pick6({ kn: "ಬೃಗು ಬಿಂದು ರಾಶಿ", mr: "भृगु बिंदू राशी", hi: "भृगु बिंदु राशि", te: "భృగు బిందువు", ta: "பிருகு பிந்து", en: "Bhrigu Bindu Sign" }, lang), val: metrics.bhriguRashiName },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="184" viewBox="0 0 785 184" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <circle cx={cx} cy={cy} r="80" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="44" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#78350f" fontSize="13" fontWeight="800">
          {RASHI_6L[mp.lagnaRashiIdx]?.[lang] || ""}
        </text>
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = -90 + i * 30;
          const rad1 = (deg * Math.PI) / 180;
          const midRad = ((deg + 15) * Math.PI) / 180;
          const lx = cx + 80 * Math.cos(rad1);
          const ly = cy + 80 * Math.sin(rad1);
          const ix = cx + 44 * Math.cos(rad1);
          const iy = cy + 44 * Math.sin(rad1);
          const px = cx + 63 * Math.cos(midRad);
          const py = cy + 63 * Math.sin(midRad);
          const tags = markersByRashi[i];
          const isHighlight = Boolean(tags && tags.length > 0);
          return (
            <g key={i}>
              <line x1={ix} y1={iy} x2={lx} y2={ly} stroke="#e2b45d" strokeWidth="1" />
              {isHighlight ? (
                <>
                  <circle cx={px} cy={py} r="12" fill={i === mp.maandiRashiIdx ? "#9a3412" : i === mp.lagnaRashiIdx ? "#b45309" : "#d97706"} />
                  <text x={px} y={py + 4} textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800">
                    {tags.slice(0, 2).join(",")}
                  </text>
                </>
              ) : (
                <text x={px} y={py + 4} textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="600">
                  {n(i + 1)}
                </text>
              )}
            </g>
          );
        })}

        {/* Legend Rows on Right */}
        {legendItems.map((it, idx) => {
          const ry = 16 + idx * 32;
          return (
            <g key={idx}>
              <rect x="265" y={ry} width="505" height="26" rx="5" fill={idx % 2 === 0 ? "#fef3c7" : "#fffbeb"} stroke="#efd5a3" strokeWidth="1" />
              <rect x="273" y={ry + 4} width="38" height="18" rx="4" fill="#92400e" />
              <text x="292" y={ry + 17} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">
                {it.code}
              </text>
              <text x="322" y={ry + 17} fill="#78350f" fontSize="12.5" fontWeight="700">
                {it.label}
              </text>
              <text x="756" y={ry + 17} textAnchor="end" fill="#451a03" fontSize="12.5" fontWeight="800">
                {it.val}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // 4. ELEMENT RADAR / BALANCE (Panchabhuta Nature Profile)
  if (visualType === "element-radar") {
    const caption = pick6(
      {
        kn: "ಪಂಚಭೂತ ಸ್ವಭಾವ ಸಮತೋಲನ ನಕ್ಷೆ (ಜನ್ಮ ಗ್ರಹಗಳ ತತ್ವ ಅನುಪಾತ)",
        mr: "पंचमहाभूत स्वभाव संतुलन आलेख (जन्म कुंडली तत्त्व प्रमाण)",
        hi: "पंचभूत स्वभाव संतुलन चित्र (कुंडली तत्त्व अनुपात)",
        te: "పంచభూత స్వభావ సమతుల్యత (గ్రహ తత్వ నిష్పత్తి)",
        ta: "பஞ்சபூத இயல்பு சமநிலை (கிரக தத்துவ விகிதம்)",
        en: "Panchabhuta Elemental Balance Profile (Cosmic Signature)",
      },
      lang
    );

    const elems = [
      {
        key: "fire" as const,
        pct: metrics.elemPercentages.fire,
        color: "#dc2626",
        bg: "#fee2e2",
        name: pick6({ kn: "ಅಗ್ನಿ (ಉತ್ಸಾಹ & ನಾಯಕತ್ವ)", mr: "अग्नी (नेतृत्व व ऊर्जा)", hi: "अग्नि (उत्साह व नेतृत्व)", te: "అగ్ని (చొరవ & నాయకత్వం)", ta: "அக்னி (ஆற்றல் & தலைமை)", en: "Fire (Drive & Initiative)" }, lang),
      },
      {
        key: "earth" as const,
        pct: metrics.elemPercentages.earth,
        color: "#b45309",
        bg: "#fef3c7",
        name: pick6({ kn: "ಪೃಥ್ವಿ (ಸ್ಥಿರತೆ & ವ್ಯವಹಾರ)", mr: "पृथ्वी (स्थिरता व व्यवहार)", hi: "पृथ्वी (स्थिरता व धन-संयम)", te: "పృథ్వి (స్థిరత్వం & ఆచరణ)", ta: "பூமி (நிலைத்தன்மை)", en: "Earth (Grounded Mastery)" }, lang),
      },
      {
        key: "air" as const,
        pct: metrics.elemPercentages.air,
        color: "#0284c7",
        bg: "#e0f2fe",
        name: pick6({ kn: "ವಾಯು (ಬುದ್ಧಿ & ಸಂವಹನ)", mr: "वायू (विचार व संवाद)", hi: "वायु (विवेक व संवाद)", te: "వాయు (తెలివి & సంభాషణ)", ta: "வாயு (அறிவு & தொடர்பு)", en: "Air (Strategy & Network)" }, lang),
      },
      {
        key: "water" as const,
        pct: metrics.elemPercentages.water,
        color: "#0d9488",
        bg: "#ccfbf1",
        name: pick6({ kn: "ಜಲ (ಅಂತಃಪ್ರಜ್ಞೆ & ಹೃದಯ)", mr: "जल (अंतर्ज्ञान व भावना)", hi: "जल (संवेदना व अंतर्दृष्टि)", te: "జల (అంతర్దృష్టి & ప్రేమ)", ta: "நீர் (உள்ளுணர்வு & அன்பு)", en: "Water (Intuition & Healing)" }, lang),
      },
    ];

    return wrapBox(
      caption,
      <svg width="785" height="162" viewBox="0 0 785 162" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        {elems.map((el, idx) => {
          const y = 14 + idx * 36;
          const barMax = 385;
          const barW = Math.max(36, Math.round((el.pct / 100) * barMax));
          const isDom = el.key === metrics.dominantElementKey;
          return (
            <g key={el.key}>
              <text x="10" y={y + 18} fill={isDom ? "#451a03" : "#78350f"} fontSize="13" fontWeight={isDom ? "800" : "700"}>
                {el.name}
              </text>
              <rect x="285" y={y + 3} width={barMax} height="20" rx="10" fill={el.bg} />
              <rect x="285" y={y + 3} width={barW} height="20" rx="10" fill={el.color} />
              <text x="692" y={y + 18} fill="#451a03" fontSize="14" fontWeight="800">
                {`${n(el.pct)}%`}
              </text>
              {isDom && (
                <text x="738" y={y + 18} fill="#b45309" fontSize="14" fontWeight="800">
                  ★
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // 5. SAV PILLARS (12-House Sarvashtakavarga Strength Skyline)
  if (visualType === "sav-pillars") {
    const caption = pick6(
      {
        kn: "ದ್ವಾದಶ ಭಾವ ಬಲ ನಕ್ಷೆ (ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಅದೃಷ್ಟ ಗರಿಷ್ಠವಾಗಿದೆ?)",
        mr: "१२ स्थानांचा शक्ती आलेख (कोणत्या क्षेत्रात सर्वाधिक पाठबळ आहे?)",
        hi: "द्वादश भाव शक्ति स्तंभ (किस जीवन-क्षेत्र में सर्वाधिक बल है?)",
        te: "12 స్థానాల బల చిత్రం (ఏ రంగంలో మీ శక్తి అత్యధికంగా ఉంది?)",
        ta: "12 வீடுகளின் பலம் (எந்தத் துறையில் அதிக பலம் உள்ளது?)",
        en: "12-House Sarvashtakavarga Strength Skyline (Gold = Peak Domain >= 30)",
      },
      lang
    );

    const savs = metrics.savByHouse.length === 12 ? metrics.savByHouse : new Array(12).fill(28);
    const maxV = Math.max(40, ...savs);
    const colW = 54;
    const gap = 8;
    const startX = 28;
    const baseY = 134;

    return wrapBox(
      caption,
      <svg width="785" height="164" viewBox="0 0 785 164" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        {/* Benchmark 28-bindu threshold dashed line */}
        <line x1="20" y1={baseY - Math.round((28 / maxV) * 96)} x2="765" y2={baseY - Math.round((28 / maxV) * 96)} stroke="#d97706" strokeDasharray="5 4" strokeWidth="1.2" />
        {savs.map((val, idx) => {
          const h = Math.max(16, Math.round((val / maxV) * 96));
          const x = startX + idx * (colW + gap);
          const y = baseY - h;
          const isPeak = val >= 30;
          const isLow = val < 25;
          const fill = isPeak ? "#d97706" : isLow ? "#cbd5e1" : "#f59e0b";
          return (
            <g key={idx}>
              <rect x={x} y={y} width={colW} height={h} rx="5" fill={fill} />
              <text x={x + colW / 2} y={y - 5} textAnchor="middle" fill="#451a03" fontSize="11.5" fontWeight="800">
                {n(val)}
              </text>
              <text x={x + colW / 2} y={152} textAnchor="middle" fill="#78350f" fontSize="11.5" fontWeight="700">
                {n(idx + 1)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // 6. HORIZON WAVE (5-Year Momentum Trajectory)
  if (visualType === "horizon-wave") {
    const caption = pick6(
      {
        kn: "ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಅಭ್ಯುದಯ ತರಂಗ (ವಾರ್ಷಿಕ ವೇಗ ಮತ್ತು ಉತ್ತುಂಗ ಶಿಖರ)",
        mr: "पुढील ५ वर्षांचा प्रगती आलेख (वार्षिक वेग व उच्चांक)",
        hi: "आगामी ५ वर्षों का उत्थान-पथ (वार्षिक गति एवं स्वर्णिम शिखर)",
        te: "రాబోయే 5 సంవత్సరాల ప్రగతి తరంగం (వార్షిక వృద్ధి రేఖ)",
        ta: "அடுத்த 5 ஆண்டு கால வளர்ச்சி அலை (ஆண்டு வேகம்)",
        en: "5-Year Destiny Wave Projection (Annual Momentum Curve)",
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
      y: Math.round(132 - ((p.score - 30) / 70) * 90),
      year: p.year,
      score: p.score,
    }));

    const linePath = coords
      .map((c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
      .join(" ");
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} 134 L ${coords[0].x} 134 Z`;

    return wrapBox(
      caption,
      <svg width="785" height="164" viewBox="0 0 785 164" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
        <line x1="55" y1="134" x2="730" y2="134" stroke="#efd5a3" strokeWidth="1.5" />
        <path d={areaPath} fill="#fef3c7" opacity="0.85" />
        <path d={linePath} fill="none" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="7" fill={idx >= 3 ? "#15803d" : "#d97706"} stroke="#ffffff" strokeWidth="2" />
            <text x={c.x} y={c.y - 12} textAnchor="middle" fill="#451a03" fontSize="13" fontWeight="800">
              {`${n(c.score)}%`}
            </text>
            <text x={c.x} y={154} textAnchor="middle" fill="#78350f" fontSize="12.5" fontWeight="700">
              {n(c.year)}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // 7. POWER COMPASS (Yogi Direction + Power Color + Lucky Day + Bhrigu Bindu)
  const caption = pick6(
    {
      kn: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಯೋಗಿ ದಿಕ್ಸೂಚಿ (ದಿಕ್ಕು, ವಾರ, ಬಣ್ಣ ಮತ್ತು ಶಕ್ತಿ ಕೇಂದ್ರ)",
      mr: "तुमचा वैयक्तिक योगी होकायंत्र तक्ता (दिशा, वार, रंग व शक्ती बिंदू)",
      hi: "आपका व्यक्तिगत योगी दिशा-सूचक (शुभ दिशा, वार, रंग एवं शक्ति केंद्र)",
      te: "మీ వ్యక్తిగత యోగి దిక్సూచి (శుభ దిశ, వారం, రంగు & శక్తి కేంద్రం)",
      ta: "உங்கள் தனிப்பட்ட யோகி திசைகாட்டி (திசை, கிழமை, நிறம் & சக்தி)",
      en: "Personal Yogi Power Compass (Direction, Day, Color & Destiny Anchor)",
    },
    lang
  );

  const cx = 128;
  const cy = 88;
  const rad = ((metrics.yogiDirectionDeg - 90) * Math.PI) / 180;
  const tx = cx + 52 * Math.cos(rad);
  const ty = cy + 52 * Math.sin(rad);

  const lblN = pick6({ kn: "ಉ", mr: "उ", hi: "उ", te: "ఉ", ta: "வ", en: "N" }, lang);
  const lblE = pick6({ kn: "ಪೂ", mr: "पू", hi: "पू", te: "తూ", ta: "கி", en: "E" }, lang);
  const lblS = pick6({ kn: "ದ", mr: "द", hi: "द", te: "ద", ta: "தெ", en: "S" }, lang);
  const lblW = pick6({ kn: "ಪ", mr: "प", hi: "प", te: "प", ta: "மே", en: "W" }, lang);

  const statRows = [
    { k: pick6({ kn: "ಯೋಗಿ ಗ್ರಹ & ದಿಕ್ಕು:", mr: "योगी ग्रह व दिशा:", hi: "योगी ग्रह व दिशा:", te: "యోగి గ్రహం & దిశ:", ta: "யோகி & திசை:", en: "Yogi & Direction:" }, lang), v: `${metrics.yogiPlanetName} • ${metrics.yogiDirection}` },
    { k: pick6({ kn: "ಶುಭ ವಾರ & ಬಣ್ಣ:", mr: "शुभ वार व रंग:", hi: "शुभ वार एवं रंग:", te: "శుభ వారం & రంగు:", ta: "நல்ல நாள் & நிறம்:", en: "Power Day & Color:" }, lang), v: `${metrics.yogiDay} • ${metrics.yogiColor}` },
    { k: pick6({ kn: "ಭಾಗ್ಯ ಬೃಗು ಬಿಂದು:", mr: "भृगु बिंदू राशी:", hi: "भृगु बिंदु राशि:", te: "భృగు బిందు రాశి:", ta: "பிருகு பிந்து:", en: "Bhrigu Bindu Sign:" }, lang), v: metrics.bhriguRashiName },
    { k: pick6({ kn: "ಸುವರ್ಣ ಶಿಖರ ಅವಧಿ:", mr: "उत्कर्ष काळ:", hi: "उत्कर्ष अवधि:", te: "సువర్ణ కాలం:", ta: "பொற்காலம்:", en: "Golden Horizon:" }, lang), v: `${n(metrics.nowYear + 2)}–${n(metrics.nowYear + 4)}` },
  ];

  return wrapBox(
    caption,
    <svg width="785" height="172" viewBox="0 0 785 172" style={{ display: "block", width: "100%", height: "auto", fontFamily: font }}>
      <circle cx={cx} cy={cy} r="66" fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="44" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
      <text x={cx} y={cy - 50} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblN}</text>
      <text x={cx + 52} y={cy + 4} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblE}</text>
      <text x={cx} y={cy + 58} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblS}</text>
      <text x={cx - 52} y={cy + 4} textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="800">{lblW}</text>
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      <circle cx={tx} cy={ty} r="6" fill="#15803d" />
      <circle cx={cx} cy={cy} r="6" fill="#78350f" />

      {statRows.map((row, idx) => {
        const y = 14 + idx * 38;
        return (
          <g key={idx}>
            <rect x="242" y={y} width="528" height="30" rx="6" fill={idx % 2 === 0 ? "#fef3c7" : "#fffbeb"} stroke="#efd5a3" strokeWidth="1" />
            <text x="256" y={y + 20} fill="#92400e" fontSize="13" fontWeight="700">
              {row.k}
            </text>
            <text x="756" y={y + 20} textAnchor="end" fill="#451a03" fontSize="13.5" fontWeight="800">
              {row.v}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
