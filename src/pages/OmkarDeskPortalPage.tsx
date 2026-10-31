import React, { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { useAuthStore } from "../features/auth/authStore";
import { useAppStore } from "../stores/appStore";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { prepareBhavishyaV1Data, captureBhavishyaV1Pdf } from "../features/premiumPdf/bhavishyaV1Service";
import { PdfTemplate } from "../components/RamanBhavishya/PdfTemplate";
import { JananaKundaliPrintTemplate } from "../components/packageDownload/JananaKundaliPrintTemplate";
import { GokarnaKundaliTemplate } from "../components/template/GokarnaKundaliTemplate";
import { DashaPdfTemplate } from "../components/kundli/DashaPdfTemplate";
import { exportPanchangaWithDashaPdf } from "../core/ExportUtils";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { generateKundliRemedyReport, type KundliRemedyDiagnosis } from "../features/remedies/kundliRemedyEngine";
import {
  getOmkarZipFileName,
  getOmkarWhatsAppShareUrl,
  packageOmkarPremiumZip
} from "../features/omkarDesk/omkarDeskService";
import {
  generateCompactGoogleCalendarUrlForQR,
  calculateDeterministicRhythmDay,
  downloadIcsFile,
  generateSevaICalendarString,
  getSafeProductionOrigin
} from "../features/seva/icsCalendarGenerator";
import { createConsultationSession, encodeSecureConsultationToken } from "../features/consultation/consultationDbService";
import { resolvePlaceOrPincode } from "../services/locationApi";
import { transliterateName } from "../utils/transliterator";
import { sendEmailNotification } from "../features/notifications/notificationService";
import { type PackageLang } from "../components/packageDownload/packageDownloadLocale";
import { encodeDevoteeToken } from "../utils/tokenCipher";
import { registerCalendarAtGeneration } from "../features/seva/calendarVisitService";
import { PriestQrCard1PageTemplate } from "../components/seva/pdf/PriestQrCard1PageTemplate";
import { nakshatraName } from "../features/seva/sevaPresentation";

const PRIEST_DEFAULT_NAME = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
const PRIEST_DEFAULT_PHONE = "9972339362";
const NOTIFICATION_TARGET_EMAIL = "spshreepandit@gmail.com";

export default function OmkarDeskPortalPage(): JSX.Element {
  const { isAuthenticated, currentUser, login, logout } = useAuthStore();
  const setAppPage = useAppStore((s) => s.setPage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);

  // Authentication state for standalone desk operator
  const isOmkarUser = isAuthenticated && currentUser?.toLowerCase() === "omkar";
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Workflow State: 1 = Customer Input & Geocoding, 2 = 3-Offering Action Dashboard
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Devotee Input Fields
  const [devoteeName, setDevoteeName] = useState("Ramesh Hegde");
  const [selectedLang, setSelectedLang] = useState<PackageLang>("kn");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [locationInput, setLocationInput] = useState("Gokarna");
  const [resolvedPlaceName, setResolvedPlaceName] = useState("Gokarna, Karnataka");
  const [resolvedPincode, setResolvedPincode] = useState("581326");
  const [latitude, setLatitude] = useState(14.5479);
  const [longitude, setLongitude] = useState(74.3188);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationVerified, setLocationVerified] = useState(true);

  const [birthDate, setBirthDate] = useState("1995-05-15");
  const [birthTime, setBirthTime] = useState("10:30");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [gotra, setGotra] = useState("Kashyapa / Shiva");

  // Poster 1 Offering Options
  const [includeRemedy, setIncludeRemedy] = useState(false);
  const [isDownloadingKundli, setIsDownloadingKundli] = useState(false);
  const [isDownloadingBhavishyaV1, setIsDownloadingBhavishyaV1] = useState(false);
  const [isDownloadingRemedy, setIsDownloadingRemedy] = useState(false);

  // Omkar Dedicated Premium Download (Only 3 Selectable Options)
  const [selectedJananaKundli, setSelectedJananaKundli] = useState(true);
  const [selectedBhavishyaV1, setSelectedBhavishyaV1] = useState(true);
  const [selectedRemedy, setSelectedRemedy] = useState(true);

  // ZIP packaging progress & state
  const [isPackagingZip, setIsPackagingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipProgressStage, setZipProgressStage] = useState("");
  const [lastDownloadedZip, setLastDownloadedZip] = useState<string | null>(null);

  // Poster 2 Calendar State
  const [calendarQrDataUrl, setCalendarQrDataUrl] = useState<string>("");
  const [calendarGoogleUrl, setCalendarGoogleUrl] = useState<string>("");
  const [calendarDirectDailyUrl, setCalendarDirectDailyUrl] = useState<string>("");
  const [isDownloadingPriestCard, setIsDownloadingPriestCard] = useState(false);

  // Poster 3 Live Consultation Link State
  const [isGeneratingLiveLink, setIsGeneratingLiveLink] = useState(false);
  const [liveSessionUrl, setLiveSessionUrl] = useState<string>("");
  const [liveSessionQrUrl, setLiveSessionQrUrl] = useState<string>("");
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);

  // DOM container refs
  const [bhavishyaV1Payload, setBhavishyaV1Payload] = useState<any>(null);
  const bhavishyaV1Ref = useRef<HTMLDivElement>(null);
  const traditionalExportRef = useRef<HTMLDivElement>(null);
  const dashaExportRef = useRef<HTMLDivElement>(null);
  const priestCardRef = useRef<HTMLDivElement>(null);

  // Live Transliterated Devotee Name into Target Script
  const transliteratedDevoteeName = useMemo(() => {
    if (!devoteeName.trim()) return "";
    return transliterateName(devoteeName.trim(), selectedLang);
  }, [devoteeName, selectedLang]);

  // Guaranteed Effective Name in Selected Language
  const effectiveDevoteeName = useMemo(() => {
    if (transliteratedDevoteeName && transliteratedDevoteeName.trim()) {
      return transliteratedDevoteeName.trim();
    }
    return (devoteeName || "Devotee").trim();
  }, [transliteratedDevoteeName, devoteeName]);

  // Compute Kundli output
  const kundliResult: KundliOutput = useMemo(() => {
    try {
      const input: KundliInput = {
        name: effectiveDevoteeName,
        birthDate,
        birthTime,
        latitude,
        longitude,
        gender: gender === "female" ? "Female" : "Male"
      };
      return calculateKundli(input, { ayanamsaModel: "lahiri" });
    } catch (e) {
      console.warn("[OmkarDesk] Fallback Kundli computation:", e);
      return calculateKundli(
        {
          name: "Ramesh Hegde",
          birthDate: "1995-05-15",
          birthTime: "10:30",
          latitude: 14.5479,
          longitude: 74.3188,
          gender: "Male"
        },
        { ayanamsaModel: "lahiri" }
      );
    }
  }, [effectiveDevoteeName, birthDate, birthTime, latitude, longitude, gender]);

  // Compute Traditional Baggona Panchanga math for Page 1 of Kundli
  const birthDateObj = useMemo(() => {
    if (!birthDate) return new Date();
    const parts = birthDate.split("-").map(Number);
    return new Date(parts[0] || 1995, ((parts[1] || 5) - 1), parts[2] || 15);
  }, [birthDate]);

  const traditionalData = useMemo(() => {
    if (!birthDate || !birthTime) return null;
    return calculateTraditionalBaggona(
      birthDate,
      birthTime,
      latitude,
      longitude,
      "lahiri",
      resolvedPincode
    );
  }, [birthDate, birthTime, latitude, longitude, resolvedPincode]);

  const isDayBirthComputed = useMemo(() => {
    if (!birthTime) return true;
    const parts = birthTime.split(":").map(Number);
    const birthMins = (parts[0] || 0) * 60 + (parts[1] || 0);

    let sunriseMins = 6 * 60;
    let sunsetMins = 18 * 60;

    if (traditionalData?.sunrise && traditionalData.sunrise.includes(":")) {
      const sp = traditionalData.sunrise.split(":");
      const sh = parseInt(sp[0] || "6", 10);
      const sm = parseInt(sp[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunriseMins = sh * 60 + sm;
    }
    if (traditionalData?.sunset && traditionalData.sunset.includes(":")) {
      const sp = traditionalData.sunset.split(":");
      const sh = parseInt(sp[0] || "18", 10);
      const sm = parseInt(sp[1] || "0", 10);
      if (!isNaN(sh) && !isNaN(sm)) sunsetMins = sh * 60 + sm;
    }

    return birthMins >= sunriseMins && birthMins < sunsetMins;
  }, [birthTime, traditionalData?.sunrise, traditionalData?.sunset]);

  const kundliSession = useMemo(() => {
    return {
      result: kundliResult,
      input: {
        name: effectiveDevoteeName,
        birthDate,
        birthTime,
        latitude,
        longitude,
        gender: gender === "female" ? "Female" : "Male",
        maritalStatus: "married",
        childrenStatus: "has_children"
      },
      birthDateYmd: birthDate,
      birthTimeHm: birthTime,
      homePlaceName: resolvedPlaceName,
      placeLabel: resolvedPlaceName,
      dasha: [],
      dailyPrediction: ""
    };
  }, [kundliResult, effectiveDevoteeName, birthDate, birthTime, latitude, longitude, gender, resolvedPlaceName]);

  // Compute Remedy Diagnosis for Kundli
  const remedyDiagnosis: KundliRemedyDiagnosis = useMemo(() => {
    return generateKundliRemedyReport(kundliResult, {
      name: effectiveDevoteeName,
      birthDate,
      birthTime,
      latitude,
      longitude,
      gender: gender === "female" ? "Female" : "Male"
    });
  }, [kundliResult, effectiveDevoteeName, birthDate, birthTime, latitude, longitude, gender]);

  // Geocode location resolver
  const handleResolveLocation = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : locationInput).trim();
    if (!q) return;
    setIsResolvingLocation(true);
    try {
      const res = await resolvePlaceOrPincode(q);
      if (res && res.lat && res.lng) {
        setLatitude(res.lat);
        setLongitude(res.lng);
        setResolvedPlaceName(res.placeName || q);
        if (res.pincode) setResolvedPincode(res.pincode);
        setLocationVerified(true);
      }
    } catch (err) {
      console.error("[OmkarDesk] Error resolving place:", err);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  // Debounced auto-resolve when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationInput.trim().length >= 3) {
        void handleResolveLocation(locationInput);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [locationInput]);

  // Generate Google Calendar URL & QR code for 30 Days (matching Seva & Prasada PriestQrGeneratorTab)
  useEffect(() => {
    let isCancelled = false;
    async function prepare30DayCalendar() {
      try {
        const moonPlanet = kundliResult.planets.find((p) => p.name === PlanetName.Moon);
        const nakIdx = moonPlanet?.nakshatra?.index ?? 18;
        const rashiIdx = kundliResult.moonSign?.index ?? moonPlanet?.rashi?.index ?? 8;
        const origin = getSafeProductionOrigin();

        // 1. Encode 30-day token with native name in selected language
        const token = encodeDevoteeToken({
          n: effectiveDevoteeName,
          nk: nakIdx,
          r: rashiIdx,
          g: gotra || "Kashyapa",
          p: PRIEST_DEFAULT_NAME,
          d: new Date().toISOString().slice(0, 10),
          days: 30,
          l: selectedLang,
          dob: birthDate,
          tob: birthTime,
          phone: PRIEST_DEFAULT_PHONE,
          overrideCalendarPhone: true
        });

        // 2. Register calendar visit
        void registerCalendarAtGeneration({
          userName: effectiveDevoteeName,
          token,
          startDate: new Date().toISOString().slice(0, 10),
          durationDays: 30,
          priestName: PRIEST_DEFAULT_NAME,
          priestPhone: PRIEST_DEFAULT_PHONE,
          nakshatraIndex: nakIdx,
          rashiIndex: rashiIdx,
          gotra: gotra || "Kashyapa",
          dob: birthDate,
          tob: birthTime,
          source: "priest_qr"
        });

        // 3. Official Baggona Daily Darshana URL
        const payloadDailyUrl = `${origin}/daily?token=${token}&action=ics&lang=${selectedLang}`;

        // 4. Compact Google Calendar Direct Sync URL
        const rhythmDays = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const ymd = d.toISOString().slice(0, 10);
          return calculateDeterministicRhythmDay(ymd, nakIdx, rashiIdx, selectedLang);
        });

        const calGoogleUrl = generateCompactGoogleCalendarUrlForQR({
          days: rhythmDays,
          lang: selectedLang,
          panditName: PRIEST_DEFAULT_NAME,
          priestPhone: PRIEST_DEFAULT_PHONE,
          notificationTime: "06:30",
          personName: effectiveDevoteeName,
          pincode: resolvedPincode,
          lat: latitude,
          lng: longitude,
          locationName: resolvedPlaceName,
          dob: birthDate,
          tob: birthTime,
          birthNakshatraIndex: nakIdx,
          birthRashiIndex: rashiIdx
        });

        if (!isCancelled) {
          setCalendarDirectDailyUrl(payloadDailyUrl);
          setCalendarGoogleUrl(calGoogleUrl);

          // Generate high-contrast, scannable QR code of the Daily Darshana URL
          const qrData = await QRCode.toDataURL(payloadDailyUrl, {
            errorCorrectionLevel: "M",
            width: 320,
            margin: 2,
            color: { dark: "#78350f", light: "#fffdfa" }
          });
          if (!isCancelled) setCalendarQrDataUrl(qrData);
        }
      } catch (err) {
        console.error("[OmkarDesk] Failed preparing 30-day calendar QR:", err);
      }
    }

    if (currentStep === 2) {
      void prepare30DayCalendar();
    }

    return () => {
      isCancelled = true;
    };
  }, [currentStep, kundliResult, selectedLang, effectiveDevoteeName, birthDate, birthTime, gotra, resolvedPincode, resolvedPlaceName, latitude, longitude]);

  // Send Notification Email to spshreepandit@gmail.com
  const dispatchOrderNotification = async (offeringTitle: string, priceAmount: number, extraNotes?: string) => {
    try {
      const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #D4AF37; border-radius: 8px; padding: 20px; background: #FFFDF9;">
          <h2 style="color: #8B0000; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">
            🕉️ Baggona Panchanga — New Counter Order Generated
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #FFF3CD;">
              <td style="padding: 10px; font-weight: bold; width: 40%;">Service / Offering:</td>
              <td style="padding: 10px; font-weight: bold; color: #8B0000;">${offeringTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Amount Collected:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #008000;">₹${priceAmount}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Desk Operator:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>omkar</strong> (Hotel Counter)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Devotee Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${devoteeName}</strong> (${transliteratedDevoteeName})</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">WhatsApp Mobile:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong><a href="https://wa.me/91${whatsappNumber}">+91 ${whatsappNumber}</a></strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Date & Time of Birth:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${birthDate} at ${birthTime}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Resolved Location:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${resolvedPlaceName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Language:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${selectedLang.toUpperCase()}</td>
            </tr>
            <tr style="background: #fafafa;">
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Timestamp:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${timeStr}</td>
            </tr>
            ${extraNotes ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Extra Details:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${extraNotes}</td>
            </tr>
            ` : ""}
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
            ॥ ೧೪೦ ವರ್ಷಗಳ ಪರಂಪರೆಯ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362) ॥
          </p>
        </div>
      `;

      await sendEmailNotification({
        to: NOTIFICATION_TARGET_EMAIL,
        subject: `[Baggona Counter] 📜 ${offeringTitle} Generated for ${devoteeName} (+91 ${whatsappNumber})`,
        html: htmlBody,
        type: "system_alert",
        data: {
          operator: "omkar",
          devoteeName,
          transliteratedName: transliteratedDevoteeName,
          whatsappNumber,
          birthDate,
          birthTime,
          place: resolvedPlaceName,
          lat: latitude,
          lng: longitude,
          service: offeringTitle,
          amount: priceAmount,
          lang: selectedLang,
          timestamp: timeStr
        }
      });
      console.log(`[OmkarDesk] Notification email dispatched to ${NOTIFICATION_TARGET_EMAIL}`);
    } catch (err) {
      console.warn("[OmkarDesk] Failed sending email notification:", err);
    }
  };

  // Login handler for desk operator
  const handleOperatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword) {
      setLoginError("ದಯವಿಟ್ಟು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (Please enter password).");
      return;
    }
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await login("omkar", loginPassword, { skipMfa: true });
      if (!res.success) {
        setLoginError(res.error || "ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.");
      }
    } catch (err: any) {
      setLoginError(err?.message || "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Step 1 Validation & Proceed
  const handleProceedToDashboard = () => {
    if (!devoteeName.trim()) {
      alert("ದಯವಿಟ್ಟು ಗ್ರಾಹಕರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (Please enter Devotee Name).");
      return;
    }
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ೧೦-ಅಂಕಿಯ WhatsApp ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (Please enter 10-digit WhatsApp number).");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Action: Master 1-Click ZIP Download for Omkar Desk
  const handleDownloadPremiumZip = async () => {
    if (!selectedJananaKundli && !selectedBhavishyaV1 && !selectedRemedy) {
      alert("ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ವರದಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (Please select at least one report).");
      return;
    }

    setIsPackagingZip(true);
    setZipProgress(5);
    setZipProgressStage("ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ (Initializing)...");

    try {
      const safeName = (devoteeName || "Devotee")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\p{L}\p{M}\p{N}_]+/gu, "")
        .replace(/^_+|_+$/g, "") || "Devotee";

      let jananaKundliBlob: Blob | null = null;
      let bhavishyaV1Blob: Blob | null = null;
      let remedyBlob: Blob | null = null;

      // 1. Generate Baggona Janana Kundali & Dasha PDF if selected
      if (selectedJananaKundli) {
        setZipProgress(20);
        setZipProgressStage("೧/೩ ಜನನ ಕುಂಡಲಿ PDF ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ (1/3 Janana Kundali)...");
        const traditionalEl = traditionalExportRef.current;
        const dashaEl = dashaExportRef.current;
        let kundliPdf: jsPDF;
        if (traditionalEl && dashaEl) {
          kundliPdf = await exportPanchangaWithDashaPdf(
            traditionalEl,
            dashaEl,
            `01_${safeName}_Baggona_Janana_Kundali.pdf`,
            false
          );
        } else if (traditionalEl) {
          kundliPdf = await generatePDFFromElement(
            "omkar-traditional-container",
            `01_${safeName}_Baggona_Janana_Kundali.pdf`,
            false
          );
        } else {
          kundliPdf = await generatePDFFromElement(
            "omkar-kundli-container",
            `01_${safeName}_Baggona_Janana_Kundali.pdf`,
            false
          );
        }
        jananaKundliBlob = kundliPdf.output("blob");
      }

      // 2. Generate Premium Bhavishya V1 PDF if selected
      if (selectedBhavishyaV1) {
        setZipProgress(45);
        setZipProgressStage("೨/೩ ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ V1 ಗಣನೆಯಾಗುತ್ತಿದೆ (2/3 Bhavishya V1)...");

        const sessionObj = {
          result: kundliResult,
          input: {
            name: effectiveDevoteeName,
            birthDate,
            birthTime,
            latitude,
            longitude,
            gender: gender === "female" ? "Female" : "Male",
            maritalStatus: "married",
            childrenStatus: "has_children"
          },
          birthDateYmd: birthDate,
          birthTimeHm: birthTime,
          homePlaceName: resolvedPlaceName,
          placeLabel: resolvedPlaceName,
          dasha: [],
          dailyPrediction: ""
        };

        const payload = await prepareBhavishyaV1Data(
          sessionObj as any,
          selectedLang,
          geminiApiKey,
          { maritalStatus: "married", childrenStatus: "has_children" },
          (stage) => {
            setZipProgressStage(`ಭವಿಷ್ಯ V1: ${stage}...`);
          }
        );
        setBhavishyaV1Payload(payload);
        await new Promise((r) => setTimeout(r, 1000));

        if (bhavishyaV1Ref.current) {
          const v1Pdf = await captureBhavishyaV1Pdf(
            bhavishyaV1Ref.current,
            `02_${safeName}_Baggona_Bhavishya_V1.pdf`,
            false,
            { payload, lang: selectedLang }
          );
          bhavishyaV1Blob = v1Pdf.output("blob");
        }
      }

      // 3. Generate Remedy PDF if selected
      if (selectedRemedy) {
        setZipProgress(75);
        setZipProgressStage("೩/೩ ದೈವಿಕ ಪರಿಹಾರ ವರದಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ (3/3 Remedy)...");
        const remedyPdf = await generatePDFFromElement(
          "omkar-remedy-container",
          `03_${safeName}_Baggona_Remedy.pdf`,
          false
        );
        remedyBlob = remedyPdf.output("blob");
      }

      // 4. Package into ZIP
      setZipProgress(88);
      setZipProgressStage("ZIP ಕಡತವನ್ನು ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ (Packaging ZIP archive)...");

      const result = await packageOmkarPremiumZip({
        devoteeName,
        selectedLang,
        jananaKundliBlob,
        bhavishyaV1Blob,
        remedyBlob,
        onProgress: (pct, stage) => {
          setZipProgress(pct);
          setZipProgressStage(stage);
        }
      });

      // 5. Download the ZIP file
      const downloadUrl = URL.createObjectURL(result.zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = result.zipFileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 2000);

      setLastDownloadedZip(result.zipFileName);
      setZipProgress(100);
      setZipProgressStage("🎉 ಪ್ರೀಮಿಯಂ ZIP ಡೌನ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡಿದೆ!");

      // Dispatch order notification email
      const selectedList = [
        selectedJananaKundli ? "Baggona Janana Kundali" : null,
        selectedBhavishyaV1 ? "Premium PDF V1" : null,
        selectedRemedy ? "Remedy PDF" : null
      ].filter(Boolean).join(" + ");

      void dispatchOrderNotification(
        `Omkar Premium ZIP: ${selectedList}`,
        selectedJananaKundli && selectedBhavishyaV1 && selectedRemedy ? 500 : 350,
        `Archive: ${result.zipFileName} (${result.includedFiles.join(", ")}) for ${effectiveDevoteeName}`
      );
    } catch (err: any) {
      console.error("[OmkarDesk] Error generating ZIP package:", err);
      alert("ZIP ನಿರ್ಮಾಣದಲ್ಲಿ ದೋಷ: " + (err?.message || "Error generating ZIP"));
    } finally {
      setIsPackagingZip(false);
    }
  };

  // Action: WhatsApp Dispatcher with attached zip message
  const handleSendZipWhatsapp = () => {
    const selectedList = [
      selectedJananaKundli ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ" : null,
      selectedBhavishyaV1 ? "ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ವರದಿ V1" : null,
      selectedRemedy ? "ದೈವಿಕ ಪರಿಹಾರ ವರದಿ" : null
    ].filter(Boolean) as string[];

    const zipName = lastDownloadedZip || getOmkarZipFileName(devoteeName);
    const shareUrl = getOmkarWhatsAppShareUrl({
      whatsappNumber,
      devoteeName: effectiveDevoteeName,
      zipFileName: zipName,
      birthDate,
      birthTime,
      place: resolvedPlaceName,
      selectedOptions: selectedList
    });

    window.open(shareUrl, "_blank");
  };

  // Action: Download Baggona Janana Kundali & Dasha PDF (Official 2-Page Document)
  const handleDownloadJananaKundli = async () => {
    try {
      setIsDownloadingKundli(true);
      const safeName = effectiveDevoteeName.replace(/[^\p{L}\p{N}]+/gu, "_") || "Devotee";
      const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
      const langName = langNames[selectedLang] || "Kannada";
      const baseFileName = `Baggona_Janana_Kundali_Dasha_${langName}_${safeName}`;

      const traditionalEl = traditionalExportRef.current;
      const dashaEl = dashaExportRef.current;

      if (traditionalEl && dashaEl) {
        await exportPanchangaWithDashaPdf(traditionalEl, dashaEl, baseFileName, true);
      } else if (traditionalEl) {
        await generatePDFFromElement("omkar-traditional-container", `${baseFileName}.pdf`, true);
      } else {
        await generatePDFFromElement("omkar-kundli-container", `${baseFileName}.pdf`, true);
      }

      void dispatchOrderNotification(
        "Poster 1: Baggona Janana Kundali & Dasha PDF",
        includeRemedy ? 410 : 320,
        `Kundli & Dasha PDF (${langName}) Downloaded for ${effectiveDevoteeName}`
      );
    } catch (err: any) {
      alert("Kundli download error: " + (err?.message || "Error"));
    } finally {
      setIsDownloadingKundli(false);
    }
  };

  // Action: Download Bhavishya V1 PDF (Official Baggona Divya Bhavishya V1)
  const handleDownloadBhavishyaV1 = async () => {
    try {
      setIsDownloadingBhavishyaV1(true);
      const safeName = effectiveDevoteeName.replace(/[^\p{L}\p{N}]+/gu, "_") || "Devotee";
      const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
      const langName = langNames[selectedLang] || "English";
      const fileName = `Baggona_Panchanga_Prediction_V1_${langName}_${safeName}.pdf`;

      const sessionObj = {
        result: kundliResult,
        input: {
          name: effectiveDevoteeName,
          birthDate,
          birthTime,
          latitude,
          longitude,
          gender: gender === "female" ? "Female" : "Male",
          maritalStatus: "married",
          childrenStatus: "has_children"
        },
        birthDateYmd: birthDate,
        birthTimeHm: birthTime,
        homePlaceName: resolvedPlaceName,
        placeLabel: resolvedPlaceName,
        dasha: [],
        dailyPrediction: ""
      };

      const payload = await prepareBhavishyaV1Data(
        sessionObj as any,
        selectedLang,
        geminiApiKey,
        { maritalStatus: "married", childrenStatus: "has_children" },
        () => {}
      );
      setBhavishyaV1Payload(payload);
      await new Promise((r) => setTimeout(r, 800));

      if (bhavishyaV1Ref.current) {
        await captureBhavishyaV1Pdf(bhavishyaV1Ref.current, fileName, true, {
          payload,
          lang: selectedLang
        });
      }

      void dispatchOrderNotification(
        includeRemedy ? "Poster 1: Premium Bhavishya V1 + Remedy" : "Poster 1: Premium Bhavishya V1 PDF",
        includeRemedy ? 410 : 320,
        `Bhavishya V1 PDF (${langName}) Generated for ${effectiveDevoteeName}`
      );
    } catch (err: any) {
      alert("Bhavishya V1 download error: " + (err?.message || "Error"));
    } finally {
      setIsDownloadingBhavishyaV1(false);
    }
  };

  // Action: Download Remedy PDF
  const handleDownloadRemedyPdf = async () => {
    try {
      setIsDownloadingRemedy(true);
      const safeName = effectiveDevoteeName.replace(/[^\p{L}\p{N}]+/gu, "_") || "Devotee";
      const fileName = `${safeName}_Remedial_Upaya_${selectedLang}.pdf`;
      await generatePDFFromElement("omkar-remedy-container", fileName, true);
      void dispatchOrderNotification("Poster 1: Remedial Upaya PDF", 410, `Remedy Report Downloaded for ${effectiveDevoteeName}`);
    } catch (err: any) {
      alert("Remedy download error: " + (err?.message || "Error"));
    } finally {
      setIsDownloadingRemedy(false);
    }
  };

  // Action: Download 30-Day .ICS file
  const handleDownloadIcsFile = () => {
    try {
      const moonPlanet = kundliResult.planets.find((p) => p.name === PlanetName.Moon);
      const nakIdx = moonPlanet?.nakshatra?.index ?? 18;
      const rashiIdx = kundliResult.moonSign?.index ?? moonPlanet?.rashi?.index ?? 8;
      const startDateStr = new Date().toISOString().slice(0, 10);

      const icsString = generateSevaICalendarString({
        personName: effectiveDevoteeName,
        priestName: PRIEST_DEFAULT_NAME,
        priestPhone: PRIEST_DEFAULT_PHONE,
        days: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return calculateDeterministicRhythmDay(d.toISOString().slice(0, 10), nakIdx, rashiIdx, selectedLang);
        }),
        lang: selectedLang,
        birthNakshatraIndex: nakIdx,
        birthRashiIndex: rashiIdx,
        startDateStr,
        lat: latitude,
        lng: longitude,
        pincode: resolvedPincode,
        locationName: resolvedPlaceName,
        dob: birthDate,
        tob: birthTime,
        gotra: gotra || "Kashyapa"
      });

      const safeName = effectiveDevoteeName.replace(/[^\p{L}\p{N}]+/gu, "_") || "Devotee";
      downloadIcsFile(`${safeName}_30Day_Panchanga_Calendar.ics`, icsString);
      void dispatchOrderNotification("Poster 2: 30-Day Calendar .ICS File", 280, `30-Day Calendar Downloaded for ${effectiveDevoteeName}`);
    } catch (err: any) {
      alert("ICS download error: " + (err?.message || "Error"));
    }
  };

  // Action: Download Priest Ashirvada QR Card (1-Page A4 PDF from Seva & Prasada)
  const handleDownloadPriestCardPdf = async () => {
    const container = document.getElementById("priest-qr-card-1page-container");
    if (!container) {
      alert("Priest QR Card container not found");
      return;
    }
    setIsDownloadingPriestCard(true);
    try {
      const canvas = await html2canvas(container, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#FFFDF7",
        logging: false
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.88);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const safeName = effectiveDevoteeName.replace(/[^\p{L}\p{N}]+/gu, "_") || "Devotee";
      pdf.save(`Baggona_Priest_QR_Card_${safeName}_30Days_${selectedLang.toUpperCase()}.pdf`);

      void dispatchOrderNotification(
        "Poster 2: Priest Ashirvada QR Card (1-Page A4 PDF)",
        280,
        `Priest QR Card A4 PDF Downloaded for ${effectiveDevoteeName}`
      );
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("Error generating 1-page A4 PDF card.");
    } finally {
      setIsDownloadingPriestCard(false);
    }
  };

  // Action: Generate 20-Minute Instant Live Link
  const handleGenerateLiveSession = async () => {
    setIsGeneratingLiveLink(true);
    try {
      const session = await createConsultationSession({
        name: effectiveDevoteeName,
        dob: birthDate,
        tob: birthTime,
        place: resolvedPlaceName,
        lat: latitude,
        lng: longitude,
        timezone: 5.5,
        language: (["kn", "en", "hi", "te", "ta"].includes(selectedLang) ? selectedLang : "kn") as any
      });

      const secureToken = encodeSecureConsultationToken(session.id);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://baggona-astrology.web.app";
      const fullUrl = `${baseUrl}/consultation?id=${encodeURIComponent(secureToken)}&session=${session.id}`;
      setLiveSessionUrl(fullUrl);

      const qr = await QRCode.toDataURL(fullUrl, {
        width: 280,
        margin: 2,
        color: { dark: "#701a75", light: "#ffffff" }
      });
      setLiveSessionQrUrl(qr);

      void dispatchOrderNotification("Poster 3: 20-Min Live Priest Session Link", 450, `Live URL: ${fullUrl} for ${effectiveDevoteeName}`);
    } catch (err: any) {
      alert("Error generating live consultation link: " + (err?.message || "Error"));
    } finally {
      setIsGeneratingLiveLink(false);
    }
  };

  // WhatsApp Message Dispatches
  const handleSendKundliWhatsapp = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const msg =
      `*॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಜನನ ಕುಂಡಲಿ & ಭವಿಷ್ಯ ವರದಿ ॥*\n\n` +
      `ನಮಸ್ಕಾರ ${effectiveDevoteeName},\n` +
      `ನಿಮ್ಮ ೧೪೦ ವರ್ಷಗಳ ಪರಂಪರೆಯ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜಾತಕ ಫಲ ಸಿದ್ಧವಾಗಿದೆ.\n` +
      `• ಗ್ರಾಹಕರು: *${effectiveDevoteeName}*\n` +
      `• ಜನ್ಮ ದಿನಾಂಕ: *${birthDate} ${birthTime}*\n` +
      `• ಸ್ಥಳ: *${resolvedPlaceName}*\n` +
      `• ಸೇವೆ: *${includeRemedy ? "ಜನನ ಕುಂಡಲಿ + ಭವಿಷ್ಯ + ಪರಿಹಾರ ವರದಿ (₹410)" : "ಪ್ರೀಮಿಯಂ ಜನನ ಕುಂಡಲಿ & ಭವಿಷ್ಯ V1 (₹320)"}*\n\n` +
      `ಧನ್ಯವಾದಗಳು!\n— ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)`;
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSendCalendarWhatsapp = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const msg =
      `*॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ೩೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ॥*\n\n` +
      `ನಮಸ್ಕಾರ ${effectiveDevoteeName},\n` +
      `ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ವಿಶೇಷವಾಗಿ ತಯಾರಿಸಿದ ೩೦ ದಿನಗಳ ಡಿಜಿಟಲ್ ದರ್ಶನ & ಕ್ಯಾಲೆಂಡರ್ ಲಿಂಕ್:\n` +
      `${calendarDirectDailyUrl || calendarGoogleUrl || "https://baggona-astrology.web.app"}\n\n` +
      `• ಹಸಿರು: ಶುಭ ಶಕ್ತಿ & ಖರೀದಿ | ಹಳದಿ: ಸಮತೋಲನ | ಕೆಂಪು: ಜಾಗರೂಕತೆ\n` +
      `— ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)`;
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSendLiveSessionWhatsapp = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const msg =
      `*॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ೨೦ ನಿಮಿಷಗಳ ಲೈವ್ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ ॥*\n\n` +
      `ನಮಸ್ಕಾರ ${effectiveDevoteeName},\n` +
      `ನಿಮ್ಮ ಖಾಸಗಿ ೨೦ ನಿಮಿಷಗಳ ಲೈವ್ ಸಮಾಲೋಚನಾ ಲಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ:\n` +
      `${liveSessionUrl}\n\n` +
      `• ಈ ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಧ್ವನಿ (Audio) ಬಟನ್ ಒತ್ತಿ ಮುಕ್ತವಾಗಿ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.\n` +
      `• ೧೦೦% ಖಾಸಗಿ & ಗೌಪ್ಯ.\n\n` +
      `— ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)`;
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  // If NOT logged in as omkar, render the Dedicated Desk Login Screen
  if (!isOmkarUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-amber-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🕉️</span>
            <h1 className="text-2xl font-black tracking-wide text-amber-300">
              ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
            </h1>
            <p className="text-xs font-semibold text-amber-400/80 mt-1 uppercase tracking-wider">
              ಹೋಟೆಲ್ ಕೌಂಟರ್ ಡೆಸ್ಕ್ ಲಾಗಿನ್ (Hotel Desk Operator)
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ೧೪೦ ವರ್ಷಗಳ ಪರಂಪರೆಯ ಗ್ರಾಹಕ ವರದಿಗಳ ವಿತರಣಾ ಕೌಂಟರ್
            </p>
          </div>

          <form onSubmit={handleOperatorLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                ಯೂಸರ್‌ನೇಮ್ (Username)
              </label>
              <input
                type="text"
                readOnly
                value="omkar"
                className="w-full bg-slate-800/80 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                ಪಾಸ್‌ವರ್ಡ್ (Password)
              </label>
              <input
                type="password"
                required
                placeholder="ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-amber-400/70 mt-1">
                Default Desk Password: <code className="text-amber-300 font-bold">Omkar@Baggona2026</code>
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-xs text-red-300">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "ಲಾಗಿನ್ ಆಗಿ (Sign In to Desk) ➔"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            ಪಂಡಿತರ ಸಂಪರ್ಕ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DESK CONSOLE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-amber-500/30 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕉️</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-amber-300 tracking-wide">
                ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಹೋಟೆಲ್ ಡೆಸ್ಕ್ ಕೌಂಟರ್
              </h1>
              <p className="text-[11px] text-amber-200/80">
                ಆಪರೇಟರ್: <strong className="text-amber-300">omkar</strong> • ಪಂಡಿತರ ನೇರ ಸಂಪರ್ಕ: <strong>ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold rounded-lg hover:bg-red-900/60 transition cursor-pointer"
            >
              ಲಾಗ್ ಔಟ್ (Logout)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* STEP 1: DEVOTEE REGISTRATION & GEOCODING */}
        {currentStep === 1 && (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                ಹಂತ ೧ / Step 1
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 mt-2">
                ಗ್ರಾಹಕರ / ಭಕ್ತರ ವಿವರಗಳ ನೋಂದಣಿ (Devotee Intake)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ಗ್ರಾಹಕರ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ. ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಗೆ ಹೆಸರು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪರಿವರ್ತನೆಯಾಗುತ್ತದೆ.
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Language Selection */}
              <div>
                <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-2">
                  ೧. ವರದಿ ಭಾಷೆ ಆಯ್ಕೆ (Select Target Language)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                    { code: "en", label: "English" },
                    { code: "hi", label: "हिन्दी (Hindi)" },
                    { code: "te", label: "తెలుగు (Telugu)" },
                    { code: "ta", label: "தமிழ் (Tamil)" }
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setSelectedLang(l.code as PackageLang)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        selectedLang === l.code
                          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-400/50"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Devotee Name & Live Transliteration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                    ೨. ಭಕ್ತರ ಹೆಸರು (Devotee Name in English/Native) *
                  </label>
                  <input
                    type="text"
                    required
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="e.g. Ramesh Hegde / Suresh Pai"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-amber-400/80">
                    ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ಮುದ್ರಣವಾಗುವ ಹೆಸರು (Report Script Preview):
                  </span>
                  <span className="text-base font-black text-amber-200 mt-0.5 truncate">
                    {transliteratedDevoteeName || "ಹೆಸರು ನಮೂದಿಸಿ..."}
                  </span>
                </div>
              </div>

              {/* 3. WhatsApp Mobile Number */}
              <div>
                <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                  ೩. ಗ್ರಾಹಕರ WhatsApp ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (WhatsApp Mobile Number) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 border border-slate-700 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="೧೦-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (e.g. 9845012345)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 ವರದಿಯ ಡಿಜಿಟಲ್ ಕಾಪಿ ಮತ್ತು ಲಿಂಕ್ ಅನ್ನು ನೇರವಾಗಿ ಈ WhatsApp ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.
                </p>
              </div>

              {/* 4. Location: City Name or Pincode Resolution */}
              <div>
                <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                  ೪. ಊರು ಅಥವಾ ಪಿನ್‌ಕೋಡ್ (City Name or 6-Digit Pincode) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setLocationVerified(false);
                    }}
                    placeholder="e.g. Gokarna / Sirsi / 581326 / Bengaluru"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleResolveLocation()}
                    disabled={isResolvingLocation}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer"
                  >
                    {isResolvingLocation ? "ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "ದೃಢೀಕರಿಸಿ (Verify)"}
                  </button>
                </div>

                {/* Resolved Geocode Details Display */}
                {locationVerified && (
                  <div className="mt-2 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-300">✓ ಸ್ಥಳ ದೃಢೀಕರಿಸಲಾಗಿದೆ:</span>{" "}
                      <span className="text-white font-semibold">{resolvedPlaceName}</span>
                      <span className="text-slate-400 ml-2">
                        (Lat: {latitude.toFixed(4)}°, Lng: {longitude.toFixed(4)}°)
                      </span>
                    </div>
                    <span className="text-[11px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded font-bold">
                      100% Accurate
                    </span>
                  </div>
                )}
              </div>

              {/* 5. Date & Time of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                    ೫. ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth) *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                    ೬. ಜನಿಸಿದ ಸಮಯ (Time of Birth - 24hr / AM-PM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. Gender & Gotra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                    ೭. ಲಿಂಗ (Gender)
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        className="accent-amber-400"
                      />
                      <span>ಗಂಡು (Male)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        className="accent-amber-400"
                      />
                      <span>ಹೆಣ್ಣು (Female)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                    ೮. ಗೋತ್ರ (Gotra - Optional)
                  </label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="e.g. Kashyapa / Vishvamitra"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Proceed Button */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleProceedToDashboard}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base py-3.5 rounded-xl shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ಜನರೇಟ್ ಮಾಡಿ & ಪ್ರೀಮಿಯಂ ಡೌನ್‌ಲೋಡ್ (Generate & Open Premium Download) ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OMKAR DEDICATED ACTION DASHBOARD */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Customer Summary Bar */}
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  ಪ್ರಸ್ತುತ ಭಕ್ತರ ವಿವರ (Active Devotee)
                </span>
                <h2 className="text-lg sm:text-xl font-black text-amber-200 mt-1">
                  {transliteratedDevoteeName || devoteeName}{" "}
                  <span className="text-sm font-normal text-slate-400">({devoteeName})</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  📱 +91 {whatsappNumber} • 📅 {birthDate} {birthTime} • 📍 {resolvedPlaceName} • 🌐 {selectedLang.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                ✏️ ವಿವರ ಬದಲಾಯಿಸಿ (Edit Details)
              </button>
            </div>

            {/* OMKAR DEDICATED PREMIUM DOWNLOAD CONSOLE */}
            <div className="space-y-6">
              {/* PRIMARY GOLD CARD: 3-PDF PREMIUM DOWNLOAD */}
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40">
                      👑 ಪ್ರೀಮಿಯಂ ಡೌನ್‌ಲೋಡ್ (PREMIUM DOWNLOAD)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-200 mt-2">
                      ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರೀಮಿಯಂ ZIP ಪ್ಯಾಕೇಜ್
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      ಕೇವಲ ಈ ೩ ವರದಿಗಳನ್ನು ಮಾತ್ರ ಆಯ್ಕೆ ಮಾಡಬಹುದು. ಆಯ್ಕೆ ಮಾಡಿದ ವರದಿಗಳು ಒಂದೇ ZIP ಕಡತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತವೆ.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/30">
                      ZIP: {getOmkarZipFileName(devoteeName)}
                    </span>
                  </div>
                </div>

                {/* 3 CHECKBOX OPTIONS (ONLY THESE THREE CAN BE SELECTED) */}
                <div className="space-y-3.5 mb-6">
                  {/* OPTION 1: BAGGONA PANCHA JANANA KUNDALI */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedJananaKundli
                        ? "bg-amber-950/40 border-amber-400 shadow-md shadow-amber-950/30"
                        : "bg-slate-900/60 border-slate-700 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedJananaKundli}
                      onChange={(e) => setSelectedJananaKundli(e.target.checked)}
                      className="h-5 w-5 accent-amber-400 mt-0.5 cursor-pointer rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-base font-black text-amber-200">
                          ೧. ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ (Baggona Pancha Janana Kundali)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 self-start sm:self-auto">
                          ಅಧಿಕೃತ ೨-ಪುಟ ಜಾತಕ & ದಶಾ
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ, ಪಂಚಾಂಗ ಗಣಿತ, ಗ್ರಹ ಸ್ಥಿತಿ, ನವಾಂಶ, ಹಾಗೂ ಪೂರ್ಣ ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ-ಅಂತರ್ದಶಾ ಕೋಷ್ಟಕ.
                      </p>
                    </div>
                  </label>

                  {/* OPTION 2: PREMIUM PDF V1 */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedBhavishyaV1
                        ? "bg-amber-950/40 border-amber-400 shadow-md shadow-amber-950/30"
                        : "bg-slate-900/60 border-slate-700 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBhavishyaV1}
                      onChange={(e) => setSelectedBhavishyaV1(e.target.checked)}
                      className="h-5 w-5 accent-amber-400 mt-0.5 cursor-pointer rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-base font-black text-amber-200">
                          ೨. ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ ವರದಿ V1 (Premium PDF V1)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 self-start sm:self-auto">
                          ಸಮಗ್ರ ಜೀವಮಾನ ಭವಿಷ್ಯ
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        ೧೨ ಮನೆಗಳ ಸಮಗ್ರ ಫಲ, ಪಂಚಭೂತ ತತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ, ಪ್ರಸ್ತುತ ಯೋಗ-ದೋಷ & ೬ ತಿಂಗಳು-೧ ವರ್ಷದ ಆಳವಾದ ಗೋಚಾರ ಅವಲೋಕನ.
                      </p>
                    </div>
                  </label>

                  {/* OPTION 3: REMEDY */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedRemedy
                        ? "bg-amber-950/40 border-amber-400 shadow-md shadow-amber-950/30"
                        : "bg-slate-900/60 border-slate-700 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRemedy}
                      onChange={(e) => setSelectedRemedy(e.target.checked)}
                      className="h-5 w-5 accent-amber-400 mt-0.5 cursor-pointer rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-base font-black text-amber-200">
                          ೩. ದೈವಿಕ ಪರಿಹಾರ ವರದಿ (Remedy PDF)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 self-start sm:self-auto">
                          ೧೪೦ ವರ್ಷಗಳ ಪರಂಪರೆಯ ಪರಿಹಾರ
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        ಜನ್ಮ ಕುಂಡಲಿಯ ದೋಷಗಳಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ, ಇಷ್ಟದೈವ ಆರಾಧನೆ, ಮಂತ್ರ ಜಪ, ರಕ್ಷಾ ಕವಚ & ಶ್ರೀಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಅರ್ಚಕರ ಮಾರ್ಗದರ್ಶನ.
                      </p>
                    </div>
                  </label>
                </div>

                {/* PACKAGING PROGRESS BAR */}
                {isPackagingZip && (
                  <div className="my-5 p-4 bg-slate-950/90 border border-amber-500/50 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-2">
                        <span className="animate-spin text-sm">⏳</span> {zipProgressStage}
                      </span>
                      <span className="font-mono">{zipProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${zipProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* SUCCESS DOWNLOAD ALERT */}
                {lastDownloadedZip && !isPackagingZip && (
                  <div className="my-5 p-4 bg-emerald-950/60 border-2 border-emerald-500/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-200">
                    <div>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                        ✓ ZIP ಕಡತ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ:
                      </span>
                      <span className="font-mono text-sm font-bold text-white break-all">
                        {lastDownloadedZip}
                      </span>
                      <p className="text-xs text-emerald-300/80 mt-1">
                        ಕಡತವು ನಿಮ್ಮ ಡೌನ್‌ಲೋಡ್ ಫೋಲ್ಡರ್‌ನಲ್ಲಿದೆ. WhatsApp ಮೂಲಕ ಭಕ್ತರಿಗೆ ಸುಲಭವಾಗಿ ಕಳುಹಿಸಿ.
                      </p>
                    </div>
                  </div>
                )}

                {/* THE ONLY PRIMARY ACTION BUTTON & WHATSAPP BUTTON */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadPremiumZip}
                    disabled={isPackagingZip || (!selectedJananaKundli && !selectedBhavishyaV1 && !selectedRemedy)}
                    className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-base py-4 rounded-xl shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {isPackagingZip
                        ? "ಕಡತ ತಯಾರಾಗುತ್ತಿದೆ..."
                        : "📥 ಪ್ರೀಮಿಯಂ ಜಿಪ್ ಡೌನ್‌ಲೋಡ್ (Premium Download ZIP)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendZipWhatsapp}
                    className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📲 WhatsApp ಮೂಲಕ ಕಳುಹಿಸಿ</span>
                  </button>
                </div>

                {/* SUBTLE SECONDARY LINKS FOR INDIVIDUAL PDF DOWNLOAD */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-400">
                    ಪ್ರತ್ಯೇಕ PDF ಡೌನ್‌ಲೋಡ್ (Individual PDF):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadJananaKundli}
                      disabled={isDownloadingKundli}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded text-[11px] border border-slate-700 transition cursor-pointer"
                    >
                      {isDownloadingKundli ? "ಡೌನ್‌ಲೋಡ್..." : "ಜನನ ಕುಂಡಲಿ PDF"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadBhavishyaV1}
                      disabled={isDownloadingBhavishyaV1}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded text-[11px] border border-slate-700 transition cursor-pointer"
                    >
                      {isDownloadingBhavishyaV1 ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "ಭವಿಷ್ಯ V1 PDF"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRemedyPdf}
                      disabled={isDownloadingRemedy}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded text-[11px] border border-slate-700 transition cursor-pointer"
                    >
                      {isDownloadingRemedy ? "ಡೌನ್‌ಲೋಡ್..." : "ಪರಿಹಾರ ವರದಿ PDF"}
                    </button>
                  </div>
                </div>
              </div>

              {/* COLLAPSED OPTIONAL TOOLS: 30-DAY CALENDAR & LIVE SESSION */}
              <details className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
                <summary className="cursor-pointer font-bold text-slate-400 hover:text-amber-300 select-none">
                  ⚡ ಹೆಚ್ಚುವರಿ ಪರಿಕರಗಳು: ೩೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ & ಲೈವ್ ಲಿಂಕ್ (ಐಚ್ಛಿಕ / Optional)
                </summary>
                <div className="mt-4 space-y-6 pt-2 border-t border-slate-800">
                  {/* CARD 2: POSTER 2 — 30-DAY PERSONALIZED CALENDAR */}
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-amber-200">೩೦ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ & ಕರ್ಮ ಕ್ಯಾಲೆಂಡರ್</h4>
                      <span className="text-emerald-400 font-bold">₹280</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <a
                        href={calendarGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center rounded-lg"
                      >
                        📅 Google Calendar
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadIcsFile}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-center rounded-lg border border-slate-600 cursor-pointer"
                      >
                        📥 .ICS ಫೈಲ್
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPriestCardPdf}
                        disabled={isDownloadingPriestCard || !calendarQrDataUrl}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-center rounded-lg cursor-pointer"
                      >
                        📄 ಅರ್ಚಕರ QR ಕಾರ್ಡ್ (A4)
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCalendarWhatsapp}
                        className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-center rounded-lg cursor-pointer"
                      >
                        📲 WhatsApp ಗೆ ಕಳುಹಿಸಿ
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: POSTER 3 — 20-MINUTE LIVE SESSION */}
                  <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-black text-amber-200">೨೦ ನಿಮಿಷಗಳ ಲೈವ್ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ</h4>
                      <span className="text-emerald-400 font-bold">₹450</span>
                    </div>
                    {!liveSessionUrl ? (
                      <button
                        type="button"
                        onClick={handleGenerateLiveSession}
                        disabled={isGeneratingLiveLink}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer"
                      >
                        {isGeneratingLiveLink ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "⚡ ಲೈವ್ ಸೆಷನ್ ಲಿಂಕ್ ರಚಿಸಿ"}
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          type="text"
                          readOnly
                          value={liveSessionUrl}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(liveSessionUrl);
                            setCopiedLinkToast(true);
                            setTimeout(() => setCopiedLinkToast(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-amber-300 font-bold rounded-lg cursor-pointer border border-slate-600"
                        >
                          {copiedLinkToast ? "✓ ಕಾಪಿ ಆಯಿತು" : "📋 ಕಾಪಿ"}
                        </button>
                        <a
                          href={liveSessionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-purple-700 text-white font-bold rounded-lg"
                        >
                          🌐 ತೆರೆಯಿರಿ
                        </a>
                        <button
                          type="button"
                          onClick={handleSendLiveSessionWhatsapp}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                        >
                          📲 WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}
      </main>

      {/* OFF-SCREEN HIDDEN TEMPLATES FOR CLEAN PDF GENERATION */}
      <div style={{ position: "fixed", left: "-99999px", top: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
        {/* Authentic Baggona Panchanga Janana Kundali (Page 1) */}
        <div
          id="omkar-traditional-container"
          ref={traditionalExportRef}
          style={{ width: "900px", height: "1273px", minHeight: "1273px", maxHeight: "1273px", backgroundColor: "#ffffff", overflow: "hidden" }}
        >
          <GokarnaKundaliTemplate
            kundli={kundliResult}
            personName={effectiveDevoteeName}
            parentsName=""
            birthDateObj={birthDateObj}
            birthTimeStr={birthTime}
            isDayBirth={isDayBirthComputed}
            panchanga={traditionalData}
            gothra={gotra}
            pdfLanguage={selectedLang}
          />
        </div>

        {/* Authentic Baggona Panchanga Dasha Kundali (Page 2) */}
        <div ref={dashaExportRef} style={{ width: "900px", background: "#ffffff" }}>
          {kundliSession && (
            <DashaPdfTemplate
              session={kundliSession as any}
              maxAge={120}
              pdfLanguage={selectedLang}
            />
          )}
        </div>

        {/* Legacy Omkar Kundli Fallback */}
        <div id="omkar-kundli-container" style={{ width: "794px", minHeight: "1123px", background: "#ffffff" }}>
          <JananaKundaliPrintTemplate
            id="omkar-janana-kundali-template"
            kundli={kundliResult}
            devoteeName={effectiveDevoteeName}
            gender={gender}
            birthDate={birthDate}
            birthTime={birthTime}
            placeLabel={resolvedPlaceName}
            gotra={gotra}
            lang={selectedLang}
          />
        </div>

        {/* Remedy Container */}
        <div id="omkar-remedy-container" style={{ width: "794px", minHeight: "1123px", background: "#ffffff" }}>
          <KundliRemedyPdfTemplate
            diagnosis={remedyDiagnosis}
            lang={selectedLang}
            overridePriestName={PRIEST_DEFAULT_NAME}
            overridePriestPhone={PRIEST_DEFAULT_PHONE}
          />
        </div>

        {/* Bhavishya V1 PDF Ref Container */}
        <div ref={bhavishyaV1Ref} style={{ width: "794px", background: "#ffffff" }}>
          {bhavishyaV1Payload && (
            <PdfTemplate
              theme="sunrise"
              session={{
                result: kundliResult,
                input: {
                  name: effectiveDevoteeName,
                  birthDate,
                  birthTime,
                  latitude,
                  longitude,
                  gender: gender === "female" ? "Female" : "Male",
                  maritalStatus: "married"
                },
                birthDateYmd: birthDate,
                birthTimeHm: birthTime,
                homePlaceName: resolvedPlaceName,
                placeLabel: resolvedPlaceName,
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
        </div>

        {/* 1-Page A4 Priest QR Card Template */}
        {calendarQrDataUrl && (
          <div style={{ width: "794px", height: "1123px", background: "#FFFDF7" }}>
            <PriestQrCard1PageTemplate
              personName={effectiveDevoteeName}
              rashiName={kundliResult.moonSign?.sanskrit ? `${kundliResult.moonSign.sanskrit} (${kundliResult.moonSign.english})` : "ವೃಶ್ಚಿಕ (Scorpio)"}
              nakshatraName={kundliResult.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra?.sanskrit ? `${kundliResult.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra.sanskrit} (${kundliResult.planets.find((p) => p.name === PlanetName.Moon)?.nakshatra.english})` : "ಅನುರಾಧ (Anuradha)"}
              gotra={gotra || "ಶ್ರೀವತ್ಸ (Shrivatsa)"}
              priestName={PRIEST_DEFAULT_NAME}
              priestPhone={PRIEST_DEFAULT_PHONE}
              priestTitle="ವೇದಮೂರ್ತಿ"
              durationDays={30}
              qrDataUrl={calendarQrDataUrl}
              lang={selectedLang}
            />
          </div>
        )}
      </div>
    </div>
  );
}
