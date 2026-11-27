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
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import type { FaceReadingResult } from "../../features/facereading/faceReadingEngine";
import { cleanEnglishFromRegionalText } from "../../features/premiumPdf/premiumPdfLocale";

export interface HotelExpressWalkInPayload {
  devoteeName: string;
  lang: SevenLang;
  tableNumber: string;
  hotelName: string;
  generatedDateStr: string;
  prashna: DeepPrashnaHoraryResult;
  sankhya?: ChandraSankhyaProfile;
  palmReading?: PalmReadingResult | null;
  faceReading?: FaceReadingResult | null;
  aiParagraphs: string[];
  laterTimeUpdateUrl?: string;
}

export const HotelExpressWalkInPdfTemplate = React.forwardRef<HTMLDivElement, { data: HotelExpressWalkInPayload }>(
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

    return (
      <div
        ref={ref}
        id="hotel-express-walkin-pdf"
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
        {/* Header / Cover Card */}
        <div className="express-pdf-section" style={{ ...cardStyle, textAlign: "center", backgroundColor: "#FEF3C7" }}>
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
          <h1 style={{ margin: "4px 0 8px 0", fontSize: "28px", fontWeight: 900, color: "#451a03" }}>
            {pick7({
              kn: "ತಕ್ಷಣದ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ, ಸಂಖ್ಯಾ & ಸಾಮುದ್ರಿಕ ಮಹಾ ವರದಿ",
              en: "Instant Prashna Shastra, Sankhya & Samudrika Express Report",
              hi: "तत्काल प्रश्न शास्त्र, संख्या एवं सामुद्रिक विशेष रिपोर्ट",
              mr: "तात्काळ प्रश्न शास्त्र, संख्या व सामुद्रिक विशेष अहवाल",
              te: "తక్షణ ప్రశ్న శాస్త్రం, సంఖ్యా & సాముద్రిక ఎక్స్‌ప్రెస్ నివేదిక",
              ta: "உடனடி பிரசன்ன சாஸ்திரம், எண் & சாமுத்ரிகா சிறப்பு அறிக்கை",
              ml: "തൽക്ഷണ പ്രശ്നശാസ്ത്രം, സംഖ്യാ & സാമുദ്രിക എക്സ്പ്രസ് റിപ്പോർട്ട്"
            }, lang)}
          </h1>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#78350f" }}>
            {data.devoteeName} • {data.hotelName} ({pick7({
              kn: "ಟೇಬಲ್", en: "Table", hi: "टेबल", mr: "टेबल", te: "టేబుల్", ta: "மேசை", ml: "ടേബിൾ"
            }, lang)} #{n(data.tableNumber)}) • {n(data.generatedDateStr)}
          </div>
        </div>

        {/* Section 1: Deep Prashna Horary Matrix */}
        <div className="express-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೧. ಶ್ರೀ ಗೋಕರ್ಣ ತಾತ್ಕಾಲಿಕ ಪ್ರಶ್ನ ಕುಂಡಲಿ (ಉದಯ ಲಗ್ನ & ೧–೧೦೮ ಸಂಖ್ಯಾ ಸಿದ್ಧಿ)",
              en: "1. Live Table Prashna Kundli (Udaya Lagna & Horary Seed 1–108)",
              hi: "१. तात्कालिक प्रश्न कुंडली (उदय लग्न एवं १–१०८ पावन अंक)",
              mr: "१. तात्काळ प्रश्न कुंडली (उदय लग्न व १–१०८ पवित्र अंक)",
              te: "1. తక్షణ ప్రశ్న కుండలి (ఉదయ లగ్నం & 1–108 పవిత్ర సంఖ్య)",
              ta: "1. நேரடி பிரசன்ன குண்டலி (உதய லக்னம் & 1–108 புனித எண்)",
              ml: "1. തൽക്ഷണ പ്രശ്ന കുണ്ഡലി (ഉദയലഗ്നവും 1–108 സംഖ്യാ ഫലവും)"
            }, lang)}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ backgroundColor: "#FEF3C7", padding: "10px 14px", borderRadius: "10px", border: "1px solid #f59e0b" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಪ್ರಶ್ನ ವಿಷಯ & ಪವಿತ್ರ ಸಂಖ್ಯೆ", en: "Question Focus & Seed #", hi: "प्रश्न विषय एवं अंक", mr: "प्रश्न विषय व अंक", te: "ప్రశ్న & సంఖ్య", ta: "கேள்வி & புனித எண்", ml: "ചോദ്യവും സംഖ്യയും" }, lang)}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                {data.prashna.questionLabel} (#{n(data.prashna.horaryNumber)})
              </div>
            </div>

            <div style={{ backgroundColor: "#ECFDF5", padding: "10px 14px", borderRadius: "10px", border: "1px solid #10b981" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>
                {pick7({ kn: "ತಾಜಿಕ ಇತ್ಥಸಾಲ ಸಿದ್ಧಿ ಬಲ", en: "Tajika Ithasala Success Score", hi: "ताजिक इत्थसाल सिद्धि बल", mr: "ताजिक इत्थसाल सिद्धी बळ", te: "తాజిక ఇత్థసాల సిద్ధి బలం", ta: "தாஜிக இத்தசால வெற்றி பலம்", ml: "താജിക ഇത്ഥസാല വിജയബലം" }, lang)}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#064e3b", marginTop: "3px" }}>
                {n(data.prashna.ithasalaHarmonyScore)}% — {data.prashna.verdictTitle}
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFBEB", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d97706" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಉದಯ ಲಗ್ನ & ಕಾರ್ಯೇಶ ಗ್ರಹ", en: "Udaya Lagna & Karya Lord", hi: "उदय लग्न एवं कार्येश", mr: "उदय लग्न व कार्येश", te: "ఉదయ లగ్నం & కార్యేశుడు", ta: "உதய லக்னம் & கார்ய அதிபதி", ml: "ഉദയലഗ്നവും കാര്യാധിപനും" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                {data.prashna.udayaLagnaName} ({data.prashna.udayaLagnaLordName}) • {data.prashna.karyaLordName}
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFBEB", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d97706" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                {pick7({ kn: "ಕಾಲಮಾನ ನಿರೀಕ್ಷೆ (ಸಮಯ ಸೂಚನೆ)", en: "Estimated Fulfillment Horizon", hi: "संभावित सिद्धि समय", mr: "अपेक्षित फलप्राप्ती काळ", te: "ఫలిత కాలపరిమితి", ta: "பலன் கிட்டும் கால அளவு", ml: "ഫലസിദ്ധി കാലയളവ്" }, lang)}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#451a03", marginTop: "3px" }}>
                {data.prashna.timingForecast}
              </div>
            </div>
          </div>

          <p style={{ margin: "0 0 10px 0", fontSize: "15px", lineHeight: 1.65 }}>
            {cleanTxt(data.prashna.verdictSummary)}
          </p>
          <div style={{ padding: "10px 14px", backgroundColor: "#FEF3C7", borderRadius: "8px", fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
            ✨ {cleanTxt(data.prashna.remedialAction)}
          </div>
        </div>

        {/* Section 2: Personalized AI Synthesis + Sankhya Numerology */}
        <div className="express-pdf-section" style={cardStyle}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
            {pick7({
              kn: "೨. ವೈಯಕ್ತಿಕ AI ವಿಶ್ಲೇಷಣೆ & ಚಾಲ್ಡಿಯನ್ ನಾಮ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
              en: "2. Personalized Synthesis & Chaldean Sankhya Shastra",
              hi: "२. व्यक्तिगत AI विश्लेषण एवं चाल्डियन संख्या शास्त्र",
              mr: "२. वैयक्तिक AI विश्लेषण व चाल्डियन अंकशास्त्र",
              te: "2. వ్యక్తిగత విశ్లేషణ & చాల్డియన్ సంఖ్యాశాస్త్రం",
              ta: "2. தனிப்பயன் ஆய்வு & எண் கணித சாஸ்திரம்",
              ml: "2. വ്യക്തിഗത വിശകലനവും ചാൽഡിയൻ സംഖ്യാശാസ്ത്രവും"
            }, lang)}
          </h2>

          {data.sankhya && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div style={{ backgroundColor: "#FFFBEB", padding: "10px", borderRadius: "8px", border: "1px solid #d97706" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
                  {pick7({ kn: "ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ", en: "Mulank & Bhagyank", hi: "मूलांक एवं भाग्यांक", mr: "मूलांक व भाग्यांक", te: "మూలాంకం & భాగ్యాంకం", ta: "மூல எண் & விதி எண்", ml: "മൂലാംകവും ഭാഗ്യാംകവും" }, lang)}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>
                  {n(data.sankhya.mulank)} • {n(data.sankhya.bhagyank)}
                </div>
              </div>
              <div style={{ backgroundColor: "#FFFBEB", padding: "10px", borderRadius: "8px", border: "1px solid #d97706" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
                  {pick7({ kn: "ಚಾಲ್ಡಿಯನ್ ನಾಮ ಸಂಖ್ಯೆ", en: "Chaldean Name #", hi: "नाम संख्या", mr: "नाव क्रमांक", te: "పేరు సంఖ్య", ta: "பெயர் எண்", ml: "നാമസംഖ്യ" }, lang)}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800 }}>
                  {n(data.sankhya.chaldeanCompound)} ({n(data.sankhya.chaldeanSingle)})
                </div>
              </div>
              <div style={{ backgroundColor: "#FFFBEB", padding: "10px", borderRadius: "8px", border: "1px solid #d97706" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
                  {pick7({ kn: "ಶುಭ ಬಣ್ಣ & ಅಧಿಪತಿ", en: "Lucky Color & Ruler", hi: "शुभ रंग व स्वामी", mr: "शुभ रंग व स्वामी", te: "శుభ రంగు & గ్రహం", ta: "அதிர்ஷ்ட நிறம்", ml: "ശുഭനിറവും അധിപനും" }, lang)}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800 }}>
                  {data.sankhya.luckyColor} • {data.sankhya.rulingPlanet}
                </div>
              </div>
            </div>
          )}

          {data.aiParagraphs.map((para, idx) => (
            <p key={idx} style={{ margin: "0 0 10px 0", fontSize: "15px", lineHeight: 1.65 }}>
              {cleanTxt(para)}
            </p>
          ))}
        </div>

        {/* Section 3: Optional Hastarekha / Mukha Samudrika */}
        {(data.palmReading || data.faceReading) && (
          <div className="express-pdf-section" style={cardStyle}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 800, color: "#78350f", borderBottom: "1.5px solid #e2b45d", paddingBottom: "6px" }}>
              {pick7({
                kn: "೩. ಹಸ್ತರೇಖಾ / ಮುಖ ಸಾಮುದ್ರಿಕ ದೈವಿಕ ದರ್ಶನ",
                en: "3. Biometric Hastarekha & Mukha Samudrika Findings",
                hi: "३. हस्तरेखा एवं मुख सामुद्रिक विशेष फल",
                mr: "३. हस्तरेखा व मुख सामुद्रिक विशेष फलादेश",
                te: "3. హస్తసాముద్రికం & ముఖ సాముద్రిక విశ్లేషణ",
                ta: "3. கைரேகை மற்றும் முக சாமுத்ரிகா பலன்கள்",
                ml: "3. ഹസ്തരേഖാ / മുഖ സാമുദ്രിക ശാസ്ത്ര ഫലങ്ങൾ"
              }, lang)}
            </h2>

            {data.palmReading && (
              <div style={{ marginBottom: "14px", padding: "12px 14px", backgroundColor: "#FFFBEB", borderRadius: "10px", border: "1px solid #d97706" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350f", marginBottom: "6px" }}>
                  ✋ {cleanTxt(data.palmReading.chironomyHandType?.element?.[lang] || data.palmReading.chironomyHandType?.element?.en)} • {cleanTxt(data.palmReading.mounts?.[0]?.mountName?.[lang] || data.palmReading.mounts?.[0]?.mountName?.en)}
                </div>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", lineHeight: 1.6 }}>
                  {cleanTxt(data.palmReading.aiPrediction || data.palmReading.verdictTitle?.[lang] || data.palmReading.verdictTitle?.en)}
                </p>
                {(data.palmReading.detectedYogas || []).length > 0 && (
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46" }}>
                    ✨ {(data.palmReading.detectedYogas || []).filter((y) => y.isPresent).slice(0, 3).map((y) => cleanTxt(y.yogaName?.[lang] || y.yogaName?.en)).join(" • ")}
                  </div>
                )}
              </div>
            )}

            {data.faceReading && (
              <div style={{ padding: "12px 14px", backgroundColor: "#FFFBEB", borderRadius: "10px", border: "1px solid #d97706" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350f", marginBottom: "6px" }}>
                  👤 {cleanTxt(data.faceReading.facialConstitution?.mahapurushaArchetype?.[lang] || data.faceReading.facialConstitution?.mahapurushaArchetype?.en)} • {cleanTxt(data.faceReading.facialConstitution?.auraGlow?.[lang] || data.faceReading.facialConstitution?.auraGlow?.en)}
                </div>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
                  {cleanTxt(data.faceReading.aiPrediction || data.faceReading.verdictTitle?.[lang] || data.faceReading.verdictTitle?.en)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Sri Gokarna Priest Sanctuary & Later-Time Upgrade Promise */}
        <div className="express-pdf-section" style={{ ...cardStyle, backgroundColor: "#FEF3C7", textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#78350f", marginBottom: "6px" }}>
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

export async function captureHotelExpressWalkInPdf(
  containerEl: HTMLElement,
  fileName: string,
  triggerDownload: boolean = true
): Promise<jsPDF> {
  const sections = Array.from(containerEl.querySelectorAll(".express-pdf-section")) as HTMLElement[];
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
