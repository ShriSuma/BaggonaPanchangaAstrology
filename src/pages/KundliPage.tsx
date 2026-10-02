import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { chartYogasWithPolarity, type YogaId } from "../core/KundliInsightsEngine";
import { getDailyPrediction } from "../core/PredictionEngine";
import { generateDashaTimeline, type DashaEntry } from "../core/DashaBhuktiEngine";
import { exportSvgAsPdf, exportSvgAsPng, exportElementAsPdf, exportElementAsPng, exportPanchangaWithDashaPdf, exportDashaPdf } from "../core/ExportUtils";
import { DashaPdfTemplate } from "../components/kundli/DashaPdfTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { translateText } from "../utils/translator";
import JSZip from "jszip";
import { prepareBhavishyaV1Data, captureBhavishyaV1Pdf, type BhavishyaV1Payload } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import type { KundliViewerSession } from "../stores/kundliViewerStore";
import { patrikaMetaForNakshatraIndex as import_patrikaMetaForNakshatraIndex } from "../core/nakshatraPatrikaMeta";
import { analytics } from "../core/analytics";
import { LifeGuidancePage } from "./LifeGuidancePage";
import { saveKundli, recordDailyHit } from "../db/indexedDb";
import { saveKundliToFirestore } from "../db/firestoreDb";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import KundliChart from "../components/kundli/KundliChart";
import TraditionalSouthPatrika from "../components/kundli/TraditionalSouthPatrika";
import { DashaBhuktiExplorer, LifetimeDashaBar } from "../components/kundli/DashaLifetimeChart";
import { DashaVisualization } from "../components/kundli/DashaVisualization";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import MapLocationPicker from "../components/MapLocationPicker";
import { GokarnaKundaliTemplate } from "../components/template/GokarnaKundaliTemplate";
import Card from "../components/ui/Card";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { buildNarrativeSummary, fetchKundliNarrative, NarrativeApiError } from "../services/kundliNarrativeApi";
import { localizeNarrativeText } from "../services/localizeContent";
import { BalaVidyaSuite } from "../components/kundli/BalaVidyaSuite";
import { KundliRemedyView } from "../components/kundli/KundliRemedyView";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { Kundli30DayQrCard, type KundliQrProfile } from "../components/kundli/Kundli30DayQrCard";
import QRCode from "qrcode";
import {
  generateQrPayloadByTarget,
  calculateDeterministicRhythmDay,
  getSafeProductionOrigin
} from "../features/seva/icsCalendarGenerator";
import { calculateComprehensiveDoshas, type ComprehensiveDoshaReport } from "../core/ComprehensiveDoshaEngine";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { getAllPriests, saveOrUpdatePriestProfile, type PriestProfile } from "../features/seva/sevaPriestDirectory";
import type { L5 } from "../features/seva/sevaLocale";
import { generateKundliRemedyReport, type KundliRemedyDiagnosis } from "../features/remedies/kundliRemedyEngine";
import { generateKundliRemedyWithAi } from "../features/remedies/kundliRemedyAiEngine";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { formatPickerDateLocalYmd } from "../core/birthTime";
import { GOTRA_OPTIONS, gotraI18nKey } from "../data/gotras";
import { formatNavamsaPada, formatRashiAmsha, patrikaNavamshaFromDegree } from "../core/localeNumbers";
import { isRoughIndiaRegion } from "../core/placeTime";
import { resolvePlaceFromPincode, GERMAN_MAJOR_CITIES } from "../services/locationApi";
import { useAuthStore, SUPER_ADMIN_USERNAMES } from "../features/auth/authStore";
import { DevoteeDatabaseSearchModal } from "../components/kundli/DevoteeDatabaseSearchModal";
import type { DevoteeProfile } from "../services/devoteeSearchService";
import { SpecialDivineConsultationModal } from "../components/consultation/SpecialDivineConsultationModal";

const parseYmdToDate = (ymd: string): Date | null => {
  if (!ymd) return null;
  const trimmed = ymd.trim();
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  }
  const dmy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(trimmed);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]), 12, 0, 0, 0);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function KundliPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const chartStyle = useAppStore((s) => s.chartStyle);
  const setChartStyle = useAppStore((s) => s.setChartStyle);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const setDefaultLocation = useAppStore((s) => s.setDefaultLocation);
  const narrativeConsent = useAppStore((s) => s.narrativeConsent);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);
  const setPage = useAppStore((s) => s.setPage);
  const kundliSession = useKundliViewerStore((s) => s.session);
  const draftInput = useKundliViewerStore((s) => s.draftInput);
  const setSession = useKundliViewerStore((s) => s.setSession);
  const clearKundliSession = useKundliViewerStore((s) => s.clearSession);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const traditionalExportRef = useRef<HTMLDivElement>(null);
  const dashaExportRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<"jataka" | "dasha" | "remedy" | "lifeguidance" | "balavidya">("jataka");
  const [dashaViewType, setDashaViewType] = useState<"grid" | "visualization">("grid");

  const [pdfLanguage, setPdfLanguage] = useState<string>(i18n.language);
  const [remedyPdfLanguage, setRemedyPdfLanguage] = useState<string>(i18n.language || "kn");
  const [isGeneratingRemedyPdf, setIsGeneratingRemedyPdf] = useState(false);
  const [aiRemedyDiagnosis, setAiRemedyDiagnosis] = useState<KundliRemedyDiagnosis | null>(null);
  const [isGeneratingRemedyAi, setIsGeneratingRemedyAi] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const initialSession = useKundliViewerStore.getState().session;
  const initialDraft = useKundliViewerStore.getState().draftInput;

  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [isGeneratingDashaPdf, setIsGeneratingDashaPdf] = useState(false);
  const [isGeneratingPremiumBundle, setIsGeneratingPremiumBundle] = useState(false);
  const [bundleProgress, setBundleProgress] = useState(0);
  const [bundleStageText, setBundleStageText] = useState("");
  const [isPackageSelectModalOpen, setIsPackageSelectModalOpen] = useState(false);
  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [isSpecialConsultationOpen, setIsSpecialConsultationOpen] = useState(false);
  const [packageSelectedItems, setPackageSelectedItems] = useState({
    kundli: true,
    remedy: true,
    bhavishya: true,
    dosha: true,
    qrCalendar: true
  });
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");
  const [priestNameInput, setPriestNameInput] = useState<string>(() => {
    const p = getAllPriests().find(pr => pr.id === "shreeram-pandit");
    return p?.name.kn || "ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  });
  const [priestPhoneInput, setPriestPhoneInput] = useState<string>(() => {
    const p = getAllPriests().find(pr => pr.id === "shreeram-pandit");
    return p?.phone || "9972339362";
  });

  const [bundleDownloadedPdfs, setBundleDownloadedPdfs] = useState<{
    panchanga?: { blob: Blob; fileName: string; url: string };
    remedy?: { blob: Blob; fileName: string; url: string };
    bhavishya?: { blob: Blob; fileName: string; url: string };
    dosha?: { blob: Blob; fileName: string; url: string };
    qrCalendar?: { blob: Blob; fileName: string; url: string };
    zip?: { blob: Blob; fileName: string; url: string };
  } | null>(null);
  const [qrCardDataUrl, setQrCardDataUrl] = useState<string>("");
  const [premiumBhavishyaPayload, setPremiumBhavishyaPayload] = useState<BhavishyaV1Payload | null>(null);
  const premiumBhavishyaPdfRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and listen for Escape key when modals are open
  useEffect(() => {
    if (isPackageSelectModalOpen || bundleModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (isPackageSelectModalOpen) {
            setIsPackageSelectModalOpen(false);
          } else if (bundleModalOpen && !isGeneratingPremiumBundle) {
            setBundleModalOpen(false);
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isPackageSelectModalOpen, bundleModalOpen, isGeneratingPremiumBundle]);

  const [includePriestCalendar, setIncludePriestCalendar] = useState<boolean>(
    () => initialSession?.includePriestCalendar ?? initialDraft?.includePriestCalendar ?? false
  );
  const [form, setForm] = useState<KundliInput>(() => {
    if (initialSession) return initialSession.input;
    if (initialDraft?.input) return initialDraft.input;
    return {
      name: "",
      birthDate: "",
      birthTime: "",
      latitude: defaultLat,
      longitude: defaultLng,
      gothra: "",
      gender: "Male",
      maritalStatus: undefined,
      pincode: pincodeStore || undefined
    };
  });
  const [result, setResult] = useState<KundliOutput | null>(() => initialSession?.result ?? null);
  const [dailyPrediction, setDailyPrediction] = useState<string>(() => initialSession?.dailyPrediction ?? "");
  const [dasha, setDasha] = useState<DashaEntry[]>(() => initialSession?.dasha ?? []);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");
  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(() => {
    if (initialSession?.birthDateYmd) return parseYmdToDate(initialSession.birthDateYmd);
    if (initialDraft?.birthDateYmd) return parseYmdToDate(initialDraft.birthDateYmd);
    return null;
  });
  const [birthTimeHm, setBirthTimeHm] = useState<string>(() => initialSession?.birthTimeHm ?? initialDraft?.birthTimeHm ?? "");
  const [locationCore, setLocationCore] = useState<string>(() => initialSession?.placeLabel ?? initialDraft?.placeLabel ?? placeLabelStore);
  const [homePlaceName, setHomePlaceName] = useState<string>(() => initialSession?.homePlaceName ?? initialDraft?.homePlaceName ?? "");
  const [mapOpen, setMapOpen] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");

  const placeDisplay = useMemo(
    () => (homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore),
    [homePlaceName, locationCore]
  );

  const pushPlaceToStore = (lat: number, lng: number, core: string, pin?: string) => {
    const label = homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core;
    void setDefaultLocation(lat, lng, label, pin && /^\d{6}$/.test(pin) ? pin : "");
  };

  const currentUser = useAuthStore((s) => s.currentUser);
  const role = useAuthStore((s) => s.role);
  const isSuperAdminOrBaggona = useMemo(() => {
    return Boolean(
      role === "superadmin" ||
      role === "priest" ||
      currentUser?.toLowerCase() === "baggona" ||
      (currentUser && SUPER_ADMIN_USERNAMES.some((u) => u.toLowerCase() === currentUser.toLowerCase() || u === currentUser))
    );
  }, [role, currentUser]);

  const [isDevoteeSearchModalOpen, setIsDevoteeSearchModalOpen] = useState(false);
  const [devoteeAutoFillToast, setDevoteeAutoFillToast] = useState<string>("");

  const handleSelectDevoteeFromDb = (devotee: DevoteeProfile) => {
    setIsDevoteeSearchModalOpen(false);

    // 1. Parse birth date
    const parsedDate = parseYmdToDate(devotee.birthDate);
    if (parsedDate) {
      setBirthDatePicker(parsedDate);
    }

    // 2. Format birth time (ensure HH:mm format for validation)
    let formattedTime = (devotee.birthTime || "").trim();
    const timeMatch = formattedTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      formattedTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    }
    setBirthTimeHm(formattedTime);

    // 3. Set place & coordinates
    const lat = devotee.latitude || defaultLat;
    const lng = devotee.longitude || defaultLng;
    const pin = devotee.pincode && /^\d{6}$/.test(devotee.pincode) ? devotee.pincode : undefined;
    const place = devotee.placeName || locationCore;

    setLocationCore(place);
    setHomePlaceName(place);
    pushPlaceToStore(lat, lng, place, pin);

    if (pin) {
      lastResolvedPinRef.current = pin;
    }

    // 4. Gotra matching against GOTRA_OPTIONS
    let matchedGotra = devotee.gothra?.trim() || "";
    if (matchedGotra) {
      const found = GOTRA_OPTIONS.find((g) => g.toLowerCase() === matchedGotra.toLowerCase());
      if (found) {
        matchedGotra = found;
      }
    }

    // 5. Update form state
    setForm((f) => ({
      ...f,
      name: devotee.name,
      birthDate: parsedDate ? formatPickerDateLocalYmd(parsedDate) : devotee.birthDate,
      birthTime: formattedTime,
      latitude: lat,
      longitude: lng,
      pincode: pin,
      gothra: matchedGotra,
      gender: (devotee.gender as any) || "Male",
      maritalStatus: (devotee.maritalStatus as any) || undefined
    }));

    // 6. Toast feedback
    const isKnLang = Boolean(i18n?.language?.startsWith("kn"));
    const msg = isKnLang
      ? `✅ ${devotee.name} ಅವರ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ.`
      : `✅ Filled details for ${devotee.name}.`;
    setDevoteeAutoFillToast(msg);
    setTimeout(() => setDevoteeAutoFillToast(""), 8000);

    // 7. Smoothly scroll to the top of the form so the filled details & Generate button are in clear view
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    }
  };

  const [pinResolving, setPinResolving] = useState(false);
  const pinResolveGen = useRef(0);
  const [locationEpoch, setLocationEpoch] = useState(0);
  const lastResolvedPinRef = useRef<string>(kundliSession?.input?.pincode || initialDraft?.input?.pincode || "");

  /** When PIN changes, resolve village + lat/lng immediately without wiping form fields or resetting chart. */
  useEffect(() => {
    const pin = form.pincode?.trim() ?? "";
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setPinResolving(false);
      return;
    }
    if (pin === lastResolvedPinRef.current) {
      return;
    }
    const gen = ++pinResolveGen.current;
    setLocationEpoch((e) => e + 1);
    setPinResolving(true);
    setLocationCore(`${pin} · ${t("location.loading")}`);
    void resolvePlaceFromPincode(pin)
      .then((place) => {
        if (gen !== pinResolveGen.current) return;
        if (!place) {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            const fallbackCore = "Gokarna (581326)";
            setForm((f) => ({
              ...f,
              latitude: 14.5479,
              longitude: 74.3188,
              pincode: "581326"
            }));
            setLocationCore(fallbackCore);
            lastResolvedPinRef.current = "581326";
            void setDefaultLocation(
              14.5479,
              74.3188,
              homePlaceName.trim() ? `${homePlaceName.trim()} · ${fallbackCore}` : fallbackCore,
              "581326"
            );
            return;
          }
          setLocationCore(`${pin} · ${t("location.pinNotFound")}`);
          return;
        }
        const core = `${place.villageName} (${place.pincode})`;
        setForm((f) => ({
          ...f,
          latitude: place.lat,
          longitude: place.lng,
          pincode: place.pincode
        }));
        setLocationCore(core);
        lastResolvedPinRef.current = place.pincode;
        void setDefaultLocation(
          place.lat,
          place.lng,
          homePlaceName.trim() ? `${homePlaceName.trim()} · ${core}` : core,
          place.pincode
        );
      })
      .catch(() => {
        if (gen !== pinResolveGen.current) return;
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const fallbackCore = "Gokarna (581326)";
          setForm((f) => ({
            ...f,
            latitude: 14.5479,
            longitude: 74.3188,
            pincode: "581326"
          }));
          setLocationCore(fallbackCore);
          lastResolvedPinRef.current = "581326";
          void setDefaultLocation(
            14.5479,
            74.3188,
            homePlaceName.trim() ? `${homePlaceName.trim()} · ${fallbackCore}` : fallbackCore,
            "581326"
          );
          return;
        }
        setLocationCore(`${pin} · ${t("location.pinNotFound")}`);
      })
      .finally(() => {
        if (gen === pinResolveGen.current) setPinResolving(false);
      });
  }, [form.pincode, setDefaultLocation, t]);

  const birthTimeZoneHint = useMemo(() => {
    const pin = form.pincode?.trim() ?? "";
    if (/^[1-9]\d{5}$/.test(pin) || isRoughIndiaRegion(form.latitude, form.longitude)) {
      return t("kundli.birthTimeIst");
    }
    return t("kundli.birthTimeLocal");
  }, [form.pincode, form.latitude, form.longitude, t]);

  /** Restore chart from session when store changes (e.g. returning to tab or sub-module navigation). */
  useEffect(() => {
    if (kundliSession) {
      lastResolvedPinRef.current = kundliSession.input.pincode || "";
      setForm(kundliSession.input);
      setResult(kundliSession.result);
      const bd = parseYmdToDate(kundliSession.birthDateYmd);
      if (bd) setBirthDatePicker(bd);
      setBirthTimeHm(kundliSession.birthTimeHm);
      setHomePlaceName(kundliSession.homePlaceName);
      setLocationCore(kundliSession.placeLabel);
      setDasha(kundliSession.dasha);
      setDailyPrediction(kundliSession.dailyPrediction);
      if (kundliSession.includePriestCalendar !== undefined) {
        setIncludePriestCalendar(kundliSession.includePriestCalendar);
      }
    }
  }, [kundliSession]);

  /** Persist draft inputs so unexpected browser refresh or incoming phone call doesn't wipe in-progress form inputs. */
  useEffect(() => {
    if (result) return;
    const ymd = birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : "";
    if (!form.name && !ymd && !birthTimeHm && !form.pincode) return;
    useKundliViewerStore.getState().setDraftInput({
      input: form,
      birthDateYmd: ymd,
      birthTimeHm,
      homePlaceName,
      placeLabel: locationCore,
      includePriestCalendar
    });
  }, [result, form, birthDatePicker, birthTimeHm, homePlaceName, locationCore, includePriestCalendar]);

  const [dictatingField, setDictatingField] = useState<"name" | "gothra" | "date" | "time" | null>(null);
  const startDictation = (field: "name" | "gothra" | "date" | "time") => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    // Default to Kannada if selected, else English (India) to catch Indian names/accents
    recognition.lang = i18n.language.startsWith('kn') ? 'kn-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setDictatingField(field);
    recognition.onend = () => setDictatingField(null);
    recognition.onerror = () => setDictatingField(null);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      console.log(`Dictated for ${field}:`, text);
      
      if (field === "name") {
        let foundName = text.trim();
        const nameMatch = text.match(/(?:name(?:\s+is)?|hesaru|ಹೆಸರು)\s+([a-z\u0C80-\u0CFF]+)/i);
        if (nameMatch) foundName = nameMatch[1];
        setForm(f => ({ ...f, name: foundName.charAt(0).toUpperCase() + foundName.slice(1) }));
        return;
      }
      
      if (field === "gothra") {
        let foundGothra = text.trim();
        const gothraMatch = text.match(/(?:gothra|ಗೋತ್ರ)\s+([a-z\u0C80-\u0CFF]+)|([a-z\u0C80-\u0CFF]+)\s+(?:gothra|ಗೋತ್ರ)/i);
        if (gothraMatch) foundGothra = gothraMatch[1] || gothraMatch[2];
        setForm(f => ({ ...f, gothra: foundGothra.charAt(0).toUpperCase() + foundGothra.slice(1) }));
        return;
      }

      if (field === "date") {
        let foundDate: Date | null = null;
        const knMonths = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
        const enMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "aug", "sep", "sept", "oct", "nov", "dec"];
        
        let realMonth = -1;
        for (let i = 0; i < knMonths.length; i++) {
          if (text.includes(knMonths[i])) { realMonth = i; break; }
        }
        if (realMonth === -1) {
          for (let i = 0; i < enMonths.length; i++) {
            if (text.includes(enMonths[i])) {
              realMonth = new Date(Date.parse(enMonths[i] +" 1, 2012")).getMonth();
              break;
            }
          }
        }

        if (realMonth !== -1) {
          const yearMatch = text.match(/\b(19|20)\d{2}\b/);
          const dayMatch = text.match(/\b(1st|2nd|3rd|\d{1,2}(th)?)\b/);
          
          if (yearMatch && dayMatch) {
            const dayNum = parseInt(dayMatch[0].replace(/\D/g, ''), 10);
            const yearNum = parseInt(yearMatch[0], 10);
            if (dayNum >= 1 && dayNum <= 31) {
              foundDate = new Date(yearNum, realMonth, dayNum, 12, 0, 0, 0);
            }
          }
        }
        if (foundDate) setBirthDatePicker(foundDate);
        return;
      }

      if (field === "time") {
        let foundTime = "";
        const pat1 = /(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)\s*(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?/i;
        const pat2 = /\b(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?\s*(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)/i;
        const pat3 = /\b(\d{1,2}):(\d{2})\b/i;

        let match = text.match(pat1);
        let hr = 0, mn = 0, marker = "";
        if (match) {
            marker = match[1].toLowerCase();
            hr = parseInt(match[2], 10);
            mn = match[3] ? parseInt(match[3], 10) : 0;
        } else {
            match = text.match(pat2);
            if (match) {
                hr = parseInt(match[1], 10);
                mn = match[2] ? parseInt(match[2], 10) : 0;
                marker = match[3].toLowerCase();
            } else {
                match = text.match(pat3);
                if (match) {
                    hr = parseInt(match[1], 10);
                    mn = parseInt(match[2], 10);
                }
            }
        }

        if (match) {
          const normMarker = marker.trim().toLowerCase();
          if (normMarker === "ರಾತ್ರಿ" || normMarker === "night") {
            if (hr === 12) {
              hr = 0; // "ರಾತ್ರಿ 12:45" -> 00:45 (Midnight)
            } else if (hr >= 1 && hr <= 3) {
              hr = hr; // 01:00 - 03:59 (AM)
            } else if (hr >= 4 && hr < 12) {
              hr += 12; // 16:00 - 23:59 (PM)
            }
          } else if (normMarker === "ಮಧ್ಯಾಹ್ನ" || normMarker === "afternoon" || normMarker === "ಸಂಜೆ" || normMarker === "evening" || normMarker === "pm") {
            if (hr < 12) hr += 12;
          } else if (normMarker === "ಬೆಳಿಗ್ಗೆ" || normMarker === "ಬೆಳಗ್ಗೆ" || normMarker === "morning" || normMarker === "am") {
            if (hr === 12) hr = 0;
          }
          
          if (hr >= 0 && hr <= 23 && mn >= 0 && mn <= 59) {
            foundTime = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
          }
        }
        if (foundTime) setBirthTimeHm(foundTime);
      }
    };

    recognition.start();
  };

  /** Sync default place from settings when no active chart session (skip while PIN is resolving or if user entered a PIN). */
  useEffect(() => {
    if (kundliSession || pinResolving) return;
    const pin = form.pincode?.trim() ?? "";
    if (pin.length > 0) return;
    if (form.latitude !== defaultLat || form.longitude !== defaultLng) return;
    setLocationCore((prev) => (prev ? prev : placeLabelStore));
  }, [kundliSession, pinResolving, form.pincode, defaultLat, defaultLng, placeLabelStore]);

  const onGenerate = async () => {
    if (!form.name || !birthDatePicker || !birthTimeHm.trim()) {
      setError(t("kundli.requiredFields"));
      return;
    }
    if (!/^\d{1,2}:\d{2}$/.test(birthTimeHm.trim())) {
      setError(t("kundli.requiredFields"));
      return;
    }
    let pin = form.pincode?.trim() || "";
    let lat = form.latitude;
    let lng = form.longitude;
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    if (!pin || !/^[1-9]\d{5}$/.test(pin)) {
      if (isOffline) {
        pin = "581326";
        lat = 14.5479;
        lng = 74.3188;
      } else {
        setError(t("kundli.pincodeRequired"));
        return;
      }
    }

    if (isOffline && (!lat || !lng)) {
      lat = 14.5479;
      lng = 74.3188;
    }

    const birthDate = formatPickerDateLocalYmd(birthDatePicker);
    const birthTime = birthTimeHm.trim();
    const payload: KundliInput = {
      ...form,
      latitude: lat,
      longitude: lng,
      pincode: pin,
      birthDate,
      birthTime
    };

    setError("");
    const output = await calculateKundliWithPlaceSun(payload, { ayanamsaModel, nodeType });
    setResult(output);
    const birthCtx = {
      birthDate,
      birthTime,
      latitude: form.latitude,
      longitude: form.longitude,
      ayanamsaModel
    };
    const dp = getDailyPrediction(output, new Date(), t, form.name, birthCtx);
    const dashaTimeline = generateDashaTimeline(output);
    const predText = [dp.summary, dp.dashaLine, dp.timingLine].filter(Boolean).join("\n\n");
    setDailyPrediction(predText);
    setDasha(dashaTimeline);
    setSession({
      result: output,
      input: payload,
      birthDateYmd: birthDate,
      birthTimeHm: birthTime,
      homePlaceName,
      placeLabel: homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore,
      dasha: dashaTimeline,
      dailyPrediction: predText,
      includePriestCalendar
    });
    try {
      localStorage.setItem("baggona_kundli_session", JSON.stringify({
        name: form.name,
        birthDate: birthDate,
        birthTime: birthTime,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        nakshatraIndex: output.planets.find(p => p.name === "Moon")?.nakshatra.index,
        rashiIndex: output.planets.find(p => p.name === "Moon")?.rashi.index,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
        includePriestCalendar
      }));
    } catch {
      // Ignore
    }
    const id = await saveKundli(payload, output);
    setSavedId(id);
    setNarrative("");
    setNarrativeError("");
    await analytics.track("kundli_generated");
    await recordDailyHit();

    // Cloud Firestore Sync with Discrete Columns
    const moonPlanet = output.planets.find((p) => p.name === "Moon");
    const nakshatraName = moonPlanet?.nakshatra?.english || "Ashwini";
    const nakshatraKn = moonPlanet?.nakshatra?.sanskrit || "";

    void saveKundliToFirestore({
      id,
      userId: "priest_shreeram",
      priestName: "Shreeram Pandit",
      name: payload.name || "Devotee",
      gender: payload.gender || form.gender,
      maritalStatus: payload.maritalStatus || form.maritalStatus,
      birthDate: payload.birthDate,
      birthTime: payload.birthTime,
      placeName: placeLabelStore || "Custom Location",
      latitude: payload.latitude,
      longitude: payload.longitude,
      pincode: payload.pincode,
      gothra: payload.gothra?.trim() || undefined,
      rashi: output.moonSign.english,
      rashiSanskrit: output.moonSign.sanskrit,
      nakshatra: nakshatraName,
      nakshatraSanskrit: nakshatraKn,
      pada: output.moonPada,
      lagnaRashi: output.lagnaRashi.english,
      sunSign: output.sunSign.english,
      planetsSummary: output.planets.map((pl) => ({
        name: pl.name,
        degree: pl.degree,
        rashi: pl.rashi.english,
        house: pl.house,
        isRetrograde: pl.isRetrograde
      })),
      kundliData: output,
      createdAt: new Date().toISOString()
    });
  };

  const summaryText = useMemo(() => {
    if (!result) return "";
    return t("kundli.shareSummary", {
      name: form.name,
      lagna: t(`rashis.${result.lagnaRashi.sanskrit}` as "rashis.Mesha"),
      moon: t(`rashis.${result.moonSign.sanskrit}` as "rashis.Mesha")
    });
  }, [form.name, result, t]);

  const chartYogas = useMemo(
    () => (result ? chartYogasWithPolarity(result) : []),
    [result]
  );

  const traditionalData = useMemo(() => {
    if (!birthDatePicker || !birthTimeHm.trim()) return null;
    return calculateTraditionalBaggona(
      birthDatePicker ? format(birthDatePicker, 'yyyy-MM-dd') : "",
      birthTimeHm,
      form.latitude,
      form.longitude,
      ayanamsaModel,
      form.pincode
    );
  }, [birthDatePicker, birthTimeHm, form.latitude, form.longitude, ayanamsaModel, form.pincode]);

  const isDayBirthComputed = useMemo(() => {
    if (!birthDatePicker) return true;
    const h = birthDatePicker.getHours();
    const m = birthDatePicker.getMinutes();
    const birthMins = h * 60 + m;

    let sunriseMins = 6 * 60;
    let sunsetMins = 18 * 60;

    if (traditionalData?.sunrise && traditionalData.sunrise.includes(":")) {
      const parts = traditionalData.sunrise.split(":");
      const sh = parseInt(parts[0] || "6", 10);
      const sm = parseInt(parts[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunriseMins = sh * 60 + sm;
    }

    if (traditionalData?.sunset && traditionalData.sunset.includes(":")) {
      const parts = traditionalData.sunset.split(":");
      const sh = parseInt(parts[0] || "18", 10);
      const sm = parseInt(parts[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunsetMins = sh * 60 + sm;
    }

    return birthMins >= sunriseMins && birthMins < sunsetMins;
  }, [birthDatePicker, traditionalData?.sunrise, traditionalData?.sunset]);

  const gotraDisplay = useMemo(() => {
    const v = (form.gothra ?? "").trim();
    if (!v) return "";
    const key = gotraI18nKey(v);
    const label = t(key as "gotras.Vasishtha");
    return label === key ? v : label;
  }, [form.gothra, t]);

  const remedyDiagnosis = useMemo(() => {
    if (!result || !birthDatePicker || !birthTimeHm.trim()) return null;
    const input: KundliInput = {
      birthDate: formatPickerDateLocalYmd(birthDatePicker),
      birthTime: birthTimeHm.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      name: form.name || "Devotee",
      gender: form.gender,
      gothra: gotraDisplay || form.gothra
    };
    return generateKundliRemedyReport(result, input);
  }, [result, birthDatePicker, birthTimeHm, form.latitude, form.longitude, form.name, form.gender, form.gothra, gotraDisplay]);

  const effectiveRemedyDiagnosis = aiRemedyDiagnosis || remedyDiagnosis;

  useEffect(() => {
    setAiRemedyDiagnosis(null);
  }, [result]);

  // Trigger AI Narration for remedies with 10 retries
  useEffect(() => {
    if (activeView !== "remedy" || !result || !remedyDiagnosis) return;
    if (aiRemedyDiagnosis?.isAiGenerated && aiRemedyDiagnosis.aiNarrationText?.[remedyPdfLanguage]) return;

    let isMounted = true;
    setIsGeneratingRemedyAi(true);

    const input: KundliInput = {
      birthDate: formatPickerDateLocalYmd(birthDatePicker!),
      birthTime: birthTimeHm.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      name: form.name || "Devotee",
      gender: form.gender,
      gothra: gotraDisplay || form.gothra
    };

    generateKundliRemedyWithAi({
      kundli: result,
      input,
      lang: remedyPdfLanguage,
      baseDiagnosis: remedyDiagnosis,
      maxAttempts: 10
    })
      .then((enriched) => {
        if (isMounted) {
          setAiRemedyDiagnosis(enriched);
          setIsGeneratingRemedyAi(false);
        }
      })
      .catch((err) => {
        console.warn("[KundliPage] Remedy AI generation error:", err);
        if (isMounted) {
          setIsGeneratingRemedyAi(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeView, result, remedyDiagnosis, remedyPdfLanguage]);

  const effectiveSession: KundliViewerSession | null = useMemo(() => {
    if (kundliSession) return kundliSession;
    if (!result || !birthDatePicker || !birthTimeHm.trim()) return null;
    const bdYmd = formatPickerDateLocalYmd(birthDatePicker);
    const btHm = birthTimeHm.trim();
    const dashaTimeline = dasha || generateDashaTimeline(result);
    return {
      result,
      input: {
        ...form,
        birthDate: bdYmd,
        birthTime: btHm,
        name: form.name || "Devotee",
        latitude: form.latitude,
        longitude: form.longitude
      },
      birthDateYmd: bdYmd,
      birthTimeHm: btHm,
      homePlaceName,
      placeLabel: homePlaceName.trim() ? `${homePlaceName.trim()} · ${locationCore}` : locationCore,
      dasha: dashaTimeline,
      dailyPrediction: dailyPrediction || "",
      includePriestCalendar
    };
  }, [kundliSession, result, birthDatePicker, birthTimeHm, form, dasha, homePlaceName, locationCore, dailyPrediction, includePriestCalendar]);

  const handleDownloadRemedyPdf = async (langToUse?: string) => {
    const chosenLang = langToUse || remedyPdfLanguage || "kn";
    setRemedyPdfLanguage(chosenLang);
    setIsGeneratingRemedyPdf(true);
    try {
      let diagToUse = effectiveRemedyDiagnosis;
      if (result && birthDatePicker && birthTimeHm.trim()) {
        if (!diagToUse?.isAiGenerated || !diagToUse?.aiNarrationText?.[chosenLang]) {
          const input: KundliInput = {
            birthDate: formatPickerDateLocalYmd(birthDatePicker),
            birthTime: birthTimeHm.trim(),
            latitude: form.latitude,
            longitude: form.longitude,
            name: form.name || "Devotee",
            gender: form.gender,
            gothra: gotraDisplay || form.gothra
          };
          diagToUse = await generateKundliRemedyWithAi({
            kundli: result,
            input,
            lang: chosenLang,
            baseDiagnosis: diagToUse,
            maxAttempts: 10
          });
          setAiRemedyDiagnosis(diagToUse);
        }
      }
      await new Promise((r) => setTimeout(r, 400));
      const safeName = (form.name || "Kundli").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
      await generatePDFFromElement(
        "kundli-remedy-pdf-container",
        `${safeName}_Kundli_Remedy_Report_${chosenLang}.pdf`
      );
    } catch (err) {
      console.error("Failed to generate Kundli Remedy PDF:", err);
    } finally {
      setIsGeneratingRemedyPdf(false);
    }
  };

  const qrCardProfile: KundliQrProfile = useMemo(() => {
    const moon = result?.planets.find((p: any) => p.name === "Moon");
    const moonNakIdx = moon?.nakshatra?.index ?? 0;
    const moonRashiIdx = result?.moonSign?.index ?? moon?.rashi?.index ?? 0;
    const dashaTimeline = dasha && dasha.length > 0 ? dasha : (result ? generateDashaTimeline(result) : []);
    const activeDasha = dashaTimeline?.[0]?.planet || "";
    const lagnaLabel = result?.lagnaRashi ? (t(`rashis.${result.lagnaRashi.sanskrit}` as any) || result.lagnaRashi.english) : "";
    const moonSignLabel = result?.moonSign ? (t(`rashis.${result.moonSign.sanskrit}` as any) || result.moonSign.english) : "";
    const moonNakLabel = moon?.nakshatra ? (t(`nakshatras.${moon.nakshatra.sanskrit}` as any) || moon.nakshatra.english) : "";
    const moonPadaNum = result?.moonPada ?? 1;

    return {
      name: form.name || "Devotee",
      birthDate: effectiveSession?.birthDateYmd || form.birthDate || "",
      birthTime: effectiveSession?.birthTimeHm || form.birthTime || "",
      lagnaSign: lagnaLabel,
      lagnaSanskrit: result?.lagnaRashi?.sanskrit || "",
      moonSign: moonSignLabel,
      moonSanskrit: result?.moonSign?.sanskrit || "",
      moonNakshatra: moonNakLabel,
      moonPada: `ಪಾದ ${moonPadaNum}`,
      currentMahadasha: activeDasha,
      currentBhukti: activeDasha,
      moonNakshatraIndex: moonNakIdx,
      moonRashiIndex: moonRashiIdx
    };
  }, [form, result, dasha, effectiveSession, t]);

  // Pre-generate QR Code data URL for 30-day calendar whenever profile or priest details change
  useEffect(() => {
    if (!result) return;
    try {
      const nakIdx = qrCardProfile.moonNakshatraIndex ?? 0;
      const rashiIdx = qrCardProfile.moonRashiIndex ?? 0;
      const rhythmDays = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx);
      });

      const currentPriestName = priestNameInput || "Shreeram Pandit";
      const currentPriestPhone = priestPhoneInput || "9972339362";

      const qrPayload = generateQrPayloadByTarget("google", {
        days: rhythmDays,
        lang: pdfLanguage,
        panditName: currentPriestName,
        priestPhone: currentPriestPhone,
        overrideCalendarPhone: true,
        notificationTime: "07:00",
        personName: qrCardProfile.name,
        pincode: "581326",
        lat: 14.54,
        lng: 74.31,
        locationName: homePlaceName.trim() || locationCore || "Gokarna",
        dob: qrCardProfile.birthDate,
        tob: qrCardProfile.birthTime,
        birthNakshatraIndex: nakIdx,
        birthRashiIndex: rashiIdx
      });

      QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 320,
        color: { dark: "#78350F", light: "#FFFFFF" }
      }).then((url) => setQrCardDataUrl(url)).catch(() => {});
    } catch {
      // Ignored
    }
  }, [result, qrCardProfile, pdfLanguage, priestNameInput, priestPhoneInput, homePlaceName, locationCore]);

  const doshaReport: ComprehensiveDoshaReport | null = useMemo(() => {
    if (!effectiveSession?.result || !effectiveSession?.input) return null;
    return calculateComprehensiveDoshas(effectiveSession.result, effectiveSession.input, new Date());
  }, [effectiveSession]);

  const handlePriestSelect = (id: string) => {
    setSelectedPriestId(id);
    if (id === "new_priest") {
      setPriestNameInput("");
      setPriestPhoneInput("");
    } else {
      const p = priestsList.find(pr => pr.id === id);
      if (p) {
        const langKey = (pdfLanguage.split("-")[0] as keyof L5) || "kn";
        setPriestNameInput(p.name[langKey] || p.name.kn || p.name.en || "");
        setPriestPhoneInput(p.phone || "");
      }
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setPdfLanguage(newLang);
    setRemedyPdfLanguage(newLang);
    if (selectedPriestId !== "new_priest") {
      const p = priestsList.find(pr => pr.id === selectedPriestId);
      if (p) {
        const langKey = (newLang.split("-")[0] as keyof L5) || "kn";
        setPriestNameInput(p.name[langKey] || p.name.kn || p.name.en || "");
      }
    }
  };

  const savePriestToDatabase = async () => {
    const cleanName = priestNameInput.trim();
    const cleanPhone = priestPhoneInput.trim();
    if (!cleanName && !cleanPhone) return;

    try {
      const res = await saveOrUpdatePriestProfile({
        id: selectedPriestId === "new_priest" ? undefined : selectedPriestId,
        name: cleanName,
        phone: cleanPhone,
        lang: pdfLanguage
      });
      const updatedList = getAllPriests();
      setPriestsList(updatedList);
      if (res.profile?.id) {
        setSelectedPriestId(res.profile.id);
      }
    } catch (e) {
      console.warn("Failed to persist priest details:", e);
    }
  };

  const handleOpenPackageSelection = () => {
    if (!result || !birthDatePicker || !birthTimeHm.trim()) return;
    setIsPackageSelectModalOpen(true);
  };

  const handleConfirmPremiumBundleDownload = async () => {
    if (!result || !birthDatePicker || !birthTimeHm.trim() || isGeneratingPremiumBundle) return;

    const atLeastOne =
      packageSelectedItems.kundli ||
      packageSelectedItems.remedy ||
      packageSelectedItems.bhavishya ||
      packageSelectedItems.dosha ||
      packageSelectedItems.qrCalendar;

    if (!atLeastOne) {
      alert(
        i18n.language.startsWith("kn")
          ? "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
          : "Please select at least one document to include in the package."
      );
      return;
    }

    setIsPackageSelectModalOpen(false);
    setIsGeneratingPremiumBundle(true);
    setBundleProgress(5);
    setBundleModalOpen(true);
    setBundleDownloadedPdfs(null);

    // Save or update priest details in Firestore & LocalStorage if QR card is selected
    if (packageSelectedItems.qrCalendar) {
      await savePriestToDatabase();
    }

    const safeName = (form.name || "Devotee").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
    const safePriest = (priestNameInput || "Shreeram_Pandit").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
    const todayStr = new Date().toISOString().slice(0, 10);
    const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
    const langName = langNames[pdfLanguage] || "Kannada";

    const zip = new JSZip();
    let pdf1Blob: Blob | null = null;
    let pdf2Blob: Blob | null = null;
    let pdf3Blob: Blob | null = null;
    let pdf4Blob: Blob | null = null;
    let pdf5Blob: Blob | null = null;

    const pdf1FileName = `1_Baggona_Janana_Kundali_${langName}_${safeName}.pdf`;
    const pdf2FileName = `2_Baggona_Daivika_Parihara_${langName}_${safeName}.pdf`;
    const pdf3FileName = `3_Baggona_Divya_Bhavishya_V1_${langName}_${safeName}.pdf`;
    const pdf4FileName = `4_Baggona_Kundli_Doshas_${langName}_${safeName}.pdf`;
    const pdf5FileName = `5_Baggona_30Day_Muhurtha_QR_${langName}_${safeName}.pdf`;

    try {
      // 1. Baggona Janana Kundali & Dasha PDF
      if (packageSelectedItems.kundli) {
        setBundleProgress(15);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "೧/೫ ಜನನ ಕುಂಡಲಿ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿ ಪಿಡಿಎಫ್ ರಚನೆ..."
            : pdfLanguage === "hi"
            ? "1/5 जन्म कुंडली एवं दशा-भुक्ति पीडीएफ निर्माण..."
            : "1/5 Generating Baggona Janana Kundali & Dasha PDF..."
        );

        const el = traditionalExportRef.current;
        const dashaEl = dashaExportRef.current;

        if (pdfLanguage !== "kn" && traditionalData) {
          const yoniMeta = import_patrikaMetaForNakshatraIndex(result.planets.find((p: any) => p.name === "Moon")?.nakshatra.index || 0);
          const keys = [
            "samvatsara", "masa", "paksha", "tithi", "weekday", "sunNakshatra", "moonNakshatra", "yoga", "karana", "sankrantiSign",
            "yoni", "gana", "nadi", "label_yoni", "label_gana", "label_nadi", "label_footer"
          ];
          const texts = [
            traditionalData.samvatsaraKn, traditionalData.masaKn, traditionalData.pakshaKn, traditionalData.tithiKn, traditionalData.weekdayKn, 
            traditionalData.sunNakshatraKn, traditionalData.moonNakshatraKn, traditionalData.yogaKn, traditionalData.karanaKn, traditionalData.sankrantiSignKn,
            yoniMeta.yoniKn, yoniMeta.ganaKn, yoniMeta.nadiKn, "ಯೋನಿ", "ಗಣ", "ನಾಡಿ", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು"
          ];
          const translated = await Promise.all(texts.map(txt => translateText(txt, pdfLanguage === "en" ? "en-US" : pdfLanguage + "-IN")));
          const newVals: Record<string, string> = {};
          keys.forEach((k, i) => newVals[k] = translated[i]);
          setDynamicValues(newVals);
          await new Promise(r => setTimeout(r, 400));
        }

        if (el && dashaEl) {
          const pdf1 = await exportPanchangaWithDashaPdf(el, dashaEl, pdf1FileName.replace(/\.pdf$/, ""), false);
          pdf1Blob = pdf1.output("blob");
        } else if (el) {
          const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#fffdf8", logging: false });
          const pngData = canvas.toDataURL("image/jpeg", 0.75);
          const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const margin = 36;
          const drawW = pageW - margin * 2;
          const drawH = (canvas.height * drawW) / canvas.width;
          pdf.addImage(pngData, "JPEG", margin, margin, drawW, Math.min(drawH, pageH - margin * 2));
          pdf1Blob = pdf.output("blob");
        }
      }

      // 2. Daivika Parihara Remedy PDF
      if (packageSelectedItems.remedy) {
        setBundleProgress(35);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "೨/೫ ದೈವಿಕ ಪರಿಹಾರ ವರದಿ ಪಿಡಿಎಫ್ ಮುದ್ರಣ (AI ನಿರೂಪಣೆ ಪರಿಶೀಲನೆ)..."
            : pdfLanguage === "hi"
            ? "2/5 दैविक परिहार रिपोर्ट पीडीएफ मुद्रण (AI विवरण)..."
            : "2/5 Generating Daivika Parihara Remedy Report PDF (AI Narration)..."
        );

        setRemedyPdfLanguage(pdfLanguage);
        let diagToUse = effectiveRemedyDiagnosis;
        if (result && birthDatePicker && birthTimeHm.trim()) {
          if (!diagToUse?.isAiGenerated || !diagToUse?.aiNarrationText?.[pdfLanguage]) {
            const input: KundliInput = {
              birthDate: formatPickerDateLocalYmd(birthDatePicker),
              birthTime: birthTimeHm.trim(),
              latitude: form.latitude,
              longitude: form.longitude,
              name: form.name || "Devotee",
              gender: form.gender,
              gothra: gotraDisplay || form.gothra
            };
            diagToUse = await generateKundliRemedyWithAi({
              kundli: result,
              input,
              lang: pdfLanguage,
              baseDiagnosis: diagToUse,
              maxAttempts: 10
            });
            setAiRemedyDiagnosis(diagToUse);
          }
        }
        await new Promise((r) => setTimeout(r, 500));

        const pdf2 = await generatePDFFromElement("kundli-remedy-pdf-container", pdf2FileName, false);
        pdf2Blob = pdf2.output("blob");
      }

      // 3. Baggona Divya Bhavishya V1 PDF
      if (packageSelectedItems.bhavishya) {
        setBundleProgress(55);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "೩/೫ ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ V1 ಸಮಗ್ರ ೧೦-ಅಧ್ಯಾಯಗಳ ಗಣನೆ..."
            : pdfLanguage === "hi"
            ? "3/5 बग्गोण दिव्य भविष्य V1 संपूर्ण १०-अध्यायों का विश्लेषण..."
            : "3/5 Preparing Baggona Divya Bhavishya V1 (10 Chapters)..."
        );

        if (!effectiveSession) throw new Error("Kundli session not available");

        const geminiKey = useAppStore.getState().geminiApiKey || "";
        const bhavishyaPayload = await prepareBhavishyaV1Data(
          effectiveSession,
          pdfLanguage,
          geminiKey,
          {
            maritalStatus: form.maritalStatus || "general",
            childrenStatus: "general"
          },
          (progress, stageText) => {
            const scaled = 55 + Math.floor((progress / 100) * 15);
            setBundleProgress(scaled);
            setBundleStageText(stageText);
          }
        );

        setPremiumBhavishyaPayload(bhavishyaPayload);
        await new Promise(r => setTimeout(r, 1200));

        if (!premiumBhavishyaPdfRef.current) {
          throw new Error("Bhavishya PDF container not found");
        }

        setBundleProgress(70);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "ಅಧಿಕೃತ ಭವಿಷ್ಯ ಮುದ್ರಣ ಪುಟಗಳ ವಿನ್ಯಾಸ..."
            : pdfLanguage === "hi"
            ? "आधिकारिक भविष्य मुद्रण पृष्ठ निर्माण..."
            : "Rendering High-Resolution Baggona Bhavishya V1 Document..."
        );

        const pdf3 = await captureBhavishyaV1Pdf(premiumBhavishyaPdfRef.current, pdf3FileName, false);
        pdf3Blob = pdf3.output("blob");
      }

      // 4. Kundli Comprehensive Doshas PDF
      if (packageSelectedItems.dosha && doshaReport) {
        setBundleProgress(78);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "೪/೫ ಕುಂಡಲಿ ಸಮಗ್ರ ದೋಷಗಳ ವರದಿ ಪಿಡಿಎಫ್ ಮುದ್ರಣ..."
            : pdfLanguage === "hi"
            ? "4/5 कुंडली समग्र दोष रिपोर्ट पीडीएफ मुद्रण..."
            : "4/5 Generating Kundli Comprehensive Doshas Report PDF..."
        );

        await new Promise(r => setTimeout(r, 500));
        const pdf4 = await generatePDFFromElement("kundli-doshas-pdf-container", pdf4FileName, false);
        pdf4Blob = pdf4.output("blob");
      }

      // 5. Next 30-Day Auspicious Calendar QR Card PDF
      if (packageSelectedItems.qrCalendar) {
        setBundleProgress(88);
        setBundleStageText(
          pdfLanguage === "kn"
            ? "೫/೫ ಮುಂದಿನ 30-ದಿನಗಳ ಮುಹೂರ್ತ QR ಕಾರ್ಡ್ ಮುದ್ರಣ..."
            : pdfLanguage === "hi"
            ? "5/5 अगले ३०-दिनों का मुहूर्त क्यूआर कार्ड निर्माण..."
            : "5/5 Generating 30-Day Auspicious Calendar QR Card PDF..."
        );

        try {
          const nakIdx = qrCardProfile.moonNakshatraIndex ?? 0;
          const rashiIdx = qrCardProfile.moonRashiIndex ?? 0;
          const rhythmDays = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const ymd = d.toISOString().slice(0, 10);
            return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx);
          });

          const currentPriestName = priestNameInput || "Shreeram Pandit";
          const currentPriestPhone = priestPhoneInput || "9972339362";

          const qrPayload = generateQrPayloadByTarget("google", {
            days: rhythmDays,
            lang: pdfLanguage,
            panditName: currentPriestName,
            priestPhone: currentPriestPhone,
            overrideCalendarPhone: true,
            notificationTime: "07:00",
            personName: qrCardProfile.name,
            pincode: "581326",
            lat: 14.54,
            lng: 74.31,
            locationName: homePlaceName.trim() || locationCore || "Gokarna",
            dob: qrCardProfile.birthDate,
            tob: qrCardProfile.birthTime,
            birthNakshatraIndex: nakIdx,
            birthRashiIndex: rashiIdx
          });

          let qrData = "";
          try {
            qrData = await QRCode.toDataURL(qrPayload, {
              errorCorrectionLevel: "L",
              margin: 2,
              width: 320,
              color: { dark: "#78350F", light: "#FFFFFF" }
            });
          } catch (qrErr) {
            console.warn("[KundliPage] QR generation fallback:", qrErr);
            const fallback = `${getSafeProductionOrigin()}/daily?action=ics&lang=${pdfLanguage}&priestPhone=${encodeURIComponent(currentPriestPhone)}`;
            qrData = await QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 320 });
          }

          setQrCardDataUrl(qrData);
        } catch (e) {
          console.error("[KundliPage] Error generating QR data URL:", e);
        }

        await new Promise(r => setTimeout(r, 600));
        const pdf5 = await generatePDFFromElement("kundli-30day-qr-container", pdf5FileName, false);
        pdf5Blob = pdf5.output("blob");
      }

      // 6. Packaging into ZIP
      setBundleProgress(95);
      setBundleStageText(
        pdfLanguage === "kn"
          ? "ಆಯ್ಕೆಮಾಡಿದ ಎಲ್ಲಾ ಪಿಡಿಎಫ್‌ಗಳನ್ನು ಜಿಪ್ ಕಡತವಾಗಿ ಸಂಯೋಜಿಸಲಾಗುತ್ತಿದೆ..."
          : pdfLanguage === "hi"
          ? "चयनित सभी आधिकारिक पीडीएफ का ज़िप बंडल तैयार हो रहा है..."
          : "Packaging selected PDFs into a single ZIP bundle..."
      );

      if (pdf1Blob) zip.file(pdf1FileName, pdf1Blob);
      if (pdf2Blob) zip.file(pdf2FileName, pdf2Blob);
      if (pdf3Blob) zip.file(pdf3FileName, pdf3Blob);
      if (pdf4Blob) zip.file(pdf4FileName, pdf4Blob);
      if (pdf5Blob) zip.file(pdf5FileName, pdf5Blob);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFileName = `${safeName}_${safePriest}_${todayStr}.zip`;

      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 1500);

      setBundleDownloadedPdfs({
        panchanga: pdf1Blob ? { blob: pdf1Blob, fileName: pdf1FileName, url: URL.createObjectURL(pdf1Blob) } : undefined,
        remedy: pdf2Blob ? { blob: pdf2Blob, fileName: pdf2FileName, url: URL.createObjectURL(pdf2Blob) } : undefined,
        bhavishya: pdf3Blob ? { blob: pdf3Blob, fileName: pdf3FileName, url: URL.createObjectURL(pdf3Blob) } : undefined,
        dosha: pdf4Blob ? { blob: pdf4Blob, fileName: pdf4FileName, url: URL.createObjectURL(pdf4Blob) } : undefined,
        qrCalendar: pdf5Blob ? { blob: pdf5Blob, fileName: pdf5FileName, url: URL.createObjectURL(pdf5Blob) } : undefined,
        zip: { blob: zipBlob, fileName: zipFileName, url: zipUrl }
      });

      setBundleProgress(100);
      setBundleStageText(
        pdfLanguage === "kn"
          ? "🎉 ಪ್ರೀಮಿಯಂ ಬಂಡಲ್ ಡೌನ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡಿದೆ!"
          : pdfLanguage === "hi"
          ? "🎉 प्रीमियम बंडल डाउनलोड सफलतापूर्वक पूर्ण हुआ!"
          : "🎉 Baggona Premium Bundle Ready!"
      );
    } catch (err: any) {
      console.error("Premium bundle generation failed:", err);
      alert(err?.message || "Failed to generate Premium Bundle. Please try again.");
      setBundleModalOpen(false);
    } finally {
      setIsGeneratingPremiumBundle(false);
    }
  };

  const handlePremiumDownload = handleOpenPackageSelection;

  const narrativeUrlConfigured = Boolean(import.meta.env.VITE_NARRATIVE_API_URL);
  const narrativeReady = narrativeConsent && narrativeUrlConfigured;

  const onDetailsAboutMe = async () => {
    if (!result || !birthDatePicker || !birthTimeHm.trim()) return;
    if (!narrativeReady) return;
    setNarrativeLoading(true);
    setNarrativeError("");
    try {
      const birthDate = formatPickerDateLocalYmd(birthDatePicker);
      const birthTime = birthTimeHm.trim();
      const body = buildNarrativeSummary({ name: form.name, birthDate, birthTime }, result, i18n.language);
      const text = await fetchKundliNarrative(body);
      const localized = await localizeNarrativeText(text, i18n.language);
      setNarrative(localized);
    } catch (e) {
      let msg = e instanceof NarrativeApiError ? e.message : (e as Error).message;
      if (e instanceof NarrativeApiError && /missing/i.test(msg)) {
        msg = t("kundli.detailsMissingUrl");
      }
      setNarrativeError(msg || t("kundli.detailsError"));
    } finally {
      setNarrativeLoading(false);
    }
  };

  const fillTestKundali = () => {
    const testDate = new Date(1993, 4, 31, 9, 25, 0);
    setForm(f => ({
      ...f,
      name: "Shreeram Pandit",
      birthDate: "1993-05-31",
      birthTime: "09:25",
      gothra: "Vasishtha",
      gender: "Male"
    }));
    setBirthDatePicker(testDate);
    setBirthTimeHm("09:25");
  };

  return (
    <Card>
      {!(result && birthDatePicker && birthTimeHm.trim()) ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-indigo-950">{t("kundli.formTitle")}</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600">{t("kundli.subtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isSuperAdminOrBaggona && (
                <button
                  type="button"
                  onClick={() => setIsDevoteeSearchModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all"
                  title={i18n.language.startsWith("kn") ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಹೆಸರು ಹುಡುಕಿ" : "Search Devotee from Database"}
                >
                  <span className="text-base">🏛️</span>
                  <span>
                    {i18n.language.startsWith("kn")
                      ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಹುಡುಕಾಟ"
                      : "Search Devotee from Database"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-950/20 text-slate-950 text-[10px] font-black uppercase border border-amber-950/20">
                    🎙️ {i18n.language.startsWith("kn") ? "ಮೈಕ್" : "Mic"}
                  </span>
                </button>
              )}
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={fillTestKundali}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-sm transition"
                >
                  <span>⚡</span>
                  <span>Fill Test (Shreeram Pandit)</span>
                </button>
              )}
            </div>
          </div>
          {devoteeAutoFillToast && (
            <div className="mb-3 p-2.5 sm:p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/95 text-emerald-950 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm animate-fadeIn">
              <span className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span>{devoteeAutoFillToast}</span>
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => void onGenerate()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-amber-200 text-xs font-black shadow-sm flex items-center gap-1.5 active:scale-95 transition"
                >
                  <span>⚡</span>
                  <span>{i18n.language.startsWith("kn") ? "ಕುಂಡಲಿ ರಚಿಸಿ" : "Create Kundali"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevoteeAutoFillToast("")}
                  className="text-emerald-700 hover:text-emerald-950 text-xs px-2 py-1 font-bold"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900/70">{t("kundli.name")}</p>
                <div className="flex items-center gap-1.5">
                  {isSuperAdminOrBaggona && (
                    <button
                      type="button"
                      onClick={() => setIsDevoteeSearchModalOpen(true)}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 active:scale-95 transition flex items-center gap-1 shadow-2xs"
                      title={i18n.language.startsWith("kn") ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಆಯ್ಕೆ" : "Select from Devotee Database"}
                    >
                      <span>🏛️</span>
                      <span>{i18n.language.startsWith("kn") ? "ಡೇಟಾಬೇಸ್" : "Database"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    title="Dictate Name"
                    onClick={() => startDictation("name")}
                    className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "name" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                  >
                    <span role="img" aria-label="microphone">🎤</span> 
                  </button>
                </div>
              </div>
              <input
                data-testid="kundli-name-input"
                placeholder={t("kundli.name")}
                className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm"
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, name: v }));
                }}
              />
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-900/70">{t("kundli.gothra")}</p>
                <button
                  type="button"
                  title="Dictate Gotra"
                  onClick={() => startDictation("gothra")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "gothra" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <select
                aria-label={t("kundli.gothra")}
                className="w-full jk-touch-input min-h-[3rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-indigo-950 shadow-sm"
                value={form.gothra ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, gothra: v }));
                }}
              >
                <option value="">{t("kundli.gotraNone")}</option>
                {GOTRA_OPTIONS.map((id) => (
                  <option key={id} value={id}>
                    {t(gotraI18nKey(id) as "gotras.Vasishtha")}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-4 items-center">
              <label className="text-sm font-semibold text-indigo-950 mr-2">{t("kundli.gender", "Gender")}:</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Male" checked={form.gender === "Male"} onChange={() => setForm((f) => ({ ...f, gender: "Male" }))} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-sm text-slate-700">{t("gender.male", "Male")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Female" checked={form.gender === "Female"} onChange={() => setForm((f) => ({ ...f, gender: "Female" }))} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-sm text-slate-700">{t("gender.female", "Female")}</span>
              </label>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4 items-center bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
              <label className="text-sm font-semibold text-indigo-950 mr-1">{t("kundli.maritalStatus", "ವಿವಾಹ ಸ್ಥಿತಿ (Status)")}:</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="maritalStatus"
                  value="unspecified"
                  checked={!form.maritalStatus || form.maritalStatus === "unspecified"}
                  onChange={() => setForm((f) => ({ ...f, maritalStatus: undefined }))}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-sm text-slate-700 font-medium">❓ {t("maritalStatus.unspecified", "ತಿಳಿದಿಲ್ಲ / ನೀಡಲಾಗಿಲ್ಲ (Not Specified)")}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="maritalStatus"
                  value="married"
                  checked={form.maritalStatus === "married"}
                  onChange={() => setForm((f) => ({ ...f, maritalStatus: "married" }))}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-sm text-slate-700 font-medium">💍 {t("maritalStatus.married", "ವಿವಾಹಿತರು (Married)")}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="maritalStatus"
                  value="unmarried"
                  checked={form.maritalStatus === "unmarried"}
                  onChange={() => setForm((f) => ({ ...f, maritalStatus: "unmarried" }))}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-sm text-slate-700 font-medium">🌸 {t("maritalStatus.unmarried", "ಅವಿವಾಹಿತರು (Unmarried)")}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="maritalStatus"
                  value="separated"
                  checked={form.maritalStatus === "separated"}
                  onChange={() => setForm((f) => ({ ...f, maritalStatus: "separated" }))}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-sm text-slate-700 font-medium">⚡ {t("maritalStatus.separated", "ಪ್ರತ್ಯೇಕಿತರು (Separated)")}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">{t("kundli.birthDate")}</p>
                <button
                  type="button"
                  title="Dictate Date"
                  onClick={() => startDictation("date")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "date" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">{t("kundli.birthTime")}</p>
                <button
                  type="button"
                  title="Dictate Time"
                  onClick={() => startDictation("time")}
                  className={`text-xs flex items-center gap-1 font-semibold px-2 py-1 rounded-full ${dictatingField === "time" ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-colors`}
                >
                  <span role="img" aria-label="microphone">🎤</span> 
                </button>
              </div>
              <BirthTimePicker value={birthTimeHm} onChange={setBirthTimeHm} zoneHint={birthTimeZoneHint} />
            </div>
            <input
              required
              aria-required
              placeholder={t("kundli.pincodePlaceholder")}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              value={form.pincode ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setForm((f) => ({ ...f, pincode: v.length ? v : undefined }));
              }}
            />
            <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800">
              {placeDisplay}
            </div>
            <input
              placeholder={t("kundli.homePlaceName")}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-indigo-950 shadow-sm md:col-span-2"
              value={homePlaceName}
              onChange={(e) => setHomePlaceName(e.target.value)}
              onBlur={() => pushPlaceToStore(form.latitude, form.longitude, locationCore, form.pincode)}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{t("kundli.pincodeHint")}</p>
          {pinResolving ? <GrahaSpinner size="sm" message={t("location.loading")} /> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="jk-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-indigo-950 font-medium"
              onClick={() => setMapOpen(true)}
            >
              {t("kundli.openMap")}
            </button>
            <select
              aria-label="German City Quick Select"
              className="jk-btn rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-indigo-950 font-medium cursor-pointer"
              value=""
              onChange={(e) => {
                const city = GERMAN_MAJOR_CITIES.find((c) => c.name === e.target.value);
                if (city) {
                  setForm((f) => ({ ...f, latitude: city.lat, longitude: city.lng, pincode: city.postalCode }));
                  const core = `🇩🇪 ${city.name}, Germany`;
                  setLocationCore(core);
                  setHomePlaceName(city.name);
                  pushPlaceToStore(city.lat, city.lng, core, city.postalCode);
                }
              }}
            >
              <option value="">🇩🇪 Quick German Cities (Berlin, Munich, Frankfurt...)</option>
              {GERMAN_MAJOR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  🇩🇪 {c.name} ({c.nameDe}) · {c.state} [PLZ {c.postalCode}]
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <LocationSelector
              key={`loc-${form.pincode ?? ""}-${locationEpoch}`}
              filterPincode={form.pincode && /^\d{6}$/.test(form.pincode) ? form.pincode : undefined}
              onChange={(location: SelectedLocation) => {
                setForm((f) => ({ ...f, latitude: location.lat, longitude: location.lng, pincode: location.pincode }));
                const core = `${location.villageName} (${location.pincode})`;
                setLocationCore(core);
                pushPlaceToStore(location.lat, location.lng, core, location.pincode);
              }}
            />
          </div>
          <MapLocationPicker
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            defaultLat={form.latitude}
            defaultLng={form.longitude}
            onConfirm={(lat, lng, label) => {
              setForm({ ...form, latitude: lat, longitude: lng });
              setLocationCore(label);
              pushPlaceToStore(lat, lng, label, form.pincode && /^\d{6}$/.test(form.pincode) ? form.pincode : undefined);
            }}
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

          {/* Priest Calendar Integration Checkbox (Unchecked by default) */}
          <div className="mt-4 flex items-center justify-center">
            <label className="flex items-start gap-3 p-3.5 max-w-xl w-full rounded-2xl border-2 border-amber-400 bg-amber-50/80 cursor-pointer shadow-xs hover:bg-amber-100/80 transition">
              <input
                type="checkbox"
                checked={includePriestCalendar}
                onChange={(e) => setIncludePriestCalendar(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-amber-400"
              />
              <div className="text-left flex-1">
                <span className="block text-xs font-black text-amber-950">
                  👑 {i18n.language.startsWith("kn") ? "ಪುರೋಹಿತರ ವಿಶೇಷ ಪಂಚಾಂಗ ಸೇರಿಸಿ (Include Priest Calendar & Detailed Muhurtha Timings)" : "Include Priest Calendar & Detailed Muhurtha Timings"}
                </span>
                <span className="block text-[11px] leading-snug text-amber-900/80 mt-0.5">
                  {i18n.language.startsWith("kn")
                    ? "೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯ ಸಮಯಗಳು, ತಿಥಿ-ನಕ್ಷತ್ರ ಅಂತ್ಯ ಕಾಲಾವಧಿ, ಶ್ರಾದ್ಧ ತಿಥಿ, ಎನರ್ಜಿ ಮೀಟರ್ ಮತ್ತು ಕರ್ಮಾನುಷ್ಠಾನ ಮುಹೂರ್ತಗಳನ್ನು ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಸೇವಾ ಪತ್ರದಲ್ಲಿ ಸೇರಿಸುತ್ತದೆ."
                    : "Integrates 12 Dina Lagna ending times, Tithi/Nakshatra transition timings, Shraddha tithi, energy meter, and priest duty reminders into Calendar and Seva."}
                </span>
              </div>
            </label>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="jk-btn rounded-xl bg-indigo-950 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-md hover:bg-indigo-900 transition-colors"
              onClick={() => void onGenerate()}
            >
              {t("kundli.generate")}
            </button>
          </div>
          {savedId && (
            <p className="mt-2 text-xs text-emerald-800">
              {t("kundli.savedPrefix")} ({savedId})
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 shadow-sm gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-indigo-950 capitalize">{form.name}</h3>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
              {birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : ""} • {birthTimeHm}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{placeDisplay}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="jk-btn rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 hover:from-red-500 hover:to-amber-500 px-5 py-2.5 text-xs md:text-sm font-black tracking-wide text-white shadow-lg transition-all scale-100 active:scale-95 flex items-center gap-2 border border-amber-300/40"
              onClick={() => useAppStore.getState().setPage("doshas")}
            >
              <span className="text-base animate-pulse">🛡️</span>
              <span>{i18n.language.startsWith("kn") ? "ದೋಷಗಳು & ಪರಿಹಾರ (Doshas)" : "Kundli Doshas & Shanti"}</span>
              <span className="text-xs">➜</span>
            </button>
            <button
              type="button"
              className="jk-btn rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs md:text-sm font-bold tracking-wide text-neutral-950 shadow-md transition-all scale-100 active:scale-95 flex items-center gap-1.5"
              onClick={() => {
                useKundliViewerStore.getState().resetResult();
                setResult(null);
              }}
            >
              <span>✏️</span>
              <span>{i18n.language.startsWith("kn") ? "ವಿವರ ತಿದ್ದಿ (Edit Details)" : "Edit Details"}</span>
            </button>
            <button
              type="button"
              className="jk-btn rounded-xl bg-rose-500 hover:bg-rose-600 px-5 py-2.5 text-xs md:text-sm font-bold tracking-wide text-white shadow-md transition-all scale-100 active:scale-95 flex items-center gap-1.5"
              onClick={() => {
                clearKundliSession();
                setResult(null);
                setForm({
                  name: "",
                  birthDate: "",
                  birthTime: "",
                  latitude: defaultLat,
                  longitude: defaultLng,
                  gothra: "",
                  gender: "Male",
                  pincode: pincodeStore || undefined
                });
                setBirthDatePicker(null);
                setBirthTimeHm("");
                setHomePlaceName("");
                setLocationCore(placeLabelStore);
                setDasha([]);
                setDailyPrediction("");
              }}
            >
              <span>🔄</span>
              <span>{i18n.language.startsWith("kn") ? "ಹೊಸ ಜಾತಕ / ರಿಸೆಟ್ (New / Reset)" : "New Kundali / Reset"}</span>
            </button>
          </div>
        </div>
      )}
      {/* Buttons removed as per user request */}
      {/* Standalone KundliChart removed to avoid duplication with Jataka details */}
      
      {result && birthDatePicker && birthTimeHm.trim() ? (
        <div className="mt-8 space-y-6">
          {/* 🌟 Bhagyodaya Mahadarshana Life Master Dossier Banner 🌟 */}
          <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-950 via-slate-950 to-neutral-900 p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400 bg-amber-900/60 text-3xl shadow-inner animate-pulse">
                🌟
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                  <span>✨</span>
                  <span>ವಿಶೇಷ ಜೀವನ ಸಂಜೀವಿನಿ ರಹಸ್ಯ (Exclusive Life Dossier)</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-amber-200 mt-1">
                  {i18n.language.startsWith("kn") 
                    ? `ನಿಮ್ಮ ಜಾತಕದ "ಭಾಗ್ಯೋದಯ ಮಹಾದರ್ಶನ & ೧೦ ವರ್ಷಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲು" ಸಿದ್ಧವಾಗಿದೆ!`
                    : `Your "Bhagyodaya Life Dossier & 10-Year Golden Milestones" is Ready!`}
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  ಧನ ಯೋಗ, ಸಾಲ ಮುಕ್ತಿ ಕಾಲ, ವಿವಾಹ ಯೋಗ, ಆಯುರ್ ಆರೋಗ್ಯ, ದೃಷ್ಟಿ ನಿವಾರಣೆ & ಭಾಗ್ಯ ರತ್ನ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => useAppStore.getState().setPage("bhagyodaya")}
              className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-6 py-3.5 text-xs font-black text-neutral-950 shadow-xl hover:scale-105 transition-all"
            >
              <span>🌟</span>
              <span>{i18n.language.startsWith("kn") ? "ಭಾಗ್ಯೋದಯ ಮಹಾದರ್ಶನ ವೀಕ್ಷಿಸಿ" : "View Bhagyodaya Dossier"}</span>
              <span>➜</span>
            </button>
          </div>

          {/* 🔮 Instant Astrologer Live Reading & Q&A Banner 🔮 */}
          <div className="rounded-3xl border-2 border-indigo-400 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-400 bg-indigo-900/60 text-3xl shadow-inner animate-pulse">
                🔮
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-indigo-300">
                  <span>✨</span>
                  <span>{i18n.language.startsWith("kn") ? "ತ್ವರಿತ ಭವಿಷ್ಯ ದರ್ಶನ (Instant Astrologer Reading)" : "Instant Astrologer Live Consultation"}</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-indigo-200 mt-1">
                  {i18n.language.startsWith("kn") 
                    ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಏನಾಗುತ್ತಿದೆ? ನೇರ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ & ಪ್ರಶ್ನೋತ್ತರ`
                    : `What is happening right now in your life? Live Consultation & Q&A`}
                </h3>
                <p className="text-xs text-indigo-300/80 mt-0.5">
                  {i18n.language.startsWith("kn")
                    ? "ಮನಸ್ಸಿನ ಸ್ಥಿತಿ, ದಾಂಪತ್ಯ, ಉದ್ಯೋಗ, ನಿಖರ ರತ್ನ & ರುದ್ರಾಕ್ಷಿ ಶಿಫಾರಸು, ಅದೃಷ್ಟ ವಾಹನ ಬಣ್ಣ ಹಾಗೂ ನೇರ ಧ್ವನಿ ಪ್ರಶ್ನೆಗಳು"
                    : "Current mental state, career/family friction nodes, exact Rudraksha & Gemstone prescriptions, lucky car colors & direct voice Q&A"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => useAppStore.getState().setPage("instant_reading")}
              className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 px-6 py-3.5 text-xs font-black text-white shadow-xl hover:scale-105 transition-all"
            >
              <span>🔮</span>
              <span>{i18n.language.startsWith("kn") ? "ತ್ವರಿತ ಭವಿಷ್ಯ ವೀಕ್ಷಿಸಿ & ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Open Instant Reading & Ask Question"}</span>
              <span>➜</span>
            </button>
          </div>

          {/* 🛡️ Comprehensive Kundli Doshas & Shanti Dossier Banner 🛡️ */}
          <div className="rounded-3xl border-2 border-red-500/70 bg-gradient-to-r from-red-950 via-slate-950 to-amber-950 p-5 md:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-400 bg-red-900/60 text-3xl shadow-inner animate-pulse">
                🛡️
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-400/30">
                  <span>🔱</span>
                  <span>{i18n.language.startsWith("kn") ? "ಸಮಗ್ರ ದೋಷ ನಿರ್ಣಯ & ದೈವಿಕ ಶಾಂತಿ" : "Comprehensive Vedic Doshas & Shanti"}</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-amber-200 mt-1">
                  {i18n.language.startsWith("kn")
                    ? `ಜಾತಕದ ಸಮಗ್ರ ದೋಷಗಳು, ದಶಾ ಸಂಧಿ & ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ`
                    : `Complete Kundli Doshas, Dasha Sandhi & Live Gochara Analysis`}
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {i18n.language.startsWith("kn")
                    ? "ಪಿತೃ ದೋಷ, ನಾರಾಯಣ ಬಲಿ, ಕಾಳಸರ್ಪ, ಗುರು ಚಂಡಾಲ, ಬಾಲಾರಿಷ್ಟ, ಬಾಲ್ಯಗ್ರಹ, ಕುಜ ದೋಷ, ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಮತ್ತು ನಿಖರ ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣಗಳು"
                    : "Pitru Dosha, Narayana Bali, Kala Sarpa, Guru Chandala, Balarishta, Kuja, Dasha Sandhi with precise astronomical 'Why' & Pooja"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => useAppStore.getState().setPage("doshas")}
              className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 px-6 py-3.5 text-xs font-black text-white shadow-xl hover:scale-105 transition-all border border-amber-300/50"
            >
              <span>🛡️</span>
              <span>{i18n.language.startsWith("kn") ? "ದೋಷಗಳ ವೀಕ್ಷಣೆ & ಶಾಂತಿ ಪತ್ರ" : "View All Doshas & Shanti"}</span>
              <span>➜</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
            <button
              type="button"
              className={`jk-btn rounded-xl px-8 py-3 text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "jataka"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveView("jataka")}
            >
              Jataka Details
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "dasha"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50"
              }`}
              onClick={() => setActiveView("dasha")}
            >
              Complete Dasha Bhukti
            </button>
            <button
              type="button"
              className="jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-black tracking-wide shadow-md transition-all bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 text-white hover:brightness-110 flex items-center gap-1.5 border border-amber-300/40"
              onClick={() => useAppStore.getState().setPage("doshas")}
            >
              <span>🛡️</span>
              <span>{i18n.language.startsWith("kn") ? "ಜಾತಕ ದೋಷಗಳು (Doshas)" : "Kundli Doshas"}</span>
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "remedy"
                  ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-amber-300 scale-105"
                  : "bg-white text-amber-950 border-2 border-amber-400 hover:bg-amber-50"
              }`}
              onClick={() => setActiveView("remedy")}
            >
              🪔 {i18n.language.startsWith("kn") ? "ದೈವಿಕ ಪರಿಹಾರ (Remedies)" : "Divine Remedies"}
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "lifeguidance"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-50"
              }`}
              onClick={() => setActiveView("lifeguidance")}
            >
              🔮 {i18n.language.startsWith("kn") ? "ಪರಿಪೂರ್ಣ ಜೀವನ ಮಾರ್ಗದರ್ಶನ" : "Life Guidance"}
            </button>
            <button
              type="button"
              className={`jk-btn rounded-xl px-6 py-3 text-sm md:text-base font-bold tracking-wide shadow-md transition-all ${
                activeView === "balavidya"
                  ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-amber-200 scale-105"
                  : "bg-white text-amber-950 border-2 border-amber-300 hover:bg-amber-50"
              }`}
              onClick={() => setActiveView("balavidya")}
            >
              🎓 {i18n.language.startsWith("kn") ? "ಬಾಲ ವಿದ್ಯಾ & ಸಂಸ್ಕಾರ ಮಂಡಲ" : "Bala Vidya & Student Hub"}
            </button>
          </div>

          {activeView === "remedy" && effectiveRemedyDiagnosis && (
            <div className="animate-fade-in">
              <KundliRemedyView
                diagnosis={effectiveRemedyDiagnosis}
                lang={remedyPdfLanguage}
                onDownloadPdf={handleDownloadRemedyPdf}
                isGeneratingPdf={isGeneratingRemedyPdf}
                isAiGenerating={isGeneratingRemedyAi}
              />
            </div>
          )}

          {activeView === "balavidya" && (
            <div className="animate-fade-in">
              <BalaVidyaSuite
                kundli={result}
                childName={form.name}
                dob={formatPickerDateLocalYmd(birthDatePicker)}
                tob={birthTimeHm.trim()}
                gender={form.gender}
                lang={i18n.language}
                onOpenSevaModal={() => setPage("seva")}
              />
            </div>
          )}

          {activeView === "lifeguidance" && (
            <div className="animate-fade-in">
              <LifeGuidancePage
                initialInput={{
                  personName: form.name,
                  dob: form.birthDate,
                  tob: form.birthTime,
                  gender: form.gender
                }}
              />
            </div>
          )}

          {activeView === "jataka" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col items-center justify-center mb-6">
                


                {/* Download Actions Container */}
                <div className="flex flex-col items-center justify-center gap-4 w-full max-w-4xl px-2">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    {/* Special Divine Consultation & Reports Button */}
                    <button
                      type="button"
                      disabled={isGeneratingPremiumBundle || isTranslating || isGeneratingDashaPdf}
                      className="w-full sm:w-auto flex-1 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-amber-950 px-6 py-4 text-white font-extrabold text-base tracking-wide shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 border-2 border-amber-400/90 cursor-pointer"
                      onClick={() => setIsSpecialConsultationOpen(true)}
                    >
                      <div className="flex items-center gap-2 text-base md:text-lg">
                        <span className="text-xl">✨</span>
                        <span className="text-amber-300">
                          {i18n.language.startsWith("kn")
                            ? "ವಿಶೇಷ ದೈವಿಕ ಸಮಾಲೋಚನೆ & ವರದಿಗಳು"
                            : "Special Divine Consultation & Reports"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-200/90 tracking-normal text-center">
                        {i18n.language.startsWith("kn")
                          ? "೧೨-ತಿಂಗಳ ಭವಿಷ್ಯ • ವಿವಾಹ • ವೃತ್ತಿ • ರತ್ನ • ಆಯುರ್ವೇದ • ಪ್ರಶ್ನೋತ್ತರ Q&A"
                          : "12-Month Forecast • Marriage • Wealth • Gemstones • Health • Custom Q&A"}
                      </span>
                    </button>

                    {/* Royal 3-in-1 Premium Download Button */}
                    <button
                      type="button"
                      disabled={isGeneratingPremiumBundle || isTranslating || isGeneratingDashaPdf}
                      className={`w-full sm:w-auto flex-1 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-4 text-white font-extrabold text-base tracking-wide shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 border-2 border-amber-300/60 ${
                        (isGeneratingPremiumBundle || isTranslating || isGeneratingDashaPdf) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      onClick={handlePremiumDownload}
                    >
                      <div className="flex items-center gap-2 text-base md:text-lg">
                        {isGeneratingPremiumBundle ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-xl">👑</span>
                        )}
                        <span>
                          {isGeneratingPremiumBundle
                            ? `${bundleProgress}% ${i18n.language.startsWith("kn") ? "ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating..."}`
                            : i18n.language.startsWith("kn")
                            ? "ಪ್ರೀಮಿಯಂ ಡೌನ್‌ಲೋಡ್ (Premium Download)"
                            : "Premium Download (ZIP Package)"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-100/90 tracking-normal text-center">
                        {i18n.language.startsWith("kn")
                          ? "ಕುಂಡಲಿ + ಪರಿಹಾರ + ದಿವ್ಯ ಭವಿಷ್ಯ + 30-ದಿನಗಳ ಮುಹೂರ್ತ QR (ZIP ಪ್ಯಾಕೇಜ್)"
                          : "Kundli + Remedies + Bhavishya + 30-Day QR (ZIP Package)"}
                      </span>
                    </button>
                  </div>

                  {/* Single Janana Kundali Download Button */}
                  <button
                    type="button"
                    disabled={isTranslating || isGeneratingDashaPdf || isGeneratingPremiumBundle}
                    className={`w-full sm:w-auto rounded-xl bg-slate-900 border border-slate-700 px-5 py-3 text-xs md:text-sm font-bold text-amber-300 shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 ${
                      (isTranslating || isGeneratingDashaPdf || isGeneratingPremiumBundle) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    onClick={async () => {
                      const el = traditionalExportRef.current;
                      const dashaEl = dashaExportRef.current;
                      
                      if (el) {
                        try {
                          setIsTranslating(true);
                          
                          const newVals: Record<string, string> = {};
                          if (pdfLanguage !== "kn" && traditionalData) {
                             const yoniMeta = import_patrikaMetaForNakshatraIndex(result.planets.find((p: any) => p.name === "Moon")?.nakshatra.index || 0);
                             
                             const keys = [
                               "samvatsara", "masa", "paksha", "tithi", "weekday", "sunNakshatra", "moonNakshatra", "yoga", "karana", "sankrantiSign",
                               "yoni", "gana", "nadi", "label_yoni", "label_gana", "label_nadi", "label_footer"
                             ];
                             const texts = [
                               traditionalData.samvatsaraKn, traditionalData.masaKn, traditionalData.pakshaKn, traditionalData.tithiKn, traditionalData.weekdayKn, 
                               traditionalData.sunNakshatraKn, traditionalData.moonNakshatraKn, traditionalData.yogaKn, traditionalData.karanaKn, traditionalData.sankrantiSignKn,
                               yoniMeta.yoniKn, yoniMeta.ganaKn, yoniMeta.nadiKn, "ಯೋನಿ", "ಗಣ", "ನಾಡಿ", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು"
                             ];
                             
                             const translated = await Promise.all(texts.map(txt => translateText(txt, pdfLanguage === "en" ? "en-US" : pdfLanguage + "-IN")));
                             
                             keys.forEach((k, i) => newVals[k] = translated[i]);
                          }
                          setDynamicValues(newVals);
                          
                          // Small wait to ensure template is rendered with new state
                          await new Promise(r => setTimeout(r, 500));
                          
                          if (dashaEl) {
                            setIsGeneratingDashaPdf(true);
                            await exportPanchangaWithDashaPdf(el, dashaEl, `baggona-janana-kundali-${form.name || "chart"}`);
                            setIsGeneratingDashaPdf(false);
                          } else {
                            await exportElementAsPdf(el, `baggona-janana-kundali-${form.name || "chart"}`);
                          }
                        } catch (e) {
                          console.error("PDF generation failed:", e);
                          setIsGeneratingDashaPdf(false);
                        } finally {
                          setIsTranslating(false);
                        }
                      }
                    }}
                  >
                    {isTranslating ? <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div> : <span>📜</span>}
                    {isTranslating ? "Translating..." : "ಜನನ ಕುಂಡಲಿ ಮಾತ್ರ (Kundali Only)"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
                 <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 text-center">
                     <h3 className="text-lg font-bold text-indigo-950">{t("kundli.jatakaDetails", "Jataka & Panchanga Details")}</h3>
                 </div>
                 <div className="p-4 overflow-x-auto flex justify-center">
                    <TraditionalSouthPatrika
                      kundli={result}
                      personName={form.name}
                      gothra={gotraDisplay}
                      birthDate={formatPickerDateLocalYmd(birthDatePicker)}
                      birthTime={birthTimeHm.trim()}
                      latitude={form.latitude}
                      longitude={form.longitude}
                      placeLabel={placeDisplay}
                      pincode={form.pincode}
                      ayanamsaModel={ayanamsaModel}
                    />
                 </div>
              </div>
            </div>
          )}
          
          {activeView === "dasha" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  disabled={isGeneratingDashaPdf}
                  className={`jk-btn flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-extrabold tracking-wide text-white shadow-lg hover:bg-emerald-400 hover:scale-[1.02] transition-all ${isGeneratingDashaPdf ? 'opacity-75 cursor-wait' : ''}`}
                  onClick={async () => {
                    setIsGeneratingDashaPdf(true);
                    try {
                      // Small wait to ensure template is rendered
                      await new Promise(r => setTimeout(r, 100));
                      
                      const el = dashaExportRef.current;
                      if (el) {
                        await exportDashaPdf(el, `Dasha_Bhukti_Timeline_${form.name || "chart"}`);
                      }
                    } catch (e) {
                      console.error("PDF generation failed:", e);
                    } finally {
                      setIsGeneratingDashaPdf(false);
                    }
                  }}
                >
                  {isGeneratingDashaPdf ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  )}
                  {isGeneratingDashaPdf ? "Generating PDF..." : "Download Complete Dasha Bhukti PDF"}
                </button>
              </div>

              {/* Dasha View Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                  <button
                    onClick={() => setDashaViewType("grid")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${dashaViewType === 'grid' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("kundli.dashaGrid", "Grid View")}
                  </button>
                  <button
                    onClick={() => setDashaViewType("visualization")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${dashaViewType === 'visualization' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("kundli.dashaVisual", "Visualization")}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm overflow-hidden p-4">
                 <h3 className="text-lg font-bold text-indigo-950 mb-3 text-center">{t("kundli.dashaTitle", "Dasha Bhukti Timeline (120 Years)")}</h3>
                 <div className="p-4 bg-white rounded-xl">
                   <div className="text-center mb-6 border-b border-slate-100 pb-4">
                     <h2 className="text-2xl font-extrabold text-indigo-900">{form.name}</h2>
                     <p className="text-sm font-medium text-slate-600 mt-1">
                       Complete Dasha Bhukti Timeline (Birth to 120 Years)
                     </p>
                   </div>
                   {kundliSession && dashaViewType === "grid" && <DashaBhuktiExplorer session={kundliSession} maxAge={120} />}
                   {kundliSession && dashaViewType === "visualization" && <DashaVisualization session={kundliSession} maxAge={120} />}
                 </div>
              </div>
              
            </div>
          )}

        </div>
      ) : null}
      
      {result && birthDatePicker && birthTimeHm.trim() ? (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "794px", minHeight: "1123px" }}>
          <div ref={traditionalExportRef} style={{ width: "100%", height: "100%", backgroundColor: "#fbf8f1" }}>
            <GokarnaKundaliTemplate
            kundli={result}
            personName={form.name}
            parentsName={""}
            birthDateObj={birthDatePicker}
            birthTimeStr={birthTimeHm}
            isDayBirth={isDayBirthComputed}
            panchanga={traditionalData}
            gothra={gotraDisplay}
            pdfLanguage={pdfLanguage}
            dynamicValues={dynamicValues}
          /></div>
        </div>
      ) : null}
      {/* Hidden Dasha PDF Template Container */}
      {result && birthDatePicker && birthTimeHm.trim() && kundliSession ? (
        <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
          <DashaPdfTemplate ref={dashaExportRef} session={kundliSession} maxAge={120} pdfLanguage={pdfLanguage} />
        </div>
      ) : null}

      {/* Hidden Kundli Remedy PDF Template conforming to baggona-pdf-layout-guard */}
      {effectiveRemedyDiagnosis && (
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
        >
          <KundliRemedyPdfTemplate
            diagnosis={effectiveRemedyDiagnosis}
            lang={remedyPdfLanguage}
          />
        </div>
      )}

      {/* Hidden Bhavishya V1 PDF Template Conforming to baggona-pdf-layout-guard */}
      {effectiveSession && premiumBhavishyaPayload && (
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
        >
          <PdfTemplate
            ref={premiumBhavishyaPdfRef}
            theme="sunrise"
            session={effectiveSession}
            predictions={premiumBhavishyaPayload.predictions}
            translations={premiumBhavishyaPayload.translations}
            deepInsights={premiumBhavishyaPayload.deepInsights}
            premiumData={premiumBhavishyaPayload.premiumData}
            ageYears={premiumBhavishyaPayload.ageYears}
          />
        </div>
      )}

      {/* Royal Baggona Premium ZIP Package Document Selector Modal */}
      {isPackageSelectModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPackageSelectModalOpen(false);
          }}
        >
          <div className="relative my-auto w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border-2 border-amber-500/50 overflow-hidden">
            {/* Pinned Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-amber-500/30 px-5 py-3.5 bg-slate-950/70 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0">📦</span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-300 truncate">
                    {pdfLanguage === "kn" ? "ಪ್ರೀಮಿಯಂ ಜಿಪ್ ಬಂಡಲ್ ಆಯ್ಕೆ" : "Select Documents for ZIP Bundle"}
                  </h3>
                  <p className="text-xs text-slate-300 truncate">
                    {form.name || "Devotee"} · {pdfLanguage.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageSelectModalOpen(false)}
                className="shrink-0 ml-3 rounded-full w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-700 hover:border-rose-500 transition-colors font-bold text-sm shadow-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
              {/* Language Selector Inside Popup */}
              <div className="rounded-2xl bg-slate-800/80 border border-amber-500/30 p-3 space-y-2">
                <label className="block text-xs font-bold text-amber-300">
                  {pdfLanguage === "kn" ? "ಪಿಡಿಎಫ್ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ (Select PDF Language):" : "Select PDF Language:"}
                </label>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[
                    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                    { code: "en", label: "English" },
                    { code: "hi", label: "हिन्दी (Hindi)" },
                    { code: "te", label: "తెలుగు (Telugu)" },
                    { code: "ta", label: "தமிழ் (Tamil)" }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        pdfLanguage === lang.code
                          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30"
                          : "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-amber-400/50"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                        pdfLanguage === lang.code ? "border-slate-950 bg-slate-950" : "border-slate-500"
                      }`}>
                        {pdfLanguage === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-amber-100/90 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 sm:p-3 leading-relaxed">
                {pdfLanguage === "kn"
                  ? "ಜಿಪ್ (ZIP) ಕಡತದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಇಚ್ಛಿಸುವ ಅಧಿಕೃತ ದಾಖಲೆಗಳನ್ನು ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ:"
                  : "Select the official documents you wish to include in the ZIP download package:"}
              </p>

              {/* Checkbox Items - Total 5 Options */}
              <div className="space-y-2">
                {/* Item 1: Kundli & Dasha */}
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={packageSelectedItems.kundli}
                    onChange={(e) => setPackageSelectedItems(prev => ({ ...prev, kundli: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <div className="text-left text-xs min-w-0">
                    <p className="font-bold text-amber-200 text-sm">
                      {pdfLanguage === "kn" ? "೧. ಜನನ ಕುಂಡಲಿ & ದಶಾ-ಭುಕ್ತಿ (PDF)" : "1. Janana Kundali & Dasha (PDF)"}
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-snug">
                      {pdfLanguage === "kn"
                        ? "ಸಮಗ್ರ ಗ್ರಹ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ-ಪಾದ, ಪಂಚಾಂಗ ಅಂಗಗಳು ಮತ್ತು ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ವಿವರಗಳು"
                        : "Complete planetary positions, Panchanga details, and 120-year Vimshottari Dasha-Bhukti"}
                    </p>
                  </div>
                </label>

                {/* Item 2: Daivika Parihara Remedies */}
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={packageSelectedItems.remedy}
                    onChange={(e) => setPackageSelectedItems(prev => ({ ...prev, remedy: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <div className="text-left text-xs min-w-0">
                    <p className="font-bold text-amber-200 text-sm">
                      {pdfLanguage === "kn" ? "೨. ದೈವಿಕ ಪರಿಹಾರ ವರದಿ (PDF)" : "2. Daivika Parihara Remedy Report (PDF)"}
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-snug">
                      {pdfLanguage === "kn"
                        ? "ಅಧಿಕೃತ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರಗಳು, ಸ್ತೋತ್ರಗಳು, ಮಂತ್ರಗಳು ಹಾಗೂ ಜಪ ವಿಧಾನಗಳು"
                        : "Authentic temple remedies, shlokas, mantras, and personalized ritual guidelines"}
                    </p>
                  </div>
                </label>

                {/* Item 3: Divya Bhavishya V1 */}
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={packageSelectedItems.bhavishya}
                    onChange={(e) => setPackageSelectedItems(prev => ({ ...prev, bhavishya: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <div className="text-left text-xs min-w-0">
                    <p className="font-bold text-amber-200 text-sm">
                      {pdfLanguage === "kn" ? "೩. ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ V1 - ೧೦ ಅಧ್ಯಾಯಗಳು (PDF)" : "3. Baggona Divya Bhavishya V1 - 10 Chapters (PDF)"}
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-snug">
                      {pdfLanguage === "kn"
                        ? "೧೦೦% ಅಧಿಕೃತ AI ನಿರೂಪಣೆ, ಜೀವನದ ೧೦ ಹಂತಗಳ ಸಮಗ್ರ ಭವಿಷ್ಯ ಹಾಗೂ ಪರಿಹಾರಗಳು"
                        : "100% dynamic AI narrative across 10 life stages with emotional depth & Vedic precision"}
                    </p>
                  </div>
                </label>

                {/* Item 4: Kundli Comprehensive Doshas Report */}
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={packageSelectedItems.dosha}
                    onChange={(e) => setPackageSelectedItems(prev => ({ ...prev, dosha: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <div className="text-left text-xs min-w-0">
                    <p className="font-bold text-amber-200 text-sm">
                      {pdfLanguage === "kn" ? "೪. ಕುಂಡಲಿ ಸಮಗ್ರ ದೋಷಗಳ ವರದಿ (PDF)" : "4. Comprehensive Kundli Doshas Report (PDF)"}
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-snug">
                      {pdfLanguage === "kn"
                        ? "ಪಿತ್ರು, ಕಾಲಸರ್ಪ, ಕುಜ, ಗುರು ಚಂಡಾಲ, ಗ್ರಹಣ, ಗಂಡಾಂತರ ಮುಂತಾದ ಸಮಗ್ರ ದೋಷಗಳ ಪೂರ್ಣ ವರದಿ"
                        : "Complete analysis of Pitru, Kala Sarpa, Kuja, Guru Chandala, Gandantara & other doshas"}
                    </p>
                  </div>
                </label>

                {/* Item 5: 30-Day Auspicious Calendar QR Card */}
                <label className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={packageSelectedItems.qrCalendar}
                    onChange={(e) => setPackageSelectedItems(prev => ({ ...prev, qrCalendar: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 shrink-0"
                  />
                  <div className="text-left text-xs min-w-0">
                    <p className="font-bold text-amber-200 text-sm">
                      {pdfLanguage === "kn" ? "೫. ಮುಂದಿನ 30-ದಿನಗಳ ಮುಹೂರ್ತ QR ಕಾರ್ಡ್ (PDF)" : "5. Next 30-Day Auspicious Calendar QR Card (PDF)"}
                    </p>
                    <p className="text-slate-300 mt-0.5 leading-snug">
                      {pdfLanguage === "kn"
                        ? "ದಿನನಿತ್ಯದ ಶುಭ ಮುಹೂರ್ತಗಳು, ಗೋಚಾರ ಫಲಗಳು & ಪೂಜ್ಯ ಪುರೋಹಿತರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ QR"
                        : "Personalized 30-day auspicious calendar with instant priest consultation QR link"}
                    </p>
                  </div>
                </label>
              </div>

              {/* Conditional Priest Database Selector & Editor when Item 5 (QR Calendar) is checked */}
              {packageSelectedItems.qrCalendar && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/40 p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <span>📿</span>
                      <span>
                        {pdfLanguage === "kn"
                          ? "ಪೂಜ್ಯ ಪುರೋಹಿತರ ವಿವರಗಳು (Priest Database Consultation)"
                          : "Priest Database Consultation Details"}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-200/80 bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                      💾 Auto-Saves to Database
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-100/80 leading-relaxed">
                    {pdfLanguage === "kn"
                      ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಪುರೋಹಿತರನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹೊಸ ಪುರೋಹಿತರನ್ನು ಸೇರಿಸಿ. ಹೆಸರು ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ತಿದ್ದುಪಡಿ ಮಾಡಿದರೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಉಳಿಯುತ್ತದೆ:"
                      : "Select an existing priest from database or add a new priest. Any edits to name or phone will automatically update in database:"}
                  </p>

                  {/* Priest Dropdown from Database */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {pdfLanguage === "kn" ? "ಡೇಟಾಬೇಸ್ ಪುರೋಹಿತರ ಪಟ್ಟಿ (Select from Database)" : "Select Priest from Database"}
                    </label>
                    <select
                      value={selectedPriestId}
                      onChange={(e) => handlePriestSelect(e.target.value)}
                      className="w-full rounded-xl bg-slate-900 border border-amber-500/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {priestsList.map((p) => {
                        const langKey = (pdfLanguage.split("-")[0] as keyof L5) || "kn";
                        const pName = p.name[langKey] || p.name.kn || p.name.en;
                        const pPhone = p.phone ? ` (${p.phone})` : "";
                        return (
                          <option key={p.id} value={p.id}>
                            {pName}{pPhone}
                          </option>
                        );
                      })}
                      <option value="new_priest">
                        ➕ {pdfLanguage === "kn" ? "ಹೊಸ ಪುರೋಹಿತರನ್ನು ಸೇರಿಸಿ (+ Add New Priest)" : "+ Add New Priest"}
                      </option>
                    </select>
                  </div>

                  {/* Priest Name and Phone editable fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {pdfLanguage === "kn" ? "ಪುರೋಹಿತರ ಹೆಸರು (Priest Name)" : "Priest Name"}
                      </label>
                      <input
                        type="text"
                        value={priestNameInput}
                        onChange={(e) => setPriestNameInput(e.target.value)}
                        placeholder={pdfLanguage === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "Shreeram Pandit"}
                        className="w-full rounded-xl bg-slate-900/90 border border-amber-500/40 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {pdfLanguage === "kn" ? "ದೂರವಾಣಿ / WhatsApp ಸಂಖ್ಯೆ" : "Phone / WhatsApp"}
                      </label>
                      <input
                        type="text"
                        value={priestPhoneInput}
                        onChange={(e) => setPriestPhoneInput(e.target.value)}
                        placeholder="9972339362"
                        className="w-full rounded-xl bg-slate-900/90 border border-amber-500/40 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-amber-300/80 italic">
                    {selectedPriestId === "new_priest"
                      ? (pdfLanguage === "kn"
                          ? "✨ ಹೊಸ ಪುರೋಹಿತರನ್ನು ನಮೂದಿಸಿದಾಗ ಅವರು ಡೇಟಾಬೇಸ್‌ಗೆ ಹೊಸದಾಗಿ ಸೇರ್ಪಡೆಗೊಳ್ಳುತ್ತಾರೆ."
                          : "✨ This new priest will be saved into the database for future consultations.")
                      : (pdfLanguage === "kn"
                          ? "🔄 ಹೆಸರು ಅಥವಾ ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿದರೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ."
                          : "🔄 Editing name or number will update this existing priest in the database.")}
                  </p>
                </div>
              )}
            </div>

            {/* Pinned Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setIsPackageSelectModalOpen(false)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                {pdfLanguage === "kn" ? "ರದ್ದುಗೊಳಿಸಿ (Cancel)" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmPremiumBundleDownload}
                className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>📦</span>
                <span>
                  {pdfLanguage === "kn"
                    ? `ಆಯ್ಕೆಮಾಡಿದ ZIP ಡೌನ್‌ಲೋಡ್ (${Object.values(packageSelectedItems).filter(Boolean).length})`
                    : `Download Selected ZIP (${Object.values(packageSelectedItems).filter(Boolean).length})`}
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Royal Baggona Premium Bundle Progress & Result Modal */}
      {bundleModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (!isGeneratingPremiumBundle && e.target === e.currentTarget) {
              setBundleModalOpen(false);
            }
          }}
        >
          <div className="relative my-auto w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border-2 border-amber-500/50 overflow-hidden">
            {/* Pinned Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-amber-500/30 px-5 py-3.5 bg-slate-950/70 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0">👑</span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-300 truncate">
                    {pdfLanguage === "kn" ? "ಬಗ್ಗೋಣ ಪ್ರೀಮಿಯಂ ಡೌನ್‌ಲೋಡ್" : "Baggona Premium Download"}
                  </h3>
                  <p className="text-xs text-slate-300 truncate">
                    {form.name || "Devotee"} · {pdfLanguage.toUpperCase()}
                  </p>
                </div>
              </div>
              {!isGeneratingPremiumBundle && (
                <button
                  type="button"
                  onClick={() => setBundleModalOpen(false)}
                  className="shrink-0 ml-3 rounded-full w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600 border border-slate-700 hover:border-rose-500 transition-colors font-bold text-sm shadow-sm"
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {/* In Progress State */}
              {isGeneratingPremiumBundle && (
                <div className="space-y-5 py-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-500/30 border-t-amber-400 animate-spin mb-3" />
                    <p className="text-2xl font-black text-amber-300">{bundleProgress}%</p>
                    <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-sm">{bundleStageText}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-amber-500/30 p-0.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full transition-all duration-300 shadow-sm shadow-amber-400"
                      style={{ width: `${bundleProgress}%` }}
                    />
                  </div>

                  {/* Checklist - 5 Options */}
                  <div className="bg-slate-950/60 rounded-2xl p-3.5 sm:p-4 border border-slate-800 space-y-2 text-xs">
                    {packageSelectedItems.kundli && (
                      <div className="flex items-center gap-2">
                        <span>{bundleProgress >= 25 ? "✅" : "⏳"}</span>
                        <span className={bundleProgress >= 25 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                          1. Baggona Janana Kundali & Dasha (PDF)
                        </span>
                      </div>
                    )}
                    {packageSelectedItems.remedy && (
                      <div className="flex items-center gap-2">
                        <span>{bundleProgress >= 45 ? "✅" : "⏳"}</span>
                        <span className={bundleProgress >= 45 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                          2. Daivika Parihara Remedies Report (PDF)
                        </span>
                      </div>
                    )}
                    {packageSelectedItems.bhavishya && (
                      <div className="flex items-center gap-2">
                        <span>{bundleProgress >= 70 ? "✅" : "⏳"}</span>
                        <span className={bundleProgress >= 70 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                          3. Baggona Divya Bhavishya V1 - 10 Chapters (PDF)
                        </span>
                      </div>
                    )}
                    {packageSelectedItems.dosha && (
                      <div className="flex items-center gap-2">
                        <span>{bundleProgress >= 80 ? "✅" : "⏳"}</span>
                        <span className={bundleProgress >= 80 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                          4. Kundli Comprehensive Doshas Report (PDF)
                        </span>
                      </div>
                    )}
                    {packageSelectedItems.qrCalendar && (
                      <div className="flex items-center gap-2">
                        <span>{bundleProgress >= 90 ? "✅" : "⏳"}</span>
                        <span className={bundleProgress >= 90 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                          5. Next 30-Day Auspicious Calendar QR Card (PDF)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>{bundleProgress >= 100 ? "✅" : "⏳"}</span>
                      <span className={bundleProgress >= 100 ? "text-amber-200 font-semibold" : "text-slate-400"}>
                        6. High-Compression ZIP Bundle Packaging
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed State */}
              {!isGeneratingPremiumBundle && bundleDownloadedPdfs && (
                <div className="space-y-4 py-1">
                  <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-3 sm:p-4 text-center">
                    <span className="text-2xl sm:text-3xl block mb-1">🎉</span>
                    <h4 className="text-sm sm:text-base font-bold text-emerald-300">
                      {pdfLanguage === "kn" ? "ZIP ಬಂಡಲ್ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!" : "ZIP Bundle Downloaded Successfully!"}
                    </h4>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      {pdfLanguage === "kn"
                        ? "ಆಯ್ಕೆಮಾಡಿದ ಎಲ್ಲಾ ಅಧಿಕೃತ ದಾಖಲೆಗಳು ZIP ಕಡತದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿವೆ. ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಪ್ರತ್ಯೇಕ ಪಿಡಿಎಫ್‌ಗಳನ್ನೂ ಕೆಳಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು:"
                        : "All selected official documents are saved in your ZIP bundle. You can also download each individual PDF below:"}
                    </p>
                  </div>

                  {/* Direct Download Links */}
                  <div className="space-y-2">
                    {bundleDownloadedPdfs.zip && (
                      <a
                        href={bundleDownloadedPdfs.zip.url}
                        download={bundleDownloadedPdfs.zip.fileName}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base sm:text-lg shrink-0">📦</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="leading-tight font-extrabold truncate">{pdfLanguage === "kn" ? "ಸಂಪೂರ್ಣ ZIP ಬಂಡಲ್ ಮತ್ತೆ ಡೌನ್‌ಲೋಡ್" : "Download ZIP Bundle Again"}</p>
                            <p className="text-[10px] sm:text-[11px] font-medium opacity-90 truncate">{bundleDownloadedPdfs.zip.fileName}</p>
                          </div>
                        </div>
                        <span className="shrink-0 ml-2">⬇️</span>
                      </a>
                    )}

                    {bundleDownloadedPdfs.panchanga && (
                      <a
                        href={bundleDownloadedPdfs.panchanga.url}
                        download={bundleDownloadedPdfs.panchanga.fileName}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-200 text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">📜</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="font-semibold text-white truncate">೧. ಜನನ ಕುಂಡಲಿ & ದಶಾ-ಭುಕ್ತಿ (PDF)</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{bundleDownloadedPdfs.panchanga.fileName}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 text-[11px] shrink-0 ml-2">ಡೌನ್‌ಲೋಡ್ ⬇️</span>
                      </a>
                    )}

                    {bundleDownloadedPdfs.remedy && (
                      <a
                        href={bundleDownloadedPdfs.remedy.url}
                        download={bundleDownloadedPdfs.remedy.fileName}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-200 text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">🪔</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="font-semibold text-white truncate">೨. ದೈವಿಕ ಪರಿಹಾರ ವರದಿ (PDF)</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{bundleDownloadedPdfs.remedy.fileName}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 text-[11px] shrink-0 ml-2">ಡೌನ್‌ಲೋಡ್ ⬇️</span>
                      </a>
                    )}

                    {bundleDownloadedPdfs.bhavishya && (
                      <a
                        href={bundleDownloadedPdfs.bhavishya.url}
                        download={bundleDownloadedPdfs.bhavishya.fileName}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-200 text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">🔮</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="font-semibold text-white truncate">೩. ಬಗ್ಗೋಣ ದಿವ್ಯ ಭವಿಷ್ಯ V1 (PDF)</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{bundleDownloadedPdfs.bhavishya.fileName}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 text-[11px] shrink-0 ml-2">ಡೌನ್‌ಲೋಡ್ ⬇️</span>
                      </a>
                    )}

                    {bundleDownloadedPdfs.dosha && (
                      <a
                        href={bundleDownloadedPdfs.dosha.url}
                        download={bundleDownloadedPdfs.dosha.fileName}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-200 text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">🛡️</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="font-semibold text-white truncate">೪. ಕುಂಡಲಿ ಸಮಗ್ರ ದೋಷಗಳ ವರದಿ (PDF)</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{bundleDownloadedPdfs.dosha.fileName}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 text-[11px] shrink-0 ml-2">ಡೌನ್‌ಲೋಡ್ ⬇️</span>
                      </a>
                    )}

                    {bundleDownloadedPdfs.qrCalendar && (
                      <a
                        href={bundleDownloadedPdfs.qrCalendar.url}
                        download={bundleDownloadedPdfs.qrCalendar.fileName}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-amber-200 text-xs font-bold transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">📱</span>
                          <div className="text-left min-w-0 truncate">
                            <p className="font-semibold text-white truncate">೫. ಮುಂದಿನ 30-ದಿನಗಳ ಮುಹೂರ್ತ QR ಕಾರ್ಡ್ (PDF)</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{bundleDownloadedPdfs.qrCalendar.fileName}</p>
                          </div>
                        </div>
                        <span className="text-amber-400 text-[11px] shrink-0 ml-2">ಡೌನ್‌ಲೋಡ್ ⬇️</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Footer (when completed) */}
            {!isGeneratingPremiumBundle && bundleDownloadedPdfs && (
              <div className="shrink-0 flex items-center justify-center border-t border-slate-800 bg-slate-950/80 p-3 sm:p-3.5 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setBundleModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  {pdfLanguage === "kn" ? "ಮುಚ್ಚಿ (Close)" : "Close"}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Super Admin & Baggona Devotee Database Search Modal */}
      {isSuperAdminOrBaggona && (
        <DevoteeDatabaseSearchModal
          isOpen={isDevoteeSearchModalOpen}
          onClose={() => setIsDevoteeSearchModalOpen(false)}
          onSelect={handleSelectDevoteeFromDb}
        />
      )}

      {/* Hidden Container for Kundli Doshas PDF Generation */}
      {doshaReport && (
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
          <KundliDoshaPdfTemplate
            id="kundli-doshas-pdf-container"
            report={doshaReport}
            lang={pdfLanguage as any}
          />
        </div>
      )}

      {/* Hidden Container for 30-Day Auspicious Calendar QR Card PDF Generation */}
      {result && (
        <div
          id="kundli-30day-qr-container"
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
        >
          <Kundli30DayQrCard
            profile={qrCardProfile}
            lang={pdfLanguage}
            panditName={priestNameInput || "Shreeram Pandit"}
            priestPhone={priestPhoneInput || "9972339362"}
            qrDataUrl={qrCardDataUrl}
            placeLabel={homePlaceName.trim() || locationCore || "Gokarna"}
            pincode="581326"
          />
        </div>
      )}

      {/* Special Divine Consultation & Reports Modal */}
      {isSpecialConsultationOpen && result && (
        <SpecialDivineConsultationModal
          isOpen={isSpecialConsultationOpen}
          onClose={() => setIsSpecialConsultationOpen(false)}
          kundli={result}
          formInput={{
            name: form.name || "ಭಕ್ತಾದಿಗಳು",
            birthDate: birthDatePicker ? formatPickerDateLocalYmd(birthDatePicker) : (form.birthDate || "1990-01-01"),
            birthTime: birthTimeHm.trim() || "12:00",
            maritalStatus: form.maritalStatus || "general",
            gender: form.gender
          }}
          initialLang={pdfLanguage}
          priestName={priestNameInput || "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"}
          priestPhone={priestPhoneInput || "9972339362"}
        />
      )}

    </Card>
  );
}
