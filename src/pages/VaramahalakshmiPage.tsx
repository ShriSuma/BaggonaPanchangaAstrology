import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  calculateVaramahalakshmiMuhurthas,
  analyzeChartForVaramahalakshmi,
  getGuardianAshtaLakshmi
} from "../features/varamahalakshmi/varamahalakshmiEngine";
import {
  pickL5,
  T_VARAMAHALAKSHMI,
  DORA_GRANTHI_KNOTS,
  VARAMAHALAKSHMI_SEVA_PACKAGES
} from "../features/varamahalakshmi/varamahalakshmiLocale";
import type {
  PersonalizedVaramahalakshmiAnalysis,
  SthiraLagnaMuhurtha
} from "../features/varamahalakshmi/varamahalakshmiTypes";
import SthiraLagnaMuhurthaCard from "../components/varamahalakshmi/SthiraLagnaMuhurthaCard";
import AshtaLakshmiSoubhagyaCard from "../components/varamahalakshmi/AshtaLakshmiSoubhagyaCard";
import VaramahalakshmiPdfTemplate from "../components/varamahalakshmi/VaramahalakshmiPdfTemplate";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { getAllPriests, type PriestProfile } from "../features/seva/sevaPriestDirectory";
import { pick } from "../features/seva/sevaLocale";

const NAKSHATRAS = [
  "ಅಶ್ವಿನಿ (Ashwini)", "ಭರಣಿ (Bharani)", "ಕೃತಿಕಾ (Krittika)", "ರೋಹಿಣಿ (Rohini)",
  "ಮೃಗಶಿರ (Mrigashira)", "ಆರಿದ್ರಾ (Ardra)", "ಪುನರ್ವಸು (Punarvasu)", "ಪುಷ್ಯ (Pushya)",
  "ಆಶ್ಲೇಷ (Ashlesha)", "ಮಖ (Magha)", "ಪುರ್ವ ಫಲ್ಗುಣಿ (Purva Phalguni)", "ಉತ್ತರ ಫಲ್ಗುಣಿ (Uttara Phalguni)",
  "ಹಸ್ತ (Hasta)", "ಚಿತ್ತಾ (Chitra)", "ಸ್ವಾತಿ (Swati)", "ವಿಶಾಖ (Vishakha)",
  "ಅನುರಾಧ (Anuradha)", "ಜ್ಯೇಷ್ಠಾ (Jyeshtha)", "ಮೂಲ (Mula)", "ಪೂರ್ವಾಷಾಢ (Purvashadha)",
  "ಉತ್ತರಾಷಾಢ (Uttarashadha)", "ಶ್ರವಣ (Shravana)", "ಧನಿಷ್ಠಾ (Dhanishta)", "ಶತಭಿಷ (Shatabhisha)",
  "ಪೂರ್ವಾಭಾದ್ರಪದ (Purva Bhadrapada)", "ಉತ್ತರಾಭಾದ್ರಪದ (Uttara Bhadrapada)", "ರೇವತಿ (Revati)"
];

const RASHIS = [
  "ಮೇಷ (Aries)", "ವೃಷಭ (Taurus)", "ಮಿಥುನ (Gemini)", "ಕರ್ಕಾಟಕ (Cancer)",
  "ಸಿಂಹ (Leo)", "ಕನ್ಯಾ (Virgo)", "ತುಲಾ (Libra)", "ವೃಶ್ಚಿಕ (Scorpio)",
  "ಧನು (Sagittarius)", "ಮಕರ (Capricorn)", "ಕುಂಭ (Aquarius)", "ಮೀನ (Pisces)"
];

const BAGINA_ITEMS = [
  { kn: "ಅರಿಶಿನ-ಕುಂಕುಮ & ಸಿಂಧೂರ", en: "Turmeric & Kumkum", icon: "✨" },
  { kn: "ಹಸಿರು ಗಾಜಿನ ಬಳೆಗಳು (೧ ಜೋಡಿ)", en: "Green Glass Bangles", icon: "🟢" },
  { kn: "ಮಂಗಳ ಕನ್ನಡಿ & ಬಾಚಣಿಗೆ", en: "Auspicious Mirror & Comb", icon: "🪞" },
  { kn: "ರವಿಕೆ ವಸ್ತ್ರ (Blouse Piece)", en: "Sacred Blouse Piece", icon: "👘" },
  { kn: "ಫಲ-ತಾಂಬೂಲ & ತೆಂಗಿನಕಾಯಿ", en: "Betel Leaves & Coconut", icon: "🥥" },
  { kn: "೫ ಬಗೆಯ ಧಾನ್ಯಗಳು (ಧಾನ್ಯಲಕ್ಷ್ಮಿ)", en: "5 Sacred Grains", icon: "🌾" },
  { kn: "ಬೆಲ್ಲ & ಒಣ ಕೊಬ್ಬರಿ", en: "Jaggery & Dry Coconut", icon: "🍯" },
  { kn: "ಮಲ್ಲಿಗೆ-ಕಮಲ ಪುಷ್ಪಗಳು", en: "Jasmine & Lotus Flowers", icon: "🌸" }
];

export default function VaramahalakshmiPage(): JSX.Element {
  const language = useAppStore((s) => s.language);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const placeLabel = useAppStore((s) => s.placeLabel);
  const kundliSession = useKundliViewerStore((s) => s.session);

  const priests = useMemo(() => getAllPriests(), []);

  const [activeTab, setActiveTab] = useState<"muhurtha" | "soubhagya" | "doragranthi" | "bagina" | "seva">("muhurtha");
  const [selectedDate, setSelectedDate] = useState("2026-08-28"); // Shravana Shukla Shukravara 2026
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState("");

  // Devotee info states
  const [personName, setPersonName] = useState(kundliSession?.input?.name || "ಸುಮಾ (Suma)");
  const [gotra, setGotra] = useState("ಕಶ್ಯಪ (Kashyapa)");
  const [nakshatraIdx, setNakshatraIdx] = useState(3); // Default Rohini
  const [rashiIdx, setRashiIdx] = useState(1); // Default Taurus

  // Bagina Creator state
  const [baginaRecipient, setBaginaRecipient] = useState("ಅಮ್ಮ (Mother)");
  const [baginaSender, setBaginaSender] = useState(personName);
  const [baginaMessage, setBaginaMessage] = useState(
    "ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿಯು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಸುಖ, ಶಾಂತಿ, ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಅಷ್ಟೈಶ್ವರ್ಯಗಳನ್ನು ಕರುಣಿಸಲಿ ಎಂದು ಹಾರೈಸುತ್ತಾ ಸಮರ್ಪಿಸುವ ಡಿಜಿಟಲ್ ಸೌಭಾಗ್ಯ ಬಾಗಿನ."
  );
  const [copiedBagina, setCopiedBagina] = useState(false);

  // Seva Booking state
  const [selectedPriestId, setSelectedPriestId] = useState(priests[0]?.id || "chaitanya-pandit");
  const [selectedPackageId, setSelectedPackageId] = useState(VARAMAHALAKSHMI_SEVA_PACKAGES[0]!.id);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Copy Sankalpa feedback
  const [copiedSankalpa, setCopiedSankalpa] = useState(false);

  // QR Code URL for PDF and sync
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (kundliSession) {
      if (kundliSession.input?.name) setPersonName(kundliSession.input.name);
      const moon = kundliSession.result?.planets?.find((p) => p.name === "Moon");
      if (moon && moon.nakshatra) {
        setNakshatraIdx(moon.nakshatra.index);
      }
      if (kundliSession.result?.moonSign) {
        setRashiIdx(kundliSession.result.moonSign.index);
      }
    }
  }, [kundliSession]);

  useEffect(() => {
    // Generate high resolution calendar QR Code
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      "ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ ಪೂಜೆ • Sthira Lagna Pooja"
    )}&dates=20260828T063000Z/20260828T123000Z&details=${encodeURIComponent(
      "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ | ಸ್ಥಿರ ಲಗ್ನ ಕಲಶ ಸ್ಥಾಪನೆ & ದೋರಗ್ರಂಥಿ ಪೂಜೆ"
    )}&location=${encodeURIComponent(placeLabel || "Gokarna Kshetra")}`;

    QRCode.toDataURL(calendarUrl, {
      margin: 2,
      width: 280,
      color: { dark: "#78350F", light: "#FFFDF7" }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((e) => console.error("QR Code Error:", e));
  }, [placeLabel]);

  // Compute Muhurthas
  const muhurthaData = useMemo(() => {
    return calculateVaramahalakshmiMuhurthas(selectedDate, defaultLat, defaultLng, ayanamsaModel);
  }, [selectedDate, defaultLat, defaultLng, ayanamsaModel]);

  // Compute Personalized Analysis
  const analysis: PersonalizedVaramahalakshmiAnalysis = useMemo(() => {
    if (kundliSession?.result) {
      return analyzeChartForVaramahalakshmi(kundliSession.result, personName, gotra);
    }
    return analyzeChartForVaramahalakshmi(null, personName, gotra);
  }, [kundliSession, personName, gotra, nakshatraIdx]);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccessMessage("");
    try {
      await generatePDFFromElement(
        "varamahalakshmi-pdf-root",
        `Baggona_Varamahalakshmi_Soubhagya_Patrika_${personName.replace(/\s+/g, "_")}.pdf`
      );
      setPdfSuccessMessage(
        language === "kn"
          ? "ಸೌಭಾಗ್ಯ ಪತ್ರಿಕೆ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!"
          : "Soubhagya Patrika PDF successfully downloaded!"
      );
      setTimeout(() => setPdfSuccessMessage(""), 4000);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please check your browser permissions.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySankalpa = async () => {
    const text = pickL5(analysis.sankalpaTextL5, language);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSankalpa(true);
      setTimeout(() => setCopiedSankalpa(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareBaginaWhatsApp = () => {
    const itemsList = BAGINA_ITEMS.map((item) => `• ${item.icon} ${language === "kn" ? item.kn : item.en}`).join("\n");
    const shareText = `🌸 *ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದ ಸೌಭಾಗ್ಯ ಡಿಜಿಟಲ್ ಬಾಗಿನ* 🌸\n\n` +
      `ಸ್ವೀಕರಿಸುವವರು: *${baginaRecipient}*\n` +
      `ಸಮರ್ಪಿಸುವವರು: *${baginaSender}*\n\n` +
      `"${baginaMessage}"\n\n` +
      `🎁 *ಸೌಭಾಗ್ಯ ಬಾಗಿನದ ಮಂಗಳ ದ್ರವ್ಯಗಳು:*\n${itemsList}\n\n` +
      `✨ *ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠದ ಅನುಗ್ರಹ ಪ್ರಸಾದ*`;

    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleCopyBagina = async () => {
    const itemsList = BAGINA_ITEMS.map((item) => `• ${item.icon} ${language === "kn" ? item.kn : item.en}`).join("\n");
    const text = `🌸 ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ಸೌಭಾಗ್ಯ ಡಿಜಿಟಲ್ ಬಾಗಿನ 🌸\n\nಸ್ವೀಕರಿಸುವವರು: ${baginaRecipient}\nಸಮರ್ಪಿಸುವವರು: ${baginaSender}\n\n"${baginaMessage}"\n\nಮಂಗಳ ದ್ರವ್ಯಗಳು:\n${itemsList}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBagina(true);
      setTimeout(() => setCopiedBagina(false), 2000);
    } catch {
      // fallback
    }
  };

  const selectedPriest = priests.find((p) => p.id === selectedPriestId) || priests[0]!;
  const selectedPackage = VARAMAHALAKSHMI_SEVA_PACKAGES.find((pkg) => pkg.id === selectedPackageId) || VARAMAHALAKSHMI_SEVA_PACKAGES[0]!;

  return (
    <div className="space-y-6 pb-12">
      {/* 👑 Top Festive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/90 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 p-6 sm:p-8 text-amber-50 shadow-xl">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-200 border border-amber-300/30">
              <span>🪔</span> {language === "kn" ? "ಶ್ರಾವಣ ಶುಕ್ಲ ಶುಕ್ರವಾರ ವಿಶೇಷ" : "Shravana Special Festival"}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-100 tracking-tight">
              {pickL5(T_VARAMAHALAKSHMI.festivalTitle, language)}
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              {pickL5(T_VARAMAHALAKSHMI.festivalSubtitle, language)}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-amber-400/30">
                📍 {placeLabel || "Gokarna Kshetra"}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-amber-400/30">
                📅 {selectedDate} (ಶುಕ್ರವಾರ)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col items-stretch">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 text-amber-950 font-bold text-sm shadow-lg hover:from-amber-300 hover:to-amber-200 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <span className="text-base">📜</span>
              <span>{isGeneratingPdf ? pickL5(T_VARAMAHALAKSHMI.downloadingPdf, language) : pickL5(T_VARAMAHALAKSHMI.downloadPdfBtn, language)}</span>
            </button>
            {pdfSuccessMessage && (
              <p className="text-xs text-emerald-300 font-semibold text-center animate-pulse">
                ✓ {pdfSuccessMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Devotee Profile Quick Switcher / Customizer */}
      <div className="rounded-2xl border border-amber-300/80 bg-white/90 dark:bg-slate-900/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌺</span>
            <h3 className="font-serif text-sm font-bold text-amber-950 dark:text-amber-100">
              {language === "kn" ? "ವ್ರತಕರ್ತರ ವಿವರಗಳು (Devotee Sankalpa Details)" : "Devotee Details for Sankalpa"}
            </h3>
          </div>
          {kundliSession && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              ✓ {kundliSession.input?.name || "ಜಾತಕ"} ಲಿಂಕ್ ಆಗಿದೆ
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {language === "kn" ? "ಹೆಸರು (Name)" : "Name"}
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
              placeholder="ಹೆಸರು ನಮೂದಿಸಿ"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {language === "kn" ? "ಗೋತ್ರ (Gotra)" : "Gotra"}
            </label>
            <input
              type="text"
              value={gotra}
              onChange={(e) => setGotra(e.target.value)}
              className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
              placeholder="ಗೋತ್ರ ನಮೂದಿಸಿ"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {language === "kn" ? "ಜನ್ಮ ನಕ್ಷತ್ರ (Nakshatra)" : "Nakshatra"}
            </label>
            <select
              value={nakshatraIdx}
              onChange={(e) => setNakshatraIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
            >
              {NAKSHATRAS.map((nak, idx) => (
                <option key={nak} value={idx}>
                  {idx + 1}. {nak}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {language === "kn" ? "ರಾಶಿ (Moon Sign)" : "Moon Sign"}
            </label>
            <select
              value={rashiIdx}
              onChange={(e) => setRashiIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
            >
              {RASHIS.map((ras, idx) => (
                <option key={ras} value={idx}>
                  {idx + 1}. {ras}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 🧭 Festive Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-amber-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("muhurtha")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "muhurtha"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>⏱️</span>
          <span>{pickL5(T_VARAMAHALAKSHMI.tabMuhurtha, language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("soubhagya")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "soubhagya"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🌺</span>
          <span>{pickL5(T_VARAMAHALAKSHMI.tabSoubhagya, language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doragranthi")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "doragranthi"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🎗️</span>
          <span>{pickL5(T_VARAMAHALAKSHMI.tabDoragranthi, language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bagina")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "bagina"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🎁</span>
          <span>{pickL5(T_VARAMAHALAKSHMI.tabBagina, language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seva")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "seva"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
          }`}
        >
          <span>🪔</span>
          <span>{pickL5(T_VARAMAHALAKSHMI.tabSeva, language)}</span>
        </button>
      </div>

      {/* ── TAB 1: Sthira Lagna & Muhurtha ────────────────────── */}
      {activeTab === "muhurtha" && (
        <SthiraLagnaMuhurthaCard
          muhurthas={muhurthaData.muhurthas}
          sunriseStr={muhurthaData.sunriseStr}
          sunsetStr={muhurthaData.sunsetStr}
          dateStr={muhurthaData.dateStr}
          lang={language}
        />
      )}

      {/* ── TAB 2: Ashta Lakshmi Soubhagya Profile ───────────── */}
      {activeTab === "soubhagya" && (
        <AshtaLakshmiSoubhagyaCard analysis={analysis} lang={language} />
      )}

      {/* ── TAB 3: 9-Knot Sacred Dora Pooja & Sankalpa ──────── */}
      {activeTab === "doragranthi" && (
        <div className="space-y-6">
          {/* Personalized Sankalpa Box */}
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-amber-100/30 to-orange-50 p-5 shadow-md dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  ॥ ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ ಮಹಾಸಂಕಲ್ಪ ॥
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-950 dark:text-amber-100">
                  {personName} {language === "kn" ? "ಅವರ ಕುಟುಂಬದ ಸಂಕಲ್ಪ ಮಂತ್ರ" : "Family Sankalpa"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopySankalpa}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
              >
                <span>{copiedSankalpa ? "✓ ಪ್ರತಿ ಮಾಡಲಾಗಿದೆ" : "📋 ಸಂಕಲ್ಪ ಕಾಪಿ ಮಾಡಿ"}</span>
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-amber-200/80 bg-white/90 dark:bg-slate-800/90 p-4 font-serif text-sm leading-relaxed text-amber-950 dark:text-amber-100">
              {pickL5(analysis.sankalpaTextL5, language)}
            </p>
          </div>

          {/* 9-Knot Dora Table */}
          <div className="rounded-2xl border border-amber-300 bg-white/90 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-950 dark:text-amber-100">
                  🎗️ {language === "kn" ? "೯ ಗಂಟುಗಳ ದೋರಗ್ರಂಥಿ ಪೂಜಾ ವಿಧಾನ" : "9-Knot Sacred Dora Pooja Vidhi"}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {language === "kn"
                    ? "ಹಳದಿ ದಾರಕ್ಕೆ ೯ ಗಂಟುಗಳನ್ನು ಹಾಕಿ, ಪ್ರತಿ ಗಂಟಿಗೆ ಕುಂಕುಮ-ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ ಮಂತ್ರ ಪಠಿಸಿ."
                    : "Tie 9 knots in yellow thread. Chant the mantra and offer kumkuma-akshata to each knot."}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-900 dark:text-amber-200">
                ನೋಂಪಿನ ದಾರ (Raksha Sutra)
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DORA_GRANTHI_KNOTS.map((k) => (
                <div
                  key={k.knotNumber}
                  className="flex flex-col justify-between rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800/40 p-3.5 hover:border-amber-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-200 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-100">
                        ಗಂಟು {k.knotNumber}
                      </span>
                      <span className="font-serif text-xs font-bold text-amber-800 dark:text-amber-300">
                        {pickL5(k.goddessNameL5, language)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold italic text-amber-950 dark:text-amber-100">
                      {k.mantra}
                    </p>
                  </div>
                  <div className="mt-2 border-t border-amber-200/60 dark:border-slate-700 pt-1.5 text-[11px] text-amber-900/80 dark:text-slate-300 font-medium">
                    ✦ {pickL5(k.significanceL5, language)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Digital Bagina Greeting Card Generator ───── */}
      {activeTab === "bagina" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Bagina Form Customizer */}
            <div className="space-y-4 rounded-2xl border border-amber-300 bg-white/90 dark:bg-slate-900 p-5 shadow-sm lg:col-span-5">
              <h3 className="font-serif text-base font-bold text-amber-950 dark:text-amber-100 border-b border-amber-100 dark:border-slate-800 pb-2">
                🎁 {language === "kn" ? "ಡಿಜಿಟಲ್ ಬಾಗಿನ ಸಿದ್ಧಪಡಿಸಿ" : "Customize Digital Bagina"}
              </h3>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {language === "kn" ? "ಸ್ವೀಕರಿಸುವವರ ಹೆಸರು / ಸಂಬಂಧ" : "Recipient Name / Relationship"}
                </label>
                <input
                  type="text"
                  value={baginaRecipient}
                  onChange={(e) => setBaginaRecipient(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
                  placeholder="ಉದಾ: ಅಮ್ಮ, ಅಕ್ಕ, ತಂಗಿ, ಮಗಳು, ಅತ್ತೆ"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {language === "kn" ? "ಸಮರ್ಪಿಸುವವರ ಹೆಸರು (Sender Name)" : "Sender Name"}
                </label>
                <input
                  type="text"
                  value={baginaSender}
                  onChange={(e) => setBaginaSender(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {language === "kn" ? "ಹಾರೈಕೆ ಸಂದೇಶ (Blessing Note)" : "Blessing Message"}
                </label>
                <textarea
                  rows={3}
                  value={baginaMessage}
                  onChange={(e) => setBaginaMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-amber-950 dark:text-amber-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleShareBaginaWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                >
                  <span>💬</span>
                  <span>{language === "kn" ? "WhatsApp ನಲ್ಲಿ ಬಾಗಿನ ಕಳುಹಿಸಿ" : "Share Bagina on WhatsApp"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyBagina}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  <span>{copiedBagina ? "✓ ಕಾಪಿ ಆಗಿದೆ" : "📋 ಬಾಗಿನ ವಿವರ ಕಾಪಿ ಮಾಡಿ"}</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Bagina Preview Card */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl border-3 border-amber-500 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 p-6 shadow-xl">
                <div className="border-2 border-dashed border-amber-600/60 rounded-2xl p-5 bg-white/80 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="text-3xl">🪔 🌸 🪔</span>
                    <h4 className="font-serif text-xl font-bold text-amber-950 mt-1">
                      ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ಸೌಭಾಗ್ಯ ಬಾಗಿನ
                    </h4>
                    <p className="text-xs font-bold text-amber-800">
                      ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ • ಸಕಲ ಸೌಮಾಂಗಲ್ಯ ವೃದ್ಧಿ
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-xs font-bold text-amber-950">
                    <div>ಸ್ವೀಕಾರ: <span className="text-amber-800">{baginaRecipient}</span></div>
                    <div>ಅರ್ಪಣೆ: <span className="text-amber-800">{baginaSender}</span></div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-amber-900 font-medium italic text-center">
                    "{baginaMessage}"
                  </p>

                  <div className="mt-4 border-t border-amber-200 pt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">
                      🎁 ಪೂಜಿತ ಸೌಭಾಗ್ಯ ಬಾಗಿನ ಮಂಗಳ ದ್ರವ್ಯಗಳು:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-amber-950">
                      {BAGINA_ITEMS.map((item) => (
                        <div key={item.kn} className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
                          <span>{item.icon}</span>
                          <span>{language === "kn" ? item.kn : item.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-center text-[10px] text-amber-800 font-semibold border-t border-amber-200 pt-2">
                    ❖ ಅಷ್ಟಲಕ್ಷ್ಮಿ ಕಟಾಕ್ಷ ಸಿದ್ಧಿರಸ್ತು • ಸೌಭಾಗ್ಯವತೀ ಭವ ❖
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Varamahalakshmi Seva Booking ──────────────── */}
      {activeTab === "seva" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-300 bg-white/90 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-950 dark:text-amber-100">
                  🪔 {language === "kn" ? "ವರಮಹಾಲಕ್ಷ್ಮಿ ವಿಶೇಷ ಸೇವೆಗಳು & ಕುಂಕುಮಾರ್ಚನೆ" : "Varamahalakshmi Special Sevas & Kumkumarchana"}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {language === "kn"
                    ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ಅರ್ಚಕರಿಂದ ನಿಮ್ಮ ಗೋತ್ರ-ನಾಮದಲ್ಲಿ ಸಂಕಲ್ಪ ಸಹಿತ ಪೂಜೆ"
                    : "Perform personalized Sankalpa Pooja by Chief Priests at Gokarna Kshetra"}
                </p>
              </div>

              {/* Priest Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">ಅರ್ಚಕರು:</span>
                <select
                  value={selectedPriestId}
                  onChange={(e) => setSelectedPriestId(e.target.value)}
                  className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-amber-950 dark:text-amber-100 focus:outline-none"
                >
                  {priests.map((pr: PriestProfile) => (
                    <option key={pr.id} value={pr.id}>
                      {pick(pr.name, language)} ({pick(pr.title, language)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {VARAMAHALAKSHMI_SEVA_PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/90 dark:bg-slate-800 shadow-md ring-2 ring-amber-400"
                        : "border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-400"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 right-4 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                        ★ {language === "kn" ? "ಅತ್ಯಂತ ಜನಪ್ರಿಯ" : "Most Popular"}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{pkg.icon}</span>
                        <div>
                          <h4 className="font-serif text-base font-bold text-amber-950 dark:text-amber-100">
                            {pickL5(pkg.titleL5, language)}
                          </h4>
                          <span className="font-serif text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                            ₹{pkg.priceInr.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-amber-900/80 dark:text-slate-300 font-medium">
                        {pickL5(pkg.subtitleL5, language)}
                      </p>

                      <ul className="mt-3 space-y-1.5 border-t border-amber-200/60 dark:border-slate-700 pt-3 text-xs text-amber-950 dark:text-slate-200">
                        {pkg.itemsL5.map((it, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{pickL5(it, language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        setBookingConfirmed(true);
                      }}
                      className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition-all shadow-sm ${
                        isSelected
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
                      }`}
                    >
                      {language === "kn" ? "ಸೇವೆ ಆಯ್ಕೆ ಮಾಡಿ & ಸಂಕಲ್ಪ ಬುಕ್ ಮಾಡಿ" : "Book Seva with Sankalpa"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Booking Confirmation Dialog / Toast */}
            {bookingConfirmed && (
              <div className="mt-6 rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-950 dark:text-emerald-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        ಸೇವಾರ್ಥಿ ಸಂಕಲ್ಪ ವಿವರಗಳು ದಾಖಲಾಗಿವೆ
                      </div>
                      <div className="font-serif text-sm font-bold">
                        {personName} ({gotra} ಗೋತ್ರ) • {pickL5(selectedPackage.titleL5, language)}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">
                        ಅರ್ಚಕರು: {pick(selectedPriest.name, language)} ({pick(selectedPriest.title, language)})
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(
                      `ನಮಸ್ಕಾರ, ನಾನು ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದ ${pickL5(selectedPackage.titleL5, "kn")} (₹${selectedPackage.priceInr}) ಸೇವೆಯನ್ನು ${personName} (${gotra} ಗೋತ್ರ) ಹೆಸರಿನಲ್ಲಿ ${pick(selectedPriest.name, "kn")} ಅವರ ಪೌರೋಹಿತ್ಯದಲ್ಲಿ ಬುಕ್ ಮಾಡಲು ಇಚ್ಛಿಸುತ್ತೇನೆ.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors"
                  >
                    <span>💬 WhatsApp ನಲ್ಲಿ ಖಚಿತಪಡಿಸಿ</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HIDDEN / ISOLATED PDF TEMPLATE CONTAINER ────────── */}
      <div
        id="varamahalakshmi-pdf-root"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0px",
          width: "900px",
          overflow: "visible",
          pointerEvents: "none"
        }}
      >
        <VaramahalakshmiPdfTemplate
          analysis={analysis}
          muhurthas={muhurthaData.muhurthas}
          dateStr={muhurthaData.dateStr}
          lang={language}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </div>
    </div>
  );
}
