import React, { useRef, useState, useMemo } from "react";
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
}

export const DailyBlessingShareCard: React.FC<DailyBlessingShareCardProps> = ({
  dateStr,
  tithiStr = "",
  nakshatraStr = "",
  goldenHourStr = "10:48 AM - 11:36 AM",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(
    ["kn", "en", "hi", "te", "ta"].includes(lang) ? (lang as SupportedLang) : "kn"
  );

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

  // 365-Day Deterministic Luxury Vedic Background Configuration
  const bgConfig = useMemo(() => {
    return getDailyBackgroundConfig(inspiration.dayOfYear);
  }, [inspiration.dayOfYear]);

  const svgBackgroundHtml = useMemo(() => {
    return renderDailyVedicSvgBackground(bgConfig);
  }, [bgConfig]);

  const morningVibe = inspiration.goodMorningVibe[selectedLang] || inspiration.goodMorningVibe.kn;
  const shlokaText = selectedLang === "en" ? inspiration.shlokaText.transliteration : inspiration.shlokaText.kn;
  const shlokaMeaning = inspiration.shlokaMeaning[selectedLang] || inspiration.shlokaMeaning.kn;
  const goodDeed = inspiration.goodDeedOfTheDay[selectedLang] || inspiration.goodDeedOfTheDay.kn;
  const motivationalQuote = inspiration.motivationalQuote[selectedLang] || inspiration.motivationalQuote.kn;

  const shareText = useMemo(() => {
    return buildCleanDailyWhatsAppShareText(dateStr, selectedLang, tithiStr, nakshatraStr);
  }, [dateStr, selectedLang, tithiStr, nakshatraStr]);

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleDownloadCardImage = async () => {
    if (!cardRef.current || isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#1A0600",
        logging: false,
        onclone: (clonedDoc) => {
          const cardEl = clonedDoc.querySelector("[data-blessing-card]") as HTMLElement;
          if (cardEl) {
            cardEl.style.width = "580px";
            cardEl.style.maxWidth = "580px";
            cardEl.style.letterSpacing = "normal";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `Baggona_Panchanga_Daily_Blessings_${dateStr.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      a.click();
    } catch (err) {
      console.warn("Failed to generate blessing card image:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isKn = selectedLang === "kn";

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
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.2)",
              border: "1px solid #F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px"
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
              {isKn ? "ನಿತ್ಯ ಶುಭೋದಯ ಸಂದೇಶ & ಆಶೀರ್ವಾದ ಎನ್‌ವಲಪ್" : "Daily Good Morning & Shloka Blessings"}
            </h3>
            <span style={{ fontSize: "11px", color: "#FCD34D", fontWeight: 700 }}>
              {isKn
                ? `೩೬೫ ದಿನಗಳ ನಿತ್ಯ ಶ್ಲೋಕ, ದೈವಿಕ ಕಲಾಚಿತ್ರ & ವಾಟ್ಸಾಪ್ ಹಂಚಿಕೆ (${bgConfig.themeName})`
                : `365 Days Daily Shloka, Sunrise Art & WhatsApp Share (${bgConfig.themeName})`}
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
                padding: "4px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: selectedLang === l ? 900 : 600,
                background: selectedLang === l ? "linear-gradient(135deg, #F59E0B, #D97706)" : "transparent",
                color: selectedLang === l ? "#000000" : "#FDE68A",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {l === "kn" ? "ಕನ್ನಡ" : l === "en" ? "EN" : l === "hi" ? "हिंदी" : l === "te" ? "తెలుగు" : "தமிழ்"}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Blessing Card Preview (Renderable to High-Res PNG with 365-Day Luxury Background) */}
      <div
        ref={cardRef}
        data-blessing-card="true"
        style={{
          background: bgConfig.gradientCss,
          border: `2px solid ${bgConfig.borderGold || "#D4AF37"}`,
          borderRadius: "20px",
          padding: "20px 18px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(0,0,0,0.7)",
          textAlign: "center",
          maxWidth: "580px",
          margin: "0 auto 16px"
        }}
      >
        {/* Soft Radial Morning Aura */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bgConfig.glowAura,
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        {/* 🌟 365-Day High-Definition Vector SVG Background (Sacred Sunbeams, Temple Spire, Mandala) */}
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

        {/* Kshetra Insignia Banner - Clean typography without overlapping letter-spacing */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "inline-block",
            padding: "6px 16px",
            background: "rgba(10, 4, 0, 0.75)",
            border: `1.5px solid ${bgConfig.accentGold || "#F59E0B"}`,
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#FFFBEB",
            letterSpacing: "normal",
            marginBottom: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)"
          }}
        >
          ✨ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ✨
        </div>

        {/* Date & Panchanga Chips */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "14px",
            fontSize: "12px"
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "10px",
              background: "rgba(10, 4, 0, 0.65)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              color: "#FEF3C7",
              fontWeight: 700
            }}
          >
            📅 {dateStr}
          </span>
          {tithiStr && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "10px",
                background: "rgba(10, 4, 0, 0.65)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                color: "#FEF3C7",
                fontWeight: 700
              }}
            >
              ✨ {tithiStr}
            </span>
          )}
          {nakshatraStr && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "10px",
                background: "rgba(10, 4, 0, 0.65)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                color: "#FEF3C7",
                fontWeight: 700
              }}
            >
              ⭐ {nakshatraStr}
            </span>
          )}
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "10px",
              background: "rgba(6, 78, 59, 0.75)",
              border: "1px solid #34D399",
              color: "#A7F3D0",
              fontWeight: 800
            }}
          >
            ⏳ ಶುಭ ಮುಹೂರ್ತ: {goldenHourStr}
          </span>
        </div>

        {/* Good Morning Vibe Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(12, 5, 1, 0.72)",
            border: "1.5px solid rgba(251, 191, 36, 0.35)",
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "12px",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 900,
              color: "#FBBF24",
              marginBottom: "6px",
              letterSpacing: "normal"
            }}
          >
            ☀️ {isKn ? "ಶುಭೋದಯ ಸಂದೇಶ (Morning Blessing)" : "Good Morning Blessing"}
          </div>
          <div
            style={{
              fontSize: "13.5px",
              color: "#FFF8E7",
              lineHeight: "1.6",
              fontWeight: 600,
              letterSpacing: "normal"
            }}
          >
            {morningVibe}
          </div>
        </div>

        {/* Sacred Daily Shloka & Meaning */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(15, 6, 1, 0.8)",
            border: `1.5px solid ${bgConfig.accentGold || "#F59E0B"}`,
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "12px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 900,
              color: "#FDE68A",
              marginBottom: "8px",
              letterSpacing: "normal"
            }}
          >
            🪔 {isKn ? `ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${inspiration.deitySource})` : `Daily Sacred Shloka (${inspiration.deitySource})`}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: "1.65",
              marginBottom: "10px",
              letterSpacing: "normal"
            }}
          >
            "{shlokaText}"
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#FEF3C7",
              fontStyle: "italic",
              lineHeight: "1.6",
              borderTop: "1px solid rgba(251, 191, 36, 0.25)",
              paddingTop: "8px",
              letterSpacing: "normal"
            }}
          >
            {shlokaMeaning}
          </div>
        </div>

        {/* Two-Column Grid: Good Karma Deed & Motivational Thought */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "14px",
            textAlign: "left"
          }}
        >
          <div
            style={{
              background: "rgba(10, 4, 0, 0.72)",
              border: "1.5px solid rgba(52, 211, 153, 0.45)",
              borderRadius: "14px",
              padding: "12px 14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#6EE7B7",
                marginBottom: "4px",
                letterSpacing: "normal"
              }}
            >
              🌱 {isKn ? "ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ (Good Karma):" : "Today's Good Karma:"}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#ECFDF5",
                lineHeight: "1.55",
                letterSpacing: "normal"
              }}
            >
              {goodDeed}
            </div>
          </div>

          <div
            style={{
              background: "rgba(10, 4, 0, 0.72)",
              border: "1.5px solid rgba(251, 191, 36, 0.45)",
              borderRadius: "14px",
              padding: "12px 14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#FDE68A",
                marginBottom: "4px",
                letterSpacing: "normal"
              }}
            >
              💡 {isKn ? "ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ (Life Insight):" : "Life Insight:"}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#FFFBEB",
                lineHeight: "1.55",
                letterSpacing: "normal"
              }}
            >
              "{motivationalQuote}"
            </div>
          </div>
        </div>

        {/* Bottom Temple Benediction & Priest Stamp */}
        <div
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
            borderTop: "1px solid rgba(245, 158, 11, 0.3)",
            paddingTop: "10px"
          }}
        >
          <span>🛕 ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿ</span>
          <span>ಮುಖ್ಯ ಅರ್ಚಕರು: {priestName}</span>
        </div>
      </div>

      {/* Action Buttons: 1-Tap WhatsApp, High-Res Image Download, Copy */}
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
          <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಹಂಚಿ (Clean Share)" : "Share on WhatsApp"}</span>
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
              ? (isKn ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating Image...")
              : (isKn ? "ಕಾರ್ಡ್ ಇಮೇಜ್ ಡೌನ್‌ಲೋಡ್ (PNG)" : "Download Card Image")}
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
          <span>{isCopied ? (isKn ? "ಕಾಪಿ ಆಗಿದೆ! ✓" : "Copied! ✓") : (isKn ? "ಸಂದೇಶ ಕಾಪಿ ಮಾಡಿ" : "Copy Text")}</span>
        </button>
      </div>
    </div>
  );
};
