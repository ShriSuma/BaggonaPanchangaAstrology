/**
 * Baggona Panchanga Astrology - Public Kundali 30-Day Calendar & Priest QR Card
 * High-Resolution Printable A4 Card with Scannable Google Calendar QR & Purohita details
 * Compliant with baggona-qr-code-guard (ASCII-only compact URL, Level L error correction)
 */

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PublicKundliProfile } from "../../features/publicKundli/publicKundliEngine";
import {
  generateQrPayloadByTarget,
  calculateDeterministicRhythmDay,
  getSafeProductionOrigin,
  generateCompactGoogleCalendarUrlForQR
} from "../../features/seva/icsCalendarGenerator";
import { getPublicKundliText, type PublicKundliLang } from "../../features/publicKundli/publicKundliLocale";

export interface KundliQrProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  lagnaSign: string;
  lagnaSanskrit?: string;
  moonSign: string;
  moonSanskrit?: string;
  moonNakshatra: string;
  moonPada?: string | number;
  currentMahadasha?: string;
  currentBhukti?: string;
  moonNakshatraIndex?: number;
  moonRashiIndex?: number;
}

export interface Kundli30DayQrCardProps {
  profile: KundliQrProfile;
  lang?: string;
  panditName?: string;
  priestPhone?: string;
  qrDataUrl?: string;
  placeLabel?: string;
  pincode?: string;
}

const I18N: Record<string, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    cardTitle: "ಮುಂದಿನ ೩೦-ದಿನಗಳ ದೈನಂದಿನ ಪಂಚಾಂಗ & ಶುಭ ಮುಹೂರ್ತ ಕ್ಯಾಲೆಂಡರ್",
    cardSubtitle: "ದೈನಂದಿನ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಚಂದ್ರಬಲ ಹಾಗೂ ಶುಭ ಮುಹೂರ್ತಗಳನ್ನು ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲು ಈ ಕೆಳಗಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    devoteeTitle: "ಜಾತಕರ ಜನ್ಮ ಕುಂಡಲಿ ಸಾರಾಂಶ",
    nameLabel: "ಹೆಸರು:",
    birthDetailsLabel: "ಜನನ ವಿವರ:",
    lagnaLabel: "ಲಗ್ನ:",
    rashiLabel: "ರಾಶಿ:",
    nakshatraLabel: "ನಕ್ಷತ್ರ:",
    dashaLabel: "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ-ಭುಕ್ತಿ:",
    scanInstructionsTitle: "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು:",
    step1: "೧. ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ Google Lens ತೆರೆಯಿರಿ.",
    step2: "೨. ಈ ಕೆಳಗಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಅನ್ನು ನೇರವಾಗಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step3: "೩. ತೆರೆಯುವ ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Add to Calendar' ಆಯ್ಕೆಮಾಡಿ.",
    step4: "೪. ಮುಂದಿನ ೩೦ ದಿನಗಳ ನಿತ್ಯ ಪಂಚಾಂಗ ಮತ್ತು ಶುಭ ಮುಹೂರ್ತ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯ!",
    priestHeader: "ಮುಖ್ಯ ಜ್ಯೋತಿಷಿಗಳು & ಪುರೋಹಿತರ ಅಧಿಕೃತ ಸಂಪರ್ಕ",
    priestName: "ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestRole: "ಪ್ರಧಾನ ಅರ್ಚಕರು ಹಾಗೂ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಸಲಹೆಗಾರರು",
    templeAddress: "ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ, ಕರ್ನಾಟಕ - ೫೮೧೩೨೬",
    priestPhoneLabel: "ನೇರ ಸಂಪರ್ಕ & ವಾಟ್ಸಾಪ್ (WhatsApp):",
    priestBlessing: "ಯಾವುದೇ ದೋಷ ಪರಿಹಾರ, ಪೂಜಾ ಸಂಕಲ್ಪ, ಕುಂಡಲಿ ಸಮಾಲೋಚನೆ ಅಥವಾ ಶಾಂತಿ ಹೋಮಗಳಿಗಾಗಿ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ."
  },
  en: {
    templeBanner: "॥ Shri Gokarna Mahabaleshwara Sannidhana · Baggona Panchanga Astrology ॥",
    cardTitle: "Next 30-Day Daily Panchanga & Auspicious Calendar QR",
    cardSubtitle: "Scan the QR code below to automatically sync the next 30 days of daily tithi, nakshatra, and auspicious muhurthas directly into your Google Calendar.",
    devoteeTitle: "Devotee Janma Kundali Summary",
    nameLabel: "Devotee Name:",
    birthDetailsLabel: "Birth Details:",
    lagnaLabel: "Lagna:",
    rashiLabel: "Moon Sign (Rashi):",
    nakshatraLabel: "Janma Nakshatra:",
    dashaLabel: "Current Dasha-Bhukti:",
    scanInstructionsTitle: "Simple Steps to Sync Your Calendar:",
    step1: "1. Open your smartphone Camera or Google Lens.",
    step2: "2. Scan the official QR code shown below.",
    step3: "3. Tap the link and select 'Add to Calendar' / 'Save'.",
    step4: "4. Receive daily morning auspicious muhurthas and daily tithi on your phone!",
    priestHeader: "Official Priest (Purohita) & Astrologer Contact",
    priestName: "Vedamurthy Shreeram Pandit",
    priestRole: "Chief Priest & Vedic Astrology Consultant",
    templeAddress: "Shri Baggona Panchanga Jyotishya Karyalaya, Gokarna Kshetra, Karnataka - 581326",
    priestPhoneLabel: "Direct Call & WhatsApp:",
    priestBlessing: "For personal astrology consultations, dosha parihara sankalpa, temple poojas, or shanti homas, please contact directly."
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    cardTitle: "अगले ३० दिनों का दैनिक पंचांग एवं शुभ मुहूर्त कैलेंडर",
    cardSubtitle: "दैनिक तिथि, नक्षत्र एवं शुभ मुहूर्त को अपने गूगल कैलेंडर में सिंक करने के लिए नीचे दिए गए क्यूआर कोड को स्कैन करें।",
    devoteeTitle: "जातक जन्म कुंडली सारांश",
    nameLabel: "नाम:",
    birthDetailsLabel: "जन्म विवरण:",
    lagnaLabel: "लग्न:",
    rashiLabel: "राशि:",
    nakshatraLabel: "नक्षत्र:",
    dashaLabel: "वर्तमान महादशा-भुक्ति:",
    scanInstructionsTitle: "कैलेंडर सिंक करने के सरल चरण:",
    step1: "१. अपने फोन का कैमरा अथवा Google Lens खोलें।",
    step2: "२. नीचे दिए गए आधिकारिक क्यूआर कोड को स्कैन करें।",
    step3: "३. लिंक पर क्लिक करके 'Add to Calendar' चुनें।",
    step4: "४. अगले ३० दिनों का दैनिक पंचांग सीधे आपके फोन पर उपलब्ध!",
    priestHeader: "मुख्य ज्योतिषी एवं पुरोहित आधिकारिक संपर्क",
    priestName: "वेदामूर्ति श्रीराम पंडित",
    priestRole: "प्रधान पुरोहित एवं वैदिक ज्योतिष परामर्शदाता",
    templeAddress: "श्री बग्गोण पंचांग ज्योतिष कार्यालय, गोकर्ण क्षेत्र, कर्नाटक - ५८१३२६",
    priestPhoneLabel: "सीधा संपर्क एवं व्हाट्सएप:",
    priestBlessing: "किसी भी दोष परिहार, पूजा संकल्प, कुंडली परामर्श अथवा शांति होम हेतु सीधे संपर्क करें।"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    cardTitle: "రాబోయే 30 రోజుల దైనందిన పంచాంగం & శుభ ముహూర్తాల క్యాలెండర్",
    cardSubtitle: "దైనందిన తిథి, నక్షత్రం మరియు శుభ ముహూర్తాలను గూగుల్ క్యాలెండర్‌లో సింక్ చేయడానికి ఈ క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
    devoteeTitle: "జాతక జన్మ కుండలి సారాంశం",
    nameLabel: "పేరు:",
    birthDetailsLabel: "జన్మ వివరాలు:",
    lagnaLabel: "లగ్నం:",
    rashiLabel: "రాశి:",
    nakshatraLabel: "నక్షత్రం:",
    dashaLabel: "ప్రస్తుత మహాదశ-భుక్తి:",
    scanInstructionsTitle: "క్యాలెండర్ సింక్ చేసే సులభ దశలు:",
    step1: "1. మీ స్మార్ట్‌ఫోన్ కెమెరా లేదా Google Lens తెరవండి.",
    step2: "2. కింద ఉన్న క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
    step3: "3. లింక్‌ను నొక్కి 'Add to Calendar' ఎంచుకోండి.",
    step4: "4. రాబోయే 30 రోజుల పంచాంగ సమాచారం మీ ఫోన్‌లో అందుబాటులో ఉంటుంది!",
    priestHeader: "ప్రధాన జ్యోతిష్యులు & పురోహితుల సంప్రదింపు వివరాలు",
    priestName: "వేదమూర్తి శ్రీరామ్ పండిత్",
    priestRole: "ప్రధాన అర్చకులు & వైదిక జ్యోతిష్య సలహాదారులు",
    templeAddress: "శ్రీ బగ్గోణ పంచాంగ జ్యోతిష్య కార్యాలయం, గోకర్ణ క్షేత్రం, కర్ణాటక - 581326",
    priestPhoneLabel: "ప్రత్యక్ష సంప్రదింపు & వాట్సాప్:",
    priestBlessing: "దోష పరిహారాలు, పూజా సంకల్పం లేదా జాతక విశ్లేషణ కోసం నేరుగా సంప్రదించండి."
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    cardTitle: "அடுத்த 30 நாட்களுக்கான தினசரி பஞ்சாங்கம் & சுப முகூர்த்த காலண்டர்",
    cardSubtitle: "தினசரி திதி, நட்சத்திரம் மற்றும் சுப முகூர்த்தங்களை கூகுள் காலண்டரில் இணைக்க கீழேயுள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    devoteeTitle: "ஜாதகர் ஜன்ம குண்டலி சுருக்கம்",
    nameLabel: "பெயர்:",
    birthDetailsLabel: "பிறப்பு விவரங்கள்:",
    lagnaLabel: "லக்னம்:",
    rashiLabel: "ராசி:",
    nakshatraLabel: "நட்சத்திரம்:",
    dashaLabel: "தற்போதைய மகாதிசை-புக்தி:",
    scanInstructionsTitle: "காலண்டர் இணைக்கும் எளிய முறைகள்:",
    step1: "1. உங்கள் தொலைபேசி கேமரா அல்லது Google Lens திறக்கவும்.",
    step2: "2. கீழேயுள்ள அதிகாரப்பூர்வ QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    step3: "3. 'Add to Calendar' என்பதைத் தேர்ந்தெடுத்து சேமிக்கவும்.",
    step4: "4. அடுத்த 30 நாட்களின் சுப தகவல்கள் உங்கள் கைபேசியில் உடனுக்குடன்!",
    priestHeader: "முதன்மை ஜோதிடர் மற்றும் புரோகிதர் தொடர்பு விவரங்கள்",
    priestName: "வேதமூர்த்தி ஸ்ரீராம் பண்டிதர்",
    priestRole: "தலைமை அர்ச்சகர் மற்றும் வேத ஜோதிட ஆலோசகர்",
    templeAddress: "ஸ்ரீ பக்ககோண பஞ்சாங்க ஜோதிட நிலையம், கோகர்ணம், கர்நாடகா - 581326",
    priestPhoneLabel: "நேரடி அழைப்பு & வாட்ஸ்அப்:",
    priestBlessing: "தோஷ பரிகாரங்கள், பூஜை சங்கல்பம் அல்லது ஜாதக ஆலோசனைக்கு நேரடியாகத் தொடர்பு கொள்ளவும்."
  }
};

export const Kundli30DayQrCard: React.FC<Kundli30DayQrCardProps> = ({
  profile,
  lang = "kn",
  panditName = "Shreeram Pandit",
  priestPhone = "9972339362",
  qrDataUrl: externalQr,
  placeLabel,
  pincode = "581326"
}) => {
  const currentLang = (lang && I18N[lang]) ? lang : "kn";
  const t = I18N[currentLang];
  const [generatedQr, setGeneratedQr] = useState<string>(externalQr || "");

  useEffect(() => {
    if (externalQr) {
      setGeneratedQr(externalQr);
      return;
    }

    try {
      const nakIdx = typeof profile.moonNakshatraIndex === "number" ? profile.moonNakshatraIndex : 0;
      const rashiIdx = typeof profile.moonRashiIndex === "number" ? profile.moonRashiIndex : 0;

      const rhythmDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx);
      });

      const qrPayload = generateQrPayloadByTarget("google", {
        days: rhythmDays,
        lang: currentLang,
        panditName: panditName || "Shreeram Pandit",
        priestPhone: priestPhone || "9972339362",
        overrideCalendarPhone: true,
        notificationTime: "07:00",
        personName: profile.name,
        pincode: pincode || "581326",
        lat: 14.54,
        lng: 74.31,
        locationName: placeLabel || "Gokarna",
        dob: profile.birthDate,
        tob: profile.birthTime,
        birthNakshatraIndex: nakIdx,
        birthRashiIndex: rashiIdx
      });

      QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 320,
        color: {
          dark: "#78350F", // Royal deep gold/amber
          light: "#FFFFFF"
        }
      })
        .then((url) => setGeneratedQr(url))
        .catch((err) => {
          console.warn("[Kundli30DayQrCard] QR generation fallback:", err);
          const fallback = `${getSafeProductionOrigin()}/daily?action=ics&lang=${currentLang}&priestPhone=${encodeURIComponent(priestPhone || "9972339362")}`;
          QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 320 }).then(setGeneratedQr);
        });
    } catch (e) {
      console.error("[Kundli30DayQrCard] QR build error:", e);
      const fallback = `${getSafeProductionOrigin()}/daily?action=ics&lang=${currentLang}&priestPhone=${encodeURIComponent(priestPhone || "9972339362")}`;
      QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 320 }).then(setGeneratedQr).catch(() => {});
    }
  }, [externalQr, currentLang, profile, panditName, priestPhone, pincode, placeLabel]);

  return (
    <div
      id="kundli-30day-qr-card"
      className="pdf-page"
      style={{
        width: "900px",
        minHeight: "1273px",
        padding: "36px 42px",
        boxSizing: "border-box",
        backgroundColor: "#fffdf8",
        color: "#0f172a",
        fontFamily: "'Tiro Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Inter', serif, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Outer Royal Gold Dual Frame */}
      <div
        style={{
          border: "3px double #b45309",
          borderRadius: "16px",
          padding: "26px 32px",
          minHeight: "1190px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "inset 0 0 40px rgba(180, 83, 9, 0.03)"
        }}
      >
        {/* Top Header & Temple Emblem */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #b45309", paddingBottom: "14px" }}>
          <div style={{ fontSize: "28px", color: "#b45309", letterSpacing: "2px", fontWeight: "bold" }}>
            🕉️ {t.templeBanner}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#78350f", marginTop: "8px" }}>
            {t.cardTitle}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", maxWidth: "620px", margin: "6px auto 0" }}>
            {t.cardSubtitle}
          </div>
        </div>

        {/* Section 1: Devotee Janma Kundali Summary Card */}
        <div
          style={{
            marginTop: "16px",
            backgroundColor: "#fffbeb",
            border: "1.5px solid #fde68a",
            borderRadius: "12px",
            padding: "16px 20px"
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>👤</span>
            <span>{t.devoteeTitle}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.nameLabel} </span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>{profile.name}</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.birthDetailsLabel} </span>
              <span style={{ color: "#0f172a" }}>{profile.birthDate} | {profile.birthTime} ({placeLabel || pincode || "Gokarna"})</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.lagnaLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.lagnaSign} ({profile.lagnaSanskrit})</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.rashiLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.moonSign} ({profile.moonSanskrit})</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.nakshatraLabel} </span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{profile.moonNakshatra} ({profile.moonPada})</span>
            </div>
            <div>
              <span style={{ color: "#78350f", fontWeight: 700 }}>{t.dashaLabel} </span>
              <span style={{ fontWeight: 800, color: "#b45309" }}>{profile.currentMahadasha} - {profile.currentBhukti}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Large Scannable QR Code and Scan Steps */}
        <div
          style={{
            margin: "20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "36px",
            backgroundColor: "#fdf8ee",
            border: "2px dashed #b45309",
            borderRadius: "16px",
            padding: "24px 30px"
          }}
        >
          {/* QR Image Box */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "10px",
                borderRadius: "12px",
                border: "2px solid #b45309",
                display: "inline-block",
                boxShadow: "0 4px 14px rgba(180, 83, 9, 0.15)"
              }}
            >
              {generatedQr ? (
                <img
                  src={generatedQr}
                  alt="30-Day Baggona Panchanga Google Calendar QR"
                  style={{ width: "220px", height: "220px", display: "block" }}
                />
              ) : (
                <div style={{ width: "220px", height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309" }}>
                  Generating QR...
                </div>
              )}
            </div>
            <div style={{ marginTop: "8px", fontSize: "11px", fontWeight: 700, color: "#78350f", letterSpacing: "0.5px" }}>
              ✦ 100% SCANNABLE GOOGLE CALENDAR QR ✦
            </div>
          </div>

          {/* Simple Steps Box */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", marginBottom: "12px" }}>
              📱 {t.scanInstructionsTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "#1e293b", lineHeight: 1.6 }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span>📷</span>
                <span>{t.step1}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span>🔍</span>
                <span>{t.step2}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span>📅</span>
                <span>{t.step3}</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span>🔔</span>
                <span style={{ fontWeight: 700, color: "#047857" }}>{t.step4}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Official Purohita (Priest) Details Card */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1.5px solid #b45309",
            borderRadius: "14px",
            padding: "18px 24px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
            {t.priestHeader}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#78350f" }}>
            {panditName || t.priestName}
          </div>
          <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", fontWeight: 600 }}>
            {t.priestRole} · {t.templeAddress}
          </div>

          {/* Contact Highlight Pill */}
          <div
            style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "#ffffff",
              border: "2px solid #b45309",
              borderRadius: "30px",
              padding: "8px 24px",
              boxShadow: "0 2px 10px rgba(180, 83, 9, 0.12)"
            }}
          >
            <span style={{ fontSize: "16px" }}>📞</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#78350f" }}>{t.priestPhoneLabel}</span>
            <span style={{ fontSize: "16px", fontWeight: 900, color: "#047857", letterSpacing: "1px" }}>
              +91 {priestPhone}
            </span>
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#334155", fontStyle: "italic", lineHeight: 1.5 }}>
            "{t.priestBlessing}"
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "14px",
            paddingTop: "10px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            color: "#64748b"
          }}
        >
          <div>॥ ಶ್ರೀ ಸದಾಶಿವೋ ರಕ್ಷತು · ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ ॥</div>
          <div>Baggona Panchanga Astrology · Printed & Blessed on {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Kundli30DayQrCard;
