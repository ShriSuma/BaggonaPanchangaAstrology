import React, { useRef, useState, useMemo, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  getDailyInspiration,
  buildCleanDailyWhatsAppShareText,
  type SupportedLang
} from "../../features/darshana/dailyInspirationAlmanac";
import {
  getDailyBackgroundConfig,
  renderDailyVedicSvgBackground
} from "../../features/darshana/dailyBlessingBackgrounds";

export interface DailyBlessingShareCardProps {
  devoteeName?: string;
  dateStr: string;
  tithiStr?: string;
  nakshatraStr?: string;
  goldenHourStr?: string;
  lang?: string;
  priestName?: string;
  customShlokaText?: string;
  customShlokaMeaning?: string;
  customDeitySource?: string;
}

const KSHETRA_INSIGNIA: Record<SupportedLang, string> = {
  kn: "✨ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ✨",
  hi: "✨ ॥ बग्गोण पंचांग ज्योतिष क्षेत्र • गोकर्ण सन्निधि ॥ ✨",
  te: "✨ ॥ బగ్గోణ పంచాంగ జ్యోతిష్య క్షేత్రం • గోకర్ణ సన్నిధి ॥ ✨",
  ta: "✨ ॥ பக்கோண பஞ்சாங்க ஜோதிட க்ஷேத்திரம் • கோகர்ண சந்நிதி ॥ ✨",
  en: "✨ ॥ Baggona Panchanga Kshetra • Gokarna Sannidhi ॥ ✨"
};

const SHUBHA_MUHURTHA_LABEL: Record<SupportedLang, string> = {
  kn: "⏳ ಶುಭ ಮುಹೂರ್ತ:",
  hi: "⏳ शुभ मुहूर्त:",
  te: "⏳ శుభ ముహూర్తం:",
  ta: "⏳ சுப முகூர்த்தம்:",
  en: "⏳ Auspicious Muhurtha:"
};

const CARD_HEADER_TITLE: Record<SupportedLang, string> = {
  kn: "ನಿತ್ಯ ಶುಭೋದಯ ಸಂದೇಶ & ಆಶೀರ್ವಾದ ಎನ್‌ವಲಪ್",
  hi: "दैनिक शुभ प्रभात संदेश एवं आशीर्वाद",
  te: "నిత్య శుభోదయ సందేశం & ఆశీర్వాదం",
  ta: "தினசரி காலை வணக்க செய்தி & ஆசீர்வாதம்",
  en: "Daily Good Morning & Shloka Blessings"
};

const CARD_HEADER_SUBTITLE: Record<SupportedLang, (theme: string) => string> = {
  kn: (theme) => `೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶ್ಲೋಕ, ದೈವಿಕ ಕಲಾಚಿತ್ರ & ವಾಟ್ಸಾಪ್ ಹಂಚಿಕೆ (${theme})`,
  hi: (theme) => `365 दिन दैनिक श्लोक, सूर्योदय कला एवं WhatsApp साझा (${theme})`,
  te: (theme) => `365 రోజుల నిత్య శ్లోకం, సూర్యోదయ కళ & WhatsApp భాగస్వామ్యం (${theme})`,
  ta: (theme) => `365 நாட்கள் தினசரி ஸ்லோகம், சூரியோதய கலை & WhatsApp பகிர்வு (${theme})`,
  en: (theme) => `365 Days Daily Shloka, Sunrise Art & WhatsApp Share (${theme})`
};

const MORNING_BLESSING_LABEL: Record<SupportedLang, string> = {
  kn: "☀️ ಶುಭೋದಯ ಸಂದೇಶ (Morning Blessing)",
  hi: "☀️ शुभ प्रभात संदेश",
  te: "☀️ శుభోదయ సందేశం",
  ta: "☀️ காலை வணக்க செய்தி",
  en: "☀️ Good Morning Blessing"
};

const DAILY_SHLOKA_LABEL: Record<SupportedLang, (src: string) => string> = {
  kn: (src) => `🪔 ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${src})`,
  hi: (src) => `🪔 आज का दिव्य श्लोक (${src})`,
  te: (src) => `🪔 నేటి దివ్య శ್లోకం (${src})`,
  ta: (src) => `🪔 இன்றைய தெய்வீக ஸ்லோகம் (${src})`,
  en: (src) => `🪔 Daily Sacred Shloka (${src})`
};

const GOOD_KARMA_LABEL: Record<SupportedLang, string> = {
  kn: "🌱 ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ (Good Karma):",
  hi: "🌱 आज का पुण्य कर्म:",
  te: "🌱 నేటి పుణ్య కార్యం:",
  ta: "🌱 இன்றைய புண்ணிய காரியம்:",
  en: "🌱 Today's Good Karma:"
};

const LIFE_INSIGHT_LABEL: Record<SupportedLang, string> = {
  kn: "💡 ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ (Life Insight):",
  hi: "💡 प्रेरक विचार (Life Insight):",
  te: "💡 స్ఫూర్తిదాయక ఆలోచన:",
  ta: "💡 ஊக்கமளிக்கும் சிந்தனை:",
  en: "💡 Life Insight:"
};

const LOCATION_LABEL: Record<SupportedLang, string> = {
  kn: "📍 ರಥಬೀದಿ, ಗೋಕರ್ಣ",
  hi: "📍 रथबीदि, गोकर्ण",
  te: "📍 రథవీధి, గోకర్ణ",
  ta: "📍 ரதவீதி, கோகர்ணம்",
  en: "📍 Ratha Beedi, Gokarna"
};

const CHIEF_PRIEST_LABEL: Record<SupportedLang, string> = {
  kn: "ಮುಖ್ಯ ಅರ್ಚಕರು",
  hi: "मुख्य अर्चक",
  te: "ప్రధాన అర్చకులు",
  ta: "முதன்மை அர்ச்சகர்",
  en: "Chief Priest"
};

const DEFAULT_PRIEST_NAME: Record<SupportedLang, string> = {
  kn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  hi: "श्रीराम पंडित",
  te: "శ్రీరామ్ పండిత్",
  ta: "ஸ்ரீராம் பண்டித்",
  en: "Shreeram Pandit"
};

const SHARE_WHATSAPP_BTN: Record<SupportedLang, string> = {
  kn: "WhatsApp ನಲ್ಲಿ ಹಂಚಿ (Clean Share)",
  hi: "WhatsApp पर साझा करें",
  te: "WhatsApp లో పంచుకోండి",
  ta: "WhatsApp இல் பகிரவும்",
  en: "Share on WhatsApp"
};

const DOWNLOAD_BTN: Record<SupportedLang, { ready: string; generating: string }> = {
  kn: { ready: "ಕಾರ್ಡ್ ಇಮೇಜ್ ಡೌನ್‌ಲೋಡ್ (PNG)", generating: "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." },
  hi: { ready: "कार्ड चित्र डाउनलोड (PNG)", generating: "तैयार हो रहा है..." },
  te: { ready: "కార్డ్ చిత్రం డౌన్‌లోడ్ (PNG)", generating: "సిద్ధమవుతోంది..." },
  ta: { ready: "கார்டு படம் பதிவிறக்கு (PNG)", generating: "தயாராகிறது..." },
  en: { ready: "Download Card Image", generating: "Generating Image..." }
};

const COPY_BTN: Record<SupportedLang, { copy: string; copied: string }> = {
  kn: { copy: "ಇಮೇಜ್ ಕಾಪಿ / ಡೌನ್‌ಲೋಡ್", copied: "ಇಮೇಜ್ & ಸಂದೇಶ ಕಾಪಿ ಆಗಿದೆ! ✓" },
  hi: { copy: "चित्र कॉपी / डाउनलोड", copied: "चित्र एवं संदेश कॉपी हो गया! ✓" },
  te: { copy: "చిత్రం కాపీ / డౌన్‌లోడ్", copied: "చిత్రం & సందేశం కాపీ అయింది! ✓" },
  ta: { copy: "படம் நகல் / பதிவிறக்கு", copied: "படம் & செய்தி நகலெடுக்கப்பட்டது! ✓" },
  en: { copy: "Copy Image & Text", copied: "Image & Message Copied! ✓" }
};

export const DailyBlessingShareCard: React.FC<DailyBlessingShareCardProps> = ({
  devoteeName,
  dateStr,
  tithiStr = "",
  nakshatraStr = "",
  goldenHourStr = "10:48 AM - 11:36 AM",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  customShlokaText,
  customShlokaMeaning,
  customDeitySource
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(
    ["kn", "en", "hi", "te", "ta"].includes(lang) ? (lang as SupportedLang) : "kn"
  );

  useEffect(() => {
    if (["kn", "en", "hi", "te", "ta"].includes(lang)) {
      setSelectedLang(lang as SupportedLang);
    }
  }, [lang]);

  // Exact deterministic date for all 365 days
  const parsedDate = useMemo(() => {
    try {
      const parts = dateStr.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    } catch {}
    return new Date();
  }, [dateStr]);

  const inspiration = useMemo(() => {
    return getDailyInspiration(parsedDate);
  }, [parsedDate]);

  // 365-Day Deterministic Vibrant Vedic Background Configuration
  const bgConfig = useMemo(() => {
    return getDailyBackgroundConfig(inspiration.dayOfYear);
  }, [inspiration.dayOfYear]);

  const svgBackgroundHtml = useMemo(() => {
    return renderDailyVedicSvgBackground(bgConfig);
  }, [bgConfig]);

  const morningVibe = inspiration.goodMorningVibe[selectedLang] || inspiration.goodMorningVibe.kn;
  const shlokaText = customShlokaText || (
    selectedLang === "en" ? inspiration.shlokaText.transliteration :
    selectedLang === "hi" ? (inspiration.shlokaText.hi || inspiration.shlokaText.sa) :
    selectedLang === "te" ? (inspiration.shlokaText.te || inspiration.shlokaText.sa) :
    selectedLang === "ta" ? (inspiration.shlokaText.ta || inspiration.shlokaText.sa) :
    inspiration.shlokaText.kn
  );
  const shlokaMeaning = customShlokaMeaning || (inspiration.shlokaMeaning[selectedLang] || inspiration.shlokaMeaning.kn);
  const deitySourceText = customDeitySource || inspiration.deitySource;
  const goodDeed = inspiration.goodDeedOfTheDay[selectedLang] || inspiration.goodDeedOfTheDay.kn;
  const motivationalQuote = inspiration.motivationalQuote[selectedLang] || inspiration.motivationalQuote.kn;

  const shareText = useMemo(() => {
    return buildCleanDailyWhatsAppShareText(
      dateStr,
      selectedLang,
      tithiStr,
      nakshatraStr,
      customShlokaText,
      customDeitySource
    );
  }, [dateStr, selectedLang, tithiStr, nakshatraStr, customShlokaText, customDeitySource]);

  /**
   * Generates High-Resolution Canvas with pixel-perfect Indic vertical centering and high-contrast text backing
   */
  const generateCardCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    return await html2canvas(cardRef.current, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        const cardEl = clonedDoc.querySelector("[data-blessing-card]") as HTMLElement;
        if (cardEl) {
          cardEl.style.width = "580px";
          cardEl.style.maxWidth = "580px";
          cardEl.style.letterSpacing = "normal";
        }

        // 1. Highlight all text boxes with opaque dark gold parchment backing in PNG so text is 100% sharp
        const glassBoxes = clonedDoc.querySelectorAll("[data-glass-box='true']");
        glassBoxes.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.backgroundColor = "rgba(10, 3, 0, 0.88)";
        });

        // 2. Mathematically elevate all pills and chips so text lands dead-center on canvas rasterization
        const pills = clonedDoc.querySelectorAll("[data-pill='true']");
        pills.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = "flex";
          htmlEl.style.alignItems = "center";
          htmlEl.style.justifyContent = "center";
          htmlEl.style.backgroundColor = "rgba(10, 3, 0, 0.90)";
          htmlEl.style.lineHeight = "1";
          const span = htmlEl.querySelector("span");
          if (span) {
            span.style.display = "inline-block";
            span.style.lineHeight = "1";
            span.style.position = "relative";
            span.style.top = "-4px";
          }
        });

        // 3. Elevate Shubha Muhurtha pill
        const greenPills = clonedDoc.querySelectorAll("[data-green-pill='true']");
        greenPills.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = "flex";
          htmlEl.style.alignItems = "center";
          htmlEl.style.justifyContent = "center";
          htmlEl.style.backgroundColor = "rgba(6, 78, 59, 0.92)";
          htmlEl.style.lineHeight = "1";
          const span = htmlEl.querySelector("span");
          if (span) {
            span.style.display = "inline-block";
            span.style.lineHeight = "1";
            span.style.position = "relative";
            span.style.top = "-4px";
          }
        });

        // 4. Elevate footer location & priest text
        const footerSpans = clonedDoc.querySelectorAll("[data-footer-item='true']");
        footerSpans.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.position = "relative";
          htmlEl.style.top = "-2.5px";
          htmlEl.style.lineHeight = "1";
        });
      }
    });
  };

  /**
   * Direct PNG Download & Native WhatsApp Image Sharing
   */
  const handleDownloadCardImage = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await generateCardCanvas();
      if (!canvas) return;

      const filename = `Baggona_Panchanga_Daily_Blessings_${dateStr.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn("Failed to generate blessing card image:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /**
   * WhatsApp Share: Simultaneously downloads the PNG file and shares clean message & image
   */
  const handleWhatsAppShare = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await generateCardCanvas();
      if (canvas) {
        // Auto-download PNG image for user's gallery
        const filename = `Baggona_Panchanga_Daily_Blessings_${dateStr.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
        const imgData = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = imgData;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Native Mobile Share with Image attachment
        if (typeof navigator !== "undefined" && navigator.canShare) {
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
          if (blob) {
            const file = new File([blob], filename, { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: "Baggona Panchanga Daily Blessings",
                text: shareText,
                files: [file]
              });
              setIsGeneratingImage(false);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Native share skipped, opening WhatsApp:", e);
    }

    // Direct WhatsApp Web / Mobile redirect with clean text (no private URLs)
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    setIsGeneratingImage(false);
  };

  /**
   * Copy Action: Copies PNG Image to clipboard directly (if supported) & downloads PNG
   */
  const handleCopyMessage = async () => {
    try {
      const canvas = await generateCardCanvas();
      if (canvas && typeof navigator !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new (window as any).ClipboardItem({ "image/png": blob })
            ]);
          }
        }, "image/png");
      }
    } catch {}

    // Also download PNG file directly to local phone/computer
    handleDownloadCardImage();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const locationText = LOCATION_LABEL[selectedLang] || LOCATION_LABEL.en;
  const chiefPriestLabel = CHIEF_PRIEST_LABEL[selectedLang] || CHIEF_PRIEST_LABEL.en;
  const localizedPriestName = (!priestName || priestName === "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" || priestName === "Shreeram Pandit")
    ? (DEFAULT_PRIEST_NAME[selectedLang] || "Shreeram Pandit")
    : priestName;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #2D0C02 0%, #1A0600 100%)",
        border: "2px solid #D4AF37",
        borderRadius: "24px",
        padding: "18px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.65)",
        color: "#FFF8E7",
        fontFamily: "'Segoe UI', -apple-system, system-ui, 'Noto Sans Kannada', 'Tiro Kannada', sans-serif"
      }}
    >
      {/* Dynamic Keyframe Animations for Live Web Preview */}
      <style>{`
        @keyframes sunRaySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatBokehAnim {
          0% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-12px) scale(1.15); opacity: 0.7; }
          100% { transform: translateY(0px) scale(1); opacity: 0.3; }
        }
        @keyframes auraPulse {
          0% { opacity: 0.85; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>

      {/* Header with Title & Language Switcher */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
          paddingBottom: "12px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.2)",
              border: "1px solid #F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}
          >
            {bgConfig.deityIcon}
          </span>
          <div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 900,
                color: "#FDE68A",
                margin: 0,
                letterSpacing: "normal"
              }}
            >
              {CARD_HEADER_TITLE[selectedLang] || CARD_HEADER_TITLE.kn}
            </h3>
            <span style={{ fontSize: "11px", color: "#FCD34D", fontWeight: 700 }}>
              {(CARD_HEADER_SUBTITLE[selectedLang] || CARD_HEADER_SUBTITLE.kn)(bgConfig.themeName)}
            </span>
          </div>
        </div>

        {/* 5-Language Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(0,0,0,0.45)",
            padding: "4px",
            borderRadius: "12px",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}
        >
          {(["kn", "en", "hi", "te", "ta"] as SupportedLang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setSelectedLang(l)}
              style={{
                padding: "5px 10px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: selectedLang === l ? 900 : 600,
                background: selectedLang === l ? "linear-gradient(135deg, #F59E0B, #D97706)" : "transparent",
                color: selectedLang === l ? "#000000" : "#FDE68A",
                border: selectedLang === l ? "1px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {l === "kn" ? "Kannada (ಕನ್ನಡ)" : l === "en" ? "English" : l === "hi" ? "Hindi (हिन्दी)" : l === "te" ? "Telugu (తెలుగు)" : "Tamil (தமிழ்)"}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Blessing Card Preview (100% Visible Artwork with Frosted Glass Text Boxes) */}
      <div
        ref={cardRef}
        data-blessing-card="true"
        style={{
          backgroundImage: `url(${bgConfig.posterImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          border: `2.5px solid ${bgConfig.borderGold || "#D4AF37"}`,
          borderRadius: "22px",
          padding: "20px 16px 16px 16px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 16px 45px rgba(0,0,0,0.9)",
          textAlign: "center",
          maxWidth: "580px",
          margin: "0 auto 16px",
          boxSizing: "border-box"
        }}
      >
        {/* Soft Transparent Golden Sunbeams Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0
          }}
          dangerouslySetInnerHTML={{ __html: svgBackgroundHtml }}
        />

        {/* 1. Kshetra Insignia Banner - Dead-Center Mathematical Alignment */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div
            data-pill="true"
            style={{
              position: "relative",
              zIndex: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "36px",
              padding: "0 22px",
              background: "rgba(10, 3, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1.5px solid ${bgConfig.accentGold || "#F59E0B"}`,
              borderRadius: "999px",
              fontSize: "12.5px",
              fontWeight: 800,
              color: "#FFFBEB",
              boxSizing: "border-box",
              boxShadow: "0 4px 18px rgba(0,0,0,0.6)"
            }}
          >
            <span>{KSHETRA_INSIGNIA[selectedLang] || KSHETRA_INSIGNIA.kn}</span>
          </div>
        </div>

        {/* 2. Date & Panchanga Chips - Dead-Center Mathematical Alignment */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "12px"
          }}
        >
          <div
            data-pill="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "32px",
              padding: "0 16px",
              borderRadius: "999px",
              background: "rgba(10, 3, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.2px solid rgba(251, 191, 36, 0.65)",
              color: "#FEF3C7",
              fontWeight: 800,
              fontSize: "12px",
              boxSizing: "border-box",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
            }}
          >
            <span>📅 {dateStr}</span>
          </div>
          {tithiStr && (
            <div
              data-pill="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "32px",
                padding: "0 16px",
                borderRadius: "999px",
                background: "rgba(10, 3, 0, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1.2px solid rgba(251, 191, 36, 0.65)",
                color: "#FEF3C7",
                fontWeight: 800,
                fontSize: "12px",
                boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
              }}
            >
              <span>✨ {tithiStr}</span>
            </div>
          )}
          {nakshatraStr && (
            <div
              data-pill="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "32px",
                padding: "0 16px",
                borderRadius: "999px",
                background: "rgba(10, 3, 0, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1.2px solid rgba(251, 191, 36, 0.65)",
                color: "#FEF3C7",
                fontWeight: 800,
                fontSize: "12px",
                boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
              }}
            >
              <span>⭐ {nakshatraStr}</span>
            </div>
          )}
        </div>

        {/* 3. Shubha Muhurtha Pill - Dead-Center Mathematical Alignment */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div
            data-green-pill="true"
            style={{
              position: "relative",
              zIndex: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "32px",
              padding: "0 20px",
              borderRadius: "999px",
              background: "rgba(6, 78, 59, 0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.5px solid #34D399",
              color: "#A7F3D0",
              fontWeight: 800,
              fontSize: "12px",
              boxSizing: "border-box",
              boxShadow: "0 3px 12px rgba(6, 78, 59, 0.5)"
            }}
          >
            <span>{(SHUBHA_MUHURTHA_LABEL[selectedLang] || SHUBHA_MUHURTHA_LABEL.kn)} {goldenHourStr}</span>
          </div>
        </div>

        {/* 4. Good Morning Vibe - Sleek Frosted Glass Card with High-Contrast Backing */}
        <div
          data-glass-box="true"
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(8, 2, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1.2px solid rgba(251, 191, 36, 0.5)",
            borderRadius: "14px",
            padding: "11px 15px",
            marginBottom: "10px",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.45)"
          }}
        >
          <div
            style={{
              fontSize: "11.5px",
              fontWeight: 900,
              color: "#FBBF24",
              marginBottom: "4px"
            }}
          >
            {MORNING_BLESSING_LABEL[selectedLang] || MORNING_BLESSING_LABEL.kn}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#FFF8E7",
              lineHeight: "1.5",
              fontWeight: 700
            }}
          >
            {morningVibe}
          </div>
        </div>

        {/* 5. Sacred Daily Shloka & Meaning - Sleek Frosted Glass Card */}
        <div
          data-glass-box="true"
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(8, 2, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1.5px solid ${bgConfig.accentGold || "#F59E0B"}`,
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "10px",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 900,
              color: "#FDE68A",
              marginBottom: "6px"
            }}
          >
            {(DAILY_SHLOKA_LABEL[selectedLang] || DAILY_SHLOKA_LABEL.kn)(deitySourceText)}
          </div>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: "1.6",
              marginBottom: "8px"
            }}
          >
            "{shlokaText}"
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#FEF3C7",
              fontStyle: "italic",
              lineHeight: "1.5",
              borderTop: "1px solid rgba(251, 191, 36, 0.35)",
              paddingTop: "6px"
            }}
          >
            {shlokaMeaning}
          </div>
        </div>

        {/* 6. Two-Column Grid: Good Karma Deed & Motivational Thought */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginBottom: "10px",
            textAlign: "left"
          }}
        >
          <div
            data-glass-box="true"
            style={{
              background: "rgba(8, 2, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.2px solid rgba(52, 211, 153, 0.55)",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 900,
                color: "#6EE7B7",
                marginBottom: "3px"
              }}
            >
              {GOOD_KARMA_LABEL[selectedLang] || GOOD_KARMA_LABEL.kn}
            </div>
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#ECFDF5",
                lineHeight: "1.45"
              }}
            >
              {goodDeed}
            </div>
          </div>

          <div
            data-glass-box="true"
            style={{
              background: "rgba(8, 2, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.2px solid rgba(251, 191, 36, 0.55)",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 900,
                color: "#FDE68A",
                marginBottom: "3px"
              }}
            >
              {LIFE_INSIGHT_LABEL[selectedLang] || LIFE_INSIGHT_LABEL.kn}
            </div>
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#FFFBEB",
                lineHeight: "1.45"
              }}
            >
              "{motivationalQuote}"
            </div>
          </div>
        </div>

        {/* 7. Bottom Temple Benediction & Dynamic Selected Priest Stamp */}
        <div
          data-glass-box="true"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11px",
            fontWeight: 800,
            color: "#FDE68A",
            background: "rgba(8, 2, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "10px",
            height: "36px",
            padding: "0 14px",
            boxSizing: "border-box",
            border: "1px solid rgba(245, 158, 11, 0.35)"
          }}
        >
          <span data-footer-item="true">{locationText}</span>
          <span data-footer-item="true">{chiefPriestLabel}: {localizedPriestName}</span>
        </div>
      </div>

      {/* Action Buttons: 1-Tap WhatsApp Image Share, High-Res PNG Download, Copy */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px"
        }}
      >
        <button
          type="button"
          onClick={handleWhatsAppShare}
          style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFFFFF",
            border: "1px solid #34D399",
            borderRadius: "14px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
          }}
        >
          <span>💬</span>
          <span>{SHARE_WHATSAPP_BTN[selectedLang] || SHARE_WHATSAPP_BTN.kn}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCardImage}
          disabled={isGeneratingImage}
          style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#000000",
            border: "1px solid #FDE68A",
            borderRadius: "14px",
            fontSize: "12px",
            fontWeight: 900,
            cursor: isGeneratingImage ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
            opacity: isGeneratingImage ? 0.6 : 1
          }}
        >
          <span>📸</span>
          <span>
            {isGeneratingImage
              ? (DOWNLOAD_BTN[selectedLang] || DOWNLOAD_BTN.kn).generating
              : (DOWNLOAD_BTN[selectedLang] || DOWNLOAD_BTN.kn).ready}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopyMessage}
          style={{
            padding: "12px 16px",
            background: "#FFFDF7",
            color: "#1E293B",
            border: "1px solid #FDE68A",
            borderRadius: "14px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          <span>📋</span>
          <span>{isCopied ? (COPY_BTN[selectedLang] || COPY_BTN.kn).copied : (COPY_BTN[selectedLang] || COPY_BTN.kn).copy}</span>
        </button>
      </div>
    </div>
  );
};
