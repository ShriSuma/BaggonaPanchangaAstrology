import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import JSZip from "jszip";
import QRCode from "qrcode";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore, type KundliViewerSession } from "../stores/kundliViewerStore";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName, RASHIS } from "../core/AstroTypes";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { calculateComprehensiveDoshas, type ComprehensiveDoshaReport } from "../core/ComprehensiveDoshaEngine";
import { generateKundliRemedyReport, type KundliRemedyDiagnosis } from "../features/remedies/kundliRemedyEngine";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import {
  generateCompactGoogleCalendarUrlForQR,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import {
  RASHI_L5,
  NAKSHATRA_L5,
  GRAHA_L5,
  pick,
  type GrahaKey
} from "../features/premiumPdf/premiumPdfLocale";
import { PACKAGE_LOCALES, type PackageLang, type PackageLocaleDict } from "../components/packageDownload/packageDownloadLocale";
import { JananaKundaliPrintTemplate } from "../components/packageDownload/JananaKundaliPrintTemplate";
import { CurrentLifeStatusPdfTemplate } from "../components/packageDownload/CurrentLifeStatusPdfTemplate";
import { MultiPeriodQrCardTemplate } from "../components/packageDownload/MultiPeriodQrCardTemplate";
import { DivyaBhavishyaQnaPdfTemplate, type PackageQuestionItem } from "../components/packageDownload/DivyaBhavishyaQnaPdfTemplate";
import { generateAnswerForQuestion } from "../components/packageDownload/packageAnswerEngine";
import { prepareBhavishyaV1Data, captureBhavishyaV1Pdf } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import { ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText
} from "../components/RamanBhavishya/BhavishyaView";

const toGrahaKey = (planet: any): GrahaKey => String(planet) as GrahaKey;

export default function DevoteePackageDownloadPage(): JSX.Element {
  const { t } = useTranslation();
  const activeSession = useKundliViewerStore((state) => state.session);
  const appLanguage = useAppStore((state) => state.language);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);

  // 1. Language Radio Selection
  const [selectedLang, setSelectedLang] = useState<PackageLang>(() => {
    if (["kn", "en", "hi", "te", "ta"].includes(appLanguage)) {
      return appLanguage as PackageLang;
    }
    return "kn";
  });
  const dict: PackageLocaleDict = PACKAGE_LOCALES[selectedLang] || PACKAGE_LOCALES.kn;

  // 2. Devotee Information State
  const [devoteeName, setDevoteeName] = useState<string>(activeSession?.input?.name || "ಮನೋಜ್ ಪೂರ್ಣಮಾಥ");
  const [gender, setGender] = useState<"male" | "female">(() => {
    const g = activeSession?.input?.gender?.toLowerCase();
    return g === "female" ? "female" : "male";
  });
  const [birthDate, setBirthDate] = useState<string>(activeSession?.input?.birthDate || "1993-03-16");
  const [birthTime, setBirthTime] = useState<string>(activeSession?.input?.birthTime || "01:40");
  const [placeLabel, setPlaceLabel] = useState<string>(activeSession?.placeLabel || activeSession?.homePlaceName || "Gokarna, Karnataka");
  const [gotra, setGotra] = useState<string>(activeSession?.input?.gothra || "Shiva / Kashyapa");
  const [latitude, setLatitude] = useState<number>(activeSession?.input?.latitude ?? 14.5479);
  const [longitude, setLongitude] = useState<number>(activeSession?.input?.longitude ?? 74.3187);
  const [maritalStatus, setMaritalStatus] = useState<"married" | "unmarried" | "general">(() => {
    const ms = activeSession?.input?.maritalStatus;
    if (ms === "married" || ms === "unmarried" || ms === "general") return ms;
    return "married";
  });
  const [childrenStatus, setChildrenStatus] = useState<"has_children" | "no_children" | "general">(() => {
    const cs = (activeSession?.input as any)?.childrenStatus;
    if (cs === "no_children" || cs === "has_children" || cs === "general" || cs === "unspecified") {
      return cs === "unspecified" ? "general" : cs;
    }
    return "has_children";
  });
  const [activePreviewTab, setActivePreviewTab] = useState<"marriage" | "children">("marriage");

  // 3. Priest & Pooja Details State
  const [priestName, setPriestName] = useState<string>("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
  const [priestPhone, setPriestPhone] = useState<string>("9972339362");
  const [poojaName, setPoojaName] = useState<string>("ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹೋಮ, ನವಗ್ರಹ ಶಾಂತಿ & ರುದ್ರಾಭಿಷೇಕ ಪೂಜೆ");
  const [poojaPlace, setPoojaPlace] = useState<string>("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ");

  // 4. Divya Bhavishya Single / Multi-Question State
  const [questionMode, setQuestionMode] = useState<"single" | "multi">("single");
  const [selectedTopic, setSelectedTopic] = useState<string>("career");
  const [questions, setQuestions] = useState<PackageQuestionItem[]>([
    {
      id: "q_1",
      topicId: "career",
      topicLabel: dict.topics.career.label,
      questionText: dict.topics.career.sample
    }
  ]);
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // 5. Items Checklist for Download
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    item1_kundli: true,
    item2_bhavishyaV1: true,
    item3_remedies: true,
    item4_doshas: true,
    item5_currentLife: true,
    item6_qrCodes: true,
    item7_qna: true
  });

  // 6. QR Code Data URLs (30, 90, 120 Days)
  const [qr30Url, setQr30Url] = useState<string>("");
  const [qr90Url, setQr90Url] = useState<string>("");
  const [qr120Url, setQr120Url] = useState<string>("");

  // 7. Zip Packaging & Progress State
  const [isPackagingZip, setIsPackagingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [zipStageText, setZipStageText] = useState<string>("");
  const [zipCompleteModalOpen, setZipCompleteModalOpen] = useState<boolean>(false);
  const [generatedZipUrl, setGeneratedZipUrl] = useState<string | null>(null);
  const [generatedZipFileName, setGeneratedZipFileName] = useState<string>("");
  const [singleDownloadingId, setSingleDownloadingId] = useState<string | null>(null);

  // Bhavishya V1 payload state for container rendering
  const [bhavishyaV1Payload, setBhavishyaV1Payload] = useState<any>(null);
  const bhavishyaV1Ref = useRef<HTMLDivElement>(null);

  // Synchronize question sample when language changes
  useEffect(() => {
    setQuestions((prev) =>
      prev.map((q) => {
        const topicKey = q.topicId as keyof typeof dict.topics;
        const localizedTopic = dict.topics[topicKey] || dict.topics.career;
        return {
          ...q,
          topicLabel: localizedTopic.label,
          questionText: q.questionText && q.questionText.length > 5 ? q.questionText : localizedTopic.sample
        };
      })
    );
  }, [selectedLang]);

  // Compute Kundli
  const kundliResult: KundliOutput = useMemo(() => {
    try {
      const input: KundliInput = {
        name: devoteeName,
        birthDate,
        birthTime,
        latitude,
        longitude,
        gender: gender === "female" ? "Female" : "Male"
      };
      return calculateKundli(input, { ayanamsaModel: "lahiri" });
    } catch (e) {
      console.warn("[DevoteePackageDownload] Fallback kundli calc:", e);
      return (
        activeSession?.result ||
        calculateKundli(
          {
            name: "Manoj",
            birthDate: "1993-03-16",
            birthTime: "01:40",
            latitude: 14.5479,
            longitude: 74.3188,
            gender: "Male"
          },
          { ayanamsaModel: "lahiri" }
        )
      );
    }
  }, [devoteeName, birthDate, birthTime, latitude, longitude, gender, activeSession]);

  // Compute Dosha Report
  const doshaReport: ComprehensiveDoshaReport = useMemo(() => {
    return calculateComprehensiveDoshas(
      kundliResult,
      {
        name: devoteeName,
        birthDate,
        birthTime,
        latitude,
        longitude,
        gender: gender === "female" ? "Female" : "Male"
      },
      new Date()
    );
  }, [kundliResult, devoteeName, birthDate, birthTime, latitude, longitude, gender]);

  // Compute Remedy Diagnosis
  const remedyDiagnosis: KundliRemedyDiagnosis = useMemo(() => {
    return generateKundliRemedyReport(kundliResult, {
      name: devoteeName,
      birthDate,
      birthTime,
      latitude,
      longitude,
      gender: gender === "female" ? "Female" : "Male"
    });
  }, [kundliResult, devoteeName, birthDate, birthTime, latitude, longitude, gender]);

  // Dynamic Real-Time Narrations updating immediately on option click (3 paragraphs, 5-6 lines each)
  const liveMarriageNarration = useMemo(() => {
    const lagnaIdx = kundliResult?.lagnaRashi?.index ?? 0;
    const lagnaStr = kundliResult?.lagnaRashi ? pick(RASHI_L5[lagnaIdx], selectedLang) : "";
    const moonIdx = kundliResult?.moonSign?.index ?? 0;
    const moonStr = pick(RASHI_L5[moonIdx], selectedLang);
    const age = ageDecimalYearsAt(birthDate || "1993-03-16", birthTime || "01:40", latitude, longitude, new Date());
    const currentBhuktiData = findBhuktiAtAge(kundliResult, age);
    const mahaLord = currentBhuktiData?.maha?.planet ? toGrahaKey(currentBhuktiData.maha.planet) : null;
    const bhuktiLord = currentBhuktiData?.bhukti ? toGrahaKey(currentBhuktiData.bhukti) : null;
    const dashaName = mahaLord && GRAHA_L5[mahaLord] ? pick(GRAHA_L5[mahaLord], selectedLang) : "Dasha";
    const bhuktiName = bhuktiLord && GRAHA_L5[bhuktiLord] ? pick(GRAHA_L5[bhuktiLord], selectedLang) : "Bhukti";
    const userGender = gender === "female" ? "Female" : "Male";
    return buildPersonalizedMarriageText(selectedLang, lagnaStr, moonStr, maritalStatus, lagnaIdx, dashaName, bhuktiName, userGender);
  }, [kundliResult, selectedLang, maritalStatus, birthDate, birthTime, latitude, longitude, gender]);

  const liveChildrenNarration = useMemo(() => {
    const lagnaIdx = kundliResult?.lagnaRashi?.index ?? 0;
    const age = ageDecimalYearsAt(birthDate || "1993-03-16", birthTime || "01:40", latitude, longitude, new Date());
    const currentBhuktiData = findBhuktiAtAge(kundliResult, age);
    const mahaLord = currentBhuktiData?.maha?.planet ? toGrahaKey(currentBhuktiData.maha.planet) : null;
    const bhuktiLord = currentBhuktiData?.bhukti ? toGrahaKey(currentBhuktiData.bhukti) : null;
    const dashaName = mahaLord && GRAHA_L5[mahaLord] ? pick(GRAHA_L5[mahaLord], selectedLang) : "Dasha";
    const bhuktiName = bhuktiLord && GRAHA_L5[bhuktiLord] ? pick(GRAHA_L5[bhuktiLord], selectedLang) : "Bhukti";
    return buildPersonalizedChildrenText(selectedLang, childrenStatus, lagnaIdx, dashaName, bhuktiName);
  }, [kundliResult, selectedLang, childrenStatus, birthDate, birthTime, latitude, longitude]);

  // Generate QR codes for 30, 90, and 120 Days
  useEffect(() => {
    let isCancelled = false;

    async function generateAllQrs() {
      try {
        const moonPlanet = kundliResult.planets.find((p) => p.name === PlanetName.Moon);
        const nakIdx = moonPlanet?.nakshatra?.index ?? 18;
        const rashiIdx = kundliResult.moonSign?.index ?? moonPlanet?.rashi?.index ?? 8;
        const startDateStr = new Date().toISOString().slice(0, 10);

        const durations = [30, 90, 120] as const;
        const qrResults: Record<number, string> = {};

        for (const count of durations) {
          const rhythmDays = Array.from({ length: Math.min(count, 30) }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const ymd = d.toISOString().slice(0, 10);
            return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx, startDateStr);
          });

          // Generate compact ASCII URL strictly adhering to baggona-qr-code-guard
          const compactUrl = generateCompactGoogleCalendarUrlForQR({
            days: rhythmDays,
            lang: selectedLang,
            panditName: priestName || "Shreeram Pandit",
            priestPhone: priestPhone || "9972339362",
            overrideCalendarPhone: true,
            notificationTime: "07:00",
            personName: devoteeName,
            pincode: "581326",
            lat: latitude,
            lng: longitude,
            locationName: "Gokarna",
            dob: birthDate,
            tob: birthTime,
            birthNakshatraIndex: nakIdx,
            birthRashiIndex: rashiIdx
          });

          // Generate scannable QR data URL with Error Correction Level L
          try {
            const dataUrl = await QRCode.toDataURL(compactUrl, {
              errorCorrectionLevel: "L",
              margin: 2,
              width: 300,
              color: { dark: "#78350F", light: "#FFFFFF" }
            });
            qrResults[count] = dataUrl;
          } catch (qrErr) {
            console.warn(`[DevoteePackage] QR ${count} error fallback:`, qrErr);
            const fallback = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
              `Baggona Panchanga - ${count} Days`
            )}&recur=RRULE:FREQ=DAILY;COUNT=${count}&ctz=Asia/Kolkata`;
            qrResults[count] = await QRCode.toDataURL(fallback, {
              errorCorrectionLevel: "L",
              margin: 2,
              width: 300
            });
          }
        }

        if (!isCancelled) {
          setQr30Url(qrResults[30] || "");
          setQr90Url(qrResults[90] || "");
          setQr120Url(qrResults[120] || "");
        }
      } catch (err) {
        console.error("[DevoteePackage] Failed generating QR codes:", err);
      }
    }

    void generateAllQrs();
    return () => {
      isCancelled = true;
    };
  }, [kundliResult, selectedLang, priestName, priestPhone, devoteeName, latitude, longitude, birthDate, birthTime]);

  // Load Active Kundli Handler
  const handleLoadActiveKundli = () => {
    if (!activeSession) return;
    setDevoteeName(activeSession.input.name || "");
    if (activeSession.input.gender) {
      setGender(activeSession.input.gender.toLowerCase() === "female" ? "female" : "male");
    }
    setBirthDate(activeSession.input.birthDate || "1993-03-16");
    setBirthTime(activeSession.input.birthTime || "01:40");
    setPlaceLabel(activeSession.placeLabel || activeSession.homePlaceName || "Gokarna");
    if (activeSession.input.gothra) setGotra(activeSession.input.gothra);
    if (typeof activeSession.input.latitude === "number") setLatitude(activeSession.input.latitude);
    if (typeof activeSession.input.longitude === "number") setLongitude(activeSession.input.longitude);
    if (activeSession.input.maritalStatus) {
      const ms = activeSession.input.maritalStatus;
      setMaritalStatus(ms === "unmarried" ? "unmarried" : ms === "general" ? "general" : "married");
    }
    const cs = (activeSession.input as any)?.childrenStatus;
    if (cs === "no_children" || cs === "has_children" || cs === "general" || cs === "unspecified") {
      setChildrenStatus(cs === "unspecified" ? "general" : cs);
    }
  };

  // Add question in multi mode
  const handleAddQuestion = () => {
    if (questions.length >= 6) {
      alert("You can add up to 6 specific questions in one dossier.");
      return;
    }
    const topicKey = selectedTopic as keyof typeof dict.topics;
    const localized = dict.topics[topicKey] || dict.topics.career;
    const newQ: PackageQuestionItem = {
      id: `q_${Date.now()}`,
      topicId: selectedTopic,
      topicLabel: localized.label,
      questionText: localized.sample
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Update question text
  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, questionText: text } : q)));
  };

  // Select topic
  const handleSelectTopic = (topicKey: string) => {
    setSelectedTopic(topicKey);
    const localized = dict.topics[topicKey as keyof typeof dict.topics] || dict.topics.career;
    if (questionMode === "single") {
      setQuestions([
        {
          id: "q_1",
          topicId: topicKey,
          topicLabel: localized.label,
          questionText: localized.sample
        }
      ]);
    }
  };

  // Voice recognition mic
  const handleToggleVoice = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported in this browser. Please use Chrome, Safari or Edge.");
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      const langMap: Record<string, string> = { kn: "kn-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", en: "en-IN" };
      recognition.lang = langMap[selectedLang] || "kn-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.onerror = () => setIsVoiceListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setQuestions((prev) => {
            const updated = [...prev];
            if (updated[0]) updated[0].questionText = transcript;
            return updated;
          });
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsVoiceListening(false);
    }
  };

  // Generate Answers for questions
  const handleGenerateAnswers = async () => {
    setIsAnsweringQuestions(true);
    try {
      const answeredList: PackageQuestionItem[] = [];
      for (const q of questions) {
        const ans = await generateAnswerForQuestion(
          q,
          kundliResult,
          devoteeName,
          birthDate,
          birthTime,
          placeLabel,
          selectedLang,
          geminiApiKey
        );
        answeredList.push(ans);
      }
      setQuestions(answeredList);
    } catch (e) {
      console.error("[DevoteePackage] Error generating answers:", e);
    } finally {
      setIsAnsweringQuestions(false);
    }
  };

  // Toggle checklist item
  const toggleItem = (key: string) => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Individual PDF Download Trigger
  const handleDownloadSinglePdf = async (containerId: string, baseFileName: string) => {
    try {
      setSingleDownloadingId(containerId);
      const safeDevotee = devoteeName.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Devotee";
      const fullFileName = `${safeDevotee}_${baseFileName}_${selectedLang}.pdf`;
      await generatePDFFromElement(containerId, fullFileName, true);
    } catch (err: any) {
      console.error(`Download failed for ${containerId}:`, err);
      alert(`Download failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSingleDownloadingId(null);
    }
  };

  // Individual Bhavishya V1 PDF download
  const handleDownloadBhavishyaV1 = async () => {
    try {
      setSingleDownloadingId("bhavishya_v1");
      const safeDevotee = devoteeName.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Devotee";
      const fullFileName = `${safeDevotee}_Baggona_Bhavishya_V1_${selectedLang}.pdf`;

      const sessionObj: KundliViewerSession = {
        result: kundliResult,
        input: {
          name: devoteeName,
          birthDate,
          birthTime,
          latitude,
          longitude,
          gender: gender === "female" ? "Female" : "Male",
          maritalStatus,
          childrenStatus
        },
        birthDateYmd: birthDate,
        birthTimeHm: birthTime,
        homePlaceName: placeLabel,
        placeLabel: placeLabel,
        dasha: [],
        dailyPrediction: ""
      };

      const payload = await prepareBhavishyaV1Data(
        sessionObj as any,
        selectedLang,
        geminiApiKey,
        { maritalStatus, childrenStatus },
        () => {}
      );
      setBhavishyaV1Payload(payload);
      await new Promise((r) => setTimeout(r, 800));

      if (bhavishyaV1Ref.current) {
        await captureBhavishyaV1Pdf(bhavishyaV1Ref.current, fullFileName, true, {
          payload,
          lang: selectedLang
        });
      }
    } catch (err: any) {
      console.error("Bhavishya V1 download failed:", err);
      alert(`Bhavishya V1 download failed: ${err?.message || "Error"}`);
    } finally {
      setSingleDownloadingId(null);
    }
  };

  // Download QR PNG images as a direct download or zip
  const handleDownloadQrPngs = () => {
    const downloadDataUrl = (url: string, name: string) => {
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const safeDevotee = devoteeName.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Devotee";
    if (qr30Url) downloadDataUrl(qr30Url, `${safeDevotee}_QR_30_Days_Calendar.png`);
    setTimeout(() => {
      if (qr90Url) downloadDataUrl(qr90Url, `${safeDevotee}_QR_90_Days_Calendar.png`);
    }, 400);
    setTimeout(() => {
      if (qr120Url) downloadDataUrl(qr120Url, `${safeDevotee}_QR_120_Days_Calendar.png`);
    }, 800);
  };

  // -------------------------------------------------------------
  // MASTER ZIP FILE GENERATION & DOWNLOAD
  // -------------------------------------------------------------
  const handleDownloadCompleteZip = async () => {
    setIsPackagingZip(true);
    setZipProgress(5);
    setZipStageText("ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ (Initializing Package)...");

    try {
      const zip = new JSZip();
      const safeDevotee = devoteeName.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Devotee";
      const safePriest = (priestName || "Shreeram_Pandit").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
      const todayStr = new Date().toISOString().slice(0, 10);

      // Make sure answers are generated if Q&A is selected
      let effectiveQuestions = questions;
      if (selectedItems.item7_qna && !questions[0]?.answer) {
        setZipStageText("ದಿವ್ಯ ಭವಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...");
        effectiveQuestions = [];
        for (const q of questions) {
          const ans = await generateAnswerForQuestion(
            q,
            kundliResult,
            devoteeName,
            birthDate,
            birthTime,
            placeLabel,
            selectedLang,
            geminiApiKey
          );
          effectiveQuestions.push(ans);
        }
        setQuestions(effectiveQuestions);
      }

      // 1. Janana Kundali
      if (selectedItems.item1_kundli) {
        setZipProgress(18);
        setZipStageText("೧/೭ ಜನನ ಕುಂಡಲಿ ಮುದ್ರಣವಾಗುತ್ತಿದೆ (1/7 Janana Kundali)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf1 = await generatePDFFromElement("pkg-janana-kundali-container", "01_Janana_Kundali.pdf", false);
        zip.file(`01_Janana_Kundali_${safeDevotee}.pdf`, pdf1.output("blob"));
      }

      // 2. Premium Bhavishya V1
      if (selectedItems.item2_bhavishyaV1) {
        setZipProgress(35);
        setZipStageText("೨/೭ ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 ಗಣನೆಯಾಗುತ್ತಿದೆ (2/7 Bhavishya V1)...");
        const sessionObj: KundliViewerSession = {
          result: kundliResult,
          input: {
            name: devoteeName,
            birthDate,
            birthTime,
            latitude,
            longitude,
            gender: gender === "female" ? "Female" : "Male",
            maritalStatus,
            childrenStatus
          },
          birthDateYmd: birthDate,
          birthTimeHm: birthTime,
          homePlaceName: placeLabel,
          placeLabel: placeLabel,
          dasha: [],
          dailyPrediction: ""
        };

        const payload = await prepareBhavishyaV1Data(
          sessionObj as any,
          selectedLang,
          geminiApiKey,
          { maritalStatus, childrenStatus },
          () => {}
        );
        setBhavishyaV1Payload(payload);
        await new Promise((r) => setTimeout(r, 1000));

        if (bhavishyaV1Ref.current) {
          const pdf2 = await captureBhavishyaV1Pdf(bhavishyaV1Ref.current, "02_Bhavishya_V1.pdf", false, {
            payload,
            lang: selectedLang
          });
          zip.file(`02_Bhavishya_V1_${safeDevotee}.pdf`, pdf2.output("blob"));
        }
      }

      // 3. Daivika Parihara
      if (selectedItems.item3_remedies) {
        setZipProgress(50);
        setZipStageText("೩/೭ ದೈವಿಕ ಪರಿಹಾರ ವರದಿ ಮುದ್ರಣವಾಗುತ್ತಿದೆ (3/7 Daivika Parihara)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf3 = await generatePDFFromElement("pkg-remedy-container", "03_Daivika_Parihara.pdf", false);
        zip.file(`03_Daivika_Parihara_${safeDevotee}.pdf`, pdf3.output("blob"));
      }

      // 4. Doshagalu
      if (selectedItems.item4_doshas) {
        setZipProgress(65);
        setZipStageText("೪/೭ ಸಮಗ್ರ ದೋಷಗಳ ವರದಿ ಮುದ್ರಣವಾಗುತ್ತಿದೆ (4/7 Doshagalu)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf4 = await generatePDFFromElement("pkg-dosha-container", "04_Doshagalu_Report.pdf", false);
        zip.file(`04_Doshagalu_Report_${safeDevotee}.pdf`, pdf4.output("blob"));
      }

      // 5. Current Life Status
      if (selectedItems.item5_currentLife) {
        setZipProgress(75);
        setZipStageText("೫/೭ ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಗೋಚಾರ ಮುದ್ರಣವಾಗುತ್ತಿದೆ (5/7 Current Life)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf5 = await generatePDFFromElement("pkg-current-life-container", "05_Current_Life_Status.pdf", false);
        zip.file(`05_Current_Life_Status_${safeDevotee}.pdf`, pdf5.output("blob"));
      }

      // 6. QR Code Cards & PNG Images
      if (selectedItems.item6_qrCodes) {
        setZipProgress(85);
        setZipStageText("೬/೭ ೩೦/೯೦/೧೨೦ ದಿನಗಳ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ (6/7 QR Codes)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf6 = await generatePDFFromElement("pkg-multi-qr-container", "06_Calendar_QR_Cards.pdf", false);
        zip.file(`06_Calendar_QR_Cards_${safeDevotee}.pdf`, pdf6.output("blob"));

        // Add PNG image files into QR folder inside zip
        const qrFolder = zip.folder("06_QR_Codes_Images");
        if (qrFolder) {
          if (qr30Url) {
            const b64 = qr30Url.replace(/^data:image\/png;base64,/, "");
            qrFolder.file("QR_30_Days_Daily_Calendar.png", b64, { base64: true });
          }
          if (qr90Url) {
            const b64 = qr90Url.replace(/^data:image\/png;base64,/, "");
            qrFolder.file("QR_90_Days_Daily_Calendar.png", b64, { base64: true });
          }
          if (qr120Url) {
            const b64 = qr120Url.replace(/^data:image\/png;base64,/, "");
            qrFolder.file("QR_120_Days_Daily_Calendar.png", b64, { base64: true });
          }
        }
      }

      // 7. Divya Bhavishya Q&A
      if (selectedItems.item7_qna) {
        setZipProgress(92);
        setZipStageText("೭/೭ ದಿವ್ಯ ಭವಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಪತ್ರ ಮುದ್ರಣವಾಗುತ್ತಿದೆ (7/7 Divya Bhavishya)...");
        await new Promise((r) => setTimeout(r, 400));
        const pdf7 = await generatePDFFromElement("pkg-qna-container", "07_Divya_Bhavishya_QnA.pdf", false);
        zip.file(`07_Divya_Bhavishya_QnA_${safeDevotee}.pdf`, pdf7.output("blob"));
      }

      // Final ZIP compilation
      setZipProgress(97);
      setZipStageText("ಜಿಪ್ ಕಡತವನ್ನು ಸಂಯೋಜಿಸಲಾಗುತ್ತಿದೆ (Packaging ZIP file)...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${safeDevotee}_${safePriest}_Complete_Astrology_Package_${selectedLang}_${todayStr}.zip`;

      const zipDownloadUrl = URL.createObjectURL(zipBlob);
      setGeneratedZipUrl(zipDownloadUrl);
      setGeneratedZipFileName(zipName);

      // Trigger automatic download
      const a = document.createElement("a");
      a.href = zipDownloadUrl;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 1500);

      setZipProgress(100);
      setZipStageText("🎉 ಸಮಗ್ರ ಜಿಪ್ ಕಡತ ಡೌನ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡಿದೆ!");
      setZipCompleteModalOpen(true);
    } catch (err: any) {
      console.error("[DevoteePackage] ZIP creation error:", err);
      alert(`ZIP creation error: ${err?.message || "Failed to package bundle."}`);
    } finally {
      setIsPackagingZip(false);
    }
  };

  const moonPlanet = kundliResult.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashiSanskrit = kundliResult.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const moonRashiName = RASHI_L5[moonRashiSanskrit as any]?.[selectedLang] || moonRashiSanskrit;
  const nakshatraSanskrit = moonPlanet?.nakshatra?.sanskrit || "Ashwini";
  const nakshatraName = NAKSHATRA_L5[nakshatraSanskrit as any]?.[selectedLang] || nakshatraSanskrit;

  return (
    <div className="animate-fade-in flex flex-col pb-16 text-slate-800 dark:text-slate-100">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-700 via-amber-600 to-orange-700 p-6 md:p-8 text-white shadow-xl mb-6">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent bg-[length:24px_24px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-900/50 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ ॥
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-amber-100 drop-shadow-sm">
              {dict.pageTitle}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-amber-100/90 max-w-2xl leading-relaxed">
              {dict.pageSubtitle}
            </p>
          </div>

          {/* Quick Active Kundli Button */}
          {activeSession && (
            <button
              type="button"
              onClick={handleLoadActiveKundli}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-300 transition-all flex items-center gap-1.5 shrink-0"
            >
              {dict.useCurrentKundliBtn}
            </button>
          )}
        </div>

        {/* 2. Top Language Selector (Radio Buttons) */}
        <div className="mt-6 pt-4 border-t border-amber-500/40 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-amber-200 uppercase tracking-wide">
            {dict.selectLanguage}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
              { code: "en", label: "English" },
              { code: "hi", label: "हिन्दी (Hindi)" },
              { code: "te", label: "తెలుగు (Telugu)" },
              { code: "ta", label: "தமிழ் (Tamil)" }
            ].map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  selectedLang === l.code
                    ? "bg-white text-amber-900 border-white shadow-md ring-2 ring-amber-300"
                    : "bg-amber-800/60 text-amber-100 border-amber-400/30 hover:bg-amber-700/60"
                }`}
              >
                <input
                  type="radio"
                  name="packageLanguage"
                  value={l.code}
                  checked={selectedLang === l.code}
                  onChange={() => setSelectedLang(l.code as PackageLang)}
                  className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Devotee Info + Priest & Pooja Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Devotee Profile */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-amber-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {dict.devoteeDetailsTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {dict.devoteeDetailsSubtitle}
              </p>
            </div>
            <span className="text-lg">👤</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.devoteeNameLabel}
              </label>
              <input
                type="text"
                value={devoteeName}
                onChange={(e) => setDevoteeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.genderLabel}
              </label>
              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                  />
                  <span>{dict.male}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                  />
                  <span>{dict.female}</span>
                </label>
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {selectedLang === "kn"
                  ? "ವೈವಾಹಿಕ ಸ್ಥಿತಿ (Marital Status)"
                  : selectedLang === "hi"
                  ? "वैवाहिक स्थिति (Marital Status)"
                  : selectedLang === "te"
                  ? "వైవాహిక స్థితి (Marital Status)"
                  : selectedLang === "ta"
                  ? "திருமண நிலை (Marital Status)"
                  : "Marital Status"}
              </label>
              <div className="flex flex-wrap items-center gap-3 py-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="maritalStatus"
                    value="married"
                    checked={maritalStatus === "married"}
                    onChange={() => setMaritalStatus("married")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "💍 ವಿವಾಹಿತರು (Married)"
                      : selectedLang === "hi"
                      ? "💍 विवाहित (Married)"
                      : selectedLang === "te"
                      ? "💍 వివాహితులు (Married)"
                      : selectedLang === "ta"
                      ? "💍 திருமணமானவர் (Married)"
                      : "💍 Married"}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="maritalStatus"
                    value="unmarried"
                    checked={maritalStatus === "unmarried"}
                    onChange={() => setMaritalStatus("unmarried")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "🌸 ಅವಿವಾಹಿತರು (Unmarried)"
                      : selectedLang === "hi"
                      ? "🌸 अविवाहित (Unmarried)"
                      : selectedLang === "te"
                      ? "🌸 అవివాహితులు (Unmarried)"
                      : selectedLang === "ta"
                      ? "🌸 திருமணமாகாதவர் (Unmarried)"
                      : "🌸 Unmarried"}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="maritalStatus"
                    value="general"
                    checked={maritalStatus === "general"}
                    onChange={() => setMaritalStatus("general")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "❓ ಸಾಮಾನ್ಯ (Samanya / General)"
                      : selectedLang === "hi"
                      ? "❓ सामान्य (Samanya / General)"
                      : selectedLang === "te"
                      ? "❓ సాధారణం (Samanya / General)"
                      : selectedLang === "ta"
                      ? "❓ பொதுவானது (Samanya / General)"
                      : "❓ Samanya / General"}
                  </span>
                </label>
              </div>
            </div>

            {/* Children Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {selectedLang === "kn"
                  ? "ಸಂತಾನ ಸ್ಥಿತಿ (Children / Progeny Status)"
                  : selectedLang === "hi"
                  ? "संतान स्थिति (Children / Progeny Status)"
                  : selectedLang === "te"
                  ? "సంతాన స్థితి (Children / Progeny Status)"
                  : selectedLang === "ta"
                  ? "குழந்தைப் பேறு நிலை (Children / Progeny Status)"
                  : "Children / Progeny Status"}
              </label>
              <div className="flex flex-wrap items-center gap-2.5 py-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="childrenStatus"
                    value="has_children"
                    checked={childrenStatus === "has_children"}
                    onChange={() => setChildrenStatus("has_children")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "👶 ಸಂತಾನವಿದೆ / ಮಕ್ಕಳು ಇದ್ದಾರೆ (Has Children)"
                      : selectedLang === "hi"
                      ? "👶 संतान है (Has Children)"
                      : selectedLang === "te"
                      ? "👶 పిల్లలు ఉన్నారు (Has Children)"
                      : selectedLang === "ta"
                      ? "👶 குழந்தைகள் உள்ளனர் (Has Children)"
                      : "👶 Has Children"}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="childrenStatus"
                    value="no_children"
                    checked={childrenStatus === "no_children"}
                    onChange={() => setChildrenStatus("no_children")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "🙏 ಸಂತಾನವಿಲ್ಲ / ಮಕ್ಕಳ ನಿರೀಕ್ಷೆ (Not Has Children / Seeking Children)"
                      : selectedLang === "hi"
                      ? "🙏 संतान प्राप्ति प्रयासरत (Not Has Children / Seeking Children)"
                      : selectedLang === "te"
                      ? "🙏 సంతాన నిరీక్షణ (Not Has Children / Seeking Children)"
                      : selectedLang === "ta"
                      ? "🙏 குழந்தை பாக்கியம் எதிர்நோக்கும் (Not Has Children / Seeking Children)"
                      : "🙏 Not Has Children / Seeking Children"}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="childrenStatus"
                    value="general"
                    checked={childrenStatus === "general"}
                    onChange={() => setChildrenStatus("general")}
                  />
                  <span>
                    {selectedLang === "kn"
                      ? "❓ ಸಾಮಾನ್ಯ (Samanya / General)"
                      : selectedLang === "hi"
                      ? "❓ सामान्य (Samanya / General)"
                      : selectedLang === "te"
                      ? "❓ సాధారణం (Samanya / General)"
                      : selectedLang === "ta"
                      ? "❓ பொதுவானது (Samanya / General)"
                      : "❓ Samanya / General"}
                  </span>
                </label>
              </div>
            </div>

            {/* Dynamic Live Narration Preview Box */}
            <div className="col-span-full rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/40 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black text-sm">✨</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-200">
                    {selectedLang === "kn"
                      ? "ನೇರ ನಿರೂಪಣೆ ಮುನ್ನೋಟ (Live Narration Dynamic Preview)"
                      : selectedLang === "hi"
                      ? "सजीव विवरण पूर्वावलोकन (Live Dynamic Preview)"
                      : selectedLang === "te"
                      ? "ప్రత్యక్ష కథనం ప్రివ్యూ (Live Dynamic Preview)"
                      : selectedLang === "ta"
                      ? "நேரடி விவரிப்பு முன்னோட்டம் (Live Dynamic Preview)"
                      : "Live Dynamic Narration Preview"}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {selectedLang === "kn" ? "ಆಯ್ಕೆಗೆ ತಕ್ಕಂತೆ ತಕ್ಷಣ ಬದಲಾಗುತ್ತದೆ" : "Instant On Click"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("marriage")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activePreviewTab === "marriage"
                        ? "bg-amber-400 text-slate-950 shadow-md font-black"
                        : "bg-white/10 text-amber-200 hover:bg-white/20"
                    }`}
                  >
                    {selectedLang === "kn" ? "💍 ವಿವಾಹ ಅಧ್ಯಾಯ" : "💍 Marriage"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("children")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activePreviewTab === "children"
                        ? "bg-amber-400 text-slate-950 shadow-md font-black"
                        : "bg-white/10 text-amber-200 hover:bg-white/20"
                    }`}
                  >
                    {selectedLang === "kn" ? "👶 ಸಂತಾನ ಅಧ್ಯಾಯ" : "👶 Children"}
                  </button>
                </div>
              </div>

              {/* The 3 Paragraphs (5-6 lines each) */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2 font-sans text-xs sm:text-[13px] leading-relaxed">
                {(activePreviewTab === "marriage" ? liveMarriageNarration : liveChildrenNarration)
                  .split("\n\n")
                  .map((para: string, idx: number) => (
                    <div key={idx} className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/30 shadow-sm text-amber-100">
                      <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block mb-1">
                        {selectedLang === "kn" ? `✦ ಪರಿಚ್ಛೇದ ${idx + 1} (೫-೬ ಸಾಲುಗಳು):` : `✦ Paragraph ${idx + 1} (5-6 Lines):`}
                      </span>
                      <p className="text-amber-100/90 leading-relaxed whitespace-pre-line">{para}</p>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20">
                <span className="text-emerald-300 font-semibold">
                  ✓ {selectedLang === "kn" ? "ಖಚಿತ ಕನಿಷ್ಠ ೩ ಪರಿಚ್ಛೇದಗಳು (೫-೬ ಸಾಲುಗಳು)" : "Guaranteed Minimum 3 Paragraphs (5-6 Lines Each)"}
                </span>
                <span className="text-amber-200/70 text-[10px]">
                  {activePreviewTab === "marriage"
                    ? `${maritalStatus === "married" ? "💍 Married" : maritalStatus === "unmarried" ? "🌸 Unmarried" : "❓ Samanya"} Mode`
                    : `${childrenStatus === "has_children" ? "👶 Has Children" : childrenStatus === "no_children" ? "🙏 Not Has Children" : "❓ Samanya"} Mode`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.dobLabel}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.tobLabel}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.pobLabel}
              </label>
              <input
                type="text"
                value={placeLabel}
                onChange={(e) => setPlaceLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.gotraLabel}
              </label>
              <input
                type="text"
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Quick Computed Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-amber-50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="font-bold text-amber-900 dark:text-amber-400">
              {dict.calculatedKundliBadge}:
            </span>
            <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200">
              <span>
                {dict.lagnaLabel}{" "}
                <strong className="text-amber-700 dark:text-amber-300">
                  {RASHI_L5[kundliResult.lagnaRashi?.sanskrit as any]?.[selectedLang] || kundliResult.lagnaRashi?.sanskrit}
                </strong>
              </span>
              <span>•</span>
              <span>
                {dict.rashiLabel}{" "}
                <strong className="text-amber-700 dark:text-amber-300">{moonRashiName}</strong>
              </span>
              <span>•</span>
              <span>
                {dict.nakshatraLabel}{" "}
                <strong className="text-amber-700 dark:text-amber-300">{nakshatraName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Priest & Sacred Pooja Configuration */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-amber-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                {dict.priestAndPoojaTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {dict.priestAndPoojaSubtitle}
              </p>
            </div>
            <span className="text-lg">🪔</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.priestNameLabel}
              </label>
              <input
                type="text"
                value={priestName}
                onChange={(e) => setPriestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.priestPhoneLabel}
              </label>
              <input
                type="text"
                value={priestPhone}
                onChange={(e) => setPriestPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.poojaNameLabel}
              </label>
              <input
                type="text"
                value={poojaName}
                onChange={(e) => setPoojaName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {dict.poojaPlaceLabel}
              </label>
              <input
                type="text"
                value={poojaPlace}
                onChange={(e) => setPoojaPlace(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-orange-50 dark:bg-slate-800/60 border border-orange-200/60 dark:border-slate-700 text-[11px] text-orange-950 dark:text-orange-200">
            <strong>ಗಮನಿಸಿ:</strong> ಈ ಪುರೋಹಿತರ ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ೩೦, ೯೦ ಮತ್ತು ೧೨೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಮತ್ತು ಆಶೀರ್ವಾದ ಪತ್ರಗಳಲ್ಲಿ ನೇರವಾಗಿ ಅಳವಡಿಸಲಾಗುತ್ತದೆ.
          </div>
        </div>
      </div>

      {/* 3. Baggona Divya Bhavishya Single & Multi-Question Studio */}
      <div className="rounded-2xl border-2 border-amber-300/80 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-5 md:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-slate-800 pb-4 mb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
              ದಿವ್ಯ ಭವಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ವೇದಿಕೆ
            </span>
            <h2 className="text-base font-extrabold text-amber-950 dark:text-amber-200">
              {dict.divyaBhavishyaTitle}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {dict.divyaBhavishyaSubtitle}
            </p>
          </div>

          {/* Mode Selector: Single vs Multi Question */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-amber-100/80 dark:bg-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setQuestionMode("single");
                if (questions.length > 1) setQuestions([questions[0]!]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                questionMode === "single"
                  ? "bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {dict.singleQuestionMode}
            </button>
            <button
              type="button"
              onClick={() => setQuestionMode("multi")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                questionMode === "multi"
                  ? "bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {dict.multiQuestionMode}
            </button>
          </div>
        </div>

        {/* Topic Chips */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {dict.selectTopicLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dict.topics).map(([key, item]) => {
              const isSelected = selectedTopic === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectTopic(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Input List */}
        <div className="space-y-4 mb-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{q.topicLabel}</span>
                </span>

                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                        isVoiceListening
                          ? "bg-red-500 text-white border-red-500 animate-pulse"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                      }`}
                      title={dict.voiceInputTitle}
                    >
                      <span>🎤</span>
                      <span className="text-[10px] font-bold">
                        {isVoiceListening ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ..." : "ಧ್ವನಿ"}
                      </span>
                    </button>
                  )}

                  {questionMode === "multi" && questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                      {dict.removeQuestionBtn}
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={q.questionText}
                onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                placeholder={dict.customQuestionPlaceholder}
                rows={2}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />

              {/* Live Answer Preview (if answered) */}
              {q.answer && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-200">
                  <div className="font-bold mb-1 flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <span>✓</span>
                    <span>{q.smartHeader || q.topicLabel}</span>
                  </div>
                  <p className="line-clamp-2 text-slate-600 dark:text-slate-300">{q.answer.paragraph3}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buttons: Add Question + Generate Answers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {questionMode === "multi" && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all"
            >
              {dict.addQuestionBtn}
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {questions[0]?.answer && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>✓</span> {dict.answersReadyBadge}
              </span>
            )}
            <button
              type="button"
              disabled={isAnsweringQuestions}
              onClick={handleGenerateAnswers}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-extrabold shadow-md hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isAnsweringQuestions ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{dict.generatingAnswersText}</span>
                </>
              ) : (
                <span>{dict.generateAnswersBtn}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. The 7 Core Deliverables Card Grid */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-black text-amber-950 dark:text-amber-200">
            {dict.packageContentsTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {dict.packageContentsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item 1: Janana Kundali */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item1_kundli}
                    onChange={() => toggleItem("item1_kundli")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item1Title}
                  </span>
                </label>
                <span className="text-base">🌟</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item1Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "pkg-janana-kundali-container"}
              onClick={() => handleDownloadSinglePdf("pkg-janana-kundali-container", "Janana_Kundali")}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "pkg-janana-kundali-container" ? "ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>

          {/* Item 2: Premium Bhavishya V1 */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item2_bhavishyaV1}
                    onChange={() => toggleItem("item2_bhavishyaV1")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item2Title}
                  </span>
                </label>
                <span className="text-base">📜</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item2Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "bhavishya_v1"}
              onClick={handleDownloadBhavishyaV1}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "bhavishya_v1" ? "ರಚನೆಯಾಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>

          {/* Item 3: Daivika Parihara */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item3_remedies}
                    onChange={() => toggleItem("item3_remedies")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item3Title}
                  </span>
                </label>
                <span className="text-base">🪔</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item3Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "pkg-remedy-container"}
              onClick={() => handleDownloadSinglePdf("pkg-remedy-container", "Daivika_Parihara")}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "pkg-remedy-container" ? "ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>

          {/* Item 4: Doshagalu */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item4_doshas}
                    onChange={() => toggleItem("item4_doshas")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item4Title}
                  </span>
                </label>
                <span className="text-base">⚡</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item4Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "pkg-dosha-container"}
              onClick={() => handleDownloadSinglePdf("pkg-dosha-container", "Doshagalu_Report")}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "pkg-dosha-container" ? "ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>

          {/* Item 5: Current Life Status */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item5_currentLife}
                    onChange={() => toggleItem("item5_currentLife")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item5Title}
                  </span>
                </label>
                <span className="text-base">🪐</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item5Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "pkg-current-life-container"}
              onClick={() => handleDownloadSinglePdf("pkg-current-life-container", "Current_Life_Status")}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "pkg-current-life-container" ? "ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>

          {/* Item 6: QR Codes for 30, 90 & 120 Days */}
          <div className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item6_qrCodes}
                    onChange={() => toggleItem("item6_qrCodes")}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                    {dict.item6Title}
                  </span>
                </label>
                <span className="text-base">📱</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                {dict.item6Desc}
              </p>

              {/* 3 QR Previews */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-1 rounded-lg border bg-slate-50 dark:bg-slate-800">
                  <span className="text-[9px] font-bold block text-emerald-700 dark:text-emerald-400">30 Days</span>
                  {qr30Url ? <img src={qr30Url} alt="QR 30" className="w-12 h-12 mx-auto" /> : <div className="text-[9px]">...</div>}
                </div>
                <div className="p-1 rounded-lg border border-amber-300 bg-amber-50 dark:bg-slate-800">
                  <span className="text-[9px] font-bold block text-amber-700 dark:text-amber-400">90 Days</span>
                  {qr90Url ? <img src={qr90Url} alt="QR 90" className="w-12 h-12 mx-auto" /> : <div className="text-[9px]">...</div>}
                </div>
                <div className="p-1 rounded-lg border bg-slate-50 dark:bg-slate-800">
                  <span className="text-[9px] font-bold block text-indigo-700 dark:text-indigo-400">120 Days</span>
                  {qr120Url ? <img src={qr120Url} alt="QR 120" className="w-12 h-12 mx-auto" /> : <div className="text-[9px]">...</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={singleDownloadingId === "pkg-multi-qr-container"}
                onClick={() => handleDownloadSinglePdf("pkg-multi-qr-container", "Calendar_QR_Cards")}
                className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-400/40 transition-all"
              >
                {singleDownloadingId === "pkg-multi-qr-container" ? "ಡೌನ್‌ಲೋಡ್..." : dict.downloadSinglePdfBtn}
              </button>
              <button
                type="button"
                onClick={handleDownloadQrPngs}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                title="Download 3 PNG QR images"
              >
                PNG ⬇️
              </button>
            </div>
          </div>

          {/* Item 7: Divya Bhavishya Q&A */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.item7_qna}
                    onChange={() => toggleItem("item7_qna")}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {dict.item7Title}
                  </span>
                </label>
                <span className="text-base">🔮</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {dict.item7Desc}
              </p>
            </div>
            <button
              type="button"
              disabled={singleDownloadingId === "pkg-qna-container"}
              onClick={() => handleDownloadSinglePdf("pkg-qna-container", "Divya_Bhavishya_QnA")}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              {singleDownloadingId === "pkg-qna-container" ? "ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : dict.downloadSinglePdfBtn}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Master ZIP Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 border-2 border-amber-300 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="font-extrabold text-base md:text-lg text-amber-200">
              {dict.downloadZipBtn}
            </span>
          </div>
          <p className="text-xs text-amber-100/80 mt-0.5">
            {dict.downloadZipSubtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={isPackagingZip}
          onClick={handleDownloadCompleteZip}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg hover:from-amber-300 hover:to-yellow-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase shrink-0"
        >
          {isPackagingZip ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{zipProgress}% {zipStageText}</span>
            </>
          ) : (
            <span>📦 ಡೌನ್‌ಲೋಡ್ ಜಿಪ್ (Download 1 ZIP)</span>
          )}
        </button>
      </div>

      {/* Progress & Completion Modal */}
      {zipCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 flex items-center justify-center text-3xl">
              🎉
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
              {dict.zipCompleteTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              {dict.zipCompleteDesc}
            </p>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 break-all mb-6">
              {generatedZipFileName}
            </div>

            <div className="flex items-center gap-3">
              {generatedZipUrl && (
                <a
                  href={generatedZipUrl}
                  download={generatedZipFileName}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
                >
                  ಮತ್ತೊಮ್ಮೆ ಡೌನ್‌ಲೋಡ್ (Re-Download)
                </a>
              )}
              <button
                type="button"
                onClick={() => setZipCompleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-all"
              >
                {dict.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HIDDEN CONTAINERS FOR OFF-SCREEN PDF GENERATION */}
      {/* Strictly conforming to baggona-pdf-layout-guard & zero offset */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 900,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          height: 0
        }}
        aria-hidden="true"
      >
        {/* 1. Janana Kundali Container */}
        <JananaKundaliPrintTemplate
          id="pkg-janana-kundali-container"
          kundli={kundliResult}
          devoteeName={devoteeName}
          gender={gender}
          birthDate={birthDate}
          birthTime={birthTime}
          placeLabel={placeLabel}
          gotra={gotra}
          lang={selectedLang}
        />

        {/* 2. Premium Bhavishya V1 Container */}
        {bhavishyaV1Payload && (
          <PdfTemplate
            ref={bhavishyaV1Ref}
            theme="sunrise"
            session={{
              result: kundliResult,
              input: {
                name: devoteeName,
                birthDate,
                birthTime,
                latitude,
                longitude,
                gender: gender === "female" ? "Female" : "Male",
                maritalStatus: "married"
              },
              birthDateYmd: birthDate,
              birthTimeHm: birthTime,
              homePlaceName: placeLabel,
              placeLabel: placeLabel,
              dasha: [],
              dailyPrediction: ""
            }}
            predictions={bhavishyaV1Payload.predictions}
            translations={bhavishyaV1Payload.translations}
            deepInsights={bhavishyaV1Payload.deepInsights}
            premiumData={bhavishyaV1Payload.premiumData}
            ageYears={bhavishyaV1Payload.ageYears}
            lang={selectedLang}
          />
        )}

        {/* 3. Daivika Parihara Container */}
        <div id="pkg-remedy-container">
          <KundliRemedyPdfTemplate
            diagnosis={remedyDiagnosis}
            lang={selectedLang}
            overridePriestName={priestName}
            overridePriestPhone={priestPhone}
          />
        </div>

        {/* 4. Doshagalu Container */}
        <KundliDoshaPdfTemplate
          id="pkg-dosha-container"
          report={doshaReport}
          lang={selectedLang}
        />

        {/* 5. Current Life Status Container */}
        <CurrentLifeStatusPdfTemplate
          id="pkg-current-life-container"
          kundli={kundliResult}
          devoteeName={devoteeName}
          birthDate={birthDate}
          birthTime={birthTime}
          placeLabel={placeLabel}
          lang={selectedLang}
          priestName={priestName}
          priestPhone={priestPhone}
        />

        {/* 6. Multi-Period QR Card Container */}
        <MultiPeriodQrCardTemplate
          id="pkg-multi-qr-container"
          devoteeName={devoteeName}
          birthDate={birthDate}
          birthTime={birthTime}
          rashiName={moonRashiName}
          nakshatraName={nakshatraName}
          priestName={priestName}
          priestPhone={priestPhone}
          poojaName={poojaName}
          poojaPlace={poojaPlace}
          qr30DataUrl={qr30Url}
          qr90DataUrl={qr90Url}
          qr120DataUrl={qr120Url}
          lang={selectedLang}
        />

        {/* 7. Divya Bhavishya Q&A Container */}
        <DivyaBhavishyaQnaPdfTemplate
          id="pkg-qna-container"
          devoteeName={devoteeName}
          birthDate={birthDate}
          birthTime={birthTime}
          rashiName={moonRashiName}
          nakshatraName={nakshatraName}
          questions={questions}
          lang={selectedLang}
        />
      </div>
    </div>
  );
}
