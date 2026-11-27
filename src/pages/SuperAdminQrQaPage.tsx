import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { useAuthStore, isStrictSuperAdmin } from "../features/auth/authStore";
import { useAppStore } from "../stores/appStore";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import {
  ANTARANGA_LANGUAGES,
  DEFAULT_HOTEL_FULL_NAME,
  PRIEST_NAME,
  generateAntarangaSatya,
  generateHotelOrderId,
  type AntarangaLang,
  type AntarangaSecretResult
} from "../features/hotelSecret/antarangaService";
import {
  APPROX_TIME_WINDOWS,
  buildBtrWindowCandidates,
  buildChandraSankhyaProfile,
  computeDeepPrashnaHoraryReading,
  generateExpressWalkInAiNarrative,
  getPrashnaDomainOptions,
  resolveBtrSelection,
  type ApproxTimeWindowId,
  type ChandraSankhyaProfile,
  type DeepPrashnaHoraryResult,
  type HotelBirthTimePrecision,
  type PrashnaQuestionDomain
} from "../features/hotelSecret/hotelUnknownTimeEngine";
import { executePalmReading, type PalmReadingResult } from "../features/palmreading/palmReadingEngine";
import { executeFaceReading, type FaceReadingResult } from "../features/facereading/faceReadingEngine";
import {
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload
} from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { captureFiveYearPredictionPdf } from "../features/fiveYearPrediction/fiveYearPredictionService";
import { FiveYearPredictionPdfTemplate } from "../components/fiveYearPrediction/FiveYearPredictionPdfTemplate";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";
import {
  prepareSampoornaMaster25Data,
  captureSampoornaMaster25Pdf,
  normalizeSevenLang,
  type SampoornaMaster25Payload,
  type SevenLang
} from "../services/sampoornaMaster25Service";
import { SampoornaMaster25PdfTemplate } from "../components/sampoornaMaster25/SampoornaMaster25PdfTemplate";
import { PublicKundliPdfDocument } from "../components/kundli/PublicKundliPdfDocument";
import {
  calculatePublicKundliProfile,
  generateDynamicLifeInsights,
  type DynamicLifeAnalysisOutput,
  type PublicKundliProfile
} from "../features/publicKundli/publicKundliEngine";
import type { PublicKundliLang } from "../features/publicKundli/publicKundliLocale";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { generateKundliRemedyReport, type KundliRemedyDiagnosis } from "../features/remedies/kundliRemedyEngine";
import {
  HotelExpressWalkInPdfTemplate,
  captureHotelExpressWalkInPdf,
  type HotelExpressWalkInPayload
} from "../components/hotelSecret/HotelExpressWalkInPdfTemplate";
import {
  HotelPrashnaPdfTemplate,
  captureHotelPrashnaPdf,
  type HotelPrashnaPdfPayload
} from "../components/hotelSecret/HotelPrashnaPdfTemplate";
import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";
import { FaceReadingPdfTemplate } from "../components/facereading/FaceReadingPdfTemplate";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import {
  approveHotelOrderByCashier,
  subscribeRecentHotelOrders,
  type HotelTableOrderDoc
} from "../db/firestoreDb";
import { notifyPremiumPdfDownloaded } from "../features/notifications/notificationService";
import { toNativeDigits7L } from "../services/sampoornaMaster25Locale7L";
import type { HotelServiceMode } from "./AntarangadaSatyaPage";

function buildSyntheticQaTestImage(label: string): string {
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(0, 0, 360, 360);
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 4;
        ctx.strokeRect(12, 12, 336, 336);
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, 180, 170);
        ctx.font = "14px sans-serif";
        ctx.fillText("Super Admin QA Sample Image", 180, 200);
        return canvas.toDataURL("image/png");
      }
    } catch {
      // Fallback below
    }
  }
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}

export default function SuperAdminQrQaPage(): JSX.Element {
  const currentUser = useAuthStore((s) => s.currentUser);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const setAppPage = useAppStore((s) => s.setPage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);

  // STRICT SUPER ADMIN ONLY GATE (rejects baggona priest, omkar desk, and anonymous guests!)
  const isAllowedStrictSuperAdmin = isAuthenticated && isStrictSuperAdmin(role, currentUser);

  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // QR Scan Redirect Tester State
  const [qrTableNumber, setQrTableNumber] = useState("1");
  const [qrHotelName, setQrHotelName] = useState("Pandit Palette, Gokarna");
  const [qrLang, setQrLang] = useState<AntarangaLang | "">("");
  const [qrServiceMode, setQrServiceMode] = useState<HotelServiceMode | "">("");
  const [qrHostMode, setQrHostMode] = useState<"current_origin" | "production">("current_origin");
  const [qrPreviewDataUrl, setQrPreviewDataUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // End-to-End QA Report Sandbox State
  const [qaLang, setQaLang] = useState<AntarangaLang>("kn");
  const [qaMode, setQaMode] = useState<HotelServiceMode>("kundli");
  const [qaTimePrecision, setQaTimePrecision] = useState<HotelBirthTimePrecision>("exact");
  const [qaWindowId, setQaWindowId] = useState<ApproxTimeWindowId>("morning_7_11");
  const [qaDevoteeName, setQaDevoteeName] = useState("ShriRama QA Test");
  const [qaDob, setQaDob] = useState("1993-03-16");
  const [qaTob, setQaTob] = useState("08:30");
  const [qaGender, setQaGender] = useState<"male" | "female">("male");
  const [qaPlaceName, setQaPlaceName] = useState("Gokarna");
  const [qaLat, setQaLat] = useState(14.5479);
  const [qaLng, setQaLng] = useState(74.3188);
  const [qaPrashnaDomain, setQaPrashnaDomain] = useState<PrashnaQuestionDomain>("career_wealth");
  const [qaHorarySeed, setQaHorarySeed] = useState(27);
  const [qaHandSide, setQaHandSide] = useState<"right" | "left">("right");
  const [qaPalmPhoto, setQaPalmPhoto] = useState<string | null>(null);
  const [qaFacePhoto, setQaFacePhoto] = useState<string | null>(null);

  const [isComputingQa, setIsComputingQa] = useState(false);
  const [isDownloadingKey, setIsDownloadingKey] = useState<string | null>(null);
  const [qaAuditMessage, setQaAuditMessage] = useState<string | null>(null);

  const [qaKundli, setQaKundli] = useState<KundliOutput | null>(null);
  const [qaSecret, setQaSecret] = useState<AntarangaSecretResult | null>(null);
  const [qaFiveYear, setQaFiveYear] = useState<FiveYearPredictionPayload | null>(null);
  const [qaMaster25, setQaMaster25] = useState<SampoornaMaster25Payload | null>(null);
  const [qaPublicProfile, setQaPublicProfile] = useState<PublicKundliProfile | null>(null);
  const [qaPublicInsights, setQaPublicInsights] = useState<DynamicLifeAnalysisOutput | null>(null);
  const [qaRemedyDiag, setQaRemedyDiag] = useState<KundliRemedyDiagnosis | null>(null);
  const [qaExpressPayload, setQaExpressPayload] = useState<HotelExpressWalkInPayload | null>(null);
  const [qaPalmResult, setQaPalmResult] = useState<PalmReadingResult | null>(null);
  const [qaFaceResult, setQaFaceResult] = useState<FaceReadingResult | null>(null);
  const [qaPrashnaResult, setQaPrashnaResult] = useState<DeepPrashnaHoraryResult | null>(null);
  const [qaPrashnaPayload, setQaPrashnaPayload] = useState<HotelPrashnaPdfPayload | null>(null);
  const [qaSankhya, setQaSankhya] = useState<ChandraSankhyaProfile | null>(null);

  // Live Counter Cash & UPI UTR Order Approval Queue
  const [orders, setOrders] = useState<HotelTableOrderDoc[]>([]);
  const [orderFilter, setOrderFilter] = useState<"pending" | "all" | "verified">("pending");
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [webhookStatusInfo, setWebhookStatusInfo] = useState<any>(null);

  const master25Ref = useRef<HTMLDivElement>(null);
  const fiveYearRef = useRef<HTMLDivElement>(null);
  const expressRef = useRef<HTMLDivElement>(null);
  const prashnaRef = useRef<HTMLDivElement>(null);

  const qaSevenLang: SevenLang = normalizeSevenLang(qaLang);
  const qaPublicLang = (qaLang === "mr" ? "hi" : qaLang === "ml" ? "en" : qaLang) as PublicKundliLang;

  const generatedTargetUrl = useMemo(() => {
    const base =
      qrHostMode === "production" || typeof window === "undefined"
        ? "https://baggonapanchanga.com/antaranga"
        : `${window.location.origin}/antaranga`;
    const qs = new URLSearchParams();
    qs.set("table", qrTableNumber.trim() || "1");
    qs.set("hotel", qrHotelName.trim() || "Pandit Palette");
    if (qrLang) qs.set("lang", qrLang);
    if (qrServiceMode) qs.set("mode", qrServiceMode);
    return `${base}?${qs.toString()}`;
  }, [qrHostMode, qrTableNumber, qrHotelName, qrLang, qrServiceMode]);

  useEffect(() => {
    if (!isAllowedStrictSuperAdmin) return;
    QRCode.toDataURL(generatedTargetUrl, { width: 260, margin: 1 })
      .then((u) => setQrPreviewDataUrl(u))
      .catch(() => {});
  }, [generatedTargetUrl, isAllowedStrictSuperAdmin]);

  useEffect(() => {
    if (!isAllowedStrictSuperAdmin) return;
    const unsub = subscribeRecentHotelOrders((list) => {
      setOrders(list);
    }, 50);
    fetch("/api/payment-webhook")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setWebhookStatusInfo(d);
      })
      .catch(() => {});
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [isAllowedStrictSuperAdmin]);

  const handleStrictLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.trim() || !adminPass.trim()) {
      setAuthError("Super Admin username & password required.");
      return;
    }
    if (!isStrictSuperAdmin("priest", adminUser.trim()) && adminUser.trim().toLowerCase() !== "shrisuma" && adminUser.trim() !== "$hriSuma" && adminUser.trim().toLowerCase() !== "superadmin") {
      setAuthError("Access denied: Strictly restricted to Super Admin accounts (ShriSuma / superadmin) only.");
      return;
    }
    setLoggingIn(true);
    setAuthError(null);
    try {
      const res = await login(adminUser.trim(), adminPass.trim());
      if (!res.success) setAuthError(res.error || "Authentication failed.");
    } catch (err: any) {
      setAuthError(err?.message || "Login error");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isAllowedStrictSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EC] to-[#FFF3DE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-red-400 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-black border border-red-300">
            <span>🛡️</span>
            <span>STRICT SUPER ADMIN ONLY — ACCESS LOCKED</span>
          </div>
          <h1 className="text-xl font-black text-amber-950 font-serif">
            Super Admin QR QA & Report Testing Portal
          </h1>
          <p className="text-xs text-stone-700 leading-relaxed">
            This QA workbench allows downloading and verifying every client-facing QR report before production release and confirming table Cash / UPI orders. Only verified <strong>Super Admin</strong> accounts are authorized (Priest & Desk logins are blocked).
          </p>

          {isAuthenticated && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-bold">
              Current signed-in user ({currentUser} / {role}) does not have Super Admin clearance.
            </div>
          )}

          <form onSubmit={handleStrictLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Super Admin Username</label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="ShriSuma"
                className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Super Admin Password</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border-2 border-amber-300 rounded-xl text-sm"
              />
            </div>
            {authError && <div className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg">{authError}</div>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow cursor-pointer"
            >
              {loggingIn ? "Verifying Super Admin..." : "Unlock Super Admin QA Studio"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setAppPage("home")}
            className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
          >
            &larr; Return to Portal
          </button>
        </div>
      </div>
    );
  }

  const handleComputeAllQaReports = async () => {
    setIsComputingQa(true);
    setQaAuditMessage(null);
    try {
      const effDate = qaTimePrecision === "no_dob_instant" ? new Date().toISOString().split("T")[0] : qaDob;
      const genderLabel: "Male" | "Female" = qaGender === "female" ? "Female" : "Male";
      let effTime = qaTob || "10:30";
      if (qaTimePrecision === "approx_window") {
        const btr = buildBtrWindowCandidates(effDate, qaWindowId, qaLat, qaLng, qaSevenLang, undefined, genderLabel);
        const chosen = resolveBtrSelection(btr, "A", "A");
        effTime = chosen.selected.sampleTime;
      } else if (qaTimePrecision === "date_only_chandra" || qaTimePrecision === "no_dob_instant") {
        effTime = "12:00";
      }

      const input: KundliInput = {
        name: qaDevoteeName.trim() || "QA Devotee",
        birthDate: effDate,
        birthTime: effTime,
        latitude: qaLat,
        longitude: qaLng,
        gender: genderLabel
      };
      const kundli = calculateKundli(input);
      setQaKundli(kundli);

      const sankhya = buildChandraSankhyaProfile(input.name, effDate, kundli, qaSevenLang);
      setQaSankhya(sankhya);

      const prashna = computeDeepPrashnaHoraryReading({
        devoteeName: input.name,
        questionDomain: qaPrashnaDomain,
        horaryNumber: qaHorarySeed,
        latitude: qaLat,
        longitude: qaLng,
        lang: qaSevenLang
      });
      setQaPrashnaResult(prashna);

      const activePalmImg = qaPalmPhoto || buildSyntheticQaTestImage(`PALM (${qaHandSide.toUpperCase()})`);
      const activeFaceImg = qaFacePhoto || buildSyntheticQaTestImage("MUKHA FACE QA");
      setQaPalmPhoto(activePalmImg);
      setQaFacePhoto(activeFaceImg);

      const palmRes = await executePalmReading(
        activePalmImg,
        qaHandSide,
        input.name,
        qaLang,
        geminiApiKey || "",
        undefined,
        undefined,
        undefined,
        genderLabel
      );
      setQaPalmResult(palmRes);

      const faceRes = await executeFaceReading(activeFaceImg, input.name, qaLang, geminiApiKey || "");
      setQaFaceResult(faceRes);

      const expressParas = await generateExpressWalkInAiNarrative({
        devoteeName: input.name,
        lang: qaSevenLang,
        prashna,
        sankhya,
        palmSummary: palmRes.chironomyHandType?.element?.[qaLang] || "",
        faceSummary: faceRes.facialConstitution?.mahapurushaArchetype?.[qaLang] || "",
        apiKey: geminiApiKey || ""
      });

      const expressData: HotelExpressWalkInPayload = {
        devoteeName: input.name,
        lang: qaSevenLang,
        tableNumber: qrTableNumber || "1",
        hotelName: qrHotelName || DEFAULT_HOTEL_FULL_NAME,
        generatedDateStr: new Date().toISOString().split("T")[0],
        prashna,
        sankhya,
        palmReading: palmRes,
        faceReading: faceRes,
        aiParagraphs: expressParas
      };
      setQaExpressPayload(expressData);
      setQaPrashnaPayload({
        ...expressData,
        placeName: qaPlaceName
      });

      const secret = generateAntarangaSatya(
        kundli,
        qaLang,
        input.name,
        qaGender,
        effDate,
        effTime,
        qaLat,
        qaLng,
        qaTimePrecision !== "exact"
      );
      setQaSecret(secret);

      const fiveYear = compute5YearMasterPrediction(
        kundli,
        effDate,
        effTime,
        (qaLang === "ml" ? "en" : qaLang) as SixLang,
        input.name,
        new Date().getFullYear(),
        { gender: input.gender, latitude: qaLat, longitude: qaLng, ayanamsa: "lahiri" }
      );
      setQaFiveYear(fiveYear);

      const profile = calculatePublicKundliProfile(kundli, effDate, effTime, qaLat, qaLng);
      setQaPublicProfile(profile);
      setQaPublicInsights(generateDynamicLifeInsights(profile, qaPublicLang));
      setQaRemedyDiag(generateKundliRemedyReport(kundli, input));

      const m25 = await prepareSampoornaMaster25Data(
        { kundli, placeLabel: qaPlaceName, input },
        qaSevenLang,
        { narrativeVariant: 0, enableAi: false, timePrecision: qaTimePrecision }
      );
      setQaMaster25(m25);

      setQaAuditMessage(`✅ All 7-language QA payloads (${qaLang.toUpperCase()}) & previews generated successfully! Click any PDF button below to inspect output.`);
    } catch (err: any) {
      setQaAuditMessage(`❌ QA compute error: ${err?.message || "Unknown error"}`);
    } finally {
      setIsComputingQa(false);
    }
  };

  const handleQaDownloadReport = async (
    kind: "master25" | "fiveYear" | "kundli" | "remedy" | "express" | "palm" | "face" | "prashna"
  ) => {
    setIsDownloadingKey(kind);
    const clean = (qaDevoteeName || "QA_Test").replace(/\s+/g, "_");
    const langTag = qaLang.toUpperCase();
    try {
      let pages = 1;
      let label = "";
      if (kind === "master25") {
        if (!master25Ref.current || !qaMaster25) throw new Error("Compute QA previews first.");
        const pdf = await captureSampoornaMaster25Pdf(
          master25Ref.current,
          `QA_Sampoorna_25Ch_${langTag}_${clean}.pdf`,
          true,
          { lang: qaSevenLang, payload: qaMaster25 }
        );
        pages = pdf.getNumberOfPages();
        label = "Sampoorna 25-Chapter Master PDF";
      } else if (kind === "fiveYear") {
        if (!fiveYearRef.current || !qaFiveYear) throw new Error("Compute QA previews first.");
        const pdf = await captureFiveYearPredictionPdf(
          fiveYearRef.current,
          `QA_FiveYear_Destiny_${langTag}_${clean}.pdf`,
          true
        );
        pages = pdf.getNumberOfPages();
        label = "5-Year Destiny Report PDF";
      } else if (kind === "kundli") {
        const pdf = await generatePDFFromElement("qa-kundli-pdf-render", `QA_Janma_Kundali_${langTag}_${clean}.pdf`, true, {
          skipAutoNotify: true
        });
        pages = pdf.getNumberOfPages();
        label = "Baggona Janma Kundali PDF";
      } else if (kind === "remedy") {
        const pdf = await generatePDFFromElement("qa-remedy-pdf-render", `QA_Gokarna_Remedy_${langTag}_${clean}.pdf`, true, {
          skipAutoNotify: true
        });
        pages = pdf.getNumberOfPages();
        label = "Sacred Gokarna Remedy Dossier PDF";
      } else if (kind === "express") {
        if (!expressRef.current || !qaExpressPayload) throw new Error("Compute QA previews first.");
        const pdf = await captureHotelExpressWalkInPdf(expressRef.current, `QA_Express_149_${langTag}_${clean}.pdf`, true);
        pages = pdf.getNumberOfPages();
        label = "Express Walk-In ₹149 PDF";
      } else if (kind === "palm") {
        const pdf = await generatePDFFromElement("qa-palm-pdf-render", `QA_Hasta_Palm_${langTag}_${clean}.pdf`, true, {
          skipAutoNotify: true
        });
        pages = pdf.getNumberOfPages();
        label = "Hasta Samudrika Palm PDF";
      } else if (kind === "face") {
        const pdf = await generatePDFFromElement("qa-face-pdf-render", `QA_Mukha_Face_${langTag}_${clean}.pdf`, true, {
          skipAutoNotify: true
        });
        pages = pdf.getNumberOfPages();
        label = "Mukha Samudrika Face PDF";
      } else if (kind === "prashna") {
        if (!prashnaRef.current || !qaPrashnaPayload) throw new Error("Compute QA previews first.");
        const pdf = await captureHotelPrashnaPdf(prashnaRef.current, `QA_Prashna_Shastra_${langTag}_${clean}.pdf`, true);
        pages = pdf.getNumberOfPages();
        label = "Prashna Shastra Complete PDF";
      }

      void notifyPremiumPdfDownloaded({
        clientName: `${qaDevoteeName} [SUPERADMIN QA TEST by ${currentUser}]`,
        pdfType: `[SUPERADMIN QA TEST] ${label}`,
        language: qaLang,
        pageCount: pages,
        priestName: PRIEST_NAME,
        amountInr: 0,
        packageType: "superadmin_qa_test",
        paymentMethod: "Super Admin Pre-Release QA Mode",
        paymentUtr: `QA_${generateHotelOrderId(qrTableNumber || "1")}`
      });

      setQaAuditMessage(`✅ Downloaded "${label}" (${pages} pages, ${langTag}) & sent QA confirmation email to spshreepandit@gmail.com.`);
    } catch (err: any) {
      alert(`QA PDF Error: ${err?.message || "Please click Compute QA Previews first."}`);
    } finally {
      setIsDownloadingKey(null);
    }
  };

  const handleCashierApproveOrder = async (
    order: HotelTableOrderDoc,
    source: "CASH_AT_COUNTER" | "CASHIER_DESK"
  ) => {
    setApprovingOrderId(order.orderId);
    try {
      const receipt = order.claimedUtr || `${source === "CASH_AT_COUNTER" ? "CASH" : "UPI"}_${Date.now()}`;
      await approveHotelOrderByCashier({
        orderId: order.orderId,
        approvedBy: currentUser || "SuperAdmin",
        verificationSource: source,
        utrOrReceipt: receipt,
        amountInr: order.amountInr
      });
      void fetch("/api/cashier-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          amountInr: order.amountInr,
          packageType: order.packageType,
          paymentMode: source,
          utrOrReceipt: receipt,
          approvedBy: currentUser || "SuperAdmin",
          devoteeName: order.devoteeName
        })
      }).catch(() => {});
    } finally {
      setApprovingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "pending") {
      return o.status === "PENDING_CASHIER" || o.status === "PENDING_UTR_REVIEW" || o.status === "INITIATED";
    }
    if (orderFilter === "verified") return o.status === "VERIFIED" || o.status === "PAID";
    return true;
  });

  return (
    <div className="space-y-6 p-2 sm:p-4 text-stone-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-100 rounded-2xl p-4 sm:p-5 border-2 border-[#D4AF37] shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-amber-300">
            🔐 STRICT SUPER ADMIN ONLY ({currentUser})
          </div>
          <h2 className="text-lg sm:text-xl font-black font-serif text-white">
            Client QR Redirect QA, Pre-Release Report Tester & Cash Counter Desk
          </h2>
          <p className="text-xs text-amber-200/90 mt-0.5">
            Scan-test QR redirects, test all 7 languages & 4 options, inspect every downloadable PDF before clients see it, and approve live Table Cash / UPI orders.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold">
            Zero Client Bypass Active
          </span>
        </div>
      </div>

      {/* SECTION 1: QR SCAN REDIRECT & DEEP-LINK TESTER */}
      <section className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
        <h3 className="text-base font-black text-amber-950 font-serif flex items-center gap-2">
          <span>📲</span>
          <span>1. Client-Facing QR Code Redirect & URL Parameters Inspector</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Table Number</label>
              <input
                type="text"
                value={qrTableNumber}
                onChange={(e) => setQrTableNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Hotel / Restaurant Name</label>
              <input
                type="text"
                value={qrHotelName}
                onChange={(e) => setQrHotelName(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Preset Language (QR Landing)</label>
              <select
                value={qrLang}
                onChange={(e) => setQrLang(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              >
                <option value="">Show 7-Language Picker First (Default)</option>
                {ANTARANGA_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.englishName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Preset Service Option</label>
              <select
                value={qrServiceMode}
                onChange={(e) => setQrServiceMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              >
                <option value="">Default 4-Option Hub</option>
                <option value="kundli">Janma Kundali (25-Ch / 5-Yr / Remedy)</option>
                <option value="hasta_samudrika">Hasta Samudrika (Palm Reading)</option>
                <option value="mukha_samudrika">Mukha Samudrika (Face Reading)</option>
                <option value="prashna_shastra">Prashna Shastra (1–108 Horary)</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setQrHostMode(qrHostMode === "current_origin" ? "production" : "current_origin")}
                className="px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-400 text-amber-950 font-bold cursor-pointer"
              >
                Host: {qrHostMode === "production" ? "Production (baggonapanchanga.com)" : "Current Server Origin"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedTargetUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 1800);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-900 text-amber-300 font-bold cursor-pointer"
              >
                {copiedUrl ? "✓ Copied QR Link" : "📋 Copy Client QR URL"}
              </button>
              <a
                href={generatedTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow"
              >
                🚀 Open Live Client QR URL &rarr;
              </a>
            </div>
            <div className="sm:col-span-2 bg-white border border-amber-200 rounded-xl p-2 font-mono text-[11px] break-all text-stone-700">
              {generatedTargetUrl}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white border-2 border-amber-300 rounded-2xl p-3">
            {qrPreviewDataUrl ? (
              <img src={qrPreviewDataUrl} alt="QA Client QR" className="w-40 h-40 object-contain" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-stone-400">Generating QR...</div>
            )}
            <span className="text-[10px] font-bold text-amber-900 mt-1">Scan with phone to test client redirect</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: END-TO-END SUPER ADMIN QA REPORT TESTER & PDF DOWNLOADER */}
      <section className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-amber-950 font-serif flex items-center gap-2">
            <span>🧪</span>
            <span>2. Super Admin Pre-Release Report QA & PDF Inspector (All 7 Languages · All 4 Options)</span>
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-950">
            Super Admin Free QA Bypass (Blocked for Clients)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Language (7 Languages)</label>
            <select
              value={qaLang}
              onChange={(e) => setQaLang(e.target.value as AntarangaLang)}
              className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
            >
              {ANTARANGA_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.englishName})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Service Option</label>
            <select
              value={qaMode}
              onChange={(e) => setQaMode(e.target.value as HotelServiceMode)}
              className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
            >
              <option value="kundli">📜 Janma Kundali + 25-Ch / 5-Yr / Remedy</option>
              <option value="hasta_samudrika">✋ Hasta Samudrika (Palm Reading)</option>
              <option value="mukha_samudrika">👤 Mukha Samudrika (Face Reading)</option>
              <option value="prashna_shastra">🔮 Prashna Shastra (1–108 Horary)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Birth Time Mode</label>
            <select
              value={qaTimePrecision}
              onChange={(e) => setQaTimePrecision(e.target.value as HotelBirthTimePrecision)}
              className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
            >
              <option value="exact">Exact Birth Time</option>
              <option value="approx_window">Approximate Window (BTR)</option>
              <option value="date_only_chandra">Date-Only (Chandra Kundali)</option>
              <option value="no_dob_instant">No DOB / No Time (Instant Prashna)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Test Devotee Name</label>
            <input
              type="text"
              value={qaDevoteeName}
              onChange={(e) => setQaDevoteeName(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Birth Date & Time</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={qaDob}
                onChange={(e) => setQaDob(e.target.value)}
                className="flex-1 px-2 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              />
              <input
                type="time"
                value={qaTob}
                onChange={(e) => setQaTob(e.target.value)}
                className="w-28 px-2 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-stone-700 mb-1">Prashna Domain & Seed (1–108)</label>
            <div className="flex gap-1.5">
              <select
                value={qaPrashnaDomain}
                onChange={(e) => setQaPrashnaDomain(e.target.value as PrashnaQuestionDomain)}
                className="flex-1 px-2 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold"
              >
                {getPrashnaDomainOptions(qaSevenLang).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={108}
                value={qaHorarySeed}
                onChange={(e) => setQaHorarySeed(Math.max(1, Math.min(108, Number(e.target.value) || 1)))}
                className="w-16 px-2 py-2 bg-white border-2 border-amber-300 rounded-xl text-center font-black"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => void handleComputeAllQaReports()}
            disabled={isComputingQa}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-black shadow-lg cursor-pointer"
          >
            {isComputingQa ? "Computing All QA Reports..." : "⚡ Compute All Previews & Prepare Every PDF"}
          </button>
          <label className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-bold cursor-pointer">
            ✋ Upload Palm Test Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => typeof r.result === "string" && setQaPalmPhoto(r.result);
                r.readAsDataURL(f);
              }}
            />
          </label>
          <label className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-bold cursor-pointer">
            👤 Upload Face Test Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => typeof r.result === "string" && setQaFacePhoto(r.result);
                r.readAsDataURL(f);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setQaHandSide((s) => (s === "right" ? "left" : "right"))}
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 font-bold cursor-pointer"
          >
            Palm Side: {qaHandSide.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setQaGender((g) => (g === "male" ? "female" : "male"))}
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 font-bold cursor-pointer"
          >
            Gender: {qaGender.toUpperCase()}
          </button>
        </div>

        {qaAuditMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-950 text-xs font-bold">
            {qaAuditMessage}
          </div>
        )}

        {/* Live Preview Summary + One-Click Download Grid for All 8 Report PDFs */}
        {qaSecret && (
          <div className="space-y-3 border-t border-amber-200 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="font-black text-amber-950">📜 Kundli Preview ({qaLang.toUpperCase()})</div>
                <div>Moon: {qaSecret.moonSignName} • Star: {qaSecret.nakshatraName} ({qaSecret.moonPada}) • Lagna: {qaSecret.lagnaSignName}</div>
                <p className="text-stone-700 line-clamp-3">{qaSecret.paragraph1}</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="font-black text-amber-950">✋ / 👤 / 🔮 Standalone Options Preview</div>
                {qaPalmResult && (
                  <div>✋ Palm ({toNativeDigits7L(qaPalmResult.overallScore, qaSevenLang)}%): {qaPalmResult.verdictTitle?.[qaLang] || qaPalmResult.verdictTitle?.en}</div>
                )}
                {qaFaceResult && (
                  <div>👤 Face ({toNativeDigits7L(qaFaceResult.overallTejasScore, qaSevenLang)}%): {qaFaceResult.facialConstitution?.mahapurushaArchetype?.[qaLang] || qaFaceResult.facialConstitution?.mahapurushaArchetype?.en}</div>
                )}
                {qaPrashnaResult && (
                  <div>🔮 Prashna ({toNativeDigits7L(qaPrashnaResult.ithasalaHarmonyScore, qaSevenLang)}%): {qaPrashnaResult.verdictTitle}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {([
                { key: "master25", label: "📥 25-Ch Sampoorna PDF" },
                { key: "fiveYear", label: "📥 5-Year Destiny PDF" },
                { key: "kundli", label: "📥 Janma Kundali PDF" },
                { key: "remedy", label: "📥 Gokarna Remedy PDF" },
                { key: "express", label: "📥 Express ₹149 PDF" },
                { key: "palm", label: "📥 Hasta Palm PDF" },
                { key: "face", label: "📥 Mukha Face PDF" },
                { key: "prashna", label: "📥 Prashna Shastra PDF" }
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={Boolean(isDownloadingKey)}
                  onClick={() => void handleQaDownloadReport(item.key)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingKey === item.key ? "Rendering..." : item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: LIVE COUNTER CASH & UPI ORDER APPROVAL DESK */}
      <section className="bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-amber-950 font-serif flex items-center gap-2">
              <span>💵</span>
              <span>3. Live Table Cash & UPI Order Approval Desk (Real-Time Client Unlock)</span>
            </h3>
            <p className="text-xs text-stone-600">
              End clients cannot self-unlock via fake UTR or Cash button. When money is verified here (Cash in hand or UPI Soundbox), clicking Approve immediately unlocks the guest&apos;s phone live.
            </p>
          </div>
          <div className="flex gap-1.5 text-xs">
            {(["pending", "verified", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setOrderFilter(f)}
                className={`px-3 py-1 rounded-lg font-bold capitalize cursor-pointer ${
                  orderFilter === f ? "bg-amber-500 text-stone-950" : "bg-white border border-amber-300 text-stone-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Gateway Webhook Readiness Bar */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-black text-amber-950">Payment Gateway Webhook Status:</span>{" "}
            <span>
              Razorpay: <strong>{webhookStatusInfo?.gatewayCapabilities?.razorpayConfigured ? "Configured (Auto)" : "Keys Not Set (Manual Cash Desk Active)"}</strong> ·{" "}
              Cashfree: <strong>{webhookStatusInfo?.gatewayCapabilities?.cashfreeConfigured ? "Configured (Auto)" : "Keys Not Set"}</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
            Signed HMAC-SHA256 Enforced
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-500 bg-white rounded-xl border border-amber-200">
              No {orderFilter} guest orders right now.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPaid = order.status === "VERIFIED" || order.status === "PAID";
              return (
                <div
                  key={order.orderId}
                  className="bg-white border-2 border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-amber-950 flex items-center gap-2">
                      <span>Table {order.tableNumber}</span>
                      <span>• {order.devoteeName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black">
                        ₹{order.amountInr} ({order.packageType})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-900"
                            : order.status === "PENDING_CASHIER"
                              ? "bg-orange-100 text-orange-950"
                              : order.status === "PENDING_UTR_REVIEW"
                                ? "bg-indigo-100 text-indigo-950"
                                : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-mono">
                      Order: {order.orderId}
                      {order.claimedUtr ? ` • Claimed UTR: ${order.claimedUtr}` : ""}
                      {order.verificationSource ? ` • Verified via: ${order.verificationSource}` : ""}
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={approvingOrderId === order.orderId}
                        onClick={() => void handleCashierApproveOrder(order, "CASH_AT_COUNTER")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer"
                      >
                        💵 Confirm Cash ₹{order.amountInr}
                      </button>
                      <button
                        type="button"
                        disabled={approvingOrderId === order.orderId}
                        onClick={() => void handleCashierApproveOrder(order, "CASHIER_DESK")}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black cursor-pointer"
                      >
                        📲 Confirm UPI ₹{order.amountInr}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Hidden QA PDF Render Hosts */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 900,
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
          height: 0
        }}
        aria-hidden="true"
      >
        {qaFiveYear && (
          <div ref={fiveYearRef}>
            <FiveYearPredictionPdfTemplate data={qaFiveYear} />
          </div>
        )}
        {qaMaster25 && (
          <div ref={master25Ref}>
            <SampoornaMaster25PdfTemplate data={qaMaster25} />
          </div>
        )}
        <div id="qa-kundli-pdf-render">
          {qaPublicProfile && qaKundli && (
            <PublicKundliPdfDocument
              profile={qaPublicProfile}
              kundli={qaKundli}
              insights={qaPublicInsights}
              lang={qaPublicLang}
              placeLabel={qaPlaceName}
            />
          )}
        </div>
        <div id="qa-remedy-pdf-render">
          {qaRemedyDiag && (
            <div style={{ width: "900px", background: "#FFFDF7" }}>
              <KundliRemedyPdfTemplate diagnosis={qaRemedyDiag} lang={qaPublicLang} />
            </div>
          )}
        </div>
        {qaExpressPayload && (
          <div ref={expressRef}>
            <HotelExpressWalkInPdfTemplate data={qaExpressPayload} />
          </div>
        )}
        {qaPalmResult && (
          <div style={{ width: "794px", background: "#FFFDF7" }}>
            <PalmReadingPdfTemplate
              result={qaPalmResult}
              personName={qaDevoteeName}
              lang={qaLang}
              containerId="qa-palm-pdf-render"
            />
          </div>
        )}
        {qaFaceResult && (
          <div style={{ width: "794px", background: "#FFFDF7" }}>
            <FaceReadingPdfTemplate
              result={qaFaceResult}
              devoteeName={qaDevoteeName}
              lang={qaLang}
              containerId="qa-face-pdf-render"
            />
          </div>
        )}
        {qaPrashnaPayload && (
          <div ref={prashnaRef}>
            <HotelPrashnaPdfTemplate data={qaPrashnaPayload} />
          </div>
        )}
      </div>
    </div>
  );
}
