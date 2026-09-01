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

  // 365-Day Deterministic Vibrant Vedic Background Configuration
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

  /**
   * Generates High-Resolution Canvas with pixel-perfect Indic vertical centering
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
   * WhatsApp Share: On mobile tries native image file sharing; falls back to clean formatted share + auto download
   */
  const handleWhatsAppShare = async () => {
    if (isGeneratingImage) return;
    setIsGeneratingImage(true);

    try {
      const canvas = await generateCardCanvas();
      if (canvas && typeof navigator !== "undefined" && navigator.canShare) {
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
        if (blob) {
          const file = new File([blob], `Baggona_Daily_Blessings_${dateStr}.png`, { type: "image/png" });
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
    } catch {}

    // Fallback: Open WhatsApp with clean text and trigger direct PNG download
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    handleDownloadCardImage();
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

      {/* Visual Blessing Card Preview (100% Visible, Luminous, Unobscured Photographic Artwork with Glassmorphism) */}
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

        {/* 1. Kshetra Insignia Banner - Dead-Center Mathematical Grid Alignment */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "inline-grid",
              placeItems: "center",
              height: "36px",
              padding: "0 22px",
              background: "rgba(0, 0, 0, 0.45)",
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
            <span>✨ ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕ್ಷೇತ್ರ • ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥ ✨</span>
          </div>
        </div>

        {/* 2. Date & Panchanga Chips - Dead-Center Mathematical Grid Alignment */}
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
            style={{
              display: "inline-grid",
              placeItems: "center",
              height: "32px",
              padding: "0 16px",
              borderRadius: "999px",
              background: "rgba(0, 0, 0, 0.45)",
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
              style={{
                display: "inline-grid",
                placeItems: "center",
                height: "32px",
                padding: "0 16px",
                borderRadius: "999px",
                background: "rgba(0, 0, 0, 0.45)",
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
              style={{
                display: "inline-grid",
                placeItems: "center",
                height: "32px",
                padding: "0 16px",
                borderRadius: "999px",
                background: "rgba(0, 0, 0, 0.45)",
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

        {/* 3. Shubha Muhurtha Pill - Dead-Center Mathematical Grid Alignment */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "inline-grid",
              placeItems: "center",
              height: "32px",
              padding: "0 20px",
              borderRadius: "999px",
              background: "rgba(6, 78, 59, 0.65)",
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
            <span>⏳ ಶುಭ ಮುಹೂರ್ತ: {goldenHourStr}</span>
          </div>
        </div>

        {/* 4. Good Morning Vibe - Sleek Frosted Glass Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.40)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1.2px solid rgba(251, 191, 36, 0.4)",
            borderRadius: "14px",
            padding: "10px 14px",
            marginBottom: "10px",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)"
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
            ☀️ {isKn ? "ಶುಭೋದಯ ಸಂದೇಶ (Morning Blessing)" : "Good Morning Blessing"}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#FFF8E7",
              lineHeight: "1.5",
              fontWeight: 600
            }}
          >
            {morningVibe}
          </div>
        </div>

        {/* 5. Sacred Daily Shloka & Meaning - Sleek Frosted Glass Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1.5px solid ${bgConfig.accentGold || "#F59E0B"}`,
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "10px",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
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
            🪔 {isKn ? `ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ (${inspiration.deitySource})` : `Daily Sacred Shloka (${inspiration.deitySource})`}
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
              borderTop: "1px solid rgba(251, 191, 36, 0.25)",
              paddingTop: "6px"
            }}
          >
            {shlokaMeaning}
          </div>
        </div>

        {/* 6. Two-Column Grid: Good Karma Deed & Motivational Thought - Sleek Frosted Glass */}
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
            style={{
              background: "rgba(0, 0, 0, 0.40)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.2px solid rgba(52, 211, 153, 0.5)",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
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
              🌱 {isKn ? "ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ (Good Karma):" : "Today's Good Karma:"}
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
            style={{
              background: "rgba(0, 0, 0, 0.40)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1.2px solid rgba(251, 191, 36, 0.5)",
              borderRadius: "12px",
              padding: "10px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
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
              💡 {isKn ? "ಸ್ಫೂರ್ತಿದಾಯಕ ಚಿಂತನೆ (Life Insight):" : "Life Insight:"}
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
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "6px 12px",
            border: "1px solid rgba(245, 158, 11, 0.35)"
          }}
        >
          <span>🛕 ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿ</span>
          <span>ಮುಖ್ಯ ಅರ್ಚಕರು: {priestName}</span>
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
          <span>{isCopied ? (isKn ? "ಇಮೇಜ್ & ಸಂದೇಶ ಕಾಪಿ ಆಗಿದೆ! ✓" : "Image & Message Copied! ✓") : (isKn ? "ಇಮೇಜ್ ಕಾಪಿ / ಡೌನ್‌ಲೋಡ್" : "Copy Image & Text")}</span>
        </button>
      </div>
    </div>
  );
};
