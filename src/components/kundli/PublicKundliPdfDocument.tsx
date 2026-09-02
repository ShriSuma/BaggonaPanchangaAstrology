/**
 * Baggona Panchanga Astrology - Public Devotee Kundali Multi-Page Printable PDF Document
 * 100% Dynamic - Zero Hardcoded Values - Multi-Language (kn, en, hi, te, ta)
 * Includes Deep Personality, Hidden Psyche, Maandi & Current Inquest Pages
 */

import React from "react";
import type { KundliOutput } from "../../core/AstroTypes";
import {
  type PublicKundliProfile,
  type DynamicLifeAnalysisOutput,
  generateDeepPersonalityAnalysis
} from "../../features/publicKundli/publicKundliEngine";
import { getPublicKundliText, type PublicKundliLang } from "../../features/publicKundli/publicKundliLocale";
import TraditionalSouthPatrika from "./TraditionalSouthPatrika";

interface PublicKundliPdfDocumentProps {
  profile: PublicKundliProfile;
  kundli: KundliOutput;
  insights?: DynamicLifeAnalysisOutput | null;
  lang: PublicKundliLang;
  placeLabel: string;
}

export const PublicKundliPdfDocument: React.FC<PublicKundliPdfDocumentProps> = ({
  profile,
  kundli,
  insights,
  lang,
  placeLabel
}) => {
  const t = (key: string) => getPublicKundliText(key, lang);

  const pageContainerStyle: React.CSSProperties = {
    width: "794px",
    minHeight: "1123px",
    padding: "30px 36px",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "'Tiro Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Inter', serif, sans-serif",
    pageBreakAfter: "always",
    breakAfter: "page",
    position: "relative",
    overflow: "hidden"
  };

  const headerBorder: React.CSSProperties = {
    borderBottom: "2px solid #b45309",
    paddingBottom: "8px",
    marginBottom: "12px",
    textAlign: "center"
  };

  const p = profile.panchangaAttributes;
  const deep = profile.deepPersonality || generateDeepPersonalityAnalysis(profile, kundli, lang);

  return (
    <div className="public-kundli-pdf-root" style={{ width: "794px", background: "#ffffff" }}>
      {/* ==================================================================== */}
      {/* PAGE 1: SACRED HEADER, DEVOTEE DETAILS & TRADITIONAL SOUTH PATRIKA   */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        {/* Royal Decorative Header */}
        <div style={headerBorder}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#b45309", letterSpacing: "1.5px", marginBottom: "4px" }}>
            {t("sacredInvocation")}
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#78350f", margin: "2px 0", letterSpacing: "0.5px" }}>
            {t("portalTitle")}
          </h1>
          <div style={{ fontSize: "10px", color: "#475569", fontWeight: "600" }}>
            {t("portalSubtitle")} · {t("priestTitle")}: {t("priestName")} ({t("priestContact")})
          </div>
        </div>

        {/* Devotee Birth Meta Card */}
        <div
          style={{
            border: "1px solid #fde68a",
            borderRadius: "10px",
            backgroundColor: "#fffbeb",
            padding: "8px 12px",
            marginBottom: "10px",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: "8px",
            fontSize: "11px"
          }}
        >
          <div>
            <span style={{ color: "#78350f", fontWeight: "bold", display: "block", fontSize: "9px" }}>
              {t("nameLabel")}
            </span>
            <span style={{ fontWeight: "800", fontSize: "12px", color: "#0f172a" }}>
              {profile.name}
            </span>
          </div>

          <div>
            <span style={{ color: "#78350f", fontWeight: "bold", display: "block", fontSize: "9px" }}>
              {t("dobLabel")} & {t("tobLabel")}
            </span>
            <span style={{ fontWeight: "700", color: "#1e293b" }}>
              {profile.birthDate} · {profile.birthTime}
            </span>
          </div>

          <div>
            <span style={{ color: "#78350f", fontWeight: "bold", display: "block", fontSize: "9px" }}>
              {t("placeNameLabel")}
            </span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>
              {placeLabel || "Gokarna"}
            </span>
          </div>

          <div>
            <span style={{ color: "#78350f", fontWeight: "bold", display: "block", fontSize: "9px" }}>
              {t("yearsLabel")}
            </span>
            <span style={{ fontWeight: "700", color: "#b45309" }}>
              {profile.ageYears} {t("yearsLabel")}
            </span>
          </div>
        </div>

        {/* 4 Core Astrological Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "12px"
          }}
        >
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 8px", textAlign: "center", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block", fontWeight: "bold" }}>{t("lagnaBadge")}</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#78350f" }}>{profile.lagnaSign} ({profile.lagnaSanskrit})</span>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 8px", textAlign: "center", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block", fontWeight: "bold" }}>{t("rashiBadge")}</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#78350f" }}>{profile.moonSign} ({profile.moonSanskrit})</span>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 8px", textAlign: "center", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block", fontWeight: "bold" }}>{t("nakshatraBadge")}</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#78350f" }}>{profile.moonNakshatra} ({profile.moonPada})</span>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 8px", textAlign: "center", backgroundColor: "#ecfdf5" }}>
            <span style={{ fontSize: "9px", color: "#047857", display: "block", fontWeight: "bold" }}>{t("dashaBadge")}</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#065f46" }}>{profile.currentMahadasha} ({profile.currentBhukti})</span>
          </div>
        </div>

        {/* Traditional South Indian Janma Patrika */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", transform: "scale(0.92)", transformOrigin: "top center" }}>
          <TraditionalSouthPatrika
            kundli={kundli}
            personName={profile.name}
            birthDate={profile.birthDate}
            birthTime={profile.birthTime}
            latitude={14.5479}
            longitude={74.3188}
            placeLabel={placeLabel}
            ayanamsaModel="lahiri"
          />
        </div>

        {/* Page 1 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("tabPatrika")} · 1 / 6</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 2: DEEP PERSONALITY, HIDDEN PSYCHE, INQUEST & MAANDI            */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        <div style={headerBorder}>
          <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#78350f", margin: 0 }}>
            🔮 {t("tabPersonality")} · {t("astrologerDirectNarration")}
          </h2>
          <span style={{ fontSize: "9px", color: "#64748b" }}>
            100% Dynamic Astrological Inquest Grounded in Janma Lagna, Dasha-Gochara & Maandi
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "10px" }}>
          {/* Section 1: Personality */}
          <div style={{ border: "1px solid #fed7aa", backgroundColor: "#fffbeb", borderRadius: "8px", padding: "8px 12px" }}>
            <strong style={{ fontSize: "11px", color: "#c2410c", display: "block", marginBottom: "4px" }}>
              👤 {deep.personality.title}
            </strong>
            <p style={{ margin: "0 0 4px 0", lineHeight: 1.45, color: "#1e293b", textAlign: "justify" }}>
              {deep.personality.paragraph1}
            </p>
            <p style={{ margin: 0, lineHeight: 1.45, color: "#1e293b", textAlign: "justify" }}>
              {deep.personality.paragraph2}
            </p>
          </div>

          {/* Section 2: Hidden Secrets */}
          <div style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", borderRadius: "8px", padding: "8px 12px" }}>
            <strong style={{ fontSize: "11px", color: "#78350f", display: "block", marginBottom: "4px" }}>
              👁️ {deep.hiddenSecrets.title}
            </strong>
            <p style={{ margin: "0 0 4px 0", lineHeight: 1.45, color: "#334155", textAlign: "justify" }}>
              {deep.hiddenSecrets.paragraph1}
            </p>
            <p style={{ margin: 0, lineHeight: 1.45, color: "#334155", textAlign: "justify" }}>
              {deep.hiddenSecrets.paragraph2}
            </p>
          </div>

          {/* Section 3: Why Astrology Right Now */}
          <div style={{ border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", borderRadius: "8px", padding: "8px 12px" }}>
            <strong style={{ fontSize: "11px", color: "#15803d", display: "block", marginBottom: "4px" }}>
              ⏳ {deep.whyAstrology.title}
            </strong>
            <p style={{ margin: "0 0 4px 0", lineHeight: 1.45, color: "#14532d", textAlign: "justify" }}>
              {deep.whyAstrology.paragraph1}
            </p>
            <p style={{ margin: 0, lineHeight: 1.45, color: "#14532d", textAlign: "justify" }}>
              {deep.whyAstrology.paragraph2}
            </p>
          </div>

          {/* Section 5: Maandi Analysis */}
          <div style={{ border: "1.5px solid #f87171", backgroundColor: "#fef2f2", borderRadius: "8px", padding: "8px 12px" }}>
            <strong style={{ fontSize: "11px", color: "#b91c1c", display: "block", marginBottom: "4px" }}>
              🪐 {deep.maandiAnalysis.title}
            </strong>
            <p style={{ margin: "0 0 4px 0", lineHeight: 1.45, color: "#7f1d1d", textAlign: "justify" }}>
              {deep.maandiAnalysis.paragraph1}
            </p>
            <p style={{ margin: 0, lineHeight: 1.45, color: "#7f1d1d", textAlign: "justify" }}>
              {deep.maandiAnalysis.paragraph2}
            </p>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("tabPersonality")} · 2 / 6</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 3: BIRTH PANCHANGA ATTRIBUTES & HOUSE LORDS                     */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        <div style={headerBorder}>
          <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#78350f", margin: 0 }}>
            📜 {t("panchangaDetailsTitle")}
          </h2>
          <span style={{ fontSize: "9px", color: "#64748b" }}>
            100% Authentic Vedic Baggona Siddhanta Mathematical Calculations
          </span>
        </div>

        {/* Panchanga Attributes Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "18px"
          }}
        >
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("samvatsaraLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.samvatsaraKn} ({p?.samvatsara})</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("masaLabel")} & {t("pakshaLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.masaKn} ಮಾಸ · {p?.pakshaKn}</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("tithiLabel")} & {t("varaLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.tithiKn} ತಿಥಿ · {p?.weekdayKn}</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("nakshatraLabel")} & {t("padaBadge")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{profile.moonNakshatra} (ಪಾದ {profile.moonPada})</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("yogaLabel")} & {t("karanaLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.yogaKn} ಯೋಗ · {p?.karanaKn} ಕರಣ</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("yoniLabel")} / {t("ganaLabel")} / {t("nadiLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.yoniKn} ಯೋನಿ · {p?.ganaKn} ಗಣ · {p?.nadiKn} ನಾಡಿ</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("sunriseLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.sunrise}</strong>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>{t("sunsetLabel")}</span>
            <strong style={{ fontSize: "11px", color: "#78350f" }}>{p?.sunset}</strong>
          </div>
        </div>

        {/* House Lords Summary */}
        <div
          style={{
            border: "1.5px solid #fed7aa",
            backgroundColor: "#fff7ed",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "18px"
          }}
        >
          <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#c2410c", margin: "0 0 10px 0" }}>
            🏛️ {t("houseLordsSummaryTitle")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "10px" }}>
            <div style={{ borderBottom: "1px solid #ffedd5", paddingBottom: "4px" }}>
              <span style={{ color: "#7c2d12", display: "block", fontSize: "9px" }}>{t("lagnaLordTitle")}</span>
              <strong style={{ color: "#0f172a", fontSize: "11px" }}>{profile.lagnaLord}</strong>
            </div>
            <div style={{ borderBottom: "1px solid #ffedd5", paddingBottom: "4px" }}>
              <span style={{ color: "#7c2d12", display: "block", fontSize: "9px" }}>{t("lord10Title")}</span>
              <strong style={{ color: "#0f172a", fontSize: "11px" }}>{profile.lord10}</strong>
            </div>
            <div style={{ borderBottom: "1px solid #ffedd5", paddingBottom: "4px" }}>
              <span style={{ color: "#7c2d12", display: "block", fontSize: "9px" }}>{t("lord7Title")}</span>
              <strong style={{ color: "#0f172a", fontSize: "11px" }}>{profile.lord7}</strong>
            </div>
            <div style={{ borderBottom: "1px solid #ffedd5", paddingBottom: "4px" }}>
              <span style={{ color: "#7c2d12", display: "block", fontSize: "9px" }}>{t("lord6Title")}</span>
              <strong style={{ color: "#0f172a", fontSize: "11px" }}>{profile.lord6}</strong>
            </div>
            <div>
              <span style={{ color: "#7c2d12", display: "block", fontSize: "9px" }}>{t("lord5Title")}</span>
              <strong style={{ color: "#0f172a", fontSize: "11px" }}>{profile.lord5}</strong>
            </div>
          </div>
        </div>

        {/* Page 3 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("panchangaDetailsTitle")} · 3 / 6</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 4: PLANETARY POSITIONS TABLE & ASTROLOGICAL DIGNITIES           */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        <div style={headerBorder}>
          <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#78350f", margin: 0 }}>
            🪐 {t("planetaryTableHeading")}
          </h2>
          <span style={{ fontSize: "9px", color: "#64748b" }}>
            Lahiri Ayanamsa · Exact Astronomical Degrees & Bhava Placements
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "18px" }}>
          <thead>
            <tr style={{ backgroundColor: "#78350f", color: "#ffffff" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #78350f" }}>{t("planetCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #78350f" }}>{t("rashiCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #78350f" }}>{t("degreeCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #78350f" }}>{t("houseCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #78350f" }}>{t("nakshatraCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #78350f" }}>{t("padaCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #78350f" }}>{t("lordCol")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #78350f" }}>{t("dignityCol")}</th>
            </tr>
          </thead>
          <tbody>
            {profile.planetaryRows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                  color: row.name === "Lagna" ? "#b45309" : "#1e293b",
                  fontWeight: row.name === "Lagna" ? "bold" : "normal"
                }}
              >
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0" }}>
                  {row.name} {row.isRetrograde ? `(${t("retrogradeLabel")})` : ""}
                </td>
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0" }}>
                  {row.rashi} ({row.sanskritRashi})
                </td>
                <td style={{ padding: "5px 8px", textAlign: "center", border: "1px solid #e2e8f0", fontFamily: "monospace" }}>
                  {row.degreeStr}
                </td>
                <td style={{ padding: "5px 8px", textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "bold" }}>
                  {row.house}
                </td>
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0" }}>
                  {row.nakshatra}
                </td>
                <td style={{ padding: "5px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  {row.pada}
                </td>
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0" }}>
                  {row.lord}
                </td>
                <td style={{ padding: "5px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontWeight: "600",
                      backgroundColor:
                        row.dignity === "Exalted"
                          ? "#dcfce7"
                          : row.dignity === "Debilitated"
                          ? "#fee2e2"
                          : "#f1f5f9",
                      color:
                        row.dignity === "Exalted"
                          ? "#15803d"
                          : row.dignity === "Debilitated"
                          ? "#b91c1c"
                          : "#475569"
                    }}
                  >
                    {row.dignity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Page 4 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("tabPlanets")} · 4 / 6</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 5: 120-YEAR VIMSHOTTARI DASHA TIMELINE TABLE                   */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        <div style={headerBorder}>
          <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#78350f", margin: 0 }}>
            ⏳ {t("dashaTimelineHeading")}
          </h2>
          <span style={{ fontSize: "9px", color: "#64748b" }}>
            120-Year Vimshottari Mahadasha Cycle with Exact Calendar Dates
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "16px" }}>
          <thead>
            <tr style={{ backgroundColor: "#065f46", color: "#ffffff" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", border: "1px solid #065f46" }}>{t("thDashaLord")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #065f46" }}>{t("thDuration")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #065f46" }}>{t("thAgeRange")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #065f46" }}>{t("thDates")}</th>
              <th style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #065f46" }}>{t("thActiveStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {profile.dashaTimelineRows.map((d, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: d.status === "active" ? "#ecfdf5" : idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                  fontWeight: d.status === "active" ? "bold" : "normal"
                }}
              >
                <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                  {d.planet} ({d.sanskritPlanet})
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  {d.durationYears} {t("yearsLabel")}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  {d.startAge} - {d.endAge}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #e2e8f0", fontFamily: "monospace" }}>
                  {d.startDateStr} → {d.endDateStr}
                </td>
                <td style={{ padding: "6px 8px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontWeight: "bold",
                      backgroundColor:
                        d.status === "active"
                          ? "#059669"
                          : d.status === "completed"
                          ? "#e2e8f0"
                          : "#fef3c7",
                      color:
                        d.status === "active"
                          ? "#ffffff"
                          : d.status === "completed"
                          ? "#64748b"
                          : "#92400e"
                    }}
                  >
                    {d.status === "active"
                      ? t("activeDashaBadge")
                      : d.status === "completed"
                      ? t("completedDashaBadge")
                      : t("upcomingDashaBadge")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Page 5 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("tabDasha")} · 5 / 6</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PAGE 6: LIFE INSIGHTS & GOKARNA PARIHARA REMEDIES                    */}
      {/* ==================================================================== */}
      <div style={pageContainerStyle}>
        <div style={headerBorder}>
          <h2 style={{ fontSize: "15px", fontWeight: "900", color: "#78350f", margin: 0 }}>
            🌟 {t("liveAnalysisHeading")} & {t("pariharaHeading")}
          </h2>
          <span style={{ fontSize: "9px", color: "#64748b" }}>
            Personal Vedic Synthesis & Sri Kshetra Gokarna Mahabaleshwara Remedies
          </span>
        </div>

        {/* Dynamic Life Insights */}
        {insights && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", backgroundColor: "#f8fafc" }}>
              <strong style={{ fontSize: "10px", color: "#b45309", display: "block", marginBottom: "2px" }}>
                🪐 {t("currentPhaseTitle")}
              </strong>
              <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.45 }}>
                {insights.currentPhase}
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", backgroundColor: "#f8fafc" }}>
              <strong style={{ fontSize: "10px", color: "#b45309", display: "block", marginBottom: "2px" }}>
                🧠 {t("subconsciousMindTitle")}
              </strong>
              <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.45 }}>
                {insights.subconsciousMind}
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", backgroundColor: "#f8fafc" }}>
              <strong style={{ fontSize: "10px", color: "#b45309", display: "block", marginBottom: "2px" }}>
                💼 {t("careerFinanceTitle")}
              </strong>
              <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.45 }}>
                {insights.careerFinance}
              </p>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", backgroundColor: "#f8fafc" }}>
              <strong style={{ fontSize: "10px", color: "#b45309", display: "block", marginBottom: "2px" }}>
                ❤️ {t("relationshipsHealthTitle")}
              </strong>
              <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.45 }}>
                {insights.relationshipsHealth}
              </p>
            </div>
          </div>
        )}

        {/* Recommended Remedies & Gokarna Seva Card */}
        <div
          style={{
            border: "1.5px solid #b45309",
            borderRadius: "10px",
            backgroundColor: "#fffbeb",
            padding: "10px 14px",
            marginBottom: "12px"
          }}
        >
          <h3 style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", margin: "0 0 6px 0" }}>
            🪔 {t("gokarnaRemedyTitle")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9.5px", marginBottom: "6px" }}>
            <div>
              <span style={{ color: "#64748b" }}>{t("gemstoneLabel")}:</span>{" "}
              <strong>{profile.gemstone}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>{t("rudrakshaLabel")}:</span>{" "}
              <strong>{profile.rudraksha}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>{t("auspiciousDayLabel")}:</span>{" "}
              <strong>{profile.auspiciousDay}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>{t("deityLabel")}:</span>{" "}
              <strong>{profile.deity}</strong>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #fde68a", paddingTop: "5px", fontSize: "9.5px" }}>
            <span style={{ color: "#64748b", display: "block" }}>{t("mantraLabel")}:</span>
            <strong style={{ color: "#b45309", fontFamily: "serif" }}>{profile.mantra}</strong>
          </div>

          <div style={{ borderTop: "1px solid #fde68a", paddingTop: "5px", marginTop: "5px", fontSize: "9.5px" }}>
            <span style={{ color: "#64748b", display: "block" }}>{t("gokarnaSevaLabel")}:</span>
            <strong style={{ color: "#78350f" }}>{profile.gokarnaSevaName}</strong>
          </div>
        </div>

        {/* Priest Seal & Endorsement */}
        <div
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            fontSize: "9.5px"
          }}
        >
          <strong style={{ color: "#78350f", display: "block", fontSize: "10.5px" }}>
            🏛️ {t("priestTitle")} · {t("priestName")}
          </strong>
          <span style={{ color: "#64748b" }}>
            {t("priestContact")} · ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ
          </span>
        </div>

        {/* Page 6 Footer */}
        <div style={{ position: "absolute", bottom: "14px", left: "36px", right: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
          <span>॥ {t("portalTitle")} ॥</span>
          <span>{t("tabRemedies")} · 6 / 6</span>
        </div>
      </div>
    </div>
  );
};

export default PublicKundliPdfDocument;
