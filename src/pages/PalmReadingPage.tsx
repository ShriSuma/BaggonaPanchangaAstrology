import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executePalmReading,
  askPalmReadingFollowUp,
  type HandSide,
  type PalmReadingResult
} from "../features/palmreading/palmReadingEngine";
import { validatePalmImageSlot, type ValidationSlot } from "../features/palmreading/palmValidator";
import { PalmMountsTab } from "../components/palmreading/PalmMountsTab";
import { SamudrikaYogasTab } from "../components/palmreading/SamudrikaYogasTab";
import { PalmRemediesTab } from "../components/palmreading/PalmRemediesTab";
import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";
import { PalmTimelineDiagram } from "../components/palmreading/PalmTimelineDiagram";
import { sanitizeAIText } from "../utils/textFormatter";
import { PalmLifeStageMilestonesCard } from "../components/palmreading/PalmLifeStageMilestonesCard";
import { estimateBirthDetailsFromPalmImage } from "../features/palmreading/palmDobEstimator";
import { PalmScannerLoader } from "../components/palmreading/PalmScannerLoader";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { formatRashiAmsha } from "../core/localeNumbers";
import SouthIndianChart from "../components/kundli/SouthIndianChart";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  result?: PalmReadingResult;
  timestamp: string;
};

type TabType = "reading" | "mounts" | "yogas" | "remedies";

type SlotStatus = {
  isValidating: boolean;
  isValid: boolean | null;
  message: string;
};

export default function PalmReadingPage(): JSX.Element {
  const appLanguage = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const session = useKundliViewerStore((s) => s.session);

  // Language selector state
  const [selectedLang, setSelectedLang] = useState<string>(appLanguage || "kn");
  const isKn = selectedLang === "kn";

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("reading");

  // Devotee Name & Details Inputs
  const [devoteeName, setDevoteeName] = useState<string>(session?.input?.name || "");
  const [gotraInput, setGotraInput] = useState<string>(session?.input?.gothra || "");

  const [handSide, setHandSide] = useState<HandSide>("right");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sideImageDataUrl, setSideImageDataUrl] = useState<string | null>(null);
  const [backImageDataUrl, setBackImageDataUrl] = useState<string | null>(null);
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  // Speech Recognition (Voice Input Mic for Follow-up Prashna)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        selectedLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಇನ್‌ಪುಟ್ (Voice Input) ಅನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಬರೆದು ಟೈಪ್ ಮಾಡಿ."
          : "Voice input is not supported in this browser. Please type your question."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        selectedLang === "kn"
          ? "kn-IN"
          : selectedLang === "hi"
          ? "hi-IN"
          : selectedLang === "te"
          ? "te-IN"
          : selectedLang === "ta"
          ? "ta-IN"
          : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setFollowUpInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Validation State for 3 Photo Slots
  const [slotStatus, setSlotStatus] = useState<Record<ValidationSlot, SlotStatus>>({
    front: { isValidating: false, isValid: null, message: "" },
    side: { isValidating: false, isValid: null, message: "" },
    back: { isValidating: false, isValid: null, message: "" }
  });

  // Dedicated refs for camera & upload per slot
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const frontFileRef = useRef<HTMLInputElement>(null);
  const sideCameraRef = useRef<HTMLInputElement>(null);
  const sideFileRef = useRef<HTMLInputElement>(null);
  const backCameraRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const handleFileUploadForSlot = (file: File, slot: ValidationSlot) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const dataUrl = reader.result;
        if (slot === "front") setImageDataUrl(dataUrl);
        if (slot === "side") setSideImageDataUrl(dataUrl);
        if (slot === "back") setBackImageDataUrl(dataUrl);

        // Initiate validation
        setSlotStatus((prev) => ({
          ...prev,
          [slot]: {
            isValidating: true,
            isValid: null,
            message: isKn ? "ಚಿತ್ರದ ಗುಣಮಟ್ಟ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Validating image frame..."
          }
        }));

        const res = await validatePalmImageSlot(dataUrl, slot, geminiApiKey, selectedLang);

        setSlotStatus((prev) => ({
          ...prev,
          [slot]: {
            isValidating: false,
            isValid: res.isValid,
            message: isKn ? res.messageKn : res.messageEn
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Kundli Generator Modal States
  const [showKundliModal, setShowKundliModal] = useState<boolean>(false);
  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(() => new Date(1992, 4, 15));
  const [birthTimeHm, setBirthTimeHm] = useState<string>("08:30");
  const [selectedLoc, setSelectedLoc] = useState<SelectedLocation>({
    stateCode: "KA",
    districtCode: "UK",
    villageName: placeLabelStore || "Gokarna",
    lat: defaultLat,
    lng: defaultLng,
    pincode: pincodeStore || "581326"
  });
  const [generatedKundliData, setGeneratedKundliData] = useState<PalmReadingResult["kundliData"] | undefined>(undefined);
  const [isEstimatingDetails, setIsEstimatingDetails] = useState<boolean>(false);
  const [estimationInfo, setEstimationInfo] = useState<string | null>(null);

  const handleOpenKundliModal = async () => {
    setShowKundliModal(true);
    if (imageDataUrl) {
      setIsEstimatingDetails(true);
      try {
        const recon = await estimateBirthDetailsFromPalmImage(
          imageDataUrl,
          sideImageDataUrl || undefined,
          backImageDataUrl || undefined,
          geminiApiKey,
          selectedLang
        );
        if (recon?.estimatedDob) {
          const parts = recon.estimatedDob.split("-");
          if (parts.length === 3) {
            setBirthDatePicker(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
          }
        }
        if (recon?.estimatedTob) {
          setBirthTimeHm(recon.estimatedTob);
        }
        if (recon?.estimatedPlace) {
          setSelectedLoc({
            stateCode: recon.estimatedPlace.stateCode || "KA",
            districtCode: recon.estimatedPlace.districtCode || "UK",
            villageName: recon.estimatedPlace.villageName || "Gokarna",
            lat: recon.estimatedPlace.lat || defaultLat,
            lng: recon.estimatedPlace.lng || defaultLng,
            pincode: recon.estimatedPlace.pincode || "581326"
          });
        }
        if (recon?.explanationKn && isKn) {
          setEstimationInfo(recon.explanationKn);
        } else if (recon?.explanationEn) {
          setEstimationInfo(recon.explanationEn);
        }
      } catch (err) {
        console.error("Error reconstructing birth parameters:", err);
      } finally {
        setIsEstimatingDetails(false);
      }
    }
  };

  const handleCalculateKundliAndAttach = async () => {
    if (!birthDatePicker) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಜನನ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ" : "Please select birth date");
      return;
    }
    const y = birthDatePicker.getFullYear();
    const m = String(birthDatePicker.getMonth() + 1).padStart(2, "0");
    const d = String(birthDatePicker.getDate()).padStart(2, "0");
    const dobStr = `${y}-${m}-${d}`;

    const lat = selectedLoc.lat || defaultLat;
    const lng = selectedLoc.lng || defaultLng;

    const kundli = await calculateKundliWithPlaceSun({
      name: devoteeName || "Devotee",
      gender: "Male",
      birthDate: dobStr,
      birthTime: birthTimeHm,
      latitude: lat,
      longitude: lng,
      pincode: selectedLoc.pincode
    });

    const traditional = calculateTraditionalBaggona(
      dobStr,
      birthTimeHm,
      lat,
      lng,
      ayanamsaModel,
      selectedLoc.pincode
    );

    const lagnaAmsha = formatRashiAmsha(kundli.ascendant, selectedLang);
    const rashiAmsha = String(kundli.moonSign || "ಮೇಷ");
    const nakshatraName = isKn ? traditional.moonNakshatraKn : traditional.moonNakshatra;
    const maandiRashi = String(kundli.maandi?.rashi || "ಧನಸ್ಸು");
    const dashaLord = "ಬುಧ";

    const attached: PalmReadingResult["kundliData"] = {
      lagna: lagnaAmsha,
      rashi: rashiAmsha,
      nakshatra: nakshatraName,
      maandi: maandiRashi,
      dasha: dashaLord,
      gotra: gotraInput,
      dob: dobStr,
      tob: birthTimeHm,
      kundliOutput: kundli
    };

    setGeneratedKundliData(attached);
    setShowKundliModal(false);
  };

  // States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<PalmReadingResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Submit Palm Inspection
  const handleStartPalmReading = async () => {
    if (!imageDataUrl || slotStatus.front.isValid !== true) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಮುಂಭಾಗದ ಹಸ್ತದ ಫೋಟೋವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ." : "Please upload and validate a clear front palm photo first.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await executePalmReading(
        imageDataUrl,
        handSide,
        devoteeName || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee"),
        selectedLang,
        geminiApiKey,
        generatedKundliData,
        sideImageDataUrl || undefined,
        backImageDataUrl || undefined
      );

      setActiveResult(result);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: isKn ? "ನನ್ನ ಹಸ್ತ ರೇಖೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ ಸ್ವಾಮಿ." : "Please analyze my palm lines and guide me Swamiji.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const priestMsg: ChatMessage = {
        id: `priest-${Date.now()}`,
        sender: "priest",
        text: result.aiPrediction,
        result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages([userMsg, priestMsg]);
    } catch (err) {
      console.error("Palm reading error:", err);
      alert(isKn ? "ಹಸ್ತ ರೇಖಾ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ." : "Error analyzing palm image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Follow-Up Question
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !activeResult) return;

    const query = followUpInput.trim();
    setFollowUpInput("");

    const userMsg: ChatMessage = {
      id: `user-followup-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const answer = await askPalmReadingFollowUp(
        activeResult,
        query,
        selectedLang,
        geminiApiKey
      );

      const priestMsg: ChatMessage = {
        id: `priest-followup-${Date.now()}`,
        sender: "priest",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, priestMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = async () => {
    const container = document.getElementById("palm-reading-pdf-container");
    if (!container) {
      alert("PDF container not found");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      pdf.save(`Baggona_Palm_Reading_${safeName}_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error generating PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Palm Photo Image
  const handleDownloadPalmImage = () => {
    if (!imageDataUrl) return;
    const link = document.createElement("a");
    link.href = imageDataUrl;
    const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
    link.download = `Baggona_Palm_Photo_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Visual Life Timeline Chart Image
  const handleDownloadChartImage = async () => {
    const container = document.getElementById("palm-timeline-diagram-container");
    if (!container) return;
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1c1917"
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      link.download = `Baggona_Palm_Timeline_Chart_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Chart image download error:", err);
    }
  };

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ta", label: "தமிழ் (Tamil)" }
  ];

  // Logic for unlocking slots sequentially
  const isFrontVerified = slotStatus.front.isValid === true;
  const isSideEnabled = isFrontVerified;
  const isSideVerified = slotStatus.side.isValid === true;
  const isBackEnabled = isFrontVerified && isSideVerified;
  const isGenerateEnabled = isFrontVerified;

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              ✋ {isKn ? "ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ (Palm Reading - Vedic Hastarekha Suite)" : "Palm Reading - Vedic Hastarekha Suite"}
            </h1>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ನಿಖರ ೩-ಹಂತದ ಅನುಕ್ರಮಿಕ ಹಸ್ತ ಫೋಟೋ ಸ್ಕ್ಯಾನರ್, ಸಪ್ತ ಗ್ರಹ ಪರ್ವತ ಶಕ್ತಿ, ಸಾಮುದ್ರಿಕ ಯೋಗಗಳು ಹಾಗೂ ಜನನ ಕುಂಡಲಿ ಸಮನ್ವಯ."
                : "Sequential 3-Step Validated Palm Scanner, 7 Planetary Mounts Energy, Samudrika Yogas & Janma Kundali sync."}
            </p>
          </div>

          {activeResult && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPalmImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ಹಸ್ತದ ಫೋಟೋ ಸೇವ್ ಮಾಡಿ" : "Save Palm Photo"}
              >
                <span>🖼️</span>
                <span>{isKn ? "ಫೋಟೋ ಸೇವ್" : "Save Photo"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadChartImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್ ಮಾಡಿ" : "Save Timeline Chart"}
              >
                <span>📈</span>
                <span>{isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್" : "Save Chart"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-2 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating...") : (isKn ? "PDF ವರದಿ" : "Download PDF")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Devotee Name & Language Selector Panel */}
      <Card className="border border-amber-300/80 bg-white p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              👤 {isKn ? "ಭಕ್ತರ ಹೆಸರು (Devotee Name)" : "Devotee Name"}
            </label>
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "e.g. Sri Shreeram Pandit"}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              🪔 {isKn ? "ಗೋತ್ರ (Gotra - Optional)" : "Gotra (Optional)"}
            </label>
            <input
              type="text"
              value={gotraInput}
              onChange={(e) => setGotraInput(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಕಶ್ಯಪ / ವಸಿಷ್ಠ" : "e.g. Kashyapa / Vasishta"}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🌐 {isKn ? "ಸಂವಾದ & PDF ಭಾಷೆ (Select Language)" : "Select Language"}
          </label>
          <div className="flex flex-wrap gap-3">
            {languages.map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                  selectedLang === l.code
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="palmLang"
                  value={l.code}
                  checked={selectedLang === l.code}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="accent-amber-700"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* 4 Interactive Navigation Tabs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-300/80 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("reading")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "reading"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>✋</span>
          <span>{isKn ? "ಹಸ್ತ ರೇಖಾ ಸ್ಕ್ಯಾನರ್" : "Palm Scanner & Chat"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mounts")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "mounts"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🪐</span>
          <span>{isKn ? "ಗ್ರಹ ಪರ್ವತ & ಚಕ್ರ" : "Mounts & Chakras"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("yogas")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "yogas"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>🌟</span>
          <span>{isKn ? "ಸಾಮುದ್ರಿಕ ರಾಜಯೋಗ" : "Samudrika Yogas"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("remedies")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === "remedies"
              ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-md"
              : "bg-white/80 text-amber-950 hover:bg-amber-100"
          }`}
        >
          <span>💍</span>
          <span>{isKn ? "ರತ್ನ & ರುದ್ರಾಕ್ಷಿ" : "Gems & Remedies"}</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: 3-STEP SEQUENTIALLY VALIDATED PALM SCANNER & READING             */}
      {/* ====================================================================== */}
      {activeTab === "reading" && (
        <>
          <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-5">
            {/* Top Bar: Hand Side Selector & Kundli Generator Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-amber-200">
              {/* Hand Side Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-2">
                  🤚 {isKn ? "ಪರಿಶೀಲಿಸುವ ಹಸ್ತ ಆಯ್ಕೆ ಮಾಡಿ (Select Hand)" : "Select Hand to Inspect"}
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer transition ${
                      handSide === "right"
                        ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="handSide"
                      value="right"
                      checked={handSide === "right"}
                      onChange={() => setHandSide("right")}
                      className="accent-amber-700"
                    />
                    <span>{isKn ? "✋ ಬಲ ಹಸ್ತ (Right Hand)" : "✋ Right Hand"}</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer transition ${
                      handSide === "left"
                        ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                        : "border-amber-200 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="handSide"
                      value="left"
                      checked={handSide === "left"}
                      onChange={() => setHandSide("left")}
                      className="accent-amber-700"
                    />
                    <span>{isKn ? "🤚 ಎಡ ಹಸ್ತ (Left Hand)" : "🤚 Left Hand"}</span>
                  </label>
                </div>
              </div>

              {/* 🔮 Kundli Generator Button */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenKundliModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-orange-700 hover:to-amber-800 transition"
                >
                  <span>🔮</span>
                  <span>{isKn ? "ಕುಂಡಲಿ ರಚಿಸಿ (Generate Birth Kundali)" : "Generate Birth Kundali"}</span>
                </button>
              </div>
            </div>

            {/* 3 Sequential Validated Photo Slots */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>📸</span>
                  <span>{isKn ? "ಅನುಕ್ರಮಿಕ ೩-ಹಂತದ ಫೋಟೋ ಸಂಗ್ರಹ & ಪರಿಶೀಲನೆ (Sequential Validation)" : "Sequential 3-Step Palm Image Verification"}</span>
                </h4>
                <div className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  {isBackEnabled && slotStatus.back.isValid
                    ? "🟢 All 3 Steps Verified"
                    : isSideEnabled && slotStatus.side.isValid
                    ? "🟡 Step 2 Verified"
                    : isFrontVerified
                    ? "🟡 Step 1 Verified"
                    : "⚪ Start Step 1"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SLOT 1: FRONT PALM (Active initially) */}
                <div
                  className={`rounded-2xl p-4 border-2 transition space-y-3 ${
                    slotStatus.front.isValid === true
                      ? "border-emerald-500 bg-emerald-50/70 shadow-md"
                      : slotStatus.front.isValid === false
                      ? "border-rose-500 bg-rose-50/70 shadow-md"
                      : "border-amber-400 bg-amber-50/60 shadow-sm"
                  }`}
                >
                  {/* Slot 1 File Inputs */}
                  <input
                    ref={frontCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "front")}
                  />
                  <input
                    ref={frontFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "front")}
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950">✋ ೧. ಮುಂಭಾಗದ ಹಸ್ತ (Front)</span>
                    {slotStatus.front.isValidating ? (
                      <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                        ⌛ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...
                      </span>
                    ) : slotStatus.front.isValid === true ? (
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✅ ೧೦೦% ಸಫಲ (Verified)
                      </span>
                    ) : slotStatus.front.isValid === false ? (
                      <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ❌ ಅಸ್ಪಷ್ಟ
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Step 1
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                    {isKn ? "ಆಯುರ್, ಬುದ್ಧಿ, ಹೃದಯ ಹಾಗೂ ಶನಿ ರೇಖೆಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುವಂತೆ ಮುಂಭಾಗದ ಹಸ್ತ ಹಿಡಿಯಿರಿ." : "Hold palm flat under bright light for major lines."}
                  </p>

                  {slotStatus.front.message && (
                    <div
                      className={`text-[11px] font-bold p-2 rounded-lg ${
                        slotStatus.front.isValid === true
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {slotStatus.front.message}
                    </div>
                  )}

                  {imageDataUrl ? (
                    <div className="relative group">
                      <img
                        src={imageDataUrl}
                        alt="Front Palm"
                        className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageDataUrl(null);
                          setSlotStatus((prev) => ({
                            ...prev,
                            front: { isValidating: false, isValid: null, message: "" }
                          }));
                        }}
                        className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => frontCameraRef.current?.click()}
                        className="flex-1 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>📸</span>
                        <span>{isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => frontFileRef.current?.click()}
                        className="flex-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>📁</span>
                        <span>{isKn ? "ಅಪ್‌ಲೋಡ್" : "Upload"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* SLOT 2: SIDE VIEW (Disabled until Slot 1 verified) */}
                <div
                  className={`rounded-2xl p-4 border-2 transition space-y-3 ${
                    !isSideEnabled
                      ? "border-slate-200 bg-slate-100/70 opacity-60 pointer-events-none"
                      : slotStatus.side.isValid === true
                      ? "border-emerald-500 bg-emerald-50/70 shadow-md"
                      : slotStatus.side.isValid === false
                      ? "border-rose-500 bg-rose-50/70 shadow-md"
                      : "border-amber-400 bg-amber-50/60 shadow-sm"
                  }`}
                >
                  {/* Slot 2 File Inputs */}
                  <input
                    ref={sideCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "side")}
                  />
                  <input
                    ref={sideFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "side")}
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1">
                      {!isSideEnabled && <span>🔒</span>}
                      <span>📐 ೨. ಪಾರ್ಶ್ವ ಹಸ್ತ (Side)</span>
                    </span>
                    {!isSideEnabled ? (
                      <span className="text-[10px] bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        Locked (Step 1 Required)
                      </span>
                    ) : slotStatus.side.isValidating ? (
                      <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                        ⌛ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...
                      </span>
                    ) : slotStatus.side.isValid === true ? (
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✅ ೧೦೦% ಸಫಲ (Verified)
                      </span>
                    ) : slotStatus.side.isValid === false ? (
                      <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ❌ ಅಸ್ಪಷ್ಟ
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Step 2
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                    {isKn ? "ಕನಿಷ್ಠಿಕಾ (ಕಿರುಬೆರಳು) ಬುಡದ ಪಾರ್ಶ್ವ ಭಾಗ - ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ರೇಖೆಗಳ ಸ್ಪಷ್ಟತೆ." : "Side view under pinky for marriage & union lines."}
                  </p>

                  {slotStatus.side.message && (
                    <div
                      className={`text-[11px] font-bold p-2 rounded-lg ${
                        slotStatus.side.isValid === true
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {slotStatus.side.message}
                    </div>
                  )}

                  {sideImageDataUrl ? (
                    <div className="relative group">
                      <img
                        src={sideImageDataUrl}
                        alt="Side View"
                        className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSideImageDataUrl(null);
                          setSlotStatus((prev) => ({
                            ...prev,
                            side: { isValidating: false, isValid: null, message: "" }
                          }));
                        }}
                        className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!isSideEnabled}
                        onClick={() => sideCameraRef.current?.click()}
                        className="flex-1 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span>📸</span>
                        <span>{isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={!isSideEnabled}
                        onClick={() => sideFileRef.current?.click()}
                        className="flex-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span>📁</span>
                        <span>{isKn ? "ಅಪ್‌ಲೋಡ್" : "Upload"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* SLOT 3: BACK VIEW (Disabled until Slot 2 verified) */}
                <div
                  className={`rounded-2xl p-4 border-2 transition space-y-3 ${
                    !isBackEnabled
                      ? "border-slate-200 bg-slate-100/70 opacity-60 pointer-events-none"
                      : slotStatus.back.isValid === true
                      ? "border-emerald-500 bg-emerald-50/70 shadow-md"
                      : slotStatus.back.isValid === false
                      ? "border-rose-500 bg-rose-50/70 shadow-md"
                      : "border-amber-400 bg-amber-50/60 shadow-sm"
                  }`}
                >
                  {/* Slot 3 File Inputs */}
                  <input
                    ref={backCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "back")}
                  />
                  <input
                    ref={backFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "back")}
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1">
                      {!isBackEnabled && <span>🔒</span>}
                      <span>💅 ೩. ಹಿಂಭಾಗದ ಹಸ್ತ (Back)</span>
                    </span>
                    {!isBackEnabled ? (
                      <span className="text-[10px] bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        Locked (Step 2 Required)
                      </span>
                    ) : slotStatus.back.isValidating ? (
                      <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                        ⌛ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...
                      </span>
                    ) : slotStatus.back.isValid === true ? (
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✅ ೧೦೦% ಸಫಲ (Verified)
                      </span>
                    ) : slotStatus.back.isValid === false ? (
                      <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ❌ ಅಸ್ಪಷ್ಟ
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Step 3
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                    {isKn ? "ಉಗುರುಗಳು, ಬೆರಳುಗಳ ಗಿಣ್ಣುಗಳು ಹಾಗೂ ಚರ್ಮದ ಕಾಂತಿ - ಶಾರೀರಿಕ ತತ್ತ್ವ ಪರೀಕ್ಷೆ." : "Back of hand for nail half-moons & finger phalanges."}
                  </p>

                  {slotStatus.back.message && (
                    <div
                      className={`text-[11px] font-bold p-2 rounded-lg ${
                        slotStatus.back.isValid === true
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {slotStatus.back.message}
                    </div>
                  )}

                  {backImageDataUrl ? (
                    <div className="relative group">
                      <img
                        src={backImageDataUrl}
                        alt="Back View"
                        className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBackImageDataUrl(null);
                          setSlotStatus((prev) => ({
                            ...prev,
                            back: { isValidating: false, isValid: null, message: "" }
                          }));
                        }}
                        className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!isBackEnabled}
                        onClick={() => backCameraRef.current?.click()}
                        className="flex-1 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span>📸</span>
                        <span>{isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={!isBackEnabled}
                        onClick={() => backFileRef.current?.click()}
                        className="flex-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 py-2 text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span>📁</span>
                        <span>{isKn ? "ಅಪ್‌ಲೋಡ್" : "Upload"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Action Button (Disabled until Step 1 is valid) */}
            <div className="pt-3 border-t border-amber-200 flex justify-center">
              <button
                type="button"
                onClick={handleStartPalmReading}
                disabled={isProcessing || !isGenerateEnabled}
                className={`w-full sm:w-2/3 rounded-2xl py-3.5 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 ${
                  isGenerateEnabled && !isProcessing
                    ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 hover:from-amber-800 hover:to-amber-950 cursor-pointer animate-pulse"
                    : "bg-slate-300 text-slate-600 cursor-not-allowed opacity-60"
                }`}
              >
                <span>🔮</span>
                <span>
                  {isProcessing
                    ? isKn
                      ? "⌛ ಹಸ್ತ ರೇಖಾ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
                      : "Analyzing Palm..."
                    : !isFrontVerified
                    ? isKn
                      ? "ಹಂತ ೧ ರ ಮುಂಭಾಗದ ಹಸ್ತ ಪರಿಶೀಲಿಸಿ (Step 1 Verification Required)"
                      : "Step 1 Front Palm Verification Required"
                    : isKn
                    ? "ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಫಲ ಪಡೆಯಿರಿ (Generate Hastarekha Reading)"
                    : "Generate Hastarekha Reading"}
                </span>
              </button>
            </div>
          </Card>

          {/* Modal for Janma Kundali Parameters Setup */}
          {showKundliModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <Card className="w-full max-w-lg border-2 border-amber-400 bg-gradient-to-b from-white to-amber-50/70 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                    <span>🔮</span>
                    <span>{isKn ? "ಜನನ ಕುಂಡಲಿ ವಿವರ ಸಂಯೋಜನೆ" : "Synchronize Birth Kundali"}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowKundliModal(false)}
                    className="text-amber-900 hover:text-rose-700 font-black text-sm"
                  >
                    ✕
                  </button>
                </div>

                {isEstimatingDetails ? (
                  <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-950 font-bold flex items-center gap-2 animate-pulse">
                    <span>🤖</span>
                    <span>{isKn ? "ಹಸ್ತದ ರೇಖೆಗಳಿಂದ ಜನನ ಕಾಲಾವಧಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ..." : "Reconstructing birth time parameters from palm line age nodes..."}</span>
                  </div>
                ) : estimationInfo ? (
                  <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-3 text-xs text-emerald-950 font-semibold space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <span>✨</span>
                      <span>{isKn ? "ಹಸ್ತದ ರೇಖೆಗಳ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜು ಮಾಡಿದ ವಿವರಗಳು:" : "AI Palm Line Reconstructed Details:"}</span>
                    </div>
                    <p className="leading-relaxed">{estimationInfo}</p>
                  </div>
                ) : null}

                <div className="space-y-3 text-xs font-bold text-amber-950">
                  <div>
                    <label className="block mb-1">📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)" : "Birth Date"}</label>
                    <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
                  </div>

                  <div>
                    <label className="block mb-1">⏰ {isKn ? "ಹುಟ್ಟಿದ ಸಮಯ (Time of Birth - 24hr)" : "Birth Time (24-Hour)"}</label>
                    <BirthTimePicker value={birthTimeHm} onChange={setBirthTimeHm} />
                  </div>

                  <div>
                    <label className="block mb-1">📍 {isKn ? "ಹುಟ್ಟಿದ ಸ್ಥಳ (Birth Location)" : "Birth Location"}</label>
                    <LocationSelector onChange={(loc) => setSelectedLoc(loc)} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setShowKundliModal(false)}
                    className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
                  >
                    {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCalculateKundliAndAttach}
                    className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white shadow hover:bg-amber-900"
                  >
                    {isKn ? "ಕುಂಡಲಿ ಗಣಿಸಿ & ಸಂಯೋಜಿಸಿ" : "Calculate & Combine Kundali"}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Full-Screen Centered Animated Palm Scanner Modal Overlay */}
          {isProcessing && <PalmScannerLoader isKn={isKn} />}

          {/* Visual Life Event Timeline Diagram Component */}
          {activeResult && (
            <PalmTimelineDiagram
              personName={devoteeName}
              lang={selectedLang}
              handSide={activeResult.handSide}
            />
          )}

          {/* AI Generative Chatbox Timeline & Priest Reading View */}
          {messages.length > 0 && (
            <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>💬</span>
                  <span>{isKn ? "ಗೋಕರ್ಣ ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಸಂವಾದ ಹಾಗೂ ಪರಿಹಾರ" : "Gokarna Palm Reading Guidance & Chat"}</span>
                </h3>
                {activeResult && (
                  <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                    {activeResult.handSideLabel[selectedLang] || activeResult.handSideLabel.en} · Score: {activeResult.overallScore}%
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 mb-1 px-1">
                      <span>{msg.sender === "user" ? `👤 ${devoteeName}` : "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Gokarna Priest)"}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[90%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-amber-800 text-amber-50 rounded-br-none"
                          : "bg-amber-50/90 border border-amber-300 text-amber-950 rounded-bl-none font-medium whitespace-pre-wrap"
                      }`}
                    >
                      {msg.result ? (
                        <div className="space-y-4">
                          {/* Kundli Badge & South Indian Chart if generated */}
                          {msg.result.kundliData && (
                            <div className="rounded-xl border border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-3.5 text-xs text-amber-950 font-bold space-y-3 shadow-inner">
                              <div className="flex flex-wrap gap-3">
                                <div>🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"} <span className="text-emerald-800 font-extrabold">{msg.result.kundliData.lagna}</span></div>
                                <div>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.rashi}</span></div>
                                <div>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.nakshatra}</span></div>
                                <div>🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"} <span className="text-rose-900 font-extrabold">{msg.result.kundliData.maandi}</span></div>
                              </div>
                              {msg.result.kundliData.kundliOutput && (
                                <div className="pt-1 flex justify-center">
                                  <SouthIndianChart
                                    kundli={msg.result.kundliData.kundliOutput}
                                    personName={devoteeName || "Devotee"}
                                    gothra={gotraInput}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Section 1: 5 Major Palm Lines Card */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1 flex items-center justify-between">
                              <span>🖐️ {isKn ? "೧. ಪಂಚ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Major Lines Inspection)" : "1. Major Palm Lines Inspection"}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                <span className="font-bold text-amber-900">{msg.result.lifeLine.lineName[selectedLang] || msg.result.lifeLine.lineName.kn}:</span>{" "}
                                <span className="font-semibold text-emerald-800">[{msg.result.lifeLine.status[selectedLang] || msg.result.lifeLine.status.kn}]</span>{" "}
                                <span className="text-amber-950">{msg.result.lifeLine.indication[selectedLang] || msg.result.lifeLine.indication.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                <span className="font-bold text-amber-900">{msg.result.headLine.lineName[selectedLang] || msg.result.headLine.lineName.kn}:</span>{" "}
                                <span className="font-semibold text-emerald-800">[{msg.result.headLine.status[selectedLang] || msg.result.headLine.status.kn}]</span>{" "}
                                <span className="text-amber-950">{msg.result.headLine.indication[selectedLang] || msg.result.headLine.indication.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                <span className="font-bold text-amber-900">{msg.result.heartLine.lineName[selectedLang] || msg.result.heartLine.lineName.kn}:</span>{" "}
                                <span className="font-semibold text-emerald-800">[{msg.result.heartLine.status[selectedLang] || msg.result.heartLine.status.kn}]</span>{" "}
                                <span className="text-amber-950">{msg.result.heartLine.indication[selectedLang] || msg.result.heartLine.indication.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                <span className="font-bold text-amber-900">{msg.result.fateLine.lineName[selectedLang] || msg.result.fateLine.lineName.kn}:</span>{" "}
                                <span className="font-semibold text-emerald-800">[{msg.result.fateLine.status[selectedLang] || msg.result.fateLine.status.kn}]</span>{" "}
                                <span className="text-amber-950">{msg.result.fateLine.indication[selectedLang] || msg.result.fateLine.indication.kn}</span>
                              </div>
                              <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60 sm:col-span-2">
                                <span className="font-bold text-amber-900">{msg.result.sunLine.lineName[selectedLang] || msg.result.sunLine.lineName.kn}:</span>{" "}
                                <span className="font-semibold text-emerald-800">[{msg.result.sunLine.status[selectedLang] || msg.result.sunLine.status.kn}]</span>{" "}
                                <span className="text-amber-950">{msg.result.sunLine.indication[selectedLang] || msg.result.sunLine.indication.kn}</span>
                              </div>
                            </div>
                          </div>

                          {/* Section 2: Palm Mounts */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              🪐 {isKn ? "೨. ಗ್ರಹ ಪರ್ವತ ಬಲ (Key Planetary Mounts)" : "2. Key Planetary Mounts"}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {msg.result.mounts.map((m, idx) => (
                                <div key={idx} className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                                  <div className="font-bold text-amber-900">{m.mountName[selectedLang] || m.mountName.kn}</div>
                                  <div className="font-semibold text-emerald-800">[{m.strength[selectedLang] || m.strength.kn}]</div>
                                  <div className="text-amber-950 text-[11px]">{m.indication[selectedLang] || m.indication.kn}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Section 3: Auspicious Marks */}
                          {msg.result.specialMarks.length > 0 && (
                            <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                              <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                                🌟 {isKn ? "೩. ಶುಭ ಚಿಹ್ನೆಗಳು & ಯೋಗ (Auspicious Signs)" : "3. Auspicious Marks & Yogas"}
                              </div>
                              <div className="space-y-1.5 text-xs">
                                {msg.result.specialMarks.map((sm, idx) => (
                                  <div key={idx} className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60 flex items-start gap-2">
                                    <span className="font-bold text-amber-900">{sm.mark[selectedLang] || sm.mark.kn}:</span>
                                    <span className="text-amber-950">{sm.meaning[selectedLang] || sm.meaning.kn}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Section 4: Age-Stratified Life Milestones (Education, Marriage, Children, Wealth) */}
                          {msg.result.lifeStageMilestones && (
                            <PalmLifeStageMilestonesCard
                              milestones={msg.result.lifeStageMilestones}
                              lang={selectedLang}
                              devoteeName={devoteeName}
                            />
                          )}

                          {/* Section 5: AI Prediction Text */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                            <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                              📜 {isKn ? "೪. ಸಮಗ್ರ ಸಾಮುದ್ರಿಕ ಫಲ (Detailed Hastarekha Phala)" : "4. Detailed Hastarekha Prediction"}
                            </div>
                            <div className="text-xs text-amber-950 leading-relaxed font-medium">
                              {sanitizeAIText(msg.text)}
                            </div>
                          </div>

                          {/* Section 5: Sacred Remedy */}
                          <div className="rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 shadow-sm space-y-1">
                            <div className="text-xs font-bold text-amber-950">
                              🪔 {isKn ? "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy)" : "6. Sacred Gokarna Mahabaleshwara Remedy"}
                            </div>
                            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                              {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                            </p>
                          </div>
                        </div>
                      ) : (
                        sanitizeAIText(msg.text)
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Follow-up Question Input Bar */}
              <form onSubmit={handleSendFollowUp} className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder={isKn ? "ಹಸ್ತ ರೇಖೆಯ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ವಿವರಣೆ ಕೇಳಿ (ಅಥವಾ ಮೈಕ್ ಬಳಸಿ)..." : "Ask follow-up clarification on this palm reading..."}
                  className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (Voice Input)" : "Ask by voice"}
                  className={`p-2.5 rounded-xl border transition shadow-sm flex items-center justify-center ${
                    isListening
                      ? "bg-red-500 border-red-600 text-white animate-pulse"
                      : "bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200"
                  }`}
                >
                  <span className="text-sm">🎙️</span>
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !followUpInput.trim()}
                  className="rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-900 disabled:opacity-50"
                >
                  {isKn ? "ಕೇಳಿ" : "Ask"}
                </button>
              </form>

              {activeResult && (
                <div className="flex justify-end pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
                  >
                    <span>📄</span>
                    <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪೂರ್ಣ ವರದಿ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ PDF ಡೌನ್‌ಲೋಡ್" : "Download Full Report & Q&A PDF")}</span>
                  </button>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: PALM MOUNTS & CHAKRA ENERGY                                     */}
      {/* ====================================================================== */}
      {activeTab === "mounts" && (
        <PalmMountsTab
          result={activeResult}
          mounts={activeResult?.mounts}
          lang={selectedLang}
          devoteeName={devoteeName}
        />
      )}

      {/* ====================================================================== */}
      {/* TAB 3: SAMUDRIKA YOGAS & SACRED MARKS                                  */}
      {/* ====================================================================== */}
      {activeTab === "yogas" && (
        <SamudrikaYogasTab
          lang={selectedLang}
          devoteeName={devoteeName}
        />
      )}

      {/* ====================================================================== */}
      {/* TAB 4: GEMSTONES, RUDRAKSHA & REMEDIES                                 */}
      {/* ====================================================================== */}
      {activeTab === "remedies" && (
        <PalmRemediesTab
          lang={selectedLang}
          devoteeName={devoteeName}
        />
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering */}
      {activeResult && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <PalmReadingPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />
        </div>
      )}
    </div>
  );
}
