import React from "react";
import type { PanchangaSynthesisOutput } from "../../core/PanchangaAngaSynthesisEngine";
import {
  PDF_DICT,
  pickL6,
  getRashiName,
  getNakshatraName,
  getVaraName,
  getPlanetName,
  getSignLordName,
  getNakshatraLordName,
  getGenderName,
  formatCoordinates,
  formatDegree,
  getGocharaGuruDescription,
  getGocharaShaniDescription,
  isNarrationScriptMatchingLang,
  generateLocalizedExecutiveNarration,
  getTithiName,
  getYogaName,
  getKaranaName,
  getTatvaName,
  getNakshatraDeityName,
  type SupportedPdfLang,
  type DevoteeIdentity
} from "./instantReadingPdfLocale";

export interface InstantReadingPdfTemplateProps {
  synthesisData: PanchangaSynthesisOutput;
  session: any;
  aiNarration?: string[];
  lang?: SupportedPdfLang | string;
}

const PAGE_W = 900;
const PAGE_H = 1273;

// Palette with high-ink-economy luxury aesthetic
const PAPER = "#FFFDF7";
const PANEL = "#FDF6E7";
const PANEL_WARM = "#FBF2DC";
const PANEL_ACCENT = "#FEF3C7";
const INK = "#291809";
const INK_MUTED = "#6B5138";
const GOLD = "#B45309";
const GOLD_LIGHT = "#E7C68A";
const GOLD_BORDER = "#D97706";
const MAROON = "#7C2D12";
const GREEN = "#065F46";

const pageStyle: React.CSSProperties = {
  width: PAGE_W,
  minHeight: PAGE_H,
  backgroundColor: PAPER,
  boxSizing: "border-box",
  padding: "28px 36px",
  fontFamily:
    "'Noto Serif Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Noto Sans Malayalam', 'Noto Sans', 'Segoe UI', serif, sans-serif",
  color: INK,
  position: "relative",
  lineHeight: 1.55,
  letterSpacing: "normal",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

export default function InstantReadingPdfTemplate({
  synthesisData,
  session,
  aiNarration,
  lang = "kn"
}: InstantReadingPdfTemplateProps): JSX.Element {
  const selectedLang = ((lang || "kn").split("-")[0] || "kn") as SupportedPdfLang;

  const t = (key: string): string => pickL6(PDF_DICT[key] || {}, selectedLang);

  // Extract devotee identity & astronomical inputs
  const name = session?.input?.name || "Devotee";
  const birthDate = session?.birthDateYmd || session?.input?.birthDate || "---";
  const birthTime = session?.birthTimeHm || session?.input?.birthTime || "12:00";
  const birthPlace = session?.input?.location || session?.input?.place || "Gokarna, Karnataka";
  const gender = session?.input?.gender || "Not Specified";
  const latitude = session?.input?.latitude;
  const longitude = session?.input?.longitude;
  const lagnaRashiEn = session?.result?.lagnaRashi?.english || "Aries";
  const lagnaDegree = session?.result?.ascendant;
  const moonRashiEn = session?.result?.moonSign?.english || "Aries";
  const moonPlanet = session?.result?.planets?.find((p: any) => p.name === "Moon");
  const moonNakshatraEn = moonPlanet?.nakshatra?.english || "Ashwini";
  const pada = session?.result?.moonPada || moonPlanet?.nakshatra?.pada || 1;

  // Calculate devotee age
  let devoteeAge = 30;
  if (birthDate && birthDate.length >= 4) {
    const y = parseInt(birthDate.substring(0, 4), 10);
    if (!isNaN(y)) devoteeAge = Math.max(1, new Date().getFullYear() - y);
  }

  // Dasha & Gochara inputs
  const dashaTiming = synthesisData.currentDiagnosis?.dashaTiming;
  const liveGochara = synthesisData.currentDiagnosis?.liveGochara;
  const prasthuthaSthiti = synthesisData.currentDiagnosis?.prasthuthaSthiti;

  const devotee: DevoteeIdentity = {
    name,
    age: devoteeAge,
    gender,
    birthDate,
    birthTime,
    birthPlace,
    lagnaName: lagnaRashiEn,
    rashiName: moonRashiEn,
    nakshatraName: moonNakshatraEn,
    pada,
    latitude,
    longitude,
    runningDashaSummary: prasthuthaSthiti?.runningDashaSummary,
    runningGocharaSummary: prasthuthaSthiti?.runningGocharaSummary
  };

  // Localized texts
  const lagnaText = getRashiName(lagnaRashiEn, selectedLang);
  const lagnaLordText = getSignLordName(lagnaRashiEn, selectedLang);
  const lagnaDegreeText = formatDegree(lagnaDegree);
  const rashiText = getRashiName(moonRashiEn, selectedLang);
  const rashiLordText = getSignLordName(moonRashiEn, selectedLang);
  const nakshatraText = getNakshatraName(moonNakshatraEn, selectedLang);
  const nakshatraLordText = getNakshatraLordName(moonNakshatraEn, selectedLang);
  const genderText = getGenderName(gender, selectedLang);
  const coordinatesText = formatCoordinates(latitude, longitude);

  // Panchanga 5-Angas
  const vara = synthesisData.panchanga.vara;
  const tithi = synthesisData.panchanga.tithi;
  const nak = synthesisData.panchanga.nakshatra;
  const yoga = synthesisData.panchanga.yoga;
  const karana = synthesisData.panchanga.karana;

  // Dasha display
  const currentMahaName = dashaTiming ? getPlanetName(dashaTiming.currentMaha, selectedLang) : "";
  const currentBhuktiName = dashaTiming ? getPlanetName(dashaTiming.currentBhukti, selectedLang) : "";
  const nextBhuktiName = dashaTiming?.nextBhukti ? getPlanetName(dashaTiming.nextBhukti, selectedLang) : "";
  const dashaTimeline = dashaTiming?.timelineEn || dashaTiming?.timelineKn || prasthuthaSthiti?.runningDashaSummary || "";
  const remainingMonths = dashaTiming?.remainingMonths;

  // Gochara display
  const guruHouse = liveGochara?.guruHouseFromMoon ?? 11;
  const shaniHouse = liveGochara?.shaniHouseFromMoon ?? 1;
  const guruTransitDesc = getGocharaGuruDescription(guruHouse, !!liveGochara?.isGuruAnukula, selectedLang);
  const shaniTransitDesc = getGocharaShaniDescription(
    shaniHouse,
    !!liveGochara?.isSadeSati,
    !!liveGochara?.isAshtamaShani,
    !!liveGochara?.isKantakaShani,
    selectedLang
  );

  // Executive narration with script match verification
  let narrationParagraphs = aiNarration && aiNarration.length >= 2 ? aiNarration : [];
  if (
    narrationParagraphs.length === 0 ||
    !isNarrationScriptMatchingLang(narrationParagraphs[0], selectedLang)
  ) {
    narrationParagraphs = generateLocalizedExecutiveNarration(synthesisData, devotee, selectedLang);
  }

  // Current Diagnosis & Life Situation
  const cls = synthesisData.currentDiagnosis.currentLifeSituation;
  const prof = synthesisData.currentDiagnosis.accurateProfession;
  const marriage = synthesisData.currentDiagnosis.marriageDestiny;
  const remedies = synthesisData.prescriptions;

  // Renders common luxury header on every page
  const renderRoyalHeader = (pageNum: number) => (
    <div
      style={{
        border: `2px solid ${GOLD}`,
        borderRadius: 12,
        backgroundColor: PANEL,
        padding: "10px 16px",
        marginBottom: 10,
        position: "relative"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${GOLD_LIGHT}`,
          paddingBottom: 4,
          marginBottom: 4
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15, color: GOLD }}>❖</span>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, letterSpacing: 1.5 }}>
            {t("sealBadge")}
          </span>
        </div>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            color: MAROON,
            backgroundColor: PANEL_WARM,
            border: `1px solid ${GOLD_LIGHT}`,
            padding: "2px 8px",
            borderRadius: 8
          }}
        >
          {pickL6({ kn: pageNum === 1 ? "ಭಾಗ ೧" : "ಭಾಗ ೨", hi: pageNum === 1 ? "भाग १ / Part 1" : "भाग २ / Part 2", te: pageNum === 1 ? "భాగం 1 / Part 1" : "భాగం 2 / Part 2", ta: pageNum === 1 ? "பகுதி 1 / Part 1" : "பகுதி 2 / Part 2", ml: pageNum === 1 ? "ഭാഗം 1 / Part 1" : "ഭാഗം 2 / Part 2", en: pageNum === 1 ? "Part 1" : "Part 2" }, selectedLang)}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: MAROON,
            fontFamily: "'Noto Serif Kannada', Georgia, serif",
            letterSpacing: 1
          }}
        >
          {t("brandBanner")}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: INK_MUTED, marginTop: 1 }}>
          {t("brandSubtitle")}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* ===================================================================
          PAGE 1: DEVOTEE PROFILE, PANCHANGA 5-ANGAS, DASHA & GOCHARA, EXECUTIVE NARRATION
          =================================================================== */}
      <div className="pdf-page" style={pageStyle}>
        <div>
          {renderRoyalHeader(1)}

          {/* Devotee Sacred Sankalpa & Janana Kundali Profile Card */}
          <div
            style={{
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: 10,
              backgroundColor: PANEL_WARM,
              padding: "9px 14px",
              marginBottom: 10
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: GOLD,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>🔱</span>
                <span>{t("devoteeDetails")}</span>
              </div>
              <span style={{ fontSize: 9, color: INK_MUTED, fontWeight: 700 }}>
                {t("labelCoordinates")}: {coordinatesText}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px 10px",
                fontSize: 11
              }}
            >
              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelName")}</span>
                <span style={{ fontWeight: 800, color: INK, fontSize: 12 }}>{devotee.name}</span>
              </div>
              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelGender")} & {t("labelAge")}</span>
                <span style={{ fontWeight: 700, color: INK }}>
                  {genderText} · {devotee.age} {selectedLang === "kn" ? "ವರ್ಷ" : selectedLang === "hi" ? "वर्ष" : selectedLang === "te" ? "సంవత్సరాలు" : selectedLang === "ta" ? "வயது" : selectedLang === "ml" ? "വയസ്സ്" : "Yrs"}
                </span>
              </div>
              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelDob")} & {t("labelTob")}</span>
                <span style={{ fontWeight: 700, color: INK }}>
                  {devotee.birthDate} · {devotee.birthTime}
                </span>
              </div>
              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelPlace")}</span>
                <span style={{ fontWeight: 700, color: INK }}>{devotee.birthPlace}</span>
              </div>

              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelLagna")} ({t("labelLagnaLord")})</span>
                <span style={{ fontWeight: 800, color: MAROON }}>
                  {lagnaText} ({lagnaLordText}{lagnaDegreeText ? `, ${lagnaDegreeText}` : ""})
                </span>
              </div>
              <div>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelRashi")} ({t("labelRashiLord")})</span>
                <span style={{ fontWeight: 800, color: MAROON }}>
                  {rashiText} ({rashiLordText})
                </span>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: INK_MUTED, display: "block", fontSize: 9 }}>{t("labelNakshatra")} & {t("labelNakshatraLord")}</span>
                <span style={{ fontWeight: 800, color: MAROON }}>
                  {nakshatraText} ({t("labelPada")} {devotee.pada}) · {t("labelNakshatraLord")}: {nakshatraLordText}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Panchanga 5-Angas Analysis */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secPanchangaTitle")}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 6
              }}
            >
              {/* Vara */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "6px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelVara")}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: INK, marginTop: 1 }}>
                  {getVaraName(vara.nameKn, selectedLang)}
                </div>
                <div style={{ fontSize: 8, color: INK_MUTED, marginTop: 1 }}>
                  {getPlanetName(vara.lord, selectedLang)} · {getTatvaName(vara.tatva, selectedLang)}
                </div>
              </div>

              {/* Tithi */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "6px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelTithi")}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: INK, marginTop: 1 }}>
                  {getTithiName(tithi.nameKn, selectedLang)}
                </div>
                <div style={{ fontSize: 8, color: INK_MUTED, marginTop: 1 }}>
                  {(tithi.paksha === "Shukla" ? pickL6({ kn: "ಶುಕ್ಲ ಪಕ್ಷ", en: "Shukla Paksha", hi: "शुक्ल पक्ष", te: "శుక్ల పక్షం", ta: "சுக்ல பட்சம்", ml: "ശുക്ല പക്ഷം" }, selectedLang) : pickL6({ kn: "ಕೃಷ್ಣ ಪಕ್ಷ", en: "Krishna Paksha", hi: "कृष्ण पक्ष", te: "కృష్ణ పక్షం", ta: "கிருஷ்ண பட்சம்", ml: "കൃഷ്ണ പക്ഷം" }, selectedLang))} · {getTatvaName(tithi.jalTatvaQuality || "ಜಲ ತತ್ತ್ವ", selectedLang)}
                </div>
              </div>

              {/* Nakshatra */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "6px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelNakshatra")}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: INK, marginTop: 1 }}>
                  {nakshatraText}
                </div>
                <div style={{ fontSize: 8, color: INK_MUTED, marginTop: 1 }}>
                  {getNakshatraDeityName(nak.deity, selectedLang)}
                </div>
              </div>

              {/* Yoga */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "6px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelYoga")}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: INK, marginTop: 1 }}>
                  {getYogaName(yoga.nameKn, selectedLang)}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: yoga.rule?.isAuspicious ? GREEN : MAROON,
                    fontWeight: 700,
                    marginTop: 1
                  }}
                >
                  {yoga.rule?.isAuspicious ? t("labelAuspicious") : t("labelCaution")}
                </div>
              </div>

              {/* Karana */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "6px 8px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 8.5, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelKarana")}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: INK, marginTop: 1 }}>
                  {getKaranaName(karana.nameKn, selectedLang)}
                </div>
                <div style={{ fontSize: 8, color: INK_MUTED, marginTop: 1 }}>
                  {karana.rule?.type === "Chara" ? t("labelChara") : t("labelSthira")}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Running Dasha-Bhukti & Gochara Live Transits */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secDashaGocharaTitle")}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr",
                gap: 8
              }}
            >
              {/* Dasha-Bhukti Card */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "7px 11px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: GOLD, textTransform: "uppercase" }}>
                    {t("labelActiveDasha")}
                  </span>
                  {remainingMonths != null && (
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: GREEN,
                        backgroundColor: "#ECFDF5",
                        padding: "1px 5px",
                        borderRadius: 4
                      }}
                    >
                      {remainingMonths} {pickL6({ kn: "ತಿಂಗಳು ಬಾಕಿ", en: "mo left", hi: "माह शेष", te: "నెలలు", ta: "மாதங்கள்", ml: "മാസങ്ങൾ" }, selectedLang)}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 800, color: INK }}>
                  {currentMahaName ? `${currentMahaName} - ${currentBhuktiName}` : (prasthuthaSthiti?.runningDashaSummary || pickL6({ kn: "ದಶಾ ಚಕ್ರ", en: "Dasha Cycle", hi: "दशा चक्र", te: "దశా చక్రం", ta: "தசா சக்கரம்", ml: "ദശാ ചക്രം" }, selectedLang))}
                </div>

                <div style={{ fontSize: 9, color: INK_MUTED }}>
                  <b>{t("labelTimeline")}:</b> {dashaTimeline}
                </div>

                {nextBhuktiName && (
                  <div style={{ fontSize: 9, color: INK_MUTED, borderTop: `1px dashed ${GOLD_LIGHT}`, paddingTop: 2, marginTop: 1 }}>
                    <b style={{ color: MAROON }}>{t("labelNextBhukti")}:</b> {nextBhuktiName}
                  </div>
                )}
              </div>

              {/* Gochara Transits Card */}
              <div
                style={{
                  border: `1px solid ${GOLD_LIGHT}`,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "7px 11px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3
                }}
              >
                <div style={{ fontSize: 9.5, fontWeight: 800, color: GOLD, textTransform: "uppercase" }}>
                  {t("labelLiveGochara")}
                </div>

                <div style={{ fontSize: 9.5, color: INK, lineHeight: 1.4 }}>
                  <b style={{ color: MAROON }}>{t("labelGuruTransit")}:</b> {guruTransitDesc}
                </div>

                <div style={{ fontSize: 9.5, color: INK, lineHeight: 1.4, borderTop: `1px dashed ${GOLD_LIGHT}`, paddingTop: 2, marginTop: 1 }}>
                  <b style={{ color: MAROON }}>{t("labelShaniTransit")}:</b> {shaniTransitDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Executive Astrological Synthesis Narration */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secNarrationTitle")}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {narrationParagraphs.slice(0, 3).map((para, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    border: `1px solid ${GOLD_LIGHT}`,
                    borderLeft: `3.5px solid ${GOLD}`,
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                    padding: "7px 11px",
                    fontSize: 10.5,
                    lineHeight: 1.55,
                    color: INK,
                    textAlign: "justify"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        color: GOLD,
                        backgroundColor: PANEL_ACCENT,
                        padding: "1px 5px",
                        borderRadius: 4,
                        marginTop: 1
                      }}
                    >
                      {pIdx + 1}
                    </span>
                    <span style={{ flex: 1 }}>{para}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div
          style={{
            borderTop: `1.5px solid ${GOLD_LIGHT}`,
            paddingTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 9.5,
            color: INK_MUTED
          }}
        >
          <div>
            <b>{t("brandBanner")}</b> · {t("priestName")} · {pickL6({ kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ", en: "Gokarna Mahabaleshwara Kshetra", hi: "गोकर्ण महाबलेश्वर सन्निधान", te: "గోకర్ణ మహాబలేశ్వర సన్నిధానం", ta: "கோகர்ண மகாபலேஸ்வரர் சந்நிதி", ml: "ഗോകർണം മഹാബലേശ്വര സന്നിധാനം" }, selectedLang)}
          </div>
          <div style={{ fontWeight: 800, color: GOLD }}>{t("page1Footer")}</div>
        </div>
      </div>

      {/* ===================================================================
          PAGE 2: ACUTE REALITY, CAREER, MARRIAGE, GOKARNA REMEDIES & SEAL
          =================================================================== */}
      <div className="pdf-page" style={pageStyle}>
        <div>
          {renderRoyalHeader(2)}

          {/* Section 4: Acute Current Life Reality & Psychological Weather */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 5,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secLifeRealityTitle")}</span>
            </div>

            <div
              style={{
                border: `1.5px solid ${cls?.severity === "critical" || cls?.severity === "high" ? "#F87171" : GOLD_LIGHT}`,
                borderRadius: 9,
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 5
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: MAROON }}>
                  {selectedLang === "kn" ? (cls?.headlineKn || "ಜೀವನದ ಪ್ರಮುಖ ಪರಿವರ್ತನಾ ಹಂತ") : (cls?.headlineEn || "Pivotal Life Transition")}
                </span>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 800,
                    backgroundColor: cls?.severity === "critical" ? "#FEE2E2" : PANEL_ACCENT,
                    color: cls?.severity === "critical" ? "#991B1B" : GOLD,
                    padding: "2px 7px",
                    borderRadius: 5
                  }}
                >
                  {cls?.severity?.toUpperCase() || "ACTIVE"}
                </span>
              </div>

              <div style={{ fontSize: 10.5, color: INK, lineHeight: 1.5 }}>
                <b style={{ color: GOLD }}>{t("labelExternalReality")}:</b>{" "}
                {selectedLang === "kn"
                  ? (cls?.externalLifeRealityKn || cls?.detailedRealityKn || "ಪ್ರಮುಖ ಜವಾಬ್ದಾರಿಗಳು")
                  : (cls?.externalLifeRealityEn || cls?.detailedRealityEn || "Pivotal professional and family commitments")}
              </div>

              <div style={{ fontSize: 10.5, color: INK, lineHeight: 1.5 }}>
                <b style={{ color: GOLD }}>{t("labelInternalMindset")}:</b>{" "}
                {selectedLang === "kn"
                  ? (cls?.internalMindsetKn || "ಆಂತರಿಕ ಮಾನಸಿಕ ಚಿಂತನೆಗಳು ಹಾಗೂ ನೆಮ್ಮದಿಯ ಅನ್ವೇಷಣೆ.")
                  : (cls?.internalMindsetEn || "Internal mental reflections, heightened sensitivity, and quest for tranquility.")}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: 8,
                  marginTop: 1,
                  paddingTop: 5,
                  borderTop: `1px dashed ${GOLD_LIGHT}`
                }}
              >
                <div style={{ fontSize: 10, color: INK_MUTED }}>
                  <b style={{ color: MAROON }}>{t("labelPlanetaryCulprit")}:</b>{" "}
                  {selectedLang === "kn" ? (cls?.planetaryCulpritKn || "ಶನಿ ಹಾಗೂ ರಾಹು ಗೋಚಾರ ಪ್ರಭಾವ") : (cls?.planetaryCulpritEn || "Saturn & Rahu transit influence")}
                </div>
                <div style={{ fontSize: 10, color: INK_MUTED, textAlign: "right" }}>
                  <b style={{ color: GREEN }}>{t("labelReliefTimeline")}:</b>{" "}
                  {selectedLang === "kn" ? (cls?.reliefTimelineKn || "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ") : (cls?.reliefTimelineEn || "within the next 3 to 6 months")}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Career Destiny & Flourishing Fields */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 5,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secCareerTitle")}</span>
            </div>

            <div
              style={{
                border: `1px solid ${GOLD_LIGHT}`,
                borderRadius: 9,
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 5
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: MAROON }}>
                  {selectedLang === "kn" ? (prof?.titleKn || "ವೃತ್ತಿಪರ ನಾಯಕತ್ವ ಹಾಗೂ ನಿರ್ವಹಣಾ ರಂಗ") : (prof?.titleEn || "Leadership, Strategy & Administration")}
                </span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: GOLD }}>
                  {pickL6({ kn: "10ನೇ ಭಾವ (ಕರ್ಮ ಸ್ಥಾನ) & ಅಮಾತ್ಯಕಾರಕ", en: "10th House (Karma) & Amatyakaraka", hi: "१०वां भाव (कर्म) एवं अमात्यकारक", te: "10వ భావం & అమాత్యకారక", ta: "10-ஆம் பாவம் & அமாத்யகாரகர்", ml: "10-ാം ഭാവം & അമാത്യകാരകൻ" }, selectedLang)}
                </span>
              </div>

              {prof?.topSuitableFields && prof.topSuitableFields.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {prof.topSuitableFields.slice(0, 4).map((f: any, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        backgroundColor: PANEL_WARM,
                        border: `1px solid ${GOLD_LIGHT}`,
                        padding: "2px 7px",
                        borderRadius: 5,
                        color: INK
                      }}
                    >
                      {selectedLang === "kn" ? f.fieldNameKn : (f.fieldNameEn || f.fieldNameKn)} ({f.suitabilityPercentage}%)
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 10.5, color: INK, lineHeight: 1.5 }}>
                <b style={{ color: GOLD }}>{t("labelLeadership")}:</b>{" "}
                {selectedLang === "kn"
                  ? (prof?.whyNativeShinesKn || prof?.leadershipPotentialKn || "ಜಾತಕರು ತಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ತೀಕ್ಷ್ಣ ನಿರ್ಧಾರ ಶಕ್ತಿಯಿಂದ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಉನ್ನತಿ ಕಾಣುತ್ತಾರೆ.")
                  : (prof?.whyNativeShinesEn || prof?.leadershipPotentialEn || "The native commands respect and material elevation through sharp discernment, integrity, and decisive leadership.")}
              </div>

              {prof?.specialCareerYogasKn && prof.specialCareerYogasKn.length > 0 && (
                <div style={{ fontSize: 10, color: INK_MUTED }}>
                  <b style={{ color: MAROON }}>{t("labelCareerYogas")}:</b>{" "}
                  {selectedLang === "kn" ? prof.specialCareerYogasKn.join(" • ") : (prof.specialCareerYogasEn?.join(" • ") || prof.specialCareerYogasKn.join(" • "))}
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Marriage & Family Harmony */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 5,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secMarriageTitle")}</span>
            </div>

            <div
              style={{
                border: `1px solid ${GOLD_LIGHT}`,
                borderRadius: 9,
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                fontSize: 10.5
              }}
            >
              <div>
                <b style={{ color: GOLD, display: "block", marginBottom: 2 }}>
                  {t("labelSpouseNature")}:
                </b>
                <span style={{ color: INK, lineHeight: 1.45 }}>
                  {selectedLang === "kn"
                    ? (marriage?.directAnswerKn || marriage?.titleKn || "ಶಾಂತ, ಗೌರವಾನ್ವಿತ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳನ್ನು ಗೌರವಿಸುವ ವ್ಯಕ್ತಿತ್ವ.")
                    : (marriage?.directAnswerEn || marriage?.titleEn || "Composed, cultured, and value-oriented temperament.")}
                </span>
              </div>
              <div>
                <b style={{ color: GOLD, display: "block", marginBottom: 2 }}>
                  {t("labelMaritalHarmony")}:
                </b>
                <span style={{ color: INK, lineHeight: 1.45 }}>
                  {selectedLang === "kn"
                    ? (marriage?.astrologicalReasoningKn || marriage?.subtitleKn || "ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಹಾಗೂ ಹೊಂದಾಣಿಕೆಯಿಂದ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ.")
                    : (marriage?.astrologicalReasoningEn || marriage?.subtitleEn || "Mutual empathy, emotional understanding, and planetary synergy foster harmony.")}
                </span>
              </div>
            </div>
          </div>

          {/* Section 7: Sacred Gokarna Remedies & Shanti Guidance */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: MAROON,
                marginBottom: 5,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>✦</span>
              <span>{t("secRemediesTitle")}</span>
            </div>

            <div
              style={{
                border: `1.5px solid ${GOLD_BORDER}`,
                borderRadius: 9,
                backgroundColor: PANEL_WARM,
                padding: "8px 12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 10px",
                fontSize: 10.5
              }}
            >
              <div>
                <b style={{ color: MAROON, display: "block", fontSize: 9.5 }}>{t("labelRudraksha")}:</b>
                <span style={{ fontWeight: 800, color: INK }}>
                  {selectedLang === "kn" ? remedies.rudraksha.nameKn : (remedies.rudraksha.nameEn || remedies.rudraksha.nameKn)} ({selectedLang === "kn" ? (remedies.rudraksha.wearingMethod || "ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ") : selectedLang === "hi" ? (remedies.rudraksha.wearingMethodHi || remedies.rudraksha.wearingMethodEn || "सोमवार प्रातः") : selectedLang === "te" ? (remedies.rudraksha.wearingMethodTe || remedies.rudraksha.wearingMethodEn || "సోమవారం ఉదయం") : selectedLang === "ta" ? (remedies.rudraksha.wearingMethodTa || remedies.rudraksha.wearingMethodEn || "திங்கட்கிழமை காலை") : (remedies.rudraksha.wearingMethodEn || "Monday morning")})
                </span>
              </div>
              <div>
                <b style={{ color: MAROON, display: "block", fontSize: 9.5 }}>{t("labelGemstone")}:</b>
                <span style={{ fontWeight: 800, color: INK }}>
                  {selectedLang === "kn"
                    ? `${remedies.gemstoneRing.primaryGemstoneKn} (${remedies.gemstoneRing.caratWeight}) - ${remedies.gemstoneRing.fingerKn}`
                    : `${remedies.gemstoneRing.primaryGemstoneEn || remedies.gemstoneRing.primaryGemstoneKn} (${remedies.gemstoneRing.caratWeight}) - ${remedies.gemstoneRing.fingerEn || remedies.gemstoneRing.fingerKn}`}
                </span>
              </div>
              <div>
                <b style={{ color: MAROON, display: "block", fontSize: 9.5 }}>{t("labelDailyRitual")}:</b>
                <span style={{ color: INK }}>
                  {selectedLang === "kn"
                    ? (synthesisData.currentDiagnosis?.prasthuthaSthiti?.immediateRemedies?.[0] || "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯಕ್ಕೆ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ.")
                    : (selectedLang === "hi" ? "प्रतिदिन सूर्योदय के समय ॐ नमः शिवाय का १०८ बार जप करें।" : selectedLang === "te" ? "ప్రతిరోజూ సూర్యోదయం వేళ శివ పంచాక్షరి జపం." : selectedLang === "ta" ? "தினசரி காலை வேளையில் சிவ பஞ்சாட்சர மந்திரம் 108 முறை ஜபம்." : selectedLang === "ml" ? "നിത്യേന പ്രഭാതത്തിൽ ശിവ പഞ്ചാക്ഷരീ മന്ത്ര ജപം." : "Daily morning chanting of Shiva Panchakshari Mantra (Om Namah Shivaya).")}
                </span>
              </div>
              <div>
                <b style={{ color: MAROON, display: "block", fontSize: 9.5 }}>{t("labelTemplePooja")}:</b>
                <span style={{ color: INK }}>
                  {selectedLang === "kn"
                    ? (remedies.shantiPooja.nameKn || "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ.")
                    : (remedies.shantiPooja.nameEn || "Sri Gokarna Mahabaleshwara Rudrabhisheka Seva & Sacred Sankalpa.")}
                </span>
              </div>
            </div>
          </div>

          {/* Chief Priest Blessing & Official Temple Seal Box */}
          <div
            style={{
              border: `2px solid ${GOLD}`,
              borderRadius: 10,
              backgroundColor: PANEL,
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 900, color: MAROON, letterSpacing: 0.5 }}>
                {t("priestBlessingTitle")}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: INK, marginTop: 1 }}>
                {t("priestName")}
              </div>
              <div style={{ fontSize: 9, color: INK_MUTED, marginTop: 1 }}>
                {t("priestRole")}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: GOLD,
                  marginTop: 4,
                  fontFamily: "'Noto Serif Kannada', Georgia, serif"
                }}
              >
                {t("shantiMantra")}
              </div>
            </div>

            {/* Official Stamp Graphical Badge */}
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: `3px double ${GOLD}`,
                backgroundColor: "#FFFDF7",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 4,
                boxShadow: "0 2px 5px rgba(180,83,9,0.15)",
                flexShrink: 0
              }}
            >
              <div style={{ fontSize: 13, color: MAROON }}>🔱</div>
              <div style={{ fontSize: 8, fontWeight: 900, color: MAROON, lineHeight: 1.1 }}>
                {pickL6({ kn: "ಬಗ್ಗೋಣ", en: "BAGGONA", hi: "बग्गोण", te: "బగ్గోణ", ta: "பக்கோணா", ml: "ബഗ്ഗോണ" }, selectedLang)}
              </div>
              <div style={{ fontSize: 7, fontWeight: 800, color: GOLD, letterSpacing: 0.5 }}>
                {pickL6({ kn: "ಪಂಚಾಂಗ", en: "PANCHANGA", hi: "पंचांग", te: "పంచాంగం", ta: "பஞ்சாங்கம்", ml: "പഞ്ചാംഗം" }, selectedLang)}
              </div>
              <div style={{ fontSize: 6.5, color: INK_MUTED }}>{pickL6({ kn: "ಗೋಕರ್ಣ", en: "GOKARNA", hi: "गोकर्ण", te: "గోకర్ణ", ta: "கோகர்ணம்", ml: "ഗോകർണം" }, selectedLang)}</div>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div
          style={{
            borderTop: `1.5px solid ${GOLD_LIGHT}`,
            paddingTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 9.5,
            color: INK_MUTED
          }}
        >
          <div>
            <b>{t("brandBanner")}</b> · {t("priestName")} · {pickL6({ kn: "ದೂರವಾಣಿ:", en: "Phone:", hi: "फ़ोन:", te: "ఫోన్:", ta: "தொலைபேசி:", ml: "ഫോൺ:" }, selectedLang)} +91 94486 24830
          </div>
          <div style={{ fontWeight: 800, color: GOLD }}>{t("page2Footer")}</div>
        </div>
      </div>
    </div>
  );
}
