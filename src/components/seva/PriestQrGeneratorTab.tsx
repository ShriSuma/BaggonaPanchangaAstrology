import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../ui/Card";
import { nakshatraName, rashiName } from "../../features/seva/sevaPresentation";
import {
  getAllPriests,
  addCustomPriest,
  getPriestProfile,
  type PriestProfile
} from "../../features/seva/sevaPriestDirectory";
import { PriestQrCard1PageTemplate } from "./pdf/PriestQrCard1PageTemplate";

type PriestQrGeneratorTabProps = {
  identity: {
    personName: string;
    gotra?: string;
    rashiIndex?: number;
    nakshatraIndex?: number;
    placeLabel?: string;
    dob?: string;
    tob?: string;
  };
  lang: string;
};

export default function PriestQrGeneratorTab({
  identity,
  lang: initialLang
}: PriestQrGeneratorTabProps): JSX.Element {
  // Language selector state (defaults to app language or kn)
  const [selectedLang, setSelectedLang] = useState<string>(initialLang || "kn");
  const isKn = selectedLang === "kn";

  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");
  const [durationDays, setDurationDays] = useState<number>(365); // Default 365 Days (1 Full Year)

  // Custom Priest addition state
  const [customInputMode, setCustomInputMode] = useState<boolean>(false);
  const [newPriestName, setNewPriestName] = useState<string>("");
  const [newPriestPhone, setNewPriestPhone] = useState<string>("+91 99723 39362");

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const activePriest = useMemo(() => {
    return getPriestProfile(selectedPriestId);
  }, [selectedPriestId, priestsList]);

  const pName = activePriest.name[selectedLang as keyof typeof activePriest.name] || activePriest.name.en || activePriest.name.kn;
  const pTitle = activePriest.title[selectedLang as keyof typeof activePriest.title] || activePriest.title.en || activePriest.title.kn;

  const userRashiStr = identity.rashiIndex !== undefined ? rashiName(identity.rashiIndex, selectedLang) : "—";
  const userNakshatraStr = identity.nakshatraIndex !== undefined ? nakshatraName(identity.nakshatraIndex, selectedLang as any) : "—";

  // Generate dynamic QR code payload encoding duration, language, and priest details
  useEffect(() => {
    const origin =
      typeof window !== "undefined" &&
      window.location?.origin &&
      !window.location.origin.includes("localhost") &&
      !window.location.origin.includes("127.0.0.1")
        ? window.location.origin
        : "https://baggona.app";

    const priestPhoneStr = activePriest.phone || "+91 99723 39362";
    const payloadUrl = `${origin}/daily?days=${durationDays}&priest=${encodeURIComponent(pName)}&phone=${encodeURIComponent(priestPhoneStr)}&devotee=${encodeURIComponent(identity.personName)}&lang=${selectedLang}&action=ics`;

    QRCode.toDataURL(payloadUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: {
        dark: "#78350F",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error("QR Generation error:", err);
      });
  }, [durationDays, pName, activePriest, identity, selectedLang]);

  const handleAddPriest = () => {
    if (newPriestName.trim()) {
      const added = addCustomPriest(newPriestName.trim(), newPriestPhone.trim());
      setPriestsList(getAllPriests());
      setSelectedPriestId(added.id);
      setNewPriestName("");
      setCustomInputMode(false);
    }
  };

  const handleDownload1PagePdf = async () => {
    const container = document.getElementById("priest-qr-card-1page-container");
    if (!container) {
      alert("PDF container not found");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(container, {
        scale: 2, // High resolution crisp PDF
        useCORS: true,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const safeName = (identity.personName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      pdf.save(`Baggona_Priest_QR_Card_${safeName}_${durationDays}Days_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating 1-page A4 PDF card.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ta", label: "தமிழ் (Tamil)" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              📱 {isKn ? "ಪೂಜಾರಿ QR ಕೋಡ್ ಜನರೇಟರ್ & ೧-ಪುಟದ A4 ಕಾರ್ಡ್" : "Priest QR Code Generator & 1-Page A4 Card"}
            </h2>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ಅರ್ಚಕರ ಆಯ್ಕೆ, ಭಾಷೆ ಹಾಗೂ ೧ ರಿಂದ ೧೨ ತಿಂಗಳ ದಿನನಿತ್ಯದ ಸಿದ್ಧ ಪಂಚಾಂಗದ ಆಶೀರ್ವಾದ QR ಕೋಡ್ ಕಾರ್ಡ್ ಸಿದ್ಧಪಡಿಸಿ."
                : "Select Priest, Language, Calendar Duration (30 to 365 Days), and generate 1-Page A4 Printable PDF Card."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload1PagePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
          >
            <span>📄</span>
            <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "೧-ಪುಟದ A4 PDF ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "Download 1-Page A4 PDF Card")}</span>
          </button>
        </div>
      </div>

      {/* Control Panel (Language, Priest & Duration Selectors) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Language Selector Dropdown */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🌐 {isKn ? "PDF & QR ಭಾಷೆ (Select Language)" : "PDF & QR Language"}
          </label>
          <div className="space-y-2">
            {languages.map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2.5 rounded-xl border p-2 text-xs font-bold cursor-pointer transition ${
                  selectedLang === l.code
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="qrLang"
                  value={l.code}
                  checked={selectedLang === l.code}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="accent-amber-700"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Priest Dropdown & Custom Addition */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🔱 {isKn ? "ಅರ್ಚಕರ ಆಯ್ಕೆ (Select Priest)" : "Select Priest / Archaka"}
          </label>

          {!customInputMode ? (
            <div className="space-y-3">
              <select
                value={selectedPriestId}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW") {
                    setCustomInputMode(true);
                  } else {
                    setSelectedPriestId(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
              >
                {priestsList.map((p) => {
                  const name = p.name[selectedLang as keyof typeof p.name] || p.name.en || p.name.kn;
                  const title = p.title[selectedLang as keyof typeof p.title] || p.title.en || p.title.kn;
                  const phone = p.phone || "+91 99723 39362";
                  return (
                    <option key={p.id} value={p.id}>
                      {p.sealSymbol} {name} ({phone})
                    </option>
                  );
                })}
                <option value="ADD_NEW">➕ {isKn ? "ಹೊಸ ಅರ್ಚಕರನ್ನು ಸೇರಿಸಿ..." : "Add New Priest..."}</option>
              </select>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>{activePriest.sealSymbol}</span>
                  <span>{pName}</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">{pTitle} · {activePriest.phone || "+91 99723 39362"}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <h4 className="text-xs font-bold text-amber-950">➕ {isKn ? "ಹೊಸ ಅರ್ಚಕರ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "Enter New Priest Details"}</h4>
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">{isKn ? "ಅರ್ಚಕರ ಹೆಸರು:" : "Priest Name:"}</label>
                <input
                  type="text"
                  value={newPriestName}
                  onChange={(e) => setNewPriestName(e.target.value)}
                  placeholder={isKn ? "ಉದಾ: ಶ್ರೀ ವೆಂಕಟೇಶ್ ಶರ್ಮಾ" : "e.g. Sri Venkatesh Sharma"}
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">{isKn ? "ದೂರವಾಣಿ ಸಂಖ್ಯೆ:" : "Phone Number:"}</label>
                <input
                  type="text"
                  value={newPriestPhone}
                  onChange={(e) => setNewPriestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-950"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddPriest}
                  className="flex-1 rounded-lg bg-amber-800 py-2 text-xs font-bold text-white hover:bg-amber-900"
                >
                  {isKn ? "ಉಳಿಸಿ & ಆಯ್ಕೆ ಮಾಡಿ" : "Save & Select"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomInputMode(false)}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900"
                >
                  {isKn ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Duration Selector Dropdown */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            📅 {isKn ? "ಪಂಚಾಂಗ ಅವಧಿ ಆಯ್ಕೆ (Duration)" : "Select Calendar Duration"}
          </label>

          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
          >
            <option value={30}>🗓️ {isKn ? "೧ ತಿಂಗಳು (೩೦ ದಿನಗಳು)" : "1 Month (30 Days)"}</option>
            <option value={90}>🗓️ {isKn ? "೩ ತಿಂಗಳು (೯೦ ದಿನಗಳು)" : "3 Months (90 Days)"}</option>
            <option value={180}>🗓️ {isKn ? "೬ ತಿಂಗಳು (೧೮೦ ದಿನಗಳು)" : "6 Months (180 Days)"}</option>
            <option value={365}>🗓️ {isKn ? "೧೨ ತಿಂಗಳು (೩೬೫ ದಿನಗಳು - ೧ ಪೂರ್ಣ ವರ್ಷ)" : "12 Months (365 Days - 1 Full Year)"}</option>
          </select>

          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 text-xs text-emerald-950">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚡</span>
              <span>{isKn ? `${durationDays} ದಿನಗಳ ಪ್ರತ್ಯೇಕ ಗಣನೆ ಸಕ್ರಿಯವಾಗಿದೆ` : `${durationDays} Days Individual Computation Active`}</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-900/80">
              {isKn
                ? `ಪ್ರತಿಯೊಂದು ${durationDays} ದಿನಗಳ ಪಂಚಾಂಗವೂ ಪುನರಾವರ್ತನೆ ಇಲ್ಲದೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಗಣನೆ ಮಾಡಲ್ಪಡುತ್ತದೆ.`
                : `Each of the ${durationDays} days Panchanga is computed individually with zero repeated data.`}
            </p>
          </div>
        </Card>
      </div>

      {/* Live Preview Container for 1-Page A4 Card */}
      <Card className="overflow-x-auto bg-slate-900/10 p-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <span className="rounded-full bg-amber-800 px-3 py-1 text-xs font-bold text-amber-50 shadow-sm">
            👁️ {isKn ? `೧-ಪುಟದ A4 QR ಕೋಡ್ ಕಾರ್ಡ್ ಲೈವ್ ಮುನ್ನೋಟ (${selectedLang.toUpperCase()})` : `1-Page A4 QR Card Live Preview (${selectedLang.toUpperCase()})`}
          </span>
        </div>

        <div className="shadow-2xl rounded-lg overflow-hidden border border-amber-300 bg-white">
          <PriestQrCard1PageTemplate
            personName={identity.personName}
            rashiName={userRashiStr}
            nakshatraName={userNakshatraStr}
            gotra={identity.gotra}
            priestName={pName}
            priestPhone={activePriest.phone || "+91 99723 39362"}
            priestTitle={pTitle}
            durationDays={durationDays}
            qrDataUrl={qrDataUrl}
            lang={selectedLang}
          />
        </div>
      </Card>
    </div>
  );
}
