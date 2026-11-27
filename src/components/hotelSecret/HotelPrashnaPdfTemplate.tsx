import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { savePdfBlob } from "../../utils/pdfGenerator";
import {
  type SevenLang,
  pick7,
  getIndicFontFamily7L,
  toNativeDigits7L
} from "../../services/sampoornaMaster25Locale7L";
import type {
  ChandraSankhyaProfile,
  DeepPrashnaHoraryResult
} from "../../features/hotelSecret/hotelUnknownTimeEngine";
import { cleanEnglishFromRegionalText } from "../../features/premiumPdf/premiumPdfLocale";

export interface HotelPrashnaPdfPayload {
  devoteeName: string;
  lang: SevenLang;
  tableNumber: string;
  hotelName: string;
  generatedDateStr: string;
  placeName: string;
  prashna: DeepPrashnaHoraryResult;
  sankhya?: ChandraSankhyaProfile;
  aiParagraphs: string[];
}

export const HotelPrashnaPdfTemplate = React.forwardRef<HTMLDivElement, { data: HotelPrashnaPdfPayload }>(
  ({ data }, ref) => {
    const lang = data.lang || "kn";
    const fontFamily = getIndicFontFamily7L(lang);
    const n = (v: number | string) => toNativeDigits7L(v, lang);
    const cleanTxt = (t?: string) => {
      if (!t) return "";
      const stripped = t.replace(/[*#`]/g, "").trim();
      return lang === "en" ? stripped : cleanEnglishFromRegionalText(stripped, lang);
    };

    const cardStyle: React.CSSProperties = {
      backgroundColor: "#FFFDF7",
      border: "2px solid #D4AF37",
      borderRadius: "14px",
      padding: "20px 24px",
      marginBottom: "18px",
      boxSizing: "border-box",
      fontFamily
    };

    const cellStyle: React.CSSProperties = {
      backgroundColor: "#FFFBEB",
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #d97706"
    };

    return (
      <div
        ref={ref}
        id="hotel-prashna-pdf-render"
        style={{
          width: "860px",
          backgroundColor: "#FFF7ED",
          color: "#451a03",
          fontFamily,
          padding: "24px 28px",
          boxSizing: "border-box",
          letterSpacing: "normal"
        }}
      >
        {/* Header Banner */}
        <div className="prashna-pdf-section" style={{ ...cardStyle, textAlign: "center", backgroundColor: "#FEF3C7" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400e", marginBottom: "6px" }}>
            {lang === "ta" || lang === "ml" ? "✦" : "ॐ"}{" "}
            {pick7({
              kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ",
              en: "Baggona Panchanga • Sri Kshetra Gokarna Mahabaleshwara Sannidhana",
              hi: "बग्गोण पंचांग • श्री क्षेत्र गोकर्ण महाबलेश्वर सान्निध्य",
              mr: "बग्गोण पंचांग • श्री क्षेत्र गोकर्ण महाबळेश्वर सानिध्य",
              te: "బగ్గోణ పంచాంగం • శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానం",
              ta: "பக்கோண பஞ்சாங்கம் • ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வரர் சன்னதி",
              ml: "ബഗ്ഗോണ പഞ്ചാംഗം • ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധി"
            }, lang)}
          </div>
          <h1 style={{ margin: "4px 0 8px 0", fontSize: "26px", fontWeight: 900, color: "#451a03" }}>
            {pick7({
              kn: "ಸಂಪೂರ್ಣ ಕೇರಳ & ತಾಜಿಕ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ ಮಹಾ ವರದಿ",
              en: "Complete Kerala & Tajika Prashna Shastra Horary Dossier",
              hi: "संपूर्ण केरल एवं ताजिक प्रश्न शास्त्र महा-रिपोर्ट",
              mr: "संपूर्ण केरळ व ताजिक प्रश्न शास्त्र महा-अहवाल",
              te: "సంపూర్ణ కేరళ & తాజిక ప్రశ్న శాస్త్ర మహా నివేదిక",
              ta: "முழு கேரள & தாஜிக பிரசன்ன சாஸ்திர சிறப்பு அறிக்கை",
              ml: "സമ്പൂർണ്ണ കേരള & താജിക പ്രശ്നശാസ്ത്ര മഹാ റിപ്പോർട്ട്"
            }, lang)}
          </h1>
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#78350f" }}>
            {data.devoteeName} • {data.placeName} • {data.hotelName} (#{n(data.tableNumber)}) • {n(data.generatedDateStr)}
          </div>
        </div>

        {/* Section 1: Live Astronomical Udaya, 1–108 KP Seed & Tajika Verdict */}
        <div className="prashna-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "19px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೧. ತಾತ್ಕಾಲಿಕ ಉದಯ ಲಗ್ನ, ೧–೧೦೮ ಸಂಖ್ಯಾ ಸಿದ್ಧಿ & ತಾಜಿಕ ಯೋಗ",
              en: "1. Live Udaya Lagna, Horary Seed (1–108) & Tajika Ithasala Matrix",
              hi: "१. तात्कालिक उदय लग्न, १–१०८ अंक सिद्धि एवं ताजिक योग",
              mr: "१. तात्काळ उदय लग्न, १–१०८ अंक सिद्धी व ताजिक योग",
              te: "1. తక్షణ ఉదయ లగ్నం, 1–108 సంఖ్య & తాజిక యోగం",
              ta: "1. நேரடி உதய லக்னம், 1–108 எண் & தாஜிக யோகம்",
              ml: "1. തൽക്ഷണ ഉദയലഗ്നം, 1–108 സംഖ്യ & താജിക യോഗം"
            }, lang)}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div style={{ backgroundColor: "#ECFDF5", padding: "10px 14px", borderRadius: "10px", border: "1px solid #10b981" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>
                {pick7({ kn: "ತಾಜಿಕ ಕಾರ್ಯಸಿದ್ಧಿ ಬಲ", en: "Tajika Fulfillment Strength", hi: "ताजिक कार्यसिद्धि बल", mr: "ताजिक कार्यसिद्धी बळ", te: "తాజిక కార్యసిద్ధి బలం", ta: "தாஜிக காரிய சித்தி பலம்", ml: "താജിക കാര്യസിദ്ധി ബലം" }, lang)}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#064e3b", marginTop: "3px" }}>
                {n(data.prashna.ithasalaHarmonyScore)}% — {data.prashna.verdictTitle}
              </div>
            </div>

            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ತಾಜಿಕ ಯೋಗ ವಿಧ", en: "Classical Tajika Yoga", hi: "शास्त्रीय ताजिक योग", mr: "शास्त्रीय ताजिक योग", te: "శాస్త్రీయ తాజిక యోగం", ta: "தாஜிக யோக வகை", ml: "ശാസ്ത്രീയ താജിക യോഗം" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                {data.prashna.tajikaYogaLabel}
              </div>
            </div>

            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಉದಯ ಲಗ್ನ & ಕಾರ್ಯೇಶ", en: "Udaya Lagna & Karya Lord", hi: "उदय लग्न एवं कार्येश", mr: "उदय लग्न व कार्येश", te: "ఉదయ లగ్నం & కార్యేశుడు", ta: "உதய லக்னம் & கார்ய அதிபதி", ml: "ഉദയലഗ്നവും കാര്യാധിപനും" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                {data.prashna.udayaLagnaName} ({data.prashna.udayaLagnaLordName}) • {data.prashna.karyaLordName}
              </div>
            </div>

            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "೧–೧೦೮ ಸಂಖ್ಯಾ ಆರೂಢ & ಫಲಿತಾಂಶ ಸಮಯ", en: "Horary Seed # & Timing Window", hi: "पावन अंक एवं समय सीमा", mr: "पवित्र अंक व कालावधी", te: "సంఖ్య & ఫలిత కాలం", ta: "புனித எண் & கால அளவு", ml: "സംഖ്യയും സമയപരിധியும்" }, lang)}
              </div>
              <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                #{n(data.prashna.horaryNumber)} ({data.prashna.seedLagnaName} / {data.prashna.seedNakshatraName})
              </div>
            </div>
          </div>

          <p style={{ margin: "0 0 8px 0", fontSize: "15px", lineHeight: 1.65 }}>
            {cleanTxt(data.prashna.verdictSummary)}
          </p>
          <div style={{ padding: "8px 12px", backgroundColor: "#FEF3C7", borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
            ⏳ {data.prashna.timingForecast}
          </div>
        </div>

        {/* Section 2: Kerala Prashna Sphuta Matrix (Trisphuta, Chatusphuta, Chatra Rashi, Pancha Pakshi) */}
        <div className="prashna-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "19px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೨. ಕೇರಳ ಪ್ರಶ್ನ ಮಾರ್ಗ: ತ್ರಿ ಸ್ಫುಟ, ಚತುಃಸ್ಫುಟ, ಛತ್ರ ರಾಶಿ & ಪಂಚಪಕ್ಷಿ ಶಾಸ್ತ್ರ",
              en: "2. Kerala Prashna Marga: Trisphuta, Chatusphuta, Chatra Rashi & Pancha Pakshi",
              hi: "२. केरल प्रश्न मार्ग: त्रिस्फुट, चतुःस्फुट, छत्र राशि एवं पंचपक्षी शास्त्र",
              mr: "२. केरळ प्रश्न मार्ग: त्रिस्फुट, चतुःस्फुट, छत्र राशी व पंचपक्षी शास्त्र",
              te: "2. కేరళ ప్రశ్న మార్గం: త్రిస్ఫుట, చతుఃస్ఫుట, ఛత్ర రాశి & పంచపక్షి",
              ta: "2. கேரள பிரசன்னம்: திரிஸ்புடம், சதுர்ஸ்புடம், சத்ர ராசி & பஞ்சபட்சி",
              ml: "2. കേരള പ്രശ്നമാർഗ്ഗം: ത്രിസ്ഫുടം, ചതുഃസ്ഫുടം, ഛത്രരാശി & പഞ്ചപക്ഷി"
            }, lang)}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ತ್ರಿಸ್ಫುಟ (ಲಗ್ನ + ಚಂದ್ರ + ಗುಳಿಕ)", en: "Trisphuta (Lagna + Moon + Gulika)", hi: "त्रिस्फुट (लग्न + चंद्र + गुलिक)", mr: "त्रिस्फुट (लग्न + चंद्र + गुलिक)", te: "త్రిస్ఫుట (లగ్నం + చంద్ర + గుళిక)", ta: "திரிஸ்புடம் (லக்னம் + சந்திரன் + குளிகன்)", ml: "ത്രിസ്ഫുടം (ലഗ്നം + ചന്ദ്രൻ + ഗുളികൻ)" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "3px" }}>
                {data.prashna.trisphutaRashiName} • {data.prashna.trisphutaNakshatraName}
              </div>
            </div>

            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಚತುಃಸ್ಫುಟ & ಛತ್ರ ರಾಶಿ ರಕ್ಷಣೆ", en: "Chatusphuta & Chatra Shield Rashi", hi: "चतुःस्फुट एवं छत्र सुरक्षा राशि", mr: "चतुःस्फुट व छत्र सुरक्षा राशी", te: "చతుఃస్ఫుట & ఛత్ర రాశి", ta: "சதுர்ஸ்புடம் & சத்ர ராசி", ml: "ചതുഃസ്ഫുടവും ഛത്രരാശിയും" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "3px" }}>
                {data.prashna.chatusphutaRashiName} • {data.prashna.chatraRashiName}
              </div>
            </div>

            <div style={cellStyle}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಪಂಚಪಕ್ಷಿ ಸಿದ್ಧ ಬಲ (ಈ ಕ್ಷಣ)", en: "Pancha Pakshi Biorhythm", hi: "पंचपक्षी जैविक बल", mr: "पंचपक्षी बल स्थिती", te: "పంచపక్షి బలం", ta: "பஞ்சபட்சி செயல் நிலை", ml: "പഞ്ചപക്ഷി നില" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#065f46", marginTop: "3px" }}>
                {data.prashna.panchaPakshiBird} — {data.prashna.panchaPakshiState}
              </div>
            </div>

            {data.sankhya && (
              <div style={cellStyle}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                  {pick7({ kn: "ಚಾಲ್ಡಿಯನ್ ನಾಮ & ಸಂಖ್ಯಾ ಶಕ್ತಿ", en: "Chaldean Name & Sankhya Force", hi: "चाल्डियन नाम अंक शक्ति", mr: "चाल्डियन नाव अंक शक्ती", te: "చాల్డియన్ నామ సంఖ్య", ta: "பெயர் எண் சக்தி", ml: "ചാൽഡിയൻ നാമസംഖ്യ" }, lang)}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "3px" }}>
                  #{n(data.sankhya.chaldeanCompound)} ({n(data.sankhya.chaldeanSingle)}) • {data.sankhya.luckyColor}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Four Life Domains Guidance (Family, Money, Health & Profession) */}
        <div className="prashna-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "19px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೩. ಚತುರ್ವಿಧ ಜೀವನ ಫಲಗಳು: ಕುಟುಂಬ, ಧನ, ಆರೋಗ್ಯ & ವೃತ್ತಿ-ವ್ಯಾಪಾರ",
              en: "3. Dedicated Life Domains: Family, Money, Health & Profession",
              hi: "३. जीवन के चार प्रमुख क्षेत्र: परिवार, धन, स्वास्थ्य एवं व्यापार-करियर",
              mr: "३. जीवनातील चार प्रमुख क्षेत्रे: कुटुंब, धन, आरोग्य व व्यवसाय-करिअर",
              te: "3. జీవిత 4 ప్రధాన రంగాలు: కుటుంబం, ధనం, ఆరోగ్యం & వృత్తి",
              ta: "3. வாழ்வின் 4 முக்கிய துறைகள்: குடும்பம், பணம், ஆரோக்கியம் & தொழில்",
              ml: "3. ജീവിതത്തിലെ 4 പ്രധാന മേഖലകൾ: കുടുംബം, ധനം, ആരോഗ്യം & തൊഴിൽ"
            }, lang)}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={cellStyle}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                👨‍👩‍👧‍👦 {pick7({ kn: "ಕುಟುಂಬ & ದಾಂಪತ್ಯ", en: "Family & Relationships", hi: "परिवार एवं दांपत्य", mr: "कुटुंब व नातेसंबंध", te: "కుటుంబం & దాంపత్యం", ta: "குடும்பம் & உறவு", ml: "കുടുംബവും ബന്ധങ്ങളും" }, lang)}
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.55 }}>{cleanTxt(data.prashna.domainGuidance?.family)}</div>
            </div>
            <div style={cellStyle}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                💰 {pick7({ kn: "ಧನ, ಸಂಪತ್ತು & ಲಾಭ", en: "Money & Wealth", hi: "धन एवं आर्थिक लाभ", mr: "धन व आर्थिक लाभ", te: "ధనం & ఆర్థిక లాభం", ta: "பணம் & செல்வ வளம்", ml: "ധനവും സമ്പാദ്യവും" }, lang)}
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.55 }}>{cleanTxt(data.prashna.domainGuidance?.money)}</div>
            </div>
            <div style={cellStyle}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                ❤️ {pick7({ kn: "ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ", en: "Health & Vitality", hi: "स्वास्थ्य एवं ऊर्जा", mr: "आरोग्य व शक्ती", te: "ఆరోగ్యం & శక్తి", ta: "ஆரோக்கியம் & ஆற்றல்", ml: "ആരോഗ്യവും ശക്തിയും" }, lang)}
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.55 }}>{cleanTxt(data.prashna.domainGuidance?.health)}</div>
            </div>
            <div style={cellStyle}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400e", marginBottom: "4px" }}>
                💼 {pick7({ kn: "ವೃತ್ತಿ, ಉದ್ಯೋಗ & ವ್ಯಾಪಾರ", en: "Profession & Career", hi: "करियर एवं व्यवसाय", mr: "करिअर व व्यवसाय", te: "వృత్తి & వ్యాపారం", ta: "தொழில் & வணிகம்", ml: "തൊഴിലും ബിസിനസ്സും" }, lang)}
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.55 }}>{cleanTxt(data.prashna.domainGuidance?.profession)}</div>
            </div>
          </div>
        </div>

        {/* Section 4: Deep Multi-Paragraph Prashna AI Synthesis & Sacred Remedy */}
        <div className="prashna-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "19px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೪. ಸಮಗ್ರ ಪ್ರಶ್ನ ವಿಶ್ಲೇಷಣೆ (೨–೩ ಸುದೀರ್ಘ ಭಾಗಗಳು) & ಗೋಕರ್ಣ ಶಾಂತಿ ಪರಿಹಾರ",
              en: "4. Deep Prashna Detailed Narration & Sacred Gokarna Remedy",
              hi: "४. विस्तृत प्रश्न फलादेश (संपूर्ण विवरण) एवं शास्त्रीय उपाय",
              mr: "४. सखोल प्रश्न विश्लेषण (संपूर्ण माहिती) व शास्त्रीय उपाय",
              te: "4. సంపూర్ణ ప్రశ్న విశ్లేషణ & గోకర్ణ పరిహారం",
              ta: "4. விரிவான பிரசன்ன பலன் & கோகர்ண பரிகாரம்",
              ml: "4. സമ്പൂർണ്ണ പ്രശ്ന വിശകലനവും ഗോകർണ്ണ പരിഹാരവും"
            }, lang)}
          </h2>

          {data.aiParagraphs.map((para, idx) => (
            <p key={idx} style={{ margin: "0 0 10px 0", fontSize: "14.5px", lineHeight: 1.65 }}>
              {cleanTxt(para)}
            </p>
          ))}

          <div style={{ marginTop: "10px", padding: "12px 14px", backgroundColor: "#FEF3C7", borderRadius: "10px", fontSize: "14.5px", fontWeight: 700, color: "#78350f", border: "1px solid #f59e0b" }}>
            🪔 {cleanTxt(data.prashna.remedialAction)}
          </div>
        </div>

        {/* Footer */}
        <div className="prashna-pdf-section" style={{ ...cardStyle, backgroundColor: "#FEF3C7", textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350f", marginBottom: "4px" }}>
            {pick7({
              kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್ • +91 94821 09844",
              en: "Veda Moorthy Chaitanya Pandit • +91 94821 09844",
              hi: "वेदमूर्ति चैतन्य पंडित • +91 94821 09844",
              mr: "वेदमूर्ती चैतन्य पंडित • +91 94821 09844",
              te: "వేదమూర్తి చైతన్య పండిత్ • +91 94821 09844",
              ta: "வேதமூர்த்தி சைதன்ய பண்டிதர் • +91 94821 09844",
              ml: "വേദമൂർത്തി ചൈതന്യ പണ്ഡിത് • +91 94821 09844"
            }, lang)}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>
            {pick7({
              kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ, ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ",
              en: "Sri Gokarna Mahabaleshwara Sannidhana, Gokarna, Karnataka",
              hi: "श्री गोकर्ण महाबलेश्वर सान्निध्य, गोकर्ण, कर्नाटक",
              mr: "श्री गोकर्ण महाबळेश्वर सानिध्य, गोकर्ण, कर्नाटक",
              te: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం, గోకర్ణ, కర్ణాటక",
              ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதி, கோகர்ண, கர்நாடகா",
              ml: "ശ്രീ ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധി, ഗോകർണ്ണ, കർണാടക"
            }, lang)}
          </div>
        </div>
      </div>
    );
  }
);

export async function captureHotelPrashnaPdf(
  containerEl: HTMLElement,
  fileName: string,
  triggerDownload: boolean = true
): Promise<jsPDF> {
  const sections = Array.from(containerEl.querySelectorAll(".prashna-pdf-section")) as HTMLElement[];
  const targets = sections.length > 0 ? sections : [containerEl];

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidthMm = 210;
  const pageHeightMm = 297;
  const marginMm = 10;
  const maxContentW = pageWidthMm - marginMm * 2;
  const maxContentH = pageHeightMm - marginMm * 2;

  let curY = marginMm;
  let pageCount = 0;

  for (const el of targets) {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#FFF7ED",
      logging: false
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.94);
    const ratio = canvas.height / Math.max(1, canvas.width);
    const drawW = maxContentW;
    const drawH = drawW * ratio;

    if (pageCount > 0 && curY + drawH > pageHeightMm - marginMm) {
      doc.addPage();
      curY = marginMm;
    } else if (pageCount === 0) {
      pageCount = 1;
    }

    doc.addImage(imgData, "JPEG", marginMm, curY, drawW, Math.min(drawH, maxContentH));
    curY += drawH + 4;
    if (curY >= pageHeightMm - marginMm) {
      doc.addPage();
      curY = marginMm;
    }
    canvas.width = 0;
    canvas.height = 0;
  }

  if (triggerDownload) {
    savePdfBlob(doc, fileName);
  }
  return doc;
}
